// RaK 1.5.16 – update-safe PWA service worker.
const CACHE_VERSION = 'v1.5.16';
const SW_APP_VERSION = '1.5';
const STATIC_CACHE = `rotace-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rotace-runtime-${CACHE_VERSION}`;

// Precache držíme záměrně malý. Velké login obrázky (přes 6 MB dohromady)
// se uloží až při prvním skutečném použití, ne při každé aktualizaci aplikace.
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/app-icons/icon-180.png?v=1.5.16',
  './assets/app-icons/icon-32.png?v=1.5.16',
  './assets/app-icons/icon-192.png?v=1.5.16',
  './assets/app-icons/icon-512.png?v=1.5.16'
];
const STATIC_EXT = /\.(?:js|css|png|jpg|jpeg|webp|svg|ico|json|webmanifest)$/i;
const IMAGE_EXT = /\.(?:png|jpg|jpeg|webp|svg|ico)$/i;
let approvedUpdateClientId = '';

function cacheable(response) {
  const cacheControl = response && response.headers ? String(response.headers.get('cache-control') || '') : '';
  return !!response && response.ok && response.status !== 206 && !/\bno-store\b|\bprivate\b/i.test(cacheControl);
}

async function put(cacheName, request, response) {
  if (!cacheable(response)) return;
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  } catch (_) {}
}

async function exactCached(request) {
  try { return await caches.match(request, { ignoreSearch: false }); }
  catch (_) { return null; }
}

async function imageCached(request) {
  try {
    return (await caches.match(request, { ignoreSearch: false }))
      || (await caches.match(request, { ignoreSearch: true }));
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
    // Nová verze zůstane waiting, dokud uživatel nepotvrdí tlačítko Aktualizovat.
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(k => /^rotace-(?:static|runtime)-/.test(k) && k !== STATIC_CACHE && k !== RUNTIME_CACHE)
      .map(k => caches.delete(k)));
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (_) {}
    }
    await self.clients.claim();
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    const navigations = [];
    clients.forEach(client => {
      try { client.postMessage({ type: 'sw-activated', version: CACHE_VERSION, appVersion: SW_APP_VERSION }); } catch (_) {}
      if (approvedUpdateClientId && client.id === approvedUpdateClientId && typeof client.navigate === 'function') {
        navigations.push(client.navigate(client.url).catch(() => null));
      }
    });
    if (navigations.length) await Promise.all(navigations);
  })());
});

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') {
    approvedUpdateClientId = String(event.source && event.source.id || '');
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
    // no-cache dovolí HTTP cache použít ETag/304, ale vždy ověří čerstvost.
    const response = await fetch(new Request(request, { cache: 'no-cache' }));
    void put(RUNTIME_CACHE, request, response);
    return response;
  } catch (_) {
    return (await exactCached(request)) || fallback;
  }
}

async function cacheFirstImage(request) {
  const hit = await imageCached(request);
  if (hit) return hit;
  try {
    const response = await fetch(request);
    void put(RUNTIME_CACHE, request, response);
    return response;
  } catch (_) {
    return Response.error();
  }
}

async function staleWhileRevalidateVersioned(request, event) {
  const hit = await exactCached(request);
  const refresh = (async () => {
    try {
      const response = await fetch(request);
      await put(RUNTIME_CACHE, request, response);
      return response;
    } catch (_) {
      return null;
    }
  })();
  if (hit) {
    if (event) event.waitUntil(refresh);
    return hit;
  }
  return (await refresh) || Response.error();
}

async function navigationResponse(request, event) {
  try {
    if (event && event.preloadResponse) {
      const preload = await event.preloadResponse;
      if (cacheable(preload)) {
        void put(RUNTIME_CACHE, request, preload);
        return preload;
      }
    }
  } catch (_) {}
  const fallback = (await exactCached('./index.html')) || (await exactCached('./')) || Response.error();
  return networkFirst(request, fallback);
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (!request || request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Citlivé API odpovědi nikdy neobsluhujeme z PWA cache.
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationResponse(request, event));
    return;
  }

  if (IMAGE_EXT.test(url.pathname)) {
    event.respondWith(cacheFirstImage(request));
    return;
  }

  if (STATIC_EXT.test(url.pathname)) {
    // app.js je boot loader celé aplikace. Historický index stále používá starší
    // query parametr, takže ho nikdy nevracíme stylem stale-while-revalidate;
    // při každém startu nejdřív ověříme čerstvou verzi na síti a teprve offline
    // použijeme cache. Tím odpadá jednorázové spuštění starého loaderu po update.
    if (/\/app\.js$/i.test(url.pathname)) {
      event.respondWith(networkFirst(request, (async () => (await exactCached(request)) || Response.error())()));
      return;
    }

    // Ostatní dynamické moduly app.js mají build query ?v=...; ty můžeme po prvním načtení
    // vracet okamžitě z přesné cache a čerstvost ověřit na pozadí.
    if (url.searchParams.has('v')) {
      event.respondWith(staleWhileRevalidateVersioned(request, event));
    } else {
      // Neversionované CSS/boot soubory raději pokaždé revalidujeme, aby update
      // nikdy nevrátil starou podobu aplikace jen kvůli cache-first strategii.
      event.respondWith(networkFirst(request, (async () => (await exactCached(request)) || Response.error())()));
    }
  }
});