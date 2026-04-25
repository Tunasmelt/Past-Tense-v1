import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', params.id)
      .eq('status', 'public')
      .eq('is_published', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Page not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching public page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    )
  }
}
