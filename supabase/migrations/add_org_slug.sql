-- Add slug column to brb_organizations
ALTER TABLE brb_organizations ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Generate slugs for any existing organizations (without unaccent extension)
UPDATE brb_organizations
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;
