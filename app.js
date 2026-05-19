// v.1.1 (590) – Brusy: oprava překrývání indexů po dorovnání výšek, bez změny výpočtů.
(function setupErrorCapture() {
  const LOG_KEY = "rotace_err_log_v1";
  const MAX = 50;
  const readLog = () => {
    try { return JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); }
    catch (e) { return []; }
  };
  const writeLog = (arr) => {
    try { localStorage.setItem(LOG_KEY, JSON.stringify(arr.slice(-MAX))); } catch (e) {}
  };
  const push = (entry) => {
    const log = readLog();
    log.push(Object.assign({ ts: new Date().toISOString(), ver: (window.APP_VERSION || "?") }, entry));
    writeLog(log);
  };
  window.addEventListener("error", (ev) => {
    push({
      type: "error",
      msg: String(ev.message || ev.error || ""),
      src: String(ev.filename || ""),
      line: ev.lineno || 0,
      col: ev.colno || 0,
      stack: ev.error && ev.error.stack ? String(ev.error.stack).slice(0, 2000) : ""
    });
  });
  window.addEventListener("unhandledrejection", (ev) => {
    const r = ev.reason;
    push({
      type: "promise",
      msg: r && r.message ? String(r.message) : String(r),
      stack: r && r.stack ? String(r.stack).slice(0, 2000) : ""
    });
  });
  window.__rotaceDiag = function () {
    const log = readLog();
    const info = {
      version: window.APP_VERSION || "?",
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      time: new Date().toISOString(),
      errors: log
    };
    try {
      navigator.clipboard && navigator.clipboard.writeText(JSON.stringify(info, null, 2));
    } catch (e) {}
    return info;
  };
  window.__rotaceClearLog = function () {
    writeLog([]);
  };
})();


function installDelegatedAppActions() {
  if (window.__rotaceDelegatedAppActionsBound) return;
  window.__rotaceDelegatedAppActionsBound = true;

  const clickActions = {
    'show-food-kantyna': () => showFoodSchedule('kantyna'),
    'show-food-jidelna': () => showFoodSchedule('jidelna'),
    'page-soustruhy': () => showPage('soustruhy'),
    'page-frezky': () => showPage('frezky'),
    'page-brusy': () => showPage('brusy'),
    'page-kalkulacky': () => openKalkulacky(),
    'reset-soustruhy': () => resetSoustruhy(),
    'soustruh-mode': (el) => setSoustruhMode(String(el.dataset.soustruhMode || '')),
    'calc-soustruhy-lis': () => calcSoustruhyLis(),
    'soustruh126-start': (el) => {
      const start = parseInt(el.dataset.startsize || '', 10);
      if (Number.isFinite(start)) setSoustruh126Start(start);
    },
    'calc-soustruhy-126': () => calcSoustruhy126(),
    'calc-soustruhy-106': () => calcSoustruhy106(),
    'open-food-link': () => openExternalTile('https://sa.gthcatering.cz/restaurant/c1/'),
    'open-eportal-link': () => openEportal(),
    'open-payroll-link': () => openPayroll(),
    'calc-f': () => calcF(),
    'calc-f-finish': () => calcFFinish(),
    'calc-brusy': () => calcBrusy(),
    'calc-brusy-finish': () => calcBrusyFinish(),
    'calc-p': () => calcP(),
    'set-machine': (el) => setMachine(String(el.dataset.machine || '')),
    'set-prog': (el) => setProg(String(el.dataset.prog || '')),
    'reset-fields': (el) => {
      const raw = String(el.dataset.resetFields || '');
      const resultRaw = String(el.dataset.resetResults || '');
      const fields = raw.split(',').map((s) => s.trim()).filter(Boolean);
      const results = resultRaw.split(',').map((s) => s.trim()).filter(Boolean);
      if (fields.length || results.length) resetFields(fields, results);
    },
    'open-game': (el) => {
      const gameId = String(el.dataset.game || '').trim();
      if (gameId) openGameShell(gameId);
    },
    'calendar-open': () => openCalendarInRak()
  };

  document.addEventListener('click', (event) => {
    const target = event.target && typeof event.target.closest === 'function'
      ? event.target.closest('[data-action], [data-rak-open-calendar]')
      : null;
    if (!target) return;

    const direct = target.hasAttribute('data-rak-open-calendar') ? 'calendar-open' : String(target.getAttribute('data-action') || '').trim();
    const action = direct || '';
    const handler = clickActions[action];
    if (!handler) return;

    event.preventDefault();
    event.stopPropagation();
    handler(target);
  }, { passive: false });

  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented) return;
    const key = event.key;
    if (key !== 'Enter' && key !== ' ') return;
    const target = event.target && typeof event.target.closest === 'function'
      ? event.target.closest('[data-action], [data-rak-open-calendar]')
      : null;
    if (!target) return;
    const tag = String(target.tagName || '').toUpperCase();
    if (tag === 'BUTTON' || tag === 'A' || tag === 'SELECT' || tag === 'INPUT') return;
    const action = target.hasAttribute('data-rak-open-calendar') ? 'calendar-open' : String(target.getAttribute('data-action') || '').trim();
    const handler = clickActions[action];
    if (!handler) return;
    event.preventDefault();
    handler(target);
  });

  document.addEventListener('change', (event) => {
    const target = event.target && typeof event.target.closest === 'function'
      ? event.target.closest('select[data-action="month-select"]')
      : null;
    if (!target) return;
    app.selectedMonth = target.value || null;
    if (target.value) {
      renderMonth(target.value);
    }
    renderRotace();
    setRotaceView('months');
  });
}

function installBottomNavBindings() {
  const nav = document.querySelector('.bottomNav');
  if (!nav || nav.__rotaceBound) return;
  nav.__rotaceBound = true;

  const actionMap = {
    home: () => { showPage('home'); setBottomNavActive('home'); },
    rotace: () => { openRotaceNames(); },
    kalkulacky: () => { openKalkulacky(); },
    rozpisy: () => { openRotaceMonths(); },
    statistiky: () => { openRotaceStats(); },
    games: () => { openGamesPage(); },
    menu: () => { toggleAppMenu(); }
  };

  nav.addEventListener('click', (event) => {
    const btn = event.target && event.target.closest ? event.target.closest('button[data-action]') : null;
    if (!btn || !nav.contains(btn)) return;
    const handler = actionMap[btn.dataset.action];
    if (!handler) return;
    event.preventDefault();
    handler();
  }, { passive: false });
}

function runPhaseOneFinalAudit() {
  if (document.readyState === 'loading') {
    const rerun = () => runPhaseOneFinalAudit();
    if (typeof registerListener === 'function') {
      registerListener(document, 'DOMContentLoaded', rerun, { once: true });
    } else {
      document.addEventListener('DOMContentLoaded', rerun, { once: true });
    }
    return {
      version: window.APP_VERSION || 'unknown',
      phase: 'phase-1-final',
      checkedAt: new Date().toISOString(),
      ok: true,
      deferred: true
    };
  }

  const report = {
    version: window.APP_VERSION || 'unknown',
    phase: 'phase-1-final',
    checkedAt: new Date().toISOString(),
    ok: true,
    missingDom: [],
    missingStyles: [],
    duplicateIds: []
  };

  const requiredDom = [
    '#home',
    '#rotace',
    '#stats',
    '.bottomNav',
    '#dashKantyna',
    '#dashJidelna',
    '#games'
  ];

  requiredDom.forEach((selector) => {
    if (!document.querySelector(selector)) report.missingDom.push(selector);
  });

  const loadedStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((link) => String(link.getAttribute('href') || '').split('?')[0].trim())
    .filter(Boolean);
  [
    'styles.css',
    'styles-inline-legacy.css',
    'styles-calc-panels.css',
    'styles-games.css',
    'styles-overrides.css'
  ].forEach((href) => {
    if (!loadedStyles.some((item) => item.endsWith(href))) report.missingStyles.push(href);
  });

  const ids = new Map();
  document.querySelectorAll('[id]').forEach((el) => {
    const id = el.id;
    if (!ids.has(id)) ids.set(id, 0);
    ids.set(id, ids.get(id) + 1);
  });
  report.duplicateIds = Array.from(ids.entries())
    .filter(([, count]) => count > 1)
    .map(([id, count]) => ({ id, count }));

  report.ok = !report.missingDom.length && !report.missingStyles.length && !report.duplicateIds.length;
  try {
    document.documentElement.dataset.rakPhase1 = report.ok ? 'complete' : 'check';
    window.__rakPhase1Audit = report;
  } catch (err) {}

  if (!report.ok) {
    console.warn('[RaK] Phase 1 final audit', report);
    try {
      const log = JSON.parse(localStorage.getItem('rotace_err_log_v1') || '[]');
      log.push({
        ts: report.checkedAt,
        ver: report.version,
        type: 'phase1-audit',
        missingDom: report.missingDom,
        missingStyles: report.missingStyles,
        duplicateIds: report.duplicateIds
      });
      localStorage.setItem('rotace_err_log_v1', JSON.stringify(log.slice(-50)));
    } catch (err) {}
  }
  return report;
}

function runPhaseTwoCalcScopeAudit() {
  const calcPageIds = ['soustruhy', 'frezky', 'brusy', 'pracka'];
  const requiredResults = ['soustruhyLisResult', 'soustruhy126Result', 'soustruhy106Result', 'outF', 'outFTime', 'outB', 'outBTime', 'outP'];

  const run = () => {
    const report = {
      version: window.APP_VERSION || 'unknown',
      phase: 'phase-2-calc-system',
      checkedAt: new Date().toISOString(),
      ok: true,
      visibleInactive: [],
      missingResultCards: [],
      unscopedCalcButtons: [],
      overflowingPages: []
    };

    calcPageIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const style = window.getComputedStyle ? window.getComputedStyle(el) : null;

      if (!el.classList.contains('active')) {
        const isVisible = style && style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
        if (isVisible) report.visibleInactive.push(id);
      }

      if (el.classList.contains('active')) {
        const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        if (viewportWidth && el.scrollWidth > viewportWidth + 2) {
          report.overflowingPages.push({ id, scrollWidth: el.scrollWidth, viewportWidth });
        }
      }

      el.querySelectorAll('button[data-action^="calc-"]').forEach((button) => {
        if (!button.classList.contains('calcPrimaryBtn')) {
          report.unscopedCalcButtons.push(button.getAttribute('data-action') || button.id || 'unknown');
        }
      });
    });

    requiredResults.forEach((id) => {
      const el = document.getElementById(id);
      if (!el || !el.classList.contains('calcResultCard')) report.missingResultCards.push(id);
    });

    report.ok = !report.visibleInactive.length && !report.missingResultCards.length && !report.unscopedCalcButtons.length && !report.overflowingPages.length;
    try {
      document.documentElement.dataset.rakCalcScope = report.ok ? 'ok' : 'check';
      document.documentElement.dataset.rakPhase2 = report.ok ? 'complete' : 'check';
      window.__rakPhase2CalcScopeAudit = report;
    } catch (err) {}

    if (!report.ok) {
      console.warn('[RaK] Phase 2 calc final audit', report);
      try {
        const log = JSON.parse(localStorage.getItem('rotace_err_log_v1') || '[]');
        log.push({
          ts: report.checkedAt,
          ver: report.version,
          type: 'phase2-calc-final-audit',
          visibleInactive: report.visibleInactive,
          missingResultCards: report.missingResultCards,
          unscopedCalcButtons: report.unscopedCalcButtons,
          overflowingPages: report.overflowingPages
        });
        localStorage.setItem('rotace_err_log_v1', JSON.stringify(log.slice(-50)));
      } catch (err) {}
    }
    return report;
  };

  if (document.readyState === 'loading') {
    const rerun = () => setTimeout(run, 0);
    if (typeof registerListener === 'function') registerListener(document, 'DOMContentLoaded', rerun, { once: true });
    else document.addEventListener('DOMContentLoaded', rerun, { once: true });
    return { version: window.APP_VERSION || 'unknown', phase: 'phase-2-calc-system', ok: true, deferred: true };
  }

  requestAnimationFrame(() => setTimeout(run, 0));
  return { version: window.APP_VERSION || 'unknown', phase: 'phase-2-calc-system', ok: true, deferred: true };
}


function runPhaseThreeLightweightAudit() {
  const run = () => {
    const prefs = (typeof loadUiPrefs === 'function') ? loadUiPrefs() : null;
    const report = {
      version: window.APP_VERSION || 'unknown',
      phase: 'phase-3-lightweight-mode',
      checkedAt: new Date().toISOString(),
      lightweight: !!(document.body && document.body.classList && document.body.classList.contains('lightweightMode')),
      lightweightLabel: 'Láďův režim',
      autoSuggested: (typeof isLowEndDevice === 'function') ? !!isLowEndDevice() : null,
      reduceMotion: !!(document.body && document.body.classList && document.body.classList.contains('reduceMotion')),
      prefs,
      ok: true
    };
    try {
      document.documentElement.dataset.rakPhase3 = 'laduv-rezim-foundation';
      window.__rakPhase3LightweightAudit = report;
    } catch (err) {}
    return report;
  };

  if (document.readyState === 'loading') {
    const rerun = () => setTimeout(run, 0);
    if (typeof registerListener === 'function') registerListener(document, 'DOMContentLoaded', rerun, { once: true });
    else document.addEventListener('DOMContentLoaded', rerun, { once: true });
    return { version: window.APP_VERSION || 'unknown', phase: 'phase-3-lightweight-mode', ok: true, deferred: true };
  }

  requestAnimationFrame(() => setTimeout(run, 0));
  return { version: window.APP_VERSION || 'unknown', phase: 'phase-3-lightweight-mode', ok: true, deferred: true };
}


function applyBottomNavMoreHardFix() {
  const apply = () => {
    const btn = document.querySelector('nav.bottomNav > .bottomNavMenuBtn') || document.querySelector('nav.bottomNav .bottomNavMenuBtn');
    if (!btn || !btn.style) return false;

    const compact = window.matchMedia && window.matchMedia('(max-width: 390px)').matches;
    const lightweight = document.body && (document.body.classList.contains('lightweightMode') || document.body.classList.contains('lowEndDevice'));
    const peer = document.querySelector('nav.bottomNav > .bottomNavScroll > .bottomNavBtn:not(.bottomNavMenuBtn):not(.active)')
      || document.querySelector('nav.bottomNav > .bottomNavScroll > .bottomNavBtn:not(.bottomNavMenuBtn)');
    const peerRect = peer && peer.getBoundingClientRect ? peer.getBoundingClientRect() : null;
    const peerWidth = peerRect && peerRect.width ? Math.round(peerRect.width) : (compact ? 58 : 64);
    const widthPx = Math.max(lightweight ? 22 : 24, Math.min(Math.round(peerWidth * 0.42), lightweight ? 30 : 34));
    const width = String(widthPx) + 'px';
    const peerHeight = peerRect && peerRect.height ? Math.round(peerRect.height) : 46;
    const height = Math.max(lightweight ? 40 : 44, Math.min(peerHeight || 46, lightweight ? 50 : 56)) + 'px';
    const setStyle = typeof setStylePropertyIfChanged === 'function'
      ? setStylePropertyIfChanged
      : ((el, prop, value, priority) => { if (el && el.style) el.style.setProperty(prop, value, priority || ''); return true; });

    setStyle(btn, 'flex', '0 0 ' + width, 'important', 'bottomNavMore-flex');
    setStyle(btn, 'width', width, 'important', 'bottomNavMore-width');
    setStyle(btn, 'min-width', width, 'important', 'bottomNavMore-minWidth');
    setStyle(btn, 'max-width', width, 'important', 'bottomNavMore-maxWidth');
    setStyle(btn, 'height', height, 'important', 'bottomNavMore-height');
    setStyle(btn, 'min-height', height, 'important', 'bottomNavMore-minHeight');
    setStyle(btn, 'max-height', height, 'important', 'bottomNavMore-maxHeight');
    setStyle(btn, 'align-self', 'center', 'important', 'bottomNavMore-alignSelf');
    setStyle(btn, 'padding', lightweight ? '1px 0' : '2px 0 1px', 'important', 'bottomNavMore-padding');
    setStyle(btn, 'margin', '0', 'important', 'bottomNavMore-margin');
    setStyle(btn, 'box-sizing', 'border-box', 'important', 'bottomNavMore-boxSizing');
    setStyle(btn, 'justify-content', 'center', 'important', 'bottomNavMore-justify');
    setStyle(btn, 'gap', '1px', 'important', 'bottomNavMore-gap');
    setStyle(btn, 'transform', btn.classList.contains('active') ? 'translateY(-1px) scale(1.08)' : 'translateY(2px)', 'important', 'bottomNavMore-transform');

    const icon = btn.querySelector('.moreIcon');
    if (icon && icon.style) {
      const iconSize = lightweight ? '14px' : (compact ? '15px' : '16px');
      setStyle(icon, 'flex', '0 0 ' + iconSize, 'important', 'bottomNavMoreIcon-flex');
      setStyle(icon, 'width', iconSize, 'important', 'bottomNavMoreIcon-width');
      setStyle(icon, 'height', iconSize, 'important', 'bottomNavMoreIcon-height');
      setStyle(icon, 'max-width', iconSize, 'important', 'bottomNavMoreIcon-maxWidth');
      setStyle(icon, 'max-height', iconSize, 'important', 'bottomNavMoreIcon-maxHeight');
      setStyle(icon, 'padding', '0', 'important', 'bottomNavMoreIcon-padding');
      setStyle(icon, 'margin', '0 auto', 'important', 'bottomNavMoreIcon-margin');
      setStyle(icon, 'transform', 'none', 'important', 'bottomNavMoreIcon-transform');
      setStyle(icon, 'box-sizing', 'border-box', 'important', 'bottomNavMoreIcon-boxSizing');
    }

    const label = btn.querySelector('.bottomNavLabel');
    if (label && label.style) {
      setStyle(label, 'font-size', lightweight ? '7.4px' : '8px', 'important', 'bottomNavMoreLabel-fontSize');
      setStyle(label, 'line-height', '1', 'important', 'bottomNavMoreLabel-lineHeight');
      setStyle(label, 'margin', '0', 'important', 'bottomNavMoreLabel-margin');
      setStyle(label, 'padding', '0', 'important', 'bottomNavMoreLabel-padding');
      setStyle(label, 'white-space', 'nowrap', 'important', 'bottomNavMoreLabel-whiteSpace');
      setStyle(label, 'transform', 'none', 'important', 'bottomNavMoreLabel-transform');
    }
    return true;
  };

  const run = () => {
    apply();
    requestAnimationFrame(apply);
    setTimeout(apply, 80);
    setTimeout(apply, 350);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
  window.addEventListener('resize', () => requestAnimationFrame(apply), { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(apply, 120), { passive: true });
  window.__rakApplyBottomNavMoreHardFix = apply;
}

function runPhaseFourCleanupManagerAudit() {
  const run = () => {
    const report = {
      version: window.APP_VERSION || 'unknown',
      phase: 'phase-5-game-performance-realtime',
      checkedAt: new Date().toISOString(),
      ok: true,
      dashboard: { missingCards: [], missingValues: [], missingIcons: [], dLine: { exists: false, hasMain: false, hasSub: false } },
      bottomNav: { exists: false, missingButtons: [], menuAligned: false, allItemsAligned: false, menuBottomAligned: false, menuWidthAligned: false, menuHasIcon: false, menuHasLabel: false },
      stats: { machineGridExists: false, machineOneLine: false, machineTileCount: 0, machineRows: 0 }
    };

    const requiredDashboardCards = [
      'dashCalendar',
      'dashCountdown',
      'dashKantyna',
      'dashJidelna',
      'dashVyplata',
      'dashCzd',
      'dashFoodLink',
      'dashEportalLink'
    ];

    requiredDashboardCards.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) {
        report.dashboard.missingCards.push(id);
        return;
      }
      const value = el.querySelector('.dashboardValue');
      const icon = el.querySelector('.dashboardIconInline img, .dashboardIconInline svg, .dashboardIconImg, .dashboardIconSvg');
      const valueText = value && value.textContent ? value.textContent.trim() : '';
      if (!value || !valueText) report.dashboard.missingValues.push(id);
      if (!icon) report.dashboard.missingIcons.push(id);
    });

    const dLine = document.querySelector('#dashHero .dashboardHeroLine3Pill');
    report.dashboard.dLine.exists = !!dLine;
    report.dashboard.dLine.hasMain = !!(dLine && dLine.querySelector('.dashboardHeroLine3Main'));
    report.dashboard.dLine.hasSub = !!(dLine && dLine.querySelector('.dashboardHeroLine3Sub'));


    const bottomNav = document.querySelector('.bottomNav');
    report.bottomNav.exists = !!bottomNav;
    const requiredNavActions = ['home', 'rotace', 'kalkulacky', 'rozpisy', 'statistiky', 'games', 'menu'];
    if (bottomNav) {
      requiredNavActions.forEach((action) => {
        if (!bottomNav.querySelector('[data-action="' + action + '"]')) report.bottomNav.missingButtons.push(action);
      });
      const menuBtn = bottomNav.querySelector('.bottomNavMenuBtn');
      report.bottomNav.menuHasIcon = !!(menuBtn && menuBtn.querySelector('.moreIcon'));
      report.bottomNav.menuHasLabel = !!(menuBtn && menuBtn.querySelector('.bottomNavLabel'));
      if (menuBtn && window.getComputedStyle) {
        const menuRect = menuBtn.getBoundingClientRect();
        const peerButtons = Array.from(bottomNav.querySelectorAll('.bottomNavBtn')).filter(Boolean);
        const peer = bottomNav.querySelector('.bottomNavBtn:not(.bottomNavMenuBtn):not(.active)') || bottomNav.querySelector('.bottomNavBtn:not(.bottomNavMenuBtn)');
        const peerRect = peer ? peer.getBoundingClientRect() : null;
        report.bottomNav.menuAligned = !!(peerRect && Math.abs(menuRect.top - peerRect.top) <= 5 && Math.abs(menuRect.height - peerRect.height) <= 6);
        report.bottomNav.menuBottomAligned = !!(peerRect && Math.abs(menuRect.bottom - peerRect.bottom) <= 4);
        // Více má být záměrně užší než ostatní záložky, ale výškově zarovnané.
        report.bottomNav.menuWidthAligned = !!(peerRect && menuRect.width <= peerRect.width - 6 && menuRect.width >= 22);
        report.bottomNav.allItemsAligned = peerButtons.length > 0 && peerButtons.every((btn) => {
          const rect = btn.getBoundingClientRect();
          return Math.abs(rect.bottom - menuRect.bottom) <= 5 && Math.abs(rect.height - menuRect.height) <= 7;
        });
      } else {
        report.bottomNav.menuAligned = !!menuBtn;
        report.bottomNav.menuBottomAligned = !!menuBtn;
        report.bottomNav.menuWidthAligned = !!menuBtn;
        report.bottomNav.allItemsAligned = !!menuBtn;
      }
    }

    const statsMachineGrid = document.getElementById('statsMachineGrid');
    report.stats.machineGridExists = !!statsMachineGrid;
    if (statsMachineGrid && window.getComputedStyle) {
      const machineTiles = Array.from(statsMachineGrid.querySelectorAll('.statsMachineTile, .listItem')).filter(Boolean);
      report.stats.machineTileCount = machineTiles.length;
      const tops = [];
      machineTiles.forEach((tile) => {
        const rect = tile.getBoundingClientRect();
        const top = Math.round(rect.top);
        if (!tops.some((value) => Math.abs(value - top) <= 2)) tops.push(top);
      });
      report.stats.machineRows = tops.length;
      report.stats.machineOneLine = machineTiles.length > 0 && tops.length <= 1;
    } else {
      report.stats.machineOneLine = !!statsMachineGrid;
    }

    report.ok = !report.dashboard.missingCards.length
      && !report.dashboard.missingValues.length
      && !report.dashboard.missingIcons.length
      && report.dashboard.dLine.exists
      && report.dashboard.dLine.hasMain
      && report.dashboard.dLine.hasSub
      && report.bottomNav.exists
      && !report.bottomNav.missingButtons.length
      && report.bottomNav.menuHasIcon
      && report.bottomNav.menuHasLabel
      && report.bottomNav.menuAligned
      && report.bottomNav.menuBottomAligned
      && report.bottomNav.menuWidthAligned
      && report.bottomNav.allItemsAligned
      && report.stats.machineGridExists;
    try {
      document.documentElement.dataset.rakPhase4 = report.ok ? 'cleanup-manager-start' : 'dashboard-check';
      window.__rakPhase4CleanupAudit = report;
    } catch (err) {}

    if (!report.ok) {
      console.warn('[RaK] Phase 4 cleanup/dashboard/bottom-nav audit', report);
      try {
        if (typeof forceHomeRefresh === 'function') forceHomeRefresh();
      } catch (err) {}
    }
    return report;
  };

  if (document.readyState === 'loading') {
    const rerun = () => setTimeout(run, 220);
    if (typeof registerListener === 'function') registerListener(document, 'DOMContentLoaded', rerun, { once: true });
    else document.addEventListener('DOMContentLoaded', rerun, { once: true });
    return { version: window.APP_VERSION || 'unknown', phase: 'phase-5-game-performance-realtime', ok: true, deferred: true };
  }

  requestAnimationFrame(() => setTimeout(run, 220));
  return { version: window.APP_VERSION || 'unknown', phase: 'phase-5-game-performance-realtime', ok: true, deferred: true };
}


function runPhaseFiveGamePerformanceAudit() {
  const run = () => {
    const report = {
      version: window.APP_VERSION || 'unknown',
      phase: 'phase-5-game-performance-complete',
      checkedAt: new Date().toISOString(),
      ok: true,
      games: {
        activeShell: !!(window.app && window.app.activeGameShell),
        arcadeLoaded: !!window.__rakArcadeLoaded,
        perfManager: !!window.__rakGamePerfManager,
        stopLoops: typeof window.gamesStopActiveLoops === 'function',
        leaderboardThrottle: !!(window.app && window.app.gamesLeaderboardThrottle),
        shellRenderSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.shellRenderSkips || 0),
        intervalHiddenSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.intervalHiddenSkips || 0),
        activeManagedIntervals: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.activeManagedIntervals || 0),
        leaderboardTtlMs: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.leaderboardTtlMs || 0),
        pageLifecycleBound: !!window.__rakGamePerfPageLifecycleBound,
        pageHideCount: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.pageHideCount || 0),
        pageShowCount: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.pageShowCount || 0),
        launchRenderSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.launchRenderSkips || 0),
        statsRenderSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.statsRenderSkips || 0),
        scheduledStatsRenders: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.scheduledStatsRenders || 0),
        statsIdlePending: !!(window.__rakGamePerfManager && window.__rakGamePerfManager.statsIdlePending),
        profileSyncRuns: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.profileSyncRuns || 0),
        profileSyncSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.profileSyncSkips || 0),
        profileSyncInFlightSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.profileSyncInFlightSkips || 0),
        profileSyncOfflineSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.profileSyncOfflineSkips || 0),
        profileSyncHiddenSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.profileSyncHiddenSkips || 0),
        profileRenderSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.profileRenderSkips || 0),
        achievementRenderSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.achievementRenderSkips || 0),
        leaderboardInFlightSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.leaderboardInFlightSkips || 0),
        leaderboardHiddenSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.leaderboardHiddenSkips || 0),
        hubRenderRuns: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.hubRenderRuns || 0),
        hubActiveShellSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.hubActiveShellSkips || 0),
        launchObserverBatches: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.launchObserverBatches || 0),
        launchObserverSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.launchObserverSkips || 0),
        launchObserverIgnored: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.launchObserverIgnored || 0),
        launchObserverRoot: String(window.__rakGamePerfManager && window.__rakGamePerfManager.launchObserverRoot || ''),
        statsRenderRuns: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.statsRenderRuns || 0),
        profileRenderRuns: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.profileRenderRuns || 0),
        achievementRenderRuns: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.achievementRenderRuns || 0),
        leaderboardRefreshRuns: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.leaderboardRefreshRuns || 0),
        leaderboardCacheHits: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.leaderboardCacheHits || 0),
        leaderboardFreshLoads: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.leaderboardFreshLoads || 0),
        onlineRefreshRuns: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.onlineRefreshRuns || 0),
        onlineRefreshSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.onlineRefreshSkips || 0),
        liveLeaderboardRefreshRuns: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.liveLeaderboardRefreshRuns || 0),
        liveLeaderboardRefreshSkips: Number(window.__rakGamePerfManager && window.__rakGamePerfManager.liveLeaderboardRefreshSkips || 0)
      }
    };
    report.ok = report.games.stopLoops && (report.games.arcadeLoaded ? report.games.perfManager && report.games.pageLifecycleBound : true);
    report.games.shellRerenderGuard = report.games.arcadeLoaded ? (typeof window.__rakGamePerfManager === 'object' && 'shellRenderSkips' in window.__rakGamePerfManager) : true;
    try {
      document.documentElement.dataset.rakPhase5 = report.ok ? 'game-performance-complete' : 'game-performance-check';
      window.__rakPhase5GamePerformanceAudit = report;
    } catch (err) {}
    if (!report.ok) console.warn('[RaK] Phase 5 game performance audit', report);
    return report;
  };

  if (document.readyState === 'loading') {
    const rerun = () => setTimeout(run, 260);
    if (typeof registerListener === 'function') registerListener(document, 'DOMContentLoaded', rerun, { once: true });
    else document.addEventListener('DOMContentLoaded', rerun, { once: true });
    return { version: window.APP_VERSION || 'unknown', phase: 'phase-5-game-performance-complete', ok: true, deferred: true };
  }

  requestAnimationFrame(() => setTimeout(run, 260));
  return { version: window.APP_VERSION || 'unknown', phase: 'phase-5-game-performance-complete', ok: true, deferred: true };
}


function runPhaseSevenDataOptimizationAudit() {
  const run = () => {
    const dataStatus = typeof window.getDataOptimizationStatus === 'function' ? window.getDataOptimizationStatus() : null;
    const report = {
      version: window.APP_VERSION || 'unknown',
      phase: 'phase-7-data-optimization-style-guard',
      checkedAt: new Date().toISOString(),
      ok: !!dataStatus,
      dataOptimization: dataStatus || null
    };
    try {
      document.documentElement.dataset.rakPhase7 = report.ok ? 'data-optimization-style-guard' : 'data-optimization-check';
      window.__rakPhase7DataOptimizationAudit = report;
    } catch (err) {}
    if (!report.ok) console.warn('[RaK] Phase 7 data optimization audit', report);
    return report;
  };

  if (document.readyState === 'loading') {
    const rerun = () => setTimeout(run, 300);
    if (typeof registerListener === 'function') registerListener(document, 'DOMContentLoaded', rerun, { once: true });
    else document.addEventListener('DOMContentLoaded', rerun, { once: true });
    return { version: window.APP_VERSION || 'unknown', phase: 'phase-7-data-optimization-style-guard', ok: true, deferred: true };
  }

  requestAnimationFrame(() => setTimeout(run, 300));
  return { version: window.APP_VERSION || 'unknown', phase: 'phase-7-data-optimization-style-guard', ok: true, deferred: true };
}


(async () => {
  const files = [
    "core.js",
    "lifecycle.js",
    "qr.js",
    "payroll.js",
    "brusy.js",
    "stats.js",
    "dashboard.js",
    "soustruhy.js",
    "rotace.js",
    "changelog.js",
    "ui.js",
    "games-arcade.js",
    "export.js",
    "supabase-config.js",
    "supabase-bridge.js",
    "app-init.js"
  ];

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Nepodařilo se načíst ${src}`));
    document.head.appendChild(script);
  });

  for (const file of files) {
    await loadScript(file);
  }

  installPwaAndConnectivityHooks();
  installBottomNavBindings();
  try { applyBottomNavMoreHardFix(); } catch (err) { console.warn('Bottom nav Více hard-fix failed', err); }
  installDelegatedAppActions();
  try { runPhaseOneFinalAudit(); } catch (err) { console.warn('Phase 1 final audit failed', err); }
  try { runPhaseTwoCalcScopeAudit(); } catch (err) { console.warn('Phase 2 calc scope audit failed', err); }
  try { runPhaseThreeLightweightAudit(); } catch (err) { console.warn('Phase 3 lightweight audit failed', err); }
  try { runPhaseFourCleanupManagerAudit(); } catch (err) { console.warn('Phase 4 cleanup manager audit failed', err); }
  try { runPhaseFiveGamePerformanceAudit(); } catch (err) { console.warn('Phase 5 game performance audit failed', err); }
  try { runPhaseSevenDataOptimizationAudit(); } catch (err) { console.warn('Phase 7 data optimization audit failed', err); }

  try {
    if (typeof window.__rotaceBootHomeRefreshLate === 'function') {
      window.__rotaceBootHomeRefreshLate();
    } else if (typeof bootHomeRefresh === 'function') {
      bootHomeRefresh();
    }
  } catch (err) {
    console.warn('Post-load boot failed', err);
  }

  // Self-test – ohlásí chybějící klíčové části (do konzole + do logu).
  try {
    const required = {
      "globální app": typeof app !== "undefined" && app,
      "app.rotation": typeof app !== "undefined" && app && app.rotation && app.rotation.months,
      "renderRotace": typeof renderRotace === "function",
      "renderStatsPanel": typeof renderStatsPanel === "function",
      "saveRotationData": typeof saveRotationData === "function",
      "DOM #home": !!document.getElementById("home"),
      "DOM #rotace": !!document.getElementById("rotace"),
      "DOM #stats": !!document.getElementById("stats"),
      "DOM .bottomNav": !!document.querySelector(".bottomNav"),
      "DOM #games": !!document.getElementById("games")
    };
    const missing = Object.entries(required).filter(([_, v]) => !v).map(([k]) => k);
    if (missing.length) {
      console.warn("[Rotace] Self-test: chybí", missing);
      try {
        const log = JSON.parse(localStorage.getItem("rotace_err_log_v1") || "[]");
        log.push({
          ts: new Date().toISOString(),
          ver: window.APP_VERSION || "?",
          type: "selftest",
          missing
        });
        localStorage.setItem("rotace_err_log_v1", JSON.stringify(log.slice(-50)));
      } catch (e) {}
    } else {
    }
  } catch (err) {
    console.warn("Self-test selhal", err);
  }


function installPwaAndConnectivityHooks() {
  if (window.__rotacePwaBootstrapped) return;
  window.__rotacePwaBootstrapped = true;

  const setConnectionFlag = () => {
    try {
      document.documentElement.dataset.connection = navigator.onLine ? 'online' : 'offline';
    } catch (err) {}
  };

  const LIVE_REFRESH_INTERVAL_MS = 4 * 60 * 1000;
  const SW_UPDATE_CHECK_INTERVAL_MS = 10 * 60 * 1000;
  const SW_VERSION_MISMATCH_CHECK_MS = 45 * 1000;
  const STALE_REFRESH_GUARD_MS = 15 * 1000;
  const LIVE_CHANNEL_NAME = 'rotace-live-updates';
  const SW_UPDATE_NOTICE_KEY = 'rotace_sw_update_notice_v1';
  const SW_UPDATE_PENDING_KEY = 'rotace_sw_update_pending_v1';
  const SW_UPDATE_SUPPRESS_KEY = 'rotace_sw_update_suppress_v1';
  const tabId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let liveRefreshPromise = null;
  let lastLiveRefreshAt = 0;
  let liveRefreshTimer = null;
  let liveChannel = null;
  let swRegistrationPromise = null;
  let swRegistrationInstance = null;
  let swUpdateTimer = null;
  let swUpdateToastEl = null;
  let swUpdateButtonEl = null;
  let swNextUpdateVersion = "";
  let swUpdateReloading = false;
  let swUpdateCheckPromise = null;
  let lastSwUpdateCheckAt = 0;
  let lastSwVersionMismatchCheckAt = 0;
  let deferredInstallPrompt = null;

  const pwaHardeningStatus = window.__rakPwaHardeningStatus || {
    phase: 'phase-8-pwa-service-worker-hardening',
    phasePercent: 36,
    updateChecks: 0,
    updateCheckSkips: 0,
    updateCheckJoins: 0,
    registrationUpdates: 0,
    registrationUpdateErrors: 0,
    swMessages: 0,
    swVersionMessages: 0,
    swActivatedMessages: 0,
    swCacheStatusMessages: 0,
    swCacheStatusRequests: 0,
    swCacheStatusErrors: 0,
    swCacheVersion: '',
    swStaticCacheEntries: 0,
    swRuntimeCacheEntries: 0,
    swAppShellCount: 0,
    swPrecacheSuccessCount: 0,
    swPrecacheFailedCount: 0,
    swClientsCount: 0,
    swNavigationPreloadEnabled: false,
    swExpectedCacheVersion: '',
    swVersionMismatch: false,
    swVersionMismatchCount: 0,
    swVersionMismatchUpdateChecks: 0,
    swVersionMismatchUpdateSkips: 0,
    swLastVersionMismatchSource: '',
    swLastCacheStatusAt: 0,
    swLastCacheStatusSource: '',
    lastUpdateSource: '',
    lastUpdateCheckAt: 0,
    lastUpdateSkipSource: '',
    lastMessageType: '',
    throttleMs: SW_UPDATE_CHECK_INTERVAL_MS
  };
  window.__rakPwaHardeningStatus = pwaHardeningStatus;
  window.getPwaHardeningStatus = function getPwaHardeningStatus() {
    return Object.assign({}, pwaHardeningStatus, {
      hasController: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
      updateToastVisible: !!(swUpdateToastEl && document.body && document.body.contains(swUpdateToastEl)),
      updateReloading: !!swUpdateReloading,
      lastUpdateCheckAgoMs: pwaHardeningStatus.lastUpdateCheckAt ? Math.max(0, Date.now() - pwaHardeningStatus.lastUpdateCheckAt) : null
    });
  };

  const runLiveRefresh = async (reason, opts = {}) => {
    const force = !!(opts && opts.force);
    if (!navigator.onLine && !force) return 'offline';
    if (liveRefreshPromise && !force) return liveRefreshPromise;
    const now = Date.now();
    if (!force && now - lastLiveRefreshAt < STALE_REFRESH_GUARD_MS && reason !== 'manual') {
      return 'throttled';
    }

    liveRefreshPromise = (async () => {
      try {
        if (navigator.onLine && typeof refreshPublicData === 'function') {
          await refreshPublicData();
        }
        if (navigator.onLine && window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.bindRealtimeSubscriptions === 'function') {
          window.RotationSupabaseBridge.bindRealtimeSubscriptions();
        }
        if (navigator.onLine && typeof flushSupabaseSyncQueue === 'function') {
          await flushSupabaseSyncQueue();
        }
        if (navigator.onLine && typeof syncRotationFromSupabase === 'function') {
          await syncRotationFromSupabase(false);
        }
        if (navigator.onLine && window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function' && typeof app !== 'undefined') {
          const machineRows = await window.RotationSupabaseBridge.loadMachineSettings().catch(() => null);
          if (Array.isArray(machineRows) && machineRows.length) {
            app.machineSettingsRows = machineRows;
            if (typeof renderBrusy === 'function') renderBrusy();
            if (typeof renderSoustruhy === 'function') renderSoustruhy();
          }
        }
        if (navigator.onLine && typeof gamesRefreshRemoteLeaderboards === 'function') {
          const gamesPage = document.getElementById('games');
          const gamesHubVisible = !!(gamesPage && gamesPage.classList && gamesPage.classList.contains('active'));
          const gameShellActive = !!(window.app && window.app.activeGameShell);
          const gamePerf = window.__rakGamePerfManager || null;
          // Fáze 5 finále: běžný live refresh celé appky už netahá herní leaderboardy,
          // pokud uživatel není přímo na hubu her. Tím se hry neprobouzí na pozadí.
          if (gamesHubVisible && !gameShellActive && document.visibilityState !== 'hidden') {
            if (gamePerf) gamePerf.liveLeaderboardRefreshRuns = Number(gamePerf.liveLeaderboardRefreshRuns || 0) + 1;
            await gamesRefreshRemoteLeaderboards().catch(() => []);
          } else if (gamePerf) {
            gamePerf.liveLeaderboardRefreshSkips = Number(gamePerf.liveLeaderboardRefreshSkips || 0) + 1;
          }
        }
        if (typeof forceHomeRefresh === 'function') forceHomeRefresh();
        if (typeof renderRotace === 'function') renderRotace();
        if (typeof renderStatsPanel === 'function') renderStatsPanel();
        return reason || 'done';
      } catch (err) {
        console.warn('Live refresh hook failed', err);
        return 'failed';
      } finally {
        lastLiveRefreshAt = Date.now();
        liveRefreshPromise = null;
      }
    })();

    return liveRefreshPromise;
  };

  const broadcastState = (payload) => {
    try {
      localStorage.setItem('rotace_live_signal_v1', JSON.stringify(payload));
    } catch (err) {}
    try {
      if (liveChannel) liveChannel.postMessage(payload);
    } catch (err) {}
  };

  const getAppVersionTag = () => String(window.APP_VERSION || '').trim() || 'unknown';

  const getStoredUpdateNoticeVersion = () => {
    try { return sessionStorage.getItem(SW_UPDATE_NOTICE_KEY) || ''; } catch (err) { return ''; }
  };

  const setStoredUpdateNoticeVersion = (value) => {
    try {
      if (value) sessionStorage.setItem(SW_UPDATE_NOTICE_KEY, value);
      else sessionStorage.removeItem(SW_UPDATE_NOTICE_KEY);
    } catch (err) {}
  };

  const getPendingUpdateVersion = () => {
    try { return sessionStorage.getItem(SW_UPDATE_PENDING_KEY) || ''; } catch (err) { return ''; }
  };

  const setPendingUpdateVersion = (value) => {
    try {
      if (value) sessionStorage.setItem(SW_UPDATE_PENDING_KEY, value);
      else sessionStorage.removeItem(SW_UPDATE_PENDING_KEY);
    } catch (err) {}
  };

  const getSuppressUpdateToast = () => {
    try { return localStorage.getItem(SW_UPDATE_SUPPRESS_KEY) || ''; } catch (err) { return ''; }
  };

  const setSuppressUpdateToast = (value) => {
    try {
      if (value) localStorage.setItem(SW_UPDATE_SUPPRESS_KEY, value);
      else localStorage.removeItem(SW_UPDATE_SUPPRESS_KEY);
    } catch (err) {}
  };

  const removeUpdateToast = () => {
    if (swUpdateToastEl && swUpdateToastEl.parentNode) {
      swUpdateToastEl.parentNode.removeChild(swUpdateToastEl);
    }
    swUpdateToastEl = null;
    swUpdateButtonEl = null;
  };

  const clearUpdatePromptIfStale = () => {
    const version = getAppVersionTag();
    const seen = getStoredUpdateNoticeVersion();
    const pending = getPendingUpdateVersion();
    const suppress = getSuppressUpdateToast();
    if (seen && seen !== version && pending !== version) setStoredUpdateNoticeVersion('');
    if (pending && pending !== version) setPendingUpdateVersion('');
    if (suppress && suppress !== version) setSuppressUpdateToast('');
  };

  const formatServiceWorkerVersionLabel = (version, fallback) => {
    const raw = String(version || fallback || '').trim();
    if (!raw) return '';
    const m = /^v?1\.1-(\d+)$/i.exec(raw);
    if (m) return 'v.1.1 (' + m[1] + ')';
    return raw;
  };

  const getExpectedServiceWorkerCacheVersion = () => {
    const raw = getAppVersionTag();
    const m = /v\.1\.1\s*\((\d+)\)/i.exec(raw);
    if (m) return 'v1.1-' + m[1];
    return String(raw || '').replace(/^v\./i, 'v').replace(/\s*\((\d+)\)\s*$/, '-$1').replace(/\s+/g, '');
  };

  const scheduleVersionMismatchUpdateCheck = (source) => {
    const now = Date.now();
    if (lastSwVersionMismatchCheckAt && now - lastSwVersionMismatchCheckAt < SW_VERSION_MISMATCH_CHECK_MS) {
      pwaHardeningStatus.swVersionMismatchUpdateSkips = Number(pwaHardeningStatus.swVersionMismatchUpdateSkips || 0) + 1;
      return false;
    }
    lastSwVersionMismatchCheckAt = now;
    pwaHardeningStatus.swVersionMismatchUpdateChecks = Number(pwaHardeningStatus.swVersionMismatchUpdateChecks || 0) + 1;
    if (typeof refreshServiceWorkerRegistration === 'function') {
      void refreshServiceWorkerRegistration('version-mismatch:' + String(source || 'cache-status'), { force: true });
      return true;
    }
    return false;
  };

  const updateToastVersionLine = (version) => {
    const label = formatServiceWorkerVersionLabel(version, '');
    if (label) swNextUpdateVersion = label;
    const el = swUpdateToastEl ? swUpdateToastEl.querySelector('.rakUpdateToastVersion') : null;
    if (el) {
      el.textContent = swNextUpdateVersion ? ('Nová verze: ' + swNextUpdateVersion) : 'Nová verze: zjišťuji…';
    }
  };

  const requestWaitingServiceWorkerVersion = (registration) => {
    try {
      const worker = registration && registration.waiting;
      if (!worker || worker.__rotaceVersionRequested) return;
      worker.__rotaceVersionRequested = true;
      worker.postMessage({ type: 'GET_VERSION' });
    } catch (err) {}
  };

  const applyServiceWorkerCacheStatus = (data, source) => {
    if (!data) return;
    pwaHardeningStatus.swCacheStatusMessages = Number(pwaHardeningStatus.swCacheStatusMessages || 0) + 1;
    pwaHardeningStatus.swCacheVersion = String(data.cacheVersion || data.version || '');
    pwaHardeningStatus.swStaticCacheEntries = Number(data.staticCacheEntries || 0);
    pwaHardeningStatus.swRuntimeCacheEntries = Number(data.runtimeCacheEntries || 0);
    pwaHardeningStatus.swAppShellCount = Number(data.appShellCount || 0);
    pwaHardeningStatus.swPrecacheSuccessCount = Number(data.precacheSuccessCount || 0);
    pwaHardeningStatus.swPrecacheFailedCount = Number(data.precacheFailedCount || 0);
    pwaHardeningStatus.swClientsCount = Number(data.clientsCount || 0);
    pwaHardeningStatus.swNavigationPreloadEnabled = !!data.navigationPreloadEnabled;
    pwaHardeningStatus.swLastCacheStatusAt = Date.now();
    pwaHardeningStatus.swLastCacheStatusSource = String(source || data.type || 'cache-status');
    const expectedCacheVersion = getExpectedServiceWorkerCacheVersion();
    const reportedCacheVersion = String(data.cacheVersion || data.version || '').trim();
    pwaHardeningStatus.swExpectedCacheVersion = expectedCacheVersion;
    const mismatch = !!(expectedCacheVersion && reportedCacheVersion && reportedCacheVersion !== expectedCacheVersion);
    pwaHardeningStatus.swVersionMismatch = mismatch;
    if (mismatch) {
      pwaHardeningStatus.swVersionMismatchCount = Number(pwaHardeningStatus.swVersionMismatchCount || 0) + 1;
      pwaHardeningStatus.swLastVersionMismatchSource = String(source || data.type || 'cache-status');
      scheduleVersionMismatchUpdateCheck(source || data.type || 'cache-status');
    }
    if (data.error) {
      pwaHardeningStatus.swCacheStatusErrors = Number(pwaHardeningStatus.swCacheStatusErrors || 0) + 1;
      pwaHardeningStatus.swLastCacheStatusError = String(data.error || 'cache-status-error');
    }
  };

  const requestActiveServiceWorkerCacheStatus = (source) => {
    try {
      if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return false;
      pwaHardeningStatus.swCacheStatusRequests = Number(pwaHardeningStatus.swCacheStatusRequests || 0) + 1;
      pwaHardeningStatus.swLastCacheStatusSource = String(source || 'request');
      navigator.serviceWorker.controller.postMessage({ type: 'GET_CACHE_STATUS', source: source || 'app' });
      return true;
    } catch (err) {
      pwaHardeningStatus.swCacheStatusErrors = Number(pwaHardeningStatus.swCacheStatusErrors || 0) + 1;
      pwaHardeningStatus.swLastCacheStatusError = err && err.message ? err.message : String(err || 'cache-status-request-error');
      return false;
    }
  };

  const scheduleUpdateReload = (reason) => {
    if (swUpdateReloading) return;
    if (!getPendingUpdateVersion()) return;
    swUpdateReloading = true;
    removeUpdateToast();
    try { setPendingUpdateVersion(getAppVersionTag()); } catch (err) {}
    try { setSuppressUpdateToast(getAppVersionTag()); } catch (err) {}
    const reloadFn = () => {
      try { window.location.reload(); } catch (err) {
        window.location.href = window.location.href;
      }
    };
    if (typeof registerTimeout === 'function') registerTimeout(reloadFn, reason === 'sw-activated' ? 80 : 160);
    else window.setTimeout(reloadFn, reason === 'sw-activated' ? 80 : 160);
  };

  const ensureUpdateToast = () => {
    if (swUpdateToastEl && document.body.contains(swUpdateToastEl)) return swUpdateToastEl;
    removeUpdateToast();
    const toast = document.createElement('div');
    toast.className = 'rakUpdateToast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <div class="rakUpdateToastMain">
        <div class="rakUpdateToastBadge" aria-hidden="true">⟳</div>
        <div class="rakUpdateToastBody">
          <div class="rakUpdateToastTitle">K dispozici je nová verze aplikace</div>
          <div class="rakUpdateToastVersion">${swNextUpdateVersion ? 'Nová verze: ' + swNextUpdateVersion : 'Nová verze: zjišťuji…'}</div>
          <div class="rakUpdateToastText">Klikni na Aktualizovat a appka načte novou cache bez přeinstalace.</div>
        </div>
      </div>
      <button type="button" class="rakUpdateToastAction">Aktualizovat</button>
    `;
    document.body.appendChild(toast);
    swUpdateToastEl = toast;
    swUpdateButtonEl = toast.querySelector('.rakUpdateToastAction');
    swUpdateButtonEl.addEventListener('click', async () => {
      const registration = swRegistrationInstance;
      const version = getAppVersionTag();
      setStoredUpdateNoticeVersion(version);
      setPendingUpdateVersion(version);
      setSuppressUpdateToast(getAppVersionTag());
      swUpdateButtonEl.disabled = true;
      swUpdateButtonEl.textContent = 'Aktualizuji…';
      try {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else if (registration && registration.update) {
          await registration.update();
        }
      } catch (err) {
        console.warn('[Rotace] Update confirm failed', err);
      }
      scheduleUpdateReload('manual');
    });
    requestAnimationFrame(() => toast.classList.add('isVisible'));
    return toast;
  };

  const hideUpdateToast = () => {
    if (swUpdateToastEl) swUpdateToastEl.classList.remove('isVisible');
  };

  const maybeShowUpdateToast = (registration, reason) => {
    const currentVersion = getAppVersionTag();
    const seen = getStoredUpdateNoticeVersion();
    clearUpdatePromptIfStale();
    if (!registration || !registration.waiting) {
      if (!swUpdateReloading && getPendingUpdateVersion() === currentVersion) {
        setPendingUpdateVersion('');
      }
      return false;
    }
    if (!navigator.serviceWorker.controller) return false;
    if (swUpdateReloading) return true;
    const suppress = getSuppressUpdateToast();
    if (suppress) return true;
    if (seen === currentVersion) return true;
    requestWaitingServiceWorkerVersion(registration);
    ensureUpdateToast();
    setStoredUpdateNoticeVersion(currentVersion);
    setPendingUpdateVersion(currentVersion);
    if (reason) {
      try { console.info('[Rotace] Update ready via', reason); } catch (err) {}
    }
    return true;
  };

  const checkForWaitingServiceWorker = async (source) => {
    if (!('serviceWorker' in navigator)) return null;
    try {
      const registration = swRegistrationInstance || await navigator.serviceWorker.getRegistration('./');
      if (registration) {
        swRegistrationInstance = registration;
        maybeShowUpdateToast(registration, source || 'check');
      }
      return registration || null;
    } catch (err) {
      console.warn('[Rotace] SW check failed', err);
      return null;
    }
  };

  const refreshServiceWorkerRegistration = async (source, opts = {}) => {
    if (!('serviceWorker' in navigator)) return null;
    const reason = source || 'refresh';
    const force = !!(opts && opts.force);
    const now = Date.now();
    if (swUpdateCheckPromise) {
      pwaHardeningStatus.updateCheckJoins = Number(pwaHardeningStatus.updateCheckJoins || 0) + 1;
      pwaHardeningStatus.lastUpdateSkipSource = reason + ':join';
      return swUpdateCheckPromise;
    }
    if (!force && lastSwUpdateCheckAt && now - lastSwUpdateCheckAt < SW_UPDATE_CHECK_INTERVAL_MS) {
      pwaHardeningStatus.updateCheckSkips = Number(pwaHardeningStatus.updateCheckSkips || 0) + 1;
      pwaHardeningStatus.lastUpdateSkipSource = reason;
      await checkForWaitingServiceWorker(reason + '-throttled');
      return swRegistrationInstance || null;
    }

    swUpdateCheckPromise = (async () => {
      try {
        pwaHardeningStatus.updateChecks = Number(pwaHardeningStatus.updateChecks || 0) + 1;
        pwaHardeningStatus.lastUpdateSource = reason;
        const registration = await registerServiceWorker();
        if (registration && registration.update) {
          pwaHardeningStatus.registrationUpdates = Number(pwaHardeningStatus.registrationUpdates || 0) + 1;
          await registration.update();
        }
        lastSwUpdateCheckAt = Date.now();
        pwaHardeningStatus.lastUpdateCheckAt = lastSwUpdateCheckAt;
        await checkForWaitingServiceWorker(reason);
        requestActiveServiceWorkerCacheStatus(reason + '-after-update-check');
        return registration || null;
      } catch (err) {
        pwaHardeningStatus.registrationUpdateErrors = Number(pwaHardeningStatus.registrationUpdateErrors || 0) + 1;
        console.warn('[Rotace] SW refresh failed', err);
        return null;
      } finally {
        swUpdateCheckPromise = null;
      }
    })();
    return swUpdateCheckPromise;
  };

  const signalStateChange = (reason) => {
    broadcastState({
      type: 'state-change',
      reason: reason || 'state-change',
      tabId,
      ts: Date.now()
    });
  };

  const registerServiceWorker = () => {
    if (!('serviceWorker' in navigator)) return null;
    if (swRegistrationPromise) return swRegistrationPromise;

    swRegistrationPromise = navigator.serviceWorker.register('sw.js', { scope: './' }).then(async (registration) => {
      swRegistrationInstance = registration || null;
      if (registration && !registration.__rotaceUpdateHooked) {
        registration.__rotaceUpdateHooked = true;
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed') {
              void runLiveRefresh('sw-installed', { force: true });
              void checkForWaitingServiceWorker('updatefound');
            }
          });
        });
      }
      if (registration && registration.update) {
        try {
          pwaHardeningStatus.registrationUpdates = Number(pwaHardeningStatus.registrationUpdates || 0) + 1;
          await registration.update();
          lastSwUpdateCheckAt = Date.now();
          pwaHardeningStatus.lastUpdateCheckAt = lastSwUpdateCheckAt;
          pwaHardeningStatus.lastUpdateSource = 'register';
        } catch (err) {
          pwaHardeningStatus.registrationUpdateErrors = Number(pwaHardeningStatus.registrationUpdateErrors || 0) + 1;
        }
      }
      void checkForWaitingServiceWorker('register');
      requestActiveServiceWorkerCacheStatus('register');
      return registration;
    }).catch((err) => {
      console.warn('Service worker registration failed', err);
      return null;
    });

    window.__rotaceSwRegistrationPromise = swRegistrationPromise;
    return swRegistrationPromise;
  };

  if ('serviceWorker' in navigator && !window.__rotaceSwControllerChangeBound) {
    window.__rotaceSwControllerChangeBound = true;
    registerListener(navigator.serviceWorker, 'controllerchange', () => {
      const pending = getPendingUpdateVersion();
      requestActiveServiceWorkerCacheStatus('controllerchange');
      if (pending && !swUpdateReloading) {
        scheduleUpdateReload('controllerchange');
      }
    });
  }

  setConnectionFlag();

  window.__rotaceTriggerLiveRefresh = runLiveRefresh;
  window.__rotaceRefreshAfterOnline = runLiveRefresh;
  window.__rotaceSignalStateChange = signalStateChange;
  window.__rotacePromptInstall = async () => {
    if (!deferredInstallPrompt) return false;
    try {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      window.__rotaceDeferredInstallPrompt = null;
      delete document.documentElement.dataset.installable;
      return !!choice && choice.outcome === 'accepted';
    } catch (err) {
      console.warn('Install prompt failed', err);
      return false;
    }
  };

  registerListener(window, 'beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    window.__rotaceDeferredInstallPrompt = event;
    document.documentElement.dataset.installable = '1';
  });

  registerListener(window, 'appinstalled', () => {
    deferredInstallPrompt = null;
    window.__rotaceDeferredInstallPrompt = null;
    delete document.documentElement.dataset.installable;
    signalStateChange('appinstalled');
  });

  if ('BroadcastChannel' in window) {
    try {
      liveChannel = new BroadcastChannel(LIVE_CHANNEL_NAME);
      registerSubscription(() => { try { if (liveChannel) liveChannel.close(); } catch (err) {} });
      liveChannel.onmessage = (event) => {
        const data = event && event.data ? event.data : null;
        if (!data || data.tabId === tabId) return;
        if (data.type === 'state-change' || data.type === 'refresh') {
          void runLiveRefresh(data.reason || 'broadcast', { force: true });
        }
      };
    } catch (err) {
      console.warn('BroadcastChannel failed', err);
      liveChannel = null;
    }
  }

  if ('serviceWorker' in navigator) {
    registerServiceWorker();

    registerListener(navigator.serviceWorker, 'message', (event) => {
      const data = event && event.data ? event.data : null;
      if (!data) return;
      pwaHardeningStatus.swMessages = Number(pwaHardeningStatus.swMessages || 0) + 1;
      pwaHardeningStatus.lastMessageType = String(data.type || 'unknown');
      if (data.type === 'sw-version') {
        pwaHardeningStatus.swVersionMessages = Number(pwaHardeningStatus.swVersionMessages || 0) + 1;
        updateToastVersionLine(data.appVersion || data.version || '');
        return;
      }
      if (data.type === 'sw-cache-status') {
        applyServiceWorkerCacheStatus(data, 'message');
        return;
      }
      if (data.type === 'sw-activated') {
        pwaHardeningStatus.swActivatedMessages = Number(pwaHardeningStatus.swActivatedMessages || 0) + 1;
        applyServiceWorkerCacheStatus(data, 'activated');
        if (data.appVersion || data.version) updateToastVersionLine(data.appVersion || data.version);
        hideUpdateToast();
        void runLiveRefresh(data.reason || data.type || 'sw-message', { force: true });
        scheduleUpdateReload('sw-activated');
        return;
      }
      if (data.type === 'refresh-ui' || data.type === 'sw-ready') {
        void runLiveRefresh(data.reason || data.type || 'sw-message', { force: true });
      }
    });

  }

  registerListener(window, 'online', () => {
    setConnectionFlag();
    if (typeof flushSupabaseSyncQueue === 'function') void flushSupabaseSyncQueue();
    void runLiveRefresh('online', { force: true });
    void refreshServiceWorkerRegistration('online', { force: true });
    requestActiveServiceWorkerCacheStatus('online');
    signalStateChange('online');
  });
  registerListener(window, 'offline', () => {
    setConnectionFlag();
    if (typeof updateDashboard === 'function') updateDashboard();
    signalStateChange('offline');
  });
  registerListener(window, 'pageshow', () => {
    setConnectionFlag();
    if (navigator.onLine) {
      if (typeof flushSupabaseSyncQueue === 'function') void flushSupabaseSyncQueue();
      void runLiveRefresh('pageshow');
      void refreshServiceWorkerRegistration('pageshow');
      requestActiveServiceWorkerCacheStatus('pageshow');
    }
  });
  registerListener(window, 'focus', () => {
    if (!document.hidden && navigator.onLine) {
      void runLiveRefresh('focus');
      void refreshServiceWorkerRegistration('focus');
      requestActiveServiceWorkerCacheStatus('focus');
    }
  });
  registerListener(window, 'visibilitychange', () => {
    setConnectionFlag();
    if (!document.hidden && navigator.onLine) {
      void runLiveRefresh('visible');
      void refreshServiceWorkerRegistration('visible');
      requestActiveServiceWorkerCacheStatus('visible');
    }
  });
  registerListener(window, 'storage', (event) => {
    if (!event || !event.key) return;
    if (event.key === 'rotationBuild' || event.key === 'rotace_state_v1' || event.key === 'adminUnlocked' || event.key === 'rotace_live_signal_v1') {
      void runLiveRefresh('storage', { force: true });
      if (typeof forceHomeRefresh === 'function') forceHomeRefresh();
      if (typeof renderRotace === 'function') renderRotace();
      if (typeof renderStatsPanel === 'function') renderStatsPanel();
    }
  });

  liveRefreshTimer = registerInterval(() => {
    if (!document.hidden && navigator.onLine) void runLiveRefresh('interval');
  }, LIVE_REFRESH_INTERVAL_MS);

  swUpdateTimer = registerInterval(() => {
    if (!document.hidden && navigator.onLine) void refreshServiceWorkerRegistration('interval');
  }, SW_UPDATE_CHECK_INTERVAL_MS);

  registerListener(window, 'beforeunload', () => {
    cleanupAllLifecycle();
  });
}



})().catch(err => {
  console.error(err);
  alert("Nepodařilo se načíst aplikační skripty: " + (err && err.message ? err.message : err));
});
