#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const previous = String(process.env.VERCEL_GIT_PREVIOUS_SHA || '').trim();
if (!previous) {
  console.log('[vercel-ignore-build] no previous deployment SHA; build');
  process.exit(1);
}

let output = '';
try {
  output = execFileSync('git', ['diff', '--name-only', previous + '..HEAD'], { encoding: 'utf8' });
} catch (_) {
  console.log('[vercel-ignore-build] diff failed; build');
  process.exit(1);
}

const files = output.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
if (!files.length) {
  console.log('[vercel-ignore-build] no changed files; skip');
  process.exit(0);
}

const helperOnly = files.every((file) =>
  /^\.github\/workflows\/rak-v\d+.*\.ya?ml$/i.test(file) ||
  /^tools\/rak-v\d+.*\.(?:py|mjs|js)$/i.test(file)
);

if (helperOnly) {
  console.log('[vercel-ignore-build] helper-only commit; skip build:', files.join(', '));
  process.exit(0);
}

console.log('[vercel-ignore-build] functional change present; build:', files.join(', '));
process.exit(1);
