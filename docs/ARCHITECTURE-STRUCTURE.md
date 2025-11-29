# ARCHITECTURE-STRUCTURE.md

Below is the full project structure **with descriptions for every directory and important file**.

```txt
app/
    layout.tsx
      - Root layout for the entire application.
      - Injects global providers (Theme, QueryClient, EntityContext).
      - Defines base HTML structure.

    page.tsx
      - Landing page or redirect to /app/dashboard.

    (auth)/
      layout.tsx
        - Layout for all authentication-related pages.
      sign-in/
        page.tsx
          - Public sign-in page using Supabase Auth.
      callback/
        route.ts
          - Handles OAuth callback redirects.

    (app)/
      layout.tsx
        - Protected layout, checks session and wraps all authenticated pages.
        - Injects navigation, header, entity selector, etc.

      dashboard/
        page.tsx
          - Main page showing KPIs and high‑level analytics for current entity.

      clients/
        page.tsx
          - Clients list UI composed from feature components.

      appointments/
        page.tsx
          - Appointments list or calendar view.

      services/
        page.tsx
          - Entity-specific service catalog UI.

      settings/
        page.tsx
          - General CRM settings for the current entity.
        profile/
          page.tsx
            - Profile settings for current user.

      api/
        webhooks/
          stripe/
            route.ts
              - Endpoint for Stripe webhooks (server-only).
        cron/
          cleanup/
            route.ts
              - Server cron endpoint (cleanup tasks, migrations, etc.)

src/
  features/
    entity/
      context.ts
        - Provides current entity ID to client components.
      selector.ts
        - UI: dropdown/button to switch entities.
      helpers.ts
        - Helper functions for resolving entity, checking membership, etc.
      index.ts
        - Re-exports.

    clients/
      schemas.ts
        - Zod schemas and types for clients.
      queries.ts
        - Isomorphic DB queries (Supabase client passed as argument).
      hooks.ts
        - Client hooks using React Query for customer data.
      utils.ts
        - Label builders, computed helpers.
      components/
        ClientsTable.tsx
          - Table listing clients for the entity.
        CustomerForm.tsx
          - Create/edit form driven by Zod.
        CustomerRow.tsx
          - Single row representation for a customer.
      index.ts

    services/
      schemas.ts
        - Zod schemas for services (duration, price, etc.)
      queries.ts
        - Entity-scoped service queries.
      hooks.ts
        - React Query hooks for listing/updating services.
      components/
        ServicesTable.tsx
        ServiceForm.tsx
      index.ts

    appointments/
      schemas.ts
        - Appointment schemas: base, create/update.
      queries.ts
        - Queries returning appointments with relations (customer, service).
      hooks.ts
        - React Query hooks for appointment lists and mutations.
      components/
        AppointmentsTable.tsx
        AppointmentForm.tsx
        CalendarView.tsx
          - Calendar/agenda interface.
      index.ts

    auth/
      api.ts
        - Supabase auth methods (sign-in, sign-out, fetch session).
      hooks.ts
        - Client hooks: useUser, useSession.
      guards.tsx
        - <AuthGuard> component for protected UI blocks.
      index.ts

    analytics/
      calculations.ts
        - Pure business rules (monthly revenue, average check, etc.)
      queries.ts
        - Isomorphic data fetch functions for analytics.
      api.local.ts
        - Local TS implementation using raw rows from Supabase.
      api.remote.ts
        - Implementation using Supabase RPC or complex SQL.
      api.ts
        - Abstraction that selects local/remote strategy.
      hooks.ts
        - React Query analytics hooks.
      components/
        MonthlyRevenueCard.tsx
          - UI card used on dashboard.
      index.ts

  shared/
    supabase/
      client-browser.ts
        - Creates browser Supabase client (anon key + RLS).
      client-server.ts
        - Creates server Supabase client (cookies + SSR).
      types.ts
        - Generated database types from Supabase.

    ui/
      ...shadcn components...
        - Central library of shared UI components used across features.

    lib/
      queryKeys.ts
        - All React Query keys (centralised).
      react-query.ts
        - QueryClient + Provider setup.
      env.ts
        - Safe environment variable loader (Zod).
      date.ts
        - Date utilities for scheduling and formatting.
      logger.ts
        - Logging wrapper (console, future Sentry support).
      types.ts
        - Shared TS utility types.
      validators.ts
        - Reusable Zod helpers.

    config/
      analytics.ts
        - Defines analytics computation mode (local/remote).
      featureFlags.ts
        - Feature flag registry (for experiments).
      constants.ts
        - Global constants (timeouts, limits, etc.)

    providers/
      AppProviders.tsx
        - Wraps the entire app with all global providers.
      index.ts

  styles/
    globals.css
      - Base Tailwind setup and global styles.

  __tests__/
    features/
      - Feature-level tests (pure logic + queries).
    shared/
      - Utility tests (date, number helpers).
```