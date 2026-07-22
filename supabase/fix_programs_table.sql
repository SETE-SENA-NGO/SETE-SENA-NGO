-- ============================================================
-- FIX: Create the programs table + RLS for Education Dashboard
-- ============================================================
-- Copy & paste the ENTIRE block below into Supabase SQL Editor
-- and click RUN. This is SAFE to run multiple times.
-- ============================================================

-- 1. Create the programs table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  pillar TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published',
  metadata JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Allow public read + any authenticated user can write
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read" ON public.programs;
DROP POLICY IF EXISTS "Allow authenticated write" ON public.programs;
DROP POLICY IF EXISTS "Published programs are public" ON public.programs;
DROP POLICY IF EXISTS "Content admins can manage programs" ON public.programs;

CREATE POLICY "Allow public read" ON public.programs
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write" ON public.programs
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 3. Create profiles table (needed for admin login role)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'viewer',
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can upsert own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can upsert own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Grant your admin user the 'admin' role
--    ⚠️ CHANGE this email to YOUR admin login email before running!
INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
  id,
  email,
  'admin',
  'Admin'
FROM auth.users
WHERE LOWER(email) = LOWER('replace-with-your-admin-email@example.org')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = 'admin',
  full_name = EXCLUDED.full_name,
  updated_at = now();

-- 5. Seed the education program row (so it exists)
INSERT INTO public.programs (slug, title, pillar, summary, description, status, metadata)
VALUES (
  'programs-education',
  'Education Program',
  'Education',
  'Community pre-schools, mobile libraries, scholarships and Buddhist education.',
  'Helping rural children keep learning through local teachers, libraries and family support.',
  'published',
  '{}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  pillar = EXCLUDED.pillar,
  status = 'published',
  updated_at = now();

-- 6. Refresh the schema cache so Supabase API finds the table NOW
NOTIFY pgrst, 'reload schema';

-- 7. VERIFICATION — run these to confirm everything worked
SELECT '✅ programs table' AS check_name, COUNT(*) AS rows FROM public.programs;
SELECT '✅ profiles table' AS check_name, COUNT(*) AS rows FROM public.profiles;
SELECT '✅ your admin profile' AS check_name, email, role FROM public.profiles WHERE role = 'admin';
