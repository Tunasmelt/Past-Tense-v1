import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { SyncAction, EntityType } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, entityType, entityId, payload } = body

    if (!['create', 'update', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    if (!['page', 'highlight', 'reading_progress'].includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entity type' },
        { status: 400 }
      )
    }

    // Log the offline action to database
    const { error } = await supabase
      .from('offline_cache_queue')
      .insert({
        user_id: session.user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        payload,
        synced: true,
      })

    if (error) throw error

    // In a real app, you would process the action here
    // For now, we just log it

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error syncing offline action:', error)
    return NextResponse.json(
      { error: 'Failed to sync action' },
      { status: 500 }
    )
  }
}
