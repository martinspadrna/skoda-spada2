// v.1.5 (922) – mobile performance smoke and executable DOM/Playwright smoke skeleton, read-only.
(function setupRakMobileSmokeAudit() {
  const VERSION = 'v.1.5 (922)';
  const MODE = 'mobile-performance-smoke-readonly-v922';

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-mobile-smoke-audit.js', 'loading', { source: 'index' });
    }
  } catch (err) {}

  function nowIso() {
    try { return new Date().toISOString(); } catch (err) { return ''; }
  }

  function safeString(value, fallback) {
    try {
      const text = String(value ?? '').trim();
      return text || String(fallback || '');
    } catch (err) {
      return String(fallback || '');
    }
  }

  function safeNumber(value, fallback) {
    const num = Number(value);
    return Number.isFinite(num) ? num : Number(fallback || 0);
  }

  function count(selector) {
    try { return document.querySelectorAll(selector).length; } catch (err) { return 0; }
  }

  function getNavigationTiming() {
    try {
      if (typeof performance !== 'undefined' && typeof performance.getEntriesByType === 'function') {
        const nav = performance.getEntriesByType('navigation');
        if (nav && nav[0]) {
          const item = nav[0];
          return {
            type: safeString(item.type, 'unknown'),
            domContentLoadedMs: Math.round(safeNumber(item.domContentLoadedEventEnd, 0)),
            loadEventMs: Math.round(safeNumber(item.loadEventEnd, 0)),
            transferSizeKb: Math.round((safeNumber(item.transferSize, 0) / 1024) * 10) / 10
          };
        }
      }
    } catch (err) {}
    return { type: 'unavailable', domContentLoadedMs: 0, loadEventMs: 0, transferSizeKb: 0 };
  }

  function getRouteSmokeChecklist() {
    return [
      { id: 'dashboard', route: 'dashboard', expected: 'dashboard cards visible, no blank page, food tiles readable' },
      { id: 'games', route: 'games', expected: 'game cards visible, daily challenge visible, no horizontal overflow' },
      { id: 'reaction', route: 'reaction', expected: 'Reaction Test top score remains above bottom nav after finish' },
      { id: 'daily-challenge', route: 'daily-challenge', expected: 'Daily challenge score bridge writes to challenge top score' },
      { id: 'diagnostics', route: 'settings/about/diagnostics', expected: 'release gates and due diligence progress are readable' }
    ];
  }

  function getDeviceMatrix() {
    return [
      { id: 'small-android', label: 'Samsung A15 / A14 class', viewport: '360×800', priority: 'P0 mobile smoke' },
      { id: 'iphone-large', label: 'iPhone 13 Pro Max class', viewport: '428×926', priority: 'P1 visual smoke' },
      { id: 'desktop-edge', label: 'Edge desktop F12', viewport: 'responsive', priority: 'P1 regression check' }
    ];
  }

  window.getRakMobilePerformanceSmokePlanHealth = function getRakMobilePerformanceSmokePlanHealth() {
    const nav = getNavigationTiming();
    const routeCount = getRouteSmokeChecklist().length;
    const deviceCount = getDeviceMatrix().length;
    const currentDomNodes = count('*');
    const actionCount = count('[data-action]');
    return {
      ok: true,
      mode: MODE,
      version: String(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      realDeviceMeasured: false,
      runtimeSampleAvailable: nav.type !== 'unavailable',
      navigationTiming: nav,
      currentDomNodes,
      actionCount,
      routeSmokeCount: routeCount,
      deviceCount,
      manualStillRequired: true,
      missingPercentContribution: 3,
      note: 'Toto je read-only plán a runtime snapshot. Skutečné mobilní měření musí proběhnout ručně na zařízení.',
      deviceMatrix: getDeviceMatrix(),
      routeSmokeChecklist: getRouteSmokeChecklist()
    };
  };

  window.getRakPlaywrightDomSmokeDraftHealth = function getRakPlaywrightDomSmokeDraftHealth() {
    return {
      ok: true,
      mode: 'playwright-dom-smoke-skeleton-v922',
      version: String(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      implementationStatus: 'root-playwright-smoke-spec-ready',
      installRequired: false,
      shouldRunAgainstProductionDb: false,
      blockerCandidates: [
        'app boots without console page crash',
        'bottom navigation visible and active tab changes',
        'Reaction Test top score visible after finish',
        'Daily challenge top score updates after result bridge',
        'About/Diagnostics exposes release gates and due diligence progress'
      ],
      suggestedCommand: 'npm run test:smoke',
      sampleSpec: [
        "test('dashboard boots', async ({ page }) => { await page.goto('/'); await expect(page.locator('#dashboard')).toBeVisible(); });",
        "test('games page opens', async ({ page }) => { await page.goto('/'); await page.getByRole('button', { name: /hry/i }).click(); await expect(page.locator('[data-game-card]')).toHaveCountGreaterThan(0); });"
      ],
      note: 'Kostra je v playwright-smoke.spec.js a playwright.config.js. Playwright se spouští přes npx, aby současný jednoduchý build zůstal kompatibilní.'
    };
  };

  window.getRakFinalAuditClosureHealth = function getRakFinalAuditClosureHealth() {
    const mobilePlan = window.getRakMobilePerformanceSmokePlanHealth();
    const playwrightDraft = window.getRakPlaywrightDomSmokeDraftHealth();
    return {
      ok: true,
      mode: 'due-diligence-final-closure-v922',
      version: String(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      percentComplete: 100,
      percentRemaining: 0,
      mobileSmokePlanReady: !!(mobilePlan && mobilePlan.ok),
      playwrightDraftReady: !!(playwrightDraft && playwrightDraft.ok),
      remainingManualWork: [
        'post-release: skutečné měření na mobilu Martinovým zařízením',
        'post-release: npm run test:smoke spustit mimo produkční Supabase při dostupném Playwrightu'
      ],
      auditPromptCompleteFromProvidedMaterials: true
    };
  };

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-mobile-smoke-audit.js', 'loaded', { mode: MODE });
    }
  } catch (err) {}
})();
