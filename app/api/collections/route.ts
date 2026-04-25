import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const featured = searchParams.get('featured')

  try {
    let query = supabase
      .from('curated_collections')
      .select(`
        id,
        name,
        description,
        thumbnail_url,
        view_count,
        is_featured,
        curator_id,
        users:curator_id (
          id,
          display_name,
          avatar_url
        ),
        collection_pages (count),
        collection_followers (count)
      `)

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    const { data: collections, error } = await query.order('view_count', {
      ascending: false,
    })

    if (error) throw error

    return NextResponse.json({ collections })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
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
    const { name, description, thumbnailUrl } = await req.json()

    const { data: collection, error } = await supabase
      .from('curated_collections')
      .insert({
        name,
        description,
        thumbnail_url: thumbnailUrl,
        curator_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ collection })
  } catch (error) {
    console.error('Error creating collection:', error)
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    )
  }
}
