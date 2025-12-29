"use client";

import { useCallback, useMemo, useRef, useState } from 'react';
import { createClient as createBrowserClient } from '@/shared/supabase/client-browser';
import { formatDate } from '@/shared/lib/formatters';
import { Button } from '@/shared/ui/button';
import { DatePicker } from '@/shared/ui/date-picker';
import { Separator } from '@/shared/ui/separator';
import { useUpdateAppointmentStatus } from '../hooks';
import type { AppointmentWithRelations } from '../queries';
import type { AppointmentStatus } from '@/shared/supabase';
import { AppointmentCard } from './AppointmentCard';

type CalendarAppointmentsViewProps = {
  appointments: AppointmentWithRelations[];
  client: ReturnType<typeof createBrowserClient>;
  entityId: string;
};

export function CalendarAppointmentsView({
  appointments,
  client,
  entityId,
}: CalendarAppointmentsViewProps) {
  const rangeDays = 14;
  const today = useMemo(() => new Date(), []);
  const [baseDate, setBaseDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const updateStatus = useUpdateAppointmentStatus(client, entityId);

  const handleStatusChange = useCallback(
    (id: string, status: AppointmentStatus) => {
      updateStatus.mutate({ id, status });
    },
    [updateStatus]
  );

  const dateTabs = useMemo(() => {
    return Array.from({ length: rangeDays }, (_, index) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() - index);
      return date;
    });
  }, [baseDate]);

  const selectedKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);

  const grouped = useMemo(
    () =>
      appointments.reduce<Record<string, AppointmentWithRelations[]>>((acc, appt) => {
        acc[appt.date] = acc[appt.date] ? [...acc[appt.date], appt] : [appt];
        return acc;
      }, {}),
    [appointments]
  );

  const selectedAppointments = grouped[selectedKey] ?? [];

  const minDate = useMemo(() => {
    const min = new Date(baseDate);
    min.setDate(baseDate.getDate() - (rangeDays - 1));
    return min;
  }, [baseDate]);

  const shiftDate = useCallback(
    (direction: 'previous' | 'next') => {
      const next = new Date(selectedDate);
      next.setDate(selectedDate.getDate() + (direction === 'previous' ? -1 : 1));

      if (direction === 'next' && next > baseDate) {
        return;
      }

      setSelectedDate(next);

      if (next < minDate || next > baseDate) {
        setBaseDate(next);
      }
    },
    [baseDate, minDate, selectedDate]
  );

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchEndX.current = null;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) {
      return;
    }

    const deltaX = touchEndX.current - touchStartX.current;
    const threshold = 60;

    if (Math.abs(deltaX) < threshold) {
      return;
    }

    if (deltaX < 0) {
      shiftDate('previous');
      return;
    }

    shiftDate('next');
  };

  const handleSelectDate = (date?: Date) => {
    if (!date) {
      return;
    }

    setSelectedDate(date);
    if (date < minDate || date > baseDate) {
      setBaseDate(date);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {dateTabs.map((date) => {
            const key = toDateKey(date);
            const isSelected = key === selectedKey;
            return (
              <Button
                key={key}
                variant={isSelected ? 'default' : 'outline'}
                className="shrink-0"
                onClick={() => setSelectedDate(date)}
              >
                {formatDate(date, { dateStyle: 'short' })}
              </Button>
            );
          })}
        </div>
        <div className="w-full sm:w-64">
          <DatePicker
            selected={selectedDate}
            onSelect={handleSelectDate}
            className="w-full"
            placeholder="Select a day"
          />
        </div>
      </div>
      <div
        className="rounded-lg border p-3"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{formatDate(selectedDate, { dateStyle: 'long' })}</p>
          <p className="text-xs text-muted-foreground">
            {selectedAppointments.length} appointment{selectedAppointments.length === 1 ? '' : 's'}
          </p>
        </div>
        <Separator className="my-2" />
        {selectedAppointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No appointments for this day.</p>
        ) : (
          <div className="space-y-2">
            {selectedAppointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onStatusChange={handleStatusChange}
                isUpdating={updateStatus.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
