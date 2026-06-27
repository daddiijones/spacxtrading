const CACHE = 'nct-v1'
const OFFLINE_ASSETS = ['/', '/index.html']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  )
})

self.addEventListener('fetch', e => {
  // Skip non-GET and API/socket requests — always go to network
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) return

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful page/asset responses
        if (res.ok && (e.request.destination === 'document' || e.request.destination === 'script' || e.request.destination === 'style' || e.request.destination === 'image')) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
