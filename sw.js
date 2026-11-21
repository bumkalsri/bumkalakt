// File: sw.js
const CACHE_NAME = 'app-akuntansi-cache-v26';

const assetsToCache = [
    './',
    './index.html',
    './manifest.json',
    './assets/css/style.css',
    './assets/icons/logo.png',
    './assets/icons/wallpaper.png',
    './assets/icons/icon.png',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/js/app.js',
    './assets/js/firebase-init.js',
    './assets/js/router.js',
    './assets/js/views/home.js',
    './assets/js/views/login.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            await Promise.allSettled(
                assetsToCache.map(url => cache.add(url))
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    const isNavigation =
        event.request.mode === 'navigate' ||
        url.pathname.endsWith('/') ||
        url.pathname.endsWith('/index.html');

    if (isNavigation) {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.ok) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    const cachedIndex = await caches.match('./index.html');
                    return cachedIndex || caches.match(event.request);
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then(networkResponse => {
                if (
                    networkResponse &&
                    networkResponse.status === 200 &&
                    networkResponse.type === 'basic'
                ) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            });
        })
    );
});