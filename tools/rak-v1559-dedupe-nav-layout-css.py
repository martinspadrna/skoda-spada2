from pathlib import Path
import re
from collections import defaultdict

ROOT = Path('.')
LOAD_ORDER = [
    'styles-overrides-legacy-early.css',
    'styles-overrides-legacy-mid.css',
    'styles-overrides-legacy-late.css',
    'styles-dashboard-fit.css',
    'styles-admin-polish.css',
    'styles-menu-polish.css',
    'styles-stats-polish.css',
    'styles-viewport-polish.css',
    'styles-theme-polish.css',
    'styles-release-polish.css',
    'styles-dashboard-polish.css',
    'styles-daymods.css',
    'styles-theme-propagation.css',
    'styles-rotation-tasks.css',
]
LEGACY_FILES = set(LOAD_ORDER[:3])
GROUP_AT_RULES = ('@media', '@supports', '@container', '@layer', '@scope', '@document')

APP = ROOT / 'app.js'
PKG = ROOT / 'package.json'
SW = ROOT / 'sw.js'
CRITICAL = ROOT / 'tools/critical-runtime-smoke.mjs'
EARLY = ROOT / 'styles-overrides-legacy-early.css'


def normalize_ws(value: str) -> str:
    return re.sub(r'\s+', ' ', str(value or '').strip())


def normalize_selector(value: str) -> str:
    value = normalize_ws(value)
    value = re.sub(r'\s*([>+~])\s*', r' \1 ', value)
    return normalize_ws(value)


def normalize_context_head(value: str) -> str:
    return normalize_ws(value).lower()


def is_candidate_selector(selector: str) -> bool:
    s = normalize_selector(selector)
    low = s.lower()
    if 'bottomnav' in low or '#bottomnavscroll' in low:
        return True
    return low in {'html', 'body', 'html body', '.page', '.page.active'}


def is_dead_games_nav_selector(selector: str) -> bool:
    low = normalize_selector(selector).lower()
    return (
        '.bottomnavgamesbtn' in low
        or '[data-page="games"]' in low
        or "[data-page='games']" in low
        or '[data-action="page-games"]' in low
        or "[data-action='page-games']" in low
    )


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
    return [item for item in out if item]


def find_matching_brace(text: str, open_pos: int) -> int:
    depth = 1
    i = open_pos + 1
    quote = None
    comment = False
    escaped = False
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
            if escaped:
                escaped = False
            elif ch == '\\':
                escaped = True
            elif ch == quote:
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


def split_declaration_segments(inner: str):
    segments = []
    start = 0
    paren = bracket = 0
    quote = None
    escaped = False
    comment = False
    i = 0
    while i < len(inner):
        ch = inner[i]
        nxt = inner[i + 1] if i + 1 < len(inner) else ''
        if comment:
            if ch == '*' and nxt == '/':
                comment = False
                i += 2
                continue
            i += 1
            continue
        if quote:
            if escaped:
                escaped = False
            elif ch == '\\':
                escaped = True
            elif ch == quote:
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
            segments.append(inner[start:i + 1])
            start = i + 1
        i += 1
    if start < len(inner):
        segments.append(inner[start:])
    return segments


def parse_declaration(segment: str):
    clean = re.sub(r'/\*[\s\S]*?\*/', '', segment).strip()
    if clean.endswith(';'):
        clean = clean[:-1].strip()
    if not clean or ':' not in clean:
        return None
    prop, value = clean.split(':', 1)
    prop = prop.strip().lower()
    if not re.fullmatch(r'--[A-Za-z0-9_-]+|[A-Za-z_-][A-Za-z0-9_-]*', prop):
        return None
    value = value.strip()
    important = bool(re.search(r'!\s*important\s*$', value, re.I))
    return {'prop': prop, 'important': important}


def strip_css_comments(value: str) -> str:
    return re.sub(r'/\*[\s\S]*?\*/', '', value)


def collect_rules(text: str, file_name: str, file_index: int, context=(), counter=None):
    if counter is None:
        counter = {'style': 0}
    records = []
    pos = 0
    n = len(text)
    while pos < n:
        i = pos
        quote = None
        escaped = False
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
                if escaped:
                    escaped = False
                elif ch == '\\':
                    escaped = True
                elif ch == quote:
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
                pos = semi_pos + 1
                continue
            break
        close_pos = find_matching_brace(text, block_pos)
        prelude = text[pos:block_pos]
        _, head = split_leading_prefix(prelude)
        stripped = head.strip()
        inner = text[block_pos + 1:close_pos]
        if stripped.startswith('@'):
            low = stripped.lower()
            if low.startswith(GROUP_AT_RULES):
                records.extend(collect_rules(inner, file_name, file_index, context + (normalize_context_head(stripped),), counter))
        else:
            local_index = counter['style']
            counter['style'] += 1
            selectors = [normalize_selector(x) for x in split_selector_list(head)]
            segments = split_declaration_segments(inner)
            decls = []
            for seg_index, segment in enumerate(segments):
                parsed = parse_declaration(segment)
                if parsed:
                    decls.append({**parsed, 'segment_index': seg_index})
            records.append({
                'file': file_name,
                'file_index': file_index,
                'local_index': local_index,
                'context': tuple(context),
                'selectors': tuple(selectors),
                'decls': tuple(decls),
            })
        pos = close_pos + 1
    return records


def scan_all():
    records = []
    global_order = 0
    for file_index, file_name in enumerate(LOAD_ORDER):
        path = ROOT / file_name
        if not path.exists():
            raise RuntimeError(f'Missing CSS load-order file: {file_name}')
        text = path.read_text(encoding='utf-8')
        file_records = collect_rules(text, file_name, file_index)
        for record in file_records:
            record['order'] = global_order
            global_order += 1
            records.append(record)
    return records


def build_removal_plan(records):
    occurrences = defaultdict(list)
    for record in records:
        if not record['selectors'] or not all(is_candidate_selector(s) for s in record['selectors']):
            continue
        for decl in record['decls']:
            for selector in record['selectors']:
                key = (record['context'], selector, decl['prop'])
                occurrences[key].append((record['order'], decl['important']))

    plan = defaultdict(set)
    detail = []
    for record in records:
        if record['file'] not in LEGACY_FILES:
            continue
        if not record['selectors'] or not all(is_candidate_selector(s) for s in record['selectors']):
            continue
        for decl in record['decls']:
            covered_for_all = True
            for selector in record['selectors']:
                key = (record['context'], selector, decl['prop'])
                later = occurrences.get(key, ())
                if not any(order > record['order'] and (important or not decl['important']) for order, important in later):
                    covered_for_all = False
                    break
            if covered_for_all:
                plan[(record['file'], record['local_index'])].add(decl['segment_index'])
                detail.append((record['file'], record['local_index'], record['selectors'], record['context'], decl['prop']))
    return plan, detail


def rewrite_css(text: str, file_name: str, removal_plan, context=(), counter=None, stats=None):
    if counter is None:
        counter = {'style': 0}
    if stats is None:
        stats = {'removed_declarations': 0, 'removed_rules': 0, 'trimmed_dead_game_selectors': 0, 'removed_dead_game_rules': 0, 'removed_empty_at_rules': 0}
    out = []
    pos = 0
    n = len(text)
    while pos < n:
        i = pos
        quote = None
        escaped = False
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
                if escaped:
                    escaped = False
                elif ch == '\\':
                    escaped = True
                elif ch == quote:
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
            low = stripped.lower()
            if low.startswith(GROUP_AT_RULES):
                cleaned_inner = rewrite_css(inner, file_name, removal_plan, context + (normalize_context_head(stripped),), counter, stats)
                if strip_css_comments(cleaned_inner).strip():
                    out.append(prefix + head + '{' + cleaned_inner + '}')
                else:
                    stats['removed_empty_at_rules'] += 1
                    out.append(prefix)
            else:
                out.append(prelude + '{' + inner + '}')
        else:
            local_index = counter['style']
            counter['style'] += 1
            selectors_raw = split_selector_list(head)
            selectors_kept = [s for s in selectors_raw if not is_dead_games_nav_selector(s)]
            dead_removed = len(selectors_raw) - len(selectors_kept)
            if dead_removed:
                stats['trimmed_dead_game_selectors'] += dead_removed
            remove_segments = removal_plan.get((file_name, local_index), set())
            segments = split_declaration_segments(inner)
            if remove_segments:
                new_segments = []
                for seg_index, segment in enumerate(segments):
                    if seg_index in remove_segments and parse_declaration(segment):
                        stats['removed_declarations'] += 1
                        continue
                    new_segments.append(segment)
                inner = ''.join(new_segments)
            if not selectors_kept:
                stats['removed_dead_game_rules'] += 1
                out.append(prefix)
            elif not strip_css_comments(inner).strip():
                stats['removed_rules'] += 1
                out.append(prefix)
            else:
                if dead_removed:
                    separator = ',\n' if '\n' in head else ', '
                    new_head = separator.join(selectors_kept)
                    out.append(prefix + new_head + '{' + inner + '}')
                else:
                    out.append(prelude + '{' + inner + '}')
        pos = close_pos + 1
    return ''.join(out)


records = scan_all()
plan, details = build_removal_plan(records)
if not details:
    raise RuntimeError('v1.5.59 found no provably superseded nav/layout declarations')

summary = {
    'removed_declarations': 0,
    'removed_rules': 0,
    'trimmed_dead_game_selectors': 0,
    'removed_dead_game_rules': 0,
    'removed_empty_at_rules': 0,
}
for file_name in LOAD_ORDER[:3]:
    path = ROOT / file_name
    original = path.read_text(encoding='utf-8')
    local_stats = {key: 0 for key in summary}
    cleaned = rewrite_css(original, file_name, plan, stats=local_stats)
    path.write_text(cleaned, encoding='utf-8')
    for key in summary:
        summary[key] += local_stats[key]
    print(file_name, local_stats, 'bytes', len(original), '->', len(cleaned))

if summary['removed_declarations'] <= 0:
    raise RuntimeError('v1.5.59 removed no declarations')
if summary['trimmed_dead_game_selectors'] <= 0 and summary['removed_dead_game_rules'] <= 0:
    raise RuntimeError('v1.5.59 expected at least one dead Games navigation residue')

# Idempotence / proof check: no candidate declaration left in legacy CSS may be exactly superseded later.
records_after = scan_all()
plan_after, details_after = build_removal_plan(records_after)
if details_after:
    sample = details_after[:8]
    raise RuntimeError(f'v1.5.59 dedupe is not idempotent; remaining provable duplicates: {sample}')

combined_legacy = '\n'.join((ROOT / name).read_text(encoding='utf-8') for name in LOAD_ORDER[:3])
active_legacy = strip_css_comments(combined_legacy).lower()
for dead in ('.bottomnavgamesbtn', '[data-page="games"]', "[data-page='games']", '[data-action="page-games"]', "[data-action='page-games']"):
    if dead in active_legacy:
        raise RuntimeError(f'Dead Games navigation selector remains: {dead}')

marker = (
    '/* RaK v1.5.59 – proven nav/layout legacy dedupe.\n'
    f"   Odstraněno {summary['removed_declarations']} deklarací, které byly později kompletně přepsané stejným selectorem ve stejné cascade větvi.\n"
    f"   Zbytky navigace po Hrách: odstraněno/osekáno {summary['trimmed_dead_game_selectors'] + summary['removed_dead_game_rules']} selectorů/pravidel.\n"
    '   Rotace, Dashboard, admin a funkční pravidla se tímto krokem necílí; cleanup je omezený na bottom-nav + obecný viewport/page shell. */\n'
)
early = EARLY.read_text(encoding='utf-8')
EARLY.write_text(marker + early.lstrip(), encoding='utf-8')

critical = CRITICAL.read_text(encoding='utf-8')
read_anchor = "const stylesOverridesLegacyLateCss = read('styles-overrides-legacy-late.css');"
if "const stylesViewportPolishCss = read('styles-viewport-polish.css');" not in critical:
    if read_anchor not in critical:
        raise RuntimeError('critical runtime CSS read anchor missing')
    critical = critical.replace(
        read_anchor,
        read_anchor + "\nconst stylesViewportPolishCss = read('styles-viewport-polish.css');\nconst stylesReleasePolishCss = read('styles-release-polish.css');",
        1,
    )

critical_anchor = "const bootSelfTest = read('app-boot-selftest.js');"
checks = r"""
const legacyNavLayoutCssV159 = (stylesOverridesLegacyEarlyCss + '\n' + stylesOverridesLegacyMidCss + '\n' + stylesOverridesLegacyLateCss)
  .replace(/\/\*[\s\S]*?\*\//g, '');
assert(stylesOverridesLegacyEarlyCss.includes('RaK v1.5.59 – proven nav/layout legacy dedupe'), 'Chybí v1.5.59 nav/layout cleanup marker');
assert(!legacyNavLayoutCssV159.includes('.bottomNavGamesBtn'), 'Mrtvý bottomNavGamesBtn se nesmí vrátit');
assert(!legacyNavLayoutCssV159.includes('[data-page="games"]'), 'Mrtvý Games nav selector se nesmí vrátit');
assert(stylesViewportPolishCss.includes('html body nav.bottomNav'), 'Viewport polish musí dál vlastnit iOS pozici spodní lišty');
assert(stylesReleasePolishCss.includes('html body nav.bottomNav'), 'Release polish musí dál vlastnit finální bottom-nav pozici');
assert(stylesReleasePolishCss.includes('.page.active'), 'Release polish musí dál držet finální page shell');
""".strip()
if 'legacyNavLayoutCssV159' not in critical:
    if critical_anchor not in critical:
        raise RuntimeError('critical runtime insertion anchor missing')
    critical = critical.replace(critical_anchor, checks + '\n' + critical_anchor, 1)
CRITICAL.write_text(critical, encoding='utf-8')

app = APP.read_text(encoding='utf-8')
app = app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.58";', 'const RAK_MODULE_CACHE_VERSION = "1.5.59";')
app = app.replace('const RAK_DEV_UPDATE_BUILD = "v1.5.58";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.59";')
if '1.5.59' not in app:
    raise RuntimeError('app.js version bump failed')
APP.write_text(app, encoding='utf-8')

pkg = PKG.read_text(encoding='utf-8').replace('"version": "1.5.58"', '"version": "1.5.59"')
if '"version": "1.5.59"' not in pkg:
    raise RuntimeError('package version bump failed')
PKG.write_text(pkg, encoding='utf-8')

sw = SW.read_text(encoding='utf-8').replace("const CACHE_VERSION = 'v1.5.58';", "const CACHE_VERSION = 'v1.5.59';")
if "const CACHE_VERSION = 'v1.5.59';" not in sw:
    raise RuntimeError('service worker version bump failed')
SW.write_text(sw, encoding='utf-8')

print('v1.5.59 nav/layout legacy dedupe OK', summary)
