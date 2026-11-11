const CACHE_NAME = 'portafolio-v5';
const ARCHIVOS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './img/logo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Fuerza la instalación inmediata
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARCHIVOS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim()) // Toma el control de inmediato
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {

        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
