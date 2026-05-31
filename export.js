// v.1.5 (992) – zúžený export manifest pro čistý ostrý ZIP.
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
  "rak-due-diligence-progress.js": "src-rak-due-diligence-progress-js",
  "rak-performance-ci-audit.js": "src-rak-performance-ci-audit-js",
  "rak-mobile-smoke-audit.js": "src-rak-mobile-smoke-audit-js",
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
  "supabase-config.js": "src-supabase-config-js",
  "supabase-bridge.js": "src-supabase-bridge-js",
  "gomoku-ai-smoke-v966.js": "src-gomoku-ai-smoke-v966-js",
  "app-usage-smoke-v963.js": "src-app-usage-smoke-v963-js",
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
  "CHANGELOG.md": "src-changelog-md",
  "manifest.webmanifest": "src-manifest-webmanifest",
  "sw.js": "src-sw-js",
  "data.js": "src-data-js",
  "assets/docs/sql/supabase_app_usage_v963.sql": "src-assets-docs-sql-supabase-app-usage-v963-sql",
  "assets/app-icons/icon-16.png": "src-assets-app-icons-icon-16-png",
  "assets/app-icons/icon-32.png": "src-assets-app-icons-icon-32-png",
  "assets/app-icons/icon-180.png": "src-assets-app-icons-icon-180-png",
  "assets/app-icons/icon-192.png": "src-assets-app-icons-icon-192-png",
  "assets/app-icons/icon-512.png": "src-assets-app-icons-icon-512-png",
  "assets/app-icons/icon-1024.png": "src-assets-app-icons-icon-1024-png",
  "assets/dashboard-icons/calendar.png": "src-assets-dashboard-icons-calendar-png",
  "assets/dashboard-icons/dovolena.png": "src-assets-dashboard-icons-dovolena-png",
  "assets/dashboard-icons/eportal.png": "src-assets-dashboard-icons-eportal-png",
  "assets/dashboard-icons/hourglass.png": "src-assets-dashboard-icons-hourglass-png",
  "assets/dashboard-icons/jidelna.png": "src-assets-dashboard-icons-jidelna-png",
  "assets/dashboard-icons/jidelnilistek.png": "src-assets-dashboard-icons-jidelnilistek-png",
  "assets/dashboard-icons/kantyna.png": "src-assets-dashboard-icons-kantyna-png",
  "assets/dashboard-icons/vyplata.png": "src-assets-dashboard-icons-vyplata-png",
  "assets/nav-icons/games-gray.png": "src-assets-nav-icons-games-gray-png",
  "assets/nav-icons/games-green.png": "src-assets-nav-icons-games-green-png",
  "assets/nav-icons/home-gray.png": "src-assets-nav-icons-home-gray-png",
  "assets/nav-icons/home-green.png": "src-assets-nav-icons-home-green-png",
  "assets/nav-icons/kalkulacky-gray.png": "src-assets-nav-icons-kalkulacky-gray-png",
  "assets/nav-icons/kalkulacky-green.png": "src-assets-nav-icons-kalkulacky-green-png",
  "assets/nav-icons/rotace-gray.png": "src-assets-nav-icons-rotace-gray-png",
  "assets/nav-icons/rotace-green.png": "src-assets-nav-icons-rotace-green-png",
  "assets/help/frezky-konicita-help.png": "src-assets-help-frezky-konicita-help-png",
  "assets/help/frezky-fhb-help.png": "src-assets-help-frezky-fhb-help-png",
  "assets/help/soustruhy-vrtaky-x-help.png": "src-assets-help-soustruhy-vrtaky-x-help-png"
};

const SOURCE_CACHE = window.__ROTACE_SOURCE_CACHE__ || (window.__ROTACE_SOURCE_CACHE__ = {});
const BINARY_SOURCE_CACHE = window.__ROTACE_BINARY_SOURCE_CACHE__ || (window.__ROTACE_BINARY_SOURCE_CACHE__ = {});
const EXPORT_SMOKE_REPORT = window.__RAK_EXPORT_SMOKE_REPORT__ || (window.__RAK_EXPORT_SMOKE_REPORT__ = {
  ok: null,
  status: 'not-run',
  mode: 'export-smoke-report-v939',
  version: 'v.1.5 (992)',
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
  "assets/app-icons/icon-16.png",
  "assets/app-icons/icon-32.png",
  "assets/app-icons/icon-180.png",
  "assets/app-icons/icon-192.png",
  "assets/app-icons/icon-512.png",
  "assets/app-icons/icon-1024.png",
  "assets/dashboard-icons/calendar.png",
  "assets/dashboard-icons/dovolena.png",
  "assets/dashboard-icons/eportal.png",
  "assets/dashboard-icons/hourglass.png",
  "assets/dashboard-icons/jidelna.png",
  "assets/dashboard-icons/jidelnilistek.png",
  "assets/dashboard-icons/kantyna.png",
  "assets/dashboard-icons/vyplata.png",
  "assets/nav-icons/games-gray.png",
  "assets/nav-icons/games-green.png",
  "assets/nav-icons/home-gray.png",
  "assets/nav-icons/home-green.png",
  "assets/nav-icons/kalkulacky-gray.png",
  "assets/nav-icons/kalkulacky-green.png",
  "assets/nav-icons/rotace-gray.png",
  "assets/nav-icons/rotace-green.png",
  "assets/help/frezky-konicita-help.png",
  "assets/help/frezky-fhb-help.png",
  "assets/help/soustruhy-vrtaky-x-help.png"
]);

const EXPORT_JS_FILES = [
  "module-readiness.js",
  "rak-namespace.js",
  "rak-audit-baseline.js",
  "rak-runtime-health.js",
  "rak-storage-sync-audit.js",
  "rak-boot-sequence-audit.js",
  "rak-export-release-audit.js",
  "rak-dom-action-audit.js",
  "rak-supabase-client-audit.js",
  "rak-release-ops-audit.js",
  "rak-appsec-privacy-audit.js",
  "rak-release-gates.js",
  "rak-dom-security-hardening.js",
  "rak-due-diligence-progress.js",
  "rak-performance-ci-audit.js",
  "rak-mobile-smoke-audit.js",
  "app.js",
  "core.js",
  "lifecycle.js",
  "qr.js",
  "payroll.js",
  "stats.js",
  "dashboard.js",
  "soustruhy.js",
  "brusy.js",
  "rotace.js",
  "changelog.js",
  "ui.js",
  "games-arcade.js",
  "export.js",
  "app-init.js",
  "supabase-config.js",
  "supabase-bridge.js",
  "gomoku-ai-smoke-v966.js",
  "app-usage-smoke-v963.js"
];

const EXPORT_TEXT_FILES = [
  "styles.css",
  "styles-base.css",
  "styles-layout.css",
  "styles-theme.css",
  "styles-responsive.css",
  "styles-modal.css",
  "styles-inline-legacy.css",
  "styles-calc-panels.css",
  "styles-games.css",
  "styles-overrides.css",
  "CHANGELOG.md",
  "manifest.webmanifest",
  "sw.js",
  "data.js",
  "assets/docs/sql/supabase_app_usage_v963.sql"
];

function getRakExportManifest() {
  return {
    version: String(window.APP_VERSION || 'v.1.5 (992)'),
    mode: 'export-manifest-preflight-v939',
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
    mode: 'export-source-inventory-v939',
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
    mode: 'export-smoke-report-v939',
    version: String(window.APP_VERSION || 'v.1.5 (992)'),
    checkedAt: new Date().toISOString()
  });
  return getRakExportSmokeReport();
}
window.updateRakExportSmokeReport = updateRakExportSmokeReport;

function getRakExportSmokeReport() {
  return Object.assign({}, EXPORT_SMOKE_REPORT, {
    ok: EXPORT_SMOKE_REPORT.ok,
    status: String(EXPORT_SMOKE_REPORT.status || 'not-run'),
    mode: String(EXPORT_SMOKE_REPORT.mode || 'export-smoke-report-v929'),
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
    mode: 'export-manifest-preflight-v939',
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
