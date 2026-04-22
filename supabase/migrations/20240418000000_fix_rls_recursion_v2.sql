-- FIX: Infinite recursion in brb_profiles RLS policy
-- This script optimizes the policies to avoid circular dependencies and includes missing helper functions.

-- 1. Redefine the role check function with extra safety
CREATE OR REPLACE FUNCTION public.brb_get_my_role()
RETURNS public.brb_user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.brb_profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 2. Define/Redefine the org_id helper (Fixes the "does not exist" error)
CREATE OR REPLACE FUNCTION public.get_auth_user_org_id()
RETURNS UUID 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT org_id FROM public.brb_profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Ensure these functions are owned by postgres to bypass RLS correctly
ALTER FUNCTION public.brb_get_my_role() OWNER TO postgres;
ALTER FUNCTION public.get_auth_user_org_id() OWNER TO postgres;

-- 3. Update brb_profiles policies
DROP POLICY IF EXISTS "Profiles are viewable by users who created them or by OWNERs." ON public.brb_profiles;
DROP POLICY IF EXISTS "Profiles are viewable by own user or by OWNERs." ON public.brb_profiles;
DROP POLICY IF EXISTS "Profiles viewable within org or self" ON public.brb_profiles;

CREATE POLICY "Profiles viewable by self or owners"
ON public.brb_profiles FOR SELECT
USING (
  id = auth.uid() OR
  public.brb_get_my_role() = 'OWNER'
);

-- 4. Update appointments policies
DROP POLICY IF EXISTS "Clients see their own appointments, Barbers see assigned, Owners see all" ON public.brb_appointments;
DROP POLICY IF EXISTS "Clients see own appointments, Barbers see assigned, Owners see all" ON public.brb_appointments;
DROP POLICY IF EXISTS "Appointments viewable within org or if customer" ON public.brb_appointments;

CREATE POLICY "Appointments multi_tenant_access"
ON public.brb_appointments FOR SELECT
USING (
  customer_id IN (SELECT id FROM public.brb_customers WHERE profile_id = auth.uid()) OR
  barber_id = auth.uid() OR
  public.brb_get_my_role() = 'OWNER'
);
