import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getSupabaseClient = (token: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  )
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = getSupabaseClient(token)
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (!user || userError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, scheduledPublishAt } = body

    if (!['private', 'draft', 'public'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'public') {
      updateData.is_published = true
      updateData.published_at = scheduledPublishAt ? null : new Date().toISOString()
      
      if (scheduledPublishAt) {
        const scheduledDate = new Date(scheduledPublishAt)
        if (scheduledDate < new Date()) {
          return NextResponse.json(
            { error: 'Scheduled time must be in the future' },
            { status: 400 }
          )
        }
        updateData.scheduled_publish_at = scheduledDate.toISOString()
      } else {
        updateData.scheduled_publish_at = null
      }
    } else {
      updateData.is_published = false
      updateData.scheduled_publish_at = null
    }

    const { data, error } = await supabase
      .from('pages')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to publish page' },
      { status: 500 }
    )
  }
}
