/* Increase CACHE_VERSION whenever a release changes app files or catalogue data. */
const CACHE_VERSION = '2026-10-11.1';
const BASE = new URL(self.registration.scope);
const CACHE_PREFIX = 'pakautohub-' + encodeURIComponent(BASE.pathname) + '-';
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;
const CORE_ASSETS = [
  './', 'index.html', 'style.css', 'pwa.css', 'core.js', 'app.js', 'pwa.js',
  'catalogue.json', 'manifest.webmanifest', 'icons/icon.svg',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png', 'icons/favicon-32.png'
];
const PHOTO_ASSETS = [
  'cars/alto.png', 'cars/city.webp', 'cars/civic-oriel.webp',
  'cars/civic-2010.jpg', 'cars/corolla.png', 'cars/cultus.png',
  'cars/every.png', 'cars/fronx.png', 'cars/passo-2014.jpg',
  'cars/swift.png', 'cars/yaris.png'
];
const absolute = path => new URL(path, BASE).href;
const CORE_URLS = CORE_ASSETS.map(absolute);
const OWN_URLS = new Set([...CORE_ASSETS, ...PHOTO_ASSETS].map(absolute));

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const request = path => new Request(absolute(path), { cache: 'reload', credentials: 'same-origin' });
    try {
      // Required tools/data must all cache successfully before offline mode is ready.
      await cache.addAll(CORE_ASSETS.map(request));
    } catch (error) {
      await caches.delete(CACHE_NAME);
      throw error;
    }
    // A failed photograph must not prevent installation of the catalogue and tools.
    await Promise.allSettled(PHOTO_ASSETS.map(path => cache.add(request(path))));
    // Updated workers wait for the user's Refresh action or for old tabs to close.
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach(client => client.postMessage({ type: 'OFFLINE_READY', version: CACHE_VERSION }));
  })());
});

async function cachedResource(request, cacheKey, event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) event.waitUntil(cache.put(cacheKey, response.clone()).catch(() => {}));
    return response;
  } catch {
    return new Response('This resource is unavailable offline. Open PakAutoHub once with internet.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // External photos, price sources, fonts and other apps keep their normal requests.
  if (url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  const clean = new URL(url.href);
  clean.search = '';
  clean.hash = '';
  if (request.mode === 'navigate' && (clean.href === BASE.href || clean.href === absolute('index.html'))) {
    event.respondWith(cachedResource(request, absolute('index.html'), event));
  } else if (OWN_URLS.has(clean.href)) {
    event.respondWith(cachedResource(request, clean.href, event));
  }
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
  } else if (event.data?.type === 'GET_OFFLINE_STATUS' && event.ports?.[0]) {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      const found = await Promise.all(CORE_URLS.map(url => cache.match(url)));
      event.ports[0].postMessage({ ready: found.every(Boolean), version: CACHE_VERSION });
    })());
  }
});
