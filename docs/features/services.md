# Feature: Services

**Status**: 🚧 Planning  
**Date Started**: 2025-11-29  
**Date Completed**: -

---

## Overview

Manage the service catalog per entity. Users (owners) can list, create, edit, and delete services scoped to their entity. Services include name, price, duration, and description. All operations respect RLS and the current entity context.

---

## Requirements

### Functional Requirements
- [ ] List services for the current entity.
- [ ] Create a service with name (required), optional description, price (default 0), and duration (minutes) via dialog.
- [ ] Edit service fields (name, price, duration, description).
- [ ] Delete a service unless it is referenced by appointments (block with message).
- [ ] Show validation errors inline and prevent invalid submissions.
- [ ] Surface Supabase errors to the user in a friendly way.
- [ ] Service numbering uses existing `display_number` trigger (no client numbering).

### Non-Functional Requirements
- [ ] All queries/mutations scoped by entity and respect RLS.
- [ ] UI is mobile-first and uses shared primitives (shadcn/tailwind).
- [ ] Handle loading and empty states gracefully; show toast on create success.

---

## Database Schema

Using existing tables/migrations:
- `public.services` (id, entity_id, name, price, duration, description, display_number, timestamps)
- Trigger `service_display_number_bi` assigns `display_number`.

No schema changes expected.

---

## API Design

### Queries (src/features/services/queries.ts)
```typescript
export async function listServices(client, entityId)
// returns rows ordered by display_number asc
```

### Mutations (src/features/services/mutations.ts)
```typescript
export async function createService(client, entityId, input)
export async function updateService(client, entityId, id, input)
export async function deleteService(client, entityId, id)
```

### Schemas (src/features/services/schemas.ts)
```typescript
const serviceInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().nonnegative().optional(),
  duration: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
});
```

---

## UI Components

### Pages
- `/services` - list view with create/edit/delete capabilities.

### Components
- `ServiceList` - renders services with actions.
- `ServiceForm` - create/update form using react-hook-form + Zod.

---

## Implementation Checklist

### Core Logic
- [ ] Queries (`queries.ts`)
- [ ] Mutations (`mutations.ts`)
- [ ] Zod schemas (`schemas.ts`)

### React Integration
- [ ] React Query hooks (`hooks.ts`)
- [ ] UI components (list, form)
- [ ] Pages wired to hooks and entity context
- [ ] Loading/empty/error states

### Quality Assurance
- [ ] Type check passes (`npm run typecheck`)
- [ ] Lint check passes (`npm run lint`)
- [ ] Unit tests for schemas/queries/mutations
- [ ] Integration test for `ServiceForm` (validation + submission)
- [ ] E2E test for basic CRUD (optional)

---

## Testing Strategy

### Unit Tests (src/__tests__/features/services/)
- [ ] `schemas.test.ts` - validation
- [ ] `queries.test.ts` - list ordering/scoping (mocked client)
- [ ] `mutations.test.ts` - payload shaping/errors (mocked client)

### Integration Tests
- [ ] `ServiceForm.test.tsx` - form validation and submission flow

### E2E Tests (optional)
- [ ] Create/edit/delete service for current entity

---

## Security Considerations

- [ ] All Supabase calls use the current entityId and rely on RLS.
- [ ] Validate inputs via Zod before mutation calls.
- [ ] No client-side overrides of `display_number`.

---

## Performance Considerations

- [ ] Cache service list via React Query keyed by entityId.
- [ ] Optimistic updates for create/update/delete (if time permits).

---

## Documentation

- [ ] Update `docs/DEV-WORKFLOW.md` when feature closes.
- [ ] JSDoc on queries/mutations.

---

## Notes

- Future: categories, packages, service colors, and availability constraints.
