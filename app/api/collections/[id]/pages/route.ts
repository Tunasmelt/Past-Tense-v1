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
    const { data: pages, error } = await supabase
      .from('collection_pages')
      .select(`
        id,
        position,
        pages:page_id (
          id,
          title,
          description,
          thumbnail_url,
          view_count,
          users:user_id (
            display_name,
            avatar_url
          )
        )
      `)
      .eq('collection_id', params.id)
      .order('position', { ascending: true })

    if (error) throw error

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Error fetching collection pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection pages' },
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
    // Verify user is collection curator
    const { data: collection, error: collectionError } = await supabase
      .from('curated_collections')
      .select('curator_id')
      .eq('id', params.id)
      .single()

    if (collectionError || collection.curator_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { pageId, position } = await req.json()

    const { data: collectionPage, error } = await supabase
      .from('collection_pages')
      .insert({
        collection_id: params.id,
        page_id: pageId,
        position: position || 0,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ collectionPage })
  } catch (error) {
    console.error('Error adding page to collection:', error)
    return NextResponse.json(
      { error: 'Failed to add page' },
      { status: 500 }
    )
  }
}
