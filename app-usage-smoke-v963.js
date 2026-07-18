#!/usr/bin/env node
// RaK 1.2 (1.308) – smoke test přehledu připojení + Dashboard/appearance contract guard.
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
const gamesArcadeJs = read('games-arcade.js');
const gamesProfileJs = read('games-profile.js');
const adminUnlockJs = read('app-admin-unlock.js');
const adminRotationJs = read('admin-rotation.js');
const appearanceThemeJs = read('appearance-theme.js');
const ui = read('ui.js') + '\n' + read('app-runtime-guards.js') + '\n' + read('app-health-audits.js') + '\n' + read('app-postload-audits.js') + '\n' + read('app-pwa-connectivity.js') + '\n' + read('games-engine.js') + '\n' + read('games-profile.js') + '\n' + appearanceThemeJs + '\n' + read('admin-service-usage.js') + '\n' + read('admin-rotation.js') + '\n' + read('app-navigation.js') + '\n' + read('app-bottom-nav.js') + '\n' + read('app-menu.js') + '\n' + read('app-actions.js') + '\n' + read('app-boot-selftest.js') + '\n' + read('app-rotation-sync.js') + '\n' + read('app-excel-import.js') + '\n' + read('app-rotation-controls.js') + '\n' + read('app-admin-unlock.js') + '\n' + read('app-home-boot.js') + '\n' + read('app-init.js');
const sql = read('assets/docs/sql/supabase_app_usage_v963.sql');
const indexHtml = read('index.html');
const dashboardJs = read('dashboard.js');
const payrollJs = read('payroll.js');
const adminReportsJs = read('admin-reports.js');
const stylesOverridesCss = read('styles-overrides.css');
const dashboardFitCss = read('styles-dashboard-fit.css');
const dashboardPolishCss = read('styles-dashboard-polish.css');
const menuPolishCss = read('styles-menu-polish.css');
const stylesAdminPolishCss = read('styles-admin-polish.css');
const stylesGamesCss = read('styles-games.css');
const stylesReleasePolishCss = read('styles-release-polish.css');
const rotaceJs = read('rotace.js');
const brusyJs = read('brusy.js');
const stylesLayoutCss = read('styles-layout.css');
const browserSmokeJs = read('browser-smoke-v1103.js');
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
  'styles-dashboard-polish.css',
  'styles-daymods.css'
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
  displayVersion: '1.2 (1.308)',
  appLabel: 'RaK 1.2 (1.308)',
  packageVersion: '1.2.308',
  cacheVersion: 'v1.2-1.308',
  realtimeChannel: 'rak-public-live-v1-2-1-126',
  changelogHeader: '## RaK 1.2 (1.308)',
  previousBuildFragments: Object.freeze(['1.2 (1.138)', '1.2.138', 'v1.2-1.138', '1.2 (1.137)', '1.2.137', 'v1.2-1.137', '1.2 (1.118)', '1.2.118', 'v1.2-1.118', 'rak-public-live-v1-2-1-118'])
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

function assertNotIncludes(source, fragment, msg) {
  assert(!String(source || '').includes(fragment), msg);
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
  assertIncludes(exportJs, "displayVersion: '1.2 (1.308)'", 'Release contract v export.js musí držet display verzi 1.105');
  assertIncludes(exportJs, "packageVersion: '1.2.308'", 'Release contract v export.js musí držet package verzi 1.2.114');
  assert(packageJson.version === contract.packageVersion, `package.json version drift: čekám ${contract.packageVersion}, mám ${packageJson.version}`);
  assertIncludes(coreJs, `const APP_VERSION = "${contract.displayVersion}";`, 'core.js APP_VERSION není sjednocený s 1.105');
  assertIncludes(serviceWorkerJs, `const CACHE_VERSION = '${contract.cacheVersion}';`, 'sw.js CACHE_VERSION není sjednocený s 1.105');
  assertIncludes(serviceWorkerJs, `const SW_APP_VERSION = '${contract.displayVersion}';`, 'sw.js SW_APP_VERSION není sjednocený s 1.105');
  assertIncludes(bridge, `client.channel('${contract.realtimeChannel}')`, 'Supabase realtime kanál není sjednocený s 1.105');
  assertIncludes(bridge, `realtimeChannel: '${contract.realtimeChannel}'`, 'Supabase diagnostika realtime kanálu není sjednocená s 1.105');
  assert(changelogMd.startsWith(contract.changelogHeader), 'CHANGELOG.md musí začínat aktuálním buildem 1.105');
  assertIncludes(changelogMd, `technicka verze \`${contract.packageVersion}\``, 'CHANGELOG.md musi uvadet technickou verzi');
  assertIncludes(changelogMd, `cache \`${contract.cacheVersion}\``, 'CHANGELOG.md musí uvádět cache verzi 1.105');
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
  assertIncludes(stylesReleasePolishCss, 'brusFreeWrap > .bbtn.brusFreeIndexBtn', 'Volné indexy Brusy musí mít pozdní konkrétní selector kvůli reálnému browser smoke testu');
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
assert(ui.includes("action: 'open-usage', label: 'Přehled připojení'"), 'Tlačítko Přehled připojení chybí');
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
assert(localStyleHrefs.indexOf('styles-dashboard-polish.css') < localStyleHrefs.indexOf('styles-daymods.css'), 'Denní výjimky musí být až za dashboard polish vrstvou');
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
assertIncludes(dashboardJs, 'RAK_DASHBOARD_EMPTY_ABSENCE_TEXT_CONTRACT_V1104', 'Dashboard musí mít contract pro prázdný stav absence směny D');
assertIncludes(dashboardJs, "currentText: 'Nikdo nechybí.'", 'Dashboard aktuální směna bez absence musí psát přesně: Nikdo nechybí.');
assertIncludes(dashboardJs, "futureText: 'Nikdo nebude chybět.'", 'Dashboard budoucí směna bez absence musí psát přesně: Nikdo nebude chybět.');
assertIncludes(dashboardJs, "sub: list.length ? 'chybí: ' + formatDashboardAbsenceList(list) : 'Nikdo nechybí.'", 'Dashboard nesmí pro aktuální směnu vracet chybí: nikdo');
assertIncludes(dashboardJs, "return list.length ? 'bude chybět: ' + list.join(', ') : 'Nikdo nebude chybět.';", 'Dashboard musí pro budoucí směnu D nahradit bude chybět: nikdo přirozeným textem');
assert(!dashboardJs.includes("sub: 'bude chybět: ' + formatDashboardAbsenceList(names)"), 'Dashboard se nesmí vrátit k textu bude chybět: nikdo');
assert(!dashboardJs.includes("sub: 'chybí: ' + formatDashboardAbsenceList(names)"), 'Dashboard se nesmí vrátit k textu chybí: nikdo');
assertIncludes(rotaceJs, 'RAK_ROTACE_EMPTY_ABSENCE_TEXT_CONTRACT_V1105', 'Rotace musí mít stejný prázdný stav absencí jako Dashboard');
assertIncludes(rotaceJs, "text: 'Nikdo nebude chybět.'", 'Rotace prázdný stav směny musí psát přesně: Nikdo nebude chybět.');
assertIncludes(rotaceJs, "missingNames.length ? 'Chybí: ' + missingNames.join(', ') : 'Nikdo nebude chybět.'", 'Rotace musí pro nulovou absenci psát Nikdo nebude chybět.');
assert(!rotaceJs.includes("Chybí: ' + escapeHtml(missingText)") || rotaceJs.includes("' + escapeHtml(missingText) + '"), 'Rotace nesmí skládat prázdné Chybí: nikdo');

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

// 1.80: theme/pozadí jsou teď pevná kurátorovaná sada bez odemykání – žádné zamykání, žádné duplicity, žádné gating pole.
const themeDefs = readAppearanceArray('RAK_THEME_DEFS');
const backgroundDefs = readAppearanceArray('RAK_BACKGROUND_DEFS');
const themeIdList = themeDefs.map((item) => String(item && item.id || ''));
const backgroundIdList = backgroundDefs.map((item) => String(item && item.id || ''));
const themeIds = new Set(themeIdList);
const backgroundIds = new Set(backgroundIdList);
assert(themeDefs.length === 6, `Theme seznam musí mít přesně 6 kurátorovaných položek, nalezeno ${themeDefs.length}`);
assert(backgroundDefs.length === 6, `Pozadí seznam musí mít přesně 6 kurátorovaných položek, nalezeno ${backgroundDefs.length}`);
assert(themeIds.size === themeIdList.length, 'Theme seznam nesmí obsahovat duplicitní id');
assert(backgroundIds.size === backgroundIdList.length, 'Pozadí seznam nesmí obsahovat duplicitní id');
['default', 'light-brown', 'midnight-blue', 'graphite', 'sunset-plasma', 'violet-pulse'].forEach((id) => {
  assert(themeIds.has(id), `Theme seznam musí obsahovat ${id}`);
});
['ios-mesh', 'skoda-green', 'deep-aurora', 'sunset-plasma', 'light-zigzag', 'amoled-grid'].forEach((id) => {
  assert(backgroundIds.has(id), `Pozadí seznam musí obsahovat ${id}`);
});
[...themeDefs, ...backgroundDefs].forEach((item) => {
  ['unlockText', 'minPlays', 'minAchievements', 'minRank'].forEach((field) => {
    assert(!Object.prototype.hasOwnProperty.call(item || {}, field), `Položka ${item && item.id} nesmí mít gating pole ${field} – výběr je vždy dostupný`);
  });
});
[
  'getThemeUnlockMetrics', 'getThemeUnlockScore', 'isAppearanceRewardUnlocked', 'getRakProfileAppearanceRewardHealth',
  'RAK_BACKGROUND_UNLOCKS_V927', 'RAK_APPEARANCE_REWARD_CONTRACT_V181', 'RAK_APPEARANCE_READABILITY_CONTRACT_V189',
  'RAK_APPEARANCE_LOCKED_PREFERENCE_PRESERVE_CONTRACT_V1144', 'RAK_PATTERN_BACKGROUND_META_V1132',
  'RAK_PATTERN_BACKGROUND_VARIANTS_V1132', 'applyPatternBackgroundsV1132', 'applyLightPatternBackgroundsV1131',
  'appMenuThemeBadge'
].forEach((token) => {
  assert(!appearanceThemeJs.includes(token), `appearance-theme.js už nesmí obsahovat odemykací/pattern pozůstatek: ${token}`);
});
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
  assert(bg.id === 'light-zigzag' || relativeLuminance(vars['--rakBgBase']) <= 0.08, `Pozadí ${bg.id} má moc světlý základ pro dark glass čitelnost`);
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
assertIncludes(rotaceJs, 'const rows = ROTATION_EXPORT_MONTH_SUMMARY_LABELS_V187.map', 'Měsíční přehled musí stavět jednoduché pole řádků z contract mapy');
assertIncludes(rotaceJs, "'Obsazenost': formatPercent(occupancyPercent)", 'Zjednodušený měsíční přehled musí ukázat jedinou obsazenost z contract mapy');

assert(!/bottomNav|bottomNavBtn|bottomNavScroll|bottomNavIndicator/.test(dashboardCss), 'Dashboard CSS vrstva nesmí upravovat spodní lištu');
assertIncludes(dashboardPolishCss, 'Dashboard scope guard v1.97', 'styles-dashboard-polish.css musí dokumentovat, že Dashboard vrstvy nesahají mimo Dashboard scope');
assertDashboardLayerScopeGuard(dashboardFitCss, 'styles-dashboard-fit.css');
assertDashboardLayerScopeGuard(dashboardPolishCss, 'styles-dashboard-polish.css');
['bottom-navigation', 'menu', 'admin-usage', 'generic-menu-polish'].forEach((area) => {
  assertIncludes(appUsageSmokeSource || '', area, `Dashboard scope guard v1.97 musí jmenovat chráněnou oblast ${area}`);
});
assertDashboardReleaseIsolationGuardV198();

function assertAppearanceUpdatePersistenceContractV1105() {
  assertIncludes(exportJs, 'RAK_APPEARANCE_UPDATE_PERSISTENCE_CONTRACT_V1105', 'export.js musí dokumentovat appearance update persistence contract v1.105');
  assertIncludes(appearanceThemeJs, 'RAK_APPEARANCE_UPDATE_PERSISTENCE_CONTRACT_V1105', 'appearance-theme.js musí obsahovat update persistence contract v1.105');
  assertIncludes(appearanceThemeJs, 'nevracet vybrané pozadí po aktualizaci na základní', 'Appearance contract musí popsat problém resetu pozadí při aktualizaci');
  assertIncludes(appearanceThemeJs, 'if (!ui.backgroundId) { ui.backgroundId = localBg || defaultBg; changed = true; }', 'Chybějící profilové pozadí se musí migrovat z localStorage fallbacku');
  assertIncludes(appearanceThemeJs, 'if (!ui.themeId) { ui.themeId = localTheme || defaultTheme; changed = true; }', 'Chybějící profilové theme se musí migrovat z localStorage fallbacku');
  assert(!appearanceThemeJs.includes('if (!ui.backgroundId) { ui.backgroundId = defaultBg; changed = true; }'), 'Aktualizace se nesmí vrátit k okamžitému resetu pozadí na defaultBg');
}

function assertBrowserSmokeContractV1103() {
  assertIncludes(exportJs, 'RAK_BROWSER_SMOKE_CONTRACT_V1103', 'export.js musí dokumentovat browser smoke contract v1.103');
  assertIncludes(exportJs, "command: 'npm run test:browser-smoke'", 'Browser smoke contract musí uvádět npm příkaz');
  assertIncludes(packageJsonText, '"test:browser-smoke": "node browser-smoke-v1103.js"', 'package.json musí obsahovat test:browser-smoke');
  assertIncludes(packageJsonText, 'node --check browser-smoke-v1103.js', 'npm run check musí kontrolovat syntaxi browser smoke testu');
  assertIncludes(exportJs, '"browser-smoke-v1103.js": "src-browser-smoke-v1103-js"', 'export manifest musí obsahovat browser-smoke-v1103.js');
  assertIncludes(exportJs, '"browser-smoke-v1103.js"', 'export JS files musí obsahovat browser-smoke-v1103.js');
  ['local-chromium-cdp', 'about-blank-inline-html', 'iPhone 13/14 Pro Max', 'Samsung A15 / Android běžný', 'úzký mobil 360×800', 'Rotace export canvas', 'fixed background'].forEach((fragment) => {
    assertIncludes(exportJs, fragment, `Browser smoke contract musí hlídat ${fragment}`);
    assertIncludes(browserSmokeJs, fragment, `browser-smoke-v1103.js musí reálně testovat/uvádět ${fragment}`);
  });
  ['CHROMIUM_BIN', 'buildInlineSmokeHtml', 'createStaticServer', 'CdpClient', 'Emulation.setDeviceMetricsOverride', 'about-blank-inline-html', 'createRotationMonthExportCanvas', 'adminGenerateRotationMonthDraft', '#brusy .brusMachineBtn', '#games.page.active', '#menu.page.active'].forEach((fragment) => {
    assertIncludes(browserSmokeJs, fragment, `browser-smoke-v1103.js musí obsahovat ${fragment}`);
  });
}

function assertRotationGeneratorContractV1106() {
  assertIncludes(exportJs, 'RAK_ROTATION_GENERATOR_CONTRACT_V1106', 'export.js musí dokumentovat generátor rozpisů v1.106');
  assertIncludes(ui, 'RAK_ROTATION_GENERATOR_CONTRACT_V1106', 'admin-rotation.js musí obsahovat generátor contract v1.106');
  assertIncludes(ui, 'data-admin-action="generate-rotation"', 'Administrace Rozpisů musí mít akci generate-rotation');
  assertIncludes(ui, 'Vygenerovat návrh', 'Administrace Rozpisů musí mít tlačítko Vygenerovat návrh');
  assertIncludes(ui, 'function adminGenerateRotationMonthDraft(monthKey, preparedMonth)', 'Generátor rozpisu musí mít samostatnou funkci');
  assertIncludes(ui, 'adminBuildRotationGenerationModel(monthKey)', 'Generátor musí stavět model z historických rotací');
  assertIncludes(ui, 'previousYearTemplates', 'Generátor musí umět preferovat loňský měsíc jako historický vzor');
  assertIncludes(ui, 'adminRotationNamesForAbsenceDate', 'Generátor musí respektovat absence v daný den');
  assertIncludes(ui, 'function buildAdminRotationGeneratorRuleSummaryHtml', 'Pravidla generatoru musi mit admin-only souhrn podminek generovani');
  assertIncludes(ui, 'Podmínky generování', 'Admin generator musi ukazovat citelny souhrn podminek');
  assertIncludes(ui, 'Návrh se do online rotace propíše až po ruční kontrole a tlačítku Uložit rozpis.', 'Souhrn generatoru musi jasne rikat, ze navrh se sam neuklada');
  assertIncludes(ui, 'TNKS01 / TPKW01 po sobě', 'Souhrn generatoru musi zminit pravidlo TNKS01/TPKW01 po sobe');
  assertIncludes(stylesAdminPolishCss, '.adminGeneratorRulesSummary', 'Souhrn pravidel generatoru musi mit vlastni admin-only styl');
  assertIncludes(stylesAdminPolishCss, '.adminGeneratorRulesGrid', 'Souhrn pravidel generatoru musi mit prehlednou mrizku');
  assertIncludes(ui, 'function buildAdminRotationPreSaveChecklistHtml', 'Editor rozpisu musi mit admin-only kontrolu pred ulozenim');
  assertIncludes(ui, 'function adminRenderRotationPreSaveChecklist', 'Kontrola pred ulozenim se musi umet zive prepocitat z editoru');
  assertIncludes(ui, 'adminRenderRotationPreSaveChecklist(root)', 'Udrzba editoru musi prepocitavat i kontrolu pred ulozenim');
  assertIncludes(ui, 'Kontrola před uložením', 'Editor rozpisu musi ukazovat kontrolu pred ulozenim');
  assertIncludes(ui, 'Online změna proběhne až tlačítkem Uložit rozpis.', 'Kontrola pred ulozenim musi jasne rikat, ze online zmena je az po rucnim ulozeni');
  assertIncludes(stylesAdminPolishCss, '.adminRotationPreSaveCheck', 'Kontrola pred ulozenim musi mit vlastni admin-only styl');
  assertIncludes(stylesAdminPolishCss, '.adminRotationPreSaveGrid', 'Kontrola pred ulozenim musi mit prehlednou mrizku');
  assertIncludes(exportJs, 'confirm-before-overwrite', 'Generátor contract musí chránit existující rozpis před přepsáním');
  assertIncludes(ui, 'Generátor se spouští až po kontrole dnů a absencí', 'Generátor nesmí ukládat online bez kontroly dnů a absencí');
  assertIncludes(ui, 'adminRotationMonthHasFilledCells(monthKey)', 'Před přepsáním obsazeného měsíce musí být kontrola vyplněných polí');
}

function assertRotationGeneratorRulesContractV1107() {
  assertIncludes(exportJs, 'RAK_ROTATION_GENERATOR_RULES_CONTRACT_V1107', 'export.js musí dokumentovat pravidlový generátor v1.107');
  assertIncludes(ui, 'RAK_ROTATION_GENERATOR_RULES_V1107', 'admin-rotation.js musí obsahovat pravidla generátoru v1.107');
  assertIncludes(ui, 'nejdřív doplň absence / svátek / odstávku', 'Administrace musí jasně vést k zadání absencí před generováním');
  assertIncludes(ui, 'Průvodce nejdřív zkontroluje měsíc a pracovní dny', 'Po generování musí existovat průvodce s kontrolou dnů');
  ['Střížek', 'Synek', 'Třasák', 'Špadrna', 'Novotný'].forEach((name) => assertIncludes(ui, name, `Měkota preferred pravidlo musí obsahovat ${name}`));
  ['Blažek', 'Kmínek', 'Kříž', 'Pech', 'Starý'].forEach((name) => assertIncludes(ui, name, `Tvrdota preferred pravidlo musí obsahovat ${name}`));
  ['TNKS01', 'TBKR07', 'TPKW01', 'TPKW02', 'TBKR01'].forEach((machine) => assertIncludes(ui, machine, `Tvrdota cyklus musí obsahovat ${machine}`));
  ['MSKC01', 'MSKC03', 'MSKC04', 'MFKF06', 'MFKF10'].forEach((machine) => assertIncludes(ui, machine, `Měkota stroje musí obsahovat ${machine}`));
  assertIncludes(ui, 'Když je na frézkách jen jeden člověk, píše se MFKF06 jako neobsazená', 'Generátor musí chránit pravidlo MFKF06 při jednom člověku na frézkách');
  assertIncludes(ui, 'if (millPeopleCount === 1 && mfkf06Idx >= 0)', 'Výpočet musí reálně vynutit prázdnou MFKF06 při jednom člověku na frézkách');
  assertIncludes(ui, 'if (softTargetCount === 3 && lathePeopleCount === 2 && mskc01Idx >= 0)', 'Při dvou absencích musí zůstat MSKC01 neobsazená');
  assertIncludes(ui, 'readAdminRotationFromDom(monthKey)', 'Generátor musí před výpočtem číst rozepsané absence z DOMu');
  assertIncludes(ui, 'adminRotationGeneratorIsDayBlocked', 'Generátor musí umět vynechat den označený jako svátek/odstávka');
  assertIncludes(ui, "ruleVersion: '1.145'", 'Výsledek generátoru musí vracet aktuální verzi pravidel 1.145');
assertIncludes(ui, 'generator-download-excel', 'Výsledek generátoru musí nabízet stažení návrhu do Excelu');
assertIncludes(ui, 'admin-download-rotation-excel', 'Administrace / Export import musí nabízet stejný XLSX export rozpisu');
assertIncludes(ui, 'rakRotationExcelExportMonth', 'Export / import musí mít vlastní výběr měsíce pro XLSX export rozpisu');
assertIncludes(ui, 'function adminRotationGeneratorDownloadExcel', 'Chybí funkce pro stažení návrhu do Excelu');

}

function assertRotationGeneratorWizardContractV1108() {
  assertIncludes(exportJs, 'RAK_ROTATION_GENERATOR_WIZARD_CONTRACT_V1108', 'export.js musí dokumentovat průvodce generátoru v1.108');
  assertIncludes(ui, 'RAK_ROTATION_GENERATOR_WIZARD_CONTRACT_V1108', 'admin-rotation.js musí obsahovat průvodce generátoru v1.108');
  assertIncludes(ui, 'function adminOpenRotationGeneratorWizard(monthKey)', 'Generátor musí otevírat samostatnou stránku/průvodce');
  assertIncludes(ui, 'generator-month-next', 'Průvodce musí mít krok volby měsíce');
  assertIncludes(ui, 'generator-days-next', 'Průvodce musí mít krok kontroly pracovních dnů');
  assertIncludes(ui, 'generator-day-remove', 'Průvodce musí umět smazat pracovní den křížkem');
  assertIncludes(ui, 'generator-day-add', 'Průvodce musí umět přidat pracovní den přes +');
  assertIncludes(ui, 'generator-absence-add', 'Průvodce musí umět přidat více absencí ke dni přes +');
  assertIncludes(ui, 'adminBuildRotationMachineCountSummaryHtml', 'Po vygenerování musí být dostupný přehled stroje × jména');
  assertIncludes(ui, 'data-admin-action="add-absence-row"', 'Běžná tabulka absencí musí mít + pro další řádek');
  assertIncludes(ui, "escapeHtml(String(m || ''))", 'Mini přehled Tvrdoty nesmí odřezávat první T ve strojích');
}

function assertRotationGeneratorAbsenceStateContractV1109() {
  assertIncludes(exportJs, 'RAK_ROTATION_GENERATOR_ABSENCE_STATE_CONTRACT_V1109', 'export.js musí dokumentovat opravu zachování absencí v1.109');
  assertIncludes(ui, 'RAK_ROTATION_GENERATOR_ABSENCE_STATE_CONTRACT_V1109', 'admin-rotation.js musí mít contract pro zachování absencí v1.109');
  assertIncludes(ui, 'function adminRotationGeneratorGetWizardDaysForCollection()', 'Krok Absence musí mít fallback na state.days');
  assertIncludes(ui, 'const days = adminRotationGeneratorGetWizardDaysForCollection();', 'Sběr absencí nesmí spoléhat jen na day inputy z kroku Dny');
  assert(!ui.includes('const days = adminRotationGeneratorCollectDaysFromDom();\n  const absencesByDay = days.map((date) => ({ date, rows: [] }));\n  if (!body) return absencesByDay;'), 'Sběr absencí nesmí v kroku Absence vynulovat dny kvůli chybějícím day inputům');
  assertIncludes(ui, 'rows.push({ person, code });', 'Během editace absencí se mají zachovat i prázdné řádky, aby + Přidat jméno nemazalo formulář');
  assertIncludes(browserSmokeJs, 'absenceStateAfterAdd', 'Browser smoke musí ověřit zachování vyplněné absence po + Přidat jméno');
}

function assertRotationGeneratorWizardRunContractV1110() {
  assertIncludes(exportJs, 'RAK_ROTATION_GENERATOR_WIZARD_RUN_CONTRACT_V1110', 'export.js musí dokumentovat opravu generování z průvodce v1.110');
  assertIncludes(ui, 'RAK_ROTATION_GENERATOR_WIZARD_RUN_CONTRACT_V1110', 'admin-rotation.js musí mít contract pro generování z průvodce v1.110');
  assertIncludes(ui, 'function adminRotationGeneratorCanReadEditorDraftFromDom()', 'Generátor musí rozlišit editor rozpisu od wizard DOMu');
  assertIncludes(ui, "body.querySelector('#adminRotationEditor tr[data-rotation-section]')", 'Generátor smí číst DOM jen z reálného editoru rozpisu');
  assertIncludes(ui, 'const domMonth = adminRotationGeneratorCanReadEditorDraftFromDom() ? readAdminRotationFromDom(monthKey) : null;', 'Generátor nesmí ve wizardu číst prázdný DOM jako rozpis');
  assertIncludes(browserSmokeJs, 'wizardRunState', 'Browser smoke musí reálně ověřit Vygenerovat rozpis z průvodce');
  assertIncludes(exportJs, 'RAK_ROTATION_GENERATOR_WIZARD_STATE_CONTRACT_V1111', 'export.js musí dokumentovat obnovu dnů průvodce v1.111');
  assertIncludes(ui, 'RAK_ROTATION_GENERATOR_WIZARD_STATE_CONTRACT_V1111', 'admin-rotation.js musí mít contract pro obnovu dnů průvodce v1.111');
  assertIncludes(ui, 'function adminRotationGeneratorResolveWizardDays', 'Průvodce musí mít jednotný fallback pro pracovní dny');
  assertIncludes(ui, 'adminRotationGetDefaultMonthWorkDates', 'Průvodce musí umět obnovit pracovní dny z initialRotationData');
  assert(!ui.includes('OK, odeslat'), 'Duplicitní tlačítko OK, odeslat už se nemá vracet');
  assertIncludes(ui, 'Uložit rozpis', 'Editor rozpisu musí mít jedno jasné tlačítko Uložit rozpis');
  assertIncludes(ui, 'RAK_ROTATION_SAVE_BUTTON_CONTRACT_V1118', 'admin-rotation.js musí mít contract pro odstranění duplicitního tlačítka v1.118');
  assertIncludes(exportJs, 'RAK_ROTATION_SAVE_BUTTON_CONTRACT_V1118', 'export.js musí dokumentovat odstranění duplicitního tlačítka v1.118');
  assertIncludes(browserSmokeJs, 'corruptedMonthRecovery', 'Browser smoke musí ověřit obnovu z nulového/poškozeného měsíce');
  assertIncludes(browserSmokeJs, 'machineCountHitCount', 'Browser smoke musí hlídat nenulový přehled stroje × jména');
}

function assertRotationGeneratorMonthBalanceContractV1112() {
  assertIncludes(exportJs, 'RAK_ROTATION_GENERATOR_MONTH_BALANCE_CONTRACT_V1112', 'export.js musí dokumentovat řazení měsíců a vyrovnání TNKS01 v1.112');
  assertIncludes(ui, 'RAK_ROTATION_GENERATOR_MONTH_BALANCE_CONTRACT_V1112', 'admin-rotation.js musí mít contract pro řazení měsíců a vyrovnání TNKS01');
  assertIncludes(ui, 'function adminRotationGetAllowedGeneratorMonthKeys', 'Generátor musí umět omezit výběr na aktuální měsíc a další navazující měsíce');
  assertIncludes(ui, 'function adminRotationGetCurrentExistingMonthKey', 'Generátor musí umět nabídnout aktuální měsíc k přegenerování');
  assertIncludes(ui, 'function adminRotationAddGeneratorAllowedRange', 'Generátor musí umět nabídnout rozsah od aktuálního měsíce po další navazující měsíc');
  assertIncludes(ui, 'function adminRotationGeneratorBuildYearOptions', 'Generátor musí mít samostatný výběr roku');
  assertIncludes(ui, 'function adminRotationGeneratorBuildMonthOptions', 'Generátor musí stavět volbu měsíce jen z povolených měsíců');
  assertIncludes(ui, 'adminGeneratorYearSelect', 'Volba měsíce v generátoru musí nejdřív ukázat rok');
  assertIncludes(ui, 'function adminRotationGeneratorHandleYearSelectChange', 'Změna roku v generátoru musí přepnout nabídku měsíců');
  assertIncludes(ui, 'adminRotationGeneratorResolveSelectableMonthKey', 'Pokračování generátoru musí znovu ověřit povolený měsíc');
  assertIncludes(ui, 'function adminRotationGeneratorBalanceHardMachine', 'Generátor musí po sestavení měsíce umět vyrovnat tvrdotní stroj');
  assertIncludes(ui, "adminRotationGeneratorBalanceHardMachine(month, 'TNKS01', model, monthKey)", 'Generátor musí vyrovnávat nýtovačku TNKS01 po vygenerování');
  assertIncludes(ui, 'adminRotationGeneratorFindPersonCellOnDay(month, rowIdx, targetLowName, \'soft\')', 'Vyrovnání TNKS01 musí umět prohodit člověka z tvrdoty dočasně napsaného na měkotě');
  assertIncludes(ui, 'tnksBalanceSwaps', 'Výsledek generátoru musí vracet počet prohozů TNKS01');
  assertIncludes(browserSmokeJs, 'tnksBalance', 'Browser smoke musí ověřit nenulovou/rozumnou rovnováhu TNKS01');
}


function assertRotationGeneratorRulesContractV1113() {
  assertIncludes(exportJs, 'RAK_ROTATION_GENERATOR_RULES_CONTRACT_V1113', 'export.js musí dokumentovat pravidla generátoru v1.113');
  assertIncludes(ui, 'RAK_ROTATION_GENERATOR_RULES_V1113', 'admin-rotation.js musí mít contract pravidel v1.113');
  assertIncludes(ui, 'machineCountSplitRule', 'Generátor musí dokumentovat pravidlo 0,5 pro TNKS01/TPKW01');
  assertIncludes(ui, 'adminRotationGeneratorShouldSplitPressMachines', 'Přehled stroje × jména musí rozhodovat, kdy TNKS01/TPKW01 počítat 0,5 + 0,5');
  assertIncludes(ui, 'adminRotationGeneratorFormatCount', 'Přehled stroje × jména musí umět zobrazit desetinné počty 0,5');
  assertIncludes(ui, 'softHardBlockLength: 3', 'Měkota core musí chodit na Tvrdotu po blocích 3 směn na stejný stroj');
  assertIncludes(ui, "softCore: Object.freeze(['Synek', 'Třasák', 'Střížek'])", 'Měkota core musí být Synek/Třasák/Střížek');
  assertIncludes(ui, "softBaseLathe: Object.freeze({ Synek: 'MSKC04', 'Střížek': 'MSKC03', 'Třasák': 'MSKC01' })", 'Základní soustruhy Měkoty musí být Synek MSKC04, Střížek MSKC03, Třasák MSKC01');
  assertIncludes(ui, 'adminRotationGeneratorPickSoftCoreForHard', 'Generátor musí vybírat Synek/Třasák/Střížek na tvrdotu podle 3denních bloků a absencí');
  assertIncludes(ui, 'adminBuildRotationGeneratorPreviewHtml', 'Průvodce musí ukázat celý rozpis v náhledu');
  assertIncludes(ui, 'Zpět na měsíc', 'Náhled musí umožnit návrat na měsíc');
  assertIncludes(ui, 'Zpět na dny', 'Náhled musí umožnit návrat na dny');
  assertIncludes(ui, 'Zpět na absence', 'Náhled musí umožnit návrat na absence');
}


function assertRotationGeneratorRulesContractV1114() {
  assertIncludes(exportJs, 'RAK_ROTATION_GENERATOR_RULES_CONTRACT_V1114', 'export.js musí dokumentovat pravidla generátoru v1.114');
  assertIncludes(ui, 'RAK_ROTATION_GENERATOR_RULES_V1114', 'admin-rotation.js musí mít contract pravidel v1.114');
  assertIncludes(ui, 'adminRotationGeneratorSoftCoreFutureAvailability', 'Generátor musí umět vyhodnotit dostupnost Synek/Třasák/Střížek do konce 3denního bloku');
  assertIncludes(ui, 'futureDiff = adminRotationGeneratorSoftCoreFutureAvailability', 'Výběr Měkoty na Tvrdotu musí prioritně řešit, kdo bude později chybět');
  assertIncludes(ui, 'function adminRotationGeneratorBalanceSoloMill', 'Generátor musí umět vyrovnat samostatné frézky');
  assertIncludes(ui, 'function adminRotationGeneratorCountSoloMill', 'Generátor musí umět spočítat samostatné MFKF10 s prázdnou MFKF06');
  assertIncludes(ui, "const soloMillBalance = adminRotationGeneratorBalanceSoloMill(month, model);", 'Po sestavení měsíce musí běžet vyrovnání samostatných frézek');
  assertIncludes(ui, 'soloMillBalanceSwaps', 'Výsledek generátoru musí vracet počet prohozů samostatných frézek');
  assertIncludes(ui, "ruleVersion: '1.145'", 'Výsledek generátoru musí vracet aktuální verzi pravidel 1.145');
}


function assertRotationGeneratorRulesContractV1115() {
  assertIncludes(exportJs, 'RAK_ROTATION_GENERATOR_RULES_CONTRACT_V1115', 'export.js musí dokumentovat lidský postup generátoru v1.115');
  assertIncludes(ui, 'RAK_ROTATION_GENERATOR_RULES_V1115', 'admin-rotation.js musí mít contract pravidel v1.115');
  assertIncludes(ui, "hardCycle: Object.freeze(['TBKR01', 'TNKS01', 'TBKR07', 'TPKW01', 'TPKW02'])", 'Tvrdota musí pokračovat v pořadí TBKR01/TNKS01/TBKR07/TPKW01/TPKW02');
  assertIncludes(ui, 'previousHardMachine', 'Generátor musí znát poslední tvrdotní stroj z předchozích měsíců');
  assertIncludes(ui, 'hardCycleCursor', 'Generátor musí vést cursor návazné rotace Tvrdoty');
  assertIncludes(ui, 'adminRotationGeneratorNextHardCycleMachine', 'Generátor musí umět určit další tvrdotní stroj podle návaznosti');
  assertIncludes(ui, 'adminRotationGeneratorAdvanceHardCycle', 'Generátor musí po zapsání člověka posunout tvrdotní rotaci');
  assertIncludes(ui, 'displacedToSoft', 'Člověk vytlačený z Tvrdoty člověkem z Měkoty musí jít na Měkotu');
  assertIncludes(ui, 'hard-displaced-to-mill', 'Vytlačený člověk z Tvrdoty má jít přednostně na frézky');
  assertIncludes(ui, 'Špadrna a Novotný pomáhají vyrovnat Tvrdotu', 'Špadrna a Novotný musí být vyrovnávací lidé podle Martinova postupu');
}


function assertRotationGeneratorRulesContractV1116() {
  assertIncludes(exportJs, 'RAK_ROTATION_GENERATOR_RULES_CONTRACT_V1116', 'export.js musí dokumentovat pravidla generátoru v1.116');
  assertIncludes(ui, 'RAK_ROTATION_GENERATOR_RULES_V1116', 'admin-rotation.js musí mít contract pravidel v1.116');
  assertIncludes(ui, 'Rychlý přehled: jména × stroje', 'Kontrolní přehled musí být otočený na jména v řádcích a stroje ve sloupcích');
  assertIncludes(ui, '<th>Jméno</th><th>TO</th><th>MO</th>', 'Kontrolní přehled musí mít sloupce TO a MO');
  assertIncludes(ui, 'function adminRotationGeneratorCountSoftKinds', 'Generátor musí umět spočítat poměr frézky/soustruhy');
  assertIncludes(ui, 'function adminRotationGeneratorBalanceSoftKind', 'Generátor musí po vygenerování dorovnat MFKF/MSKC poměr');
  assertIncludes(ui, 'softKindBalanceSwaps', 'Výsledek generátoru musí vracet počet prohozů frézky/soustruhy');
  assertIncludes(ui, 'const allowedDiff = isPressBalance ? 0.5 : 1', 'Vyrovnání nýtovačky musí řešit i rozdíl 1,5 proti 0');
}


function assertDashboardAndRotationEmptyVisualContractV1119() {
  const adminPolishCss = read('styles-admin-polish.css');
  const themePolishCss = read('styles-theme-polish.css');
  assertIncludes(exportJs, 'RAK_ROTATION_EMPTY_CELL_HIGHLIGHT_CONTRACT_V1119', 'export.js musí dokumentovat zvýraznění prázdných buněk v1.119');
  assertIncludes(exportJs, 'RAK_DASHBOARD_SHIFT_PERCENT_SIZE_CONTRACT_V1119', 'export.js musí dokumentovat zvětšení procent směny v1.119');
  assertIncludes(ui, 'RAK_ROTATION_EMPTY_CELL_HIGHLIGHT_CONTRACT_V1119', 'admin-rotation.js musí mít contract pro zvýraznění prázdných buněk v1.119');
  assertIncludes(dashboardPolishCss, 'procenta směny zmenšená o cca 50 %', 'Dashboard polish musí obsahovat zmenšení procent směny v1.122');
  assertIncludes(dashboardPolishCss, 'font-size:clamp(11px, 3vw, 14px) !important;', 'Procenta směny mají být o cca 50 % nižší než ve výrazné 1.121 verzi');
  assertIncludes(dashboardPolishCss, 'flex:0 0 48px !important;', 'Zmenšená procenta směny mají mít užší prostor v hero progress řádku');
  ['adminRotationEditorEmptyCell', 'adminRotationPreviewEmptyCell'].forEach((cls) => assertIncludes(ui, cls, `admin-rotation.js musí označovat prázdné buňky třídou ${cls}`));
  ['adminRotationEditorEmptyCell', 'adminRotationPreviewEmptyCell', 'adminRotationMiniEmpty'].forEach((cls) => assertIncludes(adminPolishCss, cls, `styles-admin-polish.css musí zvýraznit ${cls}`));
  assertIncludes(themePolishCss, '#monthView table.rotTable td.missingCell', 'Rotace musí zvýraznit prázdné buňky missingCell');
  assertIncludes(themePolishCss, 'rgba(255,214,214,.42)', 'Zvýraznění prázdných buněk má být světle červené');
  assertIncludes(adminPolishCss, 'rgba(255,214,214,.44)', 'Rozpisy mají používat světle červené zvýraznění prázdných polí');
}


function assertRotationGeneratorRulesContractV1117() {
  assertIncludes(exportJs, 'RAK_ROTATION_GENERATOR_RULES_CONTRACT_V1117', 'export.js musí dokumentovat pravidla generátoru v1.117');
  assertIncludes(ui, 'RAK_ROTATION_GENERATOR_RULES_V1117', 'admin-rotation.js musí mít contract pravidel v1.117');
  assertIncludes(ui, 'function adminRotationGeneratorBalanceKminekNovotnyMoTo', 'Generátor musí umět prohazovat Kmínka a Novotného kvůli MO/TO');
  assertIncludes(ui, "adminRotationCanonicalName('Kmínek'", 'MO/TO balance musí výslovně řešit Kmínka');
  assertIncludes(ui, "adminRotationCanonicalName('Novotný'", 'MO/TO balance musí výslovně řešit Novotného');
  assertIncludes(ui, 'adminRotationGeneratorCountSectionTotals', 'Generátor musí umět spočítat TO/MO součty pro dvojici');
  assertIncludes(ui, 'adminRotationGeneratorMoToPairScore', 'Generátor musí hodnotit rozdíl MO/TO mezi Kmínkem a Novotným');
  assertIncludes(ui, 'kminekNovotnyMoToBalanceSwaps', 'Výsledek generátoru musí vracet počet prohozů Kmínek/Novotný MO/TO');
}



function assertRotationGeneratorExcelCopyContractV1138() {
  assertIncludes(exportJs, 'RAK_ROTATION_GENERATOR_EXCEL_COPY_CONTRACT_V1138', 'export.js musí dokumentovat kopírovací XLSX layout generátoru v1.145');
  assertIncludes(ui, 'RAK_ROTATION_GENERATOR_EXCEL_COPY_CONTRACT_V1138', 'admin-rotation.js musí mít contract pro XLSX kopírovací layout v1.145');
  assertIncludes(exportJs, 'RAK_ADMIN_EXPORT_IMPORT_EXCEL_COPY_CONTRACT_V1139', 'export.js musí dokumentovat XLSX export v Administraci / Export import v1.145');
  assertIncludes(ui, 'RAK_ADMIN_EXPORT_IMPORT_EXCEL_COPY_CONTRACT_V1139', 'app-menu.js musí mít contract pro XLSX export v Export/import v1.145');
  assertIncludes(exportJs, 'RAK_ADMIN_EXPORT_IMPORT_EXCEL_MONTH_GROUP_CONTRACT_V1140', 'export.js musí dokumentovat skupinovaný výběr měsíců pro XLSX export v1.145');
  assertIncludes(ui, 'RAK_ADMIN_EXPORT_IMPORT_EXCEL_MONTH_GROUP_CONTRACT_V1140', 'app-menu.js musí mít contract pro řazení a skupiny roků v XLSX exportu v1.145');
  assertIncludes(ui, 'function buildRakRotationExcelExportMonthOptions', 'Export / import musí mít vlastní builder výběru měsíců pro XLSX export');
  assertNotIncludes(ui, 'function buildAdminExportImportStatusHtml', 'Stav exportu/importu byl na zadost odstranen z admin obrazovky');
  assertNotIncludes(ui, 'function buildAdminExportImportSafetyHtml', 'Bezpecnost importu byla na zadost odstranena z admin obrazovky');
  assertIncludes(ui, 'function confirmRakExcelImportOverwrite', 'Excel import musi mit potvrzeni pred prepsanim rozpisu');
  assertIncludes(ui, 'Tahle akce změní rozpisy. Před importem zkontroluj rozsah a zálohy.', 'Excel import musi v potvrzeni jasne popsat dopad');
  assertIncludes(ui, 'Import zrušený. Rozpisy zůstaly beze změny.', 'Excel import musi pri zruseni potvrzeni nechat rozpis beze zmeny');
  assertIncludes(ui, 'function renderAdminExportImportStatus', 'Zive prekresleni souhrnu exportu/importu zustava jako neskodny no-op po odstraneni boxu');
  assertIncludes(ui, 'renderAdminExportImportStatus()', 'Zmena Excel importu musi stale volat (uz neskodny no-op) prepocet souhrnu exportu/importu');
  assertIncludes(ui, '#rakRotationExcelExportMonth, #rakExcelImportScope, #rakExcelImportDetectedMonth', 'Export / import musi prepocitat souhrn pri zmene vyberu');
  assertNotIncludes(stylesAdminPolishCss, '.adminExportImportStatus', 'Stav exportu/importu byl na zadost odstranen, admin styl uz nema existovat');
  assertNotIncludes(stylesAdminPolishCss, '.adminExportImportSafetyGrid', 'Bezpecnost importu byla odstranena, admin styl uz nema existovat');
  assertIncludes(ui, 'Export ZIP (stáhnout app)', 'Tlacitko exportu ZIP musi jasne rikat, ze jde o stazeni cele aplikace');
  assertNotIncludes(ui, 'adminRotationGeneratorBuildMonthOptions(selected)', 'Export / import nesmí přebírat omezený výběr měsíce z generátoru');
  assertIncludes(ui, '<optgroup label="Rok ', 'Výběr XLSX exportu musí skupinovat měsíce podle roku');
  assertIncludes(ui, 'function adminRotationGeneratorBuildExcelAbsenceSlots', 'Excel export musí dynamicky určit počet dvojic Jméno/Kód pro absence');
  assertIncludes(ui, 'function adminRotationGeneratorBuildExcelCols', 'Excel export musí mít vlastní šířky sloupců podle reálné šířky AoA');
  assertIncludes(ui, "hardHeader[7] = 'Dovolená, neschopenka atd.:'", 'Absence musí začínat v H vedle Tvrdoty');
  assertIncludes(ui, "hardHeader[8 + idx * 2] = idx === 0 ? 'Jméno'", 'Absence musí mít od I dál dvojice Jméno/Kód');
  assertIncludes(ui, 'const width = 8 + absenceSlots * 2', 'Excel layout musí mít A:F + G mezera + H absence datum + dynamické dvojice');
  assertIncludes(ui, "softHeader[0] = 'Rotace  měkota'", 'Měkota musí zůstat jako samostatný blok pod Tvrdotou v A:F');
  assertIncludes(ui, "ws['!cols'] = adminRotationGeneratorBuildExcelCols(aoa);", 'Stažený XLSX musí použít nové kopírovací šířky sloupců');
  assertIncludes(ui, "ruleVersion: '1.145'", 'Výsledek generátoru musí vracet aktuální verzi pravidel 1.145');
}


function assertGamesActiveAccountDirectStatsContractV1144() {
  assertIncludes(bridge, 'function gameStatsAccountCacheKey', 'Supabase bridge musí mít cache klíč pro statistiky konkrétního účtu v1.145');
  assertIncludes(bridge, 'async function loadGameStatsForAccountDirect', 'Supabase bridge musí umět přímo načíst všechny statistiky aktivního účtu v1.145');
  assertIncludes(bridge, 'loadGameStatsForAccount: async', 'RotationSupabaseBridge musí vystavit loadGameStatsForAccount pro profil/rank sync v1.145');
  assertIncludes(bridge, ".eq('account_number', account)", 'Přímé načtení statistik musí filtrovat podle account_number');
  assertIncludes(ui, 'GAMES_ACTIVE_ACCOUNT_DIRECT_STATS_CONTRACT_V1144', 'games-profile.js musí dokumentovat přímý sync aktivního účtu v1.145');
  assertIncludes(ui, 'bridge.loadGameStatsForAccount(activeAccountId', 'Profilový sync musí používat přímé statistiky aktivního účtu');
  assertIncludes(ui, 'login-remote-stats', 'Po přihlášení se musí vynutit přepočet ranku/theme po stažení statistik účtu');
  assertIncludes(appearanceThemeJs, 'const themeToApply = ui.themeId || defaultTheme', 'Načtené profilové theme se musí použít přímo bez unlock kontroly');
  assertIncludes(appearanceThemeJs, 'const bgToApply = ui.backgroundId || defaultBg', 'Načtené profilové pozadí se musí použít přímo bez unlock kontroly');
}




function assertMemory8x8SquareFitContractV1152() {
  assertIncludes(gamesArcadeJs, '__rakMemory8x8SquareFitGuard', 'Pexeso 8×8 musí mít square-fit guard v1.154');
  assertIncludes(gamesArcadeJs, 'data-memory-size="${size}"', 'Pexeso stage musí nést velikost pro 8×8 mobilní CSS');
  assertIncludes(gamesArcadeJs, 'data-memory-grid="${size}"', 'Pexeso board musí nést velikost gridu');
  assertIncludes(stylesOverridesCss, 'Pexeso 8×8: tvrdý mobilní fit', 'CSS musí dokumentovat 8×8 square-fit fix');
  assertIncludes(stylesOverridesCss, 'grid-template-rows:repeat(8,minmax(0,1fr))', '8×8 board musí mít i osm řádků, nejen sloupce');
  assertIncludes(gamesArcadeJs, 'function applyMemory8x8RuntimeFit', 'Pexeso 8×8 musí mít runtime fit, ne jen CSS');
  assertIncludes(gamesArcadeJs, "card.style.setProperty('min-height', '0', 'important')", 'Runtime fit musí přepsat staré min-height karet');
  assertIncludes(stylesOverridesCss, 'body.gamesOpen[data-rak-arcade-game="memory"] #games #gamesShellBody[data-arcade-game="memory"] .arcadeMemoryBoard.arcadeMemoryBoardLarge.grid-8[data-memory-grid="8"] > .arcadeMemoryCard', 'CSS fix musí mít vysokou specificitu pro 8×8 karty');
  assertIncludes(stylesOverridesCss, 'calc(100dvh - var(--bottom-nav-h, 52px)', '8×8 board musí být omezený šířkou i výškou viewportu');
  assertIncludes(stylesOverridesCss, 'min-block-size:0 !important', '8×8 karty musí vyplnit buňku na výšku');
}


function assertMemoryTotalTimeNoFiveSecondsContractV1152() {
  assertIncludes(gamesArcadeJs, 'memory-total-time-no-5s-v1153-guard', 'Pexeso musí mít guard proti starému 5s fallbacku');
  assertIncludes(gamesArcadeJs, 'function gamesMemoryMinValidMs', 'Arcade musí znát minimální reálné časy Pexesa');
  assertIncludes(gamesArcadeJs, "gamesSanitizeLowBestTime('memory_6x6', 5000) === 0", '5s v Pexesu 6×6 nesmí být platný leaderboard čas');
  assertIncludes(gamesProfileJs, 'function gamesProfileMemoryMinValidMs', 'Profil musí čistit lokální staré 5s Pexeso záznamy');
  assertIncludes(gamesProfileJs, 'GAMES_MEMORY_TIME_SANITIZE_CONTRACT_V1152', 'Profil musí mít contract pro čištění Pexeso času');
  assertIncludes(bridge, 'function sanitizeLowTimeGameStatMs', 'Supabase bridge nesmí uložit explicitní 5s Pexeso jako platný čas');
  assertIncludes(gamesArcadeJs, "gamesRecordStat(memoryBoardId, { completed: true, wins: 1", 'Pexeso výhra se má posílat i jako wins:1');
}

function assertSudokuCompletionAndTimeFormatContractV1144() {

  assertIncludes(gamesArcadeJs, '__rakShipsSmoothPerformanceGuard', 'Lodě musí mít performance guard 1.154');
  assertIncludes(gamesArcadeJs, 'maybeRenderRemoteState(remote, soft)', 'Lodě nesmí renderovat při každém pollu bez změny stavu');
  assertIncludes(gamesArcadeJs, 'if (local.refreshing) return;', 'Lodě musí blokovat překryté online refreshe');
  assertIncludes(gamesArcadeJs, 'sudoku-completion-save-v1148', 'Sudoku musí mít guard pro bezpečné uložení dokončení v1.146');
  assertIncludes(gamesArcadeJs, "gamesRecordStat('sudoku', sudokuResultPatch)", 'Sudoku musí po dohrání zapsat společné Sudoku do profilu/Top score');
  assertIncludes(gamesArcadeJs, 'gamesRecordStat(sudokuBoardId, sudokuVariantPatch)', 'Sudoku musí po dohrání zapsat i variantu obtížnosti');
  assertIncludes(gamesArcadeJs, 'wins: 1', 'Dohrané Sudoku se má počítat jako výhra/dokončení');
  assertIncludes(gamesArcadeJs, 'window.__rakLastSudokuCompletion', 'Sudoku musí mít runtime stopu posledního zápisu pro diagnostiku');
  assertIncludes(bridge, 'GAME_STATS_POINTS_DELTA_LIMIT = 5000', 'RPC ukládání game_stats má držet bezpečný limit 5000 pro srovnatelné XP');
  assertIncludes(bridge, 'normalizeGameStatEntryPoints(gameType, entry)', 'Supabase zápis musí časové hry normalizovat do bezpečného score');
  assertIncludes(gamesProfileJs, 'GAMES_PROFILE_SAFE_TIME_SCORE_SCALE = 5000', 'Profil musí dekódovat bezpečné časové score zpět na čas');
  assertIncludes(gamesProfileJs, 'gamesProfileIsLowTimeGame(game.id)', 'Profil musí časové hry zobrazovat jako čas, ne jako počet her/body');
  assertIncludes(gamesArcadeJs, 'function fmtReactionMs', 'Reaction Test musí zůstat v ms');
  assertIncludes(gamesArcadeJs, "return rest ? `${minutes} min ${rest} s`", 'Časové hry nad minutu musí zobrazit min + s');
}


function assertSudokuRandomPuzzleContractV1145() {
  assertIncludes(gamesArcadeJs, 'sudoku-random-puzzle-v1148', 'Sudoku musí mít guard pro náhodné generování polí v1.145');
  assertIncludes(gamesArcadeJs, 'function sudokuBuildPuzzleFromTemplate', 'Sudoku musí generovat nové pole ze šablony při každém startu');
  assertIncludes(gamesArcadeJs, 'targetGivens: 50', 'Lehká obtížnost Sudoku musí být zlehčená větším počtem základních čísel');
  assertIncludes(gamesArcadeJs, 'sudokuSeed', 'Sudoku musí mít seed/stopu nové mřížky pro diagnostiku');
  assertIncludes(gamesArcadeJs, 'const generated = sudokuBuildPuzzleFromTemplate', 'Start nové hry Sudoku musí vytvořit čerstvě vygenerovanou mřížku');
  assertIncludes(gamesArcadeJs, 'window.getRakSudokuRandomPuzzleHealth', 'Sudoku musí vystavit runtime health pro náhodné mřížky');
}

function assertLadaManualOverrideContractV1144() {
  assertIncludes(ui, 'RAK_LADA_MANUAL_OVERRIDE_CONTRACT_V1144', 'ui.js musí dokumentovat ruční vypnutí Láďova režimu na slabém zařízení v1.145');
  assertIncludes(ui, 'const autoLowEndActive = lowEndDetected && !next.lightweightManual', 'Ruční volba musí mít přednost před lowEnd automatikou');
  assertIncludes(ui, "document.body.classList.toggle('lowEndDevice', autoLowEndActive)", 'lowEndDevice CSS třída se nesmí držet aktivní po ručním vypnutí');
  assertIncludes(ui, 'document.documentElement.dataset.rakLowEndAutoActive', 'Diagnostika musí rozlišit detekci slabého zařízení a aktivní automatiku');
  assertIncludes(ui, "dataset.rakPerformanceMode = ladaMode ? (autoLowEndActive ? 'lada-auto-low-end-turbo' : 'lada-manual-turbo') : 'normal'", 'Performance mode musí po ručním vypnutí spadnout na normal');
  assertIncludes(ui, 'prefs && prefs.lightweightManual && !prefs.lightweight) return 2', 'DPR limit se po ručním vypnutí nesmí dál držet na 1 jen kvůli lowEnd detekci');
  assertIncludes(ui, 'data-menu-action="device-performance-auto"', 'Tlačítko Automatika musí zůstat dostupné pro návrat k automatickému režimu');
}


function assertLadaSmoothPerformanceContractV1144() {
  assertIncludes(ui, 'RAK_LADA_SMOOTH_PERFORMANCE_CONTRACT_V1144', 'ui.js musí dokumentovat plynulostní contract Láďova režimu v1.145');
  assertIncludes(ui, "document.documentElement.classList.toggle('rakLadaPaintLite', !!ladaMode)", 'Aktivní Láďův režim musí zapnout jednoduchou paint vrstvu');
  assertIncludes(ui, "document.documentElement.dataset.rakLadaPaintLite = ladaMode ? 'yes' : 'no'", 'Diagnostika musí hlásit lite paint vrstvu');
  assertIncludes(ui, 'litePaintLayer', 'Health audit musí kontrolovat lite paint vrstvu');
  assertIncludes(ui, 'lada lite paint layer missing', 'Health audit musí umět nahlásit chybějící lite paint vrstvu');
  assertIncludes(stylesReleasePolishCss, 'html.rakLadaPaintLite body::before', 'Láďův režim musí vypnout fixed pseudo background vrstvy');
  assertIncludes(stylesReleasePolishCss, 'html.rakLadaPaintLite body::after', 'Láďův režim musí vypnout overlay pseudo background vrstvy');
  assertIncludes(stylesReleasePolishCss, 'body.ladaMode .dashboardHeroCard', 'Láďův režim musí tvrdě odlehčit dashboard karty');
  assertIncludes(stylesReleasePolishCss, 'body.ladaMode #games .gamesStage', 'Láďův režim musí odlehčit herní stage');
  assertIncludes(stylesReleasePolishCss, 'backdrop-filter:none !important', 'Láďův režim musí vypínat těžký blur');
  assertIncludes(stylesReleasePolishCss, 'transition:none !important', 'Láďův režim musí vypínat přechody');
  assertIncludes(stylesReleasePolishCss, 'animation:none !important', 'Láďův režim musí vypínat animace');
}

function assertStatsPressMachineSplitContractV1123() {
  const statsJs = read('stats.js');
  assertIncludes(exportJs, 'RAK_STATS_PRESS_MACHINE_SPLIT_CONTRACT_V1123', 'export.js musí dokumentovat sjednocené počítání TNKS01/TPKW01 ve statistikách v1.123');
  assertIncludes(statsJs, 'function shouldStatsSplitPressMachines', 'Statistiky musí mít sdílené rozhodnutí, kdy TNKS01/TPKW01 půlit');
  assertIncludes(statsJs, 'function isStatsOvertimeSundayShift', 'Statistiky musí rozpoznat přesčasovou neděli');
  assertIncludes(statsJs, 'isSpecialOvertimeSundayNight(date)', 'Statistiky mají použít existující seznam přesčasových nedělí/kantýny');
  assertIncludes(statsJs, 'const shouldSplitPress = shouldStatsSplitPressMachines(monthKey, parsedDate)', 'Výpočet statistik musí použít shouldSplitPress pro TNKS01/TPKW01');
  assertIncludes(statsJs, 'přesčasová TO neděle se půlí, přesčas jen MO se nepůlí', 'Komentář statistik musí popisovat výjimku přesčas jen MO');
}

function assertStatsPressMachineMoOnlyExceptionContractV1124() {
  const statsJs = read('stats.js');
  const coreJs = read('core.js');
  const ui = read('admin-rotation.js');
  assertIncludes(exportJs, 'RAK_STATS_PRESS_MACHINE_MO_ONLY_EXCEPTION_CONTRACT_V1124', 'export.js musí dokumentovat MO-only výjimku TNKS01/TPKW01 v1.125');
  assertIncludes(coreJs, 'SPECIAL_OVERTIME_MO_ONLY_SUNDAYS_2026', 'core.js musí mít seznam nedělních přesčasů jen MO');
  assertIncludes(coreJs, '"2026-03-01"', '1.3.2026 musí být evidovaný jako přesčas jen MO');
  assertIncludes(coreJs, 'function isSpecialOvertimeSundayMoOnly', 'core.js musí mít helper pro MO-only přesčasovou neděli');
  assertIncludes(statsJs, 'function isStatsOvertimeSundayMoOnly', 'Statistiky musí umět rozpoznat přesčas jen MO');
  assertIncludes(statsJs, 'if (isStatsOvertimeSundayMoOnly(monthKey, parsedDate)) return false', 'Statistiky nesmí půlit TNKS01/TPKW01 při přesčasu jen MO');
  assertIncludes(ui, 'function adminRotationGeneratorIsMoOnlyOvertimeSunday', 'Generátor/kontrolní přehled musí umět rozpoznat přesčas jen MO');
  assertIncludes(ui, 'if (adminRotationGeneratorIsMoOnlyOvertimeSunday(dateLabel, monthKey, month)) return false', 'Kontrolní přehled nesmí půlit TNKS01/TPKW01 při přesčasu jen MO');
}

function assertRotationOvertimeShiftFilterContractV1128() {
  const ui = read('admin-rotation.js');
  const menuJs = read('app-menu.js');
  const appUiJs = read('ui.js');
  const coreJs = read('core.js');
  const adminFoodJs = read('admin-food.js');
  const qrJs = read('qr.js');
  const supabaseBridgeJs = read('supabase-bridge.js');
  const css = read('styles-admin-polish.css');
  assertIncludes(ui, 'ADMIN_ROTATION_OVERTIME_SHIFT_FILTER_KEY', 'Přesčasy musí mít uložený filtr směny v1.128');
  assertIncludes(ui, 'function adminRotationOvertimeGetShiftInfoForIsoDate', 'Přesčasy musí automaticky dopočítat směnu z data');
  assertIncludes(ui, 'data-rotation-overtime-shift-label', 'Tabulka přesčasů musí zobrazovat dopočítanou směnu');
  assertIncludes(ui, 'data-admin-action="overtime-shift-filter"', 'Přesčasy musí mít filtrovací chipy směn');
  assertIncludes(ui, 'function adminRotationOvertimeBuildYearSummaryHtml', 'Přesčasy musí mít roční přehled počtů podle směn');
  assertIncludes(ui, 'data-rotation-overtime-year-summary', 'Roční přehled přesčasů musí mít DOM hook pro přepočet');
  assertIncludes(ui, 'function buildAdminRotationOvertimeStatusHtml', 'Přesčasy musí mít horní stavový souhrn pro admina');
  assertIncludes(ui, 'function adminRotationRefreshOvertimeStatus', 'Stav přesčasů se musí přepočítat podle rozepsaných řádků');
  assertIncludes(ui, 'adminRotationOvertimeReadEntriesFromRoot', 'Stav přesčasů musí vycházet z aktuálních DOM řádků před uložením');
  assertIncludes(ui, 'const yearSet = new Set([String(currentYear)]);', 'Přesčasy mají zakládat další roky podle skutečně zadaných termínů');
  assertIncludes(ui, "const yearOpenAttr = Number.isFinite(yearNumber) && yearNumber >= currentYear ? ' open' : '';", 'Minulé roky v nastavení přesčasů mají být po letech sbalené');
  assertIncludes(ui, 'function adminRotationRefreshOvertimeYearSummaries', 'Roční přehled přesčasů se musí přepočítat při změně data');
  assertIncludes(ui, "{ value: 'A', label: 'A' }", 'Filtr přesčasů má mít čistou volbu A bez prefixu Moje');
  assertIncludes(ui, "{ value: 'D', label: 'D' }", 'Filtr přesčasů má mít čistou volbu D bez prefixu Moje');
  assertNotIncludes(ui, "label: 'Moje ' +", 'Filtr přesčasů už nemá používat Moje D');
  assertIncludes(menuJs, "adminAction === 'overtime-shift-filter'", 'Admin menu musí obsloužit filtr přesčasů podle směny');
  assertIncludes(menuJs, "action: 'open-overtime', label: 'Přesčasy'", 'Přesčasy musí být samostatná položka v hlavní administraci');
  assertIncludes(menuJs, 'data-admin-action="back-admin">Zpět</button>', 'Samostatné menu přesčasů se má vracet do hlavní administrace');
  assertIncludes(menuJs, 'adminRotationRefreshOvertimeShiftBadges(body, true)', 'Po renderu přesčasů se musí obnovit směnové badge a filtr');
  assertIncludes(menuJs, 'adminRotationRefreshOvertimeStatus(body)', 'Admin menu musí přepočítat stav přesčasů při změně poznámky nebo TO');
  assertIncludes(css, '#appMenuBody .adminRotationOvertimeFilterChip', 'Filtr směn musí přebít světlý globální styl tlačítek');
  assertIncludes(css, 'var(--rakGlassActiveBg', 'Filtr směn musí používat theme/glass aktivní barvy aplikace');
  assertIncludes(css, '.adminRotationOvertimeYearSummary', 'Roční přehled přesčasů musí mít vlastní čitelný theme styl');
  assertIncludes(css, '.adminRotationOvertimeStatusGrid', 'Stav přesčasů musí mít vlastní responsive rozložení');
  assertIncludes(ui, 'function adminRotationOvertimeNormalizeDateInput', 'Datum přesčasu zadané jen číslicemi z numerické klávesnice se musí umět přeformátovat na D.M.RRRR');
  assertIncludes(menuJs, 'adminRotationOvertimeNormalizeDateInput(target.value)', 'Admin menu musí po opuštění pole data přesčasu zavolat přeformátování na D.M.RRRR');
  assertIncludes(menuJs, "target.matches('[data-rotation-overtime-date]')", 'Admin menu musí sledovat pole data přesčasu při odchodu z pole (focusout)');
  assertIncludes(adminFoodJs, 'function adminFoodTodayIso', 'Kantyna/jidelna musi umet filtrovat seznam prescasu od dneska');
  assertIncludes(adminFoodJs, 'existingSnapshot.dates.slice()', 'Stare prescasove nedele ve food nastaveni se nesmi pri ulozeni potichu smazat');
  assertNotIncludes(adminFoodJs, 'data-food-overtime-date-row', 'Kantyna/jidelna uz nesmi mit vlastni editovatelny seznam prescasovych nedeli - to patri do Provoz / Prescasy');
  assertNotIncludes(adminFoodJs, 'function buildAdminFoodScheduleStatusHtml', 'Stav kantyny/jidelny byl na zadost odstranen z admin obrazovky');
  assertNotIncludes(menuJs, 'function buildAdminFoodPublicCheckHtml', 'Verejna kontrola provozu byla na zadost odstranena z admin obrazovky kantyny/jidelny');
  assertNotIncludes(css, '.adminFoodStatusGrid', 'Stav kantyny/jidelny byl odstranen, admin styl uz nema existovat');
  assertNotIncludes(css, '.adminFoodPublicCheckGrid', 'Verejna kontrola kantyny/jidelny byla odstranena, admin styl uz nema existovat');
  assertNotIncludes(adminFoodJs, '<details class="appMenuFoldSection adminFoodScheduleFold"', 'Kantyna/jidelna uz nema byt rozbalovaci, kdyz v ni po odstraneni stavu neni co skryvat');
  assertIncludes(qrJs, 'function formatFoodFutureSpecialSundayDates', 'Verejna Kantyna/jidelna musi ukazovat jen budouci prescasove nedele');
  assertIncludes(qrJs, 'Budoucí přesčasové neděle:', 'Popisek verejneho seznamu prescasu musi rikat, ze jde jen o budouci terminy');
  assertNotIncludes(qrJs, "Seznam přesčasových nedělí: ' + escapeHtml(formatFoodSpecialSundayDates())", 'Verejna Kantyna/jidelna nesmi zobrazovat historicky seznam vsech prescasu');
assertIncludes(rotaceJs, 'getRotationMonthShiftAbsenceGroups', 'Absence v Rozpisech/exportu musí držet i prázdné pracovní dny');
assertIncludes(rotaceJs, 'if (i === 0) absenceHtml += "<th class=\'noteDateCell\'>Datum</th><th class=\'noteShiftCell\'>Směna</th>";', 'Absence v Rozpisech mají datum/směnu jen u první dvojice dne');
assertNotIncludes(rotaceJs, "emptyCell noteDateCell", 'Absence v Rozpisech už nesmí vykreslovat prázdné opakované sloupce Datum/Směna');
assertIncludes(brusyJs, 'function absenceReasonShortCode', 'Absence musí mít krátké kódy důvodu pro Rozpisy a admin přehled');
assertIncludes(rotaceJs, 'absenceReasonShortCode(n.code, n.label)', 'Rozpisy musí zobrazovat důvody absencí zkratkou');
assertIncludes(rotaceJs, 'sortRotationAbsenceGroupItems(groups)', 'Absence v Rozpisech musí mít stabilní sloupce podle souvislých bloků');
assertIncludes(rotaceJs, 'slotIndex', 'Export Rozpisu musí zachovat stabilní sloupec osoby i v obrázku');
assertIncludes(ui, 'function buildAdminAbsenceSummaryHtml(month)', 'Admin přehled absencí musí použít stejný denní model jako Rozpisy');
assertIncludes(ui, 'if (i === 0) html += "<th class=\'noteDateCell\'>Datum</th><th class=\'noteShiftCell\'>Směna</th>";', 'Admin přehled absencí má datum/směnu jen jednou na řádek');
assertNotIncludes(ui, "emptyCell noteDateCell", 'Admin přehled absencí nesmí opakovat prázdné datum/směnu sloupce');
assertIncludes(ui, 'function adminRotationFindShiftForAbsenceDate', 'Admin absence musí umět dopočítat směnu z rozpisu podle zadaného data');
assertIncludes(ui, 'month.notes = adminRotationSortNotes(notes, month)', 'Admin absence se po uložení musí řadit podle data');
assertIncludes(stylesLayoutCss, '.noteReasonCell{width:34px;', 'Sloupec důvodu absence musí být užší než sloupec jména');
assertIncludes(rotaceJs, 'buildStatsForYear(year, { maxMonth })', 'Nýtování a úklid v exportu musí být omezené exportovaným měsícem');
assertIncludes(ui, 'yearHardMachineStats', 'Generátor musí při nýtování zohledňovat roční počty před cílovým měsícem');
assertIncludes(appearanceThemeJs, '"id": "light-brown"', 'Musí existovat základní světlý hnědý theme');
assertIncludes(appearanceThemeJs, '"id": "light-zigzag"', 'Musí existovat základní světlé cikcak pozadí');
  assertIncludes(css, '.adminRotationOvertimeFilterChip.isActive', 'Aktivní filtr směny musí být vizuálně odlišený');
  assertIncludes(css, '.adminRotationOvertimeHiddenByFilter', 'Filtrované přesčasy se musí skrýt jen vizuálně, ne mazat z DOM');
  assertIncludes(coreJs, 'VACATION_COUNTDOWN_SETTINGS_CATEGORY', 'Dovolena/odstavky musi mit samostatnou kategorii v machine_settings');
  assertIncludes(coreJs, 'function getVacationPeriodForDate', 'Smenny provoz musi umet poznat aktivni dovolenou/odstavku podle data a casu');
  assertIncludes(coreJs, 'function getEasterSundayDate', 'Pohyblive velikonoční svátky se musí dopočítávat podle roku');
  assertIncludes(coreJs, 'function getMovableHolidayInfo', 'Velky patek a velikonoční pondeli nesmi byt pevne datum jen pro rok 2026');
  assertNotIncludes(coreJs, '"4-3": "Velký pátek"', 'Velky patek nesmi zustat jako pevny svatek 4.3.');
  assertNotIncludes(coreJs, '"4-6": "Velikonoční pondělí"', 'Velikonocni pondeli nesmi zustat jako pevny svatek 4.6.');
  assertNotIncludes(coreJs, '"4-3", "4-6"', 'Velikonocni svatky nesmi zustat ve fixnim seznamu startu smen.');
  assertIncludes(coreJs, 'const vacationPeriod = typeof getVacationPeriodForDate', 'getSpecialWorkInfo musi blokovat praci behem nastavene dovolene/odstavky');
  assertIncludes(coreJs, 'function getVacationCountdownTeamShiftCount', 'Odpočet dovolené musí počítat zbývající směny D do cílového období');
  assertIncludes(coreJs, 'function countVacationCountdownRotationScheduledShifts', 'Odpočet směn D musí umět pro vytvořený měsíc použít skutečné řádky rozpisu');
  assertIncludes(coreJs, 'vacationCountdownMonthHasSchedule(monthKey)', 'Odpočet směn D musí přepnout z teoretického cyklu na rozpis, když měsíc existuje');
  assertIncludes(coreJs, 'candidate.end instanceof Date', 'Počet směn D se musí po započtení posouvat podle konce směny, ne zůstat uvnitř aktivní směny');
  assertIncludes(coreJs, 'cursor = new Date(Math.max(endTime', 'Počet směn D se musí posunout až za konec započtené směny');
  assertNotIncludes(coreJs, 'cursor = new Date(next.start.getTime() + 60000);', 'Počet směn D se nesmí zastavit minutu po startu první směny');
  assertIncludes(coreJs, 'shiftMeta: formatVacationCountdownShiftCount', 'Odpočet dovolené musí vracet text pro řádek směny D');
  assertIncludes(dashboardJs, 'function buildDashboardVacationCardHtml', 'Dashboard karta Dovolená musí mít vlastní 50/50 layout');
  assertIncludes(dashboardJs, 'dashboardVacationSplit', 'Dashboard karta Dovolená musí vykreslit svisle rozdělený obsah');
  assertIncludes(dashboardJs, 'dashboardVacationShiftValue', 'Dashboard karta Dovolená musí mít hodnotu směn D v pravé části');
  assertIncludes(dashboardJs, 'dashboardValue dashboardVacationShiftValue', 'Počet směn D musí používat stejný základní styl jako počet dní do CZD');
  assertIncludes(dashboardJs, 'dashboardMeta dashboardVacationShiftMeta', 'Popisek směna D musí používat stejný základní styl jako k CZD');
  assertIncludes(dashboardPolishCss, '#home.page.active #dashCzd .dashboardVacationSplit', 'Karta Dovolená musí mít 50/50 grid pro svislý předěl');
  assertIncludes(dashboardPolishCss, '#home.page.active #dashCzd .dashboardTop', 'Karta Dovolená musí mít hlavičku s ikonou a názvem nahoře jako ostatní panely');
  assertIncludes(dashboardPolishCss, 'grid-column:1 / -1 !important;', 'Karta Dovolená musí ukotvit hlavičku i spodní 50/50 blok přes celou šířku');
  assertIncludes(dashboardPolishCss, 'grid-row:2 / span 2 !important;', 'Karta Dovolená musí mít hodnoty ve spodní části panelu, ne vedle ikonky');
  assertIncludes(dashboardPolishCss, 'align-self:end !important;', 'Karta Dovolená musí držet hodnoty dole ve stejné výšce jako ostatní panely');
  assertIncludes(dashboardPolishCss, 'justify-content:flex-start !important;', 'Karta Dovolená musí mít spodní hodnoty posazené výš jako ostatní panely');
  assertIncludes(dashboardPolishCss, 'margin-top:5px !important;', 'Karta Dovolená musí mít větší mezeru mezi hodnotou a popiskem jako ostatní panely');
  assertNotIncludes(dashboardPolishCss, 'font-size:clamp(12px,3.25vw,16px) !important;', 'Počet směn D nesmí mít vlastní menší velikost než počet dní');
  assertNotIncludes(dashboardPolishCss, 'font-size:clamp(11px,3.05vw,14px) !important;', 'Počet směn D se nesmí na mobilu zmenšovat proti počtu dní');
  assertNotIncludes(dashboardPolishCss, 'font-size:clamp(9px,2.4vw,11px) !important;', 'Popisek směna D nesmí mít vlastní menší velikost než k CZD');
  assertIncludes(dashboardPolishCss, 'border-left:1px solid rgba(174,255,174,.34)', 'Karta Dovolená musí mít svislý předěl před směnou D');
  assertIncludes(adminFoodJs, 'function buildAdminVacationCountdownSettingsHtml', 'Administrace musi mit samostatny formular dovolene/odstavek');
  assertIncludes(adminFoodJs, 'class="adminVacationNameCol"', 'Sloupec Nazev u dovolene/odstavek musi mit vlastni uzsi sirku');
  assertIncludes(adminFoodJs, 'class="adminVacationStartCol"', 'Sloupec Od u dovolene/odstavek musi mit vlastni uzsi sirku');
  assertIncludes(adminFoodJs, 'class="adminVacationEndCol"', 'Sloupec Do u dovolene/odstavek musi mit vlastni uzsi sirku');
  assertIncludes(stylesAdminPolishCss, '.adminVacationNameCol{width:106px;}', 'Sloupec Nazev musi byt o cca 50% uzsi');
  assertIncludes(stylesAdminPolishCss, '.adminVacationStartCol{width:98px;}', 'Sloupec Od musi byt o dalsich 50% uzsi nez predchozich 195px');
  assertIncludes(stylesAdminPolishCss, '.adminVacationEndCol{width:98px;}', 'Sloupec Do musi byt o dalsich 50% uzsi nez predchozich 195px');
  assertIncludes(adminFoodJs, 'function buildAdminVacationCountdownStatusHtml', 'Administrace musi mit souhrn stavu dovolene/odstavek');
  assertIncludes(adminFoodJs, 'function adminVacationRefreshStatus', 'Souhrn dovolene/odstavek se musi umet prepocitat podle rozepsanych radku');
  assertIncludes(adminFoodJs, 'adminVacationReadPeriodsFromRoot', 'Souhrn dovolene/odstavek musi vychazet z aktualnich DOM radku pred ulozenim');
  assertIncludes(adminFoodJs, 'data-vacation-period-row', 'Formular dovolene/odstavek musi ukladat vice pojmenovanych obdobi od-do');
  assertIncludes(menuJs, 'adminVacationRefreshStatus(body)', 'Admin menu musi prepocitat souhrn dovolene/odstavek pri zmene pole');
  assertIncludes(css, '.adminVacationStatusGrid', 'Souhrn dovolene/odstavek musi mit vlastni responsive admin styl');
  assertNotIncludes(menuJs, 'function buildAdminVacationPublicCheckHtml', 'Verejna kontrola dovolene byla na zadost odstranena z admin obrazovky');
  assertNotIncludes(css, '.adminVacationPublicCheckGrid', 'Verejna kontrola dovolene byla odstranena, admin styl uz nema existovat');
  assertIncludes(adminFoodJs, '<details class="appMenuFoldSection adminVacationStatus" id="adminVacationStatus">', 'Stav dovolene/odstavek musi byt sbalitelny (details/summary), ne pevny box');
  assertIncludes(menuJs, "adminAction === 'open-vacation'", 'Admin menu musi otevirat samostatny panel dovolene/odstavek');
  assertIncludes(menuJs, "adminAction === 'save-vacation-countdown'", 'Admin menu musi umet ulozit nastaveni dovolene/odstavek');
  assertIncludes(supabaseBridgeJs, 'VACATION_COUNTDOWN_SETTINGS', 'Supabase ukladani musi podporovat samostatny radek dovolene/odstavek mimo starsi RPC kategorie');
  assertIncludes(coreJs, "const RAK_SPECIAL_DAYS_SETTINGS_KEY = 'SPECIAL_DAYS_SETTINGS'", 'Mimoradne volne dny musi mit vlastni machine_settings klic');
  assertIncludes(coreJs, "const RAK_SPECIAL_DAYS_SETTINGS_CATEGORY = 'special_days_settings'", 'Mimoradne volne dny musi mit vlastni kategorii nastaveni');
  assertIncludes(coreJs, 'function getRakSpecialDayInfo', 'getSpecialWorkInfo musi umet nacist mimoradny volny den z admin nastaveni');
  assertIncludes(coreJs, 'const customSpecial = typeof getRakSpecialDayInfo', 'getSpecialWorkInfo musi pred pevnymi svatky kontrolovat admin mimoradne volne dny');
  assertIncludes(coreJs, 'function buildAdminSpecialDaysSettingsHtml', 'Administrace musi mit formular mimoradnych volnych dnu');
  assertIncludes(coreJs, 'class="adminSpecialDaysDateCol"', 'Sloupec Datum u mimoradnych volnych dnu musi mit vlastni uzsi sirku');
  assertIncludes(coreJs, 'class="adminSpecialDaysTypeCol"', 'Sloupec Typ u mimoradnych volnych dnu musi mit vlastni uzsi sirku');
  assertIncludes(coreJs, 'class="adminSpecialDaysNameCol"', 'Sloupec Nazev u mimoradnych volnych dnu musi mit vlastni uzsi sirku');
  assertIncludes(stylesAdminPolishCss, '.adminSpecialDaysDateCol{width:104px;}', 'Sloupec Datum musi byt o dalsich 20% uzsi nez predchozich 130px');
  assertIncludes(stylesAdminPolishCss, '.adminSpecialDaysTypeCol{width:110px;}', 'Sloupec Typ musi byt o cca 50% uzsi');
  assertIncludes(stylesAdminPolishCss, '.adminSpecialDaysNameCol{width:149px;}', 'Sloupec Nazev musi byt o cca 30% uzsi');
  assertIncludes(coreJs, 'function buildAdminSpecialDaysStatusHtml', 'Administrace musi mit souhrn stavu mimoradnych volnych dnu');
  assertIncludes(coreJs, 'function adminSpecialDaysRefreshStatus', 'Souhrn mimoradnych volnych dnu se musi prepocitat podle rozepsanych radku');
  assertIncludes(coreJs, 'readRakSpecialDaysEntriesFromRoot', 'Souhrn mimoradnych volnych dnu musi vychazet z aktualnich DOM radku pred ulozenim');
  assertIncludes(coreJs, 'function readAdminSpecialDaysSettingsFromDom', 'Administrace musi umet nacist mimoradne volne dny z formulare');
  assertIncludes(coreJs, 'function mergeRakSpecialDaysSettingsRows', 'Mimoradne volne dny se musi ukladat do machine_settings bez mazani ostatnich nastaveni');
  assertIncludes(menuJs, 'adminSpecialDaysRefreshStatus(body)', 'Admin menu musi prepocitat souhrn mimoradnych volnych dnu pri zmene pole');
  assertIncludes(css, '.adminSpecialDaysStatusGrid', 'Souhrn mimoradnych volnych dnu musi mit vlastni responsive admin styl');
  assertNotIncludes(menuJs, 'function buildAdminSpecialDaysPublicCheckHtml', 'Verejna kontrola mimoradnych volnych dnu byla na zadost odstranena z admin obrazovky');
  assertNotIncludes(css, '.adminSpecialDaysPublicCheckGrid', 'Verejna kontrola mimoradnych volnych dnu byla odstranena, admin styl uz nema existovat');
  assertIncludes(coreJs, '<details class="appMenuFoldSection adminSpecialDaysStatus" id="adminSpecialDaysStatus">', 'Stav mimoradnych volnych dnu musi byt sbalitelny (details/summary), ne pevny box');
  assertNotIncludes(menuJs, 'function buildAdminRotationPublicCheckHtml', 'Verejna kontrola rozpisu byla na zadost odstranena z admin obrazovky');
  assertNotIncludes(css, '.adminRotationPublicCheckGrid', 'Verejna kontrola rozpisu byla odstranena, admin styl uz nema existovat');
  assertIncludes(menuJs, "action: 'open-special-days', label: 'Mimořádné volné dny'", 'Admin menu musi obsahovat sekci Mimoradne volne dny');
  assertIncludes(menuJs, "adminAction === 'open-special-days'", 'Admin menu musi umet otevrit mimoradne volne dny');
  assertIncludes(menuJs, "adminAction === 'save-special-days'", 'Admin menu musi umet ulozit mimoradne volne dny');
  assertIncludes(menuJs, "adminAction === 'load-special-days'", 'Admin menu musi umet nacist mimoradne volne dny online');
  assertIncludes(menuJs, "'admin-special-days'", 'Mimoradne volne dny musi byt mezi chranenymi admin view');
  assertNotIncludes(ui, 'function buildAdminMachineStatusHtml', 'Stav nastaveni stroju byl na zadost odstranen z admin obrazovky');
  assertNotIncludes(menuJs, 'function buildAdminMachinePublicCheckHtml', 'Kontrola dopadu stroju byla na zadost odstranena z admin obrazovky stroju');
  assertNotIncludes(css, '.adminMachineStatusGrid', 'Stav nastaveni stroju byl odstranen, admin styl uz nema existovat');
  assertNotIncludes(css, '.adminMachinePublicCheckGrid', 'Kontrola dopadu stroju byla odstranena, admin styl uz nema existovat');
  assertIncludes(ui, 'app.machineSettingsRows.filter(isRakSpecialDaysSettingsRow)', 'Ulozeni stroju nesmi smazat mimoradne volne dny');
  assertIncludes(supabaseBridgeJs, "category === 'special_days_settings'", 'Supabase compatibility save musi povolit mimoradne volne dny');
  assertIncludes(supabaseBridgeJs, "key === 'SPECIAL_DAYS_SETTINGS'", 'Supabase compatibility save musi povolit klic mimoradnych volnych dnu');
  assertIncludes(supabaseBridgeJs, 'function makeMachineSettingsRpcPayload', 'Specialni admin nastaveni musi mit kompatibilni RPC payload bez primeho zapisu do tabulky');
  assertIncludes(supabaseBridgeJs, "category: 'frezka'", 'Specialni admin nastaveni musi pro starsi RPC pouzit povolenou kategorii a skutecny typ nechat v settings_json');
  assertIncludes(supabaseBridgeJs, 'admin_settings_key', 'Kompatibilni RPC payload musi zachovat puvodni specialni klic v settings_json');
  assertNotIncludes(supabaseBridgeJs, 'const directAdminPayloads =', 'Specialni admin nastaveni se nesmi ukladat primym upsertem do machine_settings');
  assertIncludes(appUiJs, 'Administrace rozpisů, výjimky a dovolené', 'O aplikaci musi mit aktualni kratky souhrn verzi 1.150-1.178');
  assertIncludes(appUiJs, 'Předání správy a kontrolní souhrny', 'O aplikaci musi mit aktualni kratky souhrn verzi 1.200-1.233');
  assertIncludes(appUiJs, 'Nastavení přímo z administrace', 'O aplikaci musi mit aktualni kratky souhrn verzi 1.179-1.199');
  assertIncludes(appUiJs, 'Admin sekce postupně dostaly stavové souhrny', 'O aplikaci musi vysvetlit nove admin souhrny pro predani');
}

function assertRotationOvertimeDefaults2025ContractV1129() {
  const coreJs = read('core.js');
  const qrJs = read('qr.js');
  const ui = read('admin-rotation.js');
  const requiredDates = [
    '2025-01-12', '2025-01-26', '2025-02-16', '2025-03-02',
    '2025-03-16', '2025-03-30', '2025-10-05', '2025-10-19',
    '2025-11-09', '2025-11-23', '2025-11-30', '2025-12-14'
  ];
  assertIncludes(coreJs, 'SPECIAL_OVERTIME_SUNDAY_NIGHTS_2025', 'core.js musí mít výchozí seznam rozpisových přesčasů 2025');
  assertIncludes(coreJs, 'ROTATION_OVERTIME_DEFAULT_SEED_VERSION = 129', 'Výchozí přesčasy musí mít seed verzi 129 pro bezpečnou migraci');
  assertIncludes(coreJs, 'function mergeRotationOvertimeDefaultSeedEntries', 'Custom nastavení z minulých buildů musí umět doplnit nově dodané defaulty 2025');
  assertIncludes(ui, 'defaultSeedVersion', 'Uložení přesčasů musí zapsat defaultSeedVersion, aby se smazané defaulty znovu nevracely');
  requiredDates.forEach((date) => {
    assertIncludes(coreJs, '"' + date + '"', 'Rozpisové přesčasy 2025 musí obsahovat ' + date);
    assertIncludes(qrJs, '"' + date + '"', 'Food/kantýna přesčasy 2025 musí obsahovat ' + date);
  });
}

function assertAdminAccountLoginContractV1141() {
  assertIncludes(adminUnlockJs, "const RAK_OWNER_ADMIN_ACCOUNT_ID = '9811'", 'Root admin musi byt navazany na ucet 9811');
  assertIncludes(adminUnlockJs, "const RAK_ADMIN_ACCOUNTS_SETTINGS_KEY = 'ADMIN_ACCOUNTS_SETTINGS'", 'Seznam dalsich adminu musi mit vlastni machine_settings klic');
  assertIncludes(adminUnlockJs, "const RAK_ADMIN_ACCOUNTS_SETTINGS_CATEGORY = 'admin_accounts_settings'", 'Seznam dalsich adminu musi mit vlastni kategorii nastaveni');
  assertIncludes(adminUnlockJs, "const RAK_ADMIN_SESSION_AUTH_PIN_KEY = 'adminAuthPinSession'", 'Admin login heslo musi byt oddelene od interniho Supabase PINu');
  assertIncludes(adminUnlockJs, 'app.adminPin = RAK_OWNER_ADMIN_PASSWORD', 'Platny admin musi pro online zapisy pouzit interni owner PIN');
  assertIncludes(adminUnlockJs, 'function buildAdminAccountsRoleOverviewHtml', 'Sprava spravcu musi ukazovat prehled roli owner/admin');
  assertIncludes(adminUnlockJs, 'function buildAdminAccountsStatusHtml', 'Sprava spravcu musi ukazovat stav opravneni, hesel a radku');
  assertIncludes(adminUnlockJs, 'function adminAccountsRefreshStatus', 'Sprava spravcu musi umet prepocitat stav jeste pred ulozenim');
  assertIncludes(adminUnlockJs, 'function readAdminAccountsDraftRowsFromDom', 'Sprava spravcu musi umet cist rozepsane radky pro kontrolu');
  assertIncludes(adminUnlockJs, 'function buildAdminAccountsSettingsHtml', 'Owner admin musi mit formular pro spravu dalsich adminu');
  assertIncludes(adminUnlockJs, 'function readAdminAccountsSettingsFromDom', 'Owner admin musi umet nacist spravce z formulare');
  assertIncludes(adminUnlockJs, 'function mergeAdminAccountsSettingsRows', 'Spravci se musi ukladat do machine_settings bez mazani ostatnich nastaveni');
  assertIncludes(adminUnlockJs, 'function rakAdminCanManageAdmins', 'Jen owner admin smi spravovat dalsi adminy');
  assertIncludes(adminUnlockJs, 'function rakAdminPromptUnlockForAccount', 'Pri prihlaseni admin uctu se musi vyzadat heslo');
  assertIncludes(adminUnlockJs, 'RAK_ADMIN_SESSION_PROMPTED_ACCOUNT_KEY', 'Startovni vyzva admin hesla musi byt hlidana proti opakovanemu promptu');
  assertIncludes(adminUnlockJs, 'RAK_ADMIN_PERSISTENT_SESSION_KEY', 'Admin relace se po overeni musi umet zapamatovat na zarizeni');
  assertIncludes(adminUnlockJs, 'function rakAdminRestorePersistentSessionForActiveAccount', 'Po znovuotevreni appky se musi obnovit ulozena admin relace');
  assertIncludes(adminUnlockJs, 'function buildAdminSessionDevicesHtml', 'Hlavni admin musi videt odemcena admin zarizeni');
  assertIncludes(adminUnlockJs, 'function rakAdminRevokePersistentSession', 'Hlavni admin musi umet odhlasit ulozenou admin relaci zarizeni');
  assertIncludes(adminUnlockJs, 'data-admin-current-device="1"', 'Aktualni admin zarizeni musi mit vlastni odhlasovaci akci');
  assertIncludes(adminUnlockJs, 'Odhlásit toto', 'Aktualni admin zarizeni musi jit odhlasit z panelu Spravci');
  assertIncludes(adminUnlockJs, 'function rakAdminPromptOnceForActiveAccount', 'Po znovuotevreni appky se musi admin ucet znovu zeptat na heslo');
  assertIncludes(adminUnlockJs, 'function rakAdminLoadSettingsThenCheck', 'Start appky musi umet nacist online spravce pred kontrolou admin hesla');
  assertIncludes(adminUnlockJs, "rakAdminLoadSettingsThenCheck('startup')", 'Start appky musi spustit jednorazovou kontrolu admin hesla');
  assertIncludes(adminUnlockJs, "rakAdminPromptOnceForActiveAccount(reason || 'settings-loaded')", 'Dalsi admini z online nastaveni se musi overit po nacteni machine_settings');
  assertIncludes(ui, "adminAction === 'revoke-admin-session'", 'Administrace Spravci musi mit akci pro odhlaseni admin zarizeni');
  assertIncludes(ui, "target.dataset.adminCurrentDevice === '1'", 'Odhlaseni aktualniho admin zarizeni musi zavrit admin zpet do bezneho menu');
  assertIncludes(adminUnlockJs, 'function rakAdminCanOpenAdmin', 'Admin menu musi mit centralni kontrolu otevreni');
  assertIncludes(adminUnlockJs, 'function bindAdminAccountUnlock', 'Admin inicializace musi byt navazana na prihlaseny ucet, ne na tajne klikani');
  assertIncludes(adminUnlockJs, 'rakAdminLock()', 'Bez admin uctu se musi admin opravneni zrusit');
  assertIncludes(gamesProfileJs, 'rakAdminPromptUnlockForAccount(id)', 'Pri vyberu aktivniho uctu se musi overit admin heslo');
  assertIncludes(gamesProfileJs, 'window.RotationSupabaseBridge.loadMachineSettings', 'Pri prihlaseni se musi nacist online seznam adminu');
  assertIncludes(gamesProfileJs, "if (typeof rakAdminLock === 'function') rakAdminLock();", 'Odhlaseni profilu musi zamknout admin relaci');
  assertIncludes(ui, "const adminViews = new Set(['admin'", 'Prime otevreni admin obrazovek musi byt hlidane seznamem admin views');
  assertIncludes(ui, 'function appMenuAdminModeSet', 'Admin akce musi mit centralni seznam povolenych admin modu');
  assertIncludes(ui, 'function appMenuIsAdminInteraction', 'Admin akce musi mit centralni rozpoznani admin interakci');
  assertIncludes(ui, 'function appMenuCanRunAdminInteraction', 'Admin akce musi mit centralni kontrolu opravneni');
  assertIncludes(ui, "appMenuIsAdminInteraction(target, menuAction, adminAction, adminMonthKey, adminYearKey)", 'Click handler musi pouzivat centralni guard admin akci');
  assertIncludes(ui, '!appMenuCanRunAdminInteraction(currentView)', 'Click handler musi blokovat admin akce bez opravneni');
  assertIncludes(ui, "if (!adminViews.has(v)) body.dataset.adminView = ''", 'Verejne menu nesmi nechavat stary admin view mod');
  assertIncludes(ui, "const currentView = String(body.dataset.adminView || '')", 'Click handler nesmi brat prazdny verejny mod jako admin home');
  assertIncludes(ui, "action: 'open-admin-accounts', label: 'Správci'", 'Owner admin musi mit v administraci sekci Spravci');
  assertIncludes(ui, "adminAction === 'save-admin-accounts'", 'Admin menu musi umet ulozit seznam spravcu');
  assertIncludes(ui, "adminAction === 'load-admin-accounts'", 'Admin menu musi umet nacist seznam spravcu online');
  assertIncludes(ui, 'adminAccountsRefreshStatus(body)', 'Zmeny ve formulari spravcu musi hned prepocitat stav');
  assertIncludes(adminUnlockJs, 'Hlavni admin', 'Sprava spravcu musi jasne oznacit hlavni admin ucet');
  assertIncludes(adminUnlockJs, 'Nizsi admini', 'Sprava spravcu musi jasne oddelit nizsi adminy');
  assertIncludes(adminUnlockJs, 'Stav spravcu', 'Sprava spravcu musi mit jasny stavovy souhrn');
  assertIncludes(adminUnlockJs, 'function buildAdminAccountsSafetyHtml', 'Sprava spravcu musi mit bezpecnostni souhrn pro predani');
  assertIncludes(adminUnlockJs, 'Bezpecnost pristupu', 'Sprava spravcu musi jasne pojmenovat bezpecnost pristupu');
  assertIncludes(adminUnlockJs, 'Hesla se ukladaji jen jako hash', 'Sprava spravcu musi jasne rikat, ze hesla jsou jen hash');
  assertIncludes(adminUnlockJs, 'Kontrola radku', 'Sprava spravcu musi upozornovat na nedokoncene nebo duplicitni radky');
  assertIncludes(adminUnlockJs, 'Muzou spravovat pracovni casti administrace, ale nemuzou menit hesla ani dalsi adminy.', 'Nizsi admini nesmi byt popsani jako owner admini');
  assertIncludes(ui, 'Provoz, rozpisy, absence, zálohy, exporty a nastavení aplikace.', 'Prehled opravneni musi rikat, ze nizsi admin muze menit pracovni casti aplikace');
  assertIncludes(ui, 'Nizsi admin muze menit provoz, rozpisy, absence, zalohy, exporty a nastaveni aplikace, ale ne seznam spravcu ani hesla.', 'Predavaci text musi rikat, ze nizsi admin smi vse krome spravcu a hesel');
  assertIncludes(ui, "owner ? 'Hlavní admin' : 'Nižší admin'", 'Admin uvod musi nizsiho admina pojmenovat srozumitelne');
  assertIncludes(ui, 'ale ne hesla ani další adminy', 'Nizsi admin musi mit jasne uvedene omezeni hesel a dalsich adminu');
  assertIncludes(ui, 'Seznam správců může měnit jen hlavní admin.', 'Prime otevreni spravcu bez owner role musi ukazat jasne vysvetleni');
  assertIncludes(ui, 'rakAdminCanOpenAdmin()', 'Tlačítko Administrace i admin view musi pouzivat novou kontrolu opravneni');
  assertIncludes(ui, 'async function appMenuEnsureAdminAccessFromMenu', 'Klik na administraci musi umet obnovit admin session pred otevrenim');
  assertIncludes(ui, 'const adminReady = await appMenuEnsureAdminAccessFromMenu()', 'Klik na administraci nesmi zustat bez odezvy pri ulozenem admin prihlaseni');
  assertIncludes(ui, 'function appMenuShouldShowAdminEntry', 'Menu musi ukazat vstup do administrace i admin uctu pred dokoncenym obnovenim session');
  assertIncludes(ui, "localStorage.getItem('adminPersistentSessionV1')", 'Menu musi poznat ulozenou admin session bez viditelneho dopadu na bezne ucty');
  assertIncludes(ui, 'appMenuShouldShowAdminEntry() ? \'  <button type="button" class="appMenuAction isActive" data-menu-action="admin">Administrace</button>\'', 'Tlacitko Administrace musi pouzivat admin-entry helper');
  assertIncludes(ui, "buildAdminMenuSectionHtml('1. Provoz'", 'Admin menu musi byt rozdelene do prehlednych provoznich skupin');
  assertIncludes(ui, 'buildAdminMenuSectionHtml', 'Admin menu musi skladat prehledne skupiny pres spolecny helper');
  assertIncludes(ui, 'adminMenuSections', 'Admin uvod musi mit zabalitelne skupiny spravcovskych oblasti');
  assertIncludes(ui, 'Hesla a další adminy spravuje jen hlavní admin.', 'Admin menu musi nizsimu adminovi vysvetlit, proc nema spravu hesel');
  assertIncludes(bridge, "category === 'admin_accounts_settings'", 'Supabase compatibility save musi povolit specialni kategorii spravcu');
  assertIncludes(ui, "cat !== 'admin_accounts_settings'", 'Specialni radek spravcu nesmi byt v bezne tabulce stroju');
  assertIncludes(ui, "serviceActions.unshift({ action: 'open-admin-accounts'", 'Mapa nastaveni musi ukazat Spravce jen hlavnimu adminovi');
  assertIncludes(ui, "serviceActions.push({ action: 'open-settings-backups'", 'Mapa nastaveni musi ukazat zalohy nastaveni jen hlavnimu adminovi');
  assertIncludes(ui, "const RAK_FULL_SETTINGS_BACKUP_CATEGORY = 'admin_full_settings_backup'", 'Uplna zaloha nastaveni musi mit vlastni kategorii');
  assertIncludes(ui, "const RAK_DELETED_MACHINE_SETTINGS_CATEGORY = 'admin_settings_deleted'", 'Rollback nastaveni musi mit skryte deleted radky pro odebrani polozek mimo zalohu');
  assertIncludes(ui, "source === 'before-restore'", 'Obnova nastaveni musi rozlisit automatickou zalohu pred obnovou');
  assertIncludes(ui, "sourceLabel: source === 'before-restore' ? 'před obnovou' : (source === 'imported' ? 'importovaná' : 'ruční')", 'Seznam zaloh nastaveni musi rozlisit rucni, importovane a automaticke zalohy');
  assertIncludes(ui, "const manualCount = backups.filter", 'Stav zaloh nastaveni musi pocitat rucni body obnovy');
  assertIncludes(ui, "const beforeRestoreCount = backups.filter", 'Stav zaloh nastaveni musi pocitat automaticke body pred obnovou');
  assertIncludes(ui, "Ruční / auto", 'Stav zaloh nastaveni musi zobrazit rucni a automaticke zalohy oddelene');
  assertIncludes(ui, "source: 'before-restore'", 'Obnova nastaveni musi vytvorit automatickou zalohu aktualniho stavu');
  assertIncludes(ui, 'restoredBackupId: backup.id', 'Automaticka zaloha pred obnovou musi vedet, ke ktere obnove patri');
  assertIncludes(ui, 'preRestoreBackup', 'Obnova nastaveni musi vracet bod navratu pred obnovou');
  assertNotIncludes(ui, 'function buildAdminFullSettingsBackupSafetyHtml', 'Bezpecnost obnovy zaloh nastaveni byla na zadost odstranena z admin obrazovky');
  assertIncludes(ui, '<details class="appMenuFoldSection adminRotationBackupStatus adminFullSettingsBackupStatus">', 'Stav zaloh nastaveni musi byt sbalitelny (details/summary), ne pevny box');
  assertIncludes(stylesAdminPolishCss, '.adminFullSettingsBackupLabelCol{width:11px;}', 'Sloupec Zaloha nastaveni musi byt o dalsich 50% uzsi nez predchozich 21px');
  assertIncludes(stylesAdminPolishCss, '.adminFullSettingsBackupActionCol{width:9px;}', 'Sloupec Akce zaloh nastaveni musi byt o dalsich 50% uzsi nez predchozich 17px');
  assertIncludes(ui, 'function makeDeletedMachineSettingsRow', 'Rollback nastaveni musi umet skryt radky, ktere v zaloze nebyly');
  assertIncludes(ui, 'deletedCount: deletedRows.length', 'Obnova nastaveni musi vracet pocet skrytych radku mimo zalohu');
  assertIncludes(ui, "adminAction === 'create-full-settings-backup'", 'Hlavni admin musi umet vytvorit uplnou zalohu nastaveni');
  assertIncludes(ui, "adminAction === 'create-full-settings-backup-online'", 'Hlavni admin musi umet vytvorit zalohu jen online bez stazeni souboru');
  assertIncludes(ui, "adminAction === 'download-full-settings-backup'", 'Hlavni admin musi umet stahnout uplnou zalohu nastaveni');
  assertIncludes(ui, 'function downloadAdminFullSettingsBackup', 'Uplna zaloha nastaveni musi mit JSON export pro offline archiv');
  assertIncludes(ui, "type: 'rak-full-settings-backup-export'", 'JSON export uplne zalohy musi mit jasny typ');
  assertIncludes(ui, "RaK_zaloha_nastaveni_", 'Stazena zaloha nastaveni musi mit jasny nazev souboru');
  assertIncludes(ui, "downloadAdminFullSettingsBackup(backupId)", 'Vytvoreni zalohy nastaveni musi ulozit Supabase bod a hned stahnout JSON');
  assertNotIncludes(ui, "adminAction === 'import-full-settings-backup'", 'Samostatna akce jen-nahrat byla nahrazena kombinovanou volbou obnovy ze souboru');
  assertIncludes(ui, "adminAction === 'restore-full-settings-backup-from-file'", 'Hlavni admin musi mit vyber obnovy ze souboru (telefon) vedle obnovy online ze Supabase');
  assertIncludes(ui, 'app.pendingFullSettingsBackupAutoRestore = true', 'Obnova ze souboru musi po nahrani rovnou spustit obnoveni nastaveni');
  assertIncludes(ui, 'function ensureFullSettingsBackupFileInput', 'Import zalohy nastaveni musi mit vlastni file input');
  assertIncludes(ui, 'function importAdminFullSettingsBackupFile', 'Import zalohy nastaveni musi umet ulozit JSON zalohu do Supabase');
  assertIncludes(ui, "source: 'imported'", 'Importovana zaloha nastaveni musi byt v seznamu rozlisena');
  assertIncludes(ui, "adminAction === 'restore-full-settings-backup'", 'Hlavni admin musi umet obnovit uplnou zalohu nastaveni online ze seznamu');
  assertIncludes(ui, "v === 'admin-settings-backups' && !(typeof rakAdminCanManageAdmins === 'function' && rakAdminCanManageAdmins())", 'Nizsi admin nesmi otevrit uplne zalohy nastaveni primo');
  assertIncludes(bridge, "category === 'admin_full_settings_backup'", 'Supabase compatibility save musi povolit uplne zalohy nastaveni');
  assertIncludes(bridge, "category === 'admin_settings_deleted'", 'Supabase compatibility save musi povolit skryte deleted radky pro rollback nastaveni');
  assertIncludes(bridge, 'function isDeletedMachineSettingsRow', 'Nacitani nastaveni musi umet ignorovat skryte deleted radky');
  assertIncludes(bridge, '.filter((row) => !isDeletedMachineSettingsRow(row))', 'Nacitani nastaveni musi filtrovat deleted radky z online i cache');
  assertIncludes(adminRotationJs, "cat !== 'admin_full_settings_backup'", 'Uplna zaloha nastaveni nesmi byt v bezne tabulce stroju');
  assertIncludes(adminRotationJs, "cat !== 'admin_settings_deleted'", 'Skryte rollback radky nesmi byt v bezne tabulce stroju');
  assertIncludes(stylesAdminPolishCss, '.adminAccountsStatusGrid', 'Sprava spravcu musi mit vlastni admin-only stavovy grid');
  assertIncludes(stylesAdminPolishCss, '.adminAccountsSafetyGrid', 'Sprava spravcu musi mit vlastni admin-only bezpecnostni grid');
  assertIncludes(stylesAdminPolishCss, '.adminAccountsRoleOverview', 'Sprava spravcu musi mit vlastni admin-only prehled roli');
  assertIncludes(stylesAdminPolishCss, '.adminAccountsReadonlyNotice', 'Sprava spravcu musi mit vlastni styl readonly vysvetleni');
  assertNotIncludes(adminUnlockJs, 'bottomNavMenuBtn', 'Admin odemceni uz nesmi byt skryte za klikáním na spodni menu Vice');
  assertNotIncludes(adminUnlockJs, 'tapCount', 'Admin odemceni uz nesmi pouzivat tajny pocet kliknuti');
  assertNotIncludes(adminUnlockJs, 'bindAdminSecretUnlock', 'Admin inicializace uz nesmi nest stary koncept tajneho odemceni');
  assertNotIncludes(adminUnlockJs, 'adminSecretBound', 'Admin inicializace uz nesmi pouzivat secret dataset flag');
  assertNotIncludes(ui, 'data-admin-secret', 'Kontakt ani menu uz nesmi obsahovat skryty admin trigger');
}

function assertAdminHandoverGuideContractV1142() {
  assertIncludes(ui, 'function getRakAdminExportMetadataSnapshot', 'Admin exporty musi umet sestavit jednotna metadata');
  assertIncludes(ui, 'function buildRakAdminExportMetadataLines', 'Admin exporty musi sdilet jednotnou hlavicku metadat');
  assertIncludes(ui, 'Vytvořil admin účet', 'Predavaci exporty musi obsahovat ucet, ktery je vytvoril');
  assertIncludes(ui, 'Role exportu', 'Predavaci exporty musi obsahovat roli admina pri vytvoreni');
  assertIncludes(ui, 'Admin odemčen', 'Predavaci exporty musi obsahovat stav admin odemceni');
  assertIncludes(ui, 'function buildAdminHandoverChecklistHtml', 'Admin uvod musi mit pruvodce pro predani spravy');
  assertIncludes(ui, 'function buildAdminHandoverRunbookHtml', 'Admin musi mit samostatny panel pro predani spravy');
  assertIncludes(ui, 'function adminHandoverMachineSettingsSnapshot', 'Predani spravy musi umet secist stav stroju a kalkulacek');
  assertIncludes(ui, 'function adminHandoverAdminSessionSnapshot', 'Predani spravy musi umet secist prihlasena admin zarizeni');
  assertIncludes(ui, 'function adminHandoverReportsSnapshot', 'Predani spravy musi umet secist reporty chyb');
  assertIncludes(ui, 'function adminHandoverAnnouncementSnapshot', 'Predani spravy musi umet zkontrolovat verejne oznameni na Dashboardu');
  assertIncludes(ui, 'function adminHandoverAppContactSnapshot', 'Predani spravy musi umet zkontrolovat verejny kontakt aplikace');
  assertIncludes(ui, 'function adminHandoverExternalLinksSnapshot', 'Predani spravy musi umet zkontrolovat verejne odkazy');
  assertIncludes(ui, 'function adminHandoverPayrollSnapshot', 'Predani spravy musi umet zkontrolovat vyplatu');
  assertIncludes(ui, 'function adminHandoverFullSettingsBackupSnapshot', 'Predani spravy musi umet zkontrolovat uplne zalohy nastaveni');
  assertIncludes(ui, 'function buildAdminMonthlyWorkflowHtml', 'Admin musi mit mesicni postup pro beznou spravu rozpisu');
  assertIncludes(ui, 'function adminMonthlyWorkflowItemHtml', 'Mesicni postup musi mit samostatne krokove polozky');
  assertIncludes(ui, 'function buildAdminNextStepsHtml', 'Admin uvod musi mit kratky prehled nejblizsich kroku');
  assertIncludes(ui, 'function adminNextStepItemHtml', 'Admin uvod musi vykreslovat jednotlive doporucene kroky');
  assertIncludes(ui, 'Co teď zkontrolovat', 'Admin uvod musi mit srozumitelny nadpis doporucenych kroku');
  assertIncludes(ui, 'function buildAdminHandoverExportsHtml', 'Admin uvod musi mit rychle predavaci exporty');
  assertIncludes(ui, 'adminHandoverExportStatus', 'Predavaci podklady musi ukazat mesic, zdroj a ze nic neukladaji');
  assertIncludes(ui, 'function buildAdminActionLegendHtml', 'Admin uvod musi mit legendu bezpecnosti tlacitek');
  assertIncludes(ui, "label: 'Import'", 'Legenda tlacitek musi jasne oznacit import jako prepis rozpisu');
  assertIncludes(ui, "label: 'Obnovit'", 'Legenda tlacitek musi jasne oznacit obnovu jako prepis aktualniho rozpisu');
  assertIncludes(ui, 'function buildAdminMonthlyWorkflowText', 'Mesicni postup musi mit textovy export pro predani');
  assertIncludes(ui, 'function downloadAdminMonthlyWorkflowText', 'Mesicni postup musi jit stahnout jako soubor');
  assertIncludes(ui, 'function buildAdminHandoverAuditHtml', 'Predani spravy musi mit rychlou provozni kontrolu');
  assertIncludes(ui, 'function adminHandoverAuditItemHtml', 'Provozni kontrola predani musi mit samostatne stavove polozky');
  assertIncludes(ui, 'function buildAdminHandoverReadinessSnapshot', 'Predani spravy musi mit souhrn pripravenosti z aktualniho stavu');
  assertIncludes(ui, 'function buildAdminHandoverReadinessHtml', 'Predani spravy musi umet vykreslit admin-only pripravenost');
  assertIncludes(ui, 'function buildAdminHandoverReadinessText', 'Predani spravy musi davat pripravenost i do textovych podkladu');
  assertIncludes(ui, 'function adminHandoverSyncReadinessSnapshot', 'Pripravenost predani musi hlidat stav online synchronizace');
  assertIncludes(ui, 'window.getSupabaseSyncStatus', 'Pripravenost predani musi cist existujici Supabase sync stav');
  assertNotIncludes(ui, 'const activeAdmins = adminHandoverActiveAdminCount();\n  return activeAdmins;', 'Pocet spravcu v pripravenosti predani nesmi volat sam sebe');
  assertIncludes(ui, 'function buildAdminHandoverTodoHtml', 'Predani spravy musi mit kratky seznam toho co jeste vyresit');
  assertIncludes(ui, 'function buildAdminHandoverTodoText', 'Seznam ukolu pred predanim musi byt i v textovych podkladech');
  assertIncludes(ui, 'function downloadAdminHandoverTodoText', 'Seznam ukolu pred predanim musi jit stahnout samostatne');
  assertIncludes(ui, 'function adminHandoverReadinessActionForTitle', 'Ukoly pred predanim musi umet vest do spravne admin sekce');
  assertIncludes(ui, "return { action: 'open-machines', label: 'Stroje' };", 'Ukol Stroje v predani musi otevrit primo nastaveni stroju');
  assertIncludes(ui, "return { action: 'open-reports', label: 'Reporty' };", 'Ukol Reporty chyb v predani musi otevrit primo reporty');
  assertIncludes(ui, "return { action: 'open-announcement', label: 'Oznámení' };", 'Ukol Oznameni Dashboard v predani musi otevrit primo oznameni');
  assertIncludes(ui, "return { action: 'open-app-contact', label: 'Kontakt' };", 'Ukol Kontakt v predani musi otevrit kontakt aplikace');
  assertIncludes(ui, "return { action: 'open-external-links', label: 'Odkazy' };", 'Ukol Odkazy v predani musi otevrit verejne odkazy');
  assertIncludes(ui, "return { action: 'open-payroll-settings', label: 'Výplata' };", 'Ukol Vyplata v predani musi otevrit nastaveni vyplaty');
  assertIncludes(ui, "return { action: 'open-settings-backups', label: 'Zálohy nastavení' };", 'Ukol Zalohy nastaveni v predani musi otevrit uplne zalohy nastaveni');
  assertIncludes(ui, 'function buildAdminHandoverStatusText', 'Predani spravy musi mit textovy export aktualniho stavu');
  assertIncludes(ui, 'function downloadAdminHandoverStatusText', 'Predani spravy musi jit stahnout jako textovy souhrn');
  assertIncludes(ui, 'function buildAdminHandoverPackageText', 'Predani spravy musi mit souhrnny textovy balicek');
  assertIncludes(ui, 'function downloadAdminHandoverPackageText', 'Predani spravy musi umet stahnout souhrnny balicek');
  assertIncludes(ui, "buildRakAdminExportMetadataLines('RaK - Ukoly pred predanim'", 'Export ukolu pred predanim musi mit jednotna admin metadata');
  assertIncludes(ui, "buildRakAdminExportMetadataLines('RaK - Pripravenost predani'", 'Export pripravenosti predani musi mit jednotna admin metadata');
  assertIncludes(ui, "buildRakAdminExportMetadataLines('RaK - Stav předání správy'", 'Export stavu predani musi mit jednotna admin metadata');
  assertIncludes(ui, "buildRakAdminExportMetadataLines('RaK - Balicek predani spravy'", 'Balicek predani musi mit jednotna admin metadata');
  assertIncludes(ui, "buildRakAdminExportMetadataLines('RaK - Měsíční postup správy'", 'Mesicni postup musi mit jednotna admin metadata');
  assertIncludes(ui, "buildRakAdminExportMetadataLines('RaK - Kde co upravit'", 'Mapa nastaveni musi mit jednotna admin metadata');
  assertIncludes(ui, "buildRakAdminExportMetadataLines('RaK - Příručka správce'", 'Prirucka spravce musi mit jednotna admin metadata');
  assertIncludes(ui, 'buildAdminAccessRulesText().trim()', 'Stav i balicek predani musi obsahovat pristupova pravidla bez hesel');
  assertIncludes(ui, "cat !== 'admin_full_settings_backup'", 'Predani stroju nesmi pocitat technicke radky uplnych zaloh jako stroje');
  assertIncludes(ui, "key.indexOf('ADMIN_FULL_SETTINGS_BACKUP_') !== 0", 'Predani stroju nesmi pocitat radky uplnych zaloh podle machine_key');
  assertIncludes(ui, "'- Prihlasena admin zarizeni: '", 'Predavaci pravidla musi obsahovat pocet prihlasenych admin zarizeni');
  assertIncludes(ui, "'- Reporty chyb pred predanim: '", 'Predavaci pravidla musi obsahovat stav reportu chyb');
  assertIncludes(ui, "'- Oznameni Dashboard pred predanim: '", 'Predavaci pravidla musi obsahovat stav oznameni Dashboard');
  assertIncludes(ui, "'- Stroje a kalkulacky pred predanim: '", 'Predavaci pravidla musi obsahovat stav stroju a kalkulacek');
  assertIncludes(ui, "'- Kontakt aplikace pred predanim: '", 'Predavaci pravidla musi obsahovat stav kontaktu aplikace');
  assertIncludes(ui, "'- Verejne odkazy pred predanim: '", 'Predavaci pravidla musi obsahovat stav verejnych odkazu');
  assertIncludes(ui, "'- Vyplata pred predanim: '", 'Predavaci pravidla musi obsahovat stav vyplaty');
  assertIncludes(ui, "'- Uplne zalohy nastaveni pred predanim: '", 'Predavaci pravidla musi obsahovat stav uplnych zaloh nastaveni');
  assertIncludes(ui, 'function adminPermissionStatusSnapshot', 'Admin musi umet sestavit stav aktivniho uctu a opravneni');
  assertIncludes(ui, 'function buildAdminPermissionStatusHtml', 'Admin uvod musi ukazovat stav opravneni spravce');
  assertIncludes(ui, 'function buildAdminAccessRulesHtml', 'Admin musi mit predavaci prehled kdo smi co menit');
  assertIncludes(ui, 'function buildAdminAccessRulesText', 'Predavaci texty musi mit samostatny prehled pristupu a hesel');
  assertIncludes(ui, 'Predavaci exporty nestahuji hesla', 'Predavaci texty musi jasne rikat, ze neobsahuji admin hesla');
  assertIncludes(ui, 'Hesla se nastavuji jen v administraci / Spravci', 'Predavaci texty musi vest nastaveni hesel do admin sekce Spravci');
  assertIncludes(ui, 'function adminAccessRuleItemHtml', 'Prehled pristupu musi mit samostatne polozky roli');
  assertIncludes(ui, 'function buildAdminPostSaveCheckHtml', 'Admin musi mit kontrolu po ulozeni');
  assertIncludes(ui, 'function getAdminPostSaveCheckItems', 'Kontrola po ulozeni musi mit spolecny zdroj pro UI i text');
  assertIncludes(ui, 'function buildAdminPostSaveCheckText', 'Kontrola po ulozeni musi byt soucasti predavacich textu');
  assertIncludes(ui, 'function buildAdminRotationBackupStatusHtml', 'Zalohy rozpisu musi mit admin-only souhrn stavu');
  assertIncludes(ui, 'function adminRotationBackupStatusItemHtml', 'Souhrn zaloh musi mit samostatne stavove polozky');
  assertIncludes(ui, '<details class="appMenuFoldSection adminRotationBackupStatus">', 'Stav zaloh rozpisu musi byt sbalitelny (details/summary), ne pevny box');
  assertNotIncludes(ui, 'function buildAdminRotationBackupSafetyHtml', 'Bezpecnost obnovy zaloh rozpisu byla na zadost odstranena (zustava jen u Zaloh nastaveni)');
  assertNotIncludes(ui, 'adminFullSettingsBackupSafety', 'Bezpecnost obnovy zaloh nastaveni byla na zadost odstranena, trida uz nema existovat');
  assertIncludes(ui, 'adminRotationBackupMonthGroup', 'Zalohy rozpisu musi byt sbalitelne po mesicich');
  assertIncludes(ui, 'class="adminRotationBackupsLabelCol"', 'Sloupec Zaloha u zaloh rozpisu musi mit vlastni uzsi sirku');
  assertIncludes(ui, 'class="adminRotationBackupsActionCol"', 'Sloupec Akce u zaloh rozpisu musi mit vlastni uzsi sirku');
  assertIncludes(stylesAdminPolishCss, '.adminRotationBackupsLabelCol{width:17px;}', 'Sloupec Zaloha musi byt o dalsich 50% uzsi nez predchozich 34px');
  assertIncludes(stylesAdminPolishCss, '.adminRotationBackupsActionCol{width:18px;}', 'Sloupec Akce musi byt o dalsich 50% uzsi nez predchozich 35px');
  assertIncludes(ui, 'function buildAdminManualHtml', 'Admin musi mit samostatnou prirucku spravce');
  assertIncludes(ui, 'function adminManualSectionHtml', 'Prirucka spravce musi mit rozbalovaci postupy');
  assertIncludes(ui, 'function buildAdminSettingsMapHtml', 'Admin musi mit mapu kde co upravit');
  assertIncludes(ui, 'function getAdminSettingsMapItems', 'Mapa nastaveni musi mit spolecny zdroj pro UI i textovy export');
  assertIncludes(ui, 'function adminSettingsMapItemHtml', 'Mapa nastaveni musi mit samostatne polozky');
  assertIncludes(ui, 'function buildAdminSettingsMapStatusHtml', 'Mapa nastaveni musi mit horní souhrn pokryti a bezpecnosti');
  assertIncludes(ui, 'function adminSettingsMapStatusItemHtml', 'Souhrn mapy nastaveni musi mit samostatne stavove polozky');
  assertIncludes(ui, 'function adminSettingsMapItemHasPublicImpact', 'Mapa nastaveni musi jednotne poznat verejny dopad zmen');
  assertIncludes(ui, 'function buildAdminSettingsMapImpactHtml', 'Mapa nastaveni musi mit admin-only prehled verejneho dopadu');
  assertIncludes(ui, 'function adminSettingsMapImpactItemHtml', 'Prehled verejneho dopadu musi mit samostatne polozky');
  assertIncludes(ui, 'function buildAdminSettingsMapText', 'Mapa nastaveni musi mit textovy export pro predani');
  assertIncludes(ui, 'function downloadAdminSettingsMapText', 'Mapa nastaveni musi jit stahnout jako soubor');
  assertIncludes(ui, 'function buildAdminManualText', 'Prirucka spravce musi mit textovy export pro predani');
  assertIncludes(ui, 'function downloadAdminManualText', 'Prirucka spravce musi jit stahnout jako soubor');
  assertIncludes(ui, 'function adminGuideHasMonthRows', 'Pruvodce musi umet poznat, jestli ma vybrany mesic rozpis');
  assertIncludes(ui, 'function adminGuideUpcomingVacationCount', 'Pruvodce musi ukazovat stav dovolene a odstavek');
  assertIncludes(ui, 'function adminGuideOvertimeCount', 'Pruvodce musi ukazovat stav prescasu');
  assertIncludes(ui, 'adminGuideBox', 'Admin uvod musi vykreslovat box pruvodce');
  [
    'open-service',
    'open-food',
    'open-overtime',
    'open-vacation',
    'open-rotation',
    'open-monthly-workflow',
    'open-backups',
    'open-export',
    'open-admin-accounts'
  ].forEach((action) => {
    assertIncludes(ui, "'" + action + "'", 'Pruvodce musi obsahovat akci ' + action);
    assertIncludes(ui, "adminAction === '" + action + "'", 'Admin menu musi umet obslouzit akci ' + action);
  });
  assertIncludes(ui, 'rakAdminCanManageAdmins()', 'Polozka Spravci v pruvodci smi byt jen pro owner admina');
  assertIncludes(ui, 'data-admin-action="download-admin-manual"', 'Prirucka spravce musi mit tlacitko Stahnout prirucku');
  assertIncludes(ui, 'data-admin-action="download-monthly-workflow"', 'Mesicni postup musi mit tlacitko Stahnout postup');
  assertIncludes(ui, 'data-admin-action="download-handover-status"', 'Predani spravy musi mit tlacitko Stahnout stav');
  assertIncludes(ui, 'data-admin-action="download-handover-todo"', 'Predani spravy musi mit tlacitko Stahnout ukoly');
  assertIncludes(ui, 'data-admin-action="download-handover-package"', 'Predani spravy musi mit tlacitko Stahnout balicek');
  assertIncludes(ui, "{ action: 'download-handover-status', label: 'Stav' }", 'Rychle predavaci podklady na admin uvodu musi obsahovat Stav');
  assertIncludes(ui, 'data-admin-action="download-settings-map"', 'Mapa nastaveni musi mit tlacitko Stahnout mapu');
  assertIncludes(ui, "adminAction === 'open-handover'", 'Admin menu musi umet otevrit panel Predani spravy');
  assertIncludes(ui, "adminAction === 'open-monthly-workflow'", 'Admin menu musi umet otevrit mesicni postup');
  assertIncludes(ui, "adminAction === 'open-admin-manual'", 'Admin menu musi umet otevrit prirucku spravce');
  assertIncludes(ui, "adminAction === 'open-settings-map'", 'Admin menu musi umet otevrit mapu nastaveni');
  assertIncludes(ui, "adminAction === 'download-admin-manual'", 'Admin menu musi umet stahnout prirucku spravce');
  assertIncludes(ui, "adminAction === 'download-monthly-workflow'", 'Admin menu musi umet stahnout mesicni postup');
  assertIncludes(ui, "adminAction === 'download-handover-status'", 'Admin menu musi umet stahnout stav predani');
  assertIncludes(ui, "adminAction === 'download-handover-todo'", 'Admin menu musi umet stahnout ukoly pred predanim');
  assertIncludes(ui, "adminAction === 'download-handover-package'", 'Admin menu musi umet stahnout balicek predani');
  assertIncludes(ui, "adminAction === 'download-settings-map'", 'Admin menu musi umet stahnout mapu nastaveni');
  assertIncludes(ui, "'admin-handover'", 'Predani spravy musi byt mezi chranenymi admin view');
  assertIncludes(ui, "'admin-monthly-workflow'", 'Mesicni postup musi byt mezi chranenymi admin view');
  assertIncludes(ui, "'admin-manual'", 'Prirucka spravce musi byt mezi chranenymi admin view');
  assertIncludes(ui, "'admin-settings-map'", 'Mapa nastaveni musi byt mezi chranenymi admin view');
  assertIncludes(ui, 'Kontrola předání', 'Predani spravy musi ukazat rychlou kontrolu pro noveho spravce');
  assertIncludes(ui, 'Oprávnění správce', 'Admin musi mit viditelnou kontrolu opravneni spravce');
  assertIncludes(ui, 'Kdo smí co měnit', 'Admin musi jasne ukazat role hlavni admin dalsi spravce a bezny ucet');
  assertIncludes(ui, 'Pravidlo běžného účtu', 'Textovy stav predani musi obsahovat pravidlo bezneho uctu');
  assertIncludes(ui, 'Připravenost předání', 'Admin musi mit celkovy stav pripravenosti predani');
  assertIncludes(ui, 'Pripravenost predani', 'Textovy export predani musi obsahovat pripravenost predani');
  assertIncludes(ui, 'Synchronizace', 'Pripravenost predani musi ukazovat stav synchronizace a offline fronty');
  assertIncludes(ui, 'Co ještě vyřešit před předáním', 'Admin musi mit kratky seznam nejblizsich ukolu podle pripravenosti');
  assertIncludes(ui, 'Co jeste vyresit pred predanim', 'Textovy balicek musi obsahovat seznam ukolu pred predanim');
  assertIncludes(ui, 'RaK_ukoly_pred_predanim_', 'Samostatny export ukolu pred predanim musi mit jasny nazev souboru');
  assertIncludes(ui, 'Kontrola po uložení', 'Admin musi mit jasny postup kontroly po ulozeni');
  assertIncludes(ui, 'Zelená synchronizace', 'Kontrola po ulozeni musi pripominat zelenou synchronizaci');
  assertIncludes(ui, 'buildAdminPostSaveCheckText()', 'Predavaci balicek musi obsahovat kontrolu po ulozeni');
  assertIncludes(ui, 'Stav záloh', 'Panel zaloh musi ukazovat rychly stav zaloh');
  assertIncludes(ui, 'Před obnovou se současný stav uloží jako další záloha.', 'Panel zaloh musi vysvetlit bezpecnost obnovy');
  assertIncludes(ui, 'Aktivní admin účet', 'Textovy stav predani musi obsahovat aktivni admin ucet');
  assertIncludes(ui, 'Admin odemčen', 'Textovy stav predani musi obsahovat informaci, jestli je admin odemceny');
  assertIncludes(ui, "'- Stroje a kalkulačky: ' + machineSettingsSnapshot.label", 'Textovy stav predani musi obsahovat stroje a kalkulacky');
  assertIncludes(ui, "title: 'Stroje / kalkulačky'", 'Predani spravy musi mit viditelnou polozku stroju a kalkulacek');
  assertIncludes(ui, "'- Admin zařízení: ' + adminSessions.label", 'Textovy stav predani musi obsahovat admin zarizeni');
  assertIncludes(ui, "title: 'Admin zařízení'", 'Predani spravy musi mit viditelnou polozku admin zarizeni');
  assertIncludes(ui, "'- Reporty chyb: ' + reportsSnapshot.label", 'Textovy stav predani musi obsahovat reporty chyb');
  assertIncludes(ui, "title: 'Reporty chyb'", 'Predani spravy musi mit viditelnou polozku reportu chyb');
  assertIncludes(ui, "'- Oznámení Dashboard: ' + announcementSnapshot.label", 'Textovy stav predani musi obsahovat oznameni Dashboard');
  assertIncludes(ui, "title: 'Oznámení Dashboard'", 'Predani spravy musi mit viditelnou polozku oznameni Dashboard');
  assertIncludes(ui, "'- Kontakt aplikace: ' + contactSnapshot.label", 'Textovy stav predani musi obsahovat kontakt aplikace');
  assertIncludes(ui, "title: 'Kontakt'", 'Predani spravy musi mit viditelnou polozku kontaktu aplikace');
  assertIncludes(ui, "'- Veřejné odkazy: ' + linksSnapshot.label", 'Textovy stav predani musi obsahovat verejne odkazy');
  assertIncludes(ui, "title: 'Odkazy'", 'Predani spravy musi mit viditelnou polozku verejnych odkazu');
  assertIncludes(ui, "'- Výplata: ' + payrollSnapshot.label", 'Textovy stav predani musi obsahovat vyplatu');
  assertIncludes(ui, "'- Úplné zálohy nastavení: ' + fullSettingsBackupSnapshot.label", 'Textovy stav predani musi obsahovat uplne zalohy nastaveni');
  assertIncludes(ui, "title: 'Výplata'", 'Predani spravy musi mit viditelnou polozku vyplaty');
  assertIncludes(ui, 'Měsíční postup', 'Mesicni postup musi byt pojmenovany srozumitelne pro noveho spravce');
  assertIncludes(ui, 'Panel nic sám neukládá', 'Mesicni postup nesmi pusobit jako automaticka zmena dat');
  assertIncludes(ui, 'Tohle nic samo nemění', 'Kontrola predani nesmi pusobit jako automaticka zmena dat');
  assertIncludes(ui, 'Všechny akce otevírají jen administraci', 'Prirucka spravce musi jasne rikat, ze sama nic neuklada');
  assertIncludes(ui, 'RaK_prirucka_spravce_', 'Textovy export prirucky musi mit jasny nazev souboru');
  assertIncludes(ui, 'RaK_mesicni_postup_', 'Textovy export mesicniho postupu musi mit jasny nazev souboru');
  assertIncludes(ui, 'RaK_stav_predani_', 'Textovy export stavu predani musi mit jasny nazev souboru');
  assertIncludes(ui, 'RaK_balicek_predani_', 'Textovy export balicku predani musi mit jasny nazev souboru');
  assertIncludes(ui, 'RaK_kde_co_upravit_', 'Textovy export mapy nastaveni musi mit jasny nazev souboru');
  assertIncludes(ui, 'Kde co upravit', 'Mapa nastaveni musi byt pojmenovana srozumitelne pro spravce');
  assertIncludes(ui, "title: 'Stroje a kalkulačky'", 'Mapa nastaveni musi mit samostatnou oblast pro stroje a kalkulacky');
  assertIncludes(ui, "{ action: 'open-machines', label: 'Stroje' }", 'Mapa nastaveni musi mit rychlou akci Stroje');
  assertIncludes(ui, "title: 'Oznámení, odkazy, kontakt a výplata'", 'Mapa nastaveni musi zahrnovat oznameni Dashboard mezi verejne texty');
  assertIncludes(ui, "{ action: 'open-announcement', label: 'Oznámení' }", 'Mapa nastaveni musi mit rychlou akci Oznameni');
  assertIncludes(ui, 'Stav mapy nastaveni', 'Mapa nastaveni musi nahore vysvetlit, ze jde o rozcestnik');
  assertIncludes(ui, 'Veřejný dopad změn', 'Mapa nastaveni musi jasne oddelit verejny dopad od admin-only casti');
  assertIncludes(ui, 'buildAdminSettingsMapImpactHtml(items)', 'Prehled verejneho dopadu musi byt vlozeny primo do mapy nastaveni');
  assertIncludes(ui, 'Po ulozeni over', 'Mapa nastaveni musi u kazde oblasti rikat co overit po ulozeni');
  assertIncludes(ui, "title: 'Admin zařízení'", 'Mapa a pruvodce musi owner adminovi ukazat prihlasena admin zarizeni');
  assertIncludes(ui, "scope: 'Správci / přihlášená zařízení'", 'Mapa nastaveni musi mit samostatnou oblast pro prihlasena admin zarizeni');
  assertIncludes(ui, 'odhlásí ta, která už nemají mít přístup', 'Pruvodce predanim musi pripominat odhlaseni nepotrebnych admin zarizeni');
  assertIncludes(ui, "{ action: 'open-settings-backups', label: 'Zálohy nastavení' }", 'Prirucka zaloh musi vest i na uplne zalohy nastaveni');
  assertIncludes(ui, "{ action: 'open-reports', label: 'Reporty' }", 'Mapa nastaveni musi mit rychlou akci Reporty');
  assertIncludes(ui, 'const checkCount = list.filter', 'Souhrn mapy nastaveni musi hlidat vyplnene kontroly po ulozeni');
  assertIncludes(ui, 'Kazda oblast ma rikat, co overit po ulozeni.', 'Stav mapy musi vysvetlovat pokryti kontrol po ulozeni');
  assertIncludes(ui, 'Dopad: ', 'Textovy export mapy musi u kazde oblasti uvadet dopad zmen');
  assertIncludes(ui, "lines.push('- Po ulozeni over: '", 'Textovy export mapy musi obsahovat kontrolu po ulozeni u kazde oblasti');
  assertIncludes(ui, 'Tlacitka jen oteviraji admin sekce, sama nic neukladaji.', 'Mapa nastaveni nesmi pusobit jako ulozeni zmen');
  assertIncludes(stylesAdminPolishCss, '.adminGuideItem', 'Pruvodce musi mit vlastni admin-only styl polozek');
  assertIncludes(stylesAdminPolishCss, '.adminGuideAction', 'Pruvodce musi mit vlastni styl akcnich tlacitek');
  assertIncludes(stylesAdminPolishCss, '.adminMenuSection', 'Admin rozcestnik musi mit vlastni styl zabalitelnych sekci');
  assertIncludes(stylesAdminPolishCss, '.adminMenuActionGrid', 'Admin rozcestnik musi mit prehlednou mrizku akci');
  assertIncludes(stylesAdminPolishCss, '.adminNextSteps', 'Admin rozcestnik musi mit vlastni styl doporucenych kroku');
  assertIncludes(stylesAdminPolishCss, '.adminNextStepItem', 'Doporucene kroky v admin uvodu musi mit stabilni rozvrzeni');
  assertIncludes(stylesAdminPolishCss, '.adminHandoverExports', 'Admin rozcestnik musi mit vlastni styl rychlych predavacich exportu');
  assertIncludes(stylesAdminPolishCss, '.adminHandoverExportGrid', 'Predavaci exporty musi mit stabilni responsive mrizku');
  assertIncludes(stylesAdminPolishCss, '.adminHandoverExportGrid{\n  display:grid !important;\n  grid-template-columns:repeat(3,minmax(0,1fr)) !important;', 'Predavaci exporty maji na desktopu vychazet do dvou vyrovnanych rad po trech tlacitkach');
  assertIncludes(stylesAdminPolishCss, '.adminHandoverExportStatus', 'Predavaci exporty musi mit citelny stavovy radek');
  assertIncludes(stylesAdminPolishCss, '.adminActionLegend', 'Admin rozcestnik musi mit vlastni styl legendy tlacitek');
  assertIncludes(stylesAdminPolishCss, '.adminActionLegendItem.isSave', 'Legenda musi vizualne odlisit tlacitka, ktera ukladaji data');
  assertIncludes(stylesAdminPolishCss, '.adminActionLegendItem.isImport', 'Legenda musi vizualne odlisit import rozpisu');
  assertIncludes(stylesAdminPolishCss, '.adminActionLegendItem.isRestore', 'Legenda musi vizualne odlisit obnovu zalohy');
  assertIncludes(stylesAdminPolishCss, '.adminHandoverAuditGrid', 'Predani spravy musi mit prehlednou mrizku provozni kontroly');
  assertIncludes(stylesAdminPolishCss, '.adminHandoverAuditItem.isWarn', 'Predani spravy musi vizualne odlisit polozky ke kontrole');
  assertIncludes(stylesAdminPolishCss, '.adminHandoverReadinessGrid', 'Pripravenost predani musi mit vlastni responsive mrizku');
  assertIncludes(stylesAdminPolishCss, '.adminHandoverReadinessSummary.isWarn', 'Pripravenost predani musi vizualne odlisit varovani');
  assertIncludes(stylesAdminPolishCss, '.adminHandoverTodoItem.isWarn', 'Ukoly pred predanim musi vizualne odlisit varovani');
  assertIncludes(stylesAdminPolishCss, '.adminHandoverTodoAction', 'Ukoly pred predanim musi mit kompaktni admin akce');
  assertIncludes(stylesAdminPolishCss, '.adminPermissionStatus', 'Stav opravneni musi mit vlastni admin-only styl');
  assertIncludes(stylesAdminPolishCss, '.adminPermissionStatusGrid', 'Stav opravneni musi mit prehlednou mrizku');
  assertIncludes(stylesAdminPolishCss, '.adminAccessRulesGrid', 'Prehled pristupu musi mit vlastni responsive mrizku');
  assertIncludes(stylesAdminPolishCss, '.adminAccessRuleItem.isUser', 'Prehled pristupu musi vizualne odlisit bezny ucet bez admin prav');
  assertIncludes(stylesAdminPolishCss, '.adminPostSaveCheckList', 'Kontrola po ulozeni musi mit vlastni seznam');
  assertIncludes(stylesAdminPolishCss, '.adminPostSaveCheckAction', 'Kontrola po ulozeni musi mit kompaktni admin akce');
  assertIncludes(stylesAdminPolishCss, '.adminRotationBackupStatus', 'Souhrn zaloh musi mit vlastni admin-only styl');
  assertIncludes(stylesAdminPolishCss, '.adminRotationBackupStatusGrid', 'Souhrn zaloh musi mit prehlednou mrizku');
  assertNotIncludes(stylesAdminPolishCss, '.adminRotationBackupSafetyGrid', 'Bezpecnost obnovy zaloh byla odstranena (rozpisu i nastaveni), admin styl uz nema existovat');
  assertIncludes(stylesAdminPolishCss, '.adminHandoverRunbook', 'Predani spravy musi mit vlastni admin-only runbook styl');
  assertIncludes(stylesAdminPolishCss, '.adminHandoverActionRow', 'Predani spravy musi mit kompaktni radek akci');
  assertIncludes(stylesAdminPolishCss, '.adminMonthlyWorkflow', 'Mesicni postup musi mit vlastni admin-only styl');
  assertIncludes(stylesAdminPolishCss, '.adminMonthlyWorkflowItem', 'Mesicni postup musi mit vlastni styl kroku');
  assertIncludes(stylesAdminPolishCss, '.adminMonthlyWorkflowAction', 'Mesicni postup musi mit kompaktni akce');
  assertIncludes(stylesAdminPolishCss, '.adminManualSection', 'Prirucka spravce musi mit vlastni admin-only styl sekci');
  assertIncludes(stylesAdminPolishCss, '.adminManualActionRow', 'Prirucka spravce musi mit kompaktni mrizku akci');
  assertIncludes(stylesAdminPolishCss, '.adminSettingsMapGrid', 'Mapa nastaveni musi mit vlastni admin-only mrizku');
  assertIncludes(stylesAdminPolishCss, '.adminSettingsMapStatusGrid', 'Souhrn mapy nastaveni musi mit vlastni responsive mrizku');
  assertIncludes(stylesAdminPolishCss, '.adminSettingsMapImpactGrid', 'Prehled verejneho dopadu musi mit vlastni responsive mrizku');
  assertIncludes(stylesAdminPolishCss, '.adminSettingsMapImpactItem.isPublic', 'Prehled verejneho dopadu musi vizualne odlisit verejne polozky');
  assertIncludes(stylesAdminPolishCss, '.adminSettingsMapImpactItem.isAdminOnly', 'Prehled verejneho dopadu musi vizualne odlisit admin-only polozky');
  assertIncludes(stylesAdminPolishCss, '.adminSettingsMapCheck', 'Mapa nastaveni musi mit vlastni styl pro kontrolu po ulozeni');
  assertIncludes(stylesAdminPolishCss, '.adminSettingsMapActions', 'Mapa nastaveni musi mit kompaktni akce');
}

function assertAdminGeneratorSettingsContractV1143() {
  assertIncludes(ui, "const ADMIN_ROTATION_GENERATOR_SETTINGS_KEY = 'ROTATION_GENERATOR_SETTINGS'", 'Pravidla generatoru musi mit vlastni machine_settings klic');
  assertIncludes(ui, "const ADMIN_ROTATION_GENERATOR_SETTINGS_CATEGORY = 'rotation_generator_settings'", 'Pravidla generatoru musi mit vlastni kategorii nastaveni');
  assertIncludes(ui, 'function getAdminRotationGeneratorRules', 'Generator musi cist pravidla pres adminovatelny getter');
  assertIncludes(ui, 'function buildAdminRotationGeneratorStatusHtml', 'Pravidla generatoru musi mit admin-only stavovy souhrn');
  assertIncludes(ui, 'function buildAdminRotationGeneratorImpactHtml', 'Pravidla generatoru musi mit admin-only souhrn dopadu');
  assertIncludes(ui, 'Dopad pravidel', 'Pravidla generatoru musi spravci vysvetlit, co zmena ovlivni');
  assertIncludes(ui, 'Už uložený rozpis se nezmění', 'Pravidla generatoru musi rikat, ze hotovy rozpis se sam neprepise');
  assertIncludes(ui, 'function adminRotationRefreshGeneratorSettingsStatus', 'Pravidla generatoru musi umet prepocitat stav pred ulozenim');
  assertIncludes(ui, 'function readAdminRotationGeneratorDraftFromDom', 'Pravidla generatoru musi umet zkontrolovat rozepsany formular');
  assertIncludes(ui, 'function buildAdminRotationGeneratorSettingsHtml', 'Administrace musi mit formular pravidel generatoru');
  assertIncludes(ui, 'function readAdminRotationGeneratorSettingsFromDom', 'Administrace musi umet nacist pravidla generatoru z formulare');
  assertIncludes(ui, 'function mergeAdminRotationGeneratorSettingsRows', 'Pravidla generatoru se musi ukladat do machine_settings bez mazani ostatnich nastaveni');
  assertIncludes(ui, "action: 'open-generator-settings', label: 'Pravidla generátoru'", 'Admin menu musi obsahovat sekci Pravidla generatoru');
  assertIncludes(ui, "adminAction === 'open-generator-settings'", 'Admin menu musi umet otevrit pravidla generatoru');
  assertIncludes(ui, "adminAction === 'save-generator-settings'", 'Admin menu musi umet ulozit pravidla generatoru');
  assertIncludes(ui, "adminAction === 'load-generator-settings'", 'Admin menu musi umet nacist pravidla generatoru online');
  assertIncludes(ui, 'adminRotationRefreshGeneratorSettingsStatus(body)', 'Zmeny v pravidlech generatoru musi hned prepocitat stav');
  assertIncludes(ui, "'admin-generator-settings'", 'Pravidla generatoru musi byt mezi chranenymi admin view');
  assertIncludes(ui, 'app.machineSettingsRows.filter(rakAdminIsAccountsSettingsRow)', 'Ulozeni stroju nesmi smazat spravce');
  assertIncludes(ui, 'app.machineSettingsRows.filter(adminIsRotationGeneratorSettingsRow)', 'Ulozeni stroju nesmi smazat pravidla generatoru');
  assertIncludes(bridge, "category === 'rotation_generator_settings'", 'Supabase compatibility save musi povolit pravidla generatoru');
  assertIncludes(bridge, "key === 'ROTATION_GENERATOR_SETTINGS'", 'Supabase compatibility save musi povolit klic pravidel generatoru');
  assertIncludes(bridge, "category === 'rotation_overtime_settings'", 'Supabase compatibility save musi povolit prescasy rozpisu');
  assertIncludes(ui, 'const generatorRules = getAdminRotationGeneratorRules();', 'Generator musi pri behu pouzivat ulozena pravidla');
  assertIncludes(stylesAdminPolishCss, '.adminGeneratorSettingsStatusGrid', 'Stav pravidel generatoru musi mit vlastni responsive admin styl');
  assertIncludes(stylesAdminPolishCss, '.adminGeneratorImpactGrid', 'Dopad pravidel generatoru musi mit vlastni responsive admin styl');
  assertNotIncludes(ui, 'RAK_ROTATION_GENERATOR_RULES_V1107.hardCycle', 'Generator uz nema cist tvrdotovy cyklus primo z konstanty');
  assertNotIncludes(ui, 'RAK_ROTATION_GENERATOR_RULES_V1107.softCore.filter', 'Generator uz nema cist softCore primo z konstanty');
}

function assertAdminExternalLinksSettingsContractV1144() {
  assertIncludes(ui, "const RAK_EXTERNAL_LINKS_SETTINGS_KEY = 'EXTERNAL_LINKS_SETTINGS'", 'Externi odkazy musi mit vlastni machine_settings klic');
  assertIncludes(ui, "const RAK_EXTERNAL_LINKS_SETTINGS_CATEGORY = 'external_links_settings'", 'Externi odkazy musi mit vlastni kategorii nastaveni');
  assertIncludes(ui, "const CALENDAR_EMBED_URL = 'https://calendar.google.com/calendar/embed?", 'Kalendář musi mit vychozi adminovatelny embed odkaz');
  assertIncludes(ui, 'function getRakExternalLinksSettings', 'Verejne odkazy musi cist ulozene admin nastaveni');
  assertIncludes(ui, 'function getRakExternalLinkUrl', 'Klikaci akce musi umet nacist URL z admin nastaveni');
  assertIncludes(ui, 'function buildAdminExternalLinksSettingsHtml', 'Administrace musi mit formular externich odkazu');
  assertNotIncludes(ui, 'function buildAdminExternalLinksStatusHtml', 'Stav externich odkazu byl na zadost odstranen z admin obrazovky');
  assertNotIncludes(ui, 'function buildAdminExternalLinksPublicCheckHtml', 'Verejna kontrola odkazu byla na zadost odstranena z admin obrazovky');
  assertIncludes(ui, 'function readAdminExternalLinksSettingsFromDom', 'Administrace musi umet nacist externi odkazy z formulare');
  assertIncludes(ui, 'function mergeRakExternalLinksSettingsRows', 'Externi odkazy se musi ukladat do machine_settings bez mazani ostatnich nastaveni');
  assertNotIncludes(stylesAdminPolishCss, '.adminExternalLinksStatusGrid', 'Stav externich odkazu byl odstranen, admin styl uz nema existovat');
  assertNotIncludes(stylesAdminPolishCss, '.adminExternalLinksPublicCheckGrid', 'Verejna kontrola odkazu byla odstranena, admin styl uz nema existovat');
  assertIncludes(ui, "action: 'open-external-links', label: 'Odkazy'", 'Admin menu musi obsahovat sekci Odkazy');
  assertIncludes(ui, "adminAction === 'open-external-links'", 'Admin menu musi umet otevrit odkazy');
  assertIncludes(ui, "adminAction === 'save-external-links'", 'Admin menu musi umet ulozit odkazy');
  assertIncludes(ui, "adminAction === 'load-external-links'", 'Admin menu musi umet nacist odkazy online');
  assertIncludes(ui, "'admin-external-links'", 'Odkazy musi byt mezi chranenymi admin view');
  assertIncludes(ui, "calendar: Object.freeze({ key: 'calendar'", 'Externi odkazy musi obsahovat Kalendář');
  assertIncludes(ui, "'calendar.google.com'", 'Bezpecna allowlist musi povolit Google kalendar');
  assertIncludes(ui, "['food', 'eportal', 'payroll', 'calendar']", 'Admin formular odkazu musi zobrazit i Kalendář');
  assertIncludes(ui, "openExternalTile(typeof getRakExternalLinkUrl === 'function' ? getRakExternalLinkUrl('food')", 'Jidelni listek musi otevirat adminovatelny odkaz');
  assertIncludes(ui, "return openExternalTile(getRakExternalLinkUrl('eportal')", 'Eportal musi otevirat adminovatelny odkaz');
  assertIncludes(ui, "return openExternalTile(getRakExternalLinkUrl('payroll')", 'Vyplata musi otevirat adminovatelny odkaz');
  assertIncludes(ui, "getRakExternalLinkUrl('calendar')", 'Kalendář modal musi pouzivat adminovatelny odkaz');
  assertIncludes(ui, 'calendarModalFrame', 'Kalendář iframe musi bezpecne prepisovat src modalniho okna');
  assertNotIncludes(ui, 'src="https://calendar.google.com/calendar/embed?height=900', 'Kalendář iframe nesmi mit natvrdo src v HTML');
  assertIncludes(ui, 'function syncDashboardExternalLinks', 'Dashboard musi synchronizovat skutecne href odkazu podle admin nastaveni');
  assertIncludes(ui, "setSafeExternalAnchor(document.getElementById('dashFoodLink'), getRakExternalLinkUrl('food')", 'Jidelni listek musi mit href podle admin nastaveni');
  assertIncludes(ui, "setSafeExternalAnchor(document.getElementById('dashEportalLink'), getRakExternalLinkUrl('eportal')", 'Eportal musi mit href podle admin nastaveni');
  assertIncludes(ui, "setSafeExternalAnchor(document.getElementById('dashVyplata'), getRakExternalLinkUrl('payroll')", 'Vyplata musi mit href podle admin nastaveni');
  assertIncludes(dashboardJs, "getRakExternalLink('food')", 'Dashboard musi zobrazovat adminovatelny text jidelniho listku');
  assertIncludes(dashboardJs, "getRakExternalLink('eportal')", 'Dashboard musi zobrazovat adminovatelny text Eportalu');
  assertIncludes(dashboardJs, "getRakExternalLink('payroll')", 'Dashboard musi zobrazovat adminovatelny text Vyplaty');
  assertIncludes(dashboardJs, "if (typeof syncDashboardExternalLinks === 'function') syncDashboardExternalLinks();", 'Dashboard musi po prekresleni propsat admin odkazy do href atributu');
  assertIncludes(ui, 'app.machineSettingsRows.filter(isRakExternalLinksSettingsRow)', 'Ulozeni stroju nesmi smazat externi odkazy');
  assertIncludes(bridge, "category === 'external_links_settings'", 'Supabase compatibility save musi povolit externi odkazy');
  assertIncludes(bridge, "key === 'EXTERNAL_LINKS_SETTINGS'", 'Supabase compatibility save musi povolit klic externich odkazu');
}

function assertAdminAppContactSettingsContractV1145() {
  assertIncludes(ui, "const RAK_APP_CONTACT_SETTINGS_KEY = 'APP_CONTACT_SETTINGS'", 'Kontakt aplikace musi mit vlastni machine_settings klic');
  assertIncludes(ui, "const RAK_APP_CONTACT_SETTINGS_CATEGORY = 'app_contact_settings'", 'Kontakt aplikace musi mit vlastni kategorii nastaveni');
  assertIncludes(ui, 'function getRakAppContactSettings', 'Verejny kontakt musi cist ulozene admin nastaveni');
  assertIncludes(ui, 'function getRakAppContactPhoneHref', 'Verejny kontakt musi umet vytvorit tel odkaz z admin telefonu');
  assertIncludes(ui, 'function getRakAppContactEmailHref', 'Verejny kontakt musi umet vytvorit mailto odkaz z admin e-mailu');
  assertIncludes(ui, 'function buildAdminAppContactSettingsHtml', 'Administrace musi mit formular kontaktu aplikace');
  assertIncludes(ui, 'class="adminAppContactLabelCol"', 'Sloupec Polozka u kontaktu aplikace musi mit vlastni uzsi sirku');
  assertIncludes(ui, 'class="adminAppContactValueCol"', 'Sloupec Hodnota u kontaktu aplikace musi mit vlastni uzsi sirku');
  assertIncludes(stylesAdminPolishCss, '.adminAppContactLabelCol{width:160px;}', 'Sloupec Polozka musi byt o 50% uzsi');
  assertIncludes(stylesAdminPolishCss, '.adminAppContactValueCol{width:160px;}', 'Sloupec Hodnota musi byt o 50% uzsi');
  assertNotIncludes(ui, 'function buildAdminAppContactStatusHtml', 'Stav kontaktu aplikace byl na zadost odstranen z admin obrazovky');
  assertNotIncludes(ui, 'function buildAdminAppContactPublicCheckHtml', 'Verejna kontrola kontaktu byla na zadost odstranena z admin obrazovky');
  assertIncludes(ui, 'function readAdminAppContactSettingsFromDom', 'Administrace musi umet nacist kontakt z formulare');
  assertIncludes(ui, 'function mergeRakAppContactSettingsRows', 'Kontakt aplikace se musi ukladat do machine_settings bez mazani ostatnich nastaveni');
  assertNotIncludes(stylesAdminPolishCss, '.adminAppContactStatusGrid', 'Stav kontaktu byl odstranen, admin styl uz nema existovat');
  assertNotIncludes(stylesAdminPolishCss, '.adminAppContactPublicCheckGrid', 'Verejna kontrola kontaktu byla odstranena, admin styl uz nema existovat');
  assertIncludes(ui, "action: 'open-app-contact', label: 'Kontakt aplikace'", 'Admin menu musi obsahovat sekci Kontakt aplikace');
  assertIncludes(ui, "adminAction === 'open-app-contact'", 'Admin menu musi umet otevrit kontakt aplikace');
  assertIncludes(ui, "adminAction === 'save-app-contact'", 'Admin menu musi umet ulozit kontakt aplikace');
  assertIncludes(ui, "adminAction === 'load-app-contact'", 'Admin menu musi umet nacist kontakt aplikace online');
  assertIncludes(ui, "'admin-app-contact'", 'Kontakt aplikace musi byt mezi chranenymi admin view');
  assertIncludes(ui, "const contact = typeof getRakAppContactSettings === 'function'", 'Verejna karta Kontakt musi pouzivat adminovatelny getter');
  assertIncludes(ui, 'const contactPhoneHref = typeof getRakAppContactPhoneHref === \'function\'', 'Verejna karta Kontakt musi nacitat adminovatelny tel href');
  assertIncludes(ui, 'const contactEmailHref = typeof getRakAppContactEmailHref === \'function\'', 'Verejna karta Kontakt musi nacitat adminovatelny mailto href');
  assertIncludes(ui, 'class="appMenuContactLink"', 'Verejny telefon/e-mail v Kontakt musi byt klikaci, pokud je platny');
  assertIncludes(menuPolishCss, '#menu .appMenuContactLink', 'Klikaci kontakt musi mit vlastni menu styl');
  assertIncludes(ui, 'app.machineSettingsRows.filter(isRakAppContactSettingsRow)', 'Ulozeni stroju nesmi smazat kontakt aplikace');
  assertIncludes(bridge, "category === 'app_contact_settings'", 'Supabase compatibility save musi povolit kontakt aplikace');
  assertIncludes(bridge, "key === 'APP_CONTACT_SETTINGS'", 'Supabase compatibility save musi povolit klic kontaktu aplikace');
}

function assertAdminPayrollSettingsContractV1146() {
  assertIncludes(payrollJs, "const RAK_PAYROLL_SETTINGS_KEY = 'PAYROLL_SETTINGS'", 'Vyplata musi mit vlastni machine_settings klic');
  assertIncludes(payrollJs, "const RAK_PAYROLL_SETTINGS_CATEGORY = 'payroll_settings'", 'Vyplata musi mit vlastni kategorii nastaveni');
  assertIncludes(payrollJs, 'function getRakPayrollSettings', 'Vyplata musi cist ulozene admin nastaveni');
  assertIncludes(payrollJs, 'function buildAdminPayrollSettingsHtml', 'Administrace musi mit formular nastaveni vyplaty');
  assertNotIncludes(payrollJs, 'function buildAdminPayrollStatusHtml', 'Stav vyplaty byl na zadost odstranen z admin obrazovky');
  assertNotIncludes(ui, 'function buildAdminPayrollPublicCheckHtml', 'Verejna kontrola vyplaty byla na zadost odstranena z admin obrazovky');
  assertIncludes(payrollJs, 'function readAdminPayrollSettingsFromDom', 'Administrace musi umet nacist nastaveni vyplaty z formulare');
  assertIncludes(payrollJs, 'function mergeRakPayrollSettingsRows', 'Vyplata se musi ukladat do machine_settings bez mazani ostatnich nastaveni');
  assertIncludes(payrollJs, 'function getNextPayrollDateWithSettings', 'Souhrn vyplaty musi pouzivat stejny vypocet nejblizsiho terminu');
  assertIncludes(payrollJs, 'const payrollSettings = getRakPayrollSettings();', 'Vypocet vyplaty musi pouzivat adminovatelne pravidlo');
  assertIncludes(payrollJs, "workdayCount === payrollSettings.workdayOrdinal", 'Vypocet vyplaty nesmi mit natvrdo 4. pracovni den');
  assertNotIncludes(payrollJs, 'workdayCount === 4', 'payroll.js nesmi nechavat pevne pravidlo 4. pracovni den');
  assertNotIncludes(stylesAdminPolishCss, '.adminPayrollStatusGrid', 'Stav vyplaty byl odstranen, admin styl uz nema existovat');
  assertNotIncludes(stylesAdminPolishCss, '.adminPayrollPublicCheckGrid', 'Verejna kontrola vyplaty byla odstranena, admin styl uz nema existovat');
  assertIncludes(payrollJs, 'class="adminPayrollMonthCol"', 'Sloupec Mesic u rucnich vyjimek vyplaty musi mit vlastni uzsi sirku');
  assertIncludes(payrollJs, 'class="adminPayrollDateCol"', 'Sloupec Datum vyplaty u rucnich vyjimek musi mit vlastni uzsi sirku');
  assertIncludes(payrollJs, 'class="adminPayrollNoteCol"', 'Sloupec Poznamka u rucnich vyjimek musi mit vlastni uzsi sirku');
  assertIncludes(stylesAdminPolishCss, '.adminPayrollMonthCol{width:64px;}', 'Sloupec Mesic musi byt o dalsich 25% uzsi nez predchozich 85px');
  assertIncludes(stylesAdminPolishCss, '.adminPayrollDateCol{width:56px;}', 'Sloupec Datum vyplaty musi byt o dalsich 25% uzsi nez predchozich 75px');
  assertIncludes(stylesAdminPolishCss, '.adminPayrollNoteCol{width:64px;}', 'Sloupec Poznamka musi byt o dalsich 60% uzsi nez predchozich 160px');
  assertNotIncludes(stylesAdminPolishCss, '.adminPayrollOverridesTable{', 'Tabulka rucnich vyjimek nesmi mit vlastni width:auto override - to zpusobovalo prekryv nativnich date/month poli');
  assertIncludes(ui, "action: 'open-payroll-settings', label: 'Výplata'", 'Admin menu musi obsahovat sekci Vyplata');
  assertIncludes(ui, "adminAction === 'open-payroll-settings'", 'Admin menu musi umet otevrit nastaveni vyplaty');
  assertIncludes(ui, "adminAction === 'save-payroll-settings'", 'Admin menu musi umet ulozit nastaveni vyplaty');
  assertIncludes(ui, "adminAction === 'load-payroll-settings'", 'Admin menu musi umet nacist nastaveni vyplaty online');
  assertIncludes(ui, "'admin-payroll-settings'", 'Vyplata musi byt mezi chranenymi admin view');
  assertIncludes(ui, 'app.machineSettingsRows.filter(isRakPayrollSettingsRow)', 'Ulozeni stroju nesmi smazat nastaveni vyplaty');
  assertIncludes(bridge, "category === 'payroll_settings'", 'Supabase compatibility save musi povolit nastaveni vyplaty');
  assertIncludes(bridge, "key === 'PAYROLL_SETTINGS'", 'Supabase compatibility save musi povolit klic nastaveni vyplaty');
}

function assertAdminAnnouncementStatusContractV1157() {
  assertIncludes(ui, 'function buildAdminAnnouncementHtml', 'Administrace musi mit formular oznameni na Dashboardu');
  assertNotIncludes(ui, 'function buildAdminAnnouncementStatusHtml', 'Stav oznameni byl na zadost odstranen z admin obrazovky');
  assertNotIncludes(ui, 'function buildAdminAnnouncementPublicCheckHtml', 'Verejna kontrola oznameni byla na zadost odstranena z admin obrazovky');
  assertIncludes(ui, 'function adminAnnouncementRefreshStatus', 'Admin nahled oznameni se musi zive prekreslit podle rozepsanych poli');
  assertIncludes(ui, 'function readAdminAnnouncementDraftFromDom', 'Nahled oznameni musi vychazet z aktualnich DOM poli pred ulozenim');
  assertIncludes(ui, 'adminAnnouncementRefreshStatus(body)', 'Admin menu musi prekreslit nahled oznameni pri zmene pole');
  assertIncludes(ui, 'adminAnnouncementPreview', 'Oznameni musi mit admin nahled');
  assertNotIncludes(stylesAdminPolishCss, '.adminAnnouncementStatusGrid', 'Stav oznameni byl odstranen, admin styl uz nema existovat');
  assertNotIncludes(stylesAdminPolishCss, '.adminAnnouncementPublicCheckGrid', 'Verejna kontrola oznameni byla odstranena, admin styl uz nema existovat');
  assertIncludes(ui, "adminAction === 'save-announcement'", 'Admin menu musi umet ulozit oznameni');
  assertIncludes(ui, "adminAction === 'clear-announcement'", 'Admin menu musi umet vypnout oznameni');
  assertIncludes(ui, "'admin-announcement'", 'Oznameni musi byt mezi chranenymi admin view');
}

function assertAdminReportsStatusContractV1158() {
  assertIncludes(adminReportsJs, 'function buildAdminReportsHtml', 'Administrace musi mit seznam reportu chyb');
  assertIncludes(adminReportsJs, 'function buildAdminReportsStatusHtml', 'Reporty chyb musi mit admin-only souhrn stavu');
  assertIncludes(adminReportsJs, 'function buildAdminReportsStatusSummary', 'Souhrn reportu musi pocitat stavy z nactenych radku');
  assertIncludes(adminReportsJs, 'function normalizeAdminReportStatusKey', 'Souhrn reportu musi normalizovat stavy reportu');
  assertIncludes(adminReportsJs, 'buildAdminReportsStatusHtml(rows)', 'Souhrn reportu musi byt vlozeny nad seznam reportu');
  assertIncludes(adminReportsJs, 'window.buildAdminReportsStatusHtml', 'Souhrn reportu musi byt dostupny pro smoke guard a ladeni');
  assertIncludes(stylesAdminPolishCss, '.adminReportsStatusGrid', 'Souhrn reportu musi mit vlastni responsive admin styl');
  assertIncludes(ui, "action: 'open-reports'", 'Admin menu musi obsahovat vstup do reportu');
  assertIncludes(ui, "adminAction === 'load-reports'", 'Admin menu musi umet nacist reporty');
  assertIncludes(ui, "adminAction === 'download-reports'", 'Admin menu musi umet stahnout reporty');
  assertIncludes(ui, "'admin-reports'", 'Reporty musi byt mezi chranenymi admin view');
}

function assertAdminServiceStatusContractV1159() {
  assertIncludes(ui, 'function buildAdminServiceHtml', 'Administrace musi mit servisni panel');
  assertIncludes(ui, 'function buildAdminServiceStatusHtml', 'Servis musi mit admin-only souhrn stavu');
  assertIncludes(ui, 'buildAdminServiceStatusHtml(snapshot, sync, profileUi, pwa)', 'Souhrn servisu musi byt vlozeny nad servisni metriky');
  assertIncludes(ui, 'window.buildAdminServiceStatusHtml', 'Souhrn servisu musi byt dostupny pro smoke guard a ladeni');
  assertIncludes(ui, "adminAction === 'service-load-status'", 'Admin servis musi umet nacist online stav');
  assertIncludes(ui, "adminAction === 'service-sync-now'", 'Admin servis musi umet vynutit synchronizaci');
  assertIncludes(ui, "adminAction === 'service-update-check'", 'Admin servis musi umet zkontrolovat aktualizaci');
  assertIncludes(stylesAdminPolishCss, '.adminServiceStatusGrid', 'Souhrn servisu musi mit vlastni responsive admin styl');
  assertIncludes(ui, "'admin-service'", 'Servis musi byt mezi chranenymi admin view');
}

function assertAdminUsageStatusContractV1160() {
  assertIncludes(ui, 'function buildAdminUsageHtml', 'Administrace musi mit prehled pripojeni');
  assertNotIncludes(ui, 'function buildAdminUsageStatusHtml', 'Stav pripojeni byl na zadost odstranen z admin obrazovky');
  assertNotIncludes(ui, 'window.buildAdminUsageStatusHtml', 'Stav pripojeni byl odstranen, export uz nema existovat');
  assertIncludes(ui, 'function buildAdminUsageGroups', 'Souhrn pripojeni musi sdilet seskupeny model profilu a zarizeni');
  assertNotIncludes(stylesAdminPolishCss, '.adminUsageStatusGrid', 'Stav pripojeni byl odstranen, admin styl uz nema existovat');
  assertIncludes(ui, "adminAction === 'usage-load'", 'Admin prehled pripojeni musi umet nacist online data');
  assertIncludes(ui, "'admin-usage'", 'Prehled pripojeni musi byt mezi chranenymi admin view');
}

assertDashboardCssGuardSeriesCompleteV1100();
assertReleaseMetadataContractV199();
assertBrusyChoiceSizeContractV1101();
assertFixedAppBackgroundContractV1101();
assertNameChoiceFitContractV1102();
assertBrowserSmokeContractV1103();
assertAppearanceUpdatePersistenceContractV1105();
assertRotationGeneratorContractV1106();
assertRotationGeneratorRulesContractV1107();
assertRotationGeneratorWizardContractV1108();
assertRotationGeneratorAbsenceStateContractV1109();
assertRotationGeneratorWizardRunContractV1110();
assertRotationGeneratorMonthBalanceContractV1112();
assertRotationGeneratorRulesContractV1113();
assertRotationGeneratorRulesContractV1114();
assertRotationGeneratorRulesContractV1115();
assertRotationGeneratorRulesContractV1116();
assertRotationGeneratorRulesContractV1117();
assertDashboardAndRotationEmptyVisualContractV1119();
assertRotationGeneratorExcelCopyContractV1138();
assertGamesActiveAccountDirectStatsContractV1144();
assertSudokuCompletionAndTimeFormatContractV1144();
assertMemory8x8SquareFitContractV1152();
assertSudokuRandomPuzzleContractV1145();
assertLadaManualOverrideContractV1144();
assertLadaSmoothPerformanceContractV1144();
assertStatsPressMachineSplitContractV1123();
assertStatsPressMachineMoOnlyExceptionContractV1124();
assertRotationOvertimeShiftFilterContractV1128();
assertRotationOvertimeDefaults2025ContractV1129();
assertAdminAccountLoginContractV1141();
assertAdminHandoverGuideContractV1142();
assertAdminGeneratorSettingsContractV1143();
assertAdminExternalLinksSettingsContractV1144();
assertAdminAppContactSettingsContractV1145();
assertAdminPayrollSettingsContractV1146();
assertAdminAnnouncementStatusContractV1157();
assertAdminReportsStatusContractV1158();
assertAdminServiceStatusContractV1159();
assertAdminUsageStatusContractV1160();

console.log('app-usage-smoke-v963 OK + rotation-generator-wizard-v1108-guard + rotation-generator-absence-state-v1109-guard + rotation-generator-wizard-run-v1110-guard + rotation-generator-wizard-state-v1111-guard + rotation-generator-month-balance-v1112-guard + rotation-generator-rules-v1113-guard + rotation-generator-rules-v1114-guard + rotation-generator-rules-v1115-guard + rotation-generator-rules-v1116-guard + rotation-generator-rules-v1117-guard + dashboard-percent-empty-cells-v1119-guard + stats-press-machine-split-v1123-guard + rotation-overtime-shift-filter-v1128-guard + admin-food-status-v1163-guard + admin-settings-map-status-v1164-guard + admin-special-days-v1148-guard + admin-menu-sections-v1149-guard + admin-handover-runbook-v1150-guard + admin-handover-audit-v1151-guard + admin-manual-v1152-guard + admin-manual-download-v1154-guard + admin-handover-status-download-v1155-guard + admin-settings-map-v1156-guard + admin-announcement-status-v1157-guard + admin-reports-status-v1158-guard + admin-service-status-v1159-guard + admin-usage-status-v1160-guard + admin-accounts-status-v1161-guard + admin-generator-status-v1162-guard + rotation-overtime-defaults-2025-v1129-guard + rotation-absence-export-ytd-generator-theme-v1130-guard + light-pattern-theme-v1131-guard + admin-account-login-v1141-guard + admin-handover-guide-v1142-guard + admin-generator-settings-v1143-guard + admin-external-links-v1144-guard + admin-calendar-link-v1147-guard + admin-app-contact-v1145-guard + admin-payroll-settings-v1146-guard + rotation-generator-excel-copy-v1138-guard + games-active-account-direct-stats-v1144-guard + sudoku-completion-save-v1148-guard + sudoku-random-puzzle-v1148-guard + game-time-format-v1144-guard + lada-manual-override-v1144-guard + lada-smooth-performance-v1144-guard + dashboard-css-contract-guard + appearance-reward-contract + rotation-export-summary-simple-guard + rotation-export-glass-guard + appearance-readability-guard + css-layer-order-v194-guard + dashboard-owner-registry-v195-guard + dashboard-overrides-selector-lock-v196-guard + dashboard-scope-v197-guard + dashboard-release-isolation-v198-guard + dashboard-css-guard-series-v1100-complete + release-metadata-v199-guard + brusy-choice-size-v1101-guard + fixed-app-background-v1101-guard + name-choice-fit-v1102-guard + browser-smoke-v1103-guard + dashboard-empty-absence-text-v1104-guard + rotace-empty-absence-text-v1105-guard + appearance-update-persistence-v1105-guard + rotation-generator-v1106-guard + rotation-generator-rules-v1107-guard + memory-8x8-square-fit-v1153-guard + memory-total-time-no-5s-v1153-guard + no-visual-owner-drift-guard OK');

// v1.136 guard: soft-core fixed cycle + no TNKS balancing + removed AMOLED black.
assertIncludes(ui, 'RAK_ROTATION_GENERATOR_RULES_V1135', 'Chybí pravidla generátoru v1.136');
assertIncludes(ui, "excludedFromTnksBalance: Object.freeze(['Střížek', 'Synek', 'Třasák'])", 'Synek/Střížek/Třasák nesmí vstupovat do měsíčního ani ročního TNKS dorovnání');
assertIncludes(ui, 'softCoreContinuationRule', 'Synek/Třasák/Střížek musí mít vlastní návazný cyklus mezi měsíci');
assertIncludes(ui, 'adminRotationGeneratorAdvanceSoftCoreCycle', 'Generátor musí umět posouvat vlastní cyklus Synka/Třasáka/Střížka');
assertIncludes(ui, 'adminRotationGeneratorWouldBreakConsecutiveTnks', 'Generátor musí hlídat dvě směny po sobě na TNKS01');
assertIncludes(ui, 'adminRotationGeneratorPersonHasTnksWorkOnRow', 'Generátor musí brát rotující TPKW01 jako práci na TNKS01');
assertIncludes(ui, "machine === 'TPKW01' && adminRotationGeneratorRowShouldSplitPress", 'TPKW01 se smí počítat jako TNKS01 jen ve dnech s půlením TNKS01/TPKW01');
assertIncludes(exportJs, 'consecutivePressRule', 'Export contract musí dokumentovat hlídání TNKS01 i rotující TPKW01');
assertIncludes(ui, 'adminRotationGeneratorSetPendingDraft', 'Generátor musí ukládat nový návrh bokem jako čekající draft');
assertIncludes(ui, 'adminRotationGeneratorApplyPendingDraft', 'Otevření editoru musí umět převzít čekající draft bez online uložení');
assertIncludes(ui, 'const preparedMonth = adminRotationGeneratorEnsurePreparedMonthFromWizard();', 'Příprava dnů generátoru nesmí rovnou přepsat skutečný rozpis');
assert(!ui.includes('adminRotationSaveDockBtn'), 'Editor rozpisu už nesmí mít duplicitní dock tlačítko Uložit rozpis');
