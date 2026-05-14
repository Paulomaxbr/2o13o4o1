const CACHE = 'otakulist-v1';
const ASSETS = [
  '/2o13o4o1/',
  '/2o13o4o1/index.html',
  '/2o13o4o1/manifest.json',
  '/2o13o4o1/icon-192.png',
  '/2o13o4o1/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Deixa requisições do Supabase sempre ir para a rede
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/2o13o4o1/'));
    })
  );
});
