CREATE TABLE IF NOT EXISTS public.module_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  author TEXT NOT NULL DEFAULT 'Admin',
  category TEXT NOT NULL DEFAULT 'General',
  summary TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  ALTER TABLE public.module_records
    ADD CONSTRAINT module_records_status_check
    CHECK (status IN ('Published', 'Draft', 'Archived'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

DROP INDEX IF EXISTS public.idx_module_records_module;
DROP INDEX IF EXISTS public.idx_module_records_status;

CREATE INDEX IF NOT EXISTS module_records_module_idx ON public.module_records(module);
CREATE INDEX IF NOT EXISTS module_records_status_idx ON public.module_records(status);

ALTER TABLE public.module_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.module_records;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.module_records;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.module_records;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.module_records;
DROP POLICY IF EXISTS "Content admins can manage module records" ON public.module_records;

CREATE POLICY "Content admins can manage module records"
  ON public.module_records FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());
