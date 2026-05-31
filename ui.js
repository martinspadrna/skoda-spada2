function centerBottomNavButton(btn) {
  if (!btn) return;
  try {
    const scroller = btn.closest('.bottomNavScroll') || btn.closest('.bottomNav');
    if (!scroller || typeof scroller.scrollTo !== 'function') return;
    const btnRect = btn.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const targetLeft = scroller.scrollLeft + (btnRect.left - scrollerRect.left) - ((scrollerRect.width - btnRect.width) / 2);
    scroller.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
  } catch (err) {}
}

function resetPageScrollToTop(pageId, reason) {
  try {
    if (typeof document === 'undefined') return;
    if (document.body && (document.body.classList.contains('gamesOpen') || document.body.classList.contains('tttOpen'))) return;
    const el = pageId ? document.getElementById(pageId) : document.querySelector('.page.active');
    const run = () => {
      try {
        const root = document.scrollingElement || document.documentElement || document.body;
        if (root && typeof root.scrollTo === 'function') root.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        else if (root) root.scrollTop = 0;
        if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') window.scrollTo(0, 0);
        if (el && typeof el.scrollTo === 'function') el.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        else if (el) el.scrollTop = 0;
        window.__rakLastPageScrollReset = { page: pageId || '', reason: reason || '', ts: Date.now() };
      } catch (err) {}
    };
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => requestAnimationFrame(run));
    } else {
      setTimeout(run, 0);
    }
  } catch (err) {
    console.warn('resetPageScrollToTop failed', err);
  }
}


function ensurePageScrollAvailable(pageId, reason) {
  try {
    if (typeof document === 'undefined' || !document.body) return;
    const hasVisibleModal = !!document.querySelector('.foodScheduleOverlay.isVisible, .personScheduleOverlay.isVisible, .calendarOverlay.isVisible, .tttOverlay.isVisible, .qrModalOverlay.isVisible');
    const isGameOpen = document.body.classList.contains('gamesOpen') || document.body.classList.contains('tttOpen');
    if (!hasVisibleModal && !isGameOpen) {
      document.body.classList.remove('foodModalOpen', 'personModalOpen', 'calendarModalOpen');
      if (document.body.style && document.body.style.overflow === 'hidden') document.body.style.overflow = '';
      if (document.documentElement && document.documentElement.style) document.documentElement.style.overflowY = 'auto';
      if (document.body.style) document.body.style.overflowY = 'auto';
    }

    const id = String(pageId || '').trim();
    if (id === 'brusy' || id === 'soustruhy' || id === 'frezky' || id === 'kalkulacky') {
      const page = document.getElementById(id);
      if (page && page.style) {
        page.style.overflowY = 'visible';
        page.style.webkitOverflowScrolling = 'touch';
      }
    }
    window.__rakLastScrollGuard = { page: id, reason: reason || '', ts: Date.now() };
  } catch (err) {
    console.warn('ensurePageScrollAvailable failed', err);
  }
}



function ensureBottomNavActiveIndicator() {
  try {
    if (typeof document === 'undefined') return null;
    const rail = document.getElementById('bottomNavScroll');
    if (!rail) return null;
    let indicator = rail.querySelector('.bottomNavActiveIndicator');
    if (!indicator) {
      indicator = document.createElement('span');
      indicator.className = 'bottomNavActiveIndicator';
      indicator.setAttribute('aria-hidden', 'true');
      rail.appendChild(indicator);
    }
    return indicator;
  } catch (err) {
    return null;
  }
}

function updateBottomNavActiveIndicator(reason) {
  try {
    if (typeof document === 'undefined') return false;
    const rail = document.getElementById('bottomNavScroll');
    const indicator = ensureBottomNavActiveIndicator();
    if (!rail || !indicator) return false;
    const active = rail.querySelector('.bottomNavBtn.active');
    if (!active) {
      indicator.style.opacity = '0';
      return false;
    }
    const railRect = rail.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const left = Math.max(0, activeRect.left - railRect.left + rail.scrollLeft);
    const width = Math.max(20, activeRect.width);
    indicator.style.setProperty('--rak-nav-indicator-left', left.toFixed(2) + 'px');
    indicator.style.setProperty('--rak-nav-indicator-width', width.toFixed(2) + 'px');
    indicator.style.opacity = '1';
    indicator.dataset.reason = String(reason || 'active');
    return true;
  } catch (err) {
    return false;
  }
}

function scheduleBottomNavActiveIndicator(reason) {
  try {
    const run = () => updateBottomNavActiveIndicator(reason || 'scheduled');
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => requestAnimationFrame(run));
    } else {
      setTimeout(run, 0);
    }
  } catch (err) {}
}

function setBottomNavActive(pageId) {
  const buttons = document.querySelectorAll('.bottomNavBtn');
  buttons.forEach(btn => {
    const isActive = btn.dataset.page === pageId;
    btn.classList.toggle('active', isActive);
    if (isActive && btn.dataset.page !== 'menu') {
      centerBottomNavButton(btn);
    }
  });
  scheduleBottomNavActiveIndicator('setBottomNavActive:' + String(pageId || ''));
}

function appGoBackFromGesture() {
  try {
    const activePage = document.querySelector('.page.active')?.id || 'home';
    if (document.body.classList.contains('tttOpen') && typeof closeTicTacToeGame === 'function') {
      closeTicTacToeGame();
      return true;
    }
    if (typeof app !== 'undefined' && app.activeGameShell) {
      openGamesPage();
      return true;
    }
    if (activePage === 'menu') {
      hideAppMenu();
      showPage('home');
      return true;
    }
    if (activePage === 'games') {
      showPage('home');
      return true;
    }
    if (activePage === 'rotace') {
      if (typeof app !== 'undefined') {
        if (app.selectedName) {
          app.selectedName = null;
          app.nameTapState = { name: '', count: 0, lastTap: 0 };
          renderRotace();
          return true;
        }
        if (app.selectedStatsName || app.selectedStatsMachine) {
          app.selectedStatsName = null;
          app.selectedStatsMachine = null;
          if (typeof renderStatsPanel === 'function') renderStatsPanel();
          return true;
        }
        if (app.rotationView && app.rotationView !== 'names') {
          setRotaceView('names');
          renderRotace();
          return true;
        }
        if (app.selectedMonth) {
          app.selectedMonth = null;
          renderRotace();
          return true;
        }
      }
      showPage('home');
      return true;
    }
    if (['jidlo', 'soustruhy', 'brusy', 'frezky', 'kalkulacky', 'statistiky'].includes(activePage)) {
      showPage('home');
      return true;
    }
    if (activePage !== 'home') {
      showPage('home');
      return true;
    }
  } catch (err) {
    console.warn('appGoBackFromGesture failed', err);
  }
  return false;
}

(function installAppBackGesture() {
  if (window.__rotaceAppBackGestureBound) return;
  window.__rotaceAppBackGestureBound = true;
  let startX = 0;
  let startY = 0;
  let active = false;
  const reset = () => { active = false; };
  document.addEventListener('touchstart', (ev) => {
    if (!ev.touches || ev.touches.length !== 1) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes((ev.target && ev.target.tagName) || '')) return;
    const touch = ev.touches[0];
    if (!touch || touch.clientX > 26) return;
    startX = touch.clientX;
    startY = touch.clientY;
    active = true;
  }, { passive: true });
  document.addEventListener('touchend', (ev) => {
    if (!active) return;
    const touch = ev.changedTouches && ev.changedTouches[0];
    reset();
    if (!touch) return;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (dx < 72 || Math.abs(dy) > 60 || dx <= Math.abs(dy) * 1.15) return;
    appGoBackFromGesture();
  }, { passive: true });
  document.addEventListener('touchcancel', reset, { passive: true });
})();


// 1.2 (1.13): Více/menu shell je oddělený v app-menu.js.

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

// 1.2 (1.13): Piškvorky jsou oddělené v games-gomoku.js.

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
      range: 'v.1.5 951–1000',
      title: 'Piškvorky, Dashboard a administrace',
      lines: [
        'Piškvorky mají vlastní ruleset verzi oddělenou od verze aplikace, silnější offline AI s forcing prioritami a žebříček filtrovaný podle aktuálních pravidel.',
        'Dashboard se průběžně ladí pro různé mobilní displeje a administrace ukazuje základní přehled připojených zařízení včetně rozlišení.',
        'Spodní navigace se zjednodušila: Rozpisy a Statistiky jsou dostupné z Rotace, dole zůstává víc místa pro hlavní sekce.'
      ]
    },
    {
      range: 'v.1.5 901–950',
      title: 'Stabilizace, glass UI a provozní jistota',
      lines: [
        'Proběhly hlavně audity, release kontroly, PWA/cache úklid, bezpečnější export ZIPu a lepší diagnostika před vydáním.',
        'Dashboard přešel do čistšího glass stylu, přibyl announcement systém a ladily se grafy, profily, hry i mobilní použitelnost.',
        'Kantýna, jídelna, Top score, achievementy a Supabase heartbeat se zpřesnily tak, aby appka líp fungovala běžně v provozu.'
      ]
    },
    {
      range: 'v.1.5 851–900',
      title: 'Auditní základ, PWA/export a reset her',
      lines: [
        'Vznikl read-only auditní základ: boot/runtime/storage/Supabase/DOM/namespace/export kontroly a větší jistota před ZIPem.',
        'PWA a export se uklidily: ikony v assets, ZIP bez vnitřní hlavní složky, export manifest a service worker cache kontroly.',
        'Supabase heartbeat drží Free projekt aktivní přes RPC/app_keepalive a aplikace zůstává použitelná offline.',
        'Top score se začalo filtrovat podle skutečného času odehrání výsledku, aby se staré score nevracelo přes updated_at.'
      ]
    },
    {
      range: 'v.1.5 801–850',
      title: 'Online hry, Supabase a PWA úklid',
      lines: [
        'Online Piškvorky a Lodě dostaly stabilnější pozvánky, role hráčů, move guard, deep-link flow a vzájemné skóre bez ručního přepínání.',
        'Supabase heartbeat se přesunul na RPC/app_keepalive a Diagnostika ukazuje čitelný lokální stav bez matoucího UTC.',
        'Supabase hardening se posunul jen bezpečnými kroky: RPC smoke/readiness kontroly bez naslepo utažených game_invites/game_sessions policies.',
        'PWA ikony se přesunuly do assets/app-icons, ZIP se vyčistil na root soubory + assets/ a SQL skripty se přesunuly do assets/docs/sql.',
        'Spodní lišta a Láďův režim dostaly drobné vizuální/výkonové opravy bez změny běžného glass režimu.'
      ]
    },
    {
      range: 'v.1.5 751–800',
      title: 'Korekce, administrace a spodní lišta',
      lines: [
        'Výpočet kusů a Korekce se oddělily; přibyla Pračka, konicita/fhβ pro Frézky a osa X vrtáků 3/7 pro Soustruhy.',
        'Frézky a Soustruhy dostaly obrázkové nápovědy, stručnější výsledky a strojní hodnoty napojené na administraci / machine_settings.',
        'Sudoku, Pexeso, XP/ranky a Top výsledky se sjednotily podle obtížnosti, velikosti a dokončených her.',
        'Administrace rozpisů má stabilnější lokální editor, sticky Uložit rozpis, bezpečné Odebrat vybrané a ochrany proti iOS auto-zoomu.',
        'Spodní lišta se postupně usadila jako pevný průhledný glass dock dole; původní ikonky zůstaly, neaktivní položky jsou čistší a aktivní položka má větší glass zvýraznění.'
      ]
    },
    {
      range: 'v.1.1 700–742',
      title: 'Importy, statistiky a hry',
      lines: [
        'Dotažený import Excelu podle měsíčních listů, online ukládání rozpisů a přepínání let.',
        'Statistiky hlídají správný rok, fond 2025, průběžný rok 2026 a pravidlo TNKS01/TPKW01.',
        'Přibyly a ladily se Lodě, Pampuch, správa pozvánek, servisní synchronizace a kontrola aktualizací.'
      ]
    },
    {
      range: 'v.1.1 650–699',
      title: 'Velké herní ladění',
      lines: [
        'Piškvorky, 2048, Snake, Flappy Car, Aim Trainer, Reaction Test, Tetris, Space Shooter, Brick, Doodle a Bubble prošly mobile-first úpravami.',
        'Hry dostaly lepší dotykové ovládání, výsledkové obrazovky, achievementy, Top výsledky a zápis jen po dokončení.',
        'Online hraní, pozvánky, skóre a herní profily se stabilizovaly pro běžné používání.'
      ]
    },
    {
      range: 'v.1.1 600–649',
      title: 'Stabilizace a výkon',
      lines: [
        'Dokončené PWA/service worker hardening, security/render cleanup a finální readiness kontroly.',
        'Přibyly výkonové pojistky pro Láďův režim, méně náročný render a lepší diagnostika.',
        'Supabase vrstva dostala víc kontrol, auditů a bezpečnější chování při syncu.'
      ]
    },
    {
      range: 'v.1.1 550–599',
      title: 'Data a online vrstva',
      lines: [
        'Probíhalo zrychlení lokální cache, omezení zbytečných renderů a bezpečnější práce s uloženými daty.',
        'Online synchronizace dostala frontu, retry/backoff, deduplikaci a fallback cache.',
        'Ladily se profily, herní data, rozpisy a spolehlivější návrat po výpadku internetu.'
      ]
    },
    {
      range: 'v.1.1 500–549',
      title: 'Kalkulačky a odlehčení UI',
      lines: [
        'Kalkulačky se sjednotily přes calcPanel systém a opravovaly se výšky, tlačítka, indexy i rozdělané dávky.',
        'Láďův režim začal šetřit náročné efekty, stíny a animace pro slabší zařízení.',
        'Herní hub dostal cache profilů, výsledků a základ výkonových guardů.'
      ]
    },
    {
      range: 'v.1 450–499',
      title: 'Příprava refactoru',
      lines: [
        'Upevnil se postup práce: pokračovat z posledního potvrzeného buildu a safepoint použít jen na výslovný pokyn.',
        'Začaly se řešit duplicity, přebíjení stylů, technický dluh a bezpečnější guardy.',
        'Mobilní použitelnost šla nahoru přes safe-area, spodní lištu, výšky panelů a čitelnost.'
      ]
    },
    {
      range: 'v.1 400–449',
      title: 'Hry a online data',
      lines: [
        'Rozšířily se hráčské profily, herní statistiky, leaderboardy a vazba na Supabase.',
        'Začal větší herní plán a přesun her do jednotného hubu.',
        'Appka se posouvala k mobilnímu ovládání a menšímu počtu rušivých reloadů.'
      ]
    },
    {
      range: 'v.1 350–399',
      title: 'Herní hub a přehledy',
      lines: [
        'Výrazně se ladily hry, spodní lišta, Rotace a Statistiky.',
        'Přibyly herní moduly, online pozvánky a lepší návrat do rozehrané hry.',
        'Rotace a Statistiky dostaly více dlaždic, menší rozestupy a lepší zobrazení jmen a strojů.'
      ]
    },
    {
      range: 'v.1 300–349',
      title: 'PWA a cache',
      lines: [
        'Vznikal stabilnější PWA základ: service worker, manifest, offline fallback a aktualizační hooky.',
        'Rozdělovaly se části inline skriptů do samostatnějších modulů.',
        'Dashboard, spodní lišta a přihlášení se ladily kvůli stabilnějšímu načítání.'
      ]
    },
    {
      range: 'v.1 250–299',
      title: 'Dashboard a kalkulačky',
      lines: [
        'Dashboard se rozšířil o směny, absenci, průběh směny, výplatu, kantýnu a jídelnu.',
        'Kalkulačky pro Frézky a Brusy se zpřesňovaly v časech, dávkách a hotových kusech.',
        'Mobilní layout se čistil, aby šel používat bez zoomu a bez posouvání mimo obrazovku.'
      ]
    },
    {
      range: 'v.1 200–249',
      title: 'Vícestránková appka',
      lines: [
        'Aplikace se posouvala do stabilnější struktury s Dashboardem, Rotací, Rozpisy, Statistikami a Kalkulačkami.',
        'Začalo se víc řešit ukládání dat, export, build verze a návaznost mezi ZIPy.',
        'Rozpisy a rotace se ladily podle reálného provozu v práci.'
      ]
    },
    {
      range: 'v.0.xx až v.1 199',
      title: 'Základ projektu',
      lines: [
        'Vznikl základ směnové logiky, dashboardu, prvních kalkulaček a pracovních přehledů.',
        'Přidávaly se stroje, jména, směny, první statistiky a základ exportní/logické vrstvy.',
        'Postupně vznikla potřeba pevnějších pravidel verzí, safepointů a bezpečnějšího refactoru.'
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


// 1.2 (1.13): Administrace / Rozpisy a Nastavení strojů jsou oddělené v admin-rotation.js.




// 1.2 (1.13): Administrace / Reporty chyb jsou oddělené v admin-reports.js.

// 1.2 (1.13): Administrace / Přehled připojení, servis a oznámení jsou oddělené v admin-service-usage.js.


// 1.2 (1.13): App menu / administrace shell / bug report formulář jsou oddělené v app-menu.js.

function showFoodSchedule(which) {
  if (typeof app !== 'undefined') {
    app.foodScheduleFocus = which === 'jidelna' ? 'jidelna' : 'kantyna';
  }
  if (typeof renderFoodScheduleModal === 'function') {
    renderFoodScheduleModal();
    const overlay = ensureFoodScheduleModal();
    overlay.classList.add('isVisible');
    document.body.classList.add('foodModalOpen');
    return;
  }
  if (typeof renderFoodSchedulePage === 'function') {
    renderFoodSchedulePage();
  }
  showPage('jidlo');
}



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


function showPage(id) {
  const currentPage = typeof document !== 'undefined' ? document.querySelector('.page.active')?.id || '' : '';
  const isSamePageRefresh = currentPage === id;
  const shouldClosePageModals = id !== 'home' || !isSamePageRefresh;
  if (typeof app !== 'undefined') {
    app.homeBootSuppressed = id !== 'home';
  }
  window.__rotaceManualNavLocked = id !== 'home';
  window.__rotaceHomeBootLocked = id !== 'home';
  window.__rotaceUserNavigated = id !== 'home';
  if (id !== 'home') window.__rotaceHomeBootLocked = true;
  if (id !== 'games' && typeof document !== 'undefined' && document.body.classList.contains('tttOpen')) {
    try {
      if (typeof closeTicTacToeGame === 'function') closeTicTacToeGame();
      else document.body.classList.remove('tttOpen');
    } catch (err) {
      console.warn('close TTT before nav failed', err);
    }
  }

  let navPage = id === 'rotace'
    ? 'rotace'
    : (id === 'brusy' || id === 'soustruhy' || id === 'frezky' || id === 'pracka' || id === 'kalkulacky' || String(id || '').startsWith('korekce-'))
      ? 'kalkulacky'
      : (id === 'jidlo' ? 'home' : id);

  if (id === 'eportal') {
    if (openEportal()) return;
    id = 'home';
    navPage = 'home';
  }

  if (id === 'rotace') {
    try { document.documentElement.classList.add('rakRotaceDockSettling'); } catch (err) {}
  }

  if (typeof setRotaceNamesDockPortalActive === 'function') {
    setRotaceNamesDockPortalActive(id === 'rotace', id === 'rotace' ? 'showPage-pre-rotace' : 'showPage-leave-rotace');
  }

  if (id === 'rotace' && typeof scheduleRotaceNamesDockMetrics === 'function') {
    scheduleRotaceNamesDockMetrics('showPage-pre-rotace');
  }

  if (id === 'games') {
    try {
      if (typeof tttStopOnlineSync === 'function') tttStopOnlineSync();
      if (typeof closeTicTacToeGame === 'function' && document.body.classList.contains('tttOpen')) closeTicTacToeGame();
      if (typeof closeGameShell === 'function' && ((typeof app !== 'undefined' && !!app.activeGameShell) || document.body.classList.contains('gamesOpen'))) closeGameShell();
      if (typeof app !== 'undefined') app.activeGameShell = '';
      document.body.classList.remove('tttOpen');
      document.body.classList.remove('gamesOpen');
    } catch (err) {
      console.warn('games page reset failed', err);
    }
  }

  try {
    if (shouldClosePageModals) {
      const modal = document.getElementById('foodScheduleModal');
      if (modal) {
        modal.classList.remove('isVisible');
        document.body.classList.remove('foodModalOpen');
      }
      const personModal = document.getElementById('personScheduleModal');
      if (personModal) {
        personModal.classList.remove('isVisible');
        document.body.classList.remove('personModalOpen');
      }
      const calendarModal = document.getElementById('calendarModal');
      if (calendarModal) {
        calendarModal.classList.remove('isVisible');
        document.body.classList.remove('calendarModalOpen');
      }
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    if (id === 'menu') {
      openAppMenu('menu');
    }
    const el = document.getElementById(id);
    if (el) el.classList.add('active');

    if (id === 'rotace') {
      try { document.documentElement.classList.remove('rakRotaceEntering'); } catch (err) {}
      if (typeof updateRotaceNamesDockMetrics === 'function') updateRotaceNamesDockMetrics('showPage-before-render');
      if (typeof initRotaceCurrentMonth === 'function') initRotaceCurrentMonth();
      setRotaceView('names');
      if (typeof renderRotace === 'function') renderRotace();
      if (typeof scheduleRotaceNamesDockMetrics === 'function') scheduleRotaceNamesDockMetrics('showPage-after-render');
      try {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          document.documentElement.classList.remove('rakRotaceDockSettling');
        }));
      } catch (err) {
        try { document.documentElement.classList.remove('rakRotaceDockSettling'); } catch (_) {}
      }
      try { document.documentElement.classList.remove('rakRotaceEntering'); } catch (err) {}
    } else if (id === 'brusy') {
      if (typeof renderBrusy === 'function') renderBrusy();
    } else if (id === 'soustruhy') {
      if (typeof renderSoustruhy === 'function') renderSoustruhy();
    } else if (id === 'frezky') {
      // page exists only as part of kalkulačky hub
    } else if (id === 'pracka') {
      if (typeof updatePrackaInfo === 'function') updatePrackaInfo();
    } else if (id === 'korekce-frezky') {
      if (typeof updateFhbPresetButtons === 'function') updateFhbPresetButtons();
    } else if (id === 'jidlo') {
      if (typeof renderFoodSchedulePage === 'function') {
        renderFoodSchedulePage();
      }
    } else if (id === 'games') {
      if (typeof gamesStopActiveLoops === 'function') gamesStopActiveLoops();
      if (typeof app !== 'undefined') app.activeGameShell = '';
      document.body.classList.remove('gamesOpen');
      document.body.classList.remove('tttOpen');
      if (typeof renderGamesHub === 'function') renderGamesHub();
    } else if (id === 'home') {
      if (typeof scheduleHomeRefresh === 'function') {
        scheduleHomeRefresh();
      } else {
        if (typeof refreshHomeScreen === 'function') refreshHomeScreen();
        else {
          if (typeof updateDashboard === 'function') updateDashboard();
          if (typeof updateFoodTile === 'function') updateFoodTile();
          if (typeof updateEportalTile === 'function') updateEportalTile();
        }
      }
    }

  } catch (err) {
    console.error('showPage failed', err);
  } finally {
    if (id !== 'rotace') {
      try { document.documentElement.classList.remove('rakRotaceDockSettling'); } catch (err) {}
    }
    setBottomNavActive(navPage);
    ensurePageScrollAvailable(id, 'showPage');
    if (!isSamePageRefresh) {
      resetPageScrollToTop(id, 'showPage');
    }
  }
}

function openRotaceNames() {

  if (typeof app !== 'undefined') {
    app.selectedName = null;
    app.nameTapState = null;
  }
  showPage('rotace');
  setRotaceView('names');
  if (typeof renderRotace === 'function') renderRotace();
  setBottomNavActive('rotace');
}

function openRotaceMonths() {
  showPage('rotace');
  setRotaceView('months');
  setBottomNavActive('rotace');
}

function openRotaceStats() {
  showPage('rotace');
  setRotaceView('stats');
  setBottomNavActive('rotace');
}

function openKalkulacky() {
  showPage('kalkulacky');
  setBottomNavActive('kalkulacky');
}


const FOOD_MENU_URL = 'https://sa.gthcatering.cz/restaurant/c1/';
const EPORTAL_URL = 'https://space.skoda.vwgroup.com/group/b2eportal/home-page';
const PAYROLL_URL = 'https://smartappspki.skoda.vwgroup.com/sap/bc/ui2/flp?sap-client=010&sap-language=CS#eMA_EV-open';
const RAK_EXTERNAL_TILE_HOSTS = Object.freeze([
  'sa.gthcatering.cz',
  'space.skoda.vwgroup.com',
  'smartappspki.skoda.vwgroup.com'
]);
window.FOOD_MENU_URL = FOOD_MENU_URL;
window.EPORTAL_URL = EPORTAL_URL;
window.PAYROLL_URL = PAYROLL_URL;
window.RAK_EXTERNAL_TILE_HOSTS = RAK_EXTERNAL_TILE_HOSTS;

function normalizeExternalTileUrl(url, key = 'openExternalTile') {
  if (typeof normalizeAllowedExternalUrl === 'function') {
    return normalizeAllowedExternalUrl(url, RAK_EXTERNAL_TILE_HOSTS, key);
  }
  return typeof normalizeSafeExternalUrl === 'function'
    ? normalizeSafeExternalUrl(url, key)
    : String(url || '').trim();
}
window.normalizeExternalTileUrl = normalizeExternalTileUrl;

function openExternalTile(url, key = 'openExternalTile') {
  const target = normalizeExternalTileUrl(url, key);
  if (!target) return false;
  try {
    const win = window.open(target, '_blank', 'noopener,noreferrer');
    if (win) {
      try { win.opener = null; } catch (e) {}
      return true;
    }
  } catch (err) {
    console.warn('External tile open failed', err);
  }
  return false;
}

function openEportal() {
  return openExternalTile(EPORTAL_URL, 'openEportal');
}

function openPayroll() {
  return openExternalTile(PAYROLL_URL, 'openPayroll');
}

function syncDashboardExternalLinks() {
  if (typeof document === 'undefined' || typeof setSafeExternalAnchor !== 'function') return false;
  const food = setSafeExternalAnchor(document.getElementById('dashFoodLink'), FOOD_MENU_URL, RAK_EXTERNAL_TILE_HOSTS, 'dashFoodLink');
  const eportal = setSafeExternalAnchor(document.getElementById('dashEportalLink'), EPORTAL_URL, RAK_EXTERNAL_TILE_HOSTS, 'dashEportalLink');
  return !!(food || eportal);
}
window.syncDashboardExternalLinks = syncDashboardExternalLinks;

function refreshHomeScreen() {
  if (typeof isAnyModalOpen === 'function' && isAnyModalOpen()) return false;
  try {
    syncDashboardExternalLinks();
    if (typeof updateDashboard === 'function') updateDashboard();
  } catch (err) {
    console.warn('Dashboard refresh failed', err);
  }
  try {
    if (typeof updateFoodTile === 'function') updateFoodTile();
  } catch (err) {
    console.warn('Food tile refresh failed', err);
  }
  try {
    if (typeof updateEportalTile === 'function') updateEportalTile();
  } catch (err) {
    console.warn('Eportal tile refresh failed', err);
  }
  return true;
}

let rakHomeRefreshBatchActive = false;
let rakHomeRefreshBatchQueued = false;
let rakHomeRefreshBatchId = 0;

function bumpDataOptimizationCounter(key, amount = 1) {
  try {
    const stats = window.__rakDataOptimizationStats;
    if (!stats || !key) return;
    stats[key] = Number(stats[key] || 0) + amount;
  } catch (err) {}
}

function markDataOptimizationHomeRefresh(reason) {
  try {
    const stats = window.__rakDataOptimizationStats;
    if (!stats) return;
    stats.homeRefreshLastReason = String(reason || 'refresh');
    stats.homeRefreshLastAt = Date.now();
  } catch (err) {}
}

function scheduleHomeRefresh(reason = 'home-refresh') {
  bumpDataOptimizationCounter('homeRefreshSchedules');
  const refreshReason = String(reason || 'home-refresh');
  if (rakHomeRefreshBatchActive) {
    rakHomeRefreshBatchQueued = true;
    bumpDataOptimizationCounter('homeRefreshCoalescedSchedules');
    markDataOptimizationHomeRefresh('coalesced-' + refreshReason);
    return false;
  }

  rakHomeRefreshBatchActive = true;
  const batchId = ++rakHomeRefreshBatchId;
  markDataOptimizationHomeRefresh(refreshReason);

  const run = (step = '') => {
    if (batchId !== rakHomeRefreshBatchId) return false;
    if (typeof isAnyModalOpen === 'function' && isAnyModalOpen()) {
      bumpDataOptimizationCounter('homeRefreshModalSkips');
      return false;
    }
    bumpDataOptimizationCounter('homeRefreshRuns');
    markDataOptimizationHomeRefresh(step ? (refreshReason + ':' + step) : refreshReason);
    return refreshHomeScreen();
  };

  const finish = () => {
    if (batchId !== rakHomeRefreshBatchId) return;
    rakHomeRefreshBatchActive = false;
    if (rakHomeRefreshBatchQueued) {
      rakHomeRefreshBatchQueued = false;
      setTimeout(() => scheduleHomeRefresh('queued-after-batch'), 80);
    }
  };

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      run('raf-1');
      requestAnimationFrame(() => {
        run('raf-2');
        requestAnimationFrame(() => run('raf-3'));
      });
    });
  } else {
    setTimeout(() => run('timeout-0'), 0);
    setTimeout(() => run('timeout-120'), 120);
  }
  setTimeout(() => run('timeout-240'), 240);
  setTimeout(() => run('timeout-480'), 480);
  setTimeout(() => run('timeout-900'), 900);
  setTimeout(() => { run('timeout-1500'); finish(); }, 1500);
}

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


function hideFoodScheduleModal() {
  const overlay = document.getElementById('foodScheduleModal');
  if (!overlay) return;
  overlay.classList.remove('isVisible');
  document.body.classList.remove('foodModalOpen');
}

function ensureFoodScheduleModal() {
  let overlay = document.getElementById('foodScheduleModal');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'foodScheduleModal';
  overlay.className = 'foodScheduleOverlay';
  overlay.innerHTML = [
    '<div class="foodScheduleModal" role="dialog" aria-modal="true" aria-labelledby="foodScheduleModalTitle">',
    '<button type="button" class="foodScheduleClose" aria-label="Zavřít">×</button>',
    '<div class="foodScheduleModalTitle" id="foodScheduleModalTitle"></div>',
    '<div class="foodScheduleModalBody" id="foodScheduleModalBody"></div>',
    '</div>'
  ].join('');

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) hideFoodScheduleModal();
  });

  overlay.querySelector('.foodScheduleClose')?.addEventListener('click', hideFoodScheduleModal);

  bindGlobalEscapeOnce('foodModalKeydownBound', hideFoodScheduleModal);

  document.body.appendChild(overlay);
  return overlay;
}



function hideCalendarModal() {
  const overlay = document.getElementById('calendarModal');
  if (!overlay) return;
  overlay.classList.remove('isVisible');
  document.body.classList.remove('calendarModalOpen');
  document.body.classList.remove('calendarModalOpening');
}

function ensureCalendarModal() {
  let overlay = document.getElementById('calendarModal');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'calendarModal';
  overlay.className = 'calendarOverlay';
  overlay.innerHTML = [
    '<div class="calendarModal" role="dialog" aria-modal="true" aria-labelledby="calendarModalTitle">',
    '<button type="button" class="calendarModalClose" aria-label="Zavřít">×</button>',
    '<div class="calendarModalTitle" id="calendarModalTitle">Kalendář</div>',
    '<div class="calendarModalFrameWrap">',
    '<iframe class="calendarModalFrame" title="Google kalendář" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://calendar.google.com/calendar/embed?height=900&wkst=2&ctz=Europe%2FPrague&showPrint=0&showTitle=0&showTabs=0&showCalendars=0&showTz=0&src=MzFlZWE5OWVkZmYxNzcxYmUxNWJhODc3ZjdjMmY1YjEzNzFlMGE3NDJhZDlkNTRmY2E1MjZkNDFlYWZhNTk5NUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%230157ff"></iframe>',
    '</div>',
    '</div>'
  ].join('');

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) hideCalendarModal();
  });

  overlay.querySelector('.calendarModalClose')?.addEventListener('click', hideCalendarModal);

  bindGlobalEscapeOnce('calendarModalKeydownBound', hideCalendarModal);

  document.body.appendChild(overlay);
  return overlay;
}

function openCalendarInRak() {
  const overlay = ensureCalendarModal();
  const body = document.body;
  if (overlay.classList.contains('isVisible')) {
    body.classList.add('calendarModalOpen');
    body.classList.remove('calendarModalOpening');
    return true;
  }
  body.classList.add('calendarModalOpening');
  overlay.classList.add('isVisible');
  body.classList.add('calendarModalOpen');
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        body.classList.remove('calendarModalOpening');
      });
    });
  } else {
    if (typeof registerTimeout === 'function') registerTimeout(() => body.classList.remove('calendarModalOpening'), 32);
    else setTimeout(() => body.classList.remove('calendarModalOpening'), 32);
  }
  return true;
}

function bindCalendarTile() {
  const el = document.getElementById('dashCalendar');
  if (!el || el.dataset.rakCalendarBound === '1') return false;
  el.dataset.rakCalendarBound = '1';
  el.style.touchAction = 'manipulation';
  let openLockUntil = 0;
  const handler = (event) => {
    const now = Date.now();
    if (now < openLockUntil) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      return false;
    }
    openLockUntil = now + 900;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    return openCalendarInRak();
  };
  el.addEventListener('click', handler, { passive: false });
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') handler(event);
  });
  return true;
}

// 1.2 (1.13): Games hub + account profile jsou oddělené v games-profile.js.

// 1.2 (1.13): Klasické hry 2048 / Had / Flappy Car jsou oddělené v games-classic.js.

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



// 1.2 (1.13): Theme, pozadí a profilové UI nastavení jsou oddělené v appearance-theme.js.

function getRakRotaceNamesDockHealth() {
  const result = {
    ok: true,
    version: window.APP_VERSION || 'v.1.5 (963)',
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


try {
  if (typeof window !== 'undefined' && !window.__rakBottomNavIndicatorResizeBound) {
    window.__rakBottomNavIndicatorResizeBound = true;
    window.addEventListener('resize', () => scheduleBottomNavActiveIndicator('resize'), { passive: true });
    window.addEventListener('orientationchange', () => scheduleBottomNavActiveIndicator('orientationchange'), { passive: true });
    if (document && document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => scheduleBottomNavActiveIndicator('dom-ready'), { once: true });
    } else {
      scheduleBottomNavActiveIndicator('init');
    }
  }
} catch (err) {}
