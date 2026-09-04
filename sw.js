// RaK development PWA service worker – update-safe build.
const CACHE_VERSION = 'v1.2-dev-20260904-17';
const SW_APP_VERSION = 'development 2026-09-04.17';
const STATIC_CACHE = `rotace-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rotace-runtime-${CACHE_VERSION}`;
const CORE = ['./', './index.html', './manifest.webmanifest', './assets/app-icons/icon-180.png', './assets/app-icons/icon-192.png', './assets/app-icons/icon-512.png'];
const STATIC_EXT = /\.(?:js|css|png|jpg|jpeg|webp|svg|ico|json|webmanifest)$/i;

function cacheable(response) {
  return !!response && response.ok && response.status !== 206;
}

async function put(cacheName, request, response) {
  if (!cacheable(response)) return;
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  } catch (_) {}
}

async function cached(request) {
  try {
    const hit = await caches.match(request, { ignoreSearch: false });
    if (hit) return hit;
    return await caches.match(request, { ignoreSearch: true });
  } catch (_) {
    return null;
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await Promise.all(CORE.map(async url => {
      try {
        const bust = new URL(url, self.location.href);
        bust.searchParams.set('__rak_build', CACHE_VERSION);
        const response = await fetch(new Request(bust.href, { cache: 'reload' }));
        if (cacheable(response)) await cache.put(url, response.clone());
      } catch (_) {}
    }));
    // Záměrně NEvoláme skipWaiting automaticky. Nová verze zůstane čekat,
    // aby RaK zobrazilo stejné tlačítko „Aktualizovat“ jako produkční main.
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => /^rotace-(?:static|runtime)-/.test(k) && k !== STATIC_CACHE && k !== RUNTIME_CACHE).map(k => caches.delete(k)));
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (_) {}
    }
    await self.clients.claim();
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    clients.forEach(client => {
      try { client.postMessage({ type: 'sw-activated', version: CACHE_VERSION, appVersion: SW_APP_VERSION }); } catch (_) {}
    });
  })());
});

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (data.type === 'GET_VERSION' && event.source) {
    event.source.postMessage({ type: 'sw-version', version: CACHE_VERSION, appVersion: SW_APP_VERSION });
    return;
  }
  if (data.type === 'GET_CACHE_STATUS' && event.source) {
    event.source.postMessage({ type: 'sw-cache-status', cacheVersion: CACHE_VERSION, appVersion: SW_APP_VERSION, checkedAt: Date.now() });
  }
});

async function networkFirst(request, fallback) {
  try {
    const response = await fetch(new Request(request, { cache: 'no-store' }));
    put(RUNTIME_CACHE, request, response);
    return response;
  } catch (_) {
    return (await cached(request)) || fallback;
  }
}

async function navigationResponse(request, event) {
  try {
    if (event && event.preloadResponse) {
      const preload = await event.preloadResponse;
      if (cacheable(preload)) {
        put(RUNTIME_CACHE, request, preload);
        return preload;
      }
    }
  } catch (_) {}
  const fallback = (await cached('./index.html')) || (await cached('./')) || Response.error();
  return networkFirst(request, fallback);
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (!request || request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationResponse(request, event));
    return;
  }

  if (STATIC_EXT.test(url.pathname)) {
    event.respondWith(networkFirst(request, (async () => (await cached(request)) || Response.error())()));
    return;
  }
});
