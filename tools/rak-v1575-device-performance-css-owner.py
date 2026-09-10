from pathlib import Path
import json

ROOT = Path('.')
legacy_path = ROOT / 'styles-overrides-legacy-mid.css'
owner_path = ROOT / 'styles-device-performance-settings.css'
index_path = ROOT / 'index.html'
smoke_path = ROOT / 'tools/critical-runtime-smoke.mjs'

legacy = legacy_path.read_text(encoding='utf-8')
start_marker = '/* v.1.1 (725) – výkon zařízení / Láďův režim v nastavení */'
next_marker = '/* v.1.5 (747): Více → Nastavení – kompaktnější profil, výkon a tlačítka ve dvou sloupcích. */'
assert legacy.startswith(start_marker), 'legacy-mid už nezačíná očekávaným device-performance blokem'
end = legacy.find(next_marker)
assert end > 0, 'nenalezena hranice širšího Settings bloku'
block = legacy[:end].rstrip() + '\n'
rest = legacy[end:]
assert '.rakDevicePerfCard{' in block, 'owner blok neobsahuje rakDevicePerfCard'
assert '.rakDevicePerfActions{' in block, 'owner blok neobsahuje rakDevicePerfActions'
assert '#appMenuBody .appMenuProfileCard' not in block, 'do owneru pronikl širší Settings blok'
assert rest.startswith(next_marker), 'zbytek legacy-mid nezačíná přesně širším Settings blokem'
assert not owner_path.exists(), 'styles-device-performance-settings.css už existuje'
owner = '/* RaK v1.5.75 – owner: Nastavení → Výkon / device performance card */\n' + block
owner_path.write_text(owner, encoding='utf-8')
legacy_path.write_text(rest, encoding='utf-8')

index = index_path.read_text(encoding='utf-8')
legacy_link = '<link rel="stylesheet" href="styles-overrides-legacy-mid.css">'
owner_link = '<link rel="stylesheet" href="styles-device-performance-settings.css">'
assert index.count(legacy_link) == 1, 'neočekávaný počet legacy-mid stylesheet linků'
assert owner_link not in index, 'device performance owner už je v indexu'
index = index.replace(legacy_link, owner_link + '\n' + legacy_link, 1)
index_path.write_text(index, encoding='utf-8')

smoke = smoke_path.read_text(encoding='utf-8')
read_anchor = "const stylesAdminServiceCss = read('styles-admin-service.css');\n"
assert read_anchor in smoke, 'nenalezena smoke read kotva admin service'
smoke = smoke.replace(read_anchor, read_anchor + "const stylesDevicePerformanceSettingsCss = read('styles-device-performance-settings.css');\n", 1)

old_start_assert = "assert(stylesOverridesLegacyMidCss.trimStart().startsWith('/* v.1.1 (725) – výkon zařízení / Láďův režim v nastavení */'), 'legacy-mid musí po v1.5.72 začínat přesně Nastavení/Výkon blokem');"
new_start_assert = "assert(stylesOverridesLegacyMidCss.trimStart().startsWith('/* v.1.5 (747): Více → Nastavení – kompaktnější profil, výkon a tlačítka ve dvou sloupcích. */'), 'legacy-mid musí po v1.5.75 začínat přesně širším Settings blokem');"
assert old_start_assert in smoke, 'nenalezena překonaná v1.5.72 start kotva'
smoke = smoke.replace(old_start_assert, new_start_assert, 1)

insert_anchor = "assert(!stylesAdminServiceCss.includes('.dashboardSyncBadge') && !stylesAdminServiceCss.includes('.rakDevicePerfCard'), 'Admin service owner nesmí obsahovat Dashboard sync ani následující Nastavení/Výkon');\n"
assert insert_anchor in smoke, 'nenalezena smoke kotva před device performance ownerem'
new_guard = """assert(stylesDevicePerformanceSettingsCss.includes('RaK v1.5.75 – owner: Nastavení → Výkon / device performance card'), 'Chybí v1.5.75 device performance owner marker');
assert(stylesDevicePerformanceSettingsCss.includes('.rakDevicePerfCard{') && stylesDevicePerformanceSettingsCss.includes('.rakDevicePerfActions{'), 'Device performance owner musí zachovat kartu a akce');
assert(stylesDevicePerformanceSettingsCss.includes('body.ladaMode .rakDevicePerfCard') && stylesDevicePerformanceSettingsCss.includes('@media (max-width:390px)'), 'Device performance owner musí zachovat low-end variantu i mobilní layout');
assert(!stylesDevicePerformanceSettingsCss.includes('#appMenuBody .appMenuProfileCard'), 'Device performance owner nesmí obsahovat následující širší Settings blok');
assert(!stylesOverridesLegacyMidCss.slice(0, 1800).includes('.rakDevicePerfCard{'), 'Čistý device performance blok se nesmí vrátit na čelo legacy-mid');
const adminServiceCssPosV1575 = indexHtml.indexOf('styles-admin-service.css');
const devicePerformanceCssPosV1575 = indexHtml.indexOf('styles-device-performance-settings.css');
const legacyMidCssPosV1575 = indexHtml.indexOf('styles-overrides-legacy-mid.css');
assert(adminServiceCssPosV1575 >= 0 && adminServiceCssPosV1575 < devicePerformanceCssPosV1575 && devicePerformanceCssPosV1575 < legacyMidCssPosV1575, 'Device performance owner musí zůstat na původní cascade hranici mezi admin service a legacy-mid');
"""
smoke = smoke.replace(insert_anchor, insert_anchor + new_guard, 1)
smoke_path.write_text(smoke, encoding='utf-8')

# Version bump only in canonical version owners.
app_path = ROOT / 'app.js'
app = app_path.read_text(encoding='utf-8')
assert app.count('1.5.74') >= 2, 'app.js nemá očekávanou v1.5.74 verzi'
app_path.write_text(app.replace('1.5.74', '1.5.75'), encoding='utf-8')

pkg_path = ROOT / 'package.json'
pkg = json.loads(pkg_path.read_text(encoding='utf-8'))
assert pkg.get('version') == '1.5.74', 'package.json není na 1.5.74'
pkg['version'] = '1.5.75'
pkg_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

sw_path = ROOT / 'sw.js'
sw = sw_path.read_text(encoding='utf-8')
assert "CACHE_VERSION = 'v1.5.74'" in sw, 'sw.js není na v1.5.74'
sw_path.write_text(sw.replace("CACHE_VERSION = 'v1.5.74'", "CACHE_VERSION = 'v1.5.75'", 1), encoding='utf-8')

print('v1.5.75 moved bytes:', len(block.encode('utf-8')))
print('v1.5.75 owner bytes:', len(owner.encode('utf-8')))
print('v1.5.75 legacy-mid bytes:', len(rest.encode('utf-8')))
print('v1.5.75 device performance CSS ownership move OK')
