const CACHE = 'otakulist-v3';
const STATIC = [
  '/2o13o4o1/icon-192.png',
  '/2o13o4o1/icon-512.png',
  '/2o13o4o1/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
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
  const url = new URL(e.request.url);

  // Supabase sempre vai para a rede
  if (url.hostname.includes('supabase.co')) return;

  // HTML sempre busca na rede — nunca cacheia o index.html
  if (e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/2o13o4o1/'))
    );
    return;
  }

  // Ícones e manifest: cache first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      });
    })
  );
});
