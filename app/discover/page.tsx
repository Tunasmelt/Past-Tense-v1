'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { BookOpen, Search, ArrowLeft } from 'lucide-react'
import { Page } from '@/lib/types'

export default function DiscoverPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredPages, setFilteredPages] = useState<Page[]>([])

  useEffect(() => {
    const fetchPublicPages = async () => {
      try {
        const response = await fetch('/api/public/pages')
        if (response.ok) {
          const data = await response.json()
          setPages(data)
          setFilteredPages(data)
        }
      } catch (error) {
        console.error('Error fetching public pages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPublicPages()
  }, [])

  useEffect(() => {
    const filtered = pages.filter((page) => {
      const query = searchQuery.toLowerCase()
      return (
        page.title.toLowerCase().includes(query) ||
        (page.description?.toLowerCase().includes(query) ?? false)
      )
    })
    setFilteredPages(filtered)
  }, [searchQuery, pages])

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Discover</span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="bg-muted/50 border-b border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-6">Explore Public Stories</h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading stories...</p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'No stories match your search.' : 'No public stories yet.'}
            </p>
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPages.map((page) => (
              <Link key={page.id} href={`/reader/${page.id}`}>
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
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
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{page.view_count} views</span>
                      <span>
                        {new Date(page.published_at || page.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
