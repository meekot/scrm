import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';

type Supabase = SupabaseClient<Database>;

export async function listServices(client: Supabase, entityId: string) {
  const { data, error } = await client
    .from('services')
    .select('*')
    .eq('entity_id', entityId)
    .order('display_number', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}
