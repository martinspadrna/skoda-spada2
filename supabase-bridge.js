(function () {
  const SUPABASE_CONFIG = window.SUPABASE_CONFIG || {};
  const state = {
    client: null,
    ready: false,
    announcements: [],
    rotationSnapshot: null,
    machineSettingsSnapshot: [],
    lastError: null,
    realtimeChannel: null,
    realtimeStatus: 'idle',
    realtimeEvents: [],
    lastRealtimeAt: null,
    realtimeBindStartedAt: 0,
    queueGuard: {
      trimmed: 0,
      deduped: 0,
      rejected: 0,
      oversized: 0,
      lastTrimAt: null,
      lastBindSkipAt: null
    },
    syncGuard: {
      readTimeouts: 0,
      writeTimeouts: 0,
      readRetries: 0,
      writeRetries: 0,
      queuedFallbacks: 0,
      cooldownSkips: 0,
      failedWrites: 0,
      failedReads: 0,
      queueFlushRuns: 0,
      queueFlushSuccesses: 0,
      queueFlushErrors: 0,
      queueBackoffSkips: 0,
      queueDroppedInvalid: 0,
      queueFlushBatchStops: 0,
      queueFlushScheduled: 0,
      queueFlushEmptyRuns: 0,
      queueHiddenDefers: 0,
      queueVisibilityFlushes: 0,
      queueWakeRequests: 0,
      queueWakeSkips: 0,
      queueWakeOfflineSkips: 0,
      queueWakeNoops: 0,
      realtimeWakeBinds: 0,
      queueNextRetryAt: null,
      lastTimeoutAt: null,
      lastRetryAt: null,
      lastQueuedFallbackAt: null,
      lastCooldownSkipAt: null,
      lastQueueFlushAt: null,
      lastQueueSuccessAt: null,
      lastQueueErrorAt: null,
      lastQueueBackoffAt: null,
      lastQueueScheduleAt: null,
      lastQueueHiddenDeferAt: null,
      lastQueueVisibilityFlushAt: null,
      lastQueueWakeAt: null,
      lastQueueWakeSkipAt: null,
      lastRealtimeWakeBindAt: null
    },
    cacheGuard: {
      accountCacheHits: 0,
      accountCacheWrites: 0,
      statsCacheHits: 0,
      statsCacheWrites: 0,
      uiCacheHits: 0,
      uiCacheWrites: 0,
      uiSettingsLoads: 0,
      uiSettingsSaves: 0,
      uiSettingsSaveQueued: 0,
      uiSettingsSaveDeferred: 0,
      uiSettingsSaveErrors: 0,
      uiSettingsLoadFallbacks: 0,
      uiSettingsSharedLookups: 0,
      sessionCacheHits: 0,
      sessionCacheWrites: 0,
      sessionSaveQueued: 0,
      sessionSaveErrors: 0,
      sessionFallbacks: 0,
      sessionSharedLookups: 0,
      staleFallbacks: 0,
      sharedReadJoins: 0,
      lastCacheHitAt: null,
      lastCacheWriteAt: null,
      lastSharedReadAt: null
    }
  };

  const SUPABASE_QUEUE_MAX_ITEMS = 120;
  const SUPABASE_QUEUE_MAX_BYTES = 650000;
  const SUPABASE_REALTIME_REBIND_GUARD_MS = 15000;
  const SUPABASE_READ_TIMEOUT_MS = 12000;
  const SUPABASE_WRITE_TIMEOUT_MS = 16000;
  const SUPABASE_WRITE_COOLDOWN_MS = 900;
  const SUPABASE_QUEUE_RETRY_BASE_MS = 12000;
  const SUPABASE_QUEUE_RETRY_MAX_MS = 4 * 60 * 1000;
  const SUPABASE_QUEUE_FLUSH_BATCH_SIZE = 8;
  const SUPABASE_QUEUE_FLUSH_IDLE_DELAY_MS = 1200;
  const SUPABASE_QUEUE_HIDDEN_RETRY_DELAY_MS = 1800;
  const SUPABASE_QUEUE_WAKE_GUARD_MS = 2500;
  const SUPABASE_QUEUE_DROP_INVALID_AFTER = 3;
  const SUPPORTED_QUEUE_TYPES = new Set([
    'rotation_state',
    'machine_settings',
    'rotation_month_entries',
    'gomoku_win',
    'game_stat',
    'game_ui_settings',
    'game_session'
  ]);

  function hasClient() {
    return !!(window.supabase && typeof window.supabase.createClient === 'function');
  }

  function getClient() {
    if (state.client) return state.client;
    if (!hasClient()) return null;
    const url = SUPABASE_CONFIG.url || '';
    const key = SUPABASE_CONFIG.publishableKey || '';
    if (!url || !key) return null;
    state.client = window.supabase.createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
    return state.client;
  }

  const REALTIME_TABLES = [
    'announcements',
    'machine_settings',
    'rotation_state',
    'rotation_months',
    'rotation_entries',
    'game_accounts',
    'game_invites',
    'game_sessions',
    'game_stats',
    'gomoku_wins'
  ];

  let realtimeRefreshTimer = null;

  function rememberRealtimeEvent(payload) {
    const event = {
      table: String(payload && payload.table ? payload.table : '').trim(),
      eventType: String(payload && payload.eventType ? payload.eventType : '').trim(),
      at: Date.now()
    };
    state.lastRealtimeAt = event.at;
    state.realtimeEvents = Array.isArray(state.realtimeEvents) ? state.realtimeEvents : [];
    state.realtimeEvents.push(event);
    if (state.realtimeEvents.length > 12) state.realtimeEvents = state.realtimeEvents.slice(-12);
    return event;
  }

  function requestRealtimeRefresh(payload) {
    const event = rememberRealtimeEvent(payload || {});
    if (realtimeRefreshTimer) clearTimeout(realtimeRefreshTimer);
    realtimeRefreshTimer = setTimeout(async () => {
      realtimeRefreshTimer = null;
      const reason = event.table ? ('supabase-' + event.table) : 'supabase-realtime';
      try {
        if (typeof window.__rotaceTriggerLiveRefresh === 'function') {
          await window.__rotaceTriggerLiveRefresh(reason, { force: true });
          return;
        }
        await refreshPublicData();
        if (typeof window.syncRotationFromSupabase === 'function') {
          await window.syncRotationFromSupabase(false);
        }
        if (typeof window.forceHomeRefresh === 'function') window.forceHomeRefresh();
        else if (typeof window.updateDashboard === 'function') window.updateDashboard();
        if (typeof window.renderRotace === 'function') window.renderRotace();
        if (typeof window.renderStatsPanel === 'function') window.renderStatsPanel();
      } catch (err) {
        state.lastError = err;
        console.warn('Supabase realtime refresh failed', err);
      }
    }, 450);
  }

  function bindRealtimeSubscriptions() {
    const client = getClient();
    if (!client || !navigator.onLine) return false;
    if (state.realtimeChannel) return true;
    if (state.realtimeStatus === 'connecting') {
      const now = Date.now();
      if (state.realtimeBindStartedAt && now - state.realtimeBindStartedAt < SUPABASE_REALTIME_REBIND_GUARD_MS) {
        state.queueGuard.lastBindSkipAt = now;
        return true;
      }
      state.realtimeStatus = 'idle';
      state.realtimeChannel = null;
    }
    if (typeof client.channel !== 'function') return false;

    try {
      state.realtimeBindStartedAt = Date.now();
      const channel = client.channel('rak-public-live-v562');
      REALTIME_TABLES.forEach((table) => {
        channel.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          requestRealtimeRefresh(payload || { table });
        });
      });
      channel.subscribe((status) => {
        state.realtimeStatus = String(status || '').toLowerCase() || 'unknown';
        if (status === 'SUBSCRIBED') {
          state.realtimeBindStartedAt = 0;
          requestRealtimeRefresh({ table: 'initial', eventType: 'SUBSCRIBED' });
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          state.realtimeChannel = null;
          state.realtimeBindStartedAt = 0;
        }
      });
      state.realtimeChannel = channel;
      state.realtimeStatus = 'connecting';
      return true;
    } catch (err) {
      state.lastError = err;
      state.realtimeStatus = 'failed';
      console.warn('Supabase realtime subscribe failed', err);
      state.realtimeChannel = null;
      return false;
    }
  }


  function getBridgeText() {
    const active = state.announcements.find(item => item && item.is_active !== false) || state.announcements[0] || null;
    return active ? {
      title: String(active.title || '').trim(),
      message: String(active.message || '').trim()
    } : null;
  }

  function getCanteenStatus() {
    return null;
  }

  const LOCAL_STATE_KEY = 'rotace_supabase_local_state_v1';
  const LOCAL_QUEUE_KEY = 'rotace_supabase_queue_v1';
  const LOCAL_ANNOUNCEMENTS_KEY = 'rotace_supabase_announcements_v1';
  const LOCAL_MACHINE_SETTINGS_KEY = 'rotace_supabase_machine_settings_v1';
  const LOCAL_GAME_ACCOUNTS_KEY = 'rotace_supabase_game_accounts_v1';
  const LOCAL_GAME_STATS_PREFIX = 'rotace_supabase_game_stats_v1:';
  const LOCAL_GAME_UI_SETTINGS_PREFIX = 'rotace_supabase_game_ui_settings_v1:';
  const LOCAL_GAME_SESSIONS_PREFIX = 'rotace_supabase_game_sessions_v1:';
  const GAME_UI_SETTINGS_TYPE = '__profile_ui';
  const SUPABASE_GAME_CACHE_TTL_MS = 5 * 60 * 1000;
  let flushPromise = null;
  let flushScheduleTimer = null;
  let lastQueueWakeRequestAt = 0;
  const sharedReadPromises = new Map();

  function safeReadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed === undefined ? fallback : parsed;
    } catch (err) {
      return fallback;
    }
  }

  function safeWriteJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  function readTimedCache(key, maxAgeMs) {
    const item = safeReadJson(key, null);
    if (!item || typeof item !== 'object' || !Array.isArray(item.rows)) return null;
    const savedAt = Number(item.savedAt || 0);
    const age = savedAt ? Date.now() - savedAt : Number.POSITIVE_INFINITY;
    return {
      rows: item.rows,
      savedAt,
      age,
      fresh: age <= Math.max(1000, Number(maxAgeMs) || SUPABASE_GAME_CACHE_TTL_MS)
    };
  }

  function writeTimedCache(key, rows, kind) {
    if (!Array.isArray(rows)) return false;
    const ok = safeWriteJson(key, {
      savedAt: Date.now(),
      version: window.APP_VERSION || '',
      rows
    });
    if (ok) {
      state.cacheGuard.lastCacheWriteAt = Date.now();
      if (kind === 'accounts') state.cacheGuard.accountCacheWrites += 1;
      if (kind === 'stats') state.cacheGuard.statsCacheWrites += 1;
      if (kind === 'ui') state.cacheGuard.uiCacheWrites += 1;
      if (kind === 'session') state.cacheGuard.sessionCacheWrites += 1;
    }
    return ok;
  }

  function rememberTimedCacheHit(kind, cache) {
    state.cacheGuard.lastCacheHitAt = Date.now();
    if (cache && !cache.fresh) state.cacheGuard.staleFallbacks += 1;
    if (kind === 'accounts') state.cacheGuard.accountCacheHits += 1;
    if (kind === 'stats') state.cacheGuard.statsCacheHits += 1;
    if (kind === 'ui') state.cacheGuard.uiCacheHits += 1;
    if (kind === 'session') state.cacheGuard.sessionCacheHits += 1;
  }

  async function runSharedSupabaseRead(key, work) {
    const readKey = String(key || '').trim();
    if (!readKey) return await work();
    if (sharedReadPromises.has(readKey)) {
      state.cacheGuard.sharedReadJoins += 1;
      state.cacheGuard.lastSharedReadAt = Date.now();
      return await sharedReadPromises.get(readKey);
    }
    const promise = Promise.resolve().then(work).finally(() => {
      sharedReadPromises.delete(readKey);
    });
    sharedReadPromises.set(readKey, promise);
    return await promise;
  }

  function saveLocalSnapshot(rotation, machineSettingsRows) {
    const existing = readLocalSnapshot() || {};
    const hasRotation = !!(rotation && typeof rotation === 'object');
    const hasMachineSettings = Array.isArray(machineSettingsRows) && machineSettingsRows.length > 0;
    const nextRotation = hasRotation ? rotation : (existing.rotation || null);
    const nextMachineSettings = hasMachineSettings
      ? machineSettingsRows
      : (Array.isArray(existing.machineSettingsRows) ? existing.machineSettingsRows : []);
    const nextAnnouncements = Array.isArray(state.announcements) && state.announcements.length
      ? state.announcements
      : (Array.isArray(existing.announcements) ? existing.announcements : []);
    const snapshot = {
      updatedAt: Date.now(),
      version: window.APP_VERSION || existing.version || '',
      rotation: nextRotation,
      machineSettingsRows: nextMachineSettings,
      announcements: nextAnnouncements
    };
    if (existing && typeof existing.updatedAt === 'number' && existing.updatedAt > snapshot.updatedAt && !hasRotation && !hasMachineSettings) {
      snapshot.updatedAt = existing.updatedAt;
      snapshot.version = existing.version || snapshot.version;
    }
    safeWriteJson(LOCAL_STATE_KEY, snapshot);
    if (hasMachineSettings || (Array.isArray(existing.machineSettingsRows) && existing.machineSettingsRows.length)) {
      safeWriteJson(LOCAL_MACHINE_SETTINGS_KEY, snapshot.machineSettingsRows);
    }
    return snapshot;
  }

  function readLocalSnapshot() {
    const snapshot = safeReadJson(LOCAL_STATE_KEY, null);
    if (snapshot && typeof snapshot === 'object') return snapshot;
    return null;
  }

  function queueTaskKey(task) {
    const type = String(task && task.type ? task.type : '').trim();
    if (type === 'rotation_state') return type;
    if (type === 'machine_settings') return type;
    if (type === 'rotation_month_entries') return type + ':' + String(task && (task.monthStart || task.label) ? (task.monthStart || task.label) : '').trim();
    if (type === 'gomoku_win') return type + ':' + String(task && task.entry && (task.entry.id || task.entry.player_name || task.entry.created_at) ? (task.entry.id || task.entry.player_name || task.entry.created_at) : '').trim();
    if (type === 'game_stat') return type + ':' + String(task && task.entry && (task.entry.id || task.entry.game_type || task.entry.account_number || task.entry.created_at) ? (task.entry.id || task.entry.game_type || task.entry.account_number || task.entry.created_at) : '').trim();
    if (type === 'game_ui_settings') return type + ':' + String(task && task.entry && (task.entry.account_number || task.entry.accountNumber) ? (task.entry.account_number || task.entry.accountNumber) : '').trim();
    if (type === 'game_session') return type + ':' + String(task && (task.inviteCode || task.code) ? (task.inviteCode || task.code) : '').trim().toUpperCase();
    return type || 'unknown';
  }

  function estimateJsonBytes(value) {
    try { return new Blob([JSON.stringify(value || null)]).size; }
    catch (err) {
      try { return String(JSON.stringify(value || null)).length; }
      catch (err2) { return Number.POSITIVE_INFINITY; }
    }
  }

  function normalizeQueueTask(task) {
    if (!task || typeof task !== 'object') return null;
    const type = String(task.type || '').trim();
    if (!SUPPORTED_QUEUE_TYPES.has(type)) {
      state.queueGuard.rejected += 1;
      return null;
    }
    const next = Object.assign({}, task, { type });
    if (!next.id) next.id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (!next.queuedAt) next.queuedAt = new Date().toISOString();
    if (estimateJsonBytes(next) > SUPABASE_QUEUE_MAX_BYTES) {
      state.queueGuard.oversized += 1;
      return null;
    }
    return next;
  }

  function compactQueue(queue) {
    const source = Array.isArray(queue) ? queue : [];
    const keyed = new Map();
    const passthrough = [];
    source.forEach((item) => {
      const normalized = normalizeQueueTask(item);
      if (!normalized) return;
      const key = queueTaskKey(normalized);
      if (key && (normalized.type === 'rotation_state' || normalized.type === 'machine_settings' || normalized.type === 'rotation_month_entries' || normalized.type === 'game_ui_settings' || normalized.type === 'game_session')) {
        if (keyed.has(key)) state.queueGuard.deduped += 1;
        keyed.set(key, normalized);
      } else {
        passthrough.push(normalized);
      }
    });
    let next = [...keyed.values(), ...passthrough];
    if (next.length > SUPABASE_QUEUE_MAX_ITEMS) {
      const removed = next.length - SUPABASE_QUEUE_MAX_ITEMS;
      state.queueGuard.trimmed += removed;
      state.queueGuard.lastTrimAt = Date.now();
      next = next.slice(-SUPABASE_QUEUE_MAX_ITEMS);
    }
    return next;
  }

  function readQueue() {
    const queue = safeReadJson(LOCAL_QUEUE_KEY, []);
    const compacted = compactQueue(Array.isArray(queue) ? queue : []);
    if (!Array.isArray(queue) || compacted.length !== queue.length) writeQueue(compacted);
    return compacted;
  }

  function writeQueue(queue) {
    safeWriteJson(LOCAL_QUEUE_KEY, compactQueue(Array.isArray(queue) ? queue : []));
  }

  function enqueueTask(task) {
    const queue = readQueue();
    const normalized = normalizeQueueTask(Object.assign({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, queuedAt: new Date().toISOString() }, task || {}));
    if (!normalized) return null;
    queue.push(normalized);
    writeQueue(queue);
    const nextQueue = readQueue();
    const key = queueTaskKey(normalized);
    return nextQueue.slice().reverse().find(item => queueTaskKey(item) === key) || normalized;
  }

  function isLikelyOfflineError(err) {
    const msg = String(err && (err.message || err.statusText || err.code) ? (err.message || err.statusText || err.code) : err || '').toLowerCase();
    return !navigator.onLine || msg.includes('fetch') || msg.includes('network') || msg.includes('offline') || msg.includes('failed to fetch') || msg.includes('load failed');
  }

  function isSupabaseTimeoutError(err) {
    return !!(err && (err.code === 'RAK_SUPABASE_TIMEOUT' || err.name === 'AbortError'));
  }

  function isLikelyTransientError(err) {
    const msg = String(err && (err.message || err.statusText || err.code || err.status) ? (err.message || err.statusText || err.code || err.status) : err || '').toLowerCase();
    const status = Number(err && (err.status || err.statusCode || err.code));
    return isLikelyOfflineError(err)
      || isSupabaseTimeoutError(err)
      || msg.includes('timeout')
      || msg.includes('timed out')
      || msg.includes('rate limit')
      || msg.includes('temporarily')
      || msg.includes('connection')
      || [408, 409, 425, 429, 500, 502, 503, 504].includes(status);
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
  }

  function getQueueRetryDelay(task) {
    const retries = Math.max(0, Number(task && task.retryCount) || 0);
    if (!retries) return 0;
    const delay = SUPABASE_QUEUE_RETRY_BASE_MS * Math.pow(2, Math.min(5, retries - 1));
    const jitter = Math.max(0, Math.min(2500, Number(task && task.retryJitterMs) || 0));
    return Math.min(SUPABASE_QUEUE_RETRY_MAX_MS, Math.max(SUPABASE_QUEUE_RETRY_BASE_MS, delay + jitter));
  }

  function shouldSkipQueuedTaskForBackoff(task) {
    const lastTriedAt = Number(task && task.lastTriedAt ? task.lastTriedAt : 0);
    const delay = getQueueRetryDelay(task);
    if (!lastTriedAt || !delay) return false;
    const waitLeft = lastTriedAt + delay - Date.now();
    if (waitLeft <= 0) return false;
    state.syncGuard.queueBackoffSkips += 1;
    state.syncGuard.lastQueueBackoffAt = Date.now();
    return true;
  }

  function markQueuedTaskAttempt(task) {
    return Object.assign({}, task || {}, {
      lastTriedAt: Date.now(),
      lastTriedVersion: window.APP_VERSION || '',
      retryCount: Math.max(0, Number(task && task.retryCount) || 0)
    });
  }

  function markQueuedTaskFailure(task, err) {
    const msg = String(err && (err.message || err.statusText || err.code || err.status) ? (err.message || err.statusText || err.code || err.status) : err || 'unknown').slice(0, 160);
    return Object.assign({}, task || {}, {
      retryCount: Math.max(0, Number(task && task.retryCount) || 0) + 1,
      lastErrorAt: Date.now(),
      lastErrorMessage: msg,
      retryJitterMs: Math.floor(Math.random() * 1800),
      lastTriedVersion: window.APP_VERSION || ''
    });
  }

  function isLikelyPermanentQueueError(err) {
    const msg = String(err && (err.message || err.statusText || err.code || err.status) ? (err.message || err.statusText || err.code || err.status) : err || '').toLowerCase();
    const status = Number(err && (err.status || err.statusCode || err.code));
    return [400, 401, 403, 404, 406].includes(status)
      || msg.includes('permission denied')
      || msg.includes('violates row-level security')
      || msg.includes('invalid input')
      || msg.includes('not found');
  }

  function shouldDropInvalidQueuedTask(task, err) {
    const retries = Math.max(0, Number(task && task.retryCount) || 0);
    return isLikelyPermanentQueueError(err) && retries >= SUPABASE_QUEUE_DROP_INVALID_AFTER;
  }

  function withSupabaseTimeout(promise, label, timeoutMs, mode) {
    const ms = Math.max(2500, Number(timeoutMs) || SUPABASE_READ_TIMEOUT_MS);
    let timer = null;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const err = new Error('Supabase požadavek vypršel: ' + String(label || 'unknown'));
        err.code = 'RAK_SUPABASE_TIMEOUT';
        err.mode = mode || 'read';
        reject(err);
      }, ms);
    });
    return Promise.race([Promise.resolve(promise), timeout]).finally(() => {
      if (timer) clearTimeout(timer);
    });
  }

  async function runSupabaseOperation(label, work, options) {
    const opts = options || {};
    const mode = opts.mode === 'write' ? 'write' : 'read';
    const timeoutMs = Number(opts.timeoutMs) || (mode === 'write' ? SUPABASE_WRITE_TIMEOUT_MS : SUPABASE_READ_TIMEOUT_MS);
    const maxAttempts = Math.max(1, Math.min(2, Number(opts.attempts) || (mode === 'write' ? 2 : 1)));
    let lastErr = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const result = await withSupabaseTimeout(Promise.resolve().then(work), label, timeoutMs, mode);
        return result;
      } catch (err) {
        lastErr = err;
        const timeout = isSupabaseTimeoutError(err);
        if (timeout) {
          state.syncGuard.lastTimeoutAt = Date.now();
          if (mode === 'write') state.syncGuard.writeTimeouts += 1;
          else state.syncGuard.readTimeouts += 1;
        }
        const canRetry = attempt < maxAttempts && navigator.onLine && isLikelyTransientError(err);
        if (!canRetry) break;
        state.syncGuard.lastRetryAt = Date.now();
        if (mode === 'write') state.syncGuard.writeRetries += 1;
        else state.syncGuard.readRetries += 1;
        await wait(260 + (attempt * 240));
      }
    }

    if (mode === 'write') state.syncGuard.failedWrites += 1;
    else state.syncGuard.failedReads += 1;
    throw lastErr;
  }

  function rememberQueuedFallback() {
    state.syncGuard.queuedFallbacks += 1;
    state.syncGuard.lastQueuedFallbackAt = Date.now();
  }

  function shouldDeferOnlineWrite() {
    if (!navigator.onLine) return false;
    const queueLength = readQueue().length;
    if (!queueLength) return false;
    const lastQueued = Number(state.syncGuard.lastQueuedFallbackAt || 0);
    if (!lastQueued || Date.now() - lastQueued > SUPABASE_WRITE_COOLDOWN_MS) return false;
    state.syncGuard.cooldownSkips += 1;
    state.syncGuard.lastCooldownSkipAt = Date.now();
    return true;
  }

  async function upsertMachineSettingsDirect(client, rows) {
    let savedCount = 0;
    const list = Array.isArray(rows) ? rows : [];
    for (const row of list) {
      const settings = row && typeof row.settings_json === 'object' && row.settings_json !== null
        ? row.settings_json
        : (() => {
            try { return row && row.settings_json ? JSON.parse(String(row.settings_json)) : {}; }
            catch (err) { return {}; }
          })();

      const machineCode = String(row && (row.machine_code || row.machine) ? (row.machine_code || row.machine) : settings.machine || '').trim();
      const machineIndex = String(row && (row.machine_index || row.index) ? (row.machine_index || row.index) : settings.index || '').trim();
      const label = String(row && row.label ? row.label : '').trim() || (machineCode + (machineIndex ? '-' + machineIndex : ''));
      const category = String(row && row.category ? row.category : (String(machineCode).toUpperCase().startsWith('TBKR') ? 'brus' : (String(machineCode).toUpperCase().startsWith('TPKW') ? 'pracka' : 'frezka'))).trim();
      const machine_key = String(row && row.machine_key ? row.machine_key : (machineCode + (machineIndex ? '-' + machineIndex : ''))).trim();

      const cycleTime = row && row.cycle_time !== '' && row.cycle_time !== null && row.cycle_time !== undefined
        ? Number(row.cycle_time)
        : (row && row.speed !== '' && row.speed !== null && row.speed !== undefined ? Number(row.speed) : null);
      const dressTime = row && row.dress_time !== '' && row.dress_time !== null && row.dress_time !== undefined ? Number(row.dress_time) : null;
      const dressCount = row && row.dress_count !== '' && row.dress_count !== null && row.dress_count !== undefined ? parseInt(row.dress_count, 10) : null;
      const payload = {
        machine_key,
        machine_code: machineCode || null,
        machine_index: machineIndex || null,
        label,
        category,
        speed: cycleTime,
        cycle_time: cycleTime,
        dress_time: dressTime,
        dress_count: Number.isFinite(dressCount) ? dressCount : null,
        settings_json: {
          machine: machineCode,
          index: machineIndex,
          cycle_time: row && row.cycle_time !== '' && row.cycle_time !== null && row.cycle_time !== undefined ? String(row.cycle_time) : (row && row.speed !== '' && row.speed !== null && row.speed !== undefined ? String(row.speed) : ''),
          dress_time: row && row.dress_time !== '' && row.dress_time !== null && row.dress_time !== undefined ? String(row.dress_time) : '',
          dress_count: row && row.dress_count !== '' && row.dress_count !== null && row.dress_count !== undefined ? String(row.dress_count) : ''
        },
        updated_at: new Date().toISOString()
      };
      if (!payload.machine_key || !payload.label) continue;
      const { error } = await client.from('machine_settings').upsert([payload], { onConflict: 'machine_key' });
      if (error) throw error;
      savedCount += 1;
    }
    return savedCount;
  }

  async function upsertRotationStateDirect(client, rotation, meta) {
    const payload = rotation && typeof rotation === 'object' ? rotation : null;
    const row = {
      key: 'main',
      payload,
      meta: meta && typeof meta === 'object' ? meta : {},
      updated_at: new Date().toISOString()
    };
    const { error } = await client.from('rotation_state').upsert([row], { onConflict: 'key' });
    if (error) throw error;
    return row;
  }

  async function upsertRotationMonthEntriesDirect(client, monthStart, label, rows) {
    const monthRow = {
      month_start: monthStart,
      label: String(label || '').trim() || null,
      updated_at: new Date().toISOString()
    };
    const { error: monthErr } = await client.from('rotation_months').upsert([monthRow], { onConflict: 'month_start' });
    if (monthErr) throw monthErr;

    const { error: deleteErr } = await client.from('rotation_entries').delete().eq('month_start', monthStart);
    if (deleteErr) throw deleteErr;

    const payloadRows = (Array.isArray(rows) ? rows : []).map((row, idx) => ({
      month_start: monthStart,
      employee_name: String(row && row.employee_name ? row.employee_name : '').trim(),
      target_machine: String(row && row.target_machine ? row.target_machine : '').trim() || null,
      assignment_type: String(row && row.assignment_type ? row.assignment_type : 'work').trim(),
      shift_code: String(row && row.shift_code ? row.shift_code : '').trim() || null,
      note: String(row && row.note ? row.note : '').trim() || null,
      row_order: Number.isFinite(Number(row && row.row_order)) ? Number(row.row_order) : idx
    })).filter(row => row.employee_name || row.target_machine || row.shift_code || row.note || row.assignment_type !== 'work');
    let inserted = 0;
    if (payloadRows.length) {
      const { error: insertErr } = await client.from('rotation_entries').insert(payloadRows);
      if (insertErr) throw insertErr;
      inserted = payloadRows.length;
    }
    return { months: 1, entries: inserted };
  }

  async function upsertGomokuWinDirect(client, entry) {
    const payload = {
      player_name: String(entry && entry.name ? entry.name : '').trim(),
      difficulty: String(entry && entry.difficulty ? entry.difficulty : '').trim(),
      moves: Number(entry && entry.totalMoves ? entry.totalMoves : 0) || 0,
      app_version: String(window.APP_VERSION || '').trim(),
      elapsed_ms: Number(entry && entry.elapsedMs ? entry.elapsedMs : 0) || 0,
      elapsed_text: String(entry && entry.elapsedText ? entry.elapsedText : '').trim(),
      x_moves: Number(entry && entry.xMoves ? entry.xMoves : 0) || 0,
      o_moves: Number(entry && entry.oMoves ? entry.oMoves : 0) || 0
    };
    const { data, error } = await client.from('gomoku_wins').insert([payload]).select('*');
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }


  function normalizeInviteCode(code) {
    return String(code || '').trim().toUpperCase();
  }

  function gameSessionCacheKey(code) {
    return LOCAL_GAME_SESSIONS_PREFIX + encodeURIComponent(normalizeInviteCode(code));
  }

  function readGameSessionCache(code) {
    const inviteCode = normalizeInviteCode(code);
    if (!inviteCode) return null;
    const cache = readTimedCache(gameSessionCacheKey(inviteCode), SUPABASE_GAME_CACHE_TTL_MS);
    if (!cache || !cache.rows || !cache.rows[0]) return null;
    rememberTimedCacheHit('session', cache);
    return Object.assign({ inviteCode, fresh: cache.fresh, savedAt: cache.savedAt, age: cache.age }, cache.rows[0]);
  }

  function writeGameSessionCache(code, invite, session) {
    const inviteCode = normalizeInviteCode(code || (invite && invite.invite_code));
    if (!inviteCode) return false;
    return writeTimedCache(gameSessionCacheKey(inviteCode), [{
      inviteCode,
      invite: invite || null,
      session: session || null,
      status: session && session.status ? session.status : '',
      updatedAt: Date.now(),
      source: 'game_sessions'
    }], 'session');
  }

  function buildCachedSessionResult(code, fallbackPayload) {
    const inviteCode = normalizeInviteCode(code);
    const cached = readGameSessionCache(inviteCode);
    const payload = fallbackPayload && typeof fallbackPayload === 'object' ? fallbackPayload : null;
    if (!cached && !payload) return { ok: false, reason: 'offline-or-missing-client' };
    const cachedSession = cached && cached.session && typeof cached.session === 'object' ? cached.session : null;
    const cachedInvite = cached && cached.invite ? cached.invite : null;
    if (!payload && cached && !cachedSession) {
      state.cacheGuard.sessionFallbacks += 1;
      return { ok: true, invite: cachedInvite, session: null, cached: true, offline: !navigator.onLine };
    }
    const baseSession = cachedSession || {};
    const boardState = payload || baseSession.board_state || {};
    const session = Object.assign({}, baseSession, {
      game_type: baseSession.game_type || 'gomoku',
      invite_id: baseSession.invite_id || (cachedInvite && cachedInvite.id ? cachedInvite.id : null),
      status: boardState.status || baseSession.status || 'active',
      board_state: boardState,
      move_history: Array.isArray(boardState.moveHistory) ? boardState.moveHistory : (Array.isArray(baseSession.move_history) ? baseSession.move_history : []),
      updated_at: new Date().toISOString(),
      finished_at: boardState.gameOver ? new Date().toISOString() : (baseSession.finished_at || null),
      _local_only: true
    });
    if (payload) writeGameSessionCache(inviteCode, cachedInvite, session);
    state.cacheGuard.sessionFallbacks += 1;
    return {
      ok: true,
      invite: cachedInvite,
      session,
      status: session.status,
      cached: !!cached,
      queued: !!payload,
      offline: !navigator.onLine
    };
  }


  async function loadGameInviteByCode(client, code) {
    const inviteCode = String(code || '').trim().toUpperCase();
    if (!inviteCode) return { ok: false, error: new Error('Chybí kód pozvánky.') };
    const { data, error } = await runSupabaseOperation('game_invites.lookup', () => client
      .from('game_invites')
      .select('*')
      .eq('invite_code', inviteCode)
      .maybeSingle(), { mode: 'read' });
    if (error) throw error;
    return { ok: true, invite: data || null };
  }

  async function createGameInviteDirect(client, payload) {
    const inviteCode = String(payload && payload.code ? payload.code : '').trim().toUpperCase();
    if (!inviteCode) throw new Error('Chybí kód pozvánky.');
    const inviterAccountNumber = String(payload && payload.inviterAccountNumber ? payload.inviterAccountNumber : '').trim() || null;
    const boardState = payload && payload.boardState && typeof payload.boardState === 'object' ? payload.boardState : { board: Array(180).fill(''), turn: 'X', status: 'waiting' };
    const inviteRow = {
      game_type: 'gomoku',
      inviter_account_number: inviterAccountNumber,
      invitee_account_number: null,
      invite_code: inviteCode,
      status: 'pending',
      expires_at: null,
      payload: payload && payload.payload && typeof payload.payload === 'object' ? payload.payload : {}
    };
    const { data: inviteData, error: inviteErr } = await runSupabaseOperation('game_invites.create', () => client
      .from('game_invites')
      .insert([inviteRow])
      .select('*')
      .maybeSingle(), { mode: 'write' });
    if (inviteErr) throw inviteErr;
    const sessionRow = {
      game_type: 'gomoku',
      invite_id: inviteData && inviteData.id ? inviteData.id : null,
      player_x_account_number: inviterAccountNumber,
      player_o_account_number: null,
      winner_account_number: null,
      status: 'waiting',
      board_state: boardState,
      move_history: [],
      updated_at: new Date().toISOString()
    };
    const { data: sessionData, error: sessionErr } = await runSupabaseOperation('game_sessions.create', () => client
      .from('game_sessions')
      .insert([sessionRow])
      .select('*')
      .maybeSingle(), { mode: 'write' });
    if (sessionErr) throw sessionErr;
    writeGameSessionCache(inviteCode, inviteData || null, sessionData || null);
    return { invite: inviteData || null, session: sessionData || null };
  }

  async function acceptGameInviteDirect(client, code, inviteeAccountNumber) {
    const inviteCode = String(code || '').trim().toUpperCase();
    const invitee = String(inviteeAccountNumber || '').trim() || null;
    const loaded = await loadGameInviteByCode(client, inviteCode);
    if (!loaded.invite) throw new Error('Pozvánka nenalezena.');
    const invite = loaded.invite;
    const { data: sessionData, error: sessionLookupErr } = await runSupabaseOperation('game_sessions.lookup_for_accept', () => client
      .from('game_sessions')
      .select('*')
      .eq('invite_id', invite.id)
      .maybeSingle(), { mode: 'read' });
    if (sessionLookupErr) throw sessionLookupErr;
    const nextInvite = {
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      invitee_account_number: invitee
    };
    const { data: updatedInvite, error: inviteUpdErr } = await runSupabaseOperation('game_invites.accept', () => client
      .from('game_invites')
      .update(nextInvite)
      .eq('id', invite.id)
      .select('*')
      .maybeSingle(), { mode: 'write' });
    if (inviteUpdErr) throw inviteUpdErr;
    const boardState = sessionData && sessionData.board_state && typeof sessionData.board_state === 'object' ? sessionData.board_state : { board: Array(180).fill(''), turn: 'X', status: 'active' };
    boardState.status = 'active';
    boardState.acceptedAt = new Date().toISOString();
    const sessionRow = {
      game_type: 'gomoku',
      invite_id: invite.id,
      player_x_account_number: invite.inviter_account_number || null,
      player_o_account_number: invitee,
      winner_account_number: null,
      status: 'active',
      board_state: boardState,
      move_history: Array.isArray(sessionData && sessionData.move_history) ? sessionData.move_history : [],
      updated_at: new Date().toISOString()
    };
    const { data: updatedSession, error: sessionUpdErr } = await runSupabaseOperation('game_sessions.accept_upsert', () => client
      .from('game_sessions')
      .upsert([Object.assign({ id: sessionData && sessionData.id ? sessionData.id : undefined }, sessionRow)], { onConflict: 'invite_id' })
      .select('*')
      .maybeSingle(), { mode: 'write' });
    if (sessionUpdErr) throw sessionUpdErr;
    writeGameSessionCache(inviteCode, updatedInvite || invite, updatedSession || sessionData || null);
    return { invite: updatedInvite || invite, session: updatedSession || sessionData || null };
  }

  async function loadGameSessionByInviteCodeDirect(client, code) {
    const loaded = await loadGameInviteByCode(client, code);
    if (!loaded.invite) return { ok: false, invite: null, session: null };
    const { data: sessionData, error: sessionErr } = await runSupabaseOperation('game_sessions.lookup_by_invite', () => client
      .from('game_sessions')
      .select('*')
      .eq('invite_id', loaded.invite.id)
      .maybeSingle(), { mode: 'read' });
    if (sessionErr) throw sessionErr;
    writeGameSessionCache(code, loaded.invite, sessionData || null);
    return { ok: true, invite: loaded.invite, session: sessionData || null };
  }

  async function saveGameSessionByInviteCodeDirect(client, code, payload) {
    const loaded = await loadGameInviteByCode(client, code);
    if (!loaded.invite) throw new Error('Pozvánka nenalezena.');
    const { data: sessionData, error: sessionErr } = await runSupabaseOperation('game_sessions.lookup_by_invite', () => client
      .from('game_sessions')
      .select('*')
      .eq('invite_id', loaded.invite.id)
      .maybeSingle(), { mode: 'read' });
    if (sessionErr) throw sessionErr;
    const boardState = payload && typeof payload === 'object' ? payload : {};
    const sessionRow = {
      game_type: 'gomoku',
      invite_id: loaded.invite.id,
      player_x_account_number: sessionData && sessionData.player_x_account_number ? sessionData.player_x_account_number : loaded.invite.inviter_account_number || null,
      player_o_account_number: sessionData && sessionData.player_o_account_number ? sessionData.player_o_account_number : loaded.invite.invitee_account_number || null,
      winner_account_number: boardState.winnerAccountNumber || sessionData && sessionData.winner_account_number || null,
      status: boardState.status || sessionData && sessionData.status || 'active',
      board_state: boardState,
      move_history: Array.isArray(boardState.moveHistory) ? boardState.moveHistory : (Array.isArray(sessionData && sessionData.move_history) ? sessionData.move_history : []),
      updated_at: new Date().toISOString(),
      finished_at: boardState.gameOver ? new Date().toISOString() : (sessionData && sessionData.finished_at ? sessionData.finished_at : null)
    };
    const { data: updatedSession, error: updErr } = await runSupabaseOperation('game_sessions.save_by_invite', () => client
      .from('game_sessions')
      .upsert([Object.assign({ id: sessionData && sessionData.id ? sessionData.id : undefined }, sessionRow)], { onConflict: 'invite_id' })
      .select('*')
      .maybeSingle(), { mode: 'write' });
    if (updErr) throw updErr;
    writeGameSessionCache(code, loaded.invite, updatedSession || sessionRow);
    return { ok: true, invite: loaded.invite, session: updatedSession || null, status: sessionRow.status };
  }


  function getNextQueueRetryAt(queue) {
    const times = (Array.isArray(queue) ? queue : [])
      .map((task) => {
        const lastTriedAt = Number(task && task.lastTriedAt ? task.lastTriedAt : 0);
        const delay = getQueueRetryDelay(task);
        return lastTriedAt && delay ? lastTriedAt + delay : 0;
      })
      .filter(Boolean);
    if (!times.length) return null;
    return Math.min.apply(Math, times);
  }

  function scheduleSupabaseQueueFlush(reason, delayMs) {
    if (flushScheduleTimer || flushPromise || !navigator.onLine) return false;
    const ms = Math.max(350, Math.min(60000, Number(delayMs) || SUPABASE_QUEUE_FLUSH_IDLE_DELAY_MS));
    state.syncGuard.queueFlushScheduled += 1;
    state.syncGuard.lastQueueScheduleAt = Date.now();
    flushScheduleTimer = setTimeout(() => {
      flushScheduleTimer = null;
      if (navigator.onLine) void flushPendingWrites();
    }, ms);
    return true;
  }

  function shouldDeferQueueFlushForHiddenPage() {
    return !!(typeof document !== 'undefined'
      && document.visibilityState === 'hidden'
      && typeof navigator !== 'undefined'
      && navigator.onLine);
  }

  function requestSupabaseQueueWake(reason, delayMs) {
    const now = Date.now();
    if (now - lastQueueWakeRequestAt < SUPABASE_QUEUE_WAKE_GUARD_MS) {
      state.syncGuard.queueWakeSkips += 1;
      state.syncGuard.lastQueueWakeSkipAt = now;
      return false;
    }
    lastQueueWakeRequestAt = now;
    state.syncGuard.queueWakeRequests += 1;
    state.syncGuard.lastQueueWakeAt = now;

    if (!navigator.onLine) {
      state.syncGuard.queueWakeOfflineSkips += 1;
      return false;
    }

    const hadRealtimeChannel = !!state.realtimeChannel;
    bindRealtimeSubscriptions();
    if (!hadRealtimeChannel && state.realtimeChannel) {
      state.syncGuard.realtimeWakeBinds += 1;
      state.syncGuard.lastRealtimeWakeBindAt = now;
    }

    const queue = readQueue();
    if (!queue.length) {
      state.syncGuard.queueWakeNoops += 1;
      return false;
    }

    if (shouldDeferQueueFlushForHiddenPage()) {
      state.syncGuard.queueHiddenDefers += 1;
      state.syncGuard.lastQueueHiddenDeferAt = now;
      return scheduleSupabaseQueueFlush('wake-hidden-' + String(reason || 'resume'), SUPABASE_QUEUE_HIDDEN_RETRY_DELAY_MS);
    }

    const nextRetryAt = getNextQueueRetryAt(queue);
    const retryDelay = nextRetryAt && nextRetryAt > now ? nextRetryAt - now : 0;
    const wakeDelay = retryDelay || delayMs || 450;
    return scheduleSupabaseQueueFlush('wake-' + String(reason || 'resume'), wakeDelay);
  }

  async function flushPendingWrites() {
    if (flushPromise) return flushPromise;
    flushPromise = (async () => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client', remaining: readQueue().length };

      const queue = readQueue();
      if (!queue.length) return { ok: true, flushed: 0, remaining: 0 };

      if (shouldDeferQueueFlushForHiddenPage()) {
        state.syncGuard.queueHiddenDefers += 1;
        state.syncGuard.lastQueueHiddenDeferAt = Date.now();
        scheduleSupabaseQueueFlush('hidden-page', SUPABASE_QUEUE_HIDDEN_RETRY_DELAY_MS);
        return { ok: true, deferred: true, reason: 'document-hidden', remaining: queue.length };
      }

      state.syncGuard.queueFlushRuns += 1;
      state.syncGuard.lastQueueFlushAt = Date.now();

      let flushed = 0;
      let dropped = 0;
      let attempted = 0;
      let batchStopped = false;
      const remaining = [];
      for (let i = 0; i < queue.length; i += 1) {
        if (attempted >= SUPABASE_QUEUE_FLUSH_BATCH_SIZE) {
          batchStopped = true;
          state.syncGuard.queueFlushBatchStops += 1;
          remaining.push(...queue.slice(i));
          break;
        }
        const originalTask = queue[i];
        if (shouldSkipQueuedTaskForBackoff(originalTask)) {
          remaining.push(originalTask);
          continue;
        }
        const task = markQueuedTaskAttempt(originalTask);
        attempted += 1;
        try {
          if (task.type === 'rotation_state') {
            await runSupabaseOperation('queue.rotation_state', () => upsertRotationStateDirect(client, task.rotation, task.meta), { mode: 'write' });
            flushed += 1;
          } else if (task.type === 'machine_settings') {
            await runSupabaseOperation('queue.machine_settings', () => upsertMachineSettingsDirect(client, task.rows), { mode: 'write' });
            flushed += 1;
          } else if (task.type === 'rotation_month_entries') {
            await runSupabaseOperation('queue.rotation_month_entries', () => upsertRotationMonthEntriesDirect(client, task.monthStart, task.label, task.rows), { mode: 'write' });
            flushed += 1;
          } else if (task.type === 'gomoku_win') {
            await runSupabaseOperation('queue.gomoku_win', () => upsertGomokuWinDirect(client, task.entry), { mode: 'write' });
            flushed += 1;
          } else if (task.type === 'game_stat') {
            await saveGameStatDirect(client, task.entry);
            flushed += 1;
          } else if (task.type === 'game_ui_settings') {
            await saveGameAccountUiSettingsDirect(client, task.entry);
            flushed += 1;
          } else if (task.type === 'game_session') {
            await saveGameSessionByInviteCodeDirect(client, task.inviteCode || task.code, task.payload);
            flushed += 1;
          } else {
            const failedUnknown = markQueuedTaskFailure(task, new Error('Neznámý typ úlohy ve frontě: ' + String(task.type || '')));
            if (shouldDropInvalidQueuedTask(failedUnknown, new Error('invalid queue task'))) {
              dropped += 1;
              state.syncGuard.queueDroppedInvalid += 1;
            } else {
              remaining.push(failedUnknown);
            }
          }
        } catch (err) {
          const failedTask = markQueuedTaskFailure(task, err);
          state.syncGuard.queueFlushErrors += 1;
          state.syncGuard.lastQueueErrorAt = Date.now();
          if (shouldDropInvalidQueuedTask(failedTask, err)) {
            dropped += 1;
            state.syncGuard.queueDroppedInvalid += 1;
            console.warn('Supabase queued sync dropped invalid task', err);
            continue;
          }
          if (isLikelyOfflineError(err)) {
            remaining.push(failedTask, ...queue.slice(i + 1));
            break;
          }
          console.warn('Supabase queued sync failed', err);
          remaining.push(failedTask, ...queue.slice(i + 1));
          break;
        }
      }
      writeQueue(remaining);
      const nextRetryAt = getNextQueueRetryAt(remaining);
      state.syncGuard.queueNextRetryAt = nextRetryAt;
      if (!attempted && remaining.length) state.syncGuard.queueFlushEmptyRuns += 1;
      if (flushed > 0) {
        state.syncGuard.queueFlushSuccesses += 1;
        state.syncGuard.lastQueueSuccessAt = Date.now();
      }
      if (remaining.length === 0) state.lastError = null;
      else if (navigator.onLine && (batchStopped || flushed > 0 || dropped > 0 || (!attempted && nextRetryAt))) {
        const delay = nextRetryAt ? Math.max(SUPABASE_QUEUE_FLUSH_IDLE_DELAY_MS, nextRetryAt - Date.now()) : SUPABASE_QUEUE_FLUSH_IDLE_DELAY_MS;
        scheduleSupabaseQueueFlush('remaining-queue', delay);
      }
      return { ok: true, flushed, dropped, remaining: remaining.length, nextRetryAt, batchStopped };
    })().finally(() => {
      flushPromise = null;
    });
    return flushPromise;
  }

  async function enqueueAndMaybeFlush(task) {
    rememberQueuedFallback();
    const queuedTask = enqueueTask(task);
    if (!queuedTask) {
      return { ok: false, queued: false, reason: 'queue-guard-rejected', remaining: readQueue().length };
    }
    if (navigator.onLine) {
      scheduleSupabaseQueueFlush('enqueue');
    }
    return { ok: true, queued: true, remaining: readQueue().length };
  }

  async function seedFromLocalSnapshot(rotation, machineSettingsRows) {
    saveLocalSnapshot(rotation, machineSettingsRows);
    if (!navigator.onLine || !getClient()) {
      enqueueTask({ type: 'rotation_state', rotation, meta: { source: 'local-seed' } });
      if (Array.isArray(machineSettingsRows) && machineSettingsRows.length) {
        enqueueTask({ type: 'machine_settings', rows: machineSettingsRows });
      }
      return { ok: true, queued: true, seeded: true };
    }
    try {
      const client = getClient();
      await runSupabaseOperation('local_seed.rotation_state', () => upsertRotationStateDirect(client, rotation, { source: 'local-seed' }), { mode: 'write' });
      if (Array.isArray(machineSettingsRows) && machineSettingsRows.length) {
        await runSupabaseOperation('local_seed.machine_settings', () => upsertMachineSettingsDirect(client, machineSettingsRows), { mode: 'write' });
      }
      await flushPendingWrites();
      return { ok: true, seeded: true, queued: false };
    } catch (err) {
      console.warn('Supabase seed from local snapshot failed', err);
      enqueueTask({ type: 'rotation_state', rotation, meta: { source: 'local-seed' } });
      if (Array.isArray(machineSettingsRows) && machineSettingsRows.length) {
        enqueueTask({ type: 'machine_settings', rows: machineSettingsRows });
      }
      return { ok: true, queued: true, seeded: true, reason: 'fallback' };
    }
  }

  async function refreshPublicData() {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        const announcementsRes = await runSupabaseOperation('announcements.refresh', () => client
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5), { mode: 'read' });

        if (announcementsRes && !announcementsRes.error) {
          state.announcements = Array.isArray(announcementsRes.data) ? announcementsRes.data : [];
          safeWriteJson(LOCAL_ANNOUNCEMENTS_KEY, state.announcements);
        }
        state.ready = true;
        state.lastError = null;
      } else {
        const cachedAnnouncements = safeReadJson(LOCAL_ANNOUNCEMENTS_KEY, []);
        if (Array.isArray(cachedAnnouncements) && cachedAnnouncements.length) {
          state.announcements = cachedAnnouncements;
        }
        state.ready = true;
      }

      if (typeof forceHomeRefresh === 'function') forceHomeRefresh();
      if (typeof window.__rotaceBootHomeRefreshLate === 'function') window.__rotaceBootHomeRefreshLate();
      else {
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof updateFoodTile === 'function') updateFoodTile();
        if (typeof updateEportalTile === 'function') updateEportalTile();
      }

      return { announcements: state.announcements };
    } catch (err) {
      state.lastError = err;
      console.warn('Supabase public data refresh failed', err);
      const cachedAnnouncements = safeReadJson(LOCAL_ANNOUNCEMENTS_KEY, []);
      if (Array.isArray(cachedAnnouncements) && cachedAnnouncements.length) {
        state.announcements = cachedAnnouncements;
      }
      state.ready = true;
      return { announcements: state.announcements, cached: true };
    }
  }

  function monthKeyToMonthStart(monthKey) {
    const match = /^(\d{1,2})\/(\d{2})$/.exec(String(monthKey || '').trim());
    if (!match) return null;
    const month = Math.max(1, Math.min(12, parseInt(match[1], 10) || 1));
    const year = 2000 + (parseInt(match[2], 10) || 0);
    return `${year}-${String(month).padStart(2, '0')}-01`;
  }


  function monthStartToMonthKey(monthStart) {
    const raw = String(monthStart || '').trim();
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (!m) return raw ? raw : '';
    return String(Number(m[2])) + '/' + String(m[1]).slice(-2);
  }

  function rebuildRotationFromTables(monthRows, entryRows) {
    const months = {};
    const hardMachines = Array.isArray(window.HARD_MACHINE_HEADERS) ? window.HARD_MACHINE_HEADERS.slice() : [];
    const softMachines = Array.isArray(window.SOFT_MACHINE_HEADERS) ? window.SOFT_MACHINE_HEADERS.slice() : [];
    const rowsByMonthKey = new Map();

    (Array.isArray(monthRows) ? monthRows : []).forEach(row => {
      const monthKey = String(row && row.label ? row.label : monthStartToMonthKey(row && row.month_start ? row.month_start : '')).trim();
      if (!monthKey) return;
      months[monthKey] = {
        hard: { title: 'Rotace tvrdota', machines: hardMachines.slice(), rows: [] },
        soft: { title: 'Rotace měkota', machines: softMachines.slice(), rows: [] },
        notes: []
      };
      rowsByMonthKey.set(String(row && row.month_start ? row.month_start : '').trim() || monthKey, monthKey);
    });

    const ensureMonth = (monthKey) => {
      if (!months[monthKey]) {
        months[monthKey] = {
          hard: { title: 'Rotace tvrdota', machines: hardMachines.slice(), rows: [] },
          soft: { title: 'Rotace měkota', machines: softMachines.slice(), rows: [] },
          notes: []
        };
      }
      return months[monthKey];
    };

    const grouped = { hard: new Map(), soft: new Map() };

    (Array.isArray(entryRows) ? entryRows : []).forEach(entry => {
      const monthKey = rowsByMonthKey.get(String(entry && entry.month_start ? entry.month_start : '').trim()) || monthStartToMonthKey(entry && entry.month_start ? entry.month_start : '');
      if (!monthKey) return;
      const month = ensureMonth(monthKey);
      const type = String(entry && entry.assignment_type ? entry.assignment_type : '').trim();

      if (type === 'note') {
        const note = {
          date: String(entry && entry.shift_code ? entry.shift_code : '').trim(),
          person: String(entry && entry.employee_name ? entry.employee_name : '').trim(),
          code: String(entry && entry.target_machine ? entry.target_machine : '').trim(),
          shift: '',
          text: String(entry && entry.note ? entry.note : '').trim()
        };
        if (note.date || note.person || note.code || note.text) month.notes.push(note);
        return;
      }

      const section = type === 'soft' ? 'soft' : 'hard';
      const machineList = section === 'hard' ? hardMachines : softMachines;
      const rowIndex = Math.floor(Number(entry && entry.row_order ? entry.row_order : 0) / 100);
      const rowKey = [monthKey, section, String(entry && entry.shift_code ? entry.shift_code : '').trim(), String(rowIndex)].join('||');
      const cidx = machineList.indexOf(String(entry && entry.target_machine ? entry.target_machine : '').trim());

      if (!grouped[section].has(rowKey)) {
        grouped[section].set(rowKey, {
          date: String(entry && entry.shift_code ? entry.shift_code : '').trim(),
          cells: Array(machineList.length).fill(''),
          _order: rowIndex
        });
      }
      const row = grouped[section].get(rowKey);
      if (cidx >= 0) row.cells[cidx] = String(entry && entry.employee_name ? entry.employee_name : '').trim();
    });

    Object.entries(grouped).forEach(([section, map]) => {
      const rows = Array.from(map.values()).sort((a, b) => a._order - b._order || String(a.date || '').localeCompare(String(b.date || ''), 'cs'));
      rows.forEach(row => { delete row._order; });
      Object.values(months).forEach(m => {
        m[section].rows = rows.filter(r => true);
      });
    });

    // Re-run per month to assign the correct rows only to each month.
    Object.keys(months).forEach(monthKey => {
      ['hard', 'soft'].forEach(section => { months[monthKey][section].rows = []; });
    });

    (Array.isArray(entryRows) ? entryRows : []).forEach(entry => {
      const monthKey = rowsByMonthKey.get(String(entry && entry.month_start ? entry.month_start : '').trim()) || monthStartToMonthKey(entry && entry.month_start ? entry.month_start : '');
      if (!monthKey) return;
      const type = String(entry && entry.assignment_type ? entry.assignment_type : '').trim();
      if (type === 'note') return;
      const section = type === 'soft' ? 'soft' : 'hard';
      const machineList = section === 'hard' ? hardMachines : softMachines;
      const rowIndex = Math.floor(Number(entry && entry.row_order ? entry.row_order : 0) / 100);
      const rowKey = [monthKey, section, String(entry && entry.shift_code ? entry.shift_code : '').trim(), String(rowIndex)].join('||');
      const cidx = machineList.indexOf(String(entry && entry.target_machine ? entry.target_machine : '').trim());
      const month = ensureMonth(monthKey);
      if (!month[section]._map) month[section]._map = new Map();
      if (!month[section]._map.has(rowKey)) {
        month[section]._map.set(rowKey, { date: String(entry && entry.shift_code ? entry.shift_code : '').trim(), cells: Array(machineList.length).fill(''), _order: rowIndex });
      }
      const row = month[section]._map.get(rowKey);
      if (cidx >= 0) row.cells[cidx] = String(entry && entry.employee_name ? entry.employee_name : '').trim();
    });

    Object.entries(months).forEach(([monthKey, month]) => {
      ['hard', 'soft'].forEach(section => {
        const map = month[section]._map || new Map();
        month[section].rows = Array.from(map.values()).sort((a, b) => a._order - b._order || String(a.date || '').localeCompare(String(b.date || ''), 'cs'));
        month[section].rows.forEach(row => { delete row._order; });
        delete month[section]._map;
      });
      month.notes = (month.notes || []).sort((a, b) => String(a.date || '').localeCompare(String(b.date || ''), 'cs') || String(a.person || '').localeCompare(String(b.person || ''), 'cs'));
    });

    return { months };
  }


  function defaultMachineSettingsRows() {
    return [
      { machine_key: 'FREZKY', machine_code: 'FREZKY', machine_index: '', label: 'Frezky', category: 'frezka', cycle_time: null, dress_time: null, dress_count: null, settings_json: { machine: 'FREZKY', index: '', cycle_time: '', dress_time: '', dress_count: '' } },
      { machine_key: 'TPKW01', machine_code: 'TPKW01', machine_index: '', label: 'Pračka', category: 'pracka', cycle_time: null, dress_time: null, dress_count: null, settings_json: { machine: 'TPKW01', index: '', cycle_time: '', dress_time: '', dress_count: '' } },
      { machine_key: 'TBKR01-AD', machine_code: 'TBKR01', machine_index: 'AD', label: 'TBKR01-AD', category: 'brus', cycle_time: 58.2, dress_time: 323, dress_count: 59, settings_json: { machine: 'TBKR01', index: 'AD', cycle_time: '58.2', dress_time: '323', dress_count: '59' } },
      { machine_key: 'TBKR01-AE', machine_code: 'TBKR01', machine_index: 'AE', label: 'TBKR01-AE', category: 'brus', cycle_time: 57.0, dress_time: 240, dress_count: 58, settings_json: { machine: 'TBKR01', index: 'AE', cycle_time: '57.0', dress_time: '240', dress_count: '58' } },
      { machine_key: 'TBKR01-AH', machine_code: 'TBKR01', machine_index: 'AH', label: 'TBKR01-AH', category: 'brus', cycle_time: 66.0, dress_time: 400, dress_count: 87, settings_json: { machine: 'TBKR01', index: 'AH', cycle_time: '66.0', dress_time: '400', dress_count: '87' } },
      { machine_key: 'TBKR01-AD volné', machine_code: 'TBKR01', machine_index: 'AD volné', label: 'TBKR01-AD volné', category: 'brus', cycle_time: 62.7, dress_time: 240, dress_count: 45, settings_json: { machine: 'TBKR01', index: 'AD volné', cycle_time: '62.7', dress_time: '240', dress_count: '45' } },
      { machine_key: 'TBKR01-AE volné', machine_code: 'TBKR01', machine_index: 'AE volné', label: 'TBKR01-AE volné', category: 'brus', cycle_time: 60.0, dress_time: 240, dress_count: 45, settings_json: { machine: 'TBKR01', index: 'AE volné', cycle_time: '60.0', dress_time: '240', dress_count: '45' } },
      { machine_key: 'TBKR07-AD', machine_code: 'TBKR07', machine_index: 'AD', label: 'TBKR07-AD', category: 'brus', cycle_time: 58.2, dress_time: 298, dress_count: 59, settings_json: { machine: 'TBKR07', index: 'AD', cycle_time: '58.2', dress_time: '298', dress_count: '59' } },
      { machine_key: 'TBKR07-AE', machine_code: 'TBKR07', machine_index: 'AE', label: 'TBKR07-AE', category: 'brus', cycle_time: 56.4, dress_time: 325, dress_count: 59, settings_json: { machine: 'TBKR07', index: 'AE', cycle_time: '56.4', dress_time: '325', dress_count: '59' } },
      { machine_key: 'TBKR07-AH', machine_code: 'TBKR07', machine_index: 'AH', label: 'TBKR07-AH', category: 'brus', cycle_time: 63.0, dress_time: 240, dress_count: 65, settings_json: { machine: 'TBKR07', index: 'AH', cycle_time: '63.0', dress_time: '240', dress_count: '65' } },
      { machine_key: 'TBKR07-AD volné', machine_code: 'TBKR07', machine_index: 'AD volné', label: 'TBKR07-AD volné', category: 'brus', cycle_time: 60.3, dress_time: 240, dress_count: 45, settings_json: { machine: 'TBKR07', index: 'AD volné', cycle_time: '60.3', dress_time: '240', dress_count: '45' } },
      { machine_key: 'TBKR07-AE volné', machine_code: 'TBKR07', machine_index: 'AE volné', label: 'TBKR07-AE volné', category: 'brus', cycle_time: 60.0, dress_time: 240, dress_count: 45, settings_json: { machine: 'TBKR07', index: 'AE volné', cycle_time: '60.0', dress_time: '240', dress_count: '45' } }
    ];
  }

  async function loadMachineSettings() {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        const { data, error } = await runSupabaseOperation('machine_settings.load', () => client
          .from('machine_settings')
          .select('*')
          .order('category', { ascending: true })
          .order('machine_key', { ascending: true }), { mode: 'read' });
        if (error) throw error;
        const rows = Array.isArray(data) ? data : [];
        if (rows.length) {
          state.machineSettingsSnapshot = rows;
          state.lastError = null;
          saveLocalSnapshot(state.rotationSnapshot || null, rows);
          return rows;
        }
      }
    } catch (err) {
      state.lastError = err;
      console.error('Supabase machine settings load failed', err);
    }
    const cached = readLocalSnapshot();
    if (cached && Array.isArray(cached.machineSettingsRows) && cached.machineSettingsRows.length) {
      state.machineSettingsSnapshot = cached.machineSettingsRows;
      state.lastError = null;
      return cached.machineSettingsRows;
    }
    const defaults = defaultMachineSettingsRows();
    state.machineSettingsSnapshot = defaults;
    state.lastError = null;
    saveLocalSnapshot(state.rotationSnapshot || null, defaults);
    return defaults;
  }

  async function saveMachineSettings(rows) {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        if (shouldDeferOnlineWrite()) return Object.assign(await enqueueAndMaybeFlush({ type: 'machine_settings', rows }), { savedCount: Array.isArray(rows) ? rows.length : 0, deferred: true });
        const savedCount = await runSupabaseOperation('machine_settings.save', () => upsertMachineSettingsDirect(client, rows), { mode: 'write' });
        state.machineSettingsSnapshot = Array.isArray(rows) ? rows : [];
        saveLocalSnapshot(state.rotationSnapshot || null, rows);
        await flushPendingWrites();
        return { ok: true, savedCount, queued: false };
      }
      return Object.assign(await enqueueAndMaybeFlush({ type: 'machine_settings', rows }), { savedCount: Array.isArray(rows) ? rows.length : 0 });
    } catch (err) {
      state.lastError = err;
      console.error('Supabase machine settings save failed', err);
      if (isLikelyOfflineError(err)) {
        return await enqueueAndMaybeFlush({ type: 'machine_settings', rows });
      }
      return { ok: false, error: err };
    }
  }

  async function loadRotationMonthEntries(monthStart) {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        const { data, error } = await runSupabaseOperation('rotation_entries.load', () => client
          .from('rotation_entries')
          .select('*')
          .eq('month_start', monthStart)
          .order('row_order', { ascending: true })
          .order('employee_name', { ascending: true }), { mode: 'read' });
        if (error) throw error;
        return Array.isArray(data) ? data : [];
      }
    } catch (err) {
      state.lastError = err;
      console.error('Supabase rotation entries load failed', err);
    }
    return [];
  }

  async function saveRotationMonthEntries(monthStart, label, rows) {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        if (shouldDeferOnlineWrite()) return Object.assign(await enqueueAndMaybeFlush({ type: 'rotation_month_entries', monthStart, label, rows }), { months: 1, entries: Array.isArray(rows) ? rows.length : 0, deferred: true });
        const summary = await runSupabaseOperation('rotation_entries.save', () => upsertRotationMonthEntriesDirect(client, monthStart, label, rows), { mode: 'write' });
        await flushPendingWrites();
        return { ok: true, queued: false, months: summary.months, entries: summary.entries };
      }
      return Object.assign(await enqueueAndMaybeFlush({ type: 'rotation_month_entries', monthStart, label, rows }), { months: 1, entries: Array.isArray(rows) ? rows.length : 0 });
    } catch (err) {
      state.lastError = err;
      console.error('Supabase rotation entries save failed', err);
      if (isLikelyOfflineError(err)) {
        return await enqueueAndMaybeFlush({ type: 'rotation_month_entries', monthStart, label, rows });
      }
      return { ok: false, error: err };
    }
  }

  async function loadGameAccountsDirect(client, options) {
    const opts = options || {};
    const cache = readTimedCache(LOCAL_GAME_ACCOUNTS_KEY, SUPABASE_GAME_CACHE_TTL_MS);
    if (opts.preferCache && cache && cache.fresh) {
      rememberTimedCacheHit('accounts', cache);
      return cache.rows;
    }
    try {
      const { data, error } = await runSharedSupabaseRead('game_accounts.load', () => runSupabaseOperation('game_accounts.load', () => client
        .from('game_accounts')
        .select('account_number, full_name, updated_at')
        .order('account_number', { ascending: true }), { mode: 'read' }));
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      writeTimedCache(LOCAL_GAME_ACCOUNTS_KEY, rows, 'accounts');
      return rows;
    } catch (err) {
      if (cache && cache.rows) {
        rememberTimedCacheHit('accounts', cache);
        return cache.rows;
      }
      throw err;
    }
  }

  function gameStatsCacheKey(gameType, limit) {
    return LOCAL_GAME_STATS_PREFIX + encodeURIComponent(String(gameType || '').trim() || 'unknown') + ':' + String(Math.max(1, Math.min(50, Number(limit) || 10)));
  }

  function clearGameStatsCache(gameType) {
    const type = encodeURIComponent(String(gameType || '').trim() || 'unknown');
    const prefix = LOCAL_GAME_STATS_PREFIX + type + ':';
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.indexOf(prefix) === 0) keys.push(key);
      }
      keys.forEach(key => localStorage.removeItem(key));
    } catch (err) {}
  }

  async function loadGameStatsDirect(client, gameType, limit) {
    const type = String(gameType || '').trim();
    if (!type) return [];
    const safeLimit = Math.max(1, Math.min(50, Number(limit) || 10));
    const cacheKey = gameStatsCacheKey(type, safeLimit);
    const cachedStats = readTimedCache(cacheKey, SUPABASE_GAME_CACHE_TTL_MS);
    if (cachedStats && cachedStats.fresh) {
      rememberTimedCacheHit('stats', cachedStats);
      return cachedStats.rows;
    }
    try {
      const [accounts, statsRes] = await Promise.all([
        loadGameAccountsDirect(client, { preferCache: true }).catch(() => []),
        runSharedSupabaseRead('game_stats.load:' + type + ':' + safeLimit, () => runSupabaseOperation('game_stats.load', () => client
          .from('game_stats')
          .select('id,account_number,game_type,games_played,wins,losses,draws,points,last_played_at,updated_at')
          .eq('game_type', type)
          .order('points', { ascending: false })
          .order('updated_at', { ascending: false })
          .limit(safeLimit), { mode: 'read' }))
      ]);
      if (statsRes && statsRes.error) throw statsRes.error;
      const nameMap = new Map((Array.isArray(accounts) ? accounts : []).map(row => [String(row.account_number || '').trim(), String(row.full_name || '').trim()]));
      const rows = (Array.isArray(statsRes && statsRes.data) ? statsRes.data : [])
        .map(row => ({
          id: row.id,
          account_number: String(row.account_number || '').trim(),
          game_type: String(row.game_type || '').trim(),
          games_played: Number(row.games_played || 0) || 0,
          wins: Number(row.wins || 0) || 0,
          losses: Number(row.losses || 0) || 0,
          draws: Number(row.draws || 0) || 0,
          points: Number(row.game_type === 'ttt' ? (row.games_played || row.points || 0) : (row.points || 0)) || 0,
          last_played_at: row.last_played_at || null,
          updated_at: row.updated_at || null,
          player_name: nameMap.get(String(row.account_number || '').trim()) || String(row.account_number || '').trim()
        }))
        .filter(row => row.points > 0)
        .sort((a, b) => (b.points - a.points) || String(b.updated_at || '').localeCompare(String(a.updated_at || '')) || String(a.player_name || '').localeCompare(String(b.player_name || ''), 'cs'))
        .slice(0, safeLimit);
      writeTimedCache(cacheKey, rows, 'stats');
      return rows;
    } catch (err) {
      if (cachedStats && cachedStats.rows) {
        rememberTimedCacheHit('stats', cachedStats);
        return cachedStats.rows;
      }
      throw err;
    }
  }

  async function saveGameStatDirect(client, entry) {
    const accountNumber = String(entry && entry.account_number ? entry.account_number : '').trim();
    const gameType = String(entry && entry.game_type ? entry.game_type : '').trim();
    if (!accountNumber || !gameType) throw new Error('Chybí účet nebo typ hry.');

    const existingRes = await runSupabaseOperation('game_stats.lookup', () => client
      .from('game_stats')
      .select('id,games_played,wins,losses,draws,points,last_played_at,updated_at')
      .eq('account_number', accountNumber)
      .eq('game_type', gameType)
      .order('updated_at', { ascending: false })
      .limit(1), { mode: 'read' });
    if (existingRes && existingRes.error) throw existingRes.error;
    const existing = Array.isArray(existingRes && existingRes.data) && existingRes.data.length ? existingRes.data[0] : null;

    const lastPlayedRaw = entry && (entry.last_played_at ?? entry.lastPlayedAt ?? entry.updated_at ?? entry.updatedAt);
    const lastPlayedDate = lastPlayedRaw ? new Date(lastPlayedRaw) : new Date();
    const lastPlayedIso = Number.isNaN(lastPlayedDate.getTime()) ? new Date().toISOString() : lastPlayedDate.toISOString();

    const gamesPlayed = Math.max(Number(existing && existing.games_played || 0) || 0, Number(entry && (entry.games_played ?? entry.plays) || 0) || 0);
    const derivedPoints = gameType === 'ttt'
      ? gamesPlayed
      : Number(entry && (entry.points ?? entry.bestScore ?? entry.score) || 0) || 0;
    const next = {
      account_number: accountNumber,
      game_type: gameType,
      games_played: gamesPlayed,
      wins: Math.max(Number(existing && existing.wins || 0) || 0, Number(entry && entry.wins || 0) || 0),
      losses: Math.max(Number(existing && existing.losses || 0) || 0, Number(entry && entry.losses || 0) || 0),
      draws: Math.max(Number(existing && existing.draws || 0) || 0, Number(entry && entry.draws || 0) || 0),
      points: Math.max(Number(existing && existing.points || 0) || 0, derivedPoints),
      last_played_at: lastPlayedIso,
      updated_at: lastPlayedIso
    };

    if (existing && existing.id) {
      const { data, error } = await runSupabaseOperation('game_stats.update', () => client.from('game_stats').update(next).eq('id', existing.id).select('*').maybeSingle(), { mode: 'write' });
      if (error) throw error;
      clearGameStatsCache(gameType);
      return data || next;
    }

    const { data, error } = await runSupabaseOperation('game_stats.insert', () => client.from('game_stats').insert([next]).select('*').maybeSingle(), { mode: 'write', attempts: 1 });
    if (error) throw error;
    clearGameStatsCache(gameType);
    return data || next;
  }


  function gameUiSettingsCacheKey(accountNumber) {
    return LOCAL_GAME_UI_SETTINGS_PREFIX + encodeURIComponent(String(accountNumber || '').trim() || 'unknown');
  }

  function getGameUiDefinitionIndex(list, id, fallback) {
    const defs = Array.isArray(list) ? list : [];
    const wanted = String(id || '').trim();
    const idx = defs.findIndex(item => String(item && item.id || '').trim() === wanted);
    if (idx >= 0) return idx;
    const fb = String(fallback || '').trim();
    const fbIdx = defs.findIndex(item => String(item && item.id || '').trim() === fb);
    return fbIdx >= 0 ? fbIdx : 0;
  }

  function getGameUiDefinitionId(list, index, fallback) {
    const defs = Array.isArray(list) ? list : [];
    const idx = Math.max(0, Math.min(defs.length - 1, Number(index) || 0));
    return String(defs[idx] && defs[idx].id || fallback || '').trim();
  }

  function normalizeGameUiSettings(entry) {
    const accountNumber = String(entry && (entry.account_number || entry.accountNumber) || '').trim();
    const themeDefs = Array.isArray(window.RAK_THEME_DEFS) ? window.RAK_THEME_DEFS : [];
    const bgDefs = Array.isArray(window.RAK_BACKGROUND_DEFS) ? window.RAK_BACKGROUND_DEFS : [];
    const themeIdRaw = String(entry && (entry.theme_id || entry.themeId || entry.theme) || '').trim();
    const backgroundIdRaw = String(entry && (entry.background_id || entry.backgroundId || entry.background) || '').trim();
    const themeIndex = getGameUiDefinitionIndex(themeDefs, themeIdRaw, 'default');
    const backgroundIndex = getGameUiDefinitionIndex(bgDefs, backgroundIdRaw, 'ios-mesh');
    const themeId = getGameUiDefinitionId(themeDefs, themeIndex, 'default') || 'default';
    const backgroundId = getGameUiDefinitionId(bgDefs, backgroundIndex, 'ios-mesh') || 'ios-mesh';
    return {
      account_number: accountNumber,
      theme_id: themeId,
      background_id: backgroundId,
      theme_index: themeIndex,
      background_index: backgroundIndex,
      encoded_points: (themeIndex * 1000) + backgroundIndex,
      updated_at: entry && (entry.updated_at || entry.updatedAt) ? String(entry.updated_at || entry.updatedAt) : new Date().toISOString()
    };
  }

  function decodeGameUiSettingsRow(row) {
    if (!row) return null;
    const themeDefs = Array.isArray(window.RAK_THEME_DEFS) ? window.RAK_THEME_DEFS : [];
    const bgDefs = Array.isArray(window.RAK_BACKGROUND_DEFS) ? window.RAK_BACKGROUND_DEFS : [];
    const encoded = Number(row.points || 0) || 0;
    const themeIndex = Number.isFinite(Number(row.wins)) ? Number(row.wins) : Math.floor(encoded / 1000);
    const backgroundIndex = Number.isFinite(Number(row.losses)) ? Number(row.losses) : (encoded % 1000);
    return {
      account_number: String(row.account_number || '').trim(),
      theme_id: getGameUiDefinitionId(themeDefs, themeIndex, 'default') || 'default',
      background_id: getGameUiDefinitionId(bgDefs, backgroundIndex, 'ios-mesh') || 'ios-mesh',
      updated_at: row.updated_at || row.last_played_at || null,
      source: 'game_stats_profile_ui'
    };
  }

  async function loadGameAccountUiSettingsDirect(client, accountNumber) {
    const account = String(accountNumber || '').trim();
    if (!account) return null;
    const cacheKey = gameUiSettingsCacheKey(account);
    const cache = readTimedCache(cacheKey, SUPABASE_GAME_CACHE_TTL_MS);
    if (cache && cache.fresh && cache.rows && cache.rows[0]) {
      rememberTimedCacheHit('ui', cache);
      return cache.rows[0];
    }
    try {
      const { data, error } = await runSharedSupabaseRead('game_ui_settings.load:' + account, () => runSupabaseOperation('game_ui_settings.load', () => client
        .from('game_stats')
        .select('id,account_number,game_type,games_played,wins,losses,draws,points,last_played_at,updated_at')
        .eq('account_number', account)
        .eq('game_type', GAME_UI_SETTINGS_TYPE)
        .order('updated_at', { ascending: false })
        .limit(1), { mode: 'read' }));
      if (error) throw error;
      const row = Array.isArray(data) && data.length ? decodeGameUiSettingsRow(data[0]) : null;
      if (row) writeTimedCache(cacheKey, [row], 'ui');
      state.cacheGuard.uiSettingsLoads += 1;
      return row;
    } catch (err) {
      if (cache && cache.rows && cache.rows[0]) {
        state.cacheGuard.uiSettingsLoadFallbacks += 1;
        rememberTimedCacheHit('ui', cache);
        return cache.rows[0];
      }
      throw err;
    }
  }

  async function saveGameAccountUiSettingsDirect(client, entry) {
    const normalized = normalizeGameUiSettings(entry);
    if (!normalized.account_number) throw new Error('Chybí herní účet pro uložení vzhledu.');
    const nowIso = new Date().toISOString();
    const lookupKey = 'game_ui_settings.lookup:' + normalized.account_number;
    const existingRes = await runSharedSupabaseRead(lookupKey, () => runSupabaseOperation('game_ui_settings.lookup', () => client
      .from('game_stats')
      .select('id,account_number,game_type,updated_at')
      .eq('account_number', normalized.account_number)
      .eq('game_type', GAME_UI_SETTINGS_TYPE)
      .order('updated_at', { ascending: false })
      .limit(1), { mode: 'read' }));
    state.cacheGuard.uiSettingsSharedLookups += 1;
    if (existingRes && existingRes.error) throw existingRes.error;
    const existing = Array.isArray(existingRes && existingRes.data) && existingRes.data.length ? existingRes.data[0] : null;
    const row = {
      account_number: normalized.account_number,
      game_type: GAME_UI_SETTINGS_TYPE,
      games_played: 0,
      wins: normalized.theme_index,
      losses: normalized.background_index,
      draws: 0,
      points: normalized.encoded_points,
      last_played_at: nowIso,
      updated_at: nowIso
    };
    let saved = null;
    if (existing && existing.id) {
      const { data, error } = await runSupabaseOperation('game_ui_settings.update', () => client.from('game_stats').update(row).eq('id', existing.id).select('*').maybeSingle(), { mode: 'write' });
      if (error) throw error;
      saved = data || row;
    } else {
      const { data, error } = await runSupabaseOperation('game_ui_settings.insert', () => client.from('game_stats').insert([row]).select('*').maybeSingle(), { mode: 'write', attempts: 1 });
      if (error) throw error;
      saved = data || row;
    }
    const decoded = decodeGameUiSettingsRow(saved) || {
      account_number: normalized.account_number,
      theme_id: normalized.theme_id,
      background_id: normalized.background_id,
      updated_at: nowIso,
      source: 'game_stats_profile_ui'
    };
    writeTimedCache(gameUiSettingsCacheKey(normalized.account_number), [decoded], 'ui');
    state.cacheGuard.uiSettingsSaves += 1;
    return decoded;
  }

  async function loadRotationState() {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        const { data, error } = await runSupabaseOperation('rotation_state.load', () => client.from('rotation_state').select('*').eq('key', 'main').maybeSingle(), { mode: 'read' });
        if (error) throw error;

        const row = data || null;
        if (row && (row.payload || row.rotation)) {
          const payload = row.payload || row.rotation || null;
          state.rotationSnapshot = payload;
          state.lastError = null;
          saveLocalSnapshot(payload, state.machineSettingsSnapshot || []);
          return {
            id: row.key || 'main',
            payload,
            updatedAt: row.updated_at || null,
            meta: row.meta || null
          };
        }

        if (typeof loadRotationFromTables === 'function') {
          const rebuilt = await loadRotationFromTables();
          if (rebuilt && rebuilt.months && Object.keys(rebuilt.months).length) {
            state.rotationSnapshot = rebuilt;
            state.lastError = null;
            saveLocalSnapshot(rebuilt, state.machineSettingsSnapshot || []);
            return {
              id: row && row.key ? row.key : 'main',
              payload: rebuilt,
              updatedAt: row && row.updated_at ? row.updated_at : null,
              meta: { source: 'tables' }
            };
          }
        }
      }
    } catch (err) {
      state.lastError = err;
      console.warn('Supabase rotation load failed', err);
    }

    const snapshot = readLocalSnapshot();
    if (snapshot && snapshot.rotation) {
      state.rotationSnapshot = snapshot.rotation;
      state.lastError = null;
      return {
        id: 'main',
        payload: snapshot.rotation,
        updatedAt: snapshot.updatedAt || null,
        meta: { source: 'local-cache' }
      };
    }

    return null;
  }

  async function saveRotationState(rotation, meta) {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        if (shouldDeferOnlineWrite()) return Object.assign(await enqueueAndMaybeFlush({ type: 'rotation_state', rotation, meta }), { deferred: true });
        const row = await runSupabaseOperation('rotation_state.save', () => upsertRotationStateDirect(client, rotation, meta), { mode: 'write' });
        state.rotationSnapshot = rotation && typeof rotation === 'object' ? rotation : null;
        state.lastError = null;
        saveLocalSnapshot(state.rotationSnapshot, state.machineSettingsSnapshot || []);
        await flushPendingWrites();
        return {
          ok: true,
          queued: false,
          verified: true,
          updatedAt: row.updated_at
        };
      }
      return await enqueueAndMaybeFlush({ type: 'rotation_state', rotation, meta });
    } catch (err) {
      state.lastError = err;
      console.warn('Supabase rotation save failed', err);
      if (isLikelyOfflineError(err)) {
        return await enqueueAndMaybeFlush({ type: 'rotation_state', rotation, meta });
      }
      return { ok: false, error: err };
    }
  }

  async function loadGomokuWins(limit) {
    const client = getClient();
    if (!client || !navigator.onLine) return [];
    try {
      const res = await runSupabaseOperation('gomoku_wins.load', () => client
        .from('gomoku_wins')
        .select('player_name,difficulty,moves,elapsed_ms,elapsed_text,x_moves,o_moves,created_at,app_version')
        .order('created_at', { ascending: false })
        .limit(Math.max(1, Math.min(100, Number(limit) || 20))), { mode: 'read' });
      if (res && res.error) throw res.error;
      return Array.isArray(res && res.data) ? res.data : [];
    } catch (err) {
      state.lastError = err;
      console.error('Supabase win list load failed', err);
      return [];
    }
  }

  async function sendGomokuWin(entry) {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        if (shouldDeferOnlineWrite()) return Object.assign(await enqueueAndMaybeFlush({ type: 'gomoku_win', entry }), { deferred: true });
        const data = await runSupabaseOperation('gomoku_win.save', () => upsertGomokuWinDirect(client, entry), { mode: 'write', attempts: 1 });
        await flushPendingWrites();
        return { ok: true, queued: false, data };
      }
      return await enqueueAndMaybeFlush({ type: 'gomoku_win', entry });
    } catch (err) {
      state.lastError = err;
      console.error('Supabase win insert failed', err);
      if (isLikelyOfflineError(err)) {
        return await enqueueAndMaybeFlush({ type: 'gomoku_win', entry });
      }
      return { ok: false, error: err };
    }
  }


  function getSupabaseHardeningStatus() {
    const queue = readQueue();
    return {
      queueLength: queue.length,
      queueMaxItems: SUPABASE_QUEUE_MAX_ITEMS,
      queueMaxBytes: SUPABASE_QUEUE_MAX_BYTES,
      realtimeStatus: state.realtimeStatus || 'idle',
      realtimeBindStartedAt: state.realtimeBindStartedAt || 0,
      lastRealtimeAt: state.lastRealtimeAt || null,
      guard: Object.assign({}, state.queueGuard),
      syncGuard: Object.assign({}, state.syncGuard),
      cacheGuard: Object.assign({}, state.cacheGuard),
      readTimeoutMs: SUPABASE_READ_TIMEOUT_MS,
      writeTimeoutMs: SUPABASE_WRITE_TIMEOUT_MS,
      queueFlushBatchSize: SUPABASE_QUEUE_FLUSH_BATCH_SIZE,
      queueHiddenRetryDelayMs: SUPABASE_QUEUE_HIDDEN_RETRY_DELAY_MS,
      queueWakeGuardMs: SUPABASE_QUEUE_WAKE_GUARD_MS,
      queueNextRetryAt: state.syncGuard.queueNextRetryAt || null
    };
  }

  function getSyncUiStatus() {
    const cached = readLocalSnapshot();
    const hasCache = !!(cached && (cached.rotation || (Array.isArray(cached.machineSettingsRows) && cached.machineSettingsRows.length)));
    const queueLength = readQueue().length;
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const lastError = state.lastError || null;

    if (!online) {
      return {
        kind: 'offline',
        label: hasCache ? '🟡 Offline cache' : '🟡 Offline cache',
        detail: cached && cached.updatedAt ? ('cache ' + new Date(cached.updatedAt).toLocaleString('cs-CZ')) : 'Bez internetu',
        queued: queueLength,
        hasCache,
        hardening: getSupabaseHardeningStatus()
      };
    }

    if (queueLength > 0) {
      return {
        kind: 'pending',
        label: '🟡 Offline cache',
        detail: 'Čeká na odeslání ' + queueLength + ' změn',
        queued: queueLength,
        hasCache,
        hardening: getSupabaseHardeningStatus()
      };
    }

    if (lastError) {
      return {
        kind: 'error',
        label: '🔴 Nepodařilo se synchronizovat',
        detail: 'Poslední pokus selhal',
        queued: queueLength,
        hasCache,
        hardening: getSupabaseHardeningStatus()
      };
    }

    return {
      kind: 'online',
      label: '🟢 Online synchronizováno',
      detail: cached && cached.updatedAt ? ('Aktualizováno ' + new Date(cached.updatedAt).toLocaleString('cs-CZ')) : 'Online',
      queued: 0,
      hasCache,
      realtime: state.realtimeStatus || 'idle',
      lastRealtimeAt: state.lastRealtimeAt || null,
      hardening: getSupabaseHardeningStatus()
    };
  }

  window.refreshPublicData = refreshPublicData;

  function init() {
    if (state.ready) {
      bindRealtimeSubscriptions();
      return refreshPublicData();
    }
    if (!hasClient()) {
      return refreshPublicData();
    }
    bindRealtimeSubscriptions();
    scheduleSupabaseQueueFlush('init', 650);
    return refreshPublicData();
  }

  window.sendGomokuWin = sendGomokuWin;

  window.RotationSupabaseBridge = {
    init,
    refreshPublicData,
    sendGomokuWin,
    loadRotationState,
    saveRotationState,
    loadGomokuWins,
    loadMachineSettings,
    saveMachineSettings,
    loadRotationMonthEntries,
    saveRotationMonthEntries,
    loadGameStats: async (gameType, limit = 10) => {
      const safeLimit = Math.max(1, Math.min(50, Number(limit) || 10));
      const cache = readTimedCache(gameStatsCacheKey(gameType, safeLimit), SUPABASE_GAME_CACHE_TTL_MS);
      const client = getClient();
      if (!client || !navigator.onLine) {
        if (cache && cache.rows) {
          rememberTimedCacheHit('stats', cache);
          return cache.rows;
        }
        return [];
      }
      try { const rows = await loadGameStatsDirect(client, gameType, safeLimit); state.lastError = null; return rows; }
      catch (err) {
        state.lastError = err;
        console.error('Game stats load failed', err);
        if (cache && cache.rows) {
          rememberTimedCacheHit('stats', cache);
          return cache.rows;
        }
        return [];
      }
    },
    saveGameStat: async (payload) => {
      const client = getClient();
      if (!client || !navigator.onLine) return await enqueueAndMaybeFlush({ type: 'game_stat', entry: payload });
      try {
        if (shouldDeferOnlineWrite()) return Object.assign(await enqueueAndMaybeFlush({ type: 'game_stat', entry: payload }), { deferred: true });
        const result = Object.assign({ ok: true }, await saveGameStatDirect(client, payload));
        state.lastError = null;
        await flushPendingWrites();
        return result;
      }
      catch (err) {
        state.lastError = err;
        console.error('Game stat save failed', err);
        if (isLikelyTransientError(err)) return await enqueueAndMaybeFlush({ type: 'game_stat', entry: payload });
        return { ok: false, error: err };
      }
    },
    loadGameAccounts: async () => {
      const cache = readTimedCache(LOCAL_GAME_ACCOUNTS_KEY, SUPABASE_GAME_CACHE_TTL_MS);
      const client = getClient();
      if (!client || !navigator.onLine) {
        if (cache && cache.rows) {
          rememberTimedCacheHit('accounts', cache);
          return cache.rows;
        }
        return [];
      }
      try { const rows = await loadGameAccountsDirect(client); state.lastError = null; return rows; }
      catch (err) {
        state.lastError = err;
        console.error('Game accounts load failed', err);
        if (cache && cache.rows) {
          rememberTimedCacheHit('accounts', cache);
          return cache.rows;
        }
        return [];
      }
    },
    loadGameAccountUiSettings: async (accountNumber) => {
      const account = String(accountNumber || '').trim();
      const cache = readTimedCache(gameUiSettingsCacheKey(account), SUPABASE_GAME_CACHE_TTL_MS);
      const client = getClient();
      if (!account) return null;
      if (!client || !navigator.onLine) {
        if (cache && cache.rows && cache.rows[0]) { rememberTimedCacheHit('ui', cache); return cache.rows[0]; }
        return null;
      }
      try { const row = await loadGameAccountUiSettingsDirect(client, account); state.lastError = null; return row; }
      catch (err) {
        state.lastError = err;
        console.error('Game UI settings load failed', err);
        if (cache && cache.rows && cache.rows[0]) { rememberTimedCacheHit('ui', cache); return cache.rows[0]; }
        return null;
      }
    },
    saveGameAccountUiSettings: async (payload) => {
      const normalized = normalizeGameUiSettings(payload);
      const client = getClient();
      if (!normalized.account_number) return { ok: false, reason: 'missing-account' };
      if (!client || !navigator.onLine) {
        state.cacheGuard.uiSettingsSaveQueued += 1;
        return await enqueueAndMaybeFlush({ type: 'game_ui_settings', entry: normalized });
      }
      try {
        if (shouldDeferOnlineWrite()) {
          state.cacheGuard.uiSettingsSaveDeferred += 1;
          return Object.assign(await enqueueAndMaybeFlush({ type: 'game_ui_settings', entry: normalized }), { deferred: true });
        }
        const row = await saveGameAccountUiSettingsDirect(client, normalized);
        state.lastError = null;
        await flushPendingWrites();
        return Object.assign({ ok: true, queued: false }, row || {});
      } catch (err) {
        state.cacheGuard.uiSettingsSaveErrors += 1;
        state.lastError = err;
        console.error('Game UI settings save failed', err);
        if (isLikelyTransientError(err)) {
          state.cacheGuard.uiSettingsSaveQueued += 1;
          return await enqueueAndMaybeFlush({ type: 'game_ui_settings', entry: normalized });
        }
        return { ok: false, error: err };
      }
    },
    seedFromLocalSnapshot,
    flushPendingWrites,
    bindRealtimeSubscriptions,
    getBridgeText,
    getCanteenStatus,
    getSyncUiStatus,
    createGameInvite: async (payload) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client' };
      try { const result = Object.assign({ ok: true }, await createGameInviteDirect(client, payload)); state.lastError = null; return result; }
      catch (err) { state.lastError = err; console.error('TTT invite create failed', err); return { ok: false, error: err }; }
    },
    acceptGameInvite: async (code, inviteeAccountNumber) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client' };
      try { const result = Object.assign({ ok: true }, await acceptGameInviteDirect(client, code, inviteeAccountNumber)); state.lastError = null; return result; }
      catch (err) { state.lastError = err; console.error('TTT invite accept failed', err); return { ok: false, error: err }; }
    },
    loadGameSessionByInviteCode: async (code) => {
      const inviteCode = normalizeInviteCode(code);
      const client = getClient();
      if (!inviteCode) return { ok: false, reason: 'missing-code' };
      if (!client || !navigator.onLine) return buildCachedSessionResult(inviteCode);
      try {
        const result = await runSharedSupabaseRead('game_session.load:' + inviteCode, async () => Object.assign({ ok: true }, await loadGameSessionByInviteCodeDirect(client, inviteCode)));
        state.lastError = null;
        return result;
      }
      catch (err) {
        state.lastError = err;
        console.error('TTT session load failed', err);
        const cachedResult = buildCachedSessionResult(inviteCode);
        if (cachedResult && cachedResult.ok) return Object.assign(cachedResult, { fallback: true, error: err });
        return { ok: false, error: err };
      }
    },
    saveGameSessionByInviteCode: async (code, payload) => {
      const inviteCode = normalizeInviteCode(code);
      const client = getClient();
      if (!inviteCode) return { ok: false, reason: 'missing-code' };
      if (!client || !navigator.onLine) {
        state.cacheGuard.sessionSaveQueued += 1;
        buildCachedSessionResult(inviteCode, payload);
        return await enqueueAndMaybeFlush({ type: 'game_session', inviteCode, payload });
      }
      try {
        if (shouldDeferOnlineWrite()) {
          state.cacheGuard.sessionSaveQueued += 1;
          buildCachedSessionResult(inviteCode, payload);
          return Object.assign(await enqueueAndMaybeFlush({ type: 'game_session', inviteCode, payload }), { deferred: true });
        }
        const result = Object.assign({ ok: true }, await saveGameSessionByInviteCodeDirect(client, inviteCode, payload));
        state.lastError = null;
        await flushPendingWrites();
        return result;
      }
      catch (err) {
        state.cacheGuard.sessionSaveErrors += 1;
        state.lastError = err;
        console.error('TTT session save failed', err);
        if (isLikelyTransientError(err)) {
          state.cacheGuard.sessionSaveQueued += 1;
          buildCachedSessionResult(inviteCode, payload);
          return await enqueueAndMaybeFlush({ type: 'game_session', inviteCode, payload });
        }
        return { ok: false, error: err };
      }
    },
    getState: () => ({ ...state })
  };

  window.flushSupabaseSyncQueue = flushPendingWrites;
  window.seedSupabaseFromLocalSnapshot = seedFromLocalSnapshot;

  window.getSupabaseAnnouncement = getBridgeText;
  window.getSupabaseCanteenStatus = getCanteenStatus;
  window.getSupabaseSyncStatus = getSyncUiStatus;
  window.getSupabaseHardeningStatus = getSupabaseHardeningStatus;
  window.createGameInvite = async (payload) => window.RotationSupabaseBridge.createGameInvite(payload);
  window.acceptGameInvite = async (code, inviteeAccountNumber) => window.RotationSupabaseBridge.acceptGameInvite(code, inviteeAccountNumber);
  window.loadGameSessionByInviteCode = async (code) => window.RotationSupabaseBridge.loadGameSessionByInviteCode(code);
  window.saveGameSessionByInviteCode = async (code, payload) => window.RotationSupabaseBridge.saveGameSessionByInviteCode(code, payload);

  window.addEventListener('online', () => {
    requestSupabaseQueueWake('online', 350);
    void refreshPublicData();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    state.syncGuard.queueVisibilityFlushes += 1;
    state.syncGuard.lastQueueVisibilityFlushAt = Date.now();
    requestSupabaseQueueWake('visible', 450);
  });

  window.addEventListener('pageshow', () => {
    requestSupabaseQueueWake('pageshow', 650);
  });

  window.addEventListener('focus', () => {
    requestSupabaseQueueWake('focus', 850);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    setTimeout(init, 0);
  }
})();
