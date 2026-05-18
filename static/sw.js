const CACHE_NAME = 'finanzas-v1';
const ASSETS = [
    '/',
    '/static/index.html',
    '/static/manifest.json'
];

// Instalar el Service Worker y guardar los archivos en Caché
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS))
    );
});

// Interceptar peticiones para que funcione rápido o sin conexión
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
});