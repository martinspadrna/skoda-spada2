// RaK 1.2 (1.133) – home boot sekvence oddělená ze startovacích vazeb aplikace.
function runRakHomeBootRefresh() {
  const activePage = document.querySelector(".page.active")?.id || "";
  if ((typeof app !== "undefined" && app.homeBootSuppressed && activePage !== "home") || window.__rotaceManualNavLocked || (window.__rotaceHomeBootLocked && activePage !== "home") || (window.__rotaceUserNavigated && activePage !== 'home')) {
    return;
  }
  try {
    if (typeof showPage === "function") showPage("home");
    if (typeof scheduleHomeRefresh === "function") {
      scheduleHomeRefresh();
    } else if (typeof updateDashboard === "function") {
      updateDashboard();
    }
    if (typeof updateFoodTile === "function") updateFoodTile();
    if (typeof updateEportalTile === "function") updateEportalTile();
  } catch (err) {
    console.warn("Initial home boot failed", err);
  }

  const runHomeRefresh = () => {
    try {
      if (typeof forceHomeRefresh === "function") {
        forceHomeRefresh();
      } else if (typeof refreshHomeScreen === "function") {
        refreshHomeScreen();
      } else if (typeof updateDashboard === "function") {
        updateDashboard();
        if (typeof updateFoodTile === "function") updateFoodTile();
        if (typeof updateEportalTile === "function") updateEportalTile();
      }
    } catch (err) {
      console.warn("Home refresh retry failed", err);
    }
  };

  const keepPingingHome = () => {
    let tries = 0;
    const tick = () => {
      tries += 1;
      runHomeRefresh();
      const stillBlank = typeof homeLooksUnpainted === "function" ? homeLooksUnpainted() : false;
      if (stillBlank && tries < 18) {
        setTimeout(tick, 120);
      }
    };
    tick();
  };

  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(runHomeRefresh);
    requestAnimationFrame(() => requestAnimationFrame(runHomeRefresh));
  }
  setTimeout(runHomeRefresh, 80);
  setTimeout(runHomeRefresh, 220);
  setTimeout(runHomeRefresh, 520);
  setTimeout(runHomeRefresh, 980);
  setTimeout(keepPingingHome, 60);
}

function runRakLateHomeBootRefresh() {
  try {
    const activePage = document.querySelector(".page.active")?.id || "";
    if (window.__rotaceManualNavLocked || (window.__rotaceHomeBootLocked && activePage !== "home") || (typeof app !== "undefined" && app.homeBootSuppressed && activePage !== "home") || (window.__rotaceUserNavigated && activePage !== 'home')) {
      return;
    }
    if (typeof showPage === "function") showPage("home");
    if (typeof refreshHomeScreen === "function") refreshHomeScreen();
    else if (typeof updateDashboard === "function") updateDashboard();
    if (typeof updateFoodTile === "function") updateFoodTile();
    if (typeof updateEportalTile === "function") updateEportalTile();
  } catch (err) {
    console.warn('Late home boot failed', err);
  }
}

function installRakHomeBootSequence() {
  if (window.__rakHomeBootSequenceInstalled) {
    runRakHomeBootRefresh();
    return;
  }
  window.__rakHomeBootSequenceInstalled = true;

  runRakHomeBootRefresh();
  setTimeout(runRakHomeBootRefresh, 60);
  setTimeout(runRakHomeBootRefresh, 240);
  setTimeout(runRakLateHomeBootRefresh, 1100);
  window.addEventListener("load", runRakHomeBootRefresh, { once: true });
  window.addEventListener("pageshow", runRakHomeBootRefresh);
}

window.runRakHomeBootRefresh = runRakHomeBootRefresh;
window.runRakLateHomeBootRefresh = runRakLateHomeBootRefresh;
window.installRakHomeBootSequence = installRakHomeBootSequence;

try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-home-boot.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}
