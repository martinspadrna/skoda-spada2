// RaK 1.2 (1.155) – výplatní helpery.
const RAK_PAYROLL_SETTINGS_KEY = 'PAYROLL_SETTINGS';
const RAK_PAYROLL_SETTINGS_CATEGORY = 'payroll_settings';
const RAK_DEFAULT_PAYROLL_SETTINGS = Object.freeze({
  workdayOrdinal: 4,
  overrides: []
});

try {
  window.RAK_PAYROLL_SETTINGS_KEY = RAK_PAYROLL_SETTINGS_KEY;
  window.RAK_PAYROLL_SETTINGS_CATEGORY = RAK_PAYROLL_SETTINGS_CATEGORY;
} catch (err) {}

function payrollSettingsJson(row) {
  if (row && row.settings_json && typeof row.settings_json === 'object') return row.settings_json;
  try { return row && row.settings_json ? JSON.parse(String(row.settings_json)) : {}; }
  catch (err) { return {}; }
}

function isRakPayrollSettingsRow(row) {
  const settings = payrollSettingsJson(row);
  return String(row && row.category || '').trim() === RAK_PAYROLL_SETTINGS_CATEGORY
    || String(row && row.machine_key || '').trim() === RAK_PAYROLL_SETTINGS_KEY
    || String(settings && settings.stored_category || '').trim() === RAK_PAYROLL_SETTINGS_CATEGORY
    || String(settings && settings.admin_settings_key || '').trim() === RAK_PAYROLL_SETTINGS_KEY;
}

function payrollMonthKey(year, monthIndex) {
  return String(year) + '-' + String(Number(monthIndex) + 1).padStart(2, '0');
}

function payrollParseIsoDate(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (date.getFullYear() !== Number(match[1]) || date.getMonth() !== Number(match[2]) - 1 || date.getDate() !== Number(match[3])) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function normalizeRakPayrollOverride(entry) {
  const safe = entry && typeof entry === 'object' ? entry : {};
  const month = String(safe.month || '').trim();
  const date = String(safe.date || '').trim();
  const note = String(safe.note || '').trim();
  if (!/^\d{4}-\d{2}$/.test(month) || !payrollParseIsoDate(date)) return null;
  return { month, date, note };
}

function normalizeRakPayrollSettings(settings) {
  const raw = settings && typeof settings === 'object' ? settings : {};
  const source = raw.payroll && typeof raw.payroll === 'object' ? raw.payroll : raw;
  const ordinal = Math.max(1, Math.min(15, Number(source.workdayOrdinal || RAK_DEFAULT_PAYROLL_SETTINGS.workdayOrdinal) || RAK_DEFAULT_PAYROLL_SETTINGS.workdayOrdinal));
  const seen = new Set();
  const overrides = (Array.isArray(source.overrides) ? source.overrides : [])
    .map(normalizeRakPayrollOverride)
    .filter(Boolean)
    .filter((entry) => {
      if (seen.has(entry.month)) return false;
      seen.add(entry.month);
      return true;
    })
    .sort((a, b) => a.month.localeCompare(b.month));
  return {
    type: RAK_PAYROLL_SETTINGS_CATEGORY,
    workdayOrdinal: ordinal,
    overrides
  };
}

function getRakPayrollSettings() {
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  const row = rows.find(isRakPayrollSettingsRow);
  return normalizeRakPayrollSettings(row ? payrollSettingsJson(row) : null);
}

function makeRakPayrollSettingsRow(settings) {
  const safe = normalizeRakPayrollSettings(settings);
  return {
    machine_key: RAK_PAYROLL_SETTINGS_KEY,
    machine_code: 'APP',
    machine_index: 'payroll',
    label: 'Výplata',
    category: RAK_PAYROLL_SETTINGS_CATEGORY,
    cycle_time: '',
    speed: '',
    dress_time: '',
    dress_count: '',
    settings_json: Object.assign({ machine: 'APP', index: 'payroll' }, safe)
  };
}

function mergeRakPayrollSettingsRows(settings) {
  const base = Array.isArray(app.machineSettingsRows) ? app.machineSettingsRows : [];
  const rows = base.filter((row) => !isRakPayrollSettingsRow(row));
  rows.push(makeRakPayrollSettingsRow(settings));
  return rows;
}

function getPayrollDateForMonthWithSettings(year, monthIndex, settings) {
  const payrollSettings = normalizeRakPayrollSettings(settings);
  const override = payrollSettings.overrides.find((entry) => entry.month === payrollMonthKey(year, monthIndex));
  if (override && override.date) {
    const overrideDate = payrollParseIsoDate(override.date);
    if (overrideDate) return overrideDate;
  }
  const cursor = new Date(year, monthIndex, 1);
  cursor.setHours(0, 0, 0, 0);
  let workdayCount = 0;

  while (cursor.getMonth() === monthIndex) {
    if (isPayrollWorkday(cursor)) {
      workdayCount += 1;
      if (workdayCount === payrollSettings.workdayOrdinal) {
        return new Date(cursor);
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return null;
}

function getNextPayrollDateWithSettings(settings, now) {
  const today = new Date(now || new Date());
  today.setHours(0, 0, 0, 0);
  const payrollSettings = normalizeRakPayrollSettings(settings);

  for (let i = 0; i < 24; i += 1) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const payDate = getPayrollDateForMonthWithSettings(monthDate.getFullYear(), monthDate.getMonth(), payrollSettings);
    if (payDate && payDate >= today) {
      return payDate;
    }
  }

  return null;
}

function formatRakPayrollAdminDate(date) {
  if (!date || !Number.isFinite(date.getTime())) return 'nenalezeno';
  try {
    return date.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (err) {
    return String(date.getDate()).padStart(2, '0') + '.' + String(date.getMonth() + 1).padStart(2, '0') + '.' + String(date.getFullYear());
  }
}

function adminPayrollRefreshStatus() {}

function buildAdminPayrollSettingsHtml() {
  const settings = getRakPayrollSettings();
  const overrides = settings.overrides.concat(Array.from({ length: 4 }, () => ({ month: '', date: '', note: '' })));
  const rows = overrides.map((entry) => [
    '<tr data-payroll-override-row>',
    '  <td><input class="appMenuInlineInput" data-payroll-override-field="month" type="month" value="' + escapeHtml(entry.month || '') + '"></td>',
    '  <td><input class="appMenuInlineInput" data-payroll-override-field="date" type="date" value="' + escapeHtml(entry.date || '') + '"></td>',
    '  <td><input class="appMenuInlineInput" data-payroll-override-field="note" value="' + escapeHtml(entry.note || '') + '" placeholder="poznámka"></td>',
    '</tr>'
  ].join('')).join('');
  return [
    '<div class="appMenuSettingsList adminPayrollSettingsList">',
    '  <label class="appMenuFieldLabel" for="adminPayrollWorkdayOrdinal">Výchozí pořadí pracovního dne v měsíci</label>',
    '  <input id="adminPayrollWorkdayOrdinal" class="appMenuInlineInput" type="number" min="1" max="15" step="1" value="' + escapeHtml(String(settings.workdayOrdinal)) + '">',
    '  <div class="appMenuSubTitle">Ruční výjimky</div>',
    '  <div class="tableWrap appMenuTableWrap">',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense adminPayrollOverridesTable">',
    '      <colgroup><col class="adminPayrollMonthCol"><col class="adminPayrollDateCol"><col class="adminPayrollNoteCol"></colgroup>',
    '      <thead><tr><th>Měsíc</th><th>Datum výplaty</th><th>Poznámka</th></tr></thead>',
    '      <tbody>' + rows + '</tbody>',
    '    </table>',
    '  </div>',
    '</div>'
  ].join('');
}

function readAdminPayrollSettingsFromDom() {
  const ordinal = Number(document.getElementById('adminPayrollWorkdayOrdinal')?.value || RAK_DEFAULT_PAYROLL_SETTINGS.workdayOrdinal) || RAK_DEFAULT_PAYROLL_SETTINGS.workdayOrdinal;
  const overrides = [];
  document.querySelectorAll('#appMenuBody tr[data-payroll-override-row]').forEach((row) => {
    const get = (field) => String(row.querySelector('[data-payroll-override-field="' + field + '"]')?.value || '').trim();
    const normalized = normalizeRakPayrollOverride({
      month: get('month'),
      date: get('date'),
      note: get('note')
    });
    if (normalized) overrides.push(normalized);
  });
  return normalizeRakPayrollSettings({ workdayOrdinal: ordinal, overrides });
}

function isPayrollWorkday(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  return !getSpecialWorkInfo(date);
}

function getPayrollDateForMonth(year, monthIndex) {
  const payrollSettings = getRakPayrollSettings();
  return getPayrollDateForMonthWithSettings(year, monthIndex, payrollSettings);
}

function getNextPayrollDate(now) {
  return getNextPayrollDateWithSettings(getRakPayrollSettings(), now);
}

function pluralizeDays(count) {
  if (count === 1) return 'den';
  if (count >= 2 && count <= 4) return 'dny';
  return 'dní';
}

function getPayrollTileText(now) {
  const payDate = getNextPayrollDate(now || new Date());
  const today = new Date(now || new Date());
  today.setHours(0, 0, 0, 0);

  if (!payDate) return '💸 Výplata: bez termínu';

  const diffDays = Math.round((payDate.getTime() - today.getTime()) / 86400000);
  if (diffDays <= 0) return '💸 Výplata přijde dnes';
  if (diffDays === 1) return '💸 Výplata přijde zítra';
  return '💸 Výplata přijde za ' + diffDays + ' ' + pluralizeDays(diffDays);
}

try {
  window.isRakPayrollSettingsRow = isRakPayrollSettingsRow;
  window.getRakPayrollSettings = getRakPayrollSettings;
  window.buildAdminPayrollSettingsHtml = buildAdminPayrollSettingsHtml;
  window.adminPayrollRefreshStatus = adminPayrollRefreshStatus;
  window.readAdminPayrollSettingsFromDom = readAdminPayrollSettingsFromDom;
  window.mergeRakPayrollSettingsRows = mergeRakPayrollSettingsRows;
} catch (err) {}
