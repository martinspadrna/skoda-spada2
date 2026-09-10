from pathlib import Path

ROOT = Path('.')
legacy_path = ROOT / 'styles-overrides-legacy-mid.css'
index_path = ROOT / 'index.html'
smoke_path = ROOT / 'tools' / 'critical-runtime-smoke.mjs'
app_path = ROOT / 'app.js'
pkg_path = ROOT / 'package.json'
sw_path = ROOT / 'sw.js'
owner_path = ROOT / 'styles-admin-rotation-fold.css'

legacy = legacy_path.read_text(encoding='utf-8')
start = '.appMenuFoldSection.adminRotationFold{'
boundary = '.rotationViewFold{'
if not legacy.startswith(start):
    raise SystemExit('legacy-mid no longer starts with adminRotationFold')
pos = legacy.find(boundary)
if pos <= 0:
    raise SystemExit('rotationViewFold boundary not found')

block = legacy[:pos].rstrip() + '\n'
if boundary in block:
    raise SystemExit('rotationViewFold leaked into admin owner block')
if '.appMenuFoldSection.adminRotationFold' not in block:
    raise SystemExit('adminRotationFold missing from extracted block')

owner = '/* RaK v1.5.69 – owner: Administrace → Rozpisy / skládací adminRotationFold */\n' + block
owner_path.write_text(owner, encoding='utf-8')
legacy_path.write_text(legacy[pos:], encoding='utf-8')

index = index_path.read_text(encoding='utf-8')
needle = '<link rel="stylesheet" href="styles-interaction-guard.css">\n<link rel="stylesheet" href="styles-overrides-legacy-mid.css">'
replacement = '<link rel="stylesheet" href="styles-interaction-guard.css">\n<link rel="stylesheet" href="styles-admin-rotation-fold.css">\n<link rel="stylesheet" href="styles-overrides-legacy-mid.css">'
if needle not in index:
    raise SystemExit('stylesheet insertion point not found')
index_path.write_text(index.replace(needle, replacement, 1), encoding='utf-8')

smoke = smoke_path.read_text(encoding='utf-8')
read_anchor = "const stylesInteractionGuardCss = read('styles-interaction-guard.css');\n"
if read_anchor not in smoke:
    raise SystemExit('smoke read anchor missing')
smoke = smoke.replace(read_anchor, read_anchor + "const stylesAdminRotationFoldCss = read('styles-admin-rotation-fold.css');\n", 1)
old_assert = "assert(stylesOverridesLegacyMidCss.trimStart().startsWith('.appMenuFoldSection.adminRotationFold{'), 'legacy-mid musí po v1.5.68 začínat přesně adminRotationFold blokem');\n"
if old_assert not in smoke:
    raise SystemExit('old v1.5.68 boundary assert missing')
new_asserts = "assert(stylesAdminRotationFoldCss.includes('RaK v1.5.69 – owner: Administrace → Rozpisy / skládací adminRotationFold'), 'Chybí v1.5.69 admin rotation fold owner marker');\nassert(stylesAdminRotationFoldCss.includes('.appMenuFoldSection.adminRotationFold{'), 'Admin rotation fold owner musí obsahovat skládací Rozpisy');\nassert(!stylesAdminRotationFoldCss.includes('.rotationViewFold{'), 'Admin rotation fold owner nesmí obsahovat veřejnou rotationViewFold část');\nassert(!stylesOverridesLegacyMidCss.includes('.appMenuFoldSection.adminRotationFold{'), 'adminRotationFold se nesmí vrátit do legacy-mid');\nassert(stylesOverridesLegacyMidCss.trimStart().startsWith('.rotationViewFold{'), 'legacy-mid musí po v1.5.69 začínat přesně rotationViewFold blokem');\nconst interactionGuardCssPosV1569 = indexHtml.indexOf('styles-interaction-guard.css');\nconst adminRotationFoldCssPosV1569 = indexHtml.indexOf('styles-admin-rotation-fold.css');\nconst legacyMidCssPosV1569 = indexHtml.indexOf('styles-overrides-legacy-mid.css');\nassert(interactionGuardCssPosV1569 >= 0 && interactionGuardCssPosV1569 < adminRotationFoldCssPosV1569 && adminRotationFoldCssPosV1569 < legacyMidCssPosV1569, 'Admin rotation fold owner musí zůstat na původní cascade hranici před legacy-mid');\n"
smoke = smoke.replace(old_assert, new_asserts, 1)
smoke_path.write_text(smoke, encoding='utf-8')

app = app_path.read_text(encoding='utf-8')
app = app.replace('RAK_MODULE_CACHE_VERSION = "1.5.68"', 'RAK_MODULE_CACHE_VERSION = "1.5.69"', 1)
app = app.replace('RAK_DEV_UPDATE_BUILD = "v1.5.68"', 'RAK_DEV_UPDATE_BUILD = "v1.5.69"', 1)
if '1.5.69' not in app:
    raise SystemExit('app version bump failed')
app_path.write_text(app, encoding='utf-8')

pkg = pkg_path.read_text(encoding='utf-8')
if '"version": "1.5.68"' not in pkg:
    raise SystemExit('package version anchor missing')
pkg_path.write_text(pkg.replace('"version": "1.5.68"', '"version": "1.5.69"', 1), encoding='utf-8')

sw = sw_path.read_text(encoding='utf-8')
if "CACHE_VERSION = 'v1.5.68'" not in sw:
    raise SystemExit('sw version anchor missing')
sw_path.write_text(sw.replace("CACHE_VERSION = 'v1.5.68'", "CACHE_VERSION = 'v1.5.69'", 1), encoding='utf-8')

# Structural proof: exact extracted block is preserved after the marker.
owner_check = owner_path.read_text(encoding='utf-8')
marker_end = owner_check.find('\n') + 1
if owner_check[marker_end:] != block:
    raise SystemExit('owner block is not byte-identical to extracted legacy block')
if not legacy_path.read_text(encoding='utf-8').startswith(boundary):
    raise SystemExit('legacy-mid boundary changed unexpectedly')

sizes = [len((ROOT / f).read_bytes()) for f in ['styles-overrides-legacy-early.css','styles-overrides-legacy-mid.css','styles-overrides-legacy-late.css']]
print('v1.5.69 legacy bytes:', sizes, 'total', sum(sizes))
print('v1.5.69 admin rotation fold owner bytes:', len(owner_path.read_bytes()))
print('v1.5.69 admin rotation fold CSS ownership extraction OK')
