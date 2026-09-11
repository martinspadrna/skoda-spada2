import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const app = read('app.js');
const pkg = JSON.parse(read('package.json'));
const sw = read('sw.js');
const routing = read('rak-feature-routing.js');
const compactCss = read('styles-rotation-summary-compact.css');
const bottomNavCss = read('styles-bottom-nav-runtime.css');

assert.equal(pkg.version, '1.5.89', 'package version must be 1.5.89');
assert.match(app, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.89["']/, 'app cache version must be 1.5.89');
assert.match(app, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.89["']/, 'app update build must be v1.5.89');
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.89["']/, 'service worker cache must be v1.5.89');
assert.match(app, /RAK_BOOT_V2_ENABLED\s*=\s*true/, 'Boot v2 must stay enabled');

// Point 3 must remain intact.
assert(sw.includes('const PREWARM_CACHE = `rotace-prewarm-${CACHE_VERSION}`'), 'isolated prewarm cache missing');
assert(sw.includes('async function staticResponse(request)'), 'cache-first static response missing');
assert(sw.includes("strategy: 'navigation-network-first;build-static-cache-first;isolated-prewarm'"), 'PWA strategy status missing');
assert(sw.includes("'./rak-feature-routing.js?v=1.5.89'"), 'warm-start routing asset must use current version');
assert(sw.includes("'./core.js?v=1.5.89'"), 'warm-start core asset must use current version');
assert(sw.includes("if (request.mode === 'navigate')"), 'navigation network-first path missing');

// Stabilizační opravy potvrzené na iPhonu musí zůstat.
assert(routing.includes('clearVacationReportStateWhenLeaving'), 'vacation report reopen guard missing');
assert(routing.includes('runSafeManualSync'), 'safe manual sync missing');
assert(routing.includes("ensureFeatureWithAuthOrder('sync')"), 'manual sync must ensure sync feature first');

// Korekce: oba přehledy musí být opravdu složené, ne jen první nalezená sekce.
assert(routing.includes("data-rak-correction-group=\"frezky\""), 'frezky fold lookup missing');
assert(routing.includes("data-rak-correction-group=\"brusy\""), 'brusy fold lookup missing');
assert(routing.includes("makeCorrectionFold('frezky', 'Frézky FHB · MFKF06 + MFKF10'"), 'frezky fold label missing');
assert(routing.includes("makeCorrectionFold('brusy', 'Brusy FHB · TBKR01 + TBKR07'"), 'brusy fold label missing');
assert(routing.includes('const complete = !!(frezkyFold && brusyFold);'), 'fold completion must require both groups');
assert(routing.includes("root.dataset.rakV1589CorrectionFolded = complete ? '1' : '0';"), 'fold completion state missing');
assert(routing.includes('if (attempt < 32) setTimeout(run, 125);'), 'fold retry guard missing');
assert(routing.includes("String(menuBody.dataset.adminView || '') === 'correction-settings'"), 'rerendered correction view must be re-folded');

// Requested visual polish.
for (const prop of ['width:41px !important', 'height:41px !important', 'min-width:41px !important', 'max-width:41px !important']) {
  assert(compactCss.includes(prop), `update logo missing ${prop}`);
}
assert(compactCss.includes('object-fit:contain !important'), 'update logo must remain fully visible');

// Point 4 / pass 1: bottom-nav CSS keeps only the actually winning 56px runtime value.
assert(bottomNavCss.includes('Point 4 / průchod 1'), 'Point 4 CSS cleanup marker missing');
assert(bottomNavCss.includes('--bottom-nav-h:56px;'), 'canonical bottom-nav height missing');
assert(!bottomNavCss.includes('--bottom-nav-h:64px;'), 'superseded 64px bottom-nav root returned');
assert.equal((bottomNavCss.match(/--rak-fixed-bottom-space:/g) || []).length, 1, 'bottom-nav fixed space should have one owner in runtime file');
assert(bottomNavCss.includes('contain:layout paint style !important'), 'bottom-nav runtime containment missing');
assert(bottomNavCss.includes('touch-action:manipulation !important'), 'bottom-nav touch guard missing');

console.log('[v1.5.89-smoke] OK logo 41px + both correction folds + Point 4 bottom-nav CSS cleanup + Point 3 warm-start retained');
