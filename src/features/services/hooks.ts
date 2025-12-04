import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { Supabase } from '@/shared/supabase';
import { queryKeys } from '@/shared/lib/queryKeys';
import { listServices } from './queries';
import { createService, deleteService, updateService } from './mutations';
import type { ServiceInput } from './schemas';

export function useServices(client: Supabase, entityId: string) {
  return useQuery({
    queryKey: queryKeys.services.all(entityId),
    queryFn: () => listServices(client, entityId),
  });
}

export function useCreateService(client: Supabase, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ServiceInput) => createService(client, entityId, input),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.services.all(entityId) });
      return data;
    },
  });
}

export function useUpdateService(client: Supabase, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ServiceInput> }) =>
      updateService(client, entityId, id, input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.services.all(entityId) });
      qc.invalidateQueries({ queryKey: queryKeys.services.byId(entityId, variables.id) });
    },
  });
}

export function useDeleteService(client: Supabase, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteService(client, entityId, id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.services.all(entityId) });
      qc.invalidateQueries({ queryKey: queryKeys.services.byId(entityId, id) });
    },
  });
}

export function useServiceById(client: Supabase, entityId: string, id: string) {
  const enabled = Boolean(id);
  const queryKey = useMemo(() => queryKeys.services.byId(entityId, id), [entityId, id]);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await client
        .from('services')
        .select('*')
        .eq('entity_id', entityId)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled,
  });
}
