// RaK 1.2 (1.38) – performance/CI/test strategy audit.
(function setupRakPerformanceCiAudit() {
  const VERSION = '1.2 (1.38)';
  const MODE = 'performance-ci-audit-readonly-v923';

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-performance-ci-audit.js', 'loading', { source: 'index' });
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

  function kb(value) {
    const num = Number(value) || 0;
    return Math.round((num / 1024) * 10) / 10;
  }

  function countSelector(selector) {
    try { return document.querySelectorAll(selector).length; } catch (err) { return 0; }
  }

  function getPerfEntries() {
    try {
      if (typeof performance !== 'undefined' && typeof performance.getEntriesByType === 'function') {
        return performance.getEntriesByType('resource') || [];
      }
    } catch (err) {}
    return [];
  }

  function getScriptInventory() {
    const scripts = [];
    try {
      document.querySelectorAll('script[src]').forEach((node) => {
        const src = node.getAttribute('src') || '';
        scripts.push({ src, external: /^https?:\/\//i.test(src), async: !!node.async, defer: !!node.defer });
      });
    } catch (err) {}
    return scripts;
  }

  function getStyleInventory() {
    const styles = [];
    try {
      document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
        const href = node.getAttribute ? (node.getAttribute('href') || '') : '';
        styles.push({ href: href || 'inline-style', external: /^https?:\/\//i.test(href) });
      });
    } catch (err) {}
    return styles;
  }

  function getResourceSizeMap() {
    const map = {};
    getPerfEntries().forEach((entry) => {
      const name = String(entry.name || '');
      const key = name.split('/').pop() || name;
      map[key] = {
        transferSize: Number(entry.transferSize || 0),
        encodedBodySize: Number(entry.encodedBodySize || 0),
        decodedBodySize: Number(entry.decodedBodySize || 0),
        durationMs: Math.round(Number(entry.duration || 0))
      };
    });
    return map;
  }

  function estimateStorageFootprint() {
    const result = { keyCount: 0, estimatedChars: 0, largeKeyCount: 0, largestKeys: [] };
    try {
      const rows = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key) continue;
        const value = localStorage.getItem(key);
        const size = String(value || '').length;
        rows.push({ key: String(key).slice(0, 80), sizeChars: size, sizeKb: kb(size) });
        result.estimatedChars += size;
      }
      rows.sort((a, b) => b.sizeChars - a.sizeChars);
      result.keyCount = rows.length;
      result.largeKeyCount = rows.filter((row) => row.sizeChars > 180000).length;
      result.largestKeys = rows.slice(0, 8);
    } catch (err) {
      result.error = safeString(err && err.message ? err.message : err, 'storage unavailable');
    }
    return result;
  }

  function getRakPerformanceBudgetAuditHealth() {
    const scripts = getScriptInventory();
    const styles = getStyleInventory();
    const resources = getResourceSizeMap();
    const storage = estimateStorageFootprint();
    const jsCount = scripts.length;
    const cssCount = styles.length;
    const localScriptCount = scripts.filter((item) => !item.external).length;
    const externalScriptCount = scripts.filter((item) => item.external).length;
    const appShellCount = (() => {
      try {
        const swStatus = typeof window.getPwaRuntimeHealth === 'function' ? window.getPwaRuntimeHealth() : null;
        return Number(swStatus && swStatus.appShellCount ? swStatus.appShellCount : 0);
      } catch (err) { return 0; }
    })();

    const domNodeCount = countSelector('*');
    const innerHtmlSinkCount = countSelector('[data-action]') + countSelector('[id]');
    const estimatedWarnings = [];
    if (jsCount > 28) estimatedWarnings.push('Vysoký počet skriptů může zvyšovat parse/execute cost na slabších mobilech.');
    if (cssCount > 8) estimatedWarnings.push('Vysoký počet CSS souborů může zvyšovat počet requestů mimo precache.');
    if (domNodeCount > 1600) estimatedWarnings.push('Vysoký počet DOM uzlů může zhoršit reflow/repaint na menších telefonech.');
    if (storage.largeKeyCount > 0) estimatedWarnings.push('Některé localStorage klíče jsou velké a můžou blokovat main thread při serializaci.');

    return {
      ok: true,
      mode: 'performance-budget-audit-v923',
      version: safeString(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      readOnly: true,
      scriptCount: jsCount,
      localScriptCount,
      externalScriptCount,
      stylesheetCount: cssCount,
      appShellCount,
      domNodeCount,
      actionElementCount: countSelector('[data-action]'),
      dashboardCardCount: countSelector('.dashboardCard'),
      gameCardCount: countSelector('.arcadeGameCard, .gameCard, [data-game]'),
      roughDomSurfaceCount: innerHtmlSinkCount,
      storage,
      resources,
      budgets: {
        localScriptsWarningOver: 28,
        stylesheetsWarningOver: 8,
        domNodesWarningOver: 1600,
        largeStorageKeyChars: 180000,
        targetFirstManualMeasurement: 'Chrome/Edge mobile emulation + skutečný Android: cold load, warm load, route switch, game start.'
      },
      warnings: estimatedWarnings,
      nextActions: [
        'Přidat ruční měření cold/warm startupu v mobilu a uložit výsledky do release checklistu.',
        'Zvážit sloučení čistě auditních skriptů až po dokončení due diligence, ne během stabilizace.',
        'Před každým výkonovým refaktorem měřit: TTI pocitově, počet DOM uzlů, počet localStorage klíčů, app shell count.'
      ]
    };
  }

  function getRakTestAutomationCiPlanHealth() {
    const testLayers = [
      { id: 'syntax', label: 'JS syntax / JSON smoke', status: 'existing', blocker: true, command: 'npm run check' },
      { id: 'manifest-sw', label: 'Manifest + service worker version consistency', status: 'existing-readonly', blocker: true, command: 'node scripts/check-version-consistency.mjs' },
      { id: 'dom-smoke', label: 'DOM smoke: boot, dashboard, navigation, games route', status: 'recommended-next', blocker: true, command: 'npx playwright test tests/dom-smoke.spec.ts' },
      { id: 'pwa-cache', label: 'PWA cache/update smoke', status: 'recommended', blocker: false, command: 'npx playwright test tests/pwa-update.spec.ts' },
      { id: 'supabase-contract', label: 'Supabase online game contract smoke bez policy změn', status: 'manual-now-automate-later', blocker: false, command: 'manual two-mobile smoke first' },
      { id: 'rollback', label: 'Rollback validation: previous ZIP deployable + cache version rollback note', status: 'recommended', blocker: false, command: 'artifact compare + manual deploy checklist' }
    ];

    return {
      ok: true,
      mode: 'test-automation-ci-plan-v923',
      version: safeString(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      readOnly: true,
      existingBlockingCommand: 'npm run check',
      recommendedCi: 'GitHub Actions / Vercel build: npm ci, npm run check, artifact ZIP smoke, optional Playwright DOM smoke.',
      testLayers,
      blockerRules: testLayers.filter((layer) => layer.blocker).map((layer) => layer.id),
      warningRules: testLayers.filter((layer) => !layer.blocker).map((layer) => layer.id),
      minimalGithubActionsSnippet: [
        'name: RaK checks',
        'on: [push, pull_request]',
        'jobs:',
        '  check:',
        '    runs-on: ubuntu-latest',
        '    steps:',
        '      - uses: actions/checkout@v4',
        '      - uses: actions/setup-node@v4',
        '        with:',
        '          node-version: 20',
        '      - run: npm ci || npm install',
        '      - run: npm run check'
      ].join('\n'),
      nextActions: [
        'Nejdřív přidat verzi kontrolující skript, až potom Playwright.',
        'Playwright držet jen na 3–5 kritických cestách: boot, dashboard, hry, Top score, offline shell.',
        'Online hry neautomatizovat proti produkční DB, dokud nebude samostatný staging nebo test projekt.'
      ]
    };
  }

  function getRakPerformanceCiClosureHealth() {
    const perf = getRakPerformanceBudgetAuditHealth();
    const ci = getRakTestAutomationCiPlanHealth();
    return {
      ok: !!(perf && ci),
      mode: 'performance-ci-closure-v923',
      version: safeString(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      phase: 'phase L performance + CI/test strategy',
      phasePercent: 100,
      phaseClosed: true,
      readOnly: true,
      dbSchemaChanges: false,
      policyChanges: false,
      onlineFlowChanges: false,
      performanceWarnings: perf && Array.isArray(perf.warnings) ? perf.warnings.length : 0,
      testLayerCount: ci && Array.isArray(ci.testLayers) ? ci.testLayers.length : 0,
      impactOnDueDiligence: {
        previousComplete: 72,
        newComplete: 82,
        previousRemaining: 28,
        newRemaining: 18,
        note: 'Výkon, testy, CI/CD a delivery plán byly posunuté z návrhové úrovně na konkrétní read-only audit + test strategy.'
      }
    };
  }

  window.getRakPerformanceBudgetAuditHealth = getRakPerformanceBudgetAuditHealth;
  window.getRakTestAutomationCiPlanHealth = getRakTestAutomationCiPlanHealth;
  window.getRakPerformanceCiClosureHealth = getRakPerformanceCiClosureHealth;

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-performance-ci-audit.js', 'loaded', { mode: MODE });
    }
  } catch (err) {}
})();
