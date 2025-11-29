# Repository Guidelines

## Project Structure & Module Organization
`app/` contains the Next.js App Router tree: `(auth)` for sign-in flows, `(app)` for protected dashboards, feature placeholders, and server routes. Domain code lives in `src/features/*` (auth, entity utilities, scaffolds for clients/services/appointments). Shared concerns are under `src/shared/` (Supabase clients, UI kit, env/query helpers, providers). Tests sit in `src/__tests__/` (Vitest) and `e2e/` (Playwright specs plus `setup.ts`). Documentation is under `docs/`; Supabase SQL and config belong in `supabase/`.

## Build, Test, and Development Commands
- `npm run dev` – start the local Next.js server with hot reload.
- `npm run build` / `npm run start` – create and serve a production build.
- `npm run lint` – run ESLint (Next.js + TypeScript rules).
- `npm run typecheck` – execute `tsc --noEmit` for type safety.
- `npm test`, `npm run test:coverage`, `npm run test:ui` – Vitest suites.
- `npm run test:e2e`, `npm run test:e2e:ui` – Playwright end-to-end flows; seed via `npm run test:e2e:setup` before first run.

## Coding Style & Naming Conventions
Use TypeScript/TSX with functional React components and PascalCase filenames (e.g., `SignInForm.tsx`). Feature folders stay lowercase, while shared utilities follow `kebab-case` or `camelCase` per existing examples. Prefer Tailwind classes and shared primitives in `src/shared/ui/` over ad hoc markup. Maintain two-space indentation and rely on ESLint for formatting checks; no auto-format command is provided, so fix issues manually or via the editor.

## Testing Guidelines
Vitest covers unit and integration specs (`*.test.ts[x]`). Mirror the domain structure inside `src/__tests__/features/<feature>` and focus on pure logic where possible. Use Playwright for workflow validation (`e2e/auth.spec.ts` shows the pattern). Before merging, ensure `npm run typecheck`, `npm run lint`, `npm test`, and the relevant Playwright suite pass; document the result in `docs/DEV-WORKFLOW.md` when closing a feature.

## Commit & Pull Request Guidelines
Commits in this repo use short, imperative statements (e.g., “initial structure”). Group related changes, include updated docs/tests, and avoid mixing unrelated refactors. Pull requests should describe scope, reference the matching spec (`docs/features/<name>.md`), and list the verification commands run. Add screenshots for UI updates and mention any Supabase migrations or new environment variables. Link issues or TODOs so the development workflow remains traceable.

## Security & Configuration Tips
Environment variables are validated in `src/shared/lib/env.ts`; never commit raw secrets. Use the helper clients in `src/shared/supabase/` (browser, server, middleware) to ensure RLS and session handling match production, especially when writing server actions or Playwright flows.
