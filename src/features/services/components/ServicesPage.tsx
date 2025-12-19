"use client";

import { useRequiredEntity } from '@/features/entity';
import { createClient } from '@/shared/supabase/client-browser';
import { useMemo } from 'react';
import { ServiceUpsertDialog } from './ServiceUpsertDialog';
import { ServiceList } from './ServiceList';
import { useServices } from '../hooks';

export function ServicesPage() {
  const entityId = useRequiredEntity();
  const supabase = useMemo(() => createClient(), []);
  const { data: services } = useServices(supabase, entityId);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">Services <span className="text-muted-foreground text-sm">({services?.length ?? '-'})</span></h1>
          <p className="text-muted-foreground">Manage your service catalog for this entity.</p>
        </div>
        <ServiceUpsertDialog entityId={entityId} supabase={supabase} />
      </div>

      <div>
        <ServiceList client={supabase} entityId={entityId} />
      </div>
    </div>
  );
}
