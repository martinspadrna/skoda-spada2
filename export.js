// v.1.5 (916) – export manifest doplněný o DOM/security hardening docs.
const EXPORT_SOURCE_IDS = {
  "module-readiness.js": "src-module-readiness-js",
  "rak-namespace.js": "src-rak-namespace-js",
  "rak-audit-baseline.js": "src-rak-audit-baseline-js",
  "rak-runtime-health.js": "src-rak-runtime-health-js",
  "rak-storage-sync-audit.js": "src-rak-storage-sync-audit-js",
  "rak-boot-sequence-audit.js": "src-rak-boot-sequence-audit-js",
  "rak-export-release-audit.js": "src-rak-export-release-audit-js",
  "rak-dom-action-audit.js": "src-rak-dom-action-audit-js",
  "rak-supabase-client-audit.js": "src-rak-supabase-client-audit-js",
  "rak-release-ops-audit.js": "src-rak-release-ops-audit-js",
  "rak-appsec-privacy-audit.js": "src-rak-appsec-privacy-audit-js",
  "rak-release-gates.js": "src-rak-release-gates-js",
  "rak-dom-security-hardening.js": "src-rak-dom-security-hardening-js",
  "app.js": "src-app-js",
  "core.js": "src-core-js",
  "lifecycle.js": "src-lifecycle-js",
  "qr.js": "src-qr-js",
  "payroll.js": "src-payroll-js",
  "stats.js": "src-stats-js",
  "dashboard.js": "src-dashboard-js",
  "soustruhy.js": "src-soustruhy-js",
  "brusy.js": "src-brusy-js",
  "rotace.js": "src-rotace-js",
  "changelog.js": "src-changelog-js",
  "ui.js": "src-ui-js",
  "games-arcade.js": "src-games-arcade-js",
  "export.js": "src-export-js",
  "app-init.js": "src-app-init-js",
  "data.js": "src-data-js",
  "styles.css": "src-styles-css",
  "styles-base.css": "src-styles-base-css",
  "styles-layout.css": "src-styles-layout-css",
  "styles-theme.css": "src-styles-theme-css",
  "styles-responsive.css": "src-styles-responsive-css",
  "styles-modal.css": "src-styles-modal-css",
  "styles-inline-legacy.css": "src-styles-inline-legacy-css",
  "styles-calc-panels.css": "src-styles-calc-panels-css",
  "styles-games.css": "src-styles-games-css",
  "styles-overrides.css": "src-styles-overrides-css",
  "supabase-config.js": "src-supabase-config-js",
  "supabase-bridge.js": "src-supabase-bridge-js",
  "CHANGELOG.md": "src-changelog-md",
  "manifest.webmanifest": "src-manifest-webmanifest",
  "sw.js": "src-sw-js",
  "assets/docs/sql/supabase_rpc_hardening_v828.sql": "src-supabase-rpc-hardening-v828-sql",
  "assets/docs/release-readiness-v857.md": "src-release-readiness-v857-md",
  "assets/docs/release-readiness-v858.md": "src-release-readiness-v858-md",
  "assets/docs/release-readiness-v859.md": "src-release-readiness-v859-md",
  "assets/docs/architecture-boot-audit-v860.md": "src-architecture-boot-audit-v860-md",
  "assets/docs/module-readiness-audit-v861.md": "src-module-readiness-audit-v861-md",
  "assets/docs/module-readiness-split-v862.md": "src-module-readiness-split-v862-md",
  "assets/docs/audit-baseline-split-v863.md": "src-audit-baseline-split-v863-md",
  "assets/docs/runtime-health-split-v864.md": "src-runtime-health-split-v864-md",
  "assets/docs/boot-sequence-audit-v865.md": "src-boot-sequence-audit-v865-md",
  "assets/docs/architecture-boot-baseline-v866.md": "src-architecture-boot-baseline-v866-md",
  "assets/docs/rak-namespace-bridge-v867.md": "src-rak-namespace-bridge-v867-md",
  "assets/docs/rak-namespace-map-v868.md": "src-rak-namespace-map-v868-md",
  "assets/docs/rak-namespace-diagnostics-v869.md": "src-rak-namespace-diagnostics-v869-md",
  "assets/docs/ttt-ai-hardening-v870.md": "src-ttt-ai-hardening-v870-md",
  "assets/docs/rak-namespace-runtime-aliases-v871.md": "src-rak-namespace-runtime-aliases-v871-md",
  "assets/docs/rak-namespace-diagnostic-map-v872.md": "src-rak-namespace-diagnostic-map-v872-md",
  "assets/docs/rak-namespace-map-closure-v873.md": "src-rak-namespace-map-closure-v873-md",
  "assets/docs/rak-namespace-audit-read-bridge-v874.md": "src-rak-namespace-audit-read-bridge-v874-md",
  "assets/docs/rak-namespace-phase-closure-v875.md": "src-rak-namespace-phase-closure-v875-md",
  "assets/docs/export-release-tooling-map-v876.md": "src-export-release-tooling-map-v876-md",
  "assets/docs/export-manifest-split-v877.md": "src-export-manifest-split-v877-md",
  "assets/docs/export-manifest-preflight-v878.md": "src-export-manifest-preflight-v878-md",
  "assets/docs/export-smoke-report-v879.md": "src-export-smoke-report-v879-md",
  "assets/docs/export-release-tooling-closure-v880.md": "src-export-release-tooling-closure-v880-md",
  "assets/docs/dom-action-registry-audit-v881.md": "src-dom-action-registry-audit-v881-md",
  "assets/docs/dom-action-category-map-v882.md": "src-dom-action-category-map-v882-md",
  "assets/docs/dom-action-target-attribute-map-v883.md": "src-dom-action-target-attribute-map-v883-md",
  "assets/docs/dom-action-smoke-report-v884.md": "src-dom-action-smoke-report-v884-md",
  "assets/docs/dom-action-registry-closure-v885.md": "src-dom-action-registry-closure-v885-md",
  "assets/docs/storage-sync-audit-v886.md": "src-storage-sync-audit-v886-md",
  "assets/docs/storage-sync-cleanup-map-v887.md": "src-storage-sync-cleanup-map-v887-md",
  "assets/docs/storage-sync-smoke-guard-v888.md": "src-storage-sync-smoke-guard-v888-md",
  "assets/docs/storage-sync-closure-v889.md": "src-storage-sync-closure-v889-md",
  "assets/docs/supabase-client-queue-audit-v890.md": "src-supabase-client-queue-audit-v890-md",
  "assets/docs/supabase-client-queue-smoke-guard-v891.md": "src-supabase-client-queue-smoke-guard-v891-md",
  "assets/docs/supabase-client-queue-closure-v892.md": "src-supabase-client-queue-closure-v892-md",
  "assets/docs/corrections-labels-v891.md": "src-corrections-labels-v891-md",
  "assets/docs/stats-year-occupancy-v891.md": "src-stats-year-occupancy-v891-md",
  "assets/docs/ttt-ai-hardening-v891.md": "src-ttt-ai-hardening-v891-md",
  "assets/docs/stats-occupancy-charts-v893.md": "src-stats-occupancy-charts-v893-md",
  "assets/docs/ttt-ai-hardening-v893.md": "src-ttt-ai-hardening-v893-md",
  "assets/docs/stats-occupancy-layout-v896.md": "src-stats-occupancy-layout-v896-md",
  "assets/docs/ttt-ai-hardening-v896.md": "src-ttt-ai-hardening-v896-md",
  "assets/docs/games-score-reset-v897.md": "src-games-score-reset-v897-md",
  "assets/docs/ttt-ai-hardening-v897.md": "src-ttt-ai-hardening-v897-md",
  "assets/docs/games-score-reset-v901.md": "src-games-score-reset-v901-md",
  "assets/docs/stats-occupancy-point-tooltip-v901.md": "src-stats-occupancy-point-tooltip-v901-md",
  "assets/docs/ttt-ai-hardening-v901.md": "src-ttt-ai-hardening-v901-md",
  "assets/docs/online-game-contract-audit-v895.md": "src-online-game-contract-audit-v895-md",
  "assets/docs/online-game-contract-audit-v901.md": "src-online-game-contract-audit-v901-md",
  "assets/docs/online-game-contract-closure-v901.md": "src-online-game-contract-closure-v901-md",
  "assets/docs/food-sunday-overtime-guard-v901.md": "src-food-sunday-overtime-guard-v901-md",
  "assets/docs/release-ops-checklist-v902.md": "src-release-ops-checklist-v902-md",
  "assets/docs/monitoring-alerting-v902.md": "src-monitoring-alerting-v902-md",
  "assets/docs/rollback-playbook-v902.md": "src-rollback-playbook-v902-md",
  "assets/docs/ttt-ai-hardening-v903.md": "src-ttt-ai-hardening-v903-md",
  "assets/docs/appsec-privacy-baseline-v903.md": "src-appsec-privacy-baseline-v903-md",
  "assets/docs/appsec-privacy-completion-v904.md": "src-appsec-privacy-completion-v904-md",
  "assets/docs/storage-key-classification-v904.md": "src-storage-key-classification-v904-md",
  "assets/docs/csp-sri-report-only-plan-v904.md": "src-csp-sri-report-only-plan-v904-md",
  "assets/docs/release-gates-matrix-v905.md": "src-release-gates-matrix-v905-md",
  "assets/docs/release-gates-policy-v905.md": "src-release-gates-policy-v905-md",
  "assets/docs/dom-security-hardening-plan-v916.md": "src-dom-security-hardening-plan-v916-md",
  "assets/docs/dom-safe-helper-policy-v916.md": "src-dom-safe-helper-policy-v916-md",
  "assets/docs/food-hours-alignment-v916.md": "src-food-hours-alignment-v916-md",
  "assets/docs/games-top-score-dom-hardening-v916.md": "src-games-top-score-dom-hardening-v916-md",
  "assets/docs/games-profile-dom-hardening-v916.md": "src-games-profile-dom-hardening-v916-md",
  "assets/docs/games-hud-message-dom-hardening-v916.md": "src-games-hud-message-dom-hardening-v916-md",
  "assets/docs/food-overtime-diff-only-v916.md": "src-food-overtime-diff-only-v916-md",
  "assets/docs/games-top-score-datetime-v916.md": "src-games-top-score-datetime-v916-md",
  "assets/docs/games-ships-menu-dom-hardening-v916.md": "src-games-ships-menu-dom-hardening-v916-md",
  "assets/docs/about-version-summary-policy-v916.md": "src-about-version-summary-policy-v916-md",
  "assets/docs/games-score-reset-v916.md": "src-games-score-reset-v916-md",
  "assets/docs/ttt-top-score-datetime-v916.md": "src-ttt-top-score-datetime-v916-md",
  "assets/docs/about-50-version-summary-v916.md": "src-about-50-version-summary-v916-md",
  "assets/docs/games-daily-challenge-dom-hardening-v916.md": "src-games-daily-challenge-dom-hardening-v916-md",
  "assets/docs/daily-challenge-score-bridge-v916.md": "src-daily-challenge-score-bridge-v916-md",
  "assets/docs/reaction-top-score-visibility-v916.md": "src-reaction-top-score-visibility-v916-md",
  "assets/docs/games-post-fix-score-flow-v916.md": "src-games-post-fix-score-flow-v916-md",
  "assets/docs/games-action-text-dom-hardening-v916.md": "src-games-action-text-dom-hardening-v916-md",
"assets/app-icons/icon-16.png": "src-icon-16-png",
  "assets/app-icons/icon-32.png": "src-icon-32-png",
  "assets/app-icons/icon-180.png": "src-icon-180-png",
  "assets/app-icons/icon-192.png": "src-icon-192-png",
  "assets/app-icons/icon-512.png": "src-icon-512-png",
  "assets/app-icons/icon-1024.png": "src-icon-1024-png"
};

const SOURCE_CACHE = window.__ROTACE_SOURCE_CACHE__ || (window.__ROTACE_SOURCE_CACHE__ = {});
const BINARY_SOURCE_CACHE = window.__ROTACE_BINARY_SOURCE_CACHE__ || (window.__ROTACE_BINARY_SOURCE_CACHE__ = {});
const EXPORT_SMOKE_REPORT = window.__RAK_EXPORT_SMOKE_REPORT__ || (window.__RAK_EXPORT_SMOKE_REPORT__ = {
  ok: null,
  status: 'not-run',
  mode: 'export-smoke-report-v916',
  version: 'v.1.5 (916)',
  checkedAt: null,
  lastStage: 'čeká na export',
  runCount: 0,
  successCount: 0,
  failureCount: 0,
  checkedTextFileCount: 0,
  checkedBinaryFileCount: 0,
  missingTextFileCount: 0,
  missingBinaryFileCount: 0,
  duplicatePathCount: 0,
  lastDownloadName: '',
  lastError: ''
});

const EXPORT_BINARY_FILES = new Set([
  'assets/app-icons/icon-16.png',
  'assets/app-icons/icon-32.png',
  'assets/app-icons/icon-180.png',
  'assets/app-icons/icon-192.png',
  'assets/app-icons/icon-512.png',
  'assets/app-icons/icon-1024.png',
  'assets/dashboard-icons/calendar.png',
  'assets/dashboard-icons/dovolena.png',
  'assets/dashboard-icons/eportal.png',
  'assets/dashboard-icons/hourglass.png',
  'assets/dashboard-icons/jidelna.png',
  'assets/dashboard-icons/jidelnilistek.png',
  'assets/dashboard-icons/kantyna.png',
  'assets/dashboard-icons/vyplata.png',
  'assets/nav-icons/games-gray.png',
  'assets/nav-icons/games-green.png',
  'assets/nav-icons/home-gray.png',
  'assets/nav-icons/home-green.png',
  'assets/nav-icons/kalkulacky-gray.png',
  'assets/nav-icons/kalkulacky-green.png',
  'assets/nav-icons/rotace-gray.png',
  'assets/nav-icons/rotace-green.png',
  'assets/nav-icons/rozpisy-gray.png',
  'assets/nav-icons/rozpisy-green.png',
  'assets/nav-icons/statistiky-gray.png',
  'assets/nav-icons/statistiky-green.png',
  'assets/help/frezky-konicita-help.png',
  'assets/help/frezky-fhb-help.png',
  'assets/help/soustruhy-vrtaky-x-help.png'
]);

const EXPORT_JS_FILES = [
      'module-readiness.js',
      'rak-namespace.js',
      'rak-audit-baseline.js',
      'rak-runtime-health.js',
      'rak-storage-sync-audit.js',
      'rak-boot-sequence-audit.js',
      'rak-export-release-audit.js',
      'rak-dom-action-audit.js',
      'rak-supabase-client-audit.js',
  'rak-release-ops-audit.js',
  'rak-appsec-privacy-audit.js',
  'rak-release-gates.js',
  'rak-dom-security-hardening.js',
      'app.js',
      'core.js',
      'lifecycle.js',
      'qr.js',
      'payroll.js',
      'stats.js',
      'dashboard.js',
      'soustruhy.js',
      'brusy.js',
      'rotace.js',
      'changelog.js',
      'ui.js',
      'games-arcade.js',
      'export.js',
      'app-init.js',
      'supabase-config.js',
      'supabase-bridge.js'
];

const EXPORT_TEXT_FILES = [
      'styles.css',
      'styles-base.css',
      'styles-layout.css',
      'styles-theme.css',
      'styles-responsive.css',
      'styles-modal.css',
      'styles-inline-legacy.css',
      'styles-calc-panels.css',
      'styles-games.css',
      'styles-overrides.css',
      'CHANGELOG.md',
      'manifest.webmanifest',
      'sw.js',
      'data.js',
      'assets/docs/sql/supabase_rpc_hardening_v809.sql',
      'assets/docs/sql/supabase_rpc_hardening_v813.sql',
      'assets/docs/sql/supabase_rpc_hardening_v814.sql',
      'assets/docs/sql/supabase_rpc_hardening_v816.sql',
      'assets/docs/sql/supabase_rpc_hardening_v817.sql',
      'assets/docs/sql/supabase_rpc_hardening_v818.sql',
      'assets/docs/sql/supabase_rpc_hardening_v819.sql',
      'assets/docs/sql/supabase_rpc_hardening_v820.sql',
      'assets/docs/sql/supabase_rpc_hardening_v821.sql',
      'assets/docs/sql/supabase_rpc_hardening_v825.sql',
      'assets/docs/sql/supabase_rpc_hardening_v827.sql',
      'assets/docs/sql/supabase_rpc_hardening_v828.sql',
      'assets/docs/sql/supabase_keepalive_v834.sql',
      'assets/docs/sql/supabase_keepalive_rpc_v836.sql',
      'assets/docs/sql/supabase_keepalive_rpc_v837.sql',
      'assets/docs/sql/supabase_game_accept_invite_rpc_v839.sql',
      'assets/docs/sql/INDEX.md',
      'assets/docs/release-readiness-v857.md',
      'assets/docs/release-readiness-v858.md',
      'assets/docs/release-readiness-v859.md',
      'assets/docs/architecture-boot-audit-v860.md',
      'assets/docs/module-readiness-audit-v861.md',
      'assets/docs/module-readiness-split-v862.md',
      'assets/docs/audit-baseline-split-v863.md',
      'assets/docs/runtime-health-split-v864.md',
      'assets/docs/boot-sequence-audit-v865.md',
      'assets/docs/architecture-boot-baseline-v866.md',
      'assets/docs/rak-namespace-bridge-v867.md',
      'assets/docs/rak-namespace-map-v868.md',
      'assets/docs/rak-namespace-diagnostics-v869.md',
      'assets/docs/ttt-ai-hardening-v870.md',
      'assets/docs/rak-namespace-runtime-aliases-v871.md',
      'assets/docs/rak-namespace-diagnostic-map-v872.md',
      'assets/docs/rak-namespace-map-closure-v873.md',
      'assets/docs/rak-namespace-audit-read-bridge-v874.md',
      'assets/docs/rak-namespace-phase-closure-v875.md',
      'assets/docs/export-release-tooling-map-v876.md',
      'assets/docs/export-manifest-split-v877.md',
      'assets/docs/export-manifest-preflight-v878.md',
      'assets/docs/export-smoke-report-v879.md',
      'assets/docs/export-release-tooling-closure-v880.md',
      'assets/docs/dom-action-registry-audit-v881.md',
      'assets/docs/dom-action-category-map-v882.md',
      'assets/docs/dom-action-target-attribute-map-v883.md',
      'assets/docs/dom-action-smoke-report-v884.md',
      'assets/docs/dom-action-registry-closure-v885.md',
      'assets/docs/storage-sync-audit-v886.md',
      'assets/docs/storage-sync-cleanup-map-v887.md',
      'assets/docs/storage-sync-smoke-guard-v888.md',
      'assets/docs/storage-sync-closure-v889.md',
      'assets/docs/supabase-client-queue-audit-v890.md',
      'assets/docs/supabase-client-queue-smoke-guard-v891.md',
      'assets/docs/supabase-client-queue-closure-v892.md',
      'assets/docs/corrections-labels-v891.md',
      'assets/docs/stats-year-occupancy-v891.md',
      'assets/docs/ttt-ai-hardening-v891.md',
      'assets/docs/stats-occupancy-charts-v893.md',
      'assets/docs/ttt-ai-hardening-v893.md',
      'assets/docs/stats-occupancy-layout-v896.md',
      'assets/docs/ttt-ai-hardening-v896.md',
      'assets/docs/games-score-reset-v897.md',
      'assets/docs/ttt-ai-hardening-v897.md',
      'assets/docs/games-score-reset-v901.md',
      'assets/docs/stats-occupancy-point-tooltip-v901.md',
      'assets/docs/ttt-ai-hardening-v901.md',
      'assets/docs/online-game-contract-audit-v895.md',
      'assets/docs/online-game-contract-audit-v901.md',
      'assets/docs/online-game-contract-closure-v901.md',
      'assets/docs/food-sunday-overtime-guard-v901.md',
      'assets/docs/release-ops-checklist-v902.md',
      'assets/docs/monitoring-alerting-v902.md',
      'assets/docs/rollback-playbook-v902.md',
      'assets/docs/appsec-privacy-baseline-v903.md',
      'assets/docs/appsec-privacy-completion-v904.md',
      'assets/docs/storage-key-classification-v904.md',
      'assets/docs/csp-sri-report-only-plan-v904.md',
      'assets/docs/ttt-ai-hardening-v903.md',
      'assets/docs/release-gates-matrix-v905.md',
      'assets/docs/release-gates-policy-v905.md',
      'assets/docs/dom-security-hardening-plan-v916.md',
      'assets/docs/dom-safe-helper-policy-v916.md',
      'assets/docs/food-hours-alignment-v916.md',
      'assets/docs/games-top-score-dom-hardening-v916.md',
      'assets/docs/games-profile-dom-hardening-v916.md',
      'assets/docs/games-hud-message-dom-hardening-v916.md',
      'assets/docs/food-overtime-diff-only-v916.md',
      'assets/docs/games-top-score-datetime-v916.md',
      'assets/docs/games-ships-menu-dom-hardening-v916.md',
      'assets/docs/about-version-summary-policy-v916.md',
      'assets/docs/games-score-reset-v916.md',
      'assets/docs/ttt-top-score-datetime-v916.md',
      'assets/docs/about-50-version-summary-v916.md',
      'assets/docs/games-daily-challenge-dom-hardening-v916.md',
      'assets/docs/daily-challenge-score-bridge-v916.md',
      'assets/docs/reaction-top-score-visibility-v916.md',
      'assets/docs/games-post-fix-score-flow-v916.md',
      'assets/docs/games-action-text-dom-hardening-v916.md'
];

function getRakExportManifest() {
  return {
    version: String(window.APP_VERSION || 'v.1.5 (916)'),
    mode: 'export-manifest-preflight-v916',
    indexFile: 'index.html',
    jsFiles: Array.from(new Set(EXPORT_JS_FILES)),
    textFiles: Array.from(new Set(EXPORT_TEXT_FILES)),
    binaryFiles: Array.from(EXPORT_BINARY_FILES),
    preflightValidation: true
  };
}
window.getRakExportManifest = getRakExportManifest;


function getRakExportSourceInventoryHealth() {
  const exportManifest = typeof getRakExportManifest === 'function' ? getRakExportManifest() : { jsFiles: [], textFiles: [], binaryFiles: [] };
  const sourcePaths = Object.keys(EXPORT_SOURCE_IDS || {});
  const manifestPaths = [].concat(exportManifest.indexFile ? [exportManifest.indexFile] : [], exportManifest.jsFiles || [], exportManifest.textFiles || []);
  const binaryPaths = Array.from(exportManifest.binaryFiles || EXPORT_BINARY_FILES || []);
  const duplicateSourceCount = sourcePaths.length - new Set(sourcePaths).size;
  const duplicateBinaryCount = binaryPaths.length - new Set(binaryPaths).size;
  const duplicateManifestPathCount = manifestPaths.length - new Set(manifestPaths).size;
  return {
    ok: duplicateSourceCount === 0 && duplicateBinaryCount === 0 && duplicateManifestPathCount === 0,
    mode: 'export-source-inventory-v916',
    version: String(window.APP_VERSION || 'unknown'),
    sourceIdCount: sourcePaths.length,
    manifestTextPathCount: manifestPaths.length,
    uniqueManifestTextPathCount: new Set(manifestPaths).size,
    totalManifestPathCount: manifestPaths.length,
    uniqueSourcePathCount: new Set(sourcePaths).size,
    binaryFileCount: binaryPaths.length,
    uniqueBinaryFileCount: new Set(binaryPaths).size,
    duplicateSourceCount,
    duplicateBinaryCount,
    duplicateManifestPathCount,
    hasPreflightValidation: !!exportManifest.preflightValidation,
    indexFile: String(exportManifest.indexFile || '—'),
    hasSqlArchive: sourcePaths.some((path) => String(path).startsWith('assets/docs/sql/')),
    hasReleaseDocs: sourcePaths.some((path) => String(path).startsWith('assets/docs/')),
    manifestSplit: true,
    manifestMode: String(exportManifest.mode || '—'),
    zipRootRule: 'root-files-assets-folder-only'
  };
}
window.getRakExportSourceInventoryHealth = getRakExportSourceInventoryHealth;

function primeSourceCache() {
  // Keep the cache empty here so exports always read the current files first.
}

primeSourceCache();

function setRakExportStatus(text, isError) {
  const status = document.getElementById('rakExcelImportStatus') || document.getElementById('adminOnlineSaveStatus');
  if (!status) return;
  status.textContent = text || '';
  status.classList.toggle('isError', !!isError);
}


async function readExportText(relativePath) {
  if (SOURCE_CACHE[relativePath]) {
    return SOURCE_CACHE[relativePath];
  }

  try {
    const response = await fetch(new URL(relativePath, window.location.href).toString(), { cache: 'no-store' });
    if (response.ok) {
      const text = await response.text();
      SOURCE_CACHE[relativePath] = text;
      return text;
    }
  } catch (err) {
    console.warn(err);
  }

  const id = EXPORT_SOURCE_IDS[relativePath];
  const embedded = id ? document.getElementById(id) : null;
  if (embedded && embedded.textContent) {
    const text = embedded.textContent.replace(/^\s+|\s+$/g, '');
    SOURCE_CACHE[relativePath] = text;
    return text;
  }

  throw new Error(`Nepodařilo se načíst ${relativePath}`);
}

async function readExportBinary(relativePath) {
  if (BINARY_SOURCE_CACHE[relativePath]) {
    return BINARY_SOURCE_CACHE[relativePath];
  }

  try {
    const response = await fetch(new URL(relativePath, window.location.href).toString(), { cache: 'no-store' });
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      BINARY_SOURCE_CACHE[relativePath] = buffer;
      return buffer;
    }
  } catch (err) {
    console.warn(err);
  }
  throw new Error(`Nepodařilo se načíst ${relativePath}`);
}



function updateRakExportSmokeReport(partial) {
  const data = partial && typeof partial === 'object' ? partial : {};
  Object.assign(EXPORT_SMOKE_REPORT, data, {
    mode: 'export-smoke-report-v916',
    version: String(window.APP_VERSION || 'v.1.5 (916)'),
    checkedAt: new Date().toISOString()
  });
  return getRakExportSmokeReport();
}
window.updateRakExportSmokeReport = updateRakExportSmokeReport;

function getRakExportSmokeReport() {
  return Object.assign({}, EXPORT_SMOKE_REPORT, {
    ok: EXPORT_SMOKE_REPORT.ok,
    status: String(EXPORT_SMOKE_REPORT.status || 'not-run'),
    mode: String(EXPORT_SMOKE_REPORT.mode || 'export-smoke-report-v916'),
    version: String(EXPORT_SMOKE_REPORT.version || window.APP_VERSION || 'unknown'),
    lastStage: String(EXPORT_SMOKE_REPORT.lastStage || '—'),
    lastError: String(EXPORT_SMOKE_REPORT.lastError || ''),
    lastDownloadName: String(EXPORT_SMOKE_REPORT.lastDownloadName || '')
  });
}
window.getRakExportSmokeReport = getRakExportSmokeReport;

async function runRakExportSmokeReport(options) {
  const opts = options && typeof options === 'object' ? options : {};
  const manifest = getRakExportManifest();
  const duplicateReport = getRakExportManifestDuplicateReport(manifest);
  if (!opts.preflight) {
    return updateRakExportSmokeReport({
      ok: duplicateReport.ok,
      status: duplicateReport.ok ? 'manifest-ok' : 'manifest-duplicates',
      lastStage: 'manifest smoke bez načítání souborů',
      runCount: Number(EXPORT_SMOKE_REPORT.runCount || 0) + 1,
      duplicatePathCount: Number((duplicateReport.duplicateAllPaths || []).length || 0),
      checkedTextFileCount: duplicateReport.textPathCount || 0,
      checkedBinaryFileCount: duplicateReport.binaryPathCount || 0,
      missingTextFileCount: 0,
      missingBinaryFileCount: 0,
      lastError: duplicateReport.ok ? '' : 'Duplicitní cesta v export manifestu'
    });
  }
  return validateRakExportManifestFiles(manifest);
}
window.runRakExportSmokeReport = runRakExportSmokeReport;

function getRakExportManifestDuplicateReport(exportManifest) {
  const manifest = exportManifest && typeof exportManifest === 'object' ? exportManifest : getRakExportManifest();
  const textPaths = [].concat(manifest.indexFile ? [manifest.indexFile] : [], manifest.jsFiles || [], manifest.textFiles || []);
  const binaryPaths = Array.from(manifest.binaryFiles || []);
  const allPaths = textPaths.concat(binaryPaths);
  const findDuplicates = (list) => {
    const seen = new Set();
    const dupes = new Set();
    for (const item of list) {
      const key = String(item || '').trim();
      if (!key) continue;
      if (seen.has(key)) dupes.add(key);
      seen.add(key);
    }
    return Array.from(dupes);
  };
  return {
    ok: findDuplicates(allPaths).length === 0,
    duplicateTextPaths: findDuplicates(textPaths),
    duplicateBinaryPaths: findDuplicates(binaryPaths),
    duplicateAllPaths: findDuplicates(allPaths),
    textPathCount: textPaths.length,
    binaryPathCount: binaryPaths.length,
    totalPathCount: allPaths.length,
    uniquePathCount: new Set(allPaths).size
  };
}
window.getRakExportManifestDuplicateReport = getRakExportManifestDuplicateReport;

async function validateRakExportManifestFiles(exportManifest) {
  const manifest = exportManifest && typeof exportManifest === 'object' ? exportManifest : getRakExportManifest();
  const duplicateReport = getRakExportManifestDuplicateReport(manifest);
  const textPaths = [].concat(manifest.indexFile ? [manifest.indexFile] : [], manifest.jsFiles || [], manifest.textFiles || []);
  const binaryPaths = Array.from(manifest.binaryFiles || []);
  const missingTextFiles = [];
  const missingBinaryFiles = [];

  for (const file of textPaths) {
    try {
      await readExportText(file);
    } catch (err) {
      missingTextFiles.push(file);
    }
  }

  for (const file of binaryPaths) {
    try {
      await readExportBinary(file);
    } catch (err) {
      missingBinaryFiles.push(file);
    }
  }

  const ok = duplicateReport.ok && missingTextFiles.length === 0 && missingBinaryFiles.length === 0;
  const report = {
    ok,
    mode: 'export-manifest-preflight-v916',
    version: String(window.APP_VERSION || 'unknown'),
    checkedAt: new Date().toISOString(),
    duplicateReport,
    missingTextFileCount: missingTextFiles.length,
    missingBinaryFileCount: missingBinaryFiles.length,
    missingTextFiles: missingTextFiles.slice(0, 20),
    missingBinaryFiles: missingBinaryFiles.slice(0, 20),
    checkedTextFileCount: textPaths.length,
    checkedBinaryFileCount: binaryPaths.length
  };
  updateRakExportSmokeReport({
    ok,
    status: ok ? 'preflight-ok' : 'preflight-failed',
    lastStage: 'předexportní kontrola manifestu',
    runCount: Number(EXPORT_SMOKE_REPORT.runCount || 0) + 1,
    successCount: Number(EXPORT_SMOKE_REPORT.successCount || 0) + (ok ? 1 : 0),
    failureCount: Number(EXPORT_SMOKE_REPORT.failureCount || 0) + (ok ? 0 : 1),
    checkedTextFileCount: textPaths.length,
    checkedBinaryFileCount: binaryPaths.length,
    missingTextFileCount: missingTextFiles.length,
    missingBinaryFileCount: missingBinaryFiles.length,
    duplicatePathCount: Number((duplicateReport.duplicateAllPaths || []).length || 0),
    lastError: ok ? '' : ([].concat(missingTextFiles, missingBinaryFiles).join(', ') || 'Duplicitní cesta v export manifestu')
  });
  return report;
}
window.validateRakExportManifestFiles = validateRakExportManifestFiles;

async function exportCurrentHtml() {
  if (typeof JSZip === "undefined") {
    setRakExportStatus("Export ZIP není dostupný, nenačetla se knihovna JSZip.", true);
    alert("Export ZIP není dostupný, nenačetla se knihovna JSZip.");
    return;
  }

  try {
    updateRakExportSmokeReport({ ok: null, status: 'running', lastStage: 'start exportu', lastDownloadName: '', lastError: '' });
    setRakExportStatus("Kontroluju exportní manifest…", false);
    const exportManifest = getRakExportManifest();
    const preflight = await validateRakExportManifestFiles(exportManifest);
    if (!preflight.ok) {
      const missing = [].concat(preflight.missingTextFiles || [], preflight.missingBinaryFiles || []);
      throw new Error('Předexportní kontrola našla problém: ' + (missing.length ? missing.join(', ') : 'duplicitní cesta v manifestu'));
    }
    setRakExportStatus("Připravuju ZIP build…", false);
    const jsFiles = exportManifest.jsFiles;
    const textFiles = exportManifest.textFiles;
    const binaryFiles = exportManifest.binaryFiles;

    const stylesSource = await readExportText('styles.css');
    const cssSources = {};
    for (const file of textFiles.filter((file) => file.startsWith('styles-'))) {
      cssSources[file] = await readExportText(file);
    }

    const moduleSources = {};
    for (const file of jsFiles) {
      moduleSources[file] = await readExportText(file);
    }

    const textSources = {};
    for (const file of textFiles.filter((file) => !file.startsWith('styles-') && file !== 'data.js')) {
      textSources[file] = await readExportText(file);
    }

    const binarySources = {};
    for (const file of binaryFiles) {
      binarySources[file] = await readExportBinary(file);
    }

    let indexText = '';
    try {
      indexText = await readExportText(exportManifest.indexFile || 'index.html');
    } catch (indexErr) {
      console.warn('Export fallback: index.html se nepodařilo načíst jako zdroj, používám DOM kopii.', indexErr);
      const pages = [...document.querySelectorAll(".page")];
      const previousActive = pages.find(p => p.classList.contains("active"))?.id || "home";
      pages.forEach(p => p.classList.remove("active"));
      const home = document.getElementById("home");
      if (home) home.classList.add("active");
      indexText = `<!DOCTYPE html>
${document.documentElement.cloneNode(true).outerHTML}`;
      pages.forEach(p => p.classList.remove("active"));
      const restore = document.getElementById(previousActive);
      if (restore) restore.classList.add("active");
    }

    const zip = new JSZip();
    zip.file('index.html', indexText);
    zip.file('styles.css', stylesSource);
    for (const file of textFiles.filter((file) => file.startsWith('styles-'))) {
      zip.file(file, cssSources[file]);
    }
    zip.file('data.js', `const initialRotationData = ${JSON.stringify(app.rotation)};
`);
    for (const file of jsFiles) {
      zip.file(file, moduleSources[file]);
    }
    for (const file of Object.keys(textSources)) {
      if (file === 'styles.css' || file.startsWith('styles-')) continue;
      zip.file(file, textSources[file]);
    }
    for (const file of binaryFiles) {
      zip.file(file, binarySources[file]);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const versionText = String(window.APP_VERSION || '').trim();
    const versionMatch = versionText.match(/v\.(\d+)\.(\d+)\s*\((\d+)\)/i);
    const versionSuffix = versionMatch ? `${versionMatch[1]}_${versionMatch[2]}_${versionMatch[3]}` : 'current';
    a.download = `RaK_v${versionSuffix}.zip`;
    updateRakExportSmokeReport({ ok: true, status: 'export-ready', lastStage: 'ZIP sestavený, spouštím stažení', lastDownloadName: a.download, lastError: '' });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setRakExportStatus("ZIP export spuštěný: " + a.download, false);
    updateRakExportSmokeReport({ ok: true, status: 'download-started', lastStage: 'stažení ZIPu spuštěno', lastDownloadName: a.download, lastError: '' });
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error(err);
    updateRakExportSmokeReport({ ok: false, status: 'export-failed', lastStage: 'export skončil chybou', failureCount: Number(EXPORT_SMOKE_REPORT.failureCount || 0) + 1, lastError: String(err && err.message ? err.message : err) });
    setRakExportStatus("Export ZIP se nepovedl: " + (err && err.message ? err.message : err), true);
    alert("Export ZIP se nepovedl: " + (err && err.message ? err.message : err));
  }
}
window.exportCurrentHtml = exportCurrentHtml;

async function triggerRakZipExport() {
  return exportCurrentHtml();
}
window.triggerRakZipExport = triggerRakZipExport;

document.getElementById("exportBtn")?.addEventListener("click", () => {
  exportCurrentHtml();
});
