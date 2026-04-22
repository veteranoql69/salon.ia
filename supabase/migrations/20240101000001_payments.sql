-- Table: payments (Finanzas / Señas)
CREATE TABLE public.brb_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.brb_appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CLP',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Row Level Security (RLS) setup
ALTER TABLE public.brb_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments viewable by involved clients and barbers/owners"
ON public.brb_payments FOR SELECT
USING (
  appointment_id IN (
    SELECT id FROM public.brb_appointments WHERE 
      customer_id IN (SELECT id FROM public.brb_customers WHERE profile_id = auth.uid())
      OR barber_id = auth.uid()
  )
  OR (SELECT role FROM public.brb_profiles WHERE id = auth.uid()) = 'OWNER'
);

-- Note: In a real environment, you'd execute this in the Supabase Dashboard SQL Editor or via CLI
