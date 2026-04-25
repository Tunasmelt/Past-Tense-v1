import { create } from 'zustand'
import { SyncAction, EntityType } from '@/lib/types'

interface OfflineAction {
  id: string
  action: SyncAction
  entityType: EntityType
  entityId: string
  payload: Record<string, unknown>
  timestamp: number
  synced: boolean
}

interface OfflineStore {
  isOnline: boolean
  queue: OfflineAction[]
  syncing: boolean
  lastSyncTime: number | null

  // Status
  setOnline: (online: boolean) => void
  
  // Queue management
  addToQueue: (action: OfflineAction) => Promise<void>
  removeFromQueue: (id: string) => Promise<void>
  clearQueue: () => Promise<void>
  getQueue: () => OfflineAction[]

  // Sync
  syncQueue: () => Promise<void>
  getLastSyncTime: () => number | null

  // Local storage
  loadQueue: () => Promise<void>
  saveQueue: () => Promise<void>
}

const QUEUE_STORAGE_KEY = 'manifest-offline-queue'

export const useOfflineStore = create<OfflineStore>((set, get) => ({
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  queue: [],
  syncing: false,
  lastSyncTime: null,

  setOnline: (online) => set({ isOnline: online }),

  addToQueue: async (action) => {
    const newAction = {
      ...action,
      id: action.id || Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      synced: false,
    }
    
    set((state) => ({
      queue: [...state.queue, newAction],
    }))

    await get().saveQueue()
  },

  removeFromQueue: async (id) => {
    set((state) => ({
      queue: state.queue.filter((a) => a.id !== id),
    }))
    await get().saveQueue()
  },

  clearQueue: async () => {
    set({ queue: [] })
    if (typeof window !== 'undefined') {
      localStorage.removeItem(QUEUE_STORAGE_KEY)
    }
  },

  getQueue: () => get().queue,

  syncQueue: async () => {
    const state = get()
    if (!state.isOnline || state.syncing || state.queue.length === 0) {
      return
    }

    set({ syncing: true })

    try {
      for (const action of state.queue) {
        if (action.synced) continue

        try {
          const response = await fetch('/api/sync/offline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action),
          })

          if (response.ok) {
            await get().removeFromQueue(action.id)
          }
        } catch (err) {
          console.error('Failed to sync action:', action, err)
          break // Stop on first error
        }
      }

      set({ lastSyncTime: Date.now() })
    } finally {
      set({ syncing: false })
    }
  },

  getLastSyncTime: () => get().lastSyncTime,

  loadQueue: async () => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY)
      if (stored) {
        const queue = JSON.parse(stored)
        set({ queue })
      }
    } catch (err) {
      console.error('Failed to load offline queue:', err)
    }
  },

  saveQueue: async () => {
    if (typeof window === 'undefined') return

    try {
      const state = get()
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(state.queue))
    } catch (err) {
      console.error('Failed to save offline queue:', err)
    }
  },
}))

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineStore.setState({ isOnline: true })
    useOfflineStore.getState().syncQueue()
  })

  window.addEventListener('offline', () => {
    useOfflineStore.setState({ isOnline: false })
  })
}
