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
    const { searchParams } = new URL(req.url)
    const publicOnly = searchParams.get('public') === 'true'

    let query = supabase
      .from('margin_notes')
      .select(`
        id,
        position,
        content,
        is_public,
        created_at,
        user_id,
        users:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('page_id', params.id)

    if (publicOnly) {
      query = query.eq('is_public', true)
    }

    const { data: notes, error } = await query.order('position', {
      ascending: true,
    })

    if (error) throw error

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error fetching margin notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch margin notes' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabase.auth.getUser(token)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { position, content, isPublic } = await req.json()

    const { data: note, error } = await supabase
      .from('margin_notes')
      .insert({
        page_id: params.id,
        user_id: user.id,
        position,
        content,
        is_public: isPublic || false,
      })
      .select()
      .single()

    if (error) throw error

    // Update heatmap
    await supabase
      .from('page_heatmaps')
      .upsert(
        {
          page_id: params.id,
          position,
          note_count: 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'page_id,position' }
      )

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error creating margin note:', error)
    return NextResponse.json(
      { error: 'Failed to create margin note' },
      { status: 500 }
    )
  }
}
