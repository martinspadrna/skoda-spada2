// RaK 1.5.16 – boot/load shell aplikace.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app.js', 'loaded', { source: 'index' }); } catch (err) {}

// Hry jsou z RaK odstraněné. CSS je schová před prvním paintem a tady odstraníme starý DOM,
// bez trvalého MutationObserveru, který dříve zbytečně běžel po celou dobu aplikace.
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
  removeGames();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', removeGames, { once: true });
})();

(async () => {
  const RAK_MODULE_CACHE_VERSION = "1.5.16";
  const RAK_DEV_UPDATE_BUILD = "v1.5.16";
  window.RAK_PWA_BUILD = RAK_DEV_UPDATE_BUILD;
  window.RAK_MODULE_CACHE_VERSION = RAK_MODULE_CACHE_VERSION;

  const criticalFiles = [
    "supabase-config.js",
    "rak-user-profile.js",
    "rak-auth-gate.js",
    "rak-account-access.js",
    "rak-login-splash.js",
    "rak-login-fix.js",
    "rak-login-life.js"
  ];

  // Seznam zůstává kompletní i kvůli browser-smoke inventáři. V běžném runtime se
  // těžké menu/admin/QR/audit soubory odfiltrují níže a stáhnou až při skutečné potřebě.
  const deferredFiles = [
    "rak-external-deps.js",
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
    "rotation-tasks.js",
    "admin-fhb-calibration.js",
    "brusy-fhb-correction.js",
    "brusy-fhb-v157.js",
    "appearance-theme.js",
    "changelog.js",
    "admin-machine-tasks.js",
    "admin-food.js",
    "admin-reports.js",
    "admin-service-usage.js",
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
    "rak-vacation-report.js",
    "rak-shift-report.js",
    "rak-shift-report-entry-fix.js",
    "rak-shift-report-share.js",
    "rak-shift-report-history.js",
    "rak-maintenance-v1516.js"
  ];

  const lazyMenuFiles = [
    "app-menu.js",
    "rak-admin-menu-fix.js"
  ];

  // Admin editory a reportové moduly běžný uživatel při startu nepotřebuje.
  // Stáhnou se až po kliknutí na Administraci; funkční data pro Home/Rotace zůstávají v core modulech.
  const lazyAdminFiles = [
    "admin-rotation.js",
    "admin-daymods.js",
    "admin-machine-tasks.js",
    "admin-food.js",
    "admin-reports.js",
    "admin-service-usage.js"
  ];

  // qr.js je z velké části sada vložených SVG kódů. Načte se až při prvním
  // dvojkliku/otevření QR konkrétního člověka, ne při každém startu aplikace.
  const lazyQrFiles = ["qr.js"];

  // Diagnostické audity nejsou potřeba k prvnímu interaktivnímu paintu. Načtou se
  // po startu v idle čase a poté se spustí stejně jako dřív.
  const idleAuditFiles = ["app-health-audits.js", "app-postload-audits.js"];

  const eagerDeferredFiles = deferredFiles.filter((file) => !lazyMenuFiles.includes(file) && !lazyAdminFiles.includes(file) && !lazyQrFiles.includes(file) && !idleAuditFiles.includes(file));
  const bootFiles = criticalFiles.concat(eagerDeferredFiles);

  try {
    if (window.__rakModuleReadinessRegistry) {
      window.__rakModuleReadinessRegistry.expected = ['module-readiness.js', 'rak-namespace.js', 'rak-audit-baseline.js', 'rak-runtime-health.js', 'rak-storage-sync-audit.js', 'rak-boot-sequence-audit.js', 'rak-export-release-audit.js', 'rak-dom-action-audit.js', 'rak-supabase-client-audit.js', 'rak-release-ops-audit.js', 'rak-appsec-privacy-audit.js', 'rak-release-gates.js', 'rak-dom-security-hardening.js', 'rak-due-diligence-progress.js', 'rak-performance-ci-audit.js', 'app.js', 'data.js'].concat(bootFiles.slice());
      if (typeof initialRotationData !== 'undefined' && typeof window.rakMarkModuleReady === 'function') {
        window.rakMarkModuleReady('data.js', 'loaded', { source: 'index-preload' });
      }
    }
  } catch (err) {}

  const scriptPromises = new Map();
  const loadScript = (src) => {
    const key = String(src || '').trim();
    if (!key) return Promise.resolve();
    if (scriptPromises.has(key)) return scriptPromises.get(key);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady(key, 'loading', { source: 'dynamic-loader' });
      script.src = key + "?v=" + encodeURIComponent(RAK_MODULE_CACHE_VERSION);
      script.async = false;
      script.onload = () => {
        const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady(key, 'loaded', { source: 'dynamic-loader', durationMs: ended - started });
        resolve();
      };
      script.onerror = () => {
        const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const error = new Error(`Nepodařilo se načíst ${key}`);
        if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady(key, 'error', { source: 'dynamic-loader', durationMs: ended - started, error: error.message });
        reject(error);
      };
      document.head.appendChild(script);
    });
    scriptPromises.set(key, promise);
    return promise;
  };

  let lazyMenuPromise = null;
  const lazyOpenAppMenu = function lazyOpenAppMenu(route) {
    const requestedRoute = String(route || 'menu');
    return window.ensureRakMenuModulesLoaded().then(() => {
      const realOpen = window.openAppMenu;
      if (typeof realOpen === 'function' && realOpen !== lazyOpenAppMenu) return realOpen(requestedRoute);
      return false;
    });
  };
  const lazyToggleAppMenu = function lazyToggleAppMenu() {
    return window.ensureRakMenuModulesLoaded().then(() => {
      const realToggle = window.toggleAppMenu;
      if (typeof realToggle === 'function' && realToggle !== lazyToggleAppMenu) return realToggle();
      const realOpen = window.openAppMenu;
      if (typeof realOpen === 'function' && realOpen !== lazyOpenAppMenu) return realOpen('menu');
      return false;
    });
  };

  window.openAppMenu = lazyOpenAppMenu;
  window.toggleAppMenu = lazyToggleAppMenu;
  window.ensureRakMenuModulesLoaded = function ensureRakMenuModulesLoaded() {
    if (lazyMenuPromise) return lazyMenuPromise;
    lazyMenuPromise = (async () => {
      for (const file of lazyMenuFiles) await loadScript(file);
      try {
        if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('lazy-menu-modules', 'ready', { source: 'menu-open' });
      } catch (err) {}
      return true;
    })().catch((err) => {
      lazyMenuPromise = null;
      throw err;
    });
    return lazyMenuPromise;
  };
  window.RAK_LAZY_MENU_FILES = lazyMenuFiles.slice();

  let lazyAdminPromise = null;
  window.ensureRakAdminModulesLoaded = function ensureRakAdminModulesLoaded() {
    if (lazyAdminPromise) return lazyAdminPromise;
    lazyAdminPromise = (async () => {
      for (const file of lazyAdminFiles) await loadScript(file);
      try {
        if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('lazy-admin-modules', 'ready', { source: 'admin-open' });
      } catch (err) {}
      return true;
    })().catch((err) => {
      lazyAdminPromise = null;
      throw err;
    });
    return lazyAdminPromise;
  };
  window.RAK_LAZY_ADMIN_FILES = lazyAdminFiles.slice();

  let lazyQrPromise = null;
  window.ensureRakQrModuleLoaded = function ensureRakQrModuleLoaded() {
    if (lazyQrPromise) return lazyQrPromise;
    lazyQrPromise = (async () => {
      for (const file of lazyQrFiles) await loadScript(file);
      try {
        if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('lazy-qr-module', 'ready', { source: 'person-qr-open' });
      } catch (err) {}
      return true;
    })().catch((err) => {
      lazyQrPromise = null;
      throw err;
    });
    return lazyQrPromise;
  };
  window.RAK_LAZY_QR_FILES = lazyQrFiles.slice();

  const lazyShowPersonQrModal = function lazyShowPersonQrModal(name) {
    const requestedName = name;
    return window.ensureRakQrModuleLoaded().then(() => {
      const realShow = window.showPersonQrModal;
      if (typeof realShow === 'function' && realShow !== lazyShowPersonQrModal) return realShow(requestedName);
      throw new Error('QR modul se načetl bez funkce pro zobrazení QR.');
    }).catch((err) => {
      console.error('RaK QR lazy load failed', err);
      try { if (typeof alert === 'function') alert('QR kód se nepodařilo načíst. Zkus to znovu.'); } catch (_) {}
      return false;
    });
  };
  window.showPersonQrModal = lazyShowPersonQrModal;

  let idleAuditPromise = null;
  window.ensureRakIdleAuditsLoaded = function ensureRakIdleAuditsLoaded() {
    if (idleAuditPromise) return idleAuditPromise;
    idleAuditPromise = (async () => {
      for (const file of idleAuditFiles) await loadScript(file);
      return true;
    })().catch((err) => {
      idleAuditPromise = null;
      throw err;
    });
    return idleAuditPromise;
  };
  const scheduleIdleAudits = () => {
    const run = () => {
      void window.ensureRakIdleAuditsLoaded().then(() => {
        try { if (typeof window.runRakPostLoadAudits === 'function') window.runRakPostLoadAudits(); else if (typeof runRakPostLoadAudits === 'function') runRakPostLoadAudits(); } catch (err) { console.warn('Post-load audit orchestrace failed', err); }
      }).catch((err) => console.warn('Idle audit load failed', err));
    };
    if (typeof requestIdleCallback === 'function') requestIdleCallback(run, { timeout: 2500 });
    else setTimeout(run, 1200);
  };

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
  // Těžké menu, admin editory, QR data a diagnostické audity se z této dávky vynechají.
  await Promise.all(eagerDeferredFiles.map(loadScript));

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

  // Starý suppression marker smažeme jen jednou pro konkrétní build.
  // Po kliknutí na Aktualizovat už při reloadu stav znovu nemažeme, takže nevznikne update smyčka.
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
  scheduleIdleAudits();

  try {
    if (typeof window.__rotaceBootHomeRefreshLate === 'function') window.__rotaceBootHomeRefreshLate();
    else if (typeof bootHomeRefresh === 'function') bootHomeRefresh();
  } catch (err) { console.warn('Post-load boot failed', err); }

  try { if (typeof runRakBootSelfTest === 'function') window.runRakBootSelfTest ? window.runRakBootSelfTest() : runRakBootSelfTest(); } catch (err) { console.warn('Boot self-test selhal', err); }
})().catch(err => {
  console.error(err);
  alert("Nepodařilo se načíst aplikační skripty: " + (err && err.message ? err.message : String(err)));
});