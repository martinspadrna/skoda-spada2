#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(root, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;
const marker = '<!-- RaK: Games HTML removed from deployed build -->';
const gamesStart = '<div id="games" class="page">';
const calculatorsStart = '<div id="kalkulacky" class="page">';

const start = html.indexOf(gamesStart);
if (start >= 0) {
  const end = html.indexOf(calculatorsStart, start);
  if (end < 0) throw new Error('[strip-games-html] Nenalezen začátek Kalkulaček za blokem Her.');
  html = html.slice(0, start) + marker + '\n\n' + html.slice(end);
} else if (!html.includes(marker)) {
  throw new Error('[strip-games-html] Blok Her ani marker odstranění nebyl nalezen.');
}

// Kdyby byl vstup do Her ještě přímo v HTML spodní navigace, odstraníme i ten.
html = html.replace(/<button\b[^>]*data-action=["']games["'][\s\S]*?<\/button>\s*/gi, '');
html = html.replace(/<link\b[^>]*href=["'][^"']*styles-games\.css[^"']*["'][^>]*>\s*/gi, '');

if (html.includes('id="games"')) throw new Error('[strip-games-html] V deployovaném HTML zůstal #games.');
if (/data-action=["']games["']/i.test(html)) throw new Error('[strip-games-html] V deployovaném HTML zůstal vstup do Her.');

if (html !== before) fs.writeFileSync(indexPath, html, 'utf8');
console.log('[strip-games-html] OK Games page removed from deployed index.html');
