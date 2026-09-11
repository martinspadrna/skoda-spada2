import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const app = read('app.js');
const pkg = JSON.parse(read('package.json'));
const sw = read('sw.js');
const routing = read('rak-feature-routing.js');
const fhb = read('admin-fhb-calibration.js');
const compactCss = read('styles-rotation-summary-compact.css');
const bottomNavCss = read('styles-bottom-nav-runtime.css');
const viewportCss = read('styles-viewport-polish.css');

assert.equal(pkg.version, '1.5.90', 'package version must stay 1.5.90 for this hotfix');
assert.match(app, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.90["']/, 'app cache version must be 1.5.90');
assert.match(app, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.90["']/, 'app update build must be v1.5.90');
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.90["']/, 'service worker cache must be v1.5.90');
assert.match(app, /RAK_BOOT_V2_ENABLED\s*=\s*true/, 'Boot v2 must stay enabled');

// Point 3 warm-start/cache must remain intact.
assert(sw.includes('const PREWARM_CACHE = `rotace-prewarm-${CACHE_VERSION}`'), 'isolated prewarm cache missing');
assert(sw.includes('async function staticResponse(request)'), 'cache-first static response missing');
assert(sw.includes("strategy: 'navigation-network-first;build-static-cache-first;isolated-prewarm'"), 'PWA strategy status missing');
assert(sw.includes("'./rak-feature-routing.js?v=1.5.90'"), 'warm-start routing asset must use current version');
assert(sw.includes("'./core.js?v=1.5.90'"), 'warm-start core asset must use current version');
assert(sw.includes("if (request.mode === 'navigate')"), 'navigation network-first path missing');

// iPhone-confirmed flow fixes must stay.
assert(routing.includes('clearVacationReportStateWhenLeaving'), 'vacation report reopen guard missing');
assert(routing.includes('runSafeManualSync'), 'safe manual sync missing');
assert(routing.includes("ensureFeatureWithAuthOrder('sync')"), 'manual sync must ensure sync feature first');

// Correction settings: native folds + Brusy own everything that follows them before Back.
assert(fhb.includes('<details class="rakCorrectionMachineFold" data-rak-correction-group="frezky">'), 'native frezky fold missing');
assert(fhb.includes('<details class="rakCorrectionMachineFold" data-rak-correction-group="brusy">'), 'native brusy fold missing');
assert(fhb.includes('<summary><span>Frézky FHB · MFKF06 + MFKF10</span>'), 'frezky fold summary missing');
assert(fhb.includes('<summary><span>Brusy FHB · TBKR01 + TBKR07</span><small>nastavení brusů</small>'), 'brusy fold summary must no longer say preparing');
assert(!fhb.includes('<small>připravujeme</small>'), 'Brusy must not say preparing');
assert(fhb.includes('function foldBrusyTailIntoSection()'), 'Brusy tail ownership helper missing');
assert(fhb.includes("node.matches('.appMenuBack, [data-admin-action=\"back-admin\"]')"), 'Back button must stay outside Brusy fold');
assert(fhb.includes('foldBody.appendChild(node);'), 'content below Brusy must move into Brusy body');
assert(fhb.includes('scheduleBrusyTailFold();'), 'Brusy tail folding must run after every render');
assert(routing.includes('rakCorrectionMachineFold>summary:after{content:"Rozbalit"'), 'fold control label missing');

// Requested update-logo polish remains.
for (const prop of ['width:46px !important', 'height:46px !important', 'min-width:46px !important', 'max-width:46px !important']) {
  assert(compactCss.includes(prop), `update logo missing ${prop}`);
}
assert(compactCss.includes('width:48px !important') && compactCss.includes('flex:0 0 48px !important'), 'update badge must grow with logo');
assert(compactCss.includes('object-fit:contain !important'), 'update logo must remain fully visible');

// Point 4 passes: one canonical nav height, no superseded Home block, and viewport fallbacks aligned to 56px.
assert(bottomNavCss.includes('Point 4 / průchod 1'), 'Point 4 bottom-nav cleanup marker missing');
assert(bottomNavCss.includes('--bottom-nav-h:56px;'), 'canonical bottom-nav height missing');
assert(!bottomNavCss.includes('--bottom-nav-h:64px;'), 'superseded 64px bottom-nav root returned');
assert(viewportCss.includes('Point 4 / průchod 3'), 'viewport cleanup pass 3 marker missing');
assert(viewportCss.includes('height:100dvh !important;') && viewportCss.includes('overflow-y:auto !important;'), 'canonical mobile Home scroll owner missing');
assert(viewportCss.includes('grid-template-rows:repeat(4, auto) !important;'), 'Dashboard row sizing guard missing');
assert(!viewportCss.includes('--rak-nav-ios-start-bottom: max('), 'superseded initial iOS nav-bottom value returned');
assert(!viewportCss.includes('var(--bottom-nav-h, 64px)'), 'old 64px viewport fallback returned');
assert(viewportCss.includes('var(--bottom-nav-h, 56px)'), 'canonical 56px viewport fallback missing');

console.log('[v1.5.90-smoke] OK Brusy tail ownership + Point 4 viewport cleanup pass 3 + Point 3 retained');
