// ============================================
// SERVICE WORKER - El "corazón" offline de tu PWA
// ============================================
// Guarda los archivos de tu app en caché para que funcione
// sin internet y sea instalable.
// ============================================

const CACHE_NAME = 'macr-pwa-v1';

const ARCHIVOS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './img/logo.png'
];

// INSTALACIÓN: guarda todos los archivos en caché
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Guardando archivos');
        return cache.addAll(ARCHIVOS);
      })
      .then(() => self.skipWaiting())
  );
});

// ACTIVACIÓN: limpia cachés viejos
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: activado');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH: primero busca en caché, si no, va a internet
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
