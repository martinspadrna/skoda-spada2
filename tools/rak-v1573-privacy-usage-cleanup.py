from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
VERSION = '1.5.73'


def read(name):
    return (ROOT / name).read_text(encoding='utf-8')


def write(name, content):
    (ROOT / name).write_text(content, encoding='utf-8')


def require_replace(text, old, new, label, count=1):
    actual = text.count(old)
    assert actual == count, f'{label}: očekáváno {count} výskytů, nalezeno {actual}'
    return text.replace(old, new, count)


# 1) Supabase: úplně odstranit klientský subsystem starého Přehledu připojení / app-usage telemetry.
bridge_name = 'supabase-bridge.js'
bridge = read(bridge_name)
bridge_before = bridge

usage_constants = [
    "  const APP_USAGE_DEVICE_KEY = 'rak_app_usage_device_v1';\n",
    "  const APP_USAGE_STATUS_KEY = 'rak_app_usage_status_v1';\n",
    "  const APP_USAGE_MIN_INTERVAL_MS = 8 * 60 * 1000;\n",
    "  const APP_USAGE_TIMEOUT_MS = 8000;\n",
    "  const APP_USAGE_TELEMETRY_ENABLED = false;\n",
]
for line in usage_constants:
    assert line in bridge, f'chybí očekávaná APP_USAGE konstanta: {line.strip()}'
    bridge = bridge.replace(line, '', 1)

privacy_comment = (
    "  // Běžné používání aplikace není nutné pro její funkčnost. Neodesíláme proto\n"
    "  // účet, zařízení ani aktivní stránku do přehledu připojení bez výslovné volby uživatele.\n"
)
assert privacy_comment in bridge, 'chybí očekávaný privacy komentář APP_USAGE'
bridge = bridge.replace(privacy_comment, '', 1)

bridge, policy_removed = re.subn(
    r"^\s*\{ table: 'rak_usage_presence'.*\n",
    '',
    bridge,
    count=1,
    flags=re.MULTILINE,
)
assert policy_removed == 1, 'nepodařilo se odstranit rak_usage_presence z policy auditu'

usage_start = bridge.find('\n\n  function normalizeAppUsageStatus(raw)')
usage_end = bridge.find('\n\n  function normalizeBugReportType(value)', usage_start + 1)
assert usage_start >= 0 and usage_end > usage_start, 'nenalezena souvislá APP_USAGE funkční oblast'
usage_chunk = bridge[usage_start:usage_end]
for marker in [
    'function normalizeAppUsageStatus',
    'function ensureAppUsageDeviceKey',
    'function buildAppUsagePayload',
    'function shouldLogAppUsage',
    'async function recordAppUsageDirect',
    'function normalizeAppUsageRow',
    'async function loadAppUsageDirect',
    'function scheduleAppUsage',
    "rak_usage_presence_touch",
    "rak_usage_presence_admin",
]:
    assert marker in usage_chunk, f'APP_USAGE blok neobsahuje očekávanou kotvu {marker}'
bridge = bridge[:usage_start] + bridge[usage_end:]

api_start = bridge.find("    recordAppUsage: async (options = {}) => {")
api_end_marker = "    getAppUsageStatus: () => readAppUsageStatus(),\n"
api_end = bridge.find(api_end_marker, api_start + 1)
assert api_start >= 0 and api_end > api_start, 'nenalezen export APP_USAGE API metod'
api_end += len(api_end_marker)
bridge = bridge[:api_start] + bridge[api_end:]

bridge, alias_removed = re.subn(
    r"^\s*window\.(?:recordRakAppUsage|loadRakAppUsage|getRakAppUsageStatus).*\n",
    '',
    bridge,
    flags=re.MULTILINE,
)
assert alias_removed == 3, f'očekávány 3 veřejné APP_USAGE aliasy, odstraněno {alias_removed}'

bridge, diagnostics_removed = re.subn(
    r"^\s*appUsageStatus:\s*readAppUsageStatus\(\),\n",
    '',
    bridge,
    count=1,
    flags=re.MULTILINE,
)
assert diagnostics_removed == 1, 'nenalezen appUsageStatus v diagnostice bridge'

bridge, clear_removed = re.subn(
    r"^\s*clearDisabledAppUsageTelemetry\(\);\n",
    '',
    bridge,
    count=1,
    flags=re.MULTILINE,
)
assert clear_removed == 1, 'nenalezen init clearDisabledAppUsageTelemetry'

bridge, schedule_removed = re.subn(
    r"^\s*scheduleAppUsage\([^\n;]*\);\n",
    '',
    bridge,
    flags=re.MULTILINE,
)
assert schedule_removed == 6, f'očekáváno 6 runtime scheduleAppUsage volání, odstraněno {schedule_removed}'

for forbidden in [
    'APP_USAGE_',
    'AppUsage',
    'appUsageStatus',
    'recordAppUsage',
    'loadAppUsage',
    'scheduleAppUsage',
    'recordRakAppUsage',
    'loadRakAppUsage',
    'getRakAppUsageStatus',
    'rak_usage_presence',
    'app_usage.rpc',
]:
    assert forbidden not in bridge, f'v supabase-bridge.js zůstal privacy usage fragment: {forbidden}'
write(bridge_name, bridge)


# 2) Administrace / Servis: odstranit online počty zařízení/her/sessions a ponechat pouze údržbu appky.
service_name = 'admin-service-usage.js'
service = read(service_name)
old_service_anchor = '\n\nfunction formatAdminServiceCount'
rest_marker = 'function rakFormatDatetimeLocal'
service_prefix_end = service.find(old_service_anchor)
service_rest_start = service.find(rest_marker)
assert service_prefix_end > 0 and service_rest_start > service_prefix_end, 'nenalezena horní servisní oblast admin-service-usage.js'
service_prefix = service[:service_prefix_end]
service_rest = service[service_rest_start:]
new_service = r'''function adminServiceStatusItemHtml(label, value, detail, state) {
  const safeState = state || 'ok';
  return [
    '<div class="adminServiceStatusItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminServiceHtml() {
  const sync = typeof getSupabaseSyncStatus === 'function' ? getSupabaseSyncStatus() : null;
  const pwa = typeof getPwaHardeningStatus === 'function' ? getPwaHardeningStatus() : null;
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const syncLabel = offline ? 'offline' : (sync ? String(sync.label || sync.kind || sync.status || 'stav známý') : 'nenačteno');
  const updatePending = !!(pwa && pwa.updateToastVisible);
  const items = [
    {
      label: 'Synchronizace',
      value: syncLabel,
      detail: offline ? 'Zařízení je offline.' : 'Ruční synchronizace pracovních dat je dostupná tlačítkem níže.',
      state: offline ? 'warn' : (sync ? 'ok' : 'info')
    },
    {
      label: 'Aktualizace',
      value: updatePending ? 'čeká update' : 'bez čekajícího updatu',
      detail: 'Kontrola aktualizace ověří novou verzi PWA bez sledování používání.',
      state: updatePending ? 'warn' : 'ok'
    }
  ];
  return [
    '<div class="appMenuCard appMenuAdminCard adminServiceCard">',
    '  <div class="appMenuCardTitle">Servis / synchronizace</div>',
    '  <div class="appMenuText">',
    '    <div>Rychlá údržba appky: synchronizace pracovních dat, kontrola aktualizace, reporty chyb a export.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Servisní akce se spustí až po klepnutí na tlačítko.</div>',
    '  </div>',
    '  <div class="adminServiceStatus" id="adminServiceStatus">',
    '    <div class="appMenuSubTitle">Stav servisu</div>',
    '    <div class="adminServiceStatusGrid">',
    items.map((item) => adminServiceStatusItemHtml(item.label, item.value, item.detail, item.state)).join(''),
    '    </div>',
    '  </div>',
    '  <div class="adminServicePrivacyNote smallText">Servis nevede přehled připojených zařízení ani běžného používání aplikace.</div>',
    '  <div class="appMenuActionRow adminServiceActions">',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="service-sync-now">Vynutit synchronizaci</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="service-update-check">Kontrola aktualizace</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-reports">Reporty chyb</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="export">Export ZIP (stáhnout app)</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');
}'''
service = service_prefix + '\n\n' + new_service + '\n\n' + service_rest
for forbidden in [
    'getAdminServiceSnapshotCache',
    'loadAdminServiceSnapshotFromSupabase',
    'cleanupAdminExpiredInvites',
    'Hráčské profily',
    'Herní statistiky',
    'Aktivní session',
    'Čekající pozvánky',
    'theme ',
    'pozadí ',
    'online počty',
]:
    assert forbidden not in service, f'v admin servisu zůstal starý usage/game fragment: {forbidden}'
assert 'Servis nevede přehled připojených zařízení ani běžného používání aplikace.' in service
write(service_name, service)


# 3) Menu router: odstranit mrtvý usage mód a tlačítka, která načítala starý snapshot / herní pozvánky.
menu_name = 'app-menu.js'
menu = read(menu_name)
menu = require_replace(menu, "    'usage',\n", '', 'mrtvý usage admin mód')
for action in ['service-load-status', 'service-clean-invites']:
    pattern = re.compile(
        r"\n      if \(adminAction === '" + re.escape(action) + r"'\) \{\n.*?\n      \}\n",
        re.DOTALL,
    )
    menu, removed = pattern.subn('\n', menu, count=1)
    assert removed == 1, f'nenalezen handler {action}'
menu = require_replace(
    menu,
    "        if (statusEl) statusEl.textContent = 'Synchronizuji rozpis, hry a update…';",
    "        if (statusEl) statusEl.textContent = 'Synchronizuji pracovní data…';",
    'text service-sync-now',
)
menu = require_replace(
    menu,
    "        await loadAdminServiceSnapshotFromSupabase();\n",
    '',
    'snapshot po ruční synchronizaci',
)
for forbidden in ["    'usage',", 'service-load-status', 'service-clean-invites', 'loadAdminServiceSnapshotFromSupabase', 'cleanupAdminExpiredInvites']:
    assert forbidden not in menu, f'v app-menu.js zůstal starý servisní usage fragment: {forbidden}'
write(menu_name, menu)


# 4) Admin domovská stránka: text už nesmí slibovat Připojení.
renderer_name = 'app-menu-admin-renderer.js'
renderer = read(renderer_name)
renderer = require_replace(
    renderer,
    "    ? 'Připojení, reporty, synchronizace a správa adminů.'\n    : 'Připojení, reporty a synchronizace. Hesla a další adminy spravuje jen hlavní admin.';",
    "    ? 'Reporty, synchronizace, aktualizace a správa adminů.'\n    : 'Reporty, synchronizace a aktualizace. Hesla a další adminy spravuje jen hlavní admin.';",
    'admin service detail bez Připojení',
)
assert 'Připojení, reporty' not in renderer
write(renderer_name, renderer)


# 5) Nastavení soukromí: výslovně popsat nový stav bez běžné telemetry.
pages_name = 'app-menu-pages.js'
pages = read(pages_name)
pages = require_replace(
    pages,
    "        '  <div class=\"appMenuText\">RaK nepoužívá reklamní cookies ani rutinní sledování používání.</div>',",
    "        '  <div class=\"appMenuText\">RaK nepoužívá reklamní cookies ani rutinní sledování používání. Při běžném používání neodesílá přehled připojených zařízení ani navštívené části aplikace.</div>',",
    'privacy card text',
)
write(pages_name, pages)


# 6) CSS: odstranit všechny zbytky bývalého adminUsage/Přehledu připojení.
def strip_comments(text):
    return re.sub(r'/\*[\s\S]*?\*/', '', text)


def cleanup_admin_usage_css(css):
    removed_rules = 0
    while '.adminUsage' in css:
        found = False
        for match in re.finditer(r'([^{}]+)\{([^{}]*)\}', css):
            prelude_raw = match.group(1)
            prelude = strip_comments(prelude_raw).strip()
            if '.adminUsage' not in prelude or prelude.startswith('@'):
                continue
            selectors = [part.strip() for part in prelude.split(',') if part.strip()]
            assert selectors and all('.adminUsage' in selector for selector in selectors), (
                'smíšené adminUsage pravidlo vyžaduje ruční rozdělení: ' + prelude[:220]
            )
            css = css[:match.start()] + css[match.end():]
            removed_rules += 1
            found = True
            break
        assert found, 'nepodařilo se bezpečně odstranit další .adminUsage pravidlo'

    # Smaž prázdné grouping at-rules vzniklé po odstranění vnitřních usage pravidel.
    previous = None
    while previous != css:
        previous = css
        css = re.sub(r'@media\s*[^{}]+\{\s*\}', '', css)
        css = re.sub(r'@supports\s*[^{}]+\{\s*\}', '', css)

    # Smaž jen komentáře, které přímo dokumentovaly bývalý Přehled připojení.
    comment_pattern = re.compile(r'/\*[\s\S]*?\*/')
    def keep_or_drop(match):
        comment = match.group(0)
        low = comment.lower()
        if 'přehled připojení' in low or 'anonymní využití aplikace' in low:
            return ''
        return comment
    css = comment_pattern.sub(keep_or_drop, css)
    return css, removed_rules

menu_css_name = 'styles-menu-polish.css'
menu_css = read(menu_css_name)
menu_css_before = menu_css
menu_css, admin_usage_rules_removed = cleanup_admin_usage_css(menu_css)
assert '.adminUsage' not in menu_css
assert 'Přehled připojení' not in menu_css
write(menu_css_name, menu_css)

# Admin service owner už nesmí držet metriky starého online přehledu.
admin_service_css = '''/* RaK v1.5.73 – owner: Administrace servis / privacy-safe stav */
.adminServicePrivacyNote{
  margin-top:10px !important;
  padding:9px 11px !important;
  border-radius:14px !important;
  border:1px solid rgba(255,255,255,.08) !important;
  background:rgba(255,255,255,.035) !important;
  color:rgba(238,247,238,.72) !important;
}
.adminServiceActions{
  margin-top:12px !important;
}
'''
write('styles-admin-service.css', admin_service_css)


# 7) Odstranit starý usage smoke a SQL návrh – runtime ani build je už nesmí držet.
for stale_name in ['app-usage-smoke-v963.js', 'assets/docs/sql/supabase_app_usage_v963.sql']:
    path = ROOT / stale_name
    assert path.exists(), f'chybí očekávaný starý soubor {stale_name}'
    path.unlink()


# 8) package/version.
pkg_name = 'package.json'
pkg = json.loads(read(pkg_name))
assert pkg.get('version') == '1.5.72', f'neočekávaná package verze {pkg.get("version")}'
check = str(pkg.get('scripts', {}).get('check', ''))
needle = ' && node --check app-usage-smoke-v963.js'
assert needle in check, 'app-usage smoke není v npm check podle očekávání'
pkg['scripts']['check'] = check.replace(needle, '', 1)
assert pkg['scripts'].get('test:app-usage') == 'node app-usage-smoke-v963.js', 'neočekávaný test:app-usage script'
del pkg['scripts']['test:app-usage']
pkg['version'] = VERSION
write(pkg_name, json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')

app = read('app.js')
assert app.count('1.5.72') >= 2, 'app.js nemá očekávané v1.5.72 kotvy'
write('app.js', app.replace('1.5.72', VERSION))

sw = read('sw.js')
sw = require_replace(sw, "CACHE_VERSION = 'v1.5.72'", "CACHE_VERSION = 'v1.5.73'", 'service worker cache verze')
write('sw.js', sw)


# 9) Permanentní critical runtime guard privacy cleanupu.
smoke_name = 'tools/critical-runtime-smoke.mjs'
smoke = read(smoke_name)

# Starý v1.5.60 assert musí od v1.5.73 hlídat pravý opak.
smoke = require_replace(
    smoke,
    "assert(stylesMenuPolishCss.includes('#menu .adminUsageCard'), 'Menu polish musí dál vlastnit admin usage karty');",
    "assert(!stylesMenuPolishCss.includes('.adminUsage'), 'Odstraněný Přehled připojení se nesmí vrátit do menu CSS');",
    'critical smoke adminUsage CSS assert',
)

old_admin_service_asserts = """assert(stylesAdminServiceCss.includes('RaK v1.5.72 – owner: Administrace servis'), 'Chybí v1.5.72 admin service owner marker');
assert(stylesAdminServiceCss.includes('.adminServiceGrid{') && stylesAdminServiceCss.includes('.adminServiceMetric{') && stylesAdminServiceCss.includes('.adminServiceActions{'), 'Admin service owner musí zachovat servisní blok');
assert(!stylesAdminServiceCss.includes('.dashboardSyncBadge') && !stylesAdminServiceCss.includes('.rakDevicePerfCard'), 'Admin service owner nesmí obsahovat Dashboard sync ani následující Nastavení/Výkon');"""
new_admin_service_asserts = """assert(stylesAdminServiceCss.includes('RaK v1.5.73 – owner: Administrace servis / privacy-safe stav'), 'Chybí v1.5.73 privacy-safe admin service owner marker');
assert(stylesAdminServiceCss.includes('.adminServicePrivacyNote{') && stylesAdminServiceCss.includes('.adminServiceActions{'), 'Admin service owner musí zachovat privacy-safe servisní blok');
assert(!stylesAdminServiceCss.includes('.adminServiceGrid') && !stylesAdminServiceCss.includes('.adminServiceMetric'), 'Staré online metriky se nesmí vrátit do admin service CSS');
assert(!stylesAdminServiceCss.includes('.dashboardSyncBadge') && !stylesAdminServiceCss.includes('.rakDevicePerfCard'), 'Admin service owner nesmí obsahovat Dashboard sync ani následující Nastavení/Výkon');"""
smoke = require_replace(smoke, old_admin_service_asserts, new_admin_service_asserts, 'critical smoke admin service owner')

read_anchor = "const appMenuPagesJs = read('app-menu-pages.js');\n"
assert read_anchor in smoke, 'nenalezena appMenuPagesJs read kotva'
smoke = smoke.replace(read_anchor, read_anchor + "const adminServiceUsageJsV1573 = read('admin-service-usage.js');\n", 1)

privacy_anchor = "assert(appMenuJs.includes('function rakAdminMenuResolveActiveAccountId()'), 'Nativní resolver admin účtu musí být přímo v app-menu.js');\n"
assert privacy_anchor in smoke, 'nenalezena bezpečná privacy assert kotva'
privacy_asserts = r"""assert(!supabaseBridgeJsV1567.includes('APP_USAGE_') && !supabaseBridgeJsV1567.includes('rak_usage_presence') && !supabaseBridgeJsV1567.includes('recordAppUsage') && !supabaseBridgeJsV1567.includes('loadAppUsage'), 'v1.5.73 nesmí vrátit klientský usage tracking do Supabase bridge');
assert(!supabaseBridgeJsV1567.includes('scheduleAppUsage') && !supabaseBridgeJsV1567.includes('appUsageStatus'), 'v1.5.73 nesmí plánovat ani diagnostikovat usage telemetry');
assert(!appMenuJs.includes("    'usage',") && !appMenuJs.includes('service-load-status') && !appMenuJs.includes('service-clean-invites'), 'Mrtvý Přehled připojení / herní servis se nesmí vrátit do menu routeru');
assert(!appMenuAdminRendererJs.includes('Připojení, reporty'), 'Administrace nesmí znovu nabízet Přehled připojení');
assert(adminServiceUsageJsV1573.includes('Servis nevede přehled připojených zařízení ani běžného používání aplikace.'), 'Servis musí výslovně držet privacy-safe význam');
assert(!adminServiceUsageJsV1573.includes('Hráčské profily') && !adminServiceUsageJsV1573.includes('Aktivní session') && !adminServiceUsageJsV1573.includes('Čekající pozvánky'), 'Staré herní/usage metriky se nesmí vrátit do Servisu');
assert(appMenuPagesJs.includes('Při běžném používání neodesílá přehled připojených zařízení ani navštívené části aplikace.'), 'Nastavení Soukromí musí popisovat stav bez běžné telemetry');
assert(!fs.existsSync(path.join(root, 'app-usage-smoke-v963.js')), 'Starý app-usage smoke se nesmí vrátit');
assert(!fs.existsSync(path.join(root, 'assets/docs/sql/supabase_app_usage_v963.sql')), 'Starý SQL návrh Přehledu připojení se nesmí vrátit');
assert(!read('package.json').includes('app-usage-smoke-v963.js') && !read('package.json').includes('test:app-usage'), 'Package scripts nesmí vrátit app-usage test');
"""
smoke = smoke.replace(privacy_anchor, privacy_anchor + privacy_asserts, 1)
write(smoke_name, smoke)


# 10) Finální focused invarianty.
assert '1.5.73' in read('app.js')
assert json.loads(read('package.json'))['version'] == '1.5.73'
assert "CACHE_VERSION = 'v1.5.73'" in read('sw.js')
assert '.adminUsage' not in read('styles-menu-polish.css')
assert not (ROOT / 'app-usage-smoke-v963.js').exists()
assert not (ROOT / 'assets/docs/sql/supabase_app_usage_v963.sql').exists()

print('v1.5.73 supabase bridge bytes:', len(bridge_before.encode('utf-8')), '->', len(bridge.encode('utf-8')))
print('v1.5.73 removed APP_USAGE block bytes:', len(usage_chunk.encode('utf-8')))
print('v1.5.73 adminUsage CSS rules removed:', admin_usage_rules_removed)
print('v1.5.73 styles-menu-polish bytes:', len(menu_css_before.encode('utf-8')), '->', len(menu_css.encode('utf-8')))
print('v1.5.73 privacy/usage cleanup OK')
