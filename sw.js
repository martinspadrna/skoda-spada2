const CACHE_VERSION = 'v1.1-606';
const SW_APP_VERSION = 'v.1.1 (606)';
const STATIC_CACHE = `rotace-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rotace-runtime-${CACHE_VERSION}`;
const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './core.js',
  './lifecycle.js',
  './ui.js',
  './games-arcade.js',
  './dashboard.js',
  './rotace.js',
  './stats.js',
  './soustruhy.js',
  './brusy.js',
  './payroll.js',
  './qr.js',
  './export.js',
  './app-init.js',
  './changelog.js',
  './CHANGELOG.md',
  './data.js',
  './supabase-config.js',
  './supabase-bridge.js',
  './styles.css',
  './styles-base.css',
  './styles-layout.css',
  './styles-theme.css',
  './styles-responsive.css',
  './styles-modal.css',
  './styles-inline-legacy.css',
  './styles-calc-panels.css',
  './styles-games.css',
  './styles-overrides.css',
  './assets/dashboard-icons/calendar.png',
  './assets/dashboard-icons/dovolena.png',
  './assets/dashboard-icons/eportal.png',
  './assets/dashboard-icons/hourglass.png',
  './assets/dashboard-icons/jidelna.png',
  './assets/dashboard-icons/jidelnilistek.png',
  './assets/dashboard-icons/kantyna.png',
  './assets/dashboard-icons/vyplata.png',
  './assets/nav-icons/games-gray.png',
  './assets/nav-icons/games-green.png',
  './assets/nav-icons/home-gray.png',
  './assets/nav-icons/home-green.png',
  './assets/nav-icons/kalkulacky-gray.png',
  './assets/nav-icons/kalkulacky-green.png',
  './assets/nav-icons/rotace-gray.png',
  './assets/nav-icons/rotace-green.png',
  './assets/nav-icons/rozpisy-gray.png',
  './assets/nav-icons/rozpisy-green.png',
  './assets/nav-icons/statistiky-gray.png',
  './assets/nav-icons/statistiky-green.png',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-32.png',
  './icon-180.png',
  './icon-16.png',
  './icon-1024.png'
];

const APP_SHELL_URLS = Array.from(new Set(APP_SHELL));
const RUNTIME_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.json', '.webmanifest'];
const MAX_RUNTIME_CACHE_ENTRIES = 96;
const SW_CACHE_META_URL = './__rak-sw-cache-status.json';

const CACHE_LOOKUP_MODE = 'normalized-cache-candidates';
const PRECACHE_FETCH_MODE = 'cache-busted-clean-keys';
const RUNTIME_STORE_MODE = 'canonical-clean-runtime-keys';
const SAME_ORIGIN_FALLBACK_MODE = 'normalized-same-origin-fallback';

function getScopeRelativeCacheKeys(requestOrUrl) {
  const candidates = [];
  const seen = new Set();
  const push = (value) => {
    if (!value) return;
    const key = typeof value === 'string' ? value : (value && value.url ? value.url : '');
    if (!key || seen.has(key)) return;
    seen.add(key);
    candidates.push(value);
  };

  try {
    if (requestOrUrl instanceof Request) push(requestOrUrl);
  } catch (err) {}

  try {
    const rawUrl = requestOrUrl && requestOrUrl.url ? requestOrUrl.url : String(requestOrUrl || '');
    const url = new URL(rawUrl || './', self.location.href);
    if (url.origin !== self.location.origin) return candidates;

    push(url.href);

    const noSearch = new URL(url.href);
    noSearch.search = '';
    noSearch.hash = '';
    push(noSearch.href);

    const scopeUrl = new URL(self.registration && self.registration.scope ? self.registration.scope : './', self.location.href);
    let scopePath = scopeUrl.pathname || '/';
    if (!scopePath.endsWith('/')) scopePath = scopePath.slice(0, scopePath.lastIndexOf('/') + 1) || '/';

    let relativePath = url.pathname || '/';
    if (relativePath.startsWith(scopePath)) relativePath = relativePath.slice(scopePath.length);
    if (!relativePath || relativePath === '/') relativePath = 'index.html';
    relativePath = relativePath.replace(/^\/+/, '');

    if (relativePath) {
      push('./' + relativePath);
      push(relativePath);
      if (relativePath === 'index.html') push('./');
    }
  } catch (err) {}

  return candidates;
}

async function matchCacheCandidates(cache, requestOrUrl, opts = {}) {
  const matchOptions = { ignoreSearch: opts.ignoreSearch !== false };
  const candidates = getScopeRelativeCacheKeys(requestOrUrl);
  for (const candidate of candidates) {
    try {
      const match = await cache.match(candidate, matchOptions);
      if (match) return match;
    } catch (err) {}
  }
  return null;
}

function getPrecacheFetchUrl(url) {
  try {
    const nextUrl = new URL(url || './', self.location.href);
    nextUrl.searchParams.set('__rak_precache', CACHE_VERSION);
    return nextUrl.href;
  } catch (err) {
    return url;
  }
}

function getStableCachePutKey(requestOrUrl, fallbackKey) {
  try {
    const rawUrl = requestOrUrl && requestOrUrl.url ? requestOrUrl.url : String(requestOrUrl || fallbackKey || './');
    const url = new URL(rawUrl || fallbackKey || './', self.location.href);
    if (url.origin !== self.location.origin) return requestOrUrl || fallbackKey || url.href;

    const scopeUrl = new URL(self.registration && self.registration.scope ? self.registration.scope : './', self.location.href);
    let scopePath = scopeUrl.pathname || '/';
    if (!scopePath.endsWith('/')) scopePath = scopePath.slice(0, scopePath.lastIndexOf('/') + 1) || '/';

    let relativePath = url.pathname || '/';
    if (relativePath.startsWith(scopePath)) relativePath = relativePath.slice(scopePath.length);
    relativePath = relativePath.replace(/^\/+/, '');
    if (!relativePath || relativePath === '/') return './index.html';
    return './' + relativePath;
  } catch (err) {
    return fallbackKey || requestOrUrl;
  }
}

async function fetchAndStoreAppShellUrl(cache, url) {
  const fetchUrl = getPrecacheFetchUrl(url);
  const request = new Request(fetchUrl, { cache: 'reload' });
  const response = await fetch(request);
  if (!response || !response.ok) return false;
  // Ukládáme pod čistý app-shell klíč bez cache-busting query, aby offline lookup našel stabilní cestu.
  await cache.put(url, response.clone());
  return true;
}

const OFFLINE_FALLBACK_HTML = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#0b0f0c"><title>Rotace a kalkulačky</title><style>html,body{margin:0;min-height:100%;background:#0b0f0c;color:#eef6ee;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}body{display:grid;place-items:center;padding:24px}main{max-width:440px;width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.35)}h1{font-size:1.35rem;line-height:1.2;margin:0 0 12px}p{margin:0;color:rgba(238,246,238,.78);line-height:1.5}small{display:block;margin-top:14px;color:rgba(238,246,238,.58)}</style></head><body><main><h1>Jsi offline</h1><p>Appka je dostupná v omezeném režimu. Jakmile se připojení vrátí, synchronizuje se poslední stav automaticky.</p><small>Rotace a kalkulačky</small></main></body></html>`;

async function writeCacheStatusMeta(cache, summary) {
  try {
    const payload = Object.assign({
      type: 'rak-sw-cache-status',
      cacheVersion: CACHE_VERSION,
      appVersion: SW_APP_VERSION,
      staticCache: STATIC_CACHE,
      runtimeCache: RUNTIME_CACHE,
      appShellCount: APP_SHELL_URLS.length,
      runtimeMaxEntries: MAX_RUNTIME_CACHE_ENTRIES,
      cacheLookupMode: CACHE_LOOKUP_MODE,
      precacheFetchMode: PRECACHE_FETCH_MODE,
      runtimeStoreMode: RUNTIME_STORE_MODE,
      sameOriginFallbackMode: SAME_ORIGIN_FALLBACK_MODE,
      savedAt: Date.now()
    }, summary || {});
    await cache.put(SW_CACHE_META_URL, new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    }));
    return payload;
  } catch (err) {
    return null;
  }
}

async function precacheAppShellSafe() {
  const cache = await caches.open(STATIC_CACHE);
  const failedUrls = [];
  let successCount = 0;
  await Promise.all(APP_SHELL_URLS.map(async (url) => {
    try {
      const stored = await fetchAndStoreAppShellUrl(cache, url);
      if (stored) {
        successCount += 1;
      } else {
        failedUrls.push(url);
      }
    } catch (err) {
      // Jedna chybějící položka nesmí shodit celou instalaci service workeru.
      failedUrls.push(url);
      console.warn('[sw] precache item skipped', url, err);
    }
  }));
  const summary = {
    precacheSuccessCount: successCount,
    precacheFailedCount: failedUrls.length,
    precacheFailedUrls: failedUrls.slice(0, 12),
    precacheCompletedAt: Date.now()
  };
  await writeCacheStatusMeta(cache, summary);
  return summary;
}

async function getSwCacheStatus() {
  try {
    const staticCache = await caches.open(STATIC_CACHE);
    const runtimeCache = await caches.open(RUNTIME_CACHE);
    const staticKeys = await staticCache.keys();
    const runtimeKeys = await runtimeCache.keys();
    let meta = null;
    try {
      const metaResponse = await staticCache.match(SW_CACHE_META_URL, { ignoreSearch: true });
      if (metaResponse) meta = await metaResponse.json();
    } catch (err) {}
    let navigationPreloadEnabled = false;
    try {
      if ('navigationPreload' in self.registration && self.registration.navigationPreload && typeof self.registration.navigationPreload.getState === 'function') {
        const preloadState = await self.registration.navigationPreload.getState();
        navigationPreloadEnabled = !!(preloadState && preloadState.enabled);
      }
    } catch (err) {}
    let clientsCount = 0;
    try {
      const clientsList = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      clientsCount = Array.isArray(clientsList) ? clientsList.length : 0;
    } catch (err) {}
    return Object.assign({}, meta || {}, {
      type: 'sw-cache-status',
      cacheVersion: CACHE_VERSION,
      appVersion: SW_APP_VERSION,
      staticCache: STATIC_CACHE,
      runtimeCache: RUNTIME_CACHE,
      appShellCount: APP_SHELL_URLS.length,
      staticCacheEntries: staticKeys.length,
      runtimeCacheEntries: runtimeKeys.length,
      runtimeMaxEntries: MAX_RUNTIME_CACHE_ENTRIES,
      cacheLookupMode: CACHE_LOOKUP_MODE,
      precacheFetchMode: PRECACHE_FETCH_MODE,
      runtimeStoreMode: RUNTIME_STORE_MODE,
      sameOriginFallbackMode: SAME_ORIGIN_FALLBACK_MODE,
      navigationPreloadEnabled,
      clientsCount,
      checkedAt: Date.now()
    });
  } catch (err) {
    return {
      type: 'sw-cache-status',
      cacheVersion: CACHE_VERSION,
      appVersion: SW_APP_VERSION,
      error: err && err.message ? err.message : String(err || 'cache-status-error'),
      checkedAt: Date.now()
    };
  }
}

async function trimCacheEntries(cacheName, maxEntries) {
  if (!maxEntries || maxEntries < 1) return;
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length <= maxEntries) return;
    const deleteCount = keys.length - maxEntries;
    await Promise.all(keys.slice(0, deleteCount).map((key) => cache.delete(key)));
  } catch (err) {}
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShellSafe());
});

self.addEventListener('message', (event) => {
  const data = event && event.data ? event.data : null;
  if (!data) return;
  if (data.type === 'GET_VERSION') {
    try {
      if (event.source && event.source.postMessage) {
        event.source.postMessage({ type: 'sw-version', version: CACHE_VERSION, appVersion: SW_APP_VERSION, appShellCount: APP_SHELL_URLS.length, runtimeMaxEntries: MAX_RUNTIME_CACHE_ENTRIES, cacheLookupMode: CACHE_LOOKUP_MODE, precacheFetchMode: PRECACHE_FETCH_MODE, runtimeStoreMode: RUNTIME_STORE_MODE, sameOriginFallbackMode: SAME_ORIGIN_FALLBACK_MODE });
      }
    } catch (err) {}
    return;
  }
  if (data.type === 'GET_CACHE_STATUS') {
    event.waitUntil((async () => {
      try {
        const status = await getSwCacheStatus();
        if (event.source && event.source.postMessage) event.source.postMessage(status);
      } catch (err) {}
    })());
    return;
  }
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => {
      if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) return caches.delete(key);
      return Promise.resolve(false);
    }));
    if ('navigationPreload' in self.registration) {
      try {
        await self.registration.navigationPreload.enable();
      } catch (err) {}
    }
    await self.clients.claim();
    const status = await getSwCacheStatus();
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const client of clients) {
      try {
        client.postMessage(Object.assign({}, status || {}, { type: 'sw-activated', reason: 'activate', version: CACHE_VERSION, appVersion: SW_APP_VERSION }));
      } catch (err) {}
    }
  })());
});

async function matchAppCaches(request, opts = {}) {
  try {
    const runtimeCache = await caches.open(RUNTIME_CACHE);
    const runtimeMatch = await matchCacheCandidates(runtimeCache, request, opts);
    if (runtimeMatch) return runtimeMatch;
  } catch (err) {}
  try {
    const staticCache = await caches.open(STATIC_CACHE);
    const staticMatch = await matchCacheCandidates(staticCache, request, opts);
    if (staticMatch) return staticMatch;
  } catch (err) {}
  return null;
}

async function cacheFirst(request) {
  const cached = await matchAppCaches(request, { ignoreSearch: true });
  if (cached) return cached;
  const cache = await caches.open(RUNTIME_CACHE);
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(getStableCachePutKey(request), response.clone()).then(() => trimCacheEntries(RUNTIME_CACHE, MAX_RUNTIME_CACHE_ENTRIES)).catch(() => {});
  }
  return response;
}

async function networkFirst(request, fallbackTo) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(getStableCachePutKey(request), response.clone()).then(() => trimCacheEntries(RUNTIME_CACHE, MAX_RUNTIME_CACHE_ENTRIES)).catch(() => {});
    }
    return response;
  } catch (err) {
    const cached = await matchAppCaches(request, { ignoreSearch: true });
    if (cached) return cached;
    if (fallbackTo) {
      const fallback = await matchAppCaches(fallbackTo, { ignoreSearch: true });
      if (fallback) return fallback;
    }
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isNavigation = request.mode === 'navigate' || request.destination === 'document';
  const hasStaticExt = RUNTIME_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));

  if (isNavigation) {
    event.respondWith((async () => {
      try {
        const preloadResponse = await event.preloadResponse;
        const response = preloadResponse || await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        if (response && response.ok) cache.put(getStableCachePutKey(request, './index.html'), response.clone()).then(() => trimCacheEntries(RUNTIME_CACHE, MAX_RUNTIME_CACHE_ENTRIES)).catch(() => {});
        return response;
      } catch (err) {
        return (await matchAppCaches('./index.html', { ignoreSearch: true })) || (await matchAppCaches('./', { ignoreSearch: true })) || new Response(OFFLINE_FALLBACK_HTML, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    })());
    return;
  }

  if (sameOrigin && hasStaticExt) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (sameOrigin) {
    event.respondWith(networkFirst(request).catch(async () => {
      const cached = await matchAppCaches(request, { ignoreSearch: true });
      return cached || Response.error();
    }));
  }
});
