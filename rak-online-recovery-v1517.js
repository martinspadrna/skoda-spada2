// RaK v1.5.19 – cílená oprava online bootstrapu a načtení rozpisu po regresi lazy Supabase na iOS.
(function installRakOnlineRecoveryV1519() {
  'use strict';

  const BUILD = 'v1.5.19';
  const SUPABASE_SRC = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.7/dist/umd/supabase.js';
  const SUPABASE_SRI = 'sha384-hazsLVND17GNLVdtV19te6qbFT2YuLgl8SamcF+QR5eIOC+W4dGKrUNMxU1jH1zD';
  let onlinePromise = null;
  let clientPromise = null;
  let directClient = null;

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

  function currentConfig() {
    const cfg = window.SUPABASE_CONFIG || {};
    const key = String(cfg.publishableKey || cfg.anonKey || '').trim();
    return cfg.url && key ? { url: String(cfg.url), key } : null;
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

  function getDirectClient() {
    if (directClient) return directClient;
    const cfg = currentConfig();
    if (!cfg || !window.supabase || typeof window.supabase.createClient !== 'function') return null;
    directClient = window.supabase.createClient(cfg.url, cfg.key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    return directClient;
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

  function parseRotationPayload(value) {
    if (!value) return null;
    if (value && typeof value === 'object') return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' ? parsed : null;
      } catch (_) {}
    }
    return null;
  }

  function applyRotationPayload(payload) {
    const parsed = parseRotationPayload(payload);
    if (!parsed || !parsed.months || typeof parsed.months !== 'object' || !Object.keys(parsed.months).length) {
      throw new Error('Online rozpis neobsahuje žádné měsíce.');
    }

    let next = parsed;
    try {
      if (typeof window.normalizeRotationData === 'function') next = window.normalizeRotationData(parsed);
      else if (typeof normalizeRotationData === 'function') next = normalizeRotationData(parsed);
    } catch (_) {
      next = parsed;
    }

    if (typeof app !== 'undefined' && app) {
      app.rotation = next;
      try {
        const years = typeof getAvailableYears === 'function' ? getAvailableYears(next) : [];
        if (years.length && (!app.selectedYear || !years.includes(parseInt(app.selectedYear, 10)))) {
          app.selectedYear = typeof getInitialSelectedYear === 'function' ? getInitialSelectedYear(next) : years[years.length - 1];
        }
      } catch (_) {}
    }

    try { if (typeof saveRotationData === 'function') saveRotationData(); } catch (_) {}
    return next;
  }

  async function loadRotationVerified(bridge) {
    let remote = null;
    let bridgeError = null;

    if (bridge && typeof bridge.loadRotationState === 'function') {
      try {
        remote = await bridge.loadRotationState();
        if (remote && remote.payload) {
          const applied = applyRotationPayload(remote.payload);
          return { source: 'bridge', remote, applied };
        }
      } catch (error) {
        bridgeError = error;
        console.warn('[RaK 1.5.19] Bridge rotation read failed', error);
      }
    }

    const client = getDirectClient();
    if (!client) throw (bridgeError || new Error('Supabase klient pro přímé načtení rozpisu není dostupný.'));
    const { data, error } = await client
      .from('rotation_state')
      .select('key,payload,meta,updated_at,revision')
      .eq('key', 'main')
      .maybeSingle();
    if (error) throw error;
    if (!data || !data.payload) throw new Error('Online rozpis main nebyl nalezen.');
    const applied = applyRotationPayload(data.payload);
    return { source: 'direct', remote: data, applied };
  }

  async function loadMachineSettingsVerified(bridge) {
    if (bridge && typeof bridge.loadMachineSettings === 'function') {
      try {
        const rows = await bridge.loadMachineSettings();
        if (Array.isArray(rows) && rows.length) {
          if (typeof app !== 'undefined' && app) app.machineSettingsRows = rows;
          return { source: 'bridge', rows };
        }
      } catch (error) {
        console.warn('[RaK 1.5.19] Bridge machine settings read failed', error);
      }
    }

    const client = getDirectClient();
    if (!client) return { source: 'none', rows: [] };
    const { data, error } = await client.from('machine_settings').select('*').order('category', { ascending: true }).order('machine_key', { ascending: true });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    if (typeof app !== 'undefined' && app && rows.length) app.machineSettingsRows = rows;
    return { source: 'direct', rows };
  }

  function refreshUi() {
    try { if (typeof window.forceHomeRefresh === 'function') window.forceHomeRefresh(); } catch (_) {}
    try { if (typeof window.renderRotace === 'function') window.renderRotace(); } catch (_) {}
    try { if (typeof window.renderStatsPanel === 'function') window.renderStatsPanel(); } catch (_) {}
    try { if (typeof window.updateFoodTile === 'function') window.updateFoodTile(); } catch (_) {}
    try {
      if (navigator.onLine) document.documentElement.dataset.connection = 'online';
    } catch (_) {}
  }

  async function startOnline() {
    if (onlinePromise) return onlinePromise;
    onlinePromise = (async () => {
      await waitFor(() => currentConfig(), 'Supabase konfiguraci', 15000);
      await ensureSupabaseClient();

      await waitFor(() => typeof window.syncRotationFromSupabase === 'function' ? window.syncRotationFromSupabase : null, 'synchronizaci Rozpisů', 20000);
      const ensureBridge = await waitFor(
        () => typeof window.ensureRakSupabaseBridgeLoaded === 'function' ? window.ensureRakSupabaseBridgeLoaded : null,
        'loader Supabase bridge',
        15000
      );
      const bridge = await ensureBridge();
      if (!bridge) throw new Error('Supabase bridge není dostupný.');

      if (typeof bridge.init === 'function') await bridge.init();

      const rotationResult = await loadRotationVerified(bridge);
      const settingsResult = await loadMachineSettingsVerified(bridge);

      // Standardní synchronizaci necháme proběhnout ještě jednou kvůli interním timestampům,
      // cache a stavu Online synchronizováno. Data už ale nejsou závislá jen na ní.
      try { await window.syncRotationFromSupabase('discard-draft'); } catch (_) {}
      try { if (typeof bridge.bindRealtimeSubscriptions === 'function') bridge.bindRealtimeSubscriptions(); } catch (_) {}

      window.RAK_RECOVERY_STATUS = {
        ok: true,
        build: BUILD,
        rotationSource: rotationResult.source,
        rotationRevision: Number(rotationResult.remote && rotationResult.remote.revision || 0) || 0,
        rotationMonths: Object.keys(rotationResult.applied && rotationResult.applied.months || {}).length,
        machineSettingsSource: settingsResult.source,
        machineSettingsRows: Array.isArray(settingsResult.rows) ? settingsResult.rows.length : 0,
        at: new Date().toISOString()
      };

      refreshUi();
      return bridge;
    })().catch((error) => {
      onlinePromise = null;
      window.RAK_RECOVERY_STATUS = {
        ok: false,
        build: BUILD,
        error: String(error && (error.message || error.code) || error || 'unknown'),
        at: new Date().toISOString()
      };
      console.warn('[RaK 1.5.19] Online recovery failed', error);
      throw error;
    });
    return onlinePromise;
  }

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
  setTimeout(() => void startOnline().then(refreshUi).catch(() => {}), 1800);
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

  [500, 1200, 2500].forEach((delay) => setTimeout(fixAboutBuildLabels, delay));
})();
