"use client";

import { memo, useCallback } from 'react';
import { Check, Instagram, Phone, User, XCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/shared/lib/formatters';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { AppointmentWithRelations } from '../queries';
import type { Database } from '@/shared/supabase/types';

type AppointmentStatus = Database['public']['Enums']['status'];

type Props = {
  appointment: AppointmentWithRelations;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
  isUpdating?: boolean;
};

const statusConfig = {
  scheduled: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    badge: 'default' as const,
    label: 'Scheduled',
  },
  completed: {
    border: 'border-l-green-500',
    bg: 'bg-green-50 dark:bg-green-950/20',
    badge: 'default' as const,
    label: 'Completed',
  },
  canceled: {
    border: 'border-l-red-500',
    bg: 'bg-red-50 dark:bg-red-950/20',
    badge: 'destructive' as const,
    label: 'Canceled',
  },
} as const;

export const AppointmentCard = memo(function AppointmentCard({
  appointment,
  onStatusChange,
  isUpdating = false,
}: Props) {
  const isPending = appointment.status === 'scheduled';
  const status = statusConfig[appointment.status] ?? statusConfig.scheduled;

  const handleCancel = useCallback(() => {
    onStatusChange?.(appointment.id, 'canceled');
  }, [appointment.id, onStatusChange]);

  const handleComplete = useCallback(() => {
    onStatusChange?.(appointment.id, 'completed');
  }, [appointment.id, onStatusChange]);

  const serviceName = appointment.services?.name ?? 'Service';
  const clientName = appointment.clients?.name ?? 'Client';
  const instaHandle = appointment.clients?.instagram?.startsWith('@')
    ? appointment.clients.instagram.slice(1)
    : appointment.clients?.instagram;

  const dateTimeString = `${appointment.date}T${appointment.time ?? '00:00'}`;

  return (
    <div
      className={cn(
        'rounded-lg border border-l-4 p-4 transition-shadow hover:shadow-md',
        status.border,
        status.bg
      )}
    >
      {/* Mobile: Stacked layout / Desktop: Row layout */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left section: Time + Service info */}
        <div className="flex gap-3 sm:gap-4">
          {/* Time badge - prominent display */}
          <div className="flex flex-col items-center justify-center rounded-lg bg-background px-3 py-2 text-center shadow-sm">
            <span className="text-lg font-bold tabular-nums">
              {formatTime(dateTimeString)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(appointment.date, { dateStyle: 'short' })}
            </span>
          </div>

          {/* Service + Client info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold">{serviceName}</h3>
              <Badge variant={status.badge} className="shrink-0">
                {status.label}
              </Badge>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="size-3.5 shrink-0" />
              <span className="truncate">{clientName}</span>
              {appointment.clients?.display_number && (
                <span className="text-xs opacity-60">
                  #{appointment.clients.display_number}
                </span>
              )}
            </div>

            {/* Price - visible on all sizes */}
            <div className="mt-1.5 text-sm font-medium">
              {formatCurrency(appointment.price)}
            </div>
          </div>
        </div>

        {/* Right section: Contact actions */}
        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
          {/* Contact buttons - always visible */}
          <div className="flex gap-1">
            {appointment.clients?.phone && (
              <Button
                asChild
                variant="outline"
                size="icon"
                className="size-9 rounded-full"
                aria-label={`Call ${clientName}`}
              >
                <a href={`tel:${appointment.clients.phone}`}>
                  <Phone className="size-4" />
                </a>
              </Button>
            )}
            {instaHandle && (
              <Button
                asChild
                variant="outline"
                size="icon"
                className="size-9 rounded-full"
                aria-label={`Instagram ${clientName}`}
              >
                <a
                  href={`https://instagram.com/${instaHandle}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Instagram className="size-4" />
                </a>
              </Button>
            )}
          </div>

          {/* Appointment number - subtle */}
          <span className="text-xs text-muted-foreground">
            #{appointment.display_number}
          </span>
        </div>
      </div>

      {/* Action buttons - full width on mobile */}
      {isPending && onStatusChange && (
        <div className="mt-4 flex gap-2 border-t pt-4 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            disabled={isUpdating}
            onClick={handleCancel}
          >
            <XCircle className="mr-2 size-4" />
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1 sm:flex-none"
            disabled={isUpdating}
            onClick={handleComplete}
          >
            <Check className="mr-2 size-4" />
            Complete
          </Button>
        </div>
      )}
    </div>
  );
});
