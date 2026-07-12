const CACHE_NAME='julie-voice-loader-v1';
const ASSETS=[
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.svg",
  "./icons/icon-512.svg",
  "./icons/maskable-512.svg",
  "./chunks/app-01.b64",
  "./chunks/app-02.b64",
  "./chunks/app-03.b64",
  "./chunks/app-04.b64",
  "./chunks/app-05.b64",
  "./chunks/app-06.b64",
  "./chunks/app-07.b64",
  "./chunks/app-08.b64",
  "./chunks/app-09.b64",
  "./chunks/app-10.b64",
  "./chunks/app-11.b64"
];

self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const u=new URL(event.request.url);if(u.origin!==location.origin)return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}return response;})));});
