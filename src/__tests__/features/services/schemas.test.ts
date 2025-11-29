import { describe, expect, it } from 'vitest';
import { serviceInputSchema } from '@/features/services/schemas';

describe('serviceInputSchema', () => {
  it('accepts valid input', () => {
    const parsed = serviceInputSchema.parse({
      name: 'Haircut',
      price: 50,
      duration: 60,
      description: 'Standard haircut',
    });

    expect(parsed).toEqual({
      name: 'Haircut',
      price: 50,
      duration: 60,
      description: 'Standard haircut',
    });
  });

  it('requires name', () => {
    const result = serviceInputSchema.safeParse({
      name: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['name']);
    }
  });

  it('disallows negative price', () => {
    const result = serviceInputSchema.safeParse({
      name: 'Test',
      price: -10,
    });

    expect(result.success).toBe(false);
  });

  it('disallows non-positive duration', () => {
    const result = serviceInputSchema.safeParse({
      name: 'Test',
      duration: 0,
    });

    expect(result.success).toBe(false);
  });

  it('allows zero price', () => {
    const result = serviceInputSchema.safeParse({
      name: 'Free consult',
      price: 0,
    });

    expect(result.success).toBe(true);
  });
});
