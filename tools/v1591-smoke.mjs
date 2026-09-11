import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const app = read('app.js');
const pkg = JSON.parse(read('package.json'));
const sw = read('sw.js');
const routing = read('rak-feature-routing.js');
const fhb = read('admin-fhb-calibration.js');
const brusFhb = read('brusy-fhb-correction.js');
const compactCss = read('styles-rotation-summary-compact.css');
const bottomNavCss = read('styles-bottom-nav-runtime.css');
const viewportCss = read('styles-viewport-polish.css');
const dashboardAudit = read('tools/dashboard-css-overlap-audit.mjs');

assert.equal(pkg.version, '1.5.91', 'package version must be 1.5.91');
assert.match(app, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.91["']/, 'app cache version must be 1.5.91');
assert.match(app, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.91["']/, 'app update build must be v1.5.91');
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.91["']/, 'service worker cache must be v1.5.91');
assert.match(app, /RAK_BOOT_V2_ENABLED\s*=\s*true/, 'Boot v2 must stay enabled');

// Point 3 warm-start/cache must remain intact and use a fresh cache key.
assert(sw.includes('const PREWARM_CACHE = `rotace-prewarm-${CACHE_VERSION}`'), 'isolated prewarm cache missing');
assert(sw.includes('async function staticResponse(request)'), 'cache-first static response missing');
assert(sw.includes("strategy: 'navigation-network-first;build-static-cache-first;isolated-prewarm'"), 'PWA strategy status missing');
assert(sw.includes("'./rak-feature-routing.js?v=1.5.91'"), 'warm-start routing asset must use current version');
assert(sw.includes("'./core.js?v=1.5.91'"), 'warm-start core asset must use current version');

// Correction settings: Brusy builder is loaded by Admin itself and replaces its placeholder inside the native fold.
assert(app.includes('const adminFeatureFiles = ['), 'admin feature group missing');
const adminStart = app.indexOf('const adminFeatureFiles = [');
const adminEnd = app.indexOf('];', adminStart);
const adminGroup = app.slice(adminStart, adminEnd);
assert(adminGroup.includes('"admin-fhb-calibration.js"'), 'admin FHB calibration module missing');
assert(adminGroup.includes('"brusy-fhb-correction.js"'), 'Brusy FHB builder must load with Admin even before Calculators');
assert(fhb.includes('<details class="rakCorrectionMachineFold" data-rak-correction-group="frezky">'), 'native frezky fold missing');
assert(fhb.includes('<details class="rakCorrectionMachineFold" data-rak-correction-group="brusy">'), 'native brusy fold missing');
assert(fhb.includes('<summary><span>Brusy FHB · TBKR01 + TBKR07</span><small>nastavení brusů</small>'), 'Brusy summary is wrong');
assert(!fhb.includes('připravujeme'), 'Brusy must not say preparing');
assert(fhb.includes('<div class="appMenuCard adminFhbCalibrationSoon"><b>Brusy</b><span>'), 'Brusy placeholder must match the replacement contract');
assert(!fhb.includes('foldBrusyTailIntoSection'), 'post-render DOM moving must stay removed');
assert(!fhb.includes('scheduleBrusyTailFold'), 'post-render retry race must stay removed');
assert(brusFhb.includes('const placeholder = /<div class=\\"appMenuCard adminFhbCalibrationSoon\\"><b>Brusy<\\/b>'), 'Brusy replacement contract changed');
assert(brusFhb.includes("'<div class=\"adminBrusFhbCalibration\">'"), 'real Brusy admin form missing');
assert(brusFhb.includes("'<div class=\"appMenuSubTitle\">Brusy · FHB</div>'"), 'Brusy admin title missing');
assert(routing.includes('rakCorrectionMachineFold>summary:after{content:"Rozbalit"'), 'fold control label missing');

// Existing visual/mobile guards remain.
for (const prop of ['width:46px !important', 'height:46px !important', 'min-width:46px !important', 'max-width:46px !important']) {
  assert(compactCss.includes(prop), `update logo missing ${prop}`);
}
assert(bottomNavCss.includes('--bottom-nav-h:56px;'), 'canonical bottom-nav height missing');
assert(viewportCss.includes('height:100dvh !important;') && viewportCss.includes('overflow-y:auto !important;'), 'canonical mobile Home scroll owner missing');

// Point 4 next phase starts with a repeatable Dashboard fit/polish overlap audit before deleting more CSS.
assert(pkg.scripts.check.includes('tools/dashboard-css-overlap-audit.mjs'), 'Dashboard overlap audit must run in npm check');
assert(dashboardAudit.includes("for (const forbidden of ['.bottomNav', '#appMenuBody', '.adminRotation'])"), 'Dashboard ownership boundary guard missing');
assert(dashboardAudit.includes('repeated.length > 0'), 'Dashboard overlap inventory guard missing');

console.log('[v1.5.91-smoke] OK deterministic Brusy fold + fresh cache + Admin ownership + Point 4 Dashboard overlap audit');
