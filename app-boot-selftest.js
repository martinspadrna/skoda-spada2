// RaK 1.2 (1.135) – boot self-test oddělený z app.js.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-boot-selftest.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}

function runRakBootSelfTest() {
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
    "DOM #rotaceStatsPanel": !!document.getElementById("rotaceStatsPanel"),
    "DOM .bottomNav": !!document.querySelector(".bottomNav"),
    "DOM #games": !!document.getElementById("games")
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
  }
} catch (err) {
  console.warn("Self-test selhal", err);
}
}
window.runRakBootSelfTest = runRakBootSelfTest;
