import type { AppointmentStatus, Supabase } from '@/shared/supabase';


export async function getEntityTableCount(
  table: 'clients' | 'services',
  supabase: Supabase,
  entityId: string
) {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('entity_id', entityId);

  if (error) throw error;
  return count ?? 0;
}

export async function getAppointmentsDateRangeCount(
  supabase: Supabase,
  entityId: string,
  {
    startDate,
    endDate,
    statuses = ['scheduled', 'completed'] satisfies AppointmentStatus[],
  }: {
    startDate: string;
    endDate?: string;
    statuses?: AppointmentStatus[];
  }
) {
  let query = supabase
    .from('appointments')
    .select('id')
    .eq('entity_id', entityId)
    .gte('date', startDate);

  if (endDate) {
    query = query.lt('date', endDate);
  }

  if (statuses) {
    query = query.in('status', statuses);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data?.length ?? 0;
}

export async function getAppointmentsRevenueTotal(
  supabase: Supabase,
  entityId: string,
  {
    startDate,
    endDate,
    statuses = ['completed'] satisfies AppointmentStatus[],
  }: {
    startDate: string;
    endDate?: string;
    statuses?: AppointmentStatus[];
  }
) {
  let query = supabase
    .from('appointments')
    .select('price')
    .eq('entity_id', entityId)
    .gte('date', startDate);

  if (endDate) {
    query = query.lt('date', endDate);
  }

  if (statuses) {
    query = query.in('status', statuses);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data?.reduce((total, a) => total + (a.price || 0), 0);
}
