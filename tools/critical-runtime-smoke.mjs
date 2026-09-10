#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const appJs = read('app.js');
const qrJs = read('qr.js');
const statsJs = read('stats.js');
const dashboardJs = read('dashboard.js');
const swJs = read('sw.js');
const indexHtml = read('index.html');
const stylesOverridesLegacyEarlyCss = read('styles-overrides-legacy-early.css');
const stylesOverridesLegacyMidCss = read('styles-overrides-legacy-mid.css');
const stylesOverridesLegacyLateCss = read('styles-overrides-legacy-late.css');
const stylesViewportPolishCss = read('styles-viewport-polish.css');
const stylesReleasePolishCss = read('styles-release-polish.css');
const stylesThemePolishCss = read('styles-theme-polish.css');
const stylesThemePropagationCss = read('styles-theme-propagation.css');
const stylesRotationTasksCss = read('styles-rotation-tasks.css');
const stylesMenuPolishCss = read('styles-menu-polish.css');
const stylesAdminPolishCss = read('styles-admin-polish.css');
const stylesStatsPolishCss = read('styles-stats-polish.css');

const dashboardFitCss = read('styles-dashboard-fit.css');
const dashboardPolishCss = read('styles-dashboard-polish.css');
const dashboardLegacyCleanupTargetsV158 = [
  '#home .dashboardGrid', '#home .dashboardCard', '#home .dashboardHeroCard',
  '#dashHero .dashboardHeroLine2', '#dashHero .dashboardHeroLine3', '#dashHero .dashboardHeroLine3Pill',
  '#home .dashboardIconInline', '#home .dashboardIcon.dashboardIconInline', '#home .dashboardDot',
  '#dashKantyna .dashboardDot', '#dashJidelna .dashboardDot'
];
const dashboardActiveOwnersV158 = [
  '#home.page.active .dashboardGrid', '#home.page.active .dashboardCard', '#home.page.active #dashHero.dashboardHeroCard',
  '#home.page.active #dashHero .dashboardHeroLine2', '#home.page.active #dashHero .dashboardHeroLine3',
  '#home.page.active #dashHero .dashboardHeroLine3Pill', '#home.page.active .dashboardCard .dashboardIcon.dashboardIconInline',
  '#home.page.active #dashKantyna .dashboardDot', '#home.page.active #dashJidelna .dashboardDot'
];
function criticalCssSelectorSet(source) {
  const clean = String(source || '').replace(/\/\*[\s\S]*?\*\//g, '');
  const set = new Set();
  for (const match of clean.matchAll(/([^{}]+)\{/g)) {
    const head = String(match[1] || '').trim();
    if (!head || head.startsWith('@')) continue;
    for (const selector of head.split(',')) set.add(selector.replace(/\s+/g, ' ').trim());
  }
  return set;
}
const legacyDashboardSelectorSetV158 = criticalCssSelectorSet(stylesOverridesLegacyEarlyCss + '\n' + stylesOverridesLegacyMidCss + '\n' + stylesOverridesLegacyLateCss);
for (const selector of dashboardLegacyCleanupTargetsV158) {
  assert(!legacyDashboardSelectorSetV158.has(selector), 'Odstraněný Dashboard legacy selector se vrátil: ' + selector);
}
const activeDashboardCssV158 = dashboardFitCss + '\n' + dashboardPolishCss;
for (const selector of dashboardActiveOwnersV158) {
  assert(activeDashboardCssV158.includes(selector), 'Chybí aktivní Dashboard owner po legacy cleanupu: ' + selector);
}
assert(stylesOverridesLegacyEarlyCss.includes('Dashboard legacy cleanup'), 'Chybí v1.5.58 Dashboard legacy cleanup marker');
const legacyNavLayoutCssV159 = (stylesOverridesLegacyEarlyCss + '\n' + stylesOverridesLegacyMidCss + '\n' + stylesOverridesLegacyLateCss)
  .replace(/\/\*[\s\S]*?\*\//g, '');
assert(stylesOverridesLegacyEarlyCss.includes('RaK v1.5.59 – proven nav/layout legacy dedupe'), 'Chybí v1.5.59 nav/layout cleanup marker');
assert(!legacyNavLayoutCssV159.includes('.bottomNavGamesBtn'), 'Mrtvý bottomNavGamesBtn se nesmí vrátit');
assert(!legacyNavLayoutCssV159.includes('[data-page="games"]'), 'Mrtvý Games nav selector se nesmí vrátit');
assert(stylesViewportPolishCss.includes('html body nav.bottomNav'), 'Viewport polish musí dál vlastnit iOS pozici spodní lišty');
assert(stylesReleasePolishCss.includes('html body nav.bottomNav'), 'Release polish musí dál vlastnit finální bottom-nav pozici');
assert(stylesReleasePolishCss.includes('.page.active'), 'Release polish musí dál držet finální page shell');
const legacyMenuAdminCssV160 = stylesOverridesLegacyEarlyCss + '\n' + stylesOverridesLegacyMidCss + '\n' + stylesOverridesLegacyLateCss;
assert(stylesOverridesLegacyEarlyCss.includes('RaK v1.5.60 – proven menu/admin legacy dedupe'), 'Chybí v1.5.60 menu/admin cleanup marker');
assert(stylesMenuPolishCss.includes('#menu .adminUsageCard'), 'Menu polish musí dál vlastnit admin usage karty');
assert(stylesMenuPolishCss.includes('#appMenuBody .rakDevicePerfCard'), 'Menu polish musí dál vlastnit nastavení výkonu');
assert(stylesAdminPolishCss.includes('#appMenuBody[data-admin-view="rotation"] #adminRotationEditor .appMenuAdminRotationTable'), 'Admin polish musí dál vlastnit tabulku Rozpisů');
assert(stylesAdminPolishCss.includes('.adminRotationQuickRemove'), 'Admin polish musí dál vlastnit rychlé Odebrat');
assert(legacyMenuAdminCssV160.length > 100000, 'v1.5.60 nesmí omylem vyprázdnit legacy CSS');
const legacyCalcStatsCssV161 = stylesOverridesLegacyEarlyCss + '\n' + stylesOverridesLegacyMidCss + '\n' + stylesOverridesLegacyLateCss;
assert(stylesOverridesLegacyEarlyCss.includes('RaK v1.5.61 – proven calculator/statistics legacy dedupe'), 'Chybí v1.5.61 kalkulačky/statistiky cleanup marker');
assert(stylesStatsPolishCss.includes('.statsYearOverviewCard'), 'Stats polish musí dál vlastnit roční přehled statistik');
assert(stylesStatsPolishCss.includes('.statsOccupancyLineChart'), 'Stats polish musí dál vlastnit graf obsazenosti');
assert(stylesThemePropagationCss.includes('.calcTile'), 'Theme propagation musí dál vlastnit barevnou propagaci kalkulaček');
assert(stylesThemePropagationCss.includes('.calcResultMain'), 'Theme propagation musí dál vlastnit text výsledků kalkulaček');
assert(legacyCalcStatsCssV161.length > 100000, 'v1.5.61 nesmí omylem vyprázdnit legacy CSS');
const legacyRotationCssV162 = stylesOverridesLegacyEarlyCss + '\n' + stylesOverridesLegacyMidCss + '\n' + stylesOverridesLegacyLateCss;
assert(stylesOverridesLegacyEarlyCss.includes('RaK v1.5.62 – proven Rotace legacy dedupe + inventory'), 'Chybí v1.5.62 Rotace cleanup marker');
assert(stylesViewportPolishCss.includes('#rotace.page.active #rotaceNamesPanel.active'), 'Viewport polish musí dál vlastnit Rotace content reserve');
assert(stylesReleasePolishCss.includes('#rotace.page.active #rotaceNamesPanel.active #namesGrid'), 'Release polish musí dál vlastnit Rotace names dock');
assert(stylesRotationTasksCss.includes('.rotaceShiftTaskCard'), 'Rotation task stylesheet musí dál vlastnit denní úkoly Rotace');
assert(legacyRotationCssV162.length > 100000, 'v1.5.62 nesmí omylem vyprázdnit legacy CSS');

assert(stylesOverridesLegacyEarlyCss.includes('RaK v1.5.63 – proven theme/background legacy dedupe'), 'Chybí v1.5.63 theme cleanup marker');
assert(stylesThemePolishCss.includes('--rakThemeAccentStrong'), 'Theme polish musí dál vlastnit theme proměnné');
assert(stylesThemePolishCss.includes('background:var(--rakAppBackground'), 'Theme polish musí dál vlastnit app background');
assert(stylesThemePropagationCss.length > 500, 'Theme propagation owner nesmí zmizet');

const activePolishCssFiles = ['styles-dashboard-fit.css','styles-admin-polish.css','styles-menu-polish.css','styles-stats-polish.css','styles-viewport-polish.css','styles-theme-polish.css','styles-release-polish.css','styles-dashboard-polish.css','styles-theme-propagation.css','styles-rotation-tasks.css'];
for (const cssFile of activePolishCssFiles) {
  const css = read(cssFile).replace(/\/\*[\s\S]*?\*\//g, '');
  assert(!/#games|\.games/i.test(css), `Dead Games selector returned to ${cssFile}`);
}
const bootSelfTest = read('app-boot-selftest.js');
const adminRotationJs = read('admin-rotation.js');
const adminRotationOvertimeJs = read('admin-rotation-overtime.js');
const adminRotationGeneratorJs = read('admin-rotation-generator.js');
const adminRotationGeneratorWizardJs = read('admin-rotation-generator-wizard.js');
const adminRotationEditorJs = read('admin-rotation-editor.js');
const adminMachineSettingsJs = read('admin-machine-settings.js');
const appMenuJs = read('app-menu.js');
const appMenuAdminExportJs = read('app-menu-admin-export.js');
const appMenuAdminStorageJs = read('app-menu-admin-storage.js');
const appMenuAdminServiceJs = read('app-menu-admin-service.js');
const appMenuAdminRendererJs = read('app-menu-admin-renderer.js');
const appMenuPagesJs = read('app-menu-pages.js');
const appMenuBugReportJs = read('app-menu-bug-report.js');
const appMenuProfileJs = read('app-menu-profile.js');
const appMenuShiftReportJs = read('app-menu-shift-report.js');
const appPwaConnectivity = read('app-pwa-connectivity.js');
const shiftReport = read('rak-shift-report.js');
const shiftReportShare = read('rak-shift-report-share.js');
const lazyExternalLibs = read('rak-lazy-external-libs.js');
const deferHeavyLibs = read('tools/defer-heavy-libs.mjs');
const packageJson = JSON.parse(read('package.json'));

function assert(condition, message) {
  if (!condition) throw new Error('[critical-runtime-smoke] ' + message);
}

function loaderGroup(name) {
  const match = appJs.match(new RegExp('const\\s+' + name + '\\s*=\\s*\\[(.*?)\\];', 's'));
  assert(match, 'Chybí loader skupina ' + name);
  return Array.from(match[1].matchAll(/"([^"]+\.js)"/g)).map((item) => item[1]);
}

const deferred = loaderGroup('deferredFiles');
const idleAudits = loaderGroup('idleAuditFiles');
const mustStayBootLoaded = [
  'qr.js',
  'stats.js',
  'dashboard.js',
  'rotace.js',
  'app-navigation.js',
  'app-bottom-nav.js',
  'app-menu.js',
  'app-actions.js',
  'supabase-bridge.js',
  'app-rotation-sync.js'
];

for (const file of mustStayBootLoaded) {
  assert(deferred.includes(file), file + ' nesmí být přesunut mimo ověřený boot bez samostatného mobilního testu');
}

assert(!deferred.includes('qr-runtime.generated.js'), 'Generated QR runtime se nesmí vrátit do bootu bez ověřeného statického nasazení');
assert(!deferred.includes('app-health-audits.js'), 'Health audity nemají blokovat první interaktivní boot');
assert(!deferred.includes('app-postload-audits.js'), 'Post-load audity nemají blokovat první interaktivní boot');
assert(idleAudits.includes('app-health-audits.js'), 'Health audity musí zůstat dostupné v idle fázi');
assert(idleAudits.includes('app-postload-audits.js'), 'Post-load audit orchestrátor musí zůstat dostupný v idle fázi');
const idleReleaseDiagnostics = [
  'rak-storage-sync-audit.js',
  'rak-boot-sequence-audit.js',
  'rak-dom-action-audit.js',
  'rak-supabase-client-audit.js',
  'rak-appsec-privacy-audit.js',
  'rak-release-gates.js',
  'rak-export-release-audit.js',
  'rak-release-ops-audit.js',
  'rak-due-diligence-progress.js',
  'rak-performance-ci-audit.js',
  'rak-mobile-smoke-audit.js'
];
for (const file of idleReleaseDiagnostics) {
  assert(idleAudits.includes(file), file + ' má být dostupný až v idle diagnostické fázi');
  assert(deferHeavyLibs.includes(file), 'Build transform neodkládá startup diagnostiku ' + file);
}
assert(appJs.includes('requestIdleCallback(runIdleAudits'), 'Idle audity musí být plánované až po bootu');
assert(!appJs.includes('runRakPostLoadAudits()'), 'Legacy post-load audit se po odstranění Her nesmí automaticky spouštět');
assert(appJs.includes('await Promise.all(deferredFiles.map(loadScript))'), 'Boot musí před navázáním UI počkat na deferred moduly');
assert(appJs.includes('installBottomNavBindings'), 'Chybí navázání spodní navigace');
assert(appJs.includes('applyBottomNavMoreHardFix'), 'Chybí hard-fix tlačítka Více');
assert(appJs.includes('installDelegatedAppActions'), 'Chybí delegované akce aplikace');
assert(!deferred.includes('rak-menu-report-order-v1513.js'), 'Legacy CSS stabilizátor pořadí reportů se po mobilním ověření nové kotvy nesmí vrátit do bootu');
assert(!deferred.includes('rak-dev-fixes-v1512.js'), 'Historický rak-dev-fixes-v1512.js se po nativním převzetí reportu a kalendáře nesmí vrátit do runtime bootu');
assert(!fs.existsSync(path.join(root, 'rak-dev-fixes-v1512.js')), 'Historický rak-dev-fixes-v1512.js se po mobilním ověření odpojeného runtime nesmí vrátit do zdrojů');
assert(!fs.existsSync(path.join(root, 'rak-menu-report-order-v1513.js')), 'Legacy CSS stabilizátor pořadí reportů se nesmí vrátit do zdrojů');
assert(!deferred.includes('rak-shift-report-entry-fix.js'), 'Legacy vstup Reportu směny se po nativním převzetí nesmí vrátit do runtime');
assert(!fs.existsSync(path.join(root, 'rak-shift-report-entry-fix.js')), 'Legacy vstup Reportu směny se po nativním převzetí nesmí vrátit do zdrojů');
assert(appMenuJs.includes('data-rak-shift-report-entry=\"1\"'), 'Více musí nativně renderovat Report směny');
assert(!deferred.includes('rak-dashboard-shift-label-v1515.js'), 'Dashboard patch se po nativním převzetí nesmí vrátit do runtime bootu');
assert(!fs.existsSync(path.join(root, 'rak-dashboard-shift-label-v1515.js')), 'Dashboard patch se po mobilním ověření nesmí vrátit do zdrojů');
assert(!deferred.includes('rak-profile-settings-fix.js'), 'Profil settings fix se po nativním převzetí nesmí vrátit do runtime');
assert(!deferred.includes('rak-admin-menu-fix.js'), 'Admin menu fix se po nativním převzetí nesmí vrátit do runtime');
assert(!fs.existsSync(path.join(root, 'rak-profile-settings-fix.js')), 'Profil settings fix se po nativním převzetí nesmí vrátit do zdrojů');
assert(!fs.existsSync(path.join(root, 'rak-admin-menu-fix.js')), 'Admin menu fix se po nativním převzetí nesmí vrátit do zdrojů');
assert(deferred.includes('app-menu-profile.js'), 'Profilový menu modul musí zůstat součástí ověřeného bootu');
assert(deferred.includes('app-menu-shift-report.js'), 'Reportový menu modul musí zůstat součástí ověřeného bootu');
assert(appMenuProfileJs.includes('function buildGamesProfileSettingsHtml()'), 'Profilová karta musí být v app-menu-profile.js');
assert(appMenuProfileJs.includes('appMenuHandleProfileSettingsAction'), 'Odhlášení profilu musí být v app-menu-profile.js');
assert(!appMenuJs.includes('function buildGamesProfileSettingsHtml()'), 'Profilová logika se nesmí vrátit do app-menu.js shellu');
assert(appMenuShiftReportJs.includes('function appMenuOpenShiftReport()'), 'Otevření Reportu směny musí být v app-menu-shift-report.js');
assert(appMenuShiftReportJs.includes('appMenuHandleShiftReportEntry'), 'Klik handler Reportu směny musí být v app-menu-shift-report.js');
assert(!appMenuJs.includes('function appMenuOpenShiftReport()'), 'Reportový handler se nesmí vrátit do app-menu.js shellu');
assert(appMenuJs.includes('function rakAdminMenuResolveActiveAccountId()'), 'Nativní resolver admin účtu musí být přímo v app-menu.js');
assert(appMenuJs.includes('const activeId = rakAdminMenuResolveActiveAccountId();'), 'Admin menu musí používat nativní resolver aktivního účtu');
assert(dashboardJs.includes('function formatDashboardPersonalShiftLabel(value)'), 'Dashboard musí mít nativní formatter plného názvu směny');
assert(dashboardJs.includes("if (/^R8?$/i.test(shift)) return 'Ranní';"), 'Dashboard musí nativně převádět R/R8 na Ranní');
assert(dashboardJs.includes("if (/^N8?$/i.test(shift)) return 'Noční';"), 'Dashboard musí nativně převádět N/N8 na Noční');
assert(dashboardJs.includes('const shift = formatDashboardPersonalShiftLabel(rawShift);'), 'Personifikovaná Dashboard karta musí používat nativní plný název směny');
assert(deferred.includes('admin-rotation-overtime.js'), 'Přesčasy rozpisu musí zůstat součástí ověřeného bootu');
assert(deferred.includes('admin-rotation-generator.js'), 'Generátor rozpisu musí zůstat součástí ověřeného bootu');
assert(deferred.includes('admin-rotation-generator-wizard.js'), 'Průvodce generátoru musí zůstat součástí ověřeného bootu');
assert(adminRotationGeneratorJs.includes('function adminBuildRotationGenerationModel'), 'Generator engine musí držet historický model');
assert(adminRotationGeneratorJs.includes('function adminRotationGeneratorRepairEmptyHardCells'), 'Generator engine musí držet opravnou logiku');
assert(adminRotationGeneratorJs.includes('function adminRotationNormalizeGeneratorSettings'), 'Generator engine musí držet normalizaci pravidel');
assert(adminRotationGeneratorWizardJs.includes('function adminRotationGeneratorRenderWizard'), 'Wizard modul musí vlastnit průvodce generátoru');
assert(adminRotationGeneratorWizardJs.includes('async function adminRotationGeneratorLoadCalendarAbsences'), 'Wizard modul musí vlastnit načtení absencí z kalendáře');
assert(adminRotationGeneratorWizardJs.includes('function adminRotationGeneratorDownloadExcel'), 'Wizard modul musí vlastnit export návrhu do Excelu');
assert(adminRotationGeneratorWizardJs.includes('function adminRotationGetAllowedGeneratorMonthKeys'), 'Wizard modul musí vlastnit výběr měsíců pro průvodce');
assert(!adminRotationGeneratorJs.includes('function adminRotationGeneratorRenderWizard'), 'Wizard UI se nesmí vrátit do generator engine');
assert(!adminRotationGeneratorJs.includes('ADMIN_ROTATION_GENERATOR_ABSENCE_ICS_URL'), 'Kalendářový endpoint se nesmí vrátit do generator engine');
assert(!adminRotationGeneratorWizardJs.includes('function adminRotationNormalizeGeneratorSettings'), 'Normalizace pravidel se nesmí přesunout do wizardu');
assert(adminRotationOvertimeJs.includes('function buildAdminRotationOvertimeSettingsHtml()'), 'Přesčasový renderer musí vlastnit admin-rotation-overtime.js');
assert(adminRotationOvertimeJs.includes('function adminRotationOvertimeGetShiftInfoForIsoDate'), 'Výpočet směny přesčasu musí vlastnit admin-rotation-overtime.js');
assert(adminRotationGeneratorJs.includes('function buildAdminRotationGeneratorSettingsHtml()'), 'Nastavení generátoru musí vlastnit admin-rotation-generator.js');
assert(adminRotationGeneratorJs.includes('function adminBuildRotationGenerationModel'), 'Historický model generátoru musí vlastnit admin-rotation-generator.js');
assert(!adminRotationGeneratorJs.includes('function adminRotationGeneratorRenderWizard'), 'Průvodce generátoru už nesmí zůstat v generator engine');
assert(!adminRotationJs.includes('function buildAdminRotationOvertimeSettingsHtml()'), 'Přesčasy se nesmí vrátit do admin-rotation.js');
assert(!adminRotationJs.includes('function buildAdminRotationGeneratorSettingsHtml()'), 'Generátor se nesmí vrátit do admin-rotation.js');

assert(deferred.includes('admin-rotation-editor.js'), 'Editor rozpisu musí zůstat součástí ověřeného bootu');
assert(deferred.includes('admin-rotation-overtime.js'), 'Přesčasy musí zůstat součástí ověřeného bootu');
assert(deferred.includes('admin-rotation-generator.js'), 'Generátor rozpisu musí zůstat součástí ověřeného bootu');
assert(deferred.includes('admin-machine-settings.js'), 'Nastavení strojů musí zůstat součástí ověřeného bootu');
assert(adminRotationEditorJs.includes('function buildAdminRotationTableHtml'), 'Editor tabulky rozpisu musí vlastnit admin-rotation-editor.js');
assert(adminRotationEditorJs.includes('function adminBindRotationZoomGuard'), 'Mobilní guard editoru musí vlastnit admin-rotation-editor.js');
assert(adminMachineSettingsJs.includes('function buildAdminMachineSettingsTableHtml'), 'Nastavení strojů musí vlastnit admin-machine-settings.js');
assert(adminRotationGeneratorJs.includes('function adminRotationNormalizeGeneratorSettings'), 'Generator settings musí být sjednocené v admin-rotation-generator.js');
assert(adminRotationOvertimeJs.includes('function adminRotationRefreshOvertimeYearSummaries'), 'Overtime refresh musí být sjednocený v admin-rotation-overtime.js');
assert(!adminRotationJs.includes('function buildAdminRotationTableHtml'), 'Editor se nesmí vrátit do admin-rotation.js core');
assert(!adminRotationJs.includes('function buildAdminMachineSettingsTableHtml'), 'Nastavení strojů se nesmí vrátit do admin-rotation.js core');
assert(!adminRotationJs.includes('function adminRotationNormalizeGeneratorSettings'), 'Generator settings se nesmí vrátit do admin-rotation.js core');
assert(adminRotationJs.includes('function getAdminRotationMonthKeys'), 'admin-rotation.js core musí držet společný výběr měsíců');

assert(deferred.includes('app-menu-admin-export.js'), 'Admin export modul musí zůstat součástí ověřeného bootu');
assert(deferred.includes('app-menu-admin-storage.js'), 'Admin storage/backup modul musí zůstat součástí ověřeného bootu');
assert(deferred.includes('app-menu-admin-service.js'), 'Admin service/handover modul musí zůstat součástí ověřeného bootu');
assert(deferred.includes('app-menu-admin-renderer.js'), 'Admin renderer modul musí zůstat součástí ověřeného bootu');
assert(!deferred.includes('app-menu-admin-core.js'), 'Rozdělený admin core se nesmí vrátit do runtime bootu');
assert(!fs.existsSync(path.join(root, 'app-menu-admin-core.js')), 'Rozdělený app-menu-admin-core.js se nesmí vrátit do zdrojů');
assert(appMenuAdminExportJs.includes('function buildRakRotationExcelExportMonthOptions'), 'Excel export helper musí vlastnit app-menu-admin-export.js');
assert(appMenuAdminStorageJs.includes('function ensureFullSettingsBackupFileInput'), 'Zálohy nastavení musí vlastnit app-menu-admin-storage.js');
assert(appMenuAdminStorageJs.includes('async function restoreAdminFullSettingsBackupOnline'), 'Obnova úplné zálohy musí vlastnit app-menu-admin-storage.js');
assert(appMenuAdminServiceJs.includes('function buildAdminHandoverReadinessHtml'), 'Servis/handover helpery musí vlastnit app-menu-admin-service.js');
assert(appMenuAdminServiceJs.includes('function buildAdminSettingsMapHtml'), 'Mapa administrace musí vlastnit service modul');
assert(appMenuAdminRendererJs.includes('function renderAdminMenuBody(body, section)'), 'Admin renderer musí vlastnit app-menu-admin-renderer.js');
assert(!appMenuAdminRendererJs.includes('function ensureFullSettingsBackupFileInput'), 'Admin renderer nesmí obsahovat backup implementaci');
assert(!appMenuAdminRendererJs.includes('function buildAdminHandoverReadinessHtml'), 'Admin renderer nesmí obsahovat handover implementaci');
assert(!appMenuJs.includes('function renderAdminMenuBody(body, section)'), 'Admin renderer se nesmí vrátit do app-menu.js shellu');
assert(!appMenuJs.includes('function ensureFullSettingsBackupFileInput'), 'Backup implementace se nesmí vrátit do app-menu.js shellu');
assert(deferred.includes('app-menu-pages.js'), 'Běžné menu stránky musí zůstat součástí ověřeného bootu');
assert(deferred.includes('app-menu-bug-report.js'), 'Bug-report menu modul musí zůstat součástí ověřeného bootu');
assert(appMenuPagesJs.includes('function renderAppMenuAboutPage'), 'O aplikaci musí vlastnit app-menu-pages.js');
assert(appMenuPagesJs.includes('function renderAppMenuContactPage'), 'Kontakt musí vlastnit app-menu-pages.js');
assert(appMenuPagesJs.includes('function renderAppMenuSettingsPage'), 'Nastavení musí vlastnit app-menu-pages.js');
assert(appMenuPagesJs.includes('Testovací build: '), 'O aplikaci musí dál zobrazovat testovací build');
assert(!appMenuJs.includes('const devBuildLine'), 'O aplikaci se nesmí vrátit do app-menu.js shellu');
assert(!appMenuJs.includes('const privacyCard'), 'Běžné Nastavení se nesmí vrátit do app-menu.js shellu');
assert(appMenuBugReportJs.includes('function formatBugReportMessage'), 'Bug report formatter musí vlastnit app-menu-bug-report.js');
assert(appMenuBugReportJs.includes('async function handleBugReportAction'), 'Bug report odeslání musí vlastnit app-menu-bug-report.js');
assert(!appMenuJs.includes('function formatBugReportMessage'), 'Bug-report implementace se nesmí vrátit do app-menu.js shellu');
assert(shiftReport.includes("const DRAFT_RETENTION_TEAM = 'D';"), 'Retention Reportu směny musí zůstat navázaná na směnu D');
assert(shiftReport.includes('function nextShiftReportTeamStartAfter(anchor)'), 'Retention Reportu směny musí vlastnit hlavní report modul');
assert(!shiftReport.includes('new MutationObserver'), 'Report směny už nesmí používat DOM observer pro vkládání menu vstupu');
assert(appPwaConnectivity.includes('function installRakPortraitOnlyPwaMode()'), 'Portrait PWA guard musí vlastnit app-pwa-connectivity.js');
assert(appPwaConnectivity.includes("const key = 'rak_dev_entry_prompt_reset_build';"), 'Reset starého DEV update promptu musí vlastnit PWA modul');
assert(shiftReport.includes("const INDEX_ORDER = { AG: 0, AE: 0, AF: 1, AD: 1, AH: 2 };"), 'Hlavní report modul musí držet ověřené pořadí indexů');
assert(shiftReport.includes("const REPORT_SEPARATOR = '__________';"), 'Hlavní report modul musí držet oddělovače provozních bloků');
assert(shiftReport.includes("return sortReportRowsByIndexColor(formatShiftReportText(lines.join('\\n').trim()));"), 'Finální text reportu se musí formátovat a řadit už v hlavním modulu');
assert(shiftReportShare.includes("const href = 'whatsapp://send?text='"), 'WhatsApp reportu musí používat ověřené přímé předání bez nového prázdného okna');
assert(!shiftReportShare.includes("window.open('https://wa.me/?text='"), 'WhatsApp reportu se nesmí vrátit k window.open(wa.me) kvůli bílé stránce po návratu');
assert(statsJs.includes("let teams = ['A', 'B', 'C', 'D'];"), 'Nativní první ranní směna musí počítat všechny směnové týmy');
assert(statsJs.includes("Array.isArray(window.SHIFT_CYCLE_ORDER)"), 'Nativní první ranní směna musí respektovat SHIFT_CYCLE_ORDER');
assert(statsJs.includes("window.getTeamShiftState(probe, team)"), 'Nativní první ranní směna musí používat směnový engine pro všechny týmy');
assert(!statsJs.includes('const candidates = rows'), 'Stats.js se nesmí vrátit k odvození první ranní jen z importovaných řádků');

// Hry už nejsou součástí zdrojového HTML ani runtime bootu.
assert(!appJs.includes('__rakDevGamesObserver'), 'Hry znovu používají globální MutationObserver');
assert(!appJs.includes('disableGamesSurface'), 'V app.js zůstal starý Games boot fallback');
assert(!appJs.includes('rak-dev-no-games-critical'), 'V app.js zůstalo kritické CSS pro skryté Hry');
assert(!appJs.includes('bottomNavGamesBtn'), 'V app.js zůstal runtime cleanup tlačítka Her');
assert(!bootSelfTest.includes('DOM #games'), 'Boot self-test pořád vyžaduje odstraněný DOM Her');
assert(!indexHtml.includes('<div id="games"'), 'Zdrojový index.html pořád obsahuje stránku Her');
assert(!indexHtml.includes('data-action="games"'), 'Zdrojový index.html pořád obsahuje vstup do Her');
assert(!indexHtml.includes('data-page="games"'), 'Zdrojový index.html pořád obsahuje navigaci na Hry');
assert(!indexHtml.includes('styles-games.css'), 'Zdrojový index.html pořád načítá herní CSS');
assert(!indexHtml.includes('assets/rak-memory-total-time-fix.js'), 'Zdrojový index.html pořád obsahuje odstraněný Memory/Pexeso guard');
assert(!String(packageJson.scripts && packageJson.scripts['vercel-build'] || '').includes('strip-games-html'), 'Build pořád závisí na dočasném Games HTML stripperu');

const removedGameFiles = [
  'games-engine.js',
  'games-profile.js',
  'games-gomoku.js',
  'games-classic.js',
  'games-arcade.js',
  'styles-games.css',
  'gomoku-ai-smoke-v966.js',
  'assets/nav-icons/games-gray.png',
  'assets/nav-icons/games-green.png',
  'tools/strip-games-html.mjs'
];
for (const file of removedGameFiles) {
  assert(!fs.existsSync(path.join(root, file)), 'Po odstranění Her zůstal soubor ' + file);
}

// XLSX a JSZip jsou těžké pomocné knihovny. Nesmí blokovat start aplikace,
// ale Supabase zůstává záměrně v ověřeném eager režimu.
const vercelBuild = String(packageJson.scripts && packageJson.scripts['vercel-build'] || '');
const xlsxUrl = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
const jszipUrl = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
assert(deferred.includes('rak-lazy-external-libs.js'), 'Lazy loader XLSX/JSZip není součástí ověřeného runtime');
assert(vercelBuild.includes('tools/defer-heavy-libs.mjs'), 'Vercel build neodkládá XLSX/JSZip mimo startovní HTML');
assert(deferHeavyLibs.includes('xlsx@0\\.18\\.5'), 'Build transform nehlídá přesně XLSX 0.18.5');
assert(deferHeavyLibs.includes('jszip@3\\.10\\.1'), 'Build transform nehlídá přesně JSZip 3.10.1');
assert(deferHeavyLibs.includes('@supabase\\/supabase-js@2\\.110\\.7'), 'Build transform nemá pojistku proti odstranění Supabase');
assert(deferHeavyLibs.includes('rak-dom-security-hardening\\.js'), 'Build transform nemá pojistku pro DOM security hardening');
assert(lazyExternalLibs.includes("window.rakEnsureExternalLibrary = ensureExternalLibrary"), 'Chybí veřejný on-demand loader externích knihoven');
assert(lazyExternalLibs.includes("wrapAsyncGlobal('buildRakExcelImportPreview', 'xlsx')"), 'Excel import není navázaný na lazy XLSX');
assert(lazyExternalLibs.includes("wrapAsyncGlobal('adminRotationGeneratorDownloadExcel', 'xlsx')"), 'Excel export rozpisu není navázaný na lazy XLSX');
assert(lazyExternalLibs.includes("wrapAsyncGlobal('exportCurrentHtml', 'jszip')"), 'ZIP export není navázaný na lazy JSZip');
assert(lazyExternalLibs.includes(xlsxUrl), 'Lazy loader nepoužívá připnutou XLSX URL');
assert(lazyExternalLibs.includes(jszipUrl), 'Lazy loader nepoužívá připnutou JSZip URL');
assert(lazyExternalLibs.includes('sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw'), 'Lazy XLSX ztratilo SRI');
assert(lazyExternalLibs.includes('sha384-+mbV2IY1Zk/X1p/nWllGySJSUN8uMs+gUAN10Or95UBH0fpj6GfKgPmgC5EXieXG'), 'Lazy JSZip ztratilo SRI');
assert(lazyExternalLibs.includes("deadGamePaths"), 'ZIP export nemá runtime cleanup odstraněných Games cest');
assert(lazyExternalLibs.includes("'assets/rak-memory-total-time-fix.js'"), 'ZIP cleanup nevyřazuje starý Memory/Pexeso guard');
assert(lazyExternalLibs.includes("window.EXPORT_JS_FILES.includes('rak-lazy-external-libs.js')"), 'ZIP export nearchivuje nový lazy loader');
assert(indexHtml.includes('@supabase/supabase-js@2.110.7'), 'Supabase eager script zmizel z index.html');
if (String(process.env.VERCEL || '').trim()) {
  assert(!indexHtml.includes(xlsxUrl), 'V nasazovaném HTML zůstal eager XLSX');
  assert(!indexHtml.includes(jszipUrl), 'V nasazovaném HTML zůstal eager JSZip');
  assert(!indexHtml.includes('assets/rak-memory-total-time-fix.js'), 'V nasazeném HTML zůstal starý Memory/Pexeso guard');
  for (const file of idleReleaseDiagnostics) {
    assert(!indexHtml.includes('src="' + file + '"'), 'V nasazovaném HTML zůstala eager diagnostika ' + file);
  }
  assert(indexHtml.includes('src="rak-dom-security-hardening.js"'), 'DOM security hardening zmizel ze startup HTML');
}

// qr.js je historicky špatně pojmenovaný: kromě QR obsahuje i výpočet Kantýny/Jídelny.
assert(qrJs.includes('function getFoodMachineSettings'), 'qr.js už neobsahuje food settings očekávané dashboardem');
assert(qrJs.includes('function getFoodSpecialDateSet'), 'qr.js už neobsahuje food kalendář očekávaný dashboardem');
assert(qrJs.includes('const BRUS_CONFIG'), 'qr.js ztratil konfiguraci brusů');

const appVersionMatch = appJs.match(/RAK_MODULE_CACHE_VERSION\s*=\s*["']([^"']+)["']/);
const swVersionMatch = swJs.match(/CACHE_VERSION\s*=\s*["']v?([^"']+)["']/);
assert(appVersionMatch, 'Nelze přečíst RAK_MODULE_CACHE_VERSION z app.js');
assert(swVersionMatch, 'Nelze přečíst CACHE_VERSION ze sw.js');
assert(String(packageJson.version) === appVersionMatch[1], 'package.json a app.js mají rozdílnou build verzi');
assert(String(packageJson.version) === swVersionMatch[1], 'package.json a sw.js mají rozdílnou build verzi');
assert(stylesOverridesLegacyEarlyCss.length > 1000, 'CSS legacy early vrstva chybí nebo je neočekávaně malá');
assert(stylesOverridesLegacyMidCss.length > 1000, 'CSS legacy mid vrstva chybí nebo je neočekávaně malá');
assert(stylesOverridesLegacyLateCss.length > 1000, 'CSS legacy late vrstva chybí nebo je neočekávaně malá');
assert(!fs.existsSync(path.join(root, 'styles-overrides.css')), 'Původní styles-overrides.css monolit se nesmí vrátit');
const cssLegacyEarlyPos = indexHtml.indexOf('styles-overrides-legacy-early.css');
const cssLegacyMidPos = indexHtml.indexOf('styles-overrides-legacy-mid.css');
const cssLegacyLatePos = indexHtml.indexOf('styles-overrides-legacy-late.css');
const cssDashboardFitPos = indexHtml.indexOf('styles-dashboard-fit.css');
assert(cssLegacyEarlyPos >= 0 && cssLegacyEarlyPos < cssLegacyMidPos && cssLegacyMidPos < cssLegacyLatePos && cssLegacyLatePos < cssDashboardFitPos, 'CSS legacy vrstvy musí zachovat původní cascade pořadí před Dashboard fit');
const legacyCssWithoutComments = [stylesOverridesLegacyEarlyCss, stylesOverridesLegacyMidCss, stylesOverridesLegacyLateCss]
  .join('\n')
  .replace(/\/\*[\s\S]*?\*\//g, '');
for (const deadGameCssMarker of ['#games', 'body.gamesOpen', 'body.gamesCompactMode', 'body.tttOpen', '#tttOverlay']) {
  assert(!legacyCssWithoutComments.includes(deadGameCssMarker), 'Po odstranění Her zůstal legacy CSS marker ' + deadGameCssMarker);
}
assert(!/\.(?:games|game|ttt|snake|arcade|ships|flap|gomoku)[A-Za-z0-9_-]*\b/i.test(legacyCssWithoutComments), 'Po odstranění Her zůstal herní legacy CSS selector');


console.log('[critical-runtime-smoke] OK navigation+rotation+food baseline locked; stable qr.js boot; extended diagnostics idle; version sync ' + packageJson.version + '; Games removed; XLSX+JSZip lazy; Supabase eager; DOM security eager');
