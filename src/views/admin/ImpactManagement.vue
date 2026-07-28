<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAdminTheme } from '@/composables/useAdminTheme'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminEditorPanel from '@/components/admin/AdminEditorPanel.vue'
import AdminSectionNav from '@/components/admin/AdminSectionNav.vue'
import AdminUploadButton from '@/components/admin/AdminUploadButton.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import { useSectionEditor } from '@/composables/useSectionEditor'
import { useScrollSpyNav } from '@/composables/useScrollSpyNav'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import type { SupportedLocale } from '@/i18n'
import { normalizeMediaUrl } from '@/lib/media'
import { useContentStore } from '@/stores/content.store'
import { useUiStore } from '@/stores/ui.store'
import type { PageContent } from '@/types/content'
import logoUndp from '@/assets/image.png'
import logoAdb from '@/assets/image copy.png'
import logoOxfam from '@/assets/image copy 2.png'
import logoBfw from '@/assets/image copy 3.png'
import logoMisereor from '@/assets/image copy 4.png'
import logoEu from '@/assets/image copy 5.png'
import logoUsaid from '@/assets/image copy 6.png'
import logoDiakonia from '@/assets/image copy 7.png'
import logoHbs from '@/assets/image copy 8.png'
import logoCaritas from '@/assets/image copy 9.png'

// ─── Data Types ──────────────────────────────────────────────
type StatItem = {
  value: string
  label: string
  desc: string
}

type MilestoneItem = {
  year: string
  title: string
  description: string
  detail: string
  image: string
}

type PartnerItem = {
  name: string
  image: string
  category: string
}

type GovItem = {
  title: string
  desc: string
  icon: string
}

type LocalItem = {
  title: string
  desc: string
}

type WhyItem = {
  title: string
  desc: string
  icon: string
}

type ImpactNumbersContent = {
  hero: {
    eyebrow: string
    title: string
    description: string
  }
  stats: StatItem[]
  beyondHeader?: {
    heading: string
    body: string
  }
  flipCards?: FlipCardItem[]
}

type ImpactTimelineContent = {
  hero: {
    eyebrow: string
    title: string
    description: string
  }
  milestones: MilestoneItem[]
}

type ImpactPartnersContent = {
  hero: {
    eyebrow: string
    title: string
    description: string
  }
  partners: PartnerItem[]
  governmentHeader?: { heading: string; body: string }
  government: GovItem[]
  localHeader?: { heading: string; body: string }
  local: LocalItem[]
  whyHeader?: { heading: string; body: string }
  whyItems?: WhyItem[]
}

const route = useRoute()
const { locale } = useI18n()
const contentStore = useContentStore()
const ui = useUiStore()
useAdminTheme()

const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

// Active tab determination based on route slug
const activeTab = computed<'numbers' | 'timeline' | 'partners'>(() => {
  const path = route.path
  if (path.includes('timeline')) return 'timeline'
  if (path.includes('partners')) return 'partners'
  return 'numbers'
})

const activeSlug = computed(() => `impact-${activeTab.value}`)
const activePublicRoute = computed(() => `/impact/${activeTab.value}`)

// ─── Fallback Content ───
const fallbackNumbers: ImpactNumbersContent = {
  hero: {
    eyebrow: 'Our Impact',
    title: 'Thirty years, measured village by village.',
    description: 'Numbers do not tell the whole story, but they keep us honest. Every figure below is drawn from our annual monitoring and audited reports.',
  },
  stats: [
    { value: '293', label: 'Villages', desc: 'Across 43 communes in three provinces.' },
    { value: '43', label: 'Communes', desc: 'Svay Rieng, Prey Veng and Kratie.' },
    { value: '3', label: 'Provinces', desc: 'Continuous field presence since 1994.' },
  ],
  beyondHeader: {
    heading: 'Beyond the Numbers',
    body: 'Our work spans environment, education, and livelihoods — each area with its own measurable outcomes and human stories.'
  },
  flipCards: [
    {
      id: 'numbers-card-environment',
      title: 'Environment',
      icon: 'tree',
      preview: '570+ hectares protected',
      description: 'Community-led conservation that protects biodiversity and builds climate resilience.',
      details: [
        { value: '570+', label: 'Hectares', desc: 'Community forest protected and restored.' },
        { value: '50k+', label: 'Saplings', desc: 'Grown yearly in village nurseries.' },
        { value: '300+', label: 'Biogas units', desc: 'Installed in rural kitchens.' },
      ]
    },
    {
      id: 'numbers-card-education',
      title: 'Education',
      icon: 'book',
      preview: '120+ children enrolled yearly',
      description: 'Early childhood education and lifelong learning opportunities for every child.',
      details: [
        { value: '120+', label: 'Pre-school children', desc: 'Enrolled each year.' },
        { value: '8', label: 'Mobile libraries', desc: 'Reaching remote villages.' },
        { value: '60+', label: 'Annual scholarships', desc: 'For the poorest students.' },
      ]
    },
    {
      id: 'numbers-card-livelihoods',
      title: 'Livelihoods & Child Protection',
      icon: 'handshake',
      preview: '2,400+ SfC members',
      description: 'Economic empowerment and child safeguarding go hand in hand.',
      details: [
        { value: '2,400+', label: 'SfC members', desc: 'Saving and lending together.' },
        { value: '12', label: 'Cooperatives', desc: 'Rice, vegetables and enterprise.' },
        { value: '600+', label: 'Peer educators', desc: 'Trained in child rights.' },
      ]
    }
  ]
}

const fallbackTimeline: ImpactTimelineContent = {
  hero: {
    eyebrow: 'Impact Journey',
    title: 'Thirty years of walking with villages.',
    description: 'From a small pagoda in Svay Rieng to 293 villages across three provinces — the milestones that shaped Santi Sena.',
  },
  milestones: [
    {
      year: '2024',
      title: '30-Year Strategic Plan',
      description: 'New five-year strategy to deepen quality, diversify funding and invest in youth leadership.',
      detail: 'The plan prioritises three pillars: (1) expanding community-led education programmes, (2) strengthening child protection systems, and (3) launching a dedicated youth innovation fund. Over 50 community dialogues were held to co‑design the strategy.',
      image: '/images/programs/hero-2.jpg',
    },
    {
      year: '2022',
      title: 'Melaleuca Oil Enterprise',
      description: 'Village forest guardians launch a rural enterprise from non-timber forest products.',
      detail: 'With technical support from Santi Sena, 12 village cooperatives now sustainably harvest melaleuca leaves, producing essential oils sold locally and exported. The enterprise provides income for 200 families while preserving the forest.',
      image: '/images/programs/environment-hero1.jpg',
    },
    {
      year: '2020',
      title: 'COVID-19 Response',
      description: 'Emergency food, hygiene and remote-learning kits reach more than 200 villages.',
      detail: 'In partnership with local authorities, we distributed 3,500 food packs, 5,000 hygiene kits, and 2,000 radio‑based learning materials to keep children learning despite school closures.',
      image: '/images/programs/hero-1.jpg',
    },
    {
      year: '2018',
      title: 'Child Protection Networks',
      description: 'CPNs become active across 43 communes with 24/7 referral pathways.',
      detail: 'Each network includes trained volunteers, social workers, and local police. They have handled over 1,200 cases, ensuring vulnerable children receive immediate care and legal support.',
      image: '/images/programs/child-protection2.jpg',
    },
    {
      year: '2014',
      title: '20th Anniversary',
      description: 'Kratie office opens. Programs extend to a third province and staff grows past 30 full-time.',
      detail: 'The expansion to Kratie brought our integrated approach to another province, reaching an additional 80 villages. We also launched our first youth leadership camp that year.',
      image: '/images/programs/hero-4.jpg',
    },
    {
      year: '2011',
      title: 'Biogas program launched',
      description: 'Household biogas units begin replacing firewood in remote kitchens.',
      detail: 'By 2015, we had installed over 400 biogas units, reducing deforestation and improving indoor air quality. The program also trains local technicians to maintain the systems.',
      image: '/images/programs/environment-hero2.jpg',
    },
    {
      year: '2007',
      title: 'Expansion to Prey Veng',
      description: 'Education and child protection programming reaches a second province.',
      detail: 'We partnered with the provincial government to replicate the Svay Rieng model, focusing on school enrolment and community‑based child protection committees.',
      image: '/images/programs/education.jpg',
    },
    {
      year: '2003',
      title: 'Saving-for-Change begins',
      description: 'First women-led savings circles launched in Svay Rieng; the model becomes a program backbone.',
      detail: 'Today, over 500 savings groups exist, with more than 12,000 members. The groups provide micro‑loans and financial literacy training, empowering women to start small businesses.',
      image: '/images/programs/livelihood-hero3.jpg',
    },
    {
      year: '1998',
      title: 'First community forestry site',
      description: 'Village committees take legal stewardship of 120 hectares of degraded forest.',
      detail: 'The site has since become a model for community‑led reforestation, with over 50,000 trees planted and a thriving biodiversity corridor. It now serves as a learning hub for other villages.',
      image: '/images/programs/environment-hero3.jpg',
    },
    {
      year: '1994',
      title: 'Founded in Svay Rieng',
      description: 'Buddhist monks and community elders establish the Peace Army after the war, focused on moral regeneration and rural recovery.',
      detail: 'The founding team began with just five monks and a handful of volunteers. Their first project was rebuilding a primary school destroyed during the conflict, which became the spark for decades of community development.',
      image: '/images/programs/education-hero.jpg',
    },
  ],
}

const fallbackPartners: ImpactPartnersContent = {
  hero: {
    eyebrow: 'Our Network',
    title: 'Partners & Supporters',
    description: 'These organizations and institutions make our work possible through funding, technical expertise, and shared commitment to sustainable development.',
  },
  partners: [
    { name: 'UNDP', image: logoUndp, category: 'United Nations Agency' },
    { name: 'Asian Development Bank', image: logoAdb, category: 'Development Bank' },
    { name: 'Oxfam', image: logoOxfam, category: 'International NGO' },
    { name: 'Bread for the World', image: logoBfw, category: 'Faith-Based Development' },
    { name: 'Misereor', image: logoMisereor, category: 'Social Justice' },
    { name: 'European Union', image: logoEu, category: 'Development Aid' },
    { name: 'USAID / Winrock', image: logoUsaid, category: 'Environmental Forestry' },
    { name: 'Diakonia', image: logoDiakonia, category: 'Human Rights' },
    { name: 'Heinrich Böll Stiftung', image: logoHbs, category: 'Ecological Policy' },
    { name: 'Caritas', image: logoCaritas, category: 'Humanitarian Assistance' },
  ],
  governmentHeader: {
    heading: 'Government Coordination',
    body: 'We work hand-in-hand with national and provincial government bodies to align our programs with Cambodia\'s development priorities.'
  },
  government: [
    { title: 'Ministry of Environment', desc: 'Community forestry management and seedling production.', icon: 'tree' },
    { title: 'Ministry of Education', desc: 'Pre-school curriculum, teacher training and mobile library support.', icon: 'book' },
    { title: 'Ministry of Agriculture', desc: 'Agricultural cooperative registration and farming technical support.', icon: 'building' },
  ],
  localHeader: {
    heading: 'Local Partners',
    body: 'Sustainable change is built from the ground up. These local institutions and networks are the backbone of every program we run.'
  },
  local: [
    { title: 'Commune Councils', desc: 'Joint planning, child rights committees and local emergency response.' },
    { title: 'Pagoda Committees', desc: 'Monk leadership in peace building, pre-schools and monastery gardens.' },
  ],
  whyHeader: {
    heading: 'Why Partners Stay',
    body: 'Long-term partnerships don\'t happen by chance. Here\'s what keeps our partners committed year after year.'
  },
  whyItems: [
    { title: '30 years of unbroken presence', desc: 'in southeastern Cambodia — trust built over generations.', icon: 'building' },
    { title: 'Audited financial systems', desc: 'and clean grant reporting with full transparency.', icon: 'bar-chart' },
    { title: 'Deep community trust', desc: 'rooted in Buddhist moral leadership and village relationships.', icon: 'handshake' },
    { title: 'Proven ability to scale', desc: 'pilots into province-wide programs with measurable outcomes.', icon: 'rocket' },
  ]
}

// ─── Reactive State ───
const pageRow = ref<PageContent | null>(null)
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')

const numbersDraft = reactive<ImpactNumbersContent>(cloneNumbers(fallbackNumbers))
const timelineDraft = reactive<ImpactTimelineContent>(cloneTimeline(fallbackTimeline))
const partnersDraft = reactive<ImpactPartnersContent>(clonePartners(fallbackPartners))

// ─── Section Editor Composable ───
const {
  editingSections,
  collapsedSections,
  toggleCollapse,
  toggleEdit,
  cancelEdit,
  setupSectionWatch,
  stopSectionWatch,
  resetEditingState,
} = useSectionEditor([
  {
    key: 'hero',
    getSnapshot: () => {
      if (activeTab.value === 'timeline') return { ...timelineDraft.hero }
      if (activeTab.value === 'partners') return { ...partnersDraft.hero }
      return { ...numbersDraft.hero }
    },
    applySnapshot: (val) => {
      if (activeTab.value === 'timeline') timelineDraft.hero = val
      else if (activeTab.value === 'partners') partnersDraft.hero = val
      else numbersDraft.hero = val
    },
  },
  {
    key: 'stats',
    getSnapshot: () => numbersDraft.stats.map((s) => ({ ...s })),
    applySnapshot: (val) => { numbersDraft.stats = val },
  },
  {
    key: 'beyond',
    getSnapshot: () => ({
      header: { ...(numbersDraft.beyondHeader || fallbackNumbers.beyondHeader!) },
      cards: (numbersDraft.flipCards || fallbackNumbers.flipCards!).map((c) => ({
        ...c,
        details: c.details.map((d) => ({ ...d }))
      }))
    }),
    applySnapshot: (val) => {
      numbersDraft.beyondHeader = val.header
      numbersDraft.flipCards = val.cards
    },
  },
  {
    key: 'milestones',
    getSnapshot: () => timelineDraft.milestones.map((m) => ({ ...m })),
    applySnapshot: (val) => { timelineDraft.milestones = val },
  },
  {
    key: 'supporters',
    getSnapshot: () => ({
      hero: { ...partnersDraft.hero },
      partners: partnersDraft.partners.map((p) => ({ ...p })),
    }),
    applySnapshot: (val) => {
      partnersDraft.hero = val.hero
      partnersDraft.partners = val.partners
    },
  },
  {
    key: 'government',
    getSnapshot: () => partnersDraft.government.map((g) => ({ ...g })),
    applySnapshot: (val) => { partnersDraft.government = val },
  },
  {
    key: 'local',
    getSnapshot: () => partnersDraft.local.map((l) => ({ ...l })),
    applySnapshot: (val) => { partnersDraft.local = val },
  },
])

const originalSnapshot = ref('')

const hasChanges = computed(() => {
  const current = getCurrentDraftJSON()
  return current !== originalSnapshot.value
})

function getCurrentDraftJSON() {
  if (activeTab.value === 'timeline') return JSON.stringify(cloneTimeline(timelineDraft))
  if (activeTab.value === 'partners') return JSON.stringify(clonePartners(partnersDraft))
  return JSON.stringify(cloneNumbers(numbersDraft))
}

function updateSnapshot() {
  originalSnapshot.value = getCurrentDraftJSON()
}

const activeLocale = computed<SupportedLocale>(() => (locale.value === 'kh' ? 'kh' : 'en'))
const activeLocaleName = computed(() => (activeLocale.value === 'kh' ? 'Khmer' : 'English'))

// ─── Scroll Spy Sections per Tab ───
const numbersSections = [
  { id: 'impact-hero', label: 'Hero', icon: 'mdi-creation' },
  { id: 'impact-stats-list', label: 'Stats List', icon: 'mdi-chart-line' },
  { id: 'impact-beyond', label: 'Impact Cards', icon: 'mdi-cards' },
] as const

const timelineSections = [
  { id: 'timeline-hero', label: 'Hero', icon: 'mdi-creation' },
  { id: 'timeline-list', label: 'Milestones', icon: 'mdi-timeline-clock' },
] as const

const partnersSections = [
  { id: 'partners-hero', label: 'Hero', icon: 'mdi-creation' },
  { id: 'partners-list', label: 'International', icon: 'mdi-handshake' },
  { id: 'partners-gov', label: 'Government', icon: 'mdi-bank' },
  { id: 'partners-local', label: 'Community', icon: 'mdi-account-group' },
  { id: 'partners-why', label: 'Why Trust Us', icon: 'mdi-shield-check' },
] as const

const activeSectionsList = computed(() => {
  if (activeTab.value === 'timeline') return timelineSections
  if (activeTab.value === 'partners') return partnersSections
  return numbersSections
})

const { activeSection, scrollToSection, updateActiveSectionFromScroll } = useScrollSpyNav(activeSectionsList.value)

useUnsavedChangesGuard(hasChanges)

onMounted(() => {
  contentStore.useLocalFallback()
  void loadPage()
})

onUnmounted(() => {
  stopSectionWatch()
})

watch([activeTab, activeLocale], () => {
  void loadPage()
})

async function loadPage() {
  resetEditingState()
  loading.value = true
  loadError.value = ''

  try {
    const slug = activeSlug.value
    const page = await contentStore.fetchBySlug(slug, activeLocale.value)
    pageRow.value = page

    const cmsData = parseCmsBody(page?.body || '')

    if (activeTab.value === 'timeline') {
      const merged = mergeTimeline(fallbackTimeline, cmsData)
      replaceTimelineDraft(merged)
    } else if (activeTab.value === 'partners') {
      const merged = mergePartners(fallbackPartners, cmsData)
      replacePartnersDraft(merged)
    } else {
      const merged = mergeNumbers(fallbackNumbers, cmsData)
      replaceNumbersDraft(merged)
    }

    updateSnapshot()
    setupSectionWatch()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load page content.'
    ui.addToast(loadError.value, 'error')
  } finally {
    loading.value = false
  }
}

async function savePage() {
  if (saving.value) return

  saving.value = true
  try {
    let contentToSave: unknown
    let pageTitle = 'Impact'

    if (activeTab.value === 'numbers') {
      contentToSave = prepareNumbersForSave(numbersDraft)
      pageTitle = 'Impact Numbers'
    } else if (activeTab.value === 'timeline') {
      contentToSave = prepareTimelineForSave(timelineDraft)
      pageTitle = 'Impact Timeline'
    } else {
      contentToSave = preparePartnersForSave(partnersDraft)
      pageTitle = 'Impact Partners'
    }

    const saved = await contentStore.upsert({
      id: pageRow.value?.id ?? '',
      slug: activeSlug.value,
      title: pageTitle,
      body: JSON.stringify(contentToSave, null, 2),
      locale: activeLocale.value,
      route_path: activePublicRoute.value,
      nav_group: 'Impact',
      template: 'standard',
      status: 'published',
      updated_at: pageRow.value?.updated_at ?? '',
    })

    pageRow.value = saved
    updateSnapshot()
    ui.addToast(`${pageTitle} (${activeLocaleName.value}) content saved.`, 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save content.', 'error')
  } finally {
    saving.value = false
  }
}

// ─── List Controls (Move Up, Move Down, Remove, Add) ───
function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= items.length) return
  const current = items[index]
  const next = items[target]
  if (!current || !next) return
  items[index] = next
  items[target] = current
}

function removeItem<T extends { title?: string; name?: string; label?: string; year?: string }>(
  items: T[],
  index: number,
  label: string,
) {
  const item = items[index]
  if (!item) return
  const itemTitle = item.title || item.name || item.label || (item.year ? `Year ${item.year}` : 'this item')
  confirmDialog(
    `Remove ${label}?`,
    `Remove "${itemTitle}" from this impact page?`,
    () => {
      items.splice(index, 1)
      ui.addToast(`${label} removed.`, 'warning')
    },
  )
}

function addStatItem() {
  numbersDraft.stats.unshift({
    value: '100+',
    label: 'New metric',
    desc: 'Description of this metric.',
  })
}

function addFlipCard() {
  if (!numbersDraft.flipCards) numbersDraft.flipCards = []
  numbersDraft.flipCards.unshift({
    id: `numbers-card-${Date.now()}`,
    title: 'New Program Area',
    icon: 'tree',
    preview: '100+ beneficiaries',
    description: 'Summary description of this impact area.',
    details: [
      { value: '100+', label: 'Beneficiaries', desc: 'Detail of key outcome.' }
    ]
  })
}

function addCardDetail(card: FlipCardItem) {
  card.details.push({
    value: '0',
    label: 'New metric',
    desc: 'Description of key outcome.'
  })
}

function removeCardDetail(card: FlipCardItem, index: number) {
  card.details.splice(index, 1)
}

function addMilestone() {
  timelineDraft.milestones.unshift({
    year: String(new Date().getFullYear()),
    title: 'New milestone',
    description: 'Short summary of milestone.',
    detail: 'Full milestone detail description.',
    image: '/images/programs/hero-1.jpg',
  })
}

function addPartner() {
  partnersDraft.partners.unshift({
    name: 'New Partner',
    image: '/images/programs/hero-1.jpg',
    category: 'International',
  })
}

function addGovItem() {
  partnersDraft.government.unshift({
    title: 'Ministry / Authority',
    desc: 'Description of technical collaboration.',
    icon: 'building',
  })
}

function addLocalItem() {
  partnersDraft.local.unshift({
    title: 'Local Committee',
    desc: 'Description of community partnership.',
  })
}

function addWhyItem() {
  if (!partnersDraft.whyItems) partnersDraft.whyItems = []
  partnersDraft.whyItems.unshift({
    title: 'New Trust Factor',
    desc: 'Description of why partners trust us.',
    icon: 'handshake',
  })
}

// ─── Draft Replacers & Helpers ───
function replaceNumbersDraft(content: ImpactNumbersContent) {
  numbersDraft.hero = { ...content.hero }
  numbersDraft.stats = content.stats.map((s) => ({ ...s }))
  numbersDraft.beyondHeader = content.beyondHeader ? { ...content.beyondHeader } : { ...fallbackNumbers.beyondHeader! }
  numbersDraft.flipCards = (content.flipCards || fallbackNumbers.flipCards!).map((c) => ({
    ...c,
    details: c.details.map((d) => ({ ...d }))
  }))
}

function replaceTimelineDraft(content: ImpactTimelineContent) {
  timelineDraft.hero = { ...content.hero }
  timelineDraft.milestones = content.milestones.map((m) => ({ ...m }))
}

function replacePartnersDraft(content: ImpactPartnersContent) {
  partnersDraft.hero = { ...content.hero }
  partnersDraft.partners = content.partners.map((p) => ({ ...p }))
  partnersDraft.governmentHeader = content.governmentHeader ? { ...content.governmentHeader } : { ...fallbackPartners.governmentHeader! }
  partnersDraft.government = content.government.map((g) => ({ ...g }))
  partnersDraft.localHeader = content.localHeader ? { ...content.localHeader } : { ...fallbackPartners.localHeader! }
  partnersDraft.local = content.local.map((l) => ({ ...l }))
  partnersDraft.whyHeader = content.whyHeader ? { ...content.whyHeader } : { ...fallbackPartners.whyHeader! }
  partnersDraft.whyItems = (content.whyItems || fallbackPartners.whyItems!).map((w) => ({ ...w }))
}

function prepareNumbersForSave(content: ImpactNumbersContent): ImpactNumbersContent {
  const beyondHeader = content.beyondHeader || fallbackNumbers.beyondHeader!
  const flipCards = content.flipCards || fallbackNumbers.flipCards!
  return {
    hero: { ...content.hero },
    stats: content.stats.map((s) => ({
      value: s.value.trim(),
      label: s.label.trim(),
      desc: s.desc.trim(),
    })),
    beyondHeader: {
      heading: beyondHeader.heading.trim(),
      body: beyondHeader.body.trim(),
    },
    flipCards: flipCards.map((c) => ({
      id: c.id,
      title: c.title.trim(),
      icon: c.icon.trim(),
      preview: c.preview.trim(),
      description: c.description.trim(),
      details: c.details.map((d) => ({
        value: d.value.trim(),
        label: d.label.trim(),
        desc: d.desc.trim(),
      })),
    })),
  }
}

function prepareTimelineForSave(content: ImpactTimelineContent): ImpactTimelineContent {
  return {
    hero: { ...content.hero },
    milestones: content.milestones.map((m) => ({
      year: m.year.trim(),
      title: m.title.trim(),
      description: m.description.trim(),
      detail: m.detail.trim(),
      image: normalizeMediaUrl(m.image),
    })),
  }
}

function preparePartnersForSave(content: ImpactPartnersContent): ImpactPartnersContent {
  const govHeader = content.governmentHeader || fallbackPartners.governmentHeader!
  const locHeader = content.localHeader || fallbackPartners.localHeader!
  const whyHeader = content.whyHeader || fallbackPartners.whyHeader!
  const whyItems = content.whyItems || fallbackPartners.whyItems!
  return {
    hero: { ...content.hero },
    partners: content.partners.map((p) => ({
      name: p.name.trim(),
      image: normalizeMediaUrl(p.image),
      category: p.category.trim(),
    })),
    governmentHeader: {
      heading: govHeader.heading.trim(),
      body: govHeader.body.trim(),
    },
    government: content.government.map((g) => ({
      title: g.title.trim(),
      desc: g.desc.trim(),
      icon: g.icon.trim(),
    })),
    localHeader: {
      heading: locHeader.heading.trim(),
      body: locHeader.body.trim(),
    },
    local: content.local.map((l) => ({
      title: l.title.trim(),
      desc: l.desc.trim(),
    })),
    whyHeader: {
      heading: whyHeader.heading.trim(),
      body: whyHeader.body.trim(),
    },
    whyItems: whyItems.map((w) => ({
      title: w.title.trim(),
      desc: w.desc.trim(),
      icon: w.icon.trim(),
    })),
  }
}

function cloneNumbers(c: ImpactNumbersContent): ImpactNumbersContent {
  const beyondHeader = c.beyondHeader || fallbackNumbers.beyondHeader!
  const flipCards = c.flipCards || fallbackNumbers.flipCards!
  return {
    hero: { ...c.hero },
    stats: c.stats.map((s) => ({ ...s })),
    beyondHeader: { ...beyondHeader },
    flipCards: flipCards.map((card) => ({
      ...card,
      details: card.details.map((d) => ({ ...d })),
    })),
  }
}

function cloneTimeline(c: ImpactTimelineContent): ImpactTimelineContent {
  return { hero: { ...c.hero }, milestones: c.milestones.map((m) => ({ ...m })) }
}

function clonePartners(c: ImpactPartnersContent): ImpactPartnersContent {
  const govHeader = c.governmentHeader || fallbackPartners.governmentHeader!
  const locHeader = c.localHeader || fallbackPartners.localHeader!
  const whyHeader = c.whyHeader || fallbackPartners.whyHeader!
  const whyItems = Array.isArray(c.whyItems) ? c.whyItems : (fallbackPartners.whyItems || [])
  const partners = Array.isArray(c.partners) ? c.partners : (fallbackPartners.partners || [])
  const government = Array.isArray(c.government) ? c.government : (fallbackPartners.government || [])
  const local = Array.isArray(c.local) ? c.local : (fallbackPartners.local || [])
  return {
    hero: { ...c.hero },
    partners: partners.map((p) => ({ ...p })),
    governmentHeader: { ...govHeader },
    government: government.map((g) => ({ ...g })),
    localHeader: { ...locHeader },
    local: local.map((l) => ({ ...l })),
    whyHeader: { ...whyHeader },
    whyItems: whyItems.map((w) => ({ ...w })),
  }
}

function parseCmsBody(body: string): Record<string, unknown> | null {
  if (!body.trim()) return null
  try {
    const parsed = JSON.parse(body) as unknown
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

function mergeNumbers(base: ImpactNumbersContent, override: Record<string, unknown> | null): ImpactNumbersContent {
  if (!override) return cloneNumbers(base)
  const hero = typeof override.hero === 'object' && override.hero !== null ? override.hero as Record<string, string> : {}
  const stats = Array.isArray(override.stats) ? override.stats : base.stats
  const beyondHeader = typeof override.beyondHeader === 'object' && override.beyondHeader !== null ? override.beyondHeader as Record<string, string> : base.beyondHeader
  const flipCards = Array.isArray(override.flipCards) ? override.flipCards : base.flipCards
  return {
    hero: { ...base.hero, ...hero },
    stats: stats.map((s: StatItem) => ({ ...s })),
    beyondHeader: { ...base.beyondHeader, ...beyondHeader },
    flipCards: (flipCards || base.flipCards || fallbackNumbers.flipCards!).map((c: any) => ({
      ...c,
      details: Array.isArray(c.details) ? c.details.map((d: any) => ({ ...d })) : []
    }))
  }
}

function mergeTimeline(base: ImpactTimelineContent, override: Record<string, unknown> | null): ImpactTimelineContent {
  if (!override) return cloneTimeline(base)
  const hero = typeof override.hero === 'object' && override.hero !== null ? override.hero as Record<string, string> : {}
  const milestones = Array.isArray(override.milestones) ? override.milestones : base.milestones
  return {
    hero: { ...base.hero, ...hero },
    milestones: milestones.map((m: MilestoneItem) => ({ ...m })),
  }
}

function mergePartners(base: ImpactPartnersContent, override: Record<string, unknown> | null): ImpactPartnersContent {
  if (!override) return clonePartners(base)
  const hero = typeof override.hero === 'object' && override.hero !== null ? override.hero as Record<string, string> : {}
  const partners = Array.isArray(override.partners) ? override.partners : base.partners
  const governmentHeader = typeof override.governmentHeader === 'object' && override.governmentHeader !== null ? override.governmentHeader as Record<string, string> : base.governmentHeader
  const government = Array.isArray(override.government) ? override.government : base.government
  const localHeader = typeof override.localHeader === 'object' && override.localHeader !== null ? override.localHeader as Record<string, string> : base.localHeader
  const local = Array.isArray(override.local) ? override.local : base.local
  const whyHeader = typeof override.whyHeader === 'object' && override.whyHeader !== null ? override.whyHeader as Record<string, string> : base.whyHeader
  const whyItems = Array.isArray(override.whyItems) ? override.whyItems : base.whyItems
  return {
    hero: { ...base.hero, ...hero },
    partners: partners.map((p: PartnerItem) => ({ ...p })),
    governmentHeader: { ...base.governmentHeader, ...governmentHeader },
    government: government.map((g: GovItem) => ({ ...g })),
    localHeader: { ...base.localHeader, ...localHeader },
    local: local.map((l: LocalItem) => ({ ...l })),
    whyHeader: { ...base.whyHeader, ...whyHeader },
    whyItems: (whyItems || base.whyItems || fallbackPartners.whyItems!).map((w: WhyItem) => ({ ...w })),
  }
}
</script>

<template>
  <v-app :class="['impact-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Manage impact section</h1>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" color="primary" :to="activePublicRoute" target="_blank">
              <v-icon start>mdi-open-in-new</v-icon>
              View page
            </v-btn>
          </div>
        </header>

        <v-fade-transition mode="out-in" @after-enter="updateActiveSectionFromScroll">
          <div v-if="loading" key="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading impact content...</span>
          </div>

          <div v-else-if="loadError" key="error">
            <v-alert type="error" variant="tonal" closable @click:close="loadError = ''">
              <template #title>Could not load content</template>
              <div class="d-flex align-center justify-space-between ga-2">
                <span>{{ loadError }}</span>
                <v-btn variant="tonal" size="small" @click="loadPage">Try again</v-btn>
              </div>
            </v-alert>
          </div>

          <div v-else key="content" class="content-grid">
            <AdminSectionNav
              :sections="activeSectionsList"
              :active-section="activeSection"
              :has-changes="hasChanges"
              :saving="saving"
              aria-label="Impact page sections"
              save-label="Save Changes"
              @navigate="scrollToSection"
              @save="savePage"
            />

            <!-- ════════════════ NUMBERS TAB ════════════════ -->
            <template v-if="activeTab === 'numbers'">
              <!-- ── HERO ── -->
              <AdminEditorPanel
                :id="numbersSections[0].id"
                kicker="Hero section"
                heading="Headline & Introduction"
                :editing="!!editingSections.hero"
                :collapsed="!!collapsedSections.hero"
                @toggle-edit="toggleEdit('hero')"
                @cancel="cancelEdit('hero')"
                @toggle-collapse="toggleCollapse('hero')"
              >
                <div class="panel-body form-grid">
                  <v-text-field v-model="numbersDraft.hero.eyebrow" label="Eyebrow tag" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="numbersDraft.hero.title" label="Main heading" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
                  <v-textarea v-model="numbersDraft.hero.description" label="Intro paragraph" rows="3" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" class="field-wide" />
                </div>
              </AdminEditorPanel>

              <!-- ── STATS LIST ── -->
              <AdminEditorPanel
                :id="numbersSections[1].id"
                kicker="Counters & metrics"
                heading="Impact stats"
                :editing="!!editingSections.stats"
                :collapsed="!!collapsedSections.stats"
                @toggle-edit="toggleEdit('stats')"
                @cancel="cancelEdit('stats')"
                @toggle-collapse="toggleCollapse('stats')"
              >
                <template #actions="{ editing }">
                  <v-fade-transition>
                    <v-btn v-if="editing" color="accent" variant="flat" size="small" @click="addStatItem">
                      <v-icon start>mdi-plus</v-icon>
                      Add stat
                    </v-btn>
                  </v-fade-transition>
                </template>

                <div class="pa-4">
                  <v-slide-y-transition group tag="div" class="items-list">
                    <article v-for="(stat, index) in numbersDraft.stats" :key="'stat-' + index" class="item-card">
                      <header class="item-header">
                        <div class="item-heading">
                          <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                          <h4>{{ stat.label || 'New stat' }} ({{ stat.value }})</h4>
                        </div>
                        <div class="card-actions">
                          <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.stats || index === 0" @click="moveItem(numbersDraft.stats, index, -1)">
                            <v-icon>mdi-chevron-up</v-icon>
                          </v-btn>
                          <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.stats || index === numbersDraft.stats.length - 1" @click="moveItem(numbersDraft.stats, index, 1)">
                            <v-icon>mdi-chevron-down</v-icon>
                          </v-btn>
                          <v-btn v-if="editingSections.stats" icon color="error" variant="tonal" size="x-small" @click="removeItem(numbersDraft.stats, index, 'stat metric')">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </header>
                      <div class="item-fields">
                        <v-text-field v-model="stat.value" label="Value / Number" :disabled="!editingSections.stats" hide-details density="compact" variant="outlined" />
                        <v-text-field v-model="stat.label" label="Label" :disabled="!editingSections.stats" hide-details density="compact" variant="outlined" />
                        <v-textarea v-model="stat.desc" label="Description" rows="2" :disabled="!editingSections.stats" hide-details density="compact" variant="outlined" class="field-wide" />
                      </div>
                    </article>
                  </v-slide-y-transition>
                </div>
              </AdminEditorPanel>

              <!-- ── BEYOND THE NUMBERS (CARDS) ── -->
              <AdminEditorPanel
                :id="numbersSections[2].id"
                kicker="Themed Impact Cards"
                heading="Beyond the Numbers (Cards)"
                :editing="!!editingSections.beyond"
                :collapsed="!!collapsedSections.beyond"
                @toggle-edit="toggleEdit('beyond')"
                @cancel="cancelEdit('beyond')"
                @toggle-collapse="toggleCollapse('beyond')"
              >
                <template #actions="{ editing }">
                  <v-fade-transition>
                    <v-btn v-if="editing" color="accent" variant="flat" size="small" @click="addFlipCard">
                      <v-icon start>mdi-plus</v-icon>
                      Add Card
                    </v-btn>
                  </v-fade-transition>
                </template>

                <div class="pa-4">
                  <!-- Section Header Editing -->
                  <div class="panel-subcard mb-6 pa-5 border rounded-lg bg-grey-lighten-5" v-if="numbersDraft.beyondHeader">
                    <div class="mb-4 pb-2 border-b">
                      <span class="text-caption font-weight-bold text-uppercase text-primary">Section Header</span>
                    </div>
                    <div class="d-flex flex-column ga-4 pt-1">
                      <v-text-field v-model="numbersDraft.beyondHeader.heading" label="Section Heading" placeholder="Beyond the Numbers" :disabled="!editingSections.beyond" hide-details density="comfortable" variant="outlined" />
                      <v-textarea v-model="numbersDraft.beyondHeader.body" label="Section Intro Description" placeholder="Our work spans environment..." rows="2" :disabled="!editingSections.beyond" hide-details density="comfortable" variant="outlined" />
                    </div>
                  </div>

                  <!-- Cards List -->
                  <v-slide-y-transition group tag="div" class="items-list">
                    <article v-for="(card, index) in numbersDraft.flipCards" :key="'card-' + index" class="item-card mb-6">
                      <header class="item-header">
                        <div class="item-heading">
                          <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                          <h4>{{ card.title || 'Impact Card' }}</h4>
                        </div>
                        <div class="card-actions">
                          <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.beyond || index === 0" @click="moveItem(numbersDraft.flipCards!, index, -1)">
                            <v-icon>mdi-chevron-up</v-icon>
                          </v-btn>
                          <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.beyond || index === (numbersDraft.flipCards?.length || 1) - 1" @click="moveItem(numbersDraft.flipCards!, index, 1)">
                            <v-icon>mdi-chevron-down</v-icon>
                          </v-btn>
                          <v-btn v-if="editingSections.beyond" icon color="error" variant="tonal" size="x-small" @click="removeItem(numbersDraft.flipCards!, index, 'Impact Card')">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </header>
                      
                      <div class="pa-5 d-flex flex-column ga-5">
                        <div class="d-flex ga-4 flex-wrap">
                          <v-text-field v-model="card.title" label="Card Title (e.g. Environment)" :disabled="!editingSections.beyond" hide-details density="comfortable" variant="outlined" class="flex-grow-1" />
                          <v-text-field v-model="card.preview" label="Preview Tagline (e.g. 570+ hectares protected)" :disabled="!editingSections.beyond" hide-details density="comfortable" variant="outlined" class="flex-grow-1" />
                        </div>

                        <v-textarea v-model="card.description" label="Card Summary Description" rows="2" :disabled="!editingSections.beyond" hide-details density="comfortable" variant="outlined" />
                        
                        <!-- Metric Bullets Block -->
                        <div class="border rounded-lg pa-5 bg-grey-lighten-5">
                          <div class="d-flex align-center justify-space-between mb-4 pb-2 border-b">
                            <span class="text-caption font-weight-bold text-uppercase text-primary">Key Metric Bullets</span>
                            <v-btn v-if="editingSections.beyond" color="primary" variant="tonal" size="x-small" @click="addCardDetail(card)">
                              <v-icon start size="small">mdi-plus</v-icon>
                              Add Bullet
                            </v-btn>
                          </div>
                          
                          <div class="d-flex flex-column ga-4 pt-1">
                            <div v-for="(detail, dIdx) in card.details" :key="'detail-' + dIdx" class="d-flex align-center ga-3 flex-wrap">
                              <v-text-field v-model="detail.value" label="Number" placeholder="570+" :disabled="!editingSections.beyond" hide-details density="compact" variant="outlined" style="max-width: 120px;" />
                              <v-text-field v-model="detail.label" label="Label" placeholder="Hectares" :disabled="!editingSections.beyond" hide-details density="compact" variant="outlined" style="max-width: 180px;" />
                              <v-text-field v-model="detail.desc" label="Short detail" placeholder="Description of metric" :disabled="!editingSections.beyond" hide-details density="compact" variant="outlined" class="flex-grow-1" />
                              <v-btn v-if="editingSections.beyond" icon color="error" variant="tonal" size="x-small" @click="removeCardDetail(card, dIdx)">
                                <v-icon size="small">mdi-close</v-icon>
                              </v-btn>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  </v-slide-y-transition>
                </div>
              </AdminEditorPanel>
            </template>

            <!-- ════════════════ TIMELINE TAB ════════════════ -->
            <template v-else-if="activeTab === 'timeline'">
              <!-- ── HERO ── -->
              <AdminEditorPanel
                :id="timelineSections[0].id"
                kicker="Hero section"
                heading="Timeline Headline & Intro"
                :editing="!!editingSections.hero"
                :collapsed="!!collapsedSections.hero"
                @toggle-edit="toggleEdit('hero')"
                @cancel="cancelEdit('hero')"
                @toggle-collapse="toggleCollapse('hero')"
              >
                <div class="panel-body form-grid">
                  <v-text-field v-model="timelineDraft.hero.eyebrow" label="Eyebrow tag" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="timelineDraft.hero.title" label="Main heading" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
                  <v-textarea v-model="timelineDraft.hero.description" label="Intro paragraph" rows="3" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" class="field-wide" />
                </div>
              </AdminEditorPanel>

              <!-- ── MILESTONES ── -->
              <AdminEditorPanel
                :id="timelineSections[1].id"
                kicker="History & Milestones"
                heading="Timeline Milestones"
                :editing="!!editingSections.milestones"
                :collapsed="!!collapsedSections.milestones"
                @toggle-edit="toggleEdit('milestones')"
                @cancel="cancelEdit('milestones')"
                @toggle-collapse="toggleCollapse('milestones')"
              >
                <template #actions="{ editing }">
                  <v-fade-transition>
                    <v-btn v-if="editing" color="accent" variant="flat" size="small" @click="addMilestone">
                      <v-icon start>mdi-plus</v-icon>
                      Add milestone
                    </v-btn>
                  </v-fade-transition>
                </template>

                <div class="pa-4">
                  <v-slide-y-transition group tag="div" class="items-list">
                    <article v-for="(milestone, index) in timelineDraft.milestones" :key="'ms-' + index" class="item-card">
                      <header class="item-header">
                        <div class="item-heading">
                          <span class="item-number">{{ milestone.year || String(index + 1).padStart(2, '0') }}</span>
                          <h4>{{ milestone.title || 'New milestone' }}</h4>
                        </div>
                        <div class="card-actions">
                          <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.milestones || index === 0" @click="moveItem(timelineDraft.milestones, index, -1)">
                            <v-icon>mdi-chevron-up</v-icon>
                          </v-btn>
                          <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.milestones || index === timelineDraft.milestones.length - 1" @click="moveItem(timelineDraft.milestones, index, 1)">
                            <v-icon>mdi-chevron-down</v-icon>
                          </v-btn>
                          <v-btn v-if="editingSections.milestones" icon color="error" variant="tonal" size="x-small" @click="removeItem(timelineDraft.milestones, index, 'milestone')">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </header>
                      <div class="image-editor-grid">
                        <div class="image-upload-panel">
                          <v-img :src="milestone.image || '/images/programs/hero-1.jpg'" aspect-ratio="1.5" cover class="image-preview card-preview" />
                          <AdminUploadButton
                            :disabled="!editingSections.milestones"
                            :description="`Milestone ${milestone.year || index} image`"
                            @update:model-value="(url) => (milestone.image = url)"
                          />
                        </div>
                        <div class="item-fields">
                          <v-text-field v-model="milestone.year" label="Year" :disabled="!editingSections.milestones" hide-details density="compact" variant="outlined" />
                          <v-text-field v-model="milestone.title" label="Title" :disabled="!editingSections.milestones" hide-details density="compact" variant="outlined" />
                          <v-textarea v-model="milestone.description" label="Short summary" rows="2" :disabled="!editingSections.milestones" hide-details density="compact" variant="outlined" class="field-wide" />
                          <v-textarea v-model="milestone.detail" label="Expanded details" rows="3" :disabled="!editingSections.milestones" hide-details density="compact" variant="outlined" class="field-wide" />
                        </div>
                      </div>
                    </article>
                  </v-slide-y-transition>
                </div>
              </AdminEditorPanel>
            </template>

            <!-- ════════════════ PARTNERS TAB ════════════════ -->
            <template v-else>
              <!-- ── HERO ── -->
              <AdminEditorPanel
                :id="partnersSections[0].id"
                kicker="Hero section"
                heading="Partners Headline & Intro"
                :editing="!!editingSections.hero"
                :collapsed="!!collapsedSections.hero"
                @toggle-edit="toggleEdit('hero')"
                @cancel="cancelEdit('hero')"
                @toggle-collapse="toggleCollapse('hero')"
              >
                <div class="panel-body form-grid">
                  <v-text-field v-model="partnersDraft.hero.eyebrow" label="Eyebrow tag" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="partnersDraft.hero.title" label="Main heading" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
                  <v-textarea v-model="partnersDraft.hero.description" label="Intro paragraph" rows="3" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" class="field-wide" />
                </div>
              </AdminEditorPanel>

              <!-- ── INTERNATIONAL PARTNERS ── -->
              <AdminEditorPanel
                :id="partnersSections[1].id"
                kicker="International Network"
                heading="International Supporters & Donors"
                :editing="!!editingSections.supporters"
                :collapsed="!!collapsedSections.supporters"
                @toggle-edit="toggleEdit('supporters')"
                @cancel="cancelEdit('supporters')"
                @toggle-collapse="toggleCollapse('supporters')"
              >
                <template #actions="{ editing }">
                  <v-fade-transition>
                    <v-btn v-if="editing" color="accent" variant="flat" size="small" @click="addPartner">
                      <v-icon start>mdi-plus</v-icon>
                      Add partner
                    </v-btn>
                  </v-fade-transition>
                </template>

                <div class="pa-4">
                  <!-- Section Header Editing -->
                  <div class="panel-subcard mb-6 pa-5 border rounded-lg bg-grey-lighten-5" v-if="partnersDraft.hero">
                    <div class="mb-4 pb-2 border-b">
                      <span class="text-caption font-weight-bold text-uppercase text-primary">Section Header</span>
                    </div>
                    <div class="d-flex flex-column ga-4 pt-1">
                      <v-text-field v-model="partnersDraft.hero.eyebrow" label="Section Eyebrow" placeholder="Our Network" :disabled="!editingSections.supporters" hide-details density="comfortable" variant="outlined" />
                      <v-text-field v-model="partnersDraft.hero.title" label="Section Heading" placeholder="Partners & Supporters" :disabled="!editingSections.supporters" hide-details density="comfortable" variant="outlined" />
                      <v-textarea v-model="partnersDraft.hero.description" label="Section Intro Description" placeholder="These organizations and institutions make our work possible..." rows="2" :disabled="!editingSections.supporters" hide-details density="comfortable" variant="outlined" />
                    </div>
                  </div>

                  <v-slide-y-transition group tag="div" class="items-list">
                    <article v-for="(partner, index) in partnersDraft.partners" :key="'pt-' + index" class="item-card">
                      <header class="item-header">
                        <div class="item-heading">
                          <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                          <h4>{{ partner.name || 'New partner' }}</h4>
                        </div>
                        <div class="card-actions">
                          <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.supporters || index === 0" @click="moveItem(partnersDraft.partners, index, -1)">
                            <v-icon>mdi-chevron-up</v-icon>
                          </v-btn>
                          <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.supporters || index === partnersDraft.partners.length - 1" @click="moveItem(partnersDraft.partners, index, 1)">
                            <v-icon>mdi-chevron-down</v-icon>
                          </v-btn>
                          <v-btn v-if="editingSections.supporters" icon color="error" variant="tonal" size="x-small" @click="removeItem(partnersDraft.partners, index, 'partner')">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </header>
                      <div class="image-editor-grid">
                        <div class="image-upload-panel logo-upload">
                          <div class="logo-preview-card">
                            <v-img :src="partner.image || logoUndp" aspect-ratio="2.2" contain class="logo-preview" />
                          </div>
                          <AdminUploadButton
                            :disabled="!editingSections.supporters"
                            :description="`Partner ${partner.name} logo`"
                            @update:model-value="(url) => (partner.image = url)"
                          />
                        </div>
                        <div class="item-fields">
                          <v-text-field v-model="partner.name" label="Partner Name" :disabled="!editingSections.supporters" hide-details density="compact" variant="outlined" />
                          <v-text-field v-model="partner.category" label="Category / Type" :disabled="!editingSections.supporters" hide-details density="compact" variant="outlined" />
                        </div>
                      </div>
                    </article>
                  </v-slide-y-transition>
                </div>
              </AdminEditorPanel>

              <!-- ── GOVERNMENT RELATIONS ── -->
              <AdminEditorPanel
                :id="partnersSections[2].id"
                kicker="Government Relations"
                heading="Ministries & Public Authorities"
                :editing="!!editingSections.government"
                :collapsed="!!collapsedSections.government"
                @toggle-edit="toggleEdit('government')"
                @cancel="cancelEdit('government')"
                @toggle-collapse="toggleCollapse('government')"
              >
                <template #actions="{ editing }">
                  <v-fade-transition>
                    <v-btn v-if="editing" color="accent" variant="flat" size="small" @click="addGovItem">
                      <v-icon start>mdi-plus</v-icon>
                      Add ministry
                    </v-btn>
                  </v-fade-transition>
                </template>

                <div class="pa-4">
                  <!-- Section Header Editing -->
                  <div class="panel-subcard mb-6 pa-5 border rounded-lg bg-grey-lighten-5" v-if="partnersDraft.governmentHeader">
                    <div class="mb-4 pb-2 border-b">
                      <span class="text-caption font-weight-bold text-uppercase text-primary">Section Header</span>
                    </div>
                    <div class="d-flex flex-column ga-4 pt-1">
                      <v-text-field v-model="partnersDraft.governmentHeader.heading" label="Section Heading" placeholder="Government Coordination" :disabled="!editingSections.government" hide-details density="comfortable" variant="outlined" />
                      <v-textarea v-model="partnersDraft.governmentHeader.body" label="Section Intro Description" placeholder="We work hand-in-hand..." rows="2" :disabled="!editingSections.government" hide-details density="comfortable" variant="outlined" />
                    </div>
                  </div>

                  <v-slide-y-transition group tag="div" class="items-list">
                    <article v-for="(gov, index) in partnersDraft.government" :key="'gov-' + index" class="item-card mb-4">
                      <header class="item-header">
                        <div class="item-heading">
                          <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                          <h4>{{ gov.title || 'New ministry' }}</h4>
                        </div>
                        <div class="card-actions">
                          <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.government || index === 0" @click="moveItem(partnersDraft.government, index, -1)">
                            <v-icon>mdi-chevron-up</v-icon>
                          </v-btn>
                          <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.government || index === partnersDraft.government.length - 1" @click="moveItem(partnersDraft.government, index, 1)">
                            <v-icon>mdi-chevron-down</v-icon>
                          </v-btn>
                          <v-btn v-if="editingSections.government" icon color="error" variant="tonal" size="x-small" @click="removeItem(partnersDraft.government, index, 'government partner')">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </header>
                      <div class="item-fields pa-4">
                        <v-text-field v-model="gov.title" label="Title" :disabled="!editingSections.government" hide-details density="compact" variant="outlined" />
                        <v-text-field v-model="gov.icon" label="Icon (building/tree/users/book/map-pin)" :disabled="!editingSections.government" hide-details density="compact" variant="outlined" />
                        <v-textarea v-model="gov.desc" label="Description" rows="2" :disabled="!editingSections.government" hide-details density="compact" variant="outlined" class="field-wide" />
                      </div>
                    </article>
                  </v-slide-y-transition>
                </div>
              </AdminEditorPanel>

              <!-- ── COMMUNITY ROOTS ── -->
              <AdminEditorPanel
                :id="partnersSections[3].id"
                kicker="Community Roots"
                heading="Local Committees & Pagodas"
                :editing="!!editingSections.local"
                :collapsed="!!collapsedSections.local"
                @toggle-edit="toggleEdit('local')"
                @cancel="cancelEdit('local')"
                @toggle-collapse="toggleCollapse('local')"
              >
                <template #actions="{ editing }">
                  <v-fade-transition>
                    <v-btn v-if="editing" color="accent" variant="flat" size="small" @click="addLocalItem">
                      <v-icon start>mdi-plus</v-icon>
                      Add local partner
                    </v-btn>
                  </v-fade-transition>
                </template>

                <div class="pa-4">
                  <!-- Section Header Editing -->
                  <div class="panel-subcard mb-6 pa-5 border rounded-lg bg-grey-lighten-5" v-if="partnersDraft.localHeader">
                    <div class="mb-4 pb-2 border-b">
                      <span class="text-caption font-weight-bold text-uppercase text-primary">Section Header</span>
                    </div>
                    <div class="d-flex flex-column ga-4 pt-1">
                      <v-text-field v-model="partnersDraft.localHeader.heading" label="Section Heading" placeholder="Local Partners" :disabled="!editingSections.local" hide-details density="comfortable" variant="outlined" />
                      <v-textarea v-model="partnersDraft.localHeader.body" label="Section Intro Description" placeholder="Sustainable change is built..." rows="2" :disabled="!editingSections.local" hide-details density="comfortable" variant="outlined" />
                    </div>
                  </div>

                  <v-slide-y-transition group tag="div" class="items-list">
                    <article v-for="(loc, index) in partnersDraft.local" :key="'loc-' + index" class="item-card mb-4">
                      <header class="item-header">
                        <div class="item-heading">
                          <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                          <h4>{{ loc.title || 'New local partner' }}</h4>
                        </div>
                        <div class="card-actions">
                          <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.local || index === 0" @click="moveItem(partnersDraft.local, index, -1)">
                            <v-icon>mdi-chevron-up</v-icon>
                          </v-btn>
                          <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.local || index === partnersDraft.local.length - 1" @click="moveItem(partnersDraft.local, index, 1)">
                            <v-icon>mdi-chevron-down</v-icon>
                          </v-btn>
                          <v-btn v-if="editingSections.local" icon color="error" variant="tonal" size="x-small" @click="removeItem(partnersDraft.local, index, 'local partner')">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </header>
                      <div class="item-fields pa-4">
                        <v-text-field v-model="loc.title" label="Title" :disabled="!editingSections.local" hide-details density="compact" variant="outlined" class="field-wide" />
                        <v-textarea v-model="loc.desc" label="Description" rows="2" :disabled="!editingSections.local" hide-details density="compact" variant="outlined" class="field-wide" />
                      </div>
                    </article>
                  </v-slide-y-transition>
                </div>
              </AdminEditorPanel>

              <!-- ── WHY PARTNERS STAY (TRUST) ── -->
              <AdminEditorPanel
                :id="partnersSections[4].id"
                kicker="Trust & Accountability"
                heading="Why Partners Stay"
                :editing="!!editingSections.why"
                :collapsed="!!collapsedSections.why"
                @toggle-edit="toggleEdit('why')"
                @cancel="cancelEdit('why')"
                @toggle-collapse="toggleCollapse('why')"
              >
                <template #actions="{ editing }">
                  <v-fade-transition>
                    <v-btn v-if="editing" color="accent" variant="flat" size="small" @click="addWhyItem">
                      <v-icon start>mdi-plus</v-icon>
                      Add Reason
                    </v-btn>
                  </v-fade-transition>
                </template>

                <div class="pa-4">
                  <!-- Section Header Editing -->
                  <div class="panel-subcard mb-6 pa-5 border rounded-lg bg-grey-lighten-5" v-if="partnersDraft.whyHeader">
                    <div class="mb-4 pb-2 border-b">
                      <span class="text-caption font-weight-bold text-uppercase text-primary">Section Header</span>
                    </div>
                    <div class="d-flex flex-column ga-4 pt-1">
                      <v-text-field v-model="partnersDraft.whyHeader.heading" label="Section Heading" placeholder="Why Partners Stay" :disabled="!editingSections.why" hide-details density="comfortable" variant="outlined" />
                      <v-textarea v-model="partnersDraft.whyHeader.body" label="Section Intro Description" placeholder="Long-term partnerships don't happen..." rows="2" :disabled="!editingSections.why" hide-details density="comfortable" variant="outlined" />
                    </div>
                  </div>

                  <v-slide-y-transition group tag="div" class="items-list">
                    <article v-for="(why, index) in partnersDraft.whyItems" :key="'why-' + index" class="item-card mb-4">
                      <header class="item-header">
                        <div class="item-heading">
                          <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                          <h4>{{ why.title || 'New Trust Factor' }}</h4>
                        </div>
                        <div class="card-actions">
                          <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.why || index === 0" @click="moveItem(partnersDraft.whyItems!, index, -1)">
                            <v-icon>mdi-chevron-up</v-icon>
                          </v-btn>
                          <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.why || index === (partnersDraft.whyItems?.length || 1) - 1" @click="moveItem(partnersDraft.whyItems!, index, 1)">
                            <v-icon>mdi-chevron-down</v-icon>
                          </v-btn>
                          <v-btn v-if="editingSections.why" icon color="error" variant="tonal" size="x-small" @click="removeItem(partnersDraft.whyItems!, index, 'Trust Factor')">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </header>
                      <div class="item-fields pa-4">
                        <v-text-field v-model="why.title" label="Title" :disabled="!editingSections.why" hide-details density="compact" variant="outlined" />
                        <v-text-field v-model="why.icon" label="Icon (building/bar-chart/handshake/rocket)" :disabled="!editingSections.why" hide-details density="compact" variant="outlined" />
                        <v-textarea v-model="why.desc" label="Description" rows="2" :disabled="!editingSections.why" hide-details density="compact" variant="outlined" class="field-wide" />
                      </div>
                    </article>
                  </v-slide-y-transition>
                </div>
              </AdminEditorPanel>
            </template>
          </div>
        </v-fade-transition>
      </main>
    </div>

    <AdminConfirmDialog
      v-model="confirmOpen"
      :title="confirmData.title"
      :body="confirmData.body"
      @confirm="confirmData.onConfirm()"
    />
  </v-app>
</template>

<style scoped>
.impact-admin {
  min-height: 100vh;
  background: var(--admin-bg);
  color: var(--admin-text);
  transition: padding-left 0.25s ease;
}

.admin-layout {
  min-height: 100vh;
}

.manager-main {
  min-height: 100vh;
  padding: 1.5rem 2rem 2.5rem;
}

.manager-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1rem 1.5rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
}

.manager-hero h1 {
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 1.32rem;
  line-height: 1.2;
}

.manager-title {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.content-grid {
  display: grid;
  gap: 1.1rem;
  margin-top: 1rem;
}

.panel-body {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.4rem 0.85rem;
}

.form-grid .field-wide {
  grid-column: 1 / -1;
}

.image-editor-grid {
  display: grid;
  grid-template-columns: minmax(220px, 0.7fr) minmax(300px, 1.3fr);
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
}

.image-upload-panel {
  display: grid;
  gap: 0.75rem;
  align-content: start;
}

.logo-upload {
  max-width: 220px;
}

.logo-preview-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 0.65rem 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-preview {
  width: 100%;
  max-height: 55px;
  background: transparent;
}

.items-list {
  display: grid;
  gap: 0.85rem;
}

.item-card {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  overflow: hidden;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.item-card:hover {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  box-shadow: 0 4px 14px rgba(15, 95, 73, 0.08);
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 32%, var(--admin-theme-surface));
  padding: 0.65rem 1.25rem;
}

.item-heading {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.item-heading h4 {
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 0.92rem;
  font-weight: 800;
}

.item-number {
  display: grid;
  width: 1.85rem;
  height: 1.85rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  border-radius: 6px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-primary-deep);
  font-size: 0.74rem;
  font-weight: 900;
  flex-shrink: 0;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.item-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.2rem 0.85rem;
  padding: 1.1rem 1.25rem;
}

.item-fields .field-wide {
  grid-column: 1 / -1;
}

@media (min-width: 900px) {
  .impact-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
    padding-top: calc(60px + 1rem);
  }

  .manager-hero,
  .item-header {
    align-items: stretch;
    flex-direction: column;
  }

  .image-editor-grid,
  .form-grid,
  .item-fields {
    grid-template-columns: 1fr;
  }
}
</style>
