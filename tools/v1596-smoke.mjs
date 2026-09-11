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

assert.equal(pkg.version, '1.5.96', 'package version must be 1.5.96');
assert.match(app, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.96["']/, 'app cache version must be 1.5.96');
assert.match(app, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.96["']/, 'app update build must be v1.5.96');
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.96["']/, 'service worker cache must be v1.5.96');
assert.match(sw, /SW_APP_VERSION\s*=\s*["']1\.5\.96["']/, 'service worker app version must be 1.5.96');
assert(sw.includes("'./core.js?v=1.5.96'"), 'warm-start core must use current build');
assert(sw.includes("nextUrl.searchParams.set('_rak_update', CACHE_VERSION + '-' + Date.now().toString(36))"), 'confirmed update cache-busting navigation missing');

assert(brus.includes("const INDEXES = ['AD', 'AE', 'AH'];"), 'AD/AE/AH sensitivity index dimension missing');
assert(brus.includes('models[machine][index][spindle] = { left: DEFAULT_MODEL.left, right: DEFAULT_MODEL.right };'), '24-way default sensitivity model missing');
assert(brus.includes('samples[row.machine][row.index][row.c][row.side].push(rate)'), 'calibration samples must stay separated by machine + index + spindle + protocol side');
assert(brus.includes('settings.activeModels[safeMachine][safeIndex][safeSpindle][safeSide]'), 'calculator must keep index-specific sensitivity');
assert(brus.includes('<details class="adminBrusFhbModel adminBrusSensitivityFold">'), 'sensitivity block must remain a native details fold');
assert(!brus.includes('<details class="adminBrusFhbModel adminBrusSensitivityFold" open'), 'sensitivity block must stay collapsed by default');
assert(brus.includes('<small>24 kombinací</small>'), 'sensitivity summary must expose 24 combinations');

assert(app.includes("document.querySelector('#kalkulacky > .calcHomeSectionCorrections')"), 'Korekce default-open owner missing');
assert(app.includes('correctionsHome.open = true;'), 'Korekce must be opened by default on boot');

const cleanupMarker = 'RaK v1.5.96 – čisté velké obálky + oprava Home švu';
const cleanupStart = themePropagation.indexOf(cleanupMarker);
assert(cleanupStart >= 0, 'v1.5.96 section-wrapper marker missing');
const cleanup = themePropagation.slice(cleanupStart);
for (const selector of [
  'body:not(.lightweightMode):not(.lowEndDevice):not(.ladaMode) #home.page.active > .dashboardShell',
  'body.lightweightMode #home.page.active > .dashboardShell',
  '#rotace.page.active #rotaceStatsPanel.active > .card',
  '#rotace.page.active #rotaceMonthsPanel.active > .rotaceMonthPicker.card',
  '#rotace.page.active #rotaceMonthsPanel.active > #monthView.card',
  '#home.page.active .homeDivider'
]) {
  assert(cleanup.includes(selector), 'missing v1.5.96 wrapper/seam selector: ' + selector);
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
assert(cleanup.includes('body:not(.lightweightMode):not(.lowEndDevice):not(.ladaMode) #home.page.active > .dashboardShell::before'), 'high-specificity Home before owner missing');
assert(cleanup.includes('body:not(.lightweightMode):not(.lowEndDevice):not(.ladaMode) #home.page.active > .dashboardShell::after'), 'high-specificity Home after owner missing');
assert(cleanup.includes('display:none !important;') && cleanup.includes('height:0 !important;'), 'legacy Home divider must be disabled');

assert(cleanup.includes('#menu .appMenuAdminQuickLinks{'), 'admin-only wrapper must have a dedicated visible owner');
assert(cleanup.includes('border:2px solid color-mix(in srgb, #ffe55d 68%'), 'admin-only wrapper must be visibly outlined');
assert(cleanup.includes('#menu .appMenuAdminQuickLinksTitle{'), 'admin title emphasis missing');
const transparentBlockEnd = cleanup.indexOf('/* Admin-only blok');
assert(transparentBlockEnd > 0, 'admin-only section marker missing');
const transparentBlock = cleanup.slice(0, transparentBlockEnd);
assert(!transparentBlock.includes('#menu .appMenuAdminQuickLinks,'), 'admin wrapper must not remain in transparent cleanup group');

assert(viewportClean.includes('height:100dvh !important;') && viewportClean.includes('overflow-y:auto !important;'), 'mobile Home scroll owner must stay unchanged');
assert(viewportClean.includes('grid-template-rows:repeat(4, auto) !important;'), 'Dashboard four-row guard must stay unchanged');
assert(String(pkg.scripts.check || '').includes('tools/v1596-smoke.mjs'), 'v1.5.96 smoke must run in npm check');
assert(!String(pkg.scripts.check || '').includes('tools/v1595-smoke.mjs'), 'old v1.5.95 smoke must not remain in active check chain');

console.log('[v1.5.96-smoke] OK Home seam + Rotace subviews + default-open Korekce + visible admin wrapper');
