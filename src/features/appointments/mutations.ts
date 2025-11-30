import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';
import type { AppointmentInput } from './schemas';

type Supabase = SupabaseClient<Database>;

export async function createAppointment(client: Supabase, entityId: string, input: AppointmentInput) {
  const { data, error } = await client
    .from('appointments')
    .insert({
      entity_id: entityId,
      client_id: input.client_id,
      service_id: input.service_id,
      date: input.date,
      time: input.time,
      price: input.price ?? 0,
      status: input.status ?? 'scheduled',
      notes: input.notes ?? null,
      display_number: 0,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateAppointment(
  client: Supabase,
  entityId: string,
  id: string,
  input: Partial<AppointmentInput>
) {
  const { data, error } = await client
    .from('appointments')
    .update({
      client_id: input.client_id,
      service_id: input.service_id,
      date: input.date,
      time: input.time,
      price: input.price,
      status: input.status,
      notes: input.notes ?? null,
    })
    .eq('entity_id', entityId)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateAppointmentStatus(
  client: Supabase,
  entityId: string,
  id: string,
  status: Database['public']['Enums']['status']
) {
  const { data, error } = await client
    .from('appointments')
    .update({ status })
    .eq('entity_id', entityId)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
