// RaK v1.5.17 – cílená oprava online bootstrapu po regresi lazy Supabase na iOS.
(function installRakOnlineRecoveryV1517() {
  'use strict';

  const BUILD = 'v1.5.17';
  const SUPABASE_SRC = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.7/dist/umd/supabase.js';
  const SUPABASE_SRI = 'sha384-hazsLVND17GNLVdtV19te6qbFT2YuLgl8SamcF+QR5eIOC+W4dGKrUNMxU1jH1zD';
  let onlinePromise = null;
  let clientPromise = null;

  window.RAK_RECOVERY_BUILD = BUILD;
  window.RAK_PWA_BUILD = BUILD;
  window.RAK_DEV_BUILD = BUILD;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function waitFor(getter, label, timeoutMs) {
    const started = Date.now();
    while (Date.now() - started < (timeoutMs || 15000)) {
      try {
        const value = getter();
        if (value) return value;
      } catch (_) {}
      await sleep(60);
    }
    throw new Error('Timeout při čekání na ' + label + '.');
  }

  function ensureSupabaseClient() {
    if (window.supabase && typeof window.supabase.createClient === 'function') return Promise.resolve(window.supabase);
    if (clientPromise) return clientPromise;
    clientPromise = new Promise((resolve, reject) => {
      const existing = Array.from(document.scripts || []).find((script) => String(script.src || '').includes('@supabase/supabase-js@2.110.7'));
      if (existing) {
        existing.addEventListener('load', () => resolve(window.supabase), { once: true });
        existing.addEventListener('error', () => reject(new Error('Supabase klient se nenačetl.')), { once: true });
        setTimeout(() => {
          if (window.supabase && typeof window.supabase.createClient === 'function') resolve(window.supabase);
        }, 0);
        return;
      }
      const script = document.createElement('script');
      script.src = SUPABASE_SRC;
      script.integrity = SUPABASE_SRI;
      script.crossOrigin = 'anonymous';
      script.async = false;
      script.onload = () => {
        if (window.supabase && typeof window.supabase.createClient === 'function') resolve(window.supabase);
        else reject(new Error('Supabase klient nemá očekávané API.'));
      };
      script.onerror = () => reject(new Error('Supabase klient se nepodařilo stáhnout.'));
      document.head.appendChild(script);
    }).catch((error) => {
      clientPromise = null;
      throw error;
    });
    return clientPromise;
  }

  function clearStaleUpdateMarkers() {
    try {
      const marker = 'rak_online_recovery_build';
      if (localStorage.getItem(marker) === BUILD) return;
      sessionStorage.removeItem('rotace_sw_update_notice_v1');
      sessionStorage.removeItem('rotace_sw_update_pending_v1');
      localStorage.removeItem('rotace_sw_update_suppress_v1');
      localStorage.setItem(marker, BUILD);
    } catch (_) {}
  }

  function refreshUi() {
    try { if (typeof window.forceHomeRefresh === 'function') window.forceHomeRefresh(); } catch (_) {}
    try { if (typeof window.renderRotace === 'function') window.renderRotace(); } catch (_) {}
    try { if (typeof window.renderStatsPanel === 'function') window.renderStatsPanel(); } catch (_) {}
    try {
      if (navigator.onLine) document.documentElement.dataset.connection = 'online';
    } catch (_) {}
  }

  async function startOnline() {
    if (onlinePromise) return onlinePromise;
    onlinePromise = (async () => {
      await waitFor(() => {
        const cfg = window.SUPABASE_CONFIG;
        return cfg && cfg.url && cfg.anonKey ? cfg : null;
      }, 'Supabase konfiguraci', 15000);

      await ensureSupabaseClient();

      // Počkáme, až je hotová základní aplikace a online synchronizační helper.
      // Tím odstraníme závod, kdy se bridge dříve spustil před core/app-rotation-sync.
      await waitFor(() => typeof window.syncRotationFromSupabase === 'function' ? window.syncRotationFromSupabase : null, 'synchronizaci Rozpisů', 20000);

      const ensureBridge = await waitFor(
        () => typeof window.ensureRakSupabaseBridgeLoaded === 'function' ? window.ensureRakSupabaseBridgeLoaded : null,
        'loader Supabase bridge',
        15000
      );
      const bridge = await ensureBridge();
      if (!bridge) throw new Error('Supabase bridge není dostupný.');

      if (typeof bridge.init === 'function') await bridge.init();

      // Machine settings obsahují mimo jiné data pro Kantýnu/Jídelnu. Nečekáme jen
      // na background refresh – na iOS je načteme explicitně před finálním renderem.
      if (typeof bridge.loadMachineSettings === 'function') {
        try {
          const rows = await bridge.loadMachineSettings();
          if (Array.isArray(rows) && typeof app !== 'undefined' && app) app.machineSettingsRows = rows;
        } catch (error) {
          console.warn('[RaK 1.5.17] Machine settings recovery failed', error);
        }
      }

      await window.syncRotationFromSupabase(false);
      try { if (typeof bridge.bindRealtimeSubscriptions === 'function') bridge.bindRealtimeSubscriptions(); } catch (_) {}
      refreshUi();
      return bridge;
    })().catch((error) => {
      onlinePromise = null;
      console.warn('[RaK 1.5.17] Online recovery failed', error);
      throw error;
    });
    return onlinePromise;
  }

  // Přepíšeme pouze vstupní online promise. Lazy loader samotného bridge necháváme
  // beze změny; oprava vynucuje správné pořadí konfigurace → klient → core/sync → bridge.
  window.ensureRakSupabaseOnlineStarted = startOnline;

  function fixAboutBuildLabels() {
    try {
      const nodes = Array.from(document.querySelectorAll('.appMenuText, [data-rak-dev-build-info], #rakDevBuildInfo'));
      const buildNodes = nodes.filter((node) => /Testovací build:/i.test(String(node.textContent || '')));
      buildNodes.forEach((node, index) => {
        if (index === buildNodes.length - 1) node.textContent = 'Testovací build: ' + BUILD;
        else node.remove();
      });
    } catch (_) {}
  }

  clearStaleUpdateMarkers();
  setTimeout(() => void startOnline().catch(() => {}), 0);
  setTimeout(() => void startOnline().catch(() => {}), 600);
  window.addEventListener('online', () => void startOnline().then(refreshUi).catch(() => {}));
  window.addEventListener('pageshow', () => {
    window.RAK_PWA_BUILD = BUILD;
    window.RAK_DEV_BUILD = BUILD;
    void startOnline().then(refreshUi).catch(() => {});
    setTimeout(fixAboutBuildLabels, 250);
  });
  document.addEventListener('click', (event) => {
    const more = event.target && event.target.closest ? event.target.closest('[data-action="more"], [data-page="more"], [data-action="menu"], [data-action="app-menu"]') : null;
    if (more) setTimeout(fixAboutBuildLabels, 350);
  }, true);

  // Menu je lazy; krátké opakování po startu odstraní starý v1.5.11 řádek i když
  // byl vložen až po otevření sekce Více.
  [500, 1200, 2500].forEach((delay) => setTimeout(fixAboutBuildLabels, delay));
})();
