// RaK 1.2 (1.68) – storage/sync audit a cleanup guard.

(function setupRakStorageSyncAudit() {
  const started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const CURRENT_STORAGE_AUDIT_BUILD = 889;

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-storage-sync-audit.js', 'loading', { source: 'index' });
    }
  } catch (err) {}

  function nowIso() {
    try { return new Date().toISOString(); } catch (err) { return ''; }
  }

  function safeString(value) {
    try { return String(value == null ? '' : value); } catch (err) { return ''; }
  }

  function classifyStorageKey(key) {
    const raw = safeString(key);
    const low = raw.toLowerCase();
    if (!raw) return 'empty';
    if (low.includes('supabase') || low.includes('sb-')) return 'supabase';
    if (low.includes('game') || low.includes('ttt') || low.includes('gomoku') || low.includes('battleship') || low.includes('snake') || low.includes('flap') || low.includes('arcade')) return 'games';
    if (low.includes('theme') || low.includes('background') || low.includes('uiprefs') || low.includes('profile_ui')) return 'profile-ui';
    if (low.includes('rotace') || low.includes('rotation') || low.includes('rozpis') || low.includes('stats')) return 'rotation-stats';
    if (low.includes('cache') || low.includes('queue') || low.includes('sync') || low.includes('offline') || low.includes('live')) return 'offline-sync';
    if (low.includes('err') || low.includes('diagnostic') || low.includes('smoke') || low.includes('audit')) return 'diagnostics';
    return 'other';
  }

  function shouldTryJson(raw) {
    const text = safeString(raw).trim();
    if (!text || text.length > 1500000) return false;
    return text[0] === '{' || text[0] === '[';
  }

  function extractStorageBuildNumber(text) {
    const value = safeString(text);
    const matches = [];
    value.replace(/v\.1\.5\s*\((\d{3,4})\)/gi, function (_, build) { matches.push(Number(build)); return _; });
    value.replace(/v1\.5-(\d{3,4})/gi, function (_, build) { matches.push(Number(build)); return _; });
    value.replace(/(?:^|[^a-z0-9])v(\d{3,4})(?:[^a-z0-9]|$)/gi, function (_, build) { matches.push(Number(build)); return _; });
    return matches.length ? Math.max.apply(Math, matches.filter(Number.isFinite)) : null;
  }

  function detectStorageCleanupCandidate(key, raw, bucket, size, invalidJson) {
    const textKey = safeString(key);
    const low = textKey.toLowerCase();
    const build = extractStorageBuildNumber(textKey + ' ' + safeString(raw).slice(0, 240));
    const isVeryOldBuild = Number.isFinite(build) && build > 0 && build < (CURRENT_STORAGE_AUDIT_BUILD - 20);
    const isPreviousAuditBuild = Number.isFinite(build) && build > 0 && build < CURRENT_STORAGE_AUDIT_BUILD;
    const base = {
      key: textKey,
      bucket,
      approxBytes: Number(size || 0),
      detectedBuild: Number.isFinite(build) ? build : null,
      risk: 'low',
      action: 'manual-review',
      reason: ''
    };

    if (invalidJson) {
      return Object.assign({}, base, {
        risk: 'medium',
        action: 'manual-review',
        reason: 'Položka vypadá jako JSON, ale nejde načíst. Nechat jen jako návrh, nemaže se automaticky.'
      });
    }

    if (isVeryOldBuild && (low.includes('cache') || low.includes('smoke') || low.includes('audit') || low.includes('diagnostic') || low.includes('readiness') || low.includes('reset'))) {
      return Object.assign({}, base, {
        risk: 'low',
        action: 'candidate-cleanup',
        reason: 'Starý audit/cache/reset marker z výrazně staršího buildu. Vhodné jen pro ruční úklid po ověření.'
      });
    }

    if (isPreviousAuditBuild && bucket === 'diagnostics') {
      return Object.assign({}, base, {
        risk: 'low',
        action: 'candidate-cleanup',
        reason: 'Starší diagnostický/smoke záznam. Nepotřebný pro běh aplikace, ale zatím jen návrh.'
      });
    }

    if (size > 350000 && (bucket === 'diagnostics' || bucket === 'offline-sync' || bucket === 'games')) {
      return Object.assign({}, base, {
        risk: 'medium',
        action: 'manual-review',
        reason: 'Velká lokální položka v cache/sync/herním bucketu. Nejdřív ověřit, jestli nejde o aktivní rozehranou hru nebo offline frontu.'
      });
    }

    if ((low.includes('old') || low.includes('legacy') || low.includes('backup')) && (bucket === 'diagnostics' || bucket === 'offline-sync' || bucket === 'games')) {
      return Object.assign({}, base, {
        risk: 'medium',
        action: 'manual-review',
        reason: 'Název vypadá jako starý/legacy/backup klíč. Bez ruční kontroly nemazat.'
      });
    }

    return null;
  }

  function scanLocalStorage() {
    const result = {
      ok: true,
      readable: false,
      writeProbeUsed: false,
      itemCount: 0,
      approxBytes: 0,
      largeKeyCount: 0,
      largestKeys: [],
      bucketCounts: {},
      jsonCandidateCount: 0,
      invalidJsonCount: 0,
      invalidJsonKeys: [],
      offlineSyncKeyCount: 0,
      gameKeyCount: 0,
      supabaseKeyCount: 0,
      profileUiKeyCount: 0,
      diagnosticsKeyCount: 0,
      staleResetMarkerCount: 0,
      staleResetMarkers: [],
      staleCleanupCandidateCount: 0,
      cleanupCandidateCount: 0,
      cleanupCandidateApproxBytes: 0,
      cleanupCandidateRiskCounts: {},
      cleanupCandidateActionCounts: {},
      cleanupCandidates: [],
      cleanupCandidateBuckets: {},
      warningCount: 0,
      warnings: [],
      error: ''
    };

    try {
      if (typeof localStorage === 'undefined') {
        result.ok = false;
        result.error = 'localStorage unavailable';
        return result;
      }
      result.readable = true;
      const entries = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = safeString(localStorage.key(i));
        let raw = '';
        try { raw = safeString(localStorage.getItem(key)); } catch (err) { raw = ''; }
        const size = key.length + raw.length;
        const bucket = classifyStorageKey(key);
        result.bucketCounts[bucket] = Number(result.bucketCounts[bucket] || 0) + 1;
        result.approxBytes += size;
        entries.push({ key, size, bucket });
        if (bucket === 'offline-sync') result.offlineSyncKeyCount += 1;
        if (bucket === 'games') result.gameKeyCount += 1;
        if (bucket === 'supabase') result.supabaseKeyCount += 1;
        if (bucket === 'profile-ui') result.profileUiKeyCount += 1;
        if (bucket === 'diagnostics') result.diagnosticsKeyCount += 1;
        if (/reset.*v(8[0-5][0-9]|[0-7][0-9]{2})|v1\.5-[0-8][0-5][0-9]|v\.1\.5 \(([0-8][0-5][0-9])\)/i.test(key)) {
          result.staleResetMarkerCount += 1;
          if (result.staleResetMarkers.length < 8) result.staleResetMarkers.push(key);
        }
        let invalidJson = false;
        if (shouldTryJson(raw)) {
          result.jsonCandidateCount += 1;
          try { JSON.parse(raw); }
          catch (err) {
            invalidJson = true;
            result.invalidJsonCount += 1;
            if (result.invalidJsonKeys.length < 8) result.invalidJsonKeys.push(key);
          }
        }
        const cleanupCandidate = detectStorageCleanupCandidate(key, raw, bucket, size, invalidJson);
        if (cleanupCandidate) {
          result.cleanupCandidateCount += 1;
          result.staleCleanupCandidateCount += 1;
          result.cleanupCandidateApproxBytes += Number(size || 0);
          result.cleanupCandidateRiskCounts[cleanupCandidate.risk] = Number(result.cleanupCandidateRiskCounts[cleanupCandidate.risk] || 0) + 1;
          result.cleanupCandidateActionCounts[cleanupCandidate.action] = Number(result.cleanupCandidateActionCounts[cleanupCandidate.action] || 0) + 1;
          result.cleanupCandidateBuckets[bucket] = Number(result.cleanupCandidateBuckets[bucket] || 0) + 1;
          if (result.cleanupCandidates.length < 16) result.cleanupCandidates.push(cleanupCandidate);
        }
      }
      result.itemCount = entries.length;
      result.largestKeys = entries.sort((a, b) => b.size - a.size).slice(0, 8);
      result.largeKeyCount = entries.filter((item) => item.size > 180000).length;
      if (result.largeKeyCount > 0) result.warnings.push('větší localStorage klíče: ' + result.largeKeyCount);
      if (result.invalidJsonCount > 0) result.warnings.push('nevalidní JSON položky: ' + result.invalidJsonCount);
      if (result.itemCount > 120) result.warnings.push('hodně localStorage položek: ' + result.itemCount);
      if (result.cleanupCandidateCount > 0) result.warnings.push('kandidáti ručního úklidu: ' + result.cleanupCandidateCount);
      result.warningCount = result.warnings.length;
      result.ok = result.invalidJsonCount === 0;
    } catch (err) {
      result.ok = false;
      result.error = safeString(err && err.message ? err.message : err || 'storage scan error');
    }
    return result;
  }

  function readSupabaseSyncSnapshot() {
    const out = {
      available: false,
      queueLength: null,
      queueMaxItems: null,
      realtimeStatus: '',
      failedReads: null,
      failedWrites: null,
      queuedFallbacks: null,
      cacheHits: null,
      cacheWrites: null,
      error: ''
    };
    try {
      const hardening = typeof window.getSupabaseHardeningStatus === 'function' ? window.getSupabaseHardeningStatus() : null;
      if (!hardening) return out;
      out.available = true;
      out.queueLength = Number(hardening.queueLength || 0);
      out.queueMaxItems = Number(hardening.queueMaxItems || 0) || null;
      out.realtimeStatus = safeString(hardening.realtimeStatus || '');
      const sync = hardening.syncGuard || {};
      const cache = hardening.cacheGuard || {};
      out.failedReads = Number(sync.failedReads || 0);
      out.failedWrites = Number(sync.failedWrites || 0);
      out.queuedFallbacks = Number(sync.queuedFallbacks || 0);
      out.cacheHits = Number((cache.accountCacheHits || 0) + (cache.statsCacheHits || 0));
      out.cacheWrites = Number((cache.accountCacheWrites || 0) + (cache.statsCacheWrites || 0));
    } catch (err) {
      out.error = safeString(err && err.message ? err.message : err);
    }
    return out;
  }

  function computeRakStorageSyncAuditHealth() {
    const storage = scanLocalStorage();
    const supabaseSync = readSupabaseSyncSnapshot();
    const issues = [];
    const warnings = [];

    if (!storage.readable) issues.push('localStorage unreadable');
    if (storage.invalidJsonCount > 0) issues.push('invalid JSON in localStorage: ' + storage.invalidJsonCount);
    if (storage.largeKeyCount > 0) warnings.push('large localStorage keys: ' + storage.largeKeyCount);
    if (storage.staleResetMarkerCount > 0) warnings.push('old reset/version markers visible: ' + storage.staleResetMarkerCount);
    if (storage.cleanupCandidateCount > 0) warnings.push('manual cleanup candidates visible: ' + storage.cleanupCandidateCount);
    if (supabaseSync.available && supabaseSync.queueMaxItems && supabaseSync.queueLength > supabaseSync.queueMaxItems) issues.push('Supabase queue over max');
    if (supabaseSync.available && Number(supabaseSync.failedWrites || 0) > 0) warnings.push('Supabase failed writes seen: ' + supabaseSync.failedWrites);

    return {
      ok: issues.length === 0,
      mode: 'storage-sync-readonly-closure-v897',
      checkedAt: nowIso(),
      version: safeString(window.APP_VERSION || 'unknown'),
      phase: 'phase G storage/localStorage/offline sync audit',
      phasePercent: 100,
      phaseClosed: true,
      readOnly: true,
      autoCleanupEnabled: false,
      cleanupMapReadOnly: true,
      issueCount: issues.length,
      warningCount: warnings.length + Number(storage.warningCount || 0),
      issues: issues.slice(0, 12),
      warnings: warnings.concat(storage.warnings || []).slice(0, 12),
      staleCleanupCandidateCount: Number(storage.cleanupCandidateCount || 0),
      cleanupCandidateApproxBytes: Number(storage.cleanupCandidateApproxBytes || 0),
      cleanupCandidateRiskCounts: storage.cleanupCandidateRiskCounts || {},
      cleanupCandidateActionCounts: storage.cleanupCandidateActionCounts || {},
      cleanupCandidateBuckets: storage.cleanupCandidateBuckets || {},
      cleanupCandidates: (storage.cleanupCandidates || []).slice(0, 16),
      storage,
      supabaseSync,
      nextStep: 'Storage/sync audit fáze je uzavřená. Další krok: jen případný výslovně potvrzený ruční cleanup, bez automatického mazání dat.'
    };
  }

  function getRakStorageManualCleanupGuard() {
    let audit = null;
    try { audit = computeRakStorageSyncAuditHealth(); } catch (err) { audit = null; }
    const candidateCount = audit ? Number(audit.staleCleanupCandidateCount || audit.cleanupCandidateCount || 0) : 0;
    const riskCounts = audit && audit.cleanupCandidateRiskCounts ? audit.cleanupCandidateRiskCounts : {};
    const highRiskCount = Number(riskCounts.high || 0);
    const mediumRiskCount = Number(riskCounts.medium || 0);
    return {
      ok: true,
      mode: 'manual-cleanup-guard-v897',
      checkedAt: nowIso(),
      version: safeString(window.APP_VERSION || 'unknown'),
      readOnly: true,
      manualOnly: true,
      autoCleanupEnabled: false,
      destructiveActionExposed: false,
      removeItemAllowed: false,
      clearAllowed: false,
      candidateCount,
      mediumRiskCount,
      highRiskCount,
      requiresHumanReview: candidateCount > 0,
      rule: 'Tahle vrstva nikdy sama nemaže localStorage. Slouží jen jako pojistka a návrh pro budoucí ruční úklid.',
      safeActions: ['scan', 'preview', 'diagnostics-only'],
      blockedActions: ['auto-delete', 'localStorage.clear', 'removeItem bez ručního potvrzení a přesného klíče'],
      sampleCandidates: audit && audit.cleanupCandidates ? audit.cleanupCandidates.slice(0, 8) : []
    };
  }
  window.getRakStorageManualCleanupGuard = getRakStorageManualCleanupGuard;

  function updateRakStorageSyncSmokeReport(partial) {
    const data = partial && typeof partial === 'object' ? partial : {};
    Object.assign(STORAGE_SYNC_SMOKE_REPORT, data, {
      mode: 'storage-sync-smoke-report-v897',
      version: safeString(window.APP_VERSION || '1.2 (1.68)'),
      checkedAt: nowIso()
    });
    return getRakStorageSyncSmokeReport();
  }
  window.updateRakStorageSyncSmokeReport = updateRakStorageSyncSmokeReport;

  function getRakStorageSyncSmokeReport() {
    return Object.assign({}, STORAGE_SYNC_SMOKE_REPORT, {
      ok: STORAGE_SYNC_SMOKE_REPORT.ok,
      status: safeString(STORAGE_SYNC_SMOKE_REPORT.status || 'not-run'),
      mode: safeString(STORAGE_SYNC_SMOKE_REPORT.mode || 'storage-sync-smoke-report-v897'),
      version: safeString(STORAGE_SYNC_SMOKE_REPORT.version || window.APP_VERSION || 'unknown'),
      lastStage: safeString(STORAGE_SYNC_SMOKE_REPORT.lastStage || '—'),
      lastError: safeString(STORAGE_SYNC_SMOKE_REPORT.lastError || '')
    });
  }
  window.getRakStorageSyncSmokeReport = getRakStorageSyncSmokeReport;

  function runRakStorageSyncSmokeReport(reason) {
    try {
      const audit = computeRakStorageSyncAuditHealth();
      const guard = getRakStorageManualCleanupGuard();
      const ok = !!(audit && audit.ok && guard && guard.ok && guard.autoCleanupEnabled === false && guard.destructiveActionExposed === false);
      return updateRakStorageSyncSmokeReport({
        ok,
        status: ok ? 'ok' : 'kontrola',
        runCount: Number(STORAGE_SYNC_SMOKE_REPORT.runCount || 0) + 1,
        successCount: Number(STORAGE_SYNC_SMOKE_REPORT.successCount || 0) + (ok ? 1 : 0),
        failureCount: Number(STORAGE_SYNC_SMOKE_REPORT.failureCount || 0) + (ok ? 0 : 1),
        lastStage: safeString(reason || 'ruční/storage smoke kontrola'),
        storageItemCount: Number(audit && audit.storage && audit.storage.itemCount || 0),
        cleanupCandidateCount: Number(audit && audit.staleCleanupCandidateCount || 0),
        cleanupCandidateApproxBytes: Number(audit && audit.cleanupCandidateApproxBytes || 0),
        invalidJsonCount: Number(audit && audit.storage && audit.storage.invalidJsonCount || 0),
        warningCount: Number(audit && audit.warningCount || 0),
        issueCount: Number(audit && audit.issueCount || 0),
        manualGuardReady: !!(guard && guard.ok),
        autoCleanupEnabled: false,
        lastError: ok ? '' : String((audit && audit.issues || []).join(', ') || 'storage smoke kontrola')
      });
    } catch (err) {
      return updateRakStorageSyncSmokeReport({
        ok: false,
        status: 'error',
        runCount: Number(STORAGE_SYNC_SMOKE_REPORT.runCount || 0) + 1,
        failureCount: Number(STORAGE_SYNC_SMOKE_REPORT.failureCount || 0) + 1,
        lastStage: 'storage smoke error',
        autoCleanupEnabled: false,
        lastError: safeString(err && err.message ? err.message : err)
      });
    }
  }
  window.runRakStorageSyncSmokeReport = runRakStorageSyncSmokeReport;

  function getRakStorageSyncClosureHealth() {
    let audit = null;
    let smoke = null;
    let guard = null;
    const issues = [];
    const warnings = [];
    try { audit = computeRakStorageSyncAuditHealth(); }
    catch (err) {
      issues.push('storage audit read error: ' + safeString(err && err.message ? err.message : err));
    }
    try { smoke = getRakStorageSyncSmokeReport(); }
    catch (err) { warnings.push('storage smoke read error: ' + safeString(err && err.message ? err.message : err)); }
    try { guard = getRakStorageManualCleanupGuard(); }
    catch (err) { issues.push('manual cleanup guard read error: ' + safeString(err && err.message ? err.message : err)); }

    if (audit && audit.ok === false) issues.push('storage audit issue: ' + safeString((audit.issues || []).join(', ') || audit.status || 'kontrola'));
    if (smoke && smoke.ok === false) warnings.push('storage smoke warning: ' + safeString(smoke.lastError || smoke.status || 'kontrola'));
    if (!guard || guard.ok !== true) issues.push('manual cleanup guard unavailable');
    if (guard && guard.autoCleanupEnabled) issues.push('auto cleanup enabled');
    if (guard && guard.destructiveActionExposed) issues.push('destructive cleanup action exposed');

    return {
      ok: issues.length === 0,
      mode: 'storage-sync-audit-closure-v897',
      checkedAt: nowIso(),
      version: safeString(window.APP_VERSION || '1.2 (1.68)'),
      phase: 'phase G storage/localStorage/offline sync audit',
      phasePercent: 100,
      phaseClosed: true,
      readOnly: true,
      autoCleanupEnabled: false,
      cleanupMapReadOnly: true,
      smokeReportLinked: !!smoke,
      manualCleanupGuardLinked: !!guard,
      guardOk: guard ? guard.ok : false,
      smokeStatus: smoke ? safeString(smoke.status || '—') : '—',
      smokeOk: smoke ? smoke.ok : null,
      smokeRunCount: smoke ? Number(smoke.runCount || 0) : 0,
      candidateCount: audit ? Number(audit.staleCleanupCandidateCount || audit.cleanupCandidateCount || 0) : 0,
      invalidJsonCount: audit && audit.storage ? Number(audit.storage.invalidJsonCount || 0) : 0,
      warningCount: warnings.length + Number(audit && audit.warningCount || 0),
      issueCount: issues.length,
      issues: issues.slice(0, 12),
      warnings: warnings.concat(audit && audit.warnings ? audit.warnings : []).slice(0, 12),
      nextStep: 'Storage/sync audit je uzavřený. Ruční cleanup dělat jen po výslovném potvrzení a podle přesných klíčů.'
    };
  }
  window.getRakStorageSyncClosureHealth = getRakStorageSyncClosureHealth;

  window.getRakStorageSyncAuditHealth = computeRakStorageSyncAuditHealth;

  try {
    const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-storage-sync-audit.js', 'loaded', { source: 'index', durationMs: Math.max(0, Math.round(ended - started)) });
    }
  } catch (err) {}
})();
