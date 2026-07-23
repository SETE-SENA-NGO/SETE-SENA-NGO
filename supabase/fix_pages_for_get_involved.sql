-- Quick fix for the Get Involved admin manager.
-- Run this in Supabase Dashboard > SQL Editor when the app shows:
-- "Supabase cannot find public.pages".
--
-- For the full production schema, still run the files listed in supabase/SETUP.md.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  role text NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '{}',
  route_path text,
  nav_group text,
  locale text NOT NULL DEFAULT 'en',
  template text NOT NULL DEFAULT 'standard',
  status text NOT NULL DEFAULT 'published',
  hero_eyebrow text,
  hero_headline text,
  hero_intro text,
  primary_cta_label text,
  primary_cta_url text,
  secondary_cta_label text,
  secondary_cta_url text,
  seo_title text,
  seo_description text,
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS body text NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS route_path text,
  ADD COLUMN IF NOT EXISTS nav_group text,
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS template text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS hero_eyebrow text,
  ADD COLUMN IF NOT EXISTS hero_headline text,
  ADD COLUMN IF NOT EXISTS hero_intro text,
  ADD COLUMN IF NOT EXISTS primary_cta_label text,
  ADD COLUMN IF NOT EXISTS primary_cta_url text,
  ADD COLUMN IF NOT EXISTS secondary_cta_label text,
  ADD COLUMN IF NOT EXISTS secondary_cta_url text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'editor')
  );
$$;

-- Promote your current admin account. Replace this email before running.
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'super_admin'
FROM auth.users
WHERE lower(email) = lower('replace-with-your-admin-email@example.org')
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = now();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
CREATE POLICY "Admins manage profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow public read" ON public.pages;
DROP POLICY IF EXISTS "Published pages are public" ON public.pages;
CREATE POLICY "Published pages are public"
  ON public.pages FOR SELECT
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated write" ON public.pages;
DROP POLICY IF EXISTS "Admins can write pages" ON public.pages;
DROP POLICY IF EXISTS "Content admins can manage pages" ON public.pages;
CREATE POLICY "Admins can write pages"
  ON public.pages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.pages (
  slug,
  title,
  body,
  route_path,
  nav_group,
  status,
  hero_headline,
  hero_intro,
  seo_title,
  seo_description,
  published_at
)
VALUES (
  'get-involved',
  'Get Involved',
  '{}',
  '/get-involved',
  'Get Involved',
  'published',
  'Support village peace.',
  'Since 1994, Santi Sena has worked with villages on peace, livelihoods, education, child protection and the environment.',
  'Get Involved',
  'Get involved with Santi Sena through donation, partnership or volunteer support.',
  now()
)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    route_path = EXCLUDED.route_path,
    nav_group = EXCLUDED.nav_group,
    status = EXCLUDED.status,
    updated_at = now();

SELECT pg_notify('pgrst', 'reload schema');
