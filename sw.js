const CACHE_VERSION = 'v1-313';
const STATIC_CACHE = `rotace-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rotace-runtime-${CACHE_VERSION}`;
const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './core.js',
  './ui.js',
  './dashboard.js',
  './rotace.js',
  './stats.js',
  './soustruhy.js',
  './brusy.js',
  './payroll.js',
  './qr.js',
  './export.js',
  './app-init.js',
  './data.js',
  './styles.css',
  './styles-base.css',
  './styles-layout.css',
  './styles-theme.css',
  './styles-responsive.css',
  './styles-modal.css',
  './supabase-config.js',
  './supabase-bridge.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

const RUNTIME_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.json', '.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    try {
      await cache.addAll(APP_SHELL);
    } catch (err) {
      // Some cross-origin assets may fail to precache; ignore and keep the app shell.
      console.warn('[sw] precache partial fail', err);
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => {
      if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) return caches.delete(key);
      return Promise.resolve(false);
    }));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const client of clients) {
      try {
        client.postMessage({ type: 'sw-activated', reason: 'activate', version: CACHE_VERSION });
      } catch (err) {}
    }
  })());
});

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request, { ignoreSearch: false });
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

async function networkFirst(request, fallbackTo) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request, { ignoreSearch: false });
    if (cached) return cached;
    if (fallbackTo) {
      const fallback = await cache.match(fallbackTo, { ignoreSearch: false });
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
        const response = await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        if (response && response.ok) cache.put('./index.html', response.clone()).catch(() => {});
        return response;
      } catch (err) {
        const cache = await caches.open(STATIC_CACHE);
        return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
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
      const cache = await caches.open(RUNTIME_CACHE);
      return cache.match(request, { ignoreSearch: false }) || Response.error();
    }));
  }
});
