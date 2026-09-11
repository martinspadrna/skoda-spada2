import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const app = read('app.js');
const pkg = JSON.parse(read('package.json'));
const sw = read('sw.js');
const brus = read('brusy-fhb-v158.js');
const themePropagation = read('styles-theme-propagation.css');
const viewport = read('styles-viewport-polish.css');
const viewportClean = viewport.replace(/\/\*[\s\S]*?\*\//g, '');

assert.equal(pkg.version, '1.5.95', 'package version must be 1.5.95');
assert.match(app, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.95["']/, 'app cache version must be 1.5.95');
assert.match(app, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.95["']/, 'app update build must be v1.5.95');
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.95["']/, 'service worker cache must be v1.5.95');
assert.match(sw, /SW_APP_VERSION\s*=\s*["']1\.5\.95["']/, 'service worker app version must be 1.5.95');
assert(sw.includes("'./core.js?v=1.5.95'"), 'warm-start core must use current build');
assert(sw.includes("nextUrl.searchParams.set('_rak_update', CACHE_VERSION + '-' + Date.now().toString(36))"), 'confirmed update cache-busting navigation missing');

assert(brus.includes("const INDEXES = ['AD', 'AE', 'AH'];"), 'AD/AE/AH sensitivity index dimension missing');
assert(brus.includes('models[machine][index][spindle] = { left: DEFAULT_MODEL.left, right: DEFAULT_MODEL.right };'), '24-way default sensitivity model missing');
assert(brus.includes('samples[row.machine][row.index][row.c][row.side].push(rate)'), 'calibration samples must be separated by machine + index + spindle + protocol side');
assert(brus.includes('settings.activeModels[safeMachine][safeIndex][safeSpindle][safeSide]'), 'calculator must read index-specific sensitivity');
assert(brus.includes('raw[machine] && raw[machine][spindle] && raw[machine][spindle][side]'), 'v1.5.94 machine+spindle+side migration fallback missing');
assert(brus.includes('raw[machine] && raw[machine][side]'), 'older machine+side migration fallback missing');
assert(brus.includes('<details class="adminBrusFhbModel adminBrusSensitivityFold">'), 'sensitivity block must be a native details fold');
assert(!brus.includes('<details class="adminBrusFhbModel adminBrusSensitivityFold" open'), 'sensitivity block must be collapsed by default');
assert(brus.includes('<small>24 kombinací</small>'), 'sensitivity summary must expose 24 combinations');
assert(brus.includes("machine + ' · ' + index + ' · ' + spindle + ' · protokol '"), 'metric labels must include machine + index + spindle + side');
assert(brus.includes("function programSide(side) { return side === 'right' ? 'left' : 'right'; }"), 'protocol/program side inversion missing');
assert(brus.includes('sensitivity(safeMachine, safeIndex, safeSide, safeSpindle)'), 'calculator must use fully indexed sensitivity');

const cleanupMarker = 'RaK v1.5.95 – čisté sekční obálky';
const cleanupStart = themePropagation.indexOf(cleanupMarker);
assert(cleanupStart >= 0, 'clean section wrapper marker missing');
const cleanup = themePropagation.slice(cleanupStart);
for (const selector of [
  '#home.page.active > .dashboardShell',
  '#kalkulacky.page.active > .calcHomeSection',
  '#menu.page.active > .appMenuPageCard',
  '#menu .appMenuAdminQuickLinks',
  '#rotace.page.active #personView.personCard',
  '#rotace.page.active #rotaceNamesPanel.active #namesGrid',
  'html.rakRotaceNamesDockActive body > #namesGrid[data-rak-dock-portal="body-fixed"]'
]) {
  assert(cleanup.includes(selector), 'missing large-wrapper cleanup selector: ' + selector);
}
for (const rule of [
  'border:0 !important;',
  'background:transparent !important;',
  'box-shadow:none !important;',
  '-webkit-backdrop-filter:none !important;',
  'backdrop-filter:none !important;'
]) {
  assert(cleanup.includes(rule), 'missing clean-wrapper rule: ' + rule);
}
assert(cleanup.includes('#home.page.active > .dashboardShell::before'), 'Home before seam layer must be removed');
assert(cleanup.includes('#home.page.active > .dashboardShell::after'), 'Home after seam layer must be removed');
assert(cleanup.includes('content:none !important;'), 'Home seam pseudo-layers must be disabled');

assert(viewportClean.includes('height:100dvh !important;') && viewportClean.includes('overflow-y:auto !important;'), 'mobile Home scroll owner must stay unchanged');
assert(viewportClean.includes('grid-template-rows:repeat(4, auto) !important;'), 'Dashboard four-row guard must stay unchanged');
assert(String(pkg.scripts.check || '').includes('tools/v1595-smoke.mjs'), 'v1.5.95 smoke must run in npm check');
assert(!String(pkg.scripts.check || '').includes('tools/v1594-smoke.mjs'), 'old v1.5.94 smoke must not remain in active check chain');

console.log('[v1.5.95-smoke] OK 24-way Brusy sensitivity + collapsed fold + clean large section wrappers');
