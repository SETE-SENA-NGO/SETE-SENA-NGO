-- ============================================================
-- SEED DATA: Environment Program
-- Run this AFTER applying all migrations (0001-0003).
-- ============================================================

-- 1. Create the editable page record
INSERT INTO public.pages (slug, title, route_path, nav_group, status, hero_headline, hero_intro)
VALUES (
  'programs-environment',
  'Environment Program',
  '/programs/environment',
  'Programs',
  'published',
  'Natural Heritage',
  'Through community-led conservation, reforestation, and sustainable development, we''re restoring Cambodia''s ecosystems and building a greener future for all.'
)
ON CONFLICT (slug) DO UPDATE SET
  hero_headline = EXCLUDED.hero_headline,
  hero_intro = EXCLUDED.hero_intro,
  status = 'published';

-- 2. Create the program record
INSERT INTO public.programs (slug, title, pillar, summary, description, status)
VALUES (
  'programs-environment',
  'Environment Program',
  'Environment',
  'Through community-led conservation, reforestation, and sustainable development, we are restoring Cambodia''s ecosystems and building a greener future for all.',
  'Our environment program takes a holistic approach to conservation, combining immediate action with long-term community education and sustainable development. We focus on reforestation, renewable energy, water conservation, sustainable agriculture, and climate research.',
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  status = 'published';

-- 3. Insert impact metrics
INSERT INTO public.impact_metrics (metric_key, label, value_text, unit, icon, sort_order, is_visible)
VALUES
  ('env-trees-planted', 'Trees Planted', '500', 'K+', 'tree', 1, true),
  ('env-communities-served', 'Communities Served', '12', '', 'community', 2, true),
  ('env-ecosystems-protected', 'Ecosystems Protected', '50', '+', 'globe', 3, true),
  ('env-people-trained', 'People Trained', '10', 'K+', 'people', 4, true)
ON CONFLICT (metric_key) DO UPDATE SET
  label = EXCLUDED.label,
  value_text = EXCLUDED.value_text,
  unit = EXCLUDED.unit,
  icon = EXCLUDED.icon,
  is_visible = true;

-- 4. Insert page sections (with items)
-- We need the page ID first
DO $$
DECLARE
  page_id uuid;
BEGIN
  SELECT id INTO page_id FROM public.pages WHERE slug = 'programs-environment';

  -- Section: Conservation overview
  INSERT INTO public.page_sections (page_id, slug, label, section_type, heading, body, sort_order, status)
  VALUES (page_id, 'conservation', 'Conservation', 'content', 'Protecting Natural Habitats', 'Our conservation efforts focus on protecting and restoring natural habitats, wildlife corridors, and biodiversity hotspots through community-led initiatives and scientific research. We work closely with local communities to ensure that conservation brings tangible benefits to both nature and people.', 1, 'published')
  ON CONFLICT (page_id, slug) DO NOTHING;

  -- Section: Sustainability
  INSERT INTO public.page_sections (page_id, slug, label, section_type, heading, body, sort_order, status)
  VALUES (page_id, 'sustainability', 'Sustainability', 'content', 'Building a Sustainable Future', 'We promote renewable energy, sustainable agriculture, and circular economy practices that reduce environmental impact while supporting local livelihoods. Our projects include solar panel installations, biogas digesters, and organic farming training.', 2, 'published')
  ON CONFLICT (page_id, slug) DO NOTHING;

  -- Section: Community Engagement
  INSERT INTO public.page_sections (page_id, slug, label, section_type, heading, body, sort_order, status)
  VALUES (page_id, 'community-engagement', 'Community Engagement', 'content', 'Empowering Communities', 'We empower local communities with knowledge, resources, and tools to actively participate in environmental protection and climate action. Through environmental education programs and hands-on training, communities become stewards of their own natural resources.', 3, 'published')
  ON CONFLICT (page_id, slug) DO NOTHING;

  -- Section: Key Initiatives with items
  INSERT INTO public.page_sections (page_id, slug, label, section_type, heading, body, sort_order, status)
  VALUES (page_id, 'initiatives', 'Initiatives', 'list', 'Our Key Initiatives', 'From reforesting degraded lands to empowering communities with renewable energy, our initiatives create lasting environmental impact.', 4, 'published')
  ON CONFLICT (page_id, slug) DO NOTHING;

  -- Add items to the initiatives section
  INSERT INTO public.section_items (section_id, slug, title, subtitle, body, sort_order)
  SELECT ps.id, 'reforestation', 'Reforestation Projects', 'Restoring forest cover', 'Planting native tree species to restore degraded forests and combat desertification. Over 500,000 trees planted across 12 communities.', 1
  FROM public.page_sections ps
  WHERE ps.page_id = page_id AND ps.slug = 'initiatives'
  ON CONFLICT (section_id, slug) DO NOTHING;

  INSERT INTO public.section_items (section_id, slug, title, subtitle, body, sort_order)
  SELECT ps.id, 'education', 'Environmental Education', 'Building awareness', 'Developing curriculum and training programs for schools and community groups to build environmental literacy from an early age.', 2
  FROM public.page_sections ps
  WHERE ps.page_id = page_id AND ps.slug = 'initiatives'
  ON CONFLICT (section_id, slug) DO NOTHING;

  INSERT INTO public.section_items (section_id, slug, title, subtitle, body, sort_order)
  SELECT ps.id, 'renewable-energy', 'Renewable Energy', 'Clean power access', 'Installing solar panels and clean energy solutions in rural communities, reducing dependence on fossil fuels.', 3
  FROM public.page_sections ps
  WHERE ps.page_id = page_id AND ps.slug = 'initiatives'
  ON CONFLICT (section_id, slug) DO NOTHING;

  INSERT INTO public.section_items (section_id, slug, title, subtitle, body, sort_order)
  SELECT ps.id, 'water', 'Water Conservation', 'Clean water access', 'Implementing rainwater harvesting, watershed management, and water purification systems.', 4
  FROM public.page_sections ps
  WHERE ps.page_id = page_id AND ps.slug = 'initiatives'
  ON CONFLICT (section_id, slug) DO NOTHING;

  INSERT INTO public.section_items (section_id, slug, title, subtitle, body, sort_order)
  SELECT ps.id, 'agriculture', 'Sustainable Agriculture', 'Eco-friendly farming', 'Training farmers in organic farming, crop rotation, and agroforestry techniques that increase yields while preserving soil health.', 5
  FROM public.page_sections ps
  WHERE ps.page_id = page_id AND ps.slug = 'initiatives'
  ON CONFLICT (section_id, slug) DO NOTHING;

  INSERT INTO public.section_items (section_id, slug, title, subtitle, body, sort_order)
  SELECT ps.id, 'climate-research', 'Climate Research', 'Science-led action', 'Conducting climate impact assessments and advocating for policy changes that protect vulnerable ecosystems.', 6
  FROM public.page_sections ps
  WHERE ps.page_id = page_id AND ps.slug = 'initiatives'
  ON CONFLICT (section_id, slug) DO NOTHING;

END $$;

-- 5. Insert partners
INSERT INTO public.partners (name, partner_type, description, sort_order, is_visible)
VALUES
  ('UN Environment', 'International Partner', 'Collaborating on global environmental initiatives and sustainability goals.', 1, true),
  ('Green Cambodia', 'Local NGO', 'Partnering on reforestation and community conservation projects across Cambodia.', 2, true),
  ('Eco Foundation', 'Funding Partner', 'Providing critical funding for our environmental programs and research.', 3, true),
  ('Wildlife Alliance', 'Conservation Partner', 'Joint efforts in wildlife protection and habitat restoration.', 4, true),
  ('Solar Future', 'Technology Partner', 'Supporting our renewable energy initiatives with technical expertise.', 5, true),
  ('Rainforest Trust', 'Global Supporter', 'Contributing to our forest conservation and carbon sequestration projects.', 6, true)
ON CONFLICT (name, partner_type) DO UPDATE SET
  is_visible = true;

-- 6. Verify the data was inserted
SELECT '✅ Programs:' AS check_label, COUNT(*) AS count FROM public.programs WHERE slug = 'programs-environment'
UNION ALL
SELECT '✅ Impact Metrics:', COUNT(*) FROM public.impact_metrics WHERE metric_key LIKE 'env-%'
UNION ALL
SELECT '✅ Page Sections:', COUNT(*) FROM public.page_sections ps JOIN public.pages p ON p.id = ps.page_id WHERE p.slug = 'programs-environment'
UNION ALL
SELECT '✅ Partners:', COUNT(*) FROM public.partners WHERE is_visible = true;
