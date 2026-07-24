-- ============================================================
-- SQL MIGRATION & SETUP FOR SANTI SENA NGO IMPACT PAGES
-- Run this script in the Supabase Dashboard > SQL Editor
-- ============================================================

-- Step 1: Ensure the pages table exists with the required columns
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL, -- Holds the complete page JSON structure
  route_path TEXT,
  nav_group TEXT,
  locale TEXT NOT NULL DEFAULT 'en',
  template TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'published',
  hero_eyebrow TEXT,
  hero_headline TEXT,
  hero_intro TEXT,
  primary_cta_label TEXT,
  primary_cta_url TEXT,
  secondary_cta_label TEXT,
  secondary_cta_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'
);

-- Step 2: Enable Row Level Security (RLS)
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Step 3: Set up RLS Policies (Allow read for everyone, write only for authenticated users)
DROP POLICY IF EXISTS "Allow public read" ON public.pages;
DROP POLICY IF EXISTS "Allow authenticated write" ON public.pages;

CREATE POLICY "Allow public read" 
  ON public.pages FOR SELECT 
  USING (true);

CREATE POLICY "Allow authenticated write" 
  ON public.pages FOR ALL 
  USING (auth.role() = 'authenticated');

-- Step 4: Seed/Upsert the 4 Impact page rows with default values
-- This ensures page routes will resolve dynamically from Supabase
INSERT INTO public.pages (
  slug, title, route_path, nav_group, locale, template, status,
  hero_eyebrow, hero_headline, hero_intro, sort_order, published_at, body
)
VALUES
  -- 1. Main Impact Hub Page
  (
    'impact', 
    'Impact', 
    '/impact', 
    'Impact', 
    'en', 
    'standard', 
    'published',
    'Our Impact',
    'Three decades. One quiet revolution.',
    'Every number is a household with a safer roof, a child with a teacher, a forest still standing.',
    11,
    now(),
    '{
      "kind": "santi-sena-page-content",
      "version": 1,
      "route": "/impact",
      "group": "Impact",
      "eyebrow": "Our Impact",
      "headline": "Three decades. One quiet revolution.",
      "intro": "Every number is a household with a safer roof, a child with a teacher, a forest still standing.",
      "primaryAction": "",
      "secondaryAction": "",
      "sections": [
        {
          "id": "impact-stats",
          "label": "Stats",
          "heading": "Impact numbers",
          "body": "Main impact counters on the Impact page.",
          "items": "293 | Villages served | Across 43 communes in southeastern Cambodia.\n570+ | Hectares of forest | Managed through community forestry and nurseries.\n120+ | Full-time staff | Experts in management, agriculture and rural development.\n15+ | International partners | Including UNDP, ADB and Oxfam.\n32 | Years of service | Founded in 1994; still walking beside villages.\n4 | Strategic pillars | Environment, education, livelihoods and child protection."
        },
        {
          "id": "impact-timeline",
          "label": "Timeline",
          "heading": "A journey rooted in patience.",
          "body": "Milestones shown on the Impact page.",
          "items": "1994 | Founding | Santi Sena is established to support rural communities with practical development programs.\n2002 | First community forestry | The organisation expands its work around forest stewardship and local ownership.\n2008 | Saving-for-Change | Household savings groups begin to strengthen financial resilience and local entrepreneurship.\n2014 | 20-year horizon | Programs deepen across education, livelihoods and environmental protection.\n2024 | Today | The organisation continues to support resilient, community-led change at scale."
        },
        {
          "id": "impact-partners",
          "label": "Partners",
          "heading": "Trusted by partners across the world.",
          "body": "Santi Sena has successfully managed grants from more than ten international institutions.",
          "items": "UNDP\nADB\nOxfam\nCIDA\nWorld Vision\nSave the Children\nActionAid\nCare"
        }
      ]
    }'
  ),

  -- 2. Impact Numbers Subpage
  (
    'impact-numbers', 
    'Impact Numbers', 
    '/impact/numbers', 
    'Impact', 
    'en', 
    'standard', 
    'published',
    'Impact Numbers',
    'Thirty years, measured village by village.',
    'A deeper numbers page for environment, education, livelihoods and child protection results.',
    12,
    now(),
    '{
      "kind": "santi-sena-page-content",
      "version": 1,
      "route": "/impact/numbers",
      "group": "Impact",
      "eyebrow": "Impact Numbers",
      "headline": "Thirty years, measured village by village.",
      "intro": "A deeper numbers page for environment, education, livelihoods and child protection results.",
      "primaryAction": "Take the next step",
      "secondaryAction": "",
      "sections": [
        {
          "id": "numbers-overview",
          "label": "Overview Map Stats",
          "heading": "Our Areas of Operation",
          "body": "Since 1994, our programs have maintained a continuous field presence, working closely with rural communities across three provinces to create sustainable impact.",
          "items": "293 | Villages | Across 43 communes in three provinces.\n43 | Communes | Svay Rieng, Prey Veng and Kratie.\n3 | Provinces | Continuous field presence since 1994."
        },
        {
          "id": "numbers-card-environment",
          "label": "Environment Flip Card",
          "heading": "Environment",
          "body": "Community-led conservation that protects biodiversity and builds climate resilience.",
          "items": "570+ | Hectares | Community forest protected and restored.\n50k+ | Saplings | Grown yearly in village nurseries.\n300+ | Biogas units | Installed in rural kitchens."
        },
        {
          "id": "numbers-card-education",
          "label": "Education Flip Card",
          "heading": "Education",
          "body": "Early childhood education and lifelong learning opportunities for every child.",
          "items": "120+ | Pre-school children | Enrolled each year.\n8 | Mobile libraries | Reaching remote villages.\n60+ | Annual scholarships | For the poorest students."
        },
        {
          "id": "numbers-card-livelihoods",
          "label": "Livelihoods Flip Card",
          "heading": "Livelihoods & Child Protection",
          "body": "Economic empowerment and child safeguarding go hand in hand.",
          "items": "2,400+ | SfC members | Saving and lending together.\n12 | Cooperatives | Rice, vegetables and enterprise.\n600+ | Peer educators | Trained in child rights."
        }
      ]
    }'
  ),

  -- 3. Impact Timeline Subpage
  (
    'impact-timeline', 
    'Impact Timeline', 
    '/impact/timeline', 
    'Impact', 
    'en', 
    'standard', 
    'published',
    'Timeline',
    'Thirty years of walking with villages.',
    'Progress built through patient partnership from founding in Svay Rieng to today.',
    13,
    now(),
    '{
      "kind": "santi-sena-page-content",
      "version": 1,
      "route": "/impact/timeline",
      "group": "Impact",
      "eyebrow": "Timeline",
      "headline": "Thirty years of walking with villages.",
      "intro": "Progress built through patient partnership from founding in Svay Rieng to today.",
      "primaryAction": "Take the next step",
      "secondaryAction": "",
      "sections": [
        {
          "id": "timeline-stats",
          "label": "Hero Reach Stats",
          "heading": "Key Reach Numbers",
          "body": "The key reach numbers shown at the top of the Timeline page.",
          "items": "293 | Villages\n43 | Communes\n3 | Provinces"
        },
        {
          "id": "timeline-events",
          "label": "Timeline Events",
          "heading": "Progress built through patient partnership.",
          "body": "Timeline milestones showing thirty years of growth.",
          "items": "2024 | 30-Year Strategic Plan | New five-year strategy to deepen quality, diversify funding and invest in youth leadership. | The plan prioritises three pillars: (1) expanding community-led education programmes, (2) strengthening child protection systems, and (3) launching a dedicated youth innovation fund. Over 50 community dialogues were held to co‑design the strategy.\n2022 | Melaleuca Oil Enterprise | Village forest guardians launch a rural enterprise from non-timber forest products. | With technical support from Santi Sena, 12 village cooperatives now sustainably harvest melaleuca leaves, producing essential oils sold locally and exported. The enterprise provides income for 200 families while preserving the forest.\n2020 | COVID-19 Response | Emergency food, hygiene and remote-learning kits reach more than 200 villages. | In partnership with local authorities, we distributed 3,500 food packs, 5,000 hygiene kits, and 2,000 radio‑based learning materials to keep children learning despite school closures.\n2018 | Child Protection Networks | CPNs become active across 43 communes with 24/7 referral pathways. | Each network includes trained volunteers, social workers, and local police. They have handled over 1,200 cases, ensuring vulnerable children receive immediate care and legal support.\n2014 | 20th Anniversary | Kratie office opens. Programs extend to a third province and staff grows past 30 full-time. | The expansion to Kratie brought our integrated approach to another province, reaching an additional 80 villages. We also launched our first youth leadership camp that year.\n2011 | Biogas program launched | Household biogas units begin replacing firewood in remote kitchens. | By 2015, we had installed over 400 biogas units, reducing deforestation and improving indoor air quality. The program also trains local technicians to maintain the systems.\n2007 | Expansion to Prey Veng | Education and child protection programming reaches a second province. | We partnered with the provincial government to replicate the Svay Rieng model, focusing on school enrolment and community‑based child protection committees.\n2003 | Saving-for-Change begins | First women-led savings circles launched in Svay Rieng; the model becomes a program backbone. | Today, over 500 savings groups exist, with more than 12,000 members. The groups provide micro‑loans and financial literacy training, empowering women to start small businesses.\n1998 | First community forestry site | Village committees take legal stewardship of 120 hectares of degraded forest. | The site has since become a model for community‑led reforestation, with over 50,000 trees planted and a thriving biodiversity corridor. It now serves as a learning hub for other villages.\n1994 | Founded in Svay Rieng | Buddhist monks and community elders establish the Peace Army after the war, focused on moral regeneration and rural recovery. | The founding team began with just five monks and a handful of volunteers. Their first project was rebuilding a primary school destroyed during the conflict, which became the spark for decades of community development."
        }
      ]
    }'
  ),

  -- 4. Impact Partners Subpage
  (
    'impact-partners', 
    'Impact Partners', 
    '/impact/partners', 
    'Impact', 
    'en', 
    'standard', 
    'published',
    'Partners',
    'Trusted by ten+ international donors and every government line ministry we touch.',
    'Partners stay because Santi Sena combines long presence, audited financial systems, deep community trust and proven ability to scale.',
    14,
    now(),
    '{
      "kind": "santi-sena-page-content",
      "version": 1,
      "route": "/impact/partners",
      "group": "Impact",
      "eyebrow": "Partners",
      "headline": "Trusted by ten+ international donors and every government line ministry we touch.",
      "intro": "Partners stay because Santi Sena combines long presence, audited financial systems, deep community trust and proven ability to scale.",
      "primaryAction": "Ready to take the next step?",
      "secondaryAction": "",
      "sections": [
        {
          "id": "partners-supporters",
          "label": "Supporters logos",
          "heading": "Partners & Supporters",
          "body": "These organizations and institutions make our work possible through funding, technical expertise, and shared commitment to sustainable development.",
          "items": "UNDP\nAsian Development Bank\nOxfam\nBread for the World\nMisereor\nEuropean Union\nUSAID / Winrock\nDiakonia\nHeinrich Böll Stiftung\nCaritas"
        },
        {
          "id": "partners-government",
          "label": "Government Relations",
          "heading": "Government Coordination",
          "body": "We work hand-in-hand with national and provincial government bodies to align our programs with Cambodia's development priorities.",
          "items": "Ministry of Interior | Policy, registration, and governance. | building\nMinistry of Environment | Community forestry, nursery support, and conservation. | tree\nMinistry of Women''s Affairs | Child protection, gender equity, and safe migration. | users\nMinistry of Education, Youth and Sport | Pre-schools, mobile libraries, and youth learning. | book\nProvincial Departments | Field-level coordination in Svay Rieng, Prey Veng, and Kratie. | map-pin"
        },
        {
          "id": "partners-local",
          "label": "Local partners list",
          "heading": "Local Partners",
          "body": "Sustainable change is built from the ground up. These local institutions and networks are the backbone of every program we run.",
          "items": "01 | Pagoda & Monastic Networks | Buddhist monks act as community guides and project facilitators.\n02 | Commune Councils & Child Rights | Local authorities coordinate child protection networks in 43 communes.\n03 | NGO Forum & Working Groups | Collaborative platforms for advocacy and knowledge sharing at the national level."
        },
        {
          "id": "partners-why",
          "label": "Why partners stay list",
          "heading": "Why Partners Stay",
          "body": "Long-term partnerships don''t happen by chance. Here''s what keeps our partners committed year after year.",
          "items": "30 Years of Presence | Founded in 1994, our deep roots in villages ensure long-term stability. | building\nAudited Financial Systems | External annual audits guarantee complete transparency and stewardship of funds. | bar-chart\nDeep Community Trust | Decades of relationship-building mean villages lead their own growth. | handshake\nProven Ability to Scale | A structures network of field offices lets us scale programs efficiently. | rocket"
        }
      ]
    }'
  )
ON CONFLICT (slug) 
DO UPDATE SET
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  route_path = EXCLUDED.route_path,
  nav_group = EXCLUDED.nav_group,
  hero_eyebrow = EXCLUDED.hero_eyebrow,
  hero_headline = EXCLUDED.hero_headline,
  hero_intro = EXCLUDED.hero_intro,
  sort_order = EXCLUDED.sort_order,
  published_at = EXCLUDED.published_at,
  updated_at = now();
