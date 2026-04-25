'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ImmersiveReader from '@/components/reader/ImmersiveReader'
import { Page } from '@/lib/types'
import { Loader2 } from 'lucide-react'

export default function ReaderPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/public/pages/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Story not found')
          } else {
            setError('Failed to load story')
          }
          return
        }

        const data = await response.json()
        
        // Track view count
        await fetch(`/api/pages/${id}/views`, {
          method: 'POST',
        }).catch(console.error)

        setPage(data)
      } catch (err) {
        setError('Failed to load story')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPage()
    }
  }, [id])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Story not found'}</p>
          <a href="/discover" className="text-primary hover:underline">
            Back to discover
          </a>
        </div>
      </div>
    )
  }

  // Render page content from version history or default
  const renderContent = () => {
    return (
      <div>
        {page.description && (
          <p className="text-lg mb-8 opacity-80 italic">
            {page.description}
          </p>
        )}
        <div className="prose prose-lg max-w-none">
          <p>Story content will be displayed here based on the page version.</p>
        </div>
      </div>
    )
  }

  return (
    <ImmersiveReader
      pageId={page.id}
      pageTitle={page.title}
      content={renderContent()}
    />
  )
}
