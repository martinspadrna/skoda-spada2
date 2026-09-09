// RaK 1.2 (1.155) – Administrace Rozpisy a Nastavení strojů oddělené z hlavního UI modulu.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation.js', 'loading', { source: 'dynamic-loader' }); } catch (err) {}


function getAdminRotationMonthKeys() {
  return Object.keys(app.rotation && app.rotation.months ? app.rotation.months : {}).sort((a, b) => {
    const diff = adminRotationMonthSortValue(a) - adminRotationMonthSortValue(b);
    return diff || a.localeCompare(b, 'cs');
  });
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
    if (typeof app !== 'undefined' && app && app.adminRotationDirty === true && document.getElementById('adminRotationEditor')) {
      if (!confirm('V editoru jsou neuložené změny. Opravdu je zahodit a načíst online stav?')) return null;
      app.adminRotationDirty = false;
    }
    return syncRotationFromSupabase('discard-draft');
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


function adminRotationSettingsJson(row) {
  if (row && row.settings_json && typeof row.settings_json === 'object') return row.settings_json;
  try { return row && row.settings_json ? JSON.parse(String(row.settings_json)) : {}; }
  catch (err) { return {}; }
}

function adminRotationSplitGeneratorList(value) {
  const source = Array.isArray(value) ? value : String(value || '').split(/[\n,;]/);
  const seen = new Set();
  return source
    .map((item) => String(item || '').trim())
    .filter((item) => {
      if (!item || seen.has(item)) return false;
      seen.add(item);
      return true;
    });
}

function adminRotationFilterMachineList(list, headers) {
  const allowed = new Set((Array.isArray(headers) ? headers : []).map((item) => String(item || '').trim().toUpperCase()).filter(Boolean));
  return adminRotationSplitGeneratorList(list).filter((item) => allowed.has(String(item || '').toUpperCase()));
}

function adminRotationNormalizeSoftBaseLathe(value, softCore) {
  const raw = value && typeof value === 'object' ? value : {};
  const allowed = new Set((Array.isArray(SOFT_MACHINE_HEADERS) ? SOFT_MACHINE_HEADERS : []).map((item) => String(item || '').trim().toUpperCase()).filter(Boolean));
  const names = adminRotationSplitGeneratorList(softCore);
  const map = {};
  names.forEach((name) => {
    const machine = String(raw[name] || '').trim().toUpperCase();
    if (machine && allowed.has(machine)) map[name] = machine;
  });
  return map;
}

function adminRotationNormalizeGeneratorSettings(settings) {
  const base = RAK_ROTATION_GENERATOR_RULES_V1107 || {};
  const raw = settings && typeof settings === 'object' ? settings : {};
  const softPreferred = adminRotationSplitGeneratorList(raw.softPreferred).length
    ? adminRotationSplitGeneratorList(raw.softPreferred)
    : Array.from(base.softPreferred || []);
  const hardPreferred = adminRotationSplitGeneratorList(raw.hardPreferred).length
    ? adminRotationSplitGeneratorList(raw.hardPreferred)
    : Array.from(base.hardPreferred || []);
  const softCore = adminRotationSplitGeneratorList(raw.softCore).length
    ? adminRotationSplitGeneratorList(raw.softCore)
    : Array.from(base.softCore || []);
  const softHardCycle = adminRotationFilterMachineList(raw.softHardCycle, HARD_MACHINE_HEADERS).length
    ? adminRotationFilterMachineList(raw.softHardCycle, HARD_MACHINE_HEADERS)
    : Array.from(base.softHardCycle || []);
  const hardCycle = adminRotationFilterMachineList(raw.hardCycle, HARD_MACHINE_HEADERS).length
    ? adminRotationFilterMachineList(raw.hardCycle, HARD_MACHINE_HEADERS)
    : Array.from(base.hardCycle || []);
  const softHardBlockLength = Math.max(1, Math.min(12, Number(raw.softHardBlockLength || base.softHardBlockLength || 3) || 3));
  const softBaseLathe = Object.assign({}, base.softBaseLathe || {}, adminRotationNormalizeSoftBaseLathe(raw.softBaseLathe || {}, softCore));
  const avoidLatheWhenTwoLathesOneMillEnabled = adminRotationGeneratorBooleanValue(raw.avoidLatheWhenTwoLathesOneMillEnabled, base.avoidLatheWhenTwoLathesOneMillEnabled !== false);
  const avoidLatheWhenTwoLathesOneMillNames = adminRotationSplitGeneratorList(raw.avoidLatheWhenTwoLathesOneMillNames).length
    ? adminRotationSplitGeneratorList(raw.avoidLatheWhenTwoLathesOneMillNames)
    : Array.from(base.avoidLatheWhenTwoLathesOneMillNames || ['Starý']);
  const soloMillBalanceEnabled = adminRotationGeneratorBooleanValue(raw.soloMillBalanceEnabled, base.soloMillBalanceEnabled !== false);
  const soloMillMaxSpread = Math.max(0, Math.min(6, Number(raw.soloMillMaxSpread ?? base.soloMillMaxSpread ?? 1) || 1));
  const softTotalBalanceEnabled = adminRotationGeneratorBooleanValue(raw.softTotalBalanceEnabled, base.softTotalBalanceEnabled !== false);
  const softTotalBalanceNames = adminRotationSplitGeneratorList(raw.softTotalBalanceNames).length
    ? adminRotationSplitGeneratorList(raw.softTotalBalanceNames)
    : Array.from(base.softTotalBalanceNames || ['Blažek', 'Starý', 'Kříž', 'Pech']);
  const softTotalMaxSpread = Math.max(0, Math.min(6, Number(raw.softTotalMaxSpread ?? base.softTotalMaxSpread ?? 1) || 1));
  const hardPeopleSoftKindBalanceEnabled = adminRotationGeneratorBooleanValue(raw.hardPeopleSoftKindBalanceEnabled, base.hardPeopleSoftKindBalanceEnabled !== false);
  const hardPeopleSoftKindBalanceNames = adminRotationSplitGeneratorList(raw.hardPeopleSoftKindBalanceNames).length
    ? adminRotationSplitGeneratorList(raw.hardPeopleSoftKindBalanceNames)
    : Array.from(base.hardPeopleSoftKindBalanceNames || base.hardPreferred || []);
  const hardPeopleSoftKindMaxSpread = Math.max(0, Math.min(6, Number(raw.hardPeopleSoftKindMaxSpread ?? base.hardPeopleSoftKindMaxSpread ?? 1) || 1));
  const softKindGlobalBalanceEnabled = adminRotationGeneratorBooleanValue(raw.softKindGlobalBalanceEnabled, base.softKindGlobalBalanceEnabled !== false);
  const softKindMixedMinimumShifts = Math.max(1, Math.min(12, Number(raw.softKindMixedMinimumShifts ?? base.softKindMixedMinimumShifts ?? 3) || 3));
  return {
    type: ADMIN_ROTATION_GENERATOR_SETTINGS_CATEGORY,
    softPreferred,
    hardPreferred,
    softCore,
    softHardCycle,
    softHardBlockLength,
    softBaseLathe,
    hardCycle,
    avoidLatheWhenTwoLathesOneMillEnabled,
    avoidLatheWhenTwoLathesOneMillNames,
    soloMillBalanceEnabled,
    soloMillMaxSpread,
    softTotalBalanceEnabled,
    softTotalBalanceNames,
    softTotalMaxSpread,
    hardPeopleSoftKindBalanceEnabled,
    hardPeopleSoftKindBalanceNames,
    hardPeopleSoftKindMaxSpread,
    softKindGlobalBalanceEnabled,
    softKindMixedMinimumShifts
  };
}

function adminRotationHasGeneratorSettingsRow() {
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  return rows.some(adminIsRotationGeneratorSettingsRow);
}

function adminRotationRefreshGeneratorSettingsStatus(root) {
  const scope = root && root.querySelector ? root : document;
  const statusEl = scope.querySelector ? scope.querySelector('#adminGeneratorSettingsStatus') : document.getElementById('adminGeneratorSettingsStatus');
  if (!statusEl) return false;
  const html = buildAdminRotationGeneratorStatusHtml(readAdminRotationGeneratorDraftFromDom(scope));
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const fresh = wrapper.firstElementChild;
  if (!fresh) return false;
  statusEl.replaceWith(fresh);
  return true;
}

function adminRotationRefreshOvertimeYearSummaries(root) {
  const scope = root || document.getElementById('appMenuBody') || document;
  const teams = ['A', 'B', 'C', 'D'];
  scope.querySelectorAll('[data-rotation-overtime-year-body]').forEach((body) => {
    const year = String(body.getAttribute('data-rotation-overtime-year-body') || '').trim();
    const counts = adminRotationOvertimeBuildEmptyShiftCounts();
    let total = 0;
    body.querySelectorAll('tr[data-rotation-overtime-row]').forEach((row) => {
      const fallbackYear = String(row.getAttribute('data-overtime-year') || year || '').trim();
      const dateInput = row.querySelector('[data-rotation-overtime-date]');
      const iso = adminRotationOvertimeCzechDateToIso(dateInput ? dateInput.value : '', fallbackYear);
      if (!isValidRotationOvertimeIsoDate(iso)) return;
      const info = adminRotationOvertimeGetShiftInfoForIsoDate(iso);
      const team = info && info.team ? String(info.team).trim().toUpperCase() : '';
      if (!Object.prototype.hasOwnProperty.call(counts, team)) return;
      counts[team] += 1;
      total += 1;
    });
    const summary = scope.querySelector('[data-rotation-overtime-year-summary="' + year + '"]');
    if (summary) {
      const totalEl = summary.querySelector('[data-overtime-year-total]');
      if (totalEl) totalEl.textContent = String(total) + '× celkem';
      teams.forEach((team) => {
        const chip = summary.querySelector('[data-overtime-shift-count="' + team + '"]');
        if (chip) chip.innerHTML = escapeHtml(team) + ' <b>' + String(counts[team] || 0) + '×</b>';
      });
    }
    const totalLabel = scope.querySelector('[data-rotation-overtime-year-total-label="' + year + '"]');
    if (totalLabel) totalLabel.textContent = String(total) + '×';
  });
  adminRotationRefreshOvertimeStatus(scope);
}

function adminRotationRefreshOvertimeStatus(root) {
  const scope = root || document.getElementById('appMenuBody') || document;
  const box = scope.querySelector ? scope.querySelector('#adminRotationOvertimeStatus') : null;
  if (!box) return;
  const wasOpen = !!(box.hasAttribute && box.hasAttribute('open'));
  const wrap = document.createElement('div');
  wrap.innerHTML = buildAdminRotationOvertimeStatusHtml(adminRotationOvertimeReadEntriesFromRoot(scope));
  const next = wrap.firstElementChild;
  if (next) {
    if (wasOpen && next.setAttribute) next.setAttribute('open', '');
    box.replaceWith(next);
  }
}

function adminRotationRefreshOvertimeShiftBadges(root, applyFilter) {
  const scope = root || document.getElementById('appMenuBody') || document;
  const selectedFilter = adminRotationOvertimeGetSelectedShiftFilter();
  scope.querySelectorAll('tr[data-rotation-overtime-row]').forEach((row) => {
    const fallbackYear = String(row.getAttribute('data-overtime-year') || '').trim();
    const dateInput = row.querySelector('[data-rotation-overtime-date]');
    const iso = adminRotationOvertimeCzechDateToIso(dateInput ? dateInput.value : '', fallbackYear);
    const info = adminRotationOvertimeGetShiftInfoForIsoDate(iso);
    const team = info && info.team ? info.team : '';
    row.setAttribute('data-overtime-shift', team);
    const badge = row.querySelector('[data-rotation-overtime-shift-label]');
    if (badge) {
      badge.textContent = team ? ('Směna ' + team) : '—';
      badge.setAttribute('title', team ? ('Automaticky dopočítáno z data přesčasu: Směna ' + team) : 'Směna se dopočítá po zadání platného data.');
    }
    if (applyFilter !== false) {
      const shouldHide = !!(iso && selectedFilter !== 'ALL' && team && team !== selectedFilter);
      row.classList.toggle('adminRotationOvertimeHiddenByFilter', shouldHide);
    }
  });
  adminRotationRefreshOvertimeYearSummaries(scope);
}

function adminRotationAddOvertimeRow(year) {
  const safeYear = String(year || new Date().getFullYear()).trim();
  const body = document.querySelector('#appMenuBody [data-rotation-overtime-year-body="' + safeYear.replace(/"/g, '') + '"]');
  if (!body) return;
  body.insertAdjacentHTML('beforeend', buildAdminRotationOvertimeRowHtml({ date: '', to: true, note: '' }, body.querySelectorAll('tr').length, safeYear));
  const status = document.getElementById('adminOnlineSaveStatus');
  if (status) status.textContent = 'Přidaný prázdný řádek. Přesčasy se uloží až tlačítkem Uložit přesčasy.';
}

function adminRotationClearOvertimeRow(target) {
  const row = target && typeof target.closest === 'function' ? target.closest('tr[data-rotation-overtime-row]') : null;
  if (!row) return;
  const date = row.querySelector('[data-rotation-overtime-date]');
  const to = row.querySelector('[data-rotation-overtime-to]');
  const note = row.querySelector('[data-rotation-overtime-note]');
  if (date) date.value = '';
  if (to) to.checked = true;
  if (note) note.value = '';
  try { adminRotationRefreshOvertimeShiftBadges(document.getElementById('appMenuBody'), true); } catch (err) {}
  const status = document.getElementById('adminOnlineSaveStatus');
  if (status) status.textContent = 'Řádek je vyčištěný. Změna se uloží až tlačítkem Uložit přesčasy.';
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
  const ruleCheck = adminRotationValidateMonthRules(normalized, monthKey, { source: 'save' });
  if (!ruleCheck.ok) {
    throw new Error('Rozpis nejde uložit: ' + adminRotationFormatRuleIssues(ruleCheck.issues.filter((issue) => issue.severity === 'error')));
  }
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
  return { normalized, saveResult, ruleCheck };
}

function adminRotationRowTemplate(section, row, rowIndex, machineCount, allowBlankTail) {
  const cells = Array.from({ length: machineCount }, (_, i) => String(row && row.cells && row.cells[i] ? row.cells[i] : ''));
  const date = String(row && row.date ? row.date : '').trim();
  const hasAny = !!(date || cells.some(Boolean) || (row && row.shift) || (row && row.person) || (row && row.code) || (row && row.text));
  if (!hasAny && !allowBlankTail) return '';
  return [
    '<tr data-rotation-section="' + escapeHtml(section) + '" data-rotation-row-index="' + String(rowIndex) + '">',
    '  <td>' + renderAdminInlineFieldHtml('data-rot-field', 'date', date, 'datum', false) + '</td>',
    cells.map((value, idx) => {
      const filled = String(value || '').trim();
      let mod = null;
      try { if (typeof rakDayModForAdminCell === 'function') mod = rakDayModForAdminCell(section, date, idx); } catch (e) { mod = null; }
      const tdClasses = [];
      if (!filled) tdClasses.push('adminRotationEditorEmptyCell');
      if (mod) tdClasses.push('rakDayModCell');
      const badge = mod && typeof rakDayModBadge === 'function' ? rakDayModBadge(mod) : '';
      const tip = mod && typeof rakDayModTooltip === 'function' ? rakDayModTooltip(mod) : '';
      const mark = badge ? '<span class="rakDayModMark" aria-hidden="true">' + escapeHtml(badge) + '</span>' : '';
      return '<td class="' + tdClasses.join(' ') + '"' + (tip ? ' title="' + escapeHtml(tip) + '"' : '') + '>' + renderAdminInlineFieldHtml('data-rot-field', 'cell-' + String(idx), value, String(idx + 1), true) + mark + '</td>';
    }).join(''),
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

function adminRotationFindShiftForAbsenceDate(month, rawDate) {
  const parsed = typeof parseDateToken === 'function' ? parseDateToken(rawDate) : null;
  const explicitShift = String((parsed && parsed.shift) || '').trim();
  if (explicitShift) return explicitShift;
  const wanted = adminRotationDateBaseKey(rawDate);
  if (!wanted) return '';
  const shifts = [];
  ['hard', 'soft'].forEach((section) => {
    const rows = Array.isArray(month && month[section] && month[section].rows) ? month[section].rows : [];
    rows.forEach((row) => {
      if (adminRotationDateBaseKey(row && row.date) !== wanted) return;
      const shift = String(adminRotationShiftFromRow(row) || '').trim();
      if (shift && !shifts.includes(shift)) shifts.push(shift);
    });
  });
  if (!shifts.length) return '';
  shifts.sort((a, b) => {
    const order = (value) => String(value || '').toUpperCase().startsWith('R') ? 1 : (String(value || '').toUpperCase().startsWith('N') ? 2 : 9);
    return order(a) - order(b) || String(a).localeCompare(String(b), 'cs');
  });
  return shifts[0] || '';
}

function adminRotationSortNotes(notesRows, month) {
  const rows = Array.isArray(notesRows) ? notesRows.slice() : [];
  const dateMeta = (note) => {
    const parsed = typeof parseDateToken === 'function' ? parseDateToken(note && note.date) : null;
    const day = parsed && Number.isFinite(Number(parsed.day)) ? Number(parsed.day) : 999;
    const monthNo = parsed && Number.isFinite(Number(parsed.month)) ? Number(parsed.month) : 999;
    const shift = String((note && note.shift) || (parsed && parsed.shift) || adminRotationFindShiftForAbsenceDate(month, note && note.date) || '').trim();
    const shiftOrder = shift.toUpperCase().startsWith('R') ? 1 : (shift.toUpperCase().startsWith('N') ? 2 : 9);
    return { day, month: monthNo, shiftOrder, shift };
  };
  return rows.sort((a, b) => {
    const am = dateMeta(a);
    const bm = dateMeta(b);
    return (am.month - bm.month)
      || (am.day - bm.day)
      || (am.shiftOrder - bm.shiftOrder)
      || String(a && a.person || '').localeCompare(String(b && b.person || ''), 'cs')
      || String(a && a.code || '').localeCompare(String(b && b.code || ''), 'cs');
  });
}

function adminRotationCopyAbsenceReasonLabel(code, label) {
  const rawCode = String(code || '').trim();
  const rawLabel = String(label || '').trim();
  const upper = rawCode.toLocaleUpperCase('cs-CZ');
  const suffix = rawCode.replace(/^(?:D|NV|L|N|S|Š|§)\b\s*/i, '').trim();
  if (/^D\b/i.test(rawCode) || rawLabel.toLocaleLowerCase('cs-CZ') === 'dovolená') return 'dovolená' + (suffix ? ' ' + suffix : '');
  if (/^NV\b/i.test(rawCode)) return 'náhradní volno' + (suffix ? ' ' + suffix : '');
  if (/^L\b/i.test(rawCode) || rawLabel.toLocaleLowerCase('cs-CZ') === 'lázně') return 'lázně' + (suffix ? ' ' + suffix : '');
  if (/^N\b/i.test(rawCode)) return 'nemoc' + (suffix ? ' ' + suffix : '');
  if (upper.indexOf('§') === 0 || rawLabel.toLocaleLowerCase('cs-CZ') === 'paragraf') return 'paragraf' + (suffix ? ' ' + suffix : '');
  if (upper.indexOf('Š') === 0 || rawLabel.toLocaleLowerCase('cs-CZ') === 'školení') return 'školení' + (suffix ? ' ' + suffix : '');
  return (rawLabel || rawCode || 'absence').toLocaleLowerCase('cs-CZ');
}

function adminRotationCopyAbsenceDateLabel(date) {
  const parsed = typeof parseDateToken === 'function' ? parseDateToken(String(date || '')) : null;
  if (parsed && Number.isFinite(Number(parsed.day)) && Number.isFinite(Number(parsed.month))) {
    return String(Number(parsed.day)) + '.' + String(Number(parsed.month)) + '.';
  }
  const base = adminRotationDateBaseKey(date);
  return base || String(date || '').trim();
}

function buildAdminRotationVacationCopyText(monthKey, monthSource) {
  const month = monthSource || (app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null);
  const notes = Array.isArray(month && month.notes) ? adminRotationSortNotes(month.notes, month) : [];
  const knownNames = adminGetKnownNames();
  const knownOrder = new Map(knownNames.map((name, idx) => [name, idx]));
  const groups = new Map();
  notes.forEach((note) => {
    const normalized = typeof normalizeNoteEntry === 'function' ? normalizeNoteEntry(note) : null;
    if (!normalized || !normalized.isAbsence) return;
    const people = Array.isArray(normalized.people) && normalized.people.length ? normalized.people : [normalized.person];
    const dateLabel = adminRotationCopyAbsenceDateLabel(normalized.date || (note && note.date) || '');
    if (!dateLabel) return;
    const reason = adminRotationCopyAbsenceReasonLabel(normalized.code || (note && note.code) || '', normalized.label || '');
    people.forEach((rawPerson) => {
      const person = adminRotationCanonicalName(rawPerson, knownNames);
      if (!person || !reason) return;
      const key = person + '\u0001' + reason;
      if (!groups.has(key)) groups.set(key, { person, reason, dates: [], seen: new Set() });
      const group = groups.get(key);
      const dateKey = adminRotationDateBaseKey(dateLabel) || dateLabel;
      if (group.seen.has(dateKey)) return;
      group.seen.add(dateKey);
      group.dates.push(dateLabel);
    });
  });
  const title = 'Dovolená ' + String(monthKey || '').trim();
  const rows = Array.from(groups.values()).sort((a, b) => {
    const ai = knownOrder.has(a.person) ? knownOrder.get(a.person) : 9999;
    const bi = knownOrder.has(b.person) ? knownOrder.get(b.person) : 9999;
    return (ai - bi)
      || String(a.person).localeCompare(String(b.person), 'cs')
      || String(a.reason).localeCompare(String(b.reason), 'cs');
  }).map((group) => {
    group.dates.sort((a, b) => {
      const ap = typeof parseDateToken === 'function' ? parseDateToken(a) : null;
      const bp = typeof parseDateToken === 'function' ? parseDateToken(b) : null;
      const av = ap ? Number(ap.month) * 100 + Number(ap.day) : 99999;
      const bv = bp ? Number(bp.month) * 100 + Number(bp.day) : 99999;
      return av - bv || String(a).localeCompare(String(b), 'cs');
    });
    return group.person + ' (' + group.reason + ') - ' + group.dates.join(', ');
  });
  return [title].concat(rows.length ? rows : ['Žádné dovolené.']).join('\n');
}

async function adminRotationCopyTextToClipboard(text) {
  const value = String(text || '');
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(value);
    return true;
  }
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', 'readonly');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    return document.execCommand && document.execCommand('copy');
  } finally {
    textarea.remove();
  }
}

async function copyAdminRotationVacationsToClipboard(monthKey) {
  const key = String(monthKey || getAdminSelectedMonthKey() || '').trim();
  if (!key) throw new Error('Nejdřív vyber měsíc.');
  const body = document.getElementById('appMenuBody');
  const month = body && body.querySelector('#adminRotationEditor') && typeof readAdminRotationFromDom === 'function'
    ? readAdminRotationFromDom(key)
    : (app.rotation && app.rotation.months ? app.rotation.months[key] : null);
  if (!month) throw new Error('Pro vybraný měsíc nejsou dostupná data.');
  const text = buildAdminRotationVacationCopyText(key, month);
  await adminRotationCopyTextToClipboard(text);
  return { ok: true, text, lineCount: text.split(/\r?\n/).length };
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

function adminRotationNameLookupKey(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('cs-CZ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function adminRotationCanonicalPeopleText(value, knownNames) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const names = adminSplitPeopleList(raw);
  if (!names.length) return adminRotationCanonicalName(raw, knownNames);
  return names.map((name) => adminRotationCanonicalName(name, knownNames)).filter(Boolean).join(', ');
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
  const consecutiveRivetingIssues = adminRotationValidateMonthRules(summary.month, monthKey, { source: 'month-check' }).issues
    .filter((issue) => issue && (issue.type === 'consecutive-tnks' || issue.type === 'boundary-consecutive-tnks'))
    .map((issue) => String(issue.message || '').trim())
    .filter(Boolean);
  const missingRows = summary.missingByDate.map((item) => ({
    label: String(item && item.label ? item.label : ''),
    missing: Array.isArray(item && item.missing) ? item.missing.join(', ') : ''
  }));
  const fingerprint = JSON.stringify({ monthKey: monthKey || '', freeOverall, missingRows, consecutiveRivetingIssues });

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
      appendStrongLine(
        'appMenuFreeNamesText ' + (consecutiveRivetingIssues.length ? 'isError' : 'isOk'),
        'Nýtování dva dny po sobě:',
        consecutiveRivetingIssues.length ? ' nalezen problém' : ' v pořádku'
      ),
      ...(consecutiveRivetingIssues.length
        ? consecutiveRivetingIssues.map((message) => makeEl('div', 'appMenuMonthCheckRow isError', message))
        : []),
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

function adminRotationPreSaveItemHtml(item) {
  const state = String(item && item.state || 'info').trim() || 'info';
  return [
    '<div class="adminRotationPreSaveItem is' + escapeHtml(state.charAt(0).toUpperCase() + state.slice(1)) + '">',
    '  <span>' + escapeHtml(item && item.title || '') + '</span>',
    '  <b>' + escapeHtml(item && item.value || '') + '</b>',
    item && item.detail ? '  <small>' + escapeHtml(item.detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function adminRotationBuildPreSaveStatus(monthKey, month) {
  const safeMonth = month || (app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null);
  const hardRows = Array.isArray(safeMonth && safeMonth.hard && safeMonth.hard.rows) ? safeMonth.hard.rows : [];
  const softRows = Array.isArray(safeMonth && safeMonth.soft && safeMonth.soft.rows) ? safeMonth.soft.rows : [];
  const notesRows = Array.isArray(safeMonth && safeMonth.notes) ? safeMonth.notes : [];
  const dateKeys = new Set();
  let filledCells = 0;
  let totalCells = 0;
  const countRows = (rows) => {
    rows.forEach((row) => {
      const date = adminRotationDateLabel(row && row.date ? row.date : '');
      const cells = Array.isArray(row && row.cells) ? row.cells : [];
      if (date) dateKeys.add(date);
      cells.forEach((cell) => {
        totalCells += 1;
        if (String(cell || '').trim()) filledCells += 1;
      });
    });
  };
  countRows(hardRows);
  countRows(softRows);
  const backupsSnapshot = app && app.adminRotationBackupsSnapshot && typeof app.adminRotationBackupsSnapshot === 'object' ? app.adminRotationBackupsSnapshot : null;
  const backups = backupsSnapshot && Array.isArray(backupsSnapshot.backups) ? backupsSnapshot.backups : [];
  const hasBackupsLoaded = !!(backupsSnapshot && backupsSnapshot.loading !== true && (backupsSnapshot.ok !== false || backups.length));
  const emptyCells = Math.max(0, totalCells - filledCells);
  const occupancy = totalCells ? Math.round((filledCells / totalCells) * 100) : 0;
  return {
    monthKey: String(monthKey || '').trim(),
    hasMonth: !!safeMonth,
    dayCount: dateKeys.size,
    hardRowCount: hardRows.length,
    softRowCount: softRows.length,
    notesCount: notesRows.length,
    filledCells,
    totalCells,
    emptyCells,
    occupancy,
    backupsCount: backups.length,
    hasBackupsLoaded
  };
}

function adminStatsWorkDayCounts(year) {
  if (typeof buildStatsForYear !== 'function') return [];
  const stats = buildStatsForYear(year);
  const names = Array.isArray(stats && stats.names) ? stats.names : [];
  return names.map((name) => {
    const person = stats.people[name];
    return { name, workDays: person && person.workDays ? person.workDays.size : 0 };
  });
}

function adminStatsAnomalyItemHtml(item) {
  const state = item && item.state === 'ok' ? 'isOk' : 'isWarn';
  return [
    '<div class="adminStatsAnomalyItem ' + state + '">',
    '  <span>' + escapeHtml(item && item.name || '') + '</span>',
    '  <b>' + escapeHtml(item && item.value || '') + '</b>',
    '  <small>' + escapeHtml(item && item.detail || '') + '</small>',
    '</div>'
  ].join('');
}

function buildAdminStatsAnomalyHtml(year) {
  const safeYear = Number(year) || new Date().getFullYear();
  const counts = adminStatsWorkDayCounts(safeYear);
  if (counts.length < 3) {
    return [
      '<div class="adminStatsAnomaly" id="adminStatsAnomaly">',
      '  <div class="appMenuSubTitle">Statistické odchylky ' + String(safeYear) + '</div>',
      '  <div class="smallText">Zatím málo dat pro porovnání (potřeba aspoň 3 lidé s odpracovanými směnami v tomhle roce).</div>',
      '</div>'
    ].join('');
  }
  const values = counts.map((c) => c.workDays).sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  const median = values.length % 2 ? values[mid] : Math.round((values[mid - 1] + values[mid]) / 2);
  const threshold = Math.max(5, Math.round(median * 0.25));
  const outliers = counts
    .filter((c) => Math.abs(c.workDays - median) > threshold)
    .sort((a, b) => Math.abs(b.workDays - median) - Math.abs(a.workDays - median));
  const items = outliers.length
    ? outliers.map((c) => {
        const diff = c.workDays - median;
        return adminStatsAnomalyItemHtml({
          name: c.name,
          value: String(c.workDays) + '× směn',
          detail: (diff > 0 ? ('o ' + String(diff) + ' víc') : ('o ' + String(-diff) + ' míň')) + ' než medián (' + String(median) + '×).'
        });
      }).join('')
    : adminStatsAnomalyItemHtml({ state: 'ok', name: 'Bez odchylek', value: 'OK', detail: 'Nikdo se výrazně neliší od mediánu ' + String(median) + '× směn.' });
  return [
    '<div class="adminStatsAnomaly" id="adminStatsAnomaly">',
    '  <div class="appMenuSubTitle">Statistické odchylky ' + String(safeYear) + '</div>',
    '  <div class="smallText uMb10">Porovnání počtu odpracovaných dní za rok proti mediánu (' + String(median) + '×). Odchylka nad ' + String(threshold) + ' dní je označená.</div>',
    '  <div class="adminStatsAnomalyGrid">' + items + '</div>',
    '</div>'
  ].join('');
}

function buildAdminRotationPreSaveChecklistHtml(monthKey) {
  return [
    '<details class="appMenuFoldSection adminRotationPreSaveCheck" id="adminRotationPreSaveCheck" data-pre-save-month="' + escapeHtml(monthKey || '') + '">',
    '  <summary class="appMenuSubTitle">Kontrola před uložením</summary>',
    '  <div class="smallText uMb10">Rychlý stav rozpisu. Přepočítá se i při úpravách v tabulce a nic sám neukládá.</div>',
    '  <div class="adminRotationPreSaveGrid">',
    adminRotationPreSaveItemHtml({ state: 'info', title: 'Měsíc', value: monthKey || '—', detail: 'Vybraný měsíc rozpisu.' }),
    adminRotationPreSaveItemHtml({ state: 'info', title: 'Stav', value: 'počítám', detail: 'Kontrola se dopočítá po vykreslení editoru.' }),
    '  </div>',
    '</details>'
  ].join('');
}

function adminRenderRotationPreSaveChecklist(root) {
  if (!root || root.dataset.adminView !== 'rotation') return;
  const box = root.querySelector('#adminRotationPreSaveCheck');
  if (!box) return;
  const monthSelect = root.querySelector('#adminMonthSelect');
  const monthKey = monthSelect ? String(monthSelect.value || '').trim() : getAdminSelectedMonthKey();
  let month = null;
  try {
    month = typeof readAdminRotationFromDom === 'function' && root.querySelector('#adminRotationEditor')
      ? readAdminRotationFromDom(monthKey)
      : (app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null);
  } catch (err) {
    month = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  }
  const status = adminRotationBuildPreSaveStatus(monthKey, month);
  const items = [
    {
      state: status.hasMonth ? 'ok' : 'warn',
      title: 'Měsíc',
      value: status.monthKey || 'nevybrán',
      detail: status.hasMonth ? 'Měsíc existuje v rozpisu.' : 'Pro tenhle měsíc zatím nejsou data.'
    },
    {
      state: status.dayCount ? 'ok' : 'warn',
      title: 'Dny',
      value: String(status.dayCount),
      detail: 'Tvrdota řádků: ' + String(status.hardRowCount) + ', měkota řádků: ' + String(status.softRowCount) + '.'
    },
    {
      state: status.emptyCells ? 'warn' : (status.totalCells ? 'ok' : 'info'),
      title: 'Obsazení',
      value: status.totalCells ? (String(status.occupancy) + ' %') : '—',
      detail: status.totalCells ? ('Vyplněno ' + String(status.filledCells) + '/' + String(status.totalCells) + ', prázdné ' + String(status.emptyCells) + '.') : 'Žádná políčka k ověření.'
    },
    {
      state: status.notesCount ? 'ok' : 'info',
      title: 'Absence',
      value: String(status.notesCount),
      detail: status.notesCount ? 'Zadané absence / výjimky jsou v měsíci.' : 'Bez ručně zadaných absencí.'
    },
    {
      state: status.backupsCount ? 'ok' : (status.hasBackupsLoaded ? 'info' : 'warn'),
      title: 'Zálohy',
      value: status.backupsCount ? (String(status.backupsCount) + ' načteno') : 'ověřit',
      detail: status.backupsCount ? 'Online zálohy jsou načtené.' : 'Před větší změnou otevři Zálohy rozpisů.'
    },
    {
      state: 'info',
      title: 'Uložení',
      value: 'ručně',
      detail: 'Online změna proběhne až tlačítkem Uložit rozpis.'
    }
  ];
  const fingerprint = JSON.stringify(status);
  const buildContent = () => {
    const title = document.createElement('summary');
    title.className = 'appMenuSubTitle';
    title.textContent = 'Kontrola před uložením';
    const detail = document.createElement('div');
    detail.className = 'smallText uMb10';
    detail.textContent = 'Rychlý stav rozpisu. Přepočítá se i při úpravách v tabulce a nic sám neukládá.';
    const grid = document.createElement('div');
    grid.className = 'adminRotationPreSaveGrid';
    grid.innerHTML = items.map(adminRotationPreSaveItemHtml).join('');
    return [title, detail, grid];
  };
  if (typeof setElementChildrenIfChanged === 'function') {
    setElementChildrenIfChanged(box, fingerprint, buildContent, 'adminRotationPreSaveCheck');
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
    adminRenderRotationPreSaveChecklist(root);
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

function buildAdminAbsenceSummaryHtml(month) {
  const groups = typeof getRotationMonthShiftAbsenceGroups === 'function'
    ? getRotationMonthShiftAbsenceGroups(month)
    : [];
  if (!groups.length) return '<div class="smallText">Bez poznámek.</div>';

  const maxPairs = Math.max(1, ...groups.map(group => Math.max(1, Array.isArray(group.items) ? group.items.length : 0)));
  let html = "<div class='smallText uMt12 uBold'>Absence podle dne</div>";
  html += "<div class='tableWrap'><table class='noteTable noteTableCompact'><thead><tr>";
  for (let i = 0; i < maxPairs; i += 1) {
    if (i > 0) html += "<th class='noteSpacer'></th>";
    if (i === 0) html += "<th class='noteDateCell'>Datum</th><th class='noteShiftCell'>Směna</th>";
    html += "<th class='notePersonCell'>Jméno</th><th class='noteReasonCell'>Důvod</th>";
  }
  html += "</tr></thead><tbody>";
  groups.forEach(group => {
    const items = group.items && group.items.length ? group.items.slice() : [];
    html += "<tr" + (!items.length ? " class='noteEmptyAbsenceDay'" : "") + ">";
    for (let i = 0; i < maxPairs; i += 1) {
      if (i > 0) html += "<td class='noteSpacer'></td>";
      const item = items[i];
      if (i === 0) {
        html += "<td class='noteDateCell'>" + escapeHtml(group.date || '—') + "</td><td class='noteShiftCell'>" + escapeHtml(group.shift || '') + "</td>";
      }
      if (item) {
        html += "<td class='notePersonCell'>" + escapeHtml(item.person || '') + "</td><td class='noteReasonCell'>" + escapeHtml(item.reason || '') + "</td>";
      } else {
        html += "<td class='emptyCell notePersonCell'>—</td><td class='emptyCell noteReasonCell'>—</td>";
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


function adminMachineIsEditableMachineRow(row) {
  const cat = String(row && row.category ? row.category : '').trim();
  const key = String(row && row.machine_key ? row.machine_key : '').trim();
  return cat !== 'brus'
    && cat !== 'fhb_target'
    && cat !== 'food_schedule'
    && !(typeof adminIsFoodScheduleRow === 'function' && adminIsFoodScheduleRow(row))
    && cat !== 'rotation_save_backup'
    && cat !== 'rotation_machine_tasks_settings'
    && cat !== 'fhb_correction_calibration_settings'
    && !(typeof isRotationSaveBackupRow === 'function' && isRotationSaveBackupRow(row))
    && cat !== 'admin_change_log'
    && !(typeof isRakChangeLogRow === 'function' && isRakChangeLogRow(row))
    && cat !== 'vacation_countdown_settings'
    && cat !== 'admin_accounts_settings'
    && cat !== 'admin_full_settings_backup'
    && cat !== 'admin_settings_deleted'
    && key !== 'ADMIN_ACCOUNTS_SETTINGS'
    && key.indexOf('ADMIN_FULL_SETTINGS_BACKUP_') !== 0
    && key !== 'VACATION_COUNTDOWN_SETTINGS'
    && key !== 'ROTATION_MACHINE_TASKS_SETTINGS'
    && key !== 'FHB_CORRECTION_CALIBRATION_SETTINGS'
    && cat !== ADMIN_ROTATION_OVERTIME_SETTINGS_CATEGORY
    && !(typeof rakAdminIsAccountsSettingsRow === 'function' && rakAdminIsAccountsSettingsRow(row))
    && !(typeof isRakExternalLinksSettingsRow === 'function' && isRakExternalLinksSettingsRow(row))
    && !(typeof isRakAppContactSettingsRow === 'function' && isRakAppContactSettingsRow(row))
    && !(typeof isRakPayrollSettingsRow === 'function' && isRakPayrollSettingsRow(row))
    && !(typeof isRakSpecialDaysSettingsRow === 'function' && isRakSpecialDaysSettingsRow(row))
    && !(typeof isRakWorkerRosterSettingsRow === 'function' && isRakWorkerRosterSettingsRow(row))
    && !(typeof isRakCalendarNotesSettingsRow === 'function' && isRakCalendarNotesSettingsRow(row))
    && !adminIsRotationGeneratorSettingsRow(row);
}

function adminMachineNormalizeNumberText(value) {
  return String(value ?? '').trim().replace(',', '.');
}

function adminMachineIsPositiveNumber(value) {
  const raw = adminMachineNormalizeNumberText(value);
  if (!raw) return false;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0;
}

function adminMachineIsFiniteNumber(value) {
  const raw = adminMachineNormalizeNumberText(value);
  if (!raw) return false;
  return Number.isFinite(Number(raw));
}

function adminMachineBuildInitialStatus(machineRows, brusRows, allRows) {
  const summary = { machines: 0, brus: 0, fhb: 0, incomplete: 0, duplicates: 0 };
  const seen = new Set();
  const addRow = (row, category) => {
    const machineCode = String(row && (row.machine_code || splitMachineKey(row.machine_key).machine) || '').trim();
    const machineIndex = String(row && (row.machine_index || splitMachineKey(row.machine_key).index) || '').trim();
    const cycleTime = row && (row.cycle_time ?? row.speed ?? (row.settings_json && row.settings_json.cycle_time));
    const dressTime = row && (row.dress_time ?? (row.settings_json && row.settings_json.dress_time));
    const dressCount = row && (row.dress_count ?? (row.settings_json && row.settings_json.dress_count));
    const key = String(row && row.machine_key || makeMachineKey(machineCode, machineIndex, category)).trim().toUpperCase();
    if (key) {
      if (seen.has(key)) summary.duplicates += 1;
      else seen.add(key);
    }
    if (category === 'brus') summary.brus += 1;
    else summary.machines += 1;
    if (!machineCode || !adminMachineIsPositiveNumber(cycleTime)) summary.incomplete += 1;
    if (category === 'brus' && (!machineIndex || !adminMachineIsPositiveNumber(dressTime) || !adminMachineIsPositiveNumber(dressCount))) summary.incomplete += 1;
  };
  (Array.isArray(machineRows) ? machineRows : []).forEach((row) => addRow(row, String(row && row.category || '').trim() || 'frezka'));
  (Array.isArray(brusRows) ? brusRows : []).forEach((row) => addRow(row, 'brus'));
  let fhbRows = (Array.isArray(allRows) ? allRows : []).filter((row) => String(row && row.category || '').trim() === 'fhb_target');
  if (!fhbRows.length && typeof getAdminFhbTargetRows === 'function') fhbRows = getAdminFhbTargetRows();
  fhbRows.forEach((row) => {
    const settings = row && row.settings_json && typeof row.settings_json === 'object' ? row.settings_json : {};
    const left = settings.target_left ?? row.left;
    const right = settings.target_right ?? row.right;
    summary.fhb += 1;
    if (!adminMachineIsFiniteNumber(left) || !adminMachineIsFiniteNumber(right)) summary.incomplete += 1;
  });
  return summary;
}

function adminMachineRefreshStatus() {}

function buildAdminMachineSettingsTableHtml() {
  const rows = Array.isArray(app.machineSettingsRows) ? app.machineSettingsRows : [];
  const machineRows = rows.filter(adminMachineIsEditableMachineRow);
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
    const head = '<tr><th>Den</th>' + safeMachines.map((m) => '<th>' + escapeHtml(String(m || '')) + '</th>').join('') + '</tr>';
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

  const pendingMonth = typeof adminRotationGeneratorGetPendingDraft === 'function'
    ? adminRotationGeneratorGetPendingDraft(monthKey)
    : null;
  const savedMonth = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const month = pendingMonth || savedMonth;
  const hasPendingDraft = !!pendingMonth;
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
    const sortedNotesRows = adminRotationSortNotes(notesRows, month);
    const withBlank = sortedNotesRows.concat([ { date: '', person: '', code: '' } ]);
    let html = withBlank.map((row, idx) => adminNotesRowTemplate(row, idx, true)).join('');
    try {
      if (typeof rakDayModAbsenceRows === 'function') {
        const derived = rakDayModAbsenceRows(month) || [];
        html += derived.map(r =>
          '<tr class="rakDayModAbsenceRow" title="Automaticky z výjimky dne v rozpisu">'
          + '<td>' + escapeHtml(r.date) + '</td>'
          + '<td>' + escapeHtml(r.person) + '</td>'
          + '<td>' + escapeHtml(r.code) + '</td>'
          + '</tr>'
        ).join('');
      }
    } catch (e) {}
    return html;
  };

  const hardColgroup = buildAdminRotationColgroupHtml(hardMachines.length, 46, 50);
  const softColgroup = buildAdminRotationColgroupHtml(softMachines.length, 46, 50);
  const absenceColgroup = buildAdminAbsenceColgroupHtml();

  return [
    '<div class="appMenuSubSection" id="adminRotationEditor">',
    '  <div class="appMenuSubTitle">Rozpis – ' + escapeHtml(monthKey) + (hasPendingDraft ? ' · vygenerovaný návrh' : '') + '</div>',
    '  <div class="appMenuText">' + (hasPendingDraft
      ? 'Je zobrazený nový vygenerovaný návrh. Online rozpis se nezmění, dokud nekliknete na Uložit rozpis.'
      : 'Stejný rozpis, jen editovatelný. Změny zůstávají rozepsané lokálně a do Supabase jdou až po kliknutí na Uložit rozpis.') + '</div>',
    '  <div class="adminRotationSaveDock">',
    '    <div class="adminRotationSaveActions">',
    '      <button type="button" class="appMenuAction adminRotationSelectedRemoveBtn" data-admin-selected-remove hidden>Odebrat vybrané</button>',
    '      <button type="button" class="appMenuAction rakOtOverviewBtn" data-daymod-overtime-overview>Přehled přesčasů</button>',
    '      <button type="button" class="appMenuAction" data-admin-action="copy-rotation-vacations">Kopírovat dovolené</button>',
    '    </div>',
    '    <span id="adminRotationDraftStatus" class="adminRotationDraftStatus">' + (hasPendingDraft
      ? 'Zobrazen je nový návrh. Uloží se až horním tlačítkem Uložit rozpis.'
      : 'Rozepsané změny se uloží horním tlačítkem Uložit rozpis.') + '</span>',
    '  </div>',
    buildAdminRotationPreSaveChecklistHtml(monthKey),
    buildAdminRotationCompactOverviewHtml(monthKey, hardRows, softRows, hardMachines, softMachines),
    '  <div class="appMenuFreeNamesBox" id="adminRotationFreeNamesSummary">',
    '    <div class="appMenuFreeNamesTitle">Kontrola měsíce</div>',
    '    <div class="appMenuFreeNamesText">Vyber měsíc a hned uvidíš, kdo v něm není zapsaný ani jednou a na kterých dnech ještě někdo chybí.</div>',
    '  </div>',
    buildAdminPressRotationOverridesHtml(month, monthKey, hardRows),
    '  <details class="appMenuFoldSection adminRotationFold" open>',
    '    <summary>Tvrdota <button type="button" class="rakDayModModeBtn" data-daymod-mode="hard">✎ Výjimky dne</button></summary>',
    '    <div class="tableWrap appMenuTableWrap">',
    '      <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense appMenuAdminRotationTable" data-daymod-section="hard">',
    '        ' + hardColgroup,
    '        <thead><tr><th>Datum</th>' + hardMachines.map(m => '<th>' + escapeHtml(m) + '</th>').join('') + '</tr></thead>',
    '        <tbody>' + renderRows('hard', hardRows, hardMachines.length) + '</tbody>',
    '      </table>',
    '    </div>',
    '  </details>',
    '  <details class="appMenuFoldSection adminRotationFold" open>',
    '    <summary>Měkota <button type="button" class="rakDayModModeBtn" data-daymod-mode="soft">✎ Výjimky dne</button></summary>',
    '    <div class="tableWrap appMenuTableWrap">',
    '      <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense appMenuAdminRotationTable" data-daymod-section="soft">',
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
    '    <div class="adminRotationAbsenceAddRow">',
    '      <button type="button" class="appMenuAction adminRotationAbsenceAddBtn" data-admin-action="add-absence-row">+ Přidat další absenci</button>',
    '    </div>',
    buildAdminAbsenceCodeDatalistHtml(),
    buildAdminAbsenceSummaryHtml(month),
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
    if (machine_code.toUpperCase() === 'FOOD' || machine_code.toUpperCase() === 'ROTBK') return;
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
  if (Array.isArray(app.machineSettingsRows)) {
    app.machineSettingsRows.filter(adminIsRotationOvertimeSettingsRow).forEach((row) => rows.push(row));
  }
  if (Array.isArray(app.machineSettingsRows) && typeof adminIsVacationCountdownSettingsRow === 'function') {
    app.machineSettingsRows.filter(adminIsVacationCountdownSettingsRow).forEach((row) => rows.push(row));
  }
  if (Array.isArray(app.machineSettingsRows) && typeof rakAdminIsAccountsSettingsRow === 'function') {
    app.machineSettingsRows.filter(rakAdminIsAccountsSettingsRow).forEach((row) => rows.push(row));
  }
  if (Array.isArray(app.machineSettingsRows)) {
    app.machineSettingsRows.filter(adminIsRotationGeneratorSettingsRow).forEach((row) => rows.push(row));
  }
  if (Array.isArray(app.machineSettingsRows)) {
    app.machineSettingsRows.filter((row) => {
      const settings = row && row.settings_json && typeof row.settings_json === 'object' ? row.settings_json : {};
      const key = String(row && row.machine_key || '');
      const category = String(row && row.category || settings.stored_category || '');
      return key === 'ROTATION_MACHINE_TASKS_SETTINGS'
        || key === 'FHB_CORRECTION_CALIBRATION_SETTINGS'
        || category === 'rotation_machine_tasks_settings'
        || category === 'fhb_correction_calibration_settings';
    }).forEach((row) => rows.push(row));
  }
  if (Array.isArray(app.machineSettingsRows) && typeof isRakExternalLinksSettingsRow === 'function') {
    app.machineSettingsRows.filter(isRakExternalLinksSettingsRow).forEach((row) => rows.push(row));
  }
  if (Array.isArray(app.machineSettingsRows) && typeof isRakAppContactSettingsRow === 'function') {
    app.machineSettingsRows.filter(isRakAppContactSettingsRow).forEach((row) => rows.push(row));
  }
  if (Array.isArray(app.machineSettingsRows) && typeof isRakPayrollSettingsRow === 'function') {
    app.machineSettingsRows.filter(isRakPayrollSettingsRow).forEach((row) => rows.push(row));
  }
  if (Array.isArray(app.machineSettingsRows) && typeof isRakSpecialDaysSettingsRow === 'function') {
    app.machineSettingsRows.filter(isRakSpecialDaysSettingsRow).forEach((row) => rows.push(row));
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
    const knownNames = adminGetKnownNames();
    root.querySelectorAll('tr[data-rotation-section="' + section + '"]').forEach((tr) => {
      const date = String(tr.querySelector('[data-rot-field="date"]')?.value || '').trim();
      const cells = Array.from({ length: machineCount }, (_, i) => adminRotationCanonicalName(tr.querySelector('[data-rot-field="cell-' + i + '"]')?.value || '', knownNames));
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
    const knownNames = adminGetKnownNames();
    const get = (field) => String(tr.querySelector('[data-note-field="' + field + '"]')?.value || '').trim();
    const date = get('date');
    const person = adminRotationCanonicalPeopleText(get('person'), knownNames);
    const code = get('code');
    const parsed = typeof parseDateToken === 'function' ? parseDateToken(date) : null;
    const shift = parsed && parsed.shift ? parsed.shift : adminRotationFindShiftForAbsenceDate(month, date);
    const text = [person, code].filter(Boolean).join(' ').trim();
    const note = { date, person, code, shift, text };
    if (!note.date && !note.person && !note.code && !note.shift && !note.text) return;
    const key = makeNoteRowKey(note);
    if (seenNotes.has(key)) return;
    seenNotes.add(key);
    notes.push(note);
  });
  month.notes = adminRotationSortNotes(notes, month);

  const pressRotationOverrides = {};
  root.querySelectorAll('[data-press-rotation-date]').forEach((select) => {
    const key = String(select.getAttribute('data-press-rotation-date') || '').trim();
    const value = String(select.value || '').trim().toLowerCase();
    if (!key || value === 'auto') return;
    if (value === 'split' || value === 'nosplit') pressRotationOverrides[key] = value;
  });
  if (Object.keys(pressRotationOverrides).length) month.pressRotationOverrides = pressRotationOverrides;
  else delete month.pressRotationOverrides;

  return normalizeMonthForImport(month, fallback);
}

async function saveAdminRotationFromDom(monthKey) {
  if (!monthKey) throw new Error('Chybí měsíc.');
  const previousRotationSnapshot = app.rotation ? JSON.parse(JSON.stringify(app.rotation)) : null;
  const fallback = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const normalized = readAdminRotationFromDom(monthKey);
  const ruleCheck = adminRotationValidateMonthRules(normalized, monthKey, { source: 'save' });
  if (!ruleCheck.ok) {
    throw new Error('Rozpis nejde uložit: ' + adminRotationFormatRuleIssues(ruleCheck.issues.filter((issue) => issue.severity === 'error')));
  }
  const candidateRotation = app.rotation ? JSON.parse(JSON.stringify(app.rotation)) : { months: {} };
  if (!candidateRotation.months) candidateRotation.months = {};
  candidateRotation.months[monthKey] = normalized;
  const normalizedRotation = normalizeRotationData(candidateRotation);
  let saveResult = null;
  if (app.adminUnlocked) {
    saveResult = await saveRotationToSupabase(normalizedRotation, { source: 'admin-menu', monthKey });
    if (saveResult && saveResult.ok !== false) {
      if (typeof createRotationSaveBackup === 'function') {
        try { await createRotationSaveBackup(previousRotationSnapshot, monthKey); } catch (err) {}
      }
      if (typeof rakAdminLogChange === 'function') {
        try { await rakAdminLogChange('Rozpis', 'Uložen měsíc ' + String(monthKey || '')); } catch (err) {}
      }
    }
  }
  if (!saveResult || saveResult.ok === false) {
    if (typeof app !== 'undefined' && app) app.adminRotationDirty = true;
    return { normalized, saveResult: saveResult || { ok: false, reason: 'admin-required' }, ruleCheck, preservedDraft: true };
  }
  app.rotation = normalizedRotation;
  app.selectedMonth = monthKey;
  app.adminRotationDirty = false;
  saveRotationData();
  renderRotace();
  if (typeof renderMonth === 'function') renderMonth(monthKey);
  if (app.selectedName && typeof renderPerson === 'function') renderPerson(app.selectedName);
  try {
    if (typeof adminRotationGeneratorClearPendingDraft === 'function') adminRotationGeneratorClearPendingDraft(monthKey);
  } catch (err) {}
  return { normalized, saveResult, ruleCheck };
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
  softHardBlockLength: 3,
  softCore: Object.freeze(['Synek', 'Třasák', 'Střížek']),
  softBaseLathe: Object.freeze({ Synek: 'MSKC04', 'Střížek': 'MSKC03', 'Třasák': 'MSKC01' }),
  avoidLatheWhenTwoLathesOneMillEnabled: true,
  avoidLatheWhenTwoLathesOneMillNames: Object.freeze(['Starý']),
  soloMillBalanceEnabled: true,
  soloMillMaxSpread: 1,
  softTotalBalanceEnabled: true,
  softTotalBalanceNames: Object.freeze(['Blažek', 'Starý', 'Kříž', 'Pech']),
  softTotalMaxSpread: 1,
  hardPeopleSoftKindBalanceEnabled: true,
  hardPeopleSoftKindBalanceNames: Object.freeze(['Blažek', 'Kmínek', 'Kříž', 'Pech', 'Starý']),
  hardPeopleSoftKindMaxSpread: 1,
  softKindGlobalBalanceEnabled: true,
  softKindMixedMinimumShifts: 3,
  machineCountSplitRule: 'Mimo běžnou neděli se TNKS01 a TPKW01 v kontrolním přehledu počítají jako 0,5 + 0,5 pro oba stroje.',
  softCoreNoTnksBalance: Object.freeze(['Synek', 'Třasák', 'Střížek']),
  softCoreContinuationRule: 'Synek/Třasák/Střížek drží vlastní návazný cyklus TNKS01 → TPKW01 → TPKW02 napříč měsíci; TNKS01 dorovnání jim do toho nesahá.',
  hardCycle: Object.freeze(['TBKR01', 'TNKS01', 'TBKR07', 'TPKW01', 'TPKW02']),
  softMachines: Object.freeze(['MSKC01', 'MSKC03', 'MSKC04', 'MFKF06', 'MFKF10']),
  absenceRules: Object.freeze([
    'Když je na frézkách jen jeden člověk, píše se MFKF06 jako neobsazená, i když reálně hlídá obě frézky.',
    'Při jedné absenci zůstává MFKF06 neobsazená a člověk na MFKF10 bere i MFKF06.',
    'Při dvou absencích je na frézkách jeden člověk, MFKF06 je neobsazená, na soustruhách jsou dva lidé a MSKC01 je neobsazená.'
  ]),
  fairness: Object.freeze(['měsíce na sebe navazují', 'tvrdota drží pořadí TNKS01/TBKR07/TPKW01/TPKW02/TBKR01', 'měkota chodí návazně po TNKS01/TPKW01/TPKW02 i mezi měsíci', 'Špadrna a Novotný spíš měkota, ale pomáhají vyrovnat tvrdotu', 'lidé z tvrdoty na měkotě mají mít rozumně střídané MSKC/MFKF', 'nýtování se dorovnává podle měsíce, ale Synek/Třasák/Střížek z dorovnání TNKS01 vypadávají'])
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
  if (match) return match;
  const folded = adminRotationNameLookupKey(raw);
  const foldedMatches = known.filter((item) => adminRotationNameLookupKey(item) === folded);
  return foldedMatches.length === 1 ? foldedMatches[0] : raw;
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

function adminRotationGetPressRotationOverride(month, dateLabel) {
  const baseKey = adminRotationDateBaseKey(dateLabel);
  if (typeof getRotationPressRotationOverride === 'function') return getRotationPressRotationOverride(month, baseKey);
  const value = month && month.pressRotationOverrides && baseKey ? String(month.pressRotationOverrides[baseKey] || '').trim().toLowerCase() : '';
  return value === 'split' || value === 'nosplit' ? value : '';
}

function buildAdminPressRotationOverridesHtml(month, monthKey, hardRows) {
  const rows = Array.isArray(hardRows) ? hardRows : [];
  if (!rows.length) return '';
  const seen = new Set();
  const options = [
    ['auto', 'Automaticky podle pravidel'],
    ['split', 'Rotuje / půlit 0,5 + 0,5'],
    ['nosplit', 'Nerotuje / každý +1']
  ];
  const body = rows.map((row) => {
    const date = String(row && row.date ? row.date : '').trim();
    const baseKey = adminRotationDateBaseKey(date);
    if (!date || !baseKey || seen.has(baseKey)) return '';
    seen.add(baseKey);
    const manual = adminRotationGetPressRotationOverride(month, date);
    const autoSplit = adminRotationGeneratorShouldSplitPressMachines(date, monthKey, Object.assign({}, month || {}, { pressRotationOverrides: {} }));
    const current = manual || 'auto';
    return [
      '<tr data-press-rotation-row data-date-base="' + escapeHtml(baseKey) + '">',
      '  <td>' + escapeHtml(adminRotationDateLabel(date) || date) + '</td>',
      '  <td><select class="appMenuSelect adminRotationPressSelect" data-press-rotation-date="' + escapeHtml(baseKey) + '">' + options.map(([value, label]) => '<option value="' + value + '" ' + (current === value ? 'selected' : '') + '>' + escapeHtml(label) + '</option>').join('') + '</select></td>',
      '  <td class="smallText">' + escapeHtml(autoSplit ? 'Auto: rotuje' : 'Auto: nerotuje') + '</td>',
      '</tr>'
    ].join('');
  }).filter(Boolean).join('');
  if (!body) return '';
  return [
    '<details class="appMenuFoldSection adminRotationFold">',
    '  <summary>TNKS01 / TPKW01 – rotace dne</summary>',
    '  <div class="appMenuText">Výchozí stav je podle pravidel. Když se konkrétní den neplánovaně nerotuje, nastav „Nerotuje / každý +1“. Tahle výjimka má přednost ve statistikách, kontrolní tabulce i exportech.</div>',
    '  <div class="tableWrap appMenuTableWrap">',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense">',
    '      <thead><tr><th>Den</th><th>Režim</th><th>Výchozí</th></tr></thead>',
    '      <tbody>' + body + '</tbody>',
    '    </table>',
    '  </div>',
    '</details>'
  ].join('');
}

// Obsazení poslední skutečné pracovní směny před cílovým měsícem.
// Tento okraj chrání proti stejnému nýtování nebo samostatným frézkám hned po přelomu.
function adminRotationValidateMonthRules(month, monthKey, options) {
  const opts = options || {};
  const knownNames = adminGetKnownNames();
  const issues = [];
  const hardRows = Array.isArray(month && month.hard && month.hard.rows) ? month.hard.rows : [];
  const softRows = Array.isArray(month && month.soft && month.soft.rows) ? month.soft.rows : [];
  const maxRows = Math.max(hardRows.length, softRows.length);
  const addIssue = (severity, type, message, detail) => {
    issues.push({ severity, type, message, detail: detail || '' });
  };
  const noteNamesForDate = (dateLabel) => {
    const out = [];
    (Array.isArray(month && month.notes) ? month.notes : []).forEach((note) => {
      if (adminRotationDateBaseKey(note && note.date) !== adminRotationDateBaseKey(dateLabel)) return;
      adminSplitPeopleList(note && note.person ? note.person : '').forEach((person) => {
        const canonical = adminRotationCanonicalName(person, knownNames);
        if (canonical) out.push({ raw: person, canonical });
      });
    });
    return out;
  };
  const generatorRules = getAdminRotationGeneratorRules();
  const softCoreHardNames = (Array.isArray(generatorRules.softCore) ? generatorRules.softCore : [])
    .map((name) => adminRotationCanonicalName(name, knownNames))
    .filter((name) => name && knownNames.includes(name));
  const softCoreHardMachines = new Set((Array.isArray(generatorRules.softHardCycle) ? generatorRules.softHardCycle : [])
    .map((machine) => String(machine || '').trim().toUpperCase())
    .filter(Boolean));

  for (let rowIdx = 0; rowIdx < maxRows; rowIdx += 1) {
    const hardRow = hardRows[rowIdx] || null;
    const softRow = softRows[rowIdx] || null;
    const dateLabel = (hardRow && hardRow.date) || (softRow && softRow.date) || '';
    if (!dateLabel) continue;
    const assigned = new Map();
    const register = (sectionKey, machineName, rawName) => {
      const name = adminRotationCanonicalName(rawName, knownNames);
      if (!name) return;
      if (!knownNames.includes(name)) {
        const near = knownNames.find((known) => adminRotationNameLookupKey(known) === adminRotationNameLookupKey(rawName));
        addIssue('warn', 'unknown-name', String(dateLabel) + ': neznámé jméno ' + String(rawName || name) + (near ? ', myslel jsi ' + near + '?' : ''), '');
        return;
      }
      if (!assigned.has(name)) assigned.set(name, []);
      assigned.get(name).push({ sectionKey, machineName });
      if (!adminRotationGeneratorPersonKnowsMachine(name, machineName)) {
        addIssue('error', 'skill', String(dateLabel) + ': ' + name + ' neumí ' + machineName + '.', '');
      }
      if (sectionKey === 'hard' && softCoreHardNames.includes(name) && softCoreHardMachines.size && !softCoreHardMachines.has(String(machineName || '').trim().toUpperCase())) {
        addIssue(opts.source === 'generator' ? 'error' : 'warn', 'soft-core-hard-machine', String(dateLabel) + ': ' + name + ' má být z trojice jen na TNKS01/TPKW01/TPKW02, ne na ' + machineName + '.', '');
      }
    };
    (Array.isArray(hardRow && hardRow.cells) ? hardRow.cells : []).forEach((cell, idx) => register('hard', HARD_MACHINE_HEADERS[idx] || '', cell));
    (Array.isArray(softRow && softRow.cells) ? softRow.cells : []).forEach((cell, idx) => register('soft', SOFT_MACHINE_HEADERS[idx] || '', cell));
    assigned.forEach((places, name) => {
      if (places.length > 1) {
        addIssue('error', 'duplicate-day', String(dateLabel) + ': ' + name + ' je ve stejný den víckrát.', places.map((place) => place.machineName).join(', '));
      }
    });
    noteNamesForDate(dateLabel).forEach((noteName) => {
      if (!knownNames.includes(noteName.canonical)) {
        addIssue('warn', 'unknown-absence-name', String(dateLabel) + ': absence má neznámé jméno ' + noteName.raw + '.', '');
      }
      if (assigned.has(noteName.canonical)) {
        addIssue('error', 'absence-conflict', String(dateLabel) + ': ' + noteName.canonical + ' má absenci a zároveň je v rozpisu.', '');
      }
    });
    if (!adminRotationGeneratorIsDayBlocked(adminRotationGeneratorDateNotes(month, dateLabel))) {
      const absent = new Set(noteNamesForDate(dateLabel).map((noteName) => noteName.canonical).filter((name) => knownNames.includes(name)));
      const unused = knownNames.filter((name) => !absent.has(name) && !assigned.has(name));
      if (unused.length) {
        addIssue(opts.source === 'generator' ? 'error' : 'warn', 'available-unused', String(dateLabel) + ': dostupný člověk není v rozpisu: ' + unused.join(', ') + '.', '');
      }
    }
  }

  const firstWorkingRowIdx = Array.from({ length: maxRows }, (_, idx) => idx).find((idx) => adminRotationGeneratorIsFirstWorkingRow(month, idx));
  const boundary = adminRotationGeneratorGetPreviousMonthBoundary(monthKey, knownNames);
  if (Number.isFinite(firstWorkingRowIdx) && boundary.monthKey) {
    const currentPress = adminRotationGeneratorPressCellsForRow(month, firstWorkingRowIdx, knownNames, monthKey);
    currentPress.forEach((cell) => {
      if (!(boundary.pressNames || []).includes(cell.name)) return;
      addIssue('error', 'boundary-consecutive-tnks', String(boundary.dateLabel) + ' → ' + String(cell.row && cell.row.date || '') + ': ' + cell.name + ' nesmí nýtovat dvě směny po sobě ani přes přelom měsíce.', 'Předchozí měsíc: ' + boundary.monthKey);
    });

    const softRow = softRows[firstWorkingRowIdx] || null;
    const softCells = Array.isArray(softRow && softRow.cells) ? softRow.cells : [];
    const mfkf06Idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MFKF06');
    const mfkf10Idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MFKF10');
    const mfkf06 = adminRotationCanonicalName(softCells[mfkf06Idx], knownNames);
    const mfkf10 = adminRotationCanonicalName(softCells[mfkf10Idx], knownNames);
    if (!mfkf06 && mfkf10 && boundary.soloMillName === mfkf10) {
      addIssue('error', 'boundary-consecutive-solo-mill', String(boundary.dateLabel) + ' → ' + String(softRow && softRow.date || '') + ': ' + mfkf10 + ' nesmí být sám na frézkách dvě směny po sobě ani přes přelom měsíce.', 'Předchozí měsíc: ' + boundary.monthKey);
    }
  }

  adminRotationGeneratorFindConsecutiveTnksIssues(month, monthKey, knownNames).forEach((issue) => {
    const prevDate = hardRows[issue.previousRowIdx] && hardRows[issue.previousRowIdx].date ? hardRows[issue.previousRowIdx].date : '';
    const currentDate = hardRows[issue.rowIdx] && hardRows[issue.rowIdx].date ? hardRows[issue.rowIdx].date : '';
    addIssue('error', 'consecutive-tnks', String(prevDate) + ' -> ' + String(currentDate) + ': ' + issue.current.name + ' je na TNKS01/TPKW01 dvě směny po sobě.', '');
  });

  adminRotationGeneratorFindSoftCoreSequenceIssues(month, monthKey, knownNames).forEach((issue) => {
    const message = issue.type === 'duplicate-in-block'
      ? String(issue.date) + ': ' + issue.name + ' je ve stejném bloku trojice na ' + issue.machine + ' podruhé dřív, než se vystřídali všichni tři.'
      : issue.type === 'new-block-on-skipped-day'
        ? String(issue.date) + ': po přeskočení chybějícího člověka smí nový blok na ' + issue.expectedMachine + ' začít až následující pracovní den.'
        : String(issue.date) + ': trojice má pokračovat na ' + issue.expectedMachine + ', ale ' + issue.name + ' je už na ' + issue.machine + '.';
    addIssue(opts.source === 'generator' ? 'error' : 'warn', 'soft-core-sequence', message, 'Cyklus trojice má přednost před měsíčním dorovnáním TNKS01.');
  });

  const softCorePressNames = new Set(adminRotationGeneratorGetSoftCoreNames(knownNames));
  const eligiblePressNames = knownNames.filter((name) => !softCorePressNames.has(name))
    .filter((name) => adminRotationGeneratorPersonKnowsMachine(name, 'TNKS01'))
    .filter((name) => {
      for (let rowIdx = 0; rowIdx < maxRows; rowIdx += 1) {
        const row = hardRows[rowIdx] || softRows[rowIdx] || null;
        const dateLabel = row && row.date ? row.date : '';
        if (!dateLabel) continue;
        const dayNotes = adminRotationGeneratorDateNotes(month, dateLabel);
        if (adminRotationGeneratorIsDayBlocked(dayNotes)) continue;
        const absences = adminRotationNamesForAbsenceDate(month.notes, dateLabel, knownNames);
        if (!absences.has(name)) return true;
      }
      return false;
    });
  if (eligiblePressNames.length > 1) {
    const pressCounts = adminRotationGeneratorCountHardMachine(month, 'TNKS01', eligiblePressNames, monthKey);
    const values = eligiblePressNames.map((name) => Number(pressCounts[name] || 0));
    const max = Math.max(...values);
    const min = Math.min(...values);
    if (max - min > 1.001) {
      const high = eligiblePressNames.filter((name) => Math.abs(Number(pressCounts[name] || 0) - max) < 0.001).join(', ');
      const low = eligiblePressNames.filter((name) => Math.abs(Number(pressCounts[name] || 0) - min) < 0.001).join(', ');
      addIssue(opts.source === 'generator' ? 'error' : 'warn', 'monthly-tnks-balance', 'TNKS01/TPKW01 není měsíčně vyrovnaná: rozdíl je ' + String((Math.round((max - min) * 10) / 10)).replace('.', ',') + '.', 'Nejvíc: ' + high + '; nejmíň: ' + low);
    }
  }

  const softCore = (Array.isArray(generatorRules.softCore) ? generatorRules.softCore : []).map((name) => adminRotationCanonicalName(name, knownNames)).filter((name) => knownNames.includes(name));
  if (softCore.length) {
    const hardCount = Object.create(null);
    softCore.forEach((name) => { hardCount[name] = 0; });
    hardRows.forEach((row) => {
      (Array.isArray(row && row.cells) ? row.cells : []).forEach((cell) => {
        const name = adminRotationCanonicalName(cell, knownNames);
        if (Object.prototype.hasOwnProperty.call(hardCount, name)) hardCount[name] += 1;
      });
    });
    softCore.forEach((name) => {
      if (hardCount[name] <= 0) {
        addIssue('warn', 'soft-core-hard-missing', name + ' není v tomto měsíci ani jednou na tvrdotě.', '');
      }
    });
  }

  const balanceRules = getAdminRotationGeneratorRules();
  const workingNames = adminRotationGeneratorCollectWorkingNames(month, knownNames).filter((name) => knownNames.includes(name));
  if (balanceRules.soloMillBalanceEnabled !== false && workingNames.length > 1) {
    const soloCounts = adminRotationGeneratorCountSoloMill(month, workingNames);
    const values = workingNames.map((name) => Number(soloCounts[name] || 0));
    const spread = Math.max(...values) - Math.min(...values);
    const allowed = Math.max(0, Number(balanceRules.soloMillMaxSpread ?? 1) || 1);
    if (spread > allowed) addIssue('warn', 'solo-mill-balance', 'Samostatné frézky nejdou bezpečně dorovnat na výchozí rozdíl ' + String(allowed) + '.', 'Aktuální rozdíl: ' + String(spread) + '.');
  }

  if (balanceRules.softTotalBalanceEnabled !== false) {
    const targetNames = adminRotationGeneratorRawList(balanceRules.softTotalBalanceNames)
      .map((name) => adminRotationCanonicalName(name, knownNames))
      .filter((name) => name && workingNames.includes(name) && !adminRotationGeneratorIsSoftCoreName(name, knownNames));
    if (targetNames.length > 1) {
      const totals = adminRotationGeneratorCountSoftTotals(month, targetNames);
      const values = targetNames.map((name) => Number(totals[name] || 0));
      const spread = Math.max(...values) - Math.min(...values);
      const allowed = Math.max(0, Number(balanceRules.softTotalMaxSpread ?? 1) || 1);
      if (spread > allowed) addIssue('warn', 'soft-total-balance', 'Měkota vybrané skupiny nejde bezpečně dorovnat na výchozí rozdíl ' + String(allowed) + '.', 'Aktuální rozdíl: ' + String(spread) + '.');
    }
  }

  if (balanceRules.hardPeopleSoftKindBalanceEnabled !== false) {
    const configured = adminRotationGeneratorRawList(balanceRules.hardPeopleSoftKindBalanceNames)
      .map((name) => adminRotationCanonicalName(name, knownNames))
      .filter((name) => name && workingNames.includes(name));
    const targetNames = balanceRules.softKindGlobalBalanceEnabled === false ? configured : workingNames;
    const kindCounts = adminRotationGeneratorCountSoftKinds(month, targetNames);
    const allowed = Math.max(0, Number(balanceRules.hardPeopleSoftKindMaxSpread ?? 1) || 1);
    const minimum = Math.max(1, Number(balanceRules.softKindMixedMinimumShifts ?? 3) || 3);
    targetNames.forEach((name) => {
      const mill = Number(kindCounts[name] && kindCounts[name].mill || 0);
      const lathe = Number(kindCounts[name] && kindCounts[name].lathe || 0);
      if (mill + lathe >= minimum && (!mill || !lathe || Math.abs(mill - lathe) > allowed)) {
        addIssue('warn', 'soft-kind-balance', name + ' nemá na měkotě vyrovnané soustruhy a frézky.', 'Soustruhy: ' + String(lathe) + '; frézky: ' + String(mill) + '.');
      }
    });
  }

  const kminek = adminRotationCanonicalName('Kmínek', knownNames);
  const novotny = adminRotationCanonicalName('Novotný', knownNames);
  if (kminek && novotny && workingNames.includes(kminek) && workingNames.includes(novotny)) {
    const totals = adminRotationGeneratorCountSectionTotals(month, [kminek, novotny]);
    const score = adminRotationGeneratorMoToPairScore(totals, kminek, novotny);
    if (score > 1) addIssue('warn', 'kminek-novotny-mo-to', 'Kmínek a Novotný nemají podobný počet směn na MO a TO.', 'Rozdíl: ' + String(score) + '.');
  }

  return { ok: !issues.some((issue) => issue.severity === 'error'), issues };
}

function adminRotationFormatRuleIssues(issues) {
  const list = Array.isArray(issues) ? issues : [];
  if (!list.length) return '';
  return list.slice(0, 4).map((issue) => String(issue && issue.message || '')).filter(Boolean).join(' · ');
}


function adminGenerateRotationMonthDraft(monthKey, preparedMonth) {
  if (!monthKey) throw new Error('Chybí měsíc.');
  const domMonth = adminRotationGeneratorCanReadEditorDraftFromDom() ? readAdminRotationFromDom(monthKey) : null;
  const fallback = domMonth || preparedMonth || (app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null);
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
    const generated = adminRotationGeneratorBuildDay(month, model, counters, rowIdx, dateLabel, absenceNames, monthKey);
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
  const tnksBalance = adminRotationGeneratorBalanceHardMachine(month, 'TNKS01', model, monthKey);
  const soloMillBalance = adminRotationGeneratorBalanceSoloMill(month, model);
  const softTotalBalance = adminRotationGeneratorBalanceSoftTotals(month, model, monthKey);
  const softKindBalance = adminRotationGeneratorBalanceSoftKind(month, model);
  const soloMillRebalance = adminRotationGeneratorBalanceSoloMill(month, model);
  const kminekNovotnyMoToBalance = adminRotationGeneratorBalanceKminekNovotnyMoTo(month, model);
  const emptyHardRepair = adminRotationGeneratorRepairEmptyHardCells(month, model, monthKey);
  const tnksPostRepairBalance = emptyHardRepair && Number(emptyHardRepair.repairs || 0)
    ? adminRotationGeneratorBalanceHardMachine(month, 'TNKS01', model, monthKey)
    : { swaps: 0 };
  const tnksConsecutiveRepair = adminRotationGeneratorRepairConsecutiveTnks(month, model, monthKey);
  const finalSoftKindBalance = adminRotationGeneratorBalanceSoftKind(month, model);
  const finalTnksBalance = adminRotationGeneratorBalanceHardMachine(month, 'TNKS01', model, monthKey);
  const ruleCheck = adminRotationValidateMonthRules(month, monthKey, { source: 'generator' });
  const criticalIssues = ruleCheck.issues.filter((issue) => issue && issue.severity === 'error');
  if (criticalIssues.length) {
    throw new Error('Návrh porušuje pravidla: ' + criticalIssues.slice(0, 3).map((issue) => issue.message).join(' · '));
  }
  const normalized = normalizeMonthForImport(month, fallback);
  adminRotationGeneratorSetPendingDraft(monthKey, normalized);
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
    emptyHardCellRepairs: emptyHardRepair && Number(emptyHardRepair.repairs || 0),
    tnksBalanceSwaps: (tnksBalance && Number(tnksBalance.swaps || 0))
      + (tnksPostRepairBalance && Number(tnksPostRepairBalance.swaps || 0))
      + (finalTnksBalance && Number(finalTnksBalance.swaps || 0)),
    tnksConsecutiveRepairs: tnksConsecutiveRepair && Number(tnksConsecutiveRepair.repairs || 0),
    soloMillBalanceSwaps: (soloMillBalance && Number(soloMillBalance.swaps || 0)) + (soloMillRebalance && Number(soloMillRebalance.swaps || 0)),
    softTotalBalanceSwaps: softTotalBalance && Number(softTotalBalance.swaps || 0),
    softKindBalanceSwaps: (softKindBalance && Number(softKindBalance.swaps || 0)) + (finalSoftKindBalance && Number(finalSoftKindBalance.swaps || 0)),
    kminekNovotnyMoToBalanceSwaps: kminekNovotnyMoToBalance && Number(kminekNovotnyMoToBalance.swaps || 0),
    softCoreSkippedSlots: Array.isArray(counters.softCoreSkippedSlots) ? counters.softCoreSkippedSlots.length : 0,
    ruleWarnings: ruleCheck.issues.filter((issue) => issue && issue.severity === 'warn'),
    ruleVersion: '1.149'
  };
}

window.RAK_ROTATION_GENERATOR_CONTRACT_V1106 = RAK_ROTATION_GENERATOR_CONTRACT_V1106;
window.RAK_ROTATION_GENERATOR_RULES_V1107 = RAK_ROTATION_GENERATOR_RULES_V1107;
window.adminGenerateRotationMonthDraft = adminGenerateRotationMonthDraft;
window.adminRotationMonthHasFilledCells = adminRotationMonthHasFilledCells;
window.adminRotationValidateMonthRules = adminRotationValidateMonthRules;
window.adminRotationFormatRuleIssues = adminRotationFormatRuleIssues;


const RAK_ROTATION_GENERATOR_ABSENCE_STATE_CONTRACT_V1109 = Object.freeze({
  version: '1.109',
  rule: 'Při kliknutí na + Přidat jméno v kroku Absence se musí zachovat už vyplněná jména i kódy.',
  guard: 'adminRotationGeneratorCollectAbsencesFromDom používá state.days, když krok Absence nemá v DOMu day inputy, a nevyhazuje prázdné řádky během editace.'
});

const RAK_ROTATION_GENERATOR_WIZARD_RUN_CONTRACT_V1110 = Object.freeze({
  version: '1.110',
  rule: 'Vygenerovat rozpis z průvodce nesmí číst prázdný wizard DOM jako editor rozpisu.',
  guard: 'adminGenerateRotationMonthDraft smí číst readAdminRotationFromDom jen tehdy, když v DOMu existuje #adminRotationEditor s řádky rozpisu; jinak musí použít připravený měsíc z app.rotation.months.'
});

const RAK_ROTATION_GENERATOR_WIZARD_STATE_CONTRACT_V1111 = Object.freeze({
  version: '1.111',
  rule: 'Průvodce generátorem nesmí v kroku Návrh vygenerovat prázdný měsíc jen proto, že se stav dnů ztratil nebo byl předchozí pokus nulový.',
  guard: 'Dny se při generování řeší přes adminRotationGeneratorResolveWizardDays: nejdřív wizard state, potom aktuální rozpis, potom výchozí initialRotationData. Pokud nejsou žádné dny, generátor skončí chybou místo nulového návrhu.'
});

const RAK_ROTATION_GENERATOR_MONTH_BALANCE_CONTRACT_V1112 = Object.freeze({
  version: '1.112',
  rule: 'Výběr měsíce v generátoru musí být řazený podle roku/měsíce a TNKS01/nýtovačka se po vygenerování vyrovnává mezi lidmi v měsíci.',
  guard: 'Měsíce se renderují přes optgroup podle roku a po sestavení měsíce běží adminRotationGeneratorBalanceHardMachine, která může prohodit člověka na TNKS01 s člověkem z tvrdoty dočasně napsaným na měkotě.'
});

const RAK_ROTATION_GENERATOR_RULES_V1113 = Object.freeze({
  version: '1.113',
  scope: 'Administrace dat / Rozpisy / Vygenerovat návrh',
  machineCountRule: 'V kontrolní tabulce stroje × jména se TNKS01 a TPKW01 mimo běžnou neděli počítají jako 0,5 na oba stroje; běžná neděle ranní/noční zůstává celá směna na zapsaném stroji, přesčasová TO neděle se střídá a výjimka jen MO se nepůlí.',
  softCoreRule: 'Synek, Třasák a Střížek chodí z Měkoty na Tvrdotu jen na TNKS01/TPKW01/TPKW02 po blocích 3 pracovních dnů na stejný stroj. Když někdo chybí, pořadí se přeskupí tak, aby se tvrdotě nevyhnul.',
  softLatheBase: Object.freeze({ Synek: 'MSKC04', 'Střížek': 'MSKC03', 'Třasák': 'MSKC01' }),
  previewRule: 'Po vygenerování musí průvodce ukázat celý rozpis v náhledu a umožnit návrat na měsíc/dny/absence bez naklikání od začátku.'
});

const RAK_ROTATION_GENERATOR_RULES_V1114 = Object.freeze({
  version: '1.114',
  scope: 'Administrace dat / Rozpisy / Vygenerovat návrh',
  softCoreAvailabilityRule: 'Když Synek/Třasák/Střížek mají v bloku absenci, generátor nejdřív prohodí jejich pořadí. Pokud chybějící člověk stále brání dokončení bloku, jeho den přeskočí a další pracovní den začne nový stroj.',
  soloMillBalanceRule: 'Samostatné frézky/MFKF10 s prázdnou MFKF06 se po vygenerování vyrovnávají mezi lidmi podobně jako TNKS01, aby někdo nebyl sám na frézkách opakovaně a jiný vůbec.'
});


const RAK_ROTATION_GENERATOR_RULES_V1115 = Object.freeze({
  version: '1.115',
  scope: 'Administrace dat / Rozpisy / Vygenerovat návrh',
  humanFlowRule: 'Generátor postupuje víc jako Martin: nejdřív rozepsat lidi z Tvrdoty podle návaznosti z minulého měsíce, potom základ Měkoty, potom absence/výměny, potom Špadrna a Novotný pro vyrovnání a zbytek na frézky.',
  hardCycle: Object.freeze(['TBKR01', 'TNKS01', 'TBKR07', 'TPKW01', 'TPKW02']),
  previousMonthRule: 'Pro lidi z Tvrdoty se drží cursor podle posledního tvrdotního stroje z předchozích měsíců.',
  displacedHardRule: 'Když člověk z Měkoty jde na tvrdotní stroj, vytlačený člověk z Tvrdoty jde v tom dni na Měkotu, přednostně na frézky.',
  flexPeople: Object.freeze(['Špadrna', 'Novotný'])
});


const RAK_ROTATION_GENERATOR_RULES_V1116 = Object.freeze({
  version: '1.116',
  scope: 'Administrace dat / Rozpisy / Vygenerovat návrh',
  machineSummaryRule: 'Kontrolní přehled musí být otočený jako jména v řádcích a stroje ve sloupcích, se souhrny TO a MO pro rychlou kontrolu.',
  pressBalanceRule: 'Nýtovačka se vyrovnává podle společného počtu TNKS01/TPKW01 s pravidlem 0,5 + 0,5, takže stav 1,5 proti 0 je potřeba dál prohazovat.',
  softKindBalanceRule: 'Měkota se po vygenerování dorovnává i podle typu práce: kdo má moc frézek a žádný soustruh se prohazuje s tím, kdo má moc soustruhů a žádné frézky.',
  softTotalBalanceRule: 'Vybraná skupina lidí z Tvrdoty se po vygenerování dorovnává i podle celkového počtu směn na Měkotě.',
  resultFields: Object.freeze(['tnksBalanceSwaps', 'soloMillBalanceSwaps', 'softTotalBalanceSwaps', 'softKindBalanceSwaps'])
});

const RAK_ROTATION_SAVE_BUTTON_CONTRACT_V1118 = Object.freeze({
  scope: 'administrace-dat-rozpisy-save-button',
  rule: 'Editor rozpisu má mít jen jedno jasné tlačítko Uložit rozpis; duplicitní duplicitní odesílací tlačítko se nepoužívá.',
  generatorResult: 'Náhled generátoru má otevírat rozpis, samotné odeslání/uložení zůstává až přes Uložit rozpis.'
});
const RAK_ROTATION_EMPTY_CELL_HIGHLIGHT_CONTRACT_V1119 = Object.freeze({
  scope: 'rotace-a-rozpisy-prazdne-pozice',
  intent: 'neobsazené pozice zvýraznit světle červenou v Rotaci, editoru Rozpisů i náhledu generátoru',
  protectedClasses: Object.freeze(['missingCell', 'adminRotationEditorEmptyCell', 'adminRotationPreviewEmptyCell', 'adminRotationMiniEmpty'])
});

const RAK_ROTATION_GENERATOR_RULES_V1117 = Object.freeze({
  version: '1.117',
  scope: 'Administrace dat / Rozpisy / Vygenerovat návrh',
  kminekNovotnyMoToRule: 'Kmínek a Novotný se můžou po vygenerování prohazovat mezi sebou, aby měli co nejpodobnější počet směn na MO a TO.',
  guardFunction: 'adminRotationGeneratorBalanceKminekNovotnyMoTo',
  resultFields: Object.freeze(['kminekNovotnyMoToBalanceSwaps'])
});

const RAK_ROTATION_GENERATOR_WIZARD_CONTRACT_V1108 = Object.freeze({
  version: '1.108',
  scope: 'Administrace dat / Rozpisy / Vygenerovat návrh',
  flow: Object.freeze(['volba měsíce', 'kontrola pracovních dnů', 'absence přes +', 'vygenerování návrhu', 'měsíční přehled stroje × jména']),
  rules: 'Generátor se spouští až po kontrole dnů a absencí. Přehled strojů podle jmen je jen pro rychlou kontrolu před ručním uložením.'
});

function adminRotationGetOrderedMonthKeys() {
  return getAdminRotationMonthKeys().slice().sort((a, b) => adminRotationMonthSortValue(a) - adminRotationMonthSortValue(b));
}

function adminRotationGetNextExistingMonthKeyAfter(monthKey) {
  const keys = adminRotationGetOrderedMonthKeys();
  if (!keys.length) return monthKey || '';
  const current = monthKey && keys.includes(monthKey) ? monthKey : (app.selectedMonth && keys.includes(app.selectedMonth) ? app.selectedMonth : keys[keys.length - 1]);
  const idx = keys.indexOf(current);
  if (idx >= 0 && idx < keys.length - 1) return keys[idx + 1];
  const currentSort = adminRotationMonthSortValue(current);
  const later = keys.find((key) => adminRotationMonthSortValue(key) > currentSort);
  return later || '';
}

function adminRotationFindExistingMonthKeyAtOrAfter(monthKey) {
  const keys = adminRotationGetOrderedMonthKeys();
  if (!keys.length) return '';
  if (monthKey && keys.includes(monthKey)) return monthKey;
  const targetSort = adminRotationMonthSortValue(monthKey);
  if (targetSort) {
    const later = keys.find((key) => adminRotationMonthSortValue(key) >= targetSort);
    if (later) return later;
  }
  return keys[0] || '';
}

function adminRotationGetLatestGeneratedMonthKey() {
  const keys = adminRotationGetOrderedMonthKeys();
  let latest = '';
  let started = false;
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (adminRotationMonthHasFilledCells(key)) {
      latest = key;
      started = true;
      continue;
    }
    if (started) break;
  }
  return latest;
}

function adminRotationGetDefaultFutureMonthKey() {
  const today = new Date();
  const future = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const key = typeof monthKeyFromYearMonth === 'function'
    ? monthKeyFromYearMonth(future.getFullYear(), future.getMonth() + 1)
    : String(future.getMonth() + 1) + '/' + String(future.getFullYear()).slice(-2);
  return adminRotationFindExistingMonthKeyAtOrAfter(key);
}

function adminRotationGetCurrentExistingMonthKey() {
  const keys = adminRotationGetOrderedMonthKeys();
  if (!keys.length) return '';
  const today = new Date();
  const key = typeof monthKeyFromYearMonth === 'function'
    ? monthKeyFromYearMonth(today.getFullYear(), today.getMonth() + 1)
    : String(today.getMonth() + 1) + '/' + String(today.getFullYear()).slice(-2);
  return keys.includes(key) ? key : '';
}

function adminRotationAddGeneratorAllowedRange(result, fromKey, toKey) {
  const keys = adminRotationGetOrderedMonthKeys();
  const fromSort = adminRotationMonthSortValue(fromKey);
  const toSort = adminRotationMonthSortValue(toKey);
  if (!fromSort || !toSort) return;
  keys.forEach((key) => {
    const sort = adminRotationMonthSortValue(key);
    if (sort >= fromSort && sort <= toSort && !result.includes(key)) result.push(key);
  });
}

function adminRotationGetAllowedGeneratorMonthKeys() {
  const keys = adminRotationGetOrderedMonthKeys();
  if (!keys.length) return [];
  const result = [];
  const currentMonth = adminRotationGetCurrentExistingMonthKey();
  const latestGenerated = adminRotationGetLatestGeneratedMonthKey();
  const currentSort = adminRotationMonthSortValue(currentMonth);
  const latestSort = adminRotationMonthSortValue(latestGenerated);
  const baseForNext = currentSort && (!latestSort || currentSort > latestSort)
    ? currentMonth
    : latestGenerated;
  const next = baseForNext ? adminRotationGetNextExistingMonthKeyAfter(baseForNext) : '';

  if (currentMonth && next) {
    adminRotationAddGeneratorAllowedRange(result, currentMonth, next);
  } else if (currentMonth) {
    result.push(currentMonth);
  } else if (next) {
    result.push(next);
  }

  if (!result.length) {
    const fallback = adminRotationGetDefaultFutureMonthKey() || keys[0];
    if (fallback) result.push(fallback);
  }

  return result.sort((a, b) => adminRotationMonthSortValue(a) - adminRotationMonthSortValue(b));
}

function adminRotationGetNextMonthKeyFrom(monthKey) {
  return adminRotationGeneratorResolveSelectableMonthKey(monthKey);
}

function adminRotationMonthYearLabel(monthKey) {
  const parsed = typeof parseMonthKey === 'function' ? parseMonthKey(monthKey) : null;
  if (parsed && Number.isFinite(parsed.year)) return String(parsed.year);
  const match = String(monthKey || '').match(/^\d{1,2}\/(\d{2,4})$/);
  if (!match) return 'Bez roku';
  const rawYear = Number(match[1]);
  return String(rawYear < 100 ? 2000 + rawYear : rawYear);
}

function adminRotationMonthFullLabel(monthKey) {
  const parsed = typeof parseMonthKey === 'function' ? parseMonthKey(monthKey) : null;
  if (!parsed || !Number.isFinite(parsed.month) || !Number.isFinite(parsed.year)) return String(monthKey || '');
  const names = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
  const name = names[parsed.month - 1] || String(parsed.month);
  return name + ' ' + String(parsed.year) + ' (' + String(monthKey) + ')';
}

function adminRotationCollectMonthWorkDatesFromMonth(month) {
  if (!month) return [];
  const hardRows = Array.isArray(month.hard && month.hard.rows) ? month.hard.rows : [];
  const softRows = Array.isArray(month.soft && month.soft.rows) ? month.soft.rows : [];
  const maxRows = Math.max(hardRows.length, softRows.length);
  const dates = [];
  const seen = new Set();
  for (let i = 0; i < maxRows; i += 1) {
    const raw = String((hardRows[i] && hardRows[i].date) || (softRows[i] && softRows[i].date) || '').trim();
    if (!raw || seen.has(raw)) continue;
    seen.add(raw);
    dates.push(raw);
  }
  return dates;
}

function adminRotationGetDefaultMonthWorkDates(monthKey) {
  const source = (typeof initialRotationData !== 'undefined' && initialRotationData && initialRotationData.months)
    ? initialRotationData.months[monthKey]
    : null;
  return adminRotationCollectMonthWorkDatesFromMonth(source);
}

function adminRotationGetMonthWorkDates(monthKey) {
  const month = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const currentDates = adminRotationCollectMonthWorkDatesFromMonth(month);
  if (currentDates.length) return currentDates;
  return adminRotationGetDefaultMonthWorkDates(monthKey);
}

function adminRotationCollectMonthAbsencesFromMonth(month, days) {
  const workingDays = Array.isArray(days) ? days.map((date) => String(date || '').trim()).filter(Boolean) : [];
  const result = workingDays.map((date) => ({ date, rows: [] }));
  if (!month || !result.length) return result;
  const exactMap = new Map();
  const baseMap = new Map();
  result.forEach((day, idx) => {
    const exact = adminRotationDateLabel(day.date);
    const base = adminRotationDateBaseKey(day.date);
    if (exact && !exactMap.has(exact)) exactMap.set(exact, idx);
    if (base) {
      if (!baseMap.has(base)) baseMap.set(base, []);
      baseMap.get(base).push(idx);
    }
  });
  (Array.isArray(month.notes) ? month.notes : []).forEach((note) => {
    const normalized = typeof normalizeNoteEntry === 'function' ? normalizeNoteEntry(note) : null;
    if (!normalized || !normalized.isAbsence) return;
    const person = String(normalized.person || '').trim();
    const code = String(normalized.code || '').trim();
    if (!person && !code) return;
    const exact = adminRotationDateLabel(normalized.date || '');
    const base = adminRotationDateBaseKey(normalized.date || '');
    let idx = exactMap.has(exact) ? exactMap.get(exact) : -1;
    if ((!Number.isFinite(idx) || idx < 0) && baseMap.has(base)) {
      const bucket = baseMap.get(base) || [];
      idx = bucket.length ? bucket[0] : -1;
      const normalizedShift = typeof normalizeShiftText === 'function'
        ? normalizeShiftText(String(normalized.shift || '').trim())
        : String(normalized.shift || '').trim();
      if (normalizedShift && bucket.length > 1) {
        const matched = bucket.find((candidateIdx) => {
          const parsed = typeof parseDateToken === 'function' ? parseDateToken(result[candidateIdx] && result[candidateIdx].date) : null;
          const candidateShift = parsed && parsed.shift && typeof normalizeShiftText === 'function'
            ? normalizeShiftText(parsed.shift)
            : (parsed && parsed.shift ? parsed.shift : '');
          return String(candidateShift || '').trim() === String(normalizedShift || '').trim();
        });
        if (Number.isFinite(matched)) idx = matched;
      }
    }
    if (!Number.isFinite(idx) || idx < 0 || !result[idx]) return;
    result[idx].rows.push({ person, code });
  });
  return result;
}

const RAK_ROTATION_GENERATOR_EXCEL_COPY_CONTRACT_V1138 = Object.freeze({
  version: '1.145',
  layout: 'kopírovací XLSX návrh rozpisu: Tvrdota A:F, prázdný oddělovač G, Absence od H dál podle pracovních dnů, Měkota znovu A:F pod Tvrdotou',
  absenceRule: 'Absence mají datum v H a dvojice Jméno/Kód od I dál; počet dvojic je dynamický 4 až 8 podle měsíce.',
  copyRule: 'Bez slučovaných buněk a bez stylových triků, aby šly bloky jednoduše označit a kopírovat do Martinovy měsíční tabulky.'
});

function adminBuildRotationMachineCountSummaryHtml(month, monthKey) {
  if (!month) return '<div class="smallText">Souhrn zatím není dostupný.</div>';
  const names = adminGetKnownNames();
  const machineMap = new Map();
  const sectionTotals = { hard: new Map(), soft: new Map() };
  const addTotal = (sectionKey, person, value) => {
    const name = String(person || '').trim();
    if (!name) return;
    const map = sectionKey === 'soft' ? sectionTotals.soft : sectionTotals.hard;
    map.set(name, Number(map.get(name) || 0) + Number(value || 0));
  };
  const addSection = (sectionKey, fallbackMachines) => {
    const section = month[sectionKey] || {};
    const machines = Array.isArray(section.machines) ? section.machines : fallbackMachines;
    const rows = Array.isArray(section.rows) ? section.rows : [];
    rows.forEach((row) => {
      if (sectionKey === 'hard') {
        const tnksIdx = adminRotationGeneratorMachineIndex(machines, 'TNKS01');
        const tpkw01Idx = adminRotationGeneratorMachineIndex(machines, 'TPKW01');
        const splitPress = adminRotationGeneratorShouldSplitPressMachines(row && row.date, monthKey, month);
        if (splitPress && tnksIdx >= 0 && tpkw01Idx >= 0) {
          [tnksIdx, tpkw01Idx].forEach((idx) => {
            const person = adminRotationCanonicalName(row && row.cells ? row.cells[idx] : '', names);
            if (!person || !names.includes(person)) return;
            adminRotationGeneratorAddMachineCount(machineMap, 'TNKS01', person, 0.5);
            adminRotationGeneratorAddMachineCount(machineMap, 'TPKW01', person, 0.5);
            addTotal('hard', person, 1);
          });
          machines.forEach((machine, machineIdx) => {
            const machineName = String(machine || '').trim();
            if (!machineName || machineName === 'TNKS01' || machineName === 'TPKW01') return;
            const person = adminRotationCanonicalName(row && row.cells ? row.cells[machineIdx] : '', names);
            if (person && names.includes(person)) {
              adminRotationGeneratorAddMachineCount(machineMap, machineName, person, 1);
              addTotal('hard', person, 1);
            }
          });
          return;
        }
      }
      machines.forEach((machine, machineIdx) => {
        const machineName = String(machine || '').trim();
        if (!machineName) return;
        const person = adminRotationCanonicalName(row && row.cells ? row.cells[machineIdx] : '', names);
        if (!person || !names.includes(person)) return;
        adminRotationGeneratorAddMachineCount(machineMap, machineName, person, 1);
        addTotal(sectionKey === 'soft' ? 'soft' : 'hard', person, 1);
      });
    });
  };
  addSection('hard', HARD_MACHINE_HEADERS);
  addSection('soft', SOFT_MACHINE_HEADERS);
  const usedNames = names.filter((name) => Array.from(machineMap.values()).some((map) => map.has(name)) || sectionTotals.hard.has(name) || sectionTotals.soft.has(name));
  if (!usedNames.length || !machineMap.size) return '<div class="smallText">Souhrn bude dostupný po vygenerování rozpisu.</div>';
  const orderedMachines = HARD_MACHINE_HEADERS.concat(SOFT_MACHINE_HEADERS).filter((machine, idx, arr) => machine && arr.indexOf(machine) === idx && machineMap.has(machine));
  const head = '<tr><th>Jméno</th><th>TO</th><th>MO</th>' + orderedMachines.map((machine) => '<th>' + escapeHtml(machine) + '</th>').join('') + '</tr>';
  const body = usedNames.map((name) => {
    const hardTotal = Number(sectionTotals.hard.get(name) || 0);
    const softTotal = Number(sectionTotals.soft.get(name) || 0);
    const cells = orderedMachines.map((machine) => {
      const counts = machineMap.get(machine);
      const count = counts ? Number(counts.get(name) || 0) : 0;
      return '<td class="' + (count ? 'adminRotationMachineCountHit' : '') + '">' + adminRotationGeneratorFormatCount(count) + '</td>';
    }).join('');
    return '<tr><td>' + escapeHtml(name) + '</td>'
      + '<td class="' + (hardTotal ? 'adminRotationMachineCountHit' : '') + '">' + adminRotationGeneratorFormatCount(hardTotal) + '</td>'
      + '<td class="' + (softTotal ? 'adminRotationMachineCountHit' : '') + '">' + adminRotationGeneratorFormatCount(softTotal) + '</td>'
      + cells + '</tr>';
  }).join('');
  return [
    '<details class="adminRotationGeneratorMachineSummary" open>',
    '  <summary>Rychlý přehled: jména × stroje</summary>',
    '  <div class="smallText">Jména jsou v řádcích, stroje ve sloupcích. Sloupce TO/MO ukazují součet tvrdého a měkkého obrábění. TNKS01 a TPKW01 se mimo běžnou neděli počítají jako 0,5 + 0,5 na oba stroje. Ruční výjimka „Nerotuje / každý +1“ má přednost.</div>',
    '  <div class="adminRotationGeneratorMachineSummaryScroll">',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense adminRotationGeneratorMachineSummaryTable"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>',
    '  </div>',
    '</details>'
  ].join('');
}

function adminAddAbsenceRowToEditor() {
  const body = document.getElementById('appMenuBody');
  const tbody = body ? body.querySelector('#adminRotationEditor .appMenuAdminAbsenceTable tbody') : null;
  if (!tbody) return;
  const index = tbody.querySelectorAll('tr[data-note-row-index]').length;
  tbody.insertAdjacentHTML('beforeend', adminNotesRowTemplate({ date: '', person: '', code: '' }, index, true));
  const status = document.getElementById('adminRotationDraftStatus');
  if (status) status.textContent = 'Přidaný další řádek absence. Rozpis se uloží až tlačítkem.';
}

const RAK_ROTATION_GENERATOR_RULES_V1135 = Object.freeze({
  version: '1.136',
  tnksMonthlyFirstRule: 'TNKS01/nýtovačka se v generátoru vyrovnává primárně v rámci měsíce; roční počty jsou jen jemný tie-break.',
  excludedFromTnksBalance: Object.freeze(['Střížek', 'Synek', 'Třasák']),
  softCoreContinuationRule: 'Synek/Třasák/Střížek drží pevný návazný cyklus TNKS01 → TPKW01 → TPKW02 mezi měsíci a TNKS01 dorovnání jim do něj nesahá.',
  softCoreGapRule: 'Mezera po dokončeném bloku slouží jen k zarovnání konce měsíce. Když rozdělaný blok nemůže dokončit chybějící člověk ani po prohození pořadí, jeho krok se přeskočí a následující pracovní den začne trojice další stroj.',
  consecutiveTnksRule: 'Stejný pracovník nesmí být na TNKS01 dvě pracovní směny po sobě; ve dnech s rotací TNKS01/TPKW01 se jako TNKS práce počítá i TPKW01, krátká / nerotující neděle se nepůlí.',
  singleSaveRule: 'Editor rozpisu má jen jedno hlavní tlačítko Uložit rozpis v horní akční liště.'
});

window.RAK_ROTATION_GENERATOR_RULES_V1135 = RAK_ROTATION_GENERATOR_RULES_V1135;
window.RAK_ROTATION_GENERATOR_RULES_V1117 = RAK_ROTATION_GENERATOR_RULES_V1117;
window.RAK_ROTATION_GENERATOR_RULES_V1116 = RAK_ROTATION_GENERATOR_RULES_V1116;
window.RAK_ROTATION_GENERATOR_RULES_V1115 = RAK_ROTATION_GENERATOR_RULES_V1115;
window.RAK_ROTATION_GENERATOR_RULES_V1114 = RAK_ROTATION_GENERATOR_RULES_V1114;
window.RAK_ROTATION_GENERATOR_RULES_V1113 = RAK_ROTATION_GENERATOR_RULES_V1113;
window.RAK_ROTATION_GENERATOR_MONTH_BALANCE_CONTRACT_V1112 = RAK_ROTATION_GENERATOR_MONTH_BALANCE_CONTRACT_V1112;
window.RAK_ROTATION_GENERATOR_ABSENCE_STATE_CONTRACT_V1109 = RAK_ROTATION_GENERATOR_ABSENCE_STATE_CONTRACT_V1109;
window.RAK_ROTATION_GENERATOR_WIZARD_RUN_CONTRACT_V1110 = RAK_ROTATION_GENERATOR_WIZARD_RUN_CONTRACT_V1110;
window.RAK_ROTATION_GENERATOR_WIZARD_STATE_CONTRACT_V1111 = RAK_ROTATION_GENERATOR_WIZARD_STATE_CONTRACT_V1111;
window.RAK_ROTATION_GENERATOR_WIZARD_CONTRACT_V1108 = RAK_ROTATION_GENERATOR_WIZARD_CONTRACT_V1108;
window.adminOpenRotationGeneratorWizard = adminOpenRotationGeneratorWizard;
window.adminHandleRotationGeneratorWizardAction = adminHandleRotationGeneratorWizardAction;
window.adminAddAbsenceRowToEditor = adminAddAbsenceRowToEditor;
window.adminBuildRotationMachineCountSummaryHtml = adminBuildRotationMachineCountSummaryHtml;
window.adminBuildRotationGeneratorPreviewHtml = adminBuildRotationGeneratorPreviewHtml;
window.adminRotationGeneratorDownloadExcel = adminRotationGeneratorDownloadExcel;
window.adminRotationGetAllowedGeneratorMonthKeys = adminRotationGetAllowedGeneratorMonthKeys;
window.adminRotationGeneratorBuildYearOptions = adminRotationGeneratorBuildYearOptions;
window.adminRotationGeneratorBuildMonthOptions = adminRotationGeneratorBuildMonthOptions;
window.adminRotationGeneratorBalanceHardMachine = adminRotationGeneratorBalanceHardMachine;

try {
  document.addEventListener('change', (event) => {
    adminRotationGeneratorHandleYearSelectChange(event.target);
  });
} catch (err) {}

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
    // RaK 1.2 (1.155) – horní sticky tlačítko už při kliknutí do jména nevytahujeme.
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

try {
  window.adminRotationOvertimeGetShiftInfoForIsoDate = adminRotationOvertimeGetShiftInfoForIsoDate;
  window.adminRotationOvertimeSetShiftFilter = adminRotationOvertimeSetShiftFilter;
  window.adminRotationRefreshOvertimeShiftBadges = adminRotationRefreshOvertimeShiftBadges;
} catch (err) {}

try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}
