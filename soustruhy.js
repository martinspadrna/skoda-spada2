function resetSoustruhy() {
  ["lis_first", "lis_plan", "v126_first", "v126_plan", "v106_first", "v106_plan", "v106_c1", "v106_c2", "v106_c3", "v106_c4"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  ["soustruhyLisResult", "soustruhy126Result", "soustruhy106Result"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  });
  app.soustruhMode = "lis";
  app.soustruhPlan = String(typeof getSoustruhDefaultPlan === "function" ? getSoustruhDefaultPlan() : 1216);
  app.soustruh126Start = 32;
  app.soustruh106Counts = ["", "", "", ""];
  renderSoustruhy();
  saveRotationData();
}

function resetFields(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  saveRotationData();
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
    out.innerHTML = "<div class='smallText'>Zadej počet kusů nebo dávek.</div>";
    return;
  }
  const now = new Date();
  const finish = new Date(now.getTime() + Math.round(seconds * 1000));
  const durationText = formatDuration(Math.round(seconds * 1000));
  const dosesText = formatDoses(pieces);
  out.innerHTML =
    "<div><b>" + escapeHtml(label) + "</b></div>" +
    "<div class='uMt6'>Hotovo v <b>" + formatClockTime(finish) + "</b></div>" +
    "<div class='smallText'>Za " + durationText + " · " + formatCount(pieces) + " ks / " + dosesText + " dávek" + (extraLine ? " · " + escapeHtml(extraLine) : "") + "</div>";
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
  document.getElementById("outF").innerHTML =
    "Do konce směny ještě stihneš " + ks + " ks, tj. " + formatDoses(ks) + " dávek.<br>" +
    "Celkově budeš mít " + celkem + " ks, tj. " + formatDoses(celkem) + " dávek.<br><br>" +
    "Na obou frézkách ještě stihneš " + (ks * 2) + " ks, tj. " + formatDoses(ks * 2) + " dávek.";
  saveRotationData();
}

function calcFFinish() {
  const target = resolveTargetPieces("f_finish_kusy", "f_finish_davky");
  const out = document.getElementById("outFTime");
  if (!out) return;
  if (!target.pieces) {
    out.innerHTML = "<div class='smallText'>Zadej počet kusů nebo dávek.</div>";
    return;
  }
  const seconds = target.pieces * 60;
  const now = new Date();
  const finish = new Date(now.getTime() + seconds * 1000);
  out.innerHTML =
    "<div><b>Frézky</b></div>" +
    "<div class='uMt6'>Hotovo v <b>" + formatClockTime(finish) + "</b></div>" +
    "<div class='smallText'>Za " + formatDuration(seconds * 1000) + " · " + formatCount(target.pieces) + " ks / " + formatDoses(target.pieces) + " dávek</div>";
  saveRotationData();
}

function calcP() {
  const sec = Math.max(0, (getShiftEnd(new Date()) - new Date()) / 1000);
  const ks = Math.floor(sec / 30);
  const hotovo = parseInt(document.getElementById("p_kusy").value) || 0;
  const celkem = hotovo + ks;
  document.getElementById("outP").innerHTML =
    "Do konce směny ještě stihneš " + ks + " ks, tj. " + formatDoses(ks) + " dávek.<br>" +
    "Celkově budeš mít " + celkem + " ks, tj. " + formatDoses(celkem) + " dávek.";
  saveRotationData();
}

function calcBrusy() {
  const sec = Math.max(0, (getShiftEnd(new Date()) - new Date()) / 1000);
  const cfg = getBrusConfig(app.machine, app.prog);
  const ks = countBrusyPieces(sec, cfg);
  const hotovo = parseInt(document.getElementById("davka").value) || 0;
  const celkem = parseInt(document.getElementById("celkem").value) || 0;
  const doKonce = ks + hotovo;
  const celkove = celkem + doKonce;
  document.getElementById("outB").innerHTML =
    "Do konce směny ještě stihneš " + ks + " ks, tj. " + formatDoses(doKonce) + " dávek.<br>" +
    "Celkově budeš mít " + celkove + " ks, tj. " + formatDoses(celkove) + " dávek.";
  saveRotationData();
}

function calcBrusyFinish() {
  const target = resolveTargetPieces("b_finish_kusy", "b_finish_davky");
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
    out.innerHTML = "<div class='smallText'>Zadej počet kusů nebo dávek.</div>";
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
    ? ("<div class='smallText'>Přesnější výpočet: " + (doneInBatch > 0 ? ("rozpracovaná dávka má " + formatCount(doneInBatch) + " ks hotovo") : "bez rozdělané dávky") + (piecesToDress > 0 ? (", do orovnání zbývá " + formatCount(piecesToDress) + " ks") : "") + ".</div>")
    : "<div class='smallText'>Přesnější výpočet si můžeš rozkliknout a doplnit podle rozdělané dávky.</div>";
  out.innerHTML =
    "<div><b>" + escapeHtml(app.machine + " / " + cfg.label) + "</b></div>" +
    "<div class='uMt6'>Hotovo v <b>" + formatClockTime(finish) + "</b></div>" +
    "<div class='smallText'>Za " + formatDuration(seconds * 1000) + " · " + formatCount(remainingPieces) + " ks / " + formatDoses(remainingPieces) + " dávek" + escapeHtml(preciseNote) + "</div>" +
    preciseDetails;
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

function findBrusMachineSetting(machine, prog) {
  const rows = Array.isArray(app && app.machineSettingsRows) ? app.machineSettingsRows : [];
  const key = String(machine || '').trim() + '_' + String(prog || '').trim();
  return rows.find(row => String(row && row.machine_key ? row.machine_key : '').trim() === key) || null;
}

function getBrusConfig(machine, prog) {
  const fallback = BRUS_CONFIG[machine] || BRUS_CONFIG.TBKR01;
  const cfg = fallback[prog] || fallback.AD;
  const setting = findBrusMachineSetting(machine, prog);
  const settings = setting && typeof setting.settings_json === 'object' && setting.settings_json !== null ? setting.settings_json : {};
  const pieceSec = setting && setting.speed !== '' && setting.speed !== null && setting.speed !== undefined ? Number(setting.speed) : Number(cfg.pieceSec) || 0;
  const dressEvery = Number(settings.dress_count ?? cfg.dressEvery) || 0;
  const dressSec = Number(settings.dress_time ?? cfg.dressSec) || 0;
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

function renderBatchResult(title, batches, target, firstBatch) {
  if (!batches.length) return "<div class='smallText'>Doplň vstupy, ať se to spočítá.</div>";
  const lastBatch = batches[batches.length - 1].batchNo;
  const total = batches[batches.length - 1].produced;
  let html = "<div class='smallText uMb10'>" + escapeHtml(title) + "</div>";
  html += "<div class='statsSummary'>";
  html += "<div class='tile'><div class='smallText'>Dávek</div><div class='uFs22 uMt4'>" + formatCount(batches.length) + "</div></div>";
  html += "<div class='tile'><div class='smallText'>Poslední dávka</div><div class='uFs22 uMt4'>" + formatCount(lastBatch) + "</div></div>";
  html += "<div class='tile'><div class='smallText'>Vyrobeno</div><div class='uFs22 uMt4'>" + formatCount(total) + "</div></div>";
  html += "</div>";
  html += "<div class='tableWrap'><table class='statsTable'><thead><tr><th>Dávka</th><th>Ks</th><th>Součet</th></tr></thead><tbody>";
  batches.forEach(item => {
    html += "<tr><td>" + formatCount(item.batchNo) + "</td><td>" + formatCount(item.size) + "</td><td>" + formatCount(item.produced) + "</td></tr>";
  });
  html += "</tbody></table></div>";
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

function renderSoustruhy() {
  const modeButtons = document.querySelectorAll('[data-soustruh-mode]');
  const panels = {
    lis: document.getElementById('soustruhyLisPanel'),
    "126": document.getElementById('soustruhy126Panel'),
    "106": document.getElementById('soustruhy106Panel')
  };

  modeButtons.forEach(btn => {
    const mode = btn.getAttribute('data-soustruh-mode');
    btn.classList.toggle('activeChoice', app.soustruhMode === mode);
  });

  Object.entries(panels).forEach(([mode, panel]) => {
    if (panel) panel.classList.toggle('active', app.soustruhMode === mode);
  });

  const lisFirst = document.getElementById('lis_first');
  const lisPlan = document.getElementById('lis_plan');
  const v126First = document.getElementById('v126_first');
  const v126Plan = document.getElementById('v126_plan');
  const v106First = document.getElementById('v106_first');
  const v106Plan = document.getElementById('v106_plan');
  const v106C1 = document.getElementById('v106_c1');
  const v106C2 = document.getElementById('v106_c2');
  const v106C3 = document.getElementById('v106_c3');
  const v106C4 = document.getElementById('v106_c4');

  const defaultPlan = String(app.soustruhPlan || (typeof getSoustruhDefaultPlan === "function" ? getSoustruhDefaultPlan() : 1216));
  if (lisPlan && !lisPlan.value) lisPlan.value = defaultPlan;
  if (v126Plan && !v126Plan.value) v126Plan.value = defaultPlan;
  if (v106Plan && !v106Plan.value) v106Plan.value = defaultPlan;
  if (v106C1 && !v106C1.value) v106C1.value = app.soustruh106Counts[0] || '';
  if (v106C2 && !v106C2.value) v106C2.value = app.soustruh106Counts[1] || '';
  if (v106C3 && !v106C3.value) v106C3.value = app.soustruh106Counts[2] || '';
  if (v106C4 && !v106C4.value) v106C4.value = app.soustruh106Counts[3] || '';

  const startButtons = document.querySelectorAll('[data-startsize]');
  startButtons.forEach(btn => {
    const size = Number(btn.getAttribute('data-startsize'));
    btn.classList.toggle('activeChoice', app.soustruh126Start === size);
  });
}

function calcSoustruhyLis() {
  const first = parseInt(document.getElementById('lis_first').value, 10);
  const plan = parseInt(document.getElementById('lis_plan').value, 10);
  const out = document.getElementById('soustruhyLisResult');
  if (!Number.isFinite(first) || !Number.isFinite(plan) || plan <= 0) {
    out.innerHTML = "<div class='smallText'>Doplň první dávku a plán.</div>";
    return;
  }
  app.soustruhPlan = String(plan);
  const batches = getSoustruhBatchList(first, [32], plan);
  out.innerHTML = renderBatchResult('Lis', batches, plan, first);
  saveRotationData();
}

function calcSoustruhy126() {
  const first = parseInt(document.getElementById('v126_first').value, 10);
  const plan = parseInt(document.getElementById('v126_plan').value, 10);
  const out = document.getElementById('soustruhy126Result');
  if (!Number.isFinite(first) || !Number.isFinite(plan) || plan <= 0) {
    out.innerHTML = "<div class='smallText'>Doplň první dávku a plán.</div>";
    return;
  }
  app.soustruhPlan = String(plan);
  const startSize = app.soustruh126Start === 31 ? 31 : 32;
  const sizes = startSize === 32 ? [32, 31] : [31, 32];
  const batches = getSoustruhBatchList(first, sizes, plan);
  out.innerHTML = renderBatchResult('Volné 126 ks', batches, plan, first);
  saveRotationData();
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
  if (!Number.isFinite(first) || !Number.isFinite(plan) || plan <= 0 || counts.some(v => !Number.isFinite(v) || v <= 0)) {
    out.innerHTML = "<div class='smallText'>Doplň první dávku, plán a první čtyři dávky.</div>";
    return;
  }
  app.soustruhPlan = String(plan);
  app.soustruh106Counts = counts.map(v => String(v));
  const batches = getSoustruhBatchList(first, counts, plan);
  out.innerHTML = renderBatchResult('Volné 106 ks', batches, plan, first);
  saveRotationData();
}
