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
  background:rgba(5,8,7,.72);
  backdrop-filter:blur(18px) saturate(145%);
  -webkit-backdrop-filter:blur(18px) saturate(145%);
}
.tttOverlay.isVisible{display:flex;}
.tttShell{
  width:100%;
  height:100%;
  border:none;
  border-radius:0;
  background:linear-gradient(180deg, rgba(16,24,20,.98), rgba(10,14,12,.96));
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
  padding:16px 16px 12px;
  border-bottom:1px solid rgba(255,255,255,.06);
  flex:0 0 auto;
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
  border-radius:14px;
  background:rgba(255,255,255,.06);
  color:#e7fff0;
  font-size:24px;
  line-height:1;
}
.tttContent{
  flex:1;
  min-height:0;
  overflow:hidden;
  padding:12px calc(12px + env(safe-area-inset-right)) calc(12px + env(safe-area-inset-bottom)) calc(12px + env(safe-area-inset-left));
  display:flex;
  flex-direction:column;
}
.tttStartScreen,
.tttGameScreen{
  display:flex;
  flex-direction:column;
  gap:16px;
  min-height:0;
  flex:1;
}
.tttCard{
  border:1px solid rgba(124,255,124,.12);
  background:rgba(255,255,255,.03);
  border-radius:22px;
  padding:16px;
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
  border-radius:16px;
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
  min-height:24px;
  color:#7CFF7C;
  font-size:14px;
  font-weight:700;
  text-align:center;
  flex:0 0 auto;
}
.tttBoardWrap{
  flex:1;
  min-height:0;
  display:flex;
  align-items:stretch;
  justify-content:center;
}
.tttBoard{
  width:100%;
  height:100%;
  display:grid;
  grid-template-columns:repeat(16, var(--tttCellSize, 24px));
  grid-template-rows:repeat(11, var(--tttCellSize, 24px));
  gap:3px;
  justify-content:center;
  align-content:center;
  overflow:hidden;
}
.tttCell{
  appearance:none;
  -webkit-appearance:none;
  font-family:inherit;
  width:var(--tttCellSize, 24px);
  height:var(--tttCellSize, 24px);
  box-sizing:border-box;
  border:1px solid rgba(124,255,124,.14);
  background:rgba(255,255,255,.04);
  border-radius:12px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:calc(var(--tttCellSize, 24px) * .56);
  font-weight:800;
  line-height:1;
  color:#7CFF7C;
  text-shadow:0 0 10px rgba(124,255,124,.24), 0 0 18px rgba(124,255,124,.18);
  transition:transform .16s ease, background .16s ease, border-color .16s ease;
}
.tttCell:active{transform:scale(.98);}
.tttCell.isFilled{
  background:rgba(124,255,124,.06);
}
.tttCell.isWinner{
  background:rgba(124,255,124,.12);
  border-color:rgba(124,255,124,.5);
}
.tttFooter{
  display:flex;
  gap:10px;
  flex:0 0 auto;
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
  .tttHeader{padding:14px 14px 10px;}
  .tttContent{padding:10px calc(10px + env(safe-area-inset-right)) calc(10px + env(safe-area-inset-bottom)) calc(10px + env(safe-area-inset-left));}
  .tttLevelRow{grid-template-columns:1fr;}
  .tttToggleRow{grid-template-columns:1fr;}
  .tttBoard{gap:3px;}
  .tttCell{font-size:clamp(12px, 3.4vw, 26px);}
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
    '      <h2 id="tttTitle">Piškvorky</h2>',
    '      <span>easter egg · 11 × 16 · 5 v řadě</span>',
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

const TTT_ROWS = 11;
const TTT_COLS = 16;
const TTT_WIN_LENGTH = 5;
const TTT_TOTAL_CELLS = TTT_ROWS * TTT_COLS;

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
      message: ''
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
  board[index] = opponent;
  if (tttWinner(board).winner === opponent) score += 900000;
  board[index] = mark;

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
  const candidates = tttCandidateMoves(board, 2);
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

function tttSearch(board, depth, alpha, beta, maximizing, memo) {
  const key = board.join('') + '|' + depth + '|' + (maximizing ? '1' : '0');
  if (memo[key] !== undefined) return memo[key];

  const terminal = tttWinner(board).winner;
  if (terminal === 'O') return memo[key] = 1000000 + depth;
  if (terminal === 'X') return memo[key] = -1000000 - depth;
  if (terminal === 'draw') return memo[key] = 0;
  if (depth <= 0) return memo[key] = tttEvaluateBoard(board);

  const mark = maximizing ? 'O' : 'X';
  const candidates = tttOrderedCandidates(board, mark, maximizing ? 10 : 12);
  if (!candidates.length) return memo[key] = tttEvaluateBoard(board);

  if (maximizing) {
    let best = -Infinity;
    for (const idx of candidates) {
      if (board[idx]) continue;
      board[idx] = 'O';
      const score = tttSearch(board, depth - 1, alpha, beta, false, memo);
      board[idx] = '';
      if (score > best) best = score;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    memo[key] = best;
    return best;
  }

  let best = Infinity;
  for (const idx of candidates) {
    if (board[idx]) continue;
    board[idx] = 'X';
    const score = tttSearch(board, depth - 1, alpha, beta, true, memo);
    board[idx] = '';
    if (score < best) best = score;
    if (best < beta) beta = best;
    if (beta <= alpha) break;
  }
  memo[key] = best;
  return best;
}

function tttBestMove(board, difficulty) {
  const free = [];
  for (let i = 0; i < board.length; i += 1) {
    if (!board[i]) free.push(i);
  }
  if (!free.length) return -1;

  const win = tttWinningMove(board, 'O');
  if (win >= 0) return win;
  const block = tttWinningMove(board, 'X');
  if (block >= 0) return block;

  const candidates = tttOrderedCandidates(board, 'O', difficulty === 'ai' ? 14 : 18);

  if (difficulty === 'noob') {
    return candidates[Math.floor(Math.random() * candidates.length)] ?? free[Math.floor(Math.random() * free.length)];
  }

  if (difficulty === 'medium') {
    const scored = candidates.map((idx) => ({ idx, score: tttMoveHeuristic(board, idx, 'O') }));
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.idx ?? candidates[0] ?? free[Math.floor(Math.random() * free.length)];
  }

  let bestIdx = candidates[0] ?? free[0];
  let bestScore = -Infinity;
  const memo = {};
  for (const idx of candidates.slice(0, 12)) {
    if (board[idx]) continue;
    board[idx] = 'O';
    const score = tttSearch(board, 3, -Infinity, Infinity, false, memo);
    board[idx] = '';
    if (score > bestScore) {
      bestScore = score;
      bestIdx = idx;
    }
  }
  return bestIdx;
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
      '  <div class="tttNote">Hrací pole má 11 × 16 políček a vyhrává 5 spojených v řadě.</div>',
      '</div>',
      '<div class="tttCard">',
      '  <div class="tttSectionTitle">Spuštění</div>',
      '  <button type="button" class="tttBtn" id="tttStartBtn" style="width:100%;">Hrát</button>',
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
      state.message = state.mode === 'pvp'
        ? 'Hraje hráč X.'
        : 'Hraješ za X. AI je O.';
      tttRender();
  requestAnimationFrame(tttLayoutBoard);
    });
    return;
  }

  start.style.display = 'none';
  game.style.display = 'flex';
  status.textContent = state.message || (state.mode === 'pvp' ? 'Hraje hráč X.' : 'Hraješ za X. AI je O.');

  const result = tttWinner(state.board);
  const winnerLine = result.line || [];
  boardEl.innerHTML = state.board.map((cell, idx) => {
    const classes = ['tttCell'];
    if (cell) classes.push('isFilled');
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
  if (state.mode === 'ai' && state.turn !== 'X') return;

  state.board[index] = state.turn;
  const after = tttWinner(state.board);
  if (after.winner) {
    state.gameOver = true;
    state.winner = after.winner;
    state.message = after.winner === 'draw'
      ? 'Remíza. Dobře hrané.'
      : (after.winner === 'X' ? 'Vyhrál jsi.' : 'Vyhrála O.');
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
    const fresh = tttGetState();
    if (fresh.gameOver) return;
    const aiMove = tttBestMove(fresh.board.slice(), fresh.difficulty || 'ai');
    if (aiMove < 0 || fresh.board[aiMove]) return;
    fresh.board[aiMove] = 'O';
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
  }, 180);
}

function resetTicTacToeGame(keepScreen) {
  const state = tttGetState();
  state.board = Array(TTT_TOTAL_CELLS).fill('');
  state.turn = 'X';
  state.gameOver = false;
  state.winner = null;
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
  const gap = parseFloat(styles.gap || styles.columnGap || '3') || 3;
  const cellW = Math.floor((wrapRect.width - gap * (TTT_COLS - 1)) / TTT_COLS);
  const cellH = Math.floor((wrapRect.height - gap * (TTT_ROWS - 1)) / TTT_ROWS);
  const cell = Math.max(14, Math.min(cellW, cellH));

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
      range: 'v.1(250)–v.1(271)',
      title: 'Aktuální úpravy',
      lines: [
        'Jídelna a kantýna teď používají shodné dny na jednom řádku.',
        'Dashboard ukazuje další směnu D, kdo na ní chybí, a u průběhu směny i procenta.',
        'Odpočet do dovolené doplňuje, jestli jde o CZD nebo Vánoce.',
        'Kalkulačky pro frézky a brusy umí dopočítat i čas hotovosti.',
        'Bonus: piškvorky se schovávají za trojitý klik na O aplikaci.'
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
        '    <div>Import i export zůstávají schované v menu, aby zbytek aplikace působil čistě.</div>',
        '  </div>',
        '  ' + buildAppHistoryHtml(versionText),
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
    } else if (v === 'contact') {
      body.innerHTML = [
        '<div class="appMenuCard">',
        '  <div class="appMenuCardTitle">Kontakt</div>',
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
    } else {
      body.innerHTML = [
        '<div class="appMenuGrid">',
        '  <button type="button" class="appMenuAction" data-menu-action="import">Import Excelu</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="export">Export ZIP</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="settings">Nastavení</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="about">O aplikaci</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="contact">Kontakt</button>',
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
        } else if (action === 'reset-state') {
          if (confirm('Smazat uložený stav aplikace?')) {
            try {
              localStorage.removeItem(APP_KEY);
              localStorage.removeItem('rotationBuild');
              localStorage.removeItem(UI_PREFS_KEY);
            } catch (err) {
              console.warn(err);
            }
            location.reload();
          }
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
    setRotaceView('names');
    renderRotace();
    setBottomNavActive('rotace');
  } else if (id === 'brusy') {
    renderBrusy();
    setBottomNavActive('kalkulacky');
  } else if (id === 'soustruhy') {
    renderSoustruhy();
    setBottomNavActive('kalkulacky');
  } else if (id === 'frezky') {
    setBottomNavActive('kalkulacky');
  } else if (id === 'jidlo') {
    if (typeof renderFoodSchedulePage === 'function') {
      renderFoodSchedulePage();
    }
    setBottomNavActive('home');
  } else if (id === 'kalkulacky') {
    setBottomNavActive('kalkulacky');
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
    setBottomNavActive('home');
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
