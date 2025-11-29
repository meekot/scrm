import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';
import { listServices } from '@/features/services/queries';

describe('services queries', () => {
  it('lists services for an entity ordered by display_number', async () => {
    const order = vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq, order }));
    const from = vi.fn(() => ({ select }));
    const client = { from } as unknown as SupabaseClient<Database>;

    const result = await listServices(client, 'entity-1');

    expect(from).toHaveBeenCalledWith('services');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('entity_id', 'entity-1');
    expect(order).toHaveBeenCalledWith('display_number', { ascending: true });
    expect(result).toEqual([{ id: '1' }]);
  });

  it('throws on Supabase error', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: new Error('fail') });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq, order }));
    const from = vi.fn(() => ({ select }));
    const client = { from } as unknown as SupabaseClient<Database>;

    await expect(listServices(client, 'entity-1')).rejects.toThrow('fail');
  });
});
