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

function readAdminPayrollDraftSummary(root) {
  const scope = root || document.getElementById('appMenuBody') || document;
  const ordinalInput = scope.querySelector ? scope.querySelector('#adminPayrollWorkdayOrdinal') : null;
  const rawOrdinal = String(ordinalInput && ordinalInput.value || '').trim();
  const ordinalNumber = Number(rawOrdinal || RAK_DEFAULT_PAYROLL_SETTINGS.workdayOrdinal);
  const ordinal = Math.max(1, Math.min(15, ordinalNumber || RAK_DEFAULT_PAYROLL_SETTINGS.workdayOrdinal));
  const validOverrides = [];
  const seenMonths = new Set();
  let partialRows = 0;
  let invalidRows = 0;
  let duplicateMonths = 0;

  if (scope.querySelectorAll) {
    scope.querySelectorAll('tr[data-payroll-override-row]').forEach((row) => {
      const get = (field) => String(row.querySelector('[data-payroll-override-field="' + field + '"]')?.value || '').trim();
      const month = get('month');
      const date = get('date');
      const note = get('note');
      if (!month && !date && !note) return;
      if (!month || !date) {
        partialRows += 1;
        return;
      }
      const normalized = normalizeRakPayrollOverride({ month, date, note });
      if (!normalized) {
        invalidRows += 1;
        return;
      }
      if (seenMonths.has(normalized.month)) {
        duplicateMonths += 1;
        return;
      }
      seenMonths.add(normalized.month);
      validOverrides.push(normalized);
    });
  }

  return {
    workdayOrdinal: ordinal,
    ordinalClamped: String(ordinal) !== String(rawOrdinal || ordinal),
    overrides: validOverrides.sort((a, b) => a.month.localeCompare(b.month)),
    partialRows,
    invalidRows,
    duplicateMonths
  };
}

function buildAdminPayrollStatusSummary(settings) {
  const safe = normalizeRakPayrollSettings(settings || getRakPayrollSettings());
  return {
    workdayOrdinal: safe.workdayOrdinal,
    ordinalClamped: false,
    overrides: safe.overrides,
    partialRows: 0,
    invalidRows: 0,
    duplicateMonths: 0
  };
}

function adminPayrollStatusItemHtml(label, value, detail, state) {
  const safeState = state || 'ok';
  return [
    '<div class="adminPayrollStatusItem is' + escapeHtml(safeState.charAt(0).toUpperCase() + safeState.slice(1)) + '">',
    '  <span>' + escapeHtml(label || '') + '</span>',
    '  <b>' + escapeHtml(value || '') + '</b>',
    detail ? '  <small>' + escapeHtml(detail) + '</small>' : '',
    '</div>'
  ].join('');
}

function buildAdminPayrollStatusHtml(summary) {
  const safe = summary || buildAdminPayrollStatusSummary();
  const nextDate = getNextPayrollDateWithSettings({
    workdayOrdinal: safe.workdayOrdinal,
    overrides: safe.overrides
  }, new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = nextDate ? Math.max(0, Math.round((nextDate.getTime() - today.getTime()) / 86400000)) : null;
  const nextMonthKey = nextDate ? payrollMonthKey(nextDate.getFullYear(), nextDate.getMonth()) : '';
  const nextOverride = nextMonthKey && (safe.overrides || []).some((entry) => entry.month === nextMonthKey);
  const issueCount = Number(safe.partialRows || 0) + Number(safe.invalidRows || 0) + Number(safe.duplicateMonths || 0) + (safe.ordinalClamped ? 1 : 0);
  const items = [
    {
      label: 'Pravidlo',
      value: String(safe.workdayOrdinal || RAK_DEFAULT_PAYROLL_SETTINGS.workdayOrdinal) + '. pracovní den',
      detail: safe.ordinalClamped ? 'Hodnota bude při uložení omezena na rozsah 1-15.' : 'Základ pro měsíce bez ruční výjimky.',
      state: safe.ordinalClamped ? 'warn' : 'ok'
    },
    {
      label: 'Ruční výjimky',
      value: String((safe.overrides || []).length),
      detail: (safe.overrides || []).length ? 'Měsíce s pevným datem výplaty.' : 'Bez výjimek, používá se pravidlo.',
      state: (safe.overrides || []).length ? 'info' : 'ok'
    },
    {
      label: 'Nejbližší výplata',
      value: formatRakPayrollAdminDate(nextDate),
      detail: nextDate ? ((diffDays === 0 ? 'Dnes.' : ('Za ' + String(diffDays) + ' ' + pluralizeDays(diffDays) + '.')) + (nextOverride ? ' Použita ruční výjimka.' : ' Spočítáno podle pravidla.')) : 'Zkontroluj pravidlo a volné dny.',
      state: nextDate ? 'ok' : 'warn'
    },
    {
      label: 'Kontrola',
      value: issueCount ? 'zkontrolovat' : 'OK',
      detail: issueCount ? ('Neúplné: ' + String(safe.partialRows || 0) + ' · neplatné: ' + String(safe.invalidRows || 0) + ' · duplicity: ' + String(safe.duplicateMonths || 0) + '.') : 'Zadané řádky jsou použitelné.',
      state: issueCount ? 'warn' : 'ok'
    }
  ];
  return [
    '<div class="adminPayrollStatus" id="adminPayrollStatus">',
    '  <div class="appMenuSubTitle">Stav výplaty</div>',
    '  <div class="smallText uMb10">Souhrn vychází z polí níže. Karta Výplata se v běžné aplikaci změní až po uložení.</div>',
    '  <div class="adminPayrollStatusGrid">',
    items.map((item) => adminPayrollStatusItemHtml(item.label, item.value, item.detail, item.state)).join(''),
    '  </div>',
    '</div>'
  ].join('');
}

function adminPayrollRefreshStatus(root) {
  const scope = root || document.getElementById('appMenuBody') || document;
  const box = scope.querySelector ? scope.querySelector('#adminPayrollStatus') : null;
  if (!box) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = buildAdminPayrollStatusHtml(readAdminPayrollDraftSummary(scope));
  const next = wrap.firstElementChild;
  if (next) box.replaceWith(next);
}

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
    buildAdminPayrollStatusHtml(buildAdminPayrollStatusSummary(settings)),
    '<div class="appMenuSettingsList adminPayrollSettingsList">',
    '  <label class="appMenuFieldLabel" for="adminPayrollWorkdayOrdinal">Výchozí pořadí pracovního dne v měsíci</label>',
    '  <input id="adminPayrollWorkdayOrdinal" class="appMenuInlineInput" type="number" min="1" max="15" step="1" value="' + escapeHtml(String(settings.workdayOrdinal)) + '">',
    '  <div class="appMenuSubTitle">Ruční výjimky</div>',
    '  <div class="tableWrap appMenuTableWrap">',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense adminPayrollOverridesTable">',
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
  window.buildAdminPayrollStatusHtml = buildAdminPayrollStatusHtml;
  window.adminPayrollRefreshStatus = adminPayrollRefreshStatus;
  window.readAdminPayrollSettingsFromDom = readAdminPayrollSettingsFromDom;
  window.mergeRakPayrollSettingsRows = mergeRakPayrollSettingsRows;
} catch (err) {}
