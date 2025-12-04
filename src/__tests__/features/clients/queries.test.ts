import { describe, expect, it, vi } from 'vitest';
import type { Supabase } from '@/shared/supabase';
import { listClients } from '@/features/clients/queries';
import type { ClientWithStats } from '@/features/clients/queries';

type QueryResult = {
  data: ClientWithStats[] | null;
  error: Error | null;
};

const createListClientsMock = (orderResult: QueryResult) => {
  const order = vi.fn(async () => orderResult);
  const eq = vi.fn((column: string, value: string) => ({ order }));
  const select = vi.fn((query: string) => ({ eq }));
  const from = vi.fn((table: string) => ({ select }));
  const client = { from } as unknown as Supabase;

  return { order, eq, select, from, client };
};

describe('clients queries', () => {
  describe('listClients', () => {
    it('fetches clients with nested appointments data', async () => {
      const mockData = [
        {
          id: 'client-1',
          name: 'John Doe',
          phone: '+33612345678',
          instagram: '@johndoe',
          lead_source: null,
          display_number: 1,
          entity_id: 'entity-1',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          appointments: [
            {
              id: 'appt-1',
              service_id: 'service-1',
              price: 50,
              date: '2025-01-15',
              time: '10:00',
              created_at: '2025-01-01T00:00:00Z',
            },
          ],
        },
        {
          id: 'client-2',
          name: 'Jane Smith',
          phone: '+33687654321',
          instagram: null,
          lead_source: 'instagram',
          display_number: 2,
          entity_id: 'entity-1',
          created_at: '2025-01-02T00:00:00Z',
          updated_at: '2025-01-02T00:00:00Z',
          appointments: [],
        },
      ];

      const { order, eq, select, from, client } = createListClientsMock({
        data: mockData,
        error: null,
      });

      const result = await listClients(client, 'entity-1');

      expect(from).toHaveBeenCalledWith('clients');
      expect(select).toHaveBeenCalledWith(expect.stringContaining('id'));
      expect(select).toHaveBeenCalledWith(expect.stringContaining('name'));
      expect(select).toHaveBeenCalledWith(expect.stringContaining('appointments:appointments'));
      expect(eq).toHaveBeenCalledWith('entity_id', 'entity-1');
      expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockData);
    });

    it('returns empty array when no clients exist', async () => {
      const { client } = createListClientsMock({ data: [], error: null });

      const result = await listClients(client, 'entity-1');

      expect(result).toEqual([]);
    });

    it('throws on Supabase error', async () => {
      const { client } = createListClientsMock({
        data: null,
        error: new Error('DB error'),
      });

      await expect(listClients(client, 'entity-1')).rejects.toThrow('DB error');
    });

    it('properly scopes query to entity_id', async () => {
      const { eq, client } = createListClientsMock({ data: [], error: null });

      await listClients(client, 'entity-xyz');

      expect(eq).toHaveBeenCalledWith('entity_id', 'entity-xyz');
    });

    it('includes all required client fields in select', async () => {
      const { select, client } = createListClientsMock({ data: [], error: null });

      await listClients(client, 'entity-1');

      expect(select).toHaveBeenCalled();
      expect(select.mock.calls[0]).toBeDefined();
      const selectCall = select.mock.calls[0][0] as string;
      expect(selectCall).toContain('id');
      expect(selectCall).toContain('name');
      expect(selectCall).toContain('phone');
      expect(selectCall).toContain('instagram');
      expect(selectCall).toContain('lead_source');
      expect(selectCall).toContain('display_number');
      expect(selectCall).toContain('entity_id');
      expect(selectCall).toContain('created_at');
      expect(selectCall).toContain('updated_at');
      expect(selectCall).toContain('appointments:appointments');
    });

    it('includes required appointment fields in nested select', async () => {
      const { select, client } = createListClientsMock({ data: [], error: null });

      await listClients(client, 'entity-1');

      expect(select).toHaveBeenCalled();
      expect(select.mock.calls[0]).toBeDefined();
      const selectCall = select.mock.calls[0][0] as string;
      expect(selectCall).toContain('service_id');
      expect(selectCall).toContain('price');
      expect(selectCall).toContain('date');
      expect(selectCall).toContain('time');
    });
  });
});
