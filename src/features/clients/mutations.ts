import type { Supabase } from '@/shared/supabase';
import type { ClientInput } from './schemas';

async function ensureUniquePhone(client: Supabase, entityId: string, phone: string, excludeId?: string) {
  let query = client.from('clients').select('id').eq('entity_id', entityId).eq('phone', phone).limit(1);
  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;
  if (error) throw error;
  if (data && data.length > 0) {
    throw new Error('Client phone already exists for this entity.');
  }
}

export async function createClient(client: Supabase, entityId: string, input: ClientInput) {
  await ensureUniquePhone(client, entityId, input.phone);

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
  if (input.phone) {
    await ensureUniquePhone(client, entityId, input.phone, id);
  }

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
