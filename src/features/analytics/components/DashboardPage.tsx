"use client";

import { useMemo, useState } from 'react';
import { useRequiredEntity } from '@/features/entity';
import { formatCurrency, formatNumber } from '@/shared/lib/formatters';
import { createClient as createBrowserClient } from '@/shared/supabase/client-browser';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import {
  useAppointmentsDateRangeCount,
  useAppointmentsRevenueTotal,
  useClientsCount,
  useServicesCount,
} from '../hooks';

const MONTH_OPTIONS = [
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
];

export function DashboardPage() {
  const entityId = useRequiredEntity();
  const supabase = useMemo(() => createBrowserClient(), []);

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const tomorrowIso = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    .toISOString()
    .slice(0, 10);

  const [selectedMonth, setSelectedMonth] = useState(`${today.getMonth()}`);
  const [selectedYear, setSelectedYear] = useState(`${today.getFullYear()}`);
  const selectedYearNumber = Number(selectedYear);
  const selectedMonthNumber = Number(selectedMonth);

  const startOfMonthIso = new Date(selectedYearNumber, selectedMonthNumber, 1)
    .toISOString()
    .slice(0, 10);
  const startOfNextMonthIso = new Date(selectedYearNumber, selectedMonthNumber + 1, 1)
    .toISOString()
    .slice(0, 10);
  const startOfYearIso = new Date(selectedYearNumber, 0, 1).toISOString().slice(0, 10);
  const startOfNextYearIso = new Date(selectedYearNumber + 1, 0, 1).toISOString().slice(0, 10);

  const currentYear = today.getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_value, index) => {
    const year = currentYear - 2 + index;
    return { value: `${year}`, label: `${year}` };
  });

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
  const {
    data: annualRevenue,
    isLoading: annualRevenueLoading,
    isError: annualRevenueError,
  } = useAppointmentsRevenueTotal(supabase, entityId, {
    startDate: startOfYearIso,
    endDate: startOfNextYearIso,
    statuses: ['completed', 'scheduled'],
  });

  const isLoading =
    clientsLoading || servicesLoading || appointmentsLoading || revenueLoading || annualRevenueLoading;
  const isError =
    clientsError || servicesError || appointmentsError || revenueError || annualRevenueError;

  const clientsTotal = clientsCount ?? 0;
  const appointmentsTodayTotal = appointmentsToday ?? 0;
  const servicesTotal = servicesCount ?? 0;
  const monthlyRevenueTotal = monthlyRevenue ?? 0;
  const annualRevenueTotal = annualRevenue ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Key metrics for your entity.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Month</span>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Year</span>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load dashboard metrics. Please try again.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
          <h3 className="text-sm font-medium text-muted-foreground">Potential Monthly Revenue</h3>
          <p className="text-2xl font-bold">
            {isLoading ? 'Loading…' : formatCurrency(monthlyRevenueTotal)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Potential Annual Revenue</h3>
          <p className="text-2xl font-bold">
            {isLoading ? 'Loading…' : formatCurrency(annualRevenueTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
