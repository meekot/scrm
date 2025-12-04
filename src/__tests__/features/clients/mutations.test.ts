import { describe, expect, it, vi } from 'vitest';
import type { Supabase } from '@/shared/supabase';
import { deleteClient } from '@/features/clients/mutations';

describe('clients mutations', () => {
  it('blocks delete when appointments exist', async () => {
    const from = vi.fn().mockImplementation((table: string) => {
      if (table === 'appointments') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                limit: () => ({ data: [{ id: 'app1' }], error: null }),
              }),
            }),
          }),
        };
      }
      return { delete: vi.fn() };
    });
    const client = { from } as unknown as Supabase;

    await expect(deleteClient(client, 'entity-1', 'client-1')).rejects.toThrow(
      'Cannot delete client that has appointments.'
    );
  });

  it('allows delete when no appointments', async () => {
    const deleteFn = vi.fn(() => ({ eq: () => ({ eq: () => ({}) }) }));
    const from = vi.fn().mockImplementation((table: string) => {
      if (table === 'appointments') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                limit: () => ({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      return { delete: deleteFn };
    });
    const client = { from } as unknown as Supabase;

    const result = await deleteClient(client, 'entity-1', 'client-1');

    expect(deleteFn).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });
});
