// RaK – editor rozpisu a absence oddělené z admin-rotation.js.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-editor.js', 'loading', { source: 'dynamic-loader' }); } catch (err) {}

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


function adminRotationComparableMonth(value) {
  const month = value && typeof value === 'object' ? value : {};
  const normalizeRows = (section) => (Array.isArray(section && section.rows) ? section.rows : []).map((row) => ({
    date: String(row && row.date || '').trim(),
    cells: (Array.isArray(row && row.cells) ? row.cells : []).map((cell) => String(cell || '').trim())
  }));
  const notes = (Array.isArray(month.notes) ? month.notes : []).map((note) => ({
    date: String(note && note.date || '').trim(),
    person: String(note && note.person || '').trim(),
    code: String(note && note.code || '').trim(),
    shift: String(note && note.shift || '').trim(),
    text: String(note && note.text || '').trim()
  })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), 'cs'));
  const pressRotationOverrides = Object.entries(month.pressRotationOverrides || {})
    .map(([key, value]) => [String(key), String(value)])
    .sort((a, b) => a[0].localeCompare(b[0], 'cs'));
  return JSON.stringify({
    hard: normalizeRows(month.hard),
    soft: normalizeRows(month.soft),
    notes,
    pressRotationOverrides
  });
}

function adminRotationHasManualDomChanges(monthKey, normalizedMonth) {
  const current = normalizedMonth || readAdminRotationFromDom(monthKey);
  let baseline = null;
  try {
    if (typeof adminRotationGeneratorGetPendingDraft === 'function') baseline = adminRotationGeneratorGetPendingDraft(monthKey);
  } catch (err) {}
  if (!baseline) baseline = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  if (!baseline) return true;
  return adminRotationComparableMonth(current) !== adminRotationComparableMonth(baseline);
}

function adminRotationBuildManualRuleOverrideState(monthKey, normalizedMonth) {
  const normalized = normalizedMonth || readAdminRotationFromDom(monthKey);
  const ruleCheck = adminRotationValidateMonthRules(normalized, monthKey, { source: 'manual-save' });
  const blockingIssues = (Array.isArray(ruleCheck.issues) ? ruleCheck.issues : [])
    .filter((issue) => issue && issue.severity === 'error');
  return { normalized, ruleCheck, blockingIssues };
}

function adminRotationConfirmManualRuleOverride(state) {
  const blocking = state && Array.isArray(state.blockingIssues) ? state.blockingIssues : [];
  if (!blocking.length) return true;
  const limit = 10;
  const lines = blocking.slice(0, limit).map((issue, idx) => String(idx + 1) + '. ' + String(issue && issue.message || 'Porušení pravidla'));
  if (blocking.length > limit) lines.push('… a dalších ' + String(blocking.length - limit) + ' porušení.');
  const text = [
    'Ruční změna porušuje pravidla rozpisu:',
    '',
    ...lines,
    '',
    'Chceš rozpis přesto uložit?',
    '',
    'OK = Uložit i přes varování',
    'Zrušit = Zpět a opravit'
  ].join('\n');
  return window.confirm(text);
}

async function saveAdminRotationFromDom(monthKey, options) {
  if (!monthKey) throw new Error('Chybí měsíc.');
  const opts = options || {};
  const previousRotationSnapshot = app.rotation ? JSON.parse(JSON.stringify(app.rotation)) : null;
  const normalized = opts.normalizedMonth || readAdminRotationFromDom(monthKey);
  const ruleCheck = opts.ruleCheck || adminRotationValidateMonthRules(normalized, monthKey, { source: opts.manualOverride ? 'manual-save' : 'save' });
  if (!ruleCheck.ok && opts.allowRuleViolations !== true) {
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
        try {
          const overrideCount = Array.isArray(opts.manualOverrideIssues) ? opts.manualOverrideIssues.length : 0;
          await rakAdminLogChange('Rozpis', 'Uložen měsíc ' + String(monthKey || '') + (overrideCount ? ' · ruční výjimky: ' + String(overrideCount) : ''));
        } catch (err) {}
      }
    }
  }
  const manualOverrideIssues = Array.isArray(opts.manualOverrideIssues) ? opts.manualOverrideIssues.slice() : [];
  if (!saveResult || saveResult.ok === false) {
    if (typeof app !== 'undefined' && app) app.adminRotationDirty = true;
    return { normalized, saveResult: saveResult || { ok: false, reason: 'admin-required' }, ruleCheck, manualOverrideIssues, preservedDraft: true };
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
  return { normalized, saveResult, ruleCheck, manualOverrideIssues };
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

try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('admin-rotation-editor.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}
