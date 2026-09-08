// RaK v1.5.16 – po odstranění Her nesmí vzhled/profil ani realtime dál používat game_* data.
(function installRakNoGamesRuntimeV1516() {
  'use strict';

  const SKIP = Object.freeze({ ok: true, skipped: true, reason: 'games-removed' });
  const REMOVED_GAME_REALTIME_TABLES = new Set([
    'game_accounts',
    'game_invites',
    'game_sessions',
    'game_stats',
    'game_ui_settings',
    'gomoku_wins'
  ]);
  let attempts = 0;
  let timer = null;

  window.__rakRemovedGameRealtimeSkips = Number(window.__rakRemovedGameRealtimeSkips || 0) || 0;

  function noRemoteUiSave() {
    return Promise.resolve(SKIP);
  }

  function noRemoteUiLoad() {
    return Promise.resolve(null);
  }

  function patchRealtimeChannel(channel) {
    if (!channel || channel.__rakNoGamesRealtimeWrapped || typeof channel.on !== 'function') return channel;
    const originalOn = channel.on;
    const wrappedOn = function (type, filter) {
      const table = String(filter && filter.table || '').trim();
      if (String(type || '') === 'postgres_changes' && REMOVED_GAME_REALTIME_TABLES.has(table)) {
        window.__rakRemovedGameRealtimeSkips = (Number(window.__rakRemovedGameRealtimeSkips || 0) || 0) + 1;
        return this;
      }
      return originalOn.apply(this, arguments);
    };
    wrappedOn.__rakNoGamesRealtimeWrapped = true;
    wrappedOn.__rakOriginal = originalOn;
    try {
      channel.on = wrappedOn;
      channel.__rakNoGamesRealtimeWrapped = true;
    } catch (_) {}
    return channel;
  }

  function patchSupabaseClient(client) {
    if (!client || client.__rakNoGamesClientWrapped || typeof client.channel !== 'function') return client;
    const originalChannel = client.channel;
    const wrappedChannel = function () {
      return patchRealtimeChannel(originalChannel.apply(this, arguments));
    };
    wrappedChannel.__rakNoGamesRealtimeWrapped = true;
    wrappedChannel.__rakOriginal = originalChannel;
    try {
      client.channel = wrappedChannel;
      client.__rakNoGamesClientWrapped = true;
    } catch (_) {}
    return client;
  }

  function patchSupabaseFactory() {
    const sdk = window.supabase;
    if (!sdk || typeof sdk.createClient !== 'function') return false;
    if (sdk.createClient.__rakNoGamesRealtimeWrapped) return true;
    const originalCreateClient = sdk.createClient;
    const wrappedCreateClient = function () {
      return patchSupabaseClient(originalCreateClient.apply(this, arguments));
    };
    wrappedCreateClient.__rakNoGamesRealtimeWrapped = true;
    wrappedCreateClient.__rakOriginal = originalCreateClient;
    try {
      sdk.createClient = wrappedCreateClient;
      return sdk.createClient === wrappedCreateClient;
    } catch (_) {
      return false;
    }
  }

  function patchBridge(bridge) {
    const target = bridge || window.RotationSupabaseBridge;
    if (!target || target.__rakGamesRemovedRuntime) return false;
    try {
      target.saveGameAccountUiSettings = noRemoteUiSave;
      target.loadGameAccountUiSettings = noRemoteUiLoad;
      target.__rakGamesRemovedRuntime = true;
      return true;
    } catch (_) {
      return false;
    }
  }

  function ensureSupabaseDependency() {
    if (window.supabase && typeof window.supabase.createClient === 'function') return Promise.resolve(window.supabase);
    if (typeof window.ensureRakExternalDependency !== 'function') return Promise.resolve(null);
    return Promise.resolve(window.ensureRakExternalDependency('supabase')).catch(() => null);
  }

  function wrapBridgeLoader() {
    const original = window.ensureRakSupabaseBridgeLoaded;
    if (typeof original !== 'function' || original.__rakGamesRemovedWrapped) return false;
    const wrapped = function () {
      const context = this;
      const args = arguments;
      return ensureSupabaseDependency().then(() => {
        patchSupabaseFactory();
        return original.apply(context, args);
      }).then((bridge) => {
        patchBridge(bridge);
        return bridge;
      });
    };
    wrapped.__rakGamesRemovedWrapped = true;
    wrapped.__rakOriginal = original;
    window.ensureRakSupabaseBridgeLoaded = wrapped;
    return true;
  }

  function apply() {
    attempts += 1;
    const supabaseReady = patchSupabaseFactory();
    const loaderReady = wrapBridgeLoader()
      || (typeof window.ensureRakSupabaseBridgeLoaded === 'function' && !!window.ensureRakSupabaseBridgeLoaded.__rakGamesRemovedWrapped);
    patchBridge();
    if (supabaseReady && loaderReady && attempts >= 10 && timer) {
      clearInterval(timer);
      timer = null;
    }
    if (attempts >= 300 && timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  apply();
  timer = setInterval(apply, 100);
  window.addEventListener('focus', apply);
  window.addEventListener('pageshow', apply);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') apply();
  });
})();
