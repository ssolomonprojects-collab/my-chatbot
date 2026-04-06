const CACHE_NAME = "edubot-v1";
const urlsToCache = [
  "/my-chatbot/",
  "/my-chatbot/index.html",
  "/my-chatbot/style.css",
  "/my-chatbot/script.js",
  "/my-chatbot/manifest.json",
  "/my-chatbot/icon-192.png",
  "/my-chatbot/icon-512.png"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) return response;
      return fetch(event.request).catch(function() {
        return caches.match("/my-chatbot/index.html");
      });
    })
  );
});
