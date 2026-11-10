/* SNAKE168 service worker — offline fallback ONLY.
 *
 * Caching rules (deliberately minimal):
 *  - Precaches just the static offline page and its icon.
 *  - Handles same-origin page navigations only: network first, and only if the network fails it shows
 *    /offline.html. Navigation responses are never stored.
 *  - Everything else (API calls to the backend, wallet/account/auth/transaction data, WebSocket, game
 *    URLs, images, Next.js chunks) is NOT intercepted — the browser handles it normally, uncached by us.
 */
const CACHE = "snake168-offline-v1";
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/pwa/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: "reload" })))),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("snake168-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // offline page assets: serve from the precache
  if (url.origin === self.location.origin && PRECACHE.includes(url.pathname)) {
    event.respondWith(caches.match(url.pathname).then((hit) => hit || fetch(req)));
    return;
  }

  // only same-origin GET page navigations; nothing else is touched
  if (req.mode !== "navigate" || req.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req).catch(() => caches.match(OFFLINE_URL).then((hit) => hit || Response.error())),
  );
});
