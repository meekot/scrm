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
