// RaK 1.2 (1.223) - admin opravneni navazane na prihlaseny ucet.
const RAK_OWNER_ADMIN_ACCOUNT_ID = '9811';
const RAK_OWNER_ADMIN_PASSWORD = '772326';
const RAK_ADMIN_ACCOUNTS_SETTINGS_KEY = 'ADMIN_ACCOUNTS_SETTINGS';
const RAK_ADMIN_ACCOUNTS_SETTINGS_CATEGORY = 'admin_accounts_settings';
const RAK_ADMIN_SESSION_UNLOCKED_KEY = 'adminUnlockedSession';
const RAK_ADMIN_SESSION_PIN_KEY = 'adminPinSession';
const RAK_ADMIN_SESSION_AUTH_PIN_KEY = 'adminAuthPinSession';
const RAK_ADMIN_SESSION_ACCOUNT_KEY = 'adminAccountIdSession';
const RAK_ADMIN_SESSION_OWNER_KEY = 'adminOwnerSession';

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
  return {
    type: RAK_ADMIN_ACCOUNTS_SETTINGS_CATEGORY,
    ownerAccountId: RAK_OWNER_ADMIN_ACCOUNT_ID,
    admins: entries
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

function rakAdminClearSession() {
  try {
    sessionStorage.removeItem(RAK_ADMIN_SESSION_UNLOCKED_KEY);
    sessionStorage.removeItem(RAK_ADMIN_SESSION_PIN_KEY);
    sessionStorage.removeItem(RAK_ADMIN_SESSION_AUTH_PIN_KEY);
    sessionStorage.removeItem(RAK_ADMIN_SESSION_ACCOUNT_KEY);
    sessionStorage.removeItem(RAK_ADMIN_SESSION_OWNER_KEY);
    localStorage.removeItem('adminUnlocked');
  } catch (err) {}
}

function rakAdminLock() {
  if (typeof app !== 'undefined' && app) {
    app.adminUnlocked = false;
    app.adminPin = '';
    app.adminAccountId = '';
    app.adminIsOwner = false;
  }
  rakAdminClearSession();
}

function rakAdminUnlockForAccount(accountId, pin) {
  const id = String(accountId || '').trim();
  const pass = String(pin || '').trim();
  if (!id || !rakAdminAccountRequiresPassword(id)) {
    rakAdminLock();
    return false;
  }
  if (pass !== rakAdminExpectedPasswordForAccount(id)) return false;
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
  if (typeof updateImportBoxVisibility === 'function') updateImportBoxVisibility();
  return true;
}

function rakAdminRestoreSessionForActiveAccount() {
  const activeId = rakAdminGetActiveAccountId();
  if (!rakAdminAccountRequiresPassword(activeId)) {
    rakAdminLock();
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
    rakAdminLock();
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
  rakAdminLock();
  try { alert('Spatne heslo administrace.'); } catch (err) {}
  return false;
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
    '    <span>Dalsi spravci</span>',
    '    <b>' + String(enabledAdmins) + ' aktivni</b>',
    '    <small>Muzou spravovat provoz a rozpisy, ale nemuzou menit seznam spravcu.</small>',
    '  </div>',
    '  <div class="adminAccountsRoleCard isInfo">',
    '    <span>Prihlaseni</span>',
    '    <b>ucet + heslo</b>',
    '    <small>Novy spravce musi mit bezny ucet v aplikaci; po jeho vyberu se administrace zepta na heslo.</small>',
    '  </div>',
    '</div>'
  ].join('');
}

function buildAdminAccountsSettingsHtml() {
  if (!rakAdminCanManageAdmins()) {
    return [
      '<div class="adminAccountsReadonlyNotice">',
      '  <b>Seznam spravcu muze menit jen hlavni admin.</b>',
      '  <span>Bezny admin muze spravovat provoz, rozpisy a nastaveni, ale nemuze pridavat dalsi spravce ani menit jejich hesla.</span>',
      '</div>'
    ].join('');
  }
  const settings = rakAdminGetAccountsSettings();
  const rows = settings.admins.concat(Array.from({ length: 4 }, () => ({ accountId: '', label: '', password: '', enabled: true })));
  const body = rows.map((entry) => [
    '<tr data-admin-account-row>',
    '  <td><input class="appMenuInlineInput" data-admin-account-id value="' + escapeHtml(entry.accountId || '') + '" placeholder="os. c."></td>',
    '  <td><input class="appMenuInlineInput" data-admin-account-label value="' + escapeHtml(entry.label || '') + '" placeholder="jmeno / poznamka"></td>',
    '  <td><input class="appMenuInlineInput" data-admin-account-password type="password" value="' + escapeHtml(entry.password || '') + '" placeholder="heslo"></td>',
    '  <td><label class="adminRotationOvertimeSwitch"><input type="checkbox" data-admin-account-enabled ' + (entry.enabled === false ? '' : 'checked') + '><span>ANO</span></label></td>',
    '</tr>'
  ].join('')).join('');
  return [
    buildAdminAccountsRoleOverviewHtml(settings),
    '<div class="tableWrap appMenuTableWrap uMt8">',
    '  <div class="smallText uMb10">Tady pridavas dalsi admin ucty, ktere po prihlaseni uvidi administraci. Pro odebrani spravce smaz ucet nebo heslo a uloz.</div>',
    '  <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense adminAccountsTable">',
    '    <thead><tr><th>Ucet</th><th>Popis</th><th>Heslo</th><th>Aktivni</th></tr></thead>',
    '    <tbody>' + body + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
}

function readAdminAccountsSettingsFromDom() {
  const map = new Map();
  document.querySelectorAll('#appMenuBody tr[data-admin-account-row]').forEach((row) => {
    const accountId = String(row.querySelector('[data-admin-account-id]')?.value || '').trim();
    const label = String(row.querySelector('[data-admin-account-label]')?.value || '').trim();
    const password = String(row.querySelector('[data-admin-account-password]')?.value || '').trim();
    const enabledInput = row.querySelector('[data-admin-account-enabled]');
    if (!accountId || accountId === RAK_OWNER_ADMIN_ACCOUNT_ID || !password) return;
    map.set(accountId, {
      accountId,
      label,
      password,
      enabled: !!(enabledInput && enabledInput.checked)
    });
  });
  return {
    type: RAK_ADMIN_ACCOUNTS_SETTINGS_CATEGORY,
    ownerAccountId: RAK_OWNER_ADMIN_ACCOUNT_ID,
    admins: Array.from(map.values()).sort((a, b) => a.accountId.localeCompare(b.accountId)),
    updatedAt: new Date().toISOString()
  };
}

function bindAdminAccountUnlock() {
  try { localStorage.removeItem('adminUnlocked'); } catch (err) {}
  if (document.documentElement.dataset.adminAccountUnlockBound === '1') return true;
  document.documentElement.dataset.adminAccountUnlockBound = '1';
  rakAdminRestoreSessionForActiveAccount();
  try {
    const activeId = rakAdminGetActiveAccountId();
    const hasSession = sessionStorage.getItem(RAK_ADMIN_SESSION_UNLOCKED_KEY) === '1';
    if (activeId && hasSession && window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function') {
      window.RotationSupabaseBridge.loadMachineSettings().then((rows) => {
        if (typeof app !== 'undefined' && app) app.machineSettingsRows = Array.isArray(rows) ? rows : [];
        rakAdminRestoreSessionForActiveAccount();
      }).catch(() => {});
    }
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
  window.rakAdminRestoreSessionForActiveAccount = rakAdminRestoreSessionForActiveAccount;
  window.rakAdminLock = rakAdminLock;
  window.rakAdminCanOpenAdmin = rakAdminCanOpenAdmin;
  window.rakAdminCanManageAdmins = rakAdminCanManageAdmins;
  window.buildAdminAccountsRoleOverviewHtml = buildAdminAccountsRoleOverviewHtml;
  window.buildAdminAccountsSettingsHtml = buildAdminAccountsSettingsHtml;
  window.readAdminAccountsSettingsFromDom = readAdminAccountsSettingsFromDom;
  window.mergeAdminAccountsSettingsRows = mergeAdminAccountsSettingsRows;
} catch (err) {}

if (!bindAdminAccountUnlock()) {
  registerListener(document, 'DOMContentLoaded', bindAdminAccountUnlock, { once: true });
}
