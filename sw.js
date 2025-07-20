// 🚀 ÉtudIA V4.1 Service Worker - Version Simplifiée
const CACHE_NAME = 'etudia-v4-simple';
const CACHE_VERSION = '2025.01.20';

// 📦 Fichiers essentiels seulement
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html'
];

// 🚀 Installation
self.addEventListener('install', event => {
  console.log('🚀 ÉtudIA SW: Installation simple');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 🔄 Activation
self.addEventListener('activate', event => {
  console.log('🔄 ÉtudIA SW: Activation');
  event.waitUntil(self.clients.claim());
});

// 🌐 Fetch simple
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

console.log('✅ ÉtudIA Service Worker Simplifié - Prêt !');
