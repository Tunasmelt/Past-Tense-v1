'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ImmersiveReader from '@/components/reader/ImmersiveReader'
import { Page } from '@/lib/types'
import { Loader2 } from 'lucide-react'

export default function SharedPage() {
  const { token } = useParams() as { token: string }
  
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/shares/${token}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Share link expired or invalid')
          } else {
            setError('Failed to load shared page')
          }
          return
        }

        const data = await response.json()
        setPage(data.page)
        setCanEdit(data.role === 'editor' || data.role === 'admin')
      } catch (err) {
        setError('Failed to load shared page')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchPage()
    }
  }, [token])

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
          <p className="text-red-600 mb-4">{error || 'Page not found'}</p>
          <a href="/" className="text-primary hover:underline">
            Back home
          </a>
        </div>
      </div>
    )
  }

  // Render page content
  const renderContent = () => {
    return (
      <div>
        {page.description && (
          <p className="text-lg mb-8 opacity-80 italic">
            {page.description}
          </p>
        )}
        <div className="prose prose-lg max-w-none">
          <p>Shared page content will be displayed here.</p>
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
