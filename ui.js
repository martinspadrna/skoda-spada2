function setBottomNavActive(pageId) {
  const buttons = document.querySelectorAll('.bottomNavBtn');
  buttons.forEach(btn => {
    const isActive = btn.dataset.page === pageId;
    btn.classList.toggle('active', isActive);
    if (isActive && typeof btn.scrollIntoView === 'function') {
      try { btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); } catch (err) {}
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
  .tttHeader{padding:12px 12px 10px;}
  .tttStartScreen{padding:12px;}
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
    '        <button type="button" class="tttBtn" id="tttBackBtn">Zpět</button>',
    '      </div>',
    '      <div class="tttWinModal" id="tttWinModal" style="display:none;">',
    '        <div class="tttWinCard">',
    '          <div class="tttSectionTitle">Výsledek</div>',
    '          <div class="tttWinText">Napiš jméno a odešli výsledek výhry nad nejtvrdší AI.</div>',
    '          <label class="tttWinLabel" for="tttWinName">Jméno</label>',
    '          <input id="tttWinName" class="tttWinInput" type="text" autocomplete="name" maxlength="32" placeholder="Tvoje jméno">',
    '          <div class="tttWinStats">',
    '            <div><span>Herní režim</span><strong id="tttWinMode">—</strong></div>',
    '            <div><span>Tahy celkem</span><strong id="tttWinMoves">—</strong></div>',
    '            <div><span>Čas</span><strong id="tttWinTime">—</strong></div>',
    '          </div>',
    '          <div class="tttWinActions">',
    '            <button type="button" class="tttBtn isActive" id="tttWinSubmit">Odeslat</button>',
    '            <button type="button" class="tttBtn" id="tttWinCancel">Nechat být</button>',
    '          </div>',
    '        </div>',
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
  overlay.querySelector('#tttBackBtn')?.addEventListener('click', close);
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
      online: null,
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
    createdAt: Date.now()
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
        inviteId: result.inviteId || null,
        sessionId: result.sessionId || null,
        role: 'x',
        status: 'waiting',
        lastUpdatedAt: Date.now()
      };
      tttSetOnlineStatus('Pozvánka vytvořena. Pošli odkaz spoluhráči.', 'waiting');
      return { ok: true, code, url: tttGetInviteUrl(code), result };
    }
  }
  state.online = { code, role: 'x', status: 'waiting', lastUpdatedAt: Date.now() };
  tttSetOnlineStatus('Pozvánka vytvořena lokálně. Odkaz pošli spoluhráči.', 'waiting');
  return { ok: true, code, url: tttGetInviteUrl(code), local: true };
}

async function tttJoinInviteSession(code) {
  const state = tttGetState();
  const inviteCode = String(code || '').trim().toUpperCase();
  if (!inviteCode) return { ok: false, error: new Error('Chybí kód pozvánky.') };
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.acceptGameInvite === 'function') {
    const result = await window.RotationSupabaseBridge.acceptGameInvite(inviteCode, (typeof gamesGetActiveAccount === 'function' && gamesGetActiveAccount() && gamesGetActiveAccount().id) ? gamesGetActiveAccount().id : null);
    if (result && result.ok) {
      state.online = {
        code: inviteCode,
        inviteId: result.inviteId || null,
        sessionId: result.sessionId || null,
        role: 'o',
        status: 'active',
        lastUpdatedAt: Date.now()
      };
      tttSetOnlineStatus('Pozvánka přijata. Hraješ proti spoluhráči.', 'active');
      return { ok: true, code: inviteCode, result };
    }
  }
  state.online = { code: inviteCode, role: 'o', status: 'active', lastUpdatedAt: Date.now() };
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
        const remoteStamp = Number(session.updated_at_ts || session.updatedAtTs || new Date(session.updated_at || 0).getTime() || 0) || 0;
        if (force || remoteStamp >= (state.online.lastUpdatedAt || 0)) {
          state.online.lastUpdatedAt = remoteStamp || Date.now();
          if (Array.isArray(boardState.board) && boardState.board.length === TTT_TOTAL_CELLS) {
            state.board = boardState.board.slice();
          }
          state.turn = boardState.turn === 'O' ? 'O' : 'X';
          state.gameOver = !!boardState.gameOver;
          state.winner = boardState.winner || null;
          state.message = boardState.message || (session.status === 'waiting' ? 'Čekám na přijetí pozvánky.' : (state.turn === 'X' ? 'Hraje hráč X.' : 'Hraje hráč O.'));
          if (session.status === 'active') {
            state.online.status = 'active';
          }
          tttRender();
          scheduleTttLayout();
        }
      }
    } catch (err) {
      console.warn('TTT online sync failed', err);
    }
  }
}

function tttStartOnlineSyncLoop() {
  const state = tttGetState();
  if (!state.online || !state.online.code) return;
  if (state.onlineSyncTimer) return;
  state.onlineSyncTimer = setInterval(() => { void tttSyncOnlineSession(false); }, 1000);
}

async function tttPushOnlineSession(extraPatch) {
  const state = tttGetState();
  if (!state.online || !state.online.code) return;
  const payload = {
    board: state.board.slice(),
    turn: state.turn,
    gameOver: !!state.gameOver,
    winner: state.winner || null,
    message: state.message || '',
    moveCount: state.moveCount || 0,
    moveCountX: state.moveCountX || 0,
    moveCountO: state.moveCountO || 0,
    ...(extraPatch && typeof extraPatch === 'object' ? extraPatch : {})
  };
  if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveGameSessionByInviteCode === 'function') {
    try {
      const result = await window.RotationSupabaseBridge.saveGameSessionByInviteCode(state.online.code, payload);
      if (result && result.ok) {
        state.online.lastUpdatedAt = Date.now();
        state.online.status = result.status || state.online.status || 'active';
      }
      return result;
    } catch (err) {
      console.warn('TTT online save failed', err);
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
  const forcedBlock = tttCriticalThreatMoves(board, 'X');
  if (forcedBlock.length) return forcedBlock[0];
  const openThreeBlock = tttOpenThreeThreatMoves(board, 'X');
  if (openThreeBlock.length) return openThreeBlock[0];

  const occupied = board.length - free.length;
  const center = tttIndex(Math.floor(TTT_ROWS / 2), Math.floor(TTT_COLS / 2));
  if ((difficulty === 'ai' || difficulty === 'medium') && occupied <= 1 && !board[center]) {
    return center;
  }

  const candidates = tttCandidateMoves(board, occupied < 8 ? 2 : 1).slice(0, 14);
  const movePool = candidates.length ? candidates : free.slice(0, 14);

  let bestIdx = movePool[0] ?? free[0];
  let bestScore = -Infinity;
  const centerRow = Math.floor(TTT_ROWS / 2);
  const centerCol = Math.floor(TTT_COLS / 2);
  const deadline = (typeof performance !== 'undefined' ? performance.now() : Date.now()) + 8;

  for (const idx of movePool) {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now > deadline) break;
    if (board[idx]) continue;

    board[idx] = 'O';
    const winNow = tttWinner(board).winner === 'O';
    const oppWin = tttWinningMove(board, 'X');

    const row = Math.floor(idx / TTT_COLS);
    const col = idx % TTT_COLS;
    let score = 0;

    if (winNow) score += 1000000;
    if (oppWin >= 0) score -= 240000;

    const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
    score += Math.max(0, 120 - distance * 18);

    let ownAdj = 0;
    let oppAdj = 0;
    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        if (!dr && !dc) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (!tttInBounds(nr, nc)) continue;
        const cell = board[tttIndex(nr, nc)];
        if (cell === 'O') ownAdj += 18;
        else if (cell === 'X') oppAdj += 12;
      }
    }
    score += ownAdj + oppAdj;

    for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
      let same = 1;
      let openEnds = 0;
      let r = row + dr;
      let c = col + dc;
      while (tttInBounds(r, c) && board[tttIndex(r, c)] === 'O') { same += 1; r += dr; c += dc; }
      if (tttInBounds(r, c) && !board[tttIndex(r, c)]) openEnds += 1;
      r = row - dr;
      c = col - dc;
      while (tttInBounds(r, c) && board[tttIndex(r, c)] === 'O') { same += 1; r -= dr; c -= dc; }
      if (tttInBounds(r, c) && !board[tttIndex(r, c)]) openEnds += 1;
      if (same >= 4 && openEnds >= 1) score += 45000;
      else if (same === 3 && openEnds === 2) score += 12000;
      else if (same === 3 && openEnds === 1) score += 4200;
      else if (same === 2 && openEnds === 2) score += 900;
    }

    board[idx] = '';

    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }

  if (bestIdx >= 0) return bestIdx;
  return free[Math.floor(Math.random() * free.length)] ?? -1;
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
  const overlay = document.getElementById('tttOverlay');
  const modal = overlay ? overlay.querySelector('#tttWinModal') : null;
  if (modal) {
    modal.classList.remove('isVisible');
    modal.style.display = 'none';
  }
  tttRender();
  scheduleTttLayout();
}

function tttOpenHardWinPrompt() {
  const state = tttGetState();
  state.hardWinPrompt = true;
  state.hardWinStats = tttReadHardWinStats();
  state.hardWinName = state.hardWinName || localStorage.getItem('tttHardWinName') || '';
  tttRender();
  void tttRefreshHardWinRows();
    scheduleTttLayout();
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
  const overlay = document.getElementById('tttOverlay');
  const nameInput = overlay ? overlay.querySelector('#tttWinName') : null;
  const submitBtn = overlay ? overlay.querySelector('#tttWinSubmit') : null;
  const name = String(nameInput && nameInput.value ? nameInput.value : '').trim();
  if (!name) {
    alert('Napiš jméno, ať je to zapsané správně.');
    return;
  }

  state.hardWinName = name;
  try {
    localStorage.setItem('tttHardWinName', name);
  } catch (err) {
    console.warn(err);
  }

  const stats = state.hardWinStats || tttReadHardWinStats();
  const entry = {
    name,
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

  if (submitBtn) submitBtn.disabled = true;
  const result = await tttSendHardWinEntry(entry);
  await new Promise(resolve => setTimeout(resolve, 300));

  if (result && result.ok === false) {
    if (submitBtn) submitBtn.disabled = false;
    alert('Výhru se nepodařilo uložit online.');
    return;
  }

  tttCloseHardWinPrompt();
  await tttRefreshHardWinRows(true);
  if (typeof tttRender === 'function') tttRender();
  if (submitBtn) submitBtn.disabled = false;
  alert('Výhra uložená online.');
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
      state.mode === 'pvp' ? '<div id="tttInviteInfo" class="tttNote">Nejdřív vytvoř pozvánku. Odkaz pošli spoluhráči až potom.</div><div class="tttToggleRow"><button type="button" class="tttBtn" id="tttCreateInviteBtn">Vytvořit pozvánku</button><button type="button" class="tttBtn" id="tttJoinInviteBtn">Přijmout pozvánku</button></div><div class="tttNote" id="tttInviteUrl" style="margin-top:10px;display:none;"></div>' : '',
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
    start.querySelector('#tttCreateInviteBtn')?.addEventListener('click', async () => {
      try {
        const result = await tttCreateInviteSession();
        const info = start.querySelector('#tttInviteInfo');
        const urlEl = start.querySelector('#tttInviteUrl');
        if (result && result.ok) {
          if (info) info.textContent = 'Pozvánka připravená. Odkaz pošli spoluhráči.';
          if (urlEl) {
            urlEl.style.display = 'block';
            urlEl.textContent = result.url;
          }
          try { await navigator.clipboard.writeText(result.url); } catch (e) {}
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

  tttFillHardWinPrompt();
  const modal = overlay.querySelector('#tttWinModal');
  if (modal) {
    const submit = overlay.querySelector('#tttWinSubmit');
    const cancel = overlay.querySelector('#tttWinCancel');
    const nameInput = overlay.querySelector('#tttWinName');
    if (submit && !submit.dataset.bound) {
      submit.dataset.bound = '1';
      submit.addEventListener('click', tttSubmitHardWin);
    }
    if (cancel && !cancel.dataset.bound) {
      cancel.dataset.bound = '1';
      cancel.addEventListener('click', tttCloseHardWinPrompt);
    }
    if (nameInput && !nameInput.dataset.bound) {
      nameInput.dataset.bound = '1';
      nameInput.addEventListener('input', () => {
        tttGetState().hardWinName = nameInput.value;
      });
    }
  }
}

function tttHandleMove(index) {
  const state = tttGetState();
  if (state.gameOver || state.board[index]) return;
  if (state.mode === 'ai' && (state.turn !== 'X' || state.aiBusy)) return;
  if (state.mode === 'pvp' && state.online && state.online.status === 'waiting') return;
  if (state.mode === 'pvp' && state.online && state.online.status === 'waiting' && state.turn !== 'X') return;

  const mark = state.turn;
  state.board[index] = mark;
  state.moveCount += 1;
  if (mark === 'X') state.moveCountX += 1;
  else state.moveCountO += 1;

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
        state.hardWinPrompt = true;
        state.hardWinStats = tttReadHardWinStats();
        tttOpenHardWinPrompt();
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
    if (state.mode === 'pvp' && state.online && state.online.code) void tttPushOnlineSession({ status: 'active' });
    return;
  }

  if (state.mode === 'pvp') {
    state.turn = state.turn === 'X' ? 'O' : 'X';
    state.message = state.online && state.online.status === 'waiting'
      ? 'Čekám na přijetí pozvánky.'
      : (state.turn === 'X' ? 'Hraje hráč X.' : 'Hraje hráč O.');
    tttRender();
    scheduleTttLayout();
    if (state.online && state.online.code) void tttPushOnlineSession({ status: state.online.status || 'active' });
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
      const aiMove = (fresh.difficulty === 'ai' && fresh.moveCount > 8) ? (tttCandidateMoves(snapshot,1)[0] ?? tttBestMove(snapshot, fresh.difficulty || 'ai')) : tttBestMove(snapshot, fresh.difficulty || 'ai');
      if (aiMove < 0 || fresh.board[aiMove]) {
        fresh.turn = 'X';
        fresh.message = 'Hraješ za X.';
        tttRender();
        scheduleTttLayout();
        return;
      }
      fresh.board[aiMove] = 'O';
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
  state.hardWinPrompt = false;
  state.hardWinStats = null;
  state.message = state.mode === 'pvp' ? 'Hraje hráč X.' : 'Hraješ za X. AI je O.';
  if (!keepScreen) state.screen = 'start';
  tttRender();
  scheduleTttLayout();
}

function openGamesPage() {
  showPage('games');
  if (typeof renderGamesHub === 'function') renderGamesHub();
}

function openTicTacToeGame() {
  const overlay = ensureTicTacToeOverlay();
  document.body.classList.remove('gamesOpen');
  const state = tttGetState();
  state.screen = 'start';
  state.board = Array(TTT_TOTAL_CELLS).fill('');
  state.turn = 'X';
  state.gameOver = false;
  state.winner = null;
  state.startedAt = 0;
  state.moveCount = 0;
  state.moveCountX = 0;
  state.moveCountO = 0;
  state.hardWinPrompt = false;
  state.hardWinStats = null;
  state.message = '';
  overlay.classList.add('isVisible');
  document.body.classList.add('tttOpen');
  if (state.online && state.online.code) tttStartOnlineSyncLoop();
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
  const sections = [
    {
      range: 'v.1(250)–v.1(289)',
      title: 'Aktuální úpravy',
      lines: [
        'Jídelna a kantýna teď používají shodné dny na jednom řádku.',
        'Dashboard ukazuje další směnu D, kdo na ní chybí, a u průběhu směny i procenta.',
        'Odpočet do dovolené doplňuje, jestli jde o CZD nebo Vánoce.',
        'Kalkulačky pro frézky a brusy umí dopočítat i čas hotovosti.',
        'Piškvorky najdeš ve složce Hry dole v liště.'
      ]
    },
    {
      range: 'v.1(233)–v.1(242)',
      title: 'Dashboard, lišta a statistiky',
      lines: [
        'Dashboard se ladil pro přehlednější stav směn a absencí.',
        'Spodní lišta dostala glass styl a přesnější velikosti.',
        'Statistiky přidaly top 3 přehled a čistší rozpad jmen.'
      ]
    },
    {
      range: 'v.1(221)–v.1(232)',
      title: 'Rotace, kalkulačky a menu',
      lines: [
        'Rotace přešla na tiles a QR po trojkliku.',
        'Kalkulačky dostaly nové pořadí a ikony.',
        'Menu „Více“ se sjednotilo do vlastní stránky.'
      ]
    },
    {
      range: 'v.1(215)–v.1(220)',
      title: 'Refaktorace a stabilita',
      lines: [
        'Čištění kódu, exportů a modularita.',
        'Příprava na další rozšíření dashboardu a statistik.'
      ]
    },
    {
      range: 'v0.151–v0.157-rc',
      title: 'Velká refaktorace',
      lines: [
        'Nový základ projektu.',
        'Vyčištění starého kódu a stabilnější exporty.'
      ]
    },
    {
      range: 'v0.91–v0.150',
      title: 'Přechod na modernější architekturu',
      lines: [
        'Rozdělení logiky aplikace a čistší struktura.',
        'Lepší mobilní navigace, dashboard a PWA příprava.'
      ]
    },
    {
      range: 'v0.41–v0.90',
      title: 'Rotace, statistiky a vzhled',
      lines: [
        'Rozšíření rotací a statistik.',
        'Modernější dark styl, karty a mobilní ergonomie.'
      ]
    },
    {
      range: 'v0.01–v0.40',
      title: 'Začátek projektu',
      lines: [
        'První funkční základ aplikace.',
        'Základní navigace, první kalkulačky a jednoduchý dark vzhled.'
      ]
    }
  ];

  return [
    '<div class="appMenuHistory">',
    sections.map(section => [
      '<div class="appMenuHistoryGroup">',
      '  <div class="appMenuHistoryRange">' + escapeHtml(section.range) + '</div>',
      '  <div class="appMenuHistoryTitle">' + escapeHtml(section.title) + '</div>',
      '  <div class="appMenuHistoryList">' + section.lines.map(line => '<div class="appMenuHistoryItem">' + escapeHtml(line) + '</div>').join('') + '</div>',
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
        alert(saveResult && saveResult.ok === true
          ? (saveResult.queued
              ? 'Rozpis uložený lokálně ✓ · po připojení se synchronizuje.'
              : ('Rozpis uložený online ✓ · měsíců: ' + String(saveResult.months || 0) + ' · řádků: ' + String(saveResult.entries || 0)))
          : (navigator.onLine ? 'Rozpis se nepodařilo uložit online.' : 'Rozpis uložený lokálně. Po připojení se synchronizuje.'));
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
          alert((result && result.queued)
            ? ('Nastavení strojů uložené lokálně ✓ · po připojení se synchronizují' + ((result && result.savedCount) ? (' · řádků: ' + result.savedCount) : ''))
            : ('Nastavení strojů uložené online ✓' + ((result && result.savedCount) ? (' · řádků: ' + result.savedCount) : '')));
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

function gamesSetActiveAccount(accountId) {
  const profile = gamesGetProfile();
  if (!profile.accounts[accountId]) return false;
  profile.activeAccountId = accountId;
  gamesSaveProfile(profile);
  renderGamesHub();
  return true;
}

function gamesClearActiveAccount() {
  const profile = gamesGetProfile();
  profile.activeAccountId = '';
  gamesSaveProfile(profile);
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

  nameEl.textContent = hasAccount ? active.name : 'Bez přihlášení';
  hintEl.textContent = hasAccount
    ? 'Přihlášeno. Statistiky se ukládají pod tímto číslem.'
    : 'Bez účtu můžeš hrát dál. Statistiky se ukládají jen po přihlášení číslem.';

  entryRow.style.display = hasAccount ? 'none' : '';
  currentEl.style.display = hasAccount ? 'flex' : 'none';
  currentEl.textContent = hasAccount ? active.name : '';
  inputEl.value = hasAccount ? '' : inputEl.value;
  clearBtn.textContent = hasAccount ? 'Odhlásit' : 'Bez účtu';

  const syncVisibleAccount = (account) => {
    const next = account || null;
    nameEl.textContent = next ? next.name : 'Bez přihlášení';
    hintEl.textContent = next
      ? 'Přihlášeno. Statistiky se ukládají pod tímto číslem.'
      : 'Bez účtu můžeš hrát dál. Statistiky se ukládají jen po přihlášení číslem.';
    entryRow.style.display = next ? 'none' : '';
    currentEl.style.display = next ? 'flex' : 'none';
    currentEl.textContent = next ? next.name : '';
    if (next) inputEl.value = '';
    clearBtn.textContent = next ? 'Odhlásit' : 'Bez účtu';
  };

  if (!inputEl.dataset.bound) {
    inputEl.dataset.bound = '1';
    const submit = async () => {
      const found = gamesAccountById(inputEl.value);
      if (found) {
        if (gamesSetActiveAccount(found.id)) {
          syncVisibleAccount(found);
          gamesRenderStats();
          await Promise.resolve();
        }
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
  gamesEnsureKeyBindings();
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
  stage.innerHTML = [
    '<div class="gamesShell">',
    '  <div class="gamesShellTop">',
    '    <div class="gamesShellTitle">' + escapeHtml(title) + '</div>',
    '    <button type="button" class="gamesShellBack" id="gamesShellBackBtn">Zpět</button>',
    '  </div>',
    '  <div id="gamesShellBody"></div>',
    '</div>'
  ].join('');
  stage.querySelector('#gamesShellBackBtn')?.addEventListener('click', closeGameShell);
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
// ---- 2048 ----
function game2048InitialState() {
  return { board: Array(16).fill(0), score: 0, over: false, best: 0, spawned: false };
}

function game2048Spawn(state) {
  const empties = state.board.map((v, i) => v ? -1 : i).filter(i => i >= 0);
  if (!empties.length) return false;
  const idx = empties[Math.floor(Math.random() * empties.length)];
  state.board[idx] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

function game2048CanMove(board) {
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    const v = board[game2048Index(i,j)]; if (!v) return true;
    if (j < 3 && v === board[game2048Index(i,j+1)]) return true;
    if (i < 3 && v === board[game2048Index(i+1,j)]) return true;
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
  body.innerHTML = [
    '<div class="gameInfoRow"><span>Skóre: <strong>' + state.score + '</strong></span><span>' + (state.over ? 'Konec hry' : 'Táhni prstem nebo šipkami') + '</span></div>',
    '<div class="gameBoard game2048Board" id="game2048Board">' + state.board.map(v => '<div class="gameBoardCell ' + (v ? 'n' + v : '') + '" data-value="' + (v || '') + '">' + (v || '') + '</div>').join('') + '</div>',
    '<div class="gameInfoRow"><span>Nejvyšší: ' + (state.best || 0) + '</span><button class="gameControlBtn" id="game2048Restart">Nová hra</button></div>'
  ].join('');
  body.querySelectorAll('[data-2048-dir]').forEach(btn => btn.addEventListener('click', () => game2048Move(btn.getAttribute('data-2048-dir'))));
  body.querySelector('#game2048Restart')?.addEventListener('click', () => { app.games2048 = game2048InitialState(); renderGame2048(); });
}

function game2048Move(dir) {
  const state = app.games2048; if (!state || state.over) return;
  const old = state.board.slice();
  let moved = false;
  const pull = (vals) => {
    const arr = vals.filter(v => v);
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      if (i < arr.length - 1 && arr[i] === arr[i + 1]) { out.push(arr[i] * 2); state.score += arr[i] * 2; state.best = Math.max(state.best, arr[i] * 2); i++; }
      else out.push(arr[i]);
    }
    while (out.length < 4) out.push(0);
    return out;
  };
  for (let i = 0; i < 4; i++) {
    let line = [];
    if (dir === 'left') line = [0,1,2,3].map(c => old[game2048Index(i,c)]);
    else if (dir === 'right') line = [3,2,1,0].map(c => old[game2048Index(i,c)]);
    else if (dir === 'up') line = [0,1,2,3].map(r => old[game2048Index(r,i)]);
    else if (dir === 'down') line = [3,2,1,0].map(r => old[game2048Index(r,i)]);
    const next = pull(line);
    if (dir === 'left') [0,1,2,3].forEach((c, idx) => { state.board[game2048Index(i,c)] = next[idx]; if (next[idx] !== old[game2048Index(i,c)]) moved = true; });
    else if (dir === 'right') [3,2,1,0].forEach((c, idx) => { state.board[game2048Index(i,c)] = next[idx]; if (next[idx] !== old[game2048Index(i,c)]) moved = true; });
    else if (dir === 'up') [0,1,2,3].forEach((r, idx) => { state.board[game2048Index(r,i)] = next[idx]; if (next[idx] !== old[game2048Index(r,i)]) moved = true; });
    else if (dir === 'down') [3,2,1,0].forEach((r, idx) => { state.board[game2048Index(r,i)] = next[idx]; if (next[idx] !== old[game2048Index(r,i)]) moved = true; });
  }
  if (moved) {
    game2048Spawn(state);
    state.best = Math.max(state.best, ...state.board);
    if (!state.board.includes(0) && !game2048CanMove(state.board)) state.over = true;
    renderGame2048();
    if (state.over) gamesRecordStat('2048', { plays: (gamesGetActiveAccount()?.stats.g2048.plays || 0) + 1, bestScore: Math.max(gamesGetActiveAccount()?.stats.g2048.bestScore || 0, state.score), bestTile: Math.max(gamesGetActiveAccount()?.stats.g2048.bestTile || 0, state.best) });
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
function renderGameSnake() {
  const body = document.getElementById('gamesShellBody'); if (!body) return;
  const state = app.gamesSnake || (app.gamesSnake = snakeDefaultState());
  if (!state.food || !state.snake.length) snakePlaceFood(state);
  const cells = [];
  for (let y = 0; y < state.size; y++) {
    for (let x = 0; x < state.size; x++) {
      const idx = state.snake.findIndex(p => p.x === x && p.y === y);
      let content = '';
      if (state.food.x === x && state.food.y === y) content = '●';
      else if (idx === 0) content = '◉';
      else if (idx > 0) content = '•';
      cells.push('<div class="gameBoardCell" style="font-size:' + (idx === 0 ? '16px' : '12px') + '">' + content + '</div>');
    }
  }
  body.innerHTML = [
    '<div class="gameInfoRow"><span>Skóre: <strong>' + state.score + '</strong></span><span>' + (state.over ? 'Konec hry' : 'Pohybuj hadem') + '</span></div>',
    '<div class="gameBoard gameSnakeBoard" id="gameSnakeBoard" style="grid-template-columns:repeat(20,1fr);">' + cells.join('') + '</div>',
    '<div class="gameInfoRow"><span>Délka: ' + state.snake.length + '</span><button class="gameControlBtn" id="snakeRestart">Nová hra</button></div>'
  ].join('');
  body.querySelectorAll('[data-snake-dir]').forEach(btn => btn.addEventListener('click', () => snakeSetDirection(btn.getAttribute('data-snake-dir'))));
  body.querySelector('#snakeRestart')?.addEventListener('click', () => { if (state.timer) clearInterval(state.timer); app.gamesSnake = snakeDefaultState(); snakePlaceFood(app.gamesSnake); snakeStart(); renderGameSnake(); });
  snakeStart();
}
function snakeSetDirection(dir) {
  const state = app.gamesSnake; if (!state || state.over) return;
  const next = dir === 'up' ? { x:0,y:-1 } : dir === 'down' ? { x:0,y:1 } : dir === 'left' ? { x:-1,y:0 } : { x:1,y:0 };
  if (state.dir.x + next.x === 0 && state.dir.y + next.y === 0) return;
  state.pending = next;
}
function snakeTick() {
  const state = app.gamesSnake; if (!state || state.over) return;
  if (state.pending) { state.dir = state.pending; state.pending = null; }
  const head = { x: state.snake[0].x + state.dir.x, y: state.snake[0].y + state.dir.y };
  if (head.x < 0 || head.y < 0 || head.x >= state.size || head.y >= state.size || state.snake.some(p => p.x === head.x && p.y === head.y)) {
    state.over = true; renderGameSnake(); gamesRecordStat('snake', { plays: (gamesGetActiveAccount()?.stats.snake.plays || 0) + 1, bestScore: Math.max(gamesGetActiveAccount()?.stats.snake.bestScore || 0, state.score), bestLength: Math.max(gamesGetActiveAccount()?.stats.snake.bestLength || 0, state.snake.length) }); return;
  }
  state.snake.unshift(head);
  if (head.x === state.food.x && head.y === state.food.y) { state.score += 1; snakePlaceFood(state); }
  else state.snake.pop();
  renderGameSnake();
}
function snakeStart() {
  const state = app.gamesSnake || (app.gamesSnake = snakeDefaultState());
  if (state.timer) clearInterval(state.timer);
  state.timer = setInterval(snakeTick, 140);
}

// ---- Flap Bird ----
function flapDefaultState() {
  return { y: 120, v: 0, gravity: 0.45, lift: -6.2, pipes: [], score: 0, over: false, timer: null, frame: 0 };
}
function renderGameFlap() {
  const body = document.getElementById('gamesShellBody'); if (!body) return;
  const state = app.gamesFlap || (app.gamesFlap = flapDefaultState());
  body.innerHTML = [
    '<div class="gameInfoRow"><span>Skóre: <strong>' + state.score + '</strong></span><span>' + (state.over ? 'Konec hry' : 'Klepni pro skok') + '</span></div>',
    '<div class="gameBoard gameFlapBoard" id="gameFlapBoard" style="grid-template-columns:1fr;min-height:280px;position:relative;overflow:hidden;">',
    '  <div id="flapPipes"></div>',
    '  <div id="flapBird" style="position:absolute;left:18%;top:' + Math.max(0, state.y) + 'px;width:22px;height:18px;border-radius:50% 50% 45% 45%;background:linear-gradient(180deg, rgba(124,255,124,.95), rgba(34,56,32,.9));box-shadow:0 0 18px rgba(124,255,124,.18);"></div>',
    '</div>',
    '<div class="gameControls">',
    '  <button class="gameControlBtn" id="flapTapBtn">Skok</button>',
    '  <button class="gameControlBtn" id="flapRestartBtn">Nová hra</button>',
    '</div>',
    '<div class="gameInfoRow"><span>Trubky: ' + state.pipes.length + '</span><span>Skóre: ' + state.score + '</span></div>'
  ].join('');
  body.querySelector('#flapTapBtn')?.addEventListener('click', flapTap);
  body.querySelector('#flapRestartBtn')?.addEventListener('click', () => { if (state.timer) cancelAnimationFrame(state.timer); app.gamesFlap = flapDefaultState(); flapStart(); renderGameFlap(); });
  flapStart();
}
function flapTap() { const state = app.gamesFlap; if (!state || state.over) return; state.v = state.lift; }
function flapStart() {
  const state = app.gamesFlap || (app.gamesFlap = flapDefaultState());
  if (state.timer) cancelAnimationFrame(state.timer);
  const loop = () => {
    if (state.over) return;
    state.frame += 1;
    state.v += state.gravity;
    state.y += state.v;
    if (state.frame % 75 === 0) {
      const gapY = 90 + Math.floor(Math.random() * 90);
      state.pipes.push({ x: 100, gapY, passed: false });
    }
    state.pipes.forEach(p => { p.x -= 2.3; if (!p.passed && p.x < 15) { p.passed = true; state.score += 1; } });
    state.pipes = state.pipes.filter(p => p.x > -20);
    if (state.y < 0 || state.y > 260) state.over = true;
    const birdTop = state.y, birdBottom = state.y + 20;
    for (const p of state.pipes) {
      if (18 + 20 > p.x && 18 < p.x + 22) {
        if (birdTop < p.gapY || birdBottom > p.gapY + 70) state.over = true;
      }
    }
    const bird = document.getElementById('flapBird');
    const pipesEl = document.getElementById('flapPipes');
    if (bird) bird.style.top = Math.max(0, state.y) + 'px';
    if (pipesEl) {
      pipesEl.innerHTML = state.pipes.map(p => '<div style="position:absolute;left:' + p.x + '%;top:0;bottom:0;width:22px;">' +
        '<div style="position:absolute;left:0;top:0;width:100%;height:' + p.gapY + 'px;background:linear-gradient(180deg, rgba(80,190,110,.55), rgba(42,120,72,.85));border:1px solid rgba(124,255,124,.24);border-top:none;border-radius:0 0 12px 12px;"></div>' +
        '<div style="position:absolute;left:0;top:' + (p.gapY + 70) + 'px;width:100%;bottom:0;background:linear-gradient(180deg, rgba(80,190,110,.55), rgba(42,120,72,.85));border:1px solid rgba(124,255,124,.24);border-bottom:none;border-radius:12px 12px 0 0;"></div>' +
      '</div>').join('');
    }
    if (state.over) {
      gamesRecordStat('flap', { plays: (gamesGetActiveAccount()?.stats.flap.plays || 0) + 1, bestScore: Math.max(gamesGetActiveAccount()?.stats.flap.bestScore || 0, state.score), bestPipes: Math.max(gamesGetActiveAccount()?.stats.flap.bestPipes || 0, state.score) });
      renderGameFlap();
      return;
    }
    state.timer = requestAnimationFrame(loop);
  };
  state.timer = requestAnimationFrame(loop);
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
    alert('Odkaz na piškvorky zkopírovaný do schránky.');
  });
}
