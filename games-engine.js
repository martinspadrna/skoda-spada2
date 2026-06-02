// RaK 1.2 (1.112) – sdílený herní engine a lifecycle baseline.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('games-engine.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}

function ensureRakGameEngineState() {
  const current = window.__rakGameEngine || {};
  const state = Object.assign({
    version: window.APP_VERSION || 'unknown',
    mode: 'shared-game-engine-baseline',
    activeGameId: '',
    lastAction: 'init',
    openedCount: 0,
    closedCount: 0,
    pausedCount: 0,
    resumedCount: 0,
    loopStopRequests: 0,
    lifecycleEvents: 0,
    managedLoopCount: 0,
    seenGames: [],
    lastOpenAt: '',
    lastCloseAt: '',
    lastPauseAt: '',
    lastResumeAt: '',
    lastCheckAt: ''
  }, current);
  state.version = window.APP_VERSION || state.version || 'unknown';
  window.__rakGameEngine = state;
  return state;
}
window.ensureRakGameEngineState = ensureRakGameEngineState;

function rakGameEngineNormalizeId(gameId) {
  const raw = String(gameId || '').trim();
  if (!raw) return '';
  return raw === 'g2048' ? '2048' : raw;
}
window.rakGameEngineNormalizeId = rakGameEngineNormalizeId;

function rakGameEngineMarkSeen(state, gameId) {
  const id = rakGameEngineNormalizeId(gameId);
  if (!id) return;
  const list = Array.isArray(state.seenGames) ? state.seenGames.slice(0, 24) : [];
  if (!list.includes(id)) list.push(id);
  state.seenGames = list.slice(-24);
}

function rakGameEngineActivate(gameId, source = 'open') {
  const state = ensureRakGameEngineState();
  const id = rakGameEngineNormalizeId(gameId);
  const now = new Date().toISOString();
  state.activeGameId = id;
  state.lastAction = 'activate:' + String(source || 'open');
  state.lastOpenAt = now;
  state.openedCount = Number(state.openedCount || 0) + 1;
  state.paused = false;
  rakGameEngineMarkSeen(state, id);
  try { document.documentElement.dataset.rakGameEngine = id ? 'active' : 'ready'; } catch (err) {}
  return Object.assign({}, state);
}
window.rakGameEngineActivate = rakGameEngineActivate;

function rakGameEngineDeactivate(reason = 'close') {
  const state = ensureRakGameEngineState();
  state.lastAction = 'deactivate:' + String(reason || 'close');
  state.lastCloseAt = new Date().toISOString();
  state.closedCount = Number(state.closedCount || 0) + 1;
  state.activeGameId = '';
  state.paused = false;
  try { document.documentElement.dataset.rakGameEngine = 'ready'; } catch (err) {}
  return Object.assign({}, state);
}
window.rakGameEngineDeactivate = rakGameEngineDeactivate;

function rakGameEnginePause(reason = 'pause') {
  const state = ensureRakGameEngineState();
  const activeId = rakGameEngineNormalizeId((typeof app !== 'undefined' && app && app.activeGameShell) || state.activeGameId || '');
  if (!activeId) return Object.assign({}, state, { skipped: true });
  state.activeGameId = activeId;
  state.paused = true;
  state.lastAction = 'pause:' + String(reason || 'pause');
  state.lastPauseAt = new Date().toISOString();
  state.pausedCount = Number(state.pausedCount || 0) + 1;
  state.lifecycleEvents = Number(state.lifecycleEvents || 0) + 1;
  try { document.documentElement.dataset.rakGameEngine = 'paused'; } catch (err) {}
  return Object.assign({}, state);
}
window.rakGameEnginePause = rakGameEnginePause;

function rakGameEngineResume(reason = 'resume') {
  const state = ensureRakGameEngineState();
  const activeId = rakGameEngineNormalizeId((typeof app !== 'undefined' && app && app.activeGameShell) || state.activeGameId || '');
  if (!activeId) return Object.assign({}, state, { skipped: true });
  state.activeGameId = activeId;
  state.paused = false;
  state.lastAction = 'resume:' + String(reason || 'resume');
  state.lastResumeAt = new Date().toISOString();
  state.resumedCount = Number(state.resumedCount || 0) + 1;
  state.lifecycleEvents = Number(state.lifecycleEvents || 0) + 1;
  rakGameEngineMarkSeen(state, activeId);
  try { document.documentElement.dataset.rakGameEngine = 'active'; } catch (err) {}
  return Object.assign({}, state);
}
window.rakGameEngineResume = rakGameEngineResume;

function rakGameEngineNoteLoopStop(reason = 'stop-loops') {
  const state = ensureRakGameEngineState();
  state.loopStopRequests = Number(state.loopStopRequests || 0) + 1;
  state.lastAction = 'loop-stop:' + String(reason || 'stop-loops');
  return Object.assign({}, state);
}
window.rakGameEngineNoteLoopStop = rakGameEngineNoteLoopStop;

function rakGameEngineShouldRun(gameId = '') {
  const id = rakGameEngineNormalizeId(gameId || (typeof app !== 'undefined' && app && app.activeGameShell) || '');
  if (!id) return false;
  if (document.visibilityState === 'hidden') return false;
  const page = document.getElementById('games');
  if (page && page.classList && !page.classList.contains('active') && !document.body.classList.contains('gamesOpen') && !document.body.classList.contains('tttOpen')) return false;
  return true;
}
window.rakGameEngineShouldRun = rakGameEngineShouldRun;

function setupRakGameEngineLifecycleBindings() {
  if (window.__rakGameEngineLifecycleBound) return ensureRakGameEngineState();
  window.__rakGameEngineLifecycleBound = true;
  ensureRakGameEngineState();
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') rakGameEnginePause('visibility-hidden');
    else rakGameEngineResume('visibility-visible');
  };
  if (typeof registerListener === 'function') registerListener(document, 'visibilitychange', onVisibility, { passive: true });
  else document.addEventListener('visibilitychange', onVisibility, { passive: true });
  const onPageHide = () => rakGameEnginePause('pagehide');
  const onPageShow = () => rakGameEngineResume('pageshow');
  if (typeof registerListener === 'function') {
    registerListener(window, 'pagehide', onPageHide, { passive: true });
    registerListener(window, 'pageshow', onPageShow, { passive: true });
  } else {
    window.addEventListener('pagehide', onPageHide, { passive: true });
    window.addEventListener('pageshow', onPageShow, { passive: true });
  }
  return ensureRakGameEngineState();
}
window.setupRakGameEngineLifecycleBindings = setupRakGameEngineLifecycleBindings;

function getGameEngineBaselineHealth() {
  const state = ensureRakGameEngineState();
  const issues = [];
  const requiredHelpers = [
    'rakGameEngineActivate',
    'rakGameEngineDeactivate',
    'rakGameEnginePause',
    'rakGameEngineResume',
    'rakGameEngineShouldRun',
    'rakGameEngineNoteLoopStop',
    'setupRakGameEngineLifecycleBindings',
    'getRakModuleReadinessHealth',
    'getRakRuntimeGuardHealth',
    'getRakStatsYearScopeHealth',
    'getRakDomActionRegistryHealth',
    'getRakDomActionSmokeReport'
  ];
  requiredHelpers.forEach((name) => {
    if (typeof window[name] !== 'function') issues.push('helper ' + name);
  });

  const activeGame = rakGameEngineNormalizeId((typeof app !== 'undefined' && app && app.activeGameShell) || state.activeGameId || '');
  const expectedGames = ['ttt', '2048', 'snake', 'flap'];
  const hasStopLoops = typeof window.gamesStopActiveLoops === 'function' || typeof gamesStopActiveLoops === 'function';
  const hasRenderShell = typeof window.renderGameShell === 'function' || typeof renderGameShell === 'function';
  const hasOpenShell = typeof window.openGameShell === 'function' || typeof openGameShell === 'function';
  const hasCloseShell = typeof window.closeGameShell === 'function' || typeof closeGameShell === 'function';
  const gamePerf = window.__rakGamePerfManager || null;

  if (!window.__rakGameEngineLifecycleBound && typeof setupRakGameEngineLifecycleBindings === 'function') {
    try { setupRakGameEngineLifecycleBindings(); } catch (err) {}
  }
  if (!window.__rakGameEngineLifecycleBound) issues.push('lifecycle bindings missing');
  if (!hasStopLoops) issues.push('gamesStopActiveLoops missing');
  if (!hasRenderShell) issues.push('renderGameShell missing');
  if (!hasOpenShell) issues.push('openGameShell missing');
  if (!hasCloseShell) issues.push('closeGameShell missing');
  if (activeGame && !expectedGames.includes(activeGame) && !(window.__rakArcadeExtraGames && Array.isArray(window.__rakArcadeExtraGames) && window.__rakArcadeExtraGames.includes(activeGame))) issues.push('unknown active game ' + activeGame);

  state.lastCheckAt = new Date().toISOString();
  state.managedLoopCount = Number(gamePerf && gamePerf.activeManagedIntervals || 0) || 0;

  return {
    ok: issues.length === 0,
    mode: 'shared-game-engine-baseline',
    version: window.APP_VERSION || 'unknown',
    activeGame,
    bodyGamesOpen: !!(document.body && document.body.classList && document.body.classList.contains('gamesOpen')),
    bodyTttOpen: !!(document.body && document.body.classList && document.body.classList.contains('tttOpen')),
    paused: !!state.paused,
    openedCount: Number(state.openedCount || 0),
    closedCount: Number(state.closedCount || 0),
    pausedCount: Number(state.pausedCount || 0),
    resumedCount: Number(state.resumedCount || 0),
    loopStopRequests: Number(state.loopStopRequests || 0),
    lifecycleEvents: Number(state.lifecycleEvents || 0),
    managedLoopCount: Number(state.managedLoopCount || 0),
    seenGameCount: Array.isArray(state.seenGames) ? state.seenGames.length : 0,
    lastAction: String(state.lastAction || '—'),
    hasGamePerfManager: !!gamePerf,
    hasStopLoops,
    hasRenderShell,
    hasOpenShell,
    hasCloseShell,
    issueCount: issues.length,
    issues: issues.slice(0, 12)
  };
}
window.getGameEngineBaselineHealth = getGameEngineBaselineHealth;

function runGameEngineBaselineAudit() {
  const run = () => {
    try { setupRakGameEngineLifecycleBindings(); } catch (err) {}
    const report = getGameEngineBaselineHealth();
    try {
      document.documentElement.dataset.rakGameEngineAudit = report.ok ? report.mode : 'game-engine-check';
      window.__rakGameEngineBaselineAudit = Object.assign({ checkedAt: new Date().toISOString() }, report);
    } catch (err) {}
    if (!report.ok) console.warn('[RaK] Herní engine baseline audit', report);
    return report;
  };

  if (document.readyState === 'loading') {
    const rerun = () => setTimeout(run, 420);
    if (typeof registerListener === 'function') registerListener(document, 'DOMContentLoaded', rerun, { once: true });
    else document.addEventListener('DOMContentLoaded', rerun, { once: true });
    return { version: window.APP_VERSION || 'unknown', phase: 'game-engine-baseline', ok: true, deferred: true };
  }

  requestAnimationFrame(() => setTimeout(run, 420));
  return { version: window.APP_VERSION || 'unknown', phase: 'game-engine-baseline', ok: true, deferred: true };
}
window.runGameEngineBaselineAudit = runGameEngineBaselineAudit;
