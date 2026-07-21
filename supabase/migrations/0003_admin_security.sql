-- Enforce admin roles at the database level. Before this migration, any
-- authenticated user could write some admin-managed tables.
-- Now writes require profiles.role to be super_admin, admin, or editor.

-- SECURITY DEFINER so policies can check the caller's role without
-- re-triggering RLS on profiles (a plain subquery would recurse).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'editor')
  );
$$;

-- profiles: replace the old self-referencing policy (infinite recursion).
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can upsert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins manage profiles" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON profiles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- pages: public read stays; writes now require admin.
DROP POLICY IF EXISTS "Allow authenticated write" ON pages;
DROP POLICY IF EXISTS "Admins can write pages" ON pages;
CREATE POLICY "Admins can write pages" ON pages
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- donation_methods: public read stays; writes now require admin.
DROP POLICY IF EXISTS "Allow authenticated write" ON donation_methods;
DROP POLICY IF EXISTS "Admins can write donation methods" ON donation_methods;
CREATE POLICY "Admins can write donation methods" ON donation_methods
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Media images are stored as external URLs in public.media_assets.
-- No Supabase Storage bucket or object policy is required.

-- Auto-create a viewer profile whenever an auth user is created. Promote users
-- by editing public.profiles.role or by running create_admin_profile.sql.
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
    'viewer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Promote the customer's first admin by running supabase/create_admin_profile.sql
-- after creating the Auth user in Supabase Dashboard.
