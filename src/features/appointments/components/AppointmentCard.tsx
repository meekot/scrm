"use client";

import { Calendar, Check, Clock, Instagram, PhoneCall, XCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/shared/lib/formatters';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { useUpdateAppointmentStatus } from '../hooks';
import type { AppointmentWithRelations } from '../queries';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';

type Supabase = SupabaseClient<Database>;

type Props = {
  appointment: AppointmentWithRelations;
  client: Supabase;
  entityId: string;
};

export function AppointmentCard({ appointment, client, entityId }: Props) {
  const updateStatus = useUpdateAppointmentStatus(client, entityId);
  const isPending = appointment.status === 'scheduled';
  const serviceName = appointment.services?.name ?? 'Service';
  const clientName = appointment.clients?.name ?? 'Client';
  const clientDisplay = appointment.clients?.display_number
    ? `#${appointment.clients.display_number} ${clientName}`
    : clientName;
  const instaHandle = appointment.clients?.instagram?.startsWith('@')
    ? appointment.clients.instagram.slice(1)
    : appointment.clients?.instagram;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">
            #{appointment.display_number} {serviceName}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-4" />
            <span>
              {formatDateTime(`${appointment.date}T${appointment.time ?? '00:00'}`)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>{appointment.status}</span>
            <Badge variant={appointment.status === 'canceled' ? 'destructive' : 'default'}>
              {appointment.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {appointment.clients?.phone ? (
            <Button asChild variant="ghost" size="icon-sm" aria-label={`Call ${clientName}`}>
              <a href={`tel:${appointment.clients.phone}`}>
                <PhoneCall className="size-4" />
              </a>
            </Button>
          ) : null}
          {instaHandle ? (
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              aria-label={`Open Instagram for ${clientName}`}
            >
              <a href={`https://instagram.com/${instaHandle}`} target="_blank" rel="noreferrer">
                <Instagram className="size-4" />
              </a>
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>Client: {clientDisplay}</p>
        <p>Price: {formatCurrency(appointment.price)}</p>
        <div className="flex items-center gap-2">
          {isPending ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ id: appointment.id, status: 'canceled' })}
              >
                <XCircle className="mr-2 size-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                variant="default"
                disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ id: appointment.id, status: 'completed' })}
              >
                <Check className="mr-2 size-4" />
                Confirm
              </Button>
            </>
          ) : (
            <Badge variant={appointment.status === 'completed' ? 'default' : 'destructive'}>
              {appointment.status}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
