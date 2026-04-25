'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, Users, BookOpen } from 'lucide-react'

interface Collection {
  id: string
  name: string
  description?: string
  thumbnail_url?: string
  view_count: number
  is_featured: boolean
  users?: {
    display_name?: string
    avatar_url?: string
  }
  collection_pages?: Array<{ count?: number }>
  collection_followers?: Array<{ count?: number }>
}

export default function ExplorePage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('featured')

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const isFeatured = filter === 'featured'
        const response = await fetch(
          `/api/collections?featured=${isFeatured}`
        )

        if (!response.ok) throw new Error('Failed to fetch collections')

        const data = await response.json()
        setCollections(data.collections || [])
      } catch (error) {
        console.error('Error fetching collections:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [filter])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Explore</h1>
          <p className="text-muted-foreground">
            Discover curated collections of beautiful stories from talented writers
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('featured')}
              className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                filter === 'featured'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                filter === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              All Collections
            </button>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading collections...</div>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No collections found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link key={collection.id} href={`/collections/${collection.id}`}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow cursor-pointer">
                  {collection.thumbnail_url && (
                    <div className="w-full h-32 bg-muted overflow-hidden">
                      <img
                        src={collection.thumbnail_url}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {collection.description || 'No description'}
                    </p>

                    {collection.users?.display_name && (
                      <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                        {collection.users.avatar_url && (
                          <img
                            src={collection.users.avatar_url}
                            alt={collection.users.display_name}
                            className="h-5 w-5 rounded-full object-cover"
                          />
                        )}
                        <span>{collection.users.display_name}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>
                          {Array.isArray(collection.collection_pages)
                            ? collection.collection_pages.length
                            : 0}{' '}
                          stories
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>
                          {Array.isArray(collection.collection_followers)
                            ? collection.collection_followers.length
                            : 0}{' '}
                          followers
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
