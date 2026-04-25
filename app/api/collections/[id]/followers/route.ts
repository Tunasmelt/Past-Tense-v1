import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    const { action } = await req.json()

    if (action === 'follow') {
      const { data: follower, error } = await supabase
        .from('collection_followers')
        .insert({
          collection_id: params.id,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ follower })
    }

    if (action === 'unfollow') {
      const { error } = await supabase
        .from('collection_followers')
        .delete()
        .eq('collection_id', params.id)
        .eq('user_id', user.id)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error managing collection follower:', error)
    return NextResponse.json(
      { error: 'Failed to update follower status' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  try {
    let isFollowing = false

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        const { data: follower } = await supabase
          .from('collection_followers')
          .select('id')
          .eq('collection_id', params.id)
          .eq('user_id', user.id)
          .single()

        isFollowing = !!follower
      }
    }

    const { data: followers, error } = await supabase
      .from('collection_followers')
      .select('id', { count: 'exact' })
      .eq('collection_id', params.id)

    if (error) throw error

    return NextResponse.json({
      followerCount: followers?.length || 0,
      isFollowing,
    })
  } catch (error) {
    console.error('Error fetching follower info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch follower info' },
      { status: 500 }
    )
  }
}
