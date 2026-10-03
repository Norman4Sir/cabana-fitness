// Offline-cache: de app werkt ook zonder (of met haperende) wifi in de gym.
const CACHE = "cabana-v32";
// Foto's van de toestellen veranderen niet: ze staan in een eigen cache die bij een nieuwe versie blijft staan.
const IMG_CACHE = "cabana-img-1";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
const IMAGES = ["./img/beach.jpg", ...["0473","0474","0475","0476","0477","0478","0480","0481","0482","0483","0484","0485","0486","0487"].map(n => `./img/IMG_${n}.jpg`),
  ...["stepplank","cardio-stepper-touch","cardio-treadmill","cardio-elliptical","cardio-elliptical-led","cardio-upright","cardio-recumbent","cardio-nike","cardio-spin","cardio-rower","cardio-climber","cardio-sdrive","str-shoulderpress","str-dipchin","str-hyperext","str-sissy","str-abbench"].map(n => `./img/${n}.jpg`)];
// Elk bestand apart ophalen: valt de wifi even weg, dan mislukt alleen dat bestand en niet de hele installatie.
const fill = (name, list, skipHave) => caches.open(name).then(c => Promise.all(list.map(u =>
  (skipHave ? c.match(u) : Promise.resolve(null)).then(have => have || fetch(u, { cache: "no-cache" }).then(r => r.ok && c.put(u, r))).catch(() => {}))));
self.addEventListener("install", e => { e.waitUntil(Promise.all([fill(CACHE, FILES), fill(IMG_CACHE, IMAGES, true)])); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k)))).then(() => fill(IMG_CACHE, IMAGES, true)));
  self.clients.claim();
});
// Met tijdslimiet: bij trage wifi niet blijven wachten maar de bewaarde versie tonen.
const timeout = (p, ms) => new Promise((res, rej) => { const t = setTimeout(() => rej(new Error("timeout")), ms); p.then(v => { clearTimeout(t); res(v); }, err => { clearTimeout(t); rej(err); }); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.includes("/img/")) {
    // Foto's: eerst van de iPhone, alleen ophalen als hij er nog niet is.
    e.respondWith(caches.open(IMG_CACHE).then(c => c.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  const net = fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; });
  e.respondWith(timeout(net, 4000).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || net)));
});
