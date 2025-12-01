import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';

type Supabase = SupabaseClient<Database>;

export type AppointmentWithRelations = Database['public']['Tables']['appointments']['Row'] & {
  clients: {
    id: string;
    name: string;
    phone: string | null;
    instagram: string | null;
    display_number: number;
  } | null;
  services: {
    id: string;
    name: string;
    price: number | null;
    display_number: number;
  } | null;
};

export type AppointmentSearchField = 'client' | 'service' | 'notes' | 'status';

export type AppointmentSortField = 'date' | 'time' | 'created_at' | 'price' | 'status' | 'display_number';

export type AppointmentSort = {
  field: AppointmentSortField;
  direction?: 'asc' | 'desc';
};

export type ListAppointmentsOptions = {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  searchFields?: AppointmentSearchField[];
  sort?: AppointmentSort[];
};

const DEFAULT_SEARCH_FIELDS: AppointmentSearchField[] = ['client', 'service', 'notes'];
const DEFAULT_SORT: AppointmentSort[] = [
  { field: 'date', direction: 'desc' },
  { field: 'time', direction: 'desc' },
];

export async function listAppointmentsWithRelations(
  client: Supabase,
  entityId: string,
  options: ListAppointmentsOptions = {}
): Promise<AppointmentWithRelations[]> {
  const {
    page,
    pageSize,
    searchTerm,
    searchFields = DEFAULT_SEARCH_FIELDS,
    sort = DEFAULT_SORT,
  } = options;

  let query = client
    .from('appointments')
    .select(
      `
      id,
      display_number,
      entity_id,
      client_id,
      service_id,
      date,
      time,
      price,
      status,
      created_at,
      clients:clients (
        id,
        name,
        phone,
        instagram,
        display_number
      ),
      services:services (
        id,
        name,
        price,
        display_number
      )
    `
    )
    .eq('entity_id', entityId);

  if (searchTerm?.trim()) {
    const term = `%${searchTerm.trim()}%`;
    const searchFilters: string[] = [];

    if (searchFields.includes('client')) {
      searchFilters.push(`clients.name.ilike.${term}`, `clients.phone.ilike.${term}`, `clients.instagram.ilike.${term}`);
    }

    if (searchFields.includes('service')) {
      searchFilters.push(`services.name.ilike.${term}`);
    }

    if (searchFields.includes('notes')) {
      searchFilters.push(`notes.ilike.${term}`);
    }

    if (searchFields.includes('status')) {
      searchFilters.push(`status.ilike.${term}`);
    }

    if (searchFilters.length) {
      query = query.or(searchFilters.join(','));
    }
  }

  const sortsToApply = sort.length ? sort : DEFAULT_SORT;
  sortsToApply.forEach(({ field, direction = 'asc' }) => {
    query = query.order(field, { ascending: direction === 'asc' });
  });

  if (pageSize !== undefined) {
    const currentPage = page ?? 1;
    const from = Math.max(0, (currentPage - 1) * pageSize);
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as AppointmentWithRelations[]) ?? [];
}
