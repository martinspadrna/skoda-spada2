#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const appJs = read('app.js');
const qrJs = read('qr.js');
const swJs = read('sw.js');
const bootSelfTest = read('app-boot-selftest.js');
const dashboardShiftPatch = read('rak-dashboard-shift-label-v1515.js');
const stripGamesHtml = read('tools/strip-games-html.mjs');
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
assert(appJs.includes('requestIdleCallback(runIdleAudits'), 'Idle audity musí být plánované až po bootu');
assert(!appJs.includes('runRakPostLoadAudits()'), 'Legacy post-load audit se po odstranění Her nesmí automaticky spouštět');
assert(appJs.includes('await Promise.all(deferredFiles.map(loadScript))'), 'Boot musí před navázáním UI počkat na deferred moduly');
assert(appJs.includes('installBottomNavBindings'), 'Chybí navázání spodní navigace');
assert(appJs.includes('applyBottomNavMoreHardFix'), 'Chybí hard-fix tlačítka Více');
assert(appJs.includes('installDelegatedAppActions'), 'Chybí delegované akce aplikace');

// Hry už se nenačítají. Jejich odstranění při startu proto nesmí držet globální DOM observer.
assert(!appJs.includes('__rakDevGamesObserver'), 'Hry znovu používají globální MutationObserver');
assert(!appJs.includes('observer.observe(document.documentElement, { childList: true, subtree: true })'), 'Games cleanup znovu pozoruje celý DOM');
assert(!bootSelfTest.includes('DOM #games'), 'Boot self-test pořád vyžaduje odstraněný DOM Her');

// Deploy build musí fyzicky odstranit HTML Her před vydáním statických souborů.
assert(String(packageJson.scripts && packageJson.scripts['vercel-build'] || '').includes('tools/strip-games-html.mjs'), 'Vercel build neodstraňuje HTML Her');
assert(stripGamesHtml.includes('const gamesStart = \'<div id="games" class="page">\''), 'Stripper nemá pevný začátek bloku Her');
assert(stripGamesHtml.includes('const calculatorsStart = \'<div id="kalkulacky" class="page">\''), 'Stripper nemá bezpečný koncový bod před Kalkulačkami');
assert(stripGamesHtml.includes('V deployovaném HTML zůstal #games'), 'Stripper nekontroluje zbylý #games');

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

console.log('[critical-runtime-smoke] OK navigation+rotation+food baseline locked; stable qr.js boot; idle audits available; version sync ' + packageJson.version + '; dynamic build label; Games HTML stripped at deploy');
