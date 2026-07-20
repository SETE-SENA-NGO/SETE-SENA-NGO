-- ============================================================
-- COMPLETE SUPABASE SETUP for Santi Sena NGO Admin Login
-- Run this entire script in Supabase Dashboard > SQL Editor
-- ============================================================

-- Step 1: Create the admin user in Supabase Auth FIRST
-- Go to: Authentication > Users > Add User
--   Email: your real admin email
--   Password: a strong unique password
--
-- Replace replace-with-your-admin-email@example.org below with that admin email.
--
-- After creating that user, run everything below:

-- Step 2: Ensure profiles table exists with proper columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer'
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Add role constraint
DO $$
BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can upsert profiles" ON public.profiles;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can upsert profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- Step 3: Grant your admin user the super_admin role
INSERT INTO public.profiles (id, email, role, full_name)
SELECT
  id,
  email,
  'super_admin',
  'Admin'
FROM auth.users
WHERE LOWER(email) = LOWER('replace-with-your-admin-email@example.org')
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  role = 'super_admin',
  full_name = EXCLUDED.full_name,
  updated_at = now();

-- Step 4: Verify the result
SELECT id, email, role, full_name, created_at
FROM public.profiles
WHERE LOWER(email) = LOWER('replace-with-your-admin-email@example.org');
