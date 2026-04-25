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
    const { data: streak, error } = await supabase
      .from('writing_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json({
      streak: streak || {
        currentStreak: 0,
        longestStreak: 0,
        lastWriteDate: null,
        totalWordsWritten: 0,
      },
    })
  } catch (error) {
    console.error('Error fetching streak:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streak' },
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
    const { wordsAdded } = await req.json()

    // Get current streak
    const { data: currentStreak } = await supabase
      .from('writing_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const today = new Date().toISOString().split('T')[0]
    const lastWriteDate = currentStreak?.last_write_date

    let newStreak = currentStreak?.current_streak || 0
    let newLongestStreak = currentStreak?.longest_streak || 0

    // Check if writing today for the first time
    if (lastWriteDate !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      // If last write was yesterday, increment streak; otherwise reset to 1
      if (lastWriteDate === yesterdayStr) {
        newStreak = (currentStreak?.current_streak || 0) + 1
      } else {
        newStreak = 1
      }

      // Update longest streak if current is longer
      if (newStreak > (currentStreak?.longest_streak || 0)) {
        newLongestStreak = newStreak
      }
    }

    const { data: streak, error } = await supabase
      .from('writing_streaks')
      .upsert(
        {
          user_id: user.id,
          current_streak: newStreak,
          longest_streak: Math.max(newLongestStreak, currentStreak?.longest_streak || 0),
          last_write_date: today,
          total_words_written: (currentStreak?.total_words_written || 0) + (wordsAdded || 0),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ streak })
  } catch (error) {
    console.error('Error updating streak:', error)
    return NextResponse.json(
      { error: 'Failed to update streak' },
      { status: 500 }
    )
  }
}
