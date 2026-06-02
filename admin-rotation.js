// RaK 1.2 (1.107) – Administrace Rozpisy a Nastavení strojů oddělené z hlavního UI modulu.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation.js', 'loading', { source: 'dynamic-loader' }); } catch (err) {}


function getAdminRotationMonthKeys() {
  return Object.keys(app.rotation && app.rotation.months ? app.rotation.months : {}).sort((a, b) => a.localeCompare(b, 'cs'));
}

function getAdminSelectedMonthKey() {
  const months = getAdminRotationMonthKeys();
  if (!months.length) return '';
  if (app.selectedMonth && months.includes(app.selectedMonth)) return app.selectedMonth;
  const currentMonthKey = typeof monthKeyFromYearMonth === 'function'
    ? monthKeyFromYearMonth(new Date().getFullYear(), new Date().getMonth() + 1)
    : '';
  if (currentMonthKey && months.includes(currentMonthKey)) return currentMonthKey;
  return months[0];
}

function getAdminRotationYears() {
  const years = new Set();
  getAdminRotationMonthKeys().forEach((monthKey) => {
    const parsed = typeof parseMonthKey === 'function' ? parseMonthKey(monthKey) : null;
    if (parsed && Number.isFinite(parsed.year)) years.add(parsed.year);
  });
  return [...years].sort((a, b) => a - b);
}

function renderAdminInlineFieldHtml(fieldAttr, fieldName, value, placeholder, tiny) {
  const safeValue = String(value || '');
  const classes = ['appMenuInlineFieldWrap'];
  if (tiny) classes.push('appMenuInlineFieldWrapTiny');
  const fieldKey = String(fieldName || '');
  const attrKey = String(fieldAttr || '');
  const isDateField = fieldKey === 'date';
  const isAbsenceCodeField = attrKey === 'data-note-field' && fieldKey === 'code';
  const canRemove = !isDateField && (
    (attrKey === 'data-rot-field' && fieldKey.indexOf('cell-') === 0) ||
    (attrKey === 'data-note-field' && fieldKey === 'person')
  );
  if (canRemove) classes.push('appMenuInlineFieldWrapCanRemove');
  const inputAttrs = [
    'class="appMenuInlineInput' + (tiny ? ' appMenuInlineInputTiny' : '') + '"',
    fieldAttr ? fieldAttr + '="' + escapeHtml(fieldName) + '"' : '',
    'value="' + escapeHtml(safeValue) + '"',
    'placeholder="' + escapeHtml(placeholder || '') + '"',
    'title="' + escapeHtml(isDateField ? 'Datum upravíš ručně.' : (isAbsenceCodeField ? 'Klikni a vyber zkratku absence, nebo napiš vlastní.' : 'Uprav text ručně. Po kliknutí na obsazené jméno se ukáže Odebrat přímo u pole.')) + '"',
    isAbsenceCodeField ? 'list="adminAbsenceCodeOptions"' : '',
    'autocomplete="off"',
    'autocorrect="off"',
    'autocapitalize="off"',
    'spellcheck="false"',
    'inputmode="text"'
  ].filter(Boolean).join(' ');
  return [
    '<div class="' + classes.join(' ') + '">',
    '  <input ' + inputAttrs + '>',
    '</div>'
  ].join('');
}

function renderAdminMonthPickerHtml(selectedMonthKey) {
  const years = getAdminRotationYears();
  const selectedParsed = typeof parseMonthKey === 'function' ? parseMonthKey(selectedMonthKey || '') : null;
  const fallbackYear = selectedParsed && Number.isFinite(selectedParsed.year)
    ? selectedParsed.year
    : (app.selectedYear && years.includes(Number(app.selectedYear)) ? Number(app.selectedYear) : (years[0] || null));
  const selectedYear = Number.isFinite(fallbackYear) ? fallbackYear : (years[0] || null);
  const yearMonths = selectedYear ? getMonthsForYear(app.rotation, selectedYear) : [];
  const selectedMonth = (selectedMonthKey && yearMonths.includes(selectedMonthKey))
    ? selectedMonthKey
    : (yearMonths.includes(getAdminSelectedMonthKey()) ? getAdminSelectedMonthKey() : (yearMonths[0] || selectedMonthKey || ''));

  if (!years.length) {
    return '<div class="smallText">Žádné měsíce zatím nejsou k dispozici.</div>';
  }

  const yearButtons = years.map((year) => {
    const active = Number(year) === Number(selectedYear);
    return '<button type="button" class="appMenuMonthChip' + (active ? ' isActive' : '') + '" data-admin-year-key="' + escapeHtml(String(year)) + '">' + escapeHtml(String(year)) + '</button>';
  }).join('');

  const monthButtons = yearMonths.map((monthKey) => {
    const active = monthKey === selectedMonth;
    return '<button type="button" class="appMenuMonthChip' + (active ? ' isActive' : '') + '" data-admin-month-key="' + escapeHtml(monthKey) + '">' + escapeHtml(monthKey) + '</button>';
  }).join('') || '<div class="smallText">Pro tenhle rok zatím nejsou žádné měsíce.</div>';

  return [
    '<div class="appMenuMonthYearPicker">',
    '  <details class="appMenuMonthYearGroup">',
    '    <summary><span>Rok</span><span>' + escapeHtml(String(selectedYear || '—')) + '</span></summary>',
    '    <div class="appMenuMonthYearButtons">' + yearButtons + '</div>',
    '  </details>',
    '  <details class="appMenuMonthYearGroup">',
    '    <summary><span>Měsíc</span><span>' + escapeHtml(String(selectedMonth || '—')) + '</span></summary>',
    '    <div class="appMenuMonthYearButtons">' + monthButtons + '</div>',
    '  </details>',
    '</div>'
  ].join('');
}

async function loadAdminRotationFromSupabase() {
  if (typeof syncRotationFromSupabase === 'function') {
    return syncRotationFromSupabase(true);
  }
  return null;
}

async function loadAdminMachineSettingsFromSupabase() {
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function') {
    app.machineSettingsRows = await window.RotationSupabaseBridge.loadMachineSettings();
    return app.machineSettingsRows;
  }
  return [];
}

async function saveAdminRotationToSupabase(monthKey, rawText) {
  if (!monthKey) throw new Error('Chybí měsíc.');
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    throw new Error('JSON v poli není platný.');
  }
  const fallback = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const normalized = normalizeMonthForImport(parsed, fallback);
  if (!app.rotation.months) app.rotation.months = {};
  app.rotation.months[monthKey] = normalized;
  app.rotation = normalizeRotationData(app.rotation);
  app.selectedMonth = monthKey;
  saveRotationData();
  renderRotace();
  if (typeof renderMonth === 'function') renderMonth(monthKey);
  if (app.selectedName && typeof renderPerson === 'function') renderPerson(app.selectedName);
  let saveResult = { ok: true, months: 0, entries: 0 };
  if (app.adminUnlocked) {
    saveResult = await saveRotationToSupabase(app.rotation, { source: 'admin-menu', monthKey }) || saveResult;
    const statusEl = document.getElementById('adminOnlineSaveStatus');
    if (statusEl) {
      statusEl.textContent = saveResult && saveResult.ok === true
        ? ('Uloženo online ✓ · měsíců: ' + String(saveResult.months || 0) + ' · řádků: ' + String(saveResult.entries || 0))
        : 'Uložení online se nepodařilo.';
    }
  }
  return { normalized, saveResult };
}

function adminRotationRowTemplate(section, row, rowIndex, machineCount, allowBlankTail) {
  const cells = Array.from({ length: machineCount }, (_, i) => String(row && row.cells && row.cells[i] ? row.cells[i] : ''));
  const date = String(row && row.date ? row.date : '').trim();
  const hasAny = !!(date || cells.some(Boolean) || (row && row.shift) || (row && row.person) || (row && row.code) || (row && row.text));
  if (!hasAny && !allowBlankTail) return '';
  return [
    '<tr data-rotation-section="' + escapeHtml(section) + '" data-rotation-row-index="' + String(rowIndex) + '">',
    '  <td>' + renderAdminInlineFieldHtml('data-rot-field', 'date', date, 'datum', false) + '</td>',
    cells.map((value, idx) => '<td>' + renderAdminInlineFieldHtml('data-rot-field', 'cell-' + String(idx), value, String(idx + 1), true) + '</td>').join(''),
    '</tr>'
  ].join('');
}

function adminNotesRowTemplate(row, rowIndex, allowBlankTail) {
  const note = row || {};
  const date = String(note.date || '').trim();
  const person = String(note.person || '').trim();
  const code = String(note.code || '').trim();
  const hasAny = !!(date || person || code);
  if (!hasAny && !allowBlankTail) return '';
  return [
    '<tr data-note-row-index="' + String(rowIndex) + '">',
    '  <td>' + renderAdminInlineFieldHtml('data-note-field', 'date', date, 'datum', false) + '</td>',
    '  <td>' + renderAdminInlineFieldHtml('data-note-field', 'person', person, 'jméno', false) + '</td>',
    '  <td>' + renderAdminInlineFieldHtml('data-note-field', 'code', code, 'kód', false) + '</td>',
    '</tr>'
  ].join('');
}



function adminRotationDateKey(rawDate) {
  const parsed = typeof parseDateToken === 'function' ? parseDateToken(rawDate) : null;
  if (parsed && Number.isFinite(parsed.day) && Number.isFinite(parsed.month)) return String(parsed.day) + '.' + String(parsed.month);
  return String(rawDate || '').trim().toLowerCase();
}

function adminRotationDateLabel(rawDate) {
  const raw = String(rawDate || '').trim().replace(/\s+/g, ' ');
  if (!raw) return '';
  const parsed = typeof parseDateToken === 'function' ? parseDateToken(raw) : null;
  if (parsed && Number.isFinite(parsed.day) && Number.isFinite(parsed.month)) {
    return String(parsed.day) + '.' + String(parsed.month) + '.' + (parsed.shift ? ' ' + parsed.shift : '');
  }
  return raw;
}

function adminGetKnownNames() {
  if (typeof getKnownStatNames === 'function') {
    return Array.from(getKnownStatNames()).filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), 'cs'));
  }
  if (typeof KNOWN_STAT_NAMES !== 'undefined' && KNOWN_STAT_NAMES && typeof KNOWN_STAT_NAMES.forEach === 'function') {
    return Array.from(KNOWN_STAT_NAMES).filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), 'cs'));
  }
  return [];
}

function adminSplitPeopleList(text) {
  if (typeof splitAbsencePeople === 'function') {
    return splitAbsencePeople(text).map(sanitizeAbsencePersonName).filter(Boolean);
  }
  const raw = String(text || '').trim();
  if (!raw) return [];
  return raw.split(/\s*(?:,|;|\/|\||&|\ba\b|\bi\b)\s*/gi).map(part => part.trim()).filter(Boolean);
}

function adminBuildUsedNamesByDate(root) {
  const usedByDate = new Map();

  const add = (dateLabel, name) => {
    const key = String(dateLabel || '').trim().replace(/\s+/g, ' ');
    const person = String(name || '').trim();
    if (!key || !person) return;
    if (!usedByDate.has(key)) usedByDate.set(key, new Set());
    usedByDate.get(key).add(person);
  };

  root.querySelectorAll('tr[data-rotation-section]').forEach((tr) => {
    const date = adminRotationDateLabel(tr.querySelector('[data-rot-field="date"], [data-note-field="date"]')?.value || '');
    tr.querySelectorAll('[data-rot-field^="cell-"]').forEach((input) => {
      const name = String(input && input.value ? input.value : '').trim();
      if (name && !['dát pryč','odebrat','remove','pryc','pryč'].includes(name.toLowerCase())) add(date, name);
    });
  });

  root.querySelectorAll('tr[data-note-row-index]').forEach((tr) => {
    const date = adminRotationDateLabel(tr.querySelector('[data-note-field="date"]')?.value || '');
    const names = adminSplitPeopleList(tr.querySelector('[data-note-field="person"]')?.value || '');
    names.forEach((name) => add(date, name));
  });

  return usedByDate;
}

function adminBuildMonthUsageSummary(monthKey) {
  const month = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const knownNames = adminGetKnownNames();
  const usedByDate = new Map();
  const allUsed = new Set();
  const dateOrder = [];

  const register = (dateLabel) => {
    const label = adminRotationDateLabel(dateLabel);
    if (!label) return null;
    if (!usedByDate.has(label)) {
      usedByDate.set(label, new Set());
      dateOrder.push(label);
    }
    return usedByDate.get(label);
  };

  const addName = (dateLabel, name) => {
    const labelSet = register(dateLabel);
    const person = String(name || '').trim();
    if (!labelSet || !person) return;
    labelSet.add(person);
    allUsed.add(person);
  };

  if (month) {
    const hardRows = Array.isArray(month.hard && month.hard.rows) ? month.hard.rows : [];
    const softRows = Array.isArray(month.soft && month.soft.rows) ? month.soft.rows : [];
    const notesRows = Array.isArray(month.notes) ? month.notes : [];

    hardRows.forEach((row) => {
      const label = adminRotationDateLabel(row && row.date ? row.date : '');
      if (!label) return;
      register(label);
      const cells = row && Array.isArray(row.cells) ? row.cells : [];
      cells.forEach((cell) => {
        const name = String(cell || '').trim();
        if (name && !['dát pryč','odebrat','remove','pryc','pryč'].includes(name.toLowerCase())) addName(label, name);
      });
    });

    softRows.forEach((row) => {
      const label = adminRotationDateLabel(row && row.date ? row.date : '');
      if (!label) return;
      register(label);
      const cells = row && Array.isArray(row.cells) ? row.cells : [];
      cells.forEach((cell) => {
        const name = String(cell || '').trim();
        if (name && !['dát pryč','odebrat','remove','pryc','pryč'].includes(name.toLowerCase())) addName(label, name);
      });
    });

    notesRows.forEach((row) => {
      const label = adminRotationDateLabel(row && row.date ? row.date : '');
      if (!label) return;
      register(label);
      const names = adminSplitPeopleList(row && row.person ? row.person : '');
      names.forEach((name) => addName(label, name));
    });
  }

  const freeOverall = knownNames.filter((name) => !allUsed.has(name));
  const missingByDate = dateOrder.map((label) => ({
    label,
    missing: knownNames.filter((name) => !(usedByDate.get(label) || new Set()).has(name))
  })).filter((item) => item.missing.length);

  return { month, knownNames, usedByDate, allUsed, dateOrder, freeOverall, missingByDate };
}

function adminGetRotationActiveDateKey(root) {
  if (!root) return '';
  const focused = root.querySelector('[data-rot-field]:focus, [data-note-field]:focus');
  const row = focused && typeof focused.closest === 'function'
    ? focused.closest('tr[data-rotation-section], tr[data-note-row-index]')
    : null;
  if (!row) return '';
  const dateInput = row.querySelector('[data-rot-field="date"], [data-note-field="date"]');
  return adminRotationDateLabel(dateInput ? dateInput.value : '');
}

function adminRenderRotationAvailabilitySummary(root) {
  if (!root || root.dataset.adminView !== 'rotation') return;
  const box = root.querySelector('#adminRotationFreeNamesSummary');
  if (!box) return;
  const monthSelect = root.querySelector('#adminMonthSelect');
  const monthKey = monthSelect ? monthSelect.value : getAdminSelectedMonthKey();
  const summary = adminBuildMonthUsageSummary(monthKey);

  const makeEl = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = String(text);
    return el;
  };
  const appendStrongLine = (className, strongText, tailText) => {
    const line = makeEl('div', className);
    const strong = document.createElement('b');
    strong.textContent = String(strongText || '');
    line.appendChild(strong);
    if (tailText != null) line.appendChild(document.createTextNode(String(tailText)));
    return line;
  };

  if (!summary.month) {
    const fingerprint = JSON.stringify({ state: 'empty', monthKey: monthKey || '' });
    if (typeof setElementChildrenIfChanged === 'function') {
      setElementChildrenIfChanged(box, fingerprint, () => [
        makeEl('div', 'appMenuFreeNamesTitle', 'Kontrola měsíce'),
        makeEl('div', 'appMenuFreeNamesText', 'Pro tenhle měsíc zatím nejsou data.')
      ], 'adminRotationFreeNamesSummary');
    } else {
      box.replaceChildren(
        makeEl('div', 'appMenuFreeNamesTitle', 'Kontrola měsíce'),
        makeEl('div', 'appMenuFreeNamesText', 'Pro tenhle měsíc zatím nejsou data.')
      );
    }
    return;
  }

  const freeOverall = summary.freeOverall.length ? summary.freeOverall.join(', ') : '—';
  const missingRows = summary.missingByDate.map((item) => ({
    label: String(item && item.label ? item.label : ''),
    missing: Array.isArray(item && item.missing) ? item.missing.join(', ') : ''
  }));
  const fingerprint = JSON.stringify({ monthKey: monthKey || '', freeOverall, missingRows });

  const buildContent = () => {
    const list = makeEl('div', 'appMenuMonthCheckList');
    if (missingRows.length) {
      missingRows.forEach((item) => {
        const row = makeEl('div', 'appMenuMonthCheckRow');
        const label = document.createElement('b');
        label.textContent = item.label + ':';
        row.appendChild(label);
        row.appendChild(document.createTextNode(' ' + item.missing));
        list.appendChild(row);
      });
    } else {
      list.appendChild(makeEl('div', 'appMenuMonthCheckRow', 'V tomhle měsíci nechybí žádné známé jméno.'));
    }

    return [
      makeEl('div', 'appMenuFreeNamesTitle', 'Kontrola měsíce ' + String(monthKey || '')),
      appendStrongLine('appMenuFreeNamesText', 'V celém měsíci nikde nejsou:', ' ' + freeOverall),
      appendStrongLine('appMenuFreeNamesText uMt8', 'Chybějící jména podle dnů:', null),
      list
    ];
  };

  if (typeof setElementChildrenIfChanged === 'function') {
    setElementChildrenIfChanged(box, fingerprint, buildContent, 'adminRotationFreeNamesSummary');
  } else {
    box.replaceChildren(...buildContent());
  }
}

function adminRefreshRotationSuggestions(root) {
  if (!root || root.dataset.adminView !== 'rotation' || !root.isConnected) return;
  try {
    root.querySelectorAll('datalist[data-admin-rotation-suggest]').forEach((list) => list.remove());
  } catch (err) {}
  try {
    adminRenderRotationAvailabilitySummary(root);
  } catch (err) {
    console.warn('Admin rotation summary failed', err);
  }
}

function adminAttachRotationAvailableDatalist(input) {
  try {
    const body = document.getElementById('appMenuBody');
    if (!body || body.dataset.adminView !== 'rotation' || !input || !body.contains(input)) return;
    if (!input.matches('[data-rot-field^="cell-"]')) return;
    const currentValue = String(input.value || '').trim();
    if (currentValue) {
      input.removeAttribute('list');
      return;
    }
    const row = input.closest('tr[data-rotation-section]');
    const dateKey = adminRotationDateLabel(row && row.querySelector('[data-rot-field="date"]') ? row.querySelector('[data-rot-field="date"]').value : '');
    const used = dateKey ? (adminBuildUsedNamesByDate(body).get(dateKey) || new Set()) : new Set();
    const names = adminGetKnownNames().filter((name) => !used.has(name));
    const listId = 'adminRotationSuggest-' + Math.random().toString(36).slice(2, 9);
    const datalist = document.createElement('datalist');
    datalist.id = listId;
    datalist.setAttribute('data-admin-rotation-suggest', '1');
    names.forEach((name) => {
      const option = document.createElement('option');
      option.value = name;
      datalist.appendChild(option);
    });
    body.appendChild(datalist);
    input.setAttribute('list', listId);
  } catch (err) {
    console.warn('Admin rotation datalist failed', err);
  }
}

function splitMachineKey(rawKey) {
  const raw = String(rawKey || '').trim();
  if (!raw) return { machine: '', index: '' };
  const parts = raw.includes('-') ? raw.split('-') : (raw.includes('_') ? raw.split('_') : [raw]);
  const machine = String(parts[0] || '').trim();
  const index = String(parts.slice(1).join('-') || '').trim();
  return { machine, index };
}

function makeMachineKey(machineCode, machineIndex, category) {
  const machine = String(machineCode || '').trim();
  const index = String(machineIndex || '').trim();
  const cat = String(category || '').trim();
  if (!machine) return '';
  if (cat === 'brus') return machine + (index ? '-' + index : '');
  return machine;
}


function buildAdminRotationColgroupHtml(columnCount, firstWidthPx, otherWidthPx) {
  const cols = [];
  cols.push('<col style="width:' + String(firstWidthPx) + 'px;">');
  for (let i = 0; i < columnCount; i += 1) {
    cols.push('<col style="width:' + String(otherWidthPx) + 'px;">');
  }
  return '<colgroup>' + cols.join('') + '</colgroup>';
}

function buildAdminAbsenceColgroupHtml() {
  return '<colgroup>' +
    '<col style="width:55px;">' +
    '<col style="width:106px;">' +
    '<col style="width:32px;">' +
    '</colgroup>';
}


function buildAdminAbsenceCodeDatalistHtml() {
  const codes = ['D', 'N', 'NV', '§', 'Lázně'];
  return '<datalist id="adminAbsenceCodeOptions">' + codes.map(code => '<option value="' + escapeHtml(code) + '"></option>').join('') + '</datalist>';
}

function buildAdminAbsenceSummaryHtml(notesRows) {
  const absNotes = Array.isArray(notesRows) ? notesRows.map(normalizeNoteEntry).filter(n => n.isAbsence) : [];
  if (!absNotes.length) return '<div class="smallText">Bez poznámek.</div>';

  const grouped = new Map();
  absNotes.forEach(n => {
    const key = n.date || '';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(n);
  });

  const rows = [...grouped.entries()].map(([date, items]) => ({
    date,
    items: items.slice().sort((a, b) => String(a.person || '').localeCompare(String(b.person || ''), 'cs'))
  }));

  const maxPairs = Math.max(1, ...rows.map(r => r.items.length));
  let html = "<div class='smallText uMt12 uBold'>Absence podle dne</div>";
  html += "<div class='tableWrap'><table class='noteTable noteTableCompact'><thead><tr>";
  for (let i = 0; i < maxPairs; i += 1) {
    if (i > 0) html += "<th class='noteSpacer'></th>";
    html += "<th class='noteDateCell'>Datum</th><th class='noteShiftCell'>Směna</th><th class='notePersonCell'>Jméno</th><th class='noteReasonCell'>Důvod</th>";
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
        html += "<td class='noteDateCell'>" + escapeHtml(dateOnly) + "</td><td class='noteShiftCell'>" + escapeHtml(shift) + "</td><td class='notePersonCell'>" + escapeHtml(people) + "</td><td class='noteReasonCell'>" + escapeHtml(reason) + "</td>";
      } else {
        html += "<td class='emptyCell noteDateCell'>—</td><td class='emptyCell noteShiftCell'>—</td><td class='emptyCell notePersonCell'>—</td><td class='emptyCell noteReasonCell'>—</td>";
      }
    }
    html += "</tr>";
  });
  html += "</tbody></table></div>";
  return html;
}

function getAdminFhbTargetRows() {
  if (typeof getAllFhbTargetPresets === 'function') {
    return getAllFhbTargetPresets();
  }
  return [
    { key: 'afag-lis', label: 'AF/AG lis', left: 50, right: 70, toleranceMinus: 10, tolerancePlus: 10 },
    { key: 'ah-lis', label: 'AH lis', left: 20, right: 80, toleranceMinus: 10, tolerancePlus: 10 },
    { key: 'afag-volne', label: 'AF/AG volné', left: -5, right: 10, toleranceMinus: 10, tolerancePlus: 10 },
    { key: 'ah-volne', label: 'AH volné', left: 10, right: 25, toleranceMinus: 10, tolerancePlus: 10 }
  ];
}

function buildAdminFhbTargetSettingsHtml() {
  const rows = getAdminFhbTargetRows();
  const rowsHtml = rows.map((row) => {
    const key = String(row.key || '').trim();
    const label = String(row.label || key || '').trim();
    const toleranceMinus = row.toleranceMinus ?? row.tolerance_minus ?? row.toleranceMin ?? row.tolerance_min ?? 10;
    const tolerancePlus = row.tolerancePlus ?? row.tolerance_plus ?? row.toleranceMax ?? row.tolerance_max ?? 10;
    return [
      '<tr data-fhb-target-row="' + escapeHtml(key) + '">',
      '  <td><input class="appMenuInlineInput" data-fhb-target-field="label" value="' + escapeHtml(label) + '" readonly></td>',
      '  <td><input class="appMenuInlineInput" data-fhb-target-field="left" value="' + escapeHtml(String(row.left ?? '')) + '" inputmode="decimal"></td>',
      '  <td><input class="appMenuInlineInput" data-fhb-target-field="right" value="' + escapeHtml(String(row.right ?? '')) + '" inputmode="decimal"></td>',
      '  <td><input class="appMenuInlineInput" data-fhb-target-field="tolerance_minus" value="' + escapeHtml(String(toleranceMinus)) + '" inputmode="decimal"></td>',
      '  <td><input class="appMenuInlineInput" data-fhb-target-field="tolerance_plus" value="' + escapeHtml(String(tolerancePlus)) + '" inputmode="decimal"></td>',
      '</tr>'
    ].join('');
  }).join('');
  return [
    '<div class="tableWrap appMenuTableWrap uMt12">',
    '  <div class="smallText">Korekce frézky · středy a tolerance fhβ</div>',
    '  <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense appMenuAdminFhbTargetTable">',
    '    <thead><tr><th>Index</th><th>Levá</th><th>Pravá</th><th>Tol. −</th><th>Tol. +</th></tr></thead>',
    '    <tbody>' + rowsHtml + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
}




function buildAdminMachineSettingsTableHtml() {
  const rows = Array.isArray(app.machineSettingsRows) ? app.machineSettingsRows : [];
  const machineRows = rows.filter(row => { const cat = String(row && row.category ? row.category : '').trim(); return cat !== 'brus' && cat !== 'fhb_target' && cat !== 'food_schedule'; });
  const brusRows = rows.filter(row => String(row && row.category ? row.category : '').trim() === 'brus');

  const machineDefaults = machineRows.length ? machineRows : [
    { machine_key: 'FREZKY', machine_code: 'FREZKY', machine_index: '', label: 'Frezky', category: 'frezka', cycle_time: '', settings_json: { machine: 'FREZKY', index: '', cycle_time: '' } },
    { machine_key: 'TPKW01', machine_code: 'TPKW01', machine_index: '', label: 'Pračka', category: 'pracka', cycle_time: '30', settings_json: { machine: 'TPKW01', index: '', cycle_time: '30' } }
  ];

  const brusDefaults = brusRows.length ? brusRows : [
    { machine_key: 'TBKR01-AD', machine_code: 'TBKR01', machine_index: 'AD', label: 'TBKR01-AD', category: 'brus', cycle_time: '58.2', dress_time: '323', dress_count: '59', settings_json: { machine: 'TBKR01', index: 'AD', cycle_time: '58.2', dress_time: '323', dress_count: '59' } },
    { machine_key: 'TBKR01-AE', machine_code: 'TBKR01', machine_index: 'AE', label: 'TBKR01-AE', category: 'brus', cycle_time: '57.0', dress_time: '240', dress_count: '58', settings_json: { machine: 'TBKR01', index: 'AE', cycle_time: '57.0', dress_time: '240', dress_count: '58' } },
    { machine_key: 'TBKR01-AH', machine_code: 'TBKR01', machine_index: 'AH', label: 'TBKR01-AH', category: 'brus', cycle_time: '66.0', dress_time: '400', dress_count: '87', settings_json: { machine: 'TBKR01', index: 'AH', cycle_time: '66.0', dress_time: '400', dress_count: '87' } },
    { machine_key: 'TBKR01-AD volné', machine_code: 'TBKR01', machine_index: 'AD volné', label: 'TBKR01-AD volné', category: 'brus', cycle_time: '62.7', dress_time: '240', dress_count: '45', settings_json: { machine: 'TBKR01', index: 'AD volné', cycle_time: '62.7', dress_time: '240', dress_count: '45' } },
    { machine_key: 'TBKR01-AE volné', machine_code: 'TBKR01', machine_index: 'AE volné', label: 'TBKR01-AE volné', category: 'brus', cycle_time: '60.0', dress_time: '240', dress_count: '45', settings_json: { machine: 'TBKR01', index: 'AE volné', cycle_time: '60.0', dress_time: '240', dress_count: '45' } },
    { machine_key: 'TBKR07-AD', machine_code: 'TBKR07', machine_index: 'AD', label: 'TBKR07-AD', category: 'brus', cycle_time: '58.2', dress_time: '298', dress_count: '59', settings_json: { machine: 'TBKR07', index: 'AD', cycle_time: '58.2', dress_time: '298', dress_count: '59' } },
    { machine_key: 'TBKR07-AE', machine_code: 'TBKR07', machine_index: 'AE', label: 'TBKR07-AE', category: 'brus', cycle_time: '56.4', dress_time: '325', dress_count: '59', settings_json: { machine: 'TBKR07', index: 'AE', cycle_time: '56.4', dress_time: '325', dress_count: '59' } },
    { machine_key: 'TBKR07-AH', machine_code: 'TBKR07', machine_index: 'AH', label: 'TBKR07-AH', category: 'brus', cycle_time: '63', dress_time: '360', dress_count: '88', settings_json: { machine: 'TBKR07', index: 'AH', cycle_time: '63', dress_time: '360', dress_count: '88' } },
    { machine_key: 'TBKR07-AD volné', machine_code: 'TBKR07', machine_index: 'AD volné', label: 'TBKR07-AD volné', category: 'brus', cycle_time: '60.3', dress_time: '240', dress_count: '45', settings_json: { machine: 'TBKR07', index: 'AD volné', cycle_time: '60.3', dress_time: '240', dress_count: '45' } },
    { machine_key: 'TBKR07-AE volné', machine_code: 'TBKR07', machine_index: 'AE volné', label: 'TBKR07-AE volné', category: 'brus', cycle_time: '60.0', dress_time: '240', dress_count: '45', settings_json: { machine: 'TBKR07', index: 'AE volné', cycle_time: '60.0', dress_time: '240', dress_count: '45' } }
  ];

  const machineRowsHtml = machineDefaults.map((row, idx) => {
    const machineCode = String(row.machine_code || splitMachineKey(row.machine_key).machine || '').trim();
    const cycleTime = row.cycle_time ?? row.speed ?? (row.settings_json && row.settings_json.cycle_time) ?? '';
    return [
      '<tr data-machine-row-index="m' + String(idx) + '">',
      '  <td><input class="appMenuInlineInput" data-machine-field="machine_code" value="' + escapeHtml(machineCode) + '" placeholder="FREZKY / TPKW01"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="label" value="' + escapeHtml(String(row.label || '')) + '" placeholder="název"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="cycle_time" value="' + escapeHtml(String(cycleTime ?? '')) + '" placeholder="čas výroby kola"></td>',
      '</tr>'
    ].join('');
  }).join('');

  const brusRowsHtml = brusDefaults.map((row, idx) => {
    const machineCode = String(row.machine_code || splitMachineKey(row.machine_key).machine || '').trim();
    const machineIndex = String(row.machine_index || splitMachineKey(row.machine_key).index || '').trim();
    const cycleTime = row.cycle_time ?? row.speed ?? (row.settings_json && row.settings_json.cycle_time) ?? '';
    const dressTime = row.dress_time ?? (row.settings_json && row.settings_json.dress_time) ?? '';
    const dressCount = row.dress_count ?? (row.settings_json && row.settings_json.dress_count) ?? '';
    return [
      '<tr data-machine-row-index="b' + String(idx) + '">',
      '  <td><input class="appMenuInlineInput" data-machine-field="machine_code" value="' + escapeHtml(machineCode) + '" placeholder="TBKR01"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="machine_index" value="' + escapeHtml(machineIndex) + '" placeholder="AD / AE / AH / volné"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="label" value="' + escapeHtml(String(row.label || '')) + '" placeholder="název"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="cycle_time" value="' + escapeHtml(String(cycleTime ?? '')) + '" placeholder="čas výroby kola"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="dress_time" value="' + escapeHtml(String(dressTime ?? '')) + '" placeholder="čas orovnání"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="dress_count" value="' + escapeHtml(String(dressCount ?? '')) + '" placeholder="po kolika ks"></td>',
      '</tr>'
    ].join('');
  }).join('');

  return [
    '<div class="appMenuSubSection" id="adminMachinesSection">',
    '  <div class="appMenuSubTitle">Nastavení strojů</div>',
    '  <div class="appMenuText">Frezky a pračka mají jen čas výroby kola. Brusky mají stroj, index, čas výroby kola, čas orovnání a počet kusů po orovnání. Níž upravíš i středy fhβ.</div>',
    '  <div class="tableWrap appMenuTableWrap">',
    '    <div class="smallText">Frezky a pračka</div>',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense">',
    '      <thead><tr><th>Stroj</th><th>Název</th><th>Čas výroby kola</th></tr></thead>',
    '      <tbody>' + machineRowsHtml + '</tbody>',
    '    </table>',
    '  </div>',
    '  <div class="tableWrap appMenuTableWrap uMt12">',
    '    <div class="smallText">Brusy</div>',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense">',
    '      <thead><tr><th>Stroj</th><th>Index</th><th>Název</th><th>Čas výroby kola</th><th>Čas orovnání</th><th>Po kolika ks</th></tr></thead>',
    '      <tbody>' + brusRowsHtml + '</tbody>',
    '    </table>',
    '  </div>',
    buildAdminFhbTargetSettingsHtml(),
    '</div>'
  ].join('');
}


function adminShortRotationName(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (adminRotationIsRemoveValue(raw)) return '';
  const parts = raw.split(/\s+/).filter(Boolean);
  const base = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const clean = String(base || raw).replace(/[^0-9A-Za-zÁ-Žá-ž]/g, '');
  return clean ? clean.slice(0, 8) : raw.slice(0, 8);
}

function buildAdminRotationCompactOverviewHtml(monthKey, hardRows, softRows, hardMachines, softMachines) {
  const renderSection = (title, rows, machines) => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const safeMachines = Array.isArray(machines) ? machines : [];
    if (!safeRows.length) return '';
    const head = '<tr><th>Den</th>' + safeMachines.map((m) => '<th>' + escapeHtml(String(m || '').replace(/^T/, '')) + '</th>').join('') + '</tr>';
    const body = safeRows.map((row) => {
      const date = adminRotationDateLabel(row && row.date ? row.date : '') || String(row && row.date ? row.date : '');
      const cells = Array.isArray(row && row.cells) ? row.cells : [];
      const missingCount = safeMachines.reduce((count, _, idx) => count + (String(cells[idx] || '').trim() ? 0 : 1), 0);
      return '<tr class="' + (missingCount ? 'adminRotationMiniDayHasEmpty' : '') + '"><td>' + escapeHtml(String(date || '')) + '</td>' + safeMachines.map((_, idx) => {
        const raw = String(cells[idx] || '').trim();
        const shortName = adminShortRotationName(raw);
        const empty = !shortName;
        return '<td class="' + (empty ? 'adminRotationMiniEmpty' : '') + '" data-full-name="' + escapeHtml(raw) + '">' + escapeHtml(shortName || '') + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return [
      '<div class="adminRotationMiniSection">',
      '  <div class="adminRotationMiniTitle">' + escapeHtml(title) + '</div>',
      '  <div class="adminRotationMiniScroll">',
      '    <table class="adminRotationMiniTable"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>',
      '  </div>',
      '</div>'
    ].join('');
  };
  return [
    '<details class="adminRotationCompactOverview" open>',
    '  <summary>Přehled měsíce</summary>',
    '  <div class="adminRotationCompactHint">Mini přehled je jen pro orientaci. Upravuje se v tabulkách níž.</div>',
    renderSection('Tvrdota', hardRows, hardMachines),
    renderSection('Měkota', softRows, softMachines),
    '</details>'
  ].join('');
}

function buildAdminRotationTableHtml(monthKey) {

  const month = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  if (!month) {
    return '<div class="smallText">Pro tenhle měsíc zatím nejsou data.</div>';
  }
  const hardRows = Array.isArray(month.hard && month.hard.rows) ? month.hard.rows : [];
  const softRows = Array.isArray(month.soft && month.soft.rows) ? month.soft.rows : [];
  const notesRows = Array.isArray(month.notes) ? month.notes : [];
  const hardMachines = Array.isArray(month.hard && month.hard.machines) ? month.hard.machines : HARD_MACHINE_HEADERS;
  const softMachines = Array.isArray(month.soft && month.soft.machines) ? month.soft.machines : SOFT_MACHINE_HEADERS;

  const renderRows = (section, rows, machineCount) => {
    const withBlank = rows.concat([ { date: '', cells: Array(machineCount).fill('') } ]);
    return withBlank.map((row, idx) => adminRotationRowTemplate(section, row, idx, machineCount, true)).join('');
  };

  const renderNotes = () => {
    const withBlank = notesRows.concat([ { date: '', person: '', code: '' } ]);
    return withBlank.map((row, idx) => adminNotesRowTemplate(row, idx, true)).join('');
  };

  const hardColgroup = buildAdminRotationColgroupHtml(hardMachines.length, 46, 50);
  const softColgroup = buildAdminRotationColgroupHtml(softMachines.length, 46, 50);
  const absenceColgroup = buildAdminAbsenceColgroupHtml();

  return [
    '<div class="appMenuSubSection" id="adminRotationEditor">',
    '  <div class="appMenuSubTitle">Rozpis – ' + escapeHtml(monthKey) + '</div>',
    '  <div class="appMenuText">Stejný rozpis, jen editovatelný. Změny zůstávají rozepsané lokálně a do Supabase jdou až po kliknutí na Uložit rozpis.</div>',
    '  <div class="adminRotationSaveDock">',
    '    <div class="adminRotationSaveActions">',
    '      <button type="button" class="appMenuAction isActive adminRotationSaveDockBtn" data-admin-action="save-rotation">Uložit rozpis</button>',
    '      <button type="button" class="appMenuAction adminRotationSelectedRemoveBtn" data-admin-selected-remove hidden>Odebrat vybrané</button>',
    '    </div>',
    '    <span id="adminRotationDraftStatus" class="adminRotationDraftStatus">Rozepsané změny se uloží až tlačítkem.</span>',
    '  </div>',
    buildAdminRotationCompactOverviewHtml(monthKey, hardRows, softRows, hardMachines, softMachines),
    '  <div class="appMenuFreeNamesBox" id="adminRotationFreeNamesSummary">',
    '    <div class="appMenuFreeNamesTitle">Kontrola měsíce</div>',
    '    <div class="appMenuFreeNamesText">Vyber měsíc a hned uvidíš, kdo v něm není zapsaný ani jednou a na kterých dnech ještě někdo chybí.</div>',
    '  </div>',
    '  <details class="appMenuFoldSection adminRotationFold" open>',
    '    <summary>Tvrdota</summary>',
    '    <div class="tableWrap appMenuTableWrap">',
    '      <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense appMenuAdminRotationTable">',
    '        ' + hardColgroup,
    '        <thead><tr><th>Datum</th>' + hardMachines.map(m => '<th>' + escapeHtml(m) + '</th>').join('') + '</tr></thead>',
    '        <tbody>' + renderRows('hard', hardRows, hardMachines.length) + '</tbody>',
    '      </table>',
    '    </div>',
    '  </details>',
    '  <details class="appMenuFoldSection adminRotationFold" open>',
    '    <summary>Měkota</summary>',
    '    <div class="tableWrap appMenuTableWrap">',
    '      <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense appMenuAdminRotationTable">',
    '        ' + softColgroup,
    '        <thead><tr><th>Datum</th>' + softMachines.map(m => '<th>' + escapeHtml(m) + '</th>').join('') + '</tr></thead>',
    '        <tbody>' + renderRows('soft', softRows, softMachines.length) + '</tbody>',
    '      </table>',
    '    </div>',
    '  </details>',
    '  <details class="appMenuFoldSection adminRotationFold" open>',
    '    <summary>Absence</summary>',
    '    <div class="tableWrap appMenuTableWrap">',
    '      <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense appMenuAdminAbsenceTable">',
    '        ' + absenceColgroup,
    '        <thead><tr><th>Datum</th><th>Jméno</th><th>Kód</th></tr></thead>',
    '        <tbody>' + renderNotes() + '</tbody>',
    '      </table>',
    '    </div>',
    buildAdminAbsenceCodeDatalistHtml(),
    buildAdminAbsenceSummaryHtml(notesRows),
    '  </details>',
    '</div>'
  ].join('');
}



function readAdminMachineSettingsFromDom() {
  const rows = [];
  document.querySelectorAll('#appMenuBody tr[data-machine-row-index]').forEach((tr) => {
    const get = (field) => tr.querySelector('[data-machine-field="' + field + '"]')?.value ?? '';
    const label = String(get('label')).trim();
    const machine_code = String(get('machine_code')).trim();
    const machine_index = String(get('machine_index')).trim();
    const cycle_time = String(get('cycle_time')).trim();
    const dress_time = String(get('dress_time')).trim();
    const dress_count = String(get('dress_count')).trim();
    const category = machine_code.toUpperCase().startsWith('TBKR') ? 'brus' : (machine_code.toUpperCase().startsWith('TPKW') ? 'pracka' : 'frezka');
    const machine_key = makeMachineKey(machine_code, machine_index, category);
    if (!machine_key && !label && !cycle_time && !dress_time && !dress_count) return;

    rows.push({
      machine_key,
      machine_code,
      machine_index,
      label: label || machine_key,
      category,
      cycle_time,
      speed: cycle_time,
      dress_time,
      dress_count,
      settings_json: { machine: machine_code, index: machine_index, cycle_time, dress_time, dress_count }
    });
  });
  document.querySelectorAll('#appMenuBody tr[data-fhb-target-row]').forEach((tr) => {
    const key = String(tr.getAttribute('data-fhb-target-row') || '').trim();
    const get = (field) => tr.querySelector('[data-fhb-target-field="' + field + '"]')?.value ?? '';
    const label = String(get('label')).trim() || key;
    const left = String(get('left')).trim();
    const right = String(get('right')).trim();
    const toleranceMinus = String(get('tolerance_minus')).trim() || '10';
    const tolerancePlus = String(get('tolerance_plus')).trim() || '10';
    if (!key) return;
    rows.push({
      machine_key: 'FHB_TARGET_' + key,
      machine_code: 'FHB',
      machine_index: key,
      label,
      category: 'fhb_target',
      cycle_time: '',
      speed: '',
      dress_time: '',
      dress_count: '',
      settings_json: { machine: 'FHB', index: key, type: 'fhb_target', key, label, target_left: left, target_right: right, tolerance_minus: toleranceMinus, tolerance_plus: tolerancePlus }
    });
  });
  const foodSettings = readAdminFoodScheduleSettingsFromDom();
  if (foodSettings && foodSettings.regular && Object.keys(foodSettings.regular).length) {
    rows.push(makeAdminFoodScheduleSettingsRow(foodSettings));
  } else if (Array.isArray(app.machineSettingsRows)) {
    app.machineSettingsRows.filter(adminIsFoodScheduleRow).forEach((row) => rows.push(row));
  }
  return rows;
}
function makeRotationRowKey(row) {
  const cells = Array.isArray(row && row.cells) ? row.cells : [];
  return [String(row && row.date ? row.date : '').trim(), cells.map(v => String(v || '').trim()).join('¦')].join('||');
}

function makeNoteRowKey(note) {
  return [
    String(note && note.date ? note.date : '').trim(),
    String(note && note.person ? note.person : '').trim(),
    String(note && note.code ? note.code : '').trim(),
    String(note && note.shift ? note.shift : '').trim(),
    String(note && note.text ? note.text : '').trim()
  ].join('||');
}

window.splitMachineKey = splitMachineKey;
window.makeMachineKey = makeMachineKey;
window.makeRotationRowKey = makeRotationRowKey;
window.makeNoteRowKey = makeNoteRowKey;

function readAdminRotationFromDom(monthKey) {
  const fallback = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const month = fallback ? JSON.parse(JSON.stringify(fallback)) : {
    hard: { title: 'Rotace tvrdota', machines: HARD_MACHINE_HEADERS.slice(), rows: [] },
    soft: { title: 'Rotace měkota', machines: SOFT_MACHINE_HEADERS.slice(), rows: [] },
    notes: []
  };

  const root = document.getElementById('appMenuBody');
  if (!root) return month;

  const readSection = (section, machineCount) => {
    const rows = [];
    const seen = new Set();
    root.querySelectorAll('tr[data-rotation-section="' + section + '"]').forEach((tr) => {
      const date = String(tr.querySelector('[data-rot-field="date"]')?.value || '').trim();
      const cells = Array.from({ length: machineCount }, (_, i) => String(tr.querySelector('[data-rot-field="cell-' + i + '"]')?.value || '').trim());
      if (!date && cells.every(v => !v)) return;
      const row = { date, cells };
      const key = makeRotationRowKey(row);
      if (seen.has(key)) return;
      seen.add(key);
      rows.push(row);
    });
    month[section] = month[section] || {};
    month[section].rows = rows;
    month[section].machines = section === 'hard' ? HARD_MACHINE_HEADERS.slice() : SOFT_MACHINE_HEADERS.slice();
    if (!month[section].title) month[section].title = section === 'hard' ? 'Rotace tvrdota' : 'Rotace měkota';
  };

  readSection('hard', HARD_MACHINE_HEADERS.length);
  readSection('soft', SOFT_MACHINE_HEADERS.length);

  const notes = [];
  const seenNotes = new Set();
  root.querySelectorAll('tr[data-note-row-index]').forEach((tr) => {
    const get = (field) => String(tr.querySelector('[data-note-field="' + field + '"]')?.value || '').trim();
    const date = get('date');
    const person = get('person');
    const code = get('code');
    const parsed = typeof parseDateToken === 'function' ? parseDateToken(date) : null;
    const shift = parsed && parsed.shift ? parsed.shift : '';
    const text = [person, code].filter(Boolean).join(' ').trim();
    const note = { date, person, code, shift, text };
    if (!note.date && !note.person && !note.code && !note.shift && !note.text) return;
    const key = makeNoteRowKey(note);
    if (seenNotes.has(key)) return;
    seenNotes.add(key);
    notes.push(note);
  });
  month.notes = notes;

  return normalizeMonthForImport(month, fallback);
}

async function saveAdminRotationFromDom(monthKey) {
  if (!monthKey) throw new Error('Chybí měsíc.');
  const fallback = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const normalized = readAdminRotationFromDom(monthKey);
  if (!app.rotation.months) app.rotation.months = {};
  app.rotation.months[monthKey] = normalized;
  app.rotation = normalizeRotationData(app.rotation);
  app.selectedMonth = monthKey;
  saveRotationData();
  renderRotace();
  if (typeof renderMonth === 'function') renderMonth(monthKey);
  if (app.selectedName && typeof renderPerson === 'function') renderPerson(app.selectedName);
  let saveResult = null;
  if (app.adminUnlocked) {
    saveResult = await saveRotationToSupabase(app.rotation, { source: 'admin-menu', monthKey });
  }
  return { normalized, saveResult };
}



const RAK_ROTATION_GENERATOR_CONTRACT_V1106 = Object.freeze({
  version: '1.106',
  action: 'data-admin-action="generate-rotation"',
  scope: 'Administrace dat / Rozpisy',
  source: 'historical-rotation-analysis',
  rule: 'Generátor tvoří první návrh rozpisu pro zvolený měsíc podle předchozích vyplněných rotací. Neodesílá ho online, dokud uživatel neklikne na Uložit rozpis.',
  safety: 'Jedno jméno smí být v jednom dni použité nejvýš jednou; absence v daný den se vynechá; existující obsazený měsíc se přepisuje až po potvrzení.'
});

const RAK_ROTATION_GENERATOR_RULES_V1107 = Object.freeze({
  version: '1.107',
  scope: 'Administrace dat / Rozpisy / Vygenerovat návrh',
  flow: 'Nejdřív doplnit absence a zkontrolovat dny v měsíci, pak teprve generovat návrh.',
  softPreferred: Object.freeze(['Střížek', 'Synek', 'Třasák', 'Špadrna', 'Novotný']),
  hardPreferred: Object.freeze(['Blažek', 'Kmínek', 'Kříž', 'Pech', 'Starý']),
  softHardCycle: Object.freeze(['TNKS01', 'TPKW01', 'TPKW02']),
  hardCycle: Object.freeze(['TNKS01', 'TBKR07', 'TPKW01', 'TPKW02', 'TBKR01']),
  softMachines: Object.freeze(['MSKC01', 'MSKC03', 'MSKC04', 'MFKF06', 'MFKF10']),
  absenceRules: Object.freeze([
    'Když je na frézkách jen jeden člověk, píše se MFKF06 jako neobsazená, i když reálně hlídá obě frézky.',
    'Při jedné absenci zůstává MFKF06 neobsazená a člověk na MFKF10 bere i MFKF06.',
    'Při dvou absencích je na frézkách jeden člověk, MFKF06 je neobsazená, na soustruhách jsou dva lidé a MSKC01 je neobsazená.'
  ]),
  fairness: Object.freeze(['měsíce na sebe navazují', 'tvrdota drží pořadí TNKS01/TBKR07/TPKW01/TPKW02/TBKR01', 'měkota chodí po TNKS01/TPKW01/TPKW02', 'Špadrna a Novotný spíš měkota, ale pomáhají vyrovnat tvrdotu', 'lidé z tvrdoty na měkotě mají mít rozumně střídané MSKC/MFKF'])
});

function adminRotationMonthSortValue(monthKey) {
  const parsed = typeof parseMonthKey === 'function' ? parseMonthKey(monthKey) : null;
  if (parsed && Number.isFinite(parsed.year) && Number.isFinite(parsed.month)) return parsed.year * 100 + parsed.month;
  const match = String(monthKey || '').match(/^(\d{1,2})\/(\d{2,4})$/);
  if (!match) return 0;
  const month = Number(match[1]);
  const rawYear = Number(match[2]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  return year * 100 + month;
}

function adminRotationCanonicalName(name, knownNames) {
  const raw = String(name || '').trim();
  if (!raw) return '';
  const lowered = raw.toLocaleLowerCase('cs-CZ');
  const known = Array.isArray(knownNames) ? knownNames : adminGetKnownNames();
  const match = known.find((item) => String(item || '').trim().toLocaleLowerCase('cs-CZ') === lowered);
  return match || raw;
}

function adminRotationIsRealName(name, knownNames) {
  const value = adminRotationCanonicalName(name, knownNames);
  if (!value) return false;
  const low = value.toLocaleLowerCase('cs-CZ');
  if (['dát pryč', 'odebrat', 'remove', 'pryc', 'pryč', 'volno'].includes(low)) return false;
  const known = Array.isArray(knownNames) ? knownNames : adminGetKnownNames();
  return known.includes(value);
}

function adminRotationRowHasNames(row, knownNames) {
  const cells = Array.isArray(row && row.cells) ? row.cells : [];
  return cells.some((cell) => adminRotationIsRealName(cell, knownNames));
}

function adminRotationMonthHasFilledCells(monthKey) {
  const knownNames = adminGetKnownNames();
  const month = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  if (!month) return false;
  const hardRows = Array.isArray(month.hard && month.hard.rows) ? month.hard.rows : [];
  const softRows = Array.isArray(month.soft && month.soft.rows) ? month.soft.rows : [];
  return hardRows.concat(softRows).some((row) => adminRotationRowHasNames(row, knownNames));
}

function adminRotationHashString(value) {
  const text = String(value || '');
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function adminRotationShiftFromRow(row) {
  const raw = String(row && row.date ? row.date : '').trim();
  const parsed = typeof parseDateToken === 'function' ? parseDateToken(raw) : null;
  const shift = String((parsed && parsed.shift) || '').trim();
  return shift || (raw.match(/\b(R8|N8|R|N)\b/i) || [])[1] || '';
}

function adminRotationDateBaseKey(rawDate) {
  const parsed = typeof parseDateToken === 'function' ? parseDateToken(rawDate) : null;
  if (parsed && Number.isFinite(Number(parsed.day)) && Number.isFinite(Number(parsed.month))) {
    return String(Number(parsed.day)) + '.' + String(Number(parsed.month)) + '.';
  }
  return String(rawDate || '').replace(/\b(?:R8|N8|R|N)\b/gi, '').trim();
}

function adminRotationNamesForAbsenceDate(notesRows, dateLabel, knownNames) {
  const wanted = adminRotationDateBaseKey(dateLabel);
  const blocked = new Set();
  (Array.isArray(notesRows) ? notesRows : []).forEach((note) => {
    if (adminRotationDateBaseKey(note && note.date) !== wanted) return;
    const people = adminSplitPeopleList(note && note.person ? note.person : '');
    people.forEach((person) => {
      const name = adminRotationCanonicalName(person, knownNames);
      if (name) blocked.add(name);
    });
  });
  return blocked;
}

function adminBuildRotationGenerationModel(targetMonthKey) {
  const knownNames = adminGetKnownNames();
  const targetSort = adminRotationMonthSortValue(targetMonthKey);
  const targetParsed = typeof parseMonthKey === 'function' ? parseMonthKey(targetMonthKey) : null;
  const previousYearKey = targetParsed && Number.isFinite(targetParsed.month) && Number.isFinite(targetParsed.year)
    ? (String(targetParsed.month) + '/' + String((targetParsed.year - 1) % 100).padStart(2, '0'))
    : '';
  const machineStats = { hard: [], soft: [] };
  const globalStats = Object.create(null);
  const dayTemplates = [];
  const previousYearTemplates = [];
  knownNames.forEach((name) => { globalStats[name] = 0; });

  const months = getAdminRotationMonthKeys()
    .filter((monthKey) => adminRotationMonthSortValue(monthKey) < targetSort)
    .sort((a, b) => adminRotationMonthSortValue(a) - adminRotationMonthSortValue(b));

  const addMachineStat = (sectionKey, machineIdx, name, weight) => {
    if (!machineStats[sectionKey][machineIdx]) machineStats[sectionKey][machineIdx] = Object.create(null);
    machineStats[sectionKey][machineIdx][name] = (machineStats[sectionKey][machineIdx][name] || 0) + weight;
    globalStats[name] = (globalStats[name] || 0) + weight;
  };

  months.forEach((monthKey, monthIdx) => {
    const month = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
    if (!month) return;
    const hardRows = Array.isArray(month.hard && month.hard.rows) ? month.hard.rows : [];
    const softRows = Array.isArray(month.soft && month.soft.rows) ? month.soft.rows : [];
    const maxRows = Math.max(hardRows.length, softRows.length);
    const recencyWeight = 1 + monthIdx * 0.035;
    for (let rowIdx = 0; rowIdx < maxRows; rowIdx += 1) {
      const hardRow = hardRows[rowIdx] || null;
      const softRow = softRows[rowIdx] || null;
      const hardCells = Array.from({ length: HARD_MACHINE_HEADERS.length }, (_, idx) => adminRotationCanonicalName(hardRow && hardRow.cells ? hardRow.cells[idx] : '', knownNames));
      const softCells = Array.from({ length: SOFT_MACHINE_HEADERS.length }, (_, idx) => adminRotationCanonicalName(softRow && softRow.cells ? softRow.cells[idx] : '', knownNames));
      const hasAny = hardCells.concat(softCells).some((name) => adminRotationIsRealName(name, knownNames));
      if (!hasAny) continue;
      const template = {
        monthKey,
        rowIdx,
        shift: adminRotationShiftFromRow(hardRow || softRow || {}),
        hardCells,
        softCells
      };
      dayTemplates.push(template);
      if (monthKey === previousYearKey) previousYearTemplates.push(template);
      hardCells.forEach((name, idx) => { if (adminRotationIsRealName(name, knownNames)) addMachineStat('hard', idx, name, recencyWeight); });
      softCells.forEach((name, idx) => { if (adminRotationIsRealName(name, knownNames)) addMachineStat('soft', idx, name, recencyWeight); });
    }
  });

  return { knownNames, machineStats, globalStats, dayTemplates, previousYearTemplates, previousYearKey };
}

function adminPickRotationGeneratorName(model, sectionKey, machineIdx, rowIdx, usedNames, monthCounts, previousRowNames, suggestedName, shift) {
  const knownNames = model && Array.isArray(model.knownNames) ? model.knownNames : adminGetKnownNames();
  const available = knownNames.filter((name) => !usedNames.has(name));
  if (!available.length) return '';
  const stats = model && model.machineStats && model.machineStats[sectionKey] && model.machineStats[sectionKey][machineIdx]
    ? model.machineStats[sectionKey][machineIdx]
    : Object.create(null);
  const globalStats = model && model.globalStats ? model.globalStats : Object.create(null);
  let best = '';
  let bestScore = -Infinity;
  available.forEach((name) => {
    const skill = Number(stats[name] || 0);
    const global = Number(globalStats[name] || 0);
    const monthly = Number(monthCounts[name] || 0);
    const suggested = suggestedName && name === suggestedName ? 760 : 0;
    const previousPenalty = previousRowNames && previousRowNames.has(name) ? 46 : 0;
    const shiftHash = adminRotationHashString([sectionKey, machineIdx, rowIdx, shift || '', name].join('|')) % 23;
    const score = suggested + Math.log1p(skill) * 130 + skill * 4.5 + Math.log1p(global) * 12 - monthly * 62 - previousPenalty + shiftHash / 10;
    if (score > bestScore) {
      bestScore = score;
      best = name;
    }
  });
  return best;
}

function adminRotationGeneratorMachineIndex(headers, machineName) {
  const wanted = String(machineName || '').trim().toUpperCase();
  return (Array.isArray(headers) ? headers : []).findIndex((item) => String(item || '').trim().toUpperCase() === wanted);
}

function adminRotationGeneratorDateNotes(month, dateLabel) {
  const wanted = adminRotationDateBaseKey(dateLabel);
  return (Array.isArray(month && month.notes) ? month.notes : []).filter((note) => adminRotationDateBaseKey(note && note.date) === wanted);
}

function adminRotationGeneratorIsDayBlocked(notes) {
  return (Array.isArray(notes) ? notes : []).some((note) => {
    const text = [note && note.person, note && note.code, note && note.text].map((part) => String(part || '').toLocaleLowerCase('cs-CZ')).join(' ');
    return /\b(?:svátek|svatek|odstávka|odstavka|odstaveno|shutdown|bez\s+směny|bez\s+smeny|nejet|nejede)\b/i.test(text);
  });
}

function adminRotationGeneratorCreateCounters(model) {
  const counters = { total: Object.create(null), hard: Object.create(null), soft: Object.create(null), hardMachine: Object.create(null), softMachine: Object.create(null), softKind: Object.create(null) };
  const known = model && Array.isArray(model.knownNames) ? model.knownNames : adminGetKnownNames();
  known.forEach((name) => {
    counters.total[name] = 0;
    counters.hard[name] = 0;
    counters.soft[name] = 0;
    counters.softKind[name] = { lathe: 0, mill: 0 };
    counters.hardMachine[name] = Object.create(null);
    counters.softMachine[name] = Object.create(null);
  });
  return counters;
}

function adminRotationGeneratorHistoricalMachineScore(model, sectionKey, machineIdx, name) {
  const stats = model && model.machineStats && model.machineStats[sectionKey] && model.machineStats[sectionKey][machineIdx]
    ? model.machineStats[sectionKey][machineIdx]
    : null;
  return Number(stats && stats[name] || 0);
}

function adminRotationGeneratorPickName(candidates, usedNames, counters, options) {
  const opts = options || {};
  const list = (Array.isArray(candidates) ? candidates : []).filter((name) => name && !usedNames.has(name));
  if (!list.length) return '';
  let best = '';
  let bestScore = Infinity;
  list.forEach((name) => {
    const total = Number(counters.total[name] || 0);
    const section = Number((opts.sectionKey === 'soft' ? counters.soft[name] : counters.hard[name]) || 0);
    const machineMap = opts.sectionKey === 'soft' ? counters.softMachine[name] : counters.hardMachine[name];
    const machineKey = String(opts.machineName || '');
    const machine = Number(machineMap && machineMap[machineKey] || 0);
    const historical = Number(opts.historical || 0);
    const preferred = Array.isArray(opts.preferred) && opts.preferred.includes(name) ? -120 : 0;
    const required = Array.isArray(opts.required) && opts.required.includes(name) ? -300 : 0;
    const avoid = Array.isArray(opts.avoid) && opts.avoid.includes(name) ? 220 : 0;
    const hardBalance = opts.machineName === 'TNKS01' || opts.machineName === 'TPKW02'
      ? Math.abs(Number((counters.hardMachine[name] && counters.hardMachine[name].TNKS01) || 0) - Number((counters.hardMachine[name] && counters.hardMachine[name].TPKW02) || 0)) * 34
      : 0;
    const kindBalance = opts.softKind === 'mill'
      ? Math.max(0, Number((counters.softKind[name] && counters.softKind[name].mill) || 0) - Number((counters.softKind[name] && counters.softKind[name].lathe) || 0)) * 42
      : (opts.softKind === 'lathe'
        ? Math.max(0, Number((counters.softKind[name] && counters.softKind[name].lathe) || 0) - Number((counters.softKind[name] && counters.softKind[name].mill) || 0)) * 24
        : 0);
    const jitter = (adminRotationHashString([opts.sectionKey || '', opts.machineName || '', opts.rowIdx || 0, name].join('|')) % 19) / 100;
    const score = total * 44 + section * 18 + machine * 95 - Math.log1p(Math.max(0, historical)) * 9 + preferred + required + avoid + hardBalance + kindBalance + jitter;
    if (score < bestScore) {
      bestScore = score;
      best = name;
    }
  });
  return best;
}

function adminRotationGeneratorMarkAssignment(counters, sectionKey, machineName, name, softKind) {
  if (!name) return;
  counters.total[name] = Number(counters.total[name] || 0) + 1;
  if (sectionKey === 'soft') counters.soft[name] = Number(counters.soft[name] || 0) + 1;
  else counters.hard[name] = Number(counters.hard[name] || 0) + 1;
  const machineMap = sectionKey === 'soft' ? counters.softMachine : counters.hardMachine;
  if (!machineMap[name]) machineMap[name] = Object.create(null);
  machineMap[name][machineName] = Number(machineMap[name][machineName] || 0) + 1;
  if (sectionKey === 'soft' && softKind) {
    if (!counters.softKind[name]) counters.softKind[name] = { lathe: 0, mill: 0 };
    counters.softKind[name][softKind] = Number(counters.softKind[name][softKind] || 0) + 1;
  }
}

function adminRotationGeneratorSoftSlotPlan(softCount) {
  const idx = {
    MSKC01: adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MSKC01'),
    MSKC03: adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MSKC03'),
    MSKC04: adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MSKC04'),
    MFKF06: adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MFKF06'),
    MFKF10: adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MFKF10')
  };
  if (softCount >= 5) return [idx.MSKC01, idx.MSKC03, idx.MSKC04, idx.MFKF06, idx.MFKF10].filter((n) => n >= 0);
  if (softCount === 4) return [idx.MSKC01, idx.MSKC03, idx.MSKC04, idx.MFKF10].filter((n) => n >= 0);
  if (softCount === 3) return [idx.MSKC03, idx.MSKC04, idx.MFKF10].filter((n) => n >= 0);
  if (softCount === 2) return [idx.MSKC03, idx.MFKF10].filter((n) => n >= 0);
  if (softCount === 1) return [idx.MFKF10].filter((n) => n >= 0);
  return [];
}

function adminRotationGeneratorSoftKind(machineName) {
  return /^MFKF/i.test(String(machineName || '')) ? 'mill' : 'lathe';
}

function adminRotationGeneratorBuildDay(month, model, counters, rowIdx, dateLabel, blockedNames) {
  const knownNames = model.knownNames;
  const softPreferred = RAK_ROTATION_GENERATOR_RULES_V1107.softPreferred.filter((name) => knownNames.includes(name));
  const hardPreferred = RAK_ROTATION_GENERATOR_RULES_V1107.hardPreferred.filter((name) => knownNames.includes(name));
  const available = knownNames.filter((name) => !blockedNames.has(name));
  const usedNames = new Set();
  const hardCells = Array(HARD_MACHINE_HEADERS.length).fill('');
  const softCells = Array(SOFT_MACHINE_HEADERS.length).fill('');
  const hardTargetCount = Math.min(HARD_MACHINE_HEADERS.length, available.length);
  const softTargetCount = Math.max(0, Math.min(SOFT_MACHINE_HEADERS.length, available.length - hardTargetCount));

  if (!available.length) return { hardCells, softCells, filledCells: 0, emptyProtected: 0 };

  const softHardCycle = RAK_ROTATION_GENERATOR_RULES_V1107.softHardCycle;
  const cycleMachine = softHardCycle[rowIdx % softHardCycle.length];
  const cycleIdx = adminRotationGeneratorMachineIndex(HARD_MACHINE_HEADERS, cycleMachine);
  const softHardCandidates = softPreferred.filter((name) => available.includes(name));
  const exchangeSoft = cycleIdx >= 0 && hardTargetCount > 0
    ? adminRotationGeneratorPickName(softHardCandidates, usedNames, counters, {
        sectionKey: 'hard',
        machineName: cycleMachine,
        rowIdx,
        preferred: softPreferred.slice(0, 3),
        historical: adminRotationGeneratorHistoricalMachineScore(model, 'hard', cycleIdx, softHardCandidates[0] || '')
      })
    : '';
  if (exchangeSoft) {
    hardCells[cycleIdx] = exchangeSoft;
    usedNames.add(exchangeSoft);
    adminRotationGeneratorMarkAssignment(counters, 'hard', cycleMachine, exchangeSoft);
  }

  HARD_MACHINE_HEADERS.forEach((machineName, machineIdx) => {
    if (hardCells[machineIdx] || usedNames.size >= hardTargetCount) return;
    const historicalCandidates = (model.dayTemplates[rowIdx % model.dayTemplates.length] && model.dayTemplates[rowIdx % model.dayTemplates.length].hardCells) || [];
    const suggested = adminRotationCanonicalName(historicalCandidates[machineIdx] || '', knownNames);
    const preferred = hardPreferred.filter((name) => available.includes(name));
    const fallback = available.filter((name) => !softPreferred.includes(name)).concat(available.filter((name) => softPreferred.includes(name)));
    const ordered = Array.from(new Set((suggested ? [suggested] : []).concat(preferred, fallback))).filter((name) => available.includes(name));
    const name = adminRotationGeneratorPickName(ordered, usedNames, counters, {
      sectionKey: 'hard',
      machineName,
      rowIdx,
      preferred: hardPreferred,
      avoid: softPreferred,
      historical: adminRotationGeneratorHistoricalMachineScore(model, 'hard', machineIdx, suggested || '')
    });
    if (name) {
      hardCells[machineIdx] = name;
      usedNames.add(name);
      adminRotationGeneratorMarkAssignment(counters, 'hard', machineName, name);
    }
  });

  const remaining = available.filter((name) => !usedNames.has(name));
  const softSlots = adminRotationGeneratorSoftSlotPlan(Math.min(softTargetCount, remaining.length));
  softSlots.forEach((machineIdx) => {
    const machineName = SOFT_MACHINE_HEADERS[machineIdx] || '';
    const kind = adminRotationGeneratorSoftKind(machineName);
    const preferred = kind === 'mill'
      ? remaining.filter((name) => !softPreferred.includes(name)).concat(remaining.filter((name) => softPreferred.includes(name)))
      : remaining.filter((name) => softPreferred.includes(name)).concat(remaining.filter((name) => !softPreferred.includes(name)));
    const name = adminRotationGeneratorPickName(Array.from(new Set(preferred)), usedNames, counters, {
      sectionKey: 'soft',
      machineName,
      rowIdx,
      softKind: kind,
      preferred: kind === 'lathe' ? softPreferred : hardPreferred,
      historical: adminRotationGeneratorHistoricalMachineScore(model, 'soft', machineIdx, preferred[0] || '')
    });
    if (name) {
      softCells[machineIdx] = name;
      usedNames.add(name);
      adminRotationGeneratorMarkAssignment(counters, 'soft', machineName, name, kind);
    }
  });

  const mfkf06Idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MFKF06');
  const mfkf10Idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MFKF10');
  const mskc01Idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MSKC01');
  const millPeopleCount = [mfkf06Idx, mfkf10Idx].filter((idx) => idx >= 0 && String(softCells[idx] || '').trim()).length;
  const lathePeopleCount = [mskc01Idx, adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MSKC03'), adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MSKC04')].filter((idx) => idx >= 0 && String(softCells[idx] || '').trim()).length;
  let emptyProtected = 0;
  if (millPeopleCount === 1 && mfkf06Idx >= 0) {
    softCells[mfkf06Idx] = '';
    emptyProtected += 1;
  }
  if (softTargetCount === 3 && lathePeopleCount === 2 && mskc01Idx >= 0) {
    softCells[mskc01Idx] = '';
    emptyProtected += 1;
  }

  return {
    hardCells,
    softCells,
    filledCells: hardCells.concat(softCells).filter((cell) => String(cell || '').trim()).length,
    emptyProtected
  };
}

function adminGenerateRotationMonthDraft(monthKey) {
  if (!monthKey) throw new Error('Chybí měsíc.');
  const domMonth = document.getElementById('appMenuBody') ? readAdminRotationFromDom(monthKey) : null;
  const fallback = domMonth || (app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null);
  if (!fallback) throw new Error('Pro vybraný měsíc nejsou připravené řádky.');
  const model = adminBuildRotationGenerationModel(monthKey);
  if (!model.dayTemplates.length) throw new Error('Nemám z čeho vycházet. Nejdřív musí existovat aspoň jeden vyplněný předchozí rozpis.');
  const month = JSON.parse(JSON.stringify(fallback));
  month.hard = month.hard || { title: 'Rotace tvrdota', machines: HARD_MACHINE_HEADERS.slice(), rows: [] };
  month.soft = month.soft || { title: 'Rotace měkota', machines: SOFT_MACHINE_HEADERS.slice(), rows: [] };
  month.notes = Array.isArray(month.notes) ? month.notes : [];
  const hardRows = Array.isArray(month.hard.rows) ? month.hard.rows : [];
  const softRows = Array.isArray(month.soft.rows) ? month.soft.rows : [];
  const maxRows = Math.max(hardRows.length, softRows.length);
  const counters = adminRotationGeneratorCreateCounters(model);
  let filledCells = 0;
  let days = 0;
  let blockedByAbsence = 0;
  let skippedDays = 0;
  let protectedEmptyCells = 0;
  const knownNames = model.knownNames;

  for (let rowIdx = 0; rowIdx < maxRows; rowIdx += 1) {
    if (!hardRows[rowIdx] && softRows[rowIdx]) hardRows[rowIdx] = { date: softRows[rowIdx].date || '', cells: Array(HARD_MACHINE_HEADERS.length).fill('') };
    if (!softRows[rowIdx] && hardRows[rowIdx]) softRows[rowIdx] = { date: hardRows[rowIdx].date || '', cells: Array(SOFT_MACHINE_HEADERS.length).fill('') };
    const hardRow = hardRows[rowIdx];
    const softRow = softRows[rowIdx];
    if (!hardRow && !softRow) continue;
    const dateLabel = (hardRow && hardRow.date) || (softRow && softRow.date) || '';
    const dayNotes = adminRotationGeneratorDateNotes(month, dateLabel);
    const absenceNames = adminRotationNamesForAbsenceDate(month.notes, dateLabel, knownNames);
    blockedByAbsence += absenceNames.size;
    if (adminRotationGeneratorIsDayBlocked(dayNotes)) {
      if (hardRow) hardRow.cells = Array(HARD_MACHINE_HEADERS.length).fill('');
      if (softRow) softRow.cells = Array(SOFT_MACHINE_HEADERS.length).fill('');
      skippedDays += 1;
      continue;
    }
    const generated = adminRotationGeneratorBuildDay(month, model, counters, rowIdx, dateLabel, absenceNames);
    if (hardRow) hardRow.cells = generated.hardCells;
    if (softRow) softRow.cells = generated.softCells;
    filledCells += generated.filledCells;
    protectedEmptyCells += generated.emptyProtected;
    if (generated.filledCells) days += 1;
  }

  month.hard.rows = hardRows;
  month.hard.machines = HARD_MACHINE_HEADERS.slice();
  month.hard.title = month.hard.title || 'Rotace tvrdota';
  month.soft.rows = softRows;
  month.soft.machines = SOFT_MACHINE_HEADERS.slice();
  month.soft.title = month.soft.title || 'Rotace měkota';
  const normalized = normalizeMonthForImport(month, fallback);
  if (!app.rotation.months) app.rotation.months = {};
  app.rotation.months[monthKey] = normalized;
  app.rotation = normalizeRotationData(app.rotation);
  app.selectedMonth = monthKey;
  saveRotationData();
  renderRotace();
  if (typeof renderMonth === 'function') renderMonth(monthKey);
  if (app.selectedName && typeof renderPerson === 'function') renderPerson(app.selectedName);
  return {
    normalized,
    days,
    filledCells,
    historyTemplates: model.dayTemplates.length,
    previousYearTemplates: model.previousYearTemplates.length,
    previousYearKey: model.previousYearKey,
    blockedByAbsence,
    skippedDays,
    protectedEmptyCells,
    ruleVersion: '1.107'
  };
}

window.RAK_ROTATION_GENERATOR_CONTRACT_V1106 = RAK_ROTATION_GENERATOR_CONTRACT_V1106;
window.RAK_ROTATION_GENERATOR_RULES_V1107 = RAK_ROTATION_GENERATOR_RULES_V1107;
window.adminGenerateRotationMonthDraft = adminGenerateRotationMonthDraft;
window.adminRotationMonthHasFilledCells = adminRotationMonthHasFilledCells;


function adminGetSelectedRemoveButton() {
  const body = document.getElementById('appMenuBody');
  return body ? body.querySelector('[data-admin-selected-remove]') : null;
}

function adminHideRotationSelectedRemove() {
  const btn = adminGetSelectedRemoveButton();
  if (btn) {
    btn.hidden = true;
    btn.dataset.targetReady = '';
  }
  window.__rakAdminRotationSelectedInput = null;
}

function adminShowRotationSelectedRemove(input) {
  try {
    const body = document.getElementById('appMenuBody');
    const btn = adminGetSelectedRemoveButton();
    if (!body || body.dataset.adminView !== 'rotation' || !btn || !input || !body.contains(input)) {
      adminHideRotationSelectedRemove();
      return;
    }
    if (!input.matches('[data-rot-field^="cell-"], [data-note-field="person"]')) {
      adminHideRotationSelectedRemove();
      return;
    }
    const value = String(input.value || '').trim();
    if (!value || adminRotationIsRemoveValue(value)) {
      adminHideRotationSelectedRemove();
      return;
    }
    window.__rakAdminRotationSelectedInput = input;
    // RaK 1.2 (1.107) – horní sticky tlačítko už při kliknutí do jména nevytahujeme.
    // Rychlé Odebrat se vykreslí přímo u aktivního pole přes adminShowRotationQuickRemove().
    btn.hidden = true;
    btn.dataset.targetReady = '1';
    btn.textContent = 'Odebrat vybrané';
    const status = document.getElementById('adminRotationDraftStatus');
    if (status) status.textContent = 'Vybrané: ' + value + ' · odebrání je přímo u jména.';
  } catch (err) {
    console.warn('Admin selected remove failed', err);
  }
}

function adminRemoveSelectedRotationName() {
  const input = window.__rakAdminRotationSelectedInput;
  if (!input || !input.isConnected) {
    adminHideRotationSelectedRemove();
    return;
  }
  input.value = '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  try { input.focus({ preventScroll: true }); } catch (err) { try { input.focus(); } catch (err2) {} }
  adminHideRotationSelectedRemove();
  const status = document.getElementById('adminRotationDraftStatus');
  if (status) status.textContent = 'Jméno odebrané z rozepsané tabulky. Nezapomeň dát Uložit rozpis.';
}

function adminRotationIsRemoveValue(value) {
  const v = String(value || '').trim().toLowerCase();
  return v === 'dát pryč' || v === 'dat pryc' || v === 'pryč' || v === 'pryc' || v === 'odebrat' || v === 'remove';
}

function adminCloseRotationQuickRemove() {
  const box = document.getElementById('adminRotationQuickRemove');
  if (box) box.remove();
  window.__rakAdminRotationQuickRemoveInput = null;
}

function adminShowRotationQuickRemove(input) {
  try {
    const body = document.getElementById('appMenuBody');
    if (!body || body.dataset.adminView !== 'rotation' || !input || !body.contains(input)) return;
    if (!input.matches('[data-rot-field^="cell-"], [data-note-field="person"]')) {
      adminCloseRotationQuickRemove();
      return;
    }
    const value = String(input.value || '').trim();
    if (!value || adminRotationIsRemoveValue(value)) {
      adminCloseRotationQuickRemove();
      return;
    }
    let box = document.getElementById('adminRotationQuickRemove');
    if (!box) {
      box = document.createElement('div');
      box.id = 'adminRotationQuickRemove';
      box.className = 'adminRotationQuickRemove';
      box.innerHTML = '<span class="adminRotationQuickRemoveText"></span><button type="button" class="adminRotationQuickRemoveBtn">Odebrat</button>';
      document.body.appendChild(box);
      box.addEventListener('click', (ev) => {
        const btn = ev.target && ev.target.closest ? ev.target.closest('.adminRotationQuickRemoveBtn') : null;
        if (!btn) return;
        ev.preventDefault();
        const target = window.__rakAdminRotationQuickRemoveInput;
        if (target && target.isConnected) {
          target.value = '';
          target.dispatchEvent(new Event('input', { bubbles: true }));
          target.dispatchEvent(new Event('change', { bubbles: true }));
          try { target.focus({ preventScroll: true }); } catch (err) { try { target.focus(); } catch (err2) {} }
        }
        adminCloseRotationQuickRemove();
      });
    }
    window.__rakAdminRotationQuickRemoveInput = input;
    window.__rakAdminRotationQuickRemoveShownAt = Date.now();
    const txt = box.querySelector('.adminRotationQuickRemoveText');
    if (txt) txt.textContent = 'Jméno: ' + value;
    const rect = input.getBoundingClientRect();
    const vw = Math.max(320, window.innerWidth || document.documentElement.clientWidth || 320);
    const top = Math.max(8, Math.round(rect.bottom + 6));
    const left = Math.max(8, Math.min(vw - 196, Math.round(rect.left + (rect.width / 2) - 94)));
    box.style.top = String(top) + 'px';
    box.style.left = String(left) + 'px';
    box.classList.add('isVisible');
  } catch (err) {
    console.warn('Admin quick remove failed', err);
  }
}

function adminScheduleRotationQuickRemove(input) {
  try {
    window.clearTimeout(window.__rakAdminRotationQuickRemoveTimer || 0);
    window.__rakAdminRotationQuickRemoveTimer = window.setTimeout(() => adminShowRotationQuickRemove(input), 35);
  } catch (err) {
    adminShowRotationQuickRemove(input);
  }
}

function adminCloseAbsenceCodePicker() {
  const box = document.getElementById('adminAbsenceCodePicker');
  if (box) box.remove();
  window.__rakAdminAbsenceCodeInput = null;
}

function adminShowAbsenceCodePicker(input) {
  try {
    const body = document.getElementById('appMenuBody');
    if (!body || body.dataset.adminView !== 'rotation' || !input || !body.contains(input) || !input.matches('[data-note-field="code"]')) {
      adminCloseAbsenceCodePicker();
      return;
    }
    let box = document.getElementById('adminAbsenceCodePicker');
    if (!box) {
      box = document.createElement('div');
      box.id = 'adminAbsenceCodePicker';
      box.className = 'adminAbsenceCodePicker';
      const codes = ['D', 'N', 'NV', '§', 'Lázně'];
      box.innerHTML = '<div class="adminAbsenceCodePickerTitle">Zkratka absence</div><div class="adminAbsenceCodePickerGrid">' +
        codes.map(code => '<button type="button" class="adminAbsenceCodeChip" data-absence-code="' + escapeHtml(code) + '">' + escapeHtml(code) + '</button>').join('') +
        '</div>';
      document.body.appendChild(box);
      box.addEventListener('pointerdown', (ev) => {
        const btn = ev.target && ev.target.closest ? ev.target.closest('[data-absence-code]') : null;
        if (!btn) return;
        ev.preventDefault();
        const target = window.__rakAdminAbsenceCodeInput;
        const code = String(btn.getAttribute('data-absence-code') || '').trim();
        if (target && target.isConnected && code) {
          target.value = code;
          target.dispatchEvent(new Event('input', { bubbles: true }));
          target.dispatchEvent(new Event('change', { bubbles: true }));
          try { target.focus({ preventScroll: true }); } catch (err) { try { target.focus(); } catch (err2) {} }
        }
        adminCloseAbsenceCodePicker();
      });
    }
    window.__rakAdminAbsenceCodeInput = input;
    const rect = input.getBoundingClientRect();
    const vw = Math.max(320, window.innerWidth || document.documentElement.clientWidth || 320);
    const vh = Math.max(480, window.innerHeight || document.documentElement.clientHeight || 480);
    const pickerWidth = 214;
    const pickerHeight = 104;
    let top = Math.round(rect.bottom + 6);
    if (top + pickerHeight > vh - 8) top = Math.max(8, Math.round(rect.top - pickerHeight - 6));
    const left = Math.max(8, Math.min(vw - pickerWidth - 8, Math.round(rect.left + (rect.width / 2) - (pickerWidth / 2))));
    box.style.top = String(top) + 'px';
    box.style.left = String(left) + 'px';
    box.classList.add('isVisible');
  } catch (err) {
    console.warn('Admin absence code picker failed', err);
  }
}

function adminScheduleAbsenceCodePicker(input) {
  try {
    window.clearTimeout(window.__rakAdminAbsenceCodePickerTimer || 0);
    window.__rakAdminAbsenceCodePickerTimer = window.setTimeout(() => adminShowAbsenceCodePicker(input), 40);
  } catch (err) {
    adminShowAbsenceCodePicker(input);
  }
}

function adminSetRotationViewportLock(active) {
  try {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    if (!window.__rakDefaultViewportContent) {
      window.__rakDefaultViewportContent = meta.getAttribute('content') || 'width=device-width, initial-scale=1.0, viewport-fit=cover';
    }
    const locked = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    meta.setAttribute('content', active ? locked : window.__rakDefaultViewportContent);
  } catch (err) {}
}

function adminBindRotationZoomGuard() {
  if (window.__rakAdminRotationZoomGuardBound) return;
  window.__rakAdminRotationZoomGuardBound = true;
  const isAdminRotation = () => {
    const body = document.getElementById('appMenuBody');
    return !!(body && body.dataset.adminView === 'rotation' && document.getElementById('adminRotationEditor'));
  };
  const isAdminRotationField = (node) => !!(node && node.matches && node.matches('[data-rot-field], [data-note-field]'));
  const blockZoom = (event) => {
    if (!isAdminRotation()) return;
    adminSetRotationViewportLock(true);
    try { adminCloseRotationQuickRemove(); } catch (err) {}
    try { adminHideRotationSelectedRemove(); } catch (err) {}
    if (event && event.touches && event.touches.length < 2) return;
    try { event.preventDefault(); } catch (err) {}
  };
  const lockForField = (event) => {
    if (!isAdminRotation()) return;
    const target = event && event.target;
    if (!isAdminRotationField(target)) return;
    adminSetRotationViewportLock(true);
  };
  const recoverAfterViewportChange = () => {
    if (!isAdminRotation()) return;
    adminSetRotationViewportLock(true);
    try { adminHideRotationSelectedRemove(); } catch (err) {}
    try {
      const active = document.activeElement;
      if (active && isAdminRotationField(active)) {
        if (window.visualViewport && Number(window.visualViewport.scale || 1) > 1.01) active.blur();
        else if (active.matches && active.matches('[data-rot-field^="cell-"], [data-note-field="person"]')) window.setTimeout(() => adminShowRotationQuickRemove(active), 80);
      } else if (window.__rakAdminRotationQuickRemoveInput && window.__rakAdminRotationQuickRemoveInput.isConnected) {
        window.setTimeout(() => adminShowRotationQuickRemove(window.__rakAdminRotationQuickRemoveInput), 80);
      } else {
        adminCloseRotationQuickRemove();
      }
    } catch (err) {}
    try {
      const body = document.getElementById('appMenuBody');
      if (body) body.classList.add('adminRotationViewportRecovered');
    } catch (err) {}
  };
  try { document.addEventListener('gesturestart', blockZoom, { passive: false }); } catch (err) {}
  try { document.addEventListener('gesturechange', blockZoom, { passive: false }); } catch (err) {}
  try { document.addEventListener('gestureend', blockZoom, { passive: false }); } catch (err) {}
  try { document.addEventListener('touchstart', lockForField, { passive: true, capture: true }); } catch (err) {}
  try { document.addEventListener('focusin', lockForField, true); } catch (err) {}
  try {
    window.addEventListener('resize', recoverAfterViewportChange, { passive: true });
  } catch (err) {}
  try {
    if (!window.__rakAdminRotationQuickRemoveOutsideBound) {
      window.__rakAdminRotationQuickRemoveOutsideBound = true;
      document.addEventListener('pointerdown', (event) => {
        const body = document.getElementById('appMenuBody');
        if (!body || body.dataset.adminView !== 'rotation') return;
        const target = event && event.target;
        const quick = document.getElementById('adminRotationQuickRemove');
        const codePicker = document.getElementById('adminAbsenceCodePicker');
        if (quick && target && (quick === target || quick.contains(target))) return;
        if (codePicker && target && (codePicker === target || codePicker.contains(target))) return;
        if (target && target.matches && target.matches('[data-rot-field], [data-note-field]')) return;
        adminCloseRotationQuickRemove();
        adminCloseAbsenceCodePicker();
      }, true);
    }
  } catch (err) {}
}


function runAdminRotationEditorMaintenance(body, reason) {
  if (!body || body.dataset.adminView !== 'rotation') return;
  try {
    if (typeof adminRefreshRotationSuggestions === 'function') adminRefreshRotationSuggestions(body);
    else if (typeof adminRenderRotationAvailabilitySummary === 'function') adminRenderRotationAvailabilitySummary(body);
  } catch (err) {
    console.warn('Admin rotation maintenance failed', reason || '', err);
    const status = body.querySelector('#adminOnlineSaveStatus');
    if (status) status.textContent = 'Kontrola rozpisu se teď nepřepočítala, ale editace zůstala zachovaná.';
  }
}

function scheduleAdminRotationEditorMaintenance(body, reason, delayMs) {
  if (!body || body.dataset.adminView !== 'rotation') return;
  try {
    if (body.__adminRotationMaintenanceTimer) window.clearTimeout(body.__adminRotationMaintenanceTimer);
    const delay = Number.isFinite(delayMs) ? delayMs : 180;
    body.__adminRotationMaintenanceTimer = window.setTimeout(() => {
      body.__adminRotationMaintenanceTimer = 0;
      runAdminRotationEditorMaintenance(body, reason || 'scheduled');
    }, delay);
  } catch (err) {
    runAdminRotationEditorMaintenance(body, reason || 'fallback');
  }
}


try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}
