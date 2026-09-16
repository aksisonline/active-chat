const ASSET_CACHE = 'active-chat-assets-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.mode === 'navigate' || url.pathname.startsWith('/api/')) return
  event.respondWith(caches.open(ASSET_CACHE).then(async (cache) => {
    const cached = await cache.match(request)
    const network = fetch(request).then((response) => {
      if (response.ok) void cache.put(request, response.clone())
      return response
    })
    return cached || network
  }))
})
