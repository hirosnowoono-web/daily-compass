const CACHE_NAME = "daily-compass-v4";
const FALLBACK_PAGE = "./index.html";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(FALLBACK_PAGE, { cache: "reload" });
      if (response.ok) await cache.put(FALLBACK_PAGE, response);
    } catch {}
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("daily-compass-") && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request, { cache: "no-store" });
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(FALLBACK_PAGE, response.clone());
      }
      return response;
    } catch {
      return (await caches.match(FALLBACK_PAGE)) || Response.error();
    }
  })());
});
