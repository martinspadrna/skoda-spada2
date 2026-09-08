#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
// Po odložení Supabase bridge je běžný first-paint balík kolem 1 MB.
// Rezerva zůstává malá, aby se těžký modul nevrátil do startu bez vědomého rozhodnutí.
const MAX_EAGER_JS_BYTES = 1_180_000;

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
const lazyQr = parseArray('lazyQrFiles');
const idleAudits = parseArray('idleAuditFiles');
const lazySupabase = parseArray('lazySupabaseFiles');
const lazy = new Set([...lazyMenu, ...lazyAdmin, ...lazyQr, ...idleAudits, ...lazySupabase]);
const eager = unique([...critical, ...deferred.filter((file) => !lazy.has(file))]);
const eagerBytes = bytesFor(eager);
const lazyBytes = bytesFor(unique([...lazyMenu, ...lazyAdmin, ...lazyQr]));
const idleBytes = bytesFor(unique(idleAudits));
const onlineBytes = bytesFor(unique(lazySupabase));
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
for (const file of lazyQr) {
  if (!deferred.includes(file)) throw new Error('[startup-budget] QR soubor ' + file + ' musí zůstat v deferred inventáři pro smoke testy');
  if (eager.includes(file)) throw new Error('[startup-budget] QR payload ' + file + ' se omylem vrátil do běžného startu');
}
for (const file of idleAudits) {
  if (!deferred.includes(file)) throw new Error('[startup-budget] idle audit ' + file + ' musí zůstat v deferred inventáři');
  if (eager.includes(file)) throw new Error('[startup-budget] audit ' + file + ' se omylem vrátil do kritického startu');
}
for (const file of lazySupabase) {
  if (!deferred.includes(file)) throw new Error('[startup-budget] Supabase bridge ' + file + ' musí zůstat v deferred inventáři');
  if (eager.includes(file)) throw new Error('[startup-budget] Supabase bridge ' + file + ' se omylem vrátil před first paint');
}

console.log('[startup-budget] OK eager=' + formatBytes(eagerBytes) + ' / limit=' + formatBytes(MAX_EAGER_JS_BYTES) + ' lazy=' + formatBytes(lazyBytes) + ' online-after-paint=' + formatBytes(onlineBytes) + ' idle=' + formatBytes(idleBytes) + ' eagerFiles=' + eager.length);
console.log('[startup-budget] heaviest ' + heaviest);
