import { describe, expect, it, vi } from 'vitest';
import type { Supabase } from '@/shared/supabase';
import { listClients } from '@/features/clients/queries';

describe('clients queries', () => {
  describe('listClients', () => {
    it('calls RPC with default params', async () => {
      const rpc = vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null });
      const client = { rpc } as unknown as Supabase;

      const result = await listClients(client, 'entity-1');

      expect(rpc).toHaveBeenCalledWith('list_clients_with_stats', {
        entity_id: 'entity-1',
        search_query: '',
        sort_by: 'created_desc',
        limit_count: 20,
        offset_count: 0,
      });
      expect(result).toEqual([{ id: '1' }]);
    });

    it('passes search, sort, and pagination params', async () => {
      const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
      const client = { rpc } as unknown as Supabase;

      await listClients(client, 'entity-1', {
        search: 'maya',
        sortBy: 'spent_desc',
        limit: 10,
        offset: 20,
      });

      expect(rpc).toHaveBeenCalledWith('list_clients_with_stats', {
        entity_id: 'entity-1',
        search_query: 'maya',
        sort_by: 'spent_desc',
        limit_count: 10,
        offset_count: 20,
      });
    });

    it('throws on Supabase error', async () => {
      const rpc = vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') });
      const client = { rpc } as unknown as Supabase;

      await expect(listClients(client, 'entity-1')).rejects.toThrow('DB error');
    });
  });
});
