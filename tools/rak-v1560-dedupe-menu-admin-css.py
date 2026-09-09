from pathlib import Path
import re

ROOT = Path('.')
LEGACY_FILES = [
    ROOT / 'styles-overrides-legacy-early.css',
    ROOT / 'styles-overrides-legacy-mid.css',
    ROOT / 'styles-overrides-legacy-late.css',
]
OWNER_FILES = [
    ROOT / 'styles-admin-polish.css',
    ROOT / 'styles-menu-polish.css',
]
EARLY = LEGACY_FILES[0]
CRITICAL = ROOT / 'tools/critical-runtime-smoke.mjs'
APP = ROOT / 'app.js'
PKG = ROOT / 'package.json'
SW = ROOT / 'sw.js'
GROUP_AT_RULES = ('@media', '@supports', '@container', '@layer', '@scope', '@document')


def normalize_selector(value: str) -> str:
    value = re.sub(r'\s+', ' ', value.strip())
    value = re.sub(r'\s*([>+~])\s*', r' \1 ', value)
    return re.sub(r'\s+', ' ', value).strip()


def normalize_context(value: str) -> str:
    return re.sub(r'\s+', ' ', value.strip())


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


def selector_in_scope(selector: str) -> bool:
    s = normalize_selector(selector).lower()
    return any(token in s for token in ('#menu', '#appmenu', '.appmenu', '#admin', '.admin'))


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


def find_next_top_level(text: str, pos: int):
    i = pos
    quote = None
    comment = False
    paren = bracket = 0
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
                return ('block', i)
            if ch == ';':
                return ('semi', i)
        i += 1
    return (None, len(text))


def split_declaration_segments(body: str):
    segments = []
    start = 0
    i = 0
    quote = None
    comment = False
    paren = bracket = 0
    while i < len(body):
        ch = body[i]
        nxt = body[i + 1] if i + 1 < len(body) else ''
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
        elif ch == ';' and paren == 0 and bracket == 0:
            segments.append(body[start:i + 1])
            start = i + 1
        i += 1
    if start < len(body):
        segments.append(body[start:])
    return segments


def parse_declaration(segment: str):
    clean = re.sub(r'/\*[\s\S]*?\*/', '', segment).strip()
    if not clean:
        return None
    if clean.endswith(';'):
        clean = clean[:-1].rstrip()
    quote = None
    paren = bracket = 0
    colon = -1
    i = 0
    while i < len(clean):
        ch = clean[i]
        if quote:
            if ch == '\\':
                i += 2
                continue
            if ch == quote:
                quote = None
        elif ch in ('"', "'"):
            quote = ch
        elif ch == '(':
            paren += 1
        elif ch == ')':
            paren = max(0, paren - 1)
        elif ch == '[':
            bracket += 1
        elif ch == ']':
            bracket = max(0, bracket - 1)
        elif ch == ':' and paren == 0 and bracket == 0:
            colon = i
            break
        i += 1
    if colon <= 0:
        return None
    prop = clean[:colon].strip()
    value = clean[colon + 1:].strip()
    if not prop or not re.match(r'^(?:--[A-Za-z0-9_-]+|-?[A-Za-z][A-Za-z0-9_-]*)$', prop):
        return None
    important = bool(re.search(r'!\s*important\s*$', value, flags=re.I))
    key = prop if prop.startswith('--') else prop.lower()
    return key, important


def collect_owner_rules(text: str, context=(), out=None):
    if out is None:
        out = {}
    pos = 0
    while pos < len(text):
        kind, at = find_next_top_level(text, pos)
        if kind is None:
            break
        if kind == 'semi':
            pos = at + 1
            continue
        close = find_matching_brace(text, at)
        prelude = text[pos:at]
        _, head = split_leading_prefix(prelude)
        stripped = head.strip()
        inner = text[at + 1:close]
        if stripped.startswith('@'):
            if stripped.lower().startswith(GROUP_AT_RULES):
                collect_owner_rules(inner, context + (normalize_context(stripped),), out)
        else:
            selectors = [normalize_selector(s) for s in split_selector_list(head)]
            decls = [parse_declaration(seg) for seg in split_declaration_segments(inner)]
            for selector in selectors:
                key = (context, selector)
                props = out.setdefault(key, {})
                for parsed in decls:
                    if parsed is None:
                        continue
                    prop, important = parsed
                    props[prop] = important
        pos = close + 1
    return out


def owner_overrides(owner_index, context, selector, prop, legacy_important):
    props = owner_index.get((context, normalize_selector(selector)))
    if not props or prop not in props:
        return False
    owner_important = props[prop]
    return owner_important or not legacy_important


def dedupe_css(text: str, owner_index, context=(), stats=None):
    if stats is None:
        stats = {
            'removed_declarations': 0,
            'removed_rules': 0,
            'trimmed_rules': 0,
            'removed_empty_at_rules': 0,
        }
    out = []
    pos = 0
    while pos < len(text):
        kind, at = find_next_top_level(text, pos)
        if kind is None:
            out.append(text[pos:])
            break
        if kind == 'semi':
            out.append(text[pos:at + 1])
            pos = at + 1
            continue
        close = find_matching_brace(text, at)
        prelude = text[pos:at]
        prefix, head = split_leading_prefix(prelude)
        stripped = head.strip()
        inner = text[at + 1:close]
        if stripped.startswith('@'):
            if stripped.lower().startswith(GROUP_AT_RULES):
                cleaned_inner = dedupe_css(inner, owner_index, context + (normalize_context(stripped),), stats)
                if re.sub(r'/\*[\s\S]*?\*/', '', cleaned_inner).strip():
                    out.append(prefix + head + '{' + cleaned_inner + '}')
                else:
                    stats['removed_empty_at_rules'] += 1
                    out.append(prefix)
            else:
                out.append(prelude + '{' + inner + '}')
        else:
            selectors = split_selector_list(head)
            scoped = bool(selectors) and all(selector_in_scope(s) for s in selectors)
            if not scoped:
                out.append(prelude + '{' + inner + '}')
            else:
                kept_segments = []
                removed_here = 0
                for segment in split_declaration_segments(inner):
                    parsed = parse_declaration(segment)
                    if parsed is None:
                        kept_segments.append(segment)
                        continue
                    prop, important = parsed
                    if all(owner_overrides(owner_index, context, s, prop, important) for s in selectors):
                        removed_here += 1
                    else:
                        kept_segments.append(segment)
                if removed_here:
                    stats['removed_declarations'] += removed_here
                    cleaned_body = ''.join(kept_segments)
                    if re.sub(r'/\*[\s\S]*?\*/', '', cleaned_body).strip():
                        stats['trimmed_rules'] += 1
                        out.append(prelude + '{' + cleaned_body + '}')
                    else:
                        stats['removed_rules'] += 1
                        out.append(prefix)
                else:
                    out.append(prelude + '{' + inner + '}')
        pos = close + 1
    return ''.join(out)


owner_index = {}
for owner in OWNER_FILES:
    collect_owner_rules(owner.read_text(encoding='utf-8'), (), owner_index)

summary = {
    'removed_declarations': 0,
    'removed_rules': 0,
    'trimmed_rules': 0,
    'removed_empty_at_rules': 0,
}
for path in LEGACY_FILES:
    original = path.read_text(encoding='utf-8')
    stats = {key: 0 for key in summary}
    cleaned = dedupe_css(original, owner_index, (), stats)
    path.write_text(cleaned, encoding='utf-8')
    for key in summary:
        summary[key] += stats[key]
    print(path.name, stats, 'bytes', len(original), '->', len(cleaned))

if summary['removed_declarations'] < 50:
    raise RuntimeError(f'Unexpectedly small menu/admin cleanup: {summary}')

# Prove the focused pass is idempotent after cleanup.
second_pass = {key: 0 for key in summary}
for path in LEGACY_FILES:
    probe_stats = {key: 0 for key in summary}
    dedupe_css(path.read_text(encoding='utf-8'), owner_index, (), probe_stats)
    for key in second_pass:
        second_pass[key] += probe_stats[key]
if second_pass['removed_declarations'] != 0:
    raise RuntimeError(f'Menu/admin cleanup is not idempotent: {second_pass}')

marker = """/* RaK v1.5.60 – proven menu/admin legacy dedupe.
   Legacy menu/admin deklarace se mažou pouze tehdy, když stejný selector ve stejné
   media/supports větvi vlastní stejnou vlastnost v později načteném
   styles-menu-polish.css nebo styles-admin-polish.css se stejnou/vyšší prioritou.
   Obecné body/page/card/layout selectory jsou z tohoto průchodu záměrně vyloučené. */
"""
early = EARLY.read_text(encoding='utf-8')
if 'RaK v1.5.60 – proven menu/admin legacy dedupe' not in early:
    early = marker + early.lstrip()
EARLY.write_text(early, encoding='utf-8')

critical = CRITICAL.read_text(encoding='utf-8')
read_anchor = "const stylesReleasePolishCss = read('styles-release-polish.css');"
if "const stylesMenuPolishCss = read('styles-menu-polish.css');" not in critical:
    if read_anchor not in critical:
        raise RuntimeError('critical CSS read anchor missing')
    critical = critical.replace(
        read_anchor,
        read_anchor + "\nconst stylesMenuPolishCss = read('styles-menu-polish.css');\nconst stylesAdminPolishCss = read('styles-admin-polish.css');",
        1,
    )
check_anchor = "const bootSelfTest = read('app-boot-selftest.js');"
checks = """
const legacyMenuAdminCssV160 = stylesOverridesLegacyEarlyCss + '\\n' + stylesOverridesLegacyMidCss + '\\n' + stylesOverridesLegacyLateCss;
assert(stylesOverridesLegacyEarlyCss.includes('RaK v1.5.60 – proven menu/admin legacy dedupe'), 'Chybí v1.5.60 menu/admin cleanup marker');
assert(stylesMenuPolishCss.includes('#menu .adminUsageCard'), 'Menu polish musí dál vlastnit admin usage karty');
assert(stylesMenuPolishCss.includes('#appMenuBody .rakDevicePerfCard'), 'Menu polish musí dál vlastnit nastavení výkonu');
assert(stylesAdminPolishCss.includes('#appMenuBody[data-admin-view="rotation"] #adminRotationEditor .appMenuAdminRotationTable'), 'Admin polish musí dál vlastnit tabulku Rozpisů');
assert(stylesAdminPolishCss.includes('.adminRotationQuickRemove'), 'Admin polish musí dál vlastnit rychlé Odebrat');
assert(legacyMenuAdminCssV160.length > 100000, 'v1.5.60 nesmí omylem vyprázdnit legacy CSS');
""".strip()
if 'legacyMenuAdminCssV160' not in critical:
    if check_anchor not in critical:
        raise RuntimeError('critical bootSelfTest anchor missing')
    critical = critical.replace(check_anchor, checks + '\n' + check_anchor, 1)
CRITICAL.write_text(critical, encoding='utf-8')

app = APP.read_text(encoding='utf-8')
if '1.5.59' not in app:
    raise RuntimeError('app.js is not on v1.5.59 baseline')
app = app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.59";', 'const RAK_MODULE_CACHE_VERSION = "1.5.60";')
app = app.replace('const RAK_DEV_UPDATE_BUILD = "v1.5.59";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.60";')
APP.write_text(app, encoding='utf-8')

pkg = PKG.read_text(encoding='utf-8')
if '"version": "1.5.59"' not in pkg:
    raise RuntimeError('package.json is not on v1.5.59 baseline')
PKG.write_text(pkg.replace('"version": "1.5.59"', '"version": "1.5.60"'), encoding='utf-8')

sw = SW.read_text(encoding='utf-8')
if "const CACHE_VERSION = 'v1.5.59';" not in sw:
    raise RuntimeError('sw.js is not on v1.5.59 baseline')
SW.write_text(sw.replace("const CACHE_VERSION = 'v1.5.59';", "const CACHE_VERSION = 'v1.5.60';"), encoding='utf-8')

print('v1.5.60 menu/admin legacy dedupe OK', summary)
