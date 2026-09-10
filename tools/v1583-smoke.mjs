import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const appJs = fs.readFileSync('app.js', 'utf8');
const helper = fs.readFileSync('rak-v1583-more-fix.js', 'utf8');
const navigation = fs.readFileSync('app-navigation.js', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const sw = fs.readFileSync('sw.js', 'utf8');

const versionAtLeast = (actual, minimum) => {
  const a = String(actual || '').split('.').map((part) => Number(part) || 0);
  const b = String(minimum || '').split('.').map((part) => Number(part) || 0);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return true;
};

assert.equal(versionAtLeast(pkg.version, '1.5.83'), true, 'package version must be at least 1.5.83');
assert.match(appJs, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.\d+["']/, 'app cache version must be valid 1.5.x');
assert.match(appJs, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.\d+["']/, 'update build must be valid 1.5.x');
assert.match(appJs, /["']rak-v1583-more-fix\.js["']/, 'v1.5.83 helper must be loaded');
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.\d+["']/, 'service worker cache must be valid 1.5.x');
assert.match(navigation, /if\s*\(id\s*===\s*["']menu["']\)\s*\{\s*openAppMenu\(["']menu["']\);/s, 'showPage(menu) must own menu rendering');

let showCalls = 0;
let openCalls = 0;
let activeCalls = 0;
let moreMetricCalls = 0;
let fixedMetricCalls = 0;
let indicatorCalls = 0;
const sandbox = {
  window: {
    __rakApplyBottomNavMoreHardFix() { moreMetricCalls += 1; },
    __rakApplyFixedBottomNavMetricsNow() { fixedMetricCalls += 1; }
  },
  showPage(id) {
    assert.equal(id, 'menu');
    showCalls += 1;
  },
  openAppMenu(id) {
    assert.equal(id, 'menu');
    openCalls += 1;
  },
  setBottomNavActive(id) {
    assert.equal(id, 'menu');
    activeCalls += 1;
  },
  scheduleBottomNavActiveIndicator(reason) {
    assert.equal(reason, 'v1.5.83-more-open');
    indicatorCalls += 1;
  },
  requestAnimationFrame(callback) { callback(); },
  setTimeout(callback) { callback(); }
};
vm.createContext(sandbox);
vm.runInContext(helper, sandbox, { filename: 'rak-v1583-more-fix.js' });
assert.equal(typeof sandbox.window.toggleAppMenu, 'function', 'helper must override toggleAppMenu');
sandbox.window.toggleAppMenu();
assert.equal(showCalls, 1, 'one tap must call showPage(menu) exactly once');
assert.equal(openCalls, 0, 'normal path must not call openAppMenu directly');
assert.equal(activeCalls, 0, 'showPage owns bottom-nav activation on normal path');
assert.equal(moreMetricCalls, 1, 'Více button geometry must settle once after opening');
assert.equal(fixedMetricCalls, 1, 'fixed bottom-nav metrics must settle once after opening');
assert.equal(indicatorCalls, 1, 'active indicator must be refreshed after opening');
assert.equal(sandbox.window.__rakV1583MoreNavigationFixInstalled, true, 'fix marker must be set');

console.log('[v1.5.83-smoke] OK Více opens in one render pass and bottom navigation settles after opening');
