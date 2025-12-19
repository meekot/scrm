-- Clients list with stats (pagination + search + sort)
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);

CREATE OR REPLACE FUNCTION public.list_clients_with_stats(
  entity_id uuid,
  search_query text DEFAULT NULL,
  sort_by text DEFAULT 'created_desc',
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  phone text,
  instagram text,
  lead_source text,
  display_number integer,
  entity_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  appointment_count integer,
  total_spent numeric,
  last_appointment_at timestamptz
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  WITH base AS (
    SELECT
      c.id,
      c.name,
      c.phone,
      c.instagram,
      c.lead_source,
      c.display_number,
      c.entity_id,
      c.created_at,
      c.updated_at,
      COUNT(a.id)::int AS appointment_count,
      COALESCE(SUM(a.price), 0) AS total_spent,
      MAX((a.date::timestamp + COALESCE(a.time, '00:00')::time)) AS last_appointment_at
    FROM public.clients c
    LEFT JOIN public.appointments a
      ON a.client_id = c.id
      AND a.entity_id = c.entity_id
    WHERE c.entity_id = list_clients_with_stats.entity_id
      AND public.is_member_of_entity(c.entity_id)
      AND (
        search_query IS NULL
        OR search_query = ''
        OR c.name ILIKE '%' || search_query || '%'
        OR c.phone ILIKE '%' || search_query || '%'
        OR c.instagram ILIKE '%' || search_query || '%'
        OR c.display_number::text ILIKE '%' || search_query || '%'
      )
    GROUP BY
      c.id,
      c.name,
      c.phone,
      c.instagram,
      c.lead_source,
      c.display_number,
      c.entity_id,
      c.created_at,
      c.updated_at
  )
  SELECT *
  FROM base
  ORDER BY
    CASE WHEN sort_by = 'display_asc' THEN base.display_number END ASC,
    CASE WHEN sort_by = 'created_desc' THEN base.created_at END DESC,
    CASE WHEN sort_by = 'last_appointment_desc' THEN base.last_appointment_at END DESC NULLS LAST,
    CASE WHEN sort_by = 'appointment_count_desc' THEN base.appointment_count END DESC,
    CASE WHEN sort_by = 'spent_desc' THEN base.total_spent END DESC,
    base.display_number ASC
  LIMIT limit_count
  OFFSET offset_count;
$$;

GRANT EXECUTE ON FUNCTION public.list_clients_with_stats(uuid, text, text, integer, integer) TO authenticated;

RESET ALL;
