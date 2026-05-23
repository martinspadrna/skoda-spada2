function resetSoustruhy() {
  ["lis_first", "lis_plan", "v126_first", "v126_plan", "v126_heat_first", "v106_first", "v106_plan", "v106_heat_first", "v106_c1", "v106_c2", "v106_c3", "v106_c4", "combo_first_start", "combo_first_end", "combo_second_start", "combo_second_plan", "combo_heat_first", "combo106_c1", "combo106_c2", "combo106_c3", "combo106_c4"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  ["soustruhyLisResult", "soustruhy126Result", "soustruhy106Result", "soustruhyComboResult", "soustruhy126HeatResult", "soustruhy106HeatResult", "soustruhyComboHeatResult"].forEach(id => {
    const el = document.getElementById(id);
    if (el) setCalcOutputHtml(el, "", id);
  });
  app.soustruhMode = "lis";
  app.soustruhPlan = String(typeof getSoustruhDefaultPlan === "function" ? getSoustruhDefaultPlan() : 1216);
  app.soustruh126Start = 32;
  app.soustruh126HeatFirst = "";
  app.soustruh106HeatFirst = "";
  app.soustruhComboFreeType = "126";
  app.soustruhComboFirstType = "lis";
  app.soustruhCombo126Start = 32;
  app.soustruhComboHeatFirst = "";
  app.soustruhCombo106Counts = ["", "", "", ""];
  app.soustruh106Counts = ["", "", "", ""];
  renderSoustruhy();
  saveRotationData();
}

function resetFields(ids, resultIds) {
  const safeIds = Array.isArray(ids) ? ids : [];
  safeIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  if (safeIds.some(id => String(id || '').indexOf('lathe_axis_drill') === 0)) {
    resetLatheAxisSignButtons();
  }
  (Array.isArray(resultIds) ? resultIds : []).forEach(id => {
    const el = document.getElementById(id);
    if (el) setCalcOutputHtml(el, "", id);
  });
  saveRotationData();
}

function renderCalcResult(title, lines, meta) {
  const safeLines = (Array.isArray(lines) ? lines : []).filter(Boolean);
  const safeMeta = meta ? String(meta) : "";
  return "<div class='calcResultTitle'>" + escapeHtml(title) + "</div>" +
    safeLines.map((line, index) => "<div class='" + (index === 0 ? "calcResultMain" : "calcResultLine") + "'>" + line + "</div>").join("") +
    (safeMeta ? "<div class='calcResultSub'>" + escapeHtml(safeMeta) + "</div>" : "");
}
function setCalcOutputHtml(elementOrId, html, key) {
  const el = typeof elementOrId === "string" ? document.getElementById(elementOrId) : elementOrId;
  if (!el) return false;
  if (typeof setElementHtmlIfChanged === "function") {
    return setElementHtmlIfChanged(el, html, key || el.id || "calcOutput");
  }
  el.innerHTML = String(html ?? "");
  return true;
}

function formatClockTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return hh + ":" + mm;
}

function readPositiveInt(id) {
  const el = document.getElementById(id);
  if (!el) return 0;
  const value = parseInt(el.value, 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function resolveTargetPieces(pieceId, doseId) {
  const pieces = readPositiveInt(pieceId);
  if (pieces > 0) return { pieces, source: 'ks' };
  const doses = readPositiveInt(doseId);
  if (doses > 0) return { pieces: doses * 32, source: 'dávek' };
  return { pieces: 0, source: '' };
}

function renderFinishResult(outId, label, pieces, seconds, extraLine) {
  const out = document.getElementById(outId);
  if (!out) return;
  if (!pieces || !seconds || seconds < 0) {
    setCalcOutputHtml(out, "<div class='smallText'>Zadej počet celých dávek.</div>", out.id || "calcEmpty");
    return;
  }
  const now = new Date();
  const finish = new Date(now.getTime() + Math.round(seconds * 1000));
  const durationText = formatDuration(Math.round(seconds * 1000));
  const dosesText = formatDoses(pieces);
  setCalcOutputHtml(out, renderCalcResult(label, [
    "Hotovo v <b>" + formatClockTime(finish) + "</b>"
  ], "Za " + durationText + " · " + formatCount(pieces) + " ks / " + dosesText + " dávek" + (extraLine ? " · " + extraLine : "")), outId);
}

function estimateBrusSecondsForPieces(pieces, cfg, doneInBatch, piecesToDress) {
  const pieceSec = Number(cfg.pieceSec) || 0;
  const dressEvery = Math.max(1, Math.floor(Number(cfg.dressEvery) || 1));
  const dressSec = Math.max(0, Number(cfg.dressSec) || 0);
  const targetPieces = Math.max(0, Math.floor(Number(pieces) || 0));
  const alreadyDone = Math.max(0, Math.floor(Number(doneInBatch) || 0));

  if (pieceSec <= 0 || targetPieces <= 0) return 0;

  let remaining = Math.max(0, targetPieces - alreadyDone);
  if (remaining <= 0) return 0;

  let firstRun = Math.max(1, Math.floor(Number(piecesToDress) || 0));
  if (!firstRun) {
    const modulo = alreadyDone % dressEvery;
    firstRun = modulo ? (dressEvery - modulo) : dressEvery;
  }

  let seconds = 0;
  const runFirst = Math.min(remaining, firstRun);
  seconds += runFirst * pieceSec;
  remaining -= runFirst;

  while (remaining > 0) {
    seconds += dressSec;
    const run = Math.min(remaining, dressEvery);
    seconds += run * pieceSec;
    remaining -= run;
  }

  return seconds;
}


function calcF() {
  const sec = Math.max(0, (getShiftEnd(new Date()) - new Date()) / 1000);
  const ks = Math.floor(sec / 60);
  const hotovo = parseInt(document.getElementById("f_kusy").value) || 0;
  const celkem = hotovo + ks;
  setCalcOutputHtml("outF", renderCalcResult("Frézky", [
    "Do konce směny ještě stihneš <b>" + formatCount(ks) + " ks</b> / " + formatDoses(ks) + " dávek.",
    "Celkově budeš mít <b>" + formatCount(celkem) + " ks</b> / " + formatDoses(celkem) + " dávek.",
    "Na obou frézkách ještě stihneš <b>" + formatCount(ks * 2) + " ks</b> / " + formatDoses(ks * 2) + " dávek."
  ]), "outF");
  saveRotationData();
}

function calcFFinish() {
  const target = resolveTargetPieces("f_finish_kusy", "f_finish_davky");
  const out = document.getElementById("outFTime");
  if (!out) return;
  if (!target.pieces) {
    setCalcOutputHtml(out, "<div class='smallText'>Zadej počet celých dávek.</div>", out.id || "calcEmpty");
    return;
  }
  const seconds = target.pieces * 60;
  const now = new Date();
  const finish = new Date(now.getTime() + seconds * 1000);
  setCalcOutputHtml(out, renderCalcResult("Frézky", [
    "Hotovo v <b>" + formatClockTime(finish) + "</b>"
  ], "Za " + formatDuration(seconds * 1000) + " · " + formatCount(target.pieces) + " ks / " + formatDoses(target.pieces) + " dávek"), out.id || "outFTime");
  saveRotationData();
}

function findPrackaMachineSetting() {
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  return rows.find(row => {
    const settings = parseBrusSettingsJson(row);
    const key = String(row && row.machine_key ? row.machine_key : '').trim().toUpperCase();
    const code = String(row && (row.machine_code || row.machine) ? (row.machine_code || row.machine) : (settings.machine || '')).trim().toUpperCase();
    const category = String(row && row.category ? row.category : '').trim().toLowerCase();
    const label = String(row && row.label ? row.label : '').trim().toLowerCase();
    return key === 'TPKW01' || code === 'TPKW01' || category === 'pracka' || label === 'pračka' || label === 'pracka';
  }) || null;
}

function getPrackaCycleSeconds() {
  const setting = findPrackaMachineSetting();
  const settings = parseBrusSettingsJson(setting);
  const value = firstFilledNumber(
    setting && setting.cycle_time,
    setting && setting.speed,
    settings.cycle_time,
    30
  );
  return value > 0 ? value : 30;
}

function formatPrackaCycleSeconds(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '30';
  return num.toLocaleString('cs-CZ', { maximumFractionDigits: num % 1 ? 1 : 0, minimumFractionDigits: 0 });
}

function updatePrackaInfo() {
  const el = document.getElementById('prackaInfo');
  if (!el) return;
  const pieceSec = getPrackaCycleSeconds();
  setCalcOutputHtml(el, '<div><b>Pračka</b></div><div class="smallText">Výroba kusu: ' + escapeHtml(formatPrackaCycleSeconds(pieceSec)) + ' s · dávka 32 ks</div>', 'prackaInfo:' + pieceSec);
}

function calcP() {
  updatePrackaInfo();
  const pieceSec = getPrackaCycleSeconds();
  const sec = Math.max(0, (getShiftEnd(new Date()) - new Date()) / 1000);
  const ks = Math.floor(sec / pieceSec);
  const hotovo = parseInt(document.getElementById("p_kusy").value, 10) || 0;
  const celkem = Math.max(0, hotovo) + ks;
  setCalcOutputHtml("outP", renderCalcResult("Pračka", [
    "Do konce směny ještě stihneš <b>" + formatCount(ks) + " ks</b> / " + formatDoses(ks) + " dávek.",
    "S počítadlem budeš mít <b>" + formatCount(celkem) + " ks</b> / " + formatDoses(celkem) + " dávek."
  ], "Výroba kusu: " + formatPrackaCycleSeconds(pieceSec) + " s · dávka 32 ks"), "outP");
  saveRotationData();
}

function refreshPrackaFromMachineSettings(source) {
  try { updatePrackaInfo(); } catch (err) {}
  const outPieces = document.getElementById('outP');
  const outTime = document.getElementById('outPTime');
  const hasPiecesResult = !!(outPieces && String(outPieces.textContent || '').trim());
  const hasTimeResult = !!(outTime && String(outTime.textContent || '').trim());
  try { if (hasPiecesResult && typeof calcP === 'function') calcP(); } catch (err) {}
  try { if (hasTimeResult && typeof calcPFinish === 'function') calcPFinish(); } catch (err) {}
}

function calcPFinish() {
  updatePrackaInfo();
  const out = document.getElementById("outPTime");
  if (!out) return;
  const pieceSec = getPrackaCycleSeconds();
  const batches = Math.max(0, parseInt(document.getElementById("p_finish_davky")?.value || "", 10) || 0);
  const doneInBatch = Math.max(0, parseInt(document.getElementById("p_finish_davka")?.value || "", 10) || 0);
  if (!batches) {
    setCalcOutputHtml(out, "<div class='smallText'>Zadej počet zbývajících dávek.</div>", out.id || "calcEmpty");
    return;
  }
  const targetPieces = batches * 32;
  const remainingPieces = Math.max(0, targetPieces - doneInBatch);
  const seconds = remainingPieces * pieceSec;
  const now = new Date();
  const finish = new Date(now.getTime() + seconds * 1000);
  const partialNote = doneInBatch > 0
    ? " · rozdělaná dávka má " + formatCount(doneInBatch) + " ks hotovo"
    : "";
  setCalcOutputHtml(out, renderCalcResult("Pračka", [
    "Hotovo v <b>" + formatClockTime(finish) + "</b>"
  ], "Za " + formatDuration(seconds * 1000) + " · zbývá " + formatCount(remainingPieces) + " ks / " + formatDoses(remainingPieces) + " dávek · " + formatPrackaCycleSeconds(pieceSec) + " s/ks" + partialNote), out.id || "outPTime");
  saveRotationData();
}

function calcBrusy() {
  const sec = Math.max(0, (getShiftEnd(new Date()) - new Date()) / 1000);
  const cfg = getBrusConfig(app.machine, app.prog);
  const ks = countBrusyPieces(sec, cfg);
  const doneInCart = parseInt(document.getElementById("davka").value) || 0;
  const celkem = parseInt(document.getElementById("celkem").value) || 0;
  const doseBase = ks + Math.max(0, doneInCart);
  const celkove = celkem + ks;
  const preciseLine = doneInCart > 0
    ? "Rozdělaný vozík/dávka: <b>" + formatCount(doneInCart) + " ks</b> se používá jen pro přepočet dávek, nepřičítá se znovu do celkových kusů."
    : "Přesnější výpočet může zohlednit rozdělaný vozík/dávku jen pro přepočet dávek.";
  setCalcOutputHtml("outB", renderCalcResult(app.machine + " / " + cfg.label, [
    "Do konce směny ještě stihneš <b>" + formatCount(ks) + " ks</b> / " + formatDoses(doseBase) + " dávek včetně rozdělaného vozíku.",
    "Celkově budeš mít <b>" + formatCount(celkove) + " ks</b> / " + formatDoses(celkove) + " dávek.",
    preciseLine
  ]), "outB");
  saveRotationData();
}

function calcBrusyFinish() {
  const target = resolveTargetPieces("", "b_finish_davky");
  const readFirstInt = (...ids) => {
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;
      const raw = String(el.value ?? "").trim();
      if (raw === "") continue;
      const val = parseInt(raw, 10);
      if (!Number.isNaN(val)) return val;
    }
    return 0;
  };
  const doneInBatch = Math.max(0, readFirstInt("b_finish_davka", "davka"));
  const piecesToDress = Math.max(0, readFirstInt("b_finish_orovnani", "orovnani"));
  const out = document.getElementById("outBTime");
  if (!out) return;
  if (!target.pieces) {
    setCalcOutputHtml(out, "<div class='smallText'>Zadej počet celých dávek.</div>", out.id || "calcEmpty");
    return;
  }
  const cfg = getBrusConfig(app.machine, app.prog);
  const seconds = estimateBrusSecondsForPieces(target.pieces, cfg, doneInBatch, piecesToDress);
  const remainingPieces = Math.max(0, target.pieces - doneInBatch);
  const now = new Date();
  const finish = new Date(now.getTime() + seconds * 1000);
  const preciseNote = (doneInBatch > 0 || piecesToDress > 0)
    ? (" · přesněji s rozdělanou dávkou" + (doneInBatch > 0 ? (" " + formatCount(doneInBatch) + " ks hotovo") : "") + (piecesToDress > 0 ? (", do orovnání " + formatCount(piecesToDress) + " ks") : ""))
    : "";
  const preciseDetails = (doneInBatch > 0 || piecesToDress > 0)
    ? ("<div class='smallText'>Zohledněno: " + (doneInBatch > 0 ? ("rozpracovaná dávka má " + formatCount(doneInBatch) + " ks hotovo") : "bez rozdělané dávky") + (piecesToDress > 0 ? (", do orovnání zbývá " + formatCount(piecesToDress) + " ks") : "") + ".</div>")
    : "";
  setCalcOutputHtml(out, renderCalcResult(app.machine + " / " + cfg.label, [
    "Hotovo v <b>" + formatClockTime(finish) + "</b>"
  ], "Za " + formatDuration(seconds * 1000) + " · " + formatCount(remainingPieces) + " ks / " + formatDoses(remainingPieces) + " dávek" + preciseNote) + preciseDetails, out.id || "outBTime");
  saveRotationData();
}


function setMachine(m) {
  app.machine = m;
  renderBrusy();
  renderSoustruhy();
  saveRotationData();
}

function setProg(p) {
  app.prog = p;
  renderBrusy();
  renderSoustruhy();
  saveRotationData();
}

function normalizeBrusSettingIndex(prog) {
  const raw = String(prog || '').trim();
  if (raw === 'ADV') return 'AD volné';
  if (raw === 'AEV') return 'AE volné';
  return raw;
}

function parseBrusSettingsJson(row) {
  if (!row || row.settings_json === null || row.settings_json === undefined) return {};
  if (typeof row.settings_json === 'object') return row.settings_json || {};
  try { return JSON.parse(String(row.settings_json || '{}')) || {}; }
  catch (err) { return {}; }
}

function firstFilledNumber() {
  for (let i = 0; i < arguments.length; i += 1) {
    const value = arguments[i];
    if (value === '' || value === null || value === undefined) continue;
    const num = Number(String(value).replace(',', '.'));
    if (Number.isFinite(num)) return num;
  }
  return 0;
}

function findBrusMachineSetting(machine, prog) {
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  const machineCode = String(machine || '').trim();
  const progCode = String(prog || '').trim();
  const settingIndex = normalizeBrusSettingIndex(progCode);
  const keyCandidates = new Set([
    machineCode + '-' + progCode,
    machineCode + '_' + progCode,
    machineCode + '-' + settingIndex,
    machineCode + '_' + settingIndex
  ].filter(Boolean));

  return rows.find(row => {
    const settings = parseBrusSettingsJson(row);
    const rowKey = String(row && row.machine_key ? row.machine_key : '').trim();
    if (rowKey && keyCandidates.has(rowKey)) return true;

    const rowMachine = String(row && (row.machine_code || row.machine) ? (row.machine_code || row.machine) : (settings.machine || '')).trim();
    const rowIndex = String(row && (row.machine_index || row.index) ? (row.machine_index || row.index) : (settings.index || '')).trim();
    return rowMachine === machineCode && (rowIndex === settingIndex || rowIndex === progCode);
  }) || null;
}

function getBrusConfig(machine, prog) {
  const fallback = BRUS_CONFIG[machine] || BRUS_CONFIG.TBKR01;
  const cfg = fallback[prog] || fallback.AD;
  const setting = findBrusMachineSetting(machine, prog);
  const settings = parseBrusSettingsJson(setting);
  const pieceSec = firstFilledNumber(
    setting && setting.cycle_time,
    setting && setting.speed,
    settings.cycle_time,
    cfg.pieceSec
  );
  const dressEvery = firstFilledNumber(
    setting && setting.dress_count,
    settings.dress_count,
    cfg.dressEvery
  );
  const dressSec = firstFilledNumber(
    setting && setting.dress_time,
    settings.dress_time,
    cfg.dressSec
  );
  return {
    machine,
    prog,
    label: (setting && setting.label ? setting.label : cfg.label || prog),
    pieceSec,
    dressEvery,
    dressSec
  };
}

function formatBrusSeconds(value) {
  const num = Math.max(0, Number(value) || 0);
  if (num < 60) {
    return formatCount(Math.round(num * 10) / 10).replace(".", ",") + " s";
  }
  const whole = Math.round(num);
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  return seconds ? (minutes + "m" + seconds + "s") : (minutes + " min");
}

function formatBrusDuration(value) {
  const num = Math.max(0, Math.round(Number(value) || 0));
  const minutes = Math.floor(num / 60);
  const seconds = num % 60;
  return seconds ? (minutes + "m" + seconds + "s") : (minutes + " min");
}

function countBrusyPieces(availableSec, cfg) {
  const pieceSec = Number(cfg.pieceSec) || 0;
  const dressEvery = Math.max(1, Math.floor(Number(cfg.dressEvery) || 1));
  const dressSec = Math.max(0, Number(cfg.dressSec) || 0);
  if (pieceSec <= 0) return 0;

  let low = 0;
  let high = Math.max(1, Math.floor(availableSec / pieceSec) + 1);

  const needed = (pieces) => {
    if (pieces <= 0) return 0;
    return pieces * pieceSec + Math.floor((pieces - 1) / dressEvery) * dressSec;
  };

  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (needed(mid) <= availableSec) low = mid;
    else high = mid - 1;
  }
  return low;
}


function getSoustruhBatchList(firstBatch, sizes, plan) {
  const batches = [];
  const start = parseInt(firstBatch, 10);
  const target = parseInt(plan, 10);
  if (!Number.isFinite(start) || !Number.isFinite(target) || target <= 0 || !Array.isArray(sizes) || !sizes.length) return batches;

  let produced = 0;
  let batchNo = start;
  let index = 0;
  while (produced < target && batches.length < 1000) {
    const size = Number(sizes[index % sizes.length]) || 0;
    if (size <= 0) break;
    produced += size;
    batches.push({ batchNo, size, produced });
    batchNo += 1;
    index += 1;
  }
  return batches;
}

function getSoustruhBatchRange(firstBatch, lastBatch, sizes) {
  const batches = [];
  const start = parseInt(firstBatch, 10);
  const end = parseInt(lastBatch, 10);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start || !Array.isArray(sizes) || !sizes.length) return batches;

  let produced = 0;
  let batchNo = start;
  let index = 0;
  while (batchNo <= end && batches.length < 1000) {
    const size = Number(sizes[index % sizes.length]) || 0;
    if (size <= 0) break;
    produced += size;
    batches.push({ batchNo, size, produced });
    batchNo += 1;
    index += 1;
  }
  return batches;
}


function getSoustruhHeatGroups(firstGuide, sizes, plan, firstHeatGuide) {
  const start = parseInt(firstGuide, 10);
  const batches = getSoustruhBatchList(start, sizes, plan);
  return getSoustruhHeatGroupsFromBatches(firstHeatGuide || start, batches);
}

function getSoustruhHeatGroupsFromBatches(firstHeatGuide, batches) {
  const heatStart = parseInt(firstHeatGuide, 10);
  const safeBatches = Array.isArray(batches) ? batches : [];
  if (!Number.isFinite(heatStart) || !safeBatches.length) {
    return {
      groups: [],
      batchCount: 0,
      heatCount: 0,
      firstHeatGuide: 0,
      firstProducedGuide: 0,
      lastPlannedGuide: 0,
      lastHeatGuide: 0,
      fillCount: 0,
      fillGuides: [],
      externalGuides: []
    };
  }

  const batchNumbers = safeBatches
    .map(item => Number(item.batchNo))
    .filter(number => Number.isFinite(number))
    .sort((a, b) => a - b);
  if (!batchNumbers.length) {
    return {
      groups: [],
      batchCount: 0,
      heatCount: 0,
      firstHeatGuide: heatStart,
      firstProducedGuide: 0,
      lastPlannedGuide: 0,
      lastHeatGuide: 0,
      fillCount: 0,
      fillGuides: [],
      externalGuides: []
    };
  }

  const firstProducedGuide = batchNumbers[0];
  const lastPlannedGuide = batchNumbers[batchNumbers.length - 1];
  const plannedSet = new Set(batchNumbers);
  const firstGroupStart = heatStart + Math.floor((firstProducedGuide - heatStart) / 4) * 4;
  const lastGroupStart = heatStart + Math.floor((lastPlannedGuide - heatStart) / 4) * 4;
  const groups = [];

  for (let groupStart = firstGroupStart, groupIndex = 0; groupStart <= lastGroupStart; groupStart += 4, groupIndex += 1) {
    const guides = [0, 1, 2, 3].map(step => {
      const number = groupStart + step;
      const planned = plannedSet.has(number);
      const fill = !planned && number > lastPlannedGuide;
      const external = !planned && !fill;
      return {
        number,
        planned,
        fill,
        external
      };
    });
    const plannedInside = guides.filter(item => item.planned).length;
    const fillGuides = guides.filter(item => item.fill).map(item => item.number);
    const externalGuides = guides.filter(item => item.external).map(item => item.number);
    groups.push({
      number: groupIndex + 1,
      groupStart,
      groupEnd: groupStart + 3,
      guides,
      plannedInside,
      fillGuides,
      externalGuides
    });
  }

  const fillGuides = groups.flatMap(item => item.fillGuides || []);
  const externalGuides = groups.flatMap(item => item.externalGuides || []);
  return {
    groups,
    batchCount: batchNumbers.length,
    heatCount: groups.length,
    firstHeatGuide: heatStart,
    firstProducedGuide,
    lastPlannedGuide,
    lastHeatGuide: lastGroupStart + 3,
    fillCount: fillGuides.length,
    fillGuides,
    externalGuides
  };
}

function renderSoustruhHeatGroupsBody(heatData) {
  if (!heatData || !Array.isArray(heatData.groups) || !heatData.groups.length) {
    return "<div class='smallText'>Zadej první kalírenskou dávku a spočítej hlavní část.</div>";
  }

  let body = "<div class='soustruhHeatResultBody'>";
  body += "<div class='statsSummary'>";
  body += "<div class='tile'><div class='smallText'>Našich dávek</div><div class='uFs22 uMt4'>" + formatCount(heatData.batchCount) + "</div></div>";
  body += "<div class='tile'><div class='smallText'>Kalírenských řádků</div><div class='uFs22 uMt4'>" + formatCount(heatData.heatCount) + "</div></div>";
  body += "<div class='tile'><div class='smallText'>Poslední do</div><div class='uFs22 uMt4'>" + formatCount(heatData.lastHeatGuide) + "</div></div>";
  body += "</div>";
  body += "<div class='smallText uMb10'>Zadáno od kalírenské dávky <b>" + formatCount(heatData.firstHeatGuide) + "</b>. Čtveřice se berou podle kalírny / jiného stroje, ale počítají se jen dávky vyrobené tady na soustruhu.</div>";
  if (heatData.fillCount > 0) {
    body += "<div class='smallText uMb10'>Plán na soustruhu končí průvodkou <b>" + formatCount(heatData.lastPlannedGuide) + "</b>. Aby poslední kalírenská čtveřice seděla po 4, doplnit ze soustruhu: <b>" + heatData.fillGuides.map(formatCount).join(", ") + "</b>.</div>";
  }
  body += "<div class='tableWrap'><table class='statsTable'><thead><tr><th>Kalírenská</th><th>Čtveřice</th><th>Naše</th><th>Doplnit</th></tr></thead><tbody>";
  heatData.groups.forEach(item => {
    const guideText = item.guides.map(guide => {
      if (guide.planned) return formatCount(guide.number);
      if (guide.fill) return formatCount(guide.number) + "*";
      return formatCount(guide.number) + "°";
    }).join(", ");
    const fillText = item.fillGuides && item.fillGuides.length ? item.fillGuides.map(formatCount).join(", ") : "—";
    body += "<tr><td>" + formatCount(item.number) + ".</td><td>" + guideText + "</td><td>" + formatCount(item.plannedInside) + "/4</td><td>" + fillText + "</td></tr>";
  });
  body += "</tbody></table></div>";
  body += "<div class='smallText uMt8'>° = patří do kalírenské čtveřice, ale není z tohohle výpočtu soustruhu. * = dopočítaný vozík, který se má ještě doplnit ze soustruhu, aby čtveřice měla 4 dávky.</div>";
  body += "</div>";
  return body;
}

function renderSoustruhHeatGroups(title, heatData) {
  if (!heatData || !Array.isArray(heatData.groups) || !heatData.groups.length) {
    return "";
  }
  return "<details class='soustruhHeatResultDetails calcDetails calcDetailsInner'>" +
    "<summary>" + escapeHtml(title) + "</summary>" + renderSoustruhHeatGroupsBody(heatData) + "</details>";
}

function renderSoustruhBatchListDetails(batches, summaryLabel) {
  const safeBatches = Array.isArray(batches) ? batches : [];
  if (!safeBatches.length) return "";
  const label = summaryLabel || ("Seznam dávek (" + formatCount(safeBatches.length) + ")");
  let html = "<details class='soustruhBatchListDetails calcDetails calcDetailsInner'>";
  html += "<summary>" + escapeHtml(label) + "</summary>";
  html += "<div class='soustruhBatchListBody'>";
  html += "<div class='tableWrap'><table class='statsTable'><thead><tr><th>Dávka</th><th>Ks</th><th>Součet</th></tr></thead><tbody>";
  safeBatches.forEach(item => {
    html += "<tr><td>" + formatCount(item.batchNo) + "</td><td>" + formatCount(item.size) + "</td><td>" + formatCount(item.produced) + "</td></tr>";
  });
  html += "</tbody></table></div></div></details>";
  return html;
}

function renderBatchResult(title, batches, target, firstBatch, heatData) {
  if (!batches.length) return "<div class='smallText'>Doplň vstupy, ať se to spočítá.</div>";
  const lastBatch = batches[batches.length - 1].batchNo;
  const total = batches[batches.length - 1].produced;
  let html = "<div class='smallText uMb10'>" + escapeHtml(title) + "</div>";
  html += "<div class='statsSummary'>";
  html += "<div class='tile'><div class='smallText'>Dávek</div><div class='uFs22 uMt4'>" + formatCount(batches.length) + "</div></div>";
  html += "<div class='tile'><div class='smallText'>Poslední dávka</div><div class='uFs22 uMt4'>" + formatCount(lastBatch) + "</div></div>";
  html += "<div class='tile'><div class='smallText'>Vyrobeno</div><div class='uFs22 uMt4'>" + formatCount(total) + "</div></div>";
  html += "</div>";
  html += renderSoustruhBatchListDetails(batches, "Seznam dávek (" + formatCount(batches.length) + ")");
  if (heatData) {
    html += renderSoustruhHeatGroups('Dopočítání kalírenské dávky po 4 dávkách', heatData);
  }
  return html;
}

function renderSoustruhyCombinationResult(firstPart, secondPart, comboMeta) {
  const firstBatches = Array.isArray(firstPart?.batches) ? firstPart.batches : [];
  const secondBatches = Array.isArray(secondPart?.batches) ? secondPart.batches : [];
  const firstCount = firstBatches.length;
  const secondCount = secondBatches.length;
  if (!firstCount && !secondCount) return "<div class='smallText'>Doplň kombinaci, ať se to spočítá.</div>";

  const firstTotal = firstCount ? firstBatches[firstCount - 1].produced : 0;
  const secondTotal = secondCount ? secondBatches[secondCount - 1].produced : 0;
  const firstLastText = firstCount ? formatCount(firstBatches[firstCount - 1].batchNo) : "—";
  const secondLastText = secondCount ? formatCount(secondBatches[secondCount - 1].batchNo) : "—";
  const firstLabel = firstPart?.label || "1. část";
  const secondLabel = secondPart?.label || "2. část";
  const totalPlan = Number(comboMeta?.totalPlan) || 0;
  const remainingPlan = Math.max(0, Number(comboMeta?.remainingPlan) || 0);
  const totalPieces = firstTotal + secondTotal;
  const totalBatches = firstCount + secondCount;
  const planLine = totalPlan > 0
    ? "Plán celkem: <b>" + formatCount(totalPlan) + " ks</b> · po 1. části zbývalo <b>" + formatCount(remainingPlan) + " ks</b> pro 2. část."
    : "Plán celkem není vyplněný.";

  let html = "<div class='soustruhComboResultPanel'>";
  html += "<div class='soustruhComboResultTitle'>Kombinace</div>";
  html += "<div class='soustruhComboResultLine'>" + planLine + "</div>";
  html += "<div class='soustruhComboResultLine'><b>1. část – " + escapeHtml(firstLabel) + ":</b> " + formatCount(firstCount) + " dávek / " + formatCount(firstTotal) + " ks · končí dávkou <b>" + firstLastText + "</b>.</div>";
  html += "<div class='soustruhComboResultLine'><b>2. část – " + escapeHtml(secondLabel) + ":</b> " + formatCount(secondCount) + " dávek / " + formatCount(secondTotal) + " ks · skončíš dávkou <b>" + secondLastText + "</b>.</div>";
  html += "<div class='soustruhComboResultTotal'><b>Celkem:</b> " + formatCount(totalBatches) + " dávek / " + formatCount(totalPieces) + " ks" + (totalPlan > 0 ? " · proti plánu " + formatCount(totalPlan) + " ks" : "") + ".</div>";
  html += "</div>";
  html += renderSoustruhBatchListDetails(firstBatches, "Seznam dávek – 1. část / " + firstLabel + " (" + formatCount(firstCount) + ")");
  html += renderSoustruhBatchListDetails(secondBatches, "Seznam dávek – 2. část / " + secondLabel + " (" + formatCount(secondCount) + ")");
  return html;
}

function setSoustruhMode(mode) {
  app.soustruhMode = mode;
  renderSoustruhy();
  saveRotationData();
}

function setSoustruh126Start(size) {
  app.soustruh126Start = Number(size) === 31 ? 31 : 32;
  renderSoustruhy();
  saveRotationData();
}

function setSoustruhComboFreeType(type) {
  app.soustruhComboFreeType = String(type) === "106" ? "106" : "126";
  renderSoustruhy();
  saveRotationData();
}

function setSoustruhComboFirstType(type) {
  app.soustruhComboFirstType = String(type) === "free" ? "free" : "lis";
  renderSoustruhy();
  saveRotationData();
}

function setSoustruhCombo126Start(size) {
  app.soustruhCombo126Start = Number(size) === 31 ? 31 : 32;
  renderSoustruhy();
  saveRotationData();
}

function renderSoustruhy() {
  const modeButtons = document.querySelectorAll('[data-soustruh-mode]');
  const panels = {
    lis: document.getElementById('soustruhyLisPanel'),
    "126": document.getElementById('soustruhy126Panel'),
    "106": document.getElementById('soustruhy106Panel'),
    combo: document.getElementById('soustruhyComboPanel')
  };

  const toggleClass = typeof toggleElementClassIfChanged === 'function'
    ? toggleElementClassIfChanged
    : ((el, className, force) => { if (el) el.classList.toggle(className, !!force); });

  modeButtons.forEach(btn => {
    const mode = btn.getAttribute('data-soustruh-mode');
    toggleClass(btn, 'activeChoice', app.soustruhMode === mode, 'soustruhMode:' + String(mode || 'unknown'));
  });

  Object.entries(panels).forEach(([mode, panel]) => {
    if (panel) toggleClass(panel, 'active', app.soustruhMode === mode, 'soustruhPanel:' + String(mode || 'unknown'));
  });

  const lisFirst = document.getElementById('lis_first');
  const lisPlan = document.getElementById('lis_plan');
  const v126First = document.getElementById('v126_first');
  const v126Plan = document.getElementById('v126_plan');
  const v126HeatFirst = document.getElementById('v126_heat_first');
  const v106First = document.getElementById('v106_first');
  const v106Plan = document.getElementById('v106_plan');
  const v106HeatFirst = document.getElementById('v106_heat_first');
  const v106C1 = document.getElementById('v106_c1');
  const v106C2 = document.getElementById('v106_c2');
  const v106C3 = document.getElementById('v106_c3');
  const v106C4 = document.getElementById('v106_c4');
  const comboSecondPlan = document.getElementById('combo_second_plan');
  const comboHeatFirst = document.getElementById('combo_heat_first');
  const combo106C1 = document.getElementById('combo106_c1');
  const combo106C2 = document.getElementById('combo106_c2');
  const combo106C3 = document.getElementById('combo106_c3');
  const combo106C4 = document.getElementById('combo106_c4');

  const defaultPlan = String(app.soustruhPlan || (typeof getSoustruhDefaultPlan === "function" ? getSoustruhDefaultPlan() : 1216));
  if (lisPlan && !lisPlan.value) lisPlan.value = defaultPlan;
  if (v126Plan && !v126Plan.value) v126Plan.value = defaultPlan;
  if (v126HeatFirst && !v126HeatFirst.value) v126HeatFirst.value = app.soustruh126HeatFirst || '';
  if (v106Plan && !v106Plan.value) v106Plan.value = defaultPlan;
  if (v106HeatFirst && !v106HeatFirst.value) v106HeatFirst.value = app.soustruh106HeatFirst || '';
  if (v106C1 && !v106C1.value) v106C1.value = app.soustruh106Counts[0] || '';
  if (v106C2 && !v106C2.value) v106C2.value = app.soustruh106Counts[1] || '';
  if (v106C3 && !v106C3.value) v106C3.value = app.soustruh106Counts[2] || '';
  if (v106C4 && !v106C4.value) v106C4.value = app.soustruh106Counts[3] || '';
  if (comboSecondPlan && !comboSecondPlan.value) comboSecondPlan.value = '';
  if (comboHeatFirst && !comboHeatFirst.value) comboHeatFirst.value = app.soustruhComboHeatFirst || '';
  if (combo106C1 && !combo106C1.value) combo106C1.value = app.soustruhCombo106Counts?.[0] || '';
  if (combo106C2 && !combo106C2.value) combo106C2.value = app.soustruhCombo106Counts?.[1] || '';
  if (combo106C3 && !combo106C3.value) combo106C3.value = app.soustruhCombo106Counts?.[2] || '';
  if (combo106C4 && !combo106C4.value) combo106C4.value = app.soustruhCombo106Counts?.[3] || '';

  const startButtons = document.querySelectorAll('[data-startsize]');
  startButtons.forEach(btn => {
    const size = Number(btn.getAttribute('data-startsize'));
    toggleClass(btn, 'activeChoice', app.soustruh126Start === size, 'soustruhStartSize:' + String(size || 'unknown'));
  });

  const comboFirstType = app.soustruhComboFirstType === "free" ? "free" : "lis";
  document.querySelectorAll('[data-combo-first]').forEach(btn => {
    const type = String(btn.getAttribute('data-combo-first') || 'lis');
    toggleClass(btn, 'activeChoice', comboFirstType === type, 'soustruhComboFirst:' + type);
  });

  const comboFreeSettingsDetails = document.getElementById('comboFreeSettingsDetails');
  if (comboFreeSettingsDetails && comboFirstType === "free") comboFreeSettingsDetails.open = true;

  const comboFreeType = app.soustruhComboFreeType === "106" ? "106" : "126";
  document.querySelectorAll('[data-combo-free]').forEach(btn => {
    const type = String(btn.getAttribute('data-combo-free') || '126');
    toggleClass(btn, 'activeChoice', comboFreeType === type, 'soustruhComboFree:' + type);
  });
  document.querySelectorAll('[data-combo-startsize]').forEach(btn => {
    const size = Number(btn.getAttribute('data-combo-startsize'));
    toggleClass(btn, 'activeChoice', (app.soustruhCombo126Start || 32) === size, 'soustruhComboStart:' + String(size || 'unknown'));
  });
  const combo126Options = document.getElementById('combo126Options');
  const combo106Options = document.getElementById('combo106Options');
  if (combo126Options) toggleClass(combo126Options, 'is-hidden', comboFreeType !== "126", 'combo126Options');
  if (combo106Options) toggleClass(combo106Options, 'is-hidden', comboFreeType !== "106", 'combo106Options');
}

function calcSoustruhyLis() {
  const first = parseInt(document.getElementById('lis_first').value, 10);
  const plan = parseInt(document.getElementById('lis_plan').value, 10);
  const out = document.getElementById('soustruhyLisResult');
  if (!Number.isFinite(first) || !Number.isFinite(plan) || plan <= 0) {
    setCalcOutputHtml(out, "<div class='smallText'>Doplň první dávku a plán.</div>", out.id || "soustruhEmpty");
    return;
  }
  app.soustruhPlan = String(plan);
  const batches = getSoustruhBatchList(first, [32], plan);
  setCalcOutputHtml(out, renderBatchResult('Lis', batches, plan, first), 'soustruhyLisResult');
  saveRotationData();
}

function calcSoustruhy126() {
  const first = parseInt(document.getElementById('v126_first').value, 10);
  const plan = parseInt(document.getElementById('v126_plan').value, 10);
  const out = document.getElementById('soustruhy126Result');
  const heatOut = document.getElementById('soustruhy126HeatResult');
  if (!Number.isFinite(first) || !Number.isFinite(plan) || plan <= 0) {
    setCalcOutputHtml(out, "<div class='smallText'>Doplň první dávku a plán.</div>", out.id || "soustruhEmpty");
    if (heatOut) setCalcOutputHtml(heatOut, "", heatOut.id || "soustruh126HeatEmpty");
    return;
  }
  app.soustruhPlan = String(plan);
  const heatFirst = parseInt(document.getElementById('v126_heat_first')?.value || '', 10);
  app.soustruh126HeatFirst = Number.isFinite(heatFirst) ? String(heatFirst) : '';
  const startSize = app.soustruh126Start === 31 ? 31 : 32;
  const sizes = startSize === 32 ? [32, 31] : [31, 32];
  const batches = getSoustruhBatchList(first, sizes, plan);
  setCalcOutputHtml(out, renderBatchResult('Volné 126 ks', batches, plan, first), 'soustruhy126Result');
  if (heatOut) {
    const heatData = Number.isFinite(heatFirst) ? getSoustruhHeatGroupsFromBatches(heatFirst, batches) : null;
    setCalcOutputHtml(heatOut, Number.isFinite(heatFirst) ? renderSoustruhHeatGroupsBody(heatData) : "<div class='smallText'>Zadej první kalírenskou dávku a klikni na Přepočítat kalírnu.</div>", heatOut.id || 'soustruhy126HeatResult');
  }
  saveRotationData();
}

function calcSoustruhy126Heat() {
  calcSoustruhy126();
}

function calcSoustruhy106() {
  const first = parseInt(document.getElementById('v106_first').value, 10);
  const plan = parseInt(document.getElementById('v106_plan').value, 10);
  const counts = [
    parseInt(document.getElementById('v106_c1').value, 10),
    parseInt(document.getElementById('v106_c2').value, 10),
    parseInt(document.getElementById('v106_c3').value, 10),
    parseInt(document.getElementById('v106_c4').value, 10)
  ];
  const out = document.getElementById('soustruhy106Result');
  const heatOut = document.getElementById('soustruhy106HeatResult');
  if (!Number.isFinite(first) || !Number.isFinite(plan) || plan <= 0 || counts.some(v => !Number.isFinite(v) || v <= 0)) {
    setCalcOutputHtml(out, "<div class='smallText'>Doplň první dávku, plán a první čtyři dávky.</div>", out.id || "soustruh106Empty");
    if (heatOut) setCalcOutputHtml(heatOut, "", heatOut.id || "soustruh106HeatEmpty");
    return;
  }
  app.soustruhPlan = String(plan);
  const heatFirst = parseInt(document.getElementById('v106_heat_first')?.value || '', 10);
  app.soustruh106HeatFirst = Number.isFinite(heatFirst) ? String(heatFirst) : '';
  app.soustruh106Counts = counts.map(v => String(v));
  const batches = getSoustruhBatchList(first, counts, plan);
  setCalcOutputHtml(out, renderBatchResult('Volné 106 ks', batches, plan, first), 'soustruhy106Result');
  if (heatOut) {
    const heatData = Number.isFinite(heatFirst) ? getSoustruhHeatGroupsFromBatches(heatFirst, batches) : null;
    setCalcOutputHtml(heatOut, Number.isFinite(heatFirst) ? renderSoustruhHeatGroupsBody(heatData) : "<div class='smallText'>Zadej první kalírenskou dávku a klikni na Přepočítat kalírnu.</div>", heatOut.id || 'soustruhy106HeatResult');
  }
  saveRotationData();
}

function calcSoustruhy106Heat() {
  calcSoustruhy106();
}

function getSoustruhyComboFreeConfig() {
  const type = app.soustruhComboFreeType === "106" ? "106" : "126";
  if (type === "106") {
    const counts = [
      parseInt(document.getElementById('combo106_c1')?.value || '', 10),
      parseInt(document.getElementById('combo106_c2')?.value || '', 10),
      parseInt(document.getElementById('combo106_c3')?.value || '', 10),
      parseInt(document.getElementById('combo106_c4')?.value || '', 10)
    ];
    if (counts.some(v => !Number.isFinite(v) || v <= 0)) {
      return { type, label: 'Volné 106 ks', sizes: [], error: 'U Volné 106 doplň počet kusů v prvních čtyřech dávkách.' };
    }
    app.soustruhCombo106Counts = counts.map(v => String(v));
    return { type, label: 'Volné 106 ks', sizes: counts, error: '' };
  }
  const startSize = app.soustruhCombo126Start === 31 ? 31 : 32;
  return { type, label: 'Volné 126 ks', sizes: startSize === 32 ? [32, 31] : [31, 32], error: '' };
}

function calcSoustruhyCombo() {
  const firstStart = parseInt(document.getElementById('combo_first_start')?.value || '', 10);
  const firstEnd = parseInt(document.getElementById('combo_first_end')?.value || '', 10);
  const secondStart = parseInt(document.getElementById('combo_second_start')?.value || '', 10);
  const totalPlan = parseInt(document.getElementById('combo_second_plan')?.value || '', 10);
  const heatFirst = parseInt(document.getElementById('combo_heat_first')?.value || '', 10);
  const out = document.getElementById('soustruhyComboResult');
  const heatOut = document.getElementById('soustruhyComboHeatResult');
  const firstType = app.soustruhComboFirstType === "free" ? "free" : "lis";
  const secondType = firstType === "free" ? "lis" : "free";
  const hasAny = Number.isFinite(firstStart) || Number.isFinite(firstEnd) || Number.isFinite(secondStart) || Number.isFinite(totalPlan);

  if (!hasAny) {
    setCalcOutputHtml(out, "<div class='smallText'>Doplň první a poslední dávku 1. části, první dávku 2. části a celkový plán.</div>", out?.id || 'soustruhyComboEmpty');
    if (heatOut) setCalcOutputHtml(heatOut, "", heatOut.id || 'soustruhyComboHeatEmpty');
    return;
  }
  if (!Number.isFinite(firstStart) || !Number.isFinite(firstEnd) || firstEnd < firstStart || !Number.isFinite(secondStart) || !Number.isFinite(totalPlan) || totalPlan <= 0) {
    setCalcOutputHtml(out, "<div class='smallText'>Doplň platně: první + poslední dávku 1. části, první dávku 2. části a celkový plán pro Lis + Volné.</div>", out?.id || 'soustruhyComboInvalid');
    if (heatOut) setCalcOutputHtml(heatOut, "", heatOut.id || 'soustruhyComboHeatInvalid');
    return;
  }

  const freeCfg = getSoustruhyComboFreeConfig();
  if (freeCfg.error) {
    setCalcOutputHtml(out, "<div class='smallText'>" + escapeHtml(freeCfg.error) + "</div>", out?.id || 'soustruhyComboFreeInvalid');
    if (heatOut) setCalcOutputHtml(heatOut, "", heatOut.id || 'soustruhyComboHeatInvalid');
    return;
  }

  const firstLabel = firstType === "free" ? freeCfg.label : "Lis";
  const secondLabel = secondType === "free" ? freeCfg.label : "Lis";
  const firstSizes = firstType === "free" ? freeCfg.sizes : [32];
  const secondSizes = secondType === "free" ? freeCfg.sizes : [32];
  const firstBatches = getSoustruhBatchRange(firstStart, firstEnd, firstSizes);

  if (!firstBatches.length) {
    setCalcOutputHtml(out, "<div class='smallText'>Rozsah 1. části nevychází na žádnou dávku. Zkontroluj první a poslední dávku.</div>", out?.id || 'soustruhyComboNoFirstBatches');
    if (heatOut) setCalcOutputHtml(heatOut, "", heatOut.id || 'soustruhyComboHeatInvalid');
    return;
  }

  const firstTotal = firstBatches[firstBatches.length - 1].produced;
  const remainingPlan = Math.max(0, totalPlan - firstTotal);
  if (remainingPlan <= 0) {
    setCalcOutputHtml(out, "<div class='smallText'>Celkový plán už pokrývá 1. část. Zadej větší plán, aby bylo co dopočítat pro 2. část.</div>", out?.id || 'soustruhyComboPlanCovered');
    if (heatOut) setCalcOutputHtml(heatOut, "", heatOut.id || 'soustruhyComboHeatInvalid');
    return;
  }

  const secondBatches = getSoustruhBatchList(secondStart, secondSizes, remainingPlan);
  if (!secondBatches.length) {
    setCalcOutputHtml(out, "<div class='smallText'>2. část nevychází na žádnou dávku. Zkontroluj číslo první dávky 2. části a nastavení Volné.</div>", out?.id || 'soustruhyComboNoSecondBatches');
    if (heatOut) setCalcOutputHtml(heatOut, "", heatOut.id || 'soustruhyComboHeatInvalid');
    return;
  }

  const firstPart = { label: firstLabel, batches: firstBatches, type: firstType };
  const secondPart = { label: secondLabel, batches: secondBatches, type: secondType };
  setCalcOutputHtml(out, renderSoustruhyCombinationResult(firstPart, secondPart, { totalPlan, remainingPlan }), out?.id || 'soustruhyComboResult');

  app.soustruhComboHeatFirst = Number.isFinite(heatFirst) ? String(heatFirst) : '';
  const freeBatches = firstType === "free" ? firstBatches : secondBatches;
  if (heatOut) {
    const heatData = Number.isFinite(heatFirst) ? getSoustruhHeatGroupsFromBatches(heatFirst, freeBatches) : null;
    setCalcOutputHtml(heatOut, Number.isFinite(heatFirst) ? renderSoustruhHeatGroupsBody(heatData) : "<div class='smallText'>Zadej první kalírenskou dávku a klikni na Přepočítat kalírnu.</div>", heatOut.id || 'soustruhyComboHeatResult');
  }
  saveRotationData();
}
function calcSoustruhyComboHeat() {
  calcSoustruhyCombo();
}
function readCalcDecimal(id) {
  const el = document.getElementById(id);
  if (!el) return NaN;
  const raw = String(el.value || '').trim().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(',', '.');
  if (!raw || raw === '-' || raw === '+') return NaN;
  const value = Number(raw);
  return Number.isFinite(value) ? value : NaN;
}

function formatCalcDecimal(value, digits) {
  if (!Number.isFinite(value)) return '—';
  const places = typeof digits === 'number' ? digits : 3;
  return value.toLocaleString('cs-CZ', { maximumFractionDigits: places, minimumFractionDigits: Math.min(places, 0) });
}

function formatCalcDecimalWhole(value) {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('cs-CZ', { maximumFractionDigits: 0, minimumFractionDigits: 0 });
}



const LATHE_AXIS_CORRECTION_MACHINES = {
  mskc010304: {
    label: 'MSKC01, 03, 04',
    leftSign: 1,
    axisText: 'doleva +, doprava −'
  },
  mskc02: {
    label: 'MSKC02',
    leftSign: -1,
    axisText: 'doleva −, doprava +'
  }
};

function getLatheAxisCorrectionMachine(key) {
  const safeKey = String(key || '').trim() || 'mskc010304';
  return LATHE_AXIS_CORRECTION_MACHINES[safeKey] || LATHE_AXIS_CORRECTION_MACHINES.mskc010304;
}

function getSelectedLatheAxisCorrectionMachineKey() {
  const input = document.getElementById('lathe_axis_machine');
  const key = String(input && input.value ? input.value : '').trim();
  return key || 'mskc010304';
}

function updateLatheAxisSignToggleForInput(inputOrId) {
  const input = typeof inputOrId === 'string' ? document.getElementById(inputOrId) : inputOrId;
  if (!input || !input.id) return;
  const raw = String(input.value || '').trim().replace(/[−–—]/g, '-');
  const isNegative = raw.indexOf('-') === 0;
  const btn = document.querySelector('[data-action="toggle-lathe-axis-sign"][data-target-input="' + input.id + '"]');
  if (!btn) return;
  btn.textContent = isNegative ? '−' : '+';
  btn.classList.toggle('isNegative', isNegative);
  btn.setAttribute('aria-pressed', isNegative ? 'true' : 'false');
}

function resetLatheAxisSignButtons() {
  ['lathe_axis_drill3', 'lathe_axis_drill7'].forEach(updateLatheAxisSignToggleForInput);
}

function toggleLatheAxisInputSign(button) {
  if (!button) return;
  const id = String((button.dataset && button.dataset.targetInput) || '').trim();
  const input = id ? document.getElementById(id) : null;
  if (!input) return;
  let raw = String(input.value || '').trim().replace(/[−–—]/g, '-');
  if (raw.indexOf('-') === 0) {
    raw = raw.replace(/^-+/, '');
  } else if (raw.indexOf('+') === 0) {
    raw = '-' + raw.slice(1);
  } else {
    raw = raw ? '-' + raw : '-';
  }
  input.value = raw;
  updateLatheAxisSignToggleForInput(input);
  try {
    input.focus({ preventScroll: true });
    const pos = String(input.value || '').length;
    if (typeof input.setSelectionRange === 'function') input.setSelectionRange(pos, pos);
  } catch (err) {}
  const result = document.getElementById('latheAxisCorrectionResult');
  if (result && String(result.innerHTML || '').trim()) calcLatheAxisCorrection({ keepEmpty: true });
}

function formatLatheAxisCorrectionValue(value, options) {
  if (!Number.isFinite(value)) return '—';
  const opts = options || {};
  const sign = value > 0 ? '+' : (value < 0 ? '−' : '');
  const abs = Math.abs(value);
  const text = abs.toLocaleString('cs-CZ', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  return opts.withSign === false ? text : sign + text;
}

function renderLatheAxisCorrectionInfo(key) {
  const info = document.getElementById('latheAxisCorrectionInfo');
  if (!info) return;
  const cfg = getLatheAxisCorrectionMachine(key);
  info.innerHTML = '<b>' + escapeHtml(cfg.label) + '</b>' +
    '<div class="smallText">Osa X: ' + escapeHtml(cfg.axisText) + '. Vrtáky 3 a 7 jde hýbat jen společně doleva/doprava. Výsledný posun se při zadání do X násobí ×2.</div>';
}

function setLatheAxisCorrectionMachine(button) {
  if (!button) return;
  const key = String((button.dataset && button.dataset.latheAxisMachine) || '').trim() || 'mskc010304';
  const page = document.getElementById('korekce-soustruhy');
  const input = document.getElementById('lathe_axis_machine');
  if (input) input.value = key;
  if (page) {
    page.querySelectorAll('.calcCorrectionLatheMachineBtn').forEach((btn) => {
      const active = String(btn.dataset.latheAxisMachine || '') === key;
      btn.classList.toggle('activeChoice', active);
      btn.classList.toggle('isActive', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  renderLatheAxisCorrectionInfo(key);
  const result = document.getElementById('latheAxisCorrectionResult');
  if (result && String(result.innerHTML || '').trim()) calcLatheAxisCorrection({ keepEmpty: true });
}

function getLatheAxisDrillPhysicalOffsets(drill3Value, drill7Value) {
  return {
    drill3Right: -drill3Value,
    drill7Right: drill7Value
  };
}

function calcLatheAxisCorrection(options) {
  const opts = options || {};
  const out = document.getElementById('latheAxisCorrectionResult');
  const key = getSelectedLatheAxisCorrectionMachineKey();
  const cfg = getLatheAxisCorrectionMachine(key);
  renderLatheAxisCorrectionInfo(key);
  updateLatheAxisSignToggleForInput('lathe_axis_drill3');
  updateLatheAxisSignToggleForInput('lathe_axis_drill7');
  const drill3 = readCalcDecimal('lathe_axis_drill3');
  const drill7 = readCalcDecimal('lathe_axis_drill7');
  if (!out) return;
  if (!Number.isFinite(drill3) || !Number.isFinite(drill7)) {
    if (opts.keepEmpty) return;
    setCalcOutputHtml(out, "<div class='smallText'>Zadej hodnotu pro vrták 3 i vrták 7. Znaménko můžeš přepnout tlačítkem +/− u pole.</div>", out.id || 'latheAxisCorrectionEmpty');
    return;
  }

  const offsets = getLatheAxisDrillPhysicalOffsets(drill3, drill7);
  const averageRight = (offsets.drill3Right + offsets.drill7Right) / 2;
  const correction = averageRight * 2 * cfg.leftSign;
  const moveText = Math.abs(averageRight) < 0.0005 ? 'bez výrazného posunu' : (averageRight > 0 ? 'doleva' : 'doprava');
  const halfCorrection = averageRight * cfg.leftSign;
  const moveDistance = Math.abs(averageRight);
  const expectedDrill3Right = offsets.drill3Right - averageRight;
  const expectedDrill7Right = offsets.drill7Right - averageRight;
  const expectedDrill3 = -expectedDrill3Right;
  const expectedDrill7 = expectedDrill7Right;
  const spread = Math.abs(offsets.drill7Right - offsets.drill3Right);

  const main = Math.abs(correction) < 0.0005
    ? 'Korekce X: 0,000'
    : 'Zadej korekci X: <b>' + escapeHtml(formatLatheAxisCorrectionValue(correction)) + '</b>';
  const html = "<div class='calcResultTitle'>" + escapeHtml(cfg.label) + " · Poloha vrtáků v ose X</div>" +
    "<div class='calcResultMain'>" + main + "</div>" +
    "<div class='calcResultLine'>Hýbej: <b>" + escapeHtml(moveText) + "</b> " + (moveDistance > 0.0005 ? "o " + escapeHtml(formatLatheAxisCorrectionValue(moveDistance, { withSign: false })) + " mm" : "") + "</div>" +
    "<div class='calcResultLine'>Posun před násobením: " + escapeHtml(formatLatheAxisCorrectionValue(halfCorrection)) + " · do X zadat ×2 = " + escapeHtml(formatLatheAxisCorrectionValue(correction)) + "</div>" +
    "<div class='calcResultLine'>Přepočet: vrták 3 " + escapeHtml(formatLatheAxisCorrectionValue(drill3)) + " · vrták 7 " + escapeHtml(formatLatheAxisCorrectionValue(drill7)) + "</div>" +
    "<div class='calcResultLine'>Očekávaně po korekci: vrták 3 " + escapeHtml(formatLatheAxisCorrectionValue(expectedDrill3)) + " · vrták 7 " + escapeHtml(formatLatheAxisCorrectionValue(expectedDrill7)) + "</div>" +
    "<div class='calcResultSub'>Vrták 3 je vlevo: + znamená dál od středu doleva, − blíž ke středu doprava. Vrták 7 je vpravo: + znamená dál od středu doprava, − blíž ke středu doleva. Rozdíl mezi vrtáky je " + escapeHtml(formatLatheAxisCorrectionValue(spread, { withSign: false })) + " mm; tato korekce řeší jen společný posun obou vrtáků.</div>";
  setCalcOutputHtml(out, html, out.id || 'latheAxisCorrectionResult');
}

const FHB_TARGET_PRESET_DEFAULTS = [
  { key: 'afag-lis', label: 'AF/AG lis', left: 50, right: 70 },
  { key: 'ah-lis', label: 'AH lis', left: 20, right: 80 },
  { key: 'afag-volne', label: 'AF/AG volné', left: -5, right: 10 },
  { key: 'ah-volne', label: 'AH volné', left: 10, right: 25 }
];

function normalizeFhbTargetKey(key) {
  return String(key || '').trim().toLowerCase();
}

function getDefaultFhbTargetPresets() {
  return FHB_TARGET_PRESET_DEFAULTS.map(item => Object.assign({}, item));
}

function findFhbTargetSetting(key) {
  const targetKey = normalizeFhbTargetKey(key);
  if (!targetKey) return null;
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  return rows.find(row => {
    const settings = parseBrusSettingsJson(row);
    const category = String(row && row.category ? row.category : '').trim().toLowerCase();
    const machineCode = String(row && (row.machine_code || row.machine) ? (row.machine_code || row.machine) : (settings.machine || '')).trim().toUpperCase();
    const rowKey = normalizeFhbTargetKey(settings.key || row.machine_index || row.index || String(row.machine_key || '').replace(/^FHB_TARGET[_-]/i, ''));
    return (category === 'fhb_target' || machineCode === 'FHB') && rowKey === targetKey;
  }) || null;
}

function getFhbTargetPreset(key, fallback) {
  const targetKey = normalizeFhbTargetKey(key);
  const defaults = getDefaultFhbTargetPresets();
  const base = defaults.find(item => item.key === targetKey) || fallback || { key: targetKey, label: key || '', left: NaN, right: NaN };
  const row = findFhbTargetSetting(targetKey);
  const settings = parseBrusSettingsJson(row);
  const left = firstFilledNumber(
    settings.target_left,
    settings.left,
    row && row.target_left,
    base.left
  );
  const right = firstFilledNumber(
    settings.target_right,
    settings.right,
    row && row.target_right,
    base.right
  );
  return {
    key: targetKey || base.key,
    label: String(settings.label || (row && row.label) || base.label || key || '').trim(),
    left,
    right
  };
}

function getAllFhbTargetPresets() {
  return getDefaultFhbTargetPresets().map(item => getFhbTargetPreset(item.key, item));
}


function getFhbShortLabelHtml(preset, button) {
  const key = String((button && button.dataset && button.dataset.fhbKey) || (preset && preset.key) || '').trim().toLowerCase();
  const label = String((preset && preset.label) || (button && button.dataset ? button.dataset.fhbLabel : '') || '').trim().toLowerCase();
  const isVolne = key.indexOf('volne') >= 0 || label.indexOf('voln') >= 0;
  const free = isVolne ? '<span class="fhbIndexFree">volné</span>' : '';
  if (key.indexOf('afag') >= 0 || label.indexOf('af/ag') >= 0) {
    return '<span class="fhbIndexAf">AF</span><span class="fhbIndexSep">/</span><span class="fhbIndexAg">AG</span>' + free;
  }
  if (key.indexOf('ah') >= 0 || /ah/.test(label)) {
    return '<span class="fhbIndexAh">AH</span>' + free;
  }
  return escapeHtml(String((preset && preset.label) || (button && button.dataset ? button.dataset.fhbLabel : '') || key || 'Index'));
}

function renderFhbPresetButtonTitle(button, preset) {
  if (!button) return;
  let title = button.querySelector(':scope > b.calcFhbPresetTitle');
  if (!title) {
    title = button.querySelector(':scope > b') || document.createElement('b');
    title.classList.add('calcFhbPresetTitle');
    button.prepend(title);
  }
  title.innerHTML = getFhbShortLabelHtml(preset, button);
}

function updateFhbPresetButtons() {
  document.querySelectorAll('.calcFhbPresetBtn').forEach((button) => {
    const key = String(button.dataset.fhbKey || '').trim();
    const preset = getFhbTargetPreset(key, {
      key,
      label: String(button.dataset.fhbLabel || key || ''),
      left: Number(String(button.dataset.fhbLeft || '').replace(',', '.')),
      right: Number(String(button.dataset.fhbRight || '').replace(',', '.'))
    });
    if (!preset || !Number.isFinite(preset.left) || !Number.isFinite(preset.right)) return;
    button.dataset.fhbLabel = preset.label;
    button.dataset.fhbLeft = String(preset.left);
    button.dataset.fhbRight = String(preset.right);
    renderFhbPresetButtonTitle(button, preset);
    let valueSpan = button.querySelector(':scope > .calcFhbPresetValue');
    if (!valueSpan) {
      valueSpan = document.createElement('span');
      valueSpan.className = 'calcFhbPresetValue';
      button.appendChild(valueSpan);
    }
    valueSpan.textContent = 'L ' + formatCalcDecimalWhole(preset.left) + ' / P ' + formatCalcDecimalWhole(preset.right);
  });
}

function refreshFhbSettingsUi(options) {
  const opts = options || {};
  updateFhbPresetButtons();
  const keyInput = document.getElementById('fhb_target_key');
  const key = String(keyInput && keyInput.value ? keyInput.value : '').trim();
  if (!key) return;
  const btn = Array.from(document.querySelectorAll('.calcFhbPresetBtn')).find((item) => String(item.dataset.fhbKey || '') === key) || null;
  const preset = getFhbTargetPreset(key, btn ? {
    key,
    label: String(btn.dataset.fhbLabel || key || ''),
    left: Number(String(btn.dataset.fhbLeft || '').replace(',', '.')),
    right: Number(String(btn.dataset.fhbRight || '').replace(',', '.'))
  } : { key, label: key, left: NaN, right: NaN });

  if (!preset || !Number.isFinite(preset.left) || !Number.isFinite(preset.right)) return;

  const leftInput = document.getElementById('fhb_target_left');
  const rightInput = document.getElementById('fhb_target_right');
  if (leftInput) leftInput.value = String(preset.left);
  if (rightInput) rightInput.value = String(preset.right);

  document.querySelectorAll('.calcFhbPresetBtn').forEach((item) => {
    const active = String(item.dataset.fhbKey || '') === key;
    item.classList.toggle('activeChoice', active);
    item.classList.toggle('activeFhbPreset', active);
    item.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const out = document.getElementById('fhbResult');
  const hasMeasuredPair = (Number.isFinite(readCalcDecimal('fhb_c1_left')) && Number.isFinite(readCalcDecimal('fhb_c1_right')))
    || (Number.isFinite(readCalcDecimal('fhb_c2_left')) && Number.isFinite(readCalcDecimal('fhb_c2_right')));
  if (opts.recalculate && hasMeasuredPair && out && String(out.textContent || '').trim()) {
    calcFrezkyFhbCorrection();
    return;
  }
  if (out && /Vybráno:/i.test(String(out.textContent || ''))) {
    setCalcOutputHtml(out, "<div class='calcResultMain'>Vybráno: <b>" + escapeHtml(preset.label || key) + "</b></div>", 'fhbPresetRefresh:' + key + ':' + preset.left + ':' + preset.right);
  }
}

function setFhbTargetPreset(button) {
  if (!button) return;
  updateFhbPresetButtons();
  const key = String(button.dataset.fhbKey || '').trim();
  const preset = getFhbTargetPreset(key, {
    key,
    label: String(button.dataset.fhbLabel || key || ''),
    left: Number(String(button.dataset.fhbLeft || '').replace(',', '.')),
    right: Number(String(button.dataset.fhbRight || '').replace(',', '.'))
  });
  const label = String(preset && preset.label ? preset.label : button.dataset.fhbLabel || '').trim();
  renderFhbPresetButtonTitle(button, preset);
  const left = Number(preset && preset.left);
  const right = Number(preset && preset.right);
  if (!key || !Number.isFinite(left) || !Number.isFinite(right)) return;

  const keyInput = document.getElementById('fhb_target_key');
  const leftInput = document.getElementById('fhb_target_left');
  const rightInput = document.getElementById('fhb_target_right');
  if (keyInput) keyInput.value = key;
  if (leftInput) leftInput.value = String(left);
  if (rightInput) rightInput.value = String(right);

  document.querySelectorAll('.calcFhbPresetBtn').forEach((btn) => {
    const active = btn === button;
    btn.classList.toggle('activeChoice', active);
    btn.classList.toggle('activeFhbPreset', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const out = document.getElementById('fhbResult');
  if (out) {
    setCalcOutputHtml(out, "<div class='calcResultMain'>Vybráno: <b>" + escapeHtml(label || key) + "</b></div>", 'fhbPreset:' + key);
  }
}

function getFhbTargetLabel() {
  const key = String(document.getElementById('fhb_target_key')?.value || '').trim();
  const btn = key ? Array.from(document.querySelectorAll('.calcFhbPresetBtn')).find((item) => String(item.dataset.fhbKey || '') === key) : null;
  return String(btn && btn.dataset ? (btn.dataset.fhbLabel || key) : (key || '')).trim();
}

function calcFrezkyFhbCorrection() {
  const out = document.getElementById('fhbResult');
  if (!out) return;

  const targetLeft = readCalcDecimal('fhb_target_left');
  const targetRight = readCalcDecimal('fhb_target_right');
  const targetLabel = getFhbTargetLabel();
  const c1Left = readCalcDecimal('fhb_c1_left');
  const c1Right = readCalcDecimal('fhb_c1_right');
  const c2Left = readCalcDecimal('fhb_c2_left');
  const c2Right = readCalcDecimal('fhb_c2_right');
  const currentTaperCorr = readFhbCorrectionInput('fhb_current_taper_corr');
  const currentShiftCorr = readFhbCorrectionInput('fhb_current_shift_corr');

  if (!Number.isFinite(targetLeft) || !Number.isFinite(targetRight)) {
    setCalcOutputHtml(out, "<div class='smallText'>Vyber index nahoře.</div>", 'fhbMissingTargetPreset');
    return;
  }

  const tolerance = 10;
  const targetCenter = (targetLeft + targetRight) / 2;
  const targetSpread = targetRight - targetLeft;
  const pairs = [
    { id: 'C1', left: c1Left, right: c1Right },
    { id: 'C2', left: c2Left, right: c2Right }
  ].filter((pair) => Number.isFinite(pair.left) && Number.isFinite(pair.right));

  if (!pairs.length) {
    setCalcOutputHtml(out, "<div class='smallText'>Doplň aspoň jedno celé kolo: levá i pravá strana u C1 nebo C2.</div>", 'fhbMissingMeasuredPair');
    return;
  }

  const centerDeadband = 1.0;
  const spreadDeadband = 1.0;
  const downSensitivityPer001 = 1.8;
  const upSensitivityPer001 = 1.45;
  const shiftSensitivityPer001 = 1.6;
  const checkedPairs = pairs.map((pair) => {
    const leftDiff = pair.left - targetLeft;
    const rightDiff = pair.right - targetRight;
    const measuredCenter = (pair.left + pair.right) / 2;
    const measuredSpread = pair.right - pair.left;
    const centerError = measuredCenter - targetCenter;
    const spreadError = measuredSpread - targetSpread;
    return {
      ...pair,
      leftDiff,
      rightDiff,
      measuredCenter,
      measuredSpread,
      centerError,
      spreadError,
      leftOk: Math.abs(leftDiff) <= tolerance,
      rightOk: Math.abs(rightDiff) <= tolerance,
      severity: Math.max(Math.abs(centerError), Math.abs(spreadError))
    };
  });

  const maxCenterError = checkedPairs.slice().sort((a, b) => Math.abs(b.centerError) - Math.abs(a.centerError))[0];
  const maxSpreadError = checkedPairs.slice().sort((a, b) => Math.abs(b.spreadError) - Math.abs(a.spreadError))[0];
  const centerScore = Math.abs(maxCenterError.centerError);
  const spreadScore = Math.abs(maxSpreadError.spreadError);
  const needsShift = centerScore > centerDeadband;
  const needsTaper = spreadScore > spreadDeadband;

  const taperSensitivityPer001 = maxSpreadError.spreadError > spreadDeadband ? downSensitivityPer001 : upSensitivityPer001;
  const taperSafeFactor = maxSpreadError.spreadError > spreadDeadband ? 0.45 : 1.0;
  const taperDelta = needsTaper ? (-(maxSpreadError.spreadError / taperSensitivityPer001) * 0.001 * taperSafeFactor) : 0;
  const shiftSafeFactor = 0.75;
  const shiftDelta = needsShift ? (-(maxCenterError.centerError / shiftSensitivityPer001) * 0.001 * shiftSafeFactor) : 0;

  const taperMove = taperSensitivityPer001 * (taperDelta / 0.001);
  const shiftMove = shiftSensitivityPer001 * (shiftDelta / 0.001);

  function buildExpected(shiftMoveValue, taperMoveValue) {
    return checkedPairs.map((pair) => {
      const expectedLeft = pair.left + shiftMoveValue - (taperMoveValue / 2);
      const expectedRight = pair.right + shiftMoveValue + (taperMoveValue / 2);
      const leftError = expectedLeft - targetLeft;
      const rightError = expectedRight - targetRight;
      const centerError = ((expectedLeft + expectedRight) / 2) - targetCenter;
      const spreadError = (expectedRight - expectedLeft) - targetSpread;
      return {
        id: pair.id,
        left: expectedLeft,
        right: expectedRight,
        leftError,
        rightError,
        centerError,
        spreadError,
        leftOk: Math.abs(leftError) <= tolerance,
        rightOk: Math.abs(rightError) <= tolerance
      };
    });
  }

  function scoreExpected(expected) {
    let maxAbs = 0;
    let sumAbs = 0;
    let outCount = 0;
    let maxCenter = 0;
    let maxSpread = 0;
    expected.forEach((item) => {
      const absLeft = Math.abs(item.leftError);
      const absRight = Math.abs(item.rightError);
      maxAbs = Math.max(maxAbs, absLeft, absRight);
      sumAbs += absLeft + absRight;
      if (absLeft > tolerance) outCount += 1;
      if (absRight > tolerance) outCount += 1;
      maxCenter = Math.max(maxCenter, Math.abs(item.centerError));
      maxSpread = Math.max(maxSpread, Math.abs(item.spreadError));
    });
    const avgAbs = sumAbs / Math.max(1, expected.length * 2);
    return {
      maxAbs,
      sumAbs,
      avgAbs,
      outCount,
      maxCenter,
      maxSpread,
      score: (maxAbs * 2) + (avgAbs * 0.5) + (outCount * 8) + (maxCenter * 0.25) + (maxSpread * 0.25)
    };
  }

  function makeCandidate(type, useTaper, useShift) {
    const expected = buildExpected(useShift ? shiftMove : 0, useTaper ? taperMove : 0);
    const metrics = scoreExpected(expected);
    const taperValue = useTaper && Number.isFinite(currentTaperCorr) ? currentTaperCorr + taperDelta : NaN;
    const shiftValue = useShift && Number.isFinite(currentShiftCorr) ? currentShiftCorr + shiftDelta : NaN;
    return { type, useTaper, useShift, expected, metrics, taperValue, shiftValue };
  }

  const base = makeCandidate('bez zásahu', false, false);
  const candidates = [];
  if (needsTaper) candidates.push(makeCandidate('konicita', true, false));
  if (needsShift) candidates.push(makeCandidate('fhβ', false, true));
  const singleCandidates = candidates.slice().sort((a, b) => a.metrics.score - b.metrics.score);
  const bestSingle = singleCandidates[0] || null;
  const both = (needsTaper && needsShift) ? makeCandidate('konicita + fhβ', true, true) : null;

  let selected = bestSingle || base;
  if (both && bestSingle) {
    const singleGoodEnough = bestSingle.metrics.outCount === 0 || bestSingle.metrics.maxAbs <= tolerance;
    const bothMuchBetter = (bestSingle.metrics.score - both.metrics.score) >= Math.max(8, bestSingle.metrics.score * 0.25);
    selected = (!singleGoodEnough && bothMuchBetter) ? both : bestSingle;
  }
  if (!needsTaper && !needsShift) selected = base;

  const targetLine = targetLabel
    ? "<div class='calcResultLine calcResultPresetLine'>" + escapeHtml(targetLabel) + " · L " + formatCalcDecimalWhole(targetLeft) + " / P " + formatCalcDecimalWhole(targetRight) + "</div>"
    : '';
  const expectedHtml = selected.expected.map((pair) => {
    const leftClass = pair.leftOk ? 'ok' : 'warn';
    const rightClass = pair.rightOk ? 'ok' : 'warn';
    return "<div class='calcResultLine'><b>" + escapeHtml(pair.id) + "</b> · L <b class='" + leftClass + "'>" + formatCalcDecimalWhole(pair.left) +
      "</b> / P <b class='" + rightClass + "'>" + formatCalcDecimalWhole(pair.right) + "</b></div>";
  }).join('');
  const measuredLine = checkedPairs.map((pair) => {
    return "<div class='calcResultLine calcResultLine--muted'><b>" + escapeHtml(pair.id) + "</b> · teď L " + formatCalcDecimalWhole(pair.left) +
      " / P " + formatCalcDecimalWhole(pair.right) + "</div>";
  }).join('');

  let html = targetLine + "<div class='calcResultMain'>Hýbej: <b>" + escapeHtml(selected.type) + "</b></div>";
  if (selected.useTaper) {
    html += Number.isFinite(selected.taperValue)
      ? "<div class='calcResultLine'>Zadej konicitu: <b>" + formatFhbCorrection(selected.taperValue) + "</b></div>"
      : "<div class='calcResultLine'>Konicita: <b>doplň aktuální korekci</b></div>";
  }
  if (selected.useShift) {
    html += Number.isFinite(selected.shiftValue)
      ? "<div class='calcResultLine'>Zadej fhβ: <b>" + formatFhbCorrection(selected.shiftValue) + "</b></div>"
      : "<div class='calcResultLine'>fhβ: <b>doplň aktuální korekci</b></div>";
  }
  if (!selected.useTaper && !selected.useShift) {
    html += "<div class='calcResultLine'>Hodnoty jsou blízko středu i konicity.</div>";
  }
  html += "<div class='calcResultTitle calcResultTitle--small'>Očekávané hodnoty</div>" + expectedHtml;
  html += "<div class='calcResultTitle calcResultTitle--small'>Naměřeno</div>" + measuredLine;

  setCalcOutputHtml(out, html, 'fhbBestSingleResult:' + selected.type + ':' + [targetLeft, targetRight, currentTaperCorr, currentShiftCorr, centerScore, spreadScore, taperDelta, shiftDelta, selected.metrics.score].join('|'));
}


function openFrezkyCorrectionHelp(type) {
  const rawType = String(type || '').trim().toLowerCase();
  const isKonicita = rawType === 'konicita' || rawType === 'taper';
  const cfg = isKonicita
    ? {
        title: 'Kde zadat konicitu',
        subtitle: 'Ve stroji otevři modifikace konicita a přes tlačítko Změnit uprav hodnotu konicity.',
        image: 'assets/help/frezky-konicita-help.png',
        alt: 'Nápověda pro korekci konicity na frézce'
      }
    : {
        title: 'Kde zadat fhβ',
        subtitle: 'Ve stroji otevři korekce úhlu a přes tlačítko Změnit uprav hodnotu fhβ korekce.',
        image: 'assets/help/frezky-fhb-help.png',
        alt: 'Nápověda pro korekci fhβ na frézce'
      };

  let overlay = document.getElementById('frezkyCorrectionHelpOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'frezkyCorrectionHelpOverlay';
    overlay.className = 'calcCorrectionHelpOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = [
      '<div class="calcCorrectionHelpModal">',
      '  <div class="calcCorrectionHelpTop">',
      '    <div>',
      '      <div class="calcCorrectionHelpTitle" id="frezkyCorrectionHelpTitle"></div>',
      '      <div class="calcCorrectionHelpSubtitle" id="frezkyCorrectionHelpSubtitle"></div>',
      '    </div>',
      '    <button type="button" class="calcCorrectionHelpClose" aria-label="Zavřít nápovědu">×</button>',
      '  </div>',
      '  <img class="calcCorrectionHelpImage" id="frezkyCorrectionHelpImage" src="" alt="">',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target.closest('.calcCorrectionHelpClose')) {
        closeFrezkyCorrectionHelp();
      }
    });
  }

  const title = overlay.querySelector('#frezkyCorrectionHelpTitle');
  const subtitle = overlay.querySelector('#frezkyCorrectionHelpSubtitle');
  const img = overlay.querySelector('#frezkyCorrectionHelpImage');
  if (title) title.textContent = cfg.title;
  if (subtitle) subtitle.textContent = cfg.subtitle;
  if (img) {
    img.src = cfg.image;
    img.alt = cfg.alt;
  }
  overlay.classList.add('isVisible');
  document.body.classList.add('calcCorrectionHelpOpen');
}
window.openFrezkyCorrectionHelp = openFrezkyCorrectionHelp;

function closeFrezkyCorrectionHelp() {
  const overlay = document.getElementById('frezkyCorrectionHelpOverlay');
  if (overlay) overlay.classList.remove('isVisible');
  document.body.classList.remove('calcCorrectionHelpOpen');
}
window.closeFrezkyCorrectionHelp = closeFrezkyCorrectionHelp;

if (typeof window !== 'undefined' && !window.__rakFrezkyCorrectionHelpEscBound) {
  window.__rakFrezkyCorrectionHelpEscBound = true;
  try {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeFrezkyCorrectionHelp();
    });
  } catch (err) {}
}

if (typeof window !== 'undefined' && !window.__rakMachineSettingsUiRefreshBound) {
  window.__rakMachineSettingsUiRefreshBound = true;
  try {
    window.addEventListener('rak:machine-settings-updated', () => {
      try { if (typeof refreshPrackaFromMachineSettings === 'function') refreshPrackaFromMachineSettings('machine-settings-event'); } catch (err) {}
      try { if (typeof refreshFhbSettingsUi === 'function') refreshFhbSettingsUi({ source: 'machine-settings-event', recalculate: true }); } catch (err) {}
    });
  } catch (err) {}
}

function getFhbSpreadRelationText(spreadError, deadband) {
  if (!Number.isFinite(spreadError)) return 'nejde vyhodnotit';
  if (spreadError > deadband) return 'moc od sebe → korekce dolů je má sbližovat';
  if (spreadError < -deadband) return 'moc u sebe → korekce nahoru je má rozevírat';
  return 'prakticky na středu';
}

function formatSignedCalcDecimal(value, digits) {
  if (!Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return sign + formatCalcDecimal(value, digits);
}

function readFhbCorrectionInput(id) {
  const value = readCalcDecimal(id);
  if (!Number.isFinite(value)) return NaN;
  return Math.abs(value) >= 1 ? value / 1000 : value;
}

function formatFhbCorrectionWhole(value) {
  if (!Number.isFinite(value)) return '—';
  return String(Math.round(value * 1000));
}

function formatFhbCorrection(value) {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('cs-CZ', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function formatSignedFhbCorrection(value) {
  if (!Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return sign + formatFhbCorrection(value);
}

