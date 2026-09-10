import assert from 'node:assert/strict';
import fs from 'node:fs';

const appJs = fs.readFileSync('app.js', 'utf8');
const helper = fs.readFileSync('rak-runtime-stability.js', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const sw = fs.readFileSync('sw.js', 'utf8');

assert.equal(pkg.version, '1.5.85', 'package version must be 1.5.85');
assert.match(appJs, /RAK_MODULE_CACHE_VERSION\s*=\s*["']1\.5\.85["']/, 'app cache version must be 1.5.85');
assert.match(appJs, /RAK_DEV_UPDATE_BUILD\s*=\s*["']v1\.5\.85["']/, 'update build must be v1.5.85');
assert.match(sw, /CACHE_VERSION\s*=\s*["']v1\.5\.85["']/, 'service worker cache must be v1.5.85');
assert.match(appJs, /["']rak-runtime-stability\.js["']/, 'consolidated stability module must be loaded');
assert.doesNotMatch(appJs, /["']rak-v1582-fixes\.js["']|["']rak-v1583-more-fix\.js["']|["']rak-v1584-fixes\.js["']/, 'temporary hotfix layers must no longer load at runtime');

assert.match(helper, /rakUpdateToast\{z-index:2147483600!important;/, 'update toast must stay above Rotace dock');
assert.match(helper, /width:42px!important;[\s\S]*height:42px!important;/, 'update logo badge must be square');
assert.match(helper, /rakRuntimeUpdateLogo[\s\S]*width:32px!important;[\s\S]*height:32px!important;[\s\S]*object-fit:contain!important;/, 'update logo must render fully without crop/stretch');
assert.match(helper, /sameValues\(select, values\)/, 'shift index options must avoid unnecessary DOM rewrites');
assert.match(helper, /allIndexes\.filter\(\(index\) => index === current \|\| !otherUsed\.has\(index\)\)/, 'used shift indexes must be filtered');
assert.match(helper, /allIndexes\.find\(\(index\) => !otherUsed\.has\(index\)\)/, 'new shift row must choose first unused index');
assert.match(helper, /record\.addedNodes\.forEach\(scanNode\)/, 'safe observer must inspect added nodes');
assert.match(helper, /removedNodeHasShiftRow/, 'safe observer must only resync on removed shift rows');

assert.match(helper, /value\.startsWith\('TBK'\).*return 'TBK'/s, 'TBK machines must remain grouped');
assert.match(helper, /value\.startsWith\('MSK'\).*return 'MSK'/s, 'MSK machines must remain grouped');
assert.match(helper, /value\.startsWith\('MFK'\).*return 'MFK'/s, 'MFK machines must remain grouped');
assert.match(helper, /addMachine\('TNKS01', person, 0\.5\)[\s\S]*addMachine\('TPKW01', person, 0\.5\)/, 'press split accounting must remain 0.5 + 0.5');
assert.match(helper, /id = 'rakRuntimeAdminMachineSummary'/, 'admin grouped summary must use a contained host');
assert.match(helper, /buildGroupedMachineSummary\(state\.month, state\.monthKey, \{ open: wasOpen, admin: true \}\)/, 'admin summary must start collapsed and preserve its open state');
assert.match(helper, /overflow-x:auto!important;/, 'wide grouped table must scroll inside its own panel');

assert.match(helper, /showPage\('menu'\);[\s\S]*settleBottomNavAfterMore\(\);[\s\S]*return;/, 'Více must use one showPage render pass');
assert.match(helper, /__rakRuntimeStabilityInstalled = true/, 'runtime stability install marker must exist');

console.log('[v1.5.85-smoke] OK consolidated runtime layer + full update logo + report/rotation/more regressions locked');
