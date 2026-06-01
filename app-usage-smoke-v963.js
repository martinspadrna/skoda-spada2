#!/usr/bin/env node
// RaK 1.2 (1.102) – smoke test přehledu připojení + Dashboard/appearance contract guard.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function read(file) {
  return fs.readFileSync(path.join(__dirname, file), 'utf8');
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const appUsageSmokeSource = fs.readFileSync(__filename, 'utf8');
const coreJs = read('core.js');
const packageJsonText = read('package.json');
const packageJson = JSON.parse(packageJsonText);
const serviceWorkerJs = read('sw.js');
const exportJs = read('export.js');
const changelogMd = read('CHANGELOG.md');
const bridge = read('supabase-bridge.js');
const appearanceThemeJs = read('appearance-theme.js');
const ui = read('ui.js') + '\n' + read('app-runtime-guards.js') + '\n' + read('app-health-audits.js') + '\n' + read('app-postload-audits.js') + '\n' + read('app-pwa-connectivity.js') + '\n' + read('games-engine.js') + '\n' + read('games-profile.js') + '\n' + appearanceThemeJs + '\n' + read('admin-service-usage.js') + '\n' + read('admin-rotation.js') + '\n' + read('app-navigation.js') + '\n' + read('app-bottom-nav.js') + '\n' + read('app-menu.js') + '\n' + read('app-actions.js') + '\n' + read('app-boot-selftest.js') + '\n' + read('app-rotation-sync.js') + '\n' + read('app-excel-import.js') + '\n' + read('app-rotation-controls.js') + '\n' + read('app-admin-unlock.js') + '\n' + read('app-home-boot.js') + '\n' + read('app-init.js');
const sql = read('assets/docs/sql/supabase_app_usage_v963.sql');
const indexHtml = read('index.html');
const stylesOverridesCss = read('styles-overrides.css');
const dashboardFitCss = read('styles-dashboard-fit.css');
const dashboardPolishCss = read('styles-dashboard-polish.css');
const menuPolishCss = read('styles-menu-polish.css');
const stylesGamesCss = read('styles-games.css');
const stylesReleasePolishCss = read('styles-release-polish.css');
const rotaceJs = read('rotace.js');
const dashboardCss = `${dashboardFitCss}
${dashboardPolishCss}`;
const styleHrefMatches = Array.from(indexHtml.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/g));
const styleHrefs = styleHrefMatches.map((match) => String(match[1] || '').trim()).filter(Boolean);
const localStyleHrefs = styleHrefs.filter((href) => !/^https?:/i.test(href));
const localCssByHref = Object.fromEntries(localStyleHrefs
  .filter((href) => href.endsWith('.css') && fs.existsSync(path.join(__dirname, href)))
  .map((href) => [href, read(href)]));
const dashboardCssLayerOrderContractV194 = Object.freeze([
  'styles.css',
  'styles-inline-legacy.css',
  'styles-calc-panels.css',
  'styles-games.css',
  'styles-overrides.css',
  'styles-dashboard-fit.css',
  'styles-admin-polish.css',
  'styles-menu-polish.css',
  'styles-stats-polish.css',
  'styles-viewport-polish.css',
  'styles-theme-polish.css',
  'styles-release-polish.css',
  'styles-dashboard-polish.css'
]);
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


const dashboardNoVisualOwnerDriftSelectors = Array.from(new Set([
  ...lockedDashboardSelectors,
  ...dashboardViewportStackContracts.map((contract) => contract.ownerGuard),
  '#home.page.active .dashboardShell > .dashboardGrid',
  '#home.page.active .tile.dashboardCard',
  '#home.page.active .dashboardCard .dashboardIcon.dashboardIconInline',
  '#home.page.active #dashKantyna .dashboardDot',
  '#home.page.active #dashJidelna .dashboardDot'
]));
const dashboardAllowedVisualOwnerLayers = new Set(['styles-dashboard-fit.css', 'styles-dashboard-polish.css']);

const dashboardLayerScopeGuardV197 = Object.freeze({
  intent: 'dashboard-layers-stay-inside-dashboard-scope',
  protectedAreas: Object.freeze(['bottom-navigation', 'menu', 'admin-usage', 'generic-menu-polish']),
  allowedNonDashboardPrefix: 'foodSchedule'
});
const dashboardLayerForbiddenSelectorPatternsV197 = Object.freeze([
  /(^|[\s>+~,.])(?:nav\.bottomNav|\.bottomNav[A-Za-z0-9_-]*|#bottomNavScroll|\.bottom-navigation)\b/,
  /(^|[\s>+~,.])#menu/,
  /(^|[\s>+~,.])\.adminUsage[A-Za-z0-9_-]*\b/,
  /(^|[\s>+~,.])\.adminMenu[A-Za-z0-9_-]*\b/,
  /(^|[\s>+~,.])\.menuPolish[A-Za-z0-9_-]*\b/
]);

const dashboardLegacyOwnerMap = [
  ['#home .dashboardGrid', '#home.page.active .dashboardGrid'],
  ['#home .dashboardCard', '#home.page.active .dashboardCard'],
  ['#home .dashboardHeroCard', '#home.page.active #dashHero.dashboardHeroCard'],
  ['#dashHero .dashboardHeroLine2', '#home.page.active #dashHero .dashboardHeroLine2'],
  ['#dashHero .dashboardHeroLine3', '#home.page.active #dashHero .dashboardHeroLine3'],
  ['#dashHero .dashboardHeroLine3Pill', '#home.page.active #dashHero .dashboardHeroLine3Pill'],
  ['#home .dashboardIcon.dashboardIconInline', '#home.page.active .dashboardCard .dashboardIcon.dashboardIconInline'],
  ['#home .dashboardIconInline', '#home.page.active .dashboardCard .dashboardIcon.dashboardIconInline'],
  ['#home .dashboardDot', '#home.page.active #dashKantyna .dashboardDot'],
  ['#dashKantyna .dashboardDot', '#home.page.active #dashKantyna .dashboardDot'],
  ['#dashJidelna .dashboardDot', '#home.page.active #dashJidelna .dashboardDot'],
  ['#home.page.active .dashboardShell', '#home.page.active .dashboardShell']
];

const dashboardLegacyOnlyInventoryV195 = Object.freeze([
  '#home .dashboardGrid',
  '#home .dashboardCard',
  '#home .dashboardHeroCard',
  '#dashHero .dashboardHeroLine2',
  '#dashHero .dashboardHeroLine3',
  '#dashHero .dashboardHeroLine3Pill',
  '#home .dashboardIconInline',
  '#home .dashboardIcon.dashboardIconInline',
  '#home .dashboardDot',
  '#dashKantyna .dashboardDot',
  '#dashJidelna .dashboardDot'
]);
const dashboardActiveOwnerRegistryV195 = Object.freeze([
  '#home.page.active .dashboardShell',
  '#home.page.active .dashboardGrid',
  '#home.page.active .dashboardCard',
  '#home.page.active #dashHero.dashboardHeroCard',
  '#home.page.active #dashHero .dashboardHeroLine2',
  '#home.page.active #dashHero .dashboardHeroLine3',
  '#home.page.active #dashHero .dashboardHeroLine3Pill',
  '#home.page.active .dashboardCard .dashboardIcon.dashboardIconInline',
  '#home.page.active #dashKantyna .dashboardDot',
  '#home.page.active #dashJidelna .dashboardDot'
]);

const dashboardOverridesSelectorLockV196 = Object.freeze({
  count: 256,
  sha256: '797b74acd9f476627b6b2d9e16bae57f48c684f4d2460bebb9a33a2217651113'
});

const dashboardReleaseIsolationGuardV198 = Object.freeze({
  intent: 'dashboard-cleanup-does-not-touch-export-or-games',
  protectedFiles: Object.freeze(['rotace.js', 'styles-games.css']),
  protectedFeatureMarkers: Object.freeze([
    'ROTATION_EXPORT_GLASS_THEME_V193',
    'drawRotationExportGlassPanelShell',
    'drawRotationExportGlassTitleBar',
    'downloadSelectedRotationMonthImage',
    '#games .gameBoard',
    '#games .gameBoard.game2048Board',
    '#games .gameBoard.gameSnakeBoard',
    '#games .gameBoard.gameFlapBoard'
  ]),
  forbiddenDashboardFragments: Object.freeze([
    'ROTATION_EXPORT_',
    'drawRotationExport',
    'downloadSelectedRotationMonthImage',
    'canvas.toBlob',
    '#games',
    'body.gamesOpen',
    '.gameBoard',
    '.gamesShell',
    '.game2048Board',
    '.gameSnakeBoard',
    '.gameFlapBoard'
  ])
});

const releaseMetadataContractV199 = Object.freeze({
  displayVersion: '1.2 (1.102)',
  appLabel: 'RaK 1.2 (1.102)',
  packageVersion: '1.2.102',
  cacheVersion: 'v1.2-1.102',
  realtimeChannel: 'rak-public-live-v1-2-1-102',
  changelogHeader: '## RaK 1.2 (1.102)',
  previousBuildFragments: Object.freeze(['1.2 (1.101)', '1.2.101', 'v1.2-1.101', 'rak-public-live-v1-2-1-101'])
});

const releaseMetadataActiveFilesV199 = Object.freeze([
  ['core.js', coreJs],
  ['package.json', packageJsonText],
  ['sw.js', serviceWorkerJs],
  ['supabase-bridge.js', bridge],
  ['export.js', exportJs]
]);

const dashboardCssGuardSeriesCompleteV1100 = Object.freeze({
  intent: 'dashboard-css-guard-series-closed',
  status: 'closed',
  requiredMarkers: Object.freeze([
    ['styles-overrides.css', 'Dashboard legacy override inventory guard'],
    ['styles-overrides.css', 'Dashboard proven-overridden legacy candidates'],
    ['styles-overrides.css', 'Dashboard extended proven-overridden legacy candidates'],
    ['styles-dashboard-polish.css', 'Dashboard no visual owner drift guard'],
    ['styles-dashboard-polish.css', 'Dashboard CSS layer order contract v1.94'],
    ['styles-dashboard-polish.css', 'Dashboard active owner registry'],
    ['styles-overrides.css', 'Dashboard no-new-hotfix lock v1.96'],
    ['styles-dashboard-polish.css', 'Dashboard override selector lock v1.96'],
    ['styles-dashboard-polish.css', 'Dashboard scope guard v1.97'],
    ['styles-dashboard-polish.css', 'Dashboard release isolation guard v1.98'],
    ['export.js', 'RAK_RELEASE_METADATA_CONTRACT_V199'],
    ['export.js', 'RAK_DASHBOARD_CSS_GUARD_SERIES_CONTRACT_V1100'],
    ['styles-dashboard-polish.css', 'Dashboard CSS guard series complete v1.100']
  ]),
  closedByBuild: 'RaK 1.2 (1.100)'
});



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

function stripCssComments(source) {
  return String(source || '').replace(/\/\*[\s\S]*?\*\//g, '');
}

function getCssRuleSelectors(source) {
  const selectors = [];
  const body = stripCssComments(source);
  const rulePattern = /([^{}]+)\{/g;
  let match;
  while ((match = rulePattern.exec(body))) {
    const selector = String(match[1] || '').replace(/\s+/g, ' ').trim();
    if (!selector || selector.startsWith('@')) continue;
    selectors.push(selector);
  }
  return selectors;
}

function assertDashboardLayerScopeGuard(css, layerName) {
  assertIncludes(dashboardPolishCss, 'Dashboard scope guard v1.97', 'Chybí dokumentace Dashboard scope guard v1.97');
  assert(dashboardLayerScopeGuardV197.intent === 'dashboard-layers-stay-inside-dashboard-scope', 'Dashboard scope guard v1.97 má špatný intent');
  const selectors = getCssRuleSelectors(css);
  selectors.forEach((selector) => {
    dashboardLayerForbiddenSelectorPatternsV197.forEach((pattern) => {
      assert(
        !pattern.test(selector),
        `Dashboard CSS vrstva ${layerName} nesmí upravovat mimo Dashboard scope: ${selector}`
      );
    });
  });
}

function assertDashboardReleaseIsolationGuardV198() {
  assertIncludes(dashboardPolishCss, 'Dashboard release isolation guard v1.98', 'Chybí dokumentace Dashboard release isolation guard v1.98');
  assert(dashboardReleaseIsolationGuardV198.intent === 'dashboard-cleanup-does-not-touch-export-or-games', 'Dashboard release isolation guard v1.98 má špatný intent');
  dashboardReleaseIsolationGuardV198.protectedFiles.forEach((fileName) => {
    assertIncludes(appUsageSmokeSource || '', fileName, `Dashboard release isolation guard v1.98 musí jmenovat chráněný soubor ${fileName}`);
  });
  dashboardReleaseIsolationGuardV198.protectedFeatureMarkers.forEach((marker) => {
    const source = marker.startsWith('#games') ? stylesGamesCss : rotaceJs;
    assertIncludes(source, marker, `Chráněný marker pro export/hry chybí: ${marker}`);
  });
  dashboardReleaseIsolationGuardV198.forbiddenDashboardFragments.forEach((fragment) => {
    assert(!dashboardCss.includes(fragment), `Dashboard CSS cleanup nesmí zasahovat export Rozpisů ani herní vrstvy: ${fragment}`);
  });
}

function assertReleaseMetadataContractV199() {
  const contract = releaseMetadataContractV199;
  assertIncludes(exportJs, 'RAK_RELEASE_METADATA_CONTRACT_V199', 'export.js musí obsahovat release metadata contract v1.99');
  assertIncludes(exportJs, "displayVersion: '1.2 (1.102)'", 'Release contract v export.js musí držet display verzi 1.102');
  assertIncludes(exportJs, "packageVersion: '1.2.102'", 'Release contract v export.js musí držet package verzi 1.2.102');
  assert(packageJson.version === contract.packageVersion, `package.json version drift: čekám ${contract.packageVersion}, mám ${packageJson.version}`);
  assertIncludes(coreJs, `const APP_VERSION = "${contract.displayVersion}";`, 'core.js APP_VERSION není sjednocený s 1.102');
  assertIncludes(serviceWorkerJs, `const CACHE_VERSION = '${contract.cacheVersion}';`, 'sw.js CACHE_VERSION není sjednocený s 1.102');
  assertIncludes(serviceWorkerJs, `const SW_APP_VERSION = '${contract.displayVersion}';`, 'sw.js SW_APP_VERSION není sjednocený s 1.102');
  assertIncludes(bridge, `client.channel('${contract.realtimeChannel}')`, 'Supabase realtime kanál není sjednocený s 1.102');
  assertIncludes(bridge, `realtimeChannel: '${contract.realtimeChannel}'`, 'Supabase diagnostika realtime kanálu není sjednocená s 1.101');
  assert(changelogMd.startsWith(contract.changelogHeader), 'CHANGELOG.md musí začínat aktuálním buildem 1.102');
  assertIncludes(changelogMd, `technická verze \`${contract.packageVersion}\``, 'CHANGELOG.md musí uvádět technickou verzi 1.2.102');
  assertIncludes(changelogMd, `cache \`${contract.cacheVersion}\``, 'CHANGELOG.md musí uvádět cache verzi 1.102');
  assertIncludes(exportJs, `version: '${contract.displayVersion}'`, 'export.js smoke report musí nést aktuální display verzi');
  assertIncludes(exportJs, `version: String(window.APP_VERSION || '${contract.displayVersion}')`, 'export.js fallbacky musí používat aktuální display verzi');
  releaseMetadataActiveFilesV199.forEach(([fileName, source]) => {
    contract.previousBuildFragments.forEach((fragment) => {
      assert(!String(source || '').includes(fragment), `Aktivní release soubor ${fileName} obsahuje starý build fragment: ${fragment}`);
    });
  });
}

function assertBrusyChoiceSizeContractV1101() {
  assertIncludes(exportJs, 'RAK_BRUSY_CHOICE_SIZE_CONTRACT_V1101', 'export.js musí dokumentovat sjednocení velikosti voleb Brusy v1.101');
  assertIncludes(stylesReleasePolishCss, 'Brusy / Výpočet kusů: volby brusu a indexů dorovnané velikostí', 'styles-release-polish.css musí obsahovat poznámku k Brusy v1.101');
  ['.bbtn.brusMachineBtn', '.bbtn.brusIndexBtn', '.bbtn.brusFreeIndexBtn'].forEach((selector) => {
    assertIncludes(stylesReleasePolishCss, selector, `Brusy velikostní contract v1.101 musí hlídat ${selector}`);
  });
  assertIncludes(stylesReleasePolishCss, 'height:58px !important;', 'Brusy volby musí mít stejnou výšku jako Frézky preset tlačítka');
  assertIncludes(stylesReleasePolishCss, 'min-height:58px !important;', 'Brusy volby musí držet minimální výšku 58px');
  assertIncludes(stylesReleasePolishCss, 'max-height:58px !important;', 'Brusy volby musí držet maximální výšku 58px');
  assertIncludes(stylesReleasePolishCss, '--brus-main-choice-h:58px !important;', 'Brusy hlavní volby musí být dorovnané na 58px');
  assertIncludes(stylesReleasePolishCss, '--brus-free-choice-h:58px !important;', 'Brusy volné indexy musí být dorovnané na 58px');
  assertIncludes(stylesOverridesCss, '#korekce-frezky .calcFhbPresetBtn{display:grid !important;grid-template-rows:auto auto !important;align-content:center !important;justify-items:center !important;gap:4px !important;min-height:58px !important;', 'Referenční Frézky preset tlačítka musí dál držet 58px');
}

function assertFixedAppBackgroundContractV1101() {
  assertIncludes(exportJs, 'RAK_FIXED_APP_BACKGROUND_CONTRACT_V1101', 'export.js musí dokumentovat pevné pozadí appky v1.101');
  assertIncludes(stylesReleasePolishCss, 'Pevné pozadí celé appky', 'styles-release-polish.css musí obsahovat pevné pozadí celé appky');
  assertIncludes(stylesReleasePolishCss, 'body::before', 'Pevné pozadí musí používat body::before jako fixed background vrstvu');
  assertIncludes(stylesReleasePolishCss, 'body::after', 'Pevné pozadí musí používat body::after jako fixed overlay vrstvu');
  assertIncludes(stylesReleasePolishCss, 'position:fixed !important;', 'Pozadí musí být fixované vůči viewportu');
  assertIncludes(stylesReleasePolishCss, 'background:var(--rakAppBackground, var(--bg, #050816)) !important;', 'Pevná background vrstva musí používat zvolené pozadí aplikace');
  assertIncludes(stylesReleasePolishCss, 'background:var(--rakAppBackgroundOverlay, transparent) !important;', 'Pevná overlay vrstva musí používat overlay zvoleného pozadí');
  assertIncludes(stylesReleasePolishCss, `body,
html.rakViewportPrimed body,
html.rakStableBootViewport body{
  background:transparent !important;`, 'Body musí být průhledné, aby pevná pseudo background vrstva nebyla překrytá scrollujícím pozadím');
  ['#home', '#rotace', '#statistiky', '#rozpisy', '#kalkulacky', '#games', '#soustruhy', '#frezky', '#brusy'].forEach((selector) => {
    assertIncludes(stylesReleasePolishCss, selector, `Pevné pozadí v1.101 musí pokrýt stránku ${selector}`);
  });
}

function assertNameChoiceFitContractV1102() {
  assertIncludes(exportJs, 'RAK_NAME_CHOICE_FIT_CONTRACT_V1102', 'export.js musí dokumentovat fit jmen pro Rotaci a Statistiky v1.102');
  assertIncludes(stylesReleasePolishCss, 'Volba jmen v Rotaci a Statistikách', 'styles-release-polish.css musí obsahovat poznámku k volbě jmen v1.102');
  ['#rotace.page.active #rotaceNamesPanel.active #namesGrid .rotaceTileTitle', '#statsNameGrid .statsNameTile .statsTileTitle'].forEach((selector) => {
    assertIncludes(stylesReleasePolishCss, selector, `Fit jmen v1.102 musí hlídat selector ${selector}`);
  });
  ['white-space:normal !important;', 'overflow:visible !important;', 'text-overflow:clip !important;', 'overflow-wrap:anywhere !important;', '--rak-name-choice-font:clamp(10.4px, 2.62vw, 12.6px);', '--rak-name-choice-font-tight:clamp(9.8px, 2.48vw, 11.8px);'].forEach((fragment) => {
    assertIncludes(stylesReleasePolishCss, fragment, `Fit jmen v1.102 musí obsahovat pravidlo ${fragment}`);
  });
  assertIncludes(stylesReleasePolishCss, '@media (max-width:390px)', 'Fit jmen v1.102 musí mít užší mobilní breakpoint');
}

function assertDashboardCssGuardSeriesCompleteV1100() {
  assert(dashboardCssGuardSeriesCompleteV1100.intent === 'dashboard-css-guard-series-closed', 'Dashboard CSS guard series v1.100 má špatný intent');
  assert(dashboardCssGuardSeriesCompleteV1100.status === 'closed', 'Dashboard CSS guard series v1.100 musí být uzavřená');
  assertIncludes(dashboardPolishCss, 'Dashboard CSS guard series complete v1.100', 'styles-dashboard-polish.css musí dokumentovat uzavření série Dashboard CSS guardů');
  assertIncludes(exportJs, 'RAK_DASHBOARD_CSS_GUARD_SERIES_CONTRACT_V1100', 'export.js musí obsahovat contract uzavření Dashboard CSS guardů v1.100');
  assertIncludes(exportJs, "status: 'closed'", 'Dashboard CSS guard series contract musí být označený jako closed');
  assertIncludes(exportJs, "guardRange: 'v1.90-v1.100'", 'Dashboard CSS guard series contract musí pokrývat rozsah v1.90-v1.100');
  const sources = {
    'styles-overrides.css': stylesOverridesCss,
    'styles-dashboard-polish.css': dashboardPolishCss,
    'export.js': exportJs
  };
  dashboardCssGuardSeriesCompleteV1100.requiredMarkers.forEach(([fileName, marker]) => {
    assertIncludes(sources[fileName], marker, `Dashboard CSS guard series v1.100: chybí marker ${marker} v ${fileName}`);
  });
  assertOrder(dashboardPolishCss, 'Dashboard release isolation guard v1.98', 'Dashboard CSS guard series complete v1.100', 'Uzavření Dashboard CSS guardů musí být až za release isolation guardem');
}

function getDashboardOverrideSelectorSignature(source) {
  const selectors = [];
  const body = stripCssComments(source);
  const rulePattern = /([^{}]+)\{/g;
  let match;
  while ((match = rulePattern.exec(body))) {
    const selector = String(match[1] || '').replace(/\s+/g, ' ').trim();
    if (/dashboard|dashHero|dashKantyna|dashJidelna/.test(selector)) {
      selectors.push(selector);
    }
  }
  const joined = selectors.join('\n');
  return {
    count: selectors.length,
    sha256: crypto.createHash('sha256').update(joined).digest('hex')
  };
}

function lastLocalCssOwner(selector) {
  let owner = '';
  localStyleHrefs.forEach((href) => {
    const css = localCssByHref[href];
    if (!css) return;
    if (stripCssComments(css).includes(selector)) owner = href;
  });
  return owner;
}

function assertDashboardNoVisualOwnerDrift(selector) {
  const owner = lastLocalCssOwner(selector);
  assert(owner, `Dashboard visual owner chybí pro ${selector}`);
  assert(
    dashboardAllowedVisualOwnerLayers.has(owner),
    `Dashboard visual owner drift pro ${selector}: poslední vlastník je ${owner}, povoleno jen styles-dashboard-fit.css / styles-dashboard-polish.css`
  );
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

function hexToRgb(hex) {
  const raw = String(hex || '').trim().replace(/^#/, '');
  const full = raw.length === 3 ? raw.split('').map(ch => ch + ch).join('') : raw;
  assert(/^[0-9a-f]{6}$/i.test(full), `Neplatná hex barva: ${hex}`);
  return [0, 2, 4].map(offset => parseInt(full.slice(offset, offset + 2), 16));
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(value => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground, background) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
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
assertIncludes(menuPolishCss, 'Přehled připojení avatar contract', 'Přehled připojení musí mít 1.88 avatar contract');
assertIncludes(menuPolishCss, '#menu .adminUsageSummary .adminUsageAvatar', 'Avatar musí mít silnější selektor než obecná summary span pravidla');
assertIncludes(menuPolishCss, 'align-items:center !important;', 'Avatar musí centrovat iniciály svisle');
assertIncludes(menuPolishCss, 'justify-content:center !important;', 'Avatar musí centrovat iniciály vodorovně');
assertIncludes(menuPolishCss, 'flex-direction:row !important;', 'Avatar nesmí zdědit sloupcové řazení textového wrapperu');
assert(!menuPolishCss.includes('#menu .adminUsageSummary span{'), 'Obecné pravidlo #menu .adminUsageSummary span by znovu rozhodilo avatar iniciál');
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
assert(
  JSON.stringify(localStyleHrefs) === JSON.stringify(dashboardCssLayerOrderContractV194),
  `CSS layer order drift: čekám ${dashboardCssLayerOrderContractV194.join(' → ')}, mám ${localStyleHrefs.join(' → ')}`
);
assertIncludes(dashboardPolishCss, 'Dashboard CSS layer order contract v1.94', 'styles-dashboard-polish.css musí mít 1.94 CSS layer order contract poznámku');
assertIncludes(dashboardPolishCss, 'styles-overrides.css → styles-dashboard-fit.css', '1.94 guard musí pojmenovat přechod overrides → dashboard-fit');
assertIncludes(dashboardPolishCss, 'styles-release-polish.css → styles-dashboard-polish.css', '1.94 guard musí pojmenovat finální přechod release-polish → dashboard-polish');
assert(localStyleHrefs.length >= 10, 'Index musí načítat lokální CSS vrstvy aplikace');
assert(localStyleHrefs[localStyleHrefs.length - 1] === 'styles-dashboard-polish.css', 'Dashboard polish musí být úplně poslední lokální CSS vrstva');
dashboardCriticalStyles.forEach((href) => assertSingleOccurrence(localStyleHrefs, href, 'CSS vrstva nesmí být načtená víckrát ani chybět'));
assertOrder(indexHtml, 'styles-overrides.css', 'styles-dashboard-fit.css', 'Dashboard fit CSS musí přebíjet staré overrides');
assertOrder(indexHtml, 'styles-dashboard-fit.css', 'styles-dashboard-polish.css', 'Dashboard polish musí být pozdní vítězná vrstva');
assertOrder(indexHtml, 'styles-release-polish.css', 'styles-dashboard-polish.css', 'Dashboard polish musí zůstat za release polish vrstvou');
dashboardCriticalStyles.slice(0, -1).forEach((href) => {
  assertOrder(indexHtml, href, 'styles-dashboard-polish.css', `styles-dashboard-polish.css musí zůstat za ${href}`);
});
dashboardNoVisualOwnerDriftSelectors.forEach((selector) => assertDashboardNoVisualOwnerDrift(selector));
assertIncludes(dashboardPolishCss, 'Dashboard no visual owner drift guard', 'styles-dashboard-polish.css musí mít 1.92 no visual owner drift guard');
assertIncludes(dashboardPolishCss, 'styles-dashboard-fit.css / styles-dashboard-polish.css', '1.92 guard musí jasně pojmenovat povolené Dashboard vlastníky');

assertIncludes(stylesOverridesCss, 'Dashboard legacy-only inventory', 'styles-overrides.css musí mít 1.95 legacy-only inventory guard');
assertIncludes(stylesOverridesCss, 'Tahle vrstva je u Dashboardu braná jen jako historická stopa starých hotfixů.', '1.95 legacy guard musí jasně říct, že overrides není aktivní vlastník Dashboardu');
assertIncludes(stylesOverridesCss, 'Aktivní vizuální vlastníci pro stejné oblasti jsou evidovaní zvlášť ve styles-dashboard-fit.css / styles-dashboard-polish.css.', '1.95 legacy guard musí odkázat na aktivní dashboard vrstvy');
assertIncludes(dashboardPolishCss, 'Dashboard active owner registry', 'styles-dashboard-polish.css musí mít 1.95 active owner registry guard');
assertIncludes(dashboardPolishCss, 'Aktivní vlastníci jsou oddělení od legacy inventury', '1.95 active owner registry musí jasně oddělit aktivní vlastníky od legacy inventury');
const dashboardLegacyOnlySetV195 = new Set(dashboardLegacyOnlyInventoryV195);
const dashboardActiveOwnerSetV195 = new Set(dashboardActiveOwnerRegistryV195);
dashboardLegacyOnlyInventoryV195.forEach((selector) => {
  assertIncludes(stylesOverridesCss, selector, `1.95 legacy-only inventory musí obsahovat ${selector}`);
  assert(!dashboardActiveOwnerSetV195.has(selector), `Legacy-only selector nesmí být zároveň aktivní vlastník: ${selector}`);
});
dashboardActiveOwnerRegistryV195.forEach((selector) => {
  assertCssOwner(selector, `1.95 active owner registry musí mít pozdní dashboard vlastníka pro ${selector}`);
  assert(!dashboardLegacyOnlySetV195.has(selector), `Active owner selector nesmí být zároveň legacy-only položka: ${selector}`);
  assertDashboardNoVisualOwnerDrift(selector);
});
dashboardLegacyOwnerMap.forEach(([legacySelector, ownerSelector]) => {
  if (legacySelector !== ownerSelector) {
    assert(dashboardLegacyOnlySetV195.has(legacySelector), `Legacy selector není v 1.95 legacy-only inventuře: ${legacySelector}`);
    assert(dashboardActiveOwnerSetV195.has(ownerSelector), `Owner selector není v 1.95 active registry: ${ownerSelector}`);
  }
});
assert(dashboardLegacyOnlyInventoryV195.length >= 11, '1.95 legacy-only inventory musí dál pokrýt všechny staré Dashboard oblasti');
assert(dashboardActiveOwnerRegistryV195.length >= 10, '1.95 active owner registry musí dál pokrýt hlavní Dashboard vlastníky');

assertIncludes(stylesOverridesCss, 'Dashboard no-new-hotfix lock v1.96', 'styles-overrides.css musí mít 1.96 guard proti novým Dashboard hotfixům');
assertIncludes(stylesOverridesCss, 'Nové vizuální Dashboard úpravy už sem nepřidávat', '1.96 guard musí jasně říkat, že nové Dashboard úpravy nepatří do overrides');
assertIncludes(dashboardPolishCss, 'Dashboard override selector lock v1.96', 'styles-dashboard-polish.css musí mít 1.96 owner-side lock poznámku');
const dashboardOverridesSignatureV196 = getDashboardOverrideSelectorSignature(stylesOverridesCss);
assert(
  dashboardOverridesSignatureV196.count === dashboardOverridesSelectorLockV196.count,
  `Dashboard overrides selector count drift: čekám ${dashboardOverridesSelectorLockV196.count}, mám ${dashboardOverridesSignatureV196.count}`
);
assert(
  dashboardOverridesSignatureV196.sha256 === dashboardOverridesSelectorLockV196.sha256,
  `Dashboard overrides selector lock drift: čekám ${dashboardOverridesSelectorLockV196.sha256}, mám ${dashboardOverridesSignatureV196.sha256}`
);


// Vítězné dashboard vlastnictví: test drží klíčové selektory v dashboard vrstvách, ne ve slepých globálních přepisech.
lockedDashboardSelectors.forEach((selector) => assertCssOwner(selector));
assertIncludes(stylesOverridesCss, 'Dashboard legacy override inventory guard', 'styles-overrides.css musí mít legacy guard poznámku pro historické Dashboard hotfixy');
assertIncludes(stylesOverridesCss, 'vítězné Dashboard vrstvy jsou styles-dashboard-fit.css a styles-dashboard-polish.css', 'Legacy guard musí jasně pojmenovat pozdější Dashboard vlastníky');
assertIncludes(stylesOverridesCss, 'Dashboard legacy owner map', 'styles-overrides.css musí mít 1.78 mapu legacy → active owner');
assertIncludes(stylesOverridesCss, 'Dashboard proven-overridden legacy candidates', 'styles-overrides.css musí mít 1.90 seznam prvních přebitých Dashboard legacy kandidátů');
assertIncludes(stylesOverridesCss, 'Dashboard extended proven-overridden legacy candidates', 'styles-overrides.css musí mít 1.91 rozšířený seznam přebitých Dashboard legacy kandidátů');
assertIncludes(stylesOverridesCss, 'Nepřidávat sem nové Dashboard hotfixy', '1.90 guard musí varovat před novými Dashboard hotfixy ve staré overrides vrstvě');
['#home .dashboardGrid', '#home .dashboardCard', '#home .dashboardHeroCard', '#dashHero .dashboardHeroLine3', '#home .dashboardDot'].forEach((selector) => {
  assertIncludes(stylesOverridesCss, selector, `1.90 legacy candidate chybí: ${selector}`);
});
['#home .dashboardIconInline', '#home .dashboardIcon.dashboardIconInline', '#dashHero .dashboardHeroLine2', '#dashHero .dashboardHeroLine3Pill', '#dashKantyna .dashboardDot', '#dashJidelna .dashboardDot'].forEach((selector) => {
  assertIncludes(stylesOverridesCss, selector, `1.91 extended legacy candidate chybí: ${selector}`);
});
assertIncludes(stylesOverridesCss, 'žádné mazání ani vizuální změna Dashboardu', '1.91 guard musí držet cleanup bez vizuální změny');
assertIncludes(dashboardPolishCss, 'Dashboard legacy cleanup active owners remain here', 'styles-dashboard-polish.css musí držet 1.90 aktivní owner guard');
assertIncludes(dashboardPolishCss, 'Dashboard legacy cleanup extended owners remain here', 'styles-dashboard-polish.css musí držet 1.91 rozšířený aktivní owner guard');
assertIncludes(stylesOverridesCss, 'Mapované oblasti: shell, hero panel, grid, karty, stavové tečky Kantýna/Jídelna', 'Legacy mapa musí pojmenovat hlavní Dashboard oblasti');
dashboardLegacyOwnerMap.forEach(([legacySelector, ownerSelector]) => {
  assertLegacyDashboardGuard(legacySelector, ownerSelector);
});
assert(dashboardLegacyOwnerMap.length >= 11, 'Dashboard legacy owner mapa musí hlídat minimálně 11 starých Dashboard oblastí');
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

// 1.89: readability guard – odemykané theme/pozadí mohou být výrazné, ale musí držet čitelnost na Dashboardu a v Administraci.
assertIncludes(appearanceThemeJs, 'RAK_APPEARANCE_READABILITY_CONTRACT_V189', 'Chybí 1.89 appearance readability contract');
assertIncludes(appearanceThemeJs, "intent: 'dashboard-admin-readable-appearance'", 'Readability contract musí mířit na Dashboard/Admin čitelnost');
['dashboard', 'admin-connections', 'settings-appearance', 'games-leaderboards'].forEach((screen) => {
  assertIncludes(appearanceThemeJs, screen, `Readability contract musí chránit obrazovku ${screen}`);
});
['--bg', '--panel', '--panel2', '--green', '--green2', '--muted', '--soft', '--rakThemeGlow', '--rakThemeBorder'].forEach((varName) => {
  assertIncludes(appearanceThemeJs, varName, `Readability contract musí hlídat theme proměnnou ${varName}`);
});
['--rakBgBase', '--rakAppBackground', '--rakAppBackgroundOverlay', '--rakAppBackgroundLite', '--rakBgAccent'].forEach((varName) => {
  assertIncludes(appearanceThemeJs, varName, `Readability contract musí hlídat background proměnnou ${varName}`);
});
[
  'Každé theme musí mít světlé --soft a dostatečně čitelné --muted proti --bg.',
  'Každé pozadí musí mít tmavý --rakBgBase, aby glass panely zůstaly čitelné.',
  'Dashboard, Administrace a Nastavení vzhledu nesmí spoléhat jen na barvu akcentu.',
  'Výrazný reward skin může měnit náladu, ale nesmí zhoršit kontrast textu a panelů.'
].forEach((rule) => assertIncludes(appearanceThemeJs, rule, `Readability pravidlo chybí: ${rule}`));
assertOrder(appearanceThemeJs, 'RAK_APPEARANCE_REWARD_CONTRACT_V181', 'RAK_APPEARANCE_READABILITY_CONTRACT_V189', 'Readability contract musí navazovat na reward contract');
assertOrder(appearanceThemeJs, 'RAK_APPEARANCE_READABILITY_CONTRACT_V189', 'window.RAK_BACKGROUND_DEFS = RAK_BACKGROUND_DEFS', 'Readability contract má být vystavený před background definicemi');
themeDefs.forEach((theme) => {
  const vars = theme && theme.vars ? theme.vars : {};
  ['--bg', '--panel', '--panel2', '--green', '--green2', '--muted', '--soft', '--rakThemeGlow', '--rakThemeBorder'].forEach((varName) => {
    assert(vars[varName], `Theme ${theme.id} nemá čitelnostní proměnnou ${varName}`);
  });
  assert(contrastRatio(vars['--soft'], vars['--bg']) >= 4.5, `Theme ${theme.id} má slabý kontrast --soft proti --bg`);
  assert(contrastRatio(vars['--muted'], vars['--bg']) >= 3, `Theme ${theme.id} má slabý kontrast --muted proti --bg`);
});
backgroundDefs.forEach((bg) => {
  const vars = bg && bg.vars ? bg.vars : {};
  ['--rakBgBase', '--rakAppBackground', '--rakAppBackgroundOverlay', '--rakAppBackgroundLite', '--rakBgAccent'].forEach((varName) => {
    assert(vars[varName], `Pozadí ${bg.id} nemá čitelnostní proměnnou ${varName}`);
  });
  assert(relativeLuminance(vars['--rakBgBase']) <= 0.08, `Pozadí ${bg.id} má moc světlý základ pro glass čitelnost`);
});

assertIncludes(rotaceJs, 'function buildRotationMonthExportSummary(month)', 'Export rozpisu musí umět spočítat měsíční přehled');
assertIncludes(rotaceJs, 'ROTATION_EXPORT_MONTH_SUMMARY_LABELS_V187', 'Export Rozpisů musí mít uzamčený 1.87 contract pro 4 řádky měsíčního přehledu');
assertIncludes(rotaceJs, "const rows = ROTATION_EXPORT_MONTH_SUMMARY_LABELS_V187.map", 'Měsíční přehled musí vznikat z contract labelů, ne ručně bobtnat dalšími řádky');
assertIncludes(rotaceJs, "drawRotationExportSummaryCard(ctx, 'Měsíční přehled'", 'Export rozpisu musí vykreslit kartu Měsíční přehled');
assertIncludes(rotaceJs, 'ROTATION_EXPORT_GLASS_THEME_V193', 'Export Rozpisů musí mít sdílený glass contract pro všechny exportní karty');
assertIncludes(rotaceJs, 'function drawRotationExportGlassPanelShell', 'Export Rozpisů musí mít sdílený glass shell pro panely');
assertIncludes(rotaceJs, 'function drawRotationExportGlassTitleBar', 'Export Rozpisů musí mít sdílený glass title bar pro všechny panely');
assertIncludes(rotaceJs, 'Object.assign({}, ROTATION_EXPORT_GLASS_THEME_V193', 'Export Rozpisů musí používat sdílený glass theme místo ručně rozhozených barev');
assertIncludes(rotaceJs, 'const glowTopRight = ctx.createRadialGradient', 'Export Rozpisů musí mít jemné iOS glass pozadí');
assert(!rotaceJs.includes("titleBg: '#0f172a'"), 'Export Rozpisů už nemá vracet tmavý jednobarevný header Tvrdota');
assert(!rotaceJs.includes("titleBg: '#172554'"), 'Export Rozpisů už nemá vracet staré oddělené jednobarevné headery');
assertIncludes(rotaceJs, 'const rowH = Math.max(36, Number(opts.rowH) || 44);', 'Helper měsíčního přehledu musí držet kompaktní řádky');
assertIncludes(rotaceJs, 'function getRotationExportSummaryCardHeight(rows, options)', 'Export musí počítat výšku Měsíčního přehledu sdíleným helperem');
assertIncludes(rotaceJs, 'const summaryH = getRotationExportSummaryCardHeight', 'Canvas výška musí používat stejný helper jako vykreslení karty Měsíční přehled');
assertIncludes(rotaceJs, 'const exportFooterSafeGap = 36', 'Export Rozpisů musí mít bezpečnou mezeru mezi pravým souhrnem a footerem');
assertIncludes(rotaceJs, 'contentH + exportFooterSafeGap + footerH', 'Výška exportního canvasu musí započítat footer safe gap');
assertIncludes(rotaceJs, 'return titleH + headerH + rowH * dataRows.length + noteH;', 'Sdílený helper výšky měsíčního přehledu musí fungovat i bez poznámky');
['Směn celkem', 'Ranní směny', 'Noční směny', 'Obsazenost'].forEach((label) => {
  assertIncludes(rotaceJs, label, `Měsíční exportní přehled musí obsahovat položku ${label}`);
});
['Směn do práce', 'Dní se směnou', 'Míst celkem', 'Plán obsazeno', 'Plán volno', 'Plán obsazenost', 'Po absencích obsazeno', 'Po absencích volno', 'Obsazenost měsíce', 'Absence záznamů', 'Absence směn', 'note: summaryNote', 'Plán = obsazení zapsané v rozpisu. Po absencích = plán mínus absence směn.'].forEach((label) => {
  assert(!rotaceJs.includes(label), `Zjednodušený měsíční přehled už nemá obsahovat ${label}`);
});
assertIncludes(rotaceJs, 'const rows = [', 'Měsíční přehled musí stavět jednoduché pole řádků');
assertIncludes(rotaceJs, "'Obsazenost': formatPercent(occupancyPercent)", 'Zjednodušený měsíční přehled musí ukázat jedinou obsazenost z contract mapy');

assert(!/bottomNav|bottomNavBtn|bottomNavScroll|bottomNavIndicator/.test(dashboardCss), 'Dashboard CSS vrstva nesmí upravovat spodní lištu');
assertIncludes(dashboardPolishCss, 'Dashboard scope guard v1.97', 'styles-dashboard-polish.css musí dokumentovat, že Dashboard vrstvy nesahají mimo Dashboard scope');
assertDashboardLayerScopeGuard(dashboardFitCss, 'styles-dashboard-fit.css');
assertDashboardLayerScopeGuard(dashboardPolishCss, 'styles-dashboard-polish.css');
['bottom-navigation', 'menu', 'admin-usage', 'generic-menu-polish'].forEach((area) => {
  assertIncludes(appUsageSmokeSource || '', area, `Dashboard scope guard v1.97 musí jmenovat chráněnou oblast ${area}`);
});
assertDashboardReleaseIsolationGuardV198();
assertDashboardCssGuardSeriesCompleteV1100();
assertReleaseMetadataContractV199();
assertBrusyChoiceSizeContractV1101();
assertFixedAppBackgroundContractV1101();
assertNameChoiceFitContractV1102();

console.log('app-usage-smoke-v963 OK + dashboard-css-contract-guard + appearance-reward-contract + rotation-export-summary-simple-guard + rotation-export-glass-guard + appearance-readability-guard + css-layer-order-v194-guard + dashboard-owner-registry-v195-guard + dashboard-overrides-selector-lock-v196-guard + dashboard-scope-v197-guard + dashboard-release-isolation-v198-guard + dashboard-css-guard-series-v1100-complete + release-metadata-v199-guard + brusy-choice-size-v1101-guard + fixed-app-background-v1101-guard + name-choice-fit-v1102-guard + no-visual-owner-drift-guard OK');
