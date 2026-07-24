-- Allow the CMS to store one published page row per language.
-- Older installs created pages.slug as globally unique, which made Khmer
-- saves overwrite English content. The app now upserts by slug + locale.

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en';

ALTER TABLE public.pages
  DROP CONSTRAINT IF EXISTS pages_slug_key;

DROP INDEX IF EXISTS pages_slug_key;

CREATE UNIQUE INDEX IF NOT EXISTS pages_slug_locale_key
  ON public.pages (slug, locale);

CREATE UNIQUE INDEX IF NOT EXISTS pages_route_locale_key
  ON public.pages (route_path, locale)
  WHERE route_path IS NOT NULL;

SELECT pg_notify('pgrst', 'reload schema');
