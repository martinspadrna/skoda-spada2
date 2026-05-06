function renderBrusy() {
  document.querySelectorAll("#brusy .bbtn").forEach(b => {
    b.classList.remove("activeMachine", "activeIndex", "activeChoice");
  });
  const machineBtn = document.querySelector(`#brusy [data-machine="${app.machine}"]`);
  const progBtn = document.querySelector(`#brusy [data-prog="${app.prog}"]`);
  if (machineBtn) machineBtn.classList.add("activeMachine", "activeChoice");
  if (progBtn) progBtn.classList.add("activeIndex", "activeChoice");

  const info = document.getElementById("brusyInfo");
  if (info) {
    const cfg = getBrusConfig(app.machine, app.prog);
    info.innerHTML =
      "<div><b>" + escapeHtml(app.machine) + " / " + escapeHtml(cfg.label) + "</b></div>" +
      "<div class='smallText'>Výroba kusu: " + formatBrusSeconds(cfg.pieceSec) + " · Orovnává po " + formatCount(cfg.dressEvery) + " ks · Orovnává " + formatBrusDuration(cfg.dressSec) + "</div>";
  }
}

function monthKeyFromSheetName(sheetName) {
  const m = /^(\d{2})\.(\d{4})$/.exec(String(sheetName || "").trim());
  if (!m) return null;
  return `${parseInt(m[1], 10)}/${String(parseInt(m[2], 10)).slice(-2)}`;
}

function normalizeShiftText(text) {
  const raw = String(text || "").trim().replace(/\s+/g, " ");
  if (!raw) return "";
  const parts = raw.split(" ");
  const dedup = [];
  for (const part of parts) {
    if (dedup.length === 0 || dedup[dedup.length - 1] !== part) dedup.push(part);
  }
  return dedup.join(" ").trim();
}


function escapeRegExp(text) {
  return String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanDateLabel(rawDate, shift) {
  const date = String(rawDate || "").trim().replace(/\s+/g, " ");
  const sh = String(shift || "").trim();
  if (!date || !sh) return date;
  const re = new RegExp("(?:\\s+" + escapeRegExp(sh) + ")+$");
  return date.replace(re, "").trim();
}

function parseDateToken(token) {
  const m = /^(\d{1,2})\.(\d{1,2})\.\s*(.*)$/.exec(token || "");
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const shift = normalizeShiftText(m[3] || "");
  return {
    day,
    month,
    shift,
    sortDate: new Date(2026, month - 1, day).toISOString()
  };
}

var ABSENCE_LABELS = {
  "D": "Dovolená",
  "NV": "Náhradní volno",
  "Š": "Školení",
  "§": "Paragraf",
  "S": "Senior",
  "L": "Lázně"
};

function absenceLabelFromCode(code) {
  const raw = String(code || "").trim();
  if (!raw) return "";
  const key = raw.toUpperCase();
  if (ABSENCE_LABELS && ABSENCE_LABELS[key]) return ABSENCE_LABELS[key];
  if (/^\d+(?:[.,]\d+)?$/.test(raw)) return "";
  return raw;
}

function sanitizeAbsencePersonName(text) {
  return String(text || "")
    .trim()
    .replace(/\s+(?:od|do)\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitAbsencePeople(text) {
  const raw = String(text || "").trim();
  if (!raw) return [];

  return raw
    .replace(/\s+(?:a|i|&|\/)\s+/gi, " | ")
    .replace(/[,;+]/g, " | ")
    .split(/\s*\|\s*/g)
    .map(part => part.trim())
    .filter(Boolean)
    .filter(part => !/^od\s+\d/i.test(part));
}

function looksLikeAbsencePerson(text) {
  const t = String(text || "").trim();
  if (!t) return false;
  if (/\d/.test(t)) return false;
  if (/\bdo\b/i.test(t)) return false;
  if (/[:/]/.test(t)) return false;
  return true;
}

function normalizeNoteEntry(note) {
  const date = String(note && note.date ? note.date : "").trim();
  const shiftFromDate = parseDateToken(date);
  let shift = normalizeShiftText(String(note && note.shift ? note.shift : (shiftFromDate ? shiftFromDate.shift : "")) || "");
  let person = sanitizeAbsencePersonName(note && note.person ? note.person : "");
  let code = String(note && note.code ? note.code : "").trim();
  let text = String(note && note.text ? note.text : "").trim();
  let people = [];

  if (!person && text) {
    const tokens = text.split(/\s+/).filter(Boolean);
    let start = 0;

    // ignore leading date token from the notes column text, e.g. "29.4. R Špadrna D"
    if (tokens[start] && /^\d{1,2}\.\d{1,2}\.$/.test(tokens[start])) {
      start += 1;
    }

    // ignore / capture an explicit shift token if it is part of the note text
    if (tokens[start] && /^(?:N8|R8|N|R)$/i.test(tokens[start])) {
      if (!shift) shift = normalizeShiftText(tokens[start].toUpperCase());
      start += 1;
    }

    const remaining = tokens.slice(start);

    if (remaining.length >= 2 && absenceLabelFromCode(remaining[remaining.length - 1])) {
      code = code || remaining[remaining.length - 1];
      const peopleText = remaining.slice(0, -1).join(" ").trim();
      people = splitAbsencePeople(peopleText).map(sanitizeAbsencePersonName).filter(Boolean);
      person = sanitizeAbsencePersonName(people[0] || peopleText);
    } else if (remaining.length === 1 && !absenceLabelFromCode(remaining[0])) {
      person = sanitizeAbsencePersonName(remaining[0]);
    } else if (remaining.length > 1 && !code && looksLikeAbsencePerson(remaining[0])) {
      // fallback: "Jméno" without an explicit code means vacation
      person = sanitizeAbsencePersonName(remaining[0]);
      code = "D";
    }
  }

  person = sanitizeAbsencePersonName(person);

  if (!code && person) {
    code = "D";
  }

  const label = absenceLabelFromCode(code);
  if (!people.length && person) people = splitAbsencePeople(person).map(sanitizeAbsencePersonName).filter(Boolean);
  if (!people.length && person) people = [person];
  const isAbsence = !!label && !!person;

  return {
    date,
    shift,
    person,
    people,
    code,
    label,
    isAbsence,
    text
  };
}


function buildNameIndex(rotation) {
  const map = new Map();
  Object.entries(rotation.months || {}).forEach(([monthKey, month]) => {
    ["hard", "soft"].forEach(section => {
      const sec = month[section];
      if (!sec || !sec.rows) return;
      sec.rows.forEach(row => {
        const parsed = parseDateToken(row.date);
        if (!parsed) return;
        (row.cells || []).forEach((cell, idx) => {
          const name = (cell || "").trim();
          if (!name || !KNOWN_STAT_NAMES.has(name)) return;
          if (!map.has(name)) map.set(name, []);
          const machine = (sec.machines && sec.machines[idx]) ? sec.machines[idx] : "";
          map.get(name).push({
            monthKey,
            section,
            date: row.date,
            dateLabel: cleanDateLabel(row.date, parsed.shift),
            shift: parsed.shift,
            machine,
            sortDate: makeSortDateFromMonthKey(monthKey, parsed.day, parsed.month)
          });
        });
      });
    });

    (month.notes || []).forEach(note => {
      const n = normalizeNoteEntry(note);
      if (!n.isAbsence || !n.people || !n.people.length) return;
      const parsed = parseDateToken(n.date);
      const shift = n.shift || (parsed ? parsed.shift : "");
      n.people.forEach(personName => {
        const name = String(personName || "").trim();
        if (!name || !KNOWN_STAT_NAMES.has(name)) return;
        if (!map.has(name)) map.set(name, []);
        map.get(name).push({
          monthKey,
          section: "notes",
          date: n.date,
          dateLabel: cleanDateLabel(n.date, shift),
          shift,
          machine: n.label || "Dovolená",
          absence: true,
          sortDate: parsed ? makeSortDateFromMonthKey(monthKey, parsed.day, parsed.month) : new Date(2026, 0, 1).toISOString()
        });
      });
    });
  });
  const result = {};
  [...map.keys()].sort((a, b) => a.localeCompare(b, "cs")).forEach(name => {
    result[name] = map.get(name).sort((a, b) => a.sortDate.localeCompare(b.sortDate));
  });
  return result;
}

function getKnownStatNames() {
  return KNOWN_STAT_NAMES;
}



function formatAbsenceNoteLine(note) {
  const n = normalizeNoteEntry(note);
  if (!n.isAbsence) return "";
  const people = (n.people && n.people.length)
    ? n.people.join(" a ")
    : (n.person || "");
  const code = n.code ? " " + n.code : "";
  return [n.date, people, n.label && !people ? n.label : ""].filter(Boolean).join(" ");
}

