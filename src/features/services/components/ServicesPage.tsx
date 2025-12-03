"use client";

import { useRequiredEntity } from '@/features/entity';
import { createClient } from '@/shared/supabase/client-browser';
import { useMemo } from 'react';
import { ServiceUpsertDialog } from './ServiceUpsertDialog';
import { ServiceList } from './ServiceList';

export function ServicesPage() {
  const entityId = useRequiredEntity();
  const supabase = useMemo(() => createClient(), []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage your service catalog for this entity.</p>
        </div>
        <ServiceUpsertDialog entityId={entityId} supabase={supabase} />
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Service list</h2>
        <ServiceList client={supabase} entityId={entityId} />
      </div>
    </div>
  );
}
