from pathlib import Path

ROOT = Path('.')
MID = ROOT / 'styles-overrides-legacy-mid.css'
OWNER = ROOT / 'styles-admin-reports.css'
INDEX = ROOT / 'index.html'
CRITICAL = ROOT / 'tools/critical-runtime-smoke.mjs'
APP = ROOT / 'app.js'
PKG = ROOT / 'package.json'
SW = ROOT / 'sw.js'

mid = MID.read_text(encoding='utf-8')
next_marker = '/* v.1.1 (705) – app-like text selection guard'
pos = mid.find(next_marker)
if pos <= 0:
    raise RuntimeError('Expected v705 marker not found at start boundary of legacy-mid')

prefix = mid[:pos]
required = [
    '#menu .adminReportsCard .adminReportsFolder',
    '#menu .adminReportsToolbar',
    '#menu .adminReportsList',
    '#menu .adminReportItem',
    '#menu .adminReportSummary',
    '#menu .adminReportStatus-new',
    '#menu .adminReportBody',
    '#menu .adminReportMessage',
    '#menu .adminReportDevice',
    '#menu .adminReportActions',
]
for token in required:
    if token not in prefix:
        raise RuntimeError(f'Missing expected admin-report selector in boundary block: {token}')

# Two obsolete Bomberman keyframes sit inside the same historical boundary block.
# Games are removed from RaK, so do not migrate these dead animations into the new owner.
for dead in (
    '@keyframes bomberHeroRunA{from{transform:rotate(32deg);}to{transform:rotate(-10deg);}}\n',
    '@keyframes bomberHeroRunB{from{transform:rotate(-32deg);}to{transform:rotate(10deg);}}\n',
):
    if dead not in prefix:
        raise RuntimeError(f'Expected dead keyframe missing: {dead[:32]}')
    prefix = prefix.replace(dead, '', 1)

owner_header = '''/* RaK v1.5.66 – owner: Administrace → Reporty.\n   Obsah byl vytažen z čela styles-overrides-legacy-mid.css a zůstává na stejné cascade pozici.\n   Mrtvé Bomberman keyframes z původního historického bloku se nepřenášejí. */\n'''
owner_body = prefix.lstrip()
if OWNER.exists():
    raise RuntimeError('styles-admin-reports.css already exists; refusing non-idempotent migration')
OWNER.write_text(owner_header + owner_body, encoding='utf-8')
MID.write_text(mid[pos:], encoding='utf-8')

# Confirm ownership separation.
new_mid = MID.read_text(encoding='utf-8')
if any(token in new_mid for token in required):
    raise RuntimeError('Admin report selector still remains in legacy-mid')
if 'bomberHeroRunA' in new_mid or 'bomberHeroRunB' in new_mid:
    raise RuntimeError('Dead Bomberman keyframes remain in legacy-mid')
owner = OWNER.read_text(encoding='utf-8')
for token in required:
    if token not in owner:
        raise RuntimeError(f'Owner lost selector: {token}')
if 'bomberHeroRunA' in owner or 'bomberHeroRunB' in owner:
    raise RuntimeError('Dead Bomberman keyframes leaked into owner')

index = INDEX.read_text(encoding='utf-8')
old_links = '<link rel="stylesheet" href="styles-shift-report.css">\n<link rel="stylesheet" href="styles-overrides-legacy-mid.css">'
new_links = '<link rel="stylesheet" href="styles-shift-report.css">\n<link rel="stylesheet" href="styles-admin-reports.css">\n<link rel="stylesheet" href="styles-overrides-legacy-mid.css">'
if old_links not in index:
    raise RuntimeError('Expected v1.5.65 stylesheet boundary not found in index.html')
index = index.replace(old_links, new_links, 1)
INDEX.write_text(index, encoding='utf-8')

# Permanent smoke guard.
critical = CRITICAL.read_text(encoding='utf-8')
read_anchor = "const stylesShiftReportCss = read('styles-shift-report.css');"
if read_anchor not in critical:
    raise RuntimeError('v1.5.65 shift report smoke read anchor missing')
if "const stylesAdminReportsCss = read('styles-admin-reports.css');" not in critical:
    critical = critical.replace(read_anchor, read_anchor + "\nconst stylesAdminReportsCss = read('styles-admin-reports.css');", 1)
assert_anchor = "assert(stylesShiftReportCss.includes('.appMenuReportCard'), 'Shift report owner musí obsahovat .appMenuReportCard');"
if assert_anchor not in critical:
    raise RuntimeError('v1.5.65 shift report assertion anchor missing')
checks = """\nassert(stylesAdminReportsCss.includes('RaK v1.5.66 – owner: Administrace → Reporty'), 'Chybí v1.5.66 admin reports owner marker');\nassert(stylesAdminReportsCss.includes('#menu .adminReportsList'), 'Admin reports owner musí obsahovat seznam reportů');\nassert(stylesAdminReportsCss.includes('#menu .adminReportStatus-done'), 'Admin reports owner musí obsahovat statusy reportů');\nassert(!stylesOverridesLegacyMidCss.includes('#menu .adminReport'), 'Admin reports CSS se nesmí vrátit do legacy-mid');\nassert(!stylesOverridesLegacyMidCss.includes('bomberHeroRunA') && !stylesOverridesLegacyMidCss.includes('bomberHeroRunB'), 'Mrtvé Bomberman keyframes se nesmí vrátit');\n"""
if 'v1.5.66 admin reports owner marker' not in critical:
    critical = critical.replace(assert_anchor, assert_anchor + checks, 1)
CRITICAL.write_text(critical, encoding='utf-8')

# Version bump.
app = APP.read_text(encoding='utf-8')
if '1.5.65' not in app:
    raise RuntimeError('app baseline is not 1.5.65')
app = app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.65";', 'const RAK_MODULE_CACHE_VERSION = "1.5.66";')
app = app.replace('const RAK_DEV_UPDATE_BUILD = "v1.5.65";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.66";')
APP.write_text(app, encoding='utf-8')

pkg = PKG.read_text(encoding='utf-8')
if '"version": "1.5.65"' not in pkg:
    raise RuntimeError('package baseline is not 1.5.65')
PKG.write_text(pkg.replace('"version": "1.5.65"', '"version": "1.5.66"', 1), encoding='utf-8')

sw = SW.read_text(encoding='utf-8')
if "const CACHE_VERSION = 'v1.5.65';" not in sw:
    raise RuntimeError('sw baseline is not v1.5.65')
SW.write_text(sw.replace("const CACHE_VERSION = 'v1.5.65';", "const CACHE_VERSION = 'v1.5.66';", 1), encoding='utf-8')

legacy = [ROOT/'styles-overrides-legacy-early.css', MID, ROOT/'styles-overrides-legacy-late.css']
print('v1.5.66 legacy bytes:', [p.stat().st_size for p in legacy], 'total', sum(p.stat().st_size for p in legacy))
print('v1.5.66 admin reports owner bytes:', OWNER.stat().st_size)
print('v1.5.66 admin reports CSS ownership extraction OK')
