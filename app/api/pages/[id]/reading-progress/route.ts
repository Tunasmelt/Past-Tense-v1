import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('page_id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json(data || {})
  } catch (error) {
    console.error('Error fetching reading progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reading progress' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      fontSize,
      fontFamily,
      paperTone,
      scrollPosition,
      progressPercentage,
    } = body

    // Upsert reading progress
    const { data, error } = await supabase
      .from('reading_progress')
      .upsert({
        page_id: params.id,
        user_id: session.user.id,
        font_size: fontSize || 16,
        font_family: fontFamily || 'serif',
        paper_tone: paperTone || 'white',
        scroll_position: scrollPosition || 0,
        progress_percentage: progressPercentage || 0,
        last_read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'page_id, user_id',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error saving reading progress:', error)
    return NextResponse.json(
      { error: 'Failed to save reading progress' },
      { status: 500 }
    )
  }
}
