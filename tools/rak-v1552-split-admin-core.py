from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
core_path = root / 'app-menu-admin-core.js'
core = core_path.read_text(encoding='utf-8')

backup_marker = 'function ensureExcelFileInput()'
service_marker = 'function adminGuideHasMonthRows(month)'
renderer_marker = 'function renderAdminMenuBody(body, section)'

backup_start = core.find(backup_marker)
service_start = core.find(service_marker)
renderer_start = core.find(renderer_marker)
if min(backup_start, service_start, renderer_start) < 0:
    raise SystemExit('Expected admin-core split marker missing')
if not (backup_start < service_start < renderer_start):
    raise SystemExit('Admin-core split markers are out of order')

storage_body = core[backup_start:service_start].rstrip() + '\n'
service_body = core[service_start:renderer_start].rstrip() + '\n'
renderer_body = core[renderer_start:].rstrip() + '\n'

files = {
    'app-menu-admin-storage.js': "// RaK – admin importy a zálohy oddělené od admin rendereru.\ntry { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-admin-storage.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}\n\n" + storage_body,
    'app-menu-admin-service.js': "// RaK – servis, předání správy, průvodci a kontrolní podklady.\ntry { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-admin-service.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}\n\n" + service_body,
    'app-menu-admin-renderer.js': "// RaK – renderer administračních stránek.\ntry { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-admin-renderer.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}\n\n" + renderer_body,
}
for name, text in files.items():
    (root / name).write_text(text, encoding='utf-8')
core_path.unlink()

app_path = root / 'app.js'
app = app_path.read_text(encoding='utf-8')
app = app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.51";', 'const RAK_MODULE_CACHE_VERSION = "1.5.52";', 1)
app = app.replace('const RAK_DEV_UPDATE_BUILD = "v1.5.51";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.52";', 1)
old_loader = '    "app-menu-admin-export.js",\n    "app-menu-admin-core.js",\n    "app-menu.js",'
new_loader = '    "app-menu-admin-export.js",\n    "app-menu-admin-storage.js",\n    "app-menu-admin-service.js",\n    "app-menu-admin-renderer.js",\n    "app-menu.js",'
if old_loader not in app:
    raise SystemExit('Expected admin-core loader block missing')
app = app.replace(old_loader, new_loader, 1)
app_path.write_text(app, encoding='utf-8')

pkg_path = root / 'package.json'
pkg = json.loads(pkg_path.read_text(encoding='utf-8'))
pkg['version'] = '1.5.52'
check = str(pkg.get('scripts', {}).get('check', ''))
old_check = 'node --check app-menu-admin-export.js && node --check app-menu-admin-core.js && node --check app-menu.js'
new_check = 'node --check app-menu-admin-export.js && node --check app-menu-admin-storage.js && node --check app-menu-admin-service.js && node --check app-menu-admin-renderer.js && node --check app-menu.js'
if old_check not in check:
    raise SystemExit('Expected package admin-core check block missing')
pkg['scripts']['check'] = check.replace(old_check, new_check, 1)
pkg_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

sw_path = root / 'sw.js'
sw = sw_path.read_text(encoding='utf-8')
if "const CACHE_VERSION = 'v1.5.51';" not in sw:
    raise SystemExit('Expected sw version missing')
sw = sw.replace("const CACHE_VERSION = 'v1.5.51';", "const CACHE_VERSION = 'v1.5.52';", 1)
sw_path.write_text(sw, encoding='utf-8')

smoke_path = root / 'tools' / 'critical-runtime-smoke.mjs'
smoke = smoke_path.read_text(encoding='utf-8')
old_reads = "const appMenuAdminExportJs = read('app-menu-admin-export.js');\nconst appMenuAdminCoreJs = read('app-menu-admin-core.js');\nconst appMenuPagesJs = read('app-menu-pages.js');"
new_reads = "const appMenuAdminExportJs = read('app-menu-admin-export.js');\nconst appMenuAdminStorageJs = read('app-menu-admin-storage.js');\nconst appMenuAdminServiceJs = read('app-menu-admin-service.js');\nconst appMenuAdminRendererJs = read('app-menu-admin-renderer.js');\nconst appMenuPagesJs = read('app-menu-pages.js');"
if old_reads not in smoke:
    raise SystemExit('Expected smoke core read block missing')
smoke = smoke.replace(old_reads, new_reads, 1)
old_asserts = "assert(deferred.includes('app-menu-admin-export.js'), 'Admin export modul musí zůstat součástí ověřeného bootu');\nassert(deferred.includes('app-menu-admin-core.js'), 'Admin core modul musí zůstat součástí ověřeného bootu');\nassert(appMenuAdminExportJs.includes('function buildRakRotationExcelExportMonthOptions'), 'Excel export helper musí vlastnit app-menu-admin-export.js');\nassert(appMenuAdminCoreJs.includes('function ensureFullSettingsBackupFileInput'), 'Zálohy nastavení musí vlastnit app-menu-admin-core.js');\nassert(appMenuAdminCoreJs.includes('function buildAdminHandoverReadinessHtml'), 'Servis/handover helpery musí vlastnit app-menu-admin-core.js');\nassert(appMenuAdminCoreJs.includes('function renderAdminMenuBody(body, section)'), 'Admin renderer musí vlastnit app-menu-admin-core.js');\nassert(!appMenuJs.includes('function renderAdminMenuBody(body, section)'), 'Admin renderer se nesmí vrátit do app-menu.js shellu');\nassert(!appMenuJs.includes('function ensureFullSettingsBackupFileInput'), 'Backup implementace se nesmí vrátit do app-menu.js shellu');"
new_asserts = "assert(deferred.includes('app-menu-admin-export.js'), 'Admin export modul musí zůstat součástí ověřeného bootu');\nassert(deferred.includes('app-menu-admin-storage.js'), 'Admin storage/backup modul musí zůstat součástí ověřeného bootu');\nassert(deferred.includes('app-menu-admin-service.js'), 'Admin service/handover modul musí zůstat součástí ověřeného bootu');\nassert(deferred.includes('app-menu-admin-renderer.js'), 'Admin renderer modul musí zůstat součástí ověřeného bootu');\nassert(!deferred.includes('app-menu-admin-core.js'), 'Rozdělený admin core se nesmí vrátit do runtime bootu');\nassert(!fs.existsSync(path.join(root, 'app-menu-admin-core.js')), 'Rozdělený app-menu-admin-core.js se nesmí vrátit do zdrojů');\nassert(appMenuAdminExportJs.includes('function buildRakRotationExcelExportMonthOptions'), 'Excel export helper musí vlastnit app-menu-admin-export.js');\nassert(appMenuAdminStorageJs.includes('function ensureFullSettingsBackupFileInput'), 'Zálohy nastavení musí vlastnit app-menu-admin-storage.js');\nassert(appMenuAdminStorageJs.includes('async function restoreAdminFullSettingsBackupOnline'), 'Obnova úplné zálohy musí vlastnit app-menu-admin-storage.js');\nassert(appMenuAdminServiceJs.includes('function buildAdminHandoverReadinessHtml'), 'Servis/handover helpery musí vlastnit app-menu-admin-service.js');\nassert(appMenuAdminServiceJs.includes('function buildAdminSettingsMapHtml'), 'Mapa administrace musí vlastnit service modul');\nassert(appMenuAdminRendererJs.includes('function renderAdminMenuBody(body, section)'), 'Admin renderer musí vlastnit app-menu-admin-renderer.js');\nassert(!appMenuAdminRendererJs.includes('function ensureFullSettingsBackupFileInput'), 'Admin renderer nesmí obsahovat backup implementaci');\nassert(!appMenuAdminRendererJs.includes('function buildAdminHandoverReadinessHtml'), 'Admin renderer nesmí obsahovat handover implementaci');\nassert(!appMenuJs.includes('function renderAdminMenuBody(body, section)'), 'Admin renderer se nesmí vrátit do app-menu.js shellu');\nassert(!appMenuJs.includes('function ensureFullSettingsBackupFileInput'), 'Backup implementace se nesmí vrátit do app-menu.js shellu');"
if old_asserts not in smoke:
    raise SystemExit('Expected smoke core assertion block missing')
smoke = smoke.replace(old_asserts, new_asserts, 1)
smoke_path.write_text(smoke, encoding='utf-8')

print('v1.5.52 admin core split prepared')
print('storage lines:', len(files['app-menu-admin-storage.js'].splitlines()))
print('service lines:', len(files['app-menu-admin-service.js'].splitlines()))
print('renderer lines:', len(files['app-menu-admin-renderer.js'].splitlines()))
