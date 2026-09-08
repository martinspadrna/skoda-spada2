#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const appJs = read('app.js');
const qrRuntime = read('qr-runtime.generated.js');
const qrData = read('qr-data.generated.js');

function assert(condition, message) {
  if (!condition) throw new Error('[critical-runtime-smoke] ' + message);
}

function loaderGroup(name) {
  const match = appJs.match(new RegExp('const\\s+' + name + '\\s*=\\s*\\[(.*?)\\];', 's'));
  assert(match, 'Chybí loader skupina ' + name);
  return Array.from(match[1].matchAll(/"([^"]+\.js)"/g)).map((item) => item[1]);
}

const deferred = loaderGroup('deferredFiles');
const mustStayBootLoaded = [
  'qr-runtime.generated.js',
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

assert(!deferred.includes('qr.js'), 'Původní těžký qr.js se nesmí vrátit do startovacího loaderu');
assert(!deferred.includes('qr-data.generated.js'), 'QR SVG data se nesmí načítat při startu');
assert(appJs.includes('await Promise.all(deferredFiles.map(loadScript))'), 'Boot musí před navázáním UI počkat na deferred moduly');
assert(appJs.includes('installBottomNavBindings'), 'Chybí navázání spodní navigace');
assert(appJs.includes('applyBottomNavMoreHardFix'), 'Chybí hard-fix tlačítka Více');
assert(appJs.includes('installDelegatedAppActions'), 'Chybí delegované akce aplikace');

// Provozní část historického qr.js musí zůstat v běžném bootu.
assert(qrRuntime.includes('function getFoodMachineSettings'), 'Slim QR runtime už neobsahuje food settings očekávané dashboardem');
assert(qrRuntime.includes('function getFoodSpecialDateSet'), 'Slim QR runtime už neobsahuje food kalendář očekávaný dashboardem');
assert(qrRuntime.includes('const BRUS_CONFIG'), 'Slim QR runtime ztratil konfiguraci brusů');

// Pouze velká SVG data QR smějí být odložená.
assert(qrRuntime.includes('function ensurePersonQrDataLoaded'), 'Chybí lazy loader QR dat');
assert(qrRuntime.includes("script.src = 'qr-data.generated.js"), 'QR runtime nenačítá lazy datový soubor');
assert(qrRuntime.includes('async function showPersonQrModal'), 'QR modal nečeká na lazy data');
assert(qrData.includes('window.PERSON_QR_CODES ='), 'Generated QR data nemají očekávaný export');
assert(qrData.length > 1000, 'Generated QR data vypadají podezřele malá');

console.log('[critical-runtime-smoke] OK navigation+rotation+food baseline locked; QR SVG data lazy');
