// SecureChain PWA Service Worker - Offline Support & Caching

const CACHE_NAME = 'securechain-v1.2';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/style.css',
  '/script.js',
  '/js/api.js',
  '/js/charts.js',
  '/js/cursor-pen.js',
  '/js/login.js',
  '/js/mobile.js',
  '/js/toasts.js',
  '/manifest.json'
];

// Install event - cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first then cache
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    // API calls: network-first, cache with 5min stale
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            return new Response('Offline - API unavailable', { status: 503 });
          });
        })
    );
  } else {
    // Static assets: cache-first
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});

// Push notifications (future)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New threat alert!',
    icon: '/icon-192.png',
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: { date: new Date().toISOString() }
  };
  
  event.waitUntil(
    self.registration.showNotification('SecureChain Alert', options)
  );
});

// Background sync for uploads (future)
self.addEventListener('sync', event => {
  if (event.tag === 'upload-file') {
    event.waitUntil(syncPendingUploads());
  }
});

async function syncPendingUploads() {
  // Implement pending upload sync
  console.log('Background sync: uploading pending files');
}

