import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Supabase, AppointmentStatus } from '@/shared/supabase';
import { queryKeys } from '@/shared/lib/queryKeys';
import { listAppointmentsWithRelations, type ListAppointmentsOptions } from './queries';
import { createAppointment, updateAppointment, updateAppointmentStatus } from './mutations';
import type { AppointmentInput } from './schemas';

export function useAppointments(client: Supabase, entityId: string, options?: ListAppointmentsOptions) {
  const queryKey = [
    ...queryKeys.appointments.all(entityId),
    'list',
    {
      page: options?.page,
      pageSize: options?.pageSize,
      searchTerm: options?.searchTerm ?? null,
      searchFields: options?.searchFields,
      sort: options?.sort,
    },
  ] as const;

  return useQuery({
    queryKey,
    queryFn: () => listAppointmentsWithRelations(client, entityId, options),
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
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      updateAppointmentStatus(client, entityId, id, status),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.appointments.all(entityId) });
      qc.invalidateQueries({ queryKey: queryKeys.appointments.byId(entityId, variables.id) });
    },
  });
}
