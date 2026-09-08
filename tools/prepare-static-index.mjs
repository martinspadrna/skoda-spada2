#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(root, 'index.html');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = String(pkg.version || '').trim();
const recoveryBuild = '1.5.18';
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('[prepare-static-index] Neplatná package verze: ' + version);

let html = fs.readFileSync(indexPath, 'utf8');
const beforeBytes = Buffer.byteLength(html, 'utf8');

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeDivById(source, id) {
  const startRe = new RegExp("<div\\b[^>]*\\bid=[\"']" + escapeRegExp(id) + "[\"'][^>]*>", 'i');
  const startMatch = startRe.exec(source);
  if (!startMatch) return source;
  const start = startMatch.index;
  const tagRe = /<div\b[^>]*>|<\/div\s*>/gi;
  tagRe.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = tagRe.exec(source))) {
    if (/^<\/div/i.test(match[0])) depth -= 1;
    else depth += 1;
    if (depth === 0) {
      return source.slice(0, start) + source.slice(tagRe.lastIndex);
    }
  }
  throw new Error('[prepare-static-index] Nedokážu bezpečně uzavřít #' + id);
}

// Technická verze assetů musí být jediný source of truth z package.json.
html = html.replace(/(assets\/app-icons\/icon-(?:32|180|192|512)\.png)\?v=[^"'\s>]+/g, '$1?v=' + version);
html = html.replace(/app\.js\?v=[^"'\s>]+/g, 'app.js?v=' + version);

// Po odstranění Her z UI nesmí profil/vzhled dál používat staré game_* RPC.
// Malý runtime guard je vložen hned za app.js a jeho URL je verzovaná stejně jako build.
if (!/rak-no-games-runtime-v1516\.js(?:\?v=[^"'\s>]*)?/i.test(html)) {
  html = html.replace(
    /(<script\b[^>]*src=["']app\.js\?v=[^"']+["'][^>]*><\/script>)/i,
    '$1\n<script src="rak-no-games-runtime-v1516.js?v=' + version + '"></script>'
  );
} else {
  html = html.replace(/rak-no-games-runtime-v1516\.js\?v=[^"'\s>]+/gi, 'rak-no-games-runtime-v1516.js?v=' + version);
}

// iOS recovery 1.5.18: po regresi lazy Supabase vynutíme správné pořadí online bootstrapu.
// Je záměrně samostatný a verzovaný novým recovery buildem, aby ho Safari nemohlo vzít
// ze stejné 1.5.16 runtime cache jako rozbitou variantu.
if (!/rak-online-recovery-v1517\.js(?:\?v=[^"'\s>]*)?/i.test(html)) {
  html = html.replace(
    /(<script\b[^>]*src=["']rak-no-games-runtime-v1516\.js\?v=[^"']+["'][^>]*><\/script>)/i,
    '$1\n<script src="rak-online-recovery-v1517.js?v=' + recoveryBuild + '"></script>'
  );
} else {
  html = html.replace(/rak-online-recovery-v1517\.js\?v=[^"'\s>]+/gi, 'rak-online-recovery-v1517.js?v=' + recoveryBuild);
}

// XLSX a JSZip se načítají přes rak-external-deps.js až při importu/exportu.
html = html.replace(/\s*<script\b[^>]*src=["'][^"']*xlsx@0\.18\.5\/dist\/xlsx\.full\.min\.js[^"']*["'][^>]*><\/script>\s*/gi, '\n');
html = html.replace(/\s*<script\b[^>]*src=["'][^"']*jszip@3\.10\.1\/dist\/jszip\.min\.js[^"']*["'][^>]*><\/script>\s*/gi, '\n');

// Podpis používá bezpečný systémový cursive fallback; kvůli jedinému dekorativnímu fontu
// neposíláme IP/UA při startu aplikace na Google Fonts.
html = html.replace(/\s*<link\b[^>]*href=["']https:\/\/fonts\.googleapis\.com\/[^"']+["'][^>]*>\s*/gi, '\n');

// Hry už nejsou součást RaK. Odstraňujeme je ještě před odesláním HTML do prohlížeče,
// ne až následným JS cleanupem po prvním paintu.
html = removeDivById(html, 'games');
html = html.replace(/\s*<button\b[^>]*class=["'][^"']*bottomNavGamesBtn[^"']*["'][\s\S]*?<\/button>\s*/i, '\n');
html = html.replace(/\s*<link\b[^>]*href=["']styles-games\.css["'][^>]*>\s*/gi, '\n');

// Historický atribut nemá v aplikaci žádnou funkci a mohl působit jako reklamní identifikátor.
html = html.replace(/\s+data-adreal-did=["'][^"']*["']/gi, '');

// Udržuj výstup čitelný a idempotentní.
html = html.replace(/\n{4,}/g, '\n\n\n');
if (!html.endsWith('\n')) html += '\n';

fs.writeFileSync(indexPath, html, 'utf8');
const afterBytes = Buffer.byteLength(html, 'utf8');
console.log('[prepare-static-index] OK version=' + version + ' recovery=' + recoveryBuild + ' index=' + beforeBytes + '→' + afterBytes + ' B removed=' + (beforeBytes - afterBytes) + ' B');
