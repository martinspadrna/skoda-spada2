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

function setBottomNavActive(pageId) {
  const buttons = document.querySelectorAll('.bottomNavBtn');
  buttons.forEach(btn => {
    const isActive = btn.dataset.page === pageId;
    btn.classList.toggle('active', isActive);
    if (isActive && btn.dataset.page !== 'menu') {
      centerBottomNavButton(btn);
    }
  });
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
const LIGHTWEIGHT_MODE_LABEL = 'Láďův režim';

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

function applyUiPrefs(prefs) {
  const lowEndInfo = getLowEndDeviceInfo();
  const lowEndDetected = !!lowEndInfo.lowEnd;
  const incoming = Object.assign({}, prefs || loadUiPrefs());
  if (lowEndDetected && !incoming.lightweightManual) incoming.lightweight = true;
  const next = saveUiPrefs(incoming);
  const lightweight = !!next.lightweight;
  const ladaMode = lightweight || lowEndDetected;
  document.body.classList.toggle('compactUI', !!next.compact);
  document.body.classList.toggle('reduceMotion', !!next.reduceMotion || ladaMode);
  document.body.classList.toggle('lightweightMode', lightweight);
  document.body.classList.toggle('ladaMode', ladaMode);
  document.body.classList.toggle('lowEndDevice', lowEndDetected);
  try {
    document.documentElement.dataset.rakLightweight = lightweight ? 'on' : 'off';
    document.documentElement.dataset.rakLightweightLabel = LIGHTWEIGHT_MODE_LABEL;
    document.documentElement.dataset.rakLowEndDevice = lowEndDetected ? 'yes' : 'no';
    document.documentElement.dataset.rakLowEndReason = lowEndDetected ? lowEndInfo.reasons.join(', ') : '';
    document.documentElement.dataset.rakPerformanceMode = ladaMode ? (lowEndDetected ? 'lada-auto-low-end' : 'lada-manual') : 'normal';
    document.documentElement.dataset.rakMotion = (next.reduceMotion || ladaMode) ? 'reduced' : 'normal';
  } catch (err) {}
  if (typeof app !== 'undefined') {
    app.uiPrefs = next;
    app.lowEndDeviceDetected = lowEndDetected;
    app.lowEndDeviceInfo = lowEndInfo;
  }
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
    const body = document.body;
    const lite = !!(body && body.classList && (body.classList.contains('lightweightMode') || body.classList.contains('lowEndDevice') || body.classList.contains('ladaMode')));
    if (lite) return 1;
    const info = typeof getLowEndDeviceInfo === 'function' ? getLowEndDeviceInfo() : null;
    if (info && info.lowEnd) return 1;
  } catch (err) {}
  return 2;
}

try { window.getRakPerformanceDprMax = getRakPerformanceDprMax; } catch (err) {}



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
  grid-template-rows:repeat(18, var(--tttCellSize, 24px));
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
  if (overlay) return overlay;

  ensureTicTacToeStyles();
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

const TTT_ROWS = 18;
const TTT_COLS = 10;
const TTT_WIN_LENGTH = 5;
const TTT_TOTAL_CELLS = TTT_ROWS * TTT_COLS;
const TTT_HARD_WIN_EMAIL = 'martinspadrna@gmail.com';
const TTT_HARD_WIN_KEY = 'tttHardWins';

function tttEnsureAiWinsResetV667() {
  try {
    const marker = 'rak_ttt_ai_wins_reset_v667';
    if (localStorage.getItem(marker) === '1') return;
    localStorage.removeItem(TTT_HARD_WIN_KEY);
    localStorage.removeItem('rotace_supabase_gomoku_wins_v1');
    localStorage.setItem(marker, '1');
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
        resultSavedKey: ''
      },
      onlineSyncTimer: null,
      onlineStatus: '',
      onlineKind: 'idle'
    };
  }
  return app.tttState;
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

function tttReadHashInviteCode() {
  try {
    const hash = String(window.location.hash || '').replace(/^#/, '');
    if (!hash) return '';
    const params = new URLSearchParams(hash.replace(/&/g, '&'));
    const invite = params.get('invite') || params.get('code') || '';
    return tttNormalizeInviteCode(invite);
  } catch (err) {
    return '';
  }
}

async function tttOpenFromInviteCode(code) {
  const inviteCode = tttNormalizeInviteCode(code);
  if (!inviteCode) return false;
  try {
    showPage('games');
  } catch (err) {}
  openGameShell('ttt');
  const result = await tttJoinInviteSession(inviteCode);
  if (result && result.ok) {
    const state = tttGetState();
    state.screen = 'game';
    state.gameOver = false;
    state.winner = null;
    state.startedAt = Date.now();
    state.message = 'Pozvánka přijata. Hraješ proti spoluhráči.';
    tttRender();
    scheduleTttLayout();
    tttStartOnlineSyncLoop();
    void tttSyncOnlineSession(true);
    return true;
  }
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

function tttBuildOnlineResultKey(code, revision, winner, role) {
  return [
    String(code || '').trim().toUpperCase(),
    String(role || '').trim().toUpperCase() || 'N',
    String(winner || 'draw').trim().toUpperCase() || 'DRAW',
    String(Number(revision) || 0)
  ].join(':');
}

function tttMarkOnlineResultSeen(code, revision, winner, role) {
  const key = tttBuildOnlineResultKey(code, revision, winner, role);
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
  const fragment = document.createDocumentFragment();
  const label = document.createElement('div');
  label.className = 'tttInviteOverlayLabel';
  label.textContent = 'Kód pro spoluhráče';
  const codeEl = document.createElement('div');
  codeEl.className = 'tttInviteOverlayCode';
  codeEl.textContent = code;
  const hint = document.createElement('div');
  hint.className = 'tttInviteOverlayHint';
  hint.textContent = 'Jakmile soupeř kód přijme, okno zmizí a nahoře zůstane skóre.';
  fragment.appendChild(label);
  fragment.appendChild(codeEl);
  fragment.appendChild(hint);
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
      void gamesRefreshRemoteLeaderboards('ttt', true);
      void tttRefreshOnlineHeadToHead(true).then(() => {
        if (typeof tttRender === 'function') tttRender();
      });
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

  if (Array.isArray(statePatch.board) && statePatch.board.length === TTT_TOTAL_CELLS) {
    state.board = statePatch.board.slice();
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
  if (state.online.playerOAccountNumber && String(state.online.status || '').toLowerCase() === 'waiting') state.online.status = 'active';
  state.online.headToHeadText = tttBuildOnlineScoreText();
  state.online.connected = true;
  state.online.dirty = false;
  state.online.resultSavedKey = state.online.resultSavedKey || '';
  tttSetOnlineStatus(state.message, state.gameOver ? 'finished' : state.online.status);
  return true;
}

function tttMaybeRecordOnlineResult(winner) {
  const state = tttGetState();
  const online = state.online || null;
  if (!online || !online.code) return false;
  if (!['X', 'O', 'draw'].includes(String(winner || '').trim())) return false;
  const key = tttBuildOnlineResultKey(online.code, online.revision || online.pendingRevision || 0, winner, online.role || '');
  if (online.resultSavedKey === key) return false;
  const store = tttReadOnlineResultStore();
  if (store[key]) {
    online.resultSavedKey = key;
    return false;
  }
  store[key] = Date.now();
  tttWriteOnlineResultStore(store);
  online.resultSavedKey = key;

  const active = typeof gamesGetActiveAccount === 'function' ? gamesGetActiveAccount() : null;
  if (active && active.stats && active.stats.ttt && typeof gamesRecordStat === 'function') {
    const stats = active.stats.ttt || {};
    const played = (stats.plays || 0) + 1;
    const isDraw = winner === 'draw';
    const role = String(online.role || '').toUpperCase();
    const won = !isDraw && String(winner || '').toUpperCase() === role;
    gamesRecordStat('ttt', isDraw
      ? {
          plays: played,
          draws: (stats.draws || 0) + 1,
          bestMoves: stats.bestMoves || null,
          bestTimeMs: stats.bestTimeMs || null,
          lastResult: 'Online remíza · ' + String(state.moveCount || 0) + ' tahů'
        }
      : {
          plays: played,
          wins: won ? (stats.wins || 0) + 1 : (stats.wins || 0),
          losses: won ? (stats.losses || 0) : (stats.losses || 0) + 1,
          draws: stats.draws || 0,
          bestMoves: won ? Math.min(stats.bestMoves || 9999, state.moveCount || 0) : stats.bestMoves || null,
          bestTimeMs: won ? Math.min(stats.bestTimeMs || 999999999, Date.now() - (state.startedAt || Date.now())) : stats.bestTimeMs || null,
          lastResult: (won ? 'Online výhra' : 'Online prohra') + ' · ' + String(state.moveCount || 0) + ' tahů'
        });
  }
  void tttRecordOnlineSessionResult(false);
  void gamesRefreshRemoteLeaderboards('ttt', true);
  void tttRefreshOnlineHeadToHead(true);
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
        inviteUrl: ''
      };
      state.online.inviteUrl = tttGetInviteUrl(code);
      tttSetOnlineStatus('Pozvánka vytvořená. Kód pro spoluhráče: ' + code + '.', 'waiting');
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
    inviteUrl: tttGetInviteUrl(code)
  };
  tttSetOnlineStatus('Pozvánka vytvořená lokálně. Kód pro spoluhráče: ' + code + '.', 'waiting');
  return { ok: true, code, url: tttGetInviteUrl(code), local: true };
}

async function tttJoinInviteSession(code) {
  const state = tttGetState();
  const inviteCode = tttNormalizeInviteCode(code);
  if (!inviteCode || inviteCode.length !== 4) return { ok: false, error: new Error('Zadej 4 čísla kódu pozvánky.') };
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
        inviteUrl: ''
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
      state.message = 'Jsi O. Čekáš na tah hráče X.';
      tttSetOnlineStatus(state.message, 'active');
      return { ok: true, code: inviteCode, result };
    }
    if (result && result.ok === false) {
      state.message = 'Pozvánku se nepodařilo načíst online. Zkontroluj 4místný kód.';
      tttSetOnlineStatus(state.message, 'error');
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
    inviteUrl: tttGetInviteUrl(inviteCode)
  };
  tttSetOnlineStatus('Pozvánka přijata lokálně. Kód načten.', 'active');
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
      if (remote && remote.ok && !remote.session && remote.invite && String(remote.invite.status || '').toLowerCase() === 'accepted') {
        state.online.status = 'active';
        if (remote.invite && remote.invite.invitee_account_number) state.online.playerOAccountNumber = remote.invite.invitee_account_number;
        if (remote.invite && remote.invite.inviter_account_number) state.online.playerXAccountNumber = remote.invite.inviter_account_number;
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
          state.online.lastPushedResultKey = tttBuildOnlineResultKey(state.online.code, nextRevision, payload.winner || state.winner || 'draw', state.online.role || '');
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
  const ownWins = tttWinningMoves(board, 'O').length;
  const ownThreats = tttCriticalThreatMoves(board, 'O').length + tttThreatWindowMoves(board, 'O').length;
  const xWins = tttWinningMoves(board, 'X').length;
  const xThreats = tttCriticalThreatMoves(board, 'X').length + tttThreatWindowMoves(board, 'X').length;
  const xDanger = tttBoardDangerScore(board, 'X');
  const ownDanger = tttBoardDangerScore(board, 'O');
  score += ownWins * 520000;
  score += ownThreats * 98000;
  score += ownDanger * 0.22;
  score -= xWins * 1800000;
  score -= xThreats * 180000;
  score -= xDanger * 0.62;
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

function tttBestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) {
    if (!board[i]) free.push(i);
  }
  if (!free.length) return -1;

  const immediateWin = tttWinningMove(board, 'O');
  if (immediateWin >= 0) return immediateWin;

  const immediateBlock = tttWinningMove(board, 'X');
  if (immediateBlock >= 0) return immediateBlock;

  const dangerBlock = tttBestDangerReductionMove(board, 'X');
  if (dangerBlock >= 0) return dangerBlock;

  const occupied = board.length - free.length;
  const center = tttIndex(Math.floor(TTT_ROWS / 2), Math.floor(TTT_COLS / 2));
  if (occupied <= 1 && !board[center]) return center;

  const urgentThreatBlock = tttPickBestBlockMove(board, tttThreatWindowMoves(board, 'X'), 'X');
  if (urgentThreatBlock >= 0) return urgentThreatBlock;

  const emergencyBlock = tttPickBestBlockMove(board, tttEmergencyBlockMoves(board, 'X'), 'X');
  if (emergencyBlock >= 0) return emergencyBlock;

  const forcedBlock = tttPickBestBlockMove(board, tttCriticalThreatMoves(board, 'X'), 'X');
  if (forcedBlock >= 0) return forcedBlock;

  const openThreeBlock = tttPickBestBlockMove(board, tttOpenThreeThreatMoves(board, 'X'), 'X');
  if (openThreeBlock >= 0) return openThreeBlock;

  const opponentFork = tttBestForkMove(board, 'X');
  if (opponentFork >= 0) return opponentFork;

  const antiFork = tttBestAntiForkMove(board);
  if (antiFork >= 0) return antiFork;

  const ownFork = tttBestForkMove(board, 'O');
  if (ownFork >= 0) return ownFork;

  const ownCritical = tttPickBestIndexedMove(board, tttCriticalThreatMoves(board, 'O'), 'O');
  if (ownCritical >= 0) return ownCritical;

  const ownOpenThree = tttPickBestIndexedMove(board, tttOpenThreeThreatMoves(board, 'O'), 'O');
  if (ownOpenThree >= 0) return ownOpenThree;

  const radius = occupied < 12 ? 3 : 2;
  const deadline = (typeof performance !== 'undefined' ? performance.now() : Date.now()) + (difficulty === 'ai' ? 90 : 45);
  let candidates = tttCandidateMoves(board, radius);
  if (!candidates.length) candidates = free.slice();

  candidates = Array.from(new Set(candidates))
    .filter(idx => !board[idx])
    .map(idx => ({
      idx,
      score: tttSimpleMoveScore(board, idx, 'O') + tttFastAiMoveScore(board, idx, 'O', deadline) * 0.8
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, difficulty === 'ai' ? 12 : 8)
    .map(item => item.idx);

  let bestIdx = candidates[0] ?? free[0];
  let bestScore = -Infinity;
  for (const idx of candidates) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now > deadline && bestIdx >= 0) break;
    const score = tttHardMoveSearchScore(board, idx, deadline);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }

  return bestIdx >= 0 ? bestIdx : (free[0] ?? -1);
}

function tttHardWinLog() {
  return [];
}

function tttSaveHardWin(entry) {
  void entry;
}

function tttFormatElapsed(ms) {
  const total = Math.max(0, Number(ms) || 0);
  const seconds = Math.floor(total / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes <= 0) return secs + ' s';
  return minutes + ' min ' + String(secs).padStart(2, '0') + ' s';
}

function tttReadHardWinStats() {
  const state = tttGetState();
  const elapsedMs = state.startedAt ? Math.max(0, Date.now() - state.startedAt) : 0;
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
    note: String(entry && entry.note ? entry.note : '').trim()
  };
}

function tttGetHardWinRows() {
  const state = tttGetState();
  const remote = Array.isArray(state.hardWinRemote) ? state.hardWinRemote : [];

  const normalized = remote
    .map(tttNormalizeHardWinEntry)
    .filter(entry => entry.name);

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
      const rows = await window.RotationSupabaseBridge.loadGomokuWins(25);
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
    const dateText = row.date ? new Date(row.date).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
    return '<tr>' +
      '<td>' + escapeHtml(String(idx + 1)) + '</td>' +
      '<td>' + escapeHtml(row.name || '—') + '</td>' +
      '<td>' + escapeHtml(formatCount(row.totalMoves || 0)) + '</td>' +
      '<td>' + escapeHtml(row.elapsedText || '—') + '</td>' +
      '<td>' + escapeHtml(dateText) + '</td>' +
      '</tr>';
  }).join('');

  return [
    '<div class="tableWrap tttWinHistory">',
    '  <table class="tttWinTable">',
    '    <thead><tr><th>#</th><th>Jméno</th><th>Tahy</th><th>Čas</th><th>Datum</th></tr></thead>',
    '    <tbody>' + rowsHtml + '</tbody>',
    '  </table>',
    '</div>'
  ].join('');
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
    if (state.mode === 'pvp' && state.online && state.online.code) return true;
    return Array.isArray(state.board) && state.board.some(cell => !!cell);
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
      '    <button type="button" class="tttBtn' + (state.mode === 'pvp' ? ' isActive' : '') + '" data-ttt-mode="pvp">Online pozvánka</button>',
      '  </div>',
      '</div>',
      state.mode !== 'pvp' ? '<div class="tttCard tttActionCard"><div class="tttSectionTitle">Hrát</div><div class="tttNote">Vybraný režim spusť jedním tlačítkem. Když je rozehraná hra, můžeš se k ní vrátit přes pokračování.</div><button type="button" class="tttBtn tttPrimaryBtn" id="tttStartBtn">' + (state.mode === 'local' ? 'Hrát na mobilu' : 'Hrát proti AI') + '</button>' + (tttHasResumeGame() ? '<button type="button" class="tttBtn tttSecondaryBtn" id="tttResumeBtn">Pokračovat v rozehrané hře</button>' : '') + '</div>' : '',
      state.mode === 'pvp' ? '<div class="tttCard tttInviteCard"><div class="tttSectionTitle">Online pozvánka</div><div id="tttInviteInfo" class="tttNote">Vytvoř hru a pošli spoluhráči 4místný kód, nebo přijmi jeho pozvánku.</div><div id="tttInviteCode" class="tttInviteCode' + ((state.online && state.online.code) ? '' : ' uHidden') + '">' + escapeHtml((state.online && state.online.code) || '') + '</div><div class="tttNote uWordBreakAll uMt8' + ((state.online && state.online.code) ? '' : ' uHidden') + '" id="tttInviteUrl">Kód: ' + escapeHtml((state.online && state.online.code) || '') + '</div><div class="tttToggleRow tttInviteActions uMt10"><button type="button" class="tttBtn tttPrimaryBtn" id="tttCreateInviteBtn">Vytvořit hru</button><button type="button" class="tttBtn" id="tttJoinInviteBtn">Přijmout pozvánku</button></div></div>' : '',
      '<div class="tttCard tttWinHistory">',
      '  <div class="tttSectionTitle">Kdo porazil AI</div>',
      '  <div class="tttNote">Žebříček online .</div>',
      '  ' + tttBuildHardWinTableHtml(),
      '</div>'
    ].join('');

    start.querySelectorAll('[data-ttt-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.mode = btn.getAttribute('data-ttt-mode') || 'ai';
        state.difficulty = 'ai';
        tttRender();
        scheduleTttLayout();
      });
    });
    let lastInviteUrl = '';
    const copyInviteUrl = async (url) => {
      const target = String(url || lastInviteUrl || '').trim();
      if (!target) return;
      lastInviteUrl = target;
      try {
        await navigator.clipboard.writeText(target);
      } catch (err) {
        console.warn('TTT copy invite failed', err);
      }
    };
    const inviteInfo = () => start.querySelector('#tttInviteInfo');
    const inviteCodeEl = () => start.querySelector('#tttInviteCode');
    const inviteUrlEl = () => start.querySelector('#tttInviteUrl');
    const copyBtnEl = () => start.querySelector('#tttCopyInviteBtn');
    const shareBtnEl = () => start.querySelector('#tttShareInviteBtn');
    const ensureInviteUrl = async () => {
      if (!state.online || !state.online.code) {
        const created = await tttCreateInviteSession();
        if (!created || !created.ok) return '';
        state.screen = 'start';
        state.gameOver = false;
        state.winner = null;
        state.board = Array(TTT_TOTAL_CELLS).fill('');
        state.turn = 'X';
        state.message = 'Pozvánka připravená. Pošli kód spoluhráči.';
        tttRender();
        scheduleTttLayout();
      }
      const url = (state.online && state.online.inviteUrl) || (state.online && state.online.code ? tttGetInviteUrl(state.online.code) : '');
      if (state.online) state.online.inviteUrl = url;
      return url;
    };
    start.querySelector('#tttCreateInviteBtn')?.addEventListener('click', async () => {
      try {
        const result = await tttCreateInviteSession();
        const info = inviteInfo();
        const codeEl = inviteCodeEl();
        const urlEl = inviteUrlEl();
        const copyBtn = copyBtnEl();
        const shareBtn = shareBtnEl();
        if (result && result.ok) {
          lastInviteUrl = result.url || '';
          if (info) info.textContent = 'Pozvánka připravená. Kód vidíš i přímo ve hře.';
          if (codeEl) {
            codeEl.style.display = 'block';
            codeEl.textContent = result.code || '';
          }
          if (urlEl) {
            urlEl.style.display = 'block';
            urlEl.textContent = 'Kód: ' + (result.code || '');
          }
          if (copyBtn) copyBtn.disabled = !lastInviteUrl;
          if (shareBtn) shareBtn.disabled = !lastInviteUrl;
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
    start.querySelector('#tttCopyInviteBtn')?.addEventListener('click', async () => {
      try {
        const url = await ensureInviteUrl();
        if (!url) return;
        lastInviteUrl = url;
        await navigator.clipboard.writeText(url);
        const info = inviteInfo();
        if (info) info.textContent = 'Odkaz na pozvánku je zkopírovaný do schránky.';
      } catch (err) {
        console.warn('TTT copy invite failed', err);
      }
    });
    start.querySelector('#tttShareInviteBtn')?.addEventListener('click', async () => {
      try {
        const url = await ensureInviteUrl();
        if (!url) return;
        lastInviteUrl = url;
        const shareData = {
          title: 'Piškvorky',
          text: 'Přidej se ke hře přes tenhle odkaz.',
          url
        };
        if (navigator.share) {
          await navigator.share(shareData);
          const info = inviteInfo();
          if (info) info.textContent = 'Otevřel se systém pro sdílení pozvánky.';
        } else {
          await navigator.clipboard.writeText(url);
          const info = inviteInfo();
          if (info) info.textContent = 'Sdílení není dostupné, odkaz je zkopírovaný do schránky.';
        }
      } catch (err) {
        console.warn('TTT share invite failed', err);
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
        const result = await tttJoinInviteSession(code);
        if (result && result.ok) {
          state.screen = 'game';
          state.gameOver = false;
          state.winner = null;
          state.startedAt = Date.now();
          state.message = 'Pozvánka přijata. Hraješ proti spoluhráči.';
          tttRender();
          scheduleTttLayout();
          tttStartOnlineSyncLoop();
          void tttSyncOnlineSession(true);
        }
      }
    });
    start.querySelector('#tttStartBtn')?.addEventListener('click', async () => {
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
    if (!state.hardWinLoaded && !state.hardWinLoading) {
      void tttRefreshHardWinRows();
    } else {
      tttUpdateDashboardMeta();
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
    if (!state.online || !state.online.code || state.online.status === 'waiting') return;
    const role = String(state.online.role || '').toUpperCase();
    if (role && state.turn !== role) return;
  }

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
          plays: (gamesGetActiveAccount()?.stats.ttt.plays || 0) + 1,
          wins: (gamesGetActiveAccount()?.stats.ttt.wins || 0) + 1,
          bestMoves: Math.min(gamesGetActiveAccount()?.stats.ttt.bestMoves || 9999, state.moveCount || 0),
          bestTimeMs: Math.min(gamesGetActiveAccount()?.stats.ttt.bestTimeMs || 999999999, Date.now() - (state.startedAt || Date.now())),
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
                  plays: (active.stats.ttt.plays || 0) + 1,
                  draws: (active.stats.ttt.draws || 0) + 1,
                  lastResult: 'Remíza · ' + String(fresh.moveCount || 0) + ' tahů'
                }
              : {
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
  state.startedAt = state.mode === 'pvp' ? Date.now() : 0;
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

async function tttAutoOpenFromHash() {
  const code = tttReadHashInviteCode();
  if (!code) return false;
  const opened = await tttOpenFromInviteCode(code);
  if (opened) {
    try {
      const url = new URL(window.location.href);
      url.hash = '';
      history.replaceState(null, '', url.toString());
    } catch (err) {}
  }
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
    '  <div class="appMenuText">Profil ovlivňuje herní statistiky, achievementy a ukládání Theme/Pozadí k účtu. Bez přihlášení zůstane vzhled jen v tomto zařízení.</div>',
    '  <div class="gamesAccountTop">',
    '    <div>',
    '      <div class="dashboardLabel">Aktuální profil</div>',
    '      <div class="gamesAccountName" id="gamesAccountName">Bez přihlášení</div>',
    '    </div>',
    '    <button type="button" class="gamesTinyBtn" id="gamesAccountClearBtn">Bez účtu</button>',
    '  </div>',
    '  <div class="gamesAccountRow" id="gamesAccountEntryRow">',
    '    <input id="gamesAccountInput" class="gamesAccountInput" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="Zadej poslední 4 číslice os.č.">',
    '    <button type="button" class="gamesTinyBtn gamesAccountConfirmBtn" id="gamesAccountConfirmBtn">Ověřit</button>',
    '  </div>',
    '  <div class="gamesAccountCurrent" id="gamesAccountCurrent" hidden></div>',
    '  <div class="gamesAccountHint" id="gamesAccountHint">Bez účtu můžeš hrát dál. Statistiky se ukládají jen po přihlášení číslem.</div>',
    '</div>'
  ].join('');
}

function openProfileSettingsFromGames() {
  showPage('menu');
  openAppMenu('settings');
  if (typeof setBottomNavActive === 'function') setBottomNavActive('menu');
}

function renderGamesProfileStatus() {
  const card = document.getElementById('gamesProfileStatusCard');
  const nameEl = document.getElementById('gamesProfileStatusName');
  const metaEl = document.getElementById('gamesProfileStatusMeta');
  const btn = document.getElementById('gamesProfileSettingsBtn');
  if (!card || !nameEl || !metaEl) return;
  const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
  const active = profile && profile.activeAccountId && profile.accounts ? profile.accounts[profile.activeAccountId] : null;
  card.classList.toggle('isLoggedIn', !!active);
  const nextName = active ? String(active.name || active.id || 'Přihlášeno') : 'Bez přihlášení';
  const nextMeta = active
    ? 'Profil a vzhled spravuješ ve Více → Nastavení.'
    : 'Přihlášení je nově ve Více → Nastavení.';
  if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(nameEl, nextName, 'gamesProfileStatusName');
  else nameEl.textContent = nextName;
  if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(metaEl, nextMeta, 'gamesProfileStatusMeta');
  else metaEl.textContent = nextMeta;
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      openProfileSettingsFromGames();
    });
  }
}


function buildAppHistoryHtml(versionText) {
  const sections = [
    {
      range: versionText,
      title: 'Aktuální build',
      lines: [
        'Dashboard / Kalendář zkracuje ISO kalendářní týden na formát „21.KT“, aby se vedle vešly další poznámky.',
        'Pondělní ranní poznámka „Brusy- spálení“ a první ranní v měsíci „Roznýtování- laborka“ zůstávají navázané na kalendář/ranní směnu, ne na směnu D.',
        'TBKR07 / AH má nastavený čas výroby 1m03s, orovnává po 88 ks a doba orovnání je nově 6m00s.',
        'Opravené online ukládání machine_settings: doplněný databázový grant pro zápis, takže změna parametrů už nemá padat na permission denied.',
        'Opravené načítání uložených parametrů Brusů: appka už hledá stejný klíč, jaký se ukládá v nastavení strojů, takže změny parametrů se reálně použijí ve výpočtech.',
        'Nastavení strojů má opravený online zápis do machine_settings včetně GRANT práv pro anon/authenticated role, aby ukládání nepadalo na permission denied.',
        'Fáze 8 — PWA / Service Worker hardening zůstává dokončená na 100 % včetně finální offline readiness kontroly app shellu.',
        'Soustruhy mají u Volné 126 a Volné 106 kalírenské čtveřice schované dole v rozbalovacím bloku, kde je společně zadání první kalírenské dávky i výsledek.',
        'Volba Kombinace u Soustruhů má teď společný plán pro Lis + Volné: 1. část se zadá jako známý rozsah, u 2. části se zadá jen první dávka a appka dopočítá konec ze zbytku plánu.',
        'Nastavení Volné je v Kombinaci otevřené hned nahoře u volby pořadí, aby bylo po ruce při jízdě Volného.',
        'Dashboard při aktivní směně D ve zvýrazněném horním poli neopakuje text „Směna D je právě v práci“ a ukazuje jen, kdo chybí.',
        'Service worker má chytřejší fallback pro same-origin požadavky, hlídá a opravuje chybějící položky app shellu, při aktivaci uklízí jen staré RaK cache, do cache ukládá jen bezpečně cacheovatelné odpovědi a runtime cache ořezává na povolený limit.',
        'Láďův režim nově sjednocuje ruční i automatický low-end profil přes třídu ladaMode a vypíná další těžké blur/stínové efekty na slabších zařízeních.',
        'Build v.1.1 (649) přidal audit Láďova režimu: hlídá DPR limit canvasu, reduceMotion, zbytky blur efektů, animace a diagnostiku výkonového profilu.',
        'Build v.1.1 (650) přidal Supabase performance guard: hlídá slučování realtime refreshů, odklad při skryté stránce, sdílená čtení a poměr cache hit/write.',
        'Build v.1.1 (651) přidal Supabase read/write optimizer: slučuje stejná paralelní čtení a chrání proti duplicitním krátkým zápisům.',
        'Build v.1.1 (652) přidal Supabase strukturální audit: hlídá očekávané tabulky, realtime napojení, queue typy a RLS/GRANT/policies checklist.',
        'Build v.1.1 (653) přidal společný herní engine základ: lifecycle audit, start/stop/pause/resume signály a diagnostiku před postupným laděním her.',
        'Build v.1.1 (654) předělal Piškvorky na čtverečkovaný papír bez mezer, kulatých buněk a glass dlaždic.',
        'Build v.1.1 (656) upravuje Piškvorky do RaK stylu: čistá mřížka z čar bez dlaždic, tvrdší AI a testovací průchod AI logiky.',
        'Build v.1.1 (657) posouvá klikání v Piškvorkách doprostřed čtverců a zvětšuje X/O pro pohodlnější hraní na mobilu.',
        'Build v.1.1 (658) překresluje Piškvorky na souvislou mřížku bez mezer mezi buňkami, přitvrzuje AI a přidává výsledkovou hlášku se shrnutím a zápisem výsledku.',
        'Build v.1.1 (659) opravuje Piškvorky na skutečnou souvislou mřížku: klikací políčka jsou průhledná nad čárami, bez tmavých dlaždic a bez mezer; zároveň maže AI popis a zkracuje text žebříčku.'
      ]
    },
    {
      range: 'v.1.1 500–626',
      title: 'Stabilizace, hry, Supabase a glass vzhled',
      lines: [
        'Proběhlo velké stabilizační období: Láďův režim, cleanup manager, dokončení game performance, dokončený Supabase hardening a začátek Fáze 7 Data optimization včetně dalšího odlehčení Láďova režimu, úspornější Supabase lokální cache a méně zbytečných DOM renderů včetně Otevírací doby/Jídelního lístku, úspornějších selectů pro roky/měsíce, class toggle guardů u kalkulaček, style guardů u Theme/Pozadí/spodní lišty a závěrečného úklidu lokální read/JSON cache. Po dokončení Fáze 7 začala Fáze 8: tvrdší PWA/service worker chování, bezpečnější precache, řízenější update checky a diagnostika cache stavu.',
        'Dashboard, Rotace, Rozpisy a Statistiky se ladily hlavně kvůli mobilům, safe-area, přehlednosti a menšímu riziku prázdných/pozdě načtených karet.',
        'Kalkulačky dostaly sjednocenější calcPanel systém, větší klikací tlačítka, barevné indexy u Brusů ve glass stylu a opravu dvojího započítání rozdělaného vozíku.',
        'Herní hub se zrychlil: méně opakovaných renderů, cache profilů/statistik, lepší práce s leaderboardy a všechny nedoladěné hry jsou zatím ve „Ve vývoji“.',
        'Supabase Realtime a offline/online sync se zpevnily přes timeouty, retry, offline frontu, deduplikaci, fallback cache, retry backoff, session cache online her, profilové nastavení vzhledu, diagnostiku zdraví fronty a self-heal Realtime reconnect.',
        'Přibyly Theme/Pozadí volby, výrazná glass-friendly pozadí, modernější theme karty a profilové ukládání vzhledu.'
      ]
    },
    {
      range: 'v.1 450–499',
      title: 'Příprava velkého refactoru',
      lines: [
        'Upevnil se postup práce: vždy pokračovat z posledního potvrzeného buildu a safepoint použít jen na výslovný pokyn.',
        'Začal se víc řešit technický dluh, duplicity, přebíjení stylů a potřeba bezpečnějších guardů místo náhodného ladění jednotlivých prvků.',
        'Mobilní použitelnost šla nahoru hlavně přes safe-area, spodní lištu, výšky panelů, mezery a čitelnost na iPhonu i Androidu.',
        'Vzhled se začal posouvat k iOS/glassmorphism směru, ale opatrně, aby se nerozbily funkce.'
      ]
    },
    {
      range: 'v.1 400–449',
      title: 'Herní rozšíření a online data',
      lines: [
        'Rozšířily se hráčské profily, herní statistiky, leaderboardy a vazba na Supabase.',
        'Začal větší herní plán: Snake, Piškvorky, 2048, Flappy Car a příprava dalších her do jednotného hubu.',
        'Appka se víc posouvala k mobile-first rozložení a menšímu počtu rušivých reloadů.',
        'Supabase začala být důležitý základ pro online data, ale bylo potřeba dál řešit fallbacky a stabilitu při slabém internetu.'
      ]
    },
    {
      range: 'v.1 350–399',
      title: 'Hry, spodní lišta a tile rozložení',
      lines: [
        'Výrazně se ladily hry, spodní lišta, Rotace a Statistiky.',
        'Přibylo víc herních modulů a společný herní hub včetně leaderboardů a online invite flow.',
        'Piškvorky dostaly tvrdší AI, online režim a lepší návrat do rozehrané hry.',
        'Rotace a Statistiky dostaly více dlaždic, menší rozestupy a lepší zobrazení jmen/strojů.'
      ]
    },
    {
      range: 'v.1 300–349',
      title: 'PWA, cache a první větší online vrstva',
      lines: [
        'Vznikal stabilnější PWA základ: service worker, manifest, offline fallback, cache a aktualizační hooky.',
        'Rozdělovaly se části inline skriptů do samostatnějších modulů.',
        'Stabilizovala se herní sekce, invite flow a první větší online/offline sync vrstvy.',
        'Dashboard, spodní lišta a přihlášení se ladily kvůli menšímu chaosu při načítání a přepínání stránek.'
      ]
    },
    {
      range: 'v.1 250–299',
      title: 'Dashboard, kantýna/jídelna a kalkulačky',
      lines: [
        'Dashboard se rozšířil o směny, absenci, procenta průběhu, výplatu, kantýnu/jídelnu a stavové karty.',
        'Jídelna a kantýna se sjednocovaly do přehlednějšího zobrazení s lepším výpočtem otevřeno/zavřeno a dalšího termínu.',
        'Kalkulačky pro Frézky a Brusy se zpřesňovaly v časech, dávkách a hotových kusech.',
        'Mobilní layout se čistil, aby šel používat bez zoomu a bez posouvání mimo obrazovku.'
      ]
    },
    {
      range: 'v.1 200–249',
      title: 'Z prototypu do vícestránkové appky',
      lines: [
        'Aplikace se posouvala do stabilnější vícestránkové appky s Dashboardem, Rotací, Rozpisy, Statistikami a Kalkulačkami.',
        'Začalo se víc řešit ukládání dat, export, verze buildu a kontrola, aby změny nezmizely mezi ZIPy.',
        'Rozpisy a rotace se ladily podle reálného použití v práci, včetně směn, strojů, absencí a přehledů pro lidi.',
        'Přibývaly první větší úpravy vzhledu a použitelnosti na mobilu.'
      ]
    },
    {
      range: 'v.0.xx až v.1 199',
      title: 'Základ Rotace a kalkulačky',
      lines: [
        'Vznikl základ aplikace: směnová logika, dashboard, první kalkulačky a pracovní přehledy.',
        'Přidávaly se stroje, jména, směny, první statistiky a základní exportní/logická vrstva.',
        'Priorita byla funkčnost výpočtů a ruční ladění podle testování, ne ještě finální vzhled ani čistá architektura.',
        'Postupně se ukázala potřeba silnějších pravidel pro verze, safepointy, navazování na poslední ZIP a pozdější refactor.'
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
  const isDateField = String(fieldName || '') === 'date';
  const inputAttrs = [
    'class="appMenuInlineInput' + (tiny ? ' appMenuInlineInputTiny' : '') + '"',
    fieldAttr ? fieldAttr + '="' + escapeHtml(fieldName) + '"' : '',
    'value="' + escapeHtml(safeValue) + '"',
    'placeholder="' + escapeHtml(placeholder || '') + '"',
    'title="' + escapeHtml(isDateField ? 'Datum upravíš ručně.' : 'Klikni pro odebrání nebo uprav text.') + '"'
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
    '  <td>' + renderAdminInlineFieldHtml('data-rot-field', 'date', date, 'datum', false) + '</td>',
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
      const cells = Array.isArray(row && row.cells ? row.cells : []) ? row.cells : [];
      cells.forEach((cell) => {
        const name = String(cell || '').trim();
        if (name && !['dát pryč','odebrat','remove','pryc','pryč'].includes(name.toLowerCase())) addName(label, name);
      });
    });

    softRows.forEach((row) => {
      const label = adminRotationDateLabel(row && row.date ? row.date : '');
      if (!label) return;
      register(label);
      const cells = Array.isArray(row && row.cells ? row.cells : []) ? row.cells : [];
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
  if (!root || root.dataset.adminView !== 'rotation') return;
  root.querySelectorAll('datalist[data-admin-rotation-suggest]').forEach((el) => el.remove());

  const knownNames = adminGetKnownNames();
  const usedByDate = adminBuildUsedNamesByDate(root);

  const buildList = (id, dateKey, currentValue) => {
    const used = usedByDate.get(dateKey) || new Set();
    const current = String(currentValue || '').trim();
    const options = [];
    const addOption = (value) => {
      const v = String(value || '').trim();
      if (!v) return;
      if (!options.includes(v)) options.push(v);
    };

    addOption('odebrat');
    knownNames.forEach((name) => {
      if (!used.has(name) || name === current) addOption(name);
    });
    if (current && !options.includes(current)) addOption(current);

    const list = document.createElement('datalist');
    list.id = id;
    list.dataset.adminRotationSuggest = '1';
    const buildOptions = () => options.map((value) => {
      const opt = document.createElement('option');
      opt.value = String(value || '');
      return opt;
    });
    if (typeof setElementChildrenIfChanged === 'function') {
      setElementChildrenIfChanged(list, JSON.stringify(options), buildOptions, 'adminRotationSuggest');
    } else {
      list.replaceChildren(...buildOptions());
    }
    root.appendChild(list);
  };

  root.querySelectorAll('tr[data-rotation-section]').forEach((tr, rowIndex) => {
    const dateInput = tr.querySelector('[data-rot-field="date"], [data-note-field="date"]');
    const dateKey = adminRotationDateLabel(dateInput ? dateInput.value : '');
    tr.querySelectorAll('[data-rot-field^="cell-"]').forEach((input, cellIndex) => {
      const current = String(input.value || '').trim();
      const listId = 'admin-rot-suggest-' + String(rowIndex) + '-' + String(cellIndex);
      input.setAttribute('list', listId);
      buildList(listId, dateKey, current);
    });
  });

  root.querySelectorAll('tr[data-note-row-index]').forEach((tr, rowIndex) => {
    const dateInput = tr.querySelector('[data-note-field="date"]');
    const dateKey = adminRotationDateLabel(dateInput ? dateInput.value : '');
    const personInput = tr.querySelector('[data-note-field="person"]');
    if (!personInput) return;
    const current = String(personInput.value || '').trim();
    const listId = 'admin-note-suggest-' + String(rowIndex);
    personInput.setAttribute('list', listId);
    buildList(listId, dateKey, current);
  });
  adminRenderRotationAvailabilitySummary(root);
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
    '<col class="colW40">' +
    '<col class="colW118">' +
    '<col class="colW40">' +
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

function buildAdminMachineSettingsTableHtml() {
  const rows = Array.isArray(app.machineSettingsRows) ? app.machineSettingsRows : [];
  const machineRows = rows.filter(row => String(row && row.category ? row.category : '').trim() !== 'brus');
  const brusRows = rows.filter(row => String(row && row.category ? row.category : '').trim() === 'brus');

  const machineDefaults = machineRows.length ? machineRows : [
    { machine_key: 'FREZKY', machine_code: 'FREZKY', machine_index: '', label: 'Frezky', category: 'frezka', cycle_time: '', settings_json: { machine: 'FREZKY', index: '', cycle_time: '' } },
    { machine_key: 'TPKW01', machine_code: 'TPKW01', machine_index: '', label: 'Pračka', category: 'pracka', cycle_time: '', settings_json: { machine: 'TPKW01', index: '', cycle_time: '' } }
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
    '  <div class="appMenuText">Frezky a pračka mají jen čas výroby kola. Brusky mají stroj, index, čas výroby kola, čas orovnání a počet kusů po orovnání.</div>',
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
    '</div>'
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
    '  <div class="appMenuText">Stejný rozpis, jen editovatelný. Vyplňuj rovnou v mřížce, jako bys upravoval samotný rozpis. Prázdné řádky se při uložení ignorují.</div>',
    '  <div class="appMenuFreeNamesBox" id="adminRotationFreeNamesSummary">',
    '    <div class="appMenuFreeNamesTitle">Kontrola měsíce</div>',
    '    <div class="appMenuFreeNamesText">Vyber měsíc a hned uvidíš, kdo v něm není zapsaný ani jednou a na kterých dnech ještě někdo chybí.</div>',
    '  </div>',
    '  <div class="tableWrap appMenuTableWrap">',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense appMenuAdminRotationTable">',
    '      ' + hardColgroup,
    '      <thead><tr><th colspan="' + String(1 + hardMachines.length) + '">Tvrdota</th></tr><tr><th>Datum</th>' + hardMachines.map(m => '<th>' + escapeHtml(m) + '</th>').join('') + '</tr></thead>',
    '      <tbody>' + renderRows('hard', hardRows, hardMachines.length) + '</tbody>',
    '    </table>',
    '  </div>',
    '  <div class="tableWrap appMenuTableWrap">',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense appMenuAdminRotationTable">',
    '      ' + softColgroup,
    '      <thead><tr><th colspan="' + String(1 + softMachines.length) + '">Měkota</th></tr><tr><th>Datum</th>' + softMachines.map(m => '<th>' + escapeHtml(m) + '</th>').join('') + '</tr></thead>',
    '      <tbody>' + renderRows('soft', softRows, softMachines.length) + '</tbody>',
    '    </table>',
    '  </div>',
    '  <div class="tableWrap appMenuTableWrap">',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense appMenuAdminAbsenceTable">',
    '      ' + absenceColgroup,
    '      <thead><tr><th>Datum</th><th>Jméno</th><th>Kód</th></tr></thead>',
    '      <tbody>' + renderNotes() + '</tbody>',
    '    </table>',
    '  </div>',
    buildAdminAbsenceSummaryHtml(notesRows),
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



function renderAdminMenuBody(body, section) {
  const mode = String(section || 'home').trim() || 'home';
  const months = getAdminRotationMonthKeys();
  const monthKey = getAdminSelectedMonthKey();
  body.dataset.adminView = mode;
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
    '    <button type="button" class="appMenuAction" data-admin-action="open-export">Export / import</button>',
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

  const exportHtml = [
    '<div class="appMenuCard appMenuAdminCard">',
    '  <div class="appMenuCardTitle">Export / import</div>',
    '  <div class="appMenuText">',
    '    <div>Tahle část je schovaná jen tady, aby běžné menu zůstalo čisté.</div>',
    '  </div>',
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="import">Import Excelu</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="export">Export ZIP</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="back-admin">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');

  if (mode === 'machines') {
    body.innerHTML = machinesHtml;
  } else if (mode === 'rotation') {
    body.innerHTML = rotationHtml;
  } else if (mode === 'export') {
    body.innerHTML = exportHtml;
  } else {
    body.innerHTML = homeHtml;
  }

  if (mode === 'rotation') {
    adminRefreshRotationSuggestions(body);
    adminRenderRotationAvailabilitySummary(body);
  }
}


function bindAppMenuHandlers(body) {
  if (!body || body.dataset.menuHandlersBound === '1') return;
  body.dataset.menuHandlersBound = '1';

  body.addEventListener('click', async (event) => {
    const target = event.target && typeof event.target.closest === 'function'
      ? event.target.closest('[data-menu-action], [data-admin-action], [data-admin-month-key], [data-admin-year-key], [data-admin-clear-field], [data-ui-pref], [data-ui-reset], [data-menu-back], [data-rot-field], [data-note-field]')
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
      if (menuBack) {
        openAppMenu('menu');
        return;
      }

      if (target.matches && target.matches('[data-rot-field], [data-note-field]')) {
        const fieldName = target.getAttribute('data-rot-field') || target.getAttribute('data-note-field') || '';
        const value = String(target.value || '').trim();
        if (fieldName !== 'date' && value) {
          const ok = confirm('Odebrat "' + value + '" z rozpisu?');
          if (ok) {
            target.value = '';
            target.dispatchEvent(new Event('input', { bubbles: true }));
            return;
          }
        }
      }

      if (menuAction === 'import') {
        startMenuImport();
        return;
      }
      if (menuAction === 'export') {
        document.getElementById('exportBtn')?.click();
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
        const supabaseSyncGuard = supabaseHardening && supabaseHardening.syncGuard ? supabaseHardening.syncGuard : null;
        const supabaseCacheGuard = supabaseHardening && supabaseHardening.cacheGuard ? supabaseHardening.cacheGuard : null;
        const supabasePerformanceHealth = typeof window.getSupabasePerformanceHealth === 'function' ? window.getSupabasePerformanceHealth() : (supabaseHardening && supabaseHardening.performanceHealth ? supabaseHardening.performanceHealth : null);
        const supabaseStructureHealth = typeof window.getSupabaseStructureHealth === 'function' ? window.getSupabaseStructureHealth() : (supabaseHardening && supabaseHardening.structureHealth ? supabaseHardening.structureHealth : null);
        const profileUiStatus = typeof window.getProfileUiSyncStatus === 'function' ? window.getProfileUiSyncStatus() : null;
        const profileUiGuard = profileUiStatus && profileUiStatus.guard ? profileUiStatus.guard : null;
        const dataOptStatus = typeof window.getDataOptimizationStatus === 'function' ? window.getDataOptimizationStatus() : null;
        const pwaStatus = typeof window.getPwaHardeningStatus === 'function' ? window.getPwaHardeningStatus() : null;
        const securityRenderStatus = typeof window.getSecurityRenderStatus === 'function' ? window.getSecurityRenderStatus() : null;
        const finalStabilizationStatus = typeof window.getFinalStabilizationStatus === 'function' ? window.getFinalStabilizationStatus() : null;
        const ladaPerformanceStatus = typeof window.getLadaPerformanceHealth === 'function' ? window.getLadaPerformanceHealth() : null;
        const gameEngineStatus = typeof window.getGameEngineBaselineHealth === 'function' ? window.getGameEngineBaselineHealth() : null;
        const securityRenderDiag = securityRenderStatus ? [
          'Security/render: fáze ' + String(securityRenderStatus.phasePercent || 0) + '% · escapované dynamické HTML ' + String(securityRenderStatus.escapedDynamicHtmlWrites || 0) + ' · text render ' + String(securityRenderStatus.guardedTextWrites || 0) + '/' + String(securityRenderStatus.guardedTextSkippedWrites || 0),
          'Security/render HTML: zápisy/skip/riziko ' + String(securityRenderStatus.guardedHtmlWrites || 0) + '/' + String(securityRenderStatus.guardedHtmlSkippedWrites || 0) + '/' + String(securityRenderStatus.riskyHtmlWrites || 0) + ' · poslední ' + String(securityRenderStatus.lastHtmlKey || '—') + ' / ' + String(securityRenderStatus.lastHtmlRisk || '—'),
          'Security/render URL: kontroly/blokace ' + String(securityRenderStatus.safeExternalUrlChecks || 0) + '/' + String(securityRenderStatus.safeExternalUrlBlocked || 0) + ' · allowlist ' + String(securityRenderStatus.safeExternalUrlAllowlistChecks || 0) + '/' + String(securityRenderStatus.safeExternalUrlAllowlistBlocked || 0) + ' · href ' + String(securityRenderStatus.safeExternalHrefWrites || 0) + '/' + String(securityRenderStatus.safeExternalHrefSkippedWrites || 0) + ' · poslední ' + String(securityRenderStatus.lastAllowedExternalUrlKey || securityRenderStatus.lastExternalUrlKey || '—'),
          'Security/render akce: kontroly/blokace ' + String(securityRenderStatus.delegatedActionChecks || 0) + '/' + String(securityRenderStatus.delegatedActionBlocked || 0) + ' · režim ' + String(securityRenderStatus.delegatedActionGuardMode || '—'),
          'Security/render poslední: HTML escape ' + String(securityRenderStatus.lastEscapedKey || '—') + ' · text ' + String(securityRenderStatus.lastTextKey || '—') + ' · safe DOM build/skip ' + String(securityRenderStatus.safeDomBuilds || 0) + '/' + String(securityRenderStatus.safeDomSkippedBuilds || 0) + ' / ' + String(securityRenderStatus.lastSafeDomKey || '—') + ' · replace/clear/fallback ' + String(securityRenderStatus.safeDomReplacements || 0) + '/' + String(securityRenderStatus.safeDomClears || 0) + '/' + String(securityRenderStatus.safeDomFallbackReplacements || 0)
        ] : [];
        const ladaPerformanceDiag = ladaPerformanceStatus ? [
          'Láďův režim výkon: ' + (ladaPerformanceStatus.ok ? 'OK' : 'kontrola') + ' · režim ' + String(ladaPerformanceStatus.mode || '—') + ' · aktivní ' + (ladaPerformanceStatus.active ? 'ano' : 'ne'),
          'Láďův režim efekty: DPR limit ' + String(ladaPerformanceStatus.dprLimit || '—') + ' · max blur ' + String(ladaPerformanceStatus.maxBlurPx || 0) + 'px · animované vzorky ' + String(ladaPerformanceStatus.animatedSampleCount || 0) + ' · problémy ' + String((ladaPerformanceStatus.issues || []).length || 0)
        ] : [];
        const gameEngineDiag = gameEngineStatus ? [
          'Herní engine: ' + (gameEngineStatus.ok ? 'OK' : 'kontrola') + ' · režim ' + String(gameEngineStatus.mode || '—') + ' · aktivní hra ' + String(gameEngineStatus.activeGame || '—') + ' · pauza ' + (gameEngineStatus.paused ? 'ano' : 'ne'),
          'Herní engine lifecycle: otevřeno/zavřeno ' + String(gameEngineStatus.openedCount || 0) + '/' + String(gameEngineStatus.closedCount || 0) + ' · pauza/resume ' + String(gameEngineStatus.pausedCount || 0) + '/' + String(gameEngineStatus.resumedCount || 0) + ' · stop loop ' + String(gameEngineStatus.loopStopRequests || 0) + ' · problémy ' + String((gameEngineStatus.issues || []).length || 0)
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
        const pwaDiag = pwaStatus ? [
          'PWA/SW: fáze ' + String(pwaStatus.phasePercent || 0) + '% · controller ' + (pwaStatus.hasController ? 'ano' : 'ne') + ' · update toast ' + (pwaStatus.updateToastVisible ? 'viditelný' : 'ne') + ' · verze cache ' + (pwaStatus.swVersionMismatch ? 'nesedí' : 'sedí'),
          'PWA update check: běhy/skip/join ' + String(pwaStatus.updateChecks || 0) + '/' + String(pwaStatus.updateCheckSkips || 0) + '/' + String(pwaStatus.updateCheckJoins || 0) + ' · update volání ' + String(pwaStatus.registrationUpdates || 0) + ' · chyby ' + String(pwaStatus.registrationUpdateErrors || 0),
          'PWA zprávy SW: celkem/verze/aktivace/cache ' + String(pwaStatus.swMessages || 0) + '/' + String(pwaStatus.swVersionMessages || 0) + '/' + String(pwaStatus.swActivatedMessages || 0) + '/' + String(pwaStatus.swCacheStatusMessages || 0) + ' · poslední ' + String(pwaStatus.lastMessageType || '—'),
          'PWA cache: verze ' + String(pwaStatus.swCacheVersion || '—') + ' / oček. ' + String(pwaStatus.swExpectedCacheVersion || '—') + ' · mismatch ' + String(pwaStatus.swVersionMismatchCount || 0) + ' · update/skip ' + String(pwaStatus.swVersionMismatchUpdateChecks || 0) + '/' + String(pwaStatus.swVersionMismatchUpdateSkips || 0) + ' · static/runtime ' + String(pwaStatus.swStaticCacheEntries || 0) + '/' + String(pwaStatus.swRuntimeCacheEntries || 0) + ' · runtime trim ' + String(pwaStatus.swRuntimeTrimDeletedCount || 0) + '/' + String(pwaStatus.swRuntimeTrimBeforeCount || 0) + ' · staré RaK cache/smazáno ' + String(pwaStatus.swStaleRakCacheCount || 0) + '/' + String(pwaStatus.swStaleRakCacheDeletedCount || 0) + ' · precache OK/chyby/chybí ' + String(pwaStatus.swPrecacheSuccessCount || 0) + '/' + String(pwaStatus.swPrecacheFailedCount || 0) + '/' + String(pwaStatus.swPrecacheMissingCount || 0) + ' · požadavky/skip ' + String(pwaStatus.swCacheStatusRequests || 0) + '/' + String(pwaStatus.swCacheStatusRequestSkips || 0) + ' · klienti ' + String(pwaStatus.swClientsCount || 0) + ' · preload ' + (pwaStatus.swNavigationPreloadEnabled ? 'ano' : 'ne'),
          'PWA cache režim: lookup ' + String(pwaStatus.swCacheLookupMode || '—') + ' · ukládání ' + String(pwaStatus.swCacheableResponseMode || '—') + ' · trim ' + String(pwaStatus.swActivateRuntimeTrimMode || '—') + ' · síť fallback ' + String(pwaStatus.swNetworkTimeoutFallbackMode || '—') + ' (' + String(pwaStatus.swNetworkFallbackTimeoutMs || 0) + ' ms)' + ' · static timeout ' + String(pwaStatus.swStaticCacheFirstTimeoutMode || '—'),
          'PWA dokončení: ' + String(pwaStatus.swPhase8CompletionMode || '—') + ' · připraveno ' + (pwaStatus.swPhase8Ready ? 'ano' : 'ne') + ' · app shell ' + String(pwaStatus.swAppShellCachedRatio || 0) + '%'
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
          supabasePerformanceHealth ? ('Supabase výkon: ' + (supabasePerformanceHealth.ok ? 'OK' : 'kontrola') + ' · refresh sloučeno/běh ' + String(supabasePerformanceHealth.realtimeRefreshCoalesced || 0) + '/' + String(supabasePerformanceHealth.realtimeRefreshRuns || 0) + ' · hidden odklad ' + String(supabasePerformanceHealth.realtimeRefreshHiddenDefers || 0) + ' · tabulek ' + String(supabasePerformanceHealth.realtimeTableCount || 0)) : '',
          supabasePerformanceHealth ? ('Supabase cache/realtime: cache hit/write ' + String(supabasePerformanceHealth.cacheHits || 0) + '/' + String(supabasePerformanceHealth.cacheWrites || 0) + ' · sdílené čtení start/join/peak ' + String(supabasePerformanceHealth.sharedReadStarts || 0) + '/' + String(supabasePerformanceHealth.sharedReadJoins || 0) + '/' + String(supabasePerformanceHealth.sharedReadPeak || 0) + ' · problémy ' + String((supabasePerformanceHealth.issues || []).length || 0)) : '',
          supabasePerformanceHealth ? ('Supabase zápisy: check/start/join/skip ' + String(supabasePerformanceHealth.writeOptimizationChecks || 0) + '/' + String(supabasePerformanceHealth.writeOptimizationStarts || 0) + '/' + String(supabasePerformanceHealth.writeOptimizationJoins || 0) + '/' + String(supabasePerformanceHealth.writeOptimizationSkips || 0) + ' · aktivní/peak ' + String(supabasePerformanceHealth.writeOptimizationActive || 0) + '/' + String(supabasePerformanceHealth.writeOptimizationPeak || 0)) : '',
          supabaseStructureHealth ? ('Supabase struktura/RLS: ' + (supabaseStructureHealth.ok ? 'OK' : 'kontrola') + ' · tabulky ' + String(supabaseStructureHealth.expectedTableCount || 0) + ' · realtime chybí ' + String(supabaseStructureHealth.missingRealtimeTableCount || 0) + ' · queue chybí ' + String(supabaseStructureHealth.missingQueueTypeCount || 0) + ' · helpery chybí ' + String(supabaseStructureHealth.missingHelperCount || 0)) : '',
          supabaseStructureHealth ? ('Supabase GRANT/policies checklist: signály ' + String(supabaseStructureHealth.grantSignalCount || 0) + ' · policies ' + String(supabaseStructureHealth.rlsPolicyChecklistCount || 0) + ' · problémy ' + String((supabaseStructureHealth.issues || []).length || 0)) : '',
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
          ...gameEngineDiag,
          ...pwaDiag,
          ...dataOptDiag,
          ...supabaseDiag
        ].join('\n');
        alert(diag);
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
      if (adminAction === 'open-export') {
        openAppMenu('admin-export');
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

  body.addEventListener('input', (event) => {
    const target = event.target;
    if (!target || typeof target.matches !== 'function') return;
    if (!target.matches('[data-rot-field], [data-note-field]')) return;
    const value = String(target.value || '').trim().toLowerCase();
    if (value === 'dát pryč' || value === 'dat pryc' || value === 'pryč' || value === 'pryc' || value === 'odebrat' || value === 'remove') {
      target.value = '';
    }
    if (body.dataset.adminView === 'rotation') {
      adminRefreshRotationSuggestions(body);
      adminRenderRotationAvailabilitySummary(body);
    }
  });

  body.addEventListener('focusin', (event) => {
    const target = event.target;
    if (!target || typeof target.matches !== 'function') return;
    if (!target.matches('[data-rot-field], [data-note-field]')) return;
    if (body.dataset.adminView === 'rotation') {
      adminRefreshRotationSuggestions(body);
      adminRenderRotationAvailabilitySummary(body);
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
        '  <div class="appMenuText">',
        '    <div>Aktuální build je nahoře, pod ním je přehled největších změn po větších blocích cca 50 verzí.</div>',
        '    <div>Detailní changelog zůstává v souboru CHANGELOG.md, tady je rychlejší přehled přímo v aplikaci.</div>',
        '    <div>Theme mění barvy/akcenty aplikace, Pozadí mění hlavně atmosféru za glass vrstvami.</div>',
        '  </div>',
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
    } else if (v === 'settings') {
      bindAppMenuHandlers(body);
      const prefs = loadUiPrefs();
      const profileCard = buildGamesProfileSettingsHtml();
      const themeCards = buildThemeSystemSettingsHtml();
      body.innerHTML = [
        profileCard,
        '<div class="appMenuCard appMenuSettingsCard">',
        '  <div class="appMenuCardTitle">Nastavení aplikace</div>',
        '  <div class="appMenuText">',
        '    <div>Kompaktní režim a Láďův režim se ukládají jen do tohoto zařízení a promítnou se napříč celou appkou.</div>',
        '    <div>Láďův režim v sobě zahrnuje méně animací, vypnutý těžký blur, slabší stíny, jednodušší pozadí a nižší canvas rozlišení u her pro starší/slabší mobily. Když appka pozná slabší zařízení, zapne si odlehčený profil sama.</div>',
        '  </div>',
        '  <div class="appMenuSettingsList">',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-ui-pref="compact">' + (prefs.compact ? '✓ ' : '') + 'Kompaktní režim</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-ui-pref="lightweight">' + (prefs.lightweight ? '✓ ' : '') + LIGHTWEIGHT_MODE_LABEL + ' · méně animací a efektů</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-menu-action="clear-cache">Vyčistit cache a tvrdě obnovit</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-menu-action="app-diagnostics">Diagnostika aplikace</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-ui-reset="1">Obnovit výchozí nastavení</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn appMenuDangerBtn" data-menu-action="reset-state">Smazat lokální data</button>',
        '  </div>',
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>',
        themeCards
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
    } else if (v === 'admin-export') {
      renderAdminMenuBody(body, 'export');
    } else {
      body.innerHTML = [
        '<div class="appMenuGrid">',
        '  <button type="button" class="appMenuAction" data-menu-action="settings">Nastavení</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="about">O aplikaci</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="contact">Kontakt</button>',
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
    : (id === 'brusy' || id === 'soustruhy' || id === 'frezky' || id === 'kalkulacky')
      ? 'kalkulacky'
      : (id === 'jidlo' ? 'home' : id);

  if (id === 'eportal') {
    if (openEportal()) return;
    id = 'home';
    navPage = 'home';
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
      if (typeof initRotaceCurrentMonth === 'function') initRotaceCurrentMonth();
      setRotaceView('names');
      if (typeof renderRotace === 'function') renderRotace();
    } else if (id === 'brusy') {
      if (typeof renderBrusy === 'function') renderBrusy();
    } else if (id === 'soustruhy') {
      if (typeof renderSoustruhy === 'function') renderSoustruhy();
    } else if (id === 'frezky') {
      // page exists only as part of kalkulačky hub
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
  setBottomNavActive('rozpisy');
}

function openRotaceStats() {
  showPage('rotace');
  setRotaceView('stats');
  setBottomNavActive('statistiky');
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

  if (view === 'names') {
    namesPanel && namesPanel.classList.add('active');
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
const GAMES_PROFILE_RESET_VERSION = 406;
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
      const next = shouldResetStats
        ? gamesMakeAccountEntry(accountId, incoming.name || accountId)
        : gamesNormalizeStoredAccount({ id: accountId, name: incoming.name || accountId, stats: incoming.stats, achievements: incoming.achievements, updatedAt: incoming.updatedAt }, incoming.name || accountId);
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
  const ts = Date.parse(String(value || ''));
  return Number.isFinite(ts) ? ts : 0;
}

async function gamesSyncProfileFromRemote(force = false) {
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.loadGameAccounts !== 'function') return null;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;

  try {
    const profile = gamesGetProfile();
    const remoteAccounts = await bridge.loadGameAccounts().catch(() => []);
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
  const nameEl = document.getElementById('gamesAccountName');
  const hintEl = document.getElementById('gamesAccountHint');
  const inputEl = document.getElementById('gamesAccountInput');
  const entryRow = document.getElementById('gamesAccountEntryRow');
  const currentEl = document.getElementById('gamesAccountCurrent');
  const clearBtn = document.getElementById('gamesAccountClearBtn');
  if (!nameEl || !hintEl || !inputEl || !entryRow || !currentEl || !clearBtn) return;

  const next = account || null;
  if (cardEl) {
    cardEl.classList.toggle('isLoggedIn', !!next);
    cardEl.style.display = '';
  }
  if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(nameEl, next ? next.name : 'Bez přihlášení', 'gamesAccountName');
  else nameEl.textContent = next ? next.name : 'Bez přihlášení';
  const nextAccountHint = next
    ? 'Přihlášeno. Můžeš hned zadat jiné číslo a účet přepsat.'
    : 'Bez účtu můžeš hrát dál. Statistiky se ukládají jen po přihlášení číslem.';
  if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(hintEl, nextAccountHint, 'gamesAccountHint');
  else hintEl.textContent = nextAccountHint;
  entryRow.style.display = '';
  hintEl.style.display = '';
  hintEl.hidden = false;
  currentEl.style.display = 'none';
  currentEl.hidden = true;
  if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(currentEl, '', 'gamesAccountCurrent');
  else currentEl.textContent = '';
  if (next) {
    inputEl.value = '';
    inputEl.placeholder = 'Zadej poslední 4 číslice os.č.';
  } else {
    inputEl.placeholder = 'Zadej poslední 4 číslice os.č.';
  }
  if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(clearBtn, next ? 'Odhlásit' : 'Bez účtu', 'gamesAccountClearBtn');
  else clearBtn.textContent = next ? 'Odhlásit' : 'Bez účtu';
  clearBtn.style.minWidth = next ? '46px' : '';
  clearBtn.style.paddingInline = next ? '8px' : '';
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
  if (!profile.accounts[id]) {
    profile.accounts[id] = gamesMakeAccountEntry(id, id);
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
  const ms = Number(value);
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
  const nameEl = document.getElementById('gamesAccountName');
  const hintEl = document.getElementById('gamesAccountHint');
  const inputEl = document.getElementById('gamesAccountInput');
  const entryRow = document.getElementById('gamesAccountEntryRow');
  const currentEl = document.getElementById('gamesAccountCurrent');
  const confirmBtn = document.getElementById('gamesAccountConfirmBtn');
  const clearBtn = document.getElementById('gamesAccountClearBtn');
  if (!nameEl || !hintEl || !inputEl || !entryRow || !currentEl || !confirmBtn || !clearBtn) return;

  const profile = gamesGetProfile();
  const active = profile.accounts[profile.activeAccountId] || null;
  const hasAccount = !!active;

  gamesApplyActiveAccountUI(active);
  inputEl.value = hasAccount ? '' : inputEl.value;

  const syncVisibleAccount = (account) => {
    gamesApplyActiveAccountUI(account || null);
  };

  if (!inputEl.dataset.bound) {
    inputEl.dataset.bound = '1';
    const submit = async () => {
      const typed = String(inputEl.value || '').trim();
      if (!typed) {
        syncVisibleAccount(null);
        hintEl.textContent = 'Zadej poslední 4 číslice os.č.';
        inputEl.focus();
        return;
      }
      if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadGameAccounts === 'function') {
        await gamesSyncProfileFromRemote(true);
      }
      const found = gamesAccountById(typed);
      if (!found) {
        hintEl.textContent = 'Takový uživatel na serveru neexistuje.';
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
      hintEl.textContent = 'Přihlášeno jako ' + found.name + '.';
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
      hintEl.textContent = 'Bez účtu můžeš hrát dál. Statistiky se ukládají jen po přihlášení číslem.';
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
  { id: 'sudoku', title: 'Sudoku', unit: 'bodů' },
  { id: 'mines', title: 'Minesweeper', unit: 'bodů' },
  { id: 'memory', title: 'Memory / Pexeso', unit: 'bodů' },
  { id: 'bomber', title: 'Bomberman mini', unit: 'bodů' },
  { id: 'daily', title: 'Denní challenge', unit: 'bodů' }
];

function gamesBuildProfilesWithRemoteRows(profile) {
  const base = Object.values(profile && profile.accounts || {}).filter(acc => !GAMES_ACCOUNT_BLOCKLIST.has(String(acc && acc.id || '').trim()));
  const byId = new Map(base.map(acc => [String(acc && acc.id || '').trim(), acc]));
  const remoteTtt = app.gamesLeaderboardCache && Array.isArray(app.gamesLeaderboardCache.ttt) ? app.gamesLeaderboardCache.ttt : [];
  remoteTtt.forEach((row) => {
    const id = String(row && (row.id || row.account_number || row.accountNumber) ? (row.id || row.account_number || row.accountNumber) : '').trim();
    if (!id || GAMES_ACCOUNT_BLOCKLIST.has(id)) return;
    const value = Number(row && (row.value || row.games_played || row.points) || 0) || 0;
    if (value <= 0) return;
    const remoteStats = {
      plays: value,
      wins: Number(row && row.wins || 0) || 0,
      losses: Number(row && row.losses || 0) || 0,
      draws: Number(row && row.draws || 0) || 0,
      lastPlayedAt: row && row.updatedAt ? Date.parse(row.updatedAt) || 0 : 0
    };
    const remoteName = String(row && (row.name || row.player_name) ? (row.name || row.player_name) : ('Hráč ' + id)).trim();
    if (byId.has(id)) {
      const existing = byId.get(id) || {};
      existing.stats = existing.stats && typeof existing.stats === 'object' ? existing.stats : {};
      const localTtt = existing.stats.ttt && typeof existing.stats.ttt === 'object' ? existing.stats.ttt : {};
      existing.stats.ttt = Object.assign({}, localTtt, {
        plays: Math.max(Number(localTtt.plays || 0) || 0, remoteStats.plays),
        wins: Math.max(Number(localTtt.wins || 0) || 0, remoteStats.wins),
        losses: Math.max(Number(localTtt.losses || 0) || 0, remoteStats.losses),
        draws: Math.max(Number(localTtt.draws || 0) || 0, remoteStats.draws),
        lastPlayedAt: Math.max(Number(localTtt.lastPlayedAt || 0) || 0, remoteStats.lastPlayedAt)
      });
      if (!existing.name && remoteName) existing.name = remoteName;
      existing.updatedAt = Math.max(Number(existing.updatedAt || 0) || 0, remoteStats.lastPlayedAt || Date.now());
      byId.set(id, existing);
      return;
    }
    byId.set(id, gamesNormalizeStoredAccount({
      id,
      name: remoteName,
      stats: { ttt: remoteStats },
      updatedAt: remoteStats.lastPlayedAt || Date.now()
    }, remoteName));
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
  { id: 'start', title: 'První krok', desc: 'Zahraj si první hru', goalText: '1 hra', progress: (a) => a.totalPlays, target: 1 },
  { id: 'ten', title: 'Desítka', desc: 'Nasbírej 10 her', goalText: '10 her', progress: (a) => a.totalPlays, target: 10 },
  { id: 'twentyfive', title: 'Rozjezd', desc: 'Nasbírej 25 her', goalText: '25 her', progress: (a) => a.totalPlays, target: 25 },
  { id: 'fifty', title: 'Mazák', desc: 'Nasbírej 50 her', goalText: '50 her', progress: (a) => a.totalPlays, target: 50 },
  { id: 'hundred', title: 'Veterán', desc: 'Nasbírej 100 her', goalText: '100 her', progress: (a) => a.totalPlays, target: 100 },
  { id: 'ttt_5', title: 'Piškvorky', desc: 'Odehraj 5 kol', goalText: '5 kol', progress: (a) => a.ttt.plays || 0, target: 5 },
  { id: 'ttt_10_wins', title: 'Piškvorkový boss', desc: 'Vyhraj 10krát v piškvorkách', goalText: '10 výher', progress: (a) => a.ttt.wins || 0, target: 10 },
  { id: '2048_500', title: '2048 start', desc: 'Dostaň se na 500 bodů', goalText: '500 bodů', progress: (a) => a.g2048.bestScore || 0, target: 500 },
  { id: '2048_tile', title: '2048 tile', desc: 'Dostaň tile 256', goalText: 'tile 256', progress: (a) => a.g2048.bestTile || 0, target: 256 },
  { id: 'snake_15', title: 'Snake master', desc: 'Dostaň snake na délku 15', goalText: '15 bodů', progress: (a) => a.snake.bestScore || 0, target: 15 },
  { id: 'snake_30', title: 'Hadí legenda', desc: 'Dostaň snake na délku 30', goalText: '30 bodů', progress: (a) => a.snake.bestScore || 0, target: 30 },
  { id: 'flap_10', title: 'Flappy pilot', desc: 'Dej ve Flapu 10 bodů', goalText: '10 bodů', progress: (a) => a.flap.bestScore || 0, target: 10 },
  { id: 'flap_20', title: 'Letecký boss', desc: 'Dej ve Flapu 20 bodů', goalText: '20 bodů', progress: (a) => a.flap.bestScore || 0, target: 20 },
  { id: 'aim_250', title: 'Rychlá ruka', desc: 'Nahraj 250 bodů v Aim Traineru', goalText: '250 bodů', progress: (a) => Number((a.arcade && a.arcade.aim && a.arcade.aim.bestScore) || 0), target: 250 },
  { id: 'reaction_200', title: 'Blesk', desc: 'Zasaž reakci pod 200 ms', goalText: '200 ms', progress: (a) => Number((a.arcade && a.arcade.reaction && a.arcade.reaction.bestTimeMs) || 0) ? (1000 - Number((a.arcade && a.arcade.reaction && a.arcade.reaction.bestTimeMs) || 0)) : 0, target: 800 },
  { id: 'tetris_500', title: 'Tetris master', desc: 'Nasbírej 500 bodů v Tetrisu', goalText: '500 bodů', progress: (a) => Number((a.arcade && a.arcade.tetris && a.arcade.tetris.bestScore) || 0), target: 500 },
  { id: 'shooter_500', title: 'Space ace', desc: 'Nasbírej 500 bodů ve Space Shooteru', goalText: '500 bodů', progress: (a) => Number((a.arcade && a.arcade.shooter && a.arcade.shooter.bestScore) || 0), target: 500 },
  { id: 'brick_500', title: 'Brick breaker', desc: 'Nasbírej 500 bodů v Brick Breakeru', goalText: '500 bodů', progress: (a) => Number((a.arcade && a.arcade.brick && a.arcade.brick.bestScore) || 0), target: 500 },
  { id: 'doodle_500', title: 'Doodle jumper', desc: 'Nasbírej 500 bodů v Doodle Jumpu', goalText: '500 bodů', progress: (a) => Number((a.arcade && a.arcade.doodle && a.arcade.doodle.bestScore) || 0), target: 500 },
  { id: 'bubble_250', title: 'Bubble pop', desc: 'Nasbírej 250 bodů v Bubble Shooteru', goalText: '250 bodů', progress: (a) => Number((a.arcade && a.arcade.bubble && a.arcade.bubble.bestScore) || 0), target: 250 },
  { id: 'sudoku_1', title: 'Sudoku solver', desc: 'Vyřeš první Sudoku', goalText: '1 dokončení', progress: (a) => Number((a.arcade && a.arcade.sudoku && a.arcade.sudoku.plays) || 0), target: 1 },
  { id: 'mines_10', title: 'Mines hunter', desc: 'Dej 10 bodů v Minesweeperu', goalText: '10 bodů', progress: (a) => Number((a.arcade && a.arcade.mines && a.arcade.mines.bestScore) || 0), target: 10 },
  { id: 'memory_10', title: 'Memory king', desc: 'Dostaň 10 bodů v Memory', goalText: '10 bodů', progress: (a) => Number((a.arcade && a.arcade.memory && a.arcade.memory.bestScore) || 0), target: 10 },
  { id: 'bomber_5', title: 'Bomber pilot', desc: 'Nasbírej 5 her v Bomberman mini', goalText: '5 her', progress: (a) => Number((a.arcade && a.arcade.bomber && a.arcade.bomber.plays) || 0), target: 5 },
  { id: 'daily_1', title: 'Daily grinder', desc: 'Splň první denní challenge', goalText: '1 challenge', progress: (a) => Number((a.arcade && a.arcade.daily && a.arcade.daily.plays) || 0), target: 1 }
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

function renderGamesHub() {
  gamesGetProfile();
  gamesRenderAccountChips();
  if (typeof renderGamesProfileStatus === 'function') renderGamesProfileStatus();
  gamesRenderProfiles();
  gamesRenderAchievements();
  // v.1.1 (668): samostatné herní Statistiky jsou sjednocené do Profilů.
  if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
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
  renderGameShell(id);
}

function closeGameShell() {
  gamesStopActiveLoops();
  app.activeGameShell = '';
  if (typeof window.rakGameEngineDeactivate === 'function') window.rakGameEngineDeactivate('closeGameShell');
  document.body.classList.remove('gamesOpen');
  renderGamesHub();
}

function renderGameShell(gameId) {
  const stage = document.getElementById('gamesStage');
  if (!stage) return;
  const titleMap = { ttt: 'Piškvorky', '2048': '2048', snake: 'Snake', flap: 'Flap Bird' };
  const title = titleMap[gameId] || 'Hra';
  if (gameId && typeof app !== 'undefined') app.activeGameShell = gameId;
  if (gameId && typeof window.rakGameEngineActivate === 'function') window.rakGameEngineActivate(gameId, 'renderGameShell');
  document.body.classList.add('gamesOpen');
  gamesApplyCompactMode();
  gamesEnsureResizeBinding();
  stage.innerHTML = [
    '<div class="gamesShell">',
    '  <div class="gamesShellTop">',
    '    <div class="gamesShellTitle">' + escapeHtml(title) + '</div>',
    '  </div>',
    '  <div id="gamesShellBody"></div>',
    '</div>'
  ].join('');
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
  active.updatedAt = nextPatch.lastPlayedAt;
  if (gameId === 'ttt') {
    active.stats.ttt = Object.assign({}, active.stats.ttt, nextPatch);
  } else if (gameId === '2048') {
    active.stats.g2048 = Object.assign({}, active.stats.g2048, nextPatch);
  } else if (gameId === 'snake') {
    active.stats.snake = Object.assign({}, active.stats.snake, nextPatch);
  } else if (gameId === 'flap') {
    active.stats.flap = Object.assign({}, active.stats.flap, nextPatch);
  }
  gamesSaveProfile(profile);
  gamesRenderProfiles();
  void gamesSyncStatOnline(gameId, nextPatch);
  void gamesRefreshRemoteLeaderboards(gameId, true);
}


function gamesNormalizeRemoteLeaderboardRows(gameId, rows, limit = 10) {
  const key = String(gameId || '').trim();
  return (Array.isArray(rows) ? rows : [])
    .map((row) => {
      const accountNumber = String(row && (row.account_number ?? row.accountNumber ?? row.id) ? (row.account_number ?? row.accountNumber ?? row.id) : '').trim();
      const name = String(row && (row.player_name ?? row.full_name ?? row.name) ? (row.player_name ?? row.full_name ?? row.name) : accountNumber || '').trim();
      const rawPoints = gameId === 'ttt'
        ? (row && (row.games_played ?? row.plays ?? row.points ?? row.best_score ?? row.bestScore ?? row.value))
        : (row && (row.points ?? row.best_score ?? row.bestScore ?? row.value));
      const points = Number(rawPoints || 0) || 0;
      const updatedAt = String(row && (row.updated_at ?? row.last_played_at ?? row.created_at) ? (row.updated_at ?? row.last_played_at ?? row.created_at) : '').trim();
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
    // Fáze 5: online leaderboard refresh už během rozehrané hry nepřerenderuje shell.
    if (!app.activeGameShell) {
      gamesRenderProfiles();
      gamesRenderStats();
    }
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

function gamesBindSwipeControl(el, onSwipe) {
  if (!el || el.dataset.swipeBound) return;
  el.dataset.swipeBound = '1';

  let startX = 0;
  let startY = 0;
  let active = false;

  const finish = (clientX, clientY) => {
    if (!active) return;
    active = false;
    const dx = clientX - startX;
    const dy = clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) < 18) return;
    if (absX > absY && absY < 36) {
      onSwipe(dx > 0 ? 'right' : 'left');
    } else if (absY > absX && absX < 36) {
      onSwipe(dy > 0 ? 'down' : 'up');
    }
  };

  const usePointer = 'PointerEvent' in window;
  if (usePointer) {
    el.addEventListener('pointerdown', (ev) => {
      if (ev.pointerType && ev.pointerType !== 'touch' && ev.pointerType !== 'pen') return;
      ev.preventDefault?.();
      startX = ev.clientX;
      startY = ev.clientY;
      active = true;
      try {
        if (typeof el.setPointerCapture === 'function') el.setPointerCapture(ev.pointerId);
      } catch (err) {}
    }, { passive: false });

    el.addEventListener('pointerup', (ev) => {
      if (ev.pointerType && ev.pointerType !== 'touch' && ev.pointerType !== 'pen') return;
      ev.preventDefault?.();
      finish(ev.clientX, ev.clientY);
    }, { passive: false });

    el.addEventListener('pointermove', (ev) => {
      if (!active || (ev.pointerType && ev.pointerType !== 'touch' && ev.pointerType !== 'pen')) return;
      ev.preventDefault?.();
    }, { passive: false });

    el.addEventListener('pointercancel', () => {
      active = false;
    }, { passive: true });

    el.addEventListener('lostpointercapture', () => {
      active = false;
    }, { passive: true });
  } else {
    el.addEventListener('touchstart', (ev) => {
      if (!ev.touches || ev.touches.length !== 1) return;
      const touch = ev.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      active = true;
      ev.preventDefault?.();
    }, { passive: false });

    el.addEventListener('touchmove', (ev) => {
      if (!active) return;
      ev.preventDefault?.();
    }, { passive: false });

    el.addEventListener('touchend', (ev) => {
      const touch = ev.changedTouches && ev.changedTouches[0];
      if (!touch) return;
      ev.preventDefault?.();
      finish(touch.clientX, touch.clientY);
    }, { passive: false });

    el.addEventListener('touchcancel', () => {
      active = false;
    }, { passive: true });
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
  const height = Math.max(compact ? 330 : 300, Math.min(compact ? 560 : 520, vp.height - (compact ? 128 : 154)));
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
    const fire = (ev) => {
      if (ev) {
        ev.preventDefault?.();
        ev.stopPropagation?.();
      }
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
  return { board: Array(16).fill(0), score: 0, over: false, best: 0, spawned: false, moves: 0 };
}

function game2048Spawn(state) {
  const empties = state.board.map((v, i) => (v ? -1 : i)).filter(i => i >= 0);
  if (!empties.length) return false;
  const idx = empties[Math.floor(Math.random() * empties.length)];
  state.board[idx] = Math.random() < 0.9 ? 2 : 4;
  return true;
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

function renderGame2048() {
  const body = document.getElementById('gamesShellBody');
  if (!body) return;
  const state = app.games2048 || (app.games2048 = game2048InitialState());
  if (!state.spawned) {
    game2048Spawn(state);
    game2048Spawn(state);
    state.spawned = true;
  }
  const compact = gamesIsCompactMode();
  const boardSize = gamesFitSquareSize({ min: compact ? 250 : 266, max: Math.min(compact ? 540 : 480, gamesViewportSize().width - (compact ? 14 : 20)), reserve: compact ? 170 : 186, shellPad: compact ? 6 : 10 });
  const activeAccount = gamesGetActiveAccount();
  const bestScore = activeAccount?.stats?.g2048?.bestScore || 0;
  body.innerHTML = [
    '<div class="gamesGamePanel">',
    '  <div class="gameInfoRow gameInfoRowCompact gameInfoRowDense"><span>Skóre <strong>' + state.score + '</strong></span><span>Nejlepší <strong>' + String(bestScore) + '</strong></span><span>' + (state.over ? 'Klepni na Nová hra' : 'Táhni po ploše') + '</span></div>',
    '  <div class="gameControls uMt2">',
    '    <button type="button" class="gameControlBtn" id="game2048NewBtn">Nová hra</button>',
    '  </div>',
    '  <div class="gameBoard game2048Board" id="game2048Board" style="width:' + boardSize + 'px;height:' + boardSize + 'px;">' + state.board.map(v => '<div class="gameBoardCell ' + (v ? 'n' + v : '') + '" data-value="' + (v || '') + '">' + (v || '') + '</div>').join('') + '</div>',
    gamesTop3Block('2048', 'bodů', 10),
    '</div>'
  ].join('');
  const board = body.querySelector('#game2048Board');
  if (board) {
    board.style.setProperty('width', boardSize + 'px', 'important');
    board.style.setProperty('height', boardSize + 'px', 'important');
  }
  const reset2048 = () => {
    app.games2048 = game2048InitialState();
    renderGame2048();
  };
  body.querySelector('#game2048NewBtn')?.addEventListener('click', reset2048);
  gamesBindSwipeControl(board, (dir) => {
    const current = app.games2048;
    if (current && current.over) {
      reset2048();
      return;
    }
    game2048Move(dir);
  });
  board?.addEventListener('click', () => {
    if (app.games2048 && app.games2048.over) reset2048();
  });
}

function game2048Move(dir) {
  const state = app.games2048;
  if (!state || state.over) return;
  const old = state.board.slice();
  let moved = false;
  const pull = (vals) => {
    const arr = vals.filter(Boolean);
    const out = [];
    for (let i = 0; i < arr.length; i += 1) {
      if (i < arr.length - 1 && arr[i] === arr[i + 1]) {
        const merged = arr[i] * 2;
        out.push(merged);
        state.score += merged;
        state.best = Math.max(state.best, merged);
        i += 1;
      } else {
        out.push(arr[i]);
      }
    }
    while (out.length < 4) out.push(0);
    return out;
  };
  for (let i = 0; i < 4; i += 1) {
    let line = [];
    if (dir === 'left') line = [0, 1, 2, 3].map(c => old[game2048Index(i, c)]);
    else if (dir === 'right') line = [3, 2, 1, 0].map(c => old[game2048Index(i, c)]);
    else if (dir === 'up') line = [0, 1, 2, 3].map(r => old[game2048Index(r, i)]);
    else if (dir === 'down') line = [3, 2, 1, 0].map(r => old[game2048Index(r, i)]);
    else return;
    const next = pull(line);
    if (dir === 'left') [0, 1, 2, 3].forEach((c, idx) => { state.board[game2048Index(i, c)] = next[idx]; if (next[idx] !== old[game2048Index(i, c)]) moved = true; });
    else if (dir === 'right') [3, 2, 1, 0].forEach((c, idx) => { state.board[game2048Index(i, c)] = next[idx]; if (next[idx] !== old[game2048Index(i, c)]) moved = true; });
    else if (dir === 'up') [0, 1, 2, 3].forEach((r, idx) => { state.board[game2048Index(r, i)] = next[idx]; if (next[idx] !== old[game2048Index(r, i)]) moved = true; });
    else if (dir === 'down') [3, 2, 1, 0].forEach((r, idx) => { state.board[game2048Index(r, i)] = next[idx]; if (next[idx] !== old[game2048Index(r, i)]) moved = true; });
  }
  if (moved) {
    state.moves += 1;
    game2048Spawn(state);
    state.best = Math.max(state.best, ...state.board);
    if (!state.board.includes(0) && !game2048CanMove(state.board)) state.over = true;
    renderGame2048();
    if (state.over) {
      const account = gamesGetActiveAccount();
      gamesRecordStat('2048', {
        plays: (account?.stats?.g2048?.plays || 0) + 1,
        bestScore: Math.max(account?.stats?.g2048?.bestScore || 0, state.score),
        bestTile: Math.max(account?.stats?.g2048?.bestTile || 0, state.best)
      });
    }
  }
}

// ---- Snake ----
function snakeDefaultState() {
  const head = { x: 10, y: 10 };
  return { size: 20, snake: [head, { x: 9, y: 10 }, { x: 8, y: 10 }], dir: { x: 1, y: 0 }, pending: null, food: { x: 5, y: 5 }, over: false, score: 0, timer: null };
}

function snakePlaceFood(state) {
  let x, y, ok = false;
  while (!ok) {
    x = Math.floor(Math.random() * state.size);
    y = Math.floor(Math.random() * state.size);
    ok = !state.snake.some(p => p.x === x && p.y === y);
  }
  state.food = { x, y };
}

function snakeBuildCellClasses(state, x, y) {
  if (state.food.x === x && state.food.y === y) return 'snakeFood';
  if (state.snake[0].x === x && state.snake[0].y === y) return 'snakeHead';
  if (state.snake.some((p, idx) => idx > 0 && p.x === x && p.y === y)) return 'snakeBody';
  return 'snakeEmpty';
}

function renderGameSnake() {
  const body = document.getElementById('gamesShellBody');
  if (!body) return;
  const state = app.gamesSnake || (app.gamesSnake = snakeDefaultState());
  if (!state.food || !state.snake.length) snakePlaceFood(state);
  const compact = gamesIsCompactMode();
  const boardSize = gamesFitSquareSize({ min: compact ? 226 : 246, max: Math.min(compact ? 540 : 480, gamesViewportSize().width - (compact ? 14 : 20)), reserve: compact ? 250 : 258, shellPad: compact ? 6 : 10 });
  const cells = [];
  for (let y = 0; y < state.size; y += 1) {
    for (let x = 0; x < state.size; x += 1) {
      const cls = snakeBuildCellClasses(state, x, y);
      const content = cls === 'snakeFood' ? '●' : cls === 'snakeHead' ? '◉' : cls === 'snakeBody' ? '•' : '';
      cells.push('<div class="gameBoardCell ' + cls + '">' + content + '</div>');
    }
  }
  const activeAccount = gamesGetActiveAccount();
  const bestLength = activeAccount?.stats?.snake?.bestLength || 0;
  body.innerHTML = [
    '<div class="gamesGamePanel gamesSnakePanel">',
    '  <div class="gameInfoRow gameInfoRowCompact gameInfoRowDense"><span>Skóre <strong>' + state.score + '</strong></span><span>Nejdelší <strong>' + String(bestLength) + '</strong></span><span>' + (state.over ? 'Klepni na pole pro novou hru' : 'Táhni po ploše nebo joystickem') + '</span></div>',
    '  <div class="gameBoard gameSnakeBoard" id="gameSnakeBoard" style="width:' + boardSize + 'px;height:' + boardSize + 'px;grid-template-columns:repeat(20,minmax(0,1fr));">' + cells.join('') + '</div>',
    snakeBuildJoystickMarkup(),
    gamesTop3Block('snake', 'bodů', 10),
    '</div>'
  ].join('');
  const board = body.querySelector('#gameSnakeBoard');
  if (board) {
    board.style.setProperty('width', boardSize + 'px', 'important');
    board.style.setProperty('height', boardSize + 'px', 'important');
    board.style.touchAction = 'none';
    board.style.webkitTouchCallout = 'none';
    board.style.userSelect = 'none';
  }
  body.style.touchAction = 'none';
  body.style.webkitTouchCallout = 'none';
  body.style.userSelect = 'none';
  body.style.overscrollBehavior = 'contain';
  body.style.touchAction = 'none';
  if (navigator && navigator.maxTouchPoints > 0 && !snakeIsJoystickEnabled()) {
    snakeSetJoystickEnabled(true);
  }
  const resetSnake = () => {
    if (state.timer) clearInterval(state.timer);
    app.gamesSnake = snakeDefaultState();
    snakePlaceFood(app.gamesSnake);
    snakeStart();
    renderGameSnake();
  };
  gamesBindSwipeControl(board || body, (dir) => {
    const current = app.gamesSnake;
    if (current && current.over) {
      resetSnake();
      return;
    }
    snakeSetDirection(dir);
  });
  board?.addEventListener('click', () => {
    if (app.gamesSnake && app.gamesSnake.over) resetSnake();
  });
  snakeBindJoystickControls(body, resetSnake);
  if (!state.timer) snakeStart();
}

function snakeSetDirection(dir) {
  const state = app.gamesSnake;
  if (!state || state.over) return;
  const next = dir === 'up' ? { x: 0, y: -1 } : dir === 'down' ? { x: 0, y: 1 } : dir === 'left' ? { x: -1, y: 0 } : { x: 1, y: 0 };
  if (state.dir.x + next.x === 0 && state.dir.y + next.y === 0) return;
  state.pending = next;
  if (!state.timer) snakeStart();
}

function snakeTick() {
  const state = app.gamesSnake;
  if (!state || state.over) return;
  if (state.pending) {
    state.dir = state.pending;
    state.pending = null;
  }
  const head = {
    x: (state.snake[0].x + state.dir.x + state.size) % state.size,
    y: (state.snake[0].y + state.dir.y + state.size) % state.size
  };
  if (state.snake.some(p => p.x === head.x && p.y === head.y)) {
    state.over = true;
    renderGameSnake();
    const account = gamesGetActiveAccount();
    gamesRecordStat('snake', {
      plays: (account?.stats?.snake?.plays || 0) + 1,
      bestScore: Math.max(account?.stats?.snake?.bestScore || 0, state.score),
      bestLength: Math.max(account?.stats?.snake?.bestLength || 0, state.snake.length)
    });
    return;
  }
  state.snake.unshift(head);
  if (head.x === state.food.x && head.y === state.food.y) {
    state.score += 1;
    snakePlaceFood(state);
  } else {
    state.snake.pop();
  }
  renderGameSnake();
}

function snakeStart() {
  const state = app.gamesSnake || (app.gamesSnake = snakeDefaultState());
  if (state.timer) clearInterval(state.timer);
  state.timer = setInterval(snakeTick, 120);
}

// ---- Flap Bird ----
function flapDefaultState() {
  return {
    y: 0,
    v: 0,
    gravity: 0.38,
    lift: -6.8,
    pipes: [],
    score: 0,
    over: false,
    timer: null,
    frame: 0,
    started: false,
    lastTs: 0,
    nextPipeAt: 0,
    dpr: 1,
    canvasW: 0,
    canvasH: 0,
    refs: null
  };
}

function flapResetState(state) {
  state.y = 0;
  state.v = 0;
  state.pipes = [];
  state.score = 0;
  state.over = false;
  state.frame = 0;
  state.started = false;
  state.lastTs = 0;
  state.nextPipeAt = 0;
}

function flapSyncCanvas(state, force) {
  const refs = state.refs;
  const canvas = refs && refs.canvas;
  if (!canvas) return { width: 0, height: 0 };
  const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : canvas.getBoundingClientRect();
  const width = Math.max(280, Math.floor(rect.width || canvas.clientWidth || 280));
  const height = Math.max(240, Math.floor(rect.height || canvas.clientHeight || 240));
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
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!state.started && !state.over && !state.y) state.y = height * 0.42;
    state.y = Math.max(20, Math.min(height - 24, state.y || height * 0.42));
  }
  return { width: state.canvasW, height: state.canvasH };
}

function flapDraw(state) {
  const refs = state.refs || {};
  const canvas = refs.canvas;
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  if (!ctx) return;
  const width = state.canvasW || canvas.clientWidth || 320;
  const height = state.canvasH || canvas.clientHeight || 280;
  const pipeWidth = Math.max(26, Math.round(width * 0.085));
  const gap = Math.max(118, Math.min(170, Math.round(height * 0.28)));
  const birdX = Math.round(width * 0.22);
  const birdSize = Math.max(18, Math.round(Math.min(width, height) * 0.055));
  ctx.clearRect(0, 0, width, height);
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, 'rgba(92, 168, 112, 0.42)');
  sky.addColorStop(0.5, 'rgba(27, 44, 39, 0.92)');
  sky.addColorStop(1, 'rgba(6, 10, 12, 0.98)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 4; i += 1) {
    const px = (i * 91 + state.frame * 0.22) % (width + 60) - 30;
    ctx.beginPath();
    ctx.ellipse(px, 30 + i * 14, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, height - 18, width, 18);
  const floorY = height - 18;
  const pipeBase = 'rgba(83, 190, 110, 0.82)';
  const pipeEdge = 'rgba(124,255,124,0.34)';
  state.pipes.forEach((pipe) => {
    const topH = pipe.gapY;
    const bottomY = pipe.gapY + gap;
    ctx.fillStyle = pipeBase;
    ctx.strokeStyle = pipeEdge;
    ctx.lineWidth = 1;
    const rounded = Math.max(8, Math.round(pipeWidth * 0.34));
    const topX = pipe.x;
    const drawPipe = (x, y, w, h, topRound, bottomRound) => {
      ctx.beginPath();
      if (topRound && bottomRound) {
        if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, rounded);
        else ctx.rect(x, y, w, h);
      } else if (topRound) {
        ctx.moveTo(x, y + rounded);
        ctx.arcTo(x, y, x + rounded, y, rounded);
        ctx.lineTo(x + w - rounded, y);
        ctx.arcTo(x + w, y, x + w, y + rounded, rounded);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
      } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h - rounded);
        ctx.arcTo(x + w, y + h, x + w - rounded, y + h, rounded);
        ctx.lineTo(x + rounded, y + h);
        ctx.arcTo(x, y + h, x, y + h - rounded, rounded);
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
    };
    drawPipe(topX, 0, pipeWidth, topH, false, true);
    drawPipe(topX, bottomY, pipeWidth, height - bottomY - 18, true, false);
  });
  const birdY = state.y;
  const birdGlow = ctx.createRadialGradient(birdX + birdSize * 0.5, birdY + birdSize * 0.5, 4, birdX + birdSize * 0.5, birdY + birdSize * 0.5, birdSize * 2.2);
  birdGlow.addColorStop(0, 'rgba(124,255,124,0.45)');
  birdGlow.addColorStop(1, 'rgba(124,255,124,0)');
  ctx.fillStyle = birdGlow;
  ctx.beginPath();
  ctx.arc(birdX + birdSize * 0.5, birdY + birdSize * 0.5, birdSize * 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(128, 255, 154, 0.96)';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(birdX, birdY, birdSize, birdSize * 0.78, birdSize * 0.35);
  else ctx.rect(birdX, birdY, birdSize, birdSize * 0.78);
  ctx.fill();
  ctx.fillStyle = 'rgba(18, 32, 25, 0.92)';
  ctx.beginPath();
  ctx.arc(birdX + birdSize * 0.72, birdY + birdSize * 0.28, Math.max(1.6, birdSize * 0.09), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(232,255,240,0.92)';
  ctx.beginPath();
  ctx.arc(birdX + birdSize * 0.7, birdY + birdSize * 0.27, Math.max(0.9, birdSize * 0.04), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, floorY, width, 1);
}

function flapUpdateScoreUI(state) {
  if (!state.refs) return;
  if (state.refs.scoreEl) state.refs.scoreEl.textContent = String(state.score);
  if (state.refs.bestEl) state.refs.bestEl.textContent = String(state.refs.best || 0);
  if (state.refs.statusEl) {
    state.refs.statusEl.textContent = state.over ? 'Konec hry' : (state.started ? 'Klepni pro skok' : 'Klepni pro start');
  }
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
    const dt = Math.min(2.2, Math.max(0.35, (now - state.lastTs) / 16.666));
    state.lastTs = now;
    const pipeWidth = Math.max(26, Math.round(size.width * 0.085));
    const gap = Math.max(118, Math.min(170, Math.round(size.height * 0.28)));
    const birdX = Math.round(size.width * 0.22);
    const birdSize = Math.max(18, Math.round(Math.min(size.width, size.height) * 0.055));
    const pipeSpeed = Math.max(2.2, size.width * 0.0044);
    if (state.started && !state.over) {
      state.frame += 1;
      state.v += state.gravity * dt;
      state.y += state.v * dt;
      if (!state.nextPipeAt) state.nextPipeAt = now + 850;
      if (now >= state.nextPipeAt) {
        const margin = Math.max(34, Math.round(size.height * 0.11));
        const gapMin = margin;
        const gapMax = Math.max(gapMin + 10, size.height - gap - margin - 18);
        const gapY = Math.max(gapMin, Math.min(gapMax, Math.floor(margin + Math.random() * Math.max(20, gapMax - gapMin))));
        state.pipes.push({ x: size.width + 12, gapY, passed: false });
        state.nextPipeAt = now + Math.max(1260, 1480 - Math.min(360, state.score * 10));
      }
      state.pipes.forEach((pipe) => {
        pipe.x -= pipeSpeed * dt;
        if (!pipe.passed && pipe.x + pipeWidth < birdX) {
          pipe.passed = true;
          state.score += 1;
          if ((gamesGetActiveAccount()?.stats?.flap?.bestScore || 0) < state.score) state.best = Math.max(state.best || 0, state.score);
        }
      });
      state.pipes = state.pipes.filter((pipe) => pipe.x > -pipeWidth - 10);
      if (state.y < 0) state.y = 0;
      if (state.y > size.height - birdSize - 18) state.over = true;
      const birdTop = state.y;
      const birdBottom = state.y + birdSize * 0.78;
      for (const pipe of state.pipes) {
        const withinX = birdX + birdSize > pipe.x && birdX < pipe.x + pipeWidth;
        if (withinX) {
          if (birdTop < pipe.gapY || birdBottom > pipe.gapY + gap) {
            state.over = true;
            break;
          }
        }
      }
      if (state.over) {
        const account = gamesGetActiveAccount();
        gamesRecordStat('flap', {
          plays: (account?.stats?.flap?.plays || 0) + 1,
          bestScore: Math.max(account?.stats?.flap?.bestScore || 0, state.score),
          bestPipes: Math.max(account?.stats?.flap?.bestPipes || 0, state.score)
        });
      }
    }
    flapDraw(state);
    flapUpdateScoreUI(state);
  };
  state.timer = requestAnimationFrame(loop);
}

function flapTap() {
  const state = app.gamesFlap;
  if (!state) return;
  if (state.over) {
    flapResetState(state);
    if (state.refs) {
      flapSyncCanvas(state, true);
      state.y = Math.max(20, Math.min((state.canvasH || 280) - 24, (state.canvasH || 280) * 0.42));
    }
  }
  state.started = true;
  state.v = state.lift;
  if (!state.timer) flapEnsureLoop(state);
  flapUpdateScoreUI(state);
}

function renderGameFlap() {
  const body = document.getElementById('gamesShellBody');
  if (!body) return;
  const state = app.gamesFlap || (app.gamesFlap = flapDefaultState());
  const fit = gamesFitFlapSize();
  body.innerHTML = [
    '<div class="gamesGamePanel">',
    '  <div class="gameInfoRow gameInfoRowCompact gameInfoRowDense"><span>Skóre <strong id="flapScore">' + String(state.score || 0) + '</strong></span><span>Nejlepší <strong id="flapBest">' + String(state.best || 0) + '</strong></span><span id="flapStatus">' + (state.over ? 'Klepni na plochu pro novou hru' : (state.started ? 'Klepni pro skok' : 'Klepni pro start')) + '</span></div>',
    '  <div class="gameBoard gameFlapBoard" id="gameFlapBoard" style="width:' + fit.width + 'px;height:' + fit.height + 'px;">',
    '    <canvas id="flapCanvas" class="gameFlapCanvas"></canvas>',
    '  </div>',
    gamesTop3Block('flap', 'bodů', 10),
    '</div>'
  ].join('');
  state.refs = {
    board: body.querySelector('#gameFlapBoard'),
    canvas: body.querySelector('#flapCanvas'),
    scoreEl: body.querySelector('#flapScore'),
    statusEl: body.querySelector('#flapStatus'),
    bestEl: body.querySelector('#flapBest')
  };
  if (state.refs.board) {
    state.refs.board.style.setProperty('width', fit.width + 'px', 'important');
    state.refs.board.style.setProperty('height', fit.height + 'px', 'important');
  }
  state.best = Math.max(state.best || 0, gamesGetActiveAccount()?.stats?.flap?.bestScore || 0);
  flapSyncCanvas(state, true);
  if (!state.y) state.y = Math.max(20, Math.min((state.canvasH || fit.height) - 24, (state.canvasH || fit.height) * 0.42));
  flapUpdateScoreUI(state);
  flapEnsureLoop(state);
  state.refs.canvas?.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    flapTap();
  }, { passive: false });
}

function renderGamesTttShell() {

  const body = document.getElementById('gamesShellBody');
  if (!body) return;
  body.innerHTML = [
    '<div class="gameInfoRow"><span>Piškvorky běží na celou obrazovku.</span><span>Odkaz můžeš poslat dál.</span></div>',
    '<div class="gamesShell uPad12 uMt10">',
    '  <div class="smallText">Spustí se plná hra a odkaz můžeš sdílet dál.</div>',
    '  <div class="gameControls uMt10">',
    '    <button type="button" class="gameControlBtn" id="openTttOverlayBtn">Otevřít piškvorky</button>',
    '    <button type="button" class="gameControlBtn" id="copyTttInviteBtn">Kopírovat odkaz</button>',
    '  </div>',
    '</div>'
  ].join('');
  body.querySelector('#openTttOverlayBtn')?.addEventListener('click', openTicTacToeGame);
  body.querySelector('#copyTttInviteBtn')?.addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.hash = 'games=ttt';
    navigator.clipboard?.writeText(url.toString()).catch(()=>{});
    const info = body.querySelector('#tttInviteInfo');
    if (info) info.textContent = 'Odkaz na piškvorky je zkopírovaný do schránky.';
  });
}


if (!window.__tttHashInviteBound) {
  window.__tttHashInviteBound = true;
  window.addEventListener('load', () => { void tttAutoOpenFromHash(); }, { once: true });
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
  { id: 'default', label: 'RaK glass', subtitle: 'Čistý zelený základ pro tmavé sklo', color: '#7CFF7C', unlockText: 'Vždy dostupné', minPlays: 0, minAchievements: 0, vars: { '--bg': '#07100b', '--panel': 'rgba(18,28,22,.72)', '--panel2': 'rgba(24,36,28,.68)', '--green': '#4ADE80', '--green2': '#B7FFBE', '--muted': '#91a396', '--soft': '#e5f7e9' } },
  { id: 'emerald', label: 'Škoda emerald', subtitle: 'Moderní zelená ve stylu novější identity', color: '#78FAAE', unlockText: 'Odemkne se po 5 hrách', minPlays: 5, minAchievements: 0, vars: { '--bg': '#04100d', '--panel': 'rgba(8,32,25,.70)', '--panel2': 'rgba(13,48,38,.66)', '--green': '#78FAAE', '--green2': '#D5FFE5', '--muted': '#96b7a6', '--soft': '#e6fff0' } },
  { id: 'midnight', label: 'Midnight blue', subtitle: 'Tmavé modré sklo pro výrazný kontrast', color: '#60A5FA', unlockText: 'Odemkne se po 12 hrách', minPlays: 12, minAchievements: 0, vars: { '--bg': '#020617', '--panel': 'rgba(15,23,42,.70)', '--panel2': 'rgba(30,41,59,.66)', '--green': '#60A5FA', '--green2': '#BFDBFE', '--muted': '#93a4bd', '--soft': '#e7f0ff' } },
  { id: 'aurora', label: 'Aurora cyan', subtitle: 'Tyrkysový glow pod glass kartami', color: '#22D3EE', unlockText: 'Odemkne se po 20 hrách', minPlays: 20, minAchievements: 0, vars: { '--bg': '#03121d', '--panel': 'rgba(6,24,38,.70)', '--panel2': 'rgba(8,47,73,.62)', '--green': '#22D3EE', '--green2': '#A5F3FC', '--muted': '#8fb7c3', '--soft': '#e5fbff' } },
  { id: 'neon', label: 'Neon violet', subtitle: 'Fialovo-růžový moderní neon', color: '#D946EF', unlockText: 'Odemkne se po 30 hrách', minPlays: 30, minAchievements: 0, vars: { '--bg': '#12061b', '--panel': 'rgba(37,15,52,.70)', '--panel2': 'rgba(62,20,82,.64)', '--green': '#D946EF', '--green2': '#F5D0FE', '--muted': '#b99ac6', '--soft': '#f8eaff' } },
  { id: 'graphite', label: 'Titanium graphite', subtitle: 'Prémiový šedo-stříbrný dark', color: '#CBD5E1', unlockText: 'Odemkne se po 40 hrách', minPlays: 40, minAchievements: 0, vars: { '--bg': '#05070a', '--panel': 'rgba(17,24,39,.72)', '--panel2': 'rgba(31,41,55,.64)', '--green': '#CBD5E1', '--green2': '#F8FAFC', '--muted': '#a7b0bd', '--soft': '#edf2f7' } },
  { id: 'ice', label: 'Ice glass', subtitle: 'Ledově světlý akcent na tmavém podkladu', color: '#99F6E4', unlockText: 'Odemkne se po 55 hrách', minPlays: 55, minAchievements: 0, vars: { '--bg': '#021011', '--panel': 'rgba(8,47,73,.62)', '--panel2': 'rgba(15,118,110,.46)', '--green': '#99F6E4', '--green2': '#CCFBF1', '--muted': '#9ec5c3', '--soft': '#edfffb' } },
  { id: 'amoled', label: 'AMOLED neon', subtitle: 'Skoro černá, maximum kontrastu', color: '#B8FF67', unlockText: 'Odemkne se po 8 achievementech', minPlays: 60, minAchievements: 8, vars: { '--bg': '#000000', '--panel': 'rgba(7,10,8,.76)', '--panel2': 'rgba(12,18,14,.68)', '--green': '#B8FF67', '--green2': '#ECFCCB', '--muted': '#939c91', '--soft': '#f4ffe9' } },
  { id: 'sunset', label: 'Sunset plasma', subtitle: 'Teplý oranžovo-růžový glass', color: '#FB7185', unlockText: 'Odemkne se po 75 hrách', minPlays: 75, minAchievements: 0, vars: { '--bg': '#15050a', '--panel': 'rgba(57,18,28,.68)', '--panel2': 'rgba(87,28,38,.60)', '--green': '#FB7185', '--green2': '#FECDD3', '--muted': '#c7a0a8', '--soft': '#fff0f3' } }
]
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
  }
];
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
      ui.updatedAt = Math.max(localTs, remoteTs || Date.now());
      if (changed) {
        rakProfileUiSyncGuard.remoteApplies += 1;
        rakProfileUiSyncGuard.lastApplyAt = Date.now();
        account.updatedAt = Math.max(Number(account.updatedAt || 0) || 0, ui.updatedAt);
        profile.profileVersion = GAMES_PROFILE_RESET_VERSION;
        gamesSaveProfile(profile);
        app.gamesProfile = profile;
        if (remoteTheme) applyThemePreference(remoteTheme, true, { skipProfile: true });
        if (remoteBg) applyBackgroundPreference(remoteBg, true, { skipProfile: true });
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
  let changed = false;
  if (!ui.themeId) { ui.themeId = localTheme; changed = true; }
  if (!ui.backgroundId) { ui.backgroundId = localBg; changed = true; }
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
  const bg = RAK_BACKGROUND_DEFS.find(item => item.id === normalizeBackgroundPreferenceId(bgId, 'ios-mesh')) || RAK_BACKGROUND_DEFS[0];
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
  if (!active) return { totalPlays: 0, bestScore: 0, achievements: 0 };
  const total = typeof gamesGetTotals === 'function' ? gamesGetTotals(active) : { totalPlays: 0, bestScore: 0 };
  const achievements = typeof gamesGetAchievementCount === 'function' ? gamesGetAchievementCount(active) : 0;
  return {
    totalPlays: Number(total.totalPlays || 0) || 0,
    bestScore: Number(total.bestScore || 0) || 0,
    achievements: Number(achievements || 0) || 0
  };
}

function getThemeUnlockScore(profile) {
  const metrics = getThemeUnlockMetrics(profile);
  return metrics.totalPlays + Math.floor(metrics.bestScore / 50) + (metrics.achievements * 2);
}

function applyThemePreference(themeId, persist = true, options = {}) {
  const theme = RAK_THEME_DEFS.find(t => t.id === normalizeThemePreferenceId(themeId, 'default')) || RAK_THEME_DEFS[0];
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
      '<div class="appMenuThemeSub">' + escapeHtml(String(theme.subtitle || '')) + '</div>' +
      '<div class="appMenuThemeBadge">' + escapeHtml(unlockedText) + '</div>' +
      '</div>' +
    '</button>';
  }).join('');
  const bgDefs = Array.isArray(window.RAK_BACKGROUND_DEFS) ? window.RAK_BACKGROUND_DEFS : [];
  const currentBgId = typeof getBackgroundPreference === 'function' ? getBackgroundPreference() : 'ios-mesh';
  const currentBg = bgDefs.find(bg => String(bg.id || '') === String(currentBgId)) || bgDefs[0] || { label: 'iOS mesh' };
  const bgCards = bgDefs.map(bg => {
    const swatch = String(bg.swatch || bg.color || '#38bdf8');
    return '<button type="button" class="appMenuBackgroundCard" data-bg-id="' + escapeHtml(String(bg.id || '')) + '">' +
      '<div class="appMenuBackgroundSwatch" style="--background-swatch:' + escapeHtml(swatch) + '"></div>' +
      '<div class="appMenuThemeInfo">' +
      '<div class="appMenuThemeTitle">' + escapeHtml(String(bg.label || '')) + '</div>' +
      '<div class="appMenuThemeSub">' + escapeHtml(String(bg.subtitle || '')) + '</div>' +
      '<div class="appMenuThemeBadge">Dostupné</div>' +
      '</div>' +
    '</button>';
  }).join('');
  const activeUiAccount = getActiveProfileUiAccount();
  const profileThemeText = activeUiAccount
    ? 'Jsi přihlášený jako ' + String(activeUiAccount.name || activeUiAccount.id || '').trim() + ': theme i pozadí se ukládá k hernímu profilu a načte se i na jiném zařízení.'
    : 'Bez přihlášení se theme i pozadí ukládá jen do tohoto zařízení. Po přihlášení herním profilem se začne ukládat k profilu.';
  return [
    '<div class="appMenuCard appMenuSettingsCard appMenuThemeCardWrap">',
    '  <div class="appMenuCardTitle">Theme / barvy aplikace</div>',
    '  <div class="appMenuText">Theme mění barvy, akcenty, aktivní prvky a některé odemykatelné skiny. Pozadí je samostatné, aby šlo doladit glass efekt bez změny rozložení.<br>' + escapeHtml(profileThemeText) + '</div>',
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
    '      <div class="appMenuThemeHint" id="appMenuBackgroundHint">Pozadí mění jen atmosféru a kontrast glass prvků, ne velikosti ani funkce.</div>',
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
    const unlocked = !!theme && (id === 'default' || (Number(theme.minPlays || 0) <= metrics.totalPlays && Number(theme.minAchievements || 0) <= metrics.achievements));
    card.classList.toggle('isActive', id === current);
    card.classList.toggle('isLocked', !unlocked && id !== 'default');
    card.setAttribute('aria-pressed', id === current ? 'true' : 'false');
    const badge = card.querySelector('.appMenuThemeBadge');
    if (badge && theme) {
      const nextBadgeText = unlocked ? (theme.unlockText || 'Odemčeno') : ('Zamčeno · ' + (theme.unlockText || 'podmínka nesplněna'));
      if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(badge, nextBadgeText, 'themeBadge-' + id);
      else badge.textContent = nextBadgeText;
    }
    if (!card.dataset.bound) {
      card.dataset.bound = '1';
      card.addEventListener('click', () => {
        const nextTheme = themeById.get(id) || null;
        if (!nextTheme) return;
        const nextMetrics = getThemeUnlockMetrics(typeof gamesGetProfile === 'function' ? gamesGetProfile() : null);
        const nextUnlocked = id === 'default' || (Number(nextTheme.minPlays || 0) <= nextMetrics.totalPlays && Number(nextTheme.minAchievements || 0) <= nextMetrics.achievements);
        if (!nextUnlocked) {
          if (hint) {
            const nextHintText = nextTheme.unlockText || 'Tento theme je zatím zamčený.';
            if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(hint, nextHintText, 'themeHintLocked');
            else hint.textContent = nextHintText;
          }
          return;
        }
        applyThemePreference(id, true);
        if (typeof applyBackgroundPreference === 'function') applyBackgroundPreference(getBackgroundPreference(), false);
        renderThemeSettingsCards();
        if (hint) {
          const nextHintText = 'Theme „' + String(nextTheme.label || id) + '“ je teď aktivní.';
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
      card.classList.toggle('isActive', id === currentBg);
      card.setAttribute('aria-pressed', id === currentBg ? 'true' : 'false');
      if (!card.dataset.bound) {
        card.dataset.bound = '1';
        card.addEventListener('click', () => {
          const nextBg = bgById.get(id) || null;
          if (!nextBg) return;
          if (typeof applyBackgroundPreference === 'function') applyBackgroundPreference(id, true);
          renderThemeSettingsCards();
          if (bgHint) {
            const nextBgHintText = 'Pozadí „' + String(nextBg.label || id) + '“ je teď aktivní.';
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
    const nextThemeSummary = 'Aktivní: ' + String(activeName) + ' · ' + String(metrics.totalPlays) + ' her / ' + String(metrics.achievements) + ' achievementů';
    if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(summaryMeta, nextThemeSummary, 'themeSummaryMeta');
    else summaryMeta.textContent = nextThemeSummary;
  }

  if (hint) {
    const activeName = (themeById.get(current) || themeList[0] || { label: 'Výchozí' }).label;
    const nextThemeHint = profile && profile.activeAccountId
      ? 'Theme i pozadí se ukládá k přihlášenému hernímu profilu. Aktivní: ' + activeName + '.'
      : 'Theme mění barvy/akcenty aplikace. Bez přihlášení se ukládá jen lokálně v tomto zařízení.';
    if (typeof setElementTextIfChanged === 'function') setElementTextIfChanged(hint, nextThemeHint, 'themeHintSummary');
    else hint.textContent = nextThemeHint;
  }
}

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
  }
  if (typeof app !== 'undefined') app.activeGameShell = '';
  return true;
};


function syncGamesLockedSections() {
  const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : null;
  const active = profile && profile.activeAccountId && profile.accounts ? profile.accounts[profile.activeAccountId] : null;
  const lockedEls = [
    document.querySelector('#games .gamesProfilesFolder'),
    document.querySelector('#games .gamesAchievementsFolder'),
    document.querySelector('#games .gamesStatsFolder')
  ];
  lockedEls.forEach((el) => {
    if (!el) return;
    el.hidden = !active;
  });
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
