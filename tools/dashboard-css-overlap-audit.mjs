import assert from 'node:assert/strict';
import fs from 'node:fs';

const fit = fs.readFileSync('styles-dashboard-fit.css', 'utf8');
const polish = fs.readFileSync('styles-dashboard-polish.css', 'utf8');
const viewport = fs.readFileSync('styles-viewport-polish.css', 'utf8');
const strip = (value) => String(value || '').replace(/\/\*[\s\S]*?\*\//g, '');
const fitClean = strip(fit);
const polishClean = strip(polish);
const viewportClean = strip(viewport);

for (const forbidden of ['.bottomNav', '#appMenuBody', '.adminRotation']) {
  assert(!fitClean.includes(forbidden), `Dashboard fit must not own ${forbidden}`);
  assert(!polishClean.includes(forbidden), `Dashboard polish must not own ${forbidden}`);
}

for (const required of ['#home .dashboardGrid', '#home .dashboardCard', '#home .dashboardHeroCard']) {
  assert(fitClean.includes(required) || polishClean.includes(required), `Dashboard owner missing ${required}`);
}
assert(fitClean.includes('@media (max-width:390px) and (max-height:820px)'), 'compact mobile Dashboard breakpoint missing');
assert(polishClean.includes('#home.page.active .dashboardShell'), 'final Dashboard shell owner missing');

// Point 4 / v1.5.97–1.5.99: historické compact revize jsou sloučené a obecný
// owner 939 už nesmí duplikovat hodnoty, které na aktivním Home vlastní polish vrstva.
assert(fit.includes('RaK v1.5.97/v1.5.99 – kanonický compact Dashboard owner'), 'canonical compact Dashboard owner marker missing');
assert(fit.includes('RaK v1.5.97 – kanonický vlastník absence pillu'), 'canonical absence pill owner marker missing');
for (const deadRevision of ['v.1.5 (939)', 'v.1.5 (944)', 'v.1.5 (945)', 'v.1.5 (954)', 'v.1.5 (956)', 'v.1.5 (958)']) {
  assert(!fit.includes(deadRevision), `superseded Dashboard fit revision returned: ${deadRevision}`);
}
assert(fit.includes('v.1.5 (948)'), 'device-specific 390x844 / 412x892 owners must remain');
assert(fit.includes('v.1.5 (953)'), 'general hero centering owner must remain');
assert(fit.includes('--rak-dashboard-fit-card-min:82px;') && fit.includes('--rak-dashboard-fit-gap:9px;'), 'compact compatibility metrics drifted');
assert(fit.includes('max-height:calc(100dvh - 76px - env(safe-area-inset-bottom)) !important;'), 'compact safe-area shell height owner missing');
assert(fit.includes('padding-left:10px !important;') && fit.includes('padding-right:10px !important;'), 'short-height hero horizontal padding owner missing');
assert(fit.includes('border-radius:16px !important;'), 'compact card radius owner missing');
assert(fit.includes('letter-spacing:.075em !important;'), 'compact label tracking owner missing');
assert(fit.includes('max-height:24px !important;'), 'compact metadata clipping owner missing');
assert(!fit.includes('min-height:var(--rak-dashboard-fit-card-min) !important;'), 'dead compact card min-height owner returned');
assert(!fit.includes('padding:9px 10px !important;'), 'dead compact card padding owner returned');

// Point 4 / v1.5.98: polish vrstva už nesmí obsahovat první přepsaný glass/low-end
// mezistav. Kanonický matnější glass i finální low-end owner musí zůstat.
assert(polish.includes('RaK v1.5.98 – odstraněné prokazatelně přepsané glass/low-end/food/dot/typography mezivrstvy'), 'v1.5.98 Dashboard polish cleanup marker missing');
assert(!polish.includes('rgba(5,9,16,.34) 68%'), 'superseded strong Dashboard glass variables returned');
assert(!polish.includes('rgba(5,9,16,.40) 70%'), 'superseded strong Dashboard glass variables returned');
assert(polish.includes('rgba(5,9,16,.24) 64%'), 'canonical matte Dashboard glass owner missing');
assert(polish.includes('html body:is(.ladaMode,.lowEndDevice,.lightweightMode) #home.page.active .dashboardShell'), 'final low-end Dashboard shell owner missing');
assert(polish.includes('inline-size:14px !important;') && polish.includes('block-size:14px !important;'), 'canonical food status dot owner missing');
assert(polish.includes('font-size:clamp(12.1px, 3.25vw, 14.6px) !important;'), 'canonical Dashboard label typography missing');
assert(polish.includes('font-size:clamp(15.5px, 4.45vw, 20.4px) !important;'), 'canonical Dashboard value typography missing');

// Point 4 / viewport cleanup: starý startovní bottom alias ani časná 100dvh hodnota
// se nesmí vrátit. Kanonické iOS/PWA a mobilní Home ownery musí zůstat.
assert(!viewportClean.includes('--rak-nav-ios-start-bottom'), 'dead iOS start-bottom alias returned');
assert(!viewportClean.includes('--rak-start-viewport-h:100dvh'), 'dead early start viewport value returned');
assert(viewportClean.includes('--rak-start-viewport-h:100svh !important'), 'canonical stable start viewport owner missing');
assert(viewportClean.includes('height:100dvh !important;') && viewportClean.includes('overflow-y:auto !important;'), 'canonical mobile Home scroll owner missing');
assert(viewportClean.includes('grid-template-rows:repeat(4, auto) !important;'), 'mobile Dashboard four-row overflow guard missing');

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
assert(repeated.length < 90, `Point 4 v1.5.99 cleanup must reduce repeated Dashboard selectors below baseline 90; got ${repeated.length}`);
const top = repeated.slice(0, 8).map(([selector, count]) => `${count}× ${selector}`).join(' | ');
console.log(`[dashboard-css-overlap-audit] OK repeated=${repeated.length}; viewport-dead-start-owners=0; compact-history=consolidated; fit-dead-owners=removed; polish-dead-layers=removed; top=${top}`);
