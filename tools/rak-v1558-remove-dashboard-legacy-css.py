from pathlib import Path
import re

ROOT = Path('.')
CSS_FILES = [
    ROOT / 'styles-overrides-legacy-early.css',
    ROOT / 'styles-overrides-legacy-mid.css',
    ROOT / 'styles-overrides-legacy-late.css',
]
EARLY = CSS_FILES[0]
DASHBOARD_FIT = ROOT / 'styles-dashboard-fit.css'
DASHBOARD_POLISH = ROOT / 'styles-dashboard-polish.css'
APP_USAGE = ROOT / 'app-usage-smoke-v963.js'
CRITICAL = ROOT / 'tools/critical-runtime-smoke.mjs'
APP = ROOT / 'app.js'
PKG = ROOT / 'package.json'
SW = ROOT / 'sw.js'

TARGETS = [
    '#home .dashboardGrid',
    '#home .dashboardCard',
    '#home .dashboardHeroCard',
    '#dashHero .dashboardHeroLine2',
    '#dashHero .dashboardHeroLine3',
    '#dashHero .dashboardHeroLine3Pill',
    '#home .dashboardIconInline',
    '#home .dashboardIcon.dashboardIconInline',
    '#home .dashboardDot',
    '#dashKantyna .dashboardDot',
    '#dashJidelna .dashboardDot',
]
OWNERS = [
    '#home.page.active .dashboardGrid',
    '#home.page.active .dashboardCard',
    '#home.page.active #dashHero.dashboardHeroCard',
    '#home.page.active #dashHero .dashboardHeroLine2',
    '#home.page.active #dashHero .dashboardHeroLine3',
    '#home.page.active #dashHero .dashboardHeroLine3Pill',
    '#home.page.active .dashboardCard .dashboardIcon.dashboardIconInline',
    '#home.page.active #dashKantyna .dashboardDot',
    '#home.page.active #dashJidelna .dashboardDot',
]
TARGET_SET = set(TARGETS)
GROUP_AT_RULES = ('@media', '@supports', '@container', '@layer', '@scope', '@document')


def normalize_selector(value: str) -> str:
    value = re.sub(r'\s+', ' ', value.strip())
    value = re.sub(r'\s*([>+~])\s*', r' \1 ', value)
    return re.sub(r'\s+', ' ', value).strip()


def split_selector_list(value: str):
    out = []
    start = 0
    paren = bracket = 0
    quote = None
    escaped = False
    for i, ch in enumerate(value):
        if quote:
            if escaped:
                escaped = False
            elif ch == '\\':
                escaped = True
            elif ch == quote:
                quote = None
            continue
        if ch in ('"', "'"):
            quote = ch
        elif ch == '(':
            paren += 1
        elif ch == ')':
            paren = max(0, paren - 1)
        elif ch == '[':
            bracket += 1
        elif ch == ']':
            bracket = max(0, bracket - 1)
        elif ch == ',' and paren == 0 and bracket == 0:
            out.append(value[start:i].strip())
            start = i + 1
    out.append(value[start:].strip())
    return [x for x in out if x]


def find_matching_brace(text: str, open_pos: int) -> int:
    depth = 1
    i = open_pos + 1
    quote = None
    comment = False
    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ''
        if comment:
            if ch == '*' and nxt == '/':
                comment = False
                i += 2
                continue
            i += 1
            continue
        if quote:
            if ch == '\\':
                i += 2
                continue
            if ch == quote:
                quote = None
            i += 1
            continue
        if ch == '/' and nxt == '*':
            comment = True
            i += 2
            continue
        if ch in ('"', "'"):
            quote = ch
            i += 1
            continue
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise RuntimeError('Unclosed CSS block')


def split_leading_prefix(prelude: str):
    i = 0
    while True:
        while i < len(prelude) and prelude[i].isspace():
            i += 1
        if prelude.startswith('/*', i):
            end = prelude.find('*/', i + 2)
            if end < 0:
                break
            i = end + 2
            continue
        break
    return prelude[:i], prelude[i:]


def process_css(text: str, stats: dict) -> str:
    out = []
    pos = 0
    n = len(text)
    while pos < n:
        # Find next top-level block start or standalone at-rule terminator.
        i = pos
        quote = None
        comment = False
        paren = bracket = 0
        block_pos = None
        semi_pos = None
        while i < n:
            ch = text[i]
            nxt = text[i + 1] if i + 1 < n else ''
            if comment:
                if ch == '*' and nxt == '/':
                    comment = False
                    i += 2
                    continue
                i += 1
                continue
            if quote:
                if ch == '\\':
                    i += 2
                    continue
                if ch == quote:
                    quote = None
                i += 1
                continue
            if ch == '/' and nxt == '*':
                comment = True
                i += 2
                continue
            if ch in ('"', "'"):
                quote = ch
            elif ch == '(':
                paren += 1
            elif ch == ')':
                paren = max(0, paren - 1)
            elif ch == '[':
                bracket += 1
            elif ch == ']':
                bracket = max(0, bracket - 1)
            elif paren == 0 and bracket == 0:
                if ch == '{':
                    block_pos = i
                    break
                if ch == ';':
                    semi_pos = i
                    break
            i += 1
        if block_pos is None:
            if semi_pos is not None:
                out.append(text[pos:semi_pos + 1])
                pos = semi_pos + 1
                continue
            out.append(text[pos:])
            break

        close_pos = find_matching_brace(text, block_pos)
        prelude = text[pos:block_pos]
        prefix, head = split_leading_prefix(prelude)
        stripped = head.strip()
        inner = text[block_pos + 1:close_pos]

        if stripped.startswith('@'):
            lower = stripped.lower()
            if lower.startswith(GROUP_AT_RULES):
                cleaned_inner = process_css(inner, stats)
                if re.sub(r'/\*[\s\S]*?\*/', '', cleaned_inner).strip():
                    out.append(prefix + head + '{' + cleaned_inner + '}')
                else:
                    stats['removed_at_rules'] += 1
                    out.append(prefix)
            else:
                out.append(prelude + '{' + inner + '}')
        else:
            selectors = split_selector_list(head)
            kept = []
            removed_here = 0
            for selector in selectors:
                if normalize_selector(selector) in TARGET_SET:
                    removed_here += 1
                else:
                    kept.append(selector)
            if removed_here:
                stats['removed_selectors'] += removed_here
                if kept:
                    stats['trimmed_rules'] += 1
                    separator = ',\n' if '\n' in head else ', '
                    out.append(prefix + separator.join(kept) + '{' + inner + '}')
                else:
                    stats['removed_rules'] += 1
                    out.append(prefix)
            else:
                out.append(prelude + '{' + inner + '}')
        pos = close_pos + 1
    return ''.join(out)


def active_selectors(text: str):
    clean = re.sub(r'/\*[\s\S]*?\*/', '', text)
    selectors = []
    # Good enough for the focused exact-selector guard; group at-rules are ignored as selector text.
    for match in re.finditer(r'([^{}]+)\{', clean):
        head = match.group(1).strip()
        if head.startswith('@'):
            continue
        selectors.extend(normalize_selector(s) for s in split_selector_list(head))
    return selectors


# Verify all later owners exist before deleting anything.
dashboard_css = DASHBOARD_FIT.read_text(encoding='utf-8') + '\n' + DASHBOARD_POLISH.read_text(encoding='utf-8')
for owner in OWNERS:
    if owner not in dashboard_css:
        raise RuntimeError(f'Active Dashboard owner missing before cleanup: {owner}')

summary = {'removed_rules': 0, 'removed_selectors': 0, 'trimmed_rules': 0, 'removed_at_rules': 0}
for path in CSS_FILES:
    original = path.read_text(encoding='utf-8')
    stats = {'removed_rules': 0, 'removed_selectors': 0, 'trimmed_rules': 0, 'removed_at_rules': 0}
    cleaned = process_css(original, stats)
    path.write_text(cleaned, encoding='utf-8')
    for key in summary:
        summary[key] += stats[key]
    print(path.name, stats, 'bytes', len(original), '->', len(cleaned))

if summary['removed_selectors'] < len(TARGETS):
    raise RuntimeError(f'Too few Dashboard selectors removed: {summary}')

# Replace stale legacy-inventory comments with an accurate cleanup marker.
early = EARLY.read_text(encoding='utf-8')
for phrase in [
    'Dashboard legacy override inventory guard',
    'Dashboard proven-overridden legacy candidates',
    'Dashboard extended proven-overridden legacy candidates',
    'Dashboard legacy owner map',
    'Dashboard legacy-only inventory',
    'Dashboard no-new-hotfix lock v1.96',
]:
    early = re.sub(r'/\*[^*]*(?:\*(?!/)[^*]*)*' + re.escape(phrase) + r'[\s\S]*?\*/\s*', '', early, count=1, flags=re.I)
marker = """/* RaK v1.5.58 – Dashboard legacy cleanup.
   11 přesných, prokazatelně přepsaných Dashboard selectorů bylo odstraněno z legacy override vrstev.
   Aktivní vlastníci zůstávají výhradně ve styles-dashboard-fit.css / styles-dashboard-polish.css.
   Tyto legacy selectory se sem nesmí vracet; nové Dashboard úpravy patří do aktivních Dashboard vrstev. */
"""
early = marker + early.lstrip()
EARLY.write_text(early, encoding='utf-8')

# Focused active-selector verification after cleanup.
combined = '\n'.join(p.read_text(encoding='utf-8') for p in CSS_FILES)
selector_set = set(active_selectors(combined))
remaining = [s for s in TARGETS if s in selector_set]
if remaining:
    raise RuntimeError('Legacy Dashboard selectors remain active: ' + ', '.join(remaining))

# Update app-usage contract: old legacy-presence/hash lock becomes absence + active-owner guard.
usage = APP_USAGE.read_text(encoding='utf-8')
usage = usage.replace(
"const dashboardOverridesSelectorLockV196 = Object.freeze({\n  count: 256,\n  sha256: '797b74acd9f476627b6b2d9e16bae57f48c684f4d2460bebb9a33a2217651113'\n});",
"const dashboardLegacyCleanupV158 = Object.freeze({\n  intent: 'proven-dashboard-legacy-selectors-removed',\n  removedSelectors: dashboardLegacyOnlyInventoryV195.length\n});"
)

# Update closed guard-series marker inventory.
usage = usage.replace(
"    ['styles-overrides-legacy-early.css', 'Dashboard legacy override inventory guard'],\n    ['styles-overrides-legacy-early.css', 'Dashboard proven-overridden legacy candidates'],\n    ['styles-overrides-legacy-early.css', 'Dashboard extended proven-overridden legacy candidates'],",
"    ['styles-overrides-legacy-early.css', 'Dashboard legacy cleanup'],"
)
usage = usage.replace("    ['styles-overrides-legacy-early.css', 'Dashboard no-new-hotfix lock v1.96'],\n", '')

start = usage.find("assertIncludes(stylesOverridesCss, 'Dashboard legacy-only inventory'")
end_marker = "// Vítězné dashboard vlastnictví: test drží klíčové selektory v dashboard vrstvách, ne ve slepých globálních přepisech."
end = usage.find(end_marker, start)
if start < 0 or end < 0:
    raise RuntimeError('app-usage legacy Dashboard assertion block not found')
replacement = """assertIncludes(stylesOverridesLegacyEarlyCss, 'Dashboard legacy cleanup', 'Legacy CSS musí dokumentovat v1.5.58 Dashboard cleanup');
const dashboardLegacyOnlySetV195 = new Set(dashboardLegacyOnlyInventoryV195);
const dashboardActiveOwnerSetV195 = new Set(dashboardActiveOwnerRegistryV195);
const dashboardLegacyActiveSelectorSetV158 = new Set(getCssRuleSelectors(stylesOverridesCss));
assert(dashboardLegacyCleanupV158.intent === 'proven-dashboard-legacy-selectors-removed', 'v1.5.58 Dashboard cleanup contract má špatný intent');
assert(dashboardLegacyCleanupV158.removedSelectors >= 11, 'v1.5.58 Dashboard cleanup musí hlídat celý ověřený legacy seznam');
dashboardLegacyOnlyInventoryV195.forEach((selector) => {
  assert(!dashboardLegacyActiveSelectorSetV158.has(selector), `v1.5.58 odstraněný Dashboard legacy selector se vrátil: ${selector}`);
  assert(!dashboardActiveOwnerSetV195.has(selector), `Legacy selector nesmí být zároveň aktivní vlastník: ${selector}`);
});
dashboardActiveOwnerRegistryV195.forEach((selector) => {
  assertCssOwner(selector, `v1.5.58 active owner registry musí mít pozdní dashboard vlastníka pro ${selector}`);
  assert(!dashboardLegacyOnlySetV195.has(selector), `Active owner selector nesmí být zároveň odstraněná legacy položka: ${selector}`);
});
dashboardLegacyOwnerMap.forEach(([legacySelector, ownerSelector]) => {
  assertCssOwner(ownerSelector, `v1.5.58 chybí aktivní vlastník pro odstraněný legacy selector ${legacySelector}`);
  if (legacySelector !== ownerSelector) {
    assert(dashboardLegacyOnlySetV195.has(legacySelector), `Legacy selector není ve v1.5.58 cleanup inventuře: ${legacySelector}`);
    assert(dashboardActiveOwnerSetV195.has(ownerSelector), `Owner selector není v active registry: ${ownerSelector}`);
  }
});
assert(dashboardLegacyOnlyInventoryV195.length >= 11, 'v1.5.58 cleanup inventory musí pokrýt všechny ověřené staré Dashboard oblasti');
assert(dashboardActiveOwnerRegistryV195.length >= 10, 'Active owner registry musí dál pokrýt hlavní Dashboard vlastníky');
assertIncludes(dashboardPolishCss, 'Dashboard active owner registry', 'styles-dashboard-polish.css musí dál držet active owner registry');
assertIncludes(dashboardPolishCss, 'Dashboard override selector lock v1.96', 'styles-dashboard-polish.css musí dál držet owner-side lock poznámku');

""" + end_marker
usage = usage[:start] + replacement + usage[end + len(end_marker):]
APP_USAGE.write_text(usage, encoding='utf-8')

# Critical runtime smoke: lock absence in active legacy CSS + presence of later owners.
critical = CRITICAL.read_text(encoding='utf-8')
if "const dashboardFitCss = read('styles-dashboard-fit.css');" not in critical:
    anchor = "const stylesOverridesLegacyLateCss = read('styles-overrides-legacy-late.css');"
    insert = anchor + "\nconst dashboardFitCss = read('styles-dashboard-fit.css');\nconst dashboardPolishCss = read('styles-dashboard-polish.css');"
    if anchor not in critical:
        raise RuntimeError('critical CSS read anchor not found')
    critical = critical.replace(anchor, insert, 1)

critical_anchor = "const bootSelfTest = read('app-boot-selftest.js');"
checks = """
const dashboardLegacyCleanupTargetsV158 = [
  '#home .dashboardGrid', '#home .dashboardCard', '#home .dashboardHeroCard',
  '#dashHero .dashboardHeroLine2', '#dashHero .dashboardHeroLine3', '#dashHero .dashboardHeroLine3Pill',
  '#home .dashboardIconInline', '#home .dashboardIcon.dashboardIconInline', '#home .dashboardDot',
  '#dashKantyna .dashboardDot', '#dashJidelna .dashboardDot'
];
const dashboardActiveOwnersV158 = [
  '#home.page.active .dashboardGrid', '#home.page.active .dashboardCard', '#home.page.active #dashHero.dashboardHeroCard',
  '#home.page.active #dashHero .dashboardHeroLine2', '#home.page.active #dashHero .dashboardHeroLine3',
  '#home.page.active #dashHero .dashboardHeroLine3Pill', '#home.page.active .dashboardCard .dashboardIcon.dashboardIconInline',
  '#home.page.active #dashKantyna .dashboardDot', '#home.page.active #dashJidelna .dashboardDot'
];
function criticalCssSelectorSet(source) {
  const clean = String(source || '').replace(/\/\*[\s\S]*?\*\//g, '');
  const set = new Set();
  for (const match of clean.matchAll(/([^{}]+)\{/g)) {
    const head = String(match[1] || '').trim();
    if (!head || head.startsWith('@')) continue;
    for (const selector of head.split(',')) set.add(selector.replace(/\s+/g, ' ').trim());
  }
  return set;
}
const legacyDashboardSelectorSetV158 = criticalCssSelectorSet(stylesOverridesLegacyEarlyCss + '\n' + stylesOverridesLegacyMidCss + '\n' + stylesOverridesLegacyLateCss);
for (const selector of dashboardLegacyCleanupTargetsV158) {
  assert(!legacyDashboardSelectorSetV158.has(selector), 'Odstraněný Dashboard legacy selector se vrátil: ' + selector);
}
const activeDashboardCssV158 = dashboardFitCss + '\n' + dashboardPolishCss;
for (const selector of dashboardActiveOwnersV158) {
  assert(activeDashboardCssV158.includes(selector), 'Chybí aktivní Dashboard owner po legacy cleanupu: ' + selector);
}
assert(stylesOverridesLegacyEarlyCss.includes('Dashboard legacy cleanup'), 'Chybí v1.5.58 Dashboard legacy cleanup marker');
""".strip()
if 'dashboardLegacyCleanupTargetsV158' not in critical:
    if critical_anchor not in critical:
        raise RuntimeError('critical bootSelfTest anchor not found')
    critical = critical.replace(critical_anchor, checks + '\n' + critical_anchor, 1)
CRITICAL.write_text(critical, encoding='utf-8')

# Version bump.
app = APP.read_text(encoding='utf-8')
app = app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.57";', 'const RAK_MODULE_CACHE_VERSION = "1.5.58";')
app = app.replace('const RAK_DEV_UPDATE_BUILD = "v1.5.57";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.58";')
APP.write_text(app, encoding='utf-8')

pkg = PKG.read_text(encoding='utf-8').replace('"version": "1.5.57"', '"version": "1.5.58"')
PKG.write_text(pkg, encoding='utf-8')

sw = SW.read_text(encoding='utf-8').replace("const CACHE_VERSION = 'v1.5.57';", "const CACHE_VERSION = 'v1.5.58';")
SW.write_text(sw, encoding='utf-8')

print('v1.5.58 Dashboard legacy cleanup OK', summary)
