const CACHE_NAME = 'literary-pub-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/unlocked.html',
  '/manifest.json',
  '/icon-pwa.png',
  '/icon-cover.png'
  // Add other assets here only if they exist
];

// Install and pre-cache assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(url =>
          fetch(url)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Request for ${url} failed with status ${response.status}`);
              }
              return cache.put(url, response);
            })
            .catch(err => {
              console.warn(`[Service Worker] Skipping ${url} — ${err.message}`);
              // Don't fail the install if one resource is missing
              return Promise.resolve();
            })
        )
      );
    })
  );
});

// Serve cached content, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Optional: Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (!cacheWhitelist.includes(key)) {
            console.log(`[Service Worker] Deleting old cache: ${key}`);
            return caches.delete(key);
          }
        })
      )
    )
  );
});
