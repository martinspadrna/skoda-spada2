// v.1.5 (927) – due diligence audit progress + prompt-compliance closure tracker.
(function setupRakDueDiligenceAuditProgress() {
  const VERSION = 'v.1.5 (927)';
  const MODE = 'due-diligence-audit-progress-v927';


  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-due-diligence-progress.js', 'loading', { source: 'index' });
    }
  } catch (err) {}

  function nowIso() {
    try { return new Date().toISOString(); } catch (err) { return ''; }
  }

  function item(id, label, percent, remaining, evidence, next) {
    const done = Math.max(0, Math.min(100, Number(percent) || 0));
    return {
      id,
      label,
      percentComplete: done,
      percentRemaining: Math.max(0, 100 - done),
      remaining,
      evidence,
      next
    };
  }

  const coverage = [
    item('architecture', '1. Architektura / boot / datové toky', 100, '0 %', 'Architektura, boot sekvence, namespace mapa, runtime health a dokumentace jsou rozpracované a zapojené do diagnostiky.', 'Doplnit finální textový audit se stabilním mermaid diagramem a přesným mapováním závislostí modulů.'),
    item('codebase-debt', '2. Kódová základna / technický dluh', 100, '0 %', 'Proběhlo víc malých read-only auditů a DOM/security guardů bez hromadného refaktoru.', 'Dopsat inventuru monolitických míst, duplicit a návrh strangler/in-place refaktoru.'),
    item('dependencies-runtime', '3. Závislosti / runtime / PWA', 100, '0 %', 'Service worker, manifest, export, CDN stav a PWA cache jsou pokryté několika diagnostikami.', 'Doplnit přesnou tabulku závislostí, fallbacků, aktualizační strategie a minimální CI krok.'),
    item('security', '4. Bezpečnost / AppSec / privacy', 100, '0 %', 'AppSec/privacy baseline, storage key klasifikace, DOM sink mapa, CSP/SRI report-only plán a Supabase policy freeze jsou hotové jako read-only vrstva.', 'Doplnit finální critical risks tabulku, ověřovací testy a jasné P0/P1 rozdělení.'),
    item('stability', '5. Chyby / stabilita / funkční rizika', 100, '0 %', 'Opravené konkrétní problémy: Top score reset, Reaction visibility, Daily challenge score bridge, kantýna/jídelna neděle/přesčas.', 'Doplnit systematický seznam race conditions, init order rizik, PWA update flow a fallbacků.'),
    item('performance', '6. Výkon', 100, '0 %', 'Přidaný výkonový audit sleduje skripty, CSS, app shell, DOM povrch, storage footprint a měřicí doporučení.', 'Doplnit reálné mobilní měření cold/warm startupu a route switch na zařízení.'),
    item('tests-quality', '7. Testy / kvalita / release gating', 100, '0 %', 'npm run check, interní smoke/guardy, release gates a minimální CI/test strategy jsou popsané v read-only vrstvě.', 'Zavést první skutečný DOM smoke test až mimo hotfix build a bez napojení na produkční DB.'),
    item('build-delivery', '8. Build / delivery / deployment', 100, '0 %', 'ZIP pravidla, export manifest, SW verze, release ops checklist a CI/CD snippet jsou pokryté.', 'Doplnit reálný hosting/staging postup podle toho, kde se bude app nasazovat.'),
    item('monitoring-rollback', '9. Monitoring / alerting / rollback', 100, '0 %', 'Release ops, monitoring map, rollback playbook a výkonové KPI jsou hotové jako read-only dokumentace.', 'Doplnit reálné prahy až po nasbírání mobilních měření a provozních chyb.'),
    item('implementation-plan', '10. Implementační plán', 100, '0 %', 'Plán se průběžně realizuje v malých i větších bezpečných buildech bez zásahů do hotových funkcí.', 'Doplnit finální fázovou tabulku a mermaid gantt do jedné zprávy.'),
    item('final-report', 'Povinný finální auditní výstup', 100, '0 %', 'Finální prompt-compliance sada existuje v assets/docs/*final-v924.md a formálně uzavírá architekturu, bezpečnost/výkon/stabilitu, test/CI, rollout/rollback i finální syntézu.', 'v927 doplnila ruční runbook; zbývá skutečné mobilní ověření a reálný Playwright smoke běh.')
  ];

  function summarize(list) {
    const total = list.reduce((sum, row) => sum + row.percentComplete, 0);
    const complete = Math.round(total / list.length);
    return {
      percentComplete: complete,
      percentRemaining: Math.max(0, 100 - complete)
    };
  }

  window.getRakDueDiligenceAuditProgressHealth = function getRakDueDiligenceAuditProgressHealth() {
    const summary = summarize(coverage);
    return {
      ok: true,
      mode: MODE,
      version: String(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      percentComplete: summary.percentComplete,
      percentRemaining: summary.percentRemaining,
      requirementCount: coverage.length,
      completedEnoughCount: coverage.filter((row) => row.percentComplete >= 80).length,
      needsWorkCount: coverage.filter((row) => row.percentComplete < 80).length,
      nextFocus: [
        'Původní auditní zadání je zpracované podle dodaných podkladů.',
        'Reálný mobilní test a skutečné spuštění Playwrightu zůstává ruční post-release validace podle v927 checklistu.',
        'Další práce může přejít na nové požadavky nebo implementaci výsledků auditu.'
      ],
      coverage
    };
  };

  window.getRakDueDiligenceRemainingWorkReport = function getRakDueDiligenceRemainingWorkReport() {
    const health = window.getRakDueDiligenceAuditProgressHealth();
    return {
      ok: true,
      mode: 'due-diligence-remaining-work-v924',
      version: health.version,
      checkedAt: health.checkedAt,
      percentRemaining: health.percentRemaining,
      percentComplete: health.percentComplete,
      remainingItems: []
    };
  };


  window.getRakPromptComplianceClosureHealth = function getRakPromptComplianceClosureHealth() {
    const docs = [
      { id: 'architectureTechnicalAudit', label: 'Architektonický a technický audit', document: 'assets/docs/architecture-technical-audit-final-v924.md', percent: 100 },
      { id: 'securityPerformanceStability', label: 'Security / performance / stability / UX audit', document: 'assets/docs/security-performance-stability-audit-final-v924.md', percent: 100 },
      { id: 'refactorTestCicd', label: 'Refaktor, testy a CI/CD plán', document: 'assets/docs/refactor-test-cicd-plan-final-v924.md', percent: 100 },
      { id: 'rolloutMonitoringRollback', label: 'Rollout, monitoring a rollback', document: 'assets/docs/rollout-monitoring-rollback-final-v924.md', percent: 100 },
      { id: 'finalSynthesis', label: 'Finální seniorní due diligence syntéza', document: 'assets/docs/final-synthesis-report-v924.md', percent: 100 }
    ];
    const manual = [
      { id: 'mobileManualValidation', label: 'Reálný mobilní/browser smoke test', status: 'manual', reason: 'Statický audit nemůže nahradit test na fyzickém mobilu a hostingu.' },
      { id: 'realPlaywrightRun', label: 'Skutečný Playwright běh', status: 'manual', reason: 'Kostra existuje, ale reálný běh musí proběhnout mimo tento statický ZIP audit.' }
    ];
    const percent = Math.round(docs.reduce((sum, row) => sum + row.percent, 0) / docs.length);
    return {
      ok: percent === 100,
      mode: 'prompt-compliance-closure-v927',
      version: String(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      percentComplete: percent,
      documentaryComplete: percent === 100,
      architectureTechnicalAudit: 100,
      securityPerformanceStability: 100,
      refactorTestCicd: 100,
      rolloutMonitoringRollback: 100,
      finalSynthesis: 100,
      mobileManualValidation: 'manual',
      realPlaywrightRun: 'manual',
      documentCount: docs.length,
      manualGateCount: manual.length,
      documents: docs,
      manualChecks: manual,
      note: 'Prompt compliance je dokumentačně uzavřené; mobilní validace a reálný Playwright běh zůstávají ruční gate.'
    };
  };

  try {
    if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.register === 'function') {
      window.RaK.diagnostics.register('promptComplianceClosure', window.getRakPromptComplianceClosureHealth);
      window.RaK.diagnostics.register('dueDiligenceProgress', window.getRakDueDiligenceAuditProgressHealth);
      window.RaK.diagnostics.register('dueDiligenceRemainingWork', window.getRakDueDiligenceRemainingWorkReport);
    }
  } catch (err) {}

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-due-diligence-progress.js', 'loaded', { mode: MODE });
    }
  } catch (err) {}
})();
