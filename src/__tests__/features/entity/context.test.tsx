import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { EntityProvider, useEntity, useRequiredEntity } from '@/features/entity';

describe('Entity context', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('throws when useEntity is used outside provider', () => {
    const { result } = renderHook(() => {
      try {
        useEntity();
      } catch (error) {
        return error;
      }
      return null;
    });

    expect(result.current).toBeInstanceOf(Error);
  });

  it('provides initialEntityId to consumers', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <EntityProvider initialEntityId="entity-1">{children}</EntityProvider>
    );

    const { result } = renderHook(() => useEntity(), { wrapper });

    expect(result.current.entityId).toBe('entity-1');
  });

  it('updates entityId and persists to localStorage', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <EntityProvider initialEntityId="entity-1">{children}</EntityProvider>
    );

    const { result } = renderHook(() => useEntity(), { wrapper });

    act(() => {
      result.current.setEntityId('entity-2');
    });

    expect(result.current.entityId).toBe('entity-2');
    expect(localStorage.getItem('selectedEntityId')).toBe('entity-2');
  });

  it('useRequiredEntity throws if no entity set', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <EntityProvider initialEntityId={undefined}>{children}</EntityProvider>
    );

    const { result } = renderHook(() => {
      try {
        useRequiredEntity();
      } catch (error) {
        return error;
      }
      return null;
    }, { wrapper });

    expect(result.current).toBeInstanceOf(Error);
  });
});
