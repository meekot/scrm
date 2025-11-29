import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';
import { createService, updateService, deleteService } from '@/features/services/mutations';

describe('services mutations', () => {
  it('creates service with defaults', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'new' }, error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select, single }));
    const from = vi.fn(() => ({ insert }));
    const client = { from } as unknown as SupabaseClient<Database>;

    const result = await createService(client, 'entity-1', {
      name: 'Haircut',
      price: undefined,
      duration: undefined,
      description: undefined,
    });

    expect(from).toHaveBeenCalledWith('services');
    expect(insert).toHaveBeenCalledWith({
      entity_id: 'entity-1',
      name: 'Haircut',
      price: 0,
      duration: null,
      description: null,
      display_number: 0,
    });
    expect(select).toHaveBeenCalledWith('*');
    expect(result).toEqual({ id: 'new' });
  });

  it('updates service scoped by entity and id', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: '1' }, error: null });
    const select = vi.fn(() => ({ single }));
    const eqId = vi.fn(() => ({ select, single }));
    const eqEntity = vi.fn(() => ({ eq: eqId }));
    const update = vi.fn(() => ({ eq: eqEntity }));
    const from = vi.fn(() => ({ update }));
    const client = { from } as unknown as SupabaseClient<Database>;

    const result = await updateService(client, 'entity-1', 'svc-1', {
      name: 'Updated',
      price: 40,
    });

    expect(from).toHaveBeenCalledWith('services');
    expect(update).toHaveBeenCalledWith({
      name: 'Updated',
      price: 40,
      duration: null,
      description: null,
    });
    expect(eqEntity).toHaveBeenCalledWith('entity_id', 'entity-1');
    expect(eqId).toHaveBeenCalledWith('id', 'svc-1');
    expect(select).toHaveBeenCalledWith('*');
    expect(result).toEqual({ id: '1' });
  });

  it('deletes service scoped by entity and id', async () => {
    const eqId = vi.fn().mockResolvedValue({ error: null });
    const eqEntity = vi.fn(() => ({ eq: eqId }));
    const remove = vi.fn(() => ({ eq: eqEntity }));
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
      return { delete: remove };
    });
    const client = { from } as unknown as SupabaseClient<Database>;

    const result = await deleteService(client, 'entity-1', 'svc-1');

    expect(from).toHaveBeenCalledWith('services');
    expect(remove).toHaveBeenCalled();
    expect(eqEntity).toHaveBeenCalledWith('entity_id', 'entity-1');
    expect(eqId).toHaveBeenCalledWith('id', 'svc-1');
    expect(result).toEqual({ success: true });
  });

  it('propagates errors', async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: new Error('fail') });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select, single }));
    const from = vi.fn(() => ({ insert }));
    const client = { from } as unknown as SupabaseClient<Database>;

    await expect(
      createService(client, 'entity-1', { name: 'x', price: undefined, duration: undefined, description: undefined })
    ).rejects.toThrow('fail');
  });

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
    const client = { from } as unknown as SupabaseClient<Database>;

    await expect(deleteService(client, 'entity-1', 'svc-1')).rejects.toThrow(
      'Cannot delete service that is used in appointments.'
    );
  });

  it('deletes when no appointments linked', async () => {
    const selectAppointments = vi.fn(() => ({
      eq: () => ({
        eq: () => ({
          limit: () => ({ data: [], error: null }),
        }),
      }),
    }));
    const deleteFn = vi.fn(() => ({ eq: () => ({ eq: () => ({}) }) }));
    const from = vi.fn().mockImplementation((table: string) => {
      if (table === 'appointments') {
        return {
          select: () => selectAppointments(),
        };
      }
      return { delete: deleteFn };
    });
    const client = { from } as unknown as SupabaseClient<Database>;

    const result = await deleteService(client, 'entity-1', 'svc-1');

    expect(selectAppointments).toHaveBeenCalled();
    expect(deleteFn).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });
});
