(() => {
  if (window.__rakArcadeLoaded) return;
  window.__rakArcadeLoaded = true;

  // v.1.1 (697): Bomberman mini bludiště, příšerky, upgrady a denní challenge rotace.
  const CORE_GAMES = ['ttt', '2048', 'snake', 'flap', 'aim', 'reaction', 'tetris', 'shooter', 'brick', 'doodle', 'bubble', 'sudoku', 'mines', 'memory', 'bomber', 'daily'];
  const EXTRA_GAMES = [];
  const ALL_GAMES = CORE_GAMES.concat(EXTRA_GAMES);
  const LEGACY_RENDER_GAMES = ['2048', 'snake', 'flap'];
  const ARCADE_RENDER_GAMES = ['aim', 'reaction', 'tetris', 'shooter', 'brick', 'doodle', 'bubble', 'sudoku', 'mines', 'memory', 'bomber', 'daily'];
  const POINT_SCALE = 1000000000;
  const ARC_KEY = 'arcade';
  const DAILY_MODES = ['aim', 'reaction', 'memory', 'mines', 'bubble', 'doodle', 'brick', 'shooter', 'bomber'];

  const META = {
    ttt: { title: 'Piškvorky', subtitle: 'AI, lokální duel a pozvánky', unit: 'her', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5.2" y="5.2" width="13.6" height="13.6" rx="3"></rect><path d="M9 9.1l3 3 3-3"></path><circle cx="9.2" cy="15" r="1.1"></circle><circle cx="14.8" cy="15" r="1.1"></circle><path d="M8.1 6.5v11M12 6.5v11M15.9 6.5v11M6.5 10.1h11M6.5 13.9h11"></path></svg>' },
    '2048': { title: '2048', subtitle: 'Skládej čísla do sebe', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.8" y="4.8" width="5.8" height="5.8" rx="1.8"></rect><rect x="13.4" y="4.8" width="5.8" height="5.8" rx="1.8"></rect><rect x="4.8" y="13.4" width="5.8" height="5.8" rx="1.8"></rect><rect x="13.4" y="13.4" width="5.8" height="5.8" rx="1.8"></rect></svg>' },
    snake: { title: 'Snake', subtitle: 'Klasická hadí hra', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 16.5c1.8-5 4.3-8 8.1-8 2.5 0 4.5 1.1 5.9 3"></path><circle cx="18.3" cy="11.7" r="2"></circle></svg>' },
    flap: { title: 'Flappy Car', subtitle: 'Klepni a proleť mezi překážkami', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 14.8c2.2-4.8 5.8-7 8.4-7 1.8 0 3.4.7 4.8 2"></path><path d="M9.2 11.2c1.6 0 3.2.4 4.8 1.5"></path><path d="M14.2 14.5c1.4 0 2.8.6 4.2 1.9"></path></svg>' },
    aim: { title: 'Aim Trainer', subtitle: 'Klikání na targety, combo a accuracy', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6.8"></circle><circle cx="12" cy="12" r="2.2"></circle><path d="M12 2.8v3.2M21.2 12h-3.2M12 21.2V18M2.8 12H6"></path></svg>' },
    reaction: { title: 'Reaction Test', subtitle: 'Klikni po změně barvy', unit: 'ms', mode: 'low', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 6h10M7 18h10"></path><path d="M9 6v4l-2 2 2 2v4M15 6v4l2 2-2 2v4"></path></svg>' },
    tetris: { title: 'Tetris', subtitle: 'Moderní glow styl a ghost piece', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5h4v4H5zM9 5h4v4H9zM9 9h4v4H9zM13 9h4v4h-4zM13 13h4v4h-4z"></path></svg>' },
    shooter: { title: 'Space Shooter', subtitle: 'Neon střílečka se score', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l3.2 6.2L21 12l-5.8 2.8L12 21l-3.2-6.2L3 12l5.8-2.8z"></path><path d="M12 8.5v7"></path></svg>' },
    brick: { title: 'Brick Breaker', subtitle: 'Neon arkanoid a combo odrazy', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16v3H4zM6 13h12v3H6zM8 18h8v2H8z"></path><path d="M12 4v3"></path></svg>' },
    doodle: { title: 'Doodle Jump', subtitle: 'Nekonečné skákání na mobil', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 19c2-4 4-5 8-8"></path><path d="M12 4l2.2 4.6L19 11l-4.8 1.2L12 17l-2.2-4.8L5 11l4.8-2.4z"></path></svg>' },
    bubble: { title: 'Bubble Shooter', subtitle: 'Relax, komba a denní rekordy', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="9" r="3"></circle><circle cx="15.5" cy="10.5" r="2.6"></circle><circle cx="12" cy="16" r="3.4"></circle></svg>' },
    sudoku: { title: 'Sudoku', subtitle: 'Různé obtížnosti a časy', unit: 'ms', mode: 'low', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="4.5" width="15" height="15" rx="2"></rect><path d="M4.5 10h15M4.5 15h15M10 4.5v15M15 4.5v15"></path></svg>' },
    mines: { title: 'Minesweeper', subtitle: 'Rychlá pauza a nejlepší časy', unit: 'ms', mode: 'low', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"></circle><path d="M12 5v4M12 15v4M5 12h4M15 12h4M8.3 8.3l2.8 2.8M12.9 12.9l2.8 2.8M15.7 8.3l-2.8 2.8M11.1 12.9l-2.8 2.8"></path></svg>' },
    memory: { title: 'Memory / Pexeso', subtitle: 'Moderní animace a rychlé páry', unit: 'ms', mode: 'low', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="5" width="6.2" height="6.2" rx="1.5"></rect><rect x="13.3" y="5" width="6.2" height="6.2" rx="1.5"></rect><rect x="4.5" y="13.8" width="6.2" height="6.2" rx="1.5"></rect><rect x="13.3" y="13.8" width="6.2" height="6.2" rx="1.5"></rect></svg>' },
    bomber: { title: 'Bomberman mini', subtitle: 'Bludiště, bomby, příšerky a upgrady', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5h6v3H9z"></path><circle cx="12" cy="14" r="5"></circle><path d="M15.8 10.2l2-2"></path></svg>' },
    daily: { title: 'Denní challenge', subtitle: 'Každý den jiná hra a stejná výzva', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="6.5" width="15" height="13" rx="2"></rect><path d="M8 4.5v4M16 4.5v4M4.5 10h15"></path><path d="M8 14l2.1 2.1L16.3 10"></path></svg>' }
  };

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
    if (meta.mode === 'low') return st.bestTimeMs ? fmtTime(st.bestTimeMs) : '—';
    return `${Number(st.bestScore || st.leaderboardValue || 0) || 0}`;
  }


  const GAMES_RANK_DEFS = [
    { name: 'Vemeno', minXp: 0 },
    { name: 'Učeň', minXp: 900 },
    { name: 'Seřizovač', minXp: 2400 },
    { name: 'Týmař', minXp: 5200 },
    { name: 'Mistr', minXp: 9500 },
    { name: 'Senior', minXp: 15500 },
    { name: 'Legenda RaK', minXp: 24000 }
  ];

  function gamesBuildProgressSummary(account) {
    const total = gamesGetTotals(account);
    const achievements = gamesGetAchievementCount(account);
    const wins = Number(total.ttt && total.ttt.wins || 0) + Math.max(Number(total.g2048 && total.g2048.bestScore || 0) > 0 ? 1 : 0, 0) + Math.max(Number(total.snake && total.snake.bestScore || 0) > 0 ? 1 : 0, 0) + Math.max(Number(total.flap && total.flap.bestScore || 0) > 0 ? 1 : 0, 0);
    const plays = Number(total.totalPlays || 0) || 0;
    const bestScore = Number(total.bestScore || 0) || 0;
    const xp = Math.max(0, Math.round((plays * 6) + (wins * 18) + (achievements * 55) + Math.min(900, Math.floor(bestScore / 6))));
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
    const favorite = (() => {
      const defs = ALL_GAMES.map((id) => Object.assign({ id }, META[id] || { title: id, subtitle: '', unit: 'bodů', mode: 'high' }));
      let best = defs[0] || null;
      let bestScoreLocal = -1;
      defs.forEach((game) => {
        const stat = getArcadeProfileStat(account, game.id);
        const value = game.id === 'ttt' ? Number(stat.plays || 0) || 0 : (game.mode === 'low' ? Number(stat.bestTimeMs || 0) : Number(stat.bestScore || 0));
        if (value > bestScoreLocal) {
          bestScoreLocal = value;
          best = game;
        }
      });
      return best ? best.title : '—';
    })();
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
    const label = String(activeShift && activeShift.label ? activeShift.label : '').toLowerCase();
    return {
      dateKey: gamesLocalDateKey(when),
      hour,
      day,
      isWeekend: day === 0 || day === 6,
      isNightHours: hour >= 22 || hour < 6,
      isEarlyMorning: hour >= 4 && hour < 7,
      isLunchWindow: hour >= 11 && hour < 14,
      isOnShift: !!activeShift,
      isNightShift: !!activeShift && label.includes('noční'),
      isMorningShift: !!activeShift && label.includes('ranní'),
      shiftTeam: String(activeShift && activeShift.team ? activeShift.team : '').trim(),
      shiftLabel: String(activeShift && activeShift.label ? activeShift.label : '').trim()
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
      playedDays: [],
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
    const days = Array.isArray(next.playedDays) ? next.playedDays.map(String) : [];
    if (ctx.dateKey && !days.includes(ctx.dateKey)) days.push(ctx.dateKey);
    next.playedDays = days.slice(-180);
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
      playedDays: [],
      shiftTeams: {},
      shiftTeamCount: 0,
      distinctPlayedDays: 0
    };
    const days = new Set();
    const teams = {};
    contexts.forEach((ctx) => {
      ['completedPlays','weekendPlays','nightHourPlays','earlyMorningPlays','lunchWindowPlays','onShiftPlays','nightShiftPlays','morningShiftPlays'].forEach((field) => {
        totals[field] += Number(ctx && ctx[field] || 0) || 0;
      });
      (Array.isArray(ctx && ctx.playedDays) ? ctx.playedDays : []).forEach(day => { if (day) days.add(String(day)); });
      const sourceTeams = ctx && ctx.shiftTeams && typeof ctx.shiftTeams === 'object' ? ctx.shiftTeams : {};
      Object.keys(sourceTeams).forEach((team) => {
        teams[team] = (Number(teams[team] || 0) || 0) + (Number(sourceTeams[team] || 0) || 0);
      });
    });
    totals.playedDays = Array.from(days).sort();
    totals.distinctPlayedDays = totals.playedDays.length;
    totals.shiftTeams = teams;
    totals.shiftTeamCount = Object.keys(teams).length;
    return totals;
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
    return nextPatch;
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
        const display = getArcadeProfileDisplay(acc, game.id);
        const unit = game.unit || '';
        const suffix = game.id === 'ttt' ? '' : (unit ? ' ' + unit : '');
        return '<div class="gamesProfileRow"><strong>' + escapeHtml(game.title) + '</strong><span>' + escapeHtml(display + suffix) + '</span></div>';
      }).join('');
      const initials = String(acc.name || acc.id || '?').trim().slice(0, 2).toUpperCase();
      const xpPct = Math.max(0, Math.min(100, Math.round(Number(progress.rankPct || 0) || 0)));
      const isActive = String(acc.id) === String(activeId);
      return [
        '<details class="gamesStatsCard' + (isActive ? ' isActive' : '') + '"' + (isActive ? ' open' : '') + '>',
        '  <summary class="gamesStatsCardSummary">',
        '    <div class="gamesStatsCardHead">',
        '      <div class="gamesProfileAvatar">' + escapeHtml(initials) + '</div>',
        '      <div class="gamesStatsCardHeadMain">',
        '        <div class="gamesStatsCardName">' + escapeHtml(acc.name || ('Hráč ' + String(acc.id || ''))) + '</div>',
        '        <div class="gamesStatsCardId">' + escapeHtml(acc.id || '') + '</div>',
        '        <div class="gamesStatsCardMeta gamesStatsCardMetaDense">' + escapeHtml(progress.rank) + ' · Level ' + String(progress.level) + ' · XP ' + String(progress.xp) + ' · Win rate ' + String(progress.winRate) + '%</div>',
        '      </div>',
        '      <div class="gamesStatsCardTotal">' + String(progress.plays) + ' her</div>',
        '    </div>',
        '  </summary>',
        '  <div class="gamesStatsCardBody">',
        '    <div class="gamesStatsXpBar"><span style="--fill:' + String(xpPct) + '%"></span></div>',
        '    <div class="gamesStatsCardMeta gamesStatsCardMetaDense">Nejoblíbenější hra: ' + escapeHtml(progress.favorite) + ' · Achievementy: ' + String(progress.achievements) + '</div>',
        profileRows,
        '    <div class="gamesStatsCardMeta">' + escapeHtml(last) + '</div>',
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
      { id: 'games_25', title: 'Zahřívací směna', desc: 'Dokonči 25 započítaných her.', goalText: '25 dokončených her', progress: (a) => a.totalPlays, target: 25 },
      { id: 'games_75', title: 'Rozjetá mašina', desc: 'Dokonči 75 započítaných her.', goalText: '75 dokončených her', progress: (a) => a.totalPlays, target: 75 },
      { id: 'games_150', title: 'Držák po směně', desc: 'Dokonči 150 započítaných her.', goalText: '150 dokončených her', progress: (a) => a.totalPlays, target: 150 },
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
      { id: 'tetris_12000', title: 'Tetris směnový boss', desc: 'Nahraj 12 000 bodů v Tetrisu.', goalText: '12 000 bodů', progress: (a) => arcadeStat(a.account, 'tetris', 'bestScore'), target: 12000 },
      { id: 'tetris_lines_40', title: 'Čistič řádků', desc: 'Smaž v Tetrisu 40 řádků v jedné dokončené hře.', goalText: '40 řádků', progress: (a) => arcadeStat(a.account, 'tetris', 'bestLines'), target: 40 },
      { id: 'tetris_level_10', title: 'Level 10', desc: 'Dostaň se v Tetrisu na level 10.', goalText: 'level 10', progress: (a) => arcadeStat(a.account, 'tetris', 'bestLevel'), target: 10 },
      { id: 'tetris_runs_50', title: 'Padající bloky', desc: 'Dokonči 50 her Tetrisu.', goalText: '50 dokončení', progress: (a) => arcadeStat(a.account, 'tetris', 'plays'), target: 50 },
      { id: 'shooter_3500', title: 'Space ace', desc: 'Nahraj 3 500 bodů ve Space Shooteru.', goalText: '3 500 bodů', progress: (a) => arcadeStat(a.account, 'shooter', 'bestScore'), target: 3500 },
      { id: 'shooter_7000', title: 'Velitel hangáru', desc: 'Nahraj 7 000 bodů ve Space Shooteru.', goalText: '7 000 bodů', progress: (a) => arcadeStat(a.account, 'shooter', 'bestScore'), target: 7000 },
      { id: 'shooter_hits_150', title: 'Přesná palba', desc: 'Dej ve Space Shooteru 150 zásahů v jedné dokončené hře.', goalText: '150 zásahů', progress: (a) => arcadeStat(a.account, 'shooter', 'bestHits'), target: 150 },
      { id: 'shooter_survive_180', title: 'Tři minuty ve vesmíru', desc: 'Přežij ve Space Shooteru aspoň 180 sekund.', goalText: '180 s', progress: (a) => arcadeStat(a.account, 'shooter', 'bestSurvivalSec'), target: 180 },
      { id: 'shooter_runs_50', title: 'Pilot po směně', desc: 'Dokonči 50 her Space Shooteru.', goalText: '50 dokončení', progress: (a) => arcadeStat(a.account, 'shooter', 'plays'), target: 50 },
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
      { id: 'doodle_runs_50', title: 'Skáču po směně', desc: 'Dokonči 50 her Doodle Jumpu.', goalText: '50 dokončení', progress: (a) => arcadeStat(a.account, 'doodle', 'plays'), target: 50 },
      { id: 'bubble_2500', title: 'Bubble pop', desc: 'Nahraj 2 500 bodů v Bubble Shooteru.', goalText: '2 500 bodů', progress: (a) => arcadeStat(a.account, 'bubble', 'bestScore'), target: 2500 },
      { id: 'bubble_6000', title: 'Bublinový mistr', desc: 'Nahraj 6 000 bodů v Bubble Shooteru.', goalText: '6 000 bodů', progress: (a) => arcadeStat(a.account, 'bubble', 'bestScore'), target: 6000 },
      { id: 'bubble_combo_10', title: 'Řetězová reakce', desc: 'Dej v Bubble Shooteru combo 10.', goalText: 'combo 10', progress: (a) => arcadeStat(a.account, 'bubble', 'bestCombo'), target: 10 },
      { id: 'bubble_pops_120', title: 'Praskač bublinek', desc: 'Praskni v jedné dokončené hře 120 bublinek.', goalText: '120 bublinek', progress: (a) => arcadeStat(a.account, 'bubble', 'bestPops'), target: 120 },
      { id: 'bubble_clears_10', title: 'Čistá obloha', desc: 'Vyčisti 10 her Bubble Shooteru.', goalText: '10 vyčištění', progress: (a) => arcadeStat(a.account, 'bubble', 'bestClears'), target: 10 },
      { id: 'bubble_runs_50', title: 'Bubliny pod kontrolou', desc: 'Dokonči 50 her Bubble Shooteru.', goalText: '50 dokončení', progress: (a) => arcadeStat(a.account, 'bubble', 'plays'), target: 50 },
      { id: 'sudoku_15', title: 'Sudoku hlava', desc: 'Vyřeš 15 Sudoku.', goalText: '15 dokončení', progress: (a) => arcadeStat(a.account, 'sudoku', 'plays'), target: 15 },
      { id: 'sudoku_5min', title: 'Sudoku sprint', desc: 'Vyřeš Sudoku pod 5 minut.', goalText: 'pod 5 minut', progress: (a) => { const t = arcadeStat(a.account, 'sudoku', 'bestTimeMs'); return t ? Math.max(0, 360000 - t) : 0; }, target: 60000 },
      { id: 'sudoku_100', title: 'Sudoku mistr směny', desc: 'Vyřeš 100 Sudoku.', goalText: '100 dokončení', progress: (a) => arcadeStat(a.account, 'sudoku', 'plays'), target: 100 },
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
      { id: 'daily_20', title: 'Denní držák', desc: 'Splň 20 denních challenge.', goalText: '20 challenge', progress: (a) => arcadeStat(a.account, 'daily', 'plays'), target: 20 },
      { id: 'ctx_shift_15', title: 'Hráč na směně', desc: 'Dokonči 15 her během aktivní směny.', goalText: '15 her na směně', progress: (a) => a.context.onShiftPlays || 0, target: 15 },
      { id: 'ctx_shift_60', title: 'Směnový držák', desc: 'Dokonči 60 her v čase, kdy běží směna.', goalText: '60 her na směně', progress: (a) => a.context.onShiftPlays || 0, target: 60 },
      { id: 'ctx_night_hours_20', title: 'Noční sova', desc: 'Dokonči 20 her mezi 22:00 a 6:00.', goalText: '20 nočních her', progress: (a) => a.context.nightHourPlays || 0, target: 20 },
      { id: 'ctx_night_shift_15', title: 'Noční pauza', desc: 'Dokonči 15 her přímo během noční směny.', goalText: '15 her na noční', progress: (a) => a.context.nightShiftPlays || 0, target: 15 },
      { id: 'ctx_morning_shift_25', title: 'Ranní rozjezd', desc: 'Dokonči 25 her během ranní směny.', goalText: '25 her na ranní', progress: (a) => a.context.morningShiftPlays || 0, target: 25 },
      { id: 'ctx_weekend_30', title: 'Víkendový hráč', desc: 'Dokonči 30 her o víkendu.', goalText: '30 víkendových her', progress: (a) => a.context.weekendPlays || 0, target: 30 },
      { id: 'ctx_lunch_20', title: 'Pauzový stratég', desc: 'Dokonči 20 her mezi 11:00 a 14:00.', goalText: '20 her v pauzovém čase', progress: (a) => a.context.lunchWindowPlays || 0, target: 20 },
      { id: 'ctx_days_14', title: 'Dlouhá série', desc: 'Dokonči hry ve 14 různých dnech.', goalText: '14 různých dnů', progress: (a) => a.context.distinctPlayedDays || 0, target: 14 },
      { id: 'ctx_shift_teams_4', title: 'Napříč směnami', desc: 'Dokonči hru během aktivní směny A, B, C i D.', goalText: '4 různé směny', progress: (a) => a.context.shiftTeamCount || 0, target: 4 }
    ];
  }

  function getExtendedAchievementCount(account) {
    if (!account) return 0;
    const total = gamesGetTotals(account);
    const ctx = Object.assign({ account, context: gamesGetContextTotals(account) }, total);
    return getExtendedAchievementDefs().filter((def) => Number(def.progress(ctx) || 0) >= Number(def.target || 0)).length;
  }

  function renderAchievementCard(def, current) {
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
  }

  function renderAchievementGroup(title, items, open) {
    const body = items.length
      ? items.map(item => renderAchievementCard(item.def, item.current)).join('')
      : '<div class="smallText gamesAchievementEmpty">Tady zatím nic není.</div>';
    return [
      '<details class="gamesAchievementGroup"' + (open ? ' open' : '') + '>',
      '  <summary class="gamesAchievementGroupSummary"><span>' + escapeHtml(title) + '</span><strong>' + String(items.length) + '</strong></summary>',
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
      renderAchievementGroup('Hotové', done, true),
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
#games .arcadeReactionBoard{min-height:clamp(330px, 58dvh, 560px);width:100%;border:none;color:inherit;cursor:pointer;touch-action:manipulation;background:var(--rakGlassPanelBg, linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.025))) !important;border-color:var(--rakGlassStroke, rgba(255,255,255,.14)) !important;}
#games .arcadeReactionBoard.isGo{background:radial-gradient(circle at 50% 34%, color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 74%, #ffffff) 0 14%, color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 48%, transparent) 15% 42%, transparent 68%), linear-gradient(135deg, color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 58%, #06351a), color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 22%, rgba(255,255,255,.05))) !important;border-color:color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 62%, rgba(255,255,255,.18)) !important;box-shadow:0 0 0 1px color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 42%, transparent) inset, 0 22px 58px color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 34%, rgba(0,0,0,.32)) !important;color:#fafffb !important;}
#games .arcadeReactionBoard.isBad{background:linear-gradient(180deg, rgba(255,74,104,.28), rgba(255,255,255,.03)) !important;}
#games .arcadeReactionBoard strong{font-size:clamp(28px, 10vw, 56px);letter-spacing:.02em;}
#games .arcadeReactionBoard small{font-size:14px;color:rgba(245,255,250,.76);max-width:28ch;line-height:1.35;}
#games .arcadeReactionPulse{width:96px;height:96px;border-radius:50%;background:radial-gradient(circle, color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 36%, rgba(255,255,255,.2)), transparent 68%);filter:blur(.2px);opacity:.85;}
#games .arcadeReactionBoard.isGo .arcadeReactionPulse{background:radial-gradient(circle, #ffffff 0 18%, color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 70%, #ffffff) 19% 52%, transparent 70%);box-shadow:0 0 40px color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 70%, transparent);opacity:1;}
#games .arcadeReactionBoard.isGo strong{text-shadow:0 0 22px rgba(255,255,255,.45), 0 0 34px color-mix(in srgb, var(--rakThemeAccent, var(--green2)) 56%, transparent);}
#games .arcadeReactionBoard.isGo .arcadeReactionPulse{animation:reactionPulse .72s ease-in-out infinite alternate;}
@keyframes reactionPulse{from{transform:scale(.88);opacity:.65;}to{transform:scale(1.1);opacity:1;}}
@media (max-width: 700px){#games .arcadeHudWide{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;}#games .arcadeAimBoard,#games .arcadeReactionBoard{min-height:clamp(330px, 60dvh, 560px);}#games .arcadeHud .gamesStatValue{font-size:13px;}}

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
    return Math.max(0, Math.min(gamePerf.maxDeltaMs, ts - last));
  }

  function rakGameRequestFrame(state, loop) {
    if (!isGamesPageVisible()) {
      gamePerf.hiddenSkips += 1;
      if (state) {
        state.raf = 0;
        state.lastTs = 0;
      }
      return 0;
    }
    return requestAnimationFrame(loop);
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
      return !!(document.body && (document.body.classList.contains('ladaMode') || document.body.classList.contains('lightweightMode')))
        || !!(document.documentElement && document.documentElement.dataset.lightweight === '1');
    } catch (err) {
      return false;
    }
  }

  function rakGameLeaderboardTtl() {
    const base = Number(gamePerf && gamePerf.leaderboardTtlMs || 60000) || 60000;
    return rakGameIsLadaMode() ? Math.max(base, 120000) : base;
  }

  function rakGameSetInterval(fn, delay) {
    const ms = Math.max(80, Number(delay) || 120);
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
    const ms = Math.max(20, Number(delay) || (rakGameIsLadaMode() ? 140 : 60));
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
    if (n < 1000) return `${Math.round(n)} ms`;
    const s = (n / 1000).toFixed(n < 10000 ? 2 : 1).replace(/\.0+$/, '');
    return `${s} s`;
  }

  function fmtTime(ms) { return fmtMs(ms); }
  function formatDate(ms) {
    const n = Number(ms);
    if (!Number.isFinite(n) || n <= 0) return '';
    try {
      return new Intl.DateTimeFormat('cs-CZ', { timeZone: 'Europe/Prague', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(n));
    } catch (err) {
      const d = new Date(n);
      return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
  }

  function allGameIds() { return ALL_GAMES.slice(); }
  function isLowBetter(id) { return META[key(id)] && META[key(id)].mode === 'low'; }
  function gameMeta(id) { return META[key(id)] || { title: String(id), subtitle: '', unit: 'bodů', mode: 'high', icon: '' }; }
  function encodePoints(id, value) { const v = Number(value) || 0; return isLowBetter(id) ? (POINT_SCALE - Math.max(0, Math.round(v))) : Math.max(0, Math.round(v)); }
  function decodePoints(id, value) { const v = Number(value) || 0; return isLowBetter(id) ? Math.max(0, POINT_SCALE - Math.max(0, Math.round(v))) : Math.max(0, Math.round(v)); }

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
      ARCADE_RENDER_GAMES.forEach((id) => {
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
        ARCADE_RENDER_GAMES.forEach((gid) => {
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
    if (isLowBetter(id)) return fmtTime(Number(st.bestTimeMs || 0) || 0);
    return `${Number(st.bestScore || 0) || 0}`;
  }

  function renderLaunchTiles() {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;
    const launchSig = CORE_GAMES.join('|') + '::' + EXTRA_GAMES.join('|') + '::v697';
    if (grid.dataset && grid.dataset.arcadeLaunchSig === launchSig && grid.querySelector('.gamesDevFolder') && grid.querySelector('[data-game="ttt"]')) {
      gamePerf.launchRenderSkips = Number(gamePerf.launchRenderSkips || 0) + 1;
      return;
    }
    const tile = (id) => {
      const meta = gameMeta(id);
      return `
        <div class="tile calcTile calcTileStack gamesLaunchTile" data-action="open-game" data-game="${id}">
          <div class="calcTileIcon" aria-hidden="true">${meta.icon}</div>
          <div>
            <div class="calcTileText">${escapeHtml(meta.title)}</div>
            <div class="smallText">${escapeHtml(meta.subtitle)}</div>
          </div>
        </div>`;
    };
    const coreHtml = CORE_GAMES.map(tile).join('');
    const extraHtml = EXTRA_GAMES.map(tile).join('');
    grid.innerHTML = [
      coreHtml,
      `<details class="gamesDevFolder">
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
      </details>`
    ].join('');
    if (grid.dataset) grid.dataset.arcadeLaunchSig = launchSig;
  }

  function summaryLine(account, gameId) {
    const st = getAccountStat(account, gameId);
    const id = key(gameId);
    const meta = gameMeta(id);
    let value = '—';
    if (id === 'ttt') value = `${Number(st.plays || 0) || 0}×`;
    else if (isLowBetter(id)) value = st.bestTimeMs ? fmtTime(st.bestTimeMs) : '—';
    else value = String(Number(st.bestScore || st.leaderboardValue || 0) || 0);
    return `<div class="gamesStatsCardLine"><strong>${escapeHtml(meta.title)}</strong> · ${escapeHtml(value)}</div>`;
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
      const totalPlays = ALL_GAMES.reduce((sum, gid) => sum + Number(getAccountStat(acc, gid).plays || 0), 0);
      const lines = ALL_GAMES.map((gid) => summaryLine(acc, gid)).join('');
      const isActive = String(acc.id) === String(activeId);
      return `<details class="gamesStatsCard${isActive ? ' isActive' : ''}"${isActive ? ' open' : ''}><summary class="gamesStatsCardSummary"><div class="gamesStatsCardHead"><div><div class="gamesStatsCardName">${escapeHtml(acc.name || '')}</div></div><div class="gamesStatsCardTotal">${String(totalPlays)} her</div></div></summary><div class="gamesStatsCardBody">${lines}</div></details>`;
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
    if (isLowBetter(id)) return Number(stat.bestTimeMs || 0) || 0;
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
    const cache = (window.app && window.app.gamesLeaderboardCache) ? window.app.gamesLeaderboardCache : (window.app.gamesLeaderboardCache = {});
    if (Array.isArray(cache[id]) && cache[id].length) return cache[id].slice(0, limit);
    const profile = gamesGetProfile();
    const rows = Object.values(profile.accounts || {}).map((acc) => {
      const stat = getAccountStat(acc, id);
      const value = gameLeaderboardMetric(id, stat);
      return {
        id: acc.id,
        name: acc.name || ('Hráč ' + String(acc.id || '')),
        value,
        playedText: formatDate(Number(stat.lastPlayedAt || acc.updatedAt || 0) || 0)
      };
    }).filter((row) => row.value > 0);
    return gameLeaderboardSort(id, rows).slice(0, Math.max(1, Math.min(50, Number(limit) || 10)));
  };

  window.gamesTop3Block = function gamesTop3BlockArcade(gameId, label, limit = 10) {
    const id = key(gameId);
    const rows = window.gamesGetGameLeaderboard(id, limit);
    const body = rows.length ? rows.map((row, idx) => (
      `<div class="gamesTop3Row"><div class="gamesTop3Rank">${String(idx + 1)}.</div><div class="gamesTop3Name">${escapeHtml(row.name)}</div><div class="gamesTop3Value">${String(row.value)} ${escapeHtml(label)}${row.playedText ? ' · ' + escapeHtml(row.playedText) : ''}</div></div>`
    )).join('') : '<div class="gamesTop3Empty">Zatím žádné výsledky.</div>';
    return `<div class="gamesTop3Card gamesTop5ScrollCard" data-score-game="${escapeHtml(id)}"><div class="gamesTop3Title">Top ${String(limit)} výsledků</div><div class="gamesTop3Body gamesTop5ScrollBody">${body}</div></div>`;
  };

  const leaderboardInFlight = new Map();
  async function refreshRemoteLeaderboards(gameId) {
    if (!window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.loadGameStats !== 'function') return [];
    if (document.visibilityState === 'hidden') {
      gamePerf.leaderboardHiddenSkips = Number(gamePerf.leaderboardHiddenSkips || 0) + 1;
      return [];
    }
    const ids = gameId ? [key(gameId)] : ALL_GAMES.slice();
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
          const normalized = (Array.isArray(rows) ? rows : []).map((row) => {
            const accountNumber = String(row && (row.account_number ?? row.accountNumber ?? row.id) ? (row.account_number ?? row.accountNumber ?? row.id) : '').trim();
            const name = String(row && (row.player_name ?? row.full_name ?? row.name) ? (row.player_name ?? row.full_name ?? row.name) : accountNumber || '').trim() || accountNumber || 'Hráč';
            const points = Number(row && (row.points ?? row.best_score ?? row.bestScore ?? row.value) ? (row.points ?? row.best_score ?? row.bestScore ?? row.value) : 0) || 0;
            const value = decodePoints(gid, points);
            const updatedAt = String(row && (row.updated_at ?? row.last_played_at ?? row.created_at) ? (row.updated_at ?? row.last_played_at ?? row.created_at) : '').trim();
            return { id: accountNumber || name, name, value, playedText: formatDate(Date.parse(updatedAt) || 0), gameId: gid };
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
      const bestTime = Number(nextPatch.bestTimeMs || nextPatch.timeMs || nextPatch.elapsedMs || 0) || 0;
      merged.bestTimeMs = Math.max(0, Math.min(Number(current.bestTimeMs || 0) || 0, bestTime) || bestTime || current.bestTimeMs || 0);
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
    if (typeof nextPatch.bestAvgTimeMs === 'number' && nextPatch.bestAvgTimeMs > 0) {
      const oldAvg = Number(current.bestAvgTimeMs || 0) || 0;
      merged.bestAvgTimeMs = oldAvg ? Math.min(oldAvg, nextPatch.bestAvgTimeMs) : nextPatch.bestAvgTimeMs;
    }
    if (typeof nextPatch.perfectRuns === 'number') merged.perfectRuns = (Number(current.perfectRuns || 0) || 0) + Math.max(0, nextPatch.perfectRuns || 0);
    if (typeof nextPatch.bestMoves === 'number') merged.bestMoves = Math.max(Number(current.bestMoves || 0) || 0, nextPatch.bestMoves || 0);
    ['bestLines','bestLevel','bestSurvivalSec','bestWave','bestHeight','bestJumps','bestPlatforms','bestPops','bestBricks','bestClears','bestShots','bestStreak','bestBlocks','bestStageClear','bestBossKills','bestPowerUps','bestWeaponLevel','bestEnemiesKilled','bestCrates'].forEach((field) => {
      if (typeof nextPatch[field] === 'number') merged[field] = Math.max(Number(current[field] || 0) || 0, nextPatch[field] || 0);
    });
    if (typeof nextPatch.perfectClears === 'number') merged.perfectClears = (Number(current.perfectClears || 0) || 0) + Math.max(0, nextPatch.perfectClears || 0);
    merged.lastResult = String(nextPatch.lastResult || merged.lastResult || '').trim();
    setAccountStat(active, id, merged);
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
        body.innerHTML = `<div class="arcadeStage"><div class="arcadeBanner arcadePanel isBad"><div class="arcadeBannerTitle">Hra se nenačetla</div><div class="arcadeBannerText">V téhle hře se něco rozbilo při vykreslení. Zkus ji otevřít znovu, nebo se podívej do diagnostiky.</div><div class="arcadeMiniNote">${escapeHtml(String(err && err.message ? err.message : err || 'Neznámá chyba'))}</div></div></div>`;
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
    const ctx = canvas.getContext('2d');
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dprMax = typeof window.getRakPerformanceDprMax === 'function' ? window.getRakPerformanceDprMax() : 2;
      const dpr = Math.max(1, Math.min(dprMax, window.devicePixelRatio || 1));
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: rect.width, h: rect.height, dpr };
    };
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
        ${gamesTop3Block(state.challenge ? 'daily' : 'aim', 'bodů', 5)}
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
        gamesRecordStat(state.challenge ? 'daily' : 'aim', {
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
    const bestLabel = state.bestTimeMs ? fmtTime(state.bestTimeMs) : (bestStat.bestTimeMs ? fmtTime(bestStat.bestTimeMs) : '—');
    body.innerHTML = `
      <div class="arcadeStage arcadeReactionStage">
        <div class="arcadeHud arcadeHudWide">
          ${gamesStatLine('Kolo', `${state.round}/${state.roundsTotal || 5}`)}
          ${gamesStatLine('Best', bestLabel)}
          ${gamesStatLine('Poslední', state.lastTimeMs ? fmtTime(state.lastTimeMs) : '—')}
          ${gamesStatLine('Průměr', state.times.length ? fmtTime(Math.round(state.times.reduce((a, b) => a + b, 0) / state.times.length)) : '—')}
        </div>
        <button type="button" class="arcadeBoardWrap arcadeReactionBoard arcadePanel ${state.phase === 'go' ? 'isGo' : ''} ${state.tooSoon ? 'isBad' : ''}" id="reactionBoard">
          <span class="arcadeReactionPulse"></span>
          <strong id="reactionTitle">${state.phase === 'go' ? 'TEĎ!' : (state.phase === 'waiting' ? 'Čekej…' : (state.finished ? 'Hotovo' : (state.tooSoon ? 'Moc brzo' : 'Připrav se')))}</strong>
          <small id="reactionText">${state.finished ? 'Klepni na Nová hra pro další pokus.' : (state.phase === 'go' ? 'Klepni hned.' : 'Klepni pro start a pak čekej na signál.')}</small>
        </button>
        <div class="arcadeControls">
          <button type="button" class="gameControlBtn" id="reactionResetBtn">Nová hra</button>
        </div>
        ${gamesTop3Block('reaction', 'ms', 5)}
      </div>`;
    const board = body.querySelector('#reactionBoard');
    const title = body.querySelector('#reactionTitle');
    const textEl = body.querySelector('#reactionText');
    const hud = body.querySelector('.arcadeHud');
    const clearWaiting = () => { clearTimeout(state.waitingTimer); state.waitingTimer = null; };
    const updateHud = () => {
      const avg = state.times.length ? Math.round(state.times.reduce((a, b) => a + b, 0) / state.times.length) : 0;
      if (hud) hud.innerHTML = `${gamesStatLine('Kolo', `${state.round}/${state.roundsTotal || 5}`)}${gamesStatLine('Best', state.bestTimeMs ? fmtTime(state.bestTimeMs) : (bestStat.bestTimeMs ? fmtTime(bestStat.bestTimeMs) : '—'))}${gamesStatLine('Poslední', state.lastTimeMs ? fmtTime(state.lastTimeMs) : '—')}${gamesStatLine('Průměr', avg ? fmtTime(avg) : '—')}`;
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
      if (textEl) textEl.textContent = `Best ${fmtTime(best)} · průměr ${fmtTime(avg)}.`;
      updateHud();
      if (!state.saved) {
        state.saved = true;
        gamesRecordStat('reaction', {
          completed: true,
          plays: 1,
          bestTimeMs: best,
          bestAvgTimeMs: avg,
          bestScore: best ? encodePoints('reaction', best) : 0,
          perfectRuns: state.times.every(t => t && t < 250) ? 1 : 0,
          lastResult: `${best} ms`
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
      saved: false, autoShoot: false, weaponLevel: 1, spreadUntil: 0, rapidUntil: 0, shieldUntil: 0, bossKills: 0, powerUpsCollected: 0,
      stars: Array.from({ length: 46 }, () => ({ x: Math.random() * 320, y: Math.random() * 520, s: 0.45 + Math.random() * 1.7 })),
      startedAt: Date.now()
    };
  }
  function renderShooter(body) {
    const state = getState('shooter', shooterState);
    const stage = createCanvas(body, 'clamp(390px, 58dvh, 590px)');
    if (stage.wrap) stage.wrap.classList.add('isFullGame', 'shooterCanvasWrap', 'arcadeNoPageScroll');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeHud arcadeHudWide3 arcadeHudSingleLine">${gamesStatLine('Skóre', state.score)}${gamesStatLine('Zásahy', state.hits || 0)}${gamesStatLine('Čas', Math.floor((state.survivedMs || 0) / 1000))}</div><div class="arcadeControls arcadeOnlyRestart"><button type="button" class="gameControlBtn" id="shooterRestartBtn">Nová hra</button></div>`);
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
      const type = randomPick(['spread', 'rapid', 'shield', 'score', 'laser']);
      state.powerUps.push({ type, x: 24 + Math.random() * Math.max(1, w - 48), y: -22, vy: 1.25, r: 12 });
    };
    const applyPower = (type) => {
      const now = Date.now();
      state.powerUpsCollected = Number(state.powerUpsCollected || 0) + 1;
      if (type === 'spread') { state.spreadUntil = now + 11000; state.weaponLevel = Math.max(state.weaponLevel || 1, 2); }
      else if (type === 'laser') { state.spreadUntil = now + 14000; state.rapidUntil = now + 9000; state.weaponLevel = 3; }
      else if (type === 'rapid') state.rapidUntil = now + 10000;
      else if (type === 'shield') state.shieldUntil = now + 12000;
      else if (type === 'score') state.score += 150;
      if (typeof navigator !== 'undefined' && navigator.vibrate) { try { navigator.vibrate([8, 18, 8]); } catch (err) {} }
    };
    const shoot = () => {
      if (state.shotCooldown > 0 || state.over) return;
      const h = canvas.clientHeight || stage.wrap.clientHeight || 420;
      const y = h - 58;
      const now = Date.now();
      const rapid = now < Number(state.rapidUntil || 0);
      const spread = now < Number(state.spreadUntil || 0) || Number(state.weaponLevel || 1) >= 2;
      state.bullets.push({ x: state.shipX, y, vx: 0, vy: -7.1, strong: Number(state.weaponLevel || 1) >= 3 });
      if (spread) {
        state.bullets.push({ x: state.shipX - 8, y: y + 4, vx: -1.15, vy: -6.55 });
        state.bullets.push({ x: state.shipX + 8, y: y + 4, vx: 1.15, vy: -6.55 });
      }
      if (Number(state.weaponLevel || 1) >= 3) {
        state.bullets.push({ x: state.shipX - 15, y: y + 8, vx: -.45, vy: -6.9, strong: true });
        state.bullets.push({ x: state.shipX + 15, y: y + 8, vx: .45, vy: -6.9, strong: true });
      }
      state.shotCooldown = rapid ? 62 : 115;
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
      const color = p.type === 'shield' ? colors.cyan : p.type === 'rapid' ? colors.gold : p.type === 'score' ? colors.soft : colors.accent;
      ctx.save(); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.moveTo(p.x, p.y - 12); ctx.lineTo(p.x + 12, p.y); ctx.lineTo(p.x, p.y + 12); ctx.lineTo(p.x - 12, p.y); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.font = '900 9px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(p.type === 'spread' ? '3' : p.type === 'rapid' ? 'R' : p.type === 'shield' ? 'S' : p.type === 'laser' ? 'L' : '+', p.x, p.y + 3);
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
      if (Date.now() < Number(state.spreadUntil || 0)) active.push('vícesměr');
      if (Date.now() < Number(state.rapidUntil || 0)) active.push('rychlopalba');
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
          e.x += ((e.vx || 0) + (e.kind === 'fighter' ? Math.sin(e.wave) * .45 : 0)) * dt / 16;
          e.y += e.vy * dt / 16;
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
                state.score += Number(e.score || 20);
                state.hits = (state.hits || 0) + 1;
                if (e.boss) { state.bossKills = Number(state.bossKills || 0) + 1; state.weaponLevel = Math.min(3, Number(state.weaponLevel || 1) + 1); spawnPower(); }
              }
              return false;
            }
          }
          return true;
        });
      }
      const hud = body.querySelector('.arcadeHud');
      if (hud) hud.innerHTML = `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Vlna', state.bestWave || 1)}${gamesStatLine('Čas', Math.floor((state.survivedMs || 0) / 1000))}`;
      draw();
      state.raf = rakGameRequestFrame(state, loop);
    };
    state.raf = rakGameRequestFrame(state, loop);
    addCleanup(() => { cancelAnimationFrame(state.raf); canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove); canvas.removeEventListener('pointerup', pointerEnd); canvas.removeEventListener('pointercancel', pointerEnd); if (state.over) finishShooter(); });
    draw();
    setActiveState('shooter', state);
  }

  // Brick Breaker ----------------------------------------------------------
  function brickState() { return { score: 0, over: false, won: false, lastTs: 0, raf: 0, paddleX: 0, ball: { x: 160, y: 280, vx: 3.4, vy: -3.6 }, launched: false, bricks: [], combo: 0, bestCombo: 0, saved: false }; }
  function initBricks(state) { state.bricks = []; for (let r = 0; r < 6; r += 1) { for (let c = 0; c < 8; c += 1) state.bricks.push({ x: c, y: r, alive: true, hp: r > 3 ? 2 : 1 }); } }
  function renderBrick(body) {
    const state = getState('brick', () => { const s2 = brickState(); initBricks(s2); return s2; });
    const stage = createCanvas(body, 'clamp(370px, 56dvh, 560px)');
    if (stage.wrap) stage.wrap.classList.add('isFullGame', 'brickNarrowCanvas', 'arcadeNoPageScroll');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeHud arcadeHudWide3 arcadeHudSingleLine">${gamesStatLine('Skóre', state.score)}${gamesStatLine('Cihly', state.bricks.filter(b => b.alive).length)}${gamesStatLine('Combo', state.bestCombo || 0)}</div><div class="arcadeControls arcadeOnlyRestart"><button type="button" class="gameControlBtn" id="brickRestartBtn">Nová hra</button></div>`);
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
        bestBricks: 48 - state.bricks.filter(b => b.alive).length,
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
            if (b.hp <= 0) { b.alive = false; state.score += 18 + Math.min(60, state.combo * 4); }
          }
        });
        if (state.ball.y > h + 18) end(false);
        if (!state.bricks.some(b => b.alive)) end(true);
      }
      const hud = body.querySelector('.arcadeHud');
      if (hud) hud.innerHTML = `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Cihly', state.bricks.filter(b => b.alive).length)}${gamesStatLine('Combo', state.bestCombo || 0)}`;
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
    const stage = createCanvas(body, 'clamp(330px, 46dvh, 500px)');
    if (stage.wrap) stage.wrap.classList.add('isFullGame', 'arcadeNoPageScroll', 'doodleCanvasWrap');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeHud arcadeHudWide3 arcadeHudSingleLine">${gamesStatLine('Skóre', state.score)}${gamesStatLine('Výška', Math.floor(state.height || 0))}${gamesStatLine('Skoky', state.jumps || 0)}</div><div class="arcadeControls arcadeOnlyRestart"><button type="button" class="gameControlBtn" id="doodleRestartBtn">Nová hra</button></div>`);
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
    const addPlatform = (w, y) => {
      const roll = Math.random();
      const kind = roll > .86 ? 'boost' : roll > .70 ? 'moving' : 'normal';
      state.platforms.push({ x: 18 + Math.random() * Math.max(1, w - 86), y, w: kind === 'boost' ? 44 : 48 + Math.random() * 20, kind, vx: kind === 'moving' ? (Math.random() < .5 ? -0.9 : 0.9) : 0 });
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
    const stage = createCanvas(body, 'clamp(330px, 46dvh, 500px)');
    if (stage.wrap) stage.wrap.classList.add('isFullGame', 'arcadeNoPageScroll', 'bubbleCanvasWrap');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeHud arcadeHudWide3 arcadeHudSingleLine">${gamesStatLine('Skóre', state.score)}${gamesStatLine('Combo', state.bestCombo || 0)}${gamesStatLine('Střely', state.shots || 0)}</div><div class="arcadeControls arcadeOnlyRestart"><button type="button" class="gameControlBtn" id="bubbleRestartBtn">Nová hra</button></div>`);
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
      const candidates = [[row, col], [row, col - 1], [row, col + 1], [row - 1, col], [row + 1, col], [row - 1, col - 1], [row - 1, col + 1], [row + 1, col - 1], [row + 1, col + 1]];
      for (const [r, c] of candidates) if (r >= 0 && c >= 0 && r < state.rows && c < state.cols && !state.grid[r][c]) return [r, c];
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
    const dropRows = () => {
      if ((state.shots || 0) % 5 !== 0) return;
      state.grid.pop();
      state.grid.unshift(Array.from({ length: state.cols }, () => randomPick(state.colors)));
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
      if (hud) hud.innerHTML = `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Combo', state.bestCombo || 0)}${gamesStatLine('Střely', state.shots || 0)}`;
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
    return { started: false, selected: diff || 'easy', startAt: 0, finished: false, mistakes: 0, solution: null, puzzle: null, entries: Array(81).fill(''), selectedCell: null, wrong: {} };
  }
  function renderSudoku(body) {
    const state = getState('sudoku', () => createSudokuState('easy'));
    const pick = SUDOKU_PUZZLES.find(p => p.difficulty === state.selected) || SUDOKU_PUZZLES[0];
    if (!state.started) {
      const diffBtns = SUDOKU_PUZZLES.map((p) => `<button type="button" class="gameControlBtn sudokuDifficultyBtn${state.selected === p.difficulty ? ' isActive' : ''}" data-sudoku-diff="${p.difficulty}">${p.label}</button>`).join('');
      body.innerHTML = `
        <div class="arcadeStage sudokuMenuStage">
          <div class="arcadePanel sudokuMenuCard">
            <div class="arcadeStatus"><strong>Sudoku</strong><br>Nejdřív zvol obtížnost. Hra se spustí až potom.</div>
            <div class="arcadeControls sudokuDifficultyMenu">${diffBtns}</div>
            <button type="button" class="gameControlBtn primary" data-sudoku-start="1">Spustit Sudoku</button>
          </div>
          ${gamesTop3Block('sudoku', 'ms', 5).replace('gamesTop5ScrollCard', 'gamesTop5ScrollCard arcadeTopScoreTight')}
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
      state.mistakes = 0;
      state.entries = Array(81).fill('');
      state.wrong = {};
      state.selectedCell = null;
    }
    const selectedIdx = Number.isFinite(state.selectedCell) ? state.selectedCell : -1;
    const gridHtml = pick.puzzle.map((row, r) => row.split('').map((v, c) => {
      const idx = r * 9 + c;
      const fixed = v !== '0';
      const entry = fixed ? v : String(state.entries[idx] || '');
      const cls = ['arcadeSudokuCell', fixed ? 'isFixed' : 'isOpen', selectedIdx === idx ? 'isSelected' : '', state.wrong[idx] ? 'isWrong' : '', entry ? 'hasValue' : ''].filter(Boolean).join(' ');
      return `<button type="button" class="${cls}" data-r="${r}" data-c="${c}" data-idx="${idx}" ${fixed ? 'aria-disabled="true"' : ''}>${entry}</button>`;
    }).join('')).join('');
    const selectedRow = selectedIdx >= 0 ? Math.floor(selectedIdx / 9) : 0;
    const selectedCol = selectedIdx >= 0 ? selectedIdx % 9 : 0;
    const picker = selectedIdx >= 0 && pick.puzzle[selectedRow][selectedCol] === '0'
      ? `<div class="sudokuNumberPicker" style="--sudokuRow:${selectedRow};--sudokuCol:${selectedCol};">${[1,2,3,4,5,6,7,8,9].map(n => `<button type="button" data-sudoku-num="${n}">${n}</button>`).join('')}<button type="button" data-sudoku-num="clear">×</button></div>`
      : '';
    body.innerHTML = `
      <div class="arcadeStage sudokuGameStage">
        <div class="arcadeHud arcadeHudSingleLine sudokuHud">
          ${gamesStatLine('Obtížnost', pick.label || pick.difficulty)}
          ${gamesStatLine('Čas', fmtTime(state.startAt ? Date.now() - state.startAt : 0))}
          ${gamesStatLine('Chyby', state.mistakes)}
        </div>
        <div class="arcadeBoard grid-9 arcadePanel arcadeLogicBoard arcadeSudokuPaper" id="sudokuGrid">${gridHtml}${picker}</div>
        <div class="arcadeControls sudokuGameControls sudokuGameControlsSingle"><button type="button" class="gameControlBtn" data-sudoku-restart="1">Nová hra</button></div>
      </div>`;
    const grid = body.querySelector('#sudokuGrid');
    const updateHud = () => {
      const hud = body.querySelector('.sudokuHud');
      if (hud) hud.innerHTML = `${gamesStatLine('Obtížnost', pick.label || pick.difficulty)}${gamesStatLine('Čas', fmtTime(Date.now() - state.startAt))}${gamesStatLine('Chyby', state.mistakes)}`;
    };
    const completeCheck = () => {
      const valid = pick.solution.every((row, r) => row.split('').every((val, c) => {
        const idx = r * 9 + c;
        return (pick.puzzle[r][c] !== '0' ? pick.puzzle[r][c] : String(state.entries[idx] || '')) === val;
      }));
      if (valid && !state.finished) {
        state.finished = true;
        const time = Date.now() - state.startAt;
        gamesRecordStat('sudoku', { completed: true, plays: 1, bestTimeMs: time, bestScore: encodePoints('sudoku', time), mistakes: state.mistakes, lastResult: fmtTime(time) });
        const done = body.querySelector('.sudokuGameControls');
        if (done) done.insertAdjacentHTML('beforebegin', `<div class="arcadeBar arcadePanel uPad10x12"><div class="arcadeStatus"><strong>Vyřešeno!</strong> Čas ${fmtTime(time)} · chyby ${state.mistakes}.</div></div>`);
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
      if (val !== pick.solution[r][c]) { state.mistakes += 1; state.wrong[idx] = true; }
      else delete state.wrong[idx];
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
        ${gamesTop3Block('mines', 'ms', 5).replace('gamesTop5ScrollCard', 'gamesTop5ScrollCard arcadeTopScoreTight')}
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
      if (state.win && !state._saved) { state._saved = true; gamesRecordStat('mines', { completed: true, plays: 1, bestTimeMs: time, bestScore: encodePoints('mines', time), opened: state.opened, lastResult: fmtTime(time) }); }
      const msg = state.win ? `<strong>Vyhrál jsi!</strong> Čas ${fmtTime(time)}.` : `<strong>Bum!</strong> Narazil jsi na minu.`;
      const controls = body.querySelector('.arcadeControls');
      if (controls) controls.insertAdjacentHTML('beforebegin', `<div class="arcadeBar arcadePanel uPad10x12"><div class="arcadeStatus">${msg}</div></div>`);
    }
    setActiveState('mines', state);
  }

  // Memory -----------------------------------------------------------------
  const MEMORY_PAIRS = ['🍀','⚡','⭐','🌙','🔥','💎','🎯','🧠','🚗','🌴','🛠️','🪐'];
  const MEMORY_BONUS = '🎁';
  function memoryState() { return { deck: [], flipped: [], matched: new Set(), moves: 0, startAt: Date.now(), over: false, lock: false, bestTimeMs: 0 }; }
  function initMemory(state) { state.deck = shuffle(MEMORY_PAIRS.concat(MEMORY_PAIRS).concat([MEMORY_BONUS])); state.flipped = []; state.matched = new Set(); state.moves = 0; state.startAt = Date.now(); state.over = false; state.lock = false; }
  function renderMemory(body) {
    const state = getState('memory', () => { const s = memoryState(); initMemory(s); return s; });
    const cells = state.deck.map((sym, i) => {
      const flipped = state.flipped.includes(i) || state.matched.has(i);
      const matched = state.matched.has(i);
      return `<button type="button" class="arcadeMemoryCard${flipped ? ' isFlipped' : ''}${matched ? ' isMatched' : ''}${sym === MEMORY_BONUS ? ' isBonus' : ''}" data-i="${i}">${flipped ? sym : '·'}</button>`;
    }).join('');
    body.innerHTML = `
      <div class="arcadeStage memoryStage">
        <div class="arcadeHud arcadeHudSingleLine memoryHud">${gamesStatLine('Čas', fmtTime(Date.now() - state.startAt))}${gamesStatLine('Pohyby', state.moves)}${gamesStatLine('Páry', Math.floor(state.matched.size / 2))}</div>
        <div class="arcadeGridList grid-5 arcadePanel arcadeMemoryBoard arcadeMemoryBoardLarge" id="memoryGrid">${cells}</div>
        <div class="arcadeControls"><button type="button" class="gameControlBtn" data-memory="restart">Nová hra</button></div>
        ${gamesTop3Block('memory', 'ms', 5).replace('gamesTop5ScrollCard', 'gamesTop5ScrollCard arcadeTopScoreTight')}
      </div>`;
    const grid = body.querySelector('#memoryGrid');
    const finishIfDone = () => {
      if (state.matched.size >= state.deck.length && !state.over) {
        state.over = true;
        state.bestTimeMs = Date.now() - state.startAt;
        gamesRecordStat('memory', { completed: true, plays: 1, bestTimeMs: state.bestTimeMs, bestScore: encodePoints('memory', state.bestTimeMs), bestMoves: state.moves, lastResult: `${state.moves} tahů` });
        const controls = body.querySelector('.arcadeControls');
        if (controls) controls.insertAdjacentHTML('beforebegin', `<div class="arcadeBar arcadePanel uPad10x12"><div class="arcadeStatus"><strong>Vyhráno!</strong> ${fmtTime(state.bestTimeMs)} · ${state.moves} tahů.</div></div>`);
      }
    };
    grid.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        if (state.lock || state.matched.has(i) || state.flipped.includes(i)) return;
        if (state.deck[i] === MEMORY_BONUS) {
          state.moves += 1;
          state.matched.add(i);
          renderMemory(body);
          finishIfDone();
          return;
        }
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
    body.querySelector('[data-memory="restart"]').addEventListener('click', () => { const s = memoryState(); initMemory(s); window.app.gamesArcade['memory'] = s; renderMemory(body); });
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
      hint: 'Táhni prstem po bludišti. Klepnutím položíš bombu.',
      touch: null
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
    state.over = false; state.won = false; state.saved = false; state.lastTs = 0; state.hint = 'Znič 4 příšerky bombami. V bednách jsou upgrady.';
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
  function renderBomber(body) {
    const state = getState('bomber', () => { const s = bomberState(); initBomber(s); return s; });
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
    const entityHtml = () => {
      const items = [];
      Object.keys(state.upgrades || {}).forEach((k) => {
        const [x, y] = k.split(',').map(Number);
        if (state.map[y] && state.map[y][x] === '') items.push(`<div class="bomberEntity upgrade" style="--x:${x};--y:${y};">${bomberUpgradeLabel(state.upgrades[k])}</div>`);
      });
      state.bombs.filter(b => !b.exploded).forEach(b => items.push(`<div class="bomberEntity bomb" style="--x:${b.x};--y:${b.y};">💣</div>`));
      state.fires.filter(f => f.life > 0).forEach(f => items.push(`<div class="bomberEntity fire" style="--x:${f.x};--y:${f.y};">✦</div>`));
      state.enemies.filter(e => e.alive).forEach((e, i) => items.push(`<div class="bomberEntity monster m${i}" style="--x:${e.x};--y:${e.y};">${i === 0 ? '👾' : i === 1 ? '🛸' : i === 2 ? '🦑' : '👻'}</div>`));
      const face = state.dir === 'left' ? '◀' : state.dir === 'right' ? '▶' : state.dir === 'up' ? '▲' : '▼';
      items.push(`<div class="bomberEntity player" style="--x:${state.x};--y:${state.y};"><span>${face}</span></div>`);
      return items.join('');
    };
    const boardHtml = () => `<div class="arcadeBomberCells">${cellsHtml()}</div><div class="arcadeBomberEntities">${entityHtml()}</div>`;
    const hudHtml = () => `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Příšerky', state.enemies.filter(e => e.alive).length)}${gamesStatLine('Bomby', `${state.bombs.filter(b => !b.exploded).length}/${state.maxBombs}`)}${gamesStatLine('Síla', state.range)}`;
    const paint = () => {
      const hud = body.querySelector('.bomberHud'); if (hud) hud.innerHTML = hudHtml();
      const board = body.querySelector('#bomberGrid'); if (board) board.innerHTML = boardHtml();
      const status = body.querySelector('.bomberStatus');
      if (status) status.innerHTML = state.over ? (state.won ? 'Vyčištěno. Příšerky jsou pryč.' : 'Konec hry. Zkus to znovu.') : state.hint;
    };
    const draw = () => {
      body.innerHTML = `
        <div class="arcadeStage bomberStage">
          <div class="arcadeHud arcadeHudSingleLine bomberHud">${hudHtml()}</div>
          <div class="arcadeBar arcadePanel uPad10x12"><div class="arcadeStatus bomberStatus">${state.hint}</div></div>
          <div class="arcadeBomberBoard arcadePanel" id="bomberGrid">${boardHtml()}</div>
          <div class="arcadeControls"><button type="button" class="gameControlBtn" data-bomber="restart">Nová hra</button></div>
          ${gamesTop3Block('bomber', 'bodů', 5).replace('gamesTop5ScrollCard', 'gamesTop5ScrollCard arcadeTopScoreTight')}
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
      if (state.over) return;
      if (dx < 0) state.dir = 'left'; else if (dx > 0) state.dir = 'right'; else if (dy < 0) state.dir = 'up'; else if (dy > 0) state.dir = 'down';
      const nx = clamp(state.x + dx, 1, state.w - 2); const ny = clamp(state.y + dy, 1, state.h - 2);
      if (!bomberIsBlocked(state, nx, ny, false) && !bomberHasBomb(state, nx, ny)) { state.x = nx; state.y = ny; checkCollect(); checkHits(); }
      paint();
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
    const bindButtons = () => {
      if (state.bound) return;
      state.bound = true;
      document.addEventListener('keydown', keyHandler);
      body.addEventListener('pointerdown', (ev) => {
        const grid = ev.target && ev.target.closest ? ev.target.closest('#bomberGrid') : null;
        if (!grid) return;
        ev.preventDefault();
        state.touch = { x: ev.clientX, y: ev.clientY, moved: false };
      }, { passive: false });
      body.addEventListener('pointermove', (ev) => {
        if (!state.touch) return;
        const dx = ev.clientX - state.touch.x;
        const dy = ev.clientY - state.touch.y;
        const ax = Math.abs(dx), ay = Math.abs(dy);
        const threshold = Math.max(16, 28 - Math.round((state.speed - 1) * 10));
        if (Math.max(ax, ay) < threshold) return;
        ev.preventDefault();
        state.touch.moved = true;
        if (ax >= ay) move(dx > 0 ? 1 : -1, 0);
        else move(0, dy > 0 ? 1 : -1);
        state.touch.x = ev.clientX; state.touch.y = ev.clientY;
      }, { passive: false });
      body.addEventListener('pointerup', (ev) => {
        const grid = ev.target && ev.target.closest ? ev.target.closest('#bomberGrid') : null;
        if (state.touch && grid && !state.touch.moved) { ev.preventDefault(); placeBomb(); }
        state.touch = null;
      }, { passive: false });
      body.addEventListener('contextmenu', (ev) => { if (ev.target && ev.target.closest && ev.target.closest('#bomberGrid')) ev.preventDefault(); });
      body.addEventListener('click', (ev) => {
        const btn = ev.target && ev.target.closest ? ev.target.closest('[data-bomber]') : null;
        if (!btn) return;
        if (btn.dataset.bomber === 'restart') {
          Object.assign(state, bomberState()); initBomber(state); state.bound = true; draw();
        }
      });
    };
    const saveResult = () => {
      if (state.saved) return;
      state.saved = true;
      gamesRecordStat('bomber', {
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
        state.bombs.forEach((b) => { b.life -= dt; if (b.life <= 0 && !b.exploded) explode(b); });
        state.bombs = state.bombs.filter(b => !b.exploded || b.life > -260);
        state.fires.forEach(f => { f.life -= dt; });
        state.fires = state.fires.filter(f => f.life > 0);
        state.enemyAcc += dt;
        if (state.enemyAcc >= state.enemyStepMs) { state.enemyAcc = 0; stepEnemies(); }
        checkHits();
      }
      if (state.over) saveResult();
      paint();
    };
    draw();
    if (!state.timer) state.timer = rakGameSetInterval(loop, rakGameIsLadaMode() ? 160 : 105);
    addCleanup(() => {
      clearInterval(state.timer);
      state.timer = 0;
      document.removeEventListener('keydown', keyHandler);
      if (state.over) saveResult();
    });
    setActiveState('bomber', state);
  }

  // Daily challenge --------------------------------------------------------
  function dailySeed() {
    const d = new Date(); d.setHours(0,0,0,0);
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }
  function dailyChallengeId() { return DAILY_MODES[dailySeed() % DAILY_MODES.length]; }
  function dailyLabel(mode) {
    return mode === 'aim' ? 'Aim Trainer' : mode === 'reaction' ? 'Reaction Test' : mode === 'memory' ? 'Pexeso' : mode === 'mines' ? 'Miny' : mode === 'bubble' ? 'Bubble Shooter' : mode === 'doodle' ? 'Doodle Jump' : mode === 'brick' ? 'Brick Breaker' : mode === 'shooter' ? 'Space Shooter' : mode === 'bomber' ? 'Bomberman mini' : 'Challenge';
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
    return 'Každý den jiná výzva.';
  }
  function renderDaily(body) {
    const mode = dailyChallengeId();
    const label = dailyLabel(mode);
    body.innerHTML = `<div class="arcadeStage dailyStage"><div class="arcadeHud arcadeHudSingleLine">${gamesStatLine('Dnešní hra', label)}${gamesStatLine('Datum', new Date().toLocaleDateString('cs-CZ'))}${gamesStatLine('Střídání', `${DAILY_MODES.length} her`)}</div><div class="arcadeBar arcadePanel uPad12"><div class="arcadeStatus"><strong>Denní challenge:</strong> ${dailyText(mode)} Zítra se automaticky vybere jiná hra podle data.</div></div><div class="arcadeControls"><button type="button" class="gameControlBtn" id="dailyStartBtn">Spustit dnešní výzvu</button><button type="button" class="gameControlBtn" id="dailyResetBtn">Obnovit</button></div>${gamesTop3Block('daily', 'bodů', 5).replace('gamesTop5ScrollCard', 'gamesTop5ScrollCard arcadeTopScoreTight')}</div>`;
    const start = () => {
      if (mode === 'aim') renderAim(body, { challenge: true, duration: 30000 });
      else if (mode === 'reaction') renderReaction(body);
      else if (mode === 'memory') renderMemory(body);
      else if (mode === 'mines') renderMines(body);
      else if (mode === 'bubble') renderBubble(body);
      else if (mode === 'doodle') renderDoodle(body);
      else if (mode === 'brick') renderBrick(body);
      else if (mode === 'shooter') renderShooter(body);
      else if (mode === 'bomber') renderBomber(body);
    };
    body.querySelector('#dailyStartBtn').addEventListener('click', start);
    body.querySelector('#dailyResetBtn').addEventListener('click', () => renderDaily(body));
    setActiveState('daily', { mode });
  }

  const renderers = { aim: renderAim, reaction: renderReaction, tetris: renderTetris, shooter: renderShooter, brick: renderBrick, doodle: renderDoodle, bubble: renderBubble, sudoku: renderSudoku, mines: renderMines, memory: renderMemory, bomber: renderBomber, daily: renderDaily };

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
