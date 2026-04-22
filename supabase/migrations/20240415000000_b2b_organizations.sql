-- Migration: 20240415000000_b2b_organizations.sql

-- 1. Create Organizations table (Salones / Barberias)
CREATE TABLE public.brb_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.brb_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rut TEXT UNIQUE,
  business_type TEXT CHECK (business_type IN ('barberia', 'peluqueria', 'centro_estetica', 'centro_belleza', 'independiente', 'otro')),
  phone_whatsapp TEXT,
  address TEXT,
  is_home_based BOOLEAN DEFAULT false,
  opening_hours JSONB,
  email_domain TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Modify existing tables to include org_id
-- We assume it's fine if they are null initially, but for a strict B2B model they eventually should be NOT NULL where applicable.
ALTER TABLE public.brb_profiles ADD COLUMN org_id UUID REFERENCES public.brb_organizations(id) ON DELETE SET NULL;
ALTER TABLE public.brb_customers ADD COLUMN org_id UUID REFERENCES public.brb_organizations(id) ON DELETE CASCADE;
ALTER TABLE public.brb_appointments ADD COLUMN org_id UUID REFERENCES public.brb_organizations(id) ON DELETE CASCADE;
ALTER TABLE public.brb_ledgers ADD COLUMN org_id UUID REFERENCES public.brb_organizations(id) ON DELETE CASCADE;

-- 3. Create Chairs table (Sillones)
CREATE TABLE public.brb_chairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.brb_organizations(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  assigned_barber_id UUID REFERENCES public.brb_profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Create Rental Configs table (Contratos / Finanzas de arriendo)
CREATE TABLE public.brb_rental_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chair_id UUID REFERENCES public.brb_chairs(id) ON DELETE CASCADE NOT NULL,
  barber_id UUID REFERENCES public.brb_profiles(id) ON DELETE CASCADE,
  modality TEXT CHECK (modality IN ('fixed', 'percentage', 'mixed')),
  fixed_amount DECIMAL(10,2) DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  billing_frequency TEXT CHECK (billing_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  barber_uses_own_products BOOLEAN DEFAULT true,
  barber_uses_salon_products BOOLEAN DEFAULT false,
  salon_product_surcharge DECIMAL(10,2) DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Create Join Requests & Invites table
CREATE TABLE public.brb_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.brb_organizations(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES public.brb_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  invite_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  resolved_at TIMESTAMPTZ
);

CREATE TABLE public.brb_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.brb_organizations(id) ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  chair_id UUID REFERENCES public.brb_chairs(id) ON DELETE SET NULL,
  used_by UUID REFERENCES public.brb_profiles(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Row Level Security Updates

-- Create a helper function to avoid infinite recursion when policies query brb_profiles
CREATE OR REPLACE FUNCTION public.get_auth_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM public.brb_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop previous single-tenant policies
DROP POLICY IF EXISTS "Profiles are viewable by users who created them or by OWNERs." ON public.brb_profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.brb_profiles;
DROP POLICY IF EXISTS "Clients see their own appointments, Barbers see assigned, Owners see all" ON public.brb_appointments;
DROP POLICY IF EXISTS "Clients can insert own appointments" ON public.brb_appointments;

-- New Multi-Tenant RLS for Profiles
-- A profile can view themselves. If they are an OWNER, they can view all profiles in their org. If they are a BARBER, they can view profiles in their org.
CREATE POLICY "Profiles viewable within org or self" ON public.brb_profiles FOR SELECT
USING (
  id = auth.uid() OR
  (org_id IS NOT NULL AND org_id = public.get_auth_user_org_id())
);

CREATE POLICY "Users update own profile" ON public.brb_profiles FOR UPDATE
USING (id = auth.uid());

-- New Multi-Tenant RLS for Organizations
ALTER TABLE public.brb_organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orgs viewable by their members" ON public.brb_organizations FOR SELECT
USING (
  id IN (SELECT org_id FROM public.brb_profiles WHERE id = auth.uid()) OR
  owner_id = auth.uid()
);
CREATE POLICY "Orgs insertable by anyone becoming owner" ON public.brb_organizations FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- New Multi-Tenant RLS for Appointments
CREATE POLICY "Appointments viewable within org or if customer" ON public.brb_appointments FOR SELECT
USING (
  customer_id IN (SELECT id FROM public.brb_customers WHERE profile_id = auth.uid()) OR
  (org_id IS NOT NULL AND org_id = public.get_auth_user_org_id())
);

CREATE POLICY "Appointments insertable within org" ON public.brb_appointments FOR INSERT
WITH CHECK (
  (org_id IS NOT NULL AND org_id = public.get_auth_user_org_id()) OR
  customer_id IN (SELECT id FROM public.brb_customers WHERE profile_id = auth.uid())
);

-- RLS for Chairs
ALTER TABLE public.brb_chairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chairs viewable within org" ON public.brb_chairs FOR SELECT
USING (org_id = public.get_auth_user_org_id());

CREATE POLICY "Chairs manageable by org owner" ON public.brb_chairs FOR ALL
USING (
  org_id IN (SELECT id FROM public.brb_organizations WHERE owner_id = auth.uid())
);

-- RLS for Rental Configs
ALTER TABLE public.brb_rental_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rental Configs viewable by owner and assigned barber" ON public.brb_rental_configs FOR SELECT
USING (
  barber_id = auth.uid() OR
  chair_id IN (SELECT id FROM public.brb_chairs WHERE org_id IN (SELECT id FROM public.brb_organizations WHERE owner_id = auth.uid()))
);

-- Note: We rely on Supabase local reset or manual wiping of mock data as requested
