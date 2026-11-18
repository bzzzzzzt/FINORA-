
const CACHE_NAME = "finora-v4";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",

  "./js/app.js",
  "./js/db.js",
  "./js/validation.js",
  "./js/transactions.js",
  "./js/backup.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);

      if (cached) {
        return cached;
      }

      try {
        return await fetch(event.request);
      } catch (error) {
        if (event.request.mode === "navigate") {
          const fallback = await caches.match("./index.html");

          if (fallback) {
            return fallback;
          }
        }

        return new Response("You're offline.", {
          status: 503,
          headers: {
            "Content-Type": "text/plain"
          }
        });
      }
    })()
  );
});
