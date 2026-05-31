// RaK 1.2 (1.65) – Rotace render a volba jmen.
function renderRotace() {
  const namesGrid = document.getElementById('namesGrid');
  const personView = document.getElementById('personView');
  const monthView = document.getElementById('monthView');

  // v.1.1 (740): respektuj ručně vybraný rok. Dřív se při každém renderu
  // Rozpisů/Statistik přepsal zpět na aktuální rok, takže importy 2025 nebyly vidět.
  const requestedYear = parseInt(app.selectedYear, 10);
  const availableYears = getAvailableYears(app.rotation);
  if (!availableYears.includes(requestedYear)) {
    app.selectedYear = getInitialSelectedYear(app.rotation);
  }

  syncYearControls();
  renderMonthGrid();

  const nameIndex = buildNameIndex(app.rotation);
  const names = Object.keys(nameIndex);

  const buildRotaceNameTiles = () => names.map(name => {
    const el = document.createElement('div');
    const isActive = app.selectedName === name;
    el.className = 'listItem rotaceNameTile' + (isActive ? ' activeChoice' : '');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');

    const title = document.createElement('div');
    title.className = 'rotaceTileTitle';
    title.textContent = name;
    el.appendChild(title);

    el.onclick = () => handlePersonTap(name);
    el.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handlePersonTap(name);
      }
    };
    return el;
  });

  const namesFingerprint = JSON.stringify({ names, selectedName: app.selectedName || '' });
  if (typeof setElementChildrenIfChanged === 'function') {
    setElementChildrenIfChanged(namesGrid, namesFingerprint, buildRotaceNameTiles, 'rotaceNamesGrid');
  } else {
    namesGrid.replaceChildren(...buildRotaceNameTiles());
  }

  if (app.selectedName && nameIndex[app.selectedName]) {
    renderPerson(app.selectedName);
  } else {
    renderUpcomingShiftsPreview(10);
  }
  bindRotaceOverviewTap();

  if (app.selectedMonth && app.rotation.months[app.selectedMonth]) {
    renderMonth(app.selectedMonth);
  } else if (monthView) {
    setRotaceHtmlIfChanged(monthView, "<div class='smallText'>Vyber měsíc.</div>", 'rotaceMonth-empty');
  }

  renderStatsPanel();
  const adminBox = document.getElementById('adminBox');
  if (adminBox) adminBox.style.display = 'none';
}


function setRotaceHtmlIfChanged(element, html, key) {
  if (!element) return false;
  if (typeof setElementHtmlIfChanged === 'function') {
    return setElementHtmlIfChanged(element, html, key || 'rotace');
  }
  element.innerHTML = String(html ?? '');
  return true;
}

function bindRotaceOverviewTap() {
  const personView = document.getElementById('personView');
  if (!personView || personView.dataset.rotaceBlankTapBound === '1') return;
  personView.dataset.rotaceBlankTapBound = '1';
  personView.addEventListener('click', (event) => {
    if (!app.selectedName) return;
    const target = event.target;
    if (target && typeof target.closest === 'function') {
      if (target.closest('.rotaceMiniCard') || target.closest('button, a, input, select, textarea, label')) return;
    }
    app.selectedName = null;
    app.nameTapState = { name: '', count: 0, lastTap: 0, qrShownAt: 0 };
    renderRotace();
  });
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
  const sameName = app.selectedName === name;
  const state = app.nameTapState && app.nameTapState.name === name ? app.nameTapState : { name: '', count: 0, lastTap: 0, qrShownAt: 0 };
  const freshTap = state.name !== name || now - (state.lastTap || 0) > 750;

  if (freshTap) {
    app.nameTapState = { name, count: 1, lastTap: now, qrShownAt: 0 };
    app.selectedName = name;
    renderRotace();
    return;
  }

  state.count = (state.count || 0) + 1;
  state.lastTap = now;
  app.nameTapState = state;

  if (!sameName) {
    app.selectedName = name;
    renderRotace();
    return;
  }

  if (state.qrShownAt) {
    if (now - state.qrShownAt >= 450) {
      app.selectedName = null;
      app.nameTapState = { name: '', count: 0, lastTap: 0, qrShownAt: 0 };
      renderRotace();
      return;
    }
    renderRotace();
    return;
  }

  if (state.count >= 3) {
    state.qrShownAt = now;
    app.nameTapState = state;
    app.selectedName = name;
    renderRotace();
    showPersonQrModal(name);
    return;
  }

  app.selectedName = name;
  renderRotace();
}


function getPersonScheduleEntryWindow(entry) {
  const parsed = parseDateToken(String(entry && entry.dateLabel ? entry.dateLabel : ""));
  if (!parsed) return null;

  const sortDate = entry && entry.sortDate ? new Date(entry.sortDate) : null;
  const baseYear = sortDate && !Number.isNaN(sortDate.getTime()) ? sortDate.getFullYear() : (new Date()).getFullYear();
  const baseDate = new Date(baseYear, parsed.month - 1, parsed.day, 0, 0, 0, 0);
  const shift = normalizeShiftText(String(entry && entry.shift ? entry.shift : parsed.shift || "")).toUpperCase();
  const start = new Date(baseDate);
  const end = new Date(baseDate);

  if (!shift) {
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (shift.includes("R8")) {
    start.setHours(6, 0, 0, 0);
    end.setHours(14, 0, 0, 0);
    return { start, end };
  }

  if (shift.includes("N8")) {
    const specialHour = typeof getSpecialSundayNightStartHour === 'function'
      ? getSpecialSundayNightStartHour(baseDate, 22)
      : 22;
    start.setHours(specialHour, 0, 0, 0);
    end.setDate(end.getDate() + 1);
    end.setHours(6, 0, 0, 0);
    return { start, end };
  }

  if (shift.startsWith("N")) {
    start.setHours(18, 0, 0, 0);
    end.setDate(end.getDate() + 1);
    end.setHours(6, 0, 0, 0);
    return { start, end };
  }

  if (shift.startsWith("R")) {
    start.setHours(6, 0, 0, 0);
    end.setHours(18, 0, 0, 0);
    return { start, end };
  }

  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getPersonScheduleEntryEnd(entry) {
  const win = getPersonScheduleEntryWindow(entry);
  return win ? win.end : null;
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
        absence: !!best.absence,
        target: best.absence
          ? (best.machine || "Dovolená")
          : getSoftMachineDisplayLabel(best, app.rotation) + getSharedSoftSuffix(best)
      };
    })
    .sort((a, b) => a.sortDate.localeCompare(b.sortDate));

  let currentIdx = entries.findIndex(entry => {
    if (entry && entry.absence) return false;
    const win = getPersonScheduleEntryWindow(entry);
    return win && win.start.getTime() <= nowMs && nowMs < win.end.getTime();
  });

  if (currentIdx === -1) {
    currentIdx = entries.findIndex(entry => {
      if (entry && entry.absence) return false;
      const win = getPersonScheduleEntryWindow(entry);
      return win && win.start.getTime() > nowMs;
    });
  }

  if (currentIdx === -1) {
    currentIdx = entries.findIndex(entry => {
      const end = getPersonScheduleEntryEnd(entry);
      return end && end.getTime() > nowMs;
    });
  }

  if (currentIdx === -1 && entries.length) currentIdx = entries.length - 1;

  return { entries, currentIdx };
}
function buildPersonScheduleModalNodes(name) {
  const model = getPersonScheduleEntries(name);
  if (!model.entries.length) {
    const empty = document.createElement('div');
    empty.className = 'smallText';
    empty.textContent = 'Pro tohle jméno zatím nejsou žádné směny.';
    return [empty];
  }

  const innerTitle = document.createElement('div');
  innerTitle.className = 'personScheduleTitle';
  innerTitle.textContent = String(name || '');

  const wrap = document.createElement('div');
  wrap.className = 'tableWrap';

  const table = document.createElement('table');
  table.className = 'personScheduleTable';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Datum', 'Směna', 'Cíl'].forEach((label) => {
    const th = document.createElement('th');
    th.textContent = label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');
  model.entries.forEach((e, idx) => {
    const row = document.createElement('tr');
    if (idx === model.currentIdx) row.className = 'currentRow';
    [e.dateLabel || '', e.shift || '', e.target || ''].forEach((value) => {
      const td = document.createElement('td');
      td.textContent = String(value || '');
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  wrap.appendChild(table);
  return [innerTitle, wrap];
}

function getPersonScheduleModalFingerprint(name) {
  const model = getPersonScheduleEntries(name);
  return JSON.stringify({
    name: String(name || ''),
    currentIdx: model.currentIdx,
    entries: model.entries.map((e) => ({
      dateLabel: String(e.dateLabel || ''),
      shift: String(e.shift || ''),
      target: String(e.target || '')
    }))
  });
}

function renderPersonScheduleModal(name) {
  const overlay = ensurePersonScheduleModal();
  const title = overlay.querySelector('#personScheduleModalTitle');
  const body = overlay.querySelector('#personScheduleModalBody');
  if (title) {
    if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(title, name, 'rotacePersonScheduleModalTitle');
    else title.textContent = name;
  }
  if (body) {
    const fingerprint = getPersonScheduleModalFingerprint(name);
    if (typeof setElementChildrenIfChanged === 'function') {
      setElementChildrenIfChanged(body, fingerprint, () => buildPersonScheduleModalNodes(name), 'rotacePersonScheduleModalBody');
    } else {
      body.replaceChildren(...buildPersonScheduleModalNodes(name));
    }
  }
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

  const modal = document.createElement('div');
  modal.className = 'personScheduleModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'personScheduleModalTitle');

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'personScheduleClose';
  closeBtn.setAttribute('aria-label', 'Zavřít');
  closeBtn.textContent = '×';

  const title = document.createElement('div');
  title.className = 'personScheduleTitle';
  title.id = 'personScheduleModalTitle';

  const body = document.createElement('div');
  body.className = 'personScheduleBody';
  body.id = 'personScheduleModalBody';

  modal.appendChild(closeBtn);
  modal.appendChild(title);
  modal.appendChild(body);
  overlay.appendChild(modal);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) hidePersonScheduleModal();
  });
  closeBtn.addEventListener('click', hidePersonScheduleModal);

  bindGlobalEscapeOnce('personModalKeydownBound', hidePersonScheduleModal);

  document.body.appendChild(overlay);
  return overlay;
}





function renderUpcomingShiftsPreview(limit = 10) {
  const personView = document.getElementById("personView");
  if (!personView) return;

  const index = buildNameIndex(app.rotation);
  const names = Object.keys(index || {}).sort((a, b) => String(a).localeCompare(String(b), 'cs'));
  const now = typeof getPragueNow === 'function' ? getPragueNow(new Date()) : new Date();
  const nowMs = now.getTime();

  const shiftKey = (entry) => [
    String(entry && entry.dateLabel ? entry.dateLabel : '').trim(),
    String(entry && entry.shift ? entry.shift : '').trim().toUpperCase()
  ].join('|');

  const previewEntries = names.map(name => {
    const model = getPersonScheduleEntries(name);
    const nextEntry = (model.entries || []).find(entry => {
      const end = getPersonScheduleEntryEnd(entry);
      return end && end.getTime() > nowMs;
    });
    if (!nextEntry) return null;
    const end = getPersonScheduleEntryEnd(nextEntry);
    if (!end) return null;
    return {
      name,
      dateLabel: nextEntry.dateLabel || '',
      shift: nextEntry.shift || '',
      target: nextEntry.target || '',
      absence: !!nextEntry.absence,
      endMs: end.getTime(),
      key: shiftKey(nextEntry)
    };
  }).filter(Boolean);

  if (!previewEntries.length) {
    setRotaceHtmlIfChanged(personView, "<div class='smallText'>Pro teď tu ještě nejsou žádné budoucí směny.</div>", 'rotaceUpcoming-empty');
    return;
  }

  previewEntries.sort((a, b) => a.endMs - b.endMs || String(a.name).localeCompare(String(b.name), 'cs'));

  const nextShift = previewEntries[0];
  const primaryKey = nextShift.key;
  const shiftEntries = previewEntries
    .filter(entry => entry.key === primaryKey)
    .sort((a, b) => String(a.name).localeCompare(String(b.name), 'cs'));

  const presentEntries = shiftEntries.filter(entry => !entry.absence).slice(0, Math.max(1, limit));
  const presentNames = new Set(presentEntries.map(entry => entry.name));
  const missingNames = names
    .filter(name => !presentNames.has(name))
    .filter((name, index, arr) => arr.indexOf(name) === index)
    .sort((a, b) => String(a).localeCompare(String(b), 'cs'));

  const title = 'Příští směna';
  const nextShiftText = [nextShift && nextShift.dateLabel ? nextShift.dateLabel : '', nextShift && nextShift.shift ? nextShift.shift : ''].filter(Boolean).join(' - ');
  const headerText = nextShiftText ? (title + ' ' + nextShiftText) : title;
  const totalPeople = names.length || Math.max(presentEntries.length + missingNames.length, 1);
  const presentCount = presentEntries.length;
  const missingText = missingNames.length ? missingNames.join(', ') : 'nikdo';
  setRotaceHtmlIfChanged(personView, [
    '<div class="rotacePersonHeader rotaceOverviewHeader">',
    '  <div class="rotacePersonTitle">' + escapeHtml(headerText) + '</div>',
    '</div>',
    '<div class="rotacePersonMeta rotaceOverviewMeta">Přítomno ' + String(presentCount) + ' z ' + String(totalPeople) + ' lidí · Chybí: ' + escapeHtml(missingText) + '</div>',
    '<div class="rotaceQuickCards rotacePreviewGrid rotaceOverviewGrid">',
    presentEntries.length ? presentEntries.map(entry => [
      '<div class="rotaceMiniCard rotaceOverviewCard">',
      '  <div class="rotaceMiniTarget rotaceOverviewName">' + escapeHtml(entry.name || '') + '</div>',
      entry.target ? '  <div class="rotaceMiniDate rotaceOverviewTarget">' + escapeHtml(entry.target || '') + '</div>' : '',
      '</div>'
    ].join('')).join('') : '<div class="rotaceMiniCard rotaceOverviewCard isEmpty"><div class="rotaceMiniTarget rotaceOverviewName">Nikdo není zapsaný jako přítomný.</div></div>',
    '</div>'
  ].join(''), 'rotaceUpcoming-preview');
}

function renderPerson(name) {
  const personView = document.getElementById("personView");
  const schedule = getPersonScheduleEntries(name);
  const entries = Array.isArray(schedule.entries) ? schedule.entries : [];
  const currentIdx = Number.isFinite(schedule.currentIdx) ? schedule.currentIdx : -1;

  if (!entries.length) {
    setRotaceHtmlIfChanged(personView, "<div class='smallText'>Pro tohle jméno zatím nejsou žádné směny.</div>", 'rotacePerson-empty');
    return;
  }

  const startIdx = Math.max(0, currentIdx >= 0 ? currentIdx - 1 : 0);
  const forwardStartIdx = currentIdx >= 0 ? currentIdx : startIdx;
  const previousEntry = currentIdx > 0 ? entries[currentIdx - 1] : null;
  const forwardLimit = previousEntry ? 6 : 7;
  const forwardEntries = entries.slice(forwardStartIdx, Math.min(entries.length, forwardStartIdx + forwardLimit));
  const visibleEntries = previousEntry ? [previousEntry, ...forwardEntries] : forwardEntries;

  const formatEntry = (entry, isCurrent) => [
    '<div class="rotaceMiniCard rotaceShiftCard' + (isCurrent ? ' current' : '') + '">',
    '  <div class="rotaceShiftLine">',
    '    <span class="rotaceShiftDate">' + escapeHtml(entry.dateLabel || "") + '</span>',
    '    <span class="rotaceShiftName">' + escapeHtml(entry.shift || "") + '</span>',
    '    <span class="rotaceShiftTarget">' + escapeHtml(entry.target || "") + '</span>',
    '  </div>',
    '</div>'
  ].join('');

  setRotaceHtmlIfChanged(personView, [
    '<div class="rotacePersonHeader">',
    '  <div class="rotacePersonTitle">' + escapeHtml(name) + '</div>',
    '  <div class="rotacePersonMeta">3× rychle klepni na jméno pro QR kód.</div>',
    '</div>',
    '<div class="rotaceQuickCards rotaceQuickStack">',
    visibleEntries.map((entry) => formatEntry(entry, entry === entries[currentIdx])).join(''),
    '</div>'
  ].join(''), 'rotacePerson-detail-' + String(name || ''));
}

function getRotationRowShiftWindow(monthKey, dateLabel) {
  const parsed = typeof parseDateToken === 'function' ? parseDateToken(String(dateLabel || '')) : null;
  const parsedMonth = typeof parseMonthKey === 'function' ? parseMonthKey(monthKey) : null;
  if (!parsed || !parsedMonth) return null;

  const shift = (typeof normalizeShiftText === 'function'
    ? normalizeShiftText(parsed.shift || '')
    : String(parsed.shift || '').trim()).toUpperCase();
  if (!shift) return null;

  const baseDate = new Date(parsedMonth.year, parsed.month - 1, parsed.day, 0, 0, 0, 0);
  const start = new Date(baseDate);
  const end = new Date(baseDate);

  if (shift.includes('R8')) {
    start.setHours(6, 0, 0, 0);
    end.setHours(14, 0, 0, 0);
  } else if (shift.startsWith('R')) {
    start.setHours(6, 0, 0, 0);
    end.setHours(18, 0, 0, 0);
  } else if (shift.includes('N8')) {
    const specialHour = typeof getSpecialSundayNightStartHour === 'function'
      ? getSpecialSundayNightStartHour(baseDate, 22)
      : 22;
    start.setHours(specialHour, 0, 0, 0);
    end.setDate(end.getDate() + 1);
    end.setHours(6, 0, 0, 0);
  } else if (shift.startsWith('N')) {
    start.setHours(18, 0, 0, 0);
    end.setDate(end.getDate() + 1);
    end.setHours(6, 0, 0, 0);
  } else {
    return null;
  }

  return {
    key: String(parsed.day) + '.' + String(parsed.month) + '.' + '|' + shift,
    start,
    end
  };
}

function getRotationMonthShiftHighlight(monthKey, month) {
  const now = typeof getPragueNow === 'function' ? getPragueNow(new Date()) : new Date();
  const nowMs = now.getTime();
  const windows = [];
  ['hard', 'soft'].forEach(section => {
    const sec = month && month[section] ? month[section] : null;
    (sec && Array.isArray(sec.rows) ? sec.rows : []).forEach(row => {
      const win = getRotationRowShiftWindow(monthKey, row && row.date);
      if (win && !windows.some(item => item.key === win.key)) windows.push(win);
    });
  });

  const current = windows.find(win => win.start.getTime() <= nowMs && nowMs < win.end.getTime()) || null;
  const next = windows
    .filter(win => win.start.getTime() > nowMs)
    .sort((a, b) => a.start - b.start)[0] || null;

  return {
    currentKey: current ? current.key : '',
    // Zvýrazňuje se vždy jen jeden řádek: aktuální směna, a když právě žádná neběží, nejbližší další.
    nextKey: current ? '' : (next ? next.key : '')
  };
}

function renderMonth(monthKey) {

  const month = app.rotation.months[monthKey];
  const monthView = document.getElementById("monthView");
  if (!month || !monthView) return;

  const shiftHighlight = getRotationMonthShiftHighlight(monthKey, month);
  let html = "<div class='sectionTitle'>" + escapeHtml(monthKey) + "</div>";

  const renderTable = (section, label) => {
    const sec = month[section];
    if (!sec) return "";
    let out = "<div class='tableWrap'><table class='rotTable'><thead><tr><th>Datum</th>";
    (sec.machines || []).forEach(m => {
      out += "<th>" + escapeHtml(m) + "</th>";
    });
    out += "</tr></thead><tbody>";

    (sec.rows || []).forEach(row => {
      const rowWindow = getRotationRowShiftWindow(monthKey, row && row.date);
      const rowKey = rowWindow ? rowWindow.key : '';
      const rowClass = rowKey && rowKey === shiftHighlight.currentKey
        ? 'currentShiftRow'
        : (rowKey && rowKey === shiftHighlight.nextKey ? 'nextShiftRow' : '');
      out += "<tr" + (rowClass ? " class='" + rowClass + "'" : "") + "><td class='dateCell'>" + escapeHtml(row.date) + "</td>";
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

  const wrapRotationViewSection = (label, content) => {
    return "<details class='rotationFoldSection rotationViewFold' open><summary>" + escapeHtml(label) + "</summary>" + (content || "<div class='smallText'>Bez dat.</div>") + "</details>";
  };

  html += wrapRotationViewSection("Tvrdota", renderTable("hard", "Tvrdota"));
  html += wrapRotationViewSection("Měkota", renderTable("soft", "Měkota"));

  const absNotes = (month.notes || []).map(normalizeNoteEntry).filter(n => n.isAbsence);
  let absenceHtml = "";

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
    absenceHtml += "<div class='tableWrap'><table class='noteTable'><thead><tr>";
    for (let i = 0; i < maxPairs; i += 1) {
      if (i > 0) absenceHtml += "<th class='noteSpacer'></th>";
      absenceHtml += "<th class='noteDateCell'>Datum</th><th class='noteShiftCell'>Směna</th><th class='notePersonCell'>Jméno</th><th class='noteReasonCell'>Důvod</th>";
    }
    absenceHtml += "</tr></thead><tbody>";

    rows.forEach(row => {
      absenceHtml += "<tr>";
      for (let i = 0; i < maxPairs; i += 1) {
        if (i > 0) absenceHtml += "<td class='noteSpacer'></td>";
        const n = row.items[i];
        if (n) {
          const parsed = parseDateToken(n.date);
          const dateOnly = parsed ? String(parsed.day) + "." + String(parsed.month) + "." : n.date;
          const shift = n.shift || (parsed ? parsed.shift : "");
          const people = (n.people && n.people.length) ? n.people.join(" a ") : (n.person || "");
          const reason = n.label || n.code || "";
          absenceHtml += "<td class='noteDateCell'>" + escapeHtml(dateOnly) + "</td><td class='noteShiftCell'>" + escapeHtml(shift) + "</td><td class='notePersonCell'>" + escapeHtml(people) + "</td><td class='noteReasonCell'>" + escapeHtml(reason) + "</td>";
        } else {
          absenceHtml += "<td class='emptyCell noteDateCell'>—</td><td class='emptyCell noteShiftCell'>—</td><td class='emptyCell notePersonCell'>—</td><td class='emptyCell noteReasonCell'>—</td>";
        }
      }
      absenceHtml += "</tr>";
    });

    absenceHtml += "</tbody></table></div>";
  } else {
    absenceHtml += "<div class='smallText'>Bez poznámek.</div>";
  }

  html += wrapRotationViewSection("Absence", absenceHtml);

  setRotaceHtmlIfChanged(monthView, html, 'rotaceMonth-' + String(monthKey || ''));
}



function getRotationMonthExportFileName(monthKey) {
  const parsed = typeof parseMonthKey === 'function' ? parseMonthKey(monthKey) : null;
  if (parsed && parsed.year && parsed.month) {
    return 'rozpis_' + String(parsed.year) + '_' + String(parsed.month).padStart(2, '0') + '.png';
  }
  return 'rozpis_' + String(monthKey || 'mesic').replace(/[^0-9a-zA-Z_-]+/g, '_') + '.png';
}

function getRotationMonthExportAbsences(month) {
  const notes = Array.isArray(month && month.notes) ? month.notes : [];
  return notes
    .map(n => (typeof normalizeNoteEntry === 'function' ? normalizeNoteEntry(n) : n))
    .filter(n => n && n.isAbsence)
    .map(n => {
      const parsed = typeof parseDateToken === 'function' ? parseDateToken(n.date) : null;
      return {
        date: parsed ? String(parsed.day) + '.' + String(parsed.month) + '.' : String(n.date || ''),
        shift: String(n.shift || (parsed ? parsed.shift : '') || ''),
        people: String((n.people && n.people.length) ? n.people.join(' a ') : (n.person || '')),
        reason: String(n.label || n.code || '')
      };
    });
}

function drawRotationExportRoundRect(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r || 0, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawRotationExportCellText(ctx, text, x, y, w, h, options) {
  const opts = options || {};
  const maxWidth = Math.max(10, w - (opts.pad || 18) * 2);
  const raw = String(text || '').trim() || '—';
  const words = raw.split(/\s+/);
  const lines = [];
  let current = '';
  words.forEach(word => {
    const probe = current ? current + ' ' + word : word;
    if (ctx.measureText(probe).width <= maxWidth || !current) {
      current = probe;
    } else {
      lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  const visible = lines.slice(0, opts.maxLines || 2);
  if (lines.length > visible.length) {
    visible[visible.length - 1] = visible[visible.length - 1].replace(/…?$/, '') + '…';
  }
  const lineHeight = opts.lineHeight || 28;
  const total = visible.length * lineHeight;
  let ty = y + (h - total) / 2 + lineHeight * .78;
  ctx.textAlign = opts.align || 'center';
  ctx.textBaseline = 'alphabetic';
  const tx = ctx.textAlign === 'left' ? x + (opts.pad || 18) : (ctx.textAlign === 'right' ? x + w - (opts.pad || 18) : x + w / 2);
  visible.forEach(line => {
    ctx.fillText(line, tx, ty, maxWidth);
    ty += lineHeight;
  });
}

function drawRotationExportTable(ctx, title, columns, rows, x, y, w, options) {
  const opts = options || {};
  const headerH = opts.headerH || 66;
  const rowH = opts.rowH || 52;
  const titleH = opts.titleH || 88;
  const radius = opts.radius || 32;
  const tableH = titleH + headerH + rowH * Math.max(rows.length, 1);
  drawRotationExportRoundRect(ctx, x, y, w, tableH, radius);
  ctx.fillStyle = opts.panelBg || 'rgba(255,255,255,.92)';
  ctx.fill();
  ctx.strokeStyle = opts.border || 'rgba(28,38,58,.22)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = opts.titleBg || '#0f172a';
  drawRotationExportRoundRect(ctx, x, y, w, titleH, radius);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 46px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, x + 26, y + titleH / 2);

  let cy = y + titleH;
  const totalWeight = Math.max(0.0001, columns.reduce((sum, col) => sum + Math.max(0, Number(col && col.width) || 0), 0));
  const colWidths = columns.map(col => Math.round(w * (Math.max(0, Number(col && col.width) || 0) / totalWeight)));
  colWidths[colWidths.length - 1] += w - colWidths.reduce((a, b) => a + b, 0);

  ctx.fillStyle = opts.headerBg || '#e2e8f0';
  ctx.fillRect(x, cy, w, headerH);
  ctx.strokeStyle = opts.grid || 'rgba(28,38,58,.20)';
  ctx.lineWidth = 1.5;
  let cx = x;
  columns.forEach((col, idx) => {
    const cw = colWidths[idx];
    ctx.strokeRect(cx, cy, cw, headerH);
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 31px system-ui, -apple-system, Segoe UI, sans-serif';
    drawRotationExportCellText(ctx, col.label, cx, cy, cw, headerH, { maxLines: 1, lineHeight: 34, pad: 18 });
    cx += cw;
  });

  cy += headerH;
  const safeRows = rows.length ? rows : [columns.map(() => '—')];
  safeRows.forEach((row, rowIdx) => {
    cx = x;
    ctx.fillStyle = rowIdx % 2 ? 'rgba(241,245,249,.84)' : 'rgba(255,255,255,.88)';
    ctx.fillRect(x, cy, w, rowH);
    row.forEach((cell, idx) => {
      const cw = colWidths[idx];
      const column = Array.isArray(columns) ? (columns[idx] || {}) : {};
      const rawCell = String(cell || '').trim();
      if (opts.highlightEmptyCells && idx > 0 && !rawCell) {
        const emptyBg = ctx.createLinearGradient(cx, cy, cx, cy + rowH);
        emptyBg.addColorStop(0, 'rgba(255,248,184,.92)');
        emptyBg.addColorStop(1, 'rgba(245,198,64,.78)');
        ctx.fillStyle = emptyBg;
        ctx.fillRect(cx + 1, cy + 1, Math.max(0, cw - 2), Math.max(0, rowH - 2));
      }
      ctx.strokeStyle = opts.grid || 'rgba(28,38,58,.20)';
      ctx.strokeRect(cx, cy, cw, rowH);
      const isDate = idx === 0;
      const align = column.align || (Array.isArray(opts.aligns) ? opts.aligns[idx] : '') || opts.align || 'center';
      const textColor = column.textColor || (isDate ? '#0f172a' : '#1e293b');
      const fontWeight = column.fontWeight || (isDate ? '900 ' : '750 ');
      ctx.fillStyle = textColor;
      ctx.font = fontWeight + (opts.fontSize || 22) + 'px system-ui, -apple-system, Segoe UI, sans-serif';
      drawRotationExportCellText(ctx, cell, cx, cy, cw, rowH, {
        maxLines: opts.maxLines || 2,
        lineHeight: opts.lineHeight || 25,
        align,
        pad: typeof column.pad === 'number' ? column.pad : 12
      });
      cx += cw;
    });
    cy += rowH;
  });
  return tableH;
}

function buildRotationExportRows(section) {
  const sec = section || {};
  const machines = Array.isArray(sec.machines) ? sec.machines : [];
  const dateWidth = 0.1215;
  const columns = [{ label: 'Datum', width: dateWidth }];
  const rest = machines.length ? (1 - dateWidth) / machines.length : (1 - dateWidth);
  machines.forEach(machine => columns.push({ label: String(machine || ''), width: rest }));
  const rows = (Array.isArray(sec.rows) ? sec.rows : []).map(row => {
    const cells = [String(row && row.date ? row.date : '')];
    machines.forEach((_, idx) => cells.push(String((row && row.cells ? row.cells[idx] : '') || '')));
    return cells;
  });
  return { columns, rows };
}

function createRotationMonthExportCanvas(monthKey) {
  const month = app && app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  if (!month) throw new Error('Vybraný měsíc není dostupný.');
  const hard = buildRotationExportRows(month.hard);
  const soft = buildRotationExportRows(month.soft);
  const absences = getRotationMonthExportAbsences(month);
  const exportDateColWeight = Number(hard && hard.columns && hard.columns[0] && hard.columns[0].width) || 0.1215;
  const exportMachineColWeight = Number(hard && hard.columns && hard.columns[1] && hard.columns[1].width) || 0.1757;
  const absenceColumns = [
    { label: 'Datum', width: exportDateColWeight, align: 'center', fontWeight: '900 ' },
    { label: 'Jméno', width: exportMachineColWeight, align: 'center', fontWeight: '750 ' },
    { label: 'Důvod', width: exportMachineColWeight, align: 'center', fontWeight: '750 ' }
  ];
  const absenceRows = absences.length
    ? absences.map(row => [String(row.date || '—') + ' ' + String(row.shift || '').trim(), row.people, row.reason])
    : [['—', 'Bez absencí', '—']];

  const width = 4800;
  const margin = 116;
  const titleH = 88;
  const gap = 68;
  const leftW = 1508;
  const rightW = width - margin * 2 - gap - leftW;
  const hardH = 88 + 66 + 52 * Math.max(hard.rows.length, 1);
  const softH = 88 + 66 + 52 * Math.max(soft.rows.length, 1);
  const absenceH = 88 + 66 + 52 * Math.max(absenceRows.length, 1);
  const contentH = Math.max(hardH + gap + softH, absenceH);
  const height = Math.max(2650, margin + titleH + 62 + contentH + margin);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas není dostupný.');

  ctx.fillStyle = '#edf6ff';
  ctx.fillRect(0, 0, width, height);
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#f6fbff');
  bg.addColorStop(.46, '#ebf5ff');
  bg.addColorStop(1, '#e3f0ff');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0f172a';
  ctx.font = '950 78px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Rozpis ' + String(monthKey || ''), margin, margin + 82);

  const top = margin + titleH + 40;
  const leftX = margin;
  const rightX = margin + leftW + gap;
  const hardTotalWeight = Math.max(0.0001, (hard.columns || []).reduce((sum, col) => sum + Math.max(0, Number(col && col.width) || 0), 0));
  const hardDatePx = Math.round(leftW * ((Number(hard && hard.columns && hard.columns[0] && hard.columns[0].width) || 0) / hardTotalWeight));
  const hardMachinePx = Math.round(leftW * ((Number(hard && hard.columns && hard.columns[1] && hard.columns[1].width) || 0) / hardTotalWeight));
  const absenceTableW = Math.min(rightW, Math.max(hardDatePx + hardMachinePx * 2, 420));
  const absenceX = rightX;
  const hardTableH = drawRotationExportTable(ctx, 'Tvrdota', hard.columns, hard.rows, leftX, top, leftW, {
    rowH: 52,
    fontSize: 27,
    lineHeight: 30,
    titleBg: '#0f172a',
    highlightEmptyCells: true
  });
  drawRotationExportTable(ctx, 'Měkota', soft.columns, soft.rows, leftX, top + hardTableH + gap, leftW, {
    rowH: 52,
    fontSize: 27,
    lineHeight: 30,
    titleBg: '#172554',
    highlightEmptyCells: true
  });
  drawRotationExportTable(ctx, 'Absence', absenceColumns, absenceRows, absenceX, top, absenceTableW, {
    rowH: 52,
    fontSize: 22,
    lineHeight: 26,
    maxLines: 2,
    align: 'center',
    titleBg: '#172554'
  });

  ctx.fillStyle = '#64748b';
  ctx.font = '700 25px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('RaK ' + String(window.APP_VERSION || ''), width - margin, height - 52);
  return canvas;
}

function downloadSelectedRotationMonthImage() {
  const select = document.getElementById('monthSelect');
  const monthKey = (select && select.value) || (app && app.selectedMonth) || '';
  if (!monthKey || !app.rotation || !app.rotation.months || !app.rotation.months[monthKey]) {
    alert('Nejdřív vyber měsíc v Rozpisech.');
    return;
  }
  try {
    const canvas = createRotationMonthExportCanvas(monthKey);
    const fileName = getRotationMonthExportFileName(monthKey);
    const triggerDownload = (url) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    };
    if (canvas.toBlob) {
      canvas.toBlob(blob => {
        if (!blob) {
          triggerDownload(canvas.toDataURL('image/png'));
          return;
        }
        const url = URL.createObjectURL(blob);
        triggerDownload(url);
        setTimeout(() => URL.revokeObjectURL(url), 2500);
      }, 'image/png', 1);
    } else {
      triggerDownload(canvas.toDataURL('image/png'));
    }
  } catch (err) {
    alert('Obrázek rozpisu se nepodařilo vytvořit: ' + (err && err.message ? err.message : err));
  }
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

