// Bump CACHE_VERSION on every release that must invalidate cached assets.
// Because this string changes, the sw.js bytes change, so the browser detects
// a new worker, installs it, and the activate handler below purges every old
// cache — preventing stale HTML/JS from surviving a deploy.
const CACHE_VERSION = 'v5-2026-07-11-pink-r-final';
const CACHE_NAME = `reset-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

const urlsToCache = [
  '/',
  '/offline',
  '/styles/globals.css',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Cache addAll error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // NEVER cache API/auth requests — they carry per-user, sensitive, session-
  // bound data. Always go to network; do not store responses.
  if (new URL(event.request.url).pathname.startsWith('/api/')) {
    return;
  }

  // Only handle GET (POST/PUT/DELETE must never be served from cache).
  if (event.request.method !== 'GET') {
    return;
  }

  // For HTML pages, try network first, then cache. Guard against a missing
  // Accept header (previously threw a TypeError and broke offline handling).
  const accept = event.request.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((response) => {
            return response || caches.match('/offline');
          });
        })
    );
    return;
  }

  // For other assets, cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      });
    })
  );
});
