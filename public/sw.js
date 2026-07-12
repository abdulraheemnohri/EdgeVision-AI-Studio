// Service Worker for EdgeVision AI Studio PWA
// This provides offline functionality and caching for the application

const CACHE_NAME = 'edgevision-v1';
const ASSET_CACHE_NAME = 'edgevision-assets-v1';
const MODEL_CACHE_NAME = 'edgevision-models-v1';
const WASM_CACHE_NAME = 'edgevision-wasm-v1';

// Files to cache for offline use
const OFFLINE_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Asset patterns to cache
const ASSET_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2$/,
  /\.svg$/,
  /\.png$/,
];

// WASM files for LiteRT.js
const WASM_PATTERNS = [
  /litert_.*\.js$/,
  /litert_.*\.wasm$/,
  /\.wasm$/,
];

// Model files
const MODEL_PATTERNS = [
  /\.tflite$/,
  /\.json$/,
];

self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Caching offline files...');
      return cache.addAll(OFFLINE_FILES);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('⚡ Service Worker: Activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== ASSET_CACHE_NAME && 
              cacheName !== MODEL_CACHE_NAME &&
              cacheName !== WASM_CACHE_NAME) {
            console.log(`🗑️ Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Cache WASM files aggressively
  if (WASM_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.open(WASM_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            console.log('💾 Serving WASM from cache:', url.pathname);
            return response;
          }
          
          return fetch(event.request).then((response) => {
            if (response.status === 200) {
              console.log('📥 Caching WASM file:', url.pathname);
              cache.put(event.request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }
  
  // Cache model files
  if (MODEL_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.open(MODEL_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            console.log('💾 Serving model from cache:', url.pathname);
            return response;
          }
          
          return fetch(event.request).then((response) => {
            if (response.status === 200) {
              console.log('📥 Caching model file:', url.pathname);
              cache.put(event.request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }
  
  // Cache assets
  if (ASSET_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.open(ASSET_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            console.log('💾 Serving asset from cache:', url.pathname);
            return response;
          }
          
          return fetch(event.request).then((response) => {
            if (response.status === 200) {
              console.log('📥 Caching asset:', url.pathname);
              cache.put(event.request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }
  
  // Serve offline files
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log('💾 Serving from cache:', url.pathname);
        return response;
      }
      
      // Try to serve index.html for navigation requests
      if (url.origin === self.location.origin) {
        return caches.match('/index.html').then((indexResponse) => {
          if (indexResponse) {
            console.log('💾 Serving index.html for offline navigation');
            return indexResponse;
          }
        });
      }
      
      // Fall back to network
      return fetch(event.request);
    })
  );
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-models') {
    console.log('🔄 Syncing models in background...');
    // Implement background sync logic here
  }
});

// Push notification support
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  if (data) {
    console.log('📬 Push notification received:', data);
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192x192.png',
      data: data.url ? { url: data.url } : {}
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const data = notification.data;
  
  if (data.url) {
    clients.openWindow(data.url);
  }
  
  notification.close();
});

console.log('🎯 EdgeVision AI Studio Service Worker loaded');