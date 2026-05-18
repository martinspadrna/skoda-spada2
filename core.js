
const APP_KEY = "rotace_kalkulacky_state_v123";
const APP_VERSION = "v.1.1 (571)";
window.APP_VERSION = APP_VERSION;
const ROTATION_BUILD = "2026-05-18-" + APP_VERSION + "-" + Date.now();

const HARD_MACHINE_HEADERS = ["TNKS01", "TBKR07", "TPKW01", "TPKW02", "TBKR01"];
const SOFT_MACHINE_HEADERS = ["MSKC01", "MSKC03", "MSKC04", "MFKF06", "MFKF10"];

const KNOWN_STAT_NAMES = new Set(["Blažek", "Kmínek", "Kříž", "Novotný", "Pech", "Starý", "Střížek", "Synek", "Třasák", "Špadrna"]);


const NO_START_HOLIDAYS = new Set(["1-1", "4-3", "4-6", "5-1", "5-8", "7-5", "7-6", "9-28", "10-17", "10-28", "12-24", "12-25", "12-26"]);

function dateKeyMD(date) {
  return (date.getMonth() + 1) + "-" + date.getDate();
}

const SPECIAL_OVERTIME_SUNDAY_NIGHTS_2026 = new Set([
  "2026-01-11",
  "2026-01-18",
  "2026-01-25",
  "2026-02-08",
  "2026-02-15",
  "2026-03-01",
  "2026-03-08",
  "2026-03-15",
  "2026-03-22",
  "2026-03-29",
  "2026-04-12",
  "2026-04-19",
  "2026-05-17",
  "2026-05-24",
  "2026-05-31",
  "2026-06-07",
  "2026-06-14",
  "2026-06-21",
  "2026-09-13",
  "2026-09-20",
  "2026-10-04",
  "2026-10-11",
  "2026-10-18",
  "2026-11-22"
]);
window.SPECIAL_OVERTIME_SUNDAY_NIGHTS_2026 = SPECIAL_OVERTIME_SUNDAY_NIGHTS_2026;

function dateKeyISO(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function isSpecialOvertimeSundayNight(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.getDay() === 0 && SPECIAL_OVERTIME_SUNDAY_NIGHTS_2026.has(dateKeyISO(d));
}

function getSpecialSundayNightStartHour(date, fallbackHour = 22) {
  return isSpecialOvertimeSundayNight(date) ? 18 : fallbackHour;
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

const CZD_PERIODS = [
  { start: new Date(2026, 6, 19, 14, 0, 0, 0), end: new Date(2026, 7, 2, 18, 0, 0, 0) },
  { start: new Date(2026, 11, 23, 18, 0, 0, 0), end: new Date(2027, 0, 2, 6, 0, 0, 0) }
];

function getVacationCountdown(now) {
  const today = new Date(now || new Date());
  today.setHours(0, 0, 0, 0);
  const upcoming = CZD_PERIODS.find(period => period.start.getTime() > today.getTime()) || CZD_PERIODS[0];
  if (!upcoming) return { text: '—', meta: '' };

  const start = new Date(upcoming.start);
  start.setHours(0, 0, 0, 0);
  const diffDays = Math.max(0, Math.round((start.getTime() - today.getTime()) / 86400000));
  const targetLabel = upcoming.start.getTime() === CZD_PERIODS[0].start.getTime() ? 'k CZD' : 'k Vánocům';
  return {
    text: diffDays === 0 ? 'Dnes' : (diffDays + ' ' + (diffDays === 1 ? 'den' : 'dní')),
    meta: targetLabel
  };
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
  soustruhPlan: "",
  soustruh126Start: 32,
  soustruh106Counts: ["", "", "", ""],
  selectedYear: new Date().getFullYear(),
  importYear: new Date().getFullYear(),
  foodScheduleFocus: "kantyna",
  importClicks: 0,
  aboutTapCount: 0,
  aboutTapTimer: null,
  contactTapCount: 0,
  homeBootSuppressed: false,
  tttState: null,
  gamesLeaderboardCache: { "ttt": [], "2048": [], "snake": [], "flap": [] },
  gamesSnakeJoystickEnabled: false,
  pendingMenuImport: false,
  adminUnlocked: false,
  machine: localStorage.getItem("machine") || "TBKR01",
  prog: localStorage.getItem("prog") || "AD",
  version: APP_VERSION,
  rotation: appRotation
};
window.app = app;

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

// Budoucí rozšíření: statistiky za rok pro jednotlivá jména/stroje/úklid.

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const RAK_DATA_OPTIMIZATION_STATS = window.__rakDataOptimizationStats || {
  phase: 'phase-7-data-optimization',
  localStorageWrites: 0,
  localStorageSkippedWrites: 0,
  localStorageWriteErrors: 0,
  rotationStateWrites: 0,
  rotationStateSkippedWrites: 0,
  approxBytesWritten: 0,
  approxBytesSkipped: 0,
  localStorageReads: 0,
  localStorageReadCacheHits: 0,
  localStorageJsonParseReads: 0,
  localStorageJsonParseCacheHits: 0,
  localStorageJsonParseErrors: 0,
  approxBytesRead: 0,
  homeRefreshSchedules: 0,
  homeRefreshCoalescedSchedules: 0,
  homeRefreshRuns: 0,
  homeRefreshModalSkips: 0,
  homeRefreshLastReason: '',
  homeRefreshLastAt: null,
  lastWriteKey: '',
  lastSkipKey: '',
  lastReadKey: '',
  lastWriteAt: null,
  lastSkipAt: null,
  lastReadAt: null
};
window.__rakDataOptimizationStats = RAK_DATA_OPTIMIZATION_STATS;

const RAK_LOCAL_STORAGE_READ_CACHE = window.__rakLocalStorageReadCache || new Map();
window.__rakLocalStorageReadCache = RAK_LOCAL_STORAGE_READ_CACHE;
const RAK_LOCAL_STORAGE_JSON_CACHE = window.__rakLocalStorageJsonCache || new Map();
window.__rakLocalStorageJsonCache = RAK_LOCAL_STORAGE_JSON_CACHE;
try {
  window.addEventListener('storage', (event) => {
    if (!event || !event.key) {
      RAK_LOCAL_STORAGE_READ_CACHE.clear();
      RAK_LOCAL_STORAGE_JSON_CACHE.clear();
      return;
    }
    RAK_LOCAL_STORAGE_READ_CACHE.delete(event.key);
    RAK_LOCAL_STORAGE_JSON_CACHE.delete(event.key);
  });
} catch (err) {}

function approxStringBytes(value) {
  const text = String(value ?? '');
  try { return new Blob([text]).size; }
  catch (err) { return text.length; }
}

function getLocalStorageCached(key, fallbackValue = '') {
  const storageKey = String(key || '').trim();
  if (!storageKey) return fallbackValue;
  if (RAK_LOCAL_STORAGE_READ_CACHE.has(storageKey)) {
    RAK_DATA_OPTIMIZATION_STATS.localStorageReadCacheHits += 1;
    const cached = RAK_LOCAL_STORAGE_READ_CACHE.get(storageKey);
    return cached === null || cached === undefined ? fallbackValue : cached;
  }
  try {
    const raw = localStorage.getItem(storageKey);
    RAK_LOCAL_STORAGE_READ_CACHE.set(storageKey, raw);
    RAK_DATA_OPTIMIZATION_STATS.localStorageReads += 1;
    RAK_DATA_OPTIMIZATION_STATS.approxBytesRead += approxStringBytes(raw || '');
    RAK_DATA_OPTIMIZATION_STATS.lastReadKey = storageKey;
    RAK_DATA_OPTIMIZATION_STATS.lastReadAt = Date.now();
    return raw === null || raw === undefined ? fallbackValue : raw;
  } catch (err) {
    return fallbackValue;
  }
}

function cloneCachedJson(value) {
  if (value === null || value === undefined || typeof value !== 'object') return value;
  try { return JSON.parse(JSON.stringify(value)); }
  catch (err) { return Array.isArray(value) ? value.slice() : Object.assign({}, value); }
}

function parseLocalStorageJsonCached(key, fallbackValue) {
  const storageKey = String(key || '').trim();
  const raw = getLocalStorageCached(storageKey, '');
  if (!raw) return cloneCachedJson(fallbackValue);
  const cached = RAK_LOCAL_STORAGE_JSON_CACHE.get(storageKey);
  if (cached && cached.raw === raw) {
    RAK_DATA_OPTIMIZATION_STATS.localStorageJsonParseCacheHits += 1;
    return cloneCachedJson(cached.value);
  }
  try {
    const parsed = JSON.parse(raw);
    RAK_LOCAL_STORAGE_JSON_CACHE.set(storageKey, { raw, value: parsed });
    RAK_DATA_OPTIMIZATION_STATS.localStorageJsonParseReads += 1;
    return cloneCachedJson(parsed);
  } catch (err) {
    RAK_DATA_OPTIMIZATION_STATS.localStorageJsonParseErrors += 1;
    return cloneCachedJson(fallbackValue);
  }
}

function setLocalStorageIfChanged(key, value) {
  const storageKey = String(key || '').trim();
  if (!storageKey) return false;
  const storageValue = String(value ?? '');
  try {
    const current = RAK_LOCAL_STORAGE_READ_CACHE.has(storageKey)
      ? RAK_LOCAL_STORAGE_READ_CACHE.get(storageKey)
      : localStorage.getItem(storageKey);
    if (current === storageValue) {
      RAK_DATA_OPTIMIZATION_STATS.localStorageSkippedWrites += 1;
      RAK_DATA_OPTIMIZATION_STATS.approxBytesSkipped += approxStringBytes(storageValue);
      RAK_DATA_OPTIMIZATION_STATS.lastSkipKey = storageKey;
      RAK_DATA_OPTIMIZATION_STATS.lastSkipAt = Date.now();
      if (storageKey === APP_KEY) RAK_DATA_OPTIMIZATION_STATS.rotationStateSkippedWrites += 1;
      return false;
    }
    localStorage.setItem(storageKey, storageValue);
    RAK_LOCAL_STORAGE_READ_CACHE.set(storageKey, storageValue);
    RAK_LOCAL_STORAGE_JSON_CACHE.delete(storageKey);
    RAK_DATA_OPTIMIZATION_STATS.localStorageWrites += 1;
    RAK_DATA_OPTIMIZATION_STATS.approxBytesWritten += approxStringBytes(storageValue);
    RAK_DATA_OPTIMIZATION_STATS.lastWriteKey = storageKey;
    RAK_DATA_OPTIMIZATION_STATS.lastWriteAt = Date.now();
    if (storageKey === APP_KEY) RAK_DATA_OPTIMIZATION_STATS.rotationStateWrites += 1;
    return true;
  } catch (err) {
    RAK_DATA_OPTIMIZATION_STATS.localStorageWriteErrors += 1;
    throw err;
  }
}

function getDataOptimizationStatus() {
  return Object.assign({}, RAK_DATA_OPTIMIZATION_STATS);
}
window.getDataOptimizationStatus = getDataOptimizationStatus;

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
    // Fáze 7: startovní načtení používá stejnou lokální read/JSON cache jako zbytek appky.
    // Tím se při reloadu a opakovaných init kontrolách nečte/parsuje velký stav zbytečně víckrát.
    const savedBuild = getLocalStorageCached("rotationBuild", "");
    if (savedBuild && savedBuild !== ROTATION_BUILD) {
      return defaultRotation();
    }
    const parsed = parseLocalStorageJsonCached(APP_KEY, null);
    if (!parsed || !parsed.months) return defaultRotation();
    return normalizeRotationData(parsed);
  } catch (e) {
    return defaultRotation();
  }
}

function saveRotationData() {
  try {
    let changed = false;
    const write = (key, value) => {
      if (setLocalStorageIfChanged(key, value)) changed = true;
    };

    // Fáze 7: velký stav rotací ukládáme jen tehdy, když se opravdu změnil.
    // Dřív se při některých kliknutích/stringify + localStorage zápis opakoval i bez změny.
    const rotationJson = JSON.stringify(app.rotation);
    write(APP_KEY, rotationJson);
    write("rotationBuild", ROTATION_BUILD);
    write("machine", app.machine);
    write("prog", app.prog);
    write("f_kusy", document.getElementById("f_kusy")?.value || "");
    write("f_finish_kusy", document.getElementById("f_finish_kusy")?.value || "");
    write("f_finish_davky", document.getElementById("f_finish_davky")?.value || "");
    write("p_kusy", document.getElementById("p_kusy")?.value || "");
    write("b_finish_kusy", document.getElementById("b_finish_kusy")?.value || "");
    write("b_finish_davky", document.getElementById("b_finish_davky")?.value || "");
    write("davka", document.getElementById("davka")?.value || "");
    write("orovnani", document.getElementById("orovnani")?.value || "");
    write("celkem", document.getElementById("celkem")?.value || "");
    write("soustruhMode", app.soustruhMode);
    write("soustruhFirstBatch", app.soustruhFirstBatch || "");
    write("soustruhPlan", app.soustruhPlan || "");
    write("soustruh126Start", String(app.soustruh126Start || 32));
    write("soustruh106Counts", JSON.stringify(app.soustruh106Counts || ["", "", "", ""]));
    write("adminUnlocked", app.adminUnlocked ? "1" : "0");
    if (changed && typeof window.__rotaceSignalStateChange === "function") {
      window.__rotaceSignalStateChange("local-save");
    }
  } catch (e) {}
}

function restoreInputs() {
  const setVal = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.value = getLocalStorageCached(key, "") || "";
  };
  setVal("f_kusy", "f_kusy");
  setVal("f_finish_kusy", "f_finish_kusy");
  setVal("f_finish_davky", "f_finish_davky");
  setVal("p_kusy", "p_kusy");
  setVal("b_finish_kusy", "b_finish_kusy");
  setVal("b_finish_davky", "b_finish_davky");
  setVal("davka", "davka");
  setVal("orovnani", "orovnani");
  setVal("celkem", "celkem");
  const lisPlanEl = document.getElementById("lis_plan");
  const soustruhDefaultPlan = String(typeof getSoustruhDefaultPlan === "function" ? getSoustruhDefaultPlan() : 1216);
  if (lisPlanEl) lisPlanEl.value = soustruhDefaultPlan;
  const v126PlanEl = document.getElementById("v126_plan");
  if (v126PlanEl) v126PlanEl.value = soustruhDefaultPlan;
  const v106PlanEl = document.getElementById("v106_plan");
  if (v106PlanEl) v106PlanEl.value = soustruhDefaultPlan;
  const soustruhCounts = parseLocalStorageJsonCached("soustruh106Counts", ["", "", "", ""]);
  ["v106_c1","v106_c2","v106_c3","v106_c4"].forEach((id, idx) => { const el = document.getElementById(id); if (el && !el.value) el.value = soustruhCounts[idx] || ""; });
  app.soustruhMode = getLocalStorageCached("soustruhMode", "") || app.soustruhMode || "lis";
  app.soustruhFirstBatch = getLocalStorageCached("soustruhFirstBatch", "") || "";
  const storedSoustruhPlan = getLocalStorageCached("soustruhPlan", "");
  app.soustruhPlan = storedSoustruhPlan && storedSoustruhPlan !== "1248" ? storedSoustruhPlan : String(typeof getSoustruhDefaultPlan === "function" ? getSoustruhDefaultPlan() : 1216);
  app.soustruh126Start = parseInt(getLocalStorageCached("soustruh126Start", ""), 10) || 32;
  app.soustruh106Counts = Array.isArray(soustruhCounts) ? soustruhCounts : ["", "", "", ""];
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

function getSoustruhDefaultPlan(now) {
  const d = new Date(now || new Date());
  const day = d.getDay();
  const hour = d.getHours();

  if (day === 0 && hour >= 6 && hour < 14) return 704;
  if ((day === 0 && hour >= 22) || (day === 1 && hour < 6)) return 832;
  return 1216;
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

