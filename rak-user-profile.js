// RaK DEV – samostatny profil uzivatele pro prihlaseni bez zavislosti na Hernim modulu.
(function () {
  'use strict';

  const PROFILE_KEY = 'rotace_kalkulacky:user_profile_v1';

  function read() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== 'object') return null;
      const accountNumber = String(parsed.accountNumber || '').trim();
      const fullName = String(parsed.fullName || '').trim();
      if (!accountNumber || !fullName) return null;
      return { accountNumber, fullName, updatedAt: Number(parsed.updatedAt || 0) || 0 };
    } catch (err) { return null; }
  }

  function write(profile) {
    const src = profile && typeof profile === 'object' ? profile : {};
    const next = {
      accountNumber: String(src.accountNumber || '').trim(),
      fullName: String(src.fullName || '').trim(),
      updatedAt: Date.now()
    };
    if (!next.accountNumber || !next.fullName) return false;
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(next)); } catch (err) { return false; }
    window.__RAK_USER_PROFILE__ = next;
    syncSettingsProfileCard(next);
    return true;
  }

  function get() {
    if (window.__RAK_USER_PROFILE__ && typeof window.__RAK_USER_PROFILE__ === 'object') return window.__RAK_USER_PROFILE__;
    const profile = read();
    window.__RAK_USER_PROFILE__ = profile;
    return profile;
  }

  function clear() {
    try { localStorage.removeItem(PROFILE_KEY); } catch (err) {}
    window.__RAK_USER_PROFILE__ = null;
    try {
      if (typeof app === 'object' && app) {
        app.activeAccountId = '';
        app.activeAccountName = '';
        app.gamesProfile = { activeAccountId: '', accounts: {} };
      }
    } catch (err) {}
    syncSettingsProfileCard(null);
  }

  function esc(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(String(value || ''));
    return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function apply(profile) {
    const safe = profile && typeof profile === 'object' ? profile : get();
    if (!safe) return;
    const accountNumber = String(safe.accountNumber || '').trim();
    const fullName = String(safe.fullName || '').trim();
    if (!accountNumber || !fullName) return;
    window.__RAK_USER_PROFILE__ = { accountNumber, fullName, updatedAt: Number(safe.updatedAt || Date.now()) || Date.now() };
    try {
      if (typeof app === 'object' && app) {
        app.activeAccountId = accountNumber;
        app.activeAccountName = fullName;
        app.gamesProfile = app.gamesProfile && typeof app.gamesProfile === 'object' ? app.gamesProfile : { activeAccountId: '', accounts: {} };
        app.gamesProfile.activeAccountId = accountNumber;
        app.gamesProfile.accounts = app.gamesProfile.accounts && typeof app.gamesProfile.accounts === 'object' ? app.gamesProfile.accounts : {};
        app.gamesProfile.accounts[accountNumber] = Object.assign({}, app.gamesProfile.accounts[accountNumber] || {}, { id: accountNumber, name: fullName });
      }
    } catch (err) {}
    // Vzhled je navázaný na herní/profilové úložiště. Rychlé přihlášení proto
    // musí založit stejný aktivní účet i zde, jinak se na jiném zařízení použije výchozí vzhled.
    try {
      if (typeof gamesGetProfile === 'function') {
        const gamesProfile = gamesGetProfile();
        if (gamesProfile && gamesProfile.accounts) {
          const makeAccount = typeof gamesMakeAccountEntry === 'function'
            ? gamesMakeAccountEntry(accountNumber, fullName)
            : { id: accountNumber, name: fullName, uiSettings: { themeId: '', backgroundId: '', updatedAt: 0 } };
          gamesProfile.accounts[accountNumber] = Object.assign({}, makeAccount, gamesProfile.accounts[accountNumber] || {}, { id: accountNumber, name: fullName });
          gamesProfile.activeAccountId = accountNumber;
          if (typeof GAMES_PROFILE_RESET_VERSION !== 'undefined') gamesProfile.profileVersion = GAMES_PROFILE_RESET_VERSION;
          if (typeof gamesSaveProfile === 'function') gamesSaveProfile(gamesProfile);
          if (typeof app === 'object' && app) app.gamesProfile = gamesProfile;
          if (typeof applyProfileUiPreferencesForActiveAccount === 'function') applyProfileUiPreferencesForActiveAccount({ loadRemote: true, source: 'rak-user-login' });
        }
      }
    } catch (err) { console.warn('RaK profile appearance sync failed', err); }
    syncSettingsProfileCard(window.__RAK_USER_PROFILE__);
  }

  async function lookup(last4) {
    const suffix = String(last4 || '').replace(/\D/g, '').slice(-4);
    if (!/^\d{4}$/.test(suffix)) return { ok: false, reason: 'not-found' };
    const clientFactory = window.supabase && typeof window.supabase.createClient === 'function' ? window.supabase.createClient : null;
    const config = window.SUPABASE_CONFIG || {};
    if (!clientFactory || !config.url || !config.publishableKey) return { ok: false, reason: 'online-not-ready' };
    try {
      const client = clientFactory(config.url, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
      const { data, error } = await client.from('game_accounts').select('account_number,full_name').like('account_number', `%${suffix}`);
      if (error) return { ok: false, reason: 'lookup-failed', error };
      const rows = Array.isArray(data) ? data.filter((row) => String(row && row.account_number || '').trim() && String(row && row.full_name || '').trim()) : [];
      if (!rows.length) return { ok: false, reason: 'not-found' };
      if (rows.length > 1) return { ok: false, reason: 'ambiguous' };
      return { ok: true, accountNumber: String(rows[0].account_number).trim(), fullName: String(rows[0].full_name).trim() };
    } catch (error) {
      return { ok: false, reason: 'lookup-failed', error };
    }
  }

  function syncSettingsProfileCard(profile) {
    const card = document.getElementById('gamesAccountCard');
    if (!card) return;
    const safe = profile && typeof profile === 'object' ? profile : get();
    const top = card.querySelector('#gamesAccountTop');
    const name = card.querySelector('#gamesAccountName');
    const entry = card.querySelector('#gamesAccountEntryRow');
    const clearBtn = card.querySelector('#gamesAccountClearBtn');
    const label = top ? top.querySelector('.dashboardLabel') : null;

    if (safe && String(safe.accountNumber || '').trim() && String(safe.fullName || '').trim()) {
      const accountNumber = String(safe.accountNumber).trim();
      const fullName = String(safe.fullName).trim();
      if (label && label.textContent !== 'Přihlášený uživatel') label.textContent = 'Přihlášený uživatel';
      if (name) {
        const wanted = fullName + ' · OS ' + accountNumber;
        if (name.textContent !== wanted) name.textContent = wanted;
      }
      if (top && top.style.display === 'none') top.style.display = '';
      if (entry && entry.style.display !== 'none') entry.style.display = 'none';
      if (clearBtn) {
        if (clearBtn.textContent !== 'Odhlásit') clearBtn.textContent = 'Odhlásit';
        clearBtn.onclick = () => {
          clear();
          try { if (typeof window.installRakLoginSplash === 'function') window.installRakLoginSplash(true); } catch (err) {}
        };
      }
      return;
    }

    if (top && top.style.display !== 'none') top.style.display = 'none';
    if (entry && entry.style.display === 'none') entry.style.display = '';
    if (name && name.textContent) name.textContent = '';
  }

  function ensureMenuBox(body) {
    if (!body || !body.insertBefore) return;
    let box = document.getElementById('rakUserProfileBox');
    const profile = get();
    const html = profile
      ? `<div class="rakUserProfileBoxTitle">Přihlášený uživatel</div><div class="rakUserProfileBoxName">${esc(profile.fullName)}</div><div class="rakUserProfileBoxNumber">Osobní číslo: ${esc(profile.accountNumber)}</div><div class="rakUserProfileBoxActions"><button type="button" id="rakUserProfileChange">Změnit účet</button><button type="button" id="rakUserProfileLogout">Odhlásit</button></div>`
      : `<div class="rakUserProfileBoxTitle">Uživatel</div><div class="rakUserProfileBoxName">Nikdo není přihlášen</div><div class="rakUserProfileBoxActions"><button type="button" id="rakUserProfileLogin">Přihlásit</button></div>`;
    if (!box) {
      box = document.createElement('div');
      box.id = 'rakUserProfileBox';
      box.className = 'rakUserProfileBox';
      box.innerHTML = html;
      body.insertBefore(box, body.firstChild || null);
    } else if (box.innerHTML !== html) box.innerHTML = html;
    const change = box.querySelector('#rakUserProfileChange');
    const logout = box.querySelector('#rakUserProfileLogout');
    const login = box.querySelector('#rakUserProfileLogin');
    if (change) change.onclick = () => window.rakUserProfileOpenLogin && window.rakUserProfileOpenLogin(profile && profile.accountNumber || '');
    if (logout) logout.onclick = () => { clear(); box.remove(); if (typeof window.installRakLoginSplash === 'function') window.installRakLoginSplash(true); };
    if (login) login.onclick = () => window.installRakLoginSplash && window.installRakLoginSplash(true);
  }

  function refreshMenu() {
    const body = document.getElementById('appMenuBody');
    if (body) ensureMenuBox(body);
    syncSettingsProfileCard(get());
  }

  function openLogin(prefill) {
    if (typeof window.installRakLoginSplash === 'function') {
      const overlay = window.installRakLoginSplash(true);
      const input = document.getElementById('rakUserLoginAccountNumber');
      if (input) {
        const digits = String(prefill || '').replace(/\D/g, '');
        input.value = digits.length > 4 ? digits.slice(-4) : digits;
        try { input.focus(); input.select(); } catch (err) {}
      }
      return overlay;
    }
    return null;
  }

  function bootstrap() {
    const profile = get();
    if (profile) apply(profile);
    refreshMenu();
    try {
      if (!window.__rakUserProfileSettingsObserver) {
        const observer = new MutationObserver(() => syncSettingsProfileCard(get()));
        observer.observe(document.body, { childList: true, subtree: true });
        window.__rakUserProfileSettingsObserver = observer;
      }
    } catch (err) {}
  }

  window.rakUserProfileRead = read;
  window.rakUserProfileWrite = write;
  window.rakUserProfileGet = get;
  window.rakUserProfileClear = clear;
  window.rakUserProfileEscape = esc;
  window.rakUserProfileApplyToRuntime = apply;
  window.rakUserProfileLookup = lookup;
  window.rakUserProfileEnsureMenuBox = ensureMenuBox;
  window.rakUserProfileRefreshMenu = refreshMenu;
  window.rakUserProfileSyncSettingsCard = syncSettingsProfileCard;
  window.rakUserProfileOpenLogin = openLogin;
  window.rakUserProfileBootstrap = bootstrap;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  else bootstrap();
})();
