import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const app = read('app.js');
const pkg = JSON.parse(read('package.json'));
const sw = read('sw.js');
const routing = read('rak-feature-routing.js');
const runtime = read('rak-runtime-stability.js');
const compactCss = read('styles-rotation-summary-compact.css');

function group(name) {
  const match = app.match(new RegExp('const\\s+' + name + '\\s*=\\s*\\[(.*?)\\];', 's'));
  assert(match, `missing ${name}`);
  return Array.from(match[1].matchAll(/["']([^"']+\\.js)["']/g)).map((item) => item[1]);
}

assert.equal(pkg.version, '1.5.88', 'package version must be 1.5.88');
assert.match(app, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.88["']/, 'app cache version must be 1.5.88');
assert.match(app, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.88["']/, 'app update build must be v1.5.88');
assert.match(app, /RAK_BOOT_V2_ENABLED\s*=\s*true/, 'Boot v2 must remain enabled');
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.88["']/, 'service worker cache must be v1.5.88');

const startup = group('startupFiles');
const rotation = group('rotationFeatureFiles');
const calculators = group('calculatorFeatureFiles');
const sync = group('syncFeatureFiles');
const menu = group('menuFeatureFiles');
const admin = group('adminFeatureFiles');

for (const file of ['core.js','qr.js','dashboard.js','app-navigation.js','app-bottom-nav.js','app-actions.js','app-pwa-connectivity.js','app-home-boot.js','rak-runtime-stability.js','rak-mobile-layout-guard.js','rak-feature-routing.js']) {
  assert(startup.includes(file), `${file} must remain in fast startup shell`);
}
for (const file of ['rotace.js','stats.js','soustruhy.js','brusy.js','app-menu.js','supabase-bridge.js','app-rotation-sync.js','admin-rotation-generator.js','admin-rotation-generator-wizard.js']) {
  assert(!startup.includes(file), `${file} must not block Boot v2 startup`);
}
for (const file of ['rotace.js','stats.js','rotation-tasks.js','app-rotation-controls.js']) assert(rotation.includes(file), `${file} missing from rotation feature`);
for (const file of ['soustruhy.js','brusy.js','brusy-fhb-correction.js']) assert(calculators.includes(file), `${file} missing from calculator feature`);
for (const file of ['supabase-bridge.js','app-rotation-sync.js']) assert(sync.includes(file), `${file} missing from sync feature`);
for (const file of ['app-menu.js','app-menu-pages.js','app-menu-shift-report.js','rak-shift-report.js','rak-vacation-report.js','app-admin-unlock.js']) assert(menu.includes(file), `${file} missing from menu feature`);
for (const file of ['admin-rotation-editor.js','admin-rotation-generator.js','admin-rotation-generator-wizard.js','app-menu-admin-renderer.js','app-menu-admin-storage.js','admin-service-usage.js','export.js','app-excel-import.js']) assert(admin.includes(file), `${file} missing from admin feature`);
for (const file of ['admin-rotation-editor.js','admin-rotation-generator.js','admin-rotation-generator-wizard.js','app-menu-admin-renderer.js']) assert(!menu.includes(file), `${file} must not load merely by opening Více`);

assert.match(app, /admin:\s*Object\.freeze\(\{\s*files:\s*adminFeatureFiles,\s*dependencies:\s*Object\.freeze\(\["menu",\s*"sync"\]\)/s, 'admin feature must depend on menu + sync');
assert.match(app, /await\s+loadFiles\(startupFiles\)/, 'startup must await only fast startup files');
assert.doesNotMatch(app, /^\s*await\s+Promise\.all\(deferredFiles\.map\(loadScript\)\)/m, 'full deferred manifest must stay non-executable');
assert.match(app, /requestIdleCallback\(startSync,\s*\{\s*timeout:\s*1200\s*\}\)/, 'background sync should not compete with first Home paint');
assert.match(app, /setTimeout\(startSync,\s*450\)/, 'fallback sync delay must remain gentle');

assert.match(routing, /key === 'menu' \|\| key === 'admin'/, 'menu/admin must preserve sync-first auth ordering');
assert.match(routing, /rakEnsureFeature\('sync'\)\.then\(\(\) => window\.rakEnsureFeature\(key\)\)/, 'auth order must load sync before menu/admin');
assert.match(routing, /rakVacationReportOpen\s*=\s*'0'/, 'leaving menu must clear stale vacation report state');
assert.match(routing, /data-admin-action="vacation-report"/, 'vacation report entry must have a stable capture route');
assert.match(routing, /RakVacationReport\.open/, 'vacation report must be reopenable through its public API');
assert.match(routing, /__rakDashboardManualSyncStateV1588/, 'manual sync state must live on window, outside TDZ');
assert.match(routing, /window\.runDashboardManualSync\s*=\s*runSafeManualSync/, 'public dashboard sync must use safe implementation');
assert.match(routing, /data-admin-action="service-sync-now"/, 'service manual sync must be captured safely');
assert.match(routing, /Frézky FHB · MFKF06 \+ MFKF10/, 'correction settings must have a named milling/FHB fold');
assert.match(routing, /Brusy FHB/, 'correction settings must have a named grinding fold');
assert.match(routing, /details\.open\s*=\s*false/, 'correction machine folds must start collapsed');
assert.doesNotMatch(routing, /new\s+MutationObserver/, 'v1.5.88 routing fixes must not add permanent MutationObserver overhead');
assert.match(routing, /scheduleIdle\(startBackgroundWarmup,\s*900,\s*350\)/, 'feature warmup must wait for idle after Home');
assert.match(routing, /scheduleIdle\(\(\) => \{[\s\S]*ensureFeatureWithAuthOrder\('admin'\)[\s\S]*\},\s*3600,\s*2400\)/, 'admin warmup must be last and delayed');
assert.match(routing, /event\.stopImmediatePropagation\(\)/, 'first lazy click must still be safely held');
assert.match(routing, /el\.click\(\)/, 'held navigation click must replay after feature load');
assert.doesNotMatch(routing, /pointer-events\s*:\s*none/i, 'loading state must not suppress Safari click delivery');

assert.match(compactCss, /width:60px\s*!important;/, 'name column must remain compact');
assert.match(compactCss, /background:#1b2020\s*!important;/, 'name column must remain opaque');
assert.match(compactCss, /nth-child\(n\+4\)[\s\S]*width:50px\s*!important;/, 'machine columns must remain compact');
assert.match(compactCss, /rakUpdateToast \.rakUpdateToastBadge\s*\{[\s\S]*padding:2px\s*!important;/, 'update badge padding must allow larger logo');
assert.match(compactCss, /rakRuntimeUpdateLogo[\s\S]*width:38px\s*!important;[\s\S]*height:38px\s*!important;[\s\S]*object-fit:contain\s*!important;/, 'update logo must be 38px and uncropped');

assert.match(sw, /const\s+PREWARM_CACHE\s*=\s*`rotace-prewarm-\$\{CACHE_VERSION\}`/, 'PWA must use isolated prewarm cache');
assert.match(sw, /const\s+WARM_START\s*=\s*\[/, 'PWA warm-start manifest missing');
for (const asset of ['./app.js?v=1.5.1','./core.js?v=1.5.88','./dashboard.js?v=1.5.88','./rak-feature-routing.js?v=1.5.88','./styles-dashboard-fit.css','./styles-release-polish.css']) {
  assert(sw.includes(`'${asset}'`), `warm-start asset missing: ${asset}`);
}
assert.match(sw, /__rak_prewarm__/, 'prewarm keys must be isolated from real request URLs');
assert.match(sw, /async function promotePrewarm\(/, 'prewarm promotion on activation missing');
assert.match(sw, /event\.respondWith\(staticResponse\(request\)\)/, 'static assets must use cache-first response');
assert.match(sw, /cache:\s*'no-cache'/, 'static cache miss must revalidate network');
assert.match(sw, /request\.mode === 'navigate'[\s\S]*navigationResponse\(request, event\)/, 'navigation must remain network-first');
assert.match(sw, /strategy:\s*'navigation-network-first;build-static-cache-first;isolated-prewarm'/, 'cache strategy status must be explicit');
assert(sw.includes("'./assets/rak-login-crab.png'"), 'base login mascot must remain precached');
assert(!sw.includes('rak-login-crab-step.png'), 'step animation must stay out of core/prewarm');
assert(!sw.includes('rak-login-crab-tap.png'), 'tap animation must stay out of core/prewarm');

assert.match(runtime, /record\.addedNodes\.forEach\(scanNode\)/, 'safe Report směny observer must remain');
assert.match(runtime, /value\.startsWith\('TBK'\).*return 'TBK'/s, 'TBK grouping must remain');
assert.match(runtime, /showPage\('menu'\);[\s\S]*settleBottomNavAfterMore\(\);[\s\S]*return;/, 'Více runtime single-pass protection must remain');

console.log('[v1.5.88-smoke] OK PWA warm-start cache + vacation reopen + safe manual sync + folded correction settings + larger update logo');
