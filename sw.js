const CACHE_NAME = 'app-akuntansi-cache-v17';
const assetsToCache = [
    './index.html',
    './manifest.json',
    './assets/css/style.css',
    './assets/icons/icon-192.png',
    './assets/js/app.js',
    './assets/js/firebase-init.js',
    './assets/js/router.js',
    './assets/js/views/home.js',
    './assets/js/views/login.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(assetsToCache);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    // DIPERBAIKI: Menggunakan clients.claim() agar Service Worker langsung aktif mengontrol halaman
    clients.claim();
});

self.addEventListener('fetch', event => {
    // Hanya tangani request lokal untuk menghindari error CORS CDN
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
});