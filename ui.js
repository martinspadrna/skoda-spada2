function setBottomNavActive(pageId) {
  const buttons = document.querySelectorAll('.bottomNavBtn');
  buttons.forEach(btn => {
    const isActive = btn.dataset.page === pageId;
    btn.classList.toggle('active', isActive);
    if (isActive && typeof btn.scrollIntoView === 'function' && btn.dataset.page !== 'menu') {
      try { btn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' }); } catch (err) {}
    }
  });
}



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
    '  <div style="width:34px;"></div>',
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

function startMenuImport() {
  const input = document.getElementById('excelFile');
  if (!input) {
    alert('Import není připravený.');
    return;
  }
  app.pendingMenuImport = true;
  input.click();
}

const UI_PREFS_KEY = APP_KEY + ':uiPrefs';

function loadUiPrefs() {
  try {
    const raw = localStorage.getItem(UI_PREFS_KEY);
    if (!raw) return { compact: false, reduceMotion: false };
    const parsed = JSON.parse(raw);
    return {
      compact: !!parsed.compact,
      reduceMotion: !!parsed.reduceMotion
    };
  } catch (err) {
    console.warn(err);
    return { compact: false, reduceMotion: false };
  }
}

function saveUiPrefs(prefs) {
  const next = {
    compact: !!prefs.compact,
    reduceMotion: !!prefs.reduceMotion
  };
  try {
    localStorage.setItem(UI_PREFS_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn(err);
  }
  return next;
}

function applyUiPrefs(prefs) {
  const next = saveUiPrefs(prefs || loadUiPrefs());
  document.body.classList.toggle('compactUI', !!next.compact);
  document.body.classList.toggle('reduceMotion', !!next.reduceMotion);
  if (typeof app !== 'undefined') {
    app.uiPrefs = next;
  }
  return next;
}

function toggleUiPref(key) {
  const current = loadUiPrefs();
  const next = { ...current, [key]: !current[key] };
  applyUiPrefs(next);
  return next;
}

function resetUiPrefs() {
  applyUiPrefs({ compact: false, reduceMotion: false });
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
  inset:56px 12px 88px;
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:0;
  overflow:hidden;
  padding-bottom:2px;
}
.tttBoard{
  width:100%;
  height:100%;
  display:grid;
  grid-template-columns:repeat(10, var(--tttCellSize, 24px));
  grid-template-rows:repeat(18, var(--tttCellSize, 24px));
  gap:0;
  justify-content:center;
  align-content:center;
  overflow:hidden;
  box-shadow:inset 0 0 0 1px rgba(124,255,124,.22);
}
.tttCell{
  appearance:none;
  -webkit-appearance:none;
  font-family:inherit;
  width:var(--tttCellSize, 24px);
  height:var(--tttCellSize, 24px);
  box-sizing:border-box;
  border:1px solid rgba(124,255,124,.14);
  background:rgba(255,255,255,.02);
  border-radius:0;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:calc(var(--tttCellSize, 24px) * .74);
  font-weight:900;
  line-height:1;
  text-align:center;
  color:#7CFF7C;
  text-shadow:0 0 10px rgba(124,255,124,.24), 0 0 18px rgba(124,255,124,.18);
  transition:transform .16s ease, background .16s ease, border-color .16s ease, box-shadow .16s ease;
}
.tttCell:active{transform:scale(.98);}
.tttCell.isFilled{
  background:rgba(124,255,124,.05);
}
.tttCell.isX{
  color:#7CFF7C;
  text-shadow:0 0 10px rgba(124,255,124,.34), 0 0 18px rgba(124,255,124,.24), 0 0 28px rgba(124,255,124,.18);
}
.tttCell.isO{
  color:#ff4040;
  text-shadow:0 0 10px rgba(255,64,64,.34), 0 0 18px rgba(255,64,64,.24), 0 0 28px rgba(255,64,64,.18);
}
.tttCell.isWinner{
  background:rgba(124,255,124,.12);
  border-color:rgba(124,255,124,.5);
  box-shadow:inset 0 0 0 1px rgba(124,255,124,.25), 0 0 18px rgba(124,255,124,.18);
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
  .tttBoardWrap{inset:48px 10px 78px;}
  .tttFooter{left:10px; right:10px; bottom:calc(10px + env(safe-area-inset-bottom));}
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
    '      <h2 id="tttTitle" style="display:none;">Piškvorky</h2>',
    '      <span></span>',
    '    </div>',
    '    <button type="button" class="tttClose" aria-label="Zavřít">×</button>',
    '  </div>',
    '  <div class="tttContent">',
    '    <div class="tttStartScreen" id="tttStartScreen"></div>',
    '    <div class="tttGameScreen" id="tttGameScreen" style="display:none;">',
    '      <div class="tttStatus" id="tttStatus"></div>',
    '      <div class="tttBoardWrap"><div class="tttBoard" id="tttBoard"></div></div>',
    '      <div class="tttFooter">',
    '        <button type="button" class="tttBtn" id="tttRestartBtn">Nová hra</button>',
    '      </div>',
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
  overlay.querySelector('#tttRestartBtn')?.addEventListener('click', () => {
    resetTicTacToeGame(true);
  });

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

function tttGetState() {
  if (!app.tttState) {
    app.tttState = {
      screen: 'start',
      mode: 'ai',
      difficulty: 'ai',
      board: Array(TTT_TOTAL_CELLS).fill(''),
      turn: 'X',
      gameOver: false,
      winner: null,
      message: '',
      startedAt: 0,
      moveCount: 0,
      moveCountX: 0,
      moveCountO: 0,
      hardWinPrompt: false,
      hardWinStats: null,
      hardWinName: '',
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


function tttMakeInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function tttGetInviteUrl(code) {
  const url = new URL(window.location.href);
  url.hash = 'games=ttt&invite=' + encodeURIComponent(String(code || '').trim());
  return url.toString();
}

function tttSetOnlineStatus(text, kind) {
  const state = tttGetState();
  state.onlineStatus = String(text || '').trim();
  state.onlineKind = String(kind || 'waiting');
}

const TTT_ONLINE_POLL_MS = 650;
const TTT_ONLINE_RESULT_STORE_KEY = 'rotace_ttt_online_results_v1';

function tttReadOnlineResultStore() {
  try {
    const raw = localStorage.getItem(TTT_ONLINE_RESULT_STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    return {};
  }
}

function tttWriteOnlineResultStore(store) {
  try {
    localStorage.setItem(TTT_ONLINE_RESULT_STORE_KEY, JSON.stringify(store && typeof store === 'object' ? store : {}));
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
    winnerAccountNumber: null
  };
  if (patch.winner && online && online.role && patch.winner === online.role.toUpperCase()) {
    patch.winnerAccountNumber = typeof gamesGetActiveAccount === 'function' && gamesGetActiveAccount() ? gamesGetActiveAccount().id : null;
  }
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
  if (!active || !active.stats || !active.stats.ttt) return true;

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
        bestTimeMs: stats.bestTimeMs || null
      }
    : {
        plays: played,
        wins: won ? (stats.wins || 0) + 1 : (stats.wins || 0),
        losses: won ? (stats.losses || 0) : (stats.losses || 0) + 1,
        draws: stats.draws || 0,
        bestMoves: won ? Math.min(stats.bestMoves || 9999, state.moveCount || 0) : stats.bestMoves || null,
        bestTimeMs: won ? Math.min(stats.bestTimeMs || 999999999, Date.now() - (state.startedAt || Date.now())) : stats.bestTimeMs || null
      });
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
        inviteId: result.inviteId || (result.result && result.result.invite && result.result.invite.id) || null,
        sessionId: result.sessionId || (result.result && result.result.session && result.result.session.id) || null,
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
        resultSavedKey: ''
      };
      tttSetOnlineStatus('Pozvánka vytvořená. Pošli odkaz spoluhráči.', 'waiting');
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
    resultSavedKey: ''
  };
  tttSetOnlineStatus('Pozvánka vytvořená lokálně. Odkaz pošli spoluhráči.', 'waiting');
  return { ok: true, code, url: tttGetInviteUrl(code), local: true };
}

async function tttJoinInviteSession(code) {
  const state = tttGetState();
  const inviteCode = String(code || '').trim().toUpperCase();
  if (!inviteCode) return { ok: false, error: new Error('Chybí kód pozvánky.') };
  const active = typeof gamesGetActiveAccount === 'function' ? gamesGetActiveAccount() : null;
  const joiner = active && active.id ? String(active.id) : null;
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.acceptGameInvite === 'function') {
    const result = await window.RotationSupabaseBridge.acceptGameInvite(inviteCode, joiner);
    if (result && result.ok) {
      state.online = {
        code: inviteCode,
        inviteId: result.inviteId || (result.result && result.result.invite && result.result.invite.id) || null,
        sessionId: result.sessionId || (result.result && result.result.session && result.result.session.id) || null,
        role: 'o',
        status: 'active',
        revision: Number(result.revision || 0) || 0,
        lastUpdatedAt: Date.now(),
        lastRemoteUpdatedAt: 0,
        dirty: false,
        pendingRevision: Number(result.revision || 0) || 0,
        playerXAccountNumber: (result.result && result.result.session && result.result.session.player_x_account_number) || null,
        playerOAccountNumber: joiner,
        connected: true,
        resultSavedKey: ''
      };
      tttSetOnlineStatus('Pozvánka přijata. Hraješ proti spoluhráči.', 'active');
      return { ok: true, code: inviteCode, result };
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
    resultSavedKey: ''
  };
  tttSetOnlineStatus('Pozvánka přijata lokálně. Odkaz načten.', 'active');
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
    status: (extraPatch && extraPatch.status) || state.message || (state.gameOver ? 'finished' : (state.online.status || 'active'))
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
          state.online.resultSavedKey = tttBuildOnlineResultKey(state.online.code, nextRevision, payload.winner || state.winner || 'draw', state.online.role || '');
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
  const replies = tttOrderedCandidates(board, mark, limit);
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
  const urgentThreatBlock = tttThreatWindowMoves(board, 'X');
  if (urgentThreatBlock.length) return urgentThreatBlock[0];
  const emergencyBlock = tttEmergencyBlockMoves(board, 'X');
  if (emergencyBlock.length) return emergencyBlock[0];
  const forcedBlock = tttCriticalThreatMoves(board, 'X');
  if (forcedBlock.length) return forcedBlock[0];
  const openThreeBlock = tttOpenThreeThreatMoves(board, 'X');
  if (openThreeBlock.length) return openThreeBlock[0];
  const openTwoBlock = tttOpenTwoThreatMoves(board, 'X');
  if (openTwoBlock.length) return openTwoBlock[0];
  const forkBlock = tttForkMove(board, 'X');
  if (forkBlock >= 0) return forkBlock;
  const ownFork = tttForkMove(board, 'O');
  if (ownFork >= 0 && (difficulty === 'ai' || difficulty === 'medium')) return ownFork;

  const occupied = board.length - free.length;
  const center = tttIndex(Math.floor(TTT_ROWS / 2), Math.floor(TTT_COLS / 2));
  if ((difficulty === 'ai' || difficulty === 'medium') && occupied <= 1 && !board[center]) {
    return center;
  }

  const isStrong = difficulty === 'ai' || difficulty === 'medium';
  if (isStrong) {
    const searchLimit = difficulty === 'ai' ? 16 : 10;
    const searchDepth = difficulty === 'ai' ? 5 : 4;
    const searchMoves = tttOrderedCandidates(board, 'O', searchLimit).slice(0, searchLimit);
    if (searchMoves.length) {
      const memo = Object.create(null);
      const deadline = (typeof performance !== 'undefined' ? performance.now() : Date.now()) + (difficulty === 'ai' ? 44 : 24);
      let bestSearchIdx = -1;
      let bestSearchScore = -Infinity;
      for (const idx of searchMoves) {
        if (board[idx]) continue;
        board[idx] = 'O';
        const immediate = tttWinner(board).winner === 'O';
        let score = immediate
          ? 10000000
          : tttSearch(board, searchDepth - 1, -Infinity, Infinity, false, memo, deadline);
        board[idx] = '';
        score += tttMoveHeuristic(board, idx, 'O') * 0.015;
        if (score > bestSearchScore) {
          bestSearchScore = score;
          bestSearchIdx = idx;
        }
      }
      if (bestSearchIdx >= 0) return bestSearchIdx;
    }
  }

  const candidates = tttCandidateMoves(board, occupied < 8 ? 1 : 1).slice(0, 10);
  const movePool = candidates.length ? candidates : free.slice(0, 14);

  if (difficulty === 'ai' || difficulty === 'medium' || difficulty === 'easy') {
    const hardBlocks = [
      ...tttCriticalThreatMoves(board, 'X'),
      ...tttThreatWindowMoves(board, 'X'),
      ...tttOpenThreeThreatMoves(board, 'X'),
      ...tttOpenTwoThreatMoves(board, 'X')
    ].filter((idx, pos, arr) => arr.indexOf(idx) === pos && !board[idx]);
    if (hardBlocks.length) {
      let bestBlock = hardBlocks[0];
      let bestBlockScore = -Infinity;
      for (const idx of hardBlocks) {
        board[idx] = 'O';
        const risk = tttOpponentForkRisk(board, 'X', 8);
        const immediate = tttWinningMove(board, 'X');
        const row = Math.floor(idx / TTT_COLS);
        const col = idx % TTT_COLS;
        let score = 0;
        score -= risk * 60000;
        if (immediate >= 0) score += 180000;
        score += Math.max(0, 120 - (Math.abs(row - Math.floor(TTT_ROWS / 2)) + Math.abs(col - Math.floor(TTT_COLS / 2))) * 8);
        board[idx] = '';
        if (score > bestBlockScore) {
          bestBlockScore = score;
          bestBlock = idx;
        }
      }
      return bestBlock;
    }
  }

  let bestIdx = movePool[0] ?? free[0];
  let bestScore = -Infinity;
  const centerRow = Math.floor(TTT_ROWS / 2);
  const centerCol = Math.floor(TTT_COLS / 2);
  const deadline = (typeof performance !== 'undefined' ? performance.now() : Date.now()) + 5;

  for (const idx of movePool) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now > deadline) break;
    if (board[idx]) continue;

    board[idx] = 'O';
    const winNow = tttWinner(board).winner === 'O';
    const oppWin = tttWinningMove(board, 'X');
    const oppForkRisk = tttOpponentForkRisk(board, 'X', 8);

    const row = Math.floor(idx / TTT_COLS);
    const col = idx % TTT_COLS;
    let score = 0;

    if (winNow) score += 1000000;
    if (oppWin >= 0) score -= 240000;
    score -= oppForkRisk * 45000;

    const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
    score += Math.max(0, 120 - distance * 18);

    let ownAdj = 0;
    let oppAdj = 0;
    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (!tttInBounds(nr, nc)) continue;
        const cell = board[tttIndex(nr, nc)];
        if (cell === 'O') ownAdj += 1;
        else if (cell === 'X') oppAdj += 1;
      }
    }
    score += ownAdj * 28;
    score += oppAdj * 20;

    const rows = [row];
    if (row > 0) rows.push(row - 1);
    if (row < TTT_ROWS - 1) rows.push(row + 1);
    const cols = [col];
    if (col > 0) cols.push(col - 1);
    if (col < TTT_COLS - 1) cols.push(col + 1);
    let localLines = 0;
    for (const r of rows) {
      for (const c of cols) {
        const idx2 = tttIndex(r, c);
        if (board[idx2] === 'O') localLines += 3;
        else if (board[idx2] === 'X') localLines -= 2;
      }
    }
    score += localLines;

    const openThreeThreat = tttOpenThreeThreatMoves(board, 'O');
    const openTwoThreat = tttOpenTwoThreatMoves(board, 'O');
    if (openThreeThreat.includes(idx)) score += 160;
    if (openTwoThreat.includes(idx)) score += 80;

    board[idx] = '';

    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }

  if (bestIdx < 0 && movePool.length) bestIdx = movePool[0];
  return bestIdx;
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
    const remembered = state.hardWinName || localStorage.getItem('tttHardWinName') || '';
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
  const fallbackName = String(gamesGetActiveAccount()?.name || state.hardWinName || localStorage.getItem('tttHardWinName') || 'Hráč').trim() || 'Hráč';
  state.hardWinName = fallbackName;
  try {
    localStorage.setItem('tttHardWinName', fallbackName);
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

  await tttRefreshHardWinRows(true);
  if (typeof tttRender === 'function') tttRender();
}

function tttRender() {
  const overlay = ensureTicTacToeOverlay();
  const state = tttGetState();
  const start = overlay.querySelector('#tttStartScreen');
  const game = overlay.querySelector('#tttGameScreen');
  const status = overlay.querySelector('#tttStatus');
  const boardEl = overlay.querySelector('#tttBoard');

  if (state.screen === 'start') {
    start.style.display = 'flex';
    game.style.display = 'none';
    start.innerHTML = [
      '<div class="tttCard">',
      '  <div class="tttSectionTitle">Režim hry</div>',
      '  <div class="tttToggleRow">',
      '    <button type="button" class="tttBtn' + (state.mode === 'ai' ? ' isActive' : '') + '" data-ttt-mode="ai">Proti AI</button>',
      '    <button type="button" class="tttBtn' + (state.mode === 'pvp' ? ' isActive' : '') + '" data-ttt-mode="pvp">Proti spoluhráči</button>',
      '  </div>',
      '</div>',
      '<div class="tttCard"' + (state.mode === 'ai' ? '' : ' style="display:none;"') + '>',
      '  <div class="tttSectionTitle">Obtížnost AI</div>',
      '  <div class="tttLevelRow">',
      '    <button type="button" class="tttBtn' + (state.difficulty === 'noob' ? ' isActive' : '') + '" data-ttt-difficulty="noob">Noob</button>',
      '    <button type="button" class="tttBtn' + (state.difficulty === 'medium' ? ' isActive' : '') + '" data-ttt-difficulty="medium">Medium</button>',
      '    <button type="button" class="tttBtn' + (state.difficulty === 'ai' ? ' isActive' : '') + '" data-ttt-difficulty="ai">AI</button>',
      '  </div>',
      '  <div class="tttNote">Hrací pole má 10 × 18 políček a vyhrává 5 spojených v řadě.</div>',
      '</div>',
      '<div class="tttCard">',
      '  <div class="tttSectionTitle">Spuštění</div>',
      state.mode === 'pvp' ? '<div id="tttInviteInfo" class="tttNote">Nejdřív vytvoř pozvánku. Odkaz pošli spoluhráči až potom.</div><div class="tttToggleRow"><button type="button" class="tttBtn" id="tttCreateInviteBtn">Vytvořit pozvánku</button><button type="button" class="tttBtn" id="tttJoinInviteBtn">Přijmout pozvánku</button></div><div class="tttCard" style="margin-top:10px;padding:10px 12px;"><div class="tttSectionTitle" style="margin-bottom:6px;">Odkaz na hru</div><div class="tttNote" id="tttInviteUrl" style="word-break:break-all;display:none;"></div><div class="tttToggleRow" style="margin-top:8px;grid-template-columns:1fr 1fr;"><button type="button" class="tttBtn" id="tttCopyInviteBtn">Kopírovat odkaz</button><button type="button" class="tttBtn" id="tttShareInviteBtn">Sdílet</button></div></div>' : '',
      '  <button type="button" class="tttBtn" id="tttStartBtn" style="width:100%;">' + (state.mode === 'pvp' ? 'Spustit duel' : 'Hrát') + '</button>',
      '</div>',
      '<div class="tttCard tttWinHistory">',
      '  <div class="tttSectionTitle">Kdo porazil nejtvrdší AI</div>',
      '  <div class="tttNote">Žebříček je online přes Supabase.</div>',
      '  ' + tttBuildHardWinTableHtml(),
      '</div>'
    ].join('');

    start.querySelectorAll('[data-ttt-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.mode = btn.getAttribute('data-ttt-mode') || 'ai';
        if (state.mode === 'pvp') state.difficulty = 'ai';
        tttRender();
        scheduleTttLayout();
      });
    });
    start.querySelectorAll('[data-ttt-difficulty]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.mode === 'pvp') return;
        state.difficulty = btn.getAttribute('data-ttt-difficulty') || 'ai';
        tttRender();
        scheduleTttLayout();
      });
    });
    let lastInviteUrl = '';
    const copyInviteUrl = async () => {
      if (!lastInviteUrl) return;
      try {
        await navigator.clipboard.writeText(lastInviteUrl);
      } catch (err) {
        console.warn('TTT copy invite failed', err);
      }
    };
    start.querySelector('#tttCreateInviteBtn')?.addEventListener('click', async () => {
      try {
        const result = await tttCreateInviteSession();
        const info = start.querySelector('#tttInviteInfo');
        const urlEl = start.querySelector('#tttInviteUrl');
        const copyBtn = start.querySelector('#tttCopyInviteBtn');
        const shareBtn = start.querySelector('#tttShareInviteBtn');
        if (result && result.ok) {
          lastInviteUrl = result.url || '';
          if (info) info.textContent = 'Pozvánka připravená. Odkaz pošli spoluhráči.';
          if (urlEl) {
            urlEl.style.display = 'block';
            urlEl.textContent = result.url;
          }
          if (copyBtn) copyBtn.disabled = !lastInviteUrl;
          if (shareBtn) shareBtn.disabled = !lastInviteUrl;
          try { await navigator.clipboard.writeText(result.url); } catch (e) {}
          if (shareBtn && result.url) {
            shareBtn.addEventListener('click', async () => {
              try {
                if (navigator.share) {
                  await navigator.share({ title: 'Piškvorky', text: 'Přidej se do hry:', url: result.url });
                } else {
                  await copyInviteUrl();
                }
              } catch (err) {
                await copyInviteUrl();
              }
            }, { once: true });
          }
          if (copyBtn) copyBtn.addEventListener('click', () => { void copyInviteUrl(); if (info) info.textContent = 'Odkaz na pozvánku je zkopírovaný ve schránce.'; }, { once: true });
          state.screen = 'game';
          state.gameOver = false;
          state.winner = null;
          state.board = Array(TTT_TOTAL_CELLS).fill('');
          state.turn = 'X';
          state.message = 'Čekám na přijetí pozvánky.';
          tttRender();
          scheduleTttLayout();
          tttStartOnlineSyncLoop();
        }
      } catch (err) {
        console.warn('TTT create invite failed', err);
      }
    });
    start.querySelector('#tttJoinInviteBtn')?.addEventListener('click', async () => {
      const code = prompt('Zadej kód pozvánky');
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
      state.message = state.mode === 'pvp'
        ? (state.online && state.online.status === 'waiting' ? 'Čekám na přijetí pozvánky.' : 'Hraje hráč X.')
        : 'Hraješ za X. AI je O.';
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

  start.style.display = 'none';
  game.style.display = 'flex';
  status.textContent = state.message || state.onlineStatus || (state.mode === 'pvp' ? 'Hraje hráč X.' : 'Hraješ za X. AI je O.');

  const result = tttWinner(state.board);
  const winnerLine = result.line || [];
  boardEl.innerHTML = state.board.map((cell, idx) => {
    const classes = ['tttCell'];
    if (cell) {
      classes.push('isFilled');
      if (cell === 'X') classes.push('isX');
      if (cell === 'O') classes.push('isO');
    }
    if (winnerLine.includes(idx)) classes.push('isWinner');
    return '<button type="button" class="' + classes.join(' ') + '" data-ttt-cell="' + idx + '">' + (cell || '') + '</button>';
  }).join('');

  boardEl.querySelectorAll('[data-ttt-cell]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-ttt-cell') || '', 10);
      if (!Number.isFinite(idx)) return;
      tttHandleMove(idx);
    });
  });



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
    if (after.winner === 'draw') {
      state.message = 'Remíza. Dobře hrané.';
      if (typeof gamesRecordStat === 'function') {
        gamesRecordStat('ttt', {
          plays: (gamesGetActiveAccount()?.stats.ttt.plays || 0) + 1,
          draws: (gamesGetActiveAccount()?.stats.ttt.draws || 0) + 1,
          bestMoves: gamesGetActiveAccount()?.stats.ttt.bestMoves || null,
          bestTimeMs: gamesGetActiveAccount()?.stats.ttt.bestTimeMs || null
        });
      }
    } else if (after.winner === 'X') {
      state.message = 'Vyhrál jsi.';
      if (typeof gamesRecordStat === 'function') {
        gamesRecordStat('ttt', {
          plays: (gamesGetActiveAccount()?.stats.ttt.plays || 0) + 1,
          wins: (gamesGetActiveAccount()?.stats.ttt.wins || 0) + 1,
          bestMoves: Math.min(gamesGetActiveAccount()?.stats.ttt.bestMoves || 9999, state.moveCount || 0),
          bestTimeMs: Math.min(gamesGetActiveAccount()?.stats.ttt.bestTimeMs || 999999999, Date.now() - (state.startedAt || Date.now()))
        });
      }
      if (state.mode === 'ai' && state.difficulty === 'ai') {
        state.hardWinStats = tttReadHardWinStats();
        void tttSubmitHardWin();
        return;
      }
    } else {
      state.message = 'Vyhrála O.';
      if (typeof gamesRecordStat === 'function') {
        gamesRecordStat('ttt', {
          plays: (gamesGetActiveAccount()?.stats.ttt.plays || 0) + 1,
          losses: (gamesGetActiveAccount()?.stats.ttt.losses || 0) + 1
        });
      }
    }
    tttRender();
    scheduleTttLayout();
    if (state.mode === 'pvp' && state.online && state.online.code) {
      void tttPushOnlineSession({ status: 'finished', gameOver: true, winner: after.winner, winnerRole: after.winner, finishedAt: Date.now() });
      tttMaybeRecordOnlineResult(after.winner);
    }
    return;
  }

  if (state.mode === 'pvp') {
    state.turn = state.turn === 'X' ? 'O' : 'X';
    state.message = state.online && state.online.status === 'waiting'
      ? 'Čekám na přijetí pozvánky.'
      : (state.turn === 'X' ? 'Hraje hráč X.' : 'Hraje hráč O.');
    tttRender();
    scheduleTttLayout();
    if (state.online && state.online.code) {
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
        fresh.message = afterAi.winner === 'draw'
          ? 'Remíza. Dobře hrané.'
          : 'AI vyhrála. Zkus to znovu.';
        if (typeof gamesRecordStat === 'function') {
          const active = gamesGetActiveAccount();
          if (active) {
            gamesRecordStat('ttt', {
              plays: (active.stats.ttt.plays || 0) + 1,
              losses: (active.stats.ttt.losses || 0) + 1
            });
          }
        }
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
  state.board = Array(TTT_TOTAL_CELLS).fill('');
  state.turn = 'X';
  state.gameOver = false;
  state.winner = null;
  state.startedAt = 0;
  state.moveCount = 0;
  state.moveCountX = 0;
  state.moveCountO = 0;
  state.lastMoveIndex = null;
  state.lastMoveMark = null;
  state.hardWinPrompt = false;
  state.hardWinStats = null;
  state.message = state.mode === 'pvp' ? 'Hraje hráč X.' : 'Hraješ za X. AI je O.';
  if (!keepScreen) state.screen = 'start';
  tttRender();
  scheduleTttLayout();
  if (state.mode === 'pvp' && state.online && state.online.code) {
    state.online.dirty = true;
    state.online.pendingRevision = Math.max(Number(state.online.pendingRevision || 0) || 0, Number(state.online.revision || 0) || 0) + 1;
    void tttPushOnlineSession({ status: state.online.status || 'waiting', gameOver: false, winner: null, winnerRole: null, finishedAt: null, moveCount: 0, moveCountX: 0, moveCountO: 0, lastMoveIndex: null, lastMoveMark: null });
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
  const hasOnlineSession = !!(state.online && state.online.code);
  if (!hasOnlineSession) {
    state.screen = 'start';
    state.board = Array(TTT_TOTAL_CELLS).fill('');
    state.turn = 'X';
    state.gameOver = false;
    state.winner = null;
    state.startedAt = 0;
    state.moveCount = 0;
    state.moveCountX = 0;
    state.moveCountO = 0;
    state.lastMoveIndex = null;
    state.lastMoveMark = null;
    state.hardWinPrompt = false;
    state.hardWinStats = null;
    state.message = '';
  } else {
    state.screen = 'game';
    state.message = state.message || (state.online.status === 'waiting' ? 'Čekám na přijetí pozvánky.' : 'Připojuji probíhající duel.');
  }
  overlay.classList.add('isVisible');
  document.body.classList.add('tttOpen');
  if (hasOnlineSession) {
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
  const styles = window.getComputedStyle(board);
  const gap = parseFloat(styles.gap || styles.columnGap || '0') || 0;
  const cellW = Math.floor((wrapRect.width - gap * (TTT_COLS - 1)) / TTT_COLS);
  const cellH = Math.floor((wrapRect.height - gap * (TTT_ROWS - 1)) / TTT_ROWS);
  const cell = Math.max(10, Math.min(cellW, cellH));

  board.style.setProperty('--tttCellSize', cell + 'px');
  board.style.gridTemplateColumns = `repeat(${TTT_COLS}, ${cell}px)`;
  board.style.gridTemplateRows = `repeat(${TTT_ROWS}, ${cell}px)`;
  board.style.width = (cell * TTT_COLS + gap * (TTT_COLS - 1)) + 'px';
  board.style.height = (cell * TTT_ROWS + gap * (TTT_ROWS - 1)) + 'px';
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


function buildAppHistoryHtml(versionText) {
  const fallbackSections = [
    {
      range: 'v.1(345)–v.1(350)',
      title: 'Herní polish a freeze cleanup',
      lines: [
        'Hry jsou kompaktnější, mobilnější a bez zbytečných ovládacích křížů.',
        'Piškvorky mají online sync, top 10 leaderboardy a tvrdší AI blokování.',
        'Supabase dostal další cleanup, indexy pro herní lookupy a bezpečnější napojení.',
        'Changelog je zkrácený do větších milníků místo dlouhého seznamu každé verze.'
      ]
    },
    {
      range: 'v.1(323)–v.1(344)',
      title: 'Stabilizace a hry',
      lines: [
        'Stabilizovala se herní sekce, invite flow a herní statistiky.',
        'Přibyly 2048, Snake a Flap Bird v mobilním layoutu.',
        'Spodní lišta, přihlášení a online/offline sync dostaly kompaktnější chování.',
        'Inline skripty se začaly rozdělovat do samostatných modulů.'
      ]
    },
    {
      range: 'v.1(310)–v.1(322)',
      title: 'PWA, offline a herní základ',
      lines: [
        'Service worker, manifest a offline fallback se ustálily do PWA základu.',
        'Přibyly online/offline refresh hooky a sync queue.',
        'Rotace a kalkulačky se dál refaktorovaly do stabilnějšího runtime.'
      ]
    },
    {
      range: 'v.1(291)–v.1(309)',
      title: 'Dashboard polish a rotace',
      lines: [
        'Dashboard dostal čistší loading stavy a menší vizuální chaos.',
        'Piškvorky se průběžně ladily proti zamrznutí po tahu AI.',
        'Layout aplikace se dál zjemňoval pro mobil.'
      ]
    },
    {
      range: 'v.1(250)–v.1(289)',
      title: 'Aktuální úpravy',
      lines: [
        'Jídelna a kantýna se sjednocovaly do přehlednějšího zobrazení.',
        'Dashboard ukazoval další směny, absenci a procenta průběhu.',
        'Kalkulačky pro frézky a brusy se postupně zpřesňovaly.'
      ]
    }
  ];

  const sections = Array.isArray(window.APP_CHANGELOG_SECTIONS) && window.APP_CHANGELOG_SECTIONS.length
    ? window.APP_CHANGELOG_SECTIONS
    : fallbackSections;

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

function getAdminMonthEditorValue(monthKey) {
  const key = monthKey || getAdminSelectedMonthKey();
  const month = key && app.rotation && app.rotation.months ? app.rotation.months[key] : null;
  return month ? JSON.stringify(month, null, 2) : '';
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
    '  <td><input class="appMenuInlineInput" data-rot-field="date" value="' + escapeHtml(date) + '" placeholder="datum"></td>',
    cells.map((value, idx) => '<td><input class="appMenuInlineInput appMenuInlineInputTiny" data-rot-field="cell-' + String(idx) + '" value="' + escapeHtml(value) + '" placeholder="' + escapeHtml(String(idx + 1)) + '"></td>').join(''),
    '</tr>'
  ].join('');
}

function adminNotesRowTemplate(row, rowIndex, allowBlankTail) {
  const note = row || {};
  const date = String(note.date || '').trim();
  const person = String(note.person || '').trim();
  const code = String(note.code || '').trim();
  const text = String(note.text || '').trim();
  const shift = String(note.shift || '').trim();
  const hasAny = !!(date || person || code || text || shift);
  if (!hasAny && !allowBlankTail) return '';
  return [
    '<tr data-note-row-index="' + String(rowIndex) + '">',
    '  <td><input class="appMenuInlineInput" data-note-field="date" value="' + escapeHtml(date) + '" placeholder="datum"></td>',
    '  <td><input class="appMenuInlineInput" data-note-field="person" value="' + escapeHtml(person) + '" placeholder="jméno"></td>',
    '  <td><input class="appMenuInlineInput" data-note-field="code" value="' + escapeHtml(code) + '" placeholder="kód"></td>',
    '  <td><input class="appMenuInlineInput" data-note-field="shift" value="' + escapeHtml(shift) + '" placeholder="směna"></td>',
    '  <td><input class="appMenuInlineInput" data-note-field="text" value="' + escapeHtml(text) + '" placeholder="poznámka"></td>',
    '</tr>'
  ].join('');
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
    { machine_key: 'TBKR07-AH', machine_code: 'TBKR07', machine_index: 'AH', label: 'TBKR07-AH', category: 'brus', cycle_time: '63.0', dress_time: '240', dress_count: '65', settings_json: { machine: 'TBKR07', index: 'AH', cycle_time: '63.0', dress_time: '240', dress_count: '65' } },
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
    '  <div class="tableWrap appMenuTableWrap" style="margin-top:12px;">',
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
    const withBlank = notesRows.concat([ { date: '', person: '', code: '', shift: '', text: '' } ]);
    return withBlank.map((row, idx) => adminNotesRowTemplate(row, idx, true)).join('');
  };

  return [
    '<div class="appMenuSubSection" id="adminRotationEditor">',
    '  <div class="appMenuSubTitle">Rozpis – ' + escapeHtml(monthKey) + '</div>',
    '  <div class="appMenuText">Stejný rozpis, jen editovatelný. Vyplňuj rovnou v mřížce, jako bys upravoval samotný rozpis. Prázdné řádky se při uložení ignorují.</div>',
    '  <div class="tableWrap appMenuTableWrap">',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense">',
    '      <thead><tr><th colspan="' + String(1 + hardMachines.length) + '">Tvrdota</th></tr><tr><th>Datum</th>' + hardMachines.map(m => '<th>' + escapeHtml(m) + '</th>').join('') + '</tr></thead>',
    '      <tbody>' + renderRows('hard', hardRows, hardMachines.length) + '</tbody>',
    '    </table>',
    '  </div>',
    '  <div class="tableWrap appMenuTableWrap">',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense">',
    '      <thead><tr><th colspan="' + String(1 + softMachines.length) + '">Měkota</th></tr><tr><th>Datum</th>' + softMachines.map(m => '<th>' + escapeHtml(m) + '</th>').join('') + '</tr></thead>',
    '      <tbody>' + renderRows('soft', softRows, softMachines.length) + '</tbody>',
    '    </table>',
    '  </div>',
    '  <div class="tableWrap appMenuTableWrap">',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense">',
    '      <thead><tr><th>Datum</th><th>Jméno</th><th>Kód</th><th>Směna</th><th>Poznámka</th></tr></thead>',
    '      <tbody>' + renderNotes() + '</tbody>',
    '    </table>',
    '  </div>',
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
    const note = {
      date: get('date'),
      person: get('person'),
      code: get('code'),
      shift: get('shift'),
      text: get('text')
    };
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
    '<div class="appMenuCard appMenuAdminCard">',
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
    '  <label class="appMenuLabel" for="adminMonthSelect">Měsíc</label>',
    '  <select id="adminMonthSelect" class="appMenuSelect">' + months.map(m => '<option value="' + escapeHtml(m) + '"' + (m === monthKey ? ' selected' : '') + '>' + escapeHtml(m) + '</option>').join('') + '</select>',
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
}


function bindAppMenuHandlers(body) {
  if (!body || body.dataset.menuHandlersBound === '1') return;
  body.dataset.menuHandlersBound = '1';

  body.addEventListener('click', async (event) => {
    const target = event.target && typeof event.target.closest === 'function'
      ? event.target.closest('[data-menu-action], [data-admin-action], [data-ui-pref], [data-ui-reset], [data-menu-back]')
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

    try {
      if (menuBack) {
        openAppMenu('menu');
        return;
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
      if (menuAction === 'admin-export') {
        openAppMenu('admin-export');
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
    if (v === 'about') {
      body.innerHTML = [
        '<div class="appMenuCard">',
        '  <div class="appMenuCardTitle">O aplikaci</div>',
        '  <div class="appMenuVersion">' + escapeHtml(versionText || '—') + '</div>',
        '  <div class="appMenuText">',
        '    <div>Aktuální verze je nahoře, starší novinky jsou pod ní od nejnovějších po nejstarší.</div>',
        '    <div>Import i export jsou schované v administraci, aby zbytek aplikace působil čistě.</div>',
        '  </div>',
        '  ' + buildAppHistoryHtml(versionText),
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
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
      body.innerHTML = [
        '<div class="appMenuCard appMenuSettingsCard">',
        '  <div class="appMenuCardTitle">Nastavení</div>',
        '  <div class="appMenuText">',
        '    <div>Kompaktní režim a méně animací se ukládají jen do tohoto zařízení.</div>',
        '  </div>',
        '  <div class="appMenuSettingsList">',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-ui-pref="compact">' + (prefs.compact ? '✓ ' : '') + 'Kompaktní režim</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-ui-pref="reduceMotion">' + (prefs.reduceMotion ? '✓ ' : '') + 'Méně animací</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-ui-reset="1">Obnovit výchozí nastavení</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-menu-action="reset-state">Smazat lokální data</button>',
        '  </div>',
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
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
  if (typeof app !== 'undefined') {
    app.homeBootSuppressed = id !== 'home';
  }
  window.__rotaceManualNavLocked = id !== 'home';
  window.__rotaceHomeBootLocked = id !== 'home';
  window.__rotaceUserNavigated = id !== 'home';
  if (id !== 'home') window.__rotaceHomeBootLocked = true;

  const navPage = id === 'rotace'
    ? 'rotace'
    : (id === 'brusy' || id === 'soustruhy' || id === 'frezky' || id === 'kalkulacky')
      ? 'kalkulacky'
      : (id === 'jidlo' ? 'home' : id);

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
  }
}

function openRotaceNames() {

  showPage('rotace');
  setRotaceView('names');
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

function refreshHomeScreen() {
  try {
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
}

function scheduleHomeRefresh() {
  const run = () => refreshHomeScreen();
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      run();
      requestAnimationFrame(() => {
        run();
        requestAnimationFrame(run);
      });
    });
  } else {
    setTimeout(run, 0);
    setTimeout(run, 120);
  }
  setTimeout(run, 240);
  setTimeout(run, 480);
  setTimeout(run, 900);
  setTimeout(run, 1500);
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

  if (!document.body.dataset.foodModalKeydownBound) {
    document.body.dataset.foodModalKeydownBound = '1';
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') hideFoodScheduleModal();
    });
  }

  document.body.appendChild(overlay);
  return overlay;
}


// -------------------------
// Games hub + account profile
// -------------------------
const GAMES_PROFILE_KEY = APP_KEY + ':games_profile_v1';
const GAMES_ACCOUNT_LIST = [
  { id: '1883', name: 'Střížek Jan' },
  { id: '2652', name: 'Kmínek Michal' },
  { id: '2202', name: 'Novotný Miroslav' },
  { id: '2602', name: 'Třasák Marek' },
  { id: '9811', name: 'Špadrna Martin' },
  { id: '1496', name: 'Kříž Pavel' },
  { id: '4789', name: 'Synek Jan' },
  { id: '3037', name: 'Pech Lukáš' },
  { id: '3808', name: 'Starý Pavel' },
  { id: '6235', name: 'Blažek Ladislav' }
];

function gamesDefaultProfile() {
  const accounts = {};
  GAMES_ACCOUNT_LIST.forEach(acc => {
    accounts[acc.id] = {
      id: acc.id,
      name: acc.name,
      stats: {
        ttt: { plays: 0, wins: 0, losses: 0, draws: 0, bestMoves: null, bestTimeMs: null },
        g2048: { plays: 0, bestScore: 0, bestTile: 0 },
        snake: { plays: 0, bestScore: 0, bestLength: 0 },
        flap: { plays: 0, bestScore: 0, bestPipes: 0 }
      },
      achievements: [],
      updatedAt: 0
    };
  });
  return { activeAccountId: '', accounts };
}

function gamesLoadProfile() {
  try {
    const raw = localStorage.getItem(GAMES_PROFILE_KEY);
    if (!raw) return gamesDefaultProfile();
    const parsed = JSON.parse(raw);
    const base = gamesDefaultProfile();
    base.activeAccountId = String(parsed.activeAccountId || '').trim();
    const srcAccounts = parsed.accounts && typeof parsed.accounts === 'object' ? parsed.accounts : {};
    GAMES_ACCOUNT_LIST.forEach(acc => {
      const incoming = srcAccounts[acc.id] || {};
      base.accounts[acc.id] = {
        id: acc.id,
        name: acc.name,
        stats: {
          ttt: Object.assign({ plays: 0, wins: 0, losses: 0, draws: 0, bestMoves: null, bestTimeMs: null }, incoming.stats && incoming.stats.ttt ? incoming.stats.ttt : {}),
          g2048: Object.assign({ plays: 0, bestScore: 0, bestTile: 0 }, incoming.stats && incoming.stats.g2048 ? incoming.stats.g2048 : {}),
          snake: Object.assign({ plays: 0, bestScore: 0, bestLength: 0 }, incoming.stats && incoming.stats.snake ? incoming.stats.snake : {}),
          flap: Object.assign({ plays: 0, bestScore: 0, bestPipes: 0 }, incoming.stats && incoming.stats.flap ? incoming.stats.flap : {})
        },
        achievements: Array.isArray(incoming.achievements) ? incoming.achievements.slice(0, 20) : [],
        updatedAt: Number(incoming.updatedAt || 0) || 0
      };
    });
    if (!base.activeAccountId || !base.accounts[base.activeAccountId]) {
      base.activeAccountId = '';
    }
    return base;
  } catch (err) {
    console.warn('gamesLoadProfile failed', err);
    return gamesDefaultProfile();
  }
}

function gamesSaveProfile(profile) {
  try {
    localStorage.setItem(GAMES_PROFILE_KEY, JSON.stringify(profile));
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

function gamesAccountById(accountId) {
  return GAMES_ACCOUNT_LIST.find(acc => acc.id === String(accountId || '').trim()) || null;
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
    cardEl.style.display = next ? 'none' : '';
  }
  nameEl.textContent = next ? next.name : 'Bez přihlášení';
  hintEl.textContent = next
    ? 'Přihlášeno. Statistiky se ukládají pod tímto číslem.'
    : 'Bez účtu můžeš hrát dál. Statistiky se ukládají jen po přihlášení číslem.';
  entryRow.style.display = next ? 'none' : '';
  hintEl.style.display = 'none';
  currentEl.style.display = next ? 'flex' : 'none';
  currentEl.textContent = next ? ('Přihlášeno jako ' + next.name + ' · ' + next.id) : '';
  if (next) inputEl.value = '';
  clearBtn.textContent = next ? 'Odhlásit' : 'Bez účtu';
  gamesRenderActiveAccountBar(next);
}

function gamesRenderActiveAccountBar(account) {
  const bar = document.getElementById('gamesActiveAccountBar');
  const textEl = document.getElementById('gamesActiveAccountText');
  const clearBtn = document.getElementById('gamesActiveAccountClearBtn');
  if (!bar || !textEl || !clearBtn) return;

  const active = account || null;
  bar.hidden = !active;
  bar.classList.toggle('isVisible', !!active);
  textEl.textContent = active ? ('Přihlášeno jako ' + active.name + ' · ' + active.id) : '';

  if (!clearBtn.dataset.bound) {
    clearBtn.dataset.bound = '1';
    clearBtn.addEventListener('click', () => {
      gamesClearActiveAccount();
      renderGamesHub();
    });
  }
}


function gamesSetActiveAccount(accountId) {
  const profile = gamesGetProfile();
  if (!profile.accounts[accountId]) return false;
  profile.activeAccountId = String(accountId);
  gamesSaveProfile(profile);
  app.gamesProfile = profile;
  const active = profile.accounts[profile.activeAccountId] || null;
  gamesApplyActiveAccountUI(active);
  gamesRenderStats();
  renderGamesHub();
  return true;
}

function gamesClearActiveAccount() {
  const profile = gamesGetProfile();
  profile.activeAccountId = '';
  gamesSaveProfile(profile);
  app.gamesProfile = profile;
  gamesApplyActiveAccountUI(null);
  gamesRenderStats();
  renderGamesHub();
}

function gamesStatLine(label, value) {
  return '<div class="gamesStatCard"><div class="gamesStatLabel">' + escapeHtml(label) + '</div><div class="gamesStatValue">' + escapeHtml(String(value)) + '</div></div>';
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
      const found = gamesAccountById(inputEl.value);
      if (found) {
        try {
          gamesSetActiveAccount(found.id);
        } catch (err) {
          console.warn('games account save failed', err);
        }
        syncVisibleAccount(found);
        gamesApplyActiveAccountUI(found);
        gamesRenderStats();
        requestAnimationFrame(() => {
          gamesRenderAccountChips();
          gamesRenderStats();
        });
        return;
      }
      syncVisibleAccount(null);
      hintEl.textContent = inputEl.value.trim()
        ? 'Neplatné číslo účtu. Hraješ bez přihlášení.'
        : 'Bez účtu můžeš hrát dál. Statistiky se ukládají jen po přihlášení číslem.';
      inputEl.focus();
    };
    inputEl.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') { ev.preventDefault(); void submit(); }
    });
    confirmBtn.addEventListener('click', () => { void submit(); });
    clearBtn.addEventListener('click', () => {
      inputEl.value = '';
      gamesClearActiveAccount();
      syncVisibleAccount(null);
      hintEl.textContent = 'Bez účtu můžeš hrát dál. Statistiky se ukládají jen po přihlášení číslem.';
    });
  }
}

function gamesRenderStats() {
  const grid = document.getElementById('gamesStatsGrid');
  if (!grid) return;
  const profile = gamesGetProfile();
  const accounts = Object.values(profile.accounts || {}).sort((a, b) => {
    const ai = Number(a && a.id ? a.id : 0) || 0;
    const bi = Number(b && b.id ? b.id : 0) || 0;
    return ai - bi;
  });
  const activeId = profile.activeAccountId;

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
      return '<div class="gamesStatsCard' + (String(acc.id) === String(activeId) ? ' isActive' : '') + '">' +
        '<div class="gamesStatsCardHead">' +
          '<div>' +
            '<div class="gamesStatsCardName">' + escapeHtml(acc.name || '') + '</div>' +

          '</div>' +
          '<div class="gamesStatsCardTotal">' + String(totalPlays) + ' her</div>' +
        '</div>' +
        '<div class="gamesStatsCardBody">' + lines + '</div>' +
      '</div>';
    }).join('');
  }
}

function renderGamesHub() {
  gamesGetProfile();
  gamesRenderAccountChips();
  gamesRenderStats();
  void gamesRefreshRemoteLeaderboards();
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
  gamesStopActiveLoops();
  app.activeGameShell = gameId;
  if (gameId === 'ttt') {
    openTicTacToeGame();
    return;
  }
  document.body.classList.add('gamesOpen');
  renderGameShell(gameId);
}

function closeGameShell() {
  gamesStopActiveLoops();
  app.activeGameShell = '';
  document.body.classList.remove('gamesOpen');
  renderGamesHub();
}

function renderGameShell(gameId) {
  const stage = document.getElementById('gamesStage');
  if (!stage) return;
  const titleMap = { ttt: 'Piškvorky', '2048': '2048', snake: 'Snake', flap: 'Flap Bird' };
  const title = titleMap[gameId] || 'Hra';
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
  active.updatedAt = Date.now();
  if (gameId === 'ttt') {
    active.stats.ttt = Object.assign({}, active.stats.ttt, patch);
  } else if (gameId === '2048') {
    active.stats.g2048 = Object.assign({}, active.stats.g2048, patch);
  } else if (gameId === 'snake') {
    active.stats.snake = Object.assign({}, active.stats.snake, patch);
  } else if (gameId === 'flap') {
    active.stats.flap = Object.assign({}, active.stats.flap, patch);
  }
  gamesSaveProfile(profile);
  gamesRenderStats();
  void gamesSyncStatOnline(gameId, patch);
  void gamesRefreshRemoteLeaderboards(gameId);
}


function gamesNormalizeRemoteLeaderboardRows(gameId, rows, limit = 10) {
  const key = String(gameId || '').trim();
  return (Array.isArray(rows) ? rows : [])
    .map((row) => {
      const accountNumber = String(row && (row.account_number ?? row.accountNumber ?? row.id) ? (row.account_number ?? row.accountNumber ?? row.id) : '').trim();
      const name = String(row && (row.player_name ?? row.full_name ?? row.name) ? (row.player_name ?? row.full_name ?? row.name) : accountNumber || '').trim();
      const points = Number(row && (row.points ?? row.best_score ?? row.bestScore ?? row.value) ? (row.points ?? row.best_score ?? row.bestScore ?? row.value) : 0) || 0;
      const updatedAt = String(row && (row.updated_at ?? row.last_played_at ?? row.created_at) ? (row.updated_at ?? row.last_played_at ?? row.created_at) : '').trim();
      return {
        id: accountNumber || name,
        name: name || accountNumber || 'Hráč',
        value: points,
        updatedAt,
        gameId: key
      };
    })
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value || String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')) || String(a.name || '').localeCompare(String(b.name || ''), 'cs'))
    .slice(0, limit);
}

async function gamesRefreshRemoteLeaderboards(gameId) {
  if (!window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.loadGameStats !== 'function') return [];
  const ids = gameId ? [gameId] : ['ttt', '2048', 'snake', 'flap'];
  app.gamesLeaderboardCache = app.gamesLeaderboardCache || { ttt: [], '2048': [], snake: [], flap: [] };
  try {
    const results = await Promise.all(ids.map(async (id) => {
      try {
        const rows = await window.RotationSupabaseBridge.loadGameStats(id, 10);
        const normalized = gamesNormalizeRemoteLeaderboardRows(id, rows, 10);
        app.gamesLeaderboardCache[id] = normalized;
        return { id, rows: normalized };
      } catch (err) {
        console.warn('games leaderboard refresh failed', id, err);
        return { id, rows: app.gamesLeaderboardCache[id] || [] };
      }
    }));
    if (!gameId) {
      if (app.activeGameShell) {
        renderGameShell(app.activeGameShell);
      } else {
        gamesRenderStats();
      }
    } else if (app.activeGameShell === gameId) {
      renderGameShell(gameId);
    } else if (!app.activeGameShell) {
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
    return await window.RotationSupabaseBridge.saveGameStat({
      account_number: String(account.id || '').trim(),
      player_name: String(account.name || '').trim(),
      game_type: String(gameId || '').trim(),
      games_played: Number(patch && patch.games_played !== undefined ? patch.games_played : (patch && patch.plays !== undefined ? patch.plays : 0)) || 0,
      wins: Number(patch && patch.wins !== undefined ? patch.wins : 0) || 0,
      losses: Number(patch && patch.losses !== undefined ? patch.losses : 0) || 0,
      draws: Number(patch && patch.draws !== undefined ? patch.draws : 0) || 0,
      points: Number(patch && patch.points !== undefined ? patch.points : (patch && patch.bestScore !== undefined ? patch.bestScore : 0)) || 0
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
  return accounts.map((acc) => ({
    id: acc.id,
    name: acc.name || ('Hráč ' + String(acc.id || '')),
    value: getValue(acc)
  })).filter((row) => row.value > 0).sort((a, b) => b.value - a.value || String(a.name).localeCompare(String(b.name), 'cs')).slice(0, limit);
}


function gamesTop3Block(gameId, label, limit = 10) {
  const rows = gamesGetGameLeaderboard(gameId, limit);
  const body = rows.length ? rows.map((row, idx) => (
    '<div class="gamesTop3Row">' +
      '<div class="gamesTop3Rank">' + String(idx + 1) + '.</div>' +
      '<div class="gamesTop3Name">' + escapeHtml(row.name) + '</div>' +
      '<div class="gamesTop3Value">' + String(row.value) + ' ' + escapeHtml(label) + '</div>' +
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
  if (app.gamesSnake && app.gamesSnake.timer) {
    clearInterval(app.gamesSnake.timer);
    app.gamesSnake.timer = null;
  }
  if (app.gamesFlap && app.gamesFlap.timer) {
    cancelAnimationFrame(app.gamesFlap.timer);
    app.gamesFlap.timer = null;
  }
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
    if (Math.max(absX, absY) < 24) return;
    if (absX > absY && absY < 48) {
      onSwipe(dx > 0 ? 'right' : 'left');
    } else if (absY > absX && absX < 48) {
      onSwipe(dy > 0 ? 'down' : 'up');
    }
  };

  const usePointer = 'PointerEvent' in window;
  if (usePointer) {
    el.addEventListener('pointerdown', (ev) => {
      if (ev.pointerType && ev.pointerType !== 'touch' && ev.pointerType !== 'pen') return;
      startX = ev.clientX;
      startY = ev.clientY;
      active = true;
    }, { passive: true });

    el.addEventListener('pointerup', (ev) => {
      if (ev.pointerType && ev.pointerType !== 'touch' && ev.pointerType !== 'pen') return;
      finish(ev.clientX, ev.clientY);
    }, { passive: true });

    el.addEventListener('pointercancel', () => {
      active = false;
    }, { passive: true });
  } else {
    el.addEventListener('touchstart', (ev) => {
      if (!ev.touches || ev.touches.length !== 1) return;
      const touch = ev.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      active = true;
    }, { passive: true });

    el.addEventListener('touchend', (ev) => {
      const touch = ev.changedTouches && ev.changedTouches[0];
      if (!touch) return;
      finish(touch.clientX, touch.clientY);
    }, { passive: true });

    el.addEventListener('touchcancel', () => {
      active = false;
    }, { passive: true });
  }
}
const SNAKE_JOYSTICK_KEY = APP_KEY + ':snake_joystick_v1';

function snakeLoadJoystickEnabled() {
  try {
    return localStorage.getItem(SNAKE_JOYSTICK_KEY) === '1';
  } catch (err) {
    return false;
  }
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
    localStorage.setItem(SNAKE_JOYSTICK_KEY, enabled ? '1' : '0');
  } catch (err) {}
  renderGameSnake();
}

function snakeBuildJoystickMarkup(isOn) {
  return [
    '<div class="snakeJoystickDock' + (isOn ? ' isOn' : '') + '" id="snakeJoystickDock">',
    '  <button type="button" class="gameControlBtn snakeJoystickToggle" id="snakeJoystickToggleBtn" aria-label="Zapnout nebo vypnout joystick">Joy</button>',
    '  <div class="gamePad snakeJoystickPad" id="snakeJoystickPad" aria-label="Joystick hada">',
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
  const toggle = root.querySelector('#snakeJoystickToggleBtn');
  const pad = root.querySelector('#snakeJoystickPad');

  if (toggle && !toggle.dataset.bound) {
    toggle.dataset.bound = '1';
    toggle.addEventListener('click', () => snakeSetJoystickEnabled(!snakeIsJoystickEnabled()));
  }

  if (!dock || !pad || !snakeIsJoystickEnabled()) return;
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
    btn.addEventListener('click', () => handler(btn.dataset.gameDir));
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
    '  <div class="gameControls" style="margin-top:2px;">',
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
  const boardSize = gamesFitSquareSize({ min: compact ? 250 : 266, max: Math.min(compact ? 540 : 480, gamesViewportSize().width - (compact ? 14 : 20)), reserve: compact ? 176 : 192, shellPad: compact ? 6 : 10 });
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
    '<div class="gamesGamePanel">',
    '  <div class="gameInfoRow gameInfoRowCompact gameInfoRowDense"><span>Skóre <strong>' + state.score + '</strong></span><span>Nejdelší <strong>' + String(bestLength) + '</strong></span><span>' + (state.over ? 'Klepni na pole pro novou hru' : 'Had prochází skrz okraje') + '</span></div>',
    '  <div class="gameBoard gameSnakeBoard" id="gameSnakeBoard" style="width:' + boardSize + 'px;height:' + boardSize + 'px;grid-template-columns:repeat(20,minmax(0,1fr));">' + cells.join('') + '</div>',
    gamesTop3Block('snake', 'bodů', 10),
    '</div>'
  ].join('');
  const board = body.querySelector('#gameSnakeBoard');
  if (board) {
    board.style.setProperty('width', boardSize + 'px', 'important');
    board.style.setProperty('height', boardSize + 'px', 'important');
  }
  const resetSnake = () => {
    if (state.timer) clearInterval(state.timer);
    app.gamesSnake = snakeDefaultState();
    snakePlaceFood(app.gamesSnake);
    snakeStart();
    renderGameSnake();
  };
  gamesBindSwipeControl(board, (dir) => {
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
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
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
    '<div class="gamesShell" style="padding:12px;margin-top:10px;">',
    '  <div class="smallText">Spustí se plná hra a odkaz můžeš sdílet dál.</div>',
    '  <div class="gameControls" style="margin-top:10px;">',
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
