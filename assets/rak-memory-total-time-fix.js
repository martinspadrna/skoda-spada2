/* RaK 1.2 (1.155) – Pexeso total-time online guard + RPC-safe payload
   Oprava: Pexeso/Memory ukládá výherní čas jako celkový čas hry od startu kola.
   Důvod: staré zápisy uměly poslat skóre 5000/10000, které se v tabulce tvářilo jako pár vteřin.
*/
(function rakMemoryTotalTimeGuard(){
  'use strict';
  if (window.__rakMemoryTotalTimeGuardV154) return;
  window.__rakMemoryTotalTimeGuardV154 = true;

  var START_KEY = 'rakMemoryTotalTimeStartMs.v154';
  var ACTIVE_KEY = 'rakMemoryTotalTimeActive.v154';
  var LAST_REASON_KEY = 'rakMemoryTotalTimeReason.v154';
  var SCORE_SCALE = 5000;
  var MEMORY_TYPES = { memory: true, memory_4x4: true, memory_6x6: true, memory_8x8: true };
  var MIN_VALID_MS = { memory: 12000, memory_4x4: 12000, memory_6x6: 30000, memory_8x8: 60000 };
  var MAX_REASONABLE_MS = 6 * 60 * 60 * 1000;

  function now(){ return Date.now ? Date.now() : new Date().getTime(); }
  function storageGet(k){ try { return sessionStorage.getItem(k); } catch(_){ return null; } }
  function storageSet(k,v){ try { sessionStorage.setItem(k, String(v)); } catch(_){} }
  function storageRemove(k){ try { sessionStorage.removeItem(k); } catch(_){} }
  function hasMemoryText(){
    try {
      var txt = (document.body && document.body.innerText || '').toLowerCase();
      return txt.indexOf('pexeso') !== -1 || txt.indexOf('memory') !== -1;
    } catch(_) { return false; }
  }
  function hasMemoryBoard(){
    try {
      if (!document.body) return false;
      if (document.querySelector('[data-game*="memory"], [data-game*="pexeso"], [id*="memory"], [id*="pexeso"], [class*="memory"], [class*="pexeso"]')) return true;
      return hasMemoryText();
    } catch(_) { return false; }
  }
  function startMemoryRound(reason){
    if (!hasMemoryBoard()) return;
    var current = Number(storageGet(START_KEY) || 0);
    var t = now();
    if (!current || current > t || (t - current) > MAX_REASONABLE_MS) {
      storageSet(START_KEY, t);
      storageSet(ACTIVE_KEY, 'yes');
      storageSet(LAST_REASON_KEY, reason || 'auto');
      window.__rakMemoryTotalTimeStartMs = t;
    }
  }
  function resetMemoryRound(){
    storageRemove(START_KEY);
    storageRemove(ACTIVE_KEY);
    storageRemove(LAST_REASON_KEY);
    window.__rakMemoryTotalTimeStartMs = 0;
  }
  function getTypeFromObject(obj){
    if (!obj || typeof obj !== 'object') return '';
    var keys = ['game_type','gameType','type','p_game_type','p_gameType','p_type'];
    for (var i=0;i<keys.length;i++) {
      var v = obj[keys[i]];
      if (typeof v === 'string' && MEMORY_TYPES[v]) return v;
    }
    return '';
  }
  function readNumericDeep(obj, matcher, best){
    if (!obj || typeof obj !== 'object') return best || 0;
    Object.keys(obj).forEach(function(k){
      var v = obj[k];
      if (typeof v === 'number' && isFinite(v) && matcher(k)) {
        best = Math.max(best || 0, v);
      } else if (v && typeof v === 'object') {
        best = readNumericDeep(v, matcher, best || 0);
      }
    });
    return best || 0;
  }
  function elapsedFromState(gameType, payload){
    var t = now();
    var start = Number(storageGet(START_KEY) || window.__rakMemoryTotalTimeStartMs || 0);
    var elapsed = 0;
    if (start && start <= t) elapsed = t - start;
    var reported = readNumericDeep(payload, function(k){ return /elapsed|duration|time|ms/i.test(k); }, 0);
    // Some callers use seconds; values over 1000 are already probably ms.
    if (reported > 0 && reported < 1000) reported = reported * 1000;
    elapsed = Math.max(elapsed, reported || 0);
    var minMs = MIN_VALID_MS[gameType] || 12000;
    if (!elapsed || elapsed < minMs) elapsed = minMs;
    if (elapsed > MAX_REASONABLE_MS) elapsed = MAX_REASONABLE_MS;
    return Math.round(elapsed);
  }
  function encodeTimeScore(ms){
    var seconds = Math.max(1, Math.round(ms / 1000));
    return Math.max(1, Math.min(SCORE_SCALE - 1, SCORE_SCALE - seconds));
  }
  function writeNumericDeep(obj, matcher, value){
    if (!obj || typeof obj !== 'object') return;
    Object.keys(obj).forEach(function(k){
      var v = obj[k];
      if (typeof v === 'number' && isFinite(v) && matcher(k)) {
        obj[k] = value;
      } else if (v && typeof v === 'object') {
        writeNumericDeep(v, matcher, value);
      }
    });
  }
  function ensureTimeFields(obj, elapsedMs){
    if (!obj || typeof obj !== 'object') return;
    var found = false;
    Object.keys(obj).forEach(function(k){
      var v = obj[k];
      if (typeof v === 'number' && isFinite(v) && /elapsed|duration|time.*ms|best.*ms/i.test(k)) {
        obj[k] = elapsedMs;
        found = true;
      } else if (v && typeof v === 'object') {
        ensureTimeFields(v, elapsedMs);
      }
    });
    if (!found) {
      if ('elapsedMs' in obj || 'elapsed_ms' in obj || 'timeMs' in obj || 'time_ms' in obj || 'bestTimeMs' in obj || 'best_time_ms' in obj) {
        if ('elapsedMs' in obj) obj.elapsedMs = elapsedMs;
        if ('elapsed_ms' in obj) obj.elapsed_ms = elapsedMs;
        if ('timeMs' in obj) obj.timeMs = elapsedMs;
        if ('time_ms' in obj) obj.time_ms = elapsedMs;
        if ('bestTimeMs' in obj) obj.bestTimeMs = elapsedMs;
        if ('best_time_ms' in obj) obj.best_time_ms = elapsedMs;
      }
    }
  }
  function normalizeMemoryPayload(obj){
    var gameType = getTypeFromObject(obj);
    if (!gameType) return obj;
    var elapsedMs = elapsedFromState(gameType, obj);
    var safeScore = encodeTimeScore(elapsedMs);
    writeNumericDeep(obj, function(k){ return /(^|_)(points?|score)(_delta)?$|p_points_delta|p_score_delta/i.test(k); }, safeScore);
    ensureTimeFields(obj, elapsedMs);
    // RaK 1.2 (1.155): do RPC payloadu nesmíme přidávat nové klíče.
    // PostgREST pak hledá funkci s parametry __rakMemory... a vrací 404.
    resetMemoryRound();
    return obj;
  }

  document.addEventListener('pointerdown', function(ev){
    var label = '';
    try {
      var node = ev.target && ev.target.closest && ev.target.closest('button,a,[role="button"],.card,.game-card,.memory-card,.tile');
      label = (node && (node.innerText || node.textContent) || '').toLowerCase();
    } catch(_) {}
    if (hasMemoryBoard() && (/pexeso|memory|spustit|nová|nova|start|4x4|4×4|6x6|6×6|karta|hrát|hrat/.test(label) || !label)) {
      startMemoryRound(label || 'pointer');
    }
  }, true);

  document.addEventListener('click', function(ev){
    var label = '';
    try { label = (ev.target && (ev.target.innerText || ev.target.textContent) || '').toLowerCase(); } catch(_) {}
    if (/nová hra|nova hra|restart|zpět|zpet|menu/.test(label) && hasMemoryText()) {
      resetMemoryRound();
    }
  }, true);

  // Mutation observer catches games started through app navigation without a clear button label.
  try {
    var mo = new MutationObserver(function(){ if (hasMemoryBoard()) startMemoryRound('dom'); });
    if (document.documentElement) mo.observe(document.documentElement, { childList:true, subtree:true });
  } catch(_) {}

  var originalFetch = window.fetch;
  if (typeof originalFetch === 'function') {
    window.fetch = function(input, init){
      try {
        var url = String((input && input.url) || input || '');
        var body = init && init.body;
        if (url.indexOf('rak_record_game_stat_delta') !== -1 && typeof body === 'string' && body.indexOf('memory') !== -1) {
          var json = JSON.parse(body);
          normalizeMemoryPayload(json);
          init = Object.assign({}, init, { body: JSON.stringify(json) });
        }
      } catch(_) {}
      return originalFetch.call(this, input, init);
    };
  }

  window.rakMemoryTotalTimeGuard = {
    version: '1.155',
    start: startMemoryRound,
    reset: resetMemoryRound,
    encodeTimeScore: encodeTimeScore,
    normalizeMemoryPayload: normalizeMemoryPayload
  };
})();
