-- ============================================================
-- FIX: Create the programs table + RLS for Education Dashboard
-- ============================================================
-- Copy & paste the ENTIRE block below into Supabase SQL Editor
-- and click RUN. This is SAFE to run multiple times.
-- ============================================================

-- 1. Create the programs table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  pillar TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published',
  metadata JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Allow public read + any authenticated user can write
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read" ON public.programs;
DROP POLICY IF EXISTS "Allow authenticated write" ON public.programs;
DROP POLICY IF EXISTS "Published programs are public" ON public.programs;
DROP POLICY IF EXISTS "Content admins can manage programs" ON public.programs;

CREATE POLICY "Allow public read" ON public.programs
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write" ON public.programs
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
git 
-- 3. Create profiles table (needed for admin login role)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'viewer',
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can upsert own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can upsert own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Grant your admin user the 'admin' role
--    ⚠️ CHANGE this email to YOUR admin login email before running!
INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
  id,
  email,
  'admin',
  'Admin'
FROM auth.users
WHERE LOWER(email) = LOWER('replace-with-your-admin-email@example.org')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = 'admin',
  full_name = EXCLUDED.full_name,
  updated_at = now();

-- 5. Seed the education program row (so it exists) with matching website content
INSERT INTO public.programs (slug, title, pillar, summary, description, status, metadata)
VALUES (
  'programs-education',
  'Education Program',
  'Education',
  'Community pre-schools, mobile libraries, scholarships and Buddhist education.',
  'Helping rural children keep learning through local teachers, libraries and family support.',
  'published',
  jsonb_build_object(
    'headline', 'A teacher in every village. A book in every hand.',
    'intro', 'Community pre-schools, mobile libraries, scholarships and Buddhist education help rural children keep learning.',
    'statsBand', jsonb_build_array(
      jsonb_build_object('number', '120+', 'label', 'PRE-SCHOOL CHILDREN', 'description', 'Enrolled each year across remote villages in Svay Rieng and Prey Veng.'),
      jsonb_build_object('number', '8', 'label', 'MOBILE LIBRARIES', 'description', 'Reaching villages with no school library or bookshop within 20 km.'),
      jsonb_build_object('number', '60+', 'label', 'ANNUAL SCHOLARSHIPS', 'description', 'For the poorest students at every level — especially girls.')
    ),
    'sections', jsonb_build_array(
      jsonb_build_object(
        'id', 'education-work',
        'label', 'What we do',
        'heading', 'What we do',
        'body', 'Community pre-schools led by trained local teachers, mobile libraries reaching remote villages, scholarships for the poorest students, Buddhist moral education, youth peer-educator groups, and teacher training to keep children in school.',
        'items', E'Community pre-schools led by trained local teachers in remote villages\nMobile library service bringing books, audio and learning kits to children\nScholarships covering uniforms, supplies and transport for the poorest students\nBuddhist moral education and life-skills classes in pagoda settings\nYouth peer-educator groups on health, environment and child rights\nTeacher training and parent engagement to keep children in school'
      ),
      jsonb_build_object(
        'id', 'education-approach',
        'label', 'Approach',
        'heading', 'Our approach',
        'body', E'We hire teachers from the villages we serve, train them in early-childhood pedagogy, and pair every classroom with a parent committee. Curriculum blends the national standard with Buddhist ethics, Khmer culture and hands-on environmental learning — so a child grows up rooted in both the national curriculum and the wisdom of the pagoda.',
        'items', ''
      ),
      jsonb_build_object(
        'id', 'education-why',
        'label', 'Why it matters',
        'heading', 'Why it matters',
        'body', 'Children who attend pre-school are far more likely to complete primary and secondary school. Scholarships keep the poorest girls in class through their most vulnerable years, while mobile libraries reach villages a bus route never will.',
        'items', E'Children who attend pre-school are far more likely to complete primary and secondary school\nScholarships keep the poorest girls in class through the most vulnerable years\nMobile libraries reach children a bus route never will\nPagoda-based ethics classes preserve Khmer language and moral tradition'
      ),
      jsonb_build_object(
        'id', 'education-team',
        'label', 'Organizational Structure',
        'heading', 'Who delivers education on the ground',
        'body', 'Our dedicated team works across provinces to ensure every child has access to quality education.',
        'items', E'Program Director | compass | Oversees education initiatives, partnerships, and donor reporting across all provinces.\nField Coordinators | map | Manage pre-school, library and scholarship programs in each province.\nTeachers & Facilitators | heart | Deliver early learning, literacy sessions and youth clubs in village settings.\nMonitoring & Evaluation | chart | Tracks learning progress, attendance and community outcomes.'
      )
    )
  )
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  pillar = EXCLUDED.pillar,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  status = 'published',
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- 6. Seed the environment program row (so it exists) with matching website content
INSERT INTO public.programs (slug, title, pillar, summary, description, status, metadata)
VALUES (
  'programs-environment',
  'Environment Program',
  'Environment',
  'Community-led conservation, reforestation, and sustainable development restoring Cambodia''s ecosystems.',
  'Our environment program takes a holistic approach to conservation, combining immediate action with long-term community education and sustainable development.',
  'published',
  jsonb_build_object(
    'headline', 'Protecting the land that sustains villages.',
    'intro', 'Community forestry, biogas digesters, rainwater harvesting and WASH — climate resilience built one household at a time.',
    'statsBand', jsonb_build_array(
      jsonb_build_object('number', '571', 'label', 'HECTARES PROTECTED', 'description', 'Community forest agreements and restored land.'),
      jsonb_build_object('number', '18', 'label', 'VILLAGES SERVED', 'description', 'With biogas, water access and climate adaptation.'),
      jsonb_build_object('number', '2,500+', 'label', 'HOUSEHOLDS REACHED', 'description', 'With clean water and renewable energy solutions.')
    ),
    'sections', jsonb_build_array(
      jsonb_build_object(
        'id', 'environment-work',
        'label', 'What we do',
        'heading', 'What we do',
        'body', 'Community forestry, biogas digesters, rainwater harvesting and WASH — climate resilience built one household at a time.',
        'items', E'Community forestry agreements\nBiogas digester installation\nRainwater harvesting systems\nWASH facilities in schools and clinics\nTree nursery support and reforestation'
      ),
      jsonb_build_object(
        'id', 'environment-approach',
        'label', 'Approach',
        'heading', 'Our approach',
        'body', E'Our approach combines scientific expertise with community participation to create lasting environmental change. We work alongside villages to restore forests, install renewable energy, and build climate resilience that families can see and sustain.',
        'items', ''
      ),
      jsonb_build_object(
        'id', 'environment-team',
        'label', 'Organizational Structure',
        'heading', 'Who delivers environment programs on the ground',
        'body', 'Our dedicated team works across provinces protecting forests, building climate resilience and restoring ecosystems.',
        'items', E'Program Director | compass | Oversees environmental programs, conservation initiatives, and partnerships across provinces.\nField Coordinators | map | Manage community forestry, biogas, and WASH projects in target villages.\nConservation Trainers | heart | Deliver climate-smart agriculture, reforestation and environmental education.\nWASH Officers | chart | Implement clean water, sanitation and rainwater harvesting solutions.'
      ),
      jsonb_build_object(
        'id', 'environment-why',
        'label', 'Why it matters',
        'heading', 'Why it matters',
        'body', 'Southeastern Cambodia is one of the most climate-vulnerable regions in the country. Healthy forests and clean water are peacekeeping infrastructure.',
        'items', E'Deforestation leaves communities exposed to floods and droughts\nClean water access prevents disease and keeps children in school\nRenewable energy reduces dependence on charcoal and firewood\nCommunity forests protect biodiversity for future generations'
      )
    ),
    'partners', jsonb_build_array(
      jsonb_build_object('name', 'UN Environment', 'type', 'International Partner', 'description', ''),
      jsonb_build_object('name', 'Green Cambodia', 'type', 'Local NGO', 'description', ''),
      jsonb_build_object('name', 'Eco Foundation', 'type', 'Funding Partner', 'description', ''),
      jsonb_build_object('name', 'Wildlife Alliance', 'type', 'Conservation Partner', 'description', ''),
      jsonb_build_object('name', 'Solar Future', 'type', 'Technology Partner', 'description', ''),
      jsonb_build_object('name', 'Rainforest Trust', 'type', 'Global Supporter', 'description', '')
    )
  )
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  pillar = EXCLUDED.pillar,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  status = 'published',
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- 7. Refresh the schema cache so Supabase API finds the table NOW
NOTIFY pgrst, 'reload schema';

-- 8. Seed the livelihood program row (so it exists) with matching website content
INSERT INTO public.programs (slug, title, pillar, summary, description, status, metadata)
VALUES (
  'programs-livelihood',
  'Livelihood Program',
  'Livelihood',
  'Integrated farming, savings groups, cooperatives and rural enterprises.',
  'Strengthening household income so families can avoid harmful debt and stay resilient.',
  'published',
  jsonb_build_object(
    'headline', 'Growing practical income and food security.',
    'intro', 'Saving-for-Change groups, women-led cooperatives, and rural enterprises that keep families out of debt.',
    'statsBand', jsonb_build_array(
      jsonb_build_object('number', '180+', 'label', 'SAVINGS GROUPS', 'description', 'Women-led Saving-for-Change circles active across three provinces.'),
      jsonb_build_object('number', '2,400+', 'label', 'MEMBERS', 'description', 'Saving, lending and investing together.'),
      jsonb_build_object('number', '12', 'label', 'COOPERATIVES', 'description', 'Rice, vegetables, melaleuca oil and handicrafts.')
    ),
    'sections', jsonb_build_array(
      jsonb_build_object(
        'id', 'livelihood-work',
        'label', 'What we do',
        'heading', 'What we do',
        'body', 'Integrated farming, savings groups, cooperatives, rural enterprise, financial literacy and market linkages that build family income.',
        'items', E'Integrated Farming\nSaving-for-Change\nCooperatives\nRural Enterprise\nFinancial Literacy\nMarket Linkages'
      ),
      jsonb_build_object(
        'id', 'livelihood-approach',
        'label', 'Approach',
        'heading', 'Our approach',
        'body', E'We do not distribute cash. We build the systems — saving groups, cooperatives, farmer schools — that let a household earn, save, invest and repeat. Every group is coached for 18–24 months, then graduates to independence with our field team on call.',
        'items', ''
      ),
      jsonb_build_object(
        'id', 'livelihood-team',
        'label', 'Organizational Structure',
        'heading', 'Who delivers livelihood programs on the ground',
        'body', 'Our dedicated team works across provinces building sustainable income and food security for rural families.',
        'items', E'Program Director | compass | Oversees livelihood programs, savings groups, and enterprise partnerships across provinces.\nField Coordinators | map | Manage Saving-for-Change groups and cooperative development in target villages.\nAgricultural Trainers | heart | Deliver farmer field schools and climate-smart agriculture training.\nEnterprise Officers | chart | Support small business development, market linkages and financial literacy.'
      ),
      jsonb_build_object(
        'id', 'livelihood-why',
        'label', 'Why it matters',
        'heading', 'Why it matters',
        'body', 'Cash predictability is what lets a family send their child to school this term instead of to a garment factory.',
        'items', E'Household income diversification reduces the risk of debt bondage and trafficking\nWomen-led savings shift decision-making power inside the household\nCooperatives break the isolation of the smallholder in the marketplace\nLocal enterprise keeps young adults in the village, near their children'
      )
    )
  )
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  pillar = EXCLUDED.pillar,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  status = 'published',
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- 7. Seed the child protection program row with matching website content
INSERT INTO public.programs (slug, title, pillar, summary, description, status, metadata)
VALUES (
  'programs-child-protection',
  'Child Protection Program',
  'Child Protection',
  'Anti-trafficking campaigns, child protection networks, peer educators and child rights advocacy.',
  'Building village protection systems that keep children safe and in school.',
  'published',
  jsonb_build_object(
    'headline', 'Safeguarding children through local action.',
    'intro', 'Cross-border migration, poverty and family separation put rural Cambodian children at risk of unsafe labour and trafficking.',
    'statsBand', jsonb_build_array(
      jsonb_build_object('number', '43', 'label', 'COMMUNES', 'description', 'With active Child Protection Networks.'),
      jsonb_build_object('number', '600+', 'label', 'PEER EDUCATORS', 'description', 'Youth trained in child rights and safeguarding.'),
      jsonb_build_object('number', '24/7', 'label', 'VILLAGE HOTLINES', 'description', 'Case referral into commune and provincial authorities.')
    ),
    'sections', jsonb_build_array(
      jsonb_build_object(
        'id', 'child-protection-work',
        'label', 'What we do',
        'heading', 'What we do',
        'body', 'Anti-trafficking campaigns, village child protection networks, peer-educator groups and family reintegration — safeguarding children through local action.',
        'items', E'Anti-trafficking campaigns at borders, markets and schools\nVillage Child Protection Networks trained in identification and referral\nChild rights advocacy with commune councils and provincial authorities\nPeer-educator youth groups on safe migration, health and rights\nFamily reintegration support for children returning from unsafe labour\nSafeguarding training for every teacher, monk and volunteer'
      ),
      jsonb_build_object(
        'id', 'child-protection-approach',
        'label', 'Approach',
        'heading', 'Our approach',
        'body', E'Every network is anchored by the people children already trust — mothers, monks, teachers, commune council members. We train, coach and connect them to formal referral pathways so every case reaches the provincial social affairs office the same day it is identified.',
        'items', ''
      ),
      jsonb_build_object(
        'id', 'child-protection-team',
        'label', 'Organizational Structure',
        'heading', 'Who delivers child protection on the ground',
        'body', 'Our dedicated team works across provinces building community safeguarding systems that keep children safe.',
        'items', E'Program Director | compass | Oversees child protection programs, advocacy, and partnerships across provinces.\nField Coordinators | map | Manage child protection networks, peer education and safe migration training.\nSafeguarding Trainers | heart | Deliver training for teachers, monks and volunteers on child rights and referral.\nMonitoring & Evaluation | chart | Track case outcomes, network coverage and community impact.'
      ),
      jsonb_build_object(
        'id', 'child-protection-why',
        'label', 'Why it matters',
        'heading', 'Why it matters',
        'body', 'The border with Vietnam brings both opportunity and risk. Community-led safeguarding is the most durable defense.',
        'items', E'The safest village is one where every adult knows every child''s name\nEarly identification prevents trafficking before it happens\nLocal networks respond faster than any external agency\nChildren who feel safe stay in school and out of harm'
      )
    )
  )
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  pillar = EXCLUDED.pillar,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  status = 'published',
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- 8. REFRESH schema cache
NOTIFY pgrst, 'reload schema';

-- 9. VERIFICATION — run these to confirm everything worked
SELECT '✅ programs table' AS check_name, COUNT(*) AS rows FROM public.programs;
SELECT '✅ profiles table' AS check_name, COUNT(*) AS rows FROM public.profiles;
SELECT '✅ your admin profile' AS check_name, email, role FROM public.profiles WHERE role = 'admin';
