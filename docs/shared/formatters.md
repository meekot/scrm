# Centralized Formatters

**Created**: 2025-11-30
**Location**: `src/shared/lib/formatters.ts`

## Overview

All date, time, currency, and number formatting is centralized in a single module that uses entity configuration (`@/shared/config/entity.ts`) for consistent formatting across the entire application.

## Why Centralized Formatters?

1. **Entity-aware**: All formatting respects entity locale, currency, and timezone settings
2. **Consistency**: One source of truth for all formatting logic
3. **Testability**: Comprehensive unit tests ensure formatting works correctly
4. **Flexibility**: Easy to override defaults on a per-call basis
5. **Maintainability**: Changes to formatting logic happen in one place

## Available Formatters

### Currency

```typescript
formatCurrency(value: number | null | undefined, options?: CurrencyFormatOptions): string
```

**Examples**:
```typescript
formatCurrency(123.45)                    // "123,45 €" (entity defaults)
formatCurrency(123.45, {
  currency: 'USD',
  locale: 'en-US'
})                                        // "$123.45"
formatCurrency(null)                      // "-"
```

**Options**:
- `locale?: string` - Override entity locale
- `currency?: string` - Override entity currency
- `minimumFractionDigits?: number` - Default: 2
- `maximumFractionDigits?: number` - Default: 2

### Date

```typescript
formatDate(date: Date | string | number, options?: DateFormatOptions): string
```

**Examples**:
```typescript
formatDate(new Date('2025-11-30'))        // "30/11/2025" (fr-FR style)
formatDate('2025-11-30', {
  dateStyle: 'long'
})                                        // "30 novembre 2025"
formatDate('2025-11-30', {
  locale: 'en-US'
})                                        // "11/30/25"
```

**Options**:
- `locale?: string` - Override entity locale
- `timeZone?: string` - Override entity timezone
- `dateStyle?: 'full' | 'long' | 'medium' | 'short'` - Default: 'short'

### DateTime

```typescript
formatDateTime(date: Date | string | number, options?: DateFormatOptions): string
```

**Examples**:
```typescript
formatDateTime(new Date())                // "30/11/2025 14:30"
formatDateTime(new Date(), {
  dateStyle: 'medium',
  timeStyle: 'short'
})                                        // "30 nov. 2025, 14:30"
```

**Options**: Same as `formatDate` plus:
- `timeStyle?: 'full' | 'long' | 'medium' | 'short'` - Default: 'short'

### Time

```typescript
formatTime(date: Date | string | number, options?: TimeFormatOptions): string
```

**Examples**:
```typescript
formatTime(new Date())                    // "14:30"
formatTime('2025-11-30T09:15:00Z')       // "10:15" (timezone adjusted)
```

**Options**:
- `locale?: string` - Override entity locale
- `timeZone?: string` - Override entity timezone
- `timeStyle?: 'full' | 'long' | 'medium' | 'short'` - Default: 'short'

### Number

```typescript
formatNumber(value: number | null | undefined, options?: NumberFormatOptions): string
```

**Examples**:
```typescript
formatNumber(1234.56)                     // "1 234,56" (fr-FR style)
formatNumber(1234.56, {
  locale: 'en-US'
})                                        // "1,234.56"
formatNumber(null)                        // "-"
```

**Options**:
- `locale?: string` - Override entity locale
- `minimumFractionDigits?: number`
- `maximumFractionDigits?: number`

### Duration

```typescript
formatDuration(minutes: number | null | undefined): string
```

**Examples**:
```typescript
formatDuration(90)                        // "1h 30min"
formatDuration(45)                        // "45min"
formatDuration(120)                       // "2h"
formatDuration(null)                      // "-"
```

## Usage in Components

### ✅ Good

```typescript
import { formatCurrency, formatDate } from '@/shared/lib/formatters';

function ClientCard({ client }) {
  return (
    <div>
      <p>Created: {formatDate(client.created_at)}</p>
      <p>Total spent: {formatCurrency(client.totalSpent)}</p>
    </div>
  );
}
```

### ❌ Bad

```typescript
// DON'T: Hardcode currency symbols
<p>Total: €{amount.toFixed(2)}</p>

// DON'T: Use toLocaleString directly
<p>Date: {new Date(date).toLocaleDateString()}</p>

// DON'T: Use Intl directly
<p>Price: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)}</p>
```

## Testing

All formatters have comprehensive unit tests in `src/__tests__/shared/formatters.test.ts`.

Run tests:
```bash
npm test -- formatters.test.ts
```

## Entity Defaults

Current defaults from `@/shared/config/entity.ts`:
- **Currency**: EUR
- **Locale**: fr-FR
- **Timezone**: Europe/Paris
- **Language**: en

## Migration Notes

### Replaced in Components

1. **ServiceList.tsx**: Removed local `formatPrice()` function
2. **ClientList.tsx**: Replaced hardcoded `€` and `toLocaleDateString()`
3. **AppointmentCard.tsx**: Replaced hardcoded `€` and `toLocaleString()`

All components now use centralized formatters.

## Future Enhancements

- [ ] Add relative date formatting (e.g., "2 days ago")
- [ ] Add duration formatting in different units (hours, days)
- [ ] Add phone number formatting
- [ ] Support for entity-specific locale overrides (future multi-entity feature)
