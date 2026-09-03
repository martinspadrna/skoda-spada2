// RaK admin menu fix – obnoví vazbu přihlášeného účtu na vstup do administrace.
// Bezpečnostní oprávnění zůstávají v app-admin-unlock.js; tento modul pouze správně zjistí aktivní účet pro zobrazení menu.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('rak-admin-menu-fix.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}

function rakAdminMenuResolveActiveAccountId() {
  let activeId = '';
  try {
    if (typeof rakAdminGetActiveAccountId === 'function') {
      activeId = String(rakAdminGetActiveAccountId() || '').trim();
    }
  } catch (err) {}

  if (!activeId) {
    try {
      if (typeof gamesGetProfile === 'function') {
        const profile = gamesGetProfile();
        activeId = String(profile && profile.activeAccountId || '').trim();
      }
    } catch (err) {}
  }

  if (!activeId) {
    try {
      const key = (typeof APP_KEY !== 'undefined' ? APP_KEY : 'rotace_kalkulacky_state_v123') + ':games_profile_v1';
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        activeId = String(parsed && parsed.activeAccountId || '').trim();
      }
    } catch (err) {}
  }

  return activeId;
}

function appMenuShouldShowAdminEntry() {
  const activeId = rakAdminMenuResolveActiveAccountId();
  if (!activeId) return false;

  // Hlavní účet 9811 musí vidět vstup do administrace i před dokončením
  // obnovení admin session. Samotné oprávnění se stále ověřuje až při vstupu.
  if (activeId === '9811') return true;

  try {
    if (typeof rakAdminCanOpenAdmin === 'function' && rakAdminCanOpenAdmin()) return true;
  } catch (err) {}

  try {
    if (typeof rakAdminAccountRequiresPassword === 'function' && rakAdminAccountRequiresPassword(activeId)) return true;
  } catch (err) {}

  return false;
}

window.RAK_ADMIN_MENU_FIX_VERSION = '1.2.341';
