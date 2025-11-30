# Repository Guidelines

## Project Overview
SCRM is a modular, mobile-first CRM for small businesses (especially beauty professionals) built with Next.js 16 App Router, React 19, Supabase (Postgres + Auth + RLS), TypeScript, Tailwind CSS, and TanStack Query.

## Project Structure & Module Organization
`app/` contains the Next.js App Router tree: `(auth)` for sign-in flows, `(app)` for protected dashboards, feature placeholders, and server routes (including `/no-entity`). Domain code lives in `src/features/*` (auth, entity utilities, scaffolds for clients/services/appointments). Shared concerns are under `src/shared/` (Supabase clients, UI kit, env/query helpers, providers). Tests sit in `src/__tests__/` (Vitest) and `e2e/` (Playwright specs plus `setup.ts`). Documentation is under `docs/`; Supabase SQL and config belong in `supabase/`.

## Documentation
- `docs/ARCHITECTURE.md` – entity-based architecture overview
- `docs/ARCHITECTURE-STRUCTURE.md` – project structure and file descriptions
- `docs/DEV-WORKFLOW.md` – workflow, gates, completed features
- `docs/features/<name>.md` – feature specifications/templates

## Build, Test, and Development Commands
- Development: `npm run dev`, `npm run build`, `npm run start`
- Quality gates: `npm run typecheck`, `npm run lint` (must pass before commits)
- Unit/coverage/UI: `npm test`, `npm run test:ci`, `npm run test:coverage`, `npm run test:ui`
- E2E: `npm run test:e2e`, `npm run test:e2e:ui`, `npm run test:e2e:docker` (see `compose.playwright.yml`), seed with `npm run test:e2e:setup`
- Supabase: `npm run supabase`, `supabase start`, `supabase stop`, `supabase db reset`, regenerate types with `supabase gen types typescript --local > src/shared/supabase/types.ts`
- Single tests: `npm test -- <pattern>`, `npm run test:e2e -- e2e/<file>.spec.ts`

## Architecture & Patterns
- Entity-based multi-tenancy: everything is scoped by `entity_id`; use `useRequiredEntity()` and include `entityId` in all queries/mutations; RLS enforces isolation and display numbers are auto-generated via DB functions (never set manually).
- Feature-slice layout: `schemas.ts` (Zod) → `queries.ts`/`mutations.ts` (Supabase client + `entityId`) → `hooks.ts` (React Query keys from `src/shared/lib/queryKeys.ts`, inject entity) → `components/`.
- Data flow: schemas define validation; queries/mutations accept `SupabaseClient<Database>` then `entityId`; hooks wrap with React Query; components consume hooks.
- Route structure: `app/(auth)/` public auth, `app/(app)/` protected app, `app/no-entity/` fallback.

## Supabase Client Variants
- Browser: `src/shared/supabase/client-browser.ts`
- Server: `src/shared/supabase/client-server.ts`
- Middleware: `src/shared/supabase/client-middleware.ts`
- E2E: `e2e/supabaseClient.ts` (service role key)

## Coding Style & Naming Conventions
Use TypeScript/TSX with functional React components and PascalCase filenames (e.g., `SignInForm.tsx`). Feature folders stay lowercase, while shared utilities follow `kebab-case` or `camelCase` per existing examples. Prefer Tailwind classes and shared primitives in `src/shared/ui/` over ad hoc markup. Maintain two-space indentation and rely on ESLint for formatting checks; no auto-format command is provided, so fix issues manually or via the editor.

## Key Patterns & Constraints
- Formatting: always use `src/shared/lib/formatters.ts` (`formatCurrency`, `formatDate`, `formatDateTime`, `formatTime`, `formatNumber`, `formatDuration`). Never use `toLocaleString`, `toLocaleDateString`, `toFixed`, hardcoded currency symbols, or direct `Intl.*`.
- Query keys: centralized in `src/shared/lib/queryKeys.ts` for caching/invalidations.
- Path aliases: `@/*` → `src/*`, `~/*` → `./`.
- Deletions: clients with appointments cannot be deleted; check relationships before deleting entities.
- Never commit if typecheck or lint fails.

## Testing Guidelines
Vitest covers unit and integration specs (`*.test.ts[x]`). Mirror the domain structure inside `src/__tests__/features/<feature>` and focus on pure logic where possible. Use Playwright for workflow validation (`e2e/auth.spec.ts` shows the pattern). Use the service role key for E2E data setup. Before merging, ensure `npm run typecheck`, `npm run lint`, `npm test`, and the relevant Playwright suite pass; document the result in `docs/DEV-WORKFLOW.md` when closing a feature.

## Commit & Pull Request Guidelines
Commits in this repo use short, imperative statements (e.g., “initial structure”). Group related changes, include updated docs/tests, and avoid mixing unrelated refactors. Pull requests should describe scope, reference the matching spec (`docs/features/<name>.md`), and list the verification commands run. Add screenshots for UI updates and mention any Supabase migrations or new environment variables. Link issues or TODOs so the development workflow remains traceable.

## Security & Configuration Tips
Environment variables are validated in `src/shared/lib/env.ts`; never commit raw secrets. Use the helper clients in `src/shared/supabase/` (browser, server, middleware) to ensure RLS and session handling match production, especially when writing server actions or Playwright flows.

## Known Constraints
- Local Supabase requires Docker.
- Users must belong to at least one entity (redirect to `/no-entity` otherwise).
- RLS prevents cross-entity access; service role key is only for E2E tests.

## Database Tables
Core tables (all have `entity_id` FK except `entity` and `entity_members`): `entity`, `entity_members`, `clients`, `services`, `appointments`, `scoped_counters`.

## When Working on Features
Check `docs/features/<feature>.md` for specs, follow the data flow pattern, respect entity scoping everywhere, run typecheck/lint/tests (unit + E2E), and update `docs/DEV-WORKFLOW.md` once complete.
