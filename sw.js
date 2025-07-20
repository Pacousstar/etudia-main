// 🚀 ÉtudIA V4.1 Service Worker - Cache Intelligent
const CACHE_NAME = 'etudia-v4-1-cache';
const CACHE_VERSION = '2025.01.20';
const FULL_CACHE_NAME = `${CACHE_NAME}-${CACHE_VERSION}`;

// 📦 Fichiers à mettre en cache (stratégie intelligente)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/manifest.json',
  '/assets/css/global.css',
  '/assets/js/main.js',
  '/assets/images/logo-etudia.svg'
];

// 🚀 Installation du Service Worker
self.addEventListener('install', event => {
  console.log('🚀 ÉtudIA SW: Installation en cours...');
  
  event.waitUntil(
    caches.open(FULL_CACHE_NAME)
      .then(cache => {
        console.log('📦 ÉtudIA SW: Mise en cache des assets critiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ ÉtudIA SW: Installation réussie !');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ ÉtudIA SW: Erreur installation:', error);
      })
  );
});

// 🔄 Activation et nettoyage des anciens caches
self.addEventListener('activate', event => {
  console.log('🔄 ÉtudIA SW: Activation en cours...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith(CACHE_NAME) && cacheName !== FULL_CACHE_NAME) {
              console.log('🗑️ ÉtudIA SW: Suppression ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ ÉtudIA SW: Activation réussie !');
        return self.clients.claim();
      })
  );
});

// 🌐 Stratégie de récupération (Cache First pour assets, Network First pour API)
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // 🔧 API calls → Network First (données fraîches)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache la réponse API si succès
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(FULL_CACHE_NAME)
              .then(cache => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Fallback vers cache si réseau indisponible
          return caches.match(request);
        })
    );
    return;
  }
  
  // 📦 Assets statiques → Cache First (performance)
  if (STATIC_ASSETS.some(asset => url.pathname === asset) || 
      url.pathname.includes('/assets/')) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('💨 ÉtudIA SW: Servi depuis cache:', url.pathname);
            return cachedResponse;
          }
          
          return fetch(request)
            .then(response => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(FULL_CACHE_NAME)
                  .then(cache => cache.put(request, responseClone));
              }
              return response;
            });
        })
    );
    return;
  }
  
  // 🌍 Pages HTML → Network First avec fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(FULL_CACHE_NAME)
            .then(cache => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback vers page d'accueil si aucune cache
            return caches.match('/index.html');
          });
      })
  );
});

// 🔔 Gestion des notifications push (futur)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    console.log('🔔 ÉtudIA SW: Notification reçue:', data);
    
    const options = {
      body: data.body || 'Nouvelle notification ÉtudIA',
      icon: '/assets/icons/icon-192.png',
      badge: '/assets/icons/badge-72.png',
      tag: 'etudia-notification',
      renotify: true,
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Ouvrir ÉtudIA',
          icon: '/assets/icons/open-24.png'
        },
        {
          action: 'dismiss',
          title: 'Ignorer',
          icon: '/assets/icons/dismiss-24.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'ÉtudIA', options)
    );
  }
});

// 📱 Gestion des clics sur notifications
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🚀 ÉtudIA V4.1 Service Worker chargé et prêt !');
