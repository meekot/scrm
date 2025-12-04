import type { Client, Supabase } from '@/shared/supabase';

export type ClientWithStats = Client & {
  appointments: Array<{
    id: string;
    service_id: string | null;
    price: number;
    date: string;
    time: string | null;
    created_at: string;
  }>;
};

export async function listClients(client: Supabase, entityId: string): Promise<ClientWithStats[]> {
  const { data, error } = await client
    .from('clients')
    .select(`
      id,
      name,
      phone,
      instagram,
      lead_source,
      display_number,
      entity_id,
      created_at,
      updated_at,
      appointments:appointments (
        id,
        service_id,
        price,
        date,
        time,
        created_at
      )
    `)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
