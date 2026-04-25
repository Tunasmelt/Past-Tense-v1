import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Server-side client for API routes with service role
export const getSupabaseAdmin = () => {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRole) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(supabaseUrl, serviceRole)
}
