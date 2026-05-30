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

function ensureAppMenuOverlay() {
  let page = document.getElementById('menu');
  if (page) return page;

  page = document.createElement('div');
  page.id = 'menu';
  page.className = 'page appMenuPage';
  page.innerHTML = [
    '<div class="headerBar appMenuPageTitleBar">',
    '  <div></div>',
    '  <h3>Více</h3>',
    '  <div class="appMenuTitleSpacer"></div>',
    '</div>',
    '<div class="card appMenuPageCard">',
    '  <div class="appMenuBody" id="appMenuBody"></div>',
    '</div>'
  ].join('');

  document.body.appendChild(page);
  return page;
}

function hideAppMenu() {
  const page = document.getElementById('menu');
  if (!page) return;
  page.classList.remove('active');
}

function ensureExcelFileInput() {
  let input = document.getElementById('excelFile');
  if (input) return input;
  input = document.createElement('input');
  input.type = 'file';
  input.id = 'excelFile';
  input.accept = '.xlsx,.xls';
  input.hidden = true;
  input.style.display = 'none';
  document.body.appendChild(input);
  return input;
}

function startMenuImport() {
  const input = ensureExcelFileInput();
  if (!input) {
    alert('Import není připravený.');
    return;
  }
  input.value = '';
  app.pendingMenuImport = true;
  input.click();
}

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

function ensureTicTacToeThemeBoardPatch() {
  try {
    const existing = document.getElementById('tttThemeBoardPatch');
    const css = `
/* v.1.1 (684) – Piškvorky: poslední pojistka proti starému zeleno-černému boardu. */
html body.tttOpen .tttOverlay,
html body.tttOpen .tttShell,
html body.tttOpen .tttContent,
html body.tttOpen .tttGameScreen{
  background:transparent !important;
}
html body.tttOpen .tttOverlay{
  background:var(--rakAppBackground, var(--bg, #050816)) !important;
  background-color:var(--rakBgBase, var(--bg, #050816)) !important;
}
html body.tttOpen .tttOverlay::before{
  content:"" !important;
  position:fixed !important;
  inset:0 !important;
  pointer-events:none !important;
  z-index:0 !important;
  background:var(--rakAppBackgroundOverlay, transparent) !important;
  opacity:1 !important;
}
html body.tttOpen .tttOverlay .tttBoardWrap,
html body.tttOpen .tttOverlay #tttBoard.tttBoard{
  --tttGridLine:rgba(238,247,255,.24) !important;
  --tttGlassLine:rgba(255,255,255,.08) !important;
  --tttBoardSurface:rgba(255,255,255,.032) !important;
}
@supports (color: color-mix(in srgb, white 50%, transparent)){
  html body.tttOpen .tttOverlay .tttBoardWrap,
  html body.tttOpen .tttOverlay #tttBoard.tttBoard{
    --tttGridLine:color-mix(in srgb, var(--rakThemeBorder, var(--soft, #eef7ff)) 48%, transparent) !important;
    --tttGlassLine:color-mix(in srgb, var(--soft, #eef7ff) 12%, transparent) !important;
    --tttBoardSurface:color-mix(in srgb, var(--panel2, var(--panel, #101827)) 64%, transparent) !important;
  }
}
html body.tttOpen .tttOverlay .tttBoardWrap{
  background:
    linear-gradient(135deg, rgba(255,255,255,.095), rgba(255,255,255,.018)),
    var(--panel, rgba(12,18,28,.46)) !important;
  border:1px solid var(--tttGridLine) !important;
  box-shadow:0 18px 48px rgba(0,0,0,.34), inset 0 1px 0 var(--tttGlassLine) !important;
  -webkit-backdrop-filter:blur(14px) saturate(140%) !important;
  backdrop-filter:blur(14px) saturate(140%) !important;
}
html body.tttOpen .tttOverlay #tttBoard.tttBoard{
  background:
    linear-gradient(135deg, rgba(255,255,255,.060), rgba(255,255,255,.012)),
    var(--tttBoardSurface) !important;
  border:0 !important;
  border-left:1px solid var(--tttGridLine) !important;
  border-top:1px solid var(--tttGridLine) !important;
  outline:0 !important;
  box-shadow:
    inset -1px 0 0 var(--tttGridLine),
    inset 0 -1px 0 var(--tttGridLine),
    0 16px 38px rgba(0,0,0,.20) !important;
}
html body.tttOpen .tttOverlay #tttBoard.tttBoard::before,
html body.tttOpen .tttOverlay #tttBoard.tttBoard::after{
  content:none !important;
  display:none !important;
  background:none !important;
  box-shadow:none !important;
}
html body.tttOpen .tttOverlay #tttBoard.tttBoard .tttCell{
  border-right:1px solid var(--tttGridLine) !important;
  border-bottom:1px solid var(--tttGridLine) !important;
  background:transparent !important;
  background-color:transparent !important;
  background-image:none !important;
  box-shadow:none !important;
  -webkit-tap-highlight-color:rgba(238,247,255,.12) !important;
}
html body.tttOpen .tttOverlay #tttBoard.tttBoard .tttCell.isLastMove{
  box-shadow:inset 0 0 0 2px rgba(238,247,255,.22) !important;
}
html body.tttOpen .tttOverlay #tttBoard.tttBoard .tttCell.isX,
html body.tttOpen .tttOverlay #tttBoard.tttBoard .tttCell.isWinner.isX{
  color:#78c7ff !important;
  text-shadow:0 0 14px rgba(120,199,255,.50), 0 0 2px rgba(255,255,255,.30) !important;
}
html body.tttOpen .tttOverlay #tttBoard.tttBoard .tttCell.isO,
html body.tttOpen .tttOverlay #tttBoard.tttBoard .tttCell.isWinner.isO{
  color:#ff7c7c !important;
  text-shadow:0 0 14px rgba(255,124,124,.50), 0 0 2px rgba(255,255,255,.28) !important;
}
html body.ladaMode.tttOpen .tttOverlay .tttBoardWrap,
html[data-lightweight="1"] body.tttOpen .tttOverlay .tttBoardWrap{
  -webkit-backdrop-filter:none !important;
  backdrop-filter:none !important;
}

/* v.1.5 (767): Piškvorky – za spodní lištou nesmí být vidět ani scrollovat jiná stránka. */
html:has(body.tttOpen){
  height:100% !important;
  overflow:hidden !important;
  overscroll-behavior:none !important;
}
html body.tttOpen{
  width:100% !important;
  height:100dvh !important;
  min-height:100dvh !important;
  max-height:100dvh !important;
  overflow:hidden !important;
  overscroll-behavior:none !important;
}
html body.tttOpen .page{
  visibility:hidden !important;
  pointer-events:none !important;
}
html body.tttOpen .tttOverlay{
  position:fixed !important;
  inset:0 !important;
  width:100vw !important;
  height:100dvh !important;
  min-height:100dvh !important;
  max-height:100dvh !important;
  z-index:10010 !important;
  overflow:hidden !important;
  overscroll-behavior:none !important;
}
html body.tttOpen .tttShell,
html body.tttOpen .tttContent{
  height:100dvh !important;
  min-height:100dvh !important;
  max-height:100dvh !important;
  overflow:hidden !important;
}
html body.tttOpen .tttStartScreen{
  overscroll-behavior:contain !important;
}
html body.tttOpen .tttOverlay::after{
  content:"" !important;
  position:fixed !important;
  left:0 !important;
  right:0 !important;
  bottom:0 !important;
  height:var(--rak-ttt-live-bottom-clearance, calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom) + 118px)) !important;
  pointer-events:none !important;
  z-index:1 !important;
  background:linear-gradient(180deg, rgba(5,8,22,0), var(--rakBgBase, var(--bg, #050816)) 42%, var(--rakBgBase, var(--bg, #050816)) 100%) !important;
}
html body.tttOpen #tttOverlay.tttOverlay.isVisible .tttBoardWrap{
  top:56px !important;
  right:10px !important;
  bottom:var(--rak-ttt-live-bottom-clearance, calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom) + 118px)) !important;
  left:10px !important;
  inset:56px 10px var(--rak-ttt-live-bottom-clearance, calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom) + 118px)) 10px !important;
  max-height:calc(100dvh - 56px - var(--rak-ttt-live-bottom-clearance, calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom) + 118px))) !important;
}
html body.tttOpen #tttOverlay.tttOverlay.isVisible .tttResultCard{
  bottom:calc(var(--rak-ttt-live-bottom-clearance, calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom) + 118px)) + 8px) !important;
}
`;
    if (existing) {
      if (existing.textContent !== css) existing.textContent = css;
      return;
    }
    const style = document.createElement('style');
    style.id = 'tttThemeBoardPatch';
    style.textContent = css;
    document.head.appendChild(style);
  } catch (err) {}
}

function ensureTicTacToeStyles() {
  if (document.getElementById('tttStyles')) return;
  const style = document.createElement('style');
  style.id = 'tttStyles';
  style.textContent = `
.tttOverlay{
  position:fixed;
  inset:0;
  z-index:9999;
  display:none;
  align-items:stretch;
  justify-content:center;
  padding:0;
  background:rgba(5,8,7,.78);
  backdrop-filter:blur(16px) saturate(145%);
  -webkit-backdrop-filter:blur(16px) saturate(145%);
}
.tttOverlay.isVisible{display:flex;}
.tttShell{
  width:100%;
  height:100%;
  border:none;
  border-radius:0;
  background:linear-gradient(180deg, rgba(10,14,12,.99), rgba(7,10,9,.98));
  box-shadow:0 24px 80px rgba(0,0,0,.55);
  overflow:hidden;
  display:flex;
  flex-direction:column;
}
.tttHeader{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:14px 14px 10px;
  border-bottom:1px solid rgba(124,255,124,.10);
  flex:0 0 auto;
  background:rgba(255,255,255,.02);
}
.tttHeaderTitle{
  display:flex;
  flex-direction:column;
  gap:2px;
}
.tttHeaderTitle h2{
  margin:0;
  font-size:20px;
  letter-spacing:.02em;
  color:#e7fff0;
}
.tttHeaderTitle span{
  font-size:12px;
  color:rgba(231,255,240,.58);
}
.tttClose{
  width:38px;
  height:38px;
  border:none;
  border-radius:0;
  background:rgba(255,255,255,.05);
  color:#e7fff0;
  font-size:26px;
  line-height:1;
}
.tttContent{
  flex:1;
  min-height:0;
  overflow:hidden;
  padding:0;
  display:flex;
  flex-direction:column;
}
.tttStartScreen,
.tttGameScreen{
  display:flex;
  flex-direction:column;
  gap:12px;
  min-height:0;
  flex:1;
}
.tttStartScreen{
  padding:14px;
  overflow:auto;
}
.tttGameScreen{
  position:relative;
  padding:0;
}
.tttCard{
  border:1px solid rgba(124,255,124,.12);
  background:rgba(255,255,255,.03);
  border-radius:0;
  padding:14px;
}
.tttSectionTitle{
  margin:0 0 12px;
  font-size:13px;
  letter-spacing:.14em;
  text-transform:uppercase;
  color:rgba(231,255,240,.62);
}
.tttToggleRow,
.tttLevelRow{
  display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  gap:10px;
}
.tttInviteActions{
  grid-template-columns:repeat(2, minmax(0, 1fr));
}
.tttLevelRow{
  grid-template-columns:repeat(3, minmax(0, 1fr));
}
.tttBtn{
  appearance:none;
  -webkit-appearance:none;
  font-family:inherit;
  min-height:48px;
  border:1px solid rgba(124,255,124,.16);
  background:rgba(255,255,255,.04);
  color:#e7fff0;
  border-radius:0;
  padding:10px 12px;
  font-size:15px;
  font-weight:700;
}
.tttBtn.isActive{
  background:linear-gradient(180deg, rgba(124,255,124,.22), rgba(124,255,124,.10));
  border-color:rgba(124,255,124,.6);
  color:#7CFF7C;
  box-shadow:0 0 0 1px rgba(124,255,124,.12), 0 0 22px rgba(124,255,124,.14);
}
.tttNote{
  margin-top:10px;
  color:rgba(231,255,240,.55);
  font-size:12px;
  line-height:1.45;
}
.tttInviteCode{
  display:block;
  margin-top:10px;
  padding:12px 10px;
  border:1px solid rgba(124,255,124,.16);
  background:rgba(255,255,255,.04);
  color:#eaffea;
  font-size:28px;
  line-height:1.1;
  font-weight:900;
  letter-spacing:.18em;
  text-align:center;
  text-transform:uppercase;
  overflow-wrap:anywhere;
}
.tttStatus{
  position:absolute;
  top:12px;
  left:12px;
  right:12px;
  z-index:2;
  min-height:24px;
  color:#7CFF7C;
  font-size:14px;
  font-weight:700;
  text-align:center;
  background:rgba(7,10,9,.72);
  border:1px solid rgba(124,255,124,.12);
  padding:8px 12px;
  pointer-events:none;
}
.tttBoardWrap{
  position:absolute;
  inset:56px 10px 96px;
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:0;
  overflow:hidden;
  padding:8px;
  background:
    radial-gradient(circle at 18% 8%, rgba(124,255,124,.13), transparent 34%),
    linear-gradient(180deg, rgba(12,18,16,.92), rgba(5,9,8,.96));
  border:1px solid rgba(124,255,124,.20);
  border-radius:22px;
  box-shadow:0 18px 46px rgba(0,0,0,.36), inset 0 0 0 1px rgba(255,255,255,.05);
}
.tttBoard{
  width:100%;
  height:100%;
  position:relative;
  display:grid;
  grid-template-columns:repeat(10, var(--tttCellSize, 24px));
  grid-template-rows:repeat(19, var(--tttCellSize, 24px));
  gap:0;
  justify-content:center;
  align-content:center;
  overflow:hidden;
  border-radius:10px;
  border:0;
  background:
    radial-gradient(circle at 50% 0%, rgba(124,255,124,.08), transparent 42%),
    linear-gradient(180deg, rgba(5,12,10,.86), rgba(3,8,7,.92));
  box-shadow:0 0 26px rgba(124,255,124,.08), inset 0 0 0 1px rgba(124,255,124,.08);
}
.tttBoard::before{
  content:"";
  position:absolute;
  inset:0;
  z-index:0;
  pointer-events:none;
  background-image:
    linear-gradient(to right, rgba(124,255,124,.38) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(124,255,124,.38) 1px, transparent 1px);
  background-size:var(--tttCellSize, 24px) var(--tttCellSize, 24px);
  background-position:0 0;
  box-shadow:inset -1px 0 0 rgba(124,255,124,.38), inset 0 -1px 0 rgba(124,255,124,.38);
}
.tttCell{
  appearance:none;
  -webkit-appearance:none;
  position:relative;
  z-index:1;
  font-family:"Comic Sans MS", "Segoe Print", "Bradley Hand", cursive;
  width:var(--tttCellSize, 24px);
  height:var(--tttCellSize, 24px);
  box-sizing:border-box;
  border:0;
  outline:0;
  margin:0;
  padding:0;
  background:transparent;
  border-radius:0;
  box-shadow:none;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:calc(var(--tttCellSize, 24px) * 1.12);
  font-weight:900;
  line-height:.82;
  text-align:center;
  color:#77caff;
  text-shadow:0 0 14px rgba(119,202,255,.36);
  touch-action:manipulation;
  -webkit-tap-highlight-color:rgba(124,255,124,.10);
  transition:color .10s ease, text-shadow .10s ease, filter .10s ease;
}
.tttCell:hover,
.tttCell:active,
.tttCell.isFilled,
.tttCell.isLastMove{
  transform:none;
  background:transparent;
  box-shadow:none;
}
.tttCell.isLastMove{
  filter:brightness(1.16) saturate(1.12);
  text-shadow:0 0 18px rgba(124,255,124,.34), 0 0 14px currentColor;
}
.tttCell.isX{
  color:#78c7ff;
  text-shadow:0 0 14px rgba(120,199,255,.48), 0 0 2px rgba(255,255,255,.30);
}
.tttCell.isO{
  color:#ff7c7c;
  text-shadow:0 0 14px rgba(255,124,124,.48), 0 0 2px rgba(255,255,255,.28);
}
.tttCell.isWinner{
  background:radial-gradient(circle at center, rgba(255,230,112,.18), transparent 58%);
  box-shadow:none;
  color:#fff1a6;
  text-shadow:0 0 4px rgba(255,255,255,.95), 0 0 12px rgba(255,226,122,.95), 0 0 28px rgba(124,255,124,.62);
  filter:brightness(1.35) saturate(1.28);
}
.tttCell.isWinner::after{
  content:"";
  position:absolute;
  inset:18%;
  border:2px solid rgba(255,226,122,.85);
  border-radius:999px;
  box-shadow:0 0 16px rgba(255,226,122,.45), inset 0 0 12px rgba(255,226,122,.20);
  pointer-events:none;
}
.tttWinModal{
  position:absolute;
  inset:0;
  display:none;
  align-items:center;
  justify-content:center;
  padding:18px 14px calc(18px + env(safe-area-inset-bottom));
  background:rgba(4,7,6,.66);
  backdrop-filter:blur(10px) saturate(135%);
  -webkit-backdrop-filter:blur(10px) saturate(135%);
  z-index:4;
}
.tttWinCard{
  width:min(100%, 380px);
  border:1px solid rgba(124,255,124,.16);
  border-radius:22px;
  background:linear-gradient(180deg, rgba(13,18,15,.98), rgba(8,12,10,.98));
  box-shadow:0 22px 60px rgba(0,0,0,.48);
  padding:16px;
}
.tttWinText{
  margin-top:6px;
  color:rgba(231,255,240,.76);
  font-size:13px;
  line-height:1.45;
}
.tttWinLabel{
  display:block;
  margin-top:12px;
  font-size:12px;
  letter-spacing:.08em;
  text-transform:uppercase;
  color:rgba(231,255,240,.62);
}
.tttWinInput{
  width:100%;
  margin-top:8px;
  min-height:44px;
  border-radius:14px;
  border:1px solid rgba(124,255,124,.18);
  background:rgba(255,255,255,.04);
  color:#eaf7ee;
  padding:10px 12px;
  font:inherit;
  font-size:16px;
  outline:none;
}
.tttWinInput:focus{
  border-color:rgba(124,255,124,.48);
  box-shadow:0 0 0 3px rgba(124,255,124,.12);
}
.tttWinStats{
  margin-top:12px;
  display:grid;
  grid-template-columns:1fr;
  gap:8px;
}
.tttWinStats > div{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:9px 10px;
  border-radius:14px;
  background:rgba(255,255,255,.03);
  border:1px solid rgba(124,255,124,.10);
}
.tttWinStats span{
  color:rgba(231,255,240,.62);
  font-size:12px;
}
.tttWinStats strong{
  color:#eaf7ee;
  font-size:13px;
}
.tttWinActions{
  margin-top:14px;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}
.tttWinModal.isVisible{
  display:flex;
}
.tttFooter{
  position:absolute;
  left:12px;
  right:12px;
  bottom:calc(12px + env(safe-area-inset-bottom));
  display:flex;
  gap:10px;
  z-index:2;
}
.tttFooter .tttBtn{
  flex:1;
}
.tttBtn:disabled{
  opacity:.45;
  filter:saturate(.5);
}
body.tttOpen{
  overflow:hidden;
}
@media (max-width: 520px){
  .tttHeader{padding:10px 12px 8px;}
  .tttHeaderTitle h2{font-size:18px;}
  .tttStartScreen{padding:10px;}
  .tttCard{padding:12px;}
  .tttStatus{left:10px; right:10px; top:10px; font-size:13px; padding:7px 10px;}
  .tttBoardWrap{inset:48px 10px 90px;}
  .tttFooter{left:10px; right:10px; bottom:calc(10px + env(safe-area-inset-bottom));}
  .tttInviteCode{font-size:22px; letter-spacing:.14em;}
  .tttLevelRow{grid-template-columns:1fr;}
  .tttToggleRow{grid-template-columns:1fr;}
  .tttCell{font-size:clamp(18px, 7.2vw, 34px);}
  .tttWinActions{grid-template-columns:1fr;}
}
      `;
  document.head.appendChild(style);
}

function ensureTicTacToeOverlay() {
  let overlay = document.getElementById('tttOverlay');
  if (overlay) { ensureTicTacToeThemeBoardPatch(); return overlay; }

  ensureTicTacToeStyles();
  ensureTicTacToeThemeBoardPatch();
  overlay = document.createElement('div');
  overlay.id = 'tttOverlay';
  overlay.className = 'tttOverlay';
  overlay.innerHTML = [
    '<div class="tttShell" role="dialog" aria-modal="true" aria-labelledby="tttTitle">',
    '  <div class="tttHeader">',
    '    <div class="tttHeaderTitle">',
    '      <h2 id="tttTitle" class="uHidden">Piškvorky</h2>',
    '      <span></span>',
    '    </div>',
    '  </div>',
    '  <div class="tttContent">',
    '    <div class="tttStartScreen" id="tttStartScreen"></div>',
    '    <div class="tttGameScreen uHidden" id="tttGameScreen">',
    '      <div class="tttStatus" id="tttStatus"></div>',
    '      <div class="tttOnlineGameInfo" id="tttOnlineGameInfo" hidden></div>',
    '      <div class="tttBoardWrap"><div class="tttBoard" id="tttBoard"></div><div class="tttInviteOverlay" id="tttInviteOverlay" hidden></div><div class="tttResultCard" id="tttResultCard" hidden></div></div>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('');
  document.body.appendChild(overlay);

  const close = () => closeTicTacToeGame();
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  overlay.querySelector('.tttClose')?.addEventListener('click', close);
  if (!document.body.dataset.tttKeyBound) {
    document.body.dataset.tttKeyBound = '1';
    document.addEventListener('keydown', (event) => {
      const active = document.getElementById('tttOverlay');
      if (!active || !active.classList.contains('isVisible')) return;
      if (event.key === 'Escape') closeTicTacToeGame();
    });
  }

  if (!window.__tttResizeBound) {
    window.__tttResizeBound = true;
    window.addEventListener('resize', tttLayoutBoard, { passive: true });
    window.addEventListener('orientationchange', tttLayoutBoard, { passive: true });
  }

  tttBindOnlineLifecycle();

  return overlay;
}

const TTT_ROWS = 19;
const TTT_COLS = 10;
const TTT_WIN_LENGTH = 5;
const TTT_TOTAL_CELLS = TTT_ROWS * TTT_COLS;
const TTT_HARD_WIN_EMAIL = 'martinspadrna@gmail.com';
const TTT_HARD_WIN_KEY = 'tttHardWins';
// Samostatná verze pravidel/obtížnosti Piškvorek. Není to verze celé aplikace.
// Zvyšovat jen při změně AI obtížnosti nebo pravidel, ne při vzhledových úpravách.
const GOMOKU_RULESET_VERSION = 'gomoku-10col-19row-ai-rules-v15';
if (typeof window !== 'undefined') window.GOMOKU_RULESET_VERSION = GOMOKU_RULESET_VERSION;

function tttEnsureAiWinsResetV667() {
  try {
    const marker = 'rak_ttt_ai_wins_reset_v667';
    if (localStorage.getItem(marker) !== '1') {
      localStorage.removeItem(TTT_HARD_WIN_KEY);
      localStorage.removeItem('rotace_supabase_gomoku_wins_v1');
      localStorage.setItem(marker, '1');
    }
    const reset853 = 'rak_games_full_stats_reset_v853';
    if (localStorage.getItem(reset853) !== '1') {
      localStorage.removeItem(TTT_HARD_WIN_KEY);
      localStorage.removeItem('rotace_supabase_gomoku_wins_v1');
      localStorage.removeItem('rotace_ttt_online_results_v1');
      localStorage.removeItem('rotace_ttt_online_join_diag_v1');
      localStorage.setItem(reset853, '1');
    }
  } catch (err) {}
}

function tttGetState() {
  tttEnsureAiWinsResetV667();
  if (!app.tttState) {
    app.tttState = {
      screen: 'start',
      mode: 'ai',
      difficulty: 'ai',
      board: Array(TTT_TOTAL_CELLS).fill(''),
      turn: 'X',
      gameOver: false,
      winner: null,
      nextStarter: 'X',
      message: '',
      startedAt: 0,
      moveCount: 0,
      moveCountX: 0,
      moveCountO: 0,
      hardWinPrompt: false,
      hardWinStats: null,
      hardWinName: '',
      resultSaved: false,
      resultOnlineSaved: false,
      resultSummary: null,
      hardWinRemote: [],
      hardWinLoading: false,
      hardWinLoaded: false,
      onlineScoreRemote: [],
      onlineScoreLoading: false,
      onlineScoreLoaded: false,
      online: {
        code: '',
        inviteId: null,
        sessionId: null,
        role: '',
        status: 'idle',
        revision: 0,
        lastUpdatedAt: 0,
        lastRemoteUpdatedAt: 0,
        dirty: false,
        pendingRevision: 0,
        playerXAccountNumber: null,
        playerOAccountNumber: null,
        connected: false,
        resultSavedKey: '',
        joinFlow: '',
        joinSource: ''
      },
      onlineSyncTimer: null,
      onlineStatus: '',
      onlineKind: 'idle'
    };
  }
  return app.tttState;
}


function tttCreateEmptyOnlineState() {
  return {
    code: '',
    inviteId: null,
    sessionId: null,
    role: '',
    status: 'idle',
    revision: 0,
    lastUpdatedAt: 0,
    lastRemoteUpdatedAt: 0,
    dirty: false,
    pendingRevision: 0,
    playerXAccountNumber: null,
    playerOAccountNumber: null,
    connected: false,
    resultSavedKey: '',
    joinFlow: '',
    joinSource: '',
    rulesetVersion: GOMOKU_RULESET_VERSION,
    rows: TTT_ROWS,
    cols: TTT_COLS,
    winLength: TTT_WIN_LENGTH,
    inviteUrl: '',
    headToHead: null,
    headToHeadText: '',
    headToHeadLoadedAt: 0
  };
}

function tttClearBoardStateForNewMode(state, mode) {
  const s = state || tttGetState();
  const nextMode = String(mode || s.mode || 'ai').trim() || 'ai';
  if (nextMode !== 'pvp') {
    if (typeof tttStopOnlineSync === 'function') tttStopOnlineSync();
    s.online = tttCreateEmptyOnlineState();
    s.onlineStatus = '';
    s.onlineKind = 'idle';
  }
  s.board = Array(TTT_TOTAL_CELLS).fill('');
  s.turn = 'X';
  s.gameOver = false;
  s.winner = null;
  s.nextStarter = 'X';
  s.startedAt = 0;
  s.moveCount = 0;
  s.moveCountX = 0;
  s.moveCountO = 0;
  s.lastMoveIndex = null;
  s.lastMoveMark = null;
  s.hardWinPrompt = false;
  s.hardWinStats = null;
  s.resultSaved = false;
  s.resultOnlineSaved = false;
  s.resultSummary = null;
  s.aiBusy = false;
  s.aiToken = (Number(s.aiToken || 0) || 0) + 1;
  s.message = nextMode === 'local' ? 'Na řadě je X.' : (nextMode === 'pvp' ? s.message || '' : 'Hraješ za X. AI je O.');
  return s;
}

function tttSwitchModeClean(nextMode) {
  const state = tttGetState();
  const mode = String(nextMode || 'ai').trim() || 'ai';
  const previous = String(state.mode || '').trim();
  state.mode = mode;
  state.difficulty = 'ai';
  if (mode !== previous || mode !== 'pvp') {
    tttClearBoardStateForNewMode(state, mode);
  }
  state.screen = 'start';
  return state;
}


function tttNormalizeInviteCode(code) {
  return String(code || '').replace(/\D/g, '').slice(0, 4);
}

function tttMakeInviteCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function tttGetInviteUrl(code) {
  const url = new URL(window.location.href);
  url.hash = 'games=ttt&invite=' + encodeURIComponent(String(code || '').trim());
  return url.toString();
}

function tttFindInviteCodeInParamText(text) {
  const raw = String(text || '').trim();
  if (!raw) return '';
  const cleaned = raw.replace(/^[#?]/, '');
  const candidates = [cleaned];
  const qIndex = cleaned.indexOf('?');
  if (qIndex >= 0) candidates.push(cleaned.slice(qIndex + 1));
  for (const candidate of candidates) {
    try {
      const params = new URLSearchParams(candidate);
      const invite = params.get('invite') || params.get('code') || params.get('tttInvite') || params.get('ttt') || '';
      const normalized = tttNormalizeInviteCode(invite);
      if (normalized) return normalized;
    } catch (err) {}
  }
  const match = cleaned.match(/(?:^|[?&#])(?:invite|code|tttInvite|ttt)=([^&#]+)/i);
  return match ? tttNormalizeInviteCode(decodeURIComponent(match[1] || '')) : '';
}

function tttReadUrlInviteData() {
  try {
    const hashCode = tttFindInviteCodeInParamText(window.location.hash || '');
    if (hashCode) return { code: hashCode, source: 'hash' };
    const queryCode = tttFindInviteCodeInParamText(window.location.search || '');
    if (queryCode) return { code: queryCode, source: 'query' };
  } catch (err) {}
  return { code: '', source: '' };
}

function tttReadHashInviteCode() {
  return tttReadUrlInviteData().code || '';
}

function tttClearInviteFromUrl() {
  try {
    const url = new URL(window.location.href);
    url.hash = '';
    ['invite', 'code', 'tttInvite', 'ttt'].forEach(key => url.searchParams.delete(key));
    history.replaceState(null, '', url.toString());
  } catch (err) {}
}

async function tttOpenFromInviteCode(code, options) {
  const inviteCode = tttNormalizeInviteCode(code);
  if (!inviteCode) return false;
  try {
    showPage('games');
  } catch (err) {}
  const inviteState = tttGetState();
  inviteState.mode = 'pvp';
  inviteState.difficulty = 'ai';
  openGameShell('ttt');
  const linkSource = options && options.source ? String(options.source) : 'hash';
  const result = await tttJoinInviteSession(inviteCode, { flow: 'link', source: linkSource });
  if (result && result.ok) {
    const state = tttGetState();
    state.screen = 'game';
    state.gameOver = false;
    state.winner = null;
    state.startedAt = Date.now();
    tttSetJoinedOnlineMessage(state);
    tttRememberOnlineJoinDiag('link', 'ready', { code: inviteCode, source: linkSource + '-open', message: state.message });
    tttRender();
    scheduleTttLayout();
    tttStartOnlineSyncLoop();
    void tttSyncOnlineSession(true);
    return true;
  }
  tttRememberOnlineJoinDiag('link', 'error', { code: inviteCode, source: linkSource + '-open', reason: tttInviteResultMessage(result, 'Pozvánku z odkazu se nepodařilo přijmout.') });
  return false;
}

function tttSetOnlineStatus(text, kind) {
  const state = tttGetState();
  state.onlineStatus = String(text || '').trim();
  state.onlineKind = String(kind || 'waiting');
}

function tttGetActiveAccountId() {
  const active = typeof gamesGetActiveAccount === 'function' ? gamesGetActiveAccount() : null;
  return active && active.id ? String(active.id).trim() : '';
}

function tttGetOnlineDisplayCode() {
  const state = tttGetState();
  return tttNormalizeInviteCode(state && state.online ? state.online.code : '');
}

function tttGetOnlineCodeText() {
  const state = tttGetState();
  const code = tttGetOnlineDisplayCode();
  if (!code || state.mode !== 'pvp') return '';
  const role = String(state.online && state.online.role || '').toUpperCase();
  const roleText = role ? (' · ty jsi ' + role) : '';
  return 'Kód pozvánky: ' + code + roleText;
}

function tttSetOnlineHeadToHeadText(text) {
  const state = tttGetState();
  if (!state.online) state.online = {};
  state.online.headToHeadText = String(text || '').trim();
}

async function tttRefreshOnlineHeadToHead(force) {
  const state = tttGetState();
  const online = state.online || {};
  if (state.mode !== 'pvp') return '';
  const x = String(online.playerXAccountNumber || '').trim();
  const o = String(online.playerOAccountNumber || '').trim();
  if (!x || !o || x === o) {
    const waiting = x ? 'Vzájemné skóre: čekám na druhého hráče.' : '';
    tttSetOnlineHeadToHeadText(waiting);
    return waiting;
  }
  const now = Date.now();
  if (!force && online.headToHeadText && now - Number(online.headToHeadLoadedAt || 0) < 30000) return online.headToHeadText;
  if (!window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.loadTttHeadToHead !== 'function') {
    const fallback = 'Vzájemné skóre: ' + x + ' vs ' + o;
    tttSetOnlineHeadToHeadText(fallback);
    return fallback;
  }
  try {
    const result = await window.RotationSupabaseBridge.loadTttHeadToHead(x, o, { force: !!force });
    if (result && result.ok) {
      const score = result.score || {};
      const xWins = Number(score.xWins || 0) || 0;
      const oWins = Number(score.oWins || 0) || 0;
      const draws = Number(score.draws || 0) || 0;
      const label = 'Vzájemně: X ' + xWins + ' : ' + oWins + ' O' + (draws ? (' · remízy ' + draws) : '');
      state.online.headToHeadLoadedAt = now;
      tttSetOnlineHeadToHeadText(label);
      return label;
    }
  } catch (err) {
    console.warn('TTT head-to-head load failed', err);
  }
  const fallback = 'Vzájemné skóre: čeká na načtení.';
  tttSetOnlineHeadToHeadText(fallback);
  return fallback;
}

const TTT_ONLINE_POLL_MS = 650;
const TTT_ONLINE_RESULT_STORE_KEY = 'rotace_ttt_online_results_v1';
const TTT_ONLINE_JOIN_DIAG_KEY = 'rotace_ttt_online_join_diag_v1';

function tttReadOnlineResultStore() {
  try {
    const parsed = typeof parseLocalStorageJsonCached === 'function'
      ? parseLocalStorageJsonCached(TTT_ONLINE_RESULT_STORE_KEY, {})
      : JSON.parse(localStorage.getItem(TTT_ONLINE_RESULT_STORE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    return {};
  }
}

function tttWriteOnlineResultStore(store) {
  try {
    const payload = JSON.stringify(store && typeof store === 'object' ? store : {});
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(TTT_ONLINE_RESULT_STORE_KEY, payload);
    else localStorage.setItem(TTT_ONLINE_RESULT_STORE_KEY, payload);
  } catch (err) {}
}


function tttNormalizeOnlineJoinDiag(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const safeEntry = (entry) => entry && typeof entry === 'object' ? {
    flow: String(entry.flow || '').slice(0, 24),
    stage: String(entry.stage || '').slice(0, 32),
    ok: entry.ok === true || String(entry.stage || '') === 'success' || String(entry.stage || '') === 'ready',
    code: tttNormalizeInviteCode(entry.code || ''),
    role: String(entry.role || '').slice(0, 8),
    turn: String(entry.turn || '').slice(0, 8),
    mode: String(entry.mode || '').slice(0, 12),
    canMoveNow: entry.canMoveNow === true,
    sessionId: String(entry.sessionId || '').slice(0, 80),
    inviteId: String(entry.inviteId || '').slice(0, 80),
    source: String(entry.source || '').slice(0, 32),
    message: String(entry.message || '').slice(0, 180),
    reason: String(entry.reason || '').slice(0, 180),
    at: Number(entry.at || 0) || 0,
    version: String(entry.version || '').slice(0, 40)
  } : null;
  const history = Array.isArray(src.history) ? src.history.map(safeEntry).filter(Boolean).slice(-12) : [];
  return {
    version: String(src.version || window.APP_VERSION || '').slice(0, 40),
    attempts: Number(src.attempts || 0) || 0,
    linkAttempts: Number(src.linkAttempts || 0) || 0,
    manualAttempts: Number(src.manualAttempts || 0) || 0,
    successes: Number(src.successes || 0) || 0,
    linkSuccesses: Number(src.linkSuccesses || 0) || 0,
    manualSuccesses: Number(src.manualSuccesses || 0) || 0,
    errors: Number(src.errors || 0) || 0,
    roleRepairs: Number(src.roleRepairs || 0) || 0,
    moveBlocks: Number(src.moveBlocks || 0) || 0,
    last: safeEntry(src.last),
    lastLink: safeEntry(src.lastLink),
    lastManual: safeEntry(src.lastManual),
    lastRoleRepair: safeEntry(src.lastRoleRepair),
    lastMoveBlock: safeEntry(src.lastMoveBlock),
    history
  };
}

function tttReadOnlineJoinDiag() {
  try {
    const raw = typeof parseLocalStorageJsonCached === 'function'
      ? parseLocalStorageJsonCached(TTT_ONLINE_JOIN_DIAG_KEY, {})
      : JSON.parse(localStorage.getItem(TTT_ONLINE_JOIN_DIAG_KEY) || '{}');
    return tttNormalizeOnlineJoinDiag(raw);
  } catch (err) {
    return tttNormalizeOnlineJoinDiag(null);
  }
}

function tttWriteOnlineJoinDiag(next) {
  const safe = tttNormalizeOnlineJoinDiag(next);
  try {
    const payload = JSON.stringify(safe);
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(TTT_ONLINE_JOIN_DIAG_KEY, payload);
    else localStorage.setItem(TTT_ONLINE_JOIN_DIAG_KEY, payload);
  } catch (err) {}
  return safe;
}

function tttRememberOnlineJoinDiag(flow, stage, details) {
  const normalizedFlow = String(flow || 'manual').trim() === 'link' ? 'link' : 'manual';
  const normalizedStage = String(stage || 'start').trim() || 'start';
  const state = tttGetState();
  const online = state.online || {};
  const role = String((details && details.role) || online.role || '').toUpperCase();
  const turn = String((details && details.turn) || state.turn || '').toUpperCase();
  const entry = {
    flow: normalizedFlow,
    stage: normalizedStage,
    ok: normalizedStage === 'success',
    code: (details && details.code) || online.code || '',
    role,
    turn,
    mode: (details && details.mode) || state.mode || '',
    canMoveNow: !!(state.mode === 'pvp' && role && turn && role === turn && !state.gameOver),
    sessionId: (details && details.sessionId) || online.sessionId || '',
    inviteId: (details && details.inviteId) || online.inviteId || '',
    source: (details && details.source) || normalizedFlow,
    message: (details && details.message) || state.message || '',
    reason: (details && details.reason) || '',
    at: Date.now(),
    version: window.APP_VERSION || ''
  };
  const next = tttReadOnlineJoinDiag();
  next.version = window.APP_VERSION || next.version || '';
  if (normalizedStage === 'start') {
    next.attempts += 1;
    if (normalizedFlow === 'link') next.linkAttempts += 1;
    else next.manualAttempts += 1;
  } else if (normalizedStage === 'success') {
    next.successes += 1;
    if (normalizedFlow === 'link') next.linkSuccesses += 1;
    else next.manualSuccesses += 1;
  } else if (normalizedStage === 'error') {
    next.errors += 1;
  }
  next.last = entry;
  if (normalizedFlow === 'link') next.lastLink = entry;
  else next.lastManual = entry;
  next.history = (next.history || []).concat(entry).slice(-12);
  return tttWriteOnlineJoinDiag(next);
}


function tttRememberOnlineMoveBlock(reason, details) {
  try {
    const next = tttReadOnlineJoinDiag();
    const state = tttGetState();
    const online = state.online || {};
    const flow = String(online.joinFlow || '').trim() === 'link' ? 'link' : 'manual';
    const role = tttNormalizeOnlineRole((details && details.role) || online.role || '');
    const turn = String((details && details.turn) || state.turn || '').toUpperCase();
    const entry = {
      flow,
      stage: 'move-block',
      ok: false,
      code: (details && details.code) || online.code || '',
      role,
      turn,
      mode: state.mode || '',
      canMoveNow: !!(state.mode === 'pvp' && role && turn && role === turn && !state.gameOver),
      sessionId: (details && details.sessionId) || online.sessionId || '',
      inviteId: (details && details.inviteId) || online.inviteId || '',
      source: (details && details.source) || 'move-guard',
      message: (details && details.message) || state.message || '',
      reason: String(reason || 'blocked-move').slice(0, 180),
      at: Date.now(),
      version: window.APP_VERSION || ''
    };
    next.moveBlocks = (Number(next.moveBlocks || 0) || 0) + 1;
    next.lastMoveBlock = entry;
    next.last = entry;
    if (flow === 'link') next.lastLink = entry;
    else next.lastManual = entry;
    next.history = (next.history || []).concat(entry).slice(-12);
    tttWriteOnlineJoinDiag(next);
  } catch (err) {}
}

function tttRequestOnlineGuardResync(reason) {
  try {
    const state = tttGetState();
    if (!state || state.mode !== 'pvp' || !state.online || !state.online.code) return false;
    tttStartOnlineSyncLoop();
    window.setTimeout(() => { void tttSyncOnlineSession(true); }, 80);
    window.setTimeout(() => { void tttSyncOnlineSession(true); }, 650);
    return true;
  } catch (err) {
    return false;
  }
}

function tttGetOnlineJoinHealth() {
  const state = typeof app !== 'undefined' && app ? tttGetState() : null;
  const online = state && state.online ? state.online : {};
  const diag = tttReadOnlineJoinDiag();
  const issues = [];
  const warnings = [];
  if (typeof tttOpenFromInviteCode !== 'function') issues.push('chybí otevření pozvánky z odkazu');
  if (typeof tttJoinInviteSession !== 'function') issues.push('chybí společné přijetí pozvánky');
  if (typeof tttPrepareOnlineJoinState !== 'function') issues.push('chybí příprava online join stavu');
  if (diag.lastLink && diag.lastLink.stage === 'start') warnings.push('poslední link join zatím nemá potvrzený úspěch');
  if (diag.lastLink && diag.lastLink.stage === 'success' && diag.lastLink.mode !== 'pvp') issues.push('poslední link join neskončil v online režimu');
  if (diag.lastLink && diag.lastLink.stage === 'success' && String(diag.lastLink.role || '').toUpperCase() !== 'O') issues.push('poslední link join nemá roli O');
  if (diag.lastMoveBlock && String(diag.lastMoveBlock.reason || '') === 'missing-role-before-move') warnings.push('poslední online tah se zastavil kvůli nenačtené roli');
  if (diag.lastMoveBlock && String(diag.lastMoveBlock.reason || '') === 'turn-mismatch-before-move') warnings.push('poslední online tah byl mimo tah aktuálního hráče');
  if (state && state.mode === 'pvp' && online && online.code && !tttNormalizeOnlineRole(online.role || '')) issues.push('online režim nemá lokální roli hráče');
  return {
    ok: issues.length === 0,
    mode: 'ttt-online-link-join-runtime-guard',
    issues: issues.slice(0, 8),
    warnings: warnings.slice(0, 8),
    attempts: diag.attempts,
    linkAttempts: diag.linkAttempts,
    manualAttempts: diag.manualAttempts,
    successes: diag.successes,
    linkSuccesses: diag.linkSuccesses,
    manualSuccesses: diag.manualSuccesses,
    errors: diag.errors,
    roleRepairs: diag.roleRepairs,
    moveBlocks: diag.moveBlocks,
    last: diag.last,
    lastLink: diag.lastLink,
    lastManual: diag.lastManual,
    lastRoleRepair: diag.lastRoleRepair,
    lastMoveBlock: diag.lastMoveBlock,
    activeMode: state ? String(state.mode || '') : '',
    activeRole: String(online.role || '').toUpperCase(),
    activeTurn: state ? String(state.turn || '').toUpperCase() : '',
    activeCanMoveNow: !!(state && state.mode === 'pvp' && online.role && String(online.role).toUpperCase() === String(state.turn || '').toUpperCase() && !state.gameOver),
    activeCode: tttNormalizeInviteCode(online.code || ''),
    checkedAt: new Date().toISOString()
  };
}

if (typeof window !== 'undefined') {
  window.getTttOnlineJoinHealth = tttGetOnlineJoinHealth;
}

function tttNormalizeOnlineRole(role) {
  const upper = String(role || '').trim().toUpperCase();
  return upper === 'X' || upper === 'O' ? upper : '';
}

function tttExtractOnlinePlayerAccounts(statePatch, remote) {
  const patch = statePatch && typeof statePatch === 'object' ? statePatch : {};
  const online = tttGetState().online || {};
  const result = {
    x: String(patch.playerXAccountNumber || patch.player_x_account_number || online.playerXAccountNumber || '').trim(),
    o: String(patch.playerOAccountNumber || patch.player_o_account_number || online.playerOAccountNumber || '').trim()
  };
  const session = remote && remote.session && typeof remote.session === 'object' ? remote.session : null;
  const invite = remote && remote.invite && typeof remote.invite === 'object' ? remote.invite : null;
  if (session) {
    result.x = String(session.player_x_account_number || result.x || '').trim();
    result.o = String(session.player_o_account_number || result.o || '').trim();
  }
  if (invite) {
    result.x = String(invite.inviter_account_number || result.x || '').trim();
    result.o = String(invite.invitee_account_number || result.o || '').trim();
  }
  return result;
}

function tttRememberOnlineRoleRepair(details) {
  try {
    const next = tttReadOnlineJoinDiag();
    const state = tttGetState();
    const online = state.online || {};
    const entry = {
      flow: 'runtime',
      stage: 'role-repair',
      ok: true,
      code: (details && details.code) || online.code || '',
      role: tttNormalizeOnlineRole((details && details.role) || online.role || ''),
      turn: String((details && details.turn) || state.turn || '').toUpperCase(),
      mode: state.mode || '',
      canMoveNow: !!(state.mode === 'pvp' && online.role && tttNormalizeOnlineRole(online.role) === String(state.turn || '').toUpperCase() && !state.gameOver),
      sessionId: (details && details.sessionId) || online.sessionId || '',
      inviteId: (details && details.inviteId) || online.inviteId || '',
      source: (details && details.source) || 'role-guard',
      message: (details && details.message) || state.message || '',
      reason: (details && details.reason) || '',
      at: Date.now(),
      version: window.APP_VERSION || ''
    };
    next.roleRepairs = (Number(next.roleRepairs || 0) || 0) + 1;
    next.lastRoleRepair = entry;
    next.last = entry;
    next.history = (next.history || []).concat(entry).slice(-12);
    tttWriteOnlineJoinDiag(next);
  } catch (err) {}
}

function tttEnsureOnlineRoleFromAccounts(state, statePatch, remote, source) {
  const s = state || tttGetState();
  if (!s.online) s.online = tttCreateEmptyOnlineState();
  const accounts = tttExtractOnlinePlayerAccounts(statePatch, remote);
  if (accounts.x && !s.online.playerXAccountNumber) s.online.playerXAccountNumber = accounts.x;
  if (accounts.o && !s.online.playerOAccountNumber) s.online.playerOAccountNumber = accounts.o;
  const activeAccount = tttGetActiveAccountId();
  const previousRole = tttNormalizeOnlineRole(s.online.role);
  let nextRole = previousRole;
  if (activeAccount && accounts.o && String(activeAccount) === String(accounts.o)) nextRole = 'O';
  else if (activeAccount && accounts.x && String(activeAccount) === String(accounts.x)) nextRole = 'X';
  else if (!nextRole) nextRole = tttNormalizeOnlineRole(remote && remote.role);
  if (nextRole && nextRole !== previousRole) {
    s.online.role = nextRole.toLowerCase();
    tttRememberOnlineRoleRepair({
      code: s.online.code || '',
      role: nextRole,
      turn: s.turn || '',
      sessionId: s.online.sessionId || '',
      inviteId: s.online.inviteId || '',
      source: source || 'role-guard',
      reason: previousRole ? ('role-conflict-' + previousRole + '-to-' + nextRole) : 'missing-role'
    });
  }
  return tttNormalizeOnlineRole(s.online.role);
}

function tttSetJoinedOnlineMessage(state) {
  const s = state || tttGetState();
  const online = s.online || {};
  const role = String(online.role || '').toUpperCase() || 'O';
  const turn = String(s.turn || 'X').toUpperCase();
  if (s.gameOver) return s.message || 'Partie je dokončená.';
  s.message = role && turn === role ? ('Jsi ' + role + '. Hraješ.') : ('Čekáš na tah hráče ' + turn + '.');
  tttSetOnlineStatus(s.message, 'active');
  return s.message;
}

function tttBuildOnlineResultKey(code, revision, winner, role, sessionId) {

  const sessionPart = String(sessionId || code || '').trim().toUpperCase();
  return [
    sessionPart || 'NOSESSION',
    String(role || '').trim().toUpperCase() || 'N',
    String(winner || 'draw').trim().toUpperCase() || 'DRAW'
  ].join(':');
}

function tttMarkOnlineResultSeen(code, revision, winner, role, sessionId) {
  const key = tttBuildOnlineResultKey(code, revision, winner, role, sessionId);
  const store = tttReadOnlineResultStore();
  if (store[key]) return false;
  store[key] = Date.now();
  tttWriteOnlineResultStore(store);
  return true;
}


function tttGetAccountDisplayName(accountNumber) {
  const id = String(accountNumber || '').trim();
  if (!id) return '';
  try {
    const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
    const account = profile && profile.accounts ? profile.accounts[id] : null;
    if (account && account.name) return String(account.name).trim();
  } catch (err) {}
  try {
    if (Array.isArray(window.GAMES_ACCOUNT_LIST)) {
      const match = window.GAMES_ACCOUNT_LIST.find(acc => String(acc && acc.id || '').trim() === id);
      if (match && match.name) return String(match.name).trim();
    }
  } catch (err) {}
  try {
    if (typeof GAMES_ACCOUNT_LIST !== 'undefined' && Array.isArray(GAMES_ACCOUNT_LIST)) {
      const match = GAMES_ACCOUNT_LIST.find(acc => String(acc && acc.id || '').trim() === id);
      if (match && match.name) return String(match.name).trim();
    }
  } catch (err) {}
  return 'Hráč ' + id;
}

function tttGetOnlineCodeText() {
  const state = tttGetState();
  const online = state.online || {};
  const code = String(online.code || '').trim();
  if (!code) return '';
  if (String(online.status || '').toLowerCase() === 'waiting' || !online.playerOAccountNumber) {
    return 'Kód pozvánky: ' + code;
  }
  return '';
}

function tttBuildOnlineScoreText() {
  const state = tttGetState();
  const online = state.online || {};
  const xAcc = String(online.playerXAccountNumber || '').trim();
  const oAcc = String(online.playerOAccountNumber || '').trim();
  if (!xAcc || !oAcc) return '';
  const xName = tttGetAccountDisplayName(xAcc) || 'Hráč X';
  const oName = tttGetAccountDisplayName(oAcc) || 'Hráč O';
  const score = online.headToHead && online.headToHead.score ? online.headToHead.score : null;
  let xWins = 0;
  let oWins = 0;
  if (score) {
    if (Number.isFinite(Number(score.xWins)) || Number.isFinite(Number(score.oWins))) {
      xWins = Number(score.xWins || 0) || 0;
      oWins = Number(score.oWins || 0) || 0;
    } else {
      const players = online.headToHead && online.headToHead.players ? online.headToHead.players : {};
      const a = String(players.a || '').trim();
      const b = String(players.b || '').trim();
      if (a && b) {
        xWins = xAcc === a ? Number(score.aWins || 0) || 0 : Number(score.bWins || 0) || 0;
        oWins = oAcc === a ? Number(score.aWins || 0) || 0 : Number(score.bWins || 0) || 0;
      } else {
        xWins = Number(score.aWins || 0) || 0;
        oWins = Number(score.bWins || 0) || 0;
      }
    }
  }
  return xName + ' (x) ' + xWins + ':' + oWins + ' ' + oName + ' (o)';
}


function tttBumpOnlineHeadToHeadLocally(winner) {
  const state = tttGetState();
  const online = state.online || {};
  const xAcc = String(online.playerXAccountNumber || '').trim();
  const oAcc = String(online.playerOAccountNumber || '').trim();
  const result = String(winner || '').trim();
  if (!xAcc || !oAcc || !['X', 'O', 'draw'].includes(result)) return false;
  const current = online.headToHead && typeof online.headToHead === 'object' ? online.headToHead : { ok: true, score: {}, players: { a: xAcc, b: oAcc }, rows: [] };
  const score = Object.assign({ xWins: 0, oWins: 0, aWins: 0, bWins: 0, draws: 0, total: 0 }, current.score && typeof current.score === 'object' ? current.score : {});
  const players = Object.assign({ a: xAcc, b: oAcc }, current.players && typeof current.players === 'object' ? current.players : {});
  if (result === 'draw') score.draws = (Number(score.draws || 0) || 0) + 1;
  else if (result === 'X') score.xWins = (Number(score.xWins || 0) || 0) + 1;
  else if (result === 'O') score.oWins = (Number(score.oWins || 0) || 0) + 1;
  const winnerAcc = result === 'X' ? xAcc : (result === 'O' ? oAcc : '');
  if (winnerAcc && String(players.a || '').trim() === winnerAcc) score.aWins = (Number(score.aWins || 0) || 0) + 1;
  else if (winnerAcc && String(players.b || '').trim() === winnerAcc) score.bWins = (Number(score.bWins || 0) || 0) + 1;
  score.total = (Number(score.total || 0) || 0) + 1;
  online.headToHead = Object.assign({}, current, { ok: true, optimistic: true, score, players, updatedAt: new Date().toISOString() });
  online.headToHeadText = tttBuildOnlineScoreText();
  online.headToHeadLoadedAt = Date.now();
  state.online = online;
  return true;
}

function tttRenderInviteOverlay(overlay) {
  const state = tttGetState();
  const el = overlay ? overlay.querySelector('#tttInviteOverlay') : null;
  if (!el) return;
  const online = state.online || {};
  const code = String(online.code || '').trim();
  const waiting = state.mode === 'pvp' && code && (String(online.status || '').toLowerCase() === 'waiting' || !online.playerOAccountNumber) && !state.gameOver;
  el.hidden = !waiting;
  el.classList.toggle('isVisible', !!waiting);
  if (!waiting) {
    el.textContent = '';
    return;
  }
  const inviteUrl = online.inviteUrl || tttGetInviteUrl(code);
  if (state.online) state.online.inviteUrl = inviteUrl;
  const fragment = document.createDocumentFragment();
  const label = document.createElement('div');
  label.className = 'tttInviteOverlayLabel';
  label.textContent = 'Pozvánka pro spoluhráče';
  const codeEl = document.createElement('div');
  codeEl.className = 'tttInviteOverlayCode';
  codeEl.textContent = code;
  const hint = document.createElement('div');
  hint.className = 'tttInviteOverlayHint';
  hint.textContent = 'Může opsat 4 čísla, nebo mu pošli odkaz a hra se mu otevře rovnou.';
  const linkEl = document.createElement('div');
  linkEl.className = 'tttInviteOverlayLink';
  linkEl.textContent = inviteUrl;
  const actions = document.createElement('div');
  actions.className = 'tttInviteOverlayActions';
  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'tttBtn tttInviteOverlayBtn';
  copyBtn.textContent = 'Kopírovat odkaz';
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      copyBtn.textContent = 'Odkaz zkopírován';
      window.setTimeout(() => { copyBtn.textContent = 'Kopírovat odkaz'; }, 1400);
    } catch (err) {
      copyBtn.textContent = 'Nešlo zkopírovat';
      window.setTimeout(() => { copyBtn.textContent = 'Kopírovat odkaz'; }, 1400);
    }
  });
  const shareBtn = document.createElement('button');
  shareBtn.type = 'button';
  shareBtn.className = 'tttBtn tttInviteOverlayBtn';
  shareBtn.textContent = 'Sdílet';
  shareBtn.addEventListener('click', async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Piškvorky', text: 'Přidej se ke hře v RaK.', url: inviteUrl });
      else await navigator.clipboard.writeText(inviteUrl);
    } catch (err) {}
  });
  actions.appendChild(copyBtn);
  actions.appendChild(shareBtn);
  fragment.appendChild(label);
  fragment.appendChild(codeEl);
  fragment.appendChild(hint);
  fragment.appendChild(linkEl);
  fragment.appendChild(actions);
  if (typeof replaceElementChildrenSafely === 'function') replaceElementChildrenSafely(el, fragment, 'ttt-invite-overlay');
  else {
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(fragment);
  }
}

async function tttRefreshOnlineHeadToHead(force) {
  const state = tttGetState();
  const online = state.online || {};
  const x = String(online.playerXAccountNumber || '').trim();
  const o = String(online.playerOAccountNumber || '').trim();
  if (!x || !o || !window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.loadTttHeadToHead !== 'function') return null;
  try {
    const res = await window.RotationSupabaseBridge.loadTttHeadToHead(x, o, { force: !!force });
    if (res && res.ok) {
      online.headToHead = res;
      online.headToHeadText = tttBuildOnlineScoreText();
      state.online = online;
      return res;
    }
  } catch (err) {
    console.warn('TTT head-to-head load failed', err);
  }
  return null;
}

async function tttRecordOnlineSessionResult(force) {
  const state = tttGetState();
  const online = state.online || {};
  if (!online.code || !window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.recordTttSessionResultByInviteCode !== 'function') return null;
  try {
    const res = await window.RotationSupabaseBridge.recordTttSessionResultByInviteCode(online.code, { force: !!force });
    if (res && res.ok) {
      void gamesRefreshRemoteLeaderboards('ttt', true).then(() => {
        if (typeof gamesSyncProfileFromRemote === 'function') return gamesSyncProfileFromRemote(true);
        return null;
      }).then(() => {
        if (typeof gamesRenderProfiles === 'function') gamesRenderProfiles();
      });
      void tttRefreshOnlineHeadToHead(true).then(() => {
        if (typeof tttRender === 'function') tttRender();
      });
      void tttRefreshOnlineScoreRows(true);
    }
    return res;
  } catch (err) {
    console.warn('TTT online stats record failed', err);
    return null;
  }
}

function tttMakeOnlineStatePatch(extraPatch) {
  const state = tttGetState();
  const online = state.online || {};
  const now = Date.now();
  const revision = Number(online.pendingRevision || online.revision || 0) || 0;
  const patch = {
    board: state.board.slice(),
    turn: state.turn,
    gameOver: !!state.gameOver,
    winner: state.winner || null,
    message: state.message || '',
    moveCount: state.moveCount || 0,
    moveCountX: state.moveCountX || 0,
    moveCountO: state.moveCountO || 0,
    startedAt: state.startedAt || 0,
    status: state.gameOver ? 'finished' : (online.status || 'active'),
    revision,
    updatedAtTs: now,
    updatedAt: new Date(now).toISOString(),
    lastMoveIndex: Number.isFinite(Number(state.lastMoveIndex)) ? Number(state.lastMoveIndex) : null,
    lastMoveMark: state.lastMoveMark || null,
    lastMoveByRole: online.role || null,
    playerXAccountNumber: online.playerXAccountNumber || null,
    playerOAccountNumber: online.playerOAccountNumber || null,
    winnerRole: state.gameOver ? (state.winner || null) : null,
    nextStarter: state.nextStarter || (state.gameOver && ['X','O'].includes(String(state.winner || '')) ? state.winner : null),
    rulesetVersion: GOMOKU_RULESET_VERSION,
    rows: TTT_ROWS,
    cols: TTT_COLS,
    winLength: TTT_WIN_LENGTH,
    engineProfile: 'deterministic-10x19-tss-pvs-safe-v951',
    winnerAccountNumber: null
  };
  if (patch.winner === 'X') patch.winnerAccountNumber = online.playerXAccountNumber || null;
  else if (patch.winner === 'O') patch.winnerAccountNumber = online.playerOAccountNumber || null;
  else if (patch.winner === 'draw') patch.winnerAccountNumber = null;
  return Object.assign(patch, extraPatch && typeof extraPatch === 'object' ? extraPatch : {});
}

function tttApplyOnlineState(statePatch, remote) {
  const state = tttGetState();
  if (!statePatch || typeof statePatch !== 'object') return false;

  const remoteBoard = Array.isArray(statePatch.board) ? statePatch.board : null;
  const remoteRows = Number(statePatch.rows || statePatch.boardRows || 0) || 0;
  const remoteCols = Number(statePatch.cols || statePatch.columns || statePatch.boardCols || 0) || 0;
  const remoteWinLength = Number(statePatch.winLength || statePatch.win_length || 0) || 0;
  const remoteRuleset = String(statePatch.rulesetVersion || statePatch.ruleset_version || '').trim();
  const dimensionMismatch = (remoteBoard && remoteBoard.length !== TTT_TOTAL_CELLS)
    || (remoteRows && remoteRows !== TTT_ROWS)
    || (remoteCols && remoteCols !== TTT_COLS)
    || (remoteWinLength && remoteWinLength !== TTT_WIN_LENGTH);
  if (dimensionMismatch) {
    if (!state.online) state.online = {};
    state.online.status = 'incompatible';
    state.online.connected = false;
    state.message = 'Tahle online pozvánka je z jiné verze Piškvorek. Vytvoř novou hru.';
    tttSetOnlineStatus(state.message, 'error');
    return false;
  }
  if (remoteRuleset && remoteRuleset !== GOMOKU_RULESET_VERSION) {
    if (!state.online) state.online = {};
    state.online.status = 'incompatible';
    state.online.connected = false;
    state.message = 'Tahle online hra používá jinou verzi pravidel Piškvorek. Vytvoř novou hru.';
    tttSetOnlineStatus(state.message, 'error');
    return false;
  }

  if (remoteBoard && remoteBoard.length === TTT_TOTAL_CELLS) {
    state.board = remoteBoard.slice();
  }
  state.turn = statePatch.turn === 'O' ? 'O' : 'X';
  state.gameOver = !!statePatch.gameOver;
  state.winner = statePatch.winner || null;
  if (['X', 'O'].includes(String(statePatch.nextStarter || ''))) state.nextStarter = statePatch.nextStarter;
  state.message = statePatch.message || (state.gameOver
    ? (state.winner === 'draw' ? 'Remíza. Dobře hrané.' : ('Vyhrál hráč ' + state.winner + '.'))
    : (state.turn === 'X' ? 'Hraje hráč X.' : 'Hraje hráč O.'));
  state.moveCount = Number(statePatch.moveCount || 0) || 0;
  state.moveCountX = Number(statePatch.moveCountX || 0) || 0;
  state.moveCountO = Number(statePatch.moveCountO || 0) || 0;
  state.startedAt = Number(statePatch.startedAt || state.startedAt || 0) || 0;
  state.lastMoveIndex = Number.isFinite(Number(statePatch.lastMoveIndex)) ? Number(statePatch.lastMoveIndex) : null;
  state.lastMoveMark = statePatch.lastMoveMark || null;

  if (!state.online) state.online = {};
  state.online.code = String((remote && remote.code) || state.online.code || '').trim().toUpperCase();
  state.online.inviteId = remote && remote.inviteId ? remote.inviteId : (state.online.inviteId || null);
  state.online.sessionId = remote && remote.sessionId ? remote.sessionId : (state.online.sessionId || null);
  state.online.role = state.online.role || (remote && remote.role) || '';
  state.online.status = statePatch.status || state.online.status || 'active';
  state.online.revision = Number(statePatch.revision || state.online.revision || 0) || 0;
  state.online.pendingRevision = Math.max(Number(state.online.pendingRevision || 0) || 0, state.online.revision);
  state.online.lastUpdatedAt = Number(statePatch.updatedAtTs || state.online.lastUpdatedAt || Date.now()) || Date.now();
  state.online.lastRemoteUpdatedAt = state.online.lastUpdatedAt;
  state.online.playerXAccountNumber = statePatch.playerXAccountNumber || state.online.playerXAccountNumber || null;
  state.online.playerOAccountNumber = statePatch.playerOAccountNumber || state.online.playerOAccountNumber || null;
  tttEnsureOnlineRoleFromAccounts(state, statePatch, remote, 'apply-online-state');
  if (state.online.playerOAccountNumber && String(state.online.status || '').toLowerCase() === 'waiting') state.online.status = 'active';
  state.online.headToHeadText = tttBuildOnlineScoreText();
  state.online.connected = true;
  state.online.dirty = false;
  state.online.resultSavedKey = state.online.resultSavedKey || '';
  state.online.statsRecordedAt = statePatch.statsRecordedAt || state.online.statsRecordedAt || '';
  state.online.statsRecordedBy = statePatch.statsRecordedBy || state.online.statsRecordedBy || '';
  tttSetOnlineStatus(state.message, state.gameOver ? 'finished' : state.online.status);
  return true;
}

function tttMaybeRecordOnlineResult(winner) {
  const state = tttGetState();
  const online = state.online || null;
  if (!online || !online.code) return false;
  if (!['X', 'O', 'draw'].includes(String(winner || '').trim())) return false;
  const key = tttBuildOnlineResultKey(online.code, online.revision || online.pendingRevision || 0, winner, online.role || '', online.sessionId || '');
  if (online.resultSavedKey === key) return false;
  const store = tttReadOnlineResultStore();
  if (store[key]) {
    online.resultSavedKey = key;
    return false;
  }
  store[key] = Date.now();
  tttWriteOnlineResultStore(store);
  online.resultSavedKey = key;
  tttBumpOnlineHeadToHeadLocally(winner);

  const active = typeof gamesGetActiveAccount === 'function' ? gamesGetActiveAccount() : null;
  if (active && active.stats && active.stats.ttt && typeof gamesRecordStat === 'function') {
    const stats = active.stats.ttt || {};
    const played = (stats.plays || 0) + 1;
    const isDraw = winner === 'draw';
    const role = String(online.role || '').toUpperCase();
    const won = !isDraw && String(winner || '').toUpperCase() === role;
    const onlineLocalGuard = {
      skipOnlineSync: true,
      onlineSessionId: String(online.sessionId || online.code || '').trim(),
      onlineResultKey: key
    };
    gamesRecordStat('ttt', isDraw
      ? Object.assign({
          completed: true,
          online: true,
          onlinePlay: true,
          onlinePlays: 1,
          plays: played,
          draws: (stats.draws || 0) + 1,
          bestMoves: stats.bestMoves || null,
          bestTimeMs: stats.bestTimeMs || null,
          lastResult: 'Online remíza · ' + String(state.moveCount || 0) + ' tahů'
        }, onlineLocalGuard)
      : Object.assign({
          completed: true,
          online: true,
          onlinePlay: true,
          onlinePlays: 1,
          onlineWin: won,
          onlineWins: won ? 1 : 0,
          plays: played,
          wins: won ? (stats.wins || 0) + 1 : (stats.wins || 0),
          losses: won ? (stats.losses || 0) : (stats.losses || 0) + 1,
          draws: stats.draws || 0,
          bestMoves: won ? Math.min(stats.bestMoves || 9999, state.moveCount || 0) : stats.bestMoves || null,
          bestTimeMs: won ? Math.min(stats.bestTimeMs || 999999999, tttGetElapsedMs(state)) : stats.bestTimeMs || null,
          lastResult: (won ? 'Online výhra' : 'Online prohra') + ' · ' + String(state.moveCount || 0) + ' tahů'
        }, onlineLocalGuard));
  }
  void tttRecordOnlineSessionResult(false);
  void gamesRefreshRemoteLeaderboards('ttt', true);
  void tttRefreshOnlineHeadToHead(true).then(() => {
    if (typeof tttRender === 'function' && document.getElementById('tttOverlay')?.classList.contains('isVisible')) tttRender();
  });
  void tttRefreshOnlineScoreRows(true);
  return true;
}

async function tttCreateInviteSession() {
  const state = tttGetState();
  const code = tttMakeInviteCode();
  const active = typeof gamesGetActiveAccount === 'function' ? gamesGetActiveAccount() : null;
  const inviter = active && active.id ? String(active.id) : null;
  const payload = {
    board: Array(TTT_TOTAL_CELLS).fill(''),
    turn: 'X',
    status: 'waiting',
    mode: 'pvp',
    code,
    playerXAccountNumber: inviter,
    playerOAccountNumber: null,
    x: inviter,
    o: null,
    createdAt: Date.now(),
    revision: 0,
    updatedAtTs: Date.now()
  };
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.createGameInvite === 'function') {
    const result = await window.RotationSupabaseBridge.createGameInvite({
      code,
      inviterAccountNumber: inviter,
      boardState: payload,
      payload: { createdBy: inviter }
    });
    if (result && result.ok) {
      state.online = {
        code,
        inviteId: result.inviteId || (result.invite && result.invite.id) || (result.result && result.result.invite && result.result.invite.id) || null,
        sessionId: result.sessionId || (result.session && result.session.id) || (result.result && result.result.session && result.result.session.id) || null,
        role: 'x',
        status: 'waiting',
        revision: 0,
        lastUpdatedAt: Date.now(),
        lastRemoteUpdatedAt: 0,
        dirty: false,
        pendingRevision: 0,
        playerXAccountNumber: inviter,
        playerOAccountNumber: null,
        connected: true,
        resultSavedKey: '',
        inviteUrl: '',
        joinFlow: 'create',
        joinSource: 'create-invite'
      };
      state.online.inviteUrl = tttGetInviteUrl(code);
      tttSetOnlineStatus('Pozvánka vytvořená na 60 minut. Kód pro spoluhráče: ' + code + '.', 'waiting');
      return { ok: true, code, url: tttGetInviteUrl(code), result };
    }
  }
  state.online = {
    code,
    inviteId: null,
    sessionId: null,
    role: 'x',
    status: 'waiting',
    revision: 0,
    lastUpdatedAt: Date.now(),
    lastRemoteUpdatedAt: 0,
    dirty: false,
    pendingRevision: 0,
    playerXAccountNumber: inviter,
    playerOAccountNumber: null,
    connected: true,
    resultSavedKey: '',
    inviteUrl: tttGetInviteUrl(code),
    joinFlow: 'create',
    joinSource: 'create-invite-local'
  };
  tttSetOnlineStatus('Pozvánka vytvořená lokálně. Kód pro spoluhráče: ' + code + '.', 'waiting');
  return { ok: true, code, url: tttGetInviteUrl(code), local: true };
}

function tttInviteResultMessage(result, fallback) {
  if (!result) return fallback || 'Pozvánku se nepodařilo načíst.';
  if (result.expired || result.reason === 'expired-invite' || result.reason === 'INVITE_EXPIRED') return 'Tahle pozvánka už vypršela. Vytvoř novou.';
  if (result.message) return String(result.message);
  if (result.error && result.error.message) return String(result.error.message);
  return fallback || 'Pozvánku se nepodařilo načíst.';
}

function tttPrepareOnlineJoinState(state, inviteCode) {
  const s = state || tttGetState();
  const code = tttNormalizeInviteCode(inviteCode);
  if (!s.online) s.online = tttCreateEmptyOnlineState();
  s.mode = 'pvp';
  s.difficulty = 'ai';
  s.screen = 'game';
  s.gameOver = false;
  s.winner = null;
  s.hardWinPrompt = false;
  s.hardWinStats = null;
  s.resultSaved = false;
  s.resultOnlineSaved = false;
  s.resultSummary = null;
  if (code) {
    s.online.code = code;
    s.online.inviteUrl = tttGetInviteUrl(code);
  }
  return s;
}

async function tttJoinInviteSession(code, options) {
  const state = tttGetState();
  const inviteCode = tttNormalizeInviteCode(code);
  const flow = options && String(options.flow || '').trim() === 'link' ? 'link' : 'manual';
  const joinSource = String(options && options.source || 'join-session').slice(0, 32) || 'join-session';
  if (!inviteCode || inviteCode.length !== 4) {
    tttRememberOnlineJoinDiag(flow, 'error', { code: inviteCode, reason: 'neplatný 4místný kód' });
    return { ok: false, error: new Error('Zadej 4 čísla kódu pozvánky.') };
  }
  tttPrepareOnlineJoinState(state, inviteCode);
  if (state.online) {
    state.online.joinFlow = flow;
    state.online.joinSource = joinSource;
  }
  tttRememberOnlineJoinDiag(flow, 'start', { code: inviteCode, source: joinSource });
  const active = typeof gamesGetActiveAccount === 'function' ? gamesGetActiveAccount() : null;
  const joiner = active && active.id ? String(active.id) : null;
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.acceptGameInvite === 'function') {
    const result = await window.RotationSupabaseBridge.acceptGameInvite(inviteCode, joiner);
    if (result && result.ok) {
      state.online = {
        code: inviteCode,
        inviteId: result.inviteId || (result.invite && result.invite.id) || (result.result && result.result.invite && result.result.invite.id) || null,
        sessionId: result.sessionId || (result.session && result.session.id) || (result.result && result.result.session && result.result.session.id) || null,
        role: 'o',
        status: 'active',
        revision: Number(result.revision || 0) || 0,
        lastUpdatedAt: Date.now(),
        lastRemoteUpdatedAt: 0,
        dirty: false,
        pendingRevision: Number(result.revision || 0) || 0,
        playerXAccountNumber: (result.session && result.session.player_x_account_number) || (result.result && result.result.session && result.result.session.player_x_account_number) || null,
        playerOAccountNumber: joiner,
        connected: true,
        resultSavedKey: '',
        inviteUrl: '',
        joinFlow: flow,
        joinSource
      };
      const session = result.session || (result.result && result.result.session) || null;
      const boardState = session && session.board_state && typeof session.board_state === 'object' ? session.board_state : null;
      if (boardState) {
        tttApplyOnlineState(Object.assign({}, boardState, {
          status: 'active',
          playerXAccountNumber: session.player_x_account_number || state.online.playerXAccountNumber || null,
          playerOAccountNumber: session.player_o_account_number || state.online.playerOAccountNumber || null
        }), {
          code: inviteCode,
          inviteId: state.online.inviteId,
          sessionId: state.online.sessionId,
          role: 'o',
          status: 'active'
        });
      }
      tttSetJoinedOnlineMessage(state);
      tttRememberOnlineJoinDiag(flow, 'success', { code: inviteCode, source: joinSource + '-supabase-accept', role: state.online && state.online.role, turn: state.turn, sessionId: state.online && state.online.sessionId, inviteId: state.online && state.online.inviteId, message: state.message });
      return { ok: true, code: inviteCode, result };
    }
    if (result && result.ok === false) {
      state.message = tttInviteResultMessage(result, 'Pozvánku se nepodařilo načíst online. Zkontroluj 4místný kód.');
      tttSetOnlineStatus(state.message, 'error');
      tttRememberOnlineJoinDiag(flow, 'error', { code: inviteCode, source: joinSource + '-supabase-accept', reason: state.message });
      return result;
    }
  }
  state.online = {
    code: inviteCode,
    inviteId: null,
    sessionId: null,
    role: 'o',
    status: 'active',
    revision: 0,
    lastUpdatedAt: Date.now(),
    lastRemoteUpdatedAt: 0,
    dirty: false,
    pendingRevision: 0,
    playerXAccountNumber: null,
    playerOAccountNumber: joiner,
    connected: true,
    resultSavedKey: '',
    inviteUrl: tttGetInviteUrl(inviteCode),
    joinFlow: flow,
    joinSource
  };
  tttSetJoinedOnlineMessage(state);
  tttRememberOnlineJoinDiag(flow, 'success', { code: inviteCode, source: joinSource + '-local-fallback', role: state.online && state.online.role, turn: state.turn, message: state.message });
  return { ok: true, code: inviteCode, local: true };
}

function tttStopOnlineSync() {
  const state = tttGetState();
  if (state.onlineSyncTimer) {
    clearInterval(state.onlineSyncTimer);
    state.onlineSyncTimer = null;
  }
}

async function tttSyncOnlineSession(force) {
  const state = tttGetState();
  if (!state.online || !state.online.code) return;
  const code = state.online.code;
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadGameSessionByInviteCode === 'function') {
    try {
      const remote = await window.RotationSupabaseBridge.loadGameSessionByInviteCode(code);
      if (remote && remote.ok === false && (remote.expired || remote.reason === 'expired-invite')) {
        state.online.status = 'expired';
        state.online.connected = false;
        state.message = tttInviteResultMessage(remote, 'Tahle pozvánka už vypršela. Vytvoř novou.');
        tttSetOnlineStatus(state.message, 'error');
        tttStopOnlineSync();
        tttRender();
        scheduleTttLayout();
        return;
      }
      if (remote && remote.ok && !remote.session && remote.invite && String(remote.invite.status || '').toLowerCase() === 'accepted') {
        state.online.status = 'active';
        if (remote.invite && remote.invite.invitee_account_number) state.online.playerOAccountNumber = remote.invite.invitee_account_number;
        if (remote.invite && remote.invite.inviter_account_number) state.online.playerXAccountNumber = remote.invite.inviter_account_number;
        tttEnsureOnlineRoleFromAccounts(state, {}, { invite: remote.invite }, 'sync-accepted-invite');
        state.online.headToHeadText = tttBuildOnlineScoreText();
        void tttRefreshOnlineHeadToHead(true);
        state.message = String(state.online.role || '').toUpperCase() === 'X' ? 'Jsi X. Hraješ.' : 'Čekáš na tah hráče X.';
        tttSetOnlineStatus(state.message, 'active');
        tttRender();
        scheduleTttLayout();
      }
      if (remote && remote.ok && remote.session) {
        const session = remote.session;
        const boardState = session.board_state && typeof session.board_state === 'object' ? session.board_state : {};
        const remoteRevision = Number(boardState.revision || 0) || 0;
        const remoteStamp = Number(boardState.updatedAtTs || session.updated_at_ts || new Date(session.updated_at || 0).getTime() || 0) || 0;
        const localRevision = Number(state.online.revision || 0) || 0;
        const localStamp = Number(state.online.lastUpdatedAt || 0) || 0;
        const shouldAdopt = force || remoteRevision > localRevision || (remoteRevision === localRevision && remoteStamp > localStamp) || (!state.board.some(Boolean) && Array.isArray(boardState.board) && boardState.board.some(Boolean));
        if (shouldAdopt) {
          state.online.lastRemoteUpdatedAt = remoteStamp;
          tttApplyOnlineState(Object.assign({}, boardState, {
            revision: remoteRevision,
            updatedAtTs: remoteStamp,
            status: session.status || boardState.status || 'active',
            playerXAccountNumber: session.player_x_account_number || boardState.playerXAccountNumber || null,
            playerOAccountNumber: session.player_o_account_number || boardState.playerOAccountNumber || null
          }), {
            code,
            inviteId: remote.invite && remote.invite.id ? remote.invite.id : state.online.inviteId,
            sessionId: session.id || state.online.sessionId || null,
            role: state.online.role || '',
            status: session.status || boardState.status || 'active'
          });
          const ownRole = String(state.online.role || '').toUpperCase();
          if (!state.gameOver && ownRole) {
            state.message = state.turn === ownRole ? ('Jsi ' + ownRole + '. Hraješ.') : ('Čekáš na tah hráče ' + state.turn + '.');
            tttSetOnlineStatus(state.message, state.online.status || 'active');
          }
          if (state.online && state.online.playerOAccountNumber) {
            state.online.status = state.gameOver ? 'finished' : 'active';
            state.online.headToHeadText = tttBuildOnlineScoreText();
            void tttRefreshOnlineHeadToHead(false);
          }
          tttRender();
          scheduleTttLayout();
          if (state.gameOver) {
            tttMaybeRecordOnlineResult(state.winner || boardState.winner || 'draw');
          }
        }
        if (state.online.dirty && Number(state.online.pendingRevision || 0) > remoteRevision) {
          await tttPushOnlineSession({ status: state.gameOver ? 'finished' : (state.online.status || 'active') });
        }
      }
    } catch (err) {
      console.warn('TTT online sync failed', err);
      state.online.connected = false;
    }
  }
}

function tttStartOnlineSyncLoop() {
  const state = tttGetState();
  if (!state.online || !state.online.code) return;
  tttBindOnlineLifecycle();
  if (state.onlineSyncTimer) return;
  state.onlineSyncTimer = setInterval(() => { void tttSyncOnlineSession(false); }, TTT_ONLINE_POLL_MS);
}

function tttBindOnlineLifecycle() {
  if (window.__tttOnlineLifecycleBound) return;
  window.__tttOnlineLifecycleBound = true;
  window.addEventListener('online', () => {
    const state = tttGetState();
    if (!state.online || !state.online.code) return;
    state.online.connected = true;
    void tttSyncOnlineSession(true);
    if (state.online.dirty) {
      setTimeout(() => { void tttPushOnlineSession({ status: state.gameOver ? 'finished' : (state.online.status || 'active') }); }, 220);
    }
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    const state = tttGetState();
    if (!state.online || !state.online.code) return;
    void tttSyncOnlineSession(true);
    if (state.online.dirty) {
      setTimeout(() => { void tttPushOnlineSession({ status: state.gameOver ? 'finished' : (state.online.status || 'active') }); }, 180);
    }
  });
}

async function tttPushOnlineSession(extraPatch) {
  const state = tttGetState();
  if (!state.online || !state.online.code) return;
  const nextRevision = Math.max(Number(state.online.revision || 0) || 0, Number(state.online.pendingRevision || 0) || 0) + 1;
  const payload = tttMakeOnlineStatePatch(Object.assign({}, extraPatch, {
    revision: nextRevision,
    status: (extraPatch && extraPatch.status) || (state.gameOver ? 'finished' : (state.online.status === 'waiting' ? 'waiting' : 'active'))
  }));
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveGameSessionByInviteCode === 'function') {
    try {
      const result = await window.RotationSupabaseBridge.saveGameSessionByInviteCode(state.online.code, payload);
      if (result && result.ok) {
        state.online.lastUpdatedAt = payload.updatedAtTs || Date.now();
        state.online.revision = nextRevision;
        state.online.pendingRevision = nextRevision;
        state.online.dirty = false;
        state.online.connected = true;
        state.online.status = result.status || payload.status || state.online.status || 'active';
        if (payload.status === 'finished' || payload.gameOver) {
          state.online.lastPushedResultKey = tttBuildOnlineResultKey(state.online.code, nextRevision, payload.winner || state.winner || 'draw', state.online.role || '', state.online.sessionId || '');
          void tttRecordOnlineSessionResult(false);
        }
      }
      return result;
    } catch (err) {
      console.warn('TTT online save failed', err);
      state.online.connected = false;
    }
  }
  return { ok: true, queued: true, local: true };
}

function tttIndex(row, col) {
  return row * TTT_COLS + col;
}

function tttInBounds(row, col) {
  return row >= 0 && col >= 0 && row < TTT_ROWS && col < TTT_COLS;
}

function tttWinner(board) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      const mark = board[tttIndex(row, col)];
      if (!mark) continue;
      for (const [dr, dc] of directions) {
        const prevRow = row - dr;
        const prevCol = col - dc;
        if (tttInBounds(prevRow, prevCol) && board[tttIndex(prevRow, prevCol)] === mark) continue;

        const line = [tttIndex(row, col)];
        let r = row + dr;
        let c = col + dc;
        while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
          line.push(tttIndex(r, c));
          if (line.length >= TTT_WIN_LENGTH) {
            return { winner: mark, line: line.slice(0, TTT_WIN_LENGTH) };
          }
          r += dr;
          c += dc;
        }
      }
    }
  }

  if (board.every(Boolean)) return { winner: 'draw', line: [] };
  return { winner: null, line: [] };
}

function tttCollectRun(board, row, col, dr, dc, mark) {
  let length = 0;
  let endRow = row;
  let endCol = col;

  let r = row;
  let c = col;
  while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
    length += 1;
    endRow = r;
    endCol = c;
    r += dr;
    c += dc;
  }

  let openEnds = 0;
  const beforeRow = row - dr;
  const beforeCol = col - dc;
  const afterRow = endRow + dr;
  const afterCol = endCol + dc;
  if (tttInBounds(beforeRow, beforeCol) && !board[tttIndex(beforeRow, beforeCol)]) openEnds += 1;
  if (tttInBounds(afterRow, afterCol) && !board[tttIndex(afterRow, afterCol)]) openEnds += 1;

  return { length, openEnds };
}

function tttPatternScore(length, openEnds) {
  if (length >= 5) return 1000000;
  if (length === 4 && openEnds === 2) return 120000;
  if (length === 4 && openEnds === 1) return 28000;
  if (length === 3 && openEnds === 2) return 7000;
  if (length === 3 && openEnds === 1) return 1800;
  if (length === 2 && openEnds === 2) return 500;
  if (length === 2 && openEnds === 1) return 120;
  if (length === 1 && openEnds === 2) return 25;
  return 0;
}

function tttScoreRuns(board, mark) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];
  let score = 0;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      if (board[tttIndex(row, col)] !== mark) continue;
      score += 10 - (Math.abs(row - centerRow) * 0.6 + Math.abs(col - centerCol) * 0.35);
      for (const [dr, dc] of directions) {
        const prevRow = row - dr;
        const prevCol = col - dc;
        if (tttInBounds(prevRow, prevCol) && board[tttIndex(prevRow, prevCol)] === mark) continue;
        const run = tttCollectRun(board, row, col, dr, dc, mark);
        score += tttPatternScore(run.length, run.openEnds);
      }
    }
  }
  return score;
}

function tttEvaluateBoard(board) {
  return tttScoreRuns(board, 'O') - tttScoreRuns(board, 'X');
}

function tttWinningMove(board, mark) {
  for (let i = 0; i < TTT_TOTAL_CELLS; i += 1) {
    if (board[i]) continue;
    board[i] = mark;
    const result = tttWinner(board).winner;
    board[i] = '';
    if (result === mark) return i;
  }
  return -1;
}

function tttWinningMoves(board, mark) {
  const moves = [];
  for (let i = 0; i < TTT_TOTAL_CELLS; i += 1) {
    if (board[i]) continue;
    board[i] = mark;
    const result = tttWinner(board).winner;
    board[i] = '';
    if (result === mark) moves.push(i);
  }
  return moves;
}

function tttCriticalThreatMoves(board, mark) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];
  const moves = new Set();

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      const idx = tttIndex(row, col);
      if (board[idx] !== mark) continue;

      for (const [dr, dc] of directions) {
        const prevRow = row - dr;
        const prevCol = col - dc;
        if (tttInBounds(prevRow, prevCol) && board[tttIndex(prevRow, prevCol)] === mark) continue;

        let length = 0;
        let r = row;
        let c = col;
        while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
          length += 1;
          r += dr;
          c += dc;
        }

        const beforeRow = row - dr;
        const beforeCol = col - dc;
        const afterRow = r;
        const afterCol = c;
        const beforeOpen = tttInBounds(beforeRow, beforeCol) && !board[tttIndex(beforeRow, beforeCol)];
        const afterOpen = tttInBounds(afterRow, afterCol) && !board[tttIndex(afterRow, afterCol)];

        if (length >= 3 && (beforeOpen || afterOpen)) {
          if (beforeOpen) moves.add(tttIndex(beforeRow, beforeCol));
          if (afterOpen) moves.add(tttIndex(afterRow, afterCol));
        }
      }
    }
  }

  return Array.from(moves);
}

function tttOpenThreeThreatMoves(board, mark) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];
  const moves = new Set();

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      const idx = tttIndex(row, col);
      if (board[idx] !== mark) continue;

      for (const [dr, dc] of directions) {
        const prevRow = row - dr;
        const prevCol = col - dc;
        if (tttInBounds(prevRow, prevCol) && board[tttIndex(prevRow, prevCol)] === mark) continue;

        let length = 0;
        let r = row;
        let c = col;
        while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
          length += 1;
          r += dr;
          c += dc;
        }

        const beforeRow = row - dr;
        const beforeCol = col - dc;
        const afterRow = r;
        const afterCol = c;
        const beforeOpen = tttInBounds(beforeRow, beforeCol) && !board[tttIndex(beforeRow, beforeCol)];
        const afterOpen = tttInBounds(afterRow, afterCol) && !board[tttIndex(afterRow, afterCol)];

        if (length === 3 && beforeOpen && afterOpen) {
          moves.add(tttIndex(beforeRow, beforeCol));
          moves.add(tttIndex(afterRow, afterCol));
        }
      }
    }
  }

  return Array.from(moves);
}

function tttOpenTwoThreatMoves(board, mark) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];
  const moves = new Set();

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      const idx = tttIndex(row, col);
      if (board[idx] !== mark) continue;

      for (const [dr, dc] of directions) {
        const prevRow = row - dr;
        const prevCol = col - dc;
        if (tttInBounds(prevRow, prevCol) && board[tttIndex(prevRow, prevCol)] === mark) continue;

        let length = 0;
        let r = row;
        let c = col;
        while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
          length += 1;
          r += dr;
          c += dc;
        }

        const beforeRow = row - dr;
        const beforeCol = col - dc;
        const afterRow = r;
        const afterCol = c;
        const beforeOpen = tttInBounds(beforeRow, beforeCol) && !board[tttIndex(beforeRow, beforeCol)];
        const afterOpen = tttInBounds(afterRow, afterCol) && !board[tttIndex(afterRow, afterCol)];

        if (length === 2 && beforeOpen && afterOpen) {
          moves.add(tttIndex(beforeRow, beforeCol));
          moves.add(tttIndex(afterRow, afterCol));
        }
      }
    }
  }

  return Array.from(moves);
}

function tttThreatWindowMoves(board, mark) {
  const opponent = mark === 'O' ? 'X' : 'O';
  const moves = new Set();
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const [dr, dc] of directions) {
        const cells = [];
        let ok = true;
        for (let step = 0; step < TTT_WIN_LENGTH; step += 1) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (!tttInBounds(r, c)) { ok = false; break; }
          cells.push(tttIndex(r, c));
        }
        if (!ok) continue;

        let markCount = 0;
        let emptyCount = 0;
        const empties = [];
        for (const idx of cells) {
          const cell = board[idx];
          if (cell === opponent) { ok = false; break; }
          if (cell === mark) markCount += 1;
          else if (!cell) { emptyCount += 1; empties.push(idx); }
          else { ok = false; break; }
        }
        if (!ok) continue;
        if (markCount >= 3 && emptyCount >= 1) {
          empties.forEach(idx => moves.add(idx));
        }
      }
    }
  }

  return Array.from(moves);
}

function tttCandidateMoves(board, radius = 2) {
  const occupied = [];
  for (let i = 0; i < board.length; i += 1) {
    if (board[i]) occupied.push(i);
  }

  if (!occupied.length) {
    return [tttIndex(Math.floor(TTT_ROWS / 2), Math.floor(TTT_COLS / 2))];
  }

  const candidates = new Set();
  for (const idx of occupied) {
    const row = Math.floor(idx / TTT_COLS);
    const col = idx % TTT_COLS;
    for (let dr = -radius; dr <= radius; dr += 1) {
      for (let dc = -radius; dc <= radius; dc += 1) {
        const nr = row + dr;
        const nc = col + dc;
        if (!tttInBounds(nr, nc)) continue;
        const next = tttIndex(nr, nc);
        if (!board[next]) candidates.add(next);
      }
    }
  }

  return Array.from(candidates);
}


function tttOpponentForkRisk(board, mark, limit = 12) {
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const replies = tttCandidateMoves(board, 2)
    .filter(idx => !board[idx])
    .sort((a, b) => {
      const ar = Math.floor(a / TTT_COLS);
      const ac = a % TTT_COLS;
      const br = Math.floor(b / TTT_COLS);
      const bc = b % TTT_COLS;
      return (Math.abs(ar - centerRow) + Math.abs(ac - centerCol)) - (Math.abs(br - centerRow) + Math.abs(bc - centerCol));
    })
    .slice(0, limit);
  let risk = 0;
  for (const idx of replies) {
    if (board[idx]) continue;
    board[idx] = mark;
    const winCount = tttWinningMoves(board, mark).length;
    const critical = tttCriticalThreatMoves(board, mark).length;
    const windows = tttThreatWindowMoves(board, mark).length;
    const openThree = tttOpenThreeThreatMoves(board, mark).length;
    board[idx] = '';
    if (winCount >= 2 || critical >= 2 || windows >= 2 || openThree >= 2) {
      risk += 1;
    } else if (winCount >= 1 && (critical >= 1 || windows >= 1 || openThree >= 1)) {
      risk += 0.5;
    }
    if (risk >= 3) break;
  }
  return risk;
}

function tttMoveHeuristic(board, index, mark) {
  const row = Math.floor(index / TTT_COLS);
  const col = index % TTT_COLS;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  let score = 0;

  board[index] = mark;
  const result = tttWinner(board).winner;
  if (result === mark) {
    board[index] = '';
    return 10000000;
  }

  const opponent = mark === 'O' ? 'X' : 'O';
  const opponentWins = tttWinningMoves(board, opponent).length;
  const opponentThreats = tttThreatWindowMoves(board, opponent).length;
  if (opponentWins >= 3) score -= 850000;
  else if (opponentWins >= 2) score -= 500000;
  else if (opponentWins === 1) score -= 280000;
  if (opponentThreats >= 3) score -= 380000;
  else if (opponentThreats === 2) score -= 190000;
  else if (opponentThreats === 1) score -= 110000;
  board[index] = opponent;
  if (tttWinner(board).winner === opponent) score += 900000;
  board[index] = mark;

  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  const forkRisk = occupied >= 5 ? tttOpponentForkRisk(board, opponent, 8) : 0;
  if (forkRisk >= 2) score -= 650000;
  else if (forkRisk >= 1) score -= 320000;

  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  for (const [dr, dc] of directions) {
    let same = 1;
    let openEnds = 0;

    let r = row + dr;
    let c = col + dc;
    while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
      same += 1;
      r += dr;
      c += dc;
    }
    if (tttInBounds(r, c) && !board[tttIndex(r, c)]) openEnds += 1;

    r = row - dr;
    c = col - dc;
    while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
      same += 1;
      r -= dr;
      c -= dc;
    }
    if (tttInBounds(r, c) && !board[tttIndex(r, c)]) openEnds += 1;

    score += tttPatternScore(same, openEnds) * 1.1;
  }

  const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
  score += Math.max(0, 24 - distance * 1.1);

  let adjacency = 0;
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (!dr && !dc) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (!tttInBounds(nr, nc)) continue;
      const cell = board[tttIndex(nr, nc)];
      if (cell === mark) adjacency += 18;
      else if (cell === opponent) adjacency += 8;
    }
  }
  score += adjacency;

  board[index] = '';
  return score;
}

function tttOrderedCandidates(board, mark, limit = 12) {
  const candidates = tttCandidateMoves(board, 3);
  if (!candidates.length) {
    return [tttIndex(Math.floor(TTT_ROWS / 2), Math.floor(TTT_COLS / 2))];
  }
  const scored = candidates.map((idx) => ({
    idx,
    score: tttMoveHeuristic(board, idx, mark)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(item => item.idx);
}


function tttSearch(board, depth, alpha, beta, maximizing, memo, deadline) {
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (deadline && now >= deadline) {
    return tttEvaluateBoard(board);
  }
  const result = tttWinner(board).winner;
  if (result === 'O') return 10000000 + depth * 1000;
  if (result === 'X') return -10000000 - depth * 1000;
  if (result === 'draw') return 0;

  const key = board.join('') + '|' + depth + '|' + (maximizing ? 'O' : 'X');
  if (memo && Object.prototype.hasOwnProperty.call(memo, key)) return memo[key];
  if (depth <= 0) {
    const leaf = tttEvaluateBoard(board);
    if (memo) memo[key] = leaf;
    return leaf;
  }

  const mark = maximizing ? 'O' : 'X';
  let moves = tttOrderedCandidates(board, mark, maximizing ? 7 : 6);
  if (!moves.length) moves = tttCandidateMoves(board, 3);
  if (!moves.length) {
    const leaf = tttEvaluateBoard(board);
    if (memo) memo[key] = leaf;
    return leaf;
  }

  moves.sort((a, b) => tttMoveHeuristic(board, b, mark) - tttMoveHeuristic(board, a, mark));

  let best = maximizing ? -Infinity : Infinity;
  for (const idx of moves) {
    if (deadline && typeof performance !== 'undefined' && performance.now() > deadline) break;
    if (board[idx]) continue;
    board[idx] = mark;
    const score = tttSearch(board, depth - 1, alpha, beta, !maximizing, memo, deadline);
    board[idx] = '';
    if (maximizing) {
      if (score > best) best = score;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    } else {
      if (score < best) best = score;
      if (best < beta) beta = best;
      if (alpha >= beta) break;
    }
  }

  if (memo) memo[key] = best;
  return best;
}


function tttForkMove(board, mark) {
  let fallback = -1;
  for (let i = 0; i < TTT_TOTAL_CELLS; i += 1) {
    if (board[i]) continue;
    board[i] = mark;
    const winNow = tttWinner(board).winner === mark;
    const forkCount = tttWinningMoves(board, mark).length;
    board[i] = '';
    if (winNow) return i;
    if (forkCount >= 2) return i;
    if (fallback < 0 && forkCount === 1) fallback = i;
  }
  return fallback;
}

function tttOpeningBookMove(board) {
  const centerRow = Math.floor(TTT_ROWS / 2);
  const centerCol = Math.floor(TTT_COLS / 2);
  const center = tttIndex(centerRow, centerCol);
  if (!board[center]) return center;

  const ring = [
    [centerRow - 1, centerCol],
    [centerRow + 1, centerCol],
    [centerRow, centerCol - 1],
    [centerRow, centerCol + 1],
    [centerRow - 1, centerCol - 1],
    [centerRow - 1, centerCol + 1],
    [centerRow + 1, centerCol - 1],
    [centerRow + 1, centerCol + 1]
  ];
  for (const [r, c] of ring) {
    if (!tttInBounds(r, c)) continue;
    const idx = tttIndex(r, c);
    if (!board[idx]) return idx;
  }

  const candidates = tttCandidateMoves(board, 1);
  return candidates[0] ?? center;
}



function tttEmergencyBlockMoves(board, mark) {
  const moves = [];
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      if (board[tttIndex(row, col)] !== mark) continue;
      for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
        const prevRow = row - dr;
        const prevCol = col - dc;
        if (tttInBounds(prevRow, prevCol) && board[tttIndex(prevRow, prevCol)] === mark) continue;
        let len = 0;
        let r = row;
        let c = col;
        while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
          len += 1;
          r += dr;
          c += dc;
        }
        if (len < 3) continue;
        const beforeOpen = tttInBounds(prevRow, prevCol) && !board[tttIndex(prevRow, prevCol)];
        const afterOpen = tttInBounds(r, c) && !board[tttIndex(r, c)];
        if (beforeOpen) moves.push(tttIndex(prevRow, prevCol));
        if (afterOpen) moves.push(tttIndex(r, c));
      }
    }
  }
  return Array.from(new Set(moves));
}

function tttFastAiMoveScore(board, index, mark, deadline) {
  if (board[index]) return -Infinity;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (deadline && now > deadline) return -999999;

  const opponent = mark === 'O' ? 'X' : 'O';
  const row = Math.floor(index / TTT_COLS);
  const col = index % TTT_COLS;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  let score = 0;

  board[index] = mark;
  if (tttWinner(board).winner === mark) {
    board[index] = '';
    return 10000000;
  }

  const opponentImmediate = tttWinningMove(board, opponent);
  if (opponentImmediate >= 0) score -= 850000;

  score += tttScoreRuns(board, mark) * 1.2;
  score -= tttScoreRuns(board, opponent) * 1.35;

  let ownAdj = 0;
  let oppAdj = 0;
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (!dr && !dc) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (!tttInBounds(nr, nc)) continue;
      const cell = board[tttIndex(nr, nc)];
      if (cell === mark) ownAdj += 1;
      else if (cell === opponent) oppAdj += 1;
    }
  }

  const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
  score += Math.max(0, 130 - distance * 11);
  score += ownAdj * 46;
  score += oppAdj * 28;

  board[index] = '';
  return score;
}

function tttSimpleMoveScore(board, index, mark) {
  if (board[index]) return -Infinity;
  const opponent = mark === 'O' ? 'X' : 'O';
  const row = Math.floor(index / TTT_COLS);
  const col = index % TTT_COLS;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  let score = 0;

  board[index] = mark;
  if (tttWinner(board).winner === mark) {
    board[index] = '';
    return 10000000;
  }
  const oppWin = tttWinningMoves(board, opponent).length;
  if (oppWin > 0) score -= 900000 * oppWin;
  score += tttScoreRuns(board, mark) * 1.35;
  score -= tttScoreRuns(board, opponent) * 1.08;

  let ownAdj = 0;
  let oppAdj = 0;
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (!dr && !dc) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (!tttInBounds(nr, nc)) continue;
      const cell = board[tttIndex(nr, nc)];
      if (cell === mark) ownAdj += 1;
      else if (cell === opponent) oppAdj += 1;
    }
  }
  const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
  score += Math.max(0, 120 - distance * 9);
  score += ownAdj * 38;
  score += oppAdj * 20;
  board[index] = '';
  return score;
}

function tttPickBestIndexedMove(board, moves, mark) {
  const unique = Array.from(new Set((Array.isArray(moves) ? moves : []).filter(idx => Number.isFinite(Number(idx)) && !board[Number(idx)]).map(Number)));
  if (!unique.length) return -1;
  unique.sort((a, b) => tttSimpleMoveScore(board, b, mark) - tttSimpleMoveScore(board, a, mark));
  return unique[0];
}

function tttPickBestBlockMove(board, moves, opponentMark) {
  const unique = Array.from(new Set((Array.isArray(moves) ? moves : []).filter(idx => Number.isFinite(Number(idx)) && !board[Number(idx)]).map(Number)));
  if (!unique.length) return -1;
  const defender = opponentMark === 'X' ? 'O' : 'X';
  unique.sort((a, b) => {
    const dangerDiff = tttSimpleMoveScore(board, b, opponentMark) - tttSimpleMoveScore(board, a, opponentMark);
    if (Math.abs(dangerDiff) > 1) return dangerDiff;
    return tttSimpleMoveScore(board, b, defender) - tttSimpleMoveScore(board, a, defender);
  });
  return unique[0];
}

function tttMoveCreatesFork(board, index, mark) {
  if (board[index]) return 0;
  board[index] = mark;
  const wins = tttWinningMoves(board, mark).length;
  const critical = tttCriticalThreatMoves(board, mark).length;
  const windows = tttThreatWindowMoves(board, mark).length;
  const openThree = tttOpenThreeThreatMoves(board, mark).length;
  board[index] = '';
  let score = 0;
  if (wins >= 2) score += 6;
  else if (wins === 1) score += 3;
  if (critical >= 2) score += 4;
  else if (critical === 1) score += 2;
  if (windows >= 2) score += 3;
  else if (windows === 1) score += 1;
  if (openThree >= 2) score += 3;
  else if (openThree === 1) score += 1;
  return score;
}

function tttBestForkMove(board, mark) {
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const candidates = tttCandidateMoves(board, 2)
    .filter(idx => !board[idx])
    .sort((a, b) => {
      const ar = Math.floor(a / TTT_COLS);
      const ac = a % TTT_COLS;
      const br = Math.floor(b / TTT_COLS);
      const bc = b % TTT_COLS;
      return (Math.abs(ar - centerRow) + Math.abs(ac - centerCol)) - (Math.abs(br - centerRow) + Math.abs(bc - centerCol));
    })
    .slice(0, 12);
  let bestIdx = -1;
  let bestScore = 0;
  for (const idx of candidates) {
    const forkScore = tttMoveCreatesFork(board, idx, mark);
    if (forkScore <= 0) continue;
    const total = forkScore * 100000 + tttSimpleMoveScore(board, idx, mark);
    if (total > bestScore) {
      bestScore = total;
      bestIdx = idx;
    }
  }
  return bestIdx;
}

function tttHardMoveSearchScore(board, index, deadline) {
  if (board[index]) return -Infinity;
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (deadline && now > deadline) return -999999;

  const base = tttSimpleMoveScore(board, index, 'O');
  const fast = tttFastAiMoveScore(board, index, 'O', deadline);
  let score = base * 1.12 + fast * 0.88;

  board[index] = 'O';
  const ownWins = tttV958WinningMovesFast(board, 'O').length;
  const ownThreats = tttCriticalThreatMoves(board, 'O').length + tttThreatWindowMoves(board, 'O').length;
  const xWins = tttWinningMoves(board, 'X').length;
  const xThreats = tttCriticalThreatMoves(board, 'X').length + tttThreatWindowMoves(board, 'X').length;
  const xDanger = tttBoardDangerScore(board, 'X');
  const ownDanger = tttBoardDangerScore(board, 'O');
  const xTacticalPressure = typeof tttTacticalPressureScore === 'function' ? tttTacticalPressureScore(board, 'X') : xDanger;
  const ownTacticalPressure = typeof tttTacticalPressureScore === 'function' ? tttTacticalPressureScore(board, 'O') : ownDanger;
  score += ownWins * 620000;
  score += ownThreats * 125000;
  score += ownDanger * 0.28;
  score += ownTacticalPressure * 0.16;
  score -= xWins * 3200000;
  score -= xThreats * 260000;
  score -= xDanger * 0.86;
  score -= xTacticalPressure * 0.42;

  const searchDepth = typeof tttHardSearchDepth === 'function' ? tttHardSearchDepth(board) : 2;
  if (!deadline || (typeof performance === 'undefined') || performance.now() < deadline - 12) {
    const lookahead = tttSearch(board, searchDepth, -Infinity, Infinity, false, {}, deadline);
    if (Number.isFinite(lookahead)) score += lookahead * 0.42;
  }
  board[index] = '';

  return score;
}


function tttCheapMovePotential(board, index, mark) {
  if (board[index]) return -Infinity;
  const opponent = mark === 'O' ? 'X' : 'O';
  const row = Math.floor(index / TTT_COLS);
  const col = index % TTT_COLS;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  let score = Math.max(0, 120 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 8);
  for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
    let own = 1;
    let opp = 0;
    let open = 0;
    for (const dir of [-1, 1]) {
      for (let step = 1; step < TTT_WIN_LENGTH; step += 1) {
        const r = row + dr * step * dir;
        const c = col + dc * step * dir;
        if (!tttInBounds(r, c)) break;
        const cell = board[tttIndex(r, c)];
        if (cell === mark) own += 1;
        else if (!cell) { open += 1; break; }
        else { opp += 1; break; }
      }
    }
    if (opp >= 2) continue;
    if (own >= 5) score += 5000000;
    else if (own === 4 && open) score += 720000;
    else if (own === 3 && open) score += 85000;
    else if (own === 2 && open) score += 8500;
    if (!opp) score += open * 320;
  }
  const opponentPotential = (() => {
    board[index] = opponent;
    let danger = 0;
    for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
      let same = 1;
      let open = 0;
      for (const dir of [-1, 1]) {
        for (let step = 1; step < TTT_WIN_LENGTH; step += 1) {
          const r = row + dr * step * dir;
          const c = col + dc * step * dir;
          if (!tttInBounds(r, c)) break;
          const cell = board[tttIndex(r, c)];
          if (cell === opponent) same += 1;
          else if (!cell) { open += 1; break; }
          else break;
        }
      }
      if (same >= 5) danger += 5000000;
      else if (same === 4 && open) danger += 760000;
      else if (same === 3 && open) danger += 90000;
      else if (same === 2 && open) danger += 9000;
    }
    board[index] = '';
    return danger;
  })();
  return score + opponentPotential * 0.34;
}

function tttBoardDangerScore(board, mark) {
  const opponent = mark === 'O' ? 'X' : 'O';
  const directions = [[0,1],[1,0],[1,1],[1,-1]];
  let score = 0;
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const [dr, dc] of directions) {
        let marks = 0;
        let empties = 0;
        let blocked = false;
        for (let step = 0; step < TTT_WIN_LENGTH; step += 1) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (!tttInBounds(r, c)) { blocked = true; break; }
          const cell = board[tttIndex(r, c)];
          if (cell === opponent) { blocked = true; break; }
          if (cell === mark) marks += 1;
          else empties += 1;
        }
        if (blocked || !marks) continue;
        if (marks >= 5) score += 50000000;
        else if (marks === 4 && empties >= 1) score += 9000000;
        else if (marks === 3 && empties >= 2) score += 260000;
        else if (marks === 2 && empties >= 3) score += 9000;
        else if (marks === 1 && empties >= 4) score += 180;
      }
    }
  }
  return score;
}

function tttBestDangerReductionMove(board, dangerMark) {
  const defender = dangerMark === 'X' ? 'O' : 'X';
  const currentDanger = tttBoardDangerScore(board, dangerMark);
  if (currentDanger < 9000) return -1;
  let candidates = Array.from(new Set(tttCandidateMoves(board, currentDanger > 600000 ? 3 : 2))).filter(idx => !board[idx]);
  candidates = candidates
    .map(idx => ({ idx, score: tttCheapMovePotential(board, idx, defender) + tttCheapMovePotential(board, idx, dangerMark) * 0.9 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, currentDanger > 600000 ? 24 : 18)
    .map(item => item.idx);
  let bestIdx = -1;
  let bestScore = -Infinity;
  for (const idx of candidates) {
    board[idx] = defender;
    const nextDanger = tttBoardDangerScore(board, dangerMark);
    const ownDanger = tttBoardDangerScore(board, defender);
    board[idx] = '';
    const score = -nextDanger * 1.38 + ownDanger * 0.58 + tttCheapMovePotential(board, idx, defender) * 0.8;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }
  return bestIdx;
}

function tttBestAntiForkMove(board) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 4) return -1;
  let candidates = Array.from(new Set(tttCandidateMoves(board, 2))).filter(idx => !board[idx]);
  candidates = candidates
    .map(idx => ({ idx, score: tttCheapMovePotential(board, idx, 'O') + tttCheapMovePotential(board, idx, 'X') * 0.42 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(item => item.idx);
  if (!candidates.length) return -1;
  let bestIdx = -1;
  let bestScore = -Infinity;
  for (const idx of candidates) {
    board[idx] = 'O';
    let xReplies = Array.from(new Set(tttCandidateMoves(board, 2))).filter(reply => !board[reply]);
    xReplies = xReplies
      .map(reply => ({ reply, score: tttCheapMovePotential(board, reply, 'X') }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.reply);
    let worstReplyDanger = 0;
    for (const reply of xReplies) {
      board[reply] = 'X';
      const danger = tttBoardDangerScore(board, 'X');
      board[reply] = '';
      if (danger > worstReplyDanger) worstReplyDanger = danger;
    }
    const ownDanger = tttBoardDangerScore(board, 'O');
    board[idx] = '';
    const score = ownDanger * 0.72 - worstReplyDanger * 1.15 + tttCheapMovePotential(board, idx, 'O') * 0.35;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }
  return bestIdx;
}


function tttLineVectorScore(board, mark) {
  const opponent = mark === 'O' ? 'X' : 'O';
  const directions = [[0,1],[1,0],[1,1],[1,-1]];
  let score = 0;

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const [dr, dc] of directions) {
        for (const size of [TTT_WIN_LENGTH, TTT_WIN_LENGTH + 1]) {
          const cells = [];
          let ok = true;
          for (let step = 0; step < size; step += 1) {
            const r = row + dr * step;
            const c = col + dc * step;
            if (!tttInBounds(r, c)) { ok = false; break; }
            cells.push(tttIndex(r, c));
          }
          if (!ok) continue;

          let marks = 0;
          let empties = 0;
          let blocked = false;
          for (const idx of cells) {
            const cell = board[idx];
            if (cell === opponent) { blocked = true; break; }
            if (cell === mark) marks += 1;
            else if (!cell) empties += 1;
          }
          if (blocked || !marks || !empties) continue;

          const beforeRow = row - dr;
          const beforeCol = col - dc;
          const afterRow = row + dr * size;
          const afterCol = col + dc * size;
          const openBefore = tttInBounds(beforeRow, beforeCol) && !board[tttIndex(beforeRow, beforeCol)];
          const openAfter = tttInBounds(afterRow, afterCol) && !board[tttIndex(afterRow, afterCol)];
          const openBonus = (openBefore ? 1 : 0) + (openAfter ? 1 : 0);
          const sizeBonus = size > TTT_WIN_LENGTH ? 1.34 : 1;

          if (marks >= 5) score += 90000000 * sizeBonus;
          else if (marks === 4) score += (empties === 1 ? 22000000 : 7600000) * sizeBonus + openBonus * 1800000;
          else if (marks === 3) score += (empties <= 2 ? 1150000 : 420000) * sizeBonus + openBonus * 260000;
          else if (marks === 2) score += 72000 * sizeBonus + openBonus * 18000;
          else score += 2400 * sizeBonus;
        }
      }
    }
  }
  return score;
}

function tttTacticalPressureScore(board, mark) {
  const wins = tttWinningMoves(board, mark).length;
  const critical = tttCriticalThreatMoves(board, mark).length;
  const windows = tttThreatWindowMoves(board, mark).length;
  const openThrees = tttOpenThreeThreatMoves(board, mark).length;
  const openTwos = typeof tttOpenTwoThreatMoves === 'function' ? tttOpenTwoThreatMoves(board, mark).length : 0;
  const forks = tttBestForkMove(board, mark) >= 0 ? 1 : 0;
  const danger = tttBoardDangerScore(board, mark);
  const vector = tttLineVectorScore(board, mark);
  return wins * 9000000 + critical * 1450000 + windows * 520000 + openThrees * 360000 + openTwos * 42000 + forks * 650000 + danger + vector * 0.62;
}

function tttBestLineContainmentMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 6) return -1;

  const currentVector = tttLineVectorScore(board, 'X');
  const currentPressure = tttTacticalPressureScore(board, 'X');
  if (currentVector < 90000 && currentPressure < 180000 && occupied < 10) return -1;

  const rawCandidates = new Set([
    ...tttCandidateMoves(board, occupied < 28 ? 3 : 2),
    ...tttThreatWindowMoves(board, 'X'),
    ...tttCriticalThreatMoves(board, 'X'),
    ...tttOpenThreeThreatMoves(board, 'X'),
    ...tttOpenTwoThreatMoves(board, 'X')
  ]);

  let candidates = Array.from(rawCandidates).filter(idx => Number.isFinite(Number(idx)) && !board[Number(idx)]).map(Number);
  candidates = candidates
    .map(idx => ({
      idx,
      score: tttCheapMovePotential(board, idx, 'X') * 1.2
        + tttCheapMovePotential(board, idx, 'O') * 0.94
        + (() => { board[idx] = 'O'; const reduced = currentVector - tttLineVectorScore(board, 'X'); board[idx] = ''; return reduced; })() * 0.75
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 18 ? 34 : (occupied < 34 ? 28 : 22))
    .map(item => item.idx);

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;
  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 26 && bestIdx >= 0) break;

    board[idx] = 'O';
    const ownWinNow = tttWinner(board).winner === 'O' ? 1 : 0;
    const xImmediateAfter = tttWinningMoves(board, 'X').length;
    const nextVector = tttLineVectorScore(board, 'X');
    const nextPressure = tttTacticalPressureScore(board, 'X');
    const ownVector = tttLineVectorScore(board, 'O');
    const ownPressure = tttTacticalPressureScore(board, 'O');

    let replies = Array.from(new Set(tttCandidateMoves(board, occupied < 26 ? 3 : 2))).filter(reply => !board[reply]);
    replies = replies
      .map(reply => {
        board[reply] = 'X';
        const replyScore = tttLineVectorScore(board, 'X') * 0.00012
          + tttTacticalPressureScore(board, 'X') * 0.00008
          + tttCheapMovePotential(board, reply, 'X')
          + (tttWinner(board).winner === 'X' ? 5000000 : 0)
          + tttWinningMoves(board, 'X').length * 800000;
        board[reply] = '';
        return { reply, score: replyScore };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 20 ? 18 : 12)
      .map(item => item.reply);

    let worstRisk = xImmediateAfter * 52000000 + nextVector * 1.25 + nextPressure * 0.68;
    for (const reply of replies) {
      board[reply] = 'X';
      const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
      const xWins = tttWinningMoves(board, 'X').length;
      const xCritical = tttCriticalThreatMoves(board, 'X').length;
      const xWindows = tttThreatWindowMoves(board, 'X').length;
      const xOpenThrees = tttOpenThreeThreatMoves(board, 'X').length;
      const xOpenTwos = tttOpenTwoThreatMoves(board, 'X').length;
      const xFork = tttBestForkMove(board, 'X') >= 0 ? 1 : 0;
      const replyVector = tttLineVectorScore(board, 'X');
      const replyPressure = tttTacticalPressureScore(board, 'X');
      const oCounterWins = tttWinningMoves(board, 'O').length;
      const oCounterPressure = tttTacticalPressureScore(board, 'O');
      board[reply] = '';

      const replyRisk = replyWinner * 180000000
        + xWins * 52000000
        + xCritical * 9200000
        + xWindows * 4200000
        + xOpenThrees * 2400000
        + xOpenTwos * 130000
        + xFork * 3600000
        + replyVector * 1.34
        + replyPressure * 0.72
        - oCounterWins * 24000000
        - oCounterPressure * 0.2;
      if (replyRisk > worstRisk) worstRisk = replyRisk;
    }

    board[idx] = '';
    const reduction = currentVector - nextVector;
    const candidateScore = ownWinNow * 260000000
      + reduction * 2.15
      + (currentPressure - nextPressure) * 1.08
      + ownVector * 0.92
      + ownPressure * 0.46
      + tttCheapMovePotential(board, idx, 'O') * 1.05
      + tttCheapMovePotential(board, idx, 'X') * 0.82
      - worstRisk * 1.28;

    if (candidateScore > bestScore || (Math.abs(candidateScore - bestScore) < 1 && worstRisk < bestWorstRisk)) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  if (occupied >= 9 || currentVector > 180000 || currentPressure > 420000 || bestWorstRisk < 1800000) return bestIdx;
  return -1;
}

function tttBestLookaheadSafeMove(board, defender, attacker) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 5) return -1;
  const currentRisk = tttTacticalPressureScore(board, attacker);
  if (currentRisk < 8500) return -1;

  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const radius = currentRisk > 500000 ? 3 : 2;
  let candidates = Array.from(new Set(tttCandidateMoves(board, radius))).filter(idx => !board[idx]);
  candidates = candidates
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      return {
        idx,
        score: tttCheapMovePotential(board, idx, defender) * 0.9
          + tttCheapMovePotential(board, idx, attacker) * 0.72
          + Math.max(0, 80 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 6)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, currentRisk > 500000 ? 28 : 22)
    .map(item => item.idx);

  let bestIdx = -1;
  let bestScore = -Infinity;
  for (const idx of candidates) {
    board[idx] = defender;
    const immediateLosses = tttWinningMoves(board, attacker).length;
    const nextRisk = tttTacticalPressureScore(board, attacker);
    const ownPressure = tttTacticalPressureScore(board, defender);

    let worstReplyRisk = 0;
    let replies = Array.from(new Set(tttCandidateMoves(board, 2))).filter(reply => !board[reply]);
    replies = replies
      .map(reply => ({ reply, score: tttCheapMovePotential(board, reply, attacker) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.reply);
    for (const reply of replies) {
      board[reply] = attacker;
      const replyRisk = tttTacticalPressureScore(board, attacker) - tttTacticalPressureScore(board, defender) * 0.22;
      board[reply] = '';
      if (replyRisk > worstReplyRisk) worstReplyRisk = replyRisk;
    }

    board[idx] = '';
    const score = ownPressure * 0.82 - nextRisk * 1.64 - worstReplyRisk * 0.88 - immediateLosses * 12000000 + tttCheapMovePotential(board, idx, defender) * 0.42;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }

  return bestIdx;
}


function tttBestDeepSafetyMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 6) return -1;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  let candidates = Array.from(new Set(tttCandidateMoves(board, occupied < 18 ? 3 : 2))).filter(idx => !board[idx]);
  candidates = candidates
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      return {
        idx,
        score: tttCheapMovePotential(board, idx, 'O') * 0.95
          + tttCheapMovePotential(board, idx, 'X') * 0.86
          + Math.max(0, 90 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 5)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 20 ? 28 : 20)
    .map(item => item.idx);

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;
  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 18 && bestIdx >= 0) break;
    board[idx] = 'O';
    const immediateLosses = tttWinningMoves(board, 'X').length;
    const ownPressure = tttTacticalPressureScore(board, 'O');
    let replies = Array.from(new Set(tttCandidateMoves(board, 2))).filter(reply => !board[reply]);
    replies = replies
      .map(reply => ({ reply, score: tttCheapMovePotential(board, reply, 'X') + tttTacticalPressureScore((() => { board[reply] = 'X'; const snap = board.slice(); board[reply] = ''; return snap; })(), 'X') * 0.00008 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 18 ? 12 : 9)
      .map(item => item.reply);

    let worstRisk = immediateLosses * 24000000;
    for (const reply of replies) {
      board[reply] = 'X';
      const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
      const xWins = tttWinningMoves(board, 'X').length;
      const xCritical = tttCriticalThreatMoves(board, 'X').length;
      const xWindows = tttThreatWindowMoves(board, 'X').length;
      const xOpenThrees = tttOpenThreeThreatMoves(board, 'X').length;
      const xPressure = tttTacticalPressureScore(board, 'X');
      const oCounter = tttTacticalPressureScore(board, 'O');
      board[reply] = '';
      const risk = replyWinner * 50000000
        + xWins * 15000000
        + xCritical * 2400000
        + xWindows * 1200000
        + xOpenThrees * 700000
        + xPressure * 0.72
        - oCounter * 0.18;
      if (risk > worstRisk) worstRisk = risk;
    }

    const candidateScore = ownPressure * 0.74 + tttCheapMovePotential(board, idx, 'O') * 1.25 - worstRisk;
    board[idx] = '';
    if (candidateScore > bestScore) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  const currentRisk = tttTacticalPressureScore(board, 'X');
  if (currentRisk > 120000 || bestWorstRisk < 1400000 || occupied >= 10) return bestIdx;
  return -1;
}



function tttBestHumanTrapBrakeMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 4) return -1;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const currentPressure = tttTacticalPressureScore(board, 'X');
  let candidates = Array.from(new Set(tttCandidateMoves(board, occupied < 22 ? 3 : 2))).filter(idx => !board[idx]);
  candidates = candidates
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      return {
        idx,
        score: tttCheapMovePotential(board, idx, 'O') * 1.18
          + tttCheapMovePotential(board, idx, 'X') * 1.28
          + Math.max(0, 110 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 5)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 16 ? 40 : (occupied < 30 ? 32 : 22))
    .map(item => item.idx);

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;
  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 24 && bestIdx >= 0) break;

    board[idx] = 'O';
    const directLosses = tttWinningMoves(board, 'X').length;
    const ownImmediateWins = tttWinningMoves(board, 'O').length;
    const ownFork = tttBestForkMove(board, 'O') >= 0 ? 1 : 0;
    const ownPressure = tttTacticalPressureScore(board, 'O');

    let replies = Array.from(new Set(tttCandidateMoves(board, occupied < 18 ? 3 : 2))).filter(reply => !board[reply]);
    replies = replies
      .map(reply => {
        board[reply] = 'X';
        const replyWins = tttWinningMoves(board, 'X').length;
        const replyPressure = tttTacticalPressureScore(board, 'X');
        const replyFork = tttBestForkMove(board, 'X') >= 0 ? 1 : 0;
        board[reply] = '';
        return {
          reply,
          score: tttCheapMovePotential(board, reply, 'X') * 1.05
            + replyWins * 2400000
            + replyFork * 950000
            + replyPressure * 0.00012
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 18 ? 18 : 12)
      .map(item => item.reply);

    let worstRisk = directLosses * 36000000;
    for (const reply of replies) {
      board[reply] = 'X';
      const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
      const xWins = tttWinningMoves(board, 'X').length;
      const xCritical = tttCriticalThreatMoves(board, 'X').length;
      const xWindows = tttThreatWindowMoves(board, 'X').length;
      const xOpenThrees = tttOpenThreeThreatMoves(board, 'X').length;
      const xOpenTwos = typeof tttOpenTwoThreatMoves === 'function' ? tttOpenTwoThreatMoves(board, 'X').length : 0;
      const xFork = tttBestForkMove(board, 'X') >= 0 ? 1 : 0;
      const xPressure = tttTacticalPressureScore(board, 'X');
      const oWins = tttWinningMoves(board, 'O').length;
      const oPressure = tttTacticalPressureScore(board, 'O');
      board[reply] = '';

      const multiWinTrap = xWins >= 2 ? 1 : 0;
      const risk = replyWinner * 120000000
        + multiWinTrap * 86000000
        + xWins * 24000000
        + xCritical * 5200000
        + xWindows * 2400000
        + xOpenThrees * 1700000
        + xFork * 2600000
        + xOpenTwos * 62000
        + xPressure * 0.94
        - oWins * 18000000
        - oPressure * 0.24;
      if (risk > worstRisk) worstRisk = risk;
    }

    board[idx] = '';
    const candidateScore = ownImmediateWins * 32000000
      + ownFork * 4200000
      + ownPressure * 0.82
      + tttCheapMovePotential(board, idx, 'O') * 1.22
      + tttCheapMovePotential(board, idx, 'X') * 0.74
      - worstRisk * 1.38;
    if (candidateScore > bestScore || (Math.abs(candidateScore - bestScore) < 1 && worstRisk < bestWorstRisk)) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  if (occupied >= 7 || currentPressure > 26000 || bestWorstRisk < 1600000) return bestIdx;
  return -1;
}



function tttReplyLockdownRisk(board, mark) {
  const wins = tttWinningMoves(board, mark).length;
  const critical = tttCriticalThreatMoves(board, mark).length;
  const windows = tttThreatWindowMoves(board, mark).length;
  const openThrees = tttOpenThreeThreatMoves(board, mark).length;
  const openTwos = typeof tttOpenTwoThreatMoves === 'function' ? tttOpenTwoThreatMoves(board, mark).length : 0;
  const fork = tttBestForkMove(board, mark) >= 0 ? 1 : 0;
  const pressure = tttTacticalPressureScore(board, mark);
  const vector = typeof tttLineVectorScore === 'function' ? tttLineVectorScore(board, mark) : 0;
  return wins * 125000000
    + critical * 8200000
    + windows * 4200000
    + openThrees * 2600000
    + fork * 3400000
    + openTwos * 120000
    + pressure
    + vector * 0.72;
}

function tttBestReplyLockdownMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 6) return -1;
  const currentRisk = tttReplyLockdownRisk(board, 'X');
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const rawCandidates = new Set([
    ...tttCandidateMoves(board, occupied < 24 ? 3 : 2),
    ...tttThreatWindowMoves(board, 'X'),
    ...tttCriticalThreatMoves(board, 'X'),
    ...tttOpenThreeThreatMoves(board, 'X'),
    ...tttOpenTwoThreatMoves(board, 'X'),
    ...tttThreatWindowMoves(board, 'O'),
    ...tttCriticalThreatMoves(board, 'O')
  ]);

  let candidates = Array.from(rawCandidates)
    .filter(idx => Number.isFinite(Number(idx)) && !board[Number(idx)])
    .map(Number)
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      return {
        idx,
        score: tttCheapMovePotential(board, idx, 'O') * 1.24
          + tttCheapMovePotential(board, idx, 'X') * 1.08
          + Math.max(0, 120 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 5)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 16 ? 38 : (occupied < 32 ? 30 : 22))
    .map(item => item.idx);

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;

  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 30 && bestIdx >= 0) break;

    board[idx] = 'O';
    const ownWinNow = tttWinner(board).winner === 'O' ? 1 : 0;
    const ownRisk = tttReplyLockdownRisk(board, 'O');
    const xImmediate = tttWinningMoves(board, 'X').length;

    let replies = Array.from(new Set(tttCandidateMoves(board, occupied < 24 ? 3 : 2))).filter(reply => !board[reply]);
    replies = replies
      .map(reply => {
        board[reply] = 'X';
        const replyWin = tttWinner(board).winner === 'X' ? 1 : 0;
        const replyRisk = tttReplyLockdownRisk(board, 'X');
        board[reply] = '';
        return { reply, score: replyWin * 90000000 + replyRisk + tttCheapMovePotential(board, reply, 'X') * 1.08 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 18 ? 18 : 12)
      .map(item => item.reply);

    let worstRisk = xImmediate * 150000000;
    for (const reply of replies) {
      board[reply] = 'X';
      const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
      let replyRisk = replyWinner * 180000000 + tttReplyLockdownRisk(board, 'X') - tttReplyLockdownRisk(board, 'O') * 0.18;

      const counterSet = new Set([
        ...tttWinningMoves(board, 'O'),
        ...tttWinningMoves(board, 'X'),
        ...tttCriticalThreatMoves(board, 'X'),
        ...tttThreatWindowMoves(board, 'X'),
        ...tttOpenThreeThreatMoves(board, 'X'),
        ...tttCandidateMoves(board, 2)
      ]);
      let counters = Array.from(counterSet)
        .filter(counter => Number.isFinite(Number(counter)) && !board[Number(counter)])
        .map(Number)
        .map(counter => ({
          counter,
          score: tttCheapMovePotential(board, counter, 'O') * 1.18 + tttCheapMovePotential(board, counter, 'X') * 1.06
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
        .map(item => item.counter);

      let bestCounterRisk = replyRisk;
      for (const counter of counters) {
        board[counter] = 'O';
        const counterRisk = tttReplyLockdownRisk(board, 'X') - tttReplyLockdownRisk(board, 'O') * 0.32;
        board[counter] = '';
        if (counterRisk < bestCounterRisk) bestCounterRisk = counterRisk;
      }
      board[reply] = '';
      const combinedRisk = replyRisk * 0.46 + bestCounterRisk * 0.78;
      if (combinedRisk > worstRisk) worstRisk = combinedRisk;
    }

    board[idx] = '';
    const candidateScore = ownWinNow * 220000000
      + ownRisk * 0.72
      + tttCheapMovePotential(board, idx, 'O') * 1.32
      + tttCheapMovePotential(board, idx, 'X') * 0.82
      - worstRisk * 1.18;
    if (candidateScore > bestScore || (Math.abs(candidateScore - bestScore) < 1 && worstRisk < bestWorstRisk)) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  if (occupied >= 9 || currentRisk > 180000 || bestWorstRisk < 2600000) return bestIdx;
  return -1;
}


function tttBestHumanPressureLockMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 5) return -1;
  const baseHumanRisk = tttReplyLockdownRisk(board, 'X') + tttLineVectorScore(board, 'X') * 0.52;
  const baseAiRisk = tttReplyLockdownRisk(board, 'O') + tttLineVectorScore(board, 'O') * 0.34;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const rawCandidates = new Set([
    ...tttWinningMoves(board, 'O'),
    ...tttWinningMoves(board, 'X'),
    ...tttThreatWindowMoves(board, 'X'),
    ...tttCriticalThreatMoves(board, 'X'),
    ...tttOpenThreeThreatMoves(board, 'X'),
    ...tttOpenTwoThreatMoves(board, 'X'),
    ...tttThreatWindowMoves(board, 'O'),
    ...tttCriticalThreatMoves(board, 'O'),
    ...tttCandidateMoves(board, occupied < 26 ? 3 : 2)
  ]);

  let candidates = Array.from(rawCandidates)
    .filter(idx => Number.isFinite(Number(idx)) && !board[Number(idx)])
    .map(Number)
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      const centerBias = Math.max(0, 145 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 5.4);
      board[idx] = 'O';
      const humanReduction = baseHumanRisk - (tttReplyLockdownRisk(board, 'X') + tttLineVectorScore(board, 'X') * 0.52);
      const aiGain = tttReplyLockdownRisk(board, 'O') - baseAiRisk;
      board[idx] = '';
      return {
        idx,
        score: humanReduction * 1.22
          + aiGain * 0.38
          + tttCheapMovePotential(board, idx, 'X') * 1.22
          + tttCheapMovePotential(board, idx, 'O') * 1.02
          + centerBias
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 16 ? 42 : (occupied < 32 ? 34 : 24))
    .map(item => item.idx);

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;
  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 32 && bestIdx >= 0) break;

    board[idx] = 'O';
    const ownWinNow = tttWinner(board).winner === 'O' ? 1 : 0;
    const humanRiskAfterMove = tttReplyLockdownRisk(board, 'X') + tttLineVectorScore(board, 'X') * 0.58;
    const aiPressureAfterMove = tttReplyLockdownRisk(board, 'O') + tttLineVectorScore(board, 'O') * 0.44;
    const immediateHumanWins = tttWinningMoves(board, 'X').length;

    const replyPool = new Set([
      ...tttWinningMoves(board, 'X'),
      ...tttThreatWindowMoves(board, 'X'),
      ...tttCriticalThreatMoves(board, 'X'),
      ...tttOpenThreeThreatMoves(board, 'X'),
      ...tttOpenTwoThreatMoves(board, 'X'),
      ...tttCandidateMoves(board, occupied < 26 ? 3 : 2)
    ]);
    let replies = Array.from(replyPool)
      .filter(reply => Number.isFinite(Number(reply)) && !board[Number(reply)])
      .map(Number)
      .map(reply => {
        board[reply] = 'X';
        const replyScore = (tttWinner(board).winner === 'X' ? 220000000 : 0)
          + tttWinningMoves(board, 'X').length * 52000000
          + tttReplyLockdownRisk(board, 'X')
          + tttLineVectorScore(board, 'X') * 0.86
          + tttCheapMovePotential(board, reply, 'X') * 1.08;
        board[reply] = '';
        return { reply, score: replyScore };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 18 ? 20 : 14)
      .map(item => item.reply);

    let worstRisk = immediateHumanWins * 180000000 + humanRiskAfterMove;
    for (const reply of replies) {
      board[reply] = 'X';
      const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
      const replyHumanWins = tttWinningMoves(board, 'X').length;
      const replyBaseRisk = replyWinner * 260000000
        + replyHumanWins * 76000000
        + tttReplyLockdownRisk(board, 'X')
        + tttLineVectorScore(board, 'X') * 0.92
        - tttReplyLockdownRisk(board, 'O') * 0.22;

      const counterPool = new Set([
        ...tttWinningMoves(board, 'O'),
        ...tttWinningMoves(board, 'X'),
        ...tttThreatWindowMoves(board, 'X'),
        ...tttCriticalThreatMoves(board, 'X'),
        ...tttOpenThreeThreatMoves(board, 'X'),
        ...tttCandidateMoves(board, 2)
      ]);
      const counters = Array.from(counterPool)
        .filter(counter => Number.isFinite(Number(counter)) && !board[Number(counter)])
        .map(Number)
        .map(counter => ({
          counter,
          score: tttCheapMovePotential(board, counter, 'O') * 1.16
            + tttCheapMovePotential(board, counter, 'X') * 1.28
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(item => item.counter);

      let bestCounterRisk = replyBaseRisk;
      for (const counter of counters) {
        board[counter] = 'O';
        const counterRisk = (tttWinner(board).winner === 'O' ? -70000000 : 0)
          + tttWinningMoves(board, 'X').length * 42000000
          + tttReplyLockdownRisk(board, 'X')
          + tttLineVectorScore(board, 'X') * 0.82
          - tttReplyLockdownRisk(board, 'O') * 0.42;
        board[counter] = '';
        if (counterRisk < bestCounterRisk) bestCounterRisk = counterRisk;
      }
      board[reply] = '';
      const replyRisk = Math.max(replyBaseRisk * 0.62, bestCounterRisk * 0.96);
      if (replyRisk > worstRisk) worstRisk = replyRisk;
    }

    board[idx] = '';
    const humanReduction = baseHumanRisk - humanRiskAfterMove;
    const candidateScore = ownWinNow * 320000000
      + humanReduction * 1.75
      + aiPressureAfterMove * 0.64
      + tttCheapMovePotential(board, idx, 'O') * 1.16
      + tttCheapMovePotential(board, idx, 'X') * 0.92
      - worstRisk * 1.34;
    if (candidateScore > bestScore || (Math.abs(candidateScore - bestScore) < 1 && worstRisk < bestWorstRisk)) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  if (occupied >= 8 || baseHumanRisk > 90000 || bestWorstRisk < Math.max(1800000, baseHumanRisk * 1.65)) return bestIdx;
  return -1;
}


function tttEarlyTrapRiskScore(board, mark) {
  const winner = tttWinner(board).winner === mark ? 1 : 0;
  const wins = tttWinningMoves(board, mark).length;
  const critical = tttCriticalThreatMoves(board, mark).length;
  const windows = tttThreatWindowMoves(board, mark).length;
  const openThrees = tttOpenThreeThreatMoves(board, mark).length;
  const openTwos = typeof tttOpenTwoThreatMoves === 'function' ? tttOpenTwoThreatMoves(board, mark).length : 0;
  const fork = tttBestForkMove(board, mark) >= 0 ? 1 : 0;
  const vector = tttLineVectorScore(board, mark);
  const pressure = tttTacticalPressureScore(board, mark);
  return winner * 420000000
    + wins * 88000000
    + critical * 24000000
    + windows * 9600000
    + openThrees * 5200000
    + openTwos * 560000
    + fork * 8200000
    + vector * 1.72
    + pressure * 1.08;
}

function tttBestEarlyTrapLockMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 4) return -1;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const baseHumanRisk = tttEarlyTrapRiskScore(board, 'X');
  const baseAiRisk = tttEarlyTrapRiskScore(board, 'O');

  const rawCandidates = new Set([
    ...tttCandidateMoves(board, occupied < 18 ? 4 : 3),
    ...tttThreatWindowMoves(board, 'X'),
    ...tttCriticalThreatMoves(board, 'X'),
    ...tttOpenThreeThreatMoves(board, 'X'),
    ...tttOpenTwoThreatMoves(board, 'X'),
    ...tttThreatWindowMoves(board, 'O'),
    ...tttCriticalThreatMoves(board, 'O'),
    ...tttOpenThreeThreatMoves(board, 'O')
  ]);

  let candidates = Array.from(rawCandidates)
    .filter(idx => Number.isFinite(Number(idx)) && !board[Number(idx)])
    .map(Number)
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      board[idx] = 'O';
      const humanRiskAfter = tttEarlyTrapRiskScore(board, 'X');
      const aiRiskAfter = tttEarlyTrapRiskScore(board, 'O');
      board[idx] = '';
      return {
        idx,
        score: (baseHumanRisk - humanRiskAfter) * 1.32
          + (aiRiskAfter - baseAiRisk) * 0.64
          + tttCheapMovePotential(board, idx, 'X') * 1.28
          + tttCheapMovePotential(board, idx, 'O') * 1.06
          + Math.max(0, 120 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 5)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 16 ? 46 : (occupied < 28 ? 34 : 24))
    .map(item => item.idx);

  if (!candidates.length) return -1;

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;
  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 24 && bestIdx >= 0) break;
    board[idx] = 'O';
    const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
    const humanRiskAfterO = tttEarlyTrapRiskScore(board, 'X');
    const aiRiskAfterO = tttEarlyTrapRiskScore(board, 'O');
    const immediateHumanWins = tttWinningMoves(board, 'X').length;

    let replies = Array.from(new Set([
      ...tttCandidateMoves(board, occupied < 18 ? 3 : 2),
      ...tttThreatWindowMoves(board, 'X'),
      ...tttCriticalThreatMoves(board, 'X'),
      ...tttOpenThreeThreatMoves(board, 'X'),
      ...tttOpenTwoThreatMoves(board, 'X')
    ])).filter(reply => Number.isFinite(Number(reply)) && !board[Number(reply)]).map(Number);
    replies = replies
      .map(reply => {
        board[reply] = 'X';
        const replyScore = tttEarlyTrapRiskScore(board, 'X')
          - tttEarlyTrapRiskScore(board, 'O') * 0.24
          + tttCheapMovePotential(board, reply, 'X') * 1.1;
        board[reply] = '';
        return { reply, score: replyScore };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 18 ? 22 : 16)
      .map(item => item.reply);

    let worstRisk = immediateHumanWins * 120000000 + humanRiskAfterO;
    for (const reply of replies) {
      const tick = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (deadline && tick > deadline - 12 && worstRisk > bestWorstRisk) break;
      board[reply] = 'X';
      const replyWins = tttWinningMoves(board, 'X').length;
      const replyRiskBase = tttEarlyTrapRiskScore(board, 'X');
      const aiImmediate = tttWinningMoves(board, 'O').length;
      let bestCounterRelief = 0;
      const counters = Array.from(new Set([
        ...tttCandidateMoves(board, 2),
        ...tttThreatWindowMoves(board, 'X'),
        ...tttCriticalThreatMoves(board, 'X'),
        ...tttOpenThreeThreatMoves(board, 'X'),
        ...tttThreatWindowMoves(board, 'O')
      ])).filter(counter => Number.isFinite(Number(counter)) && !board[Number(counter)]).map(Number)
        .map(counter => {
          board[counter] = 'O';
          const relief = replyRiskBase - tttEarlyTrapRiskScore(board, 'X') + tttEarlyTrapRiskScore(board, 'O') * 0.26;
          board[counter] = '';
          return relief;
        })
        .sort((a, b) => b - a)
        .slice(0, 10);
      if (counters.length) bestCounterRelief = Math.max(0, counters[0]);
      const replyRisk = replyWins * 130000000
        + replyRiskBase
        - aiImmediate * 42000000
        - bestCounterRelief * 0.52;
      board[reply] = '';
      if (replyRisk > worstRisk) worstRisk = replyRisk;
    }

    board[idx] = '';
    const candidateScore = ownWin * 500000000
      + (baseHumanRisk - humanRiskAfterO) * 1.9
      + (aiRiskAfterO - baseAiRisk) * 0.82
      + tttCheapMovePotential(board, idx, 'O') * 1.14
      + tttCheapMovePotential(board, idx, 'X') * 1.22
      - worstRisk * 1.46;

    if (candidateScore > bestScore || (Math.abs(candidateScore - bestScore) < 1 && worstRisk < bestWorstRisk)) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  if (occupied >= 6 || baseHumanRisk > 60000 || bestWorstRisk < Math.max(2600000, baseHumanRisk * 1.35)) return bestIdx;
  return -1;
}


function tttBestThirteenTurnClampMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 5) return -1;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const baseHuman = tttEarlyTrapRiskScore(board, 'X') + tttReplyLockdownRisk(board, 'X') * 0.62 + tttLineVectorScore(board, 'X') * 0.44;
  const baseAi = tttEarlyTrapRiskScore(board, 'O') + tttReplyLockdownRisk(board, 'O') * 0.44 + tttLineVectorScore(board, 'O') * 0.28;

  const rawCandidates = new Set([
    ...tttCandidateMoves(board, occupied < 20 ? 4 : 3),
    ...tttThreatWindowMoves(board, 'X'),
    ...tttCriticalThreatMoves(board, 'X'),
    ...tttOpenThreeThreatMoves(board, 'X'),
    ...tttOpenTwoThreatMoves(board, 'X'),
    ...tttThreatWindowMoves(board, 'O'),
    ...tttCriticalThreatMoves(board, 'O'),
    ...tttOpenThreeThreatMoves(board, 'O'),
    ...tttOpenTwoThreatMoves(board, 'O')
  ]);

  let candidates = Array.from(rawCandidates)
    .filter(idx => Number.isFinite(Number(idx)) && !board[Number(idx)])
    .map(Number)
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      board[idx] = 'O';
      const xRisk = tttEarlyTrapRiskScore(board, 'X') + tttReplyLockdownRisk(board, 'X') * 0.68 + tttLineVectorScore(board, 'X') * 0.52;
      const oRisk = tttEarlyTrapRiskScore(board, 'O') + tttReplyLockdownRisk(board, 'O') * 0.5 + tttLineVectorScore(board, 'O') * 0.34;
      const xWins = tttWinningMoves(board, 'X').length;
      board[idx] = '';
      return {
        idx,
        score: (baseHuman - xRisk) * 2.2
          + (oRisk - baseAi) * 0.74
          - xWins * 95000000
          + tttCheapMovePotential(board, idx, 'X') * 1.48
          + tttCheapMovePotential(board, idx, 'O') * 1.18
          + Math.max(0, 140 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 6)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 16 ? 54 : (occupied < 28 ? 40 : 26))
    .map(item => item.idx);

  if (!candidates.length) return -1;

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;

  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 34 && bestIdx >= 0) break;
    board[idx] = 'O';
    const ownWinNow = tttWinner(board).winner === 'O' ? 1 : 0;
    const ownImmediateWins = tttWinningMoves(board, 'O').length;
    const xImmediateWins = tttWinningMoves(board, 'X').length;
    const xAfterO = tttEarlyTrapRiskScore(board, 'X') + tttReplyLockdownRisk(board, 'X') * 0.74 + tttLineVectorScore(board, 'X') * 0.58;
    const oAfterO = tttEarlyTrapRiskScore(board, 'O') + tttReplyLockdownRisk(board, 'O') * 0.54 + tttLineVectorScore(board, 'O') * 0.38;

    const replyPool = new Set([
      ...tttCandidateMoves(board, occupied < 20 ? 4 : 3),
      ...tttThreatWindowMoves(board, 'X'),
      ...tttCriticalThreatMoves(board, 'X'),
      ...tttOpenThreeThreatMoves(board, 'X'),
      ...tttOpenTwoThreatMoves(board, 'X'),
      ...tttThreatWindowMoves(board, 'O')
    ]);
    let replies = Array.from(replyPool)
      .filter(reply => Number.isFinite(Number(reply)) && !board[Number(reply)])
      .map(Number)
      .map(reply => {
        board[reply] = 'X';
        const score = (tttWinner(board).winner === 'X' ? 320000000 : 0)
          + tttWinningMoves(board, 'X').length * 92000000
          + tttEarlyTrapRiskScore(board, 'X')
          + tttReplyLockdownRisk(board, 'X') * 0.86
          + tttLineVectorScore(board, 'X') * 0.62
          + tttCheapMovePotential(board, reply, 'X') * 1.2
          - tttWinningMoves(board, 'O').length * 46000000;
        board[reply] = '';
        return { reply, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 18 ? 26 : 18)
      .map(item => item.reply);

    let worstRisk = xImmediateWins * 220000000 + xAfterO;
    for (const reply of replies) {
      const tick = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (deadline && tick > deadline - 16 && worstRisk > bestWorstRisk) break;
      board[reply] = 'X';
      const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
      const replyWins = tttWinningMoves(board, 'X').length;
      const replyCritical = tttCriticalThreatMoves(board, 'X').length;
      const replyOpenThree = tttOpenThreeThreatMoves(board, 'X').length;
      const replyOpenTwo = tttOpenTwoThreatMoves(board, 'X').length;
      const replyFork = tttBestForkMove(board, 'X') >= 0 ? 1 : 0;
      const replyBaseRisk = tttEarlyTrapRiskScore(board, 'X')
        + tttReplyLockdownRisk(board, 'X') * 0.92
        + tttLineVectorScore(board, 'X') * 0.72
        - tttEarlyTrapRiskScore(board, 'O') * 0.18;

      let bestCounterRelief = 0;
      const counters = Array.from(new Set([
        ...tttCandidateMoves(board, 3),
        ...tttThreatWindowMoves(board, 'X'),
        ...tttCriticalThreatMoves(board, 'X'),
        ...tttOpenThreeThreatMoves(board, 'X'),
        ...tttThreatWindowMoves(board, 'O'),
        ...tttCriticalThreatMoves(board, 'O')
      ])).filter(counter => Number.isFinite(Number(counter)) && !board[Number(counter)]).map(Number)
        .map(counter => {
          board[counter] = 'O';
          const relief = replyBaseRisk
            - (tttEarlyTrapRiskScore(board, 'X') + tttReplyLockdownRisk(board, 'X') * 0.82 + tttLineVectorScore(board, 'X') * 0.6)
            + tttWinningMoves(board, 'O').length * 52000000
            + tttEarlyTrapRiskScore(board, 'O') * 0.24;
          board[counter] = '';
          return relief;
        })
        .sort((a, b) => b - a)
        .slice(0, 12);
      if (counters.length) bestCounterRelief = Math.max(0, counters[0]);
      board[reply] = '';

      const replyRisk = replyWinner * 420000000
        + replyWins * 135000000
        + replyCritical * 54000000
        + replyOpenThree * 22000000
        + replyOpenTwo * 2600000
        + replyFork * 30000000
        + replyBaseRisk
        - bestCounterRelief * 0.48;
      if (replyRisk > worstRisk) worstRisk = replyRisk;
    }

    board[idx] = '';
    const candidateScore = ownWinNow * 700000000
      + ownImmediateWins * 160000000
      + (baseHuman - xAfterO) * 2.45
      + (oAfterO - baseAi) * 0.92
      + tttCheapMovePotential(board, idx, 'O') * 1.26
      + tttCheapMovePotential(board, idx, 'X') * 1.42
      - worstRisk * 1.62;

    if (candidateScore > bestScore || (Math.abs(candidateScore - bestScore) < 1 && worstRisk < bestWorstRisk)) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  if (occupied >= 5 || baseHuman > 26000 || bestWorstRisk < Math.max(3600000, baseHuman * 1.22)) return bestIdx;
  return -1;
}

function getRakTttAiHardeningV922Health() {
  return {
    ok: true,
    mode: 'ttt-ai-hardening-v923',
    version: String(window.APP_VERSION || 'v.1.5 (963)'),
    thirteenTurnClamp: true,
    hardSearchDepthEarly: 8,
    hardSearchDepthMid: 8,
    onlineFlowTouched: true,
    note: 'AI proti počítači má clamp vrstvy; od v951 má online Piškvorky samostatná 10 sloupců × 19 řad ruleset metadata a kompatibilitní guard.'
  };
}
if (typeof window !== 'undefined') window.getRakTttAiHardeningV922Health = getRakTttAiHardeningV922Health;

function tttBestUltraSafetyMove(board, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 5) return -1;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  const baseRisk = tttTacticalPressureScore(board, 'X');
  let candidates = Array.from(new Set(tttCandidateMoves(board, occupied < 20 ? 3 : 2))).filter(idx => !board[idx]);
  candidates = candidates
    .map(idx => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      return {
        idx,
        score: tttCheapMovePotential(board, idx, 'O') * 1.05
          + tttCheapMovePotential(board, idx, 'X') * 1.18
          + Math.max(0, 100 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 5)
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 16 ? 34 : (occupied < 28 ? 28 : 20))
    .map(item => item.idx);

  let bestIdx = -1;
  let bestScore = -Infinity;
  let bestWorstRisk = Infinity;
  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (deadline && now > deadline - 20 && bestIdx >= 0) break;
    board[idx] = 'O';
    const ownImmediate = tttWinningMoves(board, 'O').length;
    const ownPressure = tttTacticalPressureScore(board, 'O');
    const xImmediateAfterO = tttWinningMoves(board, 'X').length;
    let replies = Array.from(new Set(tttCandidateMoves(board, occupied < 18 ? 3 : 2))).filter(reply => !board[reply]);
    replies = replies
      .map(reply => {
        board[reply] = 'X';
        const replyPressure = tttTacticalPressureScore(board, 'X');
        const replyWin = tttWinner(board).winner === 'X' ? 1 : 0;
        const replyWins = tttWinningMoves(board, 'X').length;
        board[reply] = '';
        return { reply, score: tttCheapMovePotential(board, reply, 'X') + replyPressure * 0.0001 + replyWin * 1000000 + replyWins * 300000 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 18 ? 14 : 10)
      .map(item => item.reply);

    let worstRisk = xImmediateAfterO * 28000000;
    for (const reply of replies) {
      board[reply] = 'X';
      const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
      const xWins = tttWinningMoves(board, 'X').length;
      const xCritical = tttCriticalThreatMoves(board, 'X').length;
      const xWindows = tttThreatWindowMoves(board, 'X').length;
      const xOpenThrees = tttOpenThreeThreatMoves(board, 'X').length;
      const xFork = tttBestForkMove(board, 'X') >= 0 ? 1 : 0;
      const xPressure = tttTacticalPressureScore(board, 'X');
      const oCounterWin = tttWinningMoves(board, 'O').length;
      const oPressure = tttTacticalPressureScore(board, 'O');
      board[reply] = '';
      const risk = replyWinner * 70000000
        + xWins * 19000000
        + xCritical * 3600000
        + xWindows * 1700000
        + xOpenThrees * 980000
        + xFork * 1350000
        + xPressure * 0.9
        - oCounterWin * 8500000
        - oPressure * 0.22;
      if (risk > worstRisk) worstRisk = risk;
    }
    board[idx] = '';
    const candidateScore = ownImmediate * 16000000
      + ownPressure * 0.96
      + tttCheapMovePotential(board, idx, 'O') * 1.1
      - worstRisk * 1.24;
    if (candidateScore > bestScore || (Math.abs(candidateScore - bestScore) < 1 && worstRisk < bestWorstRisk)) {
      bestScore = candidateScore;
      bestIdx = idx;
      bestWorstRisk = worstRisk;
    }
  }

  if (bestIdx < 0) return -1;
  if (baseRisk > 40000 || bestWorstRisk < 2200000 || occupied >= 8) return bestIdx;
  return -1;
}

function tttHardSearchDepth(board) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  if (occupied < 8) return 8;
  if (occupied < 18) return 8;
  if (occupied < 30) return 7;
  if (occupied < 42) return 4;
  return 2;
}

function tttEngineNow() {
  return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
}

function tttEngineBudgetMs(difficulty) {
  const lowEnd = !!(typeof document !== 'undefined' && document.body && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lowEndDevice') || document.body.classList.contains('lightweightMode')));
  if (difficulty !== 'ai') return 90;
  return lowEnd ? 180 : 320;
}

function tttNearestCenterFallbackMove(board) {
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  let best = -1;
  let bestScore = Infinity;
  for (let idx = 0; idx < board.length; idx += 1) {
    if (board[idx]) continue;
    const row = Math.floor(idx / TTT_COLS);
    const col = idx % TTT_COLS;
    const score = Math.abs(row - centerRow) + Math.abs(col - centerCol) * 0.94;
    if (score < bestScore) {
      bestScore = score;
      best = idx;
    }
  }
  return best;
}

function tttPromptEngineOpeningMove(board) {
  const preferred = [[9, 4], [9, 5], [8, 4], [10, 5], [8, 5], [10, 4], [9, 3], [9, 6]];
  for (const pair of preferred) {
    const row = pair[0];
    const col = pair[1];
    if (!tttInBounds(row, col)) continue;
    const idx = tttIndex(row, col);
    if (!board[idx]) return idx;
  }
  return tttOpeningBookMove(board);
}

function tttPromptEnginePickThreatMove(board, moves, mark) {
  const unique = Array.from(new Set((moves || []).map(Number).filter(idx => Number.isFinite(idx) && idx >= 0 && idx < board.length && !board[idx])));
  if (!unique.length) return -1;
  let best = unique[0];
  let bestScore = -Infinity;
  for (const idx of unique) {
    board[idx] = mark;
    const score = (tttWinner(board).winner === mark ? 900000000 : 0)
      + tttWinningMoves(board, mark).length * 120000000
      + tttCriticalThreatMoves(board, mark).length * 24000000
      + tttOpenThreeThreatMoves(board, mark).length * 6000000
      + tttSimpleMoveScore(board, idx, mark);
    board[idx] = '';
    if (score > bestScore) {
      bestScore = score;
      best = idx;
    }
  }
  return best;
}

function tttPromptEngineTacticalMove(board, difficulty, deadline) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;

  const ownWins = tttWinningMoves(board, 'O');
  if (ownWins.length) return tttPromptEnginePickThreatMove(board, ownWins, 'O');

  const opponentWins = tttWinningMoves(board, 'X');
  if (opponentWins.length) {
    const block = tttPromptEnginePickThreatMove(board, opponentWins, 'O');
    if (block >= 0) return block;
  }

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  const opponentFours = Array.from(new Set([
    ...tttThreatWindowMoves(board, 'X'),
    ...tttCriticalThreatMoves(board, 'X')
  ]));
  const forcedBlock = tttPromptEnginePickThreatMove(board, opponentFours, 'O');
  if (forcedBlock >= 0) return forcedBlock;

  if (deadline && tttEngineNow() > deadline - 28) {
    const emergency = tttPromptEnginePickThreatMove(board, tttCandidateMoves(board, occupied < 10 ? 3 : 2), 'O');
    return emergency >= 0 ? emergency : tttNearestCenterFallbackMove(board);
  }

  return -1;
}


function tttV952PromptCandidateSet(board, occupied, radius) {
  const set = new Set();
  const add = (moves) => (moves || []).forEach(idx => {
    const n = Number(idx);
    if (Number.isFinite(n) && n >= 0 && n < board.length && !board[n]) set.add(n);
  });
  add(tttWinningMoves(board, 'O'));
  add(tttWinningMoves(board, 'X'));
  add(tttThreatWindowMoves(board, 'O'));
  add(tttThreatWindowMoves(board, 'X'));
  add(tttCriticalThreatMoves(board, 'O'));
  add(tttCriticalThreatMoves(board, 'X'));
  add(tttOpenThreeThreatMoves(board, 'O'));
  add(tttOpenThreeThreatMoves(board, 'X'));
  add(tttCandidateMoves(board, radius || (occupied < 18 ? 3 : 2)));
  if (!set.size) {
    const fallback = tttNearestCenterFallbackMove(board);
    if (fallback >= 0) set.add(fallback);
  }
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  return Array.from(set).sort((a, b) => {
    const as = tttCheapMovePotential(board, a, 'O') * 1.12 + tttCheapMovePotential(board, a, 'X') * 1.08;
    const bs = tttCheapMovePotential(board, b, 'O') * 1.12 + tttCheapMovePotential(board, b, 'X') * 1.08;
    if (Math.abs(bs - as) > 0.001) return bs - as;
    const ar = Math.floor(a / TTT_COLS), ac = a % TTT_COLS;
    const br = Math.floor(b / TTT_COLS), bc = b % TTT_COLS;
    return (Math.abs(ar - centerRow) + Math.abs(ac - centerCol)) - (Math.abs(br - centerRow) + Math.abs(bc - centerCol));
  });
}

function tttV952StaticThreatScore(board, mark) {
  const wins = tttWinningMoves(board, mark).length;
  const critical = tttCriticalThreatMoves(board, mark).length;
  const windows = tttThreatWindowMoves(board, mark).length;
  const openThree = tttOpenThreeThreatMoves(board, mark).length;
  const openTwo = tttOpenTwoThreatMoves(board, mark).length;
  const fork = tttBestForkMove(board, mark) >= 0 ? 1 : 0;
  const pressure = tttTacticalPressureScore(board, mark);
  return wins * 120000000 + critical * 18500000 + windows * 6200000 + openThree * 2400000 + fork * 5200000 + openTwo * 220000 + pressure * 0.74;
}

function tttV952PickVerifiedBlock(board, opponentWins, deadline) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  const candidates = Array.from(new Set([...(opponentWins || []), ...tttV952PromptCandidateSet(board, occupied, 2)]))
    .filter(idx => Number.isFinite(Number(idx)) && idx >= 0 && idx < board.length && !board[idx]);
  let best = -1;
  let bestScore = -Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 18 && best >= 0) break;
    board[idx] = 'O';
    const remainingWins = tttWinningMoves(board, 'X').length;
    const ownWin = tttWinningMoves(board, 'O').length;
    const ownPressure = tttV952StaticThreatScore(board, 'O');
    const xPressure = tttV952StaticThreatScore(board, 'X');
    board[idx] = '';
    const score = -remainingWins * 900000000 + ownWin * 140000000 + ownPressure * 0.72 - xPressure * 1.18 + tttCheapMovePotential(board, idx, 'O');
    if (remainingWins === 0 && score > bestScore) {
      bestScore = score;
      best = idx;
    }
  }
  if (best >= 0) return best;
  return tttPromptEnginePickThreatMove(board, opponentWins, 'O');
}

function tttV952RootSafetyMove(board, difficulty, deadline) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;

  const ownWins = tttWinningMoves(board, 'O');
  if (ownWins.length) return tttPromptEnginePickThreatMove(board, ownWins, 'O');

  const opponentWins = tttWinningMoves(board, 'X');
  if (opponentWins.length) return tttV952PickVerifiedBlock(board, opponentWins, deadline);

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  const ownFork = tttBestForkMove(board, 'O');
  if (ownFork >= 0 && !board[ownFork]) {
    board[ownFork] = 'O';
    const xWin = tttWinningMoves(board, 'X').length;
    board[ownFork] = '';
    if (!xWin) return ownFork;
  }

  const opponentFork = tttBestForkMove(board, 'X');
  if (opponentFork >= 0 && !board[opponentFork]) {
    const blockFork = tttV952PickVerifiedBlock(board, [opponentFork], deadline);
    if (blockFork >= 0) return blockFork;
  }

  const candidates = tttV952PromptCandidateSet(board, occupied, occupied < 18 ? 3 : 2)
    .slice(0, difficulty === 'ai' ? (occupied < 20 ? 30 : 24) : 12);
  if (!candidates.length) return tttNearestCenterFallbackMove(board);

  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  let best = -1;
  let bestScore = -Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 24 && best >= 0) break;
    board[idx] = 'O';
    if (tttWinner(board).winner === 'O') {
      board[idx] = '';
      return idx;
    }
    const immediateLosses = tttWinningMoves(board, 'X').length;
    const ownThreat = tttV952StaticThreatScore(board, 'O');
    const xThreat = tttV952StaticThreatScore(board, 'X');
    let replies = tttV952PromptCandidateSet(board, occupied + 1, 2)
      .map(reply => ({ reply, score: tttCheapMovePotential(board, reply, 'X') + tttV952StaticThreatScore((() => { board[reply] = 'X'; const snap = board.slice(); board[reply] = ''; return snap; })(), 'X') * 0.0002 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, occupied < 24 ? 12 : 8)
      .map(item => item.reply);
    if (!replies.length) replies = [tttNearestCenterFallbackMove(board)].filter(n => n >= 0 && !board[n]);

    let worstReply = immediateLosses * 950000000;
    for (const reply of replies) {
      if (deadline && tttEngineNow() > deadline - 12 && worstReply > 0) break;
      board[reply] = 'X';
      const xWinsNow = tttWinner(board).winner === 'X' ? 1 : 0;
      const xNextWins = tttWinningMoves(board, 'X').length;
      const oCounterWins = tttWinningMoves(board, 'O').length;
      const xPressure = tttV952StaticThreatScore(board, 'X');
      const oPressure = tttV952StaticThreatScore(board, 'O');
      board[reply] = '';
      const risk = xWinsNow * 1400000000 + xNextWins * 260000000 + xPressure * 1.08 - oCounterWins * 180000000 - oPressure * 0.34;
      if (risk > worstReply) worstReply = risk;
    }

    const row = Math.floor(idx / TTT_COLS);
    const col = idx % TTT_COLS;
    const centerBonus = Math.max(0, 90 - (Math.abs(row - centerRow) + Math.abs(col - centerCol)) * 7);
    const score = ownThreat * 1.02 - xThreat * 0.44 - worstReply * 1.12 + tttCheapMovePotential(board, idx, 'O') * 1.3 + centerBonus;
    board[idx] = '';
    if (score > bestScore) {
      bestScore = score;
      best = idx;
    }
  }
  return best >= 0 ? best : tttNearestCenterFallbackMove(board);
}

function getRakOnlineGomokuEngineV954Health() {
  return {
    ok: true,
    version: String(window.APP_VERSION || 'v.1.5 (963)'),
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    winLength: TTT_WIN_LENGTH,
    deterministic: true,
    onlineMetadata: true,
    immediateWinLossGuard: true,
    deadlineGuard: true,
    legacyOnlineDimensionGuard: true,
    note: 'Piškvorky drží 10 sloupců × 19 řad, AI má v954 bounded tactical/safety engine proti zaseknutí a online PvP zůstává člověk proti člověku.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakOnlineGomokuEngineV954Health = getRakOnlineGomokuEngineV954Health;
  window.getRakOnlineGomokuEngineV953Health = getRakOnlineGomokuEngineV954Health;
  window.getRakOnlineGomokuEngineV952Health = getRakOnlineGomokuEngineV954Health;
  window.getRakOnlineGomokuEngineV951Health = getRakOnlineGomokuEngineV954Health;
}


function tttV954CenterScore(idx) {
  const row = Math.floor(idx / TTT_COLS);
  const col = idx % TTT_COLS;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  return Math.max(0, 120 - (Math.abs(row - centerRow) * 6.2 + Math.abs(col - centerCol) * 7.4));
}

function tttV954ThreatScore(board, mark) {
  const wins = tttWinningMoves(board, mark).length;
  const critical = tttCriticalThreatMoves(board, mark).length;
  const windows = tttThreatWindowMoves(board, mark).length;
  const openThree = tttOpenThreeThreatMoves(board, mark).length;
  const openTwo = tttOpenTwoThreatMoves(board, mark).length;
  const fork = tttBestForkMove(board, mark) >= 0 ? 1 : 0;
  const pressure = tttTacticalPressureScore(board, mark);
  return wins * 180000000
    + critical * 26000000
    + windows * 8600000
    + openThree * 3600000
    + fork * 7600000
    + openTwo * 360000
    + pressure * 0.68;
}

function tttV954CandidateSet(board, radius) {
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  const set = new Set();
  const add = (moves) => (moves || []).forEach(idx => {
    const n = Number(idx);
    if (Number.isFinite(n) && n >= 0 && n < board.length && !board[n]) set.add(n);
  });
  add(tttWinningMoves(board, 'O'));
  add(tttWinningMoves(board, 'X'));
  add(tttCriticalThreatMoves(board, 'O'));
  add(tttCriticalThreatMoves(board, 'X'));
  add(tttThreatWindowMoves(board, 'O'));
  add(tttThreatWindowMoves(board, 'X'));
  add(tttOpenThreeThreatMoves(board, 'O'));
  add(tttOpenThreeThreatMoves(board, 'X'));
  add(tttOpenTwoThreatMoves(board, 'O'));
  add(tttOpenTwoThreatMoves(board, 'X'));
  add(tttCandidateMoves(board, radius || (occupied < 16 ? 3 : 2)));
  if (!set.size) {
    const fallback = tttNearestCenterFallbackMove(board);
    if (fallback >= 0) set.add(fallback);
  }
  return Array.from(set).sort((a, b) => {
    const as = tttCheapMovePotential(board, a, 'O') * 1.18 + tttCheapMovePotential(board, a, 'X') * 1.28 + tttV954CenterScore(a);
    const bs = tttCheapMovePotential(board, b, 'O') * 1.18 + tttCheapMovePotential(board, b, 'X') * 1.28 + tttV954CenterScore(b);
    return bs - as;
  });
}

function tttV954PickVerifiedDefense(board, attackMoves, deadline) {
  const moves = Array.from(new Set((attackMoves || []).map(Number).filter(idx => Number.isFinite(idx) && idx >= 0 && idx < board.length && !board[idx])));
  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  const candidates = Array.from(new Set([...moves, ...tttV954CandidateSet(board, occupied < 16 ? 3 : 2)]))
    .filter(idx => Number.isFinite(idx) && idx >= 0 && idx < board.length && !board[idx])
    .slice(0, 30);
  let best = -1;
  let bestScore = -Infinity;
  let bestLosses = Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 18 && best >= 0) break;
    board[idx] = 'O';
    const remainingWins = tttWinningMoves(board, 'X').length;
    const xThreat = tttV954ThreatScore(board, 'X');
    const oThreat = tttV954ThreatScore(board, 'O');
    const createsWin = tttWinningMoves(board, 'O').length;
    board[idx] = '';
    const score = -remainingWins * 1200000000 - xThreat * 1.38 + oThreat * 0.78 + createsWin * 260000000 + tttCheapMovePotential(board, idx, 'O') * 1.1 + tttV954CenterScore(idx);
    if (remainingWins < bestLosses || (remainingWins === bestLosses && score > bestScore)) {
      bestLosses = remainingWins;
      bestScore = score;
      best = idx;
    }
  }
  return best;
}

function tttV954TopReplies(board, limit) {
  return tttV954CandidateSet(board, 2)
    .map(idx => {
      board[idx] = 'X';
      const score = (tttWinner(board).winner === 'X' ? 2000000000 : 0)
        + tttWinningMoves(board, 'X').length * 180000000
        + tttV954ThreatScore(board, 'X') * 0.92
        + tttCheapMovePotential(board, idx, 'X') * 2.0;
      board[idx] = '';
      return { idx, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit || 8)
    .map(item => item.idx);
}

function tttV954MoveScore(board, idx, deadline) {
  board[idx] = 'O';
  if (tttWinner(board).winner === 'O') {
    board[idx] = '';
    return 900000000000;
  }
  const immediateLosses = tttWinningMoves(board, 'X').length;
  const ownWins = tttV958WinningMovesFast(board, 'O').length;
  const ownThreat = tttV954ThreatScore(board, 'O');
  const xThreat = tttV954ThreatScore(board, 'X');
  const ownFork = tttBestForkMove(board, 'O') >= 0 ? 1 : 0;
  const xFork = tttBestForkMove(board, 'X') >= 0 ? 1 : 0;
  let worstReplyRisk = immediateLosses * 1600000000 + xFork * 180000000;
  const replies = tttV954TopReplies(board, 7);
  for (const reply of replies) {
    if (deadline && tttEngineNow() > deadline - 12) break;
    board[reply] = 'X';
    const replyRisk = (tttWinner(board).winner === 'X' ? 2500000000 : 0)
      + tttWinningMoves(board, 'X').length * 360000000
      + tttCriticalThreatMoves(board, 'X').length * 52000000
      + tttThreatWindowMoves(board, 'X').length * 18000000
      + tttOpenThreeThreatMoves(board, 'X').length * 7200000
      + (tttBestForkMove(board, 'X') >= 0 ? 42000000 : 0)
      + tttV954ThreatScore(board, 'X') * 0.44
      - tttWinningMoves(board, 'O').length * 260000000
      - tttV954ThreatScore(board, 'O') * 0.14;
    board[reply] = '';
    if (replyRisk > worstReplyRisk) worstReplyRisk = replyRisk;
  }
  board[idx] = '';
  return ownWins * 320000000
    + ownThreat * 1.05
    + ownFork * 54000000
    + tttCheapMovePotential(board, idx, 'O') * 2.2
    + tttCheapMovePotential(board, idx, 'X') * 1.85
    + tttV954CenterScore(idx)
    - xThreat * 0.72
    - worstReplyRisk * 1.18;
}

function tttV954BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const start = tttEngineNow();
  const hardBudget = Math.min(tttEngineBudgetMs(difficulty || 'ai'), (difficulty === 'ai' ? 320 : 110));
  const deadline = start + hardBudget;

  const ownWins = tttWinningMoves(board, 'O');
  if (ownWins.length) return tttPromptEnginePickThreatMove(board, ownWins, 'O');

  const xWins = tttWinningMoves(board, 'X');
  if (xWins.length) return tttV954PickVerifiedDefense(board, xWins, deadline);

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  const ownFork = tttBestForkMove(board, 'O');
  if (ownFork >= 0 && !board[ownFork]) {
    board[ownFork] = 'O';
    const unsafe = tttWinningMoves(board, 'X').length;
    board[ownFork] = '';
    if (!unsafe) return ownFork;
  }

  const urgentX = Array.from(new Set([
    ...tttCriticalThreatMoves(board, 'X'),
    ...tttThreatWindowMoves(board, 'X'),
    ...tttOpenThreeThreatMoves(board, 'X')
  ])).filter(idx => !board[idx]);
  if (urgentX.length) {
    const defense = tttV954PickVerifiedDefense(board, urgentX, deadline);
    if (defense >= 0) {
      board[defense] = 'O';
      const stillBad = tttWinningMoves(board, 'X').length;
      const ownCounter = tttWinningMoves(board, 'O').length + tttCriticalThreatMoves(board, 'O').length;
      board[defense] = '';
      if (!stillBad || ownCounter > 0) return defense;
    }
  }

  const candidates = tttV954CandidateSet(board, occupied < 18 ? 3 : 2)
    .filter(idx => !board[idx])
    .slice(0, occupied < 20 ? 24 : 18);
  let best = candidates[0] ?? tttNearestCenterFallbackMove(board);
  let bestScore = -Infinity;
  let bestSafe = -1;
  let bestSafeScore = -Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 18 && best >= 0) break;
    const score = tttV954MoveScore(board, idx, deadline);
    if (score > bestScore) {
      bestScore = score;
      best = idx;
    }
    board[idx] = 'O';
    const safe = tttWinningMoves(board, 'X').length === 0 && tttWinner(board).winner !== 'X';
    board[idx] = '';
    if (safe && score > bestSafeScore) {
      bestSafeScore = score;
      bestSafe = idx;
    }
  }
  const chosen = bestSafe >= 0 ? bestSafe : best;
  if (chosen >= 0 && !board[chosen]) return chosen;
  return tttNearestCenterFallbackMove(board);
}



function tttV955OccupiedCount(board) {
  let n = 0;
  for (let i = 0; i < board.length; i += 1) if (board[i]) n += 1;
  return n;
}

function tttV955LineWindowScore(board, mark) {
  const opponent = mark === 'O' ? 'X' : 'O';
  const directions = [[0,1],[1,0],[1,1],[1,-1]];
  let score = 0;
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const [dr, dc] of directions) {
        const cells = [];
        let ok = true;
        for (let step = 0; step < TTT_WIN_LENGTH; step += 1) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (!tttInBounds(r, c)) { ok = false; break; }
          cells.push(tttIndex(r, c));
        }
        if (!ok) continue;
        let own = 0;
        let empty = 0;
        let blocked = false;
        for (const idx of cells) {
          const cell = board[idx];
          if (cell === opponent) { blocked = true; break; }
          if (cell === mark) own += 1;
          else if (!cell) empty += 1;
        }
        if (blocked || own <= 0) continue;
        if (own >= 5) score += 1000000000;
        else if (own === 4 && empty === 1) score += 9000000;
        else if (own === 3 && empty === 2) score += 420000;
        else if (own === 2 && empty === 3) score += 22000;
        else if (own === 1 && empty === 4) score += 450;
      }
    }
  }
  return score;
}

function tttV955MoveThreatProfile(board, idx, mark) {
  if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) return { level: -1, score: -Infinity, winMoves: 0 };
  const opponent = mark === 'O' ? 'X' : 'O';
  board[idx] = mark;
  const winner = tttWinner(board).winner;
  const winMoves = tttWinningMoves(board, mark).length;
  const critical = tttCriticalThreatMoves(board, mark).length;
  const windows = tttThreatWindowMoves(board, mark).length;
  const openThree = tttOpenThreeThreatMoves(board, mark).length;
  const openTwo = tttOpenTwoThreatMoves(board, mark).length;
  const opponentWins = tttWinningMoves(board, opponent).length;
  const lineScore = tttV955LineWindowScore(board, mark);
  board[idx] = '';
  let level = 0;
  if (winner === mark) level = 7;
  else if (winMoves >= 2) level = 6;
  else if (winMoves === 1) level = 5;
  else if (critical >= 2) level = 4;
  else if (critical >= 1 || windows >= 2) level = 3;
  else if (openThree >= 2) level = 2;
  else if (openThree >= 1 || openTwo >= 2) level = 1;
  const score = level * 100000000
    + winMoves * 26000000
    + critical * 9200000
    + windows * 2800000
    + openThree * 900000
    + openTwo * 70000
    + lineScore
    - opponentWins * 42000000
    + tttCheapMovePotential(board, idx, mark) * 1.8
    + tttV954CenterScore(idx);
  return { level, score, winMoves, critical, windows, openThree, openTwo };
}

function tttV955ThreatMoves(board, mark, minLevel) {
  const occupied = tttV955OccupiedCount(board);
  const pool = new Set(tttV954CandidateSet(board, occupied < 16 ? 3 : 2));
  tttWinningMoves(board, mark).forEach(idx => pool.add(idx));
  tttCriticalThreatMoves(board, mark).forEach(idx => pool.add(idx));
  tttThreatWindowMoves(board, mark).forEach(idx => pool.add(idx));
  const out = [];
  for (const idx of pool) {
    if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) continue;
    const p = tttV955MoveThreatProfile(board, idx, mark);
    if (p.level >= (minLevel || 1)) out.push(Object.assign({ idx }, p));
  }
  out.sort((a, b) => (b.level - a.level) || (b.score - a.score) || (a.idx - b.idx));
  return out;
}

function tttV955PickBestFrom(board, moves, mark, deadline) {
  const unique = Array.from(new Set((moves || []).map(Number).filter(idx => Number.isFinite(idx) && idx >= 0 && idx < board.length && !board[idx])));
  let best = -1;
  let bestScore = -Infinity;
  for (const idx of unique) {
    if (deadline && tttEngineNow() > deadline - 8 && best >= 0) break;
    const p = tttV955MoveThreatProfile(board, idx, mark);
    board[idx] = mark;
    const ownScore = tttV955Evaluate(board);
    const oppWins = tttWinningMoves(board, mark === 'O' ? 'X' : 'O').length;
    board[idx] = '';
    const score = p.score + (mark === 'O' ? ownScore : -ownScore) - oppWins * 600000000;
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}

function tttV955Evaluate(board) {
  const winner = tttWinner(board).winner;
  if (winner === 'O') return 2000000000;
  if (winner === 'X') return -2000000000;
  if (winner === 'draw') return 0;
  const oThreat = tttV954ThreatScore(board, 'O') + tttV955LineWindowScore(board, 'O') * 0.82;
  const xThreat = tttV954ThreatScore(board, 'X') + tttV955LineWindowScore(board, 'X') * 1.18;
  return oThreat * 1.06 - xThreat * 1.32 + tttScoreRuns(board, 'O') * 0.14 - tttScoreRuns(board, 'X') * 0.18;
}

function tttV955CandidateSet(board, deadline) {
  const occupied = tttV955OccupiedCount(board);
  const set = new Set();
  const add = (moves) => (moves || []).forEach(idx => {
    const n = Number(idx);
    if (Number.isFinite(n) && n >= 0 && n < board.length && !board[n]) set.add(n);
  });
  add(tttWinningMoves(board, 'O'));
  add(tttWinningMoves(board, 'X'));
  add(tttV955ThreatMoves(board, 'O', 1).map(x => x.idx));
  add(tttV955ThreatMoves(board, 'X', 1).map(x => x.idx));
  add(tttV954CandidateSet(board, occupied < 16 ? 3 : 2));
  if (!set.size) add([tttNearestCenterFallbackMove(board)]);
  const arr = Array.from(set).filter(idx => !board[idx]).map(idx => {
    const op = tttV955MoveThreatProfile(board, idx, 'O');
    const xp = tttV955MoveThreatProfile(board, idx, 'X');
    return { idx, score: op.score * 1.12 + xp.score * 1.38 + tttV954CenterScore(idx) };
  }).sort((a, b) => b.score - a.score).map(item => item.idx);
  void deadline;
  return arr;
}

function tttV955ReplyRisk(board, reply, deadline) {
  board[reply] = 'X';
  const winner = tttWinner(board).winner;
  if (winner === 'X') { board[reply] = ''; return 3000000000; }
  const xWins = tttWinningMoves(board, 'X').length;
  const oWins = tttWinningMoves(board, 'O').length;
  const xProfile = tttV955MoveThreatProfile(board, reply, 'X');
  const xThreat = tttV955ThreatMoves(board, 'X', 2).slice(0, 4).reduce((s, p) => s + p.score, 0);
  let bestOAnswer = -Infinity;
  const oAnswers = tttV955CandidateSet(board, deadline).slice(0, 8);
  for (const o of oAnswers) {
    if (deadline && tttEngineNow() > deadline - 8) break;
    board[o] = 'O';
    const val = tttV955Evaluate(board) - tttWinningMoves(board, 'X').length * 500000000;
    board[o] = '';
    if (val > bestOAnswer) bestOAnswer = val;
  }
  const risk = xWins * 900000000 + xProfile.score * 0.42 + xThreat * 0.14 - oWins * 700000000 - Math.max(-500000000, bestOAnswer) * 0.08;
  board[reply] = '';
  return risk;
}

function tttV955MoveScore(board, idx, deadline) {
  board[idx] = 'O';
  if (tttWinner(board).winner === 'O') { board[idx] = ''; return 5000000000; }
  const immediateXWins = tttWinningMoves(board, 'X').length;
  const ownThreats = tttV955ThreatMoves(board, 'O', 1).slice(0, 6).reduce((s, p) => s + p.score, 0);
  const xThreats = tttV955ThreatMoves(board, 'X', 1).slice(0, 6).reduce((s, p) => s + p.score, 0);
  const replies = tttV955CandidateSet(board, deadline).slice(0, 9);
  let worstRisk = immediateXWins * 1800000000;
  for (const reply of replies) {
    if (deadline && tttEngineNow() > deadline - 10) break;
    const risk = tttV955ReplyRisk(board, reply, deadline);
    if (risk > worstRisk) worstRisk = risk;
  }
  const score = tttV955Evaluate(board) + ownThreats * 0.22 - xThreats * 0.34 - worstRisk * 1.12 + tttV954CenterScore(idx) * 8000;
  board[idx] = '';
  return score;
}

function tttV955BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const start = tttEngineNow();
  const hardBudget = Math.min(tttEngineBudgetMs(difficulty || 'ai'), difficulty === 'ai' ? 260 : 95);
  const deadline = start + hardBudget;

  const ownWins = tttV958WinningMovesFast(board, 'O');
  if (ownWins.length) return tttV955PickBestFrom(board, ownWins, 'O', deadline);

  const xWins = tttV958WinningMovesFast(board, 'X');
  if (xWins.length) return tttV955PickBestFrom(board, xWins, 'O', deadline);

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  // v.1.5 (963): prevent the human from placing the diagonal/straight gain square
  // that creates a four, fork, or clean open-three chain on the next move.
  const xNextGains = tttV957HumanNextThreatGains(board, deadline);
  const hardNextGains = xNextGains.filter(item => item.level >= (occupied >= 8 ? 3 : 5));
  if (hardNextGains.length) {
    const blockGain = tttV957PickHumanGainBlock(board, hardNextGains.slice(0, 18), deadline);
    if (blockGain >= 0) return blockGain;
  }

  const ownForcing = tttV955ThreatMoves(board, 'O', 5);
  if (ownForcing.length) {
    const move = tttV955PickBestFrom(board, ownForcing.map(x => x.idx), 'O', deadline);
    if (move >= 0) {
      board[move] = 'O';
      const unsafe = tttWinningMoves(board, 'X').length;
      board[move] = '';
      if (!unsafe) return move;
    }
  }

  const xDanger = tttV955ThreatMoves(board, 'X', 3);
  if (xDanger.length) {
    const block = tttV955PickBestFrom(board, xDanger.slice(0, 12).map(x => x.idx), 'O', deadline);
    if (block >= 0) {
      board[block] = 'O';
      const stillLosing = tttWinningMoves(board, 'X').length;
      const ownCounter = tttWinningMoves(board, 'O').length + tttV955ThreatMoves(board, 'O', 5).length;
      board[block] = '';
      if (!stillLosing || ownCounter > 0) return block;
    }
  }

  const candidates = tttV955CandidateSet(board, deadline).slice(0, occupied < 18 ? 28 : 22);
  let best = candidates[0] ?? tttNearestCenterFallbackMove(board);
  let bestScore = -Infinity;
  let bestSafe = -1;
  let bestSafeScore = -Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 16 && best >= 0) break;
    const score = tttV955MoveScore(board, idx, deadline);
    if (score > bestScore) { bestScore = score; best = idx; }
    board[idx] = 'O';
    const safe = tttWinningMoves(board, 'X').length === 0 && tttWinner(board).winner !== 'X';
    board[idx] = '';
    if (safe && score > bestSafeScore) { bestSafeScore = score; bestSafe = idx; }
  }
  const chosen = bestSafe >= 0 ? bestSafe : best;
  if (Number.isFinite(Number(chosen)) && chosen >= 0 && chosen < board.length && !board[chosen]) return chosen;
  const emergencyWin = tttWinningMove(board, 'O');
  if (emergencyWin >= 0) return emergencyWin;
  const emergencyBlock = tttWinningMove(board, 'X');
  if (emergencyBlock >= 0) return emergencyBlock;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV955Health() {
  return {
    ok: true,
    version: String(window.APP_VERSION || 'v.1.5 (963)'),
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    aiPipeline: ['immediate-win', 'immediate-loss-block', 'forcing-threats', 'opponent-danger-block', 'bounded-root-safety-search', 'center-fallback'],
    freezeGuard: true,
    onlinePvPUnchanged: true,
    note: 'v955 předělává pouze logiku AI proti počítači a opravuje centrování absence v horním dashboard panelu.'
  };
}
if (typeof window !== 'undefined') window.getRakGomokuAiV955Health = getRakGomokuAiV955Health;


function tttV956DefenseDirections() {
  return [[0, 1], [1, 0], [1, 1], [1, -1]];
}

function tttV956LineRunThreats(board, mark) {
  const out = [];
  const seen = new Set();
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      if (board[tttIndex(row, col)] !== mark) continue;
      for (const [dr, dc] of tttV956DefenseDirections()) {
        const prevRow = row - dr;
        const prevCol = col - dc;
        if (tttInBounds(prevRow, prevCol) && board[tttIndex(prevRow, prevCol)] === mark) continue;
        let r = row;
        let c = col;
        const stones = [];
        while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
          stones.push(tttIndex(r, c));
          r += dr;
          c += dc;
        }
        const beforeRow = row - dr;
        const beforeCol = col - dc;
        const afterRow = r;
        const afterCol = c;
        const defenses = [];
        if (tttInBounds(beforeRow, beforeCol) && !board[tttIndex(beforeRow, beforeCol)]) defenses.push(tttIndex(beforeRow, beforeCol));
        if (tttInBounds(afterRow, afterCol) && !board[tttIndex(afterRow, afterCol)]) defenses.push(tttIndex(afterRow, afterCol));
        if (!defenses.length) continue;
        let type = '';
        let level = 0;
        if (stones.length >= 4) { type = 'four'; level = 5; }
        else if (stones.length === 3 && defenses.length === 2) { type = 'open-three'; level = 3; }
        else if (stones.length === 3 && defenses.length === 1) { type = 'simple-three'; level = 2; }
        else if (stones.length === 2 && defenses.length === 2) { type = 'open-two'; level = 1; }
        if (!type) continue;
        const key = type + '|' + stones.join(',') + '|' + defenses.join(',') + '|' + dr + ',' + dc;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ type, level, stones, defenses, dr, dc });
      }
    }
  }
  return out;
}

function tttV956WindowThreats(board, mark) {
  const opponent = mark === 'O' ? 'X' : 'O';
  const out = [];
  const seen = new Set();
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const [dr, dc] of tttV956DefenseDirections()) {
        const cells = [];
        let ok = true;
        for (let step = 0; step < TTT_WIN_LENGTH; step += 1) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (!tttInBounds(r, c)) { ok = false; break; }
          cells.push(tttIndex(r, c));
        }
        if (!ok) continue;
        let own = 0;
        const empties = [];
        for (const idx of cells) {
          const cell = board[idx];
          if (cell === opponent) { ok = false; break; }
          if (cell === mark) own += 1;
          else if (!cell) empties.push(idx);
        }
        if (!ok || !empties.length) continue;
        let type = '';
        let level = 0;
        if (own === 4 && empties.length === 1) { type = 'window-four'; level = 5; }
        else if (own === 3 && empties.length === 2) {
          // Broken three / split three. These are lower than a contiguous open three,
          // but still real defense squares; never use fields outside this five-window.
          type = 'window-three';
          level = 2;
        }
        if (!type) continue;
        const key = type + '|' + cells.join(',') + '|' + empties.join(',');
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ type, level, cells, defenses: empties, dr, dc });
      }
    }
  }
  return out;
}

function tttV956ThreatDefenseMoves(board, mark, minLevel) {
  const moves = new Map();
  const addThreat = (threat) => {
    if (!threat || threat.level < (minLevel || 1)) return;
    (threat.defenses || []).forEach(idx => {
      const n = Number(idx);
      if (!Number.isFinite(n) || n < 0 || n >= board.length || board[n]) return;
      const prev = moves.get(n) || { idx: n, hits: 0, level: 0, types: [] };
      prev.hits += 1;
      prev.level = Math.max(prev.level, threat.level || 0);
      if (threat.type && !prev.types.includes(threat.type)) prev.types.push(threat.type);
      moves.set(n, prev);
    });
  };
  tttV956LineRunThreats(board, mark).forEach(addThreat);
  tttV956WindowThreats(board, mark).forEach(addThreat);
  return Array.from(moves.values()).sort((a, b) => (b.level - a.level) || (b.hits - a.hits) || (a.idx - b.idx));
}

function tttV956OpenThreeDefenseMoves(board, mark) {
  return tttV956LineRunThreats(board, mark)
    .filter(t => t.type === 'open-three')
    .flatMap(t => t.defenses || [])
    .filter((idx, pos, arr) => Number.isFinite(Number(idx)) && idx >= 0 && idx < board.length && !board[idx] && arr.indexOf(idx) === pos);
}

function tttV956PickDefenseMove(board, defenseEntries, deadline) {
  const entries = (defenseEntries || []).map(item => {
    if (typeof item === 'number') return { idx: item, hits: 1, level: 1, types: [] };
    return item || {};
  }).filter(item => Number.isFinite(Number(item.idx)) && item.idx >= 0 && item.idx < board.length && !board[item.idx]);
  if (!entries.length) return -1;
  let best = -1;
  let bestScore = -Infinity;
  let bestRisk = Infinity;
  for (const item of entries) {
    if (deadline && tttEngineNow() > deadline - 8 && best >= 0) break;
    const idx = Number(item.idx);
    board[idx] = 'O';
    const xWinner = tttWinner(board).winner === 'X' ? 1 : 0;
    const xWins = tttV958WinningMovesFast(board, 'X').length;
    const xFours = tttV956ThreatDefenseMoves(board, 'X', 5).length;
    const xOpenThrees = tttV956OpenThreeDefenseMoves(board, 'X').length;
    const xBroken = tttV956ThreatDefenseMoves(board, 'X', 2).length;
    const oWins = tttWinningMoves(board, 'O').length;
    const oFours = tttV956ThreatDefenseMoves(board, 'O', 5).length;
    const oOpenThrees = tttV956OpenThreeDefenseMoves(board, 'O').length;
    const oEval = tttV955Evaluate(board);
    board[idx] = '';
    const risk = xWinner * 9000000000 + xWins * 1200000000 + xFours * 180000000 + xOpenThrees * 28000000 + xBroken * 2400000;
    const score = -risk
      + (Number(item.level || 0) * 9000000)
      + (Number(item.hits || 0) * 3800000)
      + oWins * 700000000
      + oFours * 70000000
      + oOpenThrees * 9000000
      + oEval * 0.24
      + tttCheapMovePotential(board, idx, 'O') * 0.8
      + tttCheapMovePotential(board, idx, 'X') * 1.5
      + tttV954CenterScore(idx) * 1200;
    if (risk < bestRisk || (risk === bestRisk && score > bestScore)) {
      bestRisk = risk;
      bestScore = score;
      best = idx;
    }
  }
  return best;
}

function tttV956MoveLeavesMajorHumanThreat(board, idx) {
  if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) return true;
  board[idx] = 'O';
  const bad = tttWinningMoves(board, 'X').length > 0
    || tttV956ThreatDefenseMoves(board, 'X', 5).length > 0
    || tttV956OpenThreeDefenseMoves(board, 'X').length > 1
    || (typeof tttV957HumanNextThreatGains === 'function' && tttV957HumanNextThreatGains(board).some(item => item.level >= 5));
  board[idx] = '';
  return bad;
}


function tttV957HumanNextThreatGains(board, deadline) {
  const occupied = tttV955OccupiedCount(board);
  const pool = new Set(tttV954CandidateSet(board, occupied < 14 ? 3 : 2));
  tttV956ThreatDefenseMoves(board, 'X', 1).forEach(item => pool.add(item.idx));
  tttV956OpenThreeDefenseMoves(board, 'X').forEach(idx => pool.add(idx));
  const out = [];
  for (const idxRaw of pool) {
    if (deadline && tttEngineNow() > deadline - 12 && out.length) break;
    const idx = Number(idxRaw);
    if (!Number.isFinite(idx) || idx < 0 || idx >= board.length || board[idx]) continue;
    board[idx] = 'X';
    const wins = tttWinningMoves(board, 'X').length;
    const fours = tttV956ThreatDefenseMoves(board, 'X', 5).length;
    const openThrees = tttV956OpenThreeDefenseMoves(board, 'X').length;
    const windowThrees = tttV956ThreatDefenseMoves(board, 'X', 2).length;
    const fork = tttBestForkMove(board, 'X') >= 0 ? 1 : 0;
    const lineScore = tttV955LineWindowScore(board, 'X');
    board[idx] = '';
    let level = 0;
    if (wins >= 2) level = 7;
    else if (wins >= 1 || fours >= 2) level = 6;
    else if (fours >= 1) level = 5;
    else if (openThrees >= 2 || fork) level = 4;
    else if (openThrees >= 1) level = 3;
    else if (windowThrees >= 2) level = 2;
    if (level < 2) continue;
    out.push({
      idx,
      level,
      hits: wins * 4 + fours * 3 + openThrees * 2 + windowThrees + fork,
      types: ['human-next-gain'],
      score: level * 100000000 + wins * 30000000 + fours * 12000000 + openThrees * 3000000 + windowThrees * 500000 + lineScore + tttV954CenterScore(idx)
    });
  }
  return out.sort((a, b) => (b.level - a.level) || (b.hits - a.hits) || (b.score - a.score) || (a.idx - b.idx));
}

function tttV957MoveLeavesHumanGainThreat(board, idx, deadline) {
  if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) return true;
  board[idx] = 'O';
  const bad = tttWinningMoves(board, 'X').length > 0
    || tttV956ThreatDefenseMoves(board, 'X', 5).length > 0
    || tttV956OpenThreeDefenseMoves(board, 'X').length > 1
    || tttV957HumanNextThreatGains(board, deadline).some(item => item.level >= 5);
  board[idx] = '';
  return bad;
}

function tttV957PickHumanGainBlock(board, entries, deadline) {
  const filtered = (entries || []).filter(item => item && Number.isFinite(Number(item.idx)) && item.idx >= 0 && item.idx < board.length && !board[item.idx]);
  if (!filtered.length) return -1;
  let best = -1;
  let bestScore = -Infinity;
  for (const item of filtered) {
    if (deadline && tttEngineNow() > deadline - 10 && best >= 0) break;
    const idx = Number(item.idx);
    board[idx] = 'O';
    const ownWins = tttV958WinningMovesFast(board, 'O').length;
    const ownFours = tttV956ThreatDefenseMoves(board, 'O', 5).length;
    const xWins = tttV958WinningMovesFast(board, 'X').length;
    const xFours = tttV956ThreatDefenseMoves(board, 'X', 5).length;
    const xOpen = tttV956OpenThreeDefenseMoves(board, 'X').length;
    const xNext = tttV957HumanNextThreatGains(board, deadline).filter(g => g.level >= 5).length;
    const evalScore = tttV955Evaluate(board);
    board[idx] = '';
    const risk = xWins * 1000000000 + xFours * 160000000 + xOpen * 14000000 + xNext * 70000000;
    const score = -risk
      + Number(item.level || 0) * 50000000
      + Number(item.hits || 0) * 7000000
      + ownWins * 900000000
      + ownFours * 90000000
      + evalScore * 0.35
      + tttCheapMovePotential(board, idx, 'X') * 2.2
      + tttCheapMovePotential(board, idx, 'O') * 1.1
      + tttV954CenterScore(idx) * 800;
    if (score > bestScore) {
      bestScore = score;
      best = idx;
    }
  }
  return best;
}

function tttV956BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const start = tttEngineNow();
  const hardBudget = Math.min(tttEngineBudgetMs(difficulty || 'ai'), difficulty === 'ai' ? 300 : 95);
  const deadline = start + hardBudget;

  const ownWins = tttWinningMoves(board, 'O');
  if (ownWins.length) return tttV955PickBestFrom(board, ownWins, 'O', deadline);

  const xWins = tttWinningMoves(board, 'X');
  if (xWins.length) return tttV956PickDefenseMove(board, xWins.map(idx => ({ idx, hits: 99, level: 7, types: ['win-block'] })), deadline);

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  // Four-in-row and direct five-window threats are forcing. Do not let scoring choose a nearby but wrong square.
  const xFourDefense = tttV956ThreatDefenseMoves(board, 'X', 5);
  if (xFourDefense.length) {
    const block = tttV956PickDefenseMove(board, xFourDefense, deadline);
    if (block >= 0) return block;
  }

  // The bug from v955: contiguous open three must be blocked on one of its two real ends,
  // not one square further away. This is a hard tactical guard before positional scoring.
  const xOpenThreeEntries = tttV956OpenThreeDefenseMoves(board, 'X').map(idx => ({ idx, hits: 1, level: 3, types: ['open-three-end'] }));
  if (xOpenThreeEntries.length) {
    const block = tttV956PickDefenseMove(board, xOpenThreeEntries, deadline);
    if (block >= 0) return block;
  }

  const ownForcing = tttV955ThreatMoves(board, 'O', 5);
  if (ownForcing.length) {
    const move = tttV955PickBestFrom(board, ownForcing.map(x => x.idx), 'O', deadline);
    if (move >= 0 && !tttV956MoveLeavesMajorHumanThreat(board, move)) return move;
  }

  const xBrokenOrWindowThree = tttV956ThreatDefenseMoves(board, 'X', 2);
  if (xBrokenOrWindowThree.length && occupied >= 7) {
    const block = tttV956PickDefenseMove(board, xBrokenOrWindowThree.slice(0, 16), deadline);
    if (block >= 0) {
      board[block] = 'O';
      const stillBad = tttWinningMoves(board, 'X').length + tttV956ThreatDefenseMoves(board, 'X', 5).length;
      board[block] = '';
      if (!stillBad) return block;
    }
  }

  const previous = tttV955BestMove(board, difficulty || 'ai');
  if (Number.isFinite(Number(previous)) && previous >= 0 && previous < board.length && !board[previous] && !tttV956MoveLeavesMajorHumanThreat(board, previous)) return previous;

  const safeCandidates = tttV955CandidateSet(board, deadline).slice(0, occupied < 18 ? 30 : 22);
  let best = -1;
  let bestScore = -Infinity;
  for (const idx of safeCandidates) {
    if (deadline && tttEngineNow() > deadline - 8 && best >= 0) break;
    if (tttV956MoveLeavesMajorHumanThreat(board, idx)) continue;
    const score = tttV955MoveScore(board, idx, deadline);
    if (score > bestScore) {
      bestScore = score;
      best = idx;
    }
  }
  if (best >= 0) return best;
  const emergencyBlock = tttV956PickDefenseMove(board, tttV956ThreatDefenseMoves(board, 'X', 1).slice(0, 20), deadline);
  if (emergencyBlock >= 0) return emergencyBlock;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV956Health() {
  return {
    ok: true,
    version: String(window.APP_VERSION || 'v.1.5 (963)'),
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    openThreeEndpointGuard: true,
    wrongAdjacentBlockGuard: true,
    freezeGuard: true,
    onlinePvPUnchanged: true,
    note: 'v956 přidává přímou detekci endpointů otevřených trojek a brání je před pozičním skórováním, aby AI neblokovala o pole vedle.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV956Health = getRakGomokuAiV956Health;
  window.getRakGomokuAiV955Health = getRakGomokuAiV956Health;
}


function getRakGomokuAiV957Health() {
  return {
    ok: true,
    version: String(window.APP_VERSION || 'v.1.5 (963)'),
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    diagonalGainPrevention: true,
    openThreeEndpointGuard: true,
    humanNextThreatGainGuard: true,
    freezeGuard: true,
    onlinePvPUnchanged: true,
    note: 'v957 blokuje nejen hotovou otevřenou trojku, ale i lidský gain tah, který by příštím tahem vytvořil čtyřku/fork/diagonální forcing.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV957Health = getRakGomokuAiV957Health;
  window.getRakGomokuAiV956Health = getRakGomokuAiV957Health;
  window.getRakGomokuAiV955Health = getRakGomokuAiV957Health;
}



// v.1.5 (963) – Piškvorky AI: tvrdší diagonální threat engine pro 10×19 bez zaseknutí.
function tttV958Dirs() {
  return [[0,1],[1,0],[1,1],[1,-1]];
}

function tttV958SafeIndex(row, col) {
  return tttInBounds(row, col) ? tttIndex(row, col) : -1;
}

function tttV958OccupiedCount(board) {
  let count = 0;
  for (let i = 0; i < board.length; i += 1) if (board[i]) count += 1;
  return count;
}

function tttV958CenterScore(idx) {
  const row = Math.floor(idx / TTT_COLS);
  const col = idx % TTT_COLS;
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  return 1000 - (Math.abs(row - centerRow) * 46 + Math.abs(col - centerCol) * 64);
}

function tttV958CandidateSet(board, radius) {
  const occupied = [];
  for (let i = 0; i < board.length; i += 1) if (board[i]) occupied.push(i);
  if (!occupied.length) {
    const preferred = [tttIndex(9, 4), tttIndex(9, 5), tttIndex(10, 4), tttIndex(8, 4)];
    return preferred.filter(idx => idx >= 0 && idx < board.length && !board[idx]);
  }
  const out = new Set();
  const rMax = Number(radius || 2) || 2;
  for (const idx of occupied) {
    const row = Math.floor(idx / TTT_COLS);
    const col = idx % TTT_COLS;
    for (let dr = -rMax; dr <= rMax; dr += 1) {
      for (let dc = -rMax; dc <= rMax; dc += 1) {
        const nr = row + dr;
        const nc = col + dc;
        if (!tttInBounds(nr, nc)) continue;
        const next = tttIndex(nr, nc);
        if (!board[next]) out.add(next);
      }
    }
  }
  return Array.from(out);
}

function tttV958WinningMovesFast(board, mark) {
  const opponent = mark === 'X' ? 'O' : 'X';
  const moves = new Set();
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const dir of tttV958Dirs()) {
        const dr = dir[0], dc = dir[1];
        let own = 0;
        let empty = -1;
        let ok = true;
        for (let step = 0; step < TTT_WIN_LENGTH; step += 1) {
          const idx = tttV958SafeIndex(row + dr * step, col + dc * step);
          if (idx < 0) { ok = false; break; }
          const cell = board[idx];
          if (cell === opponent) { ok = false; break; }
          if (cell === mark) own += 1;
          else if (!cell) {
            if (empty >= 0) { ok = false; break; }
            empty = idx;
          }
        }
        if (ok && own === TTT_WIN_LENGTH - 1 && empty >= 0) moves.add(empty);
      }
    }
  }
  return Array.from(moves);
}

function tttV958WindowThreatEntries(board, mark) {
  const opponent = mark === 'X' ? 'O' : 'X';
  const entries = [];
  const seen = new Map();
  const add = (idx, level, type, dir, hits) => {
    if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) return;
    const prev = seen.get(idx) || { idx, level: 0, hits: 0, types: [], diagonal: false };
    prev.level = Math.max(prev.level, level);
    prev.hits += hits || 1;
    if (prev.types.indexOf(type) < 0) prev.types.push(type);
    if (dir && Math.abs(dir[0]) === 1 && Math.abs(dir[1]) === 1) prev.diagonal = true;
    seen.set(idx, prev);
  };

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const dir of tttV958Dirs()) {
        const dr = dir[0], dc = dir[1];
        for (const size of [5, 6]) {
          const cells = [];
          let ok = true;
          for (let step = 0; step < size; step += 1) {
            const idx = tttV958SafeIndex(row + dr * step, col + dc * step);
            if (idx < 0) { ok = false; break; }
            cells.push(idx);
          }
          if (!ok) continue;
          let own = 0, opp = 0;
          const empties = [];
          let pattern = '';
          for (const idx of cells) {
            if (board[idx] === mark) { own += 1; pattern += 'M'; }
            else if (board[idx] === opponent) { opp += 1; pattern += 'B'; }
            else { empties.push(idx); pattern += '.'; }
          }
          if (opp > 0 || own < 2 || !empties.length) continue;

          // Four in a five-window: the empty square is an immediate win next turn.
          if (size === 5 && own === 4 && empties.length === 1) add(empties[0], 7, 'simple-four', dir, 6);

          // Exact contiguous open three: .MMM. – block only real endpoints, never one square farther.
          if (pattern.indexOf('.MMM.') >= 0) {
            const start = pattern.indexOf('.MMM.');
            add(cells[start], 5, 'open-three-end', dir, 4);
            add(cells[start + 4], 5, 'open-three-end', dir, 4);
          }

          // Broken/split three windows. These are especially dangerous diagonally on 10×19.
          const broken = ['.MM.M.', '.M.MM.', 'MM.M.', '.M.MM', 'M.MM.', '.MM.M', 'M.M.M', 'MM..M', 'M..MM'];
          if (own === 3 && empties.length >= 2) {
            for (const pat of broken) {
              if (pattern.indexOf(pat) >= 0) {
                empties.forEach(idx => add(idx, 4, 'broken-three', dir, 2));
                break;
              }
            }
          }

          // Clean three in a five/six window, lower than exact .MMM. but still worth blocking early.
          if (own === 3 && empties.length >= 2) {
            empties.forEach(idx => add(idx, 3, 'window-three', dir, 1));
          }
        }
      }
    }
  }

  seen.forEach(item => entries.push(item));
  return entries.sort((a, b) => (b.level - a.level) || (b.hits - a.hits) || ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0)) || (b.idx - a.idx));
}

function tttV958ThreatGainEntries(board, mark, deadline) {
  const occupied = tttV958OccupiedCount(board);
  const pool = new Set(tttV958CandidateSet(board, occupied < 12 ? 3 : 2));
  tttV958WindowThreatEntries(board, mark).forEach(e => pool.add(e.idx));
  const out = [];
  for (const idxRaw of pool) {
    if (deadline && tttEngineNow() > deadline - 12 && out.length) break;
    const idx = Number(idxRaw);
    if (!Number.isFinite(idx) || idx < 0 || idx >= board.length || board[idx]) continue;
    board[idx] = mark;
    const winNow = tttWinner(board).winner === mark ? 1 : 0;
    const wins = tttV958WinningMovesFast(board, mark).length;
    const windowThreats = tttV958WindowThreatEntries(board, mark);
    const severe = windowThreats.filter(e => e.level >= 5).length;
    const open = windowThreats.filter(e => e.types && e.types.indexOf('open-three-end') >= 0).length;
    const diagonal = windowThreats.some(e => e.diagonal && e.level >= 4) ? 1 : 0;
    board[idx] = '';
    let level = 0;
    if (winNow) level = 10;
    else if (wins >= 2) level = 9;
    else if (wins === 1) level = 7;
    else if (severe >= 2) level = 6;
    else if (severe === 1) level = 5;
    else if (open >= 2 || diagonal) level = 4;
    else if (open >= 1) level = 3;
    if (level < 3) continue;
    out.push({
      idx,
      level,
      hits: wins * 5 + severe * 3 + open + diagonal,
      diagonal: !!diagonal,
      types: ['gain'],
      score: level * 100000000 + wins * 20000000 + severe * 4000000 + open * 800000 + diagonal * 500000 + tttV958CenterScore(idx)
    });
  }
  return out.sort((a, b) => (b.level - a.level) || (b.hits - a.hits) || (b.score - a.score) || (a.idx - b.idx));
}

function tttV958StaticScore(board) {
  const winner = tttWinner(board).winner;
  if (winner === 'O') return 1000000000;
  if (winner === 'X') return -1000000000;
  const oThreats = tttV958WindowThreatEntries(board, 'O');
  const xThreats = tttV958WindowThreatEntries(board, 'X');
  const oGain = tttV958ThreatGainEntries(board, 'O').slice(0, 10);
  const xGain = tttV958ThreatGainEntries(board, 'X').slice(0, 10);
  let score = 0;
  for (const e of oThreats) score += Math.pow(8, e.level) * (e.hits || 1) * (e.diagonal ? 1.08 : 1);
  for (const e of xThreats) score -= Math.pow(8, e.level) * (e.hits || 1) * (e.diagonal ? 1.18 : 1) * 1.22;
  for (const e of oGain) score += Math.pow(9, e.level) * 0.65;
  for (const e of xGain) score -= Math.pow(9, e.level) * 1.05;
  score += (tttV955LineWindowScore(board, 'O') - tttV955LineWindowScore(board, 'X') * 1.18) * 0.04;
  return score;
}

function tttV958MoveRiskAfterO(board, deadline) {
  if (tttV958WinningMovesFast(board, 'X').length) return 10000000000;
  const xGain = tttV958ThreatGainEntries(board, 'X', deadline);
  const xWindow = tttV958WindowThreatEntries(board, 'X');
  let risk = 0;
  for (const e of xGain.slice(0, 12)) risk += Math.pow(11, e.level) * (e.hits || 1) * (e.diagonal ? 1.45 : 1);
  for (const e of xWindow.slice(0, 16)) risk += Math.pow(8, e.level) * (e.hits || 1) * (e.diagonal ? 1.55 : 1);
  return risk;
}

function tttV958PickSimpleBlock(board, entries) {
  const filtered = (entries || []).filter(e => e && Number.isFinite(Number(e.idx)) && e.idx >= 0 && e.idx < board.length && !board[e.idx]);
  if (!filtered.length) return -1;
  let best = -1;
  let bestScore = -Infinity;
  for (const e of filtered.slice(0, 12)) {
    const idx = Number(e.idx);
    board[idx] = 'O';
    const xWins = tttV958WinningMovesFast(board, 'X').length;
    const ownWins = tttV958WinningMovesFast(board, 'O').length;
    const score = -xWins * 1000000000
      + ownWins * 700000000
      + Number(e.level || 0) * 1000000
      + Number(e.hits || 0) * 120000
      + tttCheapMovePotential(board, idx, 'X') * 850
      + tttCheapMovePotential(board, idx, 'O') * 500
      + tttV958CenterScore(idx) * 300;
    board[idx] = '';
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}

function tttV958PickBlockFast(board, entries) {
  const filtered = (entries || []).filter(e => e && Number.isFinite(Number(e.idx)) && e.idx >= 0 && e.idx < board.length && !board[e.idx]);
  if (!filtered.length) return -1;
  let best = -1;
  let bestScore = -Infinity;
  for (const e of filtered.slice(0, 18)) {
    const idx = Number(e.idx);
    board[idx] = 'O';
    const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
    const xWins = tttV958WinningMovesFast(board, 'X').length;
    const xCritical = tttV958WindowThreatEntries(board, 'X').filter(t => t.level >= 5).length;
    const score = ownWin * 10000000000
      - xWins * 1000000000
      - xCritical * 60000000
      + Number(e.level || 0) * 18000000
      + Number(e.hits || 0) * 2500000
      + (e.diagonal ? 2000000 : 0)
      + tttCheapMovePotential(board, idx, 'X') * 600
      + tttCheapMovePotential(board, idx, 'O') * 350
      + tttV958CenterScore(idx) * 400;
    board[idx] = '';
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}

function tttV958PickBlock(board, entries, deadline) {
  const filtered = (entries || []).filter(e => e && Number.isFinite(Number(e.idx)) && e.idx >= 0 && e.idx < board.length && !board[e.idx]);
  if (!filtered.length) return -1;
  let best = -1;
  let bestScore = -Infinity;
  for (const e of filtered.slice(0, 24)) {
    if (deadline && tttEngineNow() > deadline - 10 && best >= 0) break;
    const idx = Number(e.idx);
    board[idx] = 'O';
    const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
    const risk = tttV958MoveRiskAfterO(board, deadline);
    const ownGain = tttV958ThreatGainEntries(board, 'O', deadline)[0];
    const score = -risk
      + ownWin * 10000000000
      + Number(e.level || 0) * 250000000
      + Number(e.hits || 0) * 22000000
      + (e.diagonal ? 18000000 : 0)
      + (ownGain ? ownGain.score * 0.4 : 0)
      + tttV958StaticScore(board) * 0.12
      + tttV958CenterScore(idx) * 800;
    board[idx] = '';
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}

function tttV958TopHumanReplies(board, deadline) {
  const occupied = tttV958OccupiedCount(board);
  const pool = new Set(tttV958CandidateSet(board, occupied < 16 ? 3 : 2));
  tttWinningMoves(board, 'X').forEach(idx => pool.add(idx));
  tttV958ThreatGainEntries(board, 'X', deadline).forEach(e => pool.add(e.idx));
  tttV958WindowThreatEntries(board, 'X').forEach(e => pool.add(e.idx));
  const scored = [];
  for (const idxRaw of pool) {
    const idx = Number(idxRaw);
    if (!Number.isFinite(idx) || idx < 0 || idx >= board.length || board[idx]) continue;
    board[idx] = 'X';
    const score = (tttWinner(board).winner === 'X' ? 10000000000 : 0)
      + tttV958MoveRiskAfterO(board, deadline)
      - tttV958StaticScore(board) * 0.25
      + tttCheapMovePotential(board, idx, 'X') * 800
      + tttV958CenterScore(idx);
    board[idx] = '';
    scored.push({ idx, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 10).map(x => x.idx);
}

function tttV958MoveScore(board, idx, deadline) {
  if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) return -Infinity;
  board[idx] = 'O';
  if (tttWinner(board).winner === 'O') { board[idx] = ''; return 10000000000; }
  const immediateRisk = tttV958MoveRiskAfterO(board, deadline);
  let worstReplyScore = Infinity;
  const replies = tttV958TopHumanReplies(board, deadline);
  if (!replies.length) worstReplyScore = tttV958StaticScore(board);
  for (const reply of replies) {
    if (deadline && tttEngineNow() > deadline - 8 && Number.isFinite(worstReplyScore)) break;
    if (board[reply]) continue;
    board[reply] = 'X';
    const s = tttWinner(board).winner === 'X' ? -10000000000 : tttV958StaticScore(board);
    board[reply] = '';
    if (s < worstReplyScore) worstReplyScore = s;
  }
  const ownGain = tttV958ThreatGainEntries(board, 'O', deadline)[0];
  const score = -immediateRisk * 1.35
    + worstReplyScore * 0.82
    + (ownGain ? ownGain.score * 0.55 : 0)
    + tttV958StaticScore(board) * 0.35
    + tttCheapMovePotential(board, idx, 'O') * 950
    + tttCheapMovePotential(board, idx, 'X') * 1200
    + tttV958CenterScore(idx) * 900;
  board[idx] = '';
  return score;
}

function tttV958BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const hardBudget = Math.min(tttEngineBudgetMs(difficulty || 'ai'), difficulty === 'ai' ? 340 : 115);
  const deadline = tttEngineNow() + hardBudget;

  const ownWins = tttWinningMoves(board, 'O');
  if (ownWins.length) return tttV955PickBestFrom(board, ownWins, 'O', deadline);

  const xWins = tttWinningMoves(board, 'X');
  if (xWins.length) {
    const block = tttV958PickBlockFast(board, xWins.map(idx => ({ idx, level: 10, hits: 99, types: ['immediate-win-block'] })));
    if (block >= 0) return block;
  }

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  const quickFourBlocks = tttV956ThreatDefenseMoves(board, 'X', 5);
  if (quickFourBlocks.length) {
    const block = tttV958PickSimpleBlock(board, quickFourBlocks);
    if (block >= 0) return block;
  }

  const quickOpenThreeBlocks = tttV956OpenThreeDefenseMoves(board, 'X').map(idx => ({ idx, level: 5, hits: 6, diagonal: false, types: ['quick-open-three'] }));
  if (quickOpenThreeBlocks.length) {
    const block = tttV958PickSimpleBlock(board, quickOpenThreeBlocks);
    if (block >= 0) return block;
  }

  const currentHumanThreats = tttV958WindowThreatEntries(board, 'X').filter(e => e.level >= 4 || e.diagonal);
  if (currentHumanThreats.length) {
    const block = tttV958PickBlockFast(board, currentHumanThreats);
    if (block >= 0) return block;
  }

  const ownKiller = tttV958ThreatGainEntries(board, 'O', deadline).filter(e => e.level >= 9);
  if (ownKiller.length) return ownKiller[0].idx;

  const humanGain = tttV958ThreatGainEntries(board, 'X', deadline).filter(e => e.level >= 5);
  if (humanGain.length) {
    const block = tttV958PickBlock(board, humanGain, deadline);
    if (block >= 0) return block;
  }

  const ownStrong = tttV958ThreatGainEntries(board, 'O', deadline).filter(e => e.level >= 6);
  if (ownStrong.length) {
    const move = ownStrong[0].idx;
    board[move] = 'O';
    const risk = tttV958MoveRiskAfterO(board, deadline);
    board[move] = '';
    if (risk < 250000000) return move;
  }

  const pool = new Set(tttV958CandidateSet(board, occupied < 16 ? 3 : 2));
  tttV958ThreatGainEntries(board, 'O', deadline).forEach(e => pool.add(e.idx));
  tttV958ThreatGainEntries(board, 'X', deadline).forEach(e => pool.add(e.idx));
  tttV958WindowThreatEntries(board, 'X').forEach(e => pool.add(e.idx));
  let candidates = Array.from(pool).filter(idx => Number.isFinite(Number(idx)) && idx >= 0 && idx < board.length && !board[idx]);
  const maxRoot = occupied < 20 ? 26 : 18;
  candidates = candidates
    .map(idx => ({ idx, quick: tttCheapMovePotential(board, idx, 'O') * 1.4 + tttCheapMovePotential(board, idx, 'X') * 1.9 + tttV958CenterScore(idx) }))
    .sort((a, b) => b.quick - a.quick)
    .slice(0, Math.max(maxRoot, 14))
    .map(item => item.idx);

  let best = -1;
  let bestScore = -Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 10 && best >= 0) break;
    const score = tttV958MoveScore(board, idx, deadline);
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  if (best >= 0) return best;
  const emergency = tttV958PickBlock(board, tttV958WindowThreatEntries(board, 'X').concat(tttV958ThreatGainEntries(board, 'X', deadline)), deadline);
  if (emergency >= 0) return emergency;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV958Health() {
  return {
    ok: true,
    version: String(window.APP_VERSION || 'v.1.5 (963)'),
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    diagonalThreatGuard: true,
    exactOpenThreeEndpointGuard: true,
    humanGainPrevention: true,
    boundedDeadlineMs: true,
    onlinePvPUnchanged: true,
    note: 'v958 přidává samostatnou diagonální threat pipeline: nečeká na hotovou čtyřku, blokuje gain tahy a exact endpointy otevřených trojek před pozičním skórováním.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV958Health = getRakGomokuAiV958Health;
  window.getRakGomokuAiV957Health = getRakGomokuAiV958Health;
  window.getRakGomokuAiV956Health = getRakGomokuAiV958Health;
}



// v.1.5 (963) – Piškvorky AI: tvrdší line-window obrana, hlavně proti diagonálním build-upům.
function tttV959Directions() {
  return [[0, 1], [1, 0], [1, 1], [1, -1]];
}

function tttV959CellRow(idx) { return Math.floor(Number(idx) / TTT_COLS); }
function tttV959CellCol(idx) { return Number(idx) % TTT_COLS; }

function tttV959CenterScore(idx) {
  const row = tttV959CellRow(idx);
  const col = tttV959CellCol(idx);
  const centerRow = (TTT_ROWS - 1) / 2;
  const centerCol = (TTT_COLS - 1) / 2;
  return 1200 - (Math.abs(row - centerRow) * 48 + Math.abs(col - centerCol) * 68);
}

function tttV959CountOccupied(board) {
  let n = 0;
  for (let i = 0; i < board.length; i += 1) if (board[i]) n += 1;
  return n;
}

function tttV959CandidateSet(board, radius) {
  const occupied = [];
  for (let i = 0; i < board.length; i += 1) if (board[i]) occupied.push(i);
  if (!occupied.length) {
    return [tttIndex(9, 4), tttIndex(9, 5), tttIndex(10, 4), tttIndex(8, 4)].filter(idx => idx >= 0 && idx < board.length && !board[idx]);
  }
  const out = new Set();
  const rMax = Number(radius || 2) || 2;
  for (const idx of occupied) {
    const row = tttV959CellRow(idx);
    const col = tttV959CellCol(idx);
    for (let dr = -rMax; dr <= rMax; dr += 1) {
      for (let dc = -rMax; dc <= rMax; dc += 1) {
        const rr = row + dr;
        const cc = col + dc;
        if (!tttInBounds(rr, cc)) continue;
        const next = tttIndex(rr, cc);
        if (!board[next]) out.add(next);
      }
    }
  }
  return Array.from(out);
}

function tttV959WindowDefenseEntries(board, mark) {
  const opponent = mark === 'X' ? 'O' : 'X';
  const map = new Map();
  const add = (idx, level, hits, kind, diagonal, dir, centerBias) => {
    if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) return;
    const prev = map.get(idx) || { idx, level: 0, hits: 0, diagonal: false, kinds: [], dirs: [], centerBias: 0 };
    prev.level = Math.max(prev.level, level || 0);
    prev.hits += Number(hits || 1) || 1;
    prev.centerBias += Number(centerBias || 0) || 0;
    if (diagonal) prev.diagonal = true;
    if (kind && prev.kinds.indexOf(kind) < 0) prev.kinds.push(kind);
    if (dir) {
      const sig = String(dir[0]) + ',' + String(dir[1]);
      if (prev.dirs.indexOf(sig) < 0) prev.dirs.push(sig);
    }
    map.set(idx, prev);
  };

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const dir of tttV959Directions()) {
        const dr = dir[0];
        const dc = dir[1];
        for (const size of [5, 6, 7]) {
          const cells = [];
          let ok = true;
          for (let step = 0; step < size; step += 1) {
            const rr = row + dr * step;
            const cc = col + dc * step;
            if (!tttInBounds(rr, cc)) { ok = false; break; }
            cells.push(tttIndex(rr, cc));
          }
          if (!ok) continue;
          let own = 0;
          let opp = 0;
          const empties = [];
          let pattern = '';
          for (const idx of cells) {
            const cell = board[idx];
            if (cell === mark) { own += 1; pattern += 'M'; }
            else if (cell === opponent) { opp += 1; pattern += 'B'; }
            else { empties.push(idx); pattern += '.'; }
          }
          if (opp || own < 2 || !empties.length) continue;
          const diagonal = Math.abs(dr) === 1 && Math.abs(dc) === 1;
          const lineCenter = (cells.length - 1) / 2;
          const addAll = (level, hits, kind) => {
            empties.forEach(emptyIdx => {
              const pos = cells.indexOf(emptyIdx);
              add(emptyIdx, level, hits, kind, diagonal, dir, Math.max(0, 5 - Math.abs(pos - lineCenter)));
            });
          };

          // 4 in 5 is a direct next-move win. It must be blocked before any scoring.
          if (size === 5 && own === 4 && empties.length === 1) {
            add(empties[0], 10, 40, 'four-in-five', diagonal, dir, 10);
            continue;
          }

          // Exact .MMM. endpoint threat. Only the real endpoints are tactical blocks.
          let pos = pattern.indexOf('.MMM.');
          while (pos >= 0) {
            add(cells[pos], 8, 22, 'open-three-end', diagonal, dir, 8);
            add(cells[pos + 4], 8, 22, 'open-three-end', diagonal, dir, 8);
            pos = pattern.indexOf('.MMM.', pos + 1);
          }

          // Split/broken threes create the same practical issue Martin saw: AI blocks near it, but not on the needed square.
          const brokenPatterns = ['.MM.M.', '.M.MM.', 'MM.M.', '.M.MM', 'M.MM.', '.MM.M', 'M.M.M', 'MM..M', 'M..MM', '.M.M.', 'M.M.'];
          if (own >= 3 && empties.length >= 2) {
            let broken = false;
            for (const pat of brokenPatterns) {
              if (pattern.indexOf(pat) >= 0) { broken = true; break; }
            }
            if (broken) addAll(diagonal ? 7 : 6, diagonal ? 16 : 12, diagonal ? 'diagonal-broken-three' : 'broken-three');
          }

          // Any 3 in an unblocked 5-window is dangerous. Diagonal ones are deliberately treated higher.
          if (size === 5 && own === 3 && empties.length === 2) {
            addAll(diagonal ? 7 : 5, diagonal ? 14 : 9, diagonal ? 'diagonal-three-window' : 'three-window');
          }

          // Diagonal build-up: on 10×19 it is easy to miss long diagonals early, so block 2+ stones in clean diagonal windows sooner.
          if (diagonal && own === 2 && empties.length >= 3) {
            addAll(3, 3, 'diagonal-two-window');
          }
          if (diagonal && own >= 3 && size >= 6) {
            addAll(6, 10, 'diagonal-long-threat');
          }
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    (b.level - a.level) ||
    (b.hits - a.hits) ||
    ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0)) ||
    (b.centerBias - a.centerBias) ||
    (tttV959CenterScore(b.idx) - tttV959CenterScore(a.idx)) ||
    (a.idx - b.idx)
  );
}

function tttV959HumanThreatScore(board, deadline) {
  if (tttWinningMoves(board, 'X').length) return 1e14;
  const threats = tttV959WindowDefenseEntries(board, 'X');
  let score = 0;
  for (const t of threats.slice(0, 28)) {
    score += Math.pow(12, Number(t.level || 0)) * (Number(t.hits || 1) || 1) * (t.diagonal ? 1.7 : 1);
  }
  // Also evaluate the best human gain move: if X can make a strong diagonal next, this move is unsafe.
  const occupied = tttV959CountOccupied(board);
  const pool = new Set(tttV959CandidateSet(board, occupied < 18 ? 3 : 2));
  threats.slice(0, 24).forEach(t => pool.add(t.idx));
  let checked = 0;
  for (const idx of pool) {
    if (deadline && tttEngineNow() > deadline - 6 && checked > 8) break;
    if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) continue;
    board[idx] = 'X';
    const wins = tttWinningMoves(board, 'X').length;
    const nextThreats = tttV959WindowDefenseEntries(board, 'X');
    board[idx] = '';
    if (wins >= 2) score += 8e12;
    else if (wins === 1) score += 2.8e12;
    if (nextThreats.length) {
      const top = nextThreats[0];
      if (top.level >= 8) score += 1.6e12;
      else if (top.level >= 6) score += 2.8e11 * (top.diagonal ? 1.65 : 1);
    }
    checked += 1;
  }
  return score;
}

function tttV959PickDefense(board, entries, deadline) {
  const filtered = (entries || []).filter(e => e && Number.isFinite(Number(e.idx)) && e.idx >= 0 && e.idx < board.length && !board[e.idx]);
  if (!filtered.length) return -1;
  let best = -1;
  let bestScore = -Infinity;
  for (const e of filtered.slice(0, 32)) {
    if (deadline && tttEngineNow() > deadline - 8 && best >= 0) break;
    const idx = Number(e.idx);
    board[idx] = 'O';
    const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
    const risk = tttV959HumanThreatScore(board, deadline);
    const ownThreat = tttV959WindowDefenseEntries(board, 'O')[0];
    const score = ownWin * 1e15
      - risk * 2.2
      + Number(e.level || 0) * 7e10
      + Number(e.hits || 0) * 3e9
      + (e.diagonal ? 2.4e10 : 0)
      + (ownThreat ? Number(ownThreat.level || 0) * 6e8 + Number(ownThreat.hits || 0) * 1e8 : 0)
      + tttCheapMovePotential(board, idx, 'X') * 2600
      + tttCheapMovePotential(board, idx, 'O') * 1600
      + tttV959CenterScore(idx) * 900;
    board[idx] = '';
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}

function tttV959MoveScore(board, idx, deadline) {
  if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) return -Infinity;
  board[idx] = 'O';
  if (tttWinner(board).winner === 'O') { board[idx] = ''; return 1e15; }
  const risk = tttV959HumanThreatScore(board, deadline);
  const ownThreats = tttV959WindowDefenseEntries(board, 'O');
  const ownTop = ownThreats[0];
  let score = -risk * 2.8
    + (ownTop ? Number(ownTop.level || 0) * 4.8e10 + Number(ownTop.hits || 0) * 1.2e9 + (ownTop.diagonal ? 6e8 : 0) : 0)
    + tttCheapMovePotential(board, idx, 'O') * 2400
    + tttCheapMovePotential(board, idx, 'X') * 3200
    + tttV959CenterScore(idx) * 1300;
  const replies = tttV959WindowDefenseEntries(board, 'X').slice(0, 8).map(e => e.idx);
  for (const reply of replies) {
    if (deadline && tttEngineNow() > deadline - 6) break;
    if (!Number.isFinite(Number(reply)) || board[reply]) continue;
    board[reply] = 'X';
    score -= tttV959HumanThreatScore(board, deadline) * 0.32;
    board[reply] = '';
  }
  board[idx] = '';
  return score;
}

function tttV959BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const budget = Math.min(tttEngineBudgetMs(difficulty || 'ai'), difficulty === 'ai' ? 420 : 135);
  const deadline = tttEngineNow() + budget;

  const ownWins = tttWinningMoves(board, 'O');
  if (ownWins.length) return tttV955PickBestFrom(board, ownWins, 'O', deadline);

  const xWins = tttWinningMoves(board, 'X');
  if (xWins.length) {
    const block = tttV959PickDefense(board, xWins.map(idx => ({ idx, level: 12, hits: 99, diagonal: false, kinds: ['immediate-win-block'] })), deadline);
    if (block >= 0) return block;
  }

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  // Defensive priority is intentionally earlier than speculative attack. This addresses wins around move 11–25.
  const xDirect = tttV959WindowDefenseEntries(board, 'X');
  const mustBlock = xDirect.filter(e => e.level >= 6 || (e.diagonal && e.level >= 3));
  if (mustBlock.length) {
    const block = tttV959PickDefense(board, mustBlock, deadline);
    if (block >= 0) return block;
  }

  // If X has a move that creates a forced win/fork next turn, occupy that gain square now if possible.
  const occupiedAfterDirect = tttV959CountOccupied(board);
  const gainPool = new Set(tttV959CandidateSet(board, occupiedAfterDirect < 18 ? 3 : 2));
  xDirect.slice(0, 18).forEach(e => gainPool.add(e.idx));
  const gainEntries = [];
  for (const idx of gainPool) {
    if (deadline && tttEngineNow() > deadline - 12 && gainEntries.length) break;
    if (!Number.isFinite(Number(idx)) || idx < 0 || idx >= board.length || board[idx]) continue;
    board[idx] = 'X';
    const wins = tttWinningMoves(board, 'X').length;
    const threats = tttV959WindowDefenseEntries(board, 'X');
    const top = threats[0] || null;
    board[idx] = '';
    const level = wins >= 2 ? 11 : wins === 1 ? 9 : top ? Number(top.level || 0) : 0;
    const diagonal = !!(top && top.diagonal);
    if (level >= 6 || (diagonal && level >= 4)) {
      gainEntries.push({ idx, level, hits: wins * 20 + (top ? Number(top.hits || 0) : 0), diagonal, kinds: ['human-gain'] });
    }
  }
  gainEntries.sort((a, b) => (b.level - a.level) || (b.hits - a.hits) || ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0)) || (a.idx - b.idx));
  if (gainEntries.length) {
    const block = tttV959PickDefense(board, gainEntries, deadline);
    if (block >= 0) return block;
  }

  const ownThreat = tttV959WindowDefenseEntries(board, 'O');
  const ownStrong = ownThreat.filter(e => e.level >= 8);
  if (ownStrong.length) {
    const attack = tttV959PickDefense(board, ownStrong, deadline);
    if (attack >= 0) {
      board[attack] = 'O';
      const risk = tttV959HumanThreatScore(board, deadline);
      board[attack] = '';
      if (risk < 4.5e11) return attack;
    }
  }

  const pool = new Set(tttV959CandidateSet(board, occupied < 18 ? 3 : 2));
  xDirect.slice(0, 24).forEach(e => pool.add(e.idx));
  ownThreat.slice(0, 18).forEach(e => pool.add(e.idx));
  let candidates = Array.from(pool).filter(idx => Number.isFinite(Number(idx)) && idx >= 0 && idx < board.length && !board[idx]);
  candidates = candidates
    .map(idx => ({ idx, score: tttCheapMovePotential(board, idx, 'O') * 1.1 + tttCheapMovePotential(board, idx, 'X') * 2.8 + tttV959CenterScore(idx) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 18 ? 30 : 22)
    .map(item => item.idx);

  let best = -1;
  let bestScore = -Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 10 && best >= 0) break;
    const score = tttV959MoveScore(board, idx, deadline);
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  if (best >= 0) return best;

  const emergency = tttV959PickDefense(board, tttV959WindowDefenseEntries(board, 'X'), deadline);
  if (emergency >= 0) return emergency;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV959Health() {
  return {
    ok: true,
    version: String(window.APP_VERSION || 'v.1.5 (963)'),
    rulesetVersion: GOMOKU_RULESET_VERSION,
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    lineWindowDefense: true,
    diagonalBuildUpGuard: true,
    humanGainPrevention: true,
    hardFallback: true,
    onlinePvPUnchanged: true,
    note: 'v959 přidává tvrdší line-window obranu a blokuje diagonální build-up dřív, než z něj vznikne čtyřka nebo výhra.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV959Health = getRakGomokuAiV959Health;
  window.getRakGomokuAiV958Health = getRakGomokuAiV959Health;
}

function tttBestMove(board, difficulty) {
  const v959 = typeof tttV959BestMove === 'function' ? tttV959BestMove(board, difficulty || 'ai') : -1;
  if (Number.isFinite(Number(v959)) && v959 >= 0 && v959 < board.length && !board[v959]) return v959;
  const safe = typeof tttV958BestMove === 'function' ? tttV958BestMove(board, difficulty || 'ai') : -1;
  if (Number.isFinite(Number(safe)) && safe >= 0 && safe < board.length && !board[safe]) return safe;
  const prev = tttV956BestMove(board, difficulty || 'ai');
  if (Number.isFinite(Number(prev)) && prev >= 0 && prev < board.length && !board[prev]) return prev;
  const win = tttWinningMove(board, 'O');
  if (win >= 0) return win;
  const block = tttWinningMove(board, 'X');
  if (block >= 0) return block;
  return tttNearestCenterFallbackMove(board);
}


// v.1.5 (963) – Piškvorky AI: deterministic tactical engine smoke-tested locally.
// Cíl: žádné zaseknutí a nepřehlédnout diagonální/open-three/four hrozby.
function tttV960Dirs() {
  return [[0, 1], [1, 0], [1, 1], [1, -1]];
}
function tttV960Row(idx) { return Math.floor(Number(idx) / TTT_COLS); }
function tttV960Col(idx) { return Number(idx) % TTT_COLS; }
function tttV960CenterScore(idx) {
  const r = tttV960Row(idx);
  const c = tttV960Col(idx);
  const cr = (TTT_ROWS - 1) / 2;
  const cc = (TTT_COLS - 1) / 2;
  return 10000 - (Math.abs(r - cr) * 360 + Math.abs(c - cc) * 520);
}
function tttV960Occupied(board) {
  let n = 0;
  for (let i = 0; i < board.length; i += 1) if (board[i]) n += 1;
  return n;
}
function tttV960Legal(board, idx) {
  return Number.isFinite(Number(idx)) && idx >= 0 && idx < board.length && !board[idx];
}
function tttV960CandidateSet(board, radius) {
  const occupied = [];
  for (let i = 0; i < board.length; i += 1) if (board[i]) occupied.push(i);
  if (!occupied.length) return [tttIndex(9, 4), tttIndex(9, 5), tttIndex(8, 4), tttIndex(10, 5)].filter(idx => tttV960Legal(board, idx));
  const out = new Set();
  const rMax = Math.max(1, Number(radius || 2) || 2);
  for (const idx of occupied) {
    const row = tttV960Row(idx);
    const col = tttV960Col(idx);
    for (let dr = -rMax; dr <= rMax; dr += 1) {
      for (let dc = -rMax; dc <= rMax; dc += 1) {
        const rr = row + dr;
        const cc = col + dc;
        if (!tttInBounds(rr, cc)) continue;
        const next = tttIndex(rr, cc);
        if (!board[next]) out.add(next);
      }
    }
  }
  return Array.from(out);
}
function tttV960WinningMoves(board, mark) {
  const opponent = mark === 'X' ? 'O' : 'X';
  const moves = new Set();
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const dir of tttV960Dirs()) {
        const dr = dir[0];
        const dc = dir[1];
        let own = 0;
        let empty = -1;
        let ok = true;
        for (let step = 0; step < TTT_WIN_LENGTH; step += 1) {
          const rr = row + dr * step;
          const cc = col + dc * step;
          if (!tttInBounds(rr, cc)) { ok = false; break; }
          const idx = tttIndex(rr, cc);
          const cell = board[idx];
          if (cell === opponent) { ok = false; break; }
          if (cell === mark) own += 1;
          else if (!cell) {
            if (empty >= 0) { ok = false; break; }
            empty = idx;
          }
        }
        if (ok && own === TTT_WIN_LENGTH - 1 && empty >= 0) moves.add(empty);
      }
    }
  }
  return Array.from(moves).sort((a, b) => tttV960CenterScore(b) - tttV960CenterScore(a));
}
function tttV960AddEntry(map, board, idx, level, hits, kind, dir, endpointOnly) {
  if (!tttV960Legal(board, idx)) return;
  const diagonal = !!(dir && Math.abs(dir[0]) === 1 && Math.abs(dir[1]) === 1);
  const prev = map.get(idx) || { idx, level: 0, hits: 0, kinds: [], diagonal: false, endpoint: false };
  prev.level = Math.max(prev.level, Number(level || 0) || 0);
  prev.hits += Number(hits || 1) || 1;
  prev.diagonal = prev.diagonal || diagonal;
  prev.endpoint = prev.endpoint || !!endpointOnly;
  if (kind && prev.kinds.indexOf(kind) < 0) prev.kinds.push(kind);
  map.set(idx, prev);
}
function tttV960ThreatEntries(board, mark) {
  const opponent = mark === 'X' ? 'O' : 'X';
  const map = new Map();
  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const dir of tttV960Dirs()) {
        const dr = dir[0], dc = dir[1];
        for (const size of [5, 6, 7]) {
          const cells = [];
          let pattern = '';
          let own = 0;
          let opp = 0;
          const empties = [];
          let ok = true;
          for (let step = 0; step < size; step += 1) {
            const rr = row + dr * step;
            const cc = col + dc * step;
            if (!tttInBounds(rr, cc)) { ok = false; break; }
            const idx = tttIndex(rr, cc);
            cells.push(idx);
            const cell = board[idx];
            if (cell === mark) { own += 1; pattern += 'M'; }
            else if (cell === opponent) { opp += 1; pattern += 'B'; }
            else { empties.push(idx); pattern += '.'; }
          }
          if (!ok || opp || own < 2 || !empties.length) continue;
          const diagonal = Math.abs(dr) === 1 && Math.abs(dc) === 1;
          const addAll = (level, hits, kind) => empties.forEach(idx => tttV960AddEntry(map, board, idx, level + (diagonal ? 1 : 0), hits, kind, dir, false));
          if (size === 5 && own === 4 && empties.length === 1) {
            tttV960AddEntry(map, board, empties[0], 100, 120, 'four-in-five', dir, true);
            continue;
          }
          let pos = pattern.indexOf('.MMM.');
          while (pos >= 0) {
            tttV960AddEntry(map, board, cells[pos], diagonal ? 78 : 74, 52, 'open-three-end', dir, true);
            tttV960AddEntry(map, board, cells[pos + 4], diagonal ? 78 : 74, 52, 'open-three-end', dir, true);
            pos = pattern.indexOf('.MMM.', pos + 1);
          }
          const broken = ['.MM.M.', '.M.MM.', 'MM.M.', '.M.MM', 'M.MM.', '.MM.M', 'M.M.M', 'MM..M', 'M..MM', '.M.M.', 'M.M.'];
          if (own >= 3 && empties.length >= 2) {
            for (const pat of broken) {
              if (pattern.indexOf(pat) >= 0) {
                addAll(diagonal ? 70 : 62, diagonal ? 34 : 24, diagonal ? 'diagonal-broken-three' : 'broken-three');
                break;
              }
            }
          }
          if (size === 5 && own === 3 && empties.length === 2) addAll(diagonal ? 68 : 55, diagonal ? 28 : 18, diagonal ? 'diagonal-three-window' : 'three-window');
          if (diagonal && own === 2 && empties.length >= 3) addAll(30, 4, 'diagonal-two-window');
        }
      }
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    (b.level - a.level) || (b.hits - a.hits) || ((b.endpoint ? 1 : 0) - (a.endpoint ? 1 : 0)) || ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0)) || (tttV960CenterScore(b.idx) - tttV960CenterScore(a.idx)) || (a.idx - b.idx)
  );
}
function tttV960GainEntries(board, mark, deadline) {
  const occupied = tttV960Occupied(board);
  const pool = new Set(tttV960CandidateSet(board, occupied < 14 ? 3 : 2));
  tttV960ThreatEntries(board, mark).slice(0, 24).forEach(e => pool.add(e.idx));
  const out = [];
  for (const raw of pool) {
    if (deadline && tttEngineNow() > deadline - 14 && out.length) break;
    const idx = Number(raw);
    if (!tttV960Legal(board, idx)) continue;
    board[idx] = mark;
    const wins = tttV960WinningMoves(board, mark).length;
    const threats = tttV960ThreatEntries(board, mark);
    const top = threats[0] || null;
    board[idx] = '';
    const topLevel = top ? Number(top.level || 0) : 0;
    let level = 0;
    if (wins >= 2) level = 100;
    else if (wins === 1) level = 92;
    else if (topLevel >= 74) level = 78;
    else if (topLevel >= 65) level = 68;
    else if (topLevel >= 55) level = 48;
    if (level < 48) continue;
    out.push({ idx, level, hits: wins * 40 + (top ? Number(top.hits || 0) : 0), diagonal: !!(top && top.diagonal), kinds: ['gain'] });
  }
  return out.sort((a, b) => (b.level - a.level) || (b.hits - a.hits) || ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0)) || (a.idx - b.idx));
}
function tttV960HumanRisk(board, deadline) {
  if (tttV960WinningMoves(board, 'X').length) return 1e15;
  let risk = 0;
  for (const e of tttV960ThreatEntries(board, 'X').slice(0, 26)) risk += Math.pow(10, Math.min(9, e.level / 10)) * (e.hits || 1) * (e.diagonal ? 1.6 : 1);
  for (const g of tttV960GainEntries(board, 'X', deadline).slice(0, 16)) risk += Math.pow(10, Math.min(9, g.level / 10)) * (g.hits || 1) * (g.diagonal ? 1.8 : 1) * 1.2;
  return risk;
}
function tttV960PickBest(board, entries, mark, deadline) {
  const list = (entries || []).filter(e => e && tttV960Legal(board, e.idx));
  if (!list.length) return -1;
  let best = -1, bestScore = -Infinity;
  for (const e of list.slice(0, 36)) {
    if (deadline && tttEngineNow() > deadline - 10 && best >= 0) break;
    const idx = Number(e.idx);
    board[idx] = mark;
    const ownWin = tttWinner(board).winner === mark ? 1 : 0;
    const humanRisk = tttV960HumanRisk(board, deadline);
    const ownTop = tttV960ThreatEntries(board, mark)[0];
    const ownGain = tttV960GainEntries(board, mark, deadline)[0];
    board[idx] = '';
    const score = ownWin * 1e16
      - humanRisk * (mark === 'O' ? 3.4 : 1.0)
      + Number(e.level || 0) * 1e11
      + Number(e.hits || 0) * 4e9
      + (e.diagonal ? 6e10 : 0)
      + (e.endpoint ? 3e10 : 0)
      + (ownTop ? Number(ownTop.level || 0) * 8e8 + Number(ownTop.hits || 0) * 1e8 : 0)
      + (ownGain ? Number(ownGain.level || 0) * 7e8 : 0)
      + tttCheapMovePotential(board, idx, 'O') * 1800
      + tttCheapMovePotential(board, idx, 'X') * 3600
      + tttV960CenterScore(idx) * 1000;
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}
function tttV960MoveScore(board, idx, deadline) {
  board[idx] = 'O';
  if (tttWinner(board).winner === 'O') { board[idx] = ''; return 1e16; }
  const risk = tttV960HumanRisk(board, deadline);
  const ownThreats = tttV960ThreatEntries(board, 'O');
  const ownGain = tttV960GainEntries(board, 'O', deadline);
  const score = -risk * 4.0
    + (ownThreats[0] ? Number(ownThreats[0].level || 0) * 6e10 + Number(ownThreats[0].hits || 0) * 1.8e9 : 0)
    + (ownGain[0] ? Number(ownGain[0].level || 0) * 5e10 + Number(ownGain[0].hits || 0) * 1.1e9 : 0)
    + tttCheapMovePotential(board, idx, 'O') * 2600
    + tttCheapMovePotential(board, idx, 'X') * 4200
    + tttV960CenterScore(idx) * 1400;
  board[idx] = '';
  return score;
}
function tttV960BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const budget = Math.min(tttEngineBudgetMs(difficulty || 'ai'), difficulty === 'ai' ? 220 : 90);
  const deadline = tttEngineNow() + budget;
  const ownWins = tttV960WinningMoves(board, 'O');
  if (ownWins.length) return ownWins[0];
  const xWins = tttV960WinningMoves(board, 'X');
  if (xWins.length) return xWins[0];
  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }
  const currentX = tttV960ThreatEntries(board, 'X');
  const direct = currentX.filter(e => e.level >= 68 || (e.diagonal && e.level >= 30));
  if (direct.length) return direct[0].idx;
  const xGains = tttV960GainEntries(board, 'X', deadline).filter(e => e.level >= 68 || (e.diagonal && e.level >= 48));
  if (xGains.length) return xGains[0].idx;
  const ownGains = tttV960GainEntries(board, 'O', deadline).filter(e => e.level >= 78);
  if (ownGains.length) {
    const attack = tttV960PickBest(board, ownGains, 'O', deadline);
    if (attack >= 0) {
      board[attack] = 'O';
      const risk = tttV960HumanRisk(board, deadline);
      board[attack] = '';
      if (risk < 1e9) return attack;
    }
  }
  const pool = new Set(tttV960CandidateSet(board, occupied < 18 ? 3 : 2));
  currentX.slice(0, 24).forEach(e => pool.add(e.idx));
  tttV960ThreatEntries(board, 'O').slice(0, 18).forEach(e => pool.add(e.idx));
  tttV960GainEntries(board, 'X', deadline).slice(0, 18).forEach(e => pool.add(e.idx));
  let candidates = Array.from(pool).filter(idx => tttV960Legal(board, idx));
  candidates = candidates.map(idx => ({ idx, score: tttCheapMovePotential(board, idx, 'X') * 4.2 + tttCheapMovePotential(board, idx, 'O') * 1.7 + tttV960CenterScore(idx) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 18 ? 28 : 20)
    .map(x => x.idx);
  let best = -1, bestScore = -Infinity;
  for (const idx of candidates) {
    if (deadline && tttEngineNow() > deadline - 8 && best >= 0) break;
    const score = tttV960MoveScore(board, idx, deadline);
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  if (best >= 0) return best;
  const emergency = tttV960PickBest(board, currentX.concat(tttV960GainEntries(board, 'X', deadline)), 'O', deadline);
  if (emergency >= 0) return emergency;
  return tttNearestCenterFallbackMove(board);
}
function getRakGomokuAiV960Health() {
  return {
    ok: true,
    version: String(window.APP_VERSION || 'v.1.5 (963)'),
    rulesetVersion: GOMOKU_RULESET_VERSION,
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    localSmokeTested: true,
    testedCases: ['diagonal-open-three', 'diagonal-four-block', 'horizontal-open-three', 'ai-immediate-win'],
    deterministicFallback: true,
    onlinePvPUnchanged: true,
    note: 'v960 nahrazuje vrchní AI výběr jednodušší deterministickou threat pipeline, která v lokálním smoke testu blokuje diagonální i vodorovné základní hrozby a netrvá sekundy.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV960Health = getRakGomokuAiV960Health;
  window.getRakGomokuAiV959Health = getRakGomokuAiV960Health;
  window.getRakGomokuAiV958Health = getRakGomokuAiV960Health;
}



// v.1.5 (963) – Piškvorky AI: pomalejší, bezpečnější tactical verification nad v960.
const TTT_V961_SOFT_DEADLINE_MS = 1600;
const TTT_V961_HARD_DEADLINE_MS = 2200;

function tttV961Budget(difficulty) {
  const lowEnd = !!(typeof document !== 'undefined' && document.body && document.body.classList && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lowEndDevice') || document.body.classList.contains('lightweightMode')));
  if (difficulty !== 'ai') return { soft: 360, hard: 620 };
  return lowEnd ? { soft: 1200, hard: 1900 } : { soft: TTT_V961_SOFT_DEADLINE_MS, hard: TTT_V961_HARD_DEADLINE_MS };
}

function tttV961TimeUp(deadline, margin) {
  return !!(deadline && tttEngineNow() > deadline - (Number(margin || 0) || 0));
}

function tttV961Legal(board, idx) {
  return typeof tttV960Legal === 'function' ? tttV960Legal(board, idx) : (Number.isFinite(Number(idx)) && idx >= 0 && idx < board.length && !board[idx]);
}

function tttV961CenterScore(idx) {
  return typeof tttV960CenterScore === 'function' ? tttV960CenterScore(idx) : tttV954CenterScore(idx);
}

function tttV961AddThreatEntry(map, board, idx, level, hits, kind, dir, flags) {
  const n = Number(idx);
  if (!tttV961Legal(board, n)) return;
  const opts = flags || {};
  const diagonal = !!(opts.diagonal || (dir && Math.abs(Number(dir[0] || 0)) === 1 && Math.abs(Number(dir[1] || 0)) === 1));
  const prev = map.get(n) || { idx: n, level: 0, hits: 0, diagonal: false, endpoint: false, gap: false, exact: false, kinds: [], dirs: [] };
  prev.level = Math.max(prev.level, Number(level || 0) || 0);
  prev.hits += Number(hits || 1) || 1;
  prev.diagonal = prev.diagonal || diagonal;
  prev.endpoint = prev.endpoint || !!opts.endpoint;
  prev.gap = prev.gap || !!opts.gap;
  prev.exact = prev.exact || !!opts.exact;
  if (kind && prev.kinds.indexOf(kind) < 0) prev.kinds.push(kind);
  if (dir) {
    const sig = String(dir[0]) + ',' + String(dir[1]);
    if (prev.dirs.indexOf(sig) < 0) prev.dirs.push(sig);
  }
  map.set(n, prev);
}

function tttV961ThreatEntries(board, mark) {
  const opponent = mark === 'X' ? 'O' : 'X';
  const map = new Map();
  const patternRules = [
    { pat: 'MMMM.', defs: [{ p: 4, level: 116, hits: 160, kind: 'simple-four', endpoint: true, exact: true }] },
    { pat: '.MMMM', defs: [{ p: 0, level: 116, hits: 160, kind: 'simple-four', endpoint: true, exact: true }] },
    { pat: '.MMM.', defs: [{ p: 0, level: 84, hits: 58, kind: 'open-three-end', endpoint: true, exact: true }, { p: 4, level: 84, hits: 58, kind: 'open-three-end', endpoint: true, exact: true }] },
    { pat: 'MM.M.', defs: [{ p: 2, level: 86, hits: 68, kind: 'broken-three-gap', gap: true, exact: true }, { p: 4, level: 67, hits: 18, kind: 'broken-three-end', endpoint: true }] },
    { pat: '.M.MM', defs: [{ p: 2, level: 86, hits: 68, kind: 'broken-three-gap', gap: true, exact: true }, { p: 0, level: 67, hits: 18, kind: 'broken-three-end', endpoint: true }] },
    { pat: 'M.MM.', defs: [{ p: 1, level: 86, hits: 68, kind: 'broken-three-gap', gap: true, exact: true }, { p: 4, level: 67, hits: 18, kind: 'broken-three-end', endpoint: true }] },
    { pat: '.MM.M', defs: [{ p: 3, level: 86, hits: 68, kind: 'broken-three-gap', gap: true, exact: true }, { p: 0, level: 67, hits: 18, kind: 'broken-three-end', endpoint: true }] },
    { pat: '.MM.M.', defs: [{ p: 3, level: 88, hits: 72, kind: 'open-broken-three-gap', gap: true, exact: true }, { p: 0, level: 70, hits: 22, kind: 'open-broken-three-end', endpoint: true }, { p: 5, level: 70, hits: 22, kind: 'open-broken-three-end', endpoint: true }] },
    { pat: '.M.MM.', defs: [{ p: 2, level: 88, hits: 72, kind: 'open-broken-three-gap', gap: true, exact: true }, { p: 0, level: 70, hits: 22, kind: 'open-broken-three-end', endpoint: true }, { p: 5, level: 70, hits: 22, kind: 'open-broken-three-end', endpoint: true }] },
    { pat: 'M.M.M', defs: [{ p: 1, level: 82, hits: 50, kind: 'split-three-gap', gap: true, exact: true }, { p: 3, level: 82, hits: 50, kind: 'split-three-gap', gap: true, exact: true }] },
    { pat: 'MM..M', defs: [{ p: 2, level: 71, hits: 26, kind: 'wide-broken-three-gap', gap: true }, { p: 3, level: 71, hits: 26, kind: 'wide-broken-three-gap', gap: true }] },
    { pat: 'M..MM', defs: [{ p: 1, level: 71, hits: 26, kind: 'wide-broken-three-gap', gap: true }, { p: 2, level: 71, hits: 26, kind: 'wide-broken-three-gap', gap: true }] }
  ];

  for (let row = 0; row < TTT_ROWS; row += 1) {
    for (let col = 0; col < TTT_COLS; col += 1) {
      for (const dir of tttV960Dirs()) {
        const dr = dir[0];
        const dc = dir[1];
        const diagonal = Math.abs(dr) === 1 && Math.abs(dc) === 1;
        for (const size of [5, 6, 7]) {
          const cells = [];
          let pattern = '';
          let own = 0;
          let opp = 0;
          const empties = [];
          let ok = true;
          for (let step = 0; step < size; step += 1) {
            const rr = row + dr * step;
            const cc = col + dc * step;
            if (!tttInBounds(rr, cc)) { ok = false; break; }
            const idx = tttIndex(rr, cc);
            cells.push(idx);
            const cell = board[idx];
            if (cell === mark) { own += 1; pattern += 'M'; }
            else if (cell === opponent) { opp += 1; pattern += 'B'; }
            else { empties.push(idx); pattern += '.'; }
          }
          if (!ok || opp || own < 2 || !empties.length) continue;

          const addAtPatternPos = (patStart, def, extraLevel) => {
            const pos = patStart + Number(def.p || 0);
            const idx = cells[pos];
            const flags = { diagonal, endpoint: !!def.endpoint, gap: !!def.gap, exact: !!def.exact };
            tttV961AddThreatEntry(map, board, idx, Number(def.level || 0) + (diagonal ? Number(extraLevel || 0) : 0), Number(def.hits || 1), diagonal && def.kind && !/^diagonal-/.test(def.kind) ? 'diagonal-' + def.kind : def.kind, dir, flags);
          };

          for (const rule of patternRules) {
            let from = pattern.indexOf(rule.pat);
            while (from >= 0) {
              for (const def of rule.defs) addAtPatternPos(from, def, rule.pat.indexOf('MMMM') >= 0 ? 8 : 6);
              from = pattern.indexOf(rule.pat, from + 1);
            }
          }

          if (size === 5 && own === 4 && empties.length === 1) {
            tttV961AddThreatEntry(map, board, empties[0], diagonal ? 124 : 120, 180, diagonal ? 'diagonal-four-in-five' : 'four-in-five', dir, { diagonal, exact: true, endpoint: true });
            continue;
          }

          if (size === 5 && own === 3 && empties.length === 2) {
            const level = diagonal ? 78 : 68;
            for (const idx of empties) tttV961AddThreatEntry(map, board, idx, level, diagonal ? 36 : 24, diagonal ? 'diagonal-three-window' : 'three-window', dir, { diagonal, exact: false });
          }

          if (size >= 6 && own >= 3 && empties.length >= 2) {
            for (const idx of empties) tttV961AddThreatEntry(map, board, idx, diagonal ? 69 : 58, diagonal ? 18 : 12, diagonal ? 'diagonal-long-three-window' : 'long-three-window', dir, { diagonal });
          }

          if (diagonal && own === 2 && empties.length >= 3) {
            for (const idx of empties) tttV961AddThreatEntry(map, board, idx, 38, 4, 'diagonal-two-build-up', dir, { diagonal });
          }
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    (b.level - a.level)
    || (b.hits - a.hits)
    || ((b.exact ? 1 : 0) - (a.exact ? 1 : 0))
    || ((b.gap ? 1 : 0) - (a.gap ? 1 : 0))
    || ((b.endpoint ? 1 : 0) - (a.endpoint ? 1 : 0))
    || ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0))
    || (tttV961CenterScore(b.idx) - tttV961CenterScore(a.idx))
    || (a.idx - b.idx)
  );
}

function tttV961GainEntries(board, mark, deadline) {
  const occupied = tttV960Occupied(board);
  const pool = new Set(tttV960CandidateSet(board, occupied < 18 ? 3 : 2));
  tttV961ThreatEntries(board, mark).slice(0, 28).forEach(e => pool.add(e.idx));
  tttV961ThreatEntries(board, mark === 'X' ? 'O' : 'X').slice(0, 18).forEach(e => pool.add(e.idx));
  const out = [];
  for (const raw of pool) {
    if (tttV961TimeUp(deadline, 20) && out.length) break;
    const idx = Number(raw);
    if (!tttV961Legal(board, idx)) continue;
    board[idx] = mark;
    const wins = tttV960WinningMoves(board, mark).length;
    const threats = tttV961ThreatEntries(board, mark);
    const top = threats[0] || null;
    const fork = typeof tttBestForkMove === 'function' && tttBestForkMove(board, mark) >= 0 ? 1 : 0;
    board[idx] = '';
    const topLevel = top ? Number(top.level || 0) : 0;
    let level = 0;
    if (wins >= 2) level = 122;
    else if (wins >= 1) level = 112;
    else if (fork && topLevel >= 78) level = 104;
    else if (topLevel >= 116) level = 104;
    else if (topLevel >= 86) level = 92;
    else if (topLevel >= 78) level = 82;
    else if (topLevel >= 68) level = 70;
    if (level < 70) continue;
    out.push({ idx, level, hits: wins * 100 + (top ? Number(top.hits || 0) : 0) + fork * 36, diagonal: !!(top && top.diagonal), endpoint: !!(top && top.endpoint), gap: !!(top && top.gap), kinds: ['gain'].concat(top && top.kinds ? top.kinds : []) });
  }
  return out.sort((a, b) => (b.level - a.level) || (b.hits - a.hits) || ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0)) || (a.idx - b.idx));
}

function tttV961ThreatRisk(board, mark, deadline) {
  const winner = tttWinner(board).winner;
  if (winner === mark) return 1e18;
  const wins = tttV960WinningMoves(board, mark).length;
  const threats = tttV961ThreatEntries(board, mark);
  const gains = tttV961GainEntries(board, mark, deadline);
  const fork = typeof tttBestForkMove === 'function' && tttBestForkMove(board, mark) >= 0 ? 1 : 0;
  let score = wins * 8e16 + fork * 8e12;
  for (const e of threats.slice(0, 30)) {
    score += Math.pow(12, Math.min(12, Number(e.level || 0) / 10)) * (Number(e.hits || 1) || 1) * (e.diagonal ? 1.65 : 1) * (e.exact ? 1.18 : 1);
  }
  for (const g of gains.slice(0, 18)) {
    score += Math.pow(12, Math.min(12, Number(g.level || 0) / 10)) * (Number(g.hits || 1) || 1) * (g.diagonal ? 1.8 : 1) * 1.35;
  }
  return score;
}

function tttV961EntryListFromMoves(moves, level, kind) {
  return (moves || []).map(idx => ({ idx: Number(idx), level: Number(level || 0), hits: 999, exact: true, endpoint: true, kinds: [kind || 'move'] }));
}

function tttV961PickDefense(board, entries, deadline) {
  const list = (entries || []).filter(e => e && tttV961Legal(board, e.idx));
  if (!list.length) return -1;
  let best = -1;
  let bestScore = -Infinity;
  let bestImmediateLosses = Infinity;
  for (const e of list.slice(0, 24)) {
    if (tttV961TimeUp(deadline, 12) && best >= 0) break;
    const idx = Number(e.idx);
    board[idx] = 'O';
    const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
    const immediateLosses = tttV960WinningMoves(board, 'X').length;
    const xThreats = tttV961ThreatEntries(board, 'X');
    const xTop = xThreats[0] || null;
    const oThreats = tttV961ThreatEntries(board, 'O');
    const oTop = oThreats[0] || null;
    board[idx] = '';
    const remainingSevere = xThreats.filter(t => Number(t.level || 0) >= 110).length;
    const score = ownWin * 1e19
      - immediateLosses * 9e17
      - remainingSevere * 8e16
      - (xTop ? Number(xTop.level || 0) * 5e13 + Number(xTop.hits || 0) * 2e12 : 0)
      + (oTop ? Number(oTop.level || 0) * 2.6e13 + Number(oTop.hits || 0) * 8e11 : 0)
      + Number(e.level || 0) * 3.2e14
      + Number(e.hits || 0) * 1.8e12
      + (e.exact ? 5e13 : 0)
      + (e.gap ? 3e13 : 0)
      + (e.endpoint ? 1.4e13 : 0)
      + (e.diagonal ? 1.2e13 : 0)
      + tttCheapMovePotential(board, idx, 'X') * 5200
      + tttCheapMovePotential(board, idx, 'O') * 2600
      + tttV961CenterScore(idx) * 1800;
    if (immediateLosses < bestImmediateLosses || (immediateLosses === bestImmediateLosses && score > bestScore)) {
      bestImmediateLosses = immediateLosses;
      bestScore = score;
      best = idx;
    }
  }
  return best;
}

function tttV961CandidatePool(board, deadline) {
  const occupied = tttV960Occupied(board);
  const pool = new Set(tttV960CandidateSet(board, occupied < 20 ? 3 : 2));
  tttV960WinningMoves(board, 'O').forEach(idx => pool.add(idx));
  tttV960WinningMoves(board, 'X').forEach(idx => pool.add(idx));
  tttV961ThreatEntries(board, 'X').slice(0, 32).forEach(e => pool.add(e.idx));
  tttV961ThreatEntries(board, 'O').slice(0, 24).forEach(e => pool.add(e.idx));
  tttV961GainEntries(board, 'X', deadline).slice(0, 20).forEach(e => pool.add(e.idx));
  tttV961GainEntries(board, 'O', deadline).slice(0, 18).forEach(e => pool.add(e.idx));
  return Array.from(pool)
    .map(Number)
    .filter(idx => tttV961Legal(board, idx))
    .map(idx => {
      board[idx] = 'O';
      const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
      const xWins = tttV960WinningMoves(board, 'X').length;
      const oTop = tttV961ThreatEntries(board, 'O')[0];
      const xTop = tttV961ThreatEntries(board, 'X')[0];
      board[idx] = '';
      return {
        idx,
        score: ownWin * 1e18
          - xWins * 9e16
          + (oTop ? Number(oTop.level || 0) * 8e12 + Number(oTop.hits || 0) * 7e10 : 0)
          + (xTop ? Number(xTop.level || 0) * 7e12 + Number(xTop.hits || 0) * 8e10 : 0)
          + tttCheapMovePotential(board, idx, 'X') * 5800
          + tttCheapMovePotential(board, idx, 'O') * 3600
          + tttV961CenterScore(idx) * 2000
      };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.idx);
}

function tttV961SafetyReport(board, idx, deadline) {
  if (!tttV961Legal(board, idx)) return { idx, illegal: true, risk: 1e20, immediateLosses: 99, openFourThreats: 99, forkThreat: true };
  const occupied = tttV960Occupied(board);
  board[idx] = 'O';
  const ownWinNow = tttWinner(board).winner === 'O';
  const immediateLosses = tttV960WinningMoves(board, 'X').length;
  const xThreats = tttV961ThreatEntries(board, 'X');
  const xGains = tttV961GainEntries(board, 'X', deadline);
  const openFourThreats = xThreats.filter(e => e.level >= 110).length + xGains.filter(e => e.level >= 112).length;
  const forkThreat = typeof tttBestForkMove === 'function' && tttBestForkMove(board, 'X') >= 0;
  const replyPool = new Set(tttV960CandidateSet(board, occupied < 22 ? 3 : 2));
  xThreats.slice(0, 18).forEach(e => replyPool.add(e.idx));
  xGains.slice(0, 16).forEach(e => replyPool.add(e.idx));
  tttV961ThreatEntries(board, 'O').slice(0, 12).forEach(e => replyPool.add(e.idx));
  let replies = Array.from(replyPool).map(Number).filter(reply => tttV961Legal(board, reply));
  replies = replies.map(reply => {
    board[reply] = 'X';
    const score = (tttWinner(board).winner === 'X' ? 1e18 : 0)
      + tttV960WinningMoves(board, 'X').length * 9e16
      + tttV961ThreatRisk(board, 'X', deadline) * 0.04
      + tttCheapMovePotential(board, reply, 'X') * 4600
      - tttV960WinningMoves(board, 'O').length * 7e16;
    board[reply] = '';
    return { reply, score };
  }).sort((a, b) => b.score - a.score).slice(0, occupied < 22 ? 16 : 12).map(item => item.reply);

  let worstReplyRisk = 0;
  for (const reply of replies) {
    if (tttV961TimeUp(deadline, 18) && worstReplyRisk > 0) break;
    board[reply] = 'X';
    const replyWinner = tttWinner(board).winner === 'X' ? 1 : 0;
    const xWins = tttV960WinningMoves(board, 'X').length;
    const xRisk = tttV961ThreatRisk(board, 'X', deadline);
    const oWins = tttV960WinningMoves(board, 'O').length;
    const oRisk = tttV961ThreatRisk(board, 'O', deadline);
    let bestCounterRelief = 0;
    const counters = tttV961CandidatePool(board, deadline).slice(0, 8);
    for (const counter of counters) {
      if (tttV961TimeUp(deadline, 10)) break;
      board[counter] = 'O';
      const relief = xRisk - tttV961ThreatRisk(board, 'X', deadline) + (tttWinner(board).winner === 'O' ? 1e17 : 0) + tttV960WinningMoves(board, 'O').length * 3e16;
      board[counter] = '';
      if (relief > bestCounterRelief) bestCounterRelief = relief;
    }
    board[reply] = '';
    const risk = replyWinner * 1e19 + xWins * 6e17 + xRisk * 1.15 - oWins * 2.2e17 - oRisk * 0.16 - bestCounterRelief * 0.32;
    if (risk > worstReplyRisk) worstReplyRisk = risk;
  }

  const ownRisk = tttV961ThreatRisk(board, 'O', deadline);
  const xRiskAfter = tttV961ThreatRisk(board, 'X', deadline);
  board[idx] = '';
  const risk = (ownWinNow ? 0 : 0)
    + immediateLosses * 1e19
    + openFourThreats * 8e17
    + (forkThreat ? 8e16 : 0)
    + xRiskAfter * 1.24
    + worstReplyRisk * 0.9
    - ownRisk * 0.24;
  return { idx, illegal: false, ownWinNow, immediateLosses, openFourThreats, forkThreat, worstReplyRisk, risk };
}

function tttV961MoveScore(board, idx, deadline) {
  const safety = tttV961SafetyReport(board, idx, deadline);
  if (safety.illegal) return -Infinity;
  board[idx] = 'O';
  const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
  const ownRisk = tttV961ThreatRisk(board, 'O', deadline);
  const xRisk = tttV961ThreatRisk(board, 'X', deadline);
  const ownGains = tttV961GainEntries(board, 'O', deadline);
  board[idx] = '';
  const safeBonus = (!safety.immediateLosses && !safety.openFourThreats && !safety.forkThreat) ? 2e15 : 0;
  return ownWin * 1e20
    + safeBonus
    + ownRisk * 1.08
    + (ownGains[0] ? Number(ownGains[0].level || 0) * 1.2e14 + Number(ownGains[0].hits || 0) * 7e12 : 0)
    - xRisk * 1.55
    - safety.risk * 1.85
    + tttCheapMovePotential(board, idx, 'O') * 5000
    + tttCheapMovePotential(board, idx, 'X') * 6200
    + tttV961CenterScore(idx) * 2400;
}

function tttV961PickVerifiedRootMove(board, candidates, deadline) {
  const list = (candidates || []).filter(idx => tttV961Legal(board, idx)).slice(0, 16);
  let best = -1;
  let bestScore = -Infinity;
  let bestSafe = -1;
  let bestSafeScore = -Infinity;
  for (const idx of list) {
    if (tttV961TimeUp(deadline, 26) && best >= 0) break;
    const score = tttV961MoveScore(board, idx, deadline);
    if (score > bestScore) { bestScore = score; best = idx; }
    const safety = tttV961SafetyReport(board, idx, deadline);
    const safe = safety.ownWinNow || (!safety.immediateLosses && !safety.openFourThreats && !safety.forkThreat);
    if (safe && score > bestSafeScore) { bestSafeScore = score; bestSafe = idx; }
  }
  return bestSafe >= 0 ? bestSafe : best;
}

function tttV961BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const terminal = tttWinner(board).winner;
  if (terminal) return tttNearestCenterFallbackMove(board);
  const budget = tttV961Budget(difficulty || 'ai');
  const hardDeadline = tttEngineNow() + Number(budget.hard || TTT_V961_HARD_DEADLINE_MS);

  const ownWins = tttV960WinningMoves(board, 'O');
  if (ownWins.length) return tttV961PickDefense(board, tttV961EntryListFromMoves(ownWins, 160, 'own-immediate-win'), hardDeadline);

  const xWins = tttV960WinningMoves(board, 'X');
  if (xWins.length) return tttV961PickDefense(board, tttV961EntryListFromMoves(xWins, 180, 'immediate-loss-block'), hardDeadline);

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }
  const currentX = tttV961ThreatEntries(board, 'X');
  const forcedFours = currentX.filter(e => e.level >= 110);
  if (forcedFours.length) {
    const block = tttV961PickDefense(board, forcedFours, hardDeadline);
    if (tttV961Legal(board, block)) return block;
  }

  const openThreeAndBroken = currentX.filter(e => e.level >= 78 || (e.diagonal && e.level >= 69) || e.gap || e.exact);
  if (openThreeAndBroken.length) {
    const block = tttV961PickDefense(board, openThreeAndBroken, hardDeadline);
    if (tttV961Legal(board, block)) return block;
  }

  const xGains = tttV961GainEntries(board, 'X', hardDeadline).filter(e => e.level >= 82 || (e.diagonal && e.level >= 70));
  if (xGains.length) {
    const block = tttV961PickDefense(board, xGains, hardDeadline);
    if (tttV961Legal(board, block)) return block;
  }

  const ownForcing = tttV961GainEntries(board, 'O', hardDeadline).filter(e => e.level >= 104);
  if (ownForcing.length) {
    const attack = tttV961PickDefense(board, ownForcing, hardDeadline);
    if (tttV961Legal(board, attack)) {
      const safety = tttV961SafetyReport(board, attack, hardDeadline);
      if (safety.ownWinNow || (!safety.immediateLosses && !safety.openFourThreats)) return attack;
    }
  }

  const candidates = tttV961CandidatePool(board, hardDeadline);
  const verified = tttV961PickVerifiedRootMove(board, candidates, hardDeadline);
  if (tttV961Legal(board, verified)) return verified;

  const emergency = tttV961PickDefense(board, currentX.concat(tttV961GainEntries(board, 'X', hardDeadline)), hardDeadline);
  if (tttV961Legal(board, emergency)) return emergency;
  const v960 = typeof tttV960BestMove === 'function' ? tttV960BestMove(board, difficulty || 'ai') : -1;
  if (tttV961Legal(board, v960)) return v960;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV961Health() {
  const budget = tttV961Budget('ai');
  return {
    ok: true,
    boardRows: TTT_ROWS,
    boardCols: TTT_COLS,
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    offlineAiOnly: true,
    onlinePvpUntouched: true,
    tacticalOpeningWinCheck: true,
    immediateLossBlock: true,
    diagonalThreatDefense: true,
    openThreeDefense: true,
    brokenThreeDefense: true,
    candidateSafetyVerification: true,
    tacticalVerificationPly: '1-2 ply on top root candidates',
    softDeadlineMs: Number(budget.soft || TTT_V961_SOFT_DEADLINE_MS),
    hardDeadlineMs: Number(budget.hard || TTT_V961_HARD_DEADLINE_MS),
    fallbackLegalMove: true,
    testedLocallyByScript: 'gomoku-ai-smoke-v961.js',
    note: 'v961 nechává online PvP beze změny a přidává nad offline AI bezpečnostní ověření kandidátů včetně přesných diagonálních endpoint/gap defense squares.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV961Health = getRakGomokuAiV961Health;
  window.getRakGomokuAiV960Health = getRakGomokuAiV961Health;
  window.getRakGomokuAiV959Health = getRakGomokuAiV961Health;
}

function tttBestMove(board, difficulty) {
  const next = typeof tttV961BestMove === 'function' ? tttV961BestMove(board, difficulty || 'ai') : -1;
  if (tttV961Legal(board, next)) return next;
  const win = tttV960WinningMoves(board, 'O')[0];
  if (tttV961Legal(board, win)) return win;
  const block = tttV960WinningMoves(board, 'X')[0];
  if (tttV961Legal(board, block)) return block;
  const prev = typeof tttV960BestMove === 'function' ? tttV960BestMove(board, difficulty || 'ai') : -1;
  if (tttV961Legal(board, prev)) return prev;
  return tttNearestCenterFallbackMove(board);
}


// v.1.5 (963) – Piškvorky AI: anti-fork/anti-open-four vrstva nad v961.
// Cíl: nenechat X vytvořit dvojité okamžité výhry typu .XXXX. a podobné pasti.
const TTT_V962_SOFT_DEADLINE_MS = 1700;
const TTT_V962_HARD_DEADLINE_MS = 2300;

function tttV962Budget(difficulty) {
  const prev = typeof tttV961Budget === 'function' ? tttV961Budget(difficulty || 'ai') : { soft: 1600, hard: 2200 };
  const lowEnd = !!(typeof document !== 'undefined' && document.body && document.body.classList && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lowEndDevice') || document.body.classList.contains('lightweightMode')));
  if (difficulty !== 'ai') return { soft: Math.max(420, Number(prev.soft || 0) || 0), hard: Math.max(720, Number(prev.hard || 0) || 0) };
  return lowEnd ? { soft: 1300, hard: 2000 } : { soft: TTT_V962_SOFT_DEADLINE_MS, hard: TTT_V962_HARD_DEADLINE_MS };
}

function tttV962Now() {
  return typeof tttEngineNow === 'function' ? tttEngineNow() : ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
}

function tttV962TimeUp(deadline, margin) {
  return !!(deadline && tttV962Now() > deadline - (Number(margin || 0) || 0));
}

function tttV962Legal(board, idx) {
  return typeof tttV961Legal === 'function' ? tttV961Legal(board, idx) : (Number.isFinite(Number(idx)) && idx >= 0 && idx < board.length && !board[idx]);
}

function tttV962CenterScore(idx) {
  return typeof tttV961CenterScore === 'function' ? tttV961CenterScore(idx) : 0;
}

function tttV962Coord(idx) {
  return { row: Math.floor(Number(idx) / TTT_COLS), col: Number(idx) % TTT_COLS };
}

function tttV962UniqueEntries(entries) {
  const map = new Map();
  for (const e of entries || []) {
    if (!e || !Number.isFinite(Number(e.idx))) continue;
    const idx = Number(e.idx);
    const prev = map.get(idx);
    if (!prev || Number(e.level || 0) > Number(prev.level || 0) || (Number(e.level || 0) === Number(prev.level || 0) && Number(e.hits || 0) > Number(prev.hits || 0))) {
      map.set(idx, Object.assign({}, e, { idx }));
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    (Number(b.level || 0) - Number(a.level || 0))
    || (Number(b.hits || 0) - Number(a.hits || 0))
    || (Number(b.immediateWins || 0) - Number(a.immediateWins || 0))
    || ((b.diagonal ? 1 : 0) - (a.diagonal ? 1 : 0))
    || (tttV962CenterScore(b.idx) - tttV962CenterScore(a.idx))
    || (a.idx - b.idx)
  );
}

function tttV962CandidateSet(board, radius) {
  const occupied = typeof tttV960Occupied === 'function' ? tttV960Occupied(board) : board.filter(Boolean).length;
  const pool = new Set(typeof tttV960CandidateSet === 'function' ? tttV960CandidateSet(board, radius || (occupied < 22 ? 3 : 2)) : []);
  if (!occupied) {
    [tttIndex(9, 4), tttIndex(9, 5), tttIndex(8, 4), tttIndex(10, 5)].forEach(idx => pool.add(idx));
  }
  try { tttV960WinningMoves(board, 'O').forEach(idx => pool.add(idx)); } catch (_) {}
  try { tttV960WinningMoves(board, 'X').forEach(idx => pool.add(idx)); } catch (_) {}
  try { tttV961ThreatEntries(board, 'X').slice(0, 42).forEach(e => pool.add(e.idx)); } catch (_) {}
  try { tttV961ThreatEntries(board, 'O').slice(0, 32).forEach(e => pool.add(e.idx)); } catch (_) {}
  return Array.from(pool).map(Number).filter(idx => tttV962Legal(board, idx));
}

function tttV962StrongThreatCount(entries, minLevel) {
  let n = 0;
  const seen = new Set();
  for (const e of entries || []) {
    if (!e || seen.has(e.idx)) continue;
    if (Number(e.level || 0) >= Number(minLevel || 84)) {
      seen.add(e.idx);
      n += 1;
    }
  }
  return n;
}

function tttV962KillerEntries(board, mark, deadline) {
  const opponent = mark === 'X' ? 'O' : 'X';
  const pool = tttV962CandidateSet(board, (tttV960Occupied(board) < 24 ? 3 : 2));
  const out = [];
  for (const idx of pool) {
    if (tttV962TimeUp(deadline, 22) && out.length) break;
    if (!tttV962Legal(board, idx)) continue;
    board[idx] = mark;
    const winNow = tttWinner(board).winner === mark;
    const immediateWins = winNow ? 99 : tttV960WinningMoves(board, mark).length;
    const threats = tttV961ThreatEntries(board, mark);
    const top = threats[0] || null;
    const severeThreats = tttV962StrongThreatCount(threats, 84);
    const forcedThreats = tttV962StrongThreatCount(threats, 110);
    const forkMove = immediateWins >= 2 || severeThreats >= 2;
    const diagonal = !!(top && top.diagonal);
    const exact = !!(top && top.exact);
    const gap = !!(top && top.gap);
    const endpoint = !!(top && top.endpoint);
    board[idx] = '';

    let level = 0;
    if (winNow) level = 240;
    else if (immediateWins >= 2) level = 218;
    else if (immediateWins === 1 && severeThreats >= 2) level = 196;
    else if (immediateWins === 1) level = 176;
    else if (forcedThreats >= 2) level = 166;
    else if (forcedThreats >= 1 && severeThreats >= 2) level = 158;
    else if (severeThreats >= 3) level = 148;
    else if (severeThreats >= 2) level = 138;
    else if (top && Number(top.level || 0) >= 116) level = 128;
    else if (top && Number(top.level || 0) >= 88 && exact) level = 108;
    else if (top && Number(top.level || 0) >= 84) level = 102;
    if (level < 102) continue;

    out.push({
      idx,
      level,
      hits: immediateWins * 800 + forcedThreats * 300 + severeThreats * 90 + (top ? Number(top.hits || 0) : 0),
      immediateWins,
      severeThreats,
      severeGains: 0,
      forcedThreats,
      forkMove,
      diagonal,
      exact,
      gap,
      endpoint,
      kinds: ['killer'].concat(top && top.kinds ? top.kinds.slice(0, 4) : []),
      opponent
    });
  }
  return tttV962UniqueEntries(out);
}

function tttV962LineRunAfterMove(board, idx, mark) {
  if (!Number.isFinite(Number(idx))) return 0;
  const row = Math.floor(Number(idx) / TTT_COLS);
  const col = Number(idx) % TTT_COLS;
  let best = 0;
  for (const dir of tttV960Dirs()) {
    const dr = dir[0], dc = dir[1];
    let len = 1;
    let r = row + dr, c = col + dc;
    while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) { len += 1; r += dr; c += dc; }
    r = row - dr; c = col - dc;
    while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) { len += 1; r -= dr; c -= dc; }
    if (len > best) best = len;
  }
  return best;
}

function tttV962PositionRisk(board, mark, deadline) {
  // Rychlý odhad rizika bez vnořeného killer scanu; ten se řeší samostatně.
  const wins = tttV960WinningMoves(board, mark).length;
  const threats = tttV961ThreatEntries(board, mark);
  const gains = tttV961GainEntries(board, mark, deadline);
  const top = threats[0] || null;
  const topGain = gains[0] || null;
  const severeThreats = tttV962StrongThreatCount(threats, 84);
  const severeGains = tttV962StrongThreatCount(gains, 104);
  return wins * 9e18
    + severeThreats * 6e16
    + severeGains * 9e16
    + (top ? Number(top.level || 0) * 3e14 + Number(top.hits || 0) * 2.8e12 + (top.exact ? 8e13 : 0) : 0)
    + (topGain ? Number(topGain.level || 0) * 4e14 + Number(topGain.hits || 0) * 2.6e12 : 0);
}

function tttV962SafetyReport(board, idx, deadline) {
  if (!tttV962Legal(board, idx)) return { idx, illegal: true, risk: 1e30, immediateLosses: 99, killerLevel: 999, killerCount: 99 };
  board[idx] = 'O';
  const ownWinNow = tttWinner(board).winner === 'O';
  const immediateLosses = tttV960WinningMoves(board, 'X').length;
  const killers = tttV962KillerEntries(board, 'X', deadline);
  const killerLevel = killers[0] ? Number(killers[0].level || 0) : 0;
  const killerCount = killers.filter(e => Number(e.level || 0) >= 138).length;
  const xRisk = tttV962PositionRisk(board, 'X', deadline);
  const oRisk = tttV962PositionRisk(board, 'O', deadline);
  let worstReply = 0;
  const replies = tttV962UniqueEntries(killers.concat(tttV961GainEntries(board, 'X', deadline)).concat(tttV961ThreatEntries(board, 'X')))
    .filter(e => tttV962Legal(board, e.idx))
    .slice(0, 8);
  for (const e of replies) {
    if (tttV962TimeUp(deadline, 20) && worstReply > 0) break;
    const reply = Number(e.idx);
    board[reply] = 'X';
    const replyWin = tttWinner(board).winner === 'X' ? 1 : 0;
    const replyWins = tttV960WinningMoves(board, 'X').length;
    const replyThreat = tttV961ThreatEntries(board, 'X')[0] || null;
    const replyGain = tttV961GainEntries(board, 'X', deadline)[0] || null;
    const oImmediate = tttV960WinningMoves(board, 'O').length;
    board[reply] = '';
    const score = replyWin * 1e24
      + replyWins * 8e21
      + (replyThreat ? Number(replyThreat.level || 0) * 3e18 + Number(replyThreat.hits || 0) * 8e15 : 0)
      + (replyGain ? Number(replyGain.level || 0) * 5e18 + Number(replyGain.hits || 0) * 9e15 : 0)
      - oImmediate * 2e20;
    if (score > worstReply) worstReply = score;
  }
  board[idx] = '';
  const risk = (ownWinNow ? 0 : immediateLosses * 1e25)
    + killerLevel * 2.6e20
    + killerCount * 6e21
    + xRisk * 1.7
    + worstReply * 0.8
    - oRisk * 0.34;
  return { idx, illegal: false, ownWinNow, immediateLosses, killerLevel, killerCount, xRisk, oRisk, worstReply, risk };
}

function tttV962PickDefense(board, entries, deadline) {
  const list = tttV962UniqueEntries(entries).filter(e => tttV962Legal(board, e.idx)).slice(0, 34);
  if (!list.length) return -1;
  let best = -1;
  let bestRank = null;
  for (const e of list) {
    if (tttV962TimeUp(deadline, 26) && best >= 0) break;
    const idx = Number(e.idx);
    const safety = tttV962SafetyReport(board, idx, deadline);
    board[idx] = 'O';
    const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
    const ownThreat = tttV961ThreatEntries(board, 'O')[0] || null;
    const ownKill = tttV962KillerEntries(board, 'O', deadline)[0] || null;
    const runBlock = tttV962LineRunAfterMove(board, idx, 'O') + tttV962LineRunAfterMove(board, idx, 'X') * 0.35;
    board[idx] = '';
    const rank = [
      ownWin ? 1 : 0,
      -Number(safety.immediateLosses || 0),
      -Number(safety.killerCount || 0),
      -Number(safety.killerLevel || 0),
      -Number(safety.risk || 0),
      Number(e.level || 0) * 1e16 + Number(e.hits || 0) * 1e13,
      ownKill ? Number(ownKill.level || 0) * 1e14 + Number(ownKill.hits || 0) * 1e12 : 0,
      ownThreat ? Number(ownThreat.level || 0) * 1e13 + Number(ownThreat.hits || 0) * 1e11 : 0,
      runBlock * 1e12,
      (e.exact ? 4e12 : 0) + (e.gap ? 3e12 : 0) + (e.endpoint ? 2e12 : 0) + (e.diagonal ? 1e12 : 0),
      tttV962CenterScore(idx)
    ];
    if (!bestRank || tttV962CompareRank(rank, bestRank) > 0) {
      bestRank = rank;
      best = idx;
    }
  }
  return best;
}

function tttV962CompareRank(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const av = Number(a[i] || 0);
    const bv = Number(b[i] || 0);
    if (av > bv) return 1;
    if (av < bv) return -1;
  }
  return 0;
}

function tttV962MoveScore(board, idx, deadline) {
  const safety = tttV962SafetyReport(board, idx, deadline);
  if (safety.illegal) return -Infinity;
  board[idx] = 'O';
  const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
  const ownKill = tttV962KillerEntries(board, 'O', deadline)[0] || null;
  const ownThreat = tttV961ThreatEntries(board, 'O')[0] || null;
  const xThreat = tttV961ThreatEntries(board, 'X')[0] || null;
  board[idx] = '';
  return ownWin * 1e30
    - Number(safety.immediateLosses || 0) * 1e28
    - Number(safety.killerCount || 0) * 6e26
    - Number(safety.killerLevel || 0) * 2e24
    - Number(safety.risk || 0) * 2.2
    + (ownKill ? Number(ownKill.level || 0) * 9e21 + Number(ownKill.hits || 0) * 5e18 : 0)
    + (ownThreat ? Number(ownThreat.level || 0) * 8e20 + Number(ownThreat.hits || 0) * 4e18 : 0)
    - (xThreat ? Number(xThreat.level || 0) * 5e20 + Number(xThreat.hits || 0) * 4e18 : 0)
    + tttCheapMovePotential(board, idx, 'O') * 12000
    + tttCheapMovePotential(board, idx, 'X') * 15000
    + tttV962CenterScore(idx) * 3500;
}

function tttV962PickRoot(board, candidates, deadline) {
  const list = Array.from(new Set((candidates || []).map(Number).filter(idx => tttV962Legal(board, idx)))).slice(0, 24);
  let best = -1;
  let bestScore = -Infinity;
  let safest = -1;
  let safestScore = -Infinity;
  for (const idx of list) {
    if (tttV962TimeUp(deadline, 28) && best >= 0) break;
    const score = tttV962MoveScore(board, idx, deadline);
    const safety = tttV962SafetyReport(board, idx, deadline);
    const safe = safety.ownWinNow || (!safety.immediateLosses && !safety.killerCount && Number(safety.killerLevel || 0) < 138);
    if (score > bestScore) { bestScore = score; best = idx; }
    if (safe && score > safestScore) { safestScore = score; safest = idx; }
  }
  return safest >= 0 ? safest : best;
}

function tttV962BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  const terminal = tttWinner(board).winner;
  if (terminal) return tttNearestCenterFallbackMove(board);
  const budget = tttV962Budget(difficulty || 'ai');
  const hardDeadline = tttV962Now() + Number(budget.hard || TTT_V962_HARD_DEADLINE_MS);

  const ownWins = tttV960WinningMoves(board, 'O');
  if (ownWins.length) return ownWins[0];

  const xWins = tttV960WinningMoves(board, 'X');
  if (xWins.length === 1) return xWins[0];
  if (xWins.length > 1) {
    const multiBlock = typeof tttV961PickDefense === 'function' ? tttV961PickDefense(board, tttV961EntryListFromMoves(xWins, 260, 'multi-immediate-loss-block'), hardDeadline) : xWins[0];
    if (tttV962Legal(board, multiBlock)) return multiBlock;
    return xWins[0];
  }

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  const currentX = tttV961ThreatEntries(board, 'X');
  const forcedX = currentX.filter(e => Number(e.level || 0) >= 110 || (e.exact && Number(e.level || 0) >= 84));
  if (forcedX.length) {
    const quickBlock = typeof tttV961PickDefense === 'function' ? tttV961PickDefense(board, forcedX, hardDeadline) : forcedX[0].idx;
    if (tttV962Legal(board, quickBlock)) return quickBlock;
  }

  // Nejdůležitější novinka v962: dřív než AI zaútočí, blokuje tah X,
  // který by příštím tahem vytvořil dvě a více okamžitých výher.
  const xKillers = tttV962KillerEntries(board, 'X', hardDeadline);
  const unstoppableBuilder = xKillers.filter(e => Number(e.immediateWins || 0) >= 2 || Number(e.level || 0) >= 176);
  if (unstoppableBuilder.length) {
    const block = tttV962PickDefense(board, unstoppableBuilder, hardDeadline);
    if (tttV962Legal(board, block)) return block;
  }

  const strongXKillers = xKillers.filter(e => Number(e.level || 0) >= 138 || (e.diagonal && Number(e.level || 0) >= 120));
  if (strongXKillers.length) {
    const block = tttV962PickDefense(board, strongXKillers, hardDeadline);
    if (tttV962Legal(board, block)) return block;
  }

  const xGains = tttV961GainEntries(board, 'X', hardDeadline).filter(e => Number(e.level || 0) >= 92 || (e.diagonal && Number(e.level || 0) >= 78));
  if (xGains.length) {
    const block = tttV962PickDefense(board, xGains, hardDeadline);
    if (tttV962Legal(board, block)) return block;
  }

  const ownKillers = tttV962KillerEntries(board, 'O', hardDeadline).filter(e => Number(e.level || 0) >= 148);
  if (ownKillers.length) {
    const attack = tttV962PickDefense(board, ownKillers, hardDeadline);
    if (tttV962Legal(board, attack)) {
      const safety = tttV962SafetyReport(board, attack, hardDeadline);
      if (safety.ownWinNow || (!safety.immediateLosses && Number(safety.killerLevel || 0) < 176)) return attack;
    }
  }

  const candidates = tttV962CandidateSet(board, occupied < 24 ? 3 : 2)
    .map(idx => ({ idx, score: tttCheapMovePotential(board, idx, 'X') * 7.5 + tttCheapMovePotential(board, idx, 'O') * 5.2 + tttV962CenterScore(idx) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 24 ? 34 : 26)
    .map(x => x.idx);
  const verified = tttV962PickRoot(board, candidates, hardDeadline);
  if (tttV962Legal(board, verified)) return verified;

  const v961 = typeof tttV961BestMove === 'function' ? tttV961BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, v961)) return v961;
  const v960 = typeof tttV960BestMove === 'function' ? tttV960BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, v960)) return v960;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV962Health() {
  const budget = tttV962Budget('ai');
  return {
    ok: true,
    boardRows: TTT_ROWS,
    boardCols: TTT_COLS,
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    offlineAiOnly: true,
    onlinePvpUntouched: true,
    tacticalOpeningWinCheck: true,
    immediateLossBlock: true,
    multiImmediateLossBlock: true,
    diagonalThreatDefense: true,
    openThreeDefense: true,
    brokenThreeDefense: true,
    antiForkDefense: true,
    antiOpenFourBuilderDefense: true,
    candidateSafetyVerification: true,
    tacticalVerificationPly: '1-2 ply on top root candidates + v962 killer scan',
    softDeadlineMs: Number(budget.soft || TTT_V962_SOFT_DEADLINE_MS),
    hardDeadlineMs: Number(budget.hard || TTT_V962_HARD_DEADLINE_MS),
    fallbackLegalMove: true,
    testedLocallyByScript: 'gomoku-ai-smoke-v962.js',
    note: 'v962 blokuje i tah X, který by příště vytvořil dvě okamžité výhry / open-four fork. Online PvP zůstává beze změny.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV962Health = getRakGomokuAiV962Health;
  window.getRakGomokuAiV961Health = getRakGomokuAiV962Health;
  window.getRakGomokuAiV960Health = getRakGomokuAiV962Health;
  window.getRakGomokuAiV959Health = getRakGomokuAiV962Health;
}


const TTT_V965_SOFT_DEADLINE_MS = 1900;
const TTT_V965_HARD_DEADLINE_MS = 3800;

function tttV965Budget(difficulty) {
  const prev = typeof tttV962Budget === 'function' ? tttV962Budget(difficulty || 'ai') : { soft: 1700, hard: 2300 };
  const lowEnd = !!(typeof document !== 'undefined' && document.body && document.body.classList && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lowEndDevice') || document.body.classList.contains('lightweightMode')));
  if (difficulty !== 'ai') return { soft: Math.max(500, Number(prev.soft || 0) || 0), hard: Math.max(850, Number(prev.hard || 0) || 0) };
  return lowEnd ? { soft: 1450, hard: 2600 } : { soft: TTT_V965_SOFT_DEADLINE_MS, hard: TTT_V965_HARD_DEADLINE_MS };
}

function tttV965TimeUp(deadline, margin) {
  return !!(deadline && tttV962Now() > deadline - (Number(margin || 0) || 0));
}

function tttV965PressureEntries(board, mark, deadline) {
  const basePool = tttV962CandidateSet(board, (tttV960Occupied(board) < 30 ? 3 : 2));
  const pool = basePool
    .map(idx => ({ idx, score: tttCheapMovePotential(board, idx, mark) * 9 + tttCheapMovePotential(board, idx, mark === 'X' ? 'O' : 'X') * 4 + tttV962CenterScore(idx) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 32)
    .map(x => x.idx);
  const out = [];
  for (const idx of pool) {
    if (tttV965TimeUp(deadline, 24) && out.length) break;
    if (!tttV962Legal(board, idx)) continue;
    board[idx] = mark;
    const winNow = tttWinner(board).winner === mark;
    const wins = winNow ? 99 : tttV960WinningMoves(board, mark).length;
    const threats = tttV961ThreatEntries(board, mark);
    const gains = tttV961GainEntries(board, mark, deadline);
    const topThreat = threats[0] || null;
    const topGain = gains[0] || null;
    const severeThreats = tttV962StrongThreatCount(threats, 72);
    const forcedThreats = tttV962StrongThreatCount(threats, 104);
    const severeGains = tttV962StrongThreatCount(gains, 82);
    const run = tttV962LineRunAfterMove(board, idx, mark);
    const fork = typeof tttBestForkMove === 'function' && tttBestForkMove(board, mark) >= 0;
    const cheap = tttCheapMovePotential(board, idx, mark);
    const diagonal = !!((topThreat && topThreat.diagonal) || (topGain && topGain.diagonal));
    const exact = !!((topThreat && topThreat.exact) || (topGain && topGain.exact));
    const gap = !!((topThreat && topThreat.gap) || (topGain && topGain.gap));
    const endpoint = !!((topThreat && topThreat.endpoint) || (topGain && topGain.endpoint));
    board[idx] = '';

    let level = 0;
    if (winNow) level = 260;
    else if (wins >= 2) level = 232;
    else if (wins === 1 && severeThreats >= 1) level = 212;
    else if (wins === 1) level = 194;
    else if (forcedThreats >= 2 || fork) level = 176;
    else if (forcedThreats >= 1 && severeThreats >= 2) level = 164;
    else if (severeThreats >= 3) level = 154;
    else if (severeThreats >= 2 && severeGains >= 1) level = 146;
    else if (run >= 4 && (topThreat || topGain)) level = 142;
    else if (topThreat && Number(topThreat.level || 0) >= 84) level = 136;
    else if (topGain && Number(topGain.level || 0) >= 92) level = 130;
    else if (diagonal && topThreat && Number(topThreat.level || 0) >= 66) level = 120;
    else if (topThreat && Number(topThreat.level || 0) >= 68 && topGain && Number(topGain.level || 0) >= 68) level = 118;
    else if (run >= 3 && cheap >= 28) level = 104;
    if (level < 104) continue;

    out.push({
      idx,
      level,
      hits: wins * 1200 + forcedThreats * 500 + severeThreats * 160 + severeGains * 120 + run * 40 + Math.round(cheap),
      immediateWins: wins,
      severeThreats,
      severeGains,
      forcedThreats,
      forkMove: fork,
      diagonal,
      exact,
      gap,
      endpoint,
      kinds: ['v965-pressure'].concat(topThreat && topThreat.kinds ? topThreat.kinds.slice(0, 3) : [])
    });
  }
  return tttV962UniqueEntries(out);
}

function tttV965ReplyDanger(board, deadline) {
  const xPressure = tttV965PressureEntries(board, 'X', deadline);
  const xKillers = tttV962KillerEntries(board, 'X', deadline);
  const wins = tttV960WinningMoves(board, 'X').length;
  const threats = tttV961ThreatEntries(board, 'X');
  const topP = xPressure[0] || null;
  const topK = xKillers[0] || null;
  const topT = threats[0] || null;
  return wins * 1e30
    + (topK ? Number(topK.level || 0) * 8e25 + Number(topK.hits || 0) * 2e22 : 0)
    + (topP ? Number(topP.level || 0) * 5e24 + Number(topP.hits || 0) * 8e21 : 0)
    + (topT ? Number(topT.level || 0) * 4e23 + Number(topT.hits || 0) * 6e20 : 0)
    + tttV962PositionRisk(board, 'X', deadline) * 2.1;
}

function tttV965MoveScore(board, idx, deadline) {
  if (!tttV962Legal(board, idx)) return -Infinity;
  const safety = tttV962SafetyReport(board, idx, deadline);
  board[idx] = 'O';
  const ownWin = tttWinner(board).winner === 'O' ? 1 : 0;
  const ownPressure = tttV965PressureEntries(board, 'O', deadline);
  const xPressure = tttV965PressureEntries(board, 'X', deadline);
  const ownTop = ownPressure[0] || null;
  const xTop = xPressure[0] || null;
  let worstReply = 0;
  const replyPool = tttV962UniqueEntries(xPressure.concat(tttV962KillerEntries(board, 'X', deadline)).concat(tttV961GainEntries(board, 'X', deadline))).slice(0, 10);
  for (const e of replyPool) {
    if (tttV965TimeUp(deadline, 30) && worstReply > 0) break;
    const reply = Number(e.idx);
    if (!tttV962Legal(board, reply)) continue;
    board[reply] = 'X';
    const danger = (tttWinner(board).winner === 'X' ? 1e34 : 0)
      + tttV960WinningMoves(board, 'X').length * 8e31
      + tttV965ReplyDanger(board, deadline);
    board[reply] = '';
    if (danger > worstReply) worstReply = danger;
  }
  const xDanger = tttV965ReplyDanger(board, deadline);
  const oDanger = tttV962PositionRisk(board, 'O', deadline);
  board[idx] = '';
  return ownWin * 1e36
    - Number(safety.immediateLosses || 0) * 1e34
    - Number(safety.killerCount || 0) * 8e32
    - Number(safety.killerLevel || 0) * 7e29
    - xDanger * 2.8
    - worstReply * 0.72
    - (xTop ? Number(xTop.level || 0) * 6e27 + Number(xTop.hits || 0) * 2e24 : 0)
    + (ownTop ? Number(ownTop.level || 0) * 8e27 + Number(ownTop.hits || 0) * 2e24 : 0)
    + oDanger * 0.48
    + tttCheapMovePotential(board, idx, 'X') * 26000
    + tttCheapMovePotential(board, idx, 'O') * 18000
    + tttV962CenterScore(idx) * 5200;
}

function tttV965PickRoot(board, candidates, deadline) {
  const list = Array.from(new Set((candidates || []).map(Number).filter(idx => tttV962Legal(board, idx)))).slice(0, 36);
  let best = -1;
  let bestScore = -Infinity;
  let safest = -1;
  let safestScore = -Infinity;
  for (const idx of list) {
    if (tttV965TimeUp(deadline, 36) && best >= 0) break;
    const score = tttV965MoveScore(board, idx, deadline);
    const safety = tttV962SafetyReport(board, idx, deadline);
    board[idx] = 'O';
    const pressureAfter = tttV965PressureEntries(board, 'X', deadline)[0] || null;
    board[idx] = '';
    const safe = safety.ownWinNow || (!safety.immediateLosses && !safety.killerCount && Number(safety.killerLevel || 0) < 132 && (!pressureAfter || Number(pressureAfter.level || 0) < 146));
    if (score > bestScore) { bestScore = score; best = idx; }
    if (safe && score > safestScore) { safestScore = score; safest = idx; }
  }
  return safest >= 0 ? safest : best;
}

function tttV965BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  if (tttWinner(board).winner) return tttNearestCenterFallbackMove(board);
  const budget = tttV965Budget(difficulty || 'ai');
  const hardDeadline = tttV962Now() + Math.max(900, Number(budget.hard || TTT_V965_HARD_DEADLINE_MS) - 360);

  const ownWins = tttV960WinningMoves(board, 'O');
  if (ownWins.length) return ownWins[0];

  const xWins = tttV960WinningMoves(board, 'X');
  if (xWins.length) return xWins[0];

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }
  if (occupied <= 12 && typeof tttV962BestMove === 'function') {
    const quick = tttV962BestMove(board, difficulty || 'ai');
    if (tttV962Legal(board, quick)) return quick;
  }

  const currentX = tttV961ThreatEntries(board, 'X');
  const forcedX = currentX.filter(e => Number(e.level || 0) >= 104 || (e.diagonal && Number(e.level || 0) >= 76) || (e.exact && Number(e.level || 0) >= 78));
  if (forcedX.length) {
    const block = tttV962PickDefense(board, forcedX, hardDeadline);
    if (tttV962Legal(board, block)) return block;
  }

  const xPressure = tttV965PressureEntries(board, 'X', hardDeadline);
  const mustStop = xPressure.filter(e => Number(e.level || 0) >= 132 || Number(e.immediateWins || 0) >= 1 || Number(e.forcedThreats || 0) >= 1 || Number(e.severeThreats || 0) >= 2);
  if (mustStop.length) {
    const block = tttV962PickDefense(board, mustStop, hardDeadline);
    if (tttV962Legal(board, block)) return block;
  }

  const xKillers = tttV962KillerEntries(board, 'X', hardDeadline).filter(e => Number(e.level || 0) >= 120 || (e.diagonal && Number(e.level || 0) >= 104));
  if (xKillers.length) {
    const block = tttV962PickDefense(board, xKillers, hardDeadline);
    if (tttV962Legal(board, block)) return block;
  }

  const ownPressure = tttV965PressureEntries(board, 'O', hardDeadline).filter(e => Number(e.level || 0) >= 154);
  if (ownPressure.length) {
    const attack = tttV962PickDefense(board, ownPressure, hardDeadline);
    if (tttV962Legal(board, attack)) {
      const safety = tttV962SafetyReport(board, attack, hardDeadline);
      board[attack] = 'O';
      const replyDanger = tttV965ReplyDanger(board, hardDeadline);
      board[attack] = '';
      if (safety.ownWinNow || (!safety.immediateLosses && Number(safety.killerLevel || 0) < 176 && replyDanger < 1e31)) return attack;
    }
  }

  const candidates = tttV962CandidateSet(board, occupied < 30 ? 3 : 2)
    .map(idx => ({ idx, score: tttCheapMovePotential(board, idx, 'X') * 9.5 + tttCheapMovePotential(board, idx, 'O') * 7.5 + tttV962CenterScore(idx) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 30 ? 30 : 24)
    .map(x => x.idx);
  const verified = tttV965PickRoot(board, candidates, hardDeadline);
  if (tttV962Legal(board, verified)) return verified;

  const v962 = typeof tttV962BestMove === 'function' ? tttV962BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, v962)) return v962;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV965Health() {
  const budget = tttV965Budget('ai');
  return {
    ok: true,
    boardRows: TTT_ROWS,
    boardCols: TTT_COLS,
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    offlineAiOnly: true,
    onlinePvpUntouched: true,
    tacticalOpeningWinCheck: true,
    immediateLossBlock: true,
    multiImmediateLossBlock: true,
    diagonalThreatDefense: true,
    openThreeDefense: true,
    brokenThreeDefense: true,
    antiForkDefense: true,
    antiOpenFourBuilderDefense: true,
    strategicPressureDefense: true,
    twoPlyReplyDangerScan: true,
    candidateSafetyVerification: true,
    tacticalVerificationPly: 'v965 strategic pressure scan + top reply danger check',
    softDeadlineMs: Number(budget.soft || TTT_V965_SOFT_DEADLINE_MS),
    hardDeadlineMs: Number(budget.hard || TTT_V965_HARD_DEADLINE_MS),
    fallbackLegalMove: true,
    testedLocallyByScript: 'gomoku-ai-smoke-v965.js',
    note: 'v965 víc brání dlouhé přípravy X kolem 19.–31. tahu. Online PvP zůstává beze změny.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV965Health = getRakGomokuAiV965Health;
  window.getRakGomokuAiV962Health = getRakGomokuAiV965Health;
  window.getRakGomokuAiV961Health = getRakGomokuAiV965Health;
  window.getRakGomokuAiV960Health = getRakGomokuAiV965Health;
  window.getRakGomokuAiV959Health = getRakGomokuAiV965Health;
}

function tttBestMove(board, difficulty) {
  const next = typeof tttV965BestMove === 'function' ? tttV965BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, next)) return next;
  const win = tttV960WinningMoves(board, 'O')[0];
  if (tttV962Legal(board, win)) return win;
  const block = tttV960WinningMoves(board, 'X')[0];
  if (tttV962Legal(board, block)) return block;
  const prev = typeof tttV962BestMove === 'function' ? tttV962BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, prev)) return prev;
  return tttNearestCenterFallbackMove(board);
}


// v.1.5 (966) – Piškvorky AI: priorita vlastního forcing tahu před slabým blokem.
const TTT_V966_SOFT_DEADLINE_MS = 2050;
const TTT_V966_HARD_DEADLINE_MS = 4200;

function tttV966Budget(difficulty) {
  const prev = typeof tttV965Budget === 'function' ? tttV965Budget(difficulty || 'ai') : { soft: 1900, hard: 3800 };
  const lowEnd = !!(typeof document !== 'undefined' && document.body && document.body.classList && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lowEndDevice') || document.body.classList.contains('lightweightMode')));
  if (difficulty !== 'ai') return { soft: Math.max(520, Number(prev.soft || 0) || 0), hard: Math.max(900, Number(prev.hard || 0) || 0) };
  return lowEnd ? { soft: 1500, hard: 2800 } : { soft: TTT_V966_SOFT_DEADLINE_MS, hard: TTT_V966_HARD_DEADLINE_MS };
}

function tttV966TimeUp(deadline, margin) {
  return !!(deadline && tttV962Now() > deadline - (Number(margin || 0) || 0));
}

function tttV966CountLevel(entries, minLevel) {
  const seen = new Set();
  for (const e of entries || []) {
    if (!e || seen.has(e.idx)) continue;
    if (Number(e.level || 0) >= Number(minLevel || 0)) seen.add(e.idx);
  }
  return seen.size;
}

function tttV966MoveProfile(board, idx, mark, deadline) {
  if (!tttV962Legal(board, idx)) return null;
  board[idx] = mark;
  const winNow = tttWinner(board).winner === mark;
  const wins = winNow ? 99 : tttV960WinningMoves(board, mark).length;
  const threats = tttV961ThreatEntries(board, mark);
  const gains = tttV961GainEntries(board, mark, deadline);
  const pressure = typeof tttV965PressureEntries === 'function' ? tttV965PressureEntries(board, mark, deadline) : [];
  const topThreat = threats[0] || null;
  const topGain = gains[0] || null;
  const topPressure = pressure[0] || null;
  const run = typeof tttV962LineRunAfterMove === 'function' ? tttV962LineRunAfterMove(board, idx, mark) : 0;
  const severeThreats = tttV966CountLevel(threats, 84);
  const forcedThreats = tttV966CountLevel(threats, 110);
  const severeGains = tttV966CountLevel(gains, 92);
  const fork = typeof tttBestForkMove === 'function' && tttBestForkMove(board, mark) >= 0;
  board[idx] = '';
  const maxLevel = Math.max(Number(topThreat && topThreat.level || 0), Number(topGain && topGain.level || 0), Number(topPressure && topPressure.level || 0));
  return {
    idx,
    mark,
    winNow,
    wins,
    threats,
    gains,
    pressure,
    topThreat,
    topGain,
    topPressure,
    run,
    severeThreats,
    forcedThreats,
    severeGains,
    fork,
    maxLevel,
    diagonal: !!((topThreat && topThreat.diagonal) || (topGain && topGain.diagonal) || (topPressure && topPressure.diagonal)),
    exact: !!((topThreat && topThreat.exact) || (topGain && topGain.exact) || (topPressure && topPressure.exact)),
    gap: !!((topThreat && topThreat.gap) || (topGain && topGain.gap) || (topPressure && topPressure.gap)),
    hits: wins * 1600 + forcedThreats * 560 + severeThreats * 190 + severeGains * 150 + run * 55 + Number(topThreat && topThreat.hits || 0) + Number(topGain && topGain.hits || 0)
  };
}

function tttV966ForcingEntries(board, mark, deadline) {
  const occupied = typeof tttV960Occupied === 'function' ? tttV960Occupied(board) : board.filter(Boolean).length;
  const pool = new Set();
  const priority = new Set();
  const addPriority = (idx) => { const n = Number(idx); if (Number.isFinite(n)) { pool.add(n); priority.add(n); } };
  try { tttV961ThreatEntries(board, mark).slice(0, 52).forEach(e => addPriority(e.idx)); } catch (_) {}
  try { tttV961GainEntries(board, mark, deadline).slice(0, 42).forEach(e => addPriority(e.idx)); } catch (_) {}
  try { tttV965PressureEntries(board, mark, deadline).slice(0, 42).forEach(e => addPriority(e.idx)); } catch (_) {}
  try { tttV962KillerEntries(board, mark, deadline).slice(0, 34).forEach(e => addPriority(e.idx)); } catch (_) {}
  try { tttV962CandidateSet(board, occupied < 34 ? 3 : 2).forEach(idx => pool.add(Number(idx))); } catch (_) {}
  const candidates = Array.from(pool).map(Number).filter(idx => tttV962Legal(board, idx))
    .map(idx => ({
      idx,
      score: (priority.has(idx) ? 1e9 : 0)
        + tttCheapMovePotential(board, idx, mark) * 140
        + tttCheapMovePotential(board, idx, mark === 'X' ? 'O' : 'X') * 18
        + tttV962CenterScore(idx)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, occupied < 34 ? 56 : 44)
    .map(item => item.idx);
  const out = [];
  for (const idx of candidates) {
    if (tttV966TimeUp(deadline, 28) && out.length >= 8) break;
    const p = tttV966MoveProfile(board, idx, mark, deadline);
    if (!p) continue;
    let level = 0;
    if (p.winNow) level = 300;
    else if (p.wins >= 2) level = 276;                 // otevřená čtyřka / dvě koncovky
    else if (p.wins === 1 && (p.run >= 4 || p.severeThreats >= 1)) level = 244; // udělej čtyřku
    else if (p.wins === 1) level = 228;
    else if (p.forcedThreats >= 2 || p.fork) level = 206;
    else if (p.forcedThreats >= 1 && p.severeThreats >= 2) level = 190;
    else if (p.severeThreats >= 3) level = 178;
    else if (p.severeThreats >= 2 && p.severeGains >= 1) level = 166;
    else if (p.run >= 4 && p.maxLevel >= 84) level = 160;
    else if (p.maxLevel >= 136) level = 150;
    else if (p.run >= 3 && p.maxLevel >= 84) level = 134;
    if (level < 134) continue;
    out.push(Object.assign({}, p, {
      level,
      kinds: ['v966-forcing'],
      endpoint: !!(p.topThreat && p.topThreat.endpoint),
      immediateWins: p.wins
    }));
  }
  return tttV962UniqueEntries(out);
}

function tttV966PickForcingMove(board, entries, deadline) {
  const list = tttV962UniqueEntries(entries).filter(e => tttV962Legal(board, e.idx)).slice(0, 28);
  let best = -1;
  let bestScore = -Infinity;
  for (const e of list) {
    if (tttV966TimeUp(deadline, 30) && best >= 0) break;
    const idx = Number(e.idx);
    const safety = tttV962SafetyReport(board, idx, deadline);
    board[idx] = 'O';
    const xImmediate = tttV960WinningMoves(board, 'X').length;
    const ownImmediate = tttV960WinningMoves(board, 'O').length;
    const replyDanger = typeof tttV965ReplyDanger === 'function' ? tttV965ReplyDanger(board, deadline) : 0;
    const xPressure = typeof tttV965PressureEntries === 'function' ? tttV965PressureEntries(board, 'X', deadline)[0] : null;
    board[idx] = '';
    if (xImmediate > 0 && ownImmediate < 2) continue;
    const score = Number(e.level || 0) * 1e28
      + Number(e.hits || 0) * 1e24
      + ownImmediate * 8e31
      + (e.run || 0) * 6e25
      + (e.fork ? 8e27 : 0)
      + (e.diagonal ? 4e24 : 0)
      - Number(safety.immediateLosses || 0) * 1e34
      - Number(safety.killerCount || 0) * 6e31
      - Math.max(0, Number(safety.killerLevel || 0) - 176) * 4e28
      - (xPressure ? Math.max(0, Number(xPressure.level || 0) - 170) * 6e26 : 0)
      - replyDanger * 0.12
      + tttV962CenterScore(idx) * 4200;
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}


function tttV966DirectForcingEntries(board, mark, deadline) {
  const seeds = new Set();
  try { tttV961ThreatEntries(board, mark).slice(0, 38).forEach(e => seeds.add(Number(e.idx))); } catch (_) {}
  try { tttV960WinningMoves(board, mark).forEach(idx => seeds.add(Number(idx))); } catch (_) {}
  const opponent = mark === 'X' ? 'O' : 'X';
  try { tttV961ThreatEntries(board, opponent).slice(0, 16).forEach(e => seeds.add(Number(e.idx))); } catch (_) {}
  const out = [];
  for (const idx of Array.from(seeds).filter(idx => tttV962Legal(board, idx)).slice(0, 42)) {
    if (tttV966TimeUp(deadline, 16) && out.length) break;
    board[idx] = mark;
    const winNow = tttWinner(board).winner === mark;
    const wins = winNow ? 99 : tttV960WinningMoves(board, mark).length;
    const threats = tttV961ThreatEntries(board, mark);
    const top = threats[0] || null;
    const run = typeof tttV962LineRunAfterMove === 'function' ? tttV962LineRunAfterMove(board, idx, mark) : 0;
    const severe = tttV966CountLevel(threats, 84);
    const forced = tttV966CountLevel(threats, 110);
    board[idx] = '';
    if (!winNow && wins < 1 && forced < 2 && !(run >= 4 && top && Number(top.level || 0) >= 84)) continue;
    let level = 0;
    if (winNow) level = 320;
    else if (wins >= 2) level = 286;
    else if (wins === 1 && run >= 4) level = 252;
    else if (wins === 1) level = 232;
    else if (forced >= 2) level = 204;
    else if (run >= 4) level = 176;
    out.push({ idx, level, hits: wins * 2000 + forced * 480 + severe * 120 + run * 50 + (top ? Number(top.hits || 0) : 0), immediateWins: wins, run, forcedThreats: forced, severeThreats: severe, diagonal: !!(top && top.diagonal), endpoint: !!(top && top.endpoint), gap: !!(top && top.gap), exact: !!(top && top.exact), kinds: ['v966-direct-forcing'] });
  }
  return tttV962UniqueEntries(out);
}

function tttV966PickDirectForcing(board, entries, deadline) {
  const list = tttV962UniqueEntries(entries).filter(e => tttV962Legal(board, e.idx)).slice(0, 16);
  let best = -1;
  let bestScore = -Infinity;
  for (const e of list) {
    const idx = Number(e.idx);
    if (tttV966TimeUp(deadline, 18) && best >= 0) break;
    board[idx] = 'O';
    const xWins = tttV960WinningMoves(board, 'X').length;
    const oWins = tttV960WinningMoves(board, 'O').length;
    const xTop = tttV961ThreatEntries(board, 'X')[0] || null;
    board[idx] = '';
    if (xWins > 0 && oWins < 2) continue;
    const score = Number(e.level || 0) * 1e12
      + Number(e.hits || 0) * 1e8
      + oWins * 1e13
      - xWins * 1e14
      - (xTop ? Math.max(0, Number(xTop.level || 0) - 116) * 1e9 : 0)
      + tttV962CenterScore(idx) * 1000;
    if (score > bestScore) { bestScore = score; best = idx; }
  }
  return best;
}

function tttV966BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  if (tttWinner(board).winner) return tttNearestCenterFallbackMove(board);
  const budget = tttV966Budget(difficulty || 'ai');
  const hardDeadline = tttV962Now() + Math.max(900, Number(budget.hard || TTT_V966_HARD_DEADLINE_MS) - 520);

  const ownWins = tttV960WinningMoves(board, 'O');
  if (ownWins.length) return ownWins[0];

  const xWins = tttV960WinningMoves(board, 'X');
  if (xWins.length) return xWins[0];

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (opening >= 0 && !board[opening]) return opening;
  }

  const currentX = tttV961ThreatEntries(board, 'X');
  const xForcedFour = currentX.filter(e => Number(e.level || 0) >= 110);
  if (xForcedFour.length) {
    const block = Number(xForcedFour[0].idx);
    if (tttV962Legal(board, block)) return block;
  }

  // Rychlá prioritní vrstva: vlastní čtyřka / přímý forcing před blokem slabé trojky.
  const directOwn = tttV966DirectForcingEntries(board, 'O', hardDeadline).filter(e => Number(e.level || 0) >= 232 || Number(e.immediateWins || 0) >= 1);
  if (directOwn.length) {
    const attack = tttV966PickDirectForcing(board, directOwn, hardDeadline);
    if (tttV962Legal(board, attack)) return attack;
  }

  const directX = tttV966DirectForcingEntries(board, 'X', hardDeadline).filter(e => Number(e.level || 0) >= 252 || Number(e.immediateWins || 0) >= 2);
  if (directX.length) {
    const block = Number(directX[0].idx);
    if (tttV962Legal(board, block)) return block;
  }

  const v965 = typeof tttV965BestMove === 'function' ? tttV965BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, v965)) return v965;
  const v962 = typeof tttV962BestMove === 'function' ? tttV962BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, v962)) return v962;
  return tttNearestCenterFallbackMove(board);
}
function getRakGomokuAiV966Health() {
  const budget = tttV966Budget('ai');
  return {
    ok: true,
    boardRows: TTT_ROWS,
    boardCols: TTT_COLS,
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    offlineAiOnly: true,
    onlinePvpUntouched: true,
    tacticalOpeningWinCheck: true,
    immediateLossBlock: true,
    ownForcingBeforeWeakBlock: true,
    openFourAttack: true,
    blockedThreeDeprioritized: true,
    diagonalThreatDefense: true,
    openThreeDefense: true,
    brokenThreeDefense: true,
    candidateSafetyVerification: true,
    tacticalVerificationPly: 'v966 forcing priority layer over v965',
    softDeadlineMs: Number(budget.soft || TTT_V966_SOFT_DEADLINE_MS),
    hardDeadlineMs: Number(budget.hard || TTT_V966_HARD_DEADLINE_MS),
    fallbackLegalMove: true,
    testedLocallyByScript: 'gomoku-ai-smoke-v966.js',
    note: 'v966 dává vlastnímu forcing tahu přednost před blokem slabé nebo z jedné strany zavřené trojky. Online PvP zůstává beze změny.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV966Health = getRakGomokuAiV966Health;
  window.getRakGomokuAiV965Health = getRakGomokuAiV966Health;
  window.getRakGomokuAiV962Health = getRakGomokuAiV966Health;
  window.getRakGomokuAiV961Health = getRakGomokuAiV966Health;
  window.getRakGomokuAiV960Health = getRakGomokuAiV966Health;
}

function tttBestMove(board, difficulty) {
  const next = typeof tttV966BestMove === 'function' ? tttV966BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, next)) return next;
  const win = tttV960WinningMoves(board, 'O')[0];
  if (tttV962Legal(board, win)) return win;
  const block = tttV960WinningMoves(board, 'X')[0];
  if (tttV962Legal(board, block)) return block;
  const prev = typeof tttV965BestMove === 'function' ? tttV965BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, prev)) return prev;
  return tttNearestCenterFallbackMove(board);
}

// v.1.5 (983) – Piškvorky AI: tvrdší offline vrstva proti rychlým výhrám 17–27 tahů.
// Online PvP zůstává člověk proti člověku; tahle vrstva se používá jen v lokální AI cestě tttBestMove().
const TTT_V983_SOFT_DEADLINE_MS = 2450;
const TTT_V983_HARD_DEADLINE_MS = 4700;

function tttV983Budget(difficulty) {
  const prev = typeof tttV966Budget === 'function' ? tttV966Budget(difficulty || 'ai') : { soft: TTT_V966_SOFT_DEADLINE_MS, hard: TTT_V966_HARD_DEADLINE_MS };
  const lowEnd = !!(typeof document !== 'undefined' && document.body && document.body.classList && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lowEndDevice') || document.body.classList.contains('lightweightMode')));
  if (difficulty !== 'ai') return { soft: Math.max(520, Number(prev.soft || 0) || 0), hard: Math.max(900, Number(prev.hard || 0) || 0) };
  return lowEnd ? { soft: 1650, hard: 3100 } : { soft: TTT_V983_SOFT_DEADLINE_MS, hard: TTT_V983_HARD_DEADLINE_MS };
}

function tttV983UniqueMoves(list) {
  const out = [];
  const seen = new Set();
  (list || []).forEach((item) => {
    const idx = Number(item && typeof item === 'object' ? item.idx : item);
    if (!Number.isFinite(idx) || seen.has(idx)) return;
    seen.add(idx);
    out.push(item && typeof item === 'object' ? item : { idx });
  });
  return out;
}

function tttV983UrgentDefenseMove(board, deadline) {
  const entries = [];
  const push = (item, source) => {
    const idx = Number(item && typeof item === 'object' ? item.idx : item);
    if (!tttV962Legal(board, idx)) return;
    entries.push(Object.assign({ source }, item && typeof item === 'object' ? item : { idx }));
  };
  try { tttV960WinningMoves(board, 'X').forEach(idx => push({ idx, level: 999, immediateWins: 1 }, 'x-win')); } catch (_) {}
  try { tttV961ThreatEntries(board, 'X').slice(0, 18).forEach(e => push(e, 'x-threat')); } catch (_) {}
  if (!entries.some(e => Number(e.level || 0) >= 136 || Number(e.immediateWins || 0) > 0)) {
    try {
      const gainDeadline = Math.min(Number(deadline || 0) || (tttV962Now() + 260), tttV962Now() + 260);
      tttV961GainEntries(board, 'X', gainDeadline).slice(0, 8).forEach(e => push(e, 'x-gain'));
    } catch (_) {}
  }
  const urgent = tttV983UniqueMoves(entries)
    .filter(e => tttV962Legal(board, e.idx))
    .map((e) => {
      const idx = Number(e.idx);
      board[idx] = 'X';
      const xWinsAfter = tttV960WinningMoves(board, 'X').length;
      const xThreatsAfter = tttV961ThreatEntries(board, 'X');
      const xForcedAfter = typeof tttV966CountLevel === 'function' ? tttV966CountLevel(xThreatsAfter, 110) : 0;
      const xSevereAfter = typeof tttV966CountLevel === 'function' ? tttV966CountLevel(xThreatsAfter, 84) : 0;
      const xRun = typeof tttV962LineRunAfterMove === 'function' ? tttV962LineRunAfterMove(board, idx, 'X') : 0;
      board[idx] = '';
      board[idx] = 'O';
      const oWinsAfterBlock = tttV960WinningMoves(board, 'O').length;
      const xImmediateAfterBlock = tttV960WinningMoves(board, 'X').length;
      board[idx] = '';
      const baseLevel = Number(e.level || 0) || 0;
      const score = xWinsAfter * 1e18
        + xForcedAfter * 9e15
        + xSevereAfter * 4e14
        + Math.max(0, baseLevel - 70) * 2e12
        + xRun * 7e12
        + (e.exact ? 5e12 : 0)
        + (e.gap ? 3e12 : 0)
        + (e.diagonal ? 2e12 : 0)
        + tttCheapMovePotential(board, idx, 'X') * 9e9
        + tttCheapMovePotential(board, idx, 'O') * 3e9
        + tttV962CenterScore(idx) * 12000
        + oWinsAfterBlock * 8e13
        - xImmediateAfterBlock * 4e17;
      return Object.assign({}, e, { idx, score, xWinsAfter, xForcedAfter, xSevereAfter, xRun, oWinsAfterBlock, xImmediateAfterBlock });
    })
    .filter(e => e.xWinsAfter > 0 || e.xForcedAfter >= 1 || e.xSevereAfter >= 2 || Number(e.level || 0) >= 128)
    .sort((a, b) => b.score - a.score);
  const best = urgent[0];
  return best && tttV962Legal(board, best.idx) ? Number(best.idx) : -1;
}

function tttV983ValidatedCandidate(board, candidate, deadline) {
  const idx = Number(candidate);
  if (!tttV962Legal(board, idx)) return -1;
  const safetyDeadline = Math.min(Number(deadline || 0) || (tttV962Now() + 650), tttV962Now() + 650);
  const safety = typeof tttV962SafetyReport === 'function' ? tttV962SafetyReport(board, idx, safetyDeadline) : { immediateLosses: 0, killerCount: 0, killerLevel: 0 };
  if (Number(safety.immediateLosses || 0) > 0) return -1;
  if (Number(safety.killerCount || 0) > 1 && Number(safety.killerLevel || 0) >= 206) return -1;
  return idx;
}

function tttV983BestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) if (!board[i]) free.push(i);
  if (!free.length) return -1;
  if (tttWinner(board).winner) return tttNearestCenterFallbackMove(board);
  const budget = tttV983Budget(difficulty || 'ai');
  const hardDeadline = tttV962Now() + Math.max(1000, Number(budget.hard || TTT_V983_HARD_DEADLINE_MS) - 560);

  const ownWins = tttV960WinningMoves(board, 'O');
  if (ownWins.length) return ownWins[0];
  const xWins = tttV960WinningMoves(board, 'X');
  if (xWins.length) return xWins[0];

  const occupied = board.length - free.length;
  if (occupied <= 1) {
    const opening = tttPromptEngineOpeningMove(board);
    if (tttV962Legal(board, opening)) return opening;
  }

  // Nejdřív zkus vlastní silný forcing, ale jen když nezpůsobí okamžitou ztrátu.
  try {
    const ownForce = tttV966DirectForcingEntries(board, 'O', hardDeadline)
      .filter(e => Number(e.level || 0) >= 232 || Number(e.immediateWins || 0) >= 1);
    const attack = tttV966PickDirectForcing(board, ownForce, hardDeadline);
    const attackInfo = ownForce.find(e => Number(e && e.idx) === Number(attack)) || null;
    if (tttV962Legal(board, attack) && attackInfo && (Number(attackInfo.immediateWins || 0) >= 2 || Number(attackInfo.level || 0) >= 286)) return attack;
    const safeAttack = tttV983ValidatedCandidate(board, attack, hardDeadline);
    if (tttV962Legal(board, safeAttack)) return safeAttack;
  } catch (_) {}

  const urgentDefense = tttV983UrgentDefenseMove(board, hardDeadline);
  if (tttV962Legal(board, urgentDefense)) return urgentDefense;

  const v966 = typeof tttV966BestMove === 'function' ? tttV966BestMove(board, difficulty || 'ai') : -1;
  const safeV966 = tttV983ValidatedCandidate(board, v966, hardDeadline);
  if (tttV962Legal(board, safeV966)) return safeV966;

  const fallbackDefense = tttV983UrgentDefenseMove(board, hardDeadline);
  if (tttV962Legal(board, fallbackDefense)) return fallbackDefense;

  if (tttV962Legal(board, v966)) return v966;
  const v965 = typeof tttV965BestMove === 'function' ? tttV965BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, v965)) return v965;
  return tttNearestCenterFallbackMove(board);
}

function getRakGomokuAiV983Health() {
  const budget = tttV983Budget('ai');
  return {
    ok: true,
    boardRows: TTT_ROWS,
    boardCols: TTT_COLS,
    board: { rows: TTT_ROWS, cols: TTT_COLS, total: TTT_TOTAL_CELLS },
    rulesetVersion: GOMOKU_RULESET_VERSION,
    offlineAiOnly: true,
    onlinePvpUntouched: true,
    urgentDefenseLayer: true,
    validatedForcingAttack: true,
    fastWinDefenseTarget: 'výhry 17–27 tahů',
    softDeadlineMs: Number(budget.soft || TTT_V983_SOFT_DEADLINE_MS),
    hardDeadlineMs: Number(budget.hard || TTT_V983_HARD_DEADLINE_MS),
    fallbackLegalMove: true,
    testedLocallyByScript: 'gomoku-ai-smoke-v966.js',
    note: 'v983 přidává tvrdší obrannou vrstvu proti gain/fork/forcing tahům člověka před původní v966 vrstvu. Online PvP zůstává beze změny.'
  };
}
if (typeof window !== 'undefined') {
  window.getRakGomokuAiV983Health = getRakGomokuAiV983Health;
  window.getRakGomokuAiV966Health = getRakGomokuAiV983Health;
  window.getRakGomokuAiV965Health = getRakGomokuAiV983Health;
  window.getRakGomokuAiV962Health = getRakGomokuAiV983Health;
  window.getRakGomokuAiV961Health = getRakGomokuAiV983Health;
  window.getRakGomokuAiV960Health = getRakGomokuAiV983Health;
}

function tttBestMove(board, difficulty) {
  const next = typeof tttV983BestMove === 'function' ? tttV983BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, next)) return next;
  const win = tttV960WinningMoves(board, 'O')[0];
  if (tttV962Legal(board, win)) return win;
  const block = tttV960WinningMoves(board, 'X')[0];
  if (tttV962Legal(board, block)) return block;
  const prev = typeof tttV966BestMove === 'function' ? tttV966BestMove(board, difficulty || 'ai') : -1;
  if (tttV962Legal(board, prev)) return prev;
  return tttNearestCenterFallbackMove(board);
}

function tttHardWinLog() {
  return [];
}

function tttSaveHardWin(entry) {
  void entry;
}

function tttFormatElapsed(ms) {
  const total = Math.max(0, Number(ms) || 0);
  const seconds = total > 0 ? Math.max(1, Math.floor(total / 1000)) : 0;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes <= 0) return secs + ' s';
  return minutes + ' min ' + String(secs).padStart(2, '0') + ' s';
}

function tttEnsureGameClockStarted(state) {
  const s = state || tttGetState();
  if (!s.startedAt || !Number.isFinite(Number(s.startedAt))) {
    s.startedAt = Date.now();
  }
  return s.startedAt;
}

function tttGetElapsedMs(state) {
  const s = state || tttGetState();
  const start = Number(s.startedAt || 0) || 0;
  if (!start) return 0;
  return Math.max(0, Date.now() - start);
}

function tttReadHardWinStats() {
  const state = tttGetState();
  const elapsedMs = tttGetElapsedMs(state);
  return {
    totalMoves: state.moveCount || 0,
    xMoves: state.moveCountX || 0,
    oMoves: state.moveCountO || 0,
    elapsedMs,
    elapsedText: tttFormatElapsed(elapsedMs)
  };
}

function tttHardWinKey(entry) {
  return [
    String(entry && entry.name ? entry.name : '').trim().toLowerCase(),
    String(entry && entry.date ? entry.date : '').trim(),
    String(entry && entry.difficulty ? entry.difficulty : '').trim().toLowerCase(),
    String(entry && (entry.totalMoves ?? entry.moves) ? (entry.totalMoves ?? entry.moves) : 0),
    String(entry && (entry.elapsedMs ?? entry.elapsed_ms) ? (entry.elapsedMs ?? entry.elapsed_ms) : 0)
  ].join('|');
}

function tttNormalizeHardWinEntry(entry) {
  const elapsedMs = Number(entry && (entry.elapsedMs ?? entry.elapsed_ms) ? (entry.elapsedMs ?? entry.elapsed_ms) : 0) || 0;
  const elapsedText = String(entry && (entry.elapsedText ?? entry.elapsed_text) ? (entry.elapsedText ?? entry.elapsed_text) : '').trim() || tttFormatElapsed(elapsedMs);
  return {
    name: String(entry && (entry.name ?? entry.player_name) ? (entry.name ?? entry.player_name) : '').trim(),
    difficulty: String(entry && entry.difficulty ? entry.difficulty : '').trim(),
    totalMoves: Number(entry && (entry.totalMoves ?? entry.moves) ? (entry.totalMoves ?? entry.moves) : 0) || 0,
    xMoves: Number(entry && (entry.xMoves ?? entry.x_moves) ? (entry.xMoves ?? entry.x_moves) : 0) || 0,
    oMoves: Number(entry && (entry.oMoves ?? entry.o_moves) ? (entry.oMoves ?? entry.o_moves) : 0) || 0,
    elapsedMs,
    elapsedText,
    date: String(entry && (entry.date ?? entry.created_at) ? (entry.date ?? entry.created_at) : '').trim(),
    appVersion: String(entry && (entry.appVersion ?? entry.app_version) ? (entry.appVersion ?? entry.app_version) : '').trim(),
    rulesetVersion: String(entry && (entry.rulesetVersion ?? entry.ruleset_version) ? (entry.rulesetVersion ?? entry.ruleset_version) : GOMOKU_RULESET_VERSION).trim() || GOMOKU_RULESET_VERSION,
    note: String(entry && entry.note ? entry.note : '').trim()
  };
}

function tttGetHardWinRows() {
  const state = tttGetState();
  const remote = Array.isArray(state.hardWinRemote) ? state.hardWinRemote : [];

  const currentRuleset = String(GOMOKU_RULESET_VERSION || '').trim();
  const normalized = remote
    .map(tttNormalizeHardWinEntry)
    .filter(entry => entry.name)
    .filter(entry => !currentRuleset || String(entry.rulesetVersion || '').trim() === currentRuleset);

  normalized.sort((a, b) => {
    const moveDiff = (a.totalMoves || 0) - (b.totalMoves || 0);
    if (moveDiff) return moveDiff;
    const timeDiff = (a.elapsedMs || 0) - (b.elapsedMs || 0);
    if (timeDiff) return timeDiff;
    return String(b.date || '').localeCompare(String(a.date || ''));
  });

  return normalized.slice(0, 10);
}

function tttUpdateDashboardMeta() {
  const el = document.getElementById('dashTttMeta');
  if (!el) return;
  el.classList.remove('isLoading');
  el.textContent = '';
}

async function tttRefreshHardWinRows(forceRender) {
  const state = tttGetState();
  if (state.hardWinLoading) return state.hardWinRemote || [];
  state.hardWinLoading = true;
  tttUpdateDashboardMeta();
  tttRender();
  try {
    if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadGomokuWins === 'function') {
      const rows = await window.RotationSupabaseBridge.loadGomokuWins(25, { rulesetVersion: GOMOKU_RULESET_VERSION });
      state.hardWinRemote = Array.isArray(rows) ? rows : [];
    }
    state.hardWinLoaded = true;
  } catch (err) {
    console.error('TTT leaderboard load failed', err);
    state.hardWinLoaded = true;
  } finally {
    state.hardWinLoading = false;
    tttUpdateDashboardMeta();
  }
  if (forceRender !== false && document.getElementById('tttOverlay')?.classList.contains('isVisible')) {
    tttRender();
  }
  return state.hardWinRemote || [];
}

function tttFormatHardWinDateTime(value) {
  if (typeof gamesFormatPlayedLabel === 'function') return gamesFormatPlayedLabel(value);
  const raw = String(value || '').trim();
  if (!raw) return '';
  const d = new Date(raw);
  if (!Number.isFinite(d.getTime())) return raw;
  try {
    return new Intl.DateTimeFormat('cs-CZ', {
      timeZone: 'Europe/Prague',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);
  } catch (err) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear());
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return dd + '.' + mm + '.' + yy + ' ' + hh + ':' + mi;
  }
}

function tttBuildHardWinTableHtml() {
  const state = tttGetState();
  const rows = tttGetHardWinRows();
  if (state.hardWinLoading && !rows.length) {
    return '<div class="smallText">Načítám online výsledky…</div>';
  }
  if (!rows.length) {
    return '<div class="smallText">Zatím žádné online výsledky.</div>';
  }

  const rowsHtml = rows.map((row, idx) => {
    const dateText = row.date ? tttFormatHardWinDateTime(row.date) : '—';
    return '<tr>' +
      '<td>' + escapeHtml(String(idx + 1)) + '</td>' +
      '<td>' + escapeHtml(row.name || '—') + '</td>' +
      '<td>' + escapeHtml(formatCount(row.totalMoves || 0)) + '</td>' +
      '<td>' + escapeHtml(row.elapsedText || '—') + '</td>' +
      '<td>' + escapeHtml(dateText || '—') + '</td>' +
      '</tr>';
  }).join('');

  return [
    '<div class="tableWrap tttWinHistory">',
    '  <table class="tttWinTable">',
    '    <thead><tr><th>#</th><th>Jméno</th><th>Tahy</th><th>Čas</th><th>Datum a čas</th></tr></thead>',
    '    <tbody>' + rowsHtml + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
}


function tttNormalizeOnlineScoreRow(row) {
  const a = String(row && (row.playerA || row.player_a || row.a || row.account_a) || '').trim();
  const b = String(row && (row.playerB || row.player_b || row.b || row.account_b) || '').trim();
  if (!a || !b || a === b) return null;
  return {
    playerA: a,
    playerB: b,
    nameA: String(row && (row.nameA || row.name_a) || '').trim() || tttGetAccountDisplayName(a),
    nameB: String(row && (row.nameB || row.name_b) || '').trim() || tttGetAccountDisplayName(b),
    aWins: Number(row && (row.aWins ?? row.a_wins) || 0) || 0,
    bWins: Number(row && (row.bWins ?? row.b_wins) || 0) || 0,
    draws: Number(row && row.draws || 0) || 0,
    total: Number(row && row.total || 0) || 0,
    lastPlayedAt: String(row && (row.lastPlayedAt || row.last_played_at || row.updated_at) || '').trim()
  };
}

function tttBuildOnlineScoreTableHtml() {
  const state = tttGetState();
  const rows = Array.isArray(state.onlineScoreRemote) ? state.onlineScoreRemote.map(tttNormalizeOnlineScoreRow).filter(Boolean) : [];
  if (state.onlineScoreLoading && !rows.length) {
    return '<div class="smallText">Načítám online skóre…</div>';
  }
  if (!rows.length) {
    return '<div class="smallText">Zatím tu nejsou žádné dokončené online duely mezi hráči.</div>';
  }
  const rowsHtml = rows.slice(0, 12).map((row, idx) => {
    const draws = row.draws ? (' · remízy ' + escapeHtml(formatCount(row.draws))) : '';
    return '<tr>' +
      '<td>' + escapeHtml(String(idx + 1)) + '</td>' +
      '<td>' + escapeHtml(row.nameA || row.playerA) + '</td>' +
      '<td><strong>' + escapeHtml(formatCount(row.aWins)) + ':' + escapeHtml(formatCount(row.bWins)) + '</strong>' + draws + '</td>' +
      '<td>' + escapeHtml(row.nameB || row.playerB) + '</td>' +
      '<td>' + escapeHtml(formatCount(row.total || 0)) + '</td>' +
      '</tr>';
  }).join('');
  return [
    '<div class="tableWrap tttWinHistory tttOnlineScoreHistory">',
    '  <table class="tttWinTable tttOnlineScoreTable">',
    '    <thead><tr><th>#</th><th>Hráč A</th><th>Skóre</th><th>Hráč B</th><th>Her</th></tr></thead>',
    '    <tbody>' + rowsHtml + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
}

async function tttRefreshOnlineScoreRows(forceRender) {
  const state = tttGetState();
  if (state.onlineScoreLoading) return state.onlineScoreRemote || [];
  state.onlineScoreLoading = true;
  if (forceRender !== false && document.getElementById('tttOverlay')?.classList.contains('isVisible') && state.screen === 'start' && state.mode === 'pvp') {
    tttRender();
  }
  try {
    if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadTttHeadToHeadList === 'function') {
      const result = await window.RotationSupabaseBridge.loadTttHeadToHeadList({ force: !!forceRender, limit: 150 });
      const rows = result && Array.isArray(result.rows) ? result.rows : (Array.isArray(result) ? result : []);
      state.onlineScoreRemote = rows;
    }
    state.onlineScoreLoaded = true;
    state.onlineScoreLoadedAt = Date.now();
  } catch (err) {
    console.warn('TTT online score list load failed', err);
    state.onlineScoreLoaded = true;
    state.onlineScoreLoadedAt = Date.now();
  } finally {
    state.onlineScoreLoading = false;
  }
  if (forceRender !== false && document.getElementById('tttOverlay')?.classList.contains('isVisible') && state.screen === 'start' && state.mode === 'pvp') {
    tttRender();
  }
  return state.onlineScoreRemote || [];
}

function tttBuildStartLeaderboardHtml() {
  const state = tttGetState();
  if (state.mode === 'ai') {
    return [
      '<div class="tttCard tttWinHistory">',
      '  <div class="tttSectionTitle">Kdo porazil AI</div>',
      '  <div class="tttNote">Žebříček online · aktuální pravidla Piškvorek.</div>',
      '  ' + tttBuildHardWinTableHtml(),
      '</div>'
    ].join('');
  }
  if (state.mode === 'pvp') {
    return [
      '<div class="tttCard tttWinHistory tttOnlineScoreCard">',
      '  <div class="tttSectionTitle">Online vzájemné skóre</div>',
      '  <div class="tttNote">Zobrazují se jen dvojice hráčů, které už proti sobě odehrály online partii.</div>',
      '  ' + tttBuildOnlineScoreTableHtml(),
      '</div>'
    ].join('');
  }
  return '';
}

function tttFillHardWinPrompt() {
  const overlay = document.getElementById('tttOverlay');
  if (!overlay) return;
  const state = tttGetState();
  const modal = overlay.querySelector('#tttWinModal');
  const visible = !!state.hardWinPrompt && !!state.hardWinStats;

  if (!modal) return;
  modal.style.display = visible ? 'flex' : 'none';
  modal.classList.toggle('isVisible', visible);
  if (!visible) return;

  const stats = state.hardWinStats || tttReadHardWinStats();
  const nameInput = overlay.querySelector('#tttWinName');
  const movesEl = overlay.querySelector('#tttWinMoves');
  const timeEl = overlay.querySelector('#tttWinTime');
  const modeEl = overlay.querySelector('#tttWinMode');

  if (nameInput) {
    const remembered = state.hardWinName || (typeof getLocalStorageCached === 'function' ? getLocalStorageCached('tttHardWinName', '') : localStorage.getItem('tttHardWinName')) || '';
    if (!nameInput.value) nameInput.value = remembered;
    state.hardWinName = nameInput.value;
  }
  if (movesEl) movesEl.textContent = formatCount(stats.totalMoves) + ' tahů';
  if (timeEl) timeEl.textContent = stats.elapsedText;
  if (modeEl) modeEl.textContent = state.mode === 'ai'
    ? ('AI · ' + (state.difficulty === 'ai' ? 'nejtěžší' : state.difficulty))
    : 'Proti spoluhráči';
}

function tttCloseHardWinPrompt() {
  const state = tttGetState();
  state.hardWinPrompt = false;
  state.hardWinStats = null;
  tttRender();
  scheduleTttLayout();
}

function tttOpenHardWinPrompt() {
  void tttSubmitHardWin();
}

async function tttSendHardWinEntry(entry) {
  try {
    if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.sendGomokuWin === 'function') {
      const result = await window.RotationSupabaseBridge.sendGomokuWin(entry);
      if (!result || result.ok !== true) {
        console.error('TTT online save failed', result && result.error ? result.error : result);
        return result || { ok: false, reason: 'unknown' };
      }
      return result;
    }
    return { ok: false, reason: 'missing-bridge' };
  } catch (err) {
    console.error('TTT online save failed', err);
    return { ok: false, error: err };
  }
}

async function tttSubmitHardWin() {
  const state = tttGetState();
  const fallbackName = String(gamesGetActiveAccount()?.name || state.hardWinName || (typeof getLocalStorageCached === 'function' ? getLocalStorageCached('tttHardWinName', '') : localStorage.getItem('tttHardWinName')) || 'Hráč').trim() || 'Hráč';
  state.hardWinName = fallbackName;
  try {
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged('tttHardWinName', fallbackName);
    else localStorage.setItem('tttHardWinName', fallbackName);
  } catch (err) {
    console.warn(err);
  }

  const stats = state.hardWinStats || tttReadHardWinStats();
  const entry = {
    name: fallbackName,
    date: new Date().toISOString(),
    mode: state.mode,
    difficulty: state.difficulty,
    totalMoves: stats.totalMoves,
    xMoves: stats.xMoves,
    oMoves: stats.oMoves,
    elapsedMs: stats.elapsedMs,
    elapsedText: stats.elapsedText,
    rulesetVersion: GOMOKU_RULESET_VERSION,
    note: 'Výhra nad nejtvrdší AI'
  };

  const result = await tttSendHardWinEntry(entry);
  await new Promise(resolve => setTimeout(resolve, 120));

  if (result && result.ok === false) {
    console.warn('TTT hard win save failed', result.error || result.reason || result);
    return;
  }

  const current = tttGetState();
  current.resultOnlineSaved = true;
  current.resultSaved = true;
  current.resultSummary = tttBuildResultSummary(current.winner || 'X');
  await tttRefreshHardWinRows(true);
  if (typeof tttRender === 'function') tttRender();
}


function getRakGomokuRulesetLeaderboardHealth() {
  const state = tttGetState();
  const rows = Array.isArray(state.hardWinRemote) ? state.hardWinRemote.map(tttNormalizeHardWinEntry).filter(Boolean) : [];
  const currentRuleset = String(GOMOKU_RULESET_VERSION || '').trim();
  const visibleRows = rows.filter(row => !currentRuleset || String(row.rulesetVersion || '').trim() === currentRuleset);
  return {
    ok: true,
    version: window.APP_VERSION || 'v.1.5 (963)',
    game: 'ttt',
    rulesetVersion: currentRuleset,
    appVersionIsSeparate: true,
    remoteRowsLoaded: rows.length,
    visibleCurrentRulesetRows: visibleRows.length,
    loadFilter: 'supabase gomoku_wins.ruleset_version = ' + currentRuleset,
    sort: 'UI sorts by moves, elapsedMs, created_at; Supabase query orders by created_at only',
    note: 'Ruleset verzi zvyšovat jen při změně AI obtížnosti/pravidel, ne při vzhledové úpravě aplikace.'
  };
}
if (typeof window !== 'undefined') window.getRakGomokuRulesetLeaderboardHealth = getRakGomokuRulesetLeaderboardHealth;


function tttBuildResultSummary(winner) {
  const state = tttGetState();
  const stats = tttReadHardWinStats();
  const title = winner === 'draw'
    ? 'Remíza'
    : (winner === 'X' ? (state.mode === 'ai' ? 'Vyhrál jsi nad AI' : 'Vyhrál hráč X') : (state.mode === 'ai' ? 'Vyhrála AI' : 'Vyhrál hráč O'));
  const detail = winner === 'draw'
    ? 'Nikdo nedal pět v řadě.'
    : (winner === 'X'
      ? 'Pětice X je zvýrazněná přímo v mřížce.'
      : 'Pětice O je zvýrazněná přímo v mřížce.');
  return {
    title,
    detail,
    moves: stats.totalMoves,
    xMoves: stats.xMoves,
    oMoves: stats.oMoves,
    elapsedText: stats.elapsedText,
    savedText: state.resultOnlineSaved ? 'Zapsáno online i do profilu.' : (state.resultSaved ? 'Zapsáno do profilu. Online se případně dosynchronizuje.' : 'Výsledek čeká na zápis.')
  };
}

function tttMarkResultSaved(winner) {
  const state = tttGetState();
  state.resultSaved = true;
  state.resultSummary = tttBuildResultSummary(winner);
}

function tttRenderResultCard(overlay, winner) {
  const card = overlay ? overlay.querySelector('#tttResultCard') : null;
  if (!card) return;
  const state = tttGetState();
  if (!state.gameOver || !winner) {
    card.hidden = true;
    card.classList.remove('isVisible', 'isWin', 'isLoss', 'isDraw');
    card.textContent = '';
    return;
  }
  const summary = state.resultSummary || tttBuildResultSummary(winner);
  state.resultSummary = summary;
  card.hidden = false;
  card.classList.add('isVisible');
  card.classList.toggle('isWin', winner === 'X');
  card.classList.toggle('isLoss', winner === 'O');
  card.classList.toggle('isDraw', winner === 'draw');
  const rows = [
    ['Tahy', String(summary.moves || 0)],
    ['X / O', String(summary.xMoves || 0) + ' / ' + String(summary.oMoves || 0)],
    ['Čas', summary.elapsedText || '0 s']
  ];
  const fragment = document.createDocumentFragment();
  const title = document.createElement('div');
  title.className = 'tttResultTitle';
  title.textContent = summary.title || 'Konec hry';
  fragment.appendChild(title);
  const detail = document.createElement('div');
  detail.className = 'tttResultDetail';
  detail.textContent = summary.detail || '';
  fragment.appendChild(detail);
  const grid = document.createElement('div');
  grid.className = 'tttResultStats';
  rows.forEach(([label, value]) => {
    const item = document.createElement('div');
    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    const valueEl = document.createElement('strong');
    valueEl.textContent = value;
    item.appendChild(labelEl);
    item.appendChild(valueEl);
    grid.appendChild(item);
  });
  fragment.appendChild(grid);
  const saved = document.createElement('div');
  saved.className = 'tttResultSaved';
  saved.textContent = summary.savedText || '';
  fragment.appendChild(saved);

  const actions = document.createElement('div');
  actions.className = 'tttResultActions';
  const restartBtn = document.createElement('button');
  restartBtn.type = 'button';
  restartBtn.className = 'tttBtn tttResultRestartBtn';
  restartBtn.textContent = 'Nová hra';
  restartBtn.addEventListener('click', () => resetTicTacToeGame(true));
  actions.appendChild(restartBtn);
  fragment.appendChild(actions);

  if (typeof replaceElementChildrenSafely === 'function') replaceElementChildrenSafely(card, fragment, 'ttt-result-summary');
  else {
    while (card.firstChild) card.removeChild(card.firstChild);
    card.appendChild(fragment);
  }
}



function tttRenderGridBoard(boardEl, state, winnerLine) {
  if (!boardEl || !state || !Array.isArray(state.board)) return;
  const lineSet = new Set(Array.isArray(winnerLine) ? winnerLine : []);
  const fragment = document.createDocumentFragment();
  for (let idx = 0; idx < state.board.length; idx += 1) {
    const cell = state.board[idx] || '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tttCell';
    btn.dataset.tttCell = String(idx);
    btn.dataset.tttRow = String(Math.floor(idx / TTT_COLS));
    btn.dataset.tttCol = String(idx % TTT_COLS);
    btn.setAttribute('aria-label', cell ? ('Pole ' + (idx + 1) + ': ' + cell) : ('Prázdné pole ' + (idx + 1)));
    if (cell) {
      btn.classList.add('isFilled');
      if (cell === 'X') {
        btn.classList.add('isX');
        btn.style.setProperty('color', '#FF073A', 'important');
        btn.style.setProperty('text-shadow', '0 0 3px rgba(255,255,255,.98), 0 0 10px rgba(255,7,58,1), 0 0 24px rgba(255,7,58,.98), 0 0 46px rgba(255,0,48,.78)', 'important');
      }
      if (cell === 'O') {
        btn.classList.add('isO');
        btn.style.setProperty('color', '#39FF14', 'important');
        btn.style.setProperty('text-shadow', '0 0 3px rgba(255,255,255,.98), 0 0 10px rgba(57,255,20,1), 0 0 24px rgba(57,255,20,.98), 0 0 46px rgba(57,255,20,.78)', 'important');
      }
      btn.textContent = cell;
    }
    if (Number(state.lastMoveIndex) === idx) btn.classList.add('isLastMove');
    if (lineSet.has(idx)) btn.classList.add('isWinner');
    btn.addEventListener('click', () => tttHandleMove(idx));
    fragment.appendChild(btn);
  }
  if (typeof replaceElementChildrenSafely === 'function') {
    replaceElementChildrenSafely(boardEl, fragment, 'ttt-grid-board');
  } else {
    while (boardEl.firstChild) boardEl.removeChild(boardEl.firstChild);
    boardEl.appendChild(fragment);
  }
}

function tttRender() {
  const overlay = ensureTicTacToeOverlay();
  const state = tttGetState();
  const start = overlay.querySelector('#tttStartScreen');
  const game = overlay.querySelector('#tttGameScreen');
  const status = overlay.querySelector('#tttStatus');
  const boardEl = overlay.querySelector('#tttBoard');
  const onlineInfo = overlay.querySelector('#tttOnlineGameInfo');

  const tttHasResumeGame = () => {
    if (state.gameOver) return false;
    return state.mode === 'pvp' && !!(state.online && state.online.code);
  };

  if (state.screen === 'start') {
    if (start) start.classList.remove('uHidden');
    if (game) game.classList.add('uHidden');
    start.style.display = 'flex';
    game.style.display = 'none';
    start.innerHTML = [
      '<div class="tttCard tttModeCard">',
      '  <div class="tttSectionTitle">Režim hry</div>',
      '  <div class="tttToggleRow">',
      '    <button type="button" class="tttBtn' + (state.mode === 'ai' ? ' isActive' : '') + '" data-ttt-mode="ai">Proti AI</button>',
      '    <button type="button" class="tttBtn' + (state.mode === 'local' ? ' isActive' : '') + '" data-ttt-mode="local">Na jednom mobilu</button>',
      '    <button type="button" class="tttBtn' + (state.mode === 'pvp' ? ' isActive' : '') + '" data-ttt-mode="pvp">Online</button>',
      '  </div>',
      '</div>',
      state.mode !== 'pvp' ? '<div class="tttCard tttActionCard"><div class="tttSectionTitle">Hrát</div><button type="button" class="tttBtn tttPrimaryBtn" id="tttStartBtn">' + (state.mode === 'local' ? 'Hrát na mobilu' : 'Hrát proti AI') + '</button>' + (tttHasResumeGame() ? '<button type="button" class="tttBtn tttSecondaryBtn" id="tttResumeBtn">Pokračovat v rozehrané hře</button>' : '') + '</div>' : '',
      state.mode === 'pvp' ? '<div class="tttCard tttInviteCard"><div class="tttSectionTitle">Online</div><div class="tttToggleRow tttInviteActions"><button type="button" class="tttBtn tttPrimaryBtn" id="tttCreateInviteBtn">Vytvořit hru</button><button type="button" class="tttBtn" id="tttJoinInviteBtn">Přijmout pozvánku</button></div></div>' : '',
      tttBuildStartLeaderboardHtml()
    ].join('');

    start.querySelectorAll('[data-ttt-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextMode = btn.getAttribute('data-ttt-mode') || 'ai';
        tttSwitchModeClean(nextMode);
        if (nextMode === 'pvp') {
          const currentState = tttGetState();
          currentState.onlineScoreLoaded = false;
          currentState.onlineScoreLoadedAt = 0;
        }
        tttRender();
        scheduleTttLayout();
        if (nextMode === 'pvp') void tttRefreshOnlineScoreRows(true);
      });
    });
    const inviteInfo = () => start.querySelector('#tttInviteInfo');
    start.querySelector('#tttCreateInviteBtn')?.addEventListener('click', async () => {
      try {
        const result = await tttCreateInviteSession();
        const info = inviteInfo();
        if (result && result.ok) {
          state.screen = 'game';
          state.gameOver = false;
          state.winner = null;
          state.board = Array(TTT_TOTAL_CELLS).fill('');
          state.turn = 'X';
          state.message = 'Čekám na spoluhráče.';
          tttRender();
          scheduleTttLayout();
          tttStartOnlineSyncLoop();
          void tttSyncOnlineSession(true);
        }
      } catch (err) {
        console.warn('TTT create invite failed', err);
      }
    });
    start.querySelector('#tttResumeBtn')?.addEventListener('click', () => {
      state.screen = 'game';
      state.message = state.message || (state.mode === 'pvp' ? 'Hraje hráč X.' : (state.mode === 'local' ? 'Na řadě je X.' : 'Hraješ za X. AI je O.'));
      tttRender();
      scheduleTttLayout();
      if (state.mode === 'pvp' && state.online && state.online.code) {
        tttStartOnlineSyncLoop();
        void tttSyncOnlineSession(true);
      }
    });
    start.querySelector('#tttJoinInviteBtn')?.addEventListener('click', async () => {
      const code = prompt('Zadej 4místný číselný kód pozvánky');
      if (code) {
        const result = await tttJoinInviteSession(code, { flow: 'manual' });
        if (result && result.ok) {
          state.screen = 'game';
          state.gameOver = false;
          state.winner = null;
          state.startedAt = Date.now();
          tttSetJoinedOnlineMessage(state);
          tttRememberOnlineJoinDiag('manual', 'ready', { code, source: 'manual-prompt', message: state.message });
          tttRender();
          scheduleTttLayout();
          tttStartOnlineSyncLoop();
          void tttSyncOnlineSession(true);
        }
      }
    });
    start.querySelector('#tttStartBtn')?.addEventListener('click', async () => {
      const selectedMode = String(state.mode || 'ai');
      if (selectedMode !== 'pvp') tttClearBoardStateForNewMode(state, selectedMode);
      state.mode = selectedMode;
      state.screen = 'game';
      state.board = Array(TTT_TOTAL_CELLS).fill('');
      state.turn = 'X';
      state.gameOver = false;
      state.winner = null;
      state.startedAt = Date.now();
      state.moveCount = 0;
      state.moveCountX = 0;
      state.moveCountO = 0;
      state.hardWinPrompt = false;
      state.hardWinStats = null;
      state.resultSaved = false;
      state.resultOnlineSaved = false;
      state.resultSummary = null;
      state.message = state.mode === 'pvp'
        ? (state.online && state.online.status === 'waiting' ? 'Čekám na přijetí pozvánky.' : 'Jsi X. Hraješ.')
        : (state.mode === 'local' ? 'Na řadě je X.' : 'Hraješ za X. AI je O.');
      tttRender();
      scheduleTttLayout();
      if (state.mode === 'pvp' && state.online && state.online.code) {
        tttStartOnlineSyncLoop();
        void tttSyncOnlineSession(true);
        void tttPushOnlineSession({ status: state.online.status || 'waiting' });
      }
    });
    if (state.mode === 'ai' && !state.hardWinLoaded && !state.hardWinLoading) {
      void tttRefreshHardWinRows();
    } else {
      tttUpdateDashboardMeta();
    }
    if (state.mode === 'pvp' && !state.onlineScoreLoading) {
      const scoreAge = Date.now() - Number(state.onlineScoreLoadedAt || 0);
      if (!state.onlineScoreLoaded || scoreAge > 15000) void tttRefreshOnlineScoreRows(true);
    }
    return;
  }

  if (start) start.classList.add('uHidden');
  if (game) game.classList.remove('uHidden');
  start.style.display = 'none';
  game.style.display = 'flex';
  status.textContent = state.message || state.onlineStatus || (state.mode === 'pvp' ? ((state.online && String(state.online.role || '').toUpperCase() === state.turn) ? ('Jsi ' + state.turn + '. Hraješ.') : ('Čekáš na tah hráče ' + state.turn + '.')) : (state.mode === 'local' ? 'Na řadě je X.' : 'Hraješ za X. AI je O.'));
  if (onlineInfo) {
    const scoreText = tttBuildOnlineScoreText();
    onlineInfo.hidden = !(state.mode === 'pvp' && scoreText && state.online && state.online.playerOAccountNumber);
    onlineInfo.textContent = scoreText || '';
  }
  if (state.mode === 'pvp' && state.online && state.online.code && state.online.playerXAccountNumber && state.online.playerOAccountNumber) {
    void tttRefreshOnlineHeadToHead(false).then(() => {
      const currentOverlay = document.getElementById('tttOverlay');
      const currentInfo = currentOverlay ? currentOverlay.querySelector('#tttOnlineGameInfo') : null;
      const currentState = tttGetState();
      if (!currentInfo || currentState.screen !== 'game' || currentState.mode !== 'pvp') return;
      const nextText = tttBuildOnlineScoreText();
      currentInfo.hidden = !nextText;
      currentInfo.textContent = nextText || '';
    });
  }
  tttRenderInviteOverlay(overlay);

  const result = tttWinner(state.board);
  const winnerLine = result.line || [];
  tttRenderGridBoard(boardEl, state, winnerLine);
  tttRenderResultCard(overlay, result.winner);

}

function tttHandleMove(index) {
  const state = tttGetState();
  if (state.gameOver || state.board[index]) return;
  if (state.mode === 'ai' && (state.turn !== 'X' || state.aiBusy)) return;
  if (state.mode === 'pvp') {
    if (!state.online || !state.online.code) {
      state.message = 'Online hra ještě nemá načtený kód pozvánky.';
      tttSetOnlineStatus(state.message, 'error');
      tttRememberOnlineMoveBlock('missing-code-before-move', { source: 'move-guard' });
      tttRender();
      scheduleTttLayout();
      return;
    }
    if (state.online.status === 'waiting') {
      state.message = 'Čekám na přijetí pozvánky druhým hráčem.';
      tttSetOnlineStatus(state.message, 'waiting');
      tttRememberOnlineMoveBlock('waiting-for-opponent-before-move', { code: state.online.code || '', source: 'move-guard' });
      tttRequestOnlineGuardResync('waiting-for-opponent-before-move');
      tttRender();
      scheduleTttLayout();
      return;
    }
    const role = tttEnsureOnlineRoleFromAccounts(state, {}, null, 'move-guard');
    if (!role) {
      state.message = 'Online role hráče se ještě nenačetla. Zkus chvilku počkat, appka si stav znovu ověřuje.';
      tttSetOnlineStatus(state.message, 'error');
      const guardFlow = String(state.online && state.online.joinFlow || '').trim() === 'link' ? 'link' : 'manual';
      tttRememberOnlineJoinDiag(guardFlow, 'error', { code: state.online.code || '', source: 'move-guard', reason: 'missing-role-before-move' });
      tttRememberOnlineMoveBlock('missing-role-before-move', { code: state.online.code || '', source: 'move-guard' });
      tttRequestOnlineGuardResync('missing-role-before-move');
      tttRender();
      scheduleTttLayout();
      return;
    }
    if (state.turn !== role) {
      state.message = 'Teď hraje ' + state.turn + '. Ty jsi ' + role + '.';
      tttSetOnlineStatus(state.message, 'active');
      tttRememberOnlineMoveBlock('turn-mismatch-before-move', { code: state.online.code || '', role, turn: state.turn, source: 'move-guard', message: state.message });
      tttRequestOnlineGuardResync('turn-mismatch-before-move');
      tttRender();
      scheduleTttLayout();
      return;
    }
  }

  tttEnsureGameClockStarted(state);

  const mark = state.turn;
  state.board[index] = mark;
  state.lastMoveIndex = index;
  state.lastMoveMark = mark;
  state.moveCount += 1;
  if (mark === 'X') state.moveCountX += 1;
  else state.moveCountO += 1;
  if (state.mode === 'pvp' && state.online && state.online.code) {
    state.online.dirty = true;
    state.online.pendingRevision = Math.max(Number(state.online.pendingRevision || 0) || 0, Number(state.online.revision || 0) || 0) + 1;
  }

  const after = tttWinner(state.board);
  if (after.winner) {
    state.gameOver = true;
    state.winner = after.winner;
    if (state.mode === 'pvp') {
      const role = String(state.online && state.online.role || '').toUpperCase();
      state.message = after.winner === 'draw'
        ? 'Remíza. Dobře hrané.'
        : (role && after.winner === role ? 'Vyhrál jsi.' : ('Vyhrál hráč ' + after.winner + '.'));
      tttMarkResultSaved(after.winner);
      tttRender();
      scheduleTttLayout();
      if (state.online && state.online.code) {
        void tttPushOnlineSession({ status: 'finished', gameOver: true, winner: after.winner, winnerRole: after.winner, finishedAt: Date.now() });
        tttMaybeRecordOnlineResult(after.winner);
      }
      return;
    }
    if (after.winner === 'draw') {
      state.message = 'Remíza. Dobře hrané.';
      if (typeof gamesRecordStat === 'function') {
        gamesRecordStat('ttt', {
          completed: true,
          plays: (gamesGetActiveAccount()?.stats.ttt.plays || 0) + 1,
          draws: (gamesGetActiveAccount()?.stats.ttt.draws || 0) + 1,
          bestMoves: gamesGetActiveAccount()?.stats.ttt.bestMoves || null,
          bestTimeMs: gamesGetActiveAccount()?.stats.ttt.bestTimeMs || null,
          lastResult: 'Remíza · ' + String(state.moveCount || 0) + ' tahů'
        });
      }
      tttMarkResultSaved(after.winner);
    } else if (after.winner === 'X') {
      state.message = 'Vyhrál jsi.';
      if (typeof gamesRecordStat === 'function') {
        gamesRecordStat('ttt', {
          completed: true,
          plays: (gamesGetActiveAccount()?.stats.ttt.plays || 0) + 1,
          wins: (gamesGetActiveAccount()?.stats.ttt.wins || 0) + 1,
          bestMoves: Math.min(gamesGetActiveAccount()?.stats.ttt.bestMoves || 9999, state.moveCount || 0),
          bestTimeMs: Math.min(gamesGetActiveAccount()?.stats.ttt.bestTimeMs || 999999999, tttGetElapsedMs(state)),
          lastResult: 'Výhra X · ' + String(state.moveCount || 0) + ' tahů'
        });
      }
      tttMarkResultSaved(after.winner);
      if (state.mode === 'ai' && state.difficulty === 'ai') {
        state.hardWinStats = tttReadHardWinStats();
        void tttSubmitHardWin();
      }
    } else {
      state.message = 'Vyhrála O.';
      if (typeof gamesRecordStat === 'function') {
        gamesRecordStat('ttt', {
          completed: true,
          plays: (gamesGetActiveAccount()?.stats.ttt.plays || 0) + 1,
          losses: (gamesGetActiveAccount()?.stats.ttt.losses || 0) + 1,
          lastResult: 'Prohra · ' + String(state.moveCount || 0) + ' tahů'
        });
      }
      tttMarkResultSaved(after.winner);
    }
    tttRender();
    scheduleTttLayout();
    if (state.mode === 'pvp' && state.online && state.online.code) {
      void tttPushOnlineSession({ status: 'finished', gameOver: true, winner: after.winner, winnerRole: after.winner, finishedAt: Date.now() });
      tttMaybeRecordOnlineResult(after.winner);
    }
    return;
  }

  if (state.mode === 'pvp' || state.mode === 'local') {
    state.turn = state.turn === 'X' ? 'O' : 'X';
    state.message = state.mode === 'pvp'
      ? (state.online && state.online.status === 'waiting' ? 'Čekám na přijetí pozvánky.' : ((String(state.online.role || '').toUpperCase() === state.turn) ? ('Jsi ' + state.turn + '. Hraješ.') : ('Čekáš na tah hráče ' + state.turn + '.')))
      : (state.turn === 'X' ? 'Na řadě je X.' : 'Na řadě je O.');
    tttRender();
    scheduleTttLayout();
    if (state.mode === 'pvp' && state.online && state.online.code) {
      void tttPushOnlineSession({ status: state.online.status || 'active' });
    }
    return;
  }

  state.turn = 'O';
  state.message = 'Tah AI...';
  state.aiBusy = true;
  state.aiToken = (state.aiToken || 0) + 1;
  const aiToken = state.aiToken;
  tttRender();
  scheduleTttLayout();

  setTimeout(() => {
    try {
      const fresh = tttGetState();
      if (fresh.gameOver || fresh.aiToken !== aiToken) return;
      const snapshot = fresh.board.slice();
      const aiMove = tttBestMove(snapshot, fresh.difficulty || 'ai');
      if (aiMove < 0 || fresh.board[aiMove]) {
        fresh.turn = 'X';
        fresh.message = 'Hraješ za X.';
        tttRender();
        scheduleTttLayout();
        return;
      }
      fresh.board[aiMove] = 'O';
      fresh.lastMoveIndex = aiMove;
      fresh.lastMoveMark = 'O';
      fresh.moveCount += 1;
      fresh.moveCountO += 1;
      const afterAi = tttWinner(fresh.board);
      if (afterAi.winner) {
        fresh.gameOver = true;
        fresh.winner = afterAi.winner;
        fresh.nextStarter = ['X', 'O'].includes(afterAi.winner) ? afterAi.winner : 'X';
        fresh.message = afterAi.winner === 'draw'
          ? 'Remíza. Dobře hrané.'
          : 'AI vyhrála. Zkus to znovu.';
        if (typeof gamesRecordStat === 'function') {
          const active = gamesGetActiveAccount();
          if (active) {
            const patch = afterAi.winner === 'draw'
              ? {
                  completed: true,
                  plays: (active.stats.ttt.plays || 0) + 1,
                  draws: (active.stats.ttt.draws || 0) + 1,
                  lastResult: 'Remíza · ' + String(fresh.moveCount || 0) + ' tahů'
                }
              : {
                  completed: true,
                  plays: (active.stats.ttt.plays || 0) + 1,
                  losses: (active.stats.ttt.losses || 0) + 1,
                  lastResult: 'Prohra · ' + String(fresh.moveCount || 0) + ' tahů'
                };
            gamesRecordStat('ttt', patch);
          }
        }
        tttMarkResultSaved(afterAi.winner);
        tttRender();
        scheduleTttLayout();
        return;
      }
      fresh.turn = 'X';
      fresh.message = 'Hraješ za X.';
      tttRender();
      scheduleTttLayout();
    } catch (err) {
      console.warn('TTT AI move failed', err);
      const fresh = tttGetState();
      fresh.turn = 'X';
      fresh.message = 'AI se na chvíli zasekla. Zkus tah znovu.';
      tttRender();
      scheduleTttLayout();
    } finally {
      const fresh = tttGetState();
      fresh.aiBusy = false;
    }
  }, 20);
}

function resetTicTacToeGame(keepScreen) {
  const state = tttGetState();
  const previousWinner = String(state.winner || '').toUpperCase();
  const starter = ['X', 'O'].includes(previousWinner)
    ? previousWinner
    : (['X', 'O'].includes(String(state.nextStarter || '').toUpperCase()) ? String(state.nextStarter).toUpperCase() : 'X');
  state.board = Array(TTT_TOTAL_CELLS).fill('');
  state.turn = (state.mode === 'pvp' || state.mode === 'local') ? starter : 'X';
  state.nextStarter = starter;
  state.gameOver = false;
  state.winner = null;
  state.startedAt = keepScreen ? Date.now() : (state.mode === 'pvp' ? Date.now() : 0);
  state.moveCount = 0;
  state.moveCountX = 0;
  state.moveCountO = 0;
  state.lastMoveIndex = null;
  state.lastMoveMark = null;
  state.hardWinPrompt = false;
  state.hardWinStats = null;
  state.resultSaved = false;
  state.resultOnlineSaved = false;
  state.resultSummary = null;
  if (state.mode === 'pvp') {
    const role = String(state.online && state.online.role || '').toUpperCase();
    const waiting = state.online && (!state.online.playerOAccountNumber || String(state.online.status || '').toLowerCase() === 'waiting');
    state.message = waiting
      ? 'Čekám na přijetí pozvánky.'
      : (role === state.turn ? ('Začíná ' + state.turn + '. Jsi na tahu.') : ('Začíná ' + state.turn + '. Čekáš na soupeře.'));
    if (state.online) state.online.status = waiting ? 'waiting' : 'active';
  } else {
    state.message = state.mode === 'local'
      ? ('Začíná ' + state.turn + '.')
      : 'Hraješ za X. AI je O.';
  }
  if (!keepScreen) state.screen = 'start';
  tttRender();
  scheduleTttLayout();
  if (state.mode === 'pvp' && state.online && state.online.code) {
    state.online.dirty = true;
    state.online.pendingRevision = Math.max(Number(state.online.pendingRevision || 0) || 0, Number(state.online.revision || 0) || 0) + 1;
    void tttPushOnlineSession({
      status: state.online.status || 'active',
      gameOver: false,
      winner: null,
      winnerRole: null,
      winnerAccountNumber: null,
      nextStarter: starter,
      finishedAt: null,
      moveCount: 0,
      moveCountX: 0,
      moveCountO: 0,
      lastMoveIndex: null,
      lastMoveMark: null,
      forceNewSession: true
    });
  }
}

function openGamesPage() {
  if (typeof tttStopOnlineSync === 'function') tttStopOnlineSync();
  const hasTttOverlay = typeof document !== 'undefined' && document.body.classList.contains('tttOpen');
  const hasGameShell = typeof app !== 'undefined' && !!app.activeGameShell;

  if (hasTttOverlay && typeof closeTicTacToeGame === 'function') {
    closeTicTacToeGame();
  }
  if (hasGameShell && typeof closeGameShell === 'function') {
    closeGameShell();
  }

  if (typeof gamesStopActiveLoops === 'function') gamesStopActiveLoops();
  if (typeof app !== 'undefined') app.activeGameShell = '';
  document.body.classList.remove('gamesOpen');
  document.body.classList.remove('tttOpen');
  showPage('games');
  if (typeof renderGamesHub === 'function') renderGamesHub();
}

function openTicTacToeGame() {
  try {
    if (typeof applyThemePreference === 'function' && typeof getThemePreference === 'function') applyThemePreference(getThemePreference(), false);
    if (typeof applyBackgroundPreference === 'function' && typeof getBackgroundPreference === 'function') applyBackgroundPreference(getBackgroundPreference(), false);
  } catch (err) {}
  const overlay = ensureTicTacToeOverlay();
  document.body.classList.remove('gamesOpen');
  const state = tttGetState();
  state.screen = 'start';
  state.message = state.message || '';
  overlay.classList.add('isVisible');
  document.body.classList.add('tttOpen');
  if (state.online && state.online.code) {
    tttStartOnlineSyncLoop();
    void tttSyncOnlineSession(true);
  }
  tttRender();
  scheduleTttLayout();
}

function closeTicTacToeGame() {
  const overlay = document.getElementById('tttOverlay');
  if (overlay) overlay.classList.remove('isVisible');
  document.body.classList.remove('tttOpen');
  document.body.classList.remove('gamesOpen');
  tttStopOnlineSync();
  app.activeGameShell = '';
  renderGamesHub();
}

function tttUrlLooksLikeShipsInvite() {
  try {
    const raw = String((window.location.hash || '') + '&' + (window.location.search || ''));
    return /(?:^|[?#&])(?:games|game)=ships(?:$|[&#])|(?:^|[?#&])(?:shipsInvite|ships|battleship)=/i.test(raw);
  } catch (err) { return false; }
}

async function tttAutoOpenFromHash() {
  if (tttUrlLooksLikeShipsInvite()) return false;
  const invite = tttReadUrlInviteData();
  const code = invite.code || '';
  if (!code) return false;
  const opened = await tttOpenFromInviteCode(code, { source: invite.source || 'url' });
  if (opened) tttClearInviteFromUrl();
  return opened;
}

let tttLayoutPending = false;
function scheduleTttLayout() {
  if (tttLayoutPending) return;
  tttLayoutPending = true;
  requestAnimationFrame(() => {
    tttLayoutPending = false;
    tttLayoutBoard();
  });
}

function tttLayoutBoard() {
  const overlay = document.getElementById('tttOverlay');
  if (!overlay || !overlay.classList.contains('isVisible')) return;
  const board = overlay.querySelector('#tttBoard');
  const wrap = overlay.querySelector('.tttBoardWrap');
  if (!board || !wrap) return;

  try {
    const nav = document.querySelector('.bottomNav');
    const viewportH = (window.visualViewport && Number(window.visualViewport.height)) || window.innerHeight || document.documentElement.clientHeight || 0;
    const navRect = nav && nav.getBoundingClientRect ? nav.getBoundingClientRect() : null;
    const navTop = navRect && Number.isFinite(navRect.top) ? navRect.top : 0;
    const navClearance = navRect && viewportH
      ? Math.ceil(Math.max(136, (viewportH - navTop) + 74))
      : Math.ceil(Math.max(136, ((navRect && navRect.height) || 72) + 92));
    document.documentElement.style.setProperty('--rak-ttt-live-bottom-clearance', navClearance + 'px');
  } catch (err) {}

  const wrapRect = wrap.getBoundingClientRect();
  const edge = 1;
  const cellW = Math.floor((wrapRect.width - edge) / TTT_COLS);
  const cellH = Math.floor((wrapRect.height - edge) / TTT_ROWS);
  const cell = Math.max(10, Math.min(cellW, cellH));

  board.style.setProperty('--tttCellSize', cell + 'px');
  board.style.gridTemplateColumns = `repeat(${TTT_COLS}, ${cell}px)`;
  board.style.gridTemplateRows = `repeat(${TTT_ROWS}, ${cell}px)`;
  board.style.gap = '0px';
  board.style.width = (cell * TTT_COLS) + 'px';
  board.style.height = (cell * TTT_ROWS) + 'px';
}

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

function getAdminRotationMonthKeys() {
  return Object.keys(app.rotation && app.rotation.months ? app.rotation.months : {}).sort((a, b) => a.localeCompare(b, 'cs'));
}

function getAdminSelectedMonthKey() {
  const months = getAdminRotationMonthKeys();
  if (!months.length) return '';
  if (app.selectedMonth && months.includes(app.selectedMonth)) return app.selectedMonth;
  const currentMonthKey = typeof monthKeyFromYearMonth === 'function'
    ? monthKeyFromYearMonth(new Date().getFullYear(), new Date().getMonth() + 1)
    : '';
  if (currentMonthKey && months.includes(currentMonthKey)) return currentMonthKey;
  return months[0];
}

function getAdminRotationYears() {
  const years = new Set();
  getAdminRotationMonthKeys().forEach((monthKey) => {
    const parsed = typeof parseMonthKey === 'function' ? parseMonthKey(monthKey) : null;
    if (parsed && Number.isFinite(parsed.year)) years.add(parsed.year);
  });
  return [...years].sort((a, b) => a - b);
}

function renderAdminInlineFieldHtml(fieldAttr, fieldName, value, placeholder, tiny) {
  const safeValue = String(value || '');
  const classes = ['appMenuInlineFieldWrap'];
  if (tiny) classes.push('appMenuInlineFieldWrapTiny');
  const fieldKey = String(fieldName || '');
  const attrKey = String(fieldAttr || '');
  const isDateField = fieldKey === 'date';
  const canRemove = !isDateField && (
    (attrKey === 'data-rot-field' && fieldKey.indexOf('cell-') === 0) ||
    (attrKey === 'data-note-field' && fieldKey === 'person')
  );
  if (canRemove) classes.push('appMenuInlineFieldWrapCanRemove');
  const inputAttrs = [
    'class="appMenuInlineInput' + (tiny ? ' appMenuInlineInputTiny' : '') + '"',
    fieldAttr ? fieldAttr + '="' + escapeHtml(fieldName) + '"' : '',
    'value="' + escapeHtml(safeValue) + '"',
    'placeholder="' + escapeHtml(placeholder || '') + '"',
    'title="' + escapeHtml(isDateField ? 'Datum upravíš ručně.' : 'Uprav text ručně. Po kliknutí na obsazené jméno se nahoře ukáže Odebrat vybrané.') + '"',
    'autocomplete="off"',
    'autocorrect="off"',
    'autocapitalize="off"',
    'spellcheck="false"',
    'inputmode="text"'
  ].filter(Boolean).join(' ');
  return [
    '<div class="' + classes.join(' ') + '">',
    '  <input ' + inputAttrs + '>',
    '</div>'
  ].join('');
}

function renderAdminMonthPickerHtml(selectedMonthKey) {
  const years = getAdminRotationYears();
  const selectedParsed = typeof parseMonthKey === 'function' ? parseMonthKey(selectedMonthKey || '') : null;
  const fallbackYear = selectedParsed && Number.isFinite(selectedParsed.year)
    ? selectedParsed.year
    : (app.selectedYear && years.includes(Number(app.selectedYear)) ? Number(app.selectedYear) : (years[0] || null));
  const selectedYear = Number.isFinite(fallbackYear) ? fallbackYear : (years[0] || null);
  const yearMonths = selectedYear ? getMonthsForYear(app.rotation, selectedYear) : [];
  const selectedMonth = (selectedMonthKey && yearMonths.includes(selectedMonthKey))
    ? selectedMonthKey
    : (yearMonths.includes(getAdminSelectedMonthKey()) ? getAdminSelectedMonthKey() : (yearMonths[0] || selectedMonthKey || ''));

  if (!years.length) {
    return '<div class="smallText">Žádné měsíce zatím nejsou k dispozici.</div>';
  }

  const yearButtons = years.map((year) => {
    const active = Number(year) === Number(selectedYear);
    return '<button type="button" class="appMenuMonthChip' + (active ? ' isActive' : '') + '" data-admin-year-key="' + escapeHtml(String(year)) + '">' + escapeHtml(String(year)) + '</button>';
  }).join('');

  const monthButtons = yearMonths.map((monthKey) => {
    const active = monthKey === selectedMonth;
    return '<button type="button" class="appMenuMonthChip' + (active ? ' isActive' : '') + '" data-admin-month-key="' + escapeHtml(monthKey) + '">' + escapeHtml(monthKey) + '</button>';
  }).join('') || '<div class="smallText">Pro tenhle rok zatím nejsou žádné měsíce.</div>';

  return [
    '<div class="appMenuMonthYearPicker">',
    '  <details class="appMenuMonthYearGroup">',
    '    <summary><span>Rok</span><span>' + escapeHtml(String(selectedYear || '—')) + '</span></summary>',
    '    <div class="appMenuMonthYearButtons">' + yearButtons + '</div>',
    '  </details>',
    '  <details class="appMenuMonthYearGroup">',
    '    <summary><span>Měsíc</span><span>' + escapeHtml(String(selectedMonth || '—')) + '</span></summary>',
    '    <div class="appMenuMonthYearButtons">' + monthButtons + '</div>',
    '  </details>',
    '</div>'
  ].join('');
}

async function loadAdminRotationFromSupabase() {
  if (typeof syncRotationFromSupabase === 'function') {
    return syncRotationFromSupabase(true);
  }
  return null;
}

async function loadAdminMachineSettingsFromSupabase() {
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function') {
    app.machineSettingsRows = await window.RotationSupabaseBridge.loadMachineSettings();
    return app.machineSettingsRows;
  }
  return [];
}

async function saveAdminRotationToSupabase(monthKey, rawText) {
  if (!monthKey) throw new Error('Chybí měsíc.');
  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (err) {
    throw new Error('JSON v poli není platný.');
  }
  const fallback = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const normalized = normalizeMonthForImport(parsed, fallback);
  if (!app.rotation.months) app.rotation.months = {};
  app.rotation.months[monthKey] = normalized;
  app.rotation = normalizeRotationData(app.rotation);
  app.selectedMonth = monthKey;
  saveRotationData();
  renderRotace();
  if (typeof renderMonth === 'function') renderMonth(monthKey);
  if (app.selectedName && typeof renderPerson === 'function') renderPerson(app.selectedName);
  let saveResult = { ok: true, months: 0, entries: 0 };
  if (app.adminUnlocked) {
    saveResult = await saveRotationToSupabase(app.rotation, { source: 'admin-menu', monthKey }) || saveResult;
    const statusEl = document.getElementById('adminOnlineSaveStatus');
    if (statusEl) {
      statusEl.textContent = saveResult && saveResult.ok === true
        ? ('Uloženo online ✓ · měsíců: ' + String(saveResult.months || 0) + ' · řádků: ' + String(saveResult.entries || 0))
        : 'Uložení online se nepodařilo.';
    }
  }
  return { normalized, saveResult };
}

function adminRotationRowTemplate(section, row, rowIndex, machineCount, allowBlankTail) {
  const cells = Array.from({ length: machineCount }, (_, i) => String(row && row.cells && row.cells[i] ? row.cells[i] : ''));
  const date = String(row && row.date ? row.date : '').trim();
  const hasAny = !!(date || cells.some(Boolean) || (row && row.shift) || (row && row.person) || (row && row.code) || (row && row.text));
  if (!hasAny && !allowBlankTail) return '';
  return [
    '<tr data-rotation-section="' + escapeHtml(section) + '" data-rotation-row-index="' + String(rowIndex) + '">',
    '  <td>' + renderAdminInlineFieldHtml('data-rot-field', 'date', date, 'datum', false) + '</td>',
    cells.map((value, idx) => '<td>' + renderAdminInlineFieldHtml('data-rot-field', 'cell-' + String(idx), value, String(idx + 1), true) + '</td>').join(''),
    '</tr>'
  ].join('');
}

function adminNotesRowTemplate(row, rowIndex, allowBlankTail) {
  const note = row || {};
  const date = String(note.date || '').trim();
  const person = String(note.person || '').trim();
  const code = String(note.code || '').trim();
  const hasAny = !!(date || person || code);
  if (!hasAny && !allowBlankTail) return '';
  return [
    '<tr data-note-row-index="' + String(rowIndex) + '">',
    '  <td>' + renderAdminInlineFieldHtml('data-note-field', 'date', date, 'datum', false) + '</td>',
    '  <td>' + renderAdminInlineFieldHtml('data-note-field', 'person', person, 'jméno', false) + '</td>',
    '  <td>' + renderAdminInlineFieldHtml('data-note-field', 'code', code, 'kód', false) + '</td>',
    '</tr>'
  ].join('');
}



function adminRotationDateKey(rawDate) {
  const parsed = typeof parseDateToken === 'function' ? parseDateToken(rawDate) : null;
  if (parsed && Number.isFinite(parsed.day) && Number.isFinite(parsed.month)) return String(parsed.day) + '.' + String(parsed.month);
  return String(rawDate || '').trim().toLowerCase();
}

function adminRotationDateLabel(rawDate) {
  const raw = String(rawDate || '').trim().replace(/\s+/g, ' ');
  if (!raw) return '';
  const parsed = typeof parseDateToken === 'function' ? parseDateToken(raw) : null;
  if (parsed && Number.isFinite(parsed.day) && Number.isFinite(parsed.month)) {
    return String(parsed.day) + '.' + String(parsed.month) + '.' + (parsed.shift ? ' ' + parsed.shift : '');
  }
  return raw;
}

function adminGetKnownNames() {
  if (typeof getKnownStatNames === 'function') {
    return Array.from(getKnownStatNames()).filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), 'cs'));
  }
  if (typeof KNOWN_STAT_NAMES !== 'undefined' && KNOWN_STAT_NAMES && typeof KNOWN_STAT_NAMES.forEach === 'function') {
    return Array.from(KNOWN_STAT_NAMES).filter(Boolean).sort((a, b) => String(a).localeCompare(String(b), 'cs'));
  }
  return [];
}

function adminSplitPeopleList(text) {
  if (typeof splitAbsencePeople === 'function') {
    return splitAbsencePeople(text).map(sanitizeAbsencePersonName).filter(Boolean);
  }
  const raw = String(text || '').trim();
  if (!raw) return [];
  return raw.split(/\s*(?:,|;|\/|\||&|\ba\b|\bi\b)\s*/gi).map(part => part.trim()).filter(Boolean);
}

function adminBuildUsedNamesByDate(root) {
  const usedByDate = new Map();

  const add = (dateLabel, name) => {
    const key = String(dateLabel || '').trim().replace(/\s+/g, ' ');
    const person = String(name || '').trim();
    if (!key || !person) return;
    if (!usedByDate.has(key)) usedByDate.set(key, new Set());
    usedByDate.get(key).add(person);
  };

  root.querySelectorAll('tr[data-rotation-section]').forEach((tr) => {
    const date = adminRotationDateLabel(tr.querySelector('[data-rot-field="date"], [data-note-field="date"]')?.value || '');
    tr.querySelectorAll('[data-rot-field^="cell-"]').forEach((input) => {
      const name = String(input && input.value ? input.value : '').trim();
      if (name && !['dát pryč','odebrat','remove','pryc','pryč'].includes(name.toLowerCase())) add(date, name);
    });
  });

  root.querySelectorAll('tr[data-note-row-index]').forEach((tr) => {
    const date = adminRotationDateLabel(tr.querySelector('[data-note-field="date"]')?.value || '');
    const names = adminSplitPeopleList(tr.querySelector('[data-note-field="person"]')?.value || '');
    names.forEach((name) => add(date, name));
  });

  return usedByDate;
}

function adminBuildMonthUsageSummary(monthKey) {
  const month = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const knownNames = adminGetKnownNames();
  const usedByDate = new Map();
  const allUsed = new Set();
  const dateOrder = [];

  const register = (dateLabel) => {
    const label = adminRotationDateLabel(dateLabel);
    if (!label) return null;
    if (!usedByDate.has(label)) {
      usedByDate.set(label, new Set());
      dateOrder.push(label);
    }
    return usedByDate.get(label);
  };

  const addName = (dateLabel, name) => {
    const labelSet = register(dateLabel);
    const person = String(name || '').trim();
    if (!labelSet || !person) return;
    labelSet.add(person);
    allUsed.add(person);
  };

  if (month) {
    const hardRows = Array.isArray(month.hard && month.hard.rows) ? month.hard.rows : [];
    const softRows = Array.isArray(month.soft && month.soft.rows) ? month.soft.rows : [];
    const notesRows = Array.isArray(month.notes) ? month.notes : [];

    hardRows.forEach((row) => {
      const label = adminRotationDateLabel(row && row.date ? row.date : '');
      if (!label) return;
      register(label);
      const cells = row && Array.isArray(row.cells) ? row.cells : [];
      cells.forEach((cell) => {
        const name = String(cell || '').trim();
        if (name && !['dát pryč','odebrat','remove','pryc','pryč'].includes(name.toLowerCase())) addName(label, name);
      });
    });

    softRows.forEach((row) => {
      const label = adminRotationDateLabel(row && row.date ? row.date : '');
      if (!label) return;
      register(label);
      const cells = row && Array.isArray(row.cells) ? row.cells : [];
      cells.forEach((cell) => {
        const name = String(cell || '').trim();
        if (name && !['dát pryč','odebrat','remove','pryc','pryč'].includes(name.toLowerCase())) addName(label, name);
      });
    });

    notesRows.forEach((row) => {
      const label = adminRotationDateLabel(row && row.date ? row.date : '');
      if (!label) return;
      register(label);
      const names = adminSplitPeopleList(row && row.person ? row.person : '');
      names.forEach((name) => addName(label, name));
    });
  }

  const freeOverall = knownNames.filter((name) => !allUsed.has(name));
  const missingByDate = dateOrder.map((label) => ({
    label,
    missing: knownNames.filter((name) => !(usedByDate.get(label) || new Set()).has(name))
  })).filter((item) => item.missing.length);

  return { month, knownNames, usedByDate, allUsed, dateOrder, freeOverall, missingByDate };
}

function adminGetRotationActiveDateKey(root) {
  if (!root) return '';
  const focused = root.querySelector('[data-rot-field]:focus, [data-note-field]:focus');
  const row = focused && typeof focused.closest === 'function'
    ? focused.closest('tr[data-rotation-section], tr[data-note-row-index]')
    : null;
  if (!row) return '';
  const dateInput = row.querySelector('[data-rot-field="date"], [data-note-field="date"]');
  return adminRotationDateLabel(dateInput ? dateInput.value : '');
}

function adminRenderRotationAvailabilitySummary(root) {
  if (!root || root.dataset.adminView !== 'rotation') return;
  const box = root.querySelector('#adminRotationFreeNamesSummary');
  if (!box) return;
  const monthSelect = root.querySelector('#adminMonthSelect');
  const monthKey = monthSelect ? monthSelect.value : getAdminSelectedMonthKey();
  const summary = adminBuildMonthUsageSummary(monthKey);

  const makeEl = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = String(text);
    return el;
  };
  const appendStrongLine = (className, strongText, tailText) => {
    const line = makeEl('div', className);
    const strong = document.createElement('b');
    strong.textContent = String(strongText || '');
    line.appendChild(strong);
    if (tailText != null) line.appendChild(document.createTextNode(String(tailText)));
    return line;
  };

  if (!summary.month) {
    const fingerprint = JSON.stringify({ state: 'empty', monthKey: monthKey || '' });
    if (typeof setElementChildrenIfChanged === 'function') {
      setElementChildrenIfChanged(box, fingerprint, () => [
        makeEl('div', 'appMenuFreeNamesTitle', 'Kontrola měsíce'),
        makeEl('div', 'appMenuFreeNamesText', 'Pro tenhle měsíc zatím nejsou data.')
      ], 'adminRotationFreeNamesSummary');
    } else {
      box.replaceChildren(
        makeEl('div', 'appMenuFreeNamesTitle', 'Kontrola měsíce'),
        makeEl('div', 'appMenuFreeNamesText', 'Pro tenhle měsíc zatím nejsou data.')
      );
    }
    return;
  }

  const freeOverall = summary.freeOverall.length ? summary.freeOverall.join(', ') : '—';
  const missingRows = summary.missingByDate.map((item) => ({
    label: String(item && item.label ? item.label : ''),
    missing: Array.isArray(item && item.missing) ? item.missing.join(', ') : ''
  }));
  const fingerprint = JSON.stringify({ monthKey: monthKey || '', freeOverall, missingRows });

  const buildContent = () => {
    const list = makeEl('div', 'appMenuMonthCheckList');
    if (missingRows.length) {
      missingRows.forEach((item) => {
        const row = makeEl('div', 'appMenuMonthCheckRow');
        const label = document.createElement('b');
        label.textContent = item.label + ':';
        row.appendChild(label);
        row.appendChild(document.createTextNode(' ' + item.missing));
        list.appendChild(row);
      });
    } else {
      list.appendChild(makeEl('div', 'appMenuMonthCheckRow', 'V tomhle měsíci nechybí žádné známé jméno.'));
    }

    return [
      makeEl('div', 'appMenuFreeNamesTitle', 'Kontrola měsíce ' + String(monthKey || '')),
      appendStrongLine('appMenuFreeNamesText', 'V celém měsíci nikde nejsou:', ' ' + freeOverall),
      appendStrongLine('appMenuFreeNamesText uMt8', 'Chybějící jména podle dnů:', null),
      list
    ];
  };

  if (typeof setElementChildrenIfChanged === 'function') {
    setElementChildrenIfChanged(box, fingerprint, buildContent, 'adminRotationFreeNamesSummary');
  } else {
    box.replaceChildren(...buildContent());
  }
}

function adminRefreshRotationSuggestions(root) {
  if (!root || root.dataset.adminView !== 'rotation' || !root.isConnected) return;
  try {
    root.querySelectorAll('datalist[data-admin-rotation-suggest]').forEach((list) => list.remove());
  } catch (err) {}
  try {
    adminRenderRotationAvailabilitySummary(root);
  } catch (err) {
    console.warn('Admin rotation summary failed', err);
  }
}

function adminAttachRotationAvailableDatalist(input) {
  try {
    const body = document.getElementById('appMenuBody');
    if (!body || body.dataset.adminView !== 'rotation' || !input || !body.contains(input)) return;
    if (!input.matches('[data-rot-field^="cell-"]')) return;
    const currentValue = String(input.value || '').trim();
    if (currentValue) {
      input.removeAttribute('list');
      return;
    }
    const row = input.closest('tr[data-rotation-section]');
    const dateKey = adminRotationDateLabel(row && row.querySelector('[data-rot-field="date"]') ? row.querySelector('[data-rot-field="date"]').value : '');
    const used = dateKey ? (adminBuildUsedNamesByDate(body).get(dateKey) || new Set()) : new Set();
    const names = adminGetKnownNames().filter((name) => !used.has(name));
    const listId = 'adminRotationSuggest-' + Math.random().toString(36).slice(2, 9);
    const datalist = document.createElement('datalist');
    datalist.id = listId;
    datalist.setAttribute('data-admin-rotation-suggest', '1');
    names.forEach((name) => {
      const option = document.createElement('option');
      option.value = name;
      datalist.appendChild(option);
    });
    body.appendChild(datalist);
    input.setAttribute('list', listId);
  } catch (err) {
    console.warn('Admin rotation datalist failed', err);
  }
}

function splitMachineKey(rawKey) {
  const raw = String(rawKey || '').trim();
  if (!raw) return { machine: '', index: '' };
  const parts = raw.includes('-') ? raw.split('-') : (raw.includes('_') ? raw.split('_') : [raw]);
  const machine = String(parts[0] || '').trim();
  const index = String(parts.slice(1).join('-') || '').trim();
  return { machine, index };
}

function makeMachineKey(machineCode, machineIndex, category) {
  const machine = String(machineCode || '').trim();
  const index = String(machineIndex || '').trim();
  const cat = String(category || '').trim();
  if (!machine) return '';
  if (cat === 'brus') return machine + (index ? '-' + index : '');
  return machine;
}


function buildAdminRotationColgroupHtml(columnCount, firstWidthPx, otherWidthPx) {
  const cols = [];
  cols.push('<col style="width:' + String(firstWidthPx) + 'px;">');
  for (let i = 0; i < columnCount; i += 1) {
    cols.push('<col style="width:' + String(otherWidthPx) + 'px;">');
  }
  return '<colgroup>' + cols.join('') + '</colgroup>';
}

function buildAdminAbsenceColgroupHtml() {
  return '<colgroup>' +
    '<col class="colW42">' +
    '<col class="colW86">' +
    '<col class="colW42">' +
    '</colgroup>';
}

function buildAdminAbsenceSummaryHtml(notesRows) {
  const absNotes = Array.isArray(notesRows) ? notesRows.map(normalizeNoteEntry).filter(n => n.isAbsence) : [];
  if (!absNotes.length) return '<div class="smallText">Bez poznámek.</div>';

  const grouped = new Map();
  absNotes.forEach(n => {
    const key = n.date || '';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(n);
  });

  const rows = [...grouped.entries()].map(([date, items]) => ({
    date,
    items: items.slice().sort((a, b) => String(a.person || '').localeCompare(String(b.person || ''), 'cs'))
  }));

  const maxPairs = Math.max(1, ...rows.map(r => r.items.length));
  let html = "<div class='smallText uMt12 uBold'>Absence podle dne</div>";
  html += "<div class='tableWrap'><table class='noteTable noteTableCompact'><thead><tr>";
  for (let i = 0; i < maxPairs; i += 1) {
    if (i > 0) html += "<th class='noteSpacer'></th>";
    html += "<th class='noteDateCell'>Datum</th><th class='noteShiftCell'>Směna</th><th class='notePersonCell'>Jméno</th><th class='noteReasonCell'>Důvod</th>";
  }
  html += "</tr></thead><tbody>";
  rows.forEach(row => {
    html += "<tr>";
    for (let i = 0; i < maxPairs; i += 1) {
      if (i > 0) html += "<td class='noteSpacer'></td>";
      const n = row.items[i];
      if (n) {
        const parsed = parseDateToken(n.date);
        const dateOnly = parsed ? String(parsed.day) + "." + String(parsed.month) + "." : n.date;
        const shift = n.shift || (parsed ? parsed.shift : "");
        const people = (n.people && n.people.length) ? n.people.join(" a ") : (n.person || "");
        const reason = n.label || n.code || "";
        html += "<td class='noteDateCell'>" + escapeHtml(dateOnly) + "</td><td class='noteShiftCell'>" + escapeHtml(shift) + "</td><td class='notePersonCell'>" + escapeHtml(people) + "</td><td class='noteReasonCell'>" + escapeHtml(reason) + "</td>";
      } else {
        html += "<td class='emptyCell noteDateCell'>—</td><td class='emptyCell noteShiftCell'>—</td><td class='emptyCell notePersonCell'>—</td><td class='emptyCell noteReasonCell'>—</td>";
      }
    }
    html += "</tr>";
  });
  html += "</tbody></table></div>";
  return html;
}

function getAdminFhbTargetRows() {
  if (typeof getAllFhbTargetPresets === 'function') {
    return getAllFhbTargetPresets();
  }
  return [
    { key: 'afag-lis', label: 'AF/AG lis', left: 50, right: 70 },
    { key: 'ah-lis', label: 'AH lis', left: 20, right: 80 },
    { key: 'afag-volne', label: 'AF/AG volné', left: -5, right: 10 },
    { key: 'ah-volne', label: 'AH volné', left: 10, right: 25 }
  ];
}

function buildAdminFhbTargetSettingsHtml() {
  const rows = getAdminFhbTargetRows();
  const rowsHtml = rows.map((row) => {
    const key = String(row.key || '').trim();
    const label = String(row.label || key || '').trim();
    return [
      '<tr data-fhb-target-row="' + escapeHtml(key) + '">',
      '  <td><input class="appMenuInlineInput" data-fhb-target-field="label" value="' + escapeHtml(label) + '" readonly></td>',
      '  <td><input class="appMenuInlineInput" data-fhb-target-field="left" value="' + escapeHtml(String(row.left ?? '')) + '" inputmode="decimal"></td>',
      '  <td><input class="appMenuInlineInput" data-fhb-target-field="right" value="' + escapeHtml(String(row.right ?? '')) + '" inputmode="decimal"></td>',
      '</tr>'
    ].join('');
  }).join('');
  return [
    '<div class="tableWrap appMenuTableWrap uMt12">',
    '  <div class="smallText">Korekce frézky · středy fhβ</div>',
    '  <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense appMenuAdminFhbTargetTable">',
    '    <thead><tr><th>Index</th><th>Levá</th><th>Pravá</th></tr></thead>',
    '    <tbody>' + rowsHtml + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
}

function buildAdminMachineSettingsTableHtml() {
  const rows = Array.isArray(app.machineSettingsRows) ? app.machineSettingsRows : [];
  const machineRows = rows.filter(row => { const cat = String(row && row.category ? row.category : '').trim(); return cat !== 'brus' && cat !== 'fhb_target'; });
  const brusRows = rows.filter(row => String(row && row.category ? row.category : '').trim() === 'brus');

  const machineDefaults = machineRows.length ? machineRows : [
    { machine_key: 'FREZKY', machine_code: 'FREZKY', machine_index: '', label: 'Frezky', category: 'frezka', cycle_time: '', settings_json: { machine: 'FREZKY', index: '', cycle_time: '' } },
    { machine_key: 'TPKW01', machine_code: 'TPKW01', machine_index: '', label: 'Pračka', category: 'pracka', cycle_time: '30', settings_json: { machine: 'TPKW01', index: '', cycle_time: '30' } }
  ];

  const brusDefaults = brusRows.length ? brusRows : [
    { machine_key: 'TBKR01-AD', machine_code: 'TBKR01', machine_index: 'AD', label: 'TBKR01-AD', category: 'brus', cycle_time: '58.2', dress_time: '323', dress_count: '59', settings_json: { machine: 'TBKR01', index: 'AD', cycle_time: '58.2', dress_time: '323', dress_count: '59' } },
    { machine_key: 'TBKR01-AE', machine_code: 'TBKR01', machine_index: 'AE', label: 'TBKR01-AE', category: 'brus', cycle_time: '57.0', dress_time: '240', dress_count: '58', settings_json: { machine: 'TBKR01', index: 'AE', cycle_time: '57.0', dress_time: '240', dress_count: '58' } },
    { machine_key: 'TBKR01-AH', machine_code: 'TBKR01', machine_index: 'AH', label: 'TBKR01-AH', category: 'brus', cycle_time: '66.0', dress_time: '400', dress_count: '87', settings_json: { machine: 'TBKR01', index: 'AH', cycle_time: '66.0', dress_time: '400', dress_count: '87' } },
    { machine_key: 'TBKR01-AD volné', machine_code: 'TBKR01', machine_index: 'AD volné', label: 'TBKR01-AD volné', category: 'brus', cycle_time: '62.7', dress_time: '240', dress_count: '45', settings_json: { machine: 'TBKR01', index: 'AD volné', cycle_time: '62.7', dress_time: '240', dress_count: '45' } },
    { machine_key: 'TBKR01-AE volné', machine_code: 'TBKR01', machine_index: 'AE volné', label: 'TBKR01-AE volné', category: 'brus', cycle_time: '60.0', dress_time: '240', dress_count: '45', settings_json: { machine: 'TBKR01', index: 'AE volné', cycle_time: '60.0', dress_time: '240', dress_count: '45' } },
    { machine_key: 'TBKR07-AD', machine_code: 'TBKR07', machine_index: 'AD', label: 'TBKR07-AD', category: 'brus', cycle_time: '58.2', dress_time: '298', dress_count: '59', settings_json: { machine: 'TBKR07', index: 'AD', cycle_time: '58.2', dress_time: '298', dress_count: '59' } },
    { machine_key: 'TBKR07-AE', machine_code: 'TBKR07', machine_index: 'AE', label: 'TBKR07-AE', category: 'brus', cycle_time: '56.4', dress_time: '325', dress_count: '59', settings_json: { machine: 'TBKR07', index: 'AE', cycle_time: '56.4', dress_time: '325', dress_count: '59' } },
    { machine_key: 'TBKR07-AH', machine_code: 'TBKR07', machine_index: 'AH', label: 'TBKR07-AH', category: 'brus', cycle_time: '63', dress_time: '360', dress_count: '88', settings_json: { machine: 'TBKR07', index: 'AH', cycle_time: '63', dress_time: '360', dress_count: '88' } },
    { machine_key: 'TBKR07-AD volné', machine_code: 'TBKR07', machine_index: 'AD volné', label: 'TBKR07-AD volné', category: 'brus', cycle_time: '60.3', dress_time: '240', dress_count: '45', settings_json: { machine: 'TBKR07', index: 'AD volné', cycle_time: '60.3', dress_time: '240', dress_count: '45' } },
    { machine_key: 'TBKR07-AE volné', machine_code: 'TBKR07', machine_index: 'AE volné', label: 'TBKR07-AE volné', category: 'brus', cycle_time: '60.0', dress_time: '240', dress_count: '45', settings_json: { machine: 'TBKR07', index: 'AE volné', cycle_time: '60.0', dress_time: '240', dress_count: '45' } }
  ];

  const machineRowsHtml = machineDefaults.map((row, idx) => {
    const machineCode = String(row.machine_code || splitMachineKey(row.machine_key).machine || '').trim();
    const cycleTime = row.cycle_time ?? row.speed ?? (row.settings_json && row.settings_json.cycle_time) ?? '';
    return [
      '<tr data-machine-row-index="m' + String(idx) + '">',
      '  <td><input class="appMenuInlineInput" data-machine-field="machine_code" value="' + escapeHtml(machineCode) + '" placeholder="FREZKY / TPKW01"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="label" value="' + escapeHtml(String(row.label || '')) + '" placeholder="název"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="cycle_time" value="' + escapeHtml(String(cycleTime ?? '')) + '" placeholder="čas výroby kola"></td>',
      '</tr>'
    ].join('');
  }).join('');

  const brusRowsHtml = brusDefaults.map((row, idx) => {
    const machineCode = String(row.machine_code || splitMachineKey(row.machine_key).machine || '').trim();
    const machineIndex = String(row.machine_index || splitMachineKey(row.machine_key).index || '').trim();
    const cycleTime = row.cycle_time ?? row.speed ?? (row.settings_json && row.settings_json.cycle_time) ?? '';
    const dressTime = row.dress_time ?? (row.settings_json && row.settings_json.dress_time) ?? '';
    const dressCount = row.dress_count ?? (row.settings_json && row.settings_json.dress_count) ?? '';
    return [
      '<tr data-machine-row-index="b' + String(idx) + '">',
      '  <td><input class="appMenuInlineInput" data-machine-field="machine_code" value="' + escapeHtml(machineCode) + '" placeholder="TBKR01"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="machine_index" value="' + escapeHtml(machineIndex) + '" placeholder="AD / AE / AH / volné"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="label" value="' + escapeHtml(String(row.label || '')) + '" placeholder="název"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="cycle_time" value="' + escapeHtml(String(cycleTime ?? '')) + '" placeholder="čas výroby kola"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="dress_time" value="' + escapeHtml(String(dressTime ?? '')) + '" placeholder="čas orovnání"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="dress_count" value="' + escapeHtml(String(dressCount ?? '')) + '" placeholder="po kolika ks"></td>',
      '</tr>'
    ].join('');
  }).join('');

  return [
    '<div class="appMenuSubSection" id="adminMachinesSection">',
    '  <div class="appMenuSubTitle">Nastavení strojů</div>',
    '  <div class="appMenuText">Frezky a pračka mají jen čas výroby kola. Brusky mají stroj, index, čas výroby kola, čas orovnání a počet kusů po orovnání. Níž upravíš i středy fhβ pro frézky.</div>',
    '  <div class="tableWrap appMenuTableWrap">',
    '    <div class="smallText">Frezky a pračka</div>',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense">',
    '      <thead><tr><th>Stroj</th><th>Název</th><th>Čas výroby kola</th></tr></thead>',
    '      <tbody>' + machineRowsHtml + '</tbody>',
    '    </table>',
    '  </div>',
    '  <div class="tableWrap appMenuTableWrap uMt12">',
    '    <div class="smallText">Brusy</div>',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense">',
    '      <thead><tr><th>Stroj</th><th>Index</th><th>Název</th><th>Čas výroby kola</th><th>Čas orovnání</th><th>Po kolika ks</th></tr></thead>',
    '      <tbody>' + brusRowsHtml + '</tbody>',
    '    </table>',
    '  </div>',
    buildAdminFhbTargetSettingsHtml(),
    '</div>'
  ].join('');
}


function adminShortRotationName(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (adminRotationIsRemoveValue(raw)) return '';
  const parts = raw.split(/\s+/).filter(Boolean);
  const base = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const clean = String(base || raw).replace(/[^0-9A-Za-zÁ-Žá-ž]/g, '');
  return clean ? clean.slice(0, 6) : raw.slice(0, 6);
}

function buildAdminRotationCompactOverviewHtml(monthKey, hardRows, softRows, hardMachines, softMachines) {
  const renderSection = (title, rows, machines) => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const safeMachines = Array.isArray(machines) ? machines : [];
    if (!safeRows.length) return '';
    const head = '<tr><th>Den</th>' + safeMachines.map((m) => '<th>' + escapeHtml(String(m || '').replace(/^T/, '')) + '</th>').join('') + '</tr>';
    const body = safeRows.map((row) => {
      const date = adminRotationDateLabel(row && row.date ? row.date : '') || String(row && row.date ? row.date : '');
      const cells = Array.isArray(row && row.cells) ? row.cells : [];
      return '<tr><td>' + escapeHtml(String(date || '')) + '</td>' + safeMachines.map((_, idx) => {
        const raw = String(cells[idx] || '').trim();
        const shortName = adminShortRotationName(raw);
        return '<td data-full-name="' + escapeHtml(raw) + '">' + escapeHtml(shortName || '·') + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return [
      '<div class="adminRotationMiniSection">',
      '  <div class="adminRotationMiniTitle">' + escapeHtml(title) + '</div>',
      '  <div class="adminRotationMiniScroll">',
      '    <table class="adminRotationMiniTable"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>',
      '  </div>',
      '</div>'
    ].join('');
  };
  return [
    '<details class="adminRotationCompactOverview" open>',
    '  <summary>Přehled měsíce</summary>',
    '  <div class="adminRotationCompactHint">Mini přehled je jen pro orientaci. Upravuje se v tabulkách níž.</div>',
    renderSection('Tvrdota', hardRows, hardMachines),
    renderSection('Měkota', softRows, softMachines),
    '</details>'
  ].join('');
}

function buildAdminRotationTableHtml(monthKey) {

  const month = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  if (!month) {
    return '<div class="smallText">Pro tenhle měsíc zatím nejsou data.</div>';
  }
  const hardRows = Array.isArray(month.hard && month.hard.rows) ? month.hard.rows : [];
  const softRows = Array.isArray(month.soft && month.soft.rows) ? month.soft.rows : [];
  const notesRows = Array.isArray(month.notes) ? month.notes : [];
  const hardMachines = Array.isArray(month.hard && month.hard.machines) ? month.hard.machines : HARD_MACHINE_HEADERS;
  const softMachines = Array.isArray(month.soft && month.soft.machines) ? month.soft.machines : SOFT_MACHINE_HEADERS;

  const renderRows = (section, rows, machineCount) => {
    const withBlank = rows.concat([ { date: '', cells: Array(machineCount).fill('') } ]);
    return withBlank.map((row, idx) => adminRotationRowTemplate(section, row, idx, machineCount, true)).join('');
  };

  const renderNotes = () => {
    const withBlank = notesRows.concat([ { date: '', person: '', code: '' } ]);
    return withBlank.map((row, idx) => adminNotesRowTemplate(row, idx, true)).join('');
  };

  const hardColgroup = buildAdminRotationColgroupHtml(hardMachines.length, 50, 61);
  const softColgroup = buildAdminRotationColgroupHtml(softMachines.length, 50, 61);
  const absenceColgroup = buildAdminAbsenceColgroupHtml();

  return [
    '<div class="appMenuSubSection" id="adminRotationEditor">',
    '  <div class="appMenuSubTitle">Rozpis – ' + escapeHtml(monthKey) + '</div>',
    '  <div class="appMenuText">Stejný rozpis, jen editovatelný. Změny zůstávají rozepsané lokálně a do Supabase jdou až po kliknutí na Uložit rozpis.</div>',
    '  <div class="adminRotationSaveDock">',
    '    <div class="adminRotationSaveActions">',
    '      <button type="button" class="appMenuAction isActive adminRotationSaveDockBtn" data-admin-action="save-rotation">Uložit rozpis</button>',
    '      <button type="button" class="appMenuAction adminRotationSelectedRemoveBtn" data-admin-selected-remove hidden>Odebrat vybrané</button>',
    '    </div>',
    '    <span id="adminRotationDraftStatus" class="adminRotationDraftStatus">Rozepsané změny se uloží až tlačítkem.</span>',
    '  </div>',
    buildAdminRotationCompactOverviewHtml(monthKey, hardRows, softRows, hardMachines, softMachines),
    '  <div class="appMenuFreeNamesBox" id="adminRotationFreeNamesSummary">',
    '    <div class="appMenuFreeNamesTitle">Kontrola měsíce</div>',
    '    <div class="appMenuFreeNamesText">Vyber měsíc a hned uvidíš, kdo v něm není zapsaný ani jednou a na kterých dnech ještě někdo chybí.</div>',
    '  </div>',
    '  <details class="appMenuFoldSection adminRotationFold" open>',
    '    <summary>Tvrdota</summary>',
    '    <div class="tableWrap appMenuTableWrap">',
    '      <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense appMenuAdminRotationTable">',
    '        ' + hardColgroup,
    '        <thead><tr><th>Datum</th>' + hardMachines.map(m => '<th>' + escapeHtml(m) + '</th>').join('') + '</tr></thead>',
    '        <tbody>' + renderRows('hard', hardRows, hardMachines.length) + '</tbody>',
    '      </table>',
    '    </div>',
    '  </details>',
    '  <details class="appMenuFoldSection adminRotationFold" open>',
    '    <summary>Měkota</summary>',
    '    <div class="tableWrap appMenuTableWrap">',
    '      <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense appMenuAdminRotationTable">',
    '        ' + softColgroup,
    '        <thead><tr><th>Datum</th>' + softMachines.map(m => '<th>' + escapeHtml(m) + '</th>').join('') + '</tr></thead>',
    '        <tbody>' + renderRows('soft', softRows, softMachines.length) + '</tbody>',
    '      </table>',
    '    </div>',
    '  </details>',
    '  <details class="appMenuFoldSection adminRotationFold" open>',
    '    <summary>Absence</summary>',
    '    <div class="tableWrap appMenuTableWrap">',
    '      <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense appMenuAdminAbsenceTable">',
    '        ' + absenceColgroup,
    '        <thead><tr><th>Datum</th><th>Jméno</th><th>Kód</th></tr></thead>',
    '        <tbody>' + renderNotes() + '</tbody>',
    '      </table>',
    '    </div>',
    buildAdminAbsenceSummaryHtml(notesRows),
    '  </details>',
    '</div>'
  ].join('');
}



function readAdminMachineSettingsFromDom() {
  const rows = [];
  document.querySelectorAll('#appMenuBody tr[data-machine-row-index]').forEach((tr) => {
    const get = (field) => tr.querySelector('[data-machine-field="' + field + '"]')?.value ?? '';
    const label = String(get('label')).trim();
    const machine_code = String(get('machine_code')).trim();
    const machine_index = String(get('machine_index')).trim();
    const cycle_time = String(get('cycle_time')).trim();
    const dress_time = String(get('dress_time')).trim();
    const dress_count = String(get('dress_count')).trim();
    const category = machine_code.toUpperCase().startsWith('TBKR') ? 'brus' : (machine_code.toUpperCase().startsWith('TPKW') ? 'pracka' : 'frezka');
    const machine_key = makeMachineKey(machine_code, machine_index, category);
    if (!machine_key && !label && !cycle_time && !dress_time && !dress_count) return;

    rows.push({
      machine_key,
      machine_code,
      machine_index,
      label: label || machine_key,
      category,
      cycle_time,
      speed: cycle_time,
      dress_time,
      dress_count,
      settings_json: { machine: machine_code, index: machine_index, cycle_time, dress_time, dress_count }
    });
  });
  document.querySelectorAll('#appMenuBody tr[data-fhb-target-row]').forEach((tr) => {
    const key = String(tr.getAttribute('data-fhb-target-row') || '').trim();
    const get = (field) => tr.querySelector('[data-fhb-target-field="' + field + '"]')?.value ?? '';
    const label = String(get('label')).trim() || key;
    const left = String(get('left')).trim();
    const right = String(get('right')).trim();
    if (!key) return;
    rows.push({
      machine_key: 'FHB_TARGET_' + key,
      machine_code: 'FHB',
      machine_index: key,
      label,
      category: 'fhb_target',
      cycle_time: '',
      speed: '',
      dress_time: '',
      dress_count: '',
      settings_json: { machine: 'FHB', index: key, type: 'fhb_target', key, label, target_left: left, target_right: right }
    });
  });
  return rows;
}
function makeRotationRowKey(row) {
  const cells = Array.isArray(row && row.cells) ? row.cells : [];
  return [String(row && row.date ? row.date : '').trim(), cells.map(v => String(v || '').trim()).join('¦')].join('||');
}

function makeNoteRowKey(note) {
  return [
    String(note && note.date ? note.date : '').trim(),
    String(note && note.person ? note.person : '').trim(),
    String(note && note.code ? note.code : '').trim(),
    String(note && note.shift ? note.shift : '').trim(),
    String(note && note.text ? note.text : '').trim()
  ].join('||');
}

window.splitMachineKey = splitMachineKey;
window.makeMachineKey = makeMachineKey;
window.makeRotationRowKey = makeRotationRowKey;
window.makeNoteRowKey = makeNoteRowKey;

function readAdminRotationFromDom(monthKey) {
  const fallback = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const month = fallback ? JSON.parse(JSON.stringify(fallback)) : {
    hard: { title: 'Rotace tvrdota', machines: HARD_MACHINE_HEADERS.slice(), rows: [] },
    soft: { title: 'Rotace měkota', machines: SOFT_MACHINE_HEADERS.slice(), rows: [] },
    notes: []
  };

  const root = document.getElementById('appMenuBody');
  if (!root) return month;

  const readSection = (section, machineCount) => {
    const rows = [];
    const seen = new Set();
    root.querySelectorAll('tr[data-rotation-section="' + section + '"]').forEach((tr) => {
      const date = String(tr.querySelector('[data-rot-field="date"]')?.value || '').trim();
      const cells = Array.from({ length: machineCount }, (_, i) => String(tr.querySelector('[data-rot-field="cell-' + i + '"]')?.value || '').trim());
      if (!date && cells.every(v => !v)) return;
      const row = { date, cells };
      const key = makeRotationRowKey(row);
      if (seen.has(key)) return;
      seen.add(key);
      rows.push(row);
    });
    month[section] = month[section] || {};
    month[section].rows = rows;
    month[section].machines = section === 'hard' ? HARD_MACHINE_HEADERS.slice() : SOFT_MACHINE_HEADERS.slice();
    if (!month[section].title) month[section].title = section === 'hard' ? 'Rotace tvrdota' : 'Rotace měkota';
  };

  readSection('hard', HARD_MACHINE_HEADERS.length);
  readSection('soft', SOFT_MACHINE_HEADERS.length);

  const notes = [];
  const seenNotes = new Set();
  root.querySelectorAll('tr[data-note-row-index]').forEach((tr) => {
    const get = (field) => String(tr.querySelector('[data-note-field="' + field + '"]')?.value || '').trim();
    const date = get('date');
    const person = get('person');
    const code = get('code');
    const parsed = typeof parseDateToken === 'function' ? parseDateToken(date) : null;
    const shift = parsed && parsed.shift ? parsed.shift : '';
    const text = [person, code].filter(Boolean).join(' ').trim();
    const note = { date, person, code, shift, text };
    if (!note.date && !note.person && !note.code && !note.shift && !note.text) return;
    const key = makeNoteRowKey(note);
    if (seenNotes.has(key)) return;
    seenNotes.add(key);
    notes.push(note);
  });
  month.notes = notes;

  return normalizeMonthForImport(month, fallback);
}

async function saveAdminRotationFromDom(monthKey) {
  if (!monthKey) throw new Error('Chybí měsíc.');
  const fallback = app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
  const normalized = readAdminRotationFromDom(monthKey);
  if (!app.rotation.months) app.rotation.months = {};
  app.rotation.months[monthKey] = normalized;
  app.rotation = normalizeRotationData(app.rotation);
  app.selectedMonth = monthKey;
  saveRotationData();
  renderRotace();
  if (typeof renderMonth === 'function') renderMonth(monthKey);
  if (app.selectedName && typeof renderPerson === 'function') renderPerson(app.selectedName);
  let saveResult = null;
  if (app.adminUnlocked) {
    saveResult = await saveRotationToSupabase(app.rotation, { source: 'admin-menu', monthKey });
  }
  return { normalized, saveResult };
}




function formatAdminReportDate(value) {
  try {
    const d = value ? new Date(value) : null;
    if (!d || Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('cs-CZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch (err) { return '—'; }
}

function normalizeAdminReportTypeLabel(value) {
  const raw = String(value || '').toLowerCase();
  if (raw === 'nelibi') return 'Nelíbí se mi';
  if (raw === 'napad') return 'Nápad';
  if (raw === 'vykon') return 'Výkon / sekání';
  if (raw === 'hra') return 'Hra';
  if (raw === 'ostatni') return 'Ostatní';
  return 'Chyba';
}

function normalizeAdminReportStatusLabel(value) {
  const raw = String(value || '').toLowerCase();
  if (raw === 'seen') return 'Viděno';
  if (raw === 'done') return 'Hotovo';
  if (raw === 'ignored') return 'Ignorovat';
  return 'Nové';
}

function getAdminReportsCache() {
  return Array.isArray(app.adminBugReports) ? app.adminBugReports : [];
}

function isAdminReportUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || '').trim());
}

function buildAdminReportsHtml() {
  const rows = getAdminReportsCache();
  const list = rows.length ? rows.map((row) => {
    const id = escapeHtml(String(row.id || ''));
    const status = String(row.status || 'new');
    const device = row.device_info && typeof row.device_info === 'object' ? row.device_info : {};
    const meta = [
      row.app_version ? String(row.app_version) : '',
      row.route ? String(row.route) : '',
      device.theme ? ('Theme ' + String(device.theme)) : '',
      device.background ? ('Pozadí ' + String(device.background)) : ''
    ].filter(Boolean).join(' · ');
    return [
      '<details class="adminReportItem" data-report-id="' + id + '">',
      '  <summary class="adminReportSummary">',
      '    <span><b>' + escapeHtml(normalizeAdminReportTypeLabel(row.report_type)) + '</b><small>' + escapeHtml(formatAdminReportDate(row.created_at)) + ' · ' + escapeHtml(row.player_name || row.account_number || 'bez jména') + '</small></span>',
      '    <em class="adminReportStatus adminReportStatus-' + escapeHtml(status) + '">' + escapeHtml(normalizeAdminReportStatusLabel(status)) + '</em>',
      '  </summary>',
      '  <div class="adminReportBody">',
      '    <div class="adminReportMessage">' + escapeHtml(row.message || '') + '</div>',
      meta ? '    <div class="smallText">' + escapeHtml(meta) + '</div>' : '',
      row.user_agent ? '    <div class="smallText adminReportDevice">' + escapeHtml(row.user_agent) + '</div>' : '',
      '    <div class="appMenuActionRow adminReportActions">',
      '      <button type="button" class="appMenuAction" data-admin-action="report-seen" data-report-id="' + id + '">Viděno</button>',
      '      <button type="button" class="appMenuAction isActive" data-admin-action="report-done" data-report-id="' + id + '">Hotovo</button>',
      '      <button type="button" class="appMenuAction" data-admin-action="report-ignore" data-report-id="' + id + '">Ignorovat</button>',
      '      <button type="button" class="appMenuAction adminReportDeleteBtn" data-admin-action="report-delete" data-report-id="' + id + '">Smazat</button>',
      '    </div>',
      '  </div>',
      '</details>'
    ].join('');
  }).join('') : '<div class="appMenuText">Zatím tu nejsou žádné reporty.</div>';
  return [
    '<div class="adminReportsFolder">',
    '  <div class="adminReportsToolbar">',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="load-reports">Načíst reporty</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="download-reports">Stáhnout reporty</button>',
    '    <span class="smallText">' + String(rows.length || 0) + ' záznamů</span>',
    '  </div>',
    '  <div class="adminReportsList">' + list + '</div>',
    '</div>'
  ].join('');
}

function normalizeLocalBugReportsForAdmin() {
  try {
    const raw = typeof parseLocalStorageJsonCached === 'function'
      ? parseLocalStorageJsonCached(RAK_REPORTS_KEY, [])
      : JSON.parse(localStorage.getItem(RAK_REPORTS_KEY) || '[]');
    return (Array.isArray(raw) ? raw : []).filter((report) => !(report && report.adminDeleted)).map((report, idx) => {
      const device = {
        theme: report.theme || '',
        background: report.background || '',
        source: 'local-backup',
        sourceId: report.id || ('local-' + idx),
        game: report.game || '',
        online: !!report.online
      };
      return {
        id: report.id || ('local-report-' + idx),
        account_number: report.accountId || '',
        player_name: report.accountName || '',
        report_type: report.type || 'Chyba',
        message: report.text || '',
        app_version: report.version || '',
        route: report.page || '',
        user_agent: report.userAgent || '',
        device_info: device,
        status: report.adminStatus || report.status || 'new',
        created_at: report.createdAt || new Date().toISOString(),
        local_only: true,
        handled_at: report.handledAt || '',
        handled_note: report.handledNote || ''
      };
    }).filter((row) => String(row.message || '').trim());
  } catch (err) {
    console.warn('normalizeLocalBugReportsForAdmin failed', err);
    return [];
  }
}

function mergeAdminBugReports(remoteRows, localRows) {
  const map = new Map();
  const add = (row) => {
    if (!row) return;
    const device = row.device_info && typeof row.device_info === 'object' ? row.device_info : {};
    const key = String(row.id || device.sourceId || row.created_at || Math.random()).trim();
    if (!key || map.has(key)) return;
    map.set(key, row);
  };
  (Array.isArray(remoteRows) ? remoteRows : []).forEach(add);
  (Array.isArray(localRows) ? localRows : []).forEach(add);
  return Array.from(map.values()).sort((a, b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
}

function downloadAdminBugReports() {
  try {
    const rows = getAdminReportsCache();
    const statusEl = document.getElementById('adminOnlineSaveStatus');
    if (!rows.length) {
      if (statusEl) statusEl.textContent = 'Žádné reporty k exportu.';
      try { showToast('Žádné reporty k exportu.'); } catch (err) {}
      return { ok: true, empty: true };
    }
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), appVersion: (typeof APP_VERSION !== 'undefined' ? APP_VERSION : ''), rows }, null, 2);
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RaK_reporty_chyb_' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
    if (statusEl) statusEl.textContent = 'Reporty stažené.';
    return { ok: true, rows: rows.length };
  } catch (err) {
    const statusEl = document.getElementById('adminOnlineSaveStatus');
    if (statusEl) statusEl.textContent = 'Stažení reportů se nepovedlo.';
    console.warn('downloadAdminBugReports failed', err);
    return { ok: false, error: err };
  }
}

async function loadAdminBugReportsFromSupabase() {
  const localRows = normalizeLocalBugReportsForAdmin();
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadBugReports === 'function') {
    try {
      const result = await window.RotationSupabaseBridge.loadBugReports({ limit: 50, status: 'all' });
      const remoteRows = result && Array.isArray(result.rows) ? result.rows : [];
      app.adminBugReports = mergeAdminBugReports(remoteRows, localRows);
      return Object.assign({}, result || {}, { ok: true, rows: app.adminBugReports });
    } catch (err) {
      console.warn('loadAdminBugReportsFromSupabase failed, using local backup', err);
      app.adminBugReports = localRows;
      return { ok: false, rows: localRows, reason: 'remote-failed', error: err };
    }
  }
  app.adminBugReports = localRows;
  return { ok: false, rows: localRows, reason: 'missing-bridge' };
}

function updateLocalBugReportRecord(reportId, patch) {
  try {
    const raw = typeof parseLocalStorageJsonCached === 'function'
      ? parseLocalStorageJsonCached(RAK_REPORTS_KEY, [])
      : JSON.parse(localStorage.getItem(RAK_REPORTS_KEY) || '[]');
    const rows = Array.isArray(raw) ? raw : [];
    let changed = false;
    rows.forEach((report, idx) => {
      if (!report || typeof report !== 'object') return;
      const ids = [report.id, 'local-report-' + idx, report.createdAt, report.created_at].map(v => String(v || '').trim()).filter(Boolean);
      if (!ids.includes(String(reportId || '').trim())) return;
      Object.assign(report, patch || {});
      changed = true;
    });
    if (changed) localStorage.setItem(RAK_REPORTS_KEY, JSON.stringify(rows));
    return changed;
  } catch (err) {
    console.warn('updateLocalBugReportRecord failed', err);
    return false;
  }
}

async function updateAdminBugReportStatus(reportId, status) {
  if (!reportId) return { ok: false, reason: 'missing-id' };
  const rows = getAdminReportsCache();
  const hit = rows.find(r => String(r.id || '') === String(reportId));
  const note = 'Změněno z administrace RaK';
  const handledAt = new Date().toISOString();
  if (hit && (hit.local_only || !isAdminReportUuid(reportId))) {
    hit.status = status;
    hit.handled_at = handledAt;
    hit.handled_note = note;
    updateLocalBugReportRecord(reportId, { adminStatus: status, status, handledAt, handledNote: note });
    return { ok: true, localOnly: true };
  }
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.updateBugReportStatus === 'function') {
    const result = await window.RotationSupabaseBridge.updateBugReportStatus(reportId, status, note);
    if (result && result.ok) {
      if (hit) {
        hit.status = status;
        hit.handled_at = handledAt;
        hit.handled_note = note;
      }
    }
    return result;
  }
  return { ok: false, reason: 'missing-bridge' };
}

async function deleteAdminBugReport(reportId) {
  if (!reportId) return { ok: false, reason: 'missing-id' };
  const rows = getAdminReportsCache();
  const index = rows.findIndex(r => String(r.id || '') === String(reportId));
  const hit = index >= 0 ? rows[index] : null;
  if (hit && (hit.local_only || !isAdminReportUuid(reportId))) {
    updateLocalBugReportRecord(reportId, { adminDeleted: true, status: 'deleted', adminStatus: 'deleted' });
    rows.splice(index, 1);
    return { ok: true, localOnly: true, deleted: true };
  }
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.deleteBugReport === 'function') {
    const result = await window.RotationSupabaseBridge.deleteBugReport(reportId);
    if (result && result.ok && index >= 0) rows.splice(index, 1);
    return result;
  }
  return { ok: false, reason: 'missing-bridge' };
}


function formatAdminServiceCount(value) {
  if (value === null || typeof value === 'undefined') return '—';
  return String(Number(value || 0) || 0);
}

function formatAdminUsageDate(value, includeSeconds) {
  try {
    const d = value ? new Date(value) : null;
    if (!d || Number.isNaN(d.getTime())) return '—';
    const opts = includeSeconds
      ? { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }
      : { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' };
    return d.toLocaleString('cs-CZ', opts);
  } catch (err) { return '—'; }
}

function formatAdminUsageAgo(value) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes)) return '';
  if (minutes < 1) return 'teď';
  if (minutes < 60) return 'před ' + Math.round(minutes) + ' min';
  if (minutes < 60 * 24) return 'před ' + Math.round(minutes / 60) + ' h';
  return 'před ' + Math.round(minutes / 60 / 24) + ' dny';
}

function shortAdminUsageDevice(value) {
  const ua = String(value || '');
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Macintosh|Mac OS/i.test(ua)) return 'Mac';
  return ua ? ua.slice(0, 42) : 'Zařízení neznámé';
}

function formatAdminUsageViewport(info) {
  const base = info && typeof info === 'object' ? info : {};
  const parseMaybeJson = (value) => {
    if (value && typeof value === 'object') return value;
    const raw = String(value || '').trim();
    if (!raw) return {};
    try { return JSON.parse(raw); } catch (err) { return { raw }; }
  };
  const mergeDeviceInfo = (value) => {
    const parsed = parseMaybeJson(value);
    if (parsed && (parsed.viewport || parsed.screen || parsed.dpr || parsed.viewportWidth || parsed.screenWidth)) return parsed;
    return {};
  };
  const nested = Object.assign({}, mergeDeviceInfo(base.screen), mergeDeviceInfo(base.raw), mergeDeviceInfo(base.deviceInfo));
  const obj = Object.assign({}, base, nested);
  const vp = parseMaybeJson(obj.viewport);
  const scrCandidate = parseMaybeJson(obj.screen);
  const scr = scrCandidate && (scrCandidate.width || scrCandidate.height)
    ? scrCandidate
    : parseMaybeJson(scrCandidate.screen || obj.screenInfo || obj.display || '');
  const nestedVp = scrCandidate && scrCandidate.viewport ? parseMaybeJson(scrCandidate.viewport) : {};
  const nestedScr = scrCandidate && scrCandidate.screen ? parseMaybeJson(scrCandidate.screen) : {};
  const w = Number(vp.width || nestedVp.width || obj.viewportWidth || obj.innerWidth || 0) || 0;
  const h = Number(vp.height || nestedVp.height || obj.viewportHeight || obj.innerHeight || 0) || 0;
  const dpr = Number(vp.dpr || nestedVp.dpr || obj.dpr || obj.devicePixelRatio || 0) || 0;
  const sw = Number(nestedScr.width || scr.width || obj.screenWidth || 0) || 0;
  const sh = Number(nestedScr.height || scr.height || obj.screenHeight || 0) || 0;
  const rawScreen = scr.raw && !/^Europe\//i.test(String(scr.raw)) ? String(scr.raw) : '';
  const parts = [];
  if (w && h) parts.push('Viewport ' + w + '×' + h);
  if (sw && sh && (sw !== w || sh !== h)) parts.push('Screen ' + sw + '×' + sh);
  else if (!w && !h && sw && sh) parts.push('Screen ' + sw + '×' + sh);
  else if (!w && !h && rawScreen) parts.push(rawScreen);
  if (dpr) parts.push('DPR ' + dpr);
  return parts.filter(Boolean).join(' · ') || '—';
}

async function loadAdminAppUsageFromSupabase() {
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadAppUsage === 'function') {
    const result = await window.RotationSupabaseBridge.loadAppUsage({ limit: 100 });
    app.adminUsageSnapshot = result || null;
    return app.adminUsageSnapshot;
  }
  app.adminUsageSnapshot = { ok: false, reason: 'missing-bridge', devices: [], events: [], summary: {} };
  return app.adminUsageSnapshot;
}

async function recordAdminAppUsageNow() {
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.recordAppUsage === 'function') {
    return window.RotationSupabaseBridge.recordAppUsage({ force: true, eventType: 'admin-manual-check' });
  }
  return { ok: false, reason: 'missing-bridge' };
}

function buildAdminUsageGroups(devices) {
  const rows = Array.isArray(devices) ? devices : [];
  const map = new Map();
  rows.forEach((row) => {
    const displayName = String(row.player_name || row.account_number || 'Bez profilu').trim() || 'Bez profilu';
    const keyBase = String(row.player_name || row.account_number || '').trim().toLowerCase();
    const key = keyBase || ('device:' + String(row.device_key || row.device_id || Math.random()).slice(0, 96));
    if (!map.has(key)) {
      map.set(key, {
        key,
        name: displayName,
        account: String(row.account_number || '').trim(),
        devices: [],
        openCount: 0,
        firstSeen: null,
        lastSeen: null,
        newest: null,
        appVersions: new Set(),
        displays: new Set()
      });
    }
    const group = map.get(key);
    group.devices.push(row);
    group.openCount += Number(row.open_count || 0) || 0;
    if (row.app_version) group.appVersions.add(String(row.app_version));
    const display = formatAdminUsageViewport(row.device_info);
    if (display && display !== '—') group.displays.add(display);
    const lastTime = Date.parse(row.last_seen_at || '') || 0;
    const firstTime = Date.parse(row.first_seen_at || '') || 0;
    if (!group.lastSeen || lastTime > (Date.parse(group.lastSeen) || 0)) {
      group.lastSeen = row.last_seen_at || group.lastSeen;
      group.newest = row;
    }
    if (row.first_seen_at && (!group.firstSeen || firstTime < (Date.parse(group.firstSeen) || 0))) {
      group.firstSeen = row.first_seen_at;
    }
  });
  return Array.from(map.values()).sort((a, b) => (Date.parse(b.lastSeen || '') || 0) - (Date.parse(a.lastSeen || '') || 0));
}

function buildAdminUsageHtml() {
  const snapshot = app && app.adminUsageSnapshot && typeof app.adminUsageSnapshot === 'object'
    ? app.adminUsageSnapshot
    : null;
  const ok = !!(snapshot && snapshot.ok !== false);
  const devices = snapshot && Array.isArray(snapshot.devices) ? snapshot.devices : [];
  const groups = buildAdminUsageGroups(devices);
  const events = snapshot && Array.isArray(snapshot.events) ? snapshot.events : [];
  const summary = snapshot && snapshot.summary && typeof snapshot.summary === 'object' ? snapshot.summary : {};
  const status = snapshot
    ? (ok ? ('Načteno ' + formatAdminUsageDate(snapshot.fetchedAt || new Date().toISOString())) : ('Nepodařilo se načíst: ' + String((snapshot.error && snapshot.error.message) || snapshot.reason || 'zkontroluj Supabase migraci.')))
    : 'Zatím nenačteno. Klikni na Načíst připojení.';
  const newestGroup = groups[0] || null;
  const cards = [
    ['Jména / profily', groups.length],
    ['Zařízení celkem', summary.device_count ?? devices.length],
    ['Aktivní 24 h', summary.active_24h ?? '—'],
    ['Aktivní 7 dní', summary.active_7d ?? '—']
  ].map(pair => '<div class="adminUsageMetric"><span>' + escapeHtml(pair[0]) + '</span><b>' + escapeHtml(String(pair[1])) + '</b></div>').join('');
  const list = groups.length ? groups.map((group) => {
    const newest = group.newest || group.devices[0] || {};
    const ago = formatAdminUsageAgo(newest.minutes_since_seen);
    const deviceCount = group.devices.length;
    const versions = Array.from(group.appVersions).slice(0, 3).join(' · ') || '—';
    const displays = Array.from(group.displays).slice(0, 4);
    const displayText = displays.length ? displays.join(' | ') : '—';
    const deviceRows = group.devices
      .slice()
      .sort((a, b) => (Date.parse(b.last_seen_at || '') || 0) - (Date.parse(a.last_seen_at || '') || 0))
      .map((row, index) => {
        const device = shortAdminUsageDevice(row.user_agent || '');
        const hash = row.last_ip_hash ? String(row.last_ip_hash).slice(0, 10) + '…' : '—';
        return [
          '<div class="adminUsageDeviceRow">',
          '  <div class="adminUsageDeviceHead"><b>' + escapeHtml(device || ('Zařízení ' + (index + 1))) + '</b><em>' + escapeHtml(String(row.open_count || 0) + '×') + '</em></div>',
          '  <div><b>Naposledy:</b> ' + escapeHtml(formatAdminUsageDate(row.last_seen_at, true)) + '</div>',
          '  <div><b>Poprvé:</b> ' + escapeHtml(formatAdminUsageDate(row.first_seen_at, true)) + '</div>',
          '  <div><b>Verze:</b> ' + escapeHtml(row.app_version || '—') + '</div>',
          '  <div><b>Displej:</b> ' + escapeHtml(formatAdminUsageViewport(row.device_info)) + '</div>',
          '  <div><b>IP hash:</b> ' + escapeHtml(hash) + '</div>',
          '  <div class="smallText adminUsageUa">' + escapeHtml(row.user_agent || '—') + '</div>',
          '</div>'
        ].join('');
      }).join('');
    return [
      '<details class="adminUsageItem">',
      '  <summary class="adminUsageSummary">',
      '    <span><b>' + escapeHtml(group.name) + '</b><small>' + escapeHtml(String(deviceCount) + ' zařízení · ' + (ago || formatAdminUsageDate(group.lastSeen))) + '</small></span>',
      '    <em>' + escapeHtml(String(group.openCount || 0) + '×') + '</em>',
      '  </summary>',
      '  <div class="adminUsageBody">',
      '    <div><b>Naposledy:</b> ' + escapeHtml(formatAdminUsageDate(group.lastSeen, true)) + '</div>',
      '    <div><b>Poprvé:</b> ' + escapeHtml(formatAdminUsageDate(group.firstSeen, true)) + '</div>',
      group.account ? ('    <div><b>Profil:</b> ' + escapeHtml(group.account) + '</div>') : '',
      '    <div><b>Verze:</b> ' + escapeHtml(versions) + '</div>',
      '    <div><b>Displeje:</b> ' + escapeHtml(displayText) + '</div>',
      '    <div class="adminUsageDeviceList">' + deviceRows + '</div>',
      '  </div>',
      '</details>'
    ].join('');
  }).join('') : '<div class="smallText adminUsageEmpty">Zatím tu nejsou žádná zařízení. Jakmile někdo otevře novou verzi a Supabase migrace bude nasazená, objeví se tady.</div>';
  const recentEvents = events.slice(0, 8).map((ev) => {
    const label = [ev.player_name || ev.account_number || 'Bez profilu', ev.event_type || 'open', formatAdminUsageDate(ev.seen_at)].filter(Boolean).join(' · ');
    return '<div class="adminUsageEvent">' + escapeHtml(label) + '</div>';
  }).join('');
  return [
    '<div class="appMenuCard appMenuAdminCard adminUsageCard">',
    '  <div class="appMenuCardTitle">Přehled připojení</div>',
    '  <div class="appMenuText">',
    '    <div>Každé jméno je tady jen jednou. Po rozkliknutí uvidíš všechna zařízení, ze kterých se profil připojil, včetně rozlišení displeje.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">' + escapeHtml(status) + '</div>',
    '  </div>',
    '  <div class="adminUsageGrid">' + cards + '</div>',
    newestGroup ? ('  <div class="adminUsageLatest smallText">Naposledy: ' + escapeHtml(String(newestGroup.name || 'Bez profilu')) + ' · ' + escapeHtml(formatAdminUsageDate(newestGroup.lastSeen, true)) + '</div>') : '',
    '  <div class="adminUsageList">' + list + '</div>',
    recentEvents ? ('  <div class="adminUsageEvents"><div class="smallText">Poslední události</div>' + recentEvents + '</div>') : '',
    '  <div class="appMenuActionRow adminUsageActions">',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="usage-load">Načíst připojení</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');
}


function getAdminServiceSnapshotCache() {
  return app && app.adminServiceSnapshot && typeof app.adminServiceSnapshot === 'object' ? app.adminServiceSnapshot : null;
}

async function loadAdminServiceSnapshotFromSupabase() {
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.getAdminServiceSnapshot === 'function') {
    const result = await window.RotationSupabaseBridge.getAdminServiceSnapshot();
    app.adminServiceSnapshot = result || null;
    return result;
  }
  app.adminServiceSnapshot = { ok: false, reason: 'missing-bridge', counts: {} };
  return app.adminServiceSnapshot;
}

async function cleanupAdminExpiredInvites() {
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.cleanupExpiredGameInvites === 'function') {
    return window.RotationSupabaseBridge.cleanupExpiredGameInvites();
  }
  return { ok: false, reason: 'missing-bridge' };
}

function buildAdminServiceHtml() {
  const snapshot = getAdminServiceSnapshotCache();
  const counts = snapshot && snapshot.counts ? snapshot.counts : {};
  const sync = snapshot && snapshot.sync ? snapshot.sync : (typeof getSupabaseSyncStatus === 'function' ? getSupabaseSyncStatus() : null);
  const profileUi = typeof getProfileUiSyncStatus === 'function' ? getProfileUiSyncStatus() : null;
  const pwa = typeof getPwaHardeningStatus === 'function' ? getPwaHardeningStatus() : null;
  const statusText = snapshot
    ? (snapshot.ok ? ('Načteno ' + new Date(snapshot.at || Date.now()).toLocaleString('cs-CZ')) : 'Servisní stav se nepodařilo načíst.')
    : 'Klikni na Načíst stav a uvidíš online počty.';
  const rows = [
    ['Hráčské profily', counts.game_accounts],
    ['Herní statistiky', counts.game_stats],
    ['Profilový vzhled', counts.profile_ui_settings],
    ['Pozvánky celkem', counts.game_invites],
    ['Čekající pozvánky', counts.game_invites_pending],
    ['Session celkem', counts.game_sessions],
    ['Aktivní session', counts.game_sessions_active],
    ['Nové reporty', counts.bug_reports_new],
    ['Zařízení v appce', counts.app_usage_devices],
    ['Otevření 24 h', counts.app_usage_events_24h]
  ].map(pair => '<div class="adminServiceMetric"><span>' + escapeHtml(pair[0]) + '</span><b>' + escapeHtml(formatAdminServiceCount(pair[1])) + '</b></div>').join('');
  return [
    '<div class="appMenuCard appMenuAdminCard adminServiceCard">',
    '  <div class="appMenuCardTitle">Servis / synchronizace</div>',
    '  <div class="appMenuText">',
    '    <div>Tady je rychlá údržba appky: sync rozpisu, herních statistik, kontrola aktualizace a úklid starých pozvánek.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">' + escapeHtml(statusText) + '</div>',
    '  </div>',
    '  <div class="adminServiceGrid">' + rows + '</div>',
    '  <div class="adminServiceDiag smallText">',
    sync ? ('Online stav: ' + escapeHtml(sync.label || sync.kind || '—') + '<br>') : '',
    profileUi ? ('Profilový vzhled: ' + escapeHtml(profileUi.account || 'bez profilu') + ' · theme ' + escapeHtml(profileUi.themeId || '—') + ' · pozadí ' + escapeHtml(profileUi.backgroundId || '—') + '<br>') : '',
    pwa ? ('PWA: poslední kontrola ' + escapeHtml(pwa.lastUpdateCheckAgoMs === null ? '—' : Math.round(Number(pwa.lastUpdateCheckAgoMs || 0) / 1000) + ' s') + ' · čeká update ' + escapeHtml(pwa.updateToastVisible ? 'ano' : 'ne')) : '',
    '  </div>',
    '  <div class="appMenuActionRow adminServiceActions">',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="service-sync-now">Vynutit synchronizaci</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="service-update-check">Kontrola aktualizace</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="service-load-status">Načíst stav</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="service-clean-invites">Vyčistit pozvánky</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');
}



function rakFormatDatetimeLocal(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function rakDatetimeLocalToIso(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

function buildAdminAnnouncementHtml() {
  const current = typeof window.readRakDashboardAdminAnnouncement === 'function'
    ? window.readRakDashboardAdminAnnouncement()
    : (typeof window.readRakLocalDashboardAnnouncement === 'function' ? window.readRakLocalDashboardAnnouncement() : null);
  const active = current && current.isActive !== false;
  const marquee = !current || current.marquee !== false;
  const health = typeof window.getRakDashboardAnnouncementHealth === 'function' ? window.getRakDashboardAnnouncementHealth() : null;
  const status = health
    ? ('Stav: ' + (health.domPresent ? 'panel připraven' : 'panel nenalezen') + ' · aktivní teď: ' + (health.activeHasMessage ? 'ano' : 'ne'))
    : 'Oznámení se ukládá lokálně v této appce.';
  return [
    '<div class="appMenuCard appMenuAdminCard adminAnnouncementCard">',
    '  <div class="appMenuCardTitle">Oznámení na Dashboardu</div>',
    '  <div class="appMenuText">',
    '    <div>Nastavíš text, který se zobrazí nad prvním panelem na Dashboardu. Ukládá se lokálně v této appce a má se znovu ukázat i po vypnutí a zapnutí.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">' + escapeHtml(status) + '</div>',
    '  </div>',
    '  <label class="appMenuFieldLabel" for="adminAnnouncementTitle">Nadpis <span class="smallText">volitelné</span></label>',
    '  <input class="appMenuInlineInput adminAnnouncementInput" id="adminAnnouncementTitle" maxlength="80" value="' + escapeHtml(current ? current.title || '' : '') + '" placeholder="Volitelné – klidně nech prázdné">',
    '  <label class="appMenuFieldLabel" for="adminAnnouncementMessage">Text</label>',
    '  <textarea class="appMenuReportTextarea adminAnnouncementTextarea" id="adminAnnouncementMessage" maxlength="500" rows="4" placeholder="Třeba: V pátek bude odstávka, počítej s tím.">' + escapeHtml(current ? current.message || '' : '') + '</textarea>',
    '  <div class="adminAnnouncementTwoCols">',
    '    <div><label class="appMenuFieldLabel" for="adminAnnouncementStart">Od</label><input class="appMenuInlineInput" id="adminAnnouncementStart" type="datetime-local" value="' + escapeHtml(rakFormatDatetimeLocal(current ? current.startAt : '')) + '"></div>',
    '    <div><label class="appMenuFieldLabel" for="adminAnnouncementEnd">Do</label><input class="appMenuInlineInput" id="adminAnnouncementEnd" type="datetime-local" value="' + escapeHtml(rakFormatDatetimeLocal(current ? current.endAt : '')) + '"></div>',
    '  </div>',
    '  <div class="adminAnnouncementToggleRow">',
    '    <label class="adminAnnouncementCheck"><input id="adminAnnouncementActive" type="checkbox" ' + (active ? 'checked' : '') + '><span>Aktivní</span></label>',
    '    <label class="adminAnnouncementCheck"><input id="adminAnnouncementMarquee" type="checkbox" ' + (marquee ? 'checked' : '') + '><span>Text má jezdit</span></label>',
    '  </div>',
    '  <div class="dashboardAnnouncementBar adminAnnouncementPreview isVisible" aria-hidden="true">',
    '    <div class="dashboardAnnouncementLabel">Náhled</div>',
    '    <div class="dashboardAnnouncementTrack isMarquee"><span>' + escapeHtml((current && current.message) ? current.message : 'Tady pojede nastavený text oznámení.') + '</span></div>',
    '  </div>',
    '  <div class="appMenuActionRow adminAnnouncementActions">',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-announcement">Uložit oznámení</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="clear-announcement">Vypnout oznámení</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');
}

function readAdminAnnouncementFromDom() {
  const title = String(document.getElementById('adminAnnouncementTitle')?.value || '').trim();
  const message = String(document.getElementById('adminAnnouncementMessage')?.value || '').trim();
  const startAt = rakDatetimeLocalToIso(document.getElementById('adminAnnouncementStart')?.value || '');
  const endAt = rakDatetimeLocalToIso(document.getElementById('adminAnnouncementEnd')?.value || '');
  const isActive = !!document.getElementById('adminAnnouncementActive')?.checked;
  const marquee = !!document.getElementById('adminAnnouncementMarquee')?.checked;
  return { title, message, startAt, endAt, isActive, marquee };
}

function renderAdminMenuBody(body, section) {
  const mode = String(section || 'home').trim() || 'home';
  const months = getAdminRotationMonthKeys();
  const monthKey = getAdminSelectedMonthKey();
  body.dataset.adminView = mode;
  try { adminSetRotationViewportLock(mode === 'rotation'); } catch (err) {}
  const page = document.getElementById('menu');
  if (page) page.dataset.adminView = mode;

  const homeHtml = [
    '<div class="appMenuCard appMenuAdminCard">',
    '  <div class="appMenuCardTitle">Administrace</div>',
    '  <div class="appMenuText">',
    '    <div>Nejprve stroje, pak rozpisy a export až nakonec. Všechno se ukládá online přes Supabase.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Vyber sekci, kterou chceš upravit.</div>',
    '  </div>',
    '  <div class="appMenuSettingsList">',
    '    <button type="button" class="appMenuAction" data-admin-action="open-machines">Nastavení strojů</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-rotation">Rozpisy</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-announcement">Oznámení Dashboard</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-usage">Přehled připojení</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-export">Export / import</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-reports">Reporty chyb</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="open-service">Servis / synchronizace</button>',
    '  </div>',
    '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
    '</div>'
  ].join('');

  const machinesHtml = [
    '<div class="appMenuCard appMenuAdminCard adminMachinesCard">',
    '  <div class="appMenuCardTitle">Nastavení strojů</div>',
    '  <div class="appMenuText">',
    '    <div>Každý stroj je jeden řádek. U brusů se zapisuje stroj + index + parametry.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Stav uložení se zobrazí po kliknutí na Uložit stroje.</div>',
    '  </div>',
    buildAdminMachineSettingsTableHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-machines">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-machines">Uložit stroje</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  const rotationHtml = [
    '<div class="appMenuCard appMenuAdminCard">',
    '  <div class="appMenuCardTitle">Rozpisy</div>',
    '  <div class="appMenuText">',
    '    <div>Vyber měsíc a uprav si rozpis. Změny se ukládají online a hned se promítnou zpět do aplikace.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Stav uložení se zobrazí po kliknutí na Uložit rozpis.</div>',
    '  </div>',
    renderAdminMonthPickerHtml(monthKey),
    '  <select id="adminMonthSelect" class="appMenuSelect appMenuHiddenSelect">' + months.map(m => '<option value="' + escapeHtml(m) + '"' + (m === monthKey ? ' selected' : '') + '>' + escapeHtml(m) + '</option>').join('') + '</select>',
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-month">Načíst měsíc</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="load-online">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-rotation">Uložit rozpis</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    buildAdminRotationTableHtml(monthKey),
    '</div>'
  ].join('');

  const announcementHtml = buildAdminAnnouncementHtml();
  const usageHtml = buildAdminUsageHtml();

  const importPreview = (typeof getRakExcelImportPreview === 'function') ? getRakExcelImportPreview() : null;
  const exportHtml = [
    '<div class="appMenuCard appMenuAdminCard">',
    '  <div class="appMenuCardTitle">Export / import</div>',
    '  <div class="appMenuText">',
    '    <div>Import funguje ve dvou krocích: vybereš Excel, appka načte jen měsíční listy typu 01.2025 a potom si vybereš celý rok nebo konkrétní měsíc. Pomocné listy se ignorují.</div>',
    '    <div class="smallText" id="rakExcelImportStatus">Export ZIP se stáhne jako kompletní build aplikace.</div>',
    '  </div>',
    '  <div class="appMenuSettingsList">',
    '    <div class="smallText" id="rakExcelImportFileStatus">' + escapeHtml(importPreview ? ('Načteno: ' + importPreview.fileName + ' · měsíčních listů: ' + importPreview.monthKeys.length) : 'Zatím není vybraný žádný Excel.') + '</div>',
    '    <button type="button" class="appMenuAction" data-admin-action="excel-pick">Vybrat Excel</button>',
    '    <label class="appMenuFieldLabel" for="rakExcelImportScope">Co importovat</label>',
    '    <select id="rakExcelImportScope" class="appMenuSelect">',
    '      <option value="all" selected>Celý načtený Excel / rok</option>',
    '      <option value="month">Jen vybraný měsíc</option>',
    '    </select>',
    '    <label class="appMenuFieldLabel" for="rakExcelImportDetectedMonth">Načtené měsíce z Excelu</label>',
    '    <select id="rakExcelImportDetectedMonth" class="appMenuSelect" disabled>',
    '      <option value="">Nejdřív vyber Excel</option>',
    '    </select>',
    '  </div>',
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction isActive" id="rakExcelImportCommitBtn" data-admin-action="excel-import" disabled>Načíst do rozpisů</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="export">Export ZIP</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');


  const reportsHtml = [
    '<div class="appMenuCard appMenuAdminCard adminReportsCard">',
    '  <div class="appMenuCardTitle">Reporty chyb</div>',
    '  <div class="appMenuText">',
    '    <div>Tady uvidíš, co uživatelé poslali přes Pošli mi chybu. Reporty chodí do Supabase tabulky bug_reports.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Načti reporty a podle potřeby je označ jako viděné nebo hotové.</div>',
    '  </div>',
    buildAdminReportsHtml(),
    '  <button type="button" class="appMenuAction appMenuBack" data-admin-action="back-admin">Zpět</button>',
    '</div>'
  ].join('');

  const serviceHtml = buildAdminServiceHtml();

  if (mode === 'machines') {
    body.innerHTML = machinesHtml;
  } else if (mode === 'rotation') {
    body.innerHTML = rotationHtml;
  } else if (mode === 'announcement') {
    body.innerHTML = announcementHtml;
  } else if (mode === 'usage') {
    body.innerHTML = usageHtml;
  } else if (mode === 'export') {
    body.innerHTML = exportHtml;
  } else if (mode === 'reports') {
    body.innerHTML = reportsHtml;
  } else if (mode === 'service') {
    body.innerHTML = serviceHtml;
  } else {
    body.innerHTML = homeHtml;
  }

  if (mode === 'rotation') {
    runAdminRotationEditorMaintenance(body, 'render-admin-rotation');
  }
  if (mode === 'export' && typeof updateRakExcelImportPreviewUi === 'function') {
    setTimeout(() => {
      try { updateRakExcelImportPreviewUi(); } catch (err) { console.warn('Excel preview UI update failed', err); }
    }, 0);
  }
}



const RAK_REPORTS_KEY = APP_KEY + ':userReports';

function getBugReportAccount() {
  try {
    if (typeof gamesGetActiveAccount === 'function') return gamesGetActiveAccount();
  } catch (err) {}
  try {
    const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : (app && app.gamesProfile);
    return profile && profile.activeAccountId && profile.accounts ? profile.accounts[profile.activeAccountId] : null;
  } catch (err) {}
  return null;
}

function buildBugReportPayload() {
  const account = getBugReportAccount();
  const typeEl = document.getElementById('bugReportType');
  const textEl = document.getElementById('bugReportText');
  const type = String(typeEl && typeEl.value || 'Chyba').trim() || 'Chyba';
  const text = String(textEl && textEl.value || '').trim();
  const version = String((typeof app !== 'undefined' && app.version) || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '—'));
  const theme = String(typeof getThemePreference === 'function' ? getThemePreference() : (document.documentElement.dataset.rakTheme || '—'));
  const background = String(typeof getBackgroundPreference === 'function' ? getBackgroundPreference() : (document.documentElement.dataset.rakBackground || '—'));
  return {
    id: 'report-' + Date.now(),
    type,
    text,
    accountId: account ? String(account.id || '') : '',
    accountName: account ? String(account.name || account.id || '') : '',
    version,
    page: String(document.querySelector('.page.active')?.id || '—'),
    game: String((typeof app !== 'undefined' && app.activeGameShell) || ''),
    theme,
    background,
    online: !!(typeof navigator !== 'undefined' && navigator.onLine),
    userAgent: String(navigator.userAgent || ''),
    createdAt: new Date().toISOString(),
    createdAtLocal: new Date().toLocaleString('cs-CZ')
  };
}

function formatBugReportMessage(report) {
  return [
    'RaK report – ' + String(report.type || 'Chyba'),
    '',
    'Od: ' + (report.accountName ? report.accountName + ' (' + report.accountId + ')' : 'nepřihlášený'),
    'Verze: ' + String(report.version || '—'),
    'Kdy: ' + String(report.createdAtLocal || '—'),
    'Stránka: ' + String(report.page || '—') + (report.game ? ' · hra: ' + report.game : ''),
    'Theme/pozadí: ' + String(report.theme || '—') + ' / ' + String(report.background || '—'),
    'Online: ' + (report.online ? 'ano' : 'ne'),
    '',
    'Text:',
    String(report.text || '').trim(),
    '',
    'Zařízení:',
    String(report.userAgent || '—')
  ].join('\n');
}

function saveBugReportLocal(report) {
  try {
    const current = typeof parseLocalStorageJsonCached === 'function'
      ? parseLocalStorageJsonCached(RAK_REPORTS_KEY, [])
      : JSON.parse(localStorage.getItem(RAK_REPORTS_KEY) || '[]');
    const next = (Array.isArray(current) ? current : []).concat([report]).slice(-30);
    const payload = JSON.stringify(next);
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(RAK_REPORTS_KEY, payload);
    else localStorage.setItem(RAK_REPORTS_KEY, payload);
  } catch (err) {
    console.warn('saveBugReportLocal failed', err);
  }
}

function renderBugReportMenuBody(body) {
  const account = getBugReportAccount();
  const disabled = !account;
  const accountText = account ? escapeHtml(String(account.name || account.id || 'Hráč')) : 'Nejdřív se přihlas v herním profilu.';
  body.innerHTML = [
    '<div class="appMenuCard appMenuReportCard">',
    '  <div class="appMenuCardTitle">Pošli mi chybu</div>',
    '  <div class="appMenuText">',
    '    <div>Sem napiš chybu, co se ti nelíbí, nebo nápad na zlepšení. Po odeslání se report uloží online do RaK databáze.</div>',
    '    <div>Když zrovna nejde internet, nechám ho v telefonu ve frontě a appka ho odešle později.</div>',
    '  </div>',
    '  <div class="appMenuContactRow"><span>Profil</span><b>' + accountText + '</b></div>',
    '  <label class="appMenuReportLabel" for="bugReportType">Typ</label>',
    '  <select class="appMenuReportSelect" id="bugReportType" ' + (disabled ? 'disabled' : '') + '>',
    '    <option>Chyba</option>',
    '    <option>Nelíbí se mi</option>',
    '    <option>Nápad</option>',
    '    <option>Výkon / sekání</option>',
    '    <option>Hra</option>',
    '  </select>',
    '  <label class="appMenuReportLabel" for="bugReportText">Popis</label>',
    '  <textarea class="appMenuReportTextarea" id="bugReportText" maxlength="1200" rows="7" placeholder="Napiš co nejpřesněji, kde se to stalo a co jsi dělal." ' + (disabled ? 'disabled' : '') + '></textarea>',
    '  <div class="appMenuReportHint" id="bugReportStatus">' + (disabled ? 'Bez přihlášení nejde report odeslat.' : 'Přidám k tomu verzi, zařízení, stránku, theme a pozadí.') + '</div>',
    '  <div class="appMenuActionRow appMenuReportActions">',
    disabled ? '    <button type="button" class="appMenuAction" data-menu-action="settings">Přihlásit / profil</button>' : '    <button type="button" class="appMenuAction isActive" data-menu-action="bug-report-submit">Odeslat</button>',
    '  </div>',
    '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
    '</div>'
  ].join('');
}

async function handleBugReportAction(action) {
  const account = getBugReportAccount();
  const status = document.getElementById('bugReportStatus');
  const submitBtn = document.querySelector('[data-menu-action="bug-report-submit"]');
  if (!account) {
    if (status) status.textContent = 'Nejdřív se přihlas v herním profilu.';
    return;
  }
  const report = buildBugReportPayload();
  if (!report.text || report.text.length < 5) {
    if (status) status.textContent = 'Napiš aspoň krátký popis, ať vím, co hledat.';
    document.getElementById('bugReportText')?.focus?.();
    return;
  }
  saveBugReportLocal(Object.assign({}, report, { localBackup: true }));
  if (status) status.textContent = 'Odesílám report…';
  if (submitBtn) submitBtn.disabled = true;
  try {
    let result = null;
    if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.submitBugReport === 'function') {
      result = await window.RotationSupabaseBridge.submitBugReport(report);
    }
    if (result && result.ok && result.queued) {
      if (status) status.textContent = 'Report je uložený ve frontě a odešle se automaticky, až bude online spojení.';
    } else if (result && result.ok) {
      if (status) status.textContent = 'Díky, report je odeslaný.';
      const textEl = document.getElementById('bugReportText');
      if (textEl) textEl.value = '';
    } else {
      saveBugReportLocal(Object.assign({}, report, { pendingOnline: true }));
      if (status) status.textContent = 'Report jsem uložil v appce. Online odeslání se nepovedlo, zkus to prosím později.';
    }
  } catch (err) {
    console.warn('Bug report submit failed', err);
    saveBugReportLocal(Object.assign({}, report, { pendingOnline: true, error: String(err && err.message ? err.message : err || '') }));
    if (status) status.textContent = 'Report jsem uložil v appce. Online odeslání se nepovedlo, zkus to prosím později.';
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}



function adminGetSelectedRemoveButton() {
  const body = document.getElementById('appMenuBody');
  return body ? body.querySelector('[data-admin-selected-remove]') : null;
}

function adminHideRotationSelectedRemove() {
  const btn = adminGetSelectedRemoveButton();
  if (btn) {
    btn.hidden = true;
    btn.dataset.targetReady = '';
  }
  window.__rakAdminRotationSelectedInput = null;
}

function adminShowRotationSelectedRemove(input) {
  try {
    const body = document.getElementById('appMenuBody');
    const btn = adminGetSelectedRemoveButton();
    if (!body || body.dataset.adminView !== 'rotation' || !btn || !input || !body.contains(input)) {
      adminHideRotationSelectedRemove();
      return;
    }
    if (!input.matches('[data-rot-field^="cell-"], [data-note-field="person"]')) {
      adminHideRotationSelectedRemove();
      return;
    }
    const value = String(input.value || '').trim();
    if (!value || adminRotationIsRemoveValue(value)) {
      adminHideRotationSelectedRemove();
      return;
    }
    window.__rakAdminRotationSelectedInput = input;
    btn.hidden = false;
    btn.dataset.targetReady = '1';
    btn.textContent = 'Odebrat vybrané';
    const status = document.getElementById('adminRotationDraftStatus');
    if (status) status.textContent = 'Vybrané: ' + value + ' · změny se uloží až tlačítkem.';
  } catch (err) {
    console.warn('Admin selected remove failed', err);
  }
}

function adminRemoveSelectedRotationName() {
  const input = window.__rakAdminRotationSelectedInput;
  if (!input || !input.isConnected) {
    adminHideRotationSelectedRemove();
    return;
  }
  input.value = '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  try { input.focus({ preventScroll: true }); } catch (err) { try { input.focus(); } catch (err2) {} }
  adminHideRotationSelectedRemove();
  const status = document.getElementById('adminRotationDraftStatus');
  if (status) status.textContent = 'Jméno odebrané z rozepsané tabulky. Nezapomeň dát Uložit rozpis.';
}

function adminRotationIsRemoveValue(value) {
  const v = String(value || '').trim().toLowerCase();
  return v === 'dát pryč' || v === 'dat pryc' || v === 'pryč' || v === 'pryc' || v === 'odebrat' || v === 'remove';
}

function adminCloseRotationQuickRemove() {
  const box = document.getElementById('adminRotationQuickRemove');
  if (box) box.remove();
  window.__rakAdminRotationQuickRemoveInput = null;
}

function adminShowRotationQuickRemove(input) {
  try {
    const body = document.getElementById('appMenuBody');
    if (!body || body.dataset.adminView !== 'rotation' || !input || !body.contains(input)) return;
    if (!input.matches('[data-rot-field^="cell-"], [data-note-field="person"]')) {
      adminCloseRotationQuickRemove();
      return;
    }
    const value = String(input.value || '').trim();
    if (!value || adminRotationIsRemoveValue(value)) {
      adminCloseRotationQuickRemove();
      return;
    }
    let box = document.getElementById('adminRotationQuickRemove');
    if (!box) {
      box = document.createElement('div');
      box.id = 'adminRotationQuickRemove';
      box.className = 'adminRotationQuickRemove';
      box.innerHTML = '<span class="adminRotationQuickRemoveText"></span><button type="button" class="adminRotationQuickRemoveBtn">Odebrat</button>';
      document.body.appendChild(box);
      box.addEventListener('click', (ev) => {
        const btn = ev.target && ev.target.closest ? ev.target.closest('.adminRotationQuickRemoveBtn') : null;
        if (!btn) return;
        ev.preventDefault();
        const target = window.__rakAdminRotationQuickRemoveInput;
        if (target && target.isConnected) {
          target.value = '';
          target.dispatchEvent(new Event('input', { bubbles: true }));
          target.dispatchEvent(new Event('change', { bubbles: true }));
          try { target.focus({ preventScroll: true }); } catch (err) { try { target.focus(); } catch (err2) {} }
        }
        adminCloseRotationQuickRemove();
      });
    }
    window.__rakAdminRotationQuickRemoveInput = input;
    const txt = box.querySelector('.adminRotationQuickRemoveText');
    if (txt) txt.textContent = 'Jméno: ' + value;
    const rect = input.getBoundingClientRect();
    const vw = Math.max(320, window.innerWidth || document.documentElement.clientWidth || 320);
    const top = Math.max(8, Math.round(rect.top - 50));
    const left = Math.max(8, Math.min(vw - 196, Math.round(rect.left)));
    box.style.top = String(top) + 'px';
    box.style.left = String(left) + 'px';
    box.classList.add('isVisible');
  } catch (err) {
    console.warn('Admin quick remove failed', err);
  }
}

function adminScheduleRotationQuickRemove(input) {
  try {
    window.clearTimeout(window.__rakAdminRotationQuickRemoveTimer || 0);
    window.__rakAdminRotationQuickRemoveTimer = window.setTimeout(() => adminShowRotationQuickRemove(input), 35);
  } catch (err) {
    adminShowRotationQuickRemove(input);
  }
}

function adminSetRotationViewportLock(active) {
  try {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    if (!window.__rakDefaultViewportContent) {
      window.__rakDefaultViewportContent = meta.getAttribute('content') || 'width=device-width, initial-scale=1.0, viewport-fit=cover';
    }
    const locked = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    meta.setAttribute('content', active ? locked : window.__rakDefaultViewportContent);
  } catch (err) {}
}

function adminBindRotationZoomGuard() {
  if (window.__rakAdminRotationZoomGuardBound) return;
  window.__rakAdminRotationZoomGuardBound = true;
  const isAdminRotation = () => {
    const body = document.getElementById('appMenuBody');
    return !!(body && body.dataset.adminView === 'rotation' && document.getElementById('adminRotationEditor'));
  };
  const isAdminRotationField = (node) => !!(node && node.matches && node.matches('[data-rot-field], [data-note-field]'));
  const blockZoom = (event) => {
    if (!isAdminRotation()) return;
    adminSetRotationViewportLock(true);
    try { adminCloseRotationQuickRemove(); } catch (err) {}
    try { adminHideRotationSelectedRemove(); } catch (err) {}
    if (event && event.touches && event.touches.length < 2) return;
    try { event.preventDefault(); } catch (err) {}
  };
  const lockForField = (event) => {
    if (!isAdminRotation()) return;
    const target = event && event.target;
    if (!isAdminRotationField(target)) return;
    adminSetRotationViewportLock(true);
  };
  const recoverAfterViewportChange = () => {
    if (!isAdminRotation()) return;
    adminSetRotationViewportLock(true);
    try { adminCloseRotationQuickRemove(); } catch (err) {}
    try { adminHideRotationSelectedRemove(); } catch (err) {}
    try {
      const active = document.activeElement;
      if (active && isAdminRotationField(active) && window.visualViewport && Number(window.visualViewport.scale || 1) > 1.01) {
        active.blur();
      }
    } catch (err) {}
    try {
      const body = document.getElementById('appMenuBody');
      if (body) body.classList.add('adminRotationViewportRecovered');
    } catch (err) {}
  };
  try { document.addEventListener('gesturestart', blockZoom, { passive: false }); } catch (err) {}
  try { document.addEventListener('gesturechange', blockZoom, { passive: false }); } catch (err) {}
  try { document.addEventListener('gestureend', blockZoom, { passive: false }); } catch (err) {}
  try { document.addEventListener('touchstart', lockForField, { passive: true, capture: true }); } catch (err) {}
  try { document.addEventListener('focusin', lockForField, true); } catch (err) {}
  try {
    window.addEventListener('resize', recoverAfterViewportChange, { passive: true });
  } catch (err) {}
  try {
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', recoverAfterViewportChange, { passive: true });
    }
  } catch (err) {}
}


function runAdminRotationEditorMaintenance(body, reason) {
  if (!body || body.dataset.adminView !== 'rotation') return;
  try {
    if (typeof adminRefreshRotationSuggestions === 'function') adminRefreshRotationSuggestions(body);
    else if (typeof adminRenderRotationAvailabilitySummary === 'function') adminRenderRotationAvailabilitySummary(body);
  } catch (err) {
    console.warn('Admin rotation maintenance failed', reason || '', err);
    const status = body.querySelector('#adminOnlineSaveStatus');
    if (status) status.textContent = 'Kontrola rozpisu se teď nepřepočítala, ale editace zůstala zachovaná.';
  }
}

function scheduleAdminRotationEditorMaintenance(body, reason, delayMs) {
  if (!body || body.dataset.adminView !== 'rotation') return;
  try {
    if (body.__adminRotationMaintenanceTimer) window.clearTimeout(body.__adminRotationMaintenanceTimer);
    const delay = Number.isFinite(delayMs) ? delayMs : 180;
    body.__adminRotationMaintenanceTimer = window.setTimeout(() => {
      body.__adminRotationMaintenanceTimer = 0;
      runAdminRotationEditorMaintenance(body, reason || 'scheduled');
    }, delay);
  } catch (err) {
    runAdminRotationEditorMaintenance(body, reason || 'fallback');
  }
}

function bindAppMenuHandlers(body) {
  if (!body || body.dataset.menuHandlersBound === '1') return;
  body.dataset.menuHandlersBound = '1';
  adminBindRotationZoomGuard();

  body.addEventListener('focusin', (event) => {
    const target = event.target;
    if (target && target.matches && target.matches('[data-rot-field^="cell-"], [data-note-field="person"]')) adminShowRotationSelectedRemove(target);
    else adminHideRotationSelectedRemove();
  }, true);
  body.addEventListener('input', (event) => {
    const target = event.target;
    if (target && target.matches && target.matches('[data-rot-field^="cell-"], [data-note-field="person"]')) adminShowRotationSelectedRemove(target);
  }, true);

  body.addEventListener('click', async (event) => {
    const target = event.target && typeof event.target.closest === 'function'
      ? event.target.closest('[data-menu-action], [data-admin-action], [data-admin-month-key], [data-admin-year-key], [data-admin-clear-field], [data-admin-selected-remove], [data-ui-pref], [data-ui-reset], [data-menu-back], [data-rot-field], [data-note-field]')
      : null;
    if (!target || !body.contains(target)) return;

    const menuAction = target.getAttribute('data-menu-action');
    const adminAction = target.getAttribute('data-admin-action');
    const uiPref = target.getAttribute('data-ui-pref');
    const uiReset = target.hasAttribute('data-ui-reset');
    const menuBack = target.getAttribute('data-menu-back');
    const currentView = String(body.dataset.adminView || 'home');
    const select = body.querySelector('#adminMonthSelect');
    const monthKey = select ? select.value : getAdminSelectedMonthKey();
    const adminMonthKey = target.getAttribute('data-admin-month-key');

    try {
      if (target.hasAttribute('data-admin-selected-remove')) {
        event.preventDefault();
        adminRemoveSelectedRotationName();
        return;
      }

      if (menuBack) {
        openAppMenu('menu');
        return;
      }

      if (target.matches && target.matches('[data-rot-field], [data-note-field]')) {
        if (target.matches('[data-rot-field^="cell-"], [data-note-field="person"]')) adminShowRotationSelectedRemove(target);
        else adminHideRotationSelectedRemove();
        return;
      }

      if (menuAction === 'import' || adminAction === 'import' || adminAction === 'excel-pick') {
        startMenuImport();
        return;
      }
      if (adminAction === 'excel-import') {
        document.getElementById('importBtn')?.click();
        return;
      }
      if (menuAction === 'export' || adminAction === 'export') {
        if (typeof triggerRakZipExport === 'function') {
          await triggerRakZipExport();
        } else if (typeof exportCurrentHtml === 'function') {
          await exportCurrentHtml();
        } else {
          document.getElementById('exportBtn')?.click();
        }
        return;
      }
      if (menuAction === 'settings') {
        openAppMenu('settings');
        return;
      }
      if (menuAction === 'about') {
        triggerAboutAction();
        return;
      }
      if (menuAction === 'contact') {
        openAppMenu('contact');
        return;
      }
      if (menuAction === 'bug-report') {
        openAppMenu('bug-report');
        return;
      }
      if (menuAction === 'bug-report-submit') {
        await handleBugReportAction(menuAction);
        return;
      }
      if (menuAction === 'admin') {
        openAppMenu('admin');
        return;
      }
      if (menuAction === 'admin-machines') {
        openAppMenu('admin-machines');
        return;
      }
      if (menuAction === 'admin-rotation') {
        openAppMenu('admin-rotation');
        return;
      }
      const adminYearKey = target.getAttribute('data-admin-year-key');
      if (adminYearKey) {
        const parsedYear = parseInt(adminYearKey, 10);
        if (Number.isFinite(parsedYear)) {
          app.selectedYear = parsedYear;
          const monthsForYear = typeof getMonthsForYear === 'function' ? getMonthsForYear(app.rotation, parsedYear) : [];
          if (!app.selectedMonth || !monthsForYear.includes(app.selectedMonth)) {
            app.selectedMonth = monthsForYear[0] || app.selectedMonth || null;
          }
          renderAdminMenuBody(body, currentView);
        }
        return;
      }
      if (adminMonthKey) {
        if (select) select.value = adminMonthKey;
        app.selectedMonth = adminMonthKey;
        const parsedMonth = typeof parseMonthKey === 'function' ? parseMonthKey(adminMonthKey) : null;
        if (parsedMonth && Number.isFinite(parsedMonth.year)) app.selectedYear = parsedMonth.year;
        renderAdminMenuBody(body, currentView);
        return;
      }
      if (target.hasAttribute('data-admin-clear-field')) {
        const wrap = target.closest('.appMenuInlineFieldWrap');
        const input = wrap ? wrap.querySelector('input') : null;
        if (input) {
          input.value = '';
          const clearBtn = wrap ? wrap.querySelector('.appMenuInlineClearBtn') : null;
          if (clearBtn) clearBtn.remove();
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
        }
        return;
      }
      if (menuAction === 'admin-export') {
        openAppMenu('admin-export');
        return;
      }
      if (menuAction === 'admin-reports') {
        openAppMenu('admin-reports');
        return;
      }
      if (menuAction === 'device-performance-test') {
        const status = body.querySelector('#adminOnlineSaveStatus') || body.querySelector('.rakDevicePerfCard .smallText');
        if (status) status.textContent = 'Měřím plynulost… chvíli nehýbej obrazovkou.';
        try {
          const result = await runRakDevicePerformanceProbe({ durationMs: 950 });
          const msg = 'Měření hotové: skóre ' + String(result.score || 0) + '/100, ' + String(result.avgFps || '—') + ' FPS, doporučení ' + String(result.label || '—') + '.';
          alert(msg);
        } catch (err) {
          console.warn('Device performance test failed', err);
          alert('Měření se nepovedlo. Zkus to prosím znovu.');
        }
        openAppMenu('settings');
        return;
      }
      if (menuAction === 'device-performance-auto') {
        try {
          localStorage.removeItem(DEVICE_PERFORMANCE_PROBE_KEY);
          if (typeof clearLocalStorageJsonCache === 'function') clearLocalStorageJsonCache(DEVICE_PERFORMANCE_PROBE_KEY);
        } catch (err) {}
        const current = loadUiPrefs();
        applyUiPrefs(Object.assign({}, current, { lightweight: false, lightweightManual: false }));
        openAppMenu('settings');
        return;
      }
      if (menuAction === 'clear-cache') {
        if (!confirm('Vyčistit cache a tvrdě obnovit aplikaci?')) return;
        try {
          if ('caches' in window && typeof caches.keys === 'function') {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
          }
          if ('serviceWorker' in navigator && navigator.serviceWorker && typeof navigator.serviceWorker.getRegistrations === 'function') {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((reg) => reg && reg.update ? reg.update().catch(() => {}) : Promise.resolve()));
          }
          alert('Cache byla vyčištěná. Appka se teď tvrdě obnoví.');
          window.location.reload();
        } catch (err) {
          console.error('Cache clear failed', err);
          alert('Cache se nepodařilo vymazat.');
        }
        return;
      }
      if (menuAction === 'app-diagnostics') {
        const lowEndInfo = typeof getLowEndDeviceInfo === 'function' ? getLowEndDeviceInfo() : { lowEnd: false, reasons: [], cores: 0, memory: null, isIOS: false, isAndroid: false, dpr: 1, width: 0, effectiveType: '' };
        const lowEndReason = lowEndInfo.lowEnd && lowEndInfo.reasons && lowEndInfo.reasons.length ? ' · důvod: ' + lowEndInfo.reasons.join(', ') : '';
        const lightweightManual = !!(app && app.uiPrefs && app.uiPrefs.lightweightManual);
        const deviceInfo = [
          lowEndInfo.cores ? (lowEndInfo.cores + ' jader') : 'jádra neznámá',
          lowEndInfo.memory ? (lowEndInfo.memory + ' GB RAM') : 'RAM nehlášena',
          lowEndInfo.width ? ('šířka ' + lowEndInfo.width + ' px') : '',
          lowEndInfo.dpr ? ('DPR ' + Math.round(lowEndInfo.dpr * 100) / 100) : '',
          lowEndInfo.effectiveType ? ('síť ' + lowEndInfo.effectiveType) : '',
          lowEndInfo.isIOS ? 'iOS/Safari' : (lowEndInfo.isAndroid ? 'Android' : '')
        ].filter(Boolean).join(' · ');
        const supabaseHardening = typeof window.getSupabaseHardeningStatus === 'function' ? window.getSupabaseHardeningStatus() : null;
        const supabaseGuard = supabaseHardening && supabaseHardening.guard ? supabaseHardening.guard : null;
        const gameStatsRpcSmoke = typeof window.getGameStatsRpcSmokeStatus === 'function' ? window.getGameStatsRpcSmokeStatus() : (supabaseHardening && supabaseHardening.gameStatsRpcSmoke ? supabaseHardening.gameStatsRpcSmoke : null);
        const gameUiRpcSmoke = typeof window.getGameUiRpcSmokeStatus === 'function' ? window.getGameUiRpcSmokeStatus() : (supabaseHardening && supabaseHardening.gameUiRpcSmoke ? supabaseHardening.gameUiRpcSmoke : null);
        const gameSessionRpcSmoke = typeof window.getGameSessionRpcSmokeStatus === 'function' ? window.getGameSessionRpcSmokeStatus() : (supabaseHardening && supabaseHardening.gameSessionRpcSmoke ? supabaseHardening.gameSessionRpcSmoke : null);
        const tttOnlineJoinHealth = typeof window.getTttOnlineJoinHealth === 'function' ? window.getTttOnlineJoinHealth() : null;
        const rpcHardeningStatus = supabaseHardening && supabaseHardening.rpcHardening ? supabaseHardening.rpcHardening : null;
        const supabaseSyncGuard = supabaseHardening && supabaseHardening.syncGuard ? supabaseHardening.syncGuard : null;
        const supabaseCacheGuard = supabaseHardening && supabaseHardening.cacheGuard ? supabaseHardening.cacheGuard : null;
        const supabasePerformanceHealth = typeof window.getSupabasePerformanceHealth === 'function' ? window.getSupabasePerformanceHealth() : (supabaseHardening && supabaseHardening.performanceHealth ? supabaseHardening.performanceHealth : null);
        const supabaseKeepaliveStatus = typeof window.getSupabaseKeepaliveStatus === 'function' ? window.getSupabaseKeepaliveStatus() : (supabaseHardening && supabaseHardening.keepaliveStatus ? supabaseHardening.keepaliveStatus : null);
        const supabaseStructureHealth = typeof window.getSupabaseStructureHealth === 'function' ? window.getSupabaseStructureHealth() : (supabaseHardening && supabaseHardening.structureHealth ? supabaseHardening.structureHealth : null);
        const supabasePolicyRiskHealth = typeof window.getSupabasePolicyRiskHealth === 'function' ? window.getSupabasePolicyRiskHealth() : (supabaseHardening && supabaseHardening.policyRiskHealth ? supabaseHardening.policyRiskHealth : null);
        const supabaseHardeningReadiness = typeof window.getSupabaseHardeningReadiness === 'function' ? window.getSupabaseHardeningReadiness() : (supabaseHardening && supabaseHardening.hardeningReadiness ? supabaseHardening.hardeningReadiness : null);
        const readRakDiag = (alias, fallbackGlobalName) => {
          try {
            if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.readWithFallback === 'function') {
              return window.RaK.diagnostics.readWithFallback(alias, fallbackGlobalName);
            }
          } catch (err) {}
          try {
            if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.read === 'function') {
              const result = window.RaK.diagnostics.read(alias);
              if (result) return result;
            }
          } catch (err) {}
          try {
            const fn = window[String(fallbackGlobalName || '')];
            return typeof fn === 'function' ? fn() : null;
          } catch (err) {
            return null;
          }
        };
        const releaseReadiness = readRakDiag('releaseReadiness', 'getRakReleaseReadinessHealth');
        const architectureBaseline = readRakDiag('architectureBaseline', 'getRakArchitectureBaselineHealth');
        const moduleReadiness = readRakDiag('health', 'getRakModuleReadinessHealth');
        const runtimeGuard = readRakDiag('runtimeGuard', 'getRakRuntimeGuardHealth');
        const storageSyncAudit = readRakDiag('storageSyncAudit', 'getRakStorageSyncAuditHealth');
        const storageSyncSmokeReport = readRakDiag('storageSyncSmokeReport', 'getRakStorageSyncSmokeReport');
        const storageManualCleanupGuard = readRakDiag('storageManualCleanupGuard', 'getRakStorageManualCleanupGuard');
        const storageSyncClosure = readRakDiag('storageSyncClosure', 'getRakStorageSyncClosureHealth');
        const supabaseClientQueueAudit = readRakDiag('supabaseClientQueueAudit', 'getRakSupabaseClientQueueAuditHealth');
        const supabaseQueueSmokeReport = readRakDiag('supabaseQueueSmokeReport', 'getRakSupabaseQueueSmokeReport');
        const supabaseQueueManualGuard = readRakDiag('supabaseQueueManualGuard', 'getRakSupabaseQueueManualGuard');
        const supabaseQueueClosure = readRakDiag('supabaseQueueClosure', 'getRakSupabaseQueueClosureHealth');
        const onlineGameContracts = readRakDiag('onlineGameContracts', 'getRakOnlineGameContractAuditHealth');
        const onlineGameContractSmoke = readRakDiag('onlineGameContractSmoke', 'getRakOnlineGameContractSmokeReport');
        const onlineGameContractClosure = readRakDiag('onlineGameContractClosure', 'getRakOnlineGameContractClosureHealth');
        const foodSundayGuard = readRakDiag('foodSundayGuard', 'getFoodScheduleSundayGuardHealth');
        const releaseOpsChecklist = readRakDiag('releaseOpsChecklist', 'getRakReleaseOpsChecklistHealth');
        const monitoringPlan = readRakDiag('monitoringPlan', 'getRakMonitoringPlanHealth');
        const rollbackPlaybook = readRakDiag('rollbackPlaybook', 'getRakRollbackPlaybookHealth');
        const releaseOpsClosure = readRakDiag('releaseOpsClosure', 'getRakReleaseOpsClosureHealth');
        const appSecPrivacySurface = readRakDiag('appSecPrivacySurface', 'getRakAppSecPrivacySurfaceHealth');
        const appSecPrivacyRisks = readRakDiag('appSecPrivacyRisks', 'getRakAppSecPrivacyRiskRegister');
        const appSecStorageKeys = readRakDiag('appSecStorageKeys', 'getRakAppSecStorageKeyClassificationHealth');
        const appSecDomSurface = readRakDiag('appSecDomSurface', 'getRakAppSecDomInjectionSurfaceHealth');
        const appSecCspSriPlan = readRakDiag('appSecCspSriPlan', 'getRakAppSecCspSriReportOnlyPlan');
        const appSecPrivacyClosure = readRakDiag('appSecPrivacyClosure', 'getRakAppSecPrivacyClosureHealth');
        const releaseGatePolicy = readRakDiag('releaseGatePolicy', 'getRakReleaseGatePolicy');
        const releaseGateMatrix = readRakDiag('releaseGateMatrix', 'getRakReleaseGateMatrixHealth');
        const releaseGateClosure = readRakDiag('releaseGateClosure', 'getRakReleaseGateClosureHealth');
        const domSafeHelperPolicy = readRakDiag('domSafeHelperPolicy', 'getRakDomSafeHelperPolicy');
        const domSecurityHardeningPlan = readRakDiag('domSecurityHardeningPlan', 'getRakDomSecurityHardeningPlan');
        const domSecurityHardeningClosure = readRakDiag('domSecurityHardeningClosure', 'getRakDomSecurityHardeningClosureHealth');
        const bootSequence = readRakDiag('bootSequence', 'getRakBootSequenceHealth');
        const namespaceHealth = readRakDiag('namespace', 'getRakNamespaceHealth');
        const namespaceReadOnlyMap = readRakDiag('namespaceReadOnlyMap', 'getRakNamespaceReadOnlyMapHealth');
        const exportReleaseTooling = readRakDiag('exportReleaseTooling', 'getRakExportReleaseToolingHealth');
        const exportSmokeReport = readRakDiag('exportSmokeReport', 'getRakExportSmokeReport');
        const domActionRegistry = readRakDiag('domActionRegistry', 'getRakDomActionRegistryHealth');
        const domActionSmokeReport = readRakDiag('domActionSmokeReport', 'getRakDomActionSmokeReport');
        const profileUiStatus = typeof window.getProfileUiSyncStatus === 'function' ? window.getProfileUiSyncStatus() : null;
        const profileUiGuard = profileUiStatus && profileUiStatus.guard ? profileUiStatus.guard : null;
        const dataOptStatus = typeof window.getDataOptimizationStatus === 'function' ? window.getDataOptimizationStatus() : null;
        const pwaStatus = typeof window.getPwaHardeningStatus === 'function' ? window.getPwaHardeningStatus() : null;
        const securityRenderStatus = typeof window.getSecurityRenderStatus === 'function' ? window.getSecurityRenderStatus() : null;
        const finalStabilizationStatus = typeof window.getFinalStabilizationStatus === 'function' ? window.getFinalStabilizationStatus() : null;
        const ladaPerformanceStatus = typeof window.getLadaPerformanceHealth === 'function' ? window.getLadaPerformanceHealth() : null;
        const devicePerformanceStatus = typeof window.getRakDevicePerformanceStatus === 'function' ? window.getRakDevicePerformanceStatus() : null;
        const gameEngineStatus = typeof window.getGameEngineBaselineHealth === 'function' ? window.getGameEngineBaselineHealth() : null;
        const securityRenderDiag = securityRenderStatus ? [
          'Security/render: fáze ' + String(securityRenderStatus.phasePercent || 0) + '% · escapované dynamické HTML ' + String(securityRenderStatus.escapedDynamicHtmlWrites || 0) + ' · text render ' + String(securityRenderStatus.guardedTextWrites || 0) + '/' + String(securityRenderStatus.guardedTextSkippedWrites || 0),
          'Security/render HTML: zápisy/skip/riziko ' + String(securityRenderStatus.guardedHtmlWrites || 0) + '/' + String(securityRenderStatus.guardedHtmlSkippedWrites || 0) + '/' + String(securityRenderStatus.riskyHtmlWrites || 0) + ' · poslední ' + String(securityRenderStatus.lastHtmlKey || '—') + ' / ' + String(securityRenderStatus.lastHtmlRisk || '—'),
          'Security/render URL: kontroly/blokace ' + String(securityRenderStatus.safeExternalUrlChecks || 0) + '/' + String(securityRenderStatus.safeExternalUrlBlocked || 0) + ' · allowlist ' + String(securityRenderStatus.safeExternalUrlAllowlistChecks || 0) + '/' + String(securityRenderStatus.safeExternalUrlAllowlistBlocked || 0) + ' · href ' + String(securityRenderStatus.safeExternalHrefWrites || 0) + '/' + String(securityRenderStatus.safeExternalHrefSkippedWrites || 0) + ' · poslední ' + String(securityRenderStatus.lastAllowedExternalUrlKey || securityRenderStatus.lastExternalUrlKey || '—'),
          'Security/render akce: kontroly/blokace ' + String(securityRenderStatus.delegatedActionChecks || 0) + '/' + String(securityRenderStatus.delegatedActionBlocked || 0) + ' · režim ' + String(securityRenderStatus.delegatedActionGuardMode || '—'),
          'Security/render poslední: HTML escape ' + String(securityRenderStatus.lastEscapedKey || '—') + ' · text ' + String(securityRenderStatus.lastTextKey || '—') + ' · safe DOM build/skip ' + String(securityRenderStatus.safeDomBuilds || 0) + '/' + String(securityRenderStatus.safeDomSkippedBuilds || 0) + ' / ' + String(securityRenderStatus.lastSafeDomKey || '—') + ' · replace/clear/fallback ' + String(securityRenderStatus.safeDomReplacements || 0) + '/' + String(securityRenderStatus.safeDomClears || 0) + '/' + String(securityRenderStatus.safeDomFallbackReplacements || 0)
        ] : [];
        const ladaPerformanceDiag = ladaPerformanceStatus ? [
          'Láďův režim výkon: ' + (ladaPerformanceStatus.ok ? 'OK' : 'kontrola') + ' · režim ' + String(ladaPerformanceStatus.mode || '—') + ' · profil ' + String(ladaPerformanceStatus.profileLevel || '—') + ' · aktivní ' + (ladaPerformanceStatus.active ? 'ano' : 'ne'),
          'Láďův režim efekty: DPR limit ' + String(ladaPerformanceStatus.dprLimit || '—') + ' · FPS brzda ' + String(ladaPerformanceStatus.frameMs || 0) + ' ms · resize ' + String(ladaPerformanceStatus.resizeThrottleMs || 0) + ' ms · max blur ' + String(ladaPerformanceStatus.maxBlurPx || 0) + 'px · animované vzorky ' + String(ladaPerformanceStatus.animatedSampleCount || 0) + ' · problémy ' + String((ladaPerformanceStatus.issues || []).length || 0)
        ] : [];
        const devicePerformanceDiag = devicePerformanceStatus ? [
          'Výkon zařízení: režim ' + String(devicePerformanceStatus.label || devicePerformanceStatus.mode || '—') + ' · doporučení ' + String(devicePerformanceStatus.recommendedProfile || '—') + ' · měření ' + (devicePerformanceStatus.probe ? (String(devicePerformanceStatus.probe.score || 0) + '/100, ' + String(devicePerformanceStatus.probe.avgFps || '—') + ' FPS') : 'není')
        ] : [];
        const gameEngineDiag = gameEngineStatus ? [
          'Herní engine: ' + (gameEngineStatus.ok ? 'OK' : 'kontrola') + ' · režim ' + String(gameEngineStatus.mode || '—') + ' · aktivní hra ' + String(gameEngineStatus.activeGame || '—') + ' · pauza ' + (gameEngineStatus.paused ? 'ano' : 'ne'),
          'Herní engine lifecycle: otevřeno/zavřeno ' + String(gameEngineStatus.openedCount || 0) + '/' + String(gameEngineStatus.closedCount || 0) + ' · pauza/resume ' + String(gameEngineStatus.pausedCount || 0) + '/' + String(gameEngineStatus.resumedCount || 0) + ' · stop loop ' + String(gameEngineStatus.loopStopRequests || 0) + ' · problémy ' + String((gameEngineStatus.issues || []).length || 0)
        ] : [];
        const tttOnlineJoinDiag = tttOnlineJoinHealth ? [
          'Piškvorky online join: ' + (tttOnlineJoinHealth.ok ? 'OK' : 'kontrola') + ' · link pokusy/OK ' + String(tttOnlineJoinHealth.linkAttempts || 0) + '/' + String(tttOnlineJoinHealth.linkSuccesses || 0) + ' · ruční pokusy/OK ' + String(tttOnlineJoinHealth.manualAttempts || 0) + '/' + String(tttOnlineJoinHealth.manualSuccesses || 0) + ' · chyby ' + String(tttOnlineJoinHealth.errors || 0),
          'Piškvorky online stav: režim ' + String(tttOnlineJoinHealth.activeMode || '—') + ' · role ' + String(tttOnlineJoinHealth.activeRole || '—') + ' · tah ' + String(tttOnlineJoinHealth.activeTurn || '—') + ' · může hrát teď ' + (tttOnlineJoinHealth.activeCanMoveNow ? 'ano' : 'ne') + ' · opravy role ' + String(tttOnlineJoinHealth.roleRepairs || 0) + ' · blokované tahy ' + String(tttOnlineJoinHealth.moveBlocks || 0) + ' · problémy ' + String((tttOnlineJoinHealth.issues || []).length || 0)
        ] : [];
        const finalStabilizationDiag = finalStabilizationStatus ? [
          'Finální stabilizace: fáze ' + String(finalStabilizationStatus.phasePercent || 0) + '% · audit ' + (finalStabilizationStatus.lastAuditOk ? 'OK' : 'kontrola') + ' · běhy ' + String(finalStabilizationStatus.audits || 0) + ' · chybí ' + String(finalStabilizationStatus.lastMissingCount || 0),
          'Finální stabilizace stav: verze ' + String(finalStabilizationStatus.lastVersion || '—') + ' · stránka ' + String(finalStabilizationStatus.lastPage || '—') + ' · F9 ' + String(finalStabilizationStatus.lastPhase9Percent || 0) + '% · PWA mismatch ' + (finalStabilizationStatus.lastPwaVersionMismatch ? 'ano' : 'ne'),
          'Finální stabilizace DOM/log: duplicitní ID ' + String(finalStabilizationStatus.lastDuplicateIdCount || 0) + ' · error log ' + String(finalStabilizationStatus.lastErrorLogCount || 0),
          'Finální stabilizace storage: localStorage ' + (finalStabilizationStatus.lastStorageOk ? 'OK' : 'kontrola') + ' · položky ' + String(finalStabilizationStatus.lastStorageItemCount || 0) + ' · velké klíče ' + String(finalStabilizationStatus.lastLargeStorageKeyCount || 0) + ' · online ' + (finalStabilizationStatus.lastNavigatorOnline === false ? 'ne' : 'ano'),
          'Finální stabilizace moduly: načtení ' + (finalStabilizationStatus.lastScriptHealthOk ? 'OK' : 'kontrola') + ' · chybí ' + String(finalStabilizationStatus.lastScriptMissingCount || 0) + ' · duplicity ' + String(finalStabilizationStatus.lastScriptDuplicateCount || 0) + ' · navíc ' + String(finalStabilizationStatus.lastScriptUnexpectedCount || 0),
          'Finální stabilizace navigace: ' + (finalStabilizationStatus.lastNavigationHealthOk ? 'OK' : 'kontrola') + ' · tlačítka ' + String(finalStabilizationStatus.lastNavigationButtonCount || 0) + ' · aktivní ' + String(finalStabilizationStatus.lastNavigationActiveCount || 0) + ' · chybí ' + String(finalStabilizationStatus.lastNavigationMissingCount || 0),
          'Finální stabilizace stránky: ' + (finalStabilizationStatus.lastPageShellHealthOk ? 'OK' : 'kontrola') + ' · stránky ' + String(finalStabilizationStatus.lastPageShellPageCount || 0) + ' · aktivní ' + String(finalStabilizationStatus.lastPageShellActiveCount || 0) + ' · panely ' + String(finalStabilizationStatus.lastPageShellCriticalPanelCount || 0) + ' · chybí ' + String(finalStabilizationStatus.lastPageShellMissingCount || 0),
          'Finální stabilizace akce/odkazy: ' + (finalStabilizationStatus.lastActionHealthOk ? 'OK' : 'kontrola') + ' · akce ' + String(finalStabilizationStatus.lastActionCount || 0) + ' · neznámé ' + String(finalStabilizationStatus.lastActionUnknownCount || 0) + ' · chybí ' + String(finalStabilizationStatus.lastActionRequiredMissingCount || 0) + ' · cíle ' + String(finalStabilizationStatus.lastActionMissingTargetsCount || 0) + ' · odkazy ' + String(finalStabilizationStatus.lastActionLinkIssueCount || 0),
          'Finální stabilizace formuláře: ' + (finalStabilizationStatus.lastFormHealthOk ? 'OK' : 'kontrola') + ' · inputy ' + String(finalStabilizationStatus.lastFormInputCount || 0) + ' · selecty ' + String(finalStabilizationStatus.lastFormSelectCount || 0) + ' · tlačítka ' + String(finalStabilizationStatus.lastFormButtonCount || 0) + ' · chybí ' + String((finalStabilizationStatus.lastFormRequiredMissingCount || 0) + (finalStabilizationStatus.lastFormActionMissingCount || 0)) + ' · čísla ' + String(finalStabilizationStatus.lastFormInvalidNumberCount || 0),
          'Finální stabilizace připravenost: ' + (finalStabilizationStatus.lastRuntimeReadinessOk ? 'OK' : 'kontrola') + ' · splněno ' + String(finalStabilizationStatus.lastRuntimeReadinessPassedCount || 0) + '/' + String(finalStabilizationStatus.lastRuntimeReadinessTotalCount || 0) + ' · body ke kontrole ' + String((finalStabilizationStatus.lastRuntimeReadinessFailedItems || []).length || 0),
          'Supabase struktura: ' + (finalStabilizationStatus.lastSupabaseStructureOk ? 'OK' : 'kontrola') + ' · tabulky ' + String(finalStabilizationStatus.lastSupabaseStructureTableCount || 0) + ' · problémy ' + String(finalStabilizationStatus.lastSupabaseStructureIssueCount || 0) + ' · režim ' + String(finalStabilizationStatus.lastSupabaseStructureMode || '—'),
          'Herní engine základ: ' + (finalStabilizationStatus.lastGameEngineHealthOk ? 'OK' : 'kontrola') + ' · režim ' + String(finalStabilizationStatus.lastGameEngineMode || '—') + ' · aktivní ' + String(finalStabilizationStatus.lastGameEngineActiveGame || '—') + ' · lifecycle ' + String(finalStabilizationStatus.lastGameEngineLifecycleEvents || 0) + ' · problémy ' + String(finalStabilizationStatus.lastGameEngineIssueCount || 0),
          'Post-stabilizace helpery: ' + (finalStabilizationStatus.lastSafeHelperHealthOk ? 'OK' : 'kontrola') + ' · helpery ' + String(finalStabilizationStatus.lastSafeHelperCount || 0) + ' · chybí ' + String(finalStabilizationStatus.lastSafeHelperMissingCount || 0),
          'Post-stabilizace: ' + (finalStabilizationStatus.lastPostStabilizationOk ? 'OK' : 'kontrola') + ' · režim ' + String(finalStabilizationStatus.lastPostStabilizationMode || '—') + ' · body ke kontrole ' + String(finalStabilizationStatus.lastPostStabilizationIssueCount || 0)
        ] : [];
        const architectureDiag = architectureBaseline ? [
          'Architektura/boot: ' + (architectureBaseline.ok ? 'OK' : 'kontrola') + ' · režim ' + String(architectureBaseline.mode || '—') + ' · skripty ' + String(architectureBaseline.scriptCount || 0) + ' · styly ' + String(architectureBaseline.stylesheetCount || 0) + ' · data-action ' + String(architectureBaseline.dataActionCount || 0),
          'Architektura coupling: chybějící globály ' + String((architectureBaseline.missingGlobals || []).length || 0) + ' · duplicitní ID ' + String(architectureBaseline.duplicateIdCount || 0) + ' · warningy ' + String(architectureBaseline.warningCount || 0),
          moduleReadiness ? ('Module readiness: ' + (moduleReadiness.ok ? 'OK' : 'kontrola') + ' · načteno ' + String(moduleReadiness.loadedCount || 0) + '/' + String(moduleReadiness.expectedCount || 0) + ' · chyby ' + String(moduleReadiness.errorCount || 0) + ' · chybí ' + String(moduleReadiness.missingCount || 0) + ' · boot ' + String(moduleReadiness.bootDurationMs || 0) + ' ms') : '',
          bootSequence ? ('Boot sekvence: ' + (bootSequence.ok ? 'OK' : 'kontrola') + ' · statická ' + (bootSequence.staticOrderOk ? 'OK' : 'kontrola') + ' · dynamická ' + (bootSequence.dynamicOrderOk ? 'OK' : 'kontrola') + ' · chybí ' + String(bootSequence.dynamicMissingCount || 0)) : '',
          namespaceHealth ? ('RaK namespace: ' + (namespaceHealth.ok ? 'OK' : 'kontrola') + ' · režim ' + String(namespaceHealth.mode || '—') + ' · mapa ' + String(namespaceHealth.namespaceMapCount || 0) + ' · fáze ' + String(namespaceHealth.refactorProgressPercent || 0) + '% · mapa uzavřená ' + (namespaceHealth.namespaceMapClosed ? 'ano' : 'ne') + ' · warningy ' + String(namespaceHealth.warningCount || 0)) : '',
          namespaceReadOnlyMap ? ('RaK namespace fallbacky: ' + (namespaceReadOnlyMap.ok ? 'OK' : 'kontrola') + ' · read-only aliasy ' + String(namespaceReadOnlyMap.safeNowCount || 0) + ' · runtime ' + String(namespaceReadOnlyMap.runtimeAliasCount || 0) + ' · chybí čtečky ' + String(namespaceReadOnlyMap.missingReaderCount || 0) + ' · rizikové mutace ' + String(namespaceReadOnlyMap.mutatingRiskCount || 0)) : '',
          runtimeGuard ? ('Runtime health: ' + (runtimeGuard.ok ? 'OK' : 'kontrola') + ' · warningy ' + String(runtimeGuard.warningCount || 0) + ' · storage ' + (runtimeGuard.storage && runtimeGuard.storage.writable ? 'OK' : 'kontrola') + ' · budoucí měsíce ' + String(runtimeGuard.statsScope && runtimeGuard.statsScope.futureImportedMonthCount || 0)) : '',
          storageSyncAudit ? ('Storage/sync audit: ' + (storageSyncAudit.ok ? 'OK' : 'kontrola') + ' · položky ' + String(storageSyncAudit.storage && storageSyncAudit.storage.itemCount || 0) + ' · JSON chyby ' + String(storageSyncAudit.storage && storageSyncAudit.storage.invalidJsonCount || 0) + ' · velké klíče ' + String(storageSyncAudit.storage && storageSyncAudit.storage.largeKeyCount || 0) + ' · kandidáti úklidu ' + String(storageSyncAudit.staleCleanupCandidateCount || 0) + ' · offline/sync klíče ' + String(storageSyncAudit.storage && storageSyncAudit.storage.offlineSyncKeyCount || 0) + ' · fáze ' + String(storageSyncAudit.phasePercent || 0) + '%') : '',
          storageSyncSmokeReport ? ('Storage/sync smoke: ' + (storageSyncSmokeReport.ok === true ? 'OK' : (storageSyncSmokeReport.ok === false ? 'kontrola' : 'zatím neběžel')) + ' · stav ' + String(storageSyncSmokeReport.status || '—') + ' · běhy ' + String(storageSyncSmokeReport.runCount || 0) + ' · kandidáti ' + String(storageSyncSmokeReport.cleanupCandidateCount || 0) + ' · JSON chyby ' + String(storageSyncSmokeReport.invalidJsonCount || 0) + ' · guard ' + (storageSyncSmokeReport.manualGuardReady ? 'OK' : 'kontrola')) : '',
          storageManualCleanupGuard ? ('Storage cleanup guard: ruční režim ' + (storageManualCleanupGuard.manualOnly ? 'OK' : 'kontrola') + ' · auto mazání ' + (storageManualCleanupGuard.autoCleanupEnabled ? 'zapnuto' : 'vypnuto') + ' · kandidáti ' + String(storageManualCleanupGuard.candidateCount || 0) + ' · ruční kontrola ' + (storageManualCleanupGuard.requiresHumanReview ? 'ano' : 'ne')) : '',
          storageSyncClosure ? ('Storage/sync closure: ' + (storageSyncClosure.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(storageSyncClosure.phasePercent || 0) + '% · kandidáti ' + String(storageSyncClosure.candidateCount || 0) + ' · auto mazání ' + (storageSyncClosure.autoCleanupEnabled ? 'zapnuto' : 'vypnuto')) : '',
          supabaseClientQueueAudit ? ('Supabase client/queue: ' + (supabaseClientQueueAudit.ok ? 'OK' : 'kontrola') + ' · fronta ' + String(supabaseClientQueueAudit.queueLength || 0) + '/' + String(supabaseClientQueueAudit.queueMaxItems || '—') + ' · stale ' + String(supabaseClientQueueAudit.queueStaleTaskCount || 0) + ' · realtime ' + String(supabaseClientQueueAudit.realtimeStatus || '—') + ' · fáze ' + String(supabaseClientQueueAudit.phasePercent || 0) + '%') : '',
          supabaseQueueSmokeReport ? ('Supabase queue smoke: ' + (supabaseQueueSmokeReport.ok === true ? 'OK' : (supabaseQueueSmokeReport.ok === false ? 'kontrola' : 'zatím neběžel')) + ' · stav ' + String(supabaseQueueSmokeReport.status || '—') + ' · fronta ' + String(supabaseQueueSmokeReport.queueLength || 0) + ' · stale ' + String(supabaseQueueSmokeReport.staleTaskCount || 0) + ' · guard ' + (supabaseQueueSmokeReport.manualGuardReady ? 'OK' : 'kontrola') + ' · online ' + (supabaseQueueSmokeReport.online ? 'ano' : 'ne')) : '',
          supabaseQueueManualGuard ? ('Supabase queue guard: ' + (supabaseQueueManualGuard.ok ? 'OK' : 'kontrola') + ' · auto flush ' + (supabaseQueueManualGuard.autoFlushEnabled ? 'zapnuto' : 'vypnuto') + ' · auto mazání ' + (supabaseQueueManualGuard.autoDeleteEnabled ? 'zapnuto' : 'vypnuto') + ' · fronta ' + String(supabaseQueueManualGuard.queueLength || 0)) : '',
          supabaseQueueClosure ? ('Supabase queue closure: ' + (supabaseQueueClosure.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(supabaseQueueClosure.phasePercent || 0) + '% · auto flush ' + (supabaseQueueClosure.autoFlushEnabled ? 'zapnuto' : 'vypnuto') + ' · DB změny ' + (supabaseQueueClosure.dbMutations ? 'ano' : 'ne') + ' · policies ' + (supabaseQueueClosure.policyChanges ? 'ano' : 'ne')) : '',
          onlineGameContracts ? ('Online hry kontrakty: ' + (onlineGameContracts.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(onlineGameContracts.phasePercent || 0) + '% · bridge ' + (onlineGameContracts.bridgeMethodsReady ? 'OK' : 'kontrola') + ' · c/a/s ' + String(onlineGameContracts.gameCoverageText || '—') + ' · fallback ' + String(onlineGameContracts.fallbackCount || 0)) : '',
          onlineGameContractSmoke ? ('Online hry smoke: ' + (onlineGameContractSmoke.ok ? 'OK' : 'kontrola') + ' · pokusy/OK/fallback ' + String(onlineGameContractSmoke.attempts || 0) + '/' + String(onlineGameContractSmoke.successes || 0) + '/' + String(onlineGameContractSmoke.fallbackCount || 0) + ' · policies ' + (onlineGameContractSmoke.readyForPolicyTightening ? 'lze zvažovat' : 'neutahovat')) : '',
          onlineGameContractClosure ? ('Online hry closure: ' + (onlineGameContractClosure.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(onlineGameContractClosure.phasePercent || 0) + '% · policies ' + (onlineGameContractClosure.policyChangeAllowedNow ? 'lze' : 'neutahovat') + ' · warningy ' + String(onlineGameContractClosure.warningCount || 0)) : '',
          foodSundayGuard ? ('Kantýna/jídelna neděle: ' + (foodSundayGuard.ok ? 'OK' : 'kontrola') + ' · přesčasových nedělí ' + String(foodSundayGuard.overtimeSundayCount || 0) + ' · běžná neděle = normální rozpis ' + (foodSundayGuard.rows && foodSundayGuard.rows.every ? (foodSundayGuard.rows.every((row) => row.plainMatchesRegular) ? 'ano' : 'ne') : '—')) : '',
          releaseOpsChecklist ? ('Release ops checklist: ' + (releaseOpsChecklist.ok ? 'OK' : 'kontrola') + ' · gate ' + String(releaseOpsChecklist.gateCount || 0) + ' · blockery ' + String(releaseOpsChecklist.blockerCount || 0) + ' · ruční kontroly ' + String(releaseOpsChecklist.manualCount || 0) + ' · ZIP ' + (releaseOpsChecklist.readyForZip ? 'ano' : 'ne')) : '',
          monitoringPlan ? ('Monitoring mapa: metriky ' + String(monitoringPlan.metricCount || 0) + ' · alerty ' + String((monitoringPlan.alertRules || []).length || 0) + ' · režim ' + String(monitoringPlan.mode || '—')) : '',
          rollbackPlaybook ? ('Rollback playbook: kroky ' + String((rollbackPlaybook.steps || []).length || 0) + ' · pravidla ' + String((rollbackPlaybook.decisionRules || []).length || 0) + ' · artefakt ' + String(rollbackPlaybook.rollbackArtifactRule || '—')) : '',
          releaseOpsClosure ? ('Release ops closure: ' + (releaseOpsClosure.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(releaseOpsClosure.phasePercent || 0) + '% · monitoring ' + String(releaseOpsClosure.monitoringMetricCount || 0) + ' · rollback kroky ' + String(releaseOpsClosure.rollbackStepCount || 0)) : '',
          appSecPrivacySurface ? ('AppSec/privacy: ' + (appSecPrivacySurface.ok ? 'OK' : 'kontrola') + ' · CSP ' + (appSecPrivacySurface.cspMetaPresent ? 'ano' : 'ne') + ' · CDN skripty ' + String(appSecPrivacySurface.externalScriptCount || 0) + ' · bez SRI ' + String(appSecPrivacySurface.externalScriptsWithoutSri || 0) + ' · storage podezřelé ' + String(appSecPrivacySurface.storage && appSecPrivacySurface.storage.suspiciousKeyCount || 0) + ' · warningy ' + String(appSecPrivacySurface.warningCount || 0)) : '',
          appSecPrivacyRisks ? ('AppSec risk register: položky ' + String(appSecPrivacyRisks.itemCount || 0) + ' · P0 ' + String(appSecPrivacyRisks.p0Count || 0) + ' · P1 ' + String(appSecPrivacyRisks.p1Count || 0) + ' · P2 ' + String(appSecPrivacyRisks.p2Count || 0)) : '',
          appSecStorageKeys ? ('AppSec storage: klíče ' + String(appSecStorageKeys.classifiedKeyCount || 0) + ' · kategorie ' + String(appSecStorageKeys.categoryCount || 0) + ' · neznámé ' + String(appSecStorageKeys.unknownKeyCount || 0) + ' · podezřelé ' + String(appSecStorageKeys.suspiciousKeyCount || 0) + ' · hodnoty ' + String(appSecStorageKeys.valueInspectionMode || '—')) : '',
          appSecDomSurface ? ('AppSec DOM: sinky ' + String(appSecDomSurface.staticSinkCount || 0) + ' · innerHTML ' + String(appSecDomSurface.staticBySink && appSecDomSurface.staticBySink.innerHTML || 0) + ' · insertAdjacentHTML ' + String(appSecDomSurface.staticBySink && appSecDomSurface.staticBySink.insertAdjacentHTML || 0) + ' · target blank bez noopener ' + String(appSecDomSurface.targetBlankWithoutNoopener || 0)) : '',
          appSecCspSriPlan ? ('AppSec CSP/SRI: report-only ' + (appSecCspSriPlan.enforceNow ? 'ne' : 'ano') + ' · CDN skripty bez SRI ' + String(appSecCspSriPlan.externalScriptsWithoutSri || 0) + ' · rollout kroky ' + String((appSecCspSriPlan.rolloutSteps || []).length || 0)) : '',
          appSecPrivacyClosure ? ('AppSec closure: ' + (appSecPrivacyClosure.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(appSecPrivacyClosure.phasePercent || 0) + '% · storage neznámé ' + String(appSecPrivacyClosure.storageUnknownKeyCount || 0) + ' · DOM sinky ' + String(appSecPrivacyClosure.domStaticSinkCount || 0)) : '',
          releaseGateMatrix ? ('Release gate matrix: ' + (releaseGateMatrix.ok ? 'OK' : 'blocker') + ' · gate ' + String(releaseGateMatrix.gateCount || 0) + ' · blockery ' + String(releaseGateMatrix.blockerCount || 0) + ' · warningy ' + String(releaseGateMatrix.warningCount || 0) + ' · ruční ' + String(releaseGateMatrix.manualCount || 0) + ' · ZIP ' + (releaseGateMatrix.readyForZip ? 'ano' : 'ne')) : '',
          releaseGateClosure ? ('Release gate closure: ' + (releaseGateClosure.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(releaseGateClosure.phasePercent || 0) + '% · produkce ' + (releaseGateClosure.readyForProduction ? 'ano' : 'čeká na ruční smoke')) : '',
          releaseGatePolicy ? ('Release gate pravidla: statusy ' + String(releaseGatePolicy.policyStatusCount || (releaseGatePolicy.statuses || []).length || 0) + ' · mutace ' + String(releaseGatePolicy.mutationPolicy || 'read-only')) : '',
          domSecurityHardeningPlan ? ('DOM/security hardening: kandidáti ' + String(domSecurityHardeningPlan.candidateCount || 0) + ' · P1 review ' + String(domSecurityHardeningPlan.p1ReviewCount || 0) + ' · sinky ' + String(domSecurityHardeningPlan.staticSinkCount || 0)) : '',
          domSafeHelperPolicy ? ('DOM safe helper policy: helpery ' + String(domSafeHelperPolicy.helperCount || 0) + ' · režim ' + String(domSafeHelperPolicy.rule || 'read-only')) : '',
          domSecurityHardeningClosure ? ('DOM/security closure: ' + (domSecurityHardeningClosure.ok ? 'OK' : 'kontrola') + ' · fáze ' + String(domSecurityHardeningClosure.phasePercent || 0) + '% · render změny ' + (domSecurityHardeningClosure.renderChanges ? 'ano' : 'ne')) : '',
          exportReleaseTooling ? ('Export/release tooling: ' + (exportReleaseTooling.ok ? 'OK' : 'kontrola') + ' · source ID ' + String(exportReleaseTooling.sourceIdCount || 0) + ' · binární ' + String(exportReleaseTooling.binaryFileCount || 0) + ' · duplicit ' + String(exportReleaseTooling.duplicateBinaryCount || 0) + ' · warningy ' + String(exportReleaseTooling.warningCount || 0)) : '',
          exportSmokeReport ? ('Export smoke report: ' + (exportSmokeReport.ok === true ? 'OK' : (exportSmokeReport.ok === false ? 'kontrola' : 'zatím neběžel')) + ' · stav ' + String(exportSmokeReport.status || '—') + ' · text/bin ' + String(exportSmokeReport.checkedTextFileCount || 0) + '/' + String(exportSmokeReport.checkedBinaryFileCount || 0) + ' · chybí ' + String((exportSmokeReport.missingTextFileCount || 0) + (exportSmokeReport.missingBinaryFileCount || 0)) + ' · poslední ' + String(exportSmokeReport.lastStage || '—')) : '',
          domActionRegistry ? ('DOM/action registry: ' + (domActionRegistry.ok ? 'OK' : 'kontrola') + ' · akce ' + String(domActionRegistry.actionElementCount || 0) + ' · unikátní ' + String(domActionRegistry.uniqueActionCount || 0) + ' · kategorie ' + String(domActionRegistry.categoryCount || 0) + ' · target mapa ' + String(domActionRegistry.targetCoveragePercent || 0) + '% · target warningy ' + String(domActionRegistry.actionTargetWarningCount || 0) + ' · neznámé ' + String(domActionRegistry.unknownActionCount || 0) + ' · cíle ' + String(domActionRegistry.missingTargetCount || 0) + ' · warningy ' + String(domActionRegistry.warningCount || 0)) : '',
          domActionSmokeReport ? ('DOM/action smoke: ' + (domActionSmokeReport.ok === true ? 'OK' : (domActionSmokeReport.ok === false ? 'kontrola' : 'zatím neběžel')) + ' · stav ' + String(domActionSmokeReport.status || '—') + ' · běhy ' + String(domActionSmokeReport.runCount || 0) + ' · akce ' + String(domActionSmokeReport.actionElementCount || 0) + ' · target mapa ' + String(domActionSmokeReport.targetCoveragePercent || 0) + '% · problémy ' + String(domActionSmokeReport.issueCount || 0) + ' · warningy ' + String(domActionSmokeReport.warningCount || 0)) : ''
        ].filter(Boolean) : [];
        const pwaDiag = pwaStatus ? [
          'PWA/SW: fáze ' + String(pwaStatus.phasePercent || 0) + '% · controller ' + (pwaStatus.hasController ? 'ano' : 'ne') + ' · update toast ' + (pwaStatus.updateToastVisible ? 'viditelný' : 'ne') + ' · verze cache ' + (pwaStatus.swVersionMismatch ? 'nesedí' : 'sedí'),
          'PWA update check: běhy/skip/join ' + String(pwaStatus.updateChecks || 0) + '/' + String(pwaStatus.updateCheckSkips || 0) + '/' + String(pwaStatus.updateCheckJoins || 0) + ' · update volání ' + String(pwaStatus.registrationUpdates || 0) + ' · chyby ' + String(pwaStatus.registrationUpdateErrors || 0),
          'PWA zprávy SW: celkem/verze/aktivace/cache ' + String(pwaStatus.swMessages || 0) + '/' + String(pwaStatus.swVersionMessages || 0) + '/' + String(pwaStatus.swActivatedMessages || 0) + '/' + String(pwaStatus.swCacheStatusMessages || 0) + ' · poslední ' + String(pwaStatus.lastMessageType || '—'),
          'PWA cache: verze ' + String(pwaStatus.swCacheVersion || '—') + ' / oček. ' + String(pwaStatus.swExpectedCacheVersion || '—') + ' · mismatch ' + String(pwaStatus.swVersionMismatchCount || 0) + ' · update/skip ' + String(pwaStatus.swVersionMismatchUpdateChecks || 0) + '/' + String(pwaStatus.swVersionMismatchUpdateSkips || 0) + ' · static/runtime ' + String(pwaStatus.swStaticCacheEntries || 0) + '/' + String(pwaStatus.swRuntimeCacheEntries || 0) + ' · runtime trim ' + String(pwaStatus.swRuntimeTrimDeletedCount || 0) + '/' + String(pwaStatus.swRuntimeTrimBeforeCount || 0) + ' · staré RaK cache/smazáno ' + String(pwaStatus.swStaleRakCacheCount || 0) + '/' + String(pwaStatus.swStaleRakCacheDeletedCount || 0) + ' · precache OK/chyby/chybí ' + String(pwaStatus.swPrecacheSuccessCount || 0) + '/' + String(pwaStatus.swPrecacheFailedCount || 0) + '/' + String(pwaStatus.swPrecacheMissingCount || 0) + ' · požadavky/skip ' + String(pwaStatus.swCacheStatusRequests || 0) + '/' + String(pwaStatus.swCacheStatusRequestSkips || 0) + ' · klienti ' + String(pwaStatus.swClientsCount || 0) + ' · preload ' + (pwaStatus.swNavigationPreloadEnabled ? 'ano' : 'ne'),
          'PWA cache režim: lookup ' + String(pwaStatus.swCacheLookupMode || '—') + ' · ukládání ' + String(pwaStatus.swCacheableResponseMode || '—') + ' · trim ' + String(pwaStatus.swActivateRuntimeTrimMode || '—') + ' · síť fallback ' + String(pwaStatus.swNetworkTimeoutFallbackMode || '—') + ' (' + String(pwaStatus.swNetworkFallbackTimeoutMs || 0) + ' ms)' + ' · static timeout ' + String(pwaStatus.swStaticCacheFirstTimeoutMode || '—'),
          'PWA asset audit: ' + String(pwaStatus.pwaAssetAuditMode || '—') + ' · manifest ' + (pwaStatus.pwaAssetManifestOk ? 'OK' : 'kontrola') + ' · favicon ' + (pwaStatus.pwaAssetFaviconOk ? 'OK' : 'kontrola') + ' · apple ' + (pwaStatus.pwaAssetAppleTouchOk ? 'OK' : 'kontrola') + ' · SW ikony ' + String(pwaStatus.swAssetIconCount || 0) + '/' + String(pwaStatus.pwaAssetExpectedIconCount || 0) + ' · root odkazy ' + (pwaStatus.pwaAssetRootIconRefsBlocked && !Number(pwaStatus.swAssetLegacyRootIconCount || 0) ? 'žádné' : 'kontrola') + ' · ZIP ' + String(pwaStatus.swExportZipRootMode || '—'),
          'PWA dokončení: ' + String(pwaStatus.swPhase8CompletionMode || '—') + ' · připraveno ' + (pwaStatus.swPhase8Ready ? 'ano' : 'ne') + ' · app shell ' + String(pwaStatus.swAppShellCachedRatio || 0) + '%',
          releaseReadiness ? ('Release readiness: ' + (releaseReadiness.ok ? 'OK' : 'kontrola') + ' · verze ' + String(releaseReadiness.version || '—') + ' · CDN skripty ' + String(releaseReadiness.externalScriptCount || 0) + ' · export ' + String(releaseReadiness.exportSmokeReportStatus || '—') + ' · DOM ' + String(releaseReadiness.domActionSmokeReportStatus || '—') + ' · SQ ' + String(releaseReadiness.supabaseQueueSmokeReportStatus || '—') + ' · warningy ' + String(releaseReadiness.warningCount || 0)) : ''
        ] : [];
        const dataOptDiag = dataOptStatus ? [
          'Data opt: zápisy/skipy ' + String(dataOptStatus.localStorageWrites || 0) + '/' + String(dataOptStatus.localStorageSkippedWrites || 0) + ' · čtení/cache ' + String(dataOptStatus.localStorageReads || 0) + '/' + String(dataOptStatus.localStorageReadCacheHits || 0),
          'Data opt JSON: parse/cache ' + String(dataOptStatus.localStorageJsonParseReads || 0) + '/' + String(dataOptStatus.localStorageJsonParseCacheHits || 0) + ' · chyby ' + String(dataOptStatus.localStorageJsonParseErrors || 0),
          'Data opt cache: read/json ' + String(dataOptStatus.localReadCacheSize || 0) + '/' + String(dataOptStatus.localCacheMaxSize || 0) + ' · ' + String(dataOptStatus.localJsonCacheSize || 0) + '/' + String(dataOptStatus.localJsonCacheMaxSize || 0) + ' · úklid ' + String(dataOptStatus.localReadCachePrunes || 0) + '/' + String(dataOptStatus.localJsonCachePrunes || 0) + ' · ořez ' + String(dataOptStatus.localReadCacheTrimmedEntries || 0) + '/' + String(dataOptStatus.localJsonCacheTrimmedEntries || 0),
          'Data opt bajty: zapsáno/přeskočeno/přečteno ' + String(dataOptStatus.approxBytesWritten || 0) + '/' + String(dataOptStatus.approxBytesSkipped || 0) + '/' + String(dataOptStatus.approxBytesRead || 0),
          'Data opt home refresh: plán/sloučeno/běh ' + String(dataOptStatus.homeRefreshSchedules || 0) + '/' + String(dataOptStatus.homeRefreshCoalescedSchedules || 0) + '/' + String(dataOptStatus.homeRefreshRuns || 0) + ' · modaly skip ' + String(dataOptStatus.homeRefreshModalSkips || 0),
          'Data opt DOM HTML: zápisy/skipy ' + String(dataOptStatus.domHtmlWrites || 0) + '/' + String(dataOptStatus.domHtmlSkippedWrites || 0) + ' · chyby ' + String(dataOptStatus.domHtmlWriteErrors || 0) + ' · poslední ' + String(dataOptStatus.domHtmlLastKey || '—'),
          'Data opt DOM text/class: text ' + String(dataOptStatus.domTextWrites || 0) + '/' + String(dataOptStatus.domTextSkippedWrites || 0) + ' · class ' + String(dataOptStatus.domClassWrites || 0) + '/' + String(dataOptStatus.domClassSkippedWrites || 0) + ' · poslední ' + String(dataOptStatus.domTextLastKey || dataOptStatus.domClassLastKey || '—'),
          'Data opt DOM select: zápisy/skipy ' + String(dataOptStatus.domSelectWrites || 0) + '/' + String(dataOptStatus.domSelectSkippedWrites || 0) + ' · chyby ' + String(dataOptStatus.domSelectWriteErrors || 0) + ' · poslední ' + String(dataOptStatus.domSelectLastKey || '—'),
          'Data opt DOM toggle: zápisy/skipy ' + String(dataOptStatus.domToggleWrites || 0) + '/' + String(dataOptStatus.domToggleSkippedWrites || 0) + ' · chyby ' + String(dataOptStatus.domToggleWriteErrors || 0) + ' · poslední ' + String(dataOptStatus.domToggleLastKey || '—'),
          'Data opt DOM style: zápisy/skipy ' + String(dataOptStatus.domStyleWrites || 0) + '/' + String(dataOptStatus.domStyleSkippedWrites || 0) + ' · chyby ' + String(dataOptStatus.domStyleWriteErrors || 0) + ' · poslední ' + String(dataOptStatus.domStyleLastKey || '—')
        ] : [];
        const supabaseDiag = supabaseHardening ? [
          'Supabase fronta: ' + String(supabaseHardening.queueLength || 0) + ' / ' + String(supabaseHardening.queueMaxItems || '—'),
          'Supabase realtime: ' + String(supabaseHardening.realtimeStatus || '—'),
          supabaseKeepaliveStatus ? ('Supabase stav: ' + String(supabaseKeepaliveStatus.label || supabaseKeepaliveStatus.status || '—') + ' · poslední OK ' + String(supabaseKeepaliveStatus.lastSuccessAt || '—') + ' · poslední chyba ' + String(supabaseKeepaliveStatus.lastErrorMessage || '—')) : '',
          supabaseKeepaliveStatus ? ('Supabase heartbeat: tabulka ' + String(supabaseKeepaliveStatus.table || 'app_keepalive') + ' · interval ' + String(supabaseKeepaliveStatus.minIntervalHours || 12) + ' h · pokusy/OK/chyby/skip ' + String(supabaseKeepaliveStatus.attempts || 0) + '/' + String(supabaseKeepaliveStatus.successes || 0) + '/' + String(supabaseKeepaliveStatus.failures || 0) + '/' + String(supabaseKeepaliveStatus.skips || 0) + ' · důvod ' + String(supabaseKeepaliveStatus.lastReason || '—') + ' · typ ' + String(supabaseKeepaliveStatus.lastClassification || '—')) : '',
          supabasePerformanceHealth ? ('Supabase výkon: ' + (supabasePerformanceHealth.ok ? 'OK' : 'kontrola') + ' · refresh sloučeno/běh ' + String(supabasePerformanceHealth.realtimeRefreshCoalesced || 0) + '/' + String(supabasePerformanceHealth.realtimeRefreshRuns || 0) + ' · hidden odklad ' + String(supabasePerformanceHealth.realtimeRefreshHiddenDefers || 0) + ' · tabulek ' + String(supabasePerformanceHealth.realtimeTableCount || 0)) : '',
          supabasePerformanceHealth ? ('Supabase cache/realtime: cache hit/write ' + String(supabasePerformanceHealth.cacheHits || 0) + '/' + String(supabasePerformanceHealth.cacheWrites || 0) + ' · sdílené čtení start/join/peak ' + String(supabasePerformanceHealth.sharedReadStarts || 0) + '/' + String(supabasePerformanceHealth.sharedReadJoins || 0) + '/' + String(supabasePerformanceHealth.sharedReadPeak || 0) + ' · problémy ' + String((supabasePerformanceHealth.issues || []).length || 0)) : '',
          supabasePerformanceHealth ? ('Supabase zápisy: check/start/join/skip ' + String(supabasePerformanceHealth.writeOptimizationChecks || 0) + '/' + String(supabasePerformanceHealth.writeOptimizationStarts || 0) + '/' + String(supabasePerformanceHealth.writeOptimizationJoins || 0) + '/' + String(supabasePerformanceHealth.writeOptimizationSkips || 0) + ' · aktivní/peak ' + String(supabasePerformanceHealth.writeOptimizationActive || 0) + '/' + String(supabasePerformanceHealth.writeOptimizationPeak || 0)) : '',
          supabaseStructureHealth ? ('Supabase struktura/RLS: ' + (supabaseStructureHealth.ok ? 'OK' : 'kontrola') + ' · tabulky ' + String(supabaseStructureHealth.expectedTableCount || 0) + ' · realtime chybí ' + String(supabaseStructureHealth.missingRealtimeTableCount || 0) + ' · queue chybí ' + String(supabaseStructureHealth.missingQueueTypeCount || 0) + ' · helpery chybí ' + String(supabaseStructureHealth.missingHelperCount || 0)) : '',
          supabaseStructureHealth ? ('Supabase GRANT/policies checklist: signály ' + String(supabaseStructureHealth.grantSignalCount || 0) + ' · policies ' + String(supabaseStructureHealth.rlsPolicyChecklistCount || 0) + ' · problémy ' + String((supabaseStructureHealth.issues || []).length || 0)) : '',
          supabasePolicyRiskHealth ? ('Supabase RLS audit: ' + (supabasePolicyRiskHealth.ok ? 'OK' : 'rizika') + ' · P0/P1/P2 ' + String(supabasePolicyRiskHealth.p0Count || 0) + '/' + String(supabasePolicyRiskHealth.p1Count || 0) + '/' + String(supabasePolicyRiskHealth.p2Count || 0) + ' · veřejný write tabulek ' + String(supabasePolicyRiskHealth.publicWriteTableCount || 0) + ' · destruktivní ' + String(supabasePolicyRiskHealth.destructiveTableCount || 0)) : '',
          supabasePolicyRiskHealth && supabasePolicyRiskHealth.phase ? ('Supabase fáze: ' + String(supabasePolicyRiskHealth.phase.current || '—') + ' · další: ' + String(supabasePolicyRiskHealth.phase.next || '—')) : '',
          supabaseHardeningReadiness ? ('Supabase readiness: ' + String(supabaseHardeningReadiness.readinessPercent || 0) + '% · policy změna teď ' + (supabaseHardeningReadiness.policyChangeAllowedNow ? 'ano' : 'ne') + ' · přímé fallback oblasti ' + String(supabaseHardeningReadiness.directFallbackCount || 0) + ' · P0 ' + String(supabaseHardeningReadiness.p0Count || 0)) : '',
          supabaseHardeningReadiness ? ('Supabase další bezpečný krok: ' + String(supabaseHardeningReadiness.nextSafeStep || '—')) : '',
          supabaseHardeningReadiness ? ('Supabase potvrzeno: Piškvorky link/kód ' + (supabaseHardeningReadiness.confirmed && supabaseHardeningReadiness.confirmed.tttLinkAndCode ? 'OK' : 'ne') + ' · Lodě smoke ' + (gameSessionRpcSmoke && gameSessionRpcSmoke.perGameCoverage && gameSessionRpcSmoke.perGameCoverage.battleship && gameSessionRpcSmoke.perGameCoverage.battleship.create && gameSessionRpcSmoke.perGameCoverage.battleship.accept && gameSessionRpcSmoke.perGameCoverage.battleship.save ? 'OK' : 'čeká') + ' · heartbeat RPC ' + (supabaseHardeningReadiness.confirmed && supabaseHardeningReadiness.confirmed.keepaliveRpc ? 'OK' : 'kontrola') + ' · DB policies v tomto buildu ' + (supabaseHardeningReadiness.confirmed && supabaseHardeningReadiness.confirmed.noPolicyChangeInThisBuild ? 'beze změny' : 'kontrola')) : '',

          rpcHardeningStatus ? ('Supabase bug_reports: veřejné SELECT/UPDATE policies ' + String(rpcHardeningStatus.bugReportsPublicSelectUpdatePolicies || 0) + ' · DB změna ' + (rpcHardeningStatus.bugReportsDbChanged ? 'ano' : 'ne') + ' · další ' + String(rpcHardeningStatus.bugReportsNextStep || '—')) : '',
          gameStatsRpcSmoke ? ('Supabase game_stats RPC smoke: pokusy/OK/fallback ' + String(gameStatsRpcSmoke.attempts || 0) + '/' + String(gameStatsRpcSmoke.successes || 0) + '/' + String(gameStatsRpcSmoke.fallbacks || 0) + ' · ready ' + (gameStatsRpcSmoke.readyForPolicyTightening ? 'ano' : 'ne') + ' · poslední OK ' + String(gameStatsRpcSmoke.lastSuccessType || '—')) : '',
          gameUiRpcSmoke ? ('Supabase profile UI RPC smoke: pokusy/OK/fallback ' + String(gameUiRpcSmoke.attempts || 0) + '/' + String(gameUiRpcSmoke.successes || 0) + '/' + String(gameUiRpcSmoke.fallbacks || 0) + ' · ready ' + (gameUiRpcSmoke.readyForPolicyTightening ? 'ano' : 'ne')) : '',
          gameSessionRpcSmoke ? ('Supabase session/pozvánky RPC smoke: pokusy/OK/fallback ' + String(gameSessionRpcSmoke.attempts || 0) + '/' + String(gameSessionRpcSmoke.successes || 0) + '/' + String(gameSessionRpcSmoke.fallbacks || 0) + ' · ready ' + (gameSessionRpcSmoke.readyForPolicyTightening ? 'ano' : 'ne') + ' · poslední OK ' + String(gameSessionRpcSmoke.lastSuccessType || '—')) : '',
          gameSessionRpcSmoke ? ('Supabase online hry RPC pokrytí: ' + String(gameSessionRpcSmoke.gameCoverageText || gameSessionRpcSmoke.coverageText || 'Piškvorky c/a/s 0/0/0 · fallback 0 | Lodě c/a/s 0/0/0 · fallback 0')) : '',
          gameSessionRpcSmoke ? ('Supabase online hry chybí: ' + String((gameSessionRpcSmoke.missingGameOperations || []).length ? gameSessionRpcSmoke.missingGameOperations.join(', ') : 'nic')) : '',
          supabaseGuard ? ('Supabase guard: sloučeno ' + String(supabaseGuard.deduped || 0) + ' · ořezáno ' + String(supabaseGuard.trimmed || 0) + ' · odmítnuto ' + String((supabaseGuard.rejected || 0) + (supabaseGuard.oversized || 0))) : '',
          supabaseSyncGuard ? ('Supabase sync: timeouty R/W ' + String(supabaseSyncGuard.readTimeouts || 0) + '/' + String(supabaseSyncGuard.writeTimeouts || 0) + ' · retry R/W ' + String(supabaseSyncGuard.readRetries || 0) + '/' + String(supabaseSyncGuard.writeRetries || 0) + ' · fallback ' + String(supabaseSyncGuard.queuedFallbacks || 0)) : '',
          supabaseSyncGuard ? ('Supabase chyby: čtení ' + String(supabaseSyncGuard.failedReads || 0) + ' · zápis ' + String(supabaseSyncGuard.failedWrites || 0) + ' · cooldown ' + String(supabaseSyncGuard.cooldownSkips || 0)) : '',
          supabaseCacheGuard ? ('Supabase herní cache: účty hit/write ' + String(supabaseCacheGuard.accountCacheHits || 0) + '/' + String(supabaseCacheGuard.accountCacheWrites || 0) + ' · statistiky hit/write ' + String(supabaseCacheGuard.statsCacheHits || 0) + '/' + String(supabaseCacheGuard.statsCacheWrites || 0)) : '',
          supabaseCacheGuard ? ('Supabase sdílené čtení: spojeno ' + String(supabaseCacheGuard.sharedReadJoins || 0) + ' · stale fallback ' + String(supabaseCacheGuard.staleFallbacks || 0)) : '',
          profileUiGuard ? ('Profilový vzhled: load ' + String(profileUiGuard.remoteLoads || 0) + ' · apply ' + String(profileUiGuard.remoteApplies || 0) + ' · skip starší ' + String(profileUiGuard.remoteOlderSkips || 0) + ' · save ' + String(profileUiGuard.remoteSaves || 0)) : '',
          profileUiGuard ? ('Profilový vzhled guard: stejný save ' + String(profileUiGuard.saveSameSkips || 0) + ' · in-flight load/save ' + String(profileUiGuard.loadInFlightJoins || 0) + '/' + String(profileUiGuard.saveInFlightJoins || 0)) : ''
        ].filter(Boolean) : [];
        const diag = [
          'Verze: ' + String((typeof app !== "undefined" && app.version) || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '—')),
          'Online: ' + (navigator.onLine ? 'ano' : 'ne'),
          formatSupabaseKeepaliveLine(supabaseKeepaliveStatus || readSupabaseKeepaliveStatusForUi()),
          'Kompaktní režim: ' + (document.body.classList.contains('compactUI') ? 'zapnutý' : 'vypnutý'),
          LIGHTWEIGHT_MODE_LABEL + ': ' + (document.body.classList.contains('lightweightMode') ? 'zapnutý' : 'vypnutý') + (document.body.classList.contains('reduceMotion') ? ' · méně animací aktivní' : '') + (lightweightManual ? ' · ručně' : ''),
          'Výkonový profil: ' + (document.body.classList.contains('lightweightMode') || document.body.classList.contains('lowEndDevice') ? 'odlehčený' : 'normální'),
          'Starší/slabší zařízení detekováno: ' + (lowEndInfo.lowEnd ? 'ano' : (document.body.classList.contains('lightweightMode') ? 'ne automaticky, ale Láďův režim je zapnutý' : 'ne')) + lowEndReason,
          'Canvas DPR limit: ' + String(typeof getRakPerformanceDprMax === 'function' ? getRakPerformanceDprMax() : '—'),
          'Zařízení: ' + deviceInfo,
          'Aktuální stránka: ' + String(document.querySelector('.page.active')?.id || '—'),
          'Pozadí: ' + String((typeof getBackgroundPreference === 'function' ? getBackgroundPreference() : document.documentElement.dataset.rakBackground) || '—'),
          'Bottom lišta: ' + String(getComputedStyle(document.querySelector('.bottomNav') || document.body).bottom || '—'),
          ...securityRenderDiag,
          ...finalStabilizationDiag,
          ...ladaPerformanceDiag,
          ...devicePerformanceDiag,
          ...gameEngineDiag,
          ...architectureDiag,
          ...tttOnlineJoinDiag,
          ...pwaDiag,
          ...dataOptDiag,
          ...supabaseDiag
        ].join('\n');
        body.innerHTML = [
          '<div class="appMenuCard appMenuDiagnosticsCard">',
          '  <div class="appMenuCardTitle">Diagnostika</div>',
          '</div>',
          buildSupabaseKeepaliveStatusHtml({ includeButton: true }),
          '<div class="appMenuCard appMenuDiagnosticsCard">',
          '  <pre class="appMenuDiagnosticsText">' + escapeHtml(diag) + '</pre>',
          '</div>',
          '<button type="button" class="appMenuAction appMenuStandaloneBack" data-menu-action="settings">Zpět do nastavení</button>'
        ].join('');
        return;
      }
      if (menuAction === 'supabase-heartbeat-now') {
        try {
          const before = readSupabaseKeepaliveStatusForUi();
          const run = typeof window.runSupabaseKeepaliveNow === 'function'
            ? window.runSupabaseKeepaliveNow
            : (typeof window.RotationSupabaseBridge !== 'undefined' && window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.runKeepaliveNow === 'function' ? window.RotationSupabaseBridge.runKeepaliveNow : null);
          if (!run) {
            alert('Supabase heartbeat ještě není připravený. Zkus to po pár sekundách znovu.\n\n' + formatSupabaseKeepaliveLine(before));
            return;
          }
          await Promise.resolve(run('manual-diagnostics'));
          const after = readSupabaseKeepaliveStatusForUi();
          alert(formatSupabaseKeepaliveLine(after));
        } catch (err) {
          const after = readSupabaseKeepaliveStatusForUi();
          alert('Supabase heartbeat test se nepovedl: ' + String(err && err.message ? err.message : err || 'neznámá chyba') + '\n\n' + formatSupabaseKeepaliveLine(after));
        }
        return;
      }
      if (menuAction === 'hard-reload') {
        if (confirm('Načíst appku znovu bez uložené cache?')) {
          try {
            window.location.reload();
          } catch (err) {
            window.location.reload();
          }
        }
        return;
      }
      if (menuAction === 'reset-state') {
        if (confirm('Smazat uložený stav aplikace?')) {
          try {
            localStorage.removeItem(APP_KEY);
            localStorage.removeItem('rotationBuild');
            localStorage.removeItem(UI_PREFS_KEY);
            localStorage.removeItem('adminUnlocked');
          } catch (err) {
            console.warn(err);
          }
          if (typeof forceHomeRefresh === 'function') forceHomeRefresh();
          if (typeof renderRotace === 'function') renderRotace();
          if (typeof renderStatsPanel === 'function') renderStatsPanel();
          if (typeof updateDashboard === 'function') updateDashboard();
        }
        return;
      }

      if (adminAction === 'back-admin') {
        openAppMenu('admin');
        return;
      }
      if (adminAction === 'open-machines') {
        openAppMenu('admin-machines');
        return;
      }
      if (adminAction === 'open-rotation') {
        openAppMenu('admin-rotation');
        return;
      }
      if (adminAction === 'open-announcement') {
        openAppMenu('admin-announcement');
        return;
      }
      if (adminAction === 'open-usage') {
        openAppMenu('admin-usage');
        return;
      }
      if (adminAction === 'open-export') {
        openAppMenu('admin-export');
        return;
      }
      if (adminAction === 'open-reports') {
        openAppMenu('admin-reports');
        return;
      }
      if (adminAction === 'open-service') {
        openAppMenu('admin-service');
        return;
      }
      if (adminAction === 'service-load-status') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (statusEl) statusEl.textContent = 'Načítám servisní stav…';
        await loadAdminServiceSnapshotFromSupabase();
        renderAdminMenuBody(body, 'service');
        return;
      }
      if (adminAction === 'service-sync-now') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (statusEl) statusEl.textContent = 'Synchronizuji rozpis, hry a update…';
        if (typeof runDashboardManualSync === 'function') await runDashboardManualSync('admin-service-sync');
        else if (typeof window.__rotaceTriggerLiveRefresh === 'function') await window.__rotaceTriggerLiveRefresh('admin-service-sync', { force: true });
        await loadAdminServiceSnapshotFromSupabase();
        renderAdminMenuBody(body, 'service');
        return;
      }
      if (adminAction === 'service-update-check') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (statusEl) statusEl.textContent = 'Kontroluji aktualizaci…';
        if (typeof window.__rotaceForcePwaUpdateCheck === 'function') await window.__rotaceForcePwaUpdateCheck('admin-service');
        if (typeof window.__rotaceRequestPwaCacheStatus === 'function') window.__rotaceRequestPwaCacheStatus('admin-service');
        renderAdminMenuBody(body, 'service');
        return;
      }
      if (adminAction === 'service-clean-invites') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (statusEl) statusEl.textContent = 'Čistím prošlé pozvánky…';
        const result = await cleanupAdminExpiredInvites();
        if (!result || result.ok === false) throw (result && result.error ? result.error : new Error('Úklid pozvánek se nepovedl.'));
        await loadAdminServiceSnapshotFromSupabase();
        renderAdminMenuBody(body, 'service');
        return;
      }
      if (adminAction === 'usage-load') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (statusEl) statusEl.textContent = 'Načítám připojení…';
        await loadAdminAppUsageFromSupabase();
        renderAdminMenuBody(body, 'usage');
        return;
      }
      if (adminAction === 'load-reports') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (statusEl) statusEl.textContent = 'Načítám reporty…';
        await loadAdminBugReportsFromSupabase();
        renderAdminMenuBody(body, 'reports');
        return;
      }
      if (adminAction === 'download-reports') {
        downloadAdminBugReports();
        return;
      }
      if (adminAction === 'report-delete') {
        const reportId = target.getAttribute('data-report-id') || target.closest('[data-report-id]')?.getAttribute('data-report-id') || '';
        const result = await deleteAdminBugReport(reportId);
        if (!result || result.ok === false) throw (result && result.error ? result.error : new Error('Report se nepodařilo smazat.'));
        renderAdminMenuBody(body, 'reports');
        return;
      }
      if (adminAction === 'report-seen' || adminAction === 'report-done' || adminAction === 'report-ignore') {
        const reportId = target.getAttribute('data-report-id') || target.closest('[data-report-id]')?.getAttribute('data-report-id') || '';
        const nextStatus = adminAction === 'report-done' ? 'done' : (adminAction === 'report-ignore' ? 'ignored' : 'seen');
        const result = await updateAdminBugReportStatus(reportId, nextStatus);
        if (!result || result.ok === false) throw (result && result.error ? result.error : new Error('Report se nepodařilo upravit.'));
        renderAdminMenuBody(body, 'reports');
        return;
      }
      if (adminAction === 'save-announcement') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        const payload = readAdminAnnouncementFromDom();
        if (!payload.message) {
          if (statusEl) statusEl.textContent = 'Nejdřív napiš text oznámení.';
          document.getElementById('adminAnnouncementMessage')?.focus?.();
          return;
        }
        if (payload.startAt && payload.endAt && new Date(payload.startAt).getTime() > new Date(payload.endAt).getTime()) {
          if (statusEl) statusEl.textContent = 'Čas „Od“ musí být před časem „Do“.';
          return;
        }
        if (typeof window.writeRakDashboardAnnouncement === 'function') {
          if (statusEl) statusEl.textContent = 'Ukládám oznámení…';
          const result = await window.writeRakDashboardAnnouncement(payload);
          if (statusEl) {
            statusEl.textContent = result && result.ok
              ? 'Oznámení uložené ✓ · uvidí ho všichni po načtení appky.'
              : 'Oznámení se nepodařilo uložit online: ' + String((result && (result.reason || result.message)) || 'zkontroluj připojení / Supabase.');
          }
          renderAdminMenuBody(body, 'announcement');
        } else if (statusEl) {
          statusEl.textContent = 'Oznámení se nepodařilo uložit, chybí dashboard helper.';
        }
        return;
      }
      if (adminAction === 'clear-announcement') {
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        if (typeof window.clearRakDashboardAnnouncement === 'function') {
          if (statusEl) statusEl.textContent = 'Vypínám oznámení…';
          const result = await window.clearRakDashboardAnnouncement();
          if (statusEl) {
            statusEl.textContent = result && result.ok
              ? 'Oznámení vypnuté ✓'
              : 'Oznámení se nepodařilo vypnout online: ' + String((result && (result.reason || result.message)) || 'zkontroluj připojení / Supabase.');
          }
          renderAdminMenuBody(body, 'announcement');
        } else if (statusEl) {
          statusEl.textContent = 'Oznámení se nepodařilo vypnout, chybí dashboard helper.';
        }
        return;
      }
      if (adminAction === 'load-month') {
        if (monthKey) {
          app.selectedMonth = monthKey;
          setRotaceView('months');
          renderRotace();
          if (typeof renderMonth === 'function') renderMonth(monthKey);
        }
        return;
      }
      if (adminAction === 'load-online') {
        await loadAdminRotationFromSupabase();
        renderAdminMenuBody(body, currentView);
        return;
      }
      if (adminAction === 'save-rotation') {
        const result = await saveAdminRotationFromDom(monthKey);
        const statusEl = document.getElementById('adminOnlineSaveStatus');
        const saveResult = result && result.saveResult ? result.saveResult : null;
        if (statusEl) {
          statusEl.textContent = saveResult && saveResult.ok === true
            ? (saveResult.queued
                ? 'Rozpis uložený lokálně ✓ · po připojení se synchronizuje'
                : ('Rozpis uložený online ✓ · měsíců: ' + String(saveResult.months || 0) + ' · řádků: ' + String(saveResult.entries || 0)))
            : 'Rozpis se nepodařilo uložit online.';
        }
        renderAdminMenuBody(body, currentView);
        return;
      }
      if (adminAction === 'load-machines') {
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function') {
          app.machineSettingsRows = await window.RotationSupabaseBridge.loadMachineSettings();
          renderAdminMenuBody(body, currentView);
          return;
        }
      }
      if (adminAction === 'save-machines') {
        const rows = readAdminMachineSettingsFromDom();
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function') {
          const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
          if (result && result.ok === false) throw (result.error || new Error('Uložení strojů selhalo.'));
          app.machineSettingsRows = rows;
          try {
            if (typeof refreshPrackaFromMachineSettings === 'function') refreshPrackaFromMachineSettings('admin-save-machines');
            else if (typeof updatePrackaInfo === 'function') updatePrackaInfo();
          } catch (err) {}
          try {
            if (typeof refreshFhbSettingsUi === 'function') refreshFhbSettingsUi({ source: 'admin-save-machines', recalculate: true });
            else if (typeof updateFhbPresetButtons === 'function') updateFhbPresetButtons();
          } catch (err) {}
          renderAdminMenuBody(body, currentView);
          const statusEl = document.getElementById('adminOnlineSaveStatus');
          if (statusEl) statusEl.textContent = (result && result.queued)
            ? ('Stroje uložené lokálně ✓ · po připojení se synchronizují' + ((result && result.savedCount) ? (' · řádků: ' + result.savedCount) : ''))
            : ('Stroje uložené online ✓' + ((result && result.savedCount) ? (' · řádků: ' + result.savedCount) : ''));
          return;
        }
      }

      if (uiPref) {
        toggleUiPref(uiPref);
        openAppMenu('settings');
        return;
      }
      if (uiReset) {
        resetUiPrefs();
        openAppMenu('settings');
        return;
      }
    } catch (err) {
      console.error('Menu/admin action failed', err);
      alert(err && err.message ? err.message : 'Akce se nepodařila.');
    }
  });

  body.addEventListener('focusout', (event) => {
    const target = event.target;
    if (!target || typeof target.matches !== 'function') return;
    if (!target.matches('[data-rot-field], [data-note-field]')) return;
    window.setTimeout(() => {
      const next = document.activeElement;
      const quick = document.getElementById('adminRotationQuickRemove');
      if (quick && (next === quick || (next && quick.contains && quick.contains(next)))) return;
      if (!next || !next.matches || !next.matches('[data-rot-field], [data-note-field]')) adminCloseRotationQuickRemove();
    }, 120);
  });

  body.addEventListener('scroll', () => {
    if (body.dataset.adminView !== 'rotation') return;
    try {
      if (window.__rakAdminRotationScrollCloseRaf) return;
      window.__rakAdminRotationScrollCloseRaf = window.requestAnimationFrame(() => {
        window.__rakAdminRotationScrollCloseRaf = 0;
        adminCloseRotationQuickRemove();
      });
    } catch (err) {
      adminCloseRotationQuickRemove();
    }
  }, { passive: true });

  body.addEventListener('input', (event) => {
    const target = event.target;
    if (!target || typeof target.matches !== 'function') return;
    if (!target.matches('[data-rot-field], [data-note-field]')) return;
    if (adminRotationIsRemoveValue(target.value)) {
      target.value = '';
      adminCloseRotationQuickRemove();
    } else {
      adminScheduleRotationQuickRemove(target);
    }
    if (body.dataset.adminView === 'rotation') {
      scheduleAdminRotationEditorMaintenance(body, 'input', 900);
    }
  });

  body.addEventListener('focusin', (event) => {
    const target = event.target;
    if (!target || typeof target.matches !== 'function') return;
    if (!target.matches('[data-rot-field], [data-note-field]')) return;
    if (body.dataset.adminView === 'rotation') {
      adminScheduleRotationQuickRemove(target);
      adminAttachRotationAvailableDatalist(target);
    }
  });
}

function openAppMenu(view) {
  const page = ensureAppMenuOverlay();
  page.classList.add('active');
  const body = page.querySelector('#appMenuBody');
  const v = view || 'menu';

  const versionText = (typeof app !== 'undefined' && app.version) || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '');
  const contactName = 'Martin Špadrna';
  const contactPhone = '+420 773 682 499';
  const contactEmail = 'martinspadrna@gmail.com';

  if (body) {
    bindAppMenuHandlers(body);
    if (v === 'about') {
      body.innerHTML = [
        '<div class="appMenuCard">',
        '  <div class="appMenuCardTitle">O aplikaci</div>',
        '  <div class="appMenuVersion">' + escapeHtml(versionText || '—') + '</div>',
        '  ' + buildAppHistoryHtml(versionText),
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
      if (typeof renderThemeSettingsCards === 'function') {
        try { renderThemeSettingsCards(); } catch (err) {}
      }
    } else if (v === 'contact') {
      bindAppMenuHandlers(body);
      body.innerHTML = [
        '<div class="appMenuCard appMenuSecretCard" data-admin-secret="contact" role="button" tabindex="0">',
        '  <div class="appMenuCardTitle">Kontakt</div>',
        '',
        '  <div class="appMenuContactRow"><span>Jméno</span><b>' + escapeHtml(contactName) + '</b></div>',
        '  <div class="appMenuContactRow"><span>Telefon</span><b>' + escapeHtml(contactPhone) + '</b></div>',
        '  <div class="appMenuContactRow"><span>E-mail</span><b>' + escapeHtml(contactEmail) + '</b></div>',
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
    } else if (v === 'bug-report') {
      bindAppMenuHandlers(body);
      renderBugReportMenuBody(body);
    } else if (v === 'settings') {
      bindAppMenuHandlers(body);
      const prefs = loadUiPrefs();
      const profileCard = buildGamesProfileSettingsHtml();
      const performanceCard = typeof buildRakDevicePerformanceSettingsHtml === 'function' ? buildRakDevicePerformanceSettingsHtml() : '';
      const themeCards = buildThemeSystemSettingsHtml();
      body.innerHTML = [
        profileCard,
        performanceCard,
        '<div class="appMenuCard appMenuSettingsCard appMenuAppSettingsCard">',
        '  <div class="appMenuCardTitle">Nastavení aplikace</div>',
        '  <div class="appMenuSettingsList appMenuSettingsGrid">',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-ui-pref="compact">' + (prefs.compact ? '✓ ' : '') + 'Kompaktní</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-menu-action="clear-cache">Vyčistit cache</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-menu-action="app-diagnostics">Diagnostika</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-ui-reset="1">Výchozí</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn appMenuDangerBtn" data-menu-action="reset-state">Smazat data</button>',
        '  </div>',
        '</div>',
        themeCards,
        '<button type="button" class="appMenuAction appMenuBack appMenuStandaloneBack" data-menu-back="1">Zpět</button>'
      ].join('');
      if (typeof gamesRenderAccountChips === 'function') {
        try { gamesRenderAccountChips(); } catch (err) {}
      }
      if (typeof renderGamesProfileStatus === 'function') {
        try { renderGamesProfileStatus(); } catch (err) {}
      }
      if (typeof renderThemeSettingsCards === 'function') {
        try { renderThemeSettingsCards(); } catch (err) {}
      }
    } else if (v === 'admin') {
      bindAppMenuHandlers(body);
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'home');
        } catch (err) {
          console.warn('Admin preload failed', err);
          renderAdminMenuBody(body, 'home');
        }
      })();
    } else if (v === 'admin-machines') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'machines');
        } catch (err) {
          console.warn('Admin machines preload failed', err);
          renderAdminMenuBody(body, 'machines');
        }
      })();
    } else if (v === 'admin-rotation') {
      void (async () => {
        try {
          await loadAdminRotationFromSupabase();
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'rotation');
        } catch (err) {
          console.warn('Admin rotation preload failed', err);
          renderAdminMenuBody(body, 'rotation');
        }
      })();
    } else if (v === 'admin-announcement') {
      renderAdminMenuBody(body, 'announcement');
    } else if (v === 'admin-export') {
      renderAdminMenuBody(body, 'export');
    } else if (v === 'admin-usage') {
      bindAppMenuHandlers(body);
      void (async () => {
        try {
          await loadAdminAppUsageFromSupabase();
          renderAdminMenuBody(body, 'usage');
        } catch (err) {
          console.warn('Admin usage preload failed', err);
          app.adminUsageSnapshot = { ok: false, error: err, devices: [], events: [], summary: {} };
          renderAdminMenuBody(body, 'usage');
        }
      })();
    } else if (v === 'admin-reports') {
      void (async () => {
        try {
          await loadAdminBugReportsFromSupabase();
          renderAdminMenuBody(body, 'reports');
        } catch (err) {
          console.warn('Admin reports preload failed', err);
          renderAdminMenuBody(body, 'reports');
        }
      })();
    } else if (v === 'admin-service') {
      bindAppMenuHandlers(body);
      void (async () => {
        try {
          await loadAdminServiceSnapshotFromSupabase();
          renderAdminMenuBody(body, 'service');
        } catch (err) {
          console.warn('Admin service preload failed', err);
          renderAdminMenuBody(body, 'service');
        }
      })();
    } else {
      body.innerHTML = [
        '<div class="appMenuGrid">',
        '  <button type="button" class="appMenuAction" data-menu-action="settings">Nastavení</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="about">O aplikaci</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="contact">Kontakt</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="bug-report">Pošli mi chybu</button>',
        (app.adminUnlocked ? '  <button type="button" class="appMenuAction isActive" data-menu-action="admin">Administrace</button>' : ''),
        '</div>'
      ].join('');
    }

    bindAppMenuHandlers(body);
  }

  return page;
}

function toggleAppMenu() {

  showPage('menu');
  openAppMenu('menu');
  setBottomNavActive('menu');
}

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


function updateRotaceNamesDockMetrics(reason) {
  const result = {
    ok: true,
    reason: String(reason || 'manual'),
    checkedAt: new Date().toISOString(),
    mode: 'stable-css-no-post-open-jump-v930',
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
  // v966: dock se znovu přizpůsobuje reálné spodní liště a safe-area,
  // aby jména seděla těsně nad panelem místo ručního ladění po pixelech.
  try {
    const root = document.documentElement;
    const nav = document.querySelector('nav.bottomNav') || document.querySelector('.bottomNav');
    const grid = document.getElementById('namesGrid');
    const viewport = window.visualViewport || null;
    const vh = Math.round(Number(viewport && viewport.height || window.innerHeight || root.clientHeight || 720) || 720);
    const navRect = nav && typeof nav.getBoundingClientRect === 'function' ? nav.getBoundingClientRect() : null;
    const gridRect = grid && typeof grid.getBoundingClientRect === 'function' ? grid.getBoundingClientRect() : null;
    const navTopGap = navRect ? Math.max(0, Math.round(vh - Number(navRect.top || vh))) : 72;
    const dockGap = vh >= 850 ? 8 : 6;
    const dockBottom = Math.max(54, Math.min(124, navTopGap + dockGap));
    const gridHeight = gridRect ? Math.max(88, Math.min(156, Math.round(Number(gridRect.height || 0) || 120))) : 120;
    root.style.setProperty('--rak-rotace-names-dock-bottom', dockBottom + 'px');
    root.style.setProperty('--rak-rotace-names-content-bottom', (dockBottom + gridHeight + 24) + 'px');
    root.dataset.rakRotaceNamesDockMode = 'adaptive-v966';
    setTimeout(() => { try { updateRotaceNamesDockMetrics(reason || 'adaptive-v966'); } catch (err) {} }, 0);
    return updateRotaceNamesDockMetrics(reason || 'adaptive-v966');
  } catch (err) {
    try { return updateRotaceNamesDockMetrics(reason || 'adaptive-v966-fallback'); } catch (_) { return null; }
  }
}

if (!window.__rakRotaceNamesDockMetricsBound) {
  window.__rakRotaceNamesDockMetricsBound = true;
  try { window.addEventListener('resize', () => scheduleRotaceNamesDockMetrics('window-resize'), { passive: true }); } catch (err) {}
  try { window.addEventListener('orientationchange', () => scheduleRotaceNamesDockMetrics('orientationchange'), { passive: true }); } catch (err) {}
  try {
    if (window.visualViewport) window.visualViewport.addEventListener('resize', () => scheduleRotaceNamesDockMetrics('visual-viewport-resize'), { passive: true });
  } catch (err) {}
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
      if (typeof updateRotaceNamesDockMetrics === 'function') updateRotaceNamesDockMetrics('showPage-before-render');
      if (typeof initRotaceCurrentMonth === 'function') initRotaceCurrentMonth();
      setRotaceView('names');
      if (typeof renderRotace === 'function') renderRotace();
      if (typeof scheduleRotaceNamesDockMetrics === 'function') scheduleRotaceNamesDockMetrics('showPage-after-render');
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
    if (typeof scheduleRotaceNamesDockMetrics === 'function') scheduleRotaceNamesDockMetrics('setRotaceView-names');
    tabNames && (tabNames.style.outline = '3px solid #7CFF7C');
  } else if (view === 'stats') {
    statsPanel && statsPanel.classList.add('active');
    tabStats && (tabStats.style.outline = '3px solid #7CFF7C');
  } else {
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

// -------------------------
// Games hub + account profile
// -------------------------
const GAMES_PROFILE_KEY = APP_KEY + ':games_profile_v1';
const GAMES_PROFILE_RESET_VERSION = 912;
const GAMES_SCORE_RESET_VERSION = 912;
const GAMES_SCORE_RESET_MARKER_KEY = APP_KEY + ':games_score_reset_v923';
const GAMES_REMOTE_STATS_RESET_CUTOFF_MS = Date.parse('2026-05-26T18:44:00+02:00');
const GAMES_ACCOUNT_BLOCKLIST = new Set(['4157']);
const GAMES_ACCOUNT_LIST = [];

function gamesEmptyStats() {
  return {
    ttt: { plays: 0, wins: 0, losses: 0, draws: 0, bestMoves: null, bestTimeMs: null, lastPlayedAt: 0 },
    g2048: { plays: 0, bestScore: 0, bestTile: 0, lastPlayedAt: 0 },
    snake: { plays: 0, bestScore: 0, bestLength: 0, lastPlayedAt: 0 },
    flap: { plays: 0, bestScore: 0, bestPipes: 0, lastPlayedAt: 0 },
    arcade: {}
  };
}

function gamesMakeAccountEntry(accountId, name) {
  const id = String(accountId || '').trim();
  const label = String(name || id || '').trim() || id;
  return {
    id,
    name: label,
    stats: gamesEmptyStats(),
    achievements: [],
    uiSettings: { themeId: '', backgroundId: '', updatedAt: 0 },
    updatedAt: 0
  };
}

function gamesDefaultProfile() {
  return { activeAccountId: '', accounts: {}, profileVersion: GAMES_PROFILE_RESET_VERSION };
}

function gamesParseStatTimestamp(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const raw = String(value || '').trim();
  if (!raw) return 0;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function gamesRemoteStatPlayedTimestamp(row) {
  if (!row) return 0;
  // Pro reset Top score je rozhodující čas odehrání výsledku, ne updated_at.
  // updated_at se může změnit i při dodatečné synchronizaci starého řádku a tím by staré score znovu prolezlo do tabulek.
  const played = gamesParseStatTimestamp(row.last_played_at || row.lastPlayedAt || row.played_at || row.playedAt);
  if (played > 0) return played;
  return gamesParseStatTimestamp(row.created_at || row.createdAt || row.updated_at || row.updatedAt);
}

function gamesIsRemoteStatAfterReset(row) {
  const cutoff = Number(GAMES_REMOTE_STATS_RESET_CUTOFF_MS || 0) || 0;
  if (!Number.isFinite(cutoff) || cutoff <= 0) return true;
  const ts = gamesRemoteStatPlayedTimestamp(row);
  return ts >= cutoff;
}
if (typeof window !== 'undefined') {
  window.gamesRemoteStatPlayedTimestamp = gamesRemoteStatPlayedTimestamp;
  window.gamesIsRemoteStatAfterReset = gamesIsRemoteStatAfterReset;
}

function gamesResetAccountScoresOnly(account, fallbackName) {
  const normalized = gamesNormalizeStoredAccount(account || {}, fallbackName || account && account.name || account && account.id || '');
  normalized.stats = gamesEmptyStats();
  normalized.achievements = [];
  normalized.updatedAt = 0;
  return normalized;
}

function gamesEnsureScoreResetV912() {
  try {
    if (localStorage.getItem(GAMES_SCORE_RESET_MARKER_KEY) === '1') return false;
    const parsed = JSON.parse(localStorage.getItem(GAMES_PROFILE_KEY) || 'null');
    const next = gamesDefaultProfile();
    const accounts = parsed && parsed.accounts && typeof parsed.accounts === 'object' ? parsed.accounts : {};
    Object.keys(accounts).forEach((id) => {
      const accountId = String(id || '').trim();
      if (!accountId || GAMES_ACCOUNT_BLOCKLIST.has(accountId)) return;
      next.accounts[accountId] = gamesResetAccountScoresOnly(Object.assign({ id: accountId }, accounts[accountId] || {}), accountId);
    });
    const activeId = String(parsed && parsed.activeAccountId || '').trim();
    next.activeAccountId = activeId && next.accounts[activeId] ? activeId : '';
    next.profileVersion = GAMES_PROFILE_RESET_VERSION;
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(GAMES_PROFILE_KEY, JSON.stringify(next));
    else localStorage.setItem(GAMES_PROFILE_KEY, JSON.stringify(next));
    localStorage.removeItem(TTT_HARD_WIN_KEY);
    localStorage.removeItem('rotace_supabase_gomoku_wins_v1');
    localStorage.removeItem(TTT_ONLINE_RESULT_STORE_KEY);
    localStorage.removeItem(TTT_ONLINE_JOIN_DIAG_KEY);
    const toRemove = [];
    const removePrefixes = [
      'rotace_supabase_game_stats_',
      'rotace_supabase_gomoku_wins',
      APP_KEY + ':games_score_reset_',
      APP_KEY + ':games_leaderboard_',
      APP_KEY + ':games_top_score_'
    ];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = String(localStorage.key(i) || '');
      if (key === GAMES_SCORE_RESET_MARKER_KEY) continue;
      if (removePrefixes.some(prefix => key.indexOf(prefix) === 0)) toRemove.push(key);
    }
    toRemove.forEach((key) => localStorage.removeItem(key));
    if (app && typeof app === 'object') {
      app.gamesLeaderboardCache = {};
      app.gamesLeaderboardThrottle = {};
      app.gamesProfile = next;
    }
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(GAMES_SCORE_RESET_MARKER_KEY, '1');
    else localStorage.setItem(GAMES_SCORE_RESET_MARKER_KEY, '1');
    window.__rakGamesScoreResetV912 = { ok: true, version: GAMES_SCORE_RESET_VERSION, cutoff: GAMES_REMOTE_STATS_RESET_CUTOFF_MS, accounts: Object.keys(next.accounts || {}).length, at: Date.now() };
    return true;
  } catch (err) {
    console.warn('gamesEnsureScoreResetV912 failed', err);
    return false;
  }
}

function gamesNormalizeStoredAccount(account, fallbackName) {
  const id = String(account && account.id || '').trim();
  const name = String(account && account.name || fallbackName || id).trim() || id;
  const incoming = account && account.stats && typeof account.stats === 'object' ? account.stats : {};
  const stats = gamesEmptyStats();
  const ttt = incoming.ttt && typeof incoming.ttt === 'object' ? incoming.ttt : {};
  const g2048 = incoming.g2048 && typeof incoming.g2048 === 'object' ? incoming.g2048 : {};
  const snake = incoming.snake && typeof incoming.snake === 'object' ? incoming.snake : {};
  const flap = incoming.flap && typeof incoming.flap === 'object' ? incoming.flap : {};
  const arcade = incoming.arcade && typeof incoming.arcade === 'object' ? incoming.arcade : {};
  stats.ttt.plays = Number(ttt.plays || 0) || 0;
  stats.ttt.wins = Number(ttt.wins || 0) || 0;
  stats.ttt.losses = Number(ttt.losses || 0) || 0;
  stats.ttt.draws = Number(ttt.draws || 0) || 0;
  stats.ttt.bestMoves = typeof ttt.bestMoves === 'undefined' ? null : ttt.bestMoves;
  stats.ttt.bestTimeMs = typeof ttt.bestTimeMs === 'undefined' ? null : ttt.bestTimeMs;
  stats.ttt.lastPlayedAt = Number(ttt.lastPlayedAt || 0) || 0;
  stats.g2048.plays = Number(g2048.plays || 0) || 0;
  stats.g2048.bestScore = Number(g2048.bestScore || 0) || 0;
  stats.g2048.bestTile = Number(g2048.bestTile || 0) || 0;
  stats.g2048.lastPlayedAt = Number(g2048.lastPlayedAt || 0) || 0;
  stats.snake.plays = Number(snake.plays || 0) || 0;
  stats.snake.bestScore = Number(snake.bestScore || 0) || 0;
  stats.snake.bestLength = Number(snake.bestLength || 0) || 0;
  stats.snake.lastPlayedAt = Number(snake.lastPlayedAt || 0) || 0;
  stats.flap.plays = Number(flap.plays || 0) || 0;
  stats.flap.bestScore = Number(flap.bestScore || 0) || 0;
  stats.flap.bestPipes = Number(flap.bestPipes || 0) || 0;
  stats.flap.lastPlayedAt = Number(flap.lastPlayedAt || 0) || 0;
  stats.arcade = arcade;
  const rawUiSettings = account && account.uiSettings && typeof account.uiSettings === 'object' ? account.uiSettings : {};
  const themeId = String(rawUiSettings.themeId || rawUiSettings.theme || account && (account.themeId || account.uiTheme) || '').trim();
  const backgroundId = String(rawUiSettings.backgroundId || rawUiSettings.background || account && (account.backgroundId || account.uiBackground) || '').trim();
  const uiSettings = {
    themeId,
    backgroundId,
    updatedAt: Number(rawUiSettings.updatedAt || rawUiSettings.uiUpdatedAt || account && account.uiUpdatedAt || 0) || 0
  };
  return {
    id,
    name,
    stats,
    achievements: Array.isArray(account && account.achievements) ? account.achievements.slice(0, 20) : [],
    uiSettings,
    updatedAt: Number(account && account.updatedAt || 0) || 0
  };
}

function gamesLoadProfile() {
  try {
    gamesEnsureScoreResetV912();
    const parsed = typeof parseLocalStorageJsonCached === 'function'
      ? parseLocalStorageJsonCached(GAMES_PROFILE_KEY, null)
      : JSON.parse(localStorage.getItem(GAMES_PROFILE_KEY) || 'null');
    if (!parsed || typeof parsed !== 'object') return gamesDefaultProfile();
    const base = gamesDefaultProfile();
    const srcAccounts = parsed.accounts && typeof parsed.accounts === 'object' ? parsed.accounts : {};
    const storedVersion = Number(parsed.profileVersion || parsed.schemaVersion || parsed.dataVersion || 0) || 0;
    const shouldResetStats = storedVersion < GAMES_PROFILE_RESET_VERSION;

    Object.keys(srcAccounts).forEach((id) => {
      const accountId = String(id || '').trim();
      if (!accountId || GAMES_ACCOUNT_BLOCKLIST.has(accountId)) return;
      const incoming = srcAccounts[accountId] || {};
      let next = shouldResetStats
        ? gamesMakeAccountEntry(accountId, incoming.name || accountId)
        : gamesNormalizeStoredAccount({ id: accountId, name: incoming.name || accountId, stats: incoming.stats, achievements: incoming.achievements, uiSettings: incoming.uiSettings, themeId: incoming.themeId, uiTheme: incoming.uiTheme, backgroundId: incoming.backgroundId, uiBackground: incoming.uiBackground, updatedAt: incoming.updatedAt }, incoming.name || accountId);
      if (shouldResetStats && incoming && typeof incoming === 'object') {
        const preserved = gamesNormalizeStoredAccount({ id: accountId, name: incoming.name || accountId, stats: {}, achievements: [], uiSettings: incoming.uiSettings, themeId: incoming.themeId, uiTheme: incoming.uiTheme, backgroundId: incoming.backgroundId, uiBackground: incoming.uiBackground, updatedAt: 0 }, incoming.name || accountId);
        next.uiSettings = preserved.uiSettings || next.uiSettings;
      }
      base.accounts[accountId] = next;
    });

    base.activeAccountId = String(parsed.activeAccountId || '').trim();
    if (!base.activeAccountId || !base.accounts[base.activeAccountId] || GAMES_ACCOUNT_BLOCKLIST.has(base.activeAccountId)) base.activeAccountId = '';
    if (shouldResetStats) {
      base.profileVersion = GAMES_PROFILE_RESET_VERSION;
      gamesSaveProfile(base);
    } else {
      base.profileVersion = GAMES_PROFILE_RESET_VERSION;
    }
    return base;
  } catch (err) {
    console.warn('gamesLoadProfile failed', err);
    return gamesDefaultProfile();
  }
}

function gamesSaveProfile(profile) {
  try {
    const payload = JSON.stringify(profile);
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(GAMES_PROFILE_KEY, payload);
    else localStorage.setItem(GAMES_PROFILE_KEY, payload);
  } catch (err) {
    console.warn('gamesSaveProfile failed', err);
  }
}

function gamesGetProfile() {
  if (!app.gamesProfile) {
    app.gamesProfile = gamesLoadProfile();
  }
  return app.gamesProfile;
}

function gamesGetActiveAccount() {
  const profile = gamesGetProfile();
  return profile.accounts[profile.activeAccountId] || null;
}

function gamesParseRemoteTimestamp(value) {
  return gamesParseStatTimestamp(value);
}

function gamesGetRemoteProfileStatIds() {
  // v.1.5 (809): profil hráče se doplňuje ze všech veřejných Top score typů, ne jen z Piškvorek.
  // Variants necháváme jako samostatné arcade statistiky, aby se nemíchalo Pexeso/Sudoku podle obtížnosti.
  return [
    'ttt', '2048', 'snake', 'flap',
    'aim', 'reaction', 'tetris', 'shooter', 'brick', 'doodle', 'bubble',
    'sudoku', 'sudoku_easy', 'sudoku_medium', 'sudoku_hard',
    'mines', 'memory', 'memory_4x4', 'memory_6x6', 'memory_8x8',
    'bomber', 'pampuch', 'ships', 'daily'
  ];
}

function gamesApplyRemoteProfileStat(profile, row) {
  if (!profile || !row) return false;
  if (!gamesIsRemoteStatAfterReset(row)) return false;
  const remoteUpdated = gamesParseRemoteTimestamp(row.last_played_at || row.lastPlayedAt || row.updated_at || row.updatedAt || row.created_at);
  const accountId = String((row.account_number || row.accountNumber || row.id || '')).trim();
  if (!accountId || GAMES_ACCOUNT_BLOCKLIST.has(accountId)) return false;
  const gameType = String((row.game_type || row.gameType || '')).trim();
  if (!gameType || gameType === '__profile_ui') return false;
  const remoteName = String((row.player_name || row.full_name || row.name || accountId)).trim() || accountId;
  let changed = false;
  if (!profile.accounts[accountId]) {
    profile.accounts[accountId] = gamesMakeAccountEntry(accountId, remoteName);
    changed = true;
  } else if (remoteName && (!profile.accounts[accountId].name || profile.accounts[accountId].name === accountId)) {
    profile.accounts[accountId].name = remoteName;
    changed = true;
  }
  const acc = profile.accounts[accountId];
  if (!acc.stats || typeof acc.stats !== 'object') acc.stats = gamesEmptyStats();
  if (!acc.stats.arcade || typeof acc.stats.arcade !== 'object') acc.stats.arcade = {};
  const plays = Number(row.games_played ?? row.plays ?? 0) || 0;
  const wins = Number(row.wins || 0) || 0;
  const losses = Number(row.losses || 0) || 0;
  const draws = Number(row.draws || 0) || 0;
  const points = Number(row.points ?? row.best_score ?? row.bestScore ?? row.value ?? 0) || 0;
  const lastTs = gamesParseRemoteTimestamp(row.last_played_at || row.lastPlayedAt || row.updated_at || row.updatedAt);

  const mergeGeneric = (current) => Object.assign({}, current || {}, {
    plays: Math.max(Number(current && current.plays || 0) || 0, plays),
    wins: Math.max(Number(current && current.wins || 0) || 0, wins),
    losses: Math.max(Number(current && current.losses || 0) || 0, losses),
    draws: Math.max(Number(current && current.draws || 0) || 0, draws),
    bestScore: Math.max(Number(current && current.bestScore || 0) || 0, points),
    leaderboardValue: Math.max(Number(current && current.leaderboardValue || 0) || 0, points),
    lastPlayedAt: Math.max(Number(current && current.lastPlayedAt || 0) || 0, lastTs || 0)
  });

  if (gameType === 'ttt') {
    const current = acc.stats.ttt && typeof acc.stats.ttt === 'object' ? acc.stats.ttt : {};
    const nextTtt = Object.assign({}, current, {
      plays: Math.max(Number(current.plays || 0) || 0, plays || points),
      wins: Math.max(Number(current.wins || 0) || 0, wins),
      losses: Math.max(Number(current.losses || 0) || 0, losses),
      draws: Math.max(Number(current.draws || 0) || 0, draws),
      lastPlayedAt: Math.max(Number(current.lastPlayedAt || 0) || 0, lastTs || 0)
    });
    if (JSON.stringify(current) !== JSON.stringify(nextTtt)) { acc.stats.ttt = nextTtt; changed = true; }
  } else if (gameType === '2048') {
    const current = acc.stats.g2048 && typeof acc.stats.g2048 === 'object' ? acc.stats.g2048 : {};
    const next = Object.assign({}, current, {
      plays: Math.max(Number(current.plays || 0) || 0, plays),
      bestScore: Math.max(Number(current.bestScore || 0) || 0, points),
      lastPlayedAt: Math.max(Number(current.lastPlayedAt || 0) || 0, lastTs || 0)
    });
    if (JSON.stringify(current) !== JSON.stringify(next)) { acc.stats.g2048 = next; changed = true; }
  } else if (gameType === 'snake') {
    const current = acc.stats.snake && typeof acc.stats.snake === 'object' ? acc.stats.snake : {};
    const next = Object.assign({}, current, {
      plays: Math.max(Number(current.plays || 0) || 0, plays),
      bestScore: Math.max(Number(current.bestScore || 0) || 0, points),
      lastPlayedAt: Math.max(Number(current.lastPlayedAt || 0) || 0, lastTs || 0)
    });
    if (JSON.stringify(current) !== JSON.stringify(next)) { acc.stats.snake = next; changed = true; }
  } else if (gameType === 'flap') {
    const current = acc.stats.flap && typeof acc.stats.flap === 'object' ? acc.stats.flap : {};
    const next = Object.assign({}, current, {
      plays: Math.max(Number(current.plays || 0) || 0, plays),
      bestScore: Math.max(Number(current.bestScore || 0) || 0, points),
      bestPipes: Math.max(Number(current.bestPipes || 0) || 0, points),
      lastPlayedAt: Math.max(Number(current.lastPlayedAt || 0) || 0, lastTs || 0)
    });
    if (JSON.stringify(current) !== JSON.stringify(next)) { acc.stats.flap = next; changed = true; }
  } else {
    const current = acc.stats.arcade[gameType] && typeof acc.stats.arcade[gameType] === 'object' ? acc.stats.arcade[gameType] : {};
    const next = mergeGeneric(current);
    if (JSON.stringify(current) !== JSON.stringify(next)) { acc.stats.arcade[gameType] = next; changed = true; }
  }

  if (changed) acc.updatedAt = Math.max(Number(acc.updatedAt || 0) || 0, lastTs || Date.now());
  return changed;
}

async function gamesSyncProfileFromRemote(force = false) {
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.loadGameAccounts !== 'function') return null;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;

  try {
    const profile = gamesGetProfile();
    const remoteAccounts = await bridge.loadGameAccounts().catch(() => []);
    const remoteStatsRows = typeof bridge.loadGameStats === 'function'
      ? (await Promise.all(gamesGetRemoteProfileStatIds().map((id) => {
          const limit = id === 'ttt' ? 100 : 20;
          return bridge.loadGameStats(id, limit, { force: !!force }).catch(() => []);
        }))).flat()
      : [];
    let changed = false;

    (Array.isArray(remoteAccounts) ? remoteAccounts : []).forEach((row) => {
      const accountId = String(row && row.account_number ? row.account_number : '').trim();
      if (!accountId || GAMES_ACCOUNT_BLOCKLIST.has(accountId)) return;
      const remoteName = String(row && (row.full_name || row.player_name || row.name || row.account_name || row.nickname || row.username || row.account_number)
        ? (row.full_name || row.player_name || row.name || row.account_name || row.nickname || row.username || row.account_number)
        : accountId).trim() || accountId;
      if (!profile.accounts[accountId]) {
        profile.accounts[accountId] = gamesMakeAccountEntry(accountId, remoteName);
        changed = true;
      } else if (remoteName && remoteName !== profile.accounts[accountId].name) {
        profile.accounts[accountId].name = remoteName;
        changed = true;
      }
      const remoteThemeId = String(row && (row.ui_theme || row.theme_id || row.themeId || row.theme) || '').trim();
      const remoteBackgroundId = String(row && (row.ui_background || row.background_id || row.backgroundId || row.background) || '').trim();
      if (remoteThemeId || remoteBackgroundId) {
        const account = profile.accounts[accountId];
        account.uiSettings = account.uiSettings && typeof account.uiSettings === 'object' ? account.uiSettings : {};
        if (remoteThemeId && account.uiSettings.themeId !== remoteThemeId) { account.uiSettings.themeId = remoteThemeId; changed = true; }
        if (remoteBackgroundId && account.uiSettings.backgroundId !== remoteBackgroundId) { account.uiSettings.backgroundId = remoteBackgroundId; changed = true; }
        account.uiSettings.updatedAt = Date.now();
      }
    });

    (Array.isArray(remoteStatsRows) ? remoteStatsRows : []).forEach((row) => {
      if (gamesApplyRemoteProfileStat(profile, row)) changed = true;
    });

    Object.keys(profile.accounts || {}).forEach((id) => {
      const accountId = String(id || '').trim();
      if (!accountId || GAMES_ACCOUNT_BLOCKLIST.has(accountId)) return;
      const acc = profile.accounts[accountId];
      if (!acc) return;
      if (!acc.stats || typeof acc.stats !== 'object') acc.stats = gamesEmptyStats();
      if (!acc.stats.ttt) acc.stats.ttt = gamesEmptyStats().ttt;
      if (!acc.stats.g2048) acc.stats.g2048 = gamesEmptyStats().g2048;
      if (!acc.stats.snake) acc.stats.snake = gamesEmptyStats().snake;
      if (!acc.stats.flap) acc.stats.flap = gamesEmptyStats().flap;
      if (!acc.stats.arcade || typeof acc.stats.arcade !== 'object') acc.stats.arcade = {};
      if (!Array.isArray(acc.achievements)) acc.achievements = [];
      acc.achievements = acc.achievements.slice(0, 20);
    });

    if (changed) {
      profile.profileVersion = GAMES_PROFILE_RESET_VERSION;
      gamesSaveProfile(profile);
      app.gamesProfile = profile;
      if (typeof renderGamesProfileStatus === 'function') renderGamesProfileStatus();
      gamesRenderProfiles();
      gamesRenderAchievements();
      gamesRenderStats();
      if (typeof renderThemeSettingsCards === 'function') renderThemeSettingsCards();
      if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
    }
    return profile;
  } catch (err) {
    console.warn('gamesSyncProfileFromRemote failed', err);
    return null;
  }
}

function gamesAccountById(accountId) {
  const id = String(accountId || '').trim();
  if (!id || GAMES_ACCOUNT_BLOCKLIST.has(id)) return null;
  const profile = gamesGetProfile();
  return (profile.accounts && profile.accounts[id]) || GAMES_ACCOUNT_LIST.find(acc => acc.id === id) || null;
}

function gamesApplyActiveAccountUI(account) {
  const cardEl = document.getElementById('gamesAccountCard');
  const topEl = document.getElementById('gamesAccountTop') || (cardEl ? cardEl.querySelector('.gamesAccountTop') : null);
  const nameEl = document.getElementById('gamesAccountName');
  const hintEl = document.getElementById('gamesAccountHint');
  const inputEl = document.getElementById('gamesAccountInput');
  const entryRow = document.getElementById('gamesAccountEntryRow');
  const currentEl = document.getElementById('gamesAccountCurrent');
  const clearBtn = document.getElementById('gamesAccountClearBtn');
  if (!inputEl || !entryRow || !clearBtn) return;

  const next = account || null;
  if (cardEl) {
    cardEl.classList.toggle('isLoggedIn', !!next);
    cardEl.style.display = '';
  }
  if (topEl) topEl.style.display = next ? 'flex' : 'none';
  if (nameEl) {
    if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(nameEl, next ? next.name : '', 'gamesAccountName');
    else nameEl.textContent = next ? next.name : '';
  }
  entryRow.style.display = next ? 'none' : 'flex';
  if (hintEl) {
    hintEl.textContent = '';
    hintEl.style.display = 'none';
    hintEl.hidden = true;
  }
  if (currentEl) {
    currentEl.textContent = '';
    currentEl.style.display = 'none';
    currentEl.hidden = true;
  }
  inputEl.value = next ? '' : inputEl.value;
  inputEl.disabled = !!next;
  inputEl.placeholder = 'Zadej poslední 4 číslice os.č.';
  if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(clearBtn, 'Odhlásit', 'gamesAccountClearBtn');
  else clearBtn.textContent = 'Odhlásit';
  clearBtn.style.minWidth = '46px';
  clearBtn.style.paddingInline = '8px';
  if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
}

function gamesRenderActiveAccountBar(account) {
  const bar = document.getElementById('gamesActiveAccountBar');
  const textEl = document.getElementById('gamesActiveAccountText');
  const clearBtn = document.getElementById('gamesActiveAccountClearBtn');
  if (bar) {
    bar.hidden = true;
    bar.classList.remove('isVisible');
  }
  if (textEl) {
    if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(textEl, '', 'gamesActiveAccountText');
    else textEl.textContent = '';
  }
  if (clearBtn && !clearBtn.dataset.bound) {
    clearBtn.dataset.bound = '1';
    clearBtn.addEventListener('click', () => {
      gamesClearActiveAccount();
      renderGamesHub();
    });
  }
  if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
}

function gamesSetActiveAccount(accountId) {
  const profile = gamesGetProfile();
  const id = String(accountId || '').trim();
  if (!id || GAMES_ACCOUNT_BLOCKLIST.has(id)) return false;
  const knownAccount = gamesAccountById(id);
  if (!profile.accounts[id]) {
    profile.accounts[id] = gamesMakeAccountEntry(id, knownAccount && knownAccount.name ? knownAccount.name : id);
  } else if (knownAccount && knownAccount.name) {
    const currentName = String(profile.accounts[id].name || '').trim();
    const knownName = String(knownAccount.name || '').trim();
    if (knownName && (currentName === id || currentName === ('Hráč ' + id) || /^\d{1,8}$/.test(currentName))) profile.accounts[id].name = knownName;
  }
  profile.activeAccountId = id;
  profile.profileVersion = GAMES_PROFILE_RESET_VERSION;
  gamesSaveProfile(profile);
  app.gamesProfile = profile;
  const active = profile.accounts[profile.activeAccountId] || null;
  if (typeof applyProfileUiPreferencesForActiveAccount === 'function') applyProfileUiPreferencesForActiveAccount({ loadRemote: true, source: 'login' });
  gamesApplyActiveAccountUI(active);
  if (typeof renderGamesProfileStatus === 'function') renderGamesProfileStatus();
  gamesRenderStats();
  renderGamesHub();
  if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
  return true;
}

function gamesClearActiveAccount() {
  const profile = gamesGetProfile();
  profile.activeAccountId = '';
  profile.profileVersion = GAMES_PROFILE_RESET_VERSION;
  gamesSaveProfile(profile);
  app.gamesProfile = profile;
  try {
    if (typeof applyThemePreference === 'function') applyThemePreference(getThemePreference(), false);
    if (typeof applyBackgroundPreference === 'function') applyBackgroundPreference(getBackgroundPreference(), false);
  } catch (err) {}
  gamesApplyActiveAccountUI(null);
  if (typeof renderGamesProfileStatus === 'function') renderGamesProfileStatus();
  gamesRenderStats();
  renderGamesHub();
  if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
}

function gamesStatLine(label, value) {
  return '<div class="gamesStatCard"><div class="gamesStatLabel">' + escapeHtml(label) + '</div><div class="gamesStatValue">' + escapeHtml(String(value)) + '</div></div>';
}

function gamesFormatTimeLabel(value) {
  const ms = Number(value);
  if (!Number.isFinite(ms) || ms <= 0) return '';
  try {
    return new Intl.DateTimeFormat('cs-CZ', {
      timeZone: 'Europe/Prague',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(ms));
  } catch (err) {
    const d = new Date(ms);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return hh + ':' + mm;
  }
}

function gamesFormatPlayedLabel(value) {
  const ms = gamesParseStatTimestamp(value);
  if (!Number.isFinite(ms) || ms <= 0) return '';
  try {
    return new Intl.DateTimeFormat('cs-CZ', {
      timeZone: 'Europe/Prague',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(ms));
  } catch (err) {
    const d = new Date(ms);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear());
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}.${mm}.${yy} ${hh}:${mi}`;
  }
}

function gamesRenderAccountChips() {
  const hintEl = document.getElementById('gamesAccountHint');
  const inputEl = document.getElementById('gamesAccountInput');
  const entryRow = document.getElementById('gamesAccountEntryRow');
  const confirmBtn = document.getElementById('gamesAccountConfirmBtn');
  const clearBtn = document.getElementById('gamesAccountClearBtn');
  if (!inputEl || !entryRow || !confirmBtn || !clearBtn) return;

  const profile = gamesGetProfile();
  const active = profile.accounts[profile.activeAccountId] || null;
  const hasAccount = !!active;

  gamesApplyActiveAccountUI(active);
  inputEl.value = hasAccount ? '' : inputEl.value;

  const setLoginFeedback = (message) => {
    const text = String(message || '').trim();
    if (hintEl) {
      hintEl.textContent = '';
      hintEl.style.display = 'none';
      hintEl.hidden = true;
    }
    if (text) inputEl.placeholder = text;
  };

  const syncVisibleAccount = (account) => {
    gamesApplyActiveAccountUI(account || null);
  };

  if (!inputEl.dataset.bound) {
    inputEl.dataset.bound = '1';
    const submit = async () => {
      const currentProfile = gamesGetProfile();
      if (currentProfile && currentProfile.activeAccountId) {
        setLoginFeedback('Nejdřív se odhlas');
        return;
      }
      const typed = String(inputEl.value || '').trim();
      if (!typed) {
        syncVisibleAccount(null);
        setLoginFeedback('Zadej poslední 4 číslice os.č.');
        inputEl.focus();
        return;
      }
      if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadGameAccounts === 'function') {
        await gamesSyncProfileFromRemote(true);
      }
      const found = gamesAccountById(typed);
      if (!found) {
        setLoginFeedback('Uživatel nenalezen');
        inputEl.focus();
        inputEl.select();
        return;
      }
      try {
        gamesSetActiveAccount(found.id);
      } catch (err) {
        console.warn('games account save failed', err);
      }
      syncVisibleAccount(found);
      gamesApplyActiveAccountUI(found);
      if (typeof renderGamesProfileStatus === 'function') renderGamesProfileStatus();
      gamesRenderProfiles();
      gamesRenderAchievements();
      gamesRenderStats();
      if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
      requestAnimationFrame(() => {
        gamesRenderAccountChips();
        if (typeof renderGamesProfileStatus === 'function') renderGamesProfileStatus();
        gamesRenderProfiles();
        gamesRenderAchievements();
        gamesRenderStats();
        if (typeof renderThemeSettingsCards === 'function') renderThemeSettingsCards();
        if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
      });
      return;
    };
    inputEl.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') { ev.preventDefault(); void submit(); }
    });
    confirmBtn.addEventListener('click', () => { void submit(); });
    clearBtn.addEventListener('click', () => {
      inputEl.value = '';
      gamesClearActiveAccount();
      syncVisibleAccount(null);
      if (typeof renderGamesProfileStatus === 'function') renderGamesProfileStatus();
      setLoginFeedback('Zadej poslední 4 číslice os.č.');
      if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
    });
  }
}

function gamesGetTotals(acc) {
  const stats = acc && acc.stats ? acc.stats : {};
  const ttt = stats.ttt || {};
  const g2048 = stats.g2048 || {};
  const snake = stats.snake || {};
  const flap = stats.flap || {};
  const arcade = stats.arcade && typeof stats.arcade === 'object' ? stats.arcade : {};
  const arcadeEntries = Object.values(arcade);
  const totalPlays = (Number(ttt.plays || 0) || 0) + (Number(g2048.plays || 0) || 0) + (Number(snake.plays || 0) || 0) + (Number(flap.plays || 0) || 0) + arcadeEntries.reduce((sum, entry) => sum + (Number(entry && entry.plays || 0) || 0), 0);
  return {
    stats,
    ttt,
    g2048,
    snake,
    flap,
    arcade,
    totalPlays,
    bestScore: Math.max(
      Number(g2048.bestScore || 0) || 0,
      Number(snake.bestScore || 0) || 0,
      Number(flap.bestScore || 0) || 0,
      ...arcadeEntries.map(entry => Number(entry && entry.bestScore || 0) || 0)
    )
  };
}

const GAMES_PROFILE_GAME_DEFS = [
  { id: 'ttt', title: 'Piškvorky', unit: 'her' },
  { id: '2048', title: '2048', unit: 'bodů' },
  { id: 'snake', title: 'Snake', unit: 'bodů' },
  { id: 'flap', title: 'Flappy Car', unit: 'bodů' },
  { id: 'aim', title: 'Aim Trainer', unit: 'bodů' },
  { id: 'reaction', title: 'Reaction Test', unit: 'ms' },
  { id: 'tetris', title: 'Tetris', unit: 'bodů' },
  { id: 'shooter', title: 'Space Shooter', unit: 'bodů' },
  { id: 'brick', title: 'Brick Breaker', unit: 'bodů' },
  { id: 'doodle', title: 'Doodle Jump', unit: 'bodů' },
  { id: 'bubble', title: 'Bubble Shooter', unit: 'bodů' },
  { id: 'sudoku', title: 'Sudoku', unit: 's' },
  { id: 'mines', title: 'Minesweeper', unit: 'bodů' },
  { id: 'memory', title: 'Memory / Pexeso', unit: 's' },
  { id: 'bomber', title: 'Bomberman mini', unit: 'bodů' },
  { id: 'pampuch', title: 'Pampuch', unit: 'bodů' },
  { id: 'ships', title: 'Lodě', unit: 'bodů' },
  { id: 'daily', title: 'Denní challenge', unit: 'bodů' }
];

function gamesMergeRemoteLeaderboardRowIntoAccount(account, gameId, row) {
  const id = String(gameId || '').trim();
  if (!account || !id || id === '__profile_ui') return account;
  account.stats = account.stats && typeof account.stats === 'object' ? account.stats : {};
  const updated = gamesParseRemoteTimestamp(row && (row.last_played_at || row.lastPlayedAt || row.updated_at || row.updatedAt));
  const value = Number(row && (row.value ?? row.points ?? row.bestScore ?? row.best_score ?? row.games_played) || 0) || 0;
  const gamesPlayed = Number(row && (row.games_played ?? row.plays) || 0) || 0;
  const wins = Number(row && row.wins || 0) || 0;
  const losses = Number(row && row.losses || 0) || 0;
  const draws = Number(row && row.draws || 0) || 0;
  const target = id === '2048' ? 'g2048' : id;
  if (target === 'ttt') {
    const local = account.stats.ttt && typeof account.stats.ttt === 'object' ? account.stats.ttt : {};
    account.stats.ttt = Object.assign({}, local, {
      plays: Math.max(Number(local.plays || 0) || 0, gamesPlayed || value || 0),
      wins: Math.max(Number(local.wins || 0) || 0, wins),
      losses: Math.max(Number(local.losses || 0) || 0, losses),
      draws: Math.max(Number(local.draws || 0) || 0, draws),
      lastPlayedAt: Math.max(Number(local.lastPlayedAt || 0) || 0, updated || 0)
    });
  } else if (target === 'g2048' || target === 'snake' || target === 'flap') {
    const local = account.stats[target] && typeof account.stats[target] === 'object' ? account.stats[target] : {};
    account.stats[target] = Object.assign({}, local, {
      plays: Math.max(Number(local.plays || 0) || 0, gamesPlayed || (value > 0 ? 1 : 0)),
      bestScore: Math.max(Number(local.bestScore || 0) || 0, value),
      points: Math.max(Number(local.points || 0) || 0, value),
      lastPlayedAt: Math.max(Number(local.lastPlayedAt || 0) || 0, updated || 0)
    });
  } else {
    account.stats.arcade = account.stats.arcade && typeof account.stats.arcade === 'object' ? account.stats.arcade : {};
    const local = account.stats.arcade[id] && typeof account.stats.arcade[id] === 'object' ? account.stats.arcade[id] : {};
    const lowBetter = typeof isLowBetter === 'function' && isLowBetter(id);
    const merged = Object.assign({}, local, {
      plays: Math.max(Number(local.plays || 0) || 0, gamesPlayed || (value > 0 ? 1 : 0)),
      points: Math.max(Number(local.points || 0) || 0, value),
      leaderboardValue: Math.max(Number(local.leaderboardValue || 0) || 0, value),
      lastPlayedAt: Math.max(Number(local.lastPlayedAt || 0) || 0, updated || 0)
    });
    if (lowBetter) {
      const oldTime = Number(local.bestTimeMs || 0) || 0;
      merged.bestTimeMs = oldTime && value ? Math.min(oldTime, value) : (oldTime || value || 0);
    } else {
      merged.bestScore = Math.max(Number(local.bestScore || 0) || 0, value);
    }
    account.stats.arcade[id] = merged;
  }
  if (updated) account.updatedAt = Math.max(Number(account.updatedAt || 0) || 0, updated);
  return account;
}

function gamesBuildProfilesWithRemoteRows(profile) {
  const base = Object.values(profile && profile.accounts || {}).filter(acc => !GAMES_ACCOUNT_BLOCKLIST.has(String(acc && acc.id || '').trim()));
  const byId = new Map(base.map(acc => [String(acc && acc.id || '').trim(), acc]));
  const cache = app.gamesLeaderboardCache && typeof app.gamesLeaderboardCache === 'object' ? app.gamesLeaderboardCache : {};
  Object.keys(cache).forEach((gameId) => {
    if (!gameId || gameId === '__profile_ui') return;
    const rows = Array.isArray(cache[gameId]) ? cache[gameId] : [];
    rows.forEach((row) => {
      if (!gamesIsRemoteStatAfterReset(row)) return;
      const remoteUpdated = gamesParseRemoteTimestamp(row && (row.last_played_at || row.lastPlayedAt || row.updated_at || row.created_at || row.updatedAt));
      const id = String(row && (row.id || row.account_number || row.accountNumber) ? (row.id || row.account_number || row.accountNumber) : '').trim();
      if (!id || GAMES_ACCOUNT_BLOCKLIST.has(id)) return;
      const value = Number(row && (row.value ?? row.games_played ?? row.points) || 0) || 0;
      if (value <= 0) return;
      const remoteName = String(row && (row.name || row.player_name || row.full_name) ? (row.name || row.player_name || row.full_name) : ('Hráč ' + id)).trim();
      let account = byId.get(id);
      if (!account) {
        account = gamesNormalizeStoredAccount({
          id,
          name: remoteName,
          stats: {},
          updatedAt: remoteUpdated || Date.now()
        }, remoteName);
      }
      if (!account.name && remoteName) account.name = remoteName;
      account = gamesMergeRemoteLeaderboardRowIntoAccount(account, gameId, row);
      byId.set(id, account);
    });
  });
  return Array.from(byId.values());
}

function gamesRenderProfiles() {
  const grid = document.getElementById('gamesProfilesGrid');
  if (!grid) return;
  const profile = gamesGetProfile();
  const activeId = profile.activeAccountId;
  const accounts = gamesBuildProfilesWithRemoteRows(profile).sort((a, b) => {
    const aActive = String(a && a.id || '') === String(activeId || '');
    const bActive = String(b && b.id || '') === String(activeId || '');
    if (aActive !== bActive) return aActive ? -1 : 1;
    const ai = Number(a && a.id ? a.id : 0) || 0;
    const bi = Number(b && b.id ? b.id : 0) || 0;
    return ai - bi;
  });

  if (!accounts.length) {
    grid.innerHTML = '<div class="smallText">Zatím nejsou žádné profily.</div>';
    return;
  }

  grid.innerHTML = accounts.map((acc) => {
    const total = gamesGetTotals(acc);
    const last = acc.updatedAt ? gamesFormatPlayedLabel(acc.updatedAt) : 'Ještě bez hry';
    const profileRows = GAMES_PROFILE_GAME_DEFS.map((game) => {
      const stats = acc && acc.stats ? acc.stats : {};
      const gameStats = stats[game.id] && typeof stats[game.id] === 'object'
        ? stats[game.id]
        : (stats.arcade && typeof stats.arcade[game.id] === 'object' ? stats.arcade[game.id] : null);
      let value = 0;
      if (game.id === 'ttt') value = Number(total.ttt.plays || 0) || 0;
      else if (game.id === '2048') value = Number(total.g2048.bestScore || 0) || 0;
      else if (game.id === 'snake') value = Number(total.snake.bestScore || 0) || 0;
      else if (game.id === 'flap') value = Number(total.flap.bestScore || 0) || 0;
      else if (gameStats) value = Number(gameStats.bestScore || gameStats.plays || gameStats.bestTimeMs || 0) || 0;
      const display = game.id === 'ttt'
        ? (String(value) + '× · V ' + String(Number((gameStats && gameStats.wins) || total.ttt.wins || 0) || 0) + ' / P ' + String(Number((gameStats && gameStats.losses) || total.ttt.losses || 0) || 0) + ' / R ' + String(Number((gameStats && gameStats.draws) || total.ttt.draws || 0) || 0))
        : (game.id === 'reaction' ? (value ? (String(value) + ' ms') : '—') : (String(value) + ' ' + game.unit));
      return '<div class="gamesProfileRow"><strong>' + escapeHtml(game.title) + '</strong><span>' + escapeHtml(display) + '</span></div>';
    }).join('');
    const isActive = String(acc.id) === String(activeId);
    return [
      '<details class="gamesStatsCard' + (isActive ? ' isActive' : '') + '"' + (isActive ? ' open' : '') + '>',
      '  <summary class="gamesStatsCardSummary">',
      '    <div class="gamesStatsCardHead">',
      '      <div>',
      '        <div class="gamesStatsCardName">' + escapeHtml(acc.name || ('Hráč ' + String(acc.id || ''))) + '</div>',
      '        <div class="gamesStatsCardId">' + escapeHtml(acc.id || '') + '</div>',
      '      </div>',
      '      <div class="gamesStatsCardTotal">' + String(total.totalPlays) + ' her</div>',
      '    </div>',
      '  </summary>',
      '  <div class="gamesStatsCardBody">',
      profileRows,
      '    <div class="gamesStatsCardMeta">' + escapeHtml(last) + '</div>',
      '  </div>',
      '</details>'
    ].join('');
  }).join('');
}

const GAMES_ACHIEVEMENT_DEFS = [
  { id: 'start', title: 'První zápis', desc: 'Odehraj první započítanou hru', goalText: '1 hra', progress: (a) => a.totalPlays, target: 1 },
  { id: 'ten', title: 'Rozjezd', desc: 'Odehraj 10 započítaných her', goalText: '10 her', progress: (a) => a.totalPlays, target: 10 },
  { id: 'thirty', title: 'Držák', desc: 'Odehraj 30 započítaných her', goalText: '30 her', progress: (a) => a.totalPlays, target: 30 },
  { id: 'sixty', title: 'Mazák', desc: 'Odehraj 60 započítaných her', goalText: '60 her', progress: (a) => a.totalPlays, target: 60 },
  { id: 'hundred', title: 'Veterán', desc: 'Odehraj 100 započítaných her', goalText: '100 her', progress: (a) => a.totalPlays, target: 100 },
  { id: 'ttt_10', title: 'Piškvorkář', desc: 'Odehraj 10 partií piškvorek', goalText: '10 partií', progress: (a) => a.ttt.plays || 0, target: 10 },
  { id: 'ttt_25', title: 'Taktik', desc: 'Odehraj 25 partií piškvorek', goalText: '25 partií', progress: (a) => a.ttt.plays || 0, target: 25 },
  { id: 'ttt_15_wins', title: 'Piškvorkový boss', desc: 'Vyhraj 15krát v piškvorkách', goalText: '15 výher', progress: (a) => a.ttt.wins || 0, target: 15 },
  { id: 'ttt_30_wins', title: 'Nepříjemný soupeř', desc: 'Vyhraj 30krát v piškvorkách', goalText: '30 výher', progress: (a) => a.ttt.wins || 0, target: 30 },
  { id: '2048_1000', title: '2048 start', desc: 'Dostaň se na 1000 bodů', goalText: '1000 bodů', progress: (a) => a.g2048.bestScore || 0, target: 1000 },
  { id: '2048_tile_512', title: '2048 tile', desc: 'Dostaň tile 512', goalText: 'tile 512', progress: (a) => a.g2048.bestTile || 0, target: 512 },
  { id: 'snake_25', title: 'Snake master', desc: 'Dostaň snake na délku 25', goalText: '25 bodů', progress: (a) => a.snake.bestScore || 0, target: 25 },
  { id: 'snake_45', title: 'Hadí legenda', desc: 'Dostaň snake na délku 45', goalText: '45 bodů', progress: (a) => a.snake.bestScore || 0, target: 45 },
  { id: 'flap_20', title: 'Flappy pilot', desc: 'Dej ve Flapu 20 bodů', goalText: '20 bodů', progress: (a) => a.flap.bestScore || 0, target: 20 },
  { id: 'flap_35', title: 'Letecký boss', desc: 'Dej ve Flapu 35 bodů', goalText: '35 bodů', progress: (a) => a.flap.bestScore || 0, target: 35 },
  { id: 'aim_500', title: 'Rychlá ruka', desc: 'Nahraj 500 bodů v Aim Traineru', goalText: '500 bodů', progress: (a) => Number((a.arcade && a.arcade.aim && a.arcade.aim.bestScore) || 0), target: 500 },
  { id: 'reaction_180', title: 'Blesk', desc: 'Zasaž reakci pod 180 ms', goalText: 'pod 180 ms', progress: (a) => Number((a.arcade && a.arcade.reaction && a.arcade.reaction.bestTimeMs) || 0) ? Math.max(0, 1000 - Number((a.arcade && a.arcade.reaction && a.arcade.reaction.bestTimeMs) || 0)) : 0, target: 820 },
  { id: 'tetris_1200', title: 'Tetris master', desc: 'Nasbírej 1200 bodů v Tetrisu', goalText: '1200 bodů', progress: (a) => Number((a.arcade && a.arcade.tetris && a.arcade.tetris.bestScore) || 0), target: 1200 },
  { id: 'shooter_1200', title: 'Space ace', desc: 'Nasbírej 1200 bodů ve Space Shooteru', goalText: '1200 bodů', progress: (a) => Number((a.arcade && a.arcade.shooter && a.arcade.shooter.bestScore) || 0), target: 1200 },
  { id: 'brick_1200', title: 'Brick breaker', desc: 'Nasbírej 1200 bodů v Brick Breakeru', goalText: '1200 bodů', progress: (a) => Number((a.arcade && a.arcade.brick && a.arcade.brick.bestScore) || 0), target: 1200 },
  { id: 'doodle_1200', title: 'Doodle jumper', desc: 'Nasbírej 1200 bodů v Doodle Jumpu', goalText: '1200 bodů', progress: (a) => Number((a.arcade && a.arcade.doodle && a.arcade.doodle.bestScore) || 0), target: 1200 },
  { id: 'bubble_600', title: 'Bubble pop', desc: 'Nasbírej 600 bodů v Bubble Shooteru', goalText: '600 bodů', progress: (a) => Number((a.arcade && a.arcade.bubble && a.arcade.bubble.bestScore) || 0), target: 600 },
  { id: 'sudoku_3', title: 'Sudoku solver', desc: 'Vyřeš 3 Sudoku', goalText: '3 dokončení', progress: (a) => Number((a.arcade && a.arcade.sudoku && a.arcade.sudoku.plays) || 0), target: 3 },
  { id: 'mines_25', title: 'Mines hunter', desc: 'Dej 25 bodů v Minesweeperu', goalText: '25 bodů', progress: (a) => Number((a.arcade && a.arcade.mines && a.arcade.mines.bestScore) || 0), target: 25 },
  { id: 'memory_25', title: 'Memory king', desc: 'Dostaň 25 bodů v Memory', goalText: '25 bodů', progress: (a) => Number((a.arcade && a.arcade.memory && a.arcade.memory.bestScore) || 0), target: 25 },
  { id: 'bomber_12', title: 'Bomber pilot', desc: 'Nasbírej 12 her v Bomberman mini', goalText: '12 her', progress: (a) => Number((a.arcade && a.arcade.bomber && a.arcade.bomber.plays) || 0), target: 12 },
  { id: 'bomber_kill_4', title: 'Lovec příšerek', desc: 'Znič v Bombermanovi všechny 4 příšerky v jedné hře', goalText: '4 příšerky', progress: (a) => Number((a.arcade && a.arcade.bomber && a.arcade.bomber.bestEnemiesKilled) || 0), target: 4 },
  { id: 'bomber_crates_30', title: 'Bourání beden', desc: 'Rozbij v Bombermanovi 30 beden v jedné hře', goalText: '30 beden', progress: (a) => Number((a.arcade && a.arcade.bomber && a.arcade.bomber.bestCrates) || 0), target: 30 },
  { id: 'bomber_power_6', title: 'Sběrač výbavy', desc: 'Seber v Bombermanovi 6 upgradů v jedné hře', goalText: '6 upgradů', progress: (a) => Number((a.arcade && a.arcade.bomber && a.arcade.bomber.bestPowerUps) || 0), target: 6 },
  { id: 'daily_5', title: 'Daily grinder', desc: 'Splň 5 denních challenge', goalText: '5 challenge', progress: (a) => Number((a.arcade && a.arcade.daily && a.arcade.daily.plays) || 0), target: 5 }
];


function gamesRenderAchievements() {
  const grid = document.getElementById('gamesAchievementsGrid');
  if (!grid) return;
  const account = gamesGetActiveAccount();
  if (!account) {
    grid.innerHTML = '<div class="smallText">Přihlas se a achievementy se začnou počítat.</div>';
    return;
  }

  const total = gamesGetTotals(account);
  const unlocked = GAMES_ACHIEVEMENT_DEFS.filter((def) => Number(def.progress(total) || 0) >= Number(def.target || 0)).length;

  grid.innerHTML = GAMES_ACHIEVEMENT_DEFS.map((def) => {
    const current = Number(def.progress(total) || 0);
    const target = Number(def.target || 1) || 1;
    const pct = Math.max(0, Math.min(100, Math.round((current / target) * 100)));
    const isUnlocked = current >= target;
    return [
      '<div class="gamesStatsCard' + (isUnlocked ? ' isActive' : '') + '">',
      '  <div class="gamesStatsCardHead">',
      '    <div>',
      '      <div class="gamesStatsCardName">' + escapeHtml(def.title) + '</div>',
      '      <div class="gamesStatsCardId">' + escapeHtml(def.id) + '</div>',
      '    </div>',
      '    <div class="gamesStatsCardTotal">' + String(Math.min(current, target)) + '/' + String(target) + '</div>',
      '  </div>',
      '  <div class="gamesStatsCardBody">',
      '    <div class="gamesStatsCardLine">' + escapeHtml(def.desc) + '</div>',
      '    <div class="gamesStatsCardLine">' + escapeHtml(def.goalText) + '</div>',
      '    <div class="gamesAchievementBar"><span style="--fill:' + String(pct) + '%"></span></div>',
      '  </div>',
      '</div>'
    ].join('');
  }).join('');
  const folder = document.querySelector('#games .gamesAchievementsFolder');
  if (folder) folder.dataset.unlocked = String(unlocked);
}

function gamesGetAchievementCount(account) {
  if (!account) return 0;
  const total = gamesGetTotals(account);
  return GAMES_ACHIEVEMENT_DEFS.filter((def) => Number(def.progress(total) || 0) >= Number(def.target || 0)).length;
}

function gamesRenderStats() {
  const grid = document.getElementById('gamesStatsGrid');
  if (!grid) return;
  const profile = gamesGetProfile();
  const activeId = profile.activeAccountId;
  const accounts = gamesBuildProfilesWithRemoteRows(profile).sort((a, b) => {
    const aActive = String(a && a.id || '') === String(activeId || '');
    const bActive = String(b && b.id || '') === String(activeId || '');
    if (aActive !== bActive) return aActive ? -1 : 1;
    const ai = Number(a && a.id ? a.id : 0) || 0;
    const bi = Number(b && b.id ? b.id : 0) || 0;
    return ai - bi;
  });

  if (!accounts.length) {
    grid.innerHTML = '<div class="smallText">Zatím nejsou žádné herní statistiky.</div>';
  } else {
    grid.innerHTML = accounts.map(acc => {
      const stats = acc.stats || {};
      const ttt = stats.ttt || {};
      const g2048 = stats.g2048 || {};
      const snake = stats.snake || {};
      const flap = stats.flap || {};
      const totalPlays = (ttt.plays || 0) + (g2048.plays || 0) + (snake.plays || 0) + (flap.plays || 0);
      const lines = [
        '<div class="gamesStatsCardLine"><strong>Piškvorky</strong> · ' + String(ttt.plays || 0) + '×</div>',
        '<div class="gamesStatsCardLine"><strong>2048</strong> · max ' + String(g2048.bestScore || 0) + '</div>',
        '<div class="gamesStatsCardLine"><strong>Snake</strong> · max ' + String(snake.bestScore || 0) + '</div>',
        '<div class="gamesStatsCardLine"><strong>Flap</strong> · max ' + String(flap.bestScore || 0) + '</div>'
      ].join('');
      const isActive = String(acc.id) === String(activeId);
      return '<details class="gamesStatsCard' + (isActive ? ' isActive' : '') + '"' + (isActive ? ' open' : '') + '>' +
        '<summary class="gamesStatsCardSummary">' +
          '<div class="gamesStatsCardHead">' +
            '<div>' +
              '<div class="gamesStatsCardName">' + escapeHtml(acc.name || '') + '</div>' +
            '</div>' +
            '<div class="gamesStatsCardTotal">' + String(totalPlays) + ' her</div>' +
          '</div>' +
        '</summary>' +
        '<div class="gamesStatsCardBody">' + lines + '</div>' +
      '</details>';
    }).join('');
  }
}

function gamesEnsureOnlineProgressReset() {
  // v.1.5 (809): automatický klientský reset online statistik je vypnutý.
  // Starý jednorázový maintenance reset už nemá běžet při otevření herního hubu, protože jde o destruktivní write cestu.
  return Promise.resolve({ ok: true, skipped: true, disabled: true, reason: 'client-maintenance-reset-disabled' });
}

function renderGamesHub() {
  gamesGetProfile();
  gamesRenderAccountChips();
  if (typeof renderGamesProfileStatus === 'function') renderGamesProfileStatus();
  gamesRenderProfiles();
  gamesRenderAchievements();
  // v.1.1 (668): samostatné herní Statistiky jsou sjednocené do Profilů.
  if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
  if (typeof gamesEnsureOnlineProgressReset === 'function') void gamesEnsureOnlineProgressReset();
  void gamesSyncProfileFromRemote().then(() => { if (typeof renderGamesProfileStatus === 'function') renderGamesProfileStatus(); gamesRenderProfiles(); gamesRenderAchievements(); if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections(); });
  void gamesRefreshRemoteLeaderboards(null, true).then(() => { gamesRenderProfiles(); });
  gamesEnsureKeyBindings();
  gamesEnsureResizeBinding();
  const stage = document.getElementById('gamesStage');
  if (!stage) return;
  if (!app.activeGameShell) {
    stage.innerHTML = '';
    document.body.classList.remove('gamesOpen');
    return;
  }
  renderGameShell(app.activeGameShell);
}

function openGameShell(gameId) {
  const id = String(gameId || '').trim();
  gamesStopActiveLoops();
  app.activeGameShell = id;
  if (typeof window.rakGameEngineActivate === 'function') window.rakGameEngineActivate(id, 'openGameShell');
  if (id === 'ttt') {
    openTicTacToeGame();
    return;
  }
  document.body.classList.add('gamesOpen');
  if (document.body && document.body.dataset) document.body.dataset.rakArcadeGame = id;
  renderGameShell(id);
}

function closeGameShell() {
  gamesStopActiveLoops();
  app.activeGameShell = '';
  if (typeof window.rakGameEngineDeactivate === 'function') window.rakGameEngineDeactivate('closeGameShell');
  document.body.classList.remove('gamesOpen');
  if (document.body && document.body.dataset) delete document.body.dataset.rakArcadeGame;
  renderGamesHub();
}

function renderGameShell(gameId) {
  const stage = document.getElementById('gamesStage');
  if (!stage) return;
  const titleMap = { ttt: 'Piškvorky', '2048': '2048', snake: 'Snake', flap: 'Flappy Car' };
  const title = titleMap[gameId] || 'Hra';
  if (gameId && typeof app !== 'undefined') app.activeGameShell = gameId;
  if (gameId && typeof window.rakGameEngineActivate === 'function') window.rakGameEngineActivate(gameId, 'renderGameShell');
  document.body.classList.add('gamesOpen');
  if (document.body && document.body.dataset) document.body.dataset.rakArcadeGame = String(gameId || '').trim();
  gamesApplyCompactMode();
  gamesEnsureResizeBinding();
  const cleanTitleGames = gameId === '2048' || gameId === 'snake' || gameId === 'flap';
  stage.innerHTML = cleanTitleGames ? [
    '<div class="gamesShell gamesShellNoTitle">',
    '  <button type="button" class="gamesShellBack gamesShellBackFloating" id="legacyGameBackBtn" aria-label="Zpět">Zpět</button>',
    '  <div id="gamesShellBody"></div>',
    '</div>'
  ].join('') : [
    '<div class="gamesShell">',
    '  <div class="gamesShellTop">',
    '    <div class="gamesShellTitle">' + escapeHtml(title) + '</div>',
    '  </div>',
    '  <div id="gamesShellBody"></div>',
    '</div>'
  ].join('');
  const legacyBack = document.getElementById('legacyGameBackBtn');
  if (legacyBack && !legacyBack.dataset.bound) {
    legacyBack.dataset.bound = '1';
    legacyBack.addEventListener('click', () => { if (typeof closeGameShell === 'function') closeGameShell(); });
  }
  if (gameId === 'ttt') renderGamesTttShell();
  else if (gameId === '2048') renderGame2048();
  else if (gameId === 'snake') renderGameSnake();
  else if (gameId === 'flap') renderGameFlap();
}

function gamesRecordStat(gameId, patch) {
  const profile = gamesGetProfile();
  const active = profile.accounts[profile.activeAccountId];
  if (!active) return;
  const nextPatch = Object.assign({ lastPlayedAt: Date.now() }, patch || {});
  const statPatch = Object.assign({}, nextPatch);
  delete statPatch.skipOnlineSync;
  delete statPatch.localOnly;
  delete statPatch.noOnlineSync;
  delete statPatch.onlineResultKey;
  delete statPatch.onlineSessionId;
  active.updatedAt = nextPatch.lastPlayedAt;
  if (gameId === 'ttt') {
    active.stats.ttt = Object.assign({}, active.stats.ttt, statPatch);
  } else if (gameId === '2048') {
    active.stats.g2048 = Object.assign({}, active.stats.g2048, statPatch);
  } else if (gameId === 'snake') {
    active.stats.snake = Object.assign({}, active.stats.snake, statPatch);
  } else if (gameId === 'flap') {
    active.stats.flap = Object.assign({}, active.stats.flap, statPatch);
  }
  gamesSaveProfile(profile);
  gamesRenderProfiles();
  if (!nextPatch.skipOnlineSync && !nextPatch.localOnly && !nextPatch.noOnlineSync) {
    void gamesSyncStatOnline(gameId, nextPatch);
    void gamesRefreshRemoteLeaderboards(gameId, true);
  }
}


function gamesNormalizeRemoteLeaderboardRows(gameId, rows, limit = 10) {
  const key = String(gameId || '').trim();
  return (Array.isArray(rows) ? rows : [])
    .filter((row) => gamesIsRemoteStatAfterReset(row))
    .map((row) => {
      const accountNumber = String(row && (row.account_number ?? row.accountNumber ?? row.id) ? (row.account_number ?? row.accountNumber ?? row.id) : '').trim();
      const name = String(row && (row.player_name ?? row.full_name ?? row.name) ? (row.player_name ?? row.full_name ?? row.name) : accountNumber || '').trim();
      const rawPoints = gameId === 'ttt'
        ? (row && (row.games_played ?? row.plays ?? row.points ?? row.best_score ?? row.bestScore ?? row.value))
        : (row && (row.points ?? row.best_score ?? row.bestScore ?? row.value));
      const points = Number(rawPoints || 0) || 0;
      const updatedAt = String(row && (row.last_played_at ?? row.lastPlayedAt ?? row.updated_at ?? row.created_at) ? (row.last_played_at ?? row.lastPlayedAt ?? row.updated_at ?? row.created_at) : '').trim();
      return {
        id: accountNumber || name,
        name: name || accountNumber || 'Hráč',
        value: points,
        updatedAt,
        playedText: gamesFormatPlayedLabel(updatedAt),
        wins: Number(row && row.wins || 0) || 0,
        losses: Number(row && row.losses || 0) || 0,
        draws: Number(row && row.draws || 0) || 0,
        gameId: key
      };
    })
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value || String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')) || String(a.name || '').localeCompare(String(b.name || ''), 'cs'))
    .slice(0, limit);
}

async function gamesRefreshRemoteLeaderboards(gameId, force) {
  if (!window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.loadGameStats !== 'function') return [];
  const ids = gameId ? [gameId] : ['ttt', '2048', 'snake', 'flap'];
  app.gamesLeaderboardCache = app.gamesLeaderboardCache || { ttt: [], '2048': [], snake: [], flap: [] };
  app.gamesLeaderboardThrottle = app.gamesLeaderboardThrottle || {};
  const now = Date.now();
  const ttl = gameId === 'ttt' ? 15000 : 60000;
  const freshIds = ids.filter((id) => {
    const last = Number(app.gamesLeaderboardThrottle[id] || 0) || 0;
    const hasCache = Array.isArray(app.gamesLeaderboardCache[id]) && app.gamesLeaderboardCache[id].length;
    return !!force || !hasCache || (now - last) > ttl;
  });
  if (!freshIds.length) return ids.map((id) => ({ id, rows: (app.gamesLeaderboardCache[id] || []).slice(0, 10), cached: true }));
  try {
    const results = await Promise.all(freshIds.map(async (id) => {
      try {
        const rows = await window.RotationSupabaseBridge.loadGameStats(id, id === 'ttt' ? 50 : 10, { force: !!force });
        const normalized = gamesNormalizeRemoteLeaderboardRows(id, rows, id === 'ttt' ? 50 : 10);
        app.gamesLeaderboardCache[id] = normalized;
        app.gamesLeaderboardThrottle[id] = Date.now();
        return { id, rows: normalized };
      } catch (err) {
        console.warn('games leaderboard refresh failed', id, err);
        return { id, rows: app.gamesLeaderboardCache[id] || [] };
      }
    }));
    // v.1.1 (669): profily se můžou bezpečně obnovit i během hry; shell samotný se nepřekresluje.
    gamesRenderProfiles();
    if (!app.activeGameShell) gamesRenderStats();
    return results;
  } catch (err) {
    console.warn('gamesRefreshRemoteLeaderboards failed', err);
    return [];
  }
}

async function gamesSyncStatOnline(gameId, patch) {
  const account = gamesGetActiveAccount();
  if (!account || !window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.saveGameStat !== 'function') return null;
  try {
    const lastPlayedAt = patch && patch.lastPlayedAt ? new Date(patch.lastPlayedAt).toISOString() : new Date().toISOString();
    return await window.RotationSupabaseBridge.saveGameStat({
      account_number: String(account.id || '').trim(),
      player_name: String(account.name || '').trim(),
      game_type: String(gameId || '').trim(),
      games_played: Number(patch && patch.games_played !== undefined ? patch.games_played : (patch && patch.plays !== undefined ? patch.plays : 0)) || 0,
      wins: Number(patch && patch.wins !== undefined ? patch.wins : 0) || 0,
      losses: Number(patch && patch.losses !== undefined ? patch.losses : 0) || 0,
      draws: Number(patch && patch.draws !== undefined ? patch.draws : 0) || 0,
      points: Number(patch && patch.points !== undefined ? patch.points : (patch && patch.bestScore !== undefined ? patch.bestScore : 0)) || 0,
      last_played_at: lastPlayedAt
    });
  } catch (err) {
    console.warn('gamesSyncStatOnline failed', err);
    return null;
  }
}

function gamesGetGameLeaderboard(gameId, limit = 10) {
  app.gamesLeaderboardCache = app.gamesLeaderboardCache || { ttt: [], '2048': [], snake: [], flap: [] };
  const cached = Array.isArray(app.gamesLeaderboardCache[gameId]) ? app.gamesLeaderboardCache[gameId] : [];
  if (cached.length) return cached.slice(0, limit);

  const profile = gamesGetProfile();
  const accounts = Object.values(profile.accounts || {});
  const getValue = (acc) => {
    const stats = acc && acc.stats ? acc.stats : {};
    if (gameId === '2048') return Number(stats.g2048 && stats.g2048.bestScore || 0);
    if (gameId === 'snake') return Number(stats.snake && stats.snake.bestScore || 0);
    if (gameId === 'flap') return Number(stats.flap && stats.flap.bestScore || 0);
    if (gameId === 'ttt') return Number(stats.ttt && stats.ttt.plays || 0);
    return 0;
  };
  const getTime = (acc) => {
    const stats = acc && acc.stats ? acc.stats : {};
    if (gameId === '2048') return stats.g2048 && stats.g2048.lastPlayedAt ? stats.g2048.lastPlayedAt : acc.updatedAt;
    if (gameId === 'snake') return stats.snake && stats.snake.lastPlayedAt ? stats.snake.lastPlayedAt : acc.updatedAt;
    if (gameId === 'flap') return stats.flap && stats.flap.lastPlayedAt ? stats.flap.lastPlayedAt : acc.updatedAt;
    if (gameId === 'ttt') return stats.ttt && stats.ttt.lastPlayedAt ? stats.ttt.lastPlayedAt : acc.updatedAt;
    return acc.updatedAt;
  };
  return accounts.map((acc) => ({
    id: acc.id,
    name: acc.name || ('Hráč ' + String(acc.id || '')),
    value: getValue(acc),
    playedText: gamesFormatPlayedLabel(getTime(acc))
  })).filter((row) => row.value > 0).sort((a, b) => b.value - a.value || String(a.name).localeCompare(String(b.name), 'cs')).slice(0, limit);
}


function gamesTop3Block(gameId, label, limit = 10) {
  const rows = gamesGetGameLeaderboard(gameId, limit);
  const body = rows.length ? rows.map((row, idx) => (
    '<div class="gamesTop3Row">' +
      '<div class="gamesTop3Rank">' + String(idx + 1) + '.</div>' +
      '<div class="gamesTop3Name">' + escapeHtml(row.name) + '</div>' +
      '<div class="gamesTop3Value">' + String(row.value) + ' ' + escapeHtml(label) + (row.playedText ? ' · ' + escapeHtml(row.playedText) : '') + '</div>' +
    '</div>'
  )).join('') : '<div class="gamesTop3Empty">Zatím žádné výsledky.</div>';
  return [
    '<div class="gamesTop3Card">',
    '  <div class="gamesTop3Title">Top ' + String(limit) + ' výsledků</div>',
    '  <div class="gamesTop3Body">' + body + '</div>',
    '</div>'
  ].join('');
}

function gamesEnsureKeyBindings() {
  if (window.__rotaceGamesKeysBound) return;
  window.__rotaceGamesKeysBound = true;
  document.addEventListener('keydown', (ev) => {
    if (!app.activeGameShell) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes((ev.target && ev.target.tagName) || '')) return;
    if (app.activeGameShell === '2048') {
      const dir = ({ ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' })[ev.key];
      if (dir) { ev.preventDefault(); game2048Move(dir); }
    } else if (app.activeGameShell === 'snake') {
      const dir = ({ ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' })[ev.key];
      if (dir) { ev.preventDefault(); snakeSetDirection(dir); }
    } else if (app.activeGameShell === 'flap') {
      if (ev.key === ' ' || ev.key === 'ArrowUp') { ev.preventDefault(); flapTap(); }
    }
  }, { passive: false });
}



function gamesStopActiveLoops() {
  if (typeof window.rakGameEngineNoteLoopStop === 'function') window.rakGameEngineNoteLoopStop('gamesStopActiveLoops');
  if (app.gamesSnake && app.gamesSnake.timer) {
    clearInterval(app.gamesSnake.timer);
    app.gamesSnake.timer = null;
  }
  if (app.gamesFlap && app.gamesFlap.timer) {
    cancelAnimationFrame(app.gamesFlap.timer);
    app.gamesFlap.timer = null;
  }
}


if (!window.__rakCoreGamesVisibilityBound) {
  window.__rakCoreGamesVisibilityBound = true;
  document.addEventListener('visibilitychange', () => {
    // Fáze 5: v pozadí hru nepřerenderováváme ani neukončujeme.
    // Jen uložíme čas změny, aby diagnostika věděla, že aplikace prošla pozadím.
    window.__rakCoreGamesLastVisibilityAt = Date.now();
  }, { passive: true });
}

function gamesBindSwipeControl(el, onSwipe, options) {
  if (!el || el.dataset.swipeBound) return;
  el.dataset.swipeBound = '1';

  const opts = options || {};
  const minDistance = Number(opts.minDistance || 14);
  const lockDistance = Number(opts.lockDistance || 7);
  const maxTapTime = Number(opts.maxTapTime || 260);
  const axisRatio = Math.max(1, Number(opts.axisRatio || 1) || 1);
  const fireOnMove = !!opts.fireOnMove;
  let startX = 0;
  let startY = 0;
  let active = false;
  let activePointerId = null;
  let startedAt = 0;

  const reset = () => {
    active = false;
    activePointerId = null;
    el.classList.remove('isTouching');
  };

  const readSwipe = (clientX, clientY) => {
    const dx = clientX - startX;
    const dy = clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const distance = Math.max(absX, absY);
    const elapsed = Date.now() - startedAt;
    if (distance < minDistance) return null;
    if (elapsed < maxTapTime && distance < minDistance + 3) return null;
    if (axisRatio > 1 && Math.max(absX, absY) < Math.max(1, Math.min(absX, absY)) * axisRatio) return null;
    const dir = absX >= absY ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    return { dir, dx, dy, absX, absY, distance, elapsed };
  };

  const trigger = (clientX, clientY) => {
    const swipe = readSwipe(clientX, clientY);
    if (!swipe) return false;
    onSwipe(swipe.dir, swipe);
    return true;
  };

  const finish = (clientX, clientY) => {
    if (!active) return;
    const fired = trigger(clientX, clientY);
    reset();
    return fired;
  };

  const usePointer = 'PointerEvent' in window;
  if (usePointer) {
    el.addEventListener('pointerdown', (ev) => {
      if (ev.pointerType && ev.pointerType !== 'touch' && ev.pointerType !== 'pen') return;
      ev.preventDefault?.();
      startX = ev.clientX;
      startY = ev.clientY;
      active = true;
      activePointerId = ev.pointerId;
      startedAt = Date.now();
      el.classList.add('isTouching');
      try {
        if (typeof el.setPointerCapture === 'function') el.setPointerCapture(ev.pointerId);
      } catch (err) {}
    }, { passive: false });

    el.addEventListener('pointerup', (ev) => {
      if (ev.pointerType && ev.pointerType !== 'touch' && ev.pointerType !== 'pen') return;
      if (activePointerId !== null && ev.pointerId !== activePointerId) return;
      ev.preventDefault?.();
      finish(ev.clientX, ev.clientY);
    }, { passive: false });

    el.addEventListener('pointermove', (ev) => {
      if (!active || (ev.pointerType && ev.pointerType !== 'touch' && ev.pointerType !== 'pen')) return;
      if (activePointerId !== null && ev.pointerId !== activePointerId) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      if (distance >= lockDistance) ev.preventDefault?.();
      if (fireOnMove && distance >= minDistance && trigger(ev.clientX, ev.clientY)) reset();
    }, { passive: false });

    el.addEventListener('pointercancel', reset, { passive: true });
    el.addEventListener('lostpointercapture', () => {
      if (!active) el.classList.remove('isTouching');
    }, { passive: true });
  } else {
    el.addEventListener('touchstart', (ev) => {
      if (!ev.touches || ev.touches.length !== 1) return;
      const touch = ev.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      active = true;
      startedAt = Date.now();
      el.classList.add('isTouching');
      ev.preventDefault?.();
    }, { passive: false });

    el.addEventListener('touchmove', (ev) => {
      if (!active) return;
      ev.preventDefault?.();
      const touch = ev.touches && ev.touches[0];
      if (fireOnMove && touch && trigger(touch.clientX, touch.clientY)) reset();
    }, { passive: false });

    el.addEventListener('touchend', (ev) => {
      const touch = ev.changedTouches && ev.changedTouches[0];
      if (!touch) return;
      ev.preventDefault?.();
      finish(touch.clientX, touch.clientY);
    }, { passive: false });

    el.addEventListener('touchcancel', reset, { passive: true });
  }
}
const SNAKE_JOYSTICK_KEY = APP_KEY + ':snake_joystick_v1';

function snakeLoadJoystickEnabled() {
  try {
    const saved = typeof getLocalStorageCached === 'function'
      ? getLocalStorageCached(SNAKE_JOYSTICK_KEY, '')
      : localStorage.getItem(SNAKE_JOYSTICK_KEY);
    if (saved !== null && saved !== '') return saved === '1';
  } catch (err) {}
  return !!(navigator && navigator.maxTouchPoints > 0);
}

function snakeIsJoystickEnabled() {
  if (typeof app.gamesSnakeJoystickEnabled !== 'boolean') {
    app.gamesSnakeJoystickEnabled = snakeLoadJoystickEnabled();
  }
  return !!app.gamesSnakeJoystickEnabled;
}

function snakeSetJoystickEnabled(enabled) {
  app.gamesSnakeJoystickEnabled = !!enabled;
  try {
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(SNAKE_JOYSTICK_KEY, enabled ? '1' : '0');
    else localStorage.setItem(SNAKE_JOYSTICK_KEY, enabled ? '1' : '0');
  } catch (err) {}
  renderGameSnake();
}

function snakeBuildJoystickMarkup() {
  return [
    '<div class="snakeJoystickDock isOn" id="snakeJoystickDock" aria-label="Joystick hada">',
    '  <div class="snakeJoystickLabel">Joystick</div>',
    '  <div class="gamePad snakeJoystickPad" id="snakeJoystickPad" role="group" aria-label="Joystick hada">',
    '    <span></span>',
    '    <button type="button" class="gameControlBtn" data-game-dir="up" aria-label="Nahoru">▲</button>',
    '    <span></span>',
    '    <button type="button" class="gameControlBtn" data-game-dir="left" aria-label="Doleva">◀</button>',
    '    <div class="snakeJoystickCenter" aria-hidden="true">●</div>',
    '    <button type="button" class="gameControlBtn" data-game-dir="right" aria-label="Doprava">▶</button>',
    '    <span></span>',
    '    <button type="button" class="gameControlBtn" data-game-dir="down" aria-label="Dolů">▼</button>',
    '    <span></span>',
    '  </div>',
    '</div>'
  ].join('');
}

function snakeBindJoystickControls(root, resetSnake) {
  if (!root) return;
  const dock = root.querySelector('#snakeJoystickDock');
  const pad = root.querySelector('#snakeJoystickPad');

  if (!dock || !pad) return;
  dock.classList.add('isOn');
  gamesBindDirectionPad(pad, (dir) => {
    const current = app.gamesSnake;
    if (current && current.over) {
      resetSnake();
      return;
    }
    snakeSetDirection(dir);
  });
}

// ---- 2048 ----
function gamesViewportSize() {
  const vv = window.visualViewport;
  const width = Math.max(320, Math.floor((vv ? vv.width : window.innerWidth) || window.innerWidth || 320));
  const height = Math.max(480, Math.floor((vv ? vv.height : window.innerHeight) || window.innerHeight || 480));
  return { width, height };
}

function gamesFitSquareSize(options) {
  const opts = options || {};
  const min = Number(opts.min || 240);
  const max = Number(opts.max || 460);
  const reserve = Number(opts.reserve || 260);
  const shellPad = Number(opts.shellPad || 16);
  const vp = gamesViewportSize();
  const widthFit = Math.max(min, vp.width - shellPad * 2);
  const heightFit = Math.max(min, vp.height - reserve);
  return Math.round(Math.max(min, Math.min(max, widthFit, heightFit)));
}

function gamesFitFlapSize() {
  const vp = gamesViewportSize();
  const compact = gamesIsCompactMode();
  const width = Math.max(320, Math.min(compact ? 640 : 620, vp.width - (compact ? 10 : 14)));
  const height = Math.max(compact ? 360 : 340, Math.min(compact ? 610 : 590, vp.height - (compact ? 88 : 110)));
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

function gamesIsCompactMode() {
  const vp = gamesViewportSize();
  return vp.height < 760 || vp.width < 390;
}

function gamesApplyCompactMode() {
  if (!document.body) return false;
  const compact = gamesIsCompactMode();
  document.body.classList.toggle('gamesCompactMode', compact);
  return compact;
}

function gamesBindDirectionPad(root, handler) {
  if (!root) return;
  root.querySelectorAll('[data-game-dir]').forEach((btn) => {
    if (btn.dataset.dirBound) return;
    btn.dataset.dirBound = '1';
    let lastFireAt = 0;
    const fire = (ev) => {
      if (ev) {
        ev.preventDefault?.();
        ev.stopPropagation?.();
      }
      const now = Date.now();
      if (now - lastFireAt < 160) return;
      lastFireAt = now;
      handler(btn.dataset.gameDir);
    };
    btn.addEventListener('click', fire);
    btn.addEventListener('pointerdown', fire, { passive: false });
    btn.addEventListener('touchstart', fire, { passive: false });
  });
}

function gamesEnsureResizeBinding() {
  if (window.__rotaceGamesResizeBound) return;
  window.__rotaceGamesResizeBound = true;
  const onResize = () => {
    gamesApplyCompactMode();
    if (app.activeGameShell === '2048') renderGame2048();
    else if (app.activeGameShell === 'snake') renderGameSnake();
    else if (app.activeGameShell === 'flap' && app.gamesFlap) flapSyncCanvas(app.gamesFlap, true);
  };
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', onResize, { passive: true });
}

function game2048InitialState() {
  return {
    board: Array(16).fill(0),
    score: 0,
    over: false,
    recorded: false,
    best: 0,
    spawned: false,
    moves: 0,
    lastGain: 0,
    lastDir: '',
    lastMoveAt: 0,
    lastSpawnedIndex: -1,
    lastMergedIndexes: [],
    lastInvalidAt: 0
  };
}

function game2048Spawn(state) {
  const empties = state.board.map((v, i) => (v ? -1 : i)).filter(i => i >= 0);
  if (!empties.length) return null;
  const idx = empties[Math.floor(Math.random() * empties.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  state.board[idx] = value;
  state.lastSpawnedIndex = idx;
  state.best = Math.max(Number(state.best || 0), value);
  return { index: idx, value };
}

function game2048CanMove(board) {
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      const v = board[game2048Index(r, c)];
      if (!v) return true;
      if (c < 3 && v === board[game2048Index(r, c + 1)]) return true;
      if (r < 3 && v === board[game2048Index(r + 1, c)]) return true;
    }
  }
  return false;
}

function game2048Index(r, c) { return r * 4 + c; }

function game2048PositionsForLine(dir, lineIndex) {
  if (dir === 'left') return [0, 1, 2, 3].map(c => game2048Index(lineIndex, c));
  if (dir === 'right') return [3, 2, 1, 0].map(c => game2048Index(lineIndex, c));
  if (dir === 'up') return [0, 1, 2, 3].map(r => game2048Index(r, lineIndex));
  if (dir === 'down') return [3, 2, 1, 0].map(r => game2048Index(r, lineIndex));
  return [];
}

function game2048PullLine(vals) {
  const arr = vals.filter(Boolean);
  const values = [];
  const mergedSlots = [];
  let gain = 0;
  for (let i = 0; i < arr.length; i += 1) {
    if (i < arr.length - 1 && arr[i] === arr[i + 1]) {
      const merged = arr[i] * 2;
      const slot = values.length;
      values.push(merged);
      mergedSlots.push({ slot, value: merged });
      gain += merged;
      i += 1;
    } else {
      values.push(arr[i]);
    }
  }
  while (values.length < 4) values.push(0);
  return { values, gain, mergedSlots };
}

function game2048DirectionText(dir) {
  return ({ left: 'doleva', right: 'doprava', up: 'nahoru', down: 'dolů' })[dir] || '';
}

function game2048TryVibrate(pattern) {
  try {
    if (navigator && typeof navigator.vibrate === 'function') navigator.vibrate(pattern);
  } catch (err) {}
}

function game2048RecordEndIfNeeded(state) {
  if (!state || state.recorded) return;
  state.recorded = true;
  const account = gamesGetActiveAccount();
  gamesRecordStat('2048', {
    completed: true,
    plays: (account?.stats?.g2048?.plays || 0) + 1,
    bestScore: Math.max(account?.stats?.g2048?.bestScore || 0, state.score),
    bestTile: Math.max(account?.stats?.g2048?.bestTile || 0, state.best)
  });
}

function game2048BuildCell(value, index, state) {
  const classes = ['gameBoardCell'];
  if (value) classes.push('n' + value);
  if (index === state.lastSpawnedIndex) classes.push('isNew');
  if (Array.isArray(state.lastMergedIndexes) && state.lastMergedIndexes.includes(index)) classes.push('isMerged');
  return '<div class="' + classes.join(' ') + '" data-value="' + (value || '') + '" aria-label="' + (value ? ('Pole ' + value) : 'Prázdné pole') + '">' + (value || '') + '</div>';
}

function renderGame2048() {
  const body = document.getElementById('gamesShellBody');
  if (!body) return;
  const state = app.games2048 || (app.games2048 = game2048InitialState());
  if (!state.spawned) {
    game2048Spawn(state);
    game2048Spawn(state);
    state.spawned = true;
    state.lastSpawnedIndex = -1;
  }
  if (!state.over && !game2048CanMove(state.board)) {
    state.over = true;
    game2048RecordEndIfNeeded(state);
  }
  const compact = gamesIsCompactMode();
  const boardSize = gamesFitSquareSize({ min: compact ? 268 : 292, max: Math.min(compact ? 540 : 500, gamesViewportSize().width - (compact ? 14 : 20)), reserve: compact ? 156 : 172, shellPad: compact ? 6 : 10 });
  const activeAccount = gamesGetActiveAccount();
  const bestScore = activeAccount?.stats?.g2048?.bestScore || 0;
  const bestTile = Math.max(Number(activeAccount?.stats?.g2048?.bestTile || 0), Number(state.best || 0));
  const invalidClass = state.lastInvalidAt && Date.now() - state.lastInvalidAt < 450 ? ' isInvalidSwipe' : '';
  const overlay = state.over ? [
    '<div class="game2048Overlay">',
    '  <div class="game2048OverlayCard">',
    '    <div class="game2048OverlayTitle">Konec hry</div>',
    '    <div class="game2048OverlayText">Skóre ' + String(state.score) + ' · nejvyšší kámen ' + String(state.best || 0) + '</div>',
    '    <button type="button" class="gameControlBtn" id="game2048OverlayNewBtn">Nová hra</button>',
    '  </div>',
    '</div>'
  ].join('') : '';
  body.innerHTML = [
    '<div class="gamesGamePanel game2048Panel">',
    '  <div class="game2048Hud" aria-label="Stav hry 2048">',
    '    <div class="game2048ScoreCard"><span>Skóre</span><strong>' + String(state.score) + '</strong></div>',
    '    <div class="game2048ScoreCard"><span>Nejlepší</span><strong>' + String(bestScore) + '</strong></div>',
    '    <div class="game2048ScoreCard"><span>Kámen</span><strong>' + String(bestTile || state.best || 0) + '</strong></div>',
    '  </div>',
    '  <div class="game2048BoardWrap" style="width:' + boardSize + 'px;max-width:100%;">',
    '    <div class="gameBoard game2048Board' + invalidClass + '" id="game2048Board" role="application" aria-label="2048, táhni prstem nahoru, dolů, doleva nebo doprava" tabindex="0" style="width:' + boardSize + 'px;height:' + boardSize + 'px;">' + state.board.map((v, i) => game2048BuildCell(v, i, state)).join('') + '</div>',
    overlay,
    '  </div>',
    '  <div class="game2048ControlsRow game2048ControlsRowSolo">',
    '    <button type="button" class="gameControlBtn" id="game2048NewBtn">Nová hra</button>',
    '  </div>',
    gamesTop3Block('2048', 'bodů', 10),
    '</div>'
  ].join('');
  const board = body.querySelector('#game2048Board');
  const wrap = body.querySelector('.game2048BoardWrap');
  if (board) {
    board.style.setProperty('width', boardSize + 'px', 'important');
    board.style.setProperty('height', boardSize + 'px', 'important');
    try {
      if (typeof board.focus === 'function') board.focus({ preventScroll: true });
    } catch (err) {
      try { if (typeof board.focus === 'function') board.focus(); } catch (innerErr) {}
    }
  }
  if (wrap) wrap.style.setProperty('width', boardSize + 'px', 'important');
  const reset2048 = () => {
    app.games2048 = game2048InitialState();
    renderGame2048();
  };
  const playDir = (dir) => {
    const current = app.games2048;
    if (current && current.over) {
      reset2048();
      return;
    }
    game2048Move(dir);
  };
  body.querySelector('#game2048NewBtn')?.addEventListener('click', reset2048);
  body.querySelector('#game2048OverlayNewBtn')?.addEventListener('click', reset2048);
  gamesBindSwipeControl(board, (dir) => playDir(dir), { minDistance: 12, lockDistance: 5 });
  board?.addEventListener('click', () => {
    if (app.games2048 && app.games2048.over) reset2048();
  });
}

function game2048Move(dir) {
  const state = app.games2048;
  if (!state || state.over) return;
  const old = state.board.slice();
  let moved = false;
  let gain = 0;
  const mergedIndexes = [];
  state.lastSpawnedIndex = -1;
  state.lastMergedIndexes = [];
  state.lastGain = 0;
  state.lastDir = dir;
  for (let i = 0; i < 4; i += 1) {
    const positions = game2048PositionsForLine(dir, i);
    if (!positions.length) return;
    const line = positions.map(idx => old[idx]);
    const pulled = game2048PullLine(line);
    pulled.values.forEach((value, idx) => {
      const boardIndex = positions[idx];
      state.board[boardIndex] = value;
      if (value !== old[boardIndex]) moved = true;
    });
    pulled.mergedSlots.forEach((item) => {
      const boardIndex = positions[item.slot];
      if (typeof boardIndex === 'number') mergedIndexes.push(boardIndex);
    });
    gain += pulled.gain;
  }
  if (moved) {
    state.moves += 1;
    state.score += gain;
    state.lastGain = gain;
    state.lastMoveAt = Date.now();
    state.lastMergedIndexes = mergedIndexes;
    state.best = Math.max(state.best, ...state.board);
    game2048Spawn(state);
    state.best = Math.max(state.best, ...state.board);
    if (!state.board.includes(0) && !game2048CanMove(state.board)) {
      state.over = true;
      game2048RecordEndIfNeeded(state);
      game2048TryVibrate([18, 32, 18]);
    } else {
      game2048TryVibrate(8);
    }
    renderGame2048();
  } else {
    state.lastInvalidAt = Date.now();
    state.lastGain = 0;
    if (!game2048CanMove(state.board)) {
      state.over = true;
      game2048RecordEndIfNeeded(state);
    } else {
      game2048TryVibrate(18);
    }
    renderGame2048();
  }
}

// ---- Snake ----
function snakeDefaultState() {
  const head = { x: 8, y: 9 };
  return {
    size: 18,
    snake: [head, { x: 7, y: 9 }, { x: 6, y: 9 }],
    dir: { x: 1, y: 0 },
    queue: [],
    food: { x: 13, y: 9 },
    over: false,
    score: 0,
    timer: null,
    recorded: false,
    lastAteAt: 0,
    lastTurnAt: 0,
    lastTickAt: 0,
    speedMs: 154
  };
}

function snakeCellKey(x, y) {
  return String(x) + ':' + String(y);
}

function snakeCellIndex(x, y, size) {
  return (Number(y || 0) * Number(size || 0)) + Number(x || 0);
}

function snakeTryVibrate(pattern) {
  try {
    if (typeof navigator !== 'undefined' && navigator && typeof navigator.vibrate === 'function') navigator.vibrate(pattern);
  } catch (err) {}
}

function snakePlaceFood(state) {
  if (!state || !Array.isArray(state.snake)) return;
  const occupied = new Set(state.snake.map(p => snakeCellKey(p.x, p.y)));
  const free = [];
  for (let y = 0; y < state.size; y += 1) {
    for (let x = 0; x < state.size; x += 1) {
      if (!occupied.has(snakeCellKey(x, y))) free.push({ x, y });
    }
  }
  if (!free.length) {
    state.over = true;
    return;
  }
  state.food = free[Math.floor(Math.random() * free.length)] || free[0];
}

function snakeBuildCellClasses(state, x, y) {
  if (!state) return 'snakeEmpty';
  if (state.food && state.food.x === x && state.food.y === y) return 'snakeFood';
  if (state.snake && state.snake[0] && state.snake[0].x === x && state.snake[0].y === y) return 'snakeHead';
  if (Array.isArray(state.snake) && state.snake.some((p, idx) => idx > 0 && p.x === x && p.y === y)) return 'snakeBody';
  return 'snakeEmpty';
}

function snakeBuildCells(state) {
  const cells = [];
  const size = Number(state && state.size || 18);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      cells.push('<div class="gameBoardCell snakeEmpty" data-snake-cell="' + String(snakeCellIndex(x, y, size)) + '" aria-hidden="true"></div>');
    }
  }
  return cells.join('');
}

function snakeGetBestStats() {
  const activeAccount = gamesGetActiveAccount();
  const stats = activeAccount && activeAccount.stats && activeAccount.stats.snake ? activeAccount.stats.snake : {};
  return {
    bestScore: Number(stats.bestScore || 0) || 0,
    bestLength: Number(stats.bestLength || 0) || 0,
    plays: Number(stats.plays || 0) || 0
  };
}

function snakeUpdateUi() {
  const body = document.getElementById('gamesShellBody');
  const state = app.gamesSnake;
  if (!body || !state) return;
  const best = snakeGetBestStats();
  const scoreEl = body.querySelector('[data-snake-score]');
  const bestEl = body.querySelector('[data-snake-best]');
  const lenEl = body.querySelector('[data-snake-length]');
  const board = body.querySelector('#gameSnakeBoard');
  const overlay = body.querySelector('#snakeResultOverlay');
  const overlayScore = body.querySelector('[data-snake-result-score]');
  const overlayLength = body.querySelector('[data-snake-result-length]');
  const live = body.querySelector('#snakeLiveStatus');
  if (scoreEl) scoreEl.textContent = String(state.score || 0);
  if (bestEl) bestEl.textContent = String(Math.max(best.bestScore || 0, state.score || 0));
  if (lenEl) lenEl.textContent = String(state.snake ? state.snake.length : 0);
  if (overlay) overlay.classList.toggle('isVisible', !!state.over);
  if (overlayScore) overlayScore.textContent = String(state.score || 0);
  if (overlayLength) overlayLength.textContent = String(state.snake ? state.snake.length : 0);
  if (live) live.textContent = state.over ? 'Konec hry. Skóre ' + String(state.score || 0) + ', délka ' + String(state.snake ? state.snake.length : 0) + '.' : 'Snake běží.';
  if (!board) return;
  const cells = board.querySelectorAll('[data-snake-cell]');
  const size = Number(state.size || 18);
  const foodKey = state.food ? snakeCellIndex(state.food.x, state.food.y, size) : -1;
  const snakeMap = new Map();
  (state.snake || []).forEach((p, idx) => snakeMap.set(snakeCellIndex(p.x, p.y, size), idx));
  cells.forEach((cell, idx) => {
    const order = snakeMap.has(idx) ? snakeMap.get(idx) : -1;
    let cls = 'gameBoardCell snakeEmpty';
    if (idx === foodKey) cls = 'gameBoardCell snakeFood';
    if (order === 0) cls = 'gameBoardCell snakeHead';
    else if (order > 0) cls = 'gameBoardCell snakeBody';
    if (cell.className !== cls) cell.className = cls;
    if (order > 0) cell.style.setProperty('--snake-order', String(Math.min(order, 18)));
    else cell.style.removeProperty('--snake-order');
  });
}

function renderGameSnake() {
  const body = document.getElementById('gamesShellBody');
  if (!body) return;
  const state = app.gamesSnake || (app.gamesSnake = snakeDefaultState());
  if (!state.food || !state.snake || !state.snake.length) snakePlaceFood(state);
  if (!Array.isArray(state.queue)) state.queue = [];
  const compact = gamesIsCompactMode();
  const boardSize = gamesFitSquareSize({ min: compact ? 252 : 278, max: Math.min(compact ? 540 : 500, gamesViewportSize().width - (compact ? 14 : 20)), reserve: compact ? 118 : 132, shellPad: compact ? 6 : 10 });
  const best = snakeGetBestStats();
  body.innerHTML = [
    '<div class="gamesGamePanel gamesSnakePanel snakeRedesignPanel">',
    '  <div class="snakeHud snakeHudCompact" aria-label="Stav hry Snake">',
    '    <div class="snakeScoreCard"><span>Score</span><strong data-snake-score>' + String(state.score || 0) + '</strong></div>',
    '    <div class="snakeScoreCard"><span>Délka</span><strong data-snake-length>' + String(state.snake ? state.snake.length : 0) + '</strong></div>',
    '    <div class="snakeScoreCard"><span>Nejlepší</span><strong data-snake-best>' + String(Math.max(best.bestScore || 0, state.score || 0)) + '</strong></div>',
    '  </div>',
    '  <div class="snakeBoardWrap" style="width:' + boardSize + 'px;max-width:100%;">',
    '    <div class="gameBoard gameSnakeBoard snakeTouchZone" id="gameSnakeBoard" role="application" aria-label="Snake" tabindex="0" style="width:' + boardSize + 'px;height:' + boardSize + 'px;grid-template-columns:repeat(' + String(state.size) + ',minmax(0,1fr));grid-template-rows:repeat(' + String(state.size) + ',minmax(0,1fr));">' + snakeBuildCells(state) + '</div>',
    '    <div class="snakeResultOverlay" id="snakeResultOverlay" aria-live="polite">',
    '      <div class="snakeResultCard">',
    '        <div class="snakeResultTitle">Konec hry</div>',
    '        <div class="snakeResultText">Skóre <strong data-snake-result-score>' + String(state.score || 0) + '</strong> · délka <strong data-snake-result-length>' + String(state.snake ? state.snake.length : 0) + '</strong></div>',
    '        <button type="button" class="gameControlBtn snakeNewBtn" id="snakeOverlayNewBtn">Nová hra</button>',
    '      </div>',
    '    </div>',
    '  </div>',
    '  <div class="srOnly" id="snakeLiveStatus" aria-live="polite">Snake běží.</div>',
    gamesTop3Block('snake', 'bodů', 10),
    '</div>'
  ].join('');
  const board = body.querySelector('#gameSnakeBoard');
  const wrap = body.querySelector('.snakeBoardWrap');
  if (board) {
    board.style.setProperty('width', boardSize + 'px', 'important');
    board.style.setProperty('height', boardSize + 'px', 'important');
    board.style.setProperty('--snake-grid-size', String(state.size || 18));
    board.style.setProperty('grid-template-columns', 'repeat(' + String(state.size || 18) + ', minmax(0, 1fr))', 'important');
    board.style.setProperty('grid-template-rows', 'repeat(' + String(state.size || 18) + ', minmax(0, 1fr))', 'important');
    board.style.touchAction = 'none';
    board.style.webkitTouchCallout = 'none';
    board.style.userSelect = 'none';
    try {
      if (typeof board.focus === 'function') board.focus({ preventScroll: true });
    } catch (err) {
      try { if (typeof board.focus === 'function') board.focus(); } catch (innerErr) {}
    }
  }
  if (wrap) wrap.style.setProperty('width', boardSize + 'px', 'important');
  body.style.touchAction = 'none';
  body.style.webkitTouchCallout = 'none';
  body.style.userSelect = 'none';
  body.style.overscrollBehavior = 'contain';
  const resetSnake = () => {
    const current = app.gamesSnake;
    if (current && current.timer) clearInterval(current.timer);
    app.gamesSnake = snakeDefaultState();
    snakePlaceFood(app.gamesSnake);
    renderGameSnake();
    snakeStart();
  };
  const handleTurn = (dir) => {
    const current = app.gamesSnake;
    if (current && current.over) {
      resetSnake();
      return;
    }
    snakeSetDirection(dir);
  };
  body.querySelector('#snakeOverlayNewBtn')?.addEventListener('click', resetSnake);
  gamesBindSwipeControl(board || body, handleTurn, { minDistance: 10, lockDistance: 3, maxTapTime: 220, axisRatio: 1.35, fireOnMove: true });
  board?.addEventListener('click', () => {
    if (app.gamesSnake && app.gamesSnake.over) resetSnake();
  });
  snakeUpdateUi();
  if (!state.timer && !state.over) snakeStart();
}

function snakeNormalizeDirection(dir) {
  if (dir === 'up') return { x: 0, y: -1, id: 'up' };
  if (dir === 'down') return { x: 0, y: 1, id: 'down' };
  if (dir === 'left') return { x: -1, y: 0, id: 'left' };
  return { x: 1, y: 0, id: 'right' };
}

function snakeSameDirection(a, b) {
  return !!a && !!b && Number(a.x || 0) === Number(b.x || 0) && Number(a.y || 0) === Number(b.y || 0);
}

function snakeOppositeDirection(a, b) {
  return !!a && !!b && (Number(a.x || 0) + Number(b.x || 0) === 0) && (Number(a.y || 0) + Number(b.y || 0) === 0);
}

function snakeSetDirection(dir) {
  const state = app.gamesSnake;
  if (!state || state.over) return;
  const next = snakeNormalizeDirection(dir);
  if (!Array.isArray(state.queue)) state.queue = [];
  const reference = state.queue.length ? state.queue[state.queue.length - 1] : state.dir;
  if (snakeSameDirection(reference, next) || snakeOppositeDirection(reference, next)) return;
  if (state.queue.length >= 3) state.queue.shift();
  state.queue.push({ x: next.x, y: next.y });
  state.lastTurnAt = Date.now();
  snakeTryVibrate(6);
  if (!state.timer) snakeStart();
}

function snakeRecordEnd(state) {
  if (!state || state.recorded) return;
  state.recorded = true;
  const account = gamesGetActiveAccount();
  gamesRecordStat('snake', {
    completed: true,
    plays: (account?.stats?.snake?.plays || 0) + 1,
    bestScore: Math.max(account?.stats?.snake?.bestScore || 0, state.score),
    bestLength: Math.max(account?.stats?.snake?.bestLength || 0, state.snake.length)
  });
}

function snakeEndGame(state) {
  if (!state) return;
  state.over = true;
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
  snakeRecordEnd(state);
  snakeTryVibrate([20, 35, 20]);
  snakeUpdateUi();
}

function snakeTick() {
  const state = app.gamesSnake;
  if (!state || state.over) return;
  if (Array.isArray(state.queue) && state.queue.length) {
    state.dir = state.queue.shift();
  }
  const size = Number(state.size || 18);
  const currentHead = state.snake && state.snake[0] ? state.snake[0] : { x: 0, y: 0 };
  const head = {
    x: (currentHead.x + state.dir.x + size) % size,
    y: (currentHead.y + state.dir.y + size) % size
  };
  const willEat = !!state.food && head.x === state.food.x && head.y === state.food.y;
  const collisionBody = willEat ? state.snake : state.snake.slice(0, -1);
  if (collisionBody.some(p => p.x === head.x && p.y === head.y)) {
    snakeEndGame(state);
    return;
  }
  state.snake.unshift(head);
  if (willEat) {
    state.score += 1;
    state.lastAteAt = Date.now();
    snakeTryVibrate(12);
    snakePlaceFood(state);
    if (state.over) {
      snakeEndGame(state);
      return;
    }
  } else {
    state.snake.pop();
  }
  state.lastTickAt = Date.now();
  snakeUpdateUi();
}

function snakeStart() {
  const state = app.gamesSnake || (app.gamesSnake = snakeDefaultState());
  if (state.over) return;
  if (state.timer) clearInterval(state.timer);
  state.timer = setInterval(snakeTick, Number(state.speedMs || 154));
}

// ---- Flappy Car ----
function flapDefaultState() {
  return {
    y: 0,
    v: 0,
    gravity: 0.36,
    lift: -6.9,
    pipes: [],
    score: 0,
    best: 0,
    over: false,
    completedRecorded: false,
    timer: null,
    frame: 0,
    started: false,
    lastTs: 0,
    nextPipeAt: 0,
    dpr: 1,
    canvasW: 0,
    canvasH: 0,
    lastTapAt: 0,
    refs: null
  };
}

function flapResetState(state) {
  state.y = 0;
  state.v = 0;
  state.pipes = [];
  state.score = 0;
  state.over = false;
  state.completedRecorded = false;
  state.frame = 0;
  state.started = false;
  state.lastTs = 0;
  state.nextPipeAt = 0;
  state.lastTapAt = 0;
  if (state.refs && state.refs.overlay) state.refs.overlay.hidden = false;
}

function flapCssVar(name, fallback) {
  try {
    const rootStyle = getComputedStyle(document.documentElement);
    const bodyStyle = getComputedStyle(document.body);
    return String((rootStyle.getPropertyValue(name) || bodyStyle.getPropertyValue(name) || fallback || '')).trim() || fallback;
  } catch (_) {
    return fallback;
  }
}

function flapColorAlpha(color, alpha) {
  const raw = String(color || '').trim();
  const a = Math.max(0, Math.min(1, Number(alpha)));
  const hex = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }
  const rgb = raw.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const parts = rgb[1].split(',').map(x => x.trim()).slice(0, 3);
    return 'rgba(' + parts.join(',') + ',' + a + ')';
  }
  return raw || 'rgba(124,255,124,' + a + ')';
}

function flapThemeColors() {
  return {
    bg: flapCssVar('--rakBgBase', '#050816'),
    panel: flapCssVar('--panel', 'rgba(12,18,28,.72)'),
    panel2: flapCssVar('--panel2', 'rgba(18,28,38,.66)'),
    accent: flapCssVar('--green', '#7CFF7C'),
    accent2: flapCssVar('--green2', '#B7FFBE'),
    soft: flapCssVar('--soft', '#e7fff0'),
    glow: flapCssVar('--rakThemeGlow', 'rgba(124,255,124,.28)'),
    border: flapCssVar('--rakThemeBorder', 'rgba(124,255,124,.22)')
  };
}

function flapSyncCanvas(state, force) {
  const refs = state.refs;
  const canvas = refs && refs.canvas;
  if (!canvas) return { width: 0, height: 0 };
  const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : canvas.getBoundingClientRect();
  const width = Math.max(290, Math.floor(rect.width || canvas.clientWidth || 300));
  const height = Math.max(250, Math.floor(rect.height || canvas.clientHeight || 260));
  const dprMax = typeof window.getRakPerformanceDprMax === 'function' ? window.getRakPerformanceDprMax() : 2;
  const dpr = Math.max(1, Math.min(dprMax, window.devicePixelRatio || 1));
  if (force || width !== state.canvasW || height !== state.canvasH || dpr !== state.dpr) {
    state.canvasW = width;
    state.canvasH = height;
    state.dpr = dpr;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!state.started && !state.over && !state.y) state.y = height * 0.46;
    state.y = Math.max(20, Math.min(height - 34, state.y || height * 0.46));
  }
  return { width: state.canvasW, height: state.canvasH };
}

function flapDrawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r || 0, Math.min(w, h) / 2));
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
}

function flapDraw(state) {
  const refs = state.refs || {};
  const canvas = refs.canvas;
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  if (!ctx) return;
  const width = state.canvasW || canvas.clientWidth || 320;
  const height = state.canvasH || canvas.clientHeight || 280;
  const colors = flapThemeColors();
  const gateWidth = Math.max(28, Math.round(width * 0.082));
  const gap = Math.max(126, Math.min(176, Math.round(height * 0.31)));
  const carX = Math.round(width * 0.22);
  const carH = Math.max(17, Math.round(Math.min(width, height) * 0.062));
  const carW = Math.max(31, Math.round(carH * 1.72));
  const floorH = Math.max(16, Math.round(height * 0.055));
  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, flapColorAlpha(colors.accent, 0.24));
  bg.addColorStop(0.45, flapColorAlpha(colors.panel2, 0.78));
  bg.addColorStop(1, flapColorAlpha(colors.bg, 0.98));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = flapColorAlpha(colors.soft, 0.055);
  for (let i = 0; i < 5; i += 1) {
    const px = (i * 93 + state.frame * 0.18) % (width + 70) - 35;
    const py = 24 + (i % 3) * 26;
    ctx.beginPath();
    ctx.ellipse(px, py, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const roadY = height - floorH;
  ctx.fillStyle = flapColorAlpha('#000000', 0.18);
  ctx.fillRect(0, roadY, width, floorH);
  ctx.strokeStyle = flapColorAlpha(colors.soft, 0.10);
  ctx.lineWidth = 1;
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(0, roadY + floorH * 0.46);
  ctx.lineTo(width, roadY + floorH * 0.46);
  ctx.stroke();
  ctx.setLineDash([]);

  state.pipes.forEach((gate) => {
    const topH = gate.gapY;
    const bottomY = gate.gapY + gap;
    const x = gate.x;
    const grdTop = ctx.createLinearGradient(x, 0, x + gateWidth, 0);
    grdTop.addColorStop(0, flapColorAlpha(colors.accent, 0.18));
    grdTop.addColorStop(0.55, flapColorAlpha(colors.accent, 0.58));
    grdTop.addColorStop(1, flapColorAlpha(colors.accent2, 0.26));
    ctx.fillStyle = grdTop;
    ctx.strokeStyle = flapColorAlpha(colors.soft, 0.20);
    ctx.lineWidth = 1;
    flapDrawRoundedRect(ctx, x, -10, gateWidth, topH + 10, Math.max(9, gateWidth * 0.32));
    ctx.fill();
    ctx.stroke();
    const grdBot = ctx.createLinearGradient(x, bottomY, x + gateWidth, bottomY);
    grdBot.addColorStop(0, flapColorAlpha(colors.accent, 0.16));
    grdBot.addColorStop(0.55, flapColorAlpha(colors.accent, 0.58));
    grdBot.addColorStop(1, flapColorAlpha(colors.accent2, 0.24));
    ctx.fillStyle = grdBot;
    flapDrawRoundedRect(ctx, x, bottomY, gateWidth, Math.max(0, roadY - bottomY + 10), Math.max(9, gateWidth * 0.32));
    ctx.fill();
    ctx.stroke();
  });

  const carY = state.y;
  const glow = ctx.createRadialGradient(carX + carW * 0.52, carY + carH * 0.52, 3, carX + carW * 0.52, carY + carH * 0.52, carW * 1.4);
  glow.addColorStop(0, flapColorAlpha(colors.accent, 0.34));
  glow.addColorStop(1, flapColorAlpha(colors.accent, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(carX + carW * 0.52, carY + carH * 0.52, carW * 1.35, 0, Math.PI * 2);
  ctx.fill();

  const bodyGradient = ctx.createLinearGradient(carX, carY, carX + carW, carY + carH);
  bodyGradient.addColorStop(0, flapColorAlpha(colors.accent2, 0.96));
  bodyGradient.addColorStop(0.55, flapColorAlpha(colors.accent, 0.92));
  bodyGradient.addColorStop(1, flapColorAlpha(colors.bg, 0.78));
  ctx.fillStyle = bodyGradient;
  flapDrawRoundedRect(ctx, carX, carY + carH * 0.18, carW, carH * 0.68, Math.max(7, carH * 0.34));
  ctx.fill();
  ctx.fillStyle = flapColorAlpha(colors.soft, 0.20);
  flapDrawRoundedRect(ctx, carX + carW * 0.28, carY, carW * 0.36, carH * 0.42, Math.max(5, carH * 0.26));
  ctx.fill();
  ctx.fillStyle = flapColorAlpha('#020617', 0.86);
  ctx.beginPath();
  ctx.arc(carX + carW * 0.26, carY + carH * 0.88, Math.max(2.5, carH * 0.16), 0, Math.PI * 2);
  ctx.arc(carX + carW * 0.74, carY + carH * 0.88, Math.max(2.5, carH * 0.16), 0, Math.PI * 2);
  ctx.fill();
}

function flapSetOverlay(state) {
  if (!state.refs || !state.refs.overlay) return;
  const overlay = state.refs.overlay;
  if (state.started && !state.over) {
    overlay.hidden = true;
    overlay.dataset.flapOverlayKey = 'hidden';
    return;
  }
  overlay.hidden = false;
  const title = state.over ? 'Konec jízdy' : 'Klepni a letíš';
  overlay.classList.toggle('isGameOver', !!state.over);
  overlay.classList.toggle('isStartHint', !state.started && !state.over);
  const desc = state.over ? ('Score ' + String(state.score || 0) + ' · dokončená jízda') : 'Drž rytmus klepáním do plochy.';
  const key = (state.over ? 'over:' : 'start:') + String(state.score || 0) + ':' + String(state.best || 0);
  // v.1.1 (715): nepřekreslovat overlay v každém frame. Staré chování ničilo tlačítko mezi pointerdown/click,
  // takže po konci Flappy Car blokovalo kliky mimo kartu a Nová hra často nereagovala.
  if (overlay.dataset.flapOverlayKey === key) return;
  overlay.dataset.flapOverlayKey = key;
  overlay.innerHTML = state.over
    ? '<div class="flapOverlayCard"><strong>' + escapeHtml(title) + '</strong><span>' + escapeHtml(desc) + '</span><button type="button" class="gameControlBtn" id="flapOverlayNewBtn">Nová hra</button></div>'
    : '<div class="flapOverlayCard"><strong>' + escapeHtml(title) + '</strong><span>' + escapeHtml(desc) + '</span></div>';
}

function flapUpdateScoreUI(state) {
  if (!state.refs) return;
  if (state.refs.scoreEl) state.refs.scoreEl.textContent = String(state.score);
  if (state.refs.bestEl) state.refs.bestEl.textContent = String(Math.max(state.best || 0, gamesGetActiveAccount()?.stats?.flap?.bestScore || 0));
  if (state.refs.statusEl) state.refs.statusEl.textContent = state.over ? 'Konec' : (state.started ? 'Jízda' : 'Start');
  flapSetOverlay(state);
}

function flapRecordCompleted(state) {
  if (!state || state.completedRecorded) return;
  state.completedRecorded = true;
  const account = gamesGetActiveAccount();
  gamesRecordStat('flap', {
    completed: true,
    plays: (account?.stats?.flap?.plays || 0) + 1,
    bestScore: Math.max(account?.stats?.flap?.bestScore || 0, state.score),
    bestPipes: Math.max(account?.stats?.flap?.bestPipes || 0, state.score)
  });
}

function flapEnsureLoop(state) {
  if (state.timer) return;
  const loop = (ts) => {
    state.timer = requestAnimationFrame(loop);
    if (!state.refs || !state.refs.canvas) return;
    const size = flapSyncCanvas(state);
    if (!size.width || !size.height) return;
    const now = ts || performance.now();
    if (!state.lastTs) state.lastTs = now;
    const dt = Math.min(2.0, Math.max(0.45, (now - state.lastTs) / 16.666));
    state.lastTs = now;
    const gateWidth = Math.max(28, Math.round(size.width * 0.082));
    const gap = Math.max(126, Math.min(176, Math.round(size.height * 0.31)));
    const carX = Math.round(size.width * 0.22);
    const carH = Math.max(17, Math.round(Math.min(size.width, size.height) * 0.062));
    const carW = Math.max(31, Math.round(carH * 1.72));
    const floorH = Math.max(16, Math.round(size.height * 0.055));
    const roadY = size.height - floorH;
    const speed = Math.max(2.15, size.width * 0.0042) + Math.min(1.05, state.score * 0.018);
    if (state.started && !state.over) {
      state.frame += 1;
      state.v += state.gravity * dt;
      state.y += state.v * dt;
      if (!state.nextPipeAt) state.nextPipeAt = now + 780;
      if (now >= state.nextPipeAt) {
        const margin = Math.max(30, Math.round(size.height * 0.105));
        const gapMin = margin;
        const gapMax = Math.max(gapMin + 10, roadY - gap - margin);
        const gapY = Math.max(gapMin, Math.min(gapMax, Math.floor(margin + Math.random() * Math.max(20, gapMax - gapMin))));
        state.pipes.push({ x: size.width + 12, gapY, passed: false });
        state.nextPipeAt = now + Math.max(1040, 1360 - Math.min(330, state.score * 9));
      }
      state.pipes.forEach((gate) => {
        gate.x -= speed * dt;
        if (!gate.passed && gate.x + gateWidth < carX) {
          gate.passed = true;
          state.score += 1;
          state.best = Math.max(state.best || 0, state.score);
        }
      });
      state.pipes = state.pipes.filter((gate) => gate.x > -gateWidth - 12);
      if (state.y < 2) {
        state.y = 2;
        state.v = Math.max(0, state.v * 0.35);
      }
      if (state.y > roadY - carH) state.over = true;
      const carTop = state.y;
      const carBottom = state.y + carH * 0.86;
      const carLeft = carX + carW * 0.08;
      const carRight = carX + carW * 0.92;
      for (const gate of state.pipes) {
        const withinX = carRight > gate.x && carLeft < gate.x + gateWidth;
        if (withinX && (carTop < gate.gapY || carBottom > gate.gapY + gap)) {
          state.over = true;
          break;
        }
      }
      if (state.over) flapRecordCompleted(state);
    }
    flapDraw(state);
    flapUpdateScoreUI(state);
  };
  state.timer = requestAnimationFrame(loop);
}

function flapTap() {
  const state = app.gamesFlap;
  if (!state) return;
  const now = Date.now();
  if (now - Number(state.lastTapAt || 0) < 65) return;
  state.lastTapAt = now;
  if (state.over) {
    flapResetState(state);
    if (state.refs) {
      flapSyncCanvas(state, true);
      state.y = Math.max(20, Math.min((state.canvasH || 280) - 34, (state.canvasH || 280) * 0.46));
    }
  }
  state.started = true;
  state.v = state.lift;
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(8); } catch (_) {}
  }
  if (!state.timer) flapEnsureLoop(state);
  flapUpdateScoreUI(state);
}

function renderGameFlap() {
  const body = document.getElementById('gamesShellBody');
  if (!body) return;
  const state = app.gamesFlap || (app.gamesFlap = flapDefaultState());
  const fit = gamesFitFlapSize();
  const currentBest = Math.max(state.best || 0, gamesGetActiveAccount()?.stats?.flap?.bestScore || 0);
  state.best = currentBest;
  body.innerHTML = [
    '<div class="gamesGamePanel gameFlapPanel">',
    '  <div class="game2048Hud gameFlapHud">',
    '    <div class="game2048ScoreCard"><span>Score</span><strong id="flapScore">' + String(state.score || 0) + '</strong></div>',
    '    <div class="game2048ScoreCard"><span>Nejlepší</span><strong id="flapBest">' + String(currentBest || 0) + '</strong></div>',
    '    <div class="game2048ScoreCard"><span>Stav</span><strong id="flapStatus">' + (state.over ? 'Konec' : (state.started ? 'Jízda' : 'Start')) + '</strong></div>',
    '  </div>',
    '  <div class="gameFlapBoardWrap">',
    '    <div class="gameBoard gameFlapBoard" id="gameFlapBoard" style="width:' + fit.width + 'px;height:' + fit.height + 'px;">',
    '      <canvas id="flapCanvas" class="gameFlapCanvas" aria-label="Flappy Car"></canvas>',
    '      <div class="flapOverlay" id="flapOverlay"></div>',
    '    </div>',
    '  </div>',
    gamesTop3Block('flap', 'bodů', 10),
    '</div>'
  ].join('');
  state.refs = {
    board: body.querySelector('#gameFlapBoard'),
    canvas: body.querySelector('#flapCanvas'),
    overlay: body.querySelector('#flapOverlay'),
    scoreEl: body.querySelector('#flapScore'),
    statusEl: body.querySelector('#flapStatus'),
    bestEl: body.querySelector('#flapBest'),
    restartBtn: body.querySelector('#flapOverlayNewBtn')
  };
  if (state.refs.board) {
    state.refs.board.style.setProperty('width', fit.width + 'px', 'important');
    state.refs.board.style.setProperty('height', fit.height + 'px', 'important');
  }
  flapSyncCanvas(state, true);
  if (!state.y) state.y = Math.max(20, Math.min((state.canvasH || fit.height) - 34, (state.canvasH || fit.height) * 0.46));
  flapUpdateScoreUI(state);
  flapEnsureLoop(state);
  const tapTarget = state.refs.board || state.refs.canvas;
  if (tapTarget) {
    tapTarget.addEventListener('pointerdown', (ev) => {
      if (ev.target && ev.target.closest && ev.target.closest('#flapOverlayNewBtn')) return;
      if (state.over) return;
      ev.preventDefault();
      flapTap();
    }, { passive: false });
  }
  if (state.refs.overlay && !state.refs.overlay.dataset.restartBound) {
    state.refs.overlay.dataset.restartBound = '1';
    const restartFlapFromOverlay = (ev) => {
      const btn = ev.target && ev.target.closest ? ev.target.closest('#flapOverlayNewBtn') : null;
      if (!btn) return;
      ev.preventDefault();
      ev.stopPropagation();
      flapResetState(state);
      flapSyncCanvas(state, true);
      state.y = Math.max(20, Math.min((state.canvasH || fit.height) - 34, (state.canvasH || fit.height) * 0.46));
      flapUpdateScoreUI(state);
      flapDraw(state);
    };
    state.refs.overlay.addEventListener('pointerdown', restartFlapFromOverlay, { passive: false });
    state.refs.overlay.addEventListener('click', restartFlapFromOverlay);
  }
}

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



const RAK_THEME_STORAGE_KEY = APP_KEY + ':theme_v1';
const RAK_THEME_BASE_VARS = {
  '--bg': '#0b0f0c',
  '--panel': '#151a17',
  '--panel2': '#1c1f1d',
  '--green': '#4CAF50',
  '--green2': '#7CFF7C',
  '--text': '#ffffff',
  '--muted': '#777',
  '--soft': '#ccc'
};
const RAK_THEME_DEFS = [
  { id: 'default', label: 'RaK glass', subtitle: 'Základní zelený glass styl', color: '#7CFF7C', unlockText: 'Vždy dostupné', minPlays: 0, minAchievements: 0, vars: { '--bg': '#07100b', '--panel': 'rgba(18,28,22,.72)', '--panel2': 'rgba(24,36,28,.68)', '--green': '#4ADE80', '--green2': '#B7FFBE', '--muted': '#91a396', '--soft': '#e5f7e9', '--rakThemeGlow': 'rgba(124,255,124,.30)', '--rakThemeBorder': 'rgba(124,255,124,.20)' } },
  { id: 'emerald-pro', label: 'Emerald Pro', subtitle: 'Sytá zelená, výraznější aktivní prvky', color: '#00FF88', unlockText: '10 her + 2 achievementy', minPlays: 10, minAchievements: 2, vars: { '--bg': '#02110b', '--panel': 'rgba(5,40,26,.76)', '--panel2': 'rgba(10,64,42,.68)', '--green': '#00FF88', '--green2': '#B6FFD8', '--muted': '#8bc2a6', '--soft': '#e8fff2', '--rakThemeGlow': 'rgba(0,255,136,.36)', '--rakThemeBorder': 'rgba(0,255,136,.28)' } },
  { id: 'midnight-blue', label: 'Midnight Blue', subtitle: 'Modrý OLED kontrast s chladným glow', color: '#38BDF8', unlockText: '20 her + 4 achievementy', minPlays: 20, minAchievements: 4, vars: { '--bg': '#020617', '--panel': 'rgba(9,22,49,.78)', '--panel2': 'rgba(18,39,82,.68)', '--green': '#38BDF8', '--green2': '#BAE6FD', '--muted': '#90a9c4', '--soft': '#e8f5ff', '--rakThemeGlow': 'rgba(56,189,248,.38)', '--rakThemeBorder': 'rgba(56,189,248,.28)' } },
  { id: 'cyber-cyan', label: 'Cyber Cyan', subtitle: 'Tyrkysový neon s ostrým futuristickým akcentem', color: '#00F5FF', unlockText: '35 her + 6 achievementů', minPlays: 35, minAchievements: 6, vars: { '--bg': '#001217', '--panel': 'rgba(0,35,45,.78)', '--panel2': 'rgba(0,68,78,.62)', '--green': '#00F5FF', '--green2': '#B8FEFF', '--muted': '#8fc8cf', '--soft': '#e8ffff', '--rakThemeGlow': 'rgba(0,245,255,.42)', '--rakThemeBorder': 'rgba(0,245,255,.30)' } },
  { id: 'violet-pulse', label: 'Violet Pulse', subtitle: 'Fialovo-růžový neon, hodně viditelná změna UI', color: '#D946EF', unlockText: '50 her + 8 achievementů', minPlays: 50, minAchievements: 8, vars: { '--bg': '#12061b', '--panel': 'rgba(45,16,65,.78)', '--panel2': 'rgba(72,23,96,.66)', '--green': '#D946EF', '--green2': '#F5D0FE', '--muted': '#c39acb', '--soft': '#faeaff', '--rakThemeGlow': 'rgba(217,70,239,.40)', '--rakThemeBorder': 'rgba(217,70,239,.30)' } },
  { id: 'crimson-alert', label: 'Crimson Alert', subtitle: 'Červený sportovní skin s výrazným glow', color: '#FF3B3B', unlockText: '65 her + 10 achievementů', minPlays: 65, minAchievements: 10, vars: { '--bg': '#150608', '--panel': 'rgba(55,12,18,.78)', '--panel2': 'rgba(82,18,26,.66)', '--green': '#FF3B3B', '--green2': '#FFC9C9', '--muted': '#c99a9d', '--soft': '#fff0f0', '--rakThemeGlow': 'rgba(255,59,59,.42)', '--rakThemeBorder': 'rgba(255,59,59,.32)' } },
  { id: 'sunset-plasma', label: 'Sunset Plasma', subtitle: 'Oranžovo-růžový teplý glass', color: '#FB923C', unlockText: '80 her + 12 achievementů', minPlays: 80, minAchievements: 12, vars: { '--bg': '#17090a', '--panel': 'rgba(65,28,18,.76)', '--panel2': 'rgba(92,38,24,.64)', '--green': '#FB923C', '--green2': '#FED7AA', '--muted': '#c7a28f', '--soft': '#fff4e8', '--rakThemeGlow': 'rgba(251,146,60,.40)', '--rakThemeBorder': 'rgba(251,146,60,.30)' } },
  { id: 'graphite', label: 'Titanium Graphite', subtitle: 'Prémiově šedý dark mód bez barevného cirkusu', color: '#CBD5E1', unlockText: '100 her + 14 achievementů', minPlays: 100, minAchievements: 14, vars: { '--bg': '#05070a', '--panel': 'rgba(17,24,39,.78)', '--panel2': 'rgba(31,41,55,.66)', '--green': '#CBD5E1', '--green2': '#F8FAFC', '--muted': '#a7b0bd', '--soft': '#edf2f7', '--rakThemeGlow': 'rgba(203,213,225,.28)', '--rakThemeBorder': 'rgba(203,213,225,.22)' } },
  { id: 'ice-prism', label: 'Ice Prism', subtitle: 'Ledově světlý cyan/teal akcent', color: '#99F6E4', unlockText: '120 her + 16 achievementů', minPlays: 120, minAchievements: 16, vars: { '--bg': '#011011', '--panel': 'rgba(10,49,59,.74)', '--panel2': 'rgba(17,90,92,.58)', '--green': '#99F6E4', '--green2': '#CCFBF1', '--muted': '#9ec5c3', '--soft': '#edfffb', '--rakThemeGlow': 'rgba(153,246,228,.38)', '--rakThemeBorder': 'rgba(153,246,228,.30)' } },
  { id: 'toxic-lime', label: 'Toxic Lime', subtitle: 'Fosforová limetka pro maximální arcade vibe', color: '#C6FF00', unlockText: '145 her + 18 achievementů', minPlays: 145, minAchievements: 18, vars: { '--bg': '#071100', '--panel': 'rgba(25,45,4,.78)', '--panel2': 'rgba(46,72,8,.64)', '--green': '#C6FF00', '--green2': '#F1FFB3', '--muted': '#b6c98f', '--soft': '#fbffe6', '--rakThemeGlow': 'rgba(198,255,0,.42)', '--rakThemeBorder': 'rgba(198,255,0,.32)' } },
  { id: 'royal-gold', label: 'Royal Gold', subtitle: 'Zlatý achievement skin pro dlouhodobé hraní', color: '#FACC15', unlockText: '170 her + 20 achievementů', minPlays: 170, minAchievements: 20, vars: { '--bg': '#130d02', '--panel': 'rgba(54,38,5,.78)', '--panel2': 'rgba(84,58,8,.66)', '--green': '#FACC15', '--green2': '#FEF3C7', '--muted': '#c7b78a', '--soft': '#fff8dc', '--rakThemeGlow': 'rgba(250,204,21,.40)', '--rakThemeBorder': 'rgba(250,204,21,.32)' } },
  { id: 'amoled-legend', label: 'AMOLED Legend', subtitle: 'Skoro černá, ostrý neon, odměna pro největší grind', color: '#B8FF67', unlockText: '200 her + 22 achievementů', minPlays: 200, minAchievements: 22, vars: { '--bg': '#000000', '--panel': 'rgba(5,8,6,.86)', '--panel2': 'rgba(10,16,11,.74)', '--green': '#B8FF67', '--green2': '#ECFCCB', '--muted': '#939c91', '--soft': '#f4ffe9', '--rakThemeGlow': 'rgba(184,255,103,.45)', '--rakThemeBorder': 'rgba(184,255,103,.34)' } },
  { id: 'hyper-magenta', label: 'Hyper Magenta', subtitle: 'Hodně sytý růžovo-fialový arcade skin', color: '#FF00E5', unlockText: 'Rank Mistr nebo 28 achievementů', minRank: 'Mistr', minAchievements: 28, vars: { '--bg': '#16001f', '--panel': 'rgba(64,0,82,.82)', '--panel2': 'rgba(110,0,135,.66)', '--green': '#FF00E5', '--green2': '#FFD1FA', '--muted': '#d89de0', '--soft': '#fff0ff', '--rakThemeGlow': 'rgba(255,0,229,.54)', '--rakThemeBorder': 'rgba(255,0,229,.38)' } },
  { id: 'acid-cyber', label: 'Acid Cyber', subtitle: 'Kyselá limetka a cyan, opravdu výrazné UI', color: '#D7FF00', unlockText: 'Rank Senior nebo 34 achievementů', minRank: 'Senior', minAchievements: 34, vars: { '--bg': '#050a00', '--panel': 'rgba(25,44,0,.86)', '--panel2': 'rgba(50,82,0,.72)', '--green': '#D7FF00', '--green2': '#F5FF9E', '--muted': '#c8d889', '--soft': '#fdffe8', '--rakThemeGlow': 'rgba(215,255,0,.56)', '--rakThemeBorder': 'rgba(215,255,0,.40)' } },
  { id: 'lava-core', label: 'Lava Core', subtitle: 'Sytá červená a oranžová jako herní reward', color: '#FF2D00', unlockText: 'Rank Legenda RaK nebo 42 achievementů', minRank: 'Legenda RaK', minAchievements: 42, vars: { '--bg': '#180200', '--panel': 'rgba(70,11,0,.86)', '--panel2': 'rgba(124,23,0,.72)', '--green': '#FF2D00', '--green2': '#FFD3C7', '--muted': '#d8a192', '--soft': '#fff1ed', '--rakThemeGlow': 'rgba(255,45,0,.58)', '--rakThemeBorder': 'rgba(255,45,0,.42)' } },
  { id: 'ultra-violet', label: 'Ultra Violet', subtitle: 'Sytá ultrafialová odměna pro dlouhé hraní', color: '#7C3AED', unlockText: 'Rank RaK nesmrtelný nebo 55 achievementů', minRank: 'RaK nesmrtelný', minAchievements: 55, vars: { '--bg': '#090021', '--panel': 'rgba(35,10,88,.88)', '--panel2': 'rgba(62,22,150,.72)', '--green': '#7C3AED', '--green2': '#DDD6FE', '--muted': '#b7a6da', '--soft': '#f4f0ff', '--rakThemeGlow': 'rgba(124,58,237,.60)', '--rakThemeBorder': 'rgba(124,58,237,.44)' } }
];
window.RAK_THEME_DEFS = RAK_THEME_DEFS;

const RAK_BACKGROUND_STORAGE_KEY = APP_KEY + ':background_v1';
const RAK_BACKGROUND_BASE_VARS = {
  '--rakBgBase': '#050816',
  '--rakAppBackground': 'radial-gradient(circle at 16% 10%, rgba(56,189,248,.24), transparent 32%), radial-gradient(circle at 84% 18%, rgba(168,85,247,.20), transparent 35%), radial-gradient(circle at 52% 86%, rgba(20,184,166,.16), transparent 38%), linear-gradient(160deg, #050816 0%, #08111f 46%, #0f172a 100%)',
  '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(4,8,18,.40), transparent 26%, rgba(255,255,255,.035) 50%, transparent 74%, rgba(4,8,18,.40)), radial-gradient(circle at 48% 44%, rgba(255,255,255,.055), transparent 44%)',
  '--rakAppBackgroundLite': 'linear-gradient(160deg, #050816 0%, #08111f 52%, #0f172a 100%)',
  '--rakBgAccent': 'rgba(56,189,248,.24)'
};
const RAK_BACKGROUND_DEFS = [
  {
    id: 'ios-mesh',
    label: 'iOS mesh',
    subtitle: 'Tmavé modro-fialové pozadí pro glass',
    color: '#38bdf8',
    swatch: 'radial-gradient(circle at 18% 18%, rgba(56,189,248,.95), transparent 34%), radial-gradient(circle at 82% 22%, rgba(168,85,247,.80), transparent 36%), radial-gradient(circle at 48% 82%, rgba(20,184,166,.70), transparent 40%), linear-gradient(145deg, #050816, #0f172a)',
    vars: {
      '--rakBgBase': '#050816',
      '--rakAppBackground': 'radial-gradient(circle at 15% 10%, rgba(56,189,248,.24), transparent 32%), radial-gradient(circle at 84% 17%, rgba(168,85,247,.20), transparent 34%), radial-gradient(circle at 52% 86%, rgba(20,184,166,.16), transparent 38%), linear-gradient(160deg, #050816 0%, #08111f 45%, #0f172a 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(4,8,18,.42), transparent 25%, rgba(255,255,255,.035) 50%, transparent 75%, rgba(4,8,18,.42)), radial-gradient(circle at 46% 42%, rgba(255,255,255,.055), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #050816 0%, #08111f 52%, #0f172a 100%)',
      '--rakBgAccent': 'rgba(56,189,248,.24)'
    }
  },
  {
    id: 'skoda-green',
    label: 'Škoda glass',
    subtitle: 'Emerald + Electric green',
    color: '#78FAAE',
    swatch: 'radial-gradient(circle at 18% 18%, rgba(120,250,174,.95), transparent 34%), radial-gradient(circle at 78% 18%, rgba(14,58,47,.96), transparent 42%), radial-gradient(circle at 55% 86%, rgba(63,215,142,.72), transparent 42%), linear-gradient(145deg, #04100d, #0E3A2F)',
    vars: {
      '--rakBgBase': '#04100d',
      '--rakAppBackground': 'radial-gradient(circle at 14% 12%, rgba(120,250,174,.26), transparent 32%), radial-gradient(circle at 86% 18%, rgba(14,58,47,.72), transparent 38%), radial-gradient(circle at 55% 86%, rgba(38,208,132,.18), transparent 42%), linear-gradient(160deg, #030a08 0%, #082019 48%, #0E3A2F 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(3,10,8,.48), transparent 26%, rgba(120,250,174,.040) 50%, transparent 74%, rgba(3,10,8,.48)), radial-gradient(circle at 48% 42%, rgba(120,250,174,.070), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #030a08 0%, #082019 55%, #0E3A2F 100%)',
      '--rakBgAccent': 'rgba(120,250,174,.26)',
      '--green': '#78FAAE',
      '--green2': '#B9FFD6'
    }
  },
  {
    id: 'light-green',
    label: 'Světle zelená',
    subtitle: 'Jemné světlé green glass pozadí',
    color: '#A7FFB0',
    swatch: 'radial-gradient(circle at 18% 20%, rgba(180,255,187,.98), transparent 34%), radial-gradient(circle at 80% 24%, rgba(80,230,145,.78), transparent 36%), radial-gradient(circle at 50% 86%, rgba(125,255,205,.62), transparent 42%), linear-gradient(145deg, #06130b, #11351d)',
    vars: {
      '--rakBgBase': '#06130b',
      '--rakAppBackground': 'radial-gradient(circle at 16% 12%, rgba(180,255,187,.24), transparent 32%), radial-gradient(circle at 84% 20%, rgba(88,230,148,.18), transparent 35%), radial-gradient(circle at 52% 86%, rgba(125,255,205,.15), transparent 42%), linear-gradient(160deg, #041008 0%, #0c2815 48%, #11351d 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(3,10,5,.44), transparent 27%, rgba(180,255,187,.040) 50%, transparent 73%, rgba(3,10,5,.44)), radial-gradient(circle at 45% 42%, rgba(180,255,187,.060), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #041008 0%, #0c2815 55%, #11351d 100%)',
      '--rakBgAccent': 'rgba(180,255,187,.24)',
      '--green': '#A7FFB0',
      '--green2': '#D7FFDB'
    }
  },
  {
    id: 'deep-aurora',
    label: 'Deep aurora',
    subtitle: 'Tyrkys + modrá pro výrazný glass',
    color: '#22d3ee',
    swatch: 'radial-gradient(circle at 20% 18%, rgba(34,211,238,.90), transparent 34%), radial-gradient(circle at 80% 20%, rgba(37,99,235,.80), transparent 38%), radial-gradient(circle at 52% 86%, rgba(14,165,233,.58), transparent 42%), linear-gradient(145deg, #03121d, #061826)',
    vars: {
      '--rakBgBase': '#03121d',
      '--rakAppBackground': 'radial-gradient(circle at 16% 12%, rgba(34,211,238,.22), transparent 32%), radial-gradient(circle at 86% 18%, rgba(37,99,235,.22), transparent 36%), radial-gradient(circle at 52% 86%, rgba(14,165,233,.15), transparent 42%), linear-gradient(160deg, #020912 0%, #061826 48%, #0b1326 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(2,9,18,.46), transparent 26%, rgba(34,211,238,.035) 50%, transparent 74%, rgba(2,9,18,.46)), radial-gradient(circle at 45% 42%, rgba(255,255,255,.045), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #020912 0%, #061826 55%, #0b1326 100%)',
      '--rakBgAccent': 'rgba(34,211,238,.22)'
    }
  },
  {
    id: 'ember',
    label: 'Ember glass',
    subtitle: 'Teplejší oranžovo-fialový kontrast',
    color: '#fb923c',
    swatch: 'radial-gradient(circle at 22% 76%, rgba(251,146,60,.92), transparent 34%), radial-gradient(circle at 76% 24%, rgba(190,24,93,.70), transparent 38%), radial-gradient(circle at 36% 18%, rgba(124,58,237,.56), transparent 40%), linear-gradient(145deg, #14070d, #260b12)',
    vars: {
      '--rakBgBase': '#14070d',
      '--rakAppBackground': 'radial-gradient(circle at 22% 76%, rgba(251,146,60,.22), transparent 34%), radial-gradient(circle at 78% 18%, rgba(190,24,93,.18), transparent 36%), radial-gradient(circle at 36% 18%, rgba(124,58,237,.14), transparent 40%), linear-gradient(160deg, #09050b 0%, #1a0710 48%, #26100b 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(9,5,11,.48), transparent 27%, rgba(251,146,60,.035) 50%, transparent 73%, rgba(9,5,11,.48)), radial-gradient(circle at 45% 42%, rgba(255,255,255,.040), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #09050b 0%, #1a0710 55%, #26100b 100%)',
      '--rakBgAccent': 'rgba(251,146,60,.22)'
    }
  },
  {
    id: 'neon-lagoon',
    label: 'Neon lagoon',
    subtitle: 'Výrazný tyrkys, fialová a teplý glow',
    color: '#22d3ee',
    swatch: 'radial-gradient(circle at 18% 18%, rgba(34,211,238,.98), transparent 34%), radial-gradient(circle at 82% 18%, rgba(217,70,239,.82), transparent 36%), radial-gradient(circle at 34% 84%, rgba(251,146,60,.72), transparent 38%), linear-gradient(145deg, #020617, #111827)',
    vars: {
      '--rakBgBase': '#020617',
      '--rakAppBackground': 'radial-gradient(circle at 14% 12%, rgba(34,211,238,.30), transparent 32%), radial-gradient(circle at 86% 18%, rgba(217,70,239,.24), transparent 35%), radial-gradient(circle at 34% 86%, rgba(251,146,60,.18), transparent 39%), radial-gradient(circle at 62% 48%, rgba(59,130,246,.16), transparent 42%), linear-gradient(160deg, #020617 0%, #08111f 46%, #111827 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(2,6,23,.48), transparent 25%, rgba(34,211,238,.052) 50%, transparent 75%, rgba(2,6,23,.48)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.070), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #020617 0%, #08111f 55%, #111827 100%)',
      '--rakBgAccent': 'rgba(34,211,238,.30)',
      '--green': '#22d3ee',
      '--green2': '#a5f3fc'
    }
  },
  {
    id: 'electric-lime',
    label: 'Electric lime',
    subtitle: 'Hodně výrazná světle zelená pro glass',
    color: '#bef264',
    swatch: 'radial-gradient(circle at 18% 20%, rgba(190,242,100,.98), transparent 33%), radial-gradient(circle at 82% 20%, rgba(34,197,94,.86), transparent 37%), radial-gradient(circle at 50% 84%, rgba(20,184,166,.66), transparent 42%), linear-gradient(145deg, #031108, #17351c)',
    vars: {
      '--rakBgBase': '#031108',
      '--rakAppBackground': 'radial-gradient(circle at 15% 12%, rgba(190,242,100,.30), transparent 31%), radial-gradient(circle at 86% 19%, rgba(34,197,94,.23), transparent 36%), radial-gradient(circle at 52% 84%, rgba(20,184,166,.18), transparent 42%), linear-gradient(160deg, #020a05 0%, #0a2410 48%, #17351c 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(2,10,5,.46), transparent 26%, rgba(190,242,100,.056) 50%, transparent 74%, rgba(2,10,5,.46)), radial-gradient(circle at 48% 40%, rgba(190,242,100,.075), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #020a05 0%, #0a2410 55%, #17351c 100%)',
      '--rakBgAccent': 'rgba(190,242,100,.30)',
      '--green': '#bef264',
      '--green2': '#ecfccb'
    }
  },
  {
    id: 'skoda-electric',
    label: 'Škoda electric',
    subtitle: 'Výraznější zelený Škoda směr',
    color: '#78FAAE',
    swatch: 'radial-gradient(circle at 16% 16%, rgba(120,250,174,.98), transparent 34%), radial-gradient(circle at 84% 22%, rgba(0,168,107,.88), transparent 37%), radial-gradient(circle at 50% 86%, rgba(12,64,48,.88), transparent 44%), linear-gradient(145deg, #020805, #0e3a2f)',
    vars: {
      '--rakBgBase': '#020805',
      '--rakAppBackground': 'radial-gradient(circle at 13% 10%, rgba(120,250,174,.34), transparent 31%), radial-gradient(circle at 86% 20%, rgba(0,168,107,.26), transparent 36%), radial-gradient(circle at 54% 86%, rgba(12,64,48,.54), transparent 44%), radial-gradient(circle at 42% 42%, rgba(185,255,214,.10), transparent 42%), linear-gradient(160deg, #020805 0%, #062018 48%, #0e3a2f 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(2,8,5,.50), transparent 25%, rgba(120,250,174,.064) 50%, transparent 75%, rgba(2,8,5,.50)), radial-gradient(circle at 47% 42%, rgba(120,250,174,.086), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #020805 0%, #062018 55%, #0e3a2f 100%)',
      '--rakBgAccent': 'rgba(120,250,174,.34)',
      '--green': '#78FAAE',
      '--green2': '#d5ffe5'
    }
  },
  {
    id: 'candy-glass',
    label: 'Candy glass',
    subtitle: 'Modro-fialovo-růžové iOS pozadí',
    color: '#c084fc',
    swatch: 'radial-gradient(circle at 18% 18%, rgba(96,165,250,.96), transparent 34%), radial-gradient(circle at 82% 20%, rgba(236,72,153,.86), transparent 38%), radial-gradient(circle at 50% 86%, rgba(168,85,247,.74), transparent 42%), linear-gradient(145deg, #07051c, #1e1b4b)',
    vars: {
      '--rakBgBase': '#07051c',
      '--rakAppBackground': 'radial-gradient(circle at 14% 12%, rgba(96,165,250,.28), transparent 32%), radial-gradient(circle at 86% 18%, rgba(236,72,153,.24), transparent 37%), radial-gradient(circle at 52% 86%, rgba(168,85,247,.20), transparent 42%), linear-gradient(160deg, #050316 0%, #111042 48%, #1e1b4b 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(5,3,22,.48), transparent 26%, rgba(236,72,153,.045) 50%, transparent 74%, rgba(5,3,22,.48)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.065), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #050316 0%, #111042 55%, #1e1b4b 100%)',
      '--rakBgAccent': 'rgba(236,72,153,.24)',
      '--green': '#c084fc',
      '--green2': '#f0abfc'
    }
  },

  {
    id: 'aurora-punch',
    label: 'Aurora punch',
    subtitle: 'Hodně výrazná modrá, růžová a tyrkys',
    color: '#38bdf8',
    swatch: 'radial-gradient(circle at 14% 18%, rgba(56,189,248,.98), transparent 32%), radial-gradient(circle at 82% 18%, rgba(244,114,182,.92), transparent 36%), radial-gradient(circle at 48% 86%, rgba(45,212,191,.78), transparent 42%), linear-gradient(145deg, #020617, #172554)',
    vars: {
      '--rakBgBase': '#020617',
      '--rakAppBackground': 'radial-gradient(circle at 12% 10%, rgba(56,189,248,.36), transparent 31%), radial-gradient(circle at 86% 18%, rgba(244,114,182,.28), transparent 36%), radial-gradient(circle at 50% 86%, rgba(45,212,191,.20), transparent 42%), radial-gradient(circle at 42% 44%, rgba(129,140,248,.18), transparent 43%), linear-gradient(160deg, #020617 0%, #071633 48%, #172554 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(2,6,23,.48), transparent 24%, rgba(56,189,248,.060) 50%, transparent 76%, rgba(2,6,23,.48)), radial-gradient(circle at 46% 42%, rgba(255,255,255,.085), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #020617 0%, #071633 55%, #172554 100%)',
      '--rakBgAccent': 'rgba(56,189,248,.36)',
      '--green': '#38bdf8',
      '--green2': '#bae6fd'
    }
  },
  {
    id: 'violet-storm',
    label: 'Violet storm',
    subtitle: 'Fialová bouřka s neonovým sklem',
    color: '#a78bfa',
    swatch: 'radial-gradient(circle at 18% 16%, rgba(167,139,250,.98), transparent 34%), radial-gradient(circle at 80% 18%, rgba(59,130,246,.78), transparent 37%), radial-gradient(circle at 48% 86%, rgba(236,72,153,.68), transparent 42%), linear-gradient(145deg, #09051c, #2e1065)',
    vars: {
      '--rakBgBase': '#09051c',
      '--rakAppBackground': 'radial-gradient(circle at 14% 12%, rgba(167,139,250,.32), transparent 32%), radial-gradient(circle at 84% 18%, rgba(59,130,246,.22), transparent 36%), radial-gradient(circle at 52% 86%, rgba(236,72,153,.18), transparent 42%), radial-gradient(circle at 44% 42%, rgba(255,255,255,.08), transparent 43%), linear-gradient(160deg, #060316 0%, #171044 48%, #2e1065 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(6,3,22,.48), transparent 25%, rgba(167,139,250,.060) 50%, transparent 75%, rgba(6,3,22,.48)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.080), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #060316 0%, #171044 55%, #2e1065 100%)',
      '--rakBgAccent': 'rgba(167,139,250,.32)',
      '--green': '#a78bfa',
      '--green2': '#ddd6fe'
    }
  },
  {
    id: 'sunset-plasma',
    label: 'Sunset plasma',
    subtitle: 'Oranžovo-růžové výrazné pozadí',
    color: '#fb7185',
    swatch: 'radial-gradient(circle at 16% 18%, rgba(251,113,133,.96), transparent 34%), radial-gradient(circle at 82% 20%, rgba(251,146,60,.88), transparent 38%), radial-gradient(circle at 50% 86%, rgba(168,85,247,.62), transparent 42%), linear-gradient(145deg, #17050c, #431407)',
    vars: {
      '--rakBgBase': '#17050c',
      '--rakAppBackground': 'radial-gradient(circle at 13% 11%, rgba(251,113,133,.30), transparent 32%), radial-gradient(circle at 86% 19%, rgba(251,146,60,.25), transparent 37%), radial-gradient(circle at 50% 86%, rgba(168,85,247,.16), transparent 42%), linear-gradient(160deg, #10030a 0%, #2a0714 48%, #431407 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(16,3,10,.50), transparent 25%, rgba(251,146,60,.062) 50%, transparent 75%, rgba(16,3,10,.50)), radial-gradient(circle at 47% 42%, rgba(255,255,255,.070), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #10030a 0%, #2a0714 55%, #431407 100%)',
      '--rakBgAccent': 'rgba(251,113,133,.30)',
      '--green': '#fb7185',
      '--green2': '#fecdd3'
    }
  },
  {
    id: 'polar-mint',
    label: 'Polar mint',
    subtitle: 'Ledově mintové sklo s výrazným kontrastem',
    color: '#99f6e4',
    swatch: 'radial-gradient(circle at 16% 16%, rgba(153,246,228,.98), transparent 34%), radial-gradient(circle at 82% 18%, rgba(34,211,238,.80), transparent 37%), radial-gradient(circle at 50% 86%, rgba(59,130,246,.62), transparent 42%), linear-gradient(145deg, #021011, #083344)',
    vars: {
      '--rakBgBase': '#021011',
      '--rakAppBackground': 'radial-gradient(circle at 13% 10%, rgba(153,246,228,.30), transparent 31%), radial-gradient(circle at 86% 19%, rgba(34,211,238,.24), transparent 36%), radial-gradient(circle at 52% 86%, rgba(59,130,246,.16), transparent 42%), linear-gradient(160deg, #020b0c 0%, #06262b 48%, #083344 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(2,11,12,.50), transparent 26%, rgba(153,246,228,.060) 50%, transparent 74%, rgba(2,11,12,.50)), radial-gradient(circle at 47% 42%, rgba(255,255,255,.076), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #020b0c 0%, #06262b 55%, #083344 100%)',
      '--rakBgAccent': 'rgba(153,246,228,.30)',
      '--green': '#99f6e4',
      '--green2': '#ccfbf1'
    }
  },
  {
    id: 'blue-orbit',
    label: 'Blue orbit',
    subtitle: 'Sytě modré orbity pro výraznější glass hrany',
    color: '#60a5fa',
    swatch: 'radial-gradient(circle at 18% 18%, rgba(96,165,250,.98), transparent 34%), radial-gradient(circle at 84% 22%, rgba(14,165,233,.84), transparent 38%), radial-gradient(circle at 52% 84%, rgba(99,102,241,.72), transparent 42%), linear-gradient(145deg, #020617, #1e1b4b)',
    vars: {
      '--rakBgBase': '#020617',
      '--rakAppBackground': 'radial-gradient(circle at 14% 11%, rgba(96,165,250,.34), transparent 32%), radial-gradient(circle at 86% 19%, rgba(14,165,233,.26), transparent 36%), radial-gradient(circle at 52% 86%, rgba(99,102,241,.20), transparent 42%), radial-gradient(circle at 42% 42%, rgba(255,255,255,.075), transparent 44%), linear-gradient(160deg, #020617 0%, #071633 48%, #1e1b4b 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(2,6,23,.50), transparent 25%, rgba(96,165,250,.070) 50%, transparent 75%, rgba(2,6,23,.50)), radial-gradient(circle at 47% 42%, rgba(255,255,255,.080), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #020617 0%, #071633 55%, #1e1b4b 100%)',
      '--rakBgAccent': 'rgba(96,165,250,.34)',
      '--green': '#60a5fa',
      '--green2': '#bfdbfe'
    }
  },
  {
    id: 'magma-lime',
    label: 'Magma lime',
    subtitle: 'Kontrast limetky, oranžové a tmavé hloubky',
    color: '#bef264',
    swatch: 'radial-gradient(circle at 16% 18%, rgba(190,242,100,.98), transparent 34%), radial-gradient(circle at 82% 20%, rgba(249,115,22,.86), transparent 38%), radial-gradient(circle at 50% 86%, rgba(236,72,153,.66), transparent 42%), linear-gradient(145deg, #080b03, #431407)',
    vars: {
      '--rakBgBase': '#080b03',
      '--rakAppBackground': 'radial-gradient(circle at 13% 10%, rgba(190,242,100,.34), transparent 31%), radial-gradient(circle at 86% 18%, rgba(249,115,22,.26), transparent 37%), radial-gradient(circle at 50% 86%, rgba(236,72,153,.16), transparent 42%), radial-gradient(circle at 44% 44%, rgba(255,255,255,.065), transparent 43%), linear-gradient(160deg, #070902 0%, #1f1605 48%, #431407 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(7,9,2,.52), transparent 25%, rgba(190,242,100,.070) 50%, transparent 75%, rgba(7,9,2,.52)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.074), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #070902 0%, #1f1605 55%, #431407 100%)',
      '--rakBgAccent': 'rgba(190,242,100,.34)',
      '--green': '#bef264',
      '--green2': '#ecfccb'
    }
  },
  {
    id: 'classic-rak',
    label: 'Původní RaK',
    subtitle: 'Klidnější tmavé zelené pozadí',
    color: '#7CFF7C',
    swatch: 'radial-gradient(circle at 50% 50%, rgba(124,255,124,.42), transparent 42%), linear-gradient(145deg, #0b0f0c, #141a17)',
    vars: {
      '--rakBgBase': '#0b0f0c',
      '--rakAppBackground': 'linear-gradient(160deg, #0b0f0c 0%, #101612 54%, #141a17 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(11,15,12,.92) 0%, rgba(11,15,12,.62) 26%, rgba(124,255,124,.060) 50%, rgba(11,15,12,.62) 74%, rgba(11,15,12,.92) 100%), radial-gradient(ellipse at center, rgba(124,255,124,.10) 0%, rgba(124,255,124,.05) 22%, rgba(11,15,12,0) 62%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #0b0f0c 0%, #101612 54%, #141a17 100%)',
      '--rakBgAccent': 'rgba(124,255,124,.14)'
    }
  },
  {
    id: 'neon-carnival',
    label: 'Neon carnival',
    subtitle: 'Hodně sytý cyan, magenta a limetka',
    color: '#00f5ff',
    swatch: 'radial-gradient(circle at 12% 18%, rgba(0,245,255,.98), transparent 32%), radial-gradient(circle at 86% 18%, rgba(255,0,229,.92), transparent 36%), radial-gradient(circle at 52% 86%, rgba(215,255,0,.82), transparent 42%), linear-gradient(145deg, #020617, #13001f)',
    unlockText: 'Rank Mistr nebo 28 achievementů', minRank: 'Mistr', minAchievements: 28,
    vars: {
      '--rakBgBase': '#030014',
      '--rakAppBackground': 'radial-gradient(circle at 12% 10%, rgba(0,245,255,.42), transparent 31%), radial-gradient(circle at 88% 18%, rgba(255,0,229,.34), transparent 36%), radial-gradient(circle at 52% 88%, rgba(215,255,0,.22), transparent 42%), linear-gradient(160deg, #020617 0%, #090024 48%, #13001f 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(2,6,23,.52), transparent 24%, rgba(255,255,255,.075) 50%, transparent 76%, rgba(2,6,23,.52)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.09), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #020617 0%, #090024 55%, #13001f 100%)',
      '--rakBgAccent': 'rgba(0,245,255,.42)',
      '--green': '#00F5FF',
      '--green2': '#D7FF00'
    }
  },
  {
    id: 'lava-neon',
    label: 'Lava neon',
    subtitle: 'Sytá červená, oranžová a růžová',
    color: '#ff2d00',
    swatch: 'radial-gradient(circle at 16% 18%, rgba(255,45,0,.98), transparent 34%), radial-gradient(circle at 82% 24%, rgba(255,0,119,.86), transparent 38%), radial-gradient(circle at 50% 86%, rgba(250,204,21,.76), transparent 42%), linear-gradient(145deg, #180200, #431407)',
    unlockText: 'Rank Senior nebo 36 achievementů', minRank: 'Senior', minAchievements: 36,
    vars: {
      '--rakBgBase': '#180200',
      '--rakAppBackground': 'radial-gradient(circle at 14% 11%, rgba(255,45,0,.42), transparent 32%), radial-gradient(circle at 86% 20%, rgba(255,0,119,.30), transparent 38%), radial-gradient(circle at 52% 86%, rgba(250,204,21,.20), transparent 42%), linear-gradient(160deg, #120200 0%, #2a0714 48%, #431407 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(18,2,0,.54), transparent 24%, rgba(255,210,120,.070) 50%, transparent 76%, rgba(18,2,0,.54)), radial-gradient(circle at 48% 42%, rgba(255,255,255,.070), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #120200 0%, #2a0714 55%, #431407 100%)',
      '--rakBgAccent': 'rgba(255,45,0,.42)',
      '--green': '#FF2D00',
      '--green2': '#FFD3C7'
    }
  },
  {
    id: 'acid-night',
    label: 'Acid night',
    subtitle: 'Fosforová limetka na černém glassu',
    color: '#d7ff00',
    swatch: 'radial-gradient(circle at 18% 18%, rgba(215,255,0,.98), transparent 34%), radial-gradient(circle at 82% 22%, rgba(0,245,255,.78), transparent 38%), radial-gradient(circle at 50% 86%, rgba(34,197,94,.72), transparent 42%), linear-gradient(145deg, #000000, #071100)',
    unlockText: 'Rank Legenda RaK nebo 44 achievementů', minRank: 'Legenda RaK', minAchievements: 44,
    vars: {
      '--rakBgBase': '#000000',
      '--rakAppBackground': 'radial-gradient(circle at 13% 10%, rgba(215,255,0,.42), transparent 31%), radial-gradient(circle at 86% 18%, rgba(0,245,255,.25), transparent 37%), radial-gradient(circle at 52% 86%, rgba(34,197,94,.20), transparent 42%), linear-gradient(160deg, #000 0%, #061000 50%, #071100 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(0,0,0,.56), transparent 24%, rgba(215,255,0,.075) 50%, transparent 76%, rgba(0,0,0,.56)), radial-gradient(circle at 48% 42%, rgba(215,255,0,.070), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #000 0%, #061000 55%, #071100 100%)',
      '--rakBgAccent': 'rgba(215,255,0,.42)',
      '--green': '#D7FF00',
      '--green2': '#F5FF9E'
    }
  },
  {
    id: 'violet-blackout',
    label: 'Violet blackout',
    subtitle: 'Ultrafialová odměna s tmavým AMOLED dojmem',
    color: '#7c3aed',
    swatch: 'radial-gradient(circle at 16% 16%, rgba(124,58,237,.98), transparent 34%), radial-gradient(circle at 82% 20%, rgba(255,0,229,.78), transparent 38%), radial-gradient(circle at 50% 86%, rgba(56,189,248,.64), transparent 42%), linear-gradient(145deg, #000000, #090021)',
    unlockText: 'Rank RaK nesmrtelný nebo 55 achievementů', minRank: 'RaK nesmrtelný', minAchievements: 55,
    vars: {
      '--rakBgBase': '#000000',
      '--rakAppBackground': 'radial-gradient(circle at 13% 10%, rgba(124,58,237,.40), transparent 31%), radial-gradient(circle at 86% 20%, rgba(255,0,229,.28), transparent 37%), radial-gradient(circle at 52% 86%, rgba(56,189,248,.18), transparent 42%), linear-gradient(160deg, #000 0%, #050015 50%, #090021 100%)',
      '--rakAppBackgroundOverlay': 'linear-gradient(90deg, rgba(0,0,0,.56), transparent 24%, rgba(255,255,255,.065) 50%, transparent 76%, rgba(0,0,0,.56)), radial-gradient(circle at 48% 42%, rgba(124,58,237,.080), transparent 46%)',
      '--rakAppBackgroundLite': 'linear-gradient(160deg, #000 0%, #050015 55%, #090021 100%)',
      '--rakBgAccent': 'rgba(124,58,237,.40)',
      '--green': '#7C3AED',
      '--green2': '#DDD6FE'
    }
  }
];

const RAK_BACKGROUND_UNLOCKS_V927 = {
  'ios-mesh': { unlockText: 'Vždy dostupné', minPlays: 0, minAchievements: 0 },
  'skoda-green': { unlockText: '5 her nebo 1 achievement', minPlays: 5, minAchievements: 1 },
  'light-green': { unlockText: '10 her nebo 2 achievementy', minPlays: 10, minAchievements: 2 },
  'deep-aurora': { unlockText: '20 her nebo 4 achievementy', minPlays: 20, minAchievements: 4 },
  'ember': { unlockText: '30 her nebo 5 achievementů', minPlays: 30, minAchievements: 5 },
  'neon-lagoon': { unlockText: '40 her nebo 6 achievementů', minPlays: 40, minAchievements: 6 },
  'electric-lime': { unlockText: '55 her nebo 8 achievementů', minPlays: 55, minAchievements: 8 },
  'skoda-electric': { unlockText: '70 her nebo 10 achievementů', minPlays: 70, minAchievements: 10 },
  'candy-glass': { unlockText: '90 her nebo 12 achievementů', minPlays: 90, minAchievements: 12 },
  'aurora-punch': { unlockText: '110 her nebo 14 achievementů', minPlays: 110, minAchievements: 14 },
  'violet-storm': { unlockText: '130 her nebo 16 achievementů', minPlays: 130, minAchievements: 16 },
  'sunset-plasma': { unlockText: '145 her nebo 17 achievementů', minPlays: 145, minAchievements: 17 },
  'polar-mint': { unlockText: '150 her nebo 18 achievementů', minPlays: 150, minAchievements: 18 },
  'blue-orbit': { unlockText: 'Rank Týmař nebo 20 achievementů', minRank: 'Týmař', minAchievements: 20 },
  'magma-lime': { unlockText: 'Rank Mistr nebo 24 achievementů', minRank: 'Mistr', minAchievements: 24 },
  'classic-rak': { unlockText: 'Rank Učeň nebo 6 achievementů', minRank: 'Učeň', minAchievements: 6 }
};
RAK_BACKGROUND_DEFS.forEach((bg) => {
  const unlock = RAK_BACKGROUND_UNLOCKS_V927[String(bg && bg.id || '')] || null;
  if (unlock) Object.assign(bg, unlock);
});
window.RAK_BACKGROUND_DEFS = RAK_BACKGROUND_DEFS;

const RAK_PROFILE_UI_REMOTE_DEBOUNCE_MS = 650;
let rakProfileUiRemoteSaveTimer = null;
let rakProfileUiRemoteSavePromise = null;
let rakProfileUiRemoteLoadAccount = '';
let rakProfileUiRemoteLoadPromise = null;
let rakProfileUiLastRemoteSaveSignature = '';
const rakProfileUiSyncGuard = {
  remoteLoads: 0,
  remoteApplies: 0,
  remoteSameSkips: 0,
  remoteOlderSkips: 0,
  remoteMissingCreates: 0,
  loadInFlightJoins: 0,
  saveInFlightJoins: 0,
  saveSameSkips: 0,
  remoteSaves: 0,
  remoteSaveQueued: 0,
  remoteSaveErrors: 0,
  lastLoadAt: 0,
  lastApplyAt: 0,
  lastSaveAt: 0
};

function getProfileUiPayloadSignature(payload) {
  if (!payload || typeof payload !== 'object') return '';
  return [
    String(payload.account_number || payload.accountNumber || '').trim(),
    normalizeThemePreferenceId(payload.theme_id || payload.themeId || payload.theme || 'default', 'default'),
    normalizeBackgroundPreferenceId(payload.background_id || payload.backgroundId || payload.background || 'ios-mesh', 'ios-mesh')
  ].join('|');
}

function getProfileUiSyncStatus() {
  const account = getActiveProfileUiAccount();
  const ui = ensureAccountUiSettings(account);
  return {
    account: account ? String(account.name || account.id || '').trim() : '',
    themeId: ui && ui.themeId ? ui.themeId : getLocalThemePreference(),
    backgroundId: ui && ui.backgroundId ? ui.backgroundId : getLocalBackgroundPreference(),
    remoteLoadActive: !!rakProfileUiRemoteLoadPromise,
    remoteSaveActive: !!rakProfileUiRemoteSavePromise,
    guard: Object.assign({}, rakProfileUiSyncGuard)
  };
}
window.getProfileUiSyncStatus = getProfileUiSyncStatus;

function normalizeThemePreferenceId(themeId, fallback = 'default') {
  const id = String(themeId || '').trim();
  if (id && RAK_THEME_DEFS.some(theme => theme.id === id)) return id;
  const fb = String(fallback || '').trim();
  return RAK_THEME_DEFS.some(theme => theme.id === fb) ? fb : 'default';
}

function normalizeBackgroundPreferenceId(bgId, fallback = 'ios-mesh') {
  const id = String(bgId || '').trim();
  if (id && RAK_BACKGROUND_DEFS.some(bg => bg.id === id)) return id;
  const fb = String(fallback || '').trim();
  return RAK_BACKGROUND_DEFS.some(bg => bg.id === fb) ? fb : 'ios-mesh';
}

function getLocalThemePreference() {
  try {
    const raw = typeof getLocalStorageCached === 'function' ? getLocalStorageCached(RAK_THEME_STORAGE_KEY, 'default') : (localStorage.getItem(RAK_THEME_STORAGE_KEY) || 'default');
    return normalizeThemePreferenceId(raw || 'default', 'default');
  } catch (err) { return 'default'; }
}

function getLocalBackgroundPreference() {
  try {
    const raw = typeof getLocalStorageCached === 'function' ? getLocalStorageCached(RAK_BACKGROUND_STORAGE_KEY, 'ios-mesh') : (localStorage.getItem(RAK_BACKGROUND_STORAGE_KEY) || 'ios-mesh');
    return normalizeBackgroundPreferenceId(raw || 'ios-mesh', 'ios-mesh');
  } catch (err) { return 'ios-mesh'; }
}

function getActiveProfileUiAccount() {
  try {
    const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
    if (!profile || !profile.activeAccountId || !profile.accounts) return null;
    return profile.accounts[profile.activeAccountId] || null;
  } catch (err) {
    return null;
  }
}

function ensureAccountUiSettings(account) {
  if (!account || typeof account !== 'object') return null;
  if (!account.uiSettings || typeof account.uiSettings !== 'object') account.uiSettings = {};
  if (!account.uiSettings.themeId && (account.themeId || account.uiTheme)) account.uiSettings.themeId = String(account.themeId || account.uiTheme || '').trim();
  if (!account.uiSettings.backgroundId && (account.backgroundId || account.uiBackground)) account.uiSettings.backgroundId = String(account.backgroundId || account.uiBackground || '').trim();
  account.uiSettings.themeId = account.uiSettings.themeId ? normalizeThemePreferenceId(account.uiSettings.themeId, '') : '';
  account.uiSettings.backgroundId = account.uiSettings.backgroundId ? normalizeBackgroundPreferenceId(account.uiSettings.backgroundId, '') : '';
  account.uiSettings.updatedAt = Number(account.uiSettings.updatedAt || 0) || 0;
  return account.uiSettings;
}

function getProfileThemePreference() {
  const account = getActiveProfileUiAccount();
  const ui = ensureAccountUiSettings(account);
  return ui && ui.themeId ? normalizeThemePreferenceId(ui.themeId, '') : '';
}

function getProfileBackgroundPreference() {
  const account = getActiveProfileUiAccount();
  const ui = ensureAccountUiSettings(account);
  return ui && ui.backgroundId ? normalizeBackgroundPreferenceId(ui.backgroundId, '') : '';
}

function saveActiveAccountUiSettings(partial, options = {}) {
  const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
  const account = profile && profile.activeAccountId && profile.accounts ? profile.accounts[profile.activeAccountId] : null;
  const ui = ensureAccountUiSettings(account);
  if (!profile || !account || !ui) return false;
  let changed = false;
  if (Object.prototype.hasOwnProperty.call(partial || {}, 'themeId')) {
    const nextTheme = normalizeThemePreferenceId(partial.themeId, ui.themeId || getLocalThemePreference());
    if (ui.themeId !== nextTheme) { ui.themeId = nextTheme; changed = true; }
  }
  if (Object.prototype.hasOwnProperty.call(partial || {}, 'backgroundId')) {
    const nextBg = normalizeBackgroundPreferenceId(partial.backgroundId, ui.backgroundId || getLocalBackgroundPreference());
    if (ui.backgroundId !== nextBg) { ui.backgroundId = nextBg; changed = true; }
  }
  if (changed || !ui.updatedAt) {
    ui.updatedAt = Date.now();
    account.updatedAt = Math.max(Number(account.updatedAt || 0) || 0, ui.updatedAt);
    profile.profileVersion = GAMES_PROFILE_RESET_VERSION;
    gamesSaveProfile(profile);
    app.gamesProfile = profile;
  }
  if (!options.skipRemote) scheduleActiveAccountUiRemoteSave(options.reason || 'profile-ui-local-save');
  return true;
}

function getActiveAccountUiRemotePayload() {
  const account = getActiveProfileUiAccount();
  const ui = ensureAccountUiSettings(account);
  if (!account || !ui) return null;
  return {
    account_number: String(account.id || '').trim(),
    theme_id: normalizeThemePreferenceId(ui.themeId || getLocalThemePreference(), 'default'),
    background_id: normalizeBackgroundPreferenceId(ui.backgroundId || getLocalBackgroundPreference(), 'ios-mesh'),
    updated_at: new Date(Number(ui.updatedAt || Date.now()) || Date.now()).toISOString()
  };
}

function scheduleActiveAccountUiRemoteSave(reason) {
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.saveGameAccountUiSettings !== 'function') return false;
  const payload = getActiveAccountUiRemotePayload();
  if (!payload || !payload.account_number) return false;
  const signature = getProfileUiPayloadSignature(payload);
  if (signature && signature === rakProfileUiLastRemoteSaveSignature && !rakProfileUiRemoteSavePromise) {
    rakProfileUiSyncGuard.saveSameSkips += 1;
    return false;
  }
  if (rakProfileUiRemoteSaveTimer) clearTimeout(rakProfileUiRemoteSaveTimer);
  rakProfileUiRemoteSaveTimer = setTimeout(() => {
    rakProfileUiRemoteSaveTimer = null;
    void pushActiveAccountUiRemoteSettings(reason || 'profile-ui-debounced');
  }, RAK_PROFILE_UI_REMOTE_DEBOUNCE_MS);
  return true;
}

async function pushActiveAccountUiRemoteSettings(reason) {
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.saveGameAccountUiSettings !== 'function') return null;
  const payload = getActiveAccountUiRemotePayload();
  if (!payload || !payload.account_number) return null;
  const signature = getProfileUiPayloadSignature(payload);
  if (signature && signature === rakProfileUiLastRemoteSaveSignature && !rakProfileUiRemoteSavePromise) {
    rakProfileUiSyncGuard.saveSameSkips += 1;
    return { ok: true, skipped: true, reason: 'same-profile-ui' };
  }
  if (rakProfileUiRemoteSavePromise) {
    rakProfileUiSyncGuard.saveInFlightJoins += 1;
    return await rakProfileUiRemoteSavePromise;
  }
  rakProfileUiRemoteSavePromise = bridge.saveGameAccountUiSettings(Object.assign({ reason: reason || 'profile-ui-save' }, payload))
    .then((result) => {
      if (result && result.ok !== false) {
        rakProfileUiLastRemoteSaveSignature = signature;
        rakProfileUiSyncGuard.remoteSaves += 1;
        rakProfileUiSyncGuard.lastSaveAt = Date.now();
        if (result.queued || result.deferred) rakProfileUiSyncGuard.remoteSaveQueued += 1;
      } else {
        rakProfileUiSyncGuard.remoteSaveErrors += 1;
      }
      return result;
    })
    .catch((err) => {
      rakProfileUiSyncGuard.remoteSaveErrors += 1;
      console.warn('Profile UI remote save failed', err);
      return { ok: false, error: err };
    })
    .finally(() => { rakProfileUiRemoteSavePromise = null; });
  return await rakProfileUiRemoteSavePromise;
}

async function loadActiveAccountUiRemoteSettings(accountId) {
  const id = String(accountId || '').trim();
  const bridge = window.RotationSupabaseBridge;
  if (!id || !bridge || typeof bridge.loadGameAccountUiSettings !== 'function') return null;
  if (rakProfileUiRemoteLoadAccount === id && rakProfileUiRemoteLoadPromise) {
    rakProfileUiSyncGuard.loadInFlightJoins += 1;
    return await rakProfileUiRemoteLoadPromise;
  }
  rakProfileUiRemoteLoadAccount = id;
  rakProfileUiRemoteLoadPromise = (async () => {
    try {
      rakProfileUiSyncGuard.remoteLoads += 1;
      rakProfileUiSyncGuard.lastLoadAt = Date.now();
      const remote = await bridge.loadGameAccountUiSettings(id);
      if (!remote || typeof remote !== 'object') {
        rakProfileUiSyncGuard.remoteMissingCreates += 1;
        void pushActiveAccountUiRemoteSettings('profile-ui-create-missing-remote');
        return null;
      }
      const remoteTheme = normalizeThemePreferenceId(remote.theme_id || remote.themeId || remote.theme || '', '');
      const remoteBg = normalizeBackgroundPreferenceId(remote.background_id || remote.backgroundId || remote.background || '', '');
      if (!remoteTheme && !remoteBg) return null;
      const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
      const account = profile && profile.accounts ? profile.accounts[id] : null;
      const ui = ensureAccountUiSettings(account);
      if (!profile || !account || !ui) return null;
      const localTs = Number(ui.updatedAt || 0) || 0;
      const remoteTs = Date.parse(String(remote.updated_at || remote.updatedAt || '')) || 0;
      const remoteIsOlder = localTs > 0 && remoteTs > 0 && remoteTs + 1000 < localTs;
      if (remoteIsOlder) {
        rakProfileUiSyncGuard.remoteOlderSkips += 1;
        void pushActiveAccountUiRemoteSettings('profile-ui-remote-older-push-local');
        return Object.assign({ ok: true, skipped: true, reason: 'remote-older' }, remote);
      }
      let changed = false;
      if (remoteTheme && ui.themeId !== remoteTheme) { ui.themeId = remoteTheme; changed = true; }
      if (remoteBg && ui.backgroundId !== remoteBg) { ui.backgroundId = remoteBg; changed = true; }
      const rewardMetrics = getThemeUnlockMetrics(profile);
      const remoteThemeDef = RAK_THEME_DEFS.find(theme => String(theme.id || '') === String(ui.themeId)) || RAK_THEME_DEFS[0];
      const remoteBgDef = RAK_BACKGROUND_DEFS.find(bg => String(bg.id || '') === String(ui.backgroundId)) || RAK_BACKGROUND_DEFS[0];
      if (!isAppearanceRewardUnlocked(remoteThemeDef, rewardMetrics, 'default')) { ui.themeId = 'default'; changed = true; }
      if (!isAppearanceRewardUnlocked(remoteBgDef, rewardMetrics, 'ios-mesh')) { ui.backgroundId = 'ios-mesh'; changed = true; }
      ui.updatedAt = Math.max(localTs, remoteTs || Date.now());
      if (changed) {
        rakProfileUiSyncGuard.remoteApplies += 1;
        rakProfileUiSyncGuard.lastApplyAt = Date.now();
        account.updatedAt = Math.max(Number(account.updatedAt || 0) || 0, ui.updatedAt);
        profile.profileVersion = GAMES_PROFILE_RESET_VERSION;
        gamesSaveProfile(profile);
        app.gamesProfile = profile;
        applyThemePreference(ui.themeId || 'default', true, { skipProfile: true });
        applyBackgroundPreference(ui.backgroundId || 'ios-mesh', true, { skipProfile: true });
        if (ui.themeId !== remoteTheme || ui.backgroundId !== remoteBg) scheduleActiveAccountUiRemoteSave('profile-ui-locked-remote-normalized');
        if (typeof renderThemeSettingsCards === 'function') renderThemeSettingsCards();
      } else {
        rakProfileUiSyncGuard.remoteSameSkips += 1;
        if (remoteTheme || remoteBg) {
          rakProfileUiLastRemoteSaveSignature = getProfileUiPayloadSignature({ account_number: id, theme_id: remoteTheme || ui.themeId, background_id: remoteBg || ui.backgroundId });
        }
      }
      return remote;
    } catch (err) {
      console.warn('Profile UI remote load failed', err);
      return null;
    }
  })();
  try {
    return await rakProfileUiRemoteLoadPromise;
  } finally {
    rakProfileUiRemoteLoadAccount = '';
    rakProfileUiRemoteLoadPromise = null;
  }
}

function applyProfileUiPreferencesForActiveAccount(options = {}) {
  const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
  const account = profile && profile.activeAccountId && profile.accounts ? profile.accounts[profile.activeAccountId] : null;
  const ui = ensureAccountUiSettings(account);
  if (!profile || !account || !ui) return false;
  const localTheme = getLocalThemePreference();
  const localBg = getLocalBackgroundPreference();
  const defaultTheme = normalizeThemePreferenceId('default', 'default');
  const defaultBg = normalizeBackgroundPreferenceId('ios-mesh', 'ios-mesh');
  let changed = false;
  // v.1.5 (963): vzhled je profilový. Nový/prázdný profil nezačne omylem vzhledem po předchozím přihlášeném profilu.
  if (!ui.themeId) { ui.themeId = defaultTheme; changed = true; }
  if (!ui.backgroundId) { ui.backgroundId = defaultBg; changed = true; }
  const rewardMetrics = getThemeUnlockMetrics(profile);
  const savedTheme = RAK_THEME_DEFS.find(theme => String(theme.id || '') === String(ui.themeId)) || RAK_THEME_DEFS[0];
  const savedBg = RAK_BACKGROUND_DEFS.find(bg => String(bg.id || '') === String(ui.backgroundId)) || RAK_BACKGROUND_DEFS[0];
  if (!isAppearanceRewardUnlocked(savedTheme, rewardMetrics, 'default')) { ui.themeId = defaultTheme; changed = true; }
  if (!isAppearanceRewardUnlocked(savedBg, rewardMetrics, 'ios-mesh')) { ui.backgroundId = defaultBg; changed = true; }
  if (changed || !ui.updatedAt) {
    ui.updatedAt = Date.now();
    account.updatedAt = Math.max(Number(account.updatedAt || 0) || 0, ui.updatedAt);
    profile.profileVersion = GAMES_PROFILE_RESET_VERSION;
    gamesSaveProfile(profile);
    app.gamesProfile = profile;
  }
  applyThemePreference(ui.themeId || localTheme, true, { skipProfile: true });
  applyBackgroundPreference(ui.backgroundId || localBg, true, { skipProfile: true });
  if (typeof renderThemeSettingsCards === 'function') renderThemeSettingsCards();
  if (changed) scheduleActiveAccountUiRemoteSave('profile-ui-initialized-from-local');
  if (options.loadRemote !== false) void loadActiveAccountUiRemoteSettings(account.id);
  return true;
}

window.applyProfileUiPreferencesForActiveAccount = applyProfileUiPreferencesForActiveAccount;
window.pushActiveAccountUiRemoteSettings = pushActiveAccountUiRemoteSettings;
window.loadActiveAccountUiRemoteSettings = loadActiveAccountUiRemoteSettings;

function getThemePreference() {
  const profileTheme = getProfileThemePreference();
  if (profileTheme) return profileTheme;
  return getLocalThemePreference();
}


function getBackgroundPreference() {
  const profileBg = getProfileBackgroundPreference();
  if (profileBg) return profileBg;
  return getLocalBackgroundPreference();
}

function updateBackgroundMetaColor(bg) {
  try {
    const vars = bg && bg.vars && typeof bg.vars === 'object' ? bg.vars : {};
    const nextColor = String((bg && bg.themeColor) || vars['--rakBgBase'] || '#050816').trim() || '#050816';
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta && document.head) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    if (meta && meta.getAttribute('content') !== nextColor) meta.setAttribute('content', nextColor);
  } catch (err) {}
}
window.updateBackgroundMetaColor = updateBackgroundMetaColor;

function setRakStyleProperty(target, key, value, priority = '', statKey = '') {
  if (!target || !target.style) return false;
  if (typeof setStylePropertyIfChanged === 'function') {
    return setStylePropertyIfChanged(target, key, value, priority, statKey || key);
  }
  try {
    target.style.setProperty(key, value, priority || '');
    return true;
  } catch (err) {
    return false;
  }
}

function applyBackgroundPreference(bgId, persist = true, options = {}) {
  let bg = RAK_BACKGROUND_DEFS.find(item => item.id === normalizeBackgroundPreferenceId(bgId, 'ios-mesh')) || RAK_BACKGROUND_DEFS[0];
  if (!options.allowLocked) {
    const metrics = getThemeUnlockMetrics(typeof gamesGetProfile === 'function' ? gamesGetProfile() : null);
    if (!isAppearanceRewardUnlocked(bg, metrics, 'ios-mesh')) bg = RAK_BACKGROUND_DEFS[0];
  }
  const root = document.documentElement;
  root.dataset.rakBackground = bg.id;
  Object.entries(RAK_BACKGROUND_BASE_VARS).forEach(([key, value]) => {
    setRakStyleProperty(root, key, value, '', 'background-' + key);
  });
  Object.entries(bg.vars || {}).forEach(([key, value]) => {
    setRakStyleProperty(root, key, value, '', 'background-' + key);
  });
  updateBackgroundMetaColor(bg);
  if (persist) {
    try {
      if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(RAK_BACKGROUND_STORAGE_KEY, bg.id);
      else localStorage.setItem(RAK_BACKGROUND_STORAGE_KEY, bg.id);
    } catch (err) {}
    if (!options.skipProfile) saveActiveAccountUiSettings({ backgroundId: bg.id }, { reason: 'background-change', skipRemote: !!options.skipRemote });
  }
  return bg.id;
}
window.getBackgroundPreference = getBackgroundPreference;
window.applyBackgroundPreference = applyBackgroundPreference;
window.RAK_BACKGROUND_STORAGE_KEY = RAK_BACKGROUND_STORAGE_KEY;

(function initBackgroundPreference() {
  try { applyBackgroundPreference(getBackgroundPreference(), false); } catch (err) {}
})();

(function installAppearancePreferenceGuards() {
  if (window.__rakAppearancePreferenceGuardV556) return;
  window.__rakAppearancePreferenceGuardV556 = true;
  const syncAppearance = () => {
    try {
      applyThemePreference(getThemePreference(), false);
      applyBackgroundPreference(getBackgroundPreference(), false);
      if (typeof renderThemeSettingsCards === 'function') renderThemeSettingsCards();
    } catch (err) {}
  };
  window.addEventListener('pageshow', syncAppearance);
  window.addEventListener('focus', syncAppearance);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncAppearance();
  });
  window.addEventListener('storage', (event) => {
    if (!event || event.key === RAK_BACKGROUND_STORAGE_KEY || event.key === RAK_THEME_STORAGE_KEY) syncAppearance();
  });
})();

function getThemeUnlockMetrics(profile) {
  const active = profile && profile.activeAccountId && profile.accounts ? profile.accounts[profile.activeAccountId] : null;
  if (!active) return { totalPlays: 0, bestScore: 0, achievements: 0, xp: 0, rank: '', rankIndex: 0, hasProfile: false };
  const total = typeof gamesGetTotals === 'function' ? gamesGetTotals(active) : { totalPlays: 0, bestScore: 0 };
  const achievements = typeof gamesGetAchievementCount === 'function' ? gamesGetAchievementCount(active) : 0;
  const progress = typeof window.gamesBuildProgressSummary === 'function' ? window.gamesBuildProgressSummary(active) : null;
  const rankName = String(progress && progress.rank || '').trim();
  const ranks = Array.isArray(window.GAMES_RANK_DEFS) ? window.GAMES_RANK_DEFS : [];
  const rankIndex = Math.max(0, ranks.findIndex(rank => String(rank && rank.name || '') === rankName));
  return {
    totalPlays: Number(total.totalPlays || 0) || 0,
    bestScore: Number(total.bestScore || 0) || 0,
    achievements: Number(achievements || 0) || 0,
    xp: Number(progress && progress.xp || 0) || 0,
    rank: rankName,
    rankIndex: rankIndex < 0 ? 0 : rankIndex,
    hasProfile: true
  };
}

function getThemeUnlockScore(profile) {
  const metrics = getThemeUnlockMetrics(profile);
  return metrics.totalPlays + Math.floor(metrics.bestScore / 50) + (metrics.achievements * 2) + (metrics.rankIndex * 8);
}

function getRewardRequiredRankIndex(reward) {
  const required = String(reward && reward.minRank || '').trim();
  if (!required) return 0;
  const ranks = Array.isArray(window.GAMES_RANK_DEFS) ? window.GAMES_RANK_DEFS : [];
  const idx = ranks.findIndex(rank => String(rank && rank.name || '') === required);
  return idx < 0 ? 0 : idx;
}

function isAppearanceRewardUnlocked(reward, metrics, defaultId) {
  const id = String(reward && reward.id || '').trim();
  if (!reward || id === defaultId) return true;
  const playsNeed = Number(reward.minPlays || 0) || 0;
  const achNeed = Number(reward.minAchievements || 0) || 0;
  const rankNeed = getRewardRequiredRankIndex(reward);
  const byPlays = playsNeed > 0 && Number(metrics.totalPlays || 0) >= playsNeed;
  const byAchievements = achNeed > 0 && Number(metrics.achievements || 0) >= achNeed;
  const byRank = rankNeed > 0 && Number(metrics.rankIndex || 0) >= rankNeed;
  if (!playsNeed && !achNeed && !rankNeed) return true;
  return byPlays || byAchievements || byRank;
}

function buildAppearanceRewardProgressText(reward, metrics) {
  const parts = [];
  const playsNeed = Number(reward && reward.minPlays || 0) || 0;
  const achNeed = Number(reward && reward.minAchievements || 0) || 0;
  const rankNeed = getRewardRequiredRankIndex(reward);
  if (playsNeed) parts.push(String(metrics.totalPlays || 0) + '/' + String(playsNeed) + ' her');
  if (achNeed) parts.push(String(metrics.achievements || 0) + '/' + String(achNeed) + ' ach.');
  if (rankNeed) parts.push('rank ' + (metrics.rank || '—') + '/' + String(reward.minRank || ''));
  return parts.length ? (' · máš ' + parts.join(', ')) : '';
}

function applyThemePreference(themeId, persist = true, options = {}) {
  let theme = RAK_THEME_DEFS.find(t => t.id === normalizeThemePreferenceId(themeId, 'default')) || RAK_THEME_DEFS[0];
  if (!options.allowLocked) {
    const metrics = getThemeUnlockMetrics(typeof gamesGetProfile === 'function' ? gamesGetProfile() : null);
    if (!isAppearanceRewardUnlocked(theme, metrics, 'default')) theme = RAK_THEME_DEFS[0];
  }
  const root = document.documentElement;
  root.dataset.rakTheme = theme.id;
  setRakStyleProperty(root, '--rakThemeAccent', String(theme.color || '#7CFF7C'), '', 'theme-accent');
  Object.entries(RAK_THEME_BASE_VARS).forEach(([key, value]) => {
    setRakStyleProperty(root, key, value, '', 'theme-base-' + key);
  });
  Object.entries(theme.vars || {}).forEach(([key, value]) => {
    setRakStyleProperty(root, key, value, '', 'theme-' + key);
  });
  if (persist) {
    try {
      if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(RAK_THEME_STORAGE_KEY, theme.id);
      else localStorage.setItem(RAK_THEME_STORAGE_KEY, theme.id);
    } catch (err) {}
    if (!options.skipProfile) saveActiveAccountUiSettings({ themeId: theme.id }, { reason: 'theme-change', skipRemote: !!options.skipRemote });
  }
  return theme.id;
}

(function initThemePreference() {
  try {
    applyThemePreference(getThemePreference(), false);
    if (typeof applyBackgroundPreference === 'function') applyBackgroundPreference(getBackgroundPreference(), false);
  } catch (err) {}
})();

function buildThemeSystemSettingsHtml() {
  const defs = Array.isArray(window.RAK_THEME_DEFS) ? window.RAK_THEME_DEFS : [];
  const currentId = getThemePreference();
  const currentTheme = defs.find(theme => String(theme.id || '') === String(currentId)) || defs[0] || { label: 'Výchozí' };
  const cards = defs.map(theme => {
    const unlockedText = theme && theme.unlockText ? String(theme.unlockText) : '';
    return '<button type="button" class="appMenuThemeCard" data-theme-id="' + escapeHtml(String(theme.id || '')) + '">' +
      '<div class="appMenuThemeSwatch" style="--theme-swatch:' + escapeHtml(String(theme.color || '#7CFF7C')) + '"></div>' +
      '<div class="appMenuThemeInfo">' +
      '<div class="appMenuThemeTitle">' + escapeHtml(String(theme.label || '')) + '</div>' +
      '<div class="appMenuThemeBadge">' + escapeHtml(unlockedText) + '</div>' +
      '</div>' +
    '</button>';
  }).join('');
  const bgDefs = Array.isArray(window.RAK_BACKGROUND_DEFS) ? window.RAK_BACKGROUND_DEFS : [];
  const currentBgId = typeof getBackgroundPreference === 'function' ? getBackgroundPreference() : 'ios-mesh';
  const currentBg = bgDefs.find(bg => String(bg.id || '') === String(currentBgId)) || bgDefs[0] || { label: 'iOS mesh' };
  const bgCards = bgDefs.map(bg => {
    const swatch = String(bg.swatch || bg.color || '#38bdf8');
    const unlockedText = bg && bg.unlockText ? String(bg.unlockText) : 'Odměna za hraní';
    return '<button type="button" class="appMenuBackgroundCard" data-bg-id="' + escapeHtml(String(bg.id || '')) + '">' +
      '<div class="appMenuBackgroundSwatch" style="--background-swatch:' + escapeHtml(swatch) + '"></div>' +
      '<div class="appMenuThemeInfo">' +
      '<div class="appMenuThemeTitle">' + escapeHtml(String(bg.label || '')) + '</div>' +
      '<div class="appMenuThemeBadge">' + escapeHtml(unlockedText) + '</div>' +
      '</div>' +
    '</button>';
  }).join('');
  return [
    '<div class="appMenuCard appMenuSettingsCard appMenuThemeCardWrap">',
    '  <div class="appMenuCardTitle">Theme / barvy aplikace</div>',
    '  <details class="appMenuThemeAccordion" id="appMenuThemeAccordion">',
    '    <summary class="appMenuAction appMenuSettingBtn appMenuThemeSummary">',
    '      <span class="appMenuThemeSummaryLeft">',
    '        <span class="appMenuThemeSummaryTitle">Theme / barvy</span>',
    '        <span class="appMenuThemeSummaryMeta" id="appMenuThemeSummaryMeta">Aktivní: ' + escapeHtml(String(currentTheme.label || 'Výchozí')) + '</span>',
    '      </span>',
    '      <span class="appMenuThemeSummaryChevron" aria-hidden="true">⌄</span>',
    '    </summary>',
    '    <div class="appMenuThemeAccordionBody">',
    '      <div class="appMenuThemeGrid" id="appMenuThemeGrid">' + cards + '</div>',
    '      <div class="appMenuThemeHint" id="appMenuThemeHint"></div>',
    '    </div>',
    '  </details>',
    '  <details class="appMenuThemeAccordion appMenuBackgroundAccordion" id="appMenuBackgroundAccordion">',
    '    <summary class="appMenuAction appMenuSettingBtn appMenuThemeSummary">',
    '      <span class="appMenuThemeSummaryLeft">',
    '        <span class="appMenuThemeSummaryTitle">Pozadí</span>',
    '        <span class="appMenuThemeSummaryMeta" id="appMenuBackgroundSummaryMeta">Aktivní: ' + escapeHtml(String(currentBg.label || 'iOS mesh')) + '</span>',
    '      </span>',
    '      <span class="appMenuThemeSummaryChevron" aria-hidden="true">⌄</span>',
    '    </summary>',
    '    <div class="appMenuThemeAccordionBody">',
    '      <div class="appMenuBackgroundGrid" id="appMenuBackgroundGrid">' + bgCards + '</div>',
    '      <div class="appMenuThemeHint" id="appMenuBackgroundHint"></div>',
    '    </div>',
    '  </details>',
    '</div>'
  ].join('');
}

function renderThemeSettingsCards() {
  const grid = document.getElementById('appMenuThemeGrid');
  const hint = document.getElementById('appMenuThemeHint');
  const summaryMeta = document.getElementById('appMenuThemeSummaryMeta');
  if (!grid) return;
  const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
  const metrics = getThemeUnlockMetrics(profile);
  const current = getThemePreference();
  const themeList = Array.isArray(window.RAK_THEME_DEFS) ? window.RAK_THEME_DEFS : [];
  const themeById = new Map(themeList.map(theme => [String(theme.id || ''), theme]));

  Array.from(grid.querySelectorAll('.appMenuThemeCard')).forEach(card => {
    const id = String(card.dataset.themeId || '').trim();
    const theme = themeById.get(id) || null;
    const unlocked = isAppearanceRewardUnlocked(theme, metrics, 'default');
    card.classList.toggle('isActive', id === current);
    card.classList.toggle('isLocked', !unlocked && id !== 'default');
    card.setAttribute('aria-pressed', id === current ? 'true' : 'false');
    const badge = card.querySelector('.appMenuThemeBadge');
    if (badge && theme) {
      const progressText = buildAppearanceRewardProgressText(theme, metrics);
      const nextBadgeText = unlocked ? 'Odemčeno' : ('Zamčeno · ' + (theme.unlockText || 'podmínka nesplněna') + progressText);
      if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(badge, nextBadgeText, 'themeBadge-' + id);
      else badge.textContent = nextBadgeText;
    }
    if (!card.dataset.bound) {
      card.dataset.bound = '1';
      card.addEventListener('click', () => {
        const nextTheme = themeById.get(id) || null;
        if (!nextTheme) return;
        const nextMetrics = getThemeUnlockMetrics(typeof gamesGetProfile === 'function' ? gamesGetProfile() : null);
        const nextUnlocked = isAppearanceRewardUnlocked(nextTheme, nextMetrics, 'default');
        if (!nextUnlocked) {
          if (hint) {
            const nextHintText = '';
            if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(hint, nextHintText, 'themeHintLocked');
            else hint.textContent = nextHintText;
          }
          return;
        }
        applyThemePreference(id, true);
        if (typeof applyBackgroundPreference === 'function') applyBackgroundPreference(getBackgroundPreference(), false);
        renderThemeSettingsCards();
        if (hint) {
          const nextHintText = '';
          if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(hint, nextHintText, 'themeHintActive');
          else hint.textContent = nextHintText;
        }
      });
    }
  });

  const bgGrid = document.getElementById('appMenuBackgroundGrid');
  const bgHint = document.getElementById('appMenuBackgroundHint');
  const bgSummaryMeta = document.getElementById('appMenuBackgroundSummaryMeta');
  const bgList = Array.isArray(window.RAK_BACKGROUND_DEFS) ? window.RAK_BACKGROUND_DEFS : [];
  const bgById = new Map(bgList.map(bg => [String(bg.id || ''), bg]));
  const currentBg = typeof getBackgroundPreference === 'function' ? getBackgroundPreference() : 'ios-mesh';
  if (bgGrid) {
    Array.from(bgGrid.querySelectorAll('.appMenuBackgroundCard')).forEach(card => {
      const id = String(card.dataset.bgId || '').trim();
      const bg = bgById.get(id) || null;
      const bgUnlocked = isAppearanceRewardUnlocked(bg, metrics, 'ios-mesh');
      card.classList.toggle('isActive', id === currentBg);
      card.classList.toggle('isLocked', !bgUnlocked && id !== 'ios-mesh');
      card.setAttribute('aria-pressed', id === currentBg ? 'true' : 'false');
      const bgBadge = card.querySelector('.appMenuThemeBadge');
      if (bgBadge && bg) {
        const progressText = buildAppearanceRewardProgressText(bg, metrics);
        const nextBgBadgeText = bgUnlocked ? 'Odemčeno' : ('Zamčeno · ' + (bg.unlockText || 'odměna za hraní') + progressText);
        if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(bgBadge, nextBgBadgeText, 'backgroundBadge-' + id);
        else bgBadge.textContent = nextBgBadgeText;
      }
      if (!card.dataset.bound) {
        card.dataset.bound = '1';
        card.addEventListener('click', () => {
          const nextBg = bgById.get(id) || null;
          if (!nextBg) return;
          const nextMetrics = getThemeUnlockMetrics(typeof gamesGetProfile === 'function' ? gamesGetProfile() : null);
          const nextUnlocked = isAppearanceRewardUnlocked(nextBg, nextMetrics, 'ios-mesh');
          if (!nextUnlocked) {
            if (bgHint) {
              const nextBgHintText = '';
              if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(bgHint, nextBgHintText, 'backgroundHintLocked');
              else bgHint.textContent = nextBgHintText;
            }
            return;
          }
          if (typeof applyBackgroundPreference === 'function') applyBackgroundPreference(id, true);
          renderThemeSettingsCards();
          if (bgHint) {
            const nextBgHintText = '';
            if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(bgHint, nextBgHintText, 'backgroundHintActive');
            else bgHint.textContent = nextBgHintText;
          }
        });
      }
    });
  }
  if (bgSummaryMeta) {
    const activeBgName = (bgById.get(currentBg) || bgList[0] || { label: 'iOS mesh' }).label;
    const nextBgSummary = 'Aktivní: ' + String(activeBgName);
    if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(bgSummaryMeta, nextBgSummary, 'backgroundSummaryMeta');
    else bgSummaryMeta.textContent = nextBgSummary;
  }

  if (summaryMeta) {
    const activeName = (themeById.get(current) || themeList[0] || { label: 'Výchozí' }).label;
    const rankPart = metrics.rank ? (' · Rank ' + String(metrics.rank)) : '';
    const nextThemeSummary = 'Aktivní: ' + String(activeName) + ' · ' + String(metrics.totalPlays) + ' her / ' + String(metrics.achievements) + ' achievementů' + rankPart;
    if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(summaryMeta, nextThemeSummary, 'themeSummaryMeta');
    else summaryMeta.textContent = nextThemeSummary;
  }

  if (hint) {
    const nextThemeHint = '';
    if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(hint, nextThemeHint, 'themeHintSummary');
    else hint.textContent = nextThemeHint;
  }
}

function getRakProfileAppearanceRewardHealth() {
  const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
  const metrics = getThemeUnlockMetrics(profile);
  const themes = Array.isArray(window.RAK_THEME_DEFS) ? window.RAK_THEME_DEFS : [];
  const backgrounds = Array.isArray(window.RAK_BACKGROUND_DEFS) ? window.RAK_BACKGROUND_DEFS : [];
  const themeRewards = themes.filter(item => String(item && item.id || '') !== 'default');
  const backgroundRewards = backgrounds.filter(item => String(item && item.id || '') !== 'ios-mesh');
  return {
    version: window.APP_VERSION || 'v.1.5 (963)',
    mode: 'profile-appearance-reward-health-v928',
    activeProfile: metrics.hasProfile,
    profileThemeStorage: 'account.uiSettings.themeId',
    profileBackgroundStorage: 'account.uiSettings.backgroundId',
    globalFallbackStorage: [RAK_THEME_STORAGE_KEY, RAK_BACKGROUND_STORAGE_KEY],
    metrics,
    themes: { total: themes.length, rewards: themeRewards.length, unlocked: themes.filter(item => isAppearanceRewardUnlocked(item, metrics, 'default')).length },
    backgrounds: { total: backgrounds.length, rewards: backgroundRewards.length, unlocked: backgrounds.filter(item => isAppearanceRewardUnlocked(item, metrics, 'ios-mesh')).length },
    note: 'Aktivní téma a pozadí se při přihlášeném profilu ukládají do uiSettings konkrétního účtu; localStorage je už jen fallback mimo profil.'
  };
}
window.getRakProfileAppearanceRewardHealth = getRakProfileAppearanceRewardHealth;

window.openGameShell = function openGameShellPublic(gameId) {
  const id = String(gameId || '').trim();
  if (!id) return false;
  if (typeof gamesStopActiveLoops === 'function') gamesStopActiveLoops();
  if (typeof app !== 'undefined') app.activeGameShell = id;
  if (typeof window.rakGameEngineActivate === 'function') window.rakGameEngineActivate(id, 'public-open');
  if (id === 'ttt' && typeof openTicTacToeGame === 'function') {
    openTicTacToeGame();
    return true;
  }
  if (document.body && document.body.classList) document.body.classList.add('gamesOpen');
  if (typeof renderGameShell === 'function') {
    renderGameShell(id);
    return true;
  }
  return false;
};


const rakInternalCloseGameShell = (typeof closeGameShell === 'function') ? closeGameShell : null;
window.closeGameShell = function closeGameShellProxy() {
  if (typeof rakInternalCloseGameShell === 'function') return rakInternalCloseGameShell();
  if (typeof document !== 'undefined' && document.body) {
    document.body.classList.remove('gamesOpen');
    document.body.classList.remove('tttOpen');
    if (document.body.dataset) delete document.body.dataset.rakArcadeGame;
  }
  if (typeof app !== 'undefined') app.activeGameShell = '';
  return true;
};


function syncGamesLockedSections() {
  const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
  const active = profile && profile.activeAccountId && profile.accounts ? profile.accounts[profile.activeAccountId] : null;
  const lockedEls = [
    document.querySelector('#games .gamesProfilesFolder'),
    document.querySelector('#games .gamesAchievementsFolder')
  ];
  lockedEls.forEach((el) => {
    if (!el) return;
    el.hidden = !active;
  });
  const duplicateStatsFolder = document.querySelector('#games .gamesStatsFolder');
  if (duplicateStatsFolder) duplicateStatsFolder.hidden = true;
}



window.addEventListener('load', () => {
  try {
    if (typeof applyThemePreference === 'function') applyThemePreference(getThemePreference(), false);
    if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
    if (typeof renderGamesProfileStatus === 'function') renderGamesProfileStatus();
    if (typeof applyProfileUiPreferencesForActiveAccount === 'function') applyProfileUiPreferencesForActiveAccount({ loadRemote: true, source: 'window-load' });
    if (typeof renderThemeSettingsCards === 'function') renderThemeSettingsCards();
  } catch (err) {}
}, { once: true });




function getRakDashboardGlassThemeHealth() {
  let rootStyle = null;
  let bodyClass = '';
  try { rootStyle = getComputedStyle(document.documentElement); } catch (err) { rootStyle = null; }
  try { bodyClass = String(document.body && document.body.className || ''); } catch (err) { bodyClass = ''; }
  const readVar = (name) => {
    try { return rootStyle ? String(rootStyle.getPropertyValue(name) || '').trim() : ''; } catch (err) { return ''; }
  };
  const theme = String(typeof getThemePreference === 'function' ? getThemePreference() : (document.documentElement.dataset.rakTheme || 'default'));
  const background = String(typeof getBackgroundPreference === 'function' ? getBackgroundPreference() : (document.documentElement.dataset.rakBackground || 'ios-mesh'));
  const lightweight = /(?:^|\s)(?:lightweightMode|lowEndDevice|ladaMode)(?:\s|$)/.test(bodyClass);
  return {
    ok: true,
    version: window.APP_VERSION || 'v.1.5 (963)',
    mode: 'dashboard-ios-glass-viewport-fit-v945',
    theme,
    background,
    themeAware: !!(readVar('--green') && readVar('--green2')),
    themeIconAware: true,
    dashboardCards: 'dark-unified-transparent-glass-viewport-fit-v945',
    dashboardPanelHeight: 'height-aware-balanced-360x800-slightly-taller-cards',
    viewportFit: {
      enabled: true,
      target: '360x800',
      strategy: 'CSS media queries podle šířky i výšky displeje, s chráněnou velikostí horního směnového panelu',
      dashboardScrollGoal: 'bez zbytečného scrollu na běžném 360×800 viewportu'
    },
    dashboardIcons: 'theme-color',
    activeBottomNavIcon: 'theme-color',
    glassVariables: {
      panel: readVar('--panel'),
      panel2: readVar('--panel2'),
      green: readVar('--green'),
      green2: readVar('--green2'),
      themeGlow: readVar('--rakThemeGlow'),
      themeBorder: readVar('--rakThemeBorder'),
      dashboardBlur: readVar('--rakDashboardGlassBlur')
    },
    selectors: [
      '#home .dashboardShell',
      '#home .dashboardHeroCard',
      '#home .dashboardCard',
      'body.lightweightMode #home .dashboardCard',
      'body.lowEndDevice #home .dashboardCard',
      'body.ladaMode #home .dashboardCard'
    ],
    lightweightSafe: lightweight ? 'blur-off' : 'full-glass',
    note: 'Dashboard panely drží tmavší odstín a průhledný glass; ve v945 zůstává horní směnový panel čitelný a běžné dashboard panely jsou lehce zvětšené, protože nad spodní lištou byla ještě rezerva.'
  };
}
window.getRakDashboardGlassThemeHealth = getRakDashboardGlassThemeHealth;
try {
  if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.register === 'function') {
    window.RaK.diagnostics.register('dashboardGlassTheme', getRakDashboardGlassThemeHealth);
  }
} catch (err) {}

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
