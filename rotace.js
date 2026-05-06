function renderRotace() {
  const namesGrid = document.getElementById("namesGrid");
  const personView = document.getElementById("personView");
  const monthView = document.getElementById("monthView");

  const year = parseInt(app.selectedYear, 10) || getInitialSelectedYear(app.rotation);
  const availableYears = getAvailableYears(app.rotation);
  if (!availableYears.includes(year)) {
    app.selectedYear = getInitialSelectedYear(app.rotation);
  }

  syncYearControls();
  renderMonthGrid();

  const nameIndex = buildNameIndex(app.rotation);
  const names = Object.keys(nameIndex);

  namesGrid.innerHTML = "";
  names.forEach(name => {
    const el = document.createElement("div");
    el.className = "listItem" + (app.selectedName === name ? " activeChoice" : "");
    el.textContent = name;
    el.onclick = () => handlePersonTap(name);
    namesGrid.appendChild(el);
  });

  if (app.selectedName && nameIndex[app.selectedName]) {
    renderPerson(app.selectedName);
  } else {
    personView.innerHTML = "";
  }

  if (app.selectedMonth && app.rotation.months[app.selectedMonth]) {
    renderMonth(app.selectedMonth);
  } else if (monthView) {
    monthView.innerHTML = "<div class='smallText'>Vyber měsíc.</div>";
  }

  renderStatsPanel();
  document.getElementById("adminBox").style.display = app.adminUnlocked ? "block" : "none";
}

function getSoftMachineDisplayLabel(entry, rotation) {
  const machine = String(entry && entry.machine ? entry.machine : "").trim();
  if (!machine) return "";
  if (String(entry && entry.section ? entry.section : "") !== "soft" || machine !== "MFKF10") return machine;

  const month = rotation && rotation.months ? rotation.months[entry.monthKey] : null;
  const soft = month && month.soft ? month.soft : null;
  if (!soft || !Array.isArray(soft.rows) || !Array.isArray(soft.machines)) return machine;

  const row = soft.rows.find(r => String(r && r.date ? r.date : "").trim() === String(entry.date || "").trim());
  if (!row) return machine;

  const idx06 = soft.machines.indexOf("MFKF06");
  const idx10 = soft.machines.indexOf("MFKF10");
  if (idx10 < 0) return machine;

  const has10 = String((row.cells || [])[idx10] || "").trim();
  const has06 = idx06 >= 0 ? String((row.cells || [])[idx06] || "").trim() : "";
  if (has10 && !has06) return "MFKF10 (+ MFKF06)";
  return machine;
}


function handlePersonTap(name) {
  const now = Date.now();
  if (!app.nameTapState || app.nameTapState.name !== name || now - app.nameTapState.lastTap > 750) {
    app.nameTapState = { name, count: 1, lastTap: now };
  } else {
    app.nameTapState.count += 1;
    app.nameTapState.lastTap = now;
  }

  app.selectedName = name;
  renderRotace();

  if (app.nameTapState.count >= 3) {
    app.nameTapState = { name, count: 0, lastTap: 0 };
    showPersonQrModal(name);
  }
}

function renderPerson(name) {
  const personView = document.getElementById("personView");
  const rawEntries = (buildNameIndex(app.rotation)[name] || []).slice();

  if (!rawEntries.length) {
    personView.innerHTML = "<div class='smallText'>Pro tohle jméno zatím nejsou žádné směny.</div>";
    return;
  }

  const dayKey = (d) => {
    const date = new Date(d);
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  };

  const priorityOf = (entry) => {
    if (entry && entry.absence) return 3;
    if ((entry && entry.section) === "soft") return 2;
    if ((entry && entry.section) === "hard") return 1;
    return 0;
  };

  const getSharedSoftSuffix = (entry) => {
    if (!entry || entry.section !== "soft") return "";
    const machine = String(entry.machine || "").trim();
    if (machine !== "MSKC03" && machine !== "MSKC04") return "";

    const month = app.rotation && app.rotation.months ? app.rotation.months[entry.monthKey] : null;
    const soft = month && month.soft ? month.soft : null;
    if (!soft || !Array.isArray(soft.rows) || !Array.isArray(soft.machines)) return "";

    const row = soft.rows.find(r => String(r && r.date ? r.date : "").trim() === String(entry.date || "").trim());
    if (!row) return "";

    const idx01 = soft.machines.indexOf("MSKC01");
    if (idx01 < 0) return "";

    const has01 = String((row.cells || [])[idx01] || "").trim();
    return has01 ? "" : " (+MSKC01)";
  };

  const groups = new Map();
  rawEntries.forEach(entry => {
    const dateObj = new Date(entry.sortDate);
    if (Number.isNaN(dateObj.getTime())) return;
    if (getSpecialWorkInfo(dateObj)) return;

    const key = dayKey(dateObj);
    if (!groups.has(key)) {
      groups.set(key, {
        sortDate: new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 12, 0, 0, 0).toISOString(),
        dateLabel: entry.dateLabel || entry.date || "",
        bestEntry: null
      });
    }

    const group = groups.get(key);
    if (!group.dateLabel && entry.dateLabel) group.dateLabel = entry.dateLabel;
    if (!group.bestEntry || priorityOf(entry) > priorityOf(group.bestEntry)) {
      group.bestEntry = entry;
    }
  });

  const entries = [...groups.values()]
    .map(group => {
      const best = group.bestEntry || {};
      return {
        sortDate: group.sortDate,
        dateLabel: group.dateLabel || best.dateLabel || best.date || "",
        shift: best.shift || "",
        target: best.absence
          ? (best.machine || "Dovolená")
          : getSoftMachineDisplayLabel(best, app.rotation) + getSharedSoftSuffix(best)
      };
    })
    .sort((a, b) => a.sortDate.localeCompare(b.sortDate));

  if (!entries.length) {
    personView.innerHTML = "<div class='smallText'>Pro tohle jméno nejsou v aktuálním rozpisu žádné směny.</div>";
    return;
  }

  const today = new Date();
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  let currentIdx = entries.findIndex(e => new Date(e.sortDate).getTime() === todayDay);
  if (currentIdx === -1) {
    currentIdx = entries.findIndex(e => new Date(e.sortDate).getTime() > todayDay);
    if (currentIdx === -1) currentIdx = entries.length - 1;
  }

  const startIdx = Math.max(0, currentIdx - 1);
  const endIdx = Math.min(entries.length, currentIdx + 4);
  const around = entries.slice(startIdx, endIdx);

  let html = "<div class='smallText'><b>" + escapeHtml(name) + "</b></div>";
  around.forEach((e, i) => {
    const idx = startIdx + i;
    html += "<div class='personLine" + (idx === currentIdx ? " current" : "") + "'>" +
      escapeHtml(e.dateLabel || "") + (e.shift ? " " + escapeHtml(e.shift) : "") +
      " → " + escapeHtml(e.target || "") +
      "</div>";
  });

  personView.innerHTML = html;
}

function renderMonth(monthKey) {
  const month = app.rotation.months[monthKey];
  const monthView = document.getElementById("monthView");
  if (!month || !monthView) return;

  let html = "<div class='sectionTitle'>" + escapeHtml(monthKey) + "</div>";

  const renderTable = (section, label) => {
    const sec = month[section];
    if (!sec) return "";
    let out = "<div class='smallText' style='margin-top:10px;font-weight:bold;'>" + label + "</div>";
    out += "<div class='tableWrap'><table class='rotTable'><thead><tr><th>Datum</th>";
    (sec.machines || []).forEach(m => {
      out += "<th>" + escapeHtml(m) + "</th>";
    });
    out += "</tr></thead><tbody>";

    (sec.rows || []).forEach(row => {
      out += "<tr><td class='dateCell'>" + escapeHtml(row.date) + "</td>";
      (row.cells || []).forEach(cell => {
        const val = (cell || "").trim();
        if (val) {
          out += "<td>" + escapeHtml(val) + "</td>";
        } else {
          out += "<td class='missingCell'>—</td>";
        }
      });
      out += "</tr>";
    });

    out += "</tbody></table></div>";
    return out;
  };

  html += renderTable("hard", "Tvrdota");
  html += renderTable("soft", "Měkota");

  html += "<div class='smallText' style='margin-top:12px;font-weight:bold;'>Dovolené / absence</div>";
  const absNotes = (month.notes || []).map(normalizeNoteEntry).filter(n => n.isAbsence);

  if (absNotes.length) {
    const grouped = new Map();
    absNotes.forEach(n => {
      const key = n.date || "";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(n);
    });

    const rows = [...grouped.entries()].map(([date, items]) => ({
      date,
      items: items.slice().sort((a, b) => String(a.person || "").localeCompare(String(b.person || ""), "cs"))
    }));

    const maxPairs = Math.max(1, ...rows.map(r => r.items.length));
    html += "<div class='tableWrap'><table class='noteTable'><thead><tr>";
    for (let i = 0; i < maxPairs; i += 1) {
      if (i > 0) html += "<th class='noteSpacer'></th>";
      html += "<th>Datum</th><th>Směna</th><th>Jméno</th><th>Důvod</th>";
    }
    html += "</tr></thead><tbody>";

    rows.forEach(row => {
      html += "<tr>";
      for (let i = 0; i < maxPairs; i += 1) {
        if (i > 0) html += "<td class='noteSpacer'></td>";
        const n = row.items[i];
        if (n) {
          const parsed = parseDateToken(n.date);
          const dateOnly = parsed ? String(parsed.day) + "." + String(parsed.month) + "." : n.date;
          const shift = n.shift || (parsed ? parsed.shift : "");
          const people = (n.people && n.people.length) ? n.people.join(" a ") : (n.person || "");
          const reason = n.label || n.code || "";
          html += "<td>" + escapeHtml(dateOnly) + "</td><td>" + escapeHtml(shift) + "</td><td>" + escapeHtml(people) + "</td><td>" + escapeHtml(reason) + "</td>";
        } else {
          html += "<td class='emptyCell'>—</td><td class='emptyCell'>—</td><td class='emptyCell'>—</td><td class='emptyCell'>—</td>";
        }
      }
      html += "</tr>";
    });

    html += "</tbody></table></div>";
  } else {
    html += "<div class='smallText'>Bez poznámek.</div>";
  }

  monthView.innerHTML = html;
}

function showMonthByKey(monthKey) {
  app.selectedMonth = monthKey;
  setRotaceView("months");
  renderRotace();
  renderMonth(monthKey);
}

function refreshInitialUI() {
  restoreInputs();
  renderBrusy();
  renderSoustruhy();
  const currentYear = new Date().getFullYear();
  const currentMonth = monthKeyFromYearMonth(currentYear, new Date().getMonth() + 1);
  const currentYearMonths = getMonthsForYear(app.rotation, currentYear);
  app.selectedYear = getAvailableYears(app.rotation).includes(currentYear) ? currentYear : getInitialSelectedYear(app.rotation);
  app.importYear = app.selectedYear;
  app.selectedMonth = currentYearMonths.includes(currentMonth) ? currentMonth : (currentYearMonths[0] || null);
  app.selectedName = null;
  app.selectedStatsName = null;
  setRotaceView(app.rotationView || "names");
  renderRotace();
  if (app.selectedMonth) renderMonth(app.selectedMonth);
  updateImportBoxVisibility();
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* SIGNATURE TYPEWRITER */
(function typeSignature() {
  const target = document.getElementById("signatureTap");
  const text = "Martin Špadrna";
  let i = 0;
  function tick() {
    if (!target) return;
    if (i <= text.length) {
      target.textContent = text.slice(0, i);
      i += 1;
      setTimeout(tick, 65);
    }
  }
  tick();
})();

/* SECRET ADMIN UNLOCK */
function updateImportBoxVisibility() {
  const box = document.getElementById("adminBox");
  if (box) box.style.display = app.adminUnlocked ? "block" : "none";
}

