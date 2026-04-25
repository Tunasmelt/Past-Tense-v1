'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCanvasStore } from '@/lib/stores/canvasStore'
import { Page } from '@/lib/types'
import CanvasEditor from '@/components/canvas/CanvasEditor'
import { Loader2 } from 'lucide-react'

export default function EditorPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { session, loading: authLoading } = useAuth()
  const { initializePage } = useCanvasStore()
  
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/auth/login')
      return
    }
  }, [session, authLoading, router])

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/pages/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Page not found')
          } else if (response.status === 401) {
            router.push('/auth/login')
          } else {
            setError('Failed to load page')
          }
          return
        }
        const data = await response.json()
        setPage(data)
        
        // Initialize canvas store with page data
        initializePage({
          id: data.id,
          title: data.title,
          layoutMode: data.layout_mode,
          backgroundColor: '#ffffff',
          elements: [],
          fontSize: 16,
          fontFamily: 'serif',
        })
      } catch (err) {
        setError('Failed to load page')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (session && id) {
      fetchPage()
    }
  }, [session, id, initializePage, router])

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/dashboard" className="text-primary hover:underline">
            Back to dashboard
          </a>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <CanvasEditor 
      pageId={page.id} 
      pageTitle={page.title}
      currentStatus={page.status}
    />
  )
}
