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


const ADMIN_ROTATION_OVERTIME_SETTINGS_KEY = (typeof ROTATION_OVERTIME_SETTINGS_MACHINE_KEY !== 'undefined' ? ROTATION_OVERTIME_SETTINGS_MACHINE_KEY : 'ROTATION_OVERTIME_SETTINGS');
const ADMIN_ROTATION_OVERTIME_SETTINGS_CATEGORY = (typeof ROTATION_OVERTIME_SETTINGS_CATEGORY !== 'undefined' ? ROTATION_OVERTIME_SETTINGS_CATEGORY : 'rotation_overtime_settings');
const ADMIN_ROTATION_OVERTIME_SHIFT_FILTER_KEY = 'rak_admin_overtime_shift_filter_v127';
const ADMIN_ROTATION_OVERTIME_DEFAULT_TEAM = 'D';
const ADMIN_ROTATION_GENERATOR_SETTINGS_KEY = 'ROTATION_GENERATOR_SETTINGS';
const ADMIN_ROTATION_GENERATOR_SETTINGS_CATEGORY = 'rotation_generator_settings';

function adminRotationOvertimeIsoToCzechDate(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return raw;
  return String(Number(match[3])) + '.' + String(Number(match[2])) + '.' + match[1];
}

function adminRotationOvertimeCzechDateToIso(value, fallbackYear) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    if (year >= 2000 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) return String(year) + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  }
  const cz = raw.match(/^(\d{1,2})\s*[.]\s*(\d{1,2})(?:\s*[.]\s*(\d{2,4})\s*[.]?)?$/);
  if (!cz) return '';
  const day = Number(cz[1]);
  const month = Number(cz[2]);
  const yearRaw = cz[3] ? Number(cz[3]) : Number(fallbackYear || new Date().getFullYear());
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return '';
  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return '';
  return String(year) + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
}

function adminIsRotationOvertimeSettingsRow(row) {
  const settings = adminRotationSettingsJson(row);
  return String(row && row.category || '').trim() === ADMIN_ROTATION_OVERTIME_SETTINGS_CATEGORY
    || String(row && row.machine_key || '').trim() === ADMIN_ROTATION_OVERTIME_SETTINGS_KEY
    || String(settings && settings.stored_category || '').trim() === ADMIN_ROTATION_OVERTIME_SETTINGS_CATEGORY
    || String(settings && settings.admin_settings_key || '').trim() === ADMIN_ROTATION_OVERTIME_SETTINGS_KEY;
}

function makeAdminRotationOvertimeSettingsRow(settings) {
  const safe = settings && typeof settings === 'object' ? settings : { type: ADMIN_ROTATION_OVERTIME_SETTINGS_CATEGORY, entries: [] };
  return {
    machine_key: ADMIN_ROTATION_OVERTIME_SETTINGS_KEY,
    machine_code: 'ROTATION',
    machine_index: 'overtime',
    label: 'Přesčasy rozpisu',
    category: ADMIN_ROTATION_OVERTIME_SETTINGS_CATEGORY,
    cycle_time: '',
    speed: '',
    dress_time: '',
    dress_count: '',
    settings_json: Object.assign({ machine: 'ROTATION', index: 'overtime' }, safe)
  };
}

function mergeAdminRotationOvertimeSettingsRows(settings) {
  const base = Array.isArray(app.machineSettingsRows) ? app.machineSettingsRows : [];
  const rows = base.filter((row) => !adminIsRotationOvertimeSettingsRow(row));
  rows.push(makeAdminRotationOvertimeSettingsRow(settings));
  return rows;
}

function adminRotationSettingsJson(row) {
  if (row && row.settings_json && typeof row.settings_json === 'object') return row.settings_json;
  try { return row && row.settings_json ? JSON.parse(String(row.settings_json)) : {}; }
  catch (err) { return {}; }
}

function adminIsRotationGeneratorSettingsRow(row) {
  const settings = adminRotationSettingsJson(row);
  return String(row && row.category || '').trim() === ADMIN_ROTATION_GENERATOR_SETTINGS_CATEGORY
    || String(row && row.machine_key || '').trim() === ADMIN_ROTATION_GENERATOR_SETTINGS_KEY
    || String(settings && settings.stored_category || '').trim() === ADMIN_ROTATION_GENERATOR_SETTINGS_CATEGORY
    || String(settings && settings.admin_settings_key || '').trim() === ADMIN_ROTATION_GENERATOR_SETTINGS_KEY;
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
  return {
    type: ADMIN_ROTATION_GENERATOR_SETTINGS_CATEGORY,
    softPreferred,
    hardPreferred,
    softCore,
    softHardCycle,
    softHardBlockLength,
    softBaseLathe,
    hardCycle
  };
}

function getAdminRotationGeneratorSettings() {
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  const row = rows.find(adminIsRotationGeneratorSettingsRow);
  return adminRotationNormalizeGeneratorSettings(row ? adminRotationSettingsJson(row) : null);
}

function getAdminRotationGeneratorRules() {
  const base = RAK_ROTATION_GENERATOR_RULES_V1107 || {};
  const settings = getAdminRotationGeneratorSettings();
  return Object.assign({}, base, {
    softPreferred: settings.softPreferred,
    hardPreferred: settings.hardPreferred,
    softHardCycle: settings.softHardCycle,
    softHardBlockLength: settings.softHardBlockLength,
    softCore: settings.softCore,
    softBaseLathe: settings.softBaseLathe,
    softCoreNoTnksBalance: settings.softCore,
    hardCycle: settings.hardCycle
  });
}

function makeAdminRotationGeneratorSettingsRow(settings) {
  const safe = adminRotationNormalizeGeneratorSettings(settings);
  return {
    machine_key: ADMIN_ROTATION_GENERATOR_SETTINGS_KEY,
    machine_code: 'ROTATION',
    machine_index: 'generator',
    label: 'Pravidla generátoru rozpisu',
    category: ADMIN_ROTATION_GENERATOR_SETTINGS_CATEGORY,
    cycle_time: '',
    speed: '',
    dress_time: '',
    dress_count: '',
    settings_json: Object.assign({ machine: 'ROTATION', index: 'generator' }, safe)
  };
}

function mergeAdminRotationGeneratorSettingsRows(settings) {
  const base = Array.isArray(app.machineSettingsRows) ? app.machineSettingsRows : [];
  const rows = base.filter((row) => !adminIsRotationGeneratorSettingsRow(row));
  rows.push(makeAdminRotationGeneratorSettingsRow(settings));
  return rows;
}

function adminRotationGeneratorListValue(list) {
  return adminRotationSplitGeneratorList(list).join('\n');
}

function buildAdminRotationGeneratorSettingsHtml() {
  const settings = getAdminRotationGeneratorSettings();
  const baseRows = settings.softCore.map((name, idx) => [
    '<tr data-generator-base-row="' + String(idx) + '">',
    '  <td><input class="appMenuInlineInput" data-generator-base-field="person" value="' + escapeHtml(name) + '" placeholder="Jmeno"></td>',
    '  <td><input class="appMenuInlineInput" data-generator-base-field="machine" value="' + escapeHtml(settings.softBaseLathe[name] || '') + '" placeholder="MSKC01"></td>',
    '</tr>'
  ].join('')).join('');
  return [
    '<div class="appMenuSettingsList adminGeneratorSettingsList">',
    '  <div class="appMenuSubTitle">Lidé a pořadí</div>',
    '  <label class="appMenuFieldLabel" for="adminGeneratorSoftPreferred">Základ měkoty</label>',
    '  <textarea id="adminGeneratorSoftPreferred" class="appMenuTextarea" rows="5">' + escapeHtml(adminRotationGeneratorListValue(settings.softPreferred)) + '</textarea>',
    '  <label class="appMenuFieldLabel" for="adminGeneratorHardPreferred">Základ tvrdoty</label>',
    '  <textarea id="adminGeneratorHardPreferred" class="appMenuTextarea" rows="5">' + escapeHtml(adminRotationGeneratorListValue(settings.hardPreferred)) + '</textarea>',
    '  <label class="appMenuFieldLabel" for="adminGeneratorSoftCore">Trojice s vlastním TNKS/TPKW cyklem</label>',
    '  <textarea id="adminGeneratorSoftCore" class="appMenuTextarea" rows="3">' + escapeHtml(adminRotationGeneratorListValue(settings.softCore)) + '</textarea>',
    '  <div class="appMenuSubTitle">Cykly strojů</div>',
    '  <label class="appMenuFieldLabel" for="adminGeneratorSoftHardCycle">Cyklus trojice na tvrdotě</label>',
    '  <textarea id="adminGeneratorSoftHardCycle" class="appMenuTextarea" rows="3">' + escapeHtml(adminRotationGeneratorListValue(settings.softHardCycle)) + '</textarea>',
    '  <label class="appMenuFieldLabel" for="adminGeneratorSoftHardBlockLength">Kolik dní držet jeden stroj v cyklu</label>',
    '  <input id="adminGeneratorSoftHardBlockLength" class="appMenuInput" type="number" min="1" max="12" step="1" value="' + escapeHtml(String(settings.softHardBlockLength || 3)) + '">',
    '  <label class="appMenuFieldLabel" for="adminGeneratorHardCycle">Tvrdotový cyklus strojů</label>',
    '  <textarea id="adminGeneratorHardCycle" class="appMenuTextarea" rows="5">' + escapeHtml(adminRotationGeneratorListValue(settings.hardCycle)) + '</textarea>',
    '  <div class="appMenuSubTitle">Základní soustruhy měkoty</div>',
    '  <div class="smallText">Jména musí odpovídat seznamu výše. Stroj použij například MSKC01, MSKC03 nebo MSKC04.</div>',
    '  <div class="tableWrap appMenuTableWrap uMt12">',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense">',
    '      <thead><tr><th>Jméno</th><th>Stroj</th></tr></thead>',
    '      <tbody>' + baseRows + '</tbody>',
    '    </table>',
    '  </div>',
    '</div>'
  ].join('');
}

function readAdminRotationGeneratorSettingsFromDom() {
  const getText = (id) => String(document.getElementById(id)?.value || '');
  const softBaseLathe = {};
  document.querySelectorAll('#appMenuBody tr[data-generator-base-row]').forEach((tr) => {
    const person = String(tr.querySelector('[data-generator-base-field="person"]')?.value || '').trim();
    const machine = String(tr.querySelector('[data-generator-base-field="machine"]')?.value || '').trim().toUpperCase();
    if (person && machine) softBaseLathe[person] = machine;
  });
  return adminRotationNormalizeGeneratorSettings({
    softPreferred: adminRotationSplitGeneratorList(getText('adminGeneratorSoftPreferred')),
    hardPreferred: adminRotationSplitGeneratorList(getText('adminGeneratorHardPreferred')),
    softCore: adminRotationSplitGeneratorList(getText('adminGeneratorSoftCore')),
    softHardCycle: adminRotationSplitGeneratorList(getText('adminGeneratorSoftHardCycle')),
    softHardBlockLength: Number(document.getElementById('adminGeneratorSoftHardBlockLength')?.value || 3),
    hardCycle: adminRotationSplitGeneratorList(getText('adminGeneratorHardCycle')),
    softBaseLathe
  });
}

function getAdminRotationOvertimeEntries() {
  try {
    if (typeof getRotationOvertimeSettings === 'function') {
      const settings = getRotationOvertimeSettings();
      return Array.isArray(settings && settings.entries) ? settings.entries.slice() : [];
    }
  } catch (err) {}
  try {
    const all = typeof SPECIAL_OVERTIME_SUNDAY_NIGHTS_2026 !== 'undefined' ? Array.from(SPECIAL_OVERTIME_SUNDAY_NIGHTS_2026) : [];
    const mo = typeof SPECIAL_OVERTIME_MO_ONLY_SUNDAYS_2026 !== 'undefined' ? SPECIAL_OVERTIME_MO_ONLY_SUNDAYS_2026 : new Set();
    return all.sort().map((date) => ({ date, to: !(mo && typeof mo.has === 'function' && mo.has(date)), note: (mo && typeof mo.has === 'function' && mo.has(date)) ? 'Jen MO' : '' }));
  } catch (err) {}
  return [];
}

function adminRotationOvertimeStartOfWeekMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d;
}

function adminRotationOvertimeGetShiftTeams() {
  const teams = (typeof SHIFT_CYCLE_ORDER !== 'undefined' && Array.isArray(SHIFT_CYCLE_ORDER) && SHIFT_CYCLE_ORDER.length)
    ? SHIFT_CYCLE_ORDER.slice()
    : ['B', 'D', 'A', 'C'];
  return Array.from(new Set(teams.map((team) => String(team || '').trim().toUpperCase()).filter(Boolean)));
}

function adminRotationOvertimeGetMyTeam() {
  const raw = String((app && app.adminOvertimeMyShift) || ADMIN_ROTATION_OVERTIME_DEFAULT_TEAM || 'D').trim().toUpperCase();
  return adminRotationOvertimeGetShiftTeams().includes(raw) ? raw : 'D';
}

function adminRotationOvertimeGetSelectedShiftFilter() {
  let raw = 'ALL';
  try { raw = String(localStorage.getItem(ADMIN_ROTATION_OVERTIME_SHIFT_FILTER_KEY) || 'ALL').trim().toUpperCase(); } catch (err) {}
  if (raw === 'ALL') return raw;
  return adminRotationOvertimeGetShiftTeams().includes(raw) ? raw : 'ALL';
}

function adminRotationOvertimeSetShiftFilter(value) {
  const raw = String(value || 'ALL').trim().toUpperCase();
  const next = raw === 'ALL' || adminRotationOvertimeGetShiftTeams().includes(raw) ? raw : 'ALL';
  try { localStorage.setItem(ADMIN_ROTATION_OVERTIME_SHIFT_FILTER_KEY, next); } catch (err) {}
  return next;
}

function adminRotationOvertimeGetShiftInfoForIsoDate(value) {
  const iso = String(value || '').trim();
  if (!isValidRotationOvertimeIsoDate(iso)) return null;
  const parts = iso.split('-').map(Number);
  const probe = new Date(parts[0], parts[1] - 1, parts[2], 22, 1, 0, 0);
  if (Number.isNaN(probe.getTime())) return null;
  const teams = adminRotationOvertimeGetShiftTeams();
  if (typeof getTeamShiftState === 'function') {
    for (const team of teams) {
      try {
        const state = getTeamShiftState(probe, team);
        if (state && state.active) return { team, label: 'Směna ' + team, detail: state.label || 'noční' };
      } catch (err) {}
    }
  }
  try {
    const baseWeek = adminRotationOvertimeStartOfWeekMonday(typeof SHIFT_CYCLE_START !== 'undefined' ? SHIFT_CYCLE_START : new Date(2026, 3, 27));
    const currentWeek = adminRotationOvertimeStartOfWeekMonday(probe);
    const weekDiff = Math.floor((currentWeek.getTime() - baseWeek.getTime()) / 86400000 / 7);
    const phaseMap = (typeof SHIFT_PHASE_BY_TEAM !== 'undefined' && SHIFT_PHASE_BY_TEAM) ? SHIFT_PHASE_BY_TEAM : { B: 0, D: 1, A: 2, C: 3 };
    for (const team of teams) {
      const phase = Number(phaseMap[team]);
      if (!Number.isFinite(phase)) continue;
      const cycleIndex = ((weekDiff + phase) % 4 + 4) % 4;
      if (cycleIndex === 0) return { team, label: 'Směna ' + team, detail: 'noční' };
    }
  } catch (err) {}
  return null;
}

function adminRotationOvertimeBuildShiftBadgeHtml(iso) {
  const info = adminRotationOvertimeGetShiftInfoForIsoDate(iso);
  const label = info && info.team ? ('Směna ' + info.team) : '—';
  const title = info && info.team ? ('Automaticky dopočítáno z data přesčasu: ' + label) : 'Směna se dopočítá po zadání platného data.';
  return '<span class="adminRotationOvertimeShiftBadge" data-rotation-overtime-shift-label title="' + escapeHtml(title) + '">' + escapeHtml(label) + '</span>';
}

function adminRotationOvertimeBuildEmptyShiftCounts() {
  return { A: 0, B: 0, C: 0, D: 0 };
}

function adminRotationOvertimeCountEntriesByShift(entries) {
  const counts = adminRotationOvertimeBuildEmptyShiftCounts();
  const list = Array.isArray(entries) ? entries : [];
  list.forEach((entry) => {
    const iso = String(entry && entry.date || '').trim();
    if (!isValidRotationOvertimeIsoDate(iso)) return;
    const info = adminRotationOvertimeGetShiftInfoForIsoDate(iso);
    const team = info && info.team ? String(info.team).trim().toUpperCase() : '';
    if (Object.prototype.hasOwnProperty.call(counts, team)) counts[team] += 1;
  });
  return counts;
}

function adminRotationOvertimeBuildYearSummaryHtml(year, entries) {
  const counts = adminRotationOvertimeCountEntriesByShift(entries);
  const teams = ['A', 'B', 'C', 'D'];
  const total = teams.reduce((sum, team) => sum + (counts[team] || 0), 0);
  return [
    '<div class="adminRotationOvertimeYearSummary" data-rotation-overtime-year-summary="' + escapeHtml(String(year || '')) + '">',
    '  <span class="adminRotationOvertimeYearSummaryLabel">Přesčasy podle směn</span>',
    '  <span class="adminRotationOvertimeYearSummaryTotal" data-overtime-year-total>' + String(total) + '× celkem</span>',
    '  <span class="adminRotationOvertimeYearSummaryChips">' + teams.map((team) => '<span class="adminRotationOvertimeYearSummaryChip" data-overtime-shift-count="' + escapeHtml(team) + '">' + escapeHtml(team) + ' <b>' + String(counts[team] || 0) + '×</b></span>').join('') + '</span>',
    '</div>'
  ].join('');
}

function buildAdminRotationOvertimeFilterHtml() {
  const selected = adminRotationOvertimeGetSelectedShiftFilter();
  const chips = [
    { value: 'ALL', label: 'Vše' },
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
    { value: 'D', label: 'D' }
  ];
  return [
    '<div class="adminRotationOvertimeFilterBox">',
    '  <div class="adminRotationOvertimeFilterTitle">Filtrovat podle směny</div>',
    '  <div class="adminRotationOvertimeFilterBar">' + chips.map((chip) => '<button type="button" class="adminRotationOvertimeFilterChip' + (selected === chip.value ? ' isActive' : '') + '" data-admin-action="overtime-shift-filter" data-overtime-shift-filter="' + escapeHtml(chip.value) + '">' + escapeHtml(chip.label) + '</button>').join('') + '</div>',
    '  <div class="smallText">Směna se dopočítá automaticky z data podle rotačního cyklu. Uložené záznamy se nemažou ani při zapnutém filtru.</div>',
    '</div>'
  ].join('');
}

function buildAdminRotationOvertimeRowHtml(entry, index, year) {
  const safe = entry && typeof entry === 'object' ? entry : {};
  const date = adminRotationOvertimeIsoToCzechDate(safe.date || '');
  const iso = isValidRotationOvertimeIsoDate(safe.date || '') ? String(safe.date || '').trim() : adminRotationOvertimeCzechDateToIso(date, year);
  const shiftInfo = adminRotationOvertimeGetShiftInfoForIsoDate(iso);
  const shiftTeam = shiftInfo && shiftInfo.team ? shiftInfo.team : '';
  const selectedFilter = adminRotationOvertimeGetSelectedShiftFilter();
  const hiddenByFilter = !!(iso && selectedFilter !== 'ALL' && shiftTeam && shiftTeam !== selectedFilter);
  const to = safe.to !== false;
  const note = String(safe.note || '').trim();
  return [
    '<tr data-rotation-overtime-row data-overtime-year="' + escapeHtml(String(year || '')) + '" data-overtime-shift="' + escapeHtml(shiftTeam) + '"' + (hiddenByFilter ? ' class="adminRotationOvertimeHiddenByFilter"' : '') + '>',
    '  <td><input class="appMenuInlineInput adminRotationOvertimeDateInput" data-rotation-overtime-date value="' + escapeHtml(date) + '" placeholder="1.3.' + escapeHtml(String(year || new Date().getFullYear())) + '" inputmode="numeric"></td>',
    '  <td class="adminRotationOvertimeShiftCell">' + adminRotationOvertimeBuildShiftBadgeHtml(iso) + '</td>',
    '  <td><label class="adminRotationOvertimeSwitch"><input type="checkbox" data-rotation-overtime-to ' + (to ? 'checked' : '') + '><span>TO</span></label></td>',
    '  <td><input class="appMenuInlineInput adminRotationOvertimeNoteInput" data-rotation-overtime-note value="' + escapeHtml(note) + '" placeholder="poznámka, např. jen MO"></td>',
    '  <td><button type="button" class="adminRotationGeneratorIconBtn" data-admin-action="overtime-row-clear" title="Smazat řádek">×</button></td>',
    '</tr>'
  ].join('');
}

function buildAdminRotationOvertimeSettingsHtml() {
  const entries = getAdminRotationOvertimeEntries().slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
  const currentYear = new Date().getFullYear();
  const yearSet = new Set([String(currentYear)]);
  entries.forEach((entry) => {
    const match = String(entry.date || '').match(/^(\d{4})-/);
    if (match) yearSet.add(match[1]);
  });
  const years = Array.from(yearSet).sort();
  const groups = years.map((year) => {
    const groupEntries = entries.filter((entry) => String(entry.date || '').startsWith(year + '-'));
    const rows = groupEntries.map((entry, idx) => buildAdminRotationOvertimeRowHtml(entry, idx, year));
    for (let i = 0; i < 4; i += 1) rows.push(buildAdminRotationOvertimeRowHtml({ date: '', to: true, note: '' }, groupEntries.length + i, year));
    const yearNumber = Number(year);
    const yearOpenAttr = Number.isFinite(yearNumber) && yearNumber >= currentYear ? ' open' : '';
    return [
      '<details class="appMenuFoldSection adminRotationOvertimeYear"' + yearOpenAttr + '>',
      '  <summary>Rok ' + escapeHtml(year) + ' <span class="smallText" data-rotation-overtime-year-total-label="' + escapeHtml(year) + '">' + String(groupEntries.length) + '×</span></summary>',
      adminRotationOvertimeBuildYearSummaryHtml(year, groupEntries),
      '  <div class="tableWrap appMenuTableWrap">',
      '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense adminRotationOvertimeTable">',
      '      <colgroup><col class="adminRotationOvertimeDateCol"><col class="adminRotationOvertimeShiftCol"><col class="adminRotationOvertimeToCol"><col class="adminRotationOvertimeNoteCol"><col class="adminRotationOvertimeDeleteCol"></colgroup>',
      '      <thead><tr><th>Datum</th><th>Směna</th><th>TO</th><th>Poznámka</th><th></th></tr></thead>',
      '      <tbody data-rotation-overtime-year-body="' + escapeHtml(year) + '">' + rows.join('') + '</tbody>',
      '    </table>',
      '  </div>',
      '  <button type="button" class="appMenuAction adminRotationGeneratorSmallAdd" data-admin-action="overtime-row-add" data-overtime-year="' + escapeHtml(year) + '">+ Přidat přesčas</button>',
      '</details>'
    ].join('');
  }).join('');
  return [
    buildAdminRotationOvertimeFilterHtml(),
    '<div class="adminRotationOvertimeHelp">',
    '  <b>TO zapnuto</b> = přesčas jde na tvrdotu a TNKS01/TPKW01 se ve statistikách počítá 0,5 + 0,5. ',
    '  <b>TO vypnuto</b> = přesčas nejde na tvrdotu, takže TNKS01 i TPKW01 mají +1 na stroji, kde jsou napsané.',
    '</div>',
    groups
  ].join('');
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

function readAdminRotationOvertimeSettingsFromDom() {
  const map = new Map();
  document.querySelectorAll('#appMenuBody tr[data-rotation-overtime-row]').forEach((tr) => {
    const fallbackYear = String(tr.getAttribute('data-overtime-year') || '').trim();
    const dateInput = tr.querySelector('[data-rotation-overtime-date]');
    const iso = adminRotationOvertimeCzechDateToIso(dateInput ? dateInput.value : '', fallbackYear);
    if (!iso) return;
    const toInput = tr.querySelector('[data-rotation-overtime-to]');
    const noteInput = tr.querySelector('[data-rotation-overtime-note]');
    map.set(iso, {
      date: iso,
      to: !!(toInput && toInput.checked),
      note: String(noteInput && noteInput.value || '').trim()
    });
  });
  return {
    type: ADMIN_ROTATION_OVERTIME_SETTINGS_CATEGORY,
    defaultSeedVersion: (typeof ROTATION_OVERTIME_DEFAULT_SEED_VERSION !== 'undefined' ? ROTATION_OVERTIME_DEFAULT_SEED_VERSION : 129),
    entries: Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date)),
    updatedAt: new Date().toISOString()
  };
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




function buildAdminMachineSettingsTableHtml() {
  const rows = Array.isArray(app.machineSettingsRows) ? app.machineSettingsRows : [];
  const machineRows = rows.filter(row => {
    const cat = String(row && row.category ? row.category : '').trim();
    const key = String(row && row.machine_key ? row.machine_key : '').trim();
    return cat !== 'brus'
      && cat !== 'fhb_target'
      && cat !== 'food_schedule'
      && cat !== 'vacation_countdown_settings'
      && cat !== 'admin_accounts_settings'
      && key !== 'ADMIN_ACCOUNTS_SETTINGS'
      && key !== 'VACATION_COUNTDOWN_SETTINGS'
      && cat !== ADMIN_ROTATION_OVERTIME_SETTINGS_CATEGORY
      && !(typeof rakAdminIsAccountsSettingsRow === 'function' && rakAdminIsAccountsSettingsRow(row))
      && !(typeof isRakExternalLinksSettingsRow === 'function' && isRakExternalLinksSettingsRow(row))
      && !(typeof isRakAppContactSettingsRow === 'function' && isRakAppContactSettingsRow(row))
      && !adminIsRotationGeneratorSettingsRow(row);
  });
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
    '  <div class="appMenuSubTitle">Rozpis – ' + escapeHtml(monthKey) + '</div>',
    '  <div class="appMenuText">Stejný rozpis, jen editovatelný. Změny zůstávají rozepsané lokálně a do Supabase jdou až po kliknutí na Uložit rozpis.</div>',
    '  <div class="adminRotationSaveDock">',
    '    <div class="adminRotationSaveActions">',
    '      <button type="button" class="appMenuAction adminRotationSelectedRemoveBtn" data-admin-selected-remove hidden>Odebrat vybrané</button>',
    '      <button type="button" class="appMenuAction rakOtOverviewBtn" data-daymod-overtime-overview>Přehled přesčasů</button>',
    '    </div>',
    '    <span id="adminRotationDraftStatus" class="adminRotationDraftStatus">Rozepsané změny se uloží horním tlačítkem Uložit rozpis.</span>',
    '  </div>',
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
  if (Array.isArray(app.machineSettingsRows) && typeof isRakExternalLinksSettingsRow === 'function') {
    app.machineSettingsRows.filter(isRakExternalLinksSettingsRow).forEach((row) => rows.push(row));
  }
  if (Array.isArray(app.machineSettingsRows) && typeof isRakAppContactSettingsRow === 'function') {
    app.machineSettingsRows.filter(isRakAppContactSettingsRow).forEach((row) => rows.push(row));
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
  try {
    if (app.adminRotationPendingDrafts && monthKey) delete app.adminRotationPendingDrafts[monthKey];
  } catch (err) {}
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
  softHardBlockLength: 3,
  softCore: Object.freeze(['Synek', 'Třasák', 'Střížek']),
  softBaseLathe: Object.freeze({ Synek: 'MSKC04', 'Střížek': 'MSKC03', 'Třasák': 'MSKC01' }),
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
  const generatorRules = getAdminRotationGeneratorRules();
  const targetSort = adminRotationMonthSortValue(targetMonthKey);
  const targetParsed = typeof parseMonthKey === 'function' ? parseMonthKey(targetMonthKey) : null;
  const previousYearKey = targetParsed && Number.isFinite(targetParsed.month) && Number.isFinite(targetParsed.year)
    ? (String(targetParsed.month) + '/' + String((targetParsed.year - 1) % 100).padStart(2, '0'))
    : '';
  const machineStats = { hard: [], soft: [] };
  const yearHardMachineStats = Object.create(null);
  const globalStats = Object.create(null);
  const dayTemplates = [];
  const previousYearTemplates = [];
  const previousHardMachine = Object.create(null);
  const softCoreCycle = Array.isArray(generatorRules.softHardCycle) ? generatorRules.softHardCycle : [];
  const softCoreNames = Array.isArray(generatorRules.softCore) ? generatorRules.softCore.filter((name) => knownNames.includes(name)) : [];
  const softCoreCycleState = {
    machineCursor: 0,
    personCursor: 0,
    filledInMachine: 0,
    assignedInMachineBlock: []
  };
  knownNames.forEach((name) => { globalStats[name] = 0; });

  const months = getAdminRotationMonthKeys()
    .filter((monthKey) => adminRotationMonthSortValue(monthKey) < targetSort)
    .sort((a, b) => adminRotationMonthSortValue(a) - adminRotationMonthSortValue(b));

  const addMachineStat = (sectionKey, machineIdx, name, weight) => {
    if (!machineStats[sectionKey][machineIdx]) machineStats[sectionKey][machineIdx] = Object.create(null);
    machineStats[sectionKey][machineIdx][name] = (machineStats[sectionKey][machineIdx][name] || 0) + weight;
    globalStats[name] = (globalStats[name] || 0) + weight;
  };

  const addYearHardMachineStat = (machineName, name, weight) => {
    const machine = String(machineName || '').trim().toUpperCase();
    if (!machine || !name) return;
    if (!yearHardMachineStats[machine]) yearHardMachineStats[machine] = Object.create(null);
    yearHardMachineStats[machine][name] = (yearHardMachineStats[machine][name] || 0) + Number(weight || 0);
  };

  const replaySoftCoreHardAssignment = (machineName, name) => {
    if (!softCoreCycle.length || !softCoreNames.length) return;
    const machineIdx = softCoreCycle.findIndex((machine) => String(machine || '').toUpperCase() === String(machineName || '').toUpperCase());
    const personIdx = softCoreNames.findIndex((person) => person === name);
    if (machineIdx < 0 || personIdx < 0) return;
    const cycleLength = Math.max(1, softCoreCycle.length);
    const currentIdx = ((Number(softCoreCycleState.machineCursor) || 0) % cycleLength + cycleLength) % cycleLength;
    const previousIdx = (currentIdx - 1 + cycleLength) % cycleLength;
    const blockLength = Math.max(1, Number(generatorRules.softHardBlockLength) || 3);

    // RaK 1.2 (1.155): návaznost Synka/Třasáka/Střížka se nesmí odvozovat jen z posledního dne
    // ani resetovat zpět, když je v historii po dokončeném bloku ještě extra TNKS01.
    // Procházíme celý předchozí měsíc chronologicky a zpětný "spillover" předchozího stroje ignorujeme.
    if (machineIdx !== currentIdx) {
      const looksLikePreviousMachineSpillover = machineIdx === previousIdx;
      if (looksLikePreviousMachineSpillover) return;
      softCoreCycleState.machineCursor = machineIdx;
      softCoreCycleState.filledInMachine = 0;
      softCoreCycleState.assignedInMachineBlock = [];
    }

    if (!softCoreCycleState.assignedInMachineBlock.includes(name)) softCoreCycleState.assignedInMachineBlock.push(name);
    softCoreCycleState.filledInMachine = Math.max(softCoreCycleState.filledInMachine + 1, softCoreCycleState.assignedInMachineBlock.length);
    softCoreCycleState.personCursor = (personIdx + 1) % Math.max(1, softCoreNames.length);
    const activeMachineIdx = ((Number(softCoreCycleState.machineCursor) || 0) % cycleLength + cycleLength) % cycleLength;
    if (softCoreCycleState.filledInMachine >= blockLength || softCoreCycleState.assignedInMachineBlock.length >= Math.min(blockLength, softCoreNames.length)) {
      softCoreCycleState.machineCursor = (activeMachineIdx + 1) % cycleLength;
      softCoreCycleState.filledInMachine = 0;
      softCoreCycleState.assignedInMachineBlock = [];
    }
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
      const parsedHistoryMonth = typeof parseMonthKey === 'function' ? parseMonthKey(monthKey) : null;
      const isTargetYearBeforeMonth = parsedHistoryMonth && targetParsed && Number(parsedHistoryMonth.year) === Number(targetParsed.year) && Number(parsedHistoryMonth.month) < Number(targetParsed.month);
      const splitPressForYear = isTargetYearBeforeMonth && typeof adminRotationGeneratorShouldSplitPressMachines === 'function'
        ? adminRotationGeneratorShouldSplitPressMachines(hardRow && hardRow.date, monthKey, month)
        : false;
      hardCells.forEach((name, idx) => {
        if (adminRotationIsRealName(name, knownNames)) {
          const machineName = HARD_MACHINE_HEADERS[idx] || '';
          addMachineStat('hard', idx, name, recencyWeight);
          previousHardMachine[name] = machineName || previousHardMachine[name] || '';
          replaySoftCoreHardAssignment(machineName, name);
          if (isTargetYearBeforeMonth) {
            if (splitPressForYear && /^(?:TNKS01|TPKW01)$/i.test(machineName)) {
              addYearHardMachineStat('TNKS01', name, 0.5);
              addYearHardMachineStat('TPKW01', name, 0.5);
            } else {
              addYearHardMachineStat(machineName, name, 1);
            }
          }
        }
      });
      softCells.forEach((name, idx) => { if (adminRotationIsRealName(name, knownNames)) addMachineStat('soft', idx, name, recencyWeight); });
    }
  });

  return { knownNames, machineStats, yearHardMachineStats, globalStats, dayTemplates, previousYearTemplates, previousYearKey, previousHardMachine, softCoreCycleState };
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
  const softCoreState = model && model.softCoreCycleState ? model.softCoreCycleState : {};
  const counters = {
    total: Object.create(null),
    hard: Object.create(null),
    soft: Object.create(null),
    hardMachine: Object.create(null),
    softMachine: Object.create(null),
    softKind: Object.create(null),
    hardCycleCursor: Object.create(null),
    softCoreMachineCursor: Number(softCoreState.machineCursor || 0) || 0,
    softCorePersonCursor: Number(softCoreState.personCursor || 0) || 0,
    softCoreFilledInMachine: Number(softCoreState.filledInMachine || 0) || 0,
    softCoreAssignedInMachineBlock: new Set(Array.isArray(softCoreState.assignedInMachineBlock) ? softCoreState.assignedInMachineBlock : []),
    softCoreGapPending: false,
    softCoreHardCount: Object.create(null)
  };
  const known = model && Array.isArray(model.knownNames) ? model.knownNames : adminGetKnownNames();
  const hardCycle = Array.isArray(generatorRules.hardCycle) ? generatorRules.hardCycle : [];
  known.forEach((name) => {
    counters.total[name] = 0;
    counters.hard[name] = 0;
    counters.soft[name] = 0;
    counters.softKind[name] = { lathe: 0, mill: 0 };
    counters.hardMachine[name] = Object.create(null);
    counters.softMachine[name] = Object.create(null);
    const previousMachine = model && model.previousHardMachine ? String(model.previousHardMachine[name] || '').trim().toUpperCase() : '';
    const previousIdx = hardCycle.findIndex((machine) => String(machine || '').toUpperCase() === previousMachine);
    counters.hardCycleCursor[name] = previousIdx >= 0 ? (previousIdx + 1) % Math.max(1, hardCycle.length) : 0;
    counters.softCoreHardCount[name] = 0;
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


function adminRotationGeneratorUnmarkAssignment(counters, sectionKey, machineName, name, softKind) {
  if (!name) return;
  counters.total[name] = Math.max(0, Number(counters.total[name] || 0) - 1);
  if (sectionKey === 'soft') counters.soft[name] = Math.max(0, Number(counters.soft[name] || 0) - 1);
  else counters.hard[name] = Math.max(0, Number(counters.hard[name] || 0) - 1);
  const machineMap = sectionKey === 'soft' ? counters.softMachine : counters.hardMachine;
  if (machineMap[name]) machineMap[name][machineName] = Math.max(0, Number(machineMap[name][machineName] || 0) - 1);
  if (sectionKey === 'soft' && softKind && counters.softKind[name]) counters.softKind[name][softKind] = Math.max(0, Number(counters.softKind[name][softKind] || 0) - 1);
}

function adminRotationGeneratorNextHardCycleMachine(counters, name) {
  const generatorRules = getAdminRotationGeneratorRules();
  const cycle = Array.isArray(generatorRules.hardCycle) ? generatorRules.hardCycle : [];
  if (!name || !cycle.length) return '';
  const cursor = Number(counters && counters.hardCycleCursor ? counters.hardCycleCursor[name] : 0) || 0;
  return cycle[((cursor % cycle.length) + cycle.length) % cycle.length] || '';
}

function adminRotationGeneratorAdvanceHardCycle(counters, name) {
  const generatorRules = getAdminRotationGeneratorRules();
  const cycle = Array.isArray(generatorRules.hardCycle) ? generatorRules.hardCycle : [];
  if (!name || !cycle.length) return;
  const cursor = Number(counters && counters.hardCycleCursor ? counters.hardCycleCursor[name] : 0) || 0;
  counters.hardCycleCursor[name] = (cursor + 1) % cycle.length;
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


function adminRotationGeneratorParseDayMeta(dateLabel, monthKey) {
  const parsed = typeof parseDateToken === 'function' ? parseDateToken(dateLabel) : null;
  const monthParsed = typeof parseMonthKey === 'function' ? parseMonthKey(monthKey) : null;
  const day = Number(parsed && parsed.day);
  const month = Number((parsed && parsed.month) || (monthParsed && monthParsed.month));
  const year = Number(monthParsed && monthParsed.year) || new Date().getFullYear();
  const shift = String((parsed && parsed.shift) || (String(dateLabel || '').match(/\b(R8|N8|R|N)\b/i) || [])[1] || '').toUpperCase();
  const isSunday = Number.isFinite(day) && Number.isFinite(month) && Number.isFinite(year)
    ? new Date(year, month - 1, day).getDay() === 0
    : /(?:ne|neděle|nedele)/i.test(String(dateLabel || ''));
  return { day, month, year, shift, isSunday };
}

function adminRotationGeneratorIsOvertimeSunday(dateLabel, monthKey, month) {
  const meta = adminRotationGeneratorParseDayMeta(dateLabel, monthKey);
  if (!meta.isSunday) return false;
  const baseKey = adminRotationDateBaseKey(dateLabel);
  const noteText = (Array.isArray(month && month.notes) ? month.notes : [])
    .filter((note) => adminRotationDateBaseKey(note && note.date) === baseKey)
    .map((note) => [note.person, note.code, note.text].map((part) => String(part || '')).join(' '))
    .join(' ');
  const date = Number.isFinite(meta.day) && Number.isFinite(meta.month) && Number.isFinite(meta.year)
    ? new Date(meta.year, meta.month - 1, meta.day)
    : null;
  if (date && typeof isSpecialOvertimeSundayNight === 'function' && isSpecialOvertimeSundayNight(date)) return true;
  return /přesčas|prescas|22\s*[-–]\s*6|22\s*h/i.test(String(dateLabel || '') + ' ' + noteText);
}

function adminRotationGeneratorIsMoOnlyOvertimeSunday(dateLabel, monthKey, month) {
  const meta = adminRotationGeneratorParseDayMeta(dateLabel, monthKey);
  if (!meta.isSunday) return false;
  const date = Number.isFinite(meta.day) && Number.isFinite(meta.month) && Number.isFinite(meta.year)
    ? new Date(meta.year, meta.month - 1, meta.day)
    : null;
  if (date && typeof isSpecialOvertimeSundayMoOnly === 'function' && isSpecialOvertimeSundayMoOnly(date)) return true;
  const baseKey = adminRotationDateBaseKey(dateLabel);
  const noteText = (Array.isArray(month && month.notes) ? month.notes : [])
    .filter((note) => adminRotationDateBaseKey(note && note.date) === baseKey)
    .map((note) => [note.person, note.code, note.text].map((part) => String(part || '')).join(' '))
    .join(' ');
  return /(?:jen|pouze)\s*MO|měkk(?:é|e)\s*obrábění|mekk(?:e|é)\s*obr/i.test(String(dateLabel || '') + ' ' + noteText);
}

function adminRotationGetPressRotationOverride(month, dateLabel) {
  const baseKey = adminRotationDateBaseKey(dateLabel);
  if (typeof getRotationPressRotationOverride === 'function') return getRotationPressRotationOverride(month, baseKey);
  const value = month && month.pressRotationOverrides && baseKey ? String(month.pressRotationOverrides[baseKey] || '').trim().toLowerCase() : '';
  return value === 'split' || value === 'nosplit' ? value : '';
}

function adminRotationGeneratorShouldSplitPressMachines(dateLabel, monthKey, month) {
  const manual = adminRotationGetPressRotationOverride(month, dateLabel);
  if (manual === 'split') return true;
  if (manual === 'nosplit') return false;
  const meta = adminRotationGeneratorParseDayMeta(dateLabel, monthKey);
  if (!meta.isSunday) return true;
  if (adminRotationGeneratorIsMoOnlyOvertimeSunday(dateLabel, monthKey, month)) return false;
  return adminRotationGeneratorIsOvertimeSunday(dateLabel, monthKey, month);
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

function adminRotationGeneratorAddMachineCount(machineMap, machineName, person, value) {
  const name = String(person || '').trim();
  const machine = String(machineName || '').trim();
  if (!name || !machine) return;
  if (!machineMap.has(machine)) machineMap.set(machine, new Map());
  const rowMap = machineMap.get(machine);
  rowMap.set(name, Number(rowMap.get(name) || 0) + Number(value || 0));
}

function adminRotationGeneratorFormatCount(value) {
  const n = Math.round((Number(value) || 0) * 10) / 10;
  if (!n) return '';
  return String(n).replace('.', ',');
}

function adminRotationGeneratorGetSoftCoreNames(knownNames) {
  const known = Array.isArray(knownNames) ? knownNames : adminGetKnownNames();
  const generatorRules = getAdminRotationGeneratorRules();
  return generatorRules.softCore.filter((name) => known.includes(name));
}

function adminRotationGeneratorSoftCoreStateInfo(counters, knownNames) {
  const generatorRules = getAdminRotationGeneratorRules();
  const cycle = Array.isArray(generatorRules.softHardCycle) ? generatorRules.softHardCycle : [];
  const core = adminRotationGeneratorGetSoftCoreNames(knownNames);
  const blockLength = Math.max(1, Number(generatorRules.softHardBlockLength) || 3);
  const machineCursor = ((Number(counters && counters.softCoreMachineCursor || 0) % Math.max(1, cycle.length)) + Math.max(1, cycle.length)) % Math.max(1, cycle.length);
  const personCursor = ((Number(counters && counters.softCorePersonCursor || 0) % Math.max(1, core.length)) + Math.max(1, core.length)) % Math.max(1, core.length);
  const assigned = counters && counters.softCoreAssignedInMachineBlock instanceof Set
    ? counters.softCoreAssignedInMachineBlock
    : new Set();
  return {
    cycle,
    core,
    blockLength,
    machineCursor,
    personCursor,
    machine: cycle[machineCursor] || cycle[0] || 'TNKS01',
    assigned
  };
}

function adminRotationGeneratorSoftCoreFutureAvailability(month, knownNames, rowIdx, candidate, blockInfo) {
  const hardRows = Array.isArray(month && month.hard && month.hard.rows) ? month.hard.rows : [];
  const softRows = Array.isArray(month && month.soft && month.soft.rows) ? month.soft.rows : [];
  let score = 0;
  const scanEnd = Math.min(Math.max(hardRows.length, softRows.length) - 1, Number(rowIdx || 0) + Math.max(1, Number(blockInfo && blockInfo.blockLength) || 3));
  for (let i = rowIdx + 1; i <= scanEnd; i += 1) {
    const row = hardRows[i] || softRows[i] || null;
    const dateLabel = row && row.date ? row.date : '';
    if (!dateLabel) continue;
    const dayNotes = adminRotationGeneratorDateNotes(month, dateLabel);
    if (adminRotationGeneratorIsDayBlocked(dayNotes)) continue;
    const absenceNames = adminRotationNamesForAbsenceDate(month.notes, dateLabel, knownNames);
    if (!absenceNames.has(candidate)) score += 1;
  }
  return score;
}

function adminRotationGeneratorShouldGapSoftCore(counters, knownNames) {
  const core = adminRotationGeneratorGetSoftCoreNames(knownNames);
  if (!core.length) return false;
  const counts = core.map((name) => Number(counters && counters.softCoreHardCount ? counters.softCoreHardCount[name] || 0 : 0));
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  // Mezera je jen pojistka: když se kvůli návaznosti měsíce dostane někdo o jeden blok napřed,
  // další pracovní den zůstane trojice na Měkotě a cyklus pokračuje až potom.
  return max >= 2 && max - min >= 1;
}

function adminRotationGeneratorAdvanceSoftCoreCycle(counters, knownNames, name, machineName) {
  if (!counters) return;
  const info = adminRotationGeneratorSoftCoreStateInfo(counters, knownNames);
  if (!info.core.includes(name)) return;
  const machineIdx = info.cycle.findIndex((machine) => String(machine || '').toUpperCase() === String(machineName || '').toUpperCase());
  if (machineIdx >= 0) counters.softCoreMachineCursor = machineIdx;
  counters.softCoreAssignedInMachineBlock.add(name);
  counters.softCoreFilledInMachine = Math.max(Number(counters.softCoreFilledInMachine || 0) + 1, counters.softCoreAssignedInMachineBlock.size);
  counters.softCoreHardCount[name] = Number(counters.softCoreHardCount[name] || 0) + 1;
  const personIdx = info.core.findIndex((person) => person === name);
  if (personIdx >= 0) counters.softCorePersonCursor = (personIdx + 1) % Math.max(1, info.core.length);
  if (counters.softCoreFilledInMachine >= info.blockLength || counters.softCoreAssignedInMachineBlock.size >= Math.min(info.blockLength, info.core.length)) {
    counters.softCoreMachineCursor = (Number(counters.softCoreMachineCursor || 0) + 1) % Math.max(1, info.cycle.length);
    counters.softCoreFilledInMachine = 0;
    counters.softCoreAssignedInMachineBlock = new Set();
    counters.softCoreGapPending = adminRotationGeneratorShouldGapSoftCore(counters, knownNames);
  }
}

function adminRotationGeneratorPickSoftCoreForHard(month, knownNames, rowIdx, machineIdx, available, usedNames, counters, monthKey) {
  const info = adminRotationGeneratorSoftCoreStateInfo(counters, knownNames);
  const core = info.core;
  const machineName = HARD_MACHINE_HEADERS[machineIdx] || '';
  if (!core.length || String(machineName || '').toUpperCase() !== String(info.machine || '').toUpperCase()) return '';
  const orderedCore = core.slice(info.personCursor).concat(core.slice(0, info.personCursor));
  const candidates = orderedCore.filter((name) => available.includes(name) && !usedNames.has(name) && !info.assigned.has(name)
    && adminRotationGeneratorCanUseHardMachine(month, rowIdx, machineName, name, knownNames, monthKey));
  if (!candidates.length) return '';
  const minMonthly = Math.min(...core.map((name) => Number(counters.softCoreHardCount[name] || 0)));
  const safeCandidates = candidates.filter((name) => Number(counters.softCoreHardCount[name] || 0) <= minMonthly + 1);
  const list = safeCandidates.length ? safeCandidates : candidates;
  const ordered = list.slice().sort((a, b) => {
    const countDiff = Number(counters.softCoreHardCount[a] || 0) - Number(counters.softCoreHardCount[b] || 0);
    if (countDiff) return countDiff;
    const cursorDiff = orderedCore.indexOf(a) - orderedCore.indexOf(b);
    if (cursorDiff) return cursorDiff;
    const futureDiff = adminRotationGeneratorSoftCoreFutureAvailability(month, knownNames, rowIdx, a, info) - adminRotationGeneratorSoftCoreFutureAvailability(month, knownNames, rowIdx, b, info);
    if (futureDiff) return futureDiff;
    return a.localeCompare(b, 'cs');
  });
  return ordered[0] || '';
}

function adminRotationGeneratorBaseLathePerson(machineName, knownNames, available, usedNames) {
  const generatorRules = getAdminRotationGeneratorRules();
  const map = generatorRules.softBaseLathe || {};
  const wantedEntry = Object.entries(map).find((entry) => String(entry[1] || '').toUpperCase() === String(machineName || '').toUpperCase());
  const person = wantedEntry ? adminRotationCanonicalName(wantedEntry[0], knownNames) : '';
  return person && knownNames.includes(person) && available.includes(person) && !usedNames.has(person) ? person : '';
}

function adminRotationGeneratorBuildDay(month, model, counters, rowIdx, dateLabel, blockedNames, monthKey) {
  const knownNames = model.knownNames;
  const generatorRules = getAdminRotationGeneratorRules();
  const softPreferred = generatorRules.softPreferred.filter((name) => knownNames.includes(name));
  const hardPreferred = generatorRules.hardPreferred.filter((name) => knownNames.includes(name));
  const available = knownNames.filter((name) => !blockedNames.has(name));
  const usedNames = new Set();
  const forcedSoft = new Set();
  const hardCells = Array(HARD_MACHINE_HEADERS.length).fill('');
  const softCells = Array(SOFT_MACHINE_HEADERS.length).fill('');
  const hardTargetCount = Math.min(HARD_MACHINE_HEADERS.length, available.length);
  const softTargetCount = Math.max(0, Math.min(SOFT_MACHINE_HEADERS.length, available.length - hardTargetCount));

  if (!available.length) return { hardCells, softCells, filledCells: 0, emptyProtected: 0 };

  const assignHardCell = (machineIdx, name, reason) => {
    const machineName = HARD_MACHINE_HEADERS[machineIdx] || '';
    if (machineIdx < 0 || !machineName || !name || usedNames.has(name) || !available.includes(name) || hardCells[machineIdx]) return false;
    if (!adminRotationGeneratorCanUseHardMachine(month, rowIdx, machineName, name, knownNames, monthKey)) return false;
    hardCells[machineIdx] = name;
    usedNames.add(name);
    adminRotationGeneratorMarkAssignment(counters, 'hard', machineName, name);
    if (reason === 'hard-cycle') adminRotationGeneratorAdvanceHardCycle(counters, name);
    if (reason === 'soft-core-hard-block') adminRotationGeneratorAdvanceSoftCoreCycle(counters, knownNames, name, machineName);
    return true;
  };

  const assignSoftCell = (machineIdx, name, reason) => {
    const machineName = SOFT_MACHINE_HEADERS[machineIdx] || '';
    if (machineIdx < 0 || !machineName || !name || usedNames.has(name) || !available.includes(name) || softCells[machineIdx]) return false;
    const kind = adminRotationGeneratorSoftKind(machineName);
    softCells[machineIdx] = name;
    usedNames.add(name);
    adminRotationGeneratorMarkAssignment(counters, 'soft', machineName, name, kind);
    return true;
  };

  // 1) Nejdřív rozepiš základ Tvrdoty podle návazné rotace z minulého měsíce:
  // TBKR01 → TNKS01 → TBKR07 → TPKW01 → TPKW02.
  hardPreferred.filter((name) => available.includes(name)).forEach((name) => {
    if (usedNames.size >= hardTargetCount) return;
    const wantedMachine = adminRotationGeneratorNextHardCycleMachine(counters, name);
    const wantedIdx = adminRotationGeneratorMachineIndex(HARD_MACHINE_HEADERS, wantedMachine);
    if (assignHardCell(wantedIdx, name, 'hard-cycle')) return;
    const cycle = Array.isArray(generatorRules.hardCycle) ? generatorRules.hardCycle : [];
    for (const machine of cycle) {
      const idx = adminRotationGeneratorMachineIndex(HARD_MACHINE_HEADERS, machine);
      if (assignHardCell(idx, name, 'hard-cycle')) return;
    }
  });

  // 2) Pak přesuň jednoho ze základu Měkoty na tvrdotní stroj v 3denním bloku.
  // Když někdo z nich později chybí, pořadí se smí prohodit, aby se tomu nevyhnul.
  const softCoreBlock = adminRotationGeneratorSoftCoreStateInfo(counters, knownNames);
  const cycleMachine = softCoreBlock.machine;
  const cycleIdx = adminRotationGeneratorMachineIndex(HARD_MACHINE_HEADERS, cycleMachine);
  let exchangeSoft = '';
  if (counters.softCoreGapPending) {
    counters.softCoreGapPending = false;
  } else {
    exchangeSoft = cycleIdx >= 0 && hardTargetCount > 0
      ? adminRotationGeneratorPickSoftCoreForHard(month, knownNames, rowIdx, cycleIdx, available, usedNames, counters, monthKey)
      : '';
  }
  const displacedToSoft = [];
  if (exchangeSoft && cycleIdx >= 0 && available.includes(exchangeSoft) && !usedNames.has(exchangeSoft)) {
    const displaced = adminRotationCanonicalName(hardCells[cycleIdx], knownNames);
    if (displaced) {
      adminRotationGeneratorUnmarkAssignment(counters, 'hard', HARD_MACHINE_HEADERS[cycleIdx] || '', displaced);
      usedNames.delete(displaced);
      forcedSoft.add(displaced);
      displacedToSoft.push(displaced);
    }
    hardCells[cycleIdx] = '';
    assignHardCell(cycleIdx, exchangeSoft, 'soft-core-hard-block');
  }

  const filterHardCandidates = (machineName, candidates) => Array.from(new Set(Array.isArray(candidates) ? candidates : []))
    .filter((name) => adminRotationGeneratorCanUseHardMachine(month, rowIdx, machineName, name, knownNames, monthKey));

  // 3) Doplnění zbytku Tvrdoty až po základním rozepsání a výměně.
  HARD_MACHINE_HEADERS.forEach((machineName, machineIdx) => {
    if (hardCells[machineIdx] || hardCells.filter((cell) => String(cell || '').trim()).length >= hardTargetCount) return;
    const historicalCandidates = (model.dayTemplates[rowIdx % model.dayTemplates.length] && model.dayTemplates[rowIdx % model.dayTemplates.length].hardCells) || [];
    const suggested = adminRotationCanonicalName(historicalCandidates[machineIdx] || '', knownNames);
    const preferred = hardPreferred.filter((name) => available.includes(name) && !forcedSoft.has(name));
    const balancing = ['Špadrna', 'Novotný'].map((name) => adminRotationCanonicalName(name, knownNames)).filter((name) => available.includes(name) && !forcedSoft.has(name));
    const fallback = available.filter((name) => !softPreferred.includes(name) && !forcedSoft.has(name))
      .concat(balancing, available.filter((name) => softPreferred.includes(name) && !forcedSoft.has(name)));
    const ordered = filterHardCandidates(machineName, (suggested ? [suggested] : []).concat(preferred, fallback)).filter((name) => available.includes(name));
    const name = adminRotationGeneratorPickName(ordered, usedNames, counters, {
      sectionKey: 'hard',
      machineName,
      rowIdx,
      preferred: hardPreferred,
      avoid: softPreferred,
      historical: adminRotationGeneratorHistoricalMachineScore(model, 'hard', machineIdx, suggested || '')
    });
    if (name) assignHardCell(machineIdx, name, hardPreferred.includes(name) ? 'hard-cycle' : 'hard-fill');
  });

  const softSlots = adminRotationGeneratorSoftSlotPlan(Math.min(softTargetCount, available.filter((name) => !usedNames.has(name)).length));
  const hasSoftSlot = (machineName) => softSlots.includes(adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, machineName));

  // 4) Základ Měkoty: Třasák/MSKC01, Střížek/MSKC03, Synek/MSKC04, pokud jsou dostupní a nejsou zrovna na Tvrdotě.
  ['MSKC01', 'MSKC03', 'MSKC04'].forEach((machineName) => {
    const idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, machineName);
    if (!hasSoftSlot(machineName) || softCells[idx]) return;
    const base = adminRotationGeneratorBaseLathePerson(machineName, knownNames, available, usedNames);
    if (base) assignSoftCell(idx, base, 'soft-base-lathe');
  });

  // 5) Člověk vytlačený z Tvrdoty člověkem z Měkoty jde přednostně na frézky.
  ['MFKF10', 'MFKF06'].forEach((machineName) => {
    const idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, machineName);
    if (!hasSoftSlot(machineName) || softCells[idx]) return;
    const name = displacedToSoft.find((person) => available.includes(person) && !usedNames.has(person));
    if (name) assignSoftCell(idx, name, 'hard-displaced-to-mill');
  });

  // 6) Špadrna a Novotný pomáhají vyrovnat Tvrdotu; zbytek dnů jdou hlavně na frézky/Měkotu.
  softSlots.forEach((machineIdx) => {
    if (softCells[machineIdx]) return;
    const machineName = SOFT_MACHINE_HEADERS[machineIdx] || '';
    const kind = adminRotationGeneratorSoftKind(machineName);
    const remainingNow = available.filter((name) => !usedNames.has(name));
    const baseLathe = kind === 'lathe' ? adminRotationGeneratorBaseLathePerson(machineName, knownNames, available, usedNames) : '';
    const flexSoft = ['Špadrna', 'Novotný'].map((name) => adminRotationCanonicalName(name, knownNames)).filter((name) => remainingNow.includes(name));
    const preferred = kind === 'mill'
      ? displacedToSoft.concat(flexSoft, remainingNow.filter((name) => !softPreferred.includes(name)), remainingNow.filter((name) => softPreferred.includes(name)))
      : (baseLathe ? [baseLathe] : []).concat(remainingNow.filter((name) => softPreferred.includes(name)), flexSoft, remainingNow.filter((name) => !softPreferred.includes(name)));
    const name = adminRotationGeneratorPickName(Array.from(new Set(preferred)), usedNames, counters, {
      sectionKey: 'soft',
      machineName,
      rowIdx,
      softKind: kind,
      preferred: kind === 'lathe' ? softPreferred : hardPreferred,
      historical: adminRotationGeneratorHistoricalMachineScore(model, 'soft', machineIdx, preferred[0] || '')
    });
    if (name) assignSoftCell(machineIdx, name, 'soft-fill');
  });

  const mfkf06Idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MFKF06');
  const mfkf10Idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MFKF10');
  const mskc01Idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MSKC01');
  const millPeopleCount = [mfkf06Idx, mfkf10Idx].filter((idx) => idx >= 0 && String(softCells[idx] || '').trim()).length;
  const lathePeopleCount = [mskc01Idx, adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MSKC03'), adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MSKC04')].filter((idx) => idx >= 0 && String(softCells[idx] || '').trim()).length;
  let emptyProtected = 0;
  if (millPeopleCount === 1 && mfkf06Idx >= 0) {
    const removed = adminRotationCanonicalName(softCells[mfkf06Idx], knownNames);
    if (removed) adminRotationGeneratorUnmarkAssignment(counters, 'soft', 'MFKF06', removed, 'mill');
    softCells[mfkf06Idx] = '';
    emptyProtected += 1;
  }
  if (softTargetCount === 3 && lathePeopleCount === 2 && mskc01Idx >= 0) {
    const removed = adminRotationCanonicalName(softCells[mskc01Idx], knownNames);
    if (removed) adminRotationGeneratorUnmarkAssignment(counters, 'soft', 'MSKC01', removed, 'lathe');
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

function adminRotationGeneratorCollectWorkingNames(month, knownNames) {
  const working = new Set();
  const names = Array.isArray(knownNames) ? knownNames : adminGetKnownNames();
  const addRows = (sectionKey) => {
    const section = month && month[sectionKey] ? month[sectionKey] : null;
    const rows = Array.isArray(section && section.rows) ? section.rows : [];
    rows.forEach((row) => {
      (Array.isArray(row && row.cells) ? row.cells : []).forEach((cell) => {
        const name = adminRotationCanonicalName(cell, names);
        if (name && names.includes(name)) working.add(name);
      });
    });
  };
  addRows('hard');
  addRows('soft');
  return Array.from(working);
}

function adminRotationGeneratorCountHardMachine(month, machineName, names, monthKey) {
  const result = Object.create(null);
  const list = Array.isArray(names) ? names : adminGetKnownNames();
  list.forEach((name) => { result[name] = 0; });
  const wanted = String(machineName || '').toUpperCase();
  const tnksIdx = adminRotationGeneratorMachineIndex(HARD_MACHINE_HEADERS, 'TNKS01');
  const tpkw01Idx = adminRotationGeneratorMachineIndex(HARD_MACHINE_HEADERS, 'TPKW01');
  const machineIdx = adminRotationGeneratorMachineIndex(HARD_MACHINE_HEADERS, machineName);
  const rows = Array.isArray(month && month.hard && month.hard.rows) ? month.hard.rows : [];
  if (machineIdx < 0) return result;
  rows.forEach((row) => {
    const splitPress = adminRotationGeneratorShouldSplitPressMachines(row && row.date, monthKey, month);
    if ((wanted === 'TNKS01' || wanted === 'TPKW01') && splitPress && tnksIdx >= 0 && tpkw01Idx >= 0) {
      [tnksIdx, tpkw01Idx].forEach((idx) => {
        const name = adminRotationCanonicalName(row && row.cells ? row.cells[idx] : '', list);
        if (name && Object.prototype.hasOwnProperty.call(result, name)) result[name] += 0.5;
      });
      return;
    }
    const name = adminRotationCanonicalName(row && row.cells ? row.cells[machineIdx] : '', list);
    if (name && Object.prototype.hasOwnProperty.call(result, name)) result[name] += 1;
  });
  return result;
}

function adminRotationGeneratorPressYearBalanceExcludedNames(knownNames) {
  const names = Array.isArray(knownNames) ? knownNames : adminGetKnownNames();
  return ['Střížek', 'Synek', 'Třasák']
    .map((name) => adminRotationCanonicalName(name, names))
    .filter(Boolean);
}

function adminRotationGeneratorIsPressYearBalanceExcluded(name, knownNames) {
  const canonical = adminRotationCanonicalName(name, Array.isArray(knownNames) ? knownNames : adminGetKnownNames());
  if (!canonical) return false;
  return adminRotationGeneratorPressYearBalanceExcludedNames(knownNames).includes(canonical);
}

function adminRotationGeneratorHardMachinePersonAt(month, rowIdx, machineName, knownNames) {
  const rows = Array.isArray(month && month.hard && month.hard.rows) ? month.hard.rows : [];
  const row = rows[rowIdx] || null;
  const idx = adminRotationGeneratorMachineIndex(HARD_MACHINE_HEADERS, machineName);
  if (!row || idx < 0) return '';
  return adminRotationCanonicalName(row && row.cells ? row.cells[idx] : '', Array.isArray(knownNames) ? knownNames : adminGetKnownNames());
}

function adminRotationGeneratorIsPressMachine(machineName) {
  return /^(?:TNKS01|TPKW01)$/i.test(String(machineName || '').trim());
}

function adminRotationGeneratorRowShouldSplitPress(month, rowIdx, monthKey) {
  const hardRows = Array.isArray(month && month.hard && month.hard.rows) ? month.hard.rows : [];
  const softRows = Array.isArray(month && month.soft && month.soft.rows) ? month.soft.rows : [];
  const row = hardRows[rowIdx] || softRows[rowIdx] || null;
  const dateLabel = String(row && row.date || '').trim();
  if (!dateLabel) return false;
  return !!adminRotationGeneratorShouldSplitPressMachines(dateLabel, monthKey, month);
}

function adminRotationGeneratorPersonHasTnksWorkOnRow(month, rowIdx, person, knownNames, monthKey) {
  const name = adminRotationCanonicalName(person, Array.isArray(knownNames) ? knownNames : adminGetKnownNames());
  if (!name) return false;
  if (adminRotationGeneratorHardMachinePersonAt(month, rowIdx, 'TNKS01', knownNames) === name) return true;
  if (!adminRotationGeneratorRowShouldSplitPress(month, rowIdx, monthKey)) return false;
  return adminRotationGeneratorHardMachinePersonAt(month, rowIdx, 'TPKW01', knownNames) === name;
}

function adminRotationGeneratorWouldBreakConsecutiveTnks(month, rowIdx, person, knownNames, monthKey) {
  const name = adminRotationCanonicalName(person, Array.isArray(knownNames) ? knownNames : adminGetKnownNames());
  if (!name) return false;
  return adminRotationGeneratorPersonHasTnksWorkOnRow(month, Number(rowIdx) - 1, name, knownNames, monthKey)
    || adminRotationGeneratorPersonHasTnksWorkOnRow(month, Number(rowIdx) + 1, name, knownNames, monthKey);
}

function adminRotationGeneratorCanUseHardMachine(month, rowIdx, machineName, person, knownNames, monthKey) {
  const machine = String(machineName || '').trim().toUpperCase();
  const countsAsTnks = machine === 'TNKS01' || (machine === 'TPKW01' && adminRotationGeneratorRowShouldSplitPress(month, rowIdx, monthKey));
  if (!countsAsTnks) return true;
  return !adminRotationGeneratorWouldBreakConsecutiveTnks(month, rowIdx, person, knownNames, monthKey);
}


function adminRotationGeneratorFindPersonCellOnDay(month, rowIdx, person, preferredSection) {
  const wanted = String(person || '').trim();
  if (!wanted) return null;
  const scan = (sectionKey, machines) => {
    const section = month && month[sectionKey] ? month[sectionKey] : null;
    const row = section && Array.isArray(section.rows) ? section.rows[rowIdx] : null;
    const cells = Array.isArray(row && row.cells) ? row.cells : [];
    for (let idx = 0; idx < cells.length; idx += 1) {
      const cellName = String(cells[idx] || '').trim();
      if (cellName === wanted) return { sectionKey, row, cells, idx, machine: machines[idx] || '' };
    }
    return null;
  };
  if (preferredSection === 'soft') {
    return scan('soft', SOFT_MACHINE_HEADERS) || scan('hard', HARD_MACHINE_HEADERS);
  }
  if (preferredSection === 'hard') {
    return scan('hard', HARD_MACHINE_HEADERS) || scan('soft', SOFT_MACHINE_HEADERS);
  }
  return scan('soft', SOFT_MACHINE_HEADERS) || scan('hard', HARD_MACHINE_HEADERS);
}

function adminRotationGeneratorCountSoloMill(month, names) {
  const result = Object.create(null);
  const list = Array.isArray(names) ? names : adminGetKnownNames();
  list.forEach((name) => { result[name] = 0; });
  const mfkf06Idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MFKF06');
  const mfkf10Idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MFKF10');
  const rows = Array.isArray(month && month.soft && month.soft.rows) ? month.soft.rows : [];
  if (mfkf06Idx < 0 || mfkf10Idx < 0) return result;
  rows.forEach((row) => {
    const cells = Array.isArray(row && row.cells) ? row.cells : [];
    const mfkf06 = adminRotationCanonicalName(cells[mfkf06Idx], list);
    const mfkf10 = adminRotationCanonicalName(cells[mfkf10Idx], list);
    if (!mfkf06 && mfkf10 && Object.prototype.hasOwnProperty.call(result, mfkf10)) result[mfkf10] += 1;
  });
  return result;
}

function adminRotationGeneratorFindSoloMillSwapCell(month, rowIdx, lowName) {
  const wanted = String(lowName || '').trim();
  if (!wanted) return null;
  const mfkf06Idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MFKF06');
  const mfkf10Idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MFKF10');
  const softRow = month && month.soft && Array.isArray(month.soft.rows) ? month.soft.rows[rowIdx] : null;
  const hardRow = month && month.hard && Array.isArray(month.hard.rows) ? month.hard.rows[rowIdx] : null;
  const softCells = Array.isArray(softRow && softRow.cells) ? softRow.cells : [];
  const hardCells = Array.isArray(hardRow && hardRow.cells) ? hardRow.cells : [];
  const scanSoft = () => {
    for (let idx = 0; idx < softCells.length; idx += 1) {
      if (idx === mfkf06Idx || idx === mfkf10Idx) continue;
      if (String(softCells[idx] || '').trim() === wanted) return { sectionKey: 'soft', row: softRow, cells: softCells, idx, machine: SOFT_MACHINE_HEADERS[idx] || '' };
    }
    return null;
  };
  const scanHard = (avoidPress) => {
    for (let idx = 0; idx < hardCells.length; idx += 1) {
      const machine = HARD_MACHINE_HEADERS[idx] || '';
      if (avoidPress && /^(?:TNKS01|TPKW01)$/i.test(machine)) continue;
      if (String(hardCells[idx] || '').trim() === wanted) return { sectionKey: 'hard', row: hardRow, cells: hardCells, idx, machine };
    }
    return null;
  };
  return scanSoft() || scanHard(true) || scanHard(false);
}

function adminRotationGeneratorBalanceSoloMill(month, model) {
  const knownNames = model && Array.isArray(model.knownNames) ? model.knownNames : adminGetKnownNames();
  const workingNames = adminRotationGeneratorCollectWorkingNames(month, knownNames).filter((name) => knownNames.includes(name));
  const mfkf06Idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MFKF06');
  const mfkf10Idx = adminRotationGeneratorMachineIndex(SOFT_MACHINE_HEADERS, 'MFKF10');
  const softRows = Array.isArray(month && month.soft && month.soft.rows) ? month.soft.rows : [];
  if (mfkf06Idx < 0 || mfkf10Idx < 0 || !workingNames.length || !softRows.length) return { swaps: 0, counts: Object.create(null) };
  let counts = adminRotationGeneratorCountSoloMill(month, workingNames);
  let swaps = 0;
  const maxPasses = softRows.length * 2;
  for (let pass = 0; pass < maxPasses; pass += 1) {
    const highNames = workingNames.slice().sort((a, b) => Number(counts[b] || 0) - Number(counts[a] || 0));
    const lowNames = workingNames.slice().sort((a, b) => Number(counts[a] || 0) - Number(counts[b] || 0));
    const highName = highNames[0];
    if (!highName || Number(counts[highName] || 0) <= 1) break;
    let didSwap = false;
    for (const lowName of lowNames) {
      if (!lowName || lowName === highName) continue;
      if (Number(counts[highName] || 0) - Number(counts[lowName] || 0) <= 1) break;
      for (let rowIdx = 0; rowIdx < softRows.length; rowIdx += 1) {
        const softRow = softRows[rowIdx];
        const cells = Array.isArray(softRow && softRow.cells) ? softRow.cells : [];
        const mfkf06 = adminRotationCanonicalName(cells[mfkf06Idx], knownNames);
        const mfkf10 = adminRotationCanonicalName(cells[mfkf10Idx], knownNames);
        if (mfkf06 || mfkf10 !== highName) continue;
        const lowCell = adminRotationGeneratorFindSoloMillSwapCell(month, rowIdx, lowName);
        if (!lowCell || !lowCell.cells) continue;
        lowCell.cells[lowCell.idx] = highName;
        cells[mfkf10Idx] = lowName;
        counts[highName] = Number(counts[highName] || 0) - 1;
        counts[lowName] = Number(counts[lowName] || 0) + 1;
        swaps += 1;
        didSwap = true;
        break;
      }
      if (didSwap) break;
    }
    if (!didSwap) break;
  }
  return { swaps, counts };
}


function adminRotationGeneratorCountSoftKinds(month, names) {
  const result = Object.create(null);
  const list = Array.isArray(names) ? names : adminGetKnownNames();
  list.forEach((name) => { result[name] = { mill: 0, lathe: 0 }; });
  const rows = Array.isArray(month && month.soft && month.soft.rows) ? month.soft.rows : [];
  rows.forEach((row) => {
    const cells = Array.isArray(row && row.cells) ? row.cells : [];
    SOFT_MACHINE_HEADERS.forEach((machineName, idx) => {
      const name = adminRotationCanonicalName(cells[idx], list);
      if (!name || !Object.prototype.hasOwnProperty.call(result, name)) return;
      const kind = adminRotationGeneratorSoftKind(machineName);
      if (kind === 'mill') result[name].mill += 1;
      else result[name].lathe += 1;
    });
  });
  return result;
}

function adminRotationGeneratorFindSoftKindCellOnDay(month, rowIdx, person, wantedKind) {
  const knownNames = adminGetKnownNames();
  const wanted = adminRotationCanonicalName(person, knownNames);
  const kind = String(wantedKind || '').trim();
  if (!wanted || !kind) return null;
  const row = month && month.soft && Array.isArray(month.soft.rows) ? month.soft.rows[rowIdx] : null;
  const cells = Array.isArray(row && row.cells) ? row.cells : [];
  for (let idx = 0; idx < cells.length; idx += 1) {
    const name = adminRotationCanonicalName(cells[idx], knownNames);
    if (name === wanted && adminRotationGeneratorSoftKind(SOFT_MACHINE_HEADERS[idx] || '') === kind) {
      return { sectionKey: 'soft', row, cells, idx, machine: SOFT_MACHINE_HEADERS[idx] || '' };
    }
  }
  return null;
}

function adminRotationGeneratorBalanceSoftKind(month, model) {
  const knownNames = model && Array.isArray(model.knownNames) ? model.knownNames : adminGetKnownNames();
  const workingNames = adminRotationGeneratorCollectWorkingNames(month, knownNames).filter((name) => knownNames.includes(name));
  const softRows = Array.isArray(month && month.soft && month.soft.rows) ? month.soft.rows : [];
  if (!workingNames.length || !softRows.length) return { swaps: 0, counts: Object.create(null) };
  let counts = adminRotationGeneratorCountSoftKinds(month, workingNames);
  let swaps = 0;
  const maxPasses = softRows.length * 4;
  const scoreMillHeavy = (name) => Number((counts[name] && counts[name].mill) || 0) - Number((counts[name] && counts[name].lathe) || 0);
  const scoreLatheHeavy = (name) => Number((counts[name] && counts[name].lathe) || 0) - Number((counts[name] && counts[name].mill) || 0);

  for (let pass = 0; pass < maxPasses; pass += 1) {
    const millHeavy = workingNames.slice().sort((a, b) => scoreMillHeavy(b) - scoreMillHeavy(a))[0];
    const latheHeavy = workingNames.slice().sort((a, b) => scoreLatheHeavy(b) - scoreLatheHeavy(a))[0];
    if (!millHeavy || !latheHeavy || millHeavy === latheHeavy) break;
    if (scoreMillHeavy(millHeavy) <= 1 || scoreLatheHeavy(latheHeavy) <= 1) break;
    let didSwap = false;
    for (let rowIdx = 0; rowIdx < softRows.length; rowIdx += 1) {
      const millCell = adminRotationGeneratorFindSoftKindCellOnDay(month, rowIdx, millHeavy, 'mill');
      const latheCell = adminRotationGeneratorFindSoftKindCellOnDay(month, rowIdx, latheHeavy, 'lathe');
      if (!millCell || !latheCell || !millCell.cells || !latheCell.cells) continue;
      millCell.cells[millCell.idx] = latheHeavy;
      latheCell.cells[latheCell.idx] = millHeavy;
      swaps += 1;
      counts = adminRotationGeneratorCountSoftKinds(month, workingNames);
      didSwap = true;
      break;
    }
    if (!didSwap) break;
  }
  return { swaps, counts };
}

function adminRotationGeneratorBalanceHardMachine(month, machineName, model, monthKey) {
  const knownNames = model && Array.isArray(model.knownNames) ? model.knownNames : adminGetKnownNames();
  const generatorRules = getAdminRotationGeneratorRules();
  const hardPreferred = generatorRules.hardPreferred.filter((name) => knownNames.includes(name));
  const isPressBalance = /^(?:TNKS01|TPKW01)$/i.test(String(machineName || ''));
  const softCoreNoTnksBalance = generatorRules.softCoreNoTnksBalance || [];
  const workingNames = adminRotationGeneratorCollectWorkingNames(month, knownNames)
    .filter((name) => knownNames.includes(name))
    .filter((name) => !(isPressBalance && softCoreNoTnksBalance.includes(name)));
  const machineIdx = adminRotationGeneratorMachineIndex(HARD_MACHINE_HEADERS, machineName);
  const tnksIdx = adminRotationGeneratorMachineIndex(HARD_MACHINE_HEADERS, 'TNKS01');
  const tpkw01Idx = adminRotationGeneratorMachineIndex(HARD_MACHINE_HEADERS, 'TPKW01');
  const machineYearKey = String(machineName || '').trim().toUpperCase();
  const yearCounts = model && model.yearHardMachineStats && model.yearHardMachineStats[machineYearKey] ? model.yearHardMachineStats[machineYearKey] : Object.create(null);
  const hardRows = Array.isArray(month && month.hard && month.hard.rows) ? month.hard.rows : [];
  if (machineIdx < 0 || !workingNames.length || !hardRows.length) return { swaps: 0, counts: Object.create(null) };

  let counts = adminRotationGeneratorCountHardMachine(month, machineName, workingNames, monthKey);
  let swaps = 0;
  const maxPasses = hardRows.length * 4;
  const allowedDiff = isPressBalance ? 0.5 : 1;

  const currentCount = (name) => Number(counts[name] || 0);
  const yearCount = (name) => Number(yearCounts[name] || 0);
  const combinedCount = (name) => currentCount(name) + yearCount(name);
  const pressYearEligibleNames = () => workingNames.filter((name) => !adminRotationGeneratorIsPressYearBalanceExcluded(name, knownNames));
  const averageYearCount = (names) => {
    const list = Array.isArray(names) && names.length ? names : workingNames;
    if (!list.length) return 0;
    return list.reduce((sum, name) => sum + yearCount(name), 0) / list.length;
  };
  const sortByMonthHigh = () => workingNames.slice().sort((a, b) => {
    const monthDiff = currentCount(b) - currentCount(a);
    if (monthDiff) return monthDiff;
    const yearDiff = yearCount(b) - yearCount(a);
    if (yearDiff) return yearDiff;
    return a.localeCompare(b, 'cs');
  });
  const sortByMonthLow = () => workingNames.slice().sort((a, b) => {
    const monthDiff = currentCount(a) - currentCount(b);
    if (monthDiff) return monthDiff;
    const yearDiff = yearCount(a) - yearCount(b);
    if (yearDiff) return yearDiff;
    const pref = (hardPreferred.includes(b) ? 1 : 0) - (hardPreferred.includes(a) ? 1 : 0);
    if (pref) return pref;
    return a.localeCompare(b, 'cs');
  });
  const getSortedHigh = () => workingNames.slice().sort((a, b) => {
    if (isPressBalance) {
      const monthDiff = currentCount(b) - currentCount(a);
      if (monthDiff) return monthDiff;
      const yearDiff = yearCount(b) - yearCount(a);
      if (yearDiff) return yearDiff;
      return a.localeCompare(b, 'cs');
    }
    const diff = combinedCount(b) - combinedCount(a);
    if (diff) return diff;
    const monthDiff = currentCount(b) - currentCount(a);
    if (monthDiff) return monthDiff;
    return a.localeCompare(b, 'cs');
  });
  const getSortedLow = () => workingNames.slice().sort((a, b) => {
    if (isPressBalance) {
      const monthDiff = currentCount(a) - currentCount(b);
      if (monthDiff) return monthDiff;
      const yearDiff = yearCount(a) - yearCount(b);
      if (yearDiff) return yearDiff;
      const pref = (hardPreferred.includes(b) ? 1 : 0) - (hardPreferred.includes(a) ? 1 : 0);
      if (pref) return pref;
      return a.localeCompare(b, 'cs');
    }
    const diff = combinedCount(a) - combinedCount(b);
    if (diff) return diff;
    const yearDiff = yearCount(a) - yearCount(b);
    if (yearDiff) return yearDiff;
    const monthDiff = currentCount(a) - currentCount(b);
    if (monthDiff) return monthDiff;
    const pref = (hardPreferred.includes(b) ? 1 : 0) - (hardPreferred.includes(a) ? 1 : 0);
    if (pref) return pref;
    return a.localeCompare(b, 'cs');
  });

  const findPressOrMachineCell = (row, rowIdx, highName) => {
    const cells = Array.isArray(row && row.cells) ? row.cells : [];
    const splitPress = isPressBalance && adminRotationGeneratorShouldSplitPressMachines(row && row.date, monthKey, month);
    const candidateIdxs = isPressBalance && splitPress && tnksIdx >= 0 && tpkw01Idx >= 0 ? [tnksIdx, tpkw01Idx] : [machineIdx];
    for (const idx of candidateIdxs) {
      if (idx < 0) continue;
      const name = adminRotationCanonicalName(cells[idx], knownNames);
      if (name === highName) return { sectionKey: 'hard', row, cells, idx, machine: HARD_MACHINE_HEADERS[idx] || '', splitPress };
    }
    return null;
  };

  const trySwapPressOrMachine = (highName, lowNames, allowYearTieBreak) => {
    for (const targetLowName of lowNames) {
      if (!targetLowName || targetLowName === highName) continue;
      if (isPressBalance) {
        const monthDiff = currentCount(highName) - currentCount(targetLowName);
        if (!allowYearTieBreak && monthDiff <= allowedDiff) continue;
        if (allowYearTieBreak && Math.abs(monthDiff - allowedDiff) > 0.001) continue;
      } else if (combinedCount(highName) - combinedCount(targetLowName) <= 1) {
        break;
      }
      for (let rowIdx = 0; rowIdx < hardRows.length; rowIdx += 1) {
        const hardRow = hardRows[rowIdx];
        const highCell = findPressOrMachineCell(hardRow, rowIdx, highName);
        if (!highCell || !highCell.cells) continue;
        const lowCell = adminRotationGeneratorFindPersonCellOnDay(month, rowIdx, targetLowName, 'soft');
        if (!lowCell || !lowCell.cells) continue;
        if (lowCell.sectionKey === highCell.sectionKey && lowCell.idx === highCell.idx) continue;
        if (isPressBalance && highCell.splitPress && lowCell.sectionKey === 'hard' && (lowCell.idx === tnksIdx || lowCell.idx === tpkw01Idx)) continue;
        if (isPressBalance && !adminRotationGeneratorCanUseHardMachine(month, rowIdx, highCell.machine, targetLowName, knownNames, monthKey)) continue;
        if (isPressBalance && lowCell.sectionKey === 'hard' && !adminRotationGeneratorCanUseHardMachine(month, rowIdx, lowCell.machine, highName, knownNames, monthKey)) continue;
        lowCell.cells[lowCell.idx] = highName;
        highCell.cells[highCell.idx] = targetLowName;
        swaps += 1;
        counts = adminRotationGeneratorCountHardMachine(month, machineName, workingNames, monthKey);
        return true;
      }
    }
    return false;
  };

  if (isPressBalance) {
    let yearTieBreakUsed = false;
    for (let pass = 0; pass < maxPasses; pass += 1) {
      const highNames = sortByMonthHigh();
      const lowNames = sortByMonthLow();
      const highName = highNames[0];
      const lowName = lowNames[0];
      if (!highName || !lowName || highName === lowName) break;
      const monthSpread = currentCount(highName) - currentCount(lowName);
      if (monthSpread > allowedDiff) {
        const targetLows = lowNames.filter((name) => currentCount(highName) - currentCount(name) > allowedDiff)
          .sort((a, b) => {
            const monthDiff = currentCount(a) - currentCount(b);
            if (monthDiff) return monthDiff;
            const yearDiff = yearCount(a) - yearCount(b);
            if (yearDiff) return yearDiff;
            return a.localeCompare(b, 'cs');
          });
        if (!trySwapPressOrMachine(highName, targetLows, false)) break;
        continue;
      }
      if (yearTieBreakUsed) break;
      // Roční dorovnání je jen jemný tie-break: když je měsíc prakticky vyrovnaný
      // a jen 1 člověk má o 0,5 více, smí se max jednou přesunout na člověka s nejnižším rokem.
      if (Math.abs(monthSpread - allowedDiff) > 0.001) break;
      const maxMonth = currentCount(highName);
      const minMonth = currentCount(lowName);
      const eligibleYearNames = pressYearEligibleNames();
      const highExtra = eligibleYearNames.filter((name) => Math.abs(currentCount(name) - maxMonth) < 0.001)
        .sort((a, b) => yearCount(b) - yearCount(a) || a.localeCompare(b, 'cs'))[0];
      const lowYearCandidates = eligibleYearNames.filter((name) => Math.abs(currentCount(name) - minMonth) < 0.001)
        .sort((a, b) => yearCount(a) - yearCount(b) || a.localeCompare(b, 'cs'));
      const yearAvg = averageYearCount(eligibleYearNames);
      const targetLow = lowYearCandidates[0];
      if (!highExtra || !targetLow || highExtra === targetLow) break;
      if (yearCount(highExtra) <= yearAvg) break;
      if (yearCount(targetLow) >= yearCount(highExtra)) break;
      if (!trySwapPressOrMachine(highExtra, [targetLow], true)) break;
      yearTieBreakUsed = true;
    }
    return { swaps, counts, yearTieBreakUsed };
  }

  for (let pass = 0; pass < maxPasses; pass += 1) {
    const highNames = getSortedHigh();
    const lowNames = getSortedLow();
    const highName = highNames[0];
    const lowName = lowNames[0];
    if (!highName || !lowName || highName === lowName) break;
    if (combinedCount(highName) - combinedCount(lowName) <= 1) break;
    if (!trySwapPressOrMachine(highName, lowNames, false)) break;
  }

  return { swaps, counts };
}

function adminRotationGeneratorCountSectionTotals(month, names) {
  const result = Object.create(null);
  const list = Array.isArray(names) ? names : adminGetKnownNames();
  list.forEach((name) => { result[name] = { hard: 0, soft: 0 }; });
  const add = (sectionKey, row) => {
    const cells = Array.isArray(row && row.cells) ? row.cells : [];
    cells.forEach((cell) => {
      const name = adminRotationCanonicalName(cell, list);
      if (!name || !Object.prototype.hasOwnProperty.call(result, name)) return;
      if (sectionKey === 'soft') result[name].soft += 1;
      else result[name].hard += 1;
    });
  };
  (Array.isArray(month && month.hard && month.hard.rows) ? month.hard.rows : []).forEach((row) => add('hard', row));
  (Array.isArray(month && month.soft && month.soft.rows) ? month.soft.rows : []).forEach((row) => add('soft', row));
  return result;
}

function adminRotationGeneratorMoToPairScore(totals, firstName, secondName) {
  const first = totals && totals[firstName] ? totals[firstName] : { hard: 0, soft: 0 };
  const second = totals && totals[secondName] ? totals[secondName] : { hard: 0, soft: 0 };
  return Math.abs(Number(first.hard || 0) - Number(second.hard || 0)) + Math.abs(Number(first.soft || 0) - Number(second.soft || 0));
}

function adminRotationGeneratorFindPairCellOnDay(month, rowIdx, person, sectionKey) {
  const knownNames = adminGetKnownNames();
  const wanted = adminRotationCanonicalName(person, knownNames);
  const section = sectionKey === 'soft' ? month && month.soft : month && month.hard;
  const machines = sectionKey === 'soft' ? SOFT_MACHINE_HEADERS : HARD_MACHINE_HEADERS;
  const row = section && Array.isArray(section.rows) ? section.rows[rowIdx] : null;
  const cells = Array.isArray(row && row.cells) ? row.cells : [];
  for (let idx = 0; idx < cells.length; idx += 1) {
    const name = adminRotationCanonicalName(cells[idx], knownNames);
    if (name === wanted) return { sectionKey, row, cells, idx, machine: machines[idx] || '' };
  }
  return null;
}

function adminRotationGeneratorBalanceKminekNovotnyMoTo(month, model) {
  const knownNames = model && Array.isArray(model.knownNames) ? model.knownNames : adminGetKnownNames();
  const kminek = adminRotationCanonicalName('Kmínek', knownNames);
  const novotny = adminRotationCanonicalName('Novotný', knownNames);
  if (!kminek || !novotny || !knownNames.includes(kminek) || !knownNames.includes(novotny)) return { swaps: 0, totals: Object.create(null) };
  const hardRows = Array.isArray(month && month.hard && month.hard.rows) ? month.hard.rows : [];
  const softRows = Array.isArray(month && month.soft && month.soft.rows) ? month.soft.rows : [];
  const maxRows = Math.max(hardRows.length, softRows.length);
  let totals = adminRotationGeneratorCountSectionTotals(month, [kminek, novotny]);
  let swaps = 0;
  const maxPasses = Math.max(1, maxRows * 2);

  for (let pass = 0; pass < maxPasses; pass += 1) {
    const currentScore = adminRotationGeneratorMoToPairScore(totals, kminek, novotny);
    if (currentScore <= 1) break;
    let best = null;
    let bestScore = currentScore;
    for (let rowIdx = 0; rowIdx < maxRows; rowIdx += 1) {
      const options = [
        [adminRotationGeneratorFindPairCellOnDay(month, rowIdx, kminek, 'hard'), adminRotationGeneratorFindPairCellOnDay(month, rowIdx, novotny, 'soft')],
        [adminRotationGeneratorFindPairCellOnDay(month, rowIdx, novotny, 'hard'), adminRotationGeneratorFindPairCellOnDay(month, rowIdx, kminek, 'soft')]
      ];
      for (const pair of options) {
        const hardCell = pair[0];
        const softCell = pair[1];
        if (!hardCell || !softCell || !hardCell.cells || !softCell.cells) continue;
        const hardName = adminRotationCanonicalName(hardCell.cells[hardCell.idx], knownNames);
        const softName = adminRotationCanonicalName(softCell.cells[softCell.idx], knownNames);
        const nextTotals = JSON.parse(JSON.stringify(totals));
        if (nextTotals[hardName]) {
          nextTotals[hardName].hard -= 1;
          nextTotals[hardName].soft += 1;
        }
        if (nextTotals[softName]) {
          nextTotals[softName].soft -= 1;
          nextTotals[softName].hard += 1;
        }
        const score = adminRotationGeneratorMoToPairScore(nextTotals, kminek, novotny);
        if (score < bestScore) {
          bestScore = score;
          best = { hardCell, softCell, hardName, softName };
        }
      }
    }
    if (!best) break;
    best.hardCell.cells[best.hardCell.idx] = best.softName;
    best.softCell.cells[best.softCell.idx] = best.hardName;
    swaps += 1;
    totals = adminRotationGeneratorCountSectionTotals(month, [kminek, novotny]);
  }
  return { swaps, totals };
}

function adminRotationGeneratorCanReadEditorDraftFromDom() {
  const body = document.getElementById('appMenuBody');
  return !!(body && body.querySelector('#adminRotationEditor tr[data-rotation-section]'));
}

function adminRotationGeneratorEnsurePendingDrafts() {
  if (!app.adminRotationPendingDrafts || typeof app.adminRotationPendingDrafts !== 'object') app.adminRotationPendingDrafts = {};
  return app.adminRotationPendingDrafts;
}

function adminRotationGeneratorSetPendingDraft(monthKey, month) {
  const key = String(monthKey || '').trim();
  if (!key || !month) return null;
  const drafts = adminRotationGeneratorEnsurePendingDrafts();
  drafts[key] = JSON.parse(JSON.stringify(month));
  return drafts[key];
}

function adminRotationGeneratorGetPendingDraft(monthKey) {
  const key = String(monthKey || '').trim();
  const drafts = app && app.adminRotationPendingDrafts && typeof app.adminRotationPendingDrafts === 'object' ? app.adminRotationPendingDrafts : {};
  return key && drafts[key] ? JSON.parse(JSON.stringify(drafts[key])) : null;
}

function adminRotationGeneratorApplyPendingDraft(monthKey) {
  const key = String(monthKey || '').trim();
  const draft = adminRotationGeneratorGetPendingDraft(key);
  if (!key || !draft || !app || !app.rotation) return false;
  if (!app.rotation.months) app.rotation.months = {};
  app.rotation.months[key] = typeof normalizeMonthForImport === 'function'
    ? normalizeMonthForImport(draft, app.rotation.months[key] || null)
    : draft;
  app.selectedMonth = key;
  return true;
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
  const softKindBalance = adminRotationGeneratorBalanceSoftKind(month, model);
  const soloMillRebalance = adminRotationGeneratorBalanceSoloMill(month, model);
  const kminekNovotnyMoToBalance = adminRotationGeneratorBalanceKminekNovotnyMoTo(month, model);
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
    tnksBalanceSwaps: tnksBalance && Number(tnksBalance.swaps || 0),
    soloMillBalanceSwaps: (soloMillBalance && Number(soloMillBalance.swaps || 0)) + (soloMillRebalance && Number(soloMillRebalance.swaps || 0)),
    softKindBalanceSwaps: softKindBalance && Number(softKindBalance.swaps || 0),
    kminekNovotnyMoToBalanceSwaps: kminekNovotnyMoToBalance && Number(kminekNovotnyMoToBalance.swaps || 0),
    ruleVersion: '1.145'
  };
}

window.RAK_ROTATION_GENERATOR_CONTRACT_V1106 = RAK_ROTATION_GENERATOR_CONTRACT_V1106;
window.RAK_ROTATION_GENERATOR_RULES_V1107 = RAK_ROTATION_GENERATOR_RULES_V1107;
window.adminGenerateRotationMonthDraft = adminGenerateRotationMonthDraft;
window.adminRotationMonthHasFilledCells = adminRotationMonthHasFilledCells;


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
  softCoreAvailabilityRule: 'Když Synek/Třasák/Střížek mají v bloku absenci, generátor má prohodit pořadí a dát na Tvrdotu dřív toho, kdo později nebude dostupný, aby se tvrdotě nevyhnul.',
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
  resultFields: Object.freeze(['tnksBalanceSwaps', 'soloMillBalanceSwaps', 'softKindBalanceSwaps'])
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

function adminRotationGeneratorResolveSelectableMonthKey(monthKey) {
  const allowed = adminRotationGetAllowedGeneratorMonthKeys();
  if (!allowed.length) return '';
  if (monthKey && allowed.includes(monthKey)) return monthKey;
  return allowed[0];
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

function adminRotationGeneratorBuildYearOptions(selected) {
  const keys = adminRotationGetAllowedGeneratorMonthKeys();
  const rawSelected = selected || (keys[0] || '');
  const parsedYear = rawSelected ? adminRotationMonthYearLabel(rawSelected) : '';
  const selectedYear = parsedYear && parsedYear !== 'Bez roku' ? parsedYear : String(new Date().getFullYear());
  const years = keys.length
    ? Array.from(new Set(keys.map((key) => adminRotationMonthYearLabel(key)))).filter(Boolean)
    : [String(new Date().getFullYear())];
  return years.map((year) => '<option value="' + escapeHtml(year) + '"' + (String(year) === String(selectedYear) ? ' selected' : '') + '>' + escapeHtml(year) + '</option>').join('');
}

function adminRotationGeneratorBuildMonthOptions(selected, selectedYear) {
  const keys = adminRotationGetAllowedGeneratorMonthKeys();
  if (!keys.length) return '';
  const active = adminRotationGeneratorResolveSelectableMonthKey(selected);
  const year = selectedYear || adminRotationMonthYearLabel(active);
  return keys
    .filter((key) => !year || adminRotationMonthYearLabel(key) === String(year))
    .map((key) => '<option value="' + escapeHtml(key) + '"' + (key === active ? ' selected' : '') + '>' + escapeHtml(adminRotationMonthFullLabel(key)) + '</option>')
    .join('');
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

function adminRotationGeneratorAlignAbsencesToDays(days, absencesByDay) {
  const workingDays = Array.isArray(days) ? days.map((date) => String(date || '').trim()).filter(Boolean) : [];
  const source = Array.isArray(absencesByDay) ? absencesByDay : [];
  const exactMap = new Map();
  const baseMap = new Map();
  source.forEach((day, idx) => {
    const date = String(day && day.date || '').trim();
    if (!date) return;
    const exact = adminRotationDateLabel(date);
    const base = adminRotationDateBaseKey(date);
    if (exact && !exactMap.has(exact)) exactMap.set(exact, idx);
    if (base && !baseMap.has(base)) baseMap.set(base, idx);
  });
  return workingDays.map((date) => {
    const exact = adminRotationDateLabel(date);
    const base = adminRotationDateBaseKey(date);
    let sourceIdx = exactMap.has(exact) ? exactMap.get(exact) : -1;
    if ((!Number.isFinite(sourceIdx) || sourceIdx < 0) && baseMap.has(base)) sourceIdx = baseMap.get(base);
    const rows = Number.isFinite(sourceIdx) && source[sourceIdx] && Array.isArray(source[sourceIdx].rows)
      ? source[sourceIdx].rows.map((row) => ({ person: String(row && row.person || '').trim(), code: String(row && row.code || '').trim() }))
      : [];
    return { date, rows };
  });
}

function adminRotationGeneratorBuildPrefillState(monthKey) {
  const days = adminRotationGetMonthWorkDates(monthKey);
  const month = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  return {
    days: days.slice(),
    absencesByDay: adminRotationCollectMonthAbsencesFromMonth(month, days)
  };
}


function adminRotationGeneratorResolveWizardDays(state) {
  const liveState = state || adminRotationGeneratorGetWizardState();
  const fromState = Array.isArray(liveState.days) ? liveState.days.map((d) => String(d || '').trim()).filter(Boolean) : [];
  if (fromState.length) return fromState;
  const monthKey = String(liveState.monthKey || '').trim();
  const fallbackDays = adminRotationGetMonthWorkDates(monthKey);
  if (fallbackDays.length) {
    liveState.days = fallbackDays.slice();
    return fallbackDays;
  }
  return [];
}

function adminRotationGeneratorGetWizardState() {
  if (!window.__rakRotationGeneratorWizard || typeof window.__rakRotationGeneratorWizard !== 'object') {
    window.__rakRotationGeneratorWizard = { step: 'month', monthKey: '', days: [], absencesByDay: [] };
  }
  return window.__rakRotationGeneratorWizard;
}

function adminRotationGeneratorSetWizardState(next) {
  window.__rakRotationGeneratorWizard = Object.assign(adminRotationGeneratorGetWizardState(), next || {});
  return window.__rakRotationGeneratorWizard;
}

function adminRotationGeneratorCollectDaysFromDom() {
  const body = document.getElementById('appMenuBody');
  if (!body) return [];
  return Array.from(body.querySelectorAll('[data-generator-day-input]'))
    .map((input) => String(input.value || '').trim())
    .filter(Boolean);
}

function adminRotationGeneratorGetWizardDaysForCollection() {
  const domDays = adminRotationGeneratorCollectDaysFromDom();
  if (domDays.length) return domDays;
  const state = adminRotationGeneratorGetWizardState();
  return Array.isArray(state.days) ? state.days.map((date) => String(date || '').trim()).filter(Boolean) : [];
}

function adminRotationGeneratorCollectAbsencesFromDom() {
  const body = document.getElementById('appMenuBody');
  const days = adminRotationGeneratorGetWizardDaysForCollection();
  const absencesByDay = days.map((date) => ({ date, rows: [] }));
  if (!body) return absencesByDay;
  body.querySelectorAll('[data-generator-absence-day]').forEach((box) => {
    const dayIndex = Number(box.getAttribute('data-generator-absence-day') || -1);
    if (!Number.isFinite(dayIndex) || dayIndex < 0 || !absencesByDay[dayIndex]) return;
    const rows = [];
    box.querySelectorAll('[data-generator-absence-row]').forEach((row) => {
      const person = String(row.querySelector('[data-generator-absence-person]')?.value || '').trim();
      const code = String(row.querySelector('[data-generator-absence-code]')?.value || '').trim();
      rows.push({ person, code });
    });
    absencesByDay[dayIndex].rows = rows;
  });
  return absencesByDay;
}

function adminRotationGeneratorRenderWizard(step) {
  const body = document.getElementById('appMenuBody');
  if (!body) return;
  const state = adminRotationGeneratorGetWizardState();
  const selected = adminRotationGeneratorResolveSelectableMonthKey(state.monthKey || adminRotationGetNextMonthKeyFrom(getAdminSelectedMonthKey()));
  const selectedYear = adminRotationMonthYearLabel(selected);
  const yearOptions = adminRotationGeneratorBuildYearOptions(selected);
  const monthOptions = adminRotationGeneratorBuildMonthOptions(selected, selectedYear);
  body.dataset.adminView = 'rotation';
  body.innerHTML = [
    '<div class="appMenuCard appMenuAdminCard adminRotationGeneratorWizard">',
    '  <div class="appMenuCardTitle">Generátor rozpisu</div>',
    '  <div class="appMenuText">Průvodce nejdřív zkontroluje měsíc a pracovní dny, potom absence a až nakonec vytvoří návrh. Online se nic neukládá bez tlačítka Uložit rozpis.</div>',
    '  <div class="adminRotationGeneratorSteps">',
    '    <span class="' + (step === 'month' ? 'isActive' : '') + '">1. Měsíc</span>',
    '    <span class="' + (step === 'days' ? 'isActive' : '') + '">2. Dny</span>',
    '    <span class="' + (step === 'absences' ? 'isActive' : '') + '">3. Absence</span>',
    '    <span class="' + (step === 'result' ? 'isActive' : '') + '">4. Návrh</span>',
    '  </div>',
    step === 'month' ? adminRotationGeneratorRenderMonthStep(yearOptions, monthOptions, selected) : '',
    step === 'days' ? adminRotationGeneratorRenderDaysStep(state) : '',
    step === 'absences' ? adminRotationGeneratorRenderAbsencesStep(state) : '',
    step === 'result' ? adminRotationGeneratorRenderResultStep(state) : '',
    '  <div id="adminOnlineSaveStatus" class="appMenuStatusLine"></div>',
    '</div>'
  ].join('');
  try {
    const status = document.getElementById('adminOnlineSaveStatus');
    if (status) status.textContent = step === 'month'
      ? (selected ? 'Nabízím aktuální měsíc pro případné přegenerování a další navazující měsíc po hotových rozpisech.' : 'V seznamu rozpisů teď není dostupný žádný měsíc pro generátor.')
      : (step === 'days' ? 'Zkontroluj pracovní dny. Křížkem den smažeš, tlačítkem + přidáš další.' : '');
  } catch (err) {}
}

function adminRotationGeneratorRenderMonthStep(yearOptions, monthOptions, selected) {
  const disabled = monthOptions ? '' : ' disabled';
  return [
    '<div class="adminRotationGeneratorPanel">',
    '  <label class="appMenuFieldLabel" for="adminGeneratorYearSelect">Rok</label>',
    '  <select id="adminGeneratorYearSelect" class="appMenuSelect">' + yearOptions + '</select>',
    '  <label class="appMenuFieldLabel" for="adminGeneratorMonthSelect">Měsíc pro návrh</label>',
    '  <select id="adminGeneratorMonthSelect" class="appMenuSelect"' + disabled + '>' + monthOptions + '</select>',
    '  <div class="smallText">' + (selected ? 'Dostupný měsíc: ' + escapeHtml(adminRotationMonthFullLabel(selected)) + '.' : 'Nejdřív musí existovat měsíc v seznamu rozpisů.') + '</div>',
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="generator-month-next"' + disabled + '>Pokračovat na dny</button>',
    '  </div>',
    '</div>'
  ].join('');
}

function adminRotationGeneratorHandleYearSelectChange(target) {
  const yearSelect = target && typeof target.closest === 'function' ? target.closest('#adminGeneratorYearSelect') : null;
  if (!yearSelect) return false;
  const body = document.getElementById('appMenuBody');
  if (!body || !body.querySelector('.adminRotationGeneratorWizard')) return false;
  const monthSelect = body.querySelector('#adminGeneratorMonthSelect');
  if (!monthSelect) return true;
  const options = adminRotationGeneratorBuildMonthOptions(monthSelect.value, String(yearSelect.value || '').trim());
  monthSelect.innerHTML = options;
  monthSelect.disabled = !options;
  if (options && !monthSelect.value) {
    const first = monthSelect.querySelector('option[value]');
    if (first) monthSelect.value = first.value || '';
  }
  return true;
}

function adminRotationGeneratorRenderDaysStep(state) {
  const days = Array.isArray(state.days) && state.days.length ? state.days : adminRotationGetMonthWorkDates(state.monthKey);
  state.days = days.slice();
  const rows = days.map((date, idx) => [
    '<div class="adminRotationGeneratorDayRow" data-generator-day-row="' + String(idx) + '">',
    '  <input class="appMenuInlineInput" data-generator-day-input value="' + escapeHtml(date) + '" placeholder="např. 1.6. R">',
    '  <button type="button" class="adminRotationGeneratorIconBtn" data-admin-action="generator-day-remove" data-day-index="' + String(idx) + '" title="Odebrat den">×</button>',
    '</div>'
  ].join('')).join('');
  return [
    '<div class="adminRotationGeneratorPanel">',
    '  <div class="appMenuSubTitle">Pracovní dny</div>',
    '  <div class="smallText">Zkontroluj dny před generováním. Svátek nebo odstávku prostě smaž křížkem; chybějící den přidej přes +.</div>',
    '  <div class="adminRotationGeneratorDayList">' + (rows || '<div class="smallText">Tenhle měsíc zatím nemá dny. Přidej je ručně.</div>') + '</div>',
    '  <button type="button" class="appMenuAction adminRotationGeneratorSmallAdd" data-admin-action="generator-day-add">+ Přidat den</button>',
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="generator-back-month">Zpět</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="generator-days-next">Dny jsou OK</button>',
    '  </div>',
    '</div>'
  ].join('');
}

function adminRotationGeneratorRenderAbsencesStep(state) {
  const days = adminRotationGeneratorResolveWizardDays(state);
  let absencesByDay = Array.isArray(state.absencesByDay) ? state.absencesByDay : [];
  absencesByDay = days.map((date, idx) => {
    const existing = absencesByDay[idx] || {};
    return { date, rows: Array.isArray(existing.rows) ? existing.rows : [] };
  });
  state.absencesByDay = absencesByDay;
  const blocks = absencesByDay.map((day, dayIdx) => {
    const rows = (day.rows.length ? day.rows : [{ person: '', code: '' }]).map((row, rowIdx) => [
      '<div class="adminRotationGeneratorAbsenceRow" data-generator-absence-row="' + String(rowIdx) + '">',
      '  <input class="appMenuInlineInput" data-generator-absence-person value="' + escapeHtml(row.person || '') + '" placeholder="jméno">',
      '  <input class="appMenuInlineInput appMenuInlineInputTiny" data-generator-absence-code value="' + escapeHtml(row.code || '') + '" placeholder="kód" list="adminAbsenceCodeOptions">',
      '  <button type="button" class="adminRotationGeneratorIconBtn" data-admin-action="generator-absence-remove" data-day-index="' + String(dayIdx) + '" data-row-index="' + String(rowIdx) + '" title="Odebrat absenci">×</button>',
      '</div>'
    ].join('')).join('');
    return [
      '<div class="adminRotationGeneratorAbsenceDay" data-generator-absence-day="' + String(dayIdx) + '">',
      '  <div class="adminRotationGeneratorAbsenceTitle">' + escapeHtml(day.date || 'Den') + '</div>',
      '  <div class="adminRotationGeneratorAbsenceRows">' + rows + '</div>',
      '  <button type="button" class="appMenuAction adminRotationGeneratorSmallAdd" data-admin-action="generator-absence-add" data-day-index="' + String(dayIdx) + '">+ Přidat jméno</button>',
      '</div>'
    ].join('');
  }).join('');
  return [
    '<div class="adminRotationGeneratorPanel">',
    buildAdminAbsenceCodeDatalistHtml(),
    '  <div class="appMenuSubTitle">Absence před generováním</div>',
    '  <div class="smallText">U každého dne můžeš přes + přidat víc lidí. Nevyplněné řádky se ignorují.</div>',
    '  <div class="adminRotationGeneratorAbsenceList">' + (blocks || '<div class="smallText">Nejsou vybrané žádné pracovní dny.</div>') + '</div>',
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="generator-back-days">Zpět na dny</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="generator-run">Vygenerovat rozpis</button>',
    '  </div>',
    '</div>'
  ].join('');
}


const RAK_ROTATION_GENERATOR_EXCEL_COPY_CONTRACT_V1138 = Object.freeze({
  version: '1.145',
  layout: 'kopírovací XLSX návrh rozpisu: Tvrdota A:F, prázdný oddělovač G, Absence od H dál podle pracovních dnů, Měkota znovu A:F pod Tvrdotou',
  absenceRule: 'Absence mají datum v H a dvojice Jméno/Kód od I dál; počet dvojic je dynamický 4 až 8 podle měsíce.',
  copyRule: 'Bez slučovaných buněk a bez stylových triků, aby šly bloky jednoduše označit a kopírovat do Martinovy měsíční tabulky.'
});

function adminRotationGeneratorExcelText(value) {
  return String(value == null ? '' : value).trim();
}

function adminRotationGeneratorExcelBlankRow(width) {
  return Array(Math.max(1, Number(width) || 1)).fill('');
}

function adminRotationGeneratorExcelSheetName(monthKey) {
  const raw = String(monthKey || '').trim();
  const match = raw.match(/^(\d{1,2})\s*\/\s*(\d{2,4})$/);
  if (match) {
    const month = String(match[1]).padStart(2, '0');
    const yearRaw = Number(match[2]);
    const year = String(yearRaw < 100 ? 2000 + yearRaw : yearRaw);
    return month + '.' + year;
  }
  return raw.replace(/[\\/?*\[\]:]/g, '_').slice(0, 31) || 'Navrh';
}

function adminRotationGeneratorExcelFileName(monthKey) {
  return 'RaK_navrh_rozpisu_' + adminRotationGeneratorExcelSheetName(monthKey).replace(/[^0-9A-Za-z._-]+/g, '_') + '.xlsx';
}

function adminRotationGeneratorBuildAbsenceExcelMaps(month) {
  const exact = new Map();
  const base = new Map();
  const add = (map, key, item) => {
    const safeKey = String(key || '').trim();
    if (!safeKey) return;
    if (!map.has(safeKey)) map.set(safeKey, []);
    map.get(safeKey).push(item);
  };
  (Array.isArray(month && month.notes) ? month.notes : []).forEach((note) => {
    const normalized = typeof normalizeNoteEntry === 'function' ? normalizeNoteEntry(note) : null;
    if (!normalized || !normalized.isAbsence) return;
    const people = Array.isArray(normalized.people) && normalized.people.length
      ? normalized.people
      : [normalized.person].filter(Boolean);
    const code = adminRotationGeneratorExcelText(normalized.code || (note && note.code) || '');
    people.forEach((person) => {
      const item = { person: adminRotationGeneratorExcelText(person), code };
      if (!item.person && !item.code) return;
      add(exact, typeof adminRotationDateLabel === 'function' ? adminRotationDateLabel(normalized.date || (note && note.date) || '') : adminRotationGeneratorExcelText(normalized.date || (note && note.date) || ''), item);
      add(base, typeof adminRotationDateBaseKey === 'function' ? adminRotationDateBaseKey(normalized.date || (note && note.date) || '') : adminRotationGeneratorExcelText(normalized.date || (note && note.date) || ''), item);
    });
  });
  return { exact, base };
}

function adminRotationGeneratorGetExcelAbsencesForDate(absenceMaps, dateLabel) {
  const exactKey = typeof adminRotationDateLabel === 'function' ? adminRotationDateLabel(dateLabel) : adminRotationGeneratorExcelText(dateLabel);
  const baseKey = typeof adminRotationDateBaseKey === 'function' ? adminRotationDateBaseKey(dateLabel) : adminRotationGeneratorExcelText(dateLabel);
  if (absenceMaps && absenceMaps.exact && absenceMaps.exact.has(exactKey)) return absenceMaps.exact.get(exactKey) || [];
  if (absenceMaps && absenceMaps.base && absenceMaps.base.has(baseKey)) return absenceMaps.base.get(baseKey) || [];
  return [];
}

function adminRotationGeneratorBuildExcelAbsenceSlots(absenceMaps, dayLabels) {
  let maxAbsences = 0;
  (Array.isArray(dayLabels) ? dayLabels : []).forEach((dateLabel) => {
    const count = adminRotationGeneratorGetExcelAbsencesForDate(absenceMaps, dateLabel).length;
    if (count > maxAbsences) maxAbsences = count;
  });
  return Math.max(4, Math.min(8, maxAbsences || 0));
}

function adminRotationGeneratorBuildExcelCols(aoa) {
  const width = Math.max(8, ...(Array.isArray(aoa) ? aoa.map((row) => Array.isArray(row) ? row.length : 0) : [0]));
  const cols = [];
  for (let idx = 0; idx < width; idx += 1) {
    if (idx === 0 || idx === 7) cols.push({ wch: 12 });
    else if (idx >= 1 && idx <= 5) cols.push({ wch: 14 });
    else if (idx === 6) cols.push({ wch: 3 });
    else cols.push({ wch: idx % 2 === 0 ? 15 : 8 });
  }
  return cols;
}

function adminRotationGeneratorBuildExcelAoa(month) {
  const hard = month && month.hard ? month.hard : {};
  const soft = month && month.soft ? month.soft : {};
  const hardMachines = Array.isArray(hard.machines) && hard.machines.length ? hard.machines : HARD_MACHINE_HEADERS.slice();
  const softMachines = Array.isArray(soft.machines) && soft.machines.length ? soft.machines : SOFT_MACHINE_HEADERS.slice();
  const hardRows = Array.isArray(hard.rows) ? hard.rows : [];
  const softRows = Array.isArray(soft.rows) ? soft.rows : [];
  const dayCount = Math.max(hardRows.length, softRows.length);
  const absenceMaps = adminRotationGeneratorBuildAbsenceExcelMaps(month);
  const dayLabels = [];
  for (let i = 0; i < dayCount; i += 1) {
    const hardRow = hardRows[i] || {};
    const softRow = softRows[i] || {};
    dayLabels.push(adminRotationGeneratorExcelText(hardRow.date || softRow.date || ''));
  }
  const absenceSlots = adminRotationGeneratorBuildExcelAbsenceSlots(absenceMaps, dayLabels);
  const width = 8 + absenceSlots * 2;
  const rows = [];
  const hardHeader = adminRotationGeneratorExcelBlankRow(width);
  hardHeader[0] = 'Rotace  tvrdota';
  hardMachines.slice(0, 5).forEach((machine, idx) => { hardHeader[1 + idx] = adminRotationGeneratorExcelText(machine); });
  hardHeader[7] = 'Dovolená, neschopenka atd.:';
  for (let idx = 0; idx < absenceSlots; idx += 1) {
    hardHeader[8 + idx * 2] = idx === 0 ? 'Jméno' : ('Jméno ' + String(idx + 1));
    hardHeader[9 + idx * 2] = idx === 0 ? 'Kód' : ('Kód ' + String(idx + 1));
  }
  rows.push(hardHeader);
  for (let i = 0; i < dayCount; i += 1) {
    const hardRow = hardRows[i] || {};
    const softRow = softRows[i] || {};
    const date = dayLabels[i] || adminRotationGeneratorExcelText(hardRow.date || softRow.date || '');
    const row = adminRotationGeneratorExcelBlankRow(width);
    row[0] = date;
    const hardCells = Array.isArray(hardRow.cells) ? hardRow.cells : [];
    hardMachines.slice(0, 5).forEach((_, idx) => { row[1 + idx] = adminRotationGeneratorExcelText(hardCells[idx] || ''); });
    row[7] = date;
    const absences = adminRotationGeneratorGetExcelAbsencesForDate(absenceMaps, date).slice(0, absenceSlots);
    absences.forEach((absence, idx) => {
      row[8 + idx * 2] = adminRotationGeneratorExcelText(absence.person || '');
      row[9 + idx * 2] = adminRotationGeneratorExcelText(absence.code || '');
    });
    rows.push(row);
  }
  rows.push(adminRotationGeneratorExcelBlankRow(width));
  const softHeader = adminRotationGeneratorExcelBlankRow(width);
  softHeader[0] = 'Rotace  měkota';
  softMachines.slice(0, 5).forEach((machine, idx) => { softHeader[1 + idx] = adminRotationGeneratorExcelText(machine); });
  rows.push(softHeader);
  for (let i = 0; i < dayCount; i += 1) {
    const hardRow = hardRows[i] || {};
    const softRow = softRows[i] || {};
    const date = adminRotationGeneratorExcelText(softRow.date || hardRow.date || '');
    const row = adminRotationGeneratorExcelBlankRow(width);
    row[0] = date;
    const softCells = Array.isArray(softRow.cells) ? softRow.cells : [];
    softMachines.slice(0, 5).forEach((_, idx) => { row[1 + idx] = adminRotationGeneratorExcelText(softCells[idx] || ''); });
    rows.push(row);
  }
  return rows;
}

function adminRotationGeneratorDownloadExcel(monthKey) {
  try {
    if (typeof XLSX === 'undefined' || !XLSX || !XLSX.utils || typeof XLSX.writeFile !== 'function') {
      throw new Error('Knihovna XLSX není dostupná. Zkus to online nebo po načtení stránky znovu.');
    }
    const key = String(monthKey || (app && app.selectedMonth) || '').trim();
    const month = adminRotationGeneratorGetPendingDraft(key) || (app && app.rotation && app.rotation.months ? app.rotation.months[key] : null);
    if (!month) throw new Error('Není dostupný vygenerovaný měsíc pro export.');
    const aoa = adminRotationGeneratorBuildExcelAoa(month);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = adminRotationGeneratorBuildExcelCols(aoa);
    XLSX.utils.book_append_sheet(wb, ws, adminRotationGeneratorExcelSheetName(key));
    XLSX.writeFile(wb, adminRotationGeneratorExcelFileName(key));
    return true;
  } catch (err) {
    const msg = err && err.message ? err.message : String(err || 'Excel export se nepovedl.');
    try {
      const status = document.getElementById('adminOnlineSaveStatus');
      if (status) {
        status.textContent = 'Excel export se nepovedl: ' + msg;
        status.classList.add('isError');
      }
    } catch (inner) {}
    alert('Excel export se nepovedl: ' + msg);
    return false;
  }
}

function adminRotationGeneratorRenderResultStep(state) {
  const month = (state && state.result && state.result.normalized)
    || adminRotationGeneratorGetPendingDraft(state && state.monthKey)
    || (app.rotation && app.rotation.months ? app.rotation.months[state.monthKey] : null);
  const summary = adminBuildRotationMachineCountSummaryHtml(month, state.monthKey);
  const preview = adminBuildRotationGeneratorPreviewHtml(month, state.monthKey);
  return [
    '<div class="adminRotationGeneratorPanel">',
    '  <div class="appMenuSubTitle">Návrh je hotový</div>',
    '  <div class="appMenuText">' + escapeHtml(state.resultText || 'Návrh se vytvořil lokálně. Teď ho zkontroluj, pak se vrať do editoru a ručně ulož.') + '</div>',
    preview,
    summary,
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="generator-back-month">Zpět na měsíc</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="generator-back-days">Zpět na dny</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="generator-back-absences">Zpět na absence</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="generator-download-excel">Stáhnout Excel</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="generator-open-editor">Otevřít rozpis</button>',
    '  </div>',
    '</div>'
  ].join('');
}

function adminRotationGeneratorEnsurePreparedMonthFromWizard() {
  const state = adminRotationGeneratorGetWizardState();
  const monthKey = state.monthKey;
  if (!monthKey) throw new Error('Chybí měsíc.');
  const fallback = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  if (!fallback) throw new Error('Pro vybraný měsíc nejsou připravená data.');
  const days = adminRotationGeneratorResolveWizardDays(state);
  if (!days.length) throw new Error('Nejsou vybrané žádné pracovní dny. Vrať se na krok Dny a přidej aspoň jeden den.');
  const month = JSON.parse(JSON.stringify(fallback));
  month.hard = month.hard || { title: 'Rotace tvrdota', machines: HARD_MACHINE_HEADERS.slice(), rows: [] };
  month.soft = month.soft || { title: 'Rotace měkota', machines: SOFT_MACHINE_HEADERS.slice(), rows: [] };
  month.hard.machines = HARD_MACHINE_HEADERS.slice();
  month.soft.machines = SOFT_MACHINE_HEADERS.slice();
  month.hard.rows = days.map((date) => ({ date, cells: Array(HARD_MACHINE_HEADERS.length).fill('') }));
  month.soft.rows = days.map((date) => ({ date, cells: Array(SOFT_MACHINE_HEADERS.length).fill('') }));
  const notes = [];
  const absencesByDay = Array.isArray(state.absencesByDay) ? state.absencesByDay : [];
  days.forEach((date, dayIdx) => {
    const day = absencesByDay[dayIdx] || {};
    const rows = Array.isArray(day.rows) ? day.rows : [];
    rows.forEach((row) => {
      const person = String(row.person || '').trim();
      const code = String(row.code || '').trim();
      if (!person && !code) return;
      const parsed = typeof parseDateToken === 'function' ? parseDateToken(date) : null;
      const shift = parsed && parsed.shift ? parsed.shift : '';
      notes.push({ date, person, code, shift, text: [person, code].filter(Boolean).join(' ') });
    });
  });
  month.notes = notes;
  return normalizeMonthForImport(month, fallback);
}

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

function adminBuildRotationGeneratorPreviewHtml(month, monthKey) {
  if (!month) return '<div class="smallText">Náhled zatím není dostupný.</div>';
  const renderSection = (title, section, fallbackMachines) => {
    const machines = Array.isArray(section && section.machines) ? section.machines : fallbackMachines;
    const rows = Array.isArray(section && section.rows) ? section.rows : [];
    const head = '<tr><th>Den</th>' + machines.map((machine) => '<th>' + escapeHtml(machine) + '</th>').join('') + '</tr>';
    const body = rows.map((row) => '<tr><td>' + escapeHtml(row && row.date || '') + '</td>' + machines.map((_, idx) => { const value = String(row && row.cells ? row.cells[idx] || '' : '').trim(); return '<td class="' + (value ? '' : 'adminRotationPreviewEmptyCell') + '">' + escapeHtml(value || '—') + '</td>'; }).join('') + '</tr>').join('');
    return [
      '<details class="adminRotationGeneratorPreviewSection" open>',
      '  <summary>' + escapeHtml(title) + '</summary>',
      '  <div class="adminRotationGeneratorMachineSummaryScroll">',
      '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense adminRotationGeneratorPreviewTable"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>',
      '  </div>',
      '</details>'
    ].join('');
  };
  return [
    '<div class="adminRotationGeneratorPreview">',
    '  <div class="appMenuSubTitle">Náhled celého rozpisu ' + escapeHtml(monthKey || '') + '</div>',
    '  <div class="smallText">Tady si rozpis projdi ještě před otevřením editoru. Když najdeš špatný den nebo absenci, vrať se na příslušný krok a nic nemusíš klikat od začátku.</div>',
    renderSection('Tvrdota', month.hard, HARD_MACHINE_HEADERS),
    renderSection('Měkota', month.soft, SOFT_MACHINE_HEADERS),
    '</div>'
  ].join('');
}

function adminOpenRotationGeneratorWizard(monthKey) {
  const suggested = adminRotationGetNextMonthKeyFrom(monthKey || getAdminSelectedMonthKey());
  const prefill = adminRotationGeneratorBuildPrefillState(suggested);
  adminRotationGeneratorSetWizardState({
    step: 'month',
    monthKey: suggested,
    days: prefill.days,
    absencesByDay: prefill.absencesByDay
  });
  adminRotationGeneratorRenderWizard('month');
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

function adminHandleRotationGeneratorWizardAction(action, target) {
  const state = adminRotationGeneratorGetWizardState();
  const body = document.getElementById('appMenuBody');
  if (action === 'generator-back-month') {
    adminRotationGeneratorRenderWizard('month');
    return true;
  }
  if (action === 'generator-back-days') {
    state.days = adminRotationGeneratorCollectDaysFromDom();
    adminRotationGeneratorRenderWizard('days');
    return true;
  }
  if (action === 'generator-back-absences') {
    adminRotationGeneratorRenderWizard('absences');
    return true;
  }
  if (action === 'generator-download-excel') {
    adminRotationGeneratorDownloadExcel(state.monthKey || app.selectedMonth);
    return true;
  }
  if (action === 'generator-open-editor') {
    const monthKey = state.monthKey || app.selectedMonth;
    const applied = adminRotationGeneratorApplyPendingDraft(monthKey);
    app.selectedMonth = monthKey;
    if (typeof renderAdminMenuBody === 'function') renderAdminMenuBody(body, 'rotation');
    const status = document.getElementById('adminOnlineSaveStatus') || document.getElementById('adminRotationDraftStatus');
    if (status && applied) status.textContent = 'Návrh je otevřený v editoru. Online se uloží až tlačítkem Uložit rozpis.';
    return true;
  }
  if (action === 'generator-month-next') {
    const select = body ? body.querySelector('#adminGeneratorMonthSelect') : null;
    const monthKey = adminRotationGeneratorResolveSelectableMonthKey(select ? String(select.value || '').trim() : state.monthKey);
    if (!monthKey) {
      const status = document.getElementById('adminOnlineSaveStatus');
      if (status) status.textContent = 'Nejdřív musí existovat další navazující měsíc v seznamu rozpisů.';
      return true;
    }
    const prefill = adminRotationGeneratorBuildPrefillState(monthKey);
    adminRotationGeneratorSetWizardState({
      step: 'days',
      monthKey,
      days: prefill.days,
      absencesByDay: prefill.absencesByDay
    });
    adminRotationGeneratorRenderWizard('days');
    return true;
  }
  if (action === 'generator-day-remove') {
    state.days = adminRotationGeneratorCollectDaysFromDom();
    const idx = Number(target && target.getAttribute('data-day-index'));
    if (Number.isFinite(idx) && idx >= 0) state.days.splice(idx, 1);
    adminRotationGeneratorRenderWizard('days');
    return true;
  }
  if (action === 'generator-day-add') {
    state.days = adminRotationGeneratorCollectDaysFromDom();
    state.days.push('');
    adminRotationGeneratorRenderWizard('days');
    return true;
  }
  if (action === 'generator-days-next') {
    const days = adminRotationGeneratorCollectDaysFromDom();
    const preservedAbsences = adminRotationGeneratorAlignAbsencesToDays(days, state.absencesByDay);
    adminRotationGeneratorSetWizardState({
      step: 'absences',
      days,
      absencesByDay: preservedAbsences
    });
    adminRotationGeneratorRenderWizard('absences');
    return true;
  }
  if (action === 'generator-absence-add') {
    state.absencesByDay = adminRotationGeneratorCollectAbsencesFromDom();
    const dayIdx = Number(target && target.getAttribute('data-day-index'));
    if (Number.isFinite(dayIdx) && state.absencesByDay[dayIdx]) {
      state.absencesByDay[dayIdx].rows.push({ person: '', code: '' });
    }
    adminRotationGeneratorRenderWizard('absences');
    return true;
  }
  if (action === 'generator-absence-remove') {
    state.absencesByDay = adminRotationGeneratorCollectAbsencesFromDom();
    const dayIdx = Number(target && target.getAttribute('data-day-index'));
    const rowIdx = Number(target && target.getAttribute('data-row-index'));
    if (Number.isFinite(dayIdx) && Number.isFinite(rowIdx) && state.absencesByDay[dayIdx] && Array.isArray(state.absencesByDay[dayIdx].rows)) {
      state.absencesByDay[dayIdx].rows.splice(rowIdx, 1);
    }
    adminRotationGeneratorRenderWizard('absences');
    return true;
  }
  if (action === 'generator-run') {
    state.days = adminRotationGeneratorResolveWizardDays(state);
    state.absencesByDay = adminRotationGeneratorCollectAbsencesFromDom();
    try {
      if (!state.days.length) throw new Error('Nejsou vybrané žádné pracovní dny. Vrať se na krok Dny a přidej aspoň jeden den.');
      const hasFilledCells = typeof adminRotationMonthHasFilledCells === 'function' ? adminRotationMonthHasFilledCells(state.monthKey) : false;
      if (hasFilledCells && !confirm('Tenhle měsíc už má v rozpisu jména. Přepsat ho novým návrhem podle průvodce?')) return true;
      const preparedMonth = adminRotationGeneratorEnsurePreparedMonthFromWizard();
      const result = adminGenerateRotationMonthDraft(state.monthKey, preparedMonth);
      state.result = result;
      state.resultText = result && result.filledCells > 0
        ? ('Návrh vygenerovaný lokálně ✓ · dnů: ' + String(result.days || 0) + ' · políček: ' + String(result.filledCells || 0) + ' · absence: ' + String(result.blockedByAbsence || 0) + '.')
        : 'Návrh se nepodařilo vygenerovat. Vrať se na krok Dny a zkontroluj, že jsou vybrané pracovní dny.';
    } catch (err) {
      state.result = null;
      state.resultText = 'Návrh se nepodařilo vygenerovat: ' + (err && err.message ? err.message : String(err || 'neznámá chyba'));
    }
    adminRotationGeneratorRenderWizard('result');
    return true;
  }
  return false;
}





const RAK_ROTATION_GENERATOR_RULES_V1135 = Object.freeze({
  version: '1.136',
  tnksMonthlyFirstRule: 'TNKS01/nýtovačka se v generátoru vyrovnává primárně v rámci měsíce; roční počty jsou jen jemný tie-break.',
  excludedFromTnksBalance: Object.freeze(['Střížek', 'Synek', 'Třasák']),
  softCoreContinuationRule: 'Synek/Třasák/Střížek drží pevný návazný cyklus TNKS01 → TPKW01 → TPKW02 mezi měsíci a TNKS01 dorovnání jim do něj nesahá.',
  softCoreGapRule: 'Když by návaznost udělala v měsíci přílišný náskok, může generátor vložit pracovní den mezery na Měkotě mezi bloky strojů.',
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
