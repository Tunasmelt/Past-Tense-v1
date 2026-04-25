export type PageStatus = 'private' | 'draft' | 'public'
export type LayoutMode = 'portrait' | 'landscape'
export type ShareRole = 'viewer' | 'editor' | 'admin'
export type PaperTone = 'white' | 'cream' | 'beige' | 'gray' | 'dark'
export type SyncAction = 'create' | 'update' | 'delete'
export type EntityType = 'page' | 'highlight' | 'reading_progress'

export interface User {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Page {
  id: string
  user_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  status: PageStatus
  layout_mode: LayoutMode
  is_published: boolean
  published_at: string | null
  scheduled_publish_at: string | null
  view_count: number
  created_at: string
  updated_at: string
}

export interface PageVersion {
  id: string
  page_id: string
  content: Record<string, unknown>
  version_number: number
  created_by: string
  created_at: string
}

export interface PageShare {
  id: string
  page_id: string
  shared_with_user_id: string | null
  shared_email: string | null
  role: ShareRole
  share_token: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface Highlight {
  id: string
  page_id: string
  user_id: string
  start_index: number
  end_index: number
  color: string
  comment: string | null
  created_at: string
}

export interface ReadingProgress {
  id: string
  page_id: string
  user_id: string
  scroll_position: number
  progress_percentage: number
  font_size: number
  font_family: string
  paper_tone: PaperTone
  last_read_at: string
  created_at: string
  updated_at: string
}

export interface OfflineCacheQueue {
  id: string
  user_id: string
  action: SyncAction
  entity_type: EntityType
  entity_id: string
  payload: Record<string, unknown> | null
  synced: boolean
  created_at: string
  synced_at: string | null
}
