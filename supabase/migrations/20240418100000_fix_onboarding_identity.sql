-- SPRINT 1: Identity Journey
-- This migration sets 'PENDING' as the default role for new users to force onboarding.

-- 1. Add 'PENDING' to the role enum
-- Note: 'ALTER TYPE' cannot be in a transaction in some Postgres versions, 
-- but Supabase usually handles this or we can run it safely.
ALTER TYPE public.brb_user_role ADD VALUE IF NOT EXISTS 'PENDING' BEFORE 'OWNER';

-- 2. Add onboarding_completed flag to profiles
ALTER TABLE public.brb_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 3. Update the handle_new_user function to use PENDING
CREATE OR REPLACE FUNCTION public.brb_handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.brb_profiles (id, email, role, full_name, onboarding_completed, created_at, updated_at)
  VALUES (
    new.id, 
    new.email, 
    'PENDING'::public.brb_user_role, 
    new.raw_user_meta_data->>'full_name',
    false,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now()
  WHERE public.brb_profiles.email IS DISTINCT FROM EXCLUDED.email 
     OR public.brb_profiles.full_name IS DISTINCT FROM EXCLUDED.full_name;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update the trigger (re-apply just in case)
DROP TRIGGER IF EXISTS brb_on_auth_user_created ON auth.users;
CREATE TRIGGER brb_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.brb_handle_new_user();
