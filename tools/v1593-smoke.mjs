import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = (file) => fs.readFileSync(file, 'utf8');
const stripCssComments = (value) => String(value || '').replace(/\/\*[\s\S]*?\*\//g, '');

const app = read('app.js');
const pkg = JSON.parse(read('package.json'));
const sw = read('sw.js');
const routing = read('rak-feature-routing.js');
const fhb = read('admin-fhb-calibration.js');
const brusFhb = read('brusy-fhb-correction.js');
const brus158 = read('brusy-fhb-v158.js');
const adminRenderer = read('app-menu-admin-renderer.js');
const compactCss = read('styles-rotation-summary-compact.css');
const bottomNavCss = read('styles-bottom-nav-runtime.css');
const viewportCss = read('styles-viewport-polish.css');
const viewportClean = stripCssComments(viewportCss);
const dashboardAudit = read('tools/dashboard-css-overlap-audit.mjs');

assert.equal(pkg.version, '1.5.93', 'package version must be 1.5.93');
assert.match(app, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.93["']/, 'app cache version must be 1.5.93');
assert.match(app, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.93["']/, 'app update build must be v1.5.93');
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.93["']/, 'service worker cache must be v1.5.93');
assert.match(sw, /SW_APP_VERSION\s*=\s*["']1\.5\.93["']/, 'service worker app version must identify 1.5.93');
assert.match(app, /RAK_BOOT_V2_ENABLED\s*=\s*true/, 'Boot v2 must stay enabled');

assert(sw.includes('const PREWARM_CACHE = `rotace-prewarm-${CACHE_VERSION}`'), 'isolated prewarm cache missing');
assert(sw.includes('async function staticResponse(request)'), 'cache-first static response missing');
assert(sw.includes("strategy: 'navigation-network-first;build-static-cache-first;isolated-prewarm'"), 'PWA strategy status missing');
assert(sw.includes("'./rak-feature-routing.js?v=1.5.93'"), 'warm-start routing asset must use current version');
assert(sw.includes("'./core.js?v=1.5.93'"), 'warm-start core asset must use current version');
assert(sw.includes("nextUrl.searchParams.set('_rak_update', CACHE_VERSION"), 'service worker confirmed update must use a fresh navigation URL');
assert(sw.includes('client.navigate(nextUrl.href)'), 'service worker must navigate the approved client to the fresh URL');

assert(routing.includes('installRakConfirmedUpdateReloadGuard'), 'confirmed-update reload guard missing');
assert(routing.includes("url.searchParams.set('_rak_update'"), 'client fresh update URL marker missing');
assert(routing.includes('window.location.replace(target)'), 'iOS update fallback must use location.replace');
assert(routing.includes("event.target.closest('.rakUpdateToastAction')"), 'update-click fallback hook missing');
assert(routing.includes("data.type === 'sw-activated'"), 'sw-activated fallback hook missing');
assert(routing.includes("navigator.serviceWorker.addEventListener('controllerchange'"), 'controllerchange fallback hook missing');
assert(routing.includes('window.setTimeout(replaceNow, 140)'), 'native first update-navigation timer missing');
assert(routing.includes("forceFreshNavigation('update-click-fallback')"), 'delayed update-click fallback missing');
assert(routing.includes('updateWasApproved'), 'PWA reload guard must require confirmed update state');

const adminStart = app.indexOf('const adminFeatureFiles = [');
const adminEnd = app.indexOf('];', adminStart);
const adminGroup = app.slice(adminStart, adminEnd);
assert(adminStart >= 0 && adminEnd > adminStart, 'admin feature group missing');
assert(adminGroup.includes('"admin-fhb-calibration.js"'), 'admin FHB calibration module missing');
assert(adminGroup.includes('"brusy-fhb-correction.js"'), 'Brusy FHB builder must load with Admin even before Calculators');

assert(fhb.includes('<details class="rakCorrectionMachineFold" data-rak-correction-group="frezky">'), 'native frezky fold missing');
assert(fhb.includes('<details class="rakCorrectionMachineFold" data-rak-correction-group="brusy">'), 'native brusy fold missing');
assert(fhb.includes('<summary><span>Brusy FHB · TBKR01 + TBKR07</span><small>nastavení brusů</small>'), 'Brusy summary is wrong');
assert(fhb.includes('window.buildAdminBrusFhbCorrectionHtml()'), 'Brusy must be composed by direct builder call during render');
assert(!fhb.includes('adminFhbCalibrationSoon'), 'Brusy placeholder must stay removed');
assert(!fhb.toLowerCase().includes('připravujeme'), 'Brusy must not say preparing');
assert(!fhb.includes('foldBrusyTailIntoSection'), 'post-render DOM moving must stay removed');
assert(!fhb.includes('scheduleBrusyTailFold'), 'post-render retry race must stay removed');

assert(brusFhb.includes('window.buildAdminBrusFhbCorrectionHtml = buildAdminHtml'), 'real Brusy builder export missing');
assert(brusFhb.includes('data-rak-brusy-real-section="1"'), 'real Brusy marker missing');
assert(brusFhb.includes('data-brus-fhb-cal-field="beforeLeft"'), 'paired Brusy left-before field missing');
assert(brusFhb.includes('data-brus-fhb-cal-field="beforeRight"'), 'paired Brusy right-before field missing');
assert(brusFhb.includes('data-brus-fhb-cal-field="afterLeft"'), 'paired Brusy left-after field missing');
assert(brusFhb.includes('data-brus-fhb-cal-field="afterRight"'), 'paired Brusy right-after field missing');
assert(brusFhb.includes('data-brus-fhb-cal-field="correction"'), 'paired Brusy correction field missing');
assert(brusFhb.includes('Uložit obě vřetena'), 'paired Brusy save action missing');
assert(brusFhb.includes('function readAdminRecords()'), 'paired Brusy reader missing');
assert(brusFhb.includes('settings.records = pair.records.concat(settings.records)'), 'paired Brusy records must be persisted together');
assert(brusFhb.includes('batchId'), 'paired Brusy history grouping missing');
assert(!brusFhb.includes('data-brus-fhb-cal-field="side"'), 'old one-side Brusy selector must be removed');
assert(!brusFhb.includes('data-brus-fhb-cal-field="c"'), 'old C1/C2 Brusy selector must be removed from Admin form');
assert(brus158.includes('function removeAdminSideWarning()'), 'admin side-warning cleanup missing');
assert(brus158.includes(".adminBrusFhbCalibration .brus157AdminWarning"), 'admin side-warning cleanup must target Brusy calibration');
assert(brus158.includes('node.remove()'), 'admin side-warning must be physically removed after render');

const context = {
  window: {
    buildAdminBrusFhbCorrectionHtml: () => '<div class="adminBrusFhbCalibration" data-rak-brusy-real-section="1"><div class="appMenuSubTitle">Brusy · FHB</div><div data-real-brusy-form="1">REAL</div></div>'
  },
  console,
  Date,
  Math,
  Intl
};
vm.createContext(context);
vm.runInContext(fhb, context, { filename: 'admin-fhb-calibration.js' });
const correctionHtml = String(context.window.buildAdminFhbCorrectionCalibrationHtml());
const brusyToken = '<details class="rakCorrectionMachineFold" data-rak-correction-group="brusy">';
const brusyOpen = correctionHtml.indexOf(brusyToken);
const brusyClose = correctionHtml.indexOf('</details>', brusyOpen);
const realMarker = correctionHtml.indexOf('data-rak-brusy-real-section="1"');
assert(brusyOpen >= 0, 'rendered Brusy details missing');
assert(!correctionHtml.slice(brusyOpen, correctionHtml.indexOf('>', brusyOpen) + 1).includes(' open'), 'Brusy details must be collapsed by default');
assert(realMarker > brusyOpen && realMarker < brusyClose, 'real Brusy section must be owned by Brusy details');
assert.equal(correctionHtml.indexOf('data-rak-brusy-real-section="1"', brusyClose), -1, 'real Brusy marker must not exist outside Brusy details');
assert.equal((correctionHtml.match(/data-rak-correction-group=/g) || []).length, 2, 'correction settings must have exactly two machine folds');

const correctionCall = adminRenderer.indexOf("(typeof buildAdminFhbCorrectionCalibrationHtml === 'function' ? buildAdminFhbCorrectionCalibrationHtml()");
const backAfterCorrection = adminRenderer.indexOf('data-admin-action="back-admin">Zpět</button>', correctionCall);
assert(correctionCall >= 0, 'correction-settings renderer call missing');
assert(backAfterCorrection > correctionCall, 'Back button must stay after complete correction-settings output');
assert(routing.includes('rakCorrectionMachineFold>summary:after{content:"Rozbalit"'), 'fold control label missing');

for (const prop of ['width:46px !important', 'height:46px !important', 'min-width:46px !important', 'max-width:46px !important']) {
  assert(compactCss.includes(prop), `update logo missing ${prop}`);
}
assert(bottomNavCss.includes('--bottom-nav-h:56px;'), 'canonical bottom-nav height missing');
assert(viewportClean.includes('height:100dvh !important;') && viewportClean.includes('overflow-y:auto !important;'), 'canonical mobile Home scroll owner missing');
assert(viewportClean.includes('grid-template-rows:repeat(4, auto) !important;'), 'Dashboard four-row overflow guard missing');
assert(!viewportClean.includes('--rak-nav-ios-start-bottom'), 'dead iOS start-bottom alias returned');
assert(!viewportClean.includes('--rak-start-viewport-h:100dvh'), 'dead early viewport value returned');
assert.equal((viewportClean.match(/@supports \(-webkit-touch-callout:none\)/g) || []).length, 1, 'duplicate iOS @supports viewport owner returned');
assert(!viewportClean.includes('html,\nbody{\n  background-color:#07111c !important;\n}'), 'duplicate html/body background owner returned');

assert(pkg.scripts.check.includes('node --check brusy-fhb-v157.js'), 'Brusy v157 syntax check must run');
assert(pkg.scripts.check.includes('node --check brusy-fhb-v158.js'), 'Brusy v158 syntax check must run');
assert(pkg.scripts.check.includes('tools/dashboard-css-overlap-audit.mjs'), 'Dashboard overlap audit must run in npm check');
assert(pkg.scripts.check.includes('tools/v1593-smoke.mjs'), 'v1.5.93 smoke must run in npm check');
assert(!pkg.scripts.check.includes('tools/v1592-smoke.mjs'), 'old v1.5.92 smoke must not gate the new release');
assert(dashboardAudit.includes("for (const forbidden of ['.bottomNav', '#appMenuBody', '.adminRotation'])"), 'Dashboard ownership boundary guard missing');

console.log('[v1.5.93-smoke] OK iOS update reload + paired Brusy calibration + native folds + Point 4 duplicate viewport cleanup');
