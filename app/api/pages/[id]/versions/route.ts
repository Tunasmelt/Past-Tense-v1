import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user owns this page
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (pageError || page.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('page_versions')
      .select('*')
      .eq('page_id', params.id)
      .order('version_number', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching versions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content } = body

    // Verify user owns this page
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (pageError || page.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the next version number
    const { data: lastVersion } = await supabase
      .from('page_versions')
      .select('version_number')
      .eq('page_id', params.id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single()

    const nextVersionNumber = (lastVersion?.version_number || 0) + 1

    const { data, error } = await supabase
      .from('page_versions')
      .insert({
        page_id: params.id,
        content,
        version_number: nextVersionNumber,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating version:', error)
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    )
  }
}
