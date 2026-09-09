from pathlib import Path


def replace_exact(path, old, new, count=1):
    p = Path(path)
    text = p.read_text()
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f'{path}: expected {count} occurrence(s), found {actual}: {old!r}')
    p.write_text(text.replace(old, new, count))


replace_exact('app.js', 'const RAK_MODULE_CACHE_VERSION = "1.5.45";', 'const RAK_MODULE_CACHE_VERSION = "1.5.46";')
replace_exact('app.js', 'const RAK_DEV_UPDATE_BUILD = "v1.5.45";', 'const RAK_DEV_UPDATE_BUILD = "v1.5.46";')
replace_exact('package.json', '"version": "1.5.45"', '"version": "1.5.46"')
replace_exact('sw.js', "const CACHE_VERSION = 'v1.5.45';", "const CACHE_VERSION = 'v1.5.46';")
replace_exact('app.js', '    "rak-profile-settings-fix.js",\n', '')
replace_exact('app.js', '    "rak-admin-menu-fix.js",\n', '')

marker = 'function getRakAdminExportMetadataSnapshot(monthKey) {'
native_profile = r'''function getAppMenuProfileSettingsProfile() {
  try {
    if (typeof window.rakUserProfileGet === 'function') {
      const profile = window.rakUserProfileGet();
      if (profile && profile.accountNumber && profile.fullName) return profile;
    }
  } catch (err) {}
  try {
    if (typeof app === 'object' && app) {
      const accountNumber = String(app.activeAccountId || (app.gamesProfile && app.gamesProfile.activeAccountId) || '').trim();
      const fullName = String(app.activeAccountName || '').trim();
      if (accountNumber && fullName) return { accountNumber, fullName };
    }
  } catch (err) {}
  return null;
}

function ensureAppMenuProfileSettingsStyles() {
  const styleId = 'rak-profile-settings-native-style-v1';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = [
    '.rakProfileSettingsCard{overflow:hidden}',
    '.rakProfileSettingsIdentity{display:grid;gap:4px;margin-top:4px;padding:14px 15px;border:1px solid rgba(255,255,255,.10);border-radius:16px;background:rgba(255,255,255,.035)}',
    '.rakProfileSettingsIdentity strong{font-size:17px;line-height:1.25;overflow-wrap:anywhere}',
    '.rakProfileSettingsIdentity span{font-size:12px;opacity:.68;font-variant-numeric:tabular-nums}',
    '.rakProfileSettingsEmpty{padding:14px 15px;border:1px dashed rgba(255,255,255,.14);border-radius:16px;font-size:13px;opacity:.78}',
    '.rakProfileSettingsActions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}',
    '.rakProfileSettingsActions .appMenuAction{flex:1 1 140px}'
  ].join('');
  document.head.appendChild(style);
}

function buildGamesProfileSettingsHtml() {
  ensureAppMenuProfileSettingsStyles();
  const profile = getAppMenuProfileSettingsProfile();
  if (profile) {
    return [
      '<div class="appMenuCard appMenuSettingsCard appMenuProfileCard rakProfileSettingsCard" id="gamesAccountCard">',
      '  <div class="appMenuCardTitle">Profil a přihlášení</div>',
      '  <div class="rakProfileSettingsIdentity">',
      '    <strong>' + escapeHtml(profile.fullName) + '</strong>',
      '    <span>Osobní číslo: ' + escapeHtml(profile.accountNumber) + '</span>',
      '  </div>',
      '  <div class="rakProfileSettingsActions">',
      '    <button type="button" class="appMenuAction" data-rak-profile-action="logout">Odhlásit</button>',
      '  </div>',
      '</div>'
    ].join('');
  }
  return [
    '<div class="appMenuCard appMenuSettingsCard appMenuProfileCard rakProfileSettingsCard" id="gamesAccountCard">',
    '  <div class="appMenuCardTitle">Profil a přihlášení</div>',
    '  <div class="rakProfileSettingsEmpty">Pro používání RaK je nutné přihlášení.</div>',
    '</div>'
  ].join('');
}

function appMenuHandleProfileSettingsAction(event) {
  const target = event.target && event.target.closest ? event.target.closest('[data-rak-profile-action]') : null;
  if (!target || String(target.getAttribute('data-rak-profile-action') || '') !== 'logout') return;
  try { if (typeof window.rakAdminLock === 'function') window.rakAdminLock({ clearPersistent: true }); } catch (err) {}
  try { if (typeof window.rakUserProfileClear === 'function') window.rakUserProfileClear(); } catch (err) {}
  try {
    if (typeof window.rakAuthGateEnsureLogin === 'function') window.rakAuthGateEnsureLogin();
    else if (typeof window.installRakLoginSplash === 'function') window.installRakLoginSplash(true);
  } catch (err) {}
}

if (!window.__rakAppMenuProfileSettingsBound) {
  window.__rakAppMenuProfileSettingsBound = true;
  document.addEventListener('click', appMenuHandleProfileSettingsAction, true);
}
window.buildGamesProfileSettingsHtml = buildGamesProfileSettingsHtml;
window.buildRakProfileSettingsHtml = buildGamesProfileSettingsHtml;

'''
p = Path('app-menu.js')
text = p.read_text()
if text.count(marker) != 1:
    raise SystemExit('app-menu.js: admin metadata marker not unique')
if 'function buildGamesProfileSettingsHtml()' in text:
    raise SystemExit('app-menu.js: profile builder already exists')
p.write_text(text.replace(marker, native_profile + marker, 1))

old_admin = "function appMenuShouldShowAdminEntry() {\n  const activeId = typeof rakAdminGetActiveAccountId === 'function' ? String(rakAdminGetActiveAccountId() || '').trim() : '';"
new_admin = """function rakAdminMenuResolveActiveAccountId() {
  let activeId = '';
  try {
    if (typeof rakAdminGetActiveAccountId === 'function') activeId = String(rakAdminGetActiveAccountId() || '').trim();
  } catch (err) {}
  if (!activeId) {
    try {
      const profile = typeof window.rakUserProfileGet === 'function' ? window.rakUserProfileGet() : null;
      activeId = String(profile && profile.accountNumber || '').trim();
    } catch (err) {}
  }
  if (!activeId) {
    try { activeId = String(app && app.activeAccountId || '').trim(); } catch (err) {}
  }
  return activeId;
}

function appMenuShouldShowAdminEntry() {
  const activeId = rakAdminMenuResolveActiveAccountId();"""
replace_exact('app-menu.js', old_admin, new_admin)

replace_exact('index.html', '  <script src="assets/rak-memory-total-time-fix.js?v=1.155"></script>\n', '')
replace_exact('tools/defer-heavy-libs.mjs', '  /\\n?\\s*<script\\s+src="assets\\/rak-memory-total-time-fix\\.js[^\\"]*"[^>]*><\\/script>/\n', '')
replace_exact('tools/defer-heavy-libs.mjs', "if (/assets\\/rak-memory-total-time-fix\\.js/.test(html)) {\n  throw new Error('[defer-heavy-libs] Odstraněný Memory/Pexeso guard zůstal v startup HTML.');\n}\n", '')
replace_exact('tools/defer-heavy-libs.mjs', '[defer-heavy-libs] OK XLSX + JSZip + obsolete Memory guard + diagnostic-only scripts deferred; Supabase and DOM security hardening untouched', '[defer-heavy-libs] OK XLSX + JSZip + diagnostic-only scripts deferred; Supabase and DOM security hardening untouched')

replace_exact('tools/critical-runtime-smoke.mjs', "const dashboardShiftPatch = read('rak-dashboard-shift-label-v1515.js');\n", '')
replace_exact('tools/critical-runtime-smoke.mjs', "const shiftReportEntryFix = read('rak-shift-report-entry-fix.js');\n", "const appMenuJs = read('app-menu.js');\nconst shiftReportEntryFix = read('rak-shift-report-entry-fix.js');\n")
replace_exact('tools/critical-runtime-smoke.mjs', "assert(fs.existsSync(path.join(root, 'rak-dashboard-shift-label-v1515.js')), 'Dashboard patch musí ve v1.5.45 ještě zůstat ve zdrojích jako rychlá fallback pojistka');", "assert(!fs.existsSync(path.join(root, 'rak-dashboard-shift-label-v1515.js')), 'Dashboard patch se po mobilním ověření nesmí vrátit do zdrojů');\nassert(!deferred.includes('rak-profile-settings-fix.js'), 'Profil settings fix se po nativním převzetí nesmí vrátit do runtime');\nassert(!deferred.includes('rak-admin-menu-fix.js'), 'Admin menu fix se po nativním převzetí nesmí vrátit do runtime');\nassert(!fs.existsSync(path.join(root, 'rak-profile-settings-fix.js')), 'Profil settings fix se po nativním převzetí nesmí vrátit do zdrojů');\nassert(!fs.existsSync(path.join(root, 'rak-admin-menu-fix.js')), 'Admin menu fix se po nativním převzetí nesmí vrátit do zdrojů');\nassert(appMenuJs.includes('function buildGamesProfileSettingsHtml()'), 'Nativní profilová karta musí být přímo v app-menu.js');\nassert(appMenuJs.includes('function rakAdminMenuResolveActiveAccountId()'), 'Nativní resolver admin účtu musí být přímo v app-menu.js');\nassert(appMenuJs.includes('const activeId = rakAdminMenuResolveActiveAccountId();'), 'Admin menu musí používat nativní resolver aktivního účtu');")
replace_exact('tools/critical-runtime-smoke.mjs', "assert(deferHeavyLibs.includes('rak-memory-total-time-fix\\\\.js'), 'Build transform neodstraňuje starý Memory/Pexeso guard');\n", '')
replace_exact('tools/critical-runtime-smoke.mjs', "assert(dashboardShiftPatch.includes('window.RAK_PWA_BUILD'), 'Zobrazený testovací build není navázaný na aktuální PWA build');\nassert(dashboardShiftPatch.includes('--rak-dev-build-label'), 'Chybí bezpečné přepsání starého build labelu v O aplikaci');\n", '')
insert_after = "assert(!indexHtml.includes('styles-games.css'), 'Zdrojový index.html pořád načítá herní CSS');\n"
replace_exact('tools/critical-runtime-smoke.mjs', insert_after, insert_after + "assert(!indexHtml.includes('assets/rak-memory-total-time-fix.js'), 'Zdrojový index.html pořád obsahuje odstraněný Memory/Pexeso guard');\n")

for dead in ['rak-dashboard-shift-label-v1515.js', 'rak-profile-settings-fix.js', 'rak-admin-menu-fix.js']:
    p = Path(dead)
    if not p.exists():
        raise SystemExit(f'{dead}: expected file missing before cleanup')
    p.unlink()
