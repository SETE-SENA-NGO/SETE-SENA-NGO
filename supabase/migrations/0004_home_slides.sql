-- Homepage hero slideshow slides, managed from the admin Slideshow screen
-- (one row per slide: image + overlay copy). The hero call-to-action
-- buttons are fixed in the frontend and are not stored per slide.
CREATE TABLE IF NOT EXISTS home_slides (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL DEFAULT '',
  alt TEXT NOT NULL DEFAULT '',
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE home_slides
  DROP COLUMN IF EXISTS primary_label,
  DROP COLUMN IF EXISTS primary_to,
  DROP COLUMN IF EXISTS secondary_label,
  DROP COLUMN IF EXISTS secondary_to;

ALTER TABLE home_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON home_slides FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write" ON home_slides FOR ALL USING (auth.role() = 'authenticated');
