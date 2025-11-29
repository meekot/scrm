-- =========================
-- Init migration (single-file)
-- Safe for Supabase: no runtime DDL; strict search_path; RLS tuned
-- =========================

-- ---------- Session hygiene ----------
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET row_security = off;

-- ---------- Extensions (minimal, idempotent) ----------
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
-- Uncomment only if you use them:
-- CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
-- CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
-- CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
-- CREATE EXTENSION IF NOT EXISTS "pgsodium";
-- CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

COMMENT ON SCHEMA "public" IS 'standard public schema';

-- ---------- Types ----------
CREATE TYPE public.status AS ENUM ('scheduled','canceled','completed');

CREATE TYPE public.appointment_cancel_reason AS ENUM (
  'no_show', 'client_request', 'staff_unavailable', 'other'
);

-- ---------- Sequences (only truly global) ----------
CREATE SEQUENCE IF NOT EXISTS public.entity_display_seq
  START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- ---------- Tables ----------
CREATE TABLE IF NOT EXISTS public.entity (
  id             uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  name           text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  display_number integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.entity_members (
  entity_id   uuid NOT NULL REFERENCES public.entity(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'member',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.clients (
  id             uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  display_number integer NOT NULL,
  entity_id      uuid NOT NULL REFERENCES public.entity(id) ON DELETE CASCADE,
  name           text NOT NULL,
  instagram      text,
  phone          text,
  lead_source    text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services (
  id             uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  display_number integer NOT NULL,
  entity_id      uuid NOT NULL REFERENCES public.entity(id) ON DELETE CASCADE,
  name           text NOT NULL,
  price          numeric,
  description    text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  duration       integer
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id                        uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
  display_number            integer NOT NULL,
  entity_id                 uuid NOT NULL REFERENCES public.entity(id) ON DELETE CASCADE,
  client_id                 uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id                uuid REFERENCES public.services(id) ON DELETE SET NULL,
  date                      date NOT NULL,
  time                      time without time zone,
  price                     numeric NOT NULL,
  status                    public.status NOT NULL DEFAULT 'scheduled',
  cancellation_reason_type  public.appointment_cancel_reason,
  cancellation_reason_note  text,
  notes                     text,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointment_cxl_other_requires_note
    CHECK (cancellation_reason_type <> 'other' OR cancellation_reason_note IS NOT NULL),
  CONSTRAINT appointment_cxl_reason_when_canceled
    CHECK (status <> 'canceled' OR cancellation_reason_type IS NOT NULL)
);

-- Per-entity scoped counters (atomic numbering per entity/kind)
CREATE TABLE IF NOT EXISTS public.scoped_counters (
  entity_id  uuid NOT NULL,
  kind       text NOT NULL,
  last_value int  NOT NULL DEFAULT 0,
  PRIMARY KEY (entity_id, kind),
  FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON DELETE CASCADE
);

-- ---------- Functions (strict search_path, fully qualified) ----------
-- RLS helper: membership check
CREATE OR REPLACE FUNCTION public.is_member_of_entity(eid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $func$
DECLARE v boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT true INTO v
  FROM public.entity_members em
  WHERE em.entity_id = eid
    AND em.user_id   = auth.uid()
  LIMIT 1;

  RETURN coalesce(v, false);
END;
$func$;

-- Next scoped number (no DDL inside; purely data)
CREATE OR REPLACE FUNCTION public.next_scoped_no(p_kind text, p_eid uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $func$
DECLARE v int;
BEGIN
  IF p_eid IS NULL THEN
    RAISE EXCEPTION 'eid is required for %', p_kind;
  END IF;

  INSERT INTO public.scoped_counters(entity_id, kind, last_value)
  VALUES (p_eid, p_kind, 1)
  ON CONFLICT (entity_id, kind)
  DO UPDATE SET last_value = public.scoped_counters.last_value + 1
  RETURNING public.scoped_counters.last_value INTO v;

  RETURN v;
END;
$func$;

-- Assign display_number (always)
CREATE OR REPLACE FUNCTION public.entity_display_number_bi()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $func$
BEGIN
  NEW.display_number := nextval('public.entity_display_seq')::int;
  RETURN NEW;
END;
$func$;

CREATE OR REPLACE FUNCTION public.client_display_number_bi()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $func$
BEGIN
  NEW.display_number := public.next_scoped_no('client', NEW.entity_id);
  RETURN NEW;
END;
$func$;

CREATE OR REPLACE FUNCTION public.service_display_number_bi()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $func$
BEGIN
  NEW.display_number := public.next_scoped_no('service', NEW.entity_id);
  RETURN NEW;
END;
$func$;

CREATE OR REPLACE FUNCTION public.appointment_display_number_bi()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $func$
BEGIN
  NEW.display_number := public.next_scoped_no('appointment', NEW.entity_id);
  RETURN NEW;
END;
$func$;

-- Touch updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $func$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$func$;

-- ---------- Triggers ----------
-- display_number
CREATE OR REPLACE TRIGGER entity_display_number_bi
BEFORE INSERT ON public.entity
FOR EACH ROW EXECUTE FUNCTION public.entity_display_number_bi();

CREATE OR REPLACE TRIGGER client_display_number_bi
BEFORE INSERT ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.client_display_number_bi();

CREATE OR REPLACE TRIGGER service_display_number_bi
BEFORE INSERT ON public.services
FOR EACH ROW EXECUTE FUNCTION public.service_display_number_bi();

CREATE OR REPLACE TRIGGER appointment_display_number_bi
BEFORE INSERT ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.appointment_display_number_bi();

-- updated_at
CREATE TRIGGER _100_touch_updated_at_entity
BEFORE UPDATE ON public.entity
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER _100_touch_updated_at_entity_members
BEFORE UPDATE ON public.entity_members
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER _100_touch_updated_at_clients
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER _100_touch_updated_at_services
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER _100_touch_updated_at_appointments
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------- Indexes ----------
-- Uniqueness for display numbers
CREATE UNIQUE INDEX IF NOT EXISTS entity_display_number_udx
  ON public.entity(display_number);

CREATE UNIQUE INDEX IF NOT EXISTS client_entity_display_number_udx
  ON public.clients(entity_id, display_number);

CREATE UNIQUE INDEX IF NOT EXISTS service_entity_display_number_udx
  ON public.services(entity_id, display_number);

CREATE UNIQUE INDEX IF NOT EXISTS appointment_entity_display_number_udx
  ON public.appointments(entity_id, display_number);

-- Covering indexes for foreign keys
CREATE INDEX IF NOT EXISTS client_entity_id_idx
  ON public.clients(entity_id);

CREATE INDEX IF NOT EXISTS service_entity_id_idx
  ON public.services(entity_id);

CREATE INDEX IF NOT EXISTS appointment_entity_id_idx
  ON public.appointments(entity_id);

CREATE INDEX IF NOT EXISTS appointment_client_id_idx
  ON public.appointments(client_id);

CREATE INDEX IF NOT EXISTS appointment_service_id_idx
  ON public.appointments(service_id);

CREATE INDEX IF NOT EXISTS entity_members_entity_id_idx
  ON public.entity_members(entity_id);

CREATE INDEX IF NOT EXISTS entity_members_user_id_idx
  ON public.entity_members(user_id);

CREATE INDEX IF NOT EXISTS scoped_counters_entity_id_idx
  ON public.scoped_counters(entity_id);

-- ---------- RLS ----------
ALTER TABLE public.entity           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments     ENABLE ROW LEVEL SECURITY;

-- Entity: members can read their entities
CREATE POLICY entity_select_own
ON public.entity
FOR SELECT TO authenticated
USING (public.is_member_of_entity(public.entity.id));

-- Entity members table: avoid per-row re-eval of auth.uid()
CREATE POLICY entity_members_select_self
ON public.entity_members
FOR SELECT TO authenticated
USING (public.entity_members.user_id = (SELECT auth.uid()));

-- Clients
CREATE POLICY member_select_clients
ON public.clients
FOR SELECT TO authenticated
USING (public.is_member_of_entity(public.clients.entity_id));

CREATE POLICY member_insert_clients
ON public.clients
FOR INSERT TO authenticated
WITH CHECK (public.is_member_of_entity(public.clients.entity_id));

CREATE POLICY member_update_clients
ON public.clients
FOR UPDATE TO authenticated
USING (public.is_member_of_entity(public.clients.entity_id))
WITH CHECK (public.is_member_of_entity(public.clients.entity_id));

CREATE POLICY member_delete_clients
ON public.clients
FOR DELETE TO authenticated
USING (public.is_member_of_entity(public.clients.entity_id));

-- Services
CREATE POLICY member_select_services
ON public.services
FOR SELECT TO authenticated
USING (public.is_member_of_entity(public.services.entity_id));

CREATE POLICY member_insert_services
ON public.services
FOR INSERT TO authenticated
WITH CHECK (public.is_member_of_entity(public.services.entity_id));

CREATE POLICY member_update_services
ON public.services
FOR UPDATE TO authenticated
USING (public.is_member_of_entity(public.services.entity_id))
WITH CHECK (public.is_member_of_entity(public.services.entity_id));

CREATE POLICY member_delete_services
ON public.services
FOR DELETE TO authenticated
USING (public.is_member_of_entity(public.services.entity_id));

-- Appointments
CREATE POLICY member_select_appointments
ON public.appointments
FOR SELECT TO authenticated
USING (public.is_member_of_entity(public.appointments.entity_id));

CREATE POLICY member_insert_appointments
ON public.appointments
FOR INSERT TO authenticated
WITH CHECK (public.is_member_of_entity(public.appointments.entity_id));

CREATE POLICY member_update_appointments
ON public.appointments
FOR UPDATE TO authenticated
USING (public.is_member_of_entity(public.appointments.entity_id))
WITH CHECK (public.is_member_of_entity(public.appointments.entity_id));

CREATE POLICY member_delete_appointments
ON public.appointments
FOR DELETE TO authenticated
USING (public.is_member_of_entity(public.appointments.entity_id));

-- ---------- Grants (lean, RLS-first) ----------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Functions: EXECUTE only to roles that need them
GRANT EXECUTE ON FUNCTION public.is_member_of_entity(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.next_scoped_no(text, uuid) TO authenticated;

-- Reset and grant minimum
REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

GRANT SELECT ON TABLE public.entity, public.entity_members TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.clients, public.services, public.appointments
  TO authenticated;

RESET ALL;
