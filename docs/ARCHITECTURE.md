
# SevillaCRM Architecture (Entities-based, Next.js + Supabase)

## 1. Overview

SevillaCRM is a lightweight CRM for beauty masters built on:

- Next.js App Router
- Supabase (Postgres, Auth, RLS) as the primary backend
- TypeScript, Zod, TanStack Query, shadcn/ui on the frontend

The architecture is:

- Supabase-first: as much logic and data access as possible goes directly through Supabase.
- Feature-based: the codebase is organised around business features, not abstract layers.
- Entity-centric: all business data is scoped to an entity (salon, business account, or workspace).
- Isomorphic: core logic can run on server or client without changes.

This document describes how **entities** are integrated into the architecture.

---

## 2. Entity Concept

### 2.1 What is an Entity

An **entity** in SevillaCRM represents an independent business unit that owns all CRM data:

- a specific beauty master working as an individual;
- a salon or studio;
- a multi-seat account with several practitioners.

Everything in the CRM is attached to an entity:

- customers (clients),
- services,
- appointments,
- resources (rooms, devices),
- staff users (CRM users linked to a Supabase auth user),
- notifications and automation rules,
- analytics and reports.

### 2.2 Goals of Entity Layer

The entity layer provides:

- **Isolation**: data from different entities must not mix.
- **Multi-tenancy**: one Supabase project serves many entities.
- **Scoping**: every query and business rule is evaluated in the context of the current entity.
- **Extensibility**: new features automatically respect entity boundaries.

---

## 3. Data Model and Entity Boundaries

### 3.1 Core Tables (Conceptual, Without SQL)

At the data model level, the following conceptual tables exist:

- Entities
  - describes a business unit (name, contact info, settings).
- Users
  - profile for each human user of the CRM, linked to Supabase auth user.
- User–Entity membership
  - mapping of which users belong to which entity;
  - includes role inside entity (owner, admin, practitioner, assistant).
- Customers
  - each row belongs to exactly one entity;
  - contains personal data of a client for that entity.
- Services
  - each row belongs to exactly one entity;
  - defines name, duration, price and other service properties.
- Appointments
  - each row belongs to exactly one entity;
  - references a customer and a service that belong to the same entity;
  - stores start/end time, status and notes.
- Additional feature tables (e.g. notifications, marketing campaigns, tags)
  - all include an entity reference and never mix data across entities.

### 3.2 Entity Column

All entity-scoped tables have a column that links to the owning entity, conceptually named:

- entity reference on:
  - customers,
  - services,
  - appointments,
  - user–entity membership,
  - any future feature tables.

No business row can exist without being attached to an entity.

---

## 4. Supabase and RLS with Entities

### 4.1 Security Model

Row Level Security (RLS) policies enforce that:

- a user can only access rows that belong to entities where the user has membership;
- for each table, access checks `entity` column and user–entity membership;
- cross-entity access is impossible using the anon key.

This ensures that:

- all data access from the browser using the anon key is safe;
- entity isolation is guaranteed at database level, not only in application code.

### 4.2 Entity Resolution

On each request, the backend determines:

- who is the authenticated Supabase user;
- which entity is currently selected for that user.

The selected entity can be provided by:

- explicit selection in the UI (for users with multiple entities);
- a default entity for users with only one membership;
- URL or route segment (for future multi-entity URLs if needed).

The selected entity identifier is then used by:

- server-side data access;
- client-side queries;
- analytics and reports.

---

## 5. Feature-based Architecture with Entities

The project remains **feature-based**, but each feature is explicitly entity-aware.

High-level structure (conceptual):

- Features
  - customers
  - appointments
  - services
  - auth
  - analytics
  - notifications
- Shared layer
  - Supabase client configuration
  - UI components
  - shared utilities (dates, env, query keys)
  - configuration (feature flags, analytics, entity behaviour)

Each feature internally:

- knows about entity scoping;
- uses entity identifier when reading or writing data;
- never queries data without an entity context.

---

## 6. Entity-aware Features

### 6.1 Customers Feature

Customers are always scoped to an entity.

Responsibilities:

- list all customers for the current entity;
- manage customer details (create, update, archive);
- provide formatted labels or computed values (for example: name plus contact info) for use in other features;
- ensure that all operations are limited to the entity visible to the current user.

The entity identifier is always part of the selection criteria when reading customers and is automatically set when creating new customers.

### 6.2 Services Feature

Services are defined per entity.

Responsibilities:

- maintain service catalogue (name, duration, price, category);
- ensure that services are not shared across entities;
- provide consistent ordering and grouping for the UI;
- support future service categories, packages and service-specific rules per entity.

All service operations implicitly or explicitly use the current entity.

### 6.3 Appointments Feature

Appointments link customers and services within the same entity.

Responsibilities:

- store bookings for a specific entity;
- maintain references to customer and service that belong to that entity;
- support calendar views, agenda lists and day/week planning;
- expose appointments enriched with customer and service information while staying entity-scoped.

All fetches, edits and cancellations of appointments include the entity in their selection logic. It is impossible to create an appointment that references customers or services from another entity.

### 6.4 Auth and User–Entity Membership

The auth feature maps Supabase auth users to CRM users and entity memberships.

Responsibilities:

- ensure that every user has at least one entity membership before accessing the CRM;
- support multiple entity memberships for the same person (for example, a practitioner working at multiple salons);
- provide the current entity to the rest of the system;
- support roles and permissions per entity (owner, admin, practitioner, assistant).

Role checks are always evaluated in the context of the current entity.

### 6.5 Analytics Feature

Analytics are computed per entity.

Responsibilities:

- aggregate KPIs per entity (monthly potential revenue, number of appointments, average ticket, no-shows);
- allow future segmentation by user, service, or customer segments inside an entity;
- never aggregate across entities unless explicitly required by an internal admin dashboard.

Analytics queries always include the entity, regardless of where the calculation runs (frontend, backend, or Supabase).

---

## 7. Isomorphic Logic and Entities

The architecture supports executing business logic both on the server and on the client.

Key ideas:

- Business rules do not depend on environment or entity storage. They operate on in-memory data that already includes the entity context.
- Data access functions are written in an environment-agnostic way and receive a Supabase client instance plus the current entity identifier.
- Thin adapter layers are used:
  - on the server: entity is resolved from the current user and environment, and passed into feature-level data access;
  - on the client: entity is loaded from user context and reused by React Query hooks.

As a result:

- the same business logic can work in server-rendered routes and in client-side components;
- switching from local computations to database-side aggregations does not change feature or UI boundaries;
- the entity concept is consistently applied regardless of where the code executes.

---

## 8. Entity Selection in the UI

The user interface supports entity selection in a predictable way:

- Users with a single entity membership are automatically placed into that entity.
- Users with multiple entities see a selector (for example in the header) where they can switch the active entity.
- The selected entity affects:
  - all lists and detail pages (customers, services, appointments);
  - analytics and dashboards;
  - settings pages specific to that entity.

The current entity is stored on the client side and reflected on the server side so that:

- refreshes and navigation preserve the selected entity;
- deep links to specific pages are always rendered within the correct entity context.

---

## 9. Multi-tenant Considerations

The entity-based design makes the CRM multi-tenant by default:

- One Supabase database instance holds data for many entities.
- Entities are isolated by RLS and by consistent use of the entity column.
- Users can belong to multiple entities without compromising isolation.
- Backups and exports can be done per entity if needed.

Future extensions are straightforward:

- per-entity billing and subscription plans;
- per-entity branding and settings;
- per-entity integrations with external tools (messaging, marketing, accounting);
- per-entity audit logs and compliance features.

---

## 10. Summary

The architecture is:

- **Entity-centric**: everything belongs to an entity, and all access respects this boundary.
- **Feature-based**: code organised by features rather than generic layers.
- **Supabase-first**: the database and RLS enforce isolation and security.
- **Isomorphic**: business logic is portable between server and client.

This keeps SevillaCRM flexible enough to evolve (for example, adding event sourcing or advanced analytics later) while staying simple and productive for the current scope.
