// Service worker mínimo: sólo hace la web instalable. No guarda nada en caché (pedidos siempre en vivo).
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
