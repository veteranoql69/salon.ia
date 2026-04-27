-- Add invited_email to track who was invited
ALTER TABLE brb_invite_codes ADD COLUMN IF NOT EXISTS invited_email TEXT;
ALTER TABLE brb_invite_codes ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
