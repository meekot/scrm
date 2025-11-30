import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signIn } from '@/features/auth/actions';

// Mock Next.js functions
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase client
vi.mock('@/shared/supabase/client-server', () => ({
  createClient: vi.fn(),
}));

describe('auth actions', () => {
  describe('signIn', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns error for invalid email format', async () => {
      const formData = new FormData();
      formData.append('email', 'invalid-email');
      formData.append('password', 'password123');

      const result = await signIn(null, formData);

      expect(result).toHaveProperty('error');
      expect(result?.error).toContain('email');
    });

    it('returns error for missing email', async () => {
      const formData = new FormData();
      formData.append('email', '');
      formData.append('password', 'password123');

      const result = await signIn(null, formData);

      expect(result).toHaveProperty('error');
    });

    it('returns error for missing password', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', '');

      const result = await signIn(null, formData);

      expect(result).toHaveProperty('error');
    });

    it('returns error for password shorter than 8 characters', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'short');

      const result = await signIn(null, formData);

      expect(result).toHaveProperty('error');
      expect(result?.error).toContain('8');
    });

    it('validates email and password before calling Supabase', async () => {
      const formData = new FormData();
      formData.append('email', 'not-an-email');
      formData.append('password', 'validpassword123');

      const result = await signIn(null, formData);

      // Should fail validation before reaching Supabase
      expect(result).toHaveProperty('error');
    });

    it('returns success when valid credentials are provided', async () => {
      const { createClient } = await import('@/shared/supabase/client-server');
      const mockSignIn = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          signInWithPassword: mockSignIn,
        },
      } as any);

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'validpassword123');

      const result = await signIn(null, formData);

      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'validpassword123',
      });
      expect(result).toEqual({ success: true });
    });

    it('returns error when Supabase signIn fails', async () => {
      const { createClient } = await import('@/shared/supabase/client-server');
      const mockSignIn = vi.fn().mockResolvedValue({
        error: { message: 'Invalid credentials' },
      });

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          signInWithPassword: mockSignIn,
        },
      } as any);

      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'wrongpassword');

      const result = await signIn(null, formData);

      expect(result).toEqual({ error: 'Invalid credentials' });
    });

    it('trims whitespace from email before validation', async () => {
      const { createClient } = await import('@/shared/supabase/client-server');
      const mockSignIn = vi.fn().mockResolvedValue({ error: null });

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          signInWithPassword: mockSignIn,
        },
      } as any);

      const formData = new FormData();
      formData.append('email', '  test@example.com  ');
      formData.append('password', 'validpassword123');

      const result = await signIn(null, formData);

      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'validpassword123',
      });
      expect(result).toEqual({ success: true });
    });
  });
});
