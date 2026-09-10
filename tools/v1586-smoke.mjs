import assert from 'node:assert/strict';
import fs from 'node:fs';

const appJs = fs.readFileSync('app.js', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const sw = fs.readFileSync('sw.js', 'utf8');
const styles = fs.readFileSync('styles.css', 'utf8');
const compact = fs.readFileSync('styles-rotation-summary-compact.css', 'utf8');
const layoutGuard = fs.readFileSync('rak-mobile-layout-guard.js', 'utf8');
const deferTool = fs.readFileSync('tools/defer-heavy-libs.mjs', 'utf8');

assert.equal(pkg.version, '1.5.86', 'package version must be 1.5.86');
assert.match(appJs, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.86["']/, 'app cache version must be 1.5.86');
assert.match(appJs, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.86["']/, 'update build must be v1.5.86');
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.86["']/, 'service worker cache must be v1.5.86');

assert.match(appJs, /["']rak-mobile-layout-guard\.js["']/, 'mobile layout guard must load');
assert.match(layoutGuard, /horizontalOverflowPx/, 'layout guard must measure horizontal overflow');
assert.match(layoutGuard, /navTooWide/, 'layout guard must check bottom navigation width');
assert.match(layoutGuard, /runRakMobileLayoutSmoke/, 'layout guard must expose manual smoke runner');
assert.match(layoutGuard, /rak:layout-warning/, 'layout guard must expose warning event');

assert.match(styles, /styles-rotation-summary-compact\.css/, 'compact rotation summary stylesheet must be imported');
assert.match(compact, /width:\s*72px\s*!important/, 'name column must be compact');
assert.match(compact, /width:\s*50px\s*!important/, 'machine columns must be compact');
assert.match(compact, /width:\s*464px\s*!important/, 'summary table must stay compact');
assert.match(compact, /overflow:\s*hidden\s*!important/, 'name cell must not widen the table');

assert.doesNotMatch(sw, /rak-login-crab-step\.png/, 'step mascot must not block service-worker install');
assert.doesNotMatch(sw, /rak-login-crab-tap\.png/, 'tap mascot must not block service-worker install');
assert.match(sw, /rak-login-crab\.png/, 'base login mascot remains available offline');

for (const dead of [
  'rak-v1582-fixes.js',
  'rak-v1583-more-fix.js',
  'rak-v1584-fixes.js',
  'tools/v1582-smoke.mjs',
  'tools/v1583-smoke.mjs',
  'tools/v1584-smoke.mjs',
  'tools/v1585-smoke.mjs'
]) {
  assert.equal(fs.existsSync(dead), false, dead + ' must be removed after consolidation');
}
assert.doesNotMatch(appJs, /rak-v1582-fixes|rak-v1583-more-fix|rak-v1584-fixes/, 'retired hotfixes must not be runtime dependencies');

assert.match(pkg.scripts['vercel-build'], /tools\/defer-heavy-libs\.mjs/, 'Vercel build must still strip heavyweight eager libraries before checks');
assert.match(deferTool, /xlsx\.full\.min\.js/, 'XLSX build-time deferral guard must remain');
assert.match(deferTool, /jszip\.min\.js/, 'JSZip build-time deferral guard must remain');

console.log('[v1.5.86-smoke] OK compact rotation summary + lighter PWA install + mobile layout guard + retired hotfix cleanup');
