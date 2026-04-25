import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('status', 'public')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching public pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch public pages' },
      { status: 500 }
    )
  }
}
