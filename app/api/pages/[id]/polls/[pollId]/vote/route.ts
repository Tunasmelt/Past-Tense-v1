import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; pollId: string } }
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
    const { optionId } = await req.json()

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_option_id', optionId)
      .eq('user_id', user.id)
      .single()

    if (existingVote) {
      return NextResponse.json(
        { error: 'Already voted' },
        { status: 400 }
      )
    }

    const { data: vote, error } = await supabase
      .from('poll_votes')
      .insert({
        poll_option_id: optionId,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ vote })
  } catch (error) {
    console.error('Error recording vote:', error)
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    )
  }
}
