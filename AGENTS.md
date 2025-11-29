# Repository Guidelines

## Project Structure & Module Organization
The Next.js App Router under `app/` holds public/auth flows and thin HTTP adapters: `app/(auth)` for login/register, `app/(dashboard)` for CRM surfaces, and `app/api/{commands|queries}` to expose CQRS handlers. Domain code follows the Clean Architecture plan in `docs/ARCHITECTURE.md`: `src/core` hosts entities, value objects, and domain events per bounded context (customer, appointment, notification, analytics, identity). `src/application` provides use cases and DTO mappers that orchestrate commands and queries, while `src/infrastructure` wires Supabase repositories, messaging, and external services. Presentation React components, hooks, and view models live in `src/presentation`, shared helpers sit in `src/lib`, and Supabase migrations/config stay inside `supabase/`.

## Build, Test, and Development Commands
`npm run dev` starts Next.js 16 with hot reload. `npm run build` compiles for production, and `npm run start` serves the build. Run `npm run lint`, `npm run type-check`, and `npm run format` or `format:check` before pushing. Testing relies on Vitest: `npm run test`, `test:ui`, and `test:coverage`. Supabase helpers mirror the CLI: `npm run supabase:start`, `supabase:stop`, `supabase:reset`, and `npm run types:generate` after schema edits.

## Coding Style & Naming Conventions
Prettier plus ESLint enforce 2-space indentation, single quotes, and no semicolons. React components export `PascalCase`, hooks use `useCamelCase`, domain objects favor noun based `PascalCase.ts`, and infrastructure adapters stay `kebab-case.ts`. Prefer Tailwind utility composition, keep dependency injection wiring inside the Inversify containers, and ensure route handlers remain thin delegators.

## Testing Guidelines
Follow the layered test strategy described in the docs: unit test value objects and aggregates inside `src/core`, integration test repositories against a local Supabase instance (reset via `supabase db reset`), and use Vitest plus Testing Library for UI behavior tests stored alongside the component (`Component.test.tsx`). Target coverage above 80 percent for touched files and mock external SMS or email senders via the interfaces under `src/infrastructure/messaging`.

## Commit & Pull Request Guidelines
Keep commits imperative and scoped, e.g., `customer: add onboarding command`. A PR should summarise intent, reference tickets, and attach UI screenshots or Supabase migration notes when visuals or schemas change. Before requesting review, run lint, type-check, tests, and regenerate Supabase types if applicable. Rebase onto `main` to keep history linear.

## Architecture & Environment Notes
Consult `docs/ARCHITECTURE.md` for CQRS, DDD, and event sourcing details, and align new modules with the appropriate bounded context folder. Secrets belong only in `.env.local`. Every schema change must regenerate `src/infrastructure/persistence/supabase/types.ts` and document event store implications.
