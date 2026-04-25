'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, ArrowRight, Calendar } from 'lucide-react'

interface ResurfacedPage {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  users?: {
    display_name?: string
    avatar_url?: string
  }
}

export default function ArchiveResurface() {
  const { user } = useAuth()
  const [resurfaces, setResurfaces] = useState<ResurfacedPage[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return

    const fetchResurfaces = async () => {
      try {
        const response = await fetch('/api/archive/resurface', {
          headers: {
            'Authorization': `Bearer ${user.id}`,
          },
        })

        if (!response.ok) throw new Error('Failed to fetch resurfaces')

        const data = await response.json()
        setResurfaces(data.resurfaces || [])
      } catch (error) {
        console.error('Error fetching resurfaces:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResurfaces()
  }, [user])

  const handleMarkSurfaced = async (pageId: string) => {
    try {
      await fetch('/api/archive/resurface', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'mark-surfaced', pageId }),
      })

      setResurfaces(resurfaces.filter(r => r.id !== pageId))
    } catch (error) {
      console.error('Error marking as surfaced:', error)
    }
  }

  const handleDismiss = async (pageId: string) => {
    try {
      await fetch('/api/archive/resurface', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.id}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'dismiss', pageId }),
      })

      setDismissed(new Set([...dismissed, pageId]))
      setResurfaces(resurfaces.filter(r => r.id !== pageId))
    } catch (error) {
      console.error('Error dismissing resurface:', error)
    }
  }

  if (!user || loading) return null

  if (resurfaces.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="p-4 bg-background border-border shadow-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">
              Resurfaced Story
            </h3>
          </div>
          <button
            onClick={() => {
              if (resurfaces.length > 0) {
                handleDismiss(resurfaces[0].id)
              }
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {resurfaces.length > 0 && (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-foreground line-clamp-2">
                {resurfaces[0].title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {resurfaces[0].description || 'No description'}
              </p>
            </div>

            {resurfaces[0].users?.display_name && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {resurfaces[0].users.avatar_url && (
                  <img
                    src={resurfaces[0].users.avatar_url}
                    alt={resurfaces[0].users.display_name}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                )}
                <span>by {resurfaces[0].users.display_name}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (resurfaces.length > 0) {
                    handleDismiss(resurfaces[0].id)
                  }
                }}
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (resurfaces.length > 0) {
                    handleMarkSurfaced(resurfaces[0].id)
                    // Navigate to reader
                    window.location.href = `/reader/${resurfaces[0].id}`
                  }
                }}
              >
                Read <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            {resurfaces.length > 1 && (
              <p className="text-xs text-muted-foreground text-center">
                +{resurfaces.length - 1} more today
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
