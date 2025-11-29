import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';

export async function getUserEntities(client: SupabaseClient<Database>, userId: string) {
  const { data, error } = await client
    .from('entity_members')
    .select('entity_id, role, entity:entity_id(id, name, display_number, created_at)')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function getEntityById(client: SupabaseClient<Database>, entityId: string) {
  const { data, error } = await client
    .from('entity')
    .select('*')
    .eq('id', entityId)
    .single();

  if (error) throw error;
  return data;
}

export async function checkEntityMembership(
  client: SupabaseClient<Database>,
  entityId: string,
  userId: string
) {
  const { data, error } = await client
    .from('entity_members')
    .select('role')
    .eq('entity_id', entityId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw error;
  }

  return data;
}

export async function resolveDefaultEntity(
  client: SupabaseClient<Database>,
  userId: string
): Promise<string | null> {
  const entities = await getUserEntities(client, userId);

  if (!entities || entities.length === 0) {
    return null;
  }

  // If user has only one entity, return it
  if (entities.length === 1) {
    return entities[0].entity_id;
  }

  // For multiple entities, could implement more sophisticated logic
  // For now, return the first one
  return entities[0].entity_id;
}
