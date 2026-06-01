#!/usr/bin/env node
// RaK 1.2 (1.86) – smoke test přehledu připojení + Dashboard/appearance contract guard.
const fs = require('fs');
const path = require('path');

function read(file) {
  return fs.readFileSync(path.join(__dirname, file), 'utf8');
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const bridge = read('supabase-bridge.js');
const appearanceThemeJs = read('appearance-theme.js');
const ui = read('ui.js') + '\n' + read('app-runtime-guards.js') + '\n' + read('app-health-audits.js') + '\n' + read('app-postload-audits.js') + '\n' + read('app-pwa-connectivity.js') + '\n' + read('games-engine.js') + '\n' + read('games-profile.js') + '\n' + appearanceThemeJs + '\n' + read('admin-service-usage.js') + '\n' + read('admin-rotation.js') + '\n' + read('app-navigation.js') + '\n' + read('app-bottom-nav.js') + '\n' + read('app-menu.js') + '\n' + read('app-actions.js') + '\n' + read('app-boot-selftest.js') + '\n' + read('app-rotation-sync.js') + '\n' + read('app-excel-import.js') + '\n' + read('app-rotation-controls.js') + '\n' + read('app-admin-unlock.js') + '\n' + read('app-home-boot.js') + '\n' + read('app-init.js');
const sql = read('assets/docs/sql/supabase_app_usage_v963.sql');
const indexHtml = read('index.html');
const stylesOverridesCss = read('styles-overrides.css');
const dashboardFitCss = read('styles-dashboard-fit.css');
const dashboardPolishCss = read('styles-dashboard-polish.css');
const menuPolishCss = read('styles-menu-polish.css');
const rotaceJs = read('rotace.js');
const dashboardCss = `${dashboardFitCss}
${dashboardPolishCss}`;
const styleHrefMatches = Array.from(indexHtml.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/g));
const styleHrefs = styleHrefMatches.map((match) => String(match[1] || '').trim()).filter(Boolean);
const localStyleHrefs = styleHrefs.filter((href) => !/^https?:/i.test(href));
const dashboardCriticalStyles = [
  'styles-overrides.css',
  'styles-dashboard-fit.css',
  'styles-admin-polish.css',
  'styles-menu-polish.css',
  'styles-stats-polish.css',
  'styles-viewport-polish.css',
  'styles-theme-polish.css',
  'styles-release-polish.css',
  'styles-dashboard-polish.css'
];
const lockedDashboardSelectors = [
  '#home.page.active .dashboardShell',
  '#home.page.active #dashHero.dashboardHeroCard',
  '#home.page.active .dashboardGrid',
  '#home.page.active .dashboardCard',
  '#home.page.active #dashHero .dashboardHeroLine3',
  '#home.page.active #dashHero .dashboardHeroLine3Sub',
  '#dashboardAnnouncementBar:not([hidden]) + #dashHero.dashboardHeroCard',
  '#dashKantyna .dashboardDot',
  '#dashJidelna .dashboardDot'
];

const dashboardViewportStackContracts = [
  {
    label: '360×800',
    fitMedia: '@media (max-width:390px) and (max-height:820px)',
    polishMedia: '@media (max-width:390px) and (max-height:820px)',
    heightGuard: 'grid-auto-rows:120px !important;',
    ownerGuard: '#home.page.active .dashboardCard'
  },
  {
    label: '390×844',
    fitMedia: '@media (min-width:380px) and (max-width:400px) and (min-height:821px) and (max-height:860px)',
    polishMedia: '@media (min-width:380px) and (max-width:410px) and (min-height:830px) and (max-height:860px)',
    heightGuard: 'grid-auto-rows:117px !important;',
    ownerGuard: '#home.page.active .dashboardShell > #dashboardAnnouncementBar:not([hidden]) + #dashHero + .dashboardGrid'
  },
  {
    label: '428×926',
    fitMedia: '@media (min-width:401px) and (max-width:430px) and (min-height:870px) and (max-height:910px)',
    polishMedia: '@media (min-width:380px) and (max-width:440px) and (min-height:830px) and (max-height:940px)',
    heightGuard: 'grid-auto-rows:122px !important;',
    ownerGuard: '#home.page.active .dashboardShell > #dashHero + .dashboardGrid'
  },
  {
    label: '430×932',
    fitMedia: '@media (min-width:401px) and (max-width:430px) and (min-height:870px) and (max-height:910px)',
    polishMedia: '@media (min-width:380px) and (max-width:440px) and (min-height:830px) and (max-height:940px)',
    heightGuard: 'height:122px !important;',
    ownerGuard: '#home.page.active .dashboardShell > .dashboardGrid'
  },
  {
    label: 'desktop',
    fitMedia: '#home .dashboardGrid',
    polishMedia: '#home.page.active .dashboardGrid',
    heightGuard: 'grid-auto-rows:128px !important;',
    ownerGuard: '#home.page.active .dashboardCard'
  }
];


const dashboardLegacyOwnerMap = [
  ['#home .dashboardGrid', '#home.page.active .dashboardGrid'],
  ['#home .dashboardCard', '#home.page.active .dashboardCard'],
  ['#home .dashboardHeroCard', '#home.page.active #dashHero.dashboardHeroCard'],
  ['#dashHero .dashboardHeroLine2', '#home.page.active #dashHero .dashboardHeroLine2'],
  ['#dashHero .dashboardHeroLine3', '#home.page.active #dashHero .dashboardHeroLine3'],
  ['#dashHero .dashboardHeroLine3Pill', '#home.page.active #dashHero .dashboardHeroLine3Pill'],
  ['#home .dashboardIcon.dashboardIconInline', '#home.page.active .dashboardCard .dashboardIcon.dashboardIconInline'],
  ['#home .dashboardDot', '#home.page.active #dashKantyna .dashboardDot'],
  ['#dashKantyna .dashboardDot', '#home.page.active #dashKantyna .dashboardDot'],
  ['#dashJidelna .dashboardDot', '#home.page.active #dashJidelna .dashboardDot'],
  ['#home.page.active .dashboardShell', '#home.page.active .dashboardShell']
];


function countMatches(source, pattern) {
  const matches = String(source || '').match(pattern);
  return matches ? matches.length : 0;
}

function assertIncludes(source, fragment, msg) {
  assert(String(source || '').includes(fragment), msg);
}

function assertOrder(source, before, after, msg) {
  const a = String(source || '').indexOf(before);
  const b = String(source || '').indexOf(after);
  assert(a >= 0, `Chybí ${before}`);
  assert(b >= 0, `Chybí ${after}`);
  assert(a < b, msg);
}
function assertSingleOccurrence(list, value, msg) {
  const found = list.filter((item) => item === value).length;
  assert(found === 1, `${msg}: ${value} (${found}×)`);
}

function assertCssOwner(selector, msg) {
  assertIncludes(dashboardCss, selector, msg || `Dashboard CSS vlastník chybí pro ${selector}`);
}

function assertLegacyDashboardGuard(legacySelector, ownerSelector) {
  assertIncludes(stylesOverridesCss, legacySelector, `Legacy Dashboard selector v overrides chybí z inventury: ${legacySelector}`);
  assertCssOwner(ownerSelector || legacySelector, `Pozdní Dashboard vlastník chybí pro legacy selector ${legacySelector}`);
}

function extractConstArrayLiteral(source, name) {
  const marker = 'const ' + name + ' = [';
  const markerIndex = String(source || '').indexOf(marker);
  assert(markerIndex >= 0, `Chybí definice ${name}`);
  const start = source.indexOf('[', markerIndex);
  let depth = 0;
  let quote = '';
  let escape = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`Neukončené pole ${name}`);
}

function readAppearanceArray(name) {
  return Function('return ' + extractConstArrayLiteral(appearanceThemeJs, name))();
}


assert(bridge.includes('recordAppUsage'), 'RotationSupabaseBridge.recordAppUsage chybí');
assert(bridge.includes('loadAppUsage'), 'RotationSupabaseBridge.loadAppUsage chybí');
assert(bridge.includes('rak_usage_presence_touch'), 'RPC rak_usage_presence_touch není napojená');
assert(bridge.includes('rak_usage_presence_admin'), 'RPC rak_usage_presence_admin není napojená');
assert(bridge.includes('APP_USAGE_MIN_INTERVAL_MS'), 'App usage throttle chybí');
assert(ui.includes('buildAdminUsageHtml'), 'Admin UI přehledu připojení chybí');
assert(ui.includes('buildAdminUsageGroups'), 'Admin přehled musí seskupovat zařízení podle jména/profilu');
assert(ui.includes('buildAdminUsageInitials'), 'Admin přehled musí generovat dvoupísmenné iniciály profilu');
assert(ui.includes("Array.from(parts[0]).slice(0, 2)"), 'Jednoslovné profily mají v avataru použít první dvě písmena');
assert(ui.includes('toLocaleUpperCase(\'cs-CZ\')'), 'Iniciály mají respektovat českou diakritiku při převodu na velká písmena');
assertIncludes(menuPolishCss, '#menu .adminUsageSummaryText{display:flex !important;flex-direction:column !important;gap:2px !important;min-width:0 !important;}', 'Přehled připojení musí mít samostatný text wrapper, aby avatar nebyl mimo střed');
assertIncludes(menuPolishCss, '#menu .adminUsageAvatar{', 'CSS avatar přehledu připojení chybí');
assertIncludes(menuPolishCss, 'place-items:center !important;', 'Avatar přehledu připojení musí centrovat iniciály');
assert(ui.includes('adminUsageDeviceList'), 'Admin přehled musí ukazovat zařízení uvnitř jedné složky jména');
assert(ui.includes('data-admin-action="open-usage"'), 'Tlačítko Přehled připojení chybí');
assert(ui.includes("openAppMenu('admin-usage')"), 'Admin usage routing chybí');
assert(!ui.includes('Zapsat mě teď'), 'Testovací tlačítko Zapsat mě teď nemá být viditelné');
assert(!ui.includes('<b>Stránka:</b>'), 'Přehled připojení už nemá ukazovat stránku');
assert(ui.includes('Viewport '), 'Displej má ukazovat viewport/rozlišení, ne časovou zónu');
assert(sql.includes('create table if not exists public.app_usage_devices'), 'SQL app_usage_devices chybí');
assert(sql.includes('create table if not exists public.app_usage_events'), 'SQL app_usage_events chybí');
assert(sql.includes('returns jsonb'), 'SQL RPC návrat JSONB chybí');
assert(sql.includes('last_ip_hash'), 'SQL hash IP pole chybí');
assert(!sql.includes(' ip text not null'), 'SQL nesmí ukládat surovou IP jako povinný sloupec');

// Dashboard smoke guard: statická pojistka po dlouhém mobilním ladění.
assertIncludes(indexHtml, '<div id="home" class="page active">', 'Dashboard home page chybí nebo už není výchozí aktivní stránka');
assertIncludes(indexHtml, 'id="dashboardAnnouncementBar"', 'Dashboard oznámení chybí');
assertIncludes(indexHtml, 'id="dashHero"', 'Horní směnový panel Dashboardu chybí');
assertIncludes(indexHtml, 'class="dashboardGrid"', 'Dashboard grid chybí');
['dashCalendar', 'dashCountdown', 'dashKantyna', 'dashJidelna', 'dashFoodLink', 'dashEportalLink', 'dashVyplata', 'dashCzd'].forEach((id) => {
  assertIncludes(indexHtml, `id="${id}"`, `Dashboard karta ${id} chybí`);
});
assert(countMatches(indexHtml, /class="[^"]*dashboardCard/g) >= 8, 'Dashboard musí mít minimálně 8 hlavních panelů');

// Kaskáda: staré dashboard override bloky mohou existovat, ale vítězné vrstvy musí být načtené později.
assert(localStyleHrefs.length >= 10, 'Index musí načítat lokální CSS vrstvy aplikace');
assert(localStyleHrefs[localStyleHrefs.length - 1] === 'styles-dashboard-polish.css', 'Dashboard polish musí být úplně poslední lokální CSS vrstva');
dashboardCriticalStyles.forEach((href) => assertSingleOccurrence(localStyleHrefs, href, 'CSS vrstva nesmí být načtená víckrát ani chybět'));
assertOrder(indexHtml, 'styles-overrides.css', 'styles-dashboard-fit.css', 'Dashboard fit CSS musí přebíjet staré overrides');
assertOrder(indexHtml, 'styles-dashboard-fit.css', 'styles-dashboard-polish.css', 'Dashboard polish musí být pozdní vítězná vrstva');
assertOrder(indexHtml, 'styles-release-polish.css', 'styles-dashboard-polish.css', 'Dashboard polish musí zůstat za release polish vrstvou');
dashboardCriticalStyles.slice(0, -1).forEach((href) => {
  assertOrder(indexHtml, href, 'styles-dashboard-polish.css', `styles-dashboard-polish.css musí zůstat za ${href}`);
});

// Vítězné dashboard vlastnictví: test drží klíčové selektory v dashboard vrstvách, ne ve slepých globálních přepisech.
lockedDashboardSelectors.forEach((selector) => assertCssOwner(selector));
assertIncludes(stylesOverridesCss, 'Dashboard legacy override inventory guard', 'styles-overrides.css musí mít legacy guard poznámku pro historické Dashboard hotfixy');
assertIncludes(stylesOverridesCss, 'vítězné Dashboard vrstvy jsou styles-dashboard-fit.css a styles-dashboard-polish.css', 'Legacy guard musí jasně pojmenovat pozdější Dashboard vlastníky');
assertIncludes(stylesOverridesCss, 'Dashboard legacy owner map', 'styles-overrides.css musí mít 1.78 mapu legacy → active owner');
assertIncludes(stylesOverridesCss, 'Mapované oblasti: shell, hero panel, grid, karty, stavové tečky Kantýna/Jídelna', 'Legacy mapa musí pojmenovat hlavní Dashboard oblasti');
dashboardLegacyOwnerMap.forEach(([legacySelector, ownerSelector]) => {
  assertLegacyDashboardGuard(legacySelector, ownerSelector);
});
assert(dashboardLegacyOwnerMap.length >= 10, 'Dashboard legacy owner mapa musí hlídat minimálně 10 starých Dashboard oblastí');
assertIncludes(dashboardFitCss, 'stabilizační vlastník mobilních breakpointů', 'styles-dashboard-fit.css musí mít poznámku vlastníka mobilních breakpointů');
assertIncludes(dashboardFitCss, 'legacy override inventory guard', 'styles-dashboard-fit.css musí mít 1.76 legacy inventory guard');
assertIncludes(dashboardPolishCss, 'pozdní vítězná dashboard vrstva', 'styles-dashboard-polish.css musí mít poznámku pozdní vítězné vrstvy');
assertIncludes(dashboardPolishCss, 'final visual owner guard', 'styles-dashboard-polish.css musí mít 1.76 final owner guard');
[
  ['#home .dashboardShell', '#home.page.active .dashboardShell'],
  ['#home .dashboardHeroCard', '#home.page.active #dashHero.dashboardHeroCard'],
  ['#home .dashboardCard', '#home.page.active .dashboardCard'],
  ['#dashHero .dashboardHeroLine3', '#home.page.active #dashHero .dashboardHeroLine3'],
  ['#dashHero .dashboardHeroLine3Pill', '#home.page.active #dashHero .dashboardHeroLine3Pill']
].forEach(([legacySelector, ownerSelector]) => assertLegacyDashboardGuard(legacySelector, ownerSelector));
assert(countMatches(stylesOverridesCss, /Dashboard/g) >= 20, 'styles-overrides.css musí zůstat dohledatelnou inventurou starých Dashboard zásahů');
assert(!/#home\.page\.active\s*>\s*\.dashboardShell::(?:before|after)/.test(dashboardCss), 'Dashboard polish vrstva nesmí znovu kreslit shell border pseudo-elementy');

// Viewport pojistky pro ručně testované mobily: 360×800, 390×844, 428×926 / 430×932 + desktop základ.
assertIncludes(dashboardFitCss, '@media (max-width:390px) and (max-height:820px)', 'Chybí compact guard pro 360×800');
assertIncludes(dashboardFitCss, '@media (min-width:380px) and (max-width:400px) and (min-height:821px) and (max-height:860px)', 'Chybí viewport guard pro 390×844');
assertIncludes(dashboardFitCss, '@media (min-width:401px) and (max-width:430px) and (min-height:870px) and (max-height:910px)', 'Chybí viewport guard pro střední Android/iPhone výšky');
assertIncludes(dashboardPolishCss, '@media (min-width:380px) and (max-width:440px) and (min-height:830px) and (max-height:940px)', 'Chybí pozdní stack guard pro 428×926 / 430×932');
assertIncludes(dashboardCss, '#dashboardAnnouncementBar:not([hidden]) + #dashHero.dashboardHeroCard', 'Oznámení musí mít vlastní hero layout guard');
assertIncludes(dashboardCss, '#home.page.active .dashboardGrid', 'Dashboard grid musí mít pozdní stabilizační pravidla');
assertIncludes(dashboardCss, '#home.page.active #dashHero .dashboardHeroLine3Sub', 'Řádek kdo chybí musí mít pozdní stabilizační pravidla');

// 1.77: Dashboard běžné panely jsou zvýšené opatrně, nejvýš kolem 5 % vůči 1.76 baseline.
assertIncludes(dashboardPolishCss, 'Dashboard: běžné panely opatrně vyšší max o 5 %', 'Chybí poznámka k 1.77 opatrnému navýšení dashboard panelů');
[
  'grid-auto-rows:128px !important;',
  'height:128px !important;',
  'min-height:128px !important;',
  'grid-auto-rows:122px !important;',
  'height:122px !important;',
  'min-height:122px !important;',
  'grid-auto-rows:120px !important;',
  'height:120px !important;',
  'min-height:120px !important;',
  'grid-auto-rows:117px !important;',
  'height:117px !important;',
  'min-height:117px !important;'
].forEach((fragment) => assertIncludes(dashboardPolishCss, fragment, `Dashboard panel height guard chybí: ${fragment}`));

// 1.79: viewport stack contract guard – ručně laděné rozměry se musí opírat o stejné pozdní vlastníky.
assertIncludes(dashboardPolishCss, 'Dashboard viewport stack contract guard', 'styles-dashboard-polish.css musí mít 1.79 viewport stack contract guard');
['360×800', '390×844', '428×926', '430×932', 'desktop základ'].forEach((label) => {
  assertIncludes(dashboardPolishCss, label, `Viewport stack guard musí jmenovat ${label}`);
});
dashboardViewportStackContracts.forEach((contract) => {
  assertIncludes(dashboardFitCss, contract.fitMedia, `Viewport ${contract.label}: chybí fit vlastník ${contract.fitMedia}`);
  assertIncludes(dashboardPolishCss, contract.polishMedia, `Viewport ${contract.label}: chybí polish vlastník ${contract.polishMedia}`);
  assertIncludes(dashboardPolishCss, contract.heightGuard, `Viewport ${contract.label}: chybí výškový guard ${contract.heightGuard}`);
  assertIncludes(dashboardPolishCss, contract.ownerGuard, `Viewport ${contract.label}: chybí cílový selektor ${contract.ownerGuard}`);
});
assertOrder(dashboardPolishCss, 'Dashboard: běžné panely opatrně vyšší max o 5 %', 'Dashboard viewport stack contract guard', '1.79 viewport contract guard musí být až za 1.77 výškovou vrstvou');
assertOrder(dashboardPolishCss, 'Dashboard active owner map guard', 'Dashboard viewport stack contract guard', '1.79 viewport contract guard musí být pozdější dokumentační pojistka aktivních vlastníků');

// 1.80: horní směnový panel je vyšší cca o 10 %, ale běžné panely a spodní lišta se tím nemění.
assertIncludes(dashboardPolishCss, 'Dashboard: vrchní směnový panel vyšší cca o 10 %', 'Chybí 1.80 vrstva pro vyšší horní směnový panel');
assertOrder(dashboardPolishCss, 'Dashboard viewport stack contract guard', 'Dashboard: vrchní směnový panel vyšší cca o 10 %', '1.80 hero height vrstva musí být až za viewport contract guardem');
['min-height:154px !important;', 'min-height:160px !important;', 'min-height:143px !important;', 'min-height:136px !important;'].forEach((fragment) => {
  assertIncludes(dashboardPolishCss, fragment, `Chybí 1.80 hero height guard: ${fragment}`);
});

// 1.80: theme/pozadí nesmí znovu bobtnat skoro stejnými variantami a nové výrazné kusy nesmí být zadarmo.
const themeDefs = readAppearanceArray('RAK_THEME_DEFS');
const backgroundDefs = readAppearanceArray('RAK_BACKGROUND_DEFS');
const themeIds = new Set(themeDefs.map((item) => String(item && item.id || '')));
const backgroundIds = new Set(backgroundDefs.map((item) => String(item && item.id || '')));
['electric-ocean', 'gold-rush-neon', 'arctic-radar', 'candy-voltage', 'stealth-purple', 'ultra-violet'].forEach((id) => {
  assert(!themeIds.has(id), `Podobné/duplicitní theme má zůstat vyřazené: ${id}`);
});
['nebula-shock', 'emerald-smoke', 'ruby-circuit', 'cobalt-fire', 'solar-flare'].forEach((id) => {
  assert(!backgroundIds.has(id), `Podobné/duplicitní pozadí má zůstat vyřazené: ${id}`);
});
['storm-signal', 'matrix-redline'].forEach((id) => {
  const theme = themeDefs.find((item) => String(item && item.id || '') === id);
  assert(theme, `Ponechaný výrazný theme chybí: ${id}`);
  assert(String(theme.unlockText || '').includes('Rank') && Number(theme.minAchievements || 0) > 0, `Theme ${id} musí být postupně odemykaný rankem/achievementem`);
});
['storm-signal', 'midnight-gold'].forEach((id) => {
  const bg = backgroundDefs.find((item) => String(item && item.id || '') === id);
  assert(bg, `Ponechané výrazné pozadí chybí: ${id}`);
  assertIncludes(appearanceThemeJs, `'${id}': { unlockText: 'Rank`, `Pozadí ${id} musí mít rank/achievement unlock v mapě`);
});
const freeThemes = themeDefs.filter((item) => String(item && item.unlockText || '') === 'Vždy dostupné').map((item) => String(item.id || ''));
assert(freeThemes.length === 1 && freeThemes[0] === 'default', `Vždy dostupný má zůstat jen základní theme, nalezeno: ${freeThemes.join(', ')}`);
assert(themeDefs.length <= 18, 'Theme seznam je po 1.80 zbytečně podobný/nafouknutý');
assert(backgroundDefs.length <= 23, 'Pozadí seznam je po 1.80 zbytečně podobný/nafouknutý');

// 1.81: appearance reward contract – budoucí theme/pozadí mohou přibývat, ale ne jako skoro stejné kopie bez postupného odemykání.
assertIncludes(appearanceThemeJs, 'RAK_APPEARANCE_REWARD_CONTRACT_V181', 'Chybí 1.81 appearance reward contract');
assertIncludes(appearanceThemeJs, "intent: 'distinct-progressive-appearance-rewards'", 'Appearance contract musí jasně řešit odlišnost a postupné odemykání');
assertIncludes(appearanceThemeJs, "defaultThemeId: 'default'", 'Appearance contract musí držet základní theme');
assertIncludes(appearanceThemeJs, "defaultBackgroundId: 'ios-mesh'", 'Appearance contract musí držet základní pozadí');
[
  'Vždy dostupný zůstává jen základní theme a základní pozadí.',
  'Nové theme/pozadí nesmí být jen lehce přebarvená kopie existujícího skinu.',
  'Každý nový výrazný skin musí mít minPlays, minAchievements nebo minRank.',
  'Před přidáním nového skinu porovnat hlavní color/swatch/akcent s existující rodinou.',
  'Když nový skin spadá do stejné rodiny, musí mít jiný kontrast, náladu nebo účel v UI.'
].forEach((rule) => assertIncludes(appearanceThemeJs, rule, `Appearance contract pravidlo chybí: ${rule}`));
['green', 'blueCyan', 'violetPink', 'redOrange', 'neutralPremium'].forEach((family) => {
  assertIncludes(appearanceThemeJs, family + ': Object.freeze([', `Theme family contract chybí: ${family}`);
});
['green', 'blueCyan', 'violetPink', 'warm', 'calm'].forEach((family) => {
  assertIncludes(appearanceThemeJs, family + ': Object.freeze([', `Background family contract chybí: ${family}`);
});
['electric-ocean', 'gold-rush-neon', 'arctic-radar', 'candy-voltage', 'stealth-purple', 'ultra-violet'].forEach((id) => {
  assertIncludes(appearanceThemeJs, id, `Vyřazený theme ${id} musí být dohledatelný v reservedRemovedThemeIds`);
});
['nebula-shock', 'emerald-smoke', 'ruby-circuit', 'cobalt-fire', 'solar-flare'].forEach((id) => {
  assertIncludes(appearanceThemeJs, id, `Vyřazené pozadí ${id} musí být dohledatelné v reservedRemovedBackgroundIds`);
});
const backgroundFreeEntries = Object.entries({
  'ios-mesh': 'Vždy dostupné'
}).filter(([id]) => backgroundIds.has(id));
assert(backgroundFreeEntries.length === 1 && backgroundFreeEntries[0][0] === 'ios-mesh', 'Základní volné pozadí má zůstat ios-mesh');
['storm-signal', 'midnight-gold'].forEach((id) => {
  assertIncludes(appearanceThemeJs, `'${id}': { unlockText: 'Rank`, `Pozadí ${id} musí zůstat v rank/achievement unlock mapě i po 1.81 contractu`);
});
assertOrder(appearanceThemeJs, 'RAK_BACKGROUND_UNLOCKS_V927', 'RAK_APPEARANCE_REWARD_CONTRACT_V181', 'Appearance contract má být až za unlock mapou, aby navazoval na reálné odemykání');
assertOrder(appearanceThemeJs, 'RAK_APPEARANCE_REWARD_CONTRACT_V181', 'window.RAK_BACKGROUND_DEFS = RAK_BACKGROUND_DEFS', 'Appearance contract má být dostupný před finálním vystavením background definic');

assertIncludes(rotaceJs, 'function buildRotationMonthExportSummary(month)', 'Export rozpisu musí umět spočítat měsíční přehled');
assertIncludes(rotaceJs, "drawRotationExportSummaryCard(ctx, 'Měsíční přehled'", 'Export rozpisu musí vykreslit kartu Měsíční přehled');
assertIncludes(rotaceJs, 'const rowH = Math.max(36, Number(opts.rowH) || 44);', 'Helper měsíčního přehledu musí držet kompaktní řádky');
assertIncludes(rotaceJs, 'function getRotationExportSummaryCardHeight(rows, options)', 'Export musí počítat výšku Měsíčního přehledu sdíleným helperem');
assertIncludes(rotaceJs, 'const summaryH = getRotationExportSummaryCardHeight', 'Canvas výška musí používat stejný helper jako vykreslení karty Měsíční přehled');
assertIncludes(rotaceJs, 'const exportFooterSafeGap = 36', 'Export Rozpisů musí mít bezpečnou mezeru mezi pravým souhrnem a footerem');
assertIncludes(rotaceJs, 'contentH + exportFooterSafeGap + footerH', 'Výška exportního canvasu musí započítat footer safe gap');
assertIncludes(rotaceJs, 'return titleH + headerH + rowH * dataRows.length + noteH;', 'Sdílený helper výšky měsíčního přehledu musí fungovat i bez poznámky');
['Směn do práce', 'Ranní směny', 'Noční směny', 'Obsazenost'].forEach((label) => {
  assertIncludes(rotaceJs, label, `Měsíční exportní přehled musí obsahovat položku ${label}`);
});
['Dní se směnou', 'Míst celkem', 'Plán obsazeno', 'Plán volno', 'Plán obsazenost', 'Po absencích obsazeno', 'Po absencích volno', 'Obsazenost měsíce', 'Absence záznamů', 'Absence směn', 'note: summaryNote', 'Plán = obsazení zapsané v rozpisu. Po absencích = plán mínus absence směn.'].forEach((label) => {
  assert(!rotaceJs.includes(label), `Zjednodušený měsíční přehled už nemá obsahovat ${label}`);
});
assertIncludes(rotaceJs, 'const rows = [', 'Měsíční přehled musí stavět jednoduché pole řádků');
assertIncludes(rotaceJs, "{ label: 'Obsazenost', value: formatPercent(occupancyPercent) }", 'Zjednodušený měsíční přehled musí ukázat jedinou obsazenost');

assert(!/bottomNav|bottomNavBtn|bottomNavScroll|bottomNavIndicator/.test(dashboardCss), 'Dashboard CSS vrstva nesmí upravovat spodní lištu');

console.log('app-usage-smoke-v963 OK + dashboard-css-contract-guard + appearance-reward-contract + rotation-export-summary-simple-guard OK');
