# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SCRM** is a modular CRM ecosystem for small businesses (especially beauty professionals) built with a **Mobile First** philosophy. The system is entity-based (multi-tenant), using Next.js 16 App Router, React 19, Supabase (Postgres + Auth + RLS), TypeScript, Tailwind CSS, and TanStack Query.

**Tech Stack**: Next.js 16 | React 19 | Supabase | TypeScript | Tailwind CSS | Vitest | Playwright

## Essential Commands

### Development
```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run typecheck        # TypeScript type checking (must pass before commits)
npm run lint             # ESLint (must pass before commits)
```

### Testing
```bash
npm test                 # Unit tests (Vitest watch mode)
npm run test:ci          # Unit tests (single run for CI)
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests (Playwright)
npm run test:e2e:ui      # Playwright UI mode
npm run test:e2e:docker  # E2E in Docker (see compose.playwright.yml)
```

### Database (Supabase)
```bash
npm run supabase                  # Supabase CLI
supabase start                    # Start local Supabase (requires Docker)
supabase stop                     # Stop local instance
supabase db reset                 # Reset to migrations
supabase gen types typescript --local > src/shared/supabase/types.ts  # Regenerate types
```

### Running Single Tests
```bash
npm test -- clients.test                    # Unit test by pattern
npm run test:e2e -- e2e/clients.spec.ts     # E2E test by file
```

## Documentation Structure

**Detailed documentation is in `docs/`:**
- **`docs/ARCHITECTURE.md`** - Comprehensive entity-based architecture explanation
- **`docs/ARCHITECTURE-STRUCTURE.md`** - Full project structure with file descriptions
- **`docs/DEV-WORKFLOW.md`** - Development workflow, quality gates, completed features
- **`docs/features/<name>.md`** - Feature specifications (use as templates)

## Architecture Summary

### Entity-Based Multi-Tenancy

**Critical Concept**: Everything is scoped to an **entity** (business unit/salon). This is THE core architectural pattern.

- **Entity**: Represents a business; owns all CRM data (clients, services, appointments)
- **Entity Context**: React context (`EntityProvider`) + localStorage stores selected entity ID globally
- **Data Isolation**: RLS policies + `entity_id` foreign key on all tables enforce strict separation
- **Entity Resolution**: On auth, system resolves default entity via `resolveDefaultEntity()` helper
- **Display Numbers**: Each entity has auto-incrementing display numbers (via `scoped_counters` table + `next_scoped_no()` DB function)

**Golden Rule**: ALL queries/mutations MUST filter by `entity_id`. Use `useRequiredEntity()` hook to get current entity.

### Feature-Slice Architecture

```
src/features/<feature>/
  ├── schemas.ts        # Zod validation schemas
  ├── queries.ts        # Data fetching (pure functions, accept SupabaseClient + entityId)
  ├── mutations.ts      # Data mutations (create/update/delete)
  ├── hooks.ts          # React Query hooks wrapping queries/mutations
  ├── components/       # Feature UI components
  └── index.ts          # Public exports
```

**Features**: `auth`, `entity`, `clients`, `services`, `appointments`, `analytics`

### Data Flow Pattern

1. **Schemas** → Define validation with Zod
2. **Queries/Mutations** → Isomorphic async functions:
   - Accept `SupabaseClient<Database>` as first param
   - Accept `entityId: string` as second param
   - Return typed data or throw
3. **Hooks** → React Query wrappers:
   - Use centralized keys from `src/shared/lib/queryKeys.ts`
   - Call queries/mutations with appropriate Supabase client
   - Inject `entityId` via `useRequiredEntity()`
4. **Components** → Consume hooks

**Example Pattern**:
```ts
// queries.ts
export async function listClients(client: SupabaseClient<Database>, entityId: string) { ... }

// hooks.ts
export function useClients() {
  const entityId = useRequiredEntity();
  const supabase = createClient();
  return useQuery({
    queryKey: queryKeys.clients.all(entityId),
    queryFn: () => listClients(supabase, entityId),
  });
}
```

### Supabase Client Variants

Three client factories based on execution context:
- **Browser**: `src/shared/supabase/client-browser.ts` (client components, uses anon key + RLS)
- **Server**: `src/shared/supabase/client-server.ts` (server components/actions, uses cookies)
- **Middleware**: `src/shared/supabase/client-middleware.ts` (session refresh in middleware)
- **E2E**: `e2e/supabaseClient.ts` (service role key for tests)

### Route Structure

- `app/(auth)/` - Public auth routes (sign-in)
- `app/(app)/` - Protected app routes (dashboard, clients, services, appointments)
- `app/no-entity/` - Fallback when user has no entity membership

## Development Workflow

**Strict quality gates** (from `docs/DEV-WORKFLOW.md`):

1. **Plan** → Create `docs/features/<name>.md` specification
2. **Implement** → Follow feature-slice architecture
3. **Type Check** → `npm run typecheck` must pass (0 errors)
4. **Lint** → `npm run lint` must pass (0 errors)
5. **Test** → All tests must pass:
   - Unit tests (Vitest) for schemas, queries, mutations, components
   - E2E tests (Playwright) for user flows
6. **Accept** → Feature logged in `docs/DEV-WORKFLOW.md`

**Never commit** if typecheck or lint fails.

## Key Patterns & Constraints

### Always Entity-Scoped
- Every query/mutation MUST include `entityId`
- Use `useRequiredEntity()` in components to get current entity
- Display numbers are auto-generated (never manually set)

### Form Validation
- All forms use Zod + `react-hook-form` + `@hookform/resolvers/zod`
- Schemas in `<feature>/schemas.ts`

### Formatting (Dates, Currency, Numbers)
**CRITICAL**: Always use centralized formatters from `@/shared/lib/formatters.ts`
- `formatCurrency(value, options?)` - Money formatting using entity currency/locale
- `formatDate(date, options?)` - Date formatting
- `formatDateTime(date, options?)` - Date + time formatting
- `formatTime(date, options?)` - Time only formatting
- `formatNumber(value, options?)` - Number formatting
- `formatDuration(minutes)` - Duration (e.g., "1h 30min")

All formatters use `entityDefaults` (EUR, fr-FR, Europe/Paris) and allow per-call overrides.

**Never use**:
- ❌ `toLocaleString()`, `toLocaleDateString()`, `toFixed()`
- ❌ Hardcoded currency symbols (`€`, `$`)
- ❌ Direct `Intl.NumberFormat` or `Intl.DateTimeFormat`

### Query Keys
- Centralized in `src/shared/lib/queryKeys.ts`
- Used for cache invalidation and React Query operations

### Path Aliases
- `@/*` → `src/*`
- `~/*` → `./` (project root)

### Deletion Constraints
- Clients with appointments cannot be deleted (enforced in `mutations.ts`)
- Check relationships before deleting entities

### Testing Strategy
- **Unit tests** (`src/__tests__/`): Test schemas, queries, mutations, components in isolation
- **E2E tests** (`e2e/`): Full user flows with Playwright
- Use service role key in E2E to manipulate test data directly

## Important Files

- **Database Types**: `src/shared/supabase/types.ts` (generated from Supabase)
- **Entity Config**: `src/shared/config/entity.ts` (currency, locale, timezone defaults)
- **Formatters**: `src/shared/lib/formatters.ts` (centralized date/currency/number formatting)
- **Navigation**: `src/shared/config/navigation.ts` (primary nav items)
- **Query Keys**: `src/shared/lib/queryKeys.ts` (centralized React Query keys)
- **Middleware**: `src/middleware.ts` (auth session refresh)

## Database Tables

Core tables (all have `entity_id` FK except `entity` and `entity_members`):
- `entity` - Business units
- `entity_members` - User-entity relationships with roles
- `clients` - Customer records
- `services` - Service catalog
- `appointments` - Bookings (links client + service)
- `scoped_counters` - Auto-incrementing display numbers per entity

## Known Constraints

- **Docker Required**: Local Supabase needs Docker for `supabase start`
- **Entity Membership**: Users must belong to at least one entity (redirect to `/no-entity` otherwise)
- **Display Numbers**: Auto-generated by DB triggers calling `next_scoped_no()`, cannot be manually set
- **RLS Enforced**: All client access uses RLS; service role key only for E2E tests
- **No Cross-Entity Access**: RLS policies prevent accessing data from entities user doesn't belong to

## When Working on Features

1. **Check** `docs/features/<feature>.md` for specification
2. **Follow** the data flow pattern (schemas → queries → hooks → components)
3. **Respect** entity scoping in ALL operations
4. **Test** with both unit and E2E tests
5. **Run** typecheck and lint before considering complete
6. **Update** `docs/DEV-WORKFLOW.md` when feature is complete
