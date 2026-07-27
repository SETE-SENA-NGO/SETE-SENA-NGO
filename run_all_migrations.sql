-- ============================================================================
-- Santi Sena NGO — All Database Migrations (bundled)
-- Run this entire script in Supabase Dashboard > SQL Editor
--
-- This combines migrations 0001 through 0008 in order.
-- All statements use IF NOT EXISTS / DROP IF EXISTS so it's safe to run
-- even if some tables already exist.
-- ============================================================================

BEGIN;

-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
-- MIGRATION 0001: Initial schema (pages + profiles)
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer'
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON pages;
CREATE POLICY "Allow public read" ON pages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated write" ON pages;
CREATE POLICY "Allow authenticated write" ON pages FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can upsert profiles" ON profiles;
CREATE POLICY "Admins can upsert profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
-- MIGRATION 0002: Admin editable content schema
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

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
  bucket text NOT NULL DEFAULT 'media',
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

-- Indexes
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

-- Triggers for updated_at
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

-- Row Level Security
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

-- RLS Policies
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

-- Storage bucket for media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'audio/mpeg',
    'application/pdf'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Media bucket public read" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket admin insert" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket admin update" ON storage.objects;
DROP POLICY IF EXISTS "Media bucket admin delete" ON storage.objects;

CREATE POLICY "Media bucket public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Media bucket admin insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND public.is_content_admin());

CREATE POLICY "Media bucket admin update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND public.is_content_admin())
  WITH CHECK (bucket_id = 'media' AND public.is_content_admin());

CREATE POLICY "Media bucket admin delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND public.is_content_admin());

-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
-- MIGRATION 0003: Module records
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

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

-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
-- MIGRATION 0004: Admin security hardening
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_content_admin();
$$;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can upsert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;

DROP POLICY IF EXISTS "Allow authenticated write" ON public.pages;
DROP POLICY IF EXISTS "Admins can write pages" ON public.pages;

DROP POLICY IF EXISTS "Allow authenticated write" ON public.donation_methods;
DROP POLICY IF EXISTS "Admins can write donation methods" ON public.donation_methods;

DROP POLICY IF EXISTS "Authenticated upload media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete media" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload media" ON storage.objects;
DROP POLICY IF EXISTS "Admins update media" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete media" ON storage.objects;

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
      WHEN NEW.email IN ('admin@santisena.org', 'sannsiv49@gmail.com') THEN 'super_admin'
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

INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'super_admin'
FROM auth.users
WHERE email IN ('admin@santisena.org', 'sannsiv49@gmail.com')
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  role = 'super_admin',
  updated_at = now();

-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
-- MIGRATION 0005: Media free tier limits
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
-- MIGRATION 0006: Home slides
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

CREATE TABLE IF NOT EXISTS public.home_slides (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL DEFAULT '',
  alt TEXT NOT NULL DEFAULT '',
  eyebrow TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.home_slides
  DROP COLUMN IF EXISTS primary_label,
  DROP COLUMN IF EXISTS primary_to,
  DROP COLUMN IF EXISTS secondary_label,
  DROP COLUMN IF EXISTS secondary_to;

ALTER TABLE public.home_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.home_slides;
DROP POLICY IF EXISTS "Allow authenticated write" ON public.home_slides;
DROP POLICY IF EXISTS "Home slides are public" ON public.home_slides;
DROP POLICY IF EXISTS "Content admins can manage home slides" ON public.home_slides;

CREATE POLICY "Home slides are public"
  ON public.home_slides FOR SELECT
  USING (true);

CREATE POLICY "Content admins can manage home slides"
  ON public.home_slides FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
-- MIGRATION 0007: Page locale uniqueness
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'en';

ALTER TABLE public.pages
  DROP CONSTRAINT IF EXISTS pages_slug_key;

DROP INDEX IF EXISTS pages_slug_key;

CREATE UNIQUE INDEX IF NOT EXISTS pages_slug_locale_key
  ON public.pages (slug, locale);

CREATE UNIQUE INDEX IF NOT EXISTS pages_route_locale_key
  ON public.pages (route_path, locale)
  WHERE route_path IS NOT NULL;

-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
-- MIGRATION 0008: Content realtime and media cleanup
-- +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-

CREATE INDEX IF NOT EXISTS media_assets_bucket_created_idx
  ON public.media_assets (bucket, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS media_assets_google_drive_file_id_key
  ON public.media_assets ((metadata->>'google_drive_file_id'))
  WHERE bucket = 'google-drive'
    AND metadata ? 'google_drive_file_id';

CREATE INDEX IF NOT EXISTS content_revisions_entity_created_idx
  ON public.content_revisions (entity_table, entity_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.capture_page_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.content_revisions
  WHERE entity_table = TG_TABLE_NAME
    AND created_at < now() - interval '7 days';

  IF TG_OP = 'UPDATE' AND to_jsonb(OLD) IS DISTINCT FROM to_jsonb(NEW) THEN
    INSERT INTO public.content_revisions (
      entity_table,
      entity_id,
      action,
      snapshot,
      created_by
    )
    VALUES (
      TG_TABLE_NAME,
      OLD.id,
      'update',
      to_jsonb(OLD),
      auth.uid()
    );

    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.content_revisions (
      entity_table,
      entity_id,
      action,
      snapshot,
      created_by
    )
    VALUES (
      TG_TABLE_NAME,
      OLD.id,
      'delete',
      to_jsonb(OLD),
      auth.uid()
    );

    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS capture_page_revision_on_pages ON public.pages;
CREATE TRIGGER capture_page_revision_on_pages
  BEFORE UPDATE OR DELETE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.capture_page_revision();

DO $$
DECLARE
  realtime_table text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) THEN
    FOREACH realtime_table IN ARRAY ARRAY[
      'pages',
      'home_slides',
      'donation_methods',
      'media_assets',
      'news_posts',
      'partners'
    ] LOOP
      IF to_regclass('public.' || realtime_table) IS NOT NULL THEN
        EXECUTE format(
          'ALTER TABLE public.%I REPLICA IDENTITY FULL',
          realtime_table
        );

        IF NOT EXISTS (
          SELECT 1
          FROM pg_publication_tables
          WHERE pubname = 'supabase_realtime'
            AND schemaname = 'public'
            AND tablename = realtime_table
        ) THEN
          EXECUTE format(
            'ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',
            realtime_table
          );
        END IF;
      END IF;
    END LOOP;
  END IF;
END;
$$;

SELECT pg_notify('pgrst', 'reload schema');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT '✅ All migrations applied successfully' AS status;

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'pages', 'profiles', 'media_assets', 'page_sections', 'section_items',
    'navigation_items', 'site_settings', 'programs', 'news_categories',
    'news_posts', 'partners', 'impact_metrics', 'impact_timeline_events',
    'offices', 'donation_methods', 'content_revisions', 'module_records',
    'home_slides'
  )
ORDER BY table_name;

COMMIT;
