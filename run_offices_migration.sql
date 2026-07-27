-- Run this in your Supabase Dashboard → SQL Editor
-- This creates the offices table that's returning 404 errors

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.offices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  office_type text NOT NULL DEFAULT 'field',
  province text,
  address text,
  email text,
  phone text,
  office_hours text,
  map_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (office_type IN ('head', 'field', 'contact'))
);

-- 2. Create index
CREATE INDEX IF NOT EXISTS offices_visible_sort_idx
  ON public.offices (is_visible, sort_order);

-- 3. Create the trigger for updated_at (requires the set_updated_at function)
DROP TRIGGER IF EXISTS set_updated_at_on_offices ON public.offices;
CREATE TRIGGER set_updated_at_on_offices
  BEFORE UPDATE ON public.offices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Enable Row Level Security
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
DROP POLICY IF EXISTS "Visible offices are public" ON public.offices;
DROP POLICY IF EXISTS "Content admins can manage offices" ON public.offices;

CREATE POLICY "Visible offices are public"
  ON public.offices FOR SELECT
  USING (is_visible OR public.is_content_admin());

CREATE POLICY "Content admins can manage offices"
  ON public.offices FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

-- 6. Seed initial data
INSERT INTO public.offices (slug, name, office_type, province, address, email, phone, sort_order, is_visible)
VALUES
  ('head-office', 'Head Office', 'head', 'Svay Rieng', 'Svay Rieng Town, Svay Rieng Province', 'info@santisena.org', '+855 (0) 12 345 678', 1, true),
  ('prey-veng-field-office', 'Prey Veng Field Office', 'field', 'Prey Veng', 'Prey Veng Town, Prey Veng Province', 'preyveng@santisena.org', '+855 (0) 12 111 222', 2, true),
  ('kratie-field-office', 'Kratie Field Office', 'field', 'Kratie', 'Kratie Town, Kratie Province', 'kratie@santisena.org', '+855 (0) 12 333 444', 3, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  is_visible = true,
  updated_at = now();

-- 7. Verify
SELECT '✅ offices table created' AS status;
SELECT * FROM public.offices ORDER BY sort_order;
