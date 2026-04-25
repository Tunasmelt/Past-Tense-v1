import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current view count
    const { data: page, error: fetchError } = await supabase
      .from('pages')
      .select('view_count')
      .eq('id', params.id)
      .eq('is_published', true)
      .eq('status', 'public')
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Page not found' },
          { status: 404 }
        )
      }
      throw fetchError
    }

    // Increment view count
    const { error } = await supabase
      .from('pages')
      .update({
        view_count: (page.view_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json(
      { error: 'Failed to update view count' },
      { status: 500 }
    )
  }
}
