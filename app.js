// RaK 1.2 (1.155) – boot/load shell aplikace.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app.js', 'loaded', { source: 'index' }); } catch (err) {}

// DEV: Hry jsou v této vývojové větvi úplně skryté ještě před prvním paintem.
(function disableGamesSurface() {
  const removeGames = () => {
    try {
      const gamesPage = document.getElementById('games');
      if (gamesPage) gamesPage.remove();
      document.querySelectorAll('[data-action="games"], [data-page="games"], .bottomNavGamesBtn').forEach((el) => el.remove());
      document.querySelectorAll('link[href*="styles-games.css"]').forEach((el) => el.remove());
      document.body && document.body.classList.remove('gamesOpen', 'tttOpen');
    } catch (err) {}
  };
  try {
    const style = document.createElement('style');
    style.id = 'rak-dev-no-games-critical';
    style.textContent = '#games,[data-action="games"],[data-page="games"],.bottomNavGamesBtn,link[href*="styles-games.css"]{display:none!important;}';
    document.head.appendChild(style);
  } catch (err) {}
  removeGames();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', removeGames, { once: true });
  else removeGames();
  try {
    const observer = new MutationObserver(() => removeGames());
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.__rakDevGamesObserver = observer;
  } catch (err) {}
})();

(async () => {
  const RAK_MODULE_CACHE_VERSION = "1.2.354";

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
    "appearance-theme.js",
    "changelog.js",
    "admin-rotation.js",
    "admin-food.js",
    "admin-reports.js",
    "admin-service-usage.js",
    "admin-daymods.js",
    "ui.js",
    "rak-profile-settings-fix.js",
    "app-navigation.js",
    "app-bottom-nav.js",
    "app-menu.js",
    "rak-admin-menu-fix.js",
    "app-actions.js",
    "app-boot-selftest.js",
    "export.js",
    "supabase-bridge.js",
    "app-rotation-sync.js",
    "app-excel-import.js",
    "app-rotation-controls.js",
    "app-admin-unlock.js",
    "app-home-boot.js",
    "app-init.js",
    "rak-shift-report.js",
    "rak-shift-report-entry-fix.js",
    "rak-shift-report-share.js"
  ];

  const files = criticalFiles.concat(deferredFiles);

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

  // Síťově nezdržuj start sekvenčním stahováním desítek nezávislých modulů.
  // `async = false` v loadScript přitom zachovává jejich pořadí spuštění.
  await Promise.all(deferredFiles.map(loadScript));

  // core.js vytváří runtime `app` až v odložené fázi. Profil načtený na loginu proto
  // znovu přeneseme do runtime po načtení celé aplikace, jinak UI/admin vidí prázdný účet.
  try {
    const storedProfile = typeof window.rakUserProfileGet === 'function' ? window.rakUserProfileGet() : null;
    if (storedProfile && typeof window.rakUserProfileApplyToRuntime === 'function') {
      window.rakUserProfileApplyToRuntime(storedProfile);
    }
    if (typeof window.rakUserProfileRefreshMenu === 'function') window.rakUserProfileRefreshMenu();
  } catch (err) { console.warn('RaK user profile runtime restore failed', err); }

  if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('boot-loader', 'ready', { source: 'dynamic-loader' });

  if (typeof installPwaAndConnectivityHooks === 'function') installPwaAndConnectivityHooks();
  if (typeof installBottomNavBindings === 'function') installBottomNavBindings();
  try { if (typeof applyBottomNavMoreHardFix === 'function') applyBottomNavMoreHardFix(); } catch (err) { console.warn('Bottom nav Více hard-fix failed', err); }
  try { if (typeof applyRakFixedBottomNavMetrics === 'function') applyRakFixedBottomNavMetrics(); } catch (err) { console.warn('Bottom nav fixed metrics failed', err); }
  if (typeof installDelegatedAppActions === 'function') installDelegatedAppActions();
  try { if (typeof runRakPostLoadAudits === 'function') runRakPostLoadAudits(); } catch (err) { console.warn('Post-load audit orchestrace failed', err); }

  try {
    if (typeof window.__rotaceBootHomeRefreshLate === 'function') window.__rotaceBootHomeRefreshLate();
    else if (typeof bootHomeRefresh === 'function') bootHomeRefresh();
  } catch (err) { console.warn('Post-load boot failed', err); }

  try { if (typeof runRakBootSelfTest === 'function') runRakBootSelfTest(); } catch (err) { console.warn('Boot self-test selhal', err); }
})().catch(err => {
  console.error(err);
  alert("Nepodařilo se načíst aplikační skripty: " + (err && err.message ? err.message : err));
});
