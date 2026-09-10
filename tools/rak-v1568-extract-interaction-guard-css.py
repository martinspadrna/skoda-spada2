from pathlib import Path

ROOT = Path('.')
MID = ROOT / 'styles-overrides-legacy-mid.css'
OWNER = ROOT / 'styles-interaction-guard.css'
INDEX = ROOT / 'index.html'
CRITICAL = ROOT / 'tools/critical-runtime-smoke.mjs'
APP = ROOT / 'app.js'
PKG = ROOT / 'package.json'
SW = ROOT / 'sw.js'

mid = MID.read_text(encoding='utf-8')
boundary = '.appMenuFoldSection.adminRotationFold{'
pos = mid.find(boundary)
if pos <= 0:
    raise RuntimeError('Expected adminRotationFold boundary not found after interaction guard')

prefix = mid[:pos]
required = [
    'html, body, #app, .app, .page, .card, .glassCard, .bottomNav, .navItem, button, .btn, .tile, .calcTile, .modal{',
    'html, body, body *{',
    'input, textarea, select, [contenteditable="true"], .allowTextSelect, .selectableText{',
    ':is(#soustruhy,#frezky,#brusy,.calcPage) input{',
    '-webkit-user-select:none !important;',
    'user-select:text !important;',
    '-webkit-touch-callout:default !important;'
]
for token in required:
    if token not in prefix:
        raise RuntimeError(f'Missing expected interaction guard token: {token}')
if '.appMenuFoldSection.adminRotationFold' in prefix or '.rotationViewFold' in prefix:
    raise RuntimeError('Interaction guard prefix crossed into rotation/admin styles')

if OWNER.exists():
    raise RuntimeError('styles-interaction-guard.css already exists; refusing non-idempotent migration')
owner_header = '''/* RaK v1.5.68 – owner: globální app-like interaction/text-selection guard.\n   Historický v705 blok byl vytažen z čela styles-overrides-legacy-mid.css\n   beze změny deklarací a zůstává na stejné cascade pozici. */\n'''
OWNER.write_text(owner_header + prefix, encoding='utf-8')
MID.write_text(mid[pos:], encoding='utf-8')

new_mid = MID.read_text(encoding='utf-8')
owner = OWNER.read_text(encoding='utf-8')
if not new_mid.startswith(boundary):
    raise RuntimeError('legacy-mid no longer starts at exact adminRotationFold boundary')
for token in required:
    if token not in owner:
        raise RuntimeError(f'Owner lost interaction guard token: {token}')
if '.appMenuFoldSection.adminRotationFold' in owner or '.rotationViewFold' in owner:
    raise RuntimeError('Rotation/admin CSS leaked into interaction guard owner')

index = INDEX.read_text(encoding='utf-8')
old_links = '<link rel="stylesheet" href="styles-admin-reports.css">\n<link rel="stylesheet" href="styles-overrides-legacy-mid.css">'
new_links = '<link rel="stylesheet" href="styles-admin-reports.css">\n<link rel="stylesheet" href="styles-interaction-guard.css">\n<link rel="stylesheet" href="styles-overrides-legacy-mid.css">'
if old_links not in index:
    raise RuntimeError('Expected v1.5.66 stylesheet boundary not found in index.html')
INDEX.write_text(index.replace(old_links, new_links, 1), encoding='utf-8')

critical = CRITICAL.read_text(encoding='utf-8')
read_anchor = "const stylesAdminReportsCss = read('styles-admin-reports.css');"
if read_anchor not in critical:
    raise RuntimeError('Admin reports CSS smoke read anchor missing')
read_line = "const stylesInteractionGuardCss = read('styles-interaction-guard.css');"
if read_line not in critical:
    critical = critical.replace(read_anchor, read_anchor + '\n' + read_line, 1)

assert_anchor = "assert(!stylesOverridesLegacyMidCss.includes('bomberHeroRunA') && !stylesOverridesLegacyMidCss.includes('bomberHeroRunB'), 'Mrtvé Bomberman keyframes se nesmí vrátit');"
if assert_anchor not in critical:
    raise RuntimeError('v1.5.66 admin reports assertion anchor missing')
checks = """
assert(stylesInteractionGuardCss.includes('RaK v1.5.68 – owner: globální app-like interaction/text-selection guard'), 'Chybí v1.5.68 interaction guard owner marker');
assert(stylesInteractionGuardCss.includes('html, body, body *{'), 'Interaction guard musí dál blokovat globální označování textu');
assert(stylesInteractionGuardCss.includes('[contenteditable="true"], .allowTextSelect, .selectableText'), 'Interaction guard musí zachovat textové výjimky');
assert(stylesInteractionGuardCss.includes(':is(#soustruhy,#frezky,#brusy,.calcPage) input'), 'Interaction guard musí zachovat výjimku vstupů kalkulaček');
assert(stylesOverridesLegacyMidCss.trimStart().startsWith('.appMenuFoldSection.adminRotationFold{'), 'legacy-mid musí po v1.5.68 začínat přesně adminRotationFold blokem');
const adminReportsCssPosV1568 = indexHtml.indexOf('styles-admin-reports.css');
const interactionGuardCssPosV1568 = indexHtml.indexOf('styles-interaction-guard.css');
const legacyMidCssPosV1568 = indexHtml.indexOf('styles-overrides-legacy-mid.css');
assert(adminReportsCssPosV1568 >= 0 && adminReportsCssPosV1568 < interactionGuardCssPosV1568 && interactionGuardCssPosV1568 < legacyMidCssPosV1568, 'Interaction guard musí zůstat na původní cascade hranici před legacy-mid');
"""
if 'v1.5.68 interaction guard owner marker' not in critical:
    critical = critical.replace(assert_anchor, assert_anchor + checks, 1)
CRITICAL.write_text(critical, encoding='utf-8')

app = APP.read_text(encoding='utf-8')
if 'const RAK_MODULE_CACHE_VERSION = "1.5.67";' not in app or 'const RAK_DEV_UPDATE_BUILD = "v1.5.67";' not in app:
    raise RuntimeError('app baseline is not v1.5.67')
app = app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.67";', 'const RAK_MODULE_CACHE_VERSION = "1.5.68";', 1)
app = app.replace('const RAK_DEV_UPDATE_BUILD = "v1.5.67";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.68";', 1)
APP.write_text(app, encoding='utf-8')

pkg = PKG.read_text(encoding='utf-8')
if '"version": "1.5.67"' not in pkg:
    raise RuntimeError('package baseline is not 1.5.67')
PKG.write_text(pkg.replace('"version": "1.5.67"', '"version": "1.5.68"', 1), encoding='utf-8')

sw = SW.read_text(encoding='utf-8')
if "const CACHE_VERSION = 'v1.5.67';" not in sw:
    raise RuntimeError('sw baseline is not v1.5.67')
SW.write_text(sw.replace("const CACHE_VERSION = 'v1.5.67';", "const CACHE_VERSION = 'v1.5.68';", 1), encoding='utf-8')

legacy = [ROOT/'styles-overrides-legacy-early.css', MID, ROOT/'styles-overrides-legacy-late.css']
print('v1.5.68 legacy bytes:', [p.stat().st_size for p in legacy], 'total', sum(p.stat().st_size for p in legacy))
print('v1.5.68 interaction guard owner bytes:', OWNER.stat().st_size)
print('v1.5.68 interaction guard CSS ownership extraction OK')
