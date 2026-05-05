function renderMonthGrid() {
  const monthGrid = document.getElementById("monthsGrid");
  if (!monthGrid) return;
  const months = getMonthsForYear(app.rotation, parseInt(app.selectedYear, 10));
  monthGrid.innerHTML = "";
  months.forEach(monthKey => {
    const el = document.createElement("div");
    el.className = "listItem" + (app.selectedMonth === monthKey ? " activeChoice" : "");
    el.textContent = monthKey;
    el.onclick = () => {
      app.selectedMonth = monthKey;
      renderRotace();
      renderMonth(monthKey);
      setRotaceView("months");
    };
    monthGrid.appendChild(el);
  });
  if (!months.length) {
    monthGrid.innerHTML = "<div class='smallText'>Pro tenhle rok tu zatím nic není.</div>";
  }
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

function buildStatsForYear(year) {
  const stats = {
    year,
    people: {},
    names: [],
    machineTotals: {},
    cleanTotals: {},
    absenceTotals: {}
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
        workDays: new Set()
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
  });
  ["TNK", "W01"].forEach(column => {
    if (typeof stats.machineTotals[column] === "number") stats.machineTotals[column] = Math.round(stats.machineTotals[column]);
  });

  stats.names = Object.keys(stats.people).filter(name => KNOWN_STAT_NAMES.has(name)).sort((a, b) => a.localeCompare(b, "cs"));
  stats.machineOrder = getStatsMachineOrder(Object.keys(stats.machineTotals));
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

  statsNameGrid.innerHTML = "";
  stats.names.forEach(name => {
    const el = document.createElement("div");
    el.className = "listItem" + (app.selectedStatsName === name ? " activeChoice" : "");
    el.textContent = name;
    el.onclick = () => setSelectedStatsName(name);
    statsNameGrid.appendChild(el);
  });
  if (!stats.names.length) {
    statsNameGrid.innerHTML = "<div class='smallText'>Pro tenhle rok tu ještě nejsou žádná data.</div>";
  }

  statsMachineGrid.innerHTML = "";
  stats.machineOrder.forEach(machine => {
    const el = document.createElement("div");
    el.className = "listItem" + (app.selectedStatsMachine === machine ? " activeChoice" : "");
    el.textContent = machine;
    el.dataset.machine = machine;
    el.onclick = () => setSelectedStatsMachine(machine);
    statsMachineGrid.appendChild(el);
  });
  if (!stats.machineOrder.length) {
    statsMachineGrid.innerHTML = "<div class='smallText'>Pro tenhle rok tu ještě nejsou žádné stroje.</div>";
  }

  if (app.selectedStatsName) {
    const person = stats.people[app.selectedStatsName];
    if (person) {
      let title = escapeHtml(person.name) + " — " + escapeHtml(String(year));
      statsNameView.innerHTML =
        "<div class='sectionTitle'>" + title + "</div>" +
        "<div class='statsSummary'>" +
        "<div class='tile'><div class='smallText'>Práce celkem</div><div style='font-size:22px;margin-top:4px;'>" + formatCount(person.totalWork) + "</div></div>" +
        "<div class='tile'><div class='smallText'>Úklid celkem</div><div style='font-size:22px;margin-top:4px;'>" + formatCount(person.totalClean) + "</div></div>" +
        "<div class='tile'><div class='smallText'>Nepřítomnost celkem</div><div style='font-size:22px;margin-top:4px;'>" + formatCount(person.totalAbsence) + "</div></div>" +
        "</div>" +
        "<div class='tableWrap'><table class='statsTable'><thead><tr><th>Stroj</th><th>Práce</th><th>Úklid</th></tr></thead><tbody>" +
        stats.machineOrder.map(machine => "<tr><td>" + escapeHtml(machine) + "</td><td>" + formatCount(person.work[machine] || 0) + "</td><td>" + formatCount(person.clean[machine] || 0) + "</td></tr>").join("") +
        "</tbody></table></div>";
    } else {
      statsNameView.innerHTML = "";
    }
  } else {
    statsNameView.innerHTML = "";
  }

  if (app.selectedStatsMachine) {
    const machine = app.selectedStatsMachine;
    const machineStats = Object.values(stats.people)
      .map(p => ({
        name: p.name,
        work: Number(p.work[machine] || 0),
        clean: Number(p.clean[machine] || 0)
      }))
      .filter(p => p.work > 0 || p.clean > 0)
      .sort((a, b) => {
        if (b.work !== a.work) return b.work - a.work;
        if (b.clean !== a.clean) return b.clean - a.clean;
        return a.name.localeCompare(b.name, "cs");
      });

    const top3 = machineStats.filter(p => p.work > 0).slice(0, 3);
    const topClean2 = machineStats
      .filter(p => p.clean > 0)
      .sort((a, b) => {
        if (b.clean !== a.clean) return b.clean - a.clean;
        if (b.work !== a.work) return b.work - a.work;
        return a.name.localeCompare(b.name, "cs");
      })
      .slice(0, 2);

    let html = "";
    html += "<div class='sectionTitle'>Stroj " + escapeHtml(machine) + "</div>";
    html += "<div class='statsSummary'>";
    html += "<div class='tile'><div class='smallText'>Top 3 jména</div><div style='font-size:22px;margin-top:4px;'>" + formatCount(top3.length) + "</div></div>";
    html += "<div class='tile'><div class='smallText'>Úklid #1</div><div style='font-size:18px;margin-top:6px;'>" + escapeHtml(topClean2[0] ? topClean2[0].name + " (" + formatCount(topClean2[0].clean) + ")" : "—") + "</div></div>";
    html += "<div class='tile'><div class='smallText'>Úklid #2</div><div style='font-size:18px;margin-top:6px;'>" + escapeHtml(topClean2[1] ? topClean2[1].name + " (" + formatCount(topClean2[1].clean) + ")" : "—") + "</div></div>";
    html += "</div>";
    html += "<div class='tableWrap'><table class='statsTable'><thead><tr><th>Pořadí</th><th>Jméno</th><th>Práce</th></tr></thead><tbody>";
    if (top3.length) {
      top3.forEach((item, idx) => {
        html += "<tr><td>" + (idx + 1) + "</td><td>" + escapeHtml(item.name) + "</td><td>" + formatCount(item.work) + "</td></tr>";
      });
    } else {
      html += "<tr><td colspan='3'>Na tenhle stroj tu ještě nejsou žádná data.</td></tr>";
    }
    html += "</tbody></table></div>";
    statsMachineView.innerHTML = html;
  } else {
    statsMachineView.innerHTML = "";
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

function updateShift() {
  const now = new Date();
  const active = getActiveShiftNow(now);
  const dState = getTeamShiftState(now, "D");
  const special = getSpecialWorkInfo(now);
  const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const showSpecial = special && (!active || sameDay(active.start, now));

  const lines = [];
  if (active && !showSpecial) {
    lines.push("Aktuálně v práci: směna " + active.team + (active.label ? " (" + active.label + ")" : ""));
  } else if (special) {
    if (special.type === "holiday") {
      lines.push("Svátek – " + special.label);
    } else {
      lines.push("CZD – celozávodní dovolená");
    }
    lines.push("Dnes se nepracuje");
  } else {
    lines.push("Aktuálně není žádná směna");
  }

  if (dState.active) {
    lines.push("Směna D: do konce zbývá " + formatDuration(dState.end - now));
  } else if (dState.next) {
    lines.push("Směna D začne za: " + formatDuration(dState.next.start - now));
  } else {
    lines.push("Směna D: bez dalšího termínu");
  }

  document.getElementById("shiftTime").innerText = lines.join("\n");
}
setInterval(updateShift, 10000);
updateShift();


