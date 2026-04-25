import { useEffect, useState } from 'react'
import { useOfflineStore } from '@/lib/stores/offlineStore'

export function useOffline() {
  const [mounted, setMounted] = useState(false)
  const { isOnline, syncQueue, loadQueue, queue } = useOfflineStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered:', registration)

          // Listen for sync messages
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
              if (event.data.type === 'SYNC_QUEUE') {
                syncQueue()
              }
            })
          }
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error)
        })
    }

    // Load offline queue from storage
    loadQueue()

    // Sync when coming back online
    const handleOnline = () => {
      useOfflineStore.setState({ isOnline: true })
      syncQueue()
    }

    const handleOffline = () => {
      useOfflineStore.setState({ isOnline: false })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [mounted, syncQueue, loadQueue])

  return {
    isOnline,
    queue,
    syncQueue,
  }
}
