// Best Canteen Service Worker — High Reliability (No 404 on Refresh)
const CACHE_NAME = 'best-canteen-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. NEVER intercept Next.js development assets, hot-reloads, API calls, or auth handlers
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('identitytoolkit') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // 2. Navigation requests (Page refresh or direct URL typing)
  // MUST pass through directly to network to prevent 404 errors on page refresh
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Only if completely offline, try cached page
        return caches.match(event.request).then((res) => res || caches.match('/'));
      })
    );
    return;
  }

  // 3. Static public assets (images, icons)
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  }
});
