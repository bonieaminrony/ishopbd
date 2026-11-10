const CACHE_NAME = 'ishopbd-cache-v11';
const STATIC_ASSETS = [
  '/manifest.json',
  '/logo.png',
  '/favicon.ico'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] Cache addAll warning:', err);
      });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip API requests and external third-party origins
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
    return;
  }

  // Network-First for Navigation (HTML / Pages)
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('.php') || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If valid 200 response, clone and update cache
          if (response && response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Fallback to cache if network is completely offline
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const rootCached = await caches.match('/');
          if (rootCached) {
            return rootCached;
          }
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline - i SHOP BD</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;text-align:center;padding:50px 20px;"><h2>ইন্টারনেট সংযোগ নেই</h2><p>অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।</p><button onclick="location.reload()" style="padding:10px 20px;font-size:16px;cursor:pointer;border-radius:8px;background:#2563eb;color:#fff;border:none;margin-top:15px;">পুনরায় চেষ্টা করুন</button></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Cache-First for static assets (images, fonts, scripts)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});
