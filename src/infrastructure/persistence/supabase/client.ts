import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

/**
 * Supabase client for server-side operations
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
})

/**
 * Supabase client for client-side operations (with auth)
 */
export const createBrowserClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}
