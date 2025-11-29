import { describe, expect, it } from 'vitest';
import { clientInputSchema } from '@/features/clients/schemas';

describe('clientInputSchema', () => {
  it('accepts valid client', () => {
    const result = clientInputSchema.safeParse({
      name: 'Alice',
      phone: '+33612345678',
    });
    expect(result.success).toBe(true);
  });

  it('requires phone', () => {
    const result = clientInputSchema.safeParse({
      name: 'Alice',
      phone: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone', () => {
    const result = clientInputSchema.safeParse({
      name: 'Alice',
      phone: '123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects instagram starting with @', () => {
    const result = clientInputSchema.safeParse({
      name: 'Alice',
      phone: '+33612345678',
      instagram: '@alice',
    });
    expect(result.success).toBe(false);
  });
});
