const CACHE = 'suralnor-v3';
const ARCHIVOS = [
  '/suralnor-ejecucion/',
  '/suralnor-ejecucion/formulario_ejecucion.html',
  '/suralnor-ejecucion/manifest.json',
  '/suralnor-ejecucion/icon-192.png',
  '/suralnor-ejecucion/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ARCHIVOS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Solo cachear recursos del mismo origen
  if (!e.request.url.startsWith(self.location.origin)) return;
  
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
