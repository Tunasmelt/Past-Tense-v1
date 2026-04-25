import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; shareId: string } }
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

    const { error } = await supabase
      .from('page_shares')
      .delete()
      .eq('id', params.shareId)
      .eq('page_id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting share:', error)
    return NextResponse.json(
      { error: 'Failed to delete share' },
      { status: 500 }
    )
  }
}
