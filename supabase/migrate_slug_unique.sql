-- migrate_slug_unique.sql
-- Fix: vehicle slugs were generated from title only, causing duplicates.
-- New format: <slugified_title>-<ml_item_id>  (e.g. ford-focus-2019-nafta-MLA12345678)
-- ML item ids are stable unique identifiers, so the final slug is always unique.
--
-- This migration is idempotent: rows whose slug already ends with their id are skipped.

UPDATE public.vehicles
SET slug = slug || '-' || id
WHERE slug NOT LIKE '%' || id;

-- Optional: add a unique constraint to prevent future duplicates at the DB level.
-- Run only once; will fail harmlessly if the constraint already exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'vehicles_slug_key'
      AND conrelid = 'public.vehicles'::regclass
  ) THEN
    ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_slug_key UNIQUE (slug);
  END IF;
END $$;
