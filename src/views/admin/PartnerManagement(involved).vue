<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Handshake,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-vue-next'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import type { SupportedLocale } from '@/i18n'
import { imageUploadHelpText, normalizeMediaUrl } from '@/lib/media'
import { useContentStore } from '@/stores/content.store'
import { useMediaStore } from '@/stores/media.store'
import { useUiStore } from '@/stores/ui.store'
import type { PageContent } from '@/types/content'

type PartnerLink = {
  label: string
  to: string
}

type PartnerSlide = {
  image: string
  caption: string
}

type PartnerHero = {
  eyebrow: string
  title: string
  description: string
  primaryCta: PartnerLink
  secondaryCta: PartnerLink
  slides: PartnerSlide[]
}

type PartnerProject = {
  period: string
  title: string
  partner: string
  focus: string
  image: string
}

type PartnerOperatingModel = {
  step: string
  title: string
  detail: string
  metric: string
}

type PartnerStrategicTheme = {
  title: string
  detail: string
  action: string
  icon?: 'growth' | 'strategy' | 'time' | 'investment' | 'chart' | 'global'
}

type PartnerNetwork = {
  label: string
  title: string
  detail: string
}

type PartnerFundingHistory = {
  name: string
  detail: string
}

type PartnerCta = {
  eyebrow: string
  title: string
  body: string
  primaryCta: PartnerLink
  secondaryCta: PartnerLink
  image: string
}

type PartnerPageContent = {
  hero: PartnerHero
  activeProjects: PartnerProject[]
  operatingModel: PartnerOperatingModel[]
  strategicThemes: PartnerStrategicTheme[]
  networks: PartnerNetwork[]
  fundingHistory: PartnerFundingHistory[]
  cta: PartnerCta
}

const PAGE_SLUG = 'get-involved-partner'
const MAX_PROJECTS = 12
const MAX_OPERATING_STEPS = 10
const MAX_THEMES = 12
const MAX_NETWORKS = 10
const MAX_FUNDERS = 12
const strategicIconOptions = ['growth', 'strategy', 'time', 'investment', 'chart', 'global'] as const

const fallbackContent: PartnerPageContent = {
  hero: {
    eyebrow: 'Get involved - Partner',
    title: 'Partner with Santi Sena',
    description:
      'Support practical programs with communities, local authorities, Buddhist networks and technical partners.',
    primaryCta: { label: 'Start a partnership', to: '/contact' },
    secondaryCta: { label: 'View portfolio', to: '#portfolio' },
    slides: [
      { image: '/src/assets/hero-impact-village.jpg', caption: '' },
      { image: '/src/assets/hero-impact-forest.jpg', caption: '' },
      { image: '/src/assets/hero-impact.jpg', caption: '' },
    ],
  },
  activeProjects: [
    {
      period: '2021-2024',
      title: 'Healthy environment for children',
      partner: 'Terre des Hommes Germany and BMZ',
      focus: 'Health and environment support for disadvantaged families in Svay Rieng.',
      image: '/images/programs/environment-hero1.jpg',
    },
    {
      period: '2023-2026',
      title: 'Mekong climate adaptation',
      partner: 'Terre des Hommes Germany and BMZ',
      focus: 'Children and youth action across Cambodia, Thailand, Laos PDR and Vietnam.',
      image: '/images/programs/hero-4.jpg',
    },
    {
      period: '2023-2025',
      title: 'Food security, sanitation and hygiene',
      partner: 'Lotus Outreach International',
      focus: 'Food security, sanitation and hygiene with rural communities.',
      image: '/images/programs/livelihood-hero2.jpg',
    },
    {
      period: '2024-2026',
      title: 'Buddhist primary education',
      partner: 'Khyentse Foundation',
      focus: 'Learning support through monastery-based primary schools.',
      image: '/images/programs/education-hero.jpg',
    },
    {
      period: '2023-2024',
      title: 'My Planet, My Right in ASEAN',
      partner: 'Terre des Hommes Germany',
      focus: 'Child and youth advocacy for environmental rights.',
      image: '/images/programs/child-protection2.jpg',
    },
  ],
  operatingModel: [
    {
      step: '01',
      title: 'Field teams',
      detail: 'Project staff work with beneficiaries, local authorities and government stakeholders.',
      metric: 'Local delivery',
    },
    {
      step: '02',
      title: 'Monthly plans',
      detail: 'Teams prepare action plans, budgets and achievement reports.',
      metric: 'Clear tracking',
    },
    {
      step: '03',
      title: 'Donor reports',
      detail: 'Progress reports are shared every three months or as required.',
      metric: 'Quarterly partner updates',
    },
    {
      step: '04',
      title: 'Monitoring and evaluation',
      detail: 'M&E includes staff, beneficiaries and local authorities.',
      metric: '3-month M&E rhythm',
    },
    {
      step: '05',
      title: 'Learning review',
      detail: 'Final reports capture lessons for the next project cycle.',
      metric: 'Lessons retained',
    },
  ],
  strategicThemes: [
    {
      title: 'Diversified funding',
      detail: 'Long-term donors and wider income sources improve stability.',
      action: 'Multi-year grants and local income streams.',
      icon: 'growth',
    },
    {
      title: 'Research and knowledge management',
      detail: 'Field learning can become research, evidence and advocacy.',
      action: 'Studies, learning notes and technical support.',
      icon: 'strategy',
    },
    {
      title: 'Social enterprise and rural markets',
      detail: 'Farmer groups and cooperatives need practical market links.',
      action: 'Producer coaching and enterprise support.',
      icon: 'investment',
    },
    {
      title: 'Resource center and outreach library',
      detail: 'Libraries connect children, youth and farmers to useful knowledge.',
      action: 'Books, outreach and digital learning.',
      icon: 'global',
    },
    {
      title: 'Climate and WASH readiness',
      detail: 'Villages need practical systems for water, hygiene and climate adaptation.',
      action: 'Technical design, training and resilient infrastructure.',
      icon: 'chart',
    },
    {
      title: 'Child rights and safe migration',
      detail: 'Young people benefit when protection networks can respond early.',
      action: 'Safeguarding systems, outreach and peer education.',
      icon: 'time',
    },
  ],
  networks: [
    {
      label: 'National civil society',
      title: 'NGO Forum and CRC Cambodia',
      detail: 'Coordination on child rights, environment and development.',
    },
    {
      label: 'Faith and peace',
      title: 'United Religions Initiative',
      detail: "A values-based network linked to Santi Sena's Buddhist roots.",
    },
    {
      label: 'Regional biodiversity',
      title: 'Working Group for Bio-diversity in Southeast Asia',
      detail: 'Regional learning for natural resources and climate adaptation.',
    },
    {
      label: 'Community intermediaries',
      title: 'Monks, youth and child-peer promoters',
      detail: 'Local people who carry awareness into villages.',
    },
  ],
  fundingHistory: [
    {
      name: 'Development donors',
      detail: 'CIDSE Cambodia, OXFAM G.B., Pact Cambodia, U.S. Embassy and CRS.',
    },
    {
      name: 'UN and multilateral support',
      detail: 'UNDP-GEF-SGP, UNDP-PTF-SGP and ADB through Plan Cambodia.',
    },
    {
      name: 'Child and community partners',
      detail: 'Tdh Netherlands, ChildFund, Heifer and Habitat Cambodia.',
    },
    {
      name: 'WASH and education partners',
      detail: 'Global Sanitation Fund through Plan International Cambodia and Khyentse Foundation.',
    },
  ],
  cta: {
    eyebrow: 'Partner with us',
    title: 'Bring funding, technical skill or learning capacity into a working field system.',
    body: 'Share your focus area and timeframe. The team can match it to current programs and community priorities.',
    primaryCta: { label: 'Contact partnerships team', to: '/contact' },
    secondaryCta: { label: 'Explore programs', to: '/programs' },
    image: '/images/programs/hero-1.jpg',
  },
}

const contentStore = useContentStore()
const media = useMediaStore()
const ui = useUiStore()
const { locale } = useI18n()

const pageRow = ref<PageContent | null>(null)
const loading = ref(true)
const saving = ref(false)
const uploadingKey = ref('')
const loadError = ref('')
const savedAt = ref('')
const imageHint = imageUploadHelpText()

const draft = reactive<PartnerPageContent>(cloneContent(fallbackContent))

const activeLocale = computed<SupportedLocale>(() =>
  locale.value === 'kh' ? 'kh' : 'en',
)
const activeLocaleName = computed(() =>
  activeLocale.value === 'kh' ? 'Khmer' : 'English',
)
const ctaPreview = computed(() => resolveImageUrl(draft.cta.image, fallbackContent.cta.image))
const canAddProject = computed(() => draft.activeProjects.length < MAX_PROJECTS)
const canAddOperatingStep = computed(() => draft.operatingModel.length < MAX_OPERATING_STEPS)
const canAddTheme = computed(() => draft.strategicThemes.length < MAX_THEMES)
const canAddNetwork = computed(() => draft.networks.length < MAX_NETWORKS)
const canAddFunder = computed(() => draft.fundingHistory.length < MAX_FUNDERS)

onMounted(() => {
  void loadPage()
})

watch(activeLocale, () => {
  void loadPage()
})

async function loadPage() {
  loading.value = true
  loadError.value = ''

  try {
    const page = await contentStore.fetchBySlug(PAGE_SLUG, activeLocale.value)
    pageRow.value = page
    replaceDraft(mergeContent(fallbackContent, parseCmsBody(page?.body ?? '')))
    savedAt.value = page?.updated_at ?? ''
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load Partner content.'
    ui.addToast(loadError.value, 'error')
  } finally {
    loading.value = false
  }
}

function replaceDraft(content: PartnerPageContent) {
  draft.hero = {
    ...content.hero,
    primaryCta: { ...content.hero.primaryCta },
    secondaryCta: { ...content.hero.secondaryCta },
    slides: content.hero.slides.map(cloneSlide),
  }
  draft.activeProjects = content.activeProjects.map(cloneProject)
  draft.operatingModel = content.operatingModel.map((item) => ({ ...item }))
  draft.strategicThemes = content.strategicThemes.map((item) => ({ ...item }))
  draft.networks = content.networks.map((item) => ({ ...item }))
  draft.fundingHistory = content.fundingHistory.map((item) => ({ ...item }))
  draft.cta = {
    ...content.cta,
    primaryCta: { ...content.cta.primaryCta },
    secondaryCta: { ...content.cta.secondaryCta },
  }
}

async function savePage() {
  if (saving.value) return

  const validationError = validateDraft()
  if (validationError) {
    ui.addToast(validationError, 'error')
    return
  }

  saving.value = true

  try {
    const content = prepareForSave(draft)
    const saved = await contentStore.upsert({
      id: pageRow.value?.id ?? '',
      slug: PAGE_SLUG,
      title: 'Get Involved - Partner',
      body: JSON.stringify(content, null, 2),
      locale: activeLocale.value,
      route_path: '/get-involved/partner',
      nav_group: 'Get Involved',
      template: 'partner',
      status: 'published',
      updated_at: pageRow.value?.updated_at ?? '',
    })

    pageRow.value = saved
    replaceDraft(content)
    savedAt.value = saved.updated_at
    ui.addToast(`Partner ${activeLocaleName.value} content saved.`, 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save Partner content.', 'error')
  } finally {
    saving.value = false
  }
}

async function uploadImage(event: Event, key: string, applyUrl: (url: string) => void) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploadingKey.value = key
  try {
    const uploaded = await media.uploadToGoogleDrive(file, `Partner ${key} image`)
    applyUrl(normalizeMediaUrl(uploaded.url))
    ui.addToast('Image uploaded.', 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not upload image.', 'error')
  } finally {
    uploadingKey.value = ''
    input.value = ''
  }
}

function addProject() {
  if (!canAddProject.value) return
  draft.activeProjects.push({
    period: '2026',
    title: 'New partner project',
    partner: 'Partner name',
    focus: 'Describe the project focus and community result.',
    image: '/images/programs/hero-1.jpg',
  })
}

function addOperatingStep() {
  if (!canAddOperatingStep.value) return
  const stepNumber = draft.operatingModel.length + 1
  draft.operatingModel.push({
    step: String(stepNumber).padStart(2, '0'),
    title: 'New working step',
    detail: 'Describe how Santi Sena works with partners at this step.',
    metric: 'Tracking note',
  })
}

function addTheme() {
  if (!canAddTheme.value) return
  draft.strategicThemes.push({
    title: 'New strategic theme',
    detail: 'Describe the opportunity for future partner support.',
    action: 'Suggested partner action.',
    icon: 'growth',
  })
}

function addNetwork() {
  if (!canAddNetwork.value) return
  draft.networks.push({
    label: 'Network type',
    title: 'New network partner',
    detail: 'Describe how this network supports the work.',
  })
}

function addFunder() {
  if (!canAddFunder.value) return
  draft.fundingHistory.push({
    name: 'New funding group',
    detail: 'List related donors or describe their support.',
  })
}

function removeItem<T extends { title?: string; name?: string }>(
  items: T[],
  index: number,
  label: string,
) {
  const item = items[index]
  if (!item) return

  const itemTitle = item.title || item.name || 'this item'
  ui.openModal(
    `Remove ${label}?`,
    `Remove "${itemTitle}" from the public Partner page?`,
    () => {
      items.splice(index, 1)
      ui.addToast(`${label} removed.`, 'warning')
    },
  )
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= items.length) return

  const current = items[index]
  const next = items[target]
  if (!current || !next) return

  items[index] = next
  items[target] = current
}

function resetToDefaults() {
  ui.openModal(
    'Reset Partner content?',
    'Restore all partner page sections to the current public defaults?',
    () => {
      replaceDraft(cloneContent(fallbackContent))
      ui.addToast('Default Partner draft restored.', 'info')
    },
  )
}

function prepareForSave(content: PartnerPageContent): PartnerPageContent {
  return {
    hero: {
      ...content.hero,
      primaryCta: { ...content.hero.primaryCta },
      secondaryCta: { ...content.hero.secondaryCta },
      slides: content.hero.slides
        .map((slide) => ({
          image: normalizeMediaUrl(slide.image),
          caption: slide.caption.trim(),
        }))
        .filter((slide) => slide.image),
    },
    activeProjects: content.activeProjects.map((project) => ({
      period: project.period.trim(),
      title: project.title.trim(),
      partner: project.partner.trim(),
      focus: project.focus.trim(),
      image: normalizeMediaUrl(project.image),
    })),
    operatingModel: content.operatingModel.map((item, index) => ({
      step: item.step.trim() || String(index + 1).padStart(2, '0'),
      title: item.title.trim(),
      detail: item.detail.trim(),
      metric: item.metric.trim(),
    })),
    strategicThemes: content.strategicThemes.map((item) => ({
      title: item.title.trim(),
      detail: item.detail.trim(),
      action: item.action.trim(),
      icon: item.icon,
    })),
    networks: content.networks.map((item) => ({
      label: item.label.trim(),
      title: item.title.trim(),
      detail: item.detail.trim(),
    })),
    fundingHistory: content.fundingHistory.map((item) => ({
      name: item.name.trim(),
      detail: item.detail.trim(),
    })),
    cta: {
      ...content.cta,
      eyebrow: content.cta.eyebrow.trim(),
      title: content.cta.title.trim(),
      body: content.cta.body.trim(),
      image: normalizeMediaUrl(content.cta.image),
      primaryCta: { ...content.cta.primaryCta },
      secondaryCta: { ...content.cta.secondaryCta },
    },
  }
}

function validateDraft() {
  if (!draft.activeProjects.length) return 'Add at least one active project.'

  const invalidProjectIndex = draft.activeProjects.findIndex(
    (project) =>
      !project.period.trim() ||
      !project.title.trim() ||
      !project.partner.trim() ||
      !project.focus.trim() ||
      !project.image.trim(),
  )
  if (invalidProjectIndex >= 0) return `Project ${invalidProjectIndex + 1} needs all fields and an image.`

  if (draft.operatingModel.some((item) => !item.title.trim() || !item.detail.trim())) {
    return 'Each operating step needs a title and detail.'
  }
  if (draft.strategicThemes.some((item) => !item.title.trim() || !item.detail.trim())) {
    return 'Each strategic theme needs a title and detail.'
  }
  if (draft.networks.some((item) => !item.label.trim() || !item.title.trim())) {
    return 'Each network needs a label and title.'
  }
  if (draft.fundingHistory.some((item) => !item.name.trim() || !item.detail.trim())) {
    return 'Each funding history item needs a name and detail.'
  }
  if (!draft.cta.title.trim() || !draft.cta.image.trim()) return 'CTA title and image are required.'

  return ''
}

function parseCmsBody(body: string): Partial<PartnerPageContent> | null {
  if (!body.trim()) return null

  try {
    const parsed = JSON.parse(body) as unknown
    return isRecord(parsed) ? (parsed as Partial<PartnerPageContent>) : null
  } catch {
    return null
  }
}

function mergeContent(
  base: PartnerPageContent,
  override: Partial<PartnerPageContent> | null,
): PartnerPageContent {
  if (!override) return cloneContent(base)

  const hero: Record<string, unknown> = isRecord(override.hero) ? override.hero : {}
  const cta: Record<string, unknown> = isRecord(override.cta) ? override.cta : {}

  return {
    hero: {
      ...base.hero,
      ...hero,
      primaryCta: mergeObject(base.hero.primaryCta, hero.primaryCta),
      secondaryCta: mergeObject(base.hero.secondaryCta, hero.secondaryCta),
      slides: mergeSlides(hero.slides, base.hero.slides),
    },
    activeProjects: mergeArray(override.activeProjects, base.activeProjects, cloneProject),
    operatingModel: mergeArray(override.operatingModel, base.operatingModel, (item) => ({ ...item })),
    strategicThemes: mergeArray(override.strategicThemes, base.strategicThemes, (item) => ({ ...item })),
    networks: mergeArray(override.networks, base.networks, (item) => ({ ...item })),
    fundingHistory: mergeArray(override.fundingHistory, base.fundingHistory, (item) => ({ ...item })),
    cta: {
      ...base.cta,
      ...cta,
      primaryCta: mergeObject(base.cta.primaryCta, cta.primaryCta),
      secondaryCta: mergeObject(base.cta.secondaryCta, cta.secondaryCta),
    },
  }
}

function mergeSlides(override: unknown, fallback: PartnerSlide[]) {
  if (!Array.isArray(override) || !override.length) return fallback.map(cloneSlide)
  return override.filter(isRecord).map((slide) => ({
    image: getString(slide.image),
    caption: getString(slide.caption),
  }))
}

function mergeArray<T>(override: unknown, fallback: T[], clone: (item: T) => T) {
  return Array.isArray(override) && override.length
    ? (override as T[]).map(clone)
    : fallback.map(clone)
}

function mergeObject<T>(base: T, override: unknown): T {
  return isRecord(override) ? ({ ...base, ...override } as T) : { ...base }
}

function cloneContent(content: PartnerPageContent): PartnerPageContent {
  return {
    hero: {
      ...content.hero,
      primaryCta: { ...content.hero.primaryCta },
      secondaryCta: { ...content.hero.secondaryCta },
      slides: content.hero.slides.map(cloneSlide),
    },
    activeProjects: content.activeProjects.map(cloneProject),
    operatingModel: content.operatingModel.map((item) => ({ ...item })),
    strategicThemes: content.strategicThemes.map((item) => ({ ...item })),
    networks: content.networks.map((item) => ({ ...item })),
    fundingHistory: content.fundingHistory.map((item) => ({ ...item })),
    cta: {
      ...content.cta,
      primaryCta: { ...content.cta.primaryCta },
      secondaryCta: { ...content.cta.secondaryCta },
    },
  }
}

function cloneSlide(slide: PartnerSlide): PartnerSlide {
  return { ...slide }
}

function cloneProject(project: PartnerProject): PartnerProject {
  return { ...project }
}

function resolveImageUrl(url: string, fallback: string) {
  const normalized = normalizeMediaUrl(url)
  return normalized || fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : ''
}
</script>

<template>
  <div :class="['partner-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <p class="eyebrow">Get Involved / Partner</p>
            <h1>Manage partner page</h1>
            <div class="manager-meta" aria-label="Editable partner content summary">
              <span>{{ activeLocaleName }} content</span>
              <span>{{ draft.activeProjects.length }} projects</span>
              <span>{{ draft.strategicThemes.length }} themes</span>
              <span v-if="savedAt">Saved</span>
            </div>
          </div>
          <div class="hero-actions">
            <RouterLink class="btn btn-secondary" to="/get-involved/partner">
              <ExternalLink :size="16" aria-hidden="true" />
              <span>View page</span>
            </RouterLink>
            <button type="button" class="btn btn-ghost" @click="resetToDefaults">
              <RotateCcw :size="16" aria-hidden="true" />
              <span>Reset draft</span>
            </button>
            <button type="button" class="btn btn-primary" :disabled="saving" @click="savePage">
              <Save :size="16" aria-hidden="true" />
              <span>{{ saving ? 'Saving...' : 'Save changes' }}</span>
            </button>
          </div>
        </header>

        <div v-if="loading" class="state-card">Loading Partner content...</div>
        <div v-else-if="loadError" class="state-card state-card-error">
          <span>{{ loadError }}</span>
          <button type="button" class="btn btn-secondary" @click="loadPage">Try again</button>
        </div>

        <div v-else class="manager-shell">
          <aside class="section-path" aria-label="Partner page sections">
            <a href="#partner-projects">Portfolio</a>
            <a href="#partner-model">Operating model</a>
            <a href="#partner-themes">Strategic themes</a>
            <a href="#partner-networks">Networks</a>
            <a href="#partner-funding">Funding history</a>
            <a href="#partner-cta">Final CTA</a>
          </aside>

          <div class="content-grid">
            <section id="partner-projects" class="editor-panel" aria-labelledby="partner-projects-heading">
              <div class="panel-header">
                <div>
                  <p class="panel-kicker">Portfolio path</p>
                  <h2 id="partner-projects-heading">Active projects</h2>
                </div>
                <button type="button" class="btn btn-secondary" :disabled="!canAddProject" @click="addProject">
                  <Plus :size="16" aria-hidden="true" />
                  <span>Add project</span>
                </button>
              </div>

              <div class="item-list">
                <article v-for="(project, index) in draft.activeProjects" :key="index" class="record-card">
                  <header class="record-header">
                    <div class="record-title">
                      <span class="record-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <div>
                        <h3>{{ project.title || 'Untitled project' }}</h3>
                        <p>{{ project.partner || 'No partner yet' }}</p>
                      </div>
                    </div>
                    <div class="card-actions">
                      <button type="button" class="icon-btn" :disabled="index === 0" aria-label="Move project up" @click="moveItem(draft.activeProjects, index, -1)">
                        <ArrowUp :size="15" aria-hidden="true" />
                      </button>
                      <button type="button" class="icon-btn" :disabled="index === draft.activeProjects.length - 1" aria-label="Move project down" @click="moveItem(draft.activeProjects, index, 1)">
                        <ArrowDown :size="15" aria-hidden="true" />
                      </button>
                      <button type="button" class="icon-btn danger" aria-label="Remove project" @click="removeItem(draft.activeProjects, index, 'project')">
                        <Trash2 :size="15" aria-hidden="true" />
                      </button>
                    </div>
                  </header>

                  <div class="record-body project-body">
                    <figure class="image-preview project-preview">
                      <img :src="resolveImageUrl(project.image, fallbackContent.activeProjects[0]?.image ?? '')" alt="" />
                    </figure>
                    <div class="form-grid">
                      <label class="field">
                        <span>Period</span>
                        <input v-model="project.period" type="text" />
                      </label>
                      <label class="field">
                        <span>Project title</span>
                        <input v-model="project.title" type="text" />
                      </label>
                      <label class="field wide">
                        <span>Partner</span>
                        <input v-model="project.partner" type="text" />
                      </label>
                      <label class="field wide">
                        <span>Focus</span>
                        <textarea v-model="project.focus" rows="2"></textarea>
                      </label>
                      <label class="field wide">
                        <span>Image URL</span>
                        <input v-model="project.image" type="url" :placeholder="imageHint" />
                      </label>
                      <label class="upload-box compact wide">
                        <Upload :size="16" aria-hidden="true" />
                        <span>{{ uploadingKey === `project-${index}` ? 'Uploading...' : 'Upload project image' }}</span>
                        <input
                          type="file"
                          accept="image/*"
                          :disabled="uploadingKey === `project-${index}`"
                          @change="uploadImage($event, `project-${index}`, (url) => (project.image = url))"
                        />
                      </label>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <section id="partner-model" class="editor-panel" aria-labelledby="partner-model-heading">
              <div class="panel-header">
                <div>
                  <p class="panel-kicker">Delivery path</p>
                  <h2 id="partner-model-heading">Operating model</h2>
                </div>
                <button type="button" class="btn btn-secondary" :disabled="!canAddOperatingStep" @click="addOperatingStep">
                  <Plus :size="16" aria-hidden="true" />
                  <span>Add step</span>
                </button>
              </div>

              <div class="compact-list">
                <article v-for="(step, index) in draft.operatingModel" :key="index" class="compact-card">
                  <header class="compact-header">
                    <strong>{{ step.step || String(index + 1).padStart(2, '0') }}</strong>
                    <div class="card-actions">
                      <button type="button" class="icon-btn" :disabled="index === 0" aria-label="Move step up" @click="moveItem(draft.operatingModel, index, -1)">
                        <ArrowUp :size="15" aria-hidden="true" />
                      </button>
                      <button type="button" class="icon-btn" :disabled="index === draft.operatingModel.length - 1" aria-label="Move step down" @click="moveItem(draft.operatingModel, index, 1)">
                        <ArrowDown :size="15" aria-hidden="true" />
                      </button>
                      <button type="button" class="icon-btn danger" aria-label="Remove step" @click="removeItem(draft.operatingModel, index, 'step')">
                        <Trash2 :size="15" aria-hidden="true" />
                      </button>
                    </div>
                  </header>
                  <div class="form-grid">
                    <label class="field">
                      <span>Step</span>
                      <input v-model="step.step" type="text" />
                    </label>
                    <label class="field">
                      <span>Metric</span>
                      <input v-model="step.metric" type="text" />
                    </label>
                    <label class="field wide">
                      <span>Title</span>
                      <input v-model="step.title" type="text" />
                    </label>
                    <label class="field wide">
                      <span>Detail</span>
                      <textarea v-model="step.detail" rows="2"></textarea>
                    </label>
                  </div>
                </article>
              </div>
            </section>

            <section id="partner-themes" class="editor-panel" aria-labelledby="partner-themes-heading">
              <div class="panel-header">
                <div>
                  <p class="panel-kicker">Strategy path</p>
                  <h2 id="partner-themes-heading">Strategic partnership themes</h2>
                </div>
                <button type="button" class="btn btn-secondary" :disabled="!canAddTheme" @click="addTheme">
                  <Plus :size="16" aria-hidden="true" />
                  <span>Add theme</span>
                </button>
              </div>

              <div class="compact-list two-col">
                <article v-for="(theme, index) in draft.strategicThemes" :key="index" class="compact-card">
                  <header class="compact-header">
                    <strong>{{ theme.title || 'New theme' }}</strong>
                    <div class="card-actions">
                      <button type="button" class="icon-btn" :disabled="index === 0" aria-label="Move theme up" @click="moveItem(draft.strategicThemes, index, -1)">
                        <ArrowUp :size="15" aria-hidden="true" />
                      </button>
                      <button type="button" class="icon-btn" :disabled="index === draft.strategicThemes.length - 1" aria-label="Move theme down" @click="moveItem(draft.strategicThemes, index, 1)">
                        <ArrowDown :size="15" aria-hidden="true" />
                      </button>
                      <button type="button" class="icon-btn danger" aria-label="Remove theme" @click="removeItem(draft.strategicThemes, index, 'theme')">
                        <Trash2 :size="15" aria-hidden="true" />
                      </button>
                    </div>
                  </header>
                  <div class="form-grid">
                    <label class="field">
                      <span>Title</span>
                      <input v-model="theme.title" type="text" />
                    </label>
                    <label class="field">
                      <span>Icon</span>
                      <select v-model="theme.icon">
                        <option v-for="icon in strategicIconOptions" :key="icon" :value="icon">
                          {{ icon }}
                        </option>
                      </select>
                    </label>
                    <label class="field wide">
                      <span>Detail</span>
                      <textarea v-model="theme.detail" rows="2"></textarea>
                    </label>
                    <label class="field wide">
                      <span>Partner action</span>
                      <input v-model="theme.action" type="text" />
                    </label>
                  </div>
                </article>
              </div>
            </section>

            <section id="partner-networks" class="editor-panel" aria-labelledby="partner-networks-heading">
              <div class="panel-header">
                <div>
                  <p class="panel-kicker">Relationship path</p>
                  <h2 id="partner-networks-heading">Networks and local intermediaries</h2>
                </div>
                <button type="button" class="btn btn-secondary" :disabled="!canAddNetwork" @click="addNetwork">
                  <Plus :size="16" aria-hidden="true" />
                  <span>Add network</span>
                </button>
              </div>

              <div class="compact-list two-col">
                <article v-for="(network, index) in draft.networks" :key="index" class="compact-card">
                  <header class="compact-header">
                    <strong>{{ network.title || 'New network' }}</strong>
                    <div class="card-actions">
                      <button type="button" class="icon-btn" :disabled="index === 0" aria-label="Move network up" @click="moveItem(draft.networks, index, -1)">
                        <ArrowUp :size="15" aria-hidden="true" />
                      </button>
                      <button type="button" class="icon-btn" :disabled="index === draft.networks.length - 1" aria-label="Move network down" @click="moveItem(draft.networks, index, 1)">
                        <ArrowDown :size="15" aria-hidden="true" />
                      </button>
                      <button type="button" class="icon-btn danger" aria-label="Remove network" @click="removeItem(draft.networks, index, 'network')">
                        <Trash2 :size="15" aria-hidden="true" />
                      </button>
                    </div>
                  </header>
                  <div class="form-grid">
                    <label class="field">
                      <span>Label</span>
                      <input v-model="network.label" type="text" />
                    </label>
                    <label class="field">
                      <span>Title</span>
                      <input v-model="network.title" type="text" />
                    </label>
                    <label class="field wide">
                      <span>Detail</span>
                      <textarea v-model="network.detail" rows="2"></textarea>
                    </label>
                  </div>
                </article>
              </div>
            </section>

            <section id="partner-funding" class="editor-panel" aria-labelledby="partner-funding-heading">
              <div class="panel-header">
                <div>
                  <p class="panel-kicker">Trust path</p>
                  <h2 id="partner-funding-heading">Funding history</h2>
                </div>
                <button type="button" class="btn btn-secondary" :disabled="!canAddFunder" @click="addFunder">
                  <Plus :size="16" aria-hidden="true" />
                  <span>Add funder</span>
                </button>
              </div>

              <div class="compact-list two-col">
                <article v-for="(funder, index) in draft.fundingHistory" :key="index" class="compact-card">
                  <header class="compact-header">
                    <strong>{{ funder.name || 'New funder' }}</strong>
                    <div class="card-actions">
                      <button type="button" class="icon-btn" :disabled="index === 0" aria-label="Move funder up" @click="moveItem(draft.fundingHistory, index, -1)">
                        <ArrowUp :size="15" aria-hidden="true" />
                      </button>
                      <button type="button" class="icon-btn" :disabled="index === draft.fundingHistory.length - 1" aria-label="Move funder down" @click="moveItem(draft.fundingHistory, index, 1)">
                        <ArrowDown :size="15" aria-hidden="true" />
                      </button>
                      <button type="button" class="icon-btn danger" aria-label="Remove funder" @click="removeItem(draft.fundingHistory, index, 'funder')">
                        <Trash2 :size="15" aria-hidden="true" />
                      </button>
                    </div>
                  </header>
                  <div class="form-grid">
                    <label class="field">
                      <span>Name</span>
                      <input v-model="funder.name" type="text" />
                    </label>
                    <label class="field wide">
                      <span>Detail</span>
                      <textarea v-model="funder.detail" rows="2"></textarea>
                    </label>
                  </div>
                </article>
              </div>
            </section>

            <section id="partner-cta" class="editor-panel" aria-labelledby="partner-cta-heading">
              <div class="panel-header">
                <div>
                  <p class="panel-kicker">Final path</p>
                  <h2 id="partner-cta-heading">Bottom call to action</h2>
                </div>
                <Handshake :size="20" aria-hidden="true" />
              </div>

              <div class="image-editor-grid">
                <figure class="image-preview hero-preview">
                  <img :src="ctaPreview" alt="" />
                </figure>

                <div class="form-stack">
                  <div class="form-grid">
                    <label class="field">
                      <span>Small label</span>
                      <input v-model="draft.cta.eyebrow" type="text" />
                    </label>
                    <label class="field wide">
                      <span>Heading</span>
                      <textarea v-model="draft.cta.title" rows="2"></textarea>
                    </label>
                    <label class="field wide">
                      <span>Body</span>
                      <textarea v-model="draft.cta.body" rows="3"></textarea>
                    </label>
                    <label class="field wide">
                      <span>Background image URL</span>
                      <input v-model="draft.cta.image" type="url" :placeholder="imageHint" />
                    </label>
                    <label class="upload-box compact wide">
                      <Upload :size="16" aria-hidden="true" />
                      <span>{{ uploadingKey === 'cta' ? 'Uploading...' : 'Upload CTA image' }}</span>
                      <input
                        type="file"
                        accept="image/*"
                        :disabled="uploadingKey === 'cta'"
                        @change="uploadImage($event, 'cta', (url) => (draft.cta.image = url))"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.partner-admin {
  min-height: 100vh;
  background: var(--admin-theme-bg);
  color: var(--admin-theme-text);
  transition: padding-left 0.25s ease;
}

.admin-layout {
  min-height: 100vh;
}

.manager-main {
  min-height: 100vh;
  padding: 1.25rem;
  padding-top: calc(60px + 1.25rem);
}

.manager-hero,
.editor-panel,
.section-path {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
}

.manager-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1rem 1.1rem;
}

.manager-hero h1,
.manager-hero p,
.editor-panel h2,
.editor-panel p,
.subsection-header h3,
.subsection-header p {
  margin: 0;
}

.manager-hero h1 {
  color: var(--admin-theme-contrast);
  font-size: 1.32rem;
  line-height: 1.2;
}

.manager-title {
  display: grid;
  gap: 0.32rem;
}

.manager-meta,
.hero-actions,
.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.manager-meta span {
  border: 1px solid var(--admin-theme-border);
  border-radius: 999px;
  background: var(--admin-theme-surface-soft);
  color: var(--admin-theme-muted);
  padding: 0.18rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 800;
}

.eyebrow,
.panel-kicker {
  color: var(--admin-theme-primary-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.btn,
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 38px;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 0.55rem 0.8rem;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.btn:hover,
.icon-btn:hover {
  transform: translateY(-1px);
}

.btn:disabled,
.icon-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.btn-primary {
  border-color: var(--admin-theme-primary-deep);
  background: linear-gradient(180deg, var(--admin-theme-primary), var(--admin-theme-primary-deep));
  color: #ffffff;
  box-shadow: 0 10px 20px color-mix(in srgb, var(--admin-theme-primary) 22%, transparent);
}

.btn-secondary,
.btn-ghost,
.icon-btn {
  border-color: color-mix(in srgb, var(--admin-theme-contrast-soft) 42%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-surface) 86%, var(--admin-theme-contrast) 14%);
  color: var(--admin-theme-contrast);
}

.btn-ghost {
  background: var(--admin-theme-surface);
}

.icon-btn {
  width: 34px;
  min-height: 34px;
  padding: 0;
}

.icon-btn.danger {
  border-color: color-mix(in srgb, var(--admin-theme-danger) 64%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-danger) 9%, var(--admin-theme-surface));
  color: var(--admin-theme-danger);
}

.btn-secondary:hover,
.btn-ghost:hover,
.icon-btn:hover {
  border-color: var(--admin-theme-primary);
  background: color-mix(in srgb, var(--admin-theme-primary) 10%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.icon-btn.danger:hover {
  border-color: var(--admin-theme-danger);
  background: var(--admin-theme-danger);
  color: #ffffff;
}

.state-card {
  margin-top: 1rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-muted);
  padding: 1rem;
}

.state-card-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--admin-theme-danger);
}

.manager-shell {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
  margin-top: 1rem;
}

.section-path {
  position: sticky;
  top: calc(60px + 1.25rem);
  display: grid;
  gap: 0.25rem;
  padding: 0.55rem;
}

.section-path a {
  border-radius: 6px;
  color: var(--admin-theme-muted);
  padding: 0.55rem 0.65rem;
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
}

.section-path a:hover {
  background: color-mix(in srgb, var(--admin-theme-primary) 10%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.content-grid,
.form-stack,
.item-list,
.compact-list {
  display: grid;
  gap: 0.9rem;
}

.editor-panel {
  overflow: hidden;
  scroll-margin-top: calc(60px + 1rem);
}

.panel-header,
.subsection-header,
.record-header,
.compact-header,
.mini-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.panel-header {
  border-bottom: 1px solid var(--admin-theme-border);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 44%, var(--admin-theme-surface));
  padding: 0.85rem 1rem;
}

.panel-header h2 {
  color: var(--admin-theme-contrast);
  font-size: 1rem;
}

.image-editor-grid {
  display: grid;
  grid-template-columns: minmax(300px, 0.72fr) minmax(360px, 1.28fr);
  gap: 1.1rem;
  padding: 1.1rem;
}

.image-preview {
  margin: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 34%, var(--admin-theme-border));
  border-radius: 7px;
  background: var(--admin-theme-surface);
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 8%, transparent),
    0 12px 24px rgba(15, 95, 73, 0.11);
}

.image-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-preview {
  aspect-ratio: 16 / 10;
}

.project-preview {
  aspect-ratio: 1.22;
  min-height: 210px;
}

.thumb-preview {
  aspect-ratio: 1.4;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.field,
.upload-box {
  display: grid;
  gap: 0.35rem;
  color: var(--admin-theme-muted);
  font-size: 0.8rem;
  font-weight: 800;
}

.field span,
.upload-box span {
  color: var(--admin-theme-contrast-soft);
}

.field input,
.field textarea,
.field select,
.upload-box input {
  width: 100%;
  border: 1px solid var(--admin-theme-border-strong);
  border-radius: 6px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-text);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.65rem 0.75rem;
}

.field textarea {
  resize: vertical;
  line-height: 1.5;
}

.field input:focus,
.field textarea:focus,
.field select:focus,
.upload-box input:focus {
  border-color: var(--admin-theme-primary);
  outline: 3px solid color-mix(in srgb, var(--admin-theme-primary) 15%, transparent);
}

.wide {
  grid-column: 1 / -1;
}

.upload-box {
  grid-template-columns: auto 1fr;
  align-items: center;
  border: 1px dashed var(--admin-theme-border-strong);
  border-radius: 7px;
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 38%, var(--admin-theme-surface));
  padding: 0.75rem;
}

.upload-box input {
  grid-column: 1 / -1;
  padding: 0.55rem;
}

.upload-box.compact {
  padding: 0.65rem;
}

.nested-section {
  border-top: 1px solid var(--admin-theme-border);
  padding: 1rem;
}

.subsection-header h3,
.record-title h3 {
  color: var(--admin-theme-contrast);
  font-size: 0.96rem;
  margin: 0;
}

.subsection-header p,
.record-title p {
  color: var(--admin-theme-muted);
  font-size: 0.76rem;
  font-weight: 700;
  margin: 0.18rem 0 0;
}

.slide-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
  margin-top: 0.85rem;
}

.mini-card,
.record-card,
.compact-card {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  overflow: hidden;
}

.mini-card {
  display: grid;
  gap: 0.75rem;
  padding: 0.75rem;
}

.mini-card-header strong,
.compact-header strong {
  min-width: 0;
  color: var(--admin-theme-contrast);
  font-size: 0.84rem;
  line-height: 1.25;
}

.item-list {
  padding: 1rem;
}

.record-header,
.compact-header {
  align-items: center;
  border-bottom: 1px solid var(--admin-theme-border);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 32%, var(--admin-theme-surface));
  padding: 0.75rem 0.85rem;
}

.record-title {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.record-number {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  border-radius: 6px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-primary-deep);
  font-size: 0.74rem;
  font-weight: 900;
}

.record-body {
  padding: 0.9rem;
}

.project-body {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.compact-list {
  padding: 1rem;
}

.compact-list.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.compact-card .form-grid {
  padding: 0.85rem;
}

:global(.admin-dark) .btn-primary {
  color: #071311;
}

@media (min-width: 900px) {
  .partner-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 1100px) {
  .manager-shell {
    grid-template-columns: 1fr;
  }

  .section-path {
    position: static;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .slide-grid,
  .compact-list.two-col {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
    padding-top: calc(60px + 1rem);
  }

  .manager-hero,
  .panel-header,
  .subsection-header,
  .record-header,
  .compact-header,
  .mini-card-header {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-actions,
  .hero-actions .btn,
  .card-actions {
    width: 100%;
  }

  .card-actions .icon-btn {
    flex: 1;
  }

  .section-path,
  .slide-grid,
  .image-editor-grid,
  .form-grid,
  .project-body,
  .compact-list.two-col {
    grid-template-columns: 1fr;
  }
}
</style>
