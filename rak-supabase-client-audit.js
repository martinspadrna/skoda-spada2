// v.1.5 (891) – Supabase klient/offline queue smoke + ruční guard read-only bez DB změn.

(function setupRakSupabaseClientAudit() {
  const started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const QUEUE_KEY = 'rotace_supabase_queue_v1';
  const PHASE_PERCENT = 55;

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-supabase-client-audit.js', 'loading', { source: 'index' });
    }
  } catch (err) {}

  function nowIso() {
    try { return new Date().toISOString(); } catch (err) { return ''; }
  }

  function safeString(value) {
    try { return String(value == null ? '' : value); } catch (err) { return ''; }
  }

  function safeNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : (Number.isFinite(Number(fallback)) ? Number(fallback) : 0);
  }

  function readQueueDirect() {
    const result = {
      readable: false,
      exists: false,
      validJson: false,
      isArray: false,
      length: 0,
      approxBytes: 0,
      oldestAgeMs: 0,
      newestAgeMs: 0,
      staleTaskCount: 0,
      maxRetryCount: 0,
      typeCounts: {},
      sample: [],
      error: ''
    };
    try {
      if (typeof localStorage === 'undefined') {
        result.error = 'localStorage unavailable';
        return result;
      }
      result.readable = true;
      const raw = localStorage.getItem(QUEUE_KEY);
      result.exists = raw != null;
      result.approxBytes = safeString(raw).length + QUEUE_KEY.length;
      if (!raw) {
        result.validJson = true;
        result.isArray = true;
        return result;
      }
      let queue = [];
      try {
        queue = JSON.parse(raw);
        result.validJson = true;
      } catch (jsonErr) {
        result.error = safeString(jsonErr && jsonErr.message ? jsonErr.message : jsonErr);
        return result;
      }
      result.isArray = Array.isArray(queue);
      if (!Array.isArray(queue)) return result;
      const now = Date.now();
      let oldest = 0;
      let newest = 0;
      queue.forEach((task) => {
        const type = safeString(task && task.type || 'unknown') || 'unknown';
        result.typeCounts[type] = safeNumber(result.typeCounts[type], 0) + 1;
        const queuedAt = Date.parse(safeString(task && (task.queuedAt || task.createdAt || task.created_at) || ''));
        if (Number.isFinite(queuedAt)) {
          if (!oldest || queuedAt < oldest) oldest = queuedAt;
          if (!newest || queuedAt > newest) newest = queuedAt;
          if (now - queuedAt > 24 * 60 * 60 * 1000) result.staleTaskCount += 1;
        }
        result.maxRetryCount = Math.max(result.maxRetryCount, safeNumber(task && task.retryCount, 0), safeNumber(task && task.attempts, 0));
        if (result.sample.length < 8) {
          result.sample.push({
            type,
            queuedAt: safeString(task && (task.queuedAt || task.createdAt || task.created_at) || ''),
            retryCount: safeNumber(task && (task.retryCount || task.attempts), 0),
            hasPayload: !!(task && typeof task === 'object' && Object.keys(task).length > 1)
          });
        }
      });
      result.length = queue.length;
      result.oldestAgeMs = oldest ? Math.max(0, now - oldest) : 0;
      result.newestAgeMs = newest ? Math.max(0, now - newest) : 0;
    } catch (err) {
      result.error = safeString(err && err.message ? err.message : err);
    }
    return result;
  }

  function readHardeningStatus() {
    try {
      if (typeof window.getSupabaseHardeningStatus === 'function') return window.getSupabaseHardeningStatus();
    } catch (err) {
      return { error: safeString(err && err.message ? err.message : err) };
    }
    return null;
  }

  function readSyncUiStatus() {
    try {
      if (typeof window.getSupabaseSyncStatus === 'function') return window.getSupabaseSyncStatus();
    } catch (err) {
      return { error: safeString(err && err.message ? err.message : err) };
    }
    return null;
  }

  function readNetworkStatus() {
    let online = true;
    try { online = typeof navigator === 'undefined' || navigator.onLine !== false; } catch (err) { online = true; }
    return {
      online,
      serviceWorkerSupported: !!(typeof navigator !== 'undefined' && 'serviceWorker' in navigator),
      supabaseCdnAvailable: typeof window.supabase !== 'undefined',
      bridgeAvailable: !!window.RotationSupabaseBridge,
      hardeningGetterAvailable: typeof window.getSupabaseHardeningStatus === 'function',
      syncStatusGetterAvailable: typeof window.getSupabaseSyncStatus === 'function',
      flushQueueAvailable: typeof window.flushSupabaseSyncQueue === 'function'
    };
  }

  window.getRakSupabaseClientQueueAuditHealth = function getRakSupabaseClientQueueAuditHealth() {
    const issues = [];
    const warnings = [];
    const network = readNetworkStatus();
    const hardening = readHardeningStatus();
    const syncUi = readSyncUiStatus();
    const queue = readQueueDirect();
    const hardeningQueueLength = hardening ? safeNumber(hardening.queueLength, 0) : null;
    const hardeningQueueMaxItems = hardening ? safeNumber(hardening.queueMaxItems, 0) : null;
    const hardeningQueueHealth = hardening && hardening.queueHealth ? hardening.queueHealth : null;
    const syncGuard = hardening && hardening.syncGuard ? hardening.syncGuard : null;
    const cacheGuard = hardening && hardening.cacheGuard ? hardening.cacheGuard : null;
    const performanceGuard = hardening && hardening.performanceGuard ? hardening.performanceGuard : null;
    const queueLength = hardeningQueueLength != null ? hardeningQueueLength : queue.length;
    const staleTaskCount = Math.max(safeNumber(queue.staleTaskCount, 0), safeNumber(hardeningQueueHealth && hardeningQueueHealth.staleTaskCount, 0));
    const critical = !!(hardeningQueueHealth && hardeningQueueHealth.critical);
    const oldestAgeMs = Math.max(safeNumber(queue.oldestAgeMs, 0), safeNumber(hardeningQueueHealth && hardeningQueueHealth.oldestAgeMs, 0));

    if (!network.hardeningGetterAvailable) warnings.push('Supabase hardening status není v době auditu dostupný');
    if (!network.syncStatusGetterAvailable) warnings.push('Supabase sync status není v době auditu dostupný');
    if (!network.flushQueueAvailable) warnings.push('flushSupabaseSyncQueue není dostupné pro ruční vyprázdnění fronty');
    if (!queue.readable) warnings.push('localStorage queue nejde přečíst');
    if (queue.exists && !queue.validJson) issues.push('offline queue má nevalidní JSON');
    if (queue.validJson && !queue.isArray) issues.push('offline queue není pole úkolů');
    if (hardeningQueueMaxItems && queueLength > Math.round(hardeningQueueMaxItems * 0.8)) warnings.push('offline queue je blízko limitu: ' + queueLength + '/' + hardeningQueueMaxItems);
    if (staleTaskCount > 0) warnings.push('offline queue obsahuje starší úkoly: ' + staleTaskCount);
    if (critical) issues.push('Supabase queue health je critical');
    if (!network.online && queueLength > 0) warnings.push('zařízení je offline a ve frontě čeká ' + queueLength + ' změn');
    if (syncGuard && safeNumber(syncGuard.queueFlushErrors, 0) > safeNumber(syncGuard.queueFlushSuccesses, 0) + 2) warnings.push('fronta má víc flush chyb než úspěchů');

    return {
      ok: issues.length === 0,
      mode: 'supabase-client-queue-audit-v891',
      phase: 'supabase-client-offline-queue-audit',
      phasePercent: PHASE_PERCENT,
      phaseClosed: false,
      checkedAt: nowIso(),
      version: safeString(window.APP_VERSION || 'unknown'),
      readOnly: true,
      dbMutations: false,
      policyChanges: false,
      queueKey: QUEUE_KEY,
      issueCount: issues.length,
      warningCount: warnings.length,
      issues: issues.slice(0, 12),
      warnings: warnings.slice(0, 12),
      network,
      syncUiKind: safeString(syncUi && syncUi.kind || ''),
      syncUiLabel: safeString(syncUi && syncUi.label || ''),
      realtimeStatus: safeString(hardening && hardening.realtimeStatus || ''),
      lastRealtimeAt: safeString(hardening && hardening.lastRealtimeAt || ''),
      queueLength,
      queueMaxItems: hardeningQueueMaxItems || null,
      queueMaxBytes: hardening ? safeNumber(hardening.queueMaxBytes, 0) : null,
      queueOldestAgeMs: oldestAgeMs,
      queueStaleTaskCount: staleTaskCount,
      queueCritical: critical,
      queueDirect: queue,
      queueHealth: hardeningQueueHealth || null,
      syncGuard: syncGuard ? Object.assign({}, syncGuard) : null,
      cacheGuard: cacheGuard ? Object.assign({}, cacheGuard) : null,
      performanceGuard: performanceGuard ? Object.assign({}, performanceGuard) : null,
      cacheHits: hardening && hardening.performanceHealth ? safeNumber(hardening.performanceHealth.cacheHits, 0) : null,
      cacheWrites: hardening && hardening.performanceHealth ? safeNumber(hardening.performanceHealth.cacheWrites, 0) : null,
      nextSafeStep: 'Dál jen closure/guard kontrola. Žádné DB změny, žádné policies, žádný automatický flush ani mazání.'
    };
  };

  window.getRakSupabaseQueueSmokeReport = function getRakSupabaseQueueSmokeReport() {
    const health = typeof window.getRakSupabaseClientQueueAuditHealth === 'function' ? window.getRakSupabaseClientQueueAuditHealth() : null;
    return {
      ok: !!(health && health.ok),
      status: health ? (health.ok ? 'ok' : 'kontrola') : 'unavailable',
      mode: 'supabase-client-queue-smoke-v891',
      checkedAt: nowIso(),
      version: safeString(window.APP_VERSION || 'unknown'),
      readOnly: true,
      queueLength: safeNumber(health && health.queueLength, 0),
      staleTaskCount: safeNumber(health && health.queueStaleTaskCount, 0),
      critical: !!(health && health.queueCritical),
      issueCount: safeNumber(health && health.issueCount, 0),
      warningCount: safeNumber(health && health.warningCount, 0),
      online: !!(health && health.network && health.network.online),
      realtimeStatus: safeString(health && health.realtimeStatus || ''),
      manualGuardReady: typeof window.getRakSupabaseQueueManualGuard === 'function',
      autoFlushEnabled: false,
      autoDeleteEnabled: false,
      maxRetryCount: safeNumber(health && health.queueDirect && health.queueDirect.maxRetryCount, 0),
      lastWarningSample: Array.isArray(health && health.warnings) ? health.warnings.slice(0, 8) : [],
      lastIssueSample: Array.isArray(health && health.issues) ? health.issues.slice(0, 8) : []
    };
  };

  window.runRakSupabaseQueueSmokeReport = function runRakSupabaseQueueSmokeReport() {
    return window.getRakSupabaseQueueSmokeReport();
  };


  window.getRakSupabaseQueueManualGuard = function getRakSupabaseQueueManualGuard() {
    const health = typeof window.getRakSupabaseClientQueueAuditHealth === 'function' ? window.getRakSupabaseClientQueueAuditHealth() : null;
    const queue = health && health.queueDirect ? health.queueDirect : readQueueDirect();
    const issues = [];
    const warnings = [];
    if (queue.exists && !queue.validJson) issues.push('offline queue JSON není validní');
    if (safeNumber(queue.staleTaskCount, 0) > 0) warnings.push('ve frontě jsou starší úkoly: ' + queue.staleTaskCount);
    if (safeNumber(queue.maxRetryCount, 0) >= 3) warnings.push('některý úkol má 3+ pokusy: ' + queue.maxRetryCount);
    return {
      ok: issues.length === 0,
      mode: 'supabase-client-queue-manual-guard-v891',
      checkedAt: nowIso(),
      version: safeString(window.APP_VERSION || 'unknown'),
      readOnly: true,
      dbMutations: false,
      policyChanges: false,
      autoFlushEnabled: false,
      autoDeleteEnabled: false,
      automaticQueueMutationEnabled: false,
      manualFlushRequiresExplicitConfirmation: true,
      manualDeleteRequiresExplicitConfirmation: true,
      queueKey: QUEUE_KEY,
      queueLength: safeNumber(queue.length, 0),
      staleTaskCount: safeNumber(queue.staleTaskCount, 0),
      maxRetryCount: safeNumber(queue.maxRetryCount, 0),
      flushQueueAvailable: !!(health && health.network && health.network.flushQueueAvailable),
      online: !!(health && health.network && health.network.online),
      issueCount: issues.length,
      warningCount: warnings.length,
      issues: issues.slice(0, 8),
      warnings: warnings.slice(0, 8),
      nextSafeStep: 'Ruční flush nebo cleanup řešit jen po výslovném potvrzení a po zobrazení konkrétních položek fronty.'
    };
  };

  try {
    const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-supabase-client-audit.js', 'loaded', { source: 'index', durationMs: ended - started });
    }
  } catch (err) {}
})();
