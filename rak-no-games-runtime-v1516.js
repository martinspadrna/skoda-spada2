// RaK v1.5.16 – po odstranění Her nesmí vzhled/profil dál zapisovat do game_* tabulek.
(function installRakNoGamesRuntimeV1516() {
  'use strict';

  const SKIP = Object.freeze({ ok: true, skipped: true, reason: 'games-removed' });
  let attempts = 0;
  let timer = null;

  function noRemoteUiSave() {
    return Promise.resolve(SKIP);
  }

  function noRemoteUiLoad() {
    return Promise.resolve(null);
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

  function wrapBridgeLoader() {
    const original = window.ensureRakSupabaseBridgeLoaded;
    if (typeof original !== 'function' || original.__rakGamesRemovedWrapped) return false;
    const wrapped = function () {
      return Promise.resolve(original.apply(this, arguments)).then((bridge) => {
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
    const loaderReady = wrapBridgeLoader()
      || (typeof window.ensureRakSupabaseBridgeLoaded === 'function' && !!window.ensureRakSupabaseBridgeLoaded.__rakGamesRemovedWrapped);
    patchBridge();
    if (loaderReady && attempts >= 10 && timer) {
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
