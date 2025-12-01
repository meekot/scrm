"use client";

import { useMemo } from 'react';
import { useRequiredEntity } from '@/features/entity';
import { formatCurrency, formatNumber } from '@/shared/lib/formatters';
import { createClient as createBrowserClient } from '@/shared/supabase/client-browser';
import {
  useAppointmentsDateRangeCount,
  useAppointmentsRevenueTotal,
  useClientsCount,
  useServicesCount,
} from '../hooks';

export function DashboardPage() {
  const entityId = useRequiredEntity();
  const supabase = useMemo(() => createBrowserClient(), []);

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const tomorrowIso = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    .toISOString()
    .slice(0, 10);

  const startOfMonthIso = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const startOfNextMonthIso = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    .toISOString()
    .slice(0, 10);

  const {
    data: clientsCount,
    isLoading: clientsLoading,
    isError: clientsError,
  } = useClientsCount(supabase, entityId);
  const {
    data: servicesCount,
    isLoading: servicesLoading,
    isError: servicesError,
  } = useServicesCount(supabase, entityId);
  const {
    data: appointmentsToday,
    isLoading: appointmentsLoading,
    isError: appointmentsError,
  } = useAppointmentsDateRangeCount(supabase, entityId, { startDate: todayIso, endDate: tomorrowIso });
  const {
    data: monthlyRevenue,
    isLoading: revenueLoading,
    isError: revenueError,
  } = useAppointmentsRevenueTotal(supabase, entityId, {
    startDate: startOfMonthIso,
    endDate: startOfNextMonthIso,
    statuses: ['completed', 'scheduled']
  });

  const isLoading = clientsLoading || servicesLoading || appointmentsLoading || revenueLoading;
  const isError = clientsError || servicesError || appointmentsError || revenueError;

  const clientsTotal = clientsCount ?? 0;
  const appointmentsTodayTotal = appointmentsToday ?? 0;
  const servicesTotal = servicesCount ?? 0;
  const monthlyRevenueTotal = monthlyRevenue ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Key metrics for your entity.</p>
      </div>

      {isError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load dashboard metrics. Please try again.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Clients</h3>
          <p className="text-2xl font-bold">
            {isLoading ? 'Loading…' : formatNumber(clientsTotal)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Appointments Today Todo</h3>
          <p className="text-2xl font-bold">
            {isLoading ? 'Loading…' : formatNumber(appointmentsTodayTotal)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Services</h3>
          <p className="text-2xl font-bold">{isLoading ? 'Loading…' : formatNumber(servicesTotal)}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Potencial Monthly Revenue</h3>
          <p className="text-2xl font-bold">
            {isLoading ? 'Loading…' : formatCurrency(monthlyRevenueTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
