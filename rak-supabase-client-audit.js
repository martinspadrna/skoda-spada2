// RaK 1.2 (1.116) – Supabase klientský/online contract audit.

(function setupRakSupabaseClientAudit() {
  const started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const QUEUE_KEY = 'rotace_supabase_queue_v1';
  const PHASE_PERCENT = 100;

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
      mode: 'supabase-client-queue-audit-v897',
      phase: 'supabase-client-offline-queue-audit',
      phasePercent: PHASE_PERCENT,
      phaseClosed: true,
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
      nextSafeStep: 'Supabase client/offline queue audit je uzavřený. Ruční flush nebo cleanup řešit jen po výslovném potvrzení.'
    };
  };

  window.getRakSupabaseQueueSmokeReport = function getRakSupabaseQueueSmokeReport() {
    const health = typeof window.getRakSupabaseClientQueueAuditHealth === 'function' ? window.getRakSupabaseClientQueueAuditHealth() : null;
    return {
      ok: !!(health && health.ok),
      status: health ? (health.ok ? 'ok' : 'kontrola') : 'unavailable',
      mode: 'supabase-client-queue-smoke-v897',
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
      mode: 'supabase-client-queue-manual-guard-v897',
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

  window.getRakSupabaseQueueClosureHealth = function getRakSupabaseQueueClosureHealth() {
    let audit = null;
    let smoke = null;
    let guard = null;
    const issues = [];
    const warnings = [];
    try { audit = window.getRakSupabaseClientQueueAuditHealth(); }
    catch (err) { issues.push('Supabase queue audit read error: ' + safeString(err && err.message ? err.message : err)); }
    try { smoke = window.getRakSupabaseQueueSmokeReport(); }
    catch (err) { warnings.push('Supabase queue smoke read error: ' + safeString(err && err.message ? err.message : err)); }
    try { guard = window.getRakSupabaseQueueManualGuard(); }
    catch (err) { issues.push('Supabase queue manual guard read error: ' + safeString(err && err.message ? err.message : err)); }

    if (!audit) warnings.push('Supabase client/queue audit zatím není dostupný');
    else if (audit.ok === false) warnings.push('Supabase client/queue audit warning: ' + safeString((audit.issues || []).join(', ') || audit.status || 'kontrola'));
    if (!smoke) warnings.push('Supabase queue smoke report zatím není dostupný');
    else if (smoke.ok === false) warnings.push('Supabase queue smoke warning: ' + safeString((smoke.lastIssueSample || []).join(', ') || smoke.status || 'kontrola'));
    if (!guard) issues.push('Supabase queue manual guard není dostupný');
    else if (guard.ok === false) issues.push('Supabase queue manual guard: ' + safeString((guard.issues || []).join(', ') || guard.status || 'kontrola'));
    if (guard && guard.autoFlushEnabled) issues.push('auto flush fronty je zapnutý');
    if (guard && guard.autoDeleteEnabled) issues.push('auto mazání fronty je zapnuté');
    if (guard && guard.automaticQueueMutationEnabled) issues.push('automatická mutace fronty je zapnutá');
    if (audit && audit.dbMutations) issues.push('audit hlásí DB mutace');
    if (audit && audit.policyChanges) issues.push('audit hlásí policy změny');

    return {
      ok: issues.length === 0,
      mode: 'supabase-client-queue-closure-v897',
      checkedAt: nowIso(),
      version: safeString(window.APP_VERSION || '1.2 (1.116)'),
      phase: 'phase H Supabase client/offline queue audit',
      phasePercent: 100,
      phaseClosed: true,
      readOnly: true,
      dbMutations: false,
      policyChanges: false,
      autoFlushEnabled: false,
      autoDeleteEnabled: false,
      automaticQueueMutationEnabled: false,
      auditLinked: !!audit,
      smokeLinked: !!smoke,
      manualGuardLinked: !!guard,
      auditOk: audit ? audit.ok : null,
      smokeOk: smoke ? smoke.ok : null,
      guardOk: guard ? guard.ok : null,
      queueKey: QUEUE_KEY,
      queueLength: safeNumber(audit && audit.queueLength, safeNumber(guard && guard.queueLength, 0)),
      staleTaskCount: safeNumber(audit && audit.queueStaleTaskCount, safeNumber(guard && guard.staleTaskCount, 0)),
      maxRetryCount: Math.max(safeNumber(smoke && smoke.maxRetryCount, 0), safeNumber(guard && guard.maxRetryCount, 0)),
      critical: !!(audit && audit.queueCritical),
      online: !!(audit && audit.network && audit.network.online),
      realtimeStatus: safeString(audit && audit.realtimeStatus || ''),
      issueCount: issues.length,
      warningCount: warnings.length + safeNumber(audit && audit.warningCount, 0),
      issues: issues.slice(0, 12),
      warnings: warnings.concat(audit && audit.warnings ? audit.warnings : []).slice(0, 12),
      nextStep: 'Supabase client/offline queue audit je uzavřený. Ruční flush/cleanup řešit jen po výslovném potvrzení a s konkrétním seznamem položek.'
    };
  };


  function readOnlineGameContractBridgeStatus() {
    const bridge = window.RotationSupabaseBridge || null;
    const globals = {
      create: typeof window.createGameInvite === 'function',
      accept: typeof window.acceptGameInvite === 'function',
      load: typeof window.loadGameSessionByInviteCode === 'function',
      save: typeof window.saveGameSessionByInviteCode === 'function'
    };
    const bridgeMethods = {
      create: !!(bridge && typeof bridge.createGameInvite === 'function'),
      accept: !!(bridge && typeof bridge.acceptGameInvite === 'function'),
      load: !!(bridge && typeof bridge.loadGameSessionByInviteCode === 'function'),
      save: !!(bridge && typeof bridge.saveGameSessionByInviteCode === 'function')
    };
    return {
      bridgeAvailable: !!bridge,
      bridgeMethods,
      globals,
      allBridgeMethodsReady: bridgeMethods.create && bridgeMethods.accept && bridgeMethods.load && bridgeMethods.save,
      allGlobalWrappersReady: globals.create && globals.accept && globals.load && globals.save
    };
  }

  function readOnlineGameContractSmoke() {
    let hardening = null;
    try {
      if (typeof window.getSupabaseHardeningStatus === 'function') hardening = window.getSupabaseHardeningStatus();
    } catch (err) {
      hardening = { error: safeString(err && err.message ? err.message : err) };
    }
    const smoke = hardening && hardening.gameSessionRpcSmoke ? hardening.gameSessionRpcSmoke : null;
    const readiness = hardening && hardening.hardeningReadiness ? hardening.hardeningReadiness : null;
    const perGameCoverage = smoke && smoke.perGameCoverage ? smoke.perGameCoverage : {};
    const perGameFallbackCoverage = smoke && smoke.perGameFallbackCoverage ? smoke.perGameFallbackCoverage : {};
    const requiredGames = [
      { key: 'ttt', label: 'Piškvorky' },
      { key: 'battleship', label: 'Lodě' }
    ];
    const rows = requiredGames.map((game) => {
      const coverage = perGameCoverage[game.key] || {};
      const fallbacks = perGameFallbackCoverage[game.key] || {};
      return {
        key: game.key,
        label: game.label,
        create: safeNumber(coverage.create, 0),
        accept: safeNumber(coverage.accept, 0),
        save: safeNumber(coverage.save, 0),
        fallbackCreate: safeNumber(fallbacks.create, 0),
        fallbackAccept: safeNumber(fallbacks.accept, 0),
        fallbackSave: safeNumber(fallbacks.save, 0)
      };
    });
    const missing = [];
    const fallbacks = [];
    rows.forEach((row) => {
      if (row.create < 1) missing.push(row.label + ':create');
      if (row.accept < 1) missing.push(row.label + ':accept');
      if (row.save < 1) missing.push(row.label + ':save');
      if (row.fallbackCreate > 0) fallbacks.push(row.label + ':create');
      if (row.fallbackAccept > 0) fallbacks.push(row.label + ':accept');
      if (row.fallbackSave > 0) fallbacks.push(row.label + ':save');
    });
    return {
      available: !!smoke,
      hardeningAvailable: !!hardening,
      hardeningError: safeString(hardening && hardening.error || ''),
      readyForPolicyTightening: !!(smoke && smoke.readyForPolicyTightening),
      attempts: safeNumber(smoke && smoke.attempts, 0),
      successes: safeNumber(smoke && smoke.successes, 0),
      fallbackCount: safeNumber(smoke && smoke.fallbacks, 0),
      operationCoverage: smoke && smoke.operationCoverage ? Object.assign({}, smoke.operationCoverage) : null,
      fallbackCoverage: smoke && smoke.fallbackCoverage ? Object.assign({}, smoke.fallbackCoverage) : null,
      perGameCoverage: rows,
      missingGameOperations: Array.isArray(smoke && smoke.missingGameOperations) ? smoke.missingGameOperations.slice(0, 16) : missing.slice(0, 16),
      fallbackGameOperations: fallbacks.slice(0, 16),
      gameCoverageText: safeString(smoke && smoke.gameCoverageText || rows.map((row) => row.label + ' c/a/s ' + row.create + '/' + row.accept + '/' + row.save + ' · fallback ' + (row.fallbackCreate + row.fallbackAccept + row.fallbackSave)).join(' | ')),
      recommendation: safeString(smoke && smoke.recommendation || (readiness && readiness.nextSafeStep) || 'Nasbírat ruční create/accept/save smoke pro Piškvorky i Lodě bez fallbacku.'),
      policyChangeAllowedNow: false
    };
  }

  window.getRakOnlineGameContractAuditHealth = function getRakOnlineGameContractAuditHealth() {
    const issues = [];
    const warnings = [];
    const bridge = readOnlineGameContractBridgeStatus();
    const smoke = readOnlineGameContractSmoke();

    if (!bridge.bridgeAvailable) issues.push('RotationSupabaseBridge není dostupný');
    if (!bridge.allBridgeMethodsReady) issues.push('chybí některý bridge method create/accept/load/save');
    if (!bridge.allGlobalWrappersReady) warnings.push('chybí některý legacy wrapper create/accept/load/save');
    if (!smoke.hardeningAvailable) warnings.push('Supabase hardening status zatím není dostupný');
    if (smoke.hardeningError) warnings.push('Supabase hardening status read error: ' + smoke.hardeningError);
    if (!smoke.available) warnings.push('gameSessionRpcSmoke zatím není dostupný');
    if (smoke.missingGameOperations.length) warnings.push('chybí ruční RPC smoke: ' + smoke.missingGameOperations.join(', '));
    if (smoke.fallbackCount > 0 || smoke.fallbackGameOperations.length) warnings.push('online hry mají fallback záznamy: ' + (smoke.fallbackGameOperations.join(', ') || smoke.fallbackCount));

    return {
      ok: issues.length === 0,
      mode: 'online-game-contract-audit-v901',
      checkedAt: nowIso(),
      version: safeString(window.APP_VERSION || '1.2 (1.116)'),
      phase: 'phase I Supabase online hry create/accept/save kontrakty',
      phasePercent: 100,
      phaseClosed: true,
      readOnly: true,
      dbMutations: false,
      policyChanges: false,
      onlineFlowMutations: false,
      bridgeAvailable: bridge.bridgeAvailable,
      bridgeMethods: bridge.bridgeMethods,
      globalWrappers: bridge.globals,
      bridgeMethodsReady: bridge.allBridgeMethodsReady,
      globalWrappersReady: bridge.allGlobalWrappersReady,
      smokeAvailable: smoke.available,
      readyForPolicyTightening: false,
      policyChangeAllowedNow: false,
      attempts: smoke.attempts,
      successes: smoke.successes,
      fallbackCount: smoke.fallbackCount,
      operationCoverage: smoke.operationCoverage,
      fallbackCoverage: smoke.fallbackCoverage,
      perGameCoverage: smoke.perGameCoverage,
      gameCoverageText: smoke.gameCoverageText,
      missingGameOperations: smoke.missingGameOperations,
      fallbackGameOperations: smoke.fallbackGameOperations,
      issueCount: issues.length,
      warningCount: warnings.length,
      issues: issues.slice(0, 12),
      warnings: warnings.slice(0, 12),
      nextSafeStep: 'Read-only kontrakt mapa je uzavřená. Dál sbírat reálný dvoumobilový create/accept/save smoke pro Piškvorky i Lodě; DB policies neutahovat bez potvrzení obou her bez fallbacku.',
      recommendation: smoke.recommendation,
      scoreCleanup: {
        confirmedExternally: true,
        tables: ['game_stats', 'gomoku_wins'],
        expectedRowsAfterCleanup: 0,
        note: 'Supabase výsledkové tabulky byly jednorázově vyčištěné mimo klienta; klient zůstává read-only a DB/policies se v aplikaci nemění.'
      }
    };
  };

  window.getRakOnlineGameContractClosureHealth = function getRakOnlineGameContractClosureHealth() {
    const audit = typeof window.getRakOnlineGameContractAuditHealth === 'function' ? window.getRakOnlineGameContractAuditHealth() : null;
    const issues = [];
    const warnings = [];
    if (!audit) issues.push('online game contract audit není dostupný');
    if (audit && !audit.bridgeMethodsReady) issues.push('bridge create/accept/load/save není kompletní');
    if (audit && !audit.globalWrappersReady) warnings.push('legacy wrappery nejsou kompletní');
    if (audit && audit.fallbackCount > 0) warnings.push('v online smoke jsou fallback záznamy');
    if (audit && Array.isArray(audit.missingGameOperations) && audit.missingGameOperations.length) warnings.push('čeká reálný dvoumobilový smoke: ' + audit.missingGameOperations.join(', '));
    return {
      ok: issues.length === 0,
      mode: 'online-game-contract-closure-v901',
      checkedAt: nowIso(),
      version: safeString(window.APP_VERSION || '1.2 (1.116)'),
      phase: 'phase I Supabase online hry create/accept/save kontrakty',
      phasePercent: 100,
      phaseClosed: true,
      readOnly: true,
      dbMutations: false,
      policyChanges: false,
      onlineFlowMutations: false,
      bridgeMethodsReady: !!(audit && audit.bridgeMethodsReady),
      globalWrappersReady: !!(audit && audit.globalWrappersReady),
      smokeAvailable: !!(audit && audit.smokeAvailable),
      readyForPolicyTightening: false,
      policyChangeAllowedNow: false,
      closureScope: [
        'zmapované create/accept/load/save bridge metody',
        'zmapované legacy wrappery',
        'pasivní smoke čtení pro Piškvorky a Lodě',
        'explicitní blokace policy změn bez reálného dvoumobilového smoke'
      ],
      issueCount: issues.length,
      warningCount: warnings.length,
      issues,
      warnings,
      nextSafeStep: 'Uzavřený audit používat jako release gate. Policies neutahovat, dokud Piškvorky i Lodě neprojdou reálným create/accept/save testem na dvou mobilech bez fallbacku.'
    };
  };

  window.getRakOnlineGameContractSmokeReport = function getRakOnlineGameContractSmokeReport() {
    const audit = typeof window.getRakOnlineGameContractAuditHealth === 'function' ? window.getRakOnlineGameContractAuditHealth() : null;
    return {
      ok: !!(audit && audit.ok),
      status: audit ? (audit.ok ? 'audit-ready' : 'kontrola') : 'unavailable',
      mode: 'online-game-contract-smoke-v901',
      checkedAt: nowIso(),
      version: safeString(window.APP_VERSION || '1.2 (1.116)'),
      readOnly: true,
      dbMutations: false,
      policyChanges: false,
      onlineFlowMutations: false,
      phasePercent: safeNumber(audit && audit.phasePercent, 0),
      bridgeMethodsReady: !!(audit && audit.bridgeMethodsReady),
      globalWrappersReady: !!(audit && audit.globalWrappersReady),
      smokeAvailable: !!(audit && audit.smokeAvailable),
      readyForPolicyTightening: false,
      attempts: safeNumber(audit && audit.attempts, 0),
      successes: safeNumber(audit && audit.successes, 0),
      fallbackCount: safeNumber(audit && audit.fallbackCount, 0),
      missingGameOperations: Array.isArray(audit && audit.missingGameOperations) ? audit.missingGameOperations.slice(0, 16) : [],
      gameCoverageText: safeString(audit && audit.gameCoverageText || ''),
      lastWarningSample: Array.isArray(audit && audit.warnings) ? audit.warnings.slice(0, 8) : [],
      lastIssueSample: Array.isArray(audit && audit.issues) ? audit.issues.slice(0, 8) : []
    };
  };

  window.runRakOnlineGameContractSmokeReport = function runRakOnlineGameContractSmokeReport() {
    return window.getRakOnlineGameContractSmokeReport();
  };


  try {
    const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-supabase-client-audit.js', 'loaded', { source: 'index', durationMs: ended - started });
    }
  } catch (err) {}
})();
