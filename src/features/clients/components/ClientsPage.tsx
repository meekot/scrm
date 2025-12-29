"use client";

import { useMemo, useState } from 'react';
import { createClient as createBrowserClient } from '@/shared/supabase/client-browser';
import { useRequiredEntity } from '@/features/entity';
import { Button } from '@/shared/ui/button';
import { ClientList } from './ClientList';
import { ClientUpsertDialog } from './ClientUpsertDialog';
import { useClientsCount } from '@/features/analytics/hooks';

export function ClientsPage() {
  const entityId = useRequiredEntity();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const { data: clientsCount } = useClientsCount(supabase, entityId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            Clients <span className="text-muted-foreground text-sm">({clientsCount ?? '-'})</span>
          </h1>
          <p className="text-muted-foreground">Manage clients for this entity.</p>
        </div>
        <ClientUpsertDialog
          client={supabase}
          entityId={entityId}
          open={open}
          onOpenChange={setOpen}
          trigger={<Button>Add client</Button>}
          onCreated={() => {
            setOpen(false);
          }}
        />
      </div>

      <div>
        <ClientList client={supabase} entityId={entityId} />
      </div>
    </div>
  );
}
