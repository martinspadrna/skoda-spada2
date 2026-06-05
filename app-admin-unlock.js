// RaK 1.2 (1.133) – admin odemčení oddělené ze startovacích vazeb aplikace.
function bindAdminSecretUnlock() {
  try { localStorage.removeItem('adminUnlocked'); } catch (err) {}
  if (document.documentElement.dataset.adminSecretBound === '1') return true;
  document.documentElement.dataset.adminSecretBound = '1';

  let tapCount = 0;
  let tapTimer = null;

  registerListener(document, 'click', (event) => {
    const target = event.target && typeof event.target.closest === 'function'
      ? event.target.closest('.bottomNavMenuBtn')
      : null;
    if (!target) return;
    if (typeof app !== 'undefined' && app.adminUnlocked) return;

    tapCount += 1;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { tapCount = 0; }, 1200);

    if (tapCount < 3) return;
    tapCount = 0;

    const pass = prompt('Heslo administrace:') || '';
    if (pass.trim() === '772326') {
      if (typeof app !== 'undefined') {
        app.adminUnlocked = true;
        app.contactTapCount = 0;
      }
      try {
        sessionStorage.setItem('adminUnlockedSession', '1');
        localStorage.removeItem('adminUnlocked');
      } catch (err) {
        console.warn(err);
      }
      if (typeof updateImportBoxVisibility === 'function') updateImportBoxVisibility();
      if (typeof openAppMenu === 'function') openAppMenu('admin');
      else alert('Administrace odemčena.');
    } else {
      alert('Špatné přihlášení.');
    }
  }, { capture: true });

  return true;
}

if (!bindAdminSecretUnlock()) {
  registerListener(document, 'DOMContentLoaded', bindAdminSecretUnlock, { once: true });
}
