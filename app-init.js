function bindAdminSecretUnlock() {
  if (document.documentElement.dataset.adminSecretBound === '1') return true;
  document.documentElement.dataset.adminSecretBound = '1';

  let tapCount = 0;
  let tapTimer = null;

  registerListener(document, 'click', (event) => {
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
  }, { capture: true });

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
  registerListener(document, 'DOMContentLoaded', bindAdminSecretUnlock, { once: true });
}




function normalizeExcelImportMonthKey(value, fallbackYear) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const lower = raw.toLowerCase().replace(/\s+/g, ' ');
  const monthNames = {
    'leden': 1, 'ledna': 1, 'led': 1, 'january': 1, 'jan': 1,
    'únor': 2, 'unor': 2, 'února': 2, 'unora': 2, 'úno': 2, 'uno': 2, 'february': 2, 'feb': 2,
    'březen': 3, 'brezen': 3, 'března': 3, 'brezna': 3, 'bře': 3, 'bre': 3, 'march': 3, 'mar': 3,
    'duben': 4, 'dubna': 4, 'dub': 4, 'april': 4, 'apr': 4,
    'květen': 5, 'kveten': 5, 'května': 5, 'kvetna': 5, 'kvě': 5, 'kve': 5, 'may': 5,
    'červen': 6, 'cerven': 6, 'června': 6, 'cervna': 6, 'čvn': 6, 'cvn': 6, 'june': 6, 'jun': 6,
    'červenec': 7, 'cervenec': 7, 'července': 7, 'cervence': 7, 'čvc': 7, 'cvc': 7, 'july': 7, 'jul': 7,
    'srpen': 8, 'srpna': 8, 'srp': 8, 'august': 8, 'aug': 8,
    'září': 9, 'zari': 9, 'zář': 9, 'zar': 9, 'september': 9, 'sep': 9,
    'říjen': 10, 'rijen': 10, 'října': 10, 'rijna': 10, 'říj': 10, 'rij': 10, 'october': 10, 'oct': 10,
    'listopad': 11, 'listopadu': 11, 'lis': 11, 'november': 11, 'nov': 11,
    'prosinec': 12, 'prosince': 12, 'pro': 12, 'december': 12, 'dec': 12
  };

  const toYear = (value) => {
    const n = parseInt(value, 10);
    if (!Number.isFinite(n)) return NaN;
    if (n < 100) return 2000 + n;
    return n;
  };
  const build = (month, year) => {
    const y = Number.isFinite(year) ? year : (Number.isFinite(Number(fallbackYear)) ? Number(fallbackYear) : new Date().getFullYear());
    if (typeof monthKeyFromYearMonth === 'function') return monthKeyFromYearMonth(y, month);
    return String(month) + '/' + String(y).slice(-2);
  };

  let m = lower.match(/(?:^|\D)(1[0-2]|0?[1-9])\s*[./\-]\s*(20\d{2}|\d{2})(?:\D|$)/);
  if (m) return build(parseInt(m[1], 10), toYear(m[2]));

  m = lower.match(/(?:^|\D)(20\d{2})\s*[./\-]\s*(1[0-2]|0?[1-9])(?:\D|$)/);
  if (m) return build(parseInt(m[2], 10), toYear(m[1]));

  for (const [name, month] of Object.entries(monthNames)) {
    if (lower.includes(name)) {
      const y = lower.match(/(20\d{2}|\b\d{2}\b)/);
      return build(month, y ? toYear(y[1]) : Number(fallbackYear));
    }
  }

  m = lower.match(/^(1[0-2]|0?[1-9])$/);
  if (m) return build(parseInt(m[1], 10), Number(fallbackYear));
  return raw;
}

function getExcelImportOptions() {
  const scopeEl = document.getElementById('rakExcelImportScope');
  const detectedMonthEl = document.getElementById('rakExcelImportDetectedMonth');
  const legacyMonthEl = document.getElementById('rakExcelImportMonth');
  const yearEl = document.getElementById('rakExcelImportYear') || document.getElementById('importYearSelect');
  const fallbackYear = parseInt(yearEl && yearEl.value, 10) || app.importYear || app.selectedYear || new Date().getFullYear();
  const scope = scopeEl && scopeEl.value ? String(scopeEl.value) : 'all';
  const selectedMonth = detectedMonthEl && detectedMonthEl.value ? String(detectedMonthEl.value) : '';
  const legacyMonth = legacyMonthEl && legacyMonthEl.value ? String(legacyMonthEl.value) : '';
  const monthKey = selectedMonth || normalizeExcelImportMonthKey(legacyMonth, fallbackYear);
  return { scope, monthKey, fallbackYear };
}

function rakExcelFormatMonthLabel(monthKey) {
  const parsed = typeof parseMonthKey === 'function' ? parseMonthKey(monthKey) : null;
  const names = ['', 'leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
  if (parsed && parsed.month && parsed.year) {
    return monthKey + ' · ' + (names[parsed.month] || ('měsíc ' + parsed.month)) + ' ' + parsed.year;
  }
  return String(monthKey || '');
}

function getRakExcelImportPreview() {
  if (!app.excelImportPreview || !app.excelImportPreview.months) return null;
  return app.excelImportPreview;
}

function setRakExcelImportStatus(text, isError) {
  const status = document.getElementById('rakExcelImportStatus') || document.getElementById('adminOnlineSaveStatus');
  if (!status) return;
  status.textContent = text || '';
  status.classList.toggle('isError', !!isError);
}

function updateRakExcelImportPreviewUi() {
  const preview = getRakExcelImportPreview();
  const fileStatus = document.getElementById('rakExcelImportFileStatus');
  const monthSelect = document.getElementById('rakExcelImportDetectedMonth');
  const commitBtn = document.getElementById('rakExcelImportCommitBtn');
  const scopeEl = document.getElementById('rakExcelImportScope');
  if (fileStatus) {
    fileStatus.textContent = preview
      ? ('Načteno: ' + preview.fileName + ' · měsíčních listů: ' + preview.monthKeys.length)
      : 'Zatím není vybraný žádný Excel.';
  }
  if (monthSelect) {
    const selectedBefore = monthSelect.value;
    monthSelect.innerHTML = '';
    if (!preview || !preview.monthKeys.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Nejdřív vyber Excel';
      monthSelect.appendChild(opt);
      monthSelect.disabled = true;
    } else {
      preview.monthKeys.forEach((monthKey) => {
        const opt = document.createElement('option');
        opt.value = monthKey;
        opt.textContent = rakExcelFormatMonthLabel(monthKey);
        monthSelect.appendChild(opt);
      });
      monthSelect.disabled = false;
      if (selectedBefore && preview.monthKeys.includes(selectedBefore)) monthSelect.value = selectedBefore;
    }
  }
  if (commitBtn) commitBtn.disabled = !(preview && preview.monthKeys.length);
  if (scopeEl && !scopeEl.value) scopeEl.value = 'all';
}
window.updateRakExcelImportPreviewUi = updateRakExcelImportPreviewUi;

async function buildRakExcelImportPreview(file) {
  if (!file) throw new Error('Vyber Excel soubor.');
  if (typeof XLSX === 'undefined') throw new Error('Knihovna pro Excel se nenačetla.');
  const yearEl = document.getElementById('rakExcelImportYear') || document.getElementById('importYearSelect');
  const fallbackYear = parseInt(yearEl && yearEl.value, 10) || app.importYear || app.selectedYear || new Date().getFullYear();
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const imported = parseWorkbookFromSheetJS(wb, { scope: 'all', fallbackYear });
  const months = imported && imported.months ? imported.months : {};
  const monthKeys = Object.keys(months).sort((a, b) => {
    const pa = typeof parseMonthKey === 'function' ? parseMonthKey(a) : null;
    const pb = typeof parseMonthKey === 'function' ? parseMonthKey(b) : null;
    const ya = pa && pa.year ? pa.year : 0;
    const yb = pb && pb.year ? pb.year : 0;
    const ma = pa && pa.month ? pa.month : 0;
    const mb = pb && pb.month ? pb.month : 0;
    return ya === yb ? ma - mb : ya - yb;
  });
  app.excelImportPreview = {
    file,
    fileName: file.name || 'Excel',
    fallbackYear,
    imported,
    months,
    monthKeys,
    createdAt: Date.now()
  };
  updateRakExcelImportPreviewUi();
  if (!monthKeys.length) {
    const warn = imported && imported.warnings && imported.warnings.length ? ' · ' + imported.warnings.slice(0, 2).join(' / ') : '';
    setRakExcelImportStatus('Excel jsem načetl, ale nenašel jsem použitelný měsíc.' + warn, true);
  } else {
    setRakExcelImportStatus('Excel načtený. V seznamu jsou jen měsíční listy typu 01.2025; pomocné listy se přeskakují. Vyber celý rok nebo konkrétní měsíc.', false);
  }
  return app.excelImportPreview;
}
window.buildRakExcelImportPreview = buildRakExcelImportPreview;

async function ensureFreshRakExcelImportPreview() {
  const input = document.getElementById('excelFile');
  const file = input && input.files && input.files[0];
  const options = getExcelImportOptions();
  const preview = getRakExcelImportPreview();
  if (!preview || (file && preview.file !== file) || Number(preview.fallbackYear) !== Number(options.fallbackYear)) {
    if (!file && !preview) throw new Error('Nejdřív vyber Excel soubor.');
    return buildRakExcelImportPreview(file || preview.file);
  }
  return preview;
}

async function performRakExcelImportFromPreview() {
  const preview = await ensureFreshRakExcelImportPreview();
  const importOptions = getExcelImportOptions();
  const importedMonths = preview && preview.months ? preview.months : {};
  const sourceEntries = Object.entries(importedMonths);
  const entries = importOptions.scope === 'month'
    ? sourceEntries.filter(([monthKey]) => monthKey === importOptions.monthKey)
    : sourceEntries;

  if (importOptions.scope === 'month' && !importOptions.monthKey) {
    alert('Vyber měsíc z načteného Excelu.');
    return;
  }

  if (!entries.length) {
    const warn = preview.imported && preview.imported.warnings && preview.imported.warnings.length ? '\n\n' + preview.imported.warnings.slice(0, 4).join('\n') : '';
    alert(importOptions.scope === 'month'
      ? ('V Excelu jsem nenašel vybraný měsíc ' + importOptions.monthKey + '.' + warn)
      : ('V Excelu jsem nenašel žádný použitelný rozpis.' + warn));
    return;
  }

  let added = 0;
  let overwritten = 0;
  let selectedImportedMonth = '';

  entries.forEach(([monthKey, monthData]) => {
    const fallback = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
    const normalized = normalizeMonthForImport(monthData, fallback);
    const existed = !!(app.rotation && app.rotation.months && app.rotation.months[monthKey]);
    if (!app.rotation.months) app.rotation.months = {};
    app.rotation.months[monthKey] = normalized;
    selectedImportedMonth = selectedImportedMonth || monthKey;
    if (existed) overwritten += 1;
    else added += 1;
  });

  app.rotation = normalizeRotationData(app.rotation);
  if (selectedImportedMonth) app.selectedMonth = selectedImportedMonth;

  const importedYears = new Set(entries.map(([monthKey]) => {
    const parsed = typeof parseMonthKey === 'function' ? parseMonthKey(monthKey) : null;
    return parsed && parsed.year ? parsed.year : null;
  }).filter(Boolean));
  const selectedParsedMonth = selectedImportedMonth && typeof parseMonthKey === 'function' ? parseMonthKey(selectedImportedMonth) : null;
  if (importedYears.size === 1) {
    app.selectedYear = Array.from(importedYears)[0];
  } else if (selectedParsedMonth && selectedParsedMonth.year) {
    app.selectedYear = selectedParsedMonth.year;
  } else if (!getAvailableYears(app.rotation).includes(parseInt(app.selectedYear, 10))) {
    app.selectedYear = getInitialSelectedYear(app.rotation);
  }
  app.importYear = parseInt(app.selectedYear, 10) || app.importYear;
  if (typeof syncYearControls === 'function') syncYearControls();
  saveRotationData();

  let onlineMessage = 'Online uložení se přeskočilo.';
  const onlineResult = await saveRotationToSupabase(app.rotation, {
    source: 'excel-import',
    importScope: importOptions.scope,
    monthKey: importOptions.scope === 'month' ? importOptions.monthKey : '',
    importedMonths: entries.map(([monthKey]) => monthKey)
  });
  if (onlineResult && onlineResult.ok === true) {
    onlineMessage = 'Uloženo online ✓ · měsíců: ' + String(onlineResult.months || entries.length) + ' · řádků: ' + String(onlineResult.entries || 0);
  } else if (onlineResult && onlineResult.reason === 'missing-bridge') {
    onlineMessage = 'Online můstek není dostupný, zůstalo lokálně.';
  } else {
    onlineMessage = 'Online uložení se nepodařilo, zůstalo lokálně.';
  }

  renderRotace();

  if (app.selectedMonth && app.rotation.months[app.selectedMonth]) {
    renderMonth(app.selectedMonth);
  }
  if (app.selectedName) renderPerson(app.selectedName);

  const msg = [];
  if (added) msg.push('Přidáno měsíců: ' + added);
  if (overwritten) msg.push('Přepsáno měsíců: ' + overwritten);
  msg.push(onlineMessage);
  if (preview.imported && preview.imported.warnings && preview.imported.warnings.length) msg.push('Upozornění: ' + preview.imported.warnings.slice(0, 2).join(' / '));
  setRakExcelImportStatus(msg.join(' | '), false);
  alert(msg.join(' | '));
}
window.performRakExcelImportFromPreview = performRakExcelImportFromPreview;

function rakExcelCellText(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return String(value.getDate()) + '.' + String(value.getMonth() + 1) + '.';
  }
  return String(value).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function rakExcelRowText(row) {
  return (Array.isArray(row) ? row : []).map(rakExcelCellText).join(' ').replace(/\s+/g, ' ').trim();
}

function rakExcelNormalizeHeader(value) {
  return rakExcelCellText(value).toUpperCase().replace(/\s+/g, '').replace(/[–—-]/g, '');
}

function rakExcelNormalizeLoose(value) {
  return rakExcelCellText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[–—-]/g, '');
}

function rakExcelMonthKeyFromSheetName(sheetName, fallbackYear) {
  const raw = rakExcelCellText(sheetName);
  if (!raw) return '';
  // Import rozpisů bere jen skutečné měsíční záložky. Měsíc/rok se nesmí brát z buněk,
  // jinak se do výběru pletou hodnoty typu 1/10 nebo 6/10 ze souhrnů.
  const m = raw.match(/^\s*(0?[1-9]|1[0-2])\s*[./\-]\s*(20\d{2}|\d{2})\s*$/);
  if (!m) return '';
  const month = parseInt(m[1], 10);
  let year = parseInt(m[2], 10);
  if (year < 100) year += 2000;
  return (typeof monthKeyFromYearMonth === 'function') ? monthKeyFromYearMonth(year, month) : (String(month) + '/' + String(year).slice(-2));
}

function rakExcelLooksLikeMachineHeader(value, section) {
  const text = rakExcelNormalizeLoose(value);
  if (!text || text.length > 14) return false;
  if (section === 'hard') return /^(TNKS|TBKR|TPKW)\d{2}$/.test(text);
  if (section === 'soft') return /^(MSKC|MFKF)\d{2}$/.test(text);
  return /^(TNKS|TBKR|TPKW|MSKC|MFKF)\d{2}$/.test(text);
}

function rakExcelFindSectionHeader(rows, section) {
  const typeNeedle = section === 'hard' ? 'TVRD' : 'MEK';
  const fallbackHeaders = section === 'hard' ? HARD_MACHINE_HEADERS : SOFT_MACHINE_HEADERS;
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    const rowText = rakExcelNormalizeLoose(row.map(rakExcelCellText).filter(Boolean).join(' '));
    if (!rowText || !rowText.includes('ROTACE') || !rowText.includes(typeNeedle)) continue;

    let titleColumn = row.findIndex((cell) => {
      const text = rakExcelNormalizeLoose(cell);
      return text.includes('ROTACE') && text.includes(typeNeedle);
    });
    if (titleColumn < 0) titleColumn = row.findIndex((cell) => rakExcelCellText(cell));
    if (titleColumn < 0) titleColumn = 0;

    const machineColumns = [];
    for (let column = titleColumn + 1; column < row.length; column += 1) {
      const label = rakExcelCellText(row[column]);
      if (!label) {
        if (machineColumns.length) break;
        continue;
      }
      if (rakExcelLooksLikeMachineHeader(label, section)) {
        machineColumns.push({ column, machineIndex: machineColumns.length, label });
        continue;
      }
      if (machineColumns.length) break;
    }

    if (machineColumns.length >= 2) return { rowIndex, titleColumn, dateColumn: titleColumn, machineColumns };

    const fallbackHits = [];
    (Array.isArray(row) ? row : []).forEach((cell, column) => {
      const text = rakExcelNormalizeLoose(cell);
      fallbackHeaders.forEach((header, hIndex) => {
        if (text && text === rakExcelNormalizeLoose(header)) fallbackHits.push({ column, machineIndex: hIndex, label: rakExcelCellText(cell) || header });
      });
    });
    if (fallbackHits.length >= 2) {
      fallbackHits.sort((a, b) => a.column - b.column);
      return { rowIndex, titleColumn, dateColumn: Math.max(0, Math.min(...fallbackHits.map((x) => x.column)) - 1), machineColumns: fallbackHits };
    }
  }
  return null;
}

function rakExcelParseDate(value, fallbackMonth, fallbackYear) {
  const text = rakExcelCellText(value);
  if (!text) return '';
  let m = text.match(/(\d{1,2})\s*[.]\s*(\d{1,2})\s*[.]?\s*(?:20\d{2}|\d{2})?\s*([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0-9]*)?/i);
  if (m) {
    const shift = String(m[3] || '').trim().toUpperCase();
    return String(parseInt(m[1], 10)) + '.' + String(parseInt(m[2], 10)) + '.' + (shift ? ' ' + shift : '');
  }
  m = text.match(/^(\d{1,2})\s*([RND]{1}\d?)?$/i);
  if (m && fallbackMonth) {
    const shift = String(m[2] || '').trim().toUpperCase();
    return String(parseInt(m[1], 10)) + '.' + String(fallbackMonth) + '.' + (shift ? ' ' + shift : '');
  }
  return '';
}

function rakExcelIsProbablyDateCell(value) {
  const text = rakExcelCellText(value);
  return !!text && (/\d{1,2}\s*[.]\s*\d{1,2}/.test(text) || /^\d{1,2}\s*[RND]?\d?$/i.test(text));
}

function rakExcelFindDateColumn(rows, startRow, machineColumns) {
  const minCol = Math.min(...machineColumns.map((x) => x.column));
  const maxLook = Math.min(rows.length, startRow + 12);
  let best = Math.max(0, minCol - 1);
  let bestScore = -1;
  for (let col = Math.max(0, minCol - 5); col <= Math.max(0, minCol - 1); col += 1) {
    let score = 0;
    for (let r = startRow; r < maxLook; r += 1) {
      if (rakExcelIsProbablyDateCell(rows[r] && rows[r][col])) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = col;
    }
  }
  return best;
}

function rakExcelCollectSectionRows(rows, sectionInfo, fallbackMonth, fallbackYear, stopRowIndex) {
  if (!sectionInfo || !Array.isArray(sectionInfo.machineColumns) || !sectionInfo.machineColumns.length) return [];
  const machineColumns = sectionInfo.machineColumns;
  const guessedDateColumn = Number.isFinite(sectionInfo.dateColumn) ? sectionInfo.dateColumn : Math.max(0, Math.min(...machineColumns.map((x) => x.column)) - 1);
  const fallbackDateColumn = rakExcelFindDateColumn(rows, sectionInfo.rowIndex + 1, machineColumns);
  const dateColumn = guessedDateColumn >= 0 ? guessedDateColumn : fallbackDateColumn;
  const out = [];
  const seen = new Set();
  const end = Number.isFinite(stopRowIndex) && stopRowIndex > sectionInfo.rowIndex ? stopRowIndex : rows.length;

  for (let r = sectionInfo.rowIndex + 1; r < end; r += 1) {
    const row = rows[r] || [];
    const rowText = rakExcelRowText(row);
    if (!rowText) {
      if (out.length) break;
      continue;
    }
    const date = rakExcelParseDate(row[dateColumn], fallbackMonth, fallbackYear) || rakExcelParseDate(row[fallbackDateColumn], fallbackMonth, fallbackYear);
    const cells = machineColumns.map((hit) => rakExcelCellText(row[hit.column]));
    if (!date && cells.every((v) => !v)) continue;
    if (!date && cells.filter(Boolean).length < 2) continue;
    if (!date) continue;
    const key = date + '|' + cells.join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ date, cells });
  }
  return out;
}

function rakExcelFindAbsenceAnchor(rows) {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] || [];
    for (let column = 0; column < row.length; column += 1) {
      const text = rakExcelNormalizeLoose(row[column]);
      if (!text) continue;
      if (text.includes('DOVOLENA') || text.includes('NESCHOPENKA') || text.includes('NEPRITOMNOST')) {
        return { rowIndex, column };
      }
    }
  }
  return null;
}

function rakExcelCollectAbsenceRows(rows, fallbackMonth, fallbackYear, stopRowIndex) {
  const anchor = rakExcelFindAbsenceAnchor(rows);
  if (!anchor) return [];
  const notes = [];
  const seen = new Set();
  const end = Number.isFinite(stopRowIndex) && stopRowIndex > anchor.rowIndex ? stopRowIndex : rows.length;
  for (let r = anchor.rowIndex + 1; r < end; r += 1) {
    const row = rows[r] || [];
    const date = rakExcelParseDate(row[anchor.column], fallbackMonth, fallbackYear);
    if (!date) continue;
    const maxColumn = Math.min(row.length, anchor.column + 10);
    for (let column = anchor.column + 1; column < maxColumn; column += 2) {
      let person = rakExcelCellText(row[column]);
      let code = rakExcelCellText(row[column + 1]);
      if (!person && !code) continue;
      if (/^jméno$/i.test(person) || /^nepř/i.test(person) || /^nepr/i.test(person)) continue;
      if (!person || !code) continue;
      if (typeof sanitizeAbsencePersonName === 'function') person = sanitizeAbsencePersonName(person) || person;
      const note = { date, shift: '', person, code, text: [person, code].filter(Boolean).join(' ').trim() };
      const key = [note.date, note.person, note.code].join('|').toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        notes.push(note);
      }
    }
  }
  return notes;
}

function parseWorkbookFromSheetJS(workbook, options) {
  const opts = options || {};
  const fallbackYear = parseInt(opts.fallbackYear, 10) || app.importYear || app.selectedYear || new Date().getFullYear();
  const months = {};
  const warnings = [];
  const skippedSheets = [];
  if (!workbook || !Array.isArray(workbook.SheetNames)) return { months, warnings };

  workbook.SheetNames.forEach((sheetName) => {
    const monthKey = rakExcelMonthKeyFromSheetName(sheetName, fallbackYear);
    if (!monthKey) {
      skippedSheets.push(sheetName);
      return;
    }
    const sheet = workbook.Sheets[sheetName];
    if (!sheet || typeof XLSX === 'undefined') return;
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
    if (!rows || !rows.length) return;

    const parsedKey = typeof parseMonthKey === 'function' ? parseMonthKey(monthKey) : null;
    const month = parsedKey && parsedKey.month ? parsedKey.month : parseInt(String(monthKey).split('/')[0], 10);
    const sheetYear = parsedKey && parsedKey.year ? parsedKey.year : fallbackYear;
    const hardInfo = rakExcelFindSectionHeader(rows, 'hard');
    const softInfo = rakExcelFindSectionHeader(rows, 'soft');
    const hardRows = rakExcelCollectSectionRows(rows, hardInfo, month, sheetYear, softInfo && softInfo.rowIndex);
    const softRows = rakExcelCollectSectionRows(rows, softInfo, month, sheetYear, null);
    const notes = rakExcelCollectAbsenceRows(rows, month, sheetYear, softInfo && softInfo.rowIndex);

    if (!hardRows.length && !softRows.length && !notes.length) {
      warnings.push('List „' + sheetName + '“ je měsíční, ale nenašel jsem v něm tvrdotu, měkotu ani absence.');
      return;
    }

    const parsedMonth = {
      hard: {
        title: 'Rotace tvrdota',
        machines: hardInfo && Array.isArray(hardInfo.machineColumns) ? hardInfo.machineColumns.map((hit) => hit.label || rakExcelCellText(rows[hardInfo.rowIndex] && rows[hardInfo.rowIndex][hit.column])).filter(Boolean) : HARD_MACHINE_HEADERS.slice(),
        rows: hardRows
      },
      soft: {
        title: 'Rotace měkota',
        machines: softInfo && Array.isArray(softInfo.machineColumns) ? softInfo.machineColumns.map((hit) => hit.label || rakExcelCellText(rows[softInfo.rowIndex] && rows[softInfo.rowIndex][hit.column])).filter(Boolean) : SOFT_MACHINE_HEADERS.slice(),
        rows: softRows
      },
      notes,
      importMeta: {
        source: 'excel',
        sheetName,
        monthKey,
        month,
        year: sheetYear,
        hardRows: hardRows.length,
        softRows: softRows.length,
        absenceRows: notes.length
      }
    };
    const fallback = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
    months[monthKey] = normalizeMonthForImport(parsedMonth, fallback);
  });

  if (skippedSheets.length) {
    warnings.push('Přeskočené pomocné listy: ' + skippedSheets.slice(0, 6).join(', ') + (skippedSheets.length > 6 ? '…' : ''));
  }

  return { months, warnings, skippedSheets };
}


function initAppInitBindings() {
  registerListener(document.getElementById("monthYearSelect"), "change", (e) => {
    setSelectedYear(e.target.value);
  });

  registerListener(document.getElementById("statsYearSelect"), "change", (e) => {
    setSelectedYear(e.target.value);
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

  /* INITIAL */
  const tabNames = document.getElementById("tabNames");
  const tabMonths = document.getElementById("tabMonths");
  if (tabNames) tabNames.style.outline = "none";
  if (tabMonths) tabMonths.style.outline = "3px solid #7CFF7C";
  if (typeof setRotaceView === "function") setRotaceView("names");
  if (typeof refreshInitialUI === "function") refreshInitialUI();

  const bootHome = () => {
    const activePage = document.querySelector(".page.active")?.id || "";
    if ((typeof app !== "undefined" && app.homeBootSuppressed && activePage !== "home") || window.__rotaceManualNavLocked || (window.__rotaceHomeBootLocked && activePage !== "home") || (window.__rotaceUserNavigated && activePage !== 'home')) {
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
      const activePage = document.querySelector(".page.active")?.id || "";
      if (window.__rotaceManualNavLocked || (window.__rotaceHomeBootLocked && activePage !== "home") || (typeof app !== "undefined" && app.homeBootSuppressed && activePage !== "home") || (window.__rotaceUserNavigated && activePage !== 'home')) {
        return;
      }
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
