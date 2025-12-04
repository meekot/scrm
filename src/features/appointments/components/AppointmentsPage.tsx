"use client";

import { useCallback, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { createClient as createBrowserClient } from '@/shared/supabase/client-browser';
import { useRequiredEntity } from '@/features/entity';
import { formatDate } from '@/shared/lib/formatters';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { useAppointments, useUpdateAppointmentStatus } from '../hooks';
import type { AppointmentWithRelations } from '../queries';
import type { AppointmentStatus } from '@/shared/supabase';
import { AppointmentCard } from './AppointmentCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { AppointmentForm } from './AppointmentForm';

type ViewMode = 'list' | 'calendar';

export function AppointmentsPage() {
  const entityId = useRequiredEntity();
  const supabase = useMemo(() => createBrowserClient(), []);
  const { data, isLoading, isError, error } = useAppointments(supabase, entityId);
  const [view, setView] = useState<ViewMode>('list');
  const [createOpen, setCreateOpen] = useState(false);

  const appointments = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Calendar and list views.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>Add appointment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add appointment</DialogTitle>
                <DialogDescription>Schedule a new appointment.</DialogDescription>
              </DialogHeader>
              <AppointmentForm
                client={supabase}
                entityId={entityId}
                onSuccess={() => {
                  setCreateOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
          <Button variant={view === 'list' ? 'default' : 'outline'} onClick={() => setView('list')}>
            List
          </Button>
          <Button variant={view === 'calendar' ? 'default' : 'outline'} onClick={() => setView('calendar')}>
            Calendar
          </Button>
        </div>
      </div>

      <Separator />

      {isLoading ? <p className="text-sm text-muted-foreground">Loading appointments...</p> : null}
      {isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load appointments.'}
        </p>
      ) : null}

      {!isLoading && !isError && appointments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No appointments yet.</p>
      ) : null}

      {!isLoading && !isError && appointments.length > 0 ? (
        view === 'list' ? (
          <VirtualizedAppointmentList appointments={appointments} client={supabase} entityId={entityId} />
        ) : (
          <CalendarView appointments={appointments} client={supabase} entityId={entityId} />
        )
      ) : null}
    </div>
  );
}

function VirtualizedAppointmentList({
  appointments,
  client,
  entityId,
}: {
  appointments: AppointmentWithRelations[];
  client: ReturnType<typeof createBrowserClient>;
  entityId: string;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const updateStatus = useUpdateAppointmentStatus(client, entityId);

  const handleStatusChange = useCallback(
    (id: string, status: AppointmentStatus) => {
      updateStatus.mutate({ id, status });
    },
    [updateStatus]
  );

  const rowVirtualizer = useVirtualizer({
    count: appointments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,
    overscan: 10,
    gap: 12,
  });

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-220px)] min-h-[400px] overflow-y-auto"
    >
      <div
        className="relative w-full"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const appt = appointments[virtualRow.index];
          return (
            <div
              key={appt.id}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className="absolute left-0 top-0 w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <AppointmentCard
                appointment={appt}
                onStatusChange={handleStatusChange}
                isUpdating={updateStatus.isPending}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarView({
  appointments,
  client,
  entityId,
}: {
  appointments: AppointmentWithRelations[];
  client: ReturnType<typeof createBrowserClient>;
  entityId: string;
}) {
  const updateStatus = useUpdateAppointmentStatus(client, entityId);

  const handleStatusChange = useCallback(
    (id: string, status: AppointmentStatus) => {
      updateStatus.mutate({ id, status });
    },
    [updateStatus]
  );

  const grouped = useMemo(
    () =>
      appointments.reduce<Record<string, AppointmentWithRelations[]>>((acc, appt) => {
        acc[appt.date] = acc[appt.date] ? [...acc[appt.date], appt] : [appt];
        return acc;
      }, {}),
    [appointments]
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="rounded-lg border p-3">
          <p className="text-sm font-semibold">{formatDate(date, { dateStyle: 'long' })}</p>
          <Separator className="my-2" />
          <div className="space-y-2">
            {items.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onStatusChange={handleStatusChange}
                isUpdating={updateStatus.isPending}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
