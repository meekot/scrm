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

export async function listAppointments(client: Supabase, entityId: string): Promise<AppointmentWithRelations[]> {
  const { data, error } = await client
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
    .eq('entity_id', entityId)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) throw error;
  return (data as AppointmentWithRelations[]) ?? [];
}
