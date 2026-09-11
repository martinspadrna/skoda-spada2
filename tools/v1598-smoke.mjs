import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const app = read('app.js');
const pkg = JSON.parse(read('package.json'));
const sw = read('sw.js');
const brus = read('brusy-fhb-v158.js');
const fit = read('styles-dashboard-fit.css');
const polish = read('styles-dashboard-polish.css');
const themePropagation = read('styles-theme-propagation.css');
const viewport = read('styles-viewport-polish.css');
const viewportClean = viewport.replace(/\/\*[\s\S]*?\*\//g, '');

assert.equal(pkg.version, '1.5.98', 'package version must be 1.5.98');
assert.match(app, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.98["']/, 'app cache version must be 1.5.98');
assert.match(app, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.98["']/, 'app update build must be v1.5.98');
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.98["']/, 'service worker cache must be v1.5.98');
assert.match(sw, /SW_APP_VERSION\s*=\s*["']1\.5\.98["']/, 'service worker app version must be 1.5.98');
assert(sw.includes("'./core.js?v=1.5.98'"), 'warm-start core must use current build');
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
assert(cleanup.includes('#menu .appMenuAdminQuickLinks{'), 'admin-only wrapper must have a dedicated visible owner');
assert(cleanup.includes('border:2px solid color-mix(in srgb, #ffe55d 68%'), 'admin-only wrapper must stay visibly outlined');

assert(fit.includes('RaK v1.5.97 – kanonický compact Dashboard owner'), 'canonical compact Dashboard owner missing');
assert(fit.includes('RaK v1.5.97 – kanonický vlastník absence pillu'), 'canonical absence pill owner missing');
for (const deadRevision of ['v.1.5 (944)', 'v.1.5 (945)', 'v.1.5 (954)', 'v.1.5 (956)', 'v.1.5 (958)']) {
  assert(!fit.includes(deadRevision), `superseded fit revision returned: ${deadRevision}`);
}
assert(fit.includes('--rak-dashboard-fit-card-min:82px;') && fit.includes('--rak-dashboard-fit-gap:9px;'), 'canonical compact card metrics drifted');
assert(fit.includes('max-height:calc(100dvh - 76px - env(safe-area-inset-bottom)) !important;'), 'canonical compact shell height drifted');
assert(fit.includes('min-width:min(206px, 72vw) !important;'), 'canonical absence pill width drifted');

assert(polish.includes('RaK v1.5.98 – odstraněné prokazatelně přepsané glass/low-end/food/dot/typography mezivrstvy'), 'v1.5.98 Dashboard polish cleanup marker missing');
assert(!polish.includes('rgba(5,9,16,.34) 68%'), 'superseded strong Dashboard glass variables returned');
assert(!polish.includes('rgba(5,9,16,.40) 70%'), 'superseded strong Dashboard glass variables returned');
assert(polish.includes('rgba(5,9,16,.24) 64%'), 'canonical matte Dashboard glass owner missing');
assert(polish.includes('inline-size:14px !important;') && polish.includes('block-size:14px !important;'), 'canonical Kantýna/Jídelna status dot owner missing');
assert(polish.includes('font-size:clamp(12.1px, 3.25vw, 14.6px) !important;'), 'canonical Dashboard label font owner missing');
assert(polish.includes('font-size:clamp(15.5px, 4.45vw, 20.4px) !important;'), 'canonical Dashboard value font owner missing');
assert(polish.includes('font-size:clamp(11.1px, 2.95vw, 13.2px) !important;'), 'canonical Dashboard meta font owner missing');
assert(polish.includes('font-size:clamp(19px, 5.1vw, 27px) !important;'), 'large absence text owner must remain');
assert(polish.includes('html body:is(.ladaMode,.lowEndDevice,.lightweightMode) #home.page.active .dashboardShell'), 'final low-end Dashboard shell owner missing');
assert(polish.includes('@media (min-width:380px) and (max-width:440px) and (min-height:830px) and (max-height:940px)'), 'iPhone 390–428 stack owner missing');
assert(polish.includes('@media (min-width:380px) and (max-width:410px) and (min-height:830px) and (max-height:860px)'), '390×844 stack owner missing');
assert(polish.includes('grid-auto-rows:117px !important;'), '390×844 final card-row owner missing');
assert(polish.includes('min-height:136px !important;') && polish.includes('min-height:143px !important;'), 'final mobile hero heights drifted');

assert(viewportClean.includes('height:100dvh !important;') && viewportClean.includes('overflow-y:auto !important;'), 'mobile Home scroll owner must stay unchanged');
assert(viewportClean.includes('grid-template-rows:repeat(4, auto) !important;'), 'Dashboard four-row guard must stay unchanged');
assert(String(pkg.scripts.check || '').includes('tools/v1598-smoke.mjs'), 'v1.5.98 smoke must run in npm check');
assert(!String(pkg.scripts.check || '').includes('tools/v1597-smoke.mjs'), 'old v1.5.97 smoke must not remain in active check chain');

console.log('[v1.5.98-smoke] OK Dashboard polish dead layers removed; visual/mobile owners preserved');
