function renderRotace() {
  const namesGrid = document.getElementById('namesGrid');
  const personView = document.getElementById('personView');
  const monthView = document.getElementById('monthView');

  const year = parseInt(app.selectedYear, 10) || getInitialSelectedYear(app.rotation);
  const availableYears = getAvailableYears(app.rotation);
  const currentYear = new Date().getFullYear();
  if (availableYears.includes(currentYear) && year !== currentYear) {
    app.selectedYear = currentYear;
  } else if (!availableYears.includes(year)) {
    app.selectedYear = getInitialSelectedYear(app.rotation);
  }

  syncYearControls();
  renderMonthGrid();

  const nameIndex = buildNameIndex(app.rotation);
  const names = Object.keys(nameIndex);

  namesGrid.innerHTML = '';
  names.forEach(name => {
    const el = document.createElement('div');
    const isActive = app.selectedName === name;
    el.className = 'listItem rotaceNameTile' + (isActive ? ' activeChoice' : '');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.innerHTML = '<div class="rotaceTileTitle">' + escapeHtml(name) + '</div>';
    el.onclick = () => handlePersonTap(name);
    el.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handlePersonTap(name);
      }
    };
    namesGrid.appendChild(el);
  });

  if (app.selectedName && nameIndex[app.selectedName]) {
    renderPerson(app.selectedName);
  } else {
    renderUpcomingShiftsPreview();
  }

  if (app.selectedMonth && app.rotation.months[app.selectedMonth]) {
    renderMonth(app.selectedMonth);
  } else if (monthView) {
    monthView.innerHTML = "<div class='smallText'>Vyber měsíc.</div>";
  }

  renderStatsPanel();
  const adminBox = document.getElementById('adminBox');
  if (adminBox) adminBox.style.display = 'none';
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


function getPersonScheduleEntryEnd(entry) {
  const parsed = parseDateToken(String(entry && entry.dateLabel ? entry.dateLabel : ""));
  if (!parsed) return null;

  const sortDate = entry && entry.sortDate ? new Date(entry.sortDate) : null;
  const baseYear = sortDate && !Number.isNaN(sortDate.getTime()) ? sortDate.getFullYear() : (new Date()).getFullYear();
  const baseDate = new Date(baseYear, parsed.month - 1, parsed.day, 0, 0, 0, 0);
  const shift = normalizeShiftText(String(entry && entry.shift ? entry.shift : parsed.shift || "")).toUpperCase();

  if (!shift) {
    const endOfDay = new Date(baseDate);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }

  if (shift.includes("R8")) {
    const end = new Date(baseDate);
    end.setHours(14, 0, 0, 0);
    return end;
  }

  if (shift.includes("N8")) {
    const end = new Date(baseDate);
    end.setDate(end.getDate() + 1);
    end.setHours(6, 0, 0, 0);
    return end;
  }

  if (shift.startsWith("N")) {
    const start = new Date(baseDate);
    start.setHours(18, 0, 0, 0);
    return getShiftEnd(start);
  }

  if (shift.startsWith("R")) {
    const start = new Date(baseDate);
    start.setHours(6, 0, 0, 0);
    return getShiftEnd(start);
  }

  const endOfDay = new Date(baseDate);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

function getPersonScheduleEntries(name) {
  const rawEntries = (buildNameIndex(app.rotation)[name] || []).slice();
  if (!rawEntries.length) {
    return { entries: [], currentIdx: -1 };
  }

  const dayKey = (d) => {
    const date = new Date(d);
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  };

  const now = typeof getPragueNow === 'function' ? getPragueNow(new Date()) : new Date();
  const nowMs = now.getTime();

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

  let currentIdx = entries.findIndex(entry => {
    const end = getPersonScheduleEntryEnd(entry);
    return end && end.getTime() > nowMs;
  });

  if (currentIdx === -1 && entries.length) currentIdx = entries.length - 1;

  return { entries, currentIdx };
}
function buildPersonScheduleModalHtml(name) {
  const model = getPersonScheduleEntries(name);
  if (!model.entries.length) {
    return "<div class='smallText'>Pro tohle jméno zatím nejsou žádné směny.</div>";
  }

  let html = "<div class='personScheduleTitle'>" + escapeHtml(name) + "</div>";
  html += "<div class='tableWrap'><table class='personScheduleTable'><thead><tr><th>Datum</th><th>Směna</th><th>Cíl</th></tr></thead><tbody>";
  model.entries.forEach((e, idx) => {
    html += "<tr class='" + (idx === model.currentIdx ? "currentRow" : "") + "'><td>" + escapeHtml(e.dateLabel || "") + "</td><td>" + escapeHtml(e.shift || "") + "</td><td>" + escapeHtml(e.target || "") + "</td></tr>";
  });
  html += "</tbody></table></div>";
  return html;
}

function renderPersonScheduleModal(name) {
  const overlay = ensurePersonScheduleModal();
  const title = overlay.querySelector('#personScheduleModalTitle');
  const body = overlay.querySelector('#personScheduleModalBody');
  if (title) title.textContent = name;
  if (body) body.innerHTML = buildPersonScheduleModalHtml(name);
}

function showPersonScheduleModal(name) {
  const overlay = ensurePersonScheduleModal();
  renderPersonScheduleModal(name);
  overlay.classList.add('isVisible');
  document.body.classList.add('personModalOpen');
}

function hidePersonScheduleModal() {
  const overlay = document.getElementById('personScheduleModal');
  if (!overlay) return;
  overlay.classList.remove('isVisible');
  document.body.classList.remove('personModalOpen');
}

function ensurePersonScheduleModal() {
  let overlay = document.getElementById('personScheduleModal');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'personScheduleModal';
  overlay.className = 'personScheduleOverlay';
  overlay.innerHTML = [
    '<div class="personScheduleModal" role="dialog" aria-modal="true" aria-labelledby="personScheduleModalTitle">',
    '<button type="button" class="personScheduleClose" aria-label="Zavřít">×</button>',
    '<div class="personScheduleTitle" id="personScheduleModalTitle"></div>',
    '<div class="personScheduleBody" id="personScheduleModalBody"></div>',
    '</div>'
  ].join('');

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) hidePersonScheduleModal();
  });
  overlay.querySelector('.personScheduleClose')?.addEventListener('click', hidePersonScheduleModal);

  if (!document.body.dataset.personModalKeydownBound) {
    document.body.dataset.personModalKeydownBound = '1';
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') hidePersonScheduleModal();
    });
  }

  document.body.appendChild(overlay);
  return overlay;
}





function renderUpcomingShiftsPreview(limit = 10) {
  const personView = document.getElementById("personView");
  if (!personView) return;

  const index = buildNameIndex(app.rotation);
  const names = Object.keys(index || {});
  const now = typeof getPragueNow === 'function' ? getPragueNow(new Date()) : new Date();
  const nowMs = now.getTime();
  const dayKey = (date) => {
    const d = date instanceof Date ? date : new Date(date);
    return [
      String(d.getFullYear()),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
  };
  const items = [];
  const seen = new Set();

  names.forEach(name => {
    const model = getPersonScheduleEntries(name);
    (model.entries || []).forEach(entry => {
      const end = getPersonScheduleEntryEnd(entry);
      if (!end || end.getTime() <= nowMs) return;
      const key = [name, entry.dateLabel || '', entry.shift || '', entry.target || ''].join('|');
      if (seen.has(key)) return;
      seen.add(key);
      items.push({
        name,
        dateLabel: entry.dateLabel || '',
        shift: entry.shift || '',
        target: entry.target || '',
        endMs: end.getTime(),
        dateKey: dayKey(new Date(entry.sortDate || end))
      });
    });
  });

  items.sort((a, b) => {
    if (a.endMs !== b.endMs) return a.endMs - b.endMs;
    return String(a.name).localeCompare(String(b.name), 'cs');
  });

  const nowKey = dayKey(typeof getPragueNow === 'function' ? getPragueNow(new Date()) : new Date());
  const next = items.slice(0, Math.max(1, limit));
  if (!next.length) {
    personView.innerHTML = "<div class='smallText'>Pro teď tu ještě nejsou žádné budoucí směny.</div>";
    return;
  }

  const hasToday = next.some(entry => entry.dateKey === nowKey);
  const previewTitle = hasToday ? 'Dnešní směny' : 'Nejbližší směny';
  personView.innerHTML = [
    '<div class="rotacePersonTitle">' + previewTitle + '</div>',
    '<div class="rotaceQuickCards rotacePreviewGrid">',
    next.map(entry => [
      '<div class="rotaceMiniCard">',
      '  <div class="rotaceMiniDate">' + escapeHtml(entry.dateLabel || '') + (entry.shift ? ' ' + escapeHtml(entry.shift) : '') + '</div>',
      '  <div class="rotaceMiniTarget">' + escapeHtml(entry.name || '') + (entry.target ? ' · ' + escapeHtml(entry.target) : '') + '</div>',
      '</div>'
    ].join('')).join(''),
    '</div>'
  ].join('');
}

function renderPerson(name) {
  const personView = document.getElementById("personView");
  const schedule = getPersonScheduleEntries(name);
  const entries = Array.isArray(schedule.entries) ? schedule.entries : [];
  const currentIdx = Number.isFinite(schedule.currentIdx) ? schedule.currentIdx : -1;

  if (!entries.length) {
    personView.innerHTML = "<div class='smallText'>Pro tohle jméno zatím nejsou žádné směny.</div>";
    return;
  }

  const startIdx = Math.max(0, currentIdx - 1);
  const endIdx = Math.min(entries.length, currentIdx + 10);
  const visibleEntries = entries.slice(startIdx, endIdx);

  const formatEntry = (entry, isCurrent) => [
    '<div class="rotaceMiniCard' + (isCurrent ? ' current' : '') + '">',
    '  <div class="rotaceMiniDate">' + escapeHtml(entry.dateLabel || "") + (entry.shift ? ' ' + escapeHtml(entry.shift) : '') + '</div>',
    '  <div class="rotaceMiniTarget">' + escapeHtml(entry.target || "") + '</div>',
    '</div>'
  ].join('');

  personView.innerHTML = [
    '<div class="rotacePersonTitle">' + escapeHtml(name) + '</div>',
    '<div class="rotaceQuickCards rotaceQuickStack">',
    visibleEntries.map((entry, idx) => formatEntry(entry, (startIdx + idx) === currentIdx)).join(''),
    '</div>'
  ].join('');
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

function initRotaceCurrentMonth() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = monthKeyFromYearMonth(currentYear, now.getMonth() + 1);
  const currentYearMonths = getMonthsForYear(app.rotation, currentYear);
  const availableYears = getAvailableYears(app.rotation);
  app.selectedYear = availableYears.includes(currentYear) ? currentYear : getInitialSelectedYear(app.rotation);
  app.selectedMonth = currentYearMonths.includes(currentMonth) ? currentMonth : (currentYearMonths[0] || null);
  app.importYear = app.selectedYear;
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
  if (box) box.style.display = "none";
}

