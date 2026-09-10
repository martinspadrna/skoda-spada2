#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error('[v1.5.82-smoke] ' + message); };
const versionAtLeast = (actual, minimum) => {
  const a = String(actual || '').split('.').map((part) => Number(part) || 0);
  const b = String(minimum || '').split('.').map((part) => Number(part) || 0);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return true;
};

const helper = read('rak-v1582-fixes.js');
const app = read('app.js');
const styles = read('styles.css');
const sw = read('sw.js');
const pkg = JSON.parse(read('package.json'));

assert(versionAtLeast(pkg.version, '1.5.82'), 'package.json musí být minimálně 1.5.82');
assert(app.includes('"rak-v1582-fixes.js"'), 'helper v1.5.82 musí být v deferred loaderu');
assert(/RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.\d+["']/.test(app), 'app.js musí mít platnou 1.5.x cache verzi');
assert(/RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.\d+["']/.test(app), 'app.js musí mít platný 1.5.x PWA build');
assert(/CACHE_VERSION\s*=\s*["']v1\.5\.\d+["']/.test(sw), 'sw.js musí mít platnou 1.5.x cache verzi');

assert(!fs.existsSync(path.join(root, 'styles-mobile-pwa.css')), 'chybný v1.5.81 mobile stylesheet musí být odstraněný');
assert(!styles.includes('styles-mobile-pwa.css'), 'styles.css nesmí importovat chybný v1.5.81 mobile stylesheet');

assert(helper.includes('z-index:2147483600!important'), 'update toast musí být nad Rotace names dockem');
assert(helper.includes('assets/app-icons/icon-192.png?v=1.5.1'), 'update toast musí používat RaK logo');
assert(helper.includes("badge.replaceChildren(img)"), 'update ikona se musí nahradit logem');

assert(helper.includes("const SHIFT_INDEXES"), 'Report směny musí mít seznam povolených indexů');
assert(helper.includes('rebuildShiftSelect'), 'Report směny musí filtrovat už použité indexy');
assert(helper.includes('add.disabled = exhausted'), 'Přidat index se musí po vyčerpání možností zablokovat');
assert(helper.includes('firstUnused'), 'nový řádek musí vybrat první nepoužitý index');

assert(helper.includes("value.startsWith('TBK')"), 'souhrn musí slučovat TBK');
assert(helper.includes("value.startsWith('MSK')"), 'souhrn musí slučovat MSK');
assert(helper.includes("value.startsWith('MFK')"), 'souhrn musí slučovat MFK');
assert(helper.includes("addMachine('TNKS01', person, 0.5)"), 'souhrn musí zachovat půlení TNKS01');
assert(helper.includes("addMachine('TPKW01', person, 0.5)"), 'souhrn musí zachovat půlení TPKW01');
assert(helper.includes('adminRotationFreeNamesSummary'), 'sloučený přehled musí být přidaný do kontroly Rozpisů');
assert(helper.includes("{ open: wasOpen, admin: true }"), 'admin přehled musí být při prvním vložení sbalený a pak zachovat stav');

assert(helper.includes('html body #home.page.active .dashboardShell'), 'Dashboard trial musí cílit jen na hlavní shell');
assert(helper.includes('border-width:0!important'), 'vnější Dashboard rámeček musí být odstraněný');

console.log('[v1.5.82-smoke] OK v1.5.82 funkce zachované na aktuální verzi; v1.5.81 mobile batch odstraněný');
