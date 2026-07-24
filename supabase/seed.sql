-- Seed default content for the Santi Sena NGO admin CMS.
-- Run after all migrations.

BEGIN;

DROP TABLE IF EXISTS seed_pages;
CREATE TEMP TABLE seed_pages (
  slug text PRIMARY KEY,
  route_path text NOT NULL,
  nav_group text NOT NULL,
  title text NOT NULL,
  eyebrow text,
  headline text,
  intro text,
  primary_action text,
  secondary_action text,
  sort_order integer NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_pages (
  slug,
  route_path,
  nav_group,
  title,
  eyebrow,
  headline,
  intro,
  primary_action,
  secondary_action,
  sort_order
)
VALUES
  (E'home', E'/', E'Home', E'Home', E'Buddhist NGO . Cambodia . Since 1994', E'Walking with villages toward peace, sustainability and dignity.', E'Santi Sena, the Peace Army, works alongside rural Cambodian communities in Svay Rieng, Prey Veng and Kratie, protecting forests, teaching children, growing livelihoods and safeguarding families.', E'Support Us', E'Stand with us', 1),
  (E'about', E'/about', E'About', E'About Santi Sena', E'About Santi Sena', E'A peace army born from the Dharma, raised by villages.', E'Founded in 1994 by Cambodian Buddhist monks, Santi Sena emerged from the ashes of conflict with a quiet conviction: lasting peace is grown in soil, schools and dignified work.', null, null, 2),
  (E'about-vision', E'/about/vision', E'About', E'Vision & Mission', E'Vision & Mission', E'Shaping a Future of Equity & Opportunity', E'A focused page for Santi Sena vision, mission, values and the practical commitments that guide long-term village work.', E'Join Us', null, 3),
  (E'about-organization', E'/about/organization', E'About', E'Organization', E'Organization', E'A team of monks, managers and master practitioners.', E'Santi Sena combines Buddhist leadership, professional management and field teams close to the communities they serve.', null, null, 4),
  (E'programs', E'/programs', E'Programs', E'Programs', E'Our Programs', E'Four roots. One tree of peace.', E'Santi Sena''s work follows four interwoven strategic goals: environment, education, livelihoods and child protection, each delivered with and by the communities themselves.', E'Explore programs', null, 5),
  (E'programs-environment', E'/programs/environment', E'Programs', E'Environment', E'Environment', E'Protecting Our Planet For Future Generations', E'Environmental stewardship in action through conservation, sustainability and community engagement.', E'Join the Environmental Movement', null, 6),
  (E'programs-education', E'/programs/education', E'Programs', E'Education', E'Education', E'A teacher in every village. A book in every hand.', E'Community pre-schools, mobile libraries, scholarships and Buddhist education help rural children keep learning.', null, null, 7),
  (E'programs-livelihood', E'/programs/livelihood', E'Programs', E'Livelihood', E'Livelihood', E'Dignified work rooted in the village.', E'Saving groups, home gardens, cooperatives and rural enterprises help families build economic resilience.', null, null, 8),
  (E'programs-child-protection', E'/programs/child-protection', E'Programs', E'Child Protection', E'Child Protection', E'Every child safe. Every child in school.', E'Village child protection networks, peer educators and safe migration training protect children from trafficking, exploitation and abuse.', null, null, 9),
  (E'services', E'/services', E'Programs', E'Services', E'Services', E'Services', E'Education grants, water and sanitation, and sustainable farming support.', null, null, 10),
  (E'impact', E'/impact', E'Impact', E'Impact', E'Our Impact', E'Three decades. One quiet revolution.', E'Every number is a household with a safer roof, a child with a teacher, a forest still standing.', null, null, 11),
  (E'impact-numbers', E'/impact/numbers', E'Impact', E'Impact Numbers', E'Impact Numbers', E'Thirty years, measured village by village.', E'A deeper numbers page for environment, education, livelihoods and child protection results.', E'Take the next step', null, 12),
  (E'impact-timeline', E'/impact/timeline', E'Impact', E'Impact Timeline', E'Timeline', E'Thirty years of walking with villages.', E'Progress built through patient partnership from founding in Svay Rieng to today.', E'Take the next step', null, 13),
  (E'impact-partners', E'/impact/partners', E'Impact', E'Impact Partners', E'Partners', E'Trusted by ten+ international donors and every government line ministry we touch.', E'Partners stay because Santi Sena combines long presence, audited financial systems, deep community trust and proven ability to scale.', E'Ready to take the next step?', null, 14),
  (E'get-involved', E'/get-involved', E'Get Involved', E'Get Involved', E'Get involved', E'Stand beside a village. Plant a generation.', E'Every gift, partnership and pair of hands becomes another root in the tree we have been tending for thirty years.', E'Start monthly giving', null, 15),
  (E'get-involved-donate', E'/get-involved/donate', E'Get Involved', E'Donate', E'Donate', E'Support peace, livelihoods and environmental protection.', E'Donations strengthen community forests, education, livelihoods, WASH, Buddhist preservation and child protection.', E'Ready to support the work?', null, 16),
  (E'get-involved-volunteer', E'/get-involved/volunteer', E'Get Involved', E'Volunteer', E'Volunteer', E'Bring your skills to community-led work in Cambodia.', E'Volunteers support practical field work across forestry, livelihoods, WASH, education, child protection and Buddhist values.', E'Tell Santi Sena what you can bring', null, 17),
  (E'get-involved-partner', E'/get-involved/partner', E'Get Involved', E'Partner', E'Partner', E'Partner with Santi Sena', E'Long-term cooperation is organized around village priorities and practical community systems.', E'Create a practical partnership', null, 18),
  (E'contact', E'/contact', E'Contact', E'Contact', E'Contact', E'Write to us. We read every letter.', E'Whether you wish to partner, donate, visit or simply learn more, our team in Cambodia is ready to hear from you.', E'Send message', null, 19),
  (E'contact-head-office', E'/contact/headoffice', E'Contact', E'Head Office', E'Contact - Head Office', E'Visit us in Svay Rieng.', E'Our headquarters sits in Svay Rieng town, walking distance from the provincial pagoda where Santi Sena was founded thirty years ago.', E'Send a message', null, 20),
  (E'contact-field-offices', E'/contact/fieldoffice', E'Contact', E'Field Offices', E'Contact - Field Offices', E'Where the work actually happens.', E'Our two provincial field offices are the daily home of the staff who walk into villages and the easiest way to reach a program directly.', E'Visit head office', null, 21),
  (E'qr-donate', E'/qr-donate', E'Get Involved', E'QR Donate', E'Donate Locally', E'Donate Locally in Cambodia', E'Scan with your banking app. No internet transfer fees. Your contribution directly supports the education of disabled children.', E'Pay with QR', E'Pay with credit card', 22),
  (E'site-footer', E'global', E'Global', E'Header & Footer', E'Global content', E'Santi Sena', E'A Buddhist NGO founded in 1994, walking with Cambodian communities toward peace, sustainability and dignified livelihoods.', E'Support Us', null, 23);

DROP TABLE IF EXISTS seed_sections;
CREATE TEMP TABLE seed_sections (
  page_slug text NOT NULL,
  section_slug text NOT NULL,
  label text NOT NULL,
  section_type text NOT NULL,
  sort_order integer NOT NULL,
  heading text,
  body text,
  items text,
  PRIMARY KEY (page_slug, section_slug)
) ON COMMIT DROP;

INSERT INTO seed_sections (
  page_slug,
  section_slug,
  label,
  section_type,
  sort_order,
  heading,
  body,
  items
)
VALUES
  (E'home', E'home-stats', E'Stats', E'content', 1, E'293 villages, 43 communes, 30+ years of service, 10+ international partners', E'Use this block for the public homepage impact counters.', E'293 | Villages Reached\n43 | Communes Served\n30+ | Years of Service\n10+ | International Partners'),
  (E'home', E'home-mission', E'Mission', E'content', 2, E'Peace is planted, not declared.', E'Santi Sena, the Peace Army, was founded by Cambodian Buddhist monks in 1994 to alleviate poverty and rebuild moral, environmental and economic life after decades of conflict.', null),
  (E'home', E'home-pillars', E'Strategic goals', E'content', 3, E'Four Pillars', E'The four public program pillars shown on the homepage.', E'Natural Resource & Environment | Community forestry, tree nurseries, WASH, climate adaptation and biogas.\nAccess to Education | Community pre-schools, mobile libraries, scholarships and Buddhist education.\nLivelihood & Economic Improvement | Integrated farming, savings groups, cooperatives and rural enterprises.\nChild Protection | Anti-trafficking campaigns, child protection networks, peer educators and child rights advocacy.'),
  (E'home', E'home-cta', E'Call to action', E'content', 4, E'Join the Peace Army.', E'Donate, partner, volunteer. Every act seeds another village with hope.', E'Support Us\nPartner with us'),
  (E'about', E'about-vmg', E'Vision, mission, goal', E'content', 1, E'Vision, Mission, Goal', E'Vision: A Cambodia where peace, justice and harmony flourish. Mission: Alleviate poverty through community-led development rooted in Buddhist ethics. Goal: Better work and living situations for vulnerable rural households.', E'Vision | A Cambodia where peace, justice and harmony flourish across every village and generation.\nMission | To alleviate poverty through community-led development rooted in Buddhist ethics.\nGoal | Better work and living situations for the most vulnerable rural households of southeastern Cambodia.'),
  (E'about', E'about-values', E'Core values', E'content', 2, E'Five vows that shape every program', E'The values listed on the About page.', E'Honesty | We have honesty with donors, target groups, operational partners and working groups.\nNon-discrimination | We do not discriminate by disability, religion, color, race, target group or political faction.\nCollective Benefits | We do not utilize organization property for private benefit.\nFlexibility | We respect and accept good comments from target groups and development partners.\nEmpowerment | We do not deliver development; we hand it back to the community.'),
  (E'about', E'about-team', E'Team', E'content', 3, E'A team of monks, managers and master practitioners.', E'From the Board of Directors to field staff in Kratie, every level is accountable to the villagers served and donors who trust Santi Sena.', E'Board of Directors | Policy and oversight, including senior Buddhist leadership.\nExecutive Director | Daily operations and strategic execution.\nManagement Committee | Coordinates programs across provinces.\nTechnical Coordination | Provides inputs across thematic areas.\nProfessional Staff | Full-time and project-based experts in agriculture, education and rural development.'),
  (E'about', E'about-reach', E'Geographical reach', E'content', 4, E'Three provinces. Forty-three communes. Two hundred and ninety-three villages.', E'Santi Sena works across Svay Rieng, Prey Veng and Kratie.', E'Svay Rieng\nPrey Veng\nKratie'),
  (E'about-vision', E'vision-strive', E'What we strive for', E'content', 1, E'What We Strive For', E'Inclusive growth, community empowerment and sustainable resilience.', E'Inclusive Growth\nCommunity Empowerment\nSustainable Resilience'),
  (E'about-vision', E'vision-guides', E'Mission', E'content', 2, E'How The Mission Becomes Practical', E'Santi Sena alleviates poverty through community-led development rooted in Buddhist ethics. Its work connects moral leadership with practical programs in education, livelihoods, environment and child protection.', E'Work with monks, villagers, local government and schools\nStrengthen education, savings groups and rural livelihoods\nProtect children from trafficking, unsafe migration and exploitation\nPreserve community forests, water resources and local resilience'),
  (E'about-organization', E'organization-structure', E'Structure', E'content', 1, E'How we are organized', E'Board, leadership, management committee, technical coordination and provincial staff work as one accountable team.', E'Board of Directors\nExecutive Director\nManagement Committee\nTechnical Coordination\nProfessional Staff'),
  (E'about-organization', E'organization-priorities', E'Priorities', E'content', 2, E'Operational priorities', E'The priorities that keep programs stable and transparent.', E'Strengthened governance and accountability\nStaff and volunteer development\nIncome and funding diversification\nResearch and knowledge management\nPublic advocacy'),
  (E'about-organization', E'organization-accountability', E'Accountability', E'content', 3, E'Accountability', E'Santi Sena is accountable to villagers, donors, government partners and the Buddhist values behind its founding.', null),
  (E'programs', E'programs-goals', E'Program goals', E'content', 1, E'Four strategic goals', E'Edit the goal cards and summaries shown across the Programs area.', E'Environment | Community forestry, biogas digesters, rainwater harvesting and WASH.\nEducation | Pre-schools, community libraries and youth scholarships.\nLivelihood | Saving-for-Change groups, women-led cooperatives and rural enterprises.\nChild Protection | Child protection networks, anti-trafficking outreach and safe-migration training.'),
  (E'programs', E'programs-priorities', E'Operational priorities', E'content', 2, E'How we keep the tree alive', E'Internal priorities that support every program.', E'Strengthened governance and accountability\nStaff and volunteer development\nIncome and funding diversification\nResearch and knowledge management\nPublic advocacy'),
  (E'programs-environment', E'environment-stewardship', E'Stewardship', E'content', 1, E'Environmental Stewardship in Action', E'Community-led action connects conservation, sustainability and local leadership.', E'Conservation\nSustainability\nCommunity Engagement'),
  (E'programs-environment', E'environment-work', E'What we do', E'content', 2, E'What We''re Doing', E'Main environmental activities shown on the page.', E'Reforestation Projects\nEnvironmental Education\nRenewable Energy Access\nWater Conservation\nSustainable Agriculture\nClimate Research & Advocacy'),
  (E'programs-environment', E'environment-method', E'How we work', E'content', 3, E'How We Work', E'Assessment, planning, implementation, monitoring and learning.', E'Assessment\nPlanning\nImplementation\nMonitoring & Learning'),
  (E'programs-education', E'education-work', E'What we do', E'content', 1, E'What we do', E'The main education interventions that appear on the public page.', E'Community pre-schools\nMobile libraries\nScholarships for poor children\nBuddhist education preservation\nTeacher and parent support'),
  (E'programs-education', E'education-approach', E'Approach', E'content', 2, E'Our approach', E'Education work is local, practical and connected to family support.', null),
  (E'programs-education', E'education-why', E'Why it matters', E'content', 3, E'Why it matters', E'Remote hamlets need early learning, reading access and support that helps children stay in school.', null),
  (E'programs-livelihood', E'livelihood-stats', E'Stats', E'content', 1, E'Livelihood numbers', E'Use this block for the statistics shown near the top of the livelihood page.', E'114 savings groups\n4,555 families\nAgricultural cooperatives\nHome gardens and biogas'),
  (E'programs-livelihood', E'livelihood-work', E'What we do', E'content', 2, E'What we do', E'Training, savings, cooperatives, agriculture and enterprise support.', E'Saving-for-Change groups\nIntegrated farming\nAgricultural cooperatives\nRural enterprises\nMelaleuca oil'),
  (E'programs-livelihood', E'livelihood-why', E'Why it matters', E'content', 3, E'Why it matters', E'Predictable income helps families avoid harmful debt and keep children in school.', null),
  (E'programs-child-protection', E'child-protection-stats', E'Stats', E'content', 1, E'Child protection numbers', E'Use this block for the public page statistics.', E'Child Protection Networks\nPeer educator groups\nSafe migration training\nChild rights advocacy'),
  (E'programs-child-protection', E'child-protection-work', E'What we do', E'content', 2, E'What we do', E'Community-led protection systems for vulnerable children and youth.', E'Anti-trafficking campaigns\nChild Protection Networks\nPeer educator groups\nSafe migration workshops\nChild rights advocacy'),
  (E'programs-child-protection', E'child-protection-approach', E'Approach', E'content', 3, E'Our approach', E'Safeguarding is strongest when families, elders, monks, schools and authorities work together.', null),
  (E'services', E'services-list', E'Services list', E'content', 1, E'Services', E'Short public services list.', E'Education Grants\nWater & Sanitation\nSustainable Farming'),
  (E'impact', E'impact-stats', E'Stats', E'content', 1, E'Impact numbers', E'Main impact counters on the Impact page.', E'293 | Villages served\n570+ | Hectares of forest\n120+ | Full-time staff\n15+ | International partners\n32 | Years of service\n4 | Strategic pillars'),
  (E'impact', E'impact-timeline', E'Timeline', E'content', 2, E'A journey rooted in patience.', E'Milestones shown on the Impact page.', E'1994 | Founding\n2002 | First community forestry\n2008 | Saving-for-Change\n2014 | 20-year horizon\n2024 | Today'),
  (E'impact', E'impact-partners', E'Partners', E'content', 3, E'Trusted by partners across the world.', E'Santi Sena has successfully managed grants from more than ten international institutions.', E'UNDP\nADB\nOxfam\nCIDA\nWorld Vision\nSave the Children\nActionAid\nCare'),
  (E'impact-numbers', E'numbers-overview', E'Overview', E'content', 1, E'Overview numbers', E'Top-level statistics and labels for the public numbers page.', E'Villages reached\nCommunes served\nHouseholds supported\nChildren reached\nForests protected'),
  (E'impact-numbers', E'numbers-method', E'How we count', E'content', 2, E'How we count', E'Plain-language notes explaining impact measurement.', E'Field reports\nPartner verification\nCommunity records\nAnnual review'),
  (E'impact-timeline', E'timeline-events', E'Events', E'content', 1, E'Progress built through patient partnership.', E'Timeline event titles and dates.', E'1994 | Founded in Svay Rieng\n2002 | First community forestry site\n2008 | Saving-for-Change begins\n2014 | 20th anniversary and Kratie office opens\n2020 | COVID-19 response\n2024 | 30-year strategic plan'),
  (E'impact-partners', E'partners-supporters', E'Supporters', E'content', 1, E'Partners & Supporters', E'International donors and supporters shown on the partners page.', E'UNDP\nADB\nOxfam\nWorld Vision\nSave the Children\nActionAid\nCare'),
  (E'impact-partners', E'partners-government', E'Government', E'content', 2, E'Government Coordination', E'Government partners and line ministries.', E'Ministry of Interior\nMinistry of Environment\nMinistry of Women and Affairs\nMinistry of Education, Youth and Sport\nProvincial Departments'),
  (E'impact-partners', E'partners-local', E'Local partners', E'content', 3, E'Local Partners', E'Local institutions that make field work possible.', E'Pagoda and Monastic Networks\nCommune Councils and Child Protection\nNGO Forum and Working Groups\nAcademic Partnerships\nSocial Enterprises'),
  (E'impact-partners', E'partners-why', E'Why partners stay', E'content', 4, E'Why Partners Stay', E'Reasons shown as cards on the public page.', E'30 years of unbroken presence\nAudited financial systems\nDeep community trust\nProven ability to scale'),
  (E'get-involved', E'get-involved-ways', E'Ways', E'content', 1, E'Ways to get involved', E'The three action cards on the Get Involved page.', E'Donate | Support community forests, livelihoods, education, WASH, Buddhist preservation and child protection work.\nPartner | Cooperate through community-rooted programs, local authorities, provincial departments and field teams.\nVolunteer | Bring your skills to a community-led project in the field.'),
  (E'get-involved', E'get-involved-tiers', E'Donation tiers', E'content', 2, E'What a donation actually does.', E'Donation amounts and example impacts.', E'$25 | One month of pre-school for a rural child.\n$80 | Twenty tree saplings planted in a community forest.\n$250 | A household biogas unit replacing firewood.\n$1,000 | A Saving-for-Change group seeded for one year.'),
  (E'get-involved', E'get-involved-monthly', E'Monthly giving', E'content', 3, E'Become a monthly companion.', E'Recurring donors give Santi Sena steady ground to plan multi-year programs with communities.', null),
  (E'get-involved-donate', E'donate-support', E'Support cards', E'content', 1, E'What your support strengthens', E'Impact cards shown on the donate page.', E'293 villages | Development programs reached Svay Rieng and Prey Veng communities.\n571.601 ha | Community forests supported across 18 villages and 2,372 households.\n27,810 seedlings | Tree nurseries produced seedlings for schools, communities and farms.\n114 groups | Saving for Change groups supported 4,555 families.\n363 children | Seventeen community pre-schools helped young children.\n3,400 children | Mobile library sessions promoted reading.'),
  (E'get-involved-donate', E'donate-areas', E'Program areas', E'content', 2, E'Program areas', E'Program areas donors can support.', E'Environment\nEducation\nLivelihoods\nWASH\nBuddhist preservation\nChild protection'),
  (E'get-involved-donate', E'donate-contact', E'Contact', E'content', 3, E'How to contact Santi Sena', E'Donation contact details and stewardship copy.', E'info@santisena.org\n+855 (0) 12 345 678\nSvay Rieng Province, Cambodia'),
  (E'get-involved-volunteer', E'volunteer-pathways', E'Pathways', E'content', 1, E'Choose a field area connected to the report.', E'Volunteer pathways on the public page.', E'Community forestry and climate action\nHome gardens and farmer groups\nSafe water and hygiene in schools\nPre-schools and mobile libraries\nChild rights and safe migration\nLearning through pagodas and values'),
  (E'get-involved-volunteer', E'volunteer-skills', E'Skills', E'content', 2, E'Volunteer work is practical, local and team-based.', E'Skill cards shown on the volunteer page.', E'Facilitation\nEducation support\nAgriculture and environment\nMonitoring and communication'),
  (E'get-involved-volunteer', E'volunteer-steps', E'Field steps', E'content', 3, E'How field volunteering works', E'Steps for volunteers.', E'Prepare with staff\nListen locally\nWork practically\nReflect and improve'),
  (E'get-involved-partner', E'partner-practice', E'Practice', E'content', 1, E'How collaboration becomes action', E'Partnership steps from community needs to learning.', E'Start with community needs\nBring the right institutions together\nStrengthen people, not only projects\nUse learning to guide the next cycle'),
  (E'get-involved-partner', E'partner-areas', E'Engagement areas', E'content', 2, E'Program systems named in the report', E'Main areas for partners.', E'Environment and forestry\nLivelihoods and agriculture\nWASH\nEducation\nBuddhist preservation\nChild protection'),
  (E'get-involved-partner', E'partner-commitments', E'Commitments', E'content', 3, E'What Santi Sena commits to partners', E'Commitments and operating principles for funders and collaborators.', E'Community accountability\nTransparent reporting\nPractical coordination\nLearning and adaptation'),
  (E'contact', E'contact-offices', E'Offices', E'content', 1, E'Office details', E'Contact details shown beside the public contact form.', E'Head Office | Svay Rieng Town, Svay Rieng Province, Kingdom of Cambodia\nEmail | info@santisena.org, partnerships@santisena.org\nPhone | +855 (0) 12 345 678\nField offices | Prey Veng Province, Kratie Province'),
  (E'contact', E'contact-form', E'Form', E'content', 2, E'Send a message', E'Name, email, subject and message fields are shown on the public contact form.', E'Name\nEmail\nSubject\nMessage\nMessage sent'),
  (E'contact-head-office', E'head-office-contact', E'Contact blocks', E'content', 1, E'Head office contact details', E'Address, email, phone and office hours.', E'Address | Santi Sena Organization, Svay Rieng Town, Svay Rieng Province, Kingdom of Cambodia\nEmail | info@santisena.org, partnerships@santisena.org, media@santisena.org\nPhone | +855 (0) 12 345 678, +855 (0) 44 987 654\nOffice hours | Monday - Friday, 8:00 - 17:00 Cambodia time, Saturday by appointment'),
  (E'contact-head-office', E'head-office-travel', E'Travel', E'content', 2, E'Getting here', E'Travel notes for visitors.', E'From Phnom Penh: about 2.5 hours by road via National Road 1\nFrom Ho Chi Minh City: about 4 hours via the Bavet-Moc Bai border\nNearest airport: Phnom Penh International\nTuk-tuks available from Svay Rieng town centre'),
  (E'contact-head-office', E'head-office-guidance', E'Visitor guidance', E'content', 3, E'Visitor guidance', E'Please email at least two weeks ahead so staff can arrange availability and field visits. Modest dress is appreciated.', null),
  (E'contact-field-offices', E'field-offices-list', E'Field offices', E'content', 1, E'Field office contact details', E'Provincial field office details.', E'Prey Veng Field Office | Prey Veng Town, Prey Veng Province, Cambodia | preyveng@santisena.org | +855 (0) 12 111 222\nKratie Field Office | Kratie Town, Kratie Province, Cambodia | kratie@santisena.org | +855 (0) 12 333 444'),
  (E'contact-field-offices', E'field-offices-visits', E'Visits', E'content', 2, E'Field visits', E'Donors, partners and researchers are welcome to visit a project site by arranging through head office at least two weeks in advance.', null),
  (E'contact-field-offices', E'field-offices-hours', E'Hours', E'content', 3, E'Office hours', E'Field office availability.', E'Monday - Friday: 8:00 - 17:00 Cambodia time\nField staff are often in villages; email response may take 24-48 hours\nProvincial coordinators available by phone during office hours'),
  (E'qr-donate', E'qr-methods', E'Payment methods', E'content', 1, E'Payment methods', E'QR donation methods shown on the local donate page.', E'ABA Pay | ABA BANK - CAMBODIA | SANTI SENA | 000 000 000 | KHR / USD\nACLEDA Bank | ACLEDA - CAMBODIA | SANTI SENA | 0000 0000 000 | KHR / USD'),
  (E'qr-donate', E'qr-notice', E'Receipt notice', E'content', 2, E'After completing your donation', E'Please send your payment screenshot to SANTISENAMONK@GMAIL.COM so Santi Sena can send an official receipt and gratitude.', null),
  (E'site-footer', E'global-navigation', E'Navigation', E'content', 1, E'Public navigation', E'Main public navigation groups and labels.', E'Home\nAbout\nPrograms\nImpact\nGet Involved\nContact\nSupport Us'),
  (E'site-footer', E'global-footer', E'Footer', E'content', 2, E'Footer content', E'Svay Rieng . Prey Veng . Kratie', E'Explore | About, Programs, Impact, Get Involved, Contact\nContact | Svay Rieng Province, Cambodia | info@santisena.org | +855 (0) 12 345 678\nBottom | Santi Sena Organization. All rights reserved. | Registered NGO. Partners: UNDP, ADB, Oxfam');

INSERT INTO public.site_settings (key, label, value, field_type, group_key, is_public)
VALUES
  ('site.name', 'Site name', to_jsonb('Santi Sena NGO'::text), 'text', 'general', true),
  ('site.tagline', 'Site tagline', to_jsonb('Peace Army . Cambodia'::text), 'text', 'general', true),
  ('contact.email', 'Primary email', to_jsonb('SANTISENAMONK@GMAIL.COM'::text), 'email', 'contact', true),
  ('contact.phone', 'Primary phone', to_jsonb('(+855-77) 65 54 64'::text), 'text', 'contact', true),
  ('contact.address', 'Primary address', to_jsonb('Svay Rieng Province, Cambodia'::text), 'textarea', 'contact', true),
  ('seo.default_description', 'Default SEO description', to_jsonb('A Buddhist NGO founded in 1994, walking with Cambodian communities toward peace, sustainability and dignified livelihoods.'::text), 'textarea', 'seo', true),
  ('partners.highlighted', 'Highlighted partners', '["UNDP", "ADB", "Oxfam"]'::jsonb, 'list', 'general', true)
ON CONFLICT (key) DO UPDATE
SET
  label = EXCLUDED.label,
  value = EXCLUDED.value,
  field_type = EXCLUDED.field_type,
  group_key = EXCLUDED.group_key,
  is_public = EXCLUDED.is_public,
  updated_at = now();

WITH page_payload AS (
  SELECT
    p.*,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', s.section_slug,
          'label', s.label,
          'heading', COALESCE(s.heading, ''),
          'body', COALESCE(s.body, ''),
          'items', COALESCE(s.items, '')
        )
        ORDER BY s.sort_order
      ) FILTER (WHERE s.section_slug IS NOT NULL),
      '[]'::jsonb
    ) AS sections
  FROM seed_pages p
  LEFT JOIN seed_sections s ON s.page_slug = p.slug
  GROUP BY
    p.slug,
    p.route_path,
    p.nav_group,
    p.title,
    p.eyebrow,
    p.headline,
    p.intro,
    p.primary_action,
    p.secondary_action,
    p.sort_order
)
INSERT INTO public.pages (
  slug,
  route_path,
  nav_group,
  locale,
  template,
  status,
  title,
  body,
  hero_eyebrow,
  hero_headline,
  hero_intro,
  primary_cta_label,
  primary_cta_url,
  secondary_cta_label,
  secondary_cta_url,
  seo_title,
  seo_description,
  sort_order,
  published_at,
  metadata,
  updated_at
)
SELECT
  slug,
  route_path,
  nav_group,
  'en',
  CASE WHEN route_path = 'global' THEN 'global' ELSE 'standard' END,
  'published',
  title,
  jsonb_build_object(
    'kind', 'santi-sena-page-content',
    'version', 1,
    'route', route_path,
    'group', nav_group,
    'eyebrow', COALESCE(eyebrow, ''),
    'headline', COALESCE(headline, title),
    'intro', COALESCE(intro, ''),
    'primaryAction', COALESCE(primary_action, ''),
    'secondaryAction', COALESCE(secondary_action, ''),
    'sections', sections
  )::text,
  eyebrow,
  headline,
  intro,
  primary_action,
  CASE
    WHEN primary_action IS NULL THEN NULL
    WHEN nav_group = 'Programs' THEN '/programs'
    WHEN nav_group = 'Get Involved' THEN '/get-involved'
    ELSE '/contact'
  END,
  secondary_action,
  CASE WHEN secondary_action IS NULL THEN NULL ELSE '/' END,
  title,
  intro,
  sort_order,
  now(),
  jsonb_build_object('seed', 'santi-sena-default'),
  now()
FROM page_payload
ON CONFLICT (slug, locale) DO UPDATE
SET
  route_path = EXCLUDED.route_path,
  nav_group = EXCLUDED.nav_group,
  locale = EXCLUDED.locale,
  template = EXCLUDED.template,
  status = EXCLUDED.status,
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  hero_eyebrow = EXCLUDED.hero_eyebrow,
  hero_headline = EXCLUDED.hero_headline,
  hero_intro = EXCLUDED.hero_intro,
  primary_cta_label = EXCLUDED.primary_cta_label,
  primary_cta_url = EXCLUDED.primary_cta_url,
  secondary_cta_label = EXCLUDED.secondary_cta_label,
  secondary_cta_url = EXCLUDED.secondary_cta_url,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  sort_order = EXCLUDED.sort_order,
  published_at = COALESCE(public.pages.published_at, EXCLUDED.published_at),
  metadata = public.pages.metadata || EXCLUDED.metadata,
  updated_at = now();

INSERT INTO public.page_sections (
  page_id,
  slug,
  label,
  section_type,
  sort_order,
  heading,
  body,
  settings,
  status,
  updated_at
)
SELECT
  p.id,
  s.section_slug,
  s.label,
  s.section_type,
  s.sort_order,
  s.heading,
  s.body,
  jsonb_build_object('items_text', COALESCE(s.items, ''), 'seed', 'santi-sena-default'),
  'published',
  now()
FROM seed_sections s
JOIN public.pages p ON p.slug = s.page_slug AND p.locale = 'en'
ON CONFLICT (page_id, slug) DO UPDATE
SET
  label = EXCLUDED.label,
  section_type = EXCLUDED.section_type,
  sort_order = EXCLUDED.sort_order,
  heading = EXCLUDED.heading,
  body = EXCLUDED.body,
  settings = EXCLUDED.settings,
  status = EXCLUDED.status,
  updated_at = now();

WITH raw_items AS (
  SELECT
    ps.id AS section_id,
    item.ordinality::integer AS sort_order,
    trim(item.line) AS line
  FROM seed_sections s
  JOIN public.pages p ON p.slug = s.page_slug AND p.locale = 'en'
  JOIN public.page_sections ps ON ps.page_id = p.id AND ps.slug = s.section_slug
  CROSS JOIN LATERAL regexp_split_to_table(COALESCE(s.items, ''), E'\\n')
    WITH ORDINALITY AS item(line, ordinality)
  WHERE trim(item.line) <> ''
),
prepared_items AS (
  SELECT
    section_id,
    concat(
      lpad(sort_order::text, 2, '0'),
      '-',
      COALESCE(
        NULLIF(
          trim(BOTH '-' FROM lower(regexp_replace(split_part(line, '|', 1), '[^a-zA-Z0-9]+', '-', 'g'))),
          ''
        ),
        'item'
      )
    ) AS slug,
    trim(split_part(line, '|', 1)) AS title,
    NULLIF(
      trim(
        CASE
          WHEN position('|' IN line) > 0 THEN substring(line FROM position('|' IN line) + 1)
          ELSE ''
        END
      ),
      ''
    ) AS body,
    line AS item_value,
    sort_order
  FROM raw_items
)
INSERT INTO public.section_items (
  section_id,
  slug,
  title,
  body,
  item_value,
  sort_order,
  metadata,
  updated_at
)
SELECT
  section_id,
  slug,
  title,
  body,
  item_value,
  sort_order,
  jsonb_build_object('seed', 'santi-sena-default'),
  now()
FROM prepared_items
ON CONFLICT (section_id, slug) DO UPDATE
SET
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  item_value = EXCLUDED.item_value,
  sort_order = EXCLUDED.sort_order,
  metadata = EXCLUDED.metadata,
  updated_at = now();

INSERT INTO public.programs (
  slug,
  page_id,
  title,
  pillar,
  summary,
  description,
  icon,
  color,
  sort_order,
  status,
  published_at,
  metadata
)
SELECT
  data.slug,
  p.id,
  data.title,
  data.pillar,
  data.summary,
  data.description,
  data.icon,
  data.color,
  data.sort_order,
  'published',
  now(),
  jsonb_build_object('seed', 'santi-sena-default')
FROM (
  VALUES
    ('environment', 'Environment', 'Natural Resource & Environment', 'Community forestry, tree nurseries, WASH, climate adaptation and biogas.', 'Protect forests, restore water systems and support climate resilience with village committees.', 'leaf', '#2f855a', 1),
    ('education', 'Education', 'Access to Education', 'Community pre-schools, mobile libraries, scholarships and Buddhist education.', 'Help rural children keep learning through local teachers, libraries and family support.', 'book-open', '#2563eb', 2),
    ('livelihood', 'Livelihood', 'Livelihood & Economic Improvement', 'Integrated farming, savings groups, cooperatives and rural enterprises.', 'Strengthen household income so families can avoid harmful debt and stay resilient.', 'sprout', '#ca8a04', 3),
    ('child-protection', 'Child Protection', 'Child Protection', 'Anti-trafficking campaigns, child protection networks, peer educators and child rights advocacy.', 'Build village protection systems that keep children safe and in school.', 'shield', '#dc2626', 4)
) AS data(slug, title, pillar, summary, description, icon, color, sort_order)
LEFT JOIN public.pages p
  ON p.slug = 'programs-' || data.slug AND p.locale = 'en'
ON CONFLICT (slug) DO UPDATE
SET
  page_id = EXCLUDED.page_id,
  title = EXCLUDED.title,
  pillar = EXCLUDED.pillar,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status,
  published_at = COALESCE(public.programs.published_at, EXCLUDED.published_at),
  metadata = public.programs.metadata || EXCLUDED.metadata,
  updated_at = now();

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
  jsonb_build_object('image_path', data.image_path, 'seed', 'santi-sena-default')
FROM (
  VALUES
    (1, 'new-community-pre-school-opens-in-svay-rieng', 'education', 'New community pre-school opens in Svay Rieng', 'With support from local partners, Santi Sena inaugurated a new pre-school serving 60 children in a remote village.', '<p>The new pre-school gives rural children a safe place to learn, play and receive early support from trained teachers.</p>', true, 'Santi Sena Communications Team', '3 min read', '2025-03-15', '/src/assets/maps/student.png'),
    (2, 'forest-guardians-celebrate-500-hectares', 'environment', 'Forest Guardians celebrate 500 hectares of protected land', 'Community forestry committees have successfully conserved 500 hectares of forest, boosting biodiversity and livelihoods.', '<p>Community forestry committees in Prey Veng continue to restore land, prevent illegal logging and protect biodiversity.</p>', false, 'Santi Sena Environment Team', '4 min read', '2025-02-28', '/src/assets/maps/wash.png'),
    (3, 'youth-leaders-trained-in-child-protection-advocacy', 'child-protection', 'Youth leaders trained in child protection advocacy', 'Over 40 young volunteers completed training on child rights and protection, ready to act as peer educators in their villages.', '<p>Young volunteers learned child rights, reporting pathways and community awareness methods.</p>', false, 'Santi Sena Child Protection Team', '2 min read', '2025-02-10', '/src/assets/maps/certi.png'),
    (4, 'saving-for-change-groups-reach-10000-members', 'livelihood', 'Saving-for-Change groups reach 10,000 members', 'The village savings program now has more than 10,000 active members, providing financial security to hundreds of families.', '<p>Saving groups help families manage emergencies, invest in small businesses and support children in school.</p>', false, 'Santi Sena Livelihood Unit', '3 min read', '2025-01-20', '/src/assets/maps/pre-school.png'),
    (5, 'new-partnership-to-expand-clean-water-access', 'wash', 'New partnership to expand clean water access', 'Santi Sena partners with WaterAid to bring safe drinking water to 15 additional villages in Kratie province.', '<p>The partnership supports boreholes, purification systems and hygiene training for rural households.</p>', false, 'Santi Sena WASH Team', '5 min read', '2025-01-05', '/src/assets/maps/water.png')
) AS data(legacy_id, slug, category_slug, title, excerpt, body, is_featured, author_name, read_time, published_at, image_path)
JOIN public.news_categories c ON c.slug = data.category_slug
ON CONFLICT (slug) DO UPDATE
SET
  legacy_id = EXCLUDED.legacy_id,
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
  ('UNDP', 'supporter', 'International development partner supporting community resilience and sustainable development.', 1, true, jsonb_build_object('seed', 'santi-sena-default')),
  ('ADB', 'supporter', 'Regional development partner connected to rural infrastructure and livelihood work.', 2, true, jsonb_build_object('seed', 'santi-sena-default')),
  ('Oxfam', 'supporter', 'Long-term civil society partner for community-led development.', 3, true, jsonb_build_object('seed', 'santi-sena-default')),
  ('World Vision', 'supporter', 'Partner for child-focused community development.', 4, true, jsonb_build_object('seed', 'santi-sena-default')),
  ('Save the Children', 'supporter', 'Partner for education and child protection work.', 5, true, jsonb_build_object('seed', 'santi-sena-default')),
  ('Ministry of Environment', 'government', 'Government coordination partner for community forestry and environment programs.', 6, true, jsonb_build_object('seed', 'santi-sena-default')),
  ('Commune Councils', 'local', 'Local governance partners supporting village planning and accountability.', 7, true, jsonb_build_object('seed', 'santi-sena-default'))
ON CONFLICT (name, partner_type) DO UPDATE
SET
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_visible = EXCLUDED.is_visible,
  metadata = public.partners.metadata || EXCLUDED.metadata,
  updated_at = now();

INSERT INTO public.impact_metrics (
  metric_key,
  page_id,
  label,
  value_text,
  unit,
  description,
  icon,
  sort_order,
  is_visible,
  metadata
)
SELECT
  data.metric_key,
  p.id,
  data.label,
  data.value_text,
  data.unit,
  data.description,
  data.icon,
  data.sort_order,
  true,
  jsonb_build_object('seed', 'santi-sena-default')
FROM (
  VALUES
    ('villages-reached', 'Villages Reached', '293', 'villages', 'Villages reached across Svay Rieng, Prey Veng and Kratie.', 'map', 1),
    ('communes-served', 'Communes Served', '43', 'communes', 'Communes served through long-term community work.', 'map-pin', 2),
    ('years-of-service', 'Years of Service', '30+', 'years', 'Founded in 1994 by Cambodian Buddhist monks.', 'calendar', 3),
    ('forests-protected', 'Forests Protected', '570+', 'hectares', 'Community forest areas supported through local committees.', 'leaf', 4),
    ('saving-groups', 'Saving Groups', '114', 'groups', 'Saving-for-Change groups strengthening household resilience.', 'wallet', 5)
) AS data(metric_key, label, value_text, unit, description, icon, sort_order)
LEFT JOIN public.pages p ON p.slug = 'impact-numbers' AND p.locale = 'en'
ON CONFLICT (metric_key) DO UPDATE
SET
  page_id = EXCLUDED.page_id,
  label = EXCLUDED.label,
  value_text = EXCLUDED.value_text,
  unit = EXCLUDED.unit,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_visible = EXCLUDED.is_visible,
  metadata = public.impact_metrics.metadata || EXCLUDED.metadata,
  updated_at = now();

INSERT INTO public.impact_timeline_events (
  event_year,
  title,
  description,
  sort_order,
  is_visible,
  metadata
)
VALUES
  (1994, 'Founded in Svay Rieng', 'Santi Sena was founded by Cambodian Buddhist monks as a peace army for rural communities.', 1, true, jsonb_build_object('seed', 'santi-sena-default')),
  (2002, 'First community forestry site', 'Community forestry work begins to protect local natural resources.', 2, true, jsonb_build_object('seed', 'santi-sena-default')),
  (2008, 'Saving-for-Change begins', 'Village savings groups become a practical path to household resilience.', 3, true, jsonb_build_object('seed', 'santi-sena-default')),
  (2014, '20th anniversary and Kratie office opens', 'Santi Sena expands field presence and celebrates two decades of service.', 4, true, jsonb_build_object('seed', 'santi-sena-default')),
  (2024, 'Thirty-year strategic horizon', 'The organization continues environment, education, livelihood and protection work.', 5, true, jsonb_build_object('seed', 'santi-sena-default'))
ON CONFLICT (event_year, title) DO UPDATE
SET
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_visible = EXCLUDED.is_visible,
  metadata = public.impact_timeline_events.metadata || EXCLUDED.metadata,
  updated_at = now();

INSERT INTO public.offices (
  slug,
  name,
  office_type,
  province,
  address,
  email,
  phone,
  office_hours,
  sort_order,
  is_visible,
  metadata
)
VALUES
  ('head-office', 'Head Office', 'head', 'Svay Rieng', 'Svay Rieng Town, Svay Rieng Province, Kingdom of Cambodia', 'info@santisena.org', '+855 (0) 12 345 678', 'Monday - Friday, 8:00 - 17:00 Cambodia time', 1, true, jsonb_build_object('seed', 'santi-sena-default')),
  ('prey-veng-field-office', 'Prey Veng Field Office', 'field', 'Prey Veng', 'Prey Veng Town, Prey Veng Province, Cambodia', 'preyveng@santisena.org', '+855 (0) 12 111 222', 'Monday - Friday, 8:00 - 17:00 Cambodia time', 2, true, jsonb_build_object('seed', 'santi-sena-default')),
  ('kratie-field-office', 'Kratie Field Office', 'field', 'Kratie', 'Kratie Town, Kratie Province, Cambodia', 'kratie@santisena.org', '+855 (0) 12 333 444', 'Monday - Friday, 8:00 - 17:00 Cambodia time', 3, true, jsonb_build_object('seed', 'santi-sena-default'))
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  office_type = EXCLUDED.office_type,
  province = EXCLUDED.province,
  address = EXCLUDED.address,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  office_hours = EXCLUDED.office_hours,
  sort_order = EXCLUDED.sort_order,
  is_visible = EXCLUDED.is_visible,
  metadata = public.offices.metadata || EXCLUDED.metadata,
  updated_at = now();

INSERT INTO public.donation_methods (
  slug,
  name,
  method_type,
  instructions,
  account_name,
  account_number,
  currency,
  sort_order,
  is_active,
  metadata
)
VALUES
  ('aba-pay', 'ABA Pay', 'bank_qr', 'Scan with ABA Pay or send a transfer to the Santi Sena account.', 'SANTI SENA', '000 000 000', 'KHR / USD', 1, true, jsonb_build_object('bank', 'ABA BANK - CAMBODIA', 'seed', 'santi-sena-default')),
  ('acleda-bank', 'ACLEDA Bank', 'bank_qr', 'Scan with ACLEDA mobile or transfer to the Santi Sena account.', 'SANTI SENA', '0000 0000 000', 'KHR / USD', 2, true, jsonb_build_object('bank', 'ACLEDA - CAMBODIA', 'seed', 'santi-sena-default'))
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  method_type = EXCLUDED.method_type,
  instructions = EXCLUDED.instructions,
  account_name = EXCLUDED.account_name,
  account_number = EXCLUDED.account_number,
  currency = EXCLUDED.currency,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  metadata = public.donation_methods.metadata || EXCLUDED.metadata,
  updated_at = now();

DELETE FROM public.navigation_items
WHERE metadata ->> 'seed' = 'santi-sena-default';

WITH parent_seed AS (
  SELECT *
  FROM (
    VALUES
      ('header', 'Home', '/', 1),
      ('header', 'About', '/about', 2),
      ('header', 'Programs', '/programs', 3),
      ('header', 'Impact', null, 4),
      ('header', 'Get Involved', '/get-involved', 5),
      ('header', 'Contact', '/contact', 6),
      ('footer', 'About', '/about', 1),
      ('footer', 'Programs', '/programs', 2),
      ('footer', 'Impact', '/impact/numbers', 3),
      ('footer', 'Get Involved', '/get-involved', 4),
      ('footer', 'Contact', '/contact', 5)
  ) AS data(menu_key, label, url, sort_order)
),
inserted_parents AS (
  INSERT INTO public.navigation_items (
    menu_key,
    label,
    url,
    sort_order,
    is_visible,
    metadata
  )
  SELECT
    menu_key,
    label,
    url,
    sort_order,
    true,
    jsonb_build_object('seed', 'santi-sena-default')
  FROM parent_seed
  RETURNING id, menu_key, label
),
child_seed AS (
  SELECT *
  FROM (
    VALUES
      ('header', 'About', 'Our Story', 'Founded 1994 - three decades walking with villages.', '/about#story', 1),
      ('header', 'About', 'Vision & Mission', 'Peace, sustainability, and dignified livelihoods.', '/about/vision', 2),
      ('header', 'About', 'Organization', 'Board, staff and field structure.', '/about/organization', 3),
      ('header', 'Programs', 'Education', 'Pre-schools, scholarships and youth learning.', '/programs/education', 1),
      ('header', 'Programs', 'Environment', 'Reforestation, biogas and climate resilience.', '/programs/environment', 2),
      ('header', 'Programs', 'Livelihood', 'Saving-for-Change groups and rural enterprise.', '/programs/livelihood', 3),
      ('header', 'Programs', 'Child Protection', 'Safeguarding and community-led care.', '/programs/child-protection', 4),
      ('header', 'Impact', 'Numbers', '293 villages reached since 1994.', '/impact/numbers', 1),
      ('header', 'Impact', 'Timeline', 'Milestones from 1994 to 2024.', '/impact/timeline', 2),
      ('header', 'Impact', 'Partners', 'UNDP, ADB, Oxfam and more.', '/impact/partners', 3),
      ('header', 'Get Involved', 'Overview', 'Choose the best way to support village-led change.', '/get-involved', 1),
      ('header', 'Get Involved', 'Support Us', 'Support community programs in Svay Rieng and Prey Veng.', '/get-involved/donate', 2),
      ('header', 'Get Involved', 'Partner', 'Co-design multi-year community programs.', '/get-involved/partner', 3),
      ('header', 'Get Involved', 'Volunteer', 'Bring your skills to a field project.', '/get-involved/volunteer', 4)
  ) AS data(menu_key, parent_label, label, description, url, sort_order)
)
INSERT INTO public.navigation_items (
  menu_key,
  parent_id,
  label,
  description,
  url,
  sort_order,
  is_visible,
  metadata
)
SELECT
  c.menu_key,
  p.id,
  c.label,
  c.description,
  c.url,
  c.sort_order,
  true,
  jsonb_build_object('seed', 'santi-sena-default')
FROM child_seed c
JOIN inserted_parents p ON p.menu_key = c.menu_key AND p.label = c.parent_label;

COMMIT;
