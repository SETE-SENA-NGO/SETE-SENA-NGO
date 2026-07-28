-- ============================================================
-- FIX: Donation Save Issue
-- 
-- Run this in your Supabase SQL Editor (one block at a time)
-- to fix the "Save changes" failing on /admin/donate
-- ============================================================

-- ============================================================
-- BLOCK 1: Ensure the is_content_admin() function exists
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_content_admin()
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

-- ============================================================
-- BLOCK 2: Create the donation_methods table (if missing)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.donation_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  method_type text NOT NULL DEFAULT 'bank_qr',
  instructions text,
  account_name text,
  account_number text,
  currency text,
  qr_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- BLOCK 3: Set up the updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_on_donation_methods ON public.donation_methods;
CREATE TRIGGER set_updated_at_on_donation_methods
  BEFORE UPDATE ON public.donation_methods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- BLOCK 4: Enable Row Level Security & Create Policies
-- ============================================================
ALTER TABLE public.donation_methods ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first
DROP POLICY IF EXISTS "Allow public read" ON public.donation_methods;
DROP POLICY IF EXISTS "Allow authenticated write" ON public.donation_methods;
DROP POLICY IF EXISTS "Active donation methods are public" ON public.donation_methods;
DROP POLICY IF EXISTS "Content admins can manage donation methods" ON public.donation_methods;
DROP POLICY IF EXISTS "Admins can write donation methods" ON public.donation_methods;

-- Allow the public to read active donation methods
CREATE POLICY "Active donation methods are public"
  ON public.donation_methods FOR SELECT
  USING (is_active OR public.is_content_admin());

-- Allow content admins to manage (insert/update/delete) donation methods
CREATE POLICY "Content admins can manage donation methods"
  ON public.donation_methods FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

-- ============================================================
-- BLOCK 5: Seed default donation methods (ABA & ACLEDA)
-- ============================================================
INSERT INTO public.donation_methods (slug, name, method_type, instructions, account_name, account_number, currency, sort_order, is_active, metadata)
VALUES
  ('aba', 'ABA Pay', 'bank_qr', 'ABA BANK - CAMBODIA', 'SANTI SENA', '000 000 000', 'KHR / USD', 1, true, jsonb_build_object('bank', 'ABA Pay', 'subtitle', 'ABA BANK - CAMBODIA', 'header_color', '#0d2c63')),
  ('acleda', 'ACLEDA Bank', 'bank_qr', 'ACLEDA - CAMBODIA', 'SANTI SENA', '0000 0000 000', 'KHR / USD', 2, true, jsonb_build_object('bank', 'ACLEDA Bank', 'subtitle', 'ACLEDA - CAMBODIA', 'header_color', '#1d3d5c'))
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  instructions = EXCLUDED.instructions,
  account_name = EXCLUDED.account_name,
  account_number = EXCLUDED.account_number,
  currency = EXCLUDED.currency,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- ============================================================
-- BLOCK 6: Ensure the admin user has super_admin role
-- (Replace 'admin@santisena.org' with YOUR actual login email)
-- ============================================================
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'super_admin'
FROM auth.users
WHERE email IN ('santisenacambodia@gmail.com')
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  role = 'super_admin',
  updated_at = now();

-- Also set the trigger for auto-creating profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN NEW.email IN ('santisenacambodia@gmail.com') THEN 'super_admin'
      ELSE 'viewer'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = COALESCE(public.profiles.email, EXCLUDED.email),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- BLOCK 7: Verify everything is set up correctly
-- ============================================================
SELECT '✅ donation_methods table exists' AS result
FROM information_schema.tables
WHERE table_name = 'donation_methods'
UNION ALL
SELECT '✅ is_content_admin function exists' AS result
FROM pg_proc WHERE proname = 'is_content_admin'
UNION ALL
SELECT '✅ RLS policies are set' AS result
FROM pg_policies WHERE tablename = 'donation_methods';
