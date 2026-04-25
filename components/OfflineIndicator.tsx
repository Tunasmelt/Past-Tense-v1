'use client'

import { useEffect, useState } from 'react'
import { useOfflineStore } from '@/lib/stores/offlineStore'
import { Wifi, WifiOff, Cloud, Loader2 } from 'lucide-react'

export default function OfflineIndicator() {
  const { isOnline, queue, syncing } = useOfflineStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (isOnline && queue.length === 0) {
    return null
  }

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3 z-50 shadow-lg">
        <WifiOff className="h-5 w-5 text-yellow-600" />
        <div>
          <p className="text-sm font-medium text-yellow-900">
            You&apos;re offline
          </p>
          <p className="text-xs text-yellow-700">
            {queue.length > 0 ? `${queue.length} unsaved changes` : 'Changes will sync when online'}
          </p>
        </div>
      </div>
    )
  }

  if (syncing) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 z-50 shadow-lg">
        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
        <div>
          <p className="text-sm font-medium text-blue-900">
            Syncing changes
          </p>
          <p className="text-xs text-blue-700">
            {queue.length} pending
          </p>
        </div>
      </div>
    )
  }

  if (queue.length > 0) {
    return (
      <div className="fixed bottom-4 right-4 bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3 z-50 shadow-lg">
        <Cloud className="h-5 w-5 text-orange-600" />
        <div>
          <p className="text-sm font-medium text-orange-900">
            Pending sync
          </p>
          <p className="text-xs text-orange-700">
            {queue.length} changes waiting
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 z-50 shadow-lg">
      <Wifi className="h-5 w-5 text-green-600" />
      <div>
        <p className="text-sm font-medium text-green-900">
          All synced
        </p>
        <p className="text-xs text-green-700">
          Everything is up to date
        </p>
      </div>
    </div>
  )
}
