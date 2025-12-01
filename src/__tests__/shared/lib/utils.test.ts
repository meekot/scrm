import { describe, it, expect } from 'vitest';
import { cn } from '@/shared/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges multiple class strings', () => {
      const result = cn('foo', 'bar', 'baz');
      expect(result).toBe('foo bar baz');
    });

    it('handles conditional classes', () => {
      const result = cn('foo', false && 'bar', 'baz');
      expect(result).toBe('foo baz');
    });

    it('handles undefined and null values', () => {
      const result = cn('foo', undefined, null, 'bar');
      expect(result).toBe('foo bar');
    });

    it('handles empty strings', () => {
      const result = cn('foo', '', 'bar');
      expect(result).toBe('foo bar');
    });

    it('merges Tailwind classes correctly (removes conflicts)', () => {
      // twMerge should keep the last conflicting class
      const result = cn('px-2', 'px-4');
      expect(result).toBe('px-4');
    });

    it('merges multiple Tailwind class conflicts', () => {
      const result = cn('text-sm text-base', 'text-lg');
      expect(result).toBe('text-lg');
    });

    it('handles object-style class inputs', () => {
      const result = cn({
        foo: true,
        bar: false,
        baz: true,
      });
      expect(result).toBe('foo baz');
    });

    it('handles array inputs', () => {
      const result = cn(['foo', 'bar'], 'baz');
      expect(result).toBe('foo bar baz');
    });

    it('handles mixed input types', () => {
      const result = cn('foo', { bar: true, qux: false }, ['baz'], undefined, null);
      expect(result).toBe('foo bar baz');
    });

    it('handles no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('preserves non-conflicting Tailwind classes', () => {
      const result = cn('px-4 py-2', 'mt-2 mb-4');
      expect(result).toBe('px-4 py-2 mt-2 mb-4');
    });

    it('merges responsive variants correctly', () => {
      const result = cn('text-sm md:text-base', 'md:text-lg');
      expect(result).toBe('text-sm md:text-lg');
    });

    it('handles hover and focus variants', () => {
      const result = cn('hover:bg-blue-500', 'hover:bg-red-500');
      expect(result).toBe('hover:bg-red-500');
    });

    it('correctly merges border radius classes', () => {
      const result = cn('rounded-md', 'rounded-lg');
      expect(result).toBe('rounded-lg');
    });

    it('correctly merges background color classes', () => {
      const result = cn('bg-red-500', 'bg-blue-600');
      expect(result).toBe('bg-blue-600');
    });

    it('handles complex real-world example', () => {
      const isActive = true;
      const isDisabled = false;
      const result = cn(
        'px-4 py-2 rounded-md text-sm font-medium',
        isActive && 'bg-blue-500 text-white',
        isDisabled && 'opacity-50 cursor-not-allowed',
        'hover:bg-blue-600'
      );
      expect(result).toContain('px-4');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('text-white');
      expect(result).not.toContain('opacity-50');
    });
  });
});
