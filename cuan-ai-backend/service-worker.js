// public/service-worker.js
// Service Worker untuk Web Push Notifications

const CACHE_NAME = 'cuan-ai-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Cache first strategy
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
      .catch(() => {
        // Offline fallback
        return caches.match('/index.html');
      })
  );
});

// Push Notification Event
self.addEventListener('push', event => {
  let notificationData = {
    title: '🔥 CUAN AI - Produk Trending!',
    body: 'Cek aplikasi untuk detail',
    icon: '🔥',
    badge: '/badge.png',
    requireInteraction: true
  };

  try {
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (e) {
    notificationData.body = event.data?.text() || 'Ada produk baru!';
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon || '/icon-192x192.png',
      badge: notificationData.badge || '/badge-72x72.png',
      tag: notificationData.tag || 'cuan-notification',
      requireInteraction: notificationData.requireInteraction || false,
      data: notificationData,
      actions: [
        {
          action: 'open',
          title: '👀 Lihat Detail'
        },
        {
          action: 'close',
          title: '✖️ Tutup'
        }
      ]
    })
  );
});

// Notification Click Event
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open aplikasi atau tab
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Cek apakah sudah ada window terbuka
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Jika tidak ada, buka window baru
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Notification Close Event
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event.notification.tag);
});

// Background Sync (for offline support)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      fetch('/api/notifications')
        .then(response => response.json())
        .catch(err => console.error('Sync failed:', err))
    );
  }
});
