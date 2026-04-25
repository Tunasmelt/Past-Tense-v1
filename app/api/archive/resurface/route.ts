import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
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
    // Get today's resurface items
    const today = new Date().toISOString().split('T')[0]
    const { data: resurfaces, error } = await supabase
      .from('archive_resurface_queue')
      .select(`
        id,
        page_id,
        scheduled_for,
        surfaced_at,
        dismissed,
        pages:page_id (
          id,
          title,
          description,
          thumbnail_url,
          user_id,
          users:user_id (
            display_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('scheduled_for', today)
      .eq('dismissed', false)
      .is('surfaced_at', null)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ resurfaces })
  } catch (error) {
    console.error('Error fetching resurfaces:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resurfaces' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
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
    const { action, pageId } = await req.json()

    if (action === 'mark-surfaced') {
      // Mark the page as surfaced
      const { error } = await supabase
        .from('archive_resurface_queue')
        .update({ surfaced_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('page_id', pageId)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'dismiss') {
      // Dismiss the resurface
      const { error } = await supabase
        .from('archive_resurface_queue')
        .update({ dismissed: true })
        .eq('user_id', user.id)
        .eq('page_id', pageId)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === 'schedule') {
      // Schedule a page to resurface at a future date
      const { pageId, daysLater } = await req.json()
      const scheduledDate = new Date()
      scheduledDate.setDate(scheduledDate.getDate() + daysLater)

      const { error } = await supabase
        .from('archive_resurface_queue')
        .insert({
          user_id: user.id,
          page_id: pageId,
          scheduled_for: scheduledDate.toISOString().split('T')[0],
        })

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing resurface action:', error)
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    )
  }
}
