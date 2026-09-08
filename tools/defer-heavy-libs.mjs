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

for (const pattern of patterns) html = html.replace(pattern, '');

if (/cdn\.jsdelivr\.net\/npm\/xlsx@0\.18\.5\/dist\/xlsx\.full\.min\.js/.test(html)) {
  throw new Error('[defer-heavy-libs] XLSX zůstal v index.html jako eager script.');
}
if (/cdn\.jsdelivr\.net\/npm\/jszip@3\.10\.1\/dist\/jszip\.min\.js/.test(html)) {
  throw new Error('[defer-heavy-libs] JSZip zůstal v index.html jako eager script.');
}
if (!/@supabase\/supabase-js@2\.110\.7/.test(html)) {
  throw new Error('[defer-heavy-libs] Supabase eager script se nesmí při této optimalizaci změnit.');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('[defer-heavy-libs] OK XLSX + JSZip removed from startup HTML; Supabase untouched');
