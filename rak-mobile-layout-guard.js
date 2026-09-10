// RaK v1.5.87 – lightweight mobile layout regression guard.
(function installRakMobileLayoutGuard() {
  'use strict';

  const BUILD = '1.5.87';
  const TOLERANCE_PX = 3;
  const history = [];
  let scheduled = false;

  function now() {
    try { return Date.now(); } catch (_) { return 0; }
  }

  function activePageId() {
    try { return document.querySelector('.page.active')?.id || ''; } catch (_) { return ''; }
  }

  function viewportWidth() {
    const root = document.documentElement;
    return Math.max(0, Math.round(Number(root && root.clientWidth || window.innerWidth || 0)));
  }

  function viewportHeight() {
    const vv = window.visualViewport;
    if (vv && Number(vv.height) > 0) return Math.round(Number(vv.height));
    const root = document.documentElement;
    return Math.max(0, Math.round(Number(root && root.clientHeight || window.innerHeight || 0)));
  }

  function rectSnapshot(el) {
    if (!el || typeof el.getBoundingClientRect !== 'function') return null;
    const rect = el.getBoundingClientRect();
    return {
      left: Math.round(rect.left * 10) / 10,
      right: Math.round(rect.right * 10) / 10,
      top: Math.round(rect.top * 10) / 10,
      bottom: Math.round(rect.bottom * 10) / 10,
      width: Math.round(rect.width * 10) / 10,
      height: Math.round(rect.height * 10) / 10
    };
  }

  function run(reason) {
    scheduled = false;
    if (!document.documentElement || !document.body) return null;

    const width = viewportWidth();
    const height = viewportHeight();
    const rootScrollWidth = Math.max(
      Number(document.documentElement.scrollWidth || 0),
      Number(document.body.scrollWidth || 0)
    );
    const horizontalOverflowPx = Math.max(0, Math.round(rootScrollWidth - width));

    const nav = document.querySelector('.bottomNav');
    const navRect = rectSnapshot(nav);
    const navTooWide = !!(navRect && width && (
      navRect.left < -TOLERANCE_PX
      || navRect.right > width + TOLERANCE_PX
      || navRect.width > width + TOLERANCE_PX
    ));

    const editable = document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
    const navVerticalInvalid = !!(navRect && !editable && height > 0 && navRect.top > height + TOLERANCE_PX);
    const ok = horizontalOverflowPx <= TOLERANCE_PX && !navTooWide && !navVerticalInvalid;

    const result = {
      ok,
      build: BUILD,
      reason: String(reason || 'manual'),
      at: now(),
      page: activePageId(),
      viewport: { width, height },
      rootScrollWidth: Math.round(rootScrollWidth),
      horizontalOverflowPx,
      bottomNav: navRect,
      navTooWide,
      navVerticalInvalid
    };

    history.push(result);
    if (history.length > 20) history.splice(0, history.length - 20);
    window.__rakMobileLayoutLast = result;
    window.__rakMobileLayoutHistory = history;
    document.documentElement.dataset.rakLayoutOk = ok ? '1' : '0';

    if (!ok) {
      console.warn('[RaK mobile layout guard]', result);
      try {
        window.dispatchEvent(new CustomEvent('rak:layout-warning', { detail: result }));
      } catch (_) {}
    }
    return result;
  }

  function schedule(reason) {
    if (scheduled) return;
    scheduled = true;
    const perform = () => {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => requestAnimationFrame(() => run(reason)));
      } else {
        setTimeout(() => run(reason), 32);
      }
    };
    setTimeout(perform, 0);
  }

  window.runRakMobileLayoutSmoke = function runRakMobileLayoutSmoke(reason) {
    return run(reason || 'manual-smoke');
  };
  window.getRakMobileLayoutHealth = function getRakMobileLayoutHealth() {
    return window.__rakMobileLayoutLast || run('health-read');
  };

  window.addEventListener('resize', () => schedule('resize'), { passive: true });
  window.addEventListener('orientationchange', () => schedule('orientationchange'), { passive: true });
  window.addEventListener('pageshow', () => schedule('pageshow'), { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') schedule('visibility-visible');
  });
  document.addEventListener('toggle', (event) => {
    if (event.target && event.target.closest && event.target.closest('.page, #appMenuBody')) schedule('details-toggle');
  }, true);
  document.addEventListener('click', (event) => {
    const target = event.target && event.target.closest
      ? event.target.closest('.bottomNavBtn, [data-action], [data-menu-action], [data-admin-action]')
      : null;
    if (target) schedule('ui-action');
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => schedule('dom-ready'), { once: true });
  } else {
    schedule('install');
  }

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-mobile-layout-guard.js', 'loaded', { source: 'dynamic-loader', build: BUILD });
    }
  } catch (_) {}
})();
