"use client";

import { useMemo, useState } from 'react';
import { createClient as createBrowserClient } from '@/shared/supabase/client-browser';
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
import { ClientForm } from './ClientForm';
import { ClientList } from './ClientList';

export function ClientsPage() {
  const entityId = useRequiredEntity();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage clients for this entity.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add client</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add client</DialogTitle>
              <DialogDescription>Phone number is required (international format).</DialogDescription>
            </DialogHeader>
            <ClientForm
              client={supabase}
              entityId={entityId}
              onCreated={() => {
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Client list</h2>
        <ClientList client={supabase} entityId={entityId} />
      </div>
    </div>
  );
}
