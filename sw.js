/* Offline-Cache für Pomalo Kroatisch */
const V = "pomalo-v2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin && (r.mode === "navigate" || u.pathname.endsWith("/") || u.pathname.endsWith(".html"))) {
    /* App selbst: erst Netz (für Updates), sonst Cache */
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(ca => ca.put("./index.html", c)); return res; }).catch(() => caches.match("./index.html")));
    return;
  }
  /* Rest (Icons, Schriften): Cache zuerst */
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(V).then(ca => ca.put(r, c)); } return res; })));
});
