import assert from 'node:assert/strict';
import fs from 'node:fs';

const fit = fs.readFileSync('styles-dashboard-fit.css', 'utf8');
const polish = fs.readFileSync('styles-dashboard-polish.css', 'utf8');
const strip = (value) => String(value || '').replace(/\/\*[\s\S]*?\*\//g, '');
const fitClean = strip(fit);
const polishClean = strip(polish);

for (const forbidden of ['.bottomNav', '#appMenuBody', '.adminRotation']) {
  assert(!fitClean.includes(forbidden), `Dashboard fit must not own ${forbidden}`);
  assert(!polishClean.includes(forbidden), `Dashboard polish must not own ${forbidden}`);
}

for (const required of ['#home .dashboardGrid', '#home .dashboardCard', '#home .dashboardHeroCard']) {
  assert(fitClean.includes(required) || polishClean.includes(required), `Dashboard owner missing ${required}`);
}
assert(fitClean.includes('@media (max-width:390px) and (max-height:820px)'), 'compact mobile Dashboard breakpoint missing');
assert(polishClean.includes('#home.page.active .dashboardShell'), 'final Dashboard shell owner missing');

function selectorCounts(source) {
  const counts = new Map();
  for (const match of source.matchAll(/([^{}]+)\{/g)) {
    const head = String(match[1] || '').trim();
    if (!head || head.startsWith('@')) continue;
    for (const selector of head.split(',')) {
      const key = selector.replace(/\s+/g, ' ').trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return counts;
}

const combined = selectorCounts(fitClean + '\n' + polishClean);
const repeated = [...combined.entries()].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]);
assert(repeated.length > 0, 'Dashboard overlap audit unexpectedly found no repeated selectors');
const top = repeated.slice(0, 8).map(([selector, count]) => `${count}× ${selector}`).join(' | ');
console.log(`[dashboard-css-overlap-audit] OK repeated=${repeated.length}; top=${top}`);
