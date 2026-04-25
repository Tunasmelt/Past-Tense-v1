import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: heatmaps, error } = await supabase
      .from('page_heatmaps')
      .select('*')
      .eq('page_id', params.id)
      .order('position', { ascending: true })

    if (error) throw error

    return NextResponse.json({ heatmaps })
  } catch (error) {
    console.error('Error fetching heatmap:', error)
    return NextResponse.json(
      { error: 'Failed to fetch heatmap' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { position, action } = await req.json()

    // Increment the appropriate counter
    const { data: existing } = await supabase
      .from('page_heatmaps')
      .select('*')
      .eq('page_id', params.id)
      .eq('position', position)
      .single()

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (action === 'view') {
      updates.view_count = (existing?.view_count || 0) + 1
    } else if (action === 'highlight') {
      updates.highlight_count = (existing?.highlight_count || 0) + 1
    } else if (action === 'note') {
      updates.note_count = (existing?.note_count || 0) + 1
    }

    const { data: heatmap, error } = await supabase
      .from('page_heatmaps')
      .upsert(
        {
          page_id: params.id,
          position,
          ...updates,
        },
        { onConflict: 'page_id,position' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ heatmap })
  } catch (error) {
    console.error('Error updating heatmap:', error)
    return NextResponse.json(
      { error: 'Failed to update heatmap' },
      { status: 500 }
    )
  }
}
