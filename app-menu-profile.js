// RaK – profil a přihlášení oddělené z app-menu.js.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-profile.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}

function getAppMenuProfileSettingsProfile() {
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

