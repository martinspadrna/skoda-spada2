#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const MAX_EAGER_JS_BYTES = 2_200_000;

function parseArray(name) {
  const match = appSource.match(new RegExp('const\\s+' + name + '\\s*=\\s*\\[([\\s\\S]*?)\\];'));
  if (!match) throw new Error('[startup-budget] chybí pole ' + name + ' v app.js');
  return Array.from(match[1].matchAll(/["']([^"']+\.js)["']/g), (item) => item[1]);
}

function unique(values) {
  return Array.from(new Set(values));
}

function bytesFor(files) {
  return files.reduce((sum, file) => {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) throw new Error('[startup-budget] chybí soubor ' + file);
    return sum + fs.statSync(full).size;
  }, 0);
}

function formatBytes(value) {
  const kb = value / 1024;
  return kb >= 1024 ? (kb / 1024).toFixed(2) + ' MB' : kb.toFixed(0) + ' kB';
}

const critical = parseArray('criticalFiles');
const deferred = parseArray('deferredFiles');
const lazyMenu = parseArray('lazyMenuFiles');
const lazyAdmin = parseArray('lazyAdminFiles');
const lazy = new Set([...lazyMenu, ...lazyAdmin]);
const eager = unique([...critical, ...deferred.filter((file) => !lazy.has(file))]);
const eagerBytes = bytesFor(eager);
const lazyBytes = bytesFor(unique([...lazyMenu, ...lazyAdmin]));

if (eagerBytes > MAX_EAGER_JS_BYTES) {
  throw new Error('[startup-budget] eager JS ' + formatBytes(eagerBytes) + ' překročil limit ' + formatBytes(MAX_EAGER_JS_BYTES));
}

for (const file of lazyMenu) {
  if (!deferred.includes(file)) throw new Error('[startup-budget] lazy menu soubor ' + file + ' musí zůstat v deferred inventáři pro smoke testy');
  if (eager.includes(file)) throw new Error('[startup-budget] ' + file + ' se omylem vrátil do běžného startu');
}
for (const file of lazyAdmin) {
  if (deferred.includes(file) && eager.includes(file)) throw new Error('[startup-budget] admin-only soubor ' + file + ' se omylem vrátil do běžného startu');
}

console.log('[startup-budget] OK eager=' + formatBytes(eagerBytes) + ' lazy=' + formatBytes(lazyBytes) + ' eagerFiles=' + eager.length);
