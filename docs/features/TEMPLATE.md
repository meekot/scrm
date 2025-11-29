# Feature: [Feature Name]

**Status**: 🚧 Planning | 🔨 In Development | ✅ Complete
**Date Started**: YYYY-MM-DD
**Date Completed**: YYYY-MM-DD

---

## Overview

Brief description of what this feature does and why it's needed.

---

## Requirements

### Functional Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Non-Functional Requirements
- [ ] Performance: [specify requirements]
- [ ] Security: [specify requirements]
- [ ] Accessibility: [specify requirements]

---

## Database Schema

### Tables/Changes
```sql
-- Add any schema changes or new tables here
```

### Migrations
- Migration file: `supabase/migrations/YYYYMMDD_feature_name.sql`

---

## API Design

### Queries
```typescript
// List all relevant queries
export async function getItems(supabase, entityId) { }
```

### Mutations
```typescript
// List all mutations
export async function createItem(supabase, entityId, data) { }
export async function updateItem(supabase, entityId, id, data) { }
export async function deleteItem(supabase, entityId, id) { }
```

---

## UI Components

### Pages
- `/path/to/page` - Description

### Components
- `ComponentName` - Description and location

### Forms
- Form schemas (Zod)
- Validation rules

---

## Implementation Checklist

### Core Logic
- [ ] Database schema/migrations
- [ ] Query functions (`queries.ts`)
- [ ] Zod schemas (`schemas.ts`)
- [ ] Helper utilities (`utils.ts`)

### React Integration
- [ ] React Query hooks (`hooks.ts`)
- [ ] UI components
- [ ] Forms with validation
- [ ] Error handling

### Quality Assurance
- [ ] Type check passes (`npm run typecheck`)
- [ ] Lint check passes (`npm run lint`)
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] E2E tests written (if applicable)
- [ ] Code coverage > 80%

---

## Testing Strategy

### Unit Tests
Location: `src/__tests__/features/[feature-name]/`

- [ ] Test query functions
- [ ] Test schemas/validation
- [ ] Test utility functions
- [ ] Test React hooks

### Integration Tests
- [ ] Test component rendering
- [ ] Test form submission
- [ ] Test data flow (query → component → UI)

### E2E Tests (if applicable)
- [ ] Test complete user flows

---

## Security Considerations

- [ ] RLS policies defined
- [ ] Entity scoping enforced
- [ ] Input validation implemented
- [ ] XSS prevention
- [ ] CSRF protection

---

## Performance Considerations

- [ ] Query optimization
- [ ] Caching strategy (React Query)
- [ ] Lazy loading (if applicable)
- [ ] Bundle size impact

---

## Documentation

- [ ] Feature documented in `docs/DEV-WORKFLOW.md`
- [ ] API documented (JSDoc comments)
- [ ] User-facing docs (if needed)

---

## Notes

Any additional notes, decisions, or context about the implementation.
