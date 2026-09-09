// RaK – přesčasy administrace rozpisů oddělené z admin-rotation.js.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-overtime.js', 'loading', { source: 'dynamic-loader' }); } catch (err) {}

const ADMIN_ROTATION_OVERTIME_DEFAULT_TEAM = 'D';

const ADMIN_ROTATION_OVERTIME_SHIFT_FILTER_KEY = 'rak_admin_overtime_shift_filter_v127';

const ADMIN_ROTATION_OVERTIME_SETTINGS_CATEGORY = (typeof ROTATION_OVERTIME_SETTINGS_CATEGORY !== 'undefined' ? ROTATION_OVERTIME_SETTINGS_CATEGORY : 'rotation_overtime_settings');

const ADMIN_ROTATION_OVERTIME_SETTINGS_KEY = (typeof ROTATION_OVERTIME_SETTINGS_MACHINE_KEY !== 'undefined' ? ROTATION_OVERTIME_SETTINGS_MACHINE_KEY : 'ROTATION_OVERTIME_SETTINGS');

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

function adminRotationOvertimeIsValidDateParts(day, month, year) {
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return false;
  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function adminRotationOvertimeNormalizeDateInput(value) {
  const raw = String(value || '').trim();
  if (!raw || !/^\d+$/.test(raw)) return raw;
  const combosByLength = {
    4: [[1, 1, 2]],
    5: [[2, 1, 2], [1, 2, 2]],
    6: [[2, 2, 2], [1, 1, 4]],
    7: [[2, 1, 4], [1, 2, 4]],
    8: [[2, 2, 4]]
  };
  const combos = combosByLength[raw.length];
  if (!combos) return raw;
  for (const combo of combos) {
    const dLen = combo[0];
    const mLen = combo[1];
    const yLen = combo[2];
    const day = Number(raw.slice(0, dLen));
    const month = Number(raw.slice(dLen, dLen + mLen));
    let year = Number(raw.slice(dLen + mLen, dLen + mLen + yLen));
    if (yLen === 2) year += 2000;
    if (adminRotationOvertimeIsValidDateParts(day, month, year)) {
      return String(day) + '.' + String(month) + '.' + String(year);
    }
  }
  return raw;
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

function adminRotationOvertimeTodayIso() {
  const now = new Date();
  return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

function adminRotationOvertimeReadEntriesFromRoot(root) {
  const scope = root || document.getElementById('appMenuBody') || document;
  const map = new Map();
  scope.querySelectorAll('tr[data-rotation-overtime-row]').forEach((tr) => {
    const fallbackYear = String(tr.getAttribute('data-overtime-year') || '').trim();
    const dateInput = tr.querySelector('[data-rotation-overtime-date]');
    const iso = adminRotationOvertimeCzechDateToIso(dateInput ? dateInput.value : '', fallbackYear);
    if (!isValidRotationOvertimeIsoDate(iso)) return;
    const toInput = tr.querySelector('[data-rotation-overtime-to]');
    const noteInput = tr.querySelector('[data-rotation-overtime-note]');
    map.set(iso, {
      date: iso,
      to: !!(toInput && toInput.checked),
      note: String(noteInput && noteInput.value || '').trim()
    });
  });
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function adminRotationOvertimeStatusItemHtml(label, value, detail, state) {
  const safeState = state || 'ok';
  return [
    '<div class="adminRotationOvertimeStatusItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminRotationOvertimeStatusHtml(entries) {
  const list = (Array.isArray(entries) ? entries : []).filter((entry) => entry && isValidRotationOvertimeIsoDate(entry.date || ''));
  const todayIso = adminRotationOvertimeTodayIso();
  const future = list.filter((entry) => String(entry.date || '') >= todayIso);
  const pastCount = Math.max(0, list.length - future.length);
  const years = Array.from(new Set(list.map((entry) => String(entry.date || '').slice(0, 4)).filter(Boolean))).sort();
  const nearest = future[0] || null;
  const nearestInfo = nearest ? adminRotationOvertimeGetShiftInfoForIsoDate(nearest.date) : null;
  const nearestMode = nearest ? (nearest.to === false ? 'jen MO' : 'TO') : '';
  const nearestDetail = nearest
    ? ((nearestInfo && nearestInfo.team ? ('Směna ' + nearestInfo.team) : 'Směna se dopočítá') + ' · ' + nearestMode + (nearest.note ? ' · ' + nearest.note : ''))
    : 'Doplň termín do příslušného roku.';
  const items = [
    {
      label: 'Celkem',
      value: String(list.length) + '×',
      detail: years.length ? ('Roky: ' + years.join(', ')) : 'Zatím není zadaný žádný termín.',
      state: list.length ? 'ok' : 'warn'
    },
    {
      label: 'Budoucí',
      value: String(future.length) + '×',
      detail: pastCount ? ('Minulé termíny zůstávají uložené: ' + String(pastCount) + '×.') : 'Všechny zadané termíny jsou aktuální nebo budoucí.',
      state: future.length ? 'ok' : 'warn'
    },
    {
      label: 'Nejbližší',
      value: nearest ? adminRotationOvertimeIsoToCzechDate(nearest.date) : 'není',
      detail: nearestDetail,
      state: nearest ? 'ok' : 'warn'
    },
    {
      label: 'Uložení',
      value: 'ručně',
      detail: 'Změny v tomhle přehledu se online zapíšou až tlačítkem Uložit přesčasy.',
      state: 'ok'
    }
  ];
  return [
    '<details class="appMenuFoldSection adminRotationOvertimeStatus" id="adminRotationOvertimeStatus">',
    '  <summary class="appMenuSubTitle">Stav přesčasů</summary>',
    '  <div class="smallText uMb10">Souhrn vychází z řádků níže, takže ukáže i rozepsané změny před uložením.</div>',
    '  <div class="adminRotationOvertimeStatusGrid">',
    items.map((item) => adminRotationOvertimeStatusItemHtml(item.label, item.value, item.detail, item.state)).join(''),
    '  </div>',
    '</details>'
  ].join('');
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
    '<details class="appMenuFoldSection adminRotationOvertimeFilterBox"' + (selected !== 'ALL' ? ' open' : '') + '>',
    '  <summary class="appMenuSubTitle">Filtrovat podle směny' + (selected !== 'ALL' ? ' <span class="smallText">(' + escapeHtml(selected) + ')</span>' : '') + '</summary>',
    '  <div class="adminRotationOvertimeFilterBar">' + chips.map((chip) => '<button type="button" class="adminRotationOvertimeFilterChip' + (selected === chip.value ? ' isActive' : '') + '" data-admin-action="overtime-shift-filter" data-overtime-shift-filter="' + escapeHtml(chip.value) + '">' + escapeHtml(chip.label) + '</button>').join('') + '</div>',
    '  <div class="smallText">Směna se dopočítá automaticky z data podle rotačního cyklu. Uložené záznamy se nemažou ani při zapnutém filtru.</div>',
    '</details>'
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
    buildAdminRotationOvertimeStatusHtml(entries),
    buildAdminRotationOvertimeFilterHtml(),
    '<div class="adminRotationOvertimeHelp">',
    '  <b>TO zapnuto</b> = přesčas jde na tvrdotu a TNKS01/TPKW01 se ve statistikách počítá 0,5 + 0,5. ',
    '  <b>TO vypnuto</b> = přesčas nejde na tvrdotu, takže TNKS01 i TPKW01 mají +1 na stroji, kde jsou napsané.',
    '</div>',
    groups
  ].join('');
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

try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-overtime.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}
