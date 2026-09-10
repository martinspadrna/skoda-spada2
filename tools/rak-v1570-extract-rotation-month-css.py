from pathlib import Path

ROOT = Path('.')
legacy_path = ROOT / 'styles-overrides-legacy-mid.css'
index_path = ROOT / 'index.html'
smoke_path = ROOT / 'tools' / 'critical-runtime-smoke.mjs'
app_path = ROOT / 'app.js'
pkg_path = ROOT / 'package.json'
sw_path = ROOT / 'sw.js'
owner_path = ROOT / 'styles-rotation-month.css'

legacy = legacy_path.read_text(encoding='utf-8')
start = '.rotationViewFold{'
boundary = '/* v.1.1 (725): Láďův režim turbo'
if not legacy.startswith(start):
    raise SystemExit('legacy-mid no longer starts with rotationViewFold')
pos = legacy.find(boundary)
if pos <= 0:
    raise SystemExit('Lada-mode boundary not found')

block = legacy[:pos].rstrip() + '\n'
if boundary in block or 'body.ladaMode' in block:
    raise SystemExit('Lada-mode CSS leaked into rotation month owner block')
if '.rotationViewFold{' not in block or '#monthView table.rotTable{' not in block:
    raise SystemExit('rotation month block is incomplete')

owner = '/* RaK v1.5.70 – owner: Rotace / měsíční přehled a skládací sekce */\n' + block
owner_path.write_text(owner, encoding='utf-8')
legacy_path.write_text(legacy[pos:], encoding='utf-8')

index = index_path.read_text(encoding='utf-8')
needle = '<link rel="stylesheet" href="styles-admin-rotation-fold.css">\n<link rel="stylesheet" href="styles-overrides-legacy-mid.css">'
replacement = '<link rel="stylesheet" href="styles-admin-rotation-fold.css">\n<link rel="stylesheet" href="styles-rotation-month.css">\n<link rel="stylesheet" href="styles-overrides-legacy-mid.css">'
if needle not in index:
    raise SystemExit('stylesheet insertion point not found')
index_path.write_text(index.replace(needle, replacement, 1), encoding='utf-8')

smoke = smoke_path.read_text(encoding='utf-8')
read_anchor = "const stylesAdminRotationFoldCss = read('styles-admin-rotation-fold.css');\n"
if read_anchor not in smoke:
    raise SystemExit('smoke read anchor missing')
smoke = smoke.replace(read_anchor, read_anchor + "const stylesRotationMonthCss = read('styles-rotation-month.css');\n", 1)
old_assert = "assert(stylesOverridesLegacyMidCss.trimStart().startsWith('.rotationViewFold{'), 'legacy-mid musí po v1.5.69 začínat přesně rotationViewFold blokem');\n"
if old_assert not in smoke:
    raise SystemExit('old v1.5.69 boundary assert missing')
new_asserts = "assert(stylesRotationMonthCss.includes('RaK v1.5.70 – owner: Rotace / měsíční přehled a skládací sekce'), 'Chybí v1.5.70 rotation month owner marker');\nassert(stylesRotationMonthCss.includes('.rotationViewFold{'), 'Rotation month owner musí obsahovat rotationViewFold');\nassert(stylesRotationMonthCss.includes('#monthView table.rotTable{'), 'Rotation month owner musí obsahovat měsíční tabulku');\nassert(!stylesRotationMonthCss.includes('body.ladaMode'), 'Rotation month owner nesmí obsahovat Láďův režim');\nassert(stylesOverridesLegacyMidCss.trimStart().startsWith('/* v.1.1 (725): Láďův režim turbo'), 'legacy-mid musí po v1.5.70 začínat přesně Láďovým režimem');\nconst adminRotationFoldCssPosV1570 = indexHtml.indexOf('styles-admin-rotation-fold.css');\nconst rotationMonthCssPosV1570 = indexHtml.indexOf('styles-rotation-month.css');\nconst legacyMidCssPosV1570 = indexHtml.indexOf('styles-overrides-legacy-mid.css');\nassert(adminRotationFoldCssPosV1570 >= 0 && adminRotationFoldCssPosV1570 < rotationMonthCssPosV1570 && rotationMonthCssPosV1570 < legacyMidCssPosV1570, 'Rotation month owner musí zůstat na původní cascade hranici před legacy-mid');\n"
smoke = smoke.replace(old_assert, new_asserts, 1)
smoke_path.write_text(smoke, encoding='utf-8')

app = app_path.read_text(encoding='utf-8')
if 'RAK_MODULE_CACHE_VERSION = "1.5.69"' not in app or 'RAK_DEV_UPDATE_BUILD = "v1.5.69"' not in app:
    raise SystemExit('app version anchors missing')
app = app.replace('RAK_MODULE_CACHE_VERSION = "1.5.69"', 'RAK_MODULE_CACHE_VERSION = "1.5.70"', 1)
app = app.replace('RAK_DEV_UPDATE_BUILD = "v1.5.69"', 'RAK_DEV_UPDATE_BUILD = "v1.5.70"', 1)
app_path.write_text(app, encoding='utf-8')

pkg = pkg_path.read_text(encoding='utf-8')
if '"version": "1.5.69"' not in pkg:
    raise SystemExit('package version anchor missing')
pkg_path.write_text(pkg.replace('"version": "1.5.69"', '"version": "1.5.70"', 1), encoding='utf-8')

sw = sw_path.read_text(encoding='utf-8')
if "CACHE_VERSION = 'v1.5.69'" not in sw:
    raise SystemExit('sw version anchor missing')
sw_path.write_text(sw.replace("CACHE_VERSION = 'v1.5.69'", "CACHE_VERSION = 'v1.5.70'", 1), encoding='utf-8')

# Structural proof: extracted runtime CSS stays byte-identical after the owner marker.
owner_check = owner_path.read_text(encoding='utf-8')
marker_end = owner_check.find('\n') + 1
if owner_check[marker_end:] != block:
    raise SystemExit('rotation month owner block is not byte-identical to extracted legacy block')
remaining = legacy_path.read_text(encoding='utf-8')
if not remaining.startswith(boundary):
    raise SystemExit('legacy-mid boundary changed unexpectedly')
if remaining.startswith(start):
    raise SystemExit('rotation month block still remains at legacy-mid head')

sizes = [len((ROOT / f).read_bytes()) for f in ['styles-overrides-legacy-early.css','styles-overrides-legacy-mid.css','styles-overrides-legacy-late.css']]
print('v1.5.70 legacy bytes:', sizes, 'total', sum(sizes))
print('v1.5.70 rotation month owner bytes:', len(owner_path.read_bytes()))
print('v1.5.70 rotation month CSS ownership extraction OK')
