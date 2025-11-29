import { describe, it, expect } from 'vitest';
import { signInSchema } from '@/features/auth/schemas';

describe('signInSchema', () => {
  it('should validate correct email and password', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.password).toBe('password123');
    }
  });

  it('should reject invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Invalid email address');
    }
  });

  it('should reject empty email', () => {
    const result = signInSchema.safeParse({
      email: '',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      // Empty string fails email validation first
      expect(result.error.issues[0].message).toBe('Invalid email address');
    }
  });

  it('should reject empty password', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Password is required');
    }
  });

  it('should reject missing fields', () => {
    const result = signInSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
