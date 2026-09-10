from pathlib import Path

ROOT = Path('.')
legacy_path = ROOT / 'styles-overrides-legacy-mid.css'
index_path = ROOT / 'index.html'
smoke_path = ROOT / 'tools' / 'critical-runtime-smoke.mjs'
app_path = ROOT / 'app.js'
pkg_path = ROOT / 'package.json'
sw_path = ROOT / 'sw.js'
owner_path = ROOT / 'styles-low-end-performance.css'

legacy = legacy_path.read_text(encoding='utf-8')
start = '/* v.1.1 (725): Láďův režim turbo – finální výkonová pojistka pro slabší mobily. */'
boundary = '/* v.1.1 (725) – dashboard ruční sync + administrace servis */'
if not legacy.startswith(start):
    raise SystemExit('legacy-mid no longer starts with low-end performance block')
pos = legacy.find(boundary)
if pos <= 0:
    raise SystemExit('dashboard/admin service boundary not found')

block = legacy[:pos].rstrip() + '\n'
for required in ['body.ladaMode', 'body.lightweightMode', 'body.lowEndDevice', 'content-visibility:hidden']:
    if required not in block:
        raise SystemExit('required low-end performance token missing: ' + required)
for forbidden in ['.dashboardSyncBadge', '.adminServiceGrid', '.adminServiceMetric']:
    if forbidden in block:
        raise SystemExit('next ownership area leaked into low-end owner: ' + forbidden)

owner = '/* RaK v1.5.71 – owner: Láďův/lightweight/low-end performance guard */\n' + block
owner_path.write_text(owner, encoding='utf-8')
legacy_path.write_text(legacy[pos:], encoding='utf-8')

index = index_path.read_text(encoding='utf-8')
needle = '<link rel="stylesheet" href="styles-rotation-month.css">\n<link rel="stylesheet" href="styles-overrides-legacy-mid.css">'
replacement = '<link rel="stylesheet" href="styles-rotation-month.css">\n<link rel="stylesheet" href="styles-low-end-performance.css">\n<link rel="stylesheet" href="styles-overrides-legacy-mid.css">'
if needle not in index:
    raise SystemExit('stylesheet insertion point not found')
index_path.write_text(index.replace(needle, replacement, 1), encoding='utf-8')

smoke = smoke_path.read_text(encoding='utf-8')
read_anchor = "const stylesRotationMonthCss = read('styles-rotation-month.css');\n"
if read_anchor not in smoke:
    raise SystemExit('smoke read anchor missing')
smoke = smoke.replace(read_anchor, read_anchor + "const stylesLowEndPerformanceCss = read('styles-low-end-performance.css');\n", 1)
old_assert = "assert(stylesOverridesLegacyMidCss.trimStart().startsWith('/* v.1.1 (725): Láďův režim turbo'), 'legacy-mid musí po v1.5.70 začínat přesně Láďovým režimem');\n"
if old_assert not in smoke:
    raise SystemExit('old v1.5.70 boundary assert missing')
new_asserts = "assert(stylesLowEndPerformanceCss.includes('RaK v1.5.71 – owner: Láďův/lightweight/low-end performance guard'), 'Chybí v1.5.71 low-end performance owner marker');\nassert(stylesLowEndPerformanceCss.includes('body.ladaMode'), 'Low-end owner musí obsahovat Láďův režim');\nassert(stylesLowEndPerformanceCss.includes('body.lightweightMode') && stylesLowEndPerformanceCss.includes('body.lowEndDevice'), 'Low-end owner musí obsahovat lightweight a lowEnd režimy');\nassert(stylesLowEndPerformanceCss.includes('content-visibility:hidden'), 'Low-end owner musí zachovat vypnutí neaktivních stránek');\nassert(!stylesLowEndPerformanceCss.includes('.dashboardSyncBadge') && !stylesLowEndPerformanceCss.includes('.adminServiceGrid'), 'Low-end owner nesmí obsahovat následující Dashboard/admin servis');\nassert(stylesOverridesLegacyMidCss.trimStart().startsWith('/* v.1.1 (725) – dashboard ruční sync + administrace servis */'), 'legacy-mid musí po v1.5.71 začínat přesně Dashboard/admin servis blokem');\nconst rotationMonthCssPosV1571 = indexHtml.indexOf('styles-rotation-month.css');\nconst lowEndPerformanceCssPosV1571 = indexHtml.indexOf('styles-low-end-performance.css');\nconst legacyMidCssPosV1571 = indexHtml.indexOf('styles-overrides-legacy-mid.css');\nassert(rotationMonthCssPosV1571 >= 0 && rotationMonthCssPosV1571 < lowEndPerformanceCssPosV1571 && lowEndPerformanceCssPosV1571 < legacyMidCssPosV1571, 'Low-end performance owner musí zůstat na původní cascade hranici před legacy-mid');\n"
smoke = smoke.replace(old_assert, new_asserts, 1)
smoke_path.write_text(smoke, encoding='utf-8')

app = app_path.read_text(encoding='utf-8')
if 'RAK_MODULE_CACHE_VERSION = "1.5.70"' not in app or 'RAK_DEV_UPDATE_BUILD = "v1.5.70"' not in app:
    raise SystemExit('app version anchors missing')
app = app.replace('RAK_MODULE_CACHE_VERSION = "1.5.70"', 'RAK_MODULE_CACHE_VERSION = "1.5.71"', 1)
app = app.replace('RAK_DEV_UPDATE_BUILD = "v1.5.70"', 'RAK_DEV_UPDATE_BUILD = "v1.5.71"', 1)
app_path.write_text(app, encoding='utf-8')

pkg = pkg_path.read_text(encoding='utf-8')
if '"version": "1.5.70"' not in pkg:
    raise SystemExit('package version anchor missing')
pkg_path.write_text(pkg.replace('"version": "1.5.70"', '"version": "1.5.71"', 1), encoding='utf-8')

sw = sw_path.read_text(encoding='utf-8')
if "CACHE_VERSION = 'v1.5.70'" not in sw:
    raise SystemExit('sw version anchor missing')
sw_path.write_text(sw.replace("CACHE_VERSION = 'v1.5.70'", "CACHE_VERSION = 'v1.5.71'", 1), encoding='utf-8')

# Structural proof: extracted content remains byte-identical after the owner marker.
owner_check = owner_path.read_text(encoding='utf-8')
marker_end = owner_check.find('\n') + 1
if owner_check[marker_end:] != block:
    raise SystemExit('owner block is not byte-identical to extracted legacy block')
if not legacy_path.read_text(encoding='utf-8').startswith(boundary):
    raise SystemExit('legacy-mid boundary changed unexpectedly')

sizes = [len((ROOT / f).read_bytes()) for f in ['styles-overrides-legacy-early.css','styles-overrides-legacy-mid.css','styles-overrides-legacy-late.css']]
print('v1.5.71 legacy bytes:', sizes, 'total', sum(sizes))
print('v1.5.71 low-end performance owner bytes:', len(owner_path.read_bytes()))
print('v1.5.71 low-end performance CSS ownership extraction OK')
