const CACHE_NAME = 'manifest-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('Cache addAll error:', err)
        // Continue even if some assets fail
        return Promise.resolve()
      })
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip API calls and external requests for now
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response
          const cloned = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cloned)
          })
          return response
        })
        .catch(() => {
          // Return offline response for API calls
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached
            }
            return new Response(
              JSON.stringify({ error: 'offline', cached: true }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              }
            )
          })
        })
    )
    return
  }

  // Cache first strategy for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response
        }

        // Clone and cache the response
        const cloned = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, cloned)
        })

        return response
      })
    })
  )
})

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SYNC_QUEUE',
          })
        })
      })
    )
  }
})
