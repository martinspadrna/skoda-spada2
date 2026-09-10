// RaK v1.5.87 – Boot v2 lazy routing guard for main sections and Administrace.
(function installRakFeatureRouting() {
  'use strict';
  if (window.__rakFeatureRoutingInstalled) return;
  window.__rakFeatureRoutingInstalled = true;

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

  try {
    const style = document.createElement('style');
    style.id = 'rakFeatureRoutingStyle';
    style.textContent = '.rakFeatureLoading{opacity:.62!important;}';
    document.head.appendChild(style);
  } catch (_) {}

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-feature-routing.js', 'loaded', { source: 'boot-v2-loader', build: '1.5.87' });
    }
  } catch (_) {}
})();