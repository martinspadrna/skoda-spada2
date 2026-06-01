// RaK 1.2 (1.85) – window.RaK namespace bridge.

(function setupRakNamespaceBridge() {
  const started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-namespace.js', 'loading', { source: 'index' });
    }
  } catch (err) {}

  const root = window.RaK || {};
  const existingVersion = root.namespaceVersion || '';
  root.namespaceVersion = '1.2 (1.85)';
  root.mode = 'passive-namespace-readonly-release-gates-frezky-sign-toggle-v931';
  root.createdAt = root.createdAt || new Date().toISOString();
  root.updatedAt = new Date().toISOString();
  root.compatibility = 'legacy-globals-preserved';

  const namespaceMap = [
    { group: 'modules', alias: 'markReady', globalName: 'rakMarkModuleReady', type: 'function', phase: 'safe-now', risk: 'low', note: 'Jen zápis module readiness události.' },
    { group: 'modules', alias: 'health', globalName: 'getRakModuleReadinessHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Čtení stavu načtení modulů.' },
    { group: 'diagnostics', alias: 'releaseReadiness', globalName: 'getRakReleaseReadinessHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Čistě diagnostický helper.' },
    { group: 'diagnostics', alias: 'architectureBaseline', globalName: 'getRakArchitectureBaselineHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Čistě diagnostický helper.' },
    { group: 'diagnostics', alias: 'runtimeGuard', globalName: 'getRakRuntimeGuardHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Čistě diagnostický helper.' },
    { group: 'diagnostics', alias: 'storageSyncAudit', globalName: 'getRakStorageSyncAuditHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only storage/localStorage a offline/sync audit bez mazání dat.' },
    { group: 'diagnostics', alias: 'storageSyncSmokeReport', globalName: 'getRakStorageSyncSmokeReport', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only poslední storage/sync smoke report bez mazání dat.' },
    { group: 'diagnostics', alias: 'storageManualCleanupGuard', globalName: 'getRakStorageManualCleanupGuard', type: 'function', phase: 'safe-now', risk: 'low', note: 'Ruční cleanup guard; potvrzuje, že automatické mazání není zapnuté.' },
    { group: 'diagnostics', alias: 'storageSyncClosure', globalName: 'getRakStorageSyncClosureHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only closure storage/sync audit fáze bez automatického mazání dat.' },
    { group: 'diagnostics', alias: 'bootSequence', globalName: 'getRakBootSequenceHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Čistě diagnostický helper.' },
    { group: 'diagnostics', alias: 'namespace', globalName: 'getRakNamespaceHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Sebekontrola namespace bridge.' },
    { group: 'diagnostics', alias: 'namespaceReadOnlyMap', globalName: 'getRakNamespaceReadOnlyMapHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only kontrola uzavřené mapy aliasů a fallbacků.' },
    { group: 'diagnostics', alias: 'phaseTenStorage', globalName: 'getPhaseTenStorageHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only kontrola storage vrstvy.' },
    { group: 'diagnostics', alias: 'phaseTenScripts', globalName: 'getPhaseTenScriptLoadHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only kontrola načtení skriptů.' },
    { group: 'diagnostics', alias: 'phaseTenNavigation', globalName: 'getPhaseTenNavigationHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only kontrola navigační vrstvy bez přepojení navigace.' },
    { group: 'diagnostics', alias: 'phaseTenPageShell', globalName: 'getPhaseTenPageShellHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only kontrola page shellu.' },
    { group: 'diagnostics', alias: 'phaseTenActions', globalName: 'getPhaseTenActionHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only kontrola data-action mapy.' },
    { group: 'diagnostics', alias: 'phaseTenForms', globalName: 'getPhaseTenFormHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only kontrola formulářů.' },
    { group: 'diagnostics', alias: 'safeHelpers', globalName: 'getPostStabilizationSafeHelperHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only kontrola stabilizačních helperů.' },
    { group: 'diagnostics', alias: 'ladaPerformance', globalName: 'getLadaPerformanceHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only kontrola Láďova/low-end režimu.' },
    { group: 'diagnostics', alias: 'gameEngineBaseline', globalName: 'getGameEngineBaselineHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only baseline herního enginu bez změny herní logiky.' },
    { group: 'diagnostics', alias: 'statsYearScope', globalName: 'getRakStatsYearScopeHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only kontrola filtrování budoucích měsíců ve statistikách.' },
    { group: 'diagnostics', alias: 'postStabilizationBaseline', globalName: 'getPostStabilizationBaselineHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only souhrn post-stabilization baseline.' },
    { group: 'diagnostics', alias: 'supabaseStructure', globalName: 'getSupabaseStructureHealth', type: 'function', phase: 'safe-now', risk: 'medium', note: 'Read-only klientský audit Supabase struktury bez DB změn.' },
    { group: 'diagnostics', alias: 'supabasePolicyRisk', globalName: 'getSupabasePolicyRiskHealth', type: 'function', phase: 'safe-now', risk: 'medium', note: 'Read-only klientský audit Supabase policy rizik bez DB změn.' },
    { group: 'diagnostics', alias: 'supabasePerformance', globalName: 'getSupabasePerformanceHealth', type: 'function', phase: 'safe-now', risk: 'medium', note: 'Read-only klientský audit Supabase výkonu bez síťové mutace.' },
    { group: 'diagnostics', alias: 'supabaseClientQueueAudit', globalName: 'getRakSupabaseClientQueueAuditHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only audit Supabase klientské/offline queue vrstvy bez DB změn.' },
    { group: 'diagnostics', alias: 'supabaseQueueSmokeReport', globalName: 'getRakSupabaseQueueSmokeReport', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only smoke report Supabase queue bez flushování fronty.' },
    { group: 'diagnostics', alias: 'supabaseQueueManualGuard', globalName: 'getRakSupabaseQueueManualGuard', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only manual guard; potvrzuje vypnutý auto flush a auto mazání fronty.' },
    { group: 'diagnostics', alias: 'supabaseQueueClosure', globalName: 'getRakSupabaseQueueClosureHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only closure Supabase client/offline queue auditu bez DB změn.' },
    { group: 'diagnostics', alias: 'onlineGameContracts', globalName: 'getRakOnlineGameContractAuditHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only audit create/accept/save kontraktů online her bez DB/policy změn.' },
    { group: 'diagnostics', alias: 'onlineGameContractSmoke', globalName: 'getRakOnlineGameContractSmokeReport', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only smoke report kontraktů online her bez zápisu do DB.' },
    { group: 'diagnostics', alias: 'onlineGameContractClosure', globalName: 'getRakOnlineGameContractClosureHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only closure online game contract auditu bez DB/policy/online-flow změn.' },
    { group: 'diagnostics', alias: 'foodSundayGuard', globalName: 'getFoodScheduleSundayGuardHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only guard: běžná neděle používá normální rozpis, přesčasová neděle přepíná na mimořádný režim.' },
    { group: 'diagnostics', alias: 'releaseOpsChecklist', globalName: 'getRakReleaseOpsChecklistHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only release readiness checklist bez mutací.' },
    { group: 'diagnostics', alias: 'monitoringPlan', globalName: 'getRakMonitoringPlanHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only mapa metrik, alertů a ručních kontrol.' },
    { group: 'diagnostics', alias: 'rollbackPlaybook', globalName: 'getRakRollbackPlaybookHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only rollback playbook pro poslední potvrzený ZIP.' },
    { group: 'diagnostics', alias: 'releaseOpsClosure', globalName: 'getRakReleaseOpsClosureHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only closure release ops fáze bez DB/policy/online-flow změn.' },
    { group: 'diagnostics', alias: 'appSecPrivacySurface', globalName: 'getRakAppSecPrivacySurfaceHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only AppSec/privacy audit klientského povrchu bez čtení citlivých hodnot.' },
    { group: 'diagnostics', alias: 'appSecPrivacyRisks', globalName: 'getRakAppSecPrivacyRiskRegister', type: 'function', phase: 'safe-now', risk: 'medium', note: 'Read-only risk register: CSP/SRI/localStorage/Supabase klientská rizika.' },
    { group: 'diagnostics', alias: 'appSecStorageKeys', globalName: 'getRakAppSecStorageKeyClassificationHealth', type: 'function', phase: 'safe-now', risk: 'medium', note: 'Read-only klasifikace názvů storage klíčů bez čtení hodnot.' },
    { group: 'diagnostics', alias: 'appSecDomSurface', globalName: 'getRakAppSecDomInjectionSurfaceHealth', type: 'function', phase: 'safe-now', risk: 'medium', note: 'Read-only inventura DOM sinků innerHTML/insertAdjacentHTML/window.open.' },
    { group: 'diagnostics', alias: 'appSecCspSriPlan', globalName: 'getRakAppSecCspSriReportOnlyPlan', type: 'function', phase: 'safe-now', risk: 'medium', note: 'Report-only CSP/SRI plán bez vynucení a bez přepojení CDN.' },
    { group: 'diagnostics', alias: 'appSecPrivacyClosure', globalName: 'getRakAppSecPrivacyClosureHealth', type: 'function', phase: 'safe-now', risk: 'medium', note: 'Read-only closure AppSec/privacy baseline fáze bez mutací.' },
    { group: 'diagnostics', alias: 'releaseGatePolicy', globalName: 'getRakReleaseGatePolicy', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only pravidla blocker/warning/manual/ok pro release gating.' },
    { group: 'diagnostics', alias: 'releaseGateMatrix', globalName: 'getRakReleaseGateMatrixHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only gate matice před ZIPem: blockery, warningy a ruční kontroly.' },
    { group: 'diagnostics', alias: 'releaseGateClosure', globalName: 'getRakReleaseGateClosureHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only closure release gating fáze bez DB/policy/online-flow změn.' },
    { group: 'diagnostics', alias: 'gamesTopScoreSeconds', globalName: 'getRakGamesTopScoreSecondsHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only guard: Reaction Top score zobrazuje vteřiny místo ms.' },
    { group: 'diagnostics', alias: 'gamesTopScoreDomHardening', globalName: 'getRakGamesTopScoreDomHardeningHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only guard: Top score renderer escapuje jména, jednotky, hodnoty a čas bez čtení uložených dat.' },
    { group: 'diagnostics', alias: 'gamesHudMessageDomHardening', globalName: 'getRakGamesHudMessageDomHardeningHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only guard: herní HUD a chybové hlášky escapují texty bez čtení uložených dat.' },
    { group: 'diagnostics', alias: 'gamesShipsMenuDomHardening', globalName: 'getRakGamesShipsMenuDomHardeningHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only guard: menu Lodí, pozvánka a vzájemné zápasy escapují texty bez zásahu do online flow.' },
    { group: 'diagnostics', alias: 'gamesPostFixScoreFlow', globalName: 'getRakGamesPostFixScoreFlowHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only guard: Reaction Top score + Denní challenge score bridge po opravě z v923.' },
    { group: 'diagnostics', alias: 'gamesActionTextDomHardening', globalName: 'getRakGamesActionTextDomHardeningHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only guard: herní akční texty, tlačítka a toast/stavové popisky escapují texty bez zásahu do gameplaye.' },
    { group: 'diagnostics', alias: 'gamesOverlayResultDomHardening', globalName: 'getRakGamesOverlayResultDomHardeningHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only guard: herní modaly, overlaye a výsledkové texty.' },
    { group: 'diagnostics', alias: 'dueDiligenceProgress', globalName: 'getRakDueDiligenceAuditProgressHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only tracker celkového due diligence auditu a procent zbývající práce.' },
    { group: 'diagnostics', alias: 'dueDiligenceRemainingWork', globalName: 'getRakDueDiligenceRemainingWorkReport', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only soupis zbývajících auditních částí podle původního promptu.' },
    { group: 'diagnostics', alias: 'promptComplianceClosure', globalName: 'getRakPromptComplianceClosureHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only prompt compliance closure: dokumenty 100 %, mobil a Playwright jako manual gate.' },
    { group: 'diagnostics', alias: 'performanceBudgetAudit', globalName: 'getRakPerformanceBudgetAuditHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only výkonový audit: skripty, CSS, DOM, storage a měřicí doporučení.' },
    { group: 'diagnostics', alias: 'testAutomationCiPlan', globalName: 'getRakTestAutomationCiPlanHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only test/CI plán: blokující kontroly, warningy a minimální GitHub Actions snippet.' },
    { group: 'diagnostics', alias: 'performanceCiClosure', globalName: 'getRakPerformanceCiClosureHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only closure výkonového a CI/test auditního kroku.' },
    { group: 'diagnostics', alias: 'mobilePerformanceSmokePlan', globalName: 'getRakMobilePerformanceSmokePlanHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only mobile/performance smoke plán a runtime snapshot bez tvrzení, že mobilní test proběhl.' },
    { group: 'diagnostics', alias: 'playwrightDomSmokeDraft', globalName: 'getRakPlaywrightDomSmokeDraftHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only návrh prvních Playwright/DOM smoke testů bez zavedení závislosti.' },
    { group: 'diagnostics', alias: 'finalAuditClosure', globalName: 'getRakFinalAuditClosureHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only closure stav velkého due diligence auditu.' },
    { group: 'diagnostics', alias: 'manualValidationReadiness', globalName: 'getRakManualValidationReadinessHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only v928 ruční validační checklist: připraveno, ale testy zůstávají manual.' },
    { group: 'diagnostics', alias: 'validationReadinessClosure', globalName: 'getRakValidationReadinessClosureHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only v928 closure pro mobil/browser/Playwright/post-release validaci.' },
    { group: 'diagnostics', alias: 'gamesAchievementRewards', globalName: 'getRakGamesAchievementRewardHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only v928 kontrola: každá hra má achievementy a D-směnové odměny.' },
    { group: 'diagnostics', alias: 'profileAppearanceRewards', globalName: 'getRakProfileAppearanceRewardHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only v928 kontrola: témata a pozadí jsou odměny uložené na aktivní profil.' },
    { group: 'diagnostics', alias: 'dashboardGlassTheme', globalName: 'getRakDashboardGlassThemeHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only v938 kontrola: Dashboard panely jsou čistší průhledný iOS glass podle tématu, ikonky jsou bez vlastní kapsle a karty jsou cca o 5 % nižší.' },
    { group: 'diagnostics', alias: 'dashboardAnnouncement', globalName: 'getRakDashboardAnnouncementHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'v947 kontrola: Dashboard announcement je lokální nastavení; hlavní online synchronizace appky zůstává samostatně.' },
    { group: 'diagnostics', alias: 'statsMonthlyThemeChart', globalName: 'getRakStatsMonthlyThemeChartHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'v937 kontrola: měsíční graf obsazenosti strojů používá theme-aware barvy bez černé výplně pod/mezi body.' },
    { group: 'diagnostics', alias: 'rotaceNamesDock', globalName: 'getRakRotaceNamesDockHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only v930 kontrola: seznam jmen v Rotaci drží stabilní CSS dock bez opožděného doskoku a s vrácenou velikostí dlaždic.' },
    { group: 'diagnostics', alias: 'frezkyCorrectionSignToggle', globalName: 'getRakFrezkyCorrectionSignToggleHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only v932 kontrola: korekce frézek mají +/− přepínače u Naměřeno, konicity a fhβ.' },
    { group: 'diagnostics', alias: 'rotaceNamesDockUpdate', globalName: 'updateRotaceNamesDockMetrics', type: 'function', phase: 'safe-now', risk: 'low', note: 'v928 bezpečné přeměření pozice docku jmen podle spodní navigace.' },
    { group: 'diagnostics', alias: 'rotaceNamesDockSchedule', globalName: 'scheduleRotaceNamesDockMetrics', type: 'function', phase: 'safe-now', risk: 'low', note: 'v930 read-only kontrola docku bez opožděného přepisu po dosednutí layoutu.' },
    { group: 'diagnostics', alias: 'exportReleaseTooling', globalName: 'getRakExportReleaseToolingHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only audit export/release tooling vrstvy bez spuštění exportu.' },
    { group: 'diagnostics', alias: 'exportSmokeReport', globalName: 'getRakExportSmokeReport', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only poslední smoke/preflight stav exportu ZIPu.' },
    { group: 'diagnostics', alias: 'domActionRegistry', globalName: 'getRakDomActionRegistryHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only mapa data-action prvků a allowlistů bez přepojení navigace/renderu/her.' },
    { group: 'diagnostics', alias: 'domActionSmokeReport', globalName: 'getRakDomActionSmokeReport', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only poslední DOM/action smoke stav bez přepojení handlerů.' },
    { group: 'diagnostics', alias: 'domActionClosure', globalName: 'getRakDomActionRegistryClosureHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Read-only closure stav DOM/action registry fáze bez přepojení handlerů.' },
    { group: 'runtime', alias: 'appVersion', globalName: 'APP_VERSION', type: 'value', phase: 'safe-now', risk: 'low', note: 'Read-only verze aplikace pro nové auditní čtení.' },
    { group: 'runtime', alias: 'rotationBuild', globalName: 'ROTATION_BUILD', type: 'value', phase: 'safe-now', risk: 'low', note: 'Read-only build tag bez zápisu do stavu.' },
    { group: 'runtime', alias: 'externalDependencies', globalName: '__RAK_EXTERNAL_DEP_STATUS__', type: 'value', phase: 'safe-now', risk: 'low', note: 'Read-only stav externích CDN knihoven.' },
    { group: 'runtime', alias: 'appStateSnapshot', globalName: 'app', type: 'snapshot', phase: 'safe-now', risk: 'low', note: 'Bezpečný ořez hlavního app state pro diagnostiku, bez mutace.' },
    { group: 'diagnostics', alias: 'pwaHardening', globalName: 'getPwaHardeningStatus', type: 'function', phase: 'later', risk: 'medium', note: 'PWA stav zatím ponechat jako legacy global kvůli SW vazbám.' },
    { group: 'diagnostics', alias: 'supabaseHardening', globalName: 'getSupabaseHardeningStatus', type: 'function', phase: 'later', risk: 'medium', note: 'Supabase audit zatím ponechat jako legacy global kvůli online flow.' },
    { group: 'diagnostics', alias: 'phaseTenReadiness', globalName: 'getPhaseTenRuntimeReadinessHealth', type: 'function', phase: 'later', risk: 'medium', note: 'Starší readiness helper ponechat kvůli kompatibilitě diagnostiky.' },
    { group: 'app', alias: 'state', globalName: 'app', type: 'object', phase: 'later', risk: 'high', note: 'Hlavní stav nepřepojovat hromadně, jen číst přes getter.' },
    { group: 'app', alias: 'openPage', globalName: 'openPage', type: 'function', phase: 'later', risk: 'high', note: 'Navigace je kritická pro celou app, zatím jen pasivní alias.' },
    { group: 'app', alias: 'renderCurrentPage', globalName: 'renderCurrentPage', type: 'function', phase: 'later', risk: 'high', note: 'Render stránky je kritický, zatím jen pasivní alias.' }
  ];

  function cloneMap() {
    return namespaceMap.map((item) => Object.assign({}, item));
  }

  function resolveGlobal(name) {
    try { return window[String(name || '')]; } catch (err) { return undefined; }
  }

  function callGlobal(name, args) {
    const fn = resolveGlobal(name);
    if (typeof fn !== 'function') return null;
    try { return fn.apply(window, Array.isArray(args) ? args : []); } catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
  }

  function ensureGroup(group) {
    const groupName = String(group || '').trim();
    if (!groupName) return null;
    if (!root[groupName]) root[groupName] = {};
    return root[groupName];
  }

  function bindLazyFunction(group, alias, globalName) {
    const target = ensureGroup(group);
    if (!target) return null;
    target[alias] = function rakNamespaceLazyCall() {
      return callGlobal(globalName, Array.from(arguments));
    };
    return target[alias];
  }

  root.resolve = resolveGlobal;
  root.call = callGlobal;
  root.version = function getRakNamespaceAppVersion() {
    return String(window.APP_VERSION || root.namespaceVersion || 'unknown');
  };
  root.getNamespaceMap = cloneMap;
  root.namespaceMap = cloneMap();
  root.namespaceMapVersion = '1.2 (1.85)';
  root.namespacePlan = {
    phase: 'phase C',
    mode: 'namespace-readonly-phase-closed-with-online-game-contract-alias-v897',
    progressPercent: 100,
    mapClosed: true,
    rule: 'Staré globály zůstávají zdroj pravdy; read-only aliasy mají fallback na legacy globály a nesmí mutovat stav.',
    nextStep: 'Namespace read-only fáze je uzavřená; v928 navazuje na validační readiness aliasy pro ruční mobilní smoke, Playwright běh a post-release PWA kontrolu.'
  };

  ensureGroup('modules');
  ensureGroup('diagnostics');
  ensureGroup('runtime');
  ensureGroup('app');

  namespaceMap.forEach((item) => {
    if (item.type === 'function') bindLazyFunction(item.group, item.alias, item.globalName);
  });

  root.diagnosticReadCount = Number(root.diagnosticReadCount || 0);
  root.diagnostics.read = function readRakDiagnosticViaNamespace(alias, args) {
    const key = String(alias || '').trim();
    if (!key) return null;
    const fn = root.diagnostics && root.diagnostics[key];
    if (typeof fn !== 'function') return null;
    try {
      root.diagnosticReadCount += 1;
      root.lastDiagnosticRead = { alias: key, at: new Date().toISOString() };
      return fn.apply(window, Array.isArray(args) ? args : []);
    } catch (err) {
      return { ok: false, alias: key, error: String(err && err.message ? err.message : err) };
    }
  };
  root.diagnostics.readWithFallback = function readRakDiagnosticWithFallback(alias, fallbackGlobalName, args) {
    const key = String(alias || '').trim();
    let result = null;
    try {
      if (key && typeof root.diagnostics.read === 'function') {
        result = root.diagnostics.read(key, args);
        if (result) return result;
      }
    } catch (err) {
      result = { ok: false, alias: key, error: String(err && err.message ? err.message : err) };
    }
    const fallbackName = String(fallbackGlobalName || '').trim();
    if (!fallbackName) return result || null;
    try {
      const fallback = resolveGlobal(fallbackName);
      if (typeof fallback !== 'function') return result || null;
      root.diagnosticFallbackReadCount = Number(root.diagnosticFallbackReadCount || 0) + 1;
      root.lastDiagnosticFallbackRead = { alias: key || fallbackName, fallbackGlobalName: fallbackName, at: new Date().toISOString() };
      return fallback.apply(window, Array.isArray(args) ? args : []);
    } catch (err) {
      return { ok: false, alias: key || fallbackName, fallbackGlobalName: fallbackName, error: String(err && err.message ? err.message : err) };
    }
  };

  root.diagnostics.list = function listRakDiagnosticsAliases() {
    return namespaceMap
      .filter((item) => item.group === 'diagnostics')
      .map((item) => ({ alias: item.alias, globalName: item.globalName, phase: item.phase, risk: item.risk, note: item.note || '' }));
  };

  root.diagnostics.readMany = function readManyRakDiagnosticsViaNamespace(aliases) {
    const requested = Array.isArray(aliases) && aliases.length
      ? aliases
      : root.diagnostics.list().filter((item) => item.phase === 'safe-now').map((item) => item.alias);
    const out = {};
    requested.forEach((alias) => {
      const key = String(alias || '').trim();
      if (!key) return;
      out[key] = root.diagnostics.read(key);
    });
    return out;
  };

  root.diagnostics.summary = function summarizeRakDiagnosticsViaNamespace() {
    const list = root.diagnostics.list();
    const safeList = list.filter((item) => item.phase === 'safe-now');
    return {
      ok: true,
      mode: 'diagnostics-readonly-phase-closed-summary-v897',
      aliasCount: list.length,
      safeNowCount: safeList.length,
      laterCount: list.filter((item) => item.phase === 'later').length,
      lowRiskCount: list.filter((item) => item.risk === 'low').length,
      mediumRiskCount: list.filter((item) => item.risk === 'medium').length,
      highRiskCount: list.filter((item) => item.risk === 'high').length,
      aliases: list.map((item) => item.alias),
      readWithFallbackEnabled: !!(root.diagnostics && typeof root.diagnostics.readWithFallback === 'function'),
      rule: 'Souhrn jen popisuje dostupné read-only aliasy; žádné aliasy se při summary automaticky nespouští.'
    };
  };

  root.diagnostics.validateReadOnlyMap = function validateRakNamespaceReadOnlyMap() {
    const diagnostics = namespaceMap.filter((item) => item.group === 'diagnostics');
    const runtime = namespaceMap.filter((item) => item.group === 'runtime');
    const safeNow = namespaceMap.filter((item) => item.phase === 'safe-now');
    const mutatingRisk = safeNow.filter((item) => item.group === 'app' || item.risk === 'high');
    const unresolvedSafe = safeNow
      .filter((item) => item.globalName && typeof resolveGlobal(item.globalName) === 'undefined')
      .map((item) => item.alias + '→' + item.globalName);
    const missingReaders = [];
    if (!root.diagnostics || typeof root.diagnostics.read !== 'function') missingReaders.push('diagnostics.read');
    if (!root.diagnostics || typeof root.diagnostics.readMany !== 'function') missingReaders.push('diagnostics.readMany');
    if (!root.diagnostics || typeof root.diagnostics.summary !== 'function') missingReaders.push('diagnostics.summary');
    if (!root.diagnostics || typeof root.diagnostics.readWithFallback !== 'function') missingReaders.push('diagnostics.readWithFallback');
    if (!root.runtime || typeof root.runtime.read !== 'function') missingReaders.push('runtime.read');
    if (!root.runtime || typeof root.runtime.list !== 'function') missingReaders.push('runtime.list');
    const warnings = [];
    if (unresolvedSafe.length) warnings.push('safe-now legacy globals čekají na pozdější moduly: ' + unresolvedSafe.slice(0, 6).join(', '));
    return {
      ok: missingReaders.length === 0 && mutatingRisk.length === 0,
      mode: 'namespace-readonly-phase-closed-v897',
      mapClosed: true,
      namespacePhaseClosed: true,
      phasePercent: 100,
      compatibility: root.compatibility || 'legacy-globals-preserved',
      namespaceMapCount: namespaceMap.length,
      diagnosticAliasCount: diagnostics.length,
      runtimeAliasCount: runtime.length,
      safeNowCount: safeNow.length,
      laterCount: namespaceMap.filter((item) => item.phase === 'later').length,
      mutatingRiskCount: mutatingRisk.length,
      missingReaderCount: missingReaders.length,
      unresolvedSafeCount: unresolvedSafe.length,
      missingReaders,
      warnings,
      rule: 'Mapovací fáze je uzavřená jen pro read-only diagnostiku a runtime snapshoty. Navigace, render, hry a online flow zůstávají mimo namespace přepojení.'
    };
  };
  window.getRakNamespaceReadOnlyMapHealth = root.diagnostics.validateReadOnlyMap;

  function snapshotAppState(source) {
    const state = source && typeof source === 'object' ? source : null;
    if (!state) return null;
    return {
      version: String(state.version || window.APP_VERSION || '').slice(0, 40),
      currentPage: String(state.currentPage || state.page || '').slice(0, 80),
      selectedMonth: state.selectedMonth || null,
      selectedName: state.selectedName || null,
      selectedStatsName: state.selectedStatsName || null,
      selectedStatsMachine: state.selectedStatsMachine || null,
      ladaMode: !!state.ladaMode,
      lowEndDevice: !!state.lowEndDevice,
      gameProfileAccount: String(state.gameProfileAccount || state.selectedGameAccount || '').slice(0, 40),
      hasSupabaseClient: typeof window.supabase !== 'undefined'
    };
  }

  root.runtime.read = function readRakRuntimeAlias(alias) {
    const key = String(alias || '').trim();
    const item = namespaceMap.find((entry) => entry.group === 'runtime' && entry.alias === key);
    if (!item) return null;
    try {
      if (item.type === 'snapshot') return snapshotAppState(resolveGlobal(item.globalName));
      const value = resolveGlobal(item.globalName);
      if (value && typeof value === 'object') return JSON.parse(JSON.stringify(value));
      return value == null ? null : value;
    } catch (err) {
      return { ok: false, alias: key, error: String(err && err.message ? err.message : err) };
    }
  };

  root.runtime.list = function listRakRuntimeAliases() {
    return namespaceMap
      .filter((item) => item.group === 'runtime')
      .map((item) => ({ alias: item.alias, globalName: item.globalName, type: item.type, phase: item.phase, risk: item.risk }));
  };

  root.runtime.version = function readRakRuntimeVersion() { return root.runtime.read('appVersion'); };
  root.runtime.externalDependencies = function readRakExternalDependencies() { return root.runtime.read('externalDependencies'); };
  root.runtime.appStateSnapshot = function readRakAppStateSnapshot() { return root.runtime.read('appStateSnapshot'); };

  root.app.state = function getLegacyAppState() { return resolveGlobal('app') || null; };

  window.RaK = root;

  window.getRakNamespaceHealth = function getRakNamespaceHealth() {
    const checkedAt = new Date().toISOString();
    const issues = [];
    const warnings = [];
    const expectedGroups = Array.from(new Set(namespaceMap.map((item) => item.group))).sort();
    const expectedFunctionAliases = namespaceMap.filter((item) => item.type === 'function');
    const legacyGlobals = Array.from(new Set(namespaceMap.map((item) => item.globalName))).filter(Boolean);

    if (!window.RaK) issues.push('window.RaK missing');
    expectedGroups.forEach((group) => {
      if (!window.RaK || !window.RaK[group]) issues.push('namespace group missing: ' + group);
    });
    expectedFunctionAliases.forEach((item) => {
      if (!window.RaK || !window.RaK[item.group] || typeof window.RaK[item.group][item.alias] !== 'function') issues.push('namespace alias missing: ' + item.group + '.' + item.alias);
    });

    const missingLegacy = legacyGlobals.filter((name) => typeof resolveGlobal(name) === 'undefined');
    if (missingLegacy.length) warnings.push('legacy globals not available yet: ' + missingLegacy.slice(0, 6).join(', '));

    const namespaceVersion = String(window.RaK && window.RaK.namespaceVersion || '');
    if (!/^\d+\.\d+ \(\d+\.\d+\)$/.test(namespaceVersion)) issues.push('namespace version format');
    if (existingVersion && existingVersion !== namespaceVersion) warnings.push('namespace bridge refreshed from ' + existingVersion + ' to ' + namespaceVersion);
    if (!window.RaK || !Array.isArray(window.RaK.namespaceMap) || window.RaK.namespaceMap.length < namespaceMap.length) issues.push('namespace map incomplete');
    if (!window.RaK || typeof window.RaK.getNamespaceMap !== 'function') issues.push('namespace map getter missing');
    if (!window.RaK || !window.RaK.diagnostics || typeof window.RaK.diagnostics.read !== 'function') issues.push('diagnostics reader missing');
    if (!window.RaK || !window.RaK.diagnostics || typeof window.RaK.diagnostics.list !== 'function') warnings.push('diagnostics alias list missing');
    if (!window.RaK || !window.RaK.runtime || typeof window.RaK.runtime.read !== 'function') issues.push('runtime reader missing');
    if (!window.RaK || !window.RaK.runtime || typeof window.RaK.runtime.list !== 'function') warnings.push('runtime alias list missing');

    const safeNowCount = namespaceMap.filter((item) => item.phase === 'safe-now').length;
    const laterCount = namespaceMap.filter((item) => item.phase === 'later').length;
    const highRiskCount = namespaceMap.filter((item) => item.risk === 'high').length;

    return {
      ok: issues.length === 0,
      mode: 'passive-namespace-readonly-phase-closed-export-release-v897',
      checkedAt,
      version: String(window.APP_VERSION || 'unknown'),
      namespaceVersion,
      compatibility: window.RaK && window.RaK.compatibility || '',
      issueCount: issues.length,
      warningCount: warnings.length,
      issues: issues.slice(0, 12),
      warnings: warnings.slice(0, 12),
      groupCount: expectedGroups.length,
      groups: expectedGroups,
      diagnosticAliasCount: expectedFunctionAliases.filter((item) => item.group === 'diagnostics').length,
      namespaceMapCount: namespaceMap.length,
      safeNowCount,
      laterCount,
      highRiskCount,
      missingLegacyCount: missingLegacy.length,
      missingLegacy: missingLegacy.slice(0, 12),
      legacyGlobalsPreserved: missingLegacy.length === 0,
      passiveBridgeOnly: true,
      migratedRuntimeCount: 0,
      refactorProgressPercent: 100,
      diagnosticsReadOnlyEnabled: !!(window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.read === 'function'),
      runtimeReadOnlyEnabled: !!(window.RaK && window.RaK.runtime && typeof window.RaK.runtime.read === 'function'),
      runtimeAliasCount: namespaceMap.filter((item) => item.group === 'runtime').length,
      diagnosticsReadManyEnabled: !!(window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.readMany === 'function'),
      diagnosticsReadWithFallbackEnabled: !!(window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.readWithFallback === 'function'),
      diagnosticsSummaryEnabled: !!(window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.summary === 'function'),
      diagnosticSafeNowCount: namespaceMap.filter((item) => item.group === 'diagnostics' && item.phase === 'safe-now').length,
      diagnosticLaterCount: namespaceMap.filter((item) => item.group === 'diagnostics' && item.phase === 'later').length,
      diagnosticReadCount: Number(window.RaK && window.RaK.diagnosticReadCount || 0),
      diagnosticFallbackReadCount: Number(window.RaK && window.RaK.diagnosticFallbackReadCount || 0),
      lastDiagnosticRead: window.RaK && window.RaK.lastDiagnosticRead || null,
      lastDiagnosticFallbackRead: window.RaK && window.RaK.lastDiagnosticFallbackRead || null,
      mapClosureOk: !!(window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.validateReadOnlyMap === 'function' && window.RaK.diagnostics.validateReadOnlyMap().ok),
      namespaceMapClosed: true,
      namespacePhaseClosed: true,
      phasePercent: 100,
      nextRefactorRule: 'Namespace read-only fáze je uzavřená. Další fáze smí řešit jen pasivní DOM/security hardening plán; navigaci/render/hry pořád nepřepojovat.',
      namespaceMap: cloneMap().slice(0, 24),
      hasResolver: !!(window.RaK && typeof window.RaK.resolve === 'function'),
      hasCaller: !!(window.RaK && typeof window.RaK.call === 'function'),
      hasMapGetter: !!(window.RaK && typeof window.RaK.getNamespaceMap === 'function')
    };
  };

  window.getRakNamespacePhaseClosureHealth = function getRakNamespacePhaseClosureHealth() {
    const mapHealth = (root.diagnostics && typeof root.diagnostics.validateReadOnlyMap === 'function') ? root.diagnostics.validateReadOnlyMap() : null;
    const health = (typeof window.getRakNamespaceHealth === 'function') ? window.getRakNamespaceHealth() : null;
    return {
      ok: !!(mapHealth && mapHealth.ok && health && health.ok),
      mode: 'namespace-readonly-phase-closure-v897',
      phasePercent: 100,
      namespacePhaseClosed: true,
      legacyGlobalsPreserved: !!(health && health.legacyGlobalsPreserved),
      readWithFallbackEnabled: !!(root.diagnostics && typeof root.diagnostics.readWithFallback === 'function'),
      mapClosureOk: !!(mapHealth && mapHealth.ok),
      issueCount: health ? Number(health.issueCount || 0) : 1,
      warningCount: (health ? Number(health.warningCount || 0) : 0) + (mapHealth && Array.isArray(mapHealth.warnings) ? mapHealth.warnings.length : 0),
      nextSafePhase: 'phase D: export/release tooling smoke report bez zásahu do navigace, renderu, her a online flow'
    };
  };

  try {
    const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-namespace.js', 'loaded', { source: 'index', durationMs: Math.max(0, Math.round(ended - started)), mapCount: namespaceMap.length });
    }
  } catch (err) {}
})();
