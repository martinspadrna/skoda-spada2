// RaK v1.5.83 – iOS-safe single-pass opening of the Více page.
(function installRakV1583MoreNavigationFix() {
  const previousToggle = typeof window.toggleAppMenu === 'function' ? window.toggleAppMenu : null;

  function toggleAppMenuSinglePass() {
    // showPage('menu') already calls openAppMenu('menu') internally. Calling both
    // here caused the menu body to render twice during one tap, which could make
    // Safari/PWA flash white and leave the fixed bottom navigation in a bad layout.
    if (typeof showPage === 'function') {
      showPage('menu');
      return;
    }

    // Defensive fallback for an incomplete boot only. Never combine this path
    // with showPage(), so a normal tap still performs exactly one menu render.
    if (typeof openAppMenu === 'function') {
      openAppMenu('menu');
      if (typeof setBottomNavActive === 'function') setBottomNavActive('menu');
      return;
    }

    if (previousToggle) previousToggle();
  }

  window.toggleAppMenu = toggleAppMenuSinglePass;
  window.__rakV1583MoreNavigationFixInstalled = true;

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-v1583-more-fix.js', 'loaded', { source: 'dynamic-loader' });
    }
  } catch (err) {}
})();
