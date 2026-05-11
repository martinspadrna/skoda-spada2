// v.1(313) – PWA/service worker, online refresh hooks, self-test po načtení, Supabase bridge.
(function setupErrorCapture() {
  const LOG_KEY = "rotace_err_log_v1";
  const MAX = 50;
  const readLog = () => {
    try { return JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); }
    catch (e) { return []; }
  };
  const writeLog = (arr) => {
    try { localStorage.setItem(LOG_KEY, JSON.stringify(arr.slice(-MAX))); } catch (e) {}
  };
  const push = (entry) => {
    const log = readLog();
    log.push(Object.assign({ ts: new Date().toISOString(), ver: (window.APP_VERSION || "?") }, entry));
    writeLog(log);
  };
  window.addEventListener("error", (ev) => {
    push({
      type: "error",
      msg: String(ev.message || ev.error || ""),
      src: String(ev.filename || ""),
      line: ev.lineno || 0,
      col: ev.colno || 0,
      stack: ev.error && ev.error.stack ? String(ev.error.stack).slice(0, 2000) : ""
    });
  });
  window.addEventListener("unhandledrejection", (ev) => {
    const r = ev.reason;
    push({
      type: "promise",
      msg: r && r.message ? String(r.message) : String(r),
      stack: r && r.stack ? String(r.stack).slice(0, 2000) : ""
    });
  });
  window.__rotaceDiag = function () {
    const log = readLog();
    const info = {
      version: window.APP_VERSION || "?",
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      time: new Date().toISOString(),
      errors: log
    };
    console.log("[Rotace] Diagnostika:", info);
    try {
      navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(info, null, 2));
    } catch (e) {}
    return info;
  };
  window.__rotaceClearLog = function () {
    writeLog([]);
    console.log("[Rotace] Log chyb vymazán.");
  };
})();

(async () => {
  const files = [
    "core.js",
    "qr.js",
    "payroll.js",
    "brusy.js",
    "stats.js",
    "dashboard.js",
    "soustruhy.js",
    "rotace.js",
    "ui.js",
    "export.js",
    "supabase-config.js",
    "supabase-bridge.js",
    "app-init.js"
  ];

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Nepodařilo se načíst ${src}`));
    document.head.appendChild(script);
  });

  for (const file of files) {
    await loadScript(file);
  }

  installPwaAndConnectivityHooks();

  try {
    if (typeof window.__rotaceBootHomeRefreshLate === 'function') {
      window.__rotaceBootHomeRefreshLate();
    } else if (typeof bootHomeRefresh === 'function') {
      bootHomeRefresh();
    }
  } catch (err) {
    console.warn('Post-load boot failed', err);
  }

  // Self-test – ohlásí chybějící klíčové části (do konzole + do logu).
  try {
    const required = {
      "globální app": typeof app !== "undefined" && app,
      "app.rotation": typeof app !== "undefined" && app && app.rotation && app.rotation.months,
      "renderRotace": typeof renderRotace === "function",
      "renderStatsPanel": typeof renderStatsPanel === "function",
      "saveRotationData": typeof saveRotationData === "function",
      "DOM #home": !!document.getElementById("home"),
      "DOM #rotace": !!document.getElementById("rotace"),
      "DOM #stats": !!document.getElementById("stats")
    };
    const missing = Object.entries(required).filter(([_, v]) => !v).map(([k]) => k);
    if (missing.length) {
      console.warn("[Rotace] Self-test: chybí", missing);
      try {
        const log = JSON.parse(localStorage.getItem("rotace_err_log_v1") || "[]");
        log.push({
          ts: new Date().toISOString(),
          ver: window.APP_VERSION || "?",
          type: "selftest",
          missing
        });
        localStorage.setItem("rotace_err_log_v1", JSON.stringify(log.slice(-50)));
      } catch (e) {}
    } else {
      console.log("[Rotace] Self-test OK –", window.APP_VERSION);
    }
  } catch (err) {
    console.warn("Self-test selhal", err);
  }


function installPwaAndConnectivityHooks() {
  const setConnectionFlag = () => {
    try {
      document.documentElement.dataset.connection = navigator.onLine ? 'online' : 'offline';
    } catch (err) {}
  };

  const LIVE_REFRESH_INTERVAL_MS = 4 * 60 * 1000;
  const STALE_REFRESH_GUARD_MS = 15 * 1000;
  const LIVE_CHANNEL_NAME = 'rotace-live-updates';
  const tabId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let liveRefreshPromise = null;
  let lastLiveRefreshAt = 0;
  let liveRefreshTimer = null;
  let liveChannel = null;

  const runLiveRefresh = async (reason, opts = {}) => {
    const force = !!(opts && opts.force);
    if (!navigator.onLine && !force) return 'offline';
    if (liveRefreshPromise && !force) return liveRefreshPromise;
    const now = Date.now();
    if (!force && now - lastLiveRefreshAt < STALE_REFRESH_GUARD_MS && reason !== 'manual') {
      return 'throttled';
    }

    liveRefreshPromise = (async () => {
      try {
        if (navigator.onLine && typeof refreshPublicData === 'function') {
          await refreshPublicData();
        }
        if (navigator.onLine && typeof syncRotationFromSupabase === 'function') {
          await syncRotationFromSupabase(false);
        }
        if (typeof forceHomeRefresh === 'function') forceHomeRefresh();
        if (typeof renderRotace === 'function') renderRotace();
        if (typeof renderStatsPanel === 'function') renderStatsPanel();
        return reason || 'done';
      } catch (err) {
        console.warn('Live refresh hook failed', err);
        return 'failed';
      } finally {
        lastLiveRefreshAt = Date.now();
        liveRefreshPromise = null;
      }
    })();

    return liveRefreshPromise;
  };

  const signalStateChange = (reason) => {
    const payload = {
      type: 'state-change',
      reason: reason || 'state-change',
      tabId,
      ts: Date.now()
    };
    try {
      localStorage.setItem('rotace_live_signal_v1', JSON.stringify(payload));
    } catch (err) {}
    try {
      if (liveChannel) liveChannel.postMessage(payload);
    } catch (err) {}
  };

  setConnectionFlag();

  window.__rotaceTriggerLiveRefresh = runLiveRefresh;
  window.__rotaceRefreshAfterOnline = runLiveRefresh;
  window.__rotaceSignalStateChange = signalStateChange;

  if ('BroadcastChannel' in window) {
    try {
      liveChannel = new BroadcastChannel(LIVE_CHANNEL_NAME);
      liveChannel.onmessage = (event) => {
        const data = event && event.data ? event.data : null;
        if (!data || data.tabId === tabId) return;
        if (data.type === 'state-change' || data.type === 'refresh') {
          void runLiveRefresh(data.reason || 'broadcast', { force: true });
        }
      };
    } catch (err) {
      console.warn('BroadcastChannel failed', err);
      liveChannel = null;
    }
  }

  window.addEventListener('online', () => {
    setConnectionFlag();
    void runLiveRefresh('online', { force: true });
  });
  window.addEventListener('offline', () => {
    setConnectionFlag();
    if (typeof updateDashboard === 'function') updateDashboard();
  });
  window.addEventListener('pageshow', () => {
    setConnectionFlag();
    if (navigator.onLine) void runLiveRefresh('pageshow');
  });
  window.addEventListener('focus', () => {
    if (!document.hidden && navigator.onLine) void runLiveRefresh('focus');
  });
  window.addEventListener('visibilitychange', () => {
    setConnectionFlag();
    if (!document.hidden && navigator.onLine) void runLiveRefresh('visible');
  });
  window.addEventListener('storage', (event) => {
    if (!event || !event.key) return;
    if (event.key === 'rotationBuild' || event.key === 'rotace_state_v1' || event.key === 'adminUnlocked' || event.key === 'rotace_live_signal_v1') {
      void runLiveRefresh('storage', { force: true });
      if (typeof forceHomeRefresh === 'function') forceHomeRefresh();
      if (typeof renderRotace === 'function') renderRotace();
      if (typeof renderStatsPanel === 'function') renderStatsPanel();
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { scope: './' }).then((registration) => {
      if (registration && registration.update) {
        registration.update().catch(() => {});
      }
    }).catch((err) => {
      console.warn('Service worker registration failed', err);
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      const data = event && event.data ? event.data : null;
      if (!data) return;
      if (data.type === 'sw-activated' || data.type === 'refresh-ui') {
        void runLiveRefresh(data.reason || data.type || 'sw-message', { force: true });
      }
    });
  }

  liveRefreshTimer = window.setInterval(() => {
    if (!document.hidden && navigator.onLine) void runLiveRefresh('interval');
  }, LIVE_REFRESH_INTERVAL_MS);

  window.addEventListener('beforeunload', () => {
    if (liveRefreshTimer) window.clearInterval(liveRefreshTimer);
    try { if (liveChannel) liveChannel.close(); } catch (err) {}
  });
}


})().catch(err => {
  console.error(err);
  alert("Nepodařilo se načíst aplikační skripty: " + (err && err.message ? err.message : err));
});
