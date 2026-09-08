// RaK v1.5.20 – cílená obnova mobilní navigace po regresi paralelního/lazy bootstrapu.
(function installRakMobileInteractionRecoveryV1520() {
  'use strict';

  const BUILD = 'v1.5.20';
  let menuWarmPromise = null;
  let rotationOpenPromise = null;

  window.RAK_INTERACTION_RECOVERY_BUILD = BUILD;
  window.RAK_PWA_BUILD = BUILD;
  window.RAK_DEV_BUILD = BUILD;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function waitFor(getter, timeoutMs) {
    const started = Date.now();
    while (Date.now() - started < (timeoutMs || 12000)) {
      try {
        const value = getter();
        if (value) return value;
      } catch (_) {}
      await sleep(50);
    }
    return null;
  }

  function setNavLocks(pageId) {
    const nonHome = pageId !== 'home';
    window.__rotaceManualNavLocked = nonHome;
    window.__rotaceHomeBootLocked = nonHome;
    window.__rotaceUserNavigated = nonHome;
    try {
      if (typeof app !== 'undefined' && app) app.homeBootSuppressed = nonHome;
    } catch (_) {}
  }

  function activateOnlyPage(pageId) {
    try {
      document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));
      const page = document.getElementById(pageId);
      if (page) page.classList.add('active');
      return !!page;
    } catch (_) {
      return false;
    }
  }

  function setBottomActive(pageId) {
    try {
      if (typeof window.setBottomNavActive === 'function') {
        window.setBottomNavActive(pageId);
        return;
      }
      if (typeof setBottomNavActive === 'function') {
        setBottomNavActive(pageId);
        return;
      }
    } catch (_) {}
    try {
      document.querySelectorAll('.bottomNavBtn').forEach((btn) => {
        btn.classList.toggle('active', String(btn.dataset.page || '') === pageId);
      });
    } catch (_) {}
  }

  function cleanRotaceDockWhenLeaving() {
    try {
      if (typeof window.setRotaceNamesDockPortalActive === 'function') {
        window.setRotaceNamesDockPortalActive(false, 'v1520-leave');
      } else if (typeof setRotaceNamesDockPortalActive === 'function') {
        setRotaceNamesDockPortalActive(false, 'v1520-leave');
      }
    } catch (_) {}
    try { document.body && document.body.classList.remove('rakRotaceNamesDockActive'); } catch (_) {}
  }

  async function ensureRotationData() {
    try {
      if (typeof app !== 'undefined' && app && app.rotation && app.rotation.months && Object.keys(app.rotation.months).length) {
        return app.rotation;
      }
    } catch (_) {}

    try {
      if (typeof window.ensureRakSupabaseOnlineStarted === 'function') {
        await Promise.race([
          Promise.resolve(window.ensureRakSupabaseOnlineStarted()),
          sleep(9000)
        ]);
      }
    } catch (error) {
      console.warn('[RaK 1.5.20] Online data warmup failed', error);
    }

    try {
      if (typeof app !== 'undefined' && app && app.rotation && app.rotation.months && Object.keys(app.rotation.months).length) {
        return app.rotation;
      }
    } catch (_) {}

    try {
      if (typeof initialRotationData !== 'undefined' && initialRotationData && initialRotationData.months) {
        const fallback = typeof normalizeRotationData === 'function'
          ? normalizeRotationData(initialRotationData)
          : initialRotationData;
        if (typeof app !== 'undefined' && app) app.rotation = fallback;
        return fallback;
      }
    } catch (error) {
      console.warn('[RaK 1.5.20] Local rotation fallback failed', error);
    }
    return null;
  }

  async function hardOpenRotace() {
    if (rotationOpenPromise) return rotationOpenPromise;
    rotationOpenPromise = (async () => {
      await waitFor(() => (typeof app !== 'undefined' && app) ? app : null, 12000);
      await ensureRotationData();

      setNavLocks('rotace');
      activateOnlyPage('rotace');

      try {
        if (typeof initRotaceCurrentMonth === 'function') initRotaceCurrentMonth();
      } catch (error) {
        console.warn('[RaK 1.5.20] initRotaceCurrentMonth failed', error);
      }

      try {
        if (typeof app !== 'undefined' && app) {
          app.selectedName = null;
          app.nameTapState = null;
          app.rotationView = 'names';
        }
      } catch (_) {}

      try {
        if (typeof setRotaceView === 'function') setRotaceView('names');
      } catch (error) {
        console.warn('[RaK 1.5.20] setRotaceView failed', error);
      }

      try {
        if (typeof setRotaceNamesDockPortalActive === 'function') {
          setRotaceNamesDockPortalActive(true, 'v1520-hard-open');
        }
      } catch (error) {
        console.warn('[RaK 1.5.20] Rotace dock activation failed', error);
      }

      try {
        if (typeof renderRotace === 'function') renderRotace();
      } catch (error) {
        console.error('[RaK 1.5.20] renderRotace failed', error);
      }

      setBottomActive('rotace');
      try { window.scrollTo(0, 0); } catch (_) {}
      try {
        if (typeof scheduleRotaceNamesDockMetrics === 'function') scheduleRotaceNamesDockMetrics('v1520-hard-open');
      } catch (_) {}

      window.RAK_INTERACTION_RECOVERY_STATUS = Object.assign({}, window.RAK_INTERACTION_RECOVERY_STATUS || {}, {
        build: BUILD,
        rotaceOpenedAt: new Date().toISOString(),
        rotationMonths: (() => {
          try { return Object.keys(app && app.rotation && app.rotation.months || {}).length; } catch (_) { return 0; }
        })()
      });
      return true;
    })().finally(() => {
      rotationOpenPromise = null;
    });
    return rotationOpenPromise;
  }

  function warmMenu() {
    if (menuWarmPromise) return menuWarmPromise;
    menuWarmPromise = (async () => {
      const ensure = await waitFor(
        () => typeof window.ensureRakMenuModulesLoaded === 'function' ? window.ensureRakMenuModulesLoaded : null,
        12000
      );
      if (!ensure) throw new Error('Menu loader není dostupný.');
      await ensure();
      return true;
    })().catch((error) => {
      menuWarmPromise = null;
      console.warn('[RaK 1.5.20] Menu warmup failed', error);
      return false;
    });
    return menuWarmPromise;
  }

  async function hardOpenMenu() {
    await warmMenu();
    const open = await waitFor(() => {
      const fn = window.openAppMenu;
      return typeof fn === 'function' ? fn : null;
    }, 4000);

    if (open) {
      try {
        const result = open('menu');
        if (result && typeof result.then === 'function') await result;
        window.RAK_INTERACTION_RECOVERY_STATUS = Object.assign({}, window.RAK_INTERACTION_RECOVERY_STATUS || {}, {
          build: BUILD,
          menuOpenedAt: new Date().toISOString()
        });
        return true;
      } catch (error) {
        console.warn('[RaK 1.5.20] openAppMenu failed', error);
      }
    }

    // Poslední nouzová cesta: menu stránku alespoň zpřístupníme, pokud už existuje v DOM.
    setNavLocks('menu');
    const activated = activateOnlyPage('menu');
    if (activated) setBottomActive('menu');
    return activated;
  }

  function hardOpenHome() {
    cleanRotaceDockWhenLeaving();
    setNavLocks('home');
    activateOnlyPage('home');
    setBottomActive('home');
    try {
      if (typeof scheduleHomeRefresh === 'function') scheduleHomeRefresh();
      else if (typeof forceHomeRefresh === 'function') forceHomeRefresh();
    } catch (_) {}
  }

  document.addEventListener('click', (event) => {
    const button = event.target && event.target.closest
      ? event.target.closest('.bottomNav button[data-action], nav.bottomNav button[data-action]')
      : null;
    if (!button) return;
    const action = String(button.getAttribute('data-action') || '').trim();

    if (action === 'rotace') {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      void hardOpenRotace();
      return;
    }

    if (action === 'menu' || action === 'more' || action === 'app-menu') {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      void hardOpenMenu();
      return;
    }

    if (action === 'home') {
      // Home necháme původnímu handleru, ale odstraníme případný zbylý Rotace dock.
      cleanRotaceDockWhenLeaving();
    }
  }, true);

  // Menu přednačteme po prvním paintu. app-menu.js je malý proti ztrátě funkčního tlačítka Více.
  setTimeout(() => void warmMenu(), 700);

  // Po startu jen uklidíme případný dock, pokud je aktivní Home. Samotná Rotace se neotevírá automaticky.
  setTimeout(() => {
    try {
      const active = document.querySelector('.page.active')?.id || '';
      if (active === 'home') cleanRotaceDockWhenLeaving();
    } catch (_) {}
  }, 1200);

  window.rakHardOpenRotaceV1520 = hardOpenRotace;
  window.rakHardOpenMenuV1520 = hardOpenMenu;
  window.rakHardOpenHomeV1520 = hardOpenHome;
})();