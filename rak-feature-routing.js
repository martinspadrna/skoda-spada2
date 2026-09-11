// RaK v1.5.87 hotfix – Boot v2 routing + background warmup for fast first navigation.
(function installRakFeatureRouting() {
  'use strict';
  if (window.__rakFeatureRoutingInstalled) return;
  window.__rakFeatureRoutingInstalled = true;

  // app-menu.js historicky volá admin zoom guard už při navázání běžného menu.
  // V Boot v2 ale admin modul ještě nemusí být načtený, proto dočasný bezpečný stub.
  // Jakmile se načte admin feature, skutečná implementace globální funkci přepíše.
  if (typeof window.adminBindRotationZoomGuard !== 'function') {
    const adminZoomStub = function adminBindRotationZoomGuardBootV2Stub() {};
    adminZoomStub.__rakBootV2Stub = true;
    window.adminBindRotationZoomGuard = adminZoomStub;
  }

  const ACTION_FEATURE = Object.freeze({
    rotace: 'rotation',
    rozpisy: 'rotation',
    statistiky: 'rotation',
    kalkulacky: 'calculators',
    menu: 'menu'
  });

  function resolveTarget(event) {
    const source = event && event.target && typeof event.target.closest === 'function' ? event.target : null;
    if (!source) return null;

    const nav = source.closest('nav.bottomNav button[data-action]');
    if (nav && document.documentElement.contains(nav)) {
      const feature = String(ACTION_FEATURE[String(nav.dataset.action || '').trim()] || '');
      return feature ? { element: nav, feature } : null;
    }

    const admin = source.closest('#appMenuBody [data-menu-action="admin"]');
    if (admin && document.documentElement.contains(admin)) return { element: admin, feature: 'admin' };
    return null;
  }

  function startFeature(target) {
    if (!target || !target.element || !target.feature || typeof window.rakEnsureFeature !== 'function') return null;
    if (typeof window.rakIsFeatureReady === 'function' && window.rakIsFeatureReady(target.feature)) return null;
    try {
      target.element.classList.add('rakFeatureLoading');
      target.element.setAttribute('aria-busy', 'true');
    } catch (_) {}
    return window.rakEnsureFeature(target.feature);
  }

  // Pointerdown získá náskok před clickem. Pointer-events ale nevypínáme,
  // protože Safari musí vždy doručit dokončovací click.
  document.addEventListener('pointerdown', (event) => {
    const target = resolveTarget(event);
    if (!target) return;
    const pending = startFeature(target);
    if (pending && typeof pending.catch === 'function') pending.catch(() => {});
  }, { capture: true, passive: true });

  document.addEventListener('click', (event) => {
    const target = resolveTarget(event);
    if (!target || typeof window.rakEnsureFeature !== 'function') return;
    const el = target.element;
    const feature = target.feature;
    if (typeof window.rakIsFeatureReady === 'function' && window.rakIsFeatureReady(feature)) {
      try { el.classList.remove('rakFeatureLoading'); el.removeAttribute('aria-busy'); } catch (_) {}
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    if (el.dataset.rakFeatureReplay === '1') return;
    el.dataset.rakFeatureReplay = '1';
    startFeature(target).then(() => {
      try {
        el.classList.remove('rakFeatureLoading');
        el.removeAttribute('aria-busy');
        delete el.dataset.rakFeatureReplay;
        el.click();
      } catch (err) {
        delete el.dataset.rakFeatureReplay;
        throw err;
      }
    }).catch((err) => {
      try {
        el.classList.remove('rakFeatureLoading');
        el.removeAttribute('aria-busy');
        delete el.dataset.rakFeatureReplay;
      } catch (_) {}
      if (typeof window.rakHandleFeatureLoadError === 'function') window.rakHandleFeatureLoadError(err, feature);
      else console.error('RaK feature route load failed', feature, err);
    });
  }, true);

  // Boot v2 má Home zobrazit jako první, ale uživatel nemá platit několikasekundovou
  // penalizaci při každém prvním klepnutí. Jakmile je Home interaktivní, běžné sekce
  // se okamžitě zahřejí na pozadí. Administrace se zahřeje až po nich a po sync závislosti.
  let warmupStarted = false;
  function startBackgroundWarmup() {
    if (warmupStarted || typeof window.rakEnsureFeature !== 'function') return;
    if (!window.__rakBootV2StartupReady) {
      setTimeout(startBackgroundWarmup, 40);
      return;
    }
    warmupStarted = true;
    const common = ['menu', 'rotation', 'calculators'];
    Promise.allSettled(common.map((feature) => window.rakEnsureFeature(feature))).then(() => {
      setTimeout(() => {
        if (typeof window.rakEnsureFeature !== 'function') return;
        window.rakEnsureFeature('admin').catch((err) => console.warn('Boot v2 admin warmup failed', err));
      }, 80);
    }).catch(() => {});
  }
  setTimeout(startBackgroundWarmup, 0);

  // Po skutečném načtení Administrace znovu spusť zoom guard, protože první menu
  // mohlo být navázané ještě nad dočasným stubem.
  window.addEventListener('rak:feature-ready', (event) => {
    const feature = String(event && event.detail && event.detail.feature || '');
    if (feature !== 'admin') return;
    try {
      if (typeof window.adminBindRotationZoomGuard === 'function' && !window.adminBindRotationZoomGuard.__rakBootV2Stub) {
        window.adminBindRotationZoomGuard();
      }
    } catch (err) {
      console.warn('Admin zoom guard after lazy load failed', err);
    }
  });

  try {
    const style = document.createElement('style');
    style.id = 'rakFeatureRoutingStyle';
    style.textContent = '.rakFeatureLoading{opacity:.62!important;}';
    document.head.appendChild(style);
  } catch (_) {}

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-feature-routing.js', 'loaded', { source: 'boot-v2-loader', build: '1.5.87-hotfix1' });
    }
  } catch (_) {}
})();