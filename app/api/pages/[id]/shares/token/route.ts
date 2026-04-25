import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

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
    const { role = 'viewer' } = body

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

    // Generate unique share token
    const shareToken = crypto.randomBytes(32).toString('hex')

    const { data, error } = await supabase
      .from('page_shares')
      .insert({
        page_id: params.id,
        role,
        share_token: shareToken,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ ...data, shareToken }, { status: 201 })
  } catch (error) {
    console.error('Error creating share token:', error)
    return NextResponse.json(
      { error: 'Failed to create share token' },
      { status: 500 }
    )
  }
}
