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



const EXPORT_FILES = [
  "styles.css",
  "data.js",
  "app.js",
  "core.js",
  "stats.js",
  "soustruhy.js",
  "brusy.js",
  "rotace.js",
  "app-init.js"
];

async function readExportText(relativePath) {
  const response = await fetch(new URL(relativePath, window.location.href).toString(), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Nepodařilo se načíst ${relativePath} (${response.status})`);
  }
  return await response.text();
}

function buildExportIndexHtml(bodyHtml) {
  return [
    '<!DOCTYPE html>',
    '<html lang="cs">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">',
    '<meta name="apple-mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
    '<meta name="theme-color" content="#0b0f0c">',
    '',
    '<title>Rotace a kalkulačky</title>',
    '',
    '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%0A%20%20%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2214%22%20fill%3D%22%234CAF50%22%2F%3E%0A%20%20%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2224%22%20fill%3D%22%230b0f0c%22%20opacity%3D%22.12%22%2F%3E%0A%20%20%3Ctext%20x%3D%2232%22%20y%3D%2240%22%20text-anchor%3D%22middle%22%20font-family%3D%22Kalam%2C%20cursive%22%20font-size%3D%2220%22%20font-weight%3D%22700%22%20fill%3D%22%23ffffff%22%3EM.%C5%A0.%3C%2Ftext%3E%0A%3C%2Fsvg%3E">',
    '<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap" rel="stylesheet">',
    '<script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>',
    '<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>',
    '<link rel="stylesheet" href="styles.css">',
    '</head>',
    '<body>',
    bodyHtml,
    '',
    '<script src="data.js"></script>',
    '<script src="app.js"></script>',
    '</body>',
    '</html>'
  ].join('\n');
}

async function exportCurrentHtml() {
  if (typeof JSZip === "undefined") {
    alert("Export ZIP není dostupný, nenačetla se knihovna JSZip.");
    return;
  }

  try {
    const pages = [...document.querySelectorAll(".page")];
    const previousActive = pages.find(p => p.classList.contains("active"))?.id || "home";
    pages.forEach(p => p.classList.remove("active"));
    const home = document.getElementById("home");
    if (home) home.classList.add("active");

    const bodyClone = document.body.cloneNode(true);
    bodyClone.classList.remove("qrModalOpen");
    bodyClone.querySelectorAll('#personQrModal, .qrModalOverlay, script[type="text/plain"][id^="src-"]').forEach(el => el.remove());
    const bodyHtml = bodyClone.innerHTML.trim();
    const indexText = buildExportIndexHtml(bodyHtml);

    pages.forEach(p => p.classList.remove("active"));
    const restore = document.getElementById(previousActive);
    if (restore) restore.classList.add("active");

    const exportSources = {};
    for (const file of EXPORT_FILES) {
      exportSources[file] = await readExportText(file);
    }

    const zip = new JSZip();
    for (const file of EXPORT_FILES) {
      zip.file(file, file === "index.html" ? indexText : exportSources[file]);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rotace_v.0179-rc.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error(err);
    alert("Export ZIP se nepovedl: " + (err && err.message ? err.message : err));
  }
}
document.getElementById("exportBtn")?.addEventListener("click", () => {
  exportCurrentHtml();
});

document.getElementById("githubBtn")?.addEventListener("click", () => {
  window.open("https://github.com/martinspadrna/skoda-spada/upload/main", "_blank", "noopener");
});

document.getElementById("rotaceReset").addEventListener("click", () => {
  app.selectedName = null;
  app.selectedStatsName = null;
  app.selectedStatsMachine = null;
  app.selectedMonth = null;
  app.rotationView = "names";
  setRotaceView(app.rotationView || "names");
  renderRotace();
  document.getElementById("personView").innerHTML =
    "<div class='smallText'>Klepni na jméno a ukáže se, kam jde.</div>";
  document.getElementById("monthView").innerHTML =
    "<div class='smallText'>Vyber měsíc vlevo nahoře.</div>";
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
