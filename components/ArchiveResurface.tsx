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
        // Silently handle fetch errors - component won't render if no resurfaces
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
      // Silently handle errors
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
      // Silently handle errors
    }
  }

  if (!user || loading) return null

  if (resurfaces.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="p-5 bg-card border border-primary/30 shadow-2xl backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
              From Your Archive
            </h3>
          </div>
          <button
            onClick={() => {
              if (resurfaces.length > 0) {
                handleDismiss(resurfaces[0].id)
              }
            }}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {resurfaces.length > 0 && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-foreground line-clamp-2 text-lg">
                {resurfaces[0].title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
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

            <div className="flex gap-3 pt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 font-semibold border-muted-foreground/40 hover:border-primary/60 text-muted-foreground hover:text-foreground"
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
                className="flex-1 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => {
                  if (resurfaces.length > 0) {
                    handleMarkSurfaced(resurfaces[0].id)
                    window.location.href = `/reader/${resurfaces[0].id}`
                  }
                }}
              >
                Read <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            {resurfaces.length > 1 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{resurfaces.length - 1} more today
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
