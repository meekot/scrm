import type { Client, Supabase } from '@/shared/supabase';

export type ClientWithStats = Client & {
  appointment_count: number;
  total_spent: number;
  last_appointment_at: string | null;
};

export type ClientSort =
  | 'created_desc'
  | 'display_asc'
  | 'last_appointment_desc'
  | 'appointment_count_desc'
  | 'spent_desc';

export type ListClientsParams = {
  search?: string;
  sortBy?: ClientSort;
  limit?: number;
  offset?: number;
};

export async function listClients(
  client: Supabase,
  entityId: string,
  { search = '', sortBy = 'created_desc', limit = 20, offset = 0 }: ListClientsParams = {}
): Promise<ClientWithStats[]> {
  const { data, error } = await client.rpc('list_clients_with_stats', {
    entity_id: entityId,
    search_query: search,
    sort_by: sortBy,
    limit_count: limit,
    offset_count: offset,
  });

  if (error) throw error;
  return (data ?? []) as ClientWithStats[];
}

export async function countClients(client: Supabase, entityId: string): Promise<number> {
  const { count, error } = await client
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('entity_id', entityId);

  if (error) throw error;
  return count ?? 0;
}
