from pathlib import Path
import re
base = Path('/mnt/data/work405')

# Fix version leftovers everywhere
for fname in ['index.html', 'CHANGELOG.md', 'core.js', 'app.js', 'sw.js']:
    p = base / fname
    s = p.read_text(encoding='utf-8')
    s = s.replace('404', '405')
    s = s.replace('v1.1-405', 'v1.1-405')
    p.write_text(s, encoding='utf-8')

# dashboard icons: make them more compact/clean
p = base / 'dashboard.js'
s = p.read_text(encoding='utf-8')
s = re.sub(r'''const plateIcon = iconSvg\(`\n<svg class="dashboardIconSvg" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www\.w3\.org/2000/svg"><circle cx="12" cy="12" r="7\.4" stroke="currentColor" stroke-width="1\.8"/><path d="M8\.5 9\.2h7M8\.5 12h6M8\.5 14\.8h4\.6" stroke="currentColor" stroke-width="1\.8" stroke-linecap="round"/></svg>\n`\);''',
'''const plateIcon = iconSvg(`
<svg class="dashboardIconSvg" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="7.2" stroke="currentColor" stroke-width="1.8"/><path d="M9 9h6M9 12h5M9 15h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
`);''', s)
s = re.sub(r'''const calendarIcon = iconSvg\(`\n<svg class="dashboardIconSvg" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www\.w3\.org/2000/svg"><rect x="4\.2" y="5\.2" width="15\.6" height="14\.6" rx="3\.2" stroke="currentColor" stroke-width="1\.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 3\.8v3\.2M17 3\.8v3\.2M4\.8 9h14\.4" stroke="currentColor" stroke-width="1\.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12\.5h3\.4M8 15\.8h6\.1" stroke="currentColor" stroke-width="1\.8" stroke-linecap="round"/></svg>\n`\);''',
'''const calendarIcon = iconSvg(`
<svg class="dashboardIconSvg" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="4.6" y="5.2" width="14.8" height="14" rx="3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.1 4v2.8M16.9 4v2.8M4.9 8.9h14.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12.2h4M8 15.2h5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
`);''', s)
p.write_text(s, encoding='utf-8')

# Replace the whole games profile/load/sync block more safely.
p = base / 'ui.js'
s = p.read_text(encoding='utf-8')
start = s.index('const GAMES_PROFILE_KEY = APP_KEY + \'')
end = s.index('function gamesStatLine(label, value) {')
new_block = r"""const GAMES_PROFILE_KEY = APP_KEY + ':games_profile_v1';
const GAMES_PROFILE_RESET_VERSION = 405;
const GAMES_ACCOUNT_BLOCKLIST = new Set(['4157']);
const GAMES_ACCOUNT_LIST = [];

function gamesEmptyStats() {
  return {
    ttt: { plays: 0, wins: 0, losses: 0, draws: 0, bestMoves: null, bestTimeMs: null, lastPlayedAt: 0 },
    g2048: { plays: 0, bestScore: 0, bestTile: 0, lastPlayedAt: 0 },
    snake: { plays: 0, bestScore: 0, bestLength: 0, lastPlayedAt: 0 },
    flap: { plays: 0, bestScore: 0, bestPipes: 0, lastPlayedAt: 0 }
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
    updatedAt: 0
  };
}

function gamesDefaultProfile() {
  const accounts = {};
  GAMES_ACCOUNT_LIST.forEach(acc => {
    const id = String(acc && acc.id || '').trim();
    if (!id || GAMES_ACCOUNT_BLOCKLIST.has(id)) return;
    accounts[id] = gamesMakeAccountEntry(id, acc.name);
  });
  return { activeAccountId: '', accounts, profileVersion: GAMES_PROFILE_RESET_VERSION };
}

function gamesNormalizeStoredAccount(account, fallbackName) {
  const id = String(account && account.id || '').trim();
  const name = String(account && account.name || fallbackName || id).trim() || id;
  const stats = gamesEmptyStats();
  const incoming = account && account.stats && typeof account.stats === 'object' ? account.stats : {};
  stats.ttt.plays = Number(incoming.ttt && incoming.ttt.plays || 0) || 0;
  stats.ttt.wins = Number(incoming.ttt && incoming.ttt.wins || 0) || 0;
  stats.ttt.losses = Number(incoming.ttt && incoming.ttt.losses || 0) || 0;
  stats.ttt.draws = Number(incoming.ttt && incoming.ttt.draws || 0) || 0;
  stats.ttt.bestMoves = incoming.ttt && typeof incoming.ttt.bestMoves !== 'undefined' ? incoming.ttt.bestMoves : null;
  stats.ttt.bestTimeMs = incoming.ttt && typeof incoming.ttt.bestTimeMs !== 'undefined' ? incoming.ttt.bestTimeMs : null;
  stats.ttt.lastPlayedAt = Number(incoming.ttt && incoming.ttt.lastPlayedAt || 0) || 0;
  stats.g2048.plays = Number(incoming.g2048 && incoming.g2048.plays || 0) || 0;
  stats.g2048.bestScore = Number(incoming.g2048 && incoming.g2048.bestScore || 0) || 0;
  stats.g2048.bestTile = Number(incoming.g2048 && incoming.g2048.bestTile || 0) || 0;
  stats.g2048.lastPlayedAt = Number(incoming.g2048 && incoming.g2048.lastPlayedAt || 0) || 0;
  stats.snake.plays = Number(incoming.snake && incoming.snake.plays || 0) || 0;
  stats.snake.bestScore = Number(incoming.snake && incoming.snake.bestScore || 0) || 0;
  stats.snake.bestLength = Number(incoming.snake && incoming.snake.bestLength || 0) || 0;
  stats.snake.lastPlayedAt = Number(incoming.snake && incoming.snake.lastPlayedAt || 0) || 0;
  stats.flap.plays = Number(incoming.flap && incoming.flap.plays || 0) || 0;
  stats.flap.bestScore = Number(incoming.flap && incoming.flap.bestScore || 0) || 0;
  stats.flap.bestPipes = Number(incoming.flap && incoming.flap.bestPipes || 0) || 0;
  stats.flap.lastPlayedAt = Number(incoming.flap && incoming.flap.lastPlayedAt || 0) || 0;
  return {
    id,
    name,
    stats,
    achievements: Array.isArray(account && account.achievements) ? account.achievements.slice(0, 20) : [],
    updatedAt: Number(account && account.updatedAt || 0) || 0
  };
}

function gamesLoadProfile() {
  try {
    const raw = localStorage.getItem(GAMES_PROFILE_KEY);
    if (!raw) return gamesDefaultProfile();
    const parsed = JSON.parse(raw);
    const base = gamesDefaultProfile();
    const srcAccounts = parsed.accounts && typeof parsed.accounts === 'object' ? parsed.accounts : {};
    const storedVersion = Number(parsed.profileVersion || parsed.schemaVersion || parsed.dataVersion || 0) || 0;
    const shouldResetStats = storedVersion < GAMES_PROFILE_RESET_VERSION;
    base.activeAccountId = String(parsed.activeAccountId || '').trim();

    const mergeAccount = (id, incoming, fallbackName) => {
      if (!id || GAMES_ACCOUNT_BLOCKLIST.has(id)) return;
      const name = String((incoming && incoming.name) || fallbackName || id).trim() || id;
      base.accounts[id] = shouldResetStats ? gamesMakeAccountEntry(id, name) : gamesNormalizeStoredAccount({ id, name, stats: incoming && incoming.stats, achievements: incoming && incoming.achievements, updatedAt: incoming && incoming.updatedAt }, name);
    };

    GAMES_ACCOUNT_LIST.forEach(acc => {
      const id = String(acc && acc.id || '').trim();
      if (!id || GAMES_ACCOUNT_BLOCKLIST.has(id)) return;
      mergeAccount(id, srcAccounts[id] || {}, acc && acc.name);
    });

    Object.keys(srcAccounts).forEach((id) => {
      const accountId = String(id || '').trim();
      if (!accountId || base.accounts[accountId] || GAMES_ACCOUNT_BLOCKLIST.has(accountId)) return;
      mergeAccount(accountId, srcAccounts[accountId] || {}, srcAccounts[accountId] && srcAccounts[accountId].name);
    });

    if (!base.activeAccountId || !base.accounts[base.activeAccountId] || GAMES_ACCOUNT_BLOCKLIST.has(base.activeAccountId)) {
      base.activeAccountId = '';
    }
    base.profileVersion = GAMES_PROFILE_RESET_VERSION;
    if (shouldResetStats) gamesSaveProfile(base);
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

function gamesParseRemoteTimestamp(value) {
  const ts = Date.parse(String(value || ''));
  return Number.isFinite(ts) ? ts : 0;
}

async function gamesSyncProfileFromRemote(force = false) {
  const bridge = window.RotationSupabaseBridge;
  if (!bridge || typeof bridge.loadGameAccounts !== 'function' || typeof bridge.loadGameStats !== 'function') return null;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;

  try {
    const profile = gamesGetProfile();
    const [remoteAccounts] = await Promise.all([
      bridge.loadGameAccounts().catch(() => [])
    ]);

    let changed = false;
    (Array.isArray(remoteAccounts) ? remoteAccounts : []).forEach((row) => {
      const accountId = String(row && row.account_number ? row.account_number : '').trim();
      if (!accountId || GAMES_ACCOUNT_BLOCKLIST.has(accountId)) return;
      const remoteName = String(
        row && (row.full_name || row.player_name || row.name || row.account_name || row.nickname || row.username || row.account_number)
          ? (row.full_name || row.player_name || row.name || row.account_name || row.nickname || row.username || row.account_number)
          : accountId
      ).trim() || accountId;
      if (!profile.accounts[accountId]) {
        profile.accounts[accountId] = gamesMakeAccountEntry(accountId, remoteName);
        changed = true;
      } else if (remoteName && remoteName !== profile.accounts[accountId].name) {
        profile.accounts[accountId].name = remoteName;
        changed = true;
      }
    });

    Object.keys(profile.accounts || {}).forEach((id) => {
      const accountId = String(id || '').trim();
      if (!accountId || GAMES_ACCOUNT_BLOCKLIST.has(accountId) || !profile.accounts[accountId]) return;
      const acc = profile.accounts[accountId];
      if (!acc.stats || typeof acc.stats !== 'object') acc.stats = gamesEmptyStats();
      if (typeof acc.stats.ttt !== 'object') acc.stats.ttt = gamesEmptyStats().ttt;
      if (typeof acc.stats.g2048 !== 'object') acc.stats.g2048 = gamesEmptyStats().g2048;
      if (typeof acc.stats.snake !== 'object') acc.stats.snake = gamesEmptyStats().snake;
      if (typeof acc.stats.flap !== 'object') acc.stats.flap = gamesEmptyStats().flap;
      if (!Array.isArray(acc.achievements)) acc.achievements = [];
    });

    if (changed) {
      profile.profileVersion = GAMES_PROFILE_RESET_VERSION;
      gamesSaveProfile(profile);
      app.gamesProfile = profile;
      gamesRenderStats();
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
    cardEl.style.display = '';
  }
  nameEl.textContent = next ? next.name : 'Bez přihlášení';
  hintEl.textContent = next
    ? 'Přihlášeno. Můžeš hned zadat jiné číslo a účet přepsat.'
    : 'Bez účtu můžeš hrát dál. Statistiky se ukládají jen po přihlášení číslem.';
  entryRow.style.display = '';
  hintEl.style.display = '';
  hintEl.hidden = false;
  currentEl.style.display = 'none';
  currentEl.hidden = true;
  currentEl.textContent = '';
  if (next) {
    inputEl.value = '';
    inputEl.placeholder = 'Zadej poslední 4 číslice os.č.';
  } else {
    inputEl.placeholder = 'Zadej poslední 4 číslice os.č.';
  }
  clearBtn.textContent = next ? 'Odhlásit' : 'Bez účtu';
  clearBtn.style.minWidth = next ? '46px' : '';
  clearBtn.style.paddingInline = next ? '8px' : '';
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
  if (textEl) textEl.textContent = '';
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
  if (!profile.accounts[id]) {
    profile.accounts[id] = gamesMakeAccountEntry(id, id);
  }
  profile.activeAccountId = id;
  profile.profileVersion = GAMES_PROFILE_RESET_VERSION;
  gamesSaveProfile(profile);
  app.gamesProfile = profile;
  const active = profile.accounts[profile.activeAccountId] || null;
  gamesApplyActiveAccountUI(active);
  gamesRenderStats();
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
  gamesApplyActiveAccountUI(null);
  gamesRenderStats();
  renderGamesHub();
  if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
}
"""
s = s[:start] + new_block + s[end:]

# Ensure profiles/achievements/stats visibility is synced on hub render
s = s.replace("""function renderGamesHub() {
  gamesGetProfile();
  gamesRenderAccountChips();
  gamesRenderStats();
  if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
  void gamesSyncProfileFromRemote().then(() => { gamesRenderStats(); if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections(); });
  void gamesRefreshRemoteLeaderboards();
""", """function renderGamesHub() {
  gamesGetProfile();
  gamesRenderAccountChips();
  gamesRenderStats();
  if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
  void gamesSyncProfileFromRemote().then(() => { gamesRenderStats(); if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections(); });
  void gamesRefreshRemoteLeaderboards();
""")

# render account chips should also call sync on login/clear
s = s.replace("""      gamesRenderStats();
      if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
      requestAnimationFrame(() => {
        gamesRenderAccountChips();
        gamesRenderStats();
        if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
      });
""", """      gamesRenderStats();
      if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
      requestAnimationFrame(() => {
        gamesRenderAccountChips();
        gamesRenderStats();
        if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
      });
""")

# Stats folder / profile / achievements unified style
for fname in ['index.html', 'styles-responsive.css']:
    p = base / fname
    t = p.read_text(encoding='utf-8')
    t = t.replace('/* v1.1 (405) polish: dashboard icons simplified, games section styling, bottom bar fixed, version 1.1 update */', '/* v1.1 (405) polish: dashboard icons simplified, games section styling, bottom bar fixed, version 1.1 update */')
    t = re.sub(r'''#games \.gamesStatsFolder\{margin-top:[^\n]+\n#games \.gamesStatsFolder > summary\{padding:[^\n]+\n#games \.gamesStatsFolder \[open\] \.gamesStatsGrid\{padding-top:[^\n]+\n#games \.gamesStatsFolder\{margin-bottom:[^\n]+\n''', '', t)
    t = t.replace('#games .gamesStatsFolder{margin-top:8px !important;}#games .gamesStatsFolder[open] .gamesStatsGrid{padding-top:4px !important;}\n#games .gamesStatsFolder{margin-bottom:8px !important;}\n', '')
    # add unified selectors just before the stats section if not present
    marker = '#games .gamesGrid{display:grid !important;grid-template-columns:repeat(2, minmax(0, 1fr)) !important;gap:10px !important;}\n'
    if '#games .gamesProfilesFolder' not in t:
        t = t.replace(marker, marker + '#games .gamesProfilesFolder,#games .gamesAchievementsFolder,#games .gamesStatsFolder{\n  margin-top:14px !important;\n  border-radius:18px !important;\n  border:1px solid rgba(124,255,124,.14) !important;\n  background:rgba(11,15,13,.58) !important;\n  overflow:hidden !important;\n}\n#games .gamesProfilesFolder > summary,#games .gamesAchievementsFolder > summary,#games .gamesStatsFolder > summary{\n  list-style:none !important;\n  cursor:pointer !important;\n  padding:14px 14px !important;\n  font-weight:700 !important;\n  color:#e8ffe8 !important;\n}\n#games .gamesProfilesFolder > summary::-webkit-details-marker,#games .gamesAchievementsFolder > summary::-webkit-details-marker,#games .gamesStatsFolder > summary::-webkit-details-marker{display:none !important;}\n#games .gamesProfilesFolder[open] .gamesProfilesGrid,#games .gamesAchievementsFolder[open] .gamesAchievementsGrid,#games .gamesStatsFolder[open] .gamesStatsGrid{padding-top:4px !important; padding-bottom:18px !important;}\n')
    # mobile styles
    t = t.replace('#games .gamesStatsFolder{\n    margin-top:6px !important;\n    margin-bottom:6px !important;\n    border-radius:18px !important;\n  }\n  #games .gamesStatsFolder > summary{\n    padding:8px 10px !important;\n  }\n  #games .gamesStatsFolder[open] .gamesStatsGrid{\n    padding-top:4px !important;\n    padding-bottom:18px !important;\n  }\n  #games .gamesStatsGrid{\n    padding:0 8px 8px !important;\n    gap:6px !important;\n  }\n', '#games .gamesProfilesFolder,#games .gamesAchievementsFolder,#games .gamesStatsFolder{\n    margin-top:6px !important;\n    margin-bottom:6px !important;\n    border-radius:18px !important;\n  }\n  #games .gamesProfilesFolder > summary,#games .gamesAchievementsFolder > summary,#games .gamesStatsFolder > summary{\n    padding:8px 10px !important;\n  }\n  #games .gamesProfilesFolder[open] .gamesProfilesGrid,#games .gamesAchievementsFolder[open] .gamesAchievementsGrid,#games .gamesStatsFolder[open] .gamesStatsGrid{\n    padding-top:4px !important;\n    padding-bottom:18px !important;\n  }\n  #games .gamesStatsGrid,#games .gamesProfilesGrid,#games .gamesAchievementsGrid{\n    padding:0 8px 8px !important;\n    gap:6px !important;\n  }\n')
    p.write_text(t, encoding='utf-8')

# Ensure changed version comment in index is correct and no 404 remains in build files (except UI color code)
for fname in ['index.html', 'CHANGELOG.md', 'core.js', 'app.js', 'sw.js', 'dashboard.js', 'ui.js']:
    p = base / fname
    t = p.read_text(encoding='utf-8')
    p.write_text(t, encoding='utf-8')
