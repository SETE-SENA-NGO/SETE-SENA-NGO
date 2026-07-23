-- Enforce the admin role at the database level. Before this migration, any
-- authenticated user could write pages, donation methods and storage objects.
-- Now writes require profiles.role = 'admin'.

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
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- profiles: replace the old self-referencing policy (infinite recursion).
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can upsert profiles" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON profiles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- pages: public read stays; writes now require admin.
DROP POLICY IF EXISTS "Allow authenticated write" ON pages;
CREATE POLICY "Admins can write pages" ON pages
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- donation_methods: public read stays; writes now require admin.
DROP POLICY IF EXISTS "Allow authenticated write" ON donation_methods;
CREATE POLICY "Admins can write donation methods" ON donation_methods
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- media storage: public read stays; upload/replace/delete now require admin.
DROP POLICY IF EXISTS "Authenticated upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete media" ON storage.objects;

CREATE POLICY "Admins upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND is_admin());
CREATE POLICY "Admins update media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND is_admin());
CREATE POLICY "Admins delete media" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND is_admin());

-- Auto-create a profile whenever an auth user is created, so admin accounts
-- work no matter whether the user is created before or after this migration.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (
    NEW.id,
    CASE
      WHEN NEW.email IN ('admin@santisena.org', 'sannsiv49@gmail.com') THEN 'admin'
      ELSE 'viewer'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant the admin role to the site admin accounts, if they exist already.
INSERT INTO profiles (id, role)
SELECT id, 'admin' FROM auth.users
WHERE email IN ('admin@santisena.org', 'sannsiv49@gmail.com')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
