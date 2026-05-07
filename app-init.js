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



function parseWorkbookFromSheetJS(workbook) {
  const out = { months: {} };
  const compact = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const isMonthSheet = (sheetName) => /^\d{2}\.\d{4}$/.test(String(sheetName || ""));
  const isRosterStartBlocked = (dateLabel) => {
    const m = /^(\d{1,2})\.(\d{1,2})\./.exec(compact(dateLabel));
    if (!m) return false;
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    if (NO_START_HOLIDAYS.has(month + "-" + day)) return true;
    if ((month === 7 && day >= 20) || (month === 8 && day <= 1)) return true;
    return false;
  };
  const isDateLabel = (value) => /^\d{1,2}\.\d{1,2}\.\s*[NR](?:8)?$/.test(compact(value));

  workbook.SheetNames.forEach(sheetName => {
    if (!isMonthSheet(sheetName)) return;

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      blankrows: false,
      defval: ""
    }).map(row => {
      const copy = Array.isArray(row) ? row.slice() : [];
      while (copy.length < 35) copy.push("");
      return copy;
    });

    const findSectionRow = (labelRegex) => rows.findIndex(row => {
      const first = compact(row && row[0]);
      return /rotace/i.test(first) && labelRegex.test(first);
    });

    const hardIdx = findSectionRow(/tvrdota/i);
    const softIdx = findSectionRow(/měkota|mekota/i);
    if (hardIdx === -1 || softIdx === -1 || softIdx <= hardIdx) return;

    const parseSection = (startIdx, endIdx, machines, title) => {
      const sectionRows = [];
      for (let r = startIdx; r < endIdx && r < rows.length; r += 1) {
        const row = rows[r] || [];
        const date = compact(row[0]);
        if (!isDateLabel(date) || isRosterStartBlocked(date)) continue;
        const cells = row.slice(1, 6).map(v => compact(v));
        sectionRows.push({ date, cells });
      }
      return { title, machines: machines.slice(), rows: sectionRows };
    };

    const parseNotes = (startIdx, endIdx) => {
      const notes = [];
      for (let r = startIdx; r < endIdx && r < rows.length; r += 1) {
        const row = rows[r] || [];
        const noteDate = compact(row[7]); // H
        if (!isDateLabel(noteDate) || isRosterStartBlocked(noteDate)) continue;

        for (const c of [8, 10, 12]) { // I/J, K/L, M/N
          const person = compact(row[c]);
          const code = compact(row[c + 1]);
          if (!person && !code) continue;
          if (!person) continue;
          notes.push({
            date: noteDate,
            shift: "",
            person,
            code: code || "D",
            text: [person, code || "D"].filter(Boolean).join(" ")
          });
        }
      }
      return notes;
    };

    const hard = parseSection(hardIdx + 1, softIdx, HARD_MACHINE_HEADERS, "Rotace tvrdota");
    const soft = parseSection(softIdx + 1, rows.length, SOFT_MACHINE_HEADERS, "Rotace měkota");
    const notes = parseNotes(hardIdx + 1, softIdx);

    out.months[monthKeyFromSheetName(sheetName)] = { hard, soft, notes };
  });

  return out;
}

document.getElementById("importBtn").addEventListener("click", async () => {
  const input = document.getElementById("excelFile");
  const file = input.files && input.files[0];
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


/* INITIAL */
document.getElementById("tabNames").style.outline = "none";
document.getElementById("tabMonths").style.outline = "3px solid #7CFF7C";
setRotaceView("names");
refreshInitialUI();
if (typeof updateFoodTile === "function") {
  updateFoodTile();
  setInterval(updateFoodTile, 60 * 1000);
}
if (typeof updateEportalTile === "function") {
  updateEportalTile();
  setInterval(updateEportalTile, 60 * 1000);
}
