'use client';

import { QueryProvider } from '@/shared/lib/react-query';
import { EntityProvider } from '@/features/entity';
import { ThemeProvider } from '@/shared/theme';

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
        <EntityProvider initialEntityId={initialEntityId}>
          {children}
        </EntityProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export function AuthProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
