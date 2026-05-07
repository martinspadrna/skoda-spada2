
const APP_KEY = "rotace_kalkulacky_state_v122";
const ROTATION_BUILD = "2026-05-07-v.0193-rc-" + Date.now();

const HARD_MACHINE_HEADERS = ["TNKS01", "TBKR07", "TPKW01", "TPKW02", "TBKR01"];
const SOFT_MACHINE_HEADERS = ["MSKC01", "MSKC03", "MSKC04", "MFKF06", "MFKF10"];

const KNOWN_STAT_NAMES = new Set(["Blažek", "Kmínek", "Kříž", "Novotný", "Pech", "Starý", "Střížek", "Synek", "Třasák", "Špadrna"]);


const NO_START_HOLIDAYS = new Set(["1-1", "4-3", "4-6", "5-1", "5-8", "7-5", "7-6", "9-28", "10-17", "10-28", "12-24", "12-25", "12-26"]);

function dateKeyMD(date) {
  return (date.getMonth() + 1) + "-" + date.getDate();
}

function isShiftStartBlocked(date) {
  return !!getSpecialWorkInfo(date);
}

function getSpecialWorkInfo(now) {
  const key = dateKeyMD(now);
  const HOLIDAY_LABELS = {
    "1-1": "Nový rok",
    "4-3": "Velký pátek",
    "4-6": "Velikonoční pondělí",
    "5-1": "Svátek práce",
    "5-8": "Den vítězství",
    "7-5": "Cyril a Metoděj",
    "7-6": "Jan Hus",
    "9-28": "Den české státnosti",
    "10-17": "Svátek",
    "10-28": "Vznik ČSR",
    "11-17": "Den boje za svobodu a demokracii",
    "12-24": "Štědrý den",
    "12-25": "1. svátek vánoční",
    "12-26": "2. svátek vánoční"
  };
  if (HOLIDAY_LABELS[key]) return { type: "holiday", label: HOLIDAY_LABELS[key] };
  if (key === "10-24" || key === "10-25") return { type: "czd", label: "CZD – celozávodní dovolená" };
  if ((now >= new Date(2026, 6, 19, 14, 0, 0, 0) && now < new Date(2026, 7, 2, 18, 0, 0, 0)) ||
      (now >= new Date(2026, 11, 23, 18, 0, 0, 0) && now < new Date(2027, 0, 2, 6, 0, 0, 0))) {
    return { type: "czd", label: "CZD – celozávodní dovolená" };
  }
  return null;
}

const appRotation = loadRotationData();
const app = {
  rotationView: "names",
  selectedMonth: null,
  selectedName: null,
  selectedStatsName: null,
  selectedStatsMachine: null,
  soustruhMode: "lis",
  soustruhFirstBatch: "",
  soustruhPlan: "1216",
  soustruh126Start: 32,
  soustruh106Counts: ["", "", "", ""],
  selectedYear: new Date().getFullYear(),
  importYear: new Date().getFullYear(),
  importClicks: 0,
  adminUnlocked: false,
  machine: localStorage.getItem("machine") || "TBKR01",
  prog: localStorage.getItem("prog") || "AD",
  rotation: appRotation
};

// Budoucí rozšíření: statistiky za rok pro jednotlivá jména/stroje/úklid.

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function normalizeRows(rows) {
  return (Array.isArray(rows) ? rows : []).map(row => ({
    date: String(row && row.date ? row.date : "").trim(),
    cells: (Array.isArray(row && row.cells) ? row.cells : []).map(v => String(v || "").trim())
  }));
}

function canonicalAbsenceKey(note) {
  const n = normalizeNoteEntry(note);
  const people = (n.people && n.people.length) ? n.people.join(" a ") : (n.person || "");
  if (n.isAbsence) {
    return ["ABS", n.date, n.shift, people, n.code].join("|");
  }
  return ["NOTE", n.date, n.shift, n.text || people || ""].join("|");
}

function mergeNotes(primaryNotes, fallbackNotes) {
  const out = [];
  const seen = new Set();

  const pushNote = (note) => {
    const normalized = normalizeNoteEntry(note);
    const peopleText = (normalized.people && normalized.people.length)
      ? normalized.people.join(" a ")
      : normalized.person;

    const item = {
      date: normalized.date,
      shift: normalized.shift,
      person: peopleText,
      code: normalized.code,
      text: normalized.text || [normalized.date, peopleText, normalized.code].filter(Boolean).join(" ").trim()
    };

    const key = canonicalAbsenceKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  };

  (Array.isArray(primaryNotes) ? primaryNotes : []).forEach(pushNote);
  (Array.isArray(fallbackNotes) ? fallbackNotes : []).forEach(pushNote);
  return out;
}

function normalizeMonthForImport(monthData, fallbackMonthData) {
  const normalizeSection = (section, fallbackMachines) => {
    const incoming = monthData && monthData[section] ? monthData[section] : null;
    const fallback = fallbackMonthData && fallbackMonthData[section] ? fallbackMonthData[section] : null;
    const incomingRows = Array.isArray(incoming && incoming.rows) ? normalizeRows(incoming.rows) : null;
    const fallbackRows = Array.isArray(fallback && fallback.rows) ? normalizeRows(fallback.rows) : [];
    const rows = incomingRows !== null ? incomingRows : fallbackRows;

    const machines = (incoming && Array.isArray(incoming.machines) && incoming.machines.length)
      ? incoming.machines.slice()
      : ((fallback && Array.isArray(fallback.machines) && fallback.machines.length)
          ? fallback.machines.slice()
          : fallbackMachines.slice());
    const title = (incoming && incoming.title) || (fallback && fallback.title) || (section === "hard" ? "Rotace tvrdota" : "Rotace měkota");
    return { title, machines, rows };
  };

  const normalizeNotesArray = (arr) => (Array.isArray(arr) ? arr : []).map(n => ({
    date: String(n && n.date ? n.date : "").trim(),
    shift: String(n && n.shift ? n.shift : "").trim(),
    person: String(n && n.person ? n.person : "").trim(),
    code: String(n && n.code ? n.code : "").trim(),
    text: String(n && n.text ? n.text : "").trim()
  }));

  const hasNotes = monthData && Object.prototype.hasOwnProperty.call(monthData, "notes");
  const incomingNotes = hasNotes ? normalizeNotesArray(monthData.notes) : null;
  const fallbackNotes = fallbackMonthData && Array.isArray(fallbackMonthData.notes) ? normalizeNotesArray(fallbackMonthData.notes) : [];

  return {
    hard: normalizeSection("hard", HARD_MACHINE_HEADERS),
    soft: normalizeSection("soft", SOFT_MACHINE_HEADERS),
    notes: incomingNotes !== null ? incomingNotes : fallbackNotes
  };
}

function normalizeRotationData(rotation) {
  const src = clone(initialRotationData);
  const incoming = rotation && rotation.months && typeof rotation.months === "object" ? rotation.months : {};
  Object.entries(incoming).forEach(([monthKey, monthData]) => {
    const fallbackMonthData = initialRotationData.months ? initialRotationData.months[monthKey] : null;
    src.months[monthKey] = normalizeMonthForImport(monthData, fallbackMonthData);
  });
  return src;
}

function defaultRotation() {
  return normalizeRotationData({ months: {} });
}

function loadRotationData() {
  try {
    const savedBuild = localStorage.getItem("rotationBuild");
    if (savedBuild && savedBuild !== ROTATION_BUILD) {
      return defaultRotation();
    }
    const raw = localStorage.getItem(APP_KEY);
    if (!raw) return defaultRotation();
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.months) return defaultRotation();
    return normalizeRotationData(parsed);
  } catch (e) {
    return defaultRotation();
  }
}

function saveRotationData() {


  try {
    localStorage.setItem(APP_KEY, JSON.stringify(app.rotation));
    localStorage.setItem("rotationBuild", ROTATION_BUILD);
    localStorage.setItem("machine", app.machine);
    localStorage.setItem("prog", app.prog);
    localStorage.setItem("f_kusy", document.getElementById("f_kusy")?.value || "");
    localStorage.setItem("p_kusy", document.getElementById("p_kusy")?.value || "");
    localStorage.setItem("davka", document.getElementById("davka")?.value || "");
    localStorage.setItem("orovnani", document.getElementById("orovnani")?.value || "");
    localStorage.setItem("celkem", document.getElementById("celkem")?.value || "");
    localStorage.setItem("soustruhMode", app.soustruhMode);
    localStorage.setItem("soustruhFirstBatch", app.soustruhFirstBatch || "");
    localStorage.setItem("soustruhPlan", app.soustruhPlan || "");
    localStorage.setItem("soustruh126Start", String(app.soustruh126Start || 32));
    localStorage.setItem("soustruh106Counts", JSON.stringify(app.soustruh106Counts || ["", "", "", ""]));
  } catch (e) {}
}

function restoreInputs() {
  const setVal = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.value = localStorage.getItem(key) || "";
  };
  setVal("f_kusy", "f_kusy");
  setVal("p_kusy", "p_kusy");
  setVal("davka", "davka");
  setVal("orovnani", "orovnani");
  setVal("celkem", "celkem");
  const lisPlanEl = document.getElementById("lis_plan");
  if (lisPlanEl) lisPlanEl.value = "1216";
  const v126PlanEl = document.getElementById("v126_plan");
  if (v126PlanEl) v126PlanEl.value = "1216";
  const v106PlanEl = document.getElementById("v106_plan");
  if (v106PlanEl) v106PlanEl.value = "1216";
  try {
    const arr = JSON.parse(localStorage.getItem("soustruh106Counts") || "[\"\",\"\",\"\",\"\"]");
    ["v106_c1","v106_c2","v106_c3","v106_c4"].forEach((id, idx) => { const el = document.getElementById(id); if (el && !el.value) el.value = arr[idx] || ""; });
  } catch (e) {}
  app.soustruhMode = localStorage.getItem("soustruhMode") || app.soustruhMode || "lis";
  app.soustruhFirstBatch = localStorage.getItem("soustruhFirstBatch") || "";
  const storedSoustruhPlan = localStorage.getItem("soustruhPlan");
  app.soustruhPlan = storedSoustruhPlan && storedSoustruhPlan !== "1248" ? storedSoustruhPlan : "1216";
  app.soustruh126Start = parseInt(localStorage.getItem("soustruh126Start"), 10) || 32;
  try { app.soustruh106Counts = JSON.parse(localStorage.getItem("soustruh106Counts") || "[\"\",\"\",\"\",\"\"]"); } catch (e) { app.soustruh106Counts = ["", "", "", ""]; }
}

function getShiftEnd(now) {
  const d = new Date(now);
  const day = d.getDay();

  if (day === 0 && d.getHours() >= 6 && d.getHours() < 14) {
    const e = new Date(d);
    e.setHours(14, 0, 0, 0);
    return e;
  }

  if (d.getHours() >= 6 && d.getHours() < 18) {
    const e = new Date(d);
    e.setHours(18, 0, 0, 0);
    return e;
  } else {
    const e = new Date(d);
    if (d.getHours() >= 18) e.setDate(e.getDate() + 1);
    e.setHours(6, 0, 0, 0);
    return e;
  }
}

const SHIFT_CYCLE_START = new Date(2026, 3, 27, 0, 0, 0, 0); // 27.4.2026 = B / 1. týden
const SHIFT_CYCLE_ORDER = ["B", "D", "A", "C"];
const SHIFT_PHASE_BY_TEAM = { B: 0, D: 1, A: 2, C: 3 };

function startOfLocalDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function startOfWeekMonday(d) {
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday = 0
  const base = startOfLocalDay(d);
  base.setDate(base.getDate() - diff);
  return base;
}

function formatDuration(ms) {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const parts = [];
  if (days) parts.push(days + " d");
  if (hours || parts.length) parts.push(hours + " h");
  parts.push(minutes + " min");
  return parts.join(" ");
}

function parseMonthKey(monthKey) {
  const m = /^(\d{1,2})\/(\d{2})$/.exec(String(monthKey || "").trim());
  if (!m) return null;
  return {
    month: parseInt(m[1], 10),
    year: 2000 + parseInt(m[2], 10)
  };
}

function makeSortDateFromMonthKey(monthKey, day, month) {
  const parsed = parseMonthKey(monthKey);
  const year = parsed ? parsed.year : 2026;
  const mm = Number.isFinite(month) ? month : (parsed ? parsed.month : 1);
  const dd = Number.isFinite(day) ? day : 1;
  return new Date(year, mm - 1, dd, 12, 0, 0, 0).toISOString();
}

function monthKeyFromYearMonth(year, month) {
  return String(month) + "/" + String(year).slice(-2);
}

function getAvailableYears(rotation) {
  const src = rotation || app.rotation || {};
  const years = new Set();
  Object.keys(src.months || {}).forEach(monthKey => {
    const parsed = parseMonthKey(monthKey);
    if (parsed) years.add(parsed.year);
  });
  if (!years.size) years.add(new Date().getFullYear());
  return [...years].sort((a, b) => a - b);
}

function getImportYears(rotation) {
  const available = getAvailableYears(rotation);
  const currentYear = new Date().getFullYear();
  const minYear = available.length ? Math.min(...available) : currentYear;
  const maxYear = available.length ? Math.max(...available) : currentYear;
  const start = Math.min(minYear - 1, currentYear - 1);
  const end = Math.max(maxYear + 1, currentYear + 2);
  const years = [];
  for (let y = start; y <= end; y += 1) years.push(y);
  return years;
}

function getInitialSelectedYear(rotation) {
  const years = getAvailableYears(rotation);
  const currentYear = new Date().getFullYear();
  return years.includes(currentYear) ? currentYear : years[years.length - 1];
}

function getMonthsForYear(rotation, year) {
  return Object.keys((rotation || app.rotation || {}).months || {})
    .filter(monthKey => {
      const parsed = parseMonthKey(monthKey);
      return parsed && parsed.year === year;
    })
    .sort((a, b) => {
      const pa = parseMonthKey(a);
      const pb = parseMonthKey(b);
      if (pa.year !== pb.year) return pa.year - pb.year;
      return pa.month - pb.month;
    });
}

function formatCount(value) {
  const num = Number(value) || 0;
  return Number.isInteger(num) ? String(num) : String(num).replace(".", ",");
}

function formatDoses(value) {
  const num = Number(value) || 0;
  const rounded = Math.round((num / 32) * 10) / 10;
  return formatCount(rounded);
}

function createDateFromMonthKey(monthKey, day) {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) return null;
  return new Date(parsed.year, parsed.month - 1, day, 12, 0, 0, 0);
}

function isSundayForMonthKey(monthKey, day) {
  const d = createDateFromMonthKey(monthKey, day);
  return d ? d.getDay() === 0 : false;
}

function setSelectedYear(year) {
  const numeric = parseInt(year, 10);
  if (!Number.isFinite(numeric)) return;
  app.selectedYear = numeric;

  const yearMonths = getMonthsForYear(app.rotation, numeric);
  if (!app.selectedMonth || !yearMonths.includes(app.selectedMonth)) {
    app.selectedMonth = yearMonths[0] || null;
  }

  renderRotace();
}

function setSelectedStatsName(name) {
  app.selectedStatsName = app.selectedStatsName === name ? null : (name || null);
  renderStatsPanel();
}

function setSelectedStatsMachine(machine) {
  app.selectedStatsMachine = app.selectedStatsMachine === machine ? null : (machine || null);
  renderStatsPanel();
}


function syncYearControls() {
  const monthYearSelect = document.getElementById("monthYearSelect");
  const statsYearSelect = document.getElementById("statsYearSelect");
  const importYearSelect = document.getElementById("importYearSelect");
  const overwriteMonth = document.getElementById("overwriteMonth");

  const fillSelect = (el, values, selected) => {
    if (!el) return;
    const current = String(selected || "");
    el.innerHTML = "";
    values.forEach(year => {
      const opt = document.createElement("option");
      opt.value = String(year);
      opt.textContent = String(year);
      if (String(year) === current) opt.selected = true;
      el.appendChild(opt);
    });
  };

  fillSelect(monthYearSelect, getAvailableYears(app.rotation), app.selectedYear);
  fillSelect(statsYearSelect, getAvailableYears(app.rotation), app.selectedYear);
  fillSelect(importYearSelect, getImportYears(app.rotation), app.importYear);

  if (overwriteMonth) {
    const selectedYear = parseInt(app.importYear, 10) || parseInt(app.selectedYear, 10);
    const months = getMonthsForYear(app.rotation, selectedYear);
    overwriteMonth.innerHTML = '<option value="">— jen doplnit nové měsíce —</option>';
    months.forEach(monthKey => {
      const opt = document.createElement("option");
      opt.value = monthKey;
      opt.textContent = monthKey;
      overwriteMonth.appendChild(opt);
    });
  }
}

