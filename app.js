// RaK 1.2 (1.155) – boot/load shell aplikace.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app.js', 'loaded', { source: 'index' }); } catch (err) {}

(async () => {
  const RAK_MODULE_CACHE_VERSION = "1.5.59";
  const RAK_DEV_UPDATE_BUILD = "v1.5.59";
  window.RAK_PWA_BUILD = RAK_DEV_UPDATE_BUILD;

  const criticalFiles = [
    "supabase-config.js",
    "rak-user-profile.js",
    "rak-auth-gate.js",
    "rak-account-access.js",
    "rak-login-splash.js",
    "rak-login-fix.js",
    "rak-login-life.js"
  ];

  const deferredFiles = [
    "app-runtime-guards.js",
    "app-pwa-connectivity.js",
    "core.js",
    "lifecycle.js",
    "qr.js",
    "payroll.js",
    "brusy.js",
    "stats.js",
    "dashboard.js",
    "soustruhy.js",
    "rotace.js",
    "rotation-tasks.js",
    "admin-fhb-calibration.js",
    "brusy-fhb-correction.js",
    "brusy-fhb-v157.js",
    "appearance-theme.js",
    "changelog.js",
    "admin-rotation-editor.js",
    "admin-rotation-overtime.js",
    "admin-rotation-generator.js",
    "admin-rotation-generator-wizard.js",
    "admin-machine-settings.js",
    "admin-rotation.js",
    "admin-machine-tasks.js",
    "admin-food.js",
    "admin-reports.js",
    "admin-service-usage.js",
    "admin-daymods.js",
    "ui.js",
    "app-navigation.js",
    "app-bottom-nav.js",
    "app-menu-admin-export.js",
    "app-menu-admin-storage.js",
    "app-menu-admin-service.js",
    "app-menu-admin-renderer.js",
    "app-menu.js",
    "app-menu-pages.js",
    "app-menu-bug-report.js",
    "app-menu-profile.js",
    "app-menu-shift-report.js",
    "app-actions.js",
    "app-boot-selftest.js",
    "export.js",
    "supabase-bridge.js",
    "app-rotation-sync.js",
    "app-excel-import.js",
    "rak-lazy-external-libs.js",
    "app-rotation-controls.js",
    "app-admin-unlock.js",
    "app-home-boot.js",
    "app-init.js",
    "rak-vacation-report.js",
    "rak-shift-report.js",
    "rak-shift-report-share.js",
    "brusy-fhb-v158.js"
  ];

  const idleAuditFiles = [
    "app-health-audits.js",
    "app-postload-audits.js",
    "rak-storage-sync-audit.js",
    "rak-boot-sequence-audit.js",
    "rak-dom-action-audit.js",
    "rak-supabase-client-audit.js",
    "rak-appsec-privacy-audit.js",
    "rak-release-gates.js",
    "rak-export-release-audit.js",
    "rak-release-ops-audit.js",
    "rak-due-diligence-progress.js",
    "rak-performance-ci-audit.js",
    "rak-mobile-smoke-audit.js"
  ];

  const files = criticalFiles.concat(deferredFiles);

  try {
    if (window.__rakModuleReadinessRegistry) {
      window.__rakModuleReadinessRegistry.expected = ['module-readiness.js', 'rak-namespace.js', 'rak-audit-baseline.js', 'rak-runtime-health.js', 'rak-storage-sync-audit.js', 'rak-boot-sequence-audit.js', 'rak-export-release-audit.js', 'rak-dom-action-audit.js', 'rak-supabase-client-audit.js', 'rak-release-ops-audit.js', 'rak-appsec-privacy-audit.js', 'rak-release-gates.js', 'rak-dom-security-hardening.js', 'rak-due-diligence-progress.js', 'rak-performance-ci-audit.js', 'rak-mobile-smoke-audit.js', 'app.js', 'data.js'].concat(files.slice());
      if (typeof initialRotationData !== 'undefined' && typeof window.rakMarkModuleReady === 'function') {
        window.rakMarkModuleReady('data.js', 'loaded', { source: 'index-preload' });
      }
    }
  } catch (err) {}

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady(src, 'loading', { source: 'dynamic-loader' });
    script.src = src + "?v=" + encodeURIComponent(RAK_MODULE_CACHE_VERSION);
    script.async = false;
    script.onload = () => {
      const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady(src, 'loaded', { source: 'dynamic-loader', durationMs: ended - started });
      resolve();
    };
    script.onerror = () => {
      const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const error = new Error(`Nepodařilo se načíst ${src}`);
      if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady(src, 'error', { source: 'dynamic-loader', durationMs: ended - started, error: error.message });
      reject(error);
    };
    document.head.appendChild(script);
  });

  for (const file of criticalFiles) await loadScript(file);

  try { if (typeof window.rakUserProfileBootstrap === 'function') window.rakUserProfileBootstrap(); } catch (err) { console.warn('RaK user profile bootstrap failed', err); }

  let hasStoredProfile = false;
  try { hasStoredProfile = !!(typeof window.rakUserProfileGet === 'function' && window.rakUserProfileGet()); } catch (err) {}

  if (!hasStoredProfile) {
    try { if (typeof window.installRakLoginSplash === 'function') window.installRakLoginSplash(); } catch (err) { console.warn('RaK login splash failed', err); }
    try { if (typeof window.rakInstallLoginLife === 'function') window.rakInstallLoginLife(); } catch (err) { console.warn('RaK login mascot failed', err); }
    await new Promise((resolve) => {
      if (typeof requestAnimationFrame !== 'function') { setTimeout(resolve, 0); return; }
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  }

  await Promise.all(deferredFiles.map(loadScript));

  try {
    const storedProfile = typeof window.rakUserProfileGet === 'function' ? window.rakUserProfileGet() : null;
    if (storedProfile && typeof window.rakUserProfileApplyToRuntime === 'function') {
      window.rakUserProfileApplyToRuntime(storedProfile);
    }
    if (typeof window.rakUserProfileRefreshMenu === 'function') window.rakUserProfileRefreshMenu();
  } catch (err) { console.warn('RaK user profile runtime restore failed', err); }

  if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('boot-loader', 'ready', { source: 'dynamic-loader' });

  try {
    const DEV_RESET_KEY = 'rak_dev_pwa_prompt_reset_build';
    if (localStorage.getItem(DEV_RESET_KEY) !== RAK_DEV_UPDATE_BUILD) {
      sessionStorage.removeItem('rotace_sw_update_notice_v1');
      sessionStorage.removeItem('rotace_sw_update_pending_v1');
      localStorage.removeItem('rotace_sw_update_suppress_v1');
      localStorage.setItem(DEV_RESET_KEY, RAK_DEV_UPDATE_BUILD);
    }
  } catch (err) {}

  if (typeof installPwaAndConnectivityHooks === 'function') installPwaAndConnectivityHooks();
  if (typeof installBottomNavBindings === 'function') installBottomNavBindings();
  try { if (typeof applyBottomNavMoreHardFix === 'function') applyBottomNavMoreHardFix(); } catch (err) { console.warn('Bottom nav Více hard-fix failed', err); }
  try { if (typeof applyRakFixedBottomNavMetrics === 'function') applyRakFixedBottomNavMetrics(); } catch (err) { console.warn('Bottom nav fixed metrics failed', err); }
  if (typeof installDelegatedAppActions === 'function') installDelegatedAppActions();

  try {
    if (typeof window.__rotaceBootHomeRefreshLate === 'function') window.__rotaceBootHomeRefreshLate();
    else if (typeof bootHomeRefresh === 'function') bootHomeRefresh();
  } catch (err) { console.warn('Post-load boot failed', err); }

  try { if (typeof runRakBootSelfTest === 'function') window.runRakBootSelfTest ? window.runRakBootSelfTest() : runRakBootSelfTest(); } catch (err) { console.warn('Boot self-test selhal', err); }

  const runIdleAudits = () => {
    Promise.all(idleAuditFiles.map(loadScript)).then(() => {
      // Diagnostické/release moduly zůstávají dostupné, ale neblokují první
      // interaktivní start aplikace. Legacy audit funkce automaticky nespouštíme.
      try { window.__rakIdleAuditsReady = true; } catch (err) {}
    }).catch((err) => {
      console.warn('Idle audit moduly se nepodařilo načíst', err);
    });
  };
  if (typeof requestIdleCallback === 'function') requestIdleCallback(runIdleAudits, { timeout: 1800 });
  else setTimeout(runIdleAudits, 900);
})().catch(err => {
  console.error(err);
  alert("Nepodařilo se načíst aplikační skripty: " + (err && err.message ? err.message : String(err)));
});