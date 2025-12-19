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

export type ServiceGainRow = {
  service_id: string;
  total_revenue: number;
  appointments_count: number;
};

export async function getServiceGain(client: Supabase, entityId: string) {
  const { data, error } = await client.rpc('get_service_gain', {
    entity_id: entityId,
  });

  if (error) {
    throw error;
  }

  return (data ?? []) as ServiceGainRow[];
}
