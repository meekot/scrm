/**
 * Centralized formatting utilities for currency, dates, times, and numbers.
 * All formatters use entity configuration from @/shared/config/entity.ts
 */

import { entityDefaults } from '@/shared/config/entity';

/**
 * Format options for currency
 */
export type CurrencyFormatOptions = {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

/**
 * Format options for dates
 */
export type DateFormatOptions = {
  locale?: string;
  timeZone?: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
};

/**
 * Format a number as currency using entity defaults
 * @param value - The number to format
 * @param options - Optional overrides for locale, currency, etc.
 * @returns Formatted currency string (e.g., "€123.45")
 *
 * @example
 * formatCurrency(123.45) // "€123.45" (using entity defaults)
 * formatCurrency(123.45, { currency: 'USD', locale: 'en-US' }) // "$123.45"
 * formatCurrency(null) // "-"
 */
export function formatCurrency(
  value: number | null | undefined,
  options?: CurrencyFormatOptions
): string {
  if (value === null || value === undefined) return '-';

  const locale = options?.locale ?? entityDefaults.locale;
  const currency = options?.currency ?? entityDefaults.currency;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(Number(value));
}

/**
 * Format a date using entity defaults
 * @param date - Date string, Date object, or timestamp
 * @param options - Optional overrides for locale, timezone, style
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date()) // "30/11/2025" (fr-FR style)
 * formatDate('2025-11-30') // "30/11/2025"
 * formatDate(new Date(), { dateStyle: 'long' }) // "30 novembre 2025"
 */
export function formatDate(
  date: Date | string | number,
  options?: Omit<DateFormatOptions, 'timeStyle'>
): string {
  try {
      const locale = options?.locale ?? entityDefaults.locale;
      const timeZone = options?.timeZone ?? entityDefaults.timeZone;

      const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

      return new Intl.DateTimeFormat(locale, {
        timeZone,
        dateStyle: options?.dateStyle ?? 'short',
      }).format(dateObj);
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.name, {
        date,
        options
      })
    }
    throw e;
  }
}

/**
 * Format a date and time using entity defaults
 * @param date - Date string, Date object, or timestamp
 * @param options - Optional overrides for locale, timezone, styles
 * @returns Formatted date-time string
 *
 * @example
 * formatDateTime(new Date()) // "30/11/2025 14:30"
 * formatDateTime(new Date(), { dateStyle: 'medium', timeStyle: 'short' }) // "30 nov. 2025, 14:30"
 */
export function formatDateTime(date: Date | string | number, options?: DateFormatOptions): string {
  const locale = options?.locale ?? entityDefaults.locale;
  const timeZone = options?.timeZone ?? entityDefaults.timeZone;

  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    dateStyle: options?.dateStyle ?? 'short',
    timeStyle: options?.timeStyle ?? 'short',
  }).format(dateObj);
}

/**
 * Format time only using entity defaults
 * @param date - Date string, Date object, or timestamp
 * @param options - Optional overrides for locale, timezone, style
 * @returns Formatted time string
 *
 * @example
 * formatTime(new Date()) // "14:30"
 * formatTime('2025-11-30T14:30:00') // "14:30"
 */
export function formatTime(
  date: Date | string | number,
  options?: Omit<DateFormatOptions, 'dateStyle'>
): string {
  const locale = options?.locale ?? entityDefaults.locale;
  const timeZone = options?.timeZone ?? entityDefaults.timeZone;

  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    timeZone,
    timeStyle: options?.timeStyle ?? 'short',
  }).format(dateObj);
}

/**
 * Format a number using entity defaults
 * @param value - The number to format
 * @param options - Optional overrides for locale and decimal places
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234.56) // "1 234,56" (fr-FR style)
 * formatNumber(1234.56, { locale: 'en-US' }) // "1,234.56"
 */
export function formatNumber(
  value: number | null | undefined,
  options?: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  if (value === null || value === undefined) return '-';

  const locale = options?.locale ?? entityDefaults.locale;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: options?.minimumFractionDigits,
    maximumFractionDigits: options?.maximumFractionDigits,
  }).format(Number(value));
}

/**
 * Format a duration in minutes to human-readable format
 * @param minutes - Duration in minutes
 * @returns Formatted duration (e.g., "1h 30min", "45min")
 *
 * @example
 * formatDuration(90) // "1h 30min"
 * formatDuration(45) // "45min"
 * formatDuration(120) // "2h"
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return '-';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}
