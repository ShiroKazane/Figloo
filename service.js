const CACHE_NAME = 'cache-v2';

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(cacheNames.map((cache) => {
                if (cache !== CACHE_NAME) {
                    caches.delete(cache);
                }
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const log = console.log;
    console.log = function() {};
    event.respondWith(fetch(event.request).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
        });
        return res;
    }).then(data => console.log(data)).catch(() => caches.match(event.request).then((res) => res)));
    console.log = log;
});
