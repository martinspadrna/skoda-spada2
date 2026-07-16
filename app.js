// RaK 1.2 (1.155) – boot/load shell aplikace.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app.js', 'loaded', { source: 'index' }); } catch (err) {}


// RaK 1.2 (1.155) – runtime guardy aplikace jsou oddělené v app-runtime-guards.js.
// RaK 1.2 (1.155) – delegované klikací akce jsou oddělené v app-actions.js.
// RaK 1.2 (1.155) – health/audit helpery aplikace jsou oddělené v app-health-audits.js.
// RaK 1.2 (1.155) – PWA/service worker konektivita je oddělená v app-pwa-connectivity.js.
// RaK 1.2 (1.155) – boot self-test je oddělený v app-boot-selftest.js.
// RaK 1.2 (1.155) – Excel import rozpisů je oddělený v app-excel-import.js.
// RaK 1.2 (1.155) – admin odemčení je oddělené v app-admin-unlock.js.
// RaK 1.2 (1.155) – home boot sekvence je oddělená v app-home-boot.js.
// RaK 1.2 (1.155) – sync a startovací volby Rotace jsou v app-rotation-sync.js a app-rotation-controls.js.


// RaK 1.2 (1.155) – spodní navigace je oddělená v app-bottom-nav.js.




(async () => {
  const RAK_MODULE_CACHE_VERSION = "1.2.229";
  const files = [
    "app-runtime-guards.js",
    "app-health-audits.js",
    "app-postload-audits.js",
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
    "games-engine.js",
    "games-profile.js",
    "appearance-theme.js",
    "games-gomoku.js",
    "games-classic.js",
    "changelog.js",
    "admin-rotation.js",
    "admin-food.js",
    "admin-reports.js",
    "admin-service-usage.js",
    "admin-daymods.js",
    "ui.js",
    "app-navigation.js",
    "app-bottom-nav.js",
    "app-menu.js",
    "app-actions.js",
    "app-boot-selftest.js",
    "games-arcade.js",
    "export.js",
    "supabase-config.js",
    "supabase-bridge.js",
    "app-rotation-sync.js",
    "app-excel-import.js",
    "app-rotation-controls.js",
    "app-admin-unlock.js",
    "app-home-boot.js",
    "app-init.js"
  ];

  try {
    if (window.__rakModuleReadinessRegistry) {
      window.__rakModuleReadinessRegistry.expected = ['module-readiness.js', 'rak-namespace.js', 'rak-audit-baseline.js', 'rak-runtime-health.js', 'rak-storage-sync-audit.js', 'rak-boot-sequence-audit.js', 'rak-export-release-audit.js', 'rak-dom-action-audit.js', 'rak-supabase-client-audit.js', 'rak-release-ops-audit.js', 'rak-appsec-privacy-audit.js', 'rak-release-gates.js', 'rak-dom-security-hardening.js', 'rak-due-diligence-progress.js', 'rak-performance-ci-audit.js', 'app.js', 'data.js'].concat(files.slice());
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

  for (const file of files) {
    await loadScript(file);
  }
  if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('boot-loader', 'ready', { source: 'dynamic-loader' });

  installPwaAndConnectivityHooks();
  installBottomNavBindings();
  try { applyBottomNavMoreHardFix(); } catch (err) { console.warn('Bottom nav Více hard-fix failed', err); }
  try { applyRakFixedBottomNavMetrics(); } catch (err) { console.warn('Bottom nav fixed metrics failed', err); }
  installDelegatedAppActions();
  try { runRakPostLoadAudits(); } catch (err) { console.warn('Post-load audit orchestrace failed', err); }

  try {
    if (typeof window.__rotaceBootHomeRefreshLate === 'function') {
      window.__rotaceBootHomeRefreshLate();
    } else if (typeof bootHomeRefresh === 'function') {
      bootHomeRefresh();
    }
  } catch (err) {
    console.warn('Post-load boot failed', err);
  }

  try {
    if (typeof runRakBootSelfTest === 'function') runRakBootSelfTest();
  } catch (err) {
    console.warn('Boot self-test selhal', err);
  }





})().catch(err => {
  console.error(err);
  alert("Nepodařilo se načíst aplikační skripty: " + (err && err.message ? err.message : err));
});
