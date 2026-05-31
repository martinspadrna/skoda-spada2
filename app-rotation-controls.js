// RaK 1.2 (1.61) – startovací vazby voleb Rotace a Excel importu oddělené z app-init.js.

function installRakRotationControlBindings() {
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
}

window.installRakRotationControlBindings = installRakRotationControlBindings;
