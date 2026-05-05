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

function getBrusConfig(machine, prog) {
  const machineCfg = BRUS_CONFIG[machine] || BRUS_CONFIG.TBKR01;
  const cfg = machineCfg[prog] || machineCfg.AD;
  return {
    machine,
    prog,
    label: cfg.label || prog,
    pieceSec: Number(cfg.pieceSec) || 0,
    dressEvery: Number(cfg.dressEvery) || 0,
    dressSec: Number(cfg.dressSec) || 0
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
  let html = "<div class='smallText' style='margin-bottom:10px;'>" + escapeHtml(title) + "</div>";
  html += "<div class='statsSummary'>";
  html += "<div class='tile'><div class='smallText'>Dávek</div><div style='font-size:22px;margin-top:4px;'>" + formatCount(batches.length) + "</div></div>";
  html += "<div class='tile'><div class='smallText'>Poslední dávka</div><div style='font-size:22px;margin-top:4px;'>" + formatCount(lastBatch) + "</div></div>";
  html += "<div class='tile'><div class='smallText'>Vyrobeno</div><div style='font-size:22px;margin-top:4px;'>" + formatCount(total) + "</div></div>";
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

  if (lisPlan && !lisPlan.value) lisPlan.value = app.soustruhPlan || '1216';
  if (v126Plan && !v126Plan.value) v126Plan.value = app.soustruhPlan || '1216';
  if (v106Plan && !v106Plan.value) v106Plan.value = app.soustruhPlan || '1216';
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
