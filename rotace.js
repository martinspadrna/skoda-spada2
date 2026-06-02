// RaK 1.2 (1.109) – Rotace render a volba jmen.
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





const RAK_ROTACE_EMPTY_ABSENCE_TEXT_CONTRACT_V1105 = Object.freeze({
  scope: 'rotace-upcoming-shift-empty-absence-line',
  text: 'Nikdo nebude chybět.'
});

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
  const missingText = missingNames.length ? 'Chybí: ' + missingNames.join(', ') : 'Nikdo nebude chybět.';
  setRotaceHtmlIfChanged(personView, [
    '<div class="rotacePersonHeader rotaceOverviewHeader">',
    '  <div class="rotacePersonTitle">' + escapeHtml(headerText) + '</div>',
    '</div>',
    '<div class="rotacePersonMeta rotaceOverviewMeta">Přítomno ' + String(presentCount) + ' z ' + String(totalPeople) + ' lidí · ' + escapeHtml(missingText) + '</div>',
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
    .map((note, index) => ({
      entry: typeof normalizeNoteEntry === 'function' ? normalizeNoteEntry(note) : note,
      index
    }))
    .filter(item => item.entry && item.entry.isAbsence)
    .flatMap(item => {
      const n = item.entry;
      const parsed = typeof parseDateToken === 'function' ? parseDateToken(n.date) : null;
      const shift = String(n.shift || (parsed ? parsed.shift : '') || '').trim();
      const date = parsed ? String(parsed.day) + '.' + String(parsed.month) + '.' : String(n.date || '');
      const people = (Array.isArray(n.people) && n.people.length)
        ? n.people.map(person => String(person || '').trim()).filter(Boolean)
        : [String(n.person || '').trim()].filter(Boolean);
      const reason = String(n.label || n.code || '').trim();
      const shiftOrder = shift.toUpperCase().startsWith('R') ? 1 : (shift.toUpperCase().startsWith('N') ? 2 : 9);
      const base = {
        date,
        shift,
        day: parsed && Number.isFinite(Number(parsed.day)) ? Number(parsed.day) : 999,
        month: parsed && Number.isFinite(Number(parsed.month)) ? Number(parsed.month) : 999,
        shiftOrder,
        reason,
        index: item.index
      };
      return (people.length ? people : ['']).map((person, personIndex) => ({
        ...base,
        people: person,
        personIndex
      }));
    })
    .sort((a, b) => (a.month - b.month) || (a.day - b.day) || (a.shiftOrder - b.shiftOrder) || (a.index - b.index) || (a.personIndex - b.personIndex));
}

function buildRotationExportAbsenceTable(absences, dateWeight, personWeight) {
  const groups = [];
  const map = new Map();
  (Array.isArray(absences) ? absences : []).forEach(row => {
    const key = [row.date || '', row.shift || ''].join('|');
    let group = map.get(key);
    if (!group) {
      group = {
        label: [String(row.date || '—'), String(row.shift || '').trim()].filter(Boolean).join(' '),
        sort: [Number(row.month) || 999, Number(row.day) || 999, Number(row.shiftOrder) || 9, Number(row.index) || 0],
        items: []
      };
      map.set(key, group);
      groups.push(group);
    }
    group.items.push({ person: String(row.people || '').trim(), reason: String(row.reason || '').trim() });
  });
  groups.sort((a, b) => (a.sort[0] - b.sort[0]) || (a.sort[1] - b.sort[1]) || (a.sort[2] - b.sort[2]) || (a.sort[3] - b.sort[3]));
  const maxItems = Math.max(1, ...groups.map(group => group.items.length));
  const columns = [{ label: 'Datum', width: dateWeight, align: 'center', fontWeight: '900 ' }];
  for (let idx = 0; idx < maxItems; idx += 1) {
    columns.push({ label: 'Jméno', width: personWeight, align: 'center', fontWeight: '750 ' });
    columns.push({ label: 'Důvod', width: personWeight, align: 'center', fontWeight: '750 ' });
  }
  const rows = groups.length
    ? groups.map(group => {
        const cells = [group.label || '—'];
        for (let idx = 0; idx < maxItems; idx += 1) {
          const item = group.items[idx] || {};
          cells.push(item.person || '');
          cells.push(item.reason || '');
        }
        return cells;
      })
    : [['—', 'Bez absencí', '—'].concat(Array.from({ length: Math.max(0, (maxItems - 1) * 2) }, () => ''))];
  return { columns, rows, maxItems };
}


const ROTATION_EXPORT_MONTH_SUMMARY_LABELS_V187 = Object.freeze(['Směn celkem', 'Ranní směny', 'Noční směny', 'Obsazenost']);
const ROTATION_EXPORT_GLASS_THEME_V193 = Object.freeze({
  titleBg: '#0b5bd3',
  titleBgAlt: '#172554',
  panelBgTop: 'rgba(255,255,255,.82)',
  panelBgBottom: 'rgba(244,249,255,.58)',
  border: 'rgba(148,163,184,.34)',
  innerBorder: 'rgba(255,255,255,.74)',
  headerBgTop: 'rgba(255,255,255,.52)',
  headerBgBottom: 'rgba(224,236,255,.72)',
  rowEvenTop: 'rgba(255,255,255,.62)',
  rowEvenBottom: 'rgba(247,250,255,.44)',
  rowOddTop: 'rgba(239,246,255,.70)',
  rowOddBottom: 'rgba(228,238,255,.52)',
  shadow: 'rgba(37, 99, 235, .15)',
  shadowBlur: 34,
  shadowOffsetY: 14,
  glossTop: 'rgba(255,255,255,.40)',
  glossBottom: 'rgba(255,255,255,0)',
  titleGlossTop: 'rgba(255,255,255,.28)',
  titleGlossBottom: 'rgba(255,255,255,0)'
});

function buildRotationMonthExportSummary(month) {
  const summary = {
    shiftKeys: new Set(),
    workDays: new Set(),
    morningShifts: 0,
    nightShifts: 0,
    totalSlots: 0,
    occupiedSlots: 0,
    absenceWeight: 0,
    absencePeople: 0
  };
  const sections = ['hard', 'soft'];
  sections.forEach((sectionKey) => {
    const section = month && month[sectionKey] ? month[sectionKey] : null;
    const machines = Array.isArray(section && section.machines) ? section.machines : [];
    const rows = Array.isArray(section && section.rows) ? section.rows : [];
    rows.forEach((row) => {
      const parsed = typeof parseDateToken === 'function' ? parseDateToken(row && row.date) : null;
      const shiftText = String((parsed && parsed.shift) || '').trim();
      const normalizedShift = typeof normalizeShiftText === 'function' ? normalizeShiftText(shiftText) : shiftText;
      const shiftKey = [String((parsed && parsed.day) || row && row.date || ''), String((parsed && parsed.month) || ''), normalizedShift].join('|');
      if (normalizedShift && !summary.shiftKeys.has(shiftKey)) {
        summary.shiftKeys.add(shiftKey);
        if (/^(?:R|R8)\b|rann/i.test(normalizedShift)) summary.morningShifts += 1;
        else if (/^(?:N|N8)\b|noč|noc/i.test(normalizedShift)) summary.nightShifts += 1;
      }
      if (parsed && Number.isFinite(Number(parsed.day))) {
        summary.workDays.add(String(parsed.day) + '.' + String(parsed.month || ''));
      }
      machines.forEach((machine, idx) => {
        const machineName = String(machine || '').trim();
        if (!machineName) return;
        summary.totalSlots += 1;
        const worker = String(row && row.cells ? row.cells[idx] || '' : '').trim();
        if (worker) summary.occupiedSlots += 1;
      });
    });
  });

  const notes = Array.isArray(month && month.notes) ? month.notes : [];
  notes.forEach((note) => {
    const normalized = typeof normalizeNoteEntry === 'function' ? normalizeNoteEntry(note) : note;
    if (!normalized || !normalized.isAbsence) return;
    const weight = typeof estimateAbsenceWeight === 'function' ? estimateAbsenceWeight(normalized) : 1;
    const people = Array.isArray(normalized.people) ? normalized.people.filter(Boolean) : [];
    summary.absenceWeight += weight * Math.max(1, people.length || (normalized.person ? 1 : 0));
    summary.absencePeople += Math.max(1, people.length || (normalized.person ? 1 : 0));
  });

  const totalShifts = summary.shiftKeys.size;
  const plannedOccupiedSlots = Math.max(0, summary.occupiedSlots);
  const adjustedOccupiedSlots = Math.max(0, plannedOccupiedSlots - summary.absenceWeight);
  const occupancyPercent = summary.totalSlots > 0 ? Math.round((adjustedOccupiedSlots / summary.totalSlots) * 1000) / 10 : 0;
  const formatNumber = (value) => (Math.round((Number(value) || 0) * 10) / 10).toString().replace('.', ',');
  const formatPercent = (value) => formatNumber(value) + ' %';
  const valuesByLabel = {
    'Směn celkem': totalShifts,
    'Ranní směny': summary.morningShifts,
    'Noční směny': summary.nightShifts,
    'Obsazenost': formatPercent(occupancyPercent)
  };
  const rows = ROTATION_EXPORT_MONTH_SUMMARY_LABELS_V187.map(label => ({ label, value: valuesByLabel[label] }));
  return { rows, totalShifts, morningShifts: summary.morningShifts, nightShifts: summary.nightShifts, occupancyPercent, totalSlots: summary.totalSlots, occupiedSlots: adjustedOccupiedSlots, absenceWeight: summary.absenceWeight, absencePeople: summary.absencePeople };
}

function getRotationExportSummaryCardHeight(rows, options) {
  const opts = options || {};
  const rowH = Math.max(36, Number(opts.rowH) || 44);
  const titleH = Math.max(72, Number(opts.titleH) || 82);
  const headerH = Math.max(48, Number(opts.headerH) || 58);
  const note = String(opts.note || '').trim();
  const noteH = note ? Math.max(48, Number(opts.noteH) || 58) : 0;
  const dataRows = Array.isArray(rows) && rows.length ? rows : [{ label: 'Bez dat', value: '—' }];
  return titleH + headerH + rowH * dataRows.length + noteH;
}

function drawRotationExportSummaryCard(ctx, title, rows, x, y, w, options) {
  const opts = Object.assign({}, ROTATION_EXPORT_GLASS_THEME_V193, options || {});
  const labelWeight = Math.max(0.35, Math.min(0.72, Number(opts.labelWeight) || 0.64));
  const rowH = Math.max(36, Number(opts.rowH) || 44);
  const titleH = Math.max(72, Number(opts.titleH) || 82);
  const headerH = Math.max(48, Number(opts.headerH) || 58);
  const note = String(opts.note || '').trim();
  const noteH = note ? Math.max(48, Number(opts.noteH) || 58) : 0;
  const dataRows = Array.isArray(rows) && rows.length ? rows : [{ label: 'Bez dat', value: '—' }];
  const tableH = getRotationExportSummaryCardHeight(dataRows, opts);

  drawRotationExportGlassPanelShell(ctx, x, y, w, tableH, 28, opts);
  drawRotationExportGlassTitleBar(ctx, x, y, w, titleH, 28, opts);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 37px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(title || 'Přehled'), x + 28, y + titleH / 2 + 1);

  const headerY = y + titleH;
  const labelW = Math.round(w * labelWeight);
  const valueW = w - labelW;
  fillRotationExportGlassBand(ctx, x, headerY, w, headerH, opts.headerBgTop, opts.headerBgBottom);
  ctx.strokeStyle = 'rgba(28,38,58,.18)';
  ctx.strokeRect(x, headerY, w, headerH);
  ctx.strokeRect(x + labelW, headerY, valueW, headerH);
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 21px system-ui, -apple-system, Segoe UI, sans-serif';
  drawRotationExportCellText(ctx, 'Ukazatel', x, headerY, labelW, headerH, { maxLines: 1, lineHeight: 24, align: 'left', pad: 16 });
  drawRotationExportCellText(ctx, 'Hodnota', x + labelW, headerY, valueW, headerH, { maxLines: 1, lineHeight: 24, align: 'center', pad: 12 });

  dataRows.forEach((row, rowIdx) => {
    const rowY = headerY + headerH + rowIdx * rowH;
    fillRotationExportGlassBand(
      ctx,
      x,
      rowY,
      w,
      rowH,
      rowIdx % 2 ? opts.rowOddTop : opts.rowEvenTop,
      rowIdx % 2 ? opts.rowOddBottom : opts.rowEvenBottom
    );
    ctx.strokeStyle = 'rgba(28,38,58,.16)';
    ctx.strokeRect(x, rowY, labelW, rowH);
    ctx.strokeRect(x + labelW, rowY, valueW, rowH);
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 20px system-ui, -apple-system, Segoe UI, sans-serif';
    drawRotationExportCellText(ctx, String(row && row.label || '—'), x, rowY, labelW, rowH, { maxLines: 2, lineHeight: 21, align: 'left', pad: 16 });
    ctx.font = '900 20px system-ui, -apple-system, Segoe UI, sans-serif';
    drawRotationExportCellText(ctx, String(row && row.value || '—'), x + labelW, rowY, valueW, rowH, { maxLines: 2, lineHeight: 21, align: 'center', pad: 12 });
  });
  if (note) {
    const noteY = headerY + headerH + dataRows.length * rowH;
    fillRotationExportGlassBand(ctx, x, noteY, w, noteH, 'rgba(255,255,255,.42)', 'rgba(231,238,250,.56)');
    ctx.strokeStyle = 'rgba(28,38,58,.16)';
    ctx.strokeRect(x, noteY, w, noteH);
    ctx.fillStyle = 'rgba(15,23,42,.78)';
    ctx.font = '800 18px system-ui, -apple-system, Segoe UI, sans-serif';
    drawRotationExportCellText(ctx, note, x, noteY, w, noteH, { maxLines: 2, lineHeight: 20, align: 'left', pad: 18 });
  }
  return tableH;
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


function drawRotationExportGlassPanelShell(ctx, x, y, w, h, radius, options) {
  const opts = Object.assign({}, ROTATION_EXPORT_GLASS_THEME_V193, options || {});
  drawRotationExportRoundRect(ctx, x, y, w, h, radius);
  ctx.save();
  ctx.shadowColor = opts.shadow;
  ctx.shadowBlur = Math.max(0, Number(opts.shadowBlur) || 0);
  ctx.shadowOffsetY = Number(opts.shadowOffsetY) || 0;
  const panelBg = ctx.createLinearGradient(x, y, x, y + h);
  panelBg.addColorStop(0, opts.panelBgTop);
  panelBg.addColorStop(1, opts.panelBgBottom);
  ctx.fillStyle = panelBg;
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawRotationExportRoundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  const gloss = ctx.createLinearGradient(x, y, x, y + h * 0.46);
  gloss.addColorStop(0, opts.glossTop);
  gloss.addColorStop(.7, opts.glossBottom);
  ctx.fillStyle = gloss;
  ctx.fillRect(x + 2, y + 2, Math.max(0, w - 4), Math.max(0, h * 0.48));
  ctx.restore();

  drawRotationExportRoundRect(ctx, x, y, w, h, radius);
  ctx.strokeStyle = opts.border;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  if (w > 6 && h > 6) {
    drawRotationExportRoundRect(ctx, x + 1.5, y + 1.5, w - 3, h - 3, Math.max(0, radius - 1.5));
    ctx.strokeStyle = opts.innerBorder;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawRotationExportGlassTitleBar(ctx, x, y, w, titleH, radius, options) {
  const opts = Object.assign({}, ROTATION_EXPORT_GLASS_THEME_V193, options || {});
  const titleBg = ctx.createLinearGradient(x, y, x + w, y + titleH);
  titleBg.addColorStop(0, opts.titleBg);
  titleBg.addColorStop(1, opts.titleBgAlt);
  ctx.save();
  drawRotationExportRoundRect(ctx, x, y, w, titleH, radius);
  ctx.clip();
  ctx.fillStyle = titleBg;
  ctx.fillRect(x, y, w, titleH);
  const gloss = ctx.createLinearGradient(x, y, x, y + titleH);
  gloss.addColorStop(0, opts.titleGlossTop);
  gloss.addColorStop(.72, opts.titleGlossBottom);
  ctx.fillStyle = gloss;
  ctx.fillRect(x, y, w, titleH);
  ctx.restore();
}

function fillRotationExportGlassBand(ctx, x, y, w, h, startColor, endColor) {
  const band = ctx.createLinearGradient(x, y, x, y + h);
  band.addColorStop(0, startColor);
  band.addColorStop(1, endColor);
  ctx.fillStyle = band;
  ctx.fillRect(x, y, w, h);
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
  const opts = Object.assign({}, ROTATION_EXPORT_GLASS_THEME_V193, options || {});
  const headerH = opts.headerH || 66;
  const rowH = opts.rowH || 52;
  const titleH = opts.titleH || 88;
  const radius = opts.radius || 32;
  const tableH = titleH + headerH + rowH * Math.max(rows.length, 1);
  drawRotationExportGlassPanelShell(ctx, x, y, w, tableH, radius, opts);
  drawRotationExportGlassTitleBar(ctx, x, y, w, titleH, radius, opts);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 46px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, x + 26, y + titleH / 2);

  let cy = y + titleH;
  const totalWeight = Math.max(0.0001, columns.reduce((sum, col) => sum + Math.max(0, Number(col && col.width) || 0), 0));
  const colWidths = columns.map(col => Math.round(w * (Math.max(0, Number(col && col.width) || 0) / totalWeight)));
  colWidths[colWidths.length - 1] += w - colWidths.reduce((a, b) => a + b, 0);

  fillRotationExportGlassBand(ctx, x, cy, w, headerH, opts.headerBgTop, opts.headerBgBottom);
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
    fillRotationExportGlassBand(
      ctx,
      x,
      cy,
      w,
      rowH,
      rowIdx % 2 ? opts.rowOddTop : opts.rowEvenTop,
      rowIdx % 2 ? opts.rowOddBottom : opts.rowEvenBottom
    );
    row.forEach((cell, idx) => {
      const cw = colWidths[idx];
      const column = Array.isArray(columns) ? (columns[idx] || {}) : {};
      const rawCell = String(cell || '').trim();
      if (opts.highlightEmptyCells && idx > 0 && !rawCell) {
        const emptyBg = ctx.createLinearGradient(cx, cy, cx, cy + rowH);
        emptyBg.addColorStop(0, 'rgba(255,248,184,.78)');
        emptyBg.addColorStop(1, 'rgba(245,198,64,.54)');
        ctx.fillStyle = emptyBg;
        ctx.fillRect(cx + 1, cy + 1, Math.max(0, cw - 2), Math.max(0, rowH - 2));
      }
      ctx.strokeStyle = opts.grid || 'rgba(28,38,58,.18)';
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
  const absenceTable = buildRotationExportAbsenceTable(absences, exportDateColWeight, exportMachineColWeight);
  const absenceColumns = absenceTable.columns;
  const absenceRows = absenceTable.rows;
  const monthSummary = buildRotationMonthExportSummary(month);

  const margin = 96;
  const titleH = 88;
  const gap = 68;
  const footerH = 46;
  const exportScale = 2;
  const footerText = 'Vygenerováno aplikací RaK ze stránky https://skoda-spada.vercel.app';
  const leftW = 1508;
  const hardTotalWeightForExport = Math.max(0.0001, (hard.columns || []).reduce((sum, col) => sum + Math.max(0, Number(col && col.width) || 0), 0));
  const hardDatePxForExport = Math.round(leftW * ((Number(hard && hard.columns && hard.columns[0] && hard.columns[0].width) || 0) / hardTotalWeightForExport));
  const hardMachinePxForExport = Math.round(leftW * ((Number(hard && hard.columns && hard.columns[1] && hard.columns[1].width) || 0) / hardTotalWeightForExport));
  const absenceTableW = Math.max(hardDatePxForExport + hardMachinePxForExport * Math.max(2, (absenceColumns.length - 1)), 420);
  const contentW = leftW + gap + absenceTableW;
  const width = Math.ceil(margin * 2 + contentW);
  const hardH = 88 + 66 + 52 * Math.max(hard.rows.length, 1);
  const softH = 88 + 66 + 52 * Math.max(soft.rows.length, 1);
  const absenceH = 88 + 66 + 52 * Math.max(absenceRows.length, 1);
  const summaryCardOptions = Object.assign({}, ROTATION_EXPORT_GLASS_THEME_V193, { rowH: 44, titleH: 82, headerH: 58 });
  const summaryH = getRotationExportSummaryCardHeight(monthSummary && monthSummary.rows, summaryCardOptions);
  const leftColumnH = hardH + gap + softH;
  const rightColumnH = absenceH + gap + summaryH;
  const contentH = Math.max(leftColumnH, rightColumnH);
  const exportFooterSafeGap = 36;
  const height = Math.ceil(margin + titleH + 62 + contentH + exportFooterSafeGap + footerH + margin);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width * exportScale);
  canvas.height = Math.ceil(height * exportScale);
  canvas.style.width = String(width) + 'px';
  canvas.style.height = String(height) + 'px';
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas není dostupný.');
  ctx.setTransform(exportScale, 0, 0, exportScale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.fillStyle = '#edf6ff';
  ctx.fillRect(0, 0, width, height);
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#f9fcff');
  bg.addColorStop(.42, '#edf5ff');
  bg.addColorStop(1, '#dce9fb');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const glowTopRight = ctx.createRadialGradient(width * 0.85, height * 0.12, 24, width * 0.85, height * 0.12, width * 0.42);
  glowTopRight.addColorStop(0, 'rgba(255,255,255,.80)');
  glowTopRight.addColorStop(.45, 'rgba(214,231,255,.36)');
  glowTopRight.addColorStop(1, 'rgba(214,231,255,0)');
  ctx.fillStyle = glowTopRight;
  ctx.fillRect(0, 0, width, height);

  const glowBottomLeft = ctx.createRadialGradient(width * 0.16, height * 0.82, 18, width * 0.16, height * 0.82, width * 0.38);
  glowBottomLeft.addColorStop(0, 'rgba(255,255,255,.58)');
  glowBottomLeft.addColorStop(.42, 'rgba(181,214,255,.24)');
  glowBottomLeft.addColorStop(1, 'rgba(181,214,255,0)');
  ctx.fillStyle = glowBottomLeft;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#0f172a';
  ctx.font = '950 78px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Rozpis ' + String(monthKey || ''), margin, margin + 82);

  const top = margin + titleH + 40;
  const leftX = margin;
  const rightX = margin + leftW + gap;
  const absenceX = rightX;
  const hardTableH = drawRotationExportTable(ctx, 'Tvrdota', hard.columns, hard.rows, leftX, top, leftW, {
    rowH: 52,
    fontSize: 27,
    lineHeight: 30,
    highlightEmptyCells: true
  });
  drawRotationExportTable(ctx, 'Měkota', soft.columns, soft.rows, leftX, top + hardTableH + gap, leftW, {
    rowH: 52,
    fontSize: 27,
    lineHeight: 30,
    highlightEmptyCells: true
  });
  const drawnAbsenceH = drawRotationExportTable(ctx, 'Absence', absenceColumns, absenceRows, absenceX, top, absenceTableW, {
    rowH: 52,
    fontSize: 22,
    lineHeight: 26,
    maxLines: 2,
    align: 'center'
  });
  drawRotationExportSummaryCard(ctx, 'Měsíční přehled', monthSummary.rows, absenceX, top + drawnAbsenceH + gap, absenceTableW, Object.assign({}, summaryCardOptions, {
    labelWeight: 0.65
  }));

  ctx.fillStyle = 'rgba(30,41,59,.74)';
  ctx.font = '800 22px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(footerText, width - margin, height - Math.max(24, Math.round(margin * .35)));

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

