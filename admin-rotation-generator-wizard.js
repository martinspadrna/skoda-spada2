// RaK – průvodce generátoru, návrh, kalendář absencí a export oddělené od engine.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-generator-wizard.js', 'loading', { source: 'dynamic-loader' }); } catch (err) {}

const ADMIN_ROTATION_GENERATOR_ABSENCE_ICS_URL = String(window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url || '').replace(/\/$/, '') + '/functions/v1/rak-absence-calendar';

function adminRotationGeneratorCanReadEditorDraftFromDom() {
  const body = document.getElementById('appMenuBody');
  return !!(body && body.querySelector('#adminRotationEditor tr[data-rotation-section]'));
}

function adminRotationGeneratorEnsurePendingDrafts() {
  const root = typeof window !== 'undefined' ? window : globalThis;
  if (!root.__rakRotationGeneratorPendingDrafts || typeof root.__rakRotationGeneratorPendingDrafts !== 'object') {
    root.__rakRotationGeneratorPendingDrafts = {};
  }
  return root.__rakRotationGeneratorPendingDrafts;
}

function adminRotationGeneratorSetPendingDraft(monthKey, month) {
  const key = String(monthKey || '').trim();
  if (!key || !month) return null;
  const drafts = adminRotationGeneratorEnsurePendingDrafts();
  drafts[key] = JSON.parse(JSON.stringify(month));
  if (app && typeof app === 'object') {
    if (!app.adminRotationPendingDrafts || typeof app.adminRotationPendingDrafts !== 'object') app.adminRotationPendingDrafts = {};
    app.adminRotationPendingDrafts[key] = JSON.parse(JSON.stringify(month));
  }
  return drafts[key];
}

function adminRotationGeneratorGetPendingDraft(monthKey) {
  const key = String(monthKey || '').trim();
  if (!key) return null;
  const drafts = adminRotationGeneratorEnsurePendingDrafts();
  const appDrafts = app && app.adminRotationPendingDrafts && typeof app.adminRotationPendingDrafts === 'object'
    ? app.adminRotationPendingDrafts
    : {};
  const draft = drafts[key] || appDrafts[key];
  if (!draft) return null;
  if (!drafts[key]) drafts[key] = JSON.parse(JSON.stringify(draft));
  return JSON.parse(JSON.stringify(draft));
}

function adminRotationGeneratorClearPendingDraft(monthKey) {
  const key = String(monthKey || '').trim();
  if (!key) return;
  const drafts = adminRotationGeneratorEnsurePendingDrafts();
  delete drafts[key];
  if (app && app.adminRotationPendingDrafts && typeof app.adminRotationPendingDrafts === 'object') {
    delete app.adminRotationPendingDrafts[key];
  }
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

function adminRotationGeneratorOpenDraftInEditor(state, body) {
  const wizardState = state && typeof state === 'object' ? state : adminRotationGeneratorGetWizardState();
  const monthKey = String(wizardState.monthKey || app.selectedMonth || '').trim();
  const resultDraft = wizardState.result && wizardState.result.normalized ? wizardState.result.normalized : null;
  if (monthKey && resultDraft) adminRotationGeneratorSetPendingDraft(monthKey, resultDraft);
  const applied = adminRotationGeneratorApplyPendingDraft(monthKey);
  app.selectedMonth = monthKey;
  if (body && typeof renderAdminMenuBody === 'function') renderAdminMenuBody(body, 'rotation');
  return applied;
}

function adminRotationGeneratorResolveSelectableMonthKey(monthKey) {
  const allowed = adminRotationGetAllowedGeneratorMonthKeys();
  if (!allowed.length) return '';
  if (monthKey && allowed.includes(monthKey)) return monthKey;
  return allowed[0];
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

function adminRotationGeneratorIcsUnfold(text) {
  return String(text || '').replace(/\r?\n[ \t]/g, '');
}

function adminRotationGeneratorIcsProp(block, name) {
  const wanted = String(name || '').toUpperCase();
  const lines = String(block || '').split(/\r?\n/);
  for (const line of lines) {
    const split = String(line || '').indexOf(':');
    if (split < 0) continue;
    const key = line.slice(0, split).split(';')[0].toUpperCase();
    if (key === wanted) return { rawKey: line.slice(0, split), value: line.slice(split + 1) };
  }
  return { rawKey: '', value: '' };
}

function adminRotationGeneratorIcsDecodeText(value) {
  return String(value || '')
    .replace(/\\n/gi, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .replace(/\s+/g, ' ')
    .trim();
}

function adminRotationGeneratorIcsDatePart(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return '';
  return match[1] + '-' + match[2] + '-' + match[3];
}

function adminRotationGeneratorIsoToUtcDate(iso) {
  const match = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function adminRotationGeneratorUtcDateToIso(date) {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function adminRotationGeneratorIcsDateRange(startProp, endProp) {
  const startIso = adminRotationGeneratorIcsDatePart(startProp && startProp.value);
  if (!startIso) return [];
  const endIso = adminRotationGeneratorIcsDatePart(endProp && endProp.value);
  const isAllDay = /VALUE=DATE/i.test(String(startProp && startProp.rawKey || '')) || /^\d{8}$/.test(String(startProp && startProp.value || '').trim());
  const startDate = adminRotationGeneratorIsoToUtcDate(startIso);
  if (!startDate) return [];
  const endDate = endIso ? adminRotationGeneratorIsoToUtcDate(endIso) : null;
  if (!endDate || endDate <= startDate) return [startIso];
  const limit = new Date(endDate.getTime());
  if (isAllDay) limit.setUTCDate(limit.getUTCDate() - 1);
  if (limit < startDate) return [startIso];
  const result = [];
  const cursor = new Date(startDate.getTime());
  while (cursor <= limit && result.length < 370) {
    result.push(adminRotationGeneratorUtcDateToIso(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

function adminRotationGeneratorDateLabelToIso(dateLabel, monthKey) {
  const parsedDate = typeof parseDateToken === 'function' ? parseDateToken(String(dateLabel || '').trim()) : null;
  const parsedMonth = typeof parseMonthKey === 'function' ? parseMonthKey(monthKey) : null;
  if (!parsedDate || !parsedMonth) return '';
  const year = Number(parsedMonth.year);
  const month = Number(parsedDate.month || parsedMonth.month);
  const day = Number(parsedDate.day);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return '';
  return adminRotationGeneratorUtcDateToIso(new Date(Date.UTC(year, month - 1, day)));
}

function adminRotationGeneratorParseCalendarAbsenceSummary(summary, knownNames) {
  const raw = adminRotationGeneratorIcsDecodeText(summary);
  if (!raw) return null;
  const match = raw.match(/^([^\s,;:]+)\s+(.+)$/);
  if (!match) return null;
  const known = Array.isArray(knownNames) ? knownNames : adminGetKnownNames();
  const person = adminRotationCanonicalName(match[1], known);
  if (!known.includes(person)) return null;
  const code = String(match[2] || '').trim();
  const foldedCode = adminRotationNameLookupKey(code);
  const upperCode = code.toLocaleUpperCase('cs-CZ');
  const hasAbsenceCode = /\b(?:D|NV|L|N|S)\b/i.test(code)
    || upperCode.indexOf('§') >= 0
    || upperCode.indexOf('Š') >= 0
    || /(?:dovol|nahrad|nemoc|neschop|lazn|lazne|lazen|paragraf|skolen|senior)/i.test(foldedCode);
  if (!hasAbsenceCode) return null;
  return { person, code };
}

function adminRotationGeneratorParseIcsAbsences(text, monthKey, days) {
  const knownNames = adminGetKnownNames();
  const dayIsoToIndex = new Map();
  (Array.isArray(days) ? days : []).forEach((dateLabel, idx) => {
    const iso = adminRotationGeneratorDateLabelToIso(dateLabel, monthKey);
    if (iso && !dayIsoToIndex.has(iso)) dayIsoToIndex.set(iso, idx);
  });
  const result = (Array.isArray(days) ? days : []).map((date) => ({ date, rows: [] }));
  const seen = new Set();
  const source = adminRotationGeneratorIcsUnfold(text);
  const events = source.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];
  events.forEach((eventBlock) => {
    const parsed = adminRotationGeneratorParseCalendarAbsenceSummary(adminRotationGeneratorIcsProp(eventBlock, 'SUMMARY').value, knownNames);
    if (!parsed) return;
    const dates = adminRotationGeneratorIcsDateRange(adminRotationGeneratorIcsProp(eventBlock, 'DTSTART'), adminRotationGeneratorIcsProp(eventBlock, 'DTEND'));
    dates.forEach((iso) => {
      const dayIdx = dayIsoToIndex.get(iso);
      if (!Number.isFinite(dayIdx) || !result[dayIdx]) return;
      const key = String(dayIdx) + '|' + adminRotationNameLookupKey(parsed.person) + '|' + adminRotationNameLookupKey(parsed.code);
      if (seen.has(key)) return;
      seen.add(key);
      result[dayIdx].rows.push({ person: parsed.person, code: parsed.code });
    });
  });
  return result;
}

function adminRotationGeneratorMergeAbsences(existing, imported) {
  const days = adminRotationGeneratorGetWizardDaysForCollection();
  const base = adminRotationGeneratorAlignAbsencesToDays(days, existing);
  const source = adminRotationGeneratorAlignAbsencesToDays(days, imported);
  return base.map((day, dayIdx) => {
    const rows = [];
    const seen = new Set();
    const addRow = (row) => {
      const person = adminRotationCanonicalName(row && row.person || '', adminGetKnownNames());
      const code = String(row && row.code || '').trim();
      if (!person && !code) {
        rows.push({ person: '', code: '' });
        return;
      }
      if (!person || !code) {
        rows.push({ person, code });
        return;
      }
      const key = adminRotationNameLookupKey(person) + '|' + adminRotationNameLookupKey(code);
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({ person, code });
    };
    (Array.isArray(day.rows) ? day.rows : []).forEach(addRow);
    (Array.isArray(source[dayIdx] && source[dayIdx].rows) ? source[dayIdx].rows : []).forEach(addRow);
    return { date: day.date, rows };
  });
}

async function adminRotationGeneratorLoadCalendarAbsences() {
  const state = adminRotationGeneratorGetWizardState();
  state.days = adminRotationGeneratorResolveWizardDays(state);
  state.absencesByDay = adminRotationGeneratorCollectAbsencesFromDom();
  const status = document.getElementById('adminOnlineSaveStatus');
  if (status) status.textContent = 'Načítám dovolené z Google kalendáře...';
  try {
    const bridge = window.RotationSupabaseBridge;
    const accessToken = bridge && typeof bridge.getAdminAccessToken === 'function'
      ? await bridge.getAdminAccessToken()
      : '';
    if (!accessToken) throw new Error('admin-auth-required');
    const response = await fetch(ADMIN_ROTATION_GENERATOR_ABSENCE_ICS_URL, {
      cache: 'no-store',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        apikey: String(window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.publishableKey || '')
      }
    });
    if (!response || !response.ok) throw new Error('HTTP ' + String(response && response.status || ''));
    const text = await response.text();
    const imported = adminRotationGeneratorParseIcsAbsences(text, state.monthKey, state.days);
    const importedCount = imported.reduce((sum, day) => sum + (Array.isArray(day.rows) ? day.rows.length : 0), 0);
    state.absencesByDay = adminRotationGeneratorMergeAbsences(state.absencesByDay, imported);
    adminRotationGeneratorRenderWizard('absences');
    const nextStatus = document.getElementById('adminOnlineSaveStatus');
    if (nextStatus) nextStatus.textContent = importedCount
      ? ('Načteno z kalendáře: ' + String(importedCount) + ' absencí. Ručně zadané řádky zůstaly zachované.')
      : 'V kalendáři jsem pro vybraný měsíc nenašel žádné známé absence.';
    return { ok: true, importedCount };
  } catch (err) {
    const failStatus = document.getElementById('adminOnlineSaveStatus');
    if (failStatus) failStatus.textContent = 'Kalendář se nepodařilo načíst. Zkontroluj přihlášení nebo dostupnost Google kalendáře.';
    return { ok: false, error: err && err.message ? err.message : String(err || 'neznámá chyba') };
  }
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
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="generator-load-calendar-absences">Načíst dovolené z kalendáře</button>',
    '  </div>',
    '  <div class="adminRotationGeneratorAbsenceList">' + (blocks || '<div class="smallText">Nejsou vybrané žádné pracovní dny.</div>') + '</div>',
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="generator-back-days">Zpět na dny</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="generator-run">Vygenerovat rozpis</button>',
    '  </div>',
    '</div>'
  ].join('');
}

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
    || (state && state.result ? adminRotationGeneratorGetPendingDraft(state.monthKey) : null);
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
      const person = adminRotationCanonicalPeopleText(row.person || '', adminGetKnownNames());
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
  if (action === 'generator-load-calendar-absences') {
    adminRotationGeneratorLoadCalendarAbsences();
    return true;
  }
  if (action === 'generator-download-excel') {
    adminRotationGeneratorDownloadExcel(state.monthKey || app.selectedMonth);
    return true;
  }
  if (action === 'generator-open-editor') {
    const applied = adminRotationGeneratorOpenDraftInEditor(state, body);
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
      adminRotationGeneratorClearPendingDraft(state.monthKey);
      const preparedMonth = adminRotationGeneratorEnsurePreparedMonthFromWizard();
      const result = adminGenerateRotationMonthDraft(state.monthKey, preparedMonth);
      state.result = result;
      const warnings = Array.isArray(result && result.ruleWarnings) ? result.ruleWarnings : [];
      const warningText = warnings.length ? (' · upozornění: ' + String(warnings.length) + (warnings[0] && warnings[0].message ? ' (' + warnings[0].message + ')' : '')) : '';
      state.resultText = result && result.filledCells > 0
        ? ('Návrh vygenerovaný lokálně ✓ · dnů: ' + String(result.days || 0) + ' · políček: ' + String(result.filledCells || 0) + ' · absence: ' + String(result.blockedByAbsence || 0) + warningText + '.')
        : 'Návrh se nepodařilo vygenerovat. Vrať se na krok Dny a zkontroluj, že jsou vybrané pracovní dny.';
    } catch (err) {
      adminRotationGeneratorClearPendingDraft(state.monthKey);
      state.result = null;
      state.resultText = 'Návrh se nepodařilo vygenerovat: ' + (err && err.message ? err.message : String(err || 'neznámá chyba'));
    }
    adminRotationGeneratorRenderWizard('result');
    return true;
  }
  return false;
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

try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-generator-wizard.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}
