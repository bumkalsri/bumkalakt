const CACHE_NAME = 'akuntansi-pwa-v2';
const ASSETS = [
    './',
    './index.html',
    './assets/css/style.css',
    './assets/js/app.js',
    './assets/js/firebase-config.js',
    './assets/js/routers.js',
    './views/login.html',
    './views/dashboard.html',
    './views/coa.html',
    './views/jurnal.html',
    './views/buku-besar.html',
    './views/neraca-lajur.html',
    './views/laba-rugi.html',
    './views/neraca.html',
    './views/pengaturan.html'
];

// Install Service Worker & Cache Assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate Service Worker & Clean Old Caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch dari Cache, fallback ke Network
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).catch(() => {
                // Opsional: Anda bisa menampilkan halaman offline kustom di sini jika jaringan terputus
            });
        })
    );
});