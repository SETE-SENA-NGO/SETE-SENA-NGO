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
  image?: string
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
          '293 | Villages served | Across 43 communes in southeastern Cambodia.\n570+ | Hectares of forest | Managed through community forestry and nurseries.\n120+ | Full-time staff | Experts in management, agriculture and rural development.\n15+ | International partners | Including UNDP, ADB and Oxfam.\n32 | Years of service | Founded in 1994; still walking beside villages.\n4 | Strategic pillars | Environment, education, livelihoods and child protection.',
      },
      {
        id: 'impact-timeline',
        label: 'Timeline',
        heading: 'A journey rooted in patience.',
        body: 'Milestones shown on the Impact page.',
        items:
          '1994 | Founding | Santi Sena is established to support rural communities with practical development programs.\n2002 | First community forestry | The organisation expands its work around forest stewardship and local ownership.\n2008 | Saving-for-Change | Household savings groups begin to strengthen financial resilience and local entrepreneurship.\n2014 | 20-year horizon | Programs deepen across education, livelihoods and environmental protection.\n2024 | Today | The organisation continues to support resilient, community-led change at scale.',
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
        label: 'Overview Map Stats',
        heading: 'Our Areas of Operation',
        body: 'Since 1994, our programs have maintained a continuous field presence, working closely with rural communities across three provinces to create sustainable impact.',
        items:
          '293 | Villages | Across 43 communes in three provinces.\n43 | Communes | Svay Rieng, Prey Veng and Kratie.\n3 | Provinces | Continuous field presence since 1994.',
      },
      {
        id: 'numbers-card-environment',
        label: 'Environment Flip Card',
        heading: 'Environment',
        body: 'Community-led conservation that protects biodiversity and builds climate resilience.',
        items:
          '570+ | Hectares | Community forest protected and restored.\n50k+ | Saplings | Grown yearly in village nurseries.\n300+ | Biogas units | Installed in rural kitchens.',
      },
      {
        id: 'numbers-card-education',
        label: 'Education Flip Card',
        heading: 'Education',
        body: 'Early childhood education and lifelong learning opportunities for every child.',
        items:
          '120+ | Pre-school children | Enrolled each year.\n8 | Mobile libraries | Reaching remote villages.\n60+ | Annual scholarships | For the poorest students.',
      },
      {
        id: 'numbers-card-livelihoods',
        label: 'Livelihoods Flip Card',
        heading: 'Livelihoods & Child Protection',
        body: 'Economic empowerment and child safeguarding go hand in hand.',
        items:
          '2,400+ | SfC members | Saving and lending together.\n12 | Cooperatives | Rice, vegetables and enterprise.\n600+ | Peer educators | Trained in child rights.',
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
        id: 'timeline-stats',
        label: 'Hero Reach Stats',
        heading: 'Key Reach Numbers',
        body: 'The key reach numbers shown at the top of the Timeline page.',
        items: '293 | Villages\n43 | Communes\n3 | Provinces',
      },
      {
        id: 'timeline-events',
        label: 'Timeline Events',
        heading: 'Progress built through patient partnership.',
        body: 'Timeline milestones showing thirty years of growth.',
        items:
          '2024 | 30-Year Strategic Plan | New five-year strategy to deepen quality, diversify funding and invest in youth leadership. | The plan prioritises three pillars: (1) expanding community-led education programmes, (2) strengthening child protection systems, and (3) launching a dedicated youth innovation fund. Over 50 community dialogues were held to co‑design the strategy.\n2022 | Melaleuca Oil Enterprise | Village forest guardians launch a rural enterprise from non-timber forest products. | With technical support from Santi Sena, 12 village cooperatives now sustainably harvest melaleuca leaves, producing essential oils sold locally and exported. The enterprise provides income for 200 families while preserving the forest.\n2020 | COVID-19 Response | Emergency food, hygiene and remote-learning kits reach more than 200 villages. | In partnership with local authorities, we distributed 3,500 food packs, 5,000 hygiene kits, and 2,000 radio‑based learning materials to keep children learning despite school closures.\n2018 | Child Protection Networks | CPNs become active across 43 communes with 24/7 referral pathways. | Each network includes trained volunteers, social workers, and local police. They have handled over 1,200 cases, ensuring vulnerable children receive immediate care and legal support.\n2014 | 20th Anniversary | Kratie office opens. Programs extend to a third province and staff grows past 30 full-time. | The expansion to Kratie brought our integrated approach to another province, reaching an additional 80 villages. We also launched our first youth leadership camp that year.\n2011 | Biogas program launched | Household biogas units begin replacing firewood in remote kitchens. | By 2015, we had installed over 400 biogas units, reducing deforestation and improving indoor air quality. The program also trains local technicians to maintain the systems.\n2007 | Expansion to Prey Veng | Education and child protection programming reaches a second province. | We partnered with the provincial government to replicate the Svay Rieng model, focusing on school enrolment and community‑based child protection committees.\n2003 | Saving-for-Change begins | First women-led savings circles launched in Svay Rieng; the model becomes a program backbone. | Today, over 500 savings groups exist, with more than 12,000 members. The groups provide micro‑loans and financial literacy training, empowering women to start small businesses.\n1998 | First community forestry site | Village committees take legal stewardship of 120 hectares of degraded forest. | The site has since become a model for community‑led reforestation, with over 50,000 trees planted and a thriving biodiversity corridor. It now serves as a learning hub for other villages.\n1994 | Founded in Svay Rieng | Buddhist monks and community elders establish the Peace Army after the war, focused on moral regeneration and rural recovery. | The founding team began with just five monks and a handful of volunteers. Their first project was rebuilding a primary school destroyed during the conflict, which became the spark for decades of community development.',
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
        label: 'Supporters logos',
        heading: 'Partners & Supporters',
        body: 'These organizations and institutions make our work possible through funding, technical expertise, and shared commitment to sustainable development.',
        items: 'UNDP\nAsian Development Bank\nOxfam\nBread for the World\nMisereor\nEuropean Union\nUSAID / Winrock\nDiakonia\nHeinrich Böll Stiftung\nCaritas',
      },
      {
        id: 'partners-government',
        label: 'Government Relations',
        heading: 'Government Coordination',
        body: 'We work hand-in-hand with national and provincial government bodies to align our programs with Cambodia\'s development priorities.',
        items:
          'Ministry of Interior | Policy, registration, and governance. | building\nMinistry of Environment | Community forestry, nursery support, and conservation. | tree\nMinistry of Women\'s Affairs | Child protection, gender equity, and safe migration. | users\nMinistry of Education, Youth and Sport | Pre-schools, mobile libraries, and youth learning. | book\nProvincial Departments | Field-level coordination in Svay Rieng, Prey Veng, and Kratie. | map-pin',
      },
      {
        id: 'partners-local',
        label: 'Local partners list',
        heading: 'Local Partners',
        body: 'Sustainable change is built from the ground up. These local institutions and networks are the backbone of every program we run.',
        items:
          '01 | Pagoda & Monastic Networks | Buddhist monks act as community guides and project facilitators.\n02 | Commune Councils & Child Rights | Local authorities coordinate child protection networks in 43 communes.\n03 | NGO Forum & Working Groups | Collaborative platforms for advocacy and knowledge sharing at the national level.',
      },
      {
        id: 'partners-why',
        label: 'Why partners stay list',
        heading: 'Why Partners Stay',
        body: 'Long-term partnerships don\'t happen by chance. Here\'s what keeps our partners committed year after year.',
        items:
          '30 Years of Presence | Founded in 1994, our deep roots in villages ensure long-term stability. | building\nAudited Financial Systems | External annual audits guarantee complete transparency and stewardship of funds. | bar-chart\nDeep Community Trust | Decades of relationship-building mean villages lead their own growth. | handshake\nProven Ability to Scale | A structures network of field offices lets us scale programs efficiently. | rocket',
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
  {
    slug: 'news',
    route: '/news',
    group: 'News',
    title: 'News',
    eyebrow: 'News & Updates',
    headline: 'Announcements, stories and updates from the field.',
    intro: 'Keep up to date with Santi Sena\'s work in community development, environment and education.',
    primaryAction: '',
    secondaryAction: '',
    sections: [],
    updatedAt: '',
  },
  {
    slug: 'news-detail',
    route: '/news/:slug',
    group: 'News',
    title: 'News Detail',
    eyebrow: 'Article',
    headline: 'News Article Title Placeholder',
    intro: 'News Article Introduction Summary Placeholder',
    primaryAction: '',
    secondaryAction: '',
    sections: [],
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

// ─── Visual Table Editor Helpers ─────────────────────────────────
const showRawItems = ref<Record<string, boolean>>({})

function toggleRawItems(sectionId: string) {
  showRawItems.value[sectionId] = !showRawItems.value[sectionId]
}

function parseItemsToRows(itemsStr: string): string[][] {
  if (!itemsStr) return [[]]
  return itemsStr.split('\n').map(line => line.split('|').map(s => s.trim()))
}

function rowsToItemsStr(rows: string[][]): string {
  return rows.map(cols => cols.join(' | ')).join('\n')
}

function updateItemValue(section: EditableSection, rowIndex: number, colIndex: number, value: string) {
  const rows = parseItemsToRows(section.items)
  const row = rows[rowIndex]
  if (!row) return
  
  // Make sure row has enough columns
  while (row.length <= colIndex) {
    row.push('')
  }
  
  // Clean pipes to avoid breaking structure
  row[colIndex] = value.replace(/\|/g, '').trim()
  section.items = rowsToItemsStr(rows)
}

function addRow(section: EditableSection, numCols: number) {
  const rows = section.items ? parseItemsToRows(section.items) : []
  rows.push(Array(numCols).fill(''))
  section.items = rowsToItemsStr(rows)
}

function deleteRow(section: EditableSection, rowIndex: number) {
  const rows = parseItemsToRows(section.items)
  rows.splice(rowIndex, 1)
  section.items = rowsToItemsStr(rows)
}

function moveRow(section: EditableSection, rowIndex: number, direction: -1 | 1) {
  const rows = parseItemsToRows(section.items)
  const targetIndex = rowIndex + direction
  const temp = rows[rowIndex]
  const target = rows[targetIndex]
  if (!temp || !target) return
  rows[rowIndex] = target
  rows[targetIndex] = temp
  section.items = rowsToItemsStr(rows)
}

function getSectionColCount(section: EditableSection): number {
  const headers = getColumnHeaders(section.id, 99)
  const firstHeader = headers[0]
  if (headers && headers.length > 0 && firstHeader && !firstHeader.startsWith('Column ')) {
    return headers.length
  }
  const rows = parseItemsToRows(section.items)
  let maxCols = 1
  for (const row of rows) {
    if (row.length > maxCols) maxCols = row.length
  }
  return Math.max(1, maxCols)
}

function getColumnHeaders(sectionId: string, maxCols: number): string[] {
  const headersMap: Record<string, string[]> = {
    'impact-stats': ['Value', 'Label', 'Description'],
    'timeline-stats': ['Number / Value', 'Label'],
    'timeline-events': ['Year', 'Title', 'Short Description', 'Detailed Info', 'Image URL (optional)'],
    'numbers-overview': ['Value', 'Label', 'Description'],
    'numbers-card-environment': ['Value', 'Label', 'Description'],
    'numbers-card-education': ['Value', 'Label', 'Description'],
    'numbers-card-livelihoods': ['Value', 'Label', 'Description'],
    'partners-supporters': ['Partner Name', 'Logo Image URL (optional)'],
    'partners-government': ['Ministry / Department', 'Description', 'Icon Name (building/tree/users/book/map-pin)'],
    'partners-local': ['Number / ID', 'Title', 'Description'],
    'partners-why': ['Title / Highlight', 'Description', 'Icon Name (building/bar-chart/handshake/rocket)'],
    'donate-support': ['Stat / Title', 'Description'],
    'donate-areas': ['Program Area'],
    'donate-contact': ['Contact Info'],
    'volunteer-pathways': ['Pathway Description'],
    'volunteer-skills': ['Skill Name'],
    'volunteer-steps': ['Step Title'],
    'partner-practice': ['Practice Title'],
    'partner-areas': ['Area Name'],
    'partner-commitments': ['Commitment Details'],
    'contact-offices': ['Office Type', 'Contact Info / Address'],
    'contact-form': ['Field Label'],
    'head-office-contact': ['Type', 'Contact Details'],
    'head-office-travel': ['Travel Note'],
    'head-office-guidance': ['Visitor Guidance'],
    'field-offices-list': ['Office Name', 'Location', 'Email', 'Phone / Extra'],
    'field-offices-visits': ['Visits Guidance'],
    'field-offices-hours': ['Hours Details'],
    'qr-methods': ['Bank Name', 'Bank Subtitle', 'Account Name', 'Account Number', 'Currencies'],
    'qr-notice': ['Notice Text'],
  }
  
  const headers = headersMap[sectionId]
  if (headers) return headers.slice(0, maxCols)
  
  return Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`)
}


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
  return `${count} block${count !== 1 ? 's' : ''}`
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
    image: section?.image || '',
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

function sortOrderForPage(page: PageDraft) {
  const index = defaultPages.findIndex((item) => item.slug === page.slug)
  return index === -1 ? 0 : index + 1
}

function ctaUrlForPage(page: PageDraft, actionIndex: 0 | 1) {
  const label = actionIndex === 0 ? page.primaryAction : page.secondaryAction
  if (!label.trim()) return null

  if (actionIndex === 1) {
    return page.group === 'Get Involved' ? '/get-involved' : '/'
  }

  if (page.group === 'Programs') return '/programs'
  if (page.group === 'Get Involved') return '/get-involved'
  if (page.slug === 'qr-donate') return '/qr-donate'
  return '/contact'
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
      image: getString(section, 'image'),
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
    route_path: page.route,
    nav_group: page.group,
    locale: 'en',
    template: page.route === 'global' ? 'global' : 'standard',
    status: 'published',
    hero_eyebrow: page.eyebrow.trim() || null,
    hero_headline: page.headline.trim() || null,
    hero_intro: page.intro.trim() || null,
    primary_cta_label: page.primaryAction.trim() || null,
    primary_cta_url: ctaUrlForPage(page, 0),
    secondary_cta_label: page.secondaryAction.trim() || null,
    secondary_cta_url: ctaUrlForPage(page, 1),
    seo_title: page.title.trim() || page.headline.trim() || page.slug,
    seo_description: page.intro.trim() || null,
    sort_order: sortOrderForPage(page),
    published_at: savedAt,
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
    'Remove content block?',
    `Remove "${section.label || section.heading || 'this section'}" from ${activePage.value.title}?`,
    () => {
      activePage.value.sections.splice(index, 1)
      if (activeSectionIndex.value === index) activeSectionIndex.value = null
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

function setActiveSectionFromToggle(event: Event, index: number) {
  const details = event.currentTarget instanceof HTMLDetailsElement ? event.currentTarget : null
  activeSectionIndex.value = details?.open ? index : null
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
        <!-- Toast notice -->
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
          <!-- Editor Column -->
          <section class="editor-column" aria-label="Page editor">
            <!-- Page Header -->
            <header class="editor-header">
              <div class="header-left">
                <div class="breadcrumb">
                  <RouterLink to="/admin" class="breadcrumb-link">Dashboard</RouterLink>
                  <span class="breadcrumb-sep" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </span>
                  <span class="breadcrumb-current">{{ activePage.group }}</span>
                  <span class="breadcrumb-sep" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </span>
                  <span class="breadcrumb-current">{{ activePage.title }}</span>
                </div>
                <div class="page-meta">
                  <span class="meta-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {{ formatDate(activePage.updatedAt) }}
                  </span>
                  <span v-if="activePage.route !== 'global'" class="meta-badge route-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    {{ activePage.route }}
                  </span>
                </div>
              </div>
              <div class="header-right">
                <div class="save-indicator" :class="{ dirty: activePageDirty }">
                  <span class="save-dot"></span>
                  <span class="save-label">{{ activePageDirty ? 'Unsaved changes' : 'Saved' }}</span>
                </div>
                <div class="header-actions">
                  <button
                    class="btn btn-ghost"
                    type="button"
                    :disabled="loading"
                    @click="loadPages"
                    title="Reload from database"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    Reload
                  </button>
                  <RouterLink
                    v-if="activePage.route !== 'global'"
                    class="btn btn-ghost"
                    :to="activePage.route"
                    title="View public page"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    Preview
                  </RouterLink>
                  <button
                    class="btn btn-ghost danger"
                    type="button"
                    @click="resetCurrentToDefault"
                    title="Reset to default content"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                    Reset
                  </button>
                  <button
                    class="btn btn-primary"
                    type="button"
                    :disabled="savingSlug === activePage.slug || loading"
                    @click="saveCurrentPage"
                  >
                    <svg v-if="savingSlug === activePage.slug" class="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                    <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    {{ savingSlug === activePage.slug ? 'Saving...' : 'Save page' }}
                  </button>
                </div>
              </div>
            </header>

            <!-- Status bar -->
            <div class="status-bar">
              <div class="status-left">
                <span class="status-bullet" :class="{ dirty: activePageDirty }"></span>
                <span class="status-text">{{ activePageDirty ? 'Unsaved changes' : 'All changes saved' }}</span>
              </div>
              <span class="status-right">{{ sectionCountLabel }} · {{ activePage.slug }}</span>
            </div>

            <!-- Workflow Steps -->
            <div class="workflow-steps">
              <div class="step active completed">
                <div class="step-indicator">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div class="step-content">
                  <span class="step-label">Page</span>
                  <span class="step-desc">Identity</span>
                </div>
              </div>
              <div class="step active">
                <div class="step-indicator">2</div>
                <div class="step-content">
                  <span class="step-label">Content</span>
                  <span class="step-desc">Blocks</span>
                </div>
              </div>
              <div class="step" :class="{ active: !activePageDirty }">
                <div class="step-indicator" :class="{ success: !activePageDirty }">
                  <svg v-if="!activePageDirty" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <template v-else>3</template>
                </div>
                <div class="step-content">
                  <span class="step-label">{{ activePageDirty ? 'Unsaved' : 'Published' }}</span>
                  <span class="step-desc">Status</span>
                </div>
              </div>
            </div>

            <!-- Form Panels -->
            <div class="form-panels">
              <!-- Page Setup -->
              <section class="form-card">
                <div class="card-header">
                  <div class="card-header-left">
                    <div class="card-icon card-icon-blue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <div>
                      <span class="card-eyebrow">Page setup</span>
                      <h3 class="card-title">Identity</h3>
                    </div>
                  </div>
                  <span class="status-pill" :class="{ dirty: activePageDirty }">
                    {{ activePageDirty ? 'Unsaved' : 'Saved' }}
                  </span>
                </div>
                <div class="card-body">
                  <div class="form-grid">
                    <label class="field">
                      <span class="field-label">Admin title</span>
                      <input v-model="activePage.title" name="page-title" placeholder="Page title" />
                    </label>
                    <label class="field">
                      <span class="field-label">Slug</span>
                      <input :value="activePage.slug" name="page-slug" disabled />
                    </label>
                    <label class="field">
                      <span class="field-label">Route</span>
                      <input :value="activePage.route" name="page-route" disabled />
                    </label>
                    <label class="field">
                      <span class="field-label">Eyebrow</span>
                      <input v-model="activePage.eyebrow" name="page-eyebrow" placeholder="Section eyebrow text" />
                    </label>
                  </div>
                </div>
              </section>

              <!-- Hero Content -->
              <section class="form-card">
                <div class="card-header">
                  <div class="card-header-left">
                    <div class="card-icon card-icon-violet">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </div>
                    <div>
                      <span class="card-eyebrow">Hero</span>
                      <h3 class="card-title">Main page copy</h3>
                    </div>
                  </div>
                </div>
                <div class="card-body">
                  <label class="field field-block">
                    <span class="field-label">Hero headline</span>
                    <textarea v-model="activePage.headline" name="page-headline" rows="2" placeholder="The main headline for this page"></textarea>
                  </label>
                  <label class="field field-block">
                    <span class="field-label">Intro copy</span>
                    <textarea v-model="activePage.intro" name="page-intro" rows="4" placeholder="Introduction paragraph for the page"></textarea>
                  </label>
                  <div class="form-grid">
                    <label class="field">
                      <span class="field-label">Primary action</span>
                      <input v-model="activePage.primaryAction" name="page-primary-action" placeholder="e.g. Support Us" />
                    </label>
                    <label class="field">
                      <span class="field-label">Secondary action</span>
                      <input v-model="activePage.secondaryAction" name="page-secondary-action" placeholder="e.g. Learn More" />
                    </label>
                  </div>
                </div>
              </section>

              <!-- Page Sections -->
              <section class="form-card sections-card" aria-label="Page sections">
                <div class="card-header">
                  <div class="card-header-left">
                    <div class="card-icon card-icon-amber">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    </div>
                    <div>
                      <span class="card-eyebrow">Content blocks</span>
                      <h3 class="card-title">{{ sectionCountLabel }}</h3>
                    </div>
                  </div>
                  <button class="btn btn-secondary add-section-btn" type="button" @click="addSection">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add block
                  </button>
                </div>

                <div class="card-body sections-body">
                  <TransitionGroup name="section-list" tag="div" class="sections-list">
                    <article
                      v-for="(section, index) in activePage.sections"
                      :id="`edit-${section.id}`"
                      :key="section.id"
                      class="section-block"
                      :class="{ 'section-active': activeSectionIndex === index }"
                    >
                      <details open @toggle="setActiveSectionFromToggle($event, index)">
                        <summary class="section-summary">
                          <div class="summary-drag">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                          </div>
                          <div class="summary-content">
                            <span class="summary-index">{{ index + 1 }}</span>
                            <div class="summary-text">
                              <strong>{{ section.label || 'Untitled block' }}</strong>
                              <small v-if="section.heading">{{ section.heading }}</small>
                              <small v-else class="empty-hint">No heading</small>
                            </div>
                          </div>
                          <div class="summary-badge">
                            {{ section.items ? `${section.items.split('\n').length} items` : 'Text' }}
                          </div>
                        </summary>

                        <div class="section-body">
                          <div class="section-toolbar">
                            <div class="section-tabs">
                              <span class="section-tab active">Content</span>
                            </div>
                            <div class="section-actions">
                              <button
                                type="button"
                                class="btn-icon"
                                :disabled="index === 0"
                                aria-label="Move section up"
                                title="Move up"
                                @click.stop="moveSection(index, -1)"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                              </button>
                              <button
                                type="button"
                                class="btn-icon"
                                :disabled="index === activePage.sections.length - 1"
                                aria-label="Move section down"
                                title="Move down"
                                @click.stop="moveSection(index, 1)"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                              </button>
                              <div class="btn-sep"></div>
                              <button
                                type="button"
                                class="btn-icon"
                                aria-label="Duplicate section"
                                title="Duplicate"
                                @click.stop="duplicateSection(index)"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                              </button>
                              <button
                                type="button"
                                class="btn-icon danger"
                                aria-label="Remove section"
                                title="Remove"
                                @click.stop="removeSection(index)"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                              </button>
                            </div>
                          </div>

                          <div class="section-fields">
                            <div class="form-grid">
                              <label class="field">
                                <span class="field-label">Block label</span>
                                <input v-model="section.label" :name="`section-${section.id}-label`" placeholder="e.g. Mission, Stats" />
                              </label>
                              <label class="field">
                                <span class="field-label">Heading</span>
                                <input v-model="section.heading" :name="`section-${section.id}-heading`" placeholder="Section heading" />
                              </label>
                            </div>

                            <label class="field field-block">
                              <span class="field-label">Body</span>
                              <textarea v-model="section.body" :name="`section-${section.id}-body`" rows="3" placeholder="Descriptive body text"></textarea>
                            </label>

                            <div class="items-editor-container">
                              <!-- Impact Group Pages: Structured Visual Table Editor -->
                              <template v-if="activePage.group === 'Impact'">
                                <div class="items-editor-header">
                                  <span class="field-label">
                                    Items (Structured list)
                                    <span class="field-hint" v-if="!showRawItems[section.id]">
                                      Fill in the fields below. Row order maps to public order.
                                    </span>
                                    <span class="field-hint" v-else>
                                      Edit raw list. Use <code>|</code> to separate columns.
                                    </span>
                                  </span>
                                  <button 
                                    type="button" 
                                    class="toggle-raw-btn" 
                                    @click="toggleRawItems(section.id)"
                                  >
                                    {{ showRawItems[section.id] ? 'Visual Table' : 'Raw Text' }}
                                  </button>
                                </div>

                                <!-- Raw Textarea Mode -->
                                <textarea
                                  v-if="showRawItems[section.id]"
                                  v-model="section.items"
                                  :name="`section-${section.id}-items`"
                                  rows="8"
                                  placeholder="Item 1&#10;Item 2&#10;Title | Description"
                                ></textarea>

                                <!-- Visual Table Mode -->
                                <div v-else class="table-editor-wrapper">
                                  <table class="editor-table">
                                    <thead>
                                      <tr>
                                        <th class="col-drag"></th>
                                        <th 
                                          v-for="(header, hIdx) in getColumnHeaders(section.id, getSectionColCount(section))" 
                                          :key="hIdx"
                                        >
                                          {{ header }}
                                        </th>
                                        <th class="col-actions"></th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr v-for="(row, rIdx) in parseItemsToRows(section.items)" :key="rIdx">
                                        <td class="col-drag">
                                          <div class="row-arrows">
                                            <button 
                                              type="button" 
                                              class="btn-arrow" 
                                              :disabled="rIdx === 0" 
                                              @click="moveRow(section, rIdx, -1)"
                                              title="Move row up"
                                            >▲</button>
                                            <button 
                                              type="button" 
                                              class="btn-arrow" 
                                              :disabled="rIdx === parseItemsToRows(section.items).length - 1" 
                                              @click="moveRow(section, rIdx, 1)"
                                              title="Move row down"
                                            >▼</button>
                                          </div>
                                        </td>
                                        <td 
                                          v-for="cIdx in getSectionColCount(section)" 
                                          :key="cIdx - 1"
                                        >
                                          <input 
                                            type="text" 
                                            :value="row[cIdx - 1] || ''"
                                            @input="updateItemValue(section, rIdx, cIdx - 1, ($event.target as HTMLInputElement).value)"
                                            placeholder="Enter value..."
                                          />
                                        </td>
                                        <td class="col-actions">
                                          <button 
                                            type="button" 
                                            class="btn-delete-row" 
                                            @click="deleteRow(section, rIdx)"
                                            title="Delete row"
                                          >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                                          </button>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <button 
                                    type="button" 
                                    class="btn btn-secondary btn-sm add-row-btn" 
                                    @click="addRow(section, getSectionColCount(section))"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                    Add Row
                                  </button>
                                </div>
                              </template>

                              <!-- Other Pages: Default Raw Textarea -->
                              <template v-else>
                                <label class="field field-block" style="margin-top: 0;">
                                  <span class="field-label">
                                    Items
                                    <span class="field-hint">One per line. Use <code>Title | Detail</code> for paired content.</span>
                                  </span>
                                  <textarea
                                    v-model="section.items"
                                    :name="`section-${section.id}-items`"
                                    rows="4"
                                    placeholder="Item 1&#10;Item 2&#10;Title | Description"
                                  ></textarea>
                                </label>
                              </template>
                            </div>
                          </div>
                        </div>
                      </details>
                    </article>
                  </TransitionGroup>

                  <div v-if="!activePage.sections.length" class="empty-sections">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    <p>No content blocks yet</p>
                    <button class="btn btn-secondary" type="button" @click="addSection">Add your first block</button>
                  </div>
                </div>
              </section>
            </div>

            <!-- Bottom Save Bar -->
            <div class="save-bar">
              <div class="save-bar-left">
                <span class="save-dot-large" :class="{ dirty: activePageDirty }"></span>
                <div>
                  <strong>{{ activePageDirty ? 'Unsaved changes' : 'All changes saved' }}</strong>
                  <small>{{ formatDate(activePage.updatedAt) }}</small>
                </div>
              </div>
              <div class="save-bar-right">
                <button class="btn btn-ghost" type="button" @click="resetCurrentToDefault">Reset</button>
                <button
                  class="btn btn-primary"
                  type="button"
                  :disabled="savingSlug === activePage.slug || loading"
                  @click="saveCurrentPage"
                >
                  <svg v-if="savingSlug === activePage.slug" class="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  {{ savingSlug === activePage.slug ? 'Saving...' : 'Save page' }}
                </button>
              </div>
            </div>
          </section>

          <!-- Preview Column -->
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
                <!-- Hero Preview -->
                <div class="preview-hero">
                  <span class="preview-eyebrow">{{ activePage.eyebrow || 'Eyebrow text' }}</span>
                  <h2 class="preview-headline">{{ activePage.headline || 'Headline' }}</h2>
                  <p class="preview-intro">{{ activePage.intro || 'Intro text...' }}</p>
                  <div v-if="activePage.primaryAction || activePage.secondaryAction" class="preview-actions">
                    <span v-if="activePage.primaryAction" class="preview-btn preview-btn-primary">{{ activePage.primaryAction }}</span>
                    <span v-if="activePage.secondaryAction" class="preview-btn preview-btn-secondary">{{ activePage.secondaryAction }}</span>
                  </div>
                </div>

                <!-- Sections Preview -->
                <div class="preview-sections">
                  <div
                    v-for="(section, idx) in previewItems"
                    :key="section.id"
                    class="preview-section"
                    :class="{ 'preview-section-active': activeSectionIndex === idx }"
                    @click="activeSectionIndex = idx"
                  >
                    <div class="preview-section-indicator" v-if="activeSectionIndex === idx"></div>
                    <h3 class="preview-section-heading">{{ section.heading || 'Section heading' }}</h3>
                    <p class="preview-section-body" v-if="section.body">{{ section.body }}</p>

                    <!-- Items as cards/list -->
                    <div v-if="section.parsedItems.length" class="preview-items">
                      <template v-for="item in section.parsedItems" :key="item">
                        <div v-if="item.includes('|')" class="preview-item-card">
                          <strong>{{ item.split('|')[0]?.trim() }}</strong>
                          <span>{{ item.split('|').slice(1).join('|').trim() }}</span>
                        </div>
                        <div v-else class="preview-item-simple">
                          <span class="preview-bullet"></span>
                          <span>{{ item }}</span>
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

          <!-- Preview toggle button (when preview is hidden) -->
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
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ==============================
   DESIGN TOKENS
   ============================== */
.editor-page {
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
  background: var(--admin-bg);
  color: var(--admin-text);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  transition: padding-left 0.25s ease;
}

:global(.admin-dark) .editor-page {
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

.admin-layout {
  display: flex;
  flex: 1;
}

.main {
  flex: 1;
  width: 100%;
  padding: 1.25rem 1.5rem 2rem;
}

/* ==============================
   NOTICE
   ============================== */
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

.notice-inner {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.notice-icon {
  flex-shrink: 0;
}

.notice-success {
  border-color: rgba(22, 163, 74, 0.25);
  background: var(--admin-green-soft);
  color: #166534;
}

.notice-error {
  border-color: rgba(220, 38, 38, 0.25);
  background: var(--admin-red-soft);
  color: #991b1b;
}

.notice-dismiss {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.notice-dismiss:hover {
  opacity: 1;
}

.notice-slide-enter-active,
.notice-slide-leave-active {
  transition: all 0.25s ease;
}
.notice-slide-enter-from,
.notice-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ==============================
   EDITOR LAYOUT
   ============================== */
.editor-container {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  position: relative;
}

.editor-column {
  flex: 1;
  min-width: 0;
  max-width: 1200px;
}

/* ==============================
   EDITOR HEADER
   ============================== */
.editor-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0;
  padding: 1rem 1.25rem;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
}

.header-left {
  min-width: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.45rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.breadcrumb-link {
  color: var(--admin-muted);
  text-decoration: none;
  transition: color 0.15s;
}

.breadcrumb-link:hover {
  color: var(--admin-blue);
}

.breadcrumb-sep {
  color: var(--admin-muted-light);
  display: flex;
  align-items: center;
}

.breadcrumb-current {
  color: var(--admin-muted-light);
}

.page-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.15rem;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 6px;
  background: var(--admin-bg);
  color: var(--admin-muted);
  padding: 0.2rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
}

.route-badge {
  color: var(--admin-blue);
  background: var(--admin-blue-soft);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.save-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.65rem;
  border-radius: 8px;
  background: var(--admin-green-soft);
  font-size: 0.75rem;
  font-weight: 800;
  color: #166534;
}

.save-indicator.dirty {
  background: var(--admin-amber-soft);
  color: #92400e;
}

.save-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #16a34a;
}

.save-indicator.dirty .save-dot {
  background: var(--admin-amber);
}

.save-label {
  white-space: nowrap;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 36px;
  border-radius: 8px;
  padding: 0.45rem 0.9rem;
  font-weight: 750;
  font-size: 0.82rem;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid transparent;
  transition: all 0.15s ease, transform 0.15s ease;
  white-space: nowrap;
  will-change: transform;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-primary {
  background: var(--admin-blue);
  color: #ffffff;
  border-color: var(--admin-blue);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--admin-surface);
  color: var(--admin-contrast);
  border-color: var(--admin-border-strong);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--admin-muted);
  background: var(--admin-surface-soft);
  box-shadow: var(--admin-shadow);
}

.btn-ghost {
  background: transparent;
  color: var(--admin-muted);
  border-color: transparent;
}

.btn-ghost:hover:not(:disabled) {
  background: var(--admin-bg);
  color: var(--admin-contrast);
  border-color: var(--admin-border);
}

.btn-ghost.danger:hover:not(:disabled) {
  color: #dc2626;
  background: var(--admin-red-soft);
  border-color: rgba(220, 38, 38, 0.2);
}

.btn-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--admin-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon:hover:not(:disabled) {
  background: var(--admin-bg);
  color: var(--admin-contrast);
}

.btn-icon:disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.btn-icon.danger:hover:not(:disabled) {
  color: #dc2626;
  background: var(--admin-red-soft);
}

.btn-icon-sm {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--admin-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon-sm:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.header-actions {
  display: flex;
  gap: 0.35rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==============================
   STATUS BAR
   ============================== */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.25rem;
  margin-bottom: 0;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--admin-muted);
  font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.status-bullet {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #16a34a;
}

.status-bullet.dirty {
  background: var(--admin-amber);
}

.status-text {
  color: var(--admin-muted);
}

.status-right {
  color: var(--admin-muted-light);
}

/* ==============================
   WORKFLOW STEPS
   ============================== */
.workflow-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--admin-border);
  border-radius: 10px;
  background: var(--admin-surface);
  transition: all 0.2s ease;
}

.step.active {
  border-color: var(--admin-blue);
  background: var(--admin-blue-soft);
}

.step.completed {
  border-color: var(--admin-green);
  background: var(--admin-green-soft);
}

.step-indicator {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--admin-bg-deep);
  color: var(--admin-muted);
  font-size: 0.72rem;
  font-weight: 900;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.step.active .step-indicator {
  background: var(--admin-blue);
  border-color: var(--admin-blue);
  color: #ffffff;
}

.step.completed .step-indicator {
  background: var(--admin-green);
  color: #ffffff;
}

.step-indicator.success {
  background: var(--admin-green);
  color: #ffffff;
}

.step-content {
  display: grid;
  gap: 0.08rem;
  min-width: 0;
}

.step-label {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--admin-contrast);
}

.step-desc {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--admin-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* ==============================
   FORM CARDS
   ============================== */
.form-panels {
  display: grid;
  gap: 1rem;
}

.form-card {
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.form-card:hover {
  box-shadow: var(--admin-shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid var(--admin-border);
  background: var(--admin-surface-soft);
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.card-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  flex-shrink: 0;
}

.card-icon-blue {
  background: var(--admin-blue-soft);
  color: var(--admin-blue);
}

.card-icon-violet {
  background: var(--admin-violet-soft);
  color: var(--admin-violet);
}

.card-icon-amber {
  background: var(--admin-amber-soft);
  color: var(--admin-amber);
}

.card-eyebrow {
  display: block;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--admin-muted);
  margin-bottom: 0.05rem;
}

.card-title {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--admin-contrast);
}

.card-body {
  padding: 1rem 1.1rem 1.15rem;
}

.status-pill {
  border-radius: 999px;
  background: var(--admin-green-soft);
  color: #166534;
  padding: 0.2rem 0.55rem;
  font-size: 0.7rem;
  font-weight: 900;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-pill.dirty {
  background: var(--admin-amber-soft);
  color: #92400e;
}

/* ==============================
   FORM FIELDS
   ============================== */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field-block {
  margin-top: 0.85rem;
}

.field-block:first-child {
  margin-top: 0;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--admin-contrast-soft);
  letter-spacing: 0.01em;
}

.field-hint {
  font-weight: 600;
  color: var(--admin-muted);
  font-size: 0.72rem;
}

.field-hint code {
  background: var(--admin-bg);
  padding: 0.08rem 0.25rem;
  border-radius: 3px;
  font-size: 0.7rem;
}

input, textarea {
  width: 100%;
  border: 1.5px solid var(--admin-border-strong);
  border-radius: 10px;
  background: var(--admin-surface);
  color: var(--admin-text);
  padding: 0.62rem 0.78rem;
  font-size: 0.88rem;
  line-height: 1.5;
  font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

textarea {
  resize: vertical;
  min-height: 48px;
}

input:focus, textarea:focus {
  border-color: var(--admin-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  outline: none;
}

input:disabled {
  background: var(--admin-bg-deep);
  color: var(--admin-muted);
  cursor: not-allowed;
}

input::placeholder, textarea::placeholder {
  color: var(--admin-muted-light);
}

/* ==============================
   SECTIONS
   ============================== */
.sections-card .card-body {
  padding: 0;
}

.sections-body {
  padding: 0;
}

.sections-list {
  display: grid;
  gap: 0.6rem;
  padding: 0.75rem;
}

.section-block {
  border: 1px solid var(--admin-border);
  border-radius: 10px;
  background: var(--admin-surface);
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.section-block:hover {
  border-color: var(--admin-border-strong);
}

.section-active {
  border-color: var(--admin-blue) !important;
  box-shadow: 0 0 0 1px var(--admin-blue), var(--admin-shadow-md);
}

.section-summary {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.75rem;
  cursor: pointer;
  list-style: none;
  transition: background 0.15s;
}

.section-summary::-webkit-details-marker {
  display: none;
}

.section-summary::after {
  content: '';
  width: 8px;
  height: 8px;
  margin-left: auto;
  border-right: 2px solid var(--admin-muted);
  border-bottom: 2px solid var(--admin-muted);
  transform: rotate(-135deg);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.section-block details[open] > .section-summary::after {
  transform: rotate(45deg);
}

.section-summary:hover {
  background: var(--admin-surface-soft);
}

.summary-drag {
  display: grid;
  place-items: center;
  color: var(--admin-muted-light);
  cursor: grab;
  flex-shrink: 0;
  user-select: none;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
  flex: 1;
}

.summary-index {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: var(--admin-bg);
  color: var(--admin-muted);
  font-size: 0.68rem;
  font-weight: 900;
  flex-shrink: 0;
}

.summary-text {
  min-width: 0;
  overflow: hidden;
}

.summary-text strong {
  display: block;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--admin-contrast);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-text small {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--admin-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.summary-text .empty-hint {
  font-style: italic;
  opacity: 0.6;
}

.summary-badge {
  font-size: 0.65rem;
  font-weight: 800;
  color: var(--admin-muted);
  background: var(--admin-bg);
  padding: 0.18rem 0.45rem;
  border-radius: 5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.section-body {
  border-top: 1px solid var(--admin-border);
  padding: 0;
}

.section-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--admin-border);
  background: var(--admin-surface-soft);
}

.section-tabs {
  display: flex;
  gap: 0.25rem;
}

.section-tab {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--admin-muted);
  padding: 0.2rem 0.55rem;
  border-radius: 5px;
  cursor: default;
}

.section-tab.active {
  background: var(--admin-surface);
  color: var(--admin-blue);
  box-shadow: var(--admin-shadow-sm);
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}

.btn-sep {
  width: 1px;
  height: 16px;
  background: var(--admin-border);
  margin: 0 0.15rem;
}

.section-fields {
  padding: 0.75rem;
}

/* Section List Transitions */
.section-list-enter-active,
.section-list-leave-active {
  transition: all 0.3s ease;
}

.section-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.section-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.section-list-move {
  transition: transform 0.3s ease;
}

/* Empty state */
.empty-sections {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem 1rem;
  color: var(--admin-muted);
  text-align: center;
}

.empty-sections svg {
  opacity: 0.4;
}

.empty-sections p {
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0;
}

.add-section-btn {
  font-size: 0.78rem;
  padding: 0.35rem 0.7rem;
  min-height: 32px;
}

/* ==============================
   SAVE BAR
   ============================== */
.save-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.85rem 1.1rem;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow-lg);
  position: sticky;
  bottom: 1rem;
  z-index: 10;
}

.save-bar-left {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.save-bar-left strong {
  display: block;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--admin-contrast);
}

.save-bar-left small {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--admin-muted);
}

.save-dot-large {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: 999px;
  background: var(--admin-blue);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--admin-blue) 18%, transparent);
}

.save-dot-large.dirty {
  background: var(--admin-amber);
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
}

.save-bar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ==============================
   PREVIEW COLUMN
   ============================== */
.preview-column {
  width: 340px;
  flex-shrink: 0;
  position: sticky;
  top: calc(60px + 1.25rem);
  align-self: flex-start;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 60px - 2.5rem);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--admin-border);
  background: var(--admin-bg-deep);
  flex-shrink: 0;
}

.preview-header-left {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--admin-contrast);
}

.preview-header-left svg {
  color: var(--admin-blue);
}

.preview-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1rem;
  display: grid;
  gap: 1.25rem;
}

.preview-hero {
  display: grid;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--admin-border);
}

.preview-eyebrow {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--admin-blue);
}

.preview-headline {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--admin-contrast);
  line-height: 1.25;
}

.preview-intro {
  margin: 0;
  font-size: 0.78rem;
  color: var(--admin-muted);
  line-height: 1.55;
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.15rem;
}

.preview-btn {
  display: inline-block;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
}

.preview-btn-primary {
  background: var(--admin-blue);
  color: #ffffff;
}

.preview-btn-secondary {
  border: 1px solid var(--admin-border-strong);
  color: var(--admin-contrast);
}

.preview-sections {
  display: grid;
  gap: 1rem;
}

.preview-section {
  position: relative;
  cursor: pointer;
  padding: 0.65rem;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.preview-section:hover {
  background: var(--admin-surface-soft);
}

.preview-section-active {
  border-color: var(--admin-blue) !important;
  background: var(--admin-blue-soft) !important;
}

.preview-section-indicator {
  position: absolute;
  left: -1px;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 3px;
  border-radius: 2px;
  background: var(--admin-blue);
}

.preview-section-heading {
  margin: 0 0 0.35rem;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--admin-contrast);
}

.preview-section-body {
  margin: 0 0 0.5rem;
  font-size: 0.72rem;
  color: var(--admin-muted);
  line-height: 1.5;
}

.preview-items {
  display: grid;
  gap: 0.35rem;
}

.preview-item-card {
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--admin-border);
  border-radius: 6px;
  background: var(--admin-surface-soft);
}

.preview-item-card strong {
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--admin-contrast);
  margin-bottom: 0.08rem;
}

.preview-item-card span {
  font-size: 0.68rem;
  color: var(--admin-muted);
}

.preview-item-simple {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--admin-text);
}

.preview-bullet {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: var(--admin-muted-light);
  flex-shrink: 0;
  margin-top: 0.3em;
}

.preview-footer {
  padding: 0.5rem 0.85rem;
  border-top: 1px solid var(--admin-border);
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--admin-muted-light);
  text-align: center;
  flex-shrink: 0;
}

/* Preview Slider Transitions */
.preview-slide-enter-active,
.preview-slide-leave-active {
  transition: all 0.3s ease;
}

.preview-slide-enter-from,
.preview-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Preview toggle button */
.preview-toggle-btn {
  position: fixed;
  right: 1.5rem;
  bottom: 5rem;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface);
  color: var(--admin-muted);
  cursor: pointer;
  box-shadow: var(--admin-shadow-lg);
  z-index: 20;
  transition: all 0.2s ease;
}

.preview-toggle-btn:hover {
  color: var(--admin-blue);
  border-color: var(--admin-blue);
  box-shadow: var(--admin-shadow-xl);
  transform: translateY(-2px);
}

/* ==============================
   RESPONSIVE
   ============================== */
@media (min-width: 900px) {
  .editor-page.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 1100px) {
  .preview-column {
    display: none;
  }

  .preview-toggle-btn {
    display: grid;
  }
}

@media (max-width: 900px) {
  .editor-column {
    max-width: 100%;
  }
}

@media (max-width: 760px) {
  .main {
    padding: 0.75rem;
  }

  .editor-header {
    flex-direction: column;
    padding: 0.85rem;
  }

  .header-right {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .btn {
    font-size: 0.78rem;
    padding: 0.35rem 0.6rem;
    min-height: 32px;
  }

  .save-indicator {
    order: -1;
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .workflow-steps {
    grid-template-columns: 1fr;
  }

  .save-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .save-bar-right {
    justify-content: flex-end;
  }

  .preview-toggle-btn {
    right: 0.75rem;
    bottom: 3rem;
  }

  .section-actions .btn-icon {
    width: 28px;
    height: 28px;
  }
}

@media (min-width: 1101px) {
  .preview-toggle-btn {
    display: none;
  }
}

/* ==============================
   ITEMS VISUAL TABLE EDITOR
   ============================== */
.items-editor-container {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 1rem;
}

.items-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.toggle-raw-btn {
  font-size: 0.72rem;
  padding: 0.25rem 0.5rem;
  min-height: auto;
  border-radius: 6px;
  background: rgba(37, 99, 235, 0.08);
  color: var(--admin-blue);
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.toggle-raw-btn:hover {
  background: rgba(37, 99, 235, 0.16);
}

.table-editor-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.editor-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  overflow: hidden;
  font-size: 0.88rem;
  background: var(--admin-surface-soft);
}

.editor-table th,
.editor-table td {
  padding: 0.55rem 0.75rem;
  border-bottom: 1px solid var(--admin-border);
  text-align: left;
}

.editor-table th {
  background: var(--admin-bg-deep);
  color: var(--admin-contrast-soft);
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.editor-table td {
  vertical-align: middle;
}

.col-drag {
  width: 48px;
  padding: 0.35rem !important;
  text-align: center;
}

.col-actions {
  width: 44px;
  text-align: center;
  padding: 0.35rem !important;
}

.row-arrows {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.btn-arrow {
  width: 22px;
  height: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
  background: var(--admin-surface);
  border: 1px solid var(--admin-border-strong);
  border-radius: 4px;
  cursor: pointer;
  color: var(--admin-muted);
  line-height: 1;
}

.btn-arrow:hover:not(:disabled) {
  background: var(--admin-blue-soft);
  color: var(--admin-blue);
  border-color: var(--admin-blue);
}

.btn-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.editor-table input[type="text"] {
  width: 100%;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--admin-border-strong);
  border-radius: 6px;
  background: var(--admin-surface);
  color: var(--admin-text);
  font-size: 0.85rem;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.editor-table input[type="text"]:focus {
  outline: none;
  border-color: var(--admin-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.btn-delete-row {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--admin-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn-delete-row:hover {
  background: var(--admin-red-soft);
  color: var(--admin-red);
}

.add-row-btn {
  align-self: flex-start;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.45rem 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
}
</style>
