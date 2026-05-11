// v.1(294) – robustness: globální error handler, ring buffer chyb, self-test po načtení, Supabase bridge.
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
    "stats.js",
    "dashboard.js",
    "soustruhy.js",
    "brusy.js",
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
})().catch(err => {
  console.error(err);
  alert("Nepodařilo se načíst aplikační skripty: " + (err && err.message ? err.message : err));
});
