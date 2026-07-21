<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'

/* ==============================
   MODE — replaces the old two-route setup.
   'dashboard' = old ChildProtectionDashboardView
   'editor'    = old ChildProtectionEditorView
   ============================== */
const mode = ref<'dashboard' | 'editor'>('dashboard')

/* ==============================
   DASHBOARD DATA (from ChildProtectionDashboardView.vue)
   ============================== */
const statsCards = [
  { label: 'Protection Networks', value: '43', desc: 'Community-based', color: 'violet' },
  { label: 'Children Reached', value: '3,400', desc: 'Receiving support', color: 'blue' },
  { label: 'Peer Educators', value: '120+', desc: 'Youth trained', color: 'emerald' },
  { label: 'Villages Served', value: '293', desc: 'Across Cambodia', color: 'amber' },
]

const quickLinks = [
  { title: 'Edit Child Protection Page', desc: 'Update public content', color: 'violet' },
  { title: 'Manage Records', desc: 'Create & organize data entries', to: '/admin/modules/programs', color: 'blue' },
  { title: 'Media Library', desc: 'Upload images & documents', to: '/admin/media', color: 'emerald' },
  { title: 'Impact Stories', desc: 'Publish success stories', to: '/admin/modules/impact-stories', color: 'amber' },
]

const programHighlights = [
  { title: 'Anti-trafficking Campaigns', desc: 'Preventing child trafficking', count: '43 communes', color: 'violet' },
  { title: 'Child Protection Networks', desc: 'Community safeguarding systems', count: '293 villages', color: 'blue' },
  { title: 'Peer Educator Groups', desc: 'Youth-led advocacy & outreach', count: '120 groups', color: 'emerald' },
  { title: 'Safe Migration Training', desc: 'Workshops on safe migration', count: '45 sessions', color: 'amber' },
  { title: "Child Rights Advocacy", desc: "Promoting children's rights", count: '8 programs', color: 'slate' },
  { title: 'Youth Leadership', desc: 'Empowering young leaders', count: '280 youth', color: 'violet' },
]

const impactNumbers = [
  { value: '293', label: 'Villages with protection networks' },
  { value: '43', label: 'Communes served' },
  { value: '120+', label: 'Peer educators trained' },
  { value: '15+', label: 'Partner organizations' },
]

const infoPages = [
  { title: 'Child Protection Page', slug: 'programs-child-protection', route: '/programs/child-protection' },
  { title: 'Programs Overview', slug: 'programs', route: '/programs' },
  { title: 'Impact Numbers', slug: 'impact-numbers', route: '/impact/numbers' },
]

/* ==============================
   EDITOR DATA & LOGIC (from ChildProtectionEditorView.vue)
   NOTE: this still carries the full site-wide `defaultPages` list
   because the editor component was written as a generic page-content
   editor with the slug hardcoded to 'programs-child-protection'.
   That's a separate duplication problem across your other Editor
   files (Contact, Donate, Education, etc. likely all contain this
   same array) — worth fixing later by making `slug` a route param
   instead of copy-pasting this whole block into every module.
   For now it's kept as-is so behavior doesn't change.
   ============================== */
type EditableSection = {
  id: string
  label: string
  heading: string
  body: string
  items: string
}

type PageDraft = {
  slug: string
  route: string
  previewRoute?: string
  group: string
  title: string
  eyebrow: string
  headline: string
  intro: string
  primaryAction: string
  secondaryAction: string
  sections: EditableSection[]
  updatedAt: string
}

type PageRow = {
  slug: string
  title: string
  body: string
  updated_at: string | null
}

type StoredPageBody = {
  kind: 'santi-sena-page-content'
  version: 1
  route: string
  group: string
  eyebrow: string
  headline: string
  intro: string
  primaryAction: string
  secondaryAction: string
  sections: EditableSection[]
}

const contentKind = 'santi-sena-page-content'

const defaultPages: PageDraft[] = [
  {
    slug: 'news',
    route: '/news',
    group: 'News',
    title: 'News',
    eyebrow: 'News manager',
    headline: 'News',
    intro: '',
    primaryAction: '',
    secondaryAction: '',
    sections: [
      {
        id: 'news-list',
        label: 'News list',
        heading: 'News list',
        body: 'Used by the News manager editor page.',
        items: '',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'news-detail',
    route: '/news/:id',
    previewRoute: '/news/1',
    group: 'News',
    title: 'News Detail',
    eyebrow: 'News detail',
    headline: 'Community stories, updates and field notes.',
    intro:
      'A detail page template for public news stories, including the article header, body content, related updates and donation call to action.',
    primaryAction: 'All news',
    secondaryAction: '',
    sections: [
      {
        id: 'news-detail-hero',
        label: 'Article header',
        heading: 'Story header',
        body: 'Controls the headline area shown on individual public news stories.',
        items:
          'Category | Community update\nDate | Published date\nAuthor | Santi Sena team\nReading time | 5 min read',
      },
      {
        id: 'news-detail-body',
        label: 'Article body',
        heading: 'Story content',
        body: 'Use this section for the article introduction, main body and closing note.',
        items:
          'Introduction | Open with the community need or program moment.\nMain story | Describe the people, place, activities and outcomes.\nClosing note | Invite readers to continue learning or supporting the work.',
      },
      {
        id: 'news-detail-related',
        label: 'Related stories',
        heading: 'More from Santi Sena',
        body: 'Related news cards shown near the end of a story.',
        items: 'Environment updates\nEducation stories\nLivelihood field notes\nChild protection news',
      },
      {
        id: 'news-detail-cta',
        label: 'Call to action',
        heading: 'Stand with village-led change.',
        body: 'A short donation or support invitation that appears after a news article.',
        items: 'Donate\nGet involved\nContact us',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'home',
    route: '/',
    group: 'Home',
    title: 'Home',
    eyebrow: 'Buddhist NGO . Cambodia . Since 1994',
    headline: 'Walking with villages toward peace, sustainability and dignity.',
    intro:
      'Santi Sena, the Peace Army, works alongside rural Cambodian communities in Svay Rieng, Prey Veng and Kratie, protecting forests, teaching children, growing livelihoods and safeguarding families.',
    primaryAction: 'Support Us',
    secondaryAction: 'Stand with us',
    sections: [
      {
        id: 'home-stats',
        label: 'Stats',
        heading: '293 villages, 43 communes, 30+ years of service, 10+ international partners',
        body: 'Use this block for the public homepage impact counters.',
        items:
          '293 | Villages Reached\n43 | Communes Served\n30+ | Years of Service\n10+ | International Partners',
      },
      {
        id: 'home-mission',
        label: 'Mission',
        heading: 'Peace is planted, not declared.',
        body: 'Santi Sena, the Peace Army, was founded by Cambodian Buddhist monks in 1994 to alleviate poverty and rebuild moral, environmental and economic life after decades of conflict.',
        items: '',
      },
      {
        id: 'home-pillars',
        label: 'Strategic goals',
        heading: 'Four Pillars',
        body: 'The four public program pillars shown on the homepage.',
        items:
          'Natural Resource & Environment | Community forestry, tree nurseries, WASH, climate adaptation and biogas.\nAccess to Education | Community pre-schools, mobile libraries, scholarships and Buddhist education.\nLivelihood & Economic Improvement | Integrated farming, savings groups, cooperatives and rural enterprises.\nChild Protection | Anti-trafficking campaigns, child protection networks, peer educators and child rights advocacy.',
      },
      {
        id: 'home-cta',
        label: 'Call to action',
        heading: 'Join the Peace Army.',
        body: 'Donate, partner, volunteer. Every act seeds another village with hope.',
        items: 'Support Us\nPartner with us',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'about',
    route: '/about',
    group: 'About',
    title: 'About Santi Sena',
    eyebrow: 'About Santi Sena',
    headline: 'A peace army born from the Dharma, raised by villages.',
    intro:
      'Founded in 1994 by Cambodian Buddhist monks, Santi Sena emerged from the ashes of conflict with a quiet conviction: lasting peace is grown in soil, schools and dignified work.',
    primaryAction: '',
    secondaryAction: '',
    sections: [
      {
        id: 'about-vmg',
        label: 'Vision, mission, goal',
        heading: 'Vision, Mission, Goal',
        body: 'Vision: A Cambodia where peace, justice and harmony flourish. Mission: Alleviate poverty through community-led development rooted in Buddhist ethics. Goal: Better work and living situations for vulnerable rural households.',
        items:
          'Vision | A Cambodia where peace, justice and harmony flourish across every village and generation.\nMission | To alleviate poverty through community-led development rooted in Buddhist ethics.\nGoal | Better work and living situations for the most vulnerable rural households of southeastern Cambodia.',
      },
      {
        id: 'about-values',
        label: 'Core values',
        heading: 'Five vows that shape every program',
        body: 'The values listed on the About page.',
        items:
          'Honesty | We have honesty with donors, target groups, operational partners and working groups.\nNon-discrimination | We do not discriminate by disability, religion, color, race, target group or political faction.\nCollective Benefits | We do not utilize organization property for private benefit.\nFlexibility | We respect and accept good comments from target groups and development partners.\nEmpowerment | We do not deliver development; we hand it back to the community.',
      },
      {
        id: 'about-team',
        label: 'Team',
        heading: 'A team of monks, managers and master practitioners.',
        body: 'From the Board of Directors to field staff in Kratie, every level is accountable to the villagers served and donors who trust Santi Sena.',
        items:
          'Board of Directors | Policy and oversight, including senior Buddhist leadership.\nExecutive Director | Daily operations and strategic execution.\nManagement Committee | Coordinates programs across provinces.\nTechnical Coordination | Provides inputs across thematic areas.\nProfessional Staff | Full-time and project-based experts in agriculture, education and rural development.',
      },
      {
        id: 'about-reach',
        label: 'Geographical reach',
        heading: 'Three provinces. Forty-three communes. Two hundred and ninety-three villages.',
        body: 'Santi Sena works across Svay Rieng, Prey Veng and Kratie.',
        items: 'Svay Rieng\nPrey Veng\nKratie',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'about-vision',
    route: '/about/vision',
    group: 'About',
    title: 'Vision & Mission',
    eyebrow: 'Vision & Mission',
    headline: 'Shaping a Future of Equity & Opportunity',
    intro:
      'A focused page for Santi Sena vision, mission, values and the practical commitments that guide long-term village work.',
    primaryAction: 'Join Us',
    secondaryAction: '',
    sections: [
      {
        id: 'vision-strive',
        label: 'What we strive for',
        heading: 'What We Strive For',
        body: 'Inclusive growth, community empowerment and sustainable resilience.',
        items: 'Inclusive Growth\nCommunity Empowerment\nSustainable Resilience',
      },
      {
        id: 'vision-guides',
        label: 'Guiding values',
        heading: 'What Guides Us',
        body: 'Integrity, respect, collaboration and innovation guide daily practice.',
        items: 'Integrity\nRespect\nCollaboration\nInnovation',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'about-organization',
    route: '/about/organization',
    group: 'About',
    title: 'Organization',
    eyebrow: 'Organization',
    headline: 'A team of monks, managers and master practitioners.',
    intro:
      'Santi Sena combines Buddhist leadership, professional management and field teams close to the communities they serve.',
    primaryAction: '',
    secondaryAction: '',
    sections: [
      {
        id: 'organization-structure',
        label: 'Structure',
        heading: 'How we are organized',
        body: 'Board, leadership, management committee, technical coordination and provincial staff work as one accountable team.',
        items:
          'Board of Directors\nExecutive Director\nManagement Committee\nTechnical Coordination\nProfessional Staff',
      },
      {
        id: 'organization-priorities',
        label: 'Priorities',
        heading: 'Operational priorities',
        body: 'The priorities that keep programs stable and transparent.',
        items:
          'Strengthened governance and accountability\nStaff and volunteer development\nIncome and funding diversification\nResearch and knowledge management\nPublic advocacy',
      },
      {
        id: 'organization-accountability',
        label: 'Accountability',
        heading: 'Accountability',
        body: 'Santi Sena is accountable to villagers, donors, government partners and the Buddhist values behind its founding.',
        items: '',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'programs',
    route: '/programs',
    group: 'Programs',
    title: 'Programs',
    eyebrow: 'Our Programs',
    headline: 'Four roots. One tree of peace.',
    intro:
      "Santi Sena's work follows four interwoven strategic goals: environment, education, livelihoods and child protection, each delivered with and by the communities themselves.",
    primaryAction: 'Explore programs',
    secondaryAction: '',
    sections: [
      {
        id: 'programs-goals',
        label: 'Program goals',
        heading: 'Four strategic goals',
        body: 'Edit the goal cards and summaries shown across the Programs area.',
        items:
          'Environment | Community forestry, biogas digesters, rainwater harvesting and WASH.\nEducation | Pre-schools, community libraries and youth scholarships.\nLivelihood | Saving-for-Change groups, women-led cooperatives and rural enterprises.\nChild Protection | Child protection networks, anti-trafficking outreach and safe-migration training.',
      },
      {
        id: 'programs-priorities',
        label: 'Operational priorities',
        heading: 'How we keep the tree alive',
        body: 'Internal priorities that support every program.',
        items:
          'Strengthened governance and accountability\nStaff and volunteer development\nIncome and funding diversification\nResearch and knowledge management\nPublic advocacy',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'programs-environment',
    route: '/programs/environment',
    group: 'Programs',
    title: 'Environment',
    eyebrow: 'Environment',
    headline: 'Protecting Our Planet For Future Generations',
    intro:
      'Environmental stewardship in action through conservation, sustainability and community engagement.',
    primaryAction: 'Join the Environmental Movement',
    secondaryAction: '',
    sections: [
      {
        id: 'environment-stewardship',
        label: 'Stewardship',
        heading: 'Environmental Stewardship in Action',
        body: 'Community-led action connects conservation, sustainability and local leadership.',
        items: 'Conservation\nSustainability\nCommunity Engagement',
      },
      {
        id: 'environment-work',
        label: 'What we do',
        heading: "What We're Doing",
        body: 'Main environmental activities shown on the page.',
        items:
          'Reforestation Projects\nEnvironmental Education\nRenewable Energy Access\nWater Conservation\nSustainable Agriculture\nClimate Research & Advocacy',
      },
      {
        id: 'environment-method',
        label: 'How we work',
        heading: 'How We Work',
        body: 'Assessment, planning, implementation, monitoring and learning.',
        items: 'Assessment\nPlanning\nImplementation\nMonitoring & Learning',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'programs-education',
    route: '/programs/education',
    group: 'Programs',
    title: 'Education',
    eyebrow: 'Education',
    headline: 'A teacher in every village. A book in every hand.',
    intro:
      'Community pre-schools, mobile libraries, scholarships and Buddhist education help rural children keep learning.',
    primaryAction: '',
    secondaryAction: '',
    sections: [
      {
        id: 'education-work',
        label: 'What we do',
        heading: 'What we do',
        body: 'The main education interventions that appear on the public page.',
        items:
          'Community pre-schools\nMobile libraries\nScholarships for poor children\nBuddhist education preservation\nTeacher and parent support',
      },
      {
        id: 'education-approach',
        label: 'Approach',
        heading: 'Our approach',
        body: 'Education work is local, practical and connected to family support.',
        items: '',
      },
      {
        id: 'education-why',
        label: 'Why it matters',
        heading: 'Why it matters',
        body: 'Remote hamlets need early learning, reading access and support that helps children stay in school.',
        items: '',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'programs-livelihood',
    route: '/programs/livelihood',
    group: 'Programs',
    title: 'Livelihood',
    eyebrow: 'Livelihood',
    headline: 'Dignified work rooted in the village.',
    intro:
      'Saving groups, home gardens, cooperatives and rural enterprises help families build economic resilience.',
    primaryAction: '',
    secondaryAction: '',
    sections: [
      {
        id: 'livelihood-stats',
        label: 'Stats',
        heading: 'Livelihood numbers',
        body: 'Use this block for the statistics shown near the top of the livelihood page.',
        items:
          '114 savings groups\n4,555 families\nAgricultural cooperatives\nHome gardens and biogas',
      },
      {
        id: 'livelihood-work',
        label: 'What we do',
        heading: 'What we do',
        body: 'Training, savings, cooperatives, agriculture and enterprise support.',
        items:
          'Saving-for-Change groups\nIntegrated farming\nAgricultural cooperatives\nRural enterprises\nMelaleuca oil',
      },
      {
        id: 'livelihood-why',
        label: 'Why it matters',
        heading: 'Why it matters',
        body: 'Predictable income helps families avoid harmful debt and keep children in school.',
        items: '',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'programs-child-protection',
    route: '/programs/child-protection',
    group: 'Programs',
    title: 'Child Protection',
    eyebrow: 'Child Protection',
    headline: 'Every child safe. Every child in school.',
    intro:
      'Village child protection networks, peer educators and safe migration training protect children from trafficking, exploitation and abuse.',
    primaryAction: '',
    secondaryAction: '',
    sections: [
      {
        id: 'child-protection-stats',
        label: 'Stats',
        heading: 'Child protection numbers',
        body: 'Use this block for the public page statistics.',
        items:
          'Child Protection Networks\nPeer educator groups\nSafe migration training\nChild rights advocacy',
      },
      {
        id: 'child-protection-work',
        label: 'What we do',
        heading: 'What we do',
        body: 'Community-led protection systems for vulnerable children and youth.',
        items:
          'Anti-trafficking campaigns\nChild Protection Networks\nPeer educator groups\nSafe migration workshops\nChild rights advocacy',
      },
      {
        id: 'child-protection-approach',
        label: 'Approach',
        heading: 'Our approach',
        body: 'Safeguarding is strongest when families, elders, monks, schools and authorities work together.',
        items: '',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'services',
    route: '/services',
    group: 'Programs',
    title: 'Services',
    eyebrow: 'Services',
    headline: 'Services',
    intro: 'Education grants, water and sanitation, and sustainable farming support.',
    primaryAction: '',
    secondaryAction: '',
    sections: [
      {
        id: 'services-list',
        label: 'Services list',
        heading: 'Services',
        body: 'Short public services list.',
        items: 'Education Grants\nWater & Sanitation\nSustainable Farming',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'impact',
    route: '/impact',
    group: 'Impact',
    title: 'Impact',
    eyebrow: 'Our Impact',
    headline: 'Three decades. One quiet revolution.',
    intro:
      'Every number is a household with a safer roof, a child with a teacher, a forest still standing.',
    primaryAction: '',
    secondaryAction: '',
    sections: [
      {
        id: 'impact-stats',
        label: 'Stats',
        heading: 'Impact numbers',
        body: 'Main impact counters on the Impact page.',
        items:
          '293 | Villages served\n570+ | Hectares of forest\n120+ | Full-time staff\n15+ | International partners\n32 | Years of service\n4 | Strategic pillars',
      },
      {
        id: 'impact-timeline',
        label: 'Timeline',
        heading: 'A journey rooted in patience.',
        body: 'Milestones shown on the Impact page.',
        items:
          '1994 | Founding\n2002 | First community forestry\n2008 | Saving-for-Change\n2014 | 20-year horizon\n2024 | Today',
      },
      {
        id: 'impact-partners',
        label: 'Partners',
        heading: 'Trusted by partners across the world.',
        body: 'Santi Sena has successfully managed grants from more than ten international institutions.',
        items: 'UNDP\nADB\nOxfam\nCIDA\nWorld Vision\nSave the Children\nActionAid\nCare',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'impact-numbers',
    route: '/impact/numbers',
    group: 'Impact',
    title: 'Impact Numbers',
    eyebrow: 'Impact Numbers',
    headline: 'Thirty years, measured village by village.',
    intro:
      'A deeper numbers page for environment, education, livelihoods and child protection results.',
    primaryAction: 'Take the next step',
    secondaryAction: '',
    sections: [
      {
        id: 'numbers-overview',
        label: 'Overview',
        heading: 'Overview numbers',
        body: 'Top-level statistics and labels for the public numbers page.',
        items:
          'Villages reached\nCommunes served\nHouseholds supported\nChildren reached\nForests protected',
      },
      {
        id: 'numbers-method',
        label: 'How we count',
        heading: 'How we count',
        body: 'Plain-language notes explaining impact measurement.',
        items: 'Field reports\nPartner verification\nCommunity records\nAnnual review',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'impact-timeline',
    route: '/impact/timeline',
    group: 'Impact',
    title: 'Impact Timeline',
    eyebrow: 'Timeline',
    headline: 'Thirty years of walking with villages.',
    intro: 'Progress built through patient partnership from founding in Svay Rieng to today.',
    primaryAction: 'Take the next step',
    secondaryAction: '',
    sections: [
      {
        id: 'timeline-events',
        label: 'Events',
        heading: 'Progress built through patient partnership.',
        body: 'Timeline event titles and dates.',
        items:
          '1994 | Founded in Svay Rieng\n2002 | First community forestry site\n2008 | Saving-for-Change begins\n2014 | 20th anniversary and Kratie office opens\n2020 | COVID-19 response\n2024 | 30-year strategic plan',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'impact-partners',
    route: '/impact/partners',
    group: 'Impact',
    title: 'Impact Partners',
    eyebrow: 'Partners',
    headline: 'Trusted by ten+ international donors and every government line ministry we touch.',
    intro:
      'Partners stay because Santi Sena combines long presence, audited financial systems, deep community trust and proven ability to scale.',
    primaryAction: 'Ready to take the next step?',
    secondaryAction: '',
    sections: [
      {
        id: 'partners-supporters',
        label: 'Supporters',
        heading: 'Partners & Supporters',
        body: 'International donors and supporters shown on the partners page.',
        items: 'UNDP\nADB\nOxfam\nWorld Vision\nSave the Children\nActionAid\nCare',
      },
      {
        id: 'partners-government',
        label: 'Government',
        heading: 'Government Coordination',
        body: 'Government partners and line ministries.',
        items:
          'Ministry of Interior\nMinistry of Environment\nMinistry of Women and Affairs\nMinistry of Education, Youth and Sport\nProvincial Departments',
      },
      {
        id: 'partners-local',
        label: 'Local partners',
        heading: 'Local Partners',
        body: 'Local institutions that make field work possible.',
        items:
          'Pagoda and Monastic Networks\nCommune Councils and Child Protection\nNGO Forum and Working Groups\nAcademic Partnerships\nSocial Enterprises',
      },
      {
        id: 'partners-why',
        label: 'Why partners stay',
        heading: 'Why Partners Stay',
        body: 'Reasons shown as cards on the public page.',
        items:
          '30 years of unbroken presence\nAudited financial systems\nDeep community trust\nProven ability to scale',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'get-involved',
    route: '/get-involved',
    group: 'Get Involved',
    title: 'Get Involved',
    eyebrow: 'Get involved',
    headline: 'Stand beside a village. Plant a generation.',
    intro:
      'Every gift, partnership and pair of hands becomes another root in the tree we have been tending for thirty years.',
    primaryAction: 'Start monthly giving',
    secondaryAction: '',
    sections: [
      {
        id: 'get-involved-ways',
        label: 'Ways',
        heading: 'Ways to get involved',
        body: 'The three action cards on the Get Involved page.',
        items:
          'Donate | Support community forests, livelihoods, education, WASH, Buddhist preservation and child protection work.\nPartner | Cooperate through community-rooted programs, local authorities, provincial departments and field teams.\nVolunteer | Bring your skills to a community-led project in the field.',
      },
      {
        id: 'get-involved-tiers',
        label: 'Donation tiers',
        heading: 'What a donation actually does.',
        body: 'Donation amounts and example impacts.',
        items:
          '$25 | One month of pre-school for a rural child.\n$80 | Twenty tree saplings planted in a community forest.\n$250 | A household biogas unit replacing firewood.\n$1,000 | A Saving-for-Change group seeded for one year.',
      },
      {
        id: 'get-involved-monthly',
        label: 'Monthly giving',
        heading: 'Become a monthly companion.',
        body: 'Recurring donors give Santi Sena steady ground to plan multi-year programs with communities.',
        items: '',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'get-involved-donate',
    route: '/get-involved/donate',
    group: 'Get Involved',
    title: 'Donate',
    eyebrow: 'Donate',
    headline: 'Support peace, livelihoods and environmental protection.',
    intro:
      'Donations strengthen community forests, education, livelihoods, WASH, Buddhist preservation and child protection.',
    primaryAction: 'Ready to support the work?',
    secondaryAction: '',
    sections: [
      {
        id: 'donate-support',
        label: 'Support cards',
        heading: 'What your support strengthens',
        body: 'Impact cards shown on the donate page.',
        items:
          '293 villages | Development programs reached Svay Rieng and Prey Veng communities.\n571.601 ha | Community forests supported across 18 villages and 2,372 households.\n27,810 seedlings | Tree nurseries produced seedlings for schools, communities and farms.\n114 groups | Saving for Change groups supported 4,555 families.\n363 children | Seventeen community pre-schools helped young children.\n3,400 children | Mobile library sessions promoted reading.',
      },
      {
        id: 'donate-areas',
        label: 'Program areas',
        heading: 'Program areas',
        body: 'Program areas donors can support.',
        items: 'Environment\nEducation\nLivelihoods\nWASH\nBuddhist preservation\nChild protection',
      },
      {
        id: 'donate-contact',
        label: 'Contact',
        heading: 'How to contact Santi Sena',
        body: 'Donation contact details and stewardship copy.',
        items: 'info@santisena.org\n+855 (0) 12 345 678\nSvay Rieng Province, Cambodia',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'get-involved-volunteer',
    route: '/get-involved/volunteer',
    group: 'Get Involved',
    title: 'Volunteer',
    eyebrow: 'Volunteer',
    headline: 'Bring your skills to community-led work in Cambodia.',
    intro:
      'Volunteers support practical field work across forestry, livelihoods, WASH, education, child protection and Buddhist values.',
    primaryAction: 'Tell Santi Sena what you can bring',
    secondaryAction: '',
    sections: [
      {
        id: 'volunteer-pathways',
        label: 'Pathways',
        heading: 'Choose a field area connected to the report.',
        body: 'Volunteer pathways on the public page.',
        items:
          'Community forestry and climate action\nHome gardens and farmer groups\nSafe water and hygiene in schools\nPre-schools and mobile libraries\nChild rights and safe migration\nLearning through pagodas and values',
      },
      {
        id: 'volunteer-skills',
        label: 'Skills',
        heading: 'Volunteer work is practical, local and team-based.',
        body: 'Skill cards shown on the volunteer page.',
        items:
          'Facilitation\nEducation support\nAgriculture and environment\nMonitoring and communication',
      },
      {
        id: 'volunteer-steps',
        label: 'Field steps',
        heading: 'How field volunteering works',
        body: 'Steps for volunteers.',
        items: 'Prepare with staff\nListen locally\nWork practically\nReflect and improve',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'get-involved-partner',
    route: '/get-involved/partner',
    group: 'Get Involved',
    title: 'Partner',
    eyebrow: 'Partner',
    headline: 'Partner with Santi Sena',
    intro:
      'Long-term cooperation is organized around village priorities and practical community systems.',
    primaryAction: 'Create a practical partnership',
    secondaryAction: '',
    sections: [
      {
        id: 'partner-practice',
        label: 'Practice',
        heading: 'How collaboration becomes action',
        body: 'Partnership steps from community needs to learning.',
        items:
          'Start with community needs\nBring the right institutions together\nStrengthen people, not only projects\nUse learning to guide the next cycle',
      },
      {
        id: 'partner-areas',
        label: 'Engagement areas',
        heading: 'Program systems named in the report',
        body: 'Main areas for partners.',
        items:
          'Environment and forestry\nLivelihoods and agriculture\nWASH\nEducation\nBuddhist preservation\nChild protection',
      },
      {
        id: 'partner-commitments',
        label: 'Commitments',
        heading: 'What Santi Sena commits to partners',
        body: 'Commitments and operating principles for funders and collaborators.',
        items:
          'Community accountability\nTransparent reporting\nPractical coordination\nLearning and adaptation',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'contact',
    route: '/contact',
    group: 'Contact',
    title: 'Contact',
    eyebrow: 'Contact',
    headline: 'Write to us. We read every letter.',
    intro:
      'Whether you wish to partner, donate, visit or simply learn more, our team in Cambodia is ready to hear from you.',
    primaryAction: 'Send message',
    secondaryAction: '',
    sections: [
      {
        id: 'contact-offices',
        label: 'Offices',
        heading: 'Office details',
        body: 'Contact details shown beside the public contact form.',
        items:
          'Head Office | Svay Rieng Town, Svay Rieng Province, Kingdom of Cambodia\nEmail | info@santisena.org, partnerships@santisena.org\nPhone | +855 (0) 12 345 678\nField offices | Prey Veng Province, Kratie Province',
      },
      {
        id: 'contact-form',
        label: 'Form',
        heading: 'Send a message',
        body: 'Name, email, subject and message fields are shown on the public contact form.',
        items: 'Name\nEmail\nSubject\nMessage\nMessage sent',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'contact-head-office',
    route: '/contact/headoffice',
    group: 'Contact',
    title: 'Head Office',
    eyebrow: 'Contact - Head Office',
    headline: 'Visit us in Svay Rieng.',
    intro:
      'Our headquarters sits in Svay Rieng town, walking distance from the provincial pagoda where Santi Sena was founded thirty years ago.',
    primaryAction: 'Send a message',
    secondaryAction: '',
    sections: [
      {
        id: 'head-office-contact',
        label: 'Contact blocks',
        heading: 'Head office contact details',
        body: 'Address, email, phone and office hours.',
        items:
          'Address | Santi Sena Organization, Svay Rieng Town, Svay Rieng Province, Kingdom of Cambodia\nEmail | info@santisena.org, partnerships@santisena.org, media@santisena.org\nPhone | +855 (0) 12 345 678, +855 (0) 44 987 654\nOffice hours | Monday - Friday, 8:00 - 17:00 Cambodia time, Saturday by appointment',
      },
      {
        id: 'head-office-travel',
        label: 'Travel',
        heading: 'Getting here',
        body: 'Travel notes for visitors.',
        items:
          'From Phnom Penh: about 2.5 hours by road via National Road 1\nFrom Ho Chi Minh City: about 4 hours via the Bavet-Moc Bai border\nNearest airport: Phnom Penh International\nTuk-tuks available from Svay Rieng town centre',
      },
      {
        id: 'head-office-guidance',
        label: 'Visitor guidance',
        heading: 'Visitor guidance',
        body: 'Please email at least two weeks ahead so staff can arrange availability and field visits. Modest dress is appreciated.',
        items: '',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'contact-field-offices',
    route: '/contact/fieldoffice',
    group: 'Contact',
    title: 'Field Offices',
    eyebrow: 'Contact - Field Offices',
    headline: 'Where the work actually happens.',
    intro:
      'Our two provincial field offices are the daily home of the staff who walk into villages and the easiest way to reach a program directly.',
    primaryAction: 'Visit head office',
    secondaryAction: '',
    sections: [
      {
        id: 'field-offices-list',
        label: 'Field offices',
        heading: 'Field office contact details',
        body: 'Provincial field office details.',
        items:
          'Prey Veng Field Office | Prey Veng Town, Prey Veng Province, Cambodia | preyveng@santisena.org | +855 (0) 12 111 222\nKratie Field Office | Kratie Town, Kratie Province, Cambodia | kratie@santisena.org | +855 (0) 12 333 444',
      },
      {
        id: 'field-offices-visits',
        label: 'Visits',
        heading: 'Field visits',
        body: 'Donors, partners and researchers are welcome to visit a project site by arranging through head office at least two weeks in advance.',
        items: '',
      },
      {
        id: 'field-offices-hours',
        label: 'Hours',
        heading: 'Office hours',
        body: 'Field office availability.',
        items:
          'Monday - Friday: 8:00 - 17:00 Cambodia time\nField staff are often in villages; email response may take 24-48 hours\nProvincial coordinators available by phone during office hours',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'qr-donate',
    route: '/qr-donate',
    group: 'Get Involved',
    title: 'QR Donate',
    eyebrow: 'Donate Locally',
    headline: 'Donate Locally in Cambodia',
    intro:
      'Scan with your banking app. No internet transfer fees. Your contribution directly supports the education of disabled children.',
    primaryAction: 'Pay with QR',
    secondaryAction: 'Pay with credit card',
    sections: [
      {
        id: 'qr-methods',
        label: 'Payment methods',
        heading: 'Payment methods',
        body: 'QR donation methods shown on the local donate page.',
        items:
          'ABA Pay | ABA BANK - CAMBODIA | SANTI SENA | 000 000 000 | KHR / USD\nACLEDA Bank | ACLEDA - CAMBODIA | SANTI SENA | 0000 0000 000 | KHR / USD',
      },
      {
        id: 'qr-notice',
        label: 'Receipt notice',
        heading: 'After completing your donation',
        body: 'Please send your payment screenshot to SANTISENAMONK@GMAIL.COM so Santi Sena can send an official receipt and gratitude.',
        items: '',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'site-footer',
    route: 'global',
    group: 'Global',
    title: 'Header & Footer',
    eyebrow: 'Global content',
    headline: 'Santi Sena',
    intro:
      'A Buddhist NGO founded in 1994, walking with Cambodian communities toward peace, sustainability and dignified livelihoods.',
    primaryAction: 'Support Us',
    secondaryAction: '',
    sections: [
      {
        id: 'global-navigation',
        label: 'Navigation',
        heading: 'Public navigation',
        body: 'Main public navigation groups and labels.',
        items: 'Home\nAbout\nPrograms\nImpact\nGet Involved\nContact\nSupport Us',
      },
      {
        id: 'global-footer',
        label: 'Footer',
        heading: 'Footer content',
        body: 'Svay Rieng . Prey Veng . Kratie',
        items:
          'Explore | About, Programs, Impact, Get Involved, Contact\nContact | Svay Rieng Province, Cambodia | info@santisena.org | +855 (0) 12 345 678\nBottom | Santi Sena Organization. All rights reserved. | Registered NGO. Partners: UNDP, ADB, Oxfam',
      },
    ],
    updatedAt: '',
  },
]

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const drafts = ref<PageDraft[]>(defaultPages.map(clonePage))
const loading = ref(false)
const savingSlug = ref<string | null>(null)
const notice = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const savedSnapshot = ref<Record<string, string>>({})
const previewVisible = ref(true)
const activeSectionIndex = ref<number | null>(null)

const requestedSlug = computed(() => 'programs-child-protection')

const activePage = computed<PageDraft>(() => {
  return (
    drafts.value.find((page) => page.slug === requestedSlug.value) ??
    drafts.value[0] ??
    clonePage(defaultPages[0] as PageDraft)
  )
})

const activePageDirty = computed(() => isDirty(activePage.value.slug))
const activePreviewRoute = computed(() => getPreviewRoute(activePage.value))

const previewItems = computed(() => {
  return activePage.value.sections.map((section) => ({
    ...section,
    parsedItems: section.items
      ? section.items.split('\n').filter((line) => line.trim())
      : [],
  }))
})

const sectionCountLabel = computed(() => {
  const count = activePage.value.sections.length
  return `${count} section${count !== 1 ? 's' : ''}`
})

onMounted(() => {
  void loadPages()
})

watch(
  requestedSlug,
  (slug) => {
    if (!drafts.value.some((page) => page.slug === slug) && slug !== requestedSlug.value) {
      void router.replace('/admin/editor/home')
    }
  },
  { immediate: true },
)

function clonePage(page: PageDraft): PageDraft {
  return {
    ...page,
    sections: page.sections.map((section) => ({ ...section })),
  }
}

function getPreviewRoute(page: PageDraft) {
  if (page.previewRoute) return page.previewRoute
  return page.route.replace(/:id\b/g, '1')
}

function cloneSection(section?: Partial<EditableSection>): EditableSection {
  return {
    id: section?.id || createSectionId(),
    label: section?.label || 'New section',
    heading: section?.heading || '',
    body: section?.body || '',
    items: section?.items || '',
  }
}

function createSectionId() {
  return `section-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function pageBody(page: PageDraft): StoredPageBody {
  return {
    kind: contentKind,
    version: 1,
    route: page.route,
    group: page.group,
    eyebrow: page.eyebrow,
    headline: page.headline,
    intro: page.intro,
    primaryAction: page.primaryAction,
    secondaryAction: page.secondaryAction,
    sections: page.sections.map((section) => ({ ...section })),
  }
}

function snapshot(page: PageDraft) {
  return JSON.stringify({
    title: page.title,
    body: pageBody(page),
  })
}

function serializeBody(page: PageDraft) {
  return JSON.stringify(pageBody(page), null, 2)
}

function isDirty(slug: string) {
  const page = drafts.value.find((item) => item.slug === slug)
  if (!page) return false
  return savedSnapshot.value[slug] !== snapshot(page)
}

function parseStoredBody(body: string): Partial<StoredPageBody> | null {
  try {
    const parsed = JSON.parse(body) as unknown
    if (!isRecord(parsed) || parsed.kind !== contentKind) return null

    return {
      route: getString(parsed, 'route'),
      group: getString(parsed, 'group'),
      eyebrow: getString(parsed, 'eyebrow'),
      headline: getString(parsed, 'headline'),
      intro: getString(parsed, 'intro'),
      primaryAction: getString(parsed, 'primaryAction'),
      secondaryAction: getString(parsed, 'secondaryAction'),
      sections: getSections(parsed.sections),
    }
  } catch {
    return null
  }
}

function getSections(value: unknown): EditableSection[] {
  if (!Array.isArray(value)) return []

  return value.filter(isRecord).map((section) =>
    cloneSection({
      id: getString(section, 'id') || createSectionId(),
      label: getString(section, 'label') || 'Section',
      heading: getString(section, 'heading'),
      body: getString(section, 'body'),
      items: getString(section, 'items'),
    }),
  )
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key]
  return typeof value === 'string' ? value : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function mergeRow(defaultPage: PageDraft, row: PageRow): PageDraft {
  const parsed = parseStoredBody(row.body)

  if (!parsed) {
    return {
      ...clonePage(defaultPage),
      title: row.title || defaultPage.title,
      intro: row.body || defaultPage.intro,
      updatedAt: row.updated_at ?? '',
    }
  }

  return {
    ...clonePage(defaultPage),
    title: row.title || defaultPage.title,
    route: parsed.route || defaultPage.route,
    group: parsed.group || defaultPage.group,
    eyebrow: parsed.eyebrow ?? defaultPage.eyebrow,
    headline: parsed.headline ?? defaultPage.headline,
    intro: parsed.intro ?? defaultPage.intro,
    primaryAction: parsed.primaryAction ?? defaultPage.primaryAction,
    secondaryAction: parsed.secondaryAction ?? defaultPage.secondaryAction,
    sections: parsed.sections?.length
      ? parsed.sections.map(cloneSection)
      : clonePage(defaultPage).sections,
    updatedAt: row.updated_at ?? '',
  }
}

async function loadPages() {
  loading.value = true
  notice.value = null

  try {
    const slugs = ['programs-child-protection']
    const { data, error } = await supabase
      .from('pages')
      .select('slug, title, body, updated_at')
      .in('slug', slugs)

    if (error) throw error

    const rows = new Map<string, PageRow>()
    for (const row of (data ?? []) as PageRow[]) {
      rows.set(row.slug, row)
    }

    drafts.value = defaultPages.map((page) => {
      const row = rows.get(page.slug)
      return row ? mergeRow(page, row) : clonePage(page)
    })

    savedSnapshot.value = Object.fromEntries(
      drafts.value.map((page) => [page.slug, snapshot(page)]),
    )
  } catch (error) {
    notice.value = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Could not load website content.',
    }
  } finally {
    loading.value = false
  }
}

async function persistPage(page: PageDraft): Promise<PageDraft> {
  const savedAt = new Date().toISOString()
  const payload = {
    slug: page.slug,
    title: page.title.trim() || page.headline.trim() || page.slug,
    body: serializeBody(page),
    updated_at: savedAt,
  }

  const { data, error } = await supabase
    .from('pages')
    .upsert(payload, { onConflict: 'slug' })
    .select('slug, title, body, updated_at')
    .single()

  if (error) throw error

  return data ? mergeRow(page, data as PageRow) : { ...clonePage(page), updatedAt: savedAt }
}

function replaceDraft(page: PageDraft) {
  const index = drafts.value.findIndex((item) => item.slug === page.slug)
  if (index === -1) return
  drafts.value[index] = page
  savedSnapshot.value[page.slug] = snapshot(page)
}

async function saveCurrentPage() {
  const page = activePage.value
  savingSlug.value = page.slug
  notice.value = null

  try {
    replaceDraft(await persistPage(page))
    notice.value = { type: 'success', message: `${page.title} saved.` }
    ui.addToast(`${page.title} saved.`, 'success')
  } catch (error) {
    notice.value = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Could not save this page.',
    }
    ui.addToast(notice.value.message, 'error')
  } finally {
    savingSlug.value = null
  }
}

function addSection() {
  activePage.value.sections.push(
    cloneSection({
      label: `Section ${activePage.value.sections.length + 1}`,
    }),
  )
  activeSectionIndex.value = activePage.value.sections.length - 1
}

function removeSection(index: number) {
  const section = activePage.value.sections[index]
  if (!section) return

  ui.openModal(
    'Remove this section?',
    `Remove "${section.label || section.heading || 'this section'}" from ${activePage.value.title}?`,
    () => {
      activePage.value.sections.splice(index, 1)
      if (activeSectionIndex.value === index) activeSectionIndex.value = null
      ui.addToast('Section removed.', 'warning')
    },
  )
}

function duplicateSection(index: number) {
  const section = activePage.value.sections[index]
  if (!section) return

  activePage.value.sections.splice(
    index + 1,
    0,
    cloneSection({
      ...section,
      id: createSectionId(),
      label: `${section.label || 'Section'} copy`,
    }),
  )
}

function moveSection(index: number, direction: -1 | 1) {
  const target = index + direction
  const sections = activePage.value.sections
  const current = sections[index]
  const next = sections[target]
  if (!current || !next) return
  sections[index] = next
  sections[target] = current
}

function resetCurrentToDefault() {
  ui.openModal(
    'Reset this page?',
    `This restores ${activePage.value.title} to the default content and keeps it unsaved until you click Save page.`,
    applyDefaultReset,
  )
}

function applyDefaultReset() {
  const fallback = defaultPages.find((page) => page.slug === activePage.value.slug)
  if (!fallback) return

  const index = drafts.value.findIndex((page) => page.slug === fallback.slug)
  if (index === -1) return
  drafts.value[index] = clonePage(fallback)
  ui.addToast(`${fallback.title} reset to default draft.`, 'info')
}

function formatDate(value: string) {
  if (!value) return 'Not saved yet'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not saved yet'

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

/* ==============================
   ITEM WIZARD (Program-card style editing)
   ============================== */

type EditableItem = {
  icon: string
  title: string
  description: string
  note: string
  photo: string
  whatWeDo: string
  whyItMatters: string
}

const ICONS = [
  { key: 'heart', path: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z' },
  { key: 'people', path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
  { key: 'leaf', path: 'M11 20A7 7 0 0 1 4 13c0-8 7-11 15-11 0 9-2 16-8 18z' },
  { key: 'chat', path: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
  { key: 'megaphone', path: 'M3 11l18-5v12L3 13v-2z M6 13v5a2 2 0 0 0 2 2h1v-6' },
  { key: 'book', path: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
  { key: 'shield', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
] as const

const ICON_KEYS = new Set(ICONS.map((icon) => icon.key))

function iconPath(key: string) {
  return ICONS.find((icon) => icon.key === key)?.path ?? ''
}

function emptyItem(): EditableItem {
  return {
    icon: '',
    title: '',
    description: '',
    note: '',
    photo: '',
    whatWeDo: '',
    whyItMatters: '',
  }
}

function parseItemLine(line: string): EditableItem {
  let raw = line
  let icon = ''

  const separatorIndex = raw.lastIndexOf('::')
  if (separatorIndex !== -1) {
    const candidate = raw.slice(separatorIndex + 2).trim()
    if (ICON_KEYS.has(candidate)) {
      icon = candidate
      raw = raw.slice(0, separatorIndex)
    }
  }

  const parts = raw.split('|').map((part) => part.trim())
  return {
    icon,
    title: parts[0] ?? '',
    description: parts[1] ?? '',
    note: parts[2] ?? '',
    photo: parts[3] ?? '',
    whatWeDo: parts[4] ?? '',
    whyItMatters: parts[5] ?? '',
  }
}

function serializeItem(item: EditableItem): string {
  const parts = [
    item.title,
    item.description,
    item.note,
    item.photo,
    item.whatWeDo,
    item.whyItMatters,
  ]
  while (parts.length && !parts[parts.length - 1]) parts.pop()

  let line = parts.join(' | ')
  if (item.icon) line = `${line}::${item.icon}`
  return line
}

function getItems(section: EditableSection): EditableItem[] {
  return section.items
    ? section.items.split('\n').filter((line) => line.trim().length > 0).map(parseItemLine)
    : []
}

function setItems(section: EditableSection, items: EditableItem[]) {
  section.items = items.map(serializeItem).join('\n')
}

const activeItemIndex = ref<Record<string, number>>({})

function getActiveItemIndex(section: EditableSection) {
  const items = getItems(section)
  const current = activeItemIndex.value[section.id] ?? 0
  return Math.min(Math.max(current, 0), Math.max(items.length - 1, 0))
}

function setActiveItemIndex(section: EditableSection, index: number) {
  activeItemIndex.value[section.id] = index
}

function itemTabLabel(item: EditableItem, index: number) {
  const label = item.title.trim() || `Item ${index + 1}`
  const maxLength = 28
  return label.length > maxLength ? `${label.slice(0, maxLength - 2)}…` : label
}

function updateActiveItem(section: EditableSection, patch: Partial<EditableItem>) {
  const items = getItems(section)
  const index = getActiveItemIndex(section)
  const current = items[index]
  if (!current) return
  items[index] = { ...current, ...patch }
  setItems(section, items)
}

function addItem(section: EditableSection) {
  const items = getItems(section)
  items.push(emptyItem())
  setItems(section, items)
  setActiveItemIndex(section, items.length - 1)
}

function removeItem(section: EditableSection, index: number) {
  const items = getItems(section)
  if (items.length <= 1) return
  items.splice(index, 1)
  setItems(section, items)
  const next = Math.min(index, items.length - 1)
  setActiveItemIndex(section, next)
}

function goToItem(section: EditableSection, index: number) {
  const items = getItems(section)
  if (index < 0 || index >= items.length) return
  setActiveItemIndex(section, index)
}

function stepItem(section: EditableSection, direction: -1 | 1) {
  const items = getItems(section)
  const current = getActiveItemIndex(section)
  const next = current + direction
  if (next < 0 || next >= items.length) return
  setActiveItemIndex(section, next)
}

function onPhotoChange(section: EditableSection, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      updateActiveItem(section, { photo: reader.result })
    }
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function clearPhoto(section: EditableSection) {
  updateActiveItem(section, { photo: '' })
}
</script>

<template>
  <div :class="['cp-view', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="dash-layout">
      <AdminSidebar />

      <main class="dash-main">
        <!-- ==============================
             MODE TOGGLE — replaces the old two separate routes
             ============================== -->
        <div class="mode-toggle" role="tablist" aria-label="Child Protection view mode">
          <button
            type="button"
            role="tab"
            :aria-selected="mode === 'dashboard'"
            :class="['mode-btn', { active: mode === 'dashboard' }]"
            @click="mode = 'dashboard'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
            Dashboard
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="mode === 'editor'"
            :class="['mode-btn', { active: mode === 'editor' }]"
            @click="mode = 'editor'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Content
            <span v-if="activePageDirty" class="mode-dirty-dot" title="Unsaved changes"></span>
          </button>
        </div>

        <!-- ==============================
             DASHBOARD MODE (was ChildProtectionDashboardView.vue)
             ============================== -->
        <template v-if="mode === 'dashboard'">
          <header class="dash-banner">
            <div class="banner-glow" aria-hidden="true"></div>
            <div class="banner-particles" aria-hidden="true">
              <span></span><span></span><span></span><span></span>
            </div>
            <div class="banner-inner">
              <div class="banner-breadcrumb">
                <RouterLink to="/admin" class="bcrumb-link">Dashboard</RouterLink>
                <svg class="bcrumb-sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                <span class="bcrumb-label">Programs</span>
                <svg class="bcrumb-sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                <span class="bcrumb-current">Child Protection</span>
              </div>
              <div class="banner-content">
                <div class="banner-text">
                  <div class="banner-badge cp-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Child Protection Program
                  </div>
                  <h1 class="banner-title">Child Protection Dashboard</h1>
                  <p class="banner-desc">Manage child protection networks, peer education, and safe migration programs.</p>
                </div>
                <div class="banner-actions">
                  <button type="button" class="db-btn db-btn-ghost" @click="mode = 'editor'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit Content
                  </button>
                  <RouterLink class="db-btn db-btn-primary cp-primary" to="/programs/child-protection">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    View Page
                  </RouterLink>
                </div>
              </div>
              <div class="banner-stats">
                <div v-for="stat in statsCards" :key="stat.label" class="bstat" :class="'bstat-' + stat.color">
                  <div class="bstat-icon">
                    <svg v-if="stat.color === 'violet'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <svg v-else-if="stat.color === 'blue'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <svg v-else-if="stat.color === 'emerald'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <div class="bstat-info">
                    <strong>{{ stat.value }}</strong>
                    <small>{{ stat.label }}</small>
                    <span class="bstat-desc">{{ stat.desc }}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div class="content-grid">
            <div class="content-main">
              <section class="card-section">
                <div class="card-hdr">
                  <div class="card-hdr-left">
                    <span class="card-badge cp-badge">Quick access</span>
                    <h2 class="db-card-title">Frequent actions</h2>
                  </div>
                </div>
                <div class="db-card-body">
                  <div class="links-grid">
                    <button
                      v-for="link in quickLinks"
                      :key="link.title"
                      type="button"
                      class="link-card"
                      :class="'link-' + link.color"
                      @click="link.to ? router.push(link.to) : (mode = 'editor')"
                    >
                      <span class="link-icon">
                        <svg v-if="link.color === 'violet'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        <svg v-else-if="link.color === 'blue'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                        <svg v-else-if="link.color === 'emerald'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      </span>
                      <div class="link-text">
                        <strong>{{ link.title }}</strong>
                        <small>{{ link.desc }}</small>
                      </div>
                      <svg class="link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                </div>
              </section>

              <section class="card-section">
                <div class="card-hdr">
                  <div class="card-hdr-left">
                    <span class="card-badge cp-badge">Initiatives</span>
                    <h2 class="db-card-title">Child Protection programs</h2>
                  </div>
                  <RouterLink class="card-hdr-link" to="/admin/modules/programs">
                    View all
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </RouterLink>
                </div>
                <div class="db-card-body">
                  <div class="highlights-grid">
                    <div v-for="item in programHighlights" :key="item.title" class="hcard" :class="'hcard-' + item.color">
                      <div class="hcard-top">
                        <span class="hcard-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></span>
                        <span class="hcard-count">{{ item.count }}</span>
                      </div>
                      <div class="hcard-body">
                        <strong>{{ item.title }}</strong>
                        <small>{{ item.desc }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside class="content-side">
              <div class="side-card">
                <div class="side-card-hdr">
                  <span class="side-card-badge cp-badge">Impact</span>
                  <h3>Key numbers</h3>
                </div>
                <div class="side-list">
                  <div v-for="item in impactNumbers" :key="item.label" class="side-item">
                    <div class="side-item-dot cp-dot"></div>
                    <div class="side-item-info">
                      <strong>{{ item.value }}</strong>
                      <small>{{ item.label }}</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="side-card">
                <div class="side-card-hdr">
                  <span class="side-card-badge cp-badge">Content</span>
                  <h3>Related pages</h3>
                </div>
                <div class="side-nav">
                  <RouterLink v-for="page in infoPages" :key="page.slug" :to="'/admin/editor/' + page.slug" class="side-nav-link">
                    <div class="side-nav-info">
                      <strong>{{ page.title }}</strong>
                      <small>{{ page.route }}</small>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </RouterLink>
                </div>
              </div>
              <div class="side-card">
                <div class="side-card-hdr">
                  <span class="side-card-badge cp-badge">Actions</span>
                  <h3>Manage</h3>
                </div>
                <RouterLink class="side-btn" to="/admin/modules/programs">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  Program records
                </RouterLink>
                <button type="button" class="side-btn side-btn-block" @click="mode = 'editor'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit page content
                </button>
                <RouterLink class="side-btn" to="/admin/media">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Media library
                </RouterLink>
              </div>
            </aside>
          </div>
        </template>

        <!-- ==============================
             EDITOR MODE (was ChildProtectionEditorView.vue)
             ============================== -->
        <template v-else>
          <Transition name="notice-slide">
            <div v-if="notice" class="notice" :class="`notice-${notice.type}`" role="status">
              <div class="notice-inner">
                <svg v-if="notice.type === 'success'" class="notice-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <svg v-else class="notice-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{{ notice.message }}</span>
              </div>
              <button class="notice-dismiss" type="button" @click="notice = null" aria-label="Dismiss notice">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </Transition>

          <div class="editor-container">
            <section class="editor-column" aria-label="Page editor">
              <header class="editor-header">
                <div class="header-left">
                  <h1 class="header-title">Edit {{ activePage.title.toLowerCase() }} page</h1>
                  <p class="header-subtitle">Change the text and photos your visitors see</p>
                </div>
                <div class="header-right">
                  <div class="header-actions">
                    <button type="button" class="btn btn-ghost" @click="mode = 'dashboard'" title="Back to dashboard">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                      Dashboard
                    </button>
                    <RouterLink
                      v-if="activePage.route !== 'global'"
                      class="btn btn-ghost"
                      :to="activePage.route"
                      title="View this page on the live site"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      View page
                    </RouterLink>
                    <button
                      class="btn btn-primary"
                      type="button"
                      :disabled="savingSlug === activePage.slug || loading"
                      @click="saveCurrentPage"
                    >
                      <svg v-if="savingSlug === activePage.slug" class="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                      <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      {{ savingSlug === activePage.slug ? 'Saving...' : 'Publish changes' }}
                    </button>
                    <button class="btn-icon-sm" type="button" @click="resetCurrentToDefault" title="Undo my changes">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                    </button>
                  </div>
                  <div class="save-indicator" :class="{ dirty: activePageDirty }">
                    <span class="save-dot"></span>
                    <span class="save-label">{{ activePageDirty ? 'Unsaved changes' : 'Saved' }}</span>
                  </div>
                </div>
              </header>

              <div class="form-panels">
                <section class="form-card">
                  <div class="card-header">
                    <div class="card-header-left">
                      <div class="card-icon card-icon-violet">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      </div>
                      <div>
                        <h3 class="card-title">Top of page</h3>
                        <span class="card-subtitle">This is the first thing people see</span>
                      </div>
                    </div>
                  </div>
                  <div class="card-body">
                    <label class="field field-block">
                      <span class="field-label">Small label above the title</span>
                      <input v-model="activePage.eyebrow" name="page-eyebrow" placeholder="e.g. Our Programs" />
                    </label>
                    <label class="field field-block">
                      <span class="field-label">Big title</span>
                      <textarea v-model="activePage.headline" name="page-headline" rows="2" placeholder="The main headline for this page"></textarea>
                    </label>
                    <label class="field field-block">
                      <span class="field-label">Short paragraph</span>
                      <textarea v-model="activePage.intro" name="page-intro" rows="4" placeholder="A short paragraph under the title"></textarea>
                    </label>
                    <div class="form-grid">
                      <label class="field">
                        <span class="field-label">Button text</span>
                        <input v-model="activePage.primaryAction" name="page-primary-action" placeholder="e.g. Support Us" />
                      </label>
                      <label class="field">
                        <span class="field-label">Second button text (optional)</span>
                        <input v-model="activePage.secondaryAction" name="page-secondary-action" placeholder="e.g. Learn More" />
                      </label>
                    </div>
                  </div>
                </section>

                <section
                  v-for="(section, sIndex) in activePage.sections"
                  :id="`edit-${section.id}`"
                  :key="section.id"
                  class="form-card"
                >
                  <div class="card-header">
                    <div class="card-header-left">
                      <div class="card-icon card-icon-amber">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                      </div>
                      <div>
                        <input v-model="section.label" class="card-title-input" :name="`section-${section.id}-label`" placeholder="Section name" />
                        <span class="card-subtitle">{{ activePage.sections.length > 1 ? `Section ${sIndex + 1} of ${activePage.sections.length}` : 'One section on this page' }}</span>
                      </div>
                    </div>
                    <div class="section-actions">
                      <button type="button" class="btn-icon" :disabled="sIndex === 0" aria-label="Move up" title="Move up" @click="moveSection(sIndex, -1)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                      </button>
                      <button type="button" class="btn-icon" :disabled="sIndex === activePage.sections.length - 1" aria-label="Move down" title="Move down" @click="moveSection(sIndex, 1)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                      <button type="button" class="btn-icon" aria-label="Duplicate" title="Duplicate" @click="duplicateSection(sIndex)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                      <button type="button" class="btn-icon danger" aria-label="Remove" title="Remove" @click="removeSection(sIndex)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>

                  <div class="card-body">
                    <label class="field field-block">
                      <span class="field-label">Heading</span>
                      <input v-model="section.heading" :name="`section-${section.id}-heading`" placeholder="Section heading" />
                    </label>
                    <label class="field field-block">
                      <span class="field-label">Short description</span>
                      <textarea v-model="section.body" :name="`section-${section.id}-body`" rows="2" placeholder="A sentence or two about this section"></textarea>
                    </label>

                    <div v-if="getItems(section).length" class="item-wizard">
                      <span class="field-label">{{ section.label || 'Items' }}</span>
                      <p class="field-hint-line">One card per item. Switch tabs or use Previous / Next.</p>

                      <div class="item-tabs">
                        <button
                          v-for="(item, iIndex) in getItems(section)"
                          :key="iIndex"
                          type="button"
                          class="item-tab"
                          :class="{ active: getActiveItemIndex(section) === iIndex }"
                          :title="item.title || `Item ${iIndex + 1}`"
                          @click="goToItem(section, iIndex)"
                        >
                          <svg v-if="item.icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="iconPath(item.icon)" /></svg>
                          <span class="item-tab-label">{{ itemTabLabel(item, iIndex) }}</span>
                        </button>
                      </div>

                      <div class="item-card">
                        <div class="item-card-header">
                          <div>
                            <strong>{{ section.label || 'Item' }} {{ getActiveItemIndex(section) + 1 }} of {{ getItems(section).length }}</strong>
                            <small>This becomes one card on the page</small>
                          </div>
                          <button
                            type="button"
                            class="btn-icon danger"
                            :disabled="getItems(section).length <= 1"
                            title="Remove this item"
                            @click="removeItem(section, getActiveItemIndex(section))"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>

                        <div class="item-card-body">
                          <label class="field field-block">
                            <span class="field-label">Photo</span>
                            <div class="photo-picker">
                              <div class="photo-preview" :class="{ filled: !!getItems(section)[getActiveItemIndex(section)]?.photo }">
                                <img
                                  v-if="getItems(section)[getActiveItemIndex(section)]?.photo"
                                  :src="getItems(section)[getActiveItemIndex(section)]?.photo"
                                  alt=""
                                />
                                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                              </div>
                              <div class="photo-picker-actions">
                                <label class="btn btn-secondary photo-choose-btn">
                                  Choose photo
                                  <input type="file" accept="image/*" class="photo-input" @change="onPhotoChange(section, $event)" />
                                </label>
                                <button
                                  v-if="getItems(section)[getActiveItemIndex(section)]?.photo"
                                  type="button"
                                  class="btn btn-ghost"
                                  @click="clearPhoto(section)"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </label>

                          <label class="field field-block">
                            <span class="field-label">Icon</span>
                            <div class="icon-picker">
                              <button
                                v-for="icon in ICONS"
                                :key="icon.key"
                                type="button"
                                class="icon-option"
                                :class="{ active: getItems(section)[getActiveItemIndex(section)]?.icon === icon.key }"
                                :title="icon.key"
                                @click="updateActiveItem(section, { icon: getItems(section)[getActiveItemIndex(section)]?.icon === icon.key ? '' : icon.key })"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="icon.path" /></svg>
                              </button>
                            </div>
                          </label>

                          <label class="field field-block">
                            <span class="field-label">Title</span>
                            <input
                              :value="getItems(section)[getActiveItemIndex(section)]?.title"
                              :name="`item-${section.id}-title`"
                              placeholder="e.g. Environment"
                              @input="updateActiveItem(section, { title: ($event.target as HTMLInputElement).value })"
                            />
                          </label>

                          <label class="field field-block">
                            <span class="field-label">Description</span>
                            <textarea
                              :value="getItems(section)[getActiveItemIndex(section)]?.description"
                              :name="`item-${section.id}-description`"
                              rows="3"
                              placeholder="A sentence or two about this item"
                              @input="updateActiveItem(section, { description: ($event.target as HTMLTextAreaElement).value })"
                            ></textarea>
                          </label>

                          <label class="field field-block">
                            <span class="field-label">Quote from the community (optional)</span>
                            <textarea
                              :value="getItems(section)[getActiveItemIndex(section)]?.note"
                              :name="`item-${section.id}-note`"
                              rows="2"
                              placeholder="A short quote or extra detail"
                              @input="updateActiveItem(section, { note: ($event.target as HTMLTextAreaElement).value })"
                            ></textarea>
                          </label>

                          <label class="field field-block">
                            <span class="field-label">What we do (optional)</span>
                            <textarea
                              :value="getItems(section)[getActiveItemIndex(section)]?.whatWeDo"
                              :name="`item-${section.id}-what-we-do`"
                              rows="3"
                              placeholder="The main activities for this item"
                              @input="updateActiveItem(section, { whatWeDo: ($event.target as HTMLTextAreaElement).value })"
                            ></textarea>
                          </label>

                          <label class="field field-block">
                            <span class="field-label">Why it matters (optional)</span>
                            <textarea
                              :value="getItems(section)[getActiveItemIndex(section)]?.whyItMatters"
                              :name="`item-${section.id}-why-it-matters`"
                              rows="3"
                              placeholder="Why this work matters to the community"
                              @input="updateActiveItem(section, { whyItMatters: ($event.target as HTMLTextAreaElement).value })"
                            ></textarea>
                          </label>
                        </div>

                        <div class="item-card-footer">
                          <button type="button" class="btn btn-ghost" :disabled="getActiveItemIndex(section) === 0" @click="stepItem(section, -1)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                            Previous
                          </button>
                          <span class="section-toolbar-hint">Changes save automatically as you type</span>
                          <button type="button" class="btn btn-ghost" :disabled="getActiveItemIndex(section) === getItems(section).length - 1" @click="stepItem(section, 1)">
                            Next
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div v-else class="empty-sections">
                      <p>No items in this section yet</p>
                      <button class="btn btn-secondary" type="button" @click="addItem(section)">Add your first item</button>
                    </div>
                  </div>
                </section>

                <button class="btn btn-secondary add-section-btn-full" type="button" @click="addSection">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add section
                </button>
              </div>

              <div class="save-bar">
                <div class="save-bar-left">
                  <span class="save-dot-large" :class="{ dirty: activePageDirty }"></span>
                  <div>
                    <strong>{{ activePageDirty ? 'You have unsaved changes' : 'Everything is saved' }}</strong>
                    <small>Last published {{ formatDate(activePage.updatedAt) }}</small>
                  </div>
                </div>
                <div class="save-bar-right">
                  <button
                    class="btn btn-primary"
                    type="button"
                    :disabled="savingSlug === activePage.slug || loading"
                    @click="saveCurrentPage"
                  >
                    <svg v-if="savingSlug === activePage.slug" class="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                    <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    {{ savingSlug === activePage.slug ? 'Saving...' : 'Publish changes' }}
                  </button>
                </div>
              </div>
            </section>

            <Transition name="preview-slide">
              <aside v-if="previewVisible" class="preview-column" aria-label="Content preview">
                <div class="preview-header">
                  <div class="preview-header-left">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span>Live preview</span>
                  </div>
                  <button class="btn-icon-sm" type="button" @click="previewVisible = false" aria-label="Close preview">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                <div class="preview-content">
                  <div class="preview-hero">
                    <span class="preview-eyebrow">{{ activePage.eyebrow || 'Eyebrow text' }}</span>
                    <h2 class="preview-headline">{{ activePage.headline || 'Headline' }}</h2>
                    <p class="preview-intro">{{ activePage.intro || 'Intro text...' }}</p>
                    <div v-if="activePage.primaryAction || activePage.secondaryAction" class="preview-actions">
                      <span v-if="activePage.primaryAction" class="preview-btn preview-btn-primary">{{ activePage.primaryAction }}</span>
                      <span v-if="activePage.secondaryAction" class="preview-btn preview-btn-secondary">{{ activePage.secondaryAction }}</span>
                    </div>
                  </div>

                  <div class="preview-sections">
                    <div
                      v-for="section in previewItems"
                      :key="section.id"
                      class="preview-section"
                    >
                      <h3 class="preview-section-heading">{{ section.heading || 'Section heading' }}</h3>
                      <p class="preview-section-body" v-if="section.body">{{ section.body }}</p>

                      <div v-if="section.parsedItems.length" class="preview-items">
                        <template v-for="item in section.parsedItems" :key="item">
                          <div v-if="item.includes('|')" class="preview-item-card">
                            <strong>{{ item.split('|')[0]?.trim() }}</strong>
                            <span>{{ item.split('|').slice(1).join('|').replace(/::[a-z]+$/, '').trim() }}</span>
                          </div>
                          <div v-else class="preview-item-simple">
                            <span class="preview-bullet"></span>
                            <span>{{ item.replace(/::[a-z]+$/, '') }}</span>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="preview-footer">
                  <span>Auto-refreshes on edit</span>
                </div>
              </aside>
            </Transition>

            <button
              v-if="!previewVisible"
              class="preview-toggle-btn"
              type="button"
              @click="previewVisible = true"
              title="Show preview"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ==============================
   SHARED / DASHBOARD DESIGN TOKENS
   (from ChildProtectionDashboardView.vue)
   ============================== */
.cp-view {
  --bg: #f3f6fd; --surface: #ffffff; --border: #e8edf6; --border-s: #d4dcee;
  --text: #1e2a4a; --contrast: #0a142d; --muted: #6a7fa0;
  --blue: #2563eb; --blue-soft: #ecf2ff;
  --emerald: #059669; --emerald-soft: #eafaf5;
  --amber: #d97706; --amber-soft: #fef8ee;
  --violet: #7c3aed; --violet-glow: rgba(124,58,237,0.25); --violet-soft: #f3efff;
  --slate: #64748b; --slate-soft: #f0f3f8;
  --shadow-xs: 0 1px 2px rgba(10,20,45,0.04);
  --shadow-sm: 0 2px 8px rgba(10,20,45,0.06);
  --shadow-md: 0 4px 16px rgba(10,20,45,0.07);
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px;

  /* editor tokens (from ChildProtectionEditorView.vue), namespaced --admin-* so
     they never collide with the --bg/--surface tokens above */
  --admin-bg: #f1f5f9;
  --admin-bg-deep: #e2e8f0;
  --admin-surface: #ffffff;
  --admin-surface-soft: #f8fafc;
  --admin-contrast: #0f172a;
  --admin-contrast-soft: #1e293b;
  --admin-text: #334155;
  --admin-muted: #64748b;
  --admin-muted-light: #94a3b8;
  --admin-border: #e2e8f0;
  --admin-border-strong: #cbd5e1;
  --admin-blue: #2563eb;
  --admin-blue-soft: #eff6ff;
  --admin-violet: #7c3aed;
  --admin-violet-soft: #f5f3ff;
  --admin-amber: #d97706;
  --admin-amber-soft: #fffbeb;
  --admin-green: #16a34a;
  --admin-green-soft: #f0fdf4;
  --admin-red: #dc2626;
  --admin-red-soft: #fef2f2;
  --admin-gold: #f59e0b;
  --admin-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --admin-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --admin-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
  --admin-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
  --admin-shadow-xl: 0 20px 40px -8px rgba(0, 0, 0, 0.08);

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  transition: padding-left 0.3s cubic-bezier(0.16,1,0.3,1);
}
:global(.admin-dark) .cp-view {
  --bg: #080c1a; --surface: #101826; --border: #1c2642; --border-s: #263252;
  --text: #c8d2e6; --contrast: #eaf0f8; --muted: #7a8aaa;
  --blue: #3b82f6; --blue-soft: #172244;
  --emerald: #10b981; --emerald-soft: #142a22;
  --amber: #f59e0b; --amber-soft: #241e14;
  --violet: #a78bfa; --violet-glow: rgba(167,139,250,0.2); --violet-soft: #1c1640;
  --slate: #8896b0; --slate-soft: #121a2e;
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.15);
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.2);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.25);

  --admin-bg: #0b1120;
  --admin-bg-deep: #111827;
  --admin-surface: #1a2332;
  --admin-surface-soft: #0f172a;
  --admin-contrast: #f1f5f9;
  --admin-contrast-soft: #e2e8f0;
  --admin-text: #cbd5e1;
  --admin-muted: #94a3b8;
  --admin-muted-light: #64748b;
  --admin-border: #1e293b;
  --admin-border-strong: #334155;
  --admin-blue-soft: rgba(37, 99, 235, 0.12);
  --admin-violet-soft: rgba(124, 58, 237, 0.12);
  --admin-amber-soft: rgba(217, 119, 6, 0.12);
  --admin-green-soft: rgba(22, 163, 74, 0.12);
  --admin-red-soft: rgba(220, 38, 38, 0.12);
  --admin-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --admin-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  --admin-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --admin-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
  --admin-shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.4);
}
.dash-layout { display: flex; flex: 1; }
.dash-main { flex: 1; width: 100%; padding: 1.25rem 1.5rem 2rem; }

/* ==============================
   MODE TOGGLE (new)
   ============================== */
.mode-toggle {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  margin-bottom: 1rem;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xs);
}
.mode-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: var(--muted);
  font-weight: 750;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.mode-btn:hover { color: var(--contrast); background: var(--bg); }
.mode-btn.active { background: var(--violet); color: #fff; box-shadow: 0 2px 8px var(--violet-glow); }
.mode-dirty-dot {
  width: 6px; height: 6px; border-radius: 999px; background: var(--amber);
  box-shadow: 0 0 0 2px rgba(255,255,255,0.5);
}

/* ==============================
   DASHBOARD-ONLY BUTTONS
   Renamed with a "db-" prefix so they never collide with the
   editor's .btn / .btn-primary / .btn-ghost classes below.
   ============================== */
.db-btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  min-height: 36px; padding: 0.4rem 1rem;
  border-radius: var(--radius-sm); font-weight: 750; font-size: 0.82rem;
  cursor: pointer; text-decoration: none;
  transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
  border: 1px solid transparent; font-family: inherit;
}
.db-btn:hover { transform: translateY(-1px); }
.db-btn-primary.cp-primary {
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  color: #fff; box-shadow: 0 4px 14px rgba(124,58,237,0.3);
}
.db-btn-primary.cp-primary:hover { box-shadow: 0 6px 24px rgba(124,58,237,0.4); }
.db-btn-ghost {
  background: rgba(255,255,255,0.7); color: var(--contrast);
  border-color: var(--border); backdrop-filter: blur(8px);
}
.db-btn-ghost:hover { background: var(--surface); border-color: var(--border-s); box-shadow: var(--shadow-sm); }
:global(.admin-dark) .db-btn-ghost { background: rgba(16,24,38,0.7); border-color: var(--border); }

.dash-banner {
  position: relative; background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl); box-shadow: var(--shadow-md);
  overflow: hidden;
}
.banner-glow { position: absolute; inset: 0;
  background: radial-gradient(ellipse 400px 200px at 10% 30%, rgba(124,58,237,0.08) 0%, transparent 70%),
              radial-gradient(ellipse 300px 200px at 90% 80%, rgba(37,99,235,0.05) 0%, transparent 70%);
  pointer-events: none;
}
.banner-particles { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.banner-particles span { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: rgba(124,58,237,0.1); }
.banner-particles span:nth-child(1) { top: 15%; left: 10%; animation: float 8s ease-in-out infinite; }
.banner-particles span:nth-child(2) { top: 60%; right: 15%; width: 4px; height: 4px; animation: float 6s ease-in-out infinite reverse; }
.banner-particles span:nth-child(3) { bottom: 20%; left: 40%; width: 5px; height: 5px; animation: float 10s ease-in-out infinite 2s; }
.banner-particles span:nth-child(4) { top: 25%; right: 30%; animation: float 7s ease-in-out infinite 1s; }
@keyframes float { 0%,100%{transform:translateY(0) scale(1);opacity:.4} 50%{transform:translateY(-12px) scale(1.2);opacity:.8} }
.banner-inner { position: relative; z-index: 1; }
.banner-breadcrumb { display:flex;align-items:center;gap:.4rem;padding:.6rem 1.25rem;background:rgba(255,255,255,.5);backdrop-filter:blur(8px);border-bottom:1px solid var(--border);font-size:.76rem;font-weight:700 }
:global(.admin-dark) .banner-breadcrumb { background: rgba(16,24,38,.5) }
.bcrumb-link { color: var(--blue); text-decoration: none; }
.bcrumb-link:hover { text-decoration: underline; }
.bcrumb-sep { color: var(--muted); width: 10px; }
.bcrumb-label { color: var(--muted); }
.bcrumb-current { color: var(--contrast); }
.banner-content { display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;padding:1.25rem 1.25rem .75rem }
.banner-text { display: grid; gap: .3rem; }
.banner-badge { display:inline-flex;align-items:center;gap:.35rem;width:fit-content;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--violet);background:var(--violet-soft);padding:.2rem .7rem;border-radius:999px }
.banner-title { margin:0;color:var(--contrast);font-size:clamp(1.35rem,2.8vw,1.85rem);font-weight:900;letter-spacing:-.025em;line-height:1.1 }
.banner-desc { margin:0;color:var(--muted);font-size:.86rem;line-height:1.5;max-width:460px }
.banner-actions { display:flex;gap:.45rem;flex-shrink:0;flex-wrap:wrap }
.banner-stats { display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--border) }
.bstat { display:flex;align-items:center;gap:.7rem;padding:.75rem 1rem;border-right:1px solid var(--border);text-decoration:none;transition:all .2s ease }
.bstat:last-child { border-right: none; }
.bstat:hover { background: var(--surface); }
.bstat-icon { width:40px;height:40px;display:grid;place-items:center;border-radius:var(--radius-sm);flex-shrink:0;transition:transform .2s ease,box-shadow .2s ease }
.bstat:hover .bstat-icon { transform: scale(1.08); }
.bstat-violet .bstat-icon { background:var(--violet-soft);color:var(--violet);box-shadow:0 0 0 0 var(--violet-glow) }
.bstat-violet:hover .bstat-icon { box-shadow: 0 0 0 4px var(--violet-glow); }
.bstat-blue .bstat-icon { background:var(--blue-soft);color:var(--blue) }
.bstat-blue:hover .bstat-icon { box-shadow: 0 0 0 4px rgba(37,99,235,.2); }
.bstat-emerald .bstat-icon { background:var(--emerald-soft);color:var(--emerald) }
.bstat-emerald:hover .bstat-icon { box-shadow: 0 0 0 4px rgba(5,150,105,.2); }
.bstat-amber .bstat-icon { background:var(--amber-soft);color:var(--amber) }
.bstat-amber:hover .bstat-icon { box-shadow: 0 0 0 4px rgba(217,119,6,.2); }
.bstat-info strong { display:block;color:var(--contrast);font-size:1.05rem;font-weight:900;line-height:1.2 }
.bstat-info small { display:block;color:var(--muted);font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.02em }
.bstat-desc { display:block;color:var(--muted);font-size:.68rem;font-weight:600;margin-top:1px }

.content-grid { display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:1.25rem;margin-top:1.25rem;align-items:start }
.content-main { display:grid;gap:1.25rem }
.content-side { display:grid;gap:.85rem;position:sticky;top:calc(60px + 1.25rem) }
.card-section { background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-xl);box-shadow:var(--shadow-sm);overflow:hidden;transition:box-shadow .2s ease }
.card-section:hover { box-shadow: var(--shadow-md); }
.card-hdr { display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:.85rem 1.2rem;border-bottom:1px solid var(--border) }
.card-hdr-left { display:grid;gap:.15rem }
.card-badge { font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--violet) }
/* renamed from .card-title -> .db-card-title to avoid colliding with the editor's .card-title */
.db-card-title { margin:0;color:var(--contrast);font-size:.95rem;font-weight:850 }
.card-hdr-link { display:inline-flex;align-items:center;gap:.3rem;font-size:.78rem;font-weight:700;color:var(--blue);text-decoration:none;padding:.3rem .6rem;border-radius:var(--radius-sm);transition:background .15s ease }
.card-hdr-link:hover { background: var(--blue-soft); }
/* renamed from .card-body -> .db-card-body to avoid colliding with the editor's .card-body */
.db-card-body { padding: 1rem 1.2rem 1.2rem; }
.links-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:.7rem }
.link-card {
  display:flex;align-items:center;gap:.7rem;padding:.75rem .85rem;border-radius:var(--radius-md);
  border:1px solid var(--border);background:var(--surface);text-decoration:none;
  transition:all .2s cubic-bezier(.16,1,.3,1);
  width: 100%; text-align: left; font: inherit; cursor: pointer;
}
.link-card:hover { border-color:var(--border-s);box-shadow:var(--shadow-sm);transform:translateY(-2px) }
.link-icon { width:36px;height:36px;display:grid;place-items:center;border-radius:var(--radius-sm);flex-shrink:0;transition:transform .2s ease }
.link-card:hover .link-icon { transform: scale(1.1); }
.link-violet .link-icon { background:var(--violet-soft);color:var(--violet) }
.link-blue .link-icon { background:var(--blue-soft);color:var(--blue) }
.link-emerald .link-icon { background:var(--emerald-soft);color:var(--emerald) }
.link-amber .link-icon { background:var(--amber-soft);color:var(--amber) }
.link-text { flex:1;min-width:0 }
.link-text strong { display:block;color:var(--contrast);font-size:.82rem;font-weight:800;margin-bottom:1px }
.link-text small { display:block;color:var(--muted);font-size:.72rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap }
.link-arrow { flex-shrink:0;color:var(--muted);transition:transform .2s ease }
.link-card:hover .link-arrow { transform:translateX(3px);color:var(--violet) }
.highlights-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem }
.hcard { border:1px solid var(--border);border-radius:var(--radius-md);background:var(--surface);overflow:hidden;transition:all .2s cubic-bezier(.16,1,.3,1) }
.hcard:hover { transform:translateY(-3px);box-shadow:var(--shadow-sm);border-color:color-mix(in srgb,var(--hc) 25%,var(--border-s)) }
.hcard-violet { --hc:var(--violet) } .hcard-blue { --hc:var(--blue) } .hcard-emerald { --hc:var(--emerald) } .hcard-amber { --hc:var(--amber) } .hcard-slate { --hc:var(--slate) }
.hcard-top { display:flex;align-items:center;justify-content:space-between;padding:.55rem .7rem;border-bottom:1px solid var(--border);background:var(--surface) }
.hcard-icon { width:26px;height:26px;display:grid;place-items:center;border-radius:6px;background:color-mix(in srgb,var(--hc) 12%,var(--surface));color:var(--hc) }
.hcard-count { font-size:.72rem;font-weight:800;color:var(--muted);padding:.1rem .4rem;border-radius:999px;background:var(--surface);border:1px solid var(--border) }
.hcard-body { padding:.5rem .7rem .65rem;display:grid;gap:.12rem }
.hcard-body strong { color:var(--contrast);font-size:.8rem;font-weight:800 }
.hcard-body small { color:var(--muted);font-size:.7rem;font-weight:600;line-height:1.4 }
.side-card { background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:.85rem;box-shadow:var(--shadow-xs);transition:box-shadow .2s ease }
.side-card:hover { box-shadow: var(--shadow-sm); }
.side-card-hdr { display:grid;gap:.15rem;margin-bottom:.7rem }
.side-card-badge { font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--violet) }
.side-card-hdr h3 { margin:0;color:var(--contrast);font-size:.85rem;font-weight:800 }
.side-list { display:grid;gap:.5rem }
.side-item { display:flex;align-items:center;gap:.6rem;padding:.5rem .6rem;border-radius:var(--radius-sm);background:var(--surface);border:1px solid var(--border);transition:border-color .15s ease }
.side-item:hover { border-color: var(--border-s); }
.side-item-dot { width:8px;height:8px;border-radius:50%;background:var(--violet);flex-shrink:0 }
.side-item-info strong { display:block;color:var(--contrast);font-size:.9rem;font-weight:900;line-height:1.2 }
.side-item-info small { display:block;color:var(--muted);font-size:.7rem;font-weight:700 }
.side-nav { display:grid;gap:.25rem }
.side-nav-link { display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.45rem .6rem;border-radius:var(--radius-sm);text-decoration:none;transition:background .15s ease }
.side-nav-link:hover { background: var(--surface); }
.side-nav-info strong { display:block;color:var(--contrast);font-size:.78rem;font-weight:800 }
.side-nav-info small { display:block;color:var(--muted);font-size:.68rem;font-weight:600 }
.side-nav-link > svg { color:var(--muted);flex-shrink:0 }
.side-btn {
  display:flex;align-items:center;gap:.45rem;padding:.45rem .6rem;border-radius:var(--radius-sm);
  border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:.78rem;font-weight:700;
  text-decoration:none;transition:all .15s ease;margin-bottom:.3rem;
}
.side-btn-block { width: 100%; text-align: left; font: inherit; cursor: pointer; }
.side-btn:last-child { margin-bottom:0 }
.side-btn:hover { border-color:var(--border-s);background:var(--surface);color:var(--contrast);box-shadow:var(--shadow-xs) }

/* ==============================
   EDITOR-ONLY STYLES
   (from ChildProtectionEditorView.vue, unchanged class names —
   these don't collide with the .db-* prefixed dashboard classes above)
   ============================== */
.main { flex: 1; width: 100%; }

.notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-weight: 700;
  font-size: 0.88rem;
  border: 1px solid transparent;
}
.notice-inner { display: flex; align-items: center; gap: 0.55rem; }
.notice-icon { flex-shrink: 0; }
.notice-success { border-color: rgba(22, 163, 74, 0.25); background: var(--admin-green-soft); color: #166534; }
.notice-error { border-color: rgba(220, 38, 38, 0.25); background: var(--admin-red-soft); color: #991b1b; }
.notice-dismiss {
  display: grid; place-items: center; width: 24px; height: 24px; border: none; border-radius: 6px;
  background: transparent; color: inherit; cursor: pointer; opacity: 0.6; transition: opacity 0.15s;
}
.notice-dismiss:hover { opacity: 1; }
.notice-slide-enter-active, .notice-slide-leave-active { transition: all 0.25s ease; }
.notice-slide-enter-from, .notice-slide-leave-to { opacity: 0; transform: translateY(-10px); }

.editor-container { display: flex; gap: 1.25rem; align-items: flex-start; position: relative; }
.editor-column { flex: 1; min-width: 0; max-width: 860px; }

.editor-header {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  margin-bottom: 1rem; padding: 1rem 1.25rem; border: 1px solid var(--admin-border);
  border-radius: 12px; background: var(--admin-surface); box-shadow: var(--admin-shadow);
}
.header-left { min-width: 0; display: grid; gap: 0.15rem; }
.header-title { margin: 0; font-size: 1.15rem; font-weight: 700; color: var(--admin-contrast); }
.header-subtitle { margin: 0; font-size: 0.8rem; font-weight: 600; color: var(--admin-muted); }
.header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; flex-shrink: 0; }

.save-indicator {
  display: flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.65rem; border-radius: 8px;
  background: var(--admin-green-soft); font-size: 0.75rem; font-weight: 700; color: #166534;
}
.save-indicator.dirty { background: var(--admin-amber-soft); color: #92400e; }
.save-dot { width: 6px; height: 6px; border-radius: 999px; background: #16a34a; }
.save-indicator.dirty .save-dot { background: var(--admin-amber); }
.save-label { white-space: nowrap; }

.btn {
  display: inline-flex; align-items: center; gap: 0.45rem; min-height: 36px; border-radius: 8px;
  padding: 0.45rem 0.9rem; font-weight: 600; font-size: 0.82rem; cursor: pointer; text-decoration: none;
  border: 1px solid transparent; transition: all 0.15s ease, transform 0.15s ease; white-space: nowrap; will-change: transform;
}
.btn:disabled { cursor: not-allowed; opacity: 0.5; }
.btn-primary { background: var(--admin-blue); color: #ffffff; border-color: var(--admin-blue); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25); }
.btn-primary:hover:not(:disabled) { background: #1d4ed8; border-color: #1d4ed8; box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35); transform: translateY(-1px); }
.btn-secondary { background: var(--admin-surface); color: var(--admin-contrast); border-color: var(--admin-border-strong); }
.btn-secondary:hover:not(:disabled) { border-color: var(--admin-muted); background: var(--admin-surface-soft); box-shadow: var(--admin-shadow); }
.btn-ghost { background: transparent; color: var(--admin-muted); border-color: var(--admin-border); }
.btn-ghost:hover:not(:disabled) { background: var(--admin-bg); color: var(--admin-contrast); border-color: var(--admin-border-strong); }
.btn-icon {
  display: grid; place-items: center; width: 30px; height: 30px; border: none; border-radius: 6px;
  background: transparent; color: var(--admin-muted); cursor: pointer; transition: all 0.15s ease;
}
.btn-icon:hover:not(:disabled) { background: var(--admin-bg); color: var(--admin-contrast); }
.btn-icon:disabled { cursor: not-allowed; opacity: 0.3; }
.btn-icon.danger:hover:not(:disabled) { color: #dc2626; background: var(--admin-red-soft); }
.btn-icon-sm {
  display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid var(--admin-border);
  border-radius: 8px; background: var(--admin-surface); color: var(--admin-muted); cursor: pointer; transition: all 0.15s ease;
}
.btn-icon-sm:hover { background: var(--admin-bg); color: var(--admin-contrast); }
.header-actions { display: flex; gap: 0.35rem; align-items: center; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.form-panels { display: grid; gap: 1rem; }
.form-card { border: 1px solid var(--admin-border); border-radius: 12px; background: var(--admin-surface); box-shadow: var(--admin-shadow); overflow: hidden; transition: box-shadow 0.2s ease; }
.form-card:hover { box-shadow: var(--admin-shadow-md); }
.card-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.85rem 1.1rem; border-bottom: 1px solid var(--admin-border); background: var(--admin-surface-soft); }
.card-header-left { display: flex; align-items: center; gap: 0.7rem; min-width: 0; flex: 1; }
.card-icon { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 9px; flex-shrink: 0; }
.card-icon-violet { background: var(--admin-violet-soft); color: var(--admin-violet); }
.card-icon-amber { background: var(--admin-amber-soft); color: var(--admin-amber); }
.card-subtitle { display: block; font-size: 0.75rem; font-weight: 600; color: var(--admin-muted); margin-top: 0.05rem; }
.card-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--admin-contrast); }
.card-title-input { border: none; background: transparent; padding: 0; font-size: 0.95rem; font-weight: 700; color: var(--admin-contrast); width: 100%; min-width: 120px; }
.card-title-input:focus { outline: none; box-shadow: none; }
.card-body { padding: 1rem 1.1rem 1.15rem; }
.section-actions { display: flex; align-items: center; gap: 0.15rem; flex-shrink: 0; }

.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.85rem; }
.field { display: grid; gap: 0.35rem; }
.field-block { margin-top: 0.85rem; }
.field-block:first-child { margin-top: 0; }
.field-label { font-size: 0.78rem; font-weight: 700; color: var(--admin-contrast-soft); letter-spacing: 0.01em; }
.field-hint { display: block; font-weight: 600; color: var(--admin-muted); font-size: 0.72rem; margin-top: 0.15rem; }
.field-hint-line { margin: 0.15rem 0 0.75rem; font-size: 0.75rem; font-weight: 600; color: var(--admin-muted); }

input, textarea {
  width: 100%; border: 1.5px solid var(--admin-border-strong); border-radius: 10px; background: var(--admin-surface);
  color: var(--admin-text); padding: 0.62rem 0.78rem; font-size: 0.88rem; line-height: 1.5; font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
textarea { resize: vertical; min-height: 48px; }
input:focus, textarea:focus { border-color: var(--admin-blue); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); outline: none; }
input::placeholder, textarea::placeholder { color: var(--admin-muted-light); }

.item-wizard { margin-top: 1.1rem; padding-top: 1rem; border-top: 1px solid var(--admin-border); }
.item-tabs { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.85rem; }
.item-tab {
  display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.75rem; border-radius: 999px;
  border: 1.5px solid var(--admin-border-strong); background: var(--admin-surface); color: var(--admin-text);
  font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease;
  max-width: 200px; overflow: hidden;
}
.item-tab-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.item-tab:hover { border-color: var(--admin-blue); color: var(--admin-blue); }
.item-tab.active { background: var(--admin-blue-soft); border-color: var(--admin-blue); color: var(--admin-blue); }

.item-card { border: 1px solid var(--admin-border); border-radius: 12px; background: var(--admin-surface-soft); overflow: hidden; }
.item-card-header { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.75rem 0.9rem; border-bottom: 1px solid var(--admin-border); background: var(--admin-surface); }
.item-card-header strong { display: block; font-size: 0.86rem; font-weight: 700; color: var(--admin-contrast); }
.item-card-header small { display: block; font-size: 0.72rem; font-weight: 600; color: var(--admin-muted); margin-top: 0.1rem; }
.item-card-body { padding: 0.9rem; }
.item-card-footer { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.7rem 0.9rem; border-top: 1px solid var(--admin-border); background: var(--admin-surface); }
.item-card-footer .btn { min-height: 32px; padding: 0.35rem 0.7rem; font-size: 0.78rem; }
.section-toolbar-hint { font-size: 0.72rem; font-weight: 600; color: var(--admin-muted-light); text-align: center; flex: 1; }

.photo-picker { display: flex; align-items: center; gap: 0.9rem; }
.photo-preview {
  width: 64px; height: 64px; flex-shrink: 0; display: grid; place-items: center; border-radius: 10px;
  border: 1.5px dashed var(--admin-border-strong); background: var(--admin-surface); color: var(--admin-muted-light); overflow: hidden;
}
.photo-preview.filled { border-style: solid; border-color: var(--admin-border); }
.photo-preview img { width: 100%; height: 100%; object-fit: cover; }
.photo-picker-actions { display: flex; align-items: center; gap: 0.5rem; }
.photo-choose-btn { position: relative; overflow: hidden; }
.photo-input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

.icon-picker { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.icon-option {
  width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px;
  border: 1.5px solid var(--admin-border-strong); background: var(--admin-surface); color: var(--admin-muted);
  cursor: pointer; transition: all 0.15s ease;
}
.icon-option:hover { border-color: var(--admin-blue); color: var(--admin-blue); }
.icon-option.active { background: var(--admin-blue-soft); border-color: var(--admin-blue); color: var(--admin-blue); }

.add-item-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.4rem; width: 100%; margin-top: 0.75rem;
  padding: 0.6rem; border-radius: 10px; border: 1.5px dashed var(--admin-border-strong); background: transparent;
  color: var(--admin-muted); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease;
}
.add-item-btn:hover { border-color: var(--admin-blue); color: var(--admin-blue); background: var(--admin-blue-soft); }
.add-section-btn-full { justify-content: center; border-style: dashed; }

.empty-sections { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 2rem 1rem; color: var(--admin-muted); text-align: center; }
.empty-sections p { font-size: 0.9rem; font-weight: 700; margin: 0; }

.save-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1rem;
  padding: 0.85rem 1.1rem; border: 1px solid var(--admin-border); border-radius: 12px; background: var(--admin-surface);
  box-shadow: var(--admin-shadow-lg); position: sticky; bottom: 1rem; z-index: 10;
}
.save-bar-left { display: flex; align-items: center; gap: 0.7rem; }
.save-bar-left strong { display: block; font-size: 0.85rem; font-weight: 700; color: var(--admin-contrast); }
.save-bar-left small { display: block; font-size: 0.72rem; font-weight: 700; color: var(--admin-muted); }
.save-dot-large { width: 10px; height: 10px; flex-shrink: 0; border-radius: 999px; background: var(--admin-blue); box-shadow: 0 0 0 5px color-mix(in srgb, var(--admin-blue) 18%, transparent); }
.save-dot-large.dirty { background: var(--admin-amber); box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15); }
.save-bar-right { display: flex; align-items: center; gap: 0.5rem; }

.preview-column {
  width: 340px; flex-shrink: 0; position: sticky; top: calc(60px + 1.25rem); align-self: flex-start;
  border: 1px solid var(--admin-border); border-radius: 12px; background: var(--admin-surface);
  box-shadow: var(--admin-shadow-lg); overflow: hidden; display: flex; flex-direction: column;
  max-height: calc(100vh - 60px - 2.5rem);
}
.preview-header { display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; border-bottom: 1px solid var(--admin-border); background: var(--admin-bg-deep); flex-shrink: 0; }
.preview-header-left { display: flex; align-items: center; gap: 0.45rem; font-size: 0.78rem; font-weight: 700; color: var(--admin-contrast); }
.preview-header-left svg { color: var(--admin-blue); }
.preview-content { flex: 1; min-height: 0; overflow-y: auto; padding: 1rem; display: grid; gap: 1.25rem; }
.preview-hero { display: grid; gap: 0.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--admin-border); }
.preview-eyebrow { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--admin-blue); }
.preview-headline { margin: 0; font-size: 1.05rem; font-weight: 700; color: var(--admin-contrast); line-height: 1.25; }
.preview-intro { margin: 0; font-size: 0.78rem; color: var(--admin-muted); line-height: 1.55; }
.preview-actions { display: flex; gap: 0.5rem; margin-top: 0.15rem; }
.preview-btn { display: inline-block; padding: 0.3rem 0.65rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; }
.preview-btn-primary { background: var(--admin-blue); color: #ffffff; }
.preview-btn-secondary { border: 1px solid var(--admin-border-strong); color: var(--admin-contrast); }
.preview-sections { display: grid; gap: 1rem; }
.preview-section { padding: 0.65rem; border-radius: 8px; }
.preview-section-heading { margin: 0 0 0.35rem; font-size: 0.82rem; font-weight: 700; color: var(--admin-contrast); }
.preview-section-body { margin: 0 0 0.5rem; font-size: 0.72rem; color: var(--admin-muted); line-height: 1.5; }
.preview-items { display: grid; gap: 0.35rem; }
.preview-item-card { padding: 0.45rem 0.55rem; border: 1px solid var(--admin-border); border-radius: 6px; background: var(--admin-surface-soft); }
.preview-item-card strong { display: block; font-size: 0.72rem; font-weight: 700; color: var(--admin-contrast); margin-bottom: 0.08rem; }
.preview-item-card span { font-size: 0.68rem; color: var(--admin-muted); }
.preview-item-simple { display: flex; align-items: baseline; gap: 0.4rem; font-size: 0.75rem; color: var(--admin-text); }
.preview-bullet { width: 4px; height: 4px; border-radius: 999px; background: var(--admin-muted-light); flex-shrink: 0; margin-top: 0.3em; }
.preview-footer { padding: 0.5rem 0.85rem; border-top: 1px solid var(--admin-border); font-size: 0.65rem; font-weight: 700; color: var(--admin-muted-light); text-align: center; flex-shrink: 0; }

.preview-slide-enter-active, .preview-slide-leave-active { transition: all 0.3s ease; }
.preview-slide-enter-from, .preview-slide-leave-to { opacity: 0; transform: translateX(20px); }

.preview-toggle-btn {
  position: fixed; right: 1.5rem; bottom: 5rem; width: 44px; height: 44px; display: grid; place-items: center;
  border: 1px solid var(--admin-border); border-radius: 12px; background: var(--admin-surface); color: var(--admin-muted);
  cursor: pointer; box-shadow: var(--admin-shadow-lg); z-index: 20; transition: all 0.2s ease;
}
.preview-toggle-btn:hover { color: var(--admin-blue); border-color: var(--admin-blue); box-shadow: var(--admin-shadow-xl); transform: translateY(-2px); }

/* ==============================
   RESPONSIVE
   ============================== */
@media (min-width: 900px) {
  .cp-view.sidebar-open { padding-left: 260px; }
}
@media (max-width: 1100px) {
  .content-grid { grid-template-columns: 1fr; }
  .content-side { position: static; }
  .preview-column { display: none; }
  .preview-toggle-btn { display: grid; }
}
@media (max-width: 900px) {
  .banner-stats { grid-template-columns: repeat(2, 1fr); }
  .links-grid { grid-template-columns: 1fr; }
  .highlights-grid { grid-template-columns: repeat(2, 1fr); }
  .editor-column { max-width: 100%; }
}
@media (max-width: 760px) {
  .dash-main { padding: 1rem; }
  .banner-content { flex-direction: column; }
  .banner-stats { grid-template-columns: 1fr; }
  .bstat { border-right: none; border-bottom: 1px solid var(--border); }
  .bstat:last-child { border-bottom: none; }
  .highlights-grid { grid-template-columns: 1fr; }
  .editor-header { flex-direction: column; align-items: flex-start; padding: 0.85rem; }
  .header-right { width: 100%; align-items: flex-start; }
  .header-actions { flex-wrap: wrap; }
  .btn { font-size: 0.78rem; padding: 0.35rem 0.6rem; min-height: 32px; }
  .form-grid { grid-template-columns: 1fr; }
  .save-bar { flex-direction: column; align-items: stretch; gap: 0.75rem; }
  .save-bar-right { justify-content: flex-end; }
  .preview-toggle-btn { right: 0.75rem; bottom: 3rem; }
  .item-card-footer { flex-wrap: wrap; }
  .section-toolbar-hint { order: 3; width: 100%; }
}
@media (max-width: 600px) {
  .banner-actions { width: 100%; }
  .banner-actions .db-btn { flex: 1; justify-content: center; }
}
@media (min-width: 1101px) {
  .preview-toggle-btn { display: none; }
}
</style>