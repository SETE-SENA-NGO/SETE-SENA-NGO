-- Fix: Remove duplicate mission content from about-vision page
-- The vision-guides section had duplicate mission content (same as mission-content).
-- This migration removes it from the stored JSON body.
--
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Update the pages.body JSON to remove the vision-guides section
UPDATE public.pages
SET body = (
  SELECT jsonb_build_object(
    'kind', (body::jsonb)->>'kind',
    'version', ((body::jsonb)->>'version')::int,
    'route', (body::jsonb)->>'route',
    'group', (body::jsonb)->>'group',
    'eyebrow', (body::jsonb)->>'eyebrow',
    'headline', (body::jsonb)->>'headline',
    'intro', (body::jsonb)->>'intro',
    'primaryAction', (body::jsonb)->>'primaryAction',
    'secondaryAction', (body::jsonb)->>'secondaryAction',
    'sections', (
      SELECT jsonb_agg(section)
      FROM jsonb_array_elements((body::jsonb)->'sections') AS section
      WHERE section->>'id' != 'vision-guides'
    )
  )::text
)
WHERE slug = 'about-vision' AND locale = 'en';

-- 2. Also clean up the page_sections table if it has the vision-guides entry
DELETE FROM public.section_items
WHERE section_id IN (
  SELECT id FROM public.page_sections ps
  JOIN public.pages p ON p.id = ps.page_id
  WHERE ps.slug = 'vision-guides' AND p.slug = 'about-vision'
);

DELETE FROM public.page_sections
WHERE slug = 'vision-guides'
AND page_id IN (
  SELECT id FROM public.pages WHERE slug = 'about-vision'
);

SELECT 'Fixed about-vision page - removed duplicate vision-guides section' AS result;

