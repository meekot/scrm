# Feature: Appointments

**Status**: 🚧 In Development  
**Date Started**: 2025-11-29  
**Date Completed**: -

---

## Overview

Manage appointments per entity with both list and calendar views. Each appointment shows core details and quick actions (call, Instagram), and supports status changes (confirm/cancel). Data is scoped to the current entity.

---

## Requirements

### Functional Requirements
- [ ] List view: display appointments with display_number, date, time, service, price, client (with display_number).
- [ ] Calendar view (grouped by date; future: full calendar component).
- [ ] Quick actions: call client, open client Instagram (if present).
- [ ] Status actions: confirm or cancel when in scheduled/pending state.
- [ ] Prevent deletion if linked entities would break integrity (future).
- [ ] All data scoped by entity and RLS.

### Non-Functional Requirements
- [ ] Mobile-first UI using shared shadcn/tailwind primitives.
- [ ] Friendly error and empty states; loading indicators.
- [ ] Use entity defaults for formatting (currency/locale/timezone).

---

## Database Schema

Using existing tables:
- `public.appointments` (id, entity_id, client_id, service_id, date, time, price, status, display_number, timestamps)
- joins to `clients` and `services` for display.

No schema changes planned.

---

## API Design

### Queries (`src/features/appointments/queries.ts`)
```typescript
export type AppointmentWithRelations = {
  // appointment row + joined client/service
};
export async function listAppointments(client, entityId);
```

### Mutations (`src/features/appointments/mutations.ts`)
```typescript
export async function updateAppointmentStatus(client, entityId, id, status);
```

---

## UI Components

### Pages
- `/appointments` - toggle between list and calendar views.

### Components
- `AppointmentCard` - shows display_number, date/time, service, price, client (display_number), quick actions, status buttons.
- `AppointmentsPage` - view switcher, list view, calendar grouping (placeholder for full calendar).

---

## Implementation Checklist

### Core Logic
- [ ] Queries (`queries.ts`) for appointments with relations
- [ ] Mutations (`mutations.ts`) for status changes
- [ ] Zod schemas (if/when forms are added)

### React Integration
- [ ] Hooks (`hooks.ts`) for list + status updates
- [ ] AppointmentCard UI with actions
- [ ] List and calendar views
- [ ] Status actions wired to backend

### Quality Assurance
- [ ] Type check passes (`npm run typecheck`)
- [ ] Lint passes (`npm run lint`)
- [ ] Unit tests for query shape/mutations
- [ ] Integration test for status actions (pending → confirm/cancel)
- [ ] E2E for list view actions and status change (optional)

---

## Testing Strategy

### Unit Tests
- [ ] Mocked Supabase client tests for queries/mutations

### Integration Tests
- [ ] AppointmentCard interactions (status buttons)

### E2E Tests
- [ ] List view: call + status change
- [ ] Calendar grouping displays appointments by date

---

## Security Considerations

- [ ] All queries/mutations constrained by entity_id and RLS.
- [ ] No unscoped data access; status changes only for current entity.

---

## Performance Considerations

- [ ] Cache via React Query; invalidate on status updates.
- [ ] Avoid over-fetching; consider pagination/filters later.

---

## Documentation

- [ ] Update `docs/DEV-WORKFLOW.md` when feature completes.
- [ ] JSDoc on queries/mutations describing expected shapes.

---

## Notes

- Future: full calendar UI (Ilamy or similar), appointment creation/edit forms, filtering by status/date, deletion with integrity checks.
