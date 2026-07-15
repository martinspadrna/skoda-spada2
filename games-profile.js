// RaK 1.2 (1.155) – herní profily a leaderboardy.

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
  const arcade = incoming.arcade && typeof incoming.arcade === 'object' ? Object.assign({}, incoming.arcade) : {};
  Object.keys(arcade).forEach((gid) => {
    if (!gamesProfileIsLowTimeGame(gid)) return;
    const item = arcade[gid] && typeof arcade[gid] === 'object' ? Object.assign({}, arcade[gid]) : {};
    const rawTime = Number(item.bestTimeMs || item.leaderboardValue || item.timeMs || item.elapsedMs || 0) || 0;
    const safeTime = gamesProfileSanitizeLowTime(gid, rawTime);
    if (rawTime > 0 && !safeTime) {
      delete item.bestTimeMs;
      delete item.timeMs;
      delete item.elapsedMs;
      item.leaderboardValue = 0;
      if (String(gid || '').indexOf('memory') === 0) item.points = 0;
      arcade[gid] = item;
    } else if (safeTime > 0) {
      item.bestTimeMs = safeTime;
      item.leaderboardValue = safeTime;
      arcade[gid] = item;
    }
  });
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

const GAMES_PROFILE_LOW_POINT_SCALE = 1000000000;
const GAMES_PROFILE_SAFE_TIME_SCORE_SCALE = 5000;
const GAMES_PROFILE_LOW_TIME_IDS = new Set(['reaction', 'daily_reaction', 'memory', 'daily_memory', 'sudoku']);
function gamesProfileIsLowTimeGame(gameId) {
  const id = String(gameId || '').trim();
  return GAMES_PROFILE_LOW_TIME_IDS.has(id) || /^memory_\d+x\d+$/.test(id) || /^sudoku_(easy|medium|hard)$/.test(id);
}
function gamesProfileLowTimeUsesMs(gameId) {
  const id = String(gameId || '').trim();
  return id === 'reaction' || id === 'daily_reaction';
}
function gamesProfileMemoryMinValidMs(gameId) {
  const id = String(gameId || '').trim();
  if (id === 'memory_8x8') return 60000;
  if (id === 'memory_6x6') return 30000;
  if (id === 'memory' || id === 'memory_4x4' || id === 'daily_memory') return 12000;
  return 0;
}
function gamesProfileSanitizeLowTime(gameId, value) {
  const n = Number(value) || 0;
  if (!n || !gamesProfileIsLowTimeGame(gameId)) return n > 0 ? n : 0;
  const minMs = gamesProfileMemoryMinValidMs(gameId);
  if (minMs > 0 && n < minMs) return 0;
  if (n >= 86400000) return 0;
  if ((String(gameId || '').trim() === 'reaction' || String(gameId || '').trim() === 'daily_reaction') && n > 60000) return 0;
  return n;
}
function gamesProfileDecodeRemoteMetric(gameId, value) {
  const raw = Number(value) || 0;
  if (!raw || !gamesProfileIsLowTimeGame(gameId)) return raw;
  const rounded = Math.round(raw);
  // Zpětně čteme krátce používané 1e9 - čas_ms.
  if (rounded > 86400000 && rounded < GAMES_PROFILE_LOW_POINT_SCALE) {
    const decoded = GAMES_PROFILE_LOW_POINT_SCALE - rounded;
    if (decoded > 0 && decoded < 86400000) return decoded;
  }
  // RaK 1.2 (1.155): nový online zápis časových her je bezpečné score do 5000.
  if (rounded > 0 && rounded < GAMES_PROFILE_SAFE_TIME_SCORE_SCALE) {
    const metric = Math.max(1, GAMES_PROFILE_SAFE_TIME_SCORE_SCALE - rounded);
    return gamesProfileLowTimeUsesMs(gameId) ? metric : metric * 1000;
  }
  return gamesProfileSanitizeLowTime(gameId, raw);
}
function gamesProfileFormatTimeValue(gameId, value) {
  const n = Number(value) || 0;
  if (!n) return '—';
  if (typeof window !== 'undefined' && typeof window.RaKGamesFormatTimeValue === 'function') return window.RaKGamesFormatTimeValue(gameId, n);
  if (String(gameId || '') === 'reaction' || String(gameId || '') === 'daily_reaction') return String(Math.max(1, Math.round(n))) + ' ms';
  const seconds = Math.max(1, Math.round(n / 1000));
  if (seconds < 60) return String(seconds) + ' s';
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? (String(minutes) + ' min ' + String(rest) + ' s') : (String(minutes) + ' min');
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
  const rawPoints = Number(row.points ?? row.best_score ?? row.bestScore ?? row.value ?? 0) || 0;
  const points = gamesProfileDecodeRemoteMetric(gameType, rawPoints);
  const lastTs = gamesParseRemoteTimestamp(row.last_played_at || row.lastPlayedAt || row.updated_at || row.updatedAt);

  const mergeGeneric = (current) => {
    const base = Object.assign({}, current || {}, {
      plays: Math.max(Number(current && current.plays || 0) || 0, plays),
      wins: Math.max(Number(current && current.wins || 0) || 0, wins),
      losses: Math.max(Number(current && current.losses || 0) || 0, losses),
      draws: Math.max(Number(current && current.draws || 0) || 0, draws),
      points: Math.max(Number(current && current.points || 0) || 0, rawPoints),
      lastPlayedAt: Math.max(Number(current && current.lastPlayedAt || 0) || 0, lastTs || 0)
    });
    if (gamesProfileIsLowTimeGame(gameType)) {
      const oldTime = gamesProfileSanitizeLowTime(gameType, Number(current && (current.bestTimeMs || current.leaderboardValue) || 0) || 0);
      const nextRemoteTime = gamesProfileSanitizeLowTime(gameType, points);
      const nextTime = nextRemoteTime > 0 ? (oldTime > 0 ? Math.min(oldTime, nextRemoteTime) : nextRemoteTime) : oldTime;
      base.bestTimeMs = nextTime;
      base.leaderboardValue = nextTime;
    } else {
      base.bestScore = Math.max(Number(current && current.bestScore || 0) || 0, points);
      base.leaderboardValue = Math.max(Number(current && current.leaderboardValue || 0) || 0, points);
    }
    return base;
  };

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
    const activeAccountId = String(profile && profile.activeAccountId || '').trim();
    const remoteAccounts = await bridge.loadGameAccounts().catch(() => []);
    const leaderboardStatsRows = typeof bridge.loadGameStats === 'function'
      ? (await Promise.all(gamesGetRemoteProfileStatIds().map((id) => {
          const limit = id === 'ttt' ? 100 : 20;
          return bridge.loadGameStats(id, limit, { force: !!force }).catch(() => []);
        }))).flat()
      : [];
    // RaK 1.2 (1.155): aktivní profil nesmí záviset jen na Top score limitech.
    // PC bez lokální historie si musí rank/theme dopočítat přímo ze všech statistik svého účtu.
    const activeAccountStatsRows = activeAccountId && typeof bridge.loadGameStatsForAccount === 'function'
      ? await bridge.loadGameStatsForAccount(activeAccountId, { force: !!force }).catch(() => [])
      : [];
    const remoteStatsRows = leaderboardStatsRows.concat(activeAccountStatsRows);
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
      if (typeof applyProfileUiPreferencesForActiveAccount === 'function') applyProfileUiPreferencesForActiveAccount({ loadRemote: false, source: 'remote-stats-sync' });
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
  if (typeof rakAdminPromptUnlockForAccount === 'function' && !rakAdminPromptUnlockForAccount(id)) return false;
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
  // RaK 1.2 (1.155): po přihlášení vynutit načtení statistik aktivního účtu,
  // aby se rank a odemčené theme/pozadí sjednotily mezi mobilem a PC.
  void gamesSyncProfileFromRemote(true).then(() => {
    if (typeof applyProfileUiPreferencesForActiveAccount === 'function') applyProfileUiPreferencesForActiveAccount({ loadRemote: false, source: 'login-remote-stats' });
    if (typeof renderGamesProfileStatus === 'function') renderGamesProfileStatus();
    gamesRenderProfiles();
    gamesRenderAchievements();
    gamesRenderStats();
    if (typeof renderThemeSettingsCards === 'function') renderThemeSettingsCards();
    if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
  });
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
  if (typeof rakAdminLock === 'function') rakAdminLock();
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
        if (!gamesSetActiveAccount(found.id)) {
          setLoginFeedback('PĹ™ihlĂˇĹˇenĂ­ se nepovedlo');
          inputEl.focus();
          inputEl.select();
          return;
        }
      } catch (err) {
        console.warn('games account save failed', err);
        setLoginFeedback('PĹ™ihlĂˇĹˇenĂ­ se nepovedlo');
        inputEl.focus();
        inputEl.select();
        return;
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
  const rawValue = Number(row && (row.value ?? row.points ?? row.bestScore ?? row.best_score ?? row.games_played) || 0) || 0;
  const value = gamesProfileDecodeRemoteMetric(id, rawValue);
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
    const lowBetter = gamesProfileIsLowTimeGame(id);
    const merged = Object.assign({}, local, {
      plays: Math.max(Number(local.plays || 0) || 0, gamesPlayed || (value > 0 ? 1 : 0)),
      points: Math.max(Number(local.points || 0) || 0, value),
      leaderboardValue: Math.max(Number(local.leaderboardValue || 0) || 0, value),
      lastPlayedAt: Math.max(Number(local.lastPlayedAt || 0) || 0, updated || 0)
    });
    if (lowBetter) {
      const oldTime = gamesProfileSanitizeLowTime(id, Number(local.bestTimeMs || local.leaderboardValue || 0) || 0);
      const nextRemoteTime = gamesProfileSanitizeLowTime(id, value);
      merged.bestTimeMs = oldTime && nextRemoteTime ? Math.min(oldTime, nextRemoteTime) : (oldTime || nextRemoteTime || 0);
      merged.leaderboardValue = merged.bestTimeMs || 0;
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
      else if (gameStats) value = gamesProfileIsLowTimeGame(game.id)
        ? Number(gameStats.bestTimeMs || gameStats.leaderboardValue || 0) || 0
        : Number(gameStats.bestScore || gameStats.leaderboardValue || gameStats.plays || 0) || 0;
      const display = game.id === 'ttt'
        ? (String(value) + '× · V ' + String(Number((gameStats && gameStats.wins) || total.ttt.wins || 0) || 0) + ' / P ' + String(Number((gameStats && gameStats.losses) || total.ttt.losses || 0) || 0) + ' / R ' + String(Number((gameStats && gameStats.draws) || total.ttt.draws || 0) || 0))
        : (gamesProfileIsLowTimeGame(game.id) ? gamesProfileFormatTimeValue(game.id, value) : (String(value) + ' ' + game.unit));
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


const GAMES_ACTIVE_ACCOUNT_DIRECT_STATS_CONTRACT_V1144 = Object.freeze({
  version: '1.2 (1.155)',
  scope: 'games-profile-rank-sync',
  issue: 'rank a appearance unlocky nesmí záviset jen na leaderboard/top-score limitech',
  activeAccountLoader: 'RotationSupabaseBridge.loadGameStatsForAccount(accountNumber)',
  protectedAccount: 'aktivní účet podle account_number',
  result: 'mobil a PC počítají rank/theme/pozadí ze stejných online statistik účtu'
});
window.GAMES_ACTIVE_ACCOUNT_DIRECT_STATS_CONTRACT_V1144 = GAMES_ACTIVE_ACCOUNT_DIRECT_STATS_CONTRACT_V1144;


window.GAMES_MEMORY_TIME_SANITIZE_CONTRACT_V1152 = Object.freeze({
  version: '1.2 (1.155)',
  guard: 'memory-total-time-no-5s-v1153-guard',
  memory4x4FiveSecondsInvalid: gamesProfileSanitizeLowTime('memory_4x4', 5000) === 0,
  memory6x6FiveSecondsInvalid: gamesProfileSanitizeLowTime('memory_6x6', 5000) === 0,
  memory8x8FiveSecondsInvalid: gamesProfileSanitizeLowTime('memory_8x8', 5000) === 0,
  memory82SecondsValid: gamesProfileSanitizeLowTime('memory_6x6', 82000) === 82000
});
const GAMES_TIME_PROFILE_FORMAT_CONTRACT_V1144 = Object.freeze({
  version: '1.2 (1.155)',
  guard: 'games-time-profile-format-v1144-guard',
  lowTimeGames: ['reaction', 'memory', 'sudoku'],
  reactionUnit: 'ms',
  longerTimes: 'min+s',
  decodedEncodedLowScore: gamesProfileDecodeRemoteMetric('sudoku', 999875000) === 125000
});
window.GAMES_TIME_PROFILE_FORMAT_CONTRACT_V1144 = GAMES_TIME_PROFILE_FORMAT_CONTRACT_V1144;

try { if (typeof window !== 'undefined' && typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('games-profile.js','loaded',{source:'games-profile'}); } catch (err) {}
