-- ============================================================
-- FIX: Update education program metadata with matching content
-- Copy & paste the ENTIRE block into Supabase SQL Editor and RUN
-- ============================================================

UPDATE public.programs
SET metadata = jsonb_build_object(
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
    )
  )
),
    updated_at = now()
WHERE slug = 'programs-education';

-- Verify the update
SELECT slug, metadata->>'headline' AS headline, jsonb_array_length(metadata->'sections') AS section_count
FROM public.programs
WHERE slug = 'programs-education';
