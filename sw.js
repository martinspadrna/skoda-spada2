// RaK 1.5 production PWA service worker – v1.5.97 warm-start cache + confirmed-update navigation.
const CACHE_VERSION = 'v1.5.97';
const SW_APP_VERSION = '1.5.97';
const STATIC_CACHE = `rotace-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rotace-runtime-${CACHE_VERSION}`;
const PREWARM_CACHE = `rotace-prewarm-${CACHE_VERSION}`;

const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/app-icons/icon-180.png?v=1.5.1',
  './assets/app-icons/icon-32.png?v=1.5.1',
  './assets/app-icons/icon-192.png?v=1.5.1',
  './assets/app-icons/icon-512.png?v=1.5.1',
  './assets/rak-login-crab.png'
];

const WARM_START = [
  './app.js?v=1.5.1',
  './data.js',
  './module-readiness.js',
  './rak-namespace.js',
  './rak-audit-baseline.js',
  './rak-runtime-health.js',
  './rak-dom-security-hardening.js',
  './styles.css',
  './styles-inline-legacy.css',
  './styles-base.css',
  './styles-layout.css',
  './styles-theme.css',
  './styles-responsive.css',
  './styles-modal.css',
  './styles-rotation-summary-compact.css',
  './styles-calc-panels.css',
  './styles-overrides-legacy-early.css',
  './styles-shift-report.css',
  './styles-admin-reports.css',
  './styles-interaction-guard.css',
  './styles-admin-rotation-fold.css',
  './styles-rotation-month.css',
  './styles-low-end-performance.css',
  './styles-dashboard-sync.css',
  './styles-admin-service.css',
  './styles-settings-runtime.css',
  './styles-calculators-mid.css',
  './styles-admin-rotation-editor.css',
  './styles-bottom-nav-runtime.css',
  './styles-overrides-legacy-late.css',
  './styles-dashboard-fit.css',
  './styles-admin-polish.css',
  './styles-menu-polish.css',
  './styles-stats-polish.css',
  './styles-viewport-polish.css',
  './styles-theme-polish.css',
  './styles-release-polish.css',
  './styles-dashboard-polish.css',
  './styles-daymods.css',
  './styles-theme-propagation.css',
  './styles-rotation-tasks.css',
  './assets/nav-icons/home-gray.png',
  './assets/nav-icons/home-green.png',
  './assets/nav-icons/rotace-gray.png',
  './assets/nav-icons/rotace-green.png',
  './assets/nav-icons/kalkulacky-gray.png',
  './assets/nav-icons/kalkulacky-green.png',
  './supabase-config.js?v=1.5.97',
  './rak-user-profile.js?v=1.5.97',
  './rak-auth-gate.js?v=1.5.97',
  './rak-account-access.js?v=1.5.97',
  './rak-login-splash.js?v=1.5.97',
  './rak-login-fix.js?v=1.5.97',
  './rak-login-life.js?v=1.5.97',
  './core.js?v=1.5.97',
  './lifecycle.js?v=1.5.97',
  './app-runtime-guards.js?v=1.5.97',
  './qr.js?v=1.5.97',
  './payroll.js?v=1.5.97',
  './dashboard.js?v=1.5.97',
  './appearance-theme.js?v=1.5.97',
  './ui.js?v=1.5.97',
  './app-navigation.js?v=1.5.97',
  './app-bottom-nav.js?v=1.5.97',
  './app-actions.js?v=1.5.97',
  './app-pwa-connectivity.js?v=1.5.97',
  './app-home-boot.js?v=1.5.97',
  './rak-runtime-stability.js?v=1.5.97',
  './rak-mobile-layout-guard.js?v=1.5.97',
  './rak-feature-routing.js?v=1.5.97'
];

const STATIC_EXT = /\.(?:js|css|png|jpg|jpeg|webp|svg|ico|json|webmanifest)$/i;
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

async function cached(request, options) {
  const opts = options && typeof options === 'object' ? options : {};
  try {
    const hit = await caches.match(request, { ignoreSearch: false });
    if (hit || opts.exactOnly) return hit || null;
    return await caches.match(request, { ignoreSearch: true });
  } catch (_) {
    return null;
  }
}

function prewarmKey(url) {
  return new Request(new URL('./__rak_prewarm__/' + encodeURIComponent(String(url || '')), self.location.href).href);
}

async function fetchBuildAsset(url) {
  const fetchUrl = new URL(url, self.location.href);
  if (!fetchUrl.searchParams.has('v')) fetchUrl.searchParams.set('__rak_build', CACHE_VERSION);
  return fetch(new Request(fetchUrl.href, { cache: 'reload' }));
}

async function installCoreAndPrewarm() {
  const staticCache = await caches.open(STATIC_CACHE);
  const prewarmCache = await caches.open(PREWARM_CACHE);
  await Promise.allSettled(CORE.map(async url => {
    try {
      const response = await fetchBuildAsset(url);
      if (cacheable(response)) await staticCache.put(url, response.clone());
    } catch (_) {}
  }));
  await Promise.allSettled(WARM_START.map(async url => {
    try {
      const response = await fetchBuildAsset(url);
      if (cacheable(response)) await prewarmCache.put(prewarmKey(url), response.clone());
    } catch (_) {}
  }));
}

async function promotePrewarm() {
  const staticCache = await caches.open(STATIC_CACHE);
  const prewarmCache = await caches.open(PREWARM_CACHE);
  await Promise.allSettled(WARM_START.map(async url => {
    let response = null;
    try { response = await prewarmCache.match(prewarmKey(url)); } catch (_) {}
    if (!response) {
      try { response = await fetchBuildAsset(url); } catch (_) { response = null; }
    }
    if (cacheable(response)) await staticCache.put(url, response.clone());
  }));
}

async function staticResponse(request) {
  const hit = await cached(request, { exactOnly: true });
  if (hit) return hit;
  try {
    const response = await fetch(new Request(request, { cache: 'no-cache' }));
    await put(STATIC_CACHE, request, response);
    return response;
  } catch (_) {
    return (await cached(request)) || Response.error();
  }
}

self.addEventListener('install', event => {
  event.waitUntil(installCoreAndPrewarm());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await promotePrewarm();
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => (
      /^rotace-(?:static|runtime|prewarm)-/.test(k)
      && k !== STATIC_CACHE
      && k !== RUNTIME_CACHE
    )).map(k => caches.delete(k)));
    try { await caches.delete(PREWARM_CACHE); } catch (_) {}
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (_) {}
    }
    await self.clients.claim();
    const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    const navigations = [];
    clients.forEach(client => {
      try { client.postMessage({ type: 'sw-activated', version: CACHE_VERSION, appVersion: SW_APP_VERSION }); } catch (_) {}
      if (approvedUpdateClientId && client.id === approvedUpdateClientId && typeof client.navigate === 'function') {
        try {
          const nextUrl = new URL(client.url);
          nextUrl.searchParams.set('_rak_update', CACHE_VERSION + '-' + Date.now().toString(36));
          nextUrl.searchParams.set('_rak_update_reason', 'sw-activate');
          navigations.push(client.navigate(nextUrl.href).catch(() => null));
        } catch (_) {
          navigations.push(client.navigate(client.url).catch(() => null));
        }
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
    event.source.postMessage({
      type: 'sw-cache-status',
      cacheVersion: CACHE_VERSION,
      appVersion: SW_APP_VERSION,
      strategy: 'navigation-network-first;build-static-cache-first;isolated-prewarm',
      warmStartCount: WARM_START.length,
      checkedAt: Date.now()
    });
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
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationResponse(request, event));
    return;
  }

  if (STATIC_EXT.test(url.pathname)) {
    event.respondWith(staticResponse(request));
    return;
  }
});