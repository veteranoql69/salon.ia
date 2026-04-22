-- Fix: RLS policy on brb_profiles has a recursive subquery.
-- The OWNER check does "SELECT role FROM brb_profiles" which re-triggers
-- the same RLS policy, causing an infinite loop / empty error.
--
-- Solution: use a SECURITY DEFINER function to bypass RLS when checking the role.

CREATE OR REPLACE FUNCTION public.brb_get_my_role()
RETURNS public.brb_user_role AS $$
  SELECT role FROM public.brb_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Recreate profiles SELECT policy without recursion
DROP POLICY IF EXISTS "Profiles are viewable by users who created them or by OWNERs." ON public.brb_profiles;

CREATE POLICY "Profiles are viewable by own user or by OWNERs."
ON public.brb_profiles FOR SELECT
USING (
  auth.uid() = id OR
  public.brb_get_my_role() = 'OWNER'
);

-- Also fix the appointments policies that have the same recursive pattern
DROP POLICY IF EXISTS "Clients see their own appointments, Barbers see assigned, Owners see all" ON public.brb_appointments;

CREATE POLICY "Clients see own appointments, Barbers see assigned, Owners see all"
ON public.brb_appointments FOR SELECT
USING (
  customer_id IN (SELECT id FROM public.brb_customers WHERE profile_id = auth.uid())
  OR barber_id = auth.uid()
  OR public.brb_get_my_role() = 'OWNER'
);

DROP POLICY IF EXISTS "Clients can insert own appointments" ON public.brb_appointments;

CREATE POLICY "Clients can insert own appointments"
ON public.brb_appointments FOR INSERT
WITH CHECK (
  customer_id IN (SELECT id FROM public.brb_customers WHERE profile_id = auth.uid())
  OR public.brb_get_my_role() IN ('OWNER', 'BARBER')
);
