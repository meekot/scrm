import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';
import type { ClientInput } from './schemas';

type Supabase = SupabaseClient<Database>;

export async function createClient(client: Supabase, entityId: string, input: ClientInput) {
  const { data, error } = await client
    .from('clients')
    .insert({
      entity_id: entityId,
      name: input.name,
      phone: input.phone,
      instagram: input.instagram ?? null,
      lead_source: input.lead_source ?? null,
      display_number: 0,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClient(client: Supabase, entityId: string, id: string) {
  const { data: linkedAppointments, error: relationError } = await client
    .from('appointments')
    .select('id')
    .eq('entity_id', entityId)
    .eq('client_id', id)
    .limit(1);

  if (relationError) throw relationError;
  if (linkedAppointments && linkedAppointments.length > 0) {
    throw new Error('Cannot delete client that has appointments.');
  }

  const { error } = await client.from('clients').delete().eq('entity_id', entityId).eq('id', id);
  if (error) throw error;
  return { success: true };
}

export async function updateClient(
  client: Supabase,
  entityId: string,
  id: string,
  input: Partial<ClientInput>
) {
  const { data, error } = await client
    .from('clients')
    .update({
      name: input.name,
      phone: input.phone,
      instagram: input.instagram ?? null,
      lead_source: input.lead_source ?? null,
    })
    .eq('entity_id', entityId)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}
