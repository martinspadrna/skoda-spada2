// RaK 1.2 (1.104) – release ops checklist a rollback playbook.

(function setupRakReleaseOpsAudit() {
  const started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-release-ops-audit.js', 'loading', { source: 'index' });
    }
  } catch (err) {}

  function nowIso() {
    try { return new Date().toISOString(); } catch (err) { return ''; }
  }

  function readDiag(alias, fallbackGlobalName) {
    try {
      if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.readWithFallback === 'function') {
        const result = window.RaK.diagnostics.readWithFallback(alias, fallbackGlobalName);
        if (result) return result;
      }
    } catch (err) {}
    try {
      if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.read === 'function') {
        const result = window.RaK.diagnostics.read(alias);
        if (result) return result;
      }
    } catch (err) {}
    try {
      const fn = window[String(fallbackGlobalName || '')];
      return typeof fn === 'function' ? fn() : null;
    } catch (err) {
      return { ok: false, error: String(err && err.message ? err.message : err) };
    }
  }

  function boolOk(value) {
    return !!(value && value.ok !== false);
  }

  function buildGate(id, label, status, severity, evidence, action) {
    return {
      id,
      label,
      status,
      ok: status === 'ok' || status === 'manual',
      severity: severity || 'warning',
      evidence: String(evidence || '').slice(0, 220),
      action: String(action || '').slice(0, 260)
    };
  }

  function collectReleaseOpsSignals() {
    return {
      releaseReadiness: readDiag('releaseReadiness', 'getRakReleaseReadinessHealth'),
      architectureBaseline: readDiag('architectureBaseline', 'getRakArchitectureBaselineHealth'),
      moduleReadiness: readDiag('health', 'getRakModuleReadinessHealth'),
      exportReleaseTooling: readDiag('exportReleaseTooling', 'getRakExportReleaseToolingHealth'),
      exportSmokeReport: readDiag('exportSmokeReport', 'getRakExportSmokeReport'),
      domActionClosure: readDiag('domActionClosure', 'getRakDomActionRegistryClosureHealth'),
      storageSyncClosure: readDiag('storageSyncClosure', 'getRakStorageSyncClosureHealth'),
      supabaseQueueClosure: readDiag('supabaseQueueClosure', 'getRakSupabaseQueueClosureHealth'),
      onlineGameContractClosure: readDiag('onlineGameContractClosure', 'getRakOnlineGameContractClosureHealth'),
      foodSundayGuard: readDiag('foodSundayGuard', 'getFoodScheduleSundayGuardHealth'),
      pwaHardening: (typeof window.getPwaHardeningStatus === 'function' ? window.getPwaHardeningStatus() : null),
      supabaseHardening: (typeof window.getSupabaseHardeningStatus === 'function' ? window.getSupabaseHardeningStatus() : null),
      keepalive: (typeof window.getSupabaseKeepaliveStatus === 'function' ? window.getSupabaseKeepaliveStatus() : null)
    };
  }

  window.getRakReleaseOpsChecklistHealth = function getRakReleaseOpsChecklistHealth() {
    const signals = collectReleaseOpsSignals();
    const gates = [];

    gates.push(buildGate(
      'release-readiness',
      'Release readiness helper',
      signals.releaseReadiness && signals.releaseReadiness.ok ? 'ok' : 'warning',
      'warning',
      signals.releaseReadiness ? ('warningy ' + String(signals.releaseReadiness.warningCount || 0) + ', issue ' + String(signals.releaseReadiness.issueCount || 0)) : 'helper není dostupný',
      'Před releasem otevřít Diagnostiku a zkontrolovat, že release readiness nemá issue.'
    ));

    gates.push(buildGate(
      'version-cache-channel',
      'Verze / cache / realtime kanál',
      /^v\.\d+\.\d+ \(\d+\)$/.test(String(window.APP_VERSION || '')) ? 'ok' : 'blocker',
      'blocker',
      String(window.APP_VERSION || '—'),
      'Verze musí být sjednocená v core.js, sw.js, package.json, changelog, exportu a realtime kanálu.'
    ));

    gates.push(buildGate(
      'module-readiness',
      'Načtení modulů',
      signals.moduleReadiness && signals.moduleReadiness.ok ? 'ok' : 'warning',
      'warning',
      signals.moduleReadiness ? ('načteno ' + String(signals.moduleReadiness.loadedCount || 0) + '/' + String(signals.moduleReadiness.expectedCount || 0)) : 'registry není dostupný',
      'Při problému zkontrolovat pořadí skriptů v index.html a chybějící soubory v ZIPu.'
    ));

    gates.push(buildGate(
      'export-preflight',
      'Export ZIP / manifest',
      signals.exportReleaseTooling && signals.exportReleaseTooling.ok ? 'ok' : 'warning',
      'warning',
      signals.exportReleaseTooling ? ('source ID ' + String(signals.exportReleaseTooling.sourceIdCount || 0) + ', duplicit bin ' + String(signals.exportReleaseTooling.duplicateBinaryCount || 0)) : 'export tooling není dostupný',
      'Před vydáním spustit export smoke a ověřit ZIP bez vnitřní složky, jediná složka assets/.'
    ));

    gates.push(buildGate(
      'dom-action-closure',
      'DOM/action closure',
      signals.domActionClosure && signals.domActionClosure.ok ? 'ok' : 'warning',
      'warning',
      signals.domActionClosure ? ('fáze ' + String(signals.domActionClosure.phasePercent || 0) + '%') : 'closure není dostupný',
      'Při warningu neprovádět handler refactor v tom samém buildu, jen dohledat konkrétní data-action.'
    ));

    gates.push(buildGate(
      'storage-sync-closure',
      'Storage/offline sync closure',
      signals.storageSyncClosure && signals.storageSyncClosure.ok ? 'ok' : 'warning',
      'warning',
      signals.storageSyncClosure ? ('auto mazání ' + (signals.storageSyncClosure.autoCleanupEnabled ? 'zapnuto' : 'vypnuto')) : 'closure není dostupný',
      'Automatické mazání dat musí zůstat vypnuté; cleanup jen ručně po kontrole.'
    ));

    gates.push(buildGate(
      'supabase-queue-closure',
      'Supabase queue closure',
      signals.supabaseQueueClosure && signals.supabaseQueueClosure.ok ? 'ok' : 'warning',
      'warning',
      signals.supabaseQueueClosure ? ('DB změny ' + (signals.supabaseQueueClosure.dbMutations ? 'ano' : 'ne') + ', policies ' + (signals.supabaseQueueClosure.policyChanges ? 'ano' : 'ne')) : 'closure není dostupný',
      'Bez explicitního důvodu neměnit DB schema ani policies; auto flush/cleanup držet vypnutý.'
    ));

    gates.push(buildGate(
      'online-game-contracts',
      'Online hry create/accept/save kontrakty',
      signals.onlineGameContractClosure && signals.onlineGameContractClosure.ok ? 'ok' : 'warning',
      'warning',
      signals.onlineGameContractClosure ? ('policies ' + (signals.onlineGameContractClosure.policyChangeAllowedNow ? 'lze zvažovat' : 'neutahovat')) : 'closure není dostupný',
      'Policies neutahovat bez reálného dvoumobilového smoke testu Piškvorek i Lodí.'
    ));

    gates.push(buildGate(
      'food-sunday-guard',
      'Kantýna/jídelna neděle',
      signals.foodSundayGuard && signals.foodSundayGuard.ok ? 'ok' : 'warning',
      'warning',
      signals.foodSundayGuard ? ('přesčasových nedělí ' + String(signals.foodSundayGuard.overtimeSundayCount || 0)) : 'guard není dostupný',
      'Běžná neděle musí používat normální rozpis; mimořádná neděle musí být v detailu rozeznatelná jako přesčas.'
    ));

    gates.push(buildGate(
      'manual-browser-mobile-smoke',
      'Ruční browser/mobil smoke',
      'manual',
      'manual',
      'nelze ověřit staticky',
      'Po nahrání ověřit mobil: Dashboard, Hry/Top score, Piškvorky AI, online link/kód, Lodě, export a tvrdý reload PWA.'
    ));

    gates.push(buildGate(
      'rollback-point',
      'Rollback bod',
      'manual',
      'manual',
      'poslední potvrzený ZIP + aktuální ZIP',
      'Před nasazením ponechat poslední potvrzený ZIP a jasné pravidlo návratu: nahrát předchozí ZIP, zvýšit cache nebo tvrdě vyčistit SW.'
    ));

    const blockers = gates.filter((gate) => gate.status === 'blocker');
    const warnings = gates.filter((gate) => gate.status === 'warning');
    const manual = gates.filter((gate) => gate.status === 'manual');

    return {
      ok: blockers.length === 0,
      mode: 'release-ops-checklist-v923',
      version: String(window.APP_VERSION || 'unknown'),
      checkedAt: nowIso(),
      gateCount: gates.length,
      blockerCount: blockers.length,
      warningCount: warnings.length,
      manualCount: manual.length,
      readyForZip: blockers.length === 0,
      readyForProduction: blockers.length === 0 && manual.length === 0,
      note: 'readyForProduction zůstává false, dokud neproběhne ruční browser/mobil smoke; to je záměr, ne chyba buildu.',
      gates,
      blockers,
      warnings,
      manualChecks: manual
    };
  };

  window.getRakMonitoringPlanHealth = function getRakMonitoringPlanHealth() {
    const signals = collectReleaseOpsSignals();
    const supabase = signals.supabaseHardening || {};
    const syncGuard = supabase.syncGuard || {};
    const cacheGuard = supabase.cacheGuard || {};
    const keepalive = signals.keepalive || {};
    const pwa = signals.pwaHardening || {};
    const metrics = [
      { id: 'frontend-diagnostic-warning-count', label: 'Diagnostické warningy', source: 'getRakReleaseReadinessHealth()', current: signals.releaseReadiness ? Number(signals.releaseReadiness.warningCount || 0) : null, threshold: 'blokuje až issue; warning vyžaduje ruční kontrolu', action: 'Otevřít Diagnostiku a číst konkrétní řádek.' },
      { id: 'supabase-queue-length', label: 'Délka Supabase offline fronty', source: 'getSupabaseHardeningStatus().queueLength', current: Number(supabase.queueLength || 0), threshold: 'varování > 20, riziko > 80', action: 'Zkontrolovat internet, cooldown, případně ruční flush jen po kontrole.' },
      { id: 'supabase-read-write-errors', label: 'Supabase read/write chyby', source: 'syncGuard.failedReads / failedWrites', current: String(Number(syncGuard.failedReads || 0)) + '/' + String(Number(syncGuard.failedWrites || 0)), threshold: 'opakovaný růst po reloadu', action: 'Zkontrolovat status projektu, RLS/policies a network.' },
      { id: 'supabase-keepalive', label: 'Supabase heartbeat', source: 'getSupabaseKeepaliveStatus()', current: String(keepalive.status || keepalive.label || '—'), threshold: 'poslední OK starší než 6 dní', action: 'Spustit ruční heartbeat v Diagnostice.' },
      { id: 'online-game-fallbacks', label: 'Fallbacky online her', source: 'online game contract smoke/closure', current: signals.onlineGameContractClosure ? Number(signals.onlineGameContractClosure.fallbackCount || 0) : null, threshold: '> 0 po čistém online testu', action: 'Neutahovat policies, dokud nejsou Piškvorky i Lodě ověřené bez fallbacků.' },
      { id: 'pwa-cache-version', label: 'PWA cache verze', source: 'getPwaHardeningStatus()', current: String(pwa.swCacheVersion || '—') + ' / ' + String(pwa.swExpectedCacheVersion || '—'), threshold: 'mismatch po tvrdém reloadu', action: 'Vyčistit cache v Nastavení a reloadnout aplikaci.' },
      { id: 'leaderboard-cache', label: 'Leaderboard cache', source: 'game localStorage + Supabase game_stats/gomoku_wins', current: 'sledovat ručně po resetu', threshold: 'staré výsledky po resetu', action: 'Ověřit DB tabulky game_stats/gomoku_wins a klientský cutoff podle last_played_at.' },
      { id: 'food-sunday-guard', label: 'Kantýna/jídelna neděle', source: 'getFoodScheduleSundayGuardHealth()', current: signals.foodSundayGuard ? (signals.foodSundayGuard.ok ? 'OK' : 'kontrola') : '—', threshold: 'nedělní rozpis neodpovídá normální vs. přesčasové variantě', action: 'Opravit jen food schedule mapu; neměnit rotace ani dashboard layout.' },
      { id: 'cache-shared-read', label: 'Supabase cache hit/write', source: 'cacheGuard', current: String(Number(cacheGuard.accountCacheHits || 0)) + '/' + String(Number(cacheGuard.accountCacheWrites || 0)), threshold: 'extrémní churn na low-end mobilu', action: 'Zvýšit debounce/TTL až po měření, ne preventivně.' }
    ];

    return {
      ok: true,
      mode: 'release-ops-monitoring-map-v923',
      version: String(window.APP_VERSION || 'unknown'),
      checkedAt: nowIso(),
      metricCount: metrics.length,
      metrics,
      alertRules: [
        'P0: znovu se objeví staré Top score po resetu → ověřit Supabase game_stats/gomoku_wins a lokální cache/SW.',
        'P0: online Piškvorky/Lodě nejdou založit nebo přijmout → rollback na poslední potvrzený ZIP, policies neměnit.',
        'P1: běžná nebo přesčasová neděle ukáže špatný rozpis → opravit jen food schedule data/guard, bez změny rotací.',
        'P1: service worker drží starý build po tvrdém reloadu → zvýšit cache verzi, vyčistit staré RaK cache.',
        'P2: offline queue roste nad 80 → ruční diagnostika, ne automatické mazání.'
      ]
    };
  };

  window.getRakRollbackPlaybookHealth = function getRakRollbackPlaybookHealth() {
    const steps = [
      { order: 1, title: 'Zastavit další změny', detail: 'Nepřidávat nový refactor do stejného buildu, dokud není jasné, co se rozbilo.' },
      { order: 2, title: 'Určit rozsah', detail: 'Rozlišit klientskou chybu, PWA cache, Supabase DB/policies, nebo konkrétní modul.' },
      { order: 3, title: 'Zkontrolovat Diagnostiku', detail: 'Release readiness, PWA cache, Supabase queue, online contract closure, food Sunday guard.' },
      { order: 4, title: 'Vrátit artefakt', detail: 'Nahrát poslední potvrzený ZIP a při PWA problému zvýšit cache verzi nebo vyčistit cache.' },
      { order: 5, title: 'DB rollback jen cíleně', detail: 'Supabase schema/policies neměnit naslepo; datové mazání jen po SELECT kontrole a jen cílené tabulky.' },
      { order: 6, title: 'Post-rollback smoke', detail: 'Mobil: Dashboard, Top score, Piškvorky AI, online Piškvorky link/kód, Lodě, export, tvrdý reload.' }
    ];
    const decisionRules = [
      'Pokud je problém jen cache/SW, nejdřív hard reload / vyčištění cache, ne zásah do kódu.',
      'Pokud selžou online hry, neměnit policies a vrátit klientský build na poslední potvrzenou funkční verzi.',
      'Pokud se vrátí staré Top score, nejdřív SELECT nad game_stats/gomoku_wins a kontrola last_played_at cutoffu.',
      'Pokud je problém v kantýně/jídelně, opravovat jen food schedule data/guard, ne směnový cyklus.'
    ];

    return {
      ok: true,
      mode: 'release-ops-rollback-playbook-v923',
      version: String(window.APP_VERSION || 'unknown'),
      checkedAt: nowIso(),
      rollbackArtifactRule: 'Poslední potvrzený ZIP je rollback bod; nový ZIP čeká na „ok“.',
      dbRule: 'DB schema/policies jen přes samostatné rozhodnutí; výsledkové tabulky mazat jen po SELECT kontrole.',
      steps,
      decisionRules,
      postRollbackChecklist: [
        'Aplikace ukazuje správnou verzi v O aplikaci.',
        'Service worker nemá starou cache verzi.',
        'Top score neukazuje staré výsledky.',
        'Online Piškvorky: link i ruční kód.',
        'Lodě: vytvoření, připojení, potvrzení flotil, střelba.',
        'Kantýna/jídelna: běžná neděle odpovídá normálnímu rozpisu, přesčasová neděle má odlišený mimořádný režim.'
      ]
    };
  };

  window.getRakReleaseOpsClosureHealth = function getRakReleaseOpsClosureHealth() {
    const checklist = window.getRakReleaseOpsChecklistHealth();
    const monitoring = window.getRakMonitoringPlanHealth();
    const rollback = window.getRakRollbackPlaybookHealth();
    const issues = [];
    const warnings = [];
    if (!checklist || checklist.ok === false) issues.push('release ops checklist má blocker');
    if (!monitoring || monitoring.ok === false) warnings.push('monitoring plan není dostupný');
    if (!rollback || rollback.ok === false) warnings.push('rollback playbook není dostupný');
    if (checklist && Number(checklist.manualCount || 0) > 0) warnings.push('browser/mobil smoke zůstává ruční ověření');

    return {
      ok: issues.length === 0,
      mode: 'release-ops-closure-v923',
      version: String(window.APP_VERSION || 'unknown'),
      checkedAt: nowIso(),
      phase: 'phase J release readiness / monitoring / rollback',
      phasePercent: 100,
      phaseClosed: true,
      issueCount: issues.length,
      warningCount: warnings.length,
      issues,
      warnings,
      checklistGateCount: checklist ? Number(checklist.gateCount || 0) : 0,
      checklistBlockerCount: checklist ? Number(checklist.blockerCount || 0) : 0,
      checklistManualCount: checklist ? Number(checklist.manualCount || 0) : 0,
      monitoringMetricCount: monitoring ? Number(monitoring.metricCount || 0) : 0,
      rollbackStepCount: rollback && Array.isArray(rollback.steps) ? rollback.steps.length : 0,
      policyChanges: false,
      dbSchemaChanges: false,
      onlineFlowChanges: false,
      nextStep: 'Další bezpečný směr: AppSec/privacy klientského povrchu nebo reálný browser/mobile smoke; Supabase policies pořád neutahovat bez dvoumobilového testu.'
    };
  };

  try {
    const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-release-ops-audit.js', 'loaded', { source: 'index', durationMs: Math.max(0, Math.round(ended - started)) });
    }
  } catch (err) {}
})();
