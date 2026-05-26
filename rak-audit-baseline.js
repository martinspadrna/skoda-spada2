// v.1.5 (875) – release/architecture audit helpery, namespace fáze uzavřená na 100 %.

(function setupRakAuditBaselineHelpers() {
  const started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-audit-baseline.js', 'loading', { source: 'index' });
    }
  } catch (err) {}

function readRakDiagnosticForAudit(alias, fallbackGlobalName) {
  try {
    if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.readWithFallback === 'function') {
      return window.RaK.diagnostics.readWithFallback(alias, fallbackGlobalName);
    }
  } catch (err) {}
  try {
    if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.read === 'function') {
      const result = window.RaK.diagnostics.read(alias);
      if (result) return result;
    }
  } catch (err) {}
  try {
    const fn = window[String(fallbackGlobalName || '')];
    return typeof fn === 'function' ? fn() : null;
  } catch (err) {
    return null;
  }
}

function getRakReleaseReadinessHealth() {
  const issues = [];
  const warnings = [];
  const checkedAt = new Date().toISOString();
  const currentVersion = String(window.APP_VERSION || '').trim();
  const expectedExternalScripts = [
    'cdn.jsdelivr.net/npm/xlsx',
    'cdn.jsdelivr.net/npm/jszip@3.10.1',
    'cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
  ];
  const allowedExternalScriptHosts = ['cdn.jsdelivr.net'];
  let externalScripts = [];
  let externalLinks = [];
  let externalDependencyStatus = {};

  try {
    externalDependencyStatus = Object.assign({}, window.__RAK_EXTERNAL_DEP_STATUS__ || {});
  } catch (err) {
    externalDependencyStatus = {};
  }

  try {
    externalScripts = Array.from(document.scripts || [])
      .map((script) => String(script && script.getAttribute ? script.getAttribute('src') || '' : '').trim())
      .filter((src) => /^https?:\/\//i.test(src));
    externalLinks = Array.from(document.querySelectorAll('link[href]') || [])
      .map((link) => String(link && link.getAttribute ? link.getAttribute('href') || '' : '').trim())
      .filter((href) => /^https?:\/\//i.test(href));
  } catch (err) {}

  const hasUnexpectedExternalScript = externalScripts.some((src) => {
    try { return !allowedExternalScriptHosts.includes(new URL(src).hostname); }
    catch (err) { return true; }
  });
  const missingExpectedExternalScripts = expectedExternalScripts.filter((part) => !externalScripts.some((src) => src.includes(part)));

  if (!/^v\.\d+\.\d+ \(\d+\)$/.test(currentVersion)) issues.push('version format');
  if (!document.querySelector('link[rel="manifest"][href="manifest.webmanifest"]')) issues.push('manifest link missing');
  if (!document.querySelector('link[rel="apple-touch-icon"][href^="assets/app-icons/"]')) issues.push('apple touch icon path');
  if (!document.querySelector('link[rel="icon"][href^="assets/app-icons/"]')) issues.push('favicon path');
  if (hasUnexpectedExternalScript) issues.push('unexpected external script host');
  if (missingExpectedExternalScripts.length) warnings.push('external script reference changed: ' + missingExpectedExternalScripts.join(', '));
  ['googleFonts', 'xlsx', 'jszip', 'supabase'].forEach((key) => {
    const status = externalDependencyStatus && externalDependencyStatus[key] ? String(externalDependencyStatus[key].status || '') : '';
    if (status === 'failed') warnings.push(key + ' CDN failed during boot');
  });
  if (!externalLinks.some((href) => href.includes('fonts.googleapis.com/css2'))) warnings.push('Google Fonts reference missing: app poběží s náhradním písmem');
  if (!('serviceWorker' in navigator)) warnings.push('service worker unsupported on this browser');
  if (typeof window.XLSX === 'undefined') warnings.push('XLSX CDN unavailable: Excel import/export může být omezený');
  if (typeof window.JSZip === 'undefined') warnings.push('JSZip CDN unavailable: ZIP export nebude dostupný');
  if (typeof window.supabase === 'undefined') warnings.push('Supabase CDN unavailable: online sync poběží jen offline/fallback režimem');

  return {
    ok: issues.length === 0,
    mode: 'audit-baseline-split-release-readiness-v875',
    checkedAt,
    version: currentVersion || 'unknown',
    issueCount: issues.length,
    warningCount: warnings.length,
    issues: issues.slice(0, 12),
    warnings: warnings.slice(0, 12),
    externalScriptCount: externalScripts.length,
    externalScripts: externalScripts.slice(0, 8),
    externalDependencyStatus,
    externalDependencyStatusCount: Object.keys(externalDependencyStatus || {}).length,
    externalDependencyFailedCount: Object.keys(externalDependencyStatus || {}).filter((key) => String(externalDependencyStatus[key] && externalDependencyStatus[key].status || '') === 'failed').length,
    externalLinkCount: externalLinks.length,
    externalLinks: externalLinks.slice(0, 8),
    requiredChecks: [
      'manifest + app ikony v assets/app-icons',
      'service worker cache verze sedí s buildem',
      'ZIP bez vnitřní hlavní složky a jen assets/ jako složka',
      'root SQL soubory nejsou v release kořeni',
      'JS syntax všech modulů',
      'manifest JSON',
      'duplicitní DOM ID',
      'CSS brace kontrola',
      'browser/mobil smoke po nasazení',
      'rollback bod a release baseline dokumentace',
      'architecture/boot baseline dokumentace a refactor backlog'
    ]
  };
}
window.getRakReleaseReadinessHealth = getRakReleaseReadinessHealth;

function getRakArchitectureBaselineHealth() {
  const issues = [];
  const warnings = [];
  const checkedAt = new Date().toISOString();
  const version = String(window.APP_VERSION || '').trim();
  let scripts = [];
  let stylesheets = [];
  let dataActionCount = 0;
  let duplicateIds = [];
  let moduleReadiness = null;
  let bootSequence = null;
  let namespaceHealth = null;

  try {
    scripts = Array.from(document.scripts || [])
      .map((script) => String(script && script.getAttribute ? (script.getAttribute('src') || 'inline') : 'inline'));
  } catch (err) {
    warnings.push('script inventory unavailable');
  }

  try {
    stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]') || [])
      .map((link) => String(link && link.getAttribute ? link.getAttribute('href') || '' : '').trim())
      .filter(Boolean);
  } catch (err) {
    warnings.push('stylesheet inventory unavailable');
  }

  try {
    dataActionCount = document.querySelectorAll('[data-action]').length;
  } catch (err) {
    warnings.push('data-action inventory unavailable');
  }

  try {
    duplicateIds = typeof getPhaseTenDuplicateDomIds === 'function' ? getPhaseTenDuplicateDomIds() : [];
  } catch (err) {
    duplicateIds = [];
  }

  try {
    moduleReadiness = readRakDiagnosticForAudit('health', 'getRakModuleReadinessHealth');
  } catch (err) {
    moduleReadiness = null;
  }

  try {
    bootSequence = readRakDiagnosticForAudit('bootSequence', 'getRakBootSequenceHealth');
  } catch (err) {
    bootSequence = null;
  }

  try {
    namespaceHealth = readRakDiagnosticForAudit('namespace', 'getRakNamespaceHealth');
  } catch (err) {
    namespaceHealth = null;
  }

  const requiredGlobals = [
    'app',
    'openPage',
    'renderCurrentPage',
    'getRakReleaseReadinessHealth',
    'getRakModuleReadinessHealth',
    'RaK',
    'getRakNamespaceHealth',
    'getRakRuntimeGuardHealth',
    'getRakBootSequenceHealth',
    'getPwaHardeningStatus',
    'getSupabaseHardeningStatus'
  ];
  const missingGlobals = requiredGlobals.filter((name) => typeof window[name] === 'undefined');
  if (missingGlobals.length) issues.push('missing globals: ' + missingGlobals.join(', '));
  if (!/^v\.\d+\.\d+ \(\d+\)$/.test(version)) issues.push('version format');
  if (!scripts.some((src) => /data\.js$/.test(src))) warnings.push('data.js script not visible in boot inventory');
  if (!scripts.some((src) => /module-readiness\.js$/.test(src))) issues.push('module-readiness.js script missing');
  if (!scripts.some((src) => /rak-namespace\.js$/.test(src))) issues.push('rak-namespace.js script missing');
  if (!scripts.some((src) => /rak-audit-baseline\.js$/.test(src))) issues.push('rak-audit-baseline.js script missing');
  if (!scripts.some((src) => /rak-runtime-health\.js$/.test(src))) issues.push('rak-runtime-health.js script missing');
  if (!scripts.some((src) => /rak-boot-sequence-audit\.js$/.test(src))) issues.push('rak-boot-sequence-audit.js script missing');
  if (!scripts.some((src) => /app\.js$/.test(src))) issues.push('app.js script missing');
  if (!scripts.some((src) => /app-init\.js$/.test(src))) issues.push('app-init.js script missing');
  if (!stylesheets.some((href) => /styles\.css$/.test(href))) issues.push('main stylesheet missing');
  if (!stylesheets.some((href) => /styles-overrides\.css$/.test(href))) warnings.push('final override stylesheet not visible');
  if (duplicateIds.length) issues.push('duplicate DOM ids: ' + duplicateIds.length);
  if (!moduleReadiness) warnings.push('module readiness registry unavailable');
  else if (!moduleReadiness.ok) issues.push('module readiness incomplete: ' + String(moduleReadiness.missingCount || 0) + ' missing, ' + String(moduleReadiness.errorCount || 0) + ' errors');
  if (!bootSequence) warnings.push('boot sequence audit unavailable');
  else if (!bootSequence.ok) issues.push('boot sequence audit: ' + String(bootSequence.issueCount || 0) + ' issues');
  if (!namespaceHealth) warnings.push('RaK namespace health unavailable');
  else if (!namespaceHealth.ok) issues.push('RaK namespace bridge: ' + String(namespaceHealth.issueCount || 0) + ' issues');

  return {
    ok: issues.length === 0,
    mode: 'audit-baseline-split-architecture-boot-audit-v875',
    checkedAt,
    version: version || 'unknown',
    issueCount: issues.length,
    warningCount: warnings.length,
    issues: issues.slice(0, 12),
    warnings: warnings.slice(0, 12),
    scriptCount: scripts.length,
    scripts: scripts.slice(0, 24),
    stylesheetCount: stylesheets.length,
    stylesheets: stylesheets.slice(0, 16),
    dataActionCount,
    duplicateIdCount: duplicateIds.length,
    requiredGlobals,
    missingGlobals,
    moduleReadinessOk: !!(moduleReadiness && moduleReadiness.ok),
    moduleExpectedCount: moduleReadiness ? Number(moduleReadiness.expectedCount || 0) : 0,
    moduleLoadedCount: moduleReadiness ? Number(moduleReadiness.loadedCount || 0) : 0,
    moduleMissingCount: moduleReadiness ? Number(moduleReadiness.missingCount || 0) : 0,
    moduleErrorCount: moduleReadiness ? Number(moduleReadiness.errorCount || 0) : 0,
    moduleBootDurationMs: moduleReadiness ? Number(moduleReadiness.bootDurationMs || 0) : 0,
    moduleOrderMismatch: !!(moduleReadiness && moduleReadiness.orderMismatch),
    moduleLoadedOrder: moduleReadiness && Array.isArray(moduleReadiness.loadedOrder) ? moduleReadiness.loadedOrder.slice(0, 24) : [],
    moduleMissing: moduleReadiness && Array.isArray(moduleReadiness.missing) ? moduleReadiness.missing.slice(0, 12) : [],
    bootSequenceOk: !!(bootSequence && bootSequence.ok),
    bootSequenceIssueCount: bootSequence ? Number(bootSequence.issueCount || 0) : 0,
    bootSequenceWarningCount: bootSequence ? Number(bootSequence.warningCount || 0) : 0,
    bootStaticOrderOk: !!(bootSequence && bootSequence.staticOrderOk),
    bootDynamicOrderOk: !!(bootSequence && bootSequence.dynamicOrderOk),
    bootDynamicMissingCount: bootSequence ? Number(bootSequence.dynamicMissingCount || 0) : 0,
    namespaceBridgeOk: !!(namespaceHealth && namespaceHealth.ok),
    namespaceIssueCount: namespaceHealth ? Number(namespaceHealth.issueCount || 0) : 0,
    namespaceWarningCount: namespaceHealth ? Number(namespaceHealth.warningCount || 0) : 0,
    namespaceCompatibility: namespaceHealth ? String(namespaceHealth.compatibility || '') : '',
    namespaceMapCount: namespaceHealth ? Number(namespaceHealth.namespaceMapCount || 0) : 0,
    namespaceRefactorProgressPercent: namespaceHealth ? Number(namespaceHealth.refactorProgressPercent || 0) : 0,
    namespacePassiveBridgeOnly: !!(namespaceHealth && namespaceHealth.passiveBridgeOnly),
    architectureBootAuditPercent: 100,
    namespaceDiagnosticsReadOnly: !!(window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.read === 'function'),
    architectureBootAuditClosed: true,
    nextRecommendedPhase: 'phase C uzavřena: window.RaK read-only diagnostika má fallbacky; další směr phase D export/release tooling',
    runtimeLayers: [
      'index.html boot shell + CDN dependency notes',
      'core/app state + routing',
      'ui rendering + delegated actions',
      'domain modules: dashboard/rotace/stats/kalkulacky/games',
      'localStorage/sessionStorage persistence',
      'Supabase bridge + realtime + queue',
      'PWA service worker/cache/export'
    ],
    refactorBacklog: [
      'phase A: boot order guard + explicit module readiness map – hotovo a uzavřeno',
      'phase B: split app.js runtime audits from page/business logic – module readiness, release/architecture, runtime health a boot sequence uzavřené',
      'phase C: window.RaK namespace read-only mapa a fallbacky – hotovo a uzavřeno ve v875; navigace/render/hry zůstávají mimo přepojení',
      'phase D: isolate export/release tooling from runtime app code',
      'phase E: add DOM smoke tests for locked sections before every build'
    ]
  };
}
window.getRakArchitectureBaselineHealth = getRakArchitectureBaselineHealth;

  try {
    const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-audit-baseline.js', 'loaded', { source: 'index', durationMs: ended - started });
    }
  } catch (err) {}
})();
