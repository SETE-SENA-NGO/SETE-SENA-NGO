-- Admin-editable content schema for the Santi Sena NGO website.
-- Keeps the existing pages.body JSON contract while adding normalized tables
-- that are easier to expose in an admin UI.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

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

CREATE OR REPLACE FUNCTION public.is_super_admin()
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
      AND role = 'super_admin'
  );
$$;

CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL DEFAULT 'google-drive',
  path text NOT NULL,
  public_url text,
  file_name text NOT NULL,
  alt_text text,
  caption text,
  mime_type text,
  file_size bigint CHECK (file_size IS NULL OR file_size >= 0),
  width integer CHECK (width IS NULL OR width > 0),
  height integer CHECK (height IS NULL OR height > 0),
  folder text,
  tags text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bucket, path)
);

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS route_path text,
  ADD COLUMN IF NOT EXISTS nav_group text,
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS template text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS hero_eyebrow text,
  ADD COLUMN IF NOT EXISTS hero_headline text,
  ADD COLUMN IF NOT EXISTS hero_intro text,
  ADD COLUMN IF NOT EXISTS hero_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS primary_cta_label text,
  ADD COLUMN IF NOT EXISTS primary_cta_url text,
  ADD COLUMN IF NOT EXISTS secondary_cta_label text,
  ADD COLUMN IF NOT EXISTS secondary_cta_url text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}';

DO $$
BEGIN
  ALTER TABLE public.pages
    ADD CONSTRAINT pages_status_check
    CHECK (status IN ('draft', 'published', 'archived'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS pages_route_locale_key
  ON public.pages (route_path, locale)
  WHERE route_path IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  slug text NOT NULL,
  label text NOT NULL,
  section_type text NOT NULL DEFAULT 'content',
  sort_order integer NOT NULL DEFAULT 0,
  heading text,
  subheading text,
  body text,
  media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  settings jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_id, slug),
  CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE TABLE IF NOT EXISTS public.section_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.page_sections(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  subtitle text,
  body text,
  item_value text,
  href text,
  media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (section_id, slug)
);

CREATE TABLE IF NOT EXISTS public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_key text NOT NULL DEFAULT 'header',
  parent_id uuid REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  page_id uuid REFERENCES public.pages(id) ON DELETE SET NULL,
  label text NOT NULL,
  description text,
  url text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  open_in_new_tab boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  label text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  field_type text NOT NULL DEFAULT 'text',
  group_key text NOT NULL DEFAULT 'general',
  is_public boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  page_id uuid REFERENCES public.pages(id) ON DELETE SET NULL,
  title text NOT NULL,
  pillar text NOT NULL,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  hero_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  icon text,
  color text,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published',
  published_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE TABLE IF NOT EXISTS public.news_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  color text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id integer UNIQUE,
  slug text UNIQUE NOT NULL,
  category_id uuid REFERENCES public.news_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  featured_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  author_name text NOT NULL DEFAULT 'Santi Sena Communications Team',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  read_time text,
  published_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  partner_type text NOT NULL DEFAULT 'supporter',
  description text,
  website_url text,
  logo_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, partner_type)
);

CREATE TABLE IF NOT EXISTS public.impact_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key text UNIQUE NOT NULL,
  page_id uuid REFERENCES public.pages(id) ON DELETE SET NULL,
  label text NOT NULL,
  value_text text NOT NULL,
  unit text,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.impact_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_year integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_year, title)
);

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

CREATE TABLE IF NOT EXISTS public.content_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_table text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL DEFAULT 'update',
  snapshot jsonb NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_sections_page_sort_idx
  ON public.page_sections (page_id, sort_order);
CREATE INDEX IF NOT EXISTS section_items_section_sort_idx
  ON public.section_items (section_id, sort_order);
CREATE INDEX IF NOT EXISTS navigation_items_menu_sort_idx
  ON public.navigation_items (menu_key, parent_id, sort_order);
CREATE INDEX IF NOT EXISTS programs_status_sort_idx
  ON public.programs (status, sort_order);
CREATE INDEX IF NOT EXISTS news_posts_publish_idx
  ON public.news_posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS partners_visible_sort_idx
  ON public.partners (is_visible, sort_order);
CREATE INDEX IF NOT EXISTS offices_visible_sort_idx
  ON public.offices (is_visible, sort_order);

DROP TRIGGER IF EXISTS set_updated_at_on_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_on_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_pages ON public.pages;
CREATE TRIGGER set_updated_at_on_pages
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_media_assets ON public.media_assets;
CREATE TRIGGER set_updated_at_on_media_assets
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_page_sections ON public.page_sections;
CREATE TRIGGER set_updated_at_on_page_sections
  BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_section_items ON public.section_items;
CREATE TRIGGER set_updated_at_on_section_items
  BEFORE UPDATE ON public.section_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_navigation_items ON public.navigation_items;
CREATE TRIGGER set_updated_at_on_navigation_items
  BEFORE UPDATE ON public.navigation_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_site_settings ON public.site_settings;
CREATE TRIGGER set_updated_at_on_site_settings
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_programs ON public.programs;
CREATE TRIGGER set_updated_at_on_programs
  BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_news_categories ON public.news_categories;
CREATE TRIGGER set_updated_at_on_news_categories
  BEFORE UPDATE ON public.news_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_news_posts ON public.news_posts;
CREATE TRIGGER set_updated_at_on_news_posts
  BEFORE UPDATE ON public.news_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_partners ON public.partners;
CREATE TRIGGER set_updated_at_on_partners
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_impact_metrics ON public.impact_metrics;
CREATE TRIGGER set_updated_at_on_impact_metrics
  BEFORE UPDATE ON public.impact_metrics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_impact_timeline_events ON public.impact_timeline_events;
CREATE TRIGGER set_updated_at_on_impact_timeline_events
  BEFORE UPDATE ON public.impact_timeline_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_offices ON public.offices;
CREATE TRIGGER set_updated_at_on_offices
  BEFORE UPDATE ON public.offices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_on_donation_methods ON public.donation_methods;
CREATE TRIGGER set_updated_at_on_donation_methods
  BEFORE UPDATE ON public.donation_methods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_revisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can upsert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile or admins can read all" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can manage profiles" ON public.profiles;
CREATE POLICY "Users can read own profile or admins can read all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_super_admin());
CREATE POLICY "Super admins can manage profiles"
  ON public.profiles FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Allow public read" ON public.pages;
DROP POLICY IF EXISTS "Allow authenticated write" ON public.pages;
DROP POLICY IF EXISTS "Published pages are public" ON public.pages;
DROP POLICY IF EXISTS "Content admins can manage pages" ON public.pages;
CREATE POLICY "Published pages are public"
  ON public.pages FOR SELECT
  USING (status = 'published' OR public.is_content_admin());
CREATE POLICY "Content admins can manage pages"
  ON public.pages FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS "Media assets are public" ON public.media_assets;
DROP POLICY IF EXISTS "Content admins can manage media assets" ON public.media_assets;
CREATE POLICY "Media assets are public"
  ON public.media_assets FOR SELECT
  USING (true);
CREATE POLICY "Content admins can manage media assets"
  ON public.media_assets FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS "Published sections are public" ON public.page_sections;
DROP POLICY IF EXISTS "Content admins can manage sections" ON public.page_sections;
CREATE POLICY "Published sections are public"
  ON public.page_sections FOR SELECT
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_sections.page_id
        AND pages.status = 'published'
    )
  );
CREATE POLICY "Content admins can manage sections"
  ON public.page_sections FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS "Published section items are public" ON public.section_items;
DROP POLICY IF EXISTS "Content admins can manage section items" ON public.section_items;
CREATE POLICY "Published section items are public"
  ON public.section_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.page_sections
      JOIN public.pages ON pages.id = page_sections.page_id
      WHERE page_sections.id = section_items.section_id
        AND page_sections.status = 'published'
        AND pages.status = 'published'
    )
  );
CREATE POLICY "Content admins can manage section items"
  ON public.section_items FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS "Visible navigation is public" ON public.navigation_items;
DROP POLICY IF EXISTS "Content admins can manage navigation" ON public.navigation_items;
CREATE POLICY "Visible navigation is public"
  ON public.navigation_items FOR SELECT
  USING (is_visible OR public.is_content_admin());
CREATE POLICY "Content admins can manage navigation"
  ON public.navigation_items FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS "Public settings are readable" ON public.site_settings;
DROP POLICY IF EXISTS "Content admins can manage settings" ON public.site_settings;
CREATE POLICY "Public settings are readable"
  ON public.site_settings FOR SELECT
  USING (is_public OR public.is_content_admin());
CREATE POLICY "Content admins can manage settings"
  ON public.site_settings FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS "Published programs are public" ON public.programs;
DROP POLICY IF EXISTS "Content admins can manage programs" ON public.programs;
CREATE POLICY "Published programs are public"
  ON public.programs FOR SELECT
  USING (
    status = 'published'
    AND (published_at IS NULL OR published_at <= now())
  );
CREATE POLICY "Content admins can manage programs"
  ON public.programs FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS "Visible news categories are public" ON public.news_categories;
DROP POLICY IF EXISTS "Content admins can manage news categories" ON public.news_categories;
CREATE POLICY "Visible news categories are public"
  ON public.news_categories FOR SELECT
  USING (is_visible OR public.is_content_admin());
CREATE POLICY "Content admins can manage news categories"
  ON public.news_categories FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS "Published news posts are public" ON public.news_posts;
DROP POLICY IF EXISTS "Content admins can manage news posts" ON public.news_posts;
CREATE POLICY "Published news posts are public"
  ON public.news_posts FOR SELECT
  USING (
    status = 'published'
    AND (published_at IS NULL OR published_at <= now())
  );
CREATE POLICY "Content admins can manage news posts"
  ON public.news_posts FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS "Visible partners are public" ON public.partners;
DROP POLICY IF EXISTS "Content admins can manage partners" ON public.partners;
CREATE POLICY "Visible partners are public"
  ON public.partners FOR SELECT
  USING (is_visible OR public.is_content_admin());
CREATE POLICY "Content admins can manage partners"
  ON public.partners FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS "Visible impact metrics are public" ON public.impact_metrics;
DROP POLICY IF EXISTS "Content admins can manage impact metrics" ON public.impact_metrics;
CREATE POLICY "Visible impact metrics are public"
  ON public.impact_metrics FOR SELECT
  USING (is_visible OR public.is_content_admin());
CREATE POLICY "Content admins can manage impact metrics"
  ON public.impact_metrics FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS "Visible timeline events are public" ON public.impact_timeline_events;
DROP POLICY IF EXISTS "Content admins can manage timeline events" ON public.impact_timeline_events;
CREATE POLICY "Visible timeline events are public"
  ON public.impact_timeline_events FOR SELECT
  USING (is_visible OR public.is_content_admin());
CREATE POLICY "Content admins can manage timeline events"
  ON public.impact_timeline_events FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS "Visible offices are public" ON public.offices;
DROP POLICY IF EXISTS "Content admins can manage offices" ON public.offices;
CREATE POLICY "Visible offices are public"
  ON public.offices FOR SELECT
  USING (is_visible OR public.is_content_admin());
CREATE POLICY "Content admins can manage offices"
  ON public.offices FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS "Active donation methods are public" ON public.donation_methods;
DROP POLICY IF EXISTS "Content admins can manage donation methods" ON public.donation_methods;
CREATE POLICY "Active donation methods are public"
  ON public.donation_methods FOR SELECT
  USING (is_active OR public.is_content_admin());
CREATE POLICY "Content admins can manage donation methods"
  ON public.donation_methods FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

DROP POLICY IF EXISTS "Content admins can read revisions" ON public.content_revisions;
DROP POLICY IF EXISTS "Content admins can insert revisions" ON public.content_revisions;
CREATE POLICY "Content admins can read revisions"
  ON public.content_revisions FOR SELECT
  USING (public.is_content_admin());
CREATE POLICY "Content admins can insert revisions"
  ON public.content_revisions FOR INSERT
  WITH CHECK (public.is_content_admin());

-- Media files are stored outside Supabase, typically in Google Drive.
-- public.media_assets stores only public URLs and descriptive metadata.
