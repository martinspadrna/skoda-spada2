// RaK DEV – profil v Nastavení bez závislosti na odstraněném modulu Hry.
(function () {
  'use strict';

  const STYLE_ID = 'rak-profile-settings-fix-style-v1';

  function esc(value) {
    if (typeof window.escapeHtml === 'function') return window.escapeHtml(String(value || ''));
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function getProfile() {
    try {
      if (typeof window.rakUserProfileGet === 'function') {
        const profile = window.rakUserProfileGet();
        if (profile && profile.accountNumber && profile.fullName) return profile;
      }
    } catch (err) {}
    try {
      if (typeof app === 'object' && app) {
        const accountNumber = String(app.activeAccountId || app.gamesProfile && app.gamesProfile.activeAccountId || '').trim();
        const fullName = String(app.activeAccountName || '').trim();
        if (accountNumber && fullName) return { accountNumber, fullName };
      }
    } catch (err) {}
    return null;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .rakProfileSettingsCard{overflow:hidden}
      .rakProfileSettingsIdentity{display:grid;gap:4px;margin-top:4px;padding:14px 15px;border:1px solid rgba(255,255,255,.10);border-radius:16px;background:rgba(255,255,255,.035)}
      .rakProfileSettingsIdentity strong{font-size:17px;line-height:1.25;overflow-wrap:anywhere}
      .rakProfileSettingsIdentity span{font-size:12px;opacity:.68;font-variant-numeric:tabular-nums}
      .rakProfileSettingsEmpty{padding:14px 15px;border:1px dashed rgba(255,255,255,.14);border-radius:16px;font-size:13px;opacity:.78}
      .rakProfileSettingsActions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
      .rakProfileSettingsActions .appMenuAction{flex:1 1 140px}
    `;
    document.head.appendChild(style);
  }

  function buildProfileSettingsHtml() {
    ensureStyles();
    const profile = getProfile();
    if (profile) {
      return [
        '<div class="appMenuCard appMenuSettingsCard appMenuProfileCard rakProfileSettingsCard" id="gamesAccountCard">',
        '  <div class="appMenuCardTitle">Profil a přihlášení</div>',
        '  <div class="rakProfileSettingsIdentity">',
        '    <strong>' + esc(profile.fullName) + '</strong>',
        '    <span>Osobní číslo: ' + esc(profile.accountNumber) + '</span>',
        '  </div>',
        '  <div class="rakProfileSettingsActions">',
        '    <button type="button" class="appMenuAction" data-rak-profile-action="change">Změnit účet</button>',
        '    <button type="button" class="appMenuAction" data-rak-profile-action="logout">Odhlásit</button>',
        '  </div>',
        '</div>'
      ].join('');
    }
    return [
      '<div class="appMenuCard appMenuSettingsCard appMenuProfileCard rakProfileSettingsCard" id="gamesAccountCard">',
      '  <div class="appMenuCardTitle">Profil a přihlášení</div>',
      '  <div class="rakProfileSettingsEmpty">Nikdo není přihlášený.</div>',
      '  <div class="rakProfileSettingsActions">',
      '    <button type="button" class="appMenuAction isActive" data-rak-profile-action="login">Přihlásit</button>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function openLogin(prefill) {
    try {
      if (typeof window.rakUserProfileOpenLogin === 'function') {
        window.rakUserProfileOpenLogin(prefill || '');
        return;
      }
    } catch (err) {}
    try {
      if (typeof window.installRakLoginSplash === 'function') window.installRakLoginSplash(prefill || '');
    } catch (err) {}
  }

  document.addEventListener('click', (event) => {
    const target = event.target && event.target.closest ? event.target.closest('[data-rak-profile-action]') : null;
    if (!target) return;
    const action = String(target.getAttribute('data-rak-profile-action') || '');
    if (action === 'change') {
      const profile = getProfile();
      openLogin(profile && profile.accountNumber || '');
      return;
    }
    if (action === 'logout') {
      try { if (typeof window.rakAdminLock === 'function') window.rakAdminLock({ clearPersistent: true }); } catch (err) {}
      try { if (typeof window.rakUserProfileClear === 'function') window.rakUserProfileClear(); } catch (err) {}
      openLogin('');
      return;
    }
    if (action === 'login') openLogin('');
  }, true);

  ensureStyles();
  window.buildGamesProfileSettingsHtml = buildProfileSettingsHtml;
  window.buildRakProfileSettingsHtml = buildProfileSettingsHtml;
})();
