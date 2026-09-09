from pathlib import Path

ROOT = Path('.')
GEN = ROOT / 'admin-rotation-generator.js'
WIZ = ROOT / 'admin-rotation-generator-wizard.js'
APP = ROOT / 'app.js'
PKG = ROOT / 'package.json'
SW = ROOT / 'sw.js'
SMOKE = ROOT / 'tools/critical-runtime-smoke.mjs'

src = GEN.read_text(encoding='utf-8')
start_marker = 'function adminRotationGeneratorCanReadEditorDraftFromDom() {'
ready_marker = "try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-generator.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}"
start = src.find(start_marker)
end = src.rfind(ready_marker)
if start < 0 or end < 0 or end <= start:
    raise RuntimeError('Generator wizard split markers not found')

prefix = src[:start].rstrip()
tail = src[start:end].strip()

ics_line = "const ADMIN_ROTATION_GENERATOR_ABSENCE_ICS_URL = String(window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url || '').replace(/\\/$/, '') + '/functions/v1/rak-absence-calendar';"
if ics_line not in prefix:
    raise RuntimeError('ICS constant not found in generator prefix')
prefix = prefix.replace(ics_line, '').replace('\n\n\n', '\n\n').rstrip()

GEN.write_text(
    prefix + '\n\n' + ready_marker + '\n',
    encoding='utf-8'
)

WIZ.write_text(
    "// RaK – průvodce generátoru, návrh, kalendář absencí a export oddělené od engine.\n"
    "try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-generator-wizard.js', 'loading', { source: 'dynamic-loader' }); } catch (err) {}\n\n"
    + ics_line + '\n\n'
    + tail + '\n\n'
    + "try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-generator-wizard.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}\n",
    encoding='utf-8'
)

# Guard the thematic ownership before touching boot/version files.
engine = GEN.read_text(encoding='utf-8')
wizard = WIZ.read_text(encoding='utf-8')
if 'function adminBuildRotationGenerationModel' not in engine:
    raise RuntimeError('Engine lost generation model')
if 'function adminRotationGeneratorRepairEmptyHardCells' not in engine:
    raise RuntimeError('Engine lost repair logic')
if 'function adminRotationGeneratorRenderWizard' not in wizard:
    raise RuntimeError('Wizard renderer missing')
if 'async function adminRotationGeneratorLoadCalendarAbsences' not in wizard:
    raise RuntimeError('Calendar absence loader missing')
if 'function adminRotationGeneratorDownloadExcel' not in wizard:
    raise RuntimeError('Generator Excel export missing from wizard module')
if 'function adminRotationGeneratorRenderWizard' in engine:
    raise RuntimeError('Wizard renderer still remains in engine')
if 'ADMIN_ROTATION_GENERATOR_ABSENCE_ICS_URL' in engine:
    raise RuntimeError('ICS endpoint constant still remains in engine')

app = APP.read_text(encoding='utf-8')
app = app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.54";', 'const RAK_MODULE_CACHE_VERSION = "1.5.55";')
app = app.replace('const RAK_DEV_UPDATE_BUILD = "v1.5.54";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.55";')
old_loader = '    "admin-rotation-overtime.js",\n    "admin-rotation-generator.js",\n    "admin-machine-settings.js",'
new_loader = '    "admin-rotation-overtime.js",\n    "admin-rotation-generator.js",\n    "admin-rotation-generator-wizard.js",\n    "admin-machine-settings.js",'
if old_loader not in app:
    raise RuntimeError('app.js generator loader block not found')
app = app.replace(old_loader, new_loader, 1)
APP.write_text(app, encoding='utf-8')

pkg = PKG.read_text(encoding='utf-8')
pkg = pkg.replace('"version": "1.5.54"', '"version": "1.5.55"')
old_check = 'node --check admin-rotation-overtime.js && node --check admin-rotation-generator.js && node --check admin-machine-settings.js'
new_check = 'node --check admin-rotation-overtime.js && node --check admin-rotation-generator.js && node --check admin-rotation-generator-wizard.js && node --check admin-machine-settings.js'
if old_check not in pkg:
    raise RuntimeError('package generator check block not found')
pkg = pkg.replace(old_check, new_check, 1)
PKG.write_text(pkg, encoding='utf-8')

sw = SW.read_text(encoding='utf-8').replace('v1.5.54', 'v1.5.55')
SW.write_text(sw, encoding='utf-8')

smoke = SMOKE.read_text(encoding='utf-8')
read_anchor = "const adminRotationGeneratorJs = read('admin-rotation-generator.js');"
if "const adminRotationGeneratorWizardJs = read('admin-rotation-generator-wizard.js');" not in smoke:
    if read_anchor not in smoke:
        raise RuntimeError('Smoke generator read anchor not found')
    smoke = smoke.replace(read_anchor, read_anchor + "\nconst adminRotationGeneratorWizardJs = read('admin-rotation-generator-wizard.js');", 1)

assert_anchor = "assert(deferred.includes('admin-rotation-generator.js'), 'Generátor rozpisu musí zůstat součástí ověřeného bootu');"
checks = """
assert(deferred.includes('admin-rotation-generator-wizard.js'), 'Průvodce generátoru musí zůstat součástí ověřeného bootu');
assert(adminRotationGeneratorJs.includes('function adminBuildRotationGenerationModel'), 'Generator engine musí držet historický model');
assert(adminRotationGeneratorJs.includes('function adminRotationGeneratorRepairEmptyHardCells'), 'Generator engine musí držet opravnou logiku');
assert(adminRotationGeneratorWizardJs.includes('function adminRotationGeneratorRenderWizard'), 'Wizard modul musí vlastnit průvodce generátoru');
assert(adminRotationGeneratorWizardJs.includes('async function adminRotationGeneratorLoadCalendarAbsences'), 'Wizard modul musí vlastnit načtení absencí z kalendáře');
assert(adminRotationGeneratorWizardJs.includes('function adminRotationGeneratorDownloadExcel'), 'Wizard modul musí vlastnit export návrhu do Excelu');
assert(!adminRotationGeneratorJs.includes('function adminRotationGeneratorRenderWizard'), 'Wizard UI se nesmí vrátit do generator engine');
assert(!adminRotationGeneratorJs.includes('ADMIN_ROTATION_GENERATOR_ABSENCE_ICS_URL'), 'Kalendářový endpoint se nesmí vrátit do generator engine');
"""
if 'Průvodce generátoru musí zůstat' not in smoke:
    if assert_anchor not in smoke:
        raise RuntimeError('Smoke generator assert anchor not found')
    smoke = smoke.replace(assert_anchor, assert_anchor + '\n' + checks.strip(), 1)
SMOKE.write_text(smoke, encoding='utf-8')

print('v1.5.55 generator split OK')
print('engine lines', len(GEN.read_text(encoding='utf-8').splitlines()))
print('wizard lines', len(WIZ.read_text(encoding='utf-8').splitlines()))
