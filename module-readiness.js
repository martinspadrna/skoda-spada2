// v.1.5 (922) – module readiness registry včetně release gate helperu.

(function setupRakModuleReadinessRegistry() {
  if (window.__rakModuleReadinessRegistry && typeof window.rakMarkModuleReady === 'function') {
    try { window.rakMarkModuleReady('module-readiness.js', 'loaded', { source: 'index', duplicateSetup: true }); } catch (err) {}
    return;
  }

  const nowIso = () => {
    try { return new Date().toISOString(); } catch (err) { return ''; }
  };
  const nowMs = () => {
    try { return Math.round(performance.now()); } catch (err) { return Date.now(); }
  };
  const registry = window.__rakModuleReadinessRegistry = {
    version: window.APP_VERSION || 'pre-core',
    mode: 'module-readiness-registry-v897',
    startedAt: nowIso(),
    startedMs: nowMs(),
    expected: [],
    modules: {},
    events: [],
    bootOrder: []
  };

  function normalizeName(name) {
    return String(name || '').trim().replace(/^\.\//, '') || 'unknown-module';
  }

  function markModule(name, status, meta) {
    const moduleName = normalizeName(name);
    const nextStatus = String(status || 'loaded').trim() || 'loaded';
    const ts = nowIso();
    const ms = nowMs();
    const current = registry.modules[moduleName] || { name: moduleName, firstSeenAt: ts, firstSeenMs: ms, events: 0 };
    current.status = nextStatus;
    current.updatedAt = ts;
    current.updatedMs = ms;
    current.durationMs = Number.isFinite(Number(meta && meta.durationMs)) ? Math.max(0, Math.round(Number(meta.durationMs))) : current.durationMs;
    current.source = String((meta && meta.source) || current.source || '').slice(0, 80);
    current.error = String((meta && meta.error) || '').slice(0, 180);
    current.events = Number(current.events || 0) + 1;
    registry.modules[moduleName] = current;
    if ((nextStatus === 'loaded' || nextStatus === 'ready') && !registry.bootOrder.includes(moduleName)) registry.bootOrder.push(moduleName);
    registry.events.push({ name: moduleName, status: nextStatus, at: ts, ms, source: current.source, error: current.error });
    if (registry.events.length > 96) registry.events = registry.events.slice(-96);
    registry.version = window.APP_VERSION || registry.version || 'pre-core';
    return current;
  }

  window.rakMarkModuleReady = markModule;
  window.getRakModuleReadinessHealth = function getRakModuleReadinessHealth(expectedOverride) {
    const expected = Array.isArray(expectedOverride) && expectedOverride.length
      ? expectedOverride.map(normalizeName)
      : (Array.isArray(registry.expected) ? registry.expected.map(normalizeName) : []);
    const modules = registry.modules || {};
    const loadedStatuses = new Set(['loaded', 'ready']);
    const loadedExpected = expected.filter((name) => modules[name] && loadedStatuses.has(String(modules[name].status || '')));
    const missing = expected.filter((name) => !modules[name] || !loadedStatuses.has(String(modules[name].status || '')));
    const errored = Object.keys(modules).filter((name) => String(modules[name] && modules[name].status || '') === 'error');
    const loadedOrder = registry.bootOrder.slice();
    const expectedLoadedOrder = expected.filter((name) => loadedOrder.includes(name));
    const orderMismatch = expectedLoadedOrder.some((name, index) => loadedOrder[index] !== name);
    const bootDurationMs = Math.max(0, nowMs() - Number(registry.startedMs || nowMs()));
    return {
      ok: missing.length === 0 && errored.length === 0,
      mode: registry.mode || 'module-readiness-registry-v897',
      version: window.APP_VERSION || registry.version || 'unknown',
      checkedAt: nowIso(),
      expectedCount: expected.length,
      loadedCount: loadedExpected.length,
      missingCount: missing.length,
      errorCount: errored.length,
      orderMismatch,
      bootDurationMs,
      expected: expected.slice(0, 32),
      loadedOrder: loadedOrder.slice(0, 32),
      missing: missing.slice(0, 16),
      errors: errored.slice(0, 16),
      modules: Object.keys(modules).sort().map((name) => ({
        name,
        status: modules[name].status || 'unknown',
        durationMs: modules[name].durationMs || 0,
        source: modules[name].source || '',
        error: modules[name].error || ''
      })).slice(0, 48),
      eventCount: registry.events.length,
      recentEvents: registry.events.slice(-12)
    };
  };

  markModule('module-readiness.js', 'loaded', { source: 'index' });
  try {
    if (typeof initialRotationData !== 'undefined') markModule('data.js', 'loaded', { source: 'index-preload' });
  } catch (err) {}
})();