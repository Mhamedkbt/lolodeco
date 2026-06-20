import { createClient } from '@supabase/supabase-js'

// Fallbacks keep `createClient` from throwing during build/SSR when the env
// vars are not yet configured (e.g. first Vercel deploy). Real values must be
// set in the hosting environment for data to load.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)