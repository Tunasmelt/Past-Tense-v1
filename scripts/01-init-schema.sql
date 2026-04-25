-- Core Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Pages (Canva-style documents)
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'private' CHECK (status IN ('private', 'draft', 'public')),
  layout_mode TEXT DEFAULT 'portrait' CHECK (layout_mode IN ('portrait', 'landscape')),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_publish_at TIMESTAMP WITH TIME ZONE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Page Content Versions (track edits, enable version history)
CREATE TABLE IF NOT EXISTS page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  content JSONB NOT NULL, -- Canvas elements: images, text, layout positioning
  version_number INT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(page_id, version_number)
);

-- Page Sharing & Permissions
CREATE TABLE IF NOT EXISTS page_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shared_email TEXT, -- For sharing with non-registered users
  role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor', 'admin')),
  share_token TEXT UNIQUE, -- For share links
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Highlights & Annotations (reader mode)
CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_index INT NOT NULL,
  end_index INT NOT NULL,
  color TEXT DEFAULT '#FFFF00', -- Yellow highlight default
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reading Progress (for offline sync & progress tracking)
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scroll_position INT DEFAULT 0,
  progress_percentage INT DEFAULT 0,
  font_size INT DEFAULT 16,
  font_family TEXT DEFAULT 'serif',
  paper_tone TEXT DEFAULT 'white' CHECK (paper_tone IN ('white', 'cream', 'beige', 'gray', 'dark')),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(page_id, user_id)
);

-- Offline Cache Queue (for sync when reconnected)
CREATE TABLE IF NOT EXISTS offline_cache_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('page', 'highlight', 'reading_progress')),
  entity_id UUID NOT NULL,
  payload JSONB,
  synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published);
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_shares_page_id ON page_shares(page_id);
CREATE INDEX IF NOT EXISTS idx_page_shares_token ON page_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_highlights_page_id ON highlights(page_id);
CREATE INDEX IF NOT EXISTS idx_highlights_user_id ON highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_page_id ON reading_progress(page_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_queue_user_id ON offline_cache_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_queue_synced ON offline_cache_queue(synced);

-- Enable RLS (Row Level Security) for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_cache_queue ENABLE ROW LEVEL SECURITY;

-- RLS: Users can read their own profile
CREATE POLICY "Users can read their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- RLS: Pages - Own pages or shared pages
CREATE POLICY "Users can read own pages"
  ON pages FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can read public pages"
  ON pages FOR SELECT
  USING (status = 'public');

CREATE POLICY "Users can read shared pages"
  ON pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM page_shares
      WHERE page_shares.page_id = pages.id
      AND (page_shares.shared_with_user_id = auth.uid() OR page_shares.shared_email = auth.jwt() ->> 'email')
    )
  );

CREATE POLICY "Users can create pages"
  ON pages FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pages"
  ON pages FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own pages"
  ON pages FOR DELETE
  USING (user_id = auth.uid());

-- RLS: Page Versions - Read if can read page
CREATE POLICY "Users can read versions of accessible pages"
  ON page_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_versions.page_id
      AND (
        pages.user_id = auth.uid()
        OR pages.status = 'public'
        OR EXISTS (
          SELECT 1 FROM page_shares
          WHERE page_shares.page_id = pages.id
          AND (page_shares.shared_with_user_id = auth.uid() OR page_shares.shared_email = auth.jwt() ->> 'email')
        )
      )
    )
  );

CREATE POLICY "Users can create versions for own pages"
  ON page_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_versions.page_id
      AND pages.user_id = auth.uid()
    )
  );

-- RLS: Page Shares
CREATE POLICY "Users can read shares for own pages"
  ON page_shares FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_shares.page_id
      AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shares for own pages"
  ON page_shares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pages
      WHERE pages.id = page_shares.page_id
      AND pages.user_id = auth.uid()
    )
  );

-- RLS: Highlights - Own highlights
CREATE POLICY "Users can read own highlights"
  ON highlights FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create highlights on accessible pages"
  ON highlights FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS: Reading Progress - Own progress
CREATE POLICY "Users can read own reading progress"
  ON reading_progress FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own reading progress"
  ON reading_progress FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS: Offline Queue - Own queue
CREATE POLICY "Users can read own offline queue"
  ON offline_cache_queue FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can write to own offline queue"
  ON offline_cache_queue FOR INSERT
  WITH CHECK (user_id = auth.uid());
