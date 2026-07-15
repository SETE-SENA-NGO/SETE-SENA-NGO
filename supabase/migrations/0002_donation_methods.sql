-- Donation methods shown on the public QR Donate page,
-- managed from the admin Donation screen (one row per bank).
CREATE TABLE IF NOT EXISTS donation_methods (
  id TEXT PRIMARY KEY,
  bank TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  header_color TEXT NOT NULL DEFAULT '#1d3d5c',
  qr_url TEXT NOT NULL DEFAULT '',
  account_name TEXT NOT NULL DEFAULT 'SANTI SENA',
  account_no TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'KHR / USD',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE donation_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON donation_methods FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write" ON donation_methods FOR ALL USING (auth.role() = 'authenticated');

-- Storage bucket for uploaded QR images. Public read so the donate page can
-- display them; only authenticated (admin) users can upload/replace/delete.
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated upload media" ON storage.objects;
CREATE POLICY "Authenticated upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated update media" ON storage.objects;
CREATE POLICY "Authenticated update media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated delete media" ON storage.objects;
CREATE POLICY "Authenticated delete media" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'authenticated');
