#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const fail = (message) => { throw new Error('[release-verify] ' + message); };
const expect = (condition, message) => { if (!condition) fail(message); };

const pkg = JSON.parse(read('package.json'));
const app = read('app.js');
const sw = read('sw.js');
const manifest = read('manifest.webmanifest');
const index = read('index.html');
const styles = read('styles.css');
const maintenance = read('rak-maintenance-v1516.js');
const externalDeps = read('rak-external-deps.js');

const packageVersion = String(pkg.version || '').trim();
const moduleVersion = (app.match(/RAK_MODULE_CACHE_VERSION\s*=\s*["']([^"']+)/) || [])[1] || '';
const buildVersion = (app.match(/RAK_DEV_UPDATE_BUILD\s*=\s*["']v([^"']+)/) || [])[1] || '';
const swCacheVersion = (sw.match(/CACHE_VERSION\s*=\s*['"]v([^'"]+)/) || [])[1] || '';
const swAppVersion = (sw.match(/SW_APP_VERSION\s*=\s*['"]([^'"]+)/) || [])[1] || '';
const familyVersion = packageVersion.split('.').slice(0, 2).join('.');

expect(/^\d+\.\d+\.\d+$/.test(packageVersion), 'package.json musí mít plný semver x.y.z');
expect(moduleVersion === packageVersion, `app.js module version ${moduleVersion} != package ${packageVersion}`);
expect(buildVersion === packageVersion, `app.js build version ${buildVersion} != package ${packageVersion}`);
expect(swCacheVersion === packageVersion, `sw.js cache version ${swCacheVersion} != package ${packageVersion}`);
expect(swAppVersion === familyVersion, `sw.js app family ${swAppVersion} != ${familyVersion}`);
expect(manifest.includes('?v=' + packageVersion), 'manifest ikony nejsou označené aktuálním buildem');
expect(index.includes('app.js?v=' + packageVersion), 'index.html nenačítá app.js s aktuálním buildem');
['icon-180.png', 'icon-32.png', 'icon-192.png'].forEach((icon) => {
  expect(index.includes(icon + '?v=' + packageVersion), `index.html nemá aktuální verzi ikony ${icon}`);
});
expect(!index.includes('xlsx@0.18.5/dist/xlsx.full.min.js'), 'index.html stále eager načítá XLSX');
expect(!index.includes('jszip@3.10.1/dist/jszip.min.js'), 'index.html stále eager načítá JSZip');
expect(externalDeps.includes('xlsx@0.18.5/dist/xlsx.full.min.js'), 'XLSX chybí v lazy loaderu');
expect(externalDeps.includes('jszip@3.10.1/dist/jszip.min.js'), 'JSZip chybí v lazy loaderu');
expect(!/\bid=["']games["']/.test(index), 'index.html stále obsahuje stránku Hry');
expect(!index.includes('bottomNavGamesBtn'), 'index.html stále obsahuje tlačítko Hry');
expect(!index.includes('styles-games.css'), 'index.html stále načítá CSS Her');
expect(!index.includes('data-adreal-did'), 'index.html stále obsahuje historický adreal atribut');
expect(styles.includes('styles-maintenance.css'), 'styles.css nenačítá maintenance komponentní vrstvu');
expect(maintenance.includes(`const BUILD = 'v${packageVersion}'`), 'maintenance modul nemá aktuální build');

[
  'rak-dev-fixes-v1512.js',
  'rak-menu-report-order-v1513.js',
  'rak-dashboard-shift-label-v1515.js',
  'brusy-fhb-v158.js'
].forEach((legacy) => expect(!app.includes(legacy), `app.js stále načítá starý patch ${legacy}`));

expect(app.includes('lazyAdminFiles'), 'app.js nemá lazy admin loader');
expect(app.includes('admin-rotation.js'), 'admin-rotation.js chybí z lazy admin loaderu');
expect(app.includes('lazyCalculatorFiles'), 'app.js nemá lazy kalkulačkový loader');
expect(!/const CORE\s*=\s*\[[\s\S]*rak-login-crab/.test(sw), 'service worker stále precachuje velké login obrázky');
expect(sw.includes('staleWhileRevalidateVersioned'), 'service worker nemá rychlou strategii pro verzované moduly');
expect(maintenance.includes('whatsapp://send?text='), 'maintenance neobsahuje iOS-safe WhatsApp předání');
expect(maintenance.includes('findFirstMorningShiftDateInMonth'), 'maintenance nehlídá první ranní směnu všech týmů');
expect(maintenance.includes('Ranní') && maintenance.includes('Noční'), 'maintenance nehlídá plné názvy směn');
expect(maintenance.includes('pruneBlankBrusResults'), 'maintenance nehlídá prázdná FHB pole');

console.log(`[release-verify] OK ${packageVersion}`);
