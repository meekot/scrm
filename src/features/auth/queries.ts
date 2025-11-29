import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';

export async function getUser(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}

export async function getSession(supabase: SupabaseClient<Database>) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  return session;
}
