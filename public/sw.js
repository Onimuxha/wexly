// public/sw.js - Clean Service Worker with Persistent Notifications

const CACHE_NAME = "wexly-v1";
const DB_NAME = "NotificationsDB";
const DB_VERSION = 1;
const STORE_NAME = "scheduled_notifications";

const urlsToCache = [
  "/",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

// ============================================
// INDEXEDDB FOR PERSISTENT STORAGE
// ============================================

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

async function saveNotification(notification) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(notification);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getAllNotifications() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteNotification(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// INSTALLATION & CACHING
// ============================================

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
  startNotificationChecker();
});

// ============================================
// FETCH HANDLING
// ============================================

self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;
  if (event.request.url.includes('/api/') || event.request.url.includes('/_next/data/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone).catch(() => {});
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return new Response('Offline', {
            status: 503,
            headers: new Headers({ 'Content-Type': 'text/plain' }),
          });
        });
      })
  );
});

// ============================================
// NOTIFICATION CHECKER (runs every 30 seconds)
// ============================================

let checkerInterval = null;

function startNotificationChecker() {
  if (checkerInterval) clearInterval(checkerInterval);
  checkNotifications();
  checkerInterval = setInterval(checkNotifications, 30000);
}

async function checkNotifications() {
  try {
    const notifications = await getAllNotifications();
    const now = Date.now();
    
    for (const notif of notifications) {
      const triggerTime = new Date(notif.scheduledTime).getTime();
      if (triggerTime <= now) {
        await showNotification(notif.title, notif.body, notif.id);
        await deleteNotification(notif.id);
      }
    }
  } catch (error) {
    console.error('Notification check error:', error);
  }
}

// ============================================
// MESSAGE HANDLING
// ============================================

self.addEventListener('message', async (event) => {
  if (event.data?.type === 'SCHEDULE_NOTIFICATION') {
    const { id, title, body, scheduledTime } = event.data;
    await scheduleNotification(id, title, body, scheduledTime);
  } else if (event.data?.type === 'CANCEL_NOTIFICATION') {
    await deleteNotification(event.data.id);
  } else if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function scheduleNotification(id, title, body, scheduledTime) {
  const triggerTime = new Date(scheduledTime).getTime();
  const now = Date.now();
  const delay = triggerTime - now;

  if (delay <= 0) {
    await showNotification(title, body, id);
    return;
  }

  await saveNotification({
    id,
    title,
    body,
    scheduledTime,
    createdAt: new Date().toISOString()
  });
}

async function showNotification(title, body, tag) {
  try {
    await self.registration.showNotification(title, {
      body: body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [300, 200, 300, 200, 300],
      tag: tag || 'activity-reminder',
      requireInteraction: true,
      silent: false,
      renotify: true,
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: { url: '/' }
    });
  } catch (error) {
    console.error('Show notification error:', error);
  }
}

// ============================================
// NOTIFICATION INTERACTION
// ============================================

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (let client of clientList) {
          if (client.url === '/' || client.url.includes(self.registration.scope)) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
  );
});

self.addEventListener('notificationclose', (event) => {
  // Notification closed
});

startNotificationChecker();