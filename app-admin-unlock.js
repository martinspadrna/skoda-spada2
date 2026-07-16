// RaK 1.2 (1.268) - admin opravneni navazane na prihlaseny ucet.
const RAK_OWNER_ADMIN_ACCOUNT_ID = '9811';
const RAK_OWNER_ADMIN_PASSWORD = '772326';
const RAK_ADMIN_ACCOUNTS_SETTINGS_KEY = 'ADMIN_ACCOUNTS_SETTINGS';
const RAK_ADMIN_ACCOUNTS_SETTINGS_CATEGORY = 'admin_accounts_settings';
const RAK_ADMIN_SESSION_UNLOCKED_KEY = 'adminUnlockedSession';
const RAK_ADMIN_SESSION_PIN_KEY = 'adminPinSession';
const RAK_ADMIN_SESSION_AUTH_PIN_KEY = 'adminAuthPinSession';
const RAK_ADMIN_SESSION_ACCOUNT_KEY = 'adminAccountIdSession';
const RAK_ADMIN_SESSION_OWNER_KEY = 'adminOwnerSession';
const RAK_ADMIN_SESSION_PROMPTED_ACCOUNT_KEY = 'adminPromptedAccountSession';
const RAK_ADMIN_PERSISTENT_SESSION_KEY = 'adminPersistentSessionV1';
const RAK_ADMIN_DEVICE_ID_KEY = 'adminDeviceIdV1';
const RAK_ADMIN_SESSION_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
const RAK_ADMIN_SESSION_TOUCH_MS = 30 * 60 * 1000;

function rakAdminGetActiveAccountId() {
  try {
    if (typeof gamesGetProfile === 'function') {
      const profile = gamesGetProfile();
      return String(profile && profile.activeAccountId || '').trim();
    }
  } catch (err) {}
  try {
    const profile = app && app.gamesProfile;
    return String(profile && profile.activeAccountId || '').trim();
  } catch (err) {}
  return '';
}

function rakAdminIsOwnerAccount(accountId) {
  return String(accountId || '').trim() === RAK_OWNER_ADMIN_ACCOUNT_ID;
}

function rakAdminSettingsRows() {
  return Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
}

function rakAdminIsAccountsSettingsRow(row) {
  const settings = row && row.settings_json && typeof row.settings_json === 'object'
    ? row.settings_json
    : (() => { try { return row && row.settings_json ? JSON.parse(String(row.settings_json)) : {}; } catch (err) { return {}; } })();
  return String(row && row.category || '').trim() === RAK_ADMIN_ACCOUNTS_SETTINGS_CATEGORY
    || String(row && row.machine_key || '').trim() === RAK_ADMIN_ACCOUNTS_SETTINGS_KEY
    || String(settings && settings.stored_category || '').trim() === RAK_ADMIN_ACCOUNTS_SETTINGS_CATEGORY
    || String(settings && settings.admin_settings_key || '').trim() === RAK_ADMIN_ACCOUNTS_SETTINGS_KEY;
}

function rakAdminNormalizeManagedEntry(entry) {
  const safe = entry && typeof entry === 'object' ? entry : {};
  const accountId = String(safe.accountId || safe.account_id || safe.id || '').trim();
  if (!accountId || accountId === RAK_OWNER_ADMIN_ACCOUNT_ID) return null;
  const password = String(safe.password || safe.pin || '').trim();
  if (!password) return null;
  return {
    accountId,
    label: String(safe.label || safe.name || '').trim(),
    password,
    enabled: safe.enabled !== false
  };
}

function rakAdminNormalizeSessionEntry(entry) {
  const safe = entry && typeof entry === 'object' ? entry : {};
  const accountId = String(safe.accountId || safe.account_id || '').trim();
  const deviceId = String(safe.deviceId || safe.device_id || '').trim();
  const token = String(safe.token || '').trim();
  if (!accountId || !deviceId || !token) return null;
  return {
    accountId,
    deviceId,
    token,
    label: String(safe.label || safe.deviceLabel || safe.device_label || '').trim() || 'Zařízení',
    createdAt: String(safe.createdAt || safe.created_at || '').trim(),
    lastSeenAt: String(safe.lastSeenAt || safe.last_seen_at || '').trim(),
    appVersion: String(safe.appVersion || safe.app_version || '').trim(),
    revokedAt: String(safe.revokedAt || safe.revoked_at || '').trim()
  };
}

function rakAdminGetAccountsSettings() {
  const row = rakAdminSettingsRows().find(rakAdminIsAccountsSettingsRow);
  const raw = row && row.settings_json && typeof row.settings_json === 'object'
    ? row.settings_json
    : (() => {
        try { return row && row.settings_json ? JSON.parse(String(row.settings_json)) : {}; } catch (err) { return {}; }
      })();
  const entries = Array.isArray(raw && raw.admins)
    ? raw.admins.map(rakAdminNormalizeManagedEntry).filter(Boolean)
    : [];
  const sessions = Array.isArray(raw && raw.sessions)
    ? raw.sessions.map(rakAdminNormalizeSessionEntry).filter(Boolean)
    : [];
  return {
    type: RAK_ADMIN_ACCOUNTS_SETTINGS_CATEGORY,
    ownerAccountId: RAK_OWNER_ADMIN_ACCOUNT_ID,
    admins: entries,
    sessions
  };
}

function rakAdminFindManagedEntry(accountId) {
  const id = String(accountId || '').trim();
  if (!id || id === RAK_OWNER_ADMIN_ACCOUNT_ID) return null;
  return rakAdminGetAccountsSettings().admins.find((entry) => entry && entry.enabled !== false && String(entry.accountId || '') === id) || null;
}

function rakAdminAccountRequiresPassword(accountId) {
  return rakAdminIsOwnerAccount(accountId) || !!rakAdminFindManagedEntry(accountId);
}

function rakAdminExpectedPasswordForAccount(accountId) {
  const id = String(accountId || '').trim();
  if (rakAdminIsOwnerAccount(id)) return RAK_OWNER_ADMIN_PASSWORD;
  const managed = rakAdminFindManagedEntry(id);
  return managed ? String(managed.password || '') : '';
}

function rakAdminMakeId(prefix) {
  try {
    const hasCrypto = typeof crypto !== 'undefined' && crypto && typeof crypto.getRandomValues === 'function';
    const rnd = hasCrypto
      ? Array.from(crypto.getRandomValues(new Uint32Array(4))).map(n => n.toString(36)).join('')
      : (Date.now().toString(36) + Math.random().toString(36).slice(2, 14));
    return (String(prefix || 'rak') + '-' + rnd).slice(0, 96);
  } catch (err) {
    return (String(prefix || 'rak') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)).slice(0, 96);
  }
}

function rakAdminGetDeviceId() {
  try {
    let id = String(localStorage.getItem(RAK_ADMIN_DEVICE_ID_KEY) || '').trim();
    if (/^rakadm-[a-z0-9-]{10,}$/i.test(id)) return id.slice(0, 96);
    id = rakAdminMakeId('rakadm');
    localStorage.setItem(RAK_ADMIN_DEVICE_ID_KEY, id);
    return id;
  } catch (err) {
    return rakAdminMakeId('rakadm');
  }
}

function rakAdminDeviceLabel() {
  try {
    const ua = String((typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '').toLowerCase();
    const platform = String((typeof navigator !== 'undefined' && navigator.platform) ? navigator.platform : '').trim();
    const isPhone = /iphone|android.*mobile/.test(ua);
    const isTablet = /ipad|tablet|android(?!.*mobile)/.test(ua);
    const os = /iphone|ipad/.test(ua) ? 'iOS' : (/android/.test(ua) ? 'Android' : (/windows/.test(ua) ? 'Windows' : (platform || 'Zařízení')));
    const browser = /edg\//.test(ua) ? 'Edge' : (/chrome|crios/.test(ua) ? 'Chrome' : (/safari/.test(ua) ? 'Safari' : 'Prohlížeč'));
    return ((isPhone ? 'Mobil' : (isTablet ? 'Tablet' : 'Počítač')) + ' · ' + os + ' · ' + browser).slice(0, 120);
  } catch (err) {
    return 'Zařízení';
  }
}

function rakAdminReadPersistentSession() {
  try {
    const raw = localStorage.getItem(RAK_ADMIN_PERSISTENT_SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== 'object') return null;
    const accountId = String(parsed.accountId || '').trim();
    const deviceId = String(parsed.deviceId || '').trim();
    const token = String(parsed.token || '').trim();
    const createdAt = Number(parsed.createdAt || 0) || 0;
    if (!accountId || !deviceId || !token || !createdAt) return null;
    if (Date.now() - createdAt > RAK_ADMIN_SESSION_MAX_AGE_MS) return null;
    return Object.assign({}, parsed, { accountId, deviceId, token, createdAt });
  } catch (err) {
    return null;
  }
}

function rakAdminWritePersistentSession(session) {
  try {
    if (!session || typeof session !== 'object') return false;
    localStorage.setItem(RAK_ADMIN_PERSISTENT_SESSION_KEY, JSON.stringify(session));
    localStorage.removeItem('adminUnlocked');
    return true;
  } catch (err) {
    return false;
  }
}

function rakAdminClearPersistentSession() {
  try {
    localStorage.removeItem(RAK_ADMIN_PERSISTENT_SESSION_KEY);
    localStorage.removeItem('adminUnlocked');
  } catch (err) {}
}

function rakAdminClearSession(options) {
  const opts = options && typeof options === 'object' ? options : {};
  try {
    sessionStorage.removeItem(RAK_ADMIN_SESSION_UNLOCKED_KEY);
    sessionStorage.removeItem(RAK_ADMIN_SESSION_PIN_KEY);
    sessionStorage.removeItem(RAK_ADMIN_SESSION_AUTH_PIN_KEY);
    sessionStorage.removeItem(RAK_ADMIN_SESSION_ACCOUNT_KEY);
    sessionStorage.removeItem(RAK_ADMIN_SESSION_OWNER_KEY);
    localStorage.removeItem('adminUnlocked');
  } catch (err) {}
  if (opts.clearPersistent === true) rakAdminClearPersistentSession();
}

function rakAdminLock(options) {
  if (typeof app !== 'undefined' && app) {
    app.adminUnlocked = false;
    app.adminPin = '';
    app.adminAccountId = '';
    app.adminIsOwner = false;
  }
  rakAdminClearSession(options && typeof options === 'object' ? options : {});
}

function rakAdminSessionMatchesSettings(session, settings) {
  const safe = session && typeof session === 'object' ? session : null;
  if (!safe) return false;
  const source = settings && typeof settings === 'object' ? settings : rakAdminGetAccountsSettings();
  const sessions = Array.isArray(source && source.sessions) ? source.sessions : [];
  if (!sessions.length) return true;
  return sessions.some((entry) => (
    entry
    && !entry.revokedAt
    && String(entry.accountId || '') === String(safe.accountId || '')
    && String(entry.deviceId || '') === String(safe.deviceId || '')
    && String(entry.token || '') === String(safe.token || '')
  ));
}

function rakAdminApplyUnlockedAccount(accountId, authPin, options) {
  const id = String(accountId || '').trim();
  const pass = String(authPin || rakAdminExpectedPasswordForAccount(id) || RAK_OWNER_ADMIN_PASSWORD).trim();
  const opts = options && typeof options === 'object' ? options : {};
  if (!id || !rakAdminAccountRequiresPassword(id)) {
    rakAdminLock({ clearPersistent: false });
    return false;
  }
  if (typeof app !== 'undefined' && app) {
    app.adminUnlocked = true;
    app.adminPin = RAK_OWNER_ADMIN_PASSWORD;
    app.adminAccountId = id;
    app.adminIsOwner = rakAdminIsOwnerAccount(id);
    app.contactTapCount = 0;
  }
  try {
    sessionStorage.setItem(RAK_ADMIN_SESSION_UNLOCKED_KEY, '1');
    sessionStorage.setItem(RAK_ADMIN_SESSION_PIN_KEY, RAK_OWNER_ADMIN_PASSWORD);
    sessionStorage.setItem(RAK_ADMIN_SESSION_AUTH_PIN_KEY, pass);
    sessionStorage.setItem(RAK_ADMIN_SESSION_ACCOUNT_KEY, id);
    sessionStorage.setItem(RAK_ADMIN_SESSION_OWNER_KEY, rakAdminIsOwnerAccount(id) ? '1' : '0');
    localStorage.removeItem('adminUnlocked');
  } catch (err) {}
  if (opts.touchPersistent !== false) rakAdminPersistUnlockedSession(id);
  if (typeof updateImportBoxVisibility === 'function') updateImportBoxVisibility();
  return true;
}

function rakAdminPersistUnlockedSession(accountId) {
  const id = String(accountId || '').trim();
  if (!id) return null;
  const nowIso = new Date().toISOString();
  const current = rakAdminReadPersistentSession();
  const session = current && current.accountId === id
    ? Object.assign({}, current)
    : {
        accountId: id,
        deviceId: rakAdminGetDeviceId(),
        token: rakAdminMakeId('raksess'),
        createdAt: Date.now()
      };
  session.accountId = id;
  session.deviceId = session.deviceId || rakAdminGetDeviceId();
  session.token = session.token || rakAdminMakeId('raksess');
  session.label = rakAdminDeviceLabel();
  session.lastSeenAt = nowIso;
  session.appVersion = String((typeof app !== 'undefined' && app && app.version) || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '') || '').trim();
  rakAdminWritePersistentSession(session);
  const lastTouch = Number(session.lastOnlineTouchAt || 0) || 0;
  if (!lastTouch || Date.now() - lastTouch > RAK_ADMIN_SESSION_TOUCH_MS) {
    session.lastOnlineTouchAt = Date.now();
    rakAdminWritePersistentSession(session);
    void rakAdminSaveCurrentSessionDevice(session);
  }
  return session;
}

function rakAdminSaveCurrentSessionDevice(session) {
  const safe = session && typeof session === 'object' ? session : rakAdminReadPersistentSession();
  if (!safe || !safe.accountId || !safe.deviceId || !safe.token) return Promise.resolve({ ok: false, reason: 'missing-session' });
  if (!(window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function')) return Promise.resolve({ ok: false, reason: 'missing-bridge' });
  const loadPromise = (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function')
    ? window.RotationSupabaseBridge.loadMachineSettings().then((rows) => {
        if (typeof app !== 'undefined' && app) app.machineSettingsRows = Array.isArray(rows) ? rows : [];
      }).catch(() => {})
    : Promise.resolve();
  return loadPromise.then(() => {
    const settings = rakAdminGetAccountsSettings();
    const sessions = (Array.isArray(settings.sessions) ? settings.sessions : [])
      .filter((entry) => entry && String(entry.deviceId || '') !== String(safe.deviceId || ''));
    sessions.push(rakAdminNormalizeSessionEntry(Object.assign({}, safe, {
      createdAt: safe.createdAt ? new Date(Number(safe.createdAt)).toISOString() : new Date().toISOString(),
      lastSeenAt: safe.lastSeenAt || new Date().toISOString(),
      revokedAt: ''
    })));
    const nextSettings = Object.assign({}, settings, {
      sessions: sessions.filter(Boolean).sort((a, b) => String(b.lastSeenAt || '').localeCompare(String(a.lastSeenAt || ''))),
      updatedAt: new Date().toISOString()
    });
    const rows = mergeAdminAccountsSettingsRows(nextSettings);
    return window.RotationSupabaseBridge.saveMachineSettings(rows).then((result) => {
      if (typeof app !== 'undefined' && app) app.machineSettingsRows = rows;
      return result || { ok: true };
    });
  }).catch((err) => ({ ok: false, error: err }));
}

function rakAdminRevokePersistentSession(deviceId) {
  const targetId = String(deviceId || '').trim();
  if (!targetId || !rakAdminCanManageAdmins()) return Promise.resolve({ ok: false, reason: 'not-allowed' });
  const settings = rakAdminGetAccountsSettings();
  const nowIso = new Date().toISOString();
  const sessions = (Array.isArray(settings.sessions) ? settings.sessions : []).map((entry) => {
    if (!entry || String(entry.deviceId || '') !== targetId) return entry;
    return Object.assign({}, entry, { revokedAt: nowIso });
  }).filter(Boolean);
  const nextSettings = Object.assign({}, settings, { sessions, updatedAt: nowIso });
  const rows = mergeAdminAccountsSettingsRows(nextSettings);
  if (!(window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function')) return Promise.resolve({ ok: false, reason: 'missing-bridge' });
  return window.RotationSupabaseBridge.saveMachineSettings(rows).then((result) => {
    if (typeof app !== 'undefined' && app) app.machineSettingsRows = rows;
    const current = rakAdminReadPersistentSession();
    if (current && String(current.deviceId || '') === targetId) rakAdminLock({ clearPersistent: true });
    return result || { ok: true };
  }).catch((err) => ({ ok: false, error: err }));
}

function rakAdminRestorePersistentSessionForActiveAccount(reason) {
  const activeId = rakAdminGetActiveAccountId();
  const session = rakAdminReadPersistentSession();
  if (!activeId || !session || String(session.accountId || '') !== activeId) return false;
  if (!rakAdminIsOwnerAccount(activeId) && !rakAdminAccountRequiresPassword(activeId)) return false;
  if (!rakAdminSessionMatchesSettings(session)) {
    rakAdminLock({ clearPersistent: true });
    return false;
  }
  const pass = rakAdminExpectedPasswordForAccount(activeId) || RAK_OWNER_ADMIN_PASSWORD;
  const restored = rakAdminApplyUnlockedAccount(activeId, pass, { touchPersistent: false, source: reason || 'persistent' });
  if (restored) rakAdminPersistUnlockedSession(activeId);
  return restored;
}

function rakAdminCheckPersistentSessionAgainstSettings() {
  const session = rakAdminReadPersistentSession();
  if (!session) return false;
  if (!rakAdminSessionMatchesSettings(session)) {
    rakAdminLock({ clearPersistent: true });
    return false;
  }
  return true;
}

function rakAdminUnlockForAccount(accountId, pin, options) {
  const id = String(accountId || '').trim();
  const pass = String(pin || '').trim();
  if (!id || !rakAdminAccountRequiresPassword(id)) {
    rakAdminLock({ clearPersistent: false });
    return false;
  }
  if (pass !== rakAdminExpectedPasswordForAccount(id)) return false;
  return rakAdminApplyUnlockedAccount(id, pass, options || {});
}

function rakAdminRestoreSessionForActiveAccount() {
  const activeId = rakAdminGetActiveAccountId();
  if (!rakAdminAccountRequiresPassword(activeId)) {
    rakAdminLock({ clearPersistent: false });
    return false;
  }
  try {
    const unlocked = sessionStorage.getItem(RAK_ADMIN_SESSION_UNLOCKED_KEY) === '1';
    const sessionAccount = String(sessionStorage.getItem(RAK_ADMIN_SESSION_ACCOUNT_KEY) || '').trim();
    const pin = String(sessionStorage.getItem(RAK_ADMIN_SESSION_AUTH_PIN_KEY) || sessionStorage.getItem(RAK_ADMIN_SESSION_PIN_KEY) || '').trim();
    if (unlocked && sessionAccount === activeId && pin) return rakAdminUnlockForAccount(activeId, pin);
  } catch (err) {}
  rakAdminLock();
  return false;
}

function rakAdminPromptUnlockForAccount(accountId) {
  const id = String(accountId || '').trim();
  if (!rakAdminAccountRequiresPassword(id)) {
    rakAdminLock({ clearPersistent: false });
    return true;
  }
  if (typeof app !== 'undefined' && app && app.adminUnlocked && String(app.adminAccountId || '') === id) return true;
  let pass = '';
  try {
    pass = prompt('Heslo administrace:') || '';
  } catch (err) {
    pass = '';
  }
  if (rakAdminUnlockForAccount(id, pass)) return true;
  rakAdminLock({ clearPersistent: true });
  try { alert('Spatne heslo administrace.'); } catch (err) {}
  return false;
}

function rakAdminPromptOnceForActiveAccount(reason) {
  const id = rakAdminGetActiveAccountId();
  if (!id || !rakAdminAccountRequiresPassword(id)) return false;
  if (typeof app !== 'undefined' && app && app.adminUnlocked === true && String(app.adminAccountId || '') === id) return true;
  let prompted = false;
  try {
    prompted = sessionStorage.getItem(RAK_ADMIN_SESSION_PROMPTED_ACCOUNT_KEY) === id;
  } catch (err) {
    prompted = String(window.__rakAdminPromptedAccountId || '') === id;
  }
  if (prompted) return false;
  try {
    sessionStorage.setItem(RAK_ADMIN_SESSION_PROMPTED_ACCOUNT_KEY, id);
  } catch (err) {
    window.__rakAdminPromptedAccountId = id;
  }
  return rakAdminPromptUnlockForAccount(id);
}

function rakAdminScheduleStartupPrompt() {
  [0, 350, 1200].forEach((delay) => {
    try {
      setTimeout(() => rakAdminLoadSettingsThenCheck('startup'), delay);
    } catch (err) {}
  });
}

function rakAdminLoadSettingsThenCheck(reason) {
  const activeId = rakAdminGetActiveAccountId();
  if (!activeId) return false;
  const alreadyKnownAdmin = rakAdminIsOwnerAccount(activeId) || rakAdminAccountRequiresPassword(activeId);
  const persistentResult = alreadyKnownAdmin ? rakAdminRestorePersistentSessionForActiveAccount(reason || 'persistent') : false;
  const promptResult = alreadyKnownAdmin && !persistentResult ? rakAdminPromptOnceForActiveAccount(reason) : persistentResult;
  if (!(window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function')) return promptResult;
  if (window.__rakAdminSettingsLoadPending === true) return promptResult;
  window.__rakAdminSettingsLoadPending = true;
  window.RotationSupabaseBridge.loadMachineSettings().then((rows) => {
    window.__rakAdminSettingsLoadPending = false;
    if (typeof app !== 'undefined' && app) app.machineSettingsRows = Array.isArray(rows) ? rows : [];
    const restoredPersistent = rakAdminRestorePersistentSessionForActiveAccount(reason || 'settings-loaded');
    if (restoredPersistent) return;
    rakAdminCheckPersistentSessionAgainstSettings();
    const restoredAfterSettings = rakAdminRestoreSessionForActiveAccount();
    if (!restoredAfterSettings) rakAdminPromptOnceForActiveAccount(reason || 'settings-loaded');
  }).catch(() => {
    window.__rakAdminSettingsLoadPending = false;
  });
  return true;
}

function rakAdminCanOpenAdmin() {
  const activeId = rakAdminGetActiveAccountId();
  return !!(activeId && rakAdminAccountRequiresPassword(activeId) && typeof app !== 'undefined' && app && app.adminUnlocked === true && String(app.adminAccountId || '') === activeId);
}

function rakAdminCanManageAdmins() {
  return !!(typeof app !== 'undefined' && app && app.adminUnlocked === true && app.adminIsOwner === true && rakAdminIsOwnerAccount(app.adminAccountId));
}

function makeAdminAccountsSettingsRow(settings) {
  const safe = settings && typeof settings === 'object' ? settings : rakAdminGetAccountsSettings();
  return {
    machine_key: RAK_ADMIN_ACCOUNTS_SETTINGS_KEY,
    machine_code: 'ADMIN',
    machine_index: 'accounts',
    label: 'Spravci',
    category: RAK_ADMIN_ACCOUNTS_SETTINGS_CATEGORY,
    cycle_time: '',
    speed: '',
    dress_time: '',
    dress_count: '',
    settings_json: Object.assign({ machine: 'ADMIN', index: 'accounts' }, safe, {
      type: RAK_ADMIN_ACCOUNTS_SETTINGS_CATEGORY,
      ownerAccountId: RAK_OWNER_ADMIN_ACCOUNT_ID
    })
  };
}

function mergeAdminAccountsSettingsRows(settings) {
  const rows = rakAdminSettingsRows().filter((row) => !rakAdminIsAccountsSettingsRow(row));
  rows.push(makeAdminAccountsSettingsRow(settings));
  return rows;
}

function buildAdminAccountsRoleOverviewHtml(settings) {
  const safe = settings && typeof settings === 'object' ? settings : rakAdminGetAccountsSettings();
  const admins = Array.isArray(safe && safe.admins) ? safe.admins : [];
  const enabledAdmins = admins.filter((entry) => entry && entry.enabled !== false).length;
  return [
    '<div class="adminAccountsRoleOverview">',
    '  <div class="adminAccountsRoleCard isOwner">',
    '    <span>Hlavni admin</span>',
    '    <b>Ucet ' + escapeHtml(RAK_OWNER_ADMIN_ACCOUNT_ID) + '</b>',
    '    <small>Muze pridavat dalsi spravce, menit jejich hesla a zapinat nebo vypinat pristup.</small>',
    '  </div>',
    '  <div class="adminAccountsRoleCard">',
    '    <span>Nizsi admini</span>',
    '    <b>' + String(enabledAdmins) + ' aktivni</b>',
    '    <small>Muzou spravovat pracovni casti administrace, ale nemuzou menit hesla ani dalsi adminy.</small>',
    '  </div>',
    '  <div class="adminAccountsRoleCard isInfo">',
    '    <span>Prihlaseni</span>',
    '    <b>ucet + heslo</b>',
    '    <small>Novy spravce musi mit bezny ucet v aplikaci; po jeho vyberu se administrace zepta na heslo.</small>',
    '  </div>',
    '</div>'
  ].join('');
}

function adminAccountsStatusItemHtml(label, value, detail, modifier) {
  const className = 'adminAccountsStatusItem' + (modifier ? ' ' + modifier : '');
  return [
    '<div class="' + className + '">',
    '  <span>' + escapeHtml(label) + '</span>',
    '  <b>' + escapeHtml(value) + '</b>',
    '  <small>' + escapeHtml(detail) + '</small>',
    '</div>'
  ].join('');
}

function adminAccountsSafetyItemHtml(label, value, detail, modifier) {
  const className = 'adminAccountsSafetyItem' + (modifier ? ' ' + modifier : '');
  return [
    '<div class="' + className + '">',
    '  <span>' + escapeHtml(label) + '</span>',
    '  <b>' + escapeHtml(value) + '</b>',
    '  <small>' + escapeHtml(detail) + '</small>',
    '</div>'
  ].join('');
}

function buildAdminAccountsSafetyHtml(source) {
  const settings = source && typeof source === 'object' && Array.isArray(source.admins)
    ? source
    : rakAdminGetAccountsSettings();
  const enabledAdmins = (Array.isArray(settings.admins) ? settings.admins : []).filter((entry) => entry && entry.enabled !== false).length;
  return [
    '<div class="adminAccountsSafety">',
    '  <div class="adminAccountsStatusTitle">Bezpecnost pristupu</div>',
    '  <div class="adminAccountsSafetyGrid">',
    adminAccountsSafetyItemHtml('Owner ucet', RAK_OWNER_ADMIN_ACCOUNT_ID, 'Vestaveny hlavni admin se do tabulky nepridava.', 'isOwner'),
    adminAccountsSafetyItemHtml('Nizsi admini', String(enabledAdmins) + ' aktivni', 'Kazdy nizsi admin musi mit vlastni ucet a heslo.', 'isOk'),
    adminAccountsSafetyItemHtml('Predani', 'bez hesel', 'Predavaci exporty hesla nestahuji; hesla se nastavuji jen tady.', 'isInfo'),
    adminAccountsSafetyItemHtml('Bezni uzivatele', 'bez zmen', 'Bez admin hesla nevidi admin menu a nemeni provozni data.', 'isInfo'),
    '  </div>',
    '</div>'
  ].join('');
}

function adminSessionDateLabel(value) {
  const text = String(value || '').trim();
  if (!text) return 'neznámé';
  try {
    const date = new Date(text);
    if (!Number.isFinite(date.getTime())) return text;
    return date.toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    return text;
  }
}

function buildAdminSessionDevicesHtml(source) {
  const settings = source && typeof source === 'object' && Array.isArray(source.sessions)
    ? source
    : rakAdminGetAccountsSettings();
  const sessions = (Array.isArray(settings.sessions) ? settings.sessions : [])
    .filter((entry) => entry && !entry.revokedAt)
    .sort((a, b) => String(b.lastSeenAt || '').localeCompare(String(a.lastSeenAt || '')));
  const current = rakAdminReadPersistentSession();
  const currentDeviceId = String(current && current.deviceId || rakAdminGetDeviceId() || '').trim();
  const rows = sessions.length
    ? sessions.map((entry) => {
        const isCurrent = String(entry.deviceId || '') === currentDeviceId;
        return [
          '<tr>',
          '  <td><b>' + escapeHtml(entry.label || 'Zařízení') + '</b><br><small>' + escapeHtml(isCurrent ? 'toto zařízení' : entry.deviceId) + '</small></td>',
          '  <td>' + escapeHtml(entry.accountId || '') + '</td>',
          '  <td>' + escapeHtml(adminSessionDateLabel(entry.lastSeenAt || entry.createdAt)) + '</td>',
          '  <td>' + (isCurrent ? '<button type="button" class="appMenuTinyButton" data-admin-action="revoke-admin-session" data-admin-current-device="1" data-admin-device-id="' + escapeHtml(entry.deviceId || '') + '">Odhlásit toto</button>' : '<button type="button" class="appMenuTinyButton" data-admin-action="revoke-admin-session" data-admin-device-id="' + escapeHtml(entry.deviceId || '') + '">Odhlásit</button>') + '</td>',
          '</tr>'
        ].join('');
      }).join('')
    : '<tr><td colspan="4"><span class="smallText">Zatím není uložené žádné odemčené admin zařízení. Objeví se po přihlášení admin heslem.</span></td></tr>';
  return [
    '<div class="tableWrap appMenuTableWrap uMt8">',
    '  <div class="appMenuSubTitle">Přihlášená admin zařízení</div>',
    '  <div class="smallText uMb10">Hlavní admin tady vidí zařízení, kde zůstala administrace odemčená. Odhlášení zařízení zruší jeho uloženou admin relaci.</div>',
    '  <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense adminAccountsTable">',
    '    <thead><tr><th>Zařízení</th><th>Účet</th><th>Naposledy</th><th>Akce</th></tr></thead>',
    '    <tbody>' + rows + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
}

function normalizeAdminAccountDraftRows(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const filledRows = safeRows.filter((entry) => {
    const safe = entry && typeof entry === 'object' ? entry : {};
    return !!(String(safe.accountId || '').trim() || String(safe.label || '').trim() || String(safe.password || '').trim());
  }).map((entry) => ({
    accountId: String(entry && entry.accountId || '').trim(),
    label: String(entry && entry.label || '').trim(),
    password: String(entry && entry.password || '').trim(),
    enabled: !(entry && entry.enabled === false)
  }));
  const counts = new Map();
  filledRows.forEach((entry) => {
    const id = String(entry.accountId || '').trim();
    if (!id) return;
    counts.set(id, (counts.get(id) || 0) + 1);
  });
  const completeAdmins = filledRows.filter((entry) => (
    entry.accountId
    && entry.accountId !== RAK_OWNER_ADMIN_ACCOUNT_ID
    && entry.password
    && entry.enabled !== false
  ));
  const missingPassword = filledRows.filter((entry) => (
    entry.accountId
    && entry.accountId !== RAK_OWNER_ADMIN_ACCOUNT_ID
    && !entry.password
  )).length;
  const incompleteRows = filledRows.filter((entry) => (
    (!entry.accountId && (entry.label || entry.password))
    || (entry.accountId && entry.accountId !== RAK_OWNER_ADMIN_ACCOUNT_ID && !entry.password)
  )).length;
  const ownerRows = filledRows.filter((entry) => entry.accountId === RAK_OWNER_ADMIN_ACCOUNT_ID).length;
  const duplicateIds = Array.from(counts.entries()).filter(([, count]) => count > 1).map(([id]) => id);
  return {
    filledRows,
    completeAdmins,
    enabledAdmins: completeAdmins.length,
    missingPassword,
    incompleteRows,
    ownerRows,
    duplicateIds
  };
}

function buildAdminAccountsStatusHtml(source) {
  const settings = source && typeof source === 'object' && Array.isArray(source.admins)
    ? source
    : rakAdminGetAccountsSettings();
  const rows = source && typeof source === 'object' && Array.isArray(source.rows)
    ? source.rows
    : (Array.isArray(settings.admins) ? settings.admins : []);
  const status = normalizeAdminAccountDraftRows(rows);
  const canManage = typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins();
  const activeTotal = 1 + status.enabledAdmins;
  const passwordValue = status.missingPassword > 0 ? String(status.missingPassword) + ' chybi' : 'OK';
  const passwordDetail = status.missingPassword > 0
    ? 'Doplneni hesla je nutne pred ulozenim spravce.'
    : 'Kazdy rozepsany spravce s uctem ma heslo.';
  const issueCount = status.incompleteRows + status.ownerRows + status.duplicateIds.length;
  const issueDetail = issueCount > 0
    ? [
        status.incompleteRows ? String(status.incompleteRows) + ' nedokoncene' : '',
        status.ownerRows ? 'owner se nepridava do tabulky' : '',
        status.duplicateIds.length ? 'duplicity: ' + status.duplicateIds.join(', ') : ''
      ].filter(Boolean).join('; ')
    : 'Prazdne radky se pri ulozeni ignoruji.';
  return [
    '<div class="adminAccountsStatus" id="adminAccountsStatus" aria-live="polite">',
    '  <div class="adminAccountsStatusTitle">Stav spravcu</div>',
    '  <div class="adminAccountsStatusGrid">',
    adminAccountsStatusItemHtml('Opravneni', canManage ? 'Hlavni admin' : 'Jen cteni', canManage ? 'Tento ucet muze menit spravce.' : 'Seznam spravcu muze menit jen hlavni admin.', canManage ? 'isOk' : 'isWarn'),
    adminAccountsStatusItemHtml('Aktivni spravci', String(activeTotal) + ' celkem', 'Ucet ' + RAK_OWNER_ADMIN_ACCOUNT_ID + ' + ' + String(status.enabledAdmins) + ' dalsi.', 'isOk'),
    adminAccountsStatusItemHtml('Hesla', passwordValue, passwordDetail, status.missingPassword > 0 ? 'isWarn' : 'isOk'),
    adminAccountsStatusItemHtml('Kontrola radku', issueCount > 0 ? String(issueCount) + ' k reseni' : 'OK', issueDetail, issueCount > 0 ? 'isWarn' : 'isOk'),
    '  </div>',
    '</div>'
  ].join('');
}

function buildAdminAccountsSettingsHtml() {
  if (!rakAdminCanManageAdmins()) {
    return [
      buildAdminAccountsStatusHtml(rakAdminGetAccountsSettings()),
      '<div class="adminAccountsReadonlyNotice">',
      '  <b>Seznam spravcu muze menit jen hlavni admin.</b>',
      '  <span>Nizsi admin muze spravovat provoz, rozpisy, absence, zalohy, exporty a nastaveni aplikace, ale nemuze pridavat dalsi adminy ani menit hesla.</span>',
      '</div>'
    ].join('');
  }
  const settings = rakAdminGetAccountsSettings();
  const rows = settings.admins.concat(Array.from({ length: 4 }, () => ({ accountId: '', label: '', password: '', enabled: true })));
  const body = rows.map((entry) => [
    '<tr data-admin-account-row>',
    '  <td><input class="appMenuInlineInput" data-admin-account-field="accountId" data-admin-account-id value="' + escapeHtml(entry.accountId || '') + '" placeholder="os. c."></td>',
    '  <td><input class="appMenuInlineInput" data-admin-account-field="label" data-admin-account-label value="' + escapeHtml(entry.label || '') + '" placeholder="jmeno / poznamka"></td>',
    '  <td><input class="appMenuInlineInput" data-admin-account-field="password" data-admin-account-password type="password" value="' + escapeHtml(entry.password || '') + '" placeholder="heslo"></td>',
    '  <td><label class="adminRotationOvertimeSwitch"><input type="checkbox" data-admin-account-field="enabled" data-admin-account-enabled ' + (entry.enabled === false ? '' : 'checked') + '><span>ANO</span></label></td>',
    '</tr>'
  ].join('')).join('');
  return [
    buildAdminAccountsStatusHtml({ rows }),
    buildAdminAccountsRoleOverviewHtml(settings),
    buildAdminAccountsSafetyHtml(settings),
    buildAdminSessionDevicesHtml(settings),
    '<div class="tableWrap appMenuTableWrap uMt8">',
    '  <div class="smallText uMb10">Tady pridavas dalsi admin ucty, ktere po prihlaseni uvidi administraci. Pro odebrani spravce smaz ucet nebo heslo a uloz.</div>',
    '  <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense adminAccountsTable">',
    '    <thead><tr><th>Ucet</th><th>Popis</th><th>Heslo</th><th>Aktivni</th></tr></thead>',
    '    <tbody>' + body + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
}

function readAdminAccountsDraftRowsFromDom(root) {
  const scope = root && root.querySelectorAll ? root : document;
  const rows = [];
  scope.querySelectorAll('tr[data-admin-account-row]').forEach((row) => {
    rows.push({
      accountId: String(row.querySelector('[data-admin-account-id]')?.value || '').trim(),
      label: String(row.querySelector('[data-admin-account-label]')?.value || '').trim(),
      password: String(row.querySelector('[data-admin-account-password]')?.value || '').trim(),
      enabled: !!(row.querySelector('[data-admin-account-enabled]') && row.querySelector('[data-admin-account-enabled]').checked)
    });
  });
  return rows;
}

function adminAccountsRefreshStatus(root) {
  const scope = root && root.querySelector ? root : document;
  const statusEl = scope.querySelector ? scope.querySelector('#adminAccountsStatus') : document.getElementById('adminAccountsStatus');
  if (!statusEl) return false;
  const html = buildAdminAccountsStatusHtml({ rows: readAdminAccountsDraftRowsFromDom(scope) });
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const fresh = wrapper.firstElementChild;
  if (!fresh) return false;
  statusEl.replaceWith(fresh);
  return true;
}

function readAdminAccountsSettingsFromDom() {
  const map = new Map();
  const current = rakAdminGetAccountsSettings();
  readAdminAccountsDraftRowsFromDom(document.getElementById('appMenuBody') || document).forEach((entry) => {
    const accountId = String(entry.accountId || '').trim();
    const label = String(entry.label || '').trim();
    const password = String(entry.password || '').trim();
    if (!accountId || accountId === RAK_OWNER_ADMIN_ACCOUNT_ID || !password) return;
    map.set(accountId, {
      accountId,
      label,
      password,
      enabled: entry.enabled !== false
    });
  });
  return {
    type: RAK_ADMIN_ACCOUNTS_SETTINGS_CATEGORY,
    ownerAccountId: RAK_OWNER_ADMIN_ACCOUNT_ID,
    admins: Array.from(map.values()).sort((a, b) => a.accountId.localeCompare(b.accountId)),
    sessions: Array.isArray(current.sessions) ? current.sessions : [],
    updatedAt: new Date().toISOString()
  };
}

function bindAdminAccountUnlock() {
  try { localStorage.removeItem('adminUnlocked'); } catch (err) {}
  if (document.documentElement.dataset.adminAccountUnlockBound === '1') return true;
  document.documentElement.dataset.adminAccountUnlockBound = '1';
  const restored = rakAdminRestoreSessionForActiveAccount();
  if (!restored) rakAdminScheduleStartupPrompt();
  try {
    rakAdminLoadSettingsThenCheck('settings-loaded');
  } catch (err) {}
  return true;
}

try {
  window.RAK_OWNER_ADMIN_ACCOUNT_ID = RAK_OWNER_ADMIN_ACCOUNT_ID;
  window.RAK_ADMIN_ACCOUNTS_SETTINGS_KEY = RAK_ADMIN_ACCOUNTS_SETTINGS_KEY;
  window.RAK_ADMIN_ACCOUNTS_SETTINGS_CATEGORY = RAK_ADMIN_ACCOUNTS_SETTINGS_CATEGORY;
  window.rakAdminIsOwnerAccount = rakAdminIsOwnerAccount;
  window.rakAdminIsAccountsSettingsRow = rakAdminIsAccountsSettingsRow;
  window.rakAdminAccountRequiresPassword = rakAdminAccountRequiresPassword;
  window.rakAdminPromptUnlockForAccount = rakAdminPromptUnlockForAccount;
  window.rakAdminPromptOnceForActiveAccount = rakAdminPromptOnceForActiveAccount;
  window.rakAdminRestoreSessionForActiveAccount = rakAdminRestoreSessionForActiveAccount;
  window.rakAdminRestorePersistentSessionForActiveAccount = rakAdminRestorePersistentSessionForActiveAccount;
  window.rakAdminRevokePersistentSession = rakAdminRevokePersistentSession;
  window.rakAdminLock = rakAdminLock;
  window.rakAdminCanOpenAdmin = rakAdminCanOpenAdmin;
  window.rakAdminCanManageAdmins = rakAdminCanManageAdmins;
  window.buildAdminAccountsRoleOverviewHtml = buildAdminAccountsRoleOverviewHtml;
  window.buildAdminAccountsStatusHtml = buildAdminAccountsStatusHtml;
  window.adminAccountsRefreshStatus = adminAccountsRefreshStatus;
  window.readAdminAccountsDraftRowsFromDom = readAdminAccountsDraftRowsFromDom;
  window.buildAdminAccountsSettingsHtml = buildAdminAccountsSettingsHtml;
  window.readAdminAccountsSettingsFromDom = readAdminAccountsSettingsFromDom;
  window.mergeAdminAccountsSettingsRows = mergeAdminAccountsSettingsRows;
} catch (err) {}

if (!bindAdminAccountUnlock()) {
  registerListener(document, 'DOMContentLoaded', bindAdminAccountUnlock, { once: true });
}
