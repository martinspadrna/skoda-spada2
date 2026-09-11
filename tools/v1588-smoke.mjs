import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const app = read('app.js');
const pkg = JSON.parse(read('package.json'));
const sw = read('sw.js');
const routing = read('rak-feature-routing.js');
const runtime = read('rak-runtime-stability.js');
const compactCss = read('styles-rotation-summary-compact.css');

assert.equal(pkg.version, '1.5.88');
assert.match(app, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.88["']/);
assert.match(app, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.88["']/);
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.88["']/);

const startup = app.match(/const\s+startupFiles\s*=\s*\[(.*?)\];/s);
assert(startup, 'startupFiles missing');
for (const file of ['core.js','dashboard.js','app-navigation.js','app-bottom-nav.js','rak-feature-routing.js']) assert(startup[1].includes(`"${file}"`), `${file} missing from startup`);
for (const file of ['app-menu.js','supabase-bridge.js','rotace.js','brusy.js']) assert(!startup[1].includes(`"${file}"`), `${file} must stay lazy`);
assert.match(app, /admin:\s*Object\.freeze\(\{\s*files:\s*adminFeatureFiles,\s*dependencies:\s*Object\.freeze\(\["menu",\s*"sync"\]\)/s);
assert.match(app, /requestIdleCallback\(startSync,\s*\{\s*timeout:\s*1200\s*\}\)/);
assert.match(app, /setTimeout\(startSync,\s*450\)/);

for (const marker of [
  "key === 'menu' || key === 'admin'",
  "body.dataset.rakVacationReportOpen = '0'",
  'data-admin-action="vacation-report"',
  'window.RakVacationReport.open',
  '__rakDashboardManualSyncStateV1588',
  'window.runDashboardManualSync = runSafeManualSync',
  'data-admin-action="service-sync-now"',
  'Frézky FHB · MFKF06 + MFKF10',
  'Brusy FHB',
  'details.open = false',
  'scheduleIdle(startBackgroundWarmup, 900, 350)',
  "ensureFeatureWithAuthOrder('admin')"
]) assert(routing.includes(marker), `routing marker missing: ${marker}`);
assert(!routing.includes('new MutationObserver'), 'routing must not add a permanent MutationObserver');
assert(!/pointer-events\s*:\s*none/i.test(routing), 'Safari clicks must remain enabled');

assert.match(compactCss, /width:60px\s*!important;/);
assert.match(compactCss, /background:#1b2020\s*!important;/);
assert.match(compactCss, /padding:2px\s*!important;/);
assert.match(compactCss, /rakRuntimeUpdateLogo[\s\S]*width:38px\s*!important;[\s\S]*height:38px\s*!important;[\s\S]*object-fit:contain\s*!important;/);

for (const marker of [
  'const PREWARM_CACHE = `rotace-prewarm-${CACHE_VERSION}`',
  'const WARM_START = [',
  "'./app.js?v=1.5.1'",
  "'./core.js?v=1.5.88'",
  "'./dashboard.js?v=1.5.88'",
  "'./rak-feature-routing.js?v=1.5.88'",
  "'./styles-dashboard-fit.css'",
  "'./styles-release-polish.css'",
  '__rak_prewarm__',
  'async function promotePrewarm()',
  'event.respondWith(staticResponse(request))',
  "cache: 'no-cache'",
  "strategy: 'navigation-network-first;build-static-cache-first;isolated-prewarm'"
]) assert(sw.includes(marker), `SW marker missing: ${marker}`);
assert.match(sw, /request\.mode === 'navigate'[\s\S]*navigationResponse\(request, event\)/);
assert(sw.includes("'./assets/rak-login-crab.png'"));
assert(!sw.includes('rak-login-crab-step.png'));
assert(!sw.includes('rak-login-crab-tap.png'));

assert.match(runtime, /record\.addedNodes\.forEach\(scanNode\)/);
assert.match(runtime, /showPage\('menu'\);[\s\S]*settleBottomNavAfterMore\(\);[\s\S]*return;/);

console.log('[v1.5.88-smoke] OK PWA warm-start cache + vacation reopen + safe manual sync + folded correction settings + larger update logo');
