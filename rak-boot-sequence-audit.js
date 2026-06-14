// RaK 1.2 (1.151) – boot sequence audit.

(function setupRakBootSequenceAudit() {
  const started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-boot-sequence-audit.js', 'loading', { source: 'index' });
    }
  } catch (err) {}

  function scriptSrcList() {
    try {
      return Array.from(document.scripts || [])
        .map((script) => String(script && script.getAttribute ? (script.getAttribute('src') || 'inline') : 'inline'))
        .filter(Boolean);
    } catch (err) {
      return [];
    }
  }

  function findIndexByTail(list, tail) {
    const expectedTail = String(tail || '').trim();
    return list.findIndex((src) => String(src || '').split('?')[0].endsWith(expectedTail));
  }

  function getModuleHealth() {
    try {
      return typeof window.getRakModuleReadinessHealth === 'function' ? window.getRakModuleReadinessHealth() : null;
    } catch (err) {
      return null;
    }
  }

  window.getRakBootSequenceHealth = function getRakBootSequenceHealth() {
    const issues = [];
    const warnings = [];
    const scripts = scriptSrcList();
    const expectedStaticOrder = [
      'data.js',
      'module-readiness.js',
      'rak-namespace.js',
      'rak-audit-baseline.js',
      'rak-runtime-health.js',
      'rak-storage-sync-audit.js',
      'rak-boot-sequence-audit.js',
      'rak-export-release-audit.js',
      'rak-dom-action-audit.js',
      'rak-supabase-client-audit.js',
      'rak-release-ops-audit.js',
      'rak-appsec-privacy-audit.js',
      'rak-release-gates.js',
      'rak-dom-security-hardening.js',
      'app.js'
    ];
    const indices = expectedStaticOrder.map((name) => ({ name, index: findIndexByTail(scripts, name) }));
    const missingStatic = indices.filter((entry) => entry.index < 0).map((entry) => entry.name);
    const visibleIndices = indices.filter((entry) => entry.index >= 0).map((entry) => entry.index);
    const staticOrderOk = visibleIndices.every((value, index, arr) => index === 0 || value > arr[index - 1]);
    const moduleHealth = getModuleHealth();
    const loadedOrder = moduleHealth && Array.isArray(moduleHealth.loadedOrder) ? moduleHealth.loadedOrder.slice() : [];
    const dynamicExpected = [
      'app-runtime-guards.js',
      'app-health-audits.js',
      'app-postload-audits.js',
      'app-pwa-connectivity.js',
      'core.js',
      'lifecycle.js',
      'qr.js',
      'payroll.js',
      'brusy.js',
      'stats.js',
      'dashboard.js',
      'soustruhy.js',
      'rotace.js',
      'games-engine.js',
      'changelog.js',
      'admin-food.js',
      'ui.js',
      'app-navigation.js',
      'app-bottom-nav.js',
      'app-menu.js',
      'app-actions.js',
      'app-boot-selftest.js',
      'games-arcade.js',
      'export.js',
      'supabase-config.js',
      'supabase-bridge.js',
      'app-rotation-sync.js',
      'app-excel-import.js',
      'app-rotation-controls.js',
      'app-admin-unlock.js',
      'app-home-boot.js',
      'app-init.js'
    ];
    const missingDynamic = dynamicExpected.filter((name) => !loadedOrder.includes(name));
    const dynamicOrderIndices = dynamicExpected.map((name) => loadedOrder.indexOf(name)).filter((index) => index >= 0);
    const dynamicOrderOk = dynamicOrderIndices.every((value, index, arr) => index === 0 || value > arr[index - 1]);

    if (missingStatic.length) issues.push('missing static boot scripts: ' + missingStatic.join(', '));
    if (!staticOrderOk) issues.push('static boot order mismatch');
    if (!moduleHealth) warnings.push('module readiness unavailable during boot sequence audit');
    else if (!moduleHealth.ok) issues.push('module readiness incomplete');
    if (missingDynamic.length) warnings.push('dynamic modules not yet fully visible: ' + missingDynamic.slice(0, 6).join(', '));
    if (!dynamicOrderOk) issues.push('dynamic boot order mismatch');

    return {
      ok: issues.length === 0,
      mode: 'boot-sequence-audit-v897',
      checkedAt: new Date().toISOString(),
      version: String(window.APP_VERSION || 'unknown'),
      issueCount: issues.length,
      warningCount: warnings.length,
      issues: issues.slice(0, 12),
      warnings: warnings.slice(0, 12),
      staticOrderOk,
      dynamicOrderOk,
      scriptCount: scripts.length,
      expectedStaticOrder,
      staticScriptIndices: indices,
      loadedOrder: loadedOrder.slice(0, 32),
      dynamicExpected,
      dynamicMissingCount: missingDynamic.length,
      dynamicMissing: missingDynamic.slice(0, 16),
      moduleReadinessOk: !!(moduleHealth && moduleHealth.ok)
    };
  };

  try {
    const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-boot-sequence-audit.js', 'loaded', { source: 'index', durationMs: Math.max(0, Math.round(ended - started)) });
    }
  } catch (err) {}
})();
