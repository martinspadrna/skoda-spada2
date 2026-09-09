from pathlib import Path


def replace_exact(path, old, new, count=1):
    p = Path(path)
    text = p.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} occurrence(s), found {actual}: {old!r}')
    p.write_text(text.replace(old, new, count))

# Version bump.
replace_exact('app.js', 'const RAK_MODULE_CACHE_VERSION = "1.5.47";', 'const RAK_MODULE_CACHE_VERSION = "1.5.48";')
replace_exact('app.js', 'const RAK_DEV_UPDATE_BUILD = "v1.5.47";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.48";')
replace_exact('package.json', '"version": "1.5.47"', '"version": "1.5.48"')
replace_exact('sw.js', "const CACHE_VERSION = 'v1.5.47';", "const CACHE_VERSION = 'v1.5.48';")

# Split two self-contained top-level blocks out of app-menu.js without rewriting their logic.
p = Path('app-menu.js')
text = p.read_text()
profile_start = 'function getAppMenuProfileSettingsProfile() {'
shift_start = 'let appMenuShiftReportOpening = false;'
admin_start = 'function getRakAdminExportMetadataSnapshot(monthKey) {'
for marker in (profile_start, shift_start, admin_start):
    if text.count(marker) != 1:
        raise SystemExit(f'app-menu.js: marker not unique: {marker}')
profile_i = text.index(profile_start)
shift_i = text.index(shift_start)
admin_i = text.index(admin_start)
if not (profile_i < shift_i < admin_i):
    raise SystemExit('app-menu.js: unexpected split marker order')
profile_block = text[profile_i:shift_i]
shift_block = text[shift_i:admin_i]
if 'function buildGamesProfileSettingsHtml()' not in profile_block or 'appMenuHandleProfileSettingsAction' not in profile_block:
    raise SystemExit('app-menu.js: incomplete profile block')
if 'function appMenuOpenShiftReport()' not in shift_block or 'appMenuHandleShiftReportEntry' not in shift_block:
    raise SystemExit('app-menu.js: incomplete shift-report block')
Path('app-menu-profile.js').write_text("// RaK – profil a přihlášení oddělené z app-menu.js.\ntry { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-profile.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}\n\n" + profile_block)
Path('app-menu-shift-report.js').write_text("// RaK – vstup do Reportu směny oddělený z app-menu.js.\ntry { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-shift-report.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}\n\n" + shift_block)
p.write_text(text[:profile_i] + text[admin_i:])

# Load extracted modules immediately after the menu shell.
replace_exact('app.js', '    "app-menu.js",\n    "app-actions.js",', '    "app-menu.js",\n    "app-menu-profile.js",\n    "app-menu-shift-report.js",\n    "app-actions.js",')

# Syntax check list owns the new modules.
replace_exact('package.json', 'node --check app-menu.js && node --check app-actions.js', 'node --check app-menu.js && node --check app-menu-profile.js && node --check app-menu-shift-report.js && node --check app-actions.js')

# Critical runtime smoke protects the split and prevents logic drifting back into the shell.
smoke = Path('tools/critical-runtime-smoke.mjs')
s = smoke.read_text()
needle = "const appMenuJs = read('app-menu.js');\n"
if s.count(needle) != 1:
    raise SystemExit('critical smoke: appMenuJs marker not unique')
s = s.replace(needle, needle + "const appMenuProfileJs = read('app-menu-profile.js');\nconst appMenuShiftReportJs = read('app-menu-shift-report.js');\n", 1)
old = "assert(appMenuJs.includes('function buildGamesProfileSettingsHtml()'), 'Nativní profilová karta musí být přímo v app-menu.js');\n"
if s.count(old) != 1:
    raise SystemExit('critical smoke: old profile owner assertion missing')
new = "assert(deferred.includes('app-menu-profile.js'), 'Profilový menu modul musí zůstat součástí ověřeného bootu');\nassert(deferred.includes('app-menu-shift-report.js'), 'Reportový menu modul musí zůstat součástí ověřeného bootu');\nassert(appMenuProfileJs.includes('function buildGamesProfileSettingsHtml()'), 'Profilová karta musí být v app-menu-profile.js');\nassert(appMenuProfileJs.includes('appMenuHandleProfileSettingsAction'), 'Odhlášení profilu musí být v app-menu-profile.js');\nassert(!appMenuJs.includes('function buildGamesProfileSettingsHtml()'), 'Profilová logika se nesmí vrátit do app-menu.js shellu');\nassert(appMenuShiftReportJs.includes('function appMenuOpenShiftReport()'), 'Otevření Reportu směny musí být v app-menu-shift-report.js');\nassert(appMenuShiftReportJs.includes('appMenuHandleShiftReportEntry'), 'Klik handler Reportu směny musí být v app-menu-shift-report.js');\nassert(!appMenuJs.includes('function appMenuOpenShiftReport()'), 'Reportový handler se nesmí vrátit do app-menu.js shellu');\n"
s = s.replace(old, new, 1)
old2 = "assert(appMenuJs.includes('function appMenuOpenShiftReport()'), 'Otevření Reportu směny musí vlastnit app-menu.js');\n"
if s.count(old2) != 1:
    raise SystemExit('critical smoke: old shift owner assertion missing')
s = s.replace(old2, '', 1)
smoke.write_text(s)
