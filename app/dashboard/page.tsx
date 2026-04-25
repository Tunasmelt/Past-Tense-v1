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
        console.error(err)
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
      console.error('Error creating page:', err)
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
      console.error('Error deleting page:', err)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (err) {
      console.error('Error signing out:', err)
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
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Manifest</span>
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
      <section className="border-b border-border bg-muted/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Stories</h1>
              <p className="text-muted-foreground">
                {pages.length} {pages.length === 1 ? 'story' : 'stories'}
              </p>
            </div>
            <Button onClick={handleCreatePage} size="lg" className="gap-2">
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
              <Card key={page.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {page.thumbnail_url && (
                  <div className="w-full h-48 bg-muted overflow-hidden">
                    <img
                      src={page.thumbnail_url}
                      alt={page.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {page.title}
                  </h3>
                  {page.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {page.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      page.status === 'public' ? 'bg-green-100 text-green-800' :
                      page.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {page.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {page.layout_mode}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/editor/${page.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePage(page.id)}
                      className="gap-2"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
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
