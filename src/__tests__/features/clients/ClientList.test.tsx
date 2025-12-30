import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Supabase } from '@/shared/supabase';
import { ClientList } from '@/features/clients/components/ClientList';
import type { ClientWithStats } from '@/features/clients/queries';

const mockUseInfiniteClients = vi.fn();
const mockUseDeleteClient = vi.fn();

vi.mock('@/features/clients/hooks', () => ({
  useInfiniteClients: (...args: unknown[]) => mockUseInfiniteClients(...args),
  useDeleteClient: (...args: unknown[]) => mockUseDeleteClient(...args),
}));

describe('ClientList', () => {
  beforeEach(() => {
    mockUseDeleteClient.mockReturnValue({ isPending: false, mutateAsync: vi.fn() });

    (globalThis as unknown as { IntersectionObserver?: typeof IntersectionObserver }).IntersectionObserver =
      class {
        observe() {}
        disconnect() {}
        unobserve() {}
      } as unknown as typeof IntersectionObserver;
  });

  it('renders client stats from RPC data', () => {
    const clientData: ClientWithStats = {
      id: 'client-1',
      name: 'Maya',
      phone: '+33612345678',
      instagram: '@maya',
      lead_source: 'referral',
      display_number: 12,
      entity_id: 'entity-1',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      appointment_count: 3,
      total_spent: 120,
      last_appointment_at: '2025-02-01T10:00:00Z',
    };

    mockUseInfiniteClients.mockReturnValue({
      data: { pages: [[clientData]] },
      isLoading: false,
      isError: false,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    render(<ClientList client={{} as Supabase} entityId="entity-1" />);

    expect(screen.getByText('#12 Maya')).toBeInTheDocument();
    expect(screen.getByText('Total appointments: 3')).toBeInTheDocument();
    expect(screen.getByText(/Total spent:/)).toBeInTheDocument();
    expect(screen.getByText(/Last appointment:/)).toBeInTheDocument();
  });

  it('shows empty state when no clients are returned', () => {
    mockUseInfiniteClients.mockReturnValue({
      data: { pages: [[]] },
      isLoading: false,
      isError: false,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    render(<ClientList client={{} as Supabase} entityId="entity-1" />);

    expect(screen.getByText('No clients yet. Add your first one.')).toBeInTheDocument();
  });

  it('shows loading states when fetching', () => {
    mockUseInfiniteClients.mockReturnValue({
      data: { pages: [[]] },
      isLoading: true,
      isError: false,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: true,
      isFetchingNextPage: true,
    });

    render(<ClientList client={{} as Supabase} entityId="entity-1" />);

    expect(screen.getByText('Loading clients...')).toBeInTheDocument();
    expect(screen.getByText('Loading more clients...')).toBeInTheDocument();
  });
});
