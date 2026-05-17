const CACHE_VERSION = 'v1.1-514';
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

const RUNTIME_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.json', '.webmanifest'];

const OFFLINE_FALLBACK_HTML = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#0b0f0c"><title>Rotace a kalkulačky</title><style>html,body{margin:0;min-height:100%;background:#0b0f0c;color:#eef6ee;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}body{display:grid;place-items:center;padding:24px}main{max-width:440px;width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.35)}h1{font-size:1.35rem;line-height:1.2;margin:0 0 12px}p{margin:0;color:rgba(238,246,238,.78);line-height:1.5}small{display:block;margin-top:14px;color:rgba(238,246,238,.58)}</style></head><body><main><h1>Jsi offline</h1><p>Appka je dostupná v omezeném režimu. Jakmile se připojení vrátí, synchronizuje se poslední stav automaticky.</p><small>Rotace a kalkulačky</small></main></body></html>`;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    try {
      await cache.addAll(APP_SHELL);
    } catch (err) {
      // Some cross-origin assets may fail to precache; ignore and keep the app shell.
      console.warn('[sw] precache partial fail', err);
    }
  })());
});

self.addEventListener('message', (event) => {
  const data = event && event.data ? event.data : null;
  if (!data) return;
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
        return (await cache.match('./index.html')) || (await cache.match('./')) || new Response(OFFLINE_FALLBACK_HTML, {
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
      const cache = await caches.open(RUNTIME_CACHE);
      return cache.match(request, { ignoreSearch: false }) || Response.error();
    }));
  }
});
