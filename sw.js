// Офлайн-кэш приложения. При изменении файлов увеличьте версию.
const CACHE = 'monetka-v22';
const FILES = ['./', 'index.html', 'styles.css?v=22', 'app.js?v=22', 'manifest.webmanifest', 'icons/icon-180.png?v=22', 'icons/icon-192.png?v=22', 'icons/icon-512.png?v=22'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Сначала сеть (чтобы получать обновления), без интернета — из кэша
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    // no-store: всегда берём свежий файл с сервера, минуя кэш браузера
    fetch(e.request, { cache: 'no-store' }).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
