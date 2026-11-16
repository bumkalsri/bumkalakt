const CACHE_NAME = 'akuntansi-pwa-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/js/app.js',
  '/assets/js/firebase-config.js'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch dari Cache / Network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});