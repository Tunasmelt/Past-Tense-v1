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
    const { data: settings, error } = await supabase
      .from('focus_mode_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json({
      settings: settings || {
        durationMinutes: 25,
        enableNotifications: true,
        enableBackgroundMusic: false,
        backgroundMusicUrl: null,
      },
    })
  } catch (error) {
    console.error('Error fetching focus mode settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
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
    const {
      durationMinutes,
      enableNotifications,
      enableBackgroundMusic,
      backgroundMusicUrl,
    } = await req.json()

    const { data: settings, error } = await supabase
      .from('focus_mode_settings')
      .upsert(
        {
          user_id: user.id,
          duration_minutes: durationMinutes,
          enable_notifications: enableNotifications,
          enable_background_music: enableBackgroundMusic,
          background_music_url: backgroundMusicUrl,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating focus mode settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
