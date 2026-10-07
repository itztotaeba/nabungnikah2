// Service Worker untuk Nabung Nikah PWA
const CACHE_VERSION = 'v2.0.0'; // Update versi ini saat deploy baru
const CACHE_NAME = `nabung-nikah-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// Assets yang di-cache saat install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log(`[SW ${CACHE_VERSION}] Installing...`);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log(`[SW ${CACHE_VERSION}] Precaching app shell`);
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log(`[SW ${CACHE_VERSION}] Skip waiting`);
        // PENTING: Paksa Service Worker baru langsung aktif
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`[SW ${CACHE_VERSION}] Activating...`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Hapus cache lama yang tidak sesuai versi
          if (
            cacheName !== STATIC_CACHE && 
            cacheName !== RUNTIME_CACHE &&
            cacheName.startsWith('nabung-nikah-') || 
            cacheName.startsWith('static-') || 
            cacheName.startsWith('runtime-')
          ) {
            console.log(`[SW ${CACHE_VERSION}] Deleting old cache:`, cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log(`[SW ${CACHE_VERSION}] Activated`);
      // PENTING: Service Worker baru langsung mengontrol halaman yang terbuka
      return self.clients.claim();
    }).then(() => {
      // Notify semua client bahwa update sudah siap
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION
          });
        });
      });
    })
  );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  
  // Strategy 1: HTML files - Network First (selalu fresh)
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone response untuk cache
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback ke cache jika offline
          return caches.match(event.request).then((response) => {
            return response || caches.match('/');
          });
        })
    );
    return;
  }

  // Strategy 2: Static assets (JS, CSS, images) - Cache First (cepat)
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|ico)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          // Cache response untuk penggunaan berikutnya
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }

  // Strategy 3: API calls - Network First
  if (url.pathname.startsWith('/api/') || url.pathname.includes('supabase')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Offline' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Strategy 4: Default - Stale While Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse;
      });

      // Return cache segera, update di background
      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log(`[SW ${CACHE_VERSION}] Received SKIP_WAITING message`);
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_VERSION') {
    // Reply dengan versi current
    event.ports[0].postMessage({
      type: 'VERSION_INFO',
      version: CACHE_VERSION
    });
  }
});

console.log(`[SW ${CACHE_VERSION}] Service Worker loaded`);
