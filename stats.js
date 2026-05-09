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
  monthSelect.innerHTML = ['<option value="">Vyber měsíc…</option>']
    .concat(months.map(monthKey => '<option value="' + escapeHtml(monthKey) + '">' + escapeHtml(monthKey) + '</option>'))
    .join('');
  monthSelect.value = selected;
  app.selectedMonth = selected || null;

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

function formatMachineWinners(entries) {
  const list = Array.isArray(entries) ? entries : [];
  if (!list.length) return '—';
  return list.map(([name, value]) => name + ' (' + formatCount(value) + ')').join(', ');
}

function buildStatsForYear(year) {
  const stats = {
    year,
    people: {},
    names: [],
    machineTotals: {},
    cleanTotals: {},
    absenceTotals: {},
    machineCleanLeaders: {}
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

  Object.entries(app.rotation.months || {}).forEach(([monthKey, month]) => {
    const parsedMonth = parseMonthKey(monthKey);
    if (!parsedMonth || parsedMonth.year !== year) return;

    ["hard", "soft"].forEach(section => {
      const sec = month[section];
      if (!sec || !Array.isArray(sec.rows)) return;

      sec.rows.forEach(row => {
        const parsedDate = parseDateToken(row.date);
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
    if (!parsedMonth || parsedMonth.year !== year) return;

    (month.notes || []).forEach(note => {
      const n = normalizeNoteEntry(note);
      if (!n.isAbsence || !n.people || !n.people.length) return;

      const parsedDate = parseDateToken(n.date);
      const shift = n.shift || (parsedDate ? parsedDate.shift : "");

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
            person.absence[column] = (person.absence[column] || 0) + 1;
            stats.absenceTotals[column] = (stats.absenceTotals[column] || 0) + 1;
          }
        }
        person.totalAbsence += 1;
      });
    });
  });

  Object.values(stats.people).forEach(person => {
    ["TNK", "W01"].forEach(column => {
      if (typeof person.work[column] === "number") person.work[column] = Math.round(person.work[column]);
    });

    person.topWorkMachine = getBestEntry(person.work);
    person.topCleanMachine = getBestEntry(person.clean);
    person.topWorkMachines = getBestEntries(person.work);
    person.topCleanMachines = getBestEntries(person.clean);
  });
  ["TNK", "W01"].forEach(column => {
    if (typeof stats.machineTotals[column] === "number") stats.machineTotals[column] = Math.round(stats.machineTotals[column]);
  });

  stats.names = Object.keys(stats.people).filter(name => KNOWN_STAT_NAMES.has(name)).sort((a, b) => a.localeCompare(b, "cs"));
  stats.machineOrder = getStatsMachineOrder(Object.keys(stats.machineTotals));

  stats.machineOrder.forEach(machine => {
    const leaders = [];
    let maxClean = 0;
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
    });
    if (leaders.length) stats.machineCleanLeaders[machine] = { names: leaders.sort((a, b) => a.localeCompare(b, 'cs')), clean: maxClean };
  });

  return stats;
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

  statsNameGrid.innerHTML = '';
  stats.names.forEach(name => {
    const tile = document.createElement('div');
    tile.className = 'listItem statsNameTile' + (app.selectedStatsName === name ? ' activeChoice' : '');
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.innerHTML = '<div class="statsTileMain"><div class="statsTileTitle">' + escapeHtml(name) + '</div></div>';
    tile.onclick = () => setSelectedStatsName(name);
    tile.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setSelectedStatsName(name);
      }
    };
    statsNameGrid.appendChild(tile);
  });

  statsMachineGrid.innerHTML = '';
  stats.machineOrder.forEach(machine => {
    const leader = stats.machineCleanLeaders[machine] || null;
    const leaderNames = leader && Array.isArray(leader.names) && leader.names.length
      ? leader.names.join(', ')
      : '—';

    const tile = document.createElement('div');
    tile.className = 'listItem statsMachineTile' + (app.selectedStatsMachine === machine ? ' activeChoice' : '');
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.innerHTML = [
      '<div class="statsTileMain">',
      '  <div class="statsTileTitle">' + escapeHtml(machine) + '</div>',
      '</div>'
    ].join('');
    tile.onclick = () => setSelectedStatsMachine(machine);
    tile.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setSelectedStatsMachine(machine);
      }
    };
    statsMachineGrid.appendChild(tile);
  });

  if (app.selectedStatsName) {
    const person = stats.people[app.selectedStatsName];
    if (person) {
      const topWork = formatMachineWinners(person.topWorkMachines || (person.topWorkMachine ? [person.topWorkMachine] : []));
      const topClean = formatMachineWinners(person.topCleanMachines || (person.topCleanMachine ? [person.topCleanMachine] : []));
      statsNameView.innerHTML =
        "<div class='sectionTitle'>" + escapeHtml(person.name) + " — " + escapeHtml(String(year)) + "</div>" +
        "<div class='statsSummary'>" +
        "<div class='tile'><div class='smallText'>Práce celkem</div><div style='font-size:20px;margin-top:4px;'>" + formatCount(person.totalWork) + "</div></div>" +
        "<div class='tile'><div class='smallText'>Úklid celkem</div><div style='font-size:20px;margin-top:4px;'>" + formatCount(person.totalClean) + "</div></div>" +
        "<div class='tile'><div class='smallText'>Absence celkem</div><div style='font-size:20px;margin-top:4px;'>" + formatCount(person.totalAbsence) + "</div></div>" +
        "<div class='tile'><div class='smallText'>Práce + absence</div><div style='font-size:20px;margin-top:4px;'>" + formatCount(person.totalWork + person.totalAbsence) + "</div></div>" +
        "<div class='tile'><div class='smallText'>Nejvíc pracoval na</div><div style='font-size:17px;margin-top:6px;font-weight:800;'>" + escapeHtml(topWork) + "</div></div>" +
        "<div class='tile'><div class='smallText'>Nejvíc uklízel na</div><div style='font-size:17px;margin-top:6px;font-weight:800;'>" + escapeHtml(topClean) + "</div></div>" +
        "</div>" +
        "<div class='tableWrap'><table class='statsTable'><thead><tr><th>Stroj</th><th>Práce</th><th>Úklid</th><th>Absence</th></tr></thead><tbody>" +
        stats.machineOrder.map(machine => "<tr><td>" + escapeHtml(machine) + "</td><td>" + formatCount(person.work[machine] || 0) + "</td><td>" + formatCount(person.clean[machine] || 0) + "</td><td>" + formatCount(person.absence[machine] || 0) + "</td></tr>").join("") +
        "</tbody></table></div>";
    } else {
      statsNameView.innerHTML = "";
    }
  } else {
    statsNameView.innerHTML = "<div class='smallText'>Klepni na jméno nahoře.</div>";
  }

  if (app.selectedStatsMachine) {
    const machine = app.selectedStatsMachine;
    const leader = stats.machineCleanLeaders[machine] || null;
    const leaderNames = leader && Array.isArray(leader.names) && leader.names.length
      ? leader.names.join(', ')
      : '—';

    statsMachineView.innerHTML = [
      "<div class='sectionTitle'>" + escapeHtml(machine) + "</div>",
      "<div class='statsSummary'>",
      "<div class='tile'><div class='smallText'>Letos nejvíc uklízeli</div><div style='font-size:20px;margin-top:6px;'>" + escapeHtml(leaderNames) + "</div></div>",
      "</div>"
    ].join('');
  } else {
    statsMachineView.innerHTML = "<div class='smallText'>Klepni na stroj nahoře.</div>";
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
    pushIfAllowed(6, 22, 0, 7, 6, 0, "noční");
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

function getCalendarSpecialText(now) {
  const parts = [];
  const special = getSpecialWorkInfo(now);
  if (special) {
    if (special.type === "holiday") {
      parts.push("Svátek: " + special.label);
    } else if (special.type === "czd") {
      parts.push(special.label);
    }
  }

  return parts.join(" · ") || "Bez událostí";
}

function getTodayAbsenceNames(now) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const monthKey = (today.getMonth() + 1) + "/" + String(today.getFullYear()).slice(-2);
  const month = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  if (!month || !Array.isArray(month.notes)) return [];

  const names = [];
  month.notes.forEach(note => {
    const n = normalizeNoteEntry(note);
    if (!n || !n.isAbsence || !Array.isArray(n.people) || !n.people.length) return;
    const parsed = parseDateToken(n.date);
    if (!parsed || parsed.day !== today.getDate() || parsed.month !== (today.getMonth() + 1)) return;
    n.people.forEach(person => {
      const name = String(person || "").trim();
      if (name) names.push(name);
    });
  });

  return [...new Set(names)];
}


function updateDashboard() {
  const now = new Date();
  const active = getActiveShiftNow(now);
  const dState = getTeamShiftState(now, "D");
  const special = getSpecialWorkInfo(now);
  const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const showSpecial = special && (!active || sameDay(active.start, now));
  const vacationCountdown = typeof getVacationCountdown === "function"
    ? getVacationCountdown(now)
    : { text: "--", meta: "" };
  const esc = typeof escapeHtml === "function"
    ? escapeHtml
    : (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[ch]));

  const hero = document.getElementById('dashHero');
  if (hero) {
    const heroLine1 = active && !showSpecial
      ? '<span class="dashboardHeroLine1Text">V práci: směna ' + active.team + (active.label ? ' (' + active.label + ')' : '') + '</span>'
      : '<span class="dashboardHeroLine1Text">' + (special ? 'Dnes se nepracuje' : '—') + '</span>';
    const heroLine2 = (!active || active.team !== 'D') && dState.next
      ? 'Směna D začne za: ' + formatDuration(dState.next.start - now)
      : '';
    const awayNames = getTodayAbsenceNames(now);
    const heroLine3 = awayNames.length ? 'Dnes mimo práci: ' + awayNames.join(', ') : '';
    const heroProgress = active && !showSpecial && active.start && active.end
      ? Math.max(0, Math.min(100, ((now.getTime() - active.start.getTime()) / (active.end.getTime() - active.start.getTime())) * 100))
      : 0;
    hero.innerHTML = [
      '<div class="dashboardHeroLine1">' + heroLine1 + '</div>',
      heroLine2 ? '<div class="dashboardHeroLine2">' + esc(heroLine2) + '</div>' : '',
      heroLine3 ? '<div class="dashboardHeroLine3">' + esc(heroLine3) + '</div>' : '',
      '<div class="dashboardHeroBar"><span style="width:' + heroProgress.toFixed(1) + '%"></span></div>'
    ].join('');
  }

  const setCard = (id, title, value, meta, dotClass, clickable, iconHtml) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('dashboardCardClickable', !!clickable);
    const icon = iconHtml ? '<div class="dashboardIcon dashboardIconInline" aria-hidden="true">' + iconHtml + '</div>' : '';
    const dot = dotClass ? '<span class="dashboardDot ' + esc(dotClass) + '" aria-hidden="true"></span>' : '';
    el.innerHTML = [
      '<div class="dashboardTop">',
      icon,
      '<div class="dashboardHead">',
      '<div class="dashboardLabelRow">',
      '<div class="dashboardLabel">' + esc(title) + '</div>',
      dot,
      '</div>',
      '</div>',
      '</div>',
      '<div class="dashboardValue">' + esc(value || '--') + '</div>',
      meta ? '<div class="dashboardMeta">' + esc(meta) + '</div>' : ''
    ].join('');
  };

  const walletIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.7 7.4h10.6c1.7 0 3.1.9 3.7 2.1l1 1.9H18c-1.7 0-3.1 1.4-3.1 3.1S16.3 17.6 18 17.6h1.6c.7 0 1.3-.6 1.3-1.3V11c0-1.8-1.4-3.3-3.2-3.3H4.7a2 2 0 0 0-2 2v5.3a2 2 0 0 0 2 2h9.5"/><path d="M16.4 12.1h3"/><circle cx="17.6" cy="15.2" r=".6" fill="currentColor" stroke="none"/></svg>';
  const croissantIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.3 14.4c0-3.1 2.6-5.7 6.1-5.7 2.8 0 5.3 1.1 6.9 3-.1 2.6-2.2 4.6-5 4.6H9.4c-1.8 0-3.3-.8-4-2-.3-.5-.2-1.2.2-1.7.7-.7 1.2-1.3 1.5-2 .2-.6.2-1.2.1-1.8"/><path d="M8.4 12c.8.9 1.8 1.5 3 1.5 1.1 0 2.1-.3 3.1-1"/><path d="M13 8.3c.6.9 1.3 1.7 2.1 2.4"/></svg>';
  const plateIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2.2"/><path d="M5.4 5.2v13.6M6.2 5.2v4.8M7.2 5.2v4.8M17.8 5.2v13.6M18.8 5.2c.9 2 .9 4.5 0 6.3"/></svg>';
  const calendarIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M7 3.5v3M17 3.5v3M3.5 9h17"/></svg>';
  const clockIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="7.5"/><path d="M12 8v4.5l3 2"/></svg>';
  const palmIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20v-7"/><path d="M12 13c-1-2.3-3.4-4-6.2-4.3 1.9-1.6 4.3-1.8 6.3-.6"/><path d="M12 13c1.1-2.3 3.5-4 6.3-4.3-1.9-1.5-4.4-1.7-6.3-.6"/><path d="M7.2 20h9.6"/><path d="M8.8 20c1-1.3 2.1-2 3.2-2s2.2.7 3.2 2"/></svg>';
  const bookIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5.8h5.2a3 3 0 0 1 3 3V20H8.2a3 3 0 0 0-3 3V8.8a3 3 0 0 1 0-3z"/><path d="M19 5.8h-5.2a3 3 0 0 0-3 3V20H15.8a3 3 0 0 1 3 3V8.8a3 3 0 0 0 0-3z"/><path d="M12 8.2v12"/></svg>';
  const externalIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 6.5H5.8A2.3 2.3 0 0 0 3.5 8.8v9.4a2.3 2.3 0 0 0 2.3 2.3h9.4a2.3 2.3 0 0 0 2.3-2.3v-4.7"/><path d="M13.5 4.5h6v6"/><path d="M12 12l7.5-7.5"/></svg>';

  const payDate = typeof getNextPayrollDate === 'function' ? getNextPayrollDate(now) : null;
  const payDateText = payDate
    ? new Intl.DateTimeFormat('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(payDate).replace(/\s+/g, '')
    : '—';
  const payDays = payDate
    ? Math.max(0, Math.round((payDate.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000))
    : null;
  const payMeta = payDays === null
    ? ''
    : (payDays === 0 ? 'dnes' : 'za ' + payDays + ' ' + (payDays === 1 ? 'den' : (payDays >= 2 && payDays <= 4 ? 'dny' : 'dní')));

  setCard('dashCalendar', 'Kalendář', formatCalendarDateLabel(now), getCalendarSpecialText(now), '', false, calendarIcon);
  setCard('dashCountdown', 'Zbývá', active && !showSpecial ? formatDuration(active.end - now) : '—', '', '', false, clockIcon);

  const kantyna = findFoodStatus(FOOD_LOCATIONS[0], now);
  const jidelna = findFoodStatus(FOOD_LOCATIONS[1], now);
  const foodText = status => status.isOpen ? 'Otevřeno' : 'Zavřeno';
  const foodDot = status => status.isOpen ? 'is-open' : 'is-closed';
  const foodMeta = status => {
    if (status.isOpen && status.active) return 'do ' + formatFoodTime(status.active.end);
    if (!status.next) return 'otevření není známé';
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const nextStart = new Date(status.next.start);
    nextStart.setHours(0, 0, 0, 0);
    const diffDays = Math.round((nextStart - today) / 86400000);
    const time = formatFoodTime(status.next.start);
    if (diffDays <= 0) return 'otevřeno dnes v ' + time;
    if (diffDays === 1) return 'otevřeno zítra v ' + time;
    return 'otevřeno ' + formatFoodRelativeLabel(status.next.start, now) + ' v ' + time;
  };
  setCard('dashKantyna', 'Kantýna', foodText(kantyna), foodMeta(kantyna), foodDot(kantyna), true, croissantIcon);
  setCard('dashJidelna', 'Jídelna', foodText(jidelna), foodMeta(jidelna), foodDot(jidelna), true, plateIcon);
  setCard('dashVyplata', 'Další výplata', payDateText, payMeta, '', false, walletIcon);
  setCard('dashCzd', 'Odpočet do dovolené', vacationCountdown.text, vacationCountdown.meta, '', false, palmIcon);
  setCard('dashFoodLink', 'Jídelní lístek', 'Otevřít', 'Aktuální menu', '', true, bookIcon);
  setCard('dashEportalLink', 'Eportal', 'Otevřít', 'Firemní portál', '', true, externalIcon);
}

function updateShift() {
  updateDashboard();
}
setInterval(updateDashboard, 10000);
updateDashboard();
