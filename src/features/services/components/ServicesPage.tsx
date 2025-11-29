"use client";

import { useMemo } from 'react';
import { createClient } from '@/shared/supabase/client-browser';
import { useRequiredEntity } from '@/features/entity';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { ServiceForm } from './ServiceForm';
import { ServiceList } from './ServiceList';
import { useToast } from '@/shared/ui/toast';
import { useState } from 'react';

export function ServicesPage() {
  const entityId = useRequiredEntity();
  const supabase = useMemo(() => createClient(), []);
  const { addToast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage your service catalog for this entity.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Create service</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create service</DialogTitle>
              <DialogDescription>Add a new service for this entity.</DialogDescription>
            </DialogHeader>
            <ServiceForm
              client={supabase}
              entityId={entityId}
              mode="create"
              onCreated={() => {
                setIsCreateOpen(false);
                addToast({ title: 'Service created', description: 'Your service was added.' });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Service list</h2>
        <ServiceList client={supabase} entityId={entityId} />
      </div>
    </div>
  );
}
