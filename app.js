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
  const RAK_MODULE_CACHE_VERSION = "1.5.3";

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
    "rotation-tasks.js",
    "admin-fhb-calibration.js",
    "appearance-theme.js",
    "changelog.js",
    "admin-rotation.js",
    "admin-machine-tasks.js",
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
    "rak-vacation-report.js",
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

  // Testovací development buildy zůstávají na APP_VERSION 1.5. Staré potvrzení stejné
  // app verze proto nesmí schovat nového waiting service workera z dalšího testovacího buildu.
  try {
    sessionStorage.removeItem('rotace_sw_update_notice_v1');
    sessionStorage.removeItem('rotace_sw_update_pending_v1');
    localStorage.removeItem('rotace_sw_update_suppress_v1');
  } catch (err) {}

  if (typeof installPwaAndConnectivityHooks === 'function') installPwaAndConnectivityHooks();

  // DEV fallback pro iOS/Android PWA: některé standalone prohlížeče nevyvolají updatefound
  // spolehlivě po běžném registration.update(). Explicitní cache-busted registrace + vlastní
  // waiting toast zajistí, že každá nová testovací cache opravdu nabídne Aktualizovat.
  try {
    if ('serviceWorker' in navigator && !window.__rakDevForcedUpdateBootstrap) {
      window.__rakDevForcedUpdateBootstrap = true;
      const DEV_SW_URL = 'sw.js?v=1.5.3';
      const showDevWaitingToast = (registration) => {
        try {
          if (!registration || !registration.waiting || !document.body) return false;
          if (document.querySelector('.rakUpdateToast')) return true;

          const toast = document.createElement('div');
          toast.className = 'rakUpdateToast isVisible';
          toast.setAttribute('role', 'status');
          toast.setAttribute('aria-live', 'polite');

          const main = document.createElement('div');
          main.className = 'rakUpdateToastMain';

          const badge = document.createElement('div');
          badge.className = 'rakUpdateToastBadge';
          badge.setAttribute('aria-hidden', 'true');
          badge.textContent = '⟳';

          const body = document.createElement('div');
          body.className = 'rakUpdateToastBody';
          const title = document.createElement('div');
          title.className = 'rakUpdateToastTitle';
          title.textContent = 'K dispozici je nová testovací verze';
          const version = document.createElement('div');
          version.className = 'rakUpdateToastVersion';
          version.textContent = 'Nová cache: v1.5.3';
          const text = document.createElement('div');
          text.className = 'rakUpdateToastText';
          text.textContent = 'Klikni na Aktualizovat a appka načte nejnovější testovací build.';
          body.append(title, version, text);
          main.append(badge, body);

          const action = document.createElement('button');
          action.type = 'button';
          action.className = 'rakUpdateToastAction';
          action.textContent = 'Aktualizovat';
          action.addEventListener('click', () => {
            try {
              action.disabled = true;
              action.textContent = 'Aktualizuji…';
              registration.waiting && registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            } catch (err) {}
            window.setTimeout(() => { try { window.location.reload(); } catch (err) {} }, 4000);
          });

          toast.append(main, action);
          document.body.appendChild(toast);
          return true;
        } catch (err) {
          console.warn('DEV update toast failed', err);
          return false;
        }
      };

      const bootDevUpdateCheck = async () => {
        try {
          const registration = await navigator.serviceWorker.register(DEV_SW_URL, {
            scope: './',
            updateViaCache: 'none'
          });
          const inspect = () => {
            if (showDevWaitingToast(registration)) return;
            const installing = registration.installing;
            if (installing && !installing.__rakDevWaitingHook) {
              installing.__rakDevWaitingHook = true;
              installing.addEventListener('statechange', () => {
                if (installing.state === 'installed') showDevWaitingToast(registration);
              });
            }
          };
          inspect();
          registration.addEventListener('updatefound', inspect);
          try { await registration.update(); } catch (err) {}
          inspect();
        } catch (err) {
          console.warn('DEV forced SW update check failed', err);
        }
      };

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (window.__rakDevControllerReloading) return;
        window.__rakDevControllerReloading = true;
        try { window.location.reload(); } catch (err) {}
      });
      window.setTimeout(bootDevUpdateCheck, 250);
      window.setTimeout(bootDevUpdateCheck, 2500);
    }
  } catch (err) { console.warn('DEV PWA update bootstrap failed', err); }

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
