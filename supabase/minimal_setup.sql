-- ============================================================
-- MINIMAL SETUP — Essential tables for admin content saving
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Create the pages table (required for Education Dashboard save)
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Allow public read + authenticated write
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow public read" ON public.pages;
DROP POLICY IF EXISTS "Allow authenticated write" ON public.pages;
DROP POLICY IF EXISTS "Published pages are public" ON public.pages;
DROP POLICY IF EXISTS "Content admins can manage pages" ON public.pages;

CREATE POLICY "Allow public read" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write" ON public.pages FOR ALL USING (auth.role() = 'authenticated');

-- 3. Create profiles table (needed for admin login)
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
DROP POLICY IF EXISTS "Admins can upsert profiles" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can upsert own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 4. Grant your admin user the admin role (REPLACE with your email!)
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

-- 5. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- 6. Verification
SELECT '✅ pages table exists' AS status, COUNT(*) AS count FROM public.pages;
SELECT '✅ profiles created' AS status, email, role, full_name FROM public.profiles WHERE role = 'admin';
