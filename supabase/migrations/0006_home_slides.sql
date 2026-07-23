-- Homepage hero slideshow slides, managed from the admin Slideshow screen
-- (one row per slide: image + overlay copy). The hero call-to-action
-- buttons are fixed in the frontend and are not stored per slide.
CREATE TABLE IF NOT EXISTS public.home_slides (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL DEFAULT '',
  alt TEXT NOT NULL DEFAULT '',
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.home_slides
  DROP COLUMN IF EXISTS primary_label,
  DROP COLUMN IF EXISTS primary_to,
  DROP COLUMN IF EXISTS secondary_label,
  DROP COLUMN IF EXISTS secondary_to;

ALTER TABLE public.home_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.home_slides;
DROP POLICY IF EXISTS "Allow authenticated write" ON public.home_slides;
DROP POLICY IF EXISTS "Home slides are public" ON public.home_slides;
DROP POLICY IF EXISTS "Content admins can manage home slides" ON public.home_slides;

CREATE POLICY "Home slides are public"
  ON public.home_slides FOR SELECT
  USING (true);

CREATE POLICY "Content admins can manage home slides"
  ON public.home_slides FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());
