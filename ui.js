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

// 1.2 (1.10): Piškvorky jsou oddělené v games-gomoku.js.

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


// 1.2 (1.10): Administrace / Rozpisy a Nastavení strojů jsou oddělené v admin-rotation.js.




// 1.2 (1.10): Administrace / Reporty chyb jsou oddělené v admin-reports.js.

// 1.2 (1.10): Administrace / Přehled připojení, servis a oznámení jsou oddělené v admin-service-usage.js.

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
    '    <button type="button" class="appMenuAction" data-admin-action="open-food">Kantýna / jídelna</button>',
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

  const foodHtml = [
    '<div class="appMenuCard appMenuAdminCard adminFoodScheduleCard">',
    '  <div class="appMenuCardTitle">Kantýna / jídelna</div>',
    '  <div class="appMenuText">',
    '    <div>Tady si nastavíš běžnou otevírací dobu, přesčasovou dobu a seznam přesčasových nedělí. Datumy piš česky: třeba 11.1.2027.</div>',
    '    <div class="smallText" id="adminOnlineSaveStatus">Stav uložení se zobrazí po kliknutí na Uložit časy.</div>',
    '  </div>',
    buildAdminFoodScheduleSettingsHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-food-schedule">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-food-schedule">Uložit časy</button>',
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
  } else if (mode === 'food') {
    body.innerHTML = foodHtml;
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
try { window.RAK_REPORTS_KEY = RAK_REPORTS_KEY; } catch (err) {}

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
      updateLocalBugReportRecord(report.id, { uploadedOnline: true, adminDeleted: true, status: 'sent', adminStatus: 'sent' });
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




// 1.2 (1.10): Plovoucí odebrání a údržba editoru rozpisů jsou oddělené v admin-rotation.js.

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
        if (target.matches('[data-note-field="code"]')) {
          adminHideRotationSelectedRemove();
          adminCloseRotationQuickRemove();
          adminShowAbsenceCodePicker(target);
        } else if (target.matches('[data-rot-field^="cell-"], [data-note-field="person"]')) {
          adminCloseAbsenceCodePicker();
          adminShowRotationSelectedRemove(target);
          adminShowRotationQuickRemove(target);
        } else {
          adminHideRotationSelectedRemove();
          adminCloseAbsenceCodePicker();
        }
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
      if (adminAction === 'open-food') {
        openAppMenu('admin-food');
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
      if (adminAction === 'load-food-schedule') {
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function') {
          app.machineSettingsRows = await window.RotationSupabaseBridge.loadMachineSettings();
          try { if (typeof updateFoodTile === 'function') updateFoodTile(); } catch (err) {}
          try { if (typeof renderFoodSchedulePage === 'function') renderFoodSchedulePage(); } catch (err) {}
          renderAdminMenuBody(body, 'food');
          return;
        }
      }
      if (adminAction === 'save-food-schedule') {
        const foodSettings = readAdminFoodScheduleSettingsFromDom();
        const rows = mergeAdminFoodScheduleSettingsRows(foodSettings);
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function') {
          const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
          if (result && result.ok === false) throw (result.error || new Error('Uložení časů selhalo.'));
          app.machineSettingsRows = rows;
          try { if (typeof updateFoodTile === 'function') updateFoodTile(); } catch (err) {}
          try { if (typeof renderFoodSchedulePage === 'function') renderFoodSchedulePage(); } catch (err) {}
          renderAdminMenuBody(body, 'food');
          const statusEl = document.getElementById('adminOnlineSaveStatus');
          if (statusEl) statusEl.textContent = (result && result.queued)
            ? ('Časy uložené lokálně ✓ · po připojení se synchronizují')
            : ('Časy uložené online ✓');
          return;
        }
      }
      if (adminAction === 'load-machines') {
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function') {
          app.machineSettingsRows = await window.RotationSupabaseBridge.loadMachineSettings();
          try { if (typeof updateFoodTile === 'function') updateFoodTile(); } catch (err) {}
          try { if (typeof renderFoodSchedulePage === 'function') renderFoodSchedulePage(); } catch (err) {}
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
          try { if (typeof updateFoodTile === 'function') updateFoodTile(); } catch (err) {}
          try { if (typeof renderFoodSchedulePage === 'function') renderFoodSchedulePage(); } catch (err) {}
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
      const codePicker = document.getElementById('adminAbsenceCodePicker');
      if (codePicker && codePicker.classList && codePicker.classList.contains('isVisible')) {
        if (next === codePicker || (next && codePicker.contains && codePicker.contains(next))) return;
        if (!next || !next.matches || !next.matches('[data-note-field="code"]')) adminCloseAbsenceCodePicker();
      }
      const quick = document.getElementById('adminRotationQuickRemove');
      if (quick && quick.classList && quick.classList.contains('isVisible')) {
        if (next === quick || (next && quick.contains && quick.contains(next))) return;
        const shownAt = Number(window.__rakAdminRotationQuickRemoveShownAt || 0) || 0;
        // Mobilní klávesnice/focus občas po tapnutí pole hned vyvolá blur. Nezavírat rychlé Odebrat okamžitě po zobrazení.
        if (shownAt && Date.now() - shownAt < 8000) return;
      }
      if (!next || !next.matches || !next.matches('[data-rot-field], [data-note-field]')) adminCloseRotationQuickRemove();
    }, 120);
  });

  body.addEventListener('scroll', () => {
    if (body.dataset.adminView !== 'rotation') return;
    try {
      if (window.__rakAdminRotationScrollCloseRaf) return;
      window.__rakAdminRotationScrollCloseRaf = window.requestAnimationFrame(() => {
        window.__rakAdminRotationScrollCloseRaf = 0;
        const codeTarget = window.__rakAdminAbsenceCodeInput;
        if (codeTarget && codeTarget.isConnected && body.contains(codeTarget)) adminShowAbsenceCodePicker(codeTarget);
        else adminCloseAbsenceCodePicker();
        const target = window.__rakAdminRotationQuickRemoveInput;
        if (target && target.isConnected && body.contains(target)) adminShowRotationQuickRemove(target);
        else adminCloseRotationQuickRemove();
      });
    } catch (err) {
      const codeTarget = window.__rakAdminAbsenceCodeInput;
      if (codeTarget && codeTarget.isConnected && body.contains(codeTarget)) adminShowAbsenceCodePicker(codeTarget);
      else adminCloseAbsenceCodePicker();
      const target = window.__rakAdminRotationQuickRemoveInput;
      if (target && target.isConnected && body.contains(target)) adminShowRotationQuickRemove(target);
      else adminCloseRotationQuickRemove();
    }
  }, { passive: true });

  body.addEventListener('input', (event) => {
    const target = event.target;
    if (!target || typeof target.matches !== 'function') return;
    if (!target.matches('[data-rot-field], [data-note-field]')) return;
    if (target.matches('[data-note-field="code"]')) {
      adminCloseRotationQuickRemove();
      adminScheduleAbsenceCodePicker(target);
    } else if (adminRotationIsRemoveValue(target.value)) {
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
      if (target.matches('[data-note-field="code"]')) {
        adminCloseRotationQuickRemove();
        adminScheduleAbsenceCodePicker(target);
      } else {
        adminCloseAbsenceCodePicker();
        adminScheduleRotationQuickRemove(target);
      }
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
    } else if (v === 'admin-food') {
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          renderAdminMenuBody(body, 'food');
        } catch (err) {
          console.warn('Admin food preload failed', err);
          renderAdminMenuBody(body, 'food');
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

// -------------------------
// Games hub + account profile
// -------------------------
const GAMES_PROFILE_KEY = APP_KEY + ':games_profile_v1';
const GAMES_PROFILE_RESET_VERSION = 912;
const GAMES_SCORE_RESET_VERSION = 912;
const GAMES_SCORE_RESET_MARKER_KEY = APP_KEY + ':games_score_reset_v923';
const GAMES_REMOTE_STATS_RESET_CUTOFF_MS = Date.parse('2026-05-26T18:44:00+02:00');
const GAMES_MEMORY_SCORE_RESET_MARKER_KEY = APP_KEY + ':games_memory_score_reset_v990';
const GAMES_MEMORY_SCORE_RESET_CUTOFF_MS = Date.parse('2026-05-31T04:24:25+02:00');
const GAMES_MEMORY_SCORE_IDS = new Set(['memory', 'memory_4x4', 'memory_6x6', 'memory_8x8']);
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


function gamesIsMemoryScoreId(gameId) {
  return GAMES_MEMORY_SCORE_IDS.has(String(gameId || '').trim().toLowerCase());
}

function gamesIsMemoryRemoteStatAfterReset(row) {
  const gameType = String(row && (row.game_type || row.gameType || '') || '').trim().toLowerCase();
  if (!gamesIsMemoryScoreId(gameType)) return true;
  const cutoff = Number(GAMES_MEMORY_SCORE_RESET_CUTOFF_MS || 0) || 0;
  if (!Number.isFinite(cutoff) || cutoff <= 0) return true;
  return gamesRemoteStatPlayedTimestamp(row) >= cutoff;
}
if (typeof window !== 'undefined') {
  window.gamesIsMemoryRemoteStatAfterReset = gamesIsMemoryRemoteStatAfterReset;
}

function gamesEnsureMemoryScoreResetV990() {
  try {
    if (localStorage.getItem(GAMES_MEMORY_SCORE_RESET_MARKER_KEY) === '1') return false;
    const parsed = JSON.parse(localStorage.getItem(GAMES_PROFILE_KEY) || 'null');
    if (parsed && parsed.accounts && typeof parsed.accounts === 'object') {
      Object.keys(parsed.accounts).forEach((id) => {
        const acc = parsed.accounts[id];
        if (!acc || typeof acc !== 'object') return;
        if (!acc.stats || typeof acc.stats !== 'object') acc.stats = gamesEmptyStats();
        if (!acc.stats.arcade || typeof acc.stats.arcade !== 'object') acc.stats.arcade = {};
        Array.from(GAMES_MEMORY_SCORE_IDS).forEach((gid) => { delete acc.stats.arcade[gid]; });
        if (acc.achievements && Array.isArray(acc.achievements)) {
          acc.achievements = acc.achievements.filter((id) => String(id || '').indexOf('memory') !== 0);
        }
      });
      parsed.profileVersion = GAMES_PROFILE_RESET_VERSION;
      if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(GAMES_PROFILE_KEY, JSON.stringify(parsed));
      else localStorage.setItem(GAMES_PROFILE_KEY, JSON.stringify(parsed));
      if (app && typeof app === 'object') app.gamesProfile = parsed;
    }
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = String(localStorage.key(i) || '');
      const lower = k.toLowerCase();
      if (lower.indexOf('memory') >= 0 || lower.indexOf('pexeso') >= 0) toRemove.push(k);
      if (k.indexOf(APP_KEY + ':games_leaderboard_memory') === 0 || k.indexOf(APP_KEY + ':games_top_score_memory') === 0) toRemove.push(k);
    }
    Array.from(new Set(toRemove)).forEach((k) => { if (k !== GAMES_MEMORY_SCORE_RESET_MARKER_KEY) localStorage.removeItem(k); });
    if (app && typeof app === 'object') {
      app.gamesLeaderboardCache = app.gamesLeaderboardCache || {};
      app.gamesLeaderboardThrottle = app.gamesLeaderboardThrottle || {};
      Array.from(GAMES_MEMORY_SCORE_IDS).forEach((gid) => { delete app.gamesLeaderboardCache[gid]; delete app.gamesLeaderboardThrottle[gid]; });
    }
    if (typeof setLocalStorageIfChanged === 'function') setLocalStorageIfChanged(GAMES_MEMORY_SCORE_RESET_MARKER_KEY, '1');
    else localStorage.setItem(GAMES_MEMORY_SCORE_RESET_MARKER_KEY, '1');
    window.__rakGamesMemoryScoreResetV990 = { ok: true, cutoff: GAMES_MEMORY_SCORE_RESET_CUTOFF_MS, at: Date.now() };
    return true;
  } catch (err) {
    console.warn('gamesEnsureMemoryScoreResetV990 failed', err);
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
    gamesEnsureMemoryScoreResetV990();
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
  if (!gamesIsMemoryRemoteStatAfterReset(row)) return false;
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
