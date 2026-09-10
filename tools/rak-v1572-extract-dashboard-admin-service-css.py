from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
VERSION = '1.5.72'


def read(name):
    return (ROOT / name).read_text(encoding='utf-8')


def write(name, content):
    (ROOT / name).write_text(content, encoding='utf-8')


legacy_name = 'styles-overrides-legacy-mid.css'
legacy = read(legacy_name)
start_marker = '/* v.1.1 (725) – dashboard ruční sync + administrace servis */'
next_marker = '/* v.1.1 (725) – výkon zařízení / Láďův režim v nastavení */'
assert legacy.startswith(start_marker), 'legacy-mid už nezačíná očekávaným Dashboard/admin servis blokem'
end = legacy.find(next_marker)
assert end > 0, 'nenalezena hranice následujícího výkonového bloku v Nastavení'
chunk = legacy[:end]
admin_start = chunk.find('.adminServiceGrid{')
assert admin_start > 0, 'nenalezena hranice adminServiceGrid'

dashboard_chunk = chunk[:admin_start]
admin_chunk = chunk[admin_start:]
assert '.dashboardSyncBadge{' in dashboard_chunk and '.dashboardSyncBadge:active{' in dashboard_chunk
assert '.adminService' not in dashboard_chunk, 'Dashboard owner nesmí obsahovat adminService'
assert '.adminServiceGrid{' in admin_chunk and '.adminServiceMetric{' in admin_chunk and '.adminServiceActions{' in admin_chunk
assert '.dashboardSyncBadge' not in admin_chunk, 'Admin service owner nesmí obsahovat Dashboard sync'
assert 'rakDevicePerfCard' not in admin_chunk, 'Admin service owner nesmí přetáhnout následující Nastavení/Výkon'

owner_dashboard = '/* RaK v1.5.72 – owner: Dashboard ruční sync */\n' + dashboard_chunk
owner_admin = '/* RaK v1.5.72 – owner: Administrace servis */\n' + admin_chunk
write('styles-dashboard-sync.css', owner_dashboard)
write('styles-admin-service.css', owner_admin)
write(legacy_name, legacy[end:])

index_name = 'index.html'
index = read(index_name)
needle = '<link rel="stylesheet" href="styles-low-end-performance.css">\n<link rel="stylesheet" href="styles-overrides-legacy-mid.css">'
replacement = '<link rel="stylesheet" href="styles-low-end-performance.css">\n<link rel="stylesheet" href="styles-dashboard-sync.css">\n<link rel="stylesheet" href="styles-admin-service.css">\n<link rel="stylesheet" href="styles-overrides-legacy-mid.css">'
assert needle in index, 'nenalezena očekávaná cascade hranice v index.html'
index = index.replace(needle, replacement, 1)
write(index_name, index)

smoke_name = 'tools/critical-runtime-smoke.mjs'
smoke = read(smoke_name)
read_anchor = "const stylesLowEndPerformanceCss = read('styles-low-end-performance.css');\n"
assert read_anchor in smoke, 'nenalezena read kotva low-end owneru'
smoke = smoke.replace(
    read_anchor,
    read_anchor + "const stylesDashboardSyncCss = read('styles-dashboard-sync.css');\nconst stylesAdminServiceCss = read('styles-admin-service.css');\n",
    1,
)
obsolete_v1571 = "assert(stylesOverridesLegacyMidCss.trimStart().startsWith('/* v.1.1 (725) – dashboard ruční sync + administrace servis */'), 'legacy-mid musí po v1.5.71 začínat přesně Dashboard/admin servis blokem');\n"
assert obsolete_v1571 in smoke, 'nenalezena překonaná v1.5.71 legacy-mid kotva'
smoke = smoke.replace(obsolete_v1571, '', 1)
assert_anchor = "assert(rotationMonthCssPosV1571 >= 0 && rotationMonthCssPosV1571 < lowEndPerformanceCssPosV1571 && lowEndPerformanceCssPosV1571 < legacyMidCssPosV1571, 'Low-end performance owner musí zůstat na původní cascade hranici před legacy-mid');\n"
assert assert_anchor in smoke, 'nenalezena v1.5.71 assert kotva'
new_asserts = r"""assert(stylesDashboardSyncCss.includes('RaK v1.5.72 – owner: Dashboard ruční sync'), 'Chybí v1.5.72 Dashboard sync owner marker');
assert(stylesDashboardSyncCss.includes('.dashboardSyncBadge{') && stylesDashboardSyncCss.includes('.dashboardSyncBadge:active{'), 'Dashboard sync owner musí zachovat badge pravidla');
assert(!stylesDashboardSyncCss.includes('.adminService'), 'Dashboard sync owner nesmí obsahovat admin servis');
assert(stylesAdminServiceCss.includes('RaK v1.5.72 – owner: Administrace servis'), 'Chybí v1.5.72 admin service owner marker');
assert(stylesAdminServiceCss.includes('.adminServiceGrid{') && stylesAdminServiceCss.includes('.adminServiceMetric{') && stylesAdminServiceCss.includes('.adminServiceActions{'), 'Admin service owner musí zachovat servisní blok');
assert(!stylesAdminServiceCss.includes('.dashboardSyncBadge') && !stylesAdminServiceCss.includes('.rakDevicePerfCard'), 'Admin service owner nesmí obsahovat Dashboard sync ani následující Nastavení/Výkon');
assert(!stylesOverridesLegacyMidCss.includes('.dashboardSyncBadge{') && !stylesOverridesLegacyMidCss.includes('.adminServiceGrid{'), 'Dashboard sync/admin servis se nesmí vrátit do legacy-mid');
assert(stylesOverridesLegacyMidCss.trimStart().startsWith('/* v.1.1 (725) – výkon zařízení / Láďův režim v nastavení */'), 'legacy-mid musí po v1.5.72 začínat přesně Nastavení/Výkon blokem');
const lowEndPerformanceCssPosV1572 = indexHtml.indexOf('styles-low-end-performance.css');
const dashboardSyncCssPosV1572 = indexHtml.indexOf('styles-dashboard-sync.css');
const adminServiceCssPosV1572 = indexHtml.indexOf('styles-admin-service.css');
const legacyMidCssPosV1572 = indexHtml.indexOf('styles-overrides-legacy-mid.css');
assert(lowEndPerformanceCssPosV1572 >= 0 && lowEndPerformanceCssPosV1572 < dashboardSyncCssPosV1572 && dashboardSyncCssPosV1572 < adminServiceCssPosV1572 && adminServiceCssPosV1572 < legacyMidCssPosV1572, 'Dashboard sync a admin service ownery musí zůstat na původní cascade hranici před legacy-mid');
"""
smoke = smoke.replace(assert_anchor, assert_anchor + new_asserts, 1)
write(smoke_name, smoke)

app = read('app.js')
assert '1.5.71' in app
write('app.js', app.replace('1.5.71', VERSION))

pkg = json.loads(read('package.json'))
assert pkg.get('version') == '1.5.71'
pkg['version'] = VERSION
write('package.json', json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')

sw = read('sw.js')
assert "CACHE_VERSION = 'v1.5.71'" in sw
write('sw.js', sw.replace("CACHE_VERSION = 'v1.5.71'", "CACHE_VERSION = 'v1.5.72'", 1))

assert read('styles-dashboard-sync.css').split('\n', 1)[1] == dashboard_chunk
assert read('styles-admin-service.css').split('\n', 1)[1] == admin_chunk
assert read(legacy_name).startswith(next_marker)

sizes = [len(read(name).encode('utf-8')) for name in ['styles-overrides-legacy-early.css', legacy_name, 'styles-overrides-legacy-late.css']]
print('v1.5.72 legacy bytes:', sizes, 'total', sum(sizes))
print('v1.5.72 dashboard sync owner bytes:', len(owner_dashboard.encode('utf-8')))
print('v1.5.72 admin service owner bytes:', len(owner_admin.encode('utf-8')))
print('v1.5.72 Dashboard sync + admin service ownership extraction OK')
