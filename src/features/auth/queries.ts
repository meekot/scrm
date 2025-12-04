import type { Supabase } from '@/shared/supabase';

export async function getUser(supabase: Supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}

export async function getSession(supabase: Supabase) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  return session;
}
