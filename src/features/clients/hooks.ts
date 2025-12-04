import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Supabase } from '@/shared/supabase';
import { queryKeys } from '@/shared/lib/queryKeys';
import { listClients } from './queries';
import { createClient, deleteClient, updateClient } from './mutations';
import type { ClientInput } from './schemas';

export function useClients(client: Supabase, entityId: string) {
  return useQuery({
    queryKey: queryKeys.clients.all(entityId),
    queryFn: () => listClients(client, entityId),
  });
}

export function useCreateClient(client: Supabase, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ClientInput) => createClient(client, entityId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.clients.all(entityId) }),
  });
}

export function useUpdateClient(client: Supabase, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ClientInput> }) =>
      updateClient(client, entityId, id, input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.clients.all(entityId) });
      qc.invalidateQueries({ queryKey: queryKeys.clients.byId(entityId, variables.id) });
    },
  });
}

export function useDeleteClient(client: Supabase, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClient(client, entityId, id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.clients.all(entityId) });
      qc.invalidateQueries({ queryKey: queryKeys.clients.byId(entityId, id) });
    },
  });
}
