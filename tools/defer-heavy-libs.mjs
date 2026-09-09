#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(root, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const patterns = [
  /\n?<script\s+src="https:\/\/cdn\.jsdelivr\.net\/npm\/xlsx@0\.18\.5\/dist\/xlsx\.full\.min\.js"[^>]*><\/script>/,
  /\n?<script\s+src="https:\/\/cdn\.jsdelivr\.net\/npm\/jszip@3\.10\.1\/dist\/jszip\.min\.js"[^>]*><\/script>/
];

const idleDiagnosticFiles = [
  'rak-storage-sync-audit.js',
  'rak-boot-sequence-audit.js',
  'rak-supabase-client-audit.js',
  'rak-export-release-audit.js',
  'rak-release-ops-audit.js',
  'rak-due-diligence-progress.js',
  'rak-performance-ci-audit.js',
  'rak-mobile-smoke-audit.js'
];

for (const pattern of patterns) html = html.replace(pattern, '');
for (const file of idleDiagnosticFiles) {
  const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  html = html.replace(new RegExp('\\n?<script\\s+src="' + escaped + '"[^>]*><\\/script>'), '');
}

if (/cdn\.jsdelivr\.net\/npm\/xlsx@0\.18\.5\/dist\/xlsx\.full\.min\.js/.test(html)) {
  throw new Error('[defer-heavy-libs] XLSX zůstal v index.html jako eager script.');
}
if (/cdn\.jsdelivr\.net\/npm\/jszip@3\.10\.1\/dist\/jszip\.min\.js/.test(html)) {
  throw new Error('[defer-heavy-libs] JSZip zůstal v index.html jako eager script.');
}
for (const file of idleDiagnosticFiles) {
  if (html.includes('src="' + file + '"')) {
    throw new Error('[defer-heavy-libs] Diagnostický modul zůstal v startup HTML: ' + file);
  }
}
if (!/@supabase\/supabase-js@2\.110\.7/.test(html)) {
  throw new Error('[defer-heavy-libs] Supabase eager script se nesmí při této optimalizaci změnit.');
}
if (!/src="rak-dom-security-hardening\.js"/.test(html)) {
  throw new Error('[defer-heavy-libs] DOM security hardening musí zůstat v startup HTML.');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('[defer-heavy-libs] OK XLSX + JSZip + diagnostic-only scripts deferred; Supabase and DOM security hardening untouched');
