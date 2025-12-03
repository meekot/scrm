'use client';

import { QueryProvider } from '@/shared/lib/react-query';
import { EntityProvider } from '@/features/entity';
import { ToastProvider } from '@/shared/ui/toast';

export function AppProviders({
  children,
  initialEntityId,
}: {
  children: React.ReactNode;
  initialEntityId?: string;
}) {
  return (
    <QueryProvider>
      <ToastProvider>
        <EntityProvider initialEntityId={initialEntityId}>
          {children}
        </EntityProvider>
      </ToastProvider>
    </QueryProvider>
  );
}

export function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>{children}</ToastProvider>
    </QueryProvider>
  );
}
