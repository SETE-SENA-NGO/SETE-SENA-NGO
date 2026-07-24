-- Repair missing News and Partners tables for a partially configured Supabase project.
-- Run this in Supabase Dashboard > SQL Editor when the browser shows:
--   Could not find the table 'public.news_posts'
--   Could not find the table 'public.partners'

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

CREATE INDEX IF NOT EXISTS news_posts_publish_idx
  ON public.news_posts (status, published_at DESC);

CREATE INDEX IF NOT EXISTS partners_visible_sort_idx
  ON public.partners (is_visible, sort_order);

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

ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Visible news categories are public" ON public.news_categories;
DROP POLICY IF EXISTS "Content admins can manage news categories" ON public.news_categories;
DROP POLICY IF EXISTS "Published news posts are public" ON public.news_posts;
DROP POLICY IF EXISTS "Content admins can manage news posts" ON public.news_posts;
DROP POLICY IF EXISTS "Visible partners are public" ON public.partners;
DROP POLICY IF EXISTS "Content admins can manage partners" ON public.partners;

CREATE POLICY "Visible news categories are public"
  ON public.news_categories FOR SELECT
  USING (is_visible OR public.is_content_admin());

CREATE POLICY "Content admins can manage news categories"
  ON public.news_categories FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

CREATE POLICY "Published news posts are public"
  ON public.news_posts FOR SELECT
  USING (status = 'published' OR public.is_content_admin());

CREATE POLICY "Content admins can manage news posts"
  ON public.news_posts FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

CREATE POLICY "Visible partners are public"
  ON public.partners FOR SELECT
  USING (is_visible OR public.is_content_admin());

CREATE POLICY "Content admins can manage partners"
  ON public.partners FOR ALL
  USING (public.is_content_admin())
  WITH CHECK (public.is_content_admin());

INSERT INTO public.news_categories (slug, name, color, sort_order, is_visible)
VALUES
  ('education', 'Education', '#2563eb', 1, true),
  ('environment', 'Environment', '#16a34a', 2, true),
  ('child-protection', 'Child Protection', '#dc2626', 3, true),
  ('livelihood', 'Livelihood', '#ca8a04', 4, true),
  ('wash', 'WASH', '#0891b2', 5, true)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  is_visible = EXCLUDED.is_visible,
  updated_at = now();

INSERT INTO public.news_posts (
  legacy_id,
  slug,
  category_id,
  title,
  excerpt,
  body,
  status,
  is_featured,
  author_name,
  read_time,
  published_at,
  metadata
)
SELECT
  data.legacy_id,
  data.slug,
  c.id,
  data.title,
  data.excerpt,
  data.body,
  'published',
  data.is_featured,
  data.author_name,
  data.read_time,
  data.published_at::timestamptz,
  jsonb_build_object('seed', 'santi-sena-default')
FROM (
  VALUES
    (1, 'new-community-pre-school-opens-in-svay-rieng', 'education', 'New community pre-school opens in Svay Rieng', 'With support from local partners, Santi Sena inaugurated a new pre-school serving 60 children in a remote village.', '<p>The new pre-school gives rural children a safe place to learn, play and receive early support from trained teachers.</p>', true, 'Santi Sena Communications Team', '3 min read', '2025-03-15'),
    (2, 'community-forest-restoration-continues', 'environment', 'Community forest restoration continues', 'Village committees continue replanting and protection work across community forest areas.', '<p>Community forestry members are restoring degraded land and strengthening local protection systems.</p>', false, 'Santi Sena Environment Team', '4 min read', '2025-02-18'),
    (3, 'new-partnership-to-expand-clean-water-access', 'wash', 'New partnership to expand clean water access', 'Santi Sena partners with local stakeholders to bring safe drinking water to additional villages.', '<p>The partnership supports boreholes, purification systems and hygiene training for rural households.</p>', false, 'Santi Sena WASH Team', '5 min read', '2025-01-05')
) AS data(legacy_id, slug, category_slug, title, excerpt, body, is_featured, author_name, read_time, published_at)
JOIN public.news_categories c ON c.slug = data.category_slug
ON CONFLICT (slug) DO UPDATE
SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  body = EXCLUDED.body,
  status = EXCLUDED.status,
  is_featured = EXCLUDED.is_featured,
  author_name = EXCLUDED.author_name,
  read_time = EXCLUDED.read_time,
  published_at = EXCLUDED.published_at,
  metadata = public.news_posts.metadata || EXCLUDED.metadata,
  updated_at = now();

INSERT INTO public.partners (name, partner_type, description, sort_order, is_visible, metadata)
VALUES
  ('UNDP', 'international', 'International development partner supporting community resilience.', 1, true, jsonb_build_object('seed', 'santi-sena-default')),
  ('ADB', 'international', 'Regional development partner supporting practical community systems.', 2, true, jsonb_build_object('seed', 'santi-sena-default')),
  ('Oxfam', 'international', 'Civil society partner for community-led development.', 3, true, jsonb_build_object('seed', 'santi-sena-default')),
  ('World Vision', 'international', 'Partner for child-focused community development.', 4, true, jsonb_build_object('seed', 'santi-sena-default')),
  ('Save the Children', 'international', 'Partner supporting child protection and education.', 5, true, jsonb_build_object('seed', 'santi-sena-default')),
  ('ActionAid', 'international', 'Partner supporting rights-based community work.', 6, true, jsonb_build_object('seed', 'santi-sena-default')),
  ('Commune Councils', 'local', 'Local governance partners supporting village planning and accountability.', 7, true, jsonb_build_object('seed', 'santi-sena-default'))
ON CONFLICT (name, partner_type) DO UPDATE
SET
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_visible = EXCLUDED.is_visible,
  metadata = public.partners.metadata || EXCLUDED.metadata,
  updated_at = now();

SELECT pg_notify('pgrst', 'reload schema');

SELECT 'news_posts' AS table_name, count(*) AS rows FROM public.news_posts
UNION ALL
SELECT 'partners' AS table_name, count(*) AS rows FROM public.partners;
