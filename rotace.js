function renderRotace() {
  const namesGrid = document.getElementById('namesGrid');
  const personView = document.getElementById('personView');
  const monthView = document.getElementById('monthView');

  // v.1.1 (737): respektuj ručně vybraný rok. Dřív se při každém renderu
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
    '  <div class="rotaceShiftLeft">',
    '    <div class="rotaceShiftDate">' + escapeHtml(entry.dateLabel || "") + '</div>',
    '    <div class="rotaceShiftName">' + escapeHtml(entry.shift || "") + '</div>',
    '  </div>',
    '  <div class="rotaceShiftTarget">' + escapeHtml(entry.target || "") + '</div>',
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

