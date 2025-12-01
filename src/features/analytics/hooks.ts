import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import {
  getAppointmentsDateRangeCount,
  getAppointmentsRevenueTotal,
  getEntityTableCount,
  type AppointmentStatus,
  type Supabase,
} from './queries';

export function useClientsCount(client: Supabase, entityId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.clientsCount(entityId),
    queryFn: () => getEntityTableCount('clients', client, entityId),
  });
}

export function useServicesCount(client: Supabase, entityId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.servicesCount(entityId),
    queryFn: () => getEntityTableCount('services', client, entityId),
  });
}

export function useAppointmentsDateRangeCount(
  client: Supabase,
  entityId: string,
  {
    startDate,
    endDate,
    statuses,
  }: {
    startDate: string;
    endDate?: string;
    statuses?: AppointmentStatus[];
  }
) {
  const rangeKey = `${startDate}:${endDate ?? 'none'}:${statuses?.join('|') ?? 'all'}`;

  return useQuery({
    queryKey: queryKeys.analytics.appointmentsCount(entityId, rangeKey),
    queryFn: () => getAppointmentsDateRangeCount(client, entityId, { startDate, endDate, statuses }),
  });
}

export function useAppointmentsRevenueTotal(
  client: Supabase,
  entityId: string,
  {
    startDate,
    endDate,
    statuses,
  }: {
    startDate: string;
    endDate?: string;
    statuses?: AppointmentStatus[];
  }
) {
  const rangeKey = `${startDate}:${endDate ?? 'none'}:${statuses?.join('|') ?? 'completed'}`;

  return useQuery({
    queryKey: queryKeys.analytics.revenueTotal(entityId, rangeKey),
    queryFn: () => getAppointmentsRevenueTotal(client, entityId, { startDate, endDate, statuses }),
  });
}
