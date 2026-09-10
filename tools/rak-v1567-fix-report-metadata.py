from pathlib import Path

ROOT = Path('.')
BUG = ROOT / 'app-menu-bug-report.js'
ADMIN = ROOT / 'admin-reports.js'
BRIDGE = ROOT / 'supabase-bridge.js'
CRITICAL = ROOT / 'tools/critical-runtime-smoke.mjs'
APP = ROOT / 'app.js'
PKG = ROOT / 'package.json'
SW = ROOT / 'sw.js'

bug = BUG.read_text(encoding='utf-8')
admin = ADMIN.read_text(encoding='utf-8')
bridge = BRIDGE.read_text(encoding='utf-8')
critical = CRITICAL.read_text(encoding='utf-8')

# Sender: one unified appearance + exact technical build.
old_bug_head = """function buildBugReportPayload() {\n  const account = getBugReportAccount();\n  const typeEl = document.getElementById('bugReportType');\n  const textEl = document.getElementById('bugReportText');\n  const type = String(typeEl && typeEl.value || 'Chyba').trim() || 'Chyba';\n  const text = String(textEl && textEl.value || '').trim();\n  const version = getRakCurrentAppVersion() || '—';\n  const theme = String(typeof getThemePreference === 'function' ? getThemePreference() : (document.documentElement.dataset.rakTheme || '—'));\n  const background = String(typeof getBackgroundPreference === 'function' ? getBackgroundPreference() : (document.documentElement.dataset.rakBackground || '—'));\n  return {\n"""
new_bug_head = """function getBugReportBuildVersion() {\n  try {\n    const build = String((typeof window !== 'undefined' && window.RAK_PWA_BUILD) || '').trim().replace(/^v/i, '');\n    if (build) return build;\n  } catch (err) {}\n  return String((typeof getRakCurrentAppVersion === 'function' ? getRakCurrentAppVersion() : '') || '—').trim() || '—';\n}\n\nfunction getBugReportAppearanceMeta() {\n  let id = '';\n  try {\n    if (typeof getAppearancePreference === 'function') id = String(getAppearancePreference() || '').trim();\n  } catch (err) {}\n  if (!id) {\n    try { id = String(document.documentElement.dataset.rakTheme || document.documentElement.dataset.rakBackground || '').trim(); } catch (err) {}\n  }\n  let label = '';\n  try {\n    const defs = Array.isArray(window.RAK_APPEARANCE_DEFS) ? window.RAK_APPEARANCE_DEFS : [];\n    const item = defs.find((entry) => String(entry && entry.id || '') === id);\n    label = String(item && item.label || '').trim();\n  } catch (err) {}\n  return { id: id || '—', label: label || id || '—' };\n}\n\nfunction buildBugReportPayload() {\n  const account = getBugReportAccount();\n  const typeEl = document.getElementById('bugReportType');\n  const textEl = document.getElementById('bugReportText');\n  const type = String(typeEl && typeEl.value || 'Chyba').trim() || 'Chyba';\n  const text = String(textEl && textEl.value || '').trim();\n  const version = getBugReportBuildVersion();\n  const appearance = getBugReportAppearanceMeta();\n  return {\n"""
if old_bug_head not in bug:
    raise RuntimeError('Bug-report payload header baseline not found')
bug = bug.replace(old_bug_head, new_bug_head, 1)

old_bug_fields = """    page: String(document.querySelector('.page.active')?.id || '—'),\n    game: String((typeof app !== 'undefined' && app.activeGameShell) || ''),\n    theme,\n    background,\n    online: !!(typeof navigator !== 'undefined' && navigator.onLine),\n"""
new_bug_fields = """    page: String(document.querySelector('.page.active')?.id || '—'),\n    game: String((typeof app !== 'undefined' && app.activeGameShell) || ''),\n    appearanceId: appearance.id,\n    appearanceLabel: appearance.label,\n    online: !!(typeof navigator !== 'undefined' && navigator.onLine),\n"""
if old_bug_fields not in bug:
    raise RuntimeError('Bug-report legacy theme/background fields baseline not found')
bug = bug.replace(old_bug_fields, new_bug_fields, 1)

old_format = "    'Vzhled aplikace: ' + String((typeof getAppearancePreference === 'function' ? getAppearancePreference() : report.theme) || '—'),"
new_format = "    'Vzhled aplikace: ' + String(report.appearanceLabel || report.appearanceId || '—'),"
if old_format not in bug:
    raise RuntimeError('Bug-report formatted appearance baseline not found')
bug = bug.replace(old_format, new_format, 1)
BUG.write_text(bug, encoding='utf-8')

# Supabase: stop writing separate theme/background keys for new/queued reports.
old_device = """    const deviceInfo = {\n      theme: String(source.theme || '').slice(0, 80),\n      background: String(source.background || '').slice(0, 80),\n      online: !!source.online,\n"""
new_device = """    const legacyAppearanceId = String(source.theme || source.background || '').trim();\n    const deviceInfo = {\n      appearanceId: String(source.appearanceId || source.appearance || legacyAppearanceId || '').slice(0, 80),\n      appearanceLabel: String(source.appearanceLabel || '').slice(0, 120),\n      online: !!source.online,\n"""
if old_device not in bridge:
    raise RuntimeError('Supabase bug-report deviceInfo baseline not found')
bridge = bridge.replace(old_device, new_device, 1)
BRIDGE.write_text(bridge, encoding='utf-8')

# Admin: render exactly one appearance item; normalize old same-value theme/background reports.
insert_after = """function normalizeAdminReportStatusLabel(value) {\n  const raw = String(value || '').toLowerCase();\n  if (raw === 'seen') return 'Viděno';\n  if (raw === 'done') return 'Hotovo';\n  if (raw === 'ignored') return 'Ignorovat';\n  return 'Nové';\n}\n"""
helpers = """\nfunction formatAdminReportVersion(value) {\n  const raw = String(value || '').trim();\n  if (!raw) return '';\n  return /^v/i.test(raw) ? raw : ('v' + raw);\n}\n\nfunction resolveAdminReportAppearance(deviceInfo) {\n  const device = deviceInfo && typeof deviceInfo === 'object' ? deviceInfo : {};\n  const explicitId = String(device.appearanceId || device.appearance || '').trim();\n  const legacyTheme = String(device.theme || '').trim();\n  const legacyBackground = String(device.background || '').trim();\n  let id = explicitId;\n  let legacyAmbiguous = false;\n  if (!id && legacyTheme && legacyBackground && legacyTheme !== legacyBackground) legacyAmbiguous = true;\n  if (!id && !legacyAmbiguous) id = legacyTheme || legacyBackground;\n  let label = String(device.appearanceLabel || '').trim();\n  if (!label && id) {\n    try {\n      const defs = Array.isArray(window.RAK_APPEARANCE_DEFS) ? window.RAK_APPEARANCE_DEFS : [];\n      const item = defs.find((entry) => String(entry && entry.id || '') === id);\n      label = String(item && item.label || '').trim();\n    } catch (err) {}\n  }\n  if (legacyAmbiguous) return { id: '', label: 'starší oddělené nastavení' };\n  return { id, label: label || id };\n}\n"""
if insert_after not in admin:
    raise RuntimeError('Admin report helper anchor not found')
if 'function resolveAdminReportAppearance(' not in admin:
    admin = admin.replace(insert_after, insert_after + helpers, 1)

old_meta = """    const device = row.device_info && typeof row.device_info === 'object' ? row.device_info : {};\n    const meta = [\n      row.app_version ? String(row.app_version) : '',\n      row.route ? String(row.route) : '',\n      device.theme ? ('Theme ' + String(device.theme)) : '',\n      device.background ? ('Pozadí ' + String(device.background)) : ''\n    ].filter(Boolean).join(' · ');\n"""
new_meta = """    const device = row.device_info && typeof row.device_info === 'object' ? row.device_info : {};\n    const appearance = resolveAdminReportAppearance(device);\n    const meta = [\n      row.app_version ? formatAdminReportVersion(row.app_version) : '',\n      row.route ? String(row.route) : '',\n      appearance.label ? ('Vzhled ' + String(appearance.label)) : ''\n    ].filter(Boolean).join(' · ');\n"""
if old_meta not in admin:
    raise RuntimeError('Admin report metadata baseline not found')
admin = admin.replace(old_meta, new_meta, 1)

old_local_device = """      const device = {\n        theme: report.theme || '',\n        background: report.background || '',\n        source: 'local-backup',\n"""
new_local_device = """      const legacyAppearanceId = String(report.theme || report.background || '').trim();\n      const device = {\n        appearanceId: report.appearanceId || report.appearance || legacyAppearanceId || '',\n        appearanceLabel: report.appearanceLabel || '',\n        source: 'local-backup',\n"""
if old_local_device not in admin:
    raise RuntimeError('Admin local report device baseline not found')
admin = admin.replace(old_local_device, new_local_device, 1)
ADMIN.write_text(admin, encoding='utf-8')

# Permanent critical guard.
read_anchor = "const stylesShiftReportCss = read('styles-shift-report.css');"
reads = """\nconst appMenuBugReportJsV1567 = read('app-menu-bug-report.js');\nconst adminReportsJsV1567 = read('admin-reports.js');\nconst supabaseBridgeJsV1567 = read('supabase-bridge.js');"""
if read_anchor not in critical:
    raise RuntimeError('Critical read anchor missing')
if 'appMenuBugReportJsV1567' not in critical:
    critical = critical.replace(read_anchor, read_anchor + reads, 1)

assert_anchor = "assert(stylesShiftReportCss.includes('.appMenuReportCard'), 'Shift-report owner musí obsahovat report card CSS');"
if assert_anchor not in critical:
    raise RuntimeError('Critical assertion anchor missing')
checks = """\nassert(appMenuBugReportJsV1567.includes('getBugReportBuildVersion'), 'v1.5.67 report musí používat přesný build');\nassert(appMenuBugReportJsV1567.includes('appearanceId: appearance.id'), 'v1.5.67 report musí ukládat jednotný appearanceId');\nassert(!appMenuBugReportJsV1567.includes('const theme = String(typeof getThemePreference'), 'v1.5.67 report nesmí dál skládat samostatný theme');\nassert(!appMenuBugReportJsV1567.includes('const background = String(typeof getBackgroundPreference'), 'v1.5.67 report nesmí dál skládat samostatné pozadí');\nassert(adminReportsJsV1567.includes("appearance.label ? ('Vzhled ' + String(appearance.label))"), 'Admin report musí zobrazovat jediný Vzhled');\nassert(!adminReportsJsV1567.includes("device.theme ? ('Theme ' + String(device.theme))"), 'Admin report nesmí zobrazovat legacy Theme');\nassert(!adminReportsJsV1567.includes("device.background ? ('Pozadí ' + String(device.background))"), 'Admin report nesmí zobrazovat legacy Pozadí');\nassert(supabaseBridgeJsV1567.includes('appearanceId: String(source.appearanceId'), 'Supabase report payload musí ukládat appearanceId');\nassert(!supabaseBridgeJsV1567.includes("theme: String(source.theme || '').slice(0, 80)"), 'Supabase report payload nesmí ukládat samostatný theme');\n"""
if 'v1.5.67 report musí používat přesný build' not in critical:
    critical = critical.replace(assert_anchor, assert_anchor + checks, 1)
CRITICAL.write_text(critical, encoding='utf-8')

# Version bump.
app = APP.read_text(encoding='utf-8')
if '1.5.66' not in app:
    raise RuntimeError('app baseline is not 1.5.66')
app = app.replace('const RAK_MODULE_CACHE_VERSION = "1.5.66";', 'const RAK_MODULE_CACHE_VERSION = "1.5.67";', 1)
app = app.replace('const RAK_DEV_UPDATE_BUILD = "v1.5.66";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.67";', 1)
APP.write_text(app, encoding='utf-8')

pkg = PKG.read_text(encoding='utf-8')
if '"version": "1.5.66"' not in pkg:
    raise RuntimeError('package baseline is not 1.5.66')
PKG.write_text(pkg.replace('"version": "1.5.66"', '"version": "1.5.67"', 1), encoding='utf-8')

sw = SW.read_text(encoding='utf-8')
if "const CACHE_VERSION = 'v1.5.66';" not in sw:
    raise RuntimeError('sw baseline is not v1.5.66')
SW.write_text(sw.replace("const CACHE_VERSION = 'v1.5.66';", "const CACHE_VERSION = 'v1.5.67';", 1), encoding='utf-8')

print('v1.5.67 report metadata migration OK')
