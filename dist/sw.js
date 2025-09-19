const CACHE_NAME = 'maestros-fc-v1.3.0';
const urlsToCache = [
  '/appmaestrosfc/',
  '/appmaestrosfc/index.html',
  '/appmaestrosfc/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching app shell');
        // Cache each URL individually to handle failures gracefully
        const cachePromises = urlsToCache.map(url => 
          cache.add(url).catch(error => {
            console.warn(`⚠️ Service Worker: Failed to cache ${url}`, error);
            return null; // Continue with other URLs
          })
        );
        
        return Promise.allSettled(cachePromises).then(() => {
          console.log('✅ Service Worker: Cache setup completed');
        });
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Skip DevTools and source map requests
  if (event.request.url.includes('chrome-extension:') || 
      event.request.url.includes('sourcemap') ||
      event.request.url.includes('devtools') ||
      event.request.url.match(/:1$/) ||
      event.request.url.includes('/src/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('📦 Service Worker: Serving from cache', event.request.url);
          return response;
        }

        // Otherwise fetch from network
        console.log('🌐 Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('❌ Service Worker: Fetch failed', error);
            // Return offline page if available
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync offline data when connection is restored
      syncOfflineData()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do App Maestros FC',
    icon: '/appmaestrosfc/icons/icon-192.png',
    badge: '/appmaestrosfc/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Detalhes',
        icon: '/appmaestrosfc/icons/icon-192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/appmaestrosfc/icons/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('App Maestros FC', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 Service Worker: Skipping waiting...');
    self.skipWaiting();
  }
});

// Helper function to sync offline data
async function syncOfflineData() {
  try {
    console.log('🔄 Service Worker: Syncing offline data...');
    
    // Get offline data from IndexedDB or localStorage
    const offlineData = await getOfflineData();
    
    if (offlineData && offlineData.length > 0) {
      // Send data to server
      for (const item of offlineData) {
        try {
          await fetch('/api/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
          });
          
          // Remove from offline storage after successful sync
          await removeOfflineData(item.id);
        } catch (error) {
          console.error('❌ Service Worker: Sync failed for item', item.id, error);
        }
      }
      
      console.log('✅ Service Worker: Offline data synced successfully');
    }
  } catch (error) {
    console.error('❌ Service Worker: Sync error', error);
  }
}

// Helper function to get offline data
async function getOfflineData() {
  // This would typically use IndexedDB
  // For now, return empty array
  return [];
}

// Helper function to remove offline data
async function removeOfflineData(id) {
  // This would typically use IndexedDB
  console.log('🗑️ Service Worker: Removing offline data', id);
}

// Check for updates every 30 minutes
setInterval(() => {
  console.log('🔄 Service Worker: Checking for updates...');
  self.registration.update();
}, 30 * 60 * 1000);

console.log('🚀 Service Worker: Loaded successfully');
