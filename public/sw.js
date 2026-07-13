const CACHE_NAME = 'nutrilens-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/onboarding',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/screenshot-mobile.png',
  '/icons/screenshot-desktop.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  // Only intercept requests for the same origin
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          // Cache newly visited local assets dynamically
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        }).catch(() => {
          // Offline fallback for page navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
    );
  }
});
