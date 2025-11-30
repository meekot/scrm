import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  formatNumber,
  formatDuration,
} from '@/shared/lib/formatters';

describe('formatCurrency', () => {
  it('formats currency using entity defaults (EUR, fr-FR)', () => {
    // fr-FR uses narrow non-breaking space (\u202f) between number and currency
    const result = formatCurrency(123.45);
    expect(result).toContain('123,45');
    expect(result).toContain('€');
  });

  it('formats zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0,00');
    expect(result).toContain('€');
  });

  it('returns "-" for null', () => {
    expect(formatCurrency(null)).toBe('-');
  });

  it('returns "-" for undefined', () => {
    expect(formatCurrency(undefined)).toBe('-');
  });

  it('allows currency override', () => {
    expect(formatCurrency(123.45, { currency: 'USD', locale: 'en-US' })).toBe('$123.45');
  });

  it('allows locale override', () => {
    expect(formatCurrency(1234.56, { locale: 'en-US' })).toContain('1,234.56');
  });

  it('handles decimal precision overrides', () => {
    const result = formatCurrency(123.456, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
    expect(result).toContain('123,456');
    expect(result).toContain('€');
  });
});

describe('formatDate', () => {
  it('formats Date object using entity defaults', () => {
    const date = new Date('2025-11-30T14:30:00Z');
    const result = formatDate(date);
    // fr-FR with Europe/Paris timezone
    expect(result).toMatch(/30\/11\/2025/);
  });

  it('formats date string', () => {
    const result = formatDate('2025-11-30');
    expect(result).toMatch(/30\/11\/2025/);
  });

  it('formats timestamp', () => {
    const timestamp = new Date('2025-11-30').getTime();
    const result = formatDate(timestamp);
    expect(result).toMatch(/30\/11\/2025/);
  });

  it('allows dateStyle override', () => {
    const date = new Date('2025-11-30');
    const result = formatDate(date, { dateStyle: 'long' });
    // fr-FR long format includes month name
    expect(result).toContain('novembre');
  });

  it('allows locale override', () => {
    const date = new Date('2025-11-30');
    const result = formatDate(date, { locale: 'en-US' });
    // Short date style may use 2-digit year (11/30/25) or 4-digit depending on locale
    expect(result).toMatch(/11\/30\/(20)?25/);
  });
});

describe('formatDateTime', () => {
  it('formats date and time using entity defaults', () => {
    const date = new Date('2025-11-30T14:30:00Z');
    const result = formatDateTime(date);
    // Should contain both date and time
    expect(result).toMatch(/30\/11\/2025/);
    expect(result).toMatch(/:/); // Contains time separator
  });

  it('allows style overrides', () => {
    const date = new Date('2025-11-30T14:30:00Z');
    const result = formatDateTime(date, { dateStyle: 'medium', timeStyle: 'short' });
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatTime', () => {
  it('formats time using entity defaults', () => {
    const date = new Date('2025-11-30T14:30:00Z');
    const result = formatTime(date);
    // Should be time only with timezone applied
    expect(result).toMatch(/:/);
    expect(result).not.toMatch(/30\/11/); // Should not contain date
  });

  it('formats time from string', () => {
    const result = formatTime('2025-11-30T09:15:00Z');
    expect(result).toMatch(/:/);
  });

  it('allows timeStyle override', () => {
    const date = new Date('2025-11-30T14:30:00Z');
    const result = formatTime(date, { timeStyle: 'medium' });
    expect(result).toMatch(/:/);
  });
});

describe('formatNumber', () => {
  it('formats number using entity defaults (fr-FR)', () => {
    // fr-FR uses narrow non-breaking space (\u202f) as thousands separator
    const result = formatNumber(1234.56);
    expect(result).toContain('234,56');
    expect(result).toMatch(/1.234,56/); // . matches the space character
  });

  it('formats zero correctly', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('returns "-" for null', () => {
    expect(formatNumber(null)).toBe('-');
  });

  it('returns "-" for undefined', () => {
    expect(formatNumber(undefined)).toBe('-');
  });

  it('allows locale override', () => {
    expect(formatNumber(1234.56, { locale: 'en-US' })).toBe('1,234.56');
  });

  it('allows decimal precision control', () => {
    expect(formatNumber(123.456, { minimumFractionDigits: 3, maximumFractionDigits: 3 })).toBe(
      '123,456'
    );
  });
});

describe('formatDuration', () => {
  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30min');
  });

  it('formats minutes only', () => {
    expect(formatDuration(45)).toBe('45min');
  });

  it('formats hours only', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('formats multiple hours', () => {
    expect(formatDuration(150)).toBe('2h 30min');
  });

  it('returns "-" for null', () => {
    expect(formatDuration(null)).toBe('-');
  });

  it('returns "-" for undefined', () => {
    expect(formatDuration(undefined)).toBe('-');
  });

  it('returns "-" for zero', () => {
    expect(formatDuration(0)).toBe('-');
  });
});
