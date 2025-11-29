# Feature: Entity Management & Selection

**Status**: 🚧 Planning
**Date Started**: 2025-11-29
**Date Completed**: -

---

## Overview

Deliver the entity layer assuming **one user = one entity** for now. We still scope all feature data (clients, services, appointments, analytics) to the current entity, but we skip UI for switching or managing multiple entities and we do not expose entity creation in the app (entities provisioned outside the UI). Roles exist conceptually (`OWNER`, `STAFF`), but only owners are expected in this iteration.

---

## Requirements

### Functional Requirements
- [ ] Resolve the current entity for an authenticated user (single membership assumed).
- [ ] Hydrate client state with the server-resolved entity to avoid SSR/client mismatches.
- [ ] Block access to dashboard/routes when the user has zero memberships (redirect to an onboarding/empty state).
- [ ] Guard feature queries/mutations with membership checks (reuse helper `checkEntityMembership`).

### Non-Functional Requirements
- [ ] RLS respected end-to-end; only pass entity IDs the user is allowed to access.
- [ ] Performance: entity resolution happens once per request and reuses cached membership queries on the client.

---

## Database Schema

### Tables/Changes
No new schema. Use existing tables:
- `public.entity` (id, name, display_number, timestamps)
- `public.entity_members` (entity_id, user_id, role, timestamps)
- `public.scoped_counters` (per-entity numbering used by display_number triggers)

### Migrations
- None planned for this iteration.

---

## API Design

### Queries
Location: `src/features/entity/queries.ts`
```typescript
export async function getUserEntities(client, userId)
// returns [{ entity_id, role, entity: { id, name, display_number, created_at } }]

export async function resolveDefaultEntity(client, userId)
// returns a single entity_id or null, preferring stored selection when present
```

---

## UI Components

### Pages
- Optional `/settings/entity` - Entity info placeholder (read-only), or hide entirely for this iteration.
- Empty/onboarding state when user has zero entities (redirect target from protected layout).

### Components
- None for switching/creation in this iteration.

### Forms
```typescript
// Location: src/features/entity/schemas.ts
const createEntitySchema = z.object({
  name: z.string().min(2, 'Name is required'),
});
```

---

## Implementation Checklist

### Core Logic
- [ ] Queries (`queries.ts`) for memberships and default resolution
- [ ] Helper to persist selected entity server→client (e.g., cookie/localStorage bridge)

### React Integration
- [ ] Server layout resolves initialEntityId and passes into `AppProviders`
- [ ] `EntityProvider` consumes initial entity and syncs user selections
- [ ] Onboarding/empty-state redirect when no entities

### Quality Assurance
- [ ] Type check passes (`npm run typecheck`)
- [ ] Lint check passes (`npm run lint`)
- [ ] Unit tests for queries
- [ ] E2E test covering zero-entity user redirect

---

## Testing Strategy

### Unit Tests
Location: `src/__tests__/features/entity/`
- [ ] `queries.test.ts` - membership retrieval and default resolution

### Integration Tests
- [ ] Layout test to ensure initial entity hydrates without mismatch

### E2E Tests (if applicable)
- [ ] Zero-entity user: redirect to onboarding/empty state

---

## Security Considerations

- [ ] All Supabase queries run with RLS and filter by authenticated user.
- [ ] `checkEntityMembership` reused before mutating data.
- [ ] No entity IDs accepted from client without validation.
- [ ] Post-create path ensures the creator is added with the highest allowed role.

---

## Performance Considerations

- [ ] Cache membership list via React Query; reuse between switcher and settings page.
- [ ] Avoid repeated server lookups by including `initialEntityId` in layout loader.
- [ ] Keep switcher lightweight for mobile (no heavy modals).

---

## Documentation

- [ ] Add flow notes to `docs/DEV-WORKFLOW.md` after implementation.
- [ ] JSDoc on queries/mutations describing expected shapes and RLS assumptions.

---

## Notes

- `display_number` is auto-assigned by existing triggers; no client-side numbering.
- Future: role-based restrictions (only owners/admins can invite members or rename entities).*** End Patch
