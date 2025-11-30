"use client";

import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';
import { formatCurrency } from '@/shared/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Separator } from '@/shared/ui/separator';
import { useServices, useDeleteService } from '../hooks';
import type { Tables } from '@/shared/supabase/types';
import { ServiceForm } from './ServiceForm';

type Supabase = SupabaseClient<Database>;
type Service = Tables<'services'>;

type ServiceListProps = {
  client: Supabase;
  entityId: string;
};

export function ServiceList({ client, entityId }: ServiceListProps) {
  const { data, isLoading, isError, error } = useServices(client, entityId);
  const deleteMutation = useDeleteService(client, entityId);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const services = useMemo(() => data ?? [], [data]);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading services...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : 'Failed to load services'}
      </p>
    );
  }

  if (!services.length) {
    return <p className="text-sm text-muted-foreground">No services yet. Add your first one.</p>;
  }

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <Card key={service.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">{service.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(service.price)} {service.duration ? `• ${service.duration} min` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={editingService?.id === service.id} onOpenChange={(open) => !open && setEditingService(null)}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Edit ${service.name}`}
                    onClick={() => setEditingService(service)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit service</DialogTitle>
                    <DialogDescription>Update the details for this service.</DialogDescription>
                  </DialogHeader>
                  <ServiceForm
                    client={client}
                    entityId={entityId}
                    mode="edit"
                    serviceId={service.id}
                    defaultValues={{
                      name: service.name,
                      price: service.price ?? undefined,
                      duration: service.duration ?? undefined,
                      description: service.description ?? undefined,
                    }}
                    onSuccess={() => setEditingService(null)}
                  />
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Delete ${service.name}`}
                disabled={deleteMutation.isPending}
                onClick={() => {
                  setDeleteError(null);
                  setPendingDelete(service.id);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </CardHeader>
          {service.description ? (
            <>
              <Separator />
              <CardContent>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </CardContent>
            </>
          ) : null}
        </Card>
      ))}
      {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete service?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The service will be removed if it is not linked to any appointments.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={async () => {
                if (!pendingDelete) return;
                setDeleteError(null);
                try {
                  await deleteMutation.mutateAsync(pendingDelete);
                  setPendingDelete(null);
                } catch (mutationError) {
                  setDeleteError(
                    mutationError instanceof Error
                      ? mutationError.message
                      : 'Unable to delete service.'
                  );
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
