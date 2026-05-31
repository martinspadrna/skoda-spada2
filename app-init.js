// RaK 1.2 (1.28) – startovací vazby aplikace a admin odemčení.
function bindAdminSecretUnlock() {
  try { localStorage.removeItem('adminUnlocked'); } catch (err) {}
  if (document.documentElement.dataset.adminSecretBound === '1') return true;
  document.documentElement.dataset.adminSecretBound = '1';

  let tapCount = 0;
  let tapTimer = null;

  registerListener(document, 'click', (event) => {
    const target = event.target && typeof event.target.closest === 'function'
      ? event.target.closest('.bottomNavMenuBtn')
      : null;
    if (!target) return;
    if (typeof app !== 'undefined' && app.adminUnlocked) return;

    tapCount += 1;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { tapCount = 0; }, 1200);

    if (tapCount < 3) return;
    tapCount = 0;

    const pass = prompt('Heslo administrace:') || '';
    if (pass.trim() === '772326') {
      if (typeof app !== 'undefined') {
        app.adminUnlocked = true;
        app.contactTapCount = 0;
      }
      try {
        sessionStorage.setItem('adminUnlockedSession', '1');
        localStorage.removeItem('adminUnlocked');
      } catch (err) {
        console.warn(err);
      }
      if (typeof updateImportBoxVisibility === 'function') updateImportBoxVisibility();
      if (typeof openAppMenu === 'function') openAppMenu('admin');
      else alert('Administrace odemčena.');
    } else {
      alert('Špatné přihlášení.');
    }
  }, { capture: true });

  return true;
}

async function syncRotationFromSupabase(force) {
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.loadRotationState !== 'function') return null;
  try {
    let remote = await bridge.loadRotationState();
    if ((!remote || !remote.payload) && typeof bridge.seedFromLocalSnapshot === 'function' && typeof app !== 'undefined' && app.rotation && app.rotation.months && Object.keys(app.rotation.months).length) {
      await bridge.seedFromLocalSnapshot(app.rotation, app.machineSettingsRows || []);
      remote = await bridge.loadRotationState();
    }
    if (!remote || !remote.payload) return null;
    const next = typeof normalizeRotationData === 'function' ? normalizeRotationData(remote.payload) : remote.payload;
    if (!next || !next.months) return null;

    const nextText = JSON.stringify(next);
    const currentText = JSON.stringify(typeof app !== 'undefined' && app.rotation ? app.rotation : null);
    if (!force && nextText === currentText) return next;

    if (typeof app !== 'undefined') {
      app.rotation = next;
      if (!app.selectedYear || !getAvailableYears(app.rotation).includes(parseInt(app.selectedYear, 10))) {
        app.selectedYear = getInitialSelectedYear(app.rotation);
      }
    }

    if (typeof bridge.loadMachineSettings === 'function' && typeof app !== 'undefined') {
      try {
        app.machineSettingsRows = await bridge.loadMachineSettings();
      } catch (settingsErr) {
        console.warn('Machine settings sync failed', settingsErr);
      }
    }

    if (typeof saveRotationData === 'function') saveRotationData();
    if (typeof renderRotace === 'function') renderRotace();
    if (typeof renderStatsPanel === 'function') renderStatsPanel();
    if (typeof app !== 'undefined' && app.selectedMonth && typeof renderMonth === 'function') {
      renderMonth(app.selectedMonth);
    }
    if (typeof app !== 'undefined' && app.selectedName && typeof renderPerson === 'function') {
      renderPerson(app.selectedName);
    }
    if (typeof updateImportBoxVisibility === 'function') updateImportBoxVisibility();
    return next;
  } catch (err) {
    console.warn('Supabase rotation sync failed', err);
    return null;
  }
}

async function saveRotationToSupabase(rotation, meta) {
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.saveRotationState !== 'function') return { ok: false, reason: 'missing-bridge' };
  try {
    return await bridge.saveRotationState(rotation, meta || {});
  } catch (err) {
    console.warn('Supabase rotation save helper failed', err);
    return { ok: false, error: err };
  }
}

if (!bindAdminSecretUnlock()) {
  registerListener(document, 'DOMContentLoaded', bindAdminSecretUnlock, { once: true });
}




// RaK 1.2 (1.28) – Excel import rozpisů je oddělený v app-excel-import.js.


function initAppInitBindings() {
  registerListener(document.getElementById("monthYearSelect"), "change", (e) => {
    setSelectedYear(e.target.value);
  });

  registerListener(document.getElementById("statsYearSelect"), "change", (e) => {
    setSelectedYear(e.target.value);
  });

  registerListener(document.getElementById("monthSelect"), "change", (e) => {
    const monthKey = e && e.target ? String(e.target.value || '') : '';
    app.selectedMonth = monthKey || null;
    if (monthKey && typeof parseMonthKey === 'function') {
      const parsed = parseMonthKey(monthKey);
      if (parsed && Number.isFinite(parsed.year)) app.selectedYear = parsed.year;
    }
    if (typeof syncYearControls === 'function') syncYearControls();
    if (monthKey && typeof renderMonth === 'function') renderMonth(monthKey);
    if (typeof renderStatsPanel === 'function') renderStatsPanel();
  });

  registerListener(document.getElementById("importYearSelect"), "change", (e) => {
    app.importYear = parseInt(e.target.value, 10) || getInitialSelectedYear(app.rotation);
    syncYearControls();
  });

  const excelFileInput = document.getElementById("excelFile");
  if (excelFileInput) {
    registerListener(excelFileInput, "change", async () => {
      const input = document.getElementById("excelFile");
      const file = input && input.files && input.files[0];
      app.pendingMenuImport = false;
      if (!file) return;
      try {
        setRakExcelImportStatus('Načítám Excel…', false);
        await buildRakExcelImportPreview(file);
      } catch (err) {
        console.error(err);
        setRakExcelImportStatus('Excel se nepodařilo načíst: ' + (err && err.message ? err.message : err), true);
        alert('Excel se nepodařilo načíst: ' + (err && err.message ? err.message : err));
      }
    });
  }

  const importBtn = document.getElementById("importBtn");
  if (importBtn) {
    registerListener(importBtn, "click", async () => {
      try {
        await performRakExcelImportFromPreview();
      } catch (err) {
        console.error(err);
        setRakExcelImportStatus('Import se nepovedl: ' + (err && err.message ? err.message : err), true);
        alert('Import se nepovedl: ' + (err && err.message ? err.message : err));
      }
    });
  }

  /* INITIAL */
  const tabNames = document.getElementById("tabNames");
  const tabMonths = document.getElementById("tabMonths");
  if (tabNames) tabNames.style.outline = "none";
  if (tabMonths) tabMonths.style.outline = "3px solid #7CFF7C";
  if (typeof setRotaceView === "function") setRotaceView("names");
  if (typeof refreshInitialUI === "function") refreshInitialUI();

  const bootHome = () => {
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
  };

  bootHome();
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
  void syncRotationFromSupabase(false);
  setTimeout(bootHome, 60);
  setTimeout(bootHome, 240);
  setTimeout(() => {
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
  }, 1100);

  window.addEventListener("load", bootHome, { once: true });
  window.addEventListener("pageshow", bootHome);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAppInitBindings, { once: true });
} else {
  initAppInitBindings();
}

window.syncRotationFromSupabase = syncRotationFromSupabase;
window.saveRotationToSupabase = saveRotationToSupabase;
