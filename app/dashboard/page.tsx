'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Page } from '@/lib/types'
import { BookOpen, LogOut, Plus, Trash2, Edit2, Share2 } from 'lucide-react'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { session, signOut, loading: authLoading, user } = useAuth()
  
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/auth/login')
      return
    }
  }, [session, authLoading, router])

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch('/api/pages')
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth/login')
          } else {
            setError('Failed to load pages')
          }
          return
        }
        const data = await response.json()
        setPages(data)
      } catch (err) {
        setError('Failed to load pages')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchPages()
    }
  }, [session, router])

  const handleCreatePage = async () => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled',
          layout_mode: 'portrait',
        }),
      })
      if (response.ok) {
        const newPage = await response.json()
        router.push(`/editor/${newPage.id}`)
      }
    } catch (err) {
      // Error handled silently
    }
  }

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return
    
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setPages(pages.filter((p) => p.id !== pageId))
      }
    } catch (err) {
      // Error handled silently
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (err) {
      // Error handled silently
    }
  }

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-primary/20 bg-background/98 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-primary" />
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">Manifest</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="border-b border-primary/20 bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-3 text-primary">My Stories</h1>
              <p className="text-muted-foreground text-lg">
                {pages.length} {pages.length === 1 ? 'story' : 'stories'}
              </p>
            </div>
            <Button onClick={handleCreatePage} size="lg" className="gap-2 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              <Plus className="h-5 w-5" />
              New Story
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 mb-6 text-destructive">
            {error}
          </div>
        )}

        {pages.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-6">
              You haven&apos;t created any stories yet.
            </p>
            <Button onClick={handleCreatePage} size="lg">
              Create Your First Story
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <Card key={page.id} className="overflow-hidden border-primary/30 hover:border-primary/60 hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm">
                {page.thumbnail_url && (
                  <div className="w-full h-48 bg-muted/30 overflow-hidden border-b border-primary/20">
                    <img
                      src={page.thumbnail_url}
                      alt={page.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground">
                    {page.title}
                  </h3>
                  {page.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                      {page.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-5">
                    <span className={`text-xs px-3 py-1 rounded font-bold uppercase tracking-wider ${
                      page.status === 'public' ? 'bg-primary/20 text-primary' :
                      page.status === 'draft' ? 'bg-muted/40 text-muted-foreground' :
                      'bg-muted/30 text-muted-foreground'
                    }`}>
                      {page.status}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {page.layout_mode}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/editor/${page.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2 border-primary/30 hover:border-primary/60 hover:text-primary font-semibold">
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-primary/30 hover:border-primary/60 hover:text-primary"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePage(page.id)}
                      className="gap-2 border-destructive/30 hover:border-destructive/60 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
