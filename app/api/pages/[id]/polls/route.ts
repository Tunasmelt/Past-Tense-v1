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
    const { data: polls, error } = await supabase
      .from('page_polls')
      .select(`
        id,
        position,
        question,
        created_by,
        created_at,
        poll_options (
          id,
          option_text,
          position,
          poll_votes (count)
        )
      `)
      .eq('page_id', params.id)
      .order('position', { ascending: true })

    if (error) throw error

    return NextResponse.json({ polls })
  } catch (error) {
    console.error('Error fetching polls:', error)
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
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
    const { position, question, options } = await req.json()

    const { data: poll, error: pollError } = await supabase
      .from('page_polls')
      .insert({
        page_id: params.id,
        position,
        question,
        created_by: user.id,
      })
      .select()
      .single()

    if (pollError) throw pollError

    // Insert options
    const optionsToInsert = options.map((text: string, index: number) => ({
      poll_id: poll.id,
      option_text: text,
      position: index,
    }))

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsToInsert)

    if (optionsError) throw optionsError

    return NextResponse.json({ poll })
  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json(
      { error: 'Failed to create poll' },
      { status: 500 }
    )
  }
}
