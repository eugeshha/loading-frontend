import { clientsClaim, skipWaiting } from "workbox-core";
import { precacheAndRoute } from "workbox-precaching";
import { NetworkFirst } from "workbox-strategies";

skipWaiting();
clientsClaim();

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/api")) {
    const strategy = new NetworkFirst();
    event.respondWith(strategy.handle({ request: event.request }));
  }
});

// WorkboxPlugin.InjectManifest подставит сюда список файлов
// eslint-disable-next-line no-underscore-dangle
precacheAndRoute(self.__WB_MANIFEST || self.__precacheManifest || []);



