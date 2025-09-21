// Service Worker básico para PWA
const CACHE_NAME = 'maestros-fc-v2';

self.addEventListener('install', function(event) {
  console.log('SW: Install');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('SW: Activate');
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Apenas passa as requisições adiante
  event.respondWith(fetch(event.request));
});
