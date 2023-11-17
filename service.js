const CACHE_NAME = 'cache-v2';
const LOAD_FLAG = 'c';
const CACHED = false;

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
        if (cachedRes) {
            return cachedRes;
        }
        if (!event.request.url.includes(LOAD_FLAG)) {
            const requestFlagged = new Request(
                event.request.url + `?${LOAD_FLAG}=1`,
                event.request
            );
            return fetch(requestFlagged).then((res) => {
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(requestFlagged, res);
                    if (res.status === 200) {
                        CACHED = true;
                    }
                    if (CACHED) {
                        window.onload(() => {
                            window.setTimeout(() => {
                                const loader = document.querySelector('.preloader');
                                loader.classList.add('hide');
                            }, 1000);
                        })
                    }
                });
                return res.clone();
            });
        }
        return fetch(event.request);
    }));
});
