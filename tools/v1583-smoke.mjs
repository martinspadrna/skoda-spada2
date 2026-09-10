import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const appJs = fs.readFileSync('app.js', 'utf8');
const helper = fs.readFileSync('rak-v1583-more-fix.js', 'utf8');
const navigation = fs.readFileSync('app-navigation.js', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const sw = fs.readFileSync('sw.js', 'utf8');

assert.equal(pkg.version, '1.5.83', 'package version must be 1.5.83');
assert.match(appJs, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.83["']/, 'app cache version must be 1.5.83');
assert.match(appJs, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.83["']/, 'update build must be v1.5.83');
assert.match(appJs, /["']rak-v1583-more-fix\.js["']/, 'v1.5.83 helper must be loaded');
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.83["']/, 'service worker cache must be v1.5.83');
assert.match(navigation, /if\s*\(id\s*===\s*["']menu["']\)\s*\{\s*openAppMenu\(["']menu["']\);/s, 'showPage(menu) must own menu rendering');

let showCalls = 0;
let openCalls = 0;
let activeCalls = 0;
const sandbox = {
  window: {},
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
  }
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(helper, sandbox, { filename: 'rak-v1583-more-fix.js' });
assert.equal(typeof sandbox.window.toggleAppMenu, 'function', 'helper must override toggleAppMenu');
sandbox.window.toggleAppMenu();
assert.equal(showCalls, 1, 'one tap must call showPage(menu) exactly once');
assert.equal(openCalls, 0, 'normal path must not call openAppMenu directly');
assert.equal(activeCalls, 0, 'showPage owns bottom-nav activation on normal path');
assert.equal(sandbox.window.__rakV1583MoreNavigationFixInstalled, true, 'fix marker must be set');

console.log('[v1.5.83-smoke] OK Více opens in one render pass; no duplicate menu render on normal path');
