'use client';

import { QueryProvider } from '@/shared/lib/react-query';
import { EntityProvider } from '@/features/entity';

export function AppProviders({
  children,
  initialEntityId,
}: {
  children: React.ReactNode;
  initialEntityId?: string;
}) {
  return (
    <QueryProvider>
      <EntityProvider initialEntityId={initialEntityId}>
        {children}
      </EntityProvider>
    </QueryProvider>
  );
}
