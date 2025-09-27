const CACHE_NAME = 'maestros-fc-v1.0.2';
const STATIC_CACHE = 'maestros-fc-static-v1.0.2';
const DYNAMIC_CACHE = 'maestros-fc-dynamic-v1.0.2';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  static: ['/manifest.json', '/icon.svg', '/icon-192.png', '/icon-512.png'],
  dynamic: ['/api/', '/supabase/'],
  networkFirst: ['/match', '/ranking', '/finance']
};

// Install event
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('Service Worker installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('Service Worker activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event com estratégias otimizadas
self.addEventListener('fetch', function(event) {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);
  const pathname = url.pathname;

  // Estratégia Cache First para assets estáticos
  if (CACHE_STRATEGIES.static.some(path => pathname.includes(path))) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // Estratégia Network First para dados dinâmicos
  if (CACHE_STRATEGIES.networkFirst.some(path => pathname.includes(path))) {
    event.respondWith(networkFirst(event.request, DYNAMIC_CACHE));
    return;
  }

  // Estratégia padrão (Cache First com fallback para Network)
  event.respondWith(cacheFirst(event.request, DYNAMIC_CACHE));
});

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Network First failed:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline', { status: 503 });
  }
}

console.log('Service Worker: Loaded successfully');
