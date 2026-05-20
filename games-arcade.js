(() => {
  if (window.__rakArcadeLoaded) return;
  window.__rakArcadeLoaded = true;

  // v.1.1 (670): Piškvorky jsou hotová hra mimo složku Ve vývoji; ostatní arcade hry zůstávají ve vývoji.
  const CORE_GAMES = ['ttt'];
  const EXTRA_GAMES = ['2048', 'snake', 'flap', 'aim', 'reaction', 'tetris', 'shooter', 'brick', 'doodle', 'bubble', 'sudoku', 'mines', 'memory', 'bomber', 'daily'];
  const ALL_GAMES = CORE_GAMES.concat(EXTRA_GAMES);
  const LEGACY_RENDER_GAMES = ['2048', 'snake', 'flap'];
  const POINT_SCALE = 1000000000;
  const ARC_KEY = 'arcade';
  const DAILY_MODES = ['aim'];

  const META = {
    ttt: { title: 'Piškvorky', subtitle: 'AI, lokální duel a pozvánky', unit: 'her', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5.2" y="5.2" width="13.6" height="13.6" rx="3"></rect><path d="M9 9.1l3 3 3-3"></path><circle cx="9.2" cy="15" r="1.1"></circle><circle cx="14.8" cy="15" r="1.1"></circle><path d="M8.1 6.5v11M12 6.5v11M15.9 6.5v11M6.5 10.1h11M6.5 13.9h11"></path></svg>' },
    '2048': { title: '2048', subtitle: 'Skládej čísla do sebe', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.8" y="4.8" width="5.8" height="5.8" rx="1.8"></rect><rect x="13.4" y="4.8" width="5.8" height="5.8" rx="1.8"></rect><rect x="4.8" y="13.4" width="5.8" height="5.8" rx="1.8"></rect><rect x="13.4" y="13.4" width="5.8" height="5.8" rx="1.8"></rect></svg>' },
    snake: { title: 'Snake', subtitle: 'Klasická hadí hra', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 16.5c1.8-5 4.3-8 8.1-8 2.5 0 4.5 1.1 5.9 3"></path><circle cx="18.3" cy="11.7" r="2"></circle></svg>' },
    flap: { title: 'Flap Bird', subtitle: 'Klikni a leť mezi trubkami', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 14.8c2.2-4.8 5.8-7 8.4-7 1.8 0 3.4.7 4.8 2"></path><path d="M9.2 11.2c1.6 0 3.2.4 4.8 1.5"></path><path d="M14.2 14.5c1.4 0 2.8.6 4.2 1.9"></path></svg>' },
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
    bomber: { title: 'Bomberman mini', subtitle: 'Jednoduchý arcade styl', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5h6v3H9z"></path><circle cx="12" cy="14" r="5"></circle><path d="M15.8 10.2l2-2"></path></svg>' },
    daily: { title: 'Denní challenge', subtitle: 'Stejné podmínky pro všechny', unit: 'bodů', mode: 'high', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="6.5" width="15" height="13" rx="2"></rect><path d="M8 4.5v4M16 4.5v4M4.5 10h15"></path><path d="M8 14l2.1 2.1L16.3 10"></path></svg>' }
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
    { name: 'Učeň', minXp: 250 },
    { name: 'Seřizovač', minXp: 700 },
    { name: 'Týmař', minXp: 1500 },
    { name: 'Mistr', minXp: 2800 },
    { name: 'Senior', minXp: 4500 },
    { name: 'Legenda RaK', minXp: 7000 }
  ];

  function gamesBuildProgressSummary(account) {
    const total = gamesGetTotals(account);
    const achievements = gamesGetAchievementCount(account);
    const wins = Number(total.ttt && total.ttt.wins || 0) + Math.max(Number(total.g2048 && total.g2048.bestScore || 0) > 0 ? 1 : 0, 0) + Math.max(Number(total.snake && total.snake.bestScore || 0) > 0 ? 1 : 0, 0) + Math.max(Number(total.flap && total.flap.bestScore || 0) > 0 ? 1 : 0, 0);
    const plays = Number(total.totalPlays || 0) || 0;
    const bestScore = Number(total.bestScore || 0) || 0;
    const xp = Math.max(0, Math.round((plays * 12) + (wins * 35) + (achievements * 80) + Math.min(500, Math.floor(bestScore / 2))));
    const level = Math.max(1, Math.floor(xp / 250) + 1);
    const levelBase = (level - 1) * 250;
    const currentXp = xp - levelBase;
    const nextXp = level * 250;
    const rank = [...GAMES_RANK_DEFS].reverse().find(r => xp >= r.minXp) || GAMES_RANK_DEFS[0];
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
    return { xp, level, currentXp, nextXp, rank: rank.name, plays, achievements, wins, winRate, favorite, bestScore };
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
      const xpPct = Math.max(0, Math.min(100, Math.round((progress.currentXp / 250) * 100)));
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

  function renderAchievementsExtended() {
    const grid = document.getElementById('gamesAchievementsGrid');
    if (!grid) return;
    const profile = gamesGetProfile();
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
    const baseAchievements = [
      { id: 'start', title: 'První zápis', desc: 'Odehraj první započítanou hru', goalText: '1 hra', progress: (a) => a.totalPlays, target: 1 },
      { id: 'ten', title: 'Rozjezd', desc: 'Odehraj 10 započítaných her', goalText: '10 her', progress: (a) => a.totalPlays, target: 10 },
      { id: 'thirty', title: 'Držák', desc: 'Odehraj 30 započítaných her', goalText: '30 her', progress: (a) => a.totalPlays, target: 30 },
      { id: 'sixty', title: 'Mazák', desc: 'Odehraj 60 započítaných her', goalText: '60 her', progress: (a) => a.totalPlays, target: 60 }
    ];
    const gameAchievements = ALL_GAMES.map((gameId) => {
      const meta = META[gameId] || { title: gameId, subtitle: '', unit: '' };
      const target = gameId === 'ttt' ? 10 : 5;
      return {
        id: 'game-' + gameId,
        title: meta.title,
        desc: meta.subtitle || 'Zahraj si a ulož několik výsledků.',
        goalText: String(target) + ' započítaných her',
        progress: (a) => {
          const st = getArcadeProfileStat(a && a.account ? a.account : a, gameId);
          return Number(st.plays || 0) || 0;
        },
        target
      };
    });

    const defs = baseAchievements.concat(gameAchievements).map(def => Object.assign({}, def));
    const unlocked = defs.filter((def) => Number(def.progress({ totalPlays: total.totalPlays, account })) >= Number(def.target || 0)).length;

    const nextHtml = defs.map((def) => {
      const current = Number(def.progress({ totalPlays: total.totalPlays, account }) || 0);
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
#games .arcadeHud{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;}
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
      EXTRA_GAMES.forEach((id) => {
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
        EXTRA_GAMES.forEach((gid) => {
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
    const launchSig = CORE_GAMES.join('|') + '::' + EXTRA_GAMES.join('|') + '::v670';
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
    const rows = window.gamesGetGameLeaderboard(gameId, limit);
    const body = rows.length ? rows.map((row, idx) => (
      `<div class="gamesTop3Row"><div class="gamesTop3Rank">${String(idx + 1)}.</div><div class="gamesTop3Name">${escapeHtml(row.name)}</div><div class="gamesTop3Value">${String(row.value)} ${escapeHtml(label)}${row.playedText ? ' · ' + escapeHtml(row.playedText) : ''}</div></div>`
    )).join('') : '<div class="gamesTop3Empty">Zatím žádné výsledky.</div>';
    return `<div class="gamesTop3Card"><div class="gamesTop3Title">Top ${String(limit)} výsledků</div><div class="gamesTop3Body">${body}</div></div>`;
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
    const nextPatch = Object.assign({ lastPlayedAt: Date.now() }, patch || {});
    active.updatedAt = nextPatch.lastPlayedAt;
    if (id === 'ttt' || id === '2048' || id === 'snake' || id === 'flap') {
      if (typeof originalRecordStat === 'function') return originalRecordStat(id, nextPatch);
      return;
    }
    const current = getAccountStat(active, id);
    const merged = Object.assign({}, current, nextPatch);
    merged.plays = Math.max(Number(current.plays || 0) || 0, Number(nextPatch.plays || nextPatch.games_played || 0) || 0);
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
    if (typeof nextPatch.bestMoves === 'number') merged.bestMoves = Math.max(Number(current.bestMoves || 0) || 0, nextPatch.bestMoves || 0);
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
    return `<div class="gamesShellTop"><button type="button" class="gamesShellBack" id="arcadeBackBtn">Zpět</button><div class="gamesShellTitleWrap"><div class="gamesShellTitle">${escapeHtml(title)}</div><div class="gamesShellSubtitle">${escapeHtml(subtitle || '')}</div></div></div>`;
  }

  function mountArcadeShell(gameId) {
    const meta = gameMeta(gameId);
    const stage = document.getElementById('gamesStage');
    if (!stage) return null;
    clearCleanups();
    setActiveState(gameId, null);
    window.document.body.classList.add('gamesOpen');
    window.gamesApplyCompactMode && window.gamesApplyCompactMode();
    stage.innerHTML = `<div class="gamesShell arcadeShellRoot"><div class="arcadeShellHeader">${shellHeader(meta.title, meta.subtitle)}</div><div class="gamesArcadeRoot" id="gamesShellBody"></div></div>`;
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
    if (!META[id] || EXTRA_GAMES.indexOf(id) < 0 || LEGACY_RENDER_GAMES.indexOf(id) >= 0) {
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
      if (EXTRA_GAMES.indexOf(key(window.app.activeGameShell)) >= 0) {
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

  // Aim Trainer ------------------------------------------------------------
  function renderAim(body, opts = {}) {
    const state = getState('aim', () => ({ running: false, score: 0, combo: 0, hits: 0, misses: 0, accuracy: 100, bestCombo: 0, startAt: 0, duration: opts.duration || 30000, target: null, timer: null, finished: false, challenge: !!opts.challenge }));
    if (!state.startAt || state.finished) {
      state.running = false;
      state.score = 0;
      state.combo = 0;
      state.hits = 0;
      state.misses = 0;
      state.accuracy = 100;
      state.bestCombo = 0;
      state.startAt = 0;
      state.finished = false;
      state.target = null;
    }
    body.innerHTML = `
      <div class="arcadeStage">
        <div class="arcadeHud">
          ${gamesStatLine('Skóre', state.score)}
          ${gamesStatLine('Combo', state.combo)}
          ${gamesStatLine('Accuracy', `${Math.round(state.accuracy)} %`)}
        </div>
        <div class="arcadeBar arcadePanel uPad10x12">
          <div class="arcadeStatus">${state.challenge ? '<strong>Denní challenge:</strong> stejné cíle pro všechny.' : '<strong>Aim Trainer:</strong> klikni na cíle, drž combo.'}</div>
          <div class="arcadeStatus">Zbývá: <strong id="aimTimeLeft">${fmtTime(state.duration)}</strong></div>
        </div>
        <div class="arcadeBoardWrap arcadeAimBoard arcadePanel" id="aimBoard">
          <button type="button" class="arcadeAimTarget" id="aimTarget" aria-label="Target"></button>
        </div>
        <div class="arcadeControls">
          <button type="button" class="gameControlBtn" id="aimStartBtn">Spustit</button>
          <button type="button" class="gameControlBtn" id="aimResetBtn">Nová hra</button>
        </div>
        ${gamesTop3Block(state.challenge ? 'daily' : 'aim', state.challenge ? 'bodů' : 'bodů', 5)}
      </div>`;
    const board = body.querySelector('#aimBoard');
    const target = body.querySelector('#aimTarget');
    const timeLeftEl = body.querySelector('#aimTimeLeft');
    const updateTarget = () => {
      if (!board || !target) return;
      const r = board.getBoundingClientRect();
      const pad = 44;
      const x = clamp((Math.random() * (r.width - pad * 2)) + pad, 36, Math.max(36, r.width - 36));
      const y = clamp((Math.random() * (r.height - pad * 2)) + pad, 36, Math.max(36, r.height - 36));
      state.target = { x, y };
      target.style.left = `${x}px`;
      target.style.top = `${y}px`;
      target.style.width = state.combo >= 10 ? '64px' : '58px';
      target.style.height = state.combo >= 10 ? '64px' : '58px';
    };
    const finish = () => {
      if (state.finished) return;
      state.finished = true;
      state.running = false;
      clearInterval(state.timer);
      const total = state.hits + state.misses;
      state.accuracy = total ? (state.hits / total) * 100 : 100;
      const points = Math.max(0, Math.round(state.score + state.accuracy * 1.5 + state.bestCombo * 10));
      const payload = { plays: 1, bestScore: points, bestAccuracy: Math.round(state.accuracy), bestCombo: state.bestCombo, lastResult: `${state.hits}/${total}` };
      if (state.challenge) payload.game_type = 'daily';
      gamesRecordStat(state.challenge ? 'daily' : 'aim', payload);
      body.querySelector('.arcadeStatus')?.insertAdjacentHTML('afterend', `<div class="arcadeBanner arcadePanel isGo uPad14"> <div class="arcadeBannerTitle">Konec kola</div><div class="arcadeBannerText">Skóre ${points} · Accuracy ${Math.round(state.accuracy)} % · Max combo ${state.bestCombo}</div></div>`);
    };
    const tick = () => {
      if (!state.running) return;
      const left = Math.max(0, state.duration - (Date.now() - state.startAt));
      if (timeLeftEl) timeLeftEl.textContent = fmtTime(left);
      if (left <= 0) { finish(); return; }
    };
    const start = () => {
      if (state.running) return;
      state.running = true;
      state.finished = false;
      state.startAt = Date.now();
      clearInterval(state.timer);
      state.timer = rakGameSetInterval(tick, 160);
      updateTarget();
      tick();
    };
    const hit = (ev) => {
      ev?.preventDefault?.(); ev?.stopPropagation?.();
      if (!state.running) start();
      state.hits += 1;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.score += 10 + Math.min(20, state.combo * 2);
      updateTarget();
      const total = state.hits + state.misses;
      state.accuracy = total ? (state.hits / total) * 100 : 100;
      body.querySelector('.arcadeHud').innerHTML = `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Combo', state.combo)}${gamesStatLine('Accuracy', `${Math.round(state.accuracy)} %`)}`;
      if (state.hits >= (state.challenge ? 20 : 25)) finish();
    };
    target.addEventListener('click', hit);
    board.addEventListener('pointerdown', (ev) => {
      if (ev.target === target) return;
      if (!state.running) start();
      state.combo = 0;
      state.misses += 1;
      state.accuracy = (state.hits / (state.hits + state.misses)) * 100;
      body.querySelector('.arcadeHud').innerHTML = `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Combo', state.combo)}${gamesStatLine('Accuracy', `${Math.round(state.accuracy)} %`)}`;
    });
    body.querySelector('#aimStartBtn').addEventListener('click', () => { if (!state.running || state.finished) { state.score = 0; state.combo = 0; state.hits = 0; state.misses = 0; state.bestCombo = 0; state.accuracy = 100; state.startAt = 0; state.finished = false; start(); } });
    body.querySelector('#aimResetBtn').addEventListener('click', () => { state.running = false; clearInterval(state.timer); state.score = 0; state.combo = 0; state.hits = 0; state.misses = 0; state.bestCombo = 0; state.accuracy = 100; state.startAt = 0; state.finished = false; updateTarget(); body.querySelector('.arcadeHud').innerHTML = `${gamesStatLine('Skóre', 0)}${gamesStatLine('Combo', 0)}${gamesStatLine('Accuracy', '100 %')}`; timeLeftEl.textContent = fmtTime(state.duration); });
    updateTarget();
    const resize = () => updateTarget();
    window.addEventListener('resize', resize, { passive: true });
    addCleanup(() => { clearInterval(state.timer); window.removeEventListener('resize', resize); });
    setActiveState('aim', state);
  }

  // Reaction Test ----------------------------------------------------------
  function renderReaction(body) {
    const state = getState('reaction', () => ({ phase: 'ready', roundsLeft: 5, startedAt: 0, bestTimeMs: 0, lastTimeMs: 0, times: [], timer: null, waitingTimer: null, tooSoon: false, finished: false }));
    if (!state.phase || state.finished) {
      state.phase = 'ready'; state.roundsLeft = 5; state.startedAt = 0; state.bestTimeMs = 0; state.lastTimeMs = 0; state.times = []; state.finished = false; state.tooSoon = false;
    }
    body.innerHTML = `
      <div class="arcadeStage">
        <div class="arcadeHud">
          ${gamesStatLine('Kolo', `${6 - state.roundsLeft}/5`)}
          ${gamesStatLine('Best', fmtTime(state.bestTimeMs))}
          ${gamesStatLine('Poslední', fmtTime(state.lastTimeMs))}
        </div>
        <div class="arcadeBoardWrap arcadeBanner arcadePanel ${state.phase === 'go' ? 'isGo' : ''} ${state.tooSoon ? 'isBad' : ''}" id="reactionBoard">
          <div class="arcadeBannerTitle">${state.phase === 'go' ? 'TEĎ!' : (state.phase === 'waiting' ? 'Čekej...' : (state.tooSoon ? 'Moc brzo!' : 'Připrav se'))}</div>
          <div class="arcadeBannerText" id="reactionText">${state.phase === 'go' ? 'Klikni co nejrychleji.' : 'Klepni na kartu a počkej na zelenou.'}</div>
          <div class="arcadeStatus">Zbývá kol: <strong>${state.roundsLeft}</strong></div>
        </div>
        <div class="arcadeControls">
          <button type="button" class="gameControlBtn" id="reactionStartBtn">Start</button>
          <button type="button" class="gameControlBtn" id="reactionResetBtn">Nová hra</button>
        </div>
        ${gamesTop3Block('reaction', 'ms', 5)}
      </div>`;
    const board = body.querySelector('#reactionBoard');
    const text = body.querySelector('#reactionText');
    const clearWaiting = () => { clearTimeout(state.waitingTimer); state.waitingTimer = null; };
    const nextRound = () => {
      clearWaiting();
      if (state.roundsLeft <= 0) { finish(); return; }
      state.phase = 'waiting';
      state.tooSoon = false;
      const delay = 900 + Math.random() * 2400;
      text.textContent = 'Klepni až karta zezelená.';
      state.waitingTimer = setTimeout(() => {
        state.phase = 'go';
        state.startedAt = performance.now();
        board.classList.add('isGo');
        board.classList.remove('isBad');
        text.textContent = 'Teď!';
      }, delay);
    };
    const finish = () => {
      if (state.finished) return;
      state.finished = true;
      state.phase = 'done';
      const best = state.bestTimeMs || Math.min(...state.times.filter(Boolean)) || 0;
      const avg = state.times.length ? Math.round(state.times.reduce((a, b) => a + b, 0) / state.times.length) : 0;
      gamesRecordStat('reaction', { plays: 1, bestTimeMs: best, bestScore: best ? encodePoints('reaction', best) : 0, lastResult: `${best} ms` });
      board.classList.remove('isGo');
      text.textContent = `Hotovo. Průměr ${fmtTime(avg)}, best ${fmtTime(best)}.`;
    };
    const onTap = () => {
      if (state.finished) { state.phase = 'ready'; state.roundsLeft = 5; state.times = []; state.bestTimeMs = 0; state.lastTimeMs = 0; state.finished = false; body.querySelector('#reactionBoard').classList.remove('isGo','isBad'); text.textContent = 'Klepni na kartu a počkej na zelenou.'; return; }
      if (state.phase === 'ready') { state.roundsLeft = 5; state.times = []; state.bestTimeMs = 0; state.lastTimeMs = 0; nextRound(); return; }
      if (state.phase === 'waiting') {
        state.tooSoon = true;
        state.phase = 'ready';
        clearWaiting();
        board.classList.remove('isGo');
        board.classList.add('isBad');
        text.textContent = 'Moc brzo. Zkus znovu.';
        return;
      }
      if (state.phase === 'go') {
        const time = Math.max(1, Math.round(performance.now() - state.startedAt));
        state.lastTimeMs = time;
        state.bestTimeMs = state.bestTimeMs ? Math.min(state.bestTimeMs, time) : time;
        state.times.push(time);
        state.roundsLeft -= 1;
        body.querySelector('.arcadeHud').innerHTML = `${gamesStatLine('Kolo', `${6 - state.roundsLeft}/5`)}${gamesStatLine('Best', fmtTime(state.bestTimeMs))}${gamesStatLine('Poslední', fmtTime(state.lastTimeMs))}`;
        if (state.roundsLeft <= 0) { finish(); return; }
        nextRound();
      }
    };
    board.addEventListener('click', onTap);
    body.querySelector('#reactionStartBtn').addEventListener('click', () => { state.phase = 'ready'; state.roundsLeft = 5; state.times = []; state.bestTimeMs = 0; state.lastTimeMs = 0; state.finished = false; nextRound(); });
    body.querySelector('#reactionResetBtn').addEventListener('click', () => { state.phase = 'ready'; state.roundsLeft = 5; state.times = []; state.bestTimeMs = 0; state.lastTimeMs = 0; state.finished = false; clearWaiting(); board.classList.remove('isGo','isBad'); text.textContent = 'Klepni na kartu a počkej na zelenou.'; body.querySelector('.arcadeHud').innerHTML = `${gamesStatLine('Kolo', `0/5`)}${gamesStatLine('Best', '—')}${gamesStatLine('Poslední', '—')}`; });
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
  function tetrisState() { return { board: Array.from({ length: 20 }, () => Array(10).fill('')), piece: tetrisNewPiece(), score: 0, lines: 0, level: 1, over: false, dropAcc: 0, lastTs: 0, startedAt: Date.now(), best: 0, raf: 0 }; }
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
    st.piece = tetrisNewPiece();
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
    const stage = createCanvas(body, 'clamp(320px, 58dvh, 560px)');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeHud">${gamesStatLine('Skóre', state.score)}${gamesStatLine('Řádky', state.lines)}${gamesStatLine('Level', state.level)}</div><div class="arcadeBar arcadePanel uPad10x12"><div class="arcadeStatus">Swipe nebo tlačítka. Ghost piece a combo efekt jsou v klasickém RaK stylu.</div></div><div class="arcadeControls"><button type="button" class="gameControlBtn" data-act="left">◀</button><button type="button" class="gameControlBtn" data-act="right">▶</button><button type="button" class="gameControlBtn" data-act="rotate">⟳</button><button type="button" class="gameControlBtn" data-act="down">▼</button><button type="button" class="gameControlBtn" data-act="drop">⤓</button><button type="button" class="gameControlBtn" data-act="restart">Nová hra</button></div>${gamesTop3Block('tetris', 'bodů', 5)}`);
    const canvas = stage.canvas; const ctx = stage.ctx;
    const resize = () => stage.resize();
    const draw = () => {
      const { w, h } = stage.resize();
      const cell = Math.floor(Math.min(w / 10, h / 20));
      const bw = cell * 10; const bh = cell * 20;
      const ox = Math.floor((w - bw) / 2); const oy = Math.floor((h - bh) / 2);
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(ox, oy);
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      ctx.fillRect(0, 0, bw, bh);
      ctx.strokeStyle = 'rgba(124,255,124,.08)';
      for (let y = 0; y < 20; y += 1) for (let x = 0; x < 10; x += 1) {
        const v = state.board[y][x];
        ctx.fillStyle = v ? (v === 'I' ? '#6ee7ff' : v === 'O' ? '#ffe27a' : v === 'T' ? '#c18bff' : v === 'S' ? '#8bffb2' : v === 'Z' ? '#ff8f8f' : v === 'J' ? '#8fb2ff' : '#ffb36f') : 'rgba(255,255,255,.03)';
        ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
        ctx.strokeRect(x * cell + .5, y * cell + .5, cell, cell);
      }
      const ghost = (() => { const s = { ...state, piece: { ...state.piece, matrix: state.piece.matrix.map(r => r.slice()) } }; while (!tetrisCollision(s, 0, 1)) s.piece.y += 1; return s.piece.y; })();
      state.piece.matrix.forEach((row, y) => row.forEach((v, x) => {
        if (!v) return;
        const px = (state.piece.x + x) * cell;
        const py = (state.piece.y + y) * cell;
        const gy = (ghost + y) * cell;
        ctx.fillStyle = v ? 'rgba(255,255,255,.88)' : 'transparent';
        ctx.shadowColor = 'rgba(124,255,124,.28)'; ctx.shadowBlur = 10;
        ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(124,255,124,.16)';
        ctx.fillRect((state.piece.x + x) * cell + 4, gy + 4, cell - 8, cell - 8);
      }));
      if (state.over) {
        ctx.fillStyle = 'rgba(7,10,8,.68)'; ctx.fillRect(0, 0, bw, bh);
        ctx.fillStyle = '#fff'; ctx.font = `${Math.max(18, Math.floor(cell * 0.9))}px system-ui`; ctx.textAlign = 'center'; ctx.fillText('Konec hry', bw / 2, bh / 2 - 6); ctx.font = '12px system-ui'; ctx.fillText('Klepni na Nová hra', bw / 2, bh / 2 + 16);
      }
      ctx.restore();
      body.querySelector('.arcadeHud').innerHTML = `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Řádky', state.lines)}${gamesStatLine('Level', state.level)}`;
    };
    const restart = () => { Object.assign(state, tetrisState()); draw(); };
    body.querySelectorAll('[data-act]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        if (act === 'left') tetrisMove(state, -1, 0);
        else if (act === 'right') tetrisMove(state, 1, 0);
        else if (act === 'down') tetrisMove(state, 0, 1);
        else if (act === 'rotate') tetrisRotate(state);
        else if (act === 'drop') { while (tetrisMove(state, 0, 1)); }
        else if (act === 'restart') restart();
        draw();
      });
    });
    const onKey = (ev) => {
      if (['INPUT','TEXTAREA','SELECT'].includes((ev.target && ev.target.tagName) || '')) return;
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); tetrisMove(state, -1, 0); }
      else if (ev.key === 'ArrowRight') { ev.preventDefault(); tetrisMove(state, 1, 0); }
      else if (ev.key === 'ArrowDown') { ev.preventDefault(); tetrisMove(state, 0, 1); }
      else if (ev.key === 'ArrowUp' || ev.key === 'z' || ev.key === 'Z') { ev.preventDefault(); tetrisRotate(state); }
      else if (ev.key === ' ' ) { ev.preventDefault(); while (tetrisMove(state, 0, 1)); }
      draw();
    };
    document.addEventListener('keydown', onKey);
    const loop = (ts) => {
      if (!rakGameShouldTick()) { state.lastTs = 0; state.raf = 0; return; }
      const dt = rakGameDelta(state, ts);
      if (!state.over) {
        state.dropAcc += dt;
        const speed = Math.max(120, 700 - (state.level - 1) * 45);
        if (state.dropAcc >= speed) { state.dropAcc = 0; tetrisMove(state, 0, 1); }
      }
      draw();
      state.raf = rakGameRequestFrame(state, loop);
    };
    state.raf = rakGameRequestFrame(state, loop);
    const finishCleanup = () => { cancelAnimationFrame(state.raf); document.removeEventListener('keydown', onKey); gamesRecordStat('tetris', { plays: 1, bestScore: Math.max(state.score, getAccountStat(gamesGetActiveAccount(), 'tetris').bestScore || 0), lastResult: String(state.score) }); };
    addCleanup(() => { cancelAnimationFrame(state.raf); document.removeEventListener('keydown', onKey); });
    body.querySelector('.arcadeControls [data-act="restart"]').addEventListener('click', () => { if (state.over) { gamesRecordStat('tetris', { plays: 1, bestScore: state.score, lastResult: String(state.score) }); state.over = false; } });
    addCleanup(() => { if (state.over) gamesRecordStat('tetris', { plays: 1, bestScore: state.score, lastResult: String(state.score) }); });
    draw();
    setActiveState('tetris', state);
  }

  // Space Shooter ----------------------------------------------------------
  function shooterState() { return { score: 0, over: false, lastTs: 0, raf: 0, shipX: 160, bullets: [], enemies: [], spawnAcc: 0, shotCooldown: 0, stars: Array.from({ length: 24 }, () => ({ x: Math.random() * 320, y: Math.random() * 420, s: 0.5 + Math.random() * 1.5 })), startedAt: Date.now() }; }
  function renderShooter(body) {
    const state = getState('shooter', shooterState);
    const stage = createCanvas(body, 'clamp(300px, 52dvh, 470px)');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeHud">${gamesStatLine('Skóre', state.score)}${gamesStatLine('Zásahy', state.enemies.length ? state.score : 0)}${gamesStatLine('Stav', state.over ? 'Konec' : 'Boj')}</div><div class="arcadeControls"><button type="button" class="gameControlBtn" data-ship="shoot">Střelba</button><button type="button" class="gameControlBtn" data-ship="restart">Nová hra</button></div>${gamesTop3Block('shooter', 'bodů', 5)}`);
    const canvas = stage.canvas, ctx = stage.ctx;
    const resize = () => stage.resize();
    const spawnEnemy = () => { const w = canvas.clientWidth || stage.wrap.clientWidth || 320; state.enemies.push({ x: Math.random() * (w - 24) + 12, y: -20, vx: (Math.random() - .5) * 0.4, vy: 1.2 + Math.random() * 1.6, hp: 1 + (state.score > 150 ? 1 : 0) }); };
    const shoot = () => { if (state.shotCooldown > 0 || state.over) return; state.bullets.push({ x: state.shipX, y: 360, vy: -5.8 }); state.shotCooldown = 160; };
    const pointerMove = (ev) => {
      const rect = canvas.getBoundingClientRect();
      state.shipX = clamp(ev.clientX - rect.left, 18, rect.width - 18);
    };
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerdown', (ev) => { pointerMove(ev); shoot(); });
    body.querySelector('[data-ship="shoot"]').addEventListener('click', shoot);
    body.querySelector('[data-ship="restart"]').addEventListener('click', () => { Object.assign(state, shooterState()); });
    const draw = () => {
      const { w, h } = stage.resize();
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(8,12,18,.94)'; ctx.fillRect(0, 0, w, h);
      state.stars.forEach((s) => { s.y += s.s; if (s.y > h) { s.y = -2; s.x = Math.random() * w; } ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(s.x, s.y, 2, 2); });
      const shipY = h - 36;
      ctx.fillStyle = '#8bffb2'; ctx.beginPath(); ctx.moveTo(state.shipX, shipY - 14); ctx.lineTo(state.shipX - 14, shipY + 10); ctx.lineTo(state.shipX + 14, shipY + 10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#dfffe3'; ctx.fillRect(state.shipX - 4, shipY - 2, 8, 10);
      state.bullets.forEach((b) => { ctx.fillStyle = '#ffe27a'; ctx.fillRect(b.x - 2, b.y - 8, 4, 10); });
      state.enemies.forEach((e) => { ctx.fillStyle = '#ff8f8f'; ctx.beginPath(); ctx.arc(e.x, e.y, 12, 0, Math.PI * 2); ctx.fill(); });
      if (state.over) { ctx.fillStyle = 'rgba(7,10,8,.68)'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#fff'; ctx.font = '18px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Konec hry', w / 2, h / 2); }
    };
    const loop = (ts) => {
      if (!rakGameShouldTick()) { state.lastTs = 0; state.raf = 0; return; }
      const dt = rakGameDelta(state, ts);
      const { w, h } = stage.resize();
      if (!state.over) {
        state.shotCooldown = Math.max(0, state.shotCooldown - dt);
        state.spawnAcc += dt;
        if (state.spawnAcc > Math.max(500, 900 - Math.floor(state.score / 20) * 25)) { state.spawnAcc = 0; spawnEnemy(); }
        state.bullets.forEach((b) => { b.y += b.vy * dt / 16; });
        state.enemies.forEach((e) => { e.x += e.vx * dt / 16; e.y += e.vy * dt / 16; });
        state.bullets = state.bullets.filter((b) => b.y > -20);
        const shipY = h - 36;
        state.enemies.forEach((e) => {
          if (Math.abs(e.x - state.shipX) < 16 && Math.abs(e.y - shipY) < 18) state.over = true;
          if (e.y > h + 20) state.over = true;
        });
        state.bullets = state.bullets.filter((b) => {
          for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
            const e = state.enemies[i];
            if (Math.hypot(b.x - e.x, b.y - e.y) < 16) {
              state.enemies.splice(i, 1);
              state.score += 10;
              return false;
            }
          }
          return true;
        });
      }
      body.querySelector('.arcadeHud').innerHTML = `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Zásahy', state.score ? state.score / 10 : 0)}${gamesStatLine('Stav', state.over ? 'Konec' : 'Boj')}`;
      draw();
      state.raf = rakGameRequestFrame(state, loop);
    };
    state.raf = rakGameRequestFrame(state, loop);
    addCleanup(() => { cancelAnimationFrame(state.raf); canvas.removeEventListener('pointermove', pointerMove); gamesRecordStat('shooter', { plays: 1, bestScore: state.score, lastResult: String(state.score) }); });
    setActiveState('shooter', state);
  }

  // Brick Breaker ----------------------------------------------------------
  function brickState() { return { score: 0, over: false, lastTs: 0, raf: 0, paddleX: 0, ball: { x: 160, y: 280, vx: 3, vy: -3 }, launched: false, bricks: [] }; }
  function initBricks(state) { state.bricks = []; for (let r = 0; r < 5; r += 1) { for (let c = 0; c < 8; c += 1) state.bricks.push({ x: c, y: r, alive: true }); } }
  function renderBrick(body) {
    const state = getState('brick', () => { const s = brickState(); initBricks(s); return s; });
    const stage = createCanvas(body, 'clamp(300px, 48dvh, 420px)');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeHud">${gamesStatLine('Skóre', state.score)}${gamesStatLine('Bricky', state.bricks.filter(b => b.alive).length)}${gamesStatLine('Stav', state.over ? 'Konec' : 'Hra')}` + `</div><div class="arcadeControls"><button type="button" class="gameControlBtn" data-brick="launch">Spustit</button><button type="button" class="gameControlBtn" data-brick="restart">Nová hra</button></div>${gamesTop3Block('brick', 'bodů', 5)}`);
    const canvas = stage.canvas, ctx = stage.ctx;
    const movePaddle = (x) => { const w = canvas.getBoundingClientRect().width; state.paddleX = clamp(x - 40, 0, Math.max(0, w - 80)); };
    canvas.addEventListener('pointermove', (ev) => movePaddle(ev.clientX - canvas.getBoundingClientRect().left));
    canvas.addEventListener('pointerdown', (ev) => { movePaddle(ev.clientX - canvas.getBoundingClientRect().left); if (!state.launched) state.launched = true; });
    body.querySelector('[data-brick="launch"]').addEventListener('click', () => { state.launched = true; });
    body.querySelector('[data-brick="restart"]').addEventListener('click', () => { Object.assign(state, brickState()); initBricks(state); });
    const draw = () => {
      const { w, h } = stage.resize();
      const paddleY = h - 24;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(8,12,18,.94)'; ctx.fillRect(0, 0, w, h);
      const brickW = w / 8 - 4;
      const brickH = 20;
      state.bricks.forEach((b) => { if (!b.alive) return; const x = b.x * (brickW + 4) + 2; const y = b.y * (brickH + 4) + 10; ctx.fillStyle = 'rgba(124,255,124,.15)'; ctx.fillRect(x, y, brickW, brickH); });
      ctx.fillStyle = '#8bffb2'; ctx.fillRect(state.paddleX, paddleY, 80, 10);
      ctx.beginPath(); ctx.fillStyle = '#ffe27a'; ctx.arc(state.ball.x, state.ball.y, 6, 0, Math.PI * 2); ctx.fill();
      if (state.over) { ctx.fillStyle = 'rgba(7,10,8,.7)'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '18px system-ui'; ctx.fillText('Konec hry', w / 2, h / 2); }
    };
    const loop = (ts) => {
      if (!rakGameShouldTick()) { state.lastTs = 0; state.raf = 0; return; }
      const dt = rakGameDelta(state, ts);
      const { w, h } = stage.resize();
      const paddleY = h - 24;
      if (!state.over && state.launched) {
        state.ball.x += state.ball.vx * dt / 16;
        state.ball.y += state.ball.vy * dt / 16;
        if (state.ball.x < 6 || state.ball.x > w - 6) state.ball.vx *= -1;
        if (state.ball.y < 6) state.ball.vy *= -1;
        if (state.ball.y > paddleY - 6 && state.ball.y < paddleY + 12 && state.ball.x > state.paddleX - 4 && state.ball.x < state.paddleX + 84 && state.ball.vy > 0) {
          state.ball.vy *= -1; const hit = (state.ball.x - (state.paddleX + 40)) / 40; state.ball.vx = hit * 5.2; state.score += 5;
        }
        const brickW = w / 8 - 4; const brickH = 20;
        state.bricks.forEach((b) => {
          if (!b.alive) return;
          const x = b.x * (brickW + 4) + 2;
          const y = b.y * (brickH + 4) + 10;
          if (state.ball.x > x && state.ball.x < x + brickW && state.ball.y > y && state.ball.y < y + brickH) {
            b.alive = false;
            state.ball.vy *= -1;
            state.score += 10;
          }
        });
        if (state.ball.y > h + 18) state.over = true;
        if (!state.bricks.some(b => b.alive)) state.over = true;
      }
      body.querySelector('.arcadeHud').innerHTML = `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Bricky', state.bricks.filter(b => b.alive).length)}${gamesStatLine('Stav', state.over ? 'Konec' : 'Hra')}`;
      draw();
      state.raf = rakGameRequestFrame(state, loop);
    };
    state.raf = rakGameRequestFrame(state, loop);
    addCleanup(() => { cancelAnimationFrame(state.raf); gamesRecordStat('brick', { plays: 1, bestScore: state.score, lastResult: String(state.score) }); });
    setActiveState('brick', state);
  }

  // Doodle Jump ------------------------------------------------------------
  function doodleState() { return { score: 0, over: false, lastTs: 0, raf: 0, x: 160, y: 260, vy: -1.6, vx: 0, platforms: [], highest: 260 }; }
  function initDoodle(state) { state.platforms = []; for (let i = 0; i < 14; i += 1) state.platforms.push({ x: Math.random() * 260 + 20, y: 280 - i * 34, w: 48 }); }
  function renderDoodle(body) {
    const state = getState('doodle', () => { const s = doodleState(); initDoodle(s); return s; });
    const stage = createCanvas(body, 'clamp(300px, 54dvh, 470px)');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeHud">${gamesStatLine('Skóre', state.score)}${gamesStatLine('Výška', Math.max(0, Math.round((state.highest - state.y) * 1.5)))}${gamesStatLine('Stav', state.over ? 'Konec' : 'Skok')}` + `</div><div class="arcadeControls"><button type="button" class="gameControlBtn" data-doodle="left">◀</button><button type="button" class="gameControlBtn" data-doodle="right">▶</button><button type="button" class="gameControlBtn" data-doodle="restart">Nová hra</button></div>${gamesTop3Block('doodle', 'bodů', 5)}`);
    const canvas = stage.canvas, ctx = stage.ctx;
    const setMove = (dir) => { if (dir === 'left') state.vx = -2.8; else if (dir === 'right') state.vx = 2.8; };
    body.querySelector('[data-doodle="left"]').addEventListener('click', () => setMove('left'));
    body.querySelector('[data-doodle="right"]').addEventListener('click', () => setMove('right'));
    body.querySelector('[data-doodle="restart"]').addEventListener('click', () => { Object.assign(state, doodleState()); initDoodle(state); });
    canvas.addEventListener('pointermove', (ev) => { const rect = canvas.getBoundingClientRect(); const x = ev.clientX - rect.left; state.vx = (x < rect.width / 2) ? -2.6 : 2.6; });
    const draw = () => {
      const { w, h } = stage.resize();
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(8,12,18,.94)'; ctx.fillRect(0, 0, w, h);
      state.platforms.forEach((p) => { ctx.fillStyle = 'rgba(124,255,124,.16)'; ctx.fillRect(p.x, p.y, p.w, 10); });
      ctx.fillStyle = '#8bffb2'; ctx.beginPath(); ctx.arc(state.x, state.y, 10, 0, Math.PI * 2); ctx.fill();
      if (state.over) { ctx.fillStyle = 'rgba(7,10,8,.7)'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '18px system-ui'; ctx.fillText('Konec hry', w / 2, h / 2); }
    };
    const loop = (ts) => {
      if (!rakGameShouldTick()) { state.lastTs = 0; state.raf = 0; return; }
      const dt = rakGameDelta(state, ts);
      const { w, h } = stage.resize();
      if (!state.over) {
        state.x += state.vx * dt / 16;
        state.x = (state.x + w) % w;
        state.vy += 0.25 * dt / 16;
        state.y += state.vy * dt / 16;
        if (state.y < h * 0.35) {
          const dy = h * 0.35 - state.y;
          state.y = h * 0.35;
          state.highest = Math.min(state.highest, state.y);
          state.platforms.forEach(p => p.y += dy);
          state.score += Math.max(1, Math.round(dy));
        }
        state.platforms.forEach((p) => {
          if (state.vy > 0 && state.x > p.x - 4 && state.x < p.x + p.w + 4 && state.y > p.y - 10 && state.y < p.y + 12) {
            state.vy = -6.5;
          }
        });
        state.platforms = state.platforms.filter(p => p.y < h + 20);
        while (state.platforms.length < 14) state.platforms.push({ x: Math.random() * (w - 60), y: -20 - Math.random() * 40, w: 48 + Math.random() * 20 });
        if (state.y > h + 20) state.over = true;
      }
      body.querySelector('.arcadeHud').innerHTML = `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Výška', Math.max(0, Math.round((state.highest - state.y) * 1.5)))}${gamesStatLine('Stav', state.over ? 'Konec' : 'Skok')}`;
      draw();
      state.raf = rakGameRequestFrame(state, loop);
    };
    state.raf = rakGameRequestFrame(state, loop);
    addCleanup(() => { cancelAnimationFrame(state.raf); gamesRecordStat('doodle', { plays: 1, bestScore: state.score, lastResult: String(state.score) }); });
    setActiveState('doodle', state);
  }

  // Bubble Shooter ---------------------------------------------------------
  function bubbleState() { return { score: 0, over: false, lastTs: 0, raf: 0, aim: 0, shot: null, grid: [], colors: ['#ff8f8f', '#ffe27a', '#8bffb2', '#8fb2ff', '#c18bff'], rows: 8, cols: 8, combo: 0 }; }
  function initBubble(state) { state.grid = Array.from({ length: state.rows }, (_, r) => Array.from({ length: state.cols }, (_, c) => (r < 4 ? randomPick(state.colors) : ''))); }
  function renderBubble(body) {
    const state = getState('bubble', () => { const s = bubbleState(); initBubble(s); return s; });
    const stage = createCanvas(body, 'clamp(300px, 52dvh, 460px)');
    body.insertAdjacentHTML('afterbegin', `<div class="arcadeHud">${gamesStatLine('Skóre', state.score)}${gamesStatLine('Combo', state.combo)}${gamesStatLine('Stav', state.over ? 'Konec' : 'Pusť')}` + `</div><div class="arcadeControls"><button type="button" class="gameControlBtn" data-bubble="shoot">Střelba</button><button type="button" class="gameControlBtn" data-bubble="restart">Nová hra</button></div>${gamesTop3Block('bubble', 'bodů', 5)}`);
    const canvas = stage.canvas, ctx = stage.ctx;
    const fire = (ev) => { if (state.over) return; const rect = canvas.getBoundingClientRect(); const x = ev ? ev.clientX - rect.left : rect.width / 2; state.aim = clamp((x / rect.width) * Math.PI - Math.PI / 2, -Math.PI * .9, -Math.PI * .1); if (!state.shot) state.shot = { x: rect.width / 2, y: rect.height - 18, vx: Math.cos(state.aim) * 5.2, vy: Math.sin(state.aim) * 5.2, color: randomPick(state.colors) }; };
    canvas.addEventListener('pointermove', (ev) => { const rect = canvas.getBoundingClientRect(); state.aim = clamp(((ev.clientX - rect.left) / rect.width) * Math.PI - Math.PI / 2, -Math.PI * .9, -Math.PI * .1); });
    canvas.addEventListener('pointerdown', (ev) => fire(ev));
    body.querySelector('[data-bubble="shoot"]').addEventListener('click', () => fire());
    body.querySelector('[data-bubble="restart"]').addEventListener('click', () => { Object.assign(state, bubbleState()); initBubble(state); });
    const draw = () => {
      const { w, h } = stage.resize();
      const cell = Math.floor(w / state.cols);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(8,12,18,.94)'; ctx.fillRect(0, 0, w, h);
      for (let r = 0; r < state.rows; r += 1) {
        for (let c = 0; c < state.cols; c += 1) {
          const color = state.grid[r][c];
          if (!color) continue;
          ctx.fillStyle = color; ctx.beginPath(); ctx.arc(c * cell + cell / 2, r * cell + cell / 2 + 12, cell * .34, 0, Math.PI * 2); ctx.fill();
        }
      }
      if (state.shot) { ctx.fillStyle = state.shot.color; ctx.beginPath(); ctx.arc(state.shot.x, state.shot.y, cell * .28, 0, Math.PI * 2); ctx.fill(); }
      if (state.over) { ctx.fillStyle = 'rgba(7,10,8,.7)'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '18px system-ui'; ctx.fillText('Konec hry', w / 2, h / 2); }
    };
    const clusterPop = (r, c, color, seen = new Set()) => {
      const q = [[r, c]]; const cluster = [];
      while (q.length) {
        const [rr, cc] = q.pop(); const k = `${rr}:${cc}`; if (seen.has(k)) continue; seen.add(k);
        if (rr < 0 || cc < 0 || rr >= state.rows || cc >= state.cols) continue;
        if (state.grid[rr][cc] !== color) continue;
        cluster.push([rr, cc]);
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr, dc]) => q.push([rr + dr, cc + dc]));
      }
      return cluster;
    };
    const loop = (ts) => {
      if (!rakGameShouldTick()) { state.lastTs = 0; state.raf = 0; return; }
      const dt = rakGameDelta(state, ts);
      const { w, h } = stage.resize();
      const cell = Math.floor(w / state.cols);
      if (!state.over) {
        if (state.shot) {
          state.shot.x += state.shot.vx * dt / 16;
          state.shot.y += state.shot.vy * dt / 16;
          if (state.shot.x < 10 || state.shot.x > w - 10) state.shot.vx *= -1;
          if (state.shot.y < 18) {
            const row = 0; const col = clamp(Math.round(state.shot.x / cell - 0.5), 0, state.cols - 1);
            state.grid[row][col] = state.shot.color;
            const cluster = clusterPop(row, col, state.shot.color);
            if (cluster.length >= 3) { cluster.forEach(([rr, cc]) => { state.grid[rr][cc] = ''; }); state.score += cluster.length * 10; state.combo += 1; } else { state.combo = 0; }
            state.shot = null;
          } else {
            let hit = false;
            for (let r = 0; r < state.rows; r += 1) for (let c = 0; c < state.cols; c += 1) {
              const color = state.grid[r][c]; if (!color) continue;
              const cx = c * cell + cell / 2, cy = r * cell + cell / 2 + 12;
              if (Math.hypot(state.shot.x - cx, state.shot.y - cy) < cell * .34) {
                state.grid[r][c] = state.shot.color;
                const cluster = clusterPop(r, c, state.shot.color);
                if (cluster.length >= 3) { cluster.forEach(([rr, cc]) => { state.grid[rr][cc] = ''; }); state.score += cluster.length * 10; state.combo += 1; } else { state.combo = 0; }
                state.shot = null; hit = true; break;
              }
            }
            if (!hit && state.shot) { /* continue */ }
          }
        }
        if (!state.grid.some(row => row.some(Boolean))) state.over = true;
      }
      body.querySelector('.arcadeHud').innerHTML = `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Combo', state.combo)}${gamesStatLine('Stav', state.over ? 'Konec' : 'Pusť')}`;
      draw();
      state.raf = rakGameRequestFrame(state, loop);
    };
    state.raf = rakGameRequestFrame(state, loop);
    addCleanup(() => { cancelAnimationFrame(state.raf); gamesRecordStat('bubble', { plays: 1, bestScore: state.score, lastResult: String(state.score) }); });
    setActiveState('bubble', state);
  }

  // Sudoku -----------------------------------------------------------------
  const SUDOKU_PUZZLES = [
    { difficulty: 'easy', puzzle: ['530070000','600195000','098000060','800060003','400803001','700020006','060000280','000419005','000080079'], solution: ['534678912','672195348','198342567','859761423','426853791','713924856','961537284','287419635','345286179'] },
    { difficulty: 'medium', puzzle: ['003020600','900305001','001806400','008102900','700000008','006708200','002609500','800203009','005010300'], solution: ['483921657','967345821','251876493','548132976','729564138','136798245','372689514','814253769','695417382'] },
    { difficulty: 'hard', puzzle: ['000000907','000420180','000705026','100904000','050000040','000507009','920108000','034059000','507000000'], solution: ['462831957','397426185','851795326','176984253','259673841','483517629','925148763','634259718','517362494'] }
  ];
  function renderSudoku(body) {
    const state = getState('sudoku', () => ({ index: 0, startAt: 0, finished: false, selected: 'easy', mistakes: 0, solution: null, puzzle: null }));
    const pick = SUDOKU_PUZZLES.find(p => p.difficulty === state.selected) || SUDOKU_PUZZLES[0];
    if (!state.solution || state.selected !== pick.difficulty) {
      state.solution = pick.solution;
      state.puzzle = pick.puzzle;
      state.startAt = Date.now();
      state.finished = false;
      state.mistakes = 0;
    }
    const gridHtml = pick.puzzle.map((row, r) => row.split('').map((v, c) => {
      const fixed = v !== '0';
      return `<input class="arcadeSudokuCell" data-r="${r}" data-c="${c}" ${fixed ? 'readonly' : ''} inputmode="numeric" maxlength="1" value="${fixed ? v : ''}" aria-label="Sudoku ${r + 1}-${c + 1}">`;
    }).join('')).join('');
    body.innerHTML = `
      <div class="arcadeStage">
        <div class="arcadeHud">
          ${gamesStatLine('Obtížnost', pick.difficulty)}
          ${gamesStatLine('Čas', fmtTime(state.startAt ? Date.now() - state.startAt : 0))}
          ${gamesStatLine('Chyby', state.mistakes)}
        </div>
        <div class="arcadeBar arcadePanel uPad10x12">
          <div class="arcadeStatus">Vyplň čísla 1–9. Hotovo se uloží automaticky po správném doplnění.</div>
        </div>
        <div class="arcadeBoard grid-9 arcadePanel" id="sudokuGrid" class="uPad8">${gridHtml}</div>
        <div class="arcadeControls">
          <button type="button" class="gameControlBtn" data-sudoku="easy">Easy</button>
          <button type="button" class="gameControlBtn" data-sudoku="medium">Medium</button>
          <button type="button" class="gameControlBtn" data-sudoku="hard">Hard</button>
          <button type="button" class="gameControlBtn" data-sudoku="restart">Nové</button>
        </div>
        ${gamesTop3Block('sudoku', 'ms', 5)}
      </div>`;
    const grid = body.querySelector('#sudokuGrid');
    const completeCheck = () => {
      const cells = [...grid.querySelectorAll('input')];
      const values = cells.map((cell, idx) => {
        const r = Math.floor(idx / 9), c = idx % 9;
        const fixed = pick.puzzle[r][c] !== '0';
        const v = fixed ? pick.puzzle[r][c] : String(cell.value || '').trim().slice(0, 1);
        return v;
      });
      const rows = Array.from({ length: 9 }, (_, r) => values.slice(r * 9, r * 9 + 9));
      const valid = rows.every((row, r) => row.join('') === pick.solution[r]);
      if (valid && !state.finished) {
        state.finished = true;
        const time = Date.now() - state.startAt;
        gamesRecordStat('sudoku', { plays: 1, bestTimeMs: time, bestScore: encodePoints('sudoku', time), lastResult: fmtTime(time) });
        body.querySelector('.arcadeStatus').innerHTML = `<strong>Vyřešeno!</strong> Čas ${fmtTime(time)}.`;
      }
      body.querySelector('.arcadeHud').innerHTML = `${gamesStatLine('Obtížnost', pick.difficulty)}${gamesStatLine('Čas', fmtTime(Date.now() - state.startAt))}${gamesStatLine('Chyby', state.mistakes)}`;
    };
    grid.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        input.value = String(input.value || '').replace(/[^1-9]/g, '').slice(0, 1);
        if (input.value) completeCheck();
      });
    });
    body.querySelectorAll('[data-sudoku]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.sudoku === 'restart') { state.solution = null; state.finished = false; state.startAt = Date.now(); renderSudoku(body); return; }
        state.selected = btn.dataset.sudoku;
        state.solution = null;
        renderSudoku(body);
      });
    });
    setActiveState('sudoku', state);
  }

  // Minesweeper ------------------------------------------------------------
  function minesState() { return { w: 9, h: 9, mines: 10, flags: 0, opened: 0, over: false, win: false, startAt: Date.now(), mode: 'open', board: [], revealed: [], flagged: [], timer: 0 }; }
  function initMines(state) {
    state.board = Array.from({ length: state.h }, () => Array(state.w).fill(0));
    state.revealed = Array.from({ length: state.h }, () => Array(state.w).fill(false));
    state.flagged = Array.from({ length: state.h }, () => Array(state.w).fill(false));
    state.over = false; state.win = false; state.opened = 0; state.flags = 0; state.startAt = Date.now();
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
    const cells = [];
    for (let y = 0; y < state.h; y += 1) for (let x = 0; x < state.w; x += 1) {
      const rev = state.revealed[y][x]; const flag = state.flagged[y][x]; const val = state.board[y][x];
      let cls = 'arcadeCell'; let text = '';
      if (rev) { cls += ' isFilled'; if (val === -1) { cls += ' isMine'; text = '💣'; } else text = val ? String(val) : ''; }
      if (flag) cls += ' isActive';
      cells.push(`<button type="button" class="${cls}" data-x="${x}" data-y="${y}">${text}</button>`);
    }
    body.innerHTML = `
      <div class="arcadeStage">
        <div class="arcadeHud">${gamesStatLine('Mines', state.mines)}${gamesStatLine('Otevřeno', state.opened)}${gamesStatLine('Režim', state.mode === 'flag' ? 'Vlajka' : 'Otevřít')}</div>
        <div class="arcadeBar arcadePanel uPad10x12"><div class="arcadeStatus">Klepni na pole. Dlouhé držení nebo režim Vlajka přepne značku.</div></div>
        <div class="arcadeBoard grid-9 arcadePanel" id="minesGrid" class="uPad8">${cells.join('')}</div>
        <div class="arcadeControls"><button type="button" class="gameControlBtn" data-mines="mode">${state.mode === 'flag' ? 'Vlajka' : 'Otevřít'}</button><button type="button" class="gameControlBtn" data-mines="restart">Nová hra</button></div>
        ${gamesTop3Block('mines', 'ms', 5)}
      </div>`;
    const grid = body.querySelector('#minesGrid');
    const dig = (x, y) => {
      if (state.over || state.win) return;
      if (x < 0 || y < 0 || x >= state.w || y >= state.h || state.revealed[y][x] || state.flagged[y][x]) return;
      state.revealed[y][x] = true; state.opened += 1;
      if (state.board[y][x] === -1) { state.over = true; return; }
      if (state.board[y][x] === 0) {
        [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (ny >= 0 && ny < state.h && nx >= 0 && nx < state.w && !state.revealed[ny][nx]) dig(nx, ny); });
      }
      if (state.opened >= state.w * state.h - state.mines) { state.win = true; }
    };
    grid.querySelectorAll('button').forEach((btn) => {
      let longPress = null;
      btn.addEventListener('pointerdown', () => { longPress = setTimeout(() => { state.mode = 'flag'; btn.dataset.long = '1'; }, 450); });
      btn.addEventListener('pointerup', (ev) => { clearTimeout(longPress); const x = Number(btn.dataset.x), y = Number(btn.dataset.y); if (state.mode === 'flag' || btn.dataset.long === '1') { state.flagged[y][x] = !state.flagged[y][x]; state.flags += state.flagged[y][x] ? 1 : -1; btn.dataset.long = '0'; } else dig(x, y); renderMines(body); });
      btn.addEventListener('click', (ev) => { ev.preventDefault(); });
    });
    body.querySelector('[data-mines="mode"]').addEventListener('click', () => { state.mode = state.mode === 'flag' ? 'open' : 'flag'; renderMines(body); });
    body.querySelector('[data-mines="restart"]').addEventListener('click', () => { const s = minesState(); initMines(s); window.app.gamesArcade['mines'] = s; renderMines(body); });
    if (state.over || state.win) {
      const time = Date.now() - state.startAt;
      if (state.win && !state._saved) { state._saved = true; gamesRecordStat('mines', { plays: 1, bestTimeMs: time, bestScore: encodePoints('mines', time), lastResult: fmtTime(time) }); }
      body.querySelector('.arcadeStatus').innerHTML = state.win ? `<strong>Vyhrál jsi!</strong> Čas ${fmtTime(time)}.` : `<strong>Bum!</strong> Narazil jsi na minu.`;
    }
    setActiveState('mines', state);
  }

  // Memory -----------------------------------------------------------------
  const MEMORY_PAIRS = ['🍀','⚡','⭐','🌙','🔥','💎','🎯','🧠'];
  function memoryState() { return { deck: [], flipped: [], matched: new Set(), moves: 0, startAt: Date.now(), over: false, lock: false, bestTimeMs: 0 }; }
  function initMemory(state) { state.deck = shuffle(MEMORY_PAIRS.concat(MEMORY_PAIRS)); state.flipped = []; state.matched = new Set(); state.moves = 0; state.startAt = Date.now(); state.over = false; state.lock = false; }
  function renderMemory(body) {
    const state = getState('memory', () => { const s = memoryState(); initMemory(s); return s; });
    const cells = state.deck.map((sym, i) => {
      const flipped = state.flipped.includes(i) || state.matched.has(i);
      const matched = state.matched.has(i);
      return `<button type="button" class="arcadeMemoryCard${flipped ? ' isFlipped' : ''}${matched ? ' isMatched' : ''}" data-i="${i}">${flipped ? sym : '·'}</button>`;
    }).join('');
    body.innerHTML = `
      <div class="arcadeStage">
        <div class="arcadeHud">${gamesStatLine('Pohyby', state.moves)}${gamesStatLine('Páry', state.matched.size / 2)}${gamesStatLine('Čas', fmtTime(Date.now() - state.startAt))}</div>
        <div class="arcadeBar arcadePanel uPad10x12"><div class="arcadeStatus">Najdi dvojice co nejrychleji. Moderní pexeso v RaK stylu.</div></div>
        <div class="arcadeGridList grid-4 arcadePanel" id="memoryGrid" class="uPad8">${cells}</div>
        <div class="arcadeControls"><button type="button" class="gameControlBtn" data-memory="restart">Nová hra</button></div>
        ${gamesTop3Block('memory', 'ms', 5)}
      </div>`;
    const grid = body.querySelector('#memoryGrid');
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
            if (state.matched.size >= state.deck.length) {
              state.over = true;
              state.bestTimeMs = Date.now() - state.startAt;
              gamesRecordStat('memory', { plays: 1, bestTimeMs: state.bestTimeMs, bestScore: encodePoints('memory', state.bestTimeMs), bestMoves: state.moves, lastResult: `${state.moves} movů` });
              body.querySelector('.arcadeStatus').innerHTML = `<strong>Vyhráno!</strong> ${fmtTime(state.bestTimeMs)} · ${state.moves} pohybů.`;
            }
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

  function bomberState() { return { w: 11, h: 11, x: 1, y: 1, score: 0, bombs: [], fires: [], map: [], over: false, lastTs: 0, timer: 0, bound: false, saved: false }; }
  function initBomber(state) {
    state.map = Array.from({ length: state.h }, (_, y) => Array.from({ length: state.w }, (_, x) => {
      if (x === 0 || y === 0 || x === state.w - 1 || y === state.h - 1) return 'wall';
      if (x % 2 === 0 && y % 2 === 0) return 'wall';
      return Math.random() < 0.55 ? 'brick' : '';
    }));
    state.map[1][1] = ''; state.map[1][2] = ''; state.map[2][1] = '';
  }
  function renderBomber(body) {
    const state = getState('bomber', () => { const s = bomberState(); initBomber(s); return s; });
    const build = () => {
      const rows = [];
      for (let y = 0; y < state.h; y += 1) {
        const cells = [];
        for (let x = 0; x < state.w; x += 1) {
          let cls = 'arcadeBomberCell'; let text = '';
          if (state.map[y][x] === 'wall') cls += ' wall';
          if (state.map[y][x] === 'brick') cls += ' brick';
          if (state.x === x && state.y === y) { cls += ' player'; text = '🙂'; }
          if (state.bombs.some(b => b.x === x && b.y === y && !b.exploded)) { cls += ' bomb'; text = '💣'; }
          if (state.fires.some(f => f.x === x && f.y === y && f.life > 0)) { cls += ' fire'; text = '✨'; }
          cells.push(`<button type="button" class="${cls}" data-x="${x}" data-y="${y}">${text}</button>`);
        }
        rows.push(`<div class="arcadeTableRow">${cells.join('')}</div>`);
      }
      return rows.join('');
    };
    const updateHud = () => {
      const hud = body.querySelector('.arcadeHud');
      if (hud) hud.innerHTML = `${gamesStatLine('Skóre', state.score)}${gamesStatLine('Bomby', state.bombs.filter(b => !b.exploded).length)}${gamesStatLine('Stav', state.over ? 'Konec' : 'Běží')}`;
    };
    const draw = () => {
      body.innerHTML = `
        <div class="arcadeStage">
          <div class="arcadeHud">${gamesStatLine('Skóre', state.score)}${gamesStatLine('Bomby', state.bombs.filter(b => !b.exploded).length)}${gamesStatLine('Stav', state.over ? 'Konec' : 'Běží')}</div>
          <div class="arcadeBar arcadePanel uPad10x12"><div class="arcadeStatus">Pohybuj se šipkami nebo tlačítky, bombu položíš středem. Cíl je čistit bedny.</div></div>
          <div class="arcadeTable arcadePanel" id="bomberGrid" class="uPad8">${build()}</div>
          <div class="arcadeControls"><button type="button" class="gameControlBtn" data-bomber="up">▲</button><button type="button" class="gameControlBtn" data-bomber="left">◀</button><button type="button" class="gameControlBtn" data-bomber="bomb">💣</button><button type="button" class="gameControlBtn" data-bomber="right">▶</button><button type="button" class="gameControlBtn" data-bomber="down">▼</button><button type="button" class="gameControlBtn" data-bomber="restart">Nová hra</button></div>
          ${gamesTop3Block('bomber', 'bodů', 5)}
        </div>`;
      bindButtons();
      updateHud();
    };
    const move = (dx, dy) => {
      if (state.over) return;
      const nx = clamp(state.x + dx, 1, state.w - 2); const ny = clamp(state.y + dy, 1, state.h - 2);
      if (state.map[ny][nx] !== 'wall' && state.map[ny][nx] !== 'brick') { state.x = nx; state.y = ny; }
      draw();
    };
    const placeBomb = () => {
      if (state.over) return;
      if (state.bombs.some(b => b.x === state.x && b.y === state.y && !b.exploded)) return;
      state.bombs.push({ x: state.x, y: state.y, life: 1400, exploded: false });
      draw();
    };
    const explode = (bomb) => {
      if (bomb.exploded) return;
      bomb.exploded = true;
      const blast = [[0,0],[1,0],[-1,0],[0,1],[0,-1]];
      blast.forEach(([dx, dy]) => {
        const x = bomb.x + dx, y = bomb.y + dy;
        if (x < 0 || y < 0 || x >= state.w || y >= state.h) return;
        state.fires.push({ x, y, life: 350 });
        if (state.map[y][x] === 'brick') { state.map[y][x] = ''; state.score += 20; }
      });
      state.score += 5;
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
      body.addEventListener('click', (ev) => {
        const btn = ev.target && ev.target.closest ? ev.target.closest('[data-bomber]') : null;
        if (!btn) return;
        const a = btn.dataset.bomber;
        if (a === 'up') move(0, -1);
        else if (a === 'down') move(0, 1);
        else if (a === 'left') move(-1, 0);
        else if (a === 'right') move(1, 0);
        else if (a === 'bomb') placeBomb();
        else if (a === 'restart') {
          Object.assign(state, bomberState());
          initBomber(state);
          state.bound = true;
          draw();
        }
      });
    };
    const loop = () => {
      if (!rakGameShouldTick()) return;
      if (!state.over) {
        state.bombs.forEach((b) => { b.life -= 120; if (b.life <= 0 && !b.exploded) explode(b); });
        state.bombs = state.bombs.filter(b => !b.exploded || b.life > -220);
        state.fires.forEach(f => { f.life -= 120; });
        state.fires = state.fires.filter(f => f.life > 0);
        if (!state.map.some(row => row.includes('brick'))) state.over = true;
      }
      if (state.over && !state.saved) {
        state.saved = true;
        gamesRecordStat('bomber', { plays: 1, bestScore: state.score, lastResult: String(state.score) });
      }
      draw();
    };
    draw();
    if (!state.timer) state.timer = rakGameSetInterval(loop, rakGameIsLadaMode() ? 180 : 140);
    addCleanup(() => {
      clearInterval(state.timer);
      state.timer = 0;
      document.removeEventListener('keydown', keyHandler);
      if (!state.saved) gamesRecordStat('bomber', { plays: 1, bestScore: state.score, lastResult: String(state.score) });
    });
    setActiveState('bomber', state);
  }

  // Daily challenge --------------------------------------------------------
  function dailySeed() {
    const d = new Date(); d.setHours(0,0,0,0);
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }
  function dailyChallengeId() { return DAILY_MODES[dailySeed() % DAILY_MODES.length]; }
  function renderDaily(body) {
    const mode = dailyChallengeId();
    const meta = gameMeta('daily');
    body.innerHTML = `<div class="arcadeStage"><div class="arcadeHud">${gamesStatLine('Dnešní', mode === 'aim' ? 'Aim' : mode === 'reaction' ? 'Reaction' : 'Memory')}${gamesStatLine('Datum', new Date().toLocaleDateString('cs-CZ'))}${gamesStatLine('Rekord', '—')}</div><div class="arcadeBar arcadePanel uPad12"> <div class="arcadeStatus"><strong>Denní challenge:</strong> ${mode === 'aim' ? '20 cílů za 30 sekund' : mode === 'reaction' ? '5 rychlých reakcí' : 'najdi všech 8 dvojic co nejrychleji'}. Podmínky jsou stejné pro všechny.</div></div><div class="arcadeControls"><button type="button" class="gameControlBtn" id="dailyStartBtn">Spustit challenge</button><button type="button" class="gameControlBtn" id="dailyResetBtn">Obnovit</button></div>${gamesTop3Block('daily', 'bodů', 5)}</div>`;
    let subState = null;
    const start = () => {
      if (mode === 'aim') { subState = { challenge: true, duration: 30000 }; renderAim(body, subState); }
      else if (mode === 'reaction') { subState = {}; renderReaction(body); }
      else { subState = {}; renderMemory(body); }
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
