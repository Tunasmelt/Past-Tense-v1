'use client'

import { useOffline } from '@/hooks/useOffline'

export default function OfflineInitializer() {
  // Initialize offline support
  useOffline()
  
  return null
}
