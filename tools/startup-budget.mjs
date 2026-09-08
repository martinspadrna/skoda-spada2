#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
// Aktuální development je ~1.46 MB eager JS. Necháváme jen malou rezervu,
// aby se velký modul nevrátil do startu bez vědomého rozhodnutí.
const MAX_EAGER_JS_BYTES = 1_650_000;

function parseArray(name) {
  const match = appSource.match(new RegExp('const\\s+' + name + '\\s*=\\s*\\[([\\s\\S]*?)\\];'));
  if (!match) throw new Error('[startup-budget] chybí pole ' + name + ' v app.js');
  return Array.from(match[1].matchAll(/["']([^"']+\.js)["']/g), (item) => item[1]);
}

function unique(values) {
  return Array.from(new Set(values));
}

function fileBytes(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) throw new Error('[startup-budget] chybí soubor ' + file);
  return fs.statSync(full).size;
}

function bytesFor(files) {
  return files.reduce((sum, file) => sum + fileBytes(file), 0);
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
const heaviest = eager
  .map((file) => ({ file, bytes: fileBytes(file) }))
  .sort((a, b) => b.bytes - a.bytes)
  .slice(0, 8)
  .map((item) => item.file + '=' + formatBytes(item.bytes))
  .join(', ');

if (eagerBytes > MAX_EAGER_JS_BYTES) {
  throw new Error('[startup-budget] eager JS ' + formatBytes(eagerBytes) + ' překročil limit ' + formatBytes(MAX_EAGER_JS_BYTES) + '; největší: ' + heaviest);
}

for (const file of lazyMenu) {
  if (!deferred.includes(file)) throw new Error('[startup-budget] lazy menu soubor ' + file + ' musí zůstat v deferred inventáři pro smoke testy');
  if (eager.includes(file)) throw new Error('[startup-budget] ' + file + ' se omylem vrátil do běžného startu');
}
for (const file of lazyAdmin) {
  if (deferred.includes(file) && eager.includes(file)) throw new Error('[startup-budget] admin-only soubor ' + file + ' se omylem vrátil do běžného startu');
}

console.log('[startup-budget] OK eager=' + formatBytes(eagerBytes) + ' / limit=' + formatBytes(MAX_EAGER_JS_BYTES) + ' lazy=' + formatBytes(lazyBytes) + ' eagerFiles=' + eager.length);
console.log('[startup-budget] heaviest ' + heaviest);
