from pathlib import Path
import re
base = Path('/mnt/data/work405')

# Version bump everywhere
version_repls = [
    ('v.1.1 (404)', 'v.1.1 (405)'),
    ('v1.1-404', 'v1.1-405'),
    ('v.1.1 (404) polish', 'v.1.1 (405) polish'),
    ('## v.1.1 (404)', '## v.1.1 (405)'),
]
for fname in ['core.js', 'app.js', 'sw.js', 'CHANGELOG.md', 'index.html']:
    p = base / fname
    text = p.read_text(encoding='utf-8')
    for old, new in version_repls:
        text = text.replace(old, new)
    p.write_text(text, encoding='utf-8')

# dashboard icons: simplify calendar and plate to be closer to the old clean style
p = base / 'dashboard.js'
text = p.read_text(encoding='utf-8')
text = text.replace(
'''  const plateIcon = iconSvg(`
<svg class="dashboardIconSvg" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="7.4" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 9.2h7M8.5 12h6M8.5 14.8h4.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
`);
''',
'''  const plateIcon = iconSvg(`
<svg class="dashboardIconSvg" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="7.2" stroke="currentColor" stroke-width="1.8"/><path d="M9 8.9h6M9 12h5.2M9 15.1h3.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
`);
''')
text = text.replace(
'''  const calendarIcon = iconSvg(`
<svg class="dashboardIconSvg" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="4.2" y="5.2" width="15.6" height="14.6" rx="3.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 3.8v3.2M17 3.8v3.2M4.8 9h14.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12.5h3.4M8 15.8h6.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
`);
''',
'''  const calendarIcon = iconSvg(`
<svg class="dashboardIconSvg" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="4.5" y="5.2" width="15" height="14.3" rx="3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.2 3.9v3M16.8 3.9v3M4.9 9h14.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12.3h4M8 15.5h5.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
`);
''')
p.write_text(text, encoding='utf-8')

# ui.js: add zero stats helpers, profile versioning, block 4157, and sync locked sections on login/logout.
p = base / 'ui.js'
text = p.read_text(encoding='utf-8')
text = text.replace('const GAMES_PROFILE_KEY = APP_KEY + \'\:games_profile_v1\';\nconst GAMES_ACCOUNT_LIST = [];\n\nfunction gamesMakeAccountEntry(accountId, name) {\n  const id = String(accountId || \'\').trim();\n  const label = String(name || id || \'\').trim() || id;\n  return {\n    id,\n    name: label,\n    stats: {\n      ttt: { plays: 0, wins: 0, losses: 0, draws: 0, bestMoves: null, bestTimeMs: null, lastPlayedAt: 0 },\n      g2048: { plays: 0, bestScore: 0, bestTile: 0, lastPlayedAt: 0 },\n      snake: { plays: 0, bestScore: 0, bestLength: 0, lastPlayedAt: 0 },\n      flap: { plays: 0, bestScore: 0, bestPipes: 0, lastPlayedAt: 0 }\n    },\n    achievements: [],\n    updatedAt: 0\n  };\n}\n\nfunction gamesDefaultProfile() {\n  const accounts = {};\n  GAMES_ACCOUNT_LIST.forEach(acc => {\n    accounts[acc.id] = gamesMakeAccountEntry(acc.id, acc.name);\n  });\n  return { activeAccountId: \'\', accounts };\n}\n\nfunction gamesLoadProfile() {\n  try {\n    const raw = localStorage.getItem(GAMES_PROFILE_KEY);\n    if (!raw) return gamesDefaultProfile();\n    const parsed = JSON.parse(raw);\n    const base = gamesDefaultProfile();\n    base.activeAccountId = String(parsed.activeAccountId || \'\').trim();\n    const srcAccounts = parsed.accounts && typeof parsed.accounts === \'object\' ? parsed.accounts : {};\n    GAMES_ACCOUNT_LIST.forEach(acc => {\n      const incoming = srcAccounts[acc.id] || {};\n      base.accounts[acc.id] = {\n        id: acc.id,\n        name: acc.name,\n        stats: {\n          ttt: Object.assign({ plays: 0, wins: 0, losses: 0, draws: 0, bestMoves: null, bestTimeMs: null, lastPlayedAt: 0 }, incoming.stats && incoming.stats.ttt ? incoming.stats.ttt : {}),\n          g2048: Object.assign({ plays: 0, bestScore: 0, bestTile: 0, lastPlayedAt: 0 }, incoming.stats && incoming.stats.g2048 ? incoming.stats.g2048 : {}),\n          snake: Object.assign({ plays: 0, bestScore: 0, bestLength: 0, lastPlayedAt: 0 }, incoming.stats && incoming.stats.snake ? incoming.stats.snake : {}),\n          flap: Object.assign({ plays: 0, bestScore: 0, bestPipes: 0, lastPlayedAt: 0 }, incoming.stats && incoming.stats.flap ? incoming.stats.flap : {})\n        },\n        achievements: Array.isArray(incoming.achievements) ? incoming.achievements.slice(0, 20) : [],\n        updatedAt: Number(incoming.updatedAt || 0) || 0\n      };\n    });\n    Object.keys(srcAccounts).forEach((id) => {\n      const accountId = String(id || '').trim();\n      if (!accountId || base.accounts[accountId]) return;\n      const incoming = srcAccounts[accountId] || {};\n      base.accounts[accountId] = {\n        id: accountId,\n        name: String(incoming.name || accountId).trim() || accountId,\n        stats: {\n          ttt: Object.assign({ plays: 0, wins: 0, losses: 0, draws: 0, bestMoves: null, bestTimeMs: null, lastPlayedAt: 0 }, incoming.stats && incoming.stats.ttt ? incoming.stats.ttt : {}),\n          g2048: Object.assign({ plays: 0, bestScore: 0, bestTile: 0, lastPlayedAt: 0 }, incoming.stats && incoming.stats.g2048 ? incoming.stats.g2048 : {}),\n          snake: Object.assign({ plays: 0, bestScore: 0, bestLength: 0, lastPlayedAt: 0 }, incoming.stats && incoming.stats.snake ? incoming.stats.snake : {}),\n          flap: Object.assign({ plays: 0, bestScore: 0, bestPipes: 0, lastPlayedAt: 0 }, incoming.stats && incoming.stats.flap ? incoming.stats.flap : {})\n        },\n        achievements: Array.isArray(incoming.achievements) ? incoming.achievements.slice(0, 20) : [],\n        updatedAt: Number(incoming.updatedAt || 0) || 0\n      };\n    });\n    if (!base.activeAccountId || !base.accounts[base.activeAccountId]) {\n      base.activeAccountId = '';\n    }\n    return base;\n  } catch (err) {\n    console.warn(\'gamesLoadProfile failed\', err);\n    return gamesDefaultProfile();\n  }\n}\n',
'''const GAMES_PROFILE_KEY = APP_KEY + ':games_profile_v1';
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
    if (!acc || GAMES_ACCOUNT_BLOCKLIST.has(String(acc.id || '').trim())) return;
    accounts[acc.id] = gamesMakeAccountEntry(acc.id, acc.name);
  });
  return { activeAccountId: '', accounts, profileVersion: GAMES_PROFILE_RESET_VERSION };
}

function gamesResetAccountStats(account, fallbackName) {
  const id = String(account && account.id || '').trim();
  const name = String(account && account.name || fallbackName || id).trim() || id;
  return {
    id,
    name,
    stats: gamesEmptyStats(),
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

    GAMES_ACCOUNT_LIST.forEach(acc => {
      const id = String(acc && acc.id || '').trim();
      if (!id || GAMES_ACCOUNT_BLOCKLIST.has(id)) return;
      const incoming = srcAccounts[id] || {};
      const name = String(incoming.name || acc.name || id).trim() || id;
      base.accounts[id] = shouldResetStats
        ? gamesMakeAccountEntry(id, name)
        : {
            id,
            name,
            stats: Object.assign(gamesEmptyStats(), incoming.stats || {}),
            achievements: Array.isArray(incoming.achievements) ? incoming.achievements.slice(0, 20) : [],
            updatedAt: Number(incoming.updatedAt || 0) || 0
          };
    });

    Object.keys(srcAccounts).forEach((id) => {
      const accountId = String(id || '').trim();
      if (!accountId || base.accounts[accountId] || GAMES_ACCOUNT_BLOCKLIST.has(accountId)) return;
      const incoming = srcAccounts[accountId] || {};
      base.accounts[accountId] = shouldResetStats
        ? gamesMakeAccountEntry(accountId, String(incoming.name || accountId).trim() || accountId)
        : {
            id: accountId,
            name: String(incoming.name || accountId).trim() || accountId,
            stats: Object.assign(gamesEmptyStats(), incoming.stats || {}),
            achievements: Array.isArray(incoming.achievements) ? incoming.achievements.slice(0, 20) : [],
            updatedAt: Number(incoming.updatedAt || 0) || 0
          };
    });

    if (!base.activeAccountId || !base.accounts[base.activeAccountId] || GAMES_ACCOUNT_BLOCKLIST.has(base.activeAccountId)) {
      base.activeAccountId = '';
    }
    if (shouldResetStats) {
      base.profileVersion = GAMES_PROFILE_RESET_VERSION;
      gamesSaveProfile(base);
    }
    return base;
  } catch (err) {
    console.warn('gamesLoadProfile failed', err);
    return gamesDefaultProfile();
  }
}
''')

# Inject sync helper and blocklist handling around account visibility helpers.
text = text.replace(
'''function gamesApplyActiveAccountUI(account) {
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
}
''',
'''function gamesApplyActiveAccountUI(account) {
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
''')

text = text.replace(
'''function gamesRenderActiveAccountBar(account) {
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
}
''',
'''function gamesRenderActiveAccountBar(account) {
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
''')

text = text.replace(
'''function gamesSetActiveAccount(accountId) {
  const profile = gamesGetProfile();
  const id = String(accountId || '').trim();
  if (!id) return false;
  if (!profile.accounts[id]) {
    profile.accounts[id] = gamesMakeAccountEntry(id, id);
  }
  profile.activeAccountId = id;
  gamesSaveProfile(profile);
  app.gamesProfile = profile;
  const active = profile.accounts[profile.activeAccountId] || null;
  gamesApplyActiveAccountUI(active);
  gamesRenderStats();
  renderGamesHub();
  return true;
}
''',
'''function gamesSetActiveAccount(accountId) {
  const profile = gamesGetProfile();
  const id = String(accountId || '').trim();
  if (!id || GAMES_ACCOUNT_BLOCKLIST.has(id)) return false;
  if (!profile.accounts[id]) {
    profile.accounts[id] = gamesMakeAccountEntry(id, id);
  }
  profile.activeAccountId = id;
  if (profile.profileVersion !== GAMES_PROFILE_RESET_VERSION) profile.profileVersion = GAMES_PROFILE_RESET_VERSION;
  gamesSaveProfile(profile);
  app.gamesProfile = profile;
  const active = profile.accounts[profile.activeAccountId] || null;
  gamesApplyActiveAccountUI(active);
  gamesRenderStats();
  renderGamesHub();
  if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
  return true;
}
''')

text = text.replace(
'''function gamesClearActiveAccount() {
  const profile = gamesGetProfile();
  profile.activeAccountId = '';
  gamesSaveProfile(profile);
  app.gamesProfile = profile;
  gamesApplyActiveAccountUI(null);
  gamesRenderStats();
  renderGamesHub();
}
''',
'''function gamesClearActiveAccount() {
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
''')

text = text.replace(
'''function gamesAccountById(accountId) {
  const id = String(accountId || '').trim();
  if (!id) return null;
  const profile = gamesGetProfile();
  return (profile.accounts && profile.accounts[id]) || GAMES_ACCOUNT_LIST.find(acc => acc.id === id) || null;
}
''',
'''function gamesAccountById(accountId) {
  const id = String(accountId || '').trim();
  if (!id || GAMES_ACCOUNT_BLOCKLIST.has(id)) return null;
  const profile = gamesGetProfile();
  return (profile.accounts && profile.accounts[id]) || GAMES_ACCOUNT_LIST.find(acc => acc.id === id) || null;
}
''')

text = text.replace(
'''function gamesSyncProfileFromRemote(force = false) {
  try {
    const bridge = window.RotationSupabaseBridge;
    if (!bridge || typeof bridge.loadGameAccounts !== 'function' || typeof bridge.loadGameStats !== 'function') return null;
''',
'''function gamesSyncProfileFromRemote(force = false) {
  try {
    const bridge = window.RotationSupabaseBridge;
    if (!bridge || typeof bridge.loadGameAccounts !== 'function' || typeof bridge.loadGameStats !== 'function') return null;
''')
# Filter out blocklisted accounts and stop importing remote stats into local profiles.
text = text.replace(
'''    (Array.isArray(remoteAccounts) ? remoteAccounts : []).forEach((row) => {
      const accountId = String(row && row.account_number ? row.account_number : '').trim();
      if (!accountId) return;
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
    Object.values(profile.accounts || {}).forEach((acc) => {
      if (!acc) return;
      const remoteName = remoteNameMap.get(String(acc.id || '').trim());
      if (remoteName && remoteName !== acc.name) {
        acc.name = remoteName;
        changed = true;
      }
      const localUpdated = Number(acc.updatedAt || 0) || 0;

      const sync = (key, apply) => {
        const remote = remoteMap[key].get(String(acc.id || '').trim());
        if (!remote) return;
        if (!force && remote.updatedAt < localUpdated) return;
        const next = apply(remote.row, remote.value);
        if (!next) return;
        acc.stats[key] = Object.assign({}, acc.stats[key], next);
        acc.updatedAt = Math.max(Number(acc.updatedAt || 0) || 0, remote.updatedAt || Date.now());
        changed = true;
      };

      sync('ttt', (row, value) => ({
        plays: value.plays,
        wins: value.wins,
        losses: value.losses,
        draws: value.draws,
        lastPlayedAt: gamesParseRemoteTimestamp(row.last_played_at || row.updated_at || row.created_at) || acc.updatedAt || Date.now()
      }));
      sync('g2048', (row, value) => ({
        plays: value.plays,
        bestScore: Math.max(Number(acc.stats && acc.stats.g2048 && acc.stats.g2048.bestScore || 0) || 0, value.bestScore || 0),
        lastPlayedAt: gamesParseRemoteTimestamp(row.last_played_at || row.updated_at || row.created_at) || acc.updatedAt || Date.now()
      }));
      sync('snake', (row, value) => ({
        plays: value.plays,
        bestScore: Math.max(Number(acc.stats && acc.stats.snake && acc.stats.snake.bestScore || 0) || 0, value.bestScore || 0),
        lastPlayedAt: gamesParseRemoteTimestamp(row.last_played_at || row.updated_at || row.created_at) || acc.updatedAt || Date.now()
      }));
      sync('flap', (row, value) => ({
        plays: value.plays,
        bestScore: Math.max(Number(acc.stats && acc.stats.flap && acc.stats.flap.bestScore || 0) || 0, value.bestScore || 0),
        lastPlayedAt: gamesParseRemoteTimestamp(row.last_played_at || row.updated_at || row.created_at) || acc.updatedAt || Date.now()
      }));
    });
''',
'''    (Array.isArray(remoteAccounts) ? remoteAccounts : []).forEach((row) => {
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
      if (profile.accounts[accountId] && profile.accounts[accountId].profileVersion !== GAMES_PROFILE_RESET_VERSION) {
        profile.accounts[accountId].profileVersion = GAMES_PROFILE_RESET_VERSION;
      }
    });
    Object.values(profile.accounts || {}).forEach((acc) => {
      if (!acc || GAMES_ACCOUNT_BLOCKLIST.has(String(acc.id || '').trim())) return;
      const remoteName = remoteNameMap.get(String(acc.id || '').trim());
      if (remoteName && remoteName !== acc.name) {
        acc.name = remoteName;
        changed = true;
      }
      if (!acc.stats || typeof acc.stats !== 'object') acc.stats = gamesEmptyStats();
      else acc.stats = gamesEmptyStats();
      if (!Array.isArray(acc.achievements)) acc.achievements = [];
      acc.achievements = acc.achievements.slice(0, 20);
      if (Number(acc.updatedAt || 0) === 0) acc.updatedAt = Date.now();
    });
''')

text = text.replace(
'''    if (changed) {
      gamesSaveProfile(profile);
      app.gamesProfile = profile;
      gamesRenderStats();
    }
''',
'''    if (changed) {
      profile.profileVersion = GAMES_PROFILE_RESET_VERSION;
      gamesSaveProfile(profile);
      app.gamesProfile = profile;
      gamesRenderStats();
      if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
    }
''')

# Ensure stats/locked sections sync after render. Handle not found returns too.
text = text.replace(
'''function renderGamesHub() {
  gamesGetProfile();
  gamesRenderAccountChips();
  gamesRenderStats();
  void gamesSyncProfileFromRemote().then(() => { gamesRenderStats(); });
''',
'''function renderGamesHub() {
  gamesGetProfile();
  gamesRenderAccountChips();
  gamesRenderStats();
  if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
  void gamesSyncProfileFromRemote().then(() => { gamesRenderStats(); if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections(); });
''')

text = text.replace(
'''    const submit = async () => {
''',
'''    const submit = async () => {
''')
text = text.replace(
'''      if (!found) {
        hintEl.textContent = 'Takový uživatel na serveru neexistuje.';
        inputEl.focus();
        inputEl.select();
        return;
      }
''',
'''      if (!found) {
        hintEl.textContent = 'Takový uživatel na serveru neexistuje.';
        inputEl.focus();
        inputEl.select();
        return;
      }
''')
text = text.replace(
'''      gamesRenderStats();
      requestAnimationFrame(() => {
        gamesRenderAccountChips();
        gamesRenderStats();
      });
''',
'''      gamesRenderStats();
      if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
      requestAnimationFrame(() => {
        gamesRenderAccountChips();
        gamesRenderStats();
        if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
      });
''')
text = text.replace(
'''    clearBtn.addEventListener('click', () => {
      inputEl.value = '';
      gamesClearActiveAccount();
      syncVisibleAccount(null);
      hintEl.textContent = 'Bez účtu můžeš hrát dál. Statistiky se ukládají jen po přihlášení číslem.';
    });
''',
'''    clearBtn.addEventListener('click', () => {
      inputEl.value = '';
      gamesClearActiveAccount();
      syncVisibleAccount(null);
      hintEl.textContent = 'Bez účtu můžeš hrát dál. Statistiky se ukládají jen po přihlášení číslem.';
      if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
    });
''')

# gamesRenderStats: skip blocked ids and preserve current open/locked state.
text = text.replace(
'''  const accounts = Object.values(profile.accounts || {}).sort((a, b) => {
''',
'''  const accounts = Object.values(profile.accounts || {}).filter(acc => !GAMES_ACCOUNT_BLOCKLIST.has(String(acc && acc.id || '').trim())).sort((a, b) => {
''')

# Add a style toggle helper call after load.
text = text.replace(
'''window.addEventListener('load', () => {
  try {
    if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
    if (typeof renderThemeSettingsCards === 'function') renderThemeSettingsCards();
  } catch (err) {}
}, { once: true });
''',
'''window.addEventListener('load', () => {
  try {
    if (typeof syncGamesLockedSections === 'function') syncGamesLockedSections();
    if (typeof renderThemeSettingsCards === 'function') renderThemeSettingsCards();
  } catch (err) {}
}, { once: true });
''')

p.write_text(text, encoding='utf-8')

# styles: unify games folders and make their appearance consistent
for fname in ['index.html', 'styles-responsive.css']:
    p = base / fname
    text = p.read_text(encoding='utf-8')
    text = text.replace(
'''  #games .gamesFolderSummary{
    list-style:none !important;
    display:flex !important;
    align-items:center !important;
    gap:10px !important;
  }
''',
'''  #games .gamesFolderSummary{
    list-style:none !important;
    display:flex !important;
    align-items:center !important;
    gap:10px !important;
  }
''')
    text = text.replace(
'''#games .gamesStatsFolder{margin-top:8px !important;}#games .gamesStatsFolder[open] .gamesStatsGrid{padding-top:4px !important;}
#games .gamesStatsFolder{margin-bottom:8px !important;}
''',
'''#games .gamesProfilesFolder,#games .gamesAchievementsFolder,#games .gamesStatsFolder{margin-top:10px !important;border-radius:18px !important;border:1px solid rgba(124,255,124,.14) !important;background:rgba(11,15,13,.58) !important;overflow:hidden !important;}
#games .gamesProfilesFolder[hidden],#games .gamesAchievementsFolder[hidden],#games .gamesStatsFolder[hidden]{display:none !important;}
#games .gamesProfilesFolder > summary,#games .gamesAchievementsFolder > summary,#games .gamesStatsFolder > summary{list-style:none !important;cursor:pointer !important;padding:10px 12px !important;font-weight:700 !important;color:#e8ffe8 !important;}
#games .gamesProfilesFolder > summary::-webkit-details-marker,#games .gamesAchievementsFolder > summary::-webkit-details-marker,#games .gamesStatsFolder > summary::-webkit-details-marker{display:none !important;}
#games .gamesProfilesFolder[open] .gamesProfilesGrid,#games .gamesAchievementsFolder[open] .gamesAchievementsGrid,#games .gamesStatsFolder[open] .gamesStatsGrid{padding-top:4px !important;}
''')
    # if the exact block wasn't found, patch the existing stats block around it
    text = text.replace(
'''#games .gamesStatsFolder{margin-top:8px !important;}#games .gamesStatsFolder[open] .gamesStatsGrid{padding-top:4px !important;}
#games .gamesStatsFolder{margin-bottom:8px !important;}
''', '')
    p.write_text(text, encoding='utf-8')

# Make sure mobile CSS also affects profiles/achievements folders
p = base / 'index.html'
text = p.read_text(encoding='utf-8')
text = text.replace(
'''#games .gamesStatsFolder{margin-top:6px !important;margin-bottom:6px !important;}
  #games .gamesStatsFolder > summary{padding:8px 10px !important;}
  #games .gamesStatsFolder[open] .gamesStatsGrid{padding-top:4px !important;padding-bottom:18px !important;}
  #games .gamesStatsGrid{padding:0 8px 8px !important;gap:6px !important;}
''',
'''#games .gamesProfilesFolder,#games .gamesAchievementsFolder,#games .gamesStatsFolder{margin-top:6px !important;margin-bottom:6px !important;}
  #games .gamesProfilesFolder > summary,#games .gamesAchievementsFolder > summary,#games .gamesStatsFolder > summary{padding:8px 10px !important;}
  #games .gamesProfilesFolder[open] .gamesProfilesGrid,#games .gamesAchievementsFolder[open] .gamesAchievementsGrid,#games .gamesStatsFolder[open] .gamesStatsGrid{padding-top:4px !important;padding-bottom:18px !important;}
  #games .gamesStatsGrid,#games .gamesProfilesGrid,#games .gamesAchievementsGrid{padding:0 8px 8px !important;gap:6px !important;}
''')
text = text.replace(
'''#games .gamesStatsFolder{
    margin-top:10px !important;
    margin-bottom:10px !important;
    border-radius:18px !important;
  }
  #games .gamesStatsFolder > summary{
    padding:10px 12px !important;
  }
  #games .gamesStatsFolder[open] .gamesStatsGrid{
    padding-top:6px !important;
    padding-bottom:18px !important;
  }
  #games .gamesStatsGrid{
    padding:0 10px 10px !important;
    gap:8px !important;
  }
''',
'''#games .gamesProfilesFolder,#games .gamesAchievementsFolder,#games .gamesStatsFolder{
    margin-top:10px !important;
    margin-bottom:10px !important;
    border-radius:18px !important;
  }
  #games .gamesProfilesFolder > summary,#games .gamesAchievementsFolder > summary,#games .gamesStatsFolder > summary{
    padding:10px 12px !important;
  }
  #games .gamesProfilesFolder[open] .gamesProfilesGrid,#games .gamesAchievementsFolder[open] .gamesAchievementsGrid,#games .gamesStatsFolder[open] .gamesStatsGrid{
    padding-top:6px !important;
    padding-bottom:18px !important;
  }
  #games .gamesStatsGrid,#games .gamesProfilesGrid,#games .gamesAchievementsGrid{
    padding:0 10px 10px !important;
    gap:8px !important;
  }
''')
p.write_text(text, encoding='utf-8')
