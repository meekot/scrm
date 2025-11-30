import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';
import { queryKeys } from '@/shared/lib/queryKeys';
import { listAppointments } from './queries';
import { createAppointment, updateAppointment, updateAppointmentStatus } from './mutations';
import type { AppointmentInput } from './schemas';

type Supabase = SupabaseClient<Database>;

export function useAppointments(client: Supabase, entityId: string) {
  return useQuery({
    queryKey: queryKeys.appointments.all(entityId),
    queryFn: () => listAppointments(client, entityId),
  });
}

export function useCreateAppointment(client: Supabase, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AppointmentInput) => createAppointment(client, entityId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all(entityId) });
    },
  });
}

export function useUpdateAppointment(client: Supabase, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AppointmentInput> }) =>
      updateAppointment(client, entityId, id, input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all(entityId) });
      qc.invalidateQueries({ queryKey: queryKeys.appointments.byId(entityId, variables.id) });
    },
  });
}

export function useUpdateAppointmentStatus(client: Supabase, entityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Database['public']['Enums']['status'] }) =>
      updateAppointmentStatus(client, entityId, id, status),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all(entityId) });
      qc.invalidateQueries({ queryKey: queryKeys.appointments.byId(entityId, variables.id) });
    },
  });
}
