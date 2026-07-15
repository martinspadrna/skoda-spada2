// RaK 1.2 (1.192) - admin opravneni navazane na prihlaseny ucet.
const RAK_OWNER_ADMIN_ACCOUNT_ID = '9811';
const RAK_OWNER_ADMIN_PASSWORD = '772326';
const RAK_ADMIN_SESSION_UNLOCKED_KEY = 'adminUnlockedSession';
const RAK_ADMIN_SESSION_PIN_KEY = 'adminPinSession';
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

function rakAdminAccountRequiresPassword(accountId) {
  return rakAdminIsOwnerAccount(accountId);
}

function rakAdminClearSession() {
  try {
    sessionStorage.removeItem(RAK_ADMIN_SESSION_UNLOCKED_KEY);
    sessionStorage.removeItem(RAK_ADMIN_SESSION_PIN_KEY);
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
  if (pass !== RAK_OWNER_ADMIN_PASSWORD) return false;
  if (typeof app !== 'undefined' && app) {
    app.adminUnlocked = true;
    app.adminPin = pass;
    app.adminAccountId = id;
    app.adminIsOwner = rakAdminIsOwnerAccount(id);
    app.contactTapCount = 0;
  }
  try {
    sessionStorage.setItem(RAK_ADMIN_SESSION_UNLOCKED_KEY, '1');
    sessionStorage.setItem(RAK_ADMIN_SESSION_PIN_KEY, pass);
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
    const pin = String(sessionStorage.getItem(RAK_ADMIN_SESSION_PIN_KEY) || '').trim();
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

function bindAdminSecretUnlock() {
  try { localStorage.removeItem('adminUnlocked'); } catch (err) {}
  if (document.documentElement.dataset.adminSecretBound === '1') return true;
  document.documentElement.dataset.adminSecretBound = '1';
  rakAdminRestoreSessionForActiveAccount();
  return true;
}

try {
  window.RAK_OWNER_ADMIN_ACCOUNT_ID = RAK_OWNER_ADMIN_ACCOUNT_ID;
  window.rakAdminIsOwnerAccount = rakAdminIsOwnerAccount;
  window.rakAdminAccountRequiresPassword = rakAdminAccountRequiresPassword;
  window.rakAdminPromptUnlockForAccount = rakAdminPromptUnlockForAccount;
  window.rakAdminRestoreSessionForActiveAccount = rakAdminRestoreSessionForActiveAccount;
  window.rakAdminLock = rakAdminLock;
  window.rakAdminCanOpenAdmin = rakAdminCanOpenAdmin;
} catch (err) {}

if (!bindAdminSecretUnlock()) {
  registerListener(document, 'DOMContentLoaded', bindAdminSecretUnlock, { once: true });
}
