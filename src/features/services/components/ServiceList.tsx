"use client";

import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Supabase, Service } from '@/shared/supabase';
import { formatCurrency } from '@/shared/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Separator } from '@/shared/ui/separator';
import { useToast } from '@/shared/ui/toast';
import { useServiceGain, useServices, useDeleteService } from '../hooks';
import { ServiceForm } from './ServiceForm';

type ServiceListProps = {
  client: Supabase;
  entityId: string;
};

export function ServiceList({ client, entityId }: ServiceListProps) {
  const deleteMutation = useDeleteService(client, entityId);
  const { addToast } = useToast();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { data: serviceGain, isLoading: gainLoading } = useServiceGain(client, entityId);

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const gainByServiceId = useMemo(() => {
    return new Map((serviceGain ?? []).map((entry) => [entry.service_id, entry]));
  }, [serviceGain]);

  return (
    <div className="space-y-3">
      <ServiceListInternal
        client={client}
        entityId={entityId}
        gainByServiceId={gainByServiceId}
        gainLoading={gainLoading}
        setEditingService={setEditingService}
        setDeleting={(id) => {
          setDeleteError(null);
          setPendingDelete(id);
        }}
        isDeleting={!!pendingDelete}
      />

      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit service</DialogTitle>
            <DialogDescription>Update the details for this service.</DialogDescription>
          </DialogHeader>
          <ServiceForm
            client={client}
            entityId={entityId}
            mode="edit"
            serviceId={editingService?.id}
            defaultValues={{
              name: editingService?.name,
              price: editingService?.price ?? undefined,
              duration: editingService?.duration ?? undefined,
              description: editingService?.description ?? undefined,
            }}
            onSuccess={() => {
              setEditingService(null);
              addToast({ title: 'Service updated', description: 'Your changes were saved.' });
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete service?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The service will be removed if it is not linked to any appointments.
            </DialogDescription>
          </DialogHeader>
          {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
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
                  addToast({ title: 'Service deleted', description: 'The service was removed.' });
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


function ServiceListInternal({
  client,
  entityId,
  gainByServiceId,
  gainLoading,
  setEditingService,
  setDeleting,
  isDeleting,
}: ServiceListProps & {
  gainByServiceId: Map<string, { total_revenue: number; appointments_count: number }>;
  gainLoading: boolean;
  setDeleting: (id: string) => void;
  isDeleting: boolean;
  setEditingService: (service: Service) => void;
}) {
  const { data, isLoading, isError, error } = useServices(client, entityId);

  const services = useMemo(() => data ?? [], [data]);


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

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading services...</p>;
  }


  return services.map((service) => {
    const gainEntry = gainByServiceId.get(service.id);
    const gainTotal = gainEntry?.total_revenue ?? 0;
    return (
      <ServiceListItem
        key={service.id}
        service={service}
        gainLoading={gainLoading}
        gainTotal={gainTotal}
        setEditingService={setEditingService}
        setDeleting={setDeleting}
        isDeleting={isDeleting}
      />
    );
  });
}

function ServiceListItem({
  service,
  gainLoading,
  gainTotal,
  setEditingService,
  setDeleting,
  isDeleting,
}: {
  service: Service;
  gainLoading: boolean;
  gainTotal: number;
  setEditingService: (service: Service) => void;
  setDeleting: (id: string) => void;
  isDeleting: boolean;
}) {
  return (<Card key={service.id}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
      <div>
        <CardTitle className="text-base"><span className='text-muted-foreground font-base'>#{service.display_number}</span> {service.name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(service.price)} {service.duration ? `• ${service.duration} min` : ''}
        </p>
        <p className="text-xs text-muted-foreground">
          Gain: {gainLoading ? 'Loading…' : formatCurrency(gainTotal)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Edit ${service.name}`}
          onClick={() => setEditingService(service)}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Delete ${service.name}`}
          disabled={isDeleting}
          onClick={() => {
            setDeleting(service.id);
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
  </Card>)
}
