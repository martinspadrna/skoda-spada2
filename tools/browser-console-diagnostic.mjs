#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'browser-smoke-v1103.js');
const tempPath = path.join(root, '.browser-smoke-console-diagnostic.cjs');
const source = fs.readFileSync(sourcePath, 'utf8');
const needle = 'consoleErrorCount: consoleErrors.length,';
const replacement = 'consoleErrorCount: consoleErrors.length,\n    consoleErrors: consoleErrors.slice(),';

if (!source.includes(needle)) {
  throw new Error('[browser-console-diagnostic] Browser smoke nemá očekávaný výstup consoleErrorCount.');
}

const patched = source.replace(needle, replacement);
fs.writeFileSync(tempPath, patched, 'utf8');
try {
  const result = spawnSync(process.execPath, [tempPath], {
    cwd: root,
    env: process.env,
    stdio: 'inherit'
  });
  if (result.error) throw result.error;
  process.exitCode = Number.isInteger(result.status) ? result.status : 1;
} finally {
  try { fs.rmSync(tempPath, { force: true }); } catch (err) {}
}
