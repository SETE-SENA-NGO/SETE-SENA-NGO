-- ============================================================
-- COMPLETE SUPABASE SETUP — Santi Sena NGO
-- Run this entire script ONCE in Supabase Dashboard > SQL Editor
-- This creates ALL tables and seeds ALL data for both
-- the admin panel AND the public website
-- ============================================================

-- ============================================================
-- PART 1: MIGRATION 0001 — Initial Schema
-- ============================================================

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
CREATE POLICY "Allow public read" ON pages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write" ON pages FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can upsert profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- PART 2: MIGRATION 0002 — Admin Editable Content Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
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
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_content_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

CREATE TABLE IF NOT EXISTS public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL DEFAULT 'media',
  path text NOT NULL,
  public_url text,
  file_name text NOT NULL,
  alt_text text, caption text,
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
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS pages_route_locale_key
  ON public.pages (route_path, locale) WHERE route_path IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  slug text NOT NULL, label text NOT NULL,
  section_type text NOT NULL DEFAULT 'content',
  sort_order integer NOT NULL DEFAULT 0,
  heading text, subheading text, body text,
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
  slug text NOT NULL, title text NOT NULL,
  subtitle text, body text, item_value text, href text,
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
  label text NOT NULL, description text, url text, icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  open_in_new_tab boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY, label text NOT NULL,
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
  title text NOT NULL, pillar text NOT NULL,
  summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  hero_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  icon text, color text,
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
  slug text UNIQUE NOT NULL, name text NOT NULL, color text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id integer UNIQUE, slug text UNIQUE NOT NULL,
  category_id uuid REFERENCES public.news_categories(id) ON DELETE SET NULL,
  title text NOT NULL, excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  featured_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  author_name text NOT NULL DEFAULT 'Santi Sena Communications Team',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  read_time text, published_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  partner_type text NOT NULL DEFAULT 'supporter',
  description text, website_url text,
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
  label text NOT NULL, value_text text NOT NULL,
  unit text, description text, icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.impact_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_year integer NOT NULL, title text NOT NULL,
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
  slug text UNIQUE NOT NULL, name text NOT NULL,
  office_type text NOT NULL DEFAULT 'field',
  province text, address text, email text, phone text,
  office_hours text, map_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (office_type IN ('head', 'field', 'contact'))
);

CREATE TABLE IF NOT EXISTS public.donation_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL, name text NOT NULL,
  method_type text NOT NULL DEFAULT 'bank_qr',
  instructions text, account_name text, account_number text,
  currency text, qr_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.content_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_table text NOT NULL, entity_id uuid NOT NULL,
  action text NOT NULL DEFAULT 'update',
  snapshot jsonb NOT NULL DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Triggers
DROP TRIGGER IF EXISTS set_updated_at_on_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_on_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_on_pages ON public.pages;
CREATE TRIGGER set_updated_at_on_pages BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_on_media_assets ON public.media_assets;
CREATE TRIGGER set_updated_at_on_media_assets BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_on_page_sections ON public.page_sections;
CREATE TRIGGER set_updated_at_on_page_sections BEFORE UPDATE ON public.page_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_on_section_items ON public.section_items;
CREATE TRIGGER set_updated_at_on_section_items BEFORE UPDATE ON public.section_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_on_navigation_items ON public.navigation_items;
CREATE TRIGGER set_updated_at_on_navigation_items BEFORE UPDATE ON public.navigation_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_on_site_settings ON public.site_settings;
CREATE TRIGGER set_updated_at_on_site_settings BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_on_programs ON public.programs;
CREATE TRIGGER set_updated_at_on_programs BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_on_news_categories ON public.news_categories;
CREATE TRIGGER set_updated_at_on_news_categories BEFORE UPDATE ON public.news_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_on_news_posts ON public.news_posts;
CREATE TRIGGER set_updated_at_on_news_posts BEFORE UPDATE ON public.news_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_on_partners ON public.partners;
CREATE TRIGGER set_updated_at_on_partners BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_on_impact_metrics ON public.impact_metrics;
CREATE TRIGGER set_updated_at_on_impact_metrics BEFORE UPDATE ON public.impact_metrics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_on_impact_timeline_events ON public.impact_timeline_events;
CREATE TRIGGER set_updated_at_on_impact_timeline_events BEFORE UPDATE ON public.impact_timeline_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_on_offices ON public.offices;
CREATE TRIGGER set_updated_at_on_offices BEFORE UPDATE ON public.offices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS set_updated_at_on_donation_methods ON public.donation_methods;
CREATE TRIGGER set_updated_at_on_donation_methods BEFORE UPDATE ON public.donation_methods FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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

-- RLS Policies (public read + admin write for all tables)
CREATE POLICY "Users can read own profile or admins can read all" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_super_admin());
CREATE POLICY "Super admins can manage profiles" ON public.profiles FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "Published pages are public" ON public.pages FOR SELECT USING (status = 'published' OR public.is_content_admin());
CREATE POLICY "Content admins can manage pages" ON public.pages FOR ALL USING (public.is_content_admin()) WITH CHECK (public.is_content_admin());
CREATE POLICY "Media assets are public" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Content admins can manage media assets" ON public.media_assets FOR ALL USING (public.is_content_admin()) WITH CHECK (public.is_content_admin());
CREATE POLICY "Published sections are public" ON public.page_sections FOR SELECT USING (status = 'published');
CREATE POLICY "Content admins can manage sections" ON public.page_sections FOR ALL USING (public.is_content_admin()) WITH CHECK (public.is_content_admin());
CREATE POLICY "Published section items are public" ON public.section_items FOR SELECT USING (true);
CREATE POLICY "Content admins can manage section items" ON public.section_items FOR ALL USING (public.is_content_admin()) WITH CHECK (public.is_content_admin());
CREATE POLICY "Published programs are public" ON public.programs FOR SELECT USING (status = 'published');
CREATE POLICY "Content admins can manage programs" ON public.programs FOR ALL USING (public.is_content_admin()) WITH CHECK (public.is_content_admin());
CREATE POLICY "Visible impact metrics are public" ON public.impact_metrics FOR SELECT USING (is_visible OR public.is_content_admin());
CREATE POLICY "Content admins can manage impact metrics" ON public.impact_metrics FOR ALL USING (public.is_content_admin()) WITH CHECK (public.is_content_admin());
CREATE POLICY "Visible partners are public" ON public.partners FOR SELECT USING (is_visible OR public.is_content_admin());
CREATE POLICY "Content admins can manage partners" ON public.partners FOR ALL USING (public.is_content_admin()) WITH CHECK (public.is_content_admin());
CREATE POLICY "Visible navigation is public" ON public.navigation_items FOR SELECT USING (is_visible OR public.is_content_admin());
CREATE POLICY "Content admins can manage navigation" ON public.navigation_items FOR ALL USING (public.is_content_admin()) WITH CHECK (public.is_content_admin());
CREATE POLICY "Published news posts are public" ON public.news_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Content admins can manage news posts" ON public.news_posts FOR ALL USING (public.is_content_admin()) WITH CHECK (public.is_content_admin());
CREATE POLICY "Visible offices are public" ON public.offices FOR SELECT USING (is_visible OR public.is_content_admin());
CREATE POLICY "Content admins can manage offices" ON public.offices FOR ALL USING (public.is_content_admin()) WITH CHECK (public.is_content_admin());
CREATE POLICY "Active donation methods are public" ON public.donation_methods FOR SELECT USING (is_active OR public.is_content_admin());
CREATE POLICY "Content admins can manage donation methods" ON public.donation_methods FOR ALL USING (public.is_content_admin()) WITH CHECK (public.is_content_admin());

-- ============================================================
-- PART 3: SEED DATA — All pages, programs, metrics, partners
-- ============================================================

BEGIN;

-- === SITE SETTINGS ===
INSERT INTO public.site_settings (key, label, value, field_type, group_key, is_public)
VALUES
  ('site.name', 'Site name', to_jsonb('Santi Sena NGO'::text), 'text', 'general', true),
  ('site.tagline', 'Site tagline', to_jsonb('Peace Army . Cambodia'::text), 'text', 'general', true),
  ('contact.email', 'Primary email', to_jsonb('SANTISENAMONK@GMAIL.COM'::text), 'email', 'contact', true),
  ('contact.phone', 'Primary phone', to_jsonb('(+855-77) 65 54 64'::text), 'text', 'contact', true),
  ('contact.address', 'Primary address', to_jsonb('Svay Rieng Province, Cambodia'::text), 'textarea', 'contact', true)
ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label, value = EXCLUDED.value, is_public = true, updated_at = now();

-- === PAGES with hero content (for the environment page and all others) ===
INSERT INTO public.pages (slug, title, route_path, nav_group, status, hero_headline, hero_intro)
VALUES
  ('home', 'Home', '/', 'Home', 'published', 'Walking with villages toward peace, sustainability and dignity.', 'Santi Sena, the Peace Army, works alongside rural Cambodian communities.'),
  ('about', 'About Santi Sena', '/about', 'About', 'published', 'A peace army born from the Dharma, raised by villages.', 'Founded in 1994 by Cambodian Buddhist monks.'),
  ('programs', 'Programs', '/programs', 'Programs', 'published', 'Four roots. One tree of peace.', 'Santi Sena''s work follows four interwoven strategic goals.'),
  ('programs-environment', 'Environment Program', '/programs/environment', 'Programs', 'published', 'Natural Heritage', 'Through community-led conservation, reforestation, and sustainable development, we''re restoring Cambodia''s ecosystems.'),
  ('programs-education', 'Education Program', '/programs/education', 'Programs', 'published', 'A teacher in every village. A book in every hand.', 'Community pre-schools, mobile libraries, scholarships and Buddhist education.'),
  ('programs-livelihood', 'Livelihood Program', '/programs/livelihood', 'Programs', 'published', 'Dignified work rooted in the village.', 'Saving groups, home gardens, cooperatives and rural enterprises.'),
  ('programs-child-protection', 'Child Protection Program', '/programs/child-protection', 'Programs', 'published', 'Every child safe. Every child in school.', 'Village child protection networks, peer educators and safe migration training.'),
  ('impact', 'Impact', '/impact', 'Impact', 'published', 'Three decades. One quiet revolution.', 'Every number is a household with a safer roof, a child with a teacher, a forest still standing.'),
  ('get-involved', 'Get Involved', '/get-involved', 'Get Involved', 'published', 'Stand beside a village. Plant a generation.', 'Every gift, partnership and pair of hands becomes another root.'),
  ('contact', 'Contact', '/contact', 'Contact', 'published', 'Write to us. We read every letter.', 'Whether you wish to partner, donate, visit or simply learn more.')
ON CONFLICT (slug) DO UPDATE SET
  hero_headline = EXCLUDED.hero_headline,
  hero_intro = EXCLUDED.hero_intro,
  status = 'published',
  updated_at = now();

-- === PROGRAMS ===
INSERT INTO public.programs (slug, page_id, title, pillar, summary, description, status)
SELECT 'programs-environment', p.id, 'Environment Program', 'Environment',
  'Community-led conservation, reforestation, and sustainable development restoring Cambodia''s ecosystems.',
  'Our environment program takes a holistic approach to conservation, combining immediate action with long-term community education and sustainable development.',
  'published'
FROM public.pages p WHERE p.slug = 'programs-environment'
ON CONFLICT (slug) DO UPDATE SET status = 'published', updated_at = now();

INSERT INTO public.programs (slug, page_id, title, pillar, summary, description, status)
SELECT 'programs-education', p.id, 'Education Program', 'Education',
  'Community pre-schools, mobile libraries, scholarships and Buddhist education.',
  'Helping rural children keep learning through local teachers, libraries and family support.',
  'published'
FROM public.pages p WHERE p.slug = 'programs-education'
ON CONFLICT (slug) DO UPDATE SET status = 'published', updated_at = now();

INSERT INTO public.programs (slug, page_id, title, pillar, summary, description, status)
SELECT 'programs-livelihood', p.id, 'Livelihood Program', 'Livelihood',
  'Integrated farming, savings groups, cooperatives and rural enterprises.',
  'Strengthening household income so families can avoid harmful debt and stay resilient.',
  'published'
FROM public.pages p WHERE p.slug = 'programs-livelihood'
ON CONFLICT (slug) DO UPDATE SET status = 'published', updated_at = now();

INSERT INTO public.programs (slug, page_id, title, pillar, summary, description, status)
SELECT 'programs-child-protection', p.id, 'Child Protection Program', 'Child Protection',
  'Anti-trafficking campaigns, child protection networks, peer educators and child rights advocacy.',
  'Building village protection systems that keep children safe and in school.',
  'published'
FROM public.pages p WHERE p.slug = 'programs-child-protection'
ON CONFLICT (slug) DO UPDATE SET status = 'published', updated_at = now();

-- === ENVIRONMENT IMPACT METRICS (for the environment page) ===
INSERT INTO public.impact_metrics (metric_key, label, value_text, unit, icon, sort_order, is_visible)
VALUES
  ('env-trees-planted', 'Trees Planted', '500', 'K+', 'tree', 1, true),
  ('env-communities-served', 'Communities Served', '12', '', 'community', 2, true),
  ('env-ecosystems-protected', 'Ecosystems Protected', '50', '+', 'globe', 3, true),
  ('env-people-trained', 'People Trained', '10', 'K+', 'people', 4, true)
ON CONFLICT (metric_key) DO UPDATE SET label = EXCLUDED.label, value_text = EXCLUDED.value_text, is_visible = true, updated_at = now();

-- === GLOBAL IMPACT METRICS ===
INSERT INTO public.impact_metrics (metric_key, label, value_text, unit, description, icon, sort_order, is_visible)
VALUES
  ('villages-reached', 'Villages Reached', '293', 'villages', 'Villages reached across Svay Rieng, Prey Veng and Kratie.', 'map', 1, true),
  ('communes-served', 'Communes Served', '43', 'communes', 'Communes served through long-term community work.', 'map-pin', 2, true),
  ('years-of-service', 'Years of Service', '30+', 'years', 'Founded in 1994 by Cambodian Buddhist monks.', 'calendar', 3, true),
  ('forests-protected', 'Forests Protected', '570+', 'hectares', 'Community forest areas supported through local committees.', 'leaf', 4, true)
ON CONFLICT (metric_key) DO UPDATE SET label = EXCLUDED.label, value_text = EXCLUDED.value_text, is_visible = true, updated_at = now();

-- === PARTNERS ===
INSERT INTO public.partners (name, partner_type, description, sort_order, is_visible)
VALUES
  ('UN Environment', 'International Partner', 'Collaborating on global environmental initiatives.', 1, true),
  ('Green Cambodia', 'Local NGO', 'Partnering on reforestation and community conservation.', 2, true),
  ('UNDP', 'International Partner', 'International development partner supporting community resilience.', 3, true),
  ('Oxfam', 'International Partner', 'Long-term civil society partner for community-led development.', 4, true),
  ('World Vision', 'International Partner', 'Partner for child-focused community development.', 5, true)
ON CONFLICT (name, partner_type) DO UPDATE SET description = EXCLUDED.description, is_visible = true, updated_at = now();

-- === NEWS CATEGORIES ===
INSERT INTO public.news_categories (slug, name, color, sort_order, is_visible)
VALUES
  ('education', 'Education', '#2563eb', 1, true),
  ('environment', 'Environment', '#16a34a', 2, true),
  ('child-protection', 'Child Protection', '#dc2626', 3, true),
  ('livelihood', 'Livelihood', '#ca8a04', 4, true),
  ('wash', 'WASH', '#0891b2', 5, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, is_visible = true, updated_at = now();

-- === OFFICES ===
INSERT INTO public.offices (slug, name, office_type, province, address, email, phone, sort_order, is_visible)
VALUES
  ('head-office', 'Head Office', 'head', 'Svay Rieng', 'Svay Rieng Town, Svay Rieng Province', 'info@santisena.org', '+855 (0) 12 345 678', 1, true),
  ('prey-veng-field-office', 'Prey Veng Field Office', 'field', 'Prey Veng', 'Prey Veng Town, Prey Veng Province', 'preyveng@santisena.org', '+855 (0) 12 111 222', 2, true),
  ('kratie-field-office', 'Kratie Field Office', 'field', 'Kratie', 'Kratie Town, Kratie Province', 'kratie@santisena.org', '+855 (0) 12 333 444', 3, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, is_visible = true, updated_at = now();

COMMIT;

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT '✅ TABLES CREATED' AS status;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('pages','programs','impact_metrics','page_sections','section_items','partners','news_categories','news_posts','offices','donation_methods','media_assets','navigation_items','site_settings','content_revisions','profiles')
ORDER BY table_name;

SELECT '✅ PAGES SEEDED' AS status, COUNT(*) AS count FROM public.pages WHERE status = 'published';
SELECT '✅ PROGRAMS SEEDED' AS status, COUNT(*) AS count FROM public.programs WHERE status = 'published';
SELECT '✅ METRICS SEEDED' AS status, COUNT(*) AS count FROM public.impact_metrics WHERE is_visible = true;
SELECT '✅ PARTNERS SEEDED' AS status, COUNT(*) AS count FROM public.partners WHERE is_visible = true;
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
