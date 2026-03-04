// IMPORTANT: Increment this version number whenever you deploy a new version
// This will force the service worker to update and clear old caches
const VERSION = 'v1.0.2';
const CACHE_NAME = `love-finance-${VERSION}`;

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log(`[SW ${VERSION}] Installing...`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log(`[SW ${VERSION}] Caching assets`);
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`[SW ${VERSION}] Activating...`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[SW ${VERSION}] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - Network first, then cache strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        
        // Only cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request);
      })
  );
});

// Listen for messages from the client to check for updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
