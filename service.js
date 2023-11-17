const CACHE_NAME = 'cache-v2';
const LOAD_FLAG = 'c';

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
    event.respondWith(caches.match(event.request).then((cachedRes) => {
        // if (cachedRes) {
        //     return cachedRes;
        // }
        const flagged = !event.request.url.includes(`${LOAD_FLAG}=1`);
        const requestFlagged = flagged ? new Request(`${event.request.url}?${LOAD_FLAG}=1`, event.request) : event.request;
        console.log(requestFlagged);
        return fetch(requestFlagged).then((res) => {
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(requestFlagged, res);
                if (res.status === 200 && flagged) {
                    clients.matchAll().then((clients) => {
                        clients.forEach((client) => {
                            client.postMessage({ action: 'hide' });
                        });
                    });
                }
                return res.clone();
            });
        });
    }));
});