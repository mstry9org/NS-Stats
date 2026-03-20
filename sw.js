/* --- Nightscout Stats Service Worker ---
   Version 6 - Offline app shell + clean Nightscout fetches (fixed)
*/

const CACHE_NAME = "ns-stats-shell-v6";  // Updated version

// Files to precache for offline UI
const APP_SHELL = [
  "/",               
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// Install: cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // --- 1. ONLY block YOUR DOMAIN's API calls (not Nightscout) ---
  if (url.origin === location.origin && url.pathname.includes("/api/")) {
    const cleanRequest = new Request(req.url, {
      method: "GET",
      headers: new Headers(), // strips referer/origin
      cache: "no-store",
      redirect: "follow",
      mode: "cors",
      credentials: "omit"
    });

    event.respondWith(
      fetch(cleanRequest).catch(() => {
        return new Response("[]", {
          headers: { "Content-Type": "application/json" }
        });
      })
    );
    return;
  }

  // --- 2. App shell: network-first, fallback to cache ---
  event.respondWith(
    fetch(req)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        return res;
      })
      .catch(() => {
        return caches.match(req).then((cached) => {
          if (cached) return cached;

          if (req.mode === "navigate") {
            return caches.match("/index.html");
          }

          return new Response("Offline", { status: 503 });
        });
      })
  );
});
