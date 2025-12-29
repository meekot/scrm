"use client";

import { useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { createClient as createBrowserClient } from '@/shared/supabase/client-browser';
import type { AppointmentStatus } from '@/shared/supabase';
import { useUpdateAppointmentStatus } from '../hooks';
import type { AppointmentWithRelations } from '../queries';
import { AppointmentCard } from './AppointmentCard';

type VirtualizedAppointmentListProps = {
  appointments: AppointmentWithRelations[];
  client: ReturnType<typeof createBrowserClient>;
  entityId: string;
};

export function VirtualizedAppointmentList({
  appointments,
  client,
  entityId,
}: VirtualizedAppointmentListProps) {
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
