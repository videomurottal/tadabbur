self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('tadabbur-cache').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './quran_uthmani_quran_com.json',
        './terjemah_wbw_77429.json',
        './indonesian_complex_v1.0.xml',
        './quran.xml',
        './id.jalalayn.xml',
        './madina.woff2',
        './manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  const requestPath = new URL(event.request.url).pathname;

  // Cache-first untuk navigasi
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cachedResponse => {
        return fetch('./index.html').then(networkResponse => {
          caches.open('tadabbur-cache').then(cache => {
            cache.put('./index.html', networkResponse.clone());
          });
          // Notify clients
          self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
          });
          return networkResponse;
        }).catch(() => cachedResponse);
      })
    );
    return;
  }

  const dataFiles = [
    '/quran_uthmani_quran_com.json',
    '/terjemah_wbw_77429.json',
    '/indonesian_complex_v1.0.xml',
    '/quran.xml',
    '/id.jalalayn.xml'
  ];

  if (dataFiles.includes(requestPath)) {
    // Cache-first untuk data files
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return fetch(event.request).then(networkResponse => {
          caches.open('tadabbur-cache').then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        }).catch(() => cachedResponse);
      })
    );
    return;
  }

  // Default: cache-first
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).then(networkResponse => {
        caches.open('tadabbur-cache').then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => new Response("Konten tidak tersedia offline.", {
        status: 503,
        statusText: "Offline"
      }));
    })
  );
});
