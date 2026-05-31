// RaK 1.2 (1.34) – startovací orchestrátor aplikace.
// RaK 1.2 (1.34) – online sync je v app-rotation-sync.js, volby Rotace v app-rotation-controls.js.

function initAppInitBindings() {
  if (typeof installRakRotationControlBindings === 'function') {
    installRakRotationControlBindings();
  } else {
    console.warn('Startovací vazby Rotace nejsou dostupné');
  }
  /* INITIAL */
  const tabNames = document.getElementById("tabNames");
  const tabMonths = document.getElementById("tabMonths");
  if (tabNames) tabNames.style.outline = "none";
  if (tabMonths) tabMonths.style.outline = "3px solid #7CFF7C";
  if (typeof setRotaceView === "function") setRotaceView("names");
  if (typeof refreshInitialUI === "function") refreshInitialUI();

  if (typeof installRakHomeBootSequence === "function") {
    installRakHomeBootSequence();
  } else {
    console.warn('Home boot sekvence není dostupná');
  }
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.init === 'function') {
    try {
      const bridgeInit = window.RotationSupabaseBridge.init();
      if (bridgeInit && typeof bridgeInit.then === 'function') {
        bridgeInit.finally(() => {
          if (typeof forceHomeRefresh === 'function') forceHomeRefresh();
        });
      }
    } catch (err) { console.warn('Supabase bridge init failed', err); }
  }
  if (typeof syncRotationFromSupabase === 'function') {
    void syncRotationFromSupabase(false);
  } else {
    console.warn('Online synchronizace rozpisů není dostupná');
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAppInitBindings, { once: true });
} else {
  initAppInitBindings();
}

