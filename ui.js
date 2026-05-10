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
  padding:calc(10px + env(safe-area-inset-top)) 10px calc(10px + env(safe-area-inset-bottom));
  background:rgba(5,8,7,.72);
  backdrop-filter:blur(18px) saturate(145%);
  -webkit-backdrop-filter:blur(18px) saturate(145%);
}
.tttOverlay.isVisible{display:flex;}
.tttShell{
  width:min(100%, 560px);
  height:100%;
  border:1px solid rgba(124,255,124,.18);
  border-radius:28px;
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
  overflow:auto;
  padding:16px;
}
.tttStartScreen,
.tttGameScreen{
  display:flex;
  flex-direction:column;
  gap:16px;
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
}
.tttBoardWrap{
  display:flex;
  justify-content:center;
}
.tttBoard{
  width:min(100%, 420px);
  aspect-ratio:1 / 1;
  display:grid;
  grid-template-columns:repeat(3, minmax(0, 1fr));
  gap:10px;
}
.tttCell{
  appearance:none;
  -webkit-appearance:none;
  font-family:inherit;
  border:1px solid rgba(124,255,124,.14);
  background:rgba(255,255,255,.04);
  border-radius:20px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:clamp(40px, 12vw, 66px);
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
  .tttShell{border-radius:24px;}
  .tttHeader{padding:14px 14px 10px;}
  .tttContent{padding:14px;}
  .tttLevelRow{grid-template-columns:1fr;}
  .tttToggleRow{grid-template-columns:1fr;}
  .tttBoard{gap:8px;}
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
    '      <span>easter egg</span>',
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

  return overlay;
}

function tttGetState() {
  if (!app.tttState) {
    app.tttState = {
      screen: 'start',
      mode: 'ai',
      difficulty: 'ai',
      board: Array(9).fill(''),
      turn: 'X',
      gameOver: false,
      winner: null,
      message: ''
    };
  }
  return app.tttState;
}

function tttWinner(board) {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every(Boolean)) return { winner: 'draw', line: [] };
  return { winner: null, line: [] };
}

function tttWinningMove(board, mark) {
  for (let i = 0; i < 9; i += 1) {
    if (board[i]) continue;
    const next = board.slice();
    next[i] = mark;
    if (tttWinner(next).winner === mark) return i;
  }
  return -1;
}

function tttMinimax(board, depth, maximizing, alpha, beta, memo) {
  const key = board.join('') + '|' + depth + '|' + maximizing;
  if (memo[key] !== undefined) return memo[key];

  const result = tttWinner(board).winner;
  if (result === 'O') return memo[key] = 10 - depth;
  if (result === 'X') return memo[key] = depth - 10;
  if (result === 'draw') return memo[key] = 0;

  const order = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  if (maximizing) {
    let best = -Infinity;
    for (const idx of order) {
      if (board[idx]) continue;
      board[idx] = 'O';
      const score = tttMinimax(board, depth + 1, false, alpha, beta, memo);
      board[idx] = '';
      if (score > best) best = score;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    memo[key] = best;
    return best;
  }

  let best = Infinity;
  for (const idx of order) {
    if (board[idx]) continue;
    board[idx] = 'X';
    const score = tttMinimax(board, depth + 1, true, alpha, beta, memo);
    board[idx] = '';
    if (score < best) best = score;
    if (best < beta) beta = best;
    if (beta <= alpha) break;
  }
  memo[key] = best;
  return best;
}

function tttBestMove(board, difficulty) {
  const free = board.map((cell, idx) => cell ? -1 : idx).filter(idx => idx >= 0);
  if (!free.length) return -1;
  if (difficulty === 'noob') {
    return free[Math.floor(Math.random() * free.length)];
  }

  const win = tttWinningMove(board, 'O');
  if (win >= 0) return win;
  const block = tttWinningMove(board, 'X');
  if (block >= 0) return block;

  if (difficulty === 'medium') {
    if (!board[4]) return 4;
    const corners = [0, 2, 6, 8].filter(i => !board[i]);
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    return free[Math.floor(Math.random() * free.length)];
  }

  const memo = {};
  let bestIdx = free[0];
  let bestScore = -Infinity;
  const order = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  for (const idx of order) {
    if (board[idx]) continue;
    board[idx] = 'O';
    const score = tttMinimax(board, 0, false, -Infinity, Infinity, memo);
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
      '  <div class="tttNote">AI režim je naschvál nastavený tak, aby nešel porazit. Nejvýš z toho bývá remíza.</div>',
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
      });
    });
    start.querySelectorAll('[data-ttt-difficulty]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.mode === 'pvp') return;
        state.difficulty = btn.getAttribute('data-ttt-difficulty') || 'ai';
        tttRender();
      });
    });
    start.querySelector('#tttStartBtn')?.addEventListener('click', () => {
      state.screen = 'game';
      state.board = Array(9).fill('');
      state.turn = 'X';
      state.gameOver = false;
      state.winner = null;
      state.message = state.mode === 'pvp'
        ? 'Hraje hráč X.'
        : 'Hraješ za X. AI je O.';
      tttRender();
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
    return;
  }

  if (state.mode === 'pvp') {
    state.turn = state.turn === 'X' ? 'O' : 'X';
    state.message = state.turn === 'X' ? 'Hraje hráč X.' : 'Hraje hráč O.';
    tttRender();
    return;
  }

  state.turn = 'O';
  state.message = 'Tah AI...';
  tttRender();

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
      return;
    }
    fresh.turn = 'X';
    fresh.message = 'Hraješ za X.';
    tttRender();
  }, 180);
}

function resetTicTacToeGame(keepScreen) {
  const state = tttGetState();
  state.board = Array(9).fill('');
  state.turn = 'X';
  state.gameOver = false;
  state.winner = null;
  state.message = state.mode === 'pvp' ? 'Hraje hráč X.' : 'Hraješ za X. AI je O.';
  if (!keepScreen) state.screen = 'start';
  tttRender();
}

function openTicTacToeGame() {
  const overlay = ensureTicTacToeOverlay();
  const state = tttGetState();
  state.screen = 'start';
  state.board = Array(9).fill('');
  state.turn = 'X';
  state.gameOver = false;
  state.winner = null;
  state.message = '';
  overlay.classList.add('isVisible');
  document.body.classList.add('tttOpen');
  tttRender();
}

function closeTicTacToeGame() {
  const overlay = document.getElementById('tttOverlay');
  if (overlay) overlay.classList.remove('isVisible');
  document.body.classList.remove('tttOpen');
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


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => applyUiPrefs(loadUiPrefs()));
} else {
  applyUiPrefs(loadUiPrefs());
}

function buildAppHistoryHtml(versionText) {
  const sections = [
    {
      range: 'v.1(250)–v.1(268)',
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
