-- Service gain per service (all time, completed only)
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);

CREATE OR REPLACE FUNCTION public.get_service_gain(entity_id uuid)
RETURNS TABLE (service_id uuid, total_revenue numeric, appointments_count integer)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT
    a.service_id,
    COALESCE(SUM(a.price), 0) AS total_revenue,
    COUNT(*)::int AS appointments_count
  FROM public.appointments a
  WHERE a.entity_id = get_service_gain.entity_id
    AND a.status = 'completed'
    AND a.service_id IS NOT NULL
  GROUP BY a.service_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_service_gain(uuid) TO authenticated;

RESET ALL;
