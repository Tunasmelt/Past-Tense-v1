'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, Users, Share2, Plus } from 'lucide-react'
import { Loader2 } from 'lucide-react'

interface CollectionPage {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  view_count: number
  users?: {
    display_name?: string
    avatar_url?: string
  }
}

interface CollectionDetail {
  id: string
  name: string
  description?: string
  thumbnail_url?: string
  curator_id: string
  is_featured: boolean
  view_count: number
  users?: {
    id: string
    display_name?: string
    avatar_url?: string
  }
}

export default function CollectionPage({
  params,
}: {
  params: { id: string }
}) {
  const { user } = useAuth()
  const [collection, setCollection] = useState<CollectionDetail | null>(null)
  const [pages, setPages] = useState<CollectionPage[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        // This would need a get single collection endpoint
        const collectionResponse = await fetch(`/api/collections`)
        const collectionData = await collectionResponse.json()
        const col = collectionData.collections?.find(
          (c: CollectionDetail) => c.id === params.id
        )
        setCollection(col)

        // Fetch pages
        const pagesResponse = await fetch(
          `/api/collections/${params.id}/pages`
        )
        const pagesData = await pagesResponse.json()
        setPages(pagesData.pages || [])

        // Fetch follower info
        const followersResponse = await fetch(
          `/api/collections/${params.id}/followers`,
          {
            headers: user
              ? { Authorization: `Bearer ${user.id}` }
              : {},
          }
        )
        const followersData = await followersResponse.json()
        setIsFollowing(followersData.isFollowing)
        setFollowerCount(followersData.followerCount)
      } catch (error) {
        console.error('Error fetching collection:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCollectionData()
  }, [params.id, user])

  const handleFollow = async () => {
    if (!user) return

    try {
      await fetch(`/api/collections/${params.id}/followers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: isFollowing ? 'unfollow' : 'follow' }),
      })

      setIsFollowing(!isFollowing)
      setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1)
    } catch (error) {
      console.error('Error updating follower status:', error)
    }
  }

  if (loading || !collection) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isCurator = user?.id === collection.curator_id

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {collection.thumbnail_url && (
        <div className="w-full h-64 bg-muted overflow-hidden">
          <img
            src={collection.thumbnail_url}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {collection.name}
              </h1>
              <p className="text-muted-foreground mb-4">
                {collection.description}
              </p>
              {collection.users?.display_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {collection.users.avatar_url && (
                    <img
                      src={collection.users.avatar_url}
                      alt={collection.users.display_name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  )}
                  <span>by {collection.users.display_name}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {user && (
                <Button
                  variant={isFollowing ? 'default' : 'outline'}
                  onClick={handleFollow}
                  className="gap-2"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isFollowing ? 'fill-current' : ''
                    }`}
                  />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
              {isCurator && (
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Stories
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{followerCount} followers</span>
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span>{pages.length} stories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Stories */}
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {pages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No stories in this collection yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <Link key={page.id} href={`/reader/${page.id}`}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow cursor-pointer">
                  {page.thumbnail_url && (
                    <div className="w-full h-40 bg-muted overflow-hidden">
                      <img
                        src={page.thumbnail_url}
                        alt={page.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                      {page.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {page.description || 'No description'}
                    </p>
                    {page.users?.display_name && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {page.users.avatar_url && (
                          <img
                            src={page.users.avatar_url}
                            alt={page.users.display_name}
                            className="h-5 w-5 rounded-full object-cover"
                          />
                        )}
                        <span>{page.users.display_name}</span>
                      </div>
                    )}
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
