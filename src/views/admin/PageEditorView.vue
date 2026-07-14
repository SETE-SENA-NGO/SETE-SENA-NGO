<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'

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
        body:
          'Santi Sena, the Peace Army, was founded by Cambodian Buddhist monks in 1994 to alleviate poverty and rebuild moral, environmental and economic life after decades of conflict.',
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
        body:
          'Vision: A Cambodia where peace, justice and harmony flourish. Mission: Alleviate poverty through community-led development rooted in Buddhist ethics. Goal: Better work and living situations for vulnerable rural households.',
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
    intro:
      'Progress built through patient partnership from founding in Svay Rieng to today.',
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

const requestedSlug = computed(() => {
  const slug = route.params.slug
  return typeof slug === 'string' ? slug : 'home'
})

const activePage = computed<PageDraft>(() => {
  return (
    drafts.value.find((page) => page.slug === requestedSlug.value) ??
    drafts.value[0] ??
    clonePage(defaultPages[0] as PageDraft)
  )
})

const activePageDirty = computed(() => isDirty(activePage.value.slug))

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
    const slugs = defaultPages.map((page) => page.slug)
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
}

function removeSection(index: number) {
  const section = activePage.value.sections[index]
  if (!section) return

  ui.openModal(
    'Remove content block?',
    `Remove "${section.label || section.heading || 'this section'}" from ${activePage.value.title}?`,
    () => {
      activePage.value.sections.splice(index, 1)
      ui.addToast('Content block removed.', 'warning')
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

</script>

<template>
  <div :class="['editor-page', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="main">
        <p v-if="notice" class="notice" :class="`notice-${notice.type}`" role="status">
          <span class="notice-icon" aria-hidden="true">{{ notice.type === 'success' ? '✓' : '!' }}</span>
          {{ notice.message }}
        </p>

        <section class="workspace">
          <section class="editor" aria-label="Page editor">
            <header class="editor-header">
              <div>
                <p class="eyebrow">{{ activePage.group }}</p>
                <h2>{{ activePage.title }}</h2>
                <p class="route-line">{{ activePage.route }}</p>
              </div>

              <div class="editor-actions">
                <button
                  class="button button-secondary"
                  type="button"
                  :disabled="loading"
                  @click="loadPages"
                >
                  <span class="btn-icon" aria-hidden="true">⟳</span>
                  Reload
                </button>
                <RouterLink
                  v-if="activePage.route !== 'global'"
                  class="button button-secondary"
                  :to="activePage.route"
                >
                  <span class="btn-icon" aria-hidden="true">👁</span>
                  View
                </RouterLink>
                <button
                  class="button button-secondary"
                  type="button"
                  @click="resetCurrentToDefault"
                >
                  <span class="btn-icon" aria-hidden="true">↺</span>
                  Reset
                </button>
                <button
                  class="button button-primary"
                  type="button"
                  :disabled="savingSlug === activePage.slug || loading"
                  @click="saveCurrentPage"
                >
                  <span class="btn-icon" aria-hidden="true">✓</span>
                  {{ savingSlug === activePage.slug ? 'Saving...' : 'Save page' }}
                </button>
              </div>
            </header>

            <div class="editor-workflow">
              <div class="editor-form-column">
                <div class="workflow-bar" aria-label="Content editing workflow">
                  <div class="workflow-step active">
                    <strong>1</strong>
                    <span>Page</span>
                  </div>
                  <div class="workflow-step active">
                    <strong>2</strong>
                    <span>Content</span>
                  </div>
                  <div class="workflow-step" :class="{ active: !activePageDirty }">
                    <strong>3</strong>
                    <span>{{ activePageDirty ? 'Unsaved' : 'Saved' }}</span>
                  </div>
                </div>

                <section class="form-panel">
                  <div class="panel-heading">
                    <div>
                      <p class="eyebrow">Page setup</p>
                      <h3>Identity</h3>
                    </div>
                    <span class="status-pill" :class="{ dirty: activePageDirty }">
                      {{ activePageDirty ? 'Unsaved' : 'Saved' }}
                    </span>
                  </div>

                  <div class="form-grid">
                    <label>
                      <span>Admin title</span>
                      <input v-model="activePage.title" name="page-title" />
                    </label>
                    <label>
                      <span>Slug</span>
                      <input :value="activePage.slug" name="page-slug" disabled />
                    </label>
                    <label>
                      <span>Route</span>
                      <input :value="activePage.route" name="page-route" disabled />
                    </label>
                    <label>
                      <span>Eyebrow</span>
                      <input v-model="activePage.eyebrow" name="page-eyebrow" />
                    </label>
                  </div>
                </section>

                <section class="form-panel">
                  <div class="panel-heading">
                    <div>
                      <p class="eyebrow">Hero</p>
                      <h3>Main page copy</h3>
                    </div>
                  </div>

                  <label class="field-block">
                    <span>Hero headline</span>
                    <textarea v-model="activePage.headline" name="page-headline" rows="2"></textarea>
                  </label>

                  <label class="field-block">
                    <span>Intro copy</span>
                    <textarea v-model="activePage.intro" name="page-intro" rows="4"></textarea>
                  </label>

                  <div class="form-grid">
                    <label>
                      <span>Primary action</span>
                      <input v-model="activePage.primaryAction" name="page-primary-action" />
                    </label>
                    <label>
                      <span>Secondary action</span>
                      <input v-model="activePage.secondaryAction" name="page-secondary-action" />
                    </label>
                  </div>
                </section>

                <section class="sections-editor form-panel" aria-label="Page sections">
                  <div class="section-toolbar">
                    <div>
                      <p class="eyebrow">Page sections</p>
                      <h3>{{ activePage.sections.length }} editable blocks</h3>
                    </div>
                    <button class="button button-secondary" type="button" @click="addSection">
                      <span class="btn-icon" aria-hidden="true">+</span>
                      Add section
                    </button>
                  </div>

                  <article
                    v-for="(section, index) in activePage.sections"
                    :id="`edit-${section.id}`"
                    :key="section.id"
                    class="content-section"
                  >
                    <details open>
                      <summary class="section-summary">
                        <span class="section-summary-index">{{ index + 1 }}</span>
                        <span class="section-summary-label">{{ section.label || 'Section' }}</span>
                        <small>{{ section.heading || 'No heading' }}</small>
                      </summary>

                      <div class="content-section-header">
                        <strong>{{ section.heading || section.label || 'Section block' }}</strong>
                        <div class="section-actions">
                          <button
                            type="button"
                            class="icon-button"
                            :disabled="index === 0"
                            aria-label="Move section up"
                            @click="moveSection(index, -1)"
                          >
                            Up
                          </button>
                          <button
                            type="button"
                            class="icon-button"
                            :disabled="index === activePage.sections.length - 1"
                            aria-label="Move section down"
                            @click="moveSection(index, 1)"
                          >
                            Down
                          </button>
                          <button
                            type="button"
                            class="icon-button"
                            @click="duplicateSection(index)"
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            class="icon-button danger"
                            @click="removeSection(index)"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div class="form-grid">
                        <label>
                          <span>Block label</span>
                          <input v-model="section.label" :name="`section-${section.id}-label`" />
                        </label>
                        <label>
                          <span>Heading</span>
                          <input v-model="section.heading" :name="`section-${section.id}-heading`" />
                        </label>
                      </div>

                      <label class="field-block">
                        <span>Body</span>
                        <textarea v-model="section.body" :name="`section-${section.id}-body`" rows="4"></textarea>
                      </label>

                      <label class="field-block">
                        <span>Items</span>
                        <textarea
                          v-model="section.items"
                          :name="`section-${section.id}-items`"
                          rows="5"
                          placeholder="One item per line. Use Title | Detail for paired content."
                        ></textarea>
                      </label>
                    </details>
                  </article>
                </section>

                <div class="editor-save-bar">
                  <div class="save-state">
                    <span class="save-dot" :class="{ dirty: activePageDirty }"></span>
                    <div>
                      <strong>{{ activePageDirty ? 'Unsaved changes' : 'Saved' }}</strong>
                      <small>{{ formatDate(activePage.updatedAt) }}</small>
                    </div>
                  </div>
                  <div class="save-bar-actions">
                    <button
                      class="button button-secondary"
                      type="button"
                      @click="resetCurrentToDefault"
                    >
                      Reset
                    </button>
                    <button
                      class="button button-primary"
                      type="button"
                      :disabled="savingSlug === activePage.slug || loading"
                      @click="saveCurrentPage"
                    >
                      {{ savingSlug === activePage.slug ? 'Saving...' : 'Save page' }}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.editor-page {
  --admin-bg: var(--admin-theme-bg);
  --admin-bg-deep: var(--admin-theme-bg-deep);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-contrast-soft: var(--admin-theme-contrast-soft);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-blue: var(--admin-theme-primary);
  --admin-blue-deep: var(--admin-theme-primary-deep);
  --admin-pink: var(--admin-theme-danger);
  --admin-violet: var(--admin-theme-teal);
  --admin-gold: var(--admin-theme-gold);
  --admin-green: var(--admin-theme-primary);
  --admin-gold-soft: color-mix(in srgb, var(--admin-gold) 14%, var(--admin-surface));
  --admin-shadow: var(--admin-theme-shadow);
  --panel: var(--admin-surface);
  --border: var(--admin-border);
  --text: var(--admin-text);
  --muted: var(--admin-muted);

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--admin-bg);
  color: var(--admin-text);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: padding-left 0.25s ease;
}

:global(.admin-dark .editor-page) {
  --admin-bg: var(--admin-theme-bg);
  --admin-bg-deep: var(--admin-theme-bg-deep);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-contrast-soft: var(--admin-theme-contrast-soft);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-gold-soft: color-mix(in srgb, var(--admin-gold) 18%, var(--admin-surface));
  --admin-shadow: var(--admin-theme-shadow);
}

.admin-layout {
  display: flex;
  flex: 1;
  background: var(--admin-bg);
}

.main {
  flex: 1;
  width: 100%;
  padding: 1.5rem 2.25rem 2.5rem;
  background: var(--admin-bg);
}

.workspace {
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  overflow: hidden;
}

.eyebrow {
  margin: 0 0 0.5rem;
  color: var(--admin-blue-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h2 {
  margin-bottom: 0.35rem;
  color: var(--admin-contrast);
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

h3 {
  margin-bottom: 0;
  color: var(--admin-contrast);
  font-size: 1.08rem;
  font-weight: 700;
}

.editor {
  min-width: 0;
  padding: 1.75rem;
  background: var(--admin-surface);
}

.editor-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
  margin: -1.75rem -1.75rem 1.5rem;
  padding: 1.75rem;
  border-bottom: 1px solid var(--admin-border);
  background: linear-gradient(180deg, var(--admin-surface-soft), var(--admin-surface));
}

.route-line {
  margin-bottom: 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--admin-muted);
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
}

.editor-actions,
.section-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.button,
.icon-button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: 10px;
  padding: 0.65rem 1.1rem;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease;
}

.btn-icon {
  font-size: 0.95em;
  line-height: 1;
}

.button:hover,
.icon-button:hover {
  transform: translateY(-1px);
}

.button:active,
.icon-button:active {
  transform: translateY(0);
}

.button:disabled,
.icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
}

.button-primary {
  border: 1px solid var(--admin-blue);
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(15, 125, 56, 0.28);
}

.button-primary:hover {
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
  border-color: var(--admin-blue-deep);
}

.button-secondary,
.icon-button {
  border: 1px solid var(--admin-border-strong);
  background: var(--admin-surface);
  color: var(--admin-contrast-soft);
}

.button-secondary:hover,
.icon-button:hover {
  border-color: var(--admin-blue);
  background: var(--admin-surface-soft);
  color: var(--admin-blue-deep);
  box-shadow: 0 8px 18px rgba(16, 88, 51, 0.1);
}

.icon-button {
  min-height: 36px;
  padding: 0.45rem 0.75rem;
  font-size: 0.8rem;
}

.icon-button.danger {
  border-color: rgba(220, 38, 38, 0.28);
  color: #b91c1c;
}

.icon-button.danger:hover {
  background: #fff5f5;
  border-color: #dc2626;
  color: #dc2626;
}

.notice {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 1.1rem;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  padding: 0.9rem 1.1rem;
  font-weight: 700;
}

.notice-icon {
  display: inline-grid;
  place-items: center;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 999px;
  font-size: 0.85rem;
  flex: 0 0 auto;
}

.notice-success {
  border-color: rgba(21, 128, 61, 0.3);
  background: var(--admin-surface-soft);
  color: var(--admin-blue-deep);
}

.notice-success .notice-icon {
  background: var(--admin-blue);
  color: #ffffff;
}

.notice-error {
  border-color: rgba(185, 28, 28, 0.28);
  background: #fef2f2;
  color: #991b1b;
}

.notice-error .notice-icon {
  background: #dc2626;
  color: #ffffff;
}

.editor-workflow,
.editor-form-column {
  min-width: 0;
}

.workflow-bar {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}

.workflow-step {
  min-height: 66px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface-soft);
  color: var(--admin-muted);
  padding: 0.75rem 0.9rem;
  font-weight: 700;
}

.workflow-step strong {
  width: 2.1rem;
  height: 2.1rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid var(--admin-border-strong);
  color: var(--admin-muted);
  font-weight: 800;
}

.workflow-step.active {
  border-color: rgba(22, 163, 74, 0.35);
  background: var(--admin-surface-soft);
  color: var(--admin-contrast);
}

.workflow-step.active strong {
  background: var(--admin-blue);
  border-color: var(--admin-blue);
  color: #ffffff;
}

.form-panel,
.editor-save-bar {
  border: 1px solid var(--admin-border);
  border-radius: 14px;
  background: var(--admin-surface);
}

.form-panel {
  margin-top: 1.25rem;
  padding: 1.35rem;
}

.workflow-bar + .form-panel {
  margin-top: 0;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.1rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--admin-border);
}

.panel-heading h3,
.panel-heading p {
  margin: 0;
}

.status-pill {
  border-radius: 999px;
  background: var(--admin-surface-soft);
  color: #166534;
  padding: 0.32rem 0.75rem;
  font-size: 0.76rem;
  font-weight: 800;
  border: 1px solid rgba(22, 163, 74, 0.25);
}

.status-pill.dirty {
  background: var(--admin-gold-soft);
  color: #92660a;
  border-color: rgba(202, 138, 4, 0.3);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.1rem;
}

label,
.field-block {
  display: grid;
  gap: 0.5rem;
}

label {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--admin-contrast-soft);
}

.field-block {
  margin-top: 1.1rem;
}

input,
textarea {
  width: 100%;
  border: 1.5px solid var(--admin-border-strong);
  border-radius: 10px;
  background: var(--admin-surface);
  color: var(--admin-text);
  padding: 0.78rem 0.9rem;
  line-height: 1.5;
  font-size: 0.95rem;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

textarea {
  resize: vertical;
}

input:focus,
textarea:focus {
  border-color: var(--admin-blue);
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.15);
  outline: none;
}

input:disabled {
  background: var(--admin-bg-deep);
  color: var(--admin-muted);
  cursor: not-allowed;
}

.section-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--admin-border);
  margin-bottom: 0;
}

.content-section {
  margin-top: 1.1rem;
  padding: 0;
  background: var(--admin-surface-soft);
  box-shadow: none;
  overflow: hidden;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
}

.section-summary {
  min-height: 62px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.85rem;
  border-bottom: 1px solid var(--admin-border);
  background: var(--admin-surface);
  color: var(--admin-contrast);
  padding: 0.9rem 1.1rem;
  cursor: pointer;
  list-style: none;
  font-weight: 700;
}

.section-summary-index {
  display: inline-grid;
  place-items: center;
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 999px;
  background: var(--admin-surface-soft);
  color: var(--admin-blue-deep);
  font-size: 0.82rem;
  font-weight: 800;
  border: 1px solid rgba(22, 163, 74, 0.25);
}

.section-summary-label {
  font-weight: 700;
}

.section-summary small {
  color: var(--admin-muted);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-summary::-webkit-details-marker {
  display: none;
}

.section-summary::after {
  width: 0.5rem;
  height: 0.5rem;
  border-right: 2px solid var(--admin-blue);
  border-bottom: 2px solid var(--admin-blue);
  transform: rotate(45deg);
  transition: transform 0.18s ease;
  content: '';
  justify-self: end;
}

.content-section details[open] .section-summary::after {
  transform: rotate(225deg);
}

.content-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-inline: 1.1rem;
  margin-top: 1.1rem;
  margin-bottom: 1.1rem;
}

.content-section details > .form-grid,
.content-section details > .field-block {
  margin-inline: 1.1rem;
}

.content-section details > .form-grid {
  margin-bottom: 1.1rem;
}

.content-section details > .field-block:last-child {
  margin-bottom: 1.1rem;
}

.editor-save-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
  padding: 0.95rem 1.1rem;
  box-shadow: 0 16px 36px rgba(16, 88, 51, 0.14);
  position: sticky;
  bottom: 1rem;
  z-index: 4;
  border-color: var(--admin-border-strong);
}

.save-state,
.save-bar-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.save-dot {
  width: 0.85rem;
  height: 0.85rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--admin-blue);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--admin-blue) 18%, transparent);
}

.save-dot.dirty {
  background: var(--admin-gold);
  box-shadow: 0 0 0 5px rgba(202, 138, 4, 0.16);
}

.save-state strong {
  display: block;
  color: var(--admin-contrast);
  font-weight: 800;
}

.save-state small {
  display: block;
  color: var(--admin-muted);
  font-size: 0.78rem;
  font-weight: 600;
}

@media (min-width: 900px) {
  .editor-page.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 760px) {
  .main {
    padding: 1rem;
  }

  .editor-header {
    flex-direction: column;
  }

  .editor,
  .editor-header {
    padding: 1.1rem;
  }

  .editor-header {
    margin: -1.1rem -1.1rem 1.1rem;
  }

  .editor-actions,
  .section-actions {
    flex-direction: column;
  }

  .button {
    width: 100%;
  }

  .workflow-bar,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .editor-save-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
