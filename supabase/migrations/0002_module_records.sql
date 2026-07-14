CREATE TABLE IF NOT EXISTS module_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  author TEXT NOT NULL DEFAULT 'Admin',
  category TEXT NOT NULL DEFAULT 'General',
  summary TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_module_records_module ON module_records(module);
CREATE INDEX IF NOT EXISTS idx_module_records_status ON module_records(status);

ALTER TABLE module_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON module_records
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert" ON module_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON module_records
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON module_records
  FOR DELETE USING (auth.role() = 'authenticated');
