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
      .from('page_shares')
      .select('*')
      .eq('page_id', params.id)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching shares:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shares' },
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
    const { email, role = 'viewer' } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
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
      .from('page_shares')
      .insert({
        page_id: params.id,
        shared_email: email,
        role,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating share:', error)
    return NextResponse.json(
      { error: 'Failed to create share' },
      { status: 500 }
    )
  }
}
