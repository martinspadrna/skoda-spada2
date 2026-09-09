from pathlib import Path

ROOT = Path('.')
SRC = ROOT / 'styles-overrides.css'
EARLY = ROOT / 'styles-overrides-legacy-early.css'
MID = ROOT / 'styles-overrides-legacy-mid.css'
LATE = ROOT / 'styles-overrides-legacy-late.css'
INDEX = ROOT / 'index.html'
EXPORT = ROOT / 'export.js'
HEALTH = ROOT / 'app-health-audits.js'
RELEASE_AUDIT = ROOT / 'rak-export-release-audit.js'
APP_USAGE = ROOT / 'app-usage-smoke-v963.js'
CRITICAL = ROOT / 'tools/critical-runtime-smoke.mjs'
APP = ROOT / 'app.js'
PKG = ROOT / 'package.json'
SW = ROOT / 'sw.js'

src = SRC.read_text(encoding='utf-8')
if len(src) < 300_000:
    raise RuntimeError(f'styles-overrides.css unexpectedly small: {len(src)} bytes')

# Find safe split boundaries only after complete top-level CSS blocks.
boundaries = []
depth = 0
i = 0
state = 'code'
quote = ''
while i < len(src):
    ch = src[i]
    nxt = src[i + 1] if i + 1 < len(src) else ''
    if state == 'code':
        if ch == '/' and nxt == '*':
            state = 'comment'
            i += 1
        elif ch in ('"', "'"):
            state = 'string'
            quote = ch
        elif ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth < 0:
                raise RuntimeError('CSS brace depth became negative')
            if depth == 0:
                pos = i + 1
                while pos < len(src) and src[pos] in '\r\n':
                    pos += 1
                boundaries.append(pos)
    elif state == 'comment':
        if ch == '*' and nxt == '/':
            state = 'code'
            i += 1
    elif state == 'string':
        if ch == '\\':
            i += 1
        elif ch == quote:
            state = 'code'
    i += 1

if depth != 0 or state == 'comment':
    raise RuntimeError('CSS parser ended inside a block/comment')
if len(boundaries) < 100:
    raise RuntimeError(f'Not enough safe CSS boundaries: {len(boundaries)}')

def nearest(target, minimum, maximum):
    choices = [p for p in boundaries if minimum <= p <= maximum]
    if not choices:
        raise RuntimeError(f'No CSS boundary around {target}')
    return min(choices, key=lambda p: abs(p - target))

n = len(src)
p1 = nearest(n // 3, n // 5, n // 2)
p2 = nearest((2 * n) // 3, p1 + n // 6, n - n // 5)
if not (0 < p1 < p2 < n):
    raise RuntimeError('Invalid CSS split points')

parts = [src[:p1], src[p1:p2], src[p2:]]
if ''.join(parts) != src:
    raise RuntimeError('CSS split reconstruction mismatch')
if min(map(len, parts)) < 100_000:
    raise RuntimeError('One CSS legacy part is unexpectedly small')

EARLY.write_text(parts[0], encoding='utf-8')
MID.write_text(parts[1], encoding='utf-8')
LATE.write_text(parts[2], encoding='utf-8')
SRC.unlink()

# Preserve exact cascade position and order in index.html.
index = INDEX.read_text(encoding='utf-8')
old_link = '<link rel="stylesheet" href="styles-overrides.css">'
new_links = '\n'.join([
    '<link rel="stylesheet" href="styles-overrides-legacy-early.css">',
    '<link rel="stylesheet" href="styles-overrides-legacy-mid.css">',
    '<link rel="stylesheet" href="styles-overrides-legacy-late.css">'
])
if index.count(old_link) != 1:
    raise RuntimeError('styles-overrides.css index link not unique')
index = index.replace(old_link, new_links, 1)
INDEX.write_text(index, encoding='utf-8')

# Export source inventory: replace one source by three ordered sources.
export = EXPORT.read_text(encoding='utf-8')
old_map = '  "styles-overrides.css": "src-styles-overrides-css",'
new_map = '\n'.join([
    '  "styles-overrides-legacy-early.css": "src-styles-overrides-legacy-early-css",',
    '  "styles-overrides-legacy-mid.css": "src-styles-overrides-legacy-mid-css",',
    '  "styles-overrides-legacy-late.css": "src-styles-overrides-legacy-late-css",'
])
if old_map not in export:
    raise RuntimeError('export.js styles-overrides inventory entry not found')
export = export.replace(old_map, new_map, 1)
EXPORT.write_text(export, encoding='utf-8')

# Runtime health/release inventories. The two files use different indentation.
for path in (HEALTH, RELEASE_AUDIT):
    text = path.read_text(encoding='utf-8')
    replaced = False
    for indent in ('    ', '      '):
        needle = indent + "'styles-overrides.css',"
        if needle in text:
            trio_lines = '\n'.join([
                indent + "'styles-overrides-legacy-early.css',",
                indent + "'styles-overrides-legacy-mid.css',",
                indent + "'styles-overrides-legacy-late.css',"
            ])
            text = text.replace(needle, trio_lines, 1)
            replaced = True
            break
    if not replaced:
        raise RuntimeError(f'{path.name}: styles-overrides inventory entry not found')
    path.write_text(text, encoding='utf-8')

# App usage smoke: reconstruct the original legacy CSS byte-for-byte (after LF normalization)
# so all historical selector/hash contracts remain valid while the physical monolith disappears.
usage = APP_USAGE.read_text(encoding='utf-8')
old_read = "const stylesOverridesCss = read('styles-overrides.css');"
new_read = "\n".join([
    "const stylesOverridesLegacyEarlyCss = read('styles-overrides-legacy-early.css');",
    "const stylesOverridesLegacyMidCss = read('styles-overrides-legacy-mid.css');",
    "const stylesOverridesLegacyLateCss = read('styles-overrides-legacy-late.css');",
    "const stylesOverridesCss = stylesOverridesLegacyEarlyCss + stylesOverridesLegacyMidCss + stylesOverridesLegacyLateCss;"
])
if old_read not in usage:
    raise RuntimeError('app-usage smoke stylesOverridesCss read not found')
usage = usage.replace(old_read, new_read, 1)

old_list_line = "  'styles-overrides.css',"
new_list_lines = "\n".join([
    "  'styles-overrides-legacy-early.css',",
    "  'styles-overrides-legacy-mid.css',",
    "  'styles-overrides-legacy-late.css',"
])
if old_list_line not in usage:
    raise RuntimeError('app-usage smoke CSS layer list entry not found')
usage = usage.replace(old_list_line, new_list_lines)
usage = usage.replace("['styles-overrides.css',", "['styles-overrides-legacy-early.css',")
APP_USAGE.write_text(usage, encoding='utf-8')

# Version bump.
app = APP.read_text(encoding='utf-8')
app = app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.55";', 'const RAK_MODULE_CACHE_VERSION = "1.5.56";')
app = app.replace('const RAK_DEV_UPDATE_BUILD = "v1.5.55";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.56";')
APP.write_text(app, encoding='utf-8')

pkg = PKG.read_text(encoding='utf-8')
pkg = pkg.replace('"version": "1.5.55"', '"version": "1.5.56"')
PKG.write_text(pkg, encoding='utf-8')

sw = SW.read_text(encoding='utf-8').replace("const CACHE_VERSION = 'v1.5.55';", "const CACHE_VERSION = 'v1.5.56';")
SW.write_text(sw, encoding='utf-8')

# Critical runtime smoke: lock physical split + exact link order, without touching visual selectors.
critical = CRITICAL.read_text(encoding='utf-8')
read_anchor = "const indexHtml = read('index.html');"
read_insert = "\n".join([
    read_anchor,
    "const stylesOverridesLegacyEarlyCss = read('styles-overrides-legacy-early.css');",
    "const stylesOverridesLegacyMidCss = read('styles-overrides-legacy-mid.css');",
    "const stylesOverridesLegacyLateCss = read('styles-overrides-legacy-late.css');"
])
if 'const stylesOverridesLegacyEarlyCss' not in critical:
    if read_anchor not in critical:
        raise RuntimeError('critical smoke indexHtml read anchor not found')
    critical = critical.replace(read_anchor, read_insert, 1)

assert_anchor = "assert(String(packageJson.version) === swVersionMatch[1], 'package.json a sw.js mají rozdílnou build verzi');"
css_checks = """
assert(stylesOverridesLegacyEarlyCss.length > 100000, 'CSS legacy early vrstva je neočekávaně malá');
assert(stylesOverridesLegacyMidCss.length > 100000, 'CSS legacy mid vrstva je neočekávaně malá');
assert(stylesOverridesLegacyLateCss.length > 100000, 'CSS legacy late vrstva je neočekávaně malá');
assert(!fs.existsSync(path.join(root, 'styles-overrides.css')), 'Původní styles-overrides.css monolit se nesmí vrátit');
const cssLegacyEarlyPos = indexHtml.indexOf('styles-overrides-legacy-early.css');
const cssLegacyMidPos = indexHtml.indexOf('styles-overrides-legacy-mid.css');
const cssLegacyLatePos = indexHtml.indexOf('styles-overrides-legacy-late.css');
const cssDashboardFitPos = indexHtml.indexOf('styles-dashboard-fit.css');
assert(cssLegacyEarlyPos >= 0 && cssLegacyEarlyPos < cssLegacyMidPos && cssLegacyMidPos < cssLegacyLatePos && cssLegacyLatePos < cssDashboardFitPos, 'CSS legacy vrstvy musí zachovat původní cascade pořadí před Dashboard fit');
""".strip()
if 'CSS legacy early vrstva je neočekávaně malá' not in critical:
    if assert_anchor not in critical:
        raise RuntimeError('critical smoke package version assert anchor not found')
    critical = critical.replace(assert_anchor, assert_anchor + '\n' + css_checks, 1)
CRITICAL.write_text(critical, encoding='utf-8')

print('v1.5.56 CSS split OK')
print('original bytes', len(src))
print('early bytes', len(parts[0]))
print('mid bytes', len(parts[1]))
print('late bytes', len(parts[2]))
print('split points', p1, p2)
