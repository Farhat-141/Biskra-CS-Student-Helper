const CACHE = "biskra-cs-v4";

const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/icon.png",
  "/icon-192.png",
  "/icon-512.png"
];

// Install - cache all assets
self.addEventListener("install", event => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => {
        console.log("[SW] Caching all assets");
        return cache.addAll(ASSETS);
      })
      .then(() => {
        console.log("[SW] All assets cached successfully");
        return self.skipWaiting();
      })
      .catch(err => {
        console.error("[SW] Cache failed:", err);
      })
  );
});

// Activate - clean old caches
self.addEventListener("activate", event => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.map(key => {
            if (key !== CACHE) {
              console.log("[SW] Deleting old cache:", key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] Service worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch - serve from cache, fallback to network
self.addEventListener("fetch", event => {
  const { request } = event;
  
  // For navigation requests (page loads)
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("/index.html")
        .then(response => {
          if (response) {
            console.log("[SW] Serving /index.html from cache");
            return response;
          }
          console.log("[SW] Fetching /index.html from network");
          return fetch(request);
        })
        .catch(err => {
          console.error("[SW] Failed to serve navigation:", err);
          // Return cached index.html even on error
          return caches.match("/index.html");
        })
    );
    return;
  }

  // For all other requests (CSS, JS, images, etc.)
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          console.log("[SW] Serving from cache:", request.url);
          return response;
        }
        
        console.log("[SW] Fetching from network:", request.url);
        return fetch(request)
          .then(networkResponse => {
            // Cache successful network responses
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(err => {
            console.error("[SW] Fetch failed:", request.url, err);
            // Return undefined if not in cache and network fails
            return undefined;
          });
      })
  );
});