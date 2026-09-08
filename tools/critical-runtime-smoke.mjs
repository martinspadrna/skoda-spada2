#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const appJs = read('app.js');
const qrJs = read('qr.js');
const swJs = read('sw.js');
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
assert(appJs.includes('await Promise.all(deferredFiles.map(loadScript))'), 'Boot musí před navázáním UI počkat na deferred moduly');
assert(appJs.includes('installBottomNavBindings'), 'Chybí navázání spodní navigace');
assert(appJs.includes('applyBottomNavMoreHardFix'), 'Chybí hard-fix tlačítka Více');
assert(appJs.includes('installDelegatedAppActions'), 'Chybí delegované akce aplikace');

// qr.js je historicky špatně pojmenovaný: kromě QR obsahuje i výpočet Kantýny/Jídelny.
// Proto ho nesmíme bez spolehlivě nasazeného rozdělení jen tak lazy-loadnout.
assert(qrJs.includes('function getFoodMachineSettings'), 'qr.js už neobsahuje food settings očekávané dashboardem');
assert(qrJs.includes('function getFoodSpecialDateSet'), 'qr.js už neobsahuje food kalendář očekávaný dashboardem');
assert(qrJs.includes('const BRUS_CONFIG'), 'qr.js ztratil konfiguraci brusů');

// Základní build číslo musí být stejné v package, app loaderu a service workeru.
const appVersionMatch = appJs.match(/RAK_MODULE_CACHE_VERSION\s*=\s*["']([^"']+)["']/);
const swVersionMatch = swJs.match(/CACHE_VERSION\s*=\s*["']v?([^"']+)["']/);
assert(appVersionMatch, 'Nelze přečíst RAK_MODULE_CACHE_VERSION z app.js');
assert(swVersionMatch, 'Nelze přečíst CACHE_VERSION ze sw.js');
assert(String(packageJson.version) === appVersionMatch[1], 'package.json a app.js mají rozdílnou build verzi');
assert(String(packageJson.version) === swVersionMatch[1], 'package.json a sw.js mají rozdílnou build verzi');

console.log('[critical-runtime-smoke] OK navigation+rotation+food baseline locked; stable qr.js boot; idle audits; version sync ' + packageJson.version);
