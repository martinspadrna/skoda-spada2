// RaK 1.2 (1.104) – Supabase bridge a online synchronizace.
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
      realtimeRebindScheduled: 0,
      realtimeRebindRuns: 0,
      realtimeRebindSkips: 0,
      realtimeRebindErrors: 0,
      queueHealthChecks: 0,
      queueHealthWarnings: 0,
      queueHealthCriticals: 0,
      queueStaleTaskCount: 0,
      queueMaxRetryCount: 0,
      queueOldestAgeMs: 0,
      lastQueueHealthAt: null,
      lastQueueHealthWarningAt: null,
      lastQueueHealthCriticalAt: null,
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
      lastRealtimeWakeBindAt: null,
      lastRealtimeRebindScheduleAt: null,
      lastRealtimeRebindAt: null,
      lastRealtimeRebindSkipAt: null,
      lastRealtimeRebindErrorAt: null
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
      localJsonReadDelegations: 0,
      localJsonWriteDelegations: 0,
      localJsonWriteSkips: 0,
      staleFallbacks: 0,
      sharedReadJoins: 0,
      lastCacheHitAt: null,
      lastCacheWriteAt: null,
      lastSharedReadAt: null
    },
    performanceGuard: {
      realtimeRefreshRequests: 0,
      realtimeRefreshRuns: 0,
      realtimeRefreshCoalesced: 0,
      realtimeRefreshHiddenDefers: 0,
      realtimeRefreshErrors: 0,
      sharedReadStarts: 0,
      sharedReadJoins: 0,
      sharedReadActive: 0,
      sharedReadPeak: 0,
      writeOptimizationChecks: 0,
      writeOptimizationJoins: 0,
      writeOptimizationSkips: 0,
      writeOptimizationStarts: 0,
      writeOptimizationActive: 0,
      writeOptimizationPeak: 0,
      lastWriteOptimizationKey: '',
      lastWriteOptimizationAt: null,
      lastWriteOptimizationSkipAt: null,
      lastWriteOptimizationJoinAt: null,
      lastRealtimeRefreshRequestAt: null,
      lastRealtimeRefreshRunAt: null,
      lastRealtimeRefreshTable: '',
      lastRealtimeRefreshReason: '',
      lastRealtimeRefreshHiddenAt: null,
      lastSharedReadKey: '',
      lastSharedReadAt: null
    },
    keepalive: {
      status: 'unknown',
      label: 'neznámá',
      attempts: 0,
      successes: 0,
      failures: 0,
      skips: 0,
      lastAttemptAt: null,
      lastSuccessAt: null,
      lastErrorAt: null,
      lastErrorMessage: '',
      lastErrorCode: '',
      lastReason: '',
      lastDeviceKey: '',
      lastDurationMs: 0,
      lastHttpStatus: null,
      lastClassification: 'unknown',
      lastSkipReason: '',
      lastSkipAt: null
    }
  };

  const SUPABASE_QUEUE_MAX_ITEMS = 120;
  const SUPABASE_QUEUE_MAX_BYTES = 650000;
  const SUPABASE_REALTIME_REBIND_GUARD_MS = 15000;
  const SUPABASE_REALTIME_REFRESH_DELAY_MS = 750;
  const SUPABASE_REALTIME_REFRESH_HIDDEN_DELAY_MS = 2600;
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
  const SUPABASE_QUEUE_HEALTH_WARN_AFTER_MS = 20 * 60 * 1000;
  const SUPABASE_QUEUE_HEALTH_CRITICAL_AFTER_MS = 2 * 60 * 60 * 1000;
  const SUPPORTED_QUEUE_TYPES = new Set([
    'rotation_state',
    'machine_settings',
    'rotation_month_entries',
    'gomoku_win',
    'game_stat',
    'game_ui_settings',
    'game_session',
    'bug_report'
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


  const SUPABASE_STRUCTURE_CONTRACTS = [
    { table: 'announcements', realtime: true, queueType: '', access: 'anon SELECT + optional INSERT/UPDATE for admin announcement', note: 'dashboard oznámení / online-first čtení a pokus o admin zápis bez změny policies' },
    { table: 'machine_settings', realtime: true, queueType: 'machine_settings', access: 'anon SELECT/INSERT/UPDATE', note: 'nastavení strojů a parametrů kalkulaček' },
    { table: 'rotation_state', realtime: true, queueType: 'rotation_state', access: 'anon SELECT/INSERT/UPDATE', note: 'hlavní snapshot rotace' },
    { table: 'rotation_months', realtime: true, queueType: '', access: 'anon SELECT/INSERT/UPDATE', note: 'měsíce rozpisů' },
    { table: 'rotation_entries', realtime: true, queueType: 'rotation_month_entries', access: 'anon SELECT/INSERT/UPDATE', note: 'řádky rozpisů' },
    { table: 'game_accounts', realtime: true, queueType: '', access: 'anon SELECT/INSERT/UPDATE', note: 'herní profily' },
    { table: 'game_invites', realtime: true, queueType: '', access: 'anon SELECT/INSERT/UPDATE', note: 'pozvánky online her' },
    { table: 'game_sessions', realtime: true, queueType: 'game_session', access: 'anon SELECT/INSERT/UPDATE', note: 'online herní session' },
    { table: 'game_stats', realtime: true, queueType: 'game_stat', access: 'anon SELECT/INSERT/UPDATE', note: 'skóre a žebříčky' },
    { table: 'game_ui_settings', realtime: false, queueType: 'game_ui_settings', access: 'anon SELECT/INSERT/UPDATE', note: 'profilové nastavení vzhledu' },
    { table: 'app_keepalive', realtime: false, queueType: '', access: 'RPC rak_app_keepalive + app_keepalive-only RLS', note: 'bezpečný heartbeat proti pauze free projektu, mimo herní data; klient používá RPC, tabulka má jen úzké heartbeat RLS' },
    { table: 'rak_usage_presence', realtime: false, queueType: '', access: 'RPC rak_usage_presence_touch + RPC rak_usage_presence_admin', note: 'anonymní přehled zařízení / poslední připojení pro administraci bez ukládání surové IP' },
    { table: 'bug_reports', realtime: false, queueType: 'bug_report', access: 'anon INSERT only', note: 'uživatelské reporty chyb / nápadů' },
    { table: 'gomoku_wins', realtime: true, queueType: 'gomoku_win', access: 'anon SELECT/INSERT/UPDATE', note: 'výhry piškvorek / legacy leaderboard' }
  ];

  const SUPABASE_POLICY_AUDIT_SNAPSHOT_VERSION = '1.2 (1.104)';
  const SUPABASE_POLICY_AUDIT_SNAPSHOT_AT = '2026-05-24';
  const SUPABASE_POLICY_HARDENING_PHASE = {
    current: 'V856 – release hygiene po kontrole vlastních buildů: changelog opravený, SQL auditní soubory jsou archivované v assets/docs/sql a DB policies se nemění.',
    next: 'Nasbírat RPC smoke signály create/accept/save zvlášť pro Piškvorky i Lodě bez fallbacků; až potom připravit úzké policy zúžení po jednotlivých tabulkách.',
    rollback: 'Rollback v828 byl proveden jen pro game_invites/game_sessions restriktivní policies z v826; game_stats restriktivní policies z v824 zůstávají zachované.'
  };
  const SUPABASE_POLICY_AUDIT_SNAPSHOT = [
    {
      table: 'rotation_state',
      priority: 'P0',
      risk: 'anon INSERT/UPDATE nad hlavním snapshotem rozpisů',
      observed: 'policy rak_rotation_state_insert_anon / rak_rotation_state_update_anon s with_check=true',
      recommendation: 'ponechat SELECT pro čtení, zápis přes úzkou RPC/admin flow nebo serverově ověřený maintenance token'
    },
    {
      table: 'machine_settings',
      priority: 'P0',
      risk: 'anon ALL/INSERT/UPDATE nad parametry strojů a kalkulaček',
      observed: 'policies machine_settings_anon_write_v622/v624 s qual=true a with_check=true',
      recommendation: 'zápisy omezit na RPC s validací povolených klíčů a rozsahů; klientský admin nesmí být autorita'
    },
    {
      table: 'game_stats',
      priority: 'P0',
      risk: 'public INSERT/UPDATE nad žebříčky, XP a profilovým vzhledem; public DELETE už odstraněn ve Fázi 2D',
      observed: 'původní permisivní game_stats_insert_public/update_public fyzicky zůstávají, ale přímé public write blokují restriktivní policies game_stats_insert_rpc_only_v824/game_stats_update_rpc_only_v824; game_stats_delete_public odstraněná v DB migraci v810',
      recommendation: 'běžné přírůstkové score zápisy držet přes rak_record_game_stat_delta a profile UI přes rak_save_game_ui_settings; po smoke testu bez fallbacků pokračovat na game_sessions/game_invites'
    },
    {
      table: 'game_sessions',
      priority: 'P0',
      risk: 'přímé public INSERT/UPDATE nad online session je po rollbacku v828 dočasně povolené kvůli funkčnosti online her; public DELETE zůstává odstraněný',
      observed: 'v828 odstranil restriktivní policies game_sessions_insert_rpc_only_v826/game_sessions_update_rpc_only_v826, protože online hry přestaly být bezpečně ověřené; DELETE zůstává odstraněné v810',
      recommendation: 'online Piškvorky link/kód jsou potvrzené OK; Lodě se musí ověřit samostatně; před dalším utažením nejdřív nasbírat RPC smoke bez fallbacku a teprve potom připravit úzké policies'
    },
    {
      table: 'game_invites',
      priority: 'P1',
      risk: 'přímé public INSERT/UPDATE nad pozvánkami je po rollbacku v828 dočasně povolené kvůli funkčnosti online her; public DELETE zůstává odstraněný',
      observed: 'v828 odstranil restriktivní policies game_invites_insert_rpc_only_v826/game_invites_update_rpc_only_v826, protože online hry přestaly být bezpečně ověřené; DELETE zůstává odstraněné v810',
      recommendation: 'pozvánky jsou společná vrstva online her; Piškvorky jsou potvrzené, Lodě musí mít vlastní create/accept/save smoke; další krok je RPC smoke evidence bez fallbacku, ne okamžité vrácení restriktivních policies'
    },
    {
      table: 'bug_reports',
      priority: 'P1',
      risk: 'anon/auth SELECT a UPDATE reportů chyb je potvrzené riziko soukromí/admin flow',
      observed: 'DB kontrola v827 potvrdila 2 veřejné SELECT/UPDATE policies; příprava bug_reports RPC byla odložena kvůli hotfixu online Piškvorek',
      recommendation: 'INSERT ponechat veřejný s limity, ale připravit admin/RPC review tok a potom zúžit SELECT/UPDATE přes chráněné rozhraní'
    },
    {
      table: 'gomoku_wins',
      priority: 'P2',
      risk: 'anon INSERT/SELECT legacy výsledků Piškvorek',
      observed: 'allow_insert_gomoku_wins / allow_read_gomoku_wins',
      recommendation: 'ponechat jen pokud je legacy žebříček potřeba; jinak sjednotit přes game_stats/game_sessions'
    }
  ];

  const SUPABASE_RPC_HARDENING_STATUS = {
    version: '1.2 (1.104)',
    phase: '2E-O online invite/session RPC smoke + accept RPC / no policy tightening',
    rpcPreferred: true,
    migrationApplied: true,
    migrationNote: 'game_stats direct INSERT/UPDATE zůstávají omezené restriktivními policies v824. Restriktivní policies pro game_invites/game_sessions z v826 byly v DB ve v828 odstraněné. V834–V837 stabilizovalo app_keepalive heartbeat přes RPC. V839 přidala RPC cestu pro přijetí online pozvánky; V841 zpřesnila smoke audit po hrách: Piškvorky i Lodě musí projít create/accept/save zvlášť před dalším utažením policies. V842 upravila klientské UI/flow, V843 sjednotila Lodě zvací overlay s Piškvorkami, V844 doplnila link/share flow Lodí a V845 opravuje router Lodí přes odkaz plus zakrytý spodek flotily; V847 tvrdě zajišťuje neprůhlednou spodní lištu v Láďově režimu; V848 přesněji dorovnává neaktivní ikonky spodní navigace vůči popiskům; V850 zmenšuje/kompaktuje setup pole Lodí pro větší mobily a zpevňuje obnovu stavu/střelbu po připojení přes zvací odkaz; V855 kontroluje PWA/assets/SW po přesunu ikon bez změny policies; V856 opravuje release historii a přesouvá SQL auditní soubory z kořene do assets/docs/sql; spodní ikonky zůstávají beze změny; policies dál nemění.',
    dbVerifiedAt: '2026-05-25',
    verifiedRpcCount: 7,
    bugReportsHardeningPhase: 'znovu otevřeno jen jako audit; DB změna zatím ne',
    bugReportsPublicSelectUpdatePolicies: 2,
    bugReportsDbChanged: false,
    bugReportsNextStep: 'připravit oddělený admin/review tok; SELECT/UPDATE neutahovat, dokud nebude jasný bezpečný způsob čtení reportů',
    plannedRpc: [
      'rak_save_rotation_state',
      'rak_save_machine_settings',
      'rak_cleanup_expired_game_invites (existující cleanup helper)',
      'rak_record_game_stat_delta',
      'rak_save_game_ui_settings',
      'rak_create_game_invite_session',
      'rak_accept_game_invite',
      'rak_save_game_session_by_invite_code',
      'rak_submit_bug_report (DB scaffold, klient zatím nepoužívá)'
    ],
    fallback: 'game_stats direct-write je blokovaný v824; game_invites/game_sessions direct-write je ve v828 dočasně obnovený kvůli online hrám; bug_reports SELECT/UPDATE zatím ponecháno' ,
    gameStatsRpcSmoke: 'rpc-required-after-v824-restrictive-policy',
    gameUiSettingsRpcSmoke: 'rpc-required-after-v824-restrictive-policy',
    gameStatsRpcAttempts: 0,
    gameStatsRpcSuccesses: 0,
    gameStatsRpcFallbacks: 0,
    lastGameStatsRpcAt: null,
    lastGameStatsRpcType: '',
    lastGameStatsFallbackAt: null,
    lastGameStatsFallbackReason: '',
    gameUiRpcAttempts: 0,
    gameUiRpcSuccesses: 0,
    gameUiRpcFallbacks: 0,
    gameSessionRpcAttempts: 0,
    gameSessionRpcSuccesses: 0,
    gameSessionRpcFallbacks: 0,
    lastGameSessionRpcAt: null,
    lastGameSessionRpcType: '',
    lastGameSessionFallbackAt: null,
    lastGameSessionFallbackReason: '',
    lastGameUiRpcAt: null,
    lastGameUiFallbackAt: null,
    lastGameUiFallbackReason: ''
  };




  const SUPABASE_HARDENING_READINESS_ITEMS = [
    {
      area: 'app_keepalive',
      priority: 'P2',
      state: 'hotovo',
      rpc: 'rak_app_keepalive',
      directFallback: 'ne',
      risk: 'nízké – oddělená heartbeat tabulka mimo herní data',
      next: 'jen sledovat OK stav v diagnostice'
    },
    {
      area: 'game_stats / game_ui_settings',
      priority: 'P0',
      state: 'částečně zpevněno',
      rpc: 'rak_record_game_stat_delta + rak_save_game_ui_settings',
      directFallback: 'game_stats přímý write je blokovaný restriktivními policies v824; UI nastavení sleduje vlastní RPC smoke',
      risk: 'střední – před dalším utažením musí být smoke bez fallbacků',
      next: 'odehrát několik her a uložit theme/pozadí profilu, potom zkontrolovat RPC smoke počítadla'
    },
    {
      area: 'game_invites / game_sessions',
      priority: 'P0',
      state: 'funkční po rollbacku, accept RPC přidané, policy zatím otevřená',
      rpc: 'rak_create_game_invite_session + rak_accept_game_invite + rak_save_game_session_by_invite_code',
      directFallback: 'ano, po rollbacku v828 dočasně zachováno kvůli kompatibilitě online her',
      risk: 'vyšší – online hra je funkční, ale policy se nesmí vracet naslepo',
      next: 'nasbírat reálné RPC úspěchy create/accept/save zvlášť pro Piškvorky i Lodě bez fallbacku; potom připravit postupné zúžení INSERT/UPDATE'
    },
    {
      area: 'bug_reports',
      priority: 'P1',
      state: 'čeká na bezpečný admin tok',
      rpc: 'rak_submit_bug_report je plánovaná/částečná cesta pro odeslání',
      directFallback: 'public SELECT/UPDATE zatím zůstává kvůli čtení/správě reportů',
      risk: 'střední – riziko soukromí u reportů, ale nemá blokovat online hry',
      next: 'připravit oddělený admin/review přístup a až pak utáhnout SELECT/UPDATE'
    },
    {
      area: 'rotation_state / machine_settings / rotation_entries',
      priority: 'P0',
      state: 'starší veřejný write kontrakt',
      rpc: 'zatím není plně dokončená bezpečná RPC náhrada pro všechny zápisy',
      directFallback: 'ano',
      risk: 'vyšší – pracovní data a parametry strojů',
      next: 'řešit až po online hrách/reportech; vyžaduje samostatný migrační plán a testy rozpisů/kalkulaček'
    }
  ];

  const GAME_STATS_RPC_SMOKE_STORAGE_KEY = 'rak_game_stats_rpc_smoke_v1';

  function normalizeGameStatsRpcSmoke(raw) {
    const base = raw && typeof raw === 'object' ? raw : {};
    return {
      attempts: Math.max(0, Number(base.attempts || 0) || 0),
      successes: Math.max(0, Number(base.successes || 0) || 0),
      fallbacks: Math.max(0, Number(base.fallbacks || 0) || 0),
      successByType: base.successByType && typeof base.successByType === 'object' ? Object.assign({}, base.successByType) : {},
      fallbackByType: base.fallbackByType && typeof base.fallbackByType === 'object' ? Object.assign({}, base.fallbackByType) : {},
      lastAttemptAt: base.lastAttemptAt || null,
      lastSuccessAt: base.lastSuccessAt || null,
      lastSuccessType: String(base.lastSuccessType || ''),
      lastFallbackAt: base.lastFallbackAt || null,
      lastFallbackType: String(base.lastFallbackType || ''),
      lastFallbackReason: String(base.lastFallbackReason || ''),
      updatedAt: base.updatedAt || null
    };
  }

  function readGameStatsRpcSmokeStatus() {
    try {
      if (typeof localStorage === 'undefined') return normalizeGameStatsRpcSmoke(null);
      return normalizeGameStatsRpcSmoke(JSON.parse(localStorage.getItem(GAME_STATS_RPC_SMOKE_STORAGE_KEY) || '{}'));
    } catch (err) {
      return normalizeGameStatsRpcSmoke(null);
    }
  }

  function writeGameStatsRpcSmokeStatus(next) {
    const safe = normalizeGameStatsRpcSmoke(next);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(GAME_STATS_RPC_SMOKE_STORAGE_KEY, JSON.stringify(safe));
      }
    } catch (err) {}
    SUPABASE_RPC_HARDENING_STATUS.gameStatsRpcAttempts = safe.attempts;
    SUPABASE_RPC_HARDENING_STATUS.gameStatsRpcSuccesses = safe.successes;
    SUPABASE_RPC_HARDENING_STATUS.gameStatsRpcFallbacks = safe.fallbacks;
    SUPABASE_RPC_HARDENING_STATUS.lastGameStatsRpcAt = safe.lastSuccessAt;
    SUPABASE_RPC_HARDENING_STATUS.lastGameStatsRpcType = safe.lastSuccessType;
    SUPABASE_RPC_HARDENING_STATUS.lastGameStatsFallbackAt = safe.lastFallbackAt;
    SUPABASE_RPC_HARDENING_STATUS.lastGameStatsFallbackReason = safe.lastFallbackReason;
    return safe;
  }

  function rememberGameStatsRpcSmoke(kind, gameType, reason) {
    const nowIso = new Date().toISOString();
    const type = String(gameType || '').trim();
    const next = readGameStatsRpcSmokeStatus();
    if (kind === 'attempt') {
      next.attempts += 1;
      next.lastAttemptAt = nowIso;
    } else if (kind === 'success') {
      next.successes += 1;
      next.lastSuccessAt = nowIso;
      next.lastSuccessType = type;
      next.successByType = next.successByType && typeof next.successByType === 'object' ? next.successByType : {};
      if (type) next.successByType[type] = Math.max(0, Number(next.successByType[type] || 0) || 0) + 1;
    } else if (kind === 'fallback') {
      next.fallbacks += 1;
      next.lastFallbackAt = nowIso;
      next.lastFallbackType = type;
      next.lastFallbackReason = String(reason || 'unknown').slice(0, 180);
      next.fallbackByType = next.fallbackByType && typeof next.fallbackByType === 'object' ? next.fallbackByType : {};
      if (type) next.fallbackByType[type] = Math.max(0, Number(next.fallbackByType[type] || 0) || 0) + 1;
    }
    next.updatedAt = nowIso;
    return writeGameStatsRpcSmokeStatus(next);
  }

  function getGameStatsRpcSmokeStatus() {
    const persisted = readGameStatsRpcSmokeStatus();
    const readyForPolicyTightening = persisted.attempts >= 3 && persisted.successes >= 3 && persisted.fallbacks === 0;
    return Object.assign({}, persisted, {
      persistent: true,
      readyForPolicyTightening,
      requiredSuccessesBeforeTightening: 3,
      requiredFallbacksBeforeTightening: 0,
      recommendation: readyForPolicyTightening
        ? 'Po reálném mobilním hraní jsou RPC zápisy game_stats bez fallbacků; je možné připravit úzké zúžení INSERT/UPDATE policies.'
        : 'Před zúžením INSERT/UPDATE policies odehraj na mobilu několik her a zkontroluj, že úspěchy RPC rostou a fallbacky zůstávají 0.'
    });
  }



  const GAME_UI_RPC_SMOKE_STORAGE_KEY = 'rak_game_ui_rpc_smoke_v1';

  function normalizeGameUiRpcSmoke(raw) {
    const base = raw && typeof raw === 'object' ? raw : {};
    return {
      attempts: Math.max(0, Number(base.attempts || 0) || 0),
      successes: Math.max(0, Number(base.successes || 0) || 0),
      fallbacks: Math.max(0, Number(base.fallbacks || 0) || 0),
      lastAttemptAt: base.lastAttemptAt || null,
      lastSuccessAt: base.lastSuccessAt || null,
      lastFallbackAt: base.lastFallbackAt || null,
      lastFallbackReason: String(base.lastFallbackReason || ''),
      updatedAt: base.updatedAt || null
    };
  }

  function readGameUiRpcSmokeStatus() {
    try {
      if (typeof localStorage === 'undefined') return normalizeGameUiRpcSmoke(null);
      return normalizeGameUiRpcSmoke(JSON.parse(localStorage.getItem(GAME_UI_RPC_SMOKE_STORAGE_KEY) || '{}'));
    } catch (err) {
      return normalizeGameUiRpcSmoke(null);
    }
  }

  function writeGameUiRpcSmokeStatus(next) {
    const safe = normalizeGameUiRpcSmoke(next);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(GAME_UI_RPC_SMOKE_STORAGE_KEY, JSON.stringify(safe));
      }
    } catch (err) {}
    SUPABASE_RPC_HARDENING_STATUS.gameUiRpcAttempts = safe.attempts;
    SUPABASE_RPC_HARDENING_STATUS.gameUiRpcSuccesses = safe.successes;
    SUPABASE_RPC_HARDENING_STATUS.gameUiRpcFallbacks = safe.fallbacks;
    SUPABASE_RPC_HARDENING_STATUS.lastGameUiRpcAt = safe.lastSuccessAt;
    SUPABASE_RPC_HARDENING_STATUS.lastGameUiFallbackAt = safe.lastFallbackAt;
    SUPABASE_RPC_HARDENING_STATUS.lastGameUiFallbackReason = safe.lastFallbackReason;
    return safe;
  }

  function rememberGameUiRpcSmoke(kind, reason) {
    const nowIso = new Date().toISOString();
    const next = readGameUiRpcSmokeStatus();
    if (kind === 'attempt') {
      next.attempts += 1;
      next.lastAttemptAt = nowIso;
    } else if (kind === 'success') {
      next.successes += 1;
      next.lastSuccessAt = nowIso;
    } else if (kind === 'fallback') {
      next.fallbacks += 1;
      next.lastFallbackAt = nowIso;
      next.lastFallbackReason = String(reason || 'unknown').slice(0, 180);
    }
    next.updatedAt = nowIso;
    return writeGameUiRpcSmokeStatus(next);
  }

  function getGameUiRpcSmokeStatus() {
    const persisted = readGameUiRpcSmokeStatus();
    const readyForPolicyTightening = persisted.attempts >= 1 && persisted.successes >= 1 && persisted.fallbacks === 0;
    return Object.assign({}, persisted, {
      persistent: true,
      readyForPolicyTightening,
      requiredSuccessesBeforeTightening: 1,
      requiredFallbacksBeforeTightening: 0,
      recommendation: readyForPolicyTightening
        ? 'Profilový vzhled se uložil přes RPC bez fallbacku; je možné připravovat užší policies pro __profile_ui.'
        : 'Před zúžením game_stats INSERT/UPDATE ulož na mobilu theme/pozadí profilu a ověř, že profile UI RPC fallback zůstává 0.'
    });
  }


  const GAME_SESSION_RPC_REQUIRED_GAMES = [
    { key: 'gomoku', label: 'Piškvorky' },
    { key: 'battleship', label: 'Lodě' }
  ];
  const GAME_SESSION_RPC_SMOKE_STORAGE_KEY = 'rak_game_session_rpc_smoke_v2';

  function cloneSmokeCountMap(value) {
    const out = {};
    if (!value || typeof value !== 'object') return out;
    Object.keys(value).forEach((key) => {
      const safeKey = String(key || '').trim().slice(0, 80);
      if (!safeKey) return;
      const num = Math.max(0, Number(value[key] || 0) || 0);
      if (num) out[safeKey] = num;
    });
    return out;
  }

  function cloneSmokeNestedCountMap(value) {
    const out = {};
    if (!value || typeof value !== 'object') return out;
    Object.keys(value).forEach((gameKey) => {
      const safeGame = normalizeGameTypeForSmoke(gameKey);
      if (!safeGame) return;
      const inner = cloneSmokeCountMap(value[gameKey]);
      if (Object.keys(inner).length) out[safeGame] = inner;
    });
    return out;
  }

  function normalizeGameTypeForSmoke(value) {
    const gameType = String(value || '').trim().toLowerCase();
    if (!gameType) return '';
    if (gameType === 'ttt' || gameType === 'gomoku' || gameType === 'piskvorky' || gameType === 'piškvorky') return 'gomoku';
    if (gameType === 'ships' || gameType === 'lode' || gameType === 'lodě' || gameType === 'battleship') return 'battleship';
    return gameType.slice(0, 60);
  }

  function inferGameTypeFromSessionPayload(inviteRow, sessionRow, boardState) {
    const candidates = [
      inviteRow && inviteRow.game_type,
      sessionRow && sessionRow.game_type,
      boardState && boardState.gameType,
      sessionRow && sessionRow.board_state && sessionRow.board_state.gameType,
      inviteRow && inviteRow.payload && inviteRow.payload.gameType
    ];
    for (const item of candidates) {
      const normalized = normalizeGameTypeForSmoke(item);
      if (normalized) return normalized;
    }
    return 'unknown';
  }

  function incrementSmokeCount(map, key) {
    const safeKey = String(key || '').trim().slice(0, 80);
    if (!safeKey) return map;
    map[safeKey] = Math.max(0, Number(map[safeKey] || 0) || 0) + 1;
    return map;
  }

  function incrementNestedSmokeCount(map, gameType, opType) {
    const gameKey = normalizeGameTypeForSmoke(gameType) || 'unknown';
    const opKey = String(opType || '').trim().slice(0, 80);
    if (!opKey) return map;
    map[gameKey] = cloneSmokeCountMap(map[gameKey]);
    map[gameKey][opKey] = Math.max(0, Number(map[gameKey][opKey] || 0) || 0) + 1;
    return map;
  }

  function normalizeGameSessionRpcSmoke(raw) {
    const base = raw && typeof raw === 'object' ? raw : {};
    return {
      attempts: Math.max(0, Number(base.attempts || 0) || 0),
      successes: Math.max(0, Number(base.successes || 0) || 0),
      fallbacks: Math.max(0, Number(base.fallbacks || 0) || 0),
      attemptByType: cloneSmokeCountMap(base.attemptByType),
      successByType: cloneSmokeCountMap(base.successByType),
      fallbackByType: cloneSmokeCountMap(base.fallbackByType),
      attemptByGame: cloneSmokeNestedCountMap(base.attemptByGame),
      successByGame: cloneSmokeNestedCountMap(base.successByGame),
      fallbackByGame: cloneSmokeNestedCountMap(base.fallbackByGame),
      lastAttemptAt: base.lastAttemptAt || null,
      lastAttemptType: String(base.lastAttemptType || ''),
      lastAttemptGameType: normalizeGameTypeForSmoke(base.lastAttemptGameType || ''),
      lastSuccessAt: base.lastSuccessAt || null,
      lastSuccessType: String(base.lastSuccessType || ''),
      lastSuccessGameType: normalizeGameTypeForSmoke(base.lastSuccessGameType || ''),
      lastFallbackAt: base.lastFallbackAt || null,
      lastFallbackType: String(base.lastFallbackType || ''),
      lastFallbackGameType: normalizeGameTypeForSmoke(base.lastFallbackGameType || ''),
      lastFallbackReason: String(base.lastFallbackReason || ''),
      updatedAt: base.updatedAt || null
    };
  }

  function readGameSessionRpcSmokeStatus() {
    try {
      if (typeof localStorage === 'undefined') return normalizeGameSessionRpcSmoke(null);
      return normalizeGameSessionRpcSmoke(JSON.parse(localStorage.getItem(GAME_SESSION_RPC_SMOKE_STORAGE_KEY) || '{}'));
    } catch (err) {
      return normalizeGameSessionRpcSmoke(null);
    }
  }

  function writeGameSessionRpcSmokeStatus(next) {
    const safe = normalizeGameSessionRpcSmoke(next);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(GAME_SESSION_RPC_SMOKE_STORAGE_KEY, JSON.stringify(safe));
      }
    } catch (err) {}
    SUPABASE_RPC_HARDENING_STATUS.gameSessionRpcAttempts = safe.attempts;
    SUPABASE_RPC_HARDENING_STATUS.gameSessionRpcSuccesses = safe.successes;
    SUPABASE_RPC_HARDENING_STATUS.gameSessionRpcFallbacks = safe.fallbacks;
    SUPABASE_RPC_HARDENING_STATUS.lastGameSessionRpcAt = safe.lastSuccessAt;
    SUPABASE_RPC_HARDENING_STATUS.lastGameSessionRpcType = safe.lastSuccessType;
    SUPABASE_RPC_HARDENING_STATUS.lastGameSessionFallbackAt = safe.lastFallbackAt;
    SUPABASE_RPC_HARDENING_STATUS.lastGameSessionFallbackReason = safe.lastFallbackReason;
    SUPABASE_RPC_HARDENING_STATUS.gameSessionRpcSuccessByType = Object.assign({}, safe.successByType || {});
    SUPABASE_RPC_HARDENING_STATUS.gameSessionRpcFallbackByType = Object.assign({}, safe.fallbackByType || {});
    return safe;
  }

  function rememberGameSessionRpcSmoke(kind, opType, reason, gameType) {
    const nowIso = new Date().toISOString();
    const type = String(opType || '').trim();
    const gameKey = normalizeGameTypeForSmoke(gameType) || 'unknown';
    const next = readGameSessionRpcSmokeStatus();
    if (kind === 'attempt') {
      next.attempts += 1;
      next.lastAttemptAt = nowIso;
      next.lastAttemptType = type;
      next.lastAttemptGameType = gameKey;
      next.attemptByType = incrementSmokeCount(next.attemptByType || {}, type);
      next.attemptByGame = incrementNestedSmokeCount(next.attemptByGame || {}, gameKey, type);
    } else if (kind === 'success') {
      next.successes += 1;
      next.lastSuccessAt = nowIso;
      next.lastSuccessType = type;
      next.lastSuccessGameType = gameKey;
      next.successByType = incrementSmokeCount(next.successByType || {}, type);
      next.successByGame = incrementNestedSmokeCount(next.successByGame || {}, gameKey, type);
    } else if (kind === 'fallback') {
      next.fallbacks += 1;
      next.lastFallbackAt = nowIso;
      next.lastFallbackType = type;
      next.lastFallbackGameType = gameKey;
      next.lastFallbackReason = String(reason || 'unknown').slice(0, 180);
      next.fallbackByType = incrementSmokeCount(next.fallbackByType || {}, type);
      next.fallbackByGame = incrementNestedSmokeCount(next.fallbackByGame || {}, gameKey, type);
    }
    next.updatedAt = nowIso;
    return writeGameSessionRpcSmokeStatus(next);
  }

  function getGameSessionRpcSmokeStatus() {
    const persisted = readGameSessionRpcSmokeStatus();
    const successByType = persisted.successByType || {};
    const fallbackByType = persisted.fallbackByType || {};
    const operationCoverage = {
      create: Math.max(0, Number(successByType.create_invite_session || 0) || 0),
      accept: Math.max(0, Number(successByType.accept_invite || 0) || 0),
      save: Math.max(0, Number(successByType.save_session || 0) || 0)
    };
    const fallbackCoverage = {
      create: Math.max(0, Number(fallbackByType.create_invite_session || 0) || 0),
      accept: Math.max(0, Number(fallbackByType.accept_invite || 0) || 0),
      save: Math.max(0, Number(fallbackByType.save_session || 0) || 0)
    };
    const perGameCoverage = {};
    const perGameFallbackCoverage = {};
    const missingGameOperations = [];
    GAME_SESSION_RPC_REQUIRED_GAMES.forEach((game) => {
      const successForGame = persisted.successByGame && persisted.successByGame[game.key] ? persisted.successByGame[game.key] : {};
      const fallbackForGame = persisted.fallbackByGame && persisted.fallbackByGame[game.key] ? persisted.fallbackByGame[game.key] : {};
      const coverage = {
        create: Math.max(0, Number(successForGame.create_invite_session || 0) || 0),
        accept: Math.max(0, Number(successForGame.accept_invite || 0) || 0),
        save: Math.max(0, Number(successForGame.save_session || 0) || 0)
      };
      const fallbacks = {
        create: Math.max(0, Number(fallbackForGame.create_invite_session || 0) || 0),
        accept: Math.max(0, Number(fallbackForGame.accept_invite || 0) || 0),
        save: Math.max(0, Number(fallbackForGame.save_session || 0) || 0)
      };
      perGameCoverage[game.key] = coverage;
      perGameFallbackCoverage[game.key] = fallbacks;
      if (coverage.create < 1) missingGameOperations.push(game.label + ':create');
      if (coverage.accept < 1) missingGameOperations.push(game.label + ':accept');
      if (coverage.save < 1) missingGameOperations.push(game.label + ':save');
      if (fallbacks.create > 0) missingGameOperations.push(game.label + ':create fallback');
      if (fallbacks.accept > 0) missingGameOperations.push(game.label + ':accept fallback');
      if (fallbacks.save > 0) missingGameOperations.push(game.label + ':save fallback');
    });
    const missingOperations = [];
    if (operationCoverage.create < 1) missingOperations.push('create');
    if (operationCoverage.accept < 1) missingOperations.push('accept');
    if (operationCoverage.save < 1) missingOperations.push('save');
    const readyForPolicyTightening = persisted.attempts >= 6 && persisted.successes >= 6 && persisted.fallbacks === 0 && missingGameOperations.length === 0;
    const gameCoverageText = GAME_SESSION_RPC_REQUIRED_GAMES.map((game) => {
      const item = perGameCoverage[game.key] || { create: 0, accept: 0, save: 0 };
      const fb = perGameFallbackCoverage[game.key] || { create: 0, accept: 0, save: 0 };
      return game.label + ' c/a/s ' + item.create + '/' + item.accept + '/' + item.save + ' · fallback ' + (fb.create + fb.accept + fb.save);
    }).join(' | ');
    return Object.assign({}, persisted, {
      persistent: true,
      readyForPolicyTightening,
      requiredSuccessesBeforeTightening: 6,
      requiredFallbacksBeforeTightening: 0,
      operationCoverage,
      fallbackCoverage,
      perGameCoverage,
      perGameFallbackCoverage,
      missingOperations,
      missingGameOperations,
      coverageText: 'create ' + String(operationCoverage.create) + ' · accept ' + String(operationCoverage.accept) + ' · save ' + String(operationCoverage.save),
      gameCoverageText,
      recommendation: readyForPolicyTightening
        ? 'Online pozvánky/session proběhly přes RPC bez fallbacků pro Piškvorky i Lodě ve všech krocích create/accept/save; další omezení game_sessions/game_invites dělat až po dalším ručním dvoumobilovém smoke testu obou her.'
        : 'Před zúžením policies musí být online hry ověřené přes RPC zvlášť pro Piškvorky i Lodě bez fallbacku. Chybí: ' + (missingGameOperations.length ? missingGameOperations.join(', ') : (missingOperations.length ? missingOperations.join(', ') : 'žádné, ale jsou fallbacky nebo málo pokusů')) + '.'
    });
  }
  const SUPABASE_STRUCTURE_REQUIRED_HELPERS = [
    'getClient',
    'runSupabaseOperation',
    'runSharedSupabaseRead',
    'runOptimizedSupabaseWrite',
    'readQueue',
    'enqueueTask',
    'requestRealtimeRefresh',
    'bindRealtime',
    'getSupabasePerformanceHealth',
    'getSupabaseKeepaliveStatus',
    'getSupabaseHardeningStatus',
    'getSupabaseHardeningReadiness'
  ];

  let realtimeRefreshTimer = null;
  let realtimeRebindTimer = null;

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
    const hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
    state.performanceGuard.realtimeRefreshRequests += 1;
    state.performanceGuard.lastRealtimeRefreshRequestAt = Date.now();
    state.performanceGuard.lastRealtimeRefreshTable = event.table || '';
    if (realtimeRefreshTimer) {
      state.performanceGuard.realtimeRefreshCoalesced += 1;
      clearTimeout(realtimeRefreshTimer);
    }
    if (hidden) {
      state.performanceGuard.realtimeRefreshHiddenDefers += 1;
      state.performanceGuard.lastRealtimeRefreshHiddenAt = Date.now();
    }
    const delay = hidden ? SUPABASE_REALTIME_REFRESH_HIDDEN_DELAY_MS : SUPABASE_REALTIME_REFRESH_DELAY_MS;
    realtimeRefreshTimer = setTimeout(async () => {
      realtimeRefreshTimer = null;
      const reason = event.table ? ('supabase-' + event.table) : 'supabase-realtime';
      state.performanceGuard.realtimeRefreshRuns += 1;
      state.performanceGuard.lastRealtimeRefreshRunAt = Date.now();
      state.performanceGuard.lastRealtimeRefreshReason = reason;
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
        state.performanceGuard.realtimeRefreshErrors += 1;
        state.lastError = err;
        console.warn('Supabase realtime refresh failed', err);
      }
    }, delay);
  }


  function scheduleRealtimeRebind(reason, delayMs) {
    const now = Date.now();
    if (!navigator.onLine) {
      state.syncGuard.realtimeRebindSkips += 1;
      state.syncGuard.lastRealtimeRebindSkipAt = now;
      return false;
    }
    if (realtimeRebindTimer) {
      state.syncGuard.realtimeRebindSkips += 1;
      state.syncGuard.lastRealtimeRebindSkipAt = now;
      return false;
    }
    const ms = Math.max(650, Math.min(30000, Number(delayMs) || 1800));
    state.syncGuard.realtimeRebindScheduled += 1;
    state.syncGuard.lastRealtimeRebindScheduleAt = now;
    realtimeRebindTimer = setTimeout(() => {
      realtimeRebindTimer = null;
      if (!navigator.onLine) {
        state.syncGuard.realtimeRebindSkips += 1;
        state.syncGuard.lastRealtimeRebindSkipAt = Date.now();
        return;
      }
      try {
        const hadChannel = !!state.realtimeChannel;
        state.syncGuard.realtimeRebindRuns += 1;
        state.syncGuard.lastRealtimeRebindAt = Date.now();
        bindRealtimeSubscriptions();
        if (!hadChannel && state.realtimeChannel) {
          requestRealtimeRefresh({ table: 'realtime-rebind', eventType: String(reason || 'resume') });
        }
      } catch (err) {
        state.syncGuard.realtimeRebindErrors += 1;
        state.syncGuard.lastRealtimeRebindErrorAt = Date.now();
        state.lastError = err;
        console.warn('Supabase realtime rebind failed', err);
      }
    }, ms);
    return true;
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
      const channel = client.channel('rak-public-live-v1-2-1-104');
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
          scheduleRealtimeRebind('status-' + String(status || 'closed').toLowerCase(), 2200);
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
      id: String(active.id || '').trim(),
      title: String(active.title || '').trim(),
      message: String(active.message || active.text || active.body || '').trim(),
      is_active: active.is_active !== false,
      start_at: String(active.start_at || active.starts_at || active.valid_from || active.from || '').trim(),
      starts_at: String(active.starts_at || active.start_at || active.valid_from || active.from || '').trim(),
      end_at: String(active.end_at || active.ends_at || active.valid_to || active.to || '').trim(),
      ends_at: String(active.ends_at || active.end_at || active.valid_to || active.to || '').trim(),
      marquee: active.marquee === false ? false : true,
      updated_at: String(active.updated_at || active.created_at || '').trim()
    } : null;
  }

  const DASHBOARD_ANNOUNCEMENT_ONLINE_STATUS_KEY = 'rak_dashboard_announcement_online_status_v1';

  function normalizeDashboardAnnouncementForOnline(raw) {
    const base = raw && typeof raw === 'object' ? raw : {};
    return {
      title: String(base.title || '').trim().slice(0, 80),
      message: String(base.message || base.text || base.body || '').trim().slice(0, 500),
      is_active: base.isActive === false || base.is_active === false ? false : true,
      starts_at: String(base.startAt || base.start_at || base.starts_at || base.valid_from || base.from || '').trim() || null,
      ends_at: String(base.endAt || base.end_at || base.ends_at || base.valid_to || base.to || '').trim() || null,
      marquee: base.marquee === false ? false : true
    };
  }

  function cleanAnnouncementRow(row) {
    const out = {};
    Object.keys(row || {}).forEach((key) => {
      if (row[key] !== undefined) out[key] = row[key];
    });
    return out;
  }

  function normalizeAnnouncementOnlineStatus(raw) {
    const base = raw && typeof raw === 'object' ? raw : {};
    return {
      mode: 'dashboard-announcement-rpc-online-v949',
      lastAttemptAt: base.lastAttemptAt || null,
      lastSuccessAt: base.lastSuccessAt || null,
      lastErrorAt: base.lastErrorAt || null,
      lastWriteOk: !!base.lastWriteOk,
      lastClearOk: !!base.lastClearOk,
      lastOperation: String(base.lastOperation || '').slice(0, 80),
      lastAttemptShape: String(base.lastAttemptShape || '').slice(0, 80),
      lastErrorMessage: String(base.lastErrorMessage || '').slice(0, 240),
      lastErrorCode: String(base.lastErrorCode || '').slice(0, 80),
      writePolicyRequired: base.writePolicyRequired === false ? false : true,
      fallback: String(base.fallback || '').slice(0, 120)
    };
  }

  function readDashboardAnnouncementOnlineStatus() {
    return normalizeAnnouncementOnlineStatus(safeReadJson(DASHBOARD_ANNOUNCEMENT_ONLINE_STATUS_KEY, {}));
  }

  function rememberDashboardAnnouncementOnlineStatus(patch) {
    const next = normalizeAnnouncementOnlineStatus(Object.assign({}, readDashboardAnnouncementOnlineStatus(), patch || {}));
    safeWriteJson(DASHBOARD_ANNOUNCEMENT_ONLINE_STATUS_KEY, next);
    return next;
  }

  function supabaseErrorText(err) {
    if (!err) return '';
    return String(err.message || err.details || err.hint || err.code || err.reason || err).slice(0, 240);
  }

  function buildAnnouncementInsertAttempts(payload, nowIso) {
    const rowFull = cleanAnnouncementRow({
      title: payload.title || null,
      message: payload.message,
      is_active: payload.is_active,
      starts_at: payload.starts_at,
      ends_at: payload.ends_at,
      marquee: payload.marquee,
      updated_at: nowIso,
      app_version: String(window.APP_VERSION || '1.2 (1.104)'),
      priority: 0
    });
    return [
      { name: 'title-message-starts-ends-marquee', row: rowFull },
      { name: 'title-message-starts-ends', row: cleanAnnouncementRow({ title: payload.title || null, message: payload.message, is_active: payload.is_active, starts_at: payload.starts_at, ends_at: payload.ends_at, updated_at: nowIso }) },
      { name: 'message-active-updated', row: cleanAnnouncementRow({ title: payload.title || null, message: payload.message, is_active: payload.is_active, updated_at: nowIso }) },
      { name: 'message-active', row: cleanAnnouncementRow({ title: payload.title || null, message: payload.message, is_active: payload.is_active }) },
      { name: 'message-active-no-title', row: cleanAnnouncementRow({ message: payload.message, is_active: payload.is_active }) }
    ];
  }

  async function softDeactivateDashboardAnnouncements(client) {
    const attempts = [
      { name: 'is_active-updated', row: { is_active: false, updated_at: new Date().toISOString() } },
      { name: 'is_active', row: { is_active: false } }
    ];
    let lastErr = null;
    for (const attempt of attempts) {
      try {
        const res = await runSupabaseOperation('announcements.deactivate:' + attempt.name, () => client
          .from('announcements')
          .update(attempt.row)
          .eq('is_active', true), { mode: 'write', timeoutMs: 6500, attempts: 1 });
        if (!res || !res.error) return { ok: true, shape: attempt.name };
        lastErr = res.error;
      } catch (err) {
        lastErr = err;
      }
    }
    return { ok: false, error: lastErr, message: supabaseErrorText(lastErr) };
  }

  function normalizeRpcAnnouncementRow(data, fallback) {
    const row = Array.isArray(data) ? data[0] : data;
    return row && typeof row === 'object'
      ? row
      : cleanAnnouncementRow({
          title: fallback.title || null,
          message: fallback.message,
          is_active: fallback.is_active,
          starts_at: fallback.starts_at,
          ends_at: fallback.ends_at,
          marquee: fallback.marquee,
          updated_at: new Date().toISOString(),
          app_version: String(window.APP_VERSION || '1.2 (1.104)'),
          priority: 0
        });
  }

  async function saveDashboardAnnouncementViaRpc(client, safe, nowIso) {
    try {
      const res = await runSupabaseOperation('announcements.rpc-save', () => client.rpc('rak_save_dashboard_announcement', {
        p_title: safe.title || null,
        p_message: safe.message,
        p_is_active: safe.is_active,
        p_starts_at: safe.starts_at,
        p_ends_at: safe.ends_at,
        p_marquee: safe.marquee,
        p_updated_by: 'rak-admin-ui',
        p_app_version: String(window.APP_VERSION || '1.2 (1.104)'),
        p_priority: 0
      }), { mode: 'write', timeoutMs: 8000, attempts: 1 });
      if (res && res.error) return { ok: false, error: res.error, shape: 'rpc-save' };
      return { ok: true, row: normalizeRpcAnnouncementRow(res && res.data, safe), shape: 'rpc-save' };
    } catch (err) {
      return { ok: false, error: err, shape: 'rpc-save' };
    }
  }

  async function clearDashboardAnnouncementViaRpc(client, nowIso) {
    try {
      const res = await runSupabaseOperation('announcements.rpc-clear', () => client.rpc('rak_clear_dashboard_announcement', {
        p_updated_by: 'rak-admin-ui',
        p_app_version: String(window.APP_VERSION || '1.2 (1.104)')
      }), { mode: 'write', timeoutMs: 8000, attempts: 1 });
      if (res && res.error) return { ok: false, error: res.error, shape: 'rpc-clear' };
      return { ok: true, cleared: true, count: Number(res && res.data || 0), shape: 'rpc-clear' };
    } catch (err) {
      return { ok: false, error: err, shape: 'rpc-clear' };
    }
  }

  async function saveDashboardAnnouncementOnline(payload) {
    const client = getClient();
    const nowIso = new Date().toISOString();
    const safe = normalizeDashboardAnnouncementForOnline(payload || {});
    rememberDashboardAnnouncementOnlineStatus({ lastAttemptAt: nowIso, lastOperation: 'save', lastWriteOk: false, fallback: '' });
    if (!safe.message) {
      const status = rememberDashboardAnnouncementOnlineStatus({ lastErrorAt: nowIso, lastErrorMessage: 'missing-message', lastErrorCode: 'RAK_ANNOUNCEMENT_EMPTY' });
      return { ok: false, reason: 'missing-message', status };
    }
    if (!client || !navigator.onLine) {
      const status = rememberDashboardAnnouncementOnlineStatus({ lastErrorAt: nowIso, lastErrorMessage: 'offline-or-missing-client', lastErrorCode: 'RAK_ANNOUNCEMENT_OFFLINE', fallback: 'local-only' });
      return { ok: false, reason: 'offline-or-missing-client', status };
    }

    const rpc = await saveDashboardAnnouncementViaRpc(client, safe, nowIso);
    if (rpc && rpc.ok) {
      const row = rpc.row;
      state.announcements = [row].concat((state.announcements || []).filter(item => item && item.is_active === false).slice(0, 4));
      safeWriteJson(LOCAL_ANNOUNCEMENTS_KEY, state.announcements);
      state.lastError = null;
      try { requestRealtimeRefresh({ table: 'announcements', eventType: 'client-rpc-save' }); } catch (err) {}
      const status = rememberDashboardAnnouncementOnlineStatus({
        lastSuccessAt: nowIso,
        lastWriteOk: true,
        lastClearOk: false,
        lastAttemptShape: rpc.shape || 'rpc-save',
        lastErrorMessage: '',
        lastErrorCode: '',
        fallback: ''
      });
      return { ok: true, row, shape: rpc.shape || 'rpc-save', status };
    }

    const deactivate = await softDeactivateDashboardAnnouncements(client);
    const attempts = buildAnnouncementInsertAttempts(safe, nowIso);
    let lastErr = rpc && rpc.error ? rpc.error : (deactivate && deactivate.ok ? null : deactivate.error);
    for (const attempt of attempts) {
      try {
        const res = await runSupabaseOperation('announcements.insert:' + attempt.name, () => client
          .from('announcements')
          .insert(attempt.row)
          .select('*')
          .limit(1)
          .maybeSingle(), { mode: 'write', timeoutMs: 7000, attempts: 1 });
        if (!res || !res.error) {
          const row = res && res.data ? res.data : Object.assign({}, attempt.row, { updated_at: nowIso });
          state.announcements = [row].concat((state.announcements || []).filter(item => item && item.is_active === false).slice(0, 4));
          safeWriteJson(LOCAL_ANNOUNCEMENTS_KEY, state.announcements);
          state.lastError = null;
          try { requestRealtimeRefresh({ table: 'announcements', eventType: 'client-save' }); } catch (err) {}
          const status = rememberDashboardAnnouncementOnlineStatus({
            lastSuccessAt: nowIso,
            lastWriteOk: true,
            lastClearOk: false,
            lastAttemptShape: attempt.name,
            lastErrorMessage: deactivate && deactivate.ok ? '' : ('starší aktivní oznámení možná nešlo deaktivovat: ' + supabaseErrorText(deactivate && deactivate.error)),
            lastErrorCode: '',
            fallback: deactivate && deactivate.ok ? '' : 'inserted-latest-active-but-deactivate-failed'
          });
          return { ok: true, row, shape: attempt.name, deactivate, status };
        }
        lastErr = res.error;
      } catch (err) {
        lastErr = err;
      }
    }
    state.lastError = lastErr;
    const status = rememberDashboardAnnouncementOnlineStatus({
      lastErrorAt: nowIso,
      lastWriteOk: false,
      lastAttemptShape: attempts[attempts.length - 1].name,
      lastErrorMessage: supabaseErrorText(lastErr),
      lastErrorCode: String(lastErr && (lastErr.code || lastErr.status || '') || '').slice(0, 80),
      fallback: 'local-only'
    });
    return { ok: false, reason: 'supabase-write-failed', error: lastErr, status };
  }

  async function clearDashboardAnnouncementOnline() {
    const client = getClient();
    const nowIso = new Date().toISOString();
    rememberDashboardAnnouncementOnlineStatus({ lastAttemptAt: nowIso, lastOperation: 'clear', lastClearOk: false, fallback: '' });
    if (!client || !navigator.onLine) {
      const status = rememberDashboardAnnouncementOnlineStatus({ lastErrorAt: nowIso, lastErrorMessage: 'offline-or-missing-client', lastErrorCode: 'RAK_ANNOUNCEMENT_OFFLINE', fallback: 'local-only' });
      return { ok: false, reason: 'offline-or-missing-client', status };
    }
    const rpc = await clearDashboardAnnouncementViaRpc(client, nowIso);
    const result = rpc && rpc.ok ? rpc : await softDeactivateDashboardAnnouncements(client);
    if (result.ok) {
      state.announcements = [];
      safeWriteJson(LOCAL_ANNOUNCEMENTS_KEY, state.announcements);
      try { requestRealtimeRefresh({ table: 'announcements', eventType: rpc && rpc.ok ? 'client-rpc-clear' : 'client-clear' }); } catch (err) {}
      const status = rememberDashboardAnnouncementOnlineStatus({ lastSuccessAt: nowIso, lastClearOk: true, lastWriteOk: false, lastErrorMessage: '', lastErrorCode: '', lastAttemptShape: result.shape || '' });
      return { ok: true, cleared: true, status };
    }
    state.lastError = result.error || state.lastError;
    const status = rememberDashboardAnnouncementOnlineStatus({
      lastErrorAt: nowIso,
      lastErrorMessage: result.message || supabaseErrorText(result.error),
      lastErrorCode: String(result.error && (result.error.code || result.error.status || '') || '').slice(0, 80),
      fallback: 'local-clear-only'
    });
    return { ok: false, reason: 'supabase-clear-failed', error: result.error, status };
  }

  function getDashboardAnnouncementOnlineStatus() {
    const status = readDashboardAnnouncementOnlineStatus();
    return Object.assign({}, status, {
      ok: true,
      hasClient: !!getClient(),
      online: typeof navigator === 'undefined' ? false : !!navigator.onLine,
      cachedAnnouncementCount: Array.isArray(state.announcements) ? state.announcements.length : 0,
      table: 'announcements',
      realtimeChannel: 'rak-public-live-v1-2-1-104',
      readMode: 'public SELECT + realtime refresh + local cache fallback',
      writeMode: 'RPC security definer save/clear; direct table fallback only if RPC unavailable'
    });
  }

  function getCanteenStatus() {
    return null;
  }

  const LOCAL_STATE_KEY = 'rotace_supabase_local_state_v1';
  const LOCAL_QUEUE_KEY = 'rotace_supabase_queue_v1';
  const LOCAL_ANNOUNCEMENTS_KEY = 'rotace_supabase_announcements_v1';
  const LOCAL_MACHINE_SETTINGS_KEY = 'rotace_supabase_machine_settings_v1';
  const LOCAL_GAME_ACCOUNTS_KEY = 'rotace_supabase_game_accounts_v1';
  const LOCAL_GAME_STATS_PREFIX = 'rotace_supabase_game_stats_v856:';
  const LOCAL_GAME_UI_SETTINGS_PREFIX = 'rotace_supabase_game_ui_settings_v1:';
  const LOCAL_GAME_SESSIONS_PREFIX = 'rotace_supabase_game_sessions_v856:';
  const GAME_UI_SETTINGS_TYPE = '__profile_ui';
  const GAME_PROGRESS_RESET_VERSION = 'v.1.5 (926)';
  const GAME_PROGRESS_RESET_CUTOFF_ISO = '2026-05-26T15:08:00+02:00';
  const GAME_PROGRESS_RESET_CUTOFF_MS = Date.parse(GAME_PROGRESS_RESET_CUTOFF_ISO);
  const SUPABASE_GAME_CACHE_TTL_MS = 30 * 1000;
  const SUPABASE_WRITE_DEDUPE_WINDOW_MS = 1400;
  const SUPABASE_WRITE_FINGERPRINT_LIMIT = 180000;
  const SUPABASE_KEEPALIVE_STORAGE_KEY = 'rak_supabase_keepalive_v1';
  const SUPABASE_KEEPALIVE_DEVICE_KEY = 'rak_supabase_keepalive_device_v1';
  const SUPABASE_KEEPALIVE_MIN_INTERVAL_MS = 12 * 60 * 60 * 1000;
  const SUPABASE_KEEPALIVE_TIMEOUT_MS = 6500;
  const SUPABASE_KEEPALIVE_RETRY_INTERVAL_MS = 5 * 60 * 1000;
  const APP_USAGE_DEVICE_KEY = 'rak_app_usage_device_v1';
  const APP_USAGE_STATUS_KEY = 'rak_app_usage_status_v1';
  const APP_USAGE_MIN_INTERVAL_MS = 8 * 60 * 1000;
  const APP_USAGE_TIMEOUT_MS = 8000;
  const APP_USAGE_ADMIN_PIN = '772326';
  let flushPromise = null;
  let flushScheduleTimer = null;
  let lastQueueWakeRequestAt = 0;
  const sharedReadPromises = new Map();
  const sharedWritePromises = new Map();
  const recentWriteFingerprints = new Map();

  function safeReadJson(key, fallback) {
    try {
      if (typeof parseLocalStorageJsonCached === 'function') {
        state.cacheGuard.localJsonReadDelegations += 1;
        return parseLocalStorageJsonCached(key, fallback);
      }
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
      const payload = JSON.stringify(value);
      if (typeof setLocalStorageIfChanged === 'function') {
        state.cacheGuard.localJsonWriteDelegations += 1;
        const changed = setLocalStorageIfChanged(key, payload);
        if (!changed) state.cacheGuard.localJsonWriteSkips += 1;
        return true;
      }
      localStorage.setItem(key, payload);
      return true;
    } catch (err) {
      return false;
    }
  }


  function normalizeSupabaseKeepalive(raw) {
    const base = raw && typeof raw === 'object' ? raw : {};
    return {
      status: String(base.status || 'unknown'),
      label: String(base.label || 'neznámá'),
      attempts: Math.max(0, Number(base.attempts || 0) || 0),
      successes: Math.max(0, Number(base.successes || 0) || 0),
      failures: Math.max(0, Number(base.failures || 0) || 0),
      skips: Math.max(0, Number(base.skips || 0) || 0),
      lastAttemptAt: base.lastAttemptAt || null,
      lastSuccessAt: base.lastSuccessAt || null,
      lastErrorAt: base.lastErrorAt || null,
      lastErrorMessage: String(base.lastErrorMessage || '').slice(0, 220),
      lastErrorCode: String(base.lastErrorCode || '').slice(0, 80),
      lastReason: String(base.lastReason || '').slice(0, 80),
      lastDeviceKey: String(base.lastDeviceKey || '').slice(0, 96),
      lastDurationMs: Math.max(0, Number(base.lastDurationMs || 0) || 0),
      lastHttpStatus: base.lastHttpStatus === null || base.lastHttpStatus === undefined ? null : (Number(base.lastHttpStatus) || null),
      lastClassification: String(base.lastClassification || 'unknown').slice(0, 80),
      lastTransport: String(base.lastTransport || '').slice(0, 40),
      lastAppVersion: String(base.lastAppVersion || '').slice(0, 40),
      lastSkipReason: String(base.lastSkipReason || '').slice(0, 120),
      lastSkipAt: base.lastSkipAt || null,
      minIntervalHours: Math.round(SUPABASE_KEEPALIVE_MIN_INTERVAL_MS / 60 / 60 / 1000),
      table: 'app_keepalive'
    };
  }

  function readSupabaseKeepaliveState() {
    return normalizeSupabaseKeepalive(safeReadJson(SUPABASE_KEEPALIVE_STORAGE_KEY, {}));
  }

  function writeSupabaseKeepaliveState(next) {
    const safe = normalizeSupabaseKeepalive(next);
    Object.assign(state.keepalive, safe);
    safeWriteJson(SUPABASE_KEEPALIVE_STORAGE_KEY, safe);
    return safe;
  }

  function getKeepaliveLabel(status) {
    if (status === 'ok') return 'OK';
    if (status === 'possibly_paused') return 'možná paused';
    if (status === 'unavailable') return 'nedostupná';
    if (status === 'skipped') return 'čeká na interval';
    if (status === 'offline') return 'offline';
    return 'neznámá';
  }

  function ensureSupabaseKeepaliveDeviceKey() {
    try {
      let key = String(localStorage.getItem(SUPABASE_KEEPALIVE_DEVICE_KEY) || '').trim();
      if (/^rak-[a-z0-9]{10,}$/i.test(key)) return key.slice(0, 96);
      const hasCrypto = typeof crypto !== 'undefined' && crypto && typeof crypto.getRandomValues === 'function';
      const rnd = hasCrypto
        ? Array.from(crypto.getRandomValues(new Uint32Array(3))).map(n => n.toString(36)).join('')
        : (Date.now().toString(36) + Math.random().toString(36).slice(2, 12));
      key = ('rak-' + rnd).slice(0, 80);
      localStorage.setItem(SUPABASE_KEEPALIVE_DEVICE_KEY, key);
      return key;
    } catch (err) {
      return ('rak-memory-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).slice(0, 80);
    }
  }

  function classifySupabaseKeepaliveError(err) {
    const msg = String(err && (err.message || err.error_description || err.details || err.hint || err.statusText || err.code || err.status) ? (err.message || err.error_description || err.details || err.hint || err.statusText || err.code || err.status) : err || '').toLowerCase();
    const code = String(err && (err.code || err.status || err.statusCode) || '').trim();
    const status = Number(err && (err.status || err.statusCode || err.code));
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return { status: 'offline', label: getKeepaliveLabel('offline'), classification: 'offline', httpStatus: Number.isFinite(status) ? status : null, code };
    if (msg.includes('paused') || msg.includes('project is paused') || msg.includes('project is not active') || msg.includes('inactive') || [502, 503, 504, 521, 522, 523, 524].includes(status)) {
      return { status: 'possibly_paused', label: getKeepaliveLabel('possibly_paused'), classification: 'paused-or-gateway', httpStatus: Number.isFinite(status) ? status : null, code };
    }
    if (msg.includes('relation') && msg.includes('app_keepalive')) {
      return { status: 'unavailable', label: getKeepaliveLabel('unavailable'), classification: 'missing-app_keepalive-table', httpStatus: Number.isFinite(status) ? status : null, code };
    }
    if (msg.includes('violates row-level security') || msg.includes('permission denied') || status === 401 || status === 403) {
      return { status: 'unavailable', label: getKeepaliveLabel('unavailable'), classification: 'rls-or-permission', httpStatus: Number.isFinite(status) ? status : null, code };
    }
    if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('timeout') || msg.includes('load failed') || msg.includes('abort')) {
      return { status: 'unavailable', label: getKeepaliveLabel('unavailable'), classification: 'network-or-timeout', httpStatus: Number.isFinite(status) ? status : null, code };
    }
    return { status: 'unavailable', label: getKeepaliveLabel('unavailable'), classification: 'unknown-error', httpStatus: Number.isFinite(status) ? status : null, code };
  }

  function shouldRunSupabaseKeepalive(options) {
    const opts = options || {};
    if (opts.force) return { ok: true };
    const current = readSupabaseKeepaliveState();
    const now = Date.now();
    const appVersion = String(window.APP_VERSION || '').trim();
    const lastSuccess = Date.parse(current.lastSuccessAt || '') || 0;
    const lastAttempt = Date.parse(current.lastAttemptAt || '') || 0;
    const hadSuccessfulHeartbeat = !!lastSuccess;

    if (!hadSuccessfulHeartbeat) {
      const rlsError = current.lastClassification === 'rls-or-permission' || /row-level security|permission denied/i.test(String(current.lastErrorMessage || ''));
      const appChanged = !!appVersion && current.lastAppVersion !== appVersion;
      if (rlsError || appChanged || current.lastTransport !== 'rpc') {
        return { ok: true, current, reason: 'retry-after-heartbeat-fix' };
      }
      if (lastAttempt && now - lastAttempt < SUPABASE_KEEPALIVE_RETRY_INTERVAL_MS) {
        return { ok: false, reason: 'retry-wait', current };
      }
      return { ok: true, current, reason: 'no-success-yet' };
    }

    if (lastSuccess && now - lastSuccess < SUPABASE_KEEPALIVE_MIN_INTERVAL_MS) {
      return { ok: false, reason: 'interval', current };
    }
    return { ok: true, current };
  }

  async function runSupabaseKeepalive(reason, options) {
    const opts = options || {};
    const current = readSupabaseKeepaliveState();
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const next = writeSupabaseKeepaliveState(Object.assign({}, current, {
        status: 'offline', label: getKeepaliveLabel('offline'), lastReason: String(reason || 'offline'), lastSkipReason: 'offline', lastSkipAt: new Date().toISOString(), skips: current.skips + 1
      }));
      return { ok: false, skipped: true, reason: 'offline', status: next };
    }
    const allowed = shouldRunSupabaseKeepalive(opts);
    if (!allowed.ok) {
      const keepCurrentError = !current.lastSuccessAt && (current.status === 'unavailable' || current.status === 'possibly_paused');
      const next = writeSupabaseKeepaliveState(Object.assign({}, current, {
        status: keepCurrentError ? current.status : (current.status === 'ok' ? 'ok' : 'skipped'),
        label: keepCurrentError ? current.label : (current.status === 'ok' ? getKeepaliveLabel('ok') : getKeepaliveLabel('skipped')),
        lastSkipReason: allowed.reason || 'interval',
        lastSkipAt: new Date().toISOString(),
        lastReason: String(reason || current.lastReason || 'scheduled').slice(0, 80),
        lastAppVersion: String(window.APP_VERSION || '').trim().slice(0, 40),
        lastTransport: current.lastTransport || 'rpc',
        skips: current.skips + 1
      }));
      return { ok: true, skipped: true, reason: allowed.reason || 'interval', status: next };
    }
    const client = getClient();
    if (!client) {
      const next = writeSupabaseKeepaliveState(Object.assign({}, current, {
        status: 'unavailable', label: getKeepaliveLabel('unavailable'), failures: current.failures + 1, lastErrorAt: new Date().toISOString(), lastErrorMessage: 'Supabase klient není připravený.', lastClassification: 'missing-client', lastReason: String(reason || 'init')
      }));
      return { ok: false, reason: 'missing-client', status: next };
    }

    const started = Date.now();
    const nowIso = new Date().toISOString();
    const deviceKey = ensureSupabaseKeepaliveDeviceKey();
    const attemptBase = Object.assign({}, current, {
      attempts: current.attempts + 1,
      lastAttemptAt: nowIso,
      lastReason: String(reason || 'init').slice(0, 80),
      lastDeviceKey: deviceKey,
      lastAppVersion: String(window.APP_VERSION || '').trim().slice(0, 40),
      lastTransport: 'rpc'
    });
    writeSupabaseKeepaliveState(Object.assign({}, attemptBase, { status: current.status || 'unknown', label: current.label || getKeepaliveLabel(current.status || 'unknown') }));

    const payload = {
      device_key: deviceKey,
      app_version: String(window.APP_VERSION || '').trim().slice(0, 40) || null,
      heartbeat_at: nowIso,
      user_agent: String((typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '').slice(0, 300),
      payload: {
        reason: String(reason || 'init').slice(0, 80),
        timezone: (typeof Intl !== 'undefined' && Intl.DateTimeFormat) ? (Intl.DateTimeFormat().resolvedOptions().timeZone || '') : '',
        online: typeof navigator !== 'undefined' ? navigator.onLine !== false : true,
        transport: 'rpc',
        build: '850'
      }
    };

    try {
      const rpcArgs = {
        p_device_key: payload.device_key,
        p_app_version: payload.app_version,
        p_user_agent: payload.user_agent,
        p_payload: payload.payload
      };
      const result = await runSupabaseOperation('app_keepalive.rpc', () => client.rpc('rak_app_keepalive', rpcArgs), { mode: 'write', attempts: 1, timeoutMs: SUPABASE_KEEPALIVE_TIMEOUT_MS });
      if (result && result.error) throw result.error;
      const next = writeSupabaseKeepaliveState(Object.assign({}, attemptBase, {
        status: 'ok', label: getKeepaliveLabel('ok'), successes: current.successes + 1, lastSuccessAt: new Date().toISOString(), lastErrorMessage: '', lastErrorCode: '', lastErrorAt: current.lastErrorAt || null, lastDurationMs: Date.now() - started, lastHttpStatus: null, lastClassification: 'ok-rpc', lastTransport: 'rpc', lastAppVersion: String(window.APP_VERSION || '').trim().slice(0, 40)
      }));
      return { ok: true, status: next };
    } catch (err) {
      const classified = classifySupabaseKeepaliveError(err);
      const next = writeSupabaseKeepaliveState(Object.assign({}, attemptBase, {
        status: classified.status,
        label: classified.label,
        failures: current.failures + 1,
        lastErrorAt: new Date().toISOString(),
        lastErrorMessage: String(err && (err.message || err.details || err.hint || err.code || err.status) ? (err.message || err.details || err.hint || err.code || err.status) : err || 'unknown').slice(0, 220),
        lastErrorCode: classified.code || '',
        lastDurationMs: Date.now() - started,
        lastHttpStatus: classified.httpStatus,
        lastClassification: classified.classification
      }));
      return { ok: false, error: err, status: next };
    }
  }

  function scheduleSupabaseKeepalive(reason, delayMs, options) {
    const delay = Math.max(0, Number(delayMs) || 0);
    setTimeout(() => {
      try { void runSupabaseKeepalive(reason || 'scheduled', options || {}); }
      catch (err) { console.warn('Supabase keepalive schedule failed', err); }
    }, delay);
  }

  function getSupabaseKeepaliveStatus() {
    const current = readSupabaseKeepaliveState();
    const online = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
    const ageMs = current.lastSuccessAt ? (Date.now() - (Date.parse(current.lastSuccessAt) || 0)) : null;
    const stale = Number.isFinite(ageMs) && ageMs > 36 * 60 * 60 * 1000;
    const issues = [];
    if (!online) issues.push('zařízení je offline');
    if (!current.lastSuccessAt) issues.push('heartbeat ještě nemá úspěšný zápis');
    if (current.status === 'possibly_paused') issues.push('Supabase může být paused nebo gateway nedostupná');
    if (current.status === 'unavailable') issues.push('Supabase heartbeat je nedostupný: ' + String(current.lastClassification || 'neznámý důvod'));
    if (stale) issues.push('poslední úspěšný heartbeat je starší než 36 hodin');
    return Object.assign({}, current, {
      ok: current.status === 'ok' && !!current.lastSuccessAt,
      online,
      stale,
      ageMs: Number.isFinite(ageMs) ? ageMs : null,
      minIntervalMs: SUPABASE_KEEPALIVE_MIN_INTERVAL_MS,
      retryIntervalMs: SUPABASE_KEEPALIVE_RETRY_INTERVAL_MS,
      timeoutMs: SUPABASE_KEEPALIVE_TIMEOUT_MS,
      issues: issues.slice(0, 8),
      checkedAt: new Date().toISOString()
    });
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
      state.performanceGuard.sharedReadJoins += 1;
      state.cacheGuard.lastSharedReadAt = Date.now();
      state.performanceGuard.lastSharedReadAt = Date.now();
      state.performanceGuard.lastSharedReadKey = readKey;
      return await sharedReadPromises.get(readKey);
    }
    state.performanceGuard.sharedReadStarts += 1;
    state.performanceGuard.sharedReadActive += 1;
    state.performanceGuard.sharedReadPeak = Math.max(Number(state.performanceGuard.sharedReadPeak || 0), Number(state.performanceGuard.sharedReadActive || 0));
    state.performanceGuard.lastSharedReadAt = Date.now();
    state.performanceGuard.lastSharedReadKey = readKey;
    const promise = Promise.resolve().then(work).finally(() => {
      sharedReadPromises.delete(readKey);
      state.performanceGuard.sharedReadActive = Math.max(0, Number(state.performanceGuard.sharedReadActive || 0) - 1);
    });
    sharedReadPromises.set(readKey, promise);
    return await promise;
  }
  function getSupabaseWriteFingerprint(value) {
    let raw = '';
    try { raw = JSON.stringify(value === undefined ? null : value); }
    catch (err) { raw = String(value === undefined ? null : value); }
    if (raw.length > SUPABASE_WRITE_FINGERPRINT_LIMIT) raw = raw.slice(0, SUPABASE_WRITE_FINGERPRINT_LIMIT) + ':truncated:' + raw.length;
    let hash = 5381;
    for (let i = 0; i < raw.length; i += 1) {
      hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
    }
    return String(raw.length) + ':' + String(hash >>> 0);
  }

  function pruneRecentWriteFingerprints() {
    const now = Date.now();
    for (const [key, item] of recentWriteFingerprints.entries()) {
      if (!item || now - Number(item.at || 0) > SUPABASE_WRITE_DEDUPE_WINDOW_MS * 6) recentWriteFingerprints.delete(key);
    }
    while (recentWriteFingerprints.size > 32) {
      const firstKey = recentWriteFingerprints.keys().next().value;
      if (!firstKey) break;
      recentWriteFingerprints.delete(firstKey);
    }
  }

  async function runOptimizedSupabaseWrite(key, payload, work, options) {
    const baseKey = String(key || 'supabase.write').trim() || 'supabase.write';
    const opts = options || {};
    const windowMs = Math.max(500, Math.min(6000, Number(opts.windowMs) || SUPABASE_WRITE_DEDUPE_WINDOW_MS));
    const fingerprint = getSupabaseWriteFingerprint(payload);
    const writeKey = baseKey + ':' + fingerprint;
    const now = Date.now();
    state.performanceGuard.writeOptimizationChecks += 1;
    state.performanceGuard.lastWriteOptimizationKey = baseKey;
    state.performanceGuard.lastWriteOptimizationAt = now;

    if (sharedWritePromises.has(writeKey)) {
      state.performanceGuard.writeOptimizationJoins += 1;
      state.performanceGuard.lastWriteOptimizationJoinAt = now;
      return await sharedWritePromises.get(writeKey);
    }

    const recent = recentWriteFingerprints.get(writeKey);
    if (recent && now - Number(recent.at || 0) <= windowMs) {
      state.performanceGuard.writeOptimizationSkips += 1;
      state.performanceGuard.lastWriteOptimizationSkipAt = now;
      return recent.result;
    }

    state.performanceGuard.writeOptimizationStarts += 1;
    state.performanceGuard.writeOptimizationActive += 1;
    state.performanceGuard.writeOptimizationPeak = Math.max(Number(state.performanceGuard.writeOptimizationPeak || 0), Number(state.performanceGuard.writeOptimizationActive || 0));

    const promise = Promise.resolve().then(work).then((result) => {
      recentWriteFingerprints.set(writeKey, { at: Date.now(), result });
      pruneRecentWriteFingerprints();
      return result;
    }).finally(() => {
      sharedWritePromises.delete(writeKey);
      state.performanceGuard.writeOptimizationActive = Math.max(0, Number(state.performanceGuard.writeOptimizationActive || 0) - 1);
    });
    sharedWritePromises.set(writeKey, promise);
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
    if (type === 'bug_report') return type + ':' + String(task && task.entry && (task.entry.id || task.entry.created_at || task.entry.createdAt) ? (task.entry.id || task.entry.created_at || task.entry.createdAt) : '').trim();
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

  function isGameProgressQueueTaskBeforeReset(task) {
    const type = String(task && task.type || '').trim();
    if (type !== 'game_stat' && type !== 'game_session' && type !== 'gomoku_win') return false;
    const queuedAt = Date.parse(String(task && (task.queuedAt || task.createdAt || task.created_at) || ''));
    return Number.isFinite(GAME_PROGRESS_RESET_CUTOFF_MS) && Number.isFinite(queuedAt) && queuedAt < GAME_PROGRESS_RESET_CUTOFF_MS;
  }

  function compactQueue(queue) {
    const source = Array.isArray(queue) ? queue : [];
    const keyed = new Map();
    const passthrough = [];
    source.forEach((item) => {
      const normalized = normalizeQueueTask(item);
      if (!normalized) return;
      if (isGameProgressQueueTaskBeforeReset(normalized)) {
        state.queueGuard.trimmed += 1;
        return;
      }
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

  function isSupabaseRpcUnavailableError(err) {
    const text = String((err && (err.message || err.details || err.hint || err.code)) || err || '').toLowerCase();
    return /pgrst202|function .*does not exist|could not find.*function|schema cache|rpc.*not found|not found/.test(text);
  }

  function normalizeMachineSettingsPayload(row) {
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

    return {
      machine_key,
      machine_code: machineCode || null,
      machine_index: machineIndex || null,
      label,
      category,
      speed: Number.isFinite(cycleTime) ? cycleTime : null,
      cycle_time: Number.isFinite(cycleTime) ? cycleTime : null,
      dress_time: Number.isFinite(dressTime) ? dressTime : null,
      dress_count: Number.isFinite(dressCount) ? dressCount : null,
      settings_json: Object.assign({}, settings, {
        machine: machineCode,
        index: machineIndex,
        cycle_time: row && row.cycle_time !== '' && row.cycle_time !== null && row.cycle_time !== undefined ? String(row.cycle_time) : (row && row.speed !== '' && row.speed !== null && row.speed !== undefined ? String(row.speed) : ''),
        dress_time: row && row.dress_time !== '' && row.dress_time !== null && row.dress_time !== undefined ? String(row.dress_time) : '',
        dress_count: row && row.dress_count !== '' && row.dress_count !== null && row.dress_count !== undefined ? String(row.dress_count) : ''
      }),
      updated_at: new Date().toISOString()
    };
  }

  async function trySaveMachineSettingsViaRpc(client, payloads) {
    if (!client || typeof client.rpc !== 'function' || !Array.isArray(payloads) || !payloads.length) return null;
    try {
      const { data, error } = await client.rpc('rak_save_machine_settings', { p_rows: payloads });
      if (error) throw error;
      return {
        ok: true,
        rpc: true,
        savedCount: Number((data && (data.saved_count || data.count)) || data || payloads.length) || payloads.length
      };
    } catch (err) {
      if (isSupabaseRpcUnavailableError(err)) {
        SUPABASE_RPC_HARDENING_STATUS.lastUnavailableAt = new Date().toISOString();
        SUPABASE_RPC_HARDENING_STATUS.lastUnavailableMessage = String(err && err.message ? err.message : err);
        return null;
      }
      throw err;
    }
  }

  async function trySaveRotationStateViaRpc(client, row) {
    if (!client || typeof client.rpc !== 'function' || !row) return null;
    try {
      const { data, error } = await client.rpc('rak_save_rotation_state', {
        p_key: row.key || 'main',
        p_payload: row.payload || null,
        p_meta: row.meta || {}
      });
      if (error) throw error;
      return data || row;
    } catch (err) {
      if (isSupabaseRpcUnavailableError(err)) {
        SUPABASE_RPC_HARDENING_STATUS.lastUnavailableAt = new Date().toISOString();
        SUPABASE_RPC_HARDENING_STATUS.lastUnavailableMessage = String(err && err.message ? err.message : err);
        return null;
      }
      throw err;
    }
  }

  async function upsertMachineSettingsDirect(client, rows) {
    const list = Array.isArray(rows) ? rows : [];
    const payloads = list
      .map((row) => normalizeMachineSettingsPayload(row))
      .filter((payload) => payload && payload.machine_key && payload.label);

    const isFoodPayload = (payload) => String(payload && payload.category || '').trim() === 'food_schedule' || String(payload && payload.machine_key || '').trim() === 'FOOD_SCHEDULE_SETTINGS';
    const foodPayloads = payloads.filter(isFoodPayload);
    const machinePayloads = payloads.filter((payload) => !isFoodPayload(payload));

    let savedCount = 0;
    if (machinePayloads.length) {
      const rpcResult = await trySaveMachineSettingsViaRpc(client, machinePayloads);
      if (rpcResult && rpcResult.ok) savedCount += Number(rpcResult.savedCount || machinePayloads.length) || machinePayloads.length;
      else {
        for (const payload of machinePayloads) {
          const { error } = await client.from('machine_settings').upsert([payload], { onConflict: 'machine_key' });
          if (error) throw error;
          savedCount += 1;
        }
      }
    }

    // v1003: Kantýna / jídelna je samostatná admin sekce a používá kategorii food_schedule.
    // Starší RPC rak_save_machine_settings validuje jen strojové kategorie a vrací "invalid category".
    // Food řádek proto ukládáme přímo do machine_settings; DB schema to povoluje a ukládací formát zůstává stejný.
    for (const payload of foodPayloads) {
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

    const rpcRow = await trySaveRotationStateViaRpc(client, row);
    if (rpcRow) {
      return {
        key: rpcRow.key || row.key,
        payload: rpcRow.payload || row.payload,
        meta: rpcRow.meta || row.meta,
        updated_at: rpcRow.updated_at || row.updated_at
      };
    }

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
      created_at: String(entry && entry.date ? entry.date : new Date().toISOString()).trim(),
      elapsed_ms: Number(entry && entry.elapsedMs ? entry.elapsedMs : 0) || 0,
      elapsed_text: String(entry && entry.elapsedText ? entry.elapsedText : '').trim(),
      x_moves: Number(entry && entry.xMoves ? entry.xMoves : 0) || 0,
      o_moves: Number(entry && entry.oMoves ? entry.oMoves : 0) || 0,
      ruleset_version: String((entry && (entry.rulesetVersion || entry.ruleset_version)) || window.GOMOKU_RULESET_VERSION || 'gomoku-10col-19row-ai-rules-v3').trim() || 'gomoku-10col-19row-ai-rules-v3'
    };
    const { data, error } = await client.from('gomoku_wins').insert([payload]).select('*');
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }


  function normalizeAppUsageStatus(raw) {
    const base = raw && typeof raw === 'object' ? raw : {};
    return {
      ok: base.ok === true,
      status: String(base.status || (base.ok ? 'ok' : 'unknown')).slice(0, 60),
      lastAttemptAt: base.lastAttemptAt || null,
      lastSuccessAt: base.lastSuccessAt || null,
      lastErrorAt: base.lastErrorAt || null,
      lastErrorMessage: String(base.lastErrorMessage || '').slice(0, 220),
      lastEventType: String(base.lastEventType || '').slice(0, 80),
      lastDeviceKey: String(base.lastDeviceKey || '').slice(0, 96),
      lastAppVersion: String(base.lastAppVersion || '').slice(0, 60),
      lastSkipReason: String(base.lastSkipReason || '').slice(0, 120),
      skipped: Number(base.skipped || 0) || 0,
      attempts: Number(base.attempts || 0) || 0,
      successes: Number(base.successes || 0) || 0,
      failures: Number(base.failures || 0) || 0,
      table: 'app_usage_devices/app_usage_events'
    };
  }

  function readAppUsageStatus() {
    return normalizeAppUsageStatus(safeReadJson(APP_USAGE_STATUS_KEY, {}));
  }

  function writeAppUsageStatus(next) {
    const safe = normalizeAppUsageStatus(next);
    safeWriteJson(APP_USAGE_STATUS_KEY, safe);
    return safe;
  }

  function ensureAppUsageDeviceKey() {
    try {
      let key = String(localStorage.getItem(APP_USAGE_DEVICE_KEY) || '').trim();
      if (/^rakd-[a-z0-9]{10,}$/i.test(key)) return key.slice(0, 96);
      const keepaliveKey = String(localStorage.getItem(SUPABASE_KEEPALIVE_DEVICE_KEY) || '').trim();
      if (/^rak-[a-z0-9]{10,}$/i.test(keepaliveKey)) {
        key = ('rakd-' + keepaliveKey.replace(/^rak-/i, '')).slice(0, 90);
        localStorage.setItem(APP_USAGE_DEVICE_KEY, key);
        return key;
      }
      const hasCrypto = typeof crypto !== 'undefined' && crypto && typeof crypto.getRandomValues === 'function';
      const rnd = hasCrypto
        ? Array.from(crypto.getRandomValues(new Uint32Array(4))).map(n => n.toString(36)).join('')
        : (Date.now().toString(36) + Math.random().toString(36).slice(2, 14));
      key = ('rakd-' + rnd).slice(0, 90);
      localStorage.setItem(APP_USAGE_DEVICE_KEY, key);
      return key;
    } catch (err) {
      return ('rakd-memory-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).slice(0, 90);
    }
  }

  function getAppUsageAccount() {
    try {
      if (typeof gamesGetActiveAccount === 'function') return gamesGetActiveAccount();
    } catch (err) {}
    try {
      const profile = typeof gamesGetProfile === 'function' ? gamesGetProfile() : (typeof app !== 'undefined' && app ? app.gamesProfile : null);
      if (profile && profile.activeAccountId && profile.accounts) return profile.accounts[profile.activeAccountId] || null;
    } catch (err) {}
    return null;
  }

  function getAppUsageRoute() {
    try {
      const page = document.querySelector('.page.active');
      const id = page && page.id ? String(page.id) : '';
      const game = typeof app !== 'undefined' && app && app.activeGameShell ? String(app.activeGameShell) : '';
      return [id || 'home', game].filter(Boolean).join(' · ').slice(0, 200);
    } catch (err) {
      return 'unknown';
    }
  }

  function getAppUsageDeviceInfo(extra) {
    const ex = extra && typeof extra === 'object' ? extra : {};
    const viewport = typeof window !== 'undefined' ? {
      width: Math.round(Number(window.innerWidth || 0) || 0),
      height: Math.round(Number(window.innerHeight || 0) || 0),
      dpr: Math.round((Number(window.devicePixelRatio || 1) || 1) * 100) / 100
    } : {};
    const screenInfo = typeof screen !== 'undefined' && screen ? {
      width: Math.round(Number(screen.width || 0) || 0),
      height: Math.round(Number(screen.height || 0) || 0)
    } : {};
    const nav = typeof navigator !== 'undefined' ? navigator : {};
    const connection = nav && nav.connection ? nav.connection : null;
    return Object.assign({
      viewport,
      screen: screenInfo,
      language: String(nav.language || '').slice(0, 40),
      platform: String(nav.platform || '').slice(0, 80),
      timezone: (typeof Intl !== 'undefined' && Intl.DateTimeFormat) ? String(Intl.DateTimeFormat().resolvedOptions().timeZone || '').slice(0, 80) : '',
      standalone: !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches),
      visibility: typeof document !== 'undefined' ? String(document.visibilityState || '') : '',
      connection: connection ? {
        effectiveType: String(connection.effectiveType || '').slice(0, 40),
        downlink: Number(connection.downlink || 0) || 0,
        saveData: !!connection.saveData
      } : null,
      source: 'rak-v993-client'
    }, ex.deviceInfo && typeof ex.deviceInfo === 'object' ? ex.deviceInfo : {});
  }

  function buildAppUsagePayload(options) {
    const opts = options && typeof options === 'object' ? options : {};
    const account = getAppUsageAccount();
    const eventType = String(opts.eventType || opts.reason || 'app-open').trim().slice(0, 80) || 'app-open';
    return {
      deviceKey: ensureAppUsageDeviceKey(),
      eventType,
      accountNumber: String(opts.accountNumber || (account && (account.accountNumber || account.account_number || account.id)) || '').trim().slice(0, 80),
      playerName: String(opts.playerName || (account && (account.name || account.playerName || account.id)) || '').trim().slice(0, 160),
      appVersion: String(opts.appVersion || window.APP_VERSION || '').trim().slice(0, 80),
      route: String(opts.route || getAppUsageRoute()).trim().slice(0, 220),
      userAgent: String(opts.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '').slice(0, 1000),
      deviceInfo: getAppUsageDeviceInfo(opts),
      online: typeof navigator !== 'undefined' ? navigator.onLine !== false : true
    };
  }

  function shouldLogAppUsage(payload, options) {
    const opts = options || {};
    if (opts.force) return { ok: true };
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return { ok: false, reason: 'offline' };
    const current = readAppUsageStatus();
    const last = Date.parse(current.lastAttemptAt || current.lastSuccessAt || '') || 0;
    const now = Date.now();
    if (last && now - last < APP_USAGE_MIN_INTERVAL_MS) return { ok: false, reason: 'throttle' };
    return { ok: true };
  }

  async function recordAppUsageDirect(client, options = {}) {
    const payload = buildAppUsagePayload(options || {});
    const allowed = shouldLogAppUsage(payload, options || {});
    const current = readAppUsageStatus();
    if (!allowed.ok) {
      writeAppUsageStatus(Object.assign({}, current, {
        ok: current.ok === true,
        status: allowed.reason === 'offline' ? 'offline' : 'skipped',
        lastSkipReason: allowed.reason,
        lastEventType: payload.eventType,
        lastDeviceKey: payload.deviceKey,
        lastAppVersion: payload.appVersion,
        skipped: Number(current.skipped || 0) + 1
      }));
      return { ok: true, skipped: true, reason: allowed.reason, payload };
    }
    const attempt = writeAppUsageStatus(Object.assign({}, current, {
      ok: current.ok === true,
      status: 'attempt',
      lastAttemptAt: new Date().toISOString(),
      lastEventType: payload.eventType,
      lastDeviceKey: payload.deviceKey,
      lastAppVersion: payload.appVersion,
      attempts: Number(current.attempts || 0) + 1
    }));
    const rpcArgs = {
      payload: {
        device_id: payload.deviceKey,
        user_name: payload.playerName || null,
        profile_id: payload.accountNumber || null,
        app_version: payload.appVersion || null,
        build_number: String(payload.appVersion || '').match(/\((\d+)\)/) ? String(payload.appVersion || '').match(/\((\d+)\)/)[1] : null,
        user_agent: payload.userAgent || null,
        platform: payload.deviceInfo && payload.deviceInfo.platform ? payload.deviceInfo.platform : null,
        language: payload.deviceInfo && payload.deviceInfo.language ? payload.deviceInfo.language : null,
        screen: payload.deviceInfo ? JSON.stringify(payload.deviceInfo) : null,
        timezone: payload.deviceInfo && payload.deviceInfo.timezone ? payload.deviceInfo.timezone : null,
        connection_type: payload.deviceInfo && payload.deviceInfo.connection && payload.deviceInfo.connection.effectiveType ? payload.deviceInfo.connection.effectiveType : null,
        last_path: payload.route || null,
        last_source: payload.eventType || 'app-open'
      }
    };
    try {
      const { data, error } = await runSupabaseOperation('app_usage.rpc.presence_touch', () => client.rpc('rak_usage_presence_touch', rpcArgs), { mode: 'write', attempts: 1, timeoutMs: APP_USAGE_TIMEOUT_MS });
      if (error) throw error;
      const next = writeAppUsageStatus(Object.assign({}, attempt, {
        ok: true,
        status: 'ok',
        lastSuccessAt: new Date().toISOString(),
        lastErrorAt: attempt.lastErrorAt || null,
        lastErrorMessage: '',
        successes: Number(current.successes || 0) + 1
      }));
      return { ok: true, status: next, data, payload };
    } catch (err) {
      const next = writeAppUsageStatus(Object.assign({}, attempt, {
        ok: false,
        status: 'error',
        lastErrorAt: new Date().toISOString(),
        lastErrorMessage: String(err && (err.message || err.details || err.hint || err.code || err.status) ? (err.message || err.details || err.hint || err.code || err.status) : err || 'unknown').slice(0, 220),
        failures: Number(current.failures || 0) + 1
      }));
      return { ok: false, error: err, status: next, payload };
    }
  }

  function normalizeAppUsageRow(row) {
    const src = row && typeof row === 'object' ? row : {};
    const now = Date.now();
    const lastSeen = src.last_seen_at || src.last_seen || null;
    const minutes = lastSeen ? Math.floor(Math.max(0, now - (Date.parse(lastSeen) || now)) / 60000) : null;
    return {
      device_key: String(src.device_key || src.device_id || '').slice(0, 128),
      account_number: src.account_number || src.profile_id || null,
      player_name: src.player_name || src.user_name || null,
      app_version: src.app_version || null,
      route: src.route || src.last_path || null,
      user_agent: src.user_agent || null,
      device_info: src.device_info && typeof src.device_info === 'object' ? src.device_info : {
        platform: src.platform || '',
        language: src.language || '',
        screen: src.screen || '',
        timezone: src.timezone || '',
        connection: { effectiveType: src.connection_type || '' }
      },
      first_seen_at: src.first_seen_at || src.first_seen || null,
      last_seen_at: lastSeen,
      open_count: Number(src.open_count || src.session_count || 0) || 0,
      last_event_type: src.last_event_type || src.last_source || null,
      last_ip_hash: src.last_ip_hash || src.ip_hash || null,
      minutes_since_seen: src.minutes_since_seen === null || typeof src.minutes_since_seen === 'undefined' ? minutes : Number(src.minutes_since_seen)
    };
  }

  async function loadAppUsageDirect(client, options = {}) {
    const limit = Math.max(1, Math.min(200, Number(options.limit || 80) || 80));
    const { data, error } = await runSupabaseOperation('app_usage.rpc.presence_admin', () => client.rpc('rak_usage_presence_admin', {
      limit_count: limit
    }), { mode: 'read', attempts: 1, timeoutMs: 10000 });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    const devices = rows.map(normalizeAppUsageRow);
    const now = Date.now();
    const summary = {
      device_count: devices.length,
      active_24h: devices.filter(d => d.last_seen_at && now - (Date.parse(d.last_seen_at) || 0) <= 24 * 60 * 60 * 1000).length,
      active_7d: devices.filter(d => d.last_seen_at && now - (Date.parse(d.last_seen_at) || 0) <= 7 * 24 * 60 * 60 * 1000).length,
      events_24h: null,
      generated_at: new Date().toISOString()
    };
    return { ok: true, devices, events: [], summary, fetchedAt: new Date().toISOString() };
  }

  function scheduleAppUsage(reason, delayMs, options) {
    const delay = Number.isFinite(Number(delayMs)) ? Math.max(0, Number(delayMs)) : 2000;
    try {
      window.setTimeout(() => {
        try {
          if (!window.RotationSupabaseBridge || typeof window.RotationSupabaseBridge.recordAppUsage !== 'function') return;
          void window.RotationSupabaseBridge.recordAppUsage(Object.assign({ eventType: reason || 'app-open' }, options || {}));
        } catch (err) {}
      }, delay);
    } catch (err) {}
  }


  function normalizeBugReportType(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (raw.includes('nel')) return 'nelibi';
    if (raw.includes('náp') || raw.includes('nap')) return 'napad';
    if (raw.includes('výkon') || raw.includes('vykon') || raw.includes('sek')) return 'vykon';
    if (raw.includes('hra')) return 'hra';
    if (raw.includes('chy')) return 'chyba';
    return 'ostatni';
  }

  function normalizeBugReportPayload(entry) {
    const source = entry && typeof entry === 'object' ? entry : {};
    const text = String(source.text || source.message || '').trim().slice(0, 4000);
    const route = [String(source.page || '').trim(), String(source.game || '').trim()].filter(Boolean).join(' · ').slice(0, 300);
    const deviceInfo = {
      theme: String(source.theme || '').slice(0, 80),
      background: String(source.background || '').slice(0, 80),
      online: !!source.online,
      createdAtLocal: String(source.createdAtLocal || '').slice(0, 120),
      viewport: typeof window !== 'undefined' ? { width: window.innerWidth || 0, height: window.innerHeight || 0, dpr: window.devicePixelRatio || 1 } : {},
      sourceId: String(source.id || '').slice(0, 120)
    };
    return {
      account_number: String(source.accountId || source.account_number || '').trim().slice(0, 80) || null,
      player_name: String(source.accountName || source.player_name || '').trim().slice(0, 160) || null,
      report_type: normalizeBugReportType(source.type || source.report_type),
      message: text,
      app_version: String(source.version || window.APP_VERSION || '').trim().slice(0, 80) || null,
      route: route || null,
      user_agent: String(source.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '').slice(0, 1000) || null,
      device_info: deviceInfo,
      status: 'new'
    };
  }

  async function saveBugReportDirect(client, entry) {
    const row = normalizeBugReportPayload(entry);
    if (!row.message || row.message.length < 3) throw new Error('Report je moc krátký.');
    const { error } = await runSupabaseOperation('bug_reports.insert', () => client.from('bug_reports').insert([row]), { mode: 'write', attempts: 1 });
    if (error) throw error;
    return { ok: true, row };
  }

  function isBugReportUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || '').trim());
  }

  function normalizeBugReportStatus(status) {
    const raw = String(status || '').trim().toLowerCase();
    if (raw === 'seen' || raw.includes('vid')) return 'seen';
    if (raw === 'done' || raw.includes('hot')) return 'done';
    if (raw === 'ignored' || raw.includes('ignor')) return 'ignored';
    return 'new';
  }

  async function loadBugReportsDirect(client, options = {}) {
    const limit = Math.max(1, Math.min(80, Number(options.limit || 40) || 40));
    const status = String(options.status || '').trim();
    let query = client.from('bug_reports')
      .select('id, account_number, player_name, report_type, message, app_version, route, user_agent, device_info, status, created_at, handled_at, handled_note')
      .or('handled_note.is.null,handled_note.neq.' + BUG_REPORT_DELETED_NOTE)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (status && status !== 'all') query = query.eq('status', normalizeBugReportStatus(status));
    const { data, error } = await runSupabaseOperation('bug_reports.select', () => query, { mode: 'read', attempts: 1 });
    if (error) throw error;
    return { ok: true, rows: Array.isArray(data) ? data : [] };
  }

  async function updateBugReportStatusDirect(client, id, status, note = '') {
    const reportId = String(id || '').trim();
    if (!reportId) throw new Error('Chybí ID reportu.');
    if (!isBugReportUuid(reportId)) return { ok: false, reason: 'non-uuid-report-id', localOnly: true };
    const nextStatus = normalizeBugReportStatus(status);
    const patch = {
      status: nextStatus,
      handled_at: nextStatus === 'new' ? null : new Date().toISOString(),
      handled_note: String(note || '').slice(0, 600) || null
    };
    const { data, error } = await runSupabaseOperation('bug_reports.update', () => client.from('bug_reports').update(patch).eq('id', reportId).select('id, status, handled_at, handled_note').maybeSingle(), { mode: 'write', attempts: 1 });
    if (error) throw error;
    return { ok: true, row: data || patch };
  }


  const BUG_REPORT_DELETED_NOTE = '__rak_deleted__';

  async function deleteBugReportDirect(client, id) {
    const reportId = String(id || '').trim();
    if (!reportId) throw new Error('Chybí ID reportu.');
    if (!isBugReportUuid(reportId)) return { ok: false, reason: 'non-uuid-report-id', localOnly: true };
    // DB nemá DELETE policy. Mažeme bezpečně přes existující UPDATE cestu: report schováme jako ignorovaný se speciální poznámkou.
    const patch = {
      status: 'ignored',
      handled_at: new Date().toISOString(),
      handled_note: BUG_REPORT_DELETED_NOTE
    };
    const { data, error } = await runSupabaseOperation('bug_reports.soft_delete', () => client.from('bug_reports').update(patch).eq('id', reportId).select('id, status, handled_at, handled_note').maybeSingle(), { mode: 'write', attempts: 1 });
    if (error) throw error;
    return { ok: true, id: reportId, softDeleted: true, row: data || patch };
  }


  function normalizeInviteCode(code) {
    return String(code || '').replace(/\D/g, '').slice(0, 4);
  }

  const GAME_INVITE_TTL_MS = 60 * 60 * 1000;

  function getGameInviteExpiryIso(nowTs) {
    const base = Number(nowTs || Date.now()) || Date.now();
    return new Date(base + GAME_INVITE_TTL_MS).toISOString();
  }

  function isGameInviteExpired(invite) {
    if (!invite || !invite.expires_at) return false;
    const ts = Date.parse(String(invite.expires_at));
    return Number.isFinite(ts) && ts <= Date.now();
  }

  function isPendingExpiredGameInvite(invite) {
    const status = String(invite && invite.status || '').toLowerCase();
    return (!status || status === 'pending' || status === 'waiting') && isGameInviteExpired(invite);
  }

  function makeExpiredGameInviteError() {
    const err = new Error('Tahle pozvánka už vypršela. Vytvoř novou.');
    err.code = 'INVITE_EXPIRED';
    err.reason = 'expired-invite';
    return err;
  }

  function gameInviteErrorMessage(err, fallback) {
    if (!err) return fallback || 'Pozvánku se nepodařilo načíst.';
    if (err.code === 'INVITE_EXPIRED' || err.reason === 'expired-invite') return 'Tahle pozvánka už vypršela. Vytvoř novou.';
    return String(err.message || fallback || 'Pozvánku se nepodařilo načíst.');
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


  function normalizeSupabaseRpcJsonPayload(data) {
    if (!data) return null;
    let value = Array.isArray(data) ? (data[0] || null) : data;
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch (err) { return null; }
    }
    return value && typeof value === 'object' ? value : null;
  }

  async function tryCreateGameInviteSessionViaRpc(client, inviteRow, sessionRow) {
    if (!client || typeof client.rpc !== 'function') return null;
    const smokeGameType = inferGameTypeFromSessionPayload(inviteRow, sessionRow, sessionRow && sessionRow.board_state);
    try {
      rememberGameSessionRpcSmoke('attempt', 'create_invite_session', '', smokeGameType);
      const { data, error } = await runSupabaseOperation('game_invites_sessions.rpc_create', () => client.rpc('rak_create_game_invite_session', {
        p_invite_row: inviteRow,
        p_session_row: sessionRow
      }), { mode: 'write', attempts: 1 });
      if (error) throw error;
      const result = normalizeSupabaseRpcJsonPayload(data);
      if (!result || result.ok === false) return null;
      rememberGameSessionRpcSmoke('success', 'create_invite_session', '', smokeGameType);
      return {
        invite: result.invite || null,
        session: result.session || null,
        rpc: true
      };
    } catch (err) {
      if (isSupabaseRpcUnavailableError(err)) {
        SUPABASE_RPC_HARDENING_STATUS.lastUnavailableAt = new Date().toISOString();
        SUPABASE_RPC_HARDENING_STATUS.lastUnavailableMessage = String(err && err.message ? err.message : err);
        rememberGameSessionRpcSmoke('fallback', 'create_invite_session', 'rpc-unavailable', smokeGameType);
        return null;
      }
      rememberGameSessionRpcSmoke('fallback', 'create_invite_session', err && err.message ? err.message : err, smokeGameType);
      console.warn('rak_create_game_invite_session failed; direct game_invites/game_sessions fallback may be blocked after v826', err);
      return null;
    }
  }

  async function tryAcceptGameInviteViaRpc(client, inviteCode, inviteeAccountNumber, boardState) {
    if (!client || typeof client.rpc !== 'function') return null;
    const code = normalizeInviteCode(inviteCode);
    const invitee = String(inviteeAccountNumber || '').trim();
    const smokeGameType = inferGameTypeFromSessionPayload(null, null, boardState);
    if (!code || !invitee) return null;
    try {
      rememberGameSessionRpcSmoke('attempt', 'accept_invite', '', smokeGameType);
      const { data, error } = await runSupabaseOperation('game_invites_sessions.rpc_accept', () => client.rpc('rak_accept_game_invite', {
        p_invite_code: code,
        p_invitee_account_number: invitee,
        p_board_state: boardState && typeof boardState === 'object' ? boardState : null
      }), { mode: 'write', attempts: 1 });
      if (error) throw error;
      const result = normalizeSupabaseRpcJsonPayload(data);
      if (!result || result.ok === false) return null;
      rememberGameSessionRpcSmoke('success', 'accept_invite', '', smokeGameType);
      return {
        invite: result.invite || null,
        session: result.session || null,
        localRole: result.local_role || result.localRole || null,
        rpc: true
      };
    } catch (err) {
      if (isSupabaseRpcUnavailableError(err)) {
        SUPABASE_RPC_HARDENING_STATUS.lastUnavailableAt = new Date().toISOString();
        SUPABASE_RPC_HARDENING_STATUS.lastUnavailableMessage = String(err && err.message ? err.message : err);
        rememberGameSessionRpcSmoke('fallback', 'accept_invite', 'rpc-unavailable', smokeGameType);
        return null;
      }
      rememberGameSessionRpcSmoke('fallback', 'accept_invite', err && err.message ? err.message : err, smokeGameType);
      console.warn('rak_accept_game_invite failed; direct game_invites/game_sessions fallback may be blocked after hardening', err);
      return null;
    }
  }

  async function trySaveGameSessionByInviteCodeViaRpc(client, inviteCode, sessionRow, startsNewRound) {
    if (!client || typeof client.rpc !== 'function') return null;
    const code = normalizeInviteCode(inviteCode);
    const smokeGameType = inferGameTypeFromSessionPayload(null, sessionRow, sessionRow && sessionRow.board_state);
    if (!code) return null;
    try {
      rememberGameSessionRpcSmoke('attempt', 'save_session', '', smokeGameType);
      const { data, error } = await runSupabaseOperation('game_sessions.rpc_save_by_invite', () => client.rpc('rak_save_game_session_by_invite_code', {
        p_invite_code: code,
        p_session_row: sessionRow,
        p_start_new_round: !!startsNewRound
      }), { mode: 'write', attempts: 1 });
      if (error) throw error;
      const result = normalizeSupabaseRpcJsonPayload(data);
      if (!result || result.ok === false) return null;
      rememberGameSessionRpcSmoke('success', 'save_session', '', smokeGameType);
      return {
        invite: result.invite || null,
        session: result.session || null,
        rpc: true
      };
    } catch (err) {
      if (isSupabaseRpcUnavailableError(err)) {
        SUPABASE_RPC_HARDENING_STATUS.lastUnavailableAt = new Date().toISOString();
        SUPABASE_RPC_HARDENING_STATUS.lastUnavailableMessage = String(err && err.message ? err.message : err);
        rememberGameSessionRpcSmoke('fallback', 'save_session', 'rpc-unavailable', smokeGameType);
        return null;
      }
      rememberGameSessionRpcSmoke('fallback', 'save_session', err && err.message ? err.message : err, smokeGameType);
      console.warn('rak_save_game_session_by_invite_code failed; direct game_sessions fallback may be blocked after v826', err);
      return null;
    }
  }


  async function loadGameInviteByCode(client, code) {
    const inviteCode = String(code || '').trim().toUpperCase();
    if (!inviteCode) return { ok: false, error: new Error('Chybí kód pozvánky.') };
    const { data, error } = await runSupabaseOperation('game_invites.lookup', () => client
      .from('game_invites')
      .select('*')
      .eq('invite_code', inviteCode)
      .limit(1), { mode: 'read' });
    if (error) throw error;
    const row = Array.isArray(data) && data.length ? data[0] : null;
    if (row && isPendingExpiredGameInvite(row)) return { ok: false, invite: row, expired: true, reason: 'expired-invite', error: makeExpiredGameInviteError() };
    return { ok: true, invite: row || null };
  }

  async function createGameInviteDirect(client, payload) {
    const inviteCode = String(payload && payload.code ? payload.code : '').trim().toUpperCase();
    if (!inviteCode) throw new Error('Chybí kód pozvánky.');
    const inviterAccountNumber = String(payload && payload.inviterAccountNumber ? payload.inviterAccountNumber : '').trim() || null;
    const gameType = String(payload && payload.gameType ? payload.gameType : (payload && payload.game_type ? payload.game_type : 'gomoku')).trim() || 'gomoku';
    const boardState = payload && payload.boardState && typeof payload.boardState === 'object' ? Object.assign({ gameType }, payload.boardState) : { board: Array(180).fill(''), turn: 'X', status: 'waiting', gameType };
    const expiresAt = payload && payload.expiresAt ? String(payload.expiresAt) : getGameInviteExpiryIso();
    boardState.inviteExpiresAt = expiresAt;
    const inviteRow = {
      game_type: gameType,
      inviter_account_number: inviterAccountNumber,
      invitee_account_number: null,
      invite_code: inviteCode,
      status: 'pending',
      expires_at: expiresAt,
      payload: Object.assign({}, payload && payload.payload && typeof payload.payload === 'object' ? payload.payload : {}, { expiresAt })
    };
    const rpcCreated = await tryCreateGameInviteSessionViaRpc(client, inviteRow, {
      game_type: gameType,
      invite_id: null,
      player_x_account_number: inviterAccountNumber,
      player_o_account_number: null,
      winner_account_number: null,
      status: 'waiting',
      board_state: boardState,
      move_history: [],
      updated_at: new Date().toISOString()
    });
    if (rpcCreated && (rpcCreated.invite || rpcCreated.session)) {
      writeGameSessionCache(inviteCode, rpcCreated.invite || null, rpcCreated.session || null);
      return { invite: rpcCreated.invite || null, session: rpcCreated.session || null, rpc: true };
    }

    const { data: inviteData, error: inviteErr } = await runSupabaseOperation('game_invites.create', () => client
      .from('game_invites')
      .insert([inviteRow])
      .select('*')
      .maybeSingle(), { mode: 'write' });
    if (inviteErr) throw inviteErr;
    const sessionRow = {
      game_type: gameType,
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
    if (loaded && loaded.expired) throw (loaded.error || makeExpiredGameInviteError());
    if (!loaded.invite) throw new Error('Pozvánka nenalezena.');
    const invite = loaded.invite;
    if (isPendingExpiredGameInvite(invite)) throw makeExpiredGameInviteError();
    const { data: sessionRows, error: sessionLookupErr } = await runSupabaseOperation('game_sessions.lookup_for_accept', () => client
      .from('game_sessions')
      .select('*')
      .eq('invite_id', invite.id)
      .order('updated_at', { ascending: false })
      .limit(1), { mode: 'read' });
    if (sessionLookupErr) throw sessionLookupErr;
    const sessionData = Array.isArray(sessionRows) && sessionRows.length ? sessionRows[0] : null;
    const nextInvite = {
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      invitee_account_number: invitee
    };
    const boardState = sessionData && sessionData.board_state && typeof sessionData.board_state === 'object' ? sessionData.board_state : { board: Array(180).fill(''), turn: 'X', status: 'active' };
    const inviteGameType = String(invite.game_type || boardState.gameType || 'gomoku').trim() || 'gomoku';
    boardState.gameType = inviteGameType;
    boardState.status = inviteGameType === 'battleship' ? 'placing' : 'active';
    boardState.playerXAccountNumber = invite.inviter_account_number || boardState.playerXAccountNumber || null;
    boardState.playerOAccountNumber = invitee || boardState.playerOAccountNumber || null;
    boardState.revision = Math.max(Number(boardState.revision || 0) || 0, 1);
    boardState.updatedAtTs = Date.now();
    boardState.acceptedAt = new Date().toISOString();
    const rpcAccepted = await tryAcceptGameInviteViaRpc(client, inviteCode, invitee, boardState);
    if (rpcAccepted && (rpcAccepted.invite || rpcAccepted.session)) {
      const savedInvite = rpcAccepted.invite || invite;
      const savedSession = rpcAccepted.session || sessionData || null;
      writeGameSessionCache(inviteCode, savedInvite, savedSession);
      return { invite: savedInvite, session: savedSession, rpc: true, localRole: rpcAccepted.localRole || null };
    }

    const { data: updatedInvite, error: inviteUpdErr } = await runSupabaseOperation('game_invites.accept', () => client
      .from('game_invites')
      .update(nextInvite)
      .eq('id', invite.id)
      .select('*')
      .maybeSingle(), { mode: 'write' });
    if (inviteUpdErr) throw inviteUpdErr;

    const sessionRow = {
      game_type: inviteGameType,
      invite_id: invite.id,
      player_x_account_number: invite.inviter_account_number || null,
      player_o_account_number: invitee,
      winner_account_number: null,
      status: inviteGameType === 'battleship' ? 'placing' : 'active',
      board_state: boardState,
      move_history: Array.isArray(sessionData && sessionData.move_history) ? sessionData.move_history : [],
      updated_at: new Date().toISOString()
    };
    let updatedSession = null;
    if (sessionData && sessionData.id) {
      const { data, error } = await runSupabaseOperation('game_sessions.accept_update', () => client
        .from('game_sessions')
        .update(sessionRow)
        .eq('id', sessionData.id)
        .select('*')
        .maybeSingle(), { mode: 'write' });
      if (error) throw error;
      updatedSession = data || Object.assign({}, sessionData, sessionRow);
    } else {
      const { data, error } = await runSupabaseOperation('game_sessions.accept_insert', () => client
        .from('game_sessions')
        .insert([sessionRow])
        .select('*')
        .maybeSingle(), { mode: 'write' });
      if (error) throw error;
      updatedSession = data || sessionRow;
    }
    writeGameSessionCache(inviteCode, updatedInvite || invite, updatedSession || null);
    return { invite: updatedInvite || invite, session: updatedSession || null };
  }

  async function loadGameSessionByInviteCodeDirect(client, code) {
    const loaded = await loadGameInviteByCode(client, code);
    if (loaded && loaded.expired) return { ok: false, invite: loaded.invite || null, session: null, expired: true, reason: 'expired-invite', message: gameInviteErrorMessage(loaded.error) };
    if (!loaded.invite) return { ok: false, invite: null, session: null };
    const { data: sessionRows, error: sessionErr } = await runSupabaseOperation('game_sessions.lookup_by_invite', () => client
      .from('game_sessions')
      .select('*')
      .eq('invite_id', loaded.invite.id)
      .order('updated_at', { ascending: false })
      .limit(1), { mode: 'read' });
    if (sessionErr) throw sessionErr;
    const sessionData = Array.isArray(sessionRows) && sessionRows.length ? sessionRows[0] : null;
    writeGameSessionCache(code, loaded.invite, sessionData || null);
    return { ok: true, invite: loaded.invite, session: sessionData || null };
  }

  async function saveGameSessionByInviteCodeDirect(client, code, payload) {
    const loaded = await loadGameInviteByCode(client, code);
    if (loaded && loaded.expired) throw (loaded.error || makeExpiredGameInviteError());
    if (!loaded.invite) throw new Error('Pozvánka nenalezena.');
    const { data: sessionRows, error: sessionErr } = await runSupabaseOperation('game_sessions.lookup_by_invite', () => client
      .from('game_sessions')
      .select('*')
      .eq('invite_id', loaded.invite.id)
      .order('updated_at', { ascending: false })
      .limit(1), { mode: 'read' });
    if (sessionErr) throw sessionErr;
    const sessionData = Array.isArray(sessionRows) && sessionRows.length ? sessionRows[0] : null;
    const boardState = payload && typeof payload === 'object' ? Object.assign({}, payload) : {};
    const currentStatus = String(sessionData && sessionData.status || '').toLowerCase();
    const startsNewRound = !!boardState.forceNewSession || (!boardState.gameOver && currentStatus === 'finished');
    delete boardState.forceNewSession;
    const xAcc = (sessionData && sessionData.player_x_account_number) || loaded.invite.inviter_account_number || boardState.playerXAccountNumber || null;
    const oAcc = (sessionData && sessionData.player_o_account_number) || loaded.invite.invitee_account_number || boardState.playerOAccountNumber || null;
    const winnerAccount = boardState.winnerAccountNumber
      || (boardState.winner === 'X' ? xAcc : (boardState.winner === 'O' ? oAcc : null));
    const sessionRow = {
      game_type: loaded.invite.game_type || boardState.gameType || 'gomoku',
      invite_id: loaded.invite.id,
      player_x_account_number: xAcc,
      player_o_account_number: oAcc,
      winner_account_number: winnerAccount || null,
      status: boardState.status || (boardState.gameOver ? 'finished' : 'active'),
      board_state: boardState,
      move_history: Array.isArray(boardState.moveHistory) ? boardState.moveHistory : (startsNewRound ? [] : (Array.isArray(sessionData && sessionData.move_history) ? sessionData.move_history : [])),
      updated_at: new Date().toISOString(),
      finished_at: boardState.gameOver ? new Date().toISOString() : null
    };
    const rpcSaved = await trySaveGameSessionByInviteCodeViaRpc(client, code, sessionRow, startsNewRound);
    if (rpcSaved && (rpcSaved.invite || rpcSaved.session)) {
      const savedInvite = rpcSaved.invite || loaded.invite;
      const savedSession = rpcSaved.session || sessionRow;
      writeGameSessionCache(code, savedInvite, savedSession);
      return { ok: true, invite: savedInvite, session: savedSession || null, status: (savedSession && savedSession.status) || sessionRow.status, newRound: startsNewRound, rpc: true };
    }

    let updatedSession = null;
    if (sessionData && sessionData.id && !startsNewRound) {
      const { data, error } = await runSupabaseOperation('game_sessions.save_by_invite_update', () => client
        .from('game_sessions')
        .update(sessionRow)
        .eq('id', sessionData.id)
        .select('*')
        .maybeSingle(), { mode: 'write' });
      if (error) throw error;
      updatedSession = data || Object.assign({}, sessionData, sessionRow);
    } else {
      const { data, error } = await runSupabaseOperation('game_sessions.save_by_invite_insert_round', () => client
        .from('game_sessions')
        .insert([sessionRow])
        .select('*')
        .maybeSingle(), { mode: 'write' });
      if (error) throw error;
      updatedSession = data || sessionRow;
    }
    writeGameSessionCache(code, loaded.invite, updatedSession || sessionRow);
    return { ok: true, invite: loaded.invite, session: updatedSession || null, status: sessionRow.status, newRound: startsNewRound };
  }



  function parseQueueTime(value) {
    if (!value) return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const parsed = Date.parse(String(value || ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function getQueueHealth(queue) {
    const list = Array.isArray(queue) ? queue : [];
    const now = Date.now();
    const byType = {};
    let oldestQueuedAt = 0;
    let newestQueuedAt = 0;
    let maxRetryCount = 0;
    let staleTaskCount = 0;
    let warningTaskCount = 0;
    let criticalTaskCount = 0;
    list.forEach((task) => {
      const type = String(task && task.type ? task.type : 'unknown').trim() || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
      const queuedAt = parseQueueTime(task && task.queuedAt);
      if (queuedAt) {
        if (!oldestQueuedAt || queuedAt < oldestQueuedAt) oldestQueuedAt = queuedAt;
        if (!newestQueuedAt || queuedAt > newestQueuedAt) newestQueuedAt = queuedAt;
        const age = now - queuedAt;
        if (age > SUPABASE_QUEUE_HEALTH_WARN_AFTER_MS) warningTaskCount += 1;
        if (age > SUPABASE_QUEUE_HEALTH_CRITICAL_AFTER_MS) criticalTaskCount += 1;
      } else {
        staleTaskCount += 1;
      }
      const retries = Math.max(0, Number(task && task.retryCount) || 0);
      if (retries > maxRetryCount) maxRetryCount = retries;
      if (retries >= SUPABASE_QUEUE_DROP_INVALID_AFTER) staleTaskCount += 1;
    });
    const oldestAgeMs = oldestQueuedAt ? Math.max(0, now - oldestQueuedAt) : 0;
    return {
      checkedAt: now,
      length: list.length,
      byType,
      oldestQueuedAt: oldestQueuedAt || null,
      newestQueuedAt: newestQueuedAt || null,
      oldestAgeMs,
      maxRetryCount,
      staleTaskCount,
      warningTaskCount,
      criticalTaskCount,
      warnAfterMs: SUPABASE_QUEUE_HEALTH_WARN_AFTER_MS,
      criticalAfterMs: SUPABASE_QUEUE_HEALTH_CRITICAL_AFTER_MS
    };
  }

  function rememberQueueHealth(queue) {
    const health = getQueueHealth(queue);
    state.syncGuard.queueHealthChecks += 1;
    state.syncGuard.lastQueueHealthAt = health.checkedAt;
    state.syncGuard.queueStaleTaskCount = health.staleTaskCount;
    state.syncGuard.queueMaxRetryCount = health.maxRetryCount;
    state.syncGuard.queueOldestAgeMs = health.oldestAgeMs;
    if (health.warningTaskCount > 0) {
      state.syncGuard.queueHealthWarnings += 1;
      state.syncGuard.lastQueueHealthWarningAt = health.checkedAt;
    }
    if (health.criticalTaskCount > 0) {
      state.syncGuard.queueHealthCriticals += 1;
      state.syncGuard.lastQueueHealthCriticalAt = health.checkedAt;
    }
    return health;
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
    rememberQueueHealth(queue);
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
      const initialHealth = rememberQueueHealth(queue);
      if (!queue.length) return { ok: true, flushed: 0, remaining: 0, health: initialHealth };

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
          } else if (task.type === 'bug_report') {
            await saveBugReportDirect(client, task.entry);
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
      const finalHealth = rememberQueueHealth(remaining);
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
      return { ok: true, flushed, dropped, remaining: remaining.length, nextRetryAt, batchStopped, health: finalHealth };
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
        const announcementsRes = await runSharedSupabaseRead('announcements.refresh', () => runSupabaseOperation('announcements.refresh', () => client
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false })
          .order('updated_at', { ascending: false })
          .limit(5), { mode: 'read' }));

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
      { machine_key: 'TPKW01', machine_code: 'TPKW01', machine_index: '', label: 'Pračka', category: 'pracka', cycle_time: 30, dress_time: null, dress_count: null, settings_json: { machine: 'TPKW01', index: '', cycle_time: '30', dress_time: '', dress_count: '' } },
      { machine_key: 'FHB_TARGET_afag-lis', machine_code: 'FHB', machine_index: 'afag-lis', label: 'AF/AG lis', category: 'fhb_target', cycle_time: null, dress_time: null, dress_count: null, settings_json: { machine: 'FHB', index: 'afag-lis', type: 'fhb_target', key: 'afag-lis', label: 'AF/AG lis', target_left: '50', target_right: '70', tolerance_minus: '10', tolerance_plus: '10' } },
      { machine_key: 'FHB_TARGET_ah-lis', machine_code: 'FHB', machine_index: 'ah-lis', label: 'AH lis', category: 'fhb_target', cycle_time: null, dress_time: null, dress_count: null, settings_json: { machine: 'FHB', index: 'ah-lis', type: 'fhb_target', key: 'ah-lis', label: 'AH lis', target_left: '20', target_right: '80', tolerance_minus: '10', tolerance_plus: '10' } },
      { machine_key: 'FHB_TARGET_afag-volne', machine_code: 'FHB', machine_index: 'afag-volne', label: 'AF/AG volné', category: 'fhb_target', cycle_time: null, dress_time: null, dress_count: null, settings_json: { machine: 'FHB', index: 'afag-volne', type: 'fhb_target', key: 'afag-volne', label: 'AF/AG volné', target_left: '-5', target_right: '10', tolerance_minus: '10', tolerance_plus: '10' } },
      { machine_key: 'FHB_TARGET_ah-volne', machine_code: 'FHB', machine_index: 'ah-volne', label: 'AH volné', category: 'fhb_target', cycle_time: null, dress_time: null, dress_count: null, settings_json: { machine: 'FHB', index: 'ah-volne', type: 'fhb_target', key: 'ah-volne', label: 'AH volné', target_left: '10', target_right: '25', tolerance_minus: '10', tolerance_plus: '10' } },
      { machine_key: 'TBKR01-AD', machine_code: 'TBKR01', machine_index: 'AD', label: 'TBKR01-AD', category: 'brus', cycle_time: 58.2, dress_time: 323, dress_count: 59, settings_json: { machine: 'TBKR01', index: 'AD', cycle_time: '58.2', dress_time: '323', dress_count: '59' } },
      { machine_key: 'TBKR01-AE', machine_code: 'TBKR01', machine_index: 'AE', label: 'TBKR01-AE', category: 'brus', cycle_time: 57.0, dress_time: 240, dress_count: 58, settings_json: { machine: 'TBKR01', index: 'AE', cycle_time: '57.0', dress_time: '240', dress_count: '58' } },
      { machine_key: 'TBKR01-AH', machine_code: 'TBKR01', machine_index: 'AH', label: 'TBKR01-AH', category: 'brus', cycle_time: 66.0, dress_time: 400, dress_count: 87, settings_json: { machine: 'TBKR01', index: 'AH', cycle_time: '66.0', dress_time: '400', dress_count: '87' } },
      { machine_key: 'TBKR01-AD volné', machine_code: 'TBKR01', machine_index: 'AD volné', label: 'TBKR01-AD volné', category: 'brus', cycle_time: 62.7, dress_time: 240, dress_count: 45, settings_json: { machine: 'TBKR01', index: 'AD volné', cycle_time: '62.7', dress_time: '240', dress_count: '45' } },
      { machine_key: 'TBKR01-AE volné', machine_code: 'TBKR01', machine_index: 'AE volné', label: 'TBKR01-AE volné', category: 'brus', cycle_time: 60.0, dress_time: 240, dress_count: 45, settings_json: { machine: 'TBKR01', index: 'AE volné', cycle_time: '60.0', dress_time: '240', dress_count: '45' } },
      { machine_key: 'TBKR07-AD', machine_code: 'TBKR07', machine_index: 'AD', label: 'TBKR07-AD', category: 'brus', cycle_time: 58.2, dress_time: 298, dress_count: 59, settings_json: { machine: 'TBKR07', index: 'AD', cycle_time: '58.2', dress_time: '298', dress_count: '59' } },
      { machine_key: 'TBKR07-AE', machine_code: 'TBKR07', machine_index: 'AE', label: 'TBKR07-AE', category: 'brus', cycle_time: 56.4, dress_time: 325, dress_count: 59, settings_json: { machine: 'TBKR07', index: 'AE', cycle_time: '56.4', dress_time: '325', dress_count: '59' } },
      { machine_key: 'TBKR07-AH', machine_code: 'TBKR07', machine_index: 'AH', label: 'TBKR07-AH', category: 'brus', cycle_time: 63, dress_time: 360, dress_count: 88, settings_json: { machine: 'TBKR07', index: 'AH', cycle_time: '63', dress_time: '360', dress_count: '88' } },
      { machine_key: 'TBKR07-AD volné', machine_code: 'TBKR07', machine_index: 'AD volné', label: 'TBKR07-AD volné', category: 'brus', cycle_time: 60.3, dress_time: 240, dress_count: 45, settings_json: { machine: 'TBKR07', index: 'AD volné', cycle_time: '60.3', dress_time: '240', dress_count: '45' } },
      { machine_key: 'TBKR07-AE volné', machine_code: 'TBKR07', machine_index: 'AE volné', label: 'TBKR07-AE volné', category: 'brus', cycle_time: 60.0, dress_time: 240, dress_count: 45, settings_json: { machine: 'TBKR07', index: 'AE volné', cycle_time: '60.0', dress_time: '240', dress_count: '45' } }
    ];
  }

  async function loadMachineSettings() {
    const client = getClient();
    try {
      if (client && navigator.onLine) {
        const { data, error } = await runSharedSupabaseRead('machine_settings.load', () => runSupabaseOperation('machine_settings.load', () => client
          .from('machine_settings')
          .select('*')
          .order('category', { ascending: true })
          .order('machine_key', { ascending: true }), { mode: 'read' }));
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
        const savedCount = await runOptimizedSupabaseWrite('machine_settings.save', rows, () => runSupabaseOperation('machine_settings.save', () => upsertMachineSettingsDirect(client, rows), { mode: 'write' }));
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
        const { data, error } = await runSharedSupabaseRead('rotation_entries.load:' + String(monthStart || ''), () => runSupabaseOperation('rotation_entries.load', () => client
          .from('rotation_entries')
          .select('*')
          .eq('month_start', monthStart)
          .order('row_order', { ascending: true })
          .order('employee_name', { ascending: true }), { mode: 'read' }));
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
        const summary = await runOptimizedSupabaseWrite('rotation_entries.save:' + String(monthStart || ''), { monthStart, label, rows }, () => runSupabaseOperation('rotation_entries.save', () => upsertRotationMonthEntriesDirect(client, monthStart, label, rows), { mode: 'write' }), { windowMs: 2200 });
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
    return LOCAL_GAME_STATS_PREFIX + encodeURIComponent(String(gameType || '').trim() || 'unknown') + ':' + String(Math.max(1, Math.min(100, Number(limit) || 10)));
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

  function clearAllGameStatsCaches() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const cacheKey = localStorage.key(i);
        if (cacheKey && (cacheKey.indexOf(LOCAL_GAME_STATS_PREFIX) === 0 || cacheKey.indexOf(LOCAL_GAME_SESSIONS_PREFIX) === 0)) keys.push(cacheKey);
      }
      keys.forEach(cacheKey => localStorage.removeItem(cacheKey));
    } catch (err) {}
  }

  function gameProgressIsBeforeReset(row) {
    if (!row || String(row.game_type || '') === GAME_UI_SETTINGS_TYPE) return false;
    const ts = Date.parse(String(row.last_played_at || row.finished_at || row.updated_at || row.created_at || ''));
    return Number.isFinite(GAME_PROGRESS_RESET_CUTOFF_MS) && Number.isFinite(ts) && ts < GAME_PROGRESS_RESET_CUTOFF_MS;
  }

  function gameProgressQueryAfterReset(query) {
    if (!query || !GAME_PROGRESS_RESET_CUTOFF_ISO) return query;
    try { return query.gte('last_played_at', GAME_PROGRESS_RESET_CUTOFF_ISO); } catch (err) { return query; }
  }

  function isClientGameProgressResetAllowed(options = {}) {
    // v.1.5 (809): destruktivní maintenance reset nesmí být spustitelný běžným klientem ani z konzole.
    // Původně byl reset dostupný přes veřejný bridge/window helper a mohl přepsat game_stats/game_sessions.
    return !!(options && options.allowClientMaintenanceReset === true
      && window.__RAK_ENABLE_CLIENT_MAINTENANCE_RESET === true
      && typeof app !== 'undefined'
      && app.adminUnlocked === true);
  }

  async function resetGameProgressOnlineDirect(client, options = {}) {
    if (!isClientGameProgressResetAllowed(options)) {
      return { ok: false, disabled: true, reason: 'client-maintenance-reset-disabled' };
    }
    const cutoffIso = String(options.cutoffIso || GAME_PROGRESS_RESET_CUTOFF_ISO || '').trim();
    const nowIso = new Date().toISOString();
    const result = { ok: true, version: GAME_PROGRESS_RESET_VERSION, cutoffIso, statsRows: 0, sessionRows: 0, errors: [] };
    const statsPatch = { games_played: 0, wins: 0, losses: 0, draws: 0, points: 0, last_played_at: nowIso, updated_at: nowIso };
    try {
      let statsQuery = client.from('game_stats').update(statsPatch).neq('game_type', GAME_UI_SETTINGS_TYPE);
      if (cutoffIso) statsQuery = statsQuery.lt('updated_at', cutoffIso);
      const { data, error } = await runSupabaseOperation('game_stats.reset_progress_v720', () => statsQuery.select('id,game_type'), { mode: 'write', attempts: 1 });
      if (error) throw error;
      result.statsRows = Array.isArray(data) ? data.length : 0;
    } catch (err) {
      result.ok = false;
      result.errors.push({ table: 'game_stats', message: String(err && err.message ? err.message : err) });
    }
    try {
      let sessionQuery = client.from('game_sessions').update({ status: 'reset', winner_account_number: null, finished_at: nowIso, updated_at: nowIso });
      if (cutoffIso) sessionQuery = sessionQuery.lt('updated_at', cutoffIso);
      const { data, error } = await runSupabaseOperation('game_sessions.reset_progress_v720', () => sessionQuery.select('id,game_type,status'), { mode: 'write', attempts: 1 });
      if (error) throw error;
      result.sessionRows = Array.isArray(data) ? data.length : 0;
    } catch (err) {
      result.errors.push({ table: 'game_sessions', message: String(err && err.message ? err.message : err) });
    }
    clearAllGameStatsCaches();
    return result;
  }

  async function loadGameStatsDirect(client, gameType, limit, options) {
    const type = String(gameType || '').trim();
    if (!type) return [];
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
    const cacheKey = gameStatsCacheKey(type, safeLimit);
    const forceRefresh = !!(options && options.force);
    const cachedStats = forceRefresh ? null : readTimedCache(cacheKey, SUPABASE_GAME_CACHE_TTL_MS);
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
          .gte('last_played_at', GAME_PROGRESS_RESET_CUTOFF_ISO)
          .order('points', { ascending: false })
          .order('last_played_at', { ascending: false })
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


  function getSafeGameStatNumber(value, fallback) {
    const num = Number(value);
    return Number.isFinite(num) ? num : (Number.isFinite(Number(fallback)) ? Number(fallback) : 0);
  }

  async function tryRecordGameStatDeltaViaRpc(client, accountNumber, gameType, deltas) {
    if (!client || typeof client.rpc !== 'function') return null;
    const account = String(accountNumber || '').trim();
    const type = String(gameType || '').trim();
    if (!account || !type || type === GAME_UI_SETTINGS_TYPE) return null;
    try {
      rememberGameStatsRpcSmoke('attempt', type);
      const { data, error } = await runSupabaseOperation('game_stats.rpc_delta', () => client.rpc('rak_record_game_stat_delta', {
        p_account_number: account,
        p_game_type: type,
        p_games_played_delta: Math.max(0, Math.min(5, Math.round(getSafeGameStatNumber(deltas && deltas.gamesPlayedDelta, 0)))),
        p_wins_delta: Math.max(0, Math.min(5, Math.round(getSafeGameStatNumber(deltas && deltas.winsDelta, 0)))),
        p_losses_delta: Math.max(0, Math.min(5, Math.round(getSafeGameStatNumber(deltas && deltas.lossesDelta, 0)))),
        p_draws_delta: Math.max(0, Math.min(5, Math.round(getSafeGameStatNumber(deltas && deltas.drawsDelta, 0)))),
        p_points_delta: Math.max(0, Math.min(5000, Math.round(getSafeGameStatNumber(deltas && deltas.pointsDelta, 0))))
      }), { mode: 'write', attempts: 1 });
      if (error) throw error;
      rememberGameStatsRpcSmoke('success', type);
      return data || null;
    } catch (err) {
      if (isSupabaseRpcUnavailableError(err)) {
        SUPABASE_RPC_HARDENING_STATUS.lastUnavailableAt = new Date().toISOString();
        SUPABASE_RPC_HARDENING_STATUS.lastUnavailableMessage = String(err && err.message ? err.message : err);
        rememberGameStatsRpcSmoke('fallback', type, 'rpc-unavailable');
        return null;
      }
      // Fáze 2E-C: RPC je preferovaná a perzistentně měřená, ale přímý fallback zatím zůstává kvůli kompatibilitě.
      rememberGameStatsRpcSmoke('fallback', type, err && err.message ? err.message : err);
      console.warn('rak_record_game_stat_delta failed, falling back to direct game_stats write', err);
      return null;
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
    const existingBeforeReset = gameProgressIsBeforeReset(Object.assign({ game_type: gameType }, existing || {}));

    const lastPlayedRaw = entry && (entry.last_played_at ?? entry.lastPlayedAt ?? entry.updated_at ?? entry.updatedAt);
    const lastPlayedDate = lastPlayedRaw ? new Date(lastPlayedRaw) : new Date();
    const lastPlayedIso = Number.isNaN(lastPlayedDate.getTime()) ? new Date().toISOString() : lastPlayedDate.toISOString();

    const existingGamesPlayed = existingBeforeReset ? 0 : (Number(existing && existing.games_played || 0) || 0);
    const existingWins = existingBeforeReset ? 0 : (Number(existing && existing.wins || 0) || 0);
    const existingLosses = existingBeforeReset ? 0 : (Number(existing && existing.losses || 0) || 0);
    const existingDraws = existingBeforeReset ? 0 : (Number(existing && existing.draws || 0) || 0);
    const existingPoints = existingBeforeReset ? 0 : (Number(existing && existing.points || 0) || 0);
    const gamesPlayed = Math.max(existingGamesPlayed, Number(entry && (entry.games_played ?? entry.plays) || 0) || 0);
    const derivedPoints = gameType === 'ttt'
      ? gamesPlayed
      : Number(entry && (entry.points ?? entry.bestScore ?? entry.score) || 0) || 0;
    const next = {
      account_number: accountNumber,
      game_type: gameType,
      games_played: gamesPlayed,
      wins: Math.max(existingWins, Number(entry && entry.wins || 0) || 0),
      losses: Math.max(existingLosses, Number(entry && entry.losses || 0) || 0),
      draws: Math.max(existingDraws, Number(entry && entry.draws || 0) || 0),
      points: Math.max(existingPoints, derivedPoints),
      last_played_at: lastPlayedIso,
      updated_at: lastPlayedIso
    };

    const deltas = {
      gamesPlayedDelta: Math.max(0, next.games_played - existingGamesPlayed),
      winsDelta: Math.max(0, next.wins - existingWins),
      lossesDelta: Math.max(0, next.losses - existingLosses),
      drawsDelta: Math.max(0, next.draws - existingDraws),
      pointsDelta: Math.max(0, next.points - existingPoints)
    };
    if (deltas.gamesPlayedDelta || deltas.winsDelta || deltas.lossesDelta || deltas.drawsDelta || deltas.pointsDelta) {
      const rpcRow = await tryRecordGameStatDeltaViaRpc(client, accountNumber, gameType, deltas);
      if (rpcRow) {
        clearGameStatsCache(gameType);
        return rpcRow;
      }
    }

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


  async function getExistingGameStat(client, accountNumber, gameType) {
    const account = String(accountNumber || '').trim();
    const type = String(gameType || '').trim();
    if (!account || !type) return null;
    const res = await runSupabaseOperation('game_stats.lookup_existing', () => client
      .from('game_stats')
      .select('id,games_played,wins,losses,draws,points,last_played_at,updated_at')
      .eq('account_number', account)
      .eq('game_type', type)
      .order('updated_at', { ascending: false })
      .limit(1), { mode: 'read' });
    if (res && res.error) throw res.error;
    return Array.isArray(res && res.data) && res.data.length ? res.data[0] : null;
  }

  async function bumpTttGameStat(client, accountNumber, resultKind) {
    const account = String(accountNumber || '').trim();
    if (!account) return null;
    const existing = await getExistingGameStat(client, account, 'ttt');
    const nowIso = new Date().toISOString();
    const existingBeforeReset = gameProgressIsBeforeReset(Object.assign({ game_type: 'ttt' }, existing || {}));
    const currentPlayed = existingBeforeReset ? 0 : (Number(existing && existing.games_played || 0) || 0);
    const currentWins = existingBeforeReset ? 0 : (Number(existing && existing.wins || 0) || 0);
    const currentLosses = existingBeforeReset ? 0 : (Number(existing && existing.losses || 0) || 0);
    const currentDraws = existingBeforeReset ? 0 : (Number(existing && existing.draws || 0) || 0);
    const next = {
      account_number: account,
      game_type: 'ttt',
      games_played: currentPlayed + 1,
      wins: currentWins + (resultKind === 'win' ? 1 : 0),
      losses: currentLosses + (resultKind === 'loss' ? 1 : 0),
      draws: currentDraws + (resultKind === 'draw' ? 1 : 0),
      points: currentPlayed + 1,
      last_played_at: nowIso,
      updated_at: nowIso
    };
    const rpcRow = await tryRecordGameStatDeltaViaRpc(client, account, 'ttt', {
      gamesPlayedDelta: 1,
      winsDelta: resultKind === 'win' ? 1 : 0,
      lossesDelta: resultKind === 'loss' ? 1 : 0,
      drawsDelta: resultKind === 'draw' ? 1 : 0,
      pointsDelta: 1
    });
    if (rpcRow) {
      clearGameStatsCache('ttt');
      return rpcRow;
    }

    if (existing && existing.id) {
      const { data, error } = await runSupabaseOperation('game_stats.ttt_bump_update', () => client.from('game_stats').update(next).eq('id', existing.id).select('*').maybeSingle(), { mode: 'write' });
      if (error) throw error;
      clearGameStatsCache('ttt');
      return data || next;
    }
    const { data, error } = await runSupabaseOperation('game_stats.ttt_bump_insert', () => client.from('game_stats').insert([next]).select('*').maybeSingle(), { mode: 'write', attempts: 1 });
    if (error) throw error;
    clearGameStatsCache('ttt');
    return data || next;
  }

  async function recordTttSessionResultByInviteCodeDirect(client, code, options) {
    const inviteCode = String(code || '').trim();
    if (!inviteCode) return { ok: false, reason: 'missing-code' };
    const loaded = await loadGameInviteByCode(client, inviteCode);
    if (!loaded.invite) return { ok: false, reason: 'missing-invite' };
    const { data: sessionRows, error: sessionErr } = await runSupabaseOperation('game_sessions.record_result_lookup', () => client
      .from('game_sessions')
      .select('*')
      .eq('invite_id', loaded.invite.id)
      .order('updated_at', { ascending: false })
      .limit(5), { mode: 'read' });
    if (sessionErr) throw sessionErr;
    const rows = Array.isArray(sessionRows) ? sessionRows : [];
    const sessionData = rows.find(row => String(row && row.status || '').toLowerCase() === 'finished') || rows[0] || null;
    if (!sessionData) return { ok: false, reason: 'missing-session' };
    const boardState = sessionData.board_state && typeof sessionData.board_state === 'object' ? Object.assign({}, sessionData.board_state) : {};
    const winner = String(boardState.winner || sessionData.winner || '').trim();
    const gameOver = !!boardState.gameOver || String(sessionData.status || '').toLowerCase() === 'finished';
    if (!gameOver || !winner) return { ok: false, reason: 'not-finished' };
    if (boardState.statsRecordedAt) return { ok: true, skipped: true, reason: 'already-recorded', session: sessionData };

    const xAcc = String(sessionData.player_x_account_number || boardState.playerXAccountNumber || loaded.invite.inviter_account_number || '').trim();
    const oAcc = String(sessionData.player_o_account_number || boardState.playerOAccountNumber || loaded.invite.invitee_account_number || '').trim();
    if (!xAcc || !oAcc) return { ok: false, reason: 'missing-players' };

    let xKind = '';
    let oKind = '';
    if (winner === 'draw') {
      xKind = 'draw';
      oKind = 'draw';
    } else if (winner === 'X') {
      xKind = 'win';
      oKind = 'loss';
    } else if (winner === 'O') {
      xKind = 'loss';
      oKind = 'win';
    } else {
      return { ok: false, reason: 'unknown-winner' };
    }

    boardState.statsRecordedAt = new Date().toISOString();
    boardState.statsRecordedBy = 'client-once-guard';
    boardState.statsRecordedSessionId = sessionData.id || null;
    const { data: updatedSession, error: updateErr } = await runSupabaseOperation('game_sessions.record_result_mark_once', () => client
      .from('game_sessions')
      .update({ board_state: boardState, winner_account_number: (winner === 'X' ? xAcc : (winner === 'O' ? oAcc : null)), status: 'finished', finished_at: sessionData.finished_at || new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', sessionData.id)
      .is('board_state->>statsRecordedAt', null)
      .select('*')
      .maybeSingle(), { mode: 'write' });
    if (updateErr) throw updateErr;
    if (!updatedSession) return { ok: true, skipped: true, reason: 'already-recorded', session: sessionData };

    await bumpTttGameStat(client, xAcc, xKind);
    await bumpTttGameStat(client, oAcc, oKind);
    clearGameStatsCache('ttt');
    return { ok: true, session: updatedSession || sessionData, recorded: true };
  }

  async function loadTttHeadToHeadDirect(client, playerA, playerB, options) {
    const a = String(playerA || '').trim();
    const b = String(playerB || '').trim();
    const gameType = String(options && (options.gameType || options.game_type) || 'gomoku').trim() || 'gomoku';
    if (!a || !b || a === b) return { ok: true, rows: [], score: { xWins: 0, oWins: 0, aWins: 0, bWins: 0, draws: 0, total: 0 }, players: { a, b } };
    const cacheKey = LOCAL_GAME_SESSIONS_PREFIX + 'h2h:' + encodeURIComponent(gameType + ':' + [a, b].sort().join(':'));
    const forceRefresh = !!(options && options.force);
    const cached = forceRefresh ? null : readTimedCache(cacheKey, SUPABASE_GAME_CACHE_TTL_MS);
    if (cached && cached.fresh && cached.rows && cached.rows[0]) {
      rememberTimedCacheHit('session', cached);
      return cached.rows[0];
    }
    const orExpr = 'and(player_x_account_number.eq.' + a + ',player_o_account_number.eq.' + b + '),and(player_x_account_number.eq.' + b + ',player_o_account_number.eq.' + a + ')';
    const { data, error } = await runSupabaseOperation('game_sessions.ttt_head_to_head', () => client
      .from('game_sessions')
      .select('id,player_x_account_number,player_o_account_number,winner_account_number,status,board_state,updated_at,finished_at')
      .eq('game_type', gameType)
      .eq('status', 'finished')
      .gte('finished_at', GAME_PROGRESS_RESET_CUTOFF_ISO)
      .or(orExpr)
      .order('updated_at', { ascending: false })
      .limit(100), { mode: 'read' });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    const score = { xWins: 0, oWins: 0, aWins: 0, bWins: 0, draws: 0, total: rows.length };
    rows.forEach((row) => {
      const boardState = row && row.board_state && typeof row.board_state === 'object' ? row.board_state : {};
      const winner = String(boardState.winner || boardState.winnerRole || '').toUpperCase();
      const xAcc = String(row && row.player_x_account_number || '').trim();
      const oAcc = String(row && row.player_o_account_number || '').trim();
      let winnerAcc = String(row && row.winner_account_number || boardState.winnerAccountNumber || '').trim();
      if (!winnerAcc && winner === 'X') winnerAcc = xAcc;
      if (!winnerAcc && winner === 'O') winnerAcc = oAcc;
      if (winner === 'DRAW' || winner === 'draw' || boardState.winner === 'draw') score.draws += 1;
      else if (winner === 'X') score.xWins += 1;
      else if (winner === 'O') score.oWins += 1;
      if (winnerAcc === a) score.aWins += 1;
      else if (winnerAcc === b) score.bWins += 1;
    });
    const result = { ok: true, rows, score, players: { a, b } };
    writeTimedCache(cacheKey, [result], 'session');
    return result;
  }

  async function loadTttHeadToHeadListDirect(client, options = {}) {
    const forceRefresh = !!(options && options.force);
    const limit = Math.max(20, Math.min(500, Number(options && options.limit) || 200));
    const gameType = String(options && options.gameType || options && options.game_type || 'gomoku').trim() || 'gomoku';
    const cacheKey = LOCAL_GAME_SESSIONS_PREFIX + 'h2h-list:' + encodeURIComponent(gameType) + ':' + String(limit);
    const cached = forceRefresh ? null : readTimedCache(cacheKey, SUPABASE_GAME_CACHE_TTL_MS);
    if (cached && cached.fresh && cached.rows && cached.rows[0]) {
      rememberTimedCacheHit('session', cached);
      return cached.rows[0];
    }
    const { data, error } = await runSupabaseOperation('game_sessions.ttt_head_to_head_list', () => client
      .from('game_sessions')
      .select('id,player_x_account_number,player_o_account_number,winner_account_number,status,board_state,updated_at,finished_at')
      .eq('game_type', gameType)
      .eq('status', 'finished')
      .gte('finished_at', GAME_PROGRESS_RESET_CUTOFF_ISO)
      .not('player_x_account_number', 'is', null)
      .not('player_o_account_number', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(limit), { mode: 'read' });
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    const accountSet = new Set();
    rows.forEach((row) => {
      const x = String(row && row.player_x_account_number || '').trim();
      const o = String(row && row.player_o_account_number || '').trim();
      if (x) accountSet.add(x);
      if (o) accountSet.add(o);
    });
    const accountIds = Array.from(accountSet);
    const names = {};
    if (accountIds.length) {
      try {
        const { data: accountRows, error: accountErr } = await runSupabaseOperation('game_accounts.ttt_head_to_head_names', () => client
          .from('game_accounts')
          .select('account_number,full_name')
          .in('account_number', accountIds), { mode: 'read' });
        if (!accountErr && Array.isArray(accountRows)) {
          accountRows.forEach((acc) => {
            const id = String(acc && acc.account_number || '').trim();
            if (id) names[id] = String(acc && acc.full_name || '').trim();
          });
        }
      } catch (err) {}
    }
    const pairs = new Map();
    rows.forEach((row) => {
      const x = String(row && row.player_x_account_number || '').trim();
      const o = String(row && row.player_o_account_number || '').trim();
      if (!x || !o || x === o) return;
      const sorted = [x, o].sort();
      const key = sorted.join('::');
      if (!pairs.has(key)) {
        pairs.set(key, {
          playerA: sorted[0],
          playerB: sorted[1],
          nameA: names[sorted[0]] || '',
          nameB: names[sorted[1]] || '',
          aWins: 0,
          bWins: 0,
          draws: 0,
          total: 0,
          lastPlayedAt: ''
        });
      }
      const pair = pairs.get(key);
      const boardState = row && row.board_state && typeof row.board_state === 'object' ? row.board_state : {};
      const winner = String(boardState.winner || boardState.winnerRole || '').toUpperCase();
      let winnerAcc = String(row && row.winner_account_number || boardState.winnerAccountNumber || '').trim();
      if (!winnerAcc && winner === 'X') winnerAcc = x;
      if (!winnerAcc && winner === 'O') winnerAcc = o;
      if (winnerAcc === pair.playerA) pair.aWins += 1;
      else if (winnerAcc === pair.playerB) pair.bWins += 1;
      else pair.draws += 1;
      pair.total += 1;
      const playedAt = String(row && (row.finished_at || row.updated_at) || '').trim();
      if (!pair.lastPlayedAt || playedAt > pair.lastPlayedAt) pair.lastPlayedAt = playedAt;
    });
    const resultRows = Array.from(pairs.values())
      .filter(pair => pair.total > 0)
      .sort((a, b) => (b.total - a.total) || String(b.lastPlayedAt || '').localeCompare(String(a.lastPlayedAt || '')))
      .slice(0, 50);
    const result = { ok: true, rows: resultRows, totalPairs: resultRows.length };
    writeTimedCache(cacheKey, [result], 'session');
    return result;
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


  async function trySaveGameUiSettingsViaRpc(client, normalized) {
    if (!client || typeof client.rpc !== 'function' || !normalized || !normalized.account_number) return null;
    try {
      rememberGameUiRpcSmoke('attempt');
      const { data, error } = await runSupabaseOperation('game_ui_settings.rpc_save', () => client.rpc('rak_save_game_ui_settings', {
        p_account_number: normalized.account_number,
        p_theme_index: Math.max(0, Math.min(999, Math.round(getSafeGameStatNumber(normalized.theme_index, 0)))),
        p_background_index: Math.max(0, Math.min(999, Math.round(getSafeGameStatNumber(normalized.background_index, 0)))),
        p_points: Math.max(0, Math.min(999999, Math.round(getSafeGameStatNumber(normalized.encoded_points, 0))))
      }), { mode: 'write', attempts: 1 });
      if (error) throw error;
      rememberGameUiRpcSmoke('success');
      return data || null;
    } catch (err) {
      if (isSupabaseRpcUnavailableError(err)) {
        SUPABASE_RPC_HARDENING_STATUS.lastUnavailableAt = new Date().toISOString();
        SUPABASE_RPC_HARDENING_STATUS.lastUnavailableMessage = String(err && err.message ? err.message : err);
        rememberGameUiRpcSmoke('fallback', 'rpc-unavailable');
        return null;
      }
      rememberGameUiRpcSmoke('fallback', err && err.message ? err.message : err);
      console.warn('rak_save_game_ui_settings failed; direct game_stats __profile_ui fallback should be blocked after v824', err);
      return null;
    }
  }

  async function saveGameAccountUiSettingsDirect(client, entry) {
    const normalized = normalizeGameUiSettings(entry);
    if (!normalized.account_number) throw new Error('Chybí herní účet pro uložení vzhledu.');
    const rpcSaved = await trySaveGameUiSettingsViaRpc(client, normalized);
    if (rpcSaved) {
      const decodedRpc = decodeGameUiSettingsRow(rpcSaved) || {
        account_number: normalized.account_number,
        theme_id: normalized.theme_id,
        background_id: normalized.background_id,
        updated_at: rpcSaved.updated_at || rpcSaved.last_played_at || new Date().toISOString(),
        source: 'game_stats_profile_ui_rpc'
      };
      writeTimedCache(gameUiSettingsCacheKey(normalized.account_number), [decodedRpc], 'ui');
      state.cacheGuard.uiSettingsSaves += 1;
      return decodedRpc;
    }

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
        const { data, error } = await runSharedSupabaseRead('rotation_state.load:main', () => runSupabaseOperation('rotation_state.load', () => client.from('rotation_state').select('*').eq('key', 'main').maybeSingle(), { mode: 'read' }));
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
        const row = await runOptimizedSupabaseWrite('rotation_state.save', { rotation, meta }, () => runSupabaseOperation('rotation_state.save', () => upsertRotationStateDirect(client, rotation, meta), { mode: 'write' }), { windowMs: 2200 });
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

  async function loadGomokuWins(limit, options) {
    const client = getClient();
    if (!client || !navigator.onLine) return [];
    try {
      const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
      const rulesetVersion = String(options && (options.rulesetVersion || options.ruleset_version) || window.GOMOKU_RULESET_VERSION || 'gomoku-10col-19row-ai-rules-v3').trim() || 'gomoku-10col-19row-ai-rules-v3';
      const readKey = 'gomoku_wins.load:' + safeLimit + ':' + rulesetVersion;
      const res = await runSharedSupabaseRead(readKey, () => runSupabaseOperation('gomoku_wins.load', () => client
        .from('gomoku_wins')
        .select('player_name,difficulty,moves,elapsed_ms,elapsed_text,x_moves,o_moves,created_at,app_version,ruleset_version')
        .eq('ruleset_version', rulesetVersion)
        .order('created_at', { ascending: false })
        .limit(safeLimit), { mode: 'read' }));
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
        const data = await runOptimizedSupabaseWrite('gomoku_win.save', entry, () => runSupabaseOperation('gomoku_win.save', () => upsertGomokuWinDirect(client, entry), { mode: 'write', attempts: 1 }));
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


  function getSupabasePolicyRiskHealth() {
    const snapshot = Array.isArray(SUPABASE_POLICY_AUDIT_SNAPSHOT) ? SUPABASE_POLICY_AUDIT_SNAPSHOT : [];
    const byPriority = snapshot.reduce((acc, item) => {
      const key = String(item && item.priority ? item.priority : 'PX');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const destructiveTables = snapshot
      .filter(item => /delete|reset|destruktiv/i.test(String((item && item.risk) || '') + ' ' + String((item && item.observed) || '')))
      .map(item => String(item.table || ''))
      .filter(Boolean);
    const publicWriteTables = snapshot
      .filter(item => /(public|anon).*(INSERT|UPDATE|DELETE|ALL)|INSERT|UPDATE|DELETE|ALL/i.test(String((item && item.observed) || '')))
      .map(item => String(item.table || ''))
      .filter(Boolean);
    const issues = [];
    if (byPriority.P0) issues.push('P0 Supabase/RLS: veřejné nebo anon zápisy u kritických tabulek (' + String(byPriority.P0) + ' nálezů)');
    if (destructiveTables.length) issues.push('Riziko destruktivních akcí přes veřejné policies: ' + Array.from(new Set(destructiveTables)).join(', '));
    if (publicWriteTables.length) issues.push('Veřejné/anon write policies vyžadují serverové zúžení: ' + Array.from(new Set(publicWriteTables)).join(', '));
    return {
      ok: issues.length === 0,
      mode: 'supabase-live-policy-audit-snapshot',
      version: SUPABASE_POLICY_AUDIT_SNAPSHOT_VERSION,
      checkedAt: SUPABASE_POLICY_AUDIT_SNAPSHOT_AT,
      phase: Object.assign({}, SUPABASE_POLICY_HARDENING_PHASE),
      issues: issues.slice(0, 12),
      p0Count: Number(byPriority.P0 || 0),
      p1Count: Number(byPriority.P1 || 0),
      p2Count: Number(byPriority.P2 || 0),
      publicWriteTableCount: Array.from(new Set(publicWriteTables)).length,
      destructiveTableCount: Array.from(new Set(destructiveTables)).length,
      publicWriteTables: Array.from(new Set(publicWriteTables)).slice(0, 16),
      destructiveTables: Array.from(new Set(destructiveTables)).slice(0, 16),
      findings: snapshot.map(item => Object.assign({}, item)).slice(0, 20)
    };
  }


  function getSupabaseHardeningReadiness() {
    const gameStatsSmoke = getGameStatsRpcSmokeStatus();
    const gameUiSmoke = getGameUiRpcSmokeStatus();
    const gameSessionSmoke = getGameSessionRpcSmokeStatus();
    const keepalive = getSupabaseKeepaliveStatus();
    const items = SUPABASE_HARDENING_READINESS_ITEMS.map(item => Object.assign({}, item));
    const directFallbackItems = items.filter(item => /ano|zůstává|veřejný|direct/i.test(String(item.directFallback || '')));
    const p0Items = items.filter(item => String(item.priority || '') === 'P0');
    const blockers = [];
    if (!keepalive || keepalive.status !== 'ok') blockers.push('heartbeat ještě není v lokální diagnostice OK');
    if (!gameSessionSmoke.readyForPolicyTightening) blockers.push('online hry RPC smoke ještě nemá Piškvorky i Lodě create/accept/save bez fallbacků');
    if (!gameStatsSmoke.readyForPolicyTightening) blockers.push('game_stats RPC smoke ještě nemá 3 OK bez fallbacků');
    if (!gameUiSmoke.readyForPolicyTightening) blockers.push('profile UI RPC smoke ještě nemá OK bez fallbacku');
    const confirmed = {
      tttLinkAndCode: true,
      keepaliveRpc: keepalive && keepalive.status === 'ok',
      noPolicyChangeInThisBuild: true
    };
    const smokeOkCount = [gameStatsSmoke, gameUiSmoke, gameSessionSmoke].filter(item => item && item.readyForPolicyTightening).length;
    const readinessPercent = Math.min(100, Math.round((Number(confirmed.keepaliveRpc ? 1 : 0) + smokeOkCount + 1) / 5 * 100));
    return {
      ok: blockers.length === 0,
      mode: 'supabase-hardening-readiness-audit-only',
      version: '1.2 (1.104)',
      checkedAt: new Date().toISOString(),
      confirmed,
      readinessPercent,
      policyChangeAllowedNow: false,
      policyChangeReason: 'V856 je release hygiene a SQL inventory cleanup; policies game_invites/game_sessions se v tomto buildu neutahují.',
      nextSafeStep: 'Nejdřív reálný RPC smoke create/accept/save zvlášť pro Piškvorky i Lodě bez fallbacku; potom připravit úzký SQL návrh pro jednu tabulku.',
      items,
      itemCount: items.length,
      p0Count: p0Items.length,
      directFallbackCount: directFallbackItems.length,
      directFallbackAreas: directFallbackItems.map(item => item.area).slice(0, 12),
      blockers: blockers.slice(0, 12),
      gameStatsSmoke,
      gameUiSmoke,
      gameSessionSmoke,
      keepaliveStatus: keepalive
    };
  }

  function getSupabaseStructureHealth() {
    const issues = [];
    const warnings = [];
    const configUrl = String(SUPABASE_CONFIG.url || '').trim();
    const publishableKey = String(SUPABASE_CONFIG.publishableKey || '').trim();
    const realtimeSet = new Set(REALTIME_TABLES.map((table) => String(table || '').trim()).filter(Boolean));
    const queueSet = new Set(Array.from(SUPPORTED_QUEUE_TYPES || []).map((type) => String(type || '').trim()).filter(Boolean));
    const realtimeDuplicates = REALTIME_TABLES
      .map((table) => String(table || '').trim())
      .filter((table, index, arr) => table && arr.indexOf(table) !== index);
    const expectedTables = SUPABASE_STRUCTURE_CONTRACTS.map((item) => item.table);
    const missingRealtimeTables = SUPABASE_STRUCTURE_CONTRACTS
      .filter((item) => item.realtime && !realtimeSet.has(item.table))
      .map((item) => item.table);
    const missingQueueTypes = SUPABASE_STRUCTURE_CONTRACTS
      .filter((item) => item.queueType && !queueSet.has(item.queueType))
      .map((item) => item.queueType + ' → ' + item.table);
    const missingHelpers = SUPABASE_STRUCTURE_REQUIRED_HELPERS.filter((name) => {
      try {
        if (name === 'getClient') return typeof getClient !== 'function';
        if (name === 'runSupabaseOperation') return typeof runSupabaseOperation !== 'function';
        if (name === 'runSharedSupabaseRead') return typeof runSharedSupabaseRead !== 'function';
        if (name === 'runOptimizedSupabaseWrite') return typeof runOptimizedSupabaseWrite !== 'function';
        if (name === 'readQueue') return typeof readQueue !== 'function';
        if (name === 'enqueueTask') return typeof enqueueTask !== 'function';
        if (name === 'requestRealtimeRefresh') return typeof requestRealtimeRefresh !== 'function';
        if (name === 'bindRealtime') return typeof bindRealtime !== 'function';
        if (name === 'getSupabasePerformanceHealth') return typeof getSupabasePerformanceHealth !== 'function';
        if (name === 'getSupabaseKeepaliveStatus') return typeof getSupabaseKeepaliveStatus !== 'function';
        if (name === 'getSupabaseHardeningStatus') return typeof getSupabaseHardeningStatus !== 'function';
        if (name === 'getSupabaseHardeningReadiness') return typeof getSupabaseHardeningReadiness !== 'function';
      } catch (err) {
        return true;
      }
      return false;
    });
    const requiredGrantSignals = SUPABASE_STRUCTURE_CONTRACTS.map((item) => item.table + ': ' + item.access);
    const rlsPolicyChecklist = SUPABASE_STRUCTURE_CONTRACTS.map((item) => ({
      table: item.table,
      expected: item.access,
      appUse: item.note
    }));
    const online = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
    const clientReady = !!getClient();

    if (!configUrl || !publishableKey) issues.push('chybí Supabase url/publishableKey');
    if (!clientReady) issues.push('Supabase client není připravený');
    if (missingRealtimeTables.length) issues.push('chybí realtime tabulky: ' + missingRealtimeTables.join(', '));
    if (missingQueueTypes.length) issues.push('chybí queue typy: ' + missingQueueTypes.join(', '));
    if (missingHelpers.length) issues.push('chybí Supabase helpery: ' + missingHelpers.join(', '));
    if (realtimeDuplicates.length) warnings.push('duplicitní realtime tabulky: ' + Array.from(new Set(realtimeDuplicates)).join(', '));
    if (!online) warnings.push('offline — vzdálenou Supabase strukturu nelze ověřovat za běhu');

    return {
      ok: issues.length === 0,
      mode: 'supabase-structure-rls-grant-policy-contract-audit',
      issues: issues.slice(0, 12),
      warnings: warnings.slice(0, 12),
      configReady: !!(configUrl && publishableKey),
      clientReady,
      online,
      expectedTableCount: expectedTables.length,
      expectedTables: expectedTables.slice(0, 24),
      realtimeTableCount: REALTIME_TABLES.length,
      realtimeTables: REALTIME_TABLES.slice(0, 24),
      missingRealtimeTableCount: missingRealtimeTables.length,
      missingRealtimeTables: missingRealtimeTables.slice(0, 12),
      queueTypeCount: queueSet.size,
      missingQueueTypeCount: missingQueueTypes.length,
      missingQueueTypes: missingQueueTypes.slice(0, 12),
      helperCount: SUPABASE_STRUCTURE_REQUIRED_HELPERS.length,
      missingHelperCount: missingHelpers.length,
      missingHelpers: missingHelpers.slice(0, 12),
      grantSignalCount: requiredGrantSignals.length,
      requiredGrantSignals: requiredGrantSignals.slice(0, 24),
      rlsPolicyChecklistCount: rlsPolicyChecklist.length,
      rlsPolicyChecklist: rlsPolicyChecklist.slice(0, 24),
      checkedAt: new Date().toISOString()
    };
  }

  function getSupabasePerformanceHealth() {
    const queue = readQueue();
    const queueHealth = getQueueHealth(queue);
    const perf = state.performanceGuard || {};
    const cache = state.cacheGuard || {};
    const issues = [];
    const online = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
    const clientReady = !!getClient();
    const realtimeStatus = String(state.realtimeStatus || 'idle');
    const cacheHits = Number(cache.accountCacheHits || 0) + Number(cache.statsCacheHits || 0) + Number(cache.uiCacheHits || 0) + Number(cache.sessionCacheHits || 0);
    const cacheWrites = Number(cache.accountCacheWrites || 0) + Number(cache.statsCacheWrites || 0) + Number(cache.uiCacheWrites || 0) + Number(cache.sessionCacheWrites || 0);

    if (!clientReady) issues.push('Supabase client není připravený');
    if (queueHealth && queueHealth.critical) issues.push('offline fronta má kriticky staré položky');
    if (queue.length > Math.floor(SUPABASE_QUEUE_MAX_ITEMS * 0.85)) issues.push('offline fronta je skoro plná');
    if (Number(perf.sharedReadActive || 0) > 6) issues.push('moc souběžných Supabase čtení');
    if (Number(perf.writeOptimizationActive || 0) > 4) issues.push('moc souběžných Supabase zápisů');
    if (['channel_error', 'timed_out', 'closed', 'failed'].includes(realtimeStatus.toLowerCase()) && online) issues.push('Realtime není zdravý');

    return {
      ok: issues.length === 0,
      mode: 'supabase-performance-cache-realtime-write-guard',
      issues: issues.slice(0, 12),
      online,
      clientReady,
      realtimeStatus,
      realtimeTableCount: REALTIME_TABLES.length,
      realtimeRefreshDelayMs: SUPABASE_REALTIME_REFRESH_DELAY_MS,
      realtimeRefreshHiddenDelayMs: SUPABASE_REALTIME_REFRESH_HIDDEN_DELAY_MS,
      realtimeRefreshRequests: Number(perf.realtimeRefreshRequests || 0),
      realtimeRefreshRuns: Number(perf.realtimeRefreshRuns || 0),
      realtimeRefreshCoalesced: Number(perf.realtimeRefreshCoalesced || 0),
      realtimeRefreshHiddenDefers: Number(perf.realtimeRefreshHiddenDefers || 0),
      realtimeRefreshErrors: Number(perf.realtimeRefreshErrors || 0),
      sharedReadStarts: Number(perf.sharedReadStarts || 0),
      sharedReadJoins: Number(perf.sharedReadJoins || 0),
      sharedReadActive: Number(perf.sharedReadActive || 0),
      sharedReadPeak: Number(perf.sharedReadPeak || 0),
      writeOptimizationChecks: Number(perf.writeOptimizationChecks || 0),
      writeOptimizationStarts: Number(perf.writeOptimizationStarts || 0),
      writeOptimizationJoins: Number(perf.writeOptimizationJoins || 0),
      writeOptimizationSkips: Number(perf.writeOptimizationSkips || 0),
      writeOptimizationActive: Number(perf.writeOptimizationActive || 0),
      writeOptimizationPeak: Number(perf.writeOptimizationPeak || 0),
      writeDedupeWindowMs: SUPABASE_WRITE_DEDUPE_WINDOW_MS,
      writeSharedActive: sharedWritePromises.size,
      recentWriteFingerprints: recentWriteFingerprints.size,
      lastWriteOptimizationKey: String(perf.lastWriteOptimizationKey || ''),
      lastRealtimeRefreshTable: String(perf.lastRealtimeRefreshTable || ''),
      lastRealtimeRefreshReason: String(perf.lastRealtimeRefreshReason || ''),
      lastSharedReadKey: String(perf.lastSharedReadKey || ''),
      cacheHits,
      cacheWrites,
      staleFallbacks: Number(cache.staleFallbacks || 0),
      queueLength: queue.length,
      queueMaxItems: SUPABASE_QUEUE_MAX_ITEMS,
      queueOldestAgeMs: Number(queueHealth && queueHealth.oldestAgeMs || 0),
      queueStaleTaskCount: Number(queueHealth && queueHealth.staleTaskCount || 0),
      queueCritical: !!(queueHealth && queueHealth.critical),
      checkedAt: new Date().toISOString()
    };
  }

  function getSupabaseHardeningStatus() {
    const queue = readQueue();
    const queueHealth = rememberQueueHealth(queue);
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
      performanceGuard: Object.assign({}, state.performanceGuard),
      performanceHealth: getSupabasePerformanceHealth(),
      keepaliveStatus: getSupabaseKeepaliveStatus(),
      appUsageStatus: readAppUsageStatus(),
      structureHealth: getSupabaseStructureHealth(),
      policyRiskHealth: getSupabasePolicyRiskHealth(),
      hardeningReadiness: getSupabaseHardeningReadiness(),
      rpcHardening: Object.assign({}, SUPABASE_RPC_HARDENING_STATUS, getGameStatsRpcSmokeStatus()),
      gameStatsRpcSmoke: getGameStatsRpcSmokeStatus(),
      gameUiRpcSmoke: getGameUiRpcSmokeStatus(),
      gameSessionRpcSmoke: getGameSessionRpcSmokeStatus(),
      readTimeoutMs: SUPABASE_READ_TIMEOUT_MS,
      writeTimeoutMs: SUPABASE_WRITE_TIMEOUT_MS,
      queueFlushBatchSize: SUPABASE_QUEUE_FLUSH_BATCH_SIZE,
      queueHiddenRetryDelayMs: SUPABASE_QUEUE_HIDDEN_RETRY_DELAY_MS,
      queueWakeGuardMs: SUPABASE_QUEUE_WAKE_GUARD_MS,
      queueNextRetryAt: state.syncGuard.queueNextRetryAt || null,
      queueHealth
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
      scheduleSupabaseKeepalive('init-ready', 1400);
      scheduleAppUsage('app-open', 2600);
      return refreshPublicData();
    }
    if (!hasClient()) {
      return refreshPublicData();
    }
    bindRealtimeSubscriptions();
    scheduleSupabaseQueueFlush('init', 650);
    scheduleSupabaseKeepalive('init', 1600);
    scheduleAppUsage('app-open', 2800);
    return refreshPublicData();
  }

  window.sendGomokuWin = sendGomokuWin;

  async function countAdminRowsDirect(client, table, configure) {
    try {
      let query = client.from(table).select('*', { count: 'exact', head: true });
      if (typeof configure === 'function') query = configure(query);
      const { count, error } = await runSupabaseOperation('admin.count.' + table, () => query, { mode: 'read', attempts: 1, timeoutMs: 9000 });
      if (error) throw error;
      return Number(count || 0) || 0;
    } catch (err) {
      return null;
    }
  }

  async function getAdminServiceSnapshotDirect(client) {
    const nowIso = new Date().toISOString();
    const counts = {
      game_accounts: await countAdminRowsDirect(client, 'game_accounts'),
      game_stats: await countAdminRowsDirect(client, 'game_stats'),
      game_invites: await countAdminRowsDirect(client, 'game_invites'),
      game_invites_pending: await countAdminRowsDirect(client, 'game_invites', q => q.eq('status', 'pending')),
      game_sessions: await countAdminRowsDirect(client, 'game_sessions'),
      game_sessions_active: await countAdminRowsDirect(client, 'game_sessions', q => q.in('status', ['active', 'waiting', 'placing'])),
      bug_reports_new: await countAdminRowsDirect(client, 'bug_reports', q => q.eq('status', 'new')),
      app_usage_devices: await countAdminRowsDirect(client, 'app_usage_devices'),
      app_usage_events_24h: await countAdminRowsDirect(client, 'app_usage_events', q => q.gte('seen_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()))
    };
    const profileUiRows = await countAdminRowsDirect(client, 'game_stats', q => q.eq('game_type', GAME_UI_SETTINGS_TYPE));
    counts.profile_ui_settings = profileUiRows;
    return {
      ok: true,
      at: nowIso,
      counts,
      sync: getSyncUiStatus(),
      bridge: getSupabaseHardeningStatus(),
      profileUiStorage: 'game_stats:' + GAME_UI_SETTINGS_TYPE
    };
  }

  async function cleanupExpiredGameInvitesDirect(client) {
    const { data, error } = await runSupabaseOperation('admin.cleanup_expired_game_invites', () => client.rpc('rak_admin_cleanup_expired_game_invites'), { mode: 'write', attempts: 1, timeoutMs: 12000 });
    if (error) throw error;
    return { ok: true, data: data || null, at: new Date().toISOString() };
  }

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
    recordTttSessionResultByInviteCode: async (code, options = {}) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline' };
      try { const result = await recordTttSessionResultByInviteCodeDirect(client, code, options); state.lastError = null; return result; }
      catch (err) { state.lastError = err; console.error('TTT session result record failed', err); return { ok: false, error: err }; }
    },
    loadGameStats: async (gameType, limit = 10, options = {}) => {
      const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
      const cache = readTimedCache(gameStatsCacheKey(gameType, safeLimit), SUPABASE_GAME_CACHE_TTL_MS);
      const client = getClient();
      if (!client || !navigator.onLine) {
        if (cache && cache.rows) {
          rememberTimedCacheHit('stats', cache);
          return cache.rows;
        }
        return [];
      }
      try { const rows = await loadGameStatsDirect(client, gameType, safeLimit, options); state.lastError = null; return rows; }
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
        const result = Object.assign({ ok: true }, await runOptimizedSupabaseWrite('game_stat.save', payload, () => saveGameStatDirect(client, payload)));
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
        const row = await runOptimizedSupabaseWrite('game_ui_settings.save:' + String(normalized.account_number || ''), normalized, () => saveGameAccountUiSettingsDirect(client, normalized), { windowMs: 2600 });
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
    submitBugReport: async (payload) => {
      const client = getClient();
      if (!client || !navigator.onLine) return await enqueueAndMaybeFlush({ type: 'bug_report', entry: payload });
      try {
        if (shouldDeferOnlineWrite()) return Object.assign(await enqueueAndMaybeFlush({ type: 'bug_report', entry: payload }), { deferred: true });
        const result = await runOptimizedSupabaseWrite('bug_report.save:' + String(payload && payload.id || Date.now()), payload, () => saveBugReportDirect(client, payload), { windowMs: 500 });
        state.lastError = null;
        await flushPendingWrites();
        return Object.assign({ ok: true, queued: false }, result || {});
      } catch (err) {
        state.lastError = err;
        console.error('Bug report save failed', err);
        if (isLikelyTransientError(err)) return await enqueueAndMaybeFlush({ type: 'bug_report', entry: payload });
        return { ok: false, error: err };
      }
    },
    loadBugReports: async (options = {}) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client', rows: [] };
      try {
        const result = await runSharedSupabaseRead('bug_reports.load:' + String(options.status || 'all') + ':' + String(options.limit || 40), () => loadBugReportsDirect(client, options || {}));
        state.lastError = null;
        return result;
      } catch (err) {
        state.lastError = err;
        console.error('Bug reports load failed', err);
        return { ok: false, error: err, rows: [] };
      }
    },
    updateBugReportStatus: async (id, status, note = '') => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client' };
      try {
        const result = await updateBugReportStatusDirect(client, id, status, note);
        state.lastError = null;
        return result;
      } catch (err) {
        state.lastError = err;
        console.error('Bug report status update failed', err);
        return { ok: false, error: err };
      }
    },
    deleteBugReport: async (id) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client' };
      try {
        const result = await deleteBugReportDirect(client, id);
        state.lastError = null;
        return result;
      } catch (err) {
        state.lastError = err;
        console.error('Bug report delete failed', err);
        return { ok: false, error: err };
      }
    },
    recordAppUsage: async (options = {}) => {
      const client = getClient();
      if (!client || !navigator.onLine) {
        const current = readAppUsageStatus();
        writeAppUsageStatus(Object.assign({}, current, { ok: current.ok === true, status: 'offline-or-missing-client', lastSkipReason: !client ? 'missing-client' : 'offline', skipped: Number(current.skipped || 0) + 1 }));
        return { ok: false, reason: 'offline-or-missing-client' };
      }
      const result = await recordAppUsageDirect(client, options || {});
      if (result && result.ok) state.lastError = null;
      else if (result && result.error) state.lastError = result.error;
      return result;
    },
    loadAppUsage: async (options = {}) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client', devices: [], events: [], summary: {} };
      try {
        const result = await runSharedSupabaseRead('app_usage.load:' + String(options.limit || 80), () => loadAppUsageDirect(client, options || {}));
        state.lastError = null;
        return result;
      } catch (err) {
        state.lastError = err;
        console.error('App usage load failed', err);
        return { ok: false, error: err, devices: [], events: [], summary: {} };
      }
    },
    getAppUsageStatus: () => readAppUsageStatus(),
    saveDashboardAnnouncementOnline,
    clearDashboardAnnouncementOnline,
    getDashboardAnnouncementOnlineStatus,
    runSupabaseKeepalive,
    runKeepaliveNow: (reason) => runSupabaseKeepalive(reason || 'manual', { force: true }),
    getSupabaseKeepaliveStatus,
    seedFromLocalSnapshot,
    flushPendingWrites,
    bindRealtimeSubscriptions,
    getBridgeText,
    getCanteenStatus,
    getSyncUiStatus,
    getAdminServiceSnapshot: async () => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client', counts: {} };
      try { const result = await getAdminServiceSnapshotDirect(client); state.lastError = null; return result; }
      catch (err) { state.lastError = err; console.error('Admin service snapshot failed', err); return { ok: false, error: err, counts: {} }; }
    },
    cleanupExpiredGameInvites: async () => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client' };
      try { const result = await cleanupExpiredGameInvitesDirect(client); state.lastError = null; return result; }
      catch (err) { state.lastError = err; console.error('Expired invites cleanup failed', err); return { ok: false, error: err }; }
    },
    createGameInvite: async (payload) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client' };
      try { const result = Object.assign({ ok: true }, await createGameInviteDirect(client, payload)); state.lastError = null; return result; }
      catch (err) { state.lastError = err; console.error('Game invite create failed', err); return { ok: false, error: err }; }
    },
    acceptGameInvite: async (code, inviteeAccountNumber, context) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client' };
      try { const result = Object.assign({ ok: true }, await acceptGameInviteDirect(client, code, inviteeAccountNumber)); state.lastError = null; if (context && context.gameType) result.requestedGameType = String(context.gameType); return result; }
      catch (err) {
        state.lastError = err;
        console.error('Game invite accept failed', err);
        return { ok: false, error: err, reason: err && (err.reason || err.code) ? (err.reason || err.code) : 'invite-accept-failed', message: gameInviteErrorMessage(err, 'Pozvánku se nepodařilo přijmout.') };
      }
    },
    loadGameSessionByInviteCode: async (code) => {
      const inviteCode = normalizeInviteCode(code);
      const client = getClient();
      if (!inviteCode) return { ok: false, reason: 'missing-code' };
      if (!client || !navigator.onLine) return buildCachedSessionResult(inviteCode);
      try {
        const result = await runSharedSupabaseRead('game_session.load:' + inviteCode, async () => loadGameSessionByInviteCodeDirect(client, inviteCode));
        state.lastError = result && result.ok === false ? state.lastError : null;
        return result && typeof result === 'object' ? result : Object.assign({ ok: true }, result || {});
      }
      catch (err) {
        state.lastError = err;
        console.error('Game session load failed', err);
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
        const result = Object.assign({ ok: true }, await runOptimizedSupabaseWrite('game_session.save:' + inviteCode, payload, () => saveGameSessionByInviteCodeDirect(client, inviteCode, payload), { windowMs: 1200 }));
        state.lastError = null;
        await flushPendingWrites();
        return result;
      }
      catch (err) {
        state.cacheGuard.sessionSaveErrors += 1;
        state.lastError = err;
        console.error('Game session save failed', err);
        if (isLikelyTransientError(err)) {
          state.cacheGuard.sessionSaveQueued += 1;
          buildCachedSessionResult(inviteCode, payload);
          return await enqueueAndMaybeFlush({ type: 'game_session', inviteCode, payload });
        }
        return { ok: false, error: err, reason: err && (err.reason || err.code) ? (err.reason || err.code) : 'session-save-failed', message: gameInviteErrorMessage(err, 'Online uložení se nepovedlo.') };
      }
    },
    loadTttHeadToHead: async (playerA, playerB, options = {}) => {
      const client = getClient();
      const a = String(playerA || '').trim();
      const b = String(playerB || '').trim();
      if (!a || !b) return { ok: false, reason: 'missing-players' };
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client' };
      try { const result = await loadTttHeadToHeadDirect(client, a, b, options); state.lastError = null; return result; }
      catch (err) { state.lastError = err; console.error('TTT head-to-head load failed', err); return { ok: false, error: err }; }
    },
    loadTttHeadToHeadList: async (options = {}) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client', rows: [] };
      try { const result = await loadTttHeadToHeadListDirect(client, options || {}); state.lastError = null; return result; }
      catch (err) { state.lastError = err; console.error('Head-to-head list load failed', err); return { ok: false, error: err, rows: [] }; }
    },
    loadGameHeadToHeadList: async (gameType, options = {}) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client', rows: [] };
      try { const result = await loadTttHeadToHeadListDirect(client, Object.assign({}, options || {}, { gameType: String(gameType || 'gomoku') || 'gomoku' })); state.lastError = null; return result; }
      catch (err) { state.lastError = err; console.error('Game head-to-head list load failed', err); return { ok: false, error: err, rows: [] }; }
    },
    resetGameProgressOnline: async (options = {}) => {
      const client = getClient();
      if (!client || !navigator.onLine) return { ok: false, reason: 'offline-or-missing-client' };
      if (!isClientGameProgressResetAllowed(options || {})) {
        return { ok: false, disabled: true, reason: 'client-maintenance-reset-disabled' };
      }
      try { const result = await resetGameProgressOnlineDirect(client, options || {}); state.lastError = result && result.ok ? null : state.lastError; return result; }
      catch (err) { state.lastError = err; console.error('Game progress reset failed', err); return { ok: false, error: err }; }
    },
    getState: () => ({ ...state })
  };

  window.flushSupabaseSyncQueue = flushPendingWrites;
  window.seedSupabaseFromLocalSnapshot = seedFromLocalSnapshot;

  window.getSupabaseAnnouncement = getBridgeText;
  window.saveRakDashboardAnnouncementOnline = (payload) => window.RotationSupabaseBridge.saveDashboardAnnouncementOnline(payload);
  window.clearRakDashboardAnnouncementOnline = () => window.RotationSupabaseBridge.clearDashboardAnnouncementOnline();
  window.getRakDashboardAnnouncementOnlineStatus = () => window.RotationSupabaseBridge.getDashboardAnnouncementOnlineStatus();
  window.getSupabaseCanteenStatus = getCanteenStatus;
  window.getSupabaseSyncStatus = getSyncUiStatus;
  window.getGameStatsRpcSmokeStatus = getGameStatsRpcSmokeStatus;
  window.getGameUiRpcSmokeStatus = getGameUiRpcSmokeStatus;
  window.getGameSessionRpcSmokeStatus = getGameSessionRpcSmokeStatus;
  window.getSupabaseHardeningStatus = getSupabaseHardeningStatus;
  window.getSupabasePerformanceHealth = getSupabasePerformanceHealth;
  window.getSupabaseKeepaliveStatus = getSupabaseKeepaliveStatus;
  window.runSupabaseKeepalive = runSupabaseKeepalive;
  window.runSupabaseKeepaliveNow = (reason) => runSupabaseKeepalive(reason || 'manual', { force: true });
  window.getSupabaseStructureHealth = getSupabaseStructureHealth;
  window.getSupabasePolicyRiskHealth = getSupabasePolicyRiskHealth;
  window.getSupabaseHardeningReadiness = getSupabaseHardeningReadiness;
  window.createGameInvite = async (payload) => window.RotationSupabaseBridge.createGameInvite(payload);
  window.acceptGameInvite = async (code, inviteeAccountNumber, context) => window.RotationSupabaseBridge.acceptGameInvite(code, inviteeAccountNumber, context);
  window.loadGameSessionByInviteCode = async (code) => window.RotationSupabaseBridge.loadGameSessionByInviteCode(code);
  window.saveGameSessionByInviteCode = async (code, payload) => window.RotationSupabaseBridge.saveGameSessionByInviteCode(code, payload);
  window.loadTttHeadToHead = async (playerA, playerB, options) => window.RotationSupabaseBridge.loadTttHeadToHead(playerA, playerB, options || {});
  window.loadTttHeadToHeadList = async (options) => window.RotationSupabaseBridge.loadTttHeadToHeadList(options || {});
  window.loadGameHeadToHeadList = async (gameType, options) => window.RotationSupabaseBridge.loadGameHeadToHeadList(gameType, options || {});
  window.loadBugReports = async (options) => window.RotationSupabaseBridge.loadBugReports(options || {});
  window.updateBugReportStatus = async (id, status, note) => window.RotationSupabaseBridge.updateBugReportStatus(id, status, note || '');
  window.deleteBugReport = async (id) => window.RotationSupabaseBridge.deleteBugReport(id);
  window.recordRakAppUsage = async (options) => window.RotationSupabaseBridge.recordAppUsage(options || {});
  window.loadRakAppUsage = async (options) => window.RotationSupabaseBridge.loadAppUsage(options || {});
  window.getRakAppUsageStatus = () => window.RotationSupabaseBridge.getAppUsageStatus();
  // v.1.5 (809): destruktivní reset herního progresu už se nevystavuje jako veřejný window helper.

  window.addEventListener('online', () => {
    requestSupabaseQueueWake('online', 350);
    scheduleRealtimeRebind('online', 900);
    void refreshPublicData();
    scheduleSupabaseKeepalive('online', 2200);
    scheduleAppUsage('online', 4200);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    state.syncGuard.queueVisibilityFlushes += 1;
    state.syncGuard.lastQueueVisibilityFlushAt = Date.now();
    requestSupabaseQueueWake('visible', 450);
    scheduleRealtimeRebind('visible', 1200);
    scheduleSupabaseKeepalive('visible', 2600);
    scheduleAppUsage('visible', 4800);
  });

  window.addEventListener('pageshow', () => {
    requestSupabaseQueueWake('pageshow', 650);
    scheduleRealtimeRebind('pageshow', 1450);
    scheduleSupabaseKeepalive('pageshow', 2800);
    scheduleAppUsage('pageshow', 5200);
  });

  window.addEventListener('focus', () => {
    requestSupabaseQueueWake('focus', 856);
    scheduleRealtimeRebind('focus', 1800);
    scheduleSupabaseKeepalive('focus', 3200);
    scheduleAppUsage('focus', 5800);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    setTimeout(init, 0);
  }
})();
