// v.1.1 (667) – Piškvorky online: pozvánka jen s kódem, kód ve hře, vzájemné skóre a sdílené statistiky.
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
    'calc-soustruhy-126-heat': () => calcSoustruhy126Heat(),
    'calc-soustruhy-106': () => calcSoustruhy106(),
    'calc-soustruhy-106-heat': () => calcSoustruhy106Heat(),
    'soustruh-combo-first': (el) => setSoustruhComboFirstType(String(el.dataset.comboFirst || 'lis')),
    'soustruh-combo-free': (el) => setSoustruhComboFreeType(String(el.dataset.comboFree || '126')),
    'soustruh-combo126-start': (el) => {
      const start = parseInt(el.dataset.comboStartsize || '', 10);
      if (Number.isFinite(start)) setSoustruhCombo126Start(start);
    },
    'calc-soustruhy-combo': () => calcSoustruhyCombo(),
    'calc-soustruhy-combo-heat': () => calcSoustruhyComboHeat(),
    'open-food-link': () => openExternalTile(window.FOOD_MENU_URL || 'https://sa.gthcatering.cz/restaurant/c1/', 'openFoodLink'),
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

  try {
    window.__rakDelegatedAllowedActions = Object.freeze(Object.keys(clickActions));
    window.__rakDelegatedChangeActions = Object.freeze(['month-select']);
  } catch (err) {}

  document.addEventListener('click', (event) => {
    const target = event.target && typeof event.target.closest === 'function'
      ? event.target.closest('[data-action], [data-rak-open-calendar]')
      : null;
    if (!target) return;

    const direct = target.hasAttribute('data-rak-open-calendar') ? 'calendar-open' : String(target.getAttribute('data-action') || '').trim();
    const action = direct || '';
    const handler = clickActions[action];
    const allowed = typeof recordDelegatedActionGuard === 'function'
      ? recordDelegatedActionGuard(action, !!handler, 'click')
      : !!handler;
    if (!handler || !allowed) return;

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
    const allowed = typeof recordDelegatedActionGuard === 'function'
      ? recordDelegatedActionGuard(action, !!handler, 'keydown')
      : !!handler;
    if (!handler || !allowed) return;
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
    '#rotaceStatsPanel',
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


const RAK_FINAL_STABILIZATION_DEFAULTS = {
  phase: 'phase-10-final-stabilization',
  phasePercent: 100,
  auditMode: 'runtime-readiness-script-storage-navigation-page-shell-action-link-form-safe-helper-supabase-structure-game-engine-baseline-readiness-summary-audit-post-stabilization-baseline-watch',
  audits: 0,
  lastAuditOk: false,
  lastMissingCount: 0,
  lastMissingItems: [],
  lastCheckedAt: '',
  lastVersion: '',
  lastPage: '',
  lastPhase9Percent: 0,
  lastPhase8Percent: 0,
  lastDuplicateIdCount: 0,
  lastDuplicateIds: [],
  lastErrorLogCount: 0,
  lastStorageOk: false,
  lastStorageItemCount: 0,
  lastLargeStorageKeyCount: 0,
  lastLargeStorageKeys: [],
  lastNavigatorOnline: true,
  lastVisibilityState: '',
  lastScriptHealthOk: false,
  lastScriptMissingCount: 0,
  lastScriptDuplicateCount: 0,
  lastScriptUnexpectedCount: 0,
  lastScriptMissingFiles: [],
  lastScriptDuplicateFiles: [],
  lastNavigationHealthOk: false,
  lastNavigationButtonCount: 0,
  lastNavigationActiveCount: 0,
  lastNavigationMissingCount: 0,
  lastNavigationMissingItems: [],
  lastPageShellHealthOk: false,
  lastPageShellPageCount: 0,
  lastPageShellActiveCount: 0,
  lastPageShellCriticalPanelCount: 0,
  lastPageShellMissingCount: 0,
  lastPageShellMissingItems: [],
  lastActionHealthOk: false,
  lastActionCount: 0,
  lastActionUnknownCount: 0,
  lastActionRequiredMissingCount: 0,
  lastActionMissingTargetsCount: 0,
  lastActionLinkIssueCount: 0,
  lastActionUnknownItems: [],
  lastActionRequiredMissingItems: [],
  lastActionMissingTargetItems: [],
  lastActionLinkIssues: [],
  lastFormHealthOk: false,
  lastFormInputCount: 0,
  lastFormSelectCount: 0,
  lastFormButtonCount: 0,
  lastFormRequiredMissingCount: 0,
  lastFormActionMissingCount: 0,
  lastFormInvalidNumberCount: 0,
  lastFormRequiredMissingItems: [],
  lastFormActionMissingItems: [],
  lastFormInvalidNumberItems: [],
  lastRuntimeReadinessOk: false,
  lastRuntimeReadinessPassedCount: 0,
  lastRuntimeReadinessTotalCount: 0,
  lastRuntimeReadinessFailedItems: [],
  lastPostStabilizationOk: false,
  lastPostStabilizationMode: '',
  lastPostStabilizationCheckedAt: '',
  lastPostStabilizationIssueCount: 0,
  lastPostStabilizationIssues: [],
  lastSupabaseStructureOk: false,
  lastSupabaseStructureMode: '',
  lastSupabaseStructureTableCount: 0,
  lastSupabaseStructureIssueCount: 0,
  lastSupabaseStructureIssues: [],
  lastSafeHelperHealthOk: false,
  lastSafeHelperCount: 0,
  lastSafeHelperMissingCount: 0,
  lastSafeHelperMissingItems: [],
  lastGameEngineHealthOk: false,
  lastGameEngineMode: '',
  lastGameEngineActiveGame: '',
  lastGameEngineManagedLoopCount: 0,
  lastGameEngineLifecycleEvents: 0,
  lastGameEngineIssueCount: 0,
  lastGameEngineIssues: []
};

function ensureFinalStabilizationStatus() {
  const current = window.__rakFinalStabilizationStatus || {};
  const status = Object.assign({}, RAK_FINAL_STABILIZATION_DEFAULTS, current, {
    phase: 'phase-10-final-stabilization',
    phasePercent: 100,
    auditMode: 'runtime-readiness-script-storage-navigation-page-shell-action-link-form-safe-helper-supabase-structure-game-engine-baseline-readiness-summary-audit-post-stabilization-baseline-watch'
  });
  window.__rakFinalStabilizationStatus = status;
  return status;
}

function getFinalStabilizationStatus() {
  return Object.assign({}, ensureFinalStabilizationStatus());
}
window.getFinalStabilizationStatus = getFinalStabilizationStatus;

function getPhaseTenDuplicateDomIds() {
  const seen = new Set();
  const duplicates = new Set();
  try {
    document.querySelectorAll('[id]').forEach((node) => {
      const id = String(node && node.id ? node.id : '').trim();
      if (!id) return;
      if (seen.has(id)) duplicates.add(id);
      else seen.add(id);
    });
  } catch (err) {}
  return Array.from(duplicates).slice(0, 25);
}

function getPhaseTenErrorLogCount() {
  try {
    const log = JSON.parse(localStorage.getItem('rotace_err_log_v1') || '[]');
    return Array.isArray(log) ? log.length : 0;
  } catch (err) {
    return 0;
  }
}

function getPhaseTenStorageHealth() {
  const health = {
    ok: false,
    writable: false,
    itemCount: 0,
    largeKeys: [],
    error: '',
    navigatorOnline: typeof navigator !== 'undefined' ? navigator.onLine !== false : true,
    visibilityState: typeof document !== 'undefined' ? String(document.visibilityState || 'unknown') : 'unknown'
  };

  try {
    const probeKey = '__rak_phase10_storage_probe__';
    localStorage.setItem(probeKey, '1');
    localStorage.removeItem(probeKey);
    health.writable = true;
    health.ok = true;

    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    health.itemCount = keys.length;
    health.largeKeys = keys.map((key) => {
      let size = 0;
      try { size = String(localStorage.getItem(key) || '').length; } catch (err) { size = 0; }
      return { key, size };
    }).filter((item) => item.size > 180000).sort((a, b) => b.size - a.size).slice(0, 8);
  } catch (err) {
    health.error = String(err && err.message ? err.message : err || 'storage error');
  }

  return health;
}
window.getPhaseTenStorageHealth = getPhaseTenStorageHealth;

function getPhaseTenScriptLoadHealth() {
  const expectedFiles = [
    'app.js',
    'core.js',
    'lifecycle.js',
    'qr.js',
    'payroll.js',
    'brusy.js',
    'stats.js',
    'dashboard.js',
    'soustruhy.js',
    'rotace.js',
    'changelog.js',
    'ui.js',
    'games-arcade.js',
    'export.js',
    'supabase-config.js',
    'supabase-bridge.js',
    'app-init.js'
  ];
  const expectedSet = new Set(expectedFiles);
  const counts = Object.create(null);
  const unexpectedLocalJs = [];

  try {
    Array.from(document.scripts || []).forEach((script) => {
      const rawSrc = String(script && script.getAttribute ? script.getAttribute('src') || '' : '').trim();
      if (!rawSrc) return;
      let fileName = rawSrc.split('?')[0].split('#')[0].split('/').filter(Boolean).pop() || rawSrc;
      try {
        const url = new URL(rawSrc, window.location.href);
        fileName = url.pathname.split('/').filter(Boolean).pop() || fileName;
        const sameOrigin = url.origin === window.location.origin;
        if (sameOrigin && fileName.endsWith('.js') && !expectedSet.has(fileName)) unexpectedLocalJs.push(fileName);
      } catch (err) {
        if (fileName.endsWith('.js') && !expectedSet.has(fileName) && !/^https?:/i.test(rawSrc)) unexpectedLocalJs.push(fileName);
      }
      if (expectedSet.has(fileName)) counts[fileName] = Number(counts[fileName] || 0) + 1;
    });
  } catch (err) {}

  const missing = expectedFiles.filter((file) => Number(counts[file] || 0) < 1);
  const duplicateFiles = expectedFiles
    .filter((file) => Number(counts[file] || 0) > 1)
    .map((file) => ({ file, count: Number(counts[file] || 0) }));

  return {
    ok: missing.length === 0,
    expectedCount: expectedFiles.length,
    loadedExpectedCount: expectedFiles.filter((file) => Number(counts[file] || 0) > 0).length,
    missing,
    duplicateFiles,
    duplicateCount: duplicateFiles.length,
    unexpectedLocalJs: Array.from(new Set(unexpectedLocalJs)).slice(0, 12),
    unexpectedLocalJsCount: Array.from(new Set(unexpectedLocalJs)).length
  };
}
window.getPhaseTenScriptLoadHealth = getPhaseTenScriptLoadHealth;


function getPhaseTenNavigationHealth() {
  const health = {
    ok: false,
    navExists: false,
    bound: false,
    buttonCount: 0,
    activeCount: 0,
    activePageId: '',
    missing: [],
    actions: []
  };

  try {
    const nav = document.querySelector('.bottomNav');
    health.navExists = !!nav;
    if (!nav) {
      health.missing.push('DOM .bottomNav');
      return health;
    }

    health.bound = !!nav.__rotaceBound;
    if (!health.bound) health.missing.push('bottom nav binding');

    const allowedActions = new Set(['home', 'rotace', 'kalkulacky', 'rozpisy', 'statistiky', 'games', 'menu']);
    const allowedPages = new Set(['home', 'rotace', 'kalkulacky', 'rozpisy', 'statistiky', 'games', 'menu']);
    const requiredActions = ['home', 'rotace', 'kalkulacky', 'rozpisy', 'statistiky', 'games', 'menu'];
    const seenActions = new Set();
    const buttons = Array.from(nav.querySelectorAll('.bottomNavBtn[data-action]'));
    health.buttonCount = buttons.length;
    health.activeCount = buttons.filter((btn) => btn.classList && btn.classList.contains('active')).length;
    health.activePageId = String(document.querySelector('.page.active')?.id || '');

    buttons.forEach((btn) => {
      const action = String(btn.dataset.action || '').trim();
      const page = String(btn.dataset.page || '').trim();
      if (action) seenActions.add(action);
      health.actions.push(action || '—');
      if (!allowedActions.has(action)) health.missing.push('unknown nav action: ' + (action || 'empty'));
      if (!allowedPages.has(page)) health.missing.push('unknown nav page: ' + (page || 'empty'));
      if (!btn.querySelector('.bottomNavLabel')) health.missing.push('missing nav label: ' + (action || page || 'unknown'));
    });

    requiredActions.forEach((action) => {
      if (!seenActions.has(action)) health.missing.push('missing nav action: ' + action);
    });

    if (!document.getElementById('home')) health.missing.push('DOM #home');
    if (!document.getElementById('rotace')) health.missing.push('DOM #rotace');
    if (!document.getElementById('kalkulacky')) health.missing.push('DOM #kalkulacky');
    if (!document.getElementById('games')) health.missing.push('DOM #games');
    if (health.activePageId && !document.getElementById(health.activePageId)) health.missing.push('active page missing: ' + health.activePageId);

    health.missing = Array.from(new Set(health.missing)).slice(0, 18);
    health.ok = health.navExists && health.bound && health.buttonCount >= requiredActions.length && health.missing.length === 0;
  } catch (err) {
    health.missing.push(String(err && err.message ? err.message : err || 'navigation health error'));
  }

  return health;
}
window.getPhaseTenNavigationHealth = getPhaseTenNavigationHealth;


function getPhaseTenPageShellHealth() {
  const health = {
    ok: false,
    pageCount: 0,
    activePageCount: 0,
    activePageId: '',
    criticalPanelCount: 0,
    missing: []
  };

  try {
    const pages = Array.from(document.querySelectorAll('.page'));
    health.pageCount = pages.length;
    health.activePageCount = pages.filter((page) => page.classList && page.classList.contains('active')).length;
    health.activePageId = String(document.querySelector('.page.active')?.id || '');

    const requiredPages = [
      'home',
      'games',
      'kalkulacky',
      'rotace',
      'soustruhy',
      'jidlo',
      'frezky',
      'brusy',
      'pracka'
    ];
    requiredPages.forEach((id) => {
      const el = document.getElementById(id);
      if (!el || !el.classList || !el.classList.contains('page')) health.missing.push('page #' + id);
    });

    const criticalPanels = [
      'dashCalendar',
      'dashCountdown',
      'dashKantyna',
      'dashJidelna',
      'dashFoodLink',
      'dashEportalLink',
      'gamesGrid',
      'rotaceNamesPanel',
      'rotaceStatsPanel',
      'rotaceMonthsPanel',
      'namesGrid',
      'monthView',
      'soustruhyLisPanel',
      'soustruhy126Panel',
      'soustruhy106Panel',
      'soustruhyComboPanel',
      'brusyInfo',
      'outB',
      'outBTime'
    ];
    criticalPanels.forEach((id) => {
      if (document.getElementById(id)) health.criticalPanelCount += 1;
      else health.missing.push('panel #' + id);
    });

    if (health.pageCount < requiredPages.length) health.missing.push('page count: ' + String(health.pageCount));
    if (health.activePageCount !== 1) health.missing.push('active page count: ' + String(health.activePageCount));
    if (health.activePageId && !document.getElementById(health.activePageId)) health.missing.push('active page missing: ' + health.activePageId);

    health.missing = Array.from(new Set(health.missing)).slice(0, 24);
    health.ok = health.missing.length === 0;
  } catch (err) {
    health.missing.push(String(err && err.message ? err.message : err || 'page shell health error'));
  }

  return health;
}
window.getPhaseTenPageShellHealth = getPhaseTenPageShellHealth;

function getPhaseTenActionHealth() {
  const health = {
    ok: false,
    actionCount: 0,
    delegatedAllowedCount: 0,
    navAllowedCount: 0,
    changeAllowedCount: 0,
    unknownActions: [],
    requiredMissing: [],
    missingTargets: [],
    linkIssues: []
  };

  try {
    const delegatedAllowed = new Set(Array.isArray(window.__rakDelegatedAllowedActions) ? window.__rakDelegatedAllowedActions : []);
    const changeAllowed = new Set(Array.isArray(window.__rakDelegatedChangeActions) ? window.__rakDelegatedChangeActions : ['month-select']);
    const navAllowed = new Set(['home', 'rotace', 'kalkulacky', 'rozpisy', 'statistiky', 'games', 'menu']);
    const requiredDelegated = [
      'show-food-kantyna',
      'show-food-jidelna',
      'open-food-link',
      'open-eportal-link',
      'open-payroll-link',
      'page-kalkulacky',
      'page-soustruhy',
      'page-frezky',
      'page-brusy',
      'calc-brusy',
      'calc-brusy-finish',
      'reset-fields',
      'open-game',
      'calendar-open'
    ];
    const seen = new Set();
    const nodes = Array.from(document.querySelectorAll('[data-action], [data-rak-open-calendar]'));

    health.actionCount = nodes.length;
    health.delegatedAllowedCount = delegatedAllowed.size;
    health.navAllowedCount = navAllowed.size;
    health.changeAllowedCount = changeAllowed.size;

    nodes.forEach((node) => {
      const action = node.hasAttribute('data-rak-open-calendar') ? 'calendar-open' : String(node.getAttribute('data-action') || '').trim();
      if (action) seen.add(action);
      const isBottomNav = !!(node.closest && node.closest('.bottomNav'));
      const isSelect = String(node.tagName || '').toUpperCase() === 'SELECT';
      const allowed = isBottomNav ? navAllowed.has(action) : (delegatedAllowed.has(action) || (isSelect && changeAllowed.has(action)));
      if (!allowed) health.unknownActions.push(action || 'empty');

      if (action === 'set-machine' && !String(node.getAttribute('data-machine') || '').trim()) health.missingTargets.push('set-machine data-machine');
      if (action === 'set-prog' && !String(node.getAttribute('data-prog') || '').trim()) health.missingTargets.push('set-prog data-prog');
      if (action === 'open-game' && !String(node.getAttribute('data-game') || '').trim()) health.missingTargets.push('open-game data-game');
      if (action === 'reset-fields' && !String(node.getAttribute('data-reset-fields') || '').trim()) health.missingTargets.push('reset-fields data-reset-fields');
      if (action === 'soustruh-mode' && !String(node.getAttribute('data-soustruh-mode') || '').trim()) health.missingTargets.push('soustruh-mode data-soustruh-mode');
      if (action === 'soustruh-combo-first' && !String(node.getAttribute('data-combo-first') || '').trim()) health.missingTargets.push('soustruh-combo-first data-combo-first');
      if (action === 'soustruh-combo-free' && !String(node.getAttribute('data-combo-free') || '').trim()) health.missingTargets.push('soustruh-combo-free data-combo-free');
    });

    requiredDelegated.forEach((action) => {
      if (!delegatedAllowed.has(action)) health.requiredMissing.push('allowlist ' + action);
      if (!seen.has(action)) health.requiredMissing.push('DOM action ' + action);
    });

    ['dashFoodLink', 'dashEportalLink'].forEach((id) => {
      const link = document.getElementById(id);
      if (!link) {
        health.linkIssues.push(id + ' missing');
        return;
      }
      const href = String(link.getAttribute('href') || '').trim();
      const rel = String(link.getAttribute('rel') || '').toLowerCase();
      const target = String(link.getAttribute('target') || '').trim();
      if (!/^https:\/\//i.test(href)) health.linkIssues.push(id + ' href');
      if (target !== '_blank') health.linkIssues.push(id + ' target');
      if (!rel.includes('noopener') || !rel.includes('noreferrer')) health.linkIssues.push(id + ' rel');
    });

    health.unknownActions = Array.from(new Set(health.unknownActions)).slice(0, 18);
    health.requiredMissing = Array.from(new Set(health.requiredMissing)).slice(0, 18);
    health.missingTargets = Array.from(new Set(health.missingTargets)).slice(0, 18);
    health.linkIssues = Array.from(new Set(health.linkIssues)).slice(0, 12);
    health.ok = health.actionCount > 0 && health.delegatedAllowedCount >= requiredDelegated.length && health.unknownActions.length === 0 && health.requiredMissing.length === 0 && health.missingTargets.length === 0 && health.linkIssues.length === 0;
  } catch (err) {
    health.unknownActions.push(String(err && err.message ? err.message : err || 'action health error'));
  }

  return health;
}
window.getPhaseTenActionHealth = getPhaseTenActionHealth;

function getPhaseTenFormHealth() {
  const health = {
    ok: false,
    inputCount: 0,
    selectCount: 0,
    buttonCount: 0,
    requiredMissing: [],
    actionMissing: [],
    invalidNumberInputs: []
  };

  try {
    const requiredInputs = [
      'excelFile',
      'lis_first',
      'lis_plan',
      'v126_first',
      'v126_plan',
      'v126_heat_first',
      'v106_first',
      'v106_c1',
      'v106_c2',
      'v106_c3',
      'v106_c4',
      'v106_plan',
      'v106_heat_first',
      'combo106_c1',
      'combo106_c2',
      'combo106_c3',
      'combo106_c4',
      'combo_first_start',
      'combo_first_end',
      'combo_second_start',
      'combo_second_plan',
      'combo_heat_first',
      'f_kusy',
      'f_finish_kusy',
      'f_finish_davky',
      'celkem',
      'davka',
      'orovnani',
      'b_finish_davky',
      'b_finish_davka',
      'b_finish_orovnani',
      'p_kusy'
    ];
    const requiredSelects = ['statsYearSelect', 'monthYearSelect', 'monthSelect'];
    const requiredButtons = ['importBtn', 'exportBtn', 'gamesProfileSettingsBtn'];
    const requiredActions = [
      'calc-soustruhy-lis',
      'calc-soustruhy-126',
      'calc-soustruhy-126-heat',
      'calc-soustruhy-106',
      'calc-soustruhy-106-heat',
      'calc-soustruhy-combo',
      'calc-soustruhy-combo-heat',
      'calc-f',
      'calc-f-finish',
      'calc-brusy',
      'calc-brusy-finish',
      'calc-p',
      'reset-soustruhy',
      'reset-fields',
      'page-kalkulacky'
    ];

    const allInputs = Array.from(document.querySelectorAll('input'));
    const allSelects = Array.from(document.querySelectorAll('select'));
    const allButtons = Array.from(document.querySelectorAll('button'));
    health.inputCount = allInputs.length;
    health.selectCount = allSelects.length;
    health.buttonCount = allButtons.length;

    requiredInputs.forEach((id) => {
      const el = document.getElementById(id);
      if (!el || String(el.tagName || '').toUpperCase() !== 'INPUT') health.requiredMissing.push('input #' + id);
    });
    requiredSelects.forEach((id) => {
      const el = document.getElementById(id);
      if (!el || String(el.tagName || '').toUpperCase() !== 'SELECT') health.requiredMissing.push('select #' + id);
    });
    requiredButtons.forEach((id) => {
      const el = document.getElementById(id);
      if (!el || String(el.tagName || '').toUpperCase() !== 'BUTTON') health.requiredMissing.push('button #' + id);
    });
    requiredActions.forEach((action) => {
      if (!document.querySelector('[data-action="' + action + '"]')) health.actionMissing.push('action ' + action);
    });

    allInputs.forEach((input) => {
      const type = String(input.getAttribute('type') || '').toLowerCase();
      if (type !== 'number') return;
      const id = String(input.id || input.getAttribute('name') || 'number-input').trim();
      const min = input.getAttribute('min');
      const max = input.getAttribute('max');
      const step = input.getAttribute('step');
      if (min !== null && min !== '' && Number.isNaN(Number(min))) health.invalidNumberInputs.push(id + ' min');
      if (max !== null && max !== '' && Number.isNaN(Number(max))) health.invalidNumberInputs.push(id + ' max');
      if (step !== null && step !== '' && step !== 'any' && Number.isNaN(Number(step))) health.invalidNumberInputs.push(id + ' step');
    });

    health.requiredMissing = Array.from(new Set(health.requiredMissing)).slice(0, 24);
    health.actionMissing = Array.from(new Set(health.actionMissing)).slice(0, 24);
    health.invalidNumberInputs = Array.from(new Set(health.invalidNumberInputs)).slice(0, 24);
    health.ok = health.requiredMissing.length === 0 && health.actionMissing.length === 0 && health.invalidNumberInputs.length === 0;
  } catch (err) {
    health.requiredMissing.push(String(err && err.message ? err.message : err || 'form health error'));
  }

  return health;
}
window.getPhaseTenFormHealth = getPhaseTenFormHealth;

function getPostStabilizationSafeHelperHealth() {
  const requiredHelpers = [
    'setElementTextIfChanged',
    'setElementHtmlIfChanged',
    'setElementChildrenIfChanged',
    'setSelectOptionsIfChanged',
    'replaceElementChildrenSafely',
    'clearElementChildrenSafely',
    'normalizeSafeExternalUrl',
    'normalizeAllowedExternalUrl',
    'setSafeExternalAnchor',
    'getSecurityRenderStatus',
    'getFinalStabilizationStatus',
    'getPhaseTenRuntimeReadinessHealth',
    'getPostStabilizationBaselineHealth',
    'getLadaPerformanceHealth',
    'runLadaPerformanceAudit',
    'getSupabaseStructureHealth',
    'getGameEngineBaselineHealth',
    'runGameEngineBaselineAudit',
    'setupRakGameEngineLifecycleBindings'
  ];
  const missing = [];

  requiredHelpers.forEach((name) => {
    try {
      if (typeof window[name] !== 'function') missing.push(name);
    } catch (err) {
      missing.push(name);
    }
  });

  return {
    ok: missing.length === 0,
    mode: 'post-stabilization-safe-helper-guard',
    helperCount: requiredHelpers.length,
    missingCount: missing.length,
    missing: missing.slice(0, 18)
  };
}
window.getPostStabilizationSafeHelperHealth = getPostStabilizationSafeHelperHealth;

function parseCssBlurPx(value) {
  try {
    const text = String(value || '').toLowerCase();
    const match = text.match(/blur\(([-0-9.]+)px\)/);
    return match ? Math.max(0, Number(match[1]) || 0) : 0;
  } catch (err) {
    return 0;
  }
}
window.parseCssBlurPx = parseCssBlurPx;

function getLadaPerformanceHealth() {
  const body = document.body || null;
  const root = document.documentElement || null;
  const classes = body && body.classList ? body.classList : null;
  const active = !!(classes && (classes.contains('lightweightMode') || classes.contains('lowEndDevice') || classes.contains('ladaMode')));
  const lowEndInfo = typeof getLowEndDeviceInfo === 'function'
    ? getLowEndDeviceInfo()
    : { lowEnd: false, reasons: [], dpr: Number(window.devicePixelRatio || 1) || 1 };
  const dprLimit = typeof getRakPerformanceDprMax === 'function' ? Number(getRakPerformanceDprMax()) : 2;
  const cssSamples = [];
  const issues = [];
  const sampleSelectors = [
    '.dashboardCard',
    '.dashboardHeroCard',
    '.bottomNav',
    '.bottomNavBtn',
    '.appMenuCard',
    '.calcTile',
    '.tile',
    '#games .gamesStage',
    '#games .gameBoard',
    '#games .arcadePanel'
  ];

  try {
    sampleSelectors.forEach((selector) => {
      const el = document.querySelector(selector);
      if (!el || typeof getComputedStyle !== 'function') return;
      const style = getComputedStyle(el);
      const blur = Math.max(parseCssBlurPx(style.backdropFilter), parseCssBlurPx(style.webkitBackdropFilter));
      const transition = String(style.transitionDuration || '').trim();
      const animation = String(style.animationDuration || '').trim();
      const shadow = String(style.boxShadow || '').trim();
      cssSamples.push({ selector, blur, transition, animation, hasShadow: !!shadow && shadow !== 'none' });
    });
  } catch (err) {
    issues.push('css sample error');
  }

  const maxBlur = cssSamples.reduce((max, item) => Math.max(max, Number(item.blur || 0)), 0);
  const animatedSamples = active
    ? cssSamples.filter((item) => {
      const transition = String(item.transition || '0s').split(',').some((part) => parseFloat(part) > 0.05);
      const animation = String(item.animation || '0s').split(',').some((part) => parseFloat(part) > 0.05);
      return transition || animation;
    })
    : [];

  if (active && !classes.contains('reduceMotion')) issues.push('reduceMotion class missing');
  if (active && dprLimit > 1) issues.push('canvas DPR limit over 1');
  if (active && maxBlur > 3.5) issues.push('heavy blur still active');
  if (active && animatedSamples.length) issues.push('animations/transitions still active');
  if (active && root && !String(root.dataset.rakPerformanceMode || '').includes('lada')) issues.push('performance dataset missing');
  if (typeof getRakPerformanceDprMax !== 'function') issues.push('getRakPerformanceDprMax missing');
  if (typeof getLowEndDeviceInfo !== 'function') issues.push('getLowEndDeviceInfo missing');

  return {
    ok: issues.length === 0,
    mode: active ? 'lada-performance-active' : 'lada-performance-ready',
    active,
    lightweight: !!(classes && classes.contains('lightweightMode')),
    lowEndDevice: !!(classes && classes.contains('lowEndDevice')),
    ladaMode: !!(classes && classes.contains('ladaMode')),
    reduceMotion: !!(classes && classes.contains('reduceMotion')),
    dprLimit,
    detectedDpr: Number(lowEndInfo && lowEndInfo.dpr || window.devicePixelRatio || 1) || 1,
    lowEndDetected: !!(lowEndInfo && lowEndInfo.lowEnd),
    lowEndReasons: Array.isArray(lowEndInfo && lowEndInfo.reasons) ? lowEndInfo.reasons.slice(0, 8) : [],
    cssSampleCount: cssSamples.length,
    maxBlurPx: Math.round(maxBlur * 10) / 10,
    animatedSampleCount: animatedSamples.length,
    issues: issues.slice(0, 12)
  };
}
window.getLadaPerformanceHealth = getLadaPerformanceHealth;

function runLadaPerformanceAudit() {
  const run = () => {
    const report = getLadaPerformanceHealth();
    try {
      document.documentElement.dataset.rakLadaPerformanceAudit = report.ok ? report.mode : 'lada-performance-check';
      window.__rakLadaPerformanceAudit = Object.assign({ checkedAt: new Date().toISOString(), version: window.APP_VERSION || 'unknown' }, report);
    } catch (err) {}
    if (!report.ok) console.warn('[RaK] Láďův režim performance audit', report);
    return report;
  };

  if (document.readyState === 'loading') {
    const rerun = () => setTimeout(run, 380);
    if (typeof registerListener === 'function') registerListener(document, 'DOMContentLoaded', rerun, { once: true });
    else document.addEventListener('DOMContentLoaded', rerun, { once: true });
    return { version: window.APP_VERSION || 'unknown', phase: 'lada-performance-audit', ok: true, deferred: true };
  }

  requestAnimationFrame(() => setTimeout(run, 380));
  return { version: window.APP_VERSION || 'unknown', phase: 'lada-performance-audit', ok: true, deferred: true };
}
window.runLadaPerformanceAudit = runLadaPerformanceAudit;

function ensureRakGameEngineState() {
  const current = window.__rakGameEngine || {};
  const state = Object.assign({
    version: window.APP_VERSION || 'unknown',
    mode: 'shared-game-engine-baseline',
    activeGameId: '',
    lastAction: 'init',
    openedCount: 0,
    closedCount: 0,
    pausedCount: 0,
    resumedCount: 0,
    loopStopRequests: 0,
    lifecycleEvents: 0,
    managedLoopCount: 0,
    seenGames: [],
    lastOpenAt: '',
    lastCloseAt: '',
    lastPauseAt: '',
    lastResumeAt: '',
    lastCheckAt: ''
  }, current);
  state.version = window.APP_VERSION || state.version || 'unknown';
  window.__rakGameEngine = state;
  return state;
}
window.ensureRakGameEngineState = ensureRakGameEngineState;

function rakGameEngineNormalizeId(gameId) {
  const raw = String(gameId || '').trim();
  if (!raw) return '';
  return raw === 'g2048' ? '2048' : raw;
}
window.rakGameEngineNormalizeId = rakGameEngineNormalizeId;

function rakGameEngineMarkSeen(state, gameId) {
  const id = rakGameEngineNormalizeId(gameId);
  if (!id) return;
  const list = Array.isArray(state.seenGames) ? state.seenGames.slice(0, 24) : [];
  if (!list.includes(id)) list.push(id);
  state.seenGames = list.slice(-24);
}

function rakGameEngineActivate(gameId, source = 'open') {
  const state = ensureRakGameEngineState();
  const id = rakGameEngineNormalizeId(gameId);
  const now = new Date().toISOString();
  state.activeGameId = id;
  state.lastAction = 'activate:' + String(source || 'open');
  state.lastOpenAt = now;
  state.openedCount = Number(state.openedCount || 0) + 1;
  state.paused = false;
  rakGameEngineMarkSeen(state, id);
  try { document.documentElement.dataset.rakGameEngine = id ? 'active' : 'ready'; } catch (err) {}
  return Object.assign({}, state);
}
window.rakGameEngineActivate = rakGameEngineActivate;

function rakGameEngineDeactivate(reason = 'close') {
  const state = ensureRakGameEngineState();
  state.lastAction = 'deactivate:' + String(reason || 'close');
  state.lastCloseAt = new Date().toISOString();
  state.closedCount = Number(state.closedCount || 0) + 1;
  state.activeGameId = '';
  state.paused = false;
  try { document.documentElement.dataset.rakGameEngine = 'ready'; } catch (err) {}
  return Object.assign({}, state);
}
window.rakGameEngineDeactivate = rakGameEngineDeactivate;

function rakGameEnginePause(reason = 'pause') {
  const state = ensureRakGameEngineState();
  const activeId = rakGameEngineNormalizeId((typeof app !== 'undefined' && app && app.activeGameShell) || state.activeGameId || '');
  if (!activeId) return Object.assign({}, state, { skipped: true });
  state.activeGameId = activeId;
  state.paused = true;
  state.lastAction = 'pause:' + String(reason || 'pause');
  state.lastPauseAt = new Date().toISOString();
  state.pausedCount = Number(state.pausedCount || 0) + 1;
  state.lifecycleEvents = Number(state.lifecycleEvents || 0) + 1;
  try { document.documentElement.dataset.rakGameEngine = 'paused'; } catch (err) {}
  return Object.assign({}, state);
}
window.rakGameEnginePause = rakGameEnginePause;

function rakGameEngineResume(reason = 'resume') {
  const state = ensureRakGameEngineState();
  const activeId = rakGameEngineNormalizeId((typeof app !== 'undefined' && app && app.activeGameShell) || state.activeGameId || '');
  if (!activeId) return Object.assign({}, state, { skipped: true });
  state.activeGameId = activeId;
  state.paused = false;
  state.lastAction = 'resume:' + String(reason || 'resume');
  state.lastResumeAt = new Date().toISOString();
  state.resumedCount = Number(state.resumedCount || 0) + 1;
  state.lifecycleEvents = Number(state.lifecycleEvents || 0) + 1;
  rakGameEngineMarkSeen(state, activeId);
  try { document.documentElement.dataset.rakGameEngine = 'active'; } catch (err) {}
  return Object.assign({}, state);
}
window.rakGameEngineResume = rakGameEngineResume;

function rakGameEngineNoteLoopStop(reason = 'stop-loops') {
  const state = ensureRakGameEngineState();
  state.loopStopRequests = Number(state.loopStopRequests || 0) + 1;
  state.lastAction = 'loop-stop:' + String(reason || 'stop-loops');
  return Object.assign({}, state);
}
window.rakGameEngineNoteLoopStop = rakGameEngineNoteLoopStop;

function rakGameEngineShouldRun(gameId = '') {
  const id = rakGameEngineNormalizeId(gameId || (typeof app !== 'undefined' && app && app.activeGameShell) || '');
  if (!id) return false;
  if (document.visibilityState === 'hidden') return false;
  const page = document.getElementById('games');
  if (page && page.classList && !page.classList.contains('active') && !document.body.classList.contains('gamesOpen') && !document.body.classList.contains('tttOpen')) return false;
  return true;
}
window.rakGameEngineShouldRun = rakGameEngineShouldRun;

function setupRakGameEngineLifecycleBindings() {
  if (window.__rakGameEngineLifecycleBound) return ensureRakGameEngineState();
  window.__rakGameEngineLifecycleBound = true;
  ensureRakGameEngineState();
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') rakGameEnginePause('visibility-hidden');
    else rakGameEngineResume('visibility-visible');
  };
  if (typeof registerListener === 'function') registerListener(document, 'visibilitychange', onVisibility, { passive: true });
  else document.addEventListener('visibilitychange', onVisibility, { passive: true });
  const onPageHide = () => rakGameEnginePause('pagehide');
  const onPageShow = () => rakGameEngineResume('pageshow');
  if (typeof registerListener === 'function') {
    registerListener(window, 'pagehide', onPageHide, { passive: true });
    registerListener(window, 'pageshow', onPageShow, { passive: true });
  } else {
    window.addEventListener('pagehide', onPageHide, { passive: true });
    window.addEventListener('pageshow', onPageShow, { passive: true });
  }
  return ensureRakGameEngineState();
}
window.setupRakGameEngineLifecycleBindings = setupRakGameEngineLifecycleBindings;

function getGameEngineBaselineHealth() {
  const state = ensureRakGameEngineState();
  const issues = [];
  const requiredHelpers = [
    'rakGameEngineActivate',
    'rakGameEngineDeactivate',
    'rakGameEnginePause',
    'rakGameEngineResume',
    'rakGameEngineShouldRun',
    'rakGameEngineNoteLoopStop',
    'setupRakGameEngineLifecycleBindings'
  ];
  requiredHelpers.forEach((name) => {
    if (typeof window[name] !== 'function') issues.push('helper ' + name);
  });

  const activeGame = rakGameEngineNormalizeId((typeof app !== 'undefined' && app && app.activeGameShell) || state.activeGameId || '');
  const expectedGames = ['ttt', '2048', 'snake', 'flap'];
  const hasStopLoops = typeof window.gamesStopActiveLoops === 'function' || typeof gamesStopActiveLoops === 'function';
  const hasRenderShell = typeof window.renderGameShell === 'function' || typeof renderGameShell === 'function';
  const hasOpenShell = typeof window.openGameShell === 'function' || typeof openGameShell === 'function';
  const hasCloseShell = typeof window.closeGameShell === 'function' || typeof closeGameShell === 'function';
  const gamePerf = window.__rakGamePerfManager || null;

  if (!window.__rakGameEngineLifecycleBound && typeof setupRakGameEngineLifecycleBindings === 'function') {
    try { setupRakGameEngineLifecycleBindings(); } catch (err) {}
  }
  if (!window.__rakGameEngineLifecycleBound) issues.push('lifecycle bindings missing');
  if (!hasStopLoops) issues.push('gamesStopActiveLoops missing');
  if (!hasRenderShell) issues.push('renderGameShell missing');
  if (!hasOpenShell) issues.push('openGameShell missing');
  if (!hasCloseShell) issues.push('closeGameShell missing');
  if (activeGame && !expectedGames.includes(activeGame) && !(window.__rakArcadeExtraGames && Array.isArray(window.__rakArcadeExtraGames) && window.__rakArcadeExtraGames.includes(activeGame))) issues.push('unknown active game ' + activeGame);

  state.lastCheckAt = new Date().toISOString();
  state.managedLoopCount = Number(gamePerf && gamePerf.activeManagedIntervals || 0) || 0;

  return {
    ok: issues.length === 0,
    mode: 'shared-game-engine-baseline',
    version: window.APP_VERSION || 'unknown',
    activeGame,
    bodyGamesOpen: !!(document.body && document.body.classList && document.body.classList.contains('gamesOpen')),
    bodyTttOpen: !!(document.body && document.body.classList && document.body.classList.contains('tttOpen')),
    paused: !!state.paused,
    openedCount: Number(state.openedCount || 0),
    closedCount: Number(state.closedCount || 0),
    pausedCount: Number(state.pausedCount || 0),
    resumedCount: Number(state.resumedCount || 0),
    loopStopRequests: Number(state.loopStopRequests || 0),
    lifecycleEvents: Number(state.lifecycleEvents || 0),
    managedLoopCount: Number(state.managedLoopCount || 0),
    seenGameCount: Array.isArray(state.seenGames) ? state.seenGames.length : 0,
    lastAction: String(state.lastAction || '—'),
    hasGamePerfManager: !!gamePerf,
    hasStopLoops,
    hasRenderShell,
    hasOpenShell,
    hasCloseShell,
    issueCount: issues.length,
    issues: issues.slice(0, 12)
  };
}
window.getGameEngineBaselineHealth = getGameEngineBaselineHealth;

function runGameEngineBaselineAudit() {
  const run = () => {
    try { setupRakGameEngineLifecycleBindings(); } catch (err) {}
    const report = getGameEngineBaselineHealth();
    try {
      document.documentElement.dataset.rakGameEngineAudit = report.ok ? report.mode : 'game-engine-check';
      window.__rakGameEngineBaselineAudit = Object.assign({ checkedAt: new Date().toISOString() }, report);
    } catch (err) {}
    if (!report.ok) console.warn('[RaK] Herní engine baseline audit', report);
    return report;
  };

  if (document.readyState === 'loading') {
    const rerun = () => setTimeout(run, 420);
    if (typeof registerListener === 'function') registerListener(document, 'DOMContentLoaded', rerun, { once: true });
    else document.addEventListener('DOMContentLoaded', rerun, { once: true });
    return { version: window.APP_VERSION || 'unknown', phase: 'game-engine-baseline', ok: true, deferred: true };
  }

  requestAnimationFrame(() => setTimeout(run, 420));
  return { version: window.APP_VERSION || 'unknown', phase: 'game-engine-baseline', ok: true, deferred: true };
}
window.runGameEngineBaselineAudit = runGameEngineBaselineAudit;

function getPhaseTenRuntimeReadinessHealth(parts = {}) {
  const checks = [];
  const addCheck = (name, ok) => checks.push({ name, ok: !!ok });

  try {
    const version = String(parts.version || window.APP_VERSION || '').trim();
    const appVersion = String(parts.appVersion || ((typeof app !== 'undefined' && app && app.version) || '')).trim();
    const securityStatus = parts.securityStatus || (typeof window.getSecurityRenderStatus === 'function' ? window.getSecurityRenderStatus() : null);
    const pwaStatus = parts.pwaStatus || (typeof window.getPwaHardeningStatus === 'function' ? window.getPwaHardeningStatus() : null);
    const dataStatus = parts.dataStatus || (typeof window.getDataOptimizationStatus === 'function' ? window.getDataOptimizationStatus() : null);
    const duplicateDomIds = Array.isArray(parts.duplicateDomIds) ? parts.duplicateDomIds : getPhaseTenDuplicateDomIds();
    const storageHealth = parts.storageHealth || getPhaseTenStorageHealth();
    const scriptHealth = parts.scriptHealth || getPhaseTenScriptLoadHealth();
    const navigationHealth = parts.navigationHealth || getPhaseTenNavigationHealth();
    const pageShellHealth = parts.pageShellHealth || getPhaseTenPageShellHealth();
    const actionHealth = parts.actionHealth || getPhaseTenActionHealth();
    const formHealth = parts.formHealth || getPhaseTenFormHealth();
    const safeHelperHealth = parts.safeHelperHealth || getPostStabilizationSafeHelperHealth();
    const ladaPerformanceHealth = parts.ladaPerformanceHealth || (typeof window.getLadaPerformanceHealth === 'function' ? getLadaPerformanceHealth() : null);
    const supabaseStructureHealth = parts.supabaseStructureHealth || (typeof window.getSupabaseStructureHealth === 'function' ? window.getSupabaseStructureHealth() : null);
    const gameEngineHealth = parts.gameEngineHealth || (typeof window.getGameEngineBaselineHealth === 'function' ? window.getGameEngineBaselineHealth() : null);

    addCheck('verze aplikace', /^v\.1\.1 \(\d+\)$/.test(version) && (!appVersion || appVersion === version));
    addCheck('Fáze 9 security/render', !!securityStatus && Number(securityStatus.phasePercent || 0) >= 100);
    addCheck('PWA/SW hardening', !pwaStatus || !pwaStatus.swVersionMismatch);
    addCheck('data optimalizace', !!dataStatus);
    addCheck('duplicitní DOM ID', duplicateDomIds.length === 0);
    addCheck('localStorage/runtime', !!storageHealth.ok && !!storageHealth.writable);
    addCheck('načtené moduly', !!scriptHealth.ok && Number(scriptHealth.duplicateCount || 0) === 0);
    addCheck('spodní navigace', !!navigationHealth.ok);
    addCheck('page shell', !!pageShellHealth.ok);
    addCheck('data-action/odkazy', !!actionHealth.ok);
    addCheck('formuláře/inputy', !!formHealth.ok);
    addCheck('safe helpery', !!safeHelperHealth.ok);
    addCheck('Láďův režim výkon', !!ladaPerformanceHealth && !!ladaPerformanceHealth.ok);
    addCheck('Supabase struktura', !!supabaseStructureHealth && !!supabaseStructureHealth.ok);
    addCheck('herní engine základ', !!gameEngineHealth && !!gameEngineHealth.ok);
  } catch (err) {
    addCheck(String(err && err.message ? err.message : err || 'runtime readiness error'), false);
  }

  const failed = checks.filter((item) => !item.ok).map((item) => item.name);
  return {
    ok: failed.length === 0,
    passedCount: checks.length - failed.length,
    totalCount: checks.length,
    failedItems: failed.slice(0, 18),
    checks
  };
}
window.getPhaseTenRuntimeReadinessHealth = getPhaseTenRuntimeReadinessHealth;

function getPostStabilizationBaselineHealth(parts = {}) {
  const issues = [];
  const checkedAt = new Date().toISOString();

  try {
    const version = String(parts.version || window.APP_VERSION || '').trim();
    const appVersion = String(parts.appVersion || ((typeof app !== 'undefined' && app && app.version) || '')).trim();
    const finalStatus = parts.finalStatus || ensureFinalStabilizationStatus();
    const runtimeReadinessHealth = parts.runtimeReadinessHealth || getPhaseTenRuntimeReadinessHealth(parts);
    const safeHelperHealth = parts.safeHelperHealth || getPostStabilizationSafeHelperHealth();
    const ladaPerformanceHealth = parts.ladaPerformanceHealth || (typeof window.getLadaPerformanceHealth === 'function' ? getLadaPerformanceHealth() : null);
    const supabaseStructureHealth = parts.supabaseStructureHealth || (typeof window.getSupabaseStructureHealth === 'function' ? window.getSupabaseStructureHealth() : null);
    const gameEngineHealth = parts.gameEngineHealth || (typeof window.getGameEngineBaselineHealth === 'function' ? getGameEngineBaselineHealth() : null);

    if (!/^v\.1\.1 \(\d+\)$/.test(version)) issues.push('version format');
    if (appVersion && version && appVersion !== version) issues.push('app.version mismatch');
    if (!finalStatus || Number(finalStatus.phasePercent || 0) < 100) issues.push('phase 10 not complete');
    if (!String(finalStatus && finalStatus.auditMode ? finalStatus.auditMode : '').includes('readiness-summary')) issues.push('missing readiness summary mode');
    if (!String(finalStatus && finalStatus.auditMode ? finalStatus.auditMode : '').includes('post-stabilization-baseline-watch')) issues.push('missing post-stabilization watch mode');
    if (!runtimeReadinessHealth || !runtimeReadinessHealth.ok) issues.push('runtime readiness not ok');
    if (!safeHelperHealth || !safeHelperHealth.ok) issues.push('safe helper guard not ok');
    if (!ladaPerformanceHealth || !ladaPerformanceHealth.ok) issues.push('lada performance guard not ok');
    if (!supabaseStructureHealth || !supabaseStructureHealth.ok) issues.push('supabase structure guard not ok');
    if (!gameEngineHealth || !gameEngineHealth.ok) issues.push('game engine baseline not ok');
    if (typeof window.getFinalStabilizationStatus !== 'function') issues.push('getFinalStabilizationStatus missing');
    if (typeof window.getPhaseTenRuntimeReadinessHealth !== 'function') issues.push('getPhaseTenRuntimeReadinessHealth missing');
    if (typeof window.getLadaPerformanceHealth !== 'function') issues.push('getLadaPerformanceHealth missing');
    if (typeof window.getSupabaseStructureHealth !== 'function') issues.push('getSupabaseStructureHealth missing');
    if (typeof window.getGameEngineBaselineHealth !== 'function') issues.push('getGameEngineBaselineHealth missing');
  } catch (err) {
    issues.push(String(err && err.message ? err.message : err || 'post-stabilization health error'));
  }

  return {
    ok: issues.length === 0,
    mode: 'post-stabilization-baseline-watch',
    checkedAt,
    issueCount: issues.length,
    issues: issues.slice(0, 12)
  };
}
window.getPostStabilizationBaselineHealth = getPostStabilizationBaselineHealth;

function runPhaseTenFinalStabilizationAudit() {
  const run = () => {
    const status = ensureFinalStabilizationStatus();
    const version = String(window.APP_VERSION || '').trim();
    const appVersion = String((typeof app !== 'undefined' && app && app.version) || '').trim();
    const securityStatus = typeof window.getSecurityRenderStatus === 'function' ? window.getSecurityRenderStatus() : null;
    const pwaStatus = typeof window.getPwaHardeningStatus === 'function' ? window.getPwaHardeningStatus() : null;
    const dataStatus = typeof window.getDataOptimizationStatus === 'function' ? window.getDataOptimizationStatus() : null;
    const missing = [];
    const duplicateDomIds = getPhaseTenDuplicateDomIds();
    const storedErrorLogCount = getPhaseTenErrorLogCount();
    const storageHealth = getPhaseTenStorageHealth();
    const scriptHealth = getPhaseTenScriptLoadHealth();
    const navigationHealth = getPhaseTenNavigationHealth();
    const pageShellHealth = getPhaseTenPageShellHealth();
    const actionHealth = getPhaseTenActionHealth();
    const formHealth = getPhaseTenFormHealth();
    const safeHelperHealth = getPostStabilizationSafeHelperHealth();
    const ladaPerformanceHealth = getLadaPerformanceHealth();
    const supabaseStructureHealth = typeof window.getSupabaseStructureHealth === 'function' ? window.getSupabaseStructureHealth() : null;
    const gameEngineHealth = typeof window.getGameEngineBaselineHealth === 'function' ? window.getGameEngineBaselineHealth() : null;
    const runtimeReadinessHealth = getPhaseTenRuntimeReadinessHealth({
      version,
      appVersion,
      securityStatus,
      pwaStatus,
      dataStatus,
      duplicateDomIds,
      storageHealth,
      scriptHealth,
      navigationHealth,
      pageShellHealth,
      actionHealth,
      formHealth,
      safeHelperHealth,
      ladaPerformanceHealth,
      supabaseStructureHealth,
      gameEngineHealth
    });
    const postStabilizationHealth = getPostStabilizationBaselineHealth({
      version,
      appVersion,
      finalStatus: status,
      runtimeReadinessHealth,
      safeHelperHealth,
      ladaPerformanceHealth,
      supabaseStructureHealth,
      gameEngineHealth
    });

    const requiredDom = ['home', 'kalkulacky', 'rotace', 'rotaceStatsPanel', 'games'];
    requiredDom.forEach((id) => {
      if (!document.getElementById(id)) missing.push('DOM #' + id);
    });
    if (!document.querySelector('.bottomNav')) missing.push('DOM .bottomNav');

    const requiredFns = [
      'setElementTextIfChanged',
      'setElementHtmlIfChanged',
      'setElementChildrenIfChanged',
      'replaceElementChildrenSafely',
      'clearElementChildrenSafely',
      'normalizeSafeExternalUrl',
      'normalizeAllowedExternalUrl',
      'setSafeExternalAnchor',
      'getSecurityRenderStatus',
      'getDataOptimizationStatus',
      'getPhaseTenStorageHealth',
      'getPhaseTenScriptLoadHealth',
      'getPhaseTenNavigationHealth',
      'getPhaseTenPageShellHealth',
      'getPhaseTenActionHealth',
      'getPhaseTenFormHealth',
      'getPhaseTenRuntimeReadinessHealth',
      'getPostStabilizationSafeHelperHealth',
      'getPostStabilizationBaselineHealth',
      'getLadaPerformanceHealth',
      'getSupabaseStructureHealth',
      'runLadaPerformanceAudit',
      'getGameEngineBaselineHealth',
      'runGameEngineBaselineAudit',
      'setupRakGameEngineLifecycleBindings'
    ];
    requiredFns.forEach((name) => {
      if (typeof window[name] !== 'function') missing.push('fn ' + name);
    });

    if (duplicateDomIds.length) missing.push('duplicate DOM ids: ' + duplicateDomIds.slice(0, 8).join(', '));
    if (!storageHealth.ok || !storageHealth.writable) missing.push('localStorage health');
    if (!scriptHealth.ok) missing.push('script load health');
    if (!navigationHealth.ok) missing.push('navigation health');
    if (!pageShellHealth.ok) missing.push('page shell health');
    if (!actionHealth.ok) missing.push('action/link health');
    if (!formHealth.ok) missing.push('form/input health');
    if (!safeHelperHealth.ok) missing.push('safe helper guard');
    if (!ladaPerformanceHealth.ok) missing.push('Láďův režim performance guard');
    if (!gameEngineHealth || !gameEngineHealth.ok) missing.push('game engine baseline');
    if (!runtimeReadinessHealth.ok) missing.push('runtime readiness summary');
    if (!postStabilizationHealth.ok) missing.push('post-stabilization baseline watch');
    if (!/^v\.1\.1 \(\d+\)$/.test(version)) missing.push('version format');
    if (appVersion && version && appVersion !== version) missing.push('app.version mismatch');
    if (!securityStatus || Number(securityStatus.phasePercent || 0) < 100) missing.push('phase9 security status');
    if (!dataStatus) missing.push('phase7 data status');
    if (pwaStatus && pwaStatus.swExpectedCacheVersion && pwaStatus.swCacheVersion && pwaStatus.swVersionMismatch) {
      missing.push('service worker cache version mismatch');
    }

    const report = {
      version: version || 'unknown',
      appVersion: appVersion || 'unknown',
      phase: 'phase-10-final-stabilization',
      phasePercent: 100,
      checkedAt: new Date().toISOString(),
      ok: missing.length === 0,
      missing,
      currentPage: String(document.querySelector('.page.active')?.id || ''),
      securityPhasePercent: securityStatus ? Number(securityStatus.phasePercent || 0) : 0,
      pwaPhasePercent: pwaStatus ? Number(pwaStatus.phasePercent || 0) : 0,
      pwaVersionMismatch: !!(pwaStatus && pwaStatus.swVersionMismatch),
      dataOptimizationReady: !!dataStatus,
      duplicateDomIds,
      duplicateDomIdCount: duplicateDomIds.length,
      errorLogCount: storedErrorLogCount,
      storageOk: !!storageHealth.ok,
      storageWritable: !!storageHealth.writable,
      storageItemCount: Number(storageHealth.itemCount || 0),
      largeStorageKeys: Array.isArray(storageHealth.largeKeys) ? storageHealth.largeKeys : [],
      largeStorageKeyCount: Array.isArray(storageHealth.largeKeys) ? storageHealth.largeKeys.length : 0,
      storageError: String(storageHealth.error || ''),
      navigatorOnline: storageHealth.navigatorOnline !== false,
      visibilityState: String(storageHealth.visibilityState || 'unknown'),
      scriptHealthOk: !!scriptHealth.ok,
      scriptExpectedCount: Number(scriptHealth.expectedCount || 0),
      scriptLoadedExpectedCount: Number(scriptHealth.loadedExpectedCount || 0),
      scriptMissingFiles: Array.isArray(scriptHealth.missing) ? scriptHealth.missing : [],
      scriptMissingCount: Array.isArray(scriptHealth.missing) ? scriptHealth.missing.length : 0,
      scriptDuplicateFiles: Array.isArray(scriptHealth.duplicateFiles) ? scriptHealth.duplicateFiles : [],
      scriptDuplicateCount: Number(scriptHealth.duplicateCount || 0),
      scriptUnexpectedLocalJs: Array.isArray(scriptHealth.unexpectedLocalJs) ? scriptHealth.unexpectedLocalJs : [],
      scriptUnexpectedLocalJsCount: Number(scriptHealth.unexpectedLocalJsCount || 0),
      navigationHealthOk: !!navigationHealth.ok,
      navigationButtonCount: Number(navigationHealth.buttonCount || 0),
      navigationActiveCount: Number(navigationHealth.activeCount || 0),
      navigationBound: !!navigationHealth.bound,
      navigationActivePage: String(navigationHealth.activePageId || ''),
      navigationMissingItems: Array.isArray(navigationHealth.missing) ? navigationHealth.missing : [],
      navigationMissingCount: Array.isArray(navigationHealth.missing) ? navigationHealth.missing.length : 0,
      pageShellHealthOk: !!pageShellHealth.ok,
      pageShellPageCount: Number(pageShellHealth.pageCount || 0),
      pageShellActiveCount: Number(pageShellHealth.activePageCount || 0),
      pageShellActivePage: String(pageShellHealth.activePageId || ''),
      pageShellCriticalPanelCount: Number(pageShellHealth.criticalPanelCount || 0),
      pageShellMissingItems: Array.isArray(pageShellHealth.missing) ? pageShellHealth.missing : [],
      pageShellMissingCount: Array.isArray(pageShellHealth.missing) ? pageShellHealth.missing.length : 0,
      actionHealthOk: !!actionHealth.ok,
      actionCount: Number(actionHealth.actionCount || 0),
      actionDelegatedAllowedCount: Number(actionHealth.delegatedAllowedCount || 0),
      actionNavAllowedCount: Number(actionHealth.navAllowedCount || 0),
      actionChangeAllowedCount: Number(actionHealth.changeAllowedCount || 0),
      actionUnknownItems: Array.isArray(actionHealth.unknownActions) ? actionHealth.unknownActions : [],
      actionUnknownCount: Array.isArray(actionHealth.unknownActions) ? actionHealth.unknownActions.length : 0,
      actionRequiredMissingItems: Array.isArray(actionHealth.requiredMissing) ? actionHealth.requiredMissing : [],
      actionRequiredMissingCount: Array.isArray(actionHealth.requiredMissing) ? actionHealth.requiredMissing.length : 0,
      actionMissingTargetItems: Array.isArray(actionHealth.missingTargets) ? actionHealth.missingTargets : [],
      actionMissingTargetsCount: Array.isArray(actionHealth.missingTargets) ? actionHealth.missingTargets.length : 0,
      actionLinkIssues: Array.isArray(actionHealth.linkIssues) ? actionHealth.linkIssues : [],
      actionLinkIssueCount: Array.isArray(actionHealth.linkIssues) ? actionHealth.linkIssues.length : 0,
      formHealthOk: !!formHealth.ok,
      formInputCount: Number(formHealth.inputCount || 0),
      formSelectCount: Number(formHealth.selectCount || 0),
      formButtonCount: Number(formHealth.buttonCount || 0),
      formRequiredMissingItems: Array.isArray(formHealth.requiredMissing) ? formHealth.requiredMissing : [],
      formRequiredMissingCount: Array.isArray(formHealth.requiredMissing) ? formHealth.requiredMissing.length : 0,
      formActionMissingItems: Array.isArray(formHealth.actionMissing) ? formHealth.actionMissing : [],
      formActionMissingCount: Array.isArray(formHealth.actionMissing) ? formHealth.actionMissing.length : 0,
      formInvalidNumberItems: Array.isArray(formHealth.invalidNumberInputs) ? formHealth.invalidNumberInputs : [],
      formInvalidNumberCount: Array.isArray(formHealth.invalidNumberInputs) ? formHealth.invalidNumberInputs.length : 0,
      runtimeReadinessOk: !!runtimeReadinessHealth.ok,
      runtimeReadinessPassedCount: Number(runtimeReadinessHealth.passedCount || 0),
      runtimeReadinessTotalCount: Number(runtimeReadinessHealth.totalCount || 0),
      runtimeReadinessFailedItems: Array.isArray(runtimeReadinessHealth.failedItems) ? runtimeReadinessHealth.failedItems : [],
      safeHelperHealthOk: !!safeHelperHealth.ok,
      safeHelperCount: Number(safeHelperHealth.helperCount || 0),
      safeHelperMissingCount: Number(safeHelperHealth.missingCount || 0),
      safeHelperMissingItems: Array.isArray(safeHelperHealth.missing) ? safeHelperHealth.missing : [],
      ladaPerformanceOk: !!ladaPerformanceHealth.ok,
      ladaPerformanceMode: String(ladaPerformanceHealth.mode || '—'),
      ladaPerformanceActive: !!ladaPerformanceHealth.active,
      ladaPerformanceDprLimit: Number(ladaPerformanceHealth.dprLimit || 0),
      ladaPerformanceMaxBlurPx: Number(ladaPerformanceHealth.maxBlurPx || 0),
      ladaPerformanceAnimatedSampleCount: Number(ladaPerformanceHealth.animatedSampleCount || 0),
      ladaPerformanceIssueCount: Array.isArray(ladaPerformanceHealth.issues) ? ladaPerformanceHealth.issues.length : 0,
      ladaPerformanceIssues: Array.isArray(ladaPerformanceHealth.issues) ? ladaPerformanceHealth.issues : [],
      supabaseStructureOk: !!(supabaseStructureHealth && supabaseStructureHealth.ok),
      supabaseStructureMode: String(supabaseStructureHealth && supabaseStructureHealth.mode || '—'),
      supabaseStructureTableCount: Number(supabaseStructureHealth && supabaseStructureHealth.expectedTableCount || 0),
      supabaseStructureRealtimeTableCount: Number(supabaseStructureHealth && supabaseStructureHealth.realtimeTableCount || 0),
      supabaseStructureMissingRealtimeTableCount: Number(supabaseStructureHealth && supabaseStructureHealth.missingRealtimeTableCount || 0),
      supabaseStructureMissingQueueTypeCount: Number(supabaseStructureHealth && supabaseStructureHealth.missingQueueTypeCount || 0),
      supabaseStructureMissingHelperCount: Number(supabaseStructureHealth && supabaseStructureHealth.missingHelperCount || 0),
      supabaseStructureGrantSignalCount: Number(supabaseStructureHealth && supabaseStructureHealth.grantSignalCount || 0),
      supabaseStructureIssueCount: Array.isArray(supabaseStructureHealth && supabaseStructureHealth.issues) ? supabaseStructureHealth.issues.length : 0,
      supabaseStructureIssues: Array.isArray(supabaseStructureHealth && supabaseStructureHealth.issues) ? supabaseStructureHealth.issues : [],
      gameEngineHealthOk: !!(gameEngineHealth && gameEngineHealth.ok),
      gameEngineMode: String(gameEngineHealth && gameEngineHealth.mode || '—'),
      gameEngineActiveGame: String(gameEngineHealth && gameEngineHealth.activeGame || ''),
      gameEngineManagedLoopCount: Number(gameEngineHealth && gameEngineHealth.managedLoopCount || 0),
      gameEngineLifecycleEvents: Number(gameEngineHealth && gameEngineHealth.lifecycleEvents || 0),
      gameEngineIssueCount: Array.isArray(gameEngineHealth && gameEngineHealth.issues) ? gameEngineHealth.issues.length : 0,
      gameEngineIssues: Array.isArray(gameEngineHealth && gameEngineHealth.issues) ? gameEngineHealth.issues : [],
      postStabilizationOk: !!postStabilizationHealth.ok,
      postStabilizationMode: String(postStabilizationHealth.mode || '—'),
      postStabilizationCheckedAt: String(postStabilizationHealth.checkedAt || ''),
      postStabilizationIssueCount: Number(postStabilizationHealth.issueCount || 0),
      postStabilizationIssues: Array.isArray(postStabilizationHealth.issues) ? postStabilizationHealth.issues : []
    };

    status.audits = Number(status.audits || 0) + 1;
    status.lastAuditOk = report.ok;
    status.lastMissingCount = missing.length;
    status.lastMissingItems = missing.slice(0, 12);
    status.lastCheckedAt = report.checkedAt;
    status.lastVersion = report.version;
    status.lastPage = report.currentPage || '—';
    status.lastPhase9Percent = report.securityPhasePercent;
    status.lastPhase8Percent = report.pwaPhasePercent;
    status.lastPwaVersionMismatch = report.pwaVersionMismatch;
    status.lastDataOptimizationReady = report.dataOptimizationReady;
    status.lastDuplicateIdCount = report.duplicateDomIdCount;
    status.lastDuplicateIds = report.duplicateDomIds.slice(0, 12);
    status.lastErrorLogCount = report.errorLogCount;
    status.lastStorageOk = report.storageOk && report.storageWritable;
    status.lastStorageItemCount = report.storageItemCount;
    status.lastLargeStorageKeyCount = report.largeStorageKeyCount;
    status.lastLargeStorageKeys = report.largeStorageKeys.slice(0, 8);
    status.lastNavigatorOnline = report.navigatorOnline;
    status.lastVisibilityState = report.visibilityState;
    status.lastScriptHealthOk = report.scriptHealthOk;
    status.lastScriptMissingCount = report.scriptMissingCount;
    status.lastScriptDuplicateCount = report.scriptDuplicateCount;
    status.lastScriptUnexpectedCount = report.scriptUnexpectedLocalJsCount;
    status.lastScriptMissingFiles = report.scriptMissingFiles.slice(0, 12);
    status.lastScriptDuplicateFiles = report.scriptDuplicateFiles.slice(0, 12);
    status.lastNavigationHealthOk = report.navigationHealthOk;
    status.lastNavigationButtonCount = report.navigationButtonCount;
    status.lastNavigationActiveCount = report.navigationActiveCount;
    status.lastNavigationMissingCount = report.navigationMissingCount;
    status.lastNavigationMissingItems = report.navigationMissingItems.slice(0, 12);
    status.lastPageShellHealthOk = report.pageShellHealthOk;
    status.lastPageShellPageCount = report.pageShellPageCount;
    status.lastPageShellActiveCount = report.pageShellActiveCount;
    status.lastPageShellCriticalPanelCount = report.pageShellCriticalPanelCount;
    status.lastPageShellMissingCount = report.pageShellMissingCount;
    status.lastPageShellMissingItems = report.pageShellMissingItems.slice(0, 12);
    status.lastActionHealthOk = report.actionHealthOk;
    status.lastActionCount = report.actionCount;
    status.lastActionUnknownCount = report.actionUnknownCount;
    status.lastActionRequiredMissingCount = report.actionRequiredMissingCount;
    status.lastActionMissingTargetsCount = report.actionMissingTargetsCount;
    status.lastActionLinkIssueCount = report.actionLinkIssueCount;
    status.lastActionUnknownItems = report.actionUnknownItems.slice(0, 12);
    status.lastActionRequiredMissingItems = report.actionRequiredMissingItems.slice(0, 12);
    status.lastActionMissingTargetItems = report.actionMissingTargetItems.slice(0, 12);
    status.lastActionLinkIssues = report.actionLinkIssues.slice(0, 12);
    status.lastFormHealthOk = report.formHealthOk;
    status.lastFormInputCount = report.formInputCount;
    status.lastFormSelectCount = report.formSelectCount;
    status.lastFormButtonCount = report.formButtonCount;
    status.lastFormRequiredMissingCount = report.formRequiredMissingCount;
    status.lastFormActionMissingCount = report.formActionMissingCount;
    status.lastFormInvalidNumberCount = report.formInvalidNumberCount;
    status.lastFormRequiredMissingItems = report.formRequiredMissingItems.slice(0, 12);
    status.lastFormActionMissingItems = report.formActionMissingItems.slice(0, 12);
    status.lastFormInvalidNumberItems = report.formInvalidNumberItems.slice(0, 12);
    status.lastRuntimeReadinessOk = report.runtimeReadinessOk;
    status.lastRuntimeReadinessPassedCount = report.runtimeReadinessPassedCount;
    status.lastRuntimeReadinessTotalCount = report.runtimeReadinessTotalCount;
    status.lastRuntimeReadinessFailedItems = report.runtimeReadinessFailedItems.slice(0, 12);
    status.lastSafeHelperHealthOk = report.safeHelperHealthOk;
    status.lastSafeHelperCount = report.safeHelperCount;
    status.lastSafeHelperMissingCount = report.safeHelperMissingCount;
    status.lastSafeHelperMissingItems = report.safeHelperMissingItems.slice(0, 12);
    status.lastLadaPerformanceOk = report.ladaPerformanceOk;
    status.lastLadaPerformanceMode = report.ladaPerformanceMode;
    status.lastLadaPerformanceActive = report.ladaPerformanceActive;
    status.lastLadaPerformanceDprLimit = report.ladaPerformanceDprLimit;
    status.lastLadaPerformanceMaxBlurPx = report.ladaPerformanceMaxBlurPx;
    status.lastLadaPerformanceAnimatedSampleCount = report.ladaPerformanceAnimatedSampleCount;
    status.lastLadaPerformanceIssueCount = report.ladaPerformanceIssueCount;
    status.lastLadaPerformanceIssues = report.ladaPerformanceIssues.slice(0, 12);
    status.lastSupabaseStructureOk = report.supabaseStructureOk;
    status.lastSupabaseStructureMode = report.supabaseStructureMode;
    status.lastSupabaseStructureTableCount = report.supabaseStructureTableCount;
    status.lastSupabaseStructureIssueCount = report.supabaseStructureIssueCount;
    status.lastSupabaseStructureIssues = report.supabaseStructureIssues.slice(0, 12);
    status.lastGameEngineHealthOk = report.gameEngineHealthOk;
    status.lastGameEngineMode = report.gameEngineMode;
    status.lastGameEngineActiveGame = report.gameEngineActiveGame;
    status.lastGameEngineManagedLoopCount = report.gameEngineManagedLoopCount;
    status.lastGameEngineLifecycleEvents = report.gameEngineLifecycleEvents;
    status.lastGameEngineIssueCount = report.gameEngineIssueCount;
    status.lastGameEngineIssues = report.gameEngineIssues.slice(0, 12);
    status.lastPostStabilizationOk = report.postStabilizationOk;
    status.lastPostStabilizationMode = report.postStabilizationMode;
    status.lastPostStabilizationCheckedAt = report.postStabilizationCheckedAt;
    status.lastPostStabilizationIssueCount = report.postStabilizationIssueCount;
    status.lastPostStabilizationIssues = report.postStabilizationIssues.slice(0, 12);
    status.lastAudit = report;

    try {
      document.documentElement.dataset.rakPhase10 = report.ok ? 'final-stabilization-complete' : 'final-stabilization-check';
      window.__rakPhase10FinalStabilizationAudit = report;
    } catch (err) {}

    if (!report.ok) {
      console.warn('[RaK] Phase 10 final stabilization audit', report);
      try {
        const log = JSON.parse(localStorage.getItem('rotace_err_log_v1') || '[]');
        log.push({
          ts: report.checkedAt,
          ver: report.version,
          type: 'phase10-final-stabilization-audit',
          missing: report.missing
        });
        localStorage.setItem('rotace_err_log_v1', JSON.stringify(log.slice(-50)));
      } catch (err) {}
    }

    return report;
  };

  if (document.readyState === 'loading') {
    const rerun = () => setTimeout(run, 360);
    if (typeof registerListener === 'function') registerListener(document, 'DOMContentLoaded', rerun, { once: true });
    else document.addEventListener('DOMContentLoaded', rerun, { once: true });
    return { version: window.APP_VERSION || 'unknown', phase: 'phase-10-final-stabilization', phasePercent: 100, ok: true, deferred: true };
  }

  requestAnimationFrame(() => setTimeout(run, 360));
  return { version: window.APP_VERSION || 'unknown', phase: 'phase-10-final-stabilization', phasePercent: 100, ok: true, deferred: true };
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
  try { runPhaseTenFinalStabilizationAudit(); } catch (err) { console.warn('Phase 10 final stabilization audit failed', err); }
  try { runLadaPerformanceAudit(); } catch (err) { console.warn('Láďův režim performance audit failed', err); }
  try { runGameEngineBaselineAudit(); } catch (err) { console.warn('Game engine baseline audit failed', err); }

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
      "DOM #rotaceStatsPanel": !!document.getElementById("rotaceStatsPanel"),
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
  const SW_PRECACHE_REPAIR_GUARD_MS = 2 * 60 * 1000;
  const SW_CACHE_STATUS_REQUEST_GUARD_MS = 20 * 1000;
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
  let lastSwPrecacheRepairAt = 0;
  let lastSwCacheStatusRequestAt = 0;
  let deferredInstallPrompt = null;

  const pwaHardeningStatus = window.__rakPwaHardeningStatus || {
    phase: 'phase-8-pwa-service-worker-hardening',
    phasePercent: 100,
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
    swCacheStatusRequestSkips: 0,
    swCacheStatusRequestMode: 'throttled-cache-status-requests',
    swLastCacheStatusRequestAt: 0,
    swCacheStatusErrors: 0,
    swCacheVersion: '',
    swStaticCacheEntries: 0,
    swRuntimeCacheEntries: 0,
    swAppShellCount: 0,
    swPrecacheSuccessCount: 0,
    swPrecacheFailedCount: 0,
    swPrecacheMissingCount: 0,
    swPrecacheRepairMode: '',
    swPrecacheRepairRequests: 0,
    swPrecacheRepairSkips: 0,
    swStaleCacheCleanupMode: '',
    swManagedRakCacheCount: 0,
    swStaleRakCacheCount: 0,
    swStaleRakCacheDeletedCount: 0,
    swStaleCacheCleanupAt: 0,
    swPrecacheRepairAttemptedCount: 0,
    swPrecacheRepairSuccessCount: 0,
    swPrecacheRepairFailedCount: 0,
    swLastPrecacheRepairAt: 0,
    swLastPrecacheRepairSource: '',
    swClientsCount: 0,
    swNavigationPreloadEnabled: false,
    swCacheLookupMode: '',
    swCacheableResponseMode: '',
    swActivateRuntimeTrimMode: '',
    swNetworkTimeoutFallbackMode: '',
    swStaticCacheFirstTimeoutMode: '',
    swPhase8CompletionMode: '',
    swPhase8Ready: false,
    swAppShellCachedRatio: 0,
    swNetworkFallbackTimeoutMs: 0,
    swNavigationPreloadTimeoutMs: 0,
    swRuntimeTrimBeforeCount: 0,
    swRuntimeTrimAfterCount: 0,
    swRuntimeTrimDeletedCount: 0,
    swRuntimeTrimAt: 0,
    swPrecacheIntegrityMode: '',
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

  const requestActiveServiceWorkerPrecacheRepair = (source) => {
    try {
      if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return false;
      if (!navigator.onLine) {
        pwaHardeningStatus.swPrecacheRepairSkips = Number(pwaHardeningStatus.swPrecacheRepairSkips || 0) + 1;
        pwaHardeningStatus.swLastPrecacheRepairSource = String(source || 'offline') + ':offline';
        return false;
      }
      const now = Date.now();
      if (lastSwPrecacheRepairAt && now - lastSwPrecacheRepairAt < SW_PRECACHE_REPAIR_GUARD_MS) {
        pwaHardeningStatus.swPrecacheRepairSkips = Number(pwaHardeningStatus.swPrecacheRepairSkips || 0) + 1;
        pwaHardeningStatus.swLastPrecacheRepairSource = String(source || 'repair') + ':throttled';
        return false;
      }
      lastSwPrecacheRepairAt = now;
      pwaHardeningStatus.swPrecacheRepairRequests = Number(pwaHardeningStatus.swPrecacheRepairRequests || 0) + 1;
      pwaHardeningStatus.swLastPrecacheRepairAt = now;
      pwaHardeningStatus.swLastPrecacheRepairSource = String(source || 'cache-status');
      navigator.serviceWorker.controller.postMessage({ type: 'REPAIR_PRECACHE', source: source || 'cache-status' });
      return true;
    } catch (err) {
      pwaHardeningStatus.swCacheStatusErrors = Number(pwaHardeningStatus.swCacheStatusErrors || 0) + 1;
      pwaHardeningStatus.swLastCacheStatusError = err && err.message ? err.message : String(err || 'precache-repair-request-error');
      return false;
    }
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
    pwaHardeningStatus.swPrecacheMissingCount = Number(data.precacheMissingCount || 0);
    pwaHardeningStatus.swClientsCount = Number(data.clientsCount || 0);
    pwaHardeningStatus.swNavigationPreloadEnabled = !!data.navigationPreloadEnabled;
    pwaHardeningStatus.swCacheLookupMode = String(data.cacheLookupMode || '');
    pwaHardeningStatus.swCacheableResponseMode = String(data.cacheableResponseMode || pwaHardeningStatus.swCacheableResponseMode || '');
    pwaHardeningStatus.swActivateRuntimeTrimMode = String(data.activateRuntimeTrimMode || pwaHardeningStatus.swActivateRuntimeTrimMode || '');
    pwaHardeningStatus.swNetworkTimeoutFallbackMode = String(data.networkTimeoutFallbackMode || pwaHardeningStatus.swNetworkTimeoutFallbackMode || '');
    pwaHardeningStatus.swStaticCacheFirstTimeoutMode = String(data.staticCacheFirstTimeoutMode || pwaHardeningStatus.swStaticCacheFirstTimeoutMode || '');
    pwaHardeningStatus.swPhase8CompletionMode = String(data.phase8CompletionMode || pwaHardeningStatus.swPhase8CompletionMode || '');
    pwaHardeningStatus.swPhase8Ready = !!data.phase8Ready;
    pwaHardeningStatus.swAppShellCachedRatio = Number(data.appShellCachedRatio || pwaHardeningStatus.swAppShellCachedRatio || 0);
    pwaHardeningStatus.swNetworkFallbackTimeoutMs = Number(data.networkFallbackTimeoutMs || pwaHardeningStatus.swNetworkFallbackTimeoutMs || 0);
    pwaHardeningStatus.swNavigationPreloadTimeoutMs = Number(data.navigationPreloadTimeoutMs || pwaHardeningStatus.swNavigationPreloadTimeoutMs || 0);
    pwaHardeningStatus.swRuntimeTrimBeforeCount = Number(data.runtimeTrimBeforeCount || pwaHardeningStatus.swRuntimeTrimBeforeCount || 0);
    pwaHardeningStatus.swRuntimeTrimAfterCount = Number(data.runtimeTrimAfterCount || pwaHardeningStatus.swRuntimeTrimAfterCount || 0);
    pwaHardeningStatus.swRuntimeTrimDeletedCount = Number(data.runtimeTrimDeletedCount || pwaHardeningStatus.swRuntimeTrimDeletedCount || 0);
    if (data.runtimeTrimAt) pwaHardeningStatus.swRuntimeTrimAt = Number(data.runtimeTrimAt || 0);
    pwaHardeningStatus.swPrecacheFetchMode = String(data.precacheFetchMode || '');
    pwaHardeningStatus.swPrecacheIntegrityMode = String(data.precacheIntegrityMode || '');
    pwaHardeningStatus.swPrecacheRepairMode = String(data.precacheRepairMode || '');
    pwaHardeningStatus.swStaleCacheCleanupMode = String(data.staleCacheCleanupMode || pwaHardeningStatus.swStaleCacheCleanupMode || '');
    pwaHardeningStatus.swManagedRakCacheCount = Number(data.managedRakCacheCount || pwaHardeningStatus.swManagedRakCacheCount || 0);
    pwaHardeningStatus.swStaleRakCacheCount = Number(data.staleRakCacheCount || 0);
    pwaHardeningStatus.swStaleRakCacheDeletedCount = Number(data.staleRakCacheDeletedCount || pwaHardeningStatus.swStaleRakCacheDeletedCount || 0);
    if (data.staleCacheCleanupAt) pwaHardeningStatus.swStaleCacheCleanupAt = Number(data.staleCacheCleanupAt || 0);
    pwaHardeningStatus.swPrecacheRepairAttemptedCount = Number(data.precacheRepairAttemptedCount || pwaHardeningStatus.swPrecacheRepairAttemptedCount || 0);
    pwaHardeningStatus.swPrecacheRepairSuccessCount = Number(data.precacheRepairSuccessCount || pwaHardeningStatus.swPrecacheRepairSuccessCount || 0);
    pwaHardeningStatus.swPrecacheRepairFailedCount = Number(data.precacheRepairFailedCount || pwaHardeningStatus.swPrecacheRepairFailedCount || 0);
    if (data.precacheRepairCompletedAt) pwaHardeningStatus.swLastPrecacheRepairAt = Number(data.precacheRepairCompletedAt || 0);
    if (data.precacheRepairSource) pwaHardeningStatus.swLastPrecacheRepairSource = String(data.precacheRepairSource || '');
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
    if (Number(data.precacheMissingCount || 0) > 0 && data.source !== 'precache-repair') {
      requestActiveServiceWorkerPrecacheRepair(source || data.type || 'cache-status');
    }
  };

  const requestActiveServiceWorkerCacheStatus = (source, opts = {}) => {
    try {
      if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return false;
      const force = !!(opts && opts.force);
      const now = Date.now();
      if (!force && lastSwCacheStatusRequestAt && now - lastSwCacheStatusRequestAt < SW_CACHE_STATUS_REQUEST_GUARD_MS) {
        pwaHardeningStatus.swCacheStatusRequestSkips = Number(pwaHardeningStatus.swCacheStatusRequestSkips || 0) + 1;
        pwaHardeningStatus.swLastCacheStatusSource = String(source || 'request') + ':throttled';
        return false;
      }
      lastSwCacheStatusRequestAt = now;
      pwaHardeningStatus.swCacheStatusRequests = Number(pwaHardeningStatus.swCacheStatusRequests || 0) + 1;
      pwaHardeningStatus.swCacheStatusRequestMode = 'throttled-cache-status-requests';
      pwaHardeningStatus.swLastCacheStatusRequestAt = now;
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

    const main = document.createElement('div');
    main.className = 'rakUpdateToastMain';

    const badge = document.createElement('div');
    badge.className = 'rakUpdateToastBadge';
    badge.setAttribute('aria-hidden', 'true');
    badge.textContent = '⟳';

    const body = document.createElement('div');
    body.className = 'rakUpdateToastBody';

    const title = document.createElement('div');
    title.className = 'rakUpdateToastTitle';
    title.textContent = 'K dispozici je nová verze aplikace';

    const version = document.createElement('div');
    version.className = 'rakUpdateToastVersion';
    version.textContent = swNextUpdateVersion
      ? 'Nová verze: ' + String(swNextUpdateVersion)
      : 'Nová verze: zjišťuji…';

    const text = document.createElement('div');
    text.className = 'rakUpdateToastText';
    text.textContent = 'Klikni na Aktualizovat a appka načte novou cache bez přeinstalace.';

    body.append(title, version, text);
    main.append(badge, body);

    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'rakUpdateToastAction';
    action.textContent = 'Aktualizovat';

    toast.append(main, action);
    if (typeof recordSafeDomBuild === 'function') recordSafeDomBuild('swUpdateToast');
    document.body.appendChild(toast);
    swUpdateToastEl = toast;
    swUpdateButtonEl = action;
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
        requestActiveServiceWorkerCacheStatus(reason + '-after-update-check', { force: true });
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
      requestActiveServiceWorkerCacheStatus('register', { force: true });
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
      requestActiveServiceWorkerCacheStatus('controllerchange', { force: true });
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
    requestActiveServiceWorkerCacheStatus('online', { force: true });
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
