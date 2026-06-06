// RaK 1.2 (1.136) – klasické hry 2048, Had a Flappy Car.

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

try { window.rakMarkModuleReady && window.rakMarkModuleReady('games-classic.js', 'loaded', { source: 'script' }); } catch (err) {}
