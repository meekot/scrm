import type { Supabase } from '@/shared/supabase';
import type { ServiceInput } from './schemas';

export async function createService(client: Supabase, entityId: string, input: ServiceInput) {
  const { data, error } = await client
    .from('services')
    .insert({
      entity_id: entityId,
      name: input.name,
      price: input.price ?? 0,
      duration: input.duration ?? null,
      description: input.description ?? null,
      display_number: 0, // trigger will assign the correct value
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateService(
  client: Supabase,
  entityId: string,
  id: string,
  input: Partial<ServiceInput>
) {
  const { data, error } = await client
    .from('services')
    .update({
      name: input.name,
      price: input.price ?? null,
      duration: input.duration ?? null,
      description: input.description ?? null,
    })
    .eq('entity_id', entityId)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteService(client: Supabase, entityId: string, id: string) {
  const { data: linkedAppointments, error: relationError } = await client
    .from('appointments')
    .select('id')
    .eq('entity_id', entityId)
    .eq('service_id', id)
    .limit(1);

  if (relationError) throw relationError;

  if (linkedAppointments && linkedAppointments.length > 0) {
    throw new Error('Cannot delete service that is used in appointments.');
  }

  const { error } = await client.from('services').delete().eq('entity_id', entityId).eq('id', id);

  if (error) throw error;
  return { success: true };
}
