// Rokomari Ponno Hari - Service Worker
// Automatically clears stale caches so users always see the latest website updates instantly.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Deleting stale cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Pass all fetch requests directly to network to prevent stale bundle lock-in
self.addEventListener('fetch', (event) => {
  return;
});
