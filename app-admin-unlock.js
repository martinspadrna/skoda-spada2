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
const RAK_ADMIN_TRUSTED_SESSION_MARKER = '::rak-trusted-session::';

// Synchronni SHA-256 (bez Web Crypto), aby hesla nizsich adminu nemusela byt
// ulozena/porovnavana jako plaintext v Supabase radku ani v uplne zaloze nastaveni.
function rakSha256Hex(input) {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const rotr = (n, x) => (x >>> n) | (x << (32 - n));
  const utf8 = unescape(encodeURIComponent(String(input == null ? '' : input)));
  const bytes = [];
  for (let i = 0; i < utf8.length; i += 1) bytes.push(utf8.charCodeAt(i) & 0xff);
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i -= 1) bytes.push(Math.floor(bitLen / Math.pow(2, i * 8)) & 0xff);
  for (let chunk = 0; chunk < bytes.length; chunk += 64) {
    const w = new Array(64).fill(0);
    for (let i = 0; i < 16; i += 1) {
      w[i] = ((bytes[chunk + i * 4] << 24) | (bytes[chunk + i * 4 + 1] << 16) | (bytes[chunk + i * 4 + 2] << 8) | bytes[chunk + i * 4 + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
      const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i += 1) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map((v) => v.toString(16).padStart(8, '0')).join('');
}

function rakAdminHashPassword(password, salt) {
  return rakSha256Hex(String(salt || '') + ':' + String(password || ''));
}

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
  const rawPassword = String(safe.password || safe.pin || '').trim();
  let passwordHash = String(safe.passwordHash || safe.password_hash || '').trim();
  let passwordSalt = String(safe.passwordSalt || safe.password_salt || '').trim();
  if (rawPassword) {
    passwordSalt = passwordSalt || rakAdminMakeId('salt');
    passwordHash = rakAdminHashPassword(rawPassword, passwordSalt);
  }
  if (!passwordHash || !passwordSalt) return null;
  return {
    accountId,
    label: String(safe.label || safe.name || '').trim(),
    passwordHash,
    passwordSalt,
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

function rakAdminVerifyPasswordForAccount(accountId, pass) {
  const id = String(accountId || '').trim();
  const safePass = String(pass || '');
  if (!safePass) return false;
  if (rakAdminIsOwnerAccount(id)) return safePass === RAK_OWNER_ADMIN_PASSWORD;
  const managed = rakAdminFindManagedEntry(id);
  if (!managed || !managed.passwordHash || !managed.passwordSalt) return false;
  return rakAdminHashPassword(safePass, managed.passwordSalt) === managed.passwordHash;
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
  const pass = String(authPin || '').trim();
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
  const restored = rakAdminApplyUnlockedAccount(activeId, RAK_ADMIN_TRUSTED_SESSION_MARKER, { touchPersistent: false, source: reason || 'persistent' });
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
  if (!rakAdminVerifyPasswordForAccount(id, pass)) return false;
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
    if (unlocked && sessionAccount === activeId && pin === RAK_ADMIN_TRUSTED_SESSION_MARKER) {
      return rakAdminApplyUnlockedAccount(activeId, pin, { touchPersistent: false });
    }
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
    return !!(String(safe.accountId || '').trim() || String(safe.label || '').trim() || String(safe.password || '').trim() || safe.passwordHash);
  }).map((entry) => ({
    accountId: String(entry && entry.accountId || '').trim(),
    label: String(entry && entry.label || '').trim(),
    hasPassword: !!(String(entry && entry.password || '').trim() || (entry && entry.passwordHash)),
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
    && entry.hasPassword
    && entry.enabled !== false
  ));
  const missingPassword = filledRows.filter((entry) => (
    entry.accountId
    && entry.accountId !== RAK_OWNER_ADMIN_ACCOUNT_ID
    && !entry.hasPassword
  )).length;
  const incompleteRows = filledRows.filter((entry) => (
    (!entry.accountId && (entry.label || entry.hasPassword))
    || (entry.accountId && entry.accountId !== RAK_OWNER_ADMIN_ACCOUNT_ID && !entry.hasPassword)
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
  const rows = settings.admins.concat(Array.from({ length: 4 }, () => ({ accountId: '', label: '', passwordHash: '', enabled: true })));
  const body = rows.map((entry) => [
    '<tr data-admin-account-row>',
    '  <td><input class="appMenuInlineInput" data-admin-account-field="accountId" data-admin-account-id value="' + escapeHtml(entry.accountId || '') + '" placeholder="os. c."></td>',
    '  <td><input class="appMenuInlineInput" data-admin-account-field="label" data-admin-account-label value="' + escapeHtml(entry.label || '') + '" placeholder="jmeno / poznamka"></td>',
    '  <td><input class="appMenuInlineInput" data-admin-account-field="password" data-admin-account-password type="password" value="" placeholder="' + (entry.passwordHash ? 'necháš prázdné = beze změny' : 'heslo') + '"></td>',
    '  <td><label class="adminRotationOvertimeSwitch"><input type="checkbox" data-admin-account-field="enabled" data-admin-account-enabled ' + (entry.enabled === false ? '' : 'checked') + '><span>ANO</span></label></td>',
    '  <td><button type="button" class="adminRotationGeneratorIconBtn" data-admin-action="admin-account-row-clear" title="Vyprázdnit řádek">×</button></td>',
    '</tr>'
  ].join('')).join('');
  return [
    buildAdminAccountsStatusHtml({ rows }),
    buildAdminAccountsRoleOverviewHtml(settings),
    buildAdminAccountsSafetyHtml(settings),
    buildAdminSessionDevicesHtml(settings),
    '<div class="tableWrap appMenuTableWrap uMt8">',
    '  <div class="smallText uMb10">Tady pridavas dalsi admin ucty, ktere po prihlaseni uvidi administraci. Heslo nech prazdne, pokud ho nechces menit. Pro odebrani spravce klikni na × u radku (nebo smaz ucet) a uloz. Hesla se ukladaji jen jako hash, appka je uz zpatky neumi zobrazit.</div>',
    '  <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense adminAccountsTable">',
    '    <thead><tr><th>Ucet</th><th>Popis</th><th>Heslo</th><th>Aktivni</th><th></th></tr></thead>',
    '    <tbody>' + body + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
}

function readAdminAccountsDraftRowsFromDom(root) {
  const scope = root && root.querySelectorAll ? root : document;
  const existingByIdMap = new Map((rakAdminGetAccountsSettings().admins || []).map((entry) => [entry.accountId, entry]));
  const rows = [];
  scope.querySelectorAll('tr[data-admin-account-row]').forEach((row) => {
    const accountId = String(row.querySelector('[data-admin-account-id]')?.value || '').trim();
    const existing = existingByIdMap.get(accountId) || null;
    rows.push({
      accountId,
      label: String(row.querySelector('[data-admin-account-label]')?.value || '').trim(),
      password: String(row.querySelector('[data-admin-account-password]')?.value || '').trim(),
      passwordHash: existing ? existing.passwordHash : '',
      passwordSalt: existing ? existing.passwordSalt : '',
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

function rakAdminClearAccountRow(target) {
  const row = target && typeof target.closest === 'function' ? target.closest('tr[data-admin-account-row]') : null;
  if (!row) return;
  const idInput = row.querySelector('[data-admin-account-id]');
  const labelInput = row.querySelector('[data-admin-account-label]');
  const passwordInput = row.querySelector('[data-admin-account-password]');
  const enabledInput = row.querySelector('[data-admin-account-enabled]');
  if (idInput) idInput.value = '';
  if (labelInput) labelInput.value = '';
  if (passwordInput) { passwordInput.value = ''; passwordInput.placeholder = 'heslo'; }
  if (enabledInput) enabledInput.checked = true;
  try { adminAccountsRefreshStatus(document.getElementById('appMenuBody') || document); } catch (err) {}
  const status = document.getElementById('adminOnlineSaveStatus');
  if (status) status.textContent = 'Řádek je vyprázdněný. Odebrání se uloží až tlačítkem Uložit správce.';
}

function readAdminAccountsSettingsFromDom() {
  const map = new Map();
  const current = rakAdminGetAccountsSettings();
  readAdminAccountsDraftRowsFromDom(document.getElementById('appMenuBody') || document).forEach((entry) => {
    const accountId = String(entry.accountId || '').trim();
    if (!accountId || accountId === RAK_OWNER_ADMIN_ACCOUNT_ID) return;
    if (!entry.password && !entry.passwordHash) return;
    const normalized = rakAdminNormalizeManagedEntry({
      accountId,
      label: entry.label,
      password: entry.password,
      passwordHash: entry.passwordHash,
      passwordSalt: entry.passwordSalt,
      enabled: entry.enabled !== false
    });
    if (normalized) map.set(accountId, normalized);
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
  window.rakAdminClearAccountRow = rakAdminClearAccountRow;
  window.buildAdminAccountsSettingsHtml = buildAdminAccountsSettingsHtml;
  window.readAdminAccountsSettingsFromDom = readAdminAccountsSettingsFromDom;
  window.mergeAdminAccountsSettingsRows = mergeAdminAccountsSettingsRows;
} catch (err) {}

if (!bindAdminAccountUnlock()) {
  registerListener(document, 'DOMContentLoaded', bindAdminAccountUnlock, { once: true });
}
