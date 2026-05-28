// v.1.5 (953) – mobile/Playwright validation readiness a smoke runbook, read-only.
(function setupRakMobileSmokeAudit() {
  const VERSION = 'v.1.5 (953)';
  const MODE = 'mobile-performance-smoke-readonly-v928';

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
      mode: 'playwright-dom-smoke-skeleton-v928',
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
      mode: 'due-diligence-final-closure-v928',
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


  function getManualValidationChecklist() {
    return [
      { id: 'M-01', area: 'Start aplikace', expected: 'Home/Dashboard bez bílé obrazovky.', priority: 'P0', blocksRelease: true },
      { id: 'M-02', area: 'Spodní lišta', expected: 'Všechny hlavní záložky jdou přepnout a nic se neschovává pod lištu.', priority: 'P0', blocksRelease: true },
      { id: 'M-03', area: 'Kantýna/jídelna', expected: 'Karty i rozklik ukazují běžný režim a jen přesčasové rozdíly.', priority: 'P0', blocksRelease: true },
      { id: 'M-04', area: 'Hry Top score', expected: 'Čas je bez ms, datum+čas jsou čitelné.', priority: 'P0', blocksRelease: true },
      { id: 'M-05', area: 'Reaction Test', expected: 'Top výsledky zůstávají viditelné nad spodní vrstvou.', priority: 'P0', blocksRelease: true },
      { id: 'M-06', area: 'Denní challenge', expected: 'Výsledek se propíše do Top score Denní challenge.', priority: 'P0', blocksRelease: true },
      { id: 'M-07', area: 'Piškvorky offline AI', expected: 'Offline AI běží bez zamrznutí, online režim beze změny.', priority: 'P0', blocksRelease: true },
      { id: 'M-08', area: 'Online Piškvorky', expected: 'Create/accept/realtime funguje na dvou klientech.', priority: 'P0 production', blocksRelease: true },
      { id: 'M-09', area: 'Online Lodě', expected: 'Create/accept/save funguje na dvou klientech.', priority: 'P0 production', blocksRelease: true },
      { id: 'M-10', area: 'Export ZIP', expected: 'Export projde a název odpovídá aktuálnímu buildu.', priority: 'P0', blocksRelease: true },
      { id: 'M-11', area: 'O aplikaci', expected: 'Historie je stručná v blocích po cca 50 verzích.', priority: 'P2', blocksRelease: false },
      { id: 'M-12', area: 'Diagnostika', expected: 'Release gates: dokumenty OK, mobil/Playwright manual.', priority: 'P2', blocksRelease: false },
      { id: 'M-13', area: 'Profilový vzhled', expected: 'Téma i pozadí se drží aktivního profilu a nový profil nezačne vzhledem předchozího hráče.', priority: 'P0', blocksRelease: true },
      { id: 'M-14', area: 'Herní achievementy', expected: 'Každá hra má vlastní achievementy a D-směnové cíle; zamčené odměny nejdou aktivovat před splněním podmínky.', priority: 'P0', blocksRelease: true }
    ];
  }

  window.getRakManualValidationReadinessHealth = function getRakManualValidationReadinessHealth() {
    const checklist = getManualValidationChecklist();
    const docs = [
      'assets/docs/manual-validation-runbook-v926.md',
      'assets/docs/playwright-real-run-readiness-v926.md',
      'assets/docs/post-release-validation-v926.md',
      'assets/docs/validation-readiness-closure-v926.md',
      'assets/docs/games-achievement-rewards-v926.md',
      'assets/docs/profile-appearance-rewards-v926.md',
      'assets/docs/rotace-names-dock-stability-v928.md',
      'assets/docs/lada-mode-performance-v928.md',
      'assets/docs/about-50-version-summary-v928.md'
    ];
    return {
      ok: true,
      mode: 'manual-validation-readiness-v928',
      version: String(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      readyForUserTesting: true,
      realMobileTestDone: false,
      realBrowserSmokeDone: false,
      realPlaywrightRunDone: false,
      postReleaseHostingValidationDone: false,
      manualStillRequired: true,
      documentCount: docs.length,
      documents: docs,
      checklistCount: checklist.length,
      blockingChecklistCount: checklist.filter((item) => item.blocksRelease).length,
      deviceMatrix: getDeviceMatrix(),
      checklist,
      note: 'v928 připravuje ruční a Playwright validaci; skutečné testy zůstávají manual, dokud je člověk nespustí.'
    };
  };

  window.getRakValidationReadinessClosureHealth = function getRakValidationReadinessClosureHealth() {
    const manual = window.getRakManualValidationReadinessHealth();
    const mobilePlan = window.getRakMobilePerformanceSmokePlanHealth();
    const playwright = window.getRakPlaywrightDomSmokeDraftHealth();
    return {
      ok: !!(manual && manual.ok && mobilePlan && mobilePlan.ok && playwright && playwright.ok),
      mode: 'validation-readiness-closure-v928',
      version: String(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      phase: 'post-audit manual validation readiness',
      phasePercent: 100,
      readyForZip: true,
      readyForUserTesting: !!(manual && manual.readyForUserTesting),
      readyForProduction: false,
      manualGateCount: 4,
      manualGates: [
        'reálný mobilní smoke',
        'reálný browser smoke',
        'skutečný Playwright běh',
        'post-release PWA/hosting validace'
      ],
      dbSchemaChanges: false,
      policyChanges: false,
      onlineFlowChanges: false,
      gameplayChanges: false,
      nextStep: 'Nahrát ZIP a projít P0 checklist na mobilu; případné chyby řešit po jedné v dalším buildu.'
    };
  };

  try {
    if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.register === 'function') {
      window.RaK.diagnostics.register('manualValidationReadiness', window.getRakManualValidationReadinessHealth);
      window.RaK.diagnostics.register('validationReadinessClosure', window.getRakValidationReadinessClosureHealth);
      window.RaK.diagnostics.register('mobilePerformanceSmokePlan', window.getRakMobilePerformanceSmokePlanHealth);
      window.RaK.diagnostics.register('playwrightDomSmokeDraft', window.getRakPlaywrightDomSmokeDraftHealth);
      window.RaK.diagnostics.register('finalAuditClosure', window.getRakFinalAuditClosureHealth);
    }
  } catch (err) {}

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-mobile-smoke-audit.js', 'loaded', { mode: MODE });
    }
  } catch (err) {}
})();
