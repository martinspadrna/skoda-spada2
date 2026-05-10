function setBottomNavActive(pageId) {
  const buttons = document.querySelectorAll('.bottomNavBtn');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
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
      hardWinLoaded: false
    };
  }
  return app.tttState;
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
  if (opponentWins >= 3) score -= 520000;
  else if (opponentWins >= 2) score -= 360000;
  else if (opponentWins === 1) score -= 200000;
  if (opponentThreats >= 3) score -= 220000;
  else if (opponentThreats === 2) score -= 130000;
  else if (opponentThreats === 1) score -= 70000;
  board[index] = opponent;
  if (tttWinner(board).winner === opponent) score += 900000;
  board[index] = mark;

  const occupied = board.reduce((sum, cell) => sum + (cell ? 1 : 0), 0);
  const forkRisk = occupied >= 5 ? tttOpponentForkRisk(board, opponent, 8) : 0;
  if (forkRisk >= 2) score -= 420000;
  else if (forkRisk >= 1) score -= 210000;

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
  if (deadline && typeof performance !== 'undefined' && performance.now() > deadline) {
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
  let moves = tttOrderedCandidates(board, mark, maximizing ? 9 : 8);
  if (!moves.length) moves = tttCandidateMoves(board, 4);
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

  const center = tttIndex(Math.floor(TTT_ROWS / 2), Math.floor(TTT_COLS / 2));

  const collectCandidates = (radius, limit) => {
    const seen = new Set();
    const add = (idx) => {
      if (idx >= 0 && idx < board.length && !board[idx] && !seen.has(idx)) {
        seen.add(idx);
      }
    };

    const stones = [];
    for (let i = 0; i < board.length; i += 1) {
      if (board[i]) stones.push(i);
    }

    if (!stones.length) {
      add(center);
      return [center];
    }

    stones.forEach((idx) => {
      const row = Math.floor(idx / TTT_COLS);
      const col = idx % TTT_COLS;
      for (let dr = -radius; dr <= radius; dr += 1) {
        for (let dc = -radius; dc <= radius; dc += 1) {
          if (dr === 0 && dc === 0) continue;
          const rr = row + dr;
          const cc = col + dc;
          if (!tttInBounds(rr, cc)) continue;
          add(tttIndex(rr, cc));
        }
      }
    });

    add(center);
    const list = Array.from(seen);
    list.sort((a, b) => {
      const ar = Math.floor(a / TTT_COLS);
      const ac = a % TTT_COLS;
      const br = Math.floor(b / TTT_COLS);
      const bc = b % TTT_COLS;
      const da = Math.abs(ar - Math.floor(TTT_ROWS / 2)) + Math.abs(ac - Math.floor(TTT_COLS / 2));
      const db = Math.abs(br - Math.floor(TTT_ROWS / 2)) + Math.abs(bc - Math.floor(TTT_COLS / 2));
      return da - db;
    });
    return list.slice(0, limit);
  };

  const scoreLine = (mark, idx) => {
    const row = Math.floor(idx / TTT_COLS);
    const col = idx % TTT_COLS;
    let total = 0;
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];

    for (const [dr, dc] of dirs) {
      let count1 = 0;
      let count2 = 0;
      let open1 = 0;
      let open2 = 0;

      let r = row + dr;
      let c = col + dc;
      while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
        count1 += 1;
        r += dr;
        c += dc;
      }
      if (tttInBounds(r, c) && !board[tttIndex(r, c)]) open1 = 1;

      r = row - dr;
      c = col - dc;
      while (tttInBounds(r, c) && board[tttIndex(r, c)] === mark) {
        count2 += 1;
        r -= dr;
        c -= dc;
      }
      if (tttInBounds(r, c) && !board[tttIndex(r, c)]) open2 = 1;

      const run = count1 + count2 + 1;
      const opens = open1 + open2;

      if (run >= 5) total += 1000000;
      else if (run === 4 && opens === 2) total += 180000;
      else if (run === 4 && opens === 1) total += 55000;
      else if (run === 3 && opens === 2) total += 12000;
      else if (run === 3 && opens === 1) total += 3000;
      else if (run === 2 && opens === 2) total += 900;
      else if (run === 2 && opens === 1) total += 250;
      else total += run * 18 + opens * 8;
    }

    const centerBias = (TTT_ROWS + TTT_COLS) - (Math.abs(row - Math.floor(TTT_ROWS / 2)) + Math.abs(col - Math.floor(TTT_COLS / 2)));
    return total + centerBias * 3;
  };

  const evaluateBoard = (mark) => {
    let sum = 0;
    for (let i = 0; i < board.length; i += 1) {
      if (board[i] !== mark) continue;
      sum += scoreLine(mark, i);
    }
    return sum;
  };

  const candidateLimit = difficulty === 'ai' ? 18 : 12;
  const candidates = collectCandidates(2, candidateLimit);

  if (difficulty === 'noob') {
    return candidates[Math.floor(Math.random() * candidates.length)] ?? free[0];
  }

  const scoreMove = (idx) => {
    if (board[idx]) return -Infinity;
    board[idx] = 'O';

    const after = tttWinner(board);
    if (after.winner === 'O') {
      board[idx] = '';
      return 9e8;
    }

    let score = evaluateBoard('O') - evaluateBoard('X') * 0.92;
    score += scoreLine('O', idx) * 2.5;

    const opponentWinNow = tttWinningMove(board, 'X');
    if (opponentWinNow >= 0) score -= 320000;

    const replyCandidates = collectCandidates(2, 10).filter(i => !board[i]);
    let worstReply = 0;
    for (const reply of replyCandidates) {
      board[reply] = 'X';
      const replyScore = evaluateBoard('X') - evaluateBoard('O') * 0.85 + scoreLine('X', reply) * 2.2;
      if (replyScore > worstReply) worstReply = replyScore;
      board[reply] = '';
    }

    board[idx] = '';
    return score - worstReply * 0.72;
  };

  let bestIdx = candidates[0] ?? free[0];
  let bestScore = -Infinity;
  for (const idx of candidates) {
    const score = scoreMove(idx);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }
  return bestIdx;
}
function tttHardWinLog() {
  return [];
}

function tttSaveHardWin(entry) {
  void entry;
}

function tttFormatElapsed(ms) {
  return formatDuration(Math.max(0, Number(ms) || 0));
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

async function tttRefreshHardWinRows(forceRender) {
  const state = tttGetState();
  if (state.hardWinLoading) return state.hardWinRemote || [];
  state.hardWinLoading = true;
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
  requestAnimationFrame(tttLayoutBoard);
}

function tttOpenHardWinPrompt() {
  const state = tttGetState();
  state.hardWinPrompt = true;
  state.hardWinStats = tttReadHardWinStats();
  state.hardWinName = state.hardWinName || localStorage.getItem('tttHardWinName') || '';
  tttRender();
  void tttRefreshHardWinRows();
  requestAnimationFrame(tttLayoutBoard);
  requestAnimationFrame(tttLayoutBoard);
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
  await tttRefreshHardWinRows();
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
      '  <button type="button" class="tttBtn" id="tttStartBtn" style="width:100%;">Hrát</button>',
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
        requestAnimationFrame(tttLayoutBoard);
        requestAnimationFrame(tttLayoutBoard);
      });
    });
    start.querySelectorAll('[data-ttt-difficulty]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.mode === 'pvp') return;
        state.difficulty = btn.getAttribute('data-ttt-difficulty') || 'ai';
        tttRender();
        requestAnimationFrame(tttLayoutBoard);
      });
    });
    start.querySelector('#tttStartBtn')?.addEventListener('click', () => {
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
        ? 'Hraje hráč X.'
        : 'Hraješ za X. AI je O.';
      tttRender();
      requestAnimationFrame(tttLayoutBoard);
    });
    if (!state.hardWinLoaded && !state.hardWinLoading) {
      void tttRefreshHardWinRows();
    }
    return;
  }

  start.style.display = 'none';
  game.style.display = 'flex';
  status.textContent = state.message || (state.mode === 'pvp' ? 'Hraje hráč X.' : 'Hraješ za X. AI je O.');

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
  if (state.mode === 'ai' && state.turn !== 'X') return;

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
    } else if (after.winner === 'X') {
      state.message = 'Vyhrál jsi.';
      if (state.mode === 'ai' && state.difficulty === 'ai') {
        state.hardWinPrompt = true;
        state.hardWinStats = tttReadHardWinStats();
        tttOpenHardWinPrompt();
        return;
      }
    } else {
      state.message = 'Vyhrála O.';
    }
    tttRender();
    requestAnimationFrame(tttLayoutBoard);
    return;
  }

  if (state.mode === 'pvp') {
    state.turn = state.turn === 'X' ? 'O' : 'X';
    state.message = state.turn === 'X' ? 'Hraje hráč X.' : 'Hraje hráč O.';
    tttRender();
    requestAnimationFrame(tttLayoutBoard);
    return;
  }

  state.turn = 'O';
  state.message = 'Tah AI...';
  tttRender();
  requestAnimationFrame(tttLayoutBoard);

  setTimeout(() => {
    requestAnimationFrame(() => {
      try {
        const fresh = tttGetState();
        if (fresh.gameOver) return;
        const snapshot = fresh.board.slice();
        const aiMove = tttBestMove(snapshot, fresh.difficulty || 'ai');
        if (aiMove < 0 || fresh.board[aiMove]) {
          fresh.turn = 'X';
          fresh.message = 'Hraješ za X.';
          tttRender();
          requestAnimationFrame(tttLayoutBoard);
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
          tttRender();
          requestAnimationFrame(tttLayoutBoard);
          return;
        }
        fresh.turn = 'X';
        fresh.message = 'Hraješ za X.';
        tttRender();
        requestAnimationFrame(tttLayoutBoard);
      } catch (err) {
        console.warn('TTT AI move failed', err);
        const fresh = tttGetState();
        fresh.turn = 'X';
        fresh.message = 'AI se na chvíli zasekla. Zkus tah znovu.';
        tttRender();
        requestAnimationFrame(tttLayoutBoard);
      }
    });
  }, 35);
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
  requestAnimationFrame(tttLayoutBoard);
  requestAnimationFrame(tttLayoutBoard);
}

function openTicTacToeGame() {
  const overlay = ensureTicTacToeOverlay();
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
  tttRender();
  requestAnimationFrame(tttLayoutBoard);
  requestAnimationFrame(tttLayoutBoard);
}

function closeTicTacToeGame() {
  const overlay = document.getElementById('tttOverlay');
  if (overlay) overlay.classList.remove('isVisible');
  document.body.classList.remove('tttOpen');
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
  if (!state) {
    openAppMenu('about');
    return;
  }
  state.aboutTapCount = (state.aboutTapCount || 0) + 1;
  if (state.aboutTapTimer) clearTimeout(state.aboutTapTimer);
  if (state.aboutTapCount >= 3) {
    state.aboutTapCount = 0;
    openTicTacToeGame();
    return;
  }
  state.aboutTapTimer = setTimeout(() => {
    const taps = state.aboutTapCount || 0;
    state.aboutTapCount = 0;
    if (taps > 0) openAppMenu('about');
  }, 320);
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
        'Bonus: piškvorky se otevírají po trojkliku na O aplikaci.'
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
  if (app.adminUnlocked) {
    await saveRotationToSupabase(app.rotation, { source: 'admin-menu', monthKey });
  }
  return normalized;
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


function buildAdminMachineSettingsTableHtml() {
  const rows = Array.isArray(app.machineSettingsRows) ? app.machineSettingsRows : [];
  const dataRows = rows.length ? rows : [
    { machine_key: 'FZK01', label: 'Frézka 01', category: 'frezka', speed: '', settings_json: {} },
    { machine_key: 'BRS01', label: 'Brus 01', category: 'brus', speed: '', settings_json: {} },
    { machine_key: 'PRK01', label: 'Pračka 01', category: 'pracka', speed: '', settings_json: {} },
    { machine_key: '', label: '', category: 'general', speed: '', settings_json: {} }
  ];

  const tr = dataRows.map((row, idx) => {
    const settings = row && typeof row.settings_json === 'object' && row.settings_json !== null ? row.settings_json : {};
    const cycleTime = row.speed ?? settings.cycle_time ?? settings.cycleTime ?? '';
    const wheel = settings.wheel ?? settings.brus ?? settings.grind ?? '';
    const index = settings.index ?? settings.grind_index ?? '';
    const dressTime = settings.dress_time ?? settings.orovnani_time ?? settings.dressTime ?? '';
    const dressCount = settings.dress_count ?? settings.orovnani_count ?? settings.dressCount ?? '';
    return [
      '<tr data-machine-row-index="' + String(idx) + '">',
      '  <td><input class="appMenuInlineInput" data-machine-field="machine_key" value="' + escapeHtml(String(row.machine_key || '')) + '" placeholder="kód"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="label" value="' + escapeHtml(String(row.label || '')) + '" placeholder="název"></td>',
      '  <td><select class="appMenuInlineInput" data-machine-field="category">',
      '    <option value="frezka"' + (String(row.category || '') === 'frezka' ? ' selected' : '') + '>frézka</option>',
      '    <option value="brus"' + (String(row.category || '') === 'brus' ? ' selected' : '') + '>brus</option>',
      '    <option value="pracka"' + (String(row.category || '') === 'pracka' ? ' selected' : '') + '>pračka</option>',
      '    <option value="general"' + (String(row.category || 'general') === 'general' ? ' selected' : '') + '>ostatní</option>',
      '  </select></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="speed" value="' + escapeHtml(String(cycleTime ?? '')) + '" placeholder="čas kola"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="wheel" value="' + escapeHtml(String(wheel ?? '')) + '" placeholder="brus"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="index" value="' + escapeHtml(String(index ?? '')) + '" placeholder="index"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="dress_time" value="' + escapeHtml(String(dressTime ?? '')) + '" placeholder="orovnání"></td>',
      '  <td><input class="appMenuInlineInput" data-machine-field="dress_count" value="' + escapeHtml(String(dressCount ?? '')) + '" placeholder="kusů"></td>',
      '</tr>'
    ].join('');
  }).join('');

  return [
    '<div class="appMenuSubSection">',
    '  <div class="appMenuSubTitle">Nastavení strojů</div>',
    '  <div class="appMenuText">Vyplň hodnoty do tabulky a ulož online. Bez kódování a bez JSON editoru.</div>',
    '  <div class="tableWrap appMenuTableWrap">',
    '    <table class="appMenuTable appMenuAdminTable appMenuAdminTableDense">',
    '      <thead><tr><th>Kód</th><th>Název</th><th>Typ</th><th>Čas kola</th><th>Brus</th><th>Index</th><th>Čas orovnání</th><th>Kusů po orovnání</th></tr></thead>',
    '      <tbody>' + tr + '</tbody>',
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
    '  <div class="appMenuText">Uprav řádky v tabulce. Prázdné řádky se při uložení ignorují.</div>',
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
    const machine_key = String(get('machine_key')).trim();
    const label = String(get('label')).trim();
    const category = String(get('category')).trim() || 'general';
    const speedRaw = String(get('speed')).trim();
    const wheel = String(get('wheel')).trim();
    const index = String(get('index')).trim();
    const dress_time = String(get('dress_time')).trim();
    const dress_count = String(get('dress_count')).trim();
    if (!machine_key && !label && !speedRaw && !wheel && !index && !dress_time && !dress_count) return;

    rows.push({
      machine_key,
      label: label || machine_key,
      category,
      speed: speedRaw,
      settings_json: { wheel, index, dress_time, dress_count }
    });
  });
  return rows;
}
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
    root.querySelectorAll('tr[data-rotation-section="' + section + '"]').forEach((tr) => {
      const date = String(tr.querySelector('[data-rot-field="date"]')?.value || '').trim();
      const cells = Array.from({ length: machineCount }, (_, i) => String(tr.querySelector('[data-rot-field="cell-' + i + '"]')?.value || '').trim());
      if (!date && cells.every(v => !v)) return;
      rows.push({ date, cells });
    });
    month[section] = month[section] || {};
    month[section].rows = rows;
    month[section].machines = section === 'hard' ? HARD_MACHINE_HEADERS.slice() : SOFT_MACHINE_HEADERS.slice();
    if (!month[section].title) month[section].title = section === 'hard' ? 'Rotace tvrdota' : 'Rotace měkota';
  };

  readSection('hard', HARD_MACHINE_HEADERS.length);
  readSection('soft', SOFT_MACHINE_HEADERS.length);

  const notes = [];
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
  if (app.adminUnlocked) {
    await saveRotationToSupabase(app.rotation, { source: 'admin-menu', monthKey });
  }
  return normalized;
}


function renderAdminMenuBody(body) {
  const months = getAdminRotationMonthKeys();
  const monthKey = getAdminSelectedMonthKey();
  const title = months.length ? 'Administrace' : 'Administrace';
  const machineRows = Array.isArray(app.machineSettingsRows) ? app.machineSettingsRows : [];
  body.innerHTML = [
    '<div class="appMenuCard appMenuAdminCard">',
    '  <div class="appMenuCardTitle">' + escapeHtml(title) + '</div>',
    '  <div class="appMenuText">',
    '    <div>Nejprve stroje, pak rozpisy, a export až úplně dole. Všechno se ukládá online přes Supabase.</div>',
    '  </div>',
    buildAdminMachineSettingsTableHtml(),
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-machines">Načíst stroje</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-machines">Uložit stroje</button>',
    '  </div>',
    '  <label class="appMenuLabel" for="adminMonthSelect">Měsíc</label>',
    '  <select id="adminMonthSelect" class="appMenuSelect">' + months.map(m => '<option value="' + escapeHtml(m) + '"' + (m === monthKey ? ' selected' : '') + '>' + escapeHtml(m) + '</option>').join('') + '</select>',
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-admin-action="load-month">Načíst měsíc</button>',
    '    <button type="button" class="appMenuAction" data-admin-action="load-online">Načíst online</button>',
    '    <button type="button" class="appMenuAction isActive" data-admin-action="save-rotation">Uložit rozpis</button>',
    '  </div>',
    buildAdminRotationTableHtml(monthKey),
    '  <div class="appMenuCard appMenuSubSection">',
    '    <div class="appMenuSubTitle">Export celé aplikace</div>',
    '    <div class="appMenuActionRow">',
    '      <button type="button" class="appMenuAction" data-admin-action="import">Import Excelu</button>',
    '      <button type="button" class="appMenuAction" data-admin-action="export">Export ZIP</button>',
    '    </div>',
    '  </div>',
    '  <div class="appMenuActionRow">',
    '    <button type="button" class="appMenuAction" data-menu-back="1">Zpět</button>',
    '  </div>',
    '</div>'
  ].join('');
}


function openAppMenu(view) {
  const page = ensureAppMenuOverlay();
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
      void (async () => {
        try {
          await loadAdminMachineSettingsFromSupabase();
          await loadAdminRotationFromSupabase();
          renderAdminMenuBody(body);
        } catch (err) {
          console.warn('Admin preload failed', err);
          renderAdminMenuBody(body);
        }
      })();
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

    body.querySelectorAll('[data-menu-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-menu-action');
        if (action === 'import') {
          startMenuImport();
        } else if (action === 'export') {
          document.getElementById('exportBtn')?.click();
        } else if (action === 'settings') {
          openAppMenu('settings');
        } else if (action === 'about') {
          triggerAboutAction();
        } else if (action === 'contact') {
          openAppMenu('contact');
        } else if (action === 'admin') {
          openAppMenu('admin');
        } else if (action === 'reset-state') {
          if (confirm('Smazat uložený stav aplikace?')) {
            try {
              localStorage.removeItem(APP_KEY);
              localStorage.removeItem('rotationBuild');
              localStorage.removeItem(UI_PREFS_KEY);
              localStorage.removeItem('adminUnlocked');
            } catch (err) {
              console.warn(err);
            }
            location.reload();
          }
        }
      });
    });

    
body.querySelectorAll('[data-admin-action]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const action = btn.getAttribute('data-admin-action');
    const select = body.querySelector('#adminMonthSelect');
    const monthKey = select ? select.value : getAdminSelectedMonthKey();
    try {
      if (action === 'load-month') {
        if (monthKey) {
          app.selectedMonth = monthKey;
          setRotaceView('months');
          renderRotace();
          if (typeof renderMonth === 'function') renderMonth(monthKey);
        }
      } else if (action === 'load-online') {
        await loadAdminRotationFromSupabase();
        renderAdminMenuBody(body);
        return;
      } else if (action === 'save-rotation') {
        await saveAdminRotationFromDom(monthKey);
        alert('Rozpis uložený online.');
      } else if (action === 'load-machines') {
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.loadMachineSettings === 'function') {
          app.machineSettingsRows = await window.RotationSupabaseBridge.loadMachineSettings();
          renderAdminMenuBody(body);
          return;
        }
      } else if (action === 'save-machines') {
        const rows = readAdminMachineSettingsFromDom();
        if (window.RotationSupabaseBridge && typeof window.RotationSupabaseBridge.saveMachineSettings === 'function') {
          const result = await window.RotationSupabaseBridge.saveMachineSettings(rows);
          if (result && result.ok === false) throw (result.error || new Error('Uložení strojů selhalo.'));
          app.machineSettingsRows = rows;
          renderAdminMenuBody(body);
          alert('Nastavení strojů uložené online.');
          return;
        }
      } else if (action === 'import') {
        startMenuImport();
        return;
      } else if (action === 'export') {
        document.getElementById('exportBtn')?.click();
        return;
      }
      renderAdminMenuBody(body);
    } catch (err) {
      console.error('Admin action failed', err);
      alert(err && err.message ? err.message : 'Administrace se nepodařila uložit.');
    }
  });
});

body.querySelectorAll('[data-ui-pref]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-ui-pref');
        if (!key) return;
        toggleUiPref(key);
        openAppMenu('settings');
      });
    });

    body.querySelectorAll('[data-ui-reset]').forEach(btn => {
      btn.addEventListener('click', () => {
        resetUiPrefs();
        openAppMenu('settings');
      });
    });

    body.querySelectorAll('[data-menu-back]').forEach(btn => {
      btn.addEventListener('click', () => openAppMenu('menu'));
    });
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
    setBottomNavActive('home');
    return;
  }
  if (typeof renderFoodSchedulePage === 'function') {
    renderFoodSchedulePage();
  }
  showPage('jidlo');
  setBottomNavActive('home');
}


function showPage(id) {
  if (typeof app !== 'undefined') {
    app.homeBootSuppressed = id !== 'home';
  }

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
