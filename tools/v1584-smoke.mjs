#!/usr/bin/env node
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error('[v1.5.84-smoke] ' + message); };
const helper = read('rak-v1584-fixes.js');
const app = read('app.js');
const sw = read('sw.js');
const pkg = JSON.parse(read('package.json'));

assert(pkg.version === '1.5.84', 'package.json musí být 1.5.84');
assert(app.includes('RAK_MODULE_CACHE_VERSION = "1.5.84"'), 'app.js musí mít cache 1.5.84');
assert(app.includes('RAK_DEV_UPDATE_BUILD = "v1.5.84"'), 'app.js musí mít PWA build v1.5.84');
assert(sw.includes("CACHE_VERSION = 'v1.5.84'"), 'sw.js musí mít cache v1.5.84');
assert(app.includes('"rak-v1584-fixes.js"'), 'v1.5.84 helper musí být v loaderu');

assert(helper.includes('window.__rakV1582FixObserverRetiredByV1584 = true'), 'starý v1.5.82 observer musí být bezpečně odstaven');
assert(helper.includes('observer.disconnect()'), 'starý observer se musí skutečně disconnectnout');
assert(helper.includes('sameValues(select, values)'), 'Report směny nesmí zbytečně přepisovat stejné optiony');
assert(helper.includes("node.matches('.rakShiftProdRow')"), 'removedNodes filtr musí reagovat jen na výrobní řádky');
assert(helper.includes('const removedRow = Array.from(record.removedNodes || []).some(removedNodeHasShiftRow)'), 'observer musí filtrovat odebrané uzly');
assert(!helper.includes("if (record.removedNodes && record.removedNodes.length) {\n          const root = document.getElementById('rakShiftReport')"), 'v1.5.84 nesmí obnovit nekonečný sync po libovolné DOM mutaci');

assert(helper.includes('#rakV1582AdminMachineSummary'), 'mobilní fix musí cílit skupinový přehled');
assert(helper.includes('max-width:100%!important'), 'skupinový přehled musí být omezen viewportem');
assert(helper.includes('overflow-x:auto!important'), 'široká tabulka musí scrollovat uvnitř svého panelu');
assert(helper.includes('white-space:normal!important'), 'text vysvětlivky se musí na mobilu zalamovat');
assert(helper.includes('min-width:620px!important'), 'tabulka si zachová čitelné sloupce uvnitř horizontálního scrollu');

console.log('[v1.5.84-smoke] OK mobile rotation summary containment + shift report mutation-loop guard');
