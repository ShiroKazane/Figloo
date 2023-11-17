const CACHE_NAME = 'cache-v2';

self.addEventListener('install', (event) => {
    console.log('Service worker: Installed.');
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache);
    }));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service worker: Activated.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(cacheNames.map((cache) => {
                if (cache !== CACHE_NAME) {
                    console.log('Service worker: Deleting old caches.');
                    caches.delete(cache);
                }
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    console.log(`Service worker: Fetching: ${event.request.url}`);
    event
        .respondWith(fetch(event.request))
        .then((res) => {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, resClone);
            });
            return res;
        })
        .catch(() => caches.match(event.request).then((res) => res));
});
