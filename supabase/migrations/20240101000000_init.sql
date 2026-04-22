-- Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum for roles
CREATE TYPE public.brb_user_role AS ENUM ('OWNER', 'BARBER', 'CLIENT');

-- Table: profiles
CREATE TABLE public.brb_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.brb_user_role DEFAULT 'CLIENT'::public.brb_user_role NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table: customers (CRM)
CREATE TABLE public.brb_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.brb_profiles(id) ON DELETE SET NULL, -- optional reference if they have an account
  phone TEXT,
  notes TEXT,
  total_visits INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Table: appointments (Agenda)
CREATE TABLE public.brb_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.brb_customers(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES public.brb_profiles(id) ON DELETE RESTRICT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  -- Ensure end time is after start time
  CONSTRAINT valid_appointment_time CHECK (end_time > start_time)
  -- Real constraint against overlapping logic can be implemented via GiST if btree_gist extension is enabled
);

-- Table: ledgers (Sillones / Finanzas)
CREATE TABLE public.brb_ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.brb_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('charge', 'payment')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Trigger to create profile after Auth user creation
CREATE OR REPLACE FUNCTION public.brb_handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.brb_profiles (id, email, role, full_name, created_at, updated_at)
  VALUES (
    new.id, 
    new.email, 
    'CLIENT', 
    new.raw_user_meta_data->>'full_name',
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

-- Drop trigger if it exists to avoid errors on multiple runs
DROP TRIGGER IF EXISTS brb_on_auth_user_created ON auth.users;

CREATE TRIGGER brb_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.brb_handle_new_user();

-- Row Level Security (RLS) setup

-- Profiles RLS
ALTER TABLE public.brb_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by users who created them or by OWNERs."
ON public.brb_profiles FOR SELECT
USING (
  auth.uid() = id OR 
  (SELECT role FROM public.brb_profiles WHERE id = auth.uid()) = 'OWNER'
);

CREATE POLICY "Users can update own profile."
ON public.brb_profiles FOR UPDATE
USING ( auth.uid() = id );

-- Appointments RLS
ALTER TABLE public.brb_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients see their own appointments, Barbers see assigned, Owners see all"
ON public.brb_appointments FOR SELECT
USING (
  customer_id IN (SELECT id FROM public.brb_customers WHERE profile_id = auth.uid())
  OR barber_id = auth.uid()
  OR (SELECT role FROM public.brb_profiles WHERE id = auth.uid()) = 'OWNER'
);

CREATE POLICY "Clients can insert own appointments"
ON public.brb_appointments FOR INSERT
WITH CHECK (
  customer_id IN (SELECT id FROM public.brb_customers WHERE profile_id = auth.uid())
  OR (SELECT role FROM public.brb_profiles WHERE id = auth.uid()) IN ('OWNER', 'BARBER')
);

-- Note: In a real environment, you'd execute this in the Supabase Dashboard SQL Editor or via CLI
