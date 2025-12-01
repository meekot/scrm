import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/supabase/types';
import {
  getAppointmentsDateRangeCount,
  getAppointmentsRevenueTotal,
  getEntityTableCount,
  type Supabase,
} from '@/features/analytics/queries';

function createSupabaseMock() {
  const select = vi.fn();
  const from = vi.fn(() => ({ select }));
  const supabase = { from } as unknown as SupabaseClient<Database>;

  return { supabase, from, select };
}

describe('getEntityTableCount', () => {
  it('returns the exact count for the given table and entity', async () => {
    const { supabase, from, select } = createSupabaseMock();
    const eq = vi.fn(() => ({ count: 7, error: null }));
    select.mockReturnValue({ eq });

    const result = await getEntityTableCount('clients', supabase as Supabase, 'entity-1');

    expect(from).toHaveBeenCalledWith('clients');
    expect(select).toHaveBeenCalledWith('id', { count: 'exact', head: true });
    expect(eq).toHaveBeenCalledWith('entity_id', 'entity-1');
    expect(result).toBe(7);
  });

  it('throws when Supabase returns an error', async () => {
    const { supabase, select } = createSupabaseMock();
    const eq = vi.fn(() => ({ count: null, error: new Error('boom') }));
    select.mockReturnValue({ eq });

    await expect(getEntityTableCount('services', supabase as Supabase, 'entity-2')).rejects.toThrow('boom');
  });
});

describe('getAppointmentsDateRangeCount', () => {
  it('counts appointments within the provided date range and statuses', async () => {
    const { supabase, from, select } = createSupabaseMock();
    const inFn = vi.fn(() => queryBuilder);
    const lt = vi.fn(() => queryBuilder);
    const queryBuilder = {
      lt,
      in: inFn,
      then: (onFulfilled: (value: { count: number; error: null }) => unknown, onRejected?: (reason: unknown) => unknown) =>
        Promise.resolve({ count: 3, error: null }).then(onFulfilled, onRejected),
    };
    const gte = vi.fn(() => queryBuilder);
    const eq = vi.fn(() => ({ gte }));
    select.mockReturnValue({ eq });

    const result = await getAppointmentsDateRangeCount(supabase as Supabase, 'entity-1', {
      startDate: '2024-01-01',
      endDate: '2024-01-02',
    });

    expect(from).toHaveBeenCalledWith('appointments');
    expect(select).toHaveBeenCalledWith('id', { count: 'exact', head: true });
    expect(eq).toHaveBeenCalledWith('entity_id', 'entity-1');
    expect(gte).toHaveBeenCalledWith('date', '2024-01-01');
    expect(lt).toHaveBeenCalledWith('date', '2024-01-02');
    expect(inFn).toHaveBeenCalledWith('status', ['scheduled', 'completed']);
    expect(result).toBe(3);
  });
});

describe('getAppointmentsRevenueTotal', () => {
  it('sums revenue for completed appointments within the date range', async () => {
    const { supabase, from, select } = createSupabaseMock();
    const inFn = vi.fn(() => revenueQueryBuilder);
    const lt = vi.fn(() => revenueQueryBuilder);
    const revenueQueryBuilder = {
      lt,
      in: inFn,
      single: vi.fn().mockResolvedValue({ data: { total: 250 }, error: null }),
    };
    const gte = vi.fn(() => revenueQueryBuilder);
    const eq = vi.fn(() => ({ gte }));
    select.mockReturnValue({ eq });

    const result = await getAppointmentsRevenueTotal(supabase as Supabase, 'entity-5', {
      startDate: '2024-02-01',
      endDate: '2024-03-01',
    });

    expect(from).toHaveBeenCalledWith('appointments');
    expect(select).toHaveBeenCalledWith('total:price.sum()');
    expect(eq).toHaveBeenCalledWith('entity_id', 'entity-5');
    expect(gte).toHaveBeenCalledWith('date', '2024-02-01');
    expect(lt).toHaveBeenCalledWith('date', '2024-03-01');
    expect(inFn).toHaveBeenCalledWith('status', ['completed']);
    expect(result).toBe(250);
  });

  it('returns zero when Supabase reports no revenue', async () => {
    const { supabase, select } = createSupabaseMock();
    const revenueQueryBuilder = {
      lt: vi.fn(() => revenueQueryBuilder),
      in: vi.fn(() => revenueQueryBuilder),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    const gte = vi.fn(() => revenueQueryBuilder);
    const eq = vi.fn(() => ({ gte }));
    select.mockReturnValue({ eq });

    const result = await getAppointmentsRevenueTotal(supabase as Supabase, 'entity-7', {
      startDate: '2024-03-01',
    });

    expect(result).toBe(0);
  });
});
