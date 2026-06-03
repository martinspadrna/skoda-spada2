// RaK 1.2 (1.117) – lifecycle stabilizace aplikace.
(function setupLifecycleHelpers() {
  if (window.__rotaceLifecycleHelpersInstalled) return;
  window.__rotaceLifecycleHelpersInstalled = true;

  const store = window.__rotaceLifecycleStore || {
    listeners: [],
    intervals: [],
    timeouts: [],
    subscriptions: []
  };
  window.__rotaceLifecycleStore = store;

  const safeCall = (fn) => {
    try { fn(); } catch (err) {}
  };

  const register = (bucket, disposer) => {
    if (typeof disposer !== 'function') return disposer;
    bucket.push(disposer);
    return disposer;
  };

  window.registerListener = function registerListener(target, type, handler, options) {
    if (!target || typeof target.addEventListener !== 'function' || typeof handler !== 'function') return null;
    target.addEventListener(type, handler, options);
    return register(store.listeners, () => {
      safeCall(() => target.removeEventListener(type, handler, options));
    });
  };

  window.registerInterval = function registerInterval(fn, delay) {
    if (typeof fn !== 'function') return null;
    const id = window.setInterval(fn, delay);
    return register(store.intervals, () => {
      safeCall(() => window.clearInterval(id));
    });
  };

  window.registerTimeout = function registerTimeout(fn, delay) {
    if (typeof fn !== 'function') return null;
    const id = window.setTimeout(fn, delay);
    return register(store.timeouts, () => {
      safeCall(() => window.clearTimeout(id));
    });
  };

  window.registerSubscription = function registerSubscription(disposer) {
    if (typeof disposer !== 'function') return null;
    return register(store.subscriptions, () => safeCall(disposer));
  };

  window.cleanupListeners = function cleanupListeners() {
    while (store.listeners.length) safeCall(store.listeners.pop());
  };

  window.cleanupIntervals = function cleanupIntervals() {
    while (store.intervals.length) safeCall(store.intervals.pop());
  };

  window.cleanupTimeouts = function cleanupTimeouts() {
    while (store.timeouts.length) safeCall(store.timeouts.pop());
  };

  window.cleanupSubscriptions = function cleanupSubscriptions() {
    while (store.subscriptions.length) safeCall(store.subscriptions.pop());
  };

  window.cleanupAllLifecycle = function cleanupAllLifecycle() {
    cleanupSubscriptions();
    cleanupTimeouts();
    cleanupIntervals();
    cleanupListeners();
  };

  window.bindGlobalEscapeOnce = function bindGlobalEscapeOnce(flagName, closeFn) {
    if (typeof closeFn !== 'function') return false;
    const flag = String(flagName || '').trim();
    if (!flag) return false;
    const host = document.body || document.documentElement;
    if (host && host.dataset && host.dataset[flag] === '1') return false;
    if (host && host.dataset) host.dataset[flag] = '1';
    registerListener(document, 'keydown', (event) => {
      if (event && event.key === 'Escape') closeFn();
    });
    return true;
  };
})();
