function bindAdminSecretUnlock() {
  if (document.documentElement.dataset.adminSecretBound === '1') return true;
  document.documentElement.dataset.adminSecretBound = '1';

  let tapCount = 0;
  let tapTimer = null;

  document.addEventListener('click', (event) => {
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
        localStorage.setItem('adminUnlocked', '1');
      } catch (err) {
        console.warn(err);
      }
      if (typeof updateImportBoxVisibility === 'function') updateImportBoxVisibility();
      if (typeof openAppMenu === 'function') openAppMenu('admin');
      else alert('Administrace odemčena.');
    } else {
      alert('Špatné přihlášení.');
    }
  }, true);

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
  document.addEventListener('DOMContentLoaded', bindAdminSecretUnlock, { once: true });
}


function initAppInitBindings() {
  document.getElementById("monthYearSelect")?.addEventListener("change", (e) => {
    setSelectedYear(e.target.value);
  });

  document.getElementById("statsYearSelect")?.addEventListener("change", (e) => {
    setSelectedYear(e.target.value);
  });

  document.getElementById("importYearSelect")?.addEventListener("change", (e) => {
    app.importYear = parseInt(e.target.value, 10) || getInitialSelectedYear(app.rotation);
    syncYearControls();
  });

  const excelFileInput = document.getElementById("excelFile");
  if (excelFileInput) {
    excelFileInput.addEventListener("change", () => {
      if (!app.pendingMenuImport) return;
      app.pendingMenuImport = false;
      document.getElementById("importBtn")?.click();
    });
  }

  const importBtn = document.getElementById("importBtn");
  if (importBtn) {
    importBtn.addEventListener("click", async () => {
      const input = document.getElementById("excelFile");
      const file = input && input.files && input.files[0];
      if (!file) {
        alert("Vyber Excel soubor.");
        return;
      }
      if (typeof XLSX === "undefined") {
        alert("Knihovna pro Excel se nenačetla.");
        return;
      }

      const overwriteMonth = document.getElementById("overwriteMonth")?.value || "";
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const imported = parseWorkbookFromSheetJS(wb);

      let added = 0;
      let overwritten = 0;

      Object.entries(imported.months).forEach(([monthKey, monthData]) => {
        const normalized = normalizeMonthForImport(monthData);
        const existed = !!app.rotation.months[monthKey];

        if (overwriteMonth && monthKey === overwriteMonth) {
          app.rotation.months[monthKey] = normalized;
          overwritten += 1;
          return;
        }

        app.rotation.months[monthKey] = normalized;
        if (existed) {
          overwritten += 1;
        } else {
          added += 1;
        }
      });

      app.rotation = normalizeRotationData(app.rotation);
      if (!getAvailableYears(app.rotation).includes(parseInt(app.selectedYear, 10))) {
        app.selectedYear = getInitialSelectedYear(app.rotation);
      }
      saveRotationData();
      if (app.adminUnlocked) {
        void saveRotationToSupabase(app.rotation, { source: 'import' });
      }
      renderRotace();

      if (app.selectedMonth && app.rotation.months[app.selectedMonth]) {
        renderMonth(app.selectedMonth);
      }
      if (app.selectedName) renderPerson(app.selectedName);

      const msg = [];
      if (added) msg.push("Přidáno nových měsíců: " + added);
      if (overwriteMonth && overwritten) msg.push("Přepsán měsíc: " + overwriteMonth);
      if (!added && !(overwriteMonth && overwritten)) {
        msg.push("Žádné změny.");
      }
      alert(msg.join(" | "));
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
    if (typeof app !== "undefined" && app.homeBootSuppressed && (document.querySelector(".page.active")?.id || "") !== "home") {
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
