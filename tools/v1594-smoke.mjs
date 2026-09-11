import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const app = read('app.js');
const pkg = JSON.parse(read('package.json'));
const sw = read('sw.js');
const brus = read('brusy-fhb-v158.js');
const viewport = read('styles-viewport-polish.css');
const viewportClean = viewport.replace(/\/\*[\s\S]*?\*\//g, '');

assert.equal(pkg.version, '1.5.94', 'package version must be 1.5.94');
assert.match(app, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.94["']/, 'app cache version must be 1.5.94');
assert.match(app, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.94["']/, 'app update build must be v1.5.94');
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.94["']/, 'service worker cache must be v1.5.94');
assert.match(sw, /SW_APP_VERSION\s*=\s*["']1\.5\.94["']/, 'service worker app version must be 1.5.94');
assert(sw.includes("'./core.js?v=1.5.94'"), 'warm-start core must use current build');
assert(sw.includes("nextUrl.searchParams.set('_rak_update', CACHE_VERSION + '-' + Date.now().toString(36))"), 'confirmed update cache-busting navigation missing');

const adminStart = app.indexOf('const adminFeatureFiles = [');
const adminEnd = app.indexOf('];', adminStart);
const adminGroup = app.slice(adminStart, adminEnd);
assert(adminStart >= 0 && adminEnd > adminStart, 'admin feature group missing');
assert(adminGroup.includes('"brusy-fhb-correction.js"'), 'base Brusy calibration builder missing from Admin');
assert(adminGroup.includes('"brusy-fhb-v158.js"'), 'v1.5.94 Brusy compatibility/model layer must load with Admin');

for (const label of [
  'Před korekcí (strany dle protokolu)',
  'Provedené korekce (strany dle protokolu)',
  'Po korekci (strany dle protokolu)'
]) {
  assert(brus.includes(label), 'Brusy admin label missing: ' + label);
}
assert(brus.includes("const SPINDLES = ['C1', 'C2'];"), 'C1/C2 spindle model missing');
assert(brus.includes('samples[row.machine][row.c][row.side].push(rate)'), 'calibration samples must be separated by machine + spindle + protocol side');
assert(brus.includes('settings.activeModels[safeMachine][safeSpindle][safeSide]'), 'calculator sensitivity must read spindle-specific model');
assert(brus.includes('raw[machine] && raw[machine][side]'), 'legacy machine+side calibration fallback must stay readable');
assert(brus.includes("function programSide(side) {\n    return side === 'right' ? 'left' : 'right';\n  }"), 'protocol/program side inversion missing');
assert(brus.includes("spindle + ' ' + program + ' ' + signed(correction) + ' µm'"), 'calculator result must name spindle and program side');
assert(brus.includes("'C1 · protokol L → program P'" ) || brus.includes("row.c + ' · protokol ' + protocolSideShort(row.side) + ' → program ' + programSideShort(row.side)"), 'history must expose protocol-to-program conversion');
assert(brus.includes("event.stopImmediatePropagation();\n      evaluateCalculator();"), 'new per-spindle calculator evaluator must own the click before legacy v157');
assert(brus.includes('window.getBrusFhbCorrectionSensitivity = sensitivity;'), 'spindle-aware sensitivity export missing');
assert(brus.includes('SPINDLES.forEach((spindle) => {') && brus.includes('SIDES.forEach((side) => {'), 'admin sparse C1/C2 L/P record collection missing');
assert(brus.includes("if (!filled) return;\n        if (filled !== 3)"), 'empty combinations must be allowed while partial triplets are rejected');

const programSide = (side) => side === 'right' ? 'left' : 'right';
assert.equal(programSide('left'), 'right', 'protocol L must map to program P');
assert.equal(programSide('right'), 'left', 'protocol P must map to program L');

assert(!viewportClean.includes('min-height:var(--rak-start-viewport-h, 100dvh) !important;'), 'dead early primed 100dvh owner returned');
assert(viewportClean.includes('html.rakViewportPrimed body,\nhtml.rakStableBootViewport body{\n  min-height:100svh !important;'), 'canonical primed/stable 100svh owner missing');
assert(viewportClean.includes('height:100dvh !important;') && viewportClean.includes('overflow-y:auto !important;'), 'mobile Home scroll owner must stay unchanged');
assert(viewportClean.includes('grid-template-rows:repeat(4, auto) !important;'), 'Dashboard four-row overflow guard must stay unchanged');
assert(viewport.includes('RaK v1.5.94 – Point 4 / bezpečný viewport cleanup'), 'v1.5.94 Point 4 cleanup marker missing');

assert(String(pkg.scripts.check || '').includes('tools/v1594-smoke.mjs'), 'v1.5.94 smoke must run in npm check');
assert(!String(pkg.scripts.check || '').includes('tools/v1593-smoke.mjs'), 'old v1.5.93 smoke must not remain in active check chain');

console.log('[v1.5.94-smoke] OK per-spindle Brusy calibration + protocol/program mapping + Point 4 primed viewport cleanup');
