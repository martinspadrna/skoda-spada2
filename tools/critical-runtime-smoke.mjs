#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const appJs = read('app.js');
const qrJs = read('qr.js');
const swJs = read('sw.js');
const indexHtml = read('index.html');
const bootSelfTest = read('app-boot-selftest.js');
const dashboardShiftPatch = read('rak-dashboard-shift-label-v1515.js');
const shiftReportEntryFix = read('rak-shift-report-entry-fix.js');
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
assert(shiftReportEntryFix.includes('const anchor = vacationReportButton || nativeReportButton || adminButton;'), 'Report směny musí preferovat Report dovolené jako viditelnou kotvu pořadí');

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
assert(deferHeavyLibs.includes('rak-memory-total-time-fix\\.js'), 'Build transform neodstraňuje starý Memory/Pexeso guard');
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

assert(dashboardShiftPatch.includes('window.RAK_PWA_BUILD'), 'Zobrazený testovací build není navázaný na aktuální PWA build');
assert(dashboardShiftPatch.includes('--rak-dev-build-label'), 'Chybí bezpečné přepsání starého build labelu v O aplikaci');

console.log('[critical-runtime-smoke] OK navigation+rotation+food baseline locked; stable qr.js boot; extended diagnostics idle; version sync ' + packageJson.version + '; Games removed; XLSX+JSZip lazy; Supabase eager; DOM security eager');
