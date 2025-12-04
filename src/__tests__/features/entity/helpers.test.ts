import { describe, expect, it, vi } from 'vitest';
import type { Supabase } from '@/shared/supabase';
import {
  getUserEntities,
  getEntityById,
  checkEntityMembership,
  resolveDefaultEntity,
} from '@/features/entity/helpers';

describe('entity helpers', () => {
  describe('getUserEntities', () => {
    it('fetches entities for a user', async () => {
      const mockData = [
        {
          entity_id: 'entity-1',
          role: 'OWNER',
          entity: {
            id: 'entity-1',
            name: 'Test Entity',
            display_number: 1,
            created_at: '2025-01-01T00:00:00Z',
          },
        },
      ];

      const eq = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const select = vi.fn(() => ({ eq }));
      const from = vi.fn(() => ({ select }));
      const client = { from } as unknown as Supabase;

      const result = await getUserEntities(client, 'user-1');

      expect(from).toHaveBeenCalledWith('entity_members');
      expect(select).toHaveBeenCalledWith(
        'entity_id, role, entity:entity_id(id, name, display_number, created_at)'
      );
      expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(result).toEqual(mockData);
    });

    it('throws on Supabase error', async () => {
      const eq = vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') });
      const select = vi.fn(() => ({ eq }));
      const from = vi.fn(() => ({ select }));
      const client = { from } as unknown as Supabase;

      await expect(getUserEntities(client, 'user-1')).rejects.toThrow('DB error');
    });
  });

  describe('getEntityById', () => {
    it('fetches a single entity by ID', async () => {
      const mockEntity = {
        id: 'entity-1',
        name: 'Test Entity',
        display_number: 1,
        created_at: '2025-01-01T00:00:00Z',
      };

      const single = vi.fn().mockResolvedValue({ data: mockEntity, error: null });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      const from = vi.fn(() => ({ select }));
      const client = { from } as unknown as Supabase;

      const result = await getEntityById(client, 'entity-1');

      expect(from).toHaveBeenCalledWith('entity');
      expect(select).toHaveBeenCalledWith('*');
      expect(eq).toHaveBeenCalledWith('id', 'entity-1');
      expect(single).toHaveBeenCalled();
      expect(result).toEqual(mockEntity);
    });

    it('throws on Supabase error', async () => {
      const single = vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') });
      const eq = vi.fn(() => ({ single }));
      const select = vi.fn(() => ({ eq }));
      const from = vi.fn(() => ({ select }));
      const client = { from } as unknown as Supabase;

      await expect(getEntityById(client, 'entity-1')).rejects.toThrow('Not found');
    });
  });

  describe('checkEntityMembership', () => {
    it('returns membership data when user is a member', async () => {
      const mockMembership = { role: 'OWNER' };

      const single = vi.fn().mockResolvedValue({ data: mockMembership, error: null });
      const eq2 = vi.fn(() => ({ single }));
      const eq1 = vi.fn(() => ({ eq: eq2 }));
      const select = vi.fn(() => ({ eq: eq1 }));
      const from = vi.fn(() => ({ select }));
      const client = { from } as unknown as Supabase;

      const result = await checkEntityMembership(client, 'entity-1', 'user-1');

      expect(from).toHaveBeenCalledWith('entity_members');
      expect(select).toHaveBeenCalledWith('role');
      expect(eq1).toHaveBeenCalledWith('entity_id', 'entity-1');
      expect(eq2).toHaveBeenCalledWith('user_id', 'user-1');
      expect(result).toEqual(mockMembership);
    });

    it('returns null when membership not found (PGRST116 error)', async () => {
      const notFoundError = { code: 'PGRST116', message: 'Not found' };
      const single = vi.fn().mockResolvedValue({ data: null, error: notFoundError });
      const eq2 = vi.fn(() => ({ single }));
      const eq1 = vi.fn(() => ({ eq: eq2 }));
      const select = vi.fn(() => ({ eq: eq1 }));
      const from = vi.fn(() => ({ select }));
      const client = { from } as unknown as Supabase;

      const result = await checkEntityMembership(client, 'entity-1', 'user-1');

      expect(result).toBeNull();
    });

    it('throws on other Supabase errors', async () => {
      const dbError = { code: 'DB_ERROR', message: 'Database failure' };
      const single = vi.fn().mockResolvedValue({ data: null, error: dbError });
      const eq2 = vi.fn(() => ({ single }));
      const eq1 = vi.fn(() => ({ eq: eq2 }));
      const select = vi.fn(() => ({ eq: eq1 }));
      const from = vi.fn(() => ({ select }));
      const client = { from } as unknown as Supabase;

      await expect(checkEntityMembership(client, 'entity-1', 'user-1')).rejects.toThrow();
    });
  });

  describe('resolveDefaultEntity', () => {
    it('returns null when user has no entities', async () => {
      const eq = vi.fn().mockResolvedValue({ data: [], error: null });
      const select = vi.fn(() => ({ eq }));
      const from = vi.fn(() => ({ select }));
      const client = { from } as unknown as Supabase;

      const result = await resolveDefaultEntity(client, 'user-1');

      expect(result).toBeNull();
    });

    it('returns the entity ID when user has exactly one entity', async () => {
      const mockData = [
        {
          entity_id: 'entity-1',
          role: 'OWNER',
          entity: {
            id: 'entity-1',
            name: 'Test Entity',
            display_number: 1,
            created_at: '2025-01-01T00:00:00Z',
          },
        },
      ];

      const eq = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const select = vi.fn(() => ({ eq }));
      const from = vi.fn(() => ({ select }));
      const client = { from } as unknown as Supabase;

      const result = await resolveDefaultEntity(client, 'user-1');

      expect(result).toBe('entity-1');
    });

    it('returns the first entity ID when user has multiple entities', async () => {
      const mockData = [
        {
          entity_id: 'entity-1',
          role: 'OWNER',
          entity: {
            id: 'entity-1',
            name: 'Entity 1',
            display_number: 1,
            created_at: '2025-01-01T00:00:00Z',
          },
        },
        {
          entity_id: 'entity-2',
          role: 'MEMBER',
          entity: {
            id: 'entity-2',
            name: 'Entity 2',
            display_number: 2,
            created_at: '2025-01-02T00:00:00Z',
          },
        },
      ];

      const eq = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const select = vi.fn(() => ({ eq }));
      const from = vi.fn(() => ({ select }));
      const client = { from } as unknown as Supabase;

      const result = await resolveDefaultEntity(client, 'user-1');

      expect(result).toBe('entity-1');
    });

    it('returns null when getUserEntities returns null', async () => {
      const eq = vi.fn().mockResolvedValue({ data: null, error: null });
      const select = vi.fn(() => ({ eq }));
      const from = vi.fn(() => ({ select }));
      const client = { from } as unknown as Supabase;

      const result = await resolveDefaultEntity(client, 'user-1');

      expect(result).toBeNull();
    });
  });
});
