"use client";

import { useMemo, useState } from 'react';
import { createClient as createBrowserClient } from '@/shared/supabase/client-browser';
import { useRequiredEntity } from '@/features/entity';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { useAppointments } from '../hooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { AppointmentForm } from './AppointmentForm';
import { CalendarAppointmentsView } from './CalendarAppointmentsView';
import { VirtualizedAppointmentList } from './VirtualizedAppointmentList';

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
          <CalendarAppointmentsView appointments={appointments} client={supabase} entityId={entityId} />
        )
      ) : null}
    </div>
  );
}
