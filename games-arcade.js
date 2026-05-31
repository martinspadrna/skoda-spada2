// RaK 1.2 (1.65) – arcade hry a denní challenge.
(() => {
  if (window.__rakArcadeLoaded) return;
  window.__rakArcadeLoaded = true;

  // v.1.5 (743): Lodě mají spodní akce flotily v běžném toku pod boardem a nad spodní lištou.
  const CORE_GAMES = ['ttt', 'ships', '2048', 'snake', 'flap', 'aim', 'reaction', 'tetris', 'shooter', 'brick', 'doodle', 'bubble', 'sudoku', 'mines', 'memory', 'bomber', 'pampuch', 'daily'];
  const EXTRA_GAMES = [];
  const ALL_GAMES = CORE_GAMES.concat(EXTRA_GAMES);
  const LEGACY_RENDER_GAMES = ['2048', 'snake', 'flap'];
  const ARCADE_RENDER_GAMES = ['aim', 'reaction', 'tetris', 'shooter', 'brick', 'doodle', 'bubble', 'sudoku', 'mines', 'memory', 'bomber', 'pampuch', 'ships', 'daily'];
  const POINT_SCALE = 1000000000;
  const ARC_KEY = 'arcade';
  const DAILY_MODES = ['aim', 'reaction', 'memory', 'mines', 'bubble', 'doodle', 'brick', 'shooter', 'bomber', 'pampuch', 'ships'];

  const META = {
    ttt: { title: 'Piškvorky', subtitle: 'AI, lokální duel a pozvánky', unit: 'her', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5.2" y="5.2" width="13.6" height="13.6" rx="3"></rect><path d="M9 9.1l3 3 3-3"></path><circle cx="9.2" cy="15" r="1.1"></circle><circle cx="14.8" cy="15" r="1.1"></circle><path d="M8.1 6.5v11M12 6.5v11M15.9 6.5v11M6.5 10.1h11M6.5 13.9h11"></path></svg>' },
    '2048': { title: '2048', subtitle: 'Skládej čísla do sebe', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.8" y="4.8" width="5.8" height="5.8" rx="1.8"></rect><rect x="13.4" y="4.8" width="5.8" height="5.8" rx="1.8"></rect><rect x="4.8" y="13.4" width="5.8" height="5.8" rx="1.8"></rect><rect x="13.4" y="13.4" width="5.8" height="5.8" rx="1.8"></rect></svg>' },
    snake: { title: 'Snake', subtitle: 'Klasická hadí hra', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 16.5c1.8-5 4.3-8 8.1-8 2.5 0 4.5 1.1 5.9 3"></path><circle cx="18.3" cy="11.7" r="2"></circle></svg>' },
    flap: { title: 'Flappy Car', subtitle: 'Klepni a proleť mezi překážkami', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 14.8c2.2-4.8 5.8-7 8.4-7 1.8 0 3.4.7 4.8 2"></path><path d="M9.2 11.2c1.6 0 3.2.4 4.8 1.5"></path><path d="M14.2 14.5c1.4 0 2.8.6 4.2 1.9"></path></svg>' },
    aim: { title: 'Aim Trainer', subtitle: 'Klikání na targety, combo a accuracy', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6.8"></circle><circle cx="12" cy="12" r="2.2"></circle><path d="M12 2.8v3.2M21.2 12h-3.2M12 21.2V18M2.8 12H6"></path></svg>' },
    reaction: { title: 'Reaction Test', subtitle: 'Klikni po změně barvy', unit: 's', mode: 'low', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 6h10M7 18h10"></path><path d="M9 6v4l-2 2 2 2v4M15 6v4l2 2-2 2v4"></path></svg>' },
    tetris: { title: 'Tetris', subtitle: 'Moderní glow styl a ghost piece', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h4v4H5zM9 5h4v4H9zM9 9h4v4H9zM13 9h4v4h-4zM13 13h4v4h-4z"></path></svg>' },
    shooter: { title: 'Space Shooter', subtitle: 'Neon střílečka se score', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l3.2 6.2L21 12l-5.8 2.8L12 21l-3.2-6.2L3 12l5.8-2.8z"></path><path d="M12 8.5v7"></path></svg>' },
    brick: { title: 'Brick Breaker', subtitle: 'Neon arkanoid a combo odrazy', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16v3H4zM6 13h12v3H6zM8 18h8v2H8z"></path><path d="M12 4v3"></path></svg>' },
    doodle: { title: 'Doodle Jump', subtitle: 'Nekonečné skákání na mobil', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19c2-4 4-5 8-8"></path><path d="M12 4l2.2 4.6L19 11l-4.8 1.2L12 17l-2.2-4.8L5 11l4.8-2.4z"></path></svg>' },
    bubble: { title: 'Bubble Shooter', subtitle: 'Relax, komba a denní rekordy', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="9" r="3"></circle><circle cx="15.5" cy="10.5" r="2.6"></circle><circle cx="12" cy="16" r="3.4"></circle></svg>' },
    sudoku: { title: 'Sudoku', subtitle: 'Různé obtížnosti a časy', unit: 's', mode: 'low', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="4.5" width="15" height="15" rx="2"></rect><path d="M4.5 10h15M4.5 15h15M10 4.5v15M15 4.5v15"></path></svg>' },
    mines: { title: 'Minesweeper', subtitle: 'Rychlá pauza a score i při výbuchu', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"></circle><path d="M12 5v4M12 15v4M5 12h4M15 12h4M8.3 8.3l2.8 2.8M12.9 12.9l2.8 2.8M15.7 8.3l-2.8 2.8M11.1 12.9l-2.8 2.8"></path></svg>' },
    memory: { title: 'Memory / Pexeso', subtitle: 'Moderní animace a rychlé páry', unit: 's', mode: 'low', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="5" width="6.2" height="6.2" rx="1.5"></rect><rect x="13.3" y="5" width="6.2" height="6.2" rx="1.5"></rect><rect x="4.5" y="13.8" width="6.2" height="6.2" rx="1.5"></rect><rect x="13.3" y="13.8" width="6.2" height="6.2" rx="1.5"></rect></svg>' },
    bomber: { title: 'Bomberman mini', subtitle: 'Bludiště, bomby, příšerky a upgrady', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5h6v3H9z"></path><circle cx="12" cy="14" r="5"></circle><path d="M15.8 10.2l2-2"></path></svg>' },

    pampuch: { title: 'Pampuch', subtitle: 'Bludiště, body a duchové v retro stylu', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7.2"></circle><path d="M8.5 10.2h.1M15.5 10.2h.1"></path><path d="M8.7 14.2c2 1.5 4.6 1.5 6.6 0"></path><path d="M5.2 6.4c1.3-1.5 3-2.5 5-2.9M18.8 17.6c-1.3 1.5-3 2.5-5 2.9"></path></svg>' },
    ships: { title: 'Lodě online', subtitle: 'Online námořní souboj přes pozvánku', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15.5h16l-2 3.5H6z"></path><path d="M8 15.5V8l4-3 4 3v7.5"></path><path d="M10 11h4"></path><path d="M3.5 20.5c1.5.7 3 .7 4.5 0 1.5.7 3 .7 4.5 0 1.5.7 3 .7 4.5 0 1.2.5 2.4.6 3.5.2"></path></svg>' },
    daily: { title: 'Denní challenge', subtitle: 'Každý den jiná hra a stejná výzva', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="6.5" width="15" height="13" rx="2"></rect><path d="M8 4.5v4M16 4.5v4M4.5 10h15"></path><path d="M8 14l2.1 2.1L16.3 10"></path></svg>' }
  };

  // v.1.5 (778): Top výsledky pro hry s obtížností/volbou se vedou zvlášť podle vybrané volby.
  Object.assign(META, {
    memory_4x4: { title: 'Pexeso 4×4', subtitle: 'Top čas pro 4×4', unit: 's', mode: 'low', icon: META.memory.icon },
    memory_6x6: { title: 'Pexeso 6×6', subtitle: 'Top čas pro 6×6', unit: 's', mode: 'low', icon: META.memory.icon },
    memory_8x8: { title: 'Pexeso 8×8', subtitle: 'Top čas pro 8×8', unit: 's', mode: 'low', icon: META.memory.icon },
    sudoku_easy: { title: 'Sudoku lehké', subtitle: 'Top čas pro lehké Sudoku', unit: 's', mode: 'low', icon: META.sudoku.icon },
    sudoku_medium: { title: 'Sudoku střední', subtitle: 'Top čas pro střední Sudoku', unit: 's', mode: 'low', icon: META.sudoku.icon },
    sudoku_hard: { title: 'Sudoku těžké', subtitle: 'Top čas pro těžké Sudoku', unit: 's', mode: 'low', icon: META.sudoku.icon }
  });

  // v.1.5 (963): Denní challenge má vlastní leaderboard pro právě vybranou denní hru.
  // Nemíchá se tak Aim/Reaction/Pexeso/Miny atd. do jednoho společného denního Top score.
  DAILY_MODES.forEach((dailyMode) => {
    const source = META[dailyMode] || META.daily;
    META['daily_' + dailyMode] = {
      title: 'Daily · ' + (source.title || dailyMode),
      subtitle: 'Denní challenge jen pro tuto hru',
      unit: source.unit || 'bodů',
      mode: source.mode || 'high',
      icon: META.daily.icon
    };
  });

  window.RAK_ARCADE_GAMES = {
    core: CORE_GAMES.slice(),
    extra: EXTRA_GAMES.slice(),
    all: ALL_GAMES.slice(),
    meta: META
  };

  function getArcadeProfileStat(account, gameId) {
    const id = key(gameId);
    const acc = account || null;
    if (!acc || !acc.stats) return arcadeDefaults(id);
    if (id === 'ttt') return Object.assign({ plays: 0, wins: 0, losses: 0, draws: 0, bestMoves: null, bestTimeMs: null, lastPlayedAt: 0 }, acc.stats.ttt || {});
    if (id === '2048') return Object.assign({ plays: 0, bestScore: 0, bestTile: 0, lastPlayedAt: 0 }, acc.stats.g2048 || {});
    if (id === 'snake') return Object.assign({ plays: 0, bestScore: 0, bestLength: 0, lastPlayedAt: 0 }, acc.stats.snake || {});
    if (id === 'flap') return Object.assign({ plays: 0, bestScore: 0, bestPipes: 0, lastPlayedAt: 0 }, acc.stats.flap || {});
    acc.stats[ARC_KEY] = acc.stats[ARC_KEY] || {};
    return Object.assign(arcadeDefaults(id), acc.stats[ARC_KEY][id] || {});
  }

  function getArcadeProfileValue(account, gameId) {
    const id = key(gameId);
    const meta = META[id] || {};
    const st = getArcadeProfileStat(account, id);
    if (id === 'ttt') return Number(st.plays || 0) || 0;
    if (meta.mode === 'low') return Number(st.bestTimeMs || st.leaderboardValue || 0) || 0;
    return Number(st.bestScore || st.leaderboardValue || 0) || 0;
  }

  function getArcadeProfileDisplay(account, gameId) {
    const id = key(gameId);
    const meta = META[id] || {};
    const st = getArcadeProfileStat(account, id);
    if (id === 'ttt') return `${Number(st.plays || 0) || 0}×`;
    if (meta.mode === 'low') return st.bestTimeMs ? fmtGameValue(id, st.bestTimeMs) : '—';
    return `${Number(st.bestScore || st.leaderboardValue || 0) || 0}`;
  }


  const GAMES_RANK_DEFS = [
    { name: 'Vemeno', minXp: 0 },
    { name: 'Učeň', minXp: 2400 },
    { name: 'Seřizovač', minXp: 7200 },
    { name: 'Týmař', minXp: 15000 },
    { name: 'Mistr', minXp: 28000 },
    { name: 'Senior', minXp: 46000 },
    { name: 'Legenda RaK', minXp: 72000 },
    { name: 'RaK nesmrtelný', minXp: 110000 }
  ];

  // v.1.5 (778): XP už nesmí být závislé hlavně na surovém skóre jedné hry.
  // Každá dokončená hra dává podobný základ a skóre/čas přidává jen rozumně omezený bonus.
  const GAMES_XP_VARIANT_IDS = new Set(['memory_4x4', 'memory_6x6', 'memory_8x8', 'sudoku_easy', 'sudoku_medium', 'sudoku_hard']);
  const GAMES_BALANCED_XP_BASE = 95;

  function gamesBalancedXpScoreBonus(id, stat) {
    const score = Math.max(0, Number(stat && (stat.bestScore || stat.leaderboardValue || stat.points) || 0) || 0);
    const time = Math.max(0, Number(stat && (stat.bestTimeMs || stat.timeMs || stat.elapsedMs) || 0) || 0);
    if (isLowBetter(id)) {
      if (!time) return 0;
      const seconds = Math.max(1, Math.round(time / 1000));
      const fastBonus = Math.max(0, Math.min(90, Math.round(95 - Math.log(seconds + 1) * 12)));
      const diff = String(stat && stat.difficulty || '').toLowerCase();
      const size = Number(stat && stat.bestSize || 0) || 0;
      const difficultyBonus = diff.includes('hard') || diff.includes('těž') || size >= 8 ? 55 : (diff.includes('medium') || diff.includes('střed') || size >= 6 ? 32 : 14);
      return Math.max(40, Math.min(150, fastBonus + difficultyBonus));
    }
    if (!score) return 0;
    return Math.max(8, Math.min(170, Math.round(Math.log(score + 1) * 20)));
  }

  function gamesBalancedXpForStat(id, stat) {
    const gid = key(id);
    if (!gid || GAMES_XP_VARIANT_IDS.has(gid)) return { xp: 0, plays: 0, wins: 0, bestScore: 0 };
    const st = stat && typeof stat === 'object' ? stat : {};
    const plays = Math.max(0, Number(st.plays || st.games_played || st.completedPlays || 0) || 0);
    if (!plays && !(Number(st.bestScore || 0) > 0) && !(Number(st.bestTimeMs || 0) > 0)) return { xp: 0, plays: 0, wins: 0, bestScore: 0 };
    const wins = Math.max(0, Number(st.wins || 0) || 0) + Math.max(0, Number(st.onlineWins || 0) || 0);
    const draws = Math.max(0, Number(st.draws || 0) || 0);
    const clears = Math.max(0, Number(st.bestClears || st.bestStageClear || st.perfectClears || st.perfectRuns || 0) || 0);
    const outcomeBonus = Math.min(plays * 45, (wins * 34) + (draws * 14) + (clears * 18));
    const scoreBonus = gamesBalancedXpScoreBonus(gid, st);
    const bestScore = Math.max(0, Number(st.bestScore || st.leaderboardValue || 0) || 0);
    const xp = Math.max(0, Math.round((plays * GAMES_BALANCED_XP_BASE) + outcomeBonus + scoreBonus));
    return { xp, plays, wins: wins + clears, bestScore };
  }

  function gamesBuildBalancedXpSummary(account, achievements) {
    const stats = account && account.stats ? account.stats : {};
    const items = [
      ['ttt', stats.ttt || {}],
      ['2048', stats.g2048 || {}],
      ['snake', stats.snake || {}],
      ['flap', stats.flap || {}]
    ];
    const arcade = stats[ARC_KEY] && typeof stats[ARC_KEY] === 'object' ? stats[ARC_KEY] : {};
    Object.keys(arcade).forEach((id) => {
      if (!GAMES_XP_VARIANT_IDS.has(key(id))) items.push([id, arcade[id] || {}]);
    });
    let xp = 0;
    let plays = 0;
    let wins = 0;
    let bestScore = 0;
    let favorite = null;
    let favoriteXp = -1;
    items.forEach(([id, stat]) => {
      const part = gamesBalancedXpForStat(id, stat);
      xp += part.xp;
      plays += part.plays;
      wins += part.wins;
      bestScore = Math.max(bestScore, part.bestScore);
      if (part.xp > favoriteXp) {
        favoriteXp = part.xp;
        favorite = id;
      }
    });
    xp += Math.max(0, Number(achievements || 0) || 0) * 110;
    return {
      xp: Math.max(0, Math.round(xp)),
      plays,
      wins,
      bestScore,
      favorite: favorite && META[favorite] ? META[favorite].title : '—'
    };
  }

  function gamesBuildProgressSummary(account) {
    const total = gamesGetTotals(account);
    const achievements = gamesGetAchievementCount(account);
    const balancedXp = gamesBuildBalancedXpSummary(account, achievements);
    const wins = Number(balancedXp.wins || 0) || 0;
    const plays = Number(balancedXp.plays || 0) || 0;
    const bestScore = Number(balancedXp.bestScore || total.bestScore || 0) || 0;
    const xp = Math.max(0, Math.round(Number(balancedXp.xp || 0) || 0));
    const levelStep = 600;
    const level = Math.max(1, Math.floor(xp / levelStep) + 1);
    const levelBase = (level - 1) * levelStep;
    const currentXp = xp - levelBase;
    const nextXp = level * levelStep;
    const rank = [...GAMES_RANK_DEFS].reverse().find(r => xp >= r.minXp) || GAMES_RANK_DEFS[0];
    const nextRank = GAMES_RANK_DEFS.find(r => xp < r.minXp) || null;
    const rankBase = Number(rank && rank.minXp || 0) || 0;
    const rankTarget = nextRank ? Number(nextRank.minXp || 0) : Math.max(rankBase + (levelStep * 4), xp);
    const rankSpan = Math.max(1, rankTarget - rankBase);
    const rankPct = nextRank ? Math.max(0, Math.min(100, Math.round(((xp - rankBase) / rankSpan) * 100))) : 100;
    const rankRemaining = Math.max(0, rankTarget - xp);
    const favorite = balancedXp.favorite || '—';
    const winRate = plays > 0 ? Math.round((wins / plays) * 100) : 0;
    return { xp, level, currentXp, nextXp, rank: rank.name, nextRank: nextRank ? nextRank.name : '', rankPct, rankRemaining, plays, achievements, wins, winRate, favorite, bestScore };
  }
  window.gamesBuildProgressSummary = gamesBuildProgressSummary;
  window.GAMES_RANK_DEFS = GAMES_RANK_DEFS;


  function gamesLocalDateKey(date) {
    const d = date instanceof Date ? date : new Date(date || Date.now());
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function gamesGetActiveShiftForContext(date) {
    try {
      if (typeof getDashboardActiveWorkShift === 'function') return getDashboardActiveWorkShift(date) || null;
    } catch (err) {}
    try {
      if (typeof getActiveShiftNow === 'function') return getActiveShiftNow(date) || null;
    } catch (err) {}
    return null;
  }

  function gamesBuildCompletionContext(timestamp) {
    const when = new Date(timestamp || Date.now());
    const hour = when.getHours();
    const day = when.getDay();
    const activeShift = gamesGetActiveShiftForContext(when);
    const rawShiftTeam = String(activeShift && activeShift.team ? activeShift.team : '').trim().toUpperCase();
    const rawShiftLabel = String(activeShift && activeShift.label ? activeShift.label : '').trim();
    const label = rawShiftLabel.toLowerCase();
    const isShiftD = !!activeShift && rawShiftTeam === 'D';
    // v.1.1 (740): herní achievementy s podmínkou „ve směně“ se počítají jen tehdy,
    // když je opravdu aktivní směna D v práci. Ostatní směny zůstanou uložené jen diagnosticky v lastContext.
    return {
      dateKey: gamesLocalDateKey(when),
      hour,
      day,
      isWeekend: day === 0 || day === 6,
      isNightHours: hour >= 22 || hour < 6,
      isEarlyMorning: hour >= 4 && hour < 7,
      isLunchWindow: hour >= 11 && hour < 14,
      rawIsOnShift: !!activeShift,
      rawShiftTeam,
      rawShiftLabel,
      isOnShift: isShiftD,
      isNightShift: isShiftD && label.includes('noční'),
      isMorningShift: isShiftD && label.includes('ranní'),
      shiftTeam: isShiftD ? 'D' : '',
      isShiftD,
      shiftLabel: isShiftD ? rawShiftLabel : ''
    };
  }

  function gamesMergeCompletionContext(currentContext, ctx) {
    const current = currentContext && typeof currentContext === 'object' ? currentContext : {};
    const next = Object.assign({
      completedPlays: 0,
      weekendPlays: 0,
      nightHourPlays: 0,
      earlyMorningPlays: 0,
      lunchWindowPlays: 0,
      onShiftPlays: 0,
      nightShiftPlays: 0,
      morningShiftPlays: 0,
      shiftDPlays: 0,
      onlinePlays: 0,
      onlineWins: 0,
      playedDays: [],
      shiftDPlayedDays: [],
      shiftTeams: {},
      lastContext: null
    }, current);
    next.completedPlays = (Number(next.completedPlays || 0) || 0) + 1;
    if (ctx.isWeekend) next.weekendPlays = (Number(next.weekendPlays || 0) || 0) + 1;
    if (ctx.isNightHours) next.nightHourPlays = (Number(next.nightHourPlays || 0) || 0) + 1;
    if (ctx.isEarlyMorning) next.earlyMorningPlays = (Number(next.earlyMorningPlays || 0) || 0) + 1;
    if (ctx.isLunchWindow) next.lunchWindowPlays = (Number(next.lunchWindowPlays || 0) || 0) + 1;
    if (ctx.isOnShift) next.onShiftPlays = (Number(next.onShiftPlays || 0) || 0) + 1;
    if (ctx.isNightShift) next.nightShiftPlays = (Number(next.nightShiftPlays || 0) || 0) + 1;
    if (ctx.isMorningShift) next.morningShiftPlays = (Number(next.morningShiftPlays || 0) || 0) + 1;
    if (ctx.isShiftD) next.shiftDPlays = (Number(next.shiftDPlays || 0) || 0) + 1;
    const days = Array.isArray(next.playedDays) ? next.playedDays.map(String) : [];
    if (ctx.dateKey && !days.includes(ctx.dateKey)) days.push(ctx.dateKey);
    next.playedDays = days.slice(-180);
    const dDays = Array.isArray(next.shiftDPlayedDays) ? next.shiftDPlayedDays.map(String) : [];
    if (ctx.isShiftD && ctx.dateKey && !dDays.includes(ctx.dateKey)) dDays.push(ctx.dateKey);
    next.shiftDPlayedDays = dDays.slice(-180);
    const teams = next.shiftTeams && typeof next.shiftTeams === 'object' ? Object.assign({}, next.shiftTeams) : {};
    if (ctx.shiftTeam) teams[ctx.shiftTeam] = (Number(teams[ctx.shiftTeam] || 0) || 0) + 1;
    next.shiftTeams = teams;
    next.lastContext = ctx;
    return next;
  }

  function gamesGetStatContext(stat) {
    return stat && stat.context && typeof stat.context === 'object' ? stat.context : {};
  }

  function gamesGetContextTotals(account) {
    const stats = account && account.stats ? account.stats : {};
    const contexts = [stats.ttt, stats.g2048, stats.snake, stats.flap]
      .concat(Object.values(stats.arcade && typeof stats.arcade === 'object' ? stats.arcade : {}))
      .map(gamesGetStatContext);
    const totals = {
      completedPlays: 0,
      weekendPlays: 0,
      nightHourPlays: 0,
      earlyMorningPlays: 0,
      lunchWindowPlays: 0,
      onShiftPlays: 0,
      nightShiftPlays: 0,
      morningShiftPlays: 0,
      shiftDPlays: 0,
      onlinePlays: 0,
      onlineWins: 0,
      playedDays: [],
      shiftDPlayedDays: [],
      shiftTeams: {},
      shiftTeamCount: 0,
      distinctPlayedDays: 0,
      distinctShiftDDays: 0
    };
    const days = new Set();
    const dDays = new Set();
    const teams = {};
    contexts.forEach((ctx) => {
      ['completedPlays','weekendPlays','nightHourPlays','earlyMorningPlays','lunchWindowPlays','onShiftPlays','nightShiftPlays','morningShiftPlays','shiftDPlays','onlinePlays','onlineWins'].forEach((field) => {
        totals[field] += Number(ctx && ctx[field] || 0) || 0;
      });
      (Array.isArray(ctx && ctx.playedDays) ? ctx.playedDays : []).forEach(day => { if (day) days.add(String(day)); });
      (Array.isArray(ctx && ctx.shiftDPlayedDays) ? ctx.shiftDPlayedDays : []).forEach(day => { if (day) dDays.add(String(day)); });
      const sourceTeams = ctx && ctx.shiftTeams && typeof ctx.shiftTeams === 'object' ? ctx.shiftTeams : {};
      Object.keys(sourceTeams).forEach((team) => {
        teams[team] = (Number(teams[team] || 0) || 0) + (Number(sourceTeams[team] || 0) || 0);
      });
    });
    totals.playedDays = Array.from(days).sort();
    totals.shiftDPlayedDays = Array.from(dDays).sort();
    totals.distinctPlayedDays = totals.playedDays.length;
    totals.distinctShiftDDays = totals.shiftDPlayedDays.length;
    totals.shiftTeams = teams;
    totals.shiftTeamCount = Object.keys(teams).length;
    return totals;
  }

  function gamesGetContextForGame(account, id) {
    const stat = gamesGetCurrentStatForContext(account, id);
    return gamesGetStatContext(stat);
  }

  function gamesContextProgressForGame(account, id, field) {
    const ctx = gamesGetContextForGame(account, id);
    return Number(ctx && ctx[field] || 0) || 0;
  }

  function gamesContextDistinctDaysForGame(account, id, field) {
    const ctx = gamesGetContextForGame(account, id);
    const values = Array.isArray(ctx && ctx[field]) ? ctx[field] : [];
    return new Set(values.map(String).filter(Boolean)).size;
  }

  function gamesGetCurrentStatForContext(account, id) {
    if (!account || !account.stats) return {};
    if (id === 'ttt') return account.stats.ttt || {};
    if (id === '2048') return account.stats.g2048 || {};
    if (id === 'snake') return account.stats.snake || {};
    if (id === 'flap') return account.stats.flap || {};
    return getAccountStat(account, id) || {};
  }

  function gamesAttachCompletionContext(account, id, patch) {
    const nextPatch = patch || {};
    const currentStat = gamesGetCurrentStatForContext(account, id);
    const ctx = gamesBuildCompletionContext(nextPatch.lastPlayedAt || Date.now());
    nextPatch.context = gamesMergeCompletionContext(currentStat.context, ctx);
    if (nextPatch.online === true || nextPatch.onlinePlay === true || Number(nextPatch.onlinePlays || 0) > 0 || id === 'ships') {
      nextPatch.context.onlinePlays = (Number(nextPatch.context.onlinePlays || 0) || 0) + Math.max(1, Number(nextPatch.onlinePlays || 0) || 1);
    }
    if (nextPatch.onlineWin === true || Number(nextPatch.onlineWins || 0) > 0) {
      nextPatch.context.onlineWins = (Number(nextPatch.context.onlineWins || 0) || 0) + Math.max(1, Number(nextPatch.onlineWins || 0) || 1);
    }
    return nextPatch;
  }

  // v.1.5 (920): Malý DOM/security hardening pro profily, statistiky a achievementy.
  // Uživatelské texty a číselné hodnoty se normalizují před složením HTML.
  const GAMES_PROFILE_DOM_HARDENING = {
    mode: 'games-profile-achievement-dom-hardening-v920',
    sinks: ['gamesProfilesGrid', 'gamesAchievementsGrid', 'gamesStatsGrid'],
    escapedFields: ['profileName', 'profileId', 'initials', 'rank', 'favorite', 'gameTitle', 'valueText', 'achievementTitle', 'achievementId', 'achievementDesc', 'achievementGoal'],
    numericFields: ['level', 'xp', 'winRate', 'plays', 'achievements', 'progress', 'target', 'pct'],
    maxNameLength: 48,
    maxIdLength: 40,
    maxLabelLength: 80,
    maxLongTextLength: 160
  };

  function gamesProfileSafeText(value, fallback, maxLength) {
    const raw = String(value == null ? '' : value)
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const text = raw || String(fallback || '');
    return text.slice(0, Math.max(1, Number(maxLength || GAMES_PROFILE_DOM_HARDENING.maxLabelLength) || GAMES_PROFILE_DOM_HARDENING.maxLabelLength));
  }

  function gamesProfileSafeName(value, fallback) {
    return gamesProfileSafeText(value, fallback || 'Hráč', GAMES_PROFILE_DOM_HARDENING.maxNameLength) || 'Hráč';
  }

  function gamesProfileSafeId(value) {
    return gamesProfileSafeText(value, '', GAMES_PROFILE_DOM_HARDENING.maxIdLength);
  }

  function gamesProfileSafeInitials(name, id) {
    const source = gamesProfileSafeName(name, id ? ('Hráč ' + String(id)) : '?');
    return gamesProfileSafeText(source, '?', 2).toUpperCase() || '?';
  }

  function gamesProfileSafeInt(value, maxValue) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(Number(maxValue || 999999999) || 999999999, Math.round(n)));
  }

  function gamesProfileSafePct(value) {
    return Math.max(0, Math.min(100, gamesProfileSafeInt(value, 100)));
  }

  function gamesProfileValueText(value, fallback, maxLength) {
    return gamesProfileSafeText(value, fallback || '0', maxLength || GAMES_PROFILE_DOM_HARDENING.maxLabelLength);
  }

  function renderProfilesExtended() {
    const grid = document.getElementById('gamesProfilesGrid');
    if (!grid) return;
    const profile = gamesGetProfile();
    const activeId = profile.activeAccountId;
    const accounts = Object.values(profile.accounts || {}).filter(acc => !GAMES_ACCOUNT_BLOCKLIST.has(String(acc && acc.id || '').trim())).sort((a, b) => {
      const aActive = String(a && a.id || '') === String(activeId || '');
      const bActive = String(b && b.id || '') === String(activeId || '');
      if (aActive !== bActive) return aActive ? -1 : 1;
      const ai = Number(a && a.id ? a.id : 0) || 0;
      const bi = Number(b && b.id ? b.id : 0) || 0;
      return ai - bi;
    });

    if (!accounts.length) {
      const emptyHtml = '<div class="smallText">Zatím nejsou žádné profily.</div>';
      if (grid.__rakLastProfilesHtml === emptyHtml && grid.childElementCount) {
        gamePerf.profileRenderSkips = Number(gamePerf.profileRenderSkips || 0) + 1;
        return;
      }
      grid.__rakLastProfilesHtml = emptyHtml;
      gamePerf.profileRenderRuns = Number(gamePerf.profileRenderRuns || 0) + 1;
      grid.innerHTML = emptyHtml;
      return;
    }

    const defs = ALL_GAMES.map((id) => Object.assign({ id }, META[id] || { title: id, subtitle: '', unit: 'bodů', mode: 'high' }));

    const nextHtml = accounts.map((acc) => {
      const progress = gamesBuildProgressSummary(acc);
      const last = acc.updatedAt ? gamesFormatPlayedLabel(acc.updatedAt) : 'Ještě bez hry';
      const profileRows = defs.map((game) => {
        const display = gamesProfileValueText(getArcadeProfileDisplay(acc, game.id), '0', 48);
        const unit = gamesProfileSafeText(game.unit || '', '', 16);
        const suffix = game.id === 'ttt' ? '' : (unit ? ' ' + unit : '');
        return '<div class="gamesProfileRow"><strong>' + escapeHtml(gamesProfileSafeText(game.title, game.id, GAMES_PROFILE_DOM_HARDENING.maxLabelLength)) + '</strong><span>' + escapeHtml(display + suffix) + '</span></div>';
      }).join('');
      const safeName = gamesProfileSafeName(acc.name, acc.id ? ('Hráč ' + String(acc.id)) : 'Hráč');
      const safeId = gamesProfileSafeId(acc.id || '');
      const initials = gamesProfileSafeInitials(safeName, safeId);
      const xpPct = gamesProfileSafePct(progress.rankPct);
      const safeLevel = gamesProfileSafeInt(progress.level, 999);
      const safeXp = gamesProfileSafeInt(progress.xp, 999999999);
      const safeWinRate = gamesProfileSafePct(progress.winRate);
      const safePlays = gamesProfileSafeInt(progress.plays, 999999999);
      const safeAchievements = gamesProfileSafeInt(progress.achievements, 999999);
      const safeFavorite = gamesProfileSafeText(progress.favorite, '—', GAMES_PROFILE_DOM_HARDENING.maxLabelLength);
      const safeLast = gamesProfileSafeText(last, 'Ještě bez hry', GAMES_PROFILE_DOM_HARDENING.maxLabelLength);
      const isActive = String(acc.id) === String(activeId);
      return [
        '<details class="gamesStatsCard' + (isActive ? ' isActive' : '') + '"' + (isActive ? ' open' : '') + '>',
        '  <summary class="gamesStatsCardSummary">',
        '    <div class="gamesStatsCardHead">',
        '      <div class="gamesProfileAvatar">' + escapeHtml(initials) + '</div>',
        '      <div class="gamesStatsCardHeadMain">',
        '        <div class="gamesStatsCardName">' + escapeHtml(safeName) + '</div>',
        '        <div class="gamesStatsCardId">' + escapeHtml(safeId) + '</div>',
        '        <div class="gamesStatsCardMeta gamesStatsCardMetaDense">' + escapeHtml(gamesProfileSafeText(progress.rank, 'Nováček', 32)) + ' · Level ' + String(safeLevel) + ' · XP ' + String(safeXp) + ' · Win rate ' + String(safeWinRate) + '%</div>',
        '      </div>',
        '      <div class="gamesStatsCardTotal">' + String(safePlays) + ' her</div>',
        '    </div>',
        '  </summary>',
        '  <div class="gamesStatsCardBody">',
        '    <div class="gamesStatsXpBar"><span style="--fill:' + String(xpPct) + '%"></span></div>',
        '    <div class="gamesStatsCardMeta gamesStatsCardMetaDense">Nejoblíbenější hra: ' + escapeHtml(safeFavorite) + ' · Achievementy: ' + String(safeAchievements) + '</div>',
        profileRows,
        '    <div class="gamesStatsCardMeta">' + escapeHtml(safeLast) + '</div>',
        '  </div>',
        '</details>'
      ].join('');
    }).join('');
    if (grid.__rakLastProfilesHtml === nextHtml && grid.childElementCount) {
      gamePerf.profileRenderSkips = Number(gamePerf.profileRenderSkips || 0) + 1;
      return;
    }
    grid.__rakLastProfilesHtml = nextHtml;
    gamePerf.profileRenderRuns = Number(gamePerf.profileRenderRuns || 0) + 1;
    grid.innerHTML = nextHtml;
  }

  function getExtendedAchievementDefs() {
    const arcadeStat = (account, id, field) => Number((account && account.stats && account.stats.arcade && account.stats.arcade[id] && account.stats.arcade[id][field]) || 0) || 0;
    return [
      { id: 'games_25', title: 'Zahřívací kolo', desc: 'Dokonči 25 započítaných her.', goalText: '25 dokončených her', progress: (a) => a.totalPlays, target: 25 },
      { id: 'games_75', title: 'Rozjetá mašina', desc: 'Dokonči 75 započítaných her.', goalText: '75 dokončených her', progress: (a) => a.totalPlays, target: 75 },
      { id: 'games_150', title: 'Herní držák', desc: 'Dokonči 150 započítaných her.', goalText: '150 dokončených her', progress: (a) => a.totalPlays, target: 150 },
      { id: 'games_300', title: 'Herní mistr dílny', desc: 'Dokonči 300 započítaných her.', goalText: '300 dokončených her', progress: (a) => a.totalPlays, target: 300 },
      { id: 'games_500', title: 'Legenda pauzy', desc: 'Dokonči 500 započítaných her.', goalText: '500 dokončených her', progress: (a) => a.totalPlays, target: 500 },
      { id: 'ttt_50', title: 'Piškvorkář', desc: 'Dokonči 50 partií Piškvorek.', goalText: '50 partií', progress: (a) => a.ttt.plays || 0, target: 50 },
      { id: 'ttt_100', title: 'Taktik', desc: 'Dokonči 100 partií Piškvorek.', goalText: '100 partií', progress: (a) => a.ttt.plays || 0, target: 100 },
      { id: 'ttt_50_wins', title: 'Nepříjemný soupeř', desc: 'Vyhraj 50krát v Piškvorkách.', goalText: '50 výher', progress: (a) => a.ttt.wins || 0, target: 50 },
      { id: 'ttt_120_wins', title: 'Piškvorkový boss', desc: 'Vyhraj 120krát v Piškvorkách.', goalText: '120 výher', progress: (a) => a.ttt.wins || 0, target: 120 },
      { id: '2048_5000', title: '2048 rozjezd', desc: 'Nahraj v 2048 skóre 5 000.', goalText: '5 000 bodů', progress: (a) => a.g2048.bestScore || 0, target: 5000 },
      { id: '2048_15000', title: '2048 stratég', desc: 'Nahraj v 2048 skóre 15 000.', goalText: '15 000 bodů', progress: (a) => a.g2048.bestScore || 0, target: 15000 },
      { id: '2048_tile_1024', title: 'Kámen 1024', desc: 'V 2048 dostaň kámen 1024.', goalText: 'kámen 1024', progress: (a) => a.g2048.bestTile || 0, target: 1024 },
      { id: '2048_tile_2048', title: 'Konečně 2048', desc: 'V 2048 dostaň kámen 2048.', goalText: 'kámen 2048', progress: (a) => a.g2048.bestTile || 0, target: 2048 },
      { id: 'snake_score_40', title: 'Hadí ruce', desc: 'Dej ve Snake skóre 40.', goalText: '40 bodů', progress: (a) => a.snake.bestScore || 0, target: 40 },
      { id: 'snake_score_80', title: 'Hadí legenda', desc: 'Dej ve Snake skóre 80.', goalText: '80 bodů', progress: (a) => a.snake.bestScore || 0, target: 80 },
      { id: 'snake_length_45', title: 'Dlouhý had', desc: 'Dostaň Snake na délku 45.', goalText: 'délka 45', progress: (a) => a.snake.bestLength || 0, target: 45 },
      { id: 'snake_length_80', title: 'Had přes celou halu', desc: 'Dostaň Snake na délku 80.', goalText: 'délka 80', progress: (a) => a.snake.bestLength || 0, target: 80 },
      { id: 'flap_25', title: 'První čistý průlet', desc: 'Dej ve Flappy Car 25 bodů.', goalText: '25 bodů', progress: (a) => a.flap.bestScore || 0, target: 25 },
      { id: 'flap_50', title: 'Flappy pilot', desc: 'Dej ve Flappy Car 50 bodů.', goalText: '50 bodů', progress: (a) => a.flap.bestScore || 0, target: 50 },
      { id: 'flap_75', title: 'Klidná ruka', desc: 'Dej ve Flappy Car 75 bodů.', goalText: '75 bodů', progress: (a) => a.flap.bestScore || 0, target: 75 },
      { id: 'flap_100', title: 'Letecký boss', desc: 'Dej ve Flappy Car 100 bodů.', goalText: '100 bodů', progress: (a) => a.flap.bestScore || 0, target: 100 },
      { id: 'flap_150', title: 'Pilot bez nervů', desc: 'Dej ve Flappy Car 150 bodů.', goalText: '150 bodů', progress: (a) => a.flap.bestScore || 0, target: 150 },
      { id: 'flap_runs_25', title: 'Trénink rytmu', desc: 'Dokonči 25 jízd ve Flappy Car.', goalText: '25 jízd', progress: (a) => a.flap.plays || 0, target: 25 },
      { id: 'flap_runs_100', title: 'Vytrvalý letec', desc: 'Dokonči 100 jízd ve Flappy Car.', goalText: '100 jízd', progress: (a) => a.flap.plays || 0, target: 100 },
      { id: 'aim_1500', title: 'Rychlá ruka', desc: 'Nahraj 1 500 bodů v Aim Traineru.', goalText: '1 500 bodů', progress: (a) => arcadeStat(a.account, 'aim', 'bestScore'), target: 1500 },
      { id: 'aim_3000', title: 'Ruka bez cuknutí', desc: 'Nahraj 3 000 bodů v Aim Traineru.', goalText: '3 000 bodů', progress: (a) => arcadeStat(a.account, 'aim', 'bestScore'), target: 3000 },
      { id: 'aim_4500', title: 'Target boss', desc: 'Nahraj 4 500 bodů v Aim Traineru.', goalText: '4 500 bodů', progress: (a) => arcadeStat(a.account, 'aim', 'bestScore'), target: 4500 },
      { id: 'aim_combo_20', title: 'Pevná ruka', desc: 'Dej combo 20 v Aim Traineru.', goalText: 'combo 20', progress: (a) => arcadeStat(a.account, 'aim', 'bestCombo'), target: 20 },
      { id: 'aim_combo_35', title: 'Laserová přesnost', desc: 'Dej combo 35 v Aim Traineru.', goalText: 'combo 35', progress: (a) => arcadeStat(a.account, 'aim', 'bestCombo'), target: 35 },
      { id: 'aim_accuracy_90', title: 'Devadesátka', desc: 'Dokonči Aim s přesností aspoň 90 %.', goalText: '90 % přesnost', progress: (a) => arcadeStat(a.account, 'aim', 'bestAccuracy'), target: 90 },
      { id: 'aim_accuracy_98', title: 'Chirurg', desc: 'Dokonči Aim s přesností aspoň 98 %.', goalText: '98 % přesnost', progress: (a) => arcadeStat(a.account, 'aim', 'bestAccuracy'), target: 98 },
      { id: 'aim_runs_50', title: 'Terče pod kontrolou', desc: 'Dokonči 50 kol Aim Traineru.', goalText: '50 dokončení', progress: (a) => arcadeStat(a.account, 'aim', 'plays'), target: 50 },
      { id: 'reaction_220', title: 'Rychlé oči', desc: 'Dostaň reakci pod 220 ms.', goalText: 'pod 220 ms', progress: (a) => { const t = arcadeStat(a.account, 'reaction', 'bestTimeMs'); return t ? Math.max(0, 1000 - t) : 0; }, target: 780 },
      { id: 'reaction_180', title: 'Blesk', desc: 'Dostaň reakci pod 180 ms.', goalText: 'pod 180 ms', progress: (a) => { const t = arcadeStat(a.account, 'reaction', 'bestTimeMs'); return t ? Math.max(0, 1000 - t) : 0; }, target: 820 },
      { id: 'reaction_150', title: 'Nervy z oceli', desc: 'Dostaň reakci pod 150 ms.', goalText: 'pod 150 ms', progress: (a) => { const t = arcadeStat(a.account, 'reaction', 'bestTimeMs'); return t ? Math.max(0, 1000 - t) : 0; }, target: 850 },
      { id: 'reaction_avg_240', title: 'Stabilní ruka', desc: 'Dokonči Reaction s průměrem pod 240 ms.', goalText: 'průměr pod 240 ms', progress: (a) => { const t = arcadeStat(a.account, 'reaction', 'bestAvgTimeMs'); return t ? Math.max(0, 1000 - t) : 0; }, target: 760 },
      { id: 'reaction_perfect_10', title: 'Bez zaváhání', desc: 'Dokonči 10 čistých Reaction sérií s každým kolem pod 250 ms.', goalText: '10 čistých sérií', progress: (a) => arcadeStat(a.account, 'reaction', 'perfectRuns'), target: 10 },
      { id: 'reaction_runs_50', title: 'Reflex tester', desc: 'Dokonči 50 Reaction testů.', goalText: '50 dokončení', progress: (a) => arcadeStat(a.account, 'reaction', 'plays'), target: 50 },
      { id: 'tetris_5000', title: 'Tetris mistr', desc: 'Nahraj 5 000 bodů v Tetrisu.', goalText: '5 000 bodů', progress: (a) => arcadeStat(a.account, 'tetris', 'bestScore'), target: 5000 },
      { id: 'tetris_12000', title: 'Tetris boss', desc: 'Nahraj 12 000 bodů v Tetrisu.', goalText: '12 000 bodů', progress: (a) => arcadeStat(a.account, 'tetris', 'bestScore'), target: 12000 },
      { id: 'tetris_lines_40', title: 'Čistič řádků', desc: 'Smaž v Tetrisu 40 řádků v jedné dokončené hře.', goalText: '40 řádků', progress: (a) => arcadeStat(a.account, 'tetris', 'bestLines'), target: 40 },
      { id: 'tetris_level_10', title: 'Level 10', desc: 'Dostaň se v Tetrisu na level 10.', goalText: 'level 10', progress: (a) => arcadeStat(a.account, 'tetris', 'bestLevel'), target: 10 },
      { id: 'tetris_runs_50', title: 'Padající bloky', desc: 'Dokonči 50 her Tetrisu.', goalText: '50 dokončení', progress: (a) => arcadeStat(a.account, 'tetris', 'plays'), target: 50 },
      { id: 'shooter_3500', title: 'Space ace', desc: 'Nahraj 3 500 bodů ve Space Shooteru.', goalText: '3 500 bodů', progress: (a) => arcadeStat(a.account, 'shooter', 'bestScore'), target: 3500 },
      { id: 'shooter_7000', title: 'Velitel hangáru', desc: 'Nahraj 7 000 bodů ve Space Shooteru.', goalText: '7 000 bodů', progress: (a) => arcadeStat(a.account, 'shooter', 'bestScore'), target: 7000 },
      { id: 'shooter_hits_150', title: 'Přesná palba', desc: 'Dej ve Space Shooteru 150 zásahů v jedné dokončené hře.', goalText: '150 zásahů', progress: (a) => arcadeStat(a.account, 'shooter', 'bestHits'), target: 150 },
      { id: 'shooter_survive_180', title: 'Tři minuty ve vesmíru', desc: 'Přežij ve Space Shooteru aspoň 180 sekund.', goalText: '180 s', progress: (a) => arcadeStat(a.account, 'shooter', 'bestSurvivalSec'), target: 180 },
      { id: 'shooter_runs_50', title: 'Vytrvalý pilot', desc: 'Dokonči 50 her Space Shooteru.', goalText: '50 dokončení', progress: (a) => arcadeStat(a.account, 'shooter', 'plays'), target: 50 },
      { id: 'shooter_boss_3', title: 'Lovec velitelů', desc: 'Sundej v jedné dokončené hře 3 bosse.', goalText: '3 bossové', progress: (a) => arcadeStat(a.account, 'shooter', 'bestBossKills'), target: 3 },
      { id: 'shooter_power_12', title: 'Sběrač upgradů', desc: 'Seber v jedné dokončené hře 12 upgradů.', goalText: '12 upgradů', progress: (a) => arcadeStat(a.account, 'shooter', 'bestPowerUps'), target: 12 },
      { id: 'shooter_weapon_3', title: 'Plná výzbroj', desc: 'Dostaň ve Space Shooteru zbraň na třetí úroveň.', goalText: 'úroveň 3', progress: (a) => arcadeStat(a.account, 'shooter', 'bestWeaponLevel'), target: 3 },
      { id: 'brick_2500', title: 'Bourák cihel', desc: 'Nahraj 2 500 bodů v Brick Breakeru.', goalText: '2 500 bodů', progress: (a) => arcadeStat(a.account, 'brick', 'bestScore'), target: 2500 },
      { id: 'brick_6000', title: 'Demolice haly', desc: 'Nahraj 6 000 bodů v Brick Breakeru.', goalText: '6 000 bodů', progress: (a) => arcadeStat(a.account, 'brick', 'bestScore'), target: 6000 },
      { id: 'brick_combo_20', title: 'Combo odrazy', desc: 'Dej v Brick Breakeru combo 20.', goalText: 'combo 20', progress: (a) => arcadeStat(a.account, 'brick', 'bestCombo'), target: 20 },
      { id: 'brick_clear_10', title: 'Čistá plocha', desc: 'Vyčisti 10 her Brick Breakeru.', goalText: '10 vyčištění', progress: (a) => arcadeStat(a.account, 'brick', 'perfectClears'), target: 10 },
      { id: 'brick_runs_50', title: 'Pálka v ruce', desc: 'Dokonči 50 her Brick Breakeru.', goalText: '50 dokončení', progress: (a) => arcadeStat(a.account, 'brick', 'plays'), target: 50 },
      { id: 'shooter_wave_8', title: 'První vlna', desc: 'Dostaň Space Shooter aspoň na obtížnost 8.', goalText: 'vlna 8', progress: (a) => arcadeStat(a.account, 'shooter', 'bestWave'), target: 8 },
      { id: 'shooter_wave_12', title: 'Vesmírný masakr', desc: 'Dostaň Space Shooter na maximální tlak obtížnosti 12.', goalText: 'vlna 12', progress: (a) => arcadeStat(a.account, 'shooter', 'bestWave'), target: 12 },
      { id: 'doodle_3500', title: 'Skokan', desc: 'Nahraj 3 500 bodů v Doodle Jumpu.', goalText: '3 500 bodů', progress: (a) => arcadeStat(a.account, 'doodle', 'bestScore'), target: 3500 },
      { id: 'doodle_7000', title: 'Skok až ke stropu', desc: 'Nahraj 7 000 bodů v Doodle Jumpu.', goalText: '7 000 bodů', progress: (a) => arcadeStat(a.account, 'doodle', 'bestScore'), target: 7000 },
      { id: 'doodle_height_1200', title: 'Vysokozdvižka', desc: 'Vylez v Doodle Jumpu aspoň o 1 200 výškových bodů.', goalText: 'výška 1 200', progress: (a) => arcadeStat(a.account, 'doodle', 'bestHeight'), target: 1200 },
      { id: 'doodle_jumps_80', title: 'Gumové nohy', desc: 'Skoč v jedné dokončené hře Doodle Jumpu 80krát.', goalText: '80 skoků', progress: (a) => arcadeStat(a.account, 'doodle', 'bestJumps'), target: 80 },
      { id: 'doodle_runs_50', title: 'Skáču po pauze', desc: 'Dokonči 50 her Doodle Jumpu.', goalText: '50 dokončení', progress: (a) => arcadeStat(a.account, 'doodle', 'plays'), target: 50 },
      { id: 'bubble_2500', title: 'Bubble pop', desc: 'Nahraj 2 500 bodů v Bubble Shooteru.', goalText: '2 500 bodů', progress: (a) => arcadeStat(a.account, 'bubble', 'bestScore'), target: 2500 },
      { id: 'bubble_6000', title: 'Bublinový mistr', desc: 'Nahraj 6 000 bodů v Bubble Shooteru.', goalText: '6 000 bodů', progress: (a) => arcadeStat(a.account, 'bubble', 'bestScore'), target: 6000 },
      { id: 'bubble_combo_10', title: 'Řetězová reakce', desc: 'Dej v Bubble Shooteru combo 10.', goalText: 'combo 10', progress: (a) => arcadeStat(a.account, 'bubble', 'bestCombo'), target: 10 },
      { id: 'bubble_pops_120', title: 'Praskač bublinek', desc: 'Praskni v jedné dokončené hře 120 bublinek.', goalText: '120 bublinek', progress: (a) => arcadeStat(a.account, 'bubble', 'bestPops'), target: 120 },
      { id: 'bubble_clears_10', title: 'Čistá obloha', desc: 'Vyčisti 10 her Bubble Shooteru.', goalText: '10 vyčištění', progress: (a) => arcadeStat(a.account, 'bubble', 'bestClears'), target: 10 },
      { id: 'bubble_runs_50', title: 'Bubliny pod kontrolou', desc: 'Dokonči 50 her Bubble Shooteru.', goalText: '50 dokončení', progress: (a) => arcadeStat(a.account, 'bubble', 'plays'), target: 50 },
      { id: 'sudoku_15', title: 'Sudoku hlava', desc: 'Vyřeš 15 Sudoku.', goalText: '15 dokončení', progress: (a) => arcadeStat(a.account, 'sudoku', 'plays'), target: 15 },
      { id: 'sudoku_5min', title: 'Sudoku sprint', desc: 'Vyřeš Sudoku pod 5 minut.', goalText: 'pod 5 minut', progress: (a) => { const t = arcadeStat(a.account, 'sudoku', 'bestTimeMs'); return t ? Math.max(0, 360000 - t) : 0; }, target: 60000 },
      { id: 'sudoku_100', title: 'Sudoku mistr', desc: 'Vyřeš 100 Sudoku.', goalText: '100 dokončení', progress: (a) => arcadeStat(a.account, 'sudoku', 'plays'), target: 100 },
      { id: 'mines_25_wins', title: 'Minové pole znám', desc: 'Vyhraj 25 her Minesweeperu.', goalText: '25 výher', progress: (a) => arcadeStat(a.account, 'mines', 'plays'), target: 25 },
      { id: 'mines_2min', title: 'Odminovač', desc: 'Vyhraj Minesweeper pod 2 minuty.', goalText: 'pod 2 minuty', progress: (a) => { const t = arcadeStat(a.account, 'mines', 'bestTimeMs'); return t ? Math.max(0, 180000 - t) : 0; }, target: 60000 },
      { id: 'mines_100', title: 'Pole pod kontrolou', desc: 'Vyhraj 100 her Minesweeperu.', goalText: '100 výher', progress: (a) => arcadeStat(a.account, 'mines', 'plays'), target: 100 },
      { id: 'memory_30', title: 'Pexeso paměťák', desc: 'Dokonči 30 her Memory.', goalText: '30 dokončení', progress: (a) => arcadeStat(a.account, 'memory', 'plays'), target: 30 },
      { id: 'memory_60sec', title: 'Fotografická paměť', desc: 'Dokonči Pexeso pod 60 sekund.', goalText: 'pod 60 s', progress: (a) => { const t = arcadeStat(a.account, 'memory', 'bestTimeMs'); return t ? Math.max(0, 120000 - t) : 0; }, target: 60000 },
      { id: 'memory_100', title: 'Mozkovna', desc: 'Dokonči 100 her Pexesa.', goalText: '100 dokončení', progress: (a) => arcadeStat(a.account, 'memory', 'plays'), target: 100 },
      { id: 'bomber_30', title: 'Bomber pilot', desc: 'Dokonči 30 her Bomberman mini.', goalText: '30 dokončení', progress: (a) => arcadeStat(a.account, 'bomber', 'plays'), target: 30 },
      { id: 'bomber_kill_4', title: 'Lovec příšerek', desc: 'Znič v Bombermanovi všechny 4 příšerky v jedné hře.', goalText: '4 příšerky', progress: (a) => arcadeStat(a.account, 'bomber', 'bestEnemiesKilled'), target: 4 },
      { id: 'bomber_crates_30', title: 'Bourání beden', desc: 'Rozbij v jedné hře 30 beden.', goalText: '30 beden', progress: (a) => arcadeStat(a.account, 'bomber', 'bestCrates'), target: 30 },
      { id: 'bomber_power_6', title: 'Sběrač výbavy', desc: 'Seber v jedné hře 6 upgradů.', goalText: '6 upgradů', progress: (a) => arcadeStat(a.account, 'bomber', 'bestPowerUps'), target: 6 },
      { id: '2048_tile_4096', title: 'Kámen 4096', desc: 'V 2048 dostaň kámen 4096.', goalText: 'kámen 4096', progress: (a) => a.g2048.bestTile || 0, target: 4096 },
      { id: '2048_runs_50', title: 'Čísla v ruce', desc: 'Dokonči 50 her 2048.', goalText: '50 dokončení', progress: (a) => a.g2048.plays || 0, target: 50 },
      { id: 'snake_runs_50', title: 'Hadí rozcvička', desc: 'Dokonči 50 her Snake.', goalText: '50 dokončení', progress: (a) => a.snake.plays || 0, target: 50 },
      { id: 'mines_score_600', title: 'Minové body', desc: 'Nahraj v Minesweeperu 600 bodů.', goalText: '600 bodů', progress: (a) => arcadeStat(a.account, 'mines', 'bestScore'), target: 600 },
      { id: 'memory_moves_24', title: 'Málo tahů', desc: 'Dokonči Pexeso s nejvýše 24 tahy.', goalText: '24 tahů', progress: (a) => { const m = arcadeStat(a.account, 'memory', 'bestMoves'); return m ? Math.max(0, 60 - m) : 0; }, target: 36 },
      { id: 'bomber_stage_clear_10', title: 'Vyčištěné bludiště', desc: 'Vyhraj 10 kol Bomberman mini.', goalText: '10 vyčištění', progress: (a) => arcadeStat(a.account, 'bomber', 'bestStageClear'), target: 10 },
      { id: 'pampuch_2500', title: 'Pampuch rozjezd', desc: 'Nahraj v Pampuchovi 2 500 bodů.', goalText: '2 500 bodů', progress: (a) => arcadeStat(a.account, 'pampuch', 'bestScore'), target: 2500 },
      { id: 'pampuch_6000', title: 'Lovec bodů', desc: 'Nahraj v Pampuchovi 6 000 bodů.', goalText: '6 000 bodů', progress: (a) => arcadeStat(a.account, 'pampuch', 'bestScore'), target: 6000 },
      { id: 'pampuch_10000', title: 'Pampuch legenda', desc: 'Nahraj v Pampuchovi 10 000 bodů.', goalText: '10 000 bodů', progress: (a) => arcadeStat(a.account, 'pampuch', 'bestScore'), target: 10000 },
      { id: 'pampuch_points_120', title: 'Vyčištěná mapa', desc: 'Seber v jedné hře 120 bodů v bludišti.', goalText: '120 bodů v mapě', progress: (a) => arcadeStat(a.account, 'pampuch', 'bestPops'), target: 120 },
      { id: 'pampuch_combo_24', title: 'Bez zaváhání', desc: 'Dej v Pampuchovi combo 24.', goalText: 'combo 24', progress: (a) => arcadeStat(a.account, 'pampuch', 'bestCombo'), target: 24 },
      { id: 'pampuch_runs_50', title: 'Pampuch držák', desc: 'Dokonči 50 her Pampucha.', goalText: '50 dokončení', progress: (a) => arcadeStat(a.account, 'pampuch', 'plays'), target: 50 },
      { id: 'daily_5', title: 'Denní rozjezd', desc: 'Splň 5 denních challenge.', goalText: '5 challenge', progress: (a) => arcadeStat(a.account, 'daily', 'plays'), target: 5 },
      { id: 'daily_20', title: 'Denní držák', desc: 'Splň 20 denních challenge.', goalText: '20 challenge', progress: (a) => arcadeStat(a.account, 'daily', 'plays'), target: 20 },
      { id: 'ttt_online_10', title: 'Soupeř z druhé ruky', desc: 'Dokonči 10 online partií Piškvorek proti někomu.', goalText: '10 online partií', progress: (a) => (a.ttt.context && a.ttt.context.onlinePlays) || 0, target: 10 },
      { id: 'ttt_online_wins_10', title: 'Online taktik', desc: 'Vyhraj 10 online partií Piškvorek.', goalText: '10 online výher', progress: (a) => (a.ttt.context && a.ttt.context.onlineWins) || 0, target: 10 },
      { id: 'ships_online_10', title: 'Námořní duelant', desc: 'Dohraj 10 online her Lodí s druhým hráčem.', goalText: '10 online duelů', progress: (a) => arcadeStat(a.account, 'ships', 'plays'), target: 10 },
      { id: 'ships_online_wins_10', title: 'Kapitán flotily', desc: 'Vyhraj 10 online her Lodí.', goalText: '10 online výher', progress: (a) => arcadeStat(a.account, 'ships', 'wins'), target: 10 },
      { id: 'ships_hits_40', title: 'Přesné salvy', desc: 'Dej v Lodích 40 zásahů v jedné dokončené hře.', goalText: '40 zásahů', progress: (a) => arcadeStat(a.account, 'ships', 'bestHits'), target: 40 },
      { id: 'ships_sunk_5', title: 'Potopeno', desc: 'Potop v jedné hře Lodí 5 lodí.', goalText: '5 potopených lodí', progress: (a) => arcadeStat(a.account, 'ships', 'bestClears'), target: 5 },
      { id: 'daily_60', title: 'Denní rutina', desc: 'Splň 60 denních challenge.', goalText: '60 challenge', progress: (a) => arcadeStat(a.account, 'daily', 'plays'), target: 60 },
      { id: 'daily_120', title: 'Kalendářní legenda', desc: 'Splň 120 denních challenge.', goalText: '120 challenge', progress: (a) => arcadeStat(a.account, 'daily', 'plays'), target: 120 },
      { id: 'sudoku_50', title: 'Sudoku série', desc: 'Vyřeš 50 Sudoku.', goalText: '50 dokončení', progress: (a) => arcadeStat(a.account, 'sudoku', 'plays'), target: 50 },
      { id: 'sudoku_2min', title: 'Sudoku rychlík', desc: 'Vyřeš Sudoku pod 2 minuty.', goalText: 'pod 120 s', progress: (a) => { const t = arcadeStat(a.account, 'sudoku', 'bestTimeMs'); return t ? Math.max(0, 240000 - t) : 0; }, target: 120000 },
      { id: 'mines_score_1000', title: 'Minový profík', desc: 'Nahraj v Minesweeperu 1 000 bodů.', goalText: '1 000 bodů', progress: (a) => arcadeStat(a.account, 'mines', 'bestScore'), target: 1000 },
      { id: 'mines_60sec', title: 'Rychlé odminování', desc: 'Vyhraj Minesweeper pod 60 sekund.', goalText: 'pod 60 s', progress: (a) => { const t = arcadeStat(a.account, 'mines', 'bestTimeMs'); return t ? Math.max(0, 120000 - t) : 0; }, target: 60000 },
      { id: 'memory_45sec', title: 'Paměť na čas', desc: 'Dokonči Pexeso pod 45 sekund.', goalText: 'pod 45 s', progress: (a) => { const t = arcadeStat(a.account, 'memory', 'bestTimeMs'); return t ? Math.max(0, 90000 - t) : 0; }, target: 45000 },
      { id: 'memory_6x6', title: 'Velké pexeso', desc: 'Dokonči Memory na velikosti 6×6.', goalText: '6×6', progress: (a) => arcadeStat(a.account, 'memory', 'bestSize'), target: 6 },
      { id: 'ships_online_25', title: 'Mořský veterán', desc: 'Dohraj 25 online her Lodí.', goalText: '25 online duelů', progress: (a) => arcadeStat(a.account, 'ships', 'plays'), target: 25 },
      { id: 'ships_online_wins_25', title: 'Admirál flotily', desc: 'Vyhraj 25 online her Lodí.', goalText: '25 online výher', progress: (a) => arcadeStat(a.account, 'ships', 'wins'), target: 25 },
      { id: 'daily_200', title: 'Denní železo', desc: 'Splň 200 denních challenge.', goalText: '200 challenge', progress: (a) => arcadeStat(a.account, 'daily', 'plays'), target: 200 },
      { id: 'ttt_d_5', title: 'Piškvorky na D', desc: 'Dokonči 5 partií Piškvorek během aktivní směny D.', goalText: '5 partií na D', progress: (a) => gamesContextProgressForGame(a.account, 'ttt', 'shiftDPlays'), target: 5 },
      { id: 'ttt_d_20', title: 'Déčkový taktik', desc: 'Dokonči 20 partií Piškvorek během aktivní směny D.', goalText: '20 partií na D', progress: (a) => gamesContextProgressForGame(a.account, 'ttt', 'shiftDPlays'), target: 20 },
      { id: '2048_d_5', title: '2048 na D', desc: 'Dokonči 5 her 2048 během aktivní směny D.', goalText: '5 her 2048 na D', progress: (a) => gamesContextProgressForGame(a.account, '2048', 'shiftDPlays'), target: 5 },
      { id: '2048_d_20', title: 'Noční skládání', desc: 'Dokonči 20 her 2048 během aktivní směny D.', goalText: '20 her 2048 na D', progress: (a) => gamesContextProgressForGame(a.account, '2048', 'shiftDPlays'), target: 20 },
      { id: 'snake_d_5', title: 'Had na směně D', desc: 'Dokonči 5 her Snake během aktivní směny D.', goalText: '5 hadů na D', progress: (a) => gamesContextProgressForGame(a.account, 'snake', 'shiftDPlays'), target: 5 },
      { id: 'snake_d_20', title: 'Déčkový had', desc: 'Dokonči 20 her Snake během aktivní směny D.', goalText: '20 hadů na D', progress: (a) => gamesContextProgressForGame(a.account, 'snake', 'shiftDPlays'), target: 20 },
      { id: 'flap_d_5', title: 'Flappy na D', desc: 'Dokonči 5 jízd Flappy Car během aktivní směny D.', goalText: '5 jízd na D', progress: (a) => gamesContextProgressForGame(a.account, 'flap', 'shiftDPlays'), target: 5 },
      { id: 'flap_d_20', title: 'Pilot déčka', desc: 'Dokonči 20 jízd Flappy Car během aktivní směny D.', goalText: '20 jízd na D', progress: (a) => gamesContextProgressForGame(a.account, 'flap', 'shiftDPlays'), target: 20 },
      { id: 'aim_d_5', title: 'Terče na D', desc: 'Dokonči 5 kol Aim Traineru během aktivní směny D.', goalText: '5 Aim kol na D', progress: (a) => gamesContextProgressForGame(a.account, 'aim', 'shiftDPlays'), target: 5 },
      { id: 'aim_d_20', title: 'Déčková muška', desc: 'Dokonči 20 kol Aim Traineru během aktivní směny D.', goalText: '20 Aim kol na D', progress: (a) => gamesContextProgressForGame(a.account, 'aim', 'shiftDPlays'), target: 20 },
      { id: 'reaction_d_5', title: 'Reflex na D', desc: 'Dokonči 5 Reaction testů během aktivní směny D.', goalText: '5 reflexů na D', progress: (a) => gamesContextProgressForGame(a.account, 'reaction', 'shiftDPlays'), target: 5 },
      { id: 'reaction_d_20', title: 'Déčkový blesk', desc: 'Dokonči 20 Reaction testů během aktivní směny D.', goalText: '20 reflexů na D', progress: (a) => gamesContextProgressForGame(a.account, 'reaction', 'shiftDPlays'), target: 20 },
      { id: 'tetris_d_5', title: 'Tetris na D', desc: 'Dokonči 5 her Tetrisu během aktivní směny D.', goalText: '5 Tetris her na D', progress: (a) => gamesContextProgressForGame(a.account, 'tetris', 'shiftDPlays'), target: 5 },
      { id: 'tetris_d_20', title: 'Bloky po směně', desc: 'Dokonči 20 her Tetrisu během aktivní směny D.', goalText: '20 Tetris her na D', progress: (a) => gamesContextProgressForGame(a.account, 'tetris', 'shiftDPlays'), target: 20 },
      { id: 'shooter_d_5', title: 'Hangár D', desc: 'Dokonči 5 Space Shooter her během aktivní směny D.', goalText: '5 letů na D', progress: (a) => gamesContextProgressForGame(a.account, 'shooter', 'shiftDPlays'), target: 5 },
      { id: 'shooter_d_20', title: 'Noční hlídka', desc: 'Dokonči 20 Space Shooter her během aktivní směny D.', goalText: '20 letů na D', progress: (a) => gamesContextProgressForGame(a.account, 'shooter', 'shiftDPlays'), target: 20 },
      { id: 'brick_d_5', title: 'Cihly na D', desc: 'Dokonči 5 Brick Breaker her během aktivní směny D.', goalText: '5 bourání na D', progress: (a) => gamesContextProgressForGame(a.account, 'brick', 'shiftDPlays'), target: 5 },
      { id: 'brick_d_20', title: 'Déčková demolice', desc: 'Dokonči 20 Brick Breaker her během aktivní směny D.', goalText: '20 bourání na D', progress: (a) => gamesContextProgressForGame(a.account, 'brick', 'shiftDPlays'), target: 20 },
      { id: 'doodle_d_5', title: 'Skoky na D', desc: 'Dokonči 5 Doodle Jump her během aktivní směny D.', goalText: '5 skoků na D', progress: (a) => gamesContextProgressForGame(a.account, 'doodle', 'shiftDPlays'), target: 5 },
      { id: 'doodle_d_20', title: 'Strop směny D', desc: 'Dokonči 20 Doodle Jump her během aktivní směny D.', goalText: '20 skoků na D', progress: (a) => gamesContextProgressForGame(a.account, 'doodle', 'shiftDPlays'), target: 20 },
      { id: 'bubble_d_5', title: 'Bubliny na D', desc: 'Dokonči 5 Bubble Shooter her během aktivní směny D.', goalText: '5 bublin na D', progress: (a) => gamesContextProgressForGame(a.account, 'bubble', 'shiftDPlays'), target: 5 },
      { id: 'bubble_d_20', title: 'Déčkový pop', desc: 'Dokonči 20 Bubble Shooter her během aktivní směny D.', goalText: '20 bublin na D', progress: (a) => gamesContextProgressForGame(a.account, 'bubble', 'shiftDPlays'), target: 20 },
      { id: 'sudoku_d_5', title: 'Sudoku na D', desc: 'Vyřeš 5 Sudoku během aktivní směny D.', goalText: '5 Sudoku na D', progress: (a) => gamesContextProgressForGame(a.account, 'sudoku', 'shiftDPlays'), target: 5 },
      { id: 'sudoku_d_20', title: 'Déčková logika', desc: 'Vyřeš 20 Sudoku během aktivní směny D.', goalText: '20 Sudoku na D', progress: (a) => gamesContextProgressForGame(a.account, 'sudoku', 'shiftDPlays'), target: 20 },
      { id: 'mines_d_5', title: 'Miny na D', desc: 'Dokonči 5 Minesweeper her během aktivní směny D.', goalText: '5 min na D', progress: (a) => gamesContextProgressForGame(a.account, 'mines', 'shiftDPlays'), target: 5 },
      { id: 'mines_d_20', title: 'Noční odminování', desc: 'Dokonči 20 Minesweeper her během aktivní směny D.', goalText: '20 min na D', progress: (a) => gamesContextProgressForGame(a.account, 'mines', 'shiftDPlays'), target: 20 },
      { id: 'memory_d_5', title: 'Pexeso na D', desc: 'Dokonči 5 her Memory během aktivní směny D.', goalText: '5 pexes na D', progress: (a) => gamesContextProgressForGame(a.account, 'memory', 'shiftDPlays'), target: 5 },
      { id: 'memory_d_20', title: 'Paměť směny D', desc: 'Dokonči 20 her Memory během aktivní směny D.', goalText: '20 pexes na D', progress: (a) => gamesContextProgressForGame(a.account, 'memory', 'shiftDPlays'), target: 20 },
      { id: 'bomber_d_5', title: 'Bomby na D', desc: 'Dokonči 5 Bomberman mini her během aktivní směny D.', goalText: '5 bomb na D', progress: (a) => gamesContextProgressForGame(a.account, 'bomber', 'shiftDPlays'), target: 5 },
      { id: 'bomber_d_20', title: 'Déčkový pyrotechnik', desc: 'Dokonči 20 Bomberman mini her během aktivní směny D.', goalText: '20 bomb na D', progress: (a) => gamesContextProgressForGame(a.account, 'bomber', 'shiftDPlays'), target: 20 },
      { id: 'pampuch_d_5', title: 'Pampuch na D', desc: 'Dokonči 5 her Pampuch během aktivní směny D.', goalText: '5 Pampuchů na D', progress: (a) => gamesContextProgressForGame(a.account, 'pampuch', 'shiftDPlays'), target: 5 },
      { id: 'pampuch_d_20', title: 'Bludiště po D', desc: 'Dokonči 20 her Pampuch během aktivní směny D.', goalText: '20 Pampuchů na D', progress: (a) => gamesContextProgressForGame(a.account, 'pampuch', 'shiftDPlays'), target: 20 },
      { id: 'ships_d_5', title: 'Lodě na D', desc: 'Dohraj 5 her Lodí během aktivní směny D.', goalText: '5 duelů na D', progress: (a) => gamesContextProgressForGame(a.account, 'ships', 'shiftDPlays'), target: 5 },
      { id: 'ships_d_20', title: 'Noční admirál', desc: 'Dohraj 20 her Lodí během aktivní směny D.', goalText: '20 duelů na D', progress: (a) => gamesContextProgressForGame(a.account, 'ships', 'shiftDPlays'), target: 20 },
      { id: 'daily_d_5', title: 'Daily na D', desc: 'Splň 5 denních challenge během aktivní směny D.', goalText: '5 daily na D', progress: (a) => gamesContextProgressForGame(a.account, 'daily', 'shiftDPlays'), target: 5 },
      { id: 'daily_d_20', title: 'Déčková rutina', desc: 'Splň 20 denních challenge během aktivní směny D.', goalText: '20 daily na D', progress: (a) => gamesContextProgressForGame(a.account, 'daily', 'shiftDPlays'), target: 20 },
      { id: 'ctx_shift_d_10', title: 'Déčko zapnuto', desc: 'Dokonči 10 her přímo v době, kdy běží směna D.', goalText: '10 her na D', progress: (a) => a.context.shiftDPlays || 0, target: 10 },
      { id: 'ctx_shift_d_40', title: 'D jako držák', desc: 'Dokonči 40 her přímo v době, kdy běží směna D.', goalText: '40 her na D', progress: (a) => a.context.shiftDPlays || 0, target: 40 },
      { id: 'ctx_online_25', title: 'Hraní s někým', desc: 'Dokonči 25 online her s dalším hráčem.', goalText: '25 online her', progress: (a) => a.context.onlinePlays || 0, target: 25 },
      { id: 'ctx_online_wins_15', title: 'Online vítěz', desc: 'Vyhraj 15 online her proti někomu.', goalText: '15 online výher', progress: (a) => a.context.onlineWins || 0, target: 15 },
      { id: 'ctx_shift_15', title: 'Hráč na déčku', desc: 'Dokonči 15 her během aktivní směny D.', goalText: '15 her na směně D', progress: (a) => a.context.onShiftPlays || 0, target: 15 },
      { id: 'ctx_shift_60', title: 'Déčkový držák', desc: 'Dokonči 60 her v čase, kdy je směna D v práci.', goalText: '60 her na směně D', progress: (a) => a.context.onShiftPlays || 0, target: 60 },
      { id: 'ctx_night_hours_20', title: 'Noční sova', desc: 'Dokonči 20 her mezi 22:00 a 6:00.', goalText: '20 nočních her', progress: (a) => a.context.nightHourPlays || 0, target: 20 },
      { id: 'ctx_night_shift_15', title: 'Noční pauza D', desc: 'Dokonči 15 her přímo během noční směny D.', goalText: '15 her na noční D', progress: (a) => a.context.nightShiftPlays || 0, target: 15 },
      { id: 'ctx_morning_shift_25', title: 'Ranní rozjezd D', desc: 'Dokonči 25 her během ranní směny D.', goalText: '25 her na ranní D', progress: (a) => a.context.morningShiftPlays || 0, target: 25 },
      { id: 'ctx_weekend_30', title: 'Víkendový hráč', desc: 'Dokonči 30 her o víkendu.', goalText: '30 víkendových her', progress: (a) => a.context.weekendPlays || 0, target: 30 },
      { id: 'ctx_lunch_20', title: 'Pauzový stratég', desc: 'Dokonči 20 her mezi 11:00 a 14:00.', goalText: '20 her v pauzovém čase', progress: (a) => a.context.lunchWindowPlays || 0, target: 20 },
      { id: 'ctx_days_14', title: 'Dlouhá série', desc: 'Dokonči hry ve 14 různých dnech.', goalText: '14 různých dnů', progress: (a) => a.context.distinctPlayedDays || 0, target: 14 },
      { id: 'ctx_shift_teams_4', title: 'Déčko ve více dnech', desc: 'Dokonči hru během směny D ve 4 různých dnech.', goalText: '4 D dny', progress: (a) => a.context.distinctShiftDDays || 0, target: 4 }
    ];
  }

  function getExtendedAchievementCount(account) {
    if (!account) return 0;
    const total = gamesGetTotals(account);
    const ctx = Object.assign({ account, context: gamesGetContextTotals(account) }, total);
    return getExtendedAchievementDefs().filter((def) => Number(def.progress(ctx) || 0) >= Number(def.target || 0)).length;
  }

  function getRakGamesAchievementRewardHealth() {
    const defs = getExtendedAchievementDefs();
    const ids = ALL_GAMES.slice();
    const perGame = {};
    ids.forEach((id) => {
      const direct = defs.filter(def => String(def && def.id || '').indexOf(id + '_') === 0 || String(def && def.id || '').indexOf(id.replace('2048','2048') + '_') === 0).length;
      const dShift = defs.filter(def => String(def && def.id || '').indexOf(id + '_d_') === 0).length;
      perGame[id] = { achievementCount: direct, shiftDRewardCount: dShift, ok: direct >= 3 && dShift >= 2 };
    });
    return {
      version: window.APP_VERSION || '1.2 (1.65)',
      mode: 'games-achievement-reward-health-v928',
      totalAchievementDefs: defs.length,
      gamesCovered: ids.length,
      perGame,
      shiftDRewards: defs.filter(def => String(def && def.id || '').indexOf('_d_') >= 0 || String(def && def.id || '').indexOf('ctx_shift_d_') === 0).length,
      notes: 'Read-only kontrola: každá hra má vlastní achievementy a D-směnové odměny; skutečné odemykání záleží na dokončených hrách profilu.'
    };
  }
  window.getRakGamesAchievementRewardHealth = getRakGamesAchievementRewardHealth;

  function renderAchievementCard(def, current) {
    const target = Math.max(1, gamesProfileSafeInt(def && def.target, 999999999) || 1);
    const currentSafe = gamesProfileSafeInt(current, 999999999);
    const cappedCurrent = Math.min(currentSafe, target);
    const pct = gamesProfileSafePct((currentSafe / target) * 100);
    const isUnlocked = currentSafe >= target;
    return [
      '<div class="gamesStatsCard' + (isUnlocked ? ' isActive' : '') + '">',
      '  <div class="gamesStatsCardHead">',
      '    <div>',
      '      <div class="gamesStatsCardName">' + escapeHtml(gamesProfileSafeText(def && def.title, 'Achievement', GAMES_PROFILE_DOM_HARDENING.maxLabelLength)) + '</div>',
      '      <div class="gamesStatsCardId">' + escapeHtml(gamesProfileSafeId(def && def.id)) + '</div>',
      '    </div>',
      '    <div class="gamesStatsCardTotal">' + String(cappedCurrent) + '/' + String(target) + '</div>',
      '  </div>',
      '  <div class="gamesStatsCardBody">',
      '    <div class="gamesStatsCardLine">' + escapeHtml(gamesProfileSafeText(def && def.desc, '', GAMES_PROFILE_DOM_HARDENING.maxLongTextLength)) + '</div>',
      '    <div class="gamesStatsCardLine">' + escapeHtml(gamesProfileSafeText(def && def.goalText, '', GAMES_PROFILE_DOM_HARDENING.maxLabelLength)) + '</div>',
      '    <div class="gamesAchievementBar"><span style="--fill:' + String(pct) + '%"></span></div>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function renderAchievementGroup(title, items, open) {
    const safeItems = Array.isArray(items) ? items : [];
    const body = safeItems.length
      ? safeItems.map(item => renderAchievementCard(item.def, item.current)).join('')
      : '<div class="smallText gamesAchievementEmpty">Tady zatím nic není.</div>';
    return [
      '<details class="gamesAchievementGroup"' + (open ? ' open' : '') + '>',
      '  <summary class="gamesAchievementGroupSummary"><span>' + escapeHtml(gamesProfileSafeText(title, 'Achievementy', 40)) + '</span><strong>' + String(gamesProfileSafeInt(safeItems.length, 999999)) + '</strong></summary>',
      '  <div class="gamesAchievementGroupBody">' + body + '</div>',
      '</details>'
    ].join('');
  }

  function renderAchievementsExtended() {
    const grid = document.getElementById('gamesAchievementsGrid');
    if (!grid) return;
    const account = gamesGetActiveAccount();
    if (!account) {
      const emptyHtml = '<div class="smallText">Přihlas se a achievementy se začnou počítat.</div>';
      if (grid.__rakLastAchievementsHtml === emptyHtml && grid.childElementCount) {
        gamePerf.achievementRenderSkips = Number(gamePerf.achievementRenderSkips || 0) + 1;
        return;
      }
      grid.__rakLastAchievementsHtml = emptyHtml;
      gamePerf.achievementRenderRuns = Number(gamePerf.achievementRenderRuns || 0) + 1;
      grid.innerHTML = emptyHtml;
      return;
    }

    const total = gamesGetTotals(account);
    const ctx = Object.assign({ account, context: gamesGetContextTotals(account) }, total);
    const defs = getExtendedAchievementDefs();
    const enriched = defs.map((def) => ({ def, current: Number(def.progress(ctx) || 0) }));
    const done = enriched.filter(item => item.current >= Number(item.def.target || 0));
    const active = enriched.filter(item => item.current > 0 && item.current < Number(item.def.target || 0));
    const fresh = enriched.filter(item => item.current <= 0);
    const unlocked = done.length;
    const nextHtml = [
      renderAchievementGroup('Hotové', done, false),
      renderAchievementGroup('Rozdělané', active, true),
      renderAchievementGroup('Nenačaté', fresh, false)
    ].join('');
    if (grid.__rakLastAchievementsHtml === nextHtml && grid.childElementCount) {
      gamePerf.achievementRenderSkips = Number(gamePerf.achievementRenderSkips || 0) + 1;
      return;
    }
    grid.__rakLastAchievementsHtml = nextHtml;
    gamePerf.achievementRenderRuns = Number(gamePerf.achievementRenderRuns || 0) + 1;
    grid.innerHTML = nextHtml;
    const folder = document.querySelector('#games .gamesAchievementsFolder');
    if (folder) folder.dataset.unlocked = String(unlocked);
  }
  window.gamesGetAchievementCount = getExtendedAchievementCount;

  const originalRenderProfiles = window.gamesRenderProfiles;
  window.gamesRenderProfiles = function gamesRenderProfilesArcade() {
    renderProfilesExtended();
    if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
  };

  const originalRenderAchievements = window.gamesRenderAchievements;
  window.gamesRenderAchievements = function gamesRenderAchievementsArcade() {
    renderAchievementsExtended();
    if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
  };

  const CSS = `
#games .gamesLaunchTile{cursor:pointer;transition:transform .15s ease, box-shadow .15s ease, border-color .15s ease;}
#games .gamesLaunchTile:active{transform:scale(.985);}
#games .gamesLaunchTile .smallText{font-size:11px;line-height:1.2;opacity:.82;}
#games .gamesLaunchTile .calcTileText{font-size:15px;line-height:1.1;}
#games .gamesShellTop{display:flex;align-items:center;gap:10px;}
#games .gamesShellBack{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 12px;border:1px solid rgba(124,255,124,.16);background:rgba(255,255,255,.04);border-radius:14px;color:#eaffef;font-weight:700;letter-spacing:.01em;}
#games .gamesShellBack:active{transform:translateY(1px);}
#games .gamesShellTitleWrap{display:flex;flex-direction:column;min-width:0;flex:1 1 auto;}
#games .gamesShellTitle{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
#games .gamesShellSubtitle{font-size:11px;line-height:1.2;color:rgba(231,255,240,.68);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
#games .gamesArcadeRoot{display:flex;flex-direction:column;gap:8px;flex:1 1 auto;min-height:0;overflow:hidden;}
#games .arcadeShellRoot{background:transparent !important;border:0 !important;box-shadow:none !important;padding-top:calc(44px + env(safe-area-inset-top)) !important;}
#games .arcadeShellRoot .gamesArcadeRoot{background:transparent !important;position:relative;z-index:1;}
#games .arcadeShellRoot .arcadeBackFloating{background:var(--rakGlassCardBg, rgba(255,255,255,.08)) !important;border:1px solid var(--rakGlassStroke, rgba(255,255,255,.16)) !important;color:var(--soft, #e7fff0) !important;box-shadow:0 10px 28px rgba(0,0,0,.22) !important;}
#games .arcadeShellHeader{display:none !important;}
#games .arcadeHud{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:100%;}
#games .arcadeHudWide3{grid-template-columns:repeat(3,minmax(0,1fr));width:100%;}
#games .arcadeHudSingleLine{grid-template-columns:repeat(3,minmax(0,1fr));align-items:stretch;}
#games .arcadeHudSingleLine .gamesStatCard{min-height:42px;padding:7px 8px;display:flex;align-items:center;justify-content:space-between;gap:5px;}
#games .arcadeHudSingleLine .gamesStatLabel{font-size:9px;line-height:1;white-space:nowrap;}
#games .arcadeHudSingleLine .gamesStatValue{font-size:13px;line-height:1;white-space:nowrap;}
#games .arcadeCanvasWrap.tetrisCanvasWrap{border-color:color-mix(in srgb, var(--green, #7CFF7C) 22%, rgba(255,255,255,.18)) !important;}
#games .arcadeCanvasWrap.brickNarrowCanvas{width:min(100%, 340px) !important;align-self:center !important;}
#games .arcadeCanvasWrap.shooterCanvasWrap{width:100% !important;align-self:center !important;}
#games .gamesTop3Card{flex:0 0 auto;}

#games .gamesTop5ScrollCard{max-height:154px;overflow:hidden;overscroll-behavior:contain;touch-action:pan-y;}
#games .gamesTop5ScrollBody{max-height:96px;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding-right:4px;}
#games .gamesTop5ScrollBody::-webkit-scrollbar{width:4px;}
#games .gamesTop5ScrollBody::-webkit-scrollbar-thumb{background:rgba(255,255,255,.22);border-radius:999px;}
#games .arcadeNoPageScroll,#games .arcadeNoPageScroll .arcadeCanvas{touch-action:none;overscroll-behavior:contain;}
#games .tetrisSideStatsCanvas{height:clamp(450px,72dvh,720px) !important;}
#games .arcadeOnlyRestart{justify-content:center;margin-top:2px;}
#games .arcadeOnlyRestart .gameControlBtn{min-width:118px;}
#games .arcadeCanvasWrap.isFullGame{height:clamp(360px, 62dvh, 620px) !important;}
#games .arcadeHud .gamesStatCard{padding:8px 10px;}
#games .arcadeHud .gamesStatLabel{font-size:10px;opacity:.72;}
#games .arcadeHud .gamesStatValue{font-size:14px;font-weight:800;line-height:1.1;}
#games .arcadePanel{border-radius:22px;border:1px solid rgba(124,255,124,.12);background:rgba(255,255,255,.04);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 16px 40px rgba(0,0,0,.24);overflow:hidden;}
#games .arcadeStage{display:flex;flex-direction:column;gap:8px;min-height:0;flex:1 1 auto;overflow:hidden;}
#games .arcadeBoardWrap{position:relative;border-radius:22px;border:1px solid rgba(124,255,124,.12);background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03));box-shadow:0 20px 40px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.04);overflow:hidden;}
#games .arcadeCanvas{display:block;width:100%;height:100%;touch-action:none;user-select:none;-webkit-user-select:none;}
#games .arcadeBoard{display:grid;gap:6px;}
#games .arcadeBoard.grid-4{grid-template-columns:repeat(4,minmax(0,1fr));}
#games .arcadeBoard.grid-6{grid-template-columns:repeat(6,minmax(0,1fr));}
#games .arcadeBoard.grid-9{grid-template-columns:repeat(9,minmax(0,1fr));}
#games .arcadeBoard.grid-10{grid-template-columns:repeat(10,minmax(0,1fr));}
#games .arcadeCell{border-radius:16px;border:1px solid rgba(124,255,124,.12);background:rgba(255,255,255,.03);display:flex;align-items:center;justify-content:center;min-height:42px;font-weight:800;user-select:none;-webkit-user-select:none;}
#games .arcadeCell.isFilled{background:rgba(124,255,124,.08);}
#games .arcadeCell.isActive{border-color:rgba(124,255,124,.32);background:rgba(124,255,124,.12);box-shadow:0 0 0 1px rgba(124,255,124,.14) inset, 0 0 20px rgba(124,255,124,.10);}
#games .arcadeCell.isHidden{color:transparent;}
#games .arcadeCell.isMatched{background:rgba(124,255,124,.16);}
#games .arcadeCell.isWrong{background:rgba(255,115,115,.16);}
#games .arcadeCell.isMine{background:rgba(255,115,115,.20);}
#games .arcadeControls{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;}
#games .arcadeControls .gameControlBtn{min-height:42px;min-width:42px;padding:0 12px;border-radius:14px;}
#games .arcadeBar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between;}
#games .arcadeStatus{font-size:12px;line-height:1.25;color:rgba(231,255,240,.82);}
#games .arcadeStatus strong{color:#effff2;}
#games .arcadeAimBoard{position:relative;height:clamp(280px, 52dvh, 430px);}
#games .arcadeAimTarget{position:absolute;transform:translate(-50%,-50%);width:58px;height:58px;border-radius:50%;border:none;background:radial-gradient(circle at 35% 35%, #ffffff, #81ff9d 28%, #22b24e 70%);box-shadow:0 0 0 10px rgba(124,255,124,.08), 0 0 26px rgba(124,255,124,.36);}
#games .arcadeAimTarget:active{transform:translate(-50%,-50%) scale(.96);}
#games .arcadeShellTopCompact{min-height:44px;justify-content:flex-start !important;padding-top:max(8px, env(safe-area-inset-top)) !important;}
#games .arcadeHudWide{grid-template-columns:repeat(4,minmax(0,1fr));width:100%;}
#games .arcadeAimStage,#games .arcadeReactionStage{gap:10px;}
#games .arcadeAimBoard{height:clamp(330px, 58dvh, 560px);touch-action:none;background:var(--rakGlassPanelBg, linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.025))) !important;border-color:var(--rakGlassStroke, rgba(255,255,255,.14)) !important;}
#games .arcadeAimBoard::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 25% 18%, color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 20%, transparent), transparent 46%), radial-gradient(circle at 80% 82%, rgba(255,255,255,.08), transparent 42%);pointer-events:none;}
#games .arcadeAimTarget{z-index:2;touch-action:none;background:radial-gradient(circle at 35% 32%, #fff, color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 72%, #ffffff) 24%, color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 78%, #111827) 70%) !important;box-shadow:0 0 0 10px color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 10%, transparent), 0 0 30px color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 32%, transparent) !important;}
#games .arcadeAimTarget.isHidden{display:none;}
#games .arcadeGameOverlay{position:absolute;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;padding:16px;pointer-events:none;background:linear-gradient(180deg, rgba(5,8,12,.18), rgba(5,8,12,.38));}
#games .arcadeGameOverlay[hidden]{display:none !important;}
#games .arcadeOverlayCard{width:min(92%, 320px);border-radius:24px;border:1px solid var(--rakGlassStroke, rgba(255,255,255,.14));background:var(--rakGlassCardBg, rgba(255,255,255,.08));backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 18px 40px rgba(0,0,0,.32);padding:16px;text-align:center;display:grid;gap:7px;}
#games .arcadeOverlayCard strong{font-size:18px;line-height:1.12;}
#games .arcadeOverlayCard span{font-size:13px;line-height:1.35;color:rgba(245,255,250,.82);}
#games .arcadeOverlayCard small{font-size:11px;color:rgba(245,255,250,.62);}
#games .arcadeReactionBoard{min-height:clamp(360px, 62dvh, 600px);width:100%;border:none;color:inherit;cursor:pointer;touch-action:manipulation;background:var(--rakGlassPanelBg, linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.025))) !important;border-color:var(--rakGlassStroke, rgba(255,255,255,.14)) !important;}
/* v.1.5 (920) – Reaction test: Top score nesmí zůstat schované pod spodní/neviditelnou vrstvou. */
body.gamesOpen[data-rak-arcade-game="reaction"] #games .gamesStage,
body.gamesOpen[data-rak-arcade-game="daily"] #games .gamesStage{overflow:auto !important;}
body.gamesOpen[data-rak-arcade-game="reaction"] #games .arcadeShellRoot,
body.gamesOpen[data-rak-arcade-game="daily"] #games .arcadeShellRoot{height:auto !important;min-height:100dvh !important;overflow:visible !important;padding-bottom:calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom) + 22px) !important;}
body.gamesOpen[data-rak-arcade-game="reaction"] #games .gamesArcadeRoot,
body.gamesOpen[data-rak-arcade-game="daily"] #games .gamesArcadeRoot{overflow:visible !important;min-height:auto !important;}
body.gamesOpen[data-rak-arcade-game="reaction"] #games #gamesShellBody,
body.gamesOpen[data-rak-arcade-game="daily"] #games #gamesShellBody{overflow:visible !important;min-height:auto !important;padding-bottom:calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom) + 18px) !important;}
body.gamesOpen[data-rak-arcade-game="reaction"] #games .arcadeReactionStage,
body.gamesOpen[data-rak-arcade-game="daily"] #games .arcadeReactionStage{overflow:visible !important;min-height:auto !important;padding-bottom:20px !important;}
body.gamesOpen[data-rak-arcade-game="reaction"] #games .arcadeReactionBoard,
body.gamesOpen[data-rak-arcade-game="daily"] #games .arcadeReactionBoard{min-height:clamp(240px, 42dvh, 420px) !important;max-height:min(430px, 48dvh) !important;}
#games .arcadeReactionBoard.isGo{background:radial-gradient(circle at 50% 34%, color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 74%, #ffffff) 0 14%, color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 48%, transparent) 15% 42%, transparent 68%), linear-gradient(135deg, color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 58%, #06351a), color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 22%, rgba(255,255,255,.05))) !important;border-color:color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 62%, rgba(255,255,255,.18)) !important;box-shadow:0 0 0 1px color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 42%, transparent) inset, 0 22px 58px color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 34%, rgba(0,0,0,.32)) !important;color:#fafffb !important;}
#games .arcadeReactionBoard.isBad{background:linear-gradient(180deg, rgba(255,74,104,.28), rgba(255,255,255,.03)) !important;}
#games .arcadeReactionBoard strong{font-size:clamp(28px, 10vw, 56px);letter-spacing:.02em;}
#games .arcadeReactionBoard small{font-size:14px;color:rgba(245,255,250,.76);max-width:28ch;line-height:1.35;}
#games .arcadeReactionPulse{width:96px;height:96px;border-radius:50%;background:radial-gradient(circle, color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 36%, rgba(255,255,255,.2)), transparent 68%);filter:blur(.2px);opacity:.85;}
#games .arcadeReactionBoard.isGo .arcadeReactionPulse{background:radial-gradient(circle, #ffffff 0 18%, color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 70%, #ffffff) 19% 52%, transparent 70%);box-shadow:0 0 40px color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 70%, transparent);opacity:1;}
#games .arcadeReactionBoard.isGo strong{text-shadow:0 0 22px rgba(255,255,255,.45), 0 0 34px color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 56%, transparent);}
#games .arcadeReactionBoard.isGo .arcadeReactionPulse{animation:reactionPulse .72s ease-in-out infinite alternate;}
@keyframes reactionPulse{from{transform:scale(.88);opacity:.65;}to{transform:scale(1.1);opacity:1;}}
@media (max-width: 700px){#games .arcadeHudWide{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;}#games .arcadeAimBoard{min-height:clamp(330px, 60dvh, 560px);}#games .arcadeReactionBoard{min-height:clamp(360px, 62dvh, 600px);}#games .arcadeHud .gamesStatValue{font-size:13px;}}

#games .arcadeBanner{display:grid;gap:8px;align-content:center;justify-items:center;min-height:clamp(220px, 40dvh, 340px);padding:18px;text-align:center;}
#games .arcadeBanner.isGo{background:linear-gradient(180deg, rgba(124,255,124,.12), rgba(255,255,255,.03));}
#games .arcadeBanner.isBad{background:linear-gradient(180deg, rgba(255,116,116,.16), rgba(255,255,255,.03));}
#games .arcadeBannerTitle{font-size:19px;font-weight:800;}
#games .arcadeBannerText{font-size:13px;line-height:1.45;color:rgba(231,255,240,.78);max-width:30ch;}
#games .arcadeGridList{display:grid;gap:6px;}
#games .arcadeGridList.grid-3{grid-template-columns:repeat(3,minmax(0,1fr));}
#games .arcadeGridList.grid-4{grid-template-columns:repeat(4,minmax(0,1fr));}
#games .arcadeTileBtn{border-radius:16px;border:1px solid rgba(124,255,124,.12);background:rgba(255,255,255,.03);color:#eef7ee;min-height:54px;font:inherit;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;}
#games .arcadeDigit{font-size:14px;line-height:1;}
#games .arcadeSudokuCell{width:100%;aspect-ratio:1 / 1;border-radius:10px;border:1px solid rgba(124,255,124,.10);background:rgba(255,255,255,.03);color:#eef7ee;text-align:center;font:inherit;font-weight:800;font-size:15px;}
#games .arcadeSudokuCell.sudokuBlockTop{border-top-color:rgba(226,246,255,.42);border-top-width:2px;}
#games .arcadeSudokuCell.sudokuBlockLeft{border-left-color:rgba(226,246,255,.42);border-left-width:2px;}
#games .arcadeSudokuCell.sudokuBlockRight{border-right-color:rgba(226,246,255,.36);border-right-width:2px;}
#games .arcadeSudokuCell.sudokuBlockBottom{border-bottom-color:rgba(226,246,255,.36);border-bottom-width:2px;}
#games .arcadeSudokuCell[readonly]{background:rgba(255,255,255,.06);color:#dfffe3;}
#games .arcadeMiniNote{font-size:11px;line-height:1.3;color:rgba(231,255,240,.64);}
#games .arcadeMemoryCard{aspect-ratio:1 / 1;border-radius:14px;border:1px solid rgba(124,255,124,.12);background:rgba(255,255,255,.035);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;transition:transform .15s ease, background .15s ease;}
#games .arcadeMemoryCard.isFlipped{background:rgba(124,255,124,.12);transform:scale(.98);}
#games .arcadeMemoryCard.isMatched{background:rgba(124,255,124,.18);opacity:.8;}
#games .arcadeTable{display:grid;gap:6px;}
#games .arcadeTableRow{display:grid;grid-template-columns:repeat(11,minmax(0,1fr));gap:4px;}
#games .arcadeBomberCell{aspect-ratio:1 / 1;border-radius:8px;border:1px solid rgba(124,255,124,.08);background:rgba(255,255,255,.03);display:flex;align-items:center;justify-content:center;font-size:12px;line-height:1;font-weight:700;}
#games .arcadeBomberCell.wall{background:rgba(255,255,255,.10);}
#games .arcadeBomberCell.brick{background:rgba(255,215,107,.15);}
#games .arcadeBomberCell.player{background:rgba(124,255,124,.22);}
#games .arcadeBomberCell.bomb{background:rgba(255,115,115,.18);}
#games .arcadeBomberCell.fire{background:rgba(255,170,80,.25);}

#games .arcadeBomberBoard{position:relative;display:block;width:min(100%,380px);max-width:380px;aspect-ratio:1/1;margin:0 auto;padding:8px;border-radius:22px;overflow:hidden;touch-action:none;}
#games .arcadeBomberCells{position:absolute;inset:8px;display:grid;grid-template-columns:repeat(11,minmax(0,1fr));grid-template-rows:repeat(11,minmax(0,1fr));gap:4px;}
#games .arcadeBomberEntities{position:absolute;inset:8px;pointer-events:none;}
#games .arcadeBomberCell{min-height:0;border-radius:9px;background:rgba(255,255,255,.035);border:1px solid color-mix(in srgb,var(--rakThemeAccent,var(--green2)) 16%,rgba(255,255,255,.08));box-shadow:inset 0 0 0 1px rgba(255,255,255,.025);}
#games .arcadeBomberCell.wall{background:linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.07));border-color:rgba(255,255,255,.18);}
#games .arcadeBomberCell.brick{background:linear-gradient(135deg,color-mix(in srgb,var(--rakThemeAccent,var(--green2)) 24%,rgba(255,180,70,.20)),rgba(255,255,255,.055));border-color:color-mix(in srgb,var(--rakThemeAccent,var(--green2)) 22%,rgba(255,215,120,.2));}
#games .arcadeBomberCell.fire{background:radial-gradient(circle,color-mix(in srgb,var(--rakThemeAccent,var(--green2)) 58%,#fff) 0 18%,rgba(255,160,62,.30) 19% 72%,rgba(255,255,255,.05));box-shadow:0 0 18px rgba(255,180,80,.28);}
#games .arcadeBomberCell.isTarget{outline:1px solid color-mix(in srgb,var(--rakThemeAccent,var(--green2)) 42%,rgba(255,255,255,.16));outline-offset:-2px;}
#games .bomberEntity{position:absolute;left:0;top:0;width:calc(100% / 11);height:calc(100% / 11);transform:translate(calc(var(--x) * 100%), calc(var(--y) * 100%));display:grid;place-items:center;font-size:clamp(14px,4.2vw,22px);transition:transform .13s linear, filter .16s ease, opacity .16s ease;will-change:transform;z-index:3;text-shadow:0 2px 8px rgba(0,0,0,.45);}
#games .bomberEntity.player{z-index:5;border-radius:12px;background:radial-gradient(circle at 35% 30%,#fff,color-mix(in srgb,var(--rakThemeAccent,var(--green2)) 78%,#fff) 36%,color-mix(in srgb,var(--rakThemeAccent,var(--green2)) 70%,#04130a));box-shadow:0 0 18px color-mix(in srgb,var(--rakThemeAccent,var(--green2)) 32%,transparent);animation:bomberStep .16s ease;}
#games .bomberEntity.player span{font-size:.78em;color:#06120b;text-shadow:none;font-weight:900;}
#games .bomberEntity.monster{z-index:4;filter:drop-shadow(0 0 8px rgba(255,80,110,.25));animation:bomberMonsterPulse .9s ease-in-out infinite alternate;}
#games .bomberEntity.bomb{z-index:4;animation:bomberBombPulse .55s ease-in-out infinite alternate;}
#games .bomberEntity.fire{z-index:6;color:#fff6cf;filter:drop-shadow(0 0 9px rgba(255,190,80,.7));}
#games .bomberEntity.upgrade{z-index:2;filter:drop-shadow(0 0 8px color-mix(in srgb,var(--rakThemeAccent,var(--green2)) 44%,transparent));}
@keyframes bomberStep{from{filter:brightness(1.35);transform:translate(calc(var(--x) * 100%), calc(var(--y) * 100%)) scale(.88);}to{filter:brightness(1);transform:translate(calc(var(--x) * 100%), calc(var(--y) * 100%)) scale(1);}}
@keyframes bomberBombPulse{from{transform:translate(calc(var(--x) * 100%), calc(var(--y) * 100%)) scale(.92);}to{transform:translate(calc(var(--x) * 100%), calc(var(--y) * 100%)) scale(1.08);}}
@keyframes bomberMonsterPulse{from{transform:translate(calc(var(--x) * 100%), calc(var(--y) * 100%)) scale(.96);}to{transform:translate(calc(var(--x) * 100%), calc(var(--y) * 100%)) scale(1.05);}}


/* v.1.1 (703) – velký společný polish všech hotových her */
#games .gamesArcadeRoot{min-height:0;overflow:hidden;}
#games .arcadeStage{gap:8px;min-height:0;overflow:hidden;padding-bottom:max(4px, env(safe-area-inset-bottom));}
#games .arcadeHud,
#games .arcadeHudWide,
#games .arcadeHudSingleLine{display:grid !important;grid-template-columns:repeat(auto-fit,minmax(62px,1fr)) !important;gap:6px !important;width:100% !important;align-items:stretch !important;}
#games .arcadeHud .gamesStatLine,
#games .arcadeHud .gamesStatCard{min-width:0 !important;padding:7px 6px !important;border-radius:14px !important;overflow:hidden !important;}
#games .arcadeHud .gamesStatLabel{font-size:clamp(8px,2.4vw,10px) !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;letter-spacing:-.01em !important;}
#games .arcadeHud .gamesStatValue{font-size:clamp(11px,3.1vw,14px) !important;line-height:1.08 !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;}
#games .arcadeTopScoreTight,
#games .gamesTop5ScrollCard{margin-top:6px !important;max-height:136px !important;overflow:hidden !important;border-radius:18px !important;}
#games .gamesTop5ScrollBody{max-height:92px !important;overflow-y:auto !important;overscroll-behavior:contain !important;-webkit-overflow-scrolling:touch !important;touch-action:pan-y !important;padding-right:3px !important;}
#games .gamesTop3Row{min-height:28px !important;gap:6px !important;align-items:center !important;}
#games .gamesTop3Name{min-width:0 !important;overflow:hidden !important;text-overflow:ellipsis !important;white-space:nowrap !important;}
#games .gamesTop3Value{font-size:11px !important;white-space:nowrap !important;overflow:hidden !important;text-overflow:ellipsis !important;}
#games .arcadeCanvasWrap,
#games .arcadeCanvas,
#games .arcadeBoardWrap,
#games .arcadeLogicBoard,
#games .arcadeBomberBoard{touch-action:none !important;overscroll-behavior:contain !important;-webkit-touch-callout:none !important;user-select:none !important;-webkit-user-select:none !important;}
#games .arcadeCanvasWrap{border:1px solid color-mix(in srgb,var(--rakThemeAccent,var(--green2)) 18%,rgba(255,255,255,.12)) !important;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.03)) !important;}
#games .arcadeControls{margin-top:2px !important;}
#games .arcadeControls .gameControlBtn{min-height:40px !important;border-radius:15px !important;}
#games .arcadeGameOverlay,
#games .bomberResultOverlay{overscroll-behavior:contain !important;}
#games .arcadeOverlayCard .gameControlBtn,
#games .bomberResultCard .gameControlBtn{min-height:42px !important;}
#games .sudokuNumberPicker{transform:translate(-50%, calc(-100% - 8px)) scale(1.06) !important;transform-origin:50% 100% !important;gap:7px !important;padding:10px !important;}
#games .sudokuNumberPicker button{min-width:42px !important;min-height:42px !important;display:grid !important;place-items:center !important;text-align:center !important;font-size:17px !important;line-height:1 !important;padding:0 !important;}
#games .arcadeMinesBoard .minesCell.flagged{background:linear-gradient(145deg,rgba(255,215,105,.30),rgba(255,255,255,.05)) !important;border-color:rgba(255,220,120,.52) !important;box-shadow:0 0 0 1px rgba(255,220,120,.18) inset,0 0 16px rgba(255,205,95,.16) !important;}
#games .arcadeMemoryBoardLarge{max-width:min(100%,390px) !important;margin-inline:auto !important;gap:7px !important;}
#games .arcadeMemoryBoardLarge .arcadeMemoryCard{font-size:clamp(24px,8vw,38px) !important;border-radius:18px !important;}
#games .arcadeBomberBoard{width:min(100%,380px) !important;max-width:380px !important;}
#games .arcadeBomberCell.wall{background:linear-gradient(135deg,rgba(255,255,255,.28),rgba(255,255,255,.10)) !important;border-color:rgba(255,255,255,.28) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 3px 10px rgba(0,0,0,.20) !important;}
#games .arcadeBomberCell.brick{background:linear-gradient(135deg,rgba(255,207,100,.32),rgba(124,255,124,.10),rgba(255,255,255,.06)) !important;border-color:rgba(255,218,125,.42) !important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 3px 10px rgba(0,0,0,.18) !important;}
@media (max-width:390px){#games .arcadeHud,#games .arcadeHudWide,#games .arcadeHudSingleLine{gap:4px !important;}#games .arcadeHud .gamesStatLine,#games .arcadeHud .gamesStatCard{padding:6px 4px !important;}#games .gamesTop5ScrollBody{max-height:82px !important;}#games .sudokuNumberPicker button{min-width:38px !important;min-height:38px !important;}}

/* v.1.1 (530) – Fáze 5 game performance */
body.ladaMode #games .arcadePanel,
html[data-lightweight="1"] #games .arcadePanel{backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:none;}
body.ladaMode #games .arcadeBoardWrap,
html[data-lightweight="1"] #games .arcadeBoardWrap{box-shadow:none;}
body.ladaMode #games .arcadeAimTarget,
html[data-lightweight="1"] #games .arcadeAimTarget{box-shadow:0 0 0 6px rgba(124,255,124,.08);}
@media (max-width: 700px){
  #games .arcadeHud{grid-template-columns:repeat(2,minmax(0,1fr));}
  #games .arcadeBoard.grid-9{gap:4px;}
  #games .arcadeBoard.grid-10{gap:4px;}
  #games .arcadeCell{min-height:38px;border-radius:14px;}
  #games .arcadeControls .gameControlBtn{min-height:40px;min-width:40px;}
}

/* v.1.5 (778) – Sudoku: větší deska, číselník napevno nad spodní lištou bez zbytečného horního prostoru. */
body.gamesOpen[data-rak-arcade-game="sudoku"] #games .arcadeShellRoot{
  padding-top:calc(2px + env(safe-area-inset-top)) !important;
  padding-bottom:calc(var(--bottom-nav-h, 72px) + env(safe-area-inset-bottom) + 4px) !important;
  height:100dvh !important;
  min-height:0 !important;
  overflow:hidden !important;
  gap:0 !important;
  box-sizing:border-box !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games .gamesShellBackFloating{
  position:fixed !important;
  left:10px !important;
  top:calc(4px + env(safe-area-inset-top)) !important;
  z-index:50 !important;
  height:28px !important;
  min-height:28px !important;
  padding:0 9px !important;
  font-size:11px !important;
  border-radius:12px !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"]{
  flex:1 1 auto !important;
  min-height:0 !important;
  height:calc(100dvh - var(--bottom-nav-h, 72px) - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 8px) !important;
  max-height:calc(100dvh - var(--bottom-nav-h, 72px) - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 8px) !important;
  overflow:hidden !important;
  padding:4px 6px 0 !important;
  display:flex !important;
  align-items:flex-start !important;
  justify-content:center !important;
  box-sizing:border-box !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuGameStage{
  width:100% !important;
  height:100% !important;
  max-height:100% !important;
  min-height:0 !important;
  display:grid !important;
  grid-template-rows:min-content min-content minmax(0,auto) min-content !important;
  align-items:center !important;
  justify-items:center !important;
  align-content:start !important;
  gap:5px !important;
  overflow:hidden !important;
  padding:0 !important;
  box-sizing:border-box !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuHud{
  grid-row:1 !important;
  width:min(100%,360px) !important;
  margin:0 auto !important;
  gap:4px !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuHud .gamesStatCard,
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuHud .gamesStatLine{
  min-height:28px !important;
  padding:4px 6px !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuRestartTop{
  grid-row:2 !important;
  margin:0 auto !important;
  min-height:28px !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuRestartTop .gameControlBtn{
  min-height:28px !important;
  height:28px !important;
  padding:0 10px !important;
  font-size:11px !important;
  border-radius:12px !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .arcadeSudokuPaper{
  grid-row:3 !important;
  align-self:end !important;
  width:min(calc(100vw - 18px), 360px, calc(100dvh - var(--bottom-nav-h, 72px) - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 150px)) !important;
  max-width:360px !important;
  margin:0 auto !important;
  gap:3px !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .arcadeSudokuCell{
  border-radius:8px !important;
  font-size:clamp(14px,4.5vw,20px) !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuNumberPickerDocked,
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuNumberPickerTwoRows{
  grid-row:4 !important;
  position:static !important;
  left:auto !important;
  right:auto !important;
  bottom:auto !important;
  transform:none !important;
  width:max-content !important;
  max-width:100% !important;
  margin:6px auto 0 !important;
  display:grid !important;
  grid-template-columns:repeat(5, 42px) !important;
  gap:5px !important;
  padding:7px !important;
  z-index:4 !important;
  box-sizing:border-box !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuNumberPickerTwoRows button{
  width:42px !important;
  min-width:42px !important;
  max-width:42px !important;
  height:39px !important;
  min-height:39px !important;
  max-height:39px !important;
  font-size:16px !important;
}
@media (max-height:720px){
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"]{padding-top:2px !important;}
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuGameStage{gap:4px !important;}
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .arcadeSudokuPaper{width:min(calc(100vw - 16px), 350px, calc(100dvh - var(--bottom-nav-h, 72px) - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 140px)) !important;max-width:350px !important;}
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuNumberPickerTwoRows{grid-template-columns:repeat(5,40px) !important;gap:4px !important;padding:6px !important;}
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuNumberPickerTwoRows button{width:40px !important;min-width:40px !important;height:37px !important;min-height:37px !important;font-size:15px !important;}
}
@media (max-height:630px){
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuHud .gamesStatCard,
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuHud .gamesStatLine{min-height:24px !important;padding:3px 5px !important;}
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuRestartTop .gameControlBtn{height:24px !important;min-height:24px !important;font-size:10px !important;}
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .arcadeSudokuPaper{width:min(calc(100vw - 14px), 338px, calc(100dvh - var(--bottom-nav-h, 72px) - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 128px)) !important;max-width:338px !important;gap:2px !important;}
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuNumberPickerTwoRows{grid-template-columns:repeat(5,38px) !important;gap:4px !important;padding:5px !important;}
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuNumberPickerTwoRows button{width:38px !important;min-width:38px !important;height:35px !important;min-height:35px !important;font-size:14px !important;}
}



/* v.1.5 (778) – herní dlaždice sjednocené: ikona vlevo, nadpis a popis rovně vedle ní. */
#games .gamesLaunchTile{
  display:grid !important;
  grid-template-columns:44px minmax(0, 1fr) !important;
  column-gap:10px !important;
  align-items:center !important;
  justify-content:flex-start !important;
  text-align:left !important;
}
#games .gamesLaunchTile .calcTileIcon{
  grid-column:1 !important;
  justify-self:center !important;
  align-self:center !important;
  min-width:42px !important;
}
#games .gamesLaunchTile .gamesLaunchText{
  grid-column:2 !important;
  min-width:0 !important;
  max-width:100% !important;
  overflow:hidden !important;
  text-align:left !important;
}
#games .gamesLaunchTile .calcTileText,
#games .gamesLaunchTile .smallText{
  display:block !important;
  text-align:left !important;
  max-width:100% !important;
  overflow:hidden !important;
  text-overflow:ellipsis !important;
}

/* v.1.5 (778) – Sudoku: větší volba obtížnosti. */
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuMenuStage{
  width:100% !important;
  min-height:0 !important;
  align-content:start !important;
  justify-content:center !important;
  padding-top:4px !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuMenuCard{
  width:min(100%, 390px) !important;
  margin:0 auto !important;
  gap:12px !important;
  padding:14px !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuDifficultyMenu{
  display:grid !important;
  grid-template-columns:repeat(3, minmax(0, 1fr)) !important;
  gap:8px !important;
  width:100% !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuDifficultyBtn{
  min-height:62px !important;
  height:auto !important;
  padding:8px 6px !important;
  display:grid !important;
  place-items:center !important;
  gap:3px !important;
  font-size:14px !important;
  line-height:1.05 !important;
  text-align:center !important;
  border-radius:16px !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuDifficultyBtn strong{
  font-size:clamp(16px, 4.4vw, 20px) !important;
  line-height:1 !important;
  font-weight:950 !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuDifficultyBtn span{
  font-size:10px !important;
  line-height:1 !important;
  opacity:.72 !important;
}


/* v.1.5 (778) – Sudoku: volba obtížnosti výš bez zbytečného horního prostoru. */
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuMenuStage{
  align-content:start !important;
  justify-content:start !important;
  padding-top:0 !important;
  margin-top:-14px !important;
  gap:8px !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuMenuCard{
  transform:translateY(-10px) !important;
  margin-top:0 !important;
}
@media (max-height:720px){
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuMenuStage{margin-top:-20px !important;}
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuMenuCard{transform:translateY(-14px) !important;}
}

/* v.1.5 (778) – Pexeso 4×4: odhalená karta nesmí měnit velikost pole. */
#games .arcadeMemoryBoard.grid-4{
  display:grid !important;
  grid-template-columns:repeat(4, minmax(0, 1fr)) !important;
  grid-template-rows:repeat(4, minmax(0, 1fr)) !important;
  grid-auto-rows:minmax(0, 1fr) !important;
  aspect-ratio:1 / 1 !important;
  width:min(100%, 360px, calc(100vw - 24px)) !important;
  max-width:360px !important;
  max-height:min(360px, calc(100vw - 24px)) !important;
  gap:9px !important;
  padding:8px !important;
  align-items:stretch !important;
  justify-items:stretch !important;
  box-sizing:border-box !important;
  overflow:hidden !important;
}
#games .arcadeMemoryBoard.grid-4 .arcadeMemoryCard{
  width:100% !important;
  height:100% !important;
  min-width:0 !important;
  min-height:0 !important;
  max-width:none !important;
  max-height:none !important;
  aspect-ratio:auto !important;
  display:grid !important;
  place-items:center !important;
  padding:0 !important;
  line-height:1 !important;
  overflow:hidden !important;
  contain:layout paint !important;
  font-size:clamp(28px, 9vw, 42px) !important;
}
#games .arcadeMemoryBoard.grid-4 .arcadeMemoryCard.isFlipped,
#games .arcadeMemoryBoard.grid-4 .arcadeMemoryCard.isMatched{
  transform:none !important;
}

/* v.1.5 (779) – Sudoku: menu obtížnosti o kousek níž, aby nebyl useknutý horní okraj panelu. */
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuMenuStage{
  padding-top:6px !important;
  margin-top:-4px !important;
  overflow:visible !important;
}
body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuMenuCard{
  transform:translateY(0) !important;
  margin-top:0 !important;
  overflow:visible !important;
}
@media (max-height:720px){
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuMenuStage{padding-top:6px !important;margin-top:-6px !important;}
  body.gamesOpen[data-rak-arcade-game="sudoku"] #games #gamesShellBody[data-arcade-game="sudoku"] .sudokuMenuCard{transform:translateY(0) !important;}
}

`;
  if (!document.getElementById('rakArcadeStyles')) {
    const style = document.createElement('style');
    style.id = 'rakArcadeStyles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  const cleanups = new Set();
  const currentState = { id: '', state: null };
  const key = (id) => String(id || '').trim();

  function memoryVariantId(size) {
    const n = Math.max(4, Math.min(8, Number(size || 6) || 6));
    return `memory_${n}x${n}`;
  }
  function sudokuVariantId(diff) {
    const d = String(diff || 'easy').trim().toLowerCase();
    return `sudoku_${d === 'medium' || d === 'hard' ? d : 'easy'}`;
  }
  function difficultyTopTitle(id) {
    const meta = gameMeta(id);
    return meta && meta.title ? `Top 5 · ${meta.title}` : 'Top 5 výsledků';
  }
  function leaderboardGameIds() {
    return Array.from(new Set(ALL_GAMES.concat(['memory_4x4','memory_6x6','memory_8x8','sudoku_easy','sudoku_medium','sudoku_hard'], DAILY_MODES.map((id) => 'daily_' + id))));
  }


  // v.1.5 (920): Malý DOM/security hardening pro Top score.
  // Jména, jednotky a hodnoty se normalizují na text ještě před složením HTML řádku.
  const GAMES_TOP_SCORE_DOM_HARDENING = {
    mode: 'games-top-score-dom-hardening-v920',
    sinks: ['gamesTop3Block'],
    escapedFields: ['id', 'name', 'valueText', 'playedTextDateTime', 'title', 'unit'],
    maxNameLength: 48,
    maxUnitLength: 16,
    maxRows: 50
  };

  function gamesSafePlainText(value, fallback, maxLength) {
    const raw = String(value == null ? '' : value)
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const text = raw || String(fallback || '');
    return text.slice(0, Math.max(1, Number(maxLength || 80) || 80));
  }

  function gamesSafePlayerName(value) {
    return gamesSafePlainText(value, 'Hráč', GAMES_TOP_SCORE_DOM_HARDENING.maxNameLength) || 'Hráč';
  }

  function gamesSafeScoreUnit(value, fallback) {
    return gamesSafePlainText(value, fallback || '', GAMES_TOP_SCORE_DOM_HARDENING.maxUnitLength);
  }

  function gamesSafeLeaderboardValue(gameId, value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return 0;
    if (isLowBetter(gameId)) {
      const safe = gamesSanitizeLowBestTime(gameId, n);
      return safe > 0 ? Math.round(safe) : 0;
    }
    return Math.max(1, Math.min(999999999, Math.round(n)));
  }

  function gamesLeaderboardPlayedText(row) {
    const safeRow = row && typeof row === 'object' ? row : {};
    const timestamp = safeRow.playedAt || safeRow.played_at || safeRow.lastPlayedAt || safeRow.last_played_at || safeRow.updatedAt || safeRow.updated_at || safeRow.createdAt || safeRow.created_at || 0;
    const formatted = timestamp ? formatDate(timestamp) : '';
    const rawText = gamesSafePlainText(safeRow.playedText || safeRow.played_text || '', '', 40);
    if (formatted && (!rawText || rawText.indexOf(':') < 0)) return formatted;
    return rawText || formatted;
  }

  function gamesNormalizeLeaderboardRow(gameId, row) {
    const safeRow = row && typeof row === 'object' ? row : {};
    const fallbackName = safeRow.id ? ('Hráč ' + String(safeRow.id)) : 'Hráč';
    const playedText = gamesSafePlainText(gamesLeaderboardPlayedText(safeRow), '', 40);
    return {
      id: gamesSafePlainText(safeRow.id || safeRow.account_number || safeRow.accountNumber || '', '', 40),
      name: gamesSafePlayerName(safeRow.name || safeRow.player_name || safeRow.full_name || fallbackName),
      value: gamesSafeLeaderboardValue(gameId, safeRow.value),
      playedText,
      gameId: key(gameId)
    };
  }

  function gamesLeaderboardValueText(gameId, row, unitLabel) {
    const value = gamesSafeLeaderboardValue(gameId, row && row.value);
    if (!value) return '';
    if (isLowBetter(gameId)) return fmtGameValue(gameId, value);
    const unit = gamesSafeScoreUnit(unitLabel || (gameMeta(gameId).unit || ''), '');
    return (String(value) + (unit ? ' ' + unit : '')).trim();
  }

  function gamesLeaderboardRowHtml(gameId, row, index, unitLabel) {
    const safe = gamesNormalizeLeaderboardRow(gameId, row);
    const valueText = gamesLeaderboardValueText(gameId, safe, unitLabel);
    const played = safe.playedText ? ' · ' + escapeHtml(safe.playedText) : '';
    return '<div class="gamesTop3Row">' +
      '<div class="gamesTop3Rank">' + String(Math.max(1, Number(index || 0) + 1)) + '.</div>' +
      '<div class="gamesTop3Name">' + escapeHtml(safe.name) + '</div>' +
      '<div class="gamesTop3Value">' + escapeHtml(valueText) + played + '</div>' +
    '</div>';
  }

  function getRakGamesTopScoreDomHardeningHealth() {
    const probe = gamesNormalizeLeaderboardRow('aim', {
      id: '<id>',
      name: '<img src=x onerror=alert(1)> Martin',
      value: '123',
      playedText: '<script>alert(1)</script>',
      lastPlayedAt: '2026-05-26T15:42:00+02:00'
    });
    const probeHtml = gamesLeaderboardRowHtml('aim', probe, 0, 'bodů');
    const ok = probeHtml.includes('&lt;img') && probeHtml.includes('15:42') && !probeHtml.includes('<img') && !probeHtml.includes('<script');
    return {
      ok,
      mode: GAMES_TOP_SCORE_DOM_HARDENING.mode,
      version: String(window.APP_VERSION || '1.2 (1.65)'),
      scope: 'Top score řádky ve hrách',
      sinks: GAMES_TOP_SCORE_DOM_HARDENING.sinks.slice(),
      escapedFields: GAMES_TOP_SCORE_DOM_HARDENING.escapedFields.slice(),
      maxNameLength: GAMES_TOP_SCORE_DOM_HARDENING.maxNameLength,
      maxUnitLength: GAMES_TOP_SCORE_DOM_HARDENING.maxUnitLength,
      probeEscaped: ok,
      note: 'Read-only diagnostika; Top score renderer escapuje texty a u výsledku vyžaduje datum i čas.'
    };
  }
  window.getRakGamesTopScoreDomHardeningHealth = getRakGamesTopScoreDomHardeningHealth;

  function getRakGamesTopScoreSecondsHealth() {
    const probe = fmtGameValue('reaction', 184);
    const noMs = probe.indexOf('ms') < 0;
    const hasSeconds = probe.indexOf('s') >= 0;
    return {
      ok: noMs && hasSeconds,
      mode: 'games-top-score-seconds-v923',
      version: String(window.APP_VERSION || '1.2 (1.65)'),
      scope: 'Top výsledky her – reakční čas ve vteřinách místo milisekund',
      probe,
      note: 'Herní Top score pro Reaction Test zobrazuje čas jako sekundy s desetinnou čárkou, ne jako ms.'
    };
  }
  window.getRakGamesTopScoreSecondsHealth = getRakGamesTopScoreSecondsHealth;


  function getRakGamesProfileDomHardeningHealth() {
    const probeName = gamesProfileSafeName('<img src=x onerror=alert(1)> Martin', 'Hráč');
    const probeAchievement = {
      id: '<script>id</script>',
      title: '<b>Achievement</b>',
      desc: '<img src=x onerror=alert(1)> popis',
      goalText: '<svg onload=alert(1)>',
      target: '10'
    };
    const probeProfileHtml = '<div>' + escapeHtml(probeName) + '</div>';
    const probeAchievementHtml = renderAchievementCard(probeAchievement, '5');
    const joined = probeProfileHtml + probeAchievementHtml;
    const ok = joined.includes('&lt;img') && joined.includes('&lt;b') && joined.includes('&lt;script') && joined.includes('&lt;svg') && !joined.includes('<img') && !joined.includes('<script') && !joined.includes('<svg') && !joined.includes('<b>Achievement</b>');
    return {
      ok,
      mode: GAMES_PROFILE_DOM_HARDENING.mode,
      version: String(window.APP_VERSION || '1.2 (1.65)'),
      scope: 'Profily, statistiky a achievementy ve hrách',
      sinks: GAMES_PROFILE_DOM_HARDENING.sinks.slice(),
      escapedFields: GAMES_PROFILE_DOM_HARDENING.escapedFields.slice(),
      numericFields: GAMES_PROFILE_DOM_HARDENING.numericFields.slice(),
      maxNameLength: GAMES_PROFILE_DOM_HARDENING.maxNameLength,
      maxIdLength: GAMES_PROFILE_DOM_HARDENING.maxIdLength,
      probeEscaped: ok,
      note: 'Read-only diagnostika rendererů profilů/statistik/achievementů; hodnoty storage ani Supabase se nečtou.'
    };
  }
  window.getRakGamesProfileDomHardeningHealth = getRakGamesProfileDomHardeningHealth;

  // v.1.5 (920): Malý DOM/security hardening pro herní HUD/stavové hlášky.
  // Všechny arcade HUD řádky v tomto souboru teď jdou přes lokální gamesStatLine(), která zkrátí a escapuje label i hodnotu.
  const GAMES_HUD_MESSAGE_DOM_HARDENING = {
    mode: 'games-hud-message-dom-hardening-v920',
    sinks: ['arcadeHud', 'gamesStatLine', 'arcadeErrorBanner'],
    escapedFields: ['label', 'value', 'errorMessage'],
    maxLabelLength: 32,
    maxValueLength: 64,
    maxErrorLength: 140
  };

  function gamesHudSafeText(value, fallback, maxLength) {
    return gamesSafePlainText(value, fallback || '', maxLength || GAMES_HUD_MESSAGE_DOM_HARDENING.maxValueLength);
  }

  function gamesStatLine(label, value) {
    const safeLabel = gamesHudSafeText(label, '—', GAMES_HUD_MESSAGE_DOM_HARDENING.maxLabelLength);
    const safeValue = gamesHudSafeText(value, '—', GAMES_HUD_MESSAGE_DOM_HARDENING.maxValueLength);
    return '<div class="gamesStatCard"><div class="gamesStatLabel">' + escapeHtml(safeLabel) + '</div><div class="gamesStatValue">' + escapeHtml(safeValue) + '</div></div>';
  }

  function gamesArcadeErrorBannerHtml(error) {
    const message = gamesHudSafeText(error && error.message ? error.message : (error || 'Neznámá chyba'), 'Neznámá chyba', GAMES_HUD_MESSAGE_DOM_HARDENING.maxErrorLength);
    return '<div class="arcadeStage"><div class="arcadeBanner arcadePanel isBad"><div class="arcadeBannerTitle">Hra se nenačetla</div><div class="arcadeBannerText">V téhle hře se něco rozbilo při vykreslení. Zkus ji otevřít znovu, nebo se podívej do diagnostiky.</div><div class="arcadeMiniNote">' + escapeHtml(message) + '</div></div></div>';
  }

  function getRakGamesHudMessageDomHardeningHealth() {
    const probeHud = gamesStatLine('<img src=x onerror=alert(1)>', '<script>alert(1)</script> 123');
    const probeError = gamesArcadeErrorBannerHtml(new Error('<svg onload=alert(1)> chyba'));
    const joined = probeHud + probeError;
    const ok = joined.includes('&lt;img') && joined.includes('&lt;script') && joined.includes('&lt;svg') && !joined.includes('<img') && !joined.includes('<script') && !joined.includes('<svg');
    return {
      ok,
      mode: GAMES_HUD_MESSAGE_DOM_HARDENING.mode,
      version: String(window.APP_VERSION || '1.2 (1.65)'),
      scope: 'Herní HUD a chybové/stavové hlášky arcade rendererů',
      sinks: GAMES_HUD_MESSAGE_DOM_HARDENING.sinks.slice(),
      escapedFields: GAMES_HUD_MESSAGE_DOM_HARDENING.escapedFields.slice(),
      maxLabelLength: GAMES_HUD_MESSAGE_DOM_HARDENING.maxLabelLength,
      maxValueLength: GAMES_HUD_MESSAGE_DOM_HARDENING.maxValueLength,
      maxErrorLength: GAMES_HUD_MESSAGE_DOM_HARDENING.maxErrorLength,
      probeEscaped: ok,
      note: 'Read-only diagnostika lokálního HUD formatteru; hodnoty storage ani Supabase se nečtou.'
    };
  }
  window.getRakGamesHudMessageDomHardeningHealth = getRakGamesHudMessageDomHardeningHealth;

  // v.1.5 (920): Read-only guard pro malé DOM/security pokračování v menu Lodí.
  const GAMES_SHIPS_MENU_DOM_HARDENING = {
    mode: 'games-ships-menu-dom-hardening-v920',
    sinks: ['shipsH2HRow', 'shipsInviteOverlay', 'shipsStatus'],
    escapedFields: ['playerName', 'inviteCode', 'inviteUrl', 'statusMessage'],
    maxTextLength: 120
  };

  function getRakGamesShipsMenuDomHardeningHealth() {
    const probeStatus = '<div class="arcadeStatus shipsStatus">' + escapeHtml(gamesSafePlainText('<img src=x onerror=alert(1)>', '', GAMES_SHIPS_MENU_DOM_HARDENING.maxTextLength)) + '</div>';
    const probeInvite = '<div data-ships-copy-link="' + escapeHtml('https://example.invalid/?x=<script>') + '">' + escapeHtml('1234<script>') + '</div>';
    const probeRow = '<div class="shipsH2HRow"><span>' + escapeHtml('A<img>') + ' vs ' + escapeHtml('B<script>') + '</span></div>';
    const joined = probeStatus + probeInvite + probeRow;
    const ok = joined.includes('&lt;img') && joined.includes('&lt;script') && !joined.includes('<img') && !joined.includes('<script');
    return {
      ok,
      mode: GAMES_SHIPS_MENU_DOM_HARDENING.mode,
      version: String(window.APP_VERSION || '1.2 (1.65)'),
      scope: 'Menu Lodí, pozvánka a uložené vzájemné zápasy',
      sinks: GAMES_SHIPS_MENU_DOM_HARDENING.sinks.slice(),
      escapedFields: GAMES_SHIPS_MENU_DOM_HARDENING.escapedFields.slice(),
      maxTextLength: GAMES_SHIPS_MENU_DOM_HARDENING.maxTextLength,
      probeEscaped: ok,
      note: 'Read-only guard navazuje na DOM/security hardening; online flow ani Supabase se nemění.'
    };
  }
  window.getRakGamesShipsMenuDomHardeningHealth = getRakGamesShipsMenuDomHardeningHealth;


  // v.1.5 (920): Malý DOM/security hardening pro denní challenge menu.
  // Denní hra používá statická data, ale texty se stejně normalizují a escapují před vložením do HTML.
  const GAMES_DAILY_CHALLENGE_DOM_HARDENING = {
    mode: 'games-daily-challenge-dom-hardening-v920',
    sinks: ['dailyChallengeHud', 'dailyChallengeIntro', 'dailyScoreTitle'],
    escapedFields: ['label', 'description', 'scoreTitle'],
    maxLabelLength: 48,
    maxDescriptionLength: 180
  };

  function gamesDailySafeLabel(value, fallback) {
    return gamesSafePlainText(value, fallback || 'Challenge', GAMES_DAILY_CHALLENGE_DOM_HARDENING.maxLabelLength);
  }

  function gamesDailySafeDescription(value) {
    return gamesSafePlainText(value, 'Každý den jiná výzva.', GAMES_DAILY_CHALLENGE_DOM_HARDENING.maxDescriptionLength);
  }

  function getRakGamesDailyChallengeDomHardeningHealth() {
    const probeLabel = gamesDailySafeLabel('<img src=x onerror=alert(1)>', 'Challenge');
    const probeText = gamesDailySafeDescription('<script>alert(1)</script> Dnes hraj.');
    const probeHtml = '<div>' + escapeHtml(probeLabel) + '</div><div>' + escapeHtml(probeText) + '</div>';
    const ok = probeHtml.includes('&lt;img') && probeHtml.includes('&lt;script') && !probeHtml.includes('<img') && !probeHtml.includes('<script');
    return {
      ok,
      mode: GAMES_DAILY_CHALLENGE_DOM_HARDENING.mode,
      version: String(window.APP_VERSION || '1.2 (1.65)'),
      scope: 'Denní challenge – úvodní texty, HUD a Top score nadpis',
      sinks: GAMES_DAILY_CHALLENGE_DOM_HARDENING.sinks.slice(),
      escapedFields: GAMES_DAILY_CHALLENGE_DOM_HARDENING.escapedFields.slice(),
      maxLabelLength: GAMES_DAILY_CHALLENGE_DOM_HARDENING.maxLabelLength,
      maxDescriptionLength: GAMES_DAILY_CHALLENGE_DOM_HARDENING.maxDescriptionLength,
      probeEscaped: ok,
      note: 'Read-only guard; denní challenge texty se normalizují před HTML a online flow se nemění.'
    };
  }
  window.getRakGamesDailyChallengeDomHardeningHealth = getRakGamesDailyChallengeDomHardeningHealth;

  function addCleanup(fn) { if (typeof fn === 'function') cleanups.add(fn); }
  function clearCleanups() { cleanups.forEach((fn) => { try { fn(); } catch (err) {} }); cleanups.clear(); }
  function setActiveState(id, state) { currentState.id = key(id); currentState.state = state || null; }
  function getActiveState() { return currentState.state; }

  const gamePerf = window.__rakGamePerfManager || (window.__rakGamePerfManager = {
    enabled: true,
    hiddenSkips: 0,
    lastVisibilityAt: 0,
    maxDeltaMs: 34,
    leaderboardTtlMs: 60000,
    shellRenderSkips: 0,
    intervalHiddenSkips: 0,
    activeManagedIntervals: 0,
    launchRenderSkips: 0,
    statsRenderSkips: 0,
    scheduledStatsRenders: 0,
    statsIdlePending: false,
    profileSyncRuns: 0,
    profileSyncSkips: 0,
    profileSyncInFlightSkips: 0,
    profileSyncOfflineSkips: 0,
    profileSyncHiddenSkips: 0,
    profileRenderSkips: 0,
    achievementRenderSkips: 0,
    leaderboardInFlightSkips: 0,
    leaderboardHiddenSkips: 0,
    hubRenderRuns: 0,
    hubActiveShellSkips: 0,
    launchObserverBatches: 0,
    launchObserverSkips: 0,
    launchObserverIgnored: 0,
    statsRenderRuns: 0,
    profileRenderRuns: 0,
    achievementRenderRuns: 0,
    leaderboardRefreshRuns: 0,
    leaderboardCacheHits: 0,
    leaderboardFreshLoads: 0,
    onlineRefreshRuns: 0,
    onlineRefreshSkips: 0,
    liveLeaderboardRefreshRuns: 0,
    liveLeaderboardRefreshSkips: 0
  });

  function isGamesPageVisible() {
    if (document.visibilityState === 'hidden') return false;
    if (!document.body || !document.body.classList.contains('gamesOpen')) return false;
    return !!(window.app && window.app.activeGameShell);
  }

  function isGamesHubActive() {
    if (document.visibilityState === 'hidden') return false;
    const page = document.getElementById('games');
    return !!(page && page.classList && page.classList.contains('active'));
  }

  function rakGameDelta(state, ts) {
    const last = Number(state && state.lastTs || 0) || ts;
    if (state) state.lastTs = ts;
    const profile = rakGamePerformanceProfile();
    const maxDelta = rakGameIsLadaMode() ? Math.max(28, Number(profile.maxDeltaMs || 34) || 34) : Number(gamePerf.maxDeltaMs || 34) || 34;
    return Math.max(0, Math.min(maxDelta, ts - last));
  }

  function rakGameRequestFrame(state, loop) {
    if (!isGamesPageVisible()) {
      gamePerf.hiddenSkips += 1;
      if (state) {
        state.raf = 0;
        state.lastTs = 0;
        state.ladaLastFrameTs = 0;
      }
      return 0;
    }
    return requestAnimationFrame((ts) => {
      const minFrameMs = rakGameFrameMs();
      if (state && minFrameMs > 0) {
        const last = Number(state.ladaLastFrameTs || 0) || 0;
        if (last && ts - last < minFrameMs) {
          gamePerf.ladaFrameSkips = Number(gamePerf.ladaFrameSkips || 0) + 1;
          state.raf = rakGameRequestFrame(state, loop);
          return;
        }
        state.ladaLastFrameTs = ts;
      }
      loop(ts);
    });
  }

  function rakGameShouldTick() {
    return isGamesPageVisible();
  }

  if (!window.__rakGamePerfVisibilityBound) {
    window.__rakGamePerfVisibilityBound = true;
    document.addEventListener('visibilitychange', () => {
      // Jen značkujeme stav. Smyčky přes requestAnimationFrame se v pozadí samy uspí
      // a delta čas je po návratu oříznutý, takže se hra nesplaší ani nepřepočítá skokově.
      // Důležité: nespouštět gamesStopActiveLoops(), protože by to u některých her zapsalo výsledek předčasně.
      gamePerf.lastVisibilityAt = Date.now();
      gamePerf.hidden = document.visibilityState === 'hidden';
    }, { passive: true });
  }

  if (!window.__rakGamePerfPageLifecycleBound) {
    window.__rakGamePerfPageLifecycleBound = true;
    window.addEventListener('pagehide', () => {
      gamePerf.lastVisibilityAt = Date.now();
      gamePerf.hidden = true;
      gamePerf.pageHideCount = Number(gamePerf.pageHideCount || 0) + 1;
    }, { passive: true });
    window.addEventListener('pageshow', () => {
      gamePerf.lastVisibilityAt = Date.now();
      gamePerf.hidden = document.visibilityState === 'hidden';
      gamePerf.pageShowCount = Number(gamePerf.pageShowCount || 0) + 1;
    }, { passive: true });
  }



  if (!window.__rakGamePerfOnlineBound) {
    window.__rakGamePerfOnlineBound = true;
    let gamesOnlineRefreshTimer = 0;
    window.addEventListener('online', () => {
      if (!isGamesHubActive() || (window.app && window.app.activeGameShell)) {
        gamePerf.onlineRefreshSkips = Number(gamePerf.onlineRefreshSkips || 0) + 1;
        return;
      }
      if (gamesOnlineRefreshTimer) {
        clearTimeout(gamesOnlineRefreshTimer);
        gamePerf.onlineRefreshSkips = Number(gamePerf.onlineRefreshSkips || 0) + 1;
      }
      gamesOnlineRefreshTimer = setTimeout(() => {
        gamesOnlineRefreshTimer = 0;
        if (!isGamesHubActive() || (window.app && window.app.activeGameShell)) {
          gamePerf.onlineRefreshSkips = Number(gamePerf.onlineRefreshSkips || 0) + 1;
          return;
        }
        gamePerf.onlineRefreshRuns = Number(gamePerf.onlineRefreshRuns || 0) + 1;
        try {
          if (typeof window.gamesSyncProfileFromRemote === 'function') void window.gamesSyncProfileFromRemote(false);
          void refreshRemoteLeaderboards();
          scheduleStatsExtended('online-resume');
        } catch (err) {
          console.warn('arcade online resume refresh failed', err);
        }
      }, rakGameIsLadaMode() ? 900 : 420);
    }, { passive: true });
  }

  function rakGameIsLadaMode() {
    try {
      return !!(document.body && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lightweightMode') || document.body.classList.contains('ladaTurboMode')))
        || !!(document.documentElement && (document.documentElement.dataset.lightweight === '1' || String(document.documentElement.dataset.rakLadaProfile || '') === 'turbo'));
    } catch (err) {
      return false;
    }
  }

  function rakGamePerformanceProfile() {
    try {
      if (typeof window.getRakLadaPerformanceProfile === 'function') return window.getRakLadaPerformanceProfile();
    } catch (err) {}
    return { active: rakGameIsLadaMode(), level: rakGameIsLadaMode() ? 'turbo' : 'normal', frameMs: rakGameIsLadaMode() ? 42 : 0, resizeThrottleMs: rakGameIsLadaMode() ? 700 : 120, leaderboardTtlMs: rakGameIsLadaMode() ? 240000 : 60000, idleDelayMs: rakGameIsLadaMode() ? 360 : 60, maxDeltaMs: rakGameIsLadaMode() ? 42 : 48, domBatchDelayMs: rakGameIsLadaMode() ? 220 : 40 };
  }

  function rakGameFrameMs() {
    const profile = rakGamePerformanceProfile();
    return rakGameIsLadaMode() ? Math.max(34, Number(profile.frameMs || 42) || 42) : 0;
  }

  function rakGameResizeThrottleMs() {
    const profile = rakGamePerformanceProfile();
    return rakGameIsLadaMode() ? Math.max(360, Number(profile.resizeThrottleMs || 700) || 700) : Math.max(80, Number(profile.resizeThrottleMs || 120) || 120);
  }

  function rakGameLeaderboardTtl() {
    const base = Number(gamePerf && gamePerf.leaderboardTtlMs || 60000) || 60000;
    const profile = rakGamePerformanceProfile();
    return rakGameIsLadaMode() ? Math.max(base, Number(profile.leaderboardTtlMs || 240000) || 240000) : base;
  }

  function rakGameSetInterval(fn, delay) {
    const profile = rakGamePerformanceProfile();
    const ms = Math.max(rakGameIsLadaMode() ? Math.max(180, Number(profile.frameMs || 42) * 4) : 80, Number(delay) || 120);
    const wrapped = () => {
      if (!rakGameShouldTick()) {
        gamePerf.intervalHiddenSkips += 1;
        return;
      }
      try {
        fn();
      } catch (err) {
        console.warn('arcade interval failed', err);
      }
    };
    const timer = setInterval(wrapped, ms);
    gamePerf.activeManagedIntervals += 1;
    addCleanup(() => {
      clearInterval(timer);
      gamePerf.activeManagedIntervals = Math.max(0, Number(gamePerf.activeManagedIntervals || 0) - 1);
    });
    return timer;
  }

  function isArcadeShellMounted(id) {
    const body = document.getElementById('gamesShellBody');
    return !!(body && body.dataset && body.dataset.arcadeGame === key(id) && body.childElementCount > 0 && currentState.id === key(id));
  }


  let statsRenderPending = false;
  function rakGameScheduleIdle(fn, delay) {
    const profile = rakGamePerformanceProfile();
    const ms = Math.max(20, Number(delay) || (rakGameIsLadaMode() ? Math.max(220, Number(profile.idleDelayMs || 360) || 360) : 60));
    const ric = window.requestIdleCallback;
    if (typeof ric === 'function') {
      return ric(() => {
        try { fn(); } catch (err) { console.warn('arcade idle task failed', err); }
      }, { timeout: Math.max(350, ms * 6) });
    }
    return setTimeout(() => {
      try { fn(); } catch (err) { console.warn('arcade idle task failed', err); }
    }, ms);
  }

  function scheduleStatsExtended(reason) {
    const grid = document.getElementById('gamesStatsGrid');
    if (!grid) return;
    if (!grid.childElementCount) {
      renderStatsExtended();
      return;
    }
    if (statsRenderPending) {
      gamePerf.statsIdlePending = true;
      return;
    }
    statsRenderPending = true;
    gamePerf.statsIdlePending = true;
    gamePerf.scheduledStatsRenders = Number(gamePerf.scheduledStatsRenders || 0) + 1;
    rakGameScheduleIdle(() => {
      statsRenderPending = false;
      gamePerf.statsIdlePending = false;
      renderStatsExtended(reason);
    }, rakGameIsLadaMode() ? 180 : 70);
  }

  function fmtMs(ms) {
    const n = Number(ms);
    if (!Number.isFinite(n) || n <= 0) return '—';
    return `${Math.round(n)} ms`;
  }

  function fmtReactionSeconds(ms) {
    const n = Number(ms);
    if (!Number.isFinite(n) || n <= 0) return '—';
    const seconds = n / 1000;
    const decimals = seconds < 10 ? 2 : 1;
    return seconds.toFixed(decimals).replace('.', ',') + ' s';
  }

  function fmtSeconds(ms) {
    const n = Number(ms);
    if (!Number.isFinite(n) || n <= 0) return '—';
    const seconds = Math.max(1, Math.round(n / 1000));
    return `${seconds} s`;
  }

  function fmtTime(ms) { return fmtSeconds(ms); }
  function fmtGameValue(gameId, ms) { return key(gameId) === 'reaction' ? fmtReactionSeconds(ms) : fmtSeconds(ms); }
  function gamesIsMemoryLike(id) { const gid = key(id); return gid === 'memory' || /^memory_\d+x\d+$/.test(gid) || gid === 'daily_memory'; }
  function gamesSanitizeLowBestTime(gameId, ms) {
    const n = Number(ms) || 0;
    if (!Number.isFinite(n) || n <= 0) return 0;
    // v.1.5 (988): sentinel 86 400 s z vadně dekódovaných low-score bodů není platný rekord.
    // Chrání to hlavně Pexeso a Reaction Test, aby se v Top score neukazovalo 86400s.
    if (isLowBetter(gameId) && n >= 86400000) return 0;
    if ((key(gameId) === 'reaction' || key(gameId) === 'daily_reaction') && n > 60000) return 0;
    return n;
  }
  function formatDate(ms) {
    const n = typeof gamesParseStatTimestamp === 'function' ? gamesParseStatTimestamp(ms) : (typeof ms === 'number' ? Number(ms) : Date.parse(String(ms || '')));
    if (!Number.isFinite(n) || n <= 0) return '';
    try {
      return new Intl.DateTimeFormat('cs-CZ', { timeZone: 'Europe/Prague', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(n));
    } catch (err) {
      const d = new Date(n);
      return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getFullYear())} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
  }

  function allGameIds() { return ALL_GAMES.slice(); }
  function isLowBetter(id) { return META[key(id)] && META[key(id)].mode === 'low'; }
  function gameMeta(id) { return META[key(id)] || { title: String(id), subtitle: '', unit: 'bodů', mode: 'high', icon: '' }; }
  function encodePoints(id, value) { const v = Number(value) || 0; return isLowBetter(id) ? (POINT_SCALE - Math.max(0, Math.round(v))) : Math.max(0, Math.round(v)); }
  function decodePoints(id, value) {
    const v = Number(value) || 0;
    if (isLowBetter(id)) {
      const rounded = Math.max(0, Math.round(v));
      if (rounded <= 0 || rounded >= POINT_SCALE) return 0;
      return Math.max(0, POINT_SCALE - rounded);
    }
    return Math.max(0, Math.round(v));
  }

  function arcadeDefaults(id) {
    const mid = key(id);
    return {
      plays: 0,
      bestScore: 0,
      bestTimeMs: 0,
      bestAccuracy: 0,
      bestCombo: 0,
      bestMoves: 0,
      lastPlayedAt: 0,
      lastResult: '',
      leaderboardValue: 0,
      mode: isLowBetter(mid) ? 'low' : 'high'
    };
  }

  function ensureArcadeProfile(profile) {
    if (!profile || !profile.accounts || typeof profile.accounts !== 'object') return profile;
    Object.values(profile.accounts).forEach((acc) => {
      if (!acc || !acc.stats || typeof acc.stats !== 'object') return;
      if (!acc.stats[ARC_KEY] || typeof acc.stats[ARC_KEY] !== 'object') acc.stats[ARC_KEY] = {};
      leaderboardGameIds().forEach((id) => {
        const cur = acc.stats[ARC_KEY][id] || {};
        acc.stats[ARC_KEY][id] = Object.assign(arcadeDefaults(id), cur);
      });
    });
    return profile;
  }

  function mergeArcadeFromRaw(profile) {
    try {
      const raw = localStorage.getItem(typeof GAMES_PROFILE_KEY !== 'undefined' ? GAMES_PROFILE_KEY : '');
      if (!raw) return profile;
      const parsed = JSON.parse(raw);
      const src = parsed && parsed.accounts && typeof parsed.accounts === 'object' ? parsed.accounts : {};
      Object.entries(src).forEach(([accountId, incoming]) => {
        const id = key(accountId);
        if (!id || !profile.accounts || !profile.accounts[id]) return;
        const rawArcade = incoming && incoming.stats && incoming.stats[ARC_KEY] && typeof incoming.stats[ARC_KEY] === 'object' ? incoming.stats[ARC_KEY] : null;
        if (!rawArcade) return;
        profile.accounts[id].stats[ARC_KEY] = profile.accounts[id].stats[ARC_KEY] || {};
        leaderboardGameIds().forEach((gid) => {
          if (rawArcade[gid]) {
            profile.accounts[id].stats[ARC_KEY][gid] = Object.assign(arcadeDefaults(gid), profile.accounts[id].stats[ARC_KEY][gid] || {}, rawArcade[gid]);
          }
        });
      });
    } catch (err) {}
    return profile;
  }

  const originalLoadProfile = window.gamesLoadProfile;
  window.gamesLoadProfile = function gamesLoadProfileArcade() {
    const profile = originalLoadProfile ? originalLoadProfile() : { activeAccountId: '', accounts: {} };
    ensureArcadeProfile(profile);
    mergeArcadeFromRaw(profile);
    return profile;
  };

  const originalGetProfile = window.gamesGetProfile;
  window.gamesGetProfile = function gamesGetProfileArcade() {
    const profile = originalGetProfile ? originalGetProfile() : window.app.gamesProfile;
    ensureArcadeProfile(profile);
    mergeArcadeFromRaw(profile);
    return profile;
  };

  const originalSyncProfileFromRemote = window.gamesSyncProfileFromRemote;
  let gamesProfileSyncInFlight = null;
  let gamesProfileSyncLastAt = 0;
  window.gamesSyncProfileFromRemote = function gamesSyncProfileFromRemoteArcade(force = false) {
    if (typeof originalSyncProfileFromRemote !== 'function') return Promise.resolve(null);
    if (typeof navigator !== 'undefined' && !navigator.onLine && !force) {
      gamePerf.profileSyncOfflineSkips = Number(gamePerf.profileSyncOfflineSkips || 0) + 1;
      return Promise.resolve(null);
    }
    if (!force && !isGamesHubActive() && !(window.app && window.app.activeGameShell)) {
      gamePerf.profileSyncHiddenSkips = Number(gamePerf.profileSyncHiddenSkips || 0) + 1;
      return Promise.resolve((window.app && window.app.gamesProfile) || null);
    }
    const now = Date.now();
    const ttl = rakGameIsLadaMode() ? 120000 : 45000;
    if (!force && gamesProfileSyncInFlight) {
      gamePerf.profileSyncInFlightSkips = Number(gamePerf.profileSyncInFlightSkips || 0) + 1;
      return gamesProfileSyncInFlight;
    }
    if (!force && gamesProfileSyncLastAt && (now - gamesProfileSyncLastAt) < ttl) {
      gamePerf.profileSyncSkips = Number(gamePerf.profileSyncSkips || 0) + 1;
      return Promise.resolve((window.app && window.app.gamesProfile) || null);
    }
    gamesProfileSyncLastAt = now;
    gamePerf.profileSyncRuns = Number(gamePerf.profileSyncRuns || 0) + 1;
    gamesProfileSyncInFlight = Promise.resolve(originalSyncProfileFromRemote.call(this, force)).catch((err) => {
      console.warn('games profile sync guard failed', err);
      return null;
    }).finally(() => {
      gamesProfileSyncInFlight = null;
    });
    return gamesProfileSyncInFlight;
  };

  function getAccountStat(account, gameId) {
    const acc = account || null;
    const id = key(gameId);
    if (!acc || !acc.stats) return arcadeDefaults(id);
    if (id === 'ttt') return Object.assign({ plays: 0, wins: 0, losses: 0, draws: 0, bestMoves: null, bestTimeMs: null, lastPlayedAt: 0 }, acc.stats.ttt || {});
    if (id === '2048') return Object.assign({ plays: 0, bestScore: 0, bestTile: 0, lastPlayedAt: 0 }, acc.stats.g2048 || {});
    if (id === 'snake') return Object.assign({ plays: 0, bestScore: 0, bestLength: 0, lastPlayedAt: 0 }, acc.stats.snake || {});
    if (id === 'flap') return Object.assign({ plays: 0, bestScore: 0, bestPipes: 0, lastPlayedAt: 0 }, acc.stats.flap || {});
    acc.stats[ARC_KEY] = acc.stats[ARC_KEY] || {};
    return Object.assign(arcadeDefaults(id), acc.stats[ARC_KEY][id] || {});
  }

  function setAccountStat(account, gameId, patch) {
    const acc = account || null;
    const id = key(gameId);
    const next = Object.assign({}, patch || {});
    if (!acc || !acc.stats) return;
    if (id === 'ttt') acc.stats.ttt = Object.assign({}, acc.stats.ttt || {}, next);
    else if (id === '2048') acc.stats.g2048 = Object.assign({}, acc.stats.g2048 || {}, next);
    else if (id === 'snake') acc.stats.snake = Object.assign({}, acc.stats.snake || {}, next);
    else if (id === 'flap') acc.stats.flap = Object.assign({}, acc.stats.flap || {}, next);
    else {
      acc.stats[ARC_KEY] = acc.stats[ARC_KEY] || {};
      acc.stats[ARC_KEY][id] = Object.assign(arcadeDefaults(id), acc.stats[ARC_KEY][id] || {}, next);
    }
  }

  function statValueFromAccount(account, gameId) {
    const st = getAccountStat(account, gameId);
    const id = key(gameId);
    if (id === 'ttt') return Number(st.plays || 0) || 0;
    if (id === '2048') return Number(st.bestScore || 0) || 0;
    if (id === 'snake') return Number(st.bestScore || 0) || 0;
    if (id === 'flap') return Number(st.bestScore || 0) || 0;
    if (isLowBetter(id)) return Number(st.bestTimeMs || st.leaderboardValue || 0) || 0;
    return Number(st.bestScore || st.leaderboardValue || 0) || 0;
  }

  function statLabelFromAccount(account, gameId) {
    const st = getAccountStat(account, gameId);
    const id = key(gameId);
    if (id === 'ttt') return `${Number(st.plays || 0) || 0}×`;
    if (isLowBetter(id)) return fmtGameValue(id, gamesSanitizeLowBestTime(id, st.bestTimeMs || st.leaderboardValue || 0));
    return `${Number(st.bestScore || 0) || 0}`;
  }

  function renderLaunchTiles() {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;
    const launchSig = CORE_GAMES.join('|') + '::' + EXTRA_GAMES.join('|') + '::v777';
    if (grid.dataset && grid.dataset.arcadeLaunchSig === launchSig && grid.querySelector('[data-game="ttt"]')) {
      gamePerf.launchRenderSkips = Number(gamePerf.launchRenderSkips || 0) + 1;
      return;
    }
    const tile = (id) => {
      const meta = gameMeta(id);
      return `
        <div class="tile calcTile calcTileStack gamesLaunchTile" data-action="open-game" data-game="${id}">
          <div class="calcTileIcon" aria-hidden="true">${meta.icon}</div>
          <div class="gamesLaunchText">
            <div class="calcTileText">${escapeHtml(meta.title)}</div>
            <div class="smallText">${escapeHtml(meta.subtitle)}</div>
          </div>
        </div>`;
    };
    const coreHtml = CORE_GAMES.map(tile).join('');
    const extraHtml = EXTRA_GAMES.map(tile).join('');
    const devFolderHtml = EXTRA_GAMES.length ? `<details class="gamesDevFolder">
        <summary class="gamesFolderSummary">
          <span class="gamesFolderSummaryIcon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4.5 8.2A2.2 2.2 0 0 1 6.7 6h3.2l1.3 1.5h6.1A2.2 2.2 0 0 1 19.5 9.7v6.1A2.2 2.2 0 0 1 17.3 18H6.7A2.2 2.2 0 0 1 4.5 15.8V8.2Z"></path>
              <path d="M7 11.2h10"></path>
            </svg>
          </span>
          <span class="gamesFolderSummaryText">Ve vývoji</span>
        </summary>
        <div class="gamesDevFolderBody">${extraHtml}</div>
      </details>` : '';
    grid.innerHTML = coreHtml + devFolderHtml;
    if (grid.dataset) grid.dataset.arcadeLaunchSig = launchSig;
  }

  function summaryLine(account, gameId) {
    const st = getAccountStat(account, gameId);
    const id = key(gameId);
    const meta = gameMeta(id);
    let value = '—';
    if (id === 'ttt') value = String(gamesProfileSafeInt(st.plays, 999999999)) + '×';
    else if (isLowBetter(id)) { const safeTime = gamesSanitizeLowBestTime(id, st.bestTimeMs || st.leaderboardValue || 0); value = safeTime ? fmtGameValue(id, gamesProfileSafeInt(safeTime, 86400000)) : '—'; }
    else value = String(gamesProfileSafeInt(st.bestScore || st.leaderboardValue, 999999999));
    return `<div class="gamesStatsCardLine"><strong>${escapeHtml(gamesProfileSafeText(meta.title, id, GAMES_PROFILE_DOM_HARDENING.maxLabelLength))}</strong> · ${escapeHtml(gamesProfileValueText(value, '—', 48))}</div>`;
  }

  function renderStatsExtended(reason) {
    const grid = document.getElementById('gamesStatsGrid');
    if (!grid) return;
    const profile = gamesGetProfile();
    const activeId = profile.activeAccountId;
    const accounts = Object.values(profile.accounts || {}).filter(acc => !GAMES_ACCOUNT_BLOCKLIST.has(String(acc && acc.id || '').trim())).sort((a, b) => {
      const aActive = String(a && a.id || '') === String(activeId || '');
      const bActive = String(b && b.id || '') === String(activeId || '');
      if (aActive !== bActive) return aActive ? -1 : 1;
      return Number(a && a.id || 0) - Number(b && b.id || 0);
    });
    if (!accounts.length) {
      gamePerf.statsRenderRuns = Number(gamePerf.statsRenderRuns || 0) + 1;
      grid.innerHTML = '<div class="smallText">Zatím nejsou žádné herní statistiky.</div>';
      return;
    }
    const nextHtml = accounts.map((acc) => {
      const totalPlays = gamesProfileSafeInt(ALL_GAMES.reduce((sum, gid) => sum + Number(getAccountStat(acc, gid).plays || 0), 0), 999999999);
      const lines = ALL_GAMES.map((gid) => summaryLine(acc, gid)).join('');
      const isActive = String(acc.id) === String(activeId);
      const safeName = gamesProfileSafeName(acc.name, acc.id ? ('Hráč ' + String(acc.id)) : 'Hráč');
      return `<details class="gamesStatsCard${isActive ? ' isActive' : ''}"${isActive ? ' open' : ''}><summary class="gamesStatsCardSummary"><div class="gamesStatsCardHead"><div><div class="gamesStatsCardName">${escapeHtml(safeName)}</div></div><div class="gamesStatsCardTotal">${String(totalPlays)} her</div></div></summary><div class="gamesStatsCardBody">${lines}</div></details>`;
    }).join('');
    if (grid.__rakLastStatsHtml === nextHtml && grid.childElementCount) {
      gamePerf.statsRenderSkips = Number(gamePerf.statsRenderSkips || 0) + 1;
      return;
    }
    grid.__rakLastStatsHtml = nextHtml;
    gamePerf.statsRenderRuns = Number(gamePerf.statsRenderRuns || 0) + 1;
    grid.innerHTML = nextHtml;
  }

  const originalRenderStats = window.gamesRenderStats;
  window.gamesRenderStats = function gamesRenderStatsArcade() {
    scheduleStatsExtended('public-render-stats');
    if (typeof originalRenderStats === 'function') {
      // preserve side effects only if needed elsewhere; we already replaced the visible block.
    }
  };

  function gameLeaderboardMetric(gameId, stat) {
    const id = key(gameId);
    if (id === 'ttt') return Number(stat.plays || 0) || 0;
    if (id === '2048') return Number(stat.bestScore || 0) || 0;
    if (id === 'snake') return Number(stat.bestScore || 0) || 0;
    if (id === 'flap') return Number(stat.bestScore || 0) || 0;
    if (isLowBetter(id)) return gamesSanitizeLowBestTime(id, stat.bestTimeMs || stat.leaderboardValue || 0);
    return Number(stat.bestScore || 0) || 0;
  }

  function gameLeaderboardSort(gameId, rows) {
    const id = key(gameId);
    return rows.sort((a, b) => {
      if (isLowBetter(id)) return a.value - b.value || String(a.name).localeCompare(String(b.name), 'cs');
      return b.value - a.value || String(a.name).localeCompare(String(b.name), 'cs');
    });
  }

  const originalGetLeaderboard = window.gamesGetGameLeaderboard;
  window.gamesGetGameLeaderboard = function gamesGetGameLeaderboardArcade(gameId, limit = 10) {
    const id = key(gameId);
    const todayKey = String(dailySeed());
    const cache = (window.app && window.app.gamesLeaderboardCache) ? window.app.gamesLeaderboardCache : (window.app.gamesLeaderboardCache = {});
    if (!gamesIsDailyStatId(id) && Array.isArray(cache[id]) && cache[id].length) return cache[id].slice(0, limit);
    const profile = gamesGetProfile();
    const rows = Object.values(profile.accounts || {}).map((acc) => {
      const stat = getAccountStat(acc, id);
      if (gamesIsDailyStatId(id) && String(stat.dailyDateKey || '') !== todayKey) return null;
      const value = gameLeaderboardMetric(id, stat);
      return gamesNormalizeLeaderboardRow(id, {
        id: acc.id,
        name: acc.name || ('Hráč ' + String(acc.id || '')),
        value,
        playedText: formatDate(Number(stat.lastPlayedAt || acc.updatedAt || 0) || 0)
      });
    }).filter((row) => row && row.value > 0);
    return gameLeaderboardSort(id, rows).slice(0, Math.max(1, Math.min(50, Number(limit) || 10)));
  };

  window.gamesTop3Block = function gamesTop3BlockArcade(gameId, label, limit = 10, titleOverride) {
    const id = key(gameId);
    const safeLimit = Math.max(1, Math.min(GAMES_TOP_SCORE_DOM_HARDENING.maxRows, Number(limit) || 10));
    const rows = window.gamesGetGameLeaderboard(id, safeLimit).map((row) => gamesNormalizeLeaderboardRow(id, row)).filter((row) => row.value > 0);
    const unit = gamesSafeScoreUnit(label || gameMeta(id).unit || '', gameMeta(id).unit || '');
    const body = rows.length ? rows.map((row, idx) => gamesLeaderboardRowHtml(id, row, idx, unit)).join('') : '<div class="gamesTop3Empty">Zatím žádné výsledky.</div>';
    const title = gamesSafePlainText(titleOverride || ('Top ' + String(safeLimit) + ' výsledků'), 'Top výsledků', 48);
    return '<div class="gamesTop3Card gamesTop5ScrollCard" data-score-game="' + escapeHtml(id) + '"><div class="gamesTop3Title">' + escapeHtml(title) + '</div><div class="gamesTop3Body gamesTop5ScrollBody">' + body + '</div></div>';
  };

  const leaderboardInFlight = new Map();
  async function refreshRemoteLeaderboards(gameId) {
    if (!window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.loadGameStats !== 'function') return [];
    if (document.visibilityState === 'hidden') {
      gamePerf.leaderboardHiddenSkips = Number(gamePerf.leaderboardHiddenSkips || 0) + 1;
      return [];
    }
    const ids = Array.isArray(gameId) ? gameId.map(key).filter(Boolean) : (gameId ? [key(gameId)] : leaderboardGameIds());
    const requestKey = ids.join('|') || 'all';
    if (leaderboardInFlight.has(requestKey)) {
      gamePerf.leaderboardInFlightSkips = Number(gamePerf.leaderboardInFlightSkips || 0) + 1;
      return leaderboardInFlight.get(requestKey);
    }
    window.app.gamesLeaderboardCache = window.app.gamesLeaderboardCache || {};
    window.app.gamesLeaderboardThrottle = window.app.gamesLeaderboardThrottle || {};
    const now = Date.now();
    const ttl = rakGameLeaderboardTtl();
    const freshIds = ids.filter((gid) => {
      const last = Number(window.app.gamesLeaderboardThrottle[gid] || 0) || 0;
      const hasCache = Array.isArray(window.app.gamesLeaderboardCache[gid]) && window.app.gamesLeaderboardCache[gid].length;
      return !hasCache || (now - last) > ttl;
    });
    if (!freshIds.length) {
      gamePerf.leaderboardCacheHits = Number(gamePerf.leaderboardCacheHits || 0) + ids.length;
      return ids.map((gid) => ({ id: gid, rows: (window.app.gamesLeaderboardCache[gid] || []).slice(0, 10), cached: true }));
    }
    gamePerf.leaderboardRefreshRuns = Number(gamePerf.leaderboardRefreshRuns || 0) + 1;
    gamePerf.leaderboardFreshLoads = Number(gamePerf.leaderboardFreshLoads || 0) + freshIds.length;
    const refreshPromise = (async () => {
      try {
        const results = await Promise.all(freshIds.map(async (gid) => {
        try {
          const rows = await window.RotationSupabaseBridge.loadGameStats(gid, 10);
          const normalized = (Array.isArray(rows) ? rows : [])
            .filter((row) => typeof window.gamesIsRemoteStatAfterReset === 'function' ? window.gamesIsRemoteStatAfterReset(row) : true)
            .filter((row) => typeof window.gamesIsMemoryRemoteStatAfterReset === 'function' ? window.gamesIsMemoryRemoteStatAfterReset(Object.assign({}, row || {}, { game_type: gid })) : true)
            .map((row) => {
            const accountNumber = String(row && (row.account_number ?? row.accountNumber ?? row.id) ? (row.account_number ?? row.accountNumber ?? row.id) : '').trim();
            const name = String(row && (row.player_name ?? row.full_name ?? row.name) ? (row.player_name ?? row.full_name ?? row.name) : accountNumber || '').trim() || accountNumber || 'Hráč';
            const points = Number(row && (row.points ?? row.best_score ?? row.bestScore ?? row.value) ? (row.points ?? row.best_score ?? row.bestScore ?? row.value) : 0) || 0;
            const value = decodePoints(gid, points);
            const updatedAt = String(row && (row.last_played_at ?? row.lastPlayedAt ?? row.updated_at ?? row.created_at) ? (row.last_played_at ?? row.lastPlayedAt ?? row.updated_at ?? row.created_at) : '').trim();
            return Object.assign(gamesNormalizeLeaderboardRow(gid, { id: accountNumber || name, name, value, playedText: formatDate(Date.parse(updatedAt) || 0), last_played_at: updatedAt, updated_at: updatedAt, gameId: gid }), { games_played: Number(row && (row.games_played ?? row.plays) || 0) || 0, wins: Number(row && row.wins || 0) || 0, losses: Number(row && row.losses || 0) || 0, draws: Number(row && row.draws || 0) || 0, updated_at: updatedAt });
          }).filter((row) => row.value > 0);
          window.app.gamesLeaderboardCache[gid] = gameLeaderboardSort(gid, normalized).slice(0, 10);
          window.app.gamesLeaderboardThrottle[gid] = Date.now();
          return { id: gid, rows: window.app.gamesLeaderboardCache[gid] };
        } catch (err) {
          console.warn('arcade leaderboard refresh failed', gid, err);
          return { id: gid, rows: window.app.gamesLeaderboardCache[gid] || [] };
        }
      }));
      // Fáze 5: během rozehrané hry už leaderboard refresh nespouští render celé hry.
      // Dřív se tím hra při online obnově zbytečně překreslila/restartovala.
      if (!window.app.activeGameShell) scheduleStatsExtended('leaderboard-refresh');
        return results;
      } catch (err) {
        console.warn('refreshRemoteLeaderboards failed', err);
        return [];
      }
    })();
    leaderboardInFlight.set(requestKey, refreshPromise);
    try {
      return await refreshPromise;
    } finally {
      leaderboardInFlight.delete(requestKey);
    }
  }
  window.gamesRefreshRemoteLeaderboards = refreshRemoteLeaderboards;

  const originalSyncStatOnline = window.gamesSyncStatOnline;
  window.gamesSyncStatOnline = async function gamesSyncStatOnlineArcade(gameId, patch) {
    const id = key(gameId);
    if (!window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.saveGameStat !== 'function') return null;
    const encodedPatch = Object.assign({}, patch || {});
    if (id && id !== 'ttt' && id !== '2048' && id !== 'snake' && id !== 'flap') {
      if (typeof encodedPatch.bestTimeMs === 'number' && encodedPatch.bestTimeMs > 0) encodedPatch.points = encodePoints(id, encodedPatch.bestTimeMs);
      else if (typeof encodedPatch.bestScore === 'number') encodedPatch.points = encodePoints(id, encodedPatch.bestScore);
      else if (typeof encodedPatch.points === 'number') encodedPatch.points = encodePoints(id, decodePoints(id, encodedPatch.points));
    }
    if (typeof originalSyncStatOnline === 'function') {
      return originalSyncStatOnline(id, encodedPatch);
    }
    return null;
  };

  // v.1.5 (920): Denní challenge ukládá vlastní leaderboard i tehdy,
  // když se odehraje konkrétní hra jako Reaction/Aim/Brick apod.
  function gamesGetDailyChallengeSession() {
    const session = window.app && window.app.dailyChallengeSession;
    if (!session || session.active !== true) return null;
    if (key(window.app && window.app.activeGameShell) !== 'daily') return null;
    const todayKey = String(dailySeed());
    if (String(session.dateKey || '') !== todayKey) return null;
    const mode = key(session.mode);
    if (!mode || DAILY_MODES.indexOf(mode) < 0) return null;
    return Object.assign({}, session, { mode, dateKey: todayKey });
  }

  function gamesDailyChallengeScoreValue(sourceId, sourcePatch, sourceMerged) {
    const id = key(sourceId);
    const patch = sourcePatch || {};
    const merged = sourceMerged || {};
    const directPoints = Number(patch.points || merged.points || 0) || 0;
    if (directPoints > 0) return directPoints;
    if (isLowBetter(id)) {
      const time = Number(patch.bestTimeMs || patch.timeMs || patch.elapsedMs || merged.bestTimeMs || 0) || 0;
      return time > 0 ? encodePoints(id, time) : 0;
    }
    const score = Number(patch.bestScore || patch.score || merged.bestScore || merged.leaderboardValue || 0) || 0;
    return score > 0 ? encodePoints(id, score) : 0;
  }

  function gamesIsDailyStatId(gameId) {
    const id = key(gameId);
    return id === 'daily' || id.indexOf('daily_') === 0;
  }

  function gamesDailyCurrentStat(active, gameId, dateKey) {
    const id = key(gameId);
    const todayKey = String(dateKey || dailySeed());
    const current = getAccountStat(active, id);
    if (String(current.dailyDateKey || '') === todayKey) return current;
    return Object.assign(arcadeDefaults(id), { dailyDateKey: todayKey, dailyOnly: true });
  }

  function gamesRecordDailyChallengeStat(active, sourceId, sourcePatch, sourceMerged, isCompleted) {
    const session = gamesGetDailyChallengeSession();
    if (!session || !isCompleted) return false;
    const id = key(sourceId);
    if (!id || id === 'daily' || id !== session.mode) return false;
    const scoreValue = Math.max(0, Math.round(gamesDailyChallengeScoreValue(id, sourcePatch, sourceMerged)));
    if (!scoreValue) return false;
    const current = gamesDailyCurrentStat(active, 'daily', session.dateKey);
    const playedAt = Number((sourcePatch && sourcePatch.lastPlayedAt) || (sourceMerged && sourceMerged.lastPlayedAt) || Date.now()) || Date.now();
    const resultText = dailyLabel(id) + ' · ' + String(sourcePatch && sourcePatch.lastResult ? sourcePatch.lastResult : (sourceMerged && sourceMerged.lastResult ? sourceMerged.lastResult : scoreValue + ' bodů'));
    const mergedDaily = Object.assign({}, current, {
      completed: true,
      plays: (Number(current.plays || 0) || 0) + 1,
      bestScore: Math.max(Number(current.bestScore || 0) || 0, scoreValue),
      leaderboardValue: Math.max(Number(current.leaderboardValue || 0) || 0, scoreValue),
      points: Math.max(Number(current.points || 0) || 0, scoreValue),
      lastPlayedAt: playedAt,
      lastResult: resultText,
      dailyMode: id,
      dailyDateKey: session.dateKey,
      dailyOnly: true
    });
    setAccountStat(active, 'daily', mergedDaily);

    const dailyStatId = dailyLeaderboardGameId(id);
    const currentModeDaily = gamesDailyCurrentStat(active, dailyStatId, session.dateKey);
    const sourceValue = Math.max(0, Math.round(dailySourceValueForStatId(dailyStatId, id, sourcePatch, sourceMerged)));
    const mergedModeDaily = Object.assign({}, currentModeDaily, {
      completed: true,
      plays: (Number(currentModeDaily.plays || 0) || 0) + 1,
      lastPlayedAt: playedAt,
      lastResult: resultText,
      dailyMode: id,
      dailyDateKey: session.dateKey,
      dailyOnly: true
    });
    if (isLowBetter(dailyStatId)) {
      const previous = Number(currentModeDaily.bestTimeMs || 0) || 0;
      const nextTime = sourceValue > 0 ? (previous > 0 ? Math.min(previous, sourceValue) : sourceValue) : previous;
      mergedModeDaily.bestTimeMs = nextTime;
      mergedModeDaily.leaderboardValue = nextTime;
      mergedModeDaily.points = encodePoints(dailyStatId, nextTime || 0);
    } else {
      const previous = Number(currentModeDaily.bestScore || currentModeDaily.leaderboardValue || 0) || 0;
      const nextScore = Math.max(previous, sourceValue || decodePoints(id, scoreValue));
      mergedModeDaily.bestScore = nextScore;
      mergedModeDaily.leaderboardValue = nextScore;
      mergedModeDaily.points = encodePoints(dailyStatId, nextScore || 0);
    }
    setAccountStat(active, dailyStatId, mergedModeDaily);
    if (window.app && window.app.gamesLeaderboardCache) {
      delete window.app.gamesLeaderboardCache.daily;
      delete window.app.gamesLeaderboardCache[dailyStatId];
    }
    // Daily Challenge ve v983 zůstává oddělený lokálně podle aktuálního dne.
    // Bez DB filtru podle dne ho neposíláme do běžného online leaderboardu, aby se nemíchaly staré denní výsledky.
    if (!window.app || !window.app.activeGameShell) scheduleStatsExtended('daily-record-stat');
    return true;
  }

  const originalRecordStat = window.gamesRecordStat;
  window.gamesRecordStat = function gamesRecordStatArcade(gameId, patch) {
    const id = key(gameId);
    const profile = gamesGetProfile();
    const active = profile.accounts[profile.activeAccountId];
    if (!active) return;
    let nextPatch = Object.assign({ lastPlayedAt: Date.now() }, patch || {});
    const isCompleted = nextPatch.completed === true || nextPatch.finished === true || nextPatch.isComplete === true || nextPatch.gameOver === true || nextPatch.winner === true || nextPatch.resultSaved === true;
    if (!isCompleted && (Number(nextPatch.plays || nextPatch.games_played || 0) || 0) > 0) return;
    if (isCompleted) nextPatch = gamesAttachCompletionContext(active, id, nextPatch);
    active.updatedAt = nextPatch.lastPlayedAt;
    const dailySession = gamesGetDailyChallengeSession();
    if (dailySession && id === dailySession.mode) {
      gamesRecordDailyChallengeStat(active, id, nextPatch, nextPatch, isCompleted);
      gamesSaveProfile(profile);
      if (!window.app || !window.app.activeGameShell) scheduleStatsExtended('daily-record-stat');
      return;
    }
    if (id === 'ttt' || id === '2048' || id === 'snake' || id === 'flap') {
      if (typeof originalRecordStat === 'function') return originalRecordStat(id, nextPatch);
      return;
    }
    const current = getAccountStat(active, id);
    const merged = Object.assign({}, current, nextPatch);
    const currentPlays = Number(current.plays || 0) || 0;
    const patchPlays = Number(nextPatch.plays || nextPatch.games_played || 0) || 0;
    merged.plays = isCompleted ? currentPlays + Math.max(1, patchPlays || 1) : currentPlays;
    if (isLowBetter(id)) {
      const bestTime = gamesSanitizeLowBestTime(id, nextPatch.bestTimeMs || nextPatch.timeMs || nextPatch.elapsedMs || 0);
      const currentBestTime = gamesSanitizeLowBestTime(id, current.bestTimeMs || current.leaderboardValue || 0);
      merged.bestTimeMs = bestTime > 0 ? (currentBestTime > 0 ? Math.min(currentBestTime, bestTime) : bestTime) : currentBestTime;
      merged.leaderboardValue = merged.bestTimeMs || 0;
      merged.points = encodePoints(id, merged.bestTimeMs || bestTime || 0);
    } else {
      merged.bestScore = Math.max(Number(current.bestScore || 0) || 0, Number(nextPatch.bestScore || nextPatch.score || nextPatch.points || 0) || 0);
      merged.leaderboardValue = merged.bestScore || 0;
      merged.points = encodePoints(id, merged.bestScore || nextPatch.points || 0);
    }
    if (typeof nextPatch.bestAccuracy === 'number') merged.bestAccuracy = Math.max(Number(current.bestAccuracy || 0) || 0, nextPatch.bestAccuracy || 0);
    if (typeof nextPatch.bestCombo === 'number') merged.bestCombo = Math.max(Number(current.bestCombo || 0) || 0, nextPatch.bestCombo || 0);
    if (typeof nextPatch.bestHits === 'number') merged.bestHits = Math.max(Number(current.bestHits || 0) || 0, nextPatch.bestHits || 0);
    if (typeof nextPatch.wins === 'number') merged.wins = (Number(current.wins || 0) || 0) + Math.max(0, nextPatch.wins || 0);
    if (typeof nextPatch.losses === 'number') merged.losses = (Number(current.losses || 0) || 0) + Math.max(0, nextPatch.losses || 0);
    if (typeof nextPatch.draws === 'number') merged.draws = (Number(current.draws || 0) || 0) + Math.max(0, nextPatch.draws || 0);
    if (typeof nextPatch.onlinePlays === 'number') merged.onlinePlays = (Number(current.onlinePlays || 0) || 0) + Math.max(0, nextPatch.onlinePlays || 0);
    if (typeof nextPatch.onlineWins === 'number') merged.onlineWins = (Number(current.onlineWins || 0) || 0) + Math.max(0, nextPatch.onlineWins || 0);
    if (typeof nextPatch.bestAvgTimeMs === 'number' && nextPatch.bestAvgTimeMs > 0) {
      const oldAvg = Number(current.bestAvgTimeMs || 0) || 0;
      merged.bestAvgTimeMs = oldAvg ? Math.min(oldAvg, nextPatch.bestAvgTimeMs) : nextPatch.bestAvgTimeMs;
    }
    if (typeof nextPatch.perfectRuns === 'number') merged.perfectRuns = (Number(current.perfectRuns || 0) || 0) + Math.max(0, nextPatch.perfectRuns || 0);
    if (typeof nextPatch.bestMoves === 'number') merged.bestMoves = Math.max(Number(current.bestMoves || 0) || 0, nextPatch.bestMoves || 0);
    ['bestLines','bestLevel','bestSurvivalSec','bestWave','bestHeight','bestJumps','bestPlatforms','bestDistance','bestPops','bestBricks','bestClears','bestShots','bestStreak','bestBlocks','bestStageClear','bestBossKills','bestPowerUps','bestWeaponLevel','bestEnemiesKilled','bestCrates'].forEach((field) => {
      if (typeof nextPatch[field] === 'number') merged[field] = Math.max(Number(current[field] || 0) || 0, nextPatch[field] || 0);
    });
    if (typeof nextPatch.perfectClears === 'number') merged.perfectClears = (Number(current.perfectClears || 0) || 0) + Math.max(0, nextPatch.perfectClears || 0);
    merged.lastResult = String(nextPatch.lastResult || merged.lastResult || '').trim();
    setAccountStat(active, id, merged);
    gamesRecordDailyChallengeStat(active, id, nextPatch, merged, isCompleted);
    gamesSaveProfile(profile);
    if (typeof originalSyncStatOnline === 'function') {
      void originalSyncStatOnline(id, merged);
    }
    // Fáze 5: při rozehrané hře neobnovujeme celé statistické bloky, jen uložíme výsledek.
    // Statistiky se dorenderují po návratu do hubu, takže se hra zbytečně nepřekreslí.
    if (!window.app || !window.app.activeGameShell) scheduleStatsExtended('record-stat');
    void refreshRemoteLeaderboards(id);
  };

  function ensureStage() {
    const body = document.getElementById('gamesShellBody');
    if (!body) return null;
    return body;
  }

  function shellHeader(title, subtitle) {
    // v.1.1 (687): arcade hry už nepoužívají horní tmavý titulkový/header pruh.
    return `<button type="button" class="gamesShellBack gamesShellBackFloating arcadeBackFloating" id="arcadeBackBtn" aria-label="Zpět">Zpět</button>`;
  }

  function mountArcadeShell(gameId) {
    const meta = gameMeta(gameId);
    const stage = document.getElementById('gamesStage');
    if (!stage) return null;
    clearCleanups();
    setActiveState(gameId, null);
    window.document.body.classList.add('gamesOpen');
    if (window.document.body && window.document.body.dataset) window.document.body.dataset.rakArcadeGame = key(gameId);
    window.gamesApplyCompactMode && window.gamesApplyCompactMode();
    stage.innerHTML = `<div class="gamesShell gamesShellNoTitle arcadeShellRoot">${shellHeader(meta.title, meta.subtitle)}<div class="gamesArcadeRoot" id="gamesShellBody"></div></div>`;
    const backBtn = document.getElementById('arcadeBackBtn');
    if (backBtn && !backBtn.dataset.bound) {
      backBtn.dataset.bound = '1';
      backBtn.addEventListener('click', () => {
        if (typeof window.closeGameShell === 'function') window.closeGameShell();
      });
    }
    const body = document.getElementById('gamesShellBody');
    if (body && body.dataset) body.dataset.arcadeGame = key(gameId);
    return body;
  }

  const origRenderGameShell = window.renderGameShell;
  window.renderGameShell = function renderGameShellArcade(gameId) {
    const id = key(gameId);
    if (isArcadeShellMounted(id)) {
      gamePerf.shellRenderSkips += 1;
      return;
    }
    if (!META[id] || ARCADE_RENDER_GAMES.indexOf(id) < 0 || LEGACY_RENDER_GAMES.indexOf(id) >= 0) {
      if (typeof origRenderGameShell === 'function') origRenderGameShell(id);
      const back = document.querySelector('#games .gamesShellTop');
      if (back && !back.querySelector('.gamesShellBack')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'gamesShellBack';
        btn.textContent = 'Zpět';
        btn.addEventListener('click', () => { if (typeof window.closeGameShell === 'function') window.closeGameShell(); });
        back.prepend(btn);
      }
      return;
    }
    const body = mountArcadeShell(id);
    if (!body) return;
    let retried = false;
    const runRenderer = () => {
      try {
        renderers[id](body);
      } catch (err) {
        if (!retried) {
          retried = true;
          const raf = window.requestAnimationFrame || ((fn) => setTimeout(() => fn(Date.now()), 16));
          raf(runRenderer);
          return;
        }
        console.error('arcade render failed', id, err);
        body.innerHTML = gamesArcadeErrorBannerHtml(err);
      }
    };
    runRenderer();
  };

  const origStopLoops = window.gamesStopActiveLoops;
  window.gamesStopActiveLoops = function gamesStopActiveLoopsArcade() {
    clearCleanups();
    if (typeof origStopLoops === 'function') origStopLoops();
  };

  const origRenderHub = window.renderGamesHub;
  window.renderGamesHub = function renderGamesHubArcade() {
    gamePerf.hubRenderRuns = Number(gamePerf.hubRenderRuns || 0) + 1;
    if (typeof origRenderHub === 'function') origRenderHub();
    renderLaunchTiles();
    scheduleStatsExtended('hub-render');
    if (window.app && window.app.activeGameShell) {
      if (ARCADE_RENDER_GAMES.indexOf(key(window.app.activeGameShell)) >= 0) {
        if (!isArcadeShellMounted(window.app.activeGameShell)) window.renderGameShell(window.app.activeGameShell);
        else {
          gamePerf.shellRenderSkips += 1;
          gamePerf.hubActiveShellSkips = Number(gamePerf.hubActiveShellSkips || 0) + 1;
        }
      }
    }
  };

  function getState(id, factory) {
    window.app.gamesArcade = window.app.gamesArcade || {};
    if (!window.app.gamesArcade[id]) window.app.gamesArcade[id] = factory ? factory() : {};
    return window.app.gamesArcade[id];
  }

  function setCleanup(fn) {
    clearCleanups();
    addCleanup(fn);
  }

  function createCanvas(body, height) {
    body.innerHTML = `<div class="arcadeStage"><div class="arcadeBoardWrap arcadeCanvasWrap" style="height:${height || 'clamp(260px, 46dvh, 430px)'};"><canvas class="arcadeCanvas" id="arcadeCanvas"></canvas></div></div>`;
    const wrap = body.querySelector('.arcadeCanvasWrap');
    const canvas = body.querySelector('#arcadeCanvas');
    const ctx = canvas.getContext('2d', rakGameIsLadaMode() ? { alpha: true, desynchronized: true } : undefined);
    let last = { w: 0, h: 0, dpr: 1, cw: 0, ch: 0, checkedAt: 0 };
    const resize = (force) => {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (!force && last.w && now - last.checkedAt < rakGameResizeThrottleMs()) {
        ctx.setTransform(last.dpr, 0, 0, last.dpr, 0, 0);
        return { w: last.w, h: last.h, dpr: last.dpr };
      }
      const rect = wrap.getBoundingClientRect();
      const dprMax = typeof window.getRakPerformanceDprMax === 'function' ? window.getRakPerformanceDprMax() : 2;
      const dpr = Math.max(1, Math.min(dprMax, window.devicePixelRatio || 1));
      const w = Math.max(1, rect.width || wrap.clientWidth || canvas.clientWidth || 1);
      const h = Math.max(1, rect.height || wrap.clientHeight || canvas.clientHeight || 1);
      const cw = Math.max(1, Math.floor(w * dpr));
      const ch = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;
      if (canvas.style.width !== '100%') canvas.style.width = '100%';
      if (canvas.style.height !== '100%') canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      last = { w, h, dpr, cw, ch, checkedAt: now };
      return { w, h, dpr };
    };
    resize(true);
    return { wrap, canvas, ctx, resize };
  }

  function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function arcadeThemeColors() {
    const source = document.getElementById('app') || document.body || document.documentElement;
    const cs = getComputedStyle(source);
    const root = getComputedStyle(document.documentElement);
    const accent = (cs.getPropertyValue('--accent') || root.getPropertyValue('--accent') || '#7cff7c').trim();
    const accent2 = (cs.getPropertyValue('--accent2') || root.getPropertyValue('--accent2') || '#00f5ff').trim();
    const soft = (cs.getPropertyValue('--soft') || root.getPropertyValue('--soft') || '#e7fff0').trim();
    return {
      accent,
      accent2,
      soft,
      panel: 'rgba(255,255,255,.045)',
      panelStrong: 'rgba(255,255,255,.08)',
      line: 'rgba(255,255,255,.12)',
      shadow: 'rgba(0,0,0,.32)',
      danger: '#ff6b8a',
      gold: '#ffd76a',
      cyan: '#69e8ff',
      purple: '#c18bff'
    };
  }

  function arcadeDrawStageBg(ctx, w, h, colors) {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(255,255,255,.070)');
    grad.addColorStop(.55, 'rgba(255,255,255,.030)');
    grad.addColorStop(1, 'rgba(0,0,0,.16)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    const glow = ctx.createRadialGradient(w * 0.18, h * 0.10, 0, w * 0.18, h * 0.10, Math.max(w, h) * 0.65);
    glow.addColorStop(0, colors.accent || 'rgba(255,255,255,.12)');
    glow.addColorStop(.34, 'rgba(255,255,255,.040)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = .10;
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function arcadeRecordOnce(state, gameId, patch) {
    if (!state || state.saved || !patch || !patch.completed) return;
    state.saved = true;
    gamesRecordStat(gameId, Object.assign({ completed: true, plays: 1 }, patch));
  }


  // Aim Trainer ------------------------------------------------------------
  function aimFreshState(opts = {}) {
    return { running: false, finished: false, score: 0, combo: 0, hits: 0, misses: 0, accuracy: 100, bestCombo: 0, startAt: 0, duration: opts.duration || 30000, target: null, timer: null, challenge: !!opts.challenge, saved: false };
  }

  function renderAim(body, opts = {}) {
    const state = getState('aim', () => aimFreshState(opts));
    if (opts.challenge) state.challenge = true;
    if (!state.duration) state.duration = opts.duration || 30000;
    const best = getAccountStat(gamesGetActiveAccount(), state.challenge ? 'daily' : 'aim');
    const timeLeft = state.running && state.startAt ? Math.max(0, state.duration - (Date.now() - state.startAt)) : state.duration;
    body.innerHTML = `
      <div class="arcadeStage arcadeAimStage">
        <div class="arcadeHud arcadeHudWide">
          ${gamesStatLine('Score', state.score)}
          ${gamesStatLine('Combo', state.combo)}
          ${gamesStatLine('Přesnost', `${Math.round(state.accuracy || 100)} %`)}
          ${gamesStatLine('Čas', fmtTime(timeLeft))}
        </div>
        <div class="arcadeBoardWrap arcadeAimBoard arcadePanel" id="aimBoard">
          <button type="button" class="arcadeAimTarget${state.running ? '' : ' isHidden'}" id="aimTarget" aria-label="Target"></button>
          <div class="arcadeGameOverlay" id="aimOverlay" ${state.running ? 'hidden' : ''}>
            <div class="arcadeOverlayCard">
              <strong>${state.finished ? 'Konec tréninku' : (state.challenge ? 'Denní Aim challenge' : 'Aim Trainer')}</strong>
              <span>${state.finished ? `Score ${state.score} · combo ${state.bestCombo} · přesnost ${Math.round(state.accuracy || 0)} %` : 'Klepni na plochu a trefuj cíle. Počítá se až dokončené kolo.'}</span>
              <small>Best: ${Number(best && best.bestScore || 0) || 0}</small>
            </div>
          </div>
        </div>
        <div class="arcadeControls">
          <button type="button" class="gameControlBtn" id="aimResetBtn">Nová hra</button>
        </div>
        ${gamesTop3Block(state.challenge ? dailyLeaderboardGameId('aim') : 'aim', 'bodů', 5)}
      </div>`;
    const board = body.querySelector('#aimBoard');
    const target = body.querySelector('#aimTarget');
    const overlay = body.querySelector('#aimOverlay');
    const hud = body.querySelector('.arcadeHud');
    const hudUpdate = () => {
      const left = state.running && state.startAt ? Math.max(0, state.duration - (Date.now() - state.startAt)) : (state.finished ? 0 : state.duration);
      if (hud) hud.innerHTML = `${gamesStatLine('Score', state.score)}${gamesStatLine('Combo', state.combo)}${gamesStatLine('Přesnost', `${Math.round(state.accuracy || 100)} %`)}${gamesStatLine('Čas', fmtTime(left))}`;
    };
    const updateTarget = () => {
      if (!board || !target) return;
      const r = board.getBoundingClientRect();
      const size = clamp(60 - Math.floor(state.combo / 5) * 2, 44, 64);
      const pad = Math.max(34, size * .68);
      const x = clamp((Math.random() * Math.max(1, r.width - pad * 2)) + pad, pad, Math.max(pad, r.width - pad));
      const y = clamp((Math.random() * Math.max(1, r.height - pad * 2)) + pad, pad, Math.max(pad, r.height - pad));
      state.target = { x, y, size };
      target.style.left = `${x}px`;
      target.style.top = `${y}px`;
      target.style.width = `${size}px`;
      target.style.height = `${size}px`;
    };
    const finish = () => {
      if (state.finished) return;
      state.finished = true;
      state.running = false;
      clearInterval(state.timer);
      const total = Math.max(1, state.hits + state.misses);
      state.accuracy = (state.hits / total) * 100;
      state.score = Math.max(0, Math.round(state.score + state.accuracy * 2 + state.bestCombo * 18 + state.hits * 6));
      if (target) target.classList.add('isHidden');
      if (overlay) {
        overlay.hidden = false;
        overlay.innerHTML = `<div class="arcadeOverlayCard"><strong>Konec tréninku</strong><span>Score ${state.score} · combo ${state.bestCombo} · přesnost ${Math.round(state.accuracy)} %</span><small>${state.hits}/${total} zásahů</small></div>`;
      }
      hudUpdate();
      if (!state.saved) {
        state.saved = true;
        gamesRecordStat('aim', {
          completed: true,
          plays: 1,
          bestScore: state.score,
          bestAccuracy: Math.round(state.accuracy),
          bestCombo: state.bestCombo,
          bestHits: state.hits,
          lastResult: `${state.score} bodů`
        });
      }
    };
    const tick = () => {
      if (!state.running) return;
      const left = Math.max(0, state.duration - (Date.now() - state.startAt));
      hudUpdate();
      if (left <= 0) finish();
    };
    const start = () => {
      if (state.running) return;
      Object.assign(state, aimFreshState({ duration: state.duration, challenge: state.challenge }));
      state.running = true;
      state.startAt = Date.now();
      state.saved = false;
      if (overlay) overlay.hidden = true;
      if (target) target.classList.remove('isHidden');
      clearInterval(state.timer);
      state.timer = rakGameSetInterval(tick, 100);
      updateTarget();
      hudUpdate();
      if (typeof navigator !== 'undefined' && navigator.vibrate) { try { navigator.vibrate(8); } catch (err) {} }
    };
    const hit = (ev) => {
      ev?.preventDefault?.(); ev?.stopPropagation?.();
      if (!state.running) start();
      state.hits += 1;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.score += 12 + Math.min(36, state.combo * 3);
      const total = Math.max(1, state.hits + state.misses);
      state.accuracy = (state.hits / total) * 100;
      updateTarget();
      hudUpdate();
      if (typeof navigator !== 'undefined' && navigator.vibrate) { try { navigator.vibrate(5); } catch (err) {} }
      if (state.hits >= (state.challenge ? 25 : 45)) finish();
    };
    const miss = (ev) => {
      ev?.preventDefault?.();
      if (!state.running) { start(); return; }
      if (ev.target === target) return;
      state.combo = 0;
      state.misses += 1;
      const total = Math.max(1, state.hits + state.misses);
      state.accuracy = (state.hits / total) * 100;
      hudUpdate();
    };
    target.addEventListener('pointerdown', hit);
    board.addEventListener('pointerdown', miss);
    body.querySelector('#aimResetBtn').addEventListener('click', () => {
      clearInterval(state.timer);
      Object.assign(state, aimFreshState({ duration: opts.duration || 30000, challenge: !!opts.challenge }));
      renderAim(body, opts);
    });
    const resize = () => { if (state.running) updateTarget(); };
    window.addEventListener('resize', resize, { passive: true });
    addCleanup(() => { clearInterval(state.timer); window.removeEventListener('resize', resize); });
    if (state.running) updateTarget();
    setActiveState('aim', state);
  }

  // Reaction Test ----------------------------------------------------------
  function reactionFreshState() {
    return { phase: 'ready', round: 0, roundsTotal: 5, startedAt: 0, bestTimeMs: 0, lastTimeMs: 0, times: [], waitingTimer: null, tooSoon: false, finished: false, saved: false };
  }

  function renderReaction(body) {
    const state = getState('reaction', reactionFreshState);
    const bestStat = getAccountStat(gamesGetActiveAccount(), 'reaction');
    const bestLabel = state.bestTimeMs ? fmtMs(state.bestTimeMs) : (bestStat.bestTimeMs ? fmtMs(bestStat.bestTimeMs) : '—');
    body.innerHTML = `
      <div class="arcadeStage arcadeReactionStage">
        <div class="arcadeHud arcadeHudWide">
          ${gamesStatLine('Kolo', `${state.round}/${state.roundsTotal || 5}`)}
          ${gamesStatLine('Best', bestLabel)}
          ${gamesStatLine('Poslední', state.lastTimeMs ? fmtMs(state.lastTimeMs) : '—')}
          ${gamesStatLine('Průměr', state.times.length ? fmtMs(Math.round(state.times.reduce((a, b) => a + b, 0) / state.times.length)) : '—')}
        </div>
        <button type="button" class="arcadeBoardWrap arcadeReactionBoard arcadePanel ${state.phase === 'go' ? 'isGo' : ''} ${state.tooSoon ? 'isBad' : ''}" id="reactionBoard">
          <span class="arcadeReactionPulse"></span>
          <strong id="reactionTitle">${state.phase === 'go' ? 'TEĎ!' : (state.phase === 'waiting' ? 'Čekej…' : (state.finished ? 'Hotovo' : (state.tooSoon ? 'Moc brzo' : 'Připrav se')))}</strong>
          <small id="reactionText">${state.finished ? 'Klepni na Nová hra pro další pokus.' : (state.phase === 'go' ? 'Klepni hned.' : 'Klepni pro start a pak čekej na signál.')}</small>
        </button>
        <div class="arcadeControls">
          <button type="button" class="gameControlBtn" id="reactionResetBtn">Nová hra</button>
        </div>
        ${gamesTop3Block('reaction', 's', 5)}
      </div>`;
    const board = body.querySelector('#reactionBoard');
    const title = body.querySelector('#reactionTitle');
    const textEl = body.querySelector('#reactionText');
    const hud = body.querySelector('.arcadeHud');
    const clearWaiting = () => { clearTimeout(state.waitingTimer); state.waitingTimer = null; };
    const updateHud = () => {
      const avg = state.times.length ? Math.round(state.times.reduce((a, b) => a + b, 0) / state.times.length) : 0;
      if (hud) hud.innerHTML = `${gamesStatLine('Kolo', `${state.round}/${state.roundsTotal || 5}`)}${gamesStatLine('Best', state.bestTimeMs ? fmtMs(state.bestTimeMs) : (bestStat.bestTimeMs ? fmtMs(bestStat.bestTimeMs) : '—'))}${gamesStatLine('Poslední', state.lastTimeMs ? fmtMs(state.lastTimeMs) : '—')}${gamesStatLine('Průměr', avg ? fmtMs(avg) : '—')}`;
    };
    const setPhase = (phase, bad = false) => {
      state.phase = phase;
      state.tooSoon = !!bad;
      board.classList.toggle('isGo', phase === 'go');
      board.classList.toggle('isBad', !!bad);
      if (title) title.textContent = phase === 'go' ? 'TEĎ!' : phase === 'waiting' ? 'Čekej…' : state.finished ? 'Hotovo' : bad ? 'Moc brzo' : 'Připrav se';
      if (textEl) textEl.textContent = phase === 'go' ? 'Klepni hned.' : phase === 'waiting' ? 'Nech ruce v klidu, signál přijde za chvilku.' : state.finished ? 'Klepni na Nová hra pro další pokus.' : 'Klepni pro start a pak čekej na signál.';
    };
    const finish = () => {
      if (state.finished) return;
      clearWaiting();
      state.finished = true;
      state.phase = 'done';
      const best = state.bestTimeMs || Math.min(...state.times.filter(Boolean)) || 0;
      const avg = state.times.length ? Math.round(state.times.reduce((a, b) => a + b, 0) / state.times.length) : 0;
      setPhase('done', false);
      if (title) title.textContent = 'Hotovo';
      if (textEl) textEl.textContent = `Best ${fmtMs(best)} · průměr ${fmtMs(avg)}.`;
      updateHud();
      if (!state.saved) {
        state.saved = true;
        gamesRecordStat('reaction', {
          completed: true,
          plays: 1,
          bestTimeMs: avg,
          bestSingleTimeMs: best,
          bestAvgTimeMs: avg,
          bestScore: avg ? encodePoints('reaction', avg) : 0,
          perfectRuns: state.times.every(t => t && t < 250) ? 1 : 0,
          lastResult: fmtReactionSeconds(avg) + ' průměr'
        });
      }
    };
    const nextRound = () => {
      clearWaiting();
      if (state.round >= (state.roundsTotal || 5)) { finish(); return; }
      setPhase('waiting', false);
      const delay = 850 + Math.random() * 2600;
      state.waitingTimer = setTimeout(() => {
        setPhase('go', false);
        state.startedAt = performance.now();
        if (typeof navigator !== 'undefined' && navigator.vibrate) { try { navigator.vibrate(12); } catch (err) {} }
      }, delay);
    };
    const reset = () => {
      clearWaiting();
      Object.assign(state, reactionFreshState());
      setPhase('ready', false);
      updateHud();
    };
    const onTap = (ev) => {
      ev?.preventDefault?.();
      if (state.finished) return;
      if (state.phase === 'ready') { state.round = 0; state.times = []; state.bestTimeMs = 0; state.lastTimeMs = 0; state.saved = false; nextRound(); return; }
      if (state.phase === 'waiting') {
        clearWaiting();
        state.round = 0;
        state.times = [];
        state.bestTimeMs = 0;
        state.lastTimeMs = 0;
        setPhase('ready', true);
        updateHud();
        return;
      }
      if (state.phase === 'go') {
        const time = Math.max(1, Math.round(performance.now() - state.startedAt));
        state.lastTimeMs = time;
        state.bestTimeMs = state.bestTimeMs ? Math.min(state.bestTimeMs, time) : time;
        state.times.push(time);
        state.round += 1;
        updateHud();
        if (state.round >= (state.roundsTotal || 5)) finish();
        else nextRound();
      }
    };
    board.addEventListener('pointerdown', onTap);
    body.querySelector('#reactionResetBtn').addEventListener('click', reset);
    addCleanup(() => { clearWaiting(); });
    setActiveState('reaction', state);
  }

  // Tetris -----------------------------------------------------------------
  const TETRIS_SHAPES = {
    I: [[1,1,1,1]],
    O: [[1,1],[1,1]],
    T: [[0,1,0],[1,1,1]],
    S: [[0,1,1],[1,1,0]],
    Z: [[1,1,0],[0,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]]
  };
  const TETRIS_KEYS = Object.keys(TETRIS_SHAPES);
  function rotateMatrix(m) { return m[0].map((_, i) => m.map(r => r[i]).reverse()); }
  function tetrisNewPiece() { const type = randomPick(TETRIS_KEYS); return { type, matrix: TETRIS_SHAPES[type].map(r => r.slice()), x: 3, y: 0, color: type }; }
  function tetrisFreshQueue() { return [tetrisNewPiece(), tetrisNewPiece(), tetrisNewPiece()]; }
  function tetrisState() { return { board: Array.from({ length: 20 }, () => Array(10).fill('')), piece: tetrisNewPiece(), nextQueue: tetrisFreshQueue(), score: 0, lines: 0, level: 1, over: false, dropAcc: 0, lastTs: 0, startedAt: Date.now(), best: 0, raf: 0 }; }
  function tetrisCollision(st, px = 0, py = 0, matrix = null) {
    const m = matrix || st.piece.matrix;
    for (let y = 0; y < m.length; y += 1) for (let x = 0; x < m[y].length; x += 1) if (m[y][x]) {
      const bx = st.piece.x + px + x, by = st.piece.y + py + y;
      if (bx < 0 || bx >= 10 || by >= 20) return true;
      if (by >= 0 && st.board[by][bx]) return true;
    }
    return false;
  }
  function tetrisLock(st) {
    st.piece.matrix.forEach((row, y) => row.forEach((v, x) => { if (v) { const by = st.piece.y + y; const bx = st.piece.x + x; if (by >= 0 && by < 20 && bx >= 0 && bx < 10) st.board[by][bx] = st.piece.type; } }));
    let cleared = 0;
    st.board = st.board.filter((row) => {
      const full = row.every(Boolean);
      if (full) cleared += 1;
      return !full;
    });
    while (st.board.length < 20) st.board.unshift(Array(10).fill(''));
    if (cleared) {
      st.lines += cleared;
      st.score += [0, 100, 300, 500, 800][cleared] * st.level;
      st.level = 1 + Math.floor(st.lines / 10);
    }
    if (!Array.isArray(st.nextQueue)) st.nextQueue = tetrisFreshQueue();
    st.piece = st.nextQueue.length ? st.nextQueue.shift() : tetrisNewPiece();
    st.nextQueue.push(tetrisNewPiece());
    st.piece.x = 3;
    st.piece.y = 0;
    if (tetrisCollision(st)) st.over = true;
  }
  function tetrisMove(st, dx, dy) {
    if (st.over) return false;
    if (!tetrisCollision(st, dx, dy)) { st.piece.x += dx; st.piece.y += dy; return true; }
    if (dy === 1 && dx === 0) { tetrisLock(st); return true; }
    return false;
  }
  function tetrisRotate(st) {
    if (st.over) return;
    const rotated = rotateMatrix(st.piece.matrix);
    const tests = [0, -1, 1, -2, 2];
    for (const shift of tests) {
      if (!tetrisCollision(st, shift, 0, rotated)) { st.piece.matrix = rotated; st.piece.x += shift; return; }
    }
  }
  function renderTetris(body) {
    const state = getState('tetris', tetrisState);
    state.saved = !!state.saved;
    if (!Array.isArray(state.nextQueue)) state.nextQueue = tetrisFreshQueue();
    const stage = createCanvas(body, 'clamp(450px, 72dvh, 720px)');
    if (stage.wrap) stage.wrap.classList.add('isFullGame', 'tetrisCanvasWrap', 'tetrisSideStatsCanvas');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeControls arcadeOnlyRestart arcadeControlsTop"><button type="button" class="gameControlBtn" id="tetrisRestartBtn">Nová hra</button></div>`);
    const tetrisStage = body.querySelector('.arcadeStage');
    if (tetrisStage) tetrisStage.insertAdjacentHTML('afterend', gamesTop3Block('tetris', 'bodů', 5));
    const canvas = stage.canvas; const ctx = stage.ctx;
    let touch = null;
    const finishTetris = () => {
      arcadeRecordOnce(state, 'tetris', {
        completed: true,
        plays: 1,
        bestScore: state.score,
        bestLines: state.lines,
        bestLevel: state.level,
        lastResult: `${state.score} bodů`
      });
    };
    const restart = () => {
      Object.assign(state, tetrisState());
      state.saved = false;
      draw();
    };
    const hardDrop = () => {
      if (state.over) return;
      while (!tetrisCollision(state, 0, 1)) state.piece.y += 1;
      tetrisMove(state, 0, 1);
      if (state.over) finishTetris();
    };
    const drawBlock = (x, y, size, color, alpha = 1) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = alpha > .7 ? 10 : 0;
      ctx.fillRect(x + 1.5, y + 1.5, size - 3, size - 3);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      ctx.strokeRect(x + 1.5, y + 1.5, size - 3, size - 3);
      ctx.restore();
    };
    const pieceColor = (v, colors) => ({ I: colors.cyan, O: colors.gold, T: colors.purple, S: colors.accent, Z: colors.danger, J: '#8fb2ff', L: '#ffb36f' }[v] || colors.accent);
    const drawPanel = (x, y, w, h, radius = 12) => {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,.045)';
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fill(); } else ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,.13)';
      ctx.lineWidth = 1;
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x + .5, y + .5, w - 1, h - 1, radius); ctx.stroke(); } else ctx.strokeRect(x + .5, y + .5, w - 1, h - 1);
      ctx.restore();
    };
    const drawSideStat = (x, y, w, label, value, colors) => {
      drawPanel(x, y, w, 34, 12);
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,.64)';
      ctx.font = '800 8.5px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(label.toUpperCase(), x + 7, y + 12);
      ctx.fillStyle = colors.soft;
      ctx.font = '900 14px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(String(value), x + w - 7, y + 25);
      ctx.restore();
    };
    const draw = () => {
      const { w, h } = stage.resize();
      const colors = arcadeThemeColors();
      if (!Array.isArray(state.nextQueue)) state.nextQueue = tetrisFreshQueue();
      const sidebarEnabled = w >= 300;
      const sidebarW = sidebarEnabled ? Math.min(92, Math.max(78, Math.floor(w * 0.25))) : 0;
      const gap = sidebarEnabled ? 10 : 0;
      const cell = Math.floor(Math.min((w - sidebarW - gap - 8) / 10, (h - 10) / 20));
      const bw = cell * 10; const bh = cell * 20;
      const totalW = bw + sidebarW + gap;
      const ox = Math.floor((w - totalW) / 2);
      const oy = Math.floor((h - bh) / 2);
      ctx.clearRect(0, 0, w, h);
      arcadeDrawStageBg(ctx, w, h, colors, { clean: true });
      ctx.save();
      ctx.translate(ox, oy);
      ctx.fillStyle = 'rgba(0,0,0,.10)';
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(0, 0, bw, bh, 12); ctx.fill(); } else ctx.fillRect(0, 0, bw, bh);
      ctx.strokeStyle = 'rgba(255,255,255,.26)';
      ctx.lineWidth = 2;
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(1, 1, bw - 2, bh - 2, 12); ctx.stroke(); } else ctx.strokeRect(1, 1, bw - 2, bh - 2);
      for (let y = 0; y < 20; y += 1) {
        for (let x = 0; x < 10; x += 1) {
          const v = state.board[y][x];
          if (v) drawBlock(x * cell, y * cell, cell, pieceColor(v, colors), .88);
          else {
            ctx.fillStyle = 'rgba(255,255,255,.024)';
            ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
          }
        }
      }
      const ghost = (() => { const s2 = { ...state, piece: { ...state.piece, matrix: state.piece.matrix.map(r => r.slice()) } }; while (!tetrisCollision(s2, 0, 1)) s2.piece.y += 1; return s2.piece.y; })();
      state.piece.matrix.forEach((row, y) => row.forEach((v, x) => {
        if (!v) return;
        const px = (state.piece.x + x) * cell;
        const py = (state.piece.y + y) * cell;
        const gy = (ghost + y) * cell;
        drawBlock(px, py, cell, pieceColor(state.piece.color || v, colors), .94);
        drawBlock((state.piece.x + x) * cell + cell * .18, gy + cell * .18, cell * .64, colors.accent, .22);
      }));
      ctx.restore();
      if (sidebarEnabled) {
        const sx = ox + bw + gap;
        const sy = Math.max(oy, 8);
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,.72)';
        ctx.font = '800 10px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('DALŠÍ', sx + 3, sy + 10);
        const mini = Math.max(9, Math.min(13, Math.floor(sidebarW / 5)));
        const boxH = mini * 4 + 12;
        (state.nextQueue || []).slice(0, 3).forEach((piece, i) => {
          const py0 = sy + 20 + i * (boxH + 8);
          drawPanel(sx, py0, sidebarW, boxH, 12);
          const m = piece.matrix || [];
          const px0 = sx + Math.max(5, Math.floor((sidebarW - (m[0] || []).length * mini) / 2));
          const pyy = py0 + Math.max(6, Math.floor((boxH - m.length * mini) / 2));
          m.forEach((row, y) => row.forEach((v, x) => { if (v) drawBlock(px0 + x * mini, pyy + y * mini, mini, pieceColor(piece.color || v, colors), .86); }));
        });
        const statsY = sy + 20 + 3 * (boxH + 8) + 2;
        drawSideStat(sx, statsY, sidebarW, 'Score', state.score, colors);
        drawSideStat(sx, statsY + 40, sidebarW, 'Řádky', state.lines, colors);
        drawSideStat(sx, statsY + 80, sidebarW, 'Level', state.level, colors);
        ctx.restore();
      } else {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,.38)';
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(8, 8, w - 16, 32, 14); ctx.fill(); } else ctx.fillRect(8, 8, w - 16, 32);
        ctx.fillStyle = colors.soft;
        ctx.font = '800 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`Score ${state.score} · Řádky ${state.lines} · Lvl ${state.level}`, w / 2, 29);
        ctx.restore();
      }
      ctx.save();
      ctx.translate(ox, oy);
      if (state.over) {
        ctx.fillStyle = 'rgba(0,0,0,.62)'; ctx.fillRect(0, 0, bw, bh);
        ctx.fillStyle = colors.soft; ctx.font = `${Math.max(18, Math.floor(cell * 0.9))}px system-ui`; ctx.textAlign = 'center';
        ctx.fillText('Konec hry', bw / 2, bh / 2 - 8);
        ctx.font = '12px system-ui'; ctx.fillText(`${state.score} bodů · ${state.lines} řádků`, bw / 2, bh / 2 + 16);
      }
      ctx.restore();
    };
    const applyMove = (fn) => {
      if (state.over) return;
      fn();
      if (state.over) finishTetris();
      draw();
      if (typeof navigator !== 'undefined' && navigator.vibrate) { try { navigator.vibrate(4); } catch (err) {} }
    };
    canvas.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      canvas.setPointerCapture && canvas.setPointerCapture(ev.pointerId);
      touch = { x: ev.clientX, y: ev.clientY, t: Date.now(), moved: false };
    });
    canvas.addEventListener('pointermove', (ev) => {
      if (!touch) return;
      ev.preventDefault();
      const dx = ev.clientX - touch.x;
      const dy = ev.clientY - touch.y;
      if (Math.abs(dx) < 26 && Math.abs(dy) < 26) return;
      if (Math.abs(dx) > Math.abs(dy) * 1.15) {
        applyMove(() => tetrisMove(state, dx > 0 ? 1 : -1, 0));
        touch.x = ev.clientX; touch.y = ev.clientY; touch.moved = true;
      } else if (dy > Math.abs(dx) * 1.05) {
        applyMove(() => tetrisMove(state, 0, 1));
        touch.x = ev.clientX; touch.y = ev.clientY; touch.moved = true;
      }
    });
    canvas.addEventListener('pointerup', (ev) => {
      if (!touch) return;
      ev.preventDefault();
      const dx = ev.clientX - touch.x;
      const dy = ev.clientY - touch.y;
      const age = Date.now() - touch.t;
      if (!touch.moved && Math.abs(dx) < 18 && Math.abs(dy) < 18 && age < 450) applyMove(() => tetrisRotate(state));
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.6) { hardDrop(); draw(); }
      touch = null;
    });
    const onKey = (ev) => {
      if (['INPUT','TEXTAREA','SELECT'].includes((ev.target && ev.target.tagName) || '')) return;
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); applyMove(() => tetrisMove(state, -1, 0)); }
      else if (ev.key === 'ArrowRight') { ev.preventDefault(); applyMove(() => tetrisMove(state, 1, 0)); }
      else if (ev.key === 'ArrowDown') { ev.preventDefault(); applyMove(() => tetrisMove(state, 0, 1)); }
      else if (ev.key === 'ArrowUp' || ev.key === 'z' || ev.key === 'Z') { ev.preventDefault(); applyMove(() => tetrisRotate(state)); }
      else if (ev.key === ' ' ) { ev.preventDefault(); hardDrop(); draw(); }
    };
    document.addEventListener('keydown', onKey);
    body.querySelector('#tetrisRestartBtn').addEventListener('click', restart);
    const loop = (ts) => {
      if (!rakGameShouldTick()) { state.lastTs = 0; state.raf = 0; return; }
      const dt = rakGameDelta(state, ts);
      if (!state.over) {
        state.dropAcc += dt;
        const speed = Math.max(120, 700 - (state.level - 1) * 45);
        if (state.dropAcc >= speed) { state.dropAcc = 0; tetrisMove(state, 0, 1); if (state.over) finishTetris(); }
      }
      draw();
      state.raf = rakGameRequestFrame(state, loop);
    };
    state.raf = rakGameRequestFrame(state, loop);
    addCleanup(() => { cancelAnimationFrame(state.raf); document.removeEventListener('keydown', onKey); if (state.over) finishTetris(); });
    draw();
    setActiveState('tetris', state);
  }

  // Space Shooter ----------------------------------------------------------
  function shooterState() {
    return {
      score: 0, hits: 0, over: false, lastTs: 0, raf: 0,
      shipX: 160, bullets: [], enemies: [], powerUps: [], explosions: [],
      spawnAcc: 0, powerAcc: 0, bossAcc: 0, shotCooldown: 0, survivedMs: 0,
      saved: false, autoShoot: false, weaponLevel: 1, spreadLevel: 0, rapidLevel: 0, weaponUntil: 0, spreadUntil: 0, rapidUntil: 0, shieldUntil: 0, timeSlowUntil: 0, doubleUntil: 0, bossKills: 0, powerUpsCollected: 0,
      stars: Array.from({ length: 46 }, () => ({ x: Math.random() * 320, y: Math.random() * 520, s: 0.45 + Math.random() * 1.7 })),
      startedAt: Date.now()
    };
  }
  function renderShooter(body) {
    const state = getState('shooter', shooterState);
    const stage = createCanvas(body, 'clamp(440px, 68dvh, 680px)');
    if (stage.wrap) stage.wrap.classList.add('isFullGame', 'shooterCanvasWrap', 'arcadeNoPageScroll');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeHud arcadeHudWide3 arcadeHudSingleLine">${gamesStatLine('Skóre', state.score)}${gamesStatLine('Vlna', state.bestWave || 1)}${gamesStatLine('Čas', Math.floor((state.survivedMs || 0) / 1000))}</div>`);
    if (stage.wrap) stage.wrap.insertAdjacentHTML('beforeend', `<div class="arcadeGameOverlay arcadeEndOverlay" id="shooterEndOverlay" hidden><div class="arcadeOverlayCard"><strong>Konec mise</strong><span data-shooter-end-text>Score 0</span><button type="button" class="gameControlBtn" id="shooterRestartBtn">Nová hra</button></div></div>`);
    const shooterStage = body.querySelector('.arcadeStage');
    if (shooterStage) shooterStage.insertAdjacentHTML('afterend', gamesTop3Block('shooter', 'bodů', 5));
    const canvas = stage.canvas, ctx = stage.ctx;
    const reset = () => { Object.assign(state, shooterState()); draw(); };
    const finishShooter = () => {
      arcadeRecordOnce(state, 'shooter', {
        completed: true,
        plays: 1,
        bestScore: state.score,
        bestHits: state.hits || 0,
        bestSurvivalSec: Math.floor((state.survivedMs || 0) / 1000),
        bestBossKills: state.bossKills || 0,
        bestPowerUps: state.powerUpsCollected || 0,
        bestWeaponLevel: state.weaponLevel || 1,
        bestWave: state.bestWave || 1,
        lastResult: `${state.score} bodů`
      });
    };
    const shooterDifficulty = () => {
      const score = Number(state.score || 0) || 0;
      const sec = Math.floor(Number(state.survivedMs || 0) / 1000);
      const level = Math.max(1, Math.min(12, 1 + Math.floor(score / 850) + Math.floor(sec / 34)));
      return {
        level,
        speed: 1 + (level - 1) * 0.075,
        hpBonus: Math.floor((level - 1) / 3),
        spawnMs: Math.max(210, 760 - (level - 1) * 46),
        maxEnemies: Math.min(15, 4 + Math.floor(level * 0.85)),
        burstChance: Math.min(0.46, level * 0.035),
        bossMs: Math.max(18000, 47000 - (level - 1) * 2300)
      };
    };
    const pickEnemyKind = (level) => {
      const roll = Math.random();
      if (level >= 10 && roll < .16) return 'destroyer';
      if (level >= 7 && roll < .26) return 'interceptor';
      if (level >= 5 && roll < .42) return 'bomber';
      if (level >= 3 && roll < .62) return 'fighter';
      return randomPick(['scout', 'fighter', 'asteroid']);
    };
    const spawnEnemy = () => {
      const diff = shooterDifficulty();
      if (state.enemies.length >= diff.maxEnemies) return;
      const w = canvas.clientWidth || stage.wrap.clientWidth || 320;
      const kind = pickEnemyKind(diff.level);
      const base = {
        scout: { r: 11, hp: 1, vy: 1.85, vx: (Math.random() - .5) * .45, score: 18 },
        fighter: { r: 14, hp: 2, vy: 1.42, vx: (Math.random() - .5) * 1.05, score: 32 },
        interceptor: { r: 13, hp: 2, vy: 1.95, vx: (Math.random() - .5) * 1.55, score: 42 },
        bomber: { r: 18, hp: 3, vy: 1.08, vx: (Math.random() - .5) * .35, score: 52 },
        destroyer: { r: 21, hp: 5, vy: .92, vx: (Math.random() - .5) * .42, score: 82 },
        asteroid: { r: 16, hp: 2, vy: 1.25, vx: (Math.random() - .5) * .8, score: 22 }
      }[kind];
      const hpExtra = kind === 'scout' ? Math.max(0, diff.hpBonus - 1) : diff.hpBonus;
      state.enemies.push({
        kind,
        x: Math.random() * (w - base.r * 2) + base.r,
        y: -28,
        wave: Math.random() * Math.PI * 2,
        r: base.r,
        hp: base.hp + hpExtra,
        maxHp: base.hp + hpExtra,
        vy: base.vy * diff.speed,
        vx: base.vx * Math.min(1.8, 1 + diff.level * .035),
        score: base.score + diff.level * 4
      });
    };
    const spawnBoss = () => {
      const w = canvas.clientWidth || stage.wrap.clientWidth || 320;
      const diff = shooterDifficulty();
      state.enemies.push({ kind: 'boss', boss: true, x: w / 2, y: -54, r: 34 + diff.level * .6, hp: 16 + diff.level * 4 + Math.floor(state.score / 340), maxHp: 16 + diff.level * 4 + Math.floor(state.score / 340), vy: .34 + diff.level * .018, vx: .52 + diff.level * .025, score: 260 + diff.level * 25, wave: 0 });
    };
    const spawnPower = () => {
      const w = canvas.clientWidth || stage.wrap.clientWidth || 320;
      const type = randomPick(['spread', 'rapid', 'shield', 'score', 'laser', 'nuke', 'slow', 'double']);
      state.powerUps.push({ type, x: 24 + Math.random() * Math.max(1, w - 48), y: -22, vy: 1.25, r: 12 });
    };
    const applyPower = (type) => {
      const now = Date.now();
      state.powerUpsCollected = Number(state.powerUpsCollected || 0) + 1;
      if (type === 'spread') { state.spreadLevel = Math.min(5, Number(state.spreadLevel || 0) + 1); state.spreadUntil = now + 16000; state.weaponLevel = Math.max(Number(state.weaponLevel || 1), 1 + state.spreadLevel); }
      else if (type === 'laser') { state.weaponLevel = Math.min(6, Number(state.weaponLevel || 1) + 1); state.spreadUntil = now + 14000; state.rapidUntil = now + 9000; state.weaponUntil = now + 15000; }
      else if (type === 'rapid') { state.rapidLevel = Math.min(4, Number(state.rapidLevel || 0) + 1); state.rapidUntil = now + 9000 + state.rapidLevel * 2500; }
      else if (type === 'shield') state.shieldUntil = now + 12000;
      else if (type === 'slow') state.timeSlowUntil = now + 9000;
      else if (type === 'double') state.doubleUntil = now + 11000;
      else if (type === 'nuke') { let hit = 0; state.enemies.forEach((e) => { if (e.boss) { e.hp = Math.max(1, Number(e.hp || 0) - 10); } else { e.hp = 0; hit += 1; } }); state.enemies = state.enemies.filter(e => e.hp > 0); state.score += 85 * hit; }
      else if (type === 'score') state.score += 150;
      if (typeof navigator !== 'undefined' && navigator.vibrate) { try { navigator.vibrate([8, 18, 8]); } catch (err) {} }
    };
    const shoot = () => {
      if (state.shotCooldown > 0 || state.over) return;
      const h = canvas.clientHeight || stage.wrap.clientHeight || 420;
      const y = h - 58;
      const now = Date.now();
      const rapid = now < Number(state.rapidUntil || 0);
      const weaponLevel = Math.max(1, Number(state.weaponLevel || 1) || 1);
      const spreadLevel = Math.max(0, Number(state.spreadLevel || 0) || 0);
      const strong = weaponLevel >= 3 || now < Number(state.weaponUntil || 0);
      const bullets = [{ x: state.shipX, y, vx: 0, vy: -7.35, strong }];
      const sideCount = Math.min(4, spreadLevel);
      for (let i = 1; i <= sideCount; i += 1) {
        const vx = 0.72 + i * 0.48;
        const vy = -7.05 + i * 0.10;
        bullets.push({ x: state.shipX - 7 * i, y: y + 3 * i, vx: -vx, vy, strong: strong || i >= 3 });
        bullets.push({ x: state.shipX + 7 * i, y: y + 3 * i, vx, vy, strong: strong || i >= 3 });
      }
      if (weaponLevel >= 4) {
        bullets.push({ x: state.shipX - 16, y: y + 8, vx: -.28, vy: -7.65, strong: true });
        bullets.push({ x: state.shipX + 16, y: y + 8, vx: .28, vy: -7.65, strong: true });
      }
      state.bullets.push(...bullets);
      state.shotCooldown = rapid ? Math.max(36, 72 - Number(state.rapidLevel || 0) * 8) : 115;
    };
    let shooterDrag = null;
    const pointerMove = (ev) => {
      if (!shooterDrag) return;
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const dx = ev.clientX - shooterDrag.lastX;
      if (Math.abs(dx) < 0.5) return;
      state.shipX = clamp((state.shipX || rect.width / 2) + dx, 20, rect.width - 20);
      shooterDrag.lastX = ev.clientX;
      state.autoShoot = true;
    };
    const pointerDown = (ev) => {
      ev.preventDefault();
      canvas.setPointerCapture && canvas.setPointerCapture(ev.pointerId);
      if (!state.shipX) state.shipX = (canvas.getBoundingClientRect().width || 320) / 2;
      shooterDrag = { lastX: ev.clientX };
      state.autoShoot = false;
    };
    const pointerEnd = (ev) => {
      ev?.preventDefault?.();
      shooterDrag = null;
      state.autoShoot = false;
    };
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerEnd);
    canvas.addEventListener('pointercancel', pointerEnd);
    body.querySelector('#shooterRestartBtn').addEventListener('click', reset);
    const end = () => { if (!state.over) { state.over = true; finishShooter(); } };
    const drawShip = (x, y, colors) => {
      const shield = Date.now() < Number(state.shieldUntil || 0);
      ctx.save();
      if (shield) { ctx.strokeStyle = colors.cyan; ctx.globalAlpha = .75; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 28, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1; }
      ctx.fillStyle = colors.accent2;
      ctx.shadowColor = colors.accent2; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.moveTo(x, y - 23); ctx.lineTo(x - 9, y + 12); ctx.lineTo(x, y + 6); ctx.lineTo(x + 9, y + 12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = colors.accent; ctx.beginPath(); ctx.moveTo(x - 7, y + 5); ctx.lineTo(x - 27, y + 18); ctx.lineTo(x - 14, y - 2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + 7, y + 5); ctx.lineTo(x + 27, y + 18); ctx.lineTo(x + 14, y - 2); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = colors.soft; ctx.fillRect(x - 3, y - 3, 6, 15);
      ctx.restore();
    };
    const drawEnemy = (e, colors) => {
      ctx.save();
      if (e.kind === 'boss') {
        const grd = ctx.createLinearGradient(e.x - 36, e.y, e.x + 36, e.y);
        grd.addColorStop(0, colors.danger); grd.addColorStop(1, colors.purple || colors.accent2);
        ctx.fillStyle = grd; ctx.shadowColor = colors.danger; ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.moveTo(e.x, e.y + 36); ctx.lineTo(e.x - 48, e.y - 8); ctx.lineTo(e.x - 18, e.y - 28); ctx.lineTo(e.x + 18, e.y - 28); ctx.lineTo(e.x + 48, e.y - 8); ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.72)'; ctx.fillRect(e.x - 24, e.y - 3, 48 * Math.max(0, e.hp) / Math.max(1, e.maxHp || e.hp || 1), 3);
      } else if (e.kind === 'asteroid') {
        ctx.fillStyle = 'rgba(190,194,202,.72)'; ctx.beginPath(); ctx.arc(e.x, e.y, e.r || 15, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.stroke();
      } else if (e.kind === 'destroyer') {
        ctx.fillStyle = colors.purple || colors.danger; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.moveTo(e.x, e.y + 24); ctx.lineTo(e.x - 26, e.y - 12); ctx.lineTo(e.x - 9, e.y - 20); ctx.lineTo(e.x + 9, e.y - 20); ctx.lineTo(e.x + 26, e.y - 12); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(e.x - 16, e.y + 14, 32 * Math.max(0, e.hp) / Math.max(1, e.maxHp || e.hp || 1), 2);
      } else if (e.kind === 'bomber') {
        ctx.fillStyle = colors.danger; ctx.shadowColor = colors.danger; ctx.shadowBlur = 10; ctx.fillRect(e.x - 18, e.y - 10, 36, 20); ctx.fillRect(e.x - 7, e.y - 18, 14, 36);
      } else {
        ctx.fillStyle = e.kind === 'fighter' ? colors.gold : colors.danger;
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(e.x, e.y + 18); ctx.lineTo(e.x - 18, e.y - 12); ctx.lineTo(e.x, e.y - 4); ctx.lineTo(e.x + 18, e.y - 12); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    };
    const drawPower = (p, colors) => {
      const color = p.type === 'shield' ? colors.cyan : p.type === 'rapid' ? colors.gold : p.type === 'nuke' ? colors.danger : p.type === 'slow' ? colors.purple : p.type === 'double' ? colors.soft : p.type === 'score' ? colors.soft : colors.accent;
      ctx.save(); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.moveTo(p.x, p.y - 12); ctx.lineTo(p.x + 12, p.y); ctx.lineTo(p.x, p.y + 12); ctx.lineTo(p.x - 12, p.y); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.font = '900 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(p.type === 'spread' ? '+' : p.type === 'rapid' ? 'R' : p.type === 'shield' ? 'S' : p.type === 'laser' ? 'L' : p.type === 'nuke' ? '☢' : p.type === 'slow' ? 'T' : p.type === 'double' ? '2' : '+', p.x, p.y + 3);
      ctx.restore();
    };
    const draw = () => {
      const { w, h } = stage.resize();
      const colors = arcadeThemeColors();
      ctx.clearRect(0, 0, w, h);
      arcadeDrawStageBg(ctx, w, h, colors, { clean: true });
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, 0, w, h);
      state.stars.forEach((s) => { s.y += s.s; if (s.y > h) { s.y = -2; s.x = Math.random() * w; } ctx.fillStyle = 'rgba(255,255,255,.58)'; ctx.fillRect(s.x, s.y, 2, 2); });
      const shipY = h - 42;
      state.powerUps.forEach((p) => drawPower(p, colors));
      state.bullets.forEach((b) => { ctx.fillStyle = b.strong ? colors.cyan : colors.gold; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10; ctx.fillRect(b.x - 2, b.y - 12, 4, 13); ctx.shadowBlur = 0; });
      state.enemies.forEach((e) => drawEnemy(e, colors));
      drawShip(state.shipX || w / 2, shipY, colors);
      const active = [];
      if (Date.now() < Number(state.spreadUntil || 0)) active.push('vícesměr +' + String(Number(state.spreadLevel || 0) || 1));
      if (Date.now() < Number(state.rapidUntil || 0)) active.push('rychlopalba');
      if (Date.now() < Number(state.timeSlowUntil || 0)) active.push('časový zpomalovač');
      if (Date.now() < Number(state.doubleUntil || 0)) active.push('2× body');
      if (Date.now() < Number(state.shieldUntil || 0)) active.push('štít');
      if (active.length) { ctx.fillStyle = 'rgba(0,0,0,.42)'; ctx.fillRect(8, 8, Math.min(w - 16, 210), 24); ctx.fillStyle = colors.soft; ctx.font = '800 11px system-ui'; ctx.fillText(active.join(' · '), 18, 24); }
      if (state.over) { ctx.fillStyle = 'rgba(0,0,0,.62)'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = colors.soft; ctx.font = '20px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Konec hry', w / 2, h / 2 - 10); ctx.font = '12px system-ui'; ctx.fillText(`${state.score} bodů · ${state.hits || 0} zásahů`, w / 2, h / 2 + 16); }
    };
    const loop = (ts) => {
      if (!rakGameShouldTick()) { state.lastTs = 0; state.raf = 0; return; }
      const dt = rakGameDelta(state, ts);
      const { w, h } = stage.resize();
      if (!state.shipX) state.shipX = w / 2;
      if (!state.over) {
        state.survivedMs += dt;
        state.shotCooldown = Math.max(0, state.shotCooldown - dt);
        if (state.autoShoot) shoot();
        state.spawnAcc += dt;
        state.powerAcc += dt;
        state.bossAcc += dt;
        const diff = shooterDifficulty();
        state.bestWave = Math.max(Number(state.bestWave || 1) || 1, diff.level);
        if (state.spawnAcc > diff.spawnMs) {
          state.spawnAcc = 0;
          spawnEnemy();
          if (Math.random() < diff.burstChance) spawnEnemy();
          if (diff.level >= 9 && Math.random() < .18) spawnEnemy();
        }
        if (state.powerAcc > Math.max(5200, 9000 - diff.level * 260) + Math.random() * 2800) { state.powerAcc = 0; spawnPower(); }
        if (state.bossAcc > diff.bossMs && !state.enemies.some(e => e.boss)) { state.bossAcc = 0; spawnBoss(); }
        state.bullets.forEach((b) => { b.x += (b.vx || 0) * dt / 16; b.y += b.vy * dt / 16; });
        state.enemies.forEach((e) => {
          e.wave = (e.wave || 0) + dt / 620;
          const slowMul = Date.now() < Number(state.timeSlowUntil || 0) ? 0.58 : 1;
          e.x += ((e.vx || 0) + (e.kind === 'fighter' ? Math.sin(e.wave) * .45 : 0)) * slowMul * dt / 16;
          e.y += e.vy * slowMul * dt / 16;
          if (e.x < (e.r || 14)) e.vx = Math.abs(e.vx || .4);
          if (e.x > w - (e.r || 14)) e.vx = -Math.abs(e.vx || .4);
        });
        state.powerUps.forEach((p) => { p.y += p.vy * dt / 16; });
        state.bullets = state.bullets.filter((b) => b.y > -28 && b.x > -18 && b.x < w + 18);
        state.powerUps = state.powerUps.filter((p) => p.y < h + 28);
        const shipY = h - 42;
        state.powerUps = state.powerUps.filter((p) => {
          if (Math.hypot(p.x - state.shipX, p.y - shipY) < 28) { applyPower(p.type); return false; }
          return true;
        });
        state.enemies.forEach((e) => {
          if (Math.hypot(e.x - state.shipX, e.y - shipY) < (e.r || 14) + 15) {
            if (Date.now() < Number(state.shieldUntil || 0)) { e.hp = 0; state.shieldUntil = 0; }
            else end();
          }
          if (e.y > h + 36) end();
        });
        state.bullets = state.bullets.filter((b) => {
          for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
            const e = state.enemies[i];
            if (Math.hypot(b.x - e.x, b.y - e.y) < (e.r || 14) + 4) {
              e.hp -= b.strong ? 2 : 1;
              if (e.hp <= 0) {
                state.enemies.splice(i, 1);
                state.score += Number(e.score || 20) * (Date.now() < Number(state.doubleUntil || 0) ? 2 : 1);
                state.hits = (state.hits || 0) + 1;
                if (e.boss) { state.bossKills = Number(state.bossKills || 0) + 1; state.weaponLevel = Math.min(6, Number(state.weaponLevel || 1) + 1); spawnPower(); }
              }
              return false;
            }
          }
          return true;
        });
      }
      const hud = body.querySelector('.arcadeHud');
      if (hud) hud.innerHTML = `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Vlna', state.bestWave || 1)}${gamesStatLine('Čas', Math.floor((state.survivedMs || 0) / 1000))}`;
      const endOverlay = body.querySelector('#shooterEndOverlay');
      if (endOverlay) { endOverlay.hidden = !state.over; const txt = endOverlay.querySelector('[data-shooter-end-text]'); if (txt) txt.textContent = `Score ${state.score} · vlna ${state.bestWave || 1} · boss ${state.bossKills || 0}`; }
      draw();
      state.raf = rakGameRequestFrame(state, loop);
    };
    state.raf = rakGameRequestFrame(state, loop);
    addCleanup(() => { cancelAnimationFrame(state.raf); canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('pointerup', pointerEnd); canvas.removeEventListener('pointercancel', pointerEnd); if (state.over) finishShooter(); });
    draw();
    setActiveState('shooter', state);
  }

  // Brick Breaker ----------------------------------------------------------
  function brickState() { return { score: 0, over: false, won: false, lastTs: 0, raf: 0, paddleX: 0, ball: { x: 160, y: 280, vx: 3.4, vy: -3.6 }, launched: false, bricks: [], combo: 0, bestCombo: 0, saved: false, level: 1, clearedLevels: 0, totalBricks: 0, destroyedBricks: 0, paddleReady: false }; }
  function initBricks(state) {
    const level = Math.max(1, Math.min(5, Number(state.level || 1) || 1));
    state.level = level;
    state.bricks = [];
    const layouts = [
      (r, c) => r < 6,
      (r, c) => r < 6 && (r < 2 || ((r + c) % 2 === 0)),
      (r, c) => r < 7 && c >= Math.floor(r / 2) && c < 8 - Math.floor(r / 2),
      (r, c) => r < 7 && (r === 0 || r === 3 || c === 0 || c === 7 || ((r + c) % 3 !== 0)),
      (r, c) => r < 7 && !(r === 2 && (c === 2 || c === 5)) && !(r === 5 && (c === 1 || c === 6))
    ];
    const include = layouts[level - 1] || layouts[layouts.length - 1];
    for (let r = 0; r < 7; r += 1) {
      for (let c = 0; c < 8; c += 1) {
        if (!include(r, c)) continue;
        const hp = Math.min(3, 1 + (r > 3 ? 1 : 0) + (level >= 4 && (r + c) % 4 === 0 ? 1 : 0));
        state.bricks.push({ x: c, y: r, alive: true, hp });
      }
    }
    state.totalBricks = state.bricks.length;
  }
  function renderBrick(body) {
    const state = getState('brick', () => { const s2 = brickState(); initBricks(s2); return s2; });
    const stage = createCanvas(body, 'clamp(420px, 66dvh, 640px)');
    if (stage.wrap) stage.wrap.classList.add('isFullGame', 'brickNarrowCanvas', 'arcadeNoPageScroll');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeHud arcadeHudWide3 arcadeHudSingleLine">${gamesStatLine('Level', state.level || 1)}${gamesStatLine('Skóre', state.score)}${gamesStatLine('Cihly', state.bricks.filter(b => b.alive).length)}${gamesStatLine('Combo', state.bestCombo || 0)}</div>`);
    if (stage.wrap) stage.wrap.insertAdjacentHTML('beforeend', `<div class="arcadeGameOverlay arcadeEndOverlay" id="brickEndOverlay" hidden><div class="arcadeOverlayCard"><strong>Konec hry</strong><span data-brick-end-text>Score 0</span><button type="button" class="gameControlBtn" id="brickRestartBtn">Nová hra</button></div></div>`);
    const brickStage = body.querySelector('.arcadeStage');
    if (brickStage) brickStage.insertAdjacentHTML('afterend', gamesTop3Block('brick', 'bodů', 5));
    const canvas = stage.canvas, ctx = stage.ctx;
    const reset = () => { Object.assign(state, brickState()); initBricks(state); state.paddleReady = false; draw(); };
    const finishBrick = () => {
      arcadeRecordOnce(state, 'brick', {
        completed: true,
        plays: 1,
        bestScore: state.score,
        bestCombo: state.bestCombo || 0,
        bestBricks: Number(state.destroyedBricks || 0) || ((Number(state.totalBricks || 0) || state.bricks.length) - state.bricks.filter(b => b.alive).length),
        perfectClears: state.won ? 1 : 0,
        lastResult: `${state.score} bodů`
      });
    };
    let brickDrag = null;
    const paddleWidth = () => {
      const w = canvas.getBoundingClientRect().width || 320;
      return Math.max(74, Math.min(92, w * 0.26));
    };
    const ensurePaddleReady = () => {
      const w = canvas.getBoundingClientRect().width || 320;
      const pw = paddleWidth();
      if (!state.paddleReady) {
        state.paddleX = Math.max(0, (w - pw) / 2);
        state.ball.x = state.paddleX + pw / 2;
        state.paddleReady = true;
      }
    };
    const movePaddleBy = (dx) => {
      const w = canvas.getBoundingClientRect().width || 320;
      const pw = paddleWidth();
      ensurePaddleReady();
      state.paddleX = clamp((state.paddleX || 0) + dx, 0, Math.max(0, w - pw));
      if (!state.launched && !state.over) state.ball.x = state.paddleX + pw / 2;
    };
    const brickPointerDown = (ev) => {
      ev.preventDefault();
      canvas.setPointerCapture && canvas.setPointerCapture(ev.pointerId);
      ensurePaddleReady();
      brickDrag = { lastX: ev.clientX, moved: false };
      if (!state.launched && !state.over) state.launched = true;
    };
    const brickPointerMove = (ev) => {
      if (!brickDrag) return;
      ev.preventDefault();
      const dx = ev.clientX - brickDrag.lastX;
      if (Math.abs(dx) >= 0.5) {
        movePaddleBy(dx);
        brickDrag.lastX = ev.clientX;
        brickDrag.moved = true;
      }
    };
    const brickPointerEnd = (ev) => { ev?.preventDefault?.(); brickDrag = null; };
    canvas.addEventListener('pointerdown', brickPointerDown);
    canvas.addEventListener('pointermove', brickPointerMove);
    canvas.addEventListener('pointerup', brickPointerEnd);
    canvas.addEventListener('pointercancel', brickPointerEnd);
    body.querySelector('#brickRestartBtn').addEventListener('click', reset);
    const end = (won = false) => { if (!state.over) { state.over = true; state.won = !!won; finishBrick(); } };
    const advanceBrickLevel = () => {
      state.level = Math.min(5, Number(state.level || 1) + 1);
      state.clearedLevels = Number(state.clearedLevels || 0) + 1;
      state.score += 120 + state.level * 80;
      state.combo = 0;
      initBricks(state);
      state.launched = false;
      state.paddleReady = false;
      state.ball = { x: 160, y: 280, vx: 3.4 + state.level * .22, vy: -(3.6 + state.level * .24) };
    };
    const draw = () => {
      const { w, h } = stage.resize();
      const colors = arcadeThemeColors();
      const paddleY = h - 28;
      const pw = paddleWidth();
      ensurePaddleReady();
      ctx.clearRect(0, 0, w, h);
      arcadeDrawStageBg(ctx, w, h, colors);
      const brickW = w / 8 - 5;
      const brickH = Math.max(18, Math.min(24, h * .045));
      state.bricks.forEach((b) => { if (!b.alive) return; const x = b.x * (brickW + 5) + 2.5; const y = b.y * (brickH + 5) + 16; ctx.fillStyle = b.hp > 1 ? colors.gold : colors.accent; ctx.globalAlpha = b.hp > 1 ? .62 : .48; ctx.fillRect(x, y, brickW, brickH); ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.strokeRect(x, y, brickW, brickH); });
      ctx.fillStyle = colors.accent; ctx.shadowColor = colors.accent; ctx.shadowBlur = 14; ctx.fillRect(state.paddleX, paddleY, pw, 11); ctx.shadowBlur = 0;
      if (!state.launched && !state.over) state.ball.x = state.paddleX + pw / 2;
      ctx.beginPath(); ctx.fillStyle = colors.gold; ctx.arc(state.ball.x, state.ball.y, 6.5, 0, Math.PI * 2); ctx.fill();
      if (!state.launched && !state.over) { ctx.fillStyle = 'rgba(255,255,255,.78)'; ctx.font = '12px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Klepni nebo táhni pro start', w / 2, h - 52); }
      if (state.over) { ctx.fillStyle = 'rgba(0,0,0,.62)'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = colors.soft; ctx.font = '20px system-ui'; ctx.textAlign = 'center'; ctx.fillText(state.won ? 'Vyčištěno' : 'Konec hry', w / 2, h / 2 - 10); ctx.font = '12px system-ui'; ctx.fillText(`${state.score} bodů · combo ${state.bestCombo || 0}`, w / 2, h / 2 + 16); }
    };
    const loop = (ts) => {
      if (!rakGameShouldTick()) { state.lastTs = 0; state.raf = 0; return; }
      const dt = rakGameDelta(state, ts);
      const { w, h } = stage.resize();
      const paddleY = h - 28;
      const pw = paddleWidth();
      ensurePaddleReady();
      if (!state.over && state.launched) {
        state.ball.x += state.ball.vx * dt / 16;
        state.ball.y += state.ball.vy * dt / 16;
        if (state.ball.x < 7) { state.ball.x = 7; state.ball.vx = Math.abs(state.ball.vx); }
        if (state.ball.x > w - 7) { state.ball.x = w - 7; state.ball.vx = -Math.abs(state.ball.vx); }
        if (state.ball.y < 7) { state.ball.y = 7; state.ball.vy = Math.abs(state.ball.vy); }
        if (state.ball.y > paddleY - 7 && state.ball.y < paddleY + 14 && state.ball.x > state.paddleX - 4 && state.ball.x < state.paddleX + pw + 4 && state.ball.vy > 0) {
          state.ball.vy = -Math.abs(state.ball.vy) * 1.015;
          const hit = (state.ball.x - (state.paddleX + pw / 2)) / Math.max(1, pw / 2);
          state.ball.vx = hit * 5.8;
          state.combo = 0;
        }
        const brickW = w / 8 - 5; const brickH = Math.max(18, Math.min(24, h * .045));
        state.bricks.forEach((b) => {
          if (!b.alive) return;
          const x = b.x * (brickW + 5) + 2.5;
          const y = b.y * (brickH + 5) + 16;
          if (state.ball.x > x && state.ball.x < x + brickW && state.ball.y > y && state.ball.y < y + brickH) {
            b.hp -= 1;
            state.ball.vy *= -1;
            state.combo += 1;
            state.bestCombo = Math.max(state.bestCombo || 0, state.combo);
            if (b.hp <= 0) { b.alive = false; state.destroyedBricks = Number(state.destroyedBricks || 0) + 1; state.score += 18 + Math.min(60, state.combo * 4); }
          }
        });
        if (state.ball.y > h + 18) end(false);
        if (!state.bricks.some(b => b.alive)) {
          if ((Number(state.level || 1) || 1) < 5) advanceBrickLevel();
          else end(true);
        }
      }
      const hud = body.querySelector('.arcadeHud');
      if (hud) hud.innerHTML = `${gamesStatLine('Level', state.level || 1)}${gamesStatLine('Skóre', state.score)}${gamesStatLine('Cihly', state.bricks.filter(b => b.alive).length)}${gamesStatLine('Combo', state.bestCombo || 0)}`;
      const endOverlay = body.querySelector('#brickEndOverlay');
      if (endOverlay) { endOverlay.hidden = !state.over; const txt = endOverlay.querySelector('[data-brick-end-text]'); if (txt) txt.textContent = `${state.score} bodů · combo ${state.bestCombo || 0}`; }
      draw();
      state.raf = rakGameRequestFrame(state, loop);
    };
    state.raf = rakGameRequestFrame(state, loop);
    addCleanup(() => { cancelAnimationFrame(state.raf); canvas.removeEventListener('pointerdown', brickPointerDown); canvas.removeEventListener('pointermove', brickPointerMove); canvas.removeEventListener('pointerup', brickPointerEnd); canvas.removeEventListener('pointercancel', brickPointerEnd); if (state.over) finishBrick(); });
    draw();
    setActiveState('brick', state);
  }

  // Doodle Jump ------------------------------------------------------------
  function doodleState() {
    return { score: 0, over: false, lastTs: 0, raf: 0, x: 160, y: 300, vy: -6.4, vx: 0, platforms: [], height: 0, jumps: 0, platformHits: 0, saved: false, dragging: false, lastX: 0, startedAt: Date.now() };
  }
  function initDoodle(state) {
    state.platforms = [];
    for (let i = 0; i < 15; i += 1) {
      const kind = i > 7 && Math.random() < .18 ? 'boost' : (i > 10 && Math.random() < .16 ? 'moving' : 'normal');
      state.platforms.push({ x: 28 + Math.random() * 240, y: 320 - i * 36, w: kind === 'boost' ? 46 : 54 + Math.random() * 14, kind, vx: kind === 'moving' ? (Math.random() < .5 ? -0.8 : 0.8) : 0 });
    }
  }
  function renderDoodle(body) {
    const state = getState('doodle', () => { const s2 = doodleState(); initDoodle(s2); return s2; });
    const stage = createCanvas(body, 'clamp(420px, 66dvh, 640px)');
    if (stage.wrap) stage.wrap.classList.add('isFullGame', 'arcadeNoPageScroll', 'doodleCanvasWrap');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeHud arcadeHudWide3 arcadeHudSingleLine">${gamesStatLine('Skóre', state.score)}${gamesStatLine('Výška', Math.floor(state.height || 0))}${gamesStatLine('Skoky', state.jumps || 0)}</div>`);
    if (stage.wrap) stage.wrap.insertAdjacentHTML('beforeend', `<div class="arcadeGameOverlay arcadeEndOverlay" id="doodleEndOverlay" hidden><div class="arcadeOverlayCard"><strong>Konec skoku</strong><span data-doodle-end-text>Score 0</span><button type="button" class="gameControlBtn" id="doodleRestartBtn">Nová hra</button></div></div>`);
    const doodleWrap = body.querySelector('.doodleCanvasWrap');
    if (doodleWrap) doodleWrap.insertAdjacentHTML('afterend', gamesTop3Block('doodle', 'bodů', 5).replace('gamesTop5ScrollCard', 'gamesTop5ScrollCard arcadeTopScoreTight'));
    const canvas = stage.canvas, ctx = stage.ctx;
    const reset = () => { Object.assign(state, doodleState()); initDoodle(state); draw(); };
    body.querySelector('#doodleRestartBtn').addEventListener('click', reset);
    const finishDoodle = () => {
      arcadeRecordOnce(state, 'doodle', {
        completed: true,
        plays: 1,
        bestScore: state.score,
        bestHeight: Math.floor(state.height || 0),
        bestJumps: state.jumps || 0,
        bestPlatforms: state.platformHits || 0,
        lastResult: `${state.score} bodů`
      });
    };
    const pointerDown = (ev) => { ev.preventDefault(); canvas.setPointerCapture && canvas.setPointerCapture(ev.pointerId); state.dragging = true; state.lastX = ev.clientX; };
    const pointerMove = (ev) => {
      if (!state.dragging) return;
      ev.preventDefault();
      const dx = ev.clientX - state.lastX;
      state.lastX = ev.clientX;
      state.vx = clamp((state.vx || 0) + dx * 0.045, -5.8, 5.8);
    };
    const pointerEnd = (ev) => { ev?.preventDefault?.(); state.dragging = false; };
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerEnd);
    canvas.addEventListener('pointercancel', pointerEnd);
    const addPlatform = (w, requestedY) => {
      const roll = Math.random();
      const kind = roll > .86 ? 'boost' : roll > .70 ? 'moving' : 'normal';
      const platformW = kind === 'boost' ? 44 : 48 + Math.random() * 20;
      const top = state.platforms.slice().sort((a, b) => a.y - b.y)[0] || { x: state.x - 27, y: state.y + 42, w: 54 };
      const minGap = 34;
      const maxGap = 58;
      let y = Number.isFinite(Number(requestedY)) ? Number(requestedY) : (top.y - (minGap + Math.random() * (maxGap - minGap)));
      const gap = top.y - y;
      if (gap < minGap) y = top.y - minGap;
      if (gap > maxGap) y = top.y - maxGap;
      const maxHorizontalStep = Math.max(68, Math.min(118, w * .36));
      const center = (top.x + top.w / 2) + (Math.random() * 2 - 1) * maxHorizontalStep;
      const x = clamp(center - platformW / 2, 18, Math.max(18, w - platformW - 18));
      state.platforms.push({ x, y, w: platformW, kind, vx: kind === 'moving' ? (Math.random() < .5 ? -0.9 : 0.9) : 0 });
    };
    const end = () => { if (!state.over) { state.over = true; finishDoodle(); } };
    const draw = () => {
      const { w, h } = stage.resize();
      const colors = arcadeThemeColors();
      ctx.clearRect(0, 0, w, h);
      arcadeDrawStageBg(ctx, w, h, colors, { clean: true });
      ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
      state.platforms.forEach((p) => {
        ctx.save();
        const fill = p.kind === 'boost' ? colors.gold : p.kind === 'moving' ? colors.accent2 : colors.accent;
        ctx.fillStyle = fill; ctx.shadowColor = fill; ctx.shadowBlur = p.kind === 'boost' ? 16 : 9; ctx.globalAlpha = .78;
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(p.x, p.y, p.w, 9, 5); ctx.fill(); } else ctx.fillRect(p.x, p.y, p.w, 9);
        ctx.restore();
      });
      ctx.save();
      ctx.translate(state.x, state.y);
      ctx.fillStyle = colors.soft; ctx.shadowColor = colors.accent; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = colors.accent; ctx.beginPath(); ctx.arc(-4, -3, 2, 0, Math.PI * 2); ctx.arc(4, -3, 2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      if (state.over) { ctx.fillStyle = 'rgba(0,0,0,.62)'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = colors.soft; ctx.textAlign = 'center'; ctx.font = '20px system-ui'; ctx.fillText('Konec hry', w / 2, h / 2 - 10); ctx.font = '12px system-ui'; ctx.fillText(`${state.score} bodů · výška ${Math.floor(state.height || 0)}`, w / 2, h / 2 + 16); }
    };
    const loop = (ts) => {
      if (!rakGameShouldTick()) { state.lastTs = 0; state.raf = 0; return; }
      const dt = rakGameDelta(state, ts);
      const { w, h } = stage.resize();
      if (!state.over) {
        const step = dt / 16;
        state.platforms.forEach((p) => { if (p.kind === 'moving') { p.x += p.vx * step; if (p.x < 8 || p.x + p.w > w - 8) p.vx *= -1; } });
        state.vx *= Math.pow(.985, step);
        state.x += state.vx * step;
        if (state.x < -10) state.x = w + 10;
        if (state.x > w + 10) state.x = -10;
        state.vy += 0.26 * step;
        state.y += state.vy * step;
        if (state.y < h * 0.36) {
          const dy = h * 0.36 - state.y;
          state.y = h * 0.36;
          state.height += dy;
          state.score += Math.max(1, Math.round(dy * 1.35));
          state.platforms.forEach(p => { p.y += dy; });
        }
        state.platforms.forEach((p) => {
          if (state.vy > 0 && state.x > p.x - 8 && state.x < p.x + p.w + 8 && state.y > p.y - 16 && state.y < p.y + 12) {
            state.vy = p.kind === 'boost' ? -9.4 : -6.8;
            state.jumps = Number(state.jumps || 0) + 1;
            state.platformHits = Number(state.platformHits || 0) + 1;
            if (p.kind === 'boost') state.score += 60;
          }
        });
        state.platforms = state.platforms.filter(p => p.y < h + 26);
        while (state.platforms.length < 15) addPlatform(w, -20 - Math.random() * 40);
        if (state.y > h + 28) end();
      }
      const hud = body.querySelector('.arcadeHud');
      if (hud) hud.innerHTML = `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Výška', Math.floor(state.height || 0))}${gamesStatLine('Skoky', state.jumps || 0)}`;
      const endOverlay = body.querySelector('#doodleEndOverlay');
      if (endOverlay) { endOverlay.hidden = !state.over; const txt = endOverlay.querySelector('[data-doodle-end-text]'); if (txt) txt.textContent = `${state.score} bodů · výška ${Math.floor(state.height || 0)}`; }
      draw();
      state.raf = rakGameRequestFrame(state, loop);
    };
    state.raf = rakGameRequestFrame(state, loop);
    addCleanup(() => { cancelAnimationFrame(state.raf); canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('pointerup', pointerEnd); canvas.removeEventListener('pointercancel', pointerEnd); if (state.over) finishDoodle(); });
    draw();
    setActiveState('doodle', state);
  }

  // Bubble Shooter ---------------------------------------------------------
  function bubbleState() {
    return { score: 0, over: false, cleared: false, lastTs: 0, raf: 0, aim: -Math.PI / 2, shot: null, grid: [], colors: ['#ff8f8f', '#ffe27a', '#8bffb2', '#8fb2ff', '#c18bff'], rows: 10, cols: 8, combo: 0, bestCombo: 0, shots: 0, popped: 0, dropped: 0, saved: false, nextColor: '#8bffb2', aiming: false };
  }
  function initBubble(state) {
    state.nextColor = randomPick(state.colors);
    state.grid = Array.from({ length: state.rows }, (_, r) => Array.from({ length: state.cols }, () => (r < 4 ? randomPick(state.colors) : '')));
  }
  function renderBubble(body) {
    const state = getState('bubble', () => { const s2 = bubbleState(); initBubble(s2); return s2; });
    const stage = createCanvas(body, 'clamp(420px, 66dvh, 640px)');
    if (stage.wrap) stage.wrap.classList.add('isFullGame', 'arcadeNoPageScroll', 'bubbleCanvasWrap');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeHud arcadeHudWide3 arcadeHudSingleLine">${gamesStatLine('Skóre', state.score)}${gamesStatLine('Combo', state.bestCombo || 0)}${gamesStatLine('Sjede', state.nextDropEvery ? `${state.shots || 0}/${state.nextDropEvery}` : `${state.shots || 0}/6`)}</div><div class="arcadeControls arcadeOnlyRestart"><button type="button" class="gameControlBtn" id="bubbleRestartBtn">Nová hra</button></div>`);
    const bubbleWrap = body.querySelector('.bubbleCanvasWrap');
    if (bubbleWrap) bubbleWrap.insertAdjacentHTML('afterend', gamesTop3Block('bubble', 'bodů', 5).replace('gamesTop5ScrollCard', 'gamesTop5ScrollCard arcadeTopScoreTight'));
    const canvas = stage.canvas, ctx = stage.ctx;
    const reset = () => { Object.assign(state, bubbleState()); initBubble(state); draw(); };
    body.querySelector('#bubbleRestartBtn').addEventListener('click', reset);
    const finishBubble = () => {
      arcadeRecordOnce(state, 'bubble', {
        completed: true,
        plays: 1,
        bestScore: state.score,
        bestCombo: state.bestCombo || 0,
        bestPops: state.popped || 0,
        bestDrops: state.dropped || 0,
        bestShots: state.shots || 0,
        bestClears: state.cleared ? 1 : 0,
        lastResult: `${state.score} bodů`
      });
    };
    const setAimFromEvent = (ev) => {
      const rect = canvas.getBoundingClientRect();
      const sx = rect.width / 2;
      const sy = rect.height - 24;
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      state.aim = clamp(Math.atan2(y - sy, x - sx), -Math.PI + .18, -.18);
    };
    const fire = () => {
      if (state.over || state.shot) return;
      const rect = canvas.getBoundingClientRect();
      const speed = 6.2;
      state.shot = { x: rect.width / 2, y: rect.height - 24, vx: Math.cos(state.aim) * speed, vy: Math.sin(state.aim) * speed, color: state.nextColor };
      state.nextColor = randomPick(state.colors);
      state.shots = Number(state.shots || 0) + 1;
    };
    const pointerDown = (ev) => { ev.preventDefault(); canvas.setPointerCapture && canvas.setPointerCapture(ev.pointerId); state.aiming = true; setAimFromEvent(ev); };
    const pointerMove = (ev) => { if (!state.aiming) return; ev.preventDefault(); setAimFromEvent(ev); };
    const pointerEnd = (ev) => { ev?.preventDefault?.(); if (state.aiming) fire(); state.aiming = false; };
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerEnd);
    canvas.addEventListener('pointercancel', pointerEnd);
    const occupied = () => state.grid.some(row => row.some(Boolean));
    const findSlot = (row, col) => {
      const rect = canvas.getBoundingClientRect();
      const cell = Math.max(1, Math.floor((rect.width || 320) / state.cols));
      const sx = state.shot ? Number(state.shot.x || 0) : ((col + .5) * cell);
      const sy = state.shot ? Number(state.shot.y || 0) : ((row + .5) * cell + 12);
      const candidates = [];
      for (let rr = row - 2; rr <= row + 2; rr += 1) {
        for (let cc = col - 2; cc <= col + 2; cc += 1) {
          if (rr < 0 || cc < 0 || rr >= state.rows || cc >= state.cols || state.grid[rr][cc]) continue;
          const cx = cc * cell + cell / 2;
          const cy = rr * cell + cell / 2 + 12;
          candidates.push({ r: rr, c: cc, d: Math.hypot(sx - cx, sy - cy) + Math.abs(rr - row) * 4 + Math.abs(cc - col) * 2 });
        }
      }
      candidates.sort((a, b) => a.d - b.d);
      if (candidates.length) return [candidates[0].r, candidates[0].c];
      return [clamp(row, 0, state.rows - 1), clamp(col, 0, state.cols - 1)];
    };
    const bubbleDirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    const clusterPop = (r, c, color, seen = new Set()) => {
      const q = [[r, c]]; const cluster = [];
      while (q.length) {
        const [rr, cc] = q.pop(); const k = `${rr}:${cc}`; if (seen.has(k)) continue; seen.add(k);
        if (rr < 0 || cc < 0 || rr >= state.rows || cc >= state.cols) continue;
        if (state.grid[rr][cc] !== color) continue;
        cluster.push([rr, cc]);
        bubbleDirs.forEach(([dr, dc]) => q.push([rr + dr, cc + dc]));
      }
      return cluster;
    };
    const dropFloatingBubbles = () => {
      const connected = new Set();
      const q = [];
      for (let c = 0; c < state.cols; c += 1) {
        if (state.grid[0][c]) q.push([0, c]);
      }
      while (q.length) {
        const [rr, cc] = q.pop();
        const k = `${rr}:${cc}`;
        if (connected.has(k)) continue;
        if (rr < 0 || cc < 0 || rr >= state.rows || cc >= state.cols) continue;
        if (!state.grid[rr][cc]) continue;
        connected.add(k);
        bubbleDirs.forEach(([dr, dc]) => q.push([rr + dr, cc + dc]));
      }
      let dropped = 0;
      for (let r = 0; r < state.rows; r += 1) {
        for (let c = 0; c < state.cols; c += 1) {
          if (state.grid[r][c] && !connected.has(`${r}:${c}`)) {
            state.grid[r][c] = '';
            dropped += 1;
          }
        }
      }
      if (dropped) {
        state.dropped = Number(state.dropped || 0) + dropped;
        state.popped = Number(state.popped || 0) + dropped;
        state.score += dropped * 18 + Math.min(180, dropped * 6);
      }
      return dropped;
    };
    const bubbleDropEvery = () => Math.max(2, 6 - Math.floor((Number(state.shots || 0)) / 3));
    const dropRows = () => {
      const every = bubbleDropEvery();
      state.nextDropEvery = every;
      if ((state.shots || 0) % every !== 0) return;
      state.grid.pop();
      state.grid.unshift(Array.from({ length: state.cols }, () => randomPick(state.colors)));
      state.score += 8;
      state.hint = `Řádek sjel po ${every}. střele.`;
      if (state.grid[state.rows - 1].some(Boolean)) end(false);
    };
    const settleShot = (row, col) => {
      const [r, c] = findSlot(row, col);
      state.grid[r][c] = state.shot.color;
      const cluster = clusterPop(r, c, state.shot.color);
      if (cluster.length >= 3) {
        cluster.forEach(([rr, cc]) => { state.grid[rr][cc] = ''; });
        state.combo = Number(state.combo || 0) + 1;
        state.bestCombo = Math.max(Number(state.bestCombo || 0) || 0, state.combo);
        state.popped = Number(state.popped || 0) + cluster.length;
        state.score += cluster.length * 26 + Math.min(220, state.combo * 22);
        dropFloatingBubbles();
      } else {
        state.combo = 0;
        dropRows();
      }
      state.shot = null;
      if (!occupied()) end(true);
    };
    const end = (cleared = false) => { if (!state.over) { state.over = true; state.cleared = !!cleared; finishBubble(); } };
    const draw = () => {
      const { w, h } = stage.resize();
      const colors = arcadeThemeColors();
      const cell = Math.floor(w / state.cols);
      ctx.clearRect(0, 0, w, h);
      arcadeDrawStageBg(ctx, w, h, colors, { clean: true });
      ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
      for (let r = 0; r < state.rows; r += 1) {
        for (let c = 0; c < state.cols; c += 1) {
          const color = state.grid[r][c];
          if (!color) continue;
          const cx = c * cell + cell / 2; const cy = r * cell + cell / 2 + 12;
          ctx.save(); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.globalAlpha = .86;
          ctx.beginPath(); ctx.arc(cx, cy, cell * .34, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }
      const sx = w / 2, sy = h - 24;
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.26)'; ctx.setLineDash([6, 7]); ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(state.aim) * 110, sy + Math.sin(state.aim) * 110); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      ctx.fillStyle = state.nextColor; ctx.shadowColor = state.nextColor; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(sx, sy, Math.max(12, cell * .28), 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      if (state.shot) { ctx.fillStyle = state.shot.color; ctx.shadowColor = state.shot.color; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(state.shot.x, state.shot.y, cell * .28, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
      if (state.over) { ctx.fillStyle = 'rgba(0,0,0,.62)'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = colors.soft; ctx.textAlign = 'center'; ctx.font = '20px system-ui'; ctx.fillText(state.cleared ? 'Vyčištěno' : 'Konec hry', w / 2, h / 2 - 10); ctx.font = '12px system-ui'; ctx.fillText(`${state.score} bodů · combo ${state.bestCombo || 0}`, w / 2, h / 2 + 16); }
    };
    const loop = (ts) => {
      if (!rakGameShouldTick()) { state.lastTs = 0; state.raf = 0; return; }
      const dt = rakGameDelta(state, ts);
      const { w, h } = stage.resize();
      const cell = Math.floor(w / state.cols);
      if (!state.over && state.shot) {
        state.shot.x += state.shot.vx * dt / 16;
        state.shot.y += state.shot.vy * dt / 16;
        if (state.shot.x < cell * .28) { state.shot.x = cell * .28; state.shot.vx = Math.abs(state.shot.vx); }
        if (state.shot.x > w - cell * .28) { state.shot.x = w - cell * .28; state.shot.vx = -Math.abs(state.shot.vx); }
        if (state.shot.y < 18) settleShot(0, clamp(Math.round(state.shot.x / cell - .5), 0, state.cols - 1));
        else {
          outer: for (let r = 0; r < state.rows; r += 1) for (let c = 0; c < state.cols; c += 1) {
            const color = state.grid[r][c]; if (!color) continue;
            const cx = c * cell + cell / 2, cy = r * cell + cell / 2 + 12;
            if (Math.hypot(state.shot.x - cx, state.shot.y - cy) < cell * .58) { settleShot(r, c); break outer; }
          }
        }
      }
      const hud = body.querySelector('.arcadeHud');
      if (hud) hud.innerHTML = `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Combo', state.bestCombo || 0)}${gamesStatLine('Sjede', `${state.shots || 0}/${state.nextDropEvery || bubbleDropEvery()}`)}`;
      draw();
      state.raf = rakGameRequestFrame(state, loop);
    };
    state.raf = rakGameRequestFrame(state, loop);
    addCleanup(() => { cancelAnimationFrame(state.raf); canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('pointerup', pointerEnd); canvas.removeEventListener('pointercancel', pointerEnd); if (state.over) finishBubble(); });
    draw();
    setActiveState('bubble', state);
  }

  // Sudoku -----------------------------------------------------------------
  const SUDOKU_PUZZLES = [
    { difficulty: 'easy', label: 'Lehké', puzzle: ['530070000','600195000','098000060','800060003','400803001','700020006','060000280','000419005','000080079'], solution: ['534678912','672195348','198342567','859761423','426853791','713924856','961537284','287419635','345286179'] },
    { difficulty: 'medium', label: 'Střední', puzzle: ['003020600','900305001','001806400','008102900','700000008','006708200','002609500','800203009','005010300'], solution: ['483921657','967345821','251876493','548132976','729564138','136798245','372689514','814253769','695417382'] },
    { difficulty: 'hard', label: 'Těžké', puzzle: ['000000907','000420180','000705026','100904000','050000040','000507009','920108000','034059000','507000000'], solution: ['462831957','397426185','851795326','176984253','259673841','483517629','925148763','634259718','517362494'] }
  ];
  function createSudokuState(diff) {
    return { started: false, selected: diff || 'easy', startAt: 0, finished: false, solution: null, puzzle: null, entries: Array(81).fill(''), selectedCell: null, wrong: {} };
  }
  function renderSudoku(body) {
    const state = getState('sudoku', () => createSudokuState('easy'));
    const pick = SUDOKU_PUZZLES.find(p => p.difficulty === state.selected) || SUDOKU_PUZZLES[0];
    if (!state.started) {
      const diffBtns = SUDOKU_PUZZLES.map((p) => `<button type="button" class="gameControlBtn sudokuDifficultyBtn${state.selected === p.difficulty ? ' isActive' : ''}" data-sudoku-diff="${p.difficulty}"><strong>${p.label}</strong><span>Obtížnost</span></button>`).join('');
      body.innerHTML = `
        <div class="arcadeStage sudokuMenuStage">
          <div class="arcadePanel sudokuMenuCard">
            <div class="arcadeStatus"><strong>Sudoku</strong><br>Nejdřív zvol obtížnost. Hra se spustí až potom.</div>
            <div class="arcadeControls sudokuDifficultyMenu">${diffBtns}</div>
            <button type="button" class="gameControlBtn primary" data-sudoku-start="1">Spustit Sudoku</button>
          </div>
          ${gamesTop3Block(sudokuVariantId(state.selected), 's', 5, difficultyTopTitle(sudokuVariantId(state.selected))).replace('gamesTop5ScrollCard', 'gamesTop5ScrollCard arcadeTopScoreTight')}
        </div>`;
      body.querySelectorAll('[data-sudoku-diff]').forEach((btn) => btn.addEventListener('click', () => { state.selected = btn.dataset.sudokuDiff; renderSudoku(body); }));
      const startBtn = body.querySelector('[data-sudoku-start]');
      if (startBtn) startBtn.addEventListener('click', () => {
        const fresh = createSudokuState(state.selected);
        fresh.started = true;
        fresh.startAt = Date.now();
        window.app.gamesArcade['sudoku'] = fresh;
        renderSudoku(body);
      });
      setActiveState('sudoku', state);
      return;
    }
    if (!state.solution || !state.puzzle || state.puzzle.join('') !== pick.puzzle.join('')) {
      state.solution = pick.solution;
      state.puzzle = pick.puzzle;
      state.startAt = state.startAt || Date.now();
      state.finished = false;
      state.entries = Array(81).fill('');
      state.wrong = {};
      state.selectedCell = null;
    }
    const selectedIdx = Number.isFinite(state.selectedCell) ? state.selectedCell : -1;
    const gridHtml = pick.puzzle.map((row, r) => row.split('').map((v, c) => {
      const idx = r * 9 + c;
      const fixed = v !== '0';
      const entry = fixed ? v : String(state.entries[idx] || '');
      const cls = [
        'arcadeSudokuCell',
        fixed ? 'isFixed' : 'isOpen',
        selectedIdx === idx ? 'isSelected' : '',
        entry ? 'hasValue' : '',
        r % 3 === 0 ? 'sudokuBlockTop' : '',
        c % 3 === 0 ? 'sudokuBlockLeft' : '',
        r % 3 === 2 ? 'sudokuBlockBottom' : '',
        c % 3 === 2 ? 'sudokuBlockRight' : ''
      ].filter(Boolean).join(' ');
      return `<button type="button" class="${cls}" data-r="${r}" data-c="${c}" data-idx="${idx}" ${fixed ? 'aria-disabled="true"' : ''}>${entry}</button>`;
    }).join('')).join('');
    const selectedRow = selectedIdx >= 0 ? Math.floor(selectedIdx / 9) : 0;
    const selectedCol = selectedIdx >= 0 ? selectedIdx % 9 : 0;
    const picker = `<div class="sudokuNumberPicker sudokuNumberPickerDocked sudokuNumberPickerTwoRows${selectedIdx >= 0 ? ' isActive' : ''}">${[1,2,3,4,5,6,7,8,9].map(n => `<button type="button" data-sudoku-num="${n}">${n}</button>`).join('')}<button type="button" class="sudokuClearBtn" data-sudoku-num="clear">×</button></div>`;
    body.innerHTML = `
      <div class="arcadeStage sudokuGameStage">
        <div class="arcadeHud arcadeHudSingleLine sudokuHud">
          ${gamesStatLine('Obtížnost', pick.label || pick.difficulty)}
          ${gamesStatLine('Čas', fmtTime(state.startAt ? Date.now() - state.startAt : 0))}
        </div>
        <div class="arcadeControls sudokuGameControls sudokuGameControlsSingle sudokuRestartTop"><button type="button" class="gameControlBtn" data-sudoku-restart="1">Nová hra</button></div>
        <div class="arcadeBoard grid-9 arcadePanel arcadeLogicBoard arcadeSudokuPaper" id="sudokuGrid">${gridHtml}</div>
        ${picker}
      </div>`;
    const grid = body.querySelector('#sudokuGrid');
    const updateHud = () => {
      const hud = body.querySelector('.sudokuHud');
      if (hud) hud.innerHTML = `${gamesStatLine('Obtížnost', pick.label || pick.difficulty)}${gamesStatLine('Čas', fmtTime(Date.now() - state.startAt))}`;
    };
    const completeCheck = () => {
      const valid = pick.solution.every((row, r) => row.split('').every((val, c) => {
        const idx = r * 9 + c;
        return (pick.puzzle[r][c] !== '0' ? pick.puzzle[r][c] : String(state.entries[idx] || '')) === val;
      }));
      if (valid && !state.finished) {
        state.finished = true;
        const time = Date.now() - state.startAt;
        const sudokuBoardId = sudokuVariantId(state.selected);
        gamesRecordStat('sudoku', { completed: true, plays: 1, bestTimeMs: time, bestScore: encodePoints('sudoku', time), difficulty: state.selected, lastResult: `${pick.label || state.selected} · ${fmtTime(time)}` });
        gamesRecordStat(sudokuBoardId, { completed: true, plays: 1, bestTimeMs: time, bestScore: encodePoints(sudokuBoardId, time), difficulty: state.selected, lastResult: `${pick.label || state.selected} · ${fmtTime(time)}` });
        const done = body.querySelector('.sudokuGameControls');
        if (done) done.insertAdjacentHTML('beforebegin', `<div class="arcadeBar arcadePanel uPad10x12"><div class="arcadeStatus"><strong>Vyřešeno!</strong> Čas ${fmtTime(time)}.</div></div>`);
      }
      updateHud();
    };
    grid.querySelectorAll('.arcadeSudokuCell').forEach((cell) => {
      cell.addEventListener('click', () => {
        const idx = Number(cell.dataset.idx);
        const r = Number(cell.dataset.r), c = Number(cell.dataset.c);
        if (pick.puzzle[r][c] !== '0' || state.finished) return;
        state.selectedCell = idx;
        renderSudoku(body);
      });
    });
    body.querySelectorAll('[data-sudoku-num]').forEach((btn) => btn.addEventListener('click', () => {
      const idx = Number(state.selectedCell);
      if (!Number.isFinite(idx) || idx < 0 || state.finished) return;
      const r = Math.floor(idx / 9), c = idx % 9;
      if (pick.puzzle[r][c] !== '0') return;
      const val = btn.dataset.sudokuNum;
      if (val === 'clear') { state.entries[idx] = ''; delete state.wrong[idx]; renderSudoku(body); return; }
      state.entries[idx] = val;
      delete state.wrong[idx];
      renderSudoku(body);
      completeCheck();
    }));
    const restart = body.querySelector('[data-sudoku-restart]');
    if (restart) restart.addEventListener('click', () => { const fresh = createSudokuState(state.selected); window.app.gamesArcade['sudoku'] = fresh; renderSudoku(body); });
    setActiveState('sudoku', state);
  }

  // Minesweeper ------------------------------------------------------------
  function minesState() { return { w: 9, h: 9, mines: 10, opened: 0, over: false, win: false, startAt: Date.now(), board: [], revealed: [], flags: [], timer: 0 }; }
  function initMines(state) {
    state.board = Array.from({ length: state.h }, () => Array(state.w).fill(0));
    state.revealed = Array.from({ length: state.h }, () => Array(state.w).fill(false));
    state.flags = Array.from({ length: state.h }, () => Array(state.w).fill(false));
    state.over = false; state.win = false; state.opened = 0; state.startAt = Date.now(); state._saved = false;
    const spots = [];
    for (let y = 0; y < state.h; y += 1) for (let x = 0; x < state.w; x += 1) spots.push([x, y]);
    shuffle(spots).slice(0, state.mines).forEach(([x, y]) => { state.board[y][x] = -1; });
    for (let y = 0; y < state.h; y += 1) for (let x = 0; x < state.w; x += 1) if (state.board[y][x] !== -1) {
      let n = 0; for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) if (dx || dy) { const nx = x + dx, ny = y + dy; if (ny >= 0 && ny < state.h && nx >= 0 && nx < state.w && state.board[ny][nx] === -1) n += 1; }
      state.board[y][x] = n;
    }
  }
  function renderMines(body) {
    const state = getState('mines', () => { const s = minesState(); initMines(s); return s; });
    const score = Math.max(0, state.opened * 10 - (state.over ? 30 : 0));
    const cells = [];
    for (let y = 0; y < state.h; y += 1) for (let x = 0; x < state.w; x += 1) {
      const rev = state.revealed[y][x]; const val = state.board[y][x]; const flagged = state.flags && state.flags[y] && state.flags[y][x];
      let cls = 'arcadeCell minesCell'; let text = '';
      if (rev) { cls += ' isRevealed isFilled'; if (val === -1) { cls += ' isMine isExploded'; text = '💣'; } else { cls += val === 0 ? ' isZero' : ` isNum${val}`; text = val ? String(val) : ''; } }
      else if (flagged) { cls += ' isFlagged'; text = '🚩'; }
      cells.push(`<button type="button" class="${cls}" data-x="${x}" data-y="${y}" aria-label="${flagged ? 'Vlajka' : 'Pole'}">${text}</button>`);
    }
    body.innerHTML = `
      <div class="arcadeStage minesStage">
        <div class="arcadeHud arcadeHudSingleLine minesHud">${gamesStatLine('Score', score)}${gamesStatLine('Otevřeno', state.opened)}${gamesStatLine('Čas', fmtTime(Date.now() - state.startAt))}</div>
        <div class="arcadeBoard grid-9 arcadePanel arcadeLogicBoard arcadeMinesBoard" id="minesGrid">${cells.join('')}</div>
        <div class="arcadeControls"><button type="button" class="gameControlBtn" data-mines="restart">Nová hra</button></div>
        ${gamesTop3Block('mines', 'bodů', 5).replace('gamesTop5ScrollCard', 'gamesTop5ScrollCard arcadeTopScoreTight')}
      </div>`;
    const grid = body.querySelector('#minesGrid');
    if (grid) {
      grid.addEventListener('contextmenu', (ev) => { ev.preventDefault(); });
      grid.addEventListener('touchstart', (ev) => { if (ev.cancelable) ev.preventDefault(); }, { passive: false });
    }
    const revealAllMines = () => {
      for (let yy = 0; yy < state.h; yy += 1) for (let xx = 0; xx < state.w; xx += 1) if (state.board[yy][xx] === -1) state.revealed[yy][xx] = true;
    };
    const dig = (x, y) => {
      if (state.over || state.win) return;
      if (x < 0 || y < 0 || x >= state.w || y >= state.h || state.revealed[y][x]) return;
      if (state.flags && state.flags[y] && state.flags[y][x]) return;
      state.revealed[y][x] = true; state.opened += 1;
      if (state.board[y][x] === -1) { state.over = true; revealAllMines(); return; }
      if (state.board[y][x] === 0) {
        [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (ny >= 0 && ny < state.h && nx >= 0 && nx < state.w && !state.revealed[ny][nx]) dig(nx, ny); });
      }
      if (state.opened >= state.w * state.h - state.mines) { state.win = true; }
    };
    const toggleFlag = (x, y) => {
      if (state.over || state.win) return;
      if (x < 0 || y < 0 || x >= state.w || y >= state.h || state.revealed[y][x]) return;
      if (!state.flags || !state.flags[y]) state.flags = Array.from({ length: state.h }, () => Array(state.w).fill(false));
      state.flags[y][x] = !state.flags[y][x];
      if (typeof navigator !== 'undefined' && navigator.vibrate) { try { navigator.vibrate(state.flags[y][x] ? 18 : 8); } catch (_) {} }
    };
    grid.querySelectorAll('button').forEach((btn) => {
      let longPressTimer = null;
      let longPressDone = false;
      const clearLongPress = () => { if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; } };
      btn.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        longPressDone = false;
        const x = Number(btn.dataset.x), y = Number(btn.dataset.y);
        if (btn.setPointerCapture && ev.pointerId !== undefined) { try { btn.setPointerCapture(ev.pointerId); } catch (_) {} }
        clearLongPress();
        longPressTimer = setTimeout(() => {
          longPressDone = true;
          toggleFlag(x, y);
          renderMines(body);
        }, 430);
      });
      btn.addEventListener('pointerup', (ev) => {
        ev.preventDefault();
        clearLongPress();
        const x = Number(btn.dataset.x), y = Number(btn.dataset.y);
        if (!longPressDone) {
          dig(x, y);
          renderMines(body);
        }
      });
      btn.addEventListener('pointerleave', clearLongPress);
      btn.addEventListener('pointercancel', clearLongPress);
      btn.addEventListener('contextmenu', (ev) => { ev.preventDefault(); });
    });
    body.querySelector('[data-mines="restart"]').addEventListener('click', () => { const s = minesState(); initMines(s); window.app.gamesArcade['mines'] = s; renderMines(body); });
    if (state.over || state.win) {
      const time = Date.now() - state.startAt;
      const finalScore = Math.max(0, state.opened * 10 - (state.over && !state.win ? 30 : 0));
      if (!state._saved) {
        state._saved = true;
        const timeBonus = state.win ? Math.max(0, 900 - Math.floor(time / 1000)) : 0;
        const tableScore = finalScore + timeBonus + (state.win ? 250 : 0);
        gamesRecordStat('mines', {
          completed: true,
          plays: 1,
          bestTimeMs: state.win ? time : 0,
          bestScore: tableScore,
          score: tableScore,
          opened: state.opened,
          lastResult: state.win ? (String(tableScore) + ' bodů / ' + fmtTime(time)) : (String(finalScore) + ' bodů')
        });
      }
      const msg = state.win ? `<strong>Vyhrál jsi!</strong> Čas ${fmtTime(time)}.` : `<strong>Bum!</strong> Score ${finalScore} bodů.`;
      const controls = body.querySelector('.arcadeControls');
      if (controls) controls.insertAdjacentHTML('beforebegin', `<div class="arcadeBar arcadePanel uPad10x12"><div class="arcadeStatus">${msg}</div></div>`);
    }
    setActiveState('mines', state);
  }

  // Memory -----------------------------------------------------------------
  const MEMORY_SYMBOLS = ['🍀','⚡','⭐','🌙','🔥','💎','🎯','🧠','🚗','🌴','🛠️','🪐','🚀','🍒','🧩','🐺','🏆','🎲','🍉','🍕','🎧','📱','🧲','🪙','🦊','🐸','🦄','🐝','🌈','☄️','🛡️','🧊'];
  const MEMORY_DIFFICULTIES = [
    { size: 4, label: '4×4', subtitle: 'rychlá pauza' },
    { size: 6, label: '6×6', subtitle: 'klasika' },
    { size: 8, label: '8×8', subtitle: 'mozkovna' }
  ];
  function memoryState(size) { return { started: false, size: size || 6, deck: [], flipped: [], matched: new Set(), moves: 0, startAt: Date.now(), gameStartedAt: 0, over: false, lock: false, bestTimeMs: 0 }; }
  function initMemory(state) {
    const size = Math.max(4, Math.min(8, Number(state.size || 6) || 6));
    const total = size * size;
    const pairs = Math.floor(total / 2);
    const symbols = MEMORY_SYMBOLS.slice(0, pairs);
    state.size = size;
    state.deck = shuffle(symbols.concat(symbols));
    state.flipped = [];
    state.matched = new Set();
    state.moves = 0;
    state.startAt = Date.now();
    state.gameStartedAt = state.startAt;
    state.over = false;
    state.lock = false;
    state.started = true;
  }
  function renderMemory(body) {
    const state = getState('memory', () => memoryState(6));
    if (!state.started) {
      const buttons = MEMORY_DIFFICULTIES.map((d) => `<button type="button" class="gameControlBtn memoryDifficultyBtn${Number(state.size || 6) === d.size ? ' isActive' : ''}" data-memory-size="${d.size}"><strong>${d.label}</strong><span>${d.subtitle}</span></button>`).join('');
      body.innerHTML = `
        <div class="arcadeStage memoryMenuStage">
          <div class="arcadePanel memoryMenuCard">
            <div class="arcadeStatus"><strong>Pexeso</strong><br>Vyber velikost pole. Čím větší, tím těžší hra.</div>
            <div class="arcadeControls memoryDifficultyMenu">${buttons}</div>
            <button type="button" class="gameControlBtn primary" data-memory-start="1">Spustit Pexeso</button>
          </div>
          ${gamesTop3Block(memoryVariantId(state.size), 's', 5, difficultyTopTitle(memoryVariantId(state.size))).replace('gamesTop5ScrollCard', 'gamesTop5ScrollCard arcadeTopScoreTight')}
        </div>`;
      body.querySelectorAll('[data-memory-size]').forEach((btn) => btn.addEventListener('click', () => { state.size = Number(btn.dataset.memorySize) || 6; renderMemory(body); }));
      const startBtn = body.querySelector('[data-memory-start]');
      if (startBtn) startBtn.addEventListener('click', () => { const fresh = memoryState(Number(state.size || 6) || 6); initMemory(fresh); window.app.gamesArcade['memory'] = fresh; renderMemory(body); });
      setActiveState('memory', state);
      return;
    }
    if (!Array.isArray(state.deck) || !state.deck.length) initMemory(state);
    const size = Math.max(4, Math.min(8, Number(state.size || 6) || 6));
    const cells = state.deck.map((sym, i) => {
      const flipped = state.flipped.includes(i) || state.matched.has(i);
      const matched = state.matched.has(i);
      return `<button type="button" class="arcadeMemoryCard${flipped ? ' isFlipped' : ''}${matched ? ' isMatched' : ''}" data-i="${i}">${flipped ? sym : '·'}</button>`;
    }).join('');
    body.innerHTML = `
      <div class="arcadeStage memoryStage">
        <div class="arcadeHud arcadeHudSingleLine memoryHud">${gamesStatLine('Čas', fmtTime(Date.now() - state.startAt))}${gamesStatLine('Pohyby', state.moves)}${gamesStatLine('Páry', `${Math.floor(state.matched.size / 2)}/${Math.floor(state.deck.length / 2)}`)}</div>
        <div class="arcadeGridList grid-${size} arcadePanel arcadeMemoryBoard arcadeMemoryBoardLarge" id="memoryGrid">${cells}</div>
        <div class="arcadeControls"><button type="button" class="gameControlBtn" data-memory="restart">Nová hra</button></div>
      </div>`;
    const grid = body.querySelector('#memoryGrid');
    const finishIfDone = () => {
      if (state.matched.size >= state.deck.length && !state.over) {
        state.over = true;
        const totalTimeMs = Math.max(1, Date.now() - Number(state.gameStartedAt || state.startAt || Date.now()));
        state.bestTimeMs = totalTimeMs;
        const memoryBoardId = memoryVariantId(size);
        gamesRecordStat('memory', { completed: true, plays: 1, bestTimeMs: totalTimeMs, timeMs: totalTimeMs, elapsedMs: totalTimeMs, bestScore: encodePoints('memory', totalTimeMs), bestMoves: state.moves, bestSize: size, difficulty: `${size}x${size}`, lastResult: `${size}×${size} · ${fmtTime(totalTimeMs)} · ${state.moves} tahů` });
        gamesRecordStat(memoryBoardId, { completed: true, plays: 1, bestTimeMs: totalTimeMs, timeMs: totalTimeMs, elapsedMs: totalTimeMs, bestScore: encodePoints(memoryBoardId, totalTimeMs), bestMoves: state.moves, bestSize: size, difficulty: `${size}x${size}`, lastResult: `${size}×${size} · ${fmtTime(totalTimeMs)} · ${state.moves} tahů` });
        const controls = body.querySelector('.arcadeControls');
        if (controls) controls.insertAdjacentHTML('beforebegin', `<div class="arcadeBar arcadePanel uPad10x12"><div class="arcadeStatus"><strong>Vyhráno!</strong> ${fmtTime(state.bestTimeMs)} · ${state.moves} tahů · ${size}×${size}.</div></div>`);
      }
    };
    grid.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        if (state.lock || state.matched.has(i) || state.flipped.includes(i)) return;
        state.flipped.push(i);
        if (state.flipped.length === 2) {
          state.moves += 1;
          const [a, b] = state.flipped;
          if (state.deck[a] === state.deck[b]) {
            state.matched.add(a); state.matched.add(b); state.flipped = [];
            renderMemory(body);
            finishIfDone();
            return;
          } else {
            state.lock = true;
            setTimeout(() => { state.flipped = []; state.lock = false; renderMemory(body); }, 650);
          }
        }
        renderMemory(body);
      });
    });
    body.querySelector('[data-memory="restart"]').addEventListener('click', () => { const s = memoryState(Number(state.size || 6) || 6); window.app.gamesArcade['memory'] = s; renderMemory(body); });
    setActiveState('memory', state);
  }

  // Bomberman mini ---------------------------------------------------------

  function bomberState() {
    return {
      w: 11,
      h: 11,
      x: 1,
      y: 1,
      dir: 'right',
      score: 0,
      range: 1,
      maxBombs: 1,
      shield: 0,
      speed: 1,
      bombs: [],
      fires: [],
      map: [],
      upgrades: {},
      enemies: [],
      enemyStepMs: 620,
      enemyAcc: 0,
      kills: 0,
      crates: 0,
      upgradesCollected: 0,
      over: false,
      won: false,
      lastTs: 0,
      timer: 0,
      bound: false,
      saved: false,
      finalPainted: false,
      hint: 'Drž prst na bludišti a táhni jako joystick. Krátké klepnutí položí bombu.',
      touch: null,
      joystick: { active: false, pointerId: null, startX: 0, startY: 0, dirX: 0, dirY: 0, moved: false, stepAcc: 0, lastMoveAt: 0 }
    };
  }

  function bomberKey(x, y) { return `${x},${y}`; }
  function bomberIsInside(state, x, y) { return x >= 0 && y >= 0 && x < state.w && y < state.h; }
  function bomberHasBomb(state, x, y) { return state.bombs.some(b => b.x === x && b.y === y && !b.exploded); }
  function bomberIsBlocked(state, x, y, forEnemy) {
    if (!bomberIsInside(state, x, y)) return true;
    const cell = state.map[y] && state.map[y][x];
    if (cell === 'wall' || cell === 'brick') return true;
    if (forEnemy && bomberHasBomb(state, x, y)) return true;
    return false;
  }
  function bomberFreeCells(state) {
    const out = [];
    for (let y = 1; y < state.h - 1; y += 1) {
      for (let x = 1; x < state.w - 1; x += 1) {
        if (state.map[y][x] === 'brick') out.push({ x, y });
      }
    }
    return out;
  }
  function initBomber(state) {
    state.map = Array.from({ length: state.h }, (_, y) => Array.from({ length: state.w }, (_, x) => {
      if (x === 0 || y === 0 || x === state.w - 1 || y === state.h - 1) return 'wall';
      if (x % 2 === 0 && y % 2 === 0) return 'wall';
      return Math.random() < 0.48 ? 'brick' : '';
    }));
    const clear = [[1,1],[1,2],[2,1],[2,2],[1,9],[2,9],[1,8],[9,1],[8,1],[9,2],[9,9],[8,9],[9,8],[5,5],[5,6],[6,5]];
    clear.forEach(([x,y]) => { if (state.map[y]) state.map[y][x] = ''; });
    // Jemné chodby, aby to nebyl náhodný bordel, ale opravdové bludiště.
    for (let x = 1; x < state.w - 1; x += 1) if (x !== 4 && x !== 6) state.map[5][x] = '';
    for (let y = 1; y < state.h - 1; y += 1) if (y !== 4 && y !== 6) state.map[y][5] = '';
    state.x = 1; state.y = 1; state.dir = 'right';
    state.upgrades = {};
    const cells = bomberFreeCells(state).sort(() => Math.random() - 0.5);
    ['range','bomb','shield','speed','range','bomb','shield','score'].forEach((type, i) => {
      const c = cells[i * 2 + 1] || cells[i];
      if (c) state.upgrades[bomberKey(c.x, c.y)] = type;
    });
    const starts = [[9,9],[9,1],[1,9],[7,5]];
    state.enemies = starts.map((pos, i) => ({ id: `m${i}`, x: pos[0], y: pos[1], alive: true, mood: i % 2 ? 'chase' : 'wander' }));
    state.bombs = []; state.fires = []; state.score = 0; state.range = 1; state.maxBombs = 1; state.shield = 0; state.speed = 1;
    state.enemyStepMs = 620; state.enemyAcc = 0; state.kills = 0; state.crates = 0; state.upgradesCollected = 0;
    state.over = false; state.won = false; state.saved = false; state.finalPainted = false; state.lastTs = 0; state.hint = 'Drž prst na bludišti a táhni jako joystick. Klepnutí položí bombu.'; state.touch = null; state.joystick = { active: false, pointerId: null, startX: 0, startY: 0, dirX: 0, dirY: 0, moved: false, stepAcc: 0, lastMoveAt: 0 };
  }
  function bomberUpgradeLabel(type) {
    return type === 'range' ? '🔥' : type === 'bomb' ? '💣' : type === 'shield' ? '🛡️' : type === 'speed' ? '⚡' : '⭐';
  }
  function bomberApplyUpgrade(state, type) {
    state.upgradesCollected += 1;
    if (type === 'range') { state.range = Math.min(4, state.range + 1); state.hint = 'Plamen je delší.'; }
    else if (type === 'bomb') { state.maxBombs = Math.min(3, state.maxBombs + 1); state.hint = 'Můžeš mít víc bomb najednou.'; }
    else if (type === 'shield') { state.shield = Math.min(3, state.shield + 1); state.hint = 'Štít tě jednou ochrání.'; }
    else if (type === 'speed') { state.speed = Math.min(2, state.speed + 0.25); state.enemyStepMs = Math.max(430, state.enemyStepMs - 40); state.hint = 'Pohyb reaguje svižněji.'; }
    else { state.score += 120; state.hint = 'Bonusové body.'; }
    state.score += 35;
  }
  function bomberDamagePlayer(state) {
    if (state.over) return;
    if (state.shield > 0) { state.shield -= 1; state.hint = 'Štít tě zachránil.'; return; }
    state.over = true; state.won = false; state.hint = 'Příšerka tě dostala.';
  }
  function renderBomber(body, opts) {
    const isChallenge = !!(opts && opts.challenge);
    const stateId = isChallenge ? 'daily_bomber' : 'bomber';
    const statId = isChallenge ? 'daily' : 'bomber';
    const state = getState(stateId, () => { const s = bomberState(); initBomber(s); return s; });
    state.challenge = isChallenge;
    // v.1.5 (770): Denní výzva může spustit Bombermana do stejného shell body jako Daily.
    // Starý bound stav z běžného Bombermana by jinak nechal ovládání navázané na původní DOM.
    if (state.bound && (state.boundBody !== body || state.boundGameId !== stateId)) {
      state.bound = false;
      state.boundBody = null;
      state.boundGameId = '';
    }
    const cellClass = (x, y) => {
      let cls = 'arcadeBomberCell';
      if (state.map[y][x] === 'wall') cls += ' wall';
      if (state.map[y][x] === 'brick') cls += ' brick';
      if (state.fires.some(f => f.x === x && f.y === y && f.life > 0)) cls += ' fire';
      if (state.x === x && state.y === y) cls += ' isTarget';
      return cls;
    };
    const cellsHtml = () => {
      let out = '';
      for (let y = 0; y < state.h; y += 1) {
        for (let x = 0; x < state.w; x += 1) out += `<div class="${cellClass(x, y)}" data-x="${x}" data-y="${y}"></div>`;
      }
      return out;
    };
    const dynamicEntityHtml = () => {
      const items = [];
      Object.keys(state.upgrades || {}).forEach((k) => {
        const [x, y] = k.split(',').map(Number);
        if (state.map[y] && state.map[y][x] === '') items.push(`<div class="bomberEntity upgrade" style="--x:${x};--y:${y};">${bomberUpgradeLabel(state.upgrades[k])}</div>`);
      });
      state.bombs.filter(b => !b.exploded).forEach(b => items.push(`<div class="bomberEntity bomb" style="--x:${b.x};--y:${b.y};">💣</div>`));
      state.fires.filter(f => f.life > 0).forEach(f => items.push(`<div class="bomberEntity fire" style="--x:${f.x};--y:${f.y};">✦</div>`));
      state.enemies.filter(e => e.alive).forEach((e, i) => items.push(`<div class="bomberEntity monster m${i}" style="--x:${e.x};--y:${e.y};">${i === 0 ? '👾' : i === 1 ? '🛸' : i === 2 ? '🦑' : '👻'}</div>`));
      return items.join('');
    };
    const playerClass = () => 'bomberEntity player' + (state.dir === 'left' ? ' isLeft' : state.dir === 'right' ? ' isRight' : state.dir === 'up' ? ' isUp' : ' isDown');
    const playerHtml = () => `<div class="${playerClass()}" id="bomberPlayer" style="--x:${state.x};--y:${state.y};"><span class="bomberHero" aria-hidden="true"><span class="bomberHeroHead"></span><span class="bomberHeroBody"></span><span class="bomberHeroArm a1"></span><span class="bomberHeroArm a2"></span></span></div>`;
    const boardHtml = () => `<div class="arcadeBomberCells">${cellsHtml()}</div><div class="arcadeBomberEntities"><div class="bomberDynamicEntities">${dynamicEntityHtml()}</div>${playerHtml()}</div>`;
    const hudHtml = () => `${gamesStatLine('Score', state.score)}${gamesStatLine('Příšerky', state.enemies.filter(e => e.alive).length)}${gamesStatLine('Bomby', `${state.bombs.filter(b => !b.exploded).length}/${state.maxBombs}`)}${gamesStatLine('Síla', state.range)}`;
    const resultHtml = () => state.over ? `<div class="bomberResultOverlay isVisible"><div class="bomberResultCard"><strong>${state.won ? 'Vyčištěno' : 'Konec hry'}</strong><span>${state.won ? 'Zničil jsi všechny příšerky.' : 'Příšerka tě dostala.'}</span><div class="bomberResultStats">Score ${state.score} · příšerky ${state.kills}/4 · bedny ${state.crates} · upgrady ${state.upgradesCollected}</div><button type="button" class="gameControlBtn" data-bomber="restart">Nová hra</button></div></div>` : '';
    const paint = () => {
      const hud = body.querySelector('.bomberHud'); if (hud) hud.innerHTML = hudHtml();
      const overlay = body.querySelector('.bomberResultMount');
      if (overlay) {
        overlay.innerHTML = resultHtml();
        const restartBtn = overlay.querySelector('[data-bomber="restart"]');
        if (restartBtn && !restartBtn.dataset.boundRestart) {
          restartBtn.dataset.boundRestart = '1';
          const restartAction = (ev) => { ev.preventDefault(); ev.stopPropagation(); resetBomberGame(); };
          restartBtn.addEventListener('pointerdown', restartAction, { passive: false });
          restartBtn.addEventListener('click', restartAction);
        }
      }
      const board = body.querySelector('#bomberGrid');
      if (board) {
        const cells = board.querySelector('.arcadeBomberCells');
        const dynamic = board.querySelector('.bomberDynamicEntities');
        let player = board.querySelector('#bomberPlayer');
        if (!cells || !dynamic || !player) {
          board.innerHTML = boardHtml();
          player = board.querySelector('#bomberPlayer');
        } else {
          cells.innerHTML = cellsHtml();
          dynamic.innerHTML = dynamicEntityHtml();
        }
        if (player) {
          player.className = playerClass();
          player.style.setProperty('--x', String(state.x));
          player.style.setProperty('--y', String(state.y));
        }
      }
      const status = body.querySelector('.bomberStatus');
      if (status) status.innerHTML = state.over ? (state.won ? 'Vyčištěno. Příšerky jsou pryč.' : 'Konec hry. Zkus to znovu.') : state.hint;
    };
    const draw = () => {
      body.innerHTML = `
        <div class="arcadeStage bomberStage">
          <div class="arcadeHud arcadeHudSingleLine bomberHud">${hudHtml()}</div>
          <div class="arcadeBar arcadePanel uPad10x12"><div class="arcadeStatus bomberStatus">${state.hint}</div></div>
          <div class="arcadeBomberBoard arcadePanel" id="bomberGrid">${boardHtml()}<div class="bomberResultMount">${resultHtml()}</div></div>
          ${gamesTop3Block(statId, 'bodů', 5).replace('gamesTop5ScrollCard', 'gamesTop5ScrollCard arcadeTopScoreTight')}
        </div>`;
      bindButtons();
    };
    const checkCollect = () => {
      const k = bomberKey(state.x, state.y);
      if (state.upgrades && state.upgrades[k] && state.map[state.y][state.x] === '') {
        const type = state.upgrades[k]; delete state.upgrades[k]; bomberApplyUpgrade(state, type);
      }
    };
    const checkHits = () => {
      if (state.fires.some(f => f.life > 0 && f.x === state.x && f.y === state.y)) bomberDamagePlayer(state);
      if (state.enemies.some(e => e.alive && e.x === state.x && e.y === state.y)) bomberDamagePlayer(state);
      state.enemies.forEach((e) => {
        if (e.alive && state.fires.some(f => f.life > 0 && f.x === e.x && f.y === e.y)) { e.alive = false; state.kills += 1; state.score += 250; state.hint = 'Příšerka zničená.'; }
      });
      if (!state.over && state.enemies.every(e => !e.alive)) { state.over = true; state.won = true; state.score += 500; state.hint = 'Vyčištěno. Všechny příšerky jsou pryč.'; }
    };
    const move = (dx, dy) => {
      if (state.over) return false;
      if (dx < 0) state.dir = 'left'; else if (dx > 0) state.dir = 'right'; else if (dy < 0) state.dir = 'up'; else if (dy > 0) state.dir = 'down';
      const nx = clamp(state.x + dx, 1, state.w - 2);
      const ny = clamp(state.y + dy, 1, state.h - 2);
      if (!bomberIsBlocked(state, nx, ny, false) && !bomberHasBomb(state, nx, ny)) {
        state.x = nx;
        state.y = ny;
        checkCollect();
        checkHits();
        paint();
        return true;
      }
      paint();
      return false;
    };
    const placeBomb = () => {
      if (state.over) return;
      if (state.bombs.filter(b => !b.exploded).length >= state.maxBombs) { state.hint = 'Další bomba až po výbuchu.'; paint(); return; }
      if (bomberHasBomb(state, state.x, state.y)) return;
      state.bombs.push({ x: state.x, y: state.y, life: 1500, exploded: false });
      state.hint = 'Bomba položena. Pryč od ní.';
      paint();
    };
    const addBlast = (x, y) => { state.fires.push({ x, y, life: 380 }); };
    const explode = (bomb) => {
      if (bomb.exploded) return;
      bomb.exploded = true;
      addBlast(bomb.x, bomb.y);
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx, dy]) => {
        for (let step = 1; step <= state.range; step += 1) {
          const x = bomb.x + dx * step, y = bomb.y + dy * step;
          if (!bomberIsInside(state, x, y) || state.map[y][x] === 'wall') break;
          addBlast(x, y);
          if (state.map[y][x] === 'brick') { state.map[y][x] = ''; state.crates += 1; state.score += 45; break; }
        }
      });
      state.score += 10;
      checkHits();
    };
    const enemyDirs = (enemy) => {
      const towardX = state.x > enemy.x ? 1 : state.x < enemy.x ? -1 : 0;
      const towardY = state.y > enemy.y ? 1 : state.y < enemy.y ? -1 : 0;
      const pref = Math.abs(state.x - enemy.x) >= Math.abs(state.y - enemy.y) ? [[towardX,0],[0,towardY]] : [[0,towardY],[towardX,0]];
      return pref.concat([[1,0],[-1,0],[0,1],[0,-1]].sort(() => Math.random() - .5)).filter(([dx,dy]) => dx || dy);
    };
    const stepEnemies = () => {
      state.enemies.forEach((e) => {
        if (!e.alive) return;
        const dirs = enemyDirs(e);
        for (const [dx, dy] of dirs) {
          const nx = e.x + dx, ny = e.y + dy;
          if (!bomberIsBlocked(state, nx, ny, true) && !state.enemies.some(o => o !== e && o.alive && o.x === nx && o.y === ny)) { e.x = nx; e.y = ny; break; }
        }
      });
      checkHits();
    };
    const keyHandler = (ev) => {
      if (['INPUT','TEXTAREA','SELECT'].includes((ev.target && ev.target.tagName) || '')) return;
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); move(-1, 0); }
      else if (ev.key === 'ArrowRight') { ev.preventDefault(); move(1, 0); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); move(0, -1); }
      else if (ev.key === 'ArrowDown') { ev.preventDefault(); move(0, 1); }
      else if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); placeBomb(); }
    };
    const resetBomberGame = () => {
      const keepBoundBody = state.boundBody || body;
      Object.assign(state, bomberState());
      initBomber(state);
      state.challenge = isChallenge;
      state.bound = true;
      state.boundBody = keepBoundBody;
      state.boundGameId = stateId;
      draw();
    };
    const bindButtons = () => {
      if (state.bound && state.boundBody === body && state.boundGameId === stateId) return;
      state.bound = true;
      state.boundBody = body;
      state.boundGameId = stateId;
      document.addEventListener('keydown', keyHandler);
      body.addEventListener('pointerdown', (ev) => {
        const btn = ev.target && ev.target.closest ? ev.target.closest('[data-bomber="restart"]') : null;
        if (!btn) return;
        ev.preventDefault();
        ev.stopPropagation();
        resetBomberGame();
      }, { passive: false, capture: true });
      body.addEventListener('pointerdown', (ev) => {
        if (ev.target && ev.target.closest && ev.target.closest('[data-bomber]')) return;
        const grid = ev.target && ev.target.closest ? ev.target.closest('#bomberGrid') : null;
        if (!grid || state.over) return;
        ev.preventDefault();
        try { grid.setPointerCapture && grid.setPointerCapture(ev.pointerId); } catch (err) {}
        state.touch = { x: ev.clientX, y: ev.clientY, moved: false };
        state.joystick = { active: true, pointerId: ev.pointerId, startX: ev.clientX, startY: ev.clientY, dirX: 0, dirY: 0, moved: false, stepAcc: 0, lastMoveAt: 0 };
        state.hint = 'Držíš joystick. Táhni prstem do směru pohybu.';
        paint();
      }, { passive: false });
      body.addEventListener('pointermove', (ev) => {
        const joy = state.joystick || {};
        if (!joy.active || (joy.pointerId !== null && typeof joy.pointerId !== 'undefined' && ev.pointerId !== joy.pointerId)) return;
        ev.preventDefault();
        const dx = ev.clientX - joy.startX;
        const dy = ev.clientY - joy.startY;
        const ax = Math.abs(dx), ay = Math.abs(dy);
        const deadZone = Math.max(10, 18 - Math.round((state.speed - 1) * 4));
        if (Math.max(ax, ay) < deadZone) {
          joy.dirX = 0; joy.dirY = 0;
          return;
        }
        joy.moved = true;
        if (state.touch) state.touch.moved = true;
        const prevX = joy.dirX || 0;
        const prevY = joy.dirY || 0;
        if (ax >= ay) { joy.dirX = dx > 0 ? 1 : -1; joy.dirY = 0; }
        else { joy.dirX = 0; joy.dirY = dy > 0 ? 1 : -1; }
        if (prevX !== joy.dirX || prevY !== joy.dirY) joy.stepAcc = Math.max(Number(joy.stepAcc || 0), 130);
        if (joy.dirX < 0) state.dir = 'left'; else if (joy.dirX > 0) state.dir = 'right'; else if (joy.dirY < 0) state.dir = 'up'; else if (joy.dirY > 0) state.dir = 'down';
        paint();
      }, { passive: false });
      const stopJoystick = (ev) => {
        const grid = ev.target && ev.target.closest ? ev.target.closest('#bomberGrid') : null;
        const joy = state.joystick || {};
        if (joy.active && (joy.pointerId === null || typeof joy.pointerId === 'undefined' || ev.pointerId === joy.pointerId)) {
          if (state.touch && grid && !state.touch.moved) { ev.preventDefault(); placeBomb(); }
          joy.active = false; joy.dirX = 0; joy.dirY = 0; joy.pointerId = null; joy.stepAcc = 0;
          state.touch = null;
          state.hint = state.over ? state.hint : 'Drž prst a táhni jako joystick. Klepnutí položí bombu.';
          paint();
        }
      };
      body.addEventListener('pointerup', stopJoystick, { passive: false });
      body.addEventListener('pointercancel', stopJoystick, { passive: false });
      body.addEventListener('contextmenu', (ev) => { if (ev.target && ev.target.closest && ev.target.closest('#bomberGrid')) ev.preventDefault(); });
      body.addEventListener('click', (ev) => {
        const btn = ev.target && ev.target.closest ? ev.target.closest('[data-bomber]') : null;
        if (!btn) return;
        if (btn.dataset.bomber === 'restart') {
          resetBomberGame();
        }
      });
    };
    const saveResult = () => {
      if (state.saved) return;
      state.saved = true;
      gamesRecordStat(statId, {
        completed: true,
        plays: 1,
        bestScore: state.score,
        bestEnemiesKilled: state.kills,
        bestCrates: state.crates,
        bestPowerUps: state.upgradesCollected,
        perfectClears: state.won ? 1 : 0,
        lastResult: state.won ? `${state.score} / výhra` : String(state.score)
      });
    };
    const loop = () => {
      if (!rakGameShouldTick()) return;
      const now = Date.now();
      const dt = state.lastTs ? Math.min(260, now - state.lastTs) : 120;
      state.lastTs = now;
      if (!state.over) {
        const joy = state.joystick || {};
        if (joy.active && (joy.dirX || joy.dirY)) {
          joy.stepAcc = Number(joy.stepAcc || 0) + dt;
          const stepMs = Math.max(118, Math.round(210 - ((Number(state.speed || 1) - 1) * 42)));
          if (joy.stepAcc >= stepMs) {
            joy.stepAcc = 0;
            move(joy.dirX, joy.dirY);
          }
        }
        state.bombs.forEach((b) => { b.life -= dt; if (b.life <= 0 && !b.exploded) explode(b); });
        state.bombs = state.bombs.filter(b => !b.exploded || b.life > -260);
        state.fires.forEach(f => { f.life -= dt; });
        state.fires = state.fires.filter(f => f.life > 0);
        state.enemyAcc += dt;
        if (state.enemyAcc >= state.enemyStepMs) { state.enemyAcc = 0; stepEnemies(); }
        checkHits();
      }
      if (state.over) {
        saveResult();
        if (!state.finalPainted) { state.finalPainted = true; paint(); }
        return;
      }
      paint();
    };
    draw();
    if (!state.timer) state.timer = rakGameSetInterval(loop, rakGameIsLadaMode() ? 160 : 105);
    addCleanup(() => {
      clearInterval(state.timer);
      state.timer = 0;
      document.removeEventListener('keydown', keyHandler);
      if (state.boundBody === body && state.boundGameId === stateId) {
        state.bound = false;
        state.boundBody = null;
        state.boundGameId = '';
      }
      if (state.over) saveResult();
    });
    setActiveState(isChallenge ? 'daily' : 'bomber', state);
  }


  // Lodě online -----------------------------------------------------------
  const SHIPS_SIZE = 10;
  const SHIPS_FLEET = [
    { id: 'carrier', len: 5, name: 'Letadlová loď', icon: '🛳️' },
    { id: 'battleship', len: 4, name: 'Bitevní loď', icon: '🚢' },
    { id: 'cruiser', len: 3, name: 'Křižník', icon: '⛴️' },
    { id: 'submarine', len: 3, name: 'Ponorka', icon: '🛥️' },
    { id: 'destroyer', len: 2, name: 'Torpédoborec', icon: '🚤' }
  ];

  function shipsCellKey(r, c) { return String(r) + ':' + String(c); }
  function shipsHasCell(list, r, c) {
    return Array.isArray(list) && list.some((cell) => Number(cell && cell[0]) === r && Number(cell && cell[1]) === c);
  }
  function shipsRandomCode() {
    let out = '';
    for (let i = 0; i < 4; i += 1) out += String(Math.floor(Math.random() * 10));
    return out;
  }
  function shipsAccountId() {
    try {
      const acc = typeof gamesGetActiveAccount === 'function' ? gamesGetActiveAccount() : null;
      return String(acc && acc.id ? acc.id : '').trim();
    } catch (err) { return ''; }
  }
  function shipsAccountName() {
    try {
      const acc = typeof gamesGetActiveAccount === 'function' ? gamesGetActiveAccount() : null;
      return String(acc && acc.name ? acc.name : (acc && acc.id ? acc.id : 'Hráč')).trim() || 'Hráč';
    } catch (err) { return 'Hráč'; }
  }
  function shipsEmptyPlayerBoard() { return { ships: [], shots: [], sunk: 0 }; }
  function shipsFleetCells(player) {
    const set = new Set();
    (player && Array.isArray(player.ships) ? player.ships : []).forEach((ship) => {
      (Array.isArray(ship.cells) ? ship.cells : []).forEach((cell) => set.add(shipsCellKey(Number(cell[0]), Number(cell[1]))));
    });
    return set;
  }
  function shipsFindShipAt(player, r, c) {
    const ships = player && Array.isArray(player.ships) ? player.ships : [];
    return ships.find((ship) => shipsHasCell(ship.cells, r, c)) || null;
  }
  function shipsShotAt(playerOrShots, r, c) {
    const shots = Array.isArray(playerOrShots) ? playerOrShots : (playerOrShots && Array.isArray(playerOrShots.shots) ? playerOrShots.shots : []);
    return shots.find((shot) => Number(shot.r) === r && Number(shot.c) === c) || null;
  }
  function shipsShipSunk(ship) {
    return !!(ship && Array.isArray(ship.cells) && ship.cells.length && Array.isArray(ship.hits) && ship.hits.length >= ship.cells.length);
  }
  function shipsCellsForPlacement(r, c, len, horizontal) {
    const cells = [];
    for (let i = 0; i < len; i += 1) cells.push([r + (horizontal ? 0 : i), c + (horizontal ? i : 0)]);
    return cells;
  }
  function shipsCanPlaceAgainstShips(ships, r, c, len, horizontal, ignoreId) {
    const cells = shipsCellsForPlacement(r, c, len, horizontal);
    if (cells.some(([rr, cc]) => rr < 0 || cc < 0 || rr >= SHIPS_SIZE || cc >= SHIPS_SIZE)) return false;
    const occupied = new Set();
    (Array.isArray(ships) ? ships : []).forEach((ship) => {
      if (ignoreId && String(ship.id || '') === String(ignoreId)) return;
      (Array.isArray(ship.cells) ? ship.cells : []).forEach((cell) => occupied.add(shipsCellKey(Number(cell[0]), Number(cell[1]))));
    });
    for (const [rr, cc] of cells) {
      for (let ar = rr - 1; ar <= rr + 1; ar += 1) {
        for (let ac = cc - 1; ac <= cc + 1; ac += 1) {
          if (ar >= 0 && ac >= 0 && ar < SHIPS_SIZE && ac < SHIPS_SIZE && occupied.has(shipsCellKey(ar, ac))) return false;
        }
      }
    }
    return true;
  }
  function shipsCanPlace(grid, r, c, len, horizontal) {
    for (let i = 0; i < len; i += 1) {
      const rr = r + (horizontal ? 0 : i);
      const cc = c + (horizontal ? i : 0);
      if (rr < 0 || cc < 0 || rr >= SHIPS_SIZE || cc >= SHIPS_SIZE) return false;
      for (let ar = rr - 1; ar <= rr + 1; ar += 1) {
        for (let ac = cc - 1; ac <= cc + 1; ac += 1) {
          if (ar >= 0 && ac >= 0 && ar < SHIPS_SIZE && ac < SHIPS_SIZE && grid[ar][ac]) return false;
        }
      }
    }
    return true;
  }
  function shipsBuildPlayerBoard() {
    const grid = Array.from({ length: SHIPS_SIZE }, () => Array(SHIPS_SIZE).fill(false));
    const ships = [];
    SHIPS_FLEET.forEach((def, idx) => {
      let placed = false;
      for (let tries = 0; tries < 900 && !placed; tries += 1) {
        const horizontal = Math.random() > 0.5;
        const r = Math.floor(Math.random() * (horizontal ? SHIPS_SIZE : (SHIPS_SIZE - def.len + 1)));
        const c = Math.floor(Math.random() * (horizontal ? (SHIPS_SIZE - def.len + 1) : SHIPS_SIZE));
        if (!shipsCanPlace(grid, r, c, def.len, horizontal)) continue;
        const cells = shipsCellsForPlacement(r, c, def.len, horizontal);
        cells.forEach(([rr, cc]) => { grid[rr][cc] = true; });
        ships.push({ id: def.id || ('s' + idx), name: def.name, icon: def.icon, len: def.len, horizontal, cells, hits: [] });
        placed = true;
      }
    });
    return { ships, shots: [], sunk: 0 };
  }
  function shipsNormalizePlayerBoard(player) {
    const board = player && typeof player === 'object' ? Object.assign({}, player) : shipsEmptyPlayerBoard();
    board.shots = Array.isArray(board.shots) ? board.shots : [];
    board.ships = Array.isArray(board.ships) ? board.ships.map((ship, idx) => {
      const def = SHIPS_FLEET.find((x) => String(x.id) === String(ship.id)) || SHIPS_FLEET[idx] || { id: 's' + idx, len: Number(ship.len || 1), name: 'Loď', icon: '🚢' };
      const cells = Array.isArray(ship.cells) ? ship.cells.map((cell) => [Number(cell[0]), Number(cell[1])]).filter(([r, c]) => Number.isFinite(r) && Number.isFinite(c)) : [];
      return {
        id: String(ship.id || def.id || ('s' + idx)),
        name: String(ship.name || def.name || 'Loď'),
        icon: String(ship.icon || def.icon || '🚢'),
        len: Number(ship.len || def.len || cells.length || 1),
        horizontal: typeof ship.horizontal === 'boolean' ? ship.horizontal : (cells.length > 1 ? Number(cells[0][0]) === Number(cells[cells.length - 1][0]) : true),
        cells,
        hits: Array.isArray(ship.hits) ? ship.hits.map((cell) => [Number(cell[0]), Number(cell[1])]) : []
      };
    }) : [];
    return board;
  }
  function shipsValidateFleet(player) {
    const board = shipsNormalizePlayerBoard(player);
    if (board.ships.length !== SHIPS_FLEET.length) return false;
    const sortedHave = board.ships.map((ship) => Number(ship.len || (ship.cells || []).length)).sort((a, b) => b - a).join(',');
    const sortedNeed = SHIPS_FLEET.map((ship) => ship.len).sort((a, b) => b - a).join(',');
    if (sortedHave !== sortedNeed) return false;
    const occupied = new Set();
    for (const ship of board.ships) {
      if (!Array.isArray(ship.cells) || ship.cells.length !== Number(ship.len)) return false;
      for (const [r, c] of ship.cells) {
        if (r < 0 || c < 0 || r >= SHIPS_SIZE || c >= SHIPS_SIZE) return false;
        const key = shipsCellKey(r, c);
        if (occupied.has(key)) return false;
        occupied.add(key);
      }
    }
    for (let i = 0; i < board.ships.length; i += 1) {
      const ship = board.ships[i];
      for (const [r, c] of ship.cells) {
        for (let ar = r - 1; ar <= r + 1; ar += 1) {
          for (let ac = c - 1; ac <= c + 1; ac += 1) {
            if (ar < 0 || ac < 0 || ar >= SHIPS_SIZE || ac >= SHIPS_SIZE) continue;
            const other = shipsFindShipAt(board, ar, ac);
            if (other && String(other.id) !== String(ship.id)) return false;
          }
        }
      }
    }
    return true;
  }
  function shipsPlaceShip(player, def, r, c, horizontal) {
    const board = shipsNormalizePlayerBoard(player);
    if (!def || !shipsCanPlaceAgainstShips(board.ships, r, c, def.len, horizontal, def.id)) return { ok: false, board };
    const cells = shipsCellsForPlacement(r, c, def.len, horizontal);
    const nextShip = { id: def.id, name: def.name, icon: def.icon, len: def.len, horizontal: !!horizontal, cells, hits: [] };
    board.ships = board.ships.filter((ship) => String(ship.id) !== String(def.id));
    board.ships.push(nextShip);
    board.ships.sort((a, b) => SHIPS_FLEET.findIndex(x => x.id === a.id) - SHIPS_FLEET.findIndex(x => x.id === b.id));
    return { ok: true, board };
  }
  function shipsFreshState(code, xAccount) {
    return {
      gameType: 'battleship',
      code: String(code || '').replace(/\D/g, '').slice(0, 4),
      status: 'waiting',
      turn: 'X',
      winner: '',
      playerXAccountNumber: xAccount || null,
      playerOAccountNumber: null,
      xReady: false,
      oReady: false,
      x: shipsBuildPlayerBoard(),
      o: null,
      revision: 1,
      message: 'Připrav si flotilu. Lodě už leží na mapě, můžeš je přehazovat nebo přesouvat přímo v poli.'
    };
  }
  function shipsNormalizeState(raw, code) {
    const st = raw && typeof raw === 'object' ? Object.assign({}, raw) : shipsFreshState(code, shipsAccountId());
    st.gameType = 'battleship';
    st.code = String(st.code || code || '').replace(/\D/g, '').slice(0, 4);
    st.status = st.status || 'waiting';
    st.turn = st.turn === 'O' ? 'O' : 'X';
    st.playerXAccountNumber = st.playerXAccountNumber || null;
    st.playerOAccountNumber = st.playerOAccountNumber || null;
    st.x = shipsNormalizePlayerBoard(st.x && Array.isArray(st.x.ships) ? st.x : shipsBuildPlayerBoard());
    st.o = st.o && Array.isArray(st.o.ships) ? shipsNormalizePlayerBoard(st.o) : null;
    st.xReady = !!st.xReady;
    st.oReady = !!st.oReady;
    if (st.status !== 'finished' && st.o && st.xReady && st.oReady) st.status = 'active';
    if (st.status === 'active' && (!st.xReady || !st.oReady || !st.o)) st.status = st.o ? 'placing' : 'waiting';
    st.revision = Number(st.revision || 1) || 1;
    return st;
  }
  function shipsRoleForState(st) {
    const account = shipsAccountId();
    if (account && String(st.playerXAccountNumber || '') === account) return 'X';
    if (account && String(st.playerOAccountNumber || '') === account) return 'O';
    return '';
  }
  function shipsAllSunk(player) {
    const ships = player && Array.isArray(player.ships) ? player.ships : [];
    return ships.length > 0 && ships.every((ship) => shipsShipSunk(ship));
  }
  function shipsRenderShipSegment(ship, r, c, shot, options) {
    const cells = Array.isArray(ship && ship.cells) ? ship.cells : [];
    const idx = cells.findIndex((cell) => Number(cell[0]) === r && Number(cell[1]) === c);
    const len = Math.max(1, cells.length || Number(ship && ship.len || 1));
    const horizontal = typeof ship.horizontal === 'boolean' ? ship.horizontal : (len > 1 ? Number(cells[0] && cells[0][0]) === Number(cells[len - 1] && cells[len - 1][0]) : true);
    let pos = 'mid';
    if (idx === 0) pos = 'bow';
    else if (idx === len - 1) pos = 'stern';
    const idClass = 'isShip' + String(ship && ship.id ? ship.id : 'boat').replace(/[^a-z0-9]+/gi, '').replace(/^./, (m) => m.toUpperCase());
    const hitClass = shot && shot.hit ? ' isDamaged' : '';
    const selectedClass = options && String(options.selectedShipId || '') === String(ship && ship.id || '') ? ' isSelectedShip' : '';
    const label = idx === Math.floor((len - 1) / 2) ? `<span class="shipsShipCabin">${escapeHtml(String(ship.icon || '🚢'))}</span>` : '<span class="shipsShipDeck"></span>';
    return `<span class="shipsShipSegment ${horizontal ? 'isH' : 'isV'} ${idClass} isLen${len} is${pos.charAt(0).toUpperCase() + pos.slice(1)}${hitClass}${selectedClass}" aria-hidden="true">${label}</span>`;
  }
  function shipsRenderBoard(player, opts) {
    const options = opts || {};
    const board = shipsNormalizePlayerBoard(player || {});
    const shots = Array.isArray(options.shots) ? options.shots : board.shots;
    const rows = [];
    for (let r = 0; r < SHIPS_SIZE; r += 1) {
      for (let c = 0; c < SHIPS_SIZE; c += 1) {
        const shot = shipsShotAt(shots, r, c);
        const ship = shipsFindShipAt(board, r, c);
        const sunkShip = ship && shipsShipSunk(ship);
        const revealShip = !!(ship && (options.own || options.placement || sunkShip || (shot && shot.hit)));
        let cls = 'shipsCell';
        let txt = '';
        if (revealShip) cls += ' hasShip' + (sunkShip ? ' isSunkShip' : '') + (options.selectedShipId && ship && String(ship.id) === String(options.selectedShipId) ? ' isSelectedShipCell' : '');
        if (shot) cls += shot.hit ? ' isHit' : ' isMiss';
        if (options.enemy && shot) cls += ' isDisabled';
        if (revealShip) txt += shipsRenderShipSegment(ship, r, c, shot, options);
        if (shot) txt += shot.hit ? (sunkShip ? '<span class="shipsShotMark isSunkMark">≈</span>' : '<span class="shipsShotMark isHitMark">💥</span>') : '<span class="shipsShotMark isMissMark">🌊</span>';
        const data = options.enemy && !shot ? ` data-ships-shot="${r}:${c}"` : '';
        const placeData = options.placement ? ` data-ships-place="${r}:${c}"` : '';
        const shipData = options.placement && ship ? ` data-ships-cell-ship="${escapeHtml(String(ship.id || ''))}"` : '';
        rows.push(`<button type="button" class="${cls}"${data}${placeData}${shipData} aria-label="${r + 1}-${c + 1}">${txt}</button>`);
      }
    }
    return `<div class="shipsBoard ${options.enemy ? 'isEnemy' : 'isOwn'}${options.placement ? ' isPlacement' : ''}">${rows.join('')}</div>`;
  }
  function shipsBuildPayloadSummary(st, role) {
    const mine = role === 'O' ? st.o : st.x;
    const enemy = role === 'O' ? st.x : st.o;
    const myShots = mine && Array.isArray(mine.shots) ? mine.shots.length : 0;
    const hits = mine && Array.isArray(mine.shots) ? mine.shots.filter(s => s.hit).length : 0;
    const sunk = enemy && Array.isArray(enemy.ships) ? enemy.ships.filter(ship => shipsShipSunk(ship)).length : 0;
    return { myShots, hits, sunk };
  }
  function shipsApplyShot(st, role, r, c) {
    if (!st || st.status !== 'active' || st.turn !== role) return { ok: false, reason: 'not-your-turn' };
    const shooterKey = role === 'O' ? 'o' : 'x';
    const targetKey = role === 'O' ? 'x' : 'o';
    const shooter = st[shooterKey];
    const target = st[targetKey];
    if (!shooter || !target) return { ok: false, reason: 'missing-board' };
    if (shipsShotAt(shooter, r, c)) return { ok: false, reason: 'already-shot' };
    const hitShip = shipsFindShipAt(target, r, c);
    const shot = { r, c, hit: !!hitShip, at: Date.now() };
    if (hitShip) {
      hitShip.hits = Array.isArray(hitShip.hits) ? hitShip.hits : [];
      if (!shipsHasCell(hitShip.hits, r, c)) hitShip.hits.push([r, c]);
      shot.sunk = shipsShipSunk(hitShip);
      shot.shipId = hitShip.id;
      st.message = shot.sunk ? 'Přímý zásah. ' + String(hitShip.name || 'Loď') + ' šla ke dnu.' : 'Zásah! Střílíš znovu.';
    } else {
      st.turn = role === 'X' ? 'O' : 'X';
      st.message = 'Voda. Na tahu je soupeř.';
    }
    shooter.shots = Array.isArray(shooter.shots) ? shooter.shots : [];
    shooter.shots.push(shot);
    if (shipsAllSunk(target)) {
      st.status = 'finished';
      st.winner = role;
      st.winnerAccountNumber = role === 'X' ? st.playerXAccountNumber : st.playerOAccountNumber;
      st.message = 'Vyhrál hráč ' + role + '. Celá flotila soupeře je dole.';
    }
    st.revision = (Number(st.revision || 0) || 0) + 1;
    st.updatedAtTs = Date.now();
    return { ok: true, shot };
  }
  async function shipsSaveState(state) {
    if (!state || !state.code || typeof window.saveGameSessionByInviteCode !== 'function') return { ok: false, reason: 'missing-save' };
    return window.saveGameSessionByInviteCode(state.code, state);
  }
  function renderShips(body) {
    clearCleanups();
    try { document.body.classList.add('shipsGameOpen'); } catch (err) {}
    addCleanup(() => { try { document.body.classList.remove('shipsGameOpen'); } catch (err) {} });
    const local = getState('ships', () => ({ code: '', state: null, loadedRevision: 0, busy: false, poll: 0, savedFinishedCode: '', view: '', lastTurn: '', lastStatus: '', placing: { manual: false, selected: 'carrier', horizontal: true } }));
    local.placing = local.placing || { manual: false, selected: 'carrier', horizontal: true };
    const account = shipsAccountId();
    const accountName = shipsAccountName();
    const status = (msg) => `<div class="arcadeStatus shipsStatus">${escapeHtml(msg || '')}</div>`;
    const renderShipsHeadToHeadMenu = async () => {
      const box = body.querySelector('#shipsH2HList');
      if (!box || typeof window.loadGameHeadToHeadList !== 'function') {
        if (box) box.textContent = 'Zatím bez online historie.';
        return;
      }
      try {
        const res = await window.loadGameHeadToHeadList('battleship', { limit: 50 });
        const rows = res && Array.isArray(res.rows) ? res.rows : [];
        if (!rows.length) { box.textContent = 'Zatím žádné dokončené vzájemné zápasy.'; return; }
        box.innerHTML = rows.slice(0, 8).map((row) => {
          const aName = row.nameA || row.playerA || 'Hráč A';
          const bName = row.nameB || row.playerB || 'Hráč B';
          return `<div class="shipsH2HRow"><span>${escapeHtml(aName)} vs ${escapeHtml(bName)}</span><b>${Number(row.aWins || 0) || 0}:${Number(row.bWins || 0) || 0}</b><em>${Number(row.total || 0) || 0}×</em></div>`;
        }).join('');
      } catch (err) {
        box.textContent = 'Vzájemné zápasy se nepodařilo načíst.';
      }
    };
    const playerKey = (role) => role === 'O' ? 'o' : 'x';
    const readyKey = (role) => role === 'O' ? 'oReady' : 'xReady';
    const selectedDef = () => SHIPS_FLEET.find((ship) => ship.id === local.placing.selected) || SHIPS_FLEET[0];
    const nextUnplaced = (board) => {
      const ids = new Set((board && Array.isArray(board.ships) ? board.ships : []).map((ship) => String(ship.id)));
      return (SHIPS_FLEET.find((ship) => !ids.has(ship.id)) || SHIPS_FLEET[0]).id;
    };
    const saveAndRender = async (st, msg) => {
      st.message = msg || st.message || '';
      shipsRecomputeStatus(st);
      st.revision = (Number(st.revision || 0) || 0) + 1;
      local.state = st;
      renderGame();
      await shipsSaveState(st);
    };
    const shipsInviteUrl = (code) => {
      try {
        const url = new URL(window.location.href);
        url.hash = 'games=ships&invite=' + encodeURIComponent(String(code || '').trim());
        return url.toString();
      } catch (err) {
        return '#games=ships&invite=' + encodeURIComponent(String(code || '').trim());
      }
    };
    const shipsInviteShareText = (st) => {
      const code = String(st && st.code || local.code || '').trim();
      return 'Přidej se do Lodí v RaK.' + (code ? (' Kód pozvánky: ' + code + ' · ' + shipsInviteUrl(code)) : '');
    };
    const shipsInviteOverlayHtml = (st) => {
      const code = String(st && st.code || local.code || '').trim();
      const waitingForOpponent = !!(code && !st.playerOAccountNumber && !st.o && String(st.status || '').toLowerCase() === 'waiting');
      if (!waitingForOpponent) return '';
      const inviteUrl = shipsInviteUrl(code);
      return `<div class="shipsInviteOverlay" data-ships-invite-overlay="1">
        <div class="shipsInviteOverlayLabel tttInviteOverlayLabel">Pozvánka pro spoluhráče</div>
        <div class="shipsInviteOverlayCode tttInviteOverlayCode">${escapeHtml(code)}</div>
        <div class="shipsInviteOverlayHint tttInviteOverlayHint">Může opsat 4 čísla, nebo mu pošli odkaz a hra se mu otevře rovnou.</div>
        <div class="shipsInviteOverlayLink tttInviteOverlayLink">${escapeHtml(inviteUrl)}</div>
        <div class="shipsInviteOverlayActions tttInviteOverlayActions">
          <button type="button" class="tttBtn shipsInviteOverlayBtn tttInviteOverlayBtn" data-ships-copy-link="${escapeHtml(inviteUrl)}">Kopírovat odkaz</button>
          <button type="button" class="tttBtn shipsInviteOverlayBtn tttInviteOverlayBtn" data-ships-share-link="${escapeHtml(inviteUrl)}" data-ships-share-code="${escapeHtml(code)}">Sdílet</button>
        </div>
      </div>`;
    };
    const shipsBindInviteBannerActions = () => {
      body.querySelectorAll('[data-ships-copy-link]').forEach((btn) => btn.addEventListener('click', async () => {
        const value = String(btn.getAttribute('data-ships-copy-link') || '').trim();
        const original = btn.textContent || 'Kopírovat odkaz';
        try {
          await navigator.clipboard.writeText(value);
          btn.textContent = 'Odkaz zkopírován';
          setTimeout(() => { btn.textContent = original; }, 1400);
        } catch (err) {
          btn.textContent = 'Nešlo zkopírovat';
          setTimeout(() => { btn.textContent = original; }, 1400);
        }
      }));
      body.querySelectorAll('[data-ships-share-link]').forEach((btn) => btn.addEventListener('click', async () => {
        const inviteUrl = String(btn.getAttribute('data-ships-share-link') || '').trim();
        const code = String(btn.getAttribute('data-ships-share-code') || '').trim();
        const text = shipsInviteShareText({ code });
        try {
          if (navigator.share) await navigator.share({ title: 'Lodě v RaK', text: 'Přidej se do Lodí v RaK.', url: inviteUrl });
          else await navigator.clipboard.writeText(inviteUrl || text);
        } catch (err) {}
      }));
    };
    const shipsRecomputeStatus = (st) => {
      if (!st || st.status === 'finished') return st;
      if (st.o && st.xReady && st.oReady) {
        st.status = 'active';
        st.message = st.message && String(st.message).includes('Hra začala') ? st.message : 'Hra začala. Střílí hráč X.';
      } else if (st.o) {
        st.status = 'placing';
      } else {
        st.status = 'waiting';
      }
      return st;
    };
    const joinShipsByCode = async (rawCode, source) => {
      if (!account) { renderMenu('Nejdřív se přihlas do herního profilu.'); return { ok: false, reason: 'missing-account' }; }
      const code = String(rawCode || '').replace(/\D/g, '').slice(0, 4);
      if (code.length !== 4) { renderMenu('Zadej 4místný číselný kód pozvánky.'); return { ok: false, reason: 'invalid-code' }; }
      renderMenu(source === 'link' ? 'Připojuji se z odkazu…' : 'Připojuji se k online hře…');
      const accepted = await window.acceptGameInvite(code, account, { gameType: 'battleship', source: source || 'manual' });
      if (!accepted || !accepted.ok) { renderMenu((accepted && accepted.message) || (accepted && accepted.error && accepted.error.message) || 'Pozvánku se nepodařilo přijmout.'); return { ok: false, reason: 'accept-failed' }; }
      const loaded = accepted && accepted.session ? accepted : await window.loadGameSessionByInviteCode(code);
      const sessionRow = loaded && loaded.session ? loaded.session : null;
      const inviteRow = loaded && loaded.invite ? loaded.invite : (accepted && accepted.invite ? accepted.invite : null);
      let st = shipsNormalizeState(sessionRow && sessionRow.board_state, code);
      st.gameType = 'battleship';
      st.playerXAccountNumber = st.playerXAccountNumber || (sessionRow && sessionRow.player_x_account_number) || (inviteRow && inviteRow.inviter_account_number) || null;
      st.playerOAccountNumber = st.playerOAccountNumber || (sessionRow && sessionRow.player_o_account_number) || account;
      st.o = st.o && st.o.ships && st.o.ships.length ? st.o : shipsBuildPlayerBoard();
      st.oReady = !!st.oReady;
      shipsRecomputeStatus(st);
      st.message = 'Připojeno. Připrav si flotilu a potvrď ji.';
      st.revision = (Number(st.revision || 0) || 0) + 1;
      await shipsSaveState(st);
      local.code = code;
      local.state = st;
      local.view = 'own';
      local.lastTurn = '';
      local.lastStatus = '';
      local.lastHasOpponent = false;
      local.placing = { manual: false, selected: nextUnplaced(st.o), horizontal: true };
      renderGame();
      return { ok: true, code };
    };
    const renderMenu = (message) => {
      body.innerHTML = `<div class="arcadeStage shipsStage shipsMenuStage shipsScrollableStage">
        <div class="arcadeBar arcadePanel uPad12 shipsIntroCard shipsSlimCard">
          <div class="arcadeStatus"><strong>Lodě online</strong><br>Vytvoř nebo přijmi online souboj. Flotila se položí automaticky a pak si ji upravíš přímo na mapě.</div>
        </div>
        ${message ? status(message) : ''}
        <div class="arcadeControls shipsInviteControls">
          <button type="button" class="gameControlBtn" id="shipsCreateBtn">Vytvořit hru</button>
        </div>
        <div class="arcadeBar arcadePanel uPad12 shipsJoinCard">
          <label class="smallText uBold" for="shipsJoinCode">Kód pozvánky</label>
          <input id="shipsJoinCode" class="appInput" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="1234">
          <button type="button" class="gameControlBtn" id="shipsJoinBtn">Přijmout pozvánku</button>
        </div>
        <div class="arcadeBar arcadePanel uPad12 shipsH2HCard shipsMenuOnlyH2H"><div class="gamesTop3Title">Uložené vzájemné zápasy</div><div class="smallText shipsH2HMenuNote">Historie Lodí je schovaná tady v menu pro založení nebo přijetí hry, ne přímo v souboji.</div><div id="shipsH2HList" class="shipsH2HBody smallText">Načítám…</div></div>
        ${gamesTop3Block('ships', 'bodů', 5).replace('gamesTop5ScrollCard', 'gamesTop5ScrollCard arcadeTopScoreTight')}
      </div>`;
      const create = body.querySelector('#shipsCreateBtn');
      const join = body.querySelector('#shipsJoinBtn');
      const codeInput = body.querySelector('#shipsJoinCode');
      if (codeInput) codeInput.addEventListener('input', () => {
        codeInput.value = String(codeInput.value || '').replace(/\D/g, '').slice(0, 4);
      });
      if (create) create.addEventListener('click', async () => {
        if (!account) { renderMenu('Nejdřív se přihlas do herního profilu.'); return; }
        const code = shipsRandomCode();
        const st = shipsFreshState(code, account);
        local.busy = true; renderMenu('Zakládám online hru…');
        const res = await window.createGameInvite({ gameType: 'battleship', code, inviterAccountNumber: account, boardState: st, payload: { title: 'Lodě online', playerName: accountName } });
        local.busy = false;
        if (!res || !res.ok) { renderMenu((res && res.message) || (res && res.error && res.error.message) || 'Pozvánku se nepodařilo vytvořit. Zkus to znovu online.'); return; }
        local.code = code; local.state = st; local.placing = { manual: false, selected: nextUnplaced(st.x), horizontal: true }; renderGame();
      });
      void renderShipsHeadToHeadMenu();
      if (join) join.addEventListener('click', async () => {
        const input = body.querySelector('#shipsJoinCode');
        await joinShipsByCode(input && input.value, 'manual');
      });
    };
    const shipsReturnToMenu = (msg) => {
      local.code = '';
      local.state = null;
      local.view = 'own';
      local.lastTurn = '';
      local.lastStatus = '';
      local.placing = { manual: false, selected: 'carrier', horizontal: true };
      renderMenu(msg || '');
    };
    const shipsStartRematch = async () => {
      const current = shipsNormalizeState(local.state, local.code);
      const role = shipsRoleForState(current);
      if (!current || !current.code || !current.playerXAccountNumber || !current.playerOAccountNumber || !role) {
        shipsReturnToMenu('Novou hru se stejným soupeřem nejde založit. Vytvoř novou pozvánku.');
        return;
      }
      const next = shipsFreshState(current.code, current.playerXAccountNumber);
      next.playerOAccountNumber = current.playerOAccountNumber;
      next.x = shipsBuildPlayerBoard();
      next.o = shipsBuildPlayerBoard();
      next.xReady = false;
      next.oReady = false;
      next.status = 'placing';
      next.turn = 'X';
      next.round = (Number(current.round || 1) || 1) + 1;
      next.revision = (Number(current.revision || 0) || 0) + 1;
      next.message = 'Nová hra se stejným soupeřem. Oba jen potvrďte flotilu a pokračujete.';
      local.state = next;
      local.view = 'own';
      local.lastStatus = '';
      local.lastTurn = '';
      local.savedFinishedCode = '';
      local.placing = { manual: false, selected: nextUnplaced(role === 'O' ? next.o : next.x), horizontal: true };
      renderGame();
      await shipsSaveState(next);
    };
    const maybeRecordFinished = () => {
      const st = local.state;
      const role = st ? shipsRoleForState(st) : '';
      if (!st || st.status !== 'finished' || !role || local.savedFinishedCode === st.code + ':' + String(st.winner || '')) return;
      local.savedFinishedCode = st.code + ':' + String(st.winner || '');
      const sum = shipsBuildPayloadSummary(st, role);
      const won = st.winner === role;
      gamesRecordStat('ships', { completed: true, online: true, onlinePlay: true, onlinePlays: 1, onlineWins: won ? 1 : 0, wins: won ? 1 : 0, losses: won ? 0 : 1, bestScore: won ? 1000 + (sum.hits * 80) + (sum.sunk * 220) : Math.max(100, sum.hits * 70), bestHits: sum.hits, bestClears: sum.sunk, lastResult: won ? 'Výhra v Lodích' : 'Prohra v Lodích' });
    };
    const refreshRemote = async (soft) => {
      if (!local.code || typeof window.loadGameSessionByInviteCode !== 'function') return;
      const res = await window.loadGameSessionByInviteCode(local.code);
      if (res && res.ok === false && (res.expired || res.reason === 'expired-invite')) {
        shipsReturnToMenu(res.message || 'Tahle pozvánka už vypršela. Vytvoř novou.');
        return;
      }
      const remote = res && res.session && res.session.board_state ? shipsRecomputeStatus(shipsNormalizeState(res.session.board_state, local.code)) : null;
      if (!remote) return;
      const oldState = local.state || {};
      const oldRev = Number(oldState.revision || 0) || 0;
      const nextRev = Number(remote.revision || 0) || 0;
      const role = shipsRoleForState(remote || oldState);
      const mineReady = role ? !!remote[readyKey(role)] : true;
      const opponentChanged = String(oldState.playerOAccountNumber || '') !== String(remote.playerOAccountNumber || '') || (!!oldState.o !== !!remote.o);
      const statusChanged = String(oldState.status || '') !== String(remote.status || '') || String(oldState.turn || '') !== String(remote.turn || '');
      const becameActive = String(remote.status || '') === 'active' && !!remote.xReady && !!remote.oReady && !!remote.x && !!remote.o;
      if (!soft || mineReady || opponentChanged || statusChanged || becameActive || nextRev > oldRev) {
        local.state = remote;
        if (becameActive && role && remote.turn === role) local.view = 'enemy';
        maybeRecordFinished();
        renderGame(true);
      }
    };
    const renderPlacement = (st, role, message) => {
      const keyName = playerKey(role);
      const mine = shipsNormalizePlayerBoard(st[keyName]);
      st[keyName] = mine;
      const valid = shipsValidateFleet(mine);
      const selectedShip = mine.ships.find((ship) => String(ship.id) === String(local.placing.selected)) || mine.ships[0] || null;
      if (selectedShip) {
        local.placing.selected = selectedShip.id;
        local.placing.horizontal = !!selectedShip.horizontal;
      }
      const selectedName = selectedShip ? selectedShip.name : 'loď';
      const hintText = message || st.message || 'Klepni na loď, potom na nové místo. Lodě se nesmí dotýkat ani rohem.';
      body.innerHTML = `<div class="arcadeStage shipsStage shipsSetupStage shipsScrollableStage">
        <div class="arcadeControls shipsSetupActions shipsSetupPrimaryActions">
          <button type="button" class="gameControlBtn ${valid ? 'primary' : 'isDisabled'}" id="shipsReadyBtn">Potvrdit flotilu</button>
          <button type="button" class="gameControlBtn ghost" id="shipsMenuBackBtn">Zpět do menu</button>
        </div>
        <div class="arcadeHud arcadeHudSingleLine shipsCompactHud">${gamesStatLine('Role', role || '—')}${gamesStatLine('Lodí', `${mine.ships.length}/${SHIPS_FLEET.length}`)}${gamesStatLine('Loď', selectedName)}</div>
        <div class="shipsSingleBoardWrap shipsSetupBoardWrap">
          <div class="shipsBoardCard shipsBoardCardLift shipsInviteHost"><div class="smallText uBold shipsBoardTitleLine">Tvoje flotila · ${escapeHtml(role || "—")} · ${escapeHtml(selectedName)}</div><div class="smallText shipsInlineHint">${escapeHtml(hintText)}</div>${shipsRenderBoard(mine, { own: true, placement: true, selectedShipId: selectedShip && selectedShip.id })}${shipsInviteOverlayHtml(st)}</div>
        </div>
        <div class="arcadeControls shipsSetupActions shipsSetupSecondaryActions">
          <button type="button" class="gameControlBtn" id="shipsShuffleBtn">Přehodit automaticky</button>
          <button type="button" class="gameControlBtn" id="shipsRotateBtn">Otočit vybranou</button>
        </div>
      </div>`;
      shipsBindInviteBannerActions();
      if (!local.poll && st.status !== 'finished') local.poll = rakGameSetInterval(() => refreshRemote(true), 900);
      const menuBack = body.querySelector('#shipsMenuBackBtn');
      if (menuBack) menuBack.addEventListener('click', () => shipsReturnToMenu('Zpět v menu Lodí. Hru můžeš založit znovu nebo přijmout kód.'));
      const shuffle = body.querySelector('#shipsShuffleBtn');
      if (shuffle) shuffle.addEventListener('click', async () => {
        st[keyName] = shipsBuildPlayerBoard();
        st[readyKey(role)] = false;
        local.placing.selected = (st[keyName].ships[0] && st[keyName].ships[0].id) || SHIPS_FLEET[0].id;
        local.placing.horizontal = !!(st[keyName].ships[0] && st[keyName].ships[0].horizontal);
        await saveAndRender(st, 'Flotila přeházená. Jestli sedí, potvrď ji, nebo klepni na loď a přesuň ji ručně.');
      });
      const rotate = body.querySelector('#shipsRotateBtn');
      if (rotate) rotate.addEventListener('click', async () => {
        const current = st[keyName].ships.find((ship) => String(ship.id) === String(local.placing.selected)) || st[keyName].ships[0];
        if (!current || !Array.isArray(current.cells) || !current.cells.length) { renderPlacement(st, role, 'Nejdřív vyber loď.'); return; }
        const anchor = current.cells[0];
        const res = shipsPlaceShip(st[keyName], current, Number(anchor[0]), Number(anchor[1]), !current.horizontal);
        if (!res.ok) { renderPlacement(st, role, 'Tady otočit nejde. Zkus loď posunout dál od ostatních.'); return; }
        st[keyName] = res.board;
        st[readyKey(role)] = false;
        local.placing.selected = current.id;
        local.placing.horizontal = !current.horizontal;
        await saveAndRender(st, 'Loď otočená.');
      });
      body.querySelectorAll('[data-ships-place]').forEach((btn) => btn.addEventListener('click', async () => {
        const parts = String(btn.getAttribute('data-ships-place') || '').split(':').map(Number);
        if (!Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) return;
        const clickedShipId = btn.getAttribute('data-ships-cell-ship') || '';
        const currentBoard = shipsNormalizePlayerBoard(st[keyName]);
        const clickedShip = clickedShipId ? currentBoard.ships.find((ship) => String(ship.id) === String(clickedShipId)) : null;
        if (clickedShip) {
          local.placing.selected = clickedShip.id;
          local.placing.horizontal = !!clickedShip.horizontal;
          renderPlacement(st, role, 'Vybraná loď: ' + String(clickedShip.name || 'loď') + '. Klepni na nové místo, kam ji chceš přesunout.');
          return;
        }
        const picked = currentBoard.ships.find((ship) => String(ship.id) === String(local.placing.selected)) || currentBoard.ships[0];
        if (!picked) { renderPlacement(st, role, 'Není vybraná žádná loď. Přehod flotilu automatem.'); return; }
        const res = shipsPlaceShip(st[keyName], picked, parts[0], parts[1], !!local.placing.horizontal);
        if (!res.ok) { renderPlacement(st, role, 'Sem loď dát nejde. Lodě se nesmí dotýkat ani rohem.'); return; }
        st[keyName] = res.board;
        st[readyKey(role)] = false;
        local.placing.selected = picked.id;
        await saveAndRender(st, 'Loď přesunutá.');
      }));
      const ready = body.querySelector('#shipsReadyBtn');
      if (ready) ready.addEventListener('click', async () => {
        if (!shipsValidateFleet(st[keyName])) { renderPlacement(st, role, 'Flotila ještě není správně složená. Musí být 5 lodí a nesmí se dotýkat.'); return; }
        st[readyKey(role)] = true;
        shipsRecomputeStatus(st);
        if (st.status === 'active') st.message = 'Hra začala. Střílí hráč X.';
        else st.message = st.o ? 'Čeká se, až soupeř potvrdí flotilu.' : 'Flotila potvrzená. Čeká se na protihráče.';
        await saveAndRender(st, st.message);
        setTimeout(() => { void refreshRemote(true); }, 350);
      });
    };
    const renderGame = (fromPoll) => {
      const st = shipsRecomputeStatus(shipsNormalizeState(local.state, local.code));
      local.state = st;
      const role = shipsRoleForState(st);
      const keyName = role === 'O' ? 'o' : 'x';
      const mine = role === 'O' ? st.o : st.x;
      const enemy = role === 'O' ? st.x : st.o;
      const mineReady = role ? !!st[readyKey(role)] : true;
      if (role && st.status !== 'finished' && !mineReady) { renderPlacement(st, role); return; }
      const sum = shipsBuildPayloadSummary(st, role || 'X');
      const hasOpponent = !!(st.o || st.playerOAccountNumber);
      const waiting = st.status === 'waiting' || !st.o || !st.oReady || !st.xReady;
      const canShoot = st.status === 'active' && role && st.turn === role;
      const headline = waiting ? (hasOpponent ? 'Čeká se na flotily' : 'Čeká se na protihráče') : (st.status === 'finished' ? (st.winner === role ? 'Vyhrál jsi' : 'Konec hry') : (canShoot ? 'Jsi na tahu' : 'Hraje soupeř'));
      const ownShots = enemy && Array.isArray(enemy.shots) ? enemy.shots : [];
      const myShots = mine && Array.isArray(mine.shots) ? mine.shots : [];
      const preferredView = canShoot ? 'enemy' : 'own';
      if (canShoot) local.view = 'enemy';
      else if (!local.view || local.lastTurn !== st.turn || st.status !== local.lastStatus || local.lastHasOpponent !== hasOpponent) local.view = preferredView;
      if (!hasOpponent && local.view === 'enemy') local.view = 'own';
      local.lastTurn = st.turn;
      local.lastStatus = st.status;
      local.lastHasOpponent = hasOpponent;
      const view = local.view === 'enemy' ? 'enemy' : 'own';
      const toggleHtml = hasOpponent ? `<div class="shipsViewToggle" role="tablist" aria-label="Přepnutí pole">
        <button type="button" class="shipsViewBtn ${view === 'own' ? 'isActive' : ''}" data-ships-view="own">Moje flotila</button>
        <button type="button" class="shipsViewBtn ${view === 'enemy' ? 'isActive' : ''}" data-ships-view="enemy">Střílet na soupeře</button>
      </div>` : '';
      const activeBoardTitle = view === 'enemy' ? `Soupeřovo pole ${canShoot ? '· střílej' : '· čekej na tah'}` : 'Tvoje lodě · zásahy soupeře';
      const activeBoard = view === 'enemy'
        ? (enemy ? shipsRenderBoard(enemy, { enemy: true, shots: myShots }) : '<div class="shipsWaitingBoard">Soupeř se připojil, ale ještě připravuje flotilu.</div>')
        : shipsRenderBoard(mine, { own: true, shots: ownShots });
      const viewHint = st.status === 'active'
        ? (canShoot ? 'Jsi na tahu, proto se ti rovnou ukazuje pole soupeře.' : 'Hraje soupeř, proto se ti rovnou ukazuje tvoje flotila a zásahy proti tobě.')
        : (hasOpponent ? 'Soupeř je připojený. Přepni si flotilu nebo pole pro střelbu.' : 'Čeká se na soupeře.');
      body.innerHTML = `<div class="arcadeStage shipsStage shipsScrollableStage shipsPlayStage">
        <div class="arcadeHud arcadeHudSingleLine shipsCompactHud">${gamesStatLine('Role', role || 'divák')}${gamesStatLine('Zásahy', sum.hits)}${gamesStatLine('Potopené', sum.sunk)}</div>
        <div class="shipsPlayInfoLine"><strong>${escapeHtml(headline)}</strong><span>${escapeHtml(st.message || viewHint || '')}</span></div>
        ${toggleHtml}
        <div class="shipsMenuBackLine"><button type="button" class="gameControlBtn ghost" id="shipsMenuBackBtn">Zpět do menu Lodí</button></div>
        <div class="shipsSingleBoardWrap">
          <div class="shipsBoardCard shipsBoardCardLift shipsBoardCardResultHost shipsInviteHost"><div class="smallText uBold shipsBoardTitleLine">${escapeHtml(activeBoardTitle)}</div><div class="smallText shipsInlineHint">${escapeHtml(viewHint)}</div>${activeBoard}${shipsInviteOverlayHtml(st)}${st.status === 'finished' ? `<div class="arcadeGameOverlay arcadeEndOverlay shipsResult"><div class="arcadeOverlayCard shipsResultCard"><strong>${st.winner === role ? 'Výhra!' : 'Konec hry'}</strong><span>Score: ${st.winner === role ? 1000 + (sum.hits * 80) + (sum.sunk * 220) : Math.max(100, sum.hits * 70)} · Zásahy: ${sum.hits} · Potopené: ${sum.sunk}</span><div class="shipsResultActions"><button type="button" class="gameControlBtn primary" id="shipsRematchBtn">Nová hra se soupeřem</button><button type="button" class="gameControlBtn ghost" id="shipsBackBtn">Zpět do Lodí</button></div></div></div>` : ''}</div>
        </div>
      </div>`;
      shipsBindInviteBannerActions();
      body.querySelectorAll('[data-ships-view]').forEach((btn) => btn.addEventListener('click', () => {
        local.view = btn.getAttribute('data-ships-view') === 'enemy' ? 'enemy' : 'own';
        renderGame();
      }));
      const rematch = body.querySelector('#shipsRematchBtn');
      if (rematch) rematch.addEventListener('click', () => { void shipsStartRematch(); });
      const back = body.querySelector('#shipsBackBtn');
      if (back) back.addEventListener('click', () => shipsReturnToMenu(''));
      const menuBack = body.querySelector('#shipsMenuBackBtn');
      if (menuBack) menuBack.addEventListener('click', () => shipsReturnToMenu(''));
      body.querySelectorAll('[data-ships-shot]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const stNow = shipsNormalizeState(local.state, local.code);
          const roleNow = shipsRoleForState(stNow);
          const parts = String(btn.getAttribute('data-ships-shot') || '').split(':').map(Number);
          const result = shipsApplyShot(stNow, roleNow, parts[0], parts[1]);
          if (!result.ok) {
            stNow.message = result.reason === 'already-shot'
              ? 'Sem už jsi střílel.'
              : (result.reason === 'missing-board'
                ? 'Soupeřovo pole ještě není načtené. Zkouším obnovit hru.'
                : 'Teď nejsi na tahu. Zkouším obnovit stav hry.');
            local.state = stNow;
            renderGame();
            setTimeout(() => { void refreshRemote(true); }, 250);
            return;
          }
          local.state = stNow;
          renderGame();
          await shipsSaveState(stNow);
          maybeRecordFinished();
        });
      });
      if (!fromPoll && local.poll) { clearInterval(local.poll); local.poll = 0; }
      if (!local.poll && st.status !== 'finished') local.poll = rakGameSetInterval(() => refreshRemote(true), 900);
    };
    addCleanup(() => { if (local.poll) clearInterval(local.poll); local.poll = 0; });
    if (local.code && local.state) renderGame();
    else renderMenu('');
    const pendingInvite = String(window.__rakShipsPendingInviteCode || '').replace(/\D/g, '').slice(0, 4);
    if (pendingInvite) {
      window.__rakShipsPendingInviteCode = '';
      setTimeout(() => { void joinShipsByCode(pendingInvite, 'link'); }, 60);
    }
    setActiveState('ships', local);
  }

  if (typeof window !== 'undefined' && !window.openShipsFromInviteCode) {
    window.openShipsFromInviteCode = async function openShipsFromInviteCode(code, options) {
      const inviteCode = String(code || '').replace(/\D/g, '').slice(0, 4);
      if (!inviteCode) return false;
      window.__rakShipsPendingInviteCode = inviteCode;
      window.__rakShipsPendingInviteSource = options && options.source ? String(options.source) : 'url';
      try {
        // v.1.5 (851): Lodě dál běží uvnitř stránky Hry, ale herní plocha je mobile-first natažená přes dostupnou výšku.
        // Při deep-linku proto nejdřív přepneme stránku na Hry a až potom otevřeme shell Lodí.
        if (typeof showPage === 'function') showPage('games');
        else if (typeof window.showPage === 'function') window.showPage('games');
        else {
          try {
            document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));
            const gamesPage = document.getElementById('games');
            if (gamesPage) gamesPage.classList.add('active');
          } catch (navErr) {}
        }
        if (typeof window.openGameShell === 'function') window.openGameShell('ships');
        else if (typeof openGameShell === 'function') openGameShell('ships');
        else return false;
        return true;
      } catch (err) {
        return false;
      }
    };
  }


  // Pampuch ---------------------------------------------------------------
  const PAMP_LEVELS = [
    {
      name: 'Level 1',
      speed: 380,
      ghostDelay: 2,
      map: [
        '###################',
        '#P....#.....#....G#',
        '#.###.#.###.#.###.#',
        '#o#...#.....#...#o#',
        '#.#.###.###.###.#.#',
        '#...#...#G#...#...#',
        '###.#.#.#.#.#.#.###',
        '#.....#.....#.....#',
        '#.###.#.###.#.###.#',
        '#o..#...#...#..o#G#',
        '###.#.#####.#.###.#',
        '#...#.......#.....#',
        '#.###.#####.###.#.#',
        '#G...............o#',
        '###################'
      ]
    },
    {
      name: 'Level 2',
      speed: 380,
      ghostDelay: 2,
      map: [
        '###################',
        '#P..#.......#....G#',
        '#.#.#.#####.#.###.#',
        '#.#...#...#...#...#',
        '#.#####.#.#####.#.#',
        '#o......#......o#.#',
        '#####.#####.#####.#',
        '#.....#G..#.....#.#',
        '#.###.#.#.#.###.#.#',
        '#...#...#...#...#G#',
        '###.#####.#####.###',
        '#...#.........#...#',
        '#.#.#.#######.#.#.#',
        '#G#.............#o#',
        '###################'
      ]
    },
    {
      name: 'Level 3',
      speed: 380,
      ghostDelay: 2,
      map: [
        '###################',
        '#P......#......G..#',
        '#.#####.#.#####.#.#',
        '#.....#...#.....#.#',
        '#####.#.#.#.#####.#',
        '#o....#.#.#....o#.#',
        '#.#####.#.#####.#.#',
        '#.......G.......#.#',
        '#.###.#####.###.#.#',
        '#...#...#...#...#G#',
        '###.#.#.#.#.#.###.#',
        '#...#.#...#.#.....#',
        '#.#.#######.###.#.#',
        '#G#.............#o#',
        '###################'
      ]
    },
    {
      name: 'Level 4',
      speed: 380,
      ghostDelay: 2,
      map: [
        '###################',
        '#P....#.....#....G#',
        '#####.#.###.#.#####',
        '#.....#...#.#.....#',
        '#.#######.#.#####.#',
        '#o#.......#.....#o#',
        '#.#.###########.#.#',
        '#.#.....G.....#...#',
        '#.#####.###.#####.#',
        '#.....#...#.....#G#',
        '#####.#.#.###.#.###',
        '#...#...#.....#...#',
        '#.#.###########.#.#',
        '#G#.............#o#',
        '###################'
      ]
    }
  ];

  const PAMP_DIRS = [
    { name: 'left', dr: 0, dc: -1 },
    { name: 'right', dr: 0, dc: 1 },
    { name: 'up', dr: -1, dc: 0 },
    { name: 'down', dr: 1, dc: 0 }
  ];
  const PAMP_BASE_TICK_MS = 380;
  const PAMP_GHOST_COLOR = '#ff4f88';

  function pampDir(name) {
    return PAMP_DIRS.find(d => d.name === name) || null;
  }

  function pampOpposite(a, b) {
    return !!(a && b && a.dr + b.dr === 0 && a.dc + b.dc === 0);
  }

  function pampuchState() {
    return {
      running: false,
      over: false,
      paused: false,
      saved: false,
      score: 0,
      levelIndex: 0,
      levelClears: 0,
      points: 0,
      totalPoints: 0,
      runPoints: 0,
      bestLevelPoints: 0,
      lives: 3,
      combo: 0,
      bestCombo: 0,
      eatenGhosts: 0,
      steps: 0,
      frightened: 0,
      invuln: 0,
      tickMs: PAMP_BASE_TICK_MS,
      ghostSlowTurn: 0,
      moveAcc: 0,
      lastTs: 0,
      raf: 0,
      grid: [],
      rows: 0,
      cols: 0,
      player: { r: 1, c: 1, prevR: 1, prevC: 1, moveAt: 0, dir: pampDir('right'), queued: pampDir('right'), mouth: 0 },
      ghosts: [],
      touchStart: null,
      startAt: 0
    };
  }

  function pampuchTotalScore(state) {
    return Math.max(0, Number(state.score || 0) || 0);
  }

  function pampuchParseLevel(state, index, keepScore) {
    const levelIndex = clamp(Number(index || 0) || 0, 0, PAMP_LEVELS.length - 1);
    const def = PAMP_LEVELS[levelIndex] || PAMP_LEVELS[0];
    const rows = def.map.length;
    const cols = def.map[0].length;
    const grid = [];
    const ghosts = [];
    let player = { r: 1, c: 1, prevR: 1, prevC: 1, moveAt: 0, dir: pampDir('right'), queued: pampDir('right'), mouth: 0 };
    let total = 0;
    def.map.forEach((row, r) => {
      const cells = String(row).split('');
      cells.forEach((cell, c) => {
        if (cell === 'P') { player = { r, c, prevR: r, prevC: c, moveAt: 0, dir: pampDir('right'), queued: pampDir('right'), mouth: 0 }; cells[c] = '.'; total += 1; }
        else if (cell === 'G') { ghosts.push({ r, c, prevR: r, prevC: c, moveAt: 0, homeR: r, homeC: c, dir: randomPick(PAMP_DIRS), color: PAMP_GHOST_COLOR, wait: Number(def.ghostDelay || 0) + ghosts.length }); cells[c] = '.'; total += 1; }
        else if (cell === '.' || cell === 'o') total += 1;
      });
      grid.push(cells);
    });
    state.levelIndex = levelIndex;
    state.grid = grid;
    state.rows = rows;
    state.cols = cols;
    state.player = player;
    state.ghosts = ghosts;
    state.totalPoints = total;
    state.points = 0;
    state.combo = 0;
    state.frightened = 0;
    state.invuln = 0;
    state.moveAcc = 0;
    state.tickMs = PAMP_BASE_TICK_MS;
    if (!keepScore) {
      state.score = 0;
      state.lives = 3;
      state.levelClears = 0;
      state.bestCombo = 0;
      state.bestLevelPoints = 0;
      state.runPoints = 0;
      state.eatenGhosts = 0;
      state.steps = 0;
      state.saved = false;
    }
  }

  function pampuchEnsureMap(state) {
    if (!Array.isArray(state.grid) || !state.grid.length || !state.rows || !state.cols) pampuchParseLevel(state, state.levelIndex || 0, true);
  }

  function pampuchReset(state, levelIndex) {
    const targetLevel = Number.isFinite(Number(levelIndex)) ? Number(levelIndex) : Number(state.levelIndex || 0) || 0;
    const fresh = pampuchState();
    Object.keys(state).forEach((k) => { delete state[k]; });
    Object.assign(state, fresh);
    pampuchParseLevel(state, targetLevel, false);
  }

  function pampuchIsWall(state, r, c) {
    if (r < 0 || c < 0 || r >= state.rows || c >= state.cols) return true;
    return state.grid[r] && state.grid[r][c] === '#';
  }

  function pampuchCanMove(state, actor, dir) {
    if (!dir) return false;
    return !pampuchIsWall(state, actor.r + dir.dr, actor.c + dir.dc);
  }

  function pampuchMoveActor(state, actor, dir, ts) {
    if (!dir || !pampuchCanMove(state, actor, dir)) return false;
    actor.prevR = Number(actor.r || 0);
    actor.prevC = Number(actor.c || 0);
    actor.r += dir.dr;
    actor.c += dir.dc;
    actor.dir = dir;
    actor.moveAt = Number(ts || (typeof performance !== 'undefined' ? performance.now() : Date.now())) || 0;
    return true;
  }

  function pampuchHandlePoint(state) {
    const p = state.player;
    const cell = state.grid[p.r] && state.grid[p.r][p.c];
    if (cell !== '.' && cell !== 'o') return;
    state.grid[p.r][p.c] = ' ';
    state.points += 1;
    state.runPoints += 1;
    state.bestLevelPoints = Math.max(Number(state.bestLevelPoints || 0) || 0, Number(state.points || 0) || 0);
    state.combo += 1;
    state.bestCombo = Math.max(Number(state.bestCombo || 0) || 0, Number(state.combo || 0) || 0);
    if (cell === 'o') {
      state.score += 80 + Math.min(220, Number(state.combo || 0) * 6);
    } else {
      state.score += 10 + Math.min(70, Math.floor(Number(state.combo || 0) / 6) * 5);
    }
  }

  function pampuchResetPositions(state) {
    const def = PAMP_LEVELS[state.levelIndex] || PAMP_LEVELS[0];
    let playerFound = false;
    def.map.forEach((row, r) => String(row).split('').forEach((cell, c) => {
      if (cell === 'P' && !playerFound) {
        state.player.r = r; state.player.c = c; state.player.prevR = r; state.player.prevC = c; state.player.moveAt = 0; state.player.dir = pampDir('right'); state.player.queued = pampDir('right'); playerFound = true;
      }
    }));
    state.ghosts.forEach((g, idx) => {
      g.r = g.homeR; g.c = g.homeC; g.prevR = g.homeR; g.prevC = g.homeC; g.moveAt = 0; g.dir = randomPick(PAMP_DIRS); g.wait = 1 + idx;
    });
    state.invuln = 1700;
    state.frightened = 0;
    state.combo = 0;
  }

  function pampuchGhostChoice(state, ghost) {
    // v.1.5 (743): víc Pampuch, míň Pac-Man. Duchové nehoní hráče podle vzdálenosti.
    // Chodí po chodbách, na křižovatce většinou pokračují nebo náhodně odbočí; otočí se jen ve slepé uličce.
    const allDirs = PAMP_DIRS.filter(d => pampuchCanMove(state, ghost, d));
    if (!allDirs.length) return null;
    const forward = ghost.dir && allDirs.find(d => d.name === ghost.dir.name);
    const nonReverse = allDirs.length > 1 ? allDirs.filter(d => !pampOpposite(d, ghost.dir)) : allDirs;
    const dirs = nonReverse.length ? nonReverse : allDirs;
    if (forward && dirs.some(d => d.name === forward.name)) {
      if (dirs.length <= 2 && Math.random() < .90) return forward;
      if (Math.random() < .68) return forward;
    }
    return randomPick(dirs);
  }

  function pampuchCollideGhosts(state) {
    if (state.invuln > 0) return false;
    const p = state.player;
    const hit = state.ghosts.some((g) => g.r === p.r && g.c === p.c);
    if (!hit) return false;
    state.lives -= 1;
    if (state.lives <= 0) return true;
    pampuchResetPositions(state);
    return false;
  }

  function pampuchAdvanceLevel(state) {
    state.levelClears += 1;
    state.score += 500 + (state.levelIndex + 1) * 120 + Math.max(0, Number(state.lives || 0) * 90);
    const next = (Number(state.levelIndex || 0) + 1) % PAMP_LEVELS.length;
    pampuchParseLevel(state, next, true);
  }

  function renderPampuch(body) {
    const state = getState('pampuch', () => pampuchState());
    pampuchEnsureMap(state);
    const best = getAccountStat(gamesGetActiveAccount(), 'pampuch');
    const stage = createCanvas(body, 'clamp(430px, 68dvh, 660px)');
    if (stage.wrap) stage.wrap.classList.add('isFullGame', 'arcadeNoPageScroll', 'pampuchCanvasWrap', 'pampuchMazeWrap');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeHud arcadeHudWide3 arcadeHudSingleLine" id="pampuchHud">${gamesStatLine('Total', pampuchTotalScore(state))}${gamesStatLine('Best', Number(best && best.bestScore || 0) || 0)}${gamesStatLine('Points', `${state.points || 0}/${state.totalPoints || 0}`)}</div><div class="pampuchLevelBar" id="pampuchLevelBar">${PAMP_LEVELS.map((level, idx) => `<button type="button" class="gameControlBtn pampuchLevelBtn${idx === state.levelIndex ? ' isActive' : ''}" data-pampuch-level="${idx}">${level.name}</button>`).join('')}<button type="button" class="gameControlBtn" id="pampuchPauseBtn">Pauza</button></div><div class="arcadeControls arcadeOnlyRestart"><button type="button" class="gameControlBtn" id="pampuchRestartBtn">Nová hra</button></div>`);
    if (stage.wrap) {
      stage.wrap.insertAdjacentHTML('beforeend', `<div class="arcadeGameOverlay arcadeEndOverlay" id="pampuchOverlay"><div class="arcadeOverlayCard"><strong data-pampuch-title>${state.over ? 'Konec hry' : 'Pampuch'}</strong><span data-pampuch-text>${state.over ? `Total ${pampuchTotalScore(state)} · Points ${state.points || 0}/${state.totalPoints || 0}` : 'Původní styl: bludiště, body a duchové. Swipe kdekoliv po ploše, na PC šipky.'}</span><small>Level ${Number(state.levelIndex || 0) + 1} · Best: ${Number(best && best.bestScore || 0) || 0}</small><button type="button" class="gameControlBtn" id="pampuchOverlayBtn">${state.over ? 'Nová hra' : 'Start'}</button></div></div>`);
      stage.wrap.insertAdjacentHTML('afterend', gamesTop3Block('pampuch', 'bodů', 5).replace('gamesTop5ScrollCard', 'gamesTop5ScrollCard arcadeTopScoreTight'));
    }
    const canvas = stage.canvas;
    const ctx = stage.ctx;
    const hud = body.querySelector('#pampuchHud');
    const overlay = body.querySelector('#pampuchOverlay');
    const overlayTitle = body.querySelector('[data-pampuch-title]');
    const overlayText = body.querySelector('[data-pampuch-text]');
    const resetBtn = body.querySelector('#pampuchRestartBtn');
    const overlayBtn = body.querySelector('#pampuchOverlayBtn');
    const pauseBtn = body.querySelector('#pampuchPauseBtn');

    const begin = () => {
      if (state.over) pampuchReset(state, state.levelIndex || 0);
      pampuchEnsureMap(state);
      state.running = true;
      state.paused = false;
      state.over = false;
      state.startAt = state.startAt || Date.now();
      if (overlay) overlay.hidden = true;
      if (pauseBtn) pauseBtn.textContent = 'Pauza';
    };
    const reset = (levelIndex) => {
      pampuchReset(state, Number.isFinite(Number(levelIndex)) ? Number(levelIndex) : state.levelIndex || 0);
      if (overlay) overlay.hidden = false;
      if (overlayTitle) overlayTitle.textContent = 'Pampuch';
      if (overlayText) overlayText.textContent = 'Původní styl: bludiště, body a duchové. Swipe kdekoliv po ploše, na PC šipky.';
      if (overlayBtn) overlayBtn.textContent = 'Start';
      if (pauseBtn) pauseBtn.textContent = 'Pauza';
      draw();
    };
    const finishPampuch = () => {
      arcadeRecordOnce(state, 'pampuch', {
        completed: true,
        plays: 1,
        bestScore: pampuchTotalScore(state),
        bestDistance: Number(state.levelClears || 0) + 1,
        bestPops: Math.max(Number(state.bestLevelPoints || 0) || 0, Number(state.points || 0) || 0),
        bestCombo: state.bestCombo || 0,
        bestJumps: 0,
        bestSurvivalSec: state.startAt ? Math.floor((Date.now() - state.startAt) / 1000) : 0,
        lastResult: `${pampuchTotalScore(state)} bodů · ${state.runPoints || state.points || 0} bodů celkem`
      });
    };
    const end = () => {
      if (state.over) return;
      state.over = true;
      state.running = false;
      state.paused = false;
      finishPampuch();
      if (overlay) overlay.hidden = false;
      if (overlayTitle) overlayTitle.textContent = 'Konec hry';
      if (overlayText) overlayText.textContent = `Total ${pampuchTotalScore(state)} · Points ${state.points || 0}/${state.totalPoints || 0} · Level ${Number(state.levelIndex || 0) + 1}`;
      if (overlayBtn) overlayBtn.textContent = 'Nová hra';
      if (pauseBtn) pauseBtn.textContent = 'Pauza';
    };
    const togglePause = () => {
      if (state.over) return;
      if (!state.running) { begin(); return; }
      state.paused = !state.paused;
      if (pauseBtn) pauseBtn.textContent = state.paused ? 'Pokračovat' : 'Pauza';
      if (overlay) overlay.hidden = !state.paused;
      if (overlayTitle) overlayTitle.textContent = state.paused ? 'Pauza' : 'Pampuch';
      if (overlayText) overlayText.textContent = state.paused ? 'Klepni na pokračovat nebo zmáčkni mezerník.' : 'Původní styl: bludiště, body a duchové. Swipe kdekoliv po ploše, na PC šipky.';
      if (overlayBtn) overlayBtn.textContent = state.paused ? 'Pokračovat' : 'Start';
    };
    const setDir = (dirName) => {
      const dir = pampDir(dirName);
      if (!dir) return;
      state.player.queued = dir;
      if (!state.running || state.over) begin();
      if (state.paused) togglePause();
    };
    const handleKey = (ev) => {
      const code = ev.key || ev.code;
      const map = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down' };
      if (map[code]) { ev.preventDefault(); setDir(map[code]); }
      else if (code === ' ' || code === 'Spacebar' || code === 'Space') { ev.preventDefault(); togglePause(); }
    };
    const pointerDown = (ev) => {
      ev.preventDefault();
      canvas.setPointerCapture && canvas.setPointerCapture(ev.pointerId);
      state.touchStart = { x: ev.clientX, y: ev.clientY, at: Date.now() };
      if (!state.running || state.over) begin();
      if (state.paused) togglePause();
    };
    const pointerMove = (ev) => {
      if (!state.touchStart) return;
      ev.preventDefault();
      const dx = ev.clientX - state.touchStart.x;
      const dy = ev.clientY - state.touchStart.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
      setDir(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down'));
      state.touchStart = { x: ev.clientX, y: ev.clientY, at: Date.now() };
    };
    const pointerEnd = (ev) => { ev?.preventDefault?.(); state.touchStart = null; };
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerEnd);
    canvas.addEventListener('pointercancel', pointerEnd);
    document.addEventListener('keydown', handleKey);
    resetBtn && resetBtn.addEventListener('click', () => reset(state.levelIndex || 0));
    overlayBtn && overlayBtn.addEventListener('click', () => { if (state.over) reset(state.levelIndex || 0); begin(); });
    pauseBtn && pauseBtn.addEventListener('click', togglePause);
    body.querySelectorAll('[data-pampuch-level]').forEach((btn) => {
      btn.addEventListener('click', () => reset(Number(btn.dataset.pampuchLevel || 0) || 0));
    });

    const stepGame = (stepTs) => {
      const p = state.player;
      if (p.queued && pampuchCanMove(state, p, p.queued)) p.dir = p.queued;
      pampuchMoveActor(state, p, p.dir, stepTs);
      p.mouth = (Number(p.mouth || 0) + 1) % 6;
      state.steps += 1;
      pampuchHandlePoint(state);
      if (pampuchCollideGhosts(state)) { end(); return; }
      state.ghostSlowTurn = 0;
      state.ghosts.forEach((g) => {
        if (g.wait > 0) { g.wait -= 1; return; }
        const dir = pampuchGhostChoice(state, g);
        if (dir) pampuchMoveActor(state, g, dir, stepTs);
      });
      if (pampuchCollideGhosts(state)) { end(); return; }
      if (state.points >= state.totalPoints) pampuchAdvanceLevel(state);
    };

    const boardMetrics = () => {
      const { w, h } = stage.resize();
      const pad = 10;
      const tile = Math.floor(Math.min((w - pad * 2) / state.cols, (h - pad * 2) / state.rows));
      const size = Math.max(14, tile || 14);
      return { w, h, tile: size, ox: Math.floor((w - state.cols * size) / 2), oy: Math.floor((h - state.rows * size) / 2) };
    };

    const actorDrawPos = (actor, m) => {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const fromR = Number.isFinite(Number(actor.prevR)) ? Number(actor.prevR) : Number(actor.r || 0);
      const fromC = Number.isFinite(Number(actor.prevC)) ? Number(actor.prevC) : Number(actor.c || 0);
      const toR = Number(actor.r || 0);
      const toC = Number(actor.c || 0);
      const moveAt = Number(actor.moveAt || 0) || 0;
      const duration = Math.max(140, Number(state.tickMs || PAMP_BASE_TICK_MS) * .92);
      const t = moveAt ? clamp((now - moveAt) / duration, 0, 1) : 1;
      const ease = t * t * (3 - 2 * t);
      const rr = fromR + (toR - fromR) * ease;
      const cc = fromC + (toC - fromC) * ease;
      return { x: m.ox + (cc + .5) * m.tile, y: m.oy + (rr + .5) * m.tile };
    };

    const drawGhost = (x, y, r, ghost, colors) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = PAMP_GHOST_COLOR;
      ctx.shadowColor = PAMP_GHOST_COLOR;
      ctx.shadowBlur = rakGameIsLadaMode() ? 0 : 8;
      ctx.beginPath();
      ctx.arc(0, -r * .12, r * .72, Math.PI, 0);
      ctx.lineTo(r * .72, r * .55);
      for (let i = 2; i >= -2; i -= 1) {
        ctx.lineTo(i * r * .18, r * (i % 2 === 0 ? .34 : .56));
      }
      ctx.lineTo(-r * .72, r * .55);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-r * .24, -r * .12, r * .17, 0, Math.PI * 2); ctx.arc(r * .24, -r * .12, r * .17, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0d1020';
      ctx.beginPath(); ctx.arc(-r * .22, -r * .10, r * .08, 0, Math.PI * 2); ctx.arc(r * .26, -r * .10, r * .08, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };

    const drawPlayer = (x, y, r, colors) => {
      const p = state.player;
      const dir = p.dir || pampDir('right');
      const mouthOpen = .16 + ((p.mouth % 6) < 3 ? .12 : .04);
      let angle = 0;
      if (dir.name === 'left') angle = Math.PI;
      else if (dir.name === 'up') angle = -Math.PI / 2;
      else if (dir.name === 'down') angle = Math.PI / 2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = '#ffd14d';
      ctx.shadowColor = colors.gold || '#ffd14d';
      ctx.shadowBlur = rakGameIsLadaMode() ? 0 : 14;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r * .72, mouthOpen * Math.PI, (2 - mouthOpen) * Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#16130b';
      ctx.beginPath(); ctx.arc(r * .08, -r * .34, Math.max(1.6, r * .08), 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      pampuchEnsureMap(state);
      const m = boardMetrics();
      const colors = arcadeThemeColors();
      ctx.clearRect(0, 0, m.w, m.h);
      arcadeDrawStageBg(ctx, m.w, m.h, colors);
      ctx.save();
      ctx.fillStyle = 'rgba(3,6,18,.50)';
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(m.ox - 6, m.oy - 6, state.cols * m.tile + 12, state.rows * m.tile + 12, 18); ctx.fill(); } else ctx.fillRect(m.ox - 6, m.oy - 6, state.cols * m.tile + 12, state.rows * m.tile + 12);
      ctx.restore();
      for (let r = 0; r < state.rows; r += 1) {
        for (let c = 0; c < state.cols; c += 1) {
          const cell = state.grid[r][c];
          const x = m.ox + c * m.tile;
          const y = m.oy + r * m.tile;
          if (cell === '#') {
            const wallGrad = ctx.createLinearGradient(x, y, x + m.tile, y + m.tile);
            wallGrad.addColorStop(0, 'rgba(30,118,255,.92)');
            wallGrad.addColorStop(1, 'rgba(86,40,190,.86)');
            ctx.fillStyle = wallGrad;
            ctx.strokeStyle = 'rgba(255,255,255,.18)';
            ctx.lineWidth = 1;
            if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x + 1, y + 1, m.tile - 2, m.tile - 2, Math.max(4, m.tile * .18)); ctx.fill(); ctx.stroke(); }
            else { ctx.fillRect(x + 1, y + 1, m.tile - 2, m.tile - 2); ctx.strokeRect(x + 1, y + 1, m.tile - 2, m.tile - 2); }
          } else if (cell === '.' || cell === 'o') {
            ctx.fillStyle = cell === 'o' ? (colors.gold || '#ffd166') : 'rgba(255,236,170,.92)';
            ctx.shadowColor = cell === 'o' ? (colors.gold || '#ffd166') : 'transparent';
            ctx.shadowBlur = cell === 'o' && !rakGameIsLadaMode() ? 8 : 0;
            ctx.beginPath();
            ctx.arc(x + m.tile / 2, y + m.tile / 2, cell === 'o' ? Math.max(4, m.tile * .20) : Math.max(2, m.tile * .08), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }
      state.ghosts.forEach((g) => { const gp = actorDrawPos(g, m); drawGhost(gp.x, gp.y, m.tile * .45, g, colors); });
      const pp = actorDrawPos(state.player, m);
      drawPlayer(pp.x, pp.y, m.tile * .48, colors);
      if (!state.running || state.paused || state.over) {
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, 0, m.w, m.h); ctx.restore();
      }
    };

    const updateHud = () => {
      if (hud) hud.innerHTML = `${gamesStatLine('Total', pampuchTotalScore(state))}${gamesStatLine('Best', Number(best && best.bestScore || 0) || 0)}${gamesStatLine('Points', `${state.points || 0}/${state.totalPoints || 0}`)}${gamesStatLine('Životy', state.lives || 0)}`;
      body.querySelectorAll('[data-pampuch-level]').forEach((btn) => btn.classList.toggle('isActive', Number(btn.dataset.pampuchLevel || 0) === Number(state.levelIndex || 0)));
    };

    const loop = (ts) => {
      if (!rakGameShouldTick()) { state.lastTs = 0; state.raf = 0; return; }
      const dt = rakGameDelta(state, ts);
      if (!state.over && state.running && !state.paused) {
        state.moveAcc += dt;
        state.invuln = Math.max(0, Number(state.invuln || 0) - dt);
        const tickMs = Math.max(180, Number(state.tickMs || PAMP_BASE_TICK_MS) || PAMP_BASE_TICK_MS);
        let guard = 0;
        while (state.moveAcc >= tickMs && guard < 4) {
          state.moveAcc -= tickMs;
          stepGame(ts);
          guard += 1;
          if (state.over) break;
        }
      }
      updateHud();
      draw();
      state.raf = rakGameRequestFrame(state, loop);
    };
    state.raf = rakGameRequestFrame(state, loop);
    addCleanup(() => { cancelAnimationFrame(state.raf); canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('pointerup', pointerEnd); canvas.removeEventListener('pointercancel', pointerEnd); document.removeEventListener('keydown', handleKey); if (state.over) finishPampuch(); });
    draw();
    setActiveState('pampuch', state);
  }


  // Daily challenge --------------------------------------------------------
  function dailySeed() {
    const d = new Date(); d.setHours(0,0,0,0);
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }
  function dailyChallengeId() { return DAILY_MODES[dailySeed() % DAILY_MODES.length]; }
  function dailyLabel(mode) {
    return mode === 'aim' ? 'Aim Trainer' : mode === 'reaction' ? 'Reaction Test' : mode === 'memory' ? 'Pexeso' : mode === 'mines' ? 'Miny' : mode === 'bubble' ? 'Bubble Shooter' : mode === 'doodle' ? 'Doodle Jump' : mode === 'brick' ? 'Brick Breaker' : mode === 'shooter' ? 'Space Shooter' : mode === 'bomber' ? 'Bomberman mini' : mode === 'pampuch' ? 'Pampuch' : mode === 'ships' ? 'Lodě online' : 'Challenge';
  }
  function dailyText(mode) {
    if (mode === 'aim') return '20+ přesných zásahů za 30 sekund.';
    if (mode === 'reaction') return '5 rychlých reakcí na změnu barvy.';
    if (mode === 'memory') return 'Najdi páry co nejrychleji.';
    if (mode === 'mines') return 'Vyčisti minové pole bez chyby.';
    if (mode === 'bubble') return 'Vyčisti bubliny a drž combo.';
    if (mode === 'doodle') return 'Vyskoč co nejvýš.';
    if (mode === 'brick') return 'Rozbij co nejvíc bloků.';
    if (mode === 'shooter') return 'Přežij vesmírnou vlnu.';
    if (mode === 'bomber') return 'Znič příšerky v bludišti.';
    if (mode === 'pampuch') return 'Projdi bludiště, seber body a uteč duchům.';
    if (mode === 'ships') return 'Vyhraj online námořní souboj.';
    return 'Každý den jiná výzva.';
  }
  function dailyScoreGameId(mode) {
    const id = key(mode || 'daily');
    return DAILY_MODES.includes(id) ? id : 'daily';
  }
  function dailyLeaderboardGameId(mode) {
    const id = dailyScoreGameId(mode);
    return id === 'daily' ? 'daily' : ('daily_' + id);
  }
  function dailySourceValueForStatId(statId, sourceId, sourcePatch, sourceMerged) {
    const sid = key(statId);
    const id = key(sourceId);
    const patch = sourcePatch || {};
    const merged = sourceMerged || {};
    if (isLowBetter(sid)) {
      const raw = Number(patch.bestTimeMs || patch.timeMs || patch.elapsedMs || merged.bestTimeMs || 0) || 0;
      return raw > 0 ? raw : 0;
    }
    const score = Number(patch.bestScore || patch.score || merged.bestScore || merged.leaderboardValue || 0) || 0;
    if (score > 0) return score;
    const directPoints = Number(patch.points || merged.points || 0) || 0;
    return directPoints > 0 ? decodePoints(id, directPoints) : 0;
  }
  function dailyScoreUnit(mode) {
    const id = dailyScoreGameId(mode);
    return gameMeta(id).unit || 'bodů';
  }
  function dailyScoreTitle(mode) {
    return 'Top score dnešní hry: ' + dailyLabel(mode);
  }
  function renderDaily(body) {
    const mode = dailyChallengeId();
    const label = gamesDailySafeLabel(dailyLabel(mode), 'Challenge');
    const description = gamesDailySafeDescription(dailyText(mode));
    const scoreGame = dailyScoreGameId(mode);
    const dailyStatGame = dailyLeaderboardGameId(scoreGame);
    const sourceUnit = gamesSafeScoreUnit(dailyScoreUnit(mode), 'bodů');
    const scoreTitle = gamesDailySafeLabel('Top score dnešní challenge: ' + dailyLabel(scoreGame), 'Top score dnešní challenge');
    body.innerHTML = `<div class="arcadeStage dailyStage"><div class="arcadeHud arcadeHudSingleLine">${gamesStatLine('Dnešní hra', label)}${gamesStatLine('Datum', new Date().toLocaleDateString('cs-CZ'))}${gamesStatLine('Měří se', sourceUnit)}</div><div class="arcadeBar arcadePanel uPad12"><div class="arcadeStatus"><strong>Denní challenge:</strong> ${escapeHtml(description)} Top výsledky níže jsou jen pro dnešní hru.</div></div><div class="arcadeControls"><button type="button" class="gameControlBtn" id="dailyStartBtn">Spustit dnešní výzvu</button><button type="button" class="gameControlBtn" id="dailyResetBtn">Obnovit</button></div>${gamesTop3Block(dailyStatGame, sourceUnit, 5, scoreTitle).replace('gamesTop5ScrollCard', 'gamesTop5ScrollCard arcadeTopScoreTight')}</div>`;
    const start = () => {
      if (window.app) window.app.dailyChallengeSession = { active: true, mode: scoreGame, dateKey: String(dailySeed()), startedAt: Date.now() };
      if (mode === 'aim') renderAim(body, { challenge: true, duration: 30000 });
      else if (mode === 'reaction') renderReaction(body);
      else if (mode === 'memory') renderMemory(body);
      else if (mode === 'mines') renderMines(body);
      else if (mode === 'bubble') renderBubble(body);
      else if (mode === 'doodle') renderDoodle(body);
      else if (mode === 'brick') renderBrick(body);
      else if (mode === 'shooter') renderShooter(body);
      else if (mode === 'bomber') renderBomber(body, { challenge: true });
      else if (mode === 'pampuch') renderPampuch(body);
      else if (mode === 'ships') renderShips(body);
    };
    body.querySelector('#dailyStartBtn').addEventListener('click', start);
    body.querySelector('#dailyResetBtn').addEventListener('click', () => renderDaily(body));
    setActiveState('daily', { mode });
  }


  function getRakDailyChallengeScoreBridgeHealth() {
    return {
      ok: typeof gamesRecordDailyChallengeStat === 'function' && typeof gamesGetDailyChallengeSession === 'function',
      mode: 'daily-challenge-current-day-isolated-v983',
      version: String(window.APP_VERSION || '1.2 (1.65)'),
      sourceModes: DAILY_MODES.slice(),
      targetGame: 'daily',
      note: 'Výsledek dnešní hry se ukládá jen do denního leaderboardu aktuálního dne; běžné skóre hry zůstává oddělené.'
    };
  }
  window.getRakDailyChallengeScoreBridgeHealth = getRakDailyChallengeScoreBridgeHealth;

  function getRakReactionTopScoreVisibilityHealth() {
    return {
      ok: true,
      mode: 'reaction-top-score-visibility-v920',
      version: String(window.APP_VERSION || '1.2 (1.65)'),
      scope: 'Reaction Test layout',
      fix: 'Reaction/Daily shell má viditelný overflow a menší reakční plochu, aby Top score nezůstalo pod spodní vrstvou.',
      note: 'Browser/mobil test je pořád ruční.'
    };
  }
  window.getRakReactionTopScoreVisibilityHealth = getRakReactionTopScoreVisibilityHealth;


  // v.1.5 (920): Read-only guard pro návaznost oprav Reaction top score a Denní challenge.
  // Kontrola jen skládá signály, nic neukládá, nemaže a nemění online flow.
  function getRakGamesPostFixScoreFlowHealth() {
    const reaction = typeof getRakReactionTopScoreVisibilityHealth === 'function' ? getRakReactionTopScoreVisibilityHealth() : null;
    const dailyBridge = typeof getRakDailyChallengeScoreBridgeHealth === 'function' ? getRakDailyChallengeScoreBridgeHealth() : null;
    const topScore = typeof getRakGamesTopScoreDomHardeningHealth === 'function' ? getRakGamesTopScoreDomHardeningHealth() : null;
    const dailyDom = typeof getRakGamesDailyChallengeDomHardeningHealth === 'function' ? getRakGamesDailyChallengeDomHardeningHealth() : null;
    const ok = !!(reaction && reaction.ok && dailyBridge && dailyBridge.ok && topScore && topScore.ok && dailyDom && dailyDom.ok);
    return {
      ok,
      mode: 'games-post-fix-score-flow-v920',
      version: String(window.APP_VERSION || '1.2 (1.65)'),
      scope: 'Reaction Test Top score + Denní challenge score bridge',
      checks: {
        reactionTopScoreVisible: !!(reaction && reaction.ok),
        dailyChallengeBridge: !!(dailyBridge && dailyBridge.ok),
        topScoreDateTime: !!(topScore && topScore.ok),
        dailyChallengeDomSafe: !!(dailyDom && dailyDom.ok)
      },
      note: 'Read-only guard po opravě z v920: Reaction Top score musí být vidět a Denní challenge musí ukládat/zobrazovat vlastní Top score.'
    };
  }
  window.getRakGamesPostFixScoreFlowHealth = getRakGamesPostFixScoreFlowHealth;



  // v.1.5 (920): Read-only DOM/security guard pro herní akční texty a toast/stavové popisky.
  // Nezasahuje do gameplaye ani online flow; jen ověřuje, že pro další hardening existuje bezpečný textový formatter.
  const GAMES_ACTION_TEXT_DOM_HARDENING = {
    mode: 'games-action-text-dom-hardening-v920',
    sinks: ['arcadeActionButton', 'gameMenuAction', 'challengeAction', 'toastStatus'],
    escapedFields: ['buttonLabel', 'actionTitle', 'statusText', 'ariaLabel'],
    maxActionLength: 80
  };

  function gamesActionTextSafe(value, fallback) {
    return gamesSafePlainText(value, fallback || 'Akce', GAMES_ACTION_TEXT_DOM_HARDENING.maxActionLength);
  }

  function getRakGamesActionTextDomHardeningHealth() {
    const unsafe = '<img src=x onerror=alert(1)> Hrát <script>alert(1)</script>';
    const safeLabel = gamesActionTextSafe(unsafe, 'Hrát');
    const probeHtml = '<button type="button" aria-label="' + escapeHtml(safeLabel) + '">' + escapeHtml(safeLabel) + '</button>';
    const ok = probeHtml.includes('&lt;img') && probeHtml.includes('&lt;script') && !probeHtml.includes('<img') && !probeHtml.includes('<script');
    return {
      ok,
      mode: GAMES_ACTION_TEXT_DOM_HARDENING.mode,
      version: String(window.APP_VERSION || '1.2 (1.65)'),
      scope: 'Herní akční texty, tlačítka a toast/stavové popisky',
      sinks: GAMES_ACTION_TEXT_DOM_HARDENING.sinks.slice(),
      escapedFields: GAMES_ACTION_TEXT_DOM_HARDENING.escapedFields.slice(),
      maxActionLength: GAMES_ACTION_TEXT_DOM_HARDENING.maxActionLength,
      probeEscaped: ok,
      note: 'Read-only guard pro další malý DOM/security krok; nečte storage, nemění gameplay ani online flow.'
    };
  }
  window.getRakGamesActionTextDomHardeningHealth = getRakGamesActionTextDomHardeningHealth;


  // v.1.5 (920): Read-only DOM/security guard pro herní modaly, overlaye a výsledkové texty.
  // Zůstává bez zásahu do gameplaye, online flow a Supabase.
  const GAMES_OVERLAY_RESULT_DOM_HARDENING = {
    mode: 'games-overlay-result-dom-hardening-v920',
    sinks: ['gameResultOverlay', 'arcadeOverlay', 'resultSummary', 'modalStatus'],
    escapedFields: ['title', 'message', 'resultText', 'playerName', 'ctaLabel'],
    maxTitleLength: 80,
    maxMessageLength: 220
  };

  function gamesOverlaySafeTitle(value, fallback) {
    return gamesSafePlainText(value, fallback || 'Výsledek', GAMES_OVERLAY_RESULT_DOM_HARDENING.maxTitleLength);
  }

  function gamesOverlaySafeMessage(value, fallback) {
    return gamesSafePlainText(value, fallback || 'Hotovo.', GAMES_OVERLAY_RESULT_DOM_HARDENING.maxMessageLength);
  }

  function getRakGamesOverlayResultDomHardeningHealth() {
    const unsafeTitle = '<img src=x onerror=alert(1)> Výhra';
    const unsafeMessage = '<script>alert(1)</script> Výsledek hráče <svg onload=alert(1)>';
    const title = gamesOverlaySafeTitle(unsafeTitle, 'Výsledek');
    const message = gamesOverlaySafeMessage(unsafeMessage, 'Hotovo.');
    const probeHtml = '<div class="tttOverlay"><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(message) + '</p><button aria-label="' + escapeHtml(title) + '">' + escapeHtml(gamesActionTextSafe('Zavřít<script>', 'Zavřít')) + '</button></div>';
    const ok = probeHtml.includes('&lt;img') && probeHtml.includes('&lt;script') && probeHtml.includes('&lt;svg') && !probeHtml.includes('<img') && !probeHtml.includes('<script') && !probeHtml.includes('<svg');
    return {
      ok,
      mode: GAMES_OVERLAY_RESULT_DOM_HARDENING.mode,
      version: String(window.APP_VERSION || '1.2 (1.65)'),
      scope: 'Herní modaly, overlaye a výsledkové texty',
      sinks: GAMES_OVERLAY_RESULT_DOM_HARDENING.sinks.slice(),
      escapedFields: GAMES_OVERLAY_RESULT_DOM_HARDENING.escapedFields.slice(),
      maxTitleLength: GAMES_OVERLAY_RESULT_DOM_HARDENING.maxTitleLength,
      maxMessageLength: GAMES_OVERLAY_RESULT_DOM_HARDENING.maxMessageLength,
      probeEscaped: ok,
      note: 'Read-only guard pro další malý DOM/security krok; nemění gameplay, online flow ani Supabase.'
    };
  }
  window.getRakGamesOverlayResultDomHardeningHealth = getRakGamesOverlayResultDomHardeningHealth;


  const renderers = { aim: renderAim, reaction: renderReaction, tetris: renderTetris, shooter: renderShooter, brick: renderBrick, doodle: renderDoodle, bubble: renderBubble, sudoku: renderSudoku, mines: renderMines, memory: renderMemory, bomber: renderBomber, pampuch: renderPampuch, ships: renderShips, daily: renderDaily };

  function shipsReadInviteCodeFromCurrentUrl() {
    try {
      const raw = String((window.location.hash || '') + '&' + (window.location.search || ''));
      if (!/(?:^|[?#&])(?:games|game)=ships(?:$|[&#=])|(?:^|[?#&])(?:shipsInvite|ships|battleship)=/i.test(raw)) return '';
      let code = '';
      const paramsText = raw.replace(/^#/, '&').replace(/^\?/, '&');
      const match = paramsText.match(/(?:^|[?&#])(?:invite|code|shipsInvite|ships|battleship)=([^&#]+)/i);
      if (match && match[1]) code = decodeURIComponent(match[1]);
      if (!code && typeof tttFindInviteCodeInParamText === 'function') code = tttFindInviteCodeInParamText(raw);
      return String(code || '').replace(/\D/g, '').slice(0, 4);
    } catch (err) { return ''; }
  }

  function shipsScheduleOpenFromUrl(source) {
    const code = shipsReadInviteCodeFromCurrentUrl();
    if (!code) return false;
    if (window.__rakShipsUrlInviteHandled === code && window.app && window.app.activeGameShell === 'ships') return true;
    window.__rakShipsUrlInviteHandled = code;
    window.__rakShipsPendingInviteCode = code;
    const open = () => {
      try {
        if (typeof window.openShipsFromInviteCode === 'function') return void window.openShipsFromInviteCode(code, { source: source || 'url' });
      } catch (err) {}
    };
    setTimeout(open, 0);
    setTimeout(open, 180);
    return true;
  }

  // v.1.5 (851): pojistka pro případ, kdy se #games=ships&invite načte dřív než modul Lodí.
  shipsScheduleOpenFromUrl('games-arcade-boot');
  if (!window.__rakShipsArcadeUrlInviteBound) {
    window.__rakShipsArcadeUrlInviteBound = true;
    window.addEventListener('hashchange', () => shipsScheduleOpenFromUrl('games-arcade-hashchange'));
    window.addEventListener('popstate', () => shipsScheduleOpenFromUrl('games-arcade-popstate'));
  }

  function runArcadeGamesFullAudit() {
    const ids = CORE_GAMES.slice();
    const legacy = LEGACY_RENDER_GAMES.slice();
    const arcade = ARCADE_RENDER_GAMES.slice();
    const missingMeta = ids.filter((id) => !META[id]);
    const missingRenderer = arcade.filter((id) => typeof renderers[id] !== 'function');
    const missingStats = ids.filter((id) => {
      try { return !getAccountStat(gamesGetActiveAccount(), id); } catch (err) { return true; }
    });
    const allHot = EXTRA_GAMES.length === 0;
    const completedOnlyGuard = typeof window.gamesRecordStat === 'function';
    return {
      version: '1.2 (1.65)',
      ok: !missingMeta.length && !missingRenderer.length && allHot && completedOnlyGuard,
      totalGames: ids.length,
      coreGames: ids,
      extraGames: EXTRA_GAMES.slice(),
      legacyRenderers: legacy,
      arcadeRenderers: arcade,
      missingMeta,
      missingRenderer,
      missingStats,
      completedOnlyGuard,
      topScoreScroll: true,
      themeBackground: true,
      touchGuard: true,
      notes: [
        'Build 741 opravuje statistiky aktuálního roku po aktuální měsíc, skládá Lodě od spodní lišty a zklidňuje Pampuchovy duchy bez cíleného honění.',
        'Reálnou hratelnost, citlivost dotyku a RPC zápis skóre je potřeba potvrdit na mobilu.'
      ]
    };
  }
  window.runArcadeGamesFullAudit = runArcadeGamesFullAudit;
  window.getArcadeGamesFullAudit = runArcadeGamesFullAudit;

  window.__rakGamePerfManager = gamePerf;

  function isExtraGame(id) { return EXTRA_GAMES.includes(key(id)); }

  // Ensure launch tiles render immediately if already on the page.
  const bootTiles = () => { try { renderLaunchTiles(); scheduleStatsExtended('boot'); } catch (err) {} };
  bootTiles();
  if (typeof MutationObserver !== 'undefined') {
    let launchObserverPending = false;
    const scheduleLaunchObserverRender = () => {
      if (launchObserverPending) {
        gamePerf.launchObserverSkips = Number(gamePerf.launchObserverSkips || 0) + 1;
        return;
      }
      launchObserverPending = true;
      const run = () => {
        launchObserverPending = false;
        const grid = document.getElementById('gamesGrid');
        if (!grid) return;
        if (grid.children.length && grid.querySelector('[data-game="aim"]')) {
          gamePerf.launchObserverSkips = Number(gamePerf.launchObserverSkips || 0) + 1;
          return;
        }
        gamePerf.launchObserverBatches = Number(gamePerf.launchObserverBatches || 0) + 1;
        renderLaunchTiles();
      };
      if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(run);
      else setTimeout(run, 40);
    };
    const observerRoot = document.getElementById('games') || document.body || document.documentElement;
    const obs = new MutationObserver((mutations) => {
      const relevant = Array.prototype.some.call(mutations || [], (mutation) => {
        const target = mutation && mutation.target;
        if (target && (target.id === 'games' || target.id === 'gamesGrid')) return true;
        if (target && target.closest && target.closest('#games')) return true;
        return Array.prototype.some.call((mutation && mutation.addedNodes) || [], (node) => (
          !!(node && (node.id === 'games' || node.id === 'gamesGrid' || (node.querySelector && node.querySelector('#games, #gamesGrid'))))
        ));
      });
      if (!relevant) {
        gamePerf.launchObserverIgnored = Number(gamePerf.launchObserverIgnored || 0) + 1;
        return;
      }
      scheduleLaunchObserverRender();
    });
    obs.observe(observerRoot, { childList: true, subtree: true });
    gamePerf.launchObserverRoot = observerRoot && observerRoot.id ? observerRoot.id : (observerRoot === document.body ? 'body' : 'document');
    addCleanup(() => obs.disconnect());
  }

})();
