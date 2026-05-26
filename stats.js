function renderMonthGrid() {
  const monthSelect = document.getElementById("monthSelect");
  if (!monthSelect) return;
  const months = getMonthsForYear(app.rotation, parseInt(app.selectedYear, 10));
  const currentMonthKey = typeof monthKeyFromYearMonth === 'function'
    ? monthKeyFromYearMonth(new Date().getFullYear(), new Date().getMonth() + 1)
    : '';

  const selected = months.includes(app.selectedMonth)
    ? app.selectedMonth
    : (months.includes(currentMonthKey) ? currentMonthKey : (months[0] || ""));
  const monthOptions = [{ value: '', label: 'Vyber měsíc…' }]
    .concat(months.map(monthKey => ({ value: monthKey, label: monthKey })));
  if (typeof setSelectOptionsIfChanged === 'function') {
    setSelectOptionsIfChanged(monthSelect, monthOptions, selected, 'monthSelect');
  } else {
    while (monthSelect.firstChild) monthSelect.removeChild(monthSelect.firstChild);
    monthOptions.forEach(item => {
      const opt = document.createElement('option');
      opt.value = String(item.value || '');
      opt.textContent = String(item.label || '');
      if (String(item.value || '') === String(selected || '')) opt.selected = true;
      monthSelect.appendChild(opt);
    });
  }
  monthSelect.value = selected;
  app.selectedMonth = selected || null;

}


if (typeof window.normalizeShiftText !== 'function') {
  window.normalizeShiftText = function normalizeShiftText(text) {
    const raw = String(text || '').trim().replace(/\s+/g, ' ');
    if (!raw) return '';
    const parts = raw.split(' ');
    const dedup = [];
    for (const part of parts) {
      if (dedup.length === 0 || dedup[dedup.length - 1] !== part) dedup.push(part);
    }
    return dedup.join(' ').trim();
  };
}


if (typeof window.parseDateToken !== 'function') {
  window.parseDateToken = function parseDateToken(token) {
    const m = /^(\d{1,2})\.(\d{1,2})\.\s*(.*)$/.exec(String(token || ''));
    if (!m) return null;
    return {
      day: parseInt(m[1], 10),
      month: parseInt(m[2], 10),
      shift: typeof normalizeShiftText === 'function' ? normalizeShiftText(m[3] || '') : String(m[3] || '').trim().replace(/\s+/g, ' '),
      sortDate: new Date(2026, parseInt(m[2], 10) - 1, parseInt(m[1], 10)).toISOString()
    };
  };
}

if (typeof window.absenceLabelFromCode !== 'function') {
  window.absenceLabelFromCode = function absenceLabelFromCode(code) {
    const raw = String(code || '').trim();
    if (!raw) return '';
    const key = raw.toUpperCase();
    const labels = { D: 'Dovolená', NV: 'Náhradní volno', Š: 'Školení', '§': 'Paragraf', S: 'Senior', L: 'Lázně' };
    if (labels[key]) return labels[key];
    if (/^\d+(?:[.,]\d+)?$/.test(raw)) return '';
    return raw;
  };
}

if (typeof window.sanitizeAbsencePersonName !== 'function') {
  window.sanitizeAbsencePersonName = function sanitizeAbsencePersonName(text) {
    return String(text || '')
      .trim()
      .replace(/\s+(?:od|do)\b.*$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  };
}

if (typeof window.splitAbsencePeople !== 'function') {
  window.splitAbsencePeople = function splitAbsencePeople(text) {
    const raw = String(text || '').trim();
    if (!raw) return [];
    return raw
      .replace(/\s+(?:a|i|&|\/)\s+/gi, ' | ')
      .replace(/[,;+]/g, ' | ')
      .split(/\s*\|\s*/g)
      .map(part => part.trim())
      .filter(Boolean)
      .filter(part => !/^od\s+\d/i.test(part));
  };
}

if (typeof window.looksLikeAbsencePerson !== 'function') {
  window.looksLikeAbsencePerson = function looksLikeAbsencePerson(text) {
    const t = String(text || '').trim();
    if (!t) return false;
    if (/\d/.test(t)) return false;
    if (/\bdo\b/i.test(t)) return false;
    if (/[:/]/.test(t)) return false;
    return true;
  };
}

if (typeof window.normalizeNoteEntry !== 'function') {
  window.normalizeNoteEntry = function normalizeNoteEntry(note) {
    const date = String(note && note.date ? note.date : '').trim();
    const shiftFromDate = typeof parseDateToken === 'function' ? parseDateToken(date) : null;
    let shift = typeof normalizeShiftText === 'function'
      ? normalizeShiftText(String(note && note.shift ? note.shift : (shiftFromDate ? shiftFromDate.shift : '')) || '')
      : String(note && note.shift ? note.shift : (shiftFromDate ? shiftFromDate.shift : '') || '').trim();
    let person = typeof sanitizeAbsencePersonName === 'function' ? sanitizeAbsencePersonName(note && note.person ? note.person : '') : String(note && note.person ? note.person : '').trim();
    let code = String(note && note.code ? note.code : '').trim();
    let text = String(note && note.text ? note.text : '').trim();
    let people = [];

    if (!person && text) {
      const tokens = text.split(/\s+/).filter(Boolean);
      let start = 0;
      if (tokens[start] && /^\d{1,2}\.\d{1,2}\.$/.test(tokens[start])) start += 1;
      if (tokens[start] && /^(?:N8|R8|N|R)$/i.test(tokens[start])) {
        if (!shift) shift = normalizeShiftText(tokens[start].toUpperCase());
        start += 1;
      }
      const remaining = tokens.slice(start);
      if (remaining.length >= 2 && typeof absenceLabelFromCode === 'function' && absenceLabelFromCode(remaining[remaining.length - 1])) {
        code = code || remaining[remaining.length - 1];
        const peopleText = remaining.slice(0, -1).join(' ').trim();
        people = (typeof splitAbsencePeople === 'function' ? splitAbsencePeople(peopleText) : [peopleText]).map(v => sanitizeAbsencePersonName(v)).filter(Boolean);
        person = sanitizeAbsencePersonName(people[0] || peopleText);
      } else if (remaining.length === 1 && !(typeof absenceLabelFromCode === 'function' && absenceLabelFromCode(remaining[0]))) {
        person = sanitizeAbsencePersonName(remaining[0]);
      } else if (remaining.length > 1) {
        person = sanitizeAbsencePersonName(remaining.join(' '));
      }
    }

    if (!people.length && person) people = [person];
    return { date, shift, person, code, text, people, isAbsence: !!(people.length || code || /\b(?:dovolen|absence|lázn|školen|paragraf|volno)\b/i.test(text)) };
  };
}


if (typeof window.estimateAbsenceWeight !== 'function') {
  window.estimateAbsenceWeight = function estimateAbsenceWeight(note) {
    const text = String(note && note.text ? note.text : '').trim();
    const code = String(note && note.code ? note.code : '').trim();
    const haystack = (text + ' ' + code).trim();
    if (!haystack) return 1;
    if (/\b(?:od|do)\b/i.test(haystack)) return 0.5;
    if (/\b(?:0[,\.]5|1\/2|půl|pul|polovina)\b/i.test(haystack)) return 0.5;
    return 1;
  };
}
function getStatsMachineLabel(machine) {
  const name = String(machine || "").trim();
  if (!name) return "";

  if (/^MSKC\d+$/i.test(name)) return "MSK";
  if (/^MFKF\d+$/i.test(name)) return "MFK";
  if (name === "TNKS01") return "TNK";
  if (/^TBKR\d+$/i.test(name)) return "TBK";
  if (name === "TPKW02") return "W02";
  if (name === "TPKW01") return "W01";

  return name;
}

function getStatsMachineOrder(machineKeys) {
  const preferred = ["MSK", "MFK", "TNK", "TBK", "W02", "W01"];
  const keys = Array.isArray(machineKeys) ? machineKeys.slice() : [];
  const out = [];

  preferred.forEach(key => {
    if (keys.includes(key)) out.push(key);
  });

  keys
    .filter(key => !preferred.includes(key))
    .sort((a, b) => a.localeCompare(b, "cs"))
    .forEach(key => out.push(key));

  return out;
}

function getBestEntry(counts) {
  const items = Object.entries(counts || {}).map(([key, value]) => [String(key || '').trim(), Number(value) || 0]).filter(([, value]) => value > 0);
  if (!items.length) return null;
  return items.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0], 'cs');
  })[0];
}


function getBestEntries(counts) {
  const items = Object.entries(counts || {}).map(([key, value]) => [String(key || '').trim(), Number(value) || 0]).filter(([, value]) => value > 0);
  if (!items.length) return [];
  const maxValue = Math.max(...items.map(([, value]) => value));
  return items
    .filter(([, value]) => value === maxValue)
    .sort((a, b) => a[0].localeCompare(b[0], 'cs'));
}

function getTopEntries(counts, limit = 3) {
  const items = Object.entries(counts || {})
    .map(([key, value]) => [String(key || '').trim(), Number(value) || 0])
    .filter(([, value]) => value > 0)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0], 'cs');
    });
  return items.slice(0, limit);
}

function formatMachineWinners(entries) {
  const list = Array.isArray(entries) ? entries : [];
  if (!list.length) return '—';
  return list.map(([name, value]) => name + ' (' + formatCount(value) + ')').join('\n');
}


const RAK_KNOWN_ANNUAL_WORK_ABSENCE_TARGETS = {
  // Rok 2025 měl podle ověřeného rozpisu roční fond 164 směn.
  // Další roky se nesmí dorovnávat na 164 naslepo — každý rok může mít jiný fond.
  2025: 164
};

function getAnnualWorkAbsenceTarget(year) {
  const numericYear = parseInt(year, 10);
  if (!Number.isFinite(numericYear)) return null;
  if (Object.prototype.hasOwnProperty.call(RAK_KNOWN_ANNUAL_WORK_ABSENCE_TARGETS, numericYear)) {
    return RAK_KNOWN_ANNUAL_WORK_ABSENCE_TARGETS[numericYear];
  }
  return null;
}

function applyAnnualWorkAbsenceTarget(person, target) {
  const numericTarget = Number(target);
  if (!Number.isFinite(numericTarget) || numericTarget <= 0 || !person) return;
  const absence = Math.max(0, Number(person.totalAbsence || 0) || 0);
  person.annualWorkAbsenceTarget = numericTarget;
  person.totalWork = Math.max(0, numericTarget - absence);
}

function shouldIncludeMonthInStats(parsedMonth, selectedYear) {
  if (!parsedMonth || parsedMonth.year !== selectedYear) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  // v.1.5 (743): u aktuálního roku nepočítat importované budoucí měsíce.
  // Celý rok 2026 může být nahraný kvůli plánování, ale statistiky mají zatím končit aktuálním měsícem.
  if (selectedYear > currentYear) return false;
  if (selectedYear === currentYear) return parsedMonth.month <= currentMonth;
  return true;
}

function getStatsFutureMonthScopeNote(year, stats) {
  const selectedYear = parseInt(year, 10);
  if (!Number.isFinite(selectedYear)) return '';
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (selectedYear !== currentYear) return '';
  const monthKeys = typeof getMonthsForYear === 'function' && window.app && Array.isArray(window.app.rotation) ? getMonthsForYear(window.app.rotation, selectedYear) : (Array.isArray(stats && stats.includedMonthKeys) ? stats.includedMonthKeys : []);
  const futureMonths = monthKeys
    .map(key => {
      const parsed = typeof parseMonthKey === 'function' ? parseMonthKey(key) : null;
      return parsed ? { key, year: parsed.year, month: parsed.month } : null;
    })
    .filter(item => item && item.year === selectedYear && item.month > currentMonth)
    .map(item => item.key);
  if (!futureMonths.length) return '';
  return 'Nahrané budoucí měsíce (' + futureMonths.join(', ') + ') jsou zatím jen pro plánování. Do statistik se započítají až v daném měsíci.';
}


function inferWorkAbsenceTargetForStats(people, explicitTarget) {
  const numericExplicit = Number(explicitTarget);
  if (Number.isFinite(numericExplicit) && numericExplicit > 0) return numericExplicit;
  const sums = (Array.isArray(people) ? people : [])
    .map(person => Math.round(((Number(person && person.totalWork || 0) || 0) + (Number(person && person.totalAbsence || 0) || 0)) * 10) / 10)
    .filter(value => Number.isFinite(value) && value > 0);
  if (!sums.length) return null;
  // v.1.5 (743): pro aktuální/částečný rok dopočítat společný fond podle nejúplnějšího záznamu.
  // Import 2026 má nahraný celý rok kvůli rozpisům, ale statistiky k 05/2026 mají všem držet 73.
  return Math.max(...sums);
}

function buildStatsForYear(year) {
  const stats = {
    year,
    people: {},
    names: [],
    machineTotals: {},
    cleanTotals: {},
    absenceTotals: {},
    machineCleanLeaders: {},
    machineTopWorkers: {},
    includedMonthKeys: []
  };

  const ensureColumn = (label) => {
    const key = String(label || "").trim();
    if (!key) return "";
    if (!(key in stats.machineTotals)) {
      stats.machineTotals[key] = 0;
      stats.cleanTotals[key] = 0;
      stats.absenceTotals[key] = 0;
    }
    return key;
  };

  const ensurePerson = (name) => {
    if (!stats.people[name]) {
      stats.people[name] = {
        name,
        work: {},
        clean: {},
        absence: {},
        totalWork: 0,
        totalClean: 0,
        totalAbsence: 0,
        workDays: new Set(),
        topWorkMachine: null,
        topCleanMachine: null,
        topWorkMachines: [],
        topCleanMachines: []
      };
    }
    return stats.people[name];
  };

  const nameIndex = buildNameIndex(app.rotation);
  const knownStatNames = getKnownStatNames();
  const annualWorkAbsenceTarget = getAnnualWorkAbsenceTarget(year);
  const includedMonthSet = new Set();

  Object.entries(app.rotation.months || {}).forEach(([monthKey, month]) => {
    const parsedMonth = parseMonthKey(monthKey);
    if (!shouldIncludeMonthInStats(parsedMonth, year)) return;
    includedMonthSet.add(monthKey);

    ["hard", "soft"].forEach(section => {
      const sec = month[section];
      if (!sec || !Array.isArray(sec.rows)) return;

      sec.rows.forEach(row => {
        const parsedDate = typeof parseDateToken === 'function' ? parseDateToken(row.date) : null;
        if (!parsedDate) return;
        const isSunday = isSundayForMonthKey(monthKey, parsedDate.day);
        const isSundayMorning = isSunday && /^R/.test(parsedDate.shift || "");

        const rowNames = new Set();

        (row.cells || []).forEach((cell, idx) => {
          const name = String(cell || "").trim();
          const machine = (sec.machines || [])[idx] || "";
          if (!name || !machine || !knownStatNames.has(name)) return;

          rowNames.add(name);
          const person = ensurePerson(name);
          // TNKS01 + TPKW01: mimo neděli se střídá půl směny/půl směny; v neděli se nepůlí.
          const isPairMachine = section === "hard" && (machine === "TNKS01" || machine === "TPKW01");

          if (isPairMachine) {
            if (isSunday) {
              const column = ensureColumn(getStatsMachineLabel(machine));
              if (column) {
                person.work[column] = (person.work[column] || 0) + 1;
                stats.machineTotals[column] = (stats.machineTotals[column] || 0) + 1;
              }
            } else {
              ["TNK", "W01"].forEach(columnName => {
                const column = ensureColumn(columnName);
                if (!column) return;
                person.work[column] = (person.work[column] || 0) + 0.5;
                stats.machineTotals[column] = (stats.machineTotals[column] || 0) + 0.5;
              });
            }
          } else {
            const column = ensureColumn(getStatsMachineLabel(machine));
            if (!column) return;
            person.work[column] = (person.work[column] || 0) + 1;
            stats.machineTotals[column] = (stats.machineTotals[column] || 0) + 1;
          }

          if (isSundayMorning) {
            const cleanColumn = ensureColumn(getStatsMachineLabel(machine));
            if (cleanColumn) {
              person.clean[cleanColumn] = (person.clean[cleanColumn] || 0) + 1;
              person.totalClean += 1;
              stats.cleanTotals[cleanColumn] = (stats.cleanTotals[cleanColumn] || 0) + 1;
            }
          }
        });

        rowNames.forEach(name => {
          const person = ensurePerson(name);
          const dayKey = `${monthKey}|${row.date}|${name}`;
          if (!person.workDays.has(dayKey)) {
            person.workDays.add(dayKey);
            person.totalWork += 1;
          }
        });
      });
    });
  });

  Object.entries(app.rotation.months || {}).forEach(([monthKey, month]) => {
    const parsedMonth = parseMonthKey(monthKey);
    if (!shouldIncludeMonthInStats(parsedMonth, year)) return;

    (month.notes || []).forEach(note => {
      const n = normalizeNoteEntry(note);
      if (!n.isAbsence || !n.people || !n.people.length) return;

      const parsedDate = typeof parseDateToken === 'function' ? parseDateToken(n.date) : null;
      const shift = n.shift || (parsedDate ? parsedDate.shift : "");
      const weight = typeof estimateAbsenceWeight === 'function' ? estimateAbsenceWeight(n) : 1;
      n.people.forEach(personName => {
        const name = String(personName || "").trim();
        if (!name || !knownStatNames.has(name)) return;

        const person = ensurePerson(name);
        const candidates = (nameIndex[name] || []).filter(entry => {
          if (entry.absence) return false;
          if (entry.monthKey !== monthKey) return false;
          if (entry.date !== n.date) return false;
          if (shift && entry.shift && entry.shift !== shift) return false;
          return true;
        });

        const chosen = candidates[0] || (nameIndex[name] || []).find(entry => !entry.absence && entry.monthKey === monthKey && entry.date === n.date);
        if (chosen && chosen.machine) {
          const column = ensureColumn(getStatsMachineLabel(chosen.machine));
          if (column) {
            person.absence[column] = (person.absence[column] || 0) + weight;
            stats.absenceTotals[column] = (stats.absenceTotals[column] || 0) + weight;
            person.work[column] = Math.max(0, (Number(person.work[column] || 0) || 0) - weight);
            stats.machineTotals[column] = Math.max(0, (Number(stats.machineTotals[column] || 0) || 0) - weight);
          }
        }
        person.totalAbsence += weight;
        person.totalWork = Math.max(0, (Number(person.totalWork || 0) || 0) - weight);
      });
    });
  });

  const resolvedWorkAbsenceTarget = inferWorkAbsenceTargetForStats(Object.values(stats.people), annualWorkAbsenceTarget);

  Object.values(stats.people).forEach(person => {
    Object.keys(person.work).forEach(column => {
      if (typeof person.work[column] === "number") person.work[column] = Math.round(person.work[column] * 10) / 10;
    });
    Object.keys(person.absence).forEach(column => {
      if (typeof person.absence[column] === "number") person.absence[column] = Math.round(person.absence[column] * 10) / 10;
    });
    person.totalAbsence = Math.round((Number(person.totalAbsence) || 0) * 10) / 10;
    person.totalWork = Math.round((Math.max(0, Number(person.totalWork || 0))) * 10) / 10;
    // v.1.5 (743): známý fond 2025 zůstává 164, aktuální rok se dopočítá jen z měsíců, které už patří do statistik.
    applyAnnualWorkAbsenceTarget(person, resolvedWorkAbsenceTarget);
    person.totalWork = Math.round((Math.max(0, Number(person.totalWork || 0))) * 10) / 10;
    person.totalClean = Math.round((Number(person.totalClean) || 0) * 10) / 10;

    person.topWorkMachine = getBestEntry(person.work);
    person.topCleanMachine = getBestEntry(person.clean);
    person.topWorkMachines = getBestEntries(person.work);
    person.topCleanMachines = getBestEntries(person.clean);
  });
  stats.includedMonthKeys = Array.from(includedMonthSet).sort((a, b) => {
    const pa = parseMonthKey(a);
    const pb = parseMonthKey(b);
    if (!pa || !pb) return String(a).localeCompare(String(b), 'cs');
    return (pa.year - pb.year) || (pa.month - pb.month);
  });

  Object.keys(stats.machineTotals).forEach(column => {
    if (typeof stats.machineTotals[column] === "number") stats.machineTotals[column] = Math.round(stats.machineTotals[column] * 10) / 10;
  });
  Object.keys(stats.absenceTotals).forEach(column => {
    if (typeof stats.absenceTotals[column] === "number") stats.absenceTotals[column] = Math.round(stats.absenceTotals[column] * 10) / 10;
  });
  Object.keys(stats.cleanTotals).forEach(column => {
    if (typeof stats.cleanTotals[column] === "number") stats.cleanTotals[column] = Math.round(stats.cleanTotals[column] * 10) / 10;
  });

  stats.names = Object.keys(stats.people).filter(name => KNOWN_STAT_NAMES.has(name)).sort((a, b) => a.localeCompare(b, "cs"));
  stats.machineOrder = getStatsMachineOrder(Object.keys(stats.machineTotals));

  stats.machineOrder.forEach(machine => {
    const leaders = [];
    let maxClean = 0;
    const workers = [];
    Object.values(stats.people).forEach(person => {
      const cleanCount = Number(person.clean[machine] || 0);
      if (cleanCount <= 0) return;
      if (cleanCount > maxClean) {
        maxClean = cleanCount;
        leaders.length = 0;
        leaders.push(person.name);
      } else if (cleanCount === maxClean) {
        leaders.push(person.name);
      }

      const workCount = Number(person.work[machine] || 0);
      if (workCount > 0) workers.push([person.name, workCount]);
    });
    if (leaders.length) stats.machineCleanLeaders[machine] = { names: leaders.sort((a, b) => a.localeCompare(b, 'cs')), clean: maxClean };
    if (workers.length) {
      workers.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'cs'));
      stats.machineTopWorkers[machine] = workers.slice(0, 3).map(item => item[0]);
    } else {
      stats.machineTopWorkers[machine] = [];
    }
  });

  return stats;
}




function bindStatsGridDelegates() {
  const statsNameGrid = document.getElementById("statsNameGrid");
  const statsMachineGrid = document.getElementById("statsMachineGrid");

  const activateNameTile = (target) => {
    const tile = target && typeof target.closest === 'function' ? target.closest('[data-stats-name]') : null;
    if (!tile) return false;
    const name = tile.getAttribute('data-stats-name') || '';
    if (!name) return false;
    setSelectedStatsName(name);
    return true;
  };

  const activateMachineTile = (target) => {
    const tile = target && typeof target.closest === 'function' ? target.closest('[data-stats-machine]') : null;
    if (!tile) return false;
    const machine = tile.getAttribute('data-stats-machine') || '';
    if (!machine) return false;
    setSelectedStatsMachine(machine);
    return true;
  };

  if (statsNameGrid && statsNameGrid.dataset.statsDelegateBound !== '1') {
    statsNameGrid.dataset.statsDelegateBound = '1';
    statsNameGrid.addEventListener('click', (event) => activateNameTile(event.target));
    statsNameGrid.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      if (activateNameTile(event.target)) event.preventDefault();
    });
  }

  if (statsMachineGrid && statsMachineGrid.dataset.statsDelegateBound !== '1') {
    statsMachineGrid.dataset.statsDelegateBound = '1';
    statsMachineGrid.addEventListener('click', (event) => activateMachineTile(event.target));
    statsMachineGrid.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      if (activateMachineTile(event.target)) event.preventDefault();
    });
  }
}

function createStatsTile(kind, value, active) {
  const tile = document.createElement('div');
  tile.className = 'listItem ' + (kind === 'machine' ? 'statsMachineTile' : 'statsNameTile') + (active ? ' activeChoice' : '');
  tile.setAttribute('role', 'button');
  tile.setAttribute('tabindex', '0');
  tile.setAttribute(kind === 'machine' ? 'data-stats-machine' : 'data-stats-name', String(value || ''));

  const main = document.createElement('div');
  main.className = 'statsTileMain';

  const title = document.createElement('div');
  title.className = 'statsTileTitle';
  title.textContent = String(value || '');

  main.appendChild(title);
  tile.appendChild(main);
  return tile;
}

function renderStatsNameGridNodes(names) {
  return (Array.isArray(names) ? names : []).map(name => createStatsTile('name', name, app.selectedStatsName === name));
}

function renderStatsMachineGridNodes(stats) {
  const order = stats && Array.isArray(stats.machineOrder) ? stats.machineOrder : [];
  return order.map(machine => createStatsTile('machine', machine, app.selectedStatsMachine === machine));
}


function createStatsTextNode(tagName, className, text) {
  const node = document.createElement(tagName || 'div');
  if (className) node.className = className;
  node.textContent = String(text ?? '');
  return node;
}

function createStatsSummaryTile(label, value, valueClassName) {
  const tile = document.createElement('div');
  tile.className = 'tile';
  tile.appendChild(createStatsTextNode('div', 'smallText', label));
  tile.appendChild(createStatsTextNode('div', valueClassName || 'statsSummaryValue', value));
  return tile;
}

function renderStatsNameViewNodes(person, year, stats, topWork, topClean) {
  if (!person || !stats) return [];

  const title = createStatsTextNode('div', 'sectionTitle', `${person.name} — ${year}`);
  const scopeNoteText = getStatsFutureMonthScopeNote(year, stats);
  const scopeNote = scopeNoteText ? createStatsTextNode('div', 'smallText statsScopeNote', scopeNoteText) : null;

  const summary = document.createElement('div');
  summary.className = 'statsSummary';
  summary.appendChild(createStatsSummaryTile('Práce celkem', formatCount(person.totalWork)));
  summary.appendChild(createStatsSummaryTile('Úklid celkem', formatCount(person.totalClean)));
  summary.appendChild(createStatsSummaryTile('Absence celkem', formatCount(person.totalAbsence)));
  summary.appendChild(createStatsSummaryTile('Práce + absence', formatCount(person.totalWork + person.totalAbsence)));
  summary.appendChild(createStatsSummaryTile('Nejvíc pracoval na', topWork, 'statsMultiLine statsSummaryValueCompact'));
  summary.appendChild(createStatsSummaryTile('Nejvíc uklízel na', topClean, 'statsMultiLine statsSummaryValueCompact'));

  const wrap = document.createElement('div');
  wrap.className = 'tableWrap';

  const table = document.createElement('table');
  table.className = 'statsTable';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Stroj', 'Práce', 'Úklid'].forEach(label => {
    const th = document.createElement('th');
    th.textContent = label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement('tbody');
  (Array.isArray(stats.machineOrder) ? stats.machineOrder : []).forEach(machine => {
    const row = document.createElement('tr');
    [machine, formatCount(person.work[machine] || 0), formatCount(person.clean[machine] || 0)].forEach(value => {
      const td = document.createElement('td');
      td.textContent = String(value ?? '');
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  wrap.appendChild(table);

  return [title].concat(scopeNote ? [scopeNote] : [], [summary, wrap]);
}

function renderStatsMachineViewNodes(machine, leaderNames, topWorkersText) {
  const title = createStatsTextNode('div', 'sectionTitle', machine);
  const summary = document.createElement('div');
  summary.className = 'statsSummary';
  summary.appendChild(createStatsSummaryTile('Letos nejvíc uklízeli', leaderNames, 'statsMultiLine statsSummaryValueCompact'));
  summary.appendChild(createStatsSummaryTile('Nejvíce tu byl', topWorkersText, 'statsMultiLine statsSummaryValueCompact'));
  return [title, summary];
}

function clearStatsViewElement(element, key) {
  if (!element) return;
  if (typeof setElementChildrenIfChanged === 'function') {
    setElementChildrenIfChanged(element, 'empty', () => [], key || 'statsView-empty');
    return;
  }
  if (typeof clearElementChildrenSafely === 'function') clearElementChildrenSafely(element, key || 'statsView-empty');
  else if (typeof element.replaceChildren === 'function') element.replaceChildren();
  else while (element.firstChild) element.removeChild(element.firstChild);
}

function renderStatsNameGridHtml(names) {
  return (Array.isArray(names) ? names : []).map(name => {
    const active = app.selectedStatsName === name ? ' activeChoice' : '';
    return [
      '<div class="listItem statsNameTile' + active + '" role="button" tabindex="0" data-stats-name="' + escapeHtml(name) + '">',
      '<div class="statsTileMain"><div class="statsTileTitle">' + escapeHtml(name) + '</div></div>',
      '</div>'
    ].join('');
  }).join('');
}

function renderStatsMachineGridHtml(stats) {
  const order = stats && Array.isArray(stats.machineOrder) ? stats.machineOrder : [];
  return order.map(machine => {
    const active = app.selectedStatsMachine === machine ? ' activeChoice' : '';
    return [
      '<div class="listItem statsMachineTile' + active + '" role="button" tabindex="0" data-stats-machine="' + escapeHtml(machine) + '">',
      '  <div class="statsTileMain">',
      '    <div class="statsTileTitle">' + escapeHtml(machine) + '</div>',
      '  </div>',
      '</div>'
    ].join('');
  }).join('');
}

function renderStatsPanel() {
  const statsNameGrid = document.getElementById("statsNameGrid");
  const statsMachineGrid = document.getElementById("statsMachineGrid");
  const statsNameView = document.getElementById("statsNameView");
  const statsMachineView = document.getElementById("statsMachineView");
  if (!statsNameGrid || !statsMachineGrid || !statsNameView || !statsMachineView) return;

  const year = parseInt(app.selectedYear, 10) || getInitialSelectedYear(app.rotation);
  const stats = buildStatsForYear(year);

  if (app.selectedStatsMachine && !stats.machineOrder.includes(app.selectedStatsMachine)) {
    app.selectedStatsMachine = null;
  }
  if (app.selectedStatsName && !stats.people[app.selectedStatsName]) {
    app.selectedStatsName = null;
  }

  bindStatsGridDelegates();

  const statsNameGridFingerprint = JSON.stringify({ names: stats.names || [], selected: app.selectedStatsName || '' });
  if (typeof setElementChildrenIfChanged === 'function') {
    setElementChildrenIfChanged(statsNameGrid, statsNameGridFingerprint, () => renderStatsNameGridNodes(stats.names), 'statsNameGrid');
  } else {
    const statsNameGridHtml = renderStatsNameGridHtml(stats.names);
    if (typeof setElementHtmlIfChanged === 'function') setElementHtmlIfChanged(statsNameGrid, statsNameGridHtml, 'statsNameGrid');
    else statsNameGrid.innerHTML = statsNameGridHtml;
  }

  const statsMachineGridFingerprint = JSON.stringify({ machines: stats.machineOrder || [], selected: app.selectedStatsMachine || '' });
  if (typeof setElementChildrenIfChanged === 'function') {
    setElementChildrenIfChanged(statsMachineGrid, statsMachineGridFingerprint, () => renderStatsMachineGridNodes(stats), 'statsMachineGrid');
  } else {
    const statsMachineGridHtml = renderStatsMachineGridHtml(stats);
    if (typeof setElementHtmlIfChanged === 'function') setElementHtmlIfChanged(statsMachineGrid, statsMachineGridHtml, 'statsMachineGrid');
    else statsMachineGrid.innerHTML = statsMachineGridHtml;
  }

  if (app.selectedStatsName) {
    const person = stats.people[app.selectedStatsName];
    if (person) {
      const topWork = formatMachineWinners(person.topWorkMachines || (person.topWorkMachine ? [person.topWorkMachine] : []));
      const topClean = formatMachineWinners(person.topCleanMachines || (person.topCleanMachine ? [person.topCleanMachine] : []));
      const statsNameViewFingerprint = JSON.stringify({
        selected: person.name || '',
        year,
        totals: [person.totalWork, person.totalClean, person.totalAbsence],
        topWork,
        topClean,
        machines: (stats.machineOrder || []).map(machine => [machine, person.work[machine] || 0, person.clean[machine] || 0]),
        scopeNote: getStatsFutureMonthScopeNote(year, stats)
      });
      if (typeof setElementChildrenIfChanged === 'function') {
        setElementChildrenIfChanged(
          statsNameView,
          statsNameViewFingerprint,
          () => renderStatsNameViewNodes(person, year, stats, topWork, topClean),
          'statsNameView'
        );
      } else {
        const statsNameHtml =
          "<div class='sectionTitle'>" + escapeHtml(person.name) + " — " + escapeHtml(String(year)) + "</div>" +
          (getStatsFutureMonthScopeNote(year, stats) ? "<div class='smallText statsScopeNote'>" + escapeHtml(getStatsFutureMonthScopeNote(year, stats)) + "</div>" : "") +
          "<div class='statsSummary'>" +
          "<div class='tile'><div class='smallText'>Práce celkem</div><div class='statsSummaryValue'>" + formatCount(person.totalWork) + "</div></div>" +
          "<div class='tile'><div class='smallText'>Úklid celkem</div><div class='statsSummaryValue'>" + formatCount(person.totalClean) + "</div></div>" +
          "<div class='tile'><div class='smallText'>Absence celkem</div><div class='statsSummaryValue'>" + formatCount(person.totalAbsence) + "</div></div>" +
          "<div class='tile'><div class='smallText'>Práce + absence</div><div class='statsSummaryValue'>" + formatCount(person.totalWork + person.totalAbsence) + "</div></div>" +
          "<div class='tile'><div class='smallText'>Nejvíc pracoval na</div><div class='statsMultiLine statsSummaryValueCompact'>" + escapeHtml(topWork) + "</div></div>" +
          "<div class='tile'><div class='smallText'>Nejvíc uklízel na</div><div class='statsMultiLine statsSummaryValueCompact'>" + escapeHtml(topClean) + "</div></div>" +
          "</div>" +
          "<div class='tableWrap'><table class='statsTable'><thead><tr><th>Stroj</th><th>Práce</th><th>Úklid</th></tr></thead><tbody>" +
          stats.machineOrder.map(machine => "<tr><td>" + escapeHtml(machine) + "</td><td>" + formatCount(person.work[machine] || 0) + "</td><td>" + formatCount(person.clean[machine] || 0) + "</td></tr>").join("") +
          "</tbody></table></div>";
        if (typeof setElementHtmlIfChanged === 'function') setElementHtmlIfChanged(statsNameView, statsNameHtml, 'statsNameView');
        else statsNameView.innerHTML = statsNameHtml;
      }
    } else {
      clearStatsViewElement(statsNameView, 'statsNameView-empty');
    }
  } else {
    clearStatsViewElement(statsNameView, 'statsNameView-empty');
  }

  if (app.selectedStatsMachine) {
    const machine = app.selectedStatsMachine;
    const leader = stats.machineCleanLeaders[machine] || null;
    const leaderNames = leader && Array.isArray(leader.names) && leader.names.length
      ? leader.names.join('\n')
      : '—';
    const topWorkers = Object.values(stats.people)
      .map(person => [person.name, Number(person.work[machine] || 0)])
      .filter(([, value]) => value > 0)
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return a[0].localeCompare(b[0], 'cs');
      })
      .slice(0, 3);
    const topWorkersText = topWorkers.length
      ? topWorkers.map(([name, value], index) => `${index + 1}. ${name} (${formatCount(value)})`).join('\n')
      : '—';

    const statsMachineViewFingerprint = JSON.stringify({ machine, leaderNames, topWorkersText });
    if (typeof setElementChildrenIfChanged === 'function') {
      setElementChildrenIfChanged(
        statsMachineView,
        statsMachineViewFingerprint,
        () => renderStatsMachineViewNodes(machine, leaderNames, topWorkersText),
        'statsMachineView'
      );
    } else {
      const statsMachineHtml = [
        "<div class='sectionTitle'>" + escapeHtml(machine) + "</div>",
        "<div class='statsSummary'>",
        "<div class='tile'><div class='smallText'>Letos nejvíc uklízeli</div><div class='statsMultiLine statsSummaryValueCompact'>" + escapeHtml(leaderNames) + "</div></div>",
        "<div class='tile'><div class='smallText'>Nejvíce tu byl</div><div class='statsMultiLine statsSummaryValueCompact'>" + escapeHtml(topWorkersText) + "</div></div>",
        "</div>"
      ].join('');
      if (typeof setElementHtmlIfChanged === 'function') setElementHtmlIfChanged(statsMachineView, statsMachineHtml, 'statsMachineView');
      else statsMachineView.innerHTML = statsMachineHtml;
    }
  } else {
    clearStatsViewElement(statsMachineView, 'statsMachineView-empty');
  }
}

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function buildShiftIntervals(weekStart, cycleIndex) {
  const intervals = [];
  const add = (dayOffset, startHour, startMinute, endDayOffset, endHour, endMinute, label) => {
    intervals.push({
      start: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + dayOffset, startHour, startMinute, 0, 0),
      end: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + endDayOffset, endHour, endMinute, 0, 0),
      label
    });
  };

  const pushIfAllowed = (dayOffset, startHour, startMinute, endDayOffset, endHour, endMinute, label) => {
    const start = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + dayOffset, startHour, startMinute, 0, 0);
    if (isShiftStartBlocked(start)) return;
    intervals.push({
      start,
      end: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + endDayOffset, endHour, endMinute, 0, 0),
      label
    });
  };

  if (cycleIndex === 0) { // B
    pushIfAllowed(0, 6, 0, 0, 18, 0, "ranní");
    pushIfAllowed(1, 6, 0, 1, 18, 0, "ranní");
    pushIfAllowed(4, 18, 0, 5, 6, 0, "noční");
    pushIfAllowed(5, 18, 0, 6, 6, 0, "noční");
    const sundayDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6, 12, 0, 0, 0);
    const sundayNightStartHour = typeof getSpecialSundayNightStartHour === "function"
      ? getSpecialSundayNightStartHour(sundayDate, 22)
      : 22;
    pushIfAllowed(6, sundayNightStartHour, 0, 7, 6, 0, "noční");
  } else if (cycleIndex === 1) { // D
    pushIfAllowed(2, 6, 0, 2, 18, 0, "ranní");
    pushIfAllowed(3, 6, 0, 3, 18, 0, "ranní");
  } else if (cycleIndex === 2) { // A
    pushIfAllowed(0, 18, 0, 1, 6, 0, "noční");
    pushIfAllowed(1, 18, 0, 2, 6, 0, "noční");
    pushIfAllowed(4, 6, 0, 4, 18, 0, "ranní");
    pushIfAllowed(5, 6, 0, 5, 18, 0, "ranní");
    pushIfAllowed(6, 6, 0, 6, 14, 0, "ranní");
  } else if (cycleIndex === 3) { // C
    pushIfAllowed(2, 18, 0, 3, 6, 0, "noční");
    pushIfAllowed(3, 18, 0, 4, 6, 0, "noční");
  }

  return intervals;
}

function getTeamShiftState(now, team) {
  const baseWeek = startOfWeekMonday(SHIFT_CYCLE_START);
  const currentWeek = startOfWeekMonday(now);
  const weekDiff = Math.floor((startOfLocalDay(currentWeek) - startOfLocalDay(baseWeek)) / 86400000 / 7);
  const phase = SHIFT_PHASE_BY_TEAM[team] ?? 0;
  const currentIndex = ((weekDiff + phase) % 4 + 4) % 4;

  const weeks = [
    { start: addDays(currentWeek, -7), index: ((currentIndex - 1) % 4 + 4) % 4 },
    { start: currentWeek, index: currentIndex },
    { start: addDays(currentWeek, 7), index: (currentIndex + 1) % 4 }
  ];

  const intervals = weeks.flatMap(w => buildShiftIntervals(w.start, w.index));
  const active = intervals.find(item => now >= item.start && now < item.end) || null;
  if (active) {
    return { active: true, label: active.label, start: active.start, end: active.end };
  }

  const next = intervals
    .filter(item => item.start > now && !isShiftStartBlocked(item.start))
    .sort((a, b) => a.start - b.start)[0] || null;

  return { active: false, next };
}

function getActiveShiftNow(now) {
  for (const team of SHIFT_CYCLE_ORDER) {
    const state = getTeamShiftState(now, team);
    if (state.active) return { team, label: state.label, start: state.start, end: state.end };
  }
  return null;
}

function formatCalendarDateLabel(now) {
  return new Intl.DateTimeFormat("cs-CZ", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    year: "numeric"
  }).format(now);
}

function getDashboardCalendarWeekNumber(now) {
  const source = now instanceof Date ? now : new Date();
  if (!(source instanceof Date) || Number.isNaN(source.getTime())) return null;

  // ISO kalendářní týden: pondělí je první den a 1. týden je ten, který obsahuje čtvrtek.
  const d = new Date(source.getFullYear(), source.getMonth(), source.getDate());
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getDashboardProductionWeekNumber(now) {
  // Zachováno kvůli starším voláním, ale Dashboard už má ukazovat kalendářní ISO týden.
  return getDashboardCalendarWeekNumber(now);
}

function isDashboardMorningShiftTime(now) {
  const d = now instanceof Date ? now : new Date();
  const hour = d.getHours();
  if (hour < 6 || hour >= 18) return false;
  if (typeof getActiveShiftNow === "function") {
    try {
      const active = getActiveShiftNow(d);
      if (active && active.label) return /ranní/i.test(String(active.label));
    } catch (err) {
      // Když kontrola směny selže, kalendář se řídí aspoň časovým oknem ranní.
    }
  }
  return true;
}

function getFirstMorningShiftDateInMonth(now) {
  const d = now instanceof Date ? now : new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const monthKey = month + "/" + String(year).slice(-2);
  const monthData = app && app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const rows = monthData && monthData.hard && Array.isArray(monthData.hard.rows)
    ? monthData.hard.rows
    : (monthData && monthData.soft && Array.isArray(monthData.soft.rows) ? monthData.soft.rows : []);

  const candidates = rows
    .map(row => typeof parseDateToken === "function" ? parseDateToken(row && row.date) : null)
    .filter(parsed => parsed && parsed.month === month && /^R/i.test(String(parsed.shift || "").trim()))
    .map(parsed => parsed.day)
    .filter(day => Number.isFinite(day))
    .sort((a, b) => a - b);

  if (candidates.length) return new Date(year, month - 1, candidates[0], 6, 0, 0, 0);
  return new Date(year, month - 1, 1, 6, 0, 0, 0);
}

function isSameCalendarDay(a, b) {
  return !!(a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate());
}

function getDashboardCalendarWorkNotes(now) {
  const d = now instanceof Date ? now : new Date();
  if (!isDashboardMorningShiftTime(d)) return [];

  const notes = [];
  if (d.getDay() === 1) notes.push("Brusy- spálení");

  const firstMorning = getFirstMorningShiftDateInMonth(d);
  if (isSameCalendarDay(d, firstMorning)) notes.push("Roznýtování- laborka");

  return notes;
}

function getCalendarSpecialText(now) {
  const parts = [];
  const weekNumber = getDashboardCalendarWeekNumber(now);
  if (weekNumber) parts.push(String(weekNumber) + ".KT");

  const special = getSpecialWorkInfo(now);
  if (special) {
    if (special.type === "holiday") {
      parts.push("Svátek: " + special.label);
    } else if (special.type === "czd") {
      parts.push(special.label);
    }
  }

  getDashboardCalendarWorkNotes(now).forEach(note => parts.push(note));

  return parts.join(" · ") || "Bez událostí";
}

function getAbsenceNamesForDate(date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const monthKey = (target.getMonth() + 1) + "/" + String(target.getFullYear()).slice(-2);
  const month = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  if (!month || !Array.isArray(month.notes)) return [];

  const names = [];
  month.notes.forEach(note => {
    const n = normalizeNoteEntry(note);
    if (!n || !n.isAbsence || !Array.isArray(n.people) || !n.people.length) return;
    const parsed = typeof parseDateToken === 'function' ? parseDateToken(n.date) : null;
    if (!parsed || parsed.day !== target.getDate() || parsed.month !== (target.getMonth() + 1)) return;
    n.people.forEach(person => {
      const name = String(person || "").trim();
      if (name) names.push(name);
    });
  });

  return [...new Set(names)];
}

function getTodayAbsenceNames(now) {
  return getAbsenceNamesForDate(now);
}


function updateShift() {
  if (typeof updateDashboard === "function") updateDashboard();
}
