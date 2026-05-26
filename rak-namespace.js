// v.1.5 (870) – pasivní window.RaK namespace bridge s mapou budoucího přepojování bez změny starých globálů.

(function setupRakNamespaceBridge() {
  const started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-namespace.js', 'loading', { source: 'index' });
    }
  } catch (err) {}

  const root = window.RaK || {};
  const existingVersion = root.namespaceVersion || '';
  root.namespaceVersion = 'v.1.5 (870)';
  root.mode = 'passive-namespace-map-v870';
  root.createdAt = root.createdAt || new Date().toISOString();
  root.updatedAt = new Date().toISOString();
  root.compatibility = 'legacy-globals-preserved';

  const namespaceMap = [
    { group: 'modules', alias: 'markReady', globalName: 'rakMarkModuleReady', type: 'function', phase: 'safe-now', risk: 'low', note: 'Jen zápis module readiness události.' },
    { group: 'modules', alias: 'health', globalName: 'getRakModuleReadinessHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Čtení stavu načtení modulů.' },
    { group: 'diagnostics', alias: 'releaseReadiness', globalName: 'getRakReleaseReadinessHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Čistě diagnostický helper.' },
    { group: 'diagnostics', alias: 'architectureBaseline', globalName: 'getRakArchitectureBaselineHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Čistě diagnostický helper.' },
    { group: 'diagnostics', alias: 'runtimeGuard', globalName: 'getRakRuntimeGuardHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Čistě diagnostický helper.' },
    { group: 'diagnostics', alias: 'bootSequence', globalName: 'getRakBootSequenceHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Čistě diagnostický helper.' },
    { group: 'diagnostics', alias: 'namespace', globalName: 'getRakNamespaceHealth', type: 'function', phase: 'safe-now', risk: 'low', note: 'Sebekontrola namespace bridge.' },
    { group: 'diagnostics', alias: 'pwaHardening', globalName: 'getPwaHardeningStatus', type: 'function', phase: 'later', risk: 'medium', note: 'PWA stav zatím ponechat jako legacy global kvůli SW vazbám.' },
    { group: 'diagnostics', alias: 'supabaseHardening', globalName: 'getSupabaseHardeningStatus', type: 'function', phase: 'later', risk: 'medium', note: 'Supabase audit zatím ponechat jako legacy global kvůli online flow.' },
    { group: 'diagnostics', alias: 'phaseTenReadiness', globalName: 'getPhaseTenRuntimeReadinessHealth', type: 'function', phase: 'later', risk: 'medium', note: 'Starší readiness helper ponechat kvůli kompatibilitě diagnostiky.' },
    { group: 'app', alias: 'state', globalName: 'app', type: 'object', phase: 'later', risk: 'high', note: 'Hlavní stav nepřepojovat hromadně, jen číst přes getter.' },
    { group: 'app', alias: 'openPage', globalName: 'openPage', type: 'function', phase: 'later', risk: 'high', note: 'Navigace je kritická pro celou app, zatím jen pasivní alias.' },
    { group: 'app', alias: 'renderCurrentPage', globalName: 'renderCurrentPage', type: 'function', phase: 'later', risk: 'high', note: 'Render stránky je kritický, zatím jen pasivní alias.' }
  ];

  function cloneMap() {
    return namespaceMap.map((item) => Object.assign({}, item));
  }

  function resolveGlobal(name) {
    try { return window[String(name || '')]; } catch (err) { return undefined; }
  }

  function callGlobal(name, args) {
    const fn = resolveGlobal(name);
    if (typeof fn !== 'function') return null;
    try { return fn.apply(window, Array.isArray(args) ? args : []); } catch (err) { return { ok: false, error: String(err && err.message ? err.message : err) }; }
  }

  function ensureGroup(group) {
    const groupName = String(group || '').trim();
    if (!groupName) return null;
    if (!root[groupName]) root[groupName] = {};
    return root[groupName];
  }

  function bindLazyFunction(group, alias, globalName) {
    const target = ensureGroup(group);
    if (!target) return null;
    target[alias] = function rakNamespaceLazyCall() {
      return callGlobal(globalName, Array.from(arguments));
    };
    return target[alias];
  }

  root.resolve = resolveGlobal;
  root.call = callGlobal;
  root.version = function getRakNamespaceAppVersion() {
    return String(window.APP_VERSION || root.namespaceVersion || 'unknown');
  };
  root.getNamespaceMap = cloneMap;
  root.namespaceMap = cloneMap();
  root.namespaceMapVersion = 'v.1.5 (870)';
  root.namespacePlan = {
    phase: 'phase C',
    mode: 'diagnostics-read-only',
    progressPercent: 50,
    rule: 'Staré globály zůstávají zdroj pravdy; nové auditní čtení může jít přes window.RaK.diagnostics.read().',
    nextStep: 'Postupně číst jen diagnostické helpery přes namespace, ne runtime navigaci/render.'
  };

  ensureGroup('modules');
  ensureGroup('diagnostics');
  ensureGroup('app');

  namespaceMap.forEach((item) => {
    if (item.type === 'function') bindLazyFunction(item.group, item.alias, item.globalName);
  });

  root.diagnosticReadCount = Number(root.diagnosticReadCount || 0);
  root.diagnostics.read = function readRakDiagnosticViaNamespace(alias, args) {
    const key = String(alias || '').trim();
    if (!key) return null;
    const fn = root.diagnostics && root.diagnostics[key];
    if (typeof fn !== 'function') return null;
    try {
      root.diagnosticReadCount += 1;
      root.lastDiagnosticRead = { alias: key, at: new Date().toISOString() };
      return fn.apply(window, Array.isArray(args) ? args : []);
    } catch (err) {
      return { ok: false, alias: key, error: String(err && err.message ? err.message : err) };
    }
  };
  root.diagnostics.list = function listRakDiagnosticsAliases() {
    return namespaceMap
      .filter((item) => item.group === 'diagnostics')
      .map((item) => ({ alias: item.alias, globalName: item.globalName, phase: item.phase, risk: item.risk }));
  };

  root.app.state = function getLegacyAppState() { return resolveGlobal('app') || null; };

  window.RaK = root;

  window.getRakNamespaceHealth = function getRakNamespaceHealth() {
    const checkedAt = new Date().toISOString();
    const issues = [];
    const warnings = [];
    const expectedGroups = Array.from(new Set(namespaceMap.map((item) => item.group))).sort();
    const expectedFunctionAliases = namespaceMap.filter((item) => item.type === 'function');
    const legacyGlobals = Array.from(new Set(namespaceMap.map((item) => item.globalName))).filter(Boolean);

    if (!window.RaK) issues.push('window.RaK missing');
    expectedGroups.forEach((group) => {
      if (!window.RaK || !window.RaK[group]) issues.push('namespace group missing: ' + group);
    });
    expectedFunctionAliases.forEach((item) => {
      if (!window.RaK || !window.RaK[item.group] || typeof window.RaK[item.group][item.alias] !== 'function') issues.push('namespace alias missing: ' + item.group + '.' + item.alias);
    });

    const missingLegacy = legacyGlobals.filter((name) => typeof resolveGlobal(name) === 'undefined');
    if (missingLegacy.length) warnings.push('legacy globals not available yet: ' + missingLegacy.slice(0, 6).join(', '));

    const namespaceVersion = String(window.RaK && window.RaK.namespaceVersion || '');
    if (!/^v\.\d+\.\d+ \(\d+\)$/.test(namespaceVersion)) issues.push('namespace version format');
    if (existingVersion && existingVersion !== namespaceVersion) warnings.push('namespace bridge refreshed from ' + existingVersion + ' to ' + namespaceVersion);
    if (!window.RaK || !Array.isArray(window.RaK.namespaceMap) || window.RaK.namespaceMap.length < namespaceMap.length) issues.push('namespace map incomplete');
    if (!window.RaK || typeof window.RaK.getNamespaceMap !== 'function') issues.push('namespace map getter missing');
    if (!window.RaK || !window.RaK.diagnostics || typeof window.RaK.diagnostics.read !== 'function') issues.push('diagnostics reader missing');
    if (!window.RaK || !window.RaK.diagnostics || typeof window.RaK.diagnostics.list !== 'function') warnings.push('diagnostics alias list missing');

    const safeNowCount = namespaceMap.filter((item) => item.phase === 'safe-now').length;
    const laterCount = namespaceMap.filter((item) => item.phase === 'later').length;
    const highRiskCount = namespaceMap.filter((item) => item.risk === 'high').length;

    return {
      ok: issues.length === 0,
      mode: 'passive-namespace-map-v870',
      checkedAt,
      version: String(window.APP_VERSION || 'unknown'),
      namespaceVersion,
      compatibility: window.RaK && window.RaK.compatibility || '',
      issueCount: issues.length,
      warningCount: warnings.length,
      issues: issues.slice(0, 12),
      warnings: warnings.slice(0, 12),
      groupCount: expectedGroups.length,
      groups: expectedGroups,
      diagnosticAliasCount: expectedFunctionAliases.filter((item) => item.group === 'diagnostics').length,
      namespaceMapCount: namespaceMap.length,
      safeNowCount,
      laterCount,
      highRiskCount,
      missingLegacyCount: missingLegacy.length,
      missingLegacy: missingLegacy.slice(0, 12),
      legacyGlobalsPreserved: missingLegacy.length === 0,
      passiveBridgeOnly: true,
      migratedRuntimeCount: 0,
      refactorProgressPercent: 50,
      diagnosticsReadOnlyEnabled: !!(window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.read === 'function'),
      diagnosticReadCount: Number(window.RaK && window.RaK.diagnosticReadCount || 0),
      lastDiagnosticRead: window.RaK && window.RaK.lastDiagnosticRead || null,
      nextRefactorRule: 'Nové auditní čtení může používat window.RaK.diagnostics.read(), ale navigace/render/hry zůstávají přes legacy globály.',
      namespaceMap: cloneMap().slice(0, 24),
      hasResolver: !!(window.RaK && typeof window.RaK.resolve === 'function'),
      hasCaller: !!(window.RaK && typeof window.RaK.call === 'function'),
      hasMapGetter: !!(window.RaK && typeof window.RaK.getNamespaceMap === 'function')
    };
  };

  try {
    const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-namespace.js', 'loaded', { source: 'index', durationMs: Math.max(0, Math.round(ended - started)), mapCount: namespaceMap.length });
    }
  } catch (err) {}
})();
