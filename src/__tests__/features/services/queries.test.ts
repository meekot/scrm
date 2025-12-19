import { describe, expect, it, vi } from 'vitest';
import type { Supabase } from '@/shared/supabase';
import { getServiceGain, listServices } from '@/features/services/queries';

describe('services queries', () => {
  it('lists services for an entity ordered by display_number', async () => {
    const order = vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq, order }));
    const from = vi.fn(() => ({ select }));
    const client = { from } as unknown as Supabase;

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
    const client = { from } as unknown as Supabase;

    await expect(listServices(client, 'entity-1')).rejects.toThrow('fail');
  });

  it('fetches service gain for an entity', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{ service_id: 'service-1', total_revenue: 120, appointments_count: 3 }],
      error: null,
    });
    const client = { rpc } as unknown as Supabase;

    const result = await getServiceGain(client, 'entity-1');

    expect(rpc).toHaveBeenCalledWith('get_service_gain', { entity_id: 'entity-1' });
    expect(result).toEqual([
      { service_id: 'service-1', total_revenue: 120, appointments_count: 3 },
    ]);
  });

  it('throws on service gain error', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: new Error('boom') });
    const client = { rpc } as unknown as Supabase;

    await expect(getServiceGain(client, 'entity-1')).rejects.toThrow('boom');
  });
});
