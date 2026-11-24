// Service worker: maakt de app volledig offline beschikbaar.
// Verhoog VERSION bij elke wijziging zodat geïnstalleerde apps de nieuwe versie ophalen.
const VERSION = 'v9';
const SHELL = `shell-${VERSION}`;
const TILES = 'tiles';
const MAX_TILES = 3000; // ca. 50–80 MB aan bewaarde kaarttegels
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/app.js',
  'js/db.js',
  'js/data/animals.js',
  'js/data/places.js',
  'js/data/info.js',
  'js/data/borders.js',
  'js/data/activities.js',
  'js/config.js',
  'js/cloud.js',
  'vendor/supabase/supabase.js',
  'vendor/leaflet/leaflet.js',
  'vendor/leaflet/leaflet.css',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

// Haal alle bestanden vers op (niet uit de HTTP-cache), zodat een nieuwe versie compleet is.
async function precache() {
  const cache = await caches.open(SHELL);
  await Promise.all(ASSETS.map(async url => {
    const res = await fetch(new Request(url, { cache: 'reload' }));
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    await cache.put(url, res);
  }));
}

self.addEventListener('install', e => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('shell-') && k !== SHELL).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    // App openen (ook vanaf het beginscherm): altijd de opgeslagen app-shell.
    if (req.mode === 'navigate') {
      e.respondWith(caches.match('index.html', { cacheName: SHELL }).then(r => r || fetch(req)));
      return;
    }
    // Eigen bestanden: eerst uit de cache (snel en offline), anders van het netwerk.
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(cached => cached || fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(SHELL).then(c => c.put(req, copy)); }
        return res;
      }))
    );
    return;
  }

  // Kaarttegels: bewaren zodat eerder bekeken gebieden offline zichtbaar blijven.
  if (url.hostname.endsWith('tile.openstreetmap.org')) {
    e.respondWith(
      caches.open(TILES).then(async c => {
        const cached = await c.match(req);
        if (cached) return cached;
        try {
          const res = await fetch(req);
          if (res.ok) { await c.put(req, res.clone()); trimTiles(c); }
          return res;
        } catch {
          // Offline en niet bewaard: lege tegel, de basiskaart eronder blijft zichtbaar.
          return new Response('', { status: 404 });
        }
      })
    );
  }
});

let trimming = false;
async function trimTiles(cache) {
  if (trimming) return;
  trimming = true;
  try {
    const keys = await cache.keys();
    for (let i = 0; i < keys.length - MAX_TILES; i++) await cache.delete(keys[i]);
  } finally { trimming = false; }
}

// Statusvragen vanuit de app (Instellingen → Offline gebruik).
self.addEventListener('message', e => {
  const port = e.ports[0];
  if (!port) return;
  const reply = data => port.postMessage(data);
  if (e.data?.type === 'status') {
    e.waitUntil((async () => {
      const cache = await caches.open(SHELL);
      let missing = 0;
      for (const url of ASSETS) if (!(await cache.match(url))) missing++;
      const tiles = (await (await caches.open(TILES)).keys()).length;
      reply({ version: VERSION, total: ASSETS.length, missing, tiles });
    })());
  } else if (e.data?.type === 'precache') {
    e.waitUntil(precache().then(() => reply({ ok: true }), () => reply({ ok: false })));
  }
});
