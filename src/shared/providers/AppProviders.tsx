'use client';

import { QueryProvider } from '@/shared/lib/react-query';
import { EntityProvider } from '@/features/entity';
import { ThemeProvider } from '@/shared/theme';
import { ToastProvider } from '@/shared/ui/toast';

export function AppProviders({
  children,
  initialEntityId,
}: {
  children: React.ReactNode;
  initialEntityId?: string;
}) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          <EntityProvider initialEntityId={initialEntityId}>
            {children}
          </EntityProvider>
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>{children}</ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
