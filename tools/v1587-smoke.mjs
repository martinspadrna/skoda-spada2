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
  return Array.from(match[1].matchAll(/["']([^"']+\.js)["']/g)).map((item) => item[1]);
}

assert.equal(pkg.version, '1.5.87', 'package version must be 1.5.87');
assert.match(app, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.87["']/, 'app cache version must be 1.5.87');
assert.match(app, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.87["']/, 'app update build must be v1.5.87');
assert.match(app, /RAK_BOOT_V2_ENABLED\s*=\s*true/, 'Boot v2 must be enabled');
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.87["']/, 'service worker cache must be v1.5.87');

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
for (const file of ['app-menu.js','app-menu-pages.js','app-menu-shift-report.js','rak-shift-report.js','rak-vacation-report.js','app-admin-unlock.js']) assert(menu.includes(file), `${file} missing from lightweight menu feature`);
for (const file of ['admin-rotation-editor.js','admin-rotation-generator.js','admin-rotation-generator-wizard.js','app-menu-admin-renderer.js','app-menu-admin-storage.js','export.js','app-excel-import.js']) assert(admin.includes(file), `${file} missing from admin feature`);
for (const file of ['admin-rotation-editor.js','admin-rotation-generator.js','admin-rotation-generator-wizard.js','app-menu-admin-renderer.js']) assert(!menu.includes(file), `${file} must not load merely by opening Více`);

assert.match(app, /admin:\s*Object\.freeze\(\{\s*files:\s*adminFeatureFiles,\s*dependencies:\s*Object\.freeze\(\["menu",\s*"sync"\]\)/s, 'admin feature must depend on menu + sync modules');
assert.match(app, /await\s+loadFiles\(startupFiles\)/, 'startup must await only the fast startup group');
assert.doesNotMatch(app, /^\s*await\s+Promise\.all\(deferredFiles\.map\(loadScript\)\)/m, 'full deferred manifest must not execute during Boot v2');
assert.match(app, /window\.rakEnsureFeature\s*=\s*ensureFeature/, 'feature loader must be exposed');
assert.match(app, /requestIdleCallback\(startSync,\s*\{\s*timeout:\s*700\s*\}\)/, 'remote sync must start after interactive Home via idle scheduling');
assert.match(app, /featureState\[key\]\s*=\s*['"]ready['"]/, 'feature readiness state must be explicit');
assert.match(app, /showPage\(['"]menu['"]\);[\s\S]*__rakApplyBottomNavMoreHardFix/, 'lazy menu must restore single-pass Více behavior');

assert.match(routing, /addEventListener\(['"]pointerdown['"]/, 'pointerdown prefetch must start before click');
assert.match(routing, /data-menu-action=\\?"admin\\?"/, 'Administrace button must have its own lazy feature gate');
assert.match(routing, /feature:\s*['"]admin['"]/, 'Administrace must map to admin feature');
assert.match(routing, /event\.stopImmediatePropagation\(\)/, 'first lazy click must be held until feature is ready');
assert.match(routing, /el\.click\(\)/, 'held navigation click must replay after loading');
assert.doesNotMatch(routing, /pointer-events\s*:\s*none/i, 'loading state must not suppress Safari click delivery');
assert.match(routing, /adminBindRotationZoomGuardBootV2Stub/, 'menu must have safe admin zoom stub before lazy admin modules exist');
assert.match(routing, /function ensureFeatureWithAuthOrder\(feature\)/, 'menu/admin routes must have explicit auth ordering helper');
assert.match(routing, /key === 'menu' \|\| key === 'admin'[\s\S]*rakEnsureFeature\('sync'\)\.then\(\(\) => window\.rakEnsureFeature\(key\)\)/, 'menu/admin must load sync bridge before admin auth module');
assert.match(routing, /rakEnsureFeature\('sync'\)\.then\(\(\) => \{[\s\S]*Promise\.allSettled\(common\.map\(\(feature\) => window\.rakEnsureFeature\(feature\)\)\)/, 'background warmup must prepare sync before common navigation features');
assert.match(routing, /const common = \['menu', 'rotation', 'calculators'\]/, 'menu, rotation and calculators must all warm after Home');
assert.match(routing, /window\.rakEnsureFeature\('admin'\)/, 'admin must warm after common features');
assert.match(routing, /addEventListener\('rak:feature-ready'/, 'admin post-load hook must restore real admin guard');
assert.match(routing, /build: '1\.5\.87-hotfix2'/, 'routing hotfix marker must identify auth-order fix');

assert.match(compactCss, /width:60px\s*!important;/, 'name column must be about 40% narrower');
assert.match(compactCss, /background:#1b2020\s*!important;/, 'name column must have opaque fallback background');
assert.match(compactCss, /rakBgBase[\s\S]*rakThemeAccentStrong/, 'name column should retain themed opaque background');
assert.match(compactCss, /nth-child\(n\+4\)[\s\S]*width:50px\s*!important;/, 'machine columns must remain compact');
assert.match(compactCss, /rakRuntimeUpdateLogo[\s\S]*width:35px\s*!important;[\s\S]*height:35px\s*!important;[\s\S]*object-fit:contain\s*!important;/, 'update logo must be slightly larger and uncropped');

assert.match(runtime, /record\.addedNodes\.forEach\(scanNode\)/, 'safe Report směny observer must remain');
assert.match(runtime, /value\.startsWith\('TBK'\).*return 'TBK'/s, 'TBK grouping must remain');
assert.match(runtime, /value\.startsWith\('MSK'\).*return 'MSK'/s, 'MSK grouping must remain');
assert.match(runtime, /value\.startsWith\('MFK'\).*return 'MFK'/s, 'MFK grouping must remain');
assert.match(runtime, /showPage\('menu'\);[\s\S]*settleBottomNavAfterMore\(\);[\s\S]*return;/, 'runtime single-pass Více protection must remain');

assert(sw.includes("'./assets/rak-login-crab.png'"), 'base login mascot should stay precached');
assert(!sw.includes('rak-login-crab-step.png'), 'step animation must stay out of SW core precache');
assert(!sw.includes('rak-login-crab-tap.png'), 'tap animation must stay out of SW core precache');

console.log('[v1.5.87-smoke] OK Boot v2 + sync-first admin auth restore + background warmup + admin menu guard + compact opaque names + larger update logo');