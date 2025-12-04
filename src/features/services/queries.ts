import type { Supabase } from '@/shared/supabase';

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
