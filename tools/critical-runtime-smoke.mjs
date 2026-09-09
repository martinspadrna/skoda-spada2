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
const bootSelfTest = read('app-boot-selftest.js');
const appMenuJs = read('app-menu.js');
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
assert(appMenuJs.includes('Testovací build: '), 'O aplikaci musí renderovat testovací build přímo z app-menu.js');
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


console.log('[critical-runtime-smoke] OK navigation+rotation+food baseline locked; stable qr.js boot; extended diagnostics idle; version sync ' + packageJson.version + '; Games removed; XLSX+JSZip lazy; Supabase eager; DOM security eager');
