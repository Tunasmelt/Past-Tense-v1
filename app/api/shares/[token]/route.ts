import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { data: share, error: shareError } = await supabase
      .from('page_shares')
      .select('page_id, role, expires_at')
      .eq('share_token', params.token)
      .single()

    if (shareError || !share) {
      return NextResponse.json(
        { error: 'Invalid or expired share link' },
        { status: 404 }
      )
    }

    // Check if share link has expired
    if (share.expires_at) {
      const expiresAt = new Date(share.expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Share link expired' },
          { status: 404 }
        )
      }
    }

    // Fetch the page
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('*')
      .eq('id', share.page_id)
      .single()

    if (pageError || !page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      page,
      role: share.role,
    })
  } catch (error) {
    console.error('Error verifying share token:', error)
    return NextResponse.json(
      { error: 'Failed to verify share link' },
      { status: 500 }
    )
  }
}
