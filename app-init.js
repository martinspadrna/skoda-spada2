function bindSecretMenu() {
  const tap = document.getElementById("signatureTap");
  if (!tap || tap.dataset.secretBound === "1") return false;
  tap.dataset.secretBound = "1";
  tap.addEventListener("click", () => {
    app.importClicks += 1;
    if (app.importClicks >= 5 && !app.adminUnlocked) {
      const user = prompt("Jméno:") || "";
      const pass = prompt("Heslo:") || "";
      if (user.trim() === "Sp4d4" && pass === "SpadaM772326") {
        app.adminUnlocked = true;
        updateImportBoxVisibility();
      } else {
        alert("Špatné přihlášení.");
      }
      app.importClicks = 0;
    }
  });
  return true;
}

if (!bindSecretMenu()) {
  document.addEventListener("DOMContentLoaded", bindSecretMenu, { once: true });
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
