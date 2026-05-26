// v.1.5 (911) – release gating/checklist vrstva nad read-only audity bez mutací.

(function setupRakReleaseGates() {
  const started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const VERSION = 'v.1.5 (911)';
  const MODE = 'release-gates-readonly-v911';

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-release-gates.js', 'loading', { source: 'index' });
    }
  } catch (err) {}

  function nowIso() {
    try { return new Date().toISOString(); } catch (err) { return ''; }
  }

  function safeString(value, fallback) {
    try {
      const str = String(value ?? '').trim();
      return str || String(fallback || '');
    } catch (err) {
      return String(fallback || '');
    }
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
      return { ok: false, error: safeString(err && err.message ? err.message : err) };
    }
  }

  function makeGate(id, label, status, severity, evidence, action, source) {
    const safeStatus = ['ok', 'warning', 'blocker', 'manual'].includes(String(status || '')) ? String(status) : 'warning';
    return {
      id: safeString(id, 'unknown'),
      label: safeString(label, id),
      status: safeStatus,
      ok: safeStatus === 'ok' || safeStatus === 'manual',
      severity: safeString(severity || safeStatus, safeStatus),
      evidence: safeString(evidence, '—').slice(0, 260),
      action: safeString(action, 'Zkontrolovat v Diagnostice.').slice(0, 320),
      source: safeString(source, 'runtime')
    };
  }

  function okStatus(value, warningWhenMissing) {
    if (!value) return warningWhenMissing ? 'warning' : 'blocker';
    return value.ok === false ? 'warning' : 'ok';
  }

  function collectReleaseGateSignals() {
    const releaseOpsChecklist = readDiag('releaseOpsChecklist', 'getRakReleaseOpsChecklistHealth');
    const releaseOpsClosure = readDiag('releaseOpsClosure', 'getRakReleaseOpsClosureHealth');
    const appSecPrivacyClosure = readDiag('appSecPrivacyClosure', 'getRakAppSecPrivacyClosureHealth');
    const onlineGameContractClosure = readDiag('onlineGameContractClosure', 'getRakOnlineGameContractClosureHealth');
    const storageSyncClosure = readDiag('storageSyncClosure', 'getRakStorageSyncClosureHealth');
    const supabaseQueueClosure = readDiag('supabaseQueueClosure', 'getRakSupabaseQueueClosureHealth');
    const domActionClosure = readDiag('domActionClosure', 'getRakDomActionRegistryClosureHealth');
    const foodSundayGuard = readDiag('foodSundayGuard', 'getFoodScheduleSundayGuardHealth');
    const exportReleaseTooling = readDiag('exportReleaseTooling', 'getRakExportReleaseToolingHealth');
    const exportSmokeReport = readDiag('exportSmokeReport', 'getRakExportSmokeReport');
    const moduleReadiness = readDiag('health', 'getRakModuleReadinessHealth');
    const releaseReadiness = readDiag('releaseReadiness', 'getRakReleaseReadinessHealth');
    const bootSequence = readDiag('bootSequence', 'getRakBootSequenceHealth');
    const runtimeGuard = readDiag('runtimeGuard', 'getRakRuntimeGuardHealth');
    const gamesTopScoreDomHardening = readDiag('gamesTopScoreDomHardening', 'getRakGamesTopScoreDomHardeningHealth');
    const gamesProfileDomHardening = readDiag('gamesProfileDomHardening', 'getRakGamesProfileDomHardeningHealth');
    const gamesHudMessageDomHardening = readDiag('gamesHudMessageDomHardening', 'getRakGamesHudMessageDomHardeningHealth');
    const gamesShipsMenuDomHardening = readDiag('gamesShipsMenuDomHardening', 'getRakGamesShipsMenuDomHardeningHealth');
    const domSecurityHardeningClosure = readDiag('domSecurityHardeningClosure', 'getRakDomSecurityHardeningClosureHealth');

    return {
      releaseOpsChecklist,
      releaseOpsClosure,
      appSecPrivacyClosure,
      onlineGameContractClosure,
      storageSyncClosure,
      supabaseQueueClosure,
      domActionClosure,
      foodSundayGuard,
      exportReleaseTooling,
      exportSmokeReport,
      moduleReadiness,
      releaseReadiness,
      bootSequence,
      runtimeGuard,
      gamesTopScoreDomHardening,
      gamesProfileDomHardening,
      gamesHudMessageDomHardening,
      gamesShipsMenuDomHardening,
      domSecurityHardeningClosure
    };
  }

  function buildGateMatrix(signals) {
    const gates = [];
    const version = safeString(window.APP_VERSION || VERSION);
    const versionOk = /^v\.1\.5 \(910\)$/.test(version);

    gates.push(makeGate(
      'version-consistency',
      'Verze / build značka',
      versionOk ? 'ok' : 'blocker',
      'blocker',
      version,
      'Před ZIPem musí sedět core.js, sw.js, package.json, CHANGELOG, O aplikaci, export manifest i realtime kanál.',
      'core/sw/export'
    ));

    const moduleMissing = Number(signals.moduleReadiness && signals.moduleReadiness.missingCount || 0);
    const moduleErrors = Number(signals.moduleReadiness && signals.moduleReadiness.errorCount || 0);
    gates.push(makeGate(
      'module-readiness',
      'Načtení modulů',
      signals.moduleReadiness && signals.moduleReadiness.ok ? 'ok' : 'blocker',
      'blocker',
      signals.moduleReadiness ? ('loaded ' + String(signals.moduleReadiness.loadedCount || 0) + '/' + String(signals.moduleReadiness.expectedCount || 0) + ', missing ' + moduleMissing + ', errors ' + moduleErrors) : 'module readiness helper chybí',
      'Chybějící modul je release blocker; zkontrolovat index.html, sw.js APP_SHELL, export manifest a ZIP.',
      'module-readiness'
    ));

    gates.push(makeGate(
      'export-manifest',
      'Export ZIP / manifest',
      signals.exportReleaseTooling && signals.exportReleaseTooling.ok ? 'ok' : 'warning',
      'warning',
      signals.exportReleaseTooling ? ('source ' + String(signals.exportReleaseTooling.sourceIdCount || 0) + ', bin dup ' + String(signals.exportReleaseTooling.duplicateBinaryCount || 0)) : 'export tooling helper chybí',
      'Před vydáním pustit export preflight; ZIP musí mít soubory v kořeni a jedinou složku assets/.',
      'export'
    ));

    gates.push(makeGate(
      'runtime-release-readiness',
      'Runtime/release readiness',
      okStatus(signals.releaseReadiness, true),
      'warning',
      signals.releaseReadiness ? ('issues ' + String(signals.releaseReadiness.issueCount || 0) + ', warnings ' + String(signals.releaseReadiness.warningCount || 0)) : 'release readiness helper chybí',
      'Warning není automatický blocker, ale před releasem se musí ručně přečíst konkrétní řádek v Diagnostice.',
      'rak-audit-baseline'
    ));

    gates.push(makeGate(
      'boot-sequence',
      'Boot sekvence',
      okStatus(signals.bootSequence, true),
      'warning',
      signals.bootSequence ? ('static ' + (signals.bootSequence.staticOrderOk ? 'OK' : 'kontrola') + ', dynamic ' + (signals.bootSequence.dynamicOrderOk ? 'OK' : 'kontrola')) : 'boot helper chybí',
      'Při warningu neměnit pořadí skriptů v tom samém buildu bez samostatného testu.',
      'rak-boot-sequence-audit'
    ));

    gates.push(makeGate(
      'storage-sync',
      'Storage/offline sync closure',
      signals.storageSyncClosure && signals.storageSyncClosure.ok && !signals.storageSyncClosure.autoCleanupEnabled ? 'ok' : 'warning',
      'warning',
      signals.storageSyncClosure ? ('fáze ' + String(signals.storageSyncClosure.phasePercent || 0) + '%, auto cleanup ' + (signals.storageSyncClosure.autoCleanupEnabled ? 'zapnuto' : 'vypnuto')) : 'closure chybí',
      'Automatické mazání dat musí zůstat vypnuté; cleanup jen ručně po kontrole.',
      'rak-storage-sync-audit'
    ));

    gates.push(makeGate(
      'supabase-queue',
      'Supabase queue closure',
      signals.supabaseQueueClosure && signals.supabaseQueueClosure.ok && !signals.supabaseQueueClosure.autoFlushEnabled && !signals.supabaseQueueClosure.autoDeleteEnabled ? 'ok' : 'warning',
      'warning',
      signals.supabaseQueueClosure ? ('auto flush ' + (signals.supabaseQueueClosure.autoFlushEnabled ? 'zapnuto' : 'vypnuto') + ', auto delete ' + (signals.supabaseQueueClosure.autoDeleteEnabled ? 'zapnuto' : 'vypnuto')) : 'closure chybí',
      'Auto flush a auto delete fronty nepouštět bez samostatného ověření online/offline scénáře.',
      'rak-supabase-client-audit'
    ));

    gates.push(makeGate(
      'online-game-contracts',
      'Online hry create/accept/save closure',
      signals.onlineGameContractClosure && signals.onlineGameContractClosure.ok ? 'ok' : 'warning',
      'warning',
      signals.onlineGameContractClosure ? ('fáze ' + String(signals.onlineGameContractClosure.phasePercent || 0) + '%, policies ' + (signals.onlineGameContractClosure.policyChangeAllowedNow ? 'lze zvažovat' : 'neutahovat')) : 'closure chybí',
      'Supabase policies neutahovat bez reálného dvoumobilového smoke testu Piškvorek i Lodí.',
      'rak-supabase-client-audit'
    ));

    gates.push(makeGate(
      'food-sunday-overtime',
      'Kantýna/jídelna neděle',
      signals.foodSundayGuard && signals.foodSundayGuard.ok ? 'ok' : 'warning',
      'warning',
      signals.foodSundayGuard ? ('přesčasových nedělí ' + String(signals.foodSundayGuard.overtimeSundayCount || 0)) : 'guard chybí',
      'Běžná neděle musí použít normální rozpis; přesčasová neděle musí přepnout na mimořádný režim a být označená.',
      'dashboard/food schedule'
    ));

    gates.push(makeGate(
      'dom-action-registry',
      'DOM/action closure',
      signals.domActionClosure && signals.domActionClosure.ok ? 'ok' : 'warning',
      'warning',
      signals.domActionClosure ? ('fáze ' + String(signals.domActionClosure.phasePercent || 0) + '%, warningy ' + String(signals.domActionClosure.warningCount || 0)) : 'closure chybí',
      'Při warningu nejdřív dohledat konkrétní data-action; nepřepojovat handler vrstvu naslepo.',
      'rak-dom-action-audit'
    ));

    gates.push(makeGate(
      'appsec-privacy',
      'AppSec/privacy closure',
      signals.appSecPrivacyClosure && signals.appSecPrivacyClosure.ok ? 'ok' : 'warning',
      'warning',
      signals.appSecPrivacyClosure ? ('fáze ' + String(signals.appSecPrivacyClosure.phasePercent || 0) + '%, storage unknown ' + String(signals.appSecPrivacyClosure.storageUnknownKeyCount || 0) + ', DOM sinky ' + String(signals.appSecPrivacyClosure.domStaticSinkCount || 0)) : 'closure chybí',
      'CSP/SRI zavádět jen report-only; hodnoty storage klíčů v diagnostice nečíst.',
      'rak-appsec-privacy-audit'
    ));

    gates.push(makeGate(
      'release-ops',
      'Release ops closure',
      signals.releaseOpsClosure && signals.releaseOpsClosure.ok ? 'ok' : 'warning',
      'warning',
      signals.releaseOpsClosure ? ('fáze ' + String(signals.releaseOpsClosure.phasePercent || 0) + '%, manual ' + String(signals.releaseOpsClosure.checklistManualCount || 0)) : 'closure chybí',
      'Monitoring/rollback checklist musí být dostupný; ruční browser/mobil smoke zůstává požadavek.',
      'rak-release-ops-audit'
    ));


    gates.push(makeGate(
      'games-profile-dom-hardening',
      'Hry profily/achievementy DOM hardening',
      signals.gamesProfileDomHardening && signals.gamesProfileDomHardening.ok ? 'ok' : 'warning',
      'warning',
      signals.gamesProfileDomHardening ? ('escapovaná pole ' + String((signals.gamesProfileDomHardening.escapedFields || []).length || 0) + ', číselná pole ' + String((signals.gamesProfileDomHardening.numericFields || []).length || 0)) : 'guard chybí',
      'Profily, statistiky a achievementy musí escapovat jména/texty a normalizovat čísla bez čtení uložených hodnot.',
      'games-arcade.js'
    ));

    gates.push(makeGate(
      'games-hud-message-dom-hardening',
      'Hry HUD/hlášky DOM hardening',
      signals.gamesHudMessageDomHardening && signals.gamesHudMessageDomHardening.ok ? 'ok' : 'warning',
      'warning',
      signals.gamesHudMessageDomHardening ? ('escapovaná pole ' + String((signals.gamesHudMessageDomHardening.escapedFields || []).length || 0) + ', sinky ' + String((signals.gamesHudMessageDomHardening.sinks || []).length || 0)) : 'guard chybí',
      'Herní HUD řádky a fallback chybové hlášky musí zkracovat a escapovat texty bez čtení uložených hodnot.',
      'games-arcade.js'
    ));

    gates.push(makeGate(
      'games-top-score-dom-hardening',
      'Hry Top score DOM hardening',
      signals.gamesTopScoreDomHardening && signals.gamesTopScoreDomHardening.ok ? 'ok' : 'warning',
      'warning',
      signals.gamesTopScoreDomHardening ? ('escapovaná pole ' + String((signals.gamesTopScoreDomHardening.escapedFields || []).length || 0)) : 'guard chybí',
      'Top score renderer musí escapovat jména, jednotky, hodnoty i čas bez čtení uložených hodnot.',
      'games-arcade.js'
    ));

    gates.push(makeGate(
      'games-ships-menu-dom-hardening',
      'Lodě menu/zápasy DOM hardening',
      signals.gamesShipsMenuDomHardening && signals.gamesShipsMenuDomHardening.ok ? 'ok' : 'warning',
      'warning',
      signals.gamesShipsMenuDomHardening ? ('escapovaná pole ' + String((signals.gamesShipsMenuDomHardening.escapedFields || []).length || 0) + ', sinky ' + String((signals.gamesShipsMenuDomHardening.sinks || []).length || 0)) : 'guard chybí',
      'Menu Lodí, pozvánka a uložené vzájemné zápasy musí escapovat texty bez zásahu do online flow.',
      'games-arcade.js'
    ));

    gates.push(makeGate(
      'dom-security-hardening',
      'DOM/security hardening plán',
      signals.domSecurityHardeningClosure && signals.domSecurityHardeningClosure.ok ? 'ok' : 'warning',
      'warning',
      signals.domSecurityHardeningClosure ? ('fáze ' + String(signals.domSecurityHardeningClosure.phasePercent || 0) + '%, kandidáti ' + String(signals.domSecurityHardeningClosure.candidateCount || 0) + ', P1 review ' + String(signals.domSecurityHardeningClosure.p1ReviewCount || 0)) : 'closure chybí',
      'DOM hardening dělat jen po jedné sink skupině; žádný hromadný přepis innerHTML bez regression testu.',
      'rak-dom-security-hardening'
    ));

    gates.push(makeGate(
      'manual-mobile-smoke',
      'Ruční mobil/browser smoke',
      'manual',
      'manual',
      'staticky nelze ověřit',
      'Po nahrání ověřit mobil: PWA tvrdý reload, Dashboard, kantýna/jídelna, Top score nula, Piškvorky AI, online Piškvorky link/kód, Lodě, export.',
      'manual'
    ));

    gates.push(makeGate(
      'supabase-policy-change-freeze',
      'Supabase policies freeze',
      'manual',
      'manual',
      'bez dvoumobilového smoke testu policies neutahovat',
      'Jakákoli policy změna musí být samostatný build až po reálném dvoumobilovém smoke testu online Piškvorek i Lodí.',
      'manual'
    ));

    return gates;
  }

  window.getRakReleaseGatePolicy = function getRakReleaseGatePolicy() {
    return {
      ok: true,
      mode: 'release-gate-policy-v911',
      version: safeString(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      statuses: [
        { status: 'blocker', meaning: 'Nesmí do ZIPu/release bez opravy nebo vědomého rollback plánu.' },
        { status: 'warning', meaning: 'Může do ZIPu jen po přečtení evidence a vědomém přijetí rizika.' },
        { status: 'manual', meaning: 'Staticky nelze potvrdit; musí ověřit člověk v mobilu/prohlížeči.' },
        { status: 'ok', meaning: 'Read-only kontrola nehlásí problém.' }
      ],
      blockerRules: [
        'nesedící APP_VERSION/cache/realtime/package/export verze',
        'chybějící nebo chybový modul v module readiness',
        'rozbitý export manifest s chybějícími soubory',
        'nečekaná DB/policy mutace v buildu, který ji neměl dělat',
        'hromadný DOM rewrite bez regression testů a rollback plánu'
      ],
      manualRules: [
        'browser/mobil smoke',
        'online Piškvorky link + ruční kód na dvou mobilech',
        'Lodě create/accept/save na dvou mobilech',
        'PWA cache tvrdý reload po nasazení'
      ],
      mutationPolicy: 'Tato vrstva jen čte existující diagnostiky; nesmí mazat data, měnit DB, měnit policies ani přepojovat online flow.'
    };
  };

  window.getRakReleaseGateMatrixHealth = function getRakReleaseGateMatrixHealth() {
    const signals = collectReleaseGateSignals();
    const gates = buildGateMatrix(signals);
    const blockers = gates.filter(gate => gate.status === 'blocker');
    const warnings = gates.filter(gate => gate.status === 'warning');
    const manual = gates.filter(gate => gate.status === 'manual');
    const okGates = gates.filter(gate => gate.status === 'ok');
    const bySeverity = gates.reduce((acc, gate) => {
      const key = safeString(gate.status || gate.severity, 'unknown');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      ok: blockers.length === 0,
      mode: MODE,
      version: safeString(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      gateCount: gates.length,
      okGateCount: okGates.length,
      blockerCount: blockers.length,
      warningCount: warnings.length,
      manualCount: manual.length,
      readyForZip: blockers.length === 0,
      readyForProduction: blockers.length === 0 && manual.length === 0,
      bySeverity,
      gates,
      blockers,
      warnings,
      manualChecks: manual,
      note: 'readyForProduction zůstává false, dokud neproběhne ruční mobil/browser smoke; readyForZip řeší jen statické blockery.'
    };
  };

  window.getRakReleaseGateClosureHealth = function getRakReleaseGateClosureHealth() {
    const matrix = window.getRakReleaseGateMatrixHealth();
    const policy = window.getRakReleaseGatePolicy();
    return {
      ok: !!(matrix && matrix.ok),
      mode: 'release-gates-closure-v911',
      version: safeString(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      phase: 'phase K release gating / checklist matrix',
      phasePercent: 100,
      phaseClosed: true,
      gateCount: matrix ? Number(matrix.gateCount || 0) : 0,
      blockerCount: matrix ? Number(matrix.blockerCount || 0) : 0,
      warningCount: matrix ? Number(matrix.warningCount || 0) : 0,
      manualCount: matrix ? Number(matrix.manualCount || 0) : 0,
      readyForZip: !!(matrix && matrix.readyForZip),
      readyForProduction: !!(matrix && matrix.readyForProduction),
      policyStatusCount: policy && Array.isArray(policy.statuses) ? policy.statuses.length : 0,
      dbSchemaChanges: false,
      policyChanges: false,
      onlineFlowChanges: false,
      dataMutation: false,
      nextStep: 'Další bezpečný krok: první konkrétní sink skupina v games-arcade.js – jen jména/skóre přes safe helper, bez hromadného přepisu šablon.'
    };
  };

  try {
    if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.register === 'function') {
      window.RaK.diagnostics.register('releaseGatePolicy', window.getRakReleaseGatePolicy);
      window.RaK.diagnostics.register('releaseGateMatrix', window.getRakReleaseGateMatrixHealth);
      window.RaK.diagnostics.register('releaseGateClosure', window.getRakReleaseGateClosureHealth);
    }
  } catch (err) {}

  try {
    const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-release-gates.js', 'loaded', { source: 'index', durationMs: Math.max(0, Math.round(ended - started)) });
    }
  } catch (err) {}
})();
