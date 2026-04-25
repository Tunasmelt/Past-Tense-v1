import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    const { pageId, action, wordsWritten, durationMinutes } = await req.json()

    if (action === 'start') {
      // Start a new writing session
      const { data: session, error } = await supabase
        .from('writing_sessions')
        .insert({
          user_id: user.id,
          page_id: pageId,
          focus_mode_enabled: true,
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ session })
    }

    if (action === 'end') {
      // End the writing session
      const { data: session, error } = await supabase
        .from('writing_sessions')
        .update({
          ended_at: new Date().toISOString(),
          words_written: wordsWritten || 0,
          duration_minutes: durationMinutes || 0,
        })
        .eq('user_id', user.id)
        .eq('page_id', pageId)
        .is('ended_at', null)
        .select()
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (session) {
        // Update writing streak
        await supabase
          .from('writing_streaks')
          .rpc('update_streak_from_session', {
            p_user_id: user.id,
            p_words_written: wordsWritten || 0,
          })
      }

      return NextResponse.json({ session })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error managing writing session:', error)
    return NextResponse.json(
      { error: 'Failed to manage session' },
      { status: 500 }
    )
  }
}

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
    const { searchParams } = new URL(req.url)
    const pageId = searchParams.get('pageId')

    let query = supabase
      .from('writing_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })

    if (pageId) {
      query = query.eq('page_id', pageId)
    }

    const { data: sessions, error } = await query.limit(50)

    if (error) throw error

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Error fetching writing sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}
