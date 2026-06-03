// RaK 1.2 (1.116) – zbytkový UI bridge po oddělení modulů.

// RaK 1.2 (1.116) – Více/menu shell je oddělený v app-menu.js.

const UI_PREFS_KEY = APP_KEY + ':uiPrefs';
const DEVICE_PERFORMANCE_PROBE_KEY = APP_KEY + ':devicePerformanceProbe';
const LIGHTWEIGHT_MODE_LABEL = 'Láďův režim';


function clampRakNumber(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, num));
}

function getRakDevicePerformanceProbeCached(maxAgeMs) {
  try {
    const parsed = typeof parseLocalStorageJsonCached === 'function'
      ? parseLocalStorageJsonCached(DEVICE_PERFORMANCE_PROBE_KEY, null)
      : JSON.parse(localStorage.getItem(DEVICE_PERFORMANCE_PROBE_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') return null;
    const at = parsed.at ? Date.parse(parsed.at) : Number(parsed.ts || 0);
    if (!Number.isFinite(at) || at <= 0) return null;
    const age = Date.now() - at;
    const limit = Number(maxAgeMs || 7 * 24 * 60 * 60 * 1000);
    if (limit > 0 && age > limit) return null;
    return parsed;
  } catch (err) {
    return null;
  }
}

function saveRakDevicePerformanceProbe(result) {
  try {
    const payload = Object.assign({ at: new Date().toISOString(), appVersion: typeof APP_VERSION !== 'undefined' ? APP_VERSION : '' }, result || {});
    const json = JSON.stringify(payload);
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(DEVICE_PERFORMANCE_PROBE_KEY, json);
    else localStorage.setItem(DEVICE_PERFORMANCE_PROBE_KEY, json);
    if (typeof clearLocalStorageJsonCache === 'function') clearLocalStorageJsonCache(DEVICE_PERFORMANCE_PROBE_KEY);
    try { window.__rakDevicePerformanceProbe = payload; } catch (err) {}
    return payload;
  } catch (err) {
    console.warn('Device performance probe save failed', err);
    return result || null;
  }
}

function classifyRakDevicePerformance(avgFps, worstFrameMs, droppedRatio) {
  const fpsScore = clampRakNumber((Number(avgFps || 0) / 60) * 100, 0, 100);
  const worstPenalty = clampRakNumber((Number(worstFrameMs || 0) - 24) * 1.55, 0, 42);
  const dropPenalty = clampRakNumber(Number(droppedRatio || 0) * 90, 0, 36);
  const score = Math.round(clampRakNumber(fpsScore - worstPenalty - dropPenalty, 0, 100));
  const profile = score < 52 || Number(avgFps || 0) < 42 || Number(worstFrameMs || 0) > 55
    ? 'turbo'
    : (score < 72 || Number(avgFps || 0) < 53 || Number(worstFrameMs || 0) > 38 ? 'lite' : 'normal');
  return {
    score,
    profile,
    label: profile === 'turbo' ? 'Láďův turbo režim' : (profile === 'lite' ? 'odlehčený režim' : 'normální režim'),
    shouldAutoLightweight: profile !== 'normal'
  };
}

function getRakDevicePerformanceStatus() {
  const lowEnd = typeof getLowEndDeviceInfo === 'function' ? getLowEndDeviceInfo() : null;
  const probe = getRakDevicePerformanceProbeCached(14 * 24 * 60 * 60 * 1000);
  const prefs = typeof loadUiPrefs === 'function' ? loadUiPrefs() : null;
  const active = !!(document.body && document.body.classList && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lightweightMode') || document.body.classList.contains('lowEndDevice')));
  const profile = typeof getRakLadaPerformanceProfile === 'function' ? getRakLadaPerformanceProfile() : null;
  return {
    ok: true,
    active,
    mode: active ? String(profile && profile.level || 'lite') : 'normal',
    manual: !!(prefs && prefs.lightweightManual),
    lowEndDetected: !!(lowEnd && lowEnd.lowEnd),
    lowEndReasons: Array.isArray(lowEnd && lowEnd.reasons) ? lowEnd.reasons.slice(0, 8) : [],
    probe,
    probeAgeMs: probe && probe.at ? Math.max(0, Date.now() - Date.parse(probe.at)) : null,
    recommendedProfile: probe && probe.profile ? probe.profile : (lowEnd && lowEnd.lowEnd ? 'turbo' : 'normal'),
    label: active ? (profile && profile.level === 'turbo' ? 'Láďův turbo režim' : 'odlehčený režim') : 'normální režim'
  };
}

async function runRakDevicePerformanceProbe(options) {
  const opts = options || {};
  const durationMs = clampRakNumber(opts.durationMs || 950, 420, 1800);
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let last = start;
  let frames = 0;
  let dropped = 0;
  let worst = 0;
  let sum = 0;

  await new Promise((resolve) => {
    const step = (ts) => {
      const now = Number(ts || (typeof performance !== 'undefined' ? performance.now() : Date.now()));
      const delta = Math.max(0, now - last);
      if (frames > 0) {
        sum += delta;
        worst = Math.max(worst, delta);
        if (delta > 34) dropped += 1;
      }
      frames += 1;
      last = now;
      if (now - start >= durationMs) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  const total = Math.max(1, ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - start));
  const avgFps = Math.round((Math.max(0, frames - 1) / total) * 1000 * 10) / 10;
  const avgFrameMs = Math.round((sum / Math.max(1, frames - 1)) * 10) / 10;
  const droppedRatio = Math.round((dropped / Math.max(1, frames - 1)) * 100) / 100;
  const classification = classifyRakDevicePerformance(avgFps, worst, droppedRatio);
  const lowEndInfo = typeof getLowEndDeviceInfo === 'function' ? getLowEndDeviceInfo() : null;
  const result = saveRakDevicePerformanceProbe(Object.assign({}, classification, {
    avgFps,
    avgFrameMs,
    worstFrameMs: Math.round(worst * 10) / 10,
    droppedFrames: dropped,
    frameCount: frames,
    droppedRatio,
    durationMs: Math.round(total),
    dpr: Number(window.devicePixelRatio || 1) || 1,
    width: Number(window.innerWidth || 0) || 0,
    height: Number(window.innerHeight || 0) || 0,
    memory: Number(navigator.deviceMemory || 0) || null,
    cores: Number(navigator.hardwareConcurrency || 0) || 0,
    lowEndReasons: Array.isArray(lowEndInfo && lowEndInfo.reasons) ? lowEndInfo.reasons.slice(0, 8) : []
  }));

  if (classification.shouldAutoLightweight) {
    try {
      const current = loadUiPrefs();
      if (!current.lightweightManual && !current.lightweight) {
        applyUiPrefs(Object.assign({}, current, { lightweight: true, lightweightManual: false }));
      } else {
        applyUiPrefs(current);
      }
    } catch (err) {}
  }
  try {
    if (typeof app !== 'undefined') app.lastDevicePerformanceProbe = result;
  } catch (err) {}
  return result;
}

function formatRakProbeAge(probe) {
  try {
    if (!probe || !probe.at) return 'ještě neměřeno';
    const age = Math.max(0, Date.now() - Date.parse(probe.at));
    if (age < 60 * 1000) return 'před chvílí';
    if (age < 60 * 60 * 1000) return 'před ' + Math.round(age / 60000) + ' min';
    if (age < 24 * 60 * 60 * 1000) return 'před ' + Math.round(age / 3600000) + ' h';
    return 'před ' + Math.round(age / 86400000) + ' dny';
  } catch (err) {
    return 'neznámé';
  }
}

function buildRakDevicePerformanceSettingsHtml() {
  const status = getRakDevicePerformanceStatus();
  const probe = status.probe || null;
  const profileText = status.active ? (status.mode === 'turbo' ? 'Láďův turbo režim' : 'odlehčený režim') : 'normální režim';
  const probeText = probe
    ? ('Skóre ' + String(probe.score || 0) + '/100 · ' + String(probe.avgFps || '—') + ' FPS · ' + escapeHtml(formatRakProbeAge(probe)))
    : 'Ještě neměřeno';
  return [
    '<div class="appMenuCard appMenuSettingsCard rakDevicePerfCard">',
    '  <div class="appMenuCardTitle">Výkon zařízení</div>',
    '  <div class="appMenuText rakDevicePerfText">',
    '    <div>Režim: <b>' + escapeHtml(profileText) + '</b>' + (status.manual ? ' · ručně' : ' · auto') + '</div>',
    '    <div class="smallText">' + (status.lowEndDetected ? 'Slabší zařízení · ' : 'Bez omezení · ') + escapeHtml(probeText) + '</div>',
    '  </div>',
    '  <div class="appMenuActionRow rakDevicePerfActions">',
    '    <button type="button" class="appMenuAction isActive" data-menu-action="device-performance-test">Změřit</button>',
    '    <button type="button" class="appMenuAction" data-menu-action="device-performance-auto">Automatika</button>',
    '    <button type="button" class="appMenuAction rakLadaModeBtn' + (status.active ? ' isActive' : '') + '" data-ui-pref="lightweight">Láďův režim</button>',
    '  </div>',
    '</div>'
  ].join('');
}

try { window.getRakDevicePerformanceStatus = getRakDevicePerformanceStatus; } catch (err) {}
try { window.runRakDevicePerformanceProbe = runRakDevicePerformanceProbe; } catch (err) {}

function getLowEndDeviceInfo() {
  try {
    const ua = String(navigator.userAgent || '');
    const platform = String(navigator.platform || '');
    const isIOS = /iPad|iPhone|iPod/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    const cores = Number(navigator.hardwareConcurrency || 0);
    const memory = Number(navigator.deviceMemory || 0);
    const hasMemoryInfo = memory > 0;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
    const saveData = !!(connection && connection.saveData);
    const effectiveType = connection && connection.effectiveType ? String(connection.effectiveType) : '';
    const downlink = connection && Number.isFinite(Number(connection.downlink)) ? Number(connection.downlink) : 0;
    const reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const width = Math.min(
      Number(window.innerWidth || 0) || 0,
      Number(screen && screen.width || 0) || Number(window.innerWidth || 0) || 0
    );
    const dpr = Number(window.devicePixelRatio || 1) || 1;
    const reasons = [];

    if (saveData) reasons.push('Data Saver');
    if (/^(slow-2g|2g|3g)$/i.test(effectiveType)) reasons.push('pomalejší připojení ' + effectiveType);

    // Android telefony často hlásí 4 GB RAM a 8 jader, ale s těžkým glass/blur stylem se už umí škubat.
    // Proto 4 GB RAM bereme jako slabší/střední zařízení pro automatické odlehčení.
    if (hasMemoryInfo && memory <= 4) reasons.push('RAM ' + memory + ' GB');
    if (cores > 0 && cores <= 2) reasons.push('CPU ' + cores + ' jádra');
    if (!isIOS && hasMemoryInfo && cores > 0 && cores <= 4 && memory <= 6) reasons.push('CPU/RAM kombinace');
    if (!isIOS && isAndroid && !hasMemoryInfo && cores > 0 && cores <= 4) reasons.push('Android bez RAM info + ' + cores + ' jádra');
    if (!isIOS && isAndroid && width > 0 && width <= 390 && dpr >= 2.5 && (!hasMemoryInfo || memory <= 6)) reasons.push('malý displej s vysokým DPR');

    const perfProbe = typeof getRakDevicePerformanceProbeCached === 'function' ? getRakDevicePerformanceProbeCached(14 * 24 * 60 * 60 * 1000) : null;
    if (perfProbe && String(perfProbe.profile || '') === 'turbo') reasons.push('měření výkonu: turbo');
    else if (perfProbe && String(perfProbe.profile || '') === 'lite') reasons.push('měření výkonu: odlehčený režim');
    if (perfProbe && Number(perfProbe.avgFps || 0) > 0 && Number(perfProbe.avgFps || 0) < 45) reasons.push('FPS ' + Math.round(Number(perfProbe.avgFps || 0)));

    return {
      lowEnd: reasons.length > 0,
      reasons,
      cores,
      memory: hasMemoryInfo ? memory : null,
      saveData,
      reducedMotion,
      isIOS,
      isAndroid,
      effectiveType,
      downlink,
      dpr,
      width
    };
  } catch (err) {
    return { lowEnd: false, reasons: [], cores: 0, memory: null, saveData: false, reducedMotion: false, isIOS: false, isAndroid: false, effectiveType: '', downlink: 0, dpr: 1, width: 0 };
  }
}

function isLowEndDevice() {
  return !!getLowEndDeviceInfo().lowEnd;
}

function loadUiPrefs() {
  try {
    const autoLightweight = isLowEndDevice();
    const parsed = typeof parseLocalStorageJsonCached === 'function'
      ? parseLocalStorageJsonCached(UI_PREFS_KEY, null)
      : JSON.parse(localStorage.getItem(UI_PREFS_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') return { compact: false, reduceMotion: false, lightweight: autoLightweight, lightweightManual: false };
    const oldManualMotion = parsed.reduceMotion === true;
    const lightweightManual = parsed.lightweightManual === true || oldManualMotion;
    const storedLightweight = !!parsed.lightweight || oldManualMotion;
    return {
      compact: !!parsed.compact,
      reduceMotion: false,
      // Když zařízení samo vypadá jako slabší, Láďův režim se má zapnout i po starším uloženém nastavení.
      // Vypnout ho může jen ruční volba v nastavení.
      lightweight: lightweightManual ? storedLightweight : autoLightweight,
      lightweightManual
    };
  } catch (err) {
    console.warn(err);
    return { compact: false, reduceMotion: false, lightweight: isLowEndDevice(), lightweightManual: false };
  }
}

function saveUiPrefs(prefs) {
  const next = {
    compact: !!prefs.compact,
    reduceMotion: !!prefs.reduceMotion,
    lightweight: !!prefs.lightweight,
    lightweightManual: !!prefs.lightweightManual
  };
  try {
    const payload = JSON.stringify(next);
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(UI_PREFS_KEY, payload);
    else localStorage.setItem(UI_PREFS_KEY, payload);
  } catch (err) {
    console.warn(err);
  }
  return next;
}

function buildRakLadaPerformanceProfile(active, lowEndInfo, prefs) {
  const info = lowEndInfo || { reasons: [], cores: 0, memory: null, dpr: 1, width: 0, saveData: false, reducedMotion: false };
  const reasons = Array.isArray(info.reasons) ? info.reasons.slice(0, 10) : [];
  const veryLowMemory = Number(info.memory || 0) > 0 && Number(info.memory || 0) <= 4;
  const smallHighDpr = Number(info.width || 0) > 0 && Number(info.width || 0) <= 390 && Number(info.dpr || 1) >= 2.5;
  const saveData = !!info.saveData;
  const reducedMotion = !!info.reducedMotion;
  const manual = !!(prefs && prefs.lightweightManual);
  const isTurbo = !!active && (manual || veryLowMemory || smallHighDpr || saveData || reducedMotion || reasons.length > 0);
  return {
    active: !!active,
    level: active ? (isTurbo ? 'turbo' : 'lite') : 'normal',
    frameMs: active ? (isTurbo ? 42 : 34) : 0,
    canvasDprMax: active ? 1 : 2,
    resizeThrottleMs: active ? (isTurbo ? 700 : 460) : 120,
    onlineRefreshDelayMs: active ? (isTurbo ? 1800 : 1200) : 420,
    leaderboardTtlMs: active ? (isTurbo ? 240000 : 180000) : 60000,
    idleDelayMs: active ? (isTurbo ? 360 : 220) : 60,
    maxDeltaMs: active ? (isTurbo ? 42 : 34) : 48,
    cssEffects: active ? 'minimal' : 'full',
    domBatchDelayMs: active ? (isTurbo ? 220 : 140) : 40,
    maxShadowPx: active ? 0 : 24,
    reasons,
    manual,
    detectedDpr: Number(info.dpr || window.devicePixelRatio || 1) || 1,
    width: Number(info.width || 0) || 0,
    memory: Number(info.memory || 0) || null,
    cores: Number(info.cores || 0) || 0
  };
}

function getRakLadaPerformanceProfile() {
  try {
    const body = document.body;
    const active = !!(body && body.classList && (body.classList.contains('lightweightMode') || body.classList.contains('lowEndDevice') || body.classList.contains('ladaMode')));
    const info = typeof getLowEndDeviceInfo === 'function' ? getLowEndDeviceInfo() : { reasons: [], dpr: Number(window.devicePixelRatio || 1) || 1 };
    const prefs = typeof app !== 'undefined' && app && app.uiPrefs ? app.uiPrefs : loadUiPrefs();
    return buildRakLadaPerformanceProfile(active, info, prefs);
  } catch (err) {
    return buildRakLadaPerformanceProfile(false, null, null);
  }
}

try { window.getRakLadaPerformanceProfile = getRakLadaPerformanceProfile; } catch (err) {}
try { window.buildRakLadaPerformanceProfile = buildRakLadaPerformanceProfile; } catch (err) {}

function applyUiPrefs(prefs) {
  const lowEndInfo = getLowEndDeviceInfo();
  const lowEndDetected = !!lowEndInfo.lowEnd;
  const incoming = Object.assign({}, prefs || loadUiPrefs());
  if (lowEndDetected && !incoming.lightweightManual) incoming.lightweight = true;
  const next = saveUiPrefs(incoming);
  const lightweight = !!next.lightweight;
  const ladaMode = lightweight || lowEndDetected;
  const profile = buildRakLadaPerformanceProfile(ladaMode, lowEndInfo, next);
  document.body.classList.toggle('compactUI', !!next.compact);
  document.body.classList.toggle('reduceMotion', !!next.reduceMotion || ladaMode);
  document.body.classList.toggle('lightweightMode', lightweight);
  document.body.classList.toggle('ladaMode', ladaMode);
  document.body.classList.toggle('lowEndDevice', lowEndDetected);
  document.body.classList.toggle('ladaTurboMode', ladaMode && profile.level === 'turbo');
  try {
    document.documentElement.dataset.rakLightweight = lightweight ? 'on' : 'off';
    document.documentElement.dataset.rakLightweightLabel = LIGHTWEIGHT_MODE_LABEL;
    document.documentElement.dataset.rakLowEndDevice = lowEndDetected ? 'yes' : 'no';
    document.documentElement.dataset.rakLowEndReason = lowEndDetected ? lowEndInfo.reasons.join(', ') : '';
    document.documentElement.dataset.rakPerformanceMode = ladaMode ? (lowEndDetected ? 'lada-auto-low-end-turbo' : 'lada-manual-turbo') : 'normal';
    document.documentElement.dataset.rakLadaProfile = ladaMode ? profile.level : 'normal';
    document.documentElement.dataset.rakLadaFrameMs = String(profile.frameMs || 0);
    document.documentElement.dataset.rakLadaCanvasDpr = String(profile.canvasDprMax || 2);
    document.documentElement.dataset.rakMotion = (next.reduceMotion || ladaMode) ? 'reduced' : 'normal';
    document.documentElement.style.setProperty('--rak-lada-frame-ms', String(profile.frameMs || 0));
    document.documentElement.style.setProperty('--rak-lada-blur-px', ladaMode ? '0px' : '12px');
  } catch (err) {}
  if (typeof app !== 'undefined') {
    app.uiPrefs = next;
    app.lowEndDeviceDetected = lowEndDetected;
    app.lowEndDeviceInfo = lowEndInfo;
    app.ladaPerformanceProfile = profile;
  }
  try { window.__rakLadaPerformanceProfile = profile; } catch (err) {}
  return next;
}

function toggleUiPref(key) {
  const current = loadUiPrefs();
  const next = { ...current, [key]: !current[key] };
  if (key === 'lightweight') {
    next.reduceMotion = false;
    next.lightweightManual = true;
  }
  applyUiPrefs(next);
  return next;
}

function resetUiPrefs() {
  applyUiPrefs({ compact: false, reduceMotion: false, lightweight: false, lightweightManual: false });
}

applyUiPrefs(loadUiPrefs());

function getRakPerformanceDprMax() {
  try {
    const profile = typeof getRakLadaPerformanceProfile === 'function' ? getRakLadaPerformanceProfile() : null;
    if (profile && profile.active) return Math.max(1, Math.min(1, Number(profile.canvasDprMax || 1) || 1));
    const body = document.body;
    const lite = !!(body && body.classList && (body.classList.contains('lightweightMode') || body.classList.contains('lowEndDevice') || body.classList.contains('ladaMode')));
    if (lite) return 1;
    const info = typeof getLowEndDeviceInfo === 'function' ? getLowEndDeviceInfo() : null;
    if (info && info.lowEnd) return 1;
  } catch (err) {}
  return 2;
}

try { window.getRakPerformanceDprMax = getRakPerformanceDprMax; } catch (err) {}

// RaK 1.2 (1.116) – Piškvorky jsou oddělené v games-gomoku.js.

function triggerAboutAction() {
  const state = typeof app !== 'undefined' ? app : null;
  if (state) {
    state.aboutTapCount = 0;
    if (state.aboutTapTimer) clearTimeout(state.aboutTapTimer);
    state.aboutTapTimer = null;
  }
  openAppMenu('about');
}


function buildGamesProfileSettingsHtml() {
  return [
    '<div class="appMenuCard appMenuSettingsCard appMenuProfileCard gamesAccountCard" id="gamesAccountCard">',
    '  <div class="appMenuCardTitle">Profil a přihlášení</div>',
    '  <div class="gamesAccountTop" id="gamesAccountTop">',
    '    <div>',
    '      <div class="dashboardLabel">Přihlášený profil</div>',
    '      <div class="gamesAccountName" id="gamesAccountName"></div>',
    '    </div>',
    '    <button type="button" class="gamesTinyBtn" id="gamesAccountClearBtn">Odhlásit</button>',
    '  </div>',
    '  <div class="gamesAccountRow" id="gamesAccountEntryRow">',
    '    <input id="gamesAccountInput" class="gamesAccountInput" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="Zadej poslední 4 číslice os.č.">',
    '    <button type="button" class="gamesTinyBtn gamesAccountConfirmBtn" id="gamesAccountConfirmBtn">Ověřit</button>',
    '  </div>',
    '</div>'
  ].join('');
}

function openProfileSettingsFromGames() {
  showPage('menu');
  openAppMenu('settings');
  if (typeof setBottomNavActive === 'function') setBottomNavActive('menu');
}


function closeGamesRankModal() {
  const overlay = document.getElementById('gamesRankModalOverlay');
  if (overlay) overlay.classList.remove('isVisible');
  document.body.classList.remove('gamesRankModalOpen');
}

function openGamesRankModal() {
  const defs = Array.isArray(window.GAMES_RANK_DEFS) ? window.GAMES_RANK_DEFS : [];
  const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
  const active = profile && profile.activeAccountId && profile.accounts ? profile.accounts[profile.activeAccountId] : null;
  const progress = active && typeof window.gamesBuildProgressSummary === 'function'
    ? window.gamesBuildProgressSummary(active)
    : null;
  const xp = Math.max(0, Number(progress && progress.xp || 0) || 0);
  const currentRank = String(progress && progress.rank || '');
  const rows = defs.length ? defs.map((rank) => {
    const min = Math.max(0, Number(rank && rank.minXp || 0) || 0);
    const name = String(rank && rank.name || 'Rank');
    const isCurrent = currentRank && name === currentRank;
    return '<div class="gamesRankRow' + (isCurrent ? ' isCurrent' : '') + '"><div><div class="gamesRankName">' + escapeHtml(name) + '</div><div class="gamesRankHint">' + (isCurrent ? 'Aktuální rank' : (xp >= min ? 'Splněno' : 'Chybí ' + String(min - xp) + ' XP')) + '</div></div><div class="gamesRankXp">' + String(min) + ' XP</div></div>';
  }).join('') : '<div class="gamesRankHint">Ranky se zatím nenačetly.</div>';
  let overlay = document.getElementById('gamesRankModalOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'gamesRankModalOverlay';
    overlay.className = 'gamesRankModalOverlay';
    document.body.appendChild(overlay);
  }
  const nextRank = progress && progress.nextRank ? String(progress.nextRank) : '';
  const meta = active
    ? (nextRank ? ('Aktuálně máš ' + String(xp) + ' XP. Další rank: ' + nextRank + ', chybí ' + String(Math.max(0, Number(progress.rankRemaining || 0) || 0)) + ' XP.') : ('Aktuálně máš ' + String(xp) + ' XP a jsi na max ranku.'))
    : 'Přihlas se k hernímu profilu a uvidíš svůj aktuální postup.';
  overlay.innerHTML = [
    '<div class="gamesRankModal" role="dialog" aria-modal="true" aria-labelledby="gamesRankModalTitle">',
    '  <div class="gamesRankModalHead"><div><div class="gamesRankModalTitle" id="gamesRankModalTitle">Ranky a XP</div><div class="gamesRankHint">' + escapeHtml(meta) + '</div></div><button type="button" class="gamesRankModalClose" data-rank-close="1">×</button></div>',
    '  <div class="gamesRankRows">' + rows + '</div>',
    '</div>'
  ].join('');
  overlay.classList.add('isVisible');
  document.body.classList.add('gamesRankModalOpen');
  overlay.querySelectorAll('[data-rank-close]').forEach((btn) => btn.addEventListener('click', closeGamesRankModal));
  overlay.addEventListener('click', (ev) => { if (ev.target === overlay) closeGamesRankModal(); }, { once: true });
}

function bindGamesRankBadge() {
  const rankEl = document.getElementById('gamesProfileRankBadge');
  if (!rankEl || rankEl.dataset.rankBound === '1') return;
  rankEl.dataset.rankBound = '1';
  rankEl.addEventListener('click', (ev) => { ev.preventDefault(); openGamesRankModal(); });
}

function gamesResolveActiveAccountName(active) {
  if (!active) return 'Bez profilu';
  const id = String(active.id || active.account_number || active.accountNumber || '').trim();
  const candidates = [
    active.name,
    active.full_name,
    active.fullName,
    active.player_name,
    active.playerName,
    active.nickname,
    active.username
  ];
  const isUsableName = (value) => {
    const text = String(value || '').trim();
    if (!text) return false;
    if (id && (text === id || text === ('Hráč ' + id))) return false;
    if (/^\d{1,8}$/.test(text)) return false;
    return true;
  };
  for (const value of candidates) {
    if (isUsableName(value)) return String(value).trim();
  }
  try {
    if (typeof tttGetAccountDisplayName === 'function' && id) {
      const resolved = String(tttGetAccountDisplayName(id) || '').trim();
      if (isUsableName(resolved)) return resolved;
    }
  } catch (err) {}
  const lists = [];
  try { if (Array.isArray(window.GAMES_ACCOUNT_LIST)) lists.push(window.GAMES_ACCOUNT_LIST); } catch (err) {}
  try { if (typeof GAMES_ACCOUNT_LIST !== 'undefined' && Array.isArray(GAMES_ACCOUNT_LIST)) lists.push(GAMES_ACCOUNT_LIST); } catch (err) {}
  for (const list of lists) {
    try {
      const match = list.find(acc => String(acc && (acc.id || acc.account_number || acc.accountNumber) || '').trim() === id);
      if (!match) continue;
      const resolved = match.name || match.full_name || match.fullName || match.player_name || match.playerName || match.nickname || match.username;
      if (isUsableName(resolved)) return String(resolved).trim();
    } catch (err) {}
  }
  const raw = String(active.name || '').trim();
  return raw || (id ? ('Hráč ' + id) : 'Hráč');
}

function gamesMaybeRefreshProfileName(active) {
  if (!active || !active.id || active.__nameRefreshQueued) return;
  const id = String(active.id || '').trim();
  const raw = String(active.name || '').trim();
  const needsRefresh = !raw || raw === id || raw === ('Hráč ' + id) || /^\d{1,8}$/.test(raw);
  if (!needsRefresh) return;
  active.__nameRefreshQueued = true;
  try {
    if (typeof gamesSyncProfileFromRemote === 'function') {
      Promise.resolve(gamesSyncProfileFromRemote(true)).then(() => {
        try { renderGamesProfileStatus(); } catch (err) {}
      }).catch(() => {});
    }
  } catch (err) {}
}

function renderGamesProfileStatus() {
  const card = document.getElementById('gamesProfileStatusCard');
  const nameEl = document.getElementById('gamesProfileStatusName');
  const metaEl = document.getElementById('gamesProfileStatusMeta');
  const rankEl = document.getElementById('gamesProfileRankBadge');
  const barEl = document.getElementById('gamesProfileRankBar');
  if (!card || !nameEl || !metaEl) return;
  const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
  const active = profile && profile.activeAccountId && profile.accounts ? profile.accounts[profile.activeAccountId] : null;
  card.classList.toggle('isLoggedIn', !!active);

  let nextName = 'Bez profilu';
  let rankText = 'Rank —';
  let metaText = 'Přihlas se ve Více → Nastavení.';
  let pct = 0;

  if (active) {
    nextName = gamesResolveActiveAccountName(active);
    gamesMaybeRefreshProfileName(active);
    const progress = typeof window.gamesBuildProgressSummary === 'function'
      ? window.gamesBuildProgressSummary(active)
      : null;
    const rank = progress && progress.rank ? String(progress.rank) : 'Rank';
    pct = Math.max(0, Math.min(100, Number(progress && progress.rankPct || 0) || 0));
    const remaining = Math.max(0, Number(progress && progress.rankRemaining || 0) || 0);
    const nextRank = progress && progress.nextRank ? String(progress.nextRank) : '';
    rankText = rank;
    metaText = nextRank
      ? (String(Math.round(pct)) + ' % k dalšímu ranku · chybí ' + String(remaining) + ' XP')
      : 'Max rank · ' + String(Math.round(pct)) + ' %';
  }

  if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(nameEl, nextName, 'gamesProfileStatusName');
  else nameEl.textContent = nextName;
  if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(metaEl, metaText, 'gamesProfileStatusMeta');
  else metaEl.textContent = metaText;
  if (rankEl) {
    // Profilový badge drží aktuální rank bez zbytečného překreslování.
    rankEl.innerHTML = '<span class="gamesProfileRankValue">' + escapeHtml(rankText) + '</span>';
    rankEl.setAttribute('data-player-name', nextName);
    rankEl.disabled = false;
    bindGamesRankBadge();
  }
  if (barEl) barEl.style.setProperty('--fill', String(Math.round(pct)) + '%');
}

function openGamesAppearanceSettings(kind) {
  showPage('menu');
  openAppMenu('settings');
  if (typeof setBottomNavActive === 'function') setBottomNavActive('menu');
  setTimeout(() => {
    const id = kind === 'background' ? 'appMenuBackgroundAccordion' : 'appMenuThemeAccordion';
    const el = document.getElementById(id);
    if (el) el.open = true;
  }, 80);
}

function renderGamesAppearanceStatus() {
  const card = document.getElementById('gamesAppearanceCard');
  if (!card) return;
  const meta = document.getElementById('gamesAppearanceMeta');
  const themeBtn = document.getElementById('gamesThemeQuickBtn');
  const bgBtn = document.getElementById('gamesBackgroundQuickBtn');
  const themeId = typeof getThemePreference === 'function' ? getThemePreference() : 'default';
  const bgId = typeof getBackgroundPreference === 'function' ? getBackgroundPreference() : 'ios-mesh';
  const theme = (Array.isArray(window.RAK_THEME_DEFS) ? window.RAK_THEME_DEFS : []).find(x => String(x.id || '') === String(themeId)) || { label: themeId || 'Výchozí' };
  const bg = (Array.isArray(window.RAK_BACKGROUND_DEFS) ? window.RAK_BACKGROUND_DEFS : []).find(x => String(x.id || '') === String(bgId)) || { label: bgId || 'Výchozí' };
  const text = 'Theme: ' + String(theme.label || themeId || 'Výchozí') + ' · Pozadí: ' + String(bg.label || bgId || 'Výchozí');
  if (meta) meta.textContent = text;
  if (themeBtn && !themeBtn.dataset.bound) { themeBtn.dataset.bound = '1'; themeBtn.addEventListener('click', (ev) => { ev.preventDefault(); openGamesAppearanceSettings('theme'); }); }
  if (bgBtn && !bgBtn.dataset.bound) { bgBtn.dataset.bound = '1'; bgBtn.addEventListener('click', (ev) => { ev.preventDefault(); openGamesAppearanceSettings('background'); }); }
}


function readSupabaseKeepaliveStatusForUi() {
  try {
    if (typeof window.getSupabaseKeepaliveStatus === 'function') {
      const status = window.getSupabaseKeepaliveStatus();
      if (status && typeof status === 'object') return status;
    }
  } catch (err) {}
  try {
    const raw = localStorage.getItem('rak_supabase_keepalive_v1');
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === 'object') {
      return Object.assign({ source: 'localStorage' }, parsed);
    }
  } catch (err) {}
  return null;
}

function formatRakLocalDateTime(value) {
  const raw = String(value || '').trim();
  if (!raw || raw === 'zatím nic' || raw === '—') return raw || 'zatím nic';
  const d = new Date(raw);
  if (!Number.isFinite(d.getTime())) return raw;
  try {
    return new Intl.DateTimeFormat('cs-CZ', {
      timeZone: 'Europe/Prague',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(d).replace(',', '') + ' (Praha)';
  } catch (err) {
    return d.toLocaleString('cs-CZ') + ' (lokálně)';
  }
}

function formatSupabaseKeepaliveLine(status) {
  const st = status && typeof status === 'object' ? status : null;
  if (!st) return 'Supabase heartbeat: zatím bez dat';
  const label = String(st.label || st.status || 'neznámá');
  const lastOk = formatRakLocalDateTime(st.lastSuccessAt || 'zatím nic');
  const lastError = String(st.lastErrorMessage || st.lastErrorCode || 'žádná');
  const attempts = String(st.attempts || 0) + '/' + String(st.successes || 0) + '/' + String(st.failures || 0) + '/' + String(st.skips || 0);
  const reason = String(st.lastReason || st.lastSkipReason || '—');
  const transport = String(st.lastTransport || '—');
  const kind = String(st.lastClassification || '—');
  return 'Supabase heartbeat: ' + label + ' · poslední OK ' + lastOk + ' · chyba ' + lastError + ' · pokusy/OK/chyby/skip ' + attempts + ' · důvod ' + reason + ' · cesta ' + transport + ' · typ ' + kind;
}

function buildSupabaseKeepaliveStatusHtml(options) {
  const opts = options && typeof options === 'object' ? options : {};
  const includeButton = !!opts.includeButton;
  const status = readSupabaseKeepaliveStatusForUi();
  const label = status ? String(status.label || status.status || 'neznámá') : 'zatím bez dat';
  const stateClass = status && status.status === 'ok' ? ' isOk' : (status && (status.status === 'possibly_paused' || status.status === 'unavailable') ? ' isWarn' : '');
  const lastOk = status ? formatRakLocalDateTime(status.lastSuccessAt || 'zatím nic') : 'zatím nic';
  const lastError = status ? String(status.lastErrorMessage || status.lastErrorCode || 'žádná') : 'žádná';
  const counts = status ? (String(status.attempts || 0) + '/' + String(status.successes || 0) + '/' + String(status.failures || 0) + '/' + String(status.skips || 0)) : '0/0/0/0';
  const reason = status ? String(status.lastReason || status.lastSkipReason || '—') : '—';
  const transport = status ? String(status.lastTransport || '—') : '—';
  const kind = status ? String(status.lastClassification || '—') : '—';
  const rows = [
    '<div class="appMenuCard appMenuKeepaliveCard">',
    '  <div class="appMenuCardTitle">Supabase heartbeat</div>',
    '  <div class="appMenuVersion' + stateClass + '">Stav: ' + escapeHtml(label) + '</div>',
    '  <div class="smallText">Poslední OK: ' + escapeHtml(lastOk) + '</div>',
    '  <div class="smallText">Poslední chyba: ' + escapeHtml(lastError) + '</div>',
    '  <div class="smallText">Pokusy / OK / chyby / skip: ' + escapeHtml(counts) + ' · důvod: ' + escapeHtml(reason) + '</div>',
    '  <div class="smallText">Cesta: ' + escapeHtml(transport) + ' · typ: ' + escapeHtml(kind) + '</div>'
  ];
  if (includeButton) rows.push('  <button type="button" class="appMenuAction appMenuSettingBtn" data-menu-action="supabase-heartbeat-now">Otestovat heartbeat teď</button>');
  rows.push('</div>');
  return rows.join('');
}

function buildAppHistoryHtml(versionText) {
  const sections = [
    {
      range: 'v.1.2 1.1–1.29',
      title: 'Nové číslování a velký refactor',
      lines: [
        'Přešlo se na číslování RaK 1.2, sjednotily se verze v aplikaci, cache, service workeru, ZIPu a GitHub hlavičkách.',
        'Velké části aplikace se rozdělily do menších modulů: menu, navigace, hry, theme, PWA, audity a Excel import.'
      ]
    },
    {
      range: 'v.1.1 951–1000',
      title: 'Dashboard, Piškvorky a mobilní ladění',
      lines: [
        'Ladily se Piškvorky, dashboard, spodní lišta, mobilní rozložení a přehled připojení v administraci.',
        'Přibylo víc provozních kontrol, lepší práce s Top score a bezpečnější pravidla pro vydání ZIPu.'
      ]
    },
    {
      range: 'v.1.1 901–950',
      title: 'Glass UI, stabilita a provoz',
      lines: [
        'Dashboard a hlavní panely dostaly čistší glass styl, oznámení a lepší chování na různých mobilech.',
        'Zpřesnila se kantýna, jídelna, profily, achievementy, cache a Supabase heartbeat.'
      ]
    },
    {
      range: 'v.1.1 851–900',
      title: 'Audity, PWA a export',
      lines: [
        'Vznikly read-only audity pro boot, runtime, storage, Supabase, DOM, namespace, export a release kontroly.',
        'PWA/export se uklidil na kořenové soubory + assets/ a začaly se hlídat chybějící soubory v cache.'
      ]
    },
    {
      range: 'v.1.1 801–850',
      title: 'Online hry a Supabase vrstva',
      lines: [
        'Online Piškvorky a Lodě dostaly stabilnější pozvánky, role hráčů, deep-link flow a kontrolu tahů.',
        'Supabase heartbeat se přesunul na RPC/app_keepalive a diagnostika začala ukazovat čitelnější stav.'
      ]
    },
    {
      range: 'v.1.1 751–800',
      title: 'Korekce, kalkulačky a administrace',
      lines: [
        'Rozšiřovaly se korekce pro Soustruhy, Frézky a Brusy včetně strojních hodnot a obrázkových nápověd.',
        'Administrace rozpisů dostala stabilnější editor, ukládání, odebrání lidí a lepší použitelnost na mobilu.'
      ]
    },
    {
      range: 'v.1.1 700–742',
      title: 'Importy, statistiky a hry',
      lines: [
        'Dotažený import Excelu podle měsíčních listů, online ukládání rozpisů a přepínání let.',
        'Statistiky hlídají správný rok, fond 2025, průběžný rok 2026 a pravidlo TNKS01/TPKW01.'
      ]
    },
    {
      range: 'v.1.1 650–699',
      title: 'Velké herní ladění',
      lines: [
        'Piškvorky, 2048, Had, Flappy Car a další hry prošly mobile-first úpravami.',
        'Hry dostaly lepší dotykové ovládání, výsledky, achievementy, Top výsledky a herní profily.'
      ]
    },
    {
      range: 'v.1.1 600–649',
      title: 'Stabilizace a výkon',
      lines: [
        'Dokončoval se PWA/service worker hardening, security/render cleanup a readiness kontroly.',
        'Přibyly výkonové pojistky pro slabší zařízení a lepší diagnostika.'
      ]
    },
    {
      range: 'v.1.1 550–599',
      title: 'Data a online vrstva',
      lines: [
        'Zrychlovala se lokální cache, omezovaly zbytečné rendery a zlepšovala práce s uloženými daty.',
        'Online synchronizace dostala frontu, retry/backoff, deduplikaci a fallback cache.'
      ]
    },
    {
      range: 'v.1.1 500–549',
      title: 'Kalkulačky a odlehčení UI',
      lines: [
        'Kalkulačky se sjednotily přes calcPanel systém a ladily se výšky, tlačítka, indexy i rozdělané dávky.',
        'Láďův režim začal šetřit náročné efekty, stíny a animace.'
      ]
    },
    {
      range: 'v.1.0 450–499',
      title: 'Příprava refactoru',
      lines: [
        'Upevnil se postup práce: pokračovat z posledního potvrzeného buildu a safepoint použít jen na pokyn.',
        'Začaly se řešit duplicity, přebíjení stylů, technický dluh a bezpečnější guardy.'
      ]
    },
    {
      range: 'v.1.0 400–449',
      title: 'Hry a online data',
      lines: [
        'Rozšířily se hráčské profily, herní statistiky, leaderboardy a vazba na Supabase.',
        'Začal větší herní plán a přesun her do jednotného hubu.'
      ]
    },
    {
      range: 'v.1.0 350–399',
      title: 'Herní hub a přehledy',
      lines: [
        'Ladily se hry, spodní lišta, Rotace a Statistiky.',
        'Přibyly herní moduly, online pozvánky a lepší návrat do rozehrané hry.'
      ]
    },
    {
      range: 'v.1.0 300–349',
      title: 'PWA a cache',
      lines: [
        'Vznikal stabilnější PWA základ: service worker, manifest, offline fallback a aktualizační hooky.',
        'Rozdělovaly se části inline skriptů do samostatnějších modulů.'
      ]
    },
    {
      range: 'v.1.0 250–299',
      title: 'Dashboard a kalkulačky',
      lines: [
        'Dashboard se rozšířil o směny, absenci, průběh směny, výplatu, kantýnu a jídelnu.',
        'Kalkulačky pro Frézky a Brusy se zpřesňovaly v časech, dávkách a hotových kusech.'
      ]
    },
    {
      range: 'v.1.0 200–249',
      title: 'Vícestránková appka',
      lines: [
        'Aplikace se posouvala do stabilnější struktury s Dashboardem, Rotací, Rozpisy, Statistikami a Kalkulačkami.',
        'Začalo se víc řešit ukládání dat, export, build verze a návaznost mezi ZIPy.'
      ]
    },
    {
      range: 'v.0.xx až v.1.0 199',
      title: 'Základ projektu',
      lines: [
        'Vznikl základ směnové logiky, dashboardu, prvních kalkulaček a pracovních přehledů.',
        'Postupně přibyla potřeba pevnějších pravidel verzí, safepointů a bezpečnějšího refactoru.'
      ]
    }
  ];

  return [
    '<div class="appMenuHistory">',
    sections.map(section => [
      '<div class="appMenuHistoryGroup">',
      '  <div class="appMenuHistoryRange">' + escapeHtml(section.range) + '</div>',
      '  <div class="appMenuHistoryTitle">' + escapeHtml(section.title) + '</div>',
      '  <div class="appMenuHistoryList">' + (section.lines || []).map(line => '<div class="appMenuHistoryItem">' + escapeHtml(line) + '</div>').join('') + '</div>',
      '</div>'
    ].join('')).join(''),
    '</div>'
  ].join('');
}


// RaK 1.2 (1.116) – Administrace / Rozpisy a Nastavení strojů jsou oddělené v admin-rotation.js.




// RaK 1.2 (1.116) – Administrace / Reporty chyb jsou oddělené v admin-reports.js.

// RaK 1.2 (1.116) – Administrace / Přehled připojení, servis a oznámení jsou oddělené v admin-service-usage.js.


// RaK 1.2 (1.116) – App menu / administrace shell / bug report formulář jsou oddělené v app-menu.js.

// RaK 1.2 (1.116) – showFoodSchedule je v app-navigation.js.



function setRotaceNamesDockPortalActive(active, reason) {
  try {
    const grid = document.getElementById('namesGrid');
    const panel = document.getElementById('rotaceNamesPanel');
    if (!grid) return false;
    let marker = document.getElementById('namesGridHomeMarker');
    if (!marker && panel && grid.parentNode === panel) {
      marker = document.createElement('span');
      marker.id = 'namesGridHomeMarker';
      marker.hidden = true;
      panel.insertBefore(marker, grid);
    }
    if (active) {
      document.body.classList.add('rakRotaceNamesDockActive');
      document.documentElement.classList.add('rakRotaceNamesDockActive');
      grid.setAttribute('data-rak-dock-portal', 'body-fixed');
      grid.setAttribute('data-rak-dock-reason', String(reason || 'rotace'));
      if (grid.parentNode !== document.body) document.body.appendChild(grid);
    } else {
      document.body.classList.remove('rakRotaceNamesDockActive');
      document.documentElement.classList.remove('rakRotaceNamesDockActive');
      grid.removeAttribute('data-rak-dock-reason');
      if (marker && marker.parentNode && grid.parentNode === document.body) {
        marker.parentNode.insertBefore(grid, marker.nextSibling);
        grid.removeAttribute('data-rak-dock-portal');
      }
    }
    return true;
  } catch (err) {
    try { console.warn('setRotaceNamesDockPortalActive failed', err); } catch (_) {}
    return false;
  }
}
try { window.setRotaceNamesDockPortalActive = setRotaceNamesDockPortalActive; } catch (err) {}

function updateRotaceNamesDockMetrics(reason) {
  const result = {
    ok: true,
    reason: String(reason || 'manual'),
    checkedAt: new Date().toISOString(),
    mode: 'static-css-bottom-v1-2-1-9',
    bottomPx: 0,
    maxHeightPx: 0,
    contentBottomPx: 0,
    navHeightPx: 0,
    viewportHeightPx: 0,
    viewportWidthPx: 0,
    cssLocked: true
  };
  try {
    const root = document.documentElement;
    const nav = document.querySelector('nav.bottomNav') || document.querySelector('.bottomNav');
    const grid = document.getElementById('namesGrid');
    const navRect = nav && typeof nav.getBoundingClientRect === 'function' ? nav.getBoundingClientRect() : null;
    const viewport = window.visualViewport || null;
    const vh = Math.round(Number(viewport && viewport.height || window.innerHeight || root.clientHeight || 720) || 720);
    const vw = Math.round(Number(viewport && viewport.width || window.innerWidth || root.clientWidth || 390) || 390);
    const navHeightRaw = navRect ? Math.ceil(Number(navRect.height || 0) || 0) : 0;
    const gridStyles = grid && window.getComputedStyle ? window.getComputedStyle(grid) : null;
    const parsePx = (value) => {
      const n = parseFloat(String(value || '').replace(',', '.'));
      return Number.isFinite(n) ? Math.round(n) : 0;
    };
    result.bottomPx = gridStyles ? parsePx(gridStyles.bottom) : 0;
    result.maxHeightPx = gridStyles ? parsePx(gridStyles.maxHeight) : 0;
    result.contentBottomPx = parsePx((window.getComputedStyle ? getComputedStyle(root).getPropertyValue('--rak-rotace-names-content-bottom') : '') || '0');
    result.navHeightPx = navHeightRaw;
    result.viewportHeightPx = vh;
    result.viewportWidthPx = vw;
    root.dataset.rakRotaceNamesDockReady = '1';
    root.dataset.rakRotaceNamesDockReason = result.reason;
    root.dataset.rakRotaceNamesDockBottom = String(result.bottomPx || 'css');
    root.dataset.rakRotaceNamesDockMaxHeight = String(result.maxHeightPx || 'css');
  } catch (err) {
    result.ok = false;
    result.error = String(err && err.message || err);
  }
  try { window.__rakRotaceNamesDockMetrics = result; } catch (err) {}
  return result;
}

function scheduleRotaceNamesDockMetrics(reason) {
  // v1003: už nepřepisujeme polohu doku jmen z JS podle visualViewportu.
  // iOS po otevření mění viewport a stará metrika tím dock po chvíli vytahovala nahoru.
  try {
    const root = document.documentElement;
    if (root && root.dataset) root.dataset.rakRotaceNamesDockMode = 'static-css-bottom-v1-2-1-9';
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => { try { updateRotaceNamesDockMetrics(reason || 'static-css-bottom-v1-2-1-9'); } catch (err) {} });
    }
    return updateRotaceNamesDockMetrics(reason || 'static-css-bottom-v1-2-1-9');
  } catch (err) {
    try { return updateRotaceNamesDockMetrics(reason || 'static-css-bottom-v1-2-1-9-fallback'); } catch (_) { return null; }
  }
}

if (!window.__rakRotaceNamesDockMetricsBound) {
  window.__rakRotaceNamesDockMetricsBound = true;
  try { window.addEventListener('resize', () => scheduleRotaceNamesDockMetrics('window-resize'), { passive: true }); } catch (err) {}
  try { window.addEventListener('orientationchange', () => scheduleRotaceNamesDockMetrics('orientationchange'), { passive: true }); } catch (err) {}
  // v1003: Rotace dock nesmí po kliknutí viditelně poskočit kvůli iOS visualViewport usazování.
  // Přeměření podle visualViewportu tu už nepoužíváme; poloha je pevná v CSS.
  try { document.addEventListener('DOMContentLoaded', () => scheduleRotaceNamesDockMetrics('dom-ready'), { once: true }); } catch (err) {}
}
try { window.updateRotaceNamesDockMetrics = updateRotaceNamesDockMetrics; } catch (err) {}
try { window.scheduleRotaceNamesDockMetrics = scheduleRotaceNamesDockMetrics; } catch (err) {}


// RaK 1.2 (1.116) – showPage, home refresh, externí dlaždice a rotace/kalkulačky zkratky jsou v app-navigation.js.


function setRotaceView(view) {
  app.rotationView = view;
  const namesPanel = document.getElementById('rotaceNamesPanel');
  const statsPanel = document.getElementById('rotaceStatsPanel');
  const monthsPanel = document.getElementById('rotaceMonthsPanel');
  const rotaceTitle = document.getElementById('rotacePageTitle');
  const rotaceBackBtn = document.getElementById('rotaceBackBtn');
  const tabNames = document.getElementById('tabNames');
  const tabStats = document.getElementById('tabStats');
  const tabMonths = document.getElementById('tabMonths');

  [namesPanel, statsPanel, monthsPanel].forEach(panel => panel && panel.classList.remove('active'));
  [tabNames, tabStats, tabMonths].forEach(tab => tab && (tab.style.outline = 'none'));

  if (rotaceTitle) {
    if (view === 'stats') {
      rotaceTitle.textContent = 'Statistiky';
    } else if (view === 'months') {
      rotaceTitle.textContent = 'Rozpisy';
    } else {
      rotaceTitle.textContent = 'Rotace';
    }
  }
  if (rotaceBackBtn) {
    const showBack = view === 'stats' || view === 'months';
    rotaceBackBtn.hidden = !showBack;
    rotaceBackBtn.style.display = showBack ? 'inline-grid' : 'none';
  }

  if (view === 'names') {
    namesPanel && namesPanel.classList.add('active');
    if (typeof setRotaceNamesDockPortalActive === 'function') setRotaceNamesDockPortalActive(true, 'setRotaceView-names');
    if (typeof scheduleRotaceNamesDockMetrics === 'function') scheduleRotaceNamesDockMetrics('setRotaceView-names');
    tabNames && (tabNames.style.outline = '3px solid #7CFF7C');
  } else if (view === 'stats') {
    if (typeof setRotaceNamesDockPortalActive === 'function') setRotaceNamesDockPortalActive(false, 'setRotaceView-stats');
    statsPanel && statsPanel.classList.add('active');
    tabStats && (tabStats.style.outline = '3px solid #7CFF7C');
  } else {
    if (typeof setRotaceNamesDockPortalActive === 'function') setRotaceNamesDockPortalActive(false, 'setRotaceView-months');
    monthsPanel && monthsPanel.classList.add('active');
    tabMonths && (tabMonths.style.outline = '3px solid #7CFF7C');
  }
}


// RaK 1.2 (1.116) – Food/kalendář modaly a vazba dashboard kalendáře jsou v app-navigation.js.


// RaK 1.2 (1.116) – Games hub + account profile jsou oddělené v games-profile.js.

// RaK 1.2 (1.116) – Klasické hry 2048 / Had / Flappy Car jsou oddělené v games-classic.js.

function renderGamesTttShell() {

  const body = document.getElementById('gamesShellBody');
  if (!body) return;
  body.innerHTML = [
    '<div class="gameInfoRow"><span>Piškvorky běží na celou obrazovku.</span><span>Online pozvánka se řeší až ve hře.</span></div>',
    '<div class="gamesShell uPad12 uMt10">',
    '  <div class="smallText">Spusť hru a v online režimu vytvoř pozvánku. Kopírování a sdílení se ukáže až v čekacím okně na soupeře.</div>',
    '  <div class="gameControls uMt10">',
    '    <button type="button" class="gameControlBtn" id="openTttOverlayBtn">Otevřít piškvorky</button>',
    '  </div>',
    '</div>'
  ].join('');
  body.querySelector('#openTttOverlayBtn')?.addEventListener('click', openTicTacToeGame);
}



function shipsReadUrlInviteData() {
  try {
    const readFrom = (text, source) => {
      const raw = String(text || '');
      if (!raw) return null;
      const isShips = /(?:^|[?#&])(?:games|game)=ships(?:$|[&#=])|(?:^|[?#&])(?:shipsInvite|ships|battleship)=/i.test(raw);
      if (!isShips) return null;
      const code = typeof tttFindInviteCodeInParamText === 'function' ? tttFindInviteCodeInParamText(raw) : '';
      return code ? { code, source } : null;
    };
    return readFrom(window.location.hash || '', 'hash') || readFrom(window.location.search || '', 'query') || { code: '', source: '' };
  } catch (err) { return { code: '', source: '' }; }
}
function shipsClearInviteFromUrl() {
  try {
    const url = new URL(window.location.href);
    ['invite', 'code', 'shipsInvite', 'ships', 'battleship'].forEach(key => url.searchParams.delete(key));
    if (/games=ships|game=ships|shipsInvite=|battleship=|invite=|code=/i.test(url.hash || '')) url.hash = '';
    history.replaceState(history.state, document.title, url.toString());
  } catch (err) {}
}
async function shipsAutoOpenFromHash() {
  const invite = shipsReadUrlInviteData();
  const code = invite && invite.code ? String(invite.code).replace(/\D/g, '').slice(0, 4) : '';
  if (!code) return false;
  if (typeof window.openShipsFromInviteCode !== 'function') return false;
  const opened = await window.openShipsFromInviteCode(code, { source: invite.source || 'url' });
  if (opened) shipsClearInviteFromUrl();
  return !!opened;
}

if (!window.__tttHashInviteBound) {
  window.__tttHashInviteBound = true;
  const openGameInviteFromUrl = async () => {
    const shipsOpened = await shipsAutoOpenFromHash();
    if (!shipsOpened) await tttAutoOpenFromHash();
  };
  window.addEventListener('load', () => { void openGameInviteFromUrl(); }, { once: true });
  window.addEventListener('hashchange', () => { void openGameInviteFromUrl(); });
  window.addEventListener('popstate', () => { void openGameInviteFromUrl(); });
}



// RaK 1.2 (1.116) – Theme, pozadí a profilové UI nastavení jsou oddělené v appearance-theme.js.

function getRakRotaceNamesDockHealth() {
  const result = {
    ok: true,
    version: window.APP_VERSION || '1.2 (1.116)',
    mode: 'rotace-names-dock-stable-css-v930',
    checkedAt: new Date().toISOString(),
    scope: 'Rotace / seznam jmen / stabilní spodní dock',
    expected: {
      position: 'fixed se stabilní CSS rezervou bez opožděného přepisu pozice',
      noJump: true,
      visibleOnSmallMobiles: true,
      rootFolderChange: false,
      onlineFlowChange: false
    },
    manual: {
      mobileVisualSmoke: 'manual',
      note: 'Ověřit na mobilu, že seznam jmen po otevření Rotace necukne, má původní větší dlaždice a zůstane viditelný nad spodním panelem.'
    }
  };
  try {
    if (typeof updateRotaceNamesDockMetrics === 'function') updateRotaceNamesDockMetrics('health-check');
    const grid = document.getElementById('namesGrid');
    const rotace = document.getElementById('rotace');
    const nav = document.querySelector('nav.bottomNav') || document.querySelector('.bottomNav');
    const styles = grid && window.getComputedStyle ? window.getComputedStyle(grid) : null;
    const metrics = window.__rakRotaceNamesDockMetrics || null;
    result.dom = {
      hasRotacePage: !!rotace,
      hasNamesGrid: !!grid,
      hasBottomNav: !!nav,
      isRotaceActive: !!(rotace && rotace.classList && rotace.classList.contains('active')),
      namesGridPosition: styles ? styles.position : '',
      namesGridBottom: styles ? styles.bottom : '',
      namesGridMaxHeight: styles ? styles.maxHeight : '',
      metrics
    };
    result.ok = !!(rotace && grid && nav);
    if (rotace && rotace.classList && rotace.classList.contains('active') && styles && styles.position !== 'fixed') result.ok = false;
  } catch (err) {
    result.ok = false;
    result.error = String(err && err.message || err);
  }
  return result;
}
window.getRakRotaceNamesDockHealth = getRakRotaceNamesDockHealth;


// RaK 1.2 (1.116) – resize/orientation hlídání aktivního glass indikátoru spodní lišty je v app-navigation.js.

