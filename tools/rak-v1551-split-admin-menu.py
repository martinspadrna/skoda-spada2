from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]

def read(name):
    return (root / name).read_text(encoding='utf-8')

def write(name, text):
    (root / name).write_text(text, encoding='utf-8')

menu = read('app-menu.js')

export_start = 'function getRakAdminExportMetadataSnapshot(monthKey) {'
export_end = 'function ensureAppMenuOverlay() {'
core_start = 'function ensureExcelFileInput() {'
core_end = 'function appMenuAdminModeSet() {'

for marker in (export_start, export_end, core_start, core_end):
    if menu.count(marker) != 1:
        raise SystemExit(f'Expected exactly one marker: {marker!r}, got {menu.count(marker)}')

# First pull out the export helper block near the top.
a = menu.index(export_start)
b = menu.index(export_end)
export_block = menu[a:b].rstrip() + '\n'
menu = menu[:a] + menu[b:]

# Then pull the large contiguous admin core: imports/backups/service/handover/renderAdminMenuBody.
c = menu.index(core_start)
d = menu.index(core_end)
core_block = menu[c:d].rstrip() + '\n'
menu = menu[:c] + menu[d:]

if 'function renderAdminMenuBody(body, section)' not in core_block:
    raise SystemExit('renderAdminMenuBody was not captured into admin core')
if 'function buildAdminHandoverReadinessHtml' not in core_block:
    raise SystemExit('handover/service helpers were not captured into admin core')
if 'function ensureFullSettingsBackupFileInput' not in core_block:
    raise SystemExit('backup helpers were not captured into admin core')
if 'function buildRakRotationExcelExportMonthOptions' not in export_block:
    raise SystemExit('Excel export helper was not captured into export module')

menu = menu.replace(
    '// RaK 1.2 (1.155) – Více/menu shell, O aplikaci, Nastavení, Report chyby a admin menu.',
    '// RaK 1.2 (1.155) – Více/menu shell a router; admin implementace je v samostatných modulech.',
    1,
)
write('app-menu.js', menu)

export_header = "// RaK – admin export helpery oddělené od menu shellu.\ntry { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-admin-export.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}\n\n"
core_header = "// RaK – admin data, zálohy, servis/handover a admin renderer oddělené od menu shellu.\ntry { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-admin-core.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}\n\n"
write('app-menu-admin-export.js', export_header + export_block)
write('app-menu-admin-core.js', core_header + core_block)

# Version + loader order.
app = read('app.js')
app = app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.50";', 'const RAK_MODULE_CACHE_VERSION = "1.5.51";', 1)
app = app.replace('const RAK_DEV_UPDATE_BUILD = "v1.5.50";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.51";', 1)
needle = '    "app-menu.js",\n'
replacement = '    "app-menu-admin-export.js",\n    "app-menu-admin-core.js",\n    "app-menu.js",\n'
if app.count(needle) != 1:
    raise SystemExit('Unexpected app-menu.js loader count')
app = app.replace(needle, replacement, 1)
write('app.js', app)

pkg = json.loads(read('package.json'))
if pkg.get('version') != '1.5.50':
    raise SystemExit(f"Unexpected package version: {pkg.get('version')}")
pkg['version'] = '1.5.51'
check = pkg['scripts']['check']
needle_check = 'node --check app-menu.js'
if check.count(needle_check) != 1:
    raise SystemExit('Unexpected app-menu.js check count')
check = check.replace(needle_check, 'node --check app-menu-admin-export.js && node --check app-menu-admin-core.js && node --check app-menu.js', 1)
pkg['scripts']['check'] = check
write('package.json', json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')

sw = read('sw.js')
sw = sw.replace("const CACHE_VERSION = 'v1.5.50';", "const CACHE_VERSION = 'v1.5.51';", 1)
write('sw.js', sw)

smoke = read('tools/critical-runtime-smoke.mjs')
read_anchor = "const appMenuJs = read('app-menu.js');\n"
if smoke.count(read_anchor) != 1:
    raise SystemExit('Missing smoke app-menu read anchor')
smoke = smoke.replace(read_anchor, read_anchor + "const appMenuAdminExportJs = read('app-menu-admin-export.js');\nconst appMenuAdminCoreJs = read('app-menu-admin-core.js');\n", 1)

guard_anchor = "assert(deferred.includes('app-menu-pages.js'), 'Běžné menu stránky musí zůstat součástí ověřeného bootu');\n"
if smoke.count(guard_anchor) != 1:
    raise SystemExit('Missing smoke guard anchor')
new_guards = "assert(deferred.includes('app-menu-admin-export.js'), 'Admin export modul musí zůstat součástí ověřeného bootu');\nassert(deferred.includes('app-menu-admin-core.js'), 'Admin core modul musí zůstat součástí ověřeného bootu');\nassert(appMenuAdminExportJs.includes('function buildRakRotationExcelExportMonthOptions'), 'Excel export helper musí vlastnit app-menu-admin-export.js');\nassert(appMenuAdminCoreJs.includes('function ensureFullSettingsBackupFileInput'), 'Zálohy nastavení musí vlastnit app-menu-admin-core.js');\nassert(appMenuAdminCoreJs.includes('function buildAdminHandoverReadinessHtml'), 'Servis/handover helpery musí vlastnit app-menu-admin-core.js');\nassert(appMenuAdminCoreJs.includes('function renderAdminMenuBody(body, section)'), 'Admin renderer musí vlastnit app-menu-admin-core.js');\nassert(!appMenuJs.includes('function renderAdminMenuBody(body, section)'), 'Admin renderer se nesmí vrátit do app-menu.js shellu');\nassert(!appMenuJs.includes('function ensureFullSettingsBackupFileInput'), 'Backup implementace se nesmí vrátit do app-menu.js shellu');\n"
smoke = smoke.replace(guard_anchor, new_guards + guard_anchor, 1)
write('tools/critical-runtime-smoke.mjs', smoke)

# Hard guards against accidental leftover implementation in the shell.
final_menu = read('app-menu.js')
for forbidden in (
    'function getRakAdminExportMetadataSnapshot',
    'function buildRakRotationExcelExportMonthOptions',
    'function ensureExcelFileInput',
    'function ensureFullSettingsBackupFileInput',
    'function buildAdminHandoverReadinessHtml',
    'function renderAdminMenuBody(body, section)',
):
    if forbidden in final_menu:
        raise SystemExit(f'Admin implementation remained in app-menu.js: {forbidden}')

print('v1.5.51 admin menu split prepared')
