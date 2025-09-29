const CACHE_NAME = 'nexus-play-v1';
const STATIC_CACHE = 'nexus-static-v1';
const DYNAMIC_CACHE = 'nexus-dynamic-v1';

// Assets para cache estático
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Rotas que devem ser cached
const CACHE_ROUTES = [
  '/',
  '/home',
  '/match',
  '/finance',
  '/ranking',
  '/perfil'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache de assets estáticos
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache de rotas principais
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(CACHE_ROUTES);
      })
    ]).then(() => {
      console.log('SW: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Assumir controle de todas as abas
      self.clients.claim()
    ]).then(() => {
      console.log('SW: Activation complete');
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Estratégia para diferentes tipos de requisições
  if (request.method === 'GET') {
    // Páginas estáticas - stale-while-revalidate
    if (CACHE_ROUTES.some(route => url.pathname.startsWith(route))) {
      event.respondWith(handleStaticRequest(request));
    }
    // Assets estáticos - cache first
    else if (url.pathname.startsWith('/assets/') || 
             url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
      event.respondWith(handleAssetRequest(request));
    }
    // API - network first
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(handleApiRequest(request));
    }
    // Outras requisições - network first
    else {
      event.respondWith(handleNetworkFirst(request));
    }
  }
  // POST/PUT/DELETE - sempre network
  else {
    event.respondWith(handleMutationRequest(request));
  }
});

// Estratégia: stale-while-revalidate para páginas
async function handleStaticRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  // Retornar cache imediatamente se disponível
  if (cached) {
    // Atualizar cache em background
    fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {}); // Ignorar erros de atualização
    
    return cached;
  }
  
  // Se não há cache, buscar da rede
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('SW: Network error for', request.url);
    return new Response('Offline', { status: 503 });
  }
}

// Estratégia: cache first para assets
async function handleAssetRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Estratégia: network first para API
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Tentar cache como fallback
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    return new Response('API unavailable offline', { status: 503 });
  }
}

// Estratégia: network first para outras requisições
async function handleNetworkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    return new Response('Content not available offline', { status: 503 });
  }
}

// Estratégia: sempre network para mutações
async function handleMutationRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Para mutações offline, adicionar à fila
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      await addToOfflineQueue(request);
      return new Response('Request queued for offline sync', { status: 202 });
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Adicionar à fila offline
async function addToOfflineQueue(request) {
  try {
    const queueData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.clone().text(),
      timestamp: Date.now()
    };
    
    // Armazenar no IndexedDB (implementação simplificada)
    const db = await openOfflineDB();
    const transaction = db.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');
    await store.add(queueData);
    
    console.log('SW: Request queued for offline sync');
  } catch (error) {
    console.error('SW: Error queuing request:', error);
  }
}

// Abrir IndexedDB para fila offline
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('nexus_offline_queue', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offlineQueue')) {
        db.createObjectStore('offlineQueue', { keyPath: 'timestamp' });
      }
    };
  });
}

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('SW: Background sync triggered');
    event.waitUntil(processOfflineQueue());
  }
});

// Processar fila offline
async function processOfflineQueue() {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');
    const requests = await store.getAll();
    
    for (const requestData of requests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });
        
        if (response.ok) {
          await store.delete(requestData.timestamp);
          console.log('SW: Offline request synced successfully');
        }
      } catch (error) {
        console.error('SW: Error syncing offline request:', error);
      }
    }
  } catch (error) {
    console.error('SW: Error processing offline queue:', error);
  }
}

// Push notifications (se implementado)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: data.tag,
        data: data.data
      })
    );
  }
});

// Click em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});