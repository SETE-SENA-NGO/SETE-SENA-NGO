<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
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

type ActionLink = { label: string; to: string }
type PartnerSlide = { image: string; caption: string }
type PartnerHero = { eyebrow: string; title: string; description: string; primaryCta: ActionLink; secondaryCta: ActionLink; slides: PartnerSlide[] }
type PartnerProject = { period: string; title: string; partner: string; focus: string; image: string }
type PartnerOperatingModel = { step: string; title: string; detail: string; metric: string }
type PartnerStrategicTheme = { title: string; detail: string; action: string; icon?: string }
type PartnerNetwork = { label: string; title: string; detail: string }
type PartnerFundingHistory = { name: string; detail: string }
type PartnerCta = { eyebrow: string; title: string; body: string; primaryCta: ActionLink; secondaryCta: ActionLink; image: string }

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function getString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
function resolveImageUrl(url: string, fallback: string): string {
  return url.trim() ? url : fallback
}

const fallbackContent: PartnerPageContent = {
  hero: {
    eyebrow: 'Get involved - Partner', title: 'Partner with Santi Sena',
    description: 'Support practical programs with communities, local authorities, Buddhist networks and technical partners.',
    primaryCta: { label: 'Start a partnership', to: '/contact' }, secondaryCta: { label: 'View portfolio', to: '#portfolio' },
    slides: [{ image: '/src/assets/hero-impact-village.jpg', caption: '' }, { image: '/src/assets/hero-impact-forest.jpg', caption: '' }, { image: '/src/assets/hero-impact.jpg', caption: '' }],
  },
  activeProjects: [
    { period: '2021-2024', title: 'Healthy environment for children', partner: 'Terre des Hommes Germany and BMZ', focus: 'Health and environment support for disadvantaged families in Svay Rieng.', image: '/images/programs/environment-hero1.jpg' },
    { period: '2023-2026', title: 'Mekong climate adaptation', partner: 'Terre des Hommes Germany and BMZ', focus: 'Children and youth action across Cambodia, Thailand, Laos PDR and Vietnam.', image: '/images/programs/hero-4.jpg' },
    { period: '2023-2025', title: 'Food security, sanitation and hygiene', partner: 'Lotus Outreach International', focus: 'Food security, sanitation and hygiene with rural communities.', image: '/images/programs/livelihood-hero2.jpg' },
    { period: '2024-2026', title: 'Buddhist primary education', partner: 'Khyentse Foundation', focus: 'Learning support through monastery-based primary schools.', image: '/images/programs/education-hero.jpg' },
    { period: '2023-2024', title: 'My Planet, My Right in ASEAN', partner: 'Terre des Hommes Germany', focus: 'Child and youth advocacy for environmental rights.', image: '/images/programs/child-protection2.jpg' },
  ],
  operatingModel: [
    { step: '01', title: 'Field teams', detail: 'Project staff work with beneficiaries, local authorities and government stakeholders.', metric: 'Local delivery' },
    { step: '02', title: 'Monthly plans', detail: 'Teams prepare action plans, budgets and achievement reports.', metric: 'Clear tracking' },
    { step: '03', title: 'Donor reports', detail: 'Progress reports are shared every three months or as required.', metric: 'Quarterly partner updates' },
    { step: '04', title: 'Monitoring and evaluation', detail: 'M&E includes staff, beneficiaries and local authorities.', metric: '3-month M&E rhythm' },
    { step: '05', title: 'Learning review', detail: 'Final reports capture lessons for the next project cycle.', metric: 'Lessons retained' },
  ],
  strategicThemes: [
    { title: 'Diversified funding', detail: 'Long-term donors and wider income sources improve stability.', action: 'Multi-year grants and local income streams.', icon: 'growth' },
    { title: 'Research and knowledge management', detail: 'Field learning can become research, evidence and advocacy.', action: 'Studies, learning notes and technical support.', icon: 'strategy' },
    { title: 'Social enterprise and rural markets', detail: 'Farmer groups and cooperatives need practical market links.', action: 'Producer coaching and enterprise support.', icon: 'investment' },
    { title: 'Resource center and outreach library', detail: 'Libraries connect children, youth and farmers to useful knowledge.', action: 'Books, outreach and digital learning.', icon: 'global' },
    { title: 'Climate and WASH readiness', detail: 'Villages need practical systems for water, hygiene and climate adaptation.', action: 'Technical design, training and resilient infrastructure.', icon: 'chart' },
    { title: 'Child rights and safe migration', detail: 'Young people benefit when protection networks can respond early.', action: 'Safeguarding systems, outreach and peer education.', icon: 'time' },
  ],
  networks: [
    { label: 'National civil society', title: 'NGO Forum and CRC Cambodia', detail: 'Coordination on child rights, environment and development.' },
    { label: 'Faith and peace', title: 'United Religions Initiative', detail: "A values-based network linked to Santi Sena's Buddhist roots." },
    { label: 'Regional biodiversity', title: 'Working Group for Bio-diversity in Southeast Asia', detail: 'Regional learning for natural resources and climate adaptation.' },
    { label: 'Community intermediaries', title: 'Monks, youth and child-peer promoters', detail: 'Local people who carry awareness into villages.' },
  ],
  fundingHistory: [
    { name: 'Development donors', detail: 'CIDSE Cambodia, OXFAM G.B., Pact Cambodia, U.S. Embassy and CRS.' },
    { name: 'UN and multilateral support', detail: 'UNDP-GEF-SGP, UNDP-PTF-SGP and ADB through Plan Cambodia.' },
    { name: 'Child and community partners', detail: 'Tdh Netherlands, ChildFund, Heifer and Habitat Cambodia.' },
    { name: 'WASH and education partners', detail: 'Global Sanitation Fund through Plan International Cambodia and Khyentse Foundation.' },
  ],
  cta: {
    eyebrow: 'Partner with us', title: 'Bring funding, technical skill or learning capacity into a working field system.',
    body: 'Share your focus area and timeframe. The team can match it to current programs and community priorities.',
    primaryCta: { label: 'Contact partnerships team', to: '/contact' }, secondaryCta: { label: 'Explore programs', to: '/programs' },
    image: '/images/programs/hero-1.jpg',
  },
}

const contentStore = useContentStore()
const ui = useUiStore()
const { locale } = useI18n()
const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

useAdminTheme()

const pageRow = ref<PageContent | null>(null)
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const draft = reactive<PartnerPageContent>(cloneContent(fallbackContent))

const {
  editingSections, collapsedSections, toggleCollapse, toggleEdit, cancelEdit,
  setupSectionWatch, stopSectionWatch, resetEditingState,
} = useSectionEditor([
  {
    key: 'hero',
    getSnapshot: () => ({ ...draft.hero, primaryCta: { ...draft.hero.primaryCta }, secondaryCta: { ...draft.hero.secondaryCta }, slides: draft.hero.slides.map((s) => ({ ...s })) }),
    applySnapshot: (v) => { draft.hero = v },
  },
  {
    key: 'projects',
    getSnapshot: () => draft.activeProjects.map((p) => ({ ...p })),
    applySnapshot: (v) => { draft.activeProjects = v },
  },
  {
    key: 'model',
    getSnapshot: () => draft.operatingModel.map((m) => ({ ...m })),
    applySnapshot: (v) => { draft.operatingModel = v },
  },
  {
    key: 'themes',
    getSnapshot: () => draft.strategicThemes.map((t) => ({ ...t })),
    applySnapshot: (v) => { draft.strategicThemes = v },
  },
  {
    key: 'networks',
    getSnapshot: () => draft.networks.map((n) => ({ ...n })),
    applySnapshot: (v) => { draft.networks = v },
  },
  {
    key: 'funding',
    getSnapshot: () => draft.fundingHistory.map((f) => ({ ...f })),
    applySnapshot: (v) => { draft.fundingHistory = v },
  },
  {
    key: 'cta',
    getSnapshot: () => ({ ...draft.cta, primaryCta: { ...draft.cta.primaryCta }, secondaryCta: { ...draft.cta.secondaryCta } }),
    applySnapshot: (v) => { draft.cta = v },
  },
])

const originalSnapshot = ref('')
const hasChanges = computed(() => JSON.stringify(cloneContent(draft)) !== originalSnapshot.value)
function updateSnapshot() { originalSnapshot.value = JSON.stringify(cloneContent(draft)) }

const activeLocale = computed<SupportedLocale>(() => locale.value === 'kh' ? 'kh' : 'en')
const activeLocaleName = computed(() => activeLocale.value === 'kh' ? 'Khmer' : 'English')

const ctaPreview = computed(() => resolveImageUrl(draft.cta.image, fallbackContent.cta.image))
const canAddProject = computed(() => draft.activeProjects.length < MAX_PROJECTS)
const canAddOperatingStep = computed(() => draft.operatingModel.length < MAX_OPERATING_STEPS)
const canAddTheme = computed(() => draft.strategicThemes.length < MAX_THEMES)
const canAddNetwork = computed(() => draft.networks.length < MAX_NETWORKS)
const canAddFunder = computed(() => draft.fundingHistory.length < MAX_FUNDERS)

const sections = [
  { id: 'partner-hero', label: 'Hero', icon: 'mdi-creation' },
  { id: 'partner-projects', label: 'Portfolio', icon: 'mdi-folder-heart' },
  { id: 'partner-model', label: 'Model', icon: 'mdi-chart-timeline' },
  { id: 'partner-themes', label: 'Themes', icon: 'mdi-lightbulb-group' },
  { id: 'partner-networks', label: 'Networks', icon: 'mdi-network' },
  { id: 'partner-funding', label: 'Funding', icon: 'mdi-bank' },
  { id: 'partner-cta-section', label: 'CTA', icon: 'mdi-handshake' },
] as const

const { activeSection, scrollToSection, updateActiveSectionFromScroll } = useScrollSpyNav(sections)
useUnsavedChangesGuard(hasChanges)

onMounted(() => { contentStore.useLocalFallback(); void loadPage() })
onUnmounted(() => { stopSectionWatch() })
watch(activeLocale, () => { void loadPage() })

async function loadPage() {
  resetEditingState(); loading.value = true; loadError.value = ''
  try {
    const page = await contentStore.fetchBySlug(PAGE_SLUG, activeLocale.value)
    pageRow.value = page
    replaceDraft(mergeContent(fallbackContent, parseCmsBody(page?.body ?? '')))
    updateSnapshot()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load Partner content.'
    ui.addToast(loadError.value, 'error')
  } finally { loading.value = false; setupSectionWatch() }
}

function replaceDraft(content: PartnerPageContent) {
  draft.hero = { ...content.hero, primaryCta: { ...content.hero.primaryCta }, secondaryCta: { ...content.hero.secondaryCta }, slides: content.hero.slides.map((s) => ({ ...s })) }
  draft.activeProjects = content.activeProjects.map((p) => ({ ...p }))
  draft.operatingModel = content.operatingModel.map((m) => ({ ...m }))
  draft.strategicThemes = content.strategicThemes.map((t) => ({ ...t }))
  draft.networks = content.networks.map((n) => ({ ...n }))
  draft.fundingHistory = content.fundingHistory.map((f) => ({ ...f }))
  draft.cta = { ...content.cta, primaryCta: { ...content.cta.primaryCta }, secondaryCta: { ...content.cta.secondaryCta } }
}

async function savePage() {
  if (saving.value) return
  const validationError = validateDraft()
  if (validationError) { ui.addToast(validationError, 'error'); return }
  saving.value = true
  try {
    const content = prepareForSave(draft)
    const saved = await contentStore.upsert({ id: pageRow.value?.id ?? '', slug: PAGE_SLUG, title: 'Get Involved - Partner', body: JSON.stringify(content, null, 2), locale: activeLocale.value, route_path: '/get-involved/partner', nav_group: 'Get Involved', template: 'partner', status: 'published', updated_at: pageRow.value?.updated_at ?? '' })
    pageRow.value = saved; replaceDraft(content); updateSnapshot()
    ui.addToast(`Partner ${activeLocaleName.value} content saved.`, 'success')
  } catch (error) { ui.addToast(error instanceof Error ? error.message : 'Could not save Partner content.', 'error')
  } finally { saving.value = false }
}

function addProject() { if (!canAddProject.value) return; draft.activeProjects.push({ period: '2026', title: 'New partner project', partner: 'Partner name', focus: 'Describe the project focus.', image: '/images/programs/hero-1.jpg' }) }
function addOperatingStep() { if (!canAddOperatingStep.value) return; const n = draft.operatingModel.length + 1; draft.operatingModel.push({ step: String(n).padStart(2, '0'), title: 'New working step', detail: 'Describe how Santi Sena works with partners at this step.', metric: 'Tracking note' }) }
function addTheme() { if (!canAddTheme.value) return; draft.strategicThemes.push({ title: 'New strategic theme', detail: 'Describe the opportunity.', action: 'Suggested partner action.', icon: 'growth' }) }
function addNetwork() { if (!canAddNetwork.value) return; draft.networks.push({ label: 'Network type', title: 'New network partner', detail: 'Describe how this network supports the work.' }) }
function addFunder() { if (!canAddFunder.value) return; draft.fundingHistory.push({ name: 'New funding group', detail: 'List related donors.' }) }

function removeItem<T extends { title?: string; name?: string }>(items: T[], index: number, label: string) {
  const item = items[index]; if (!item) return
  const itemTitle = item.title || item.name || 'this item'
  confirmDialog(`Remove ${label}?`, `Remove "${itemTitle}" from the public Partner page?`, () => { items.splice(index, 1); ui.addToast(`${label} removed.`, 'warning') })
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction; if (target < 0 || target >= items.length) return
  const a = items[index]; const b = items[target]; if (!a || !b) return
  items[index] = b; items[target] = a
}

function prepareForSave(content: PartnerPageContent): PartnerPageContent {
  return {
    hero: { ...content.hero, primaryCta: { ...content.hero.primaryCta }, secondaryCta: { ...content.hero.secondaryCta }, slides: content.hero.slides.map((s) => ({ image: normalizeMediaUrl(s.image), caption: s.caption.trim() })).filter((s) => s.image) },
    activeProjects: content.activeProjects.map((p) => ({ period: p.period.trim(), title: p.title.trim(), partner: p.partner.trim(), focus: p.focus.trim(), image: normalizeMediaUrl(p.image) })),
    operatingModel: content.operatingModel.map((m, i) => ({ step: m.step.trim() || String(i + 1).padStart(2, '0'), title: m.title.trim(), detail: m.detail.trim(), metric: m.metric.trim() })),
    strategicThemes: content.strategicThemes.map((t) => ({ title: t.title.trim(), detail: t.detail.trim(), action: t.action.trim(), icon: t.icon })),
    networks: content.networks.map((n) => ({ label: n.label.trim(), title: n.title.trim(), detail: n.detail.trim() })),
    fundingHistory: content.fundingHistory.map((f) => ({ name: f.name.trim(), detail: f.detail.trim() })),
    cta: { ...content.cta, eyebrow: content.cta.eyebrow.trim(), title: content.cta.title.trim(), body: content.cta.body.trim(), image: normalizeMediaUrl(content.cta.image), primaryCta: { ...content.cta.primaryCta }, secondaryCta: { ...content.cta.secondaryCta } },
  }
}

function validateDraft() {
  if (!draft.activeProjects.length) return 'Add at least one active project.'
  const invalidProject = draft.activeProjects.findIndex((p) => !p.period.trim() || !p.title.trim() || !p.partner.trim() || !p.focus.trim() || !p.image.trim())
  if (invalidProject >= 0) return `Project ${invalidProject + 1} needs all fields and an image.`
  if (draft.operatingModel.some((m) => !m.title.trim() || !m.detail.trim())) return 'Each operating step needs a title and detail.'
  if (draft.strategicThemes.some((t) => !t.title.trim() || !t.detail.trim())) return 'Each strategic theme needs a title and detail.'
  if (draft.networks.some((n) => !n.label.trim() || !n.title.trim())) return 'Each network needs a label and title.'
  if (draft.fundingHistory.some((f) => !f.name.trim() || !f.detail.trim())) return 'Each funding history item needs a name and detail.'
  if (!draft.cta.title.trim() || !draft.cta.image.trim()) return 'CTA title and image are required.'
  return ''
}

function parseCmsBody(body: string): Partial<PartnerPageContent> | null {
  if (!body.trim()) return null
  try { const parsed = JSON.parse(body) as unknown; return isRecord(parsed) ? (parsed as Partial<PartnerPageContent>) : null } catch { return null }
}

function mergeContent(base: PartnerPageContent, override: Partial<PartnerPageContent> | null): PartnerPageContent {
  if (!override) return cloneContent(base)
  const hero = isRecord(override.hero) ? override.hero : {}
  const cta = isRecord(override.cta) ? override.cta : {}
  return {
    hero: { ...base.hero, ...hero, primaryCta: mergeObject(base.hero.primaryCta, hero.primaryCta), secondaryCta: mergeObject(base.hero.secondaryCta, hero.secondaryCta), slides: Array.isArray(hero.slides) && hero.slides.length ? hero.slides.map((s: any) => ({ ...s })) : base.hero.slides.map((s) => ({ ...s })) },
    activeProjects: Array.isArray(override.activeProjects) && override.activeProjects.length ? override.activeProjects.map((p) => ({ ...p })) : base.activeProjects.map((p) => ({ ...p })),
    operatingModel: Array.isArray(override.operatingModel) && override.operatingModel.length ? override.operatingModel.map((m) => ({ ...m })) : base.operatingModel.map((m) => ({ ...m })),
    strategicThemes: Array.isArray(override.strategicThemes) && override.strategicThemes.length ? override.strategicThemes.map((t) => ({ ...t })) : base.strategicThemes.map((t) => ({ ...t })),
    networks: Array.isArray(override.networks) && override.networks.length ? override.networks.map((n) => ({ ...n })) : base.networks.map((n) => ({ ...n })),
    fundingHistory: Array.isArray(override.fundingHistory) && override.fundingHistory.length ? override.fundingHistory.map((f) => ({ ...f })) : base.fundingHistory.map((f) => ({ ...f })),
    cta: { ...base.cta, ...cta, primaryCta: mergeObject(base.cta.primaryCta, cta.primaryCta), secondaryCta: mergeObject(base.cta.secondaryCta, cta.secondaryCta) },
  }
}

function mergeObject<T>(base: T, override: unknown): T {
  return isRecord(override) ? { ...base, ...override } as T : { ...base }
}

function cloneContent(content: PartnerPageContent): PartnerPageContent {
  return {
    hero: { ...content.hero, primaryCta: { ...content.hero.primaryCta }, secondaryCta: { ...content.hero.secondaryCta }, slides: content.hero.slides.map((s) => ({ ...s })) },
    activeProjects: content.activeProjects.map((p) => ({ ...p })),
    operatingModel: content.operatingModel.map((m) => ({ ...m })),
    strategicThemes: content.strategicThemes.map((t) => ({ ...t })),
    networks: content.networks.map((n) => ({ ...n })),
    fundingHistory: content.fundingHistory.map((f) => ({ ...f })),
    cta: { ...content.cta, primaryCta: { ...content.cta.primaryCta }, secondaryCta: { ...content.cta.secondaryCta } },
  }
}
</script>

<template>
  <v-app :class="['partner-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Manage partner page</h1>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" color="primary" to="/get-involved/partner" target="_blank">
              <v-icon start>mdi-open-in-new</v-icon>
              View page
            </v-btn>
          </div>
        </header>

        <v-fade-transition mode="out-in" @after-enter="updateActiveSectionFromScroll">
          <div v-if="loading" key="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading Partner content...</span>
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
            :sections="sections"
            :active-section="activeSection"
            :has-changes="hasChanges"
            :saving="saving"
            aria-label="Partner page sections"
            save-label="Save Change"
            @navigate="scrollToSection"
            @save="savePage"
          />

          <!-- ═══ HERO ═══ -->
          <AdminEditorPanel
            :id="sections[0].id"
            kicker="Hero section"
            heading="Partner page hero"
            :editing="!!editingSections.hero"
            :collapsed="!!collapsedSections.hero"
            @toggle-edit="toggleEdit('hero')"
            @cancel="cancelEdit('hero')"
            @toggle-collapse="toggleCollapse('hero')"
          >
            <div class="panel-body form-grid">
              <v-text-field v-model="draft.hero.eyebrow" label="Small label" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.hero.title" label="Section heading" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.hero.description" label="Section description" rows="3" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" class="field-wide" />
              <v-text-field v-model="draft.hero.primaryCta.label" label="Primary CTA label" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.hero.secondaryCta.label" label="Secondary CTA label" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
            </div>
          </AdminEditorPanel>

          <!-- ═══ PORTFOLIO ═══ -->
          <AdminEditorPanel
            :id="sections[1].id"
            kicker="Active projects"
            heading="Portfolio of projects"
            :editing="!!editingSections.projects"
            :collapsed="!!collapsedSections.projects"
            @toggle-edit="toggleEdit('projects')"
            @cancel="cancelEdit('projects')"
            @toggle-collapse="toggleCollapse('projects')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddProject" @click="addProject">
                  <v-icon start>mdi-plus</v-icon>
                  Add project
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="cards-list">
                <article v-for="(project, index) in draft.activeProjects" :key="'proj-' + index" class="card-editor">
                  <header class="card-editor-header">
                    <div class="card-heading">
                      <span class="card-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <div>
                        <h3>{{ project.title || 'Untitled project' }}</h3>
                        <p>{{ project.partner || 'No partner yet' }}</p>
                      </div>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.projects || index === 0" @click="moveItem(draft.activeProjects, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.projects || index === draft.activeProjects.length - 1" @click="moveItem(draft.activeProjects, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.projects" icon color="error" variant="tonal" size="small" @click="removeItem(draft.activeProjects, index, 'project')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>

                  <div class="card-editor-top">
                    <div class="image-upload-panel card-image-upload">
                      <v-img :src="resolveImageUrl(project.image, fallbackContent.activeProjects[0]?.image ?? '')" aspect-ratio="1.35" cover class="image-preview card-preview" />
                      <AdminUploadButton :disabled="!editingSections.projects" :description="`Partner project-${index} image`" @update:model-value="(url) => (project.image = url)" />
                    </div>
                  </div>

                  <div class="card-form-grid">
                    <v-text-field v-model="project.period" label="Period" :disabled="!editingSections.projects" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="project.title" label="Project title" :disabled="!editingSections.projects" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="project.partner" label="Partner" :disabled="!editingSections.projects" hide-details density="comfortable" variant="outlined" />
                    <v-textarea v-model="project.focus" label="Focus" rows="3" :disabled="!editingSections.projects" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ═══ MODEL ═══ -->
          <AdminEditorPanel
            :id="sections[2].id"
            kicker="Delivery path"
            heading="Operating model steps"
            :editing="!!editingSections.model"
            :collapsed="!!collapsedSections.model"
            @toggle-edit="toggleEdit('model')"
            @cancel="cancelEdit('model')"
            @toggle-collapse="toggleCollapse('model')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddOperatingStep" @click="addOperatingStep">
                  <v-icon start>mdi-plus</v-icon>
                  Add step
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="cards-list two-col">
                <article v-for="(step, index) in draft.operatingModel" :key="'step-' + index" class="card-editor">
                  <header class="card-editor-header">
                    <div class="card-heading">
                      <span class="card-number">{{ step.step || String(index + 1).padStart(2, '0') }}</span>
                      <div>
                        <h3>{{ step.title || 'Untitled step' }}</h3>
                        <p>{{ step.metric || 'No metric' }}</p>
                      </div>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.model || index === 0" @click="moveItem(draft.operatingModel, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.model || index === draft.operatingModel.length - 1" @click="moveItem(draft.operatingModel, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.model" icon color="error" variant="tonal" size="small" @click="removeItem(draft.operatingModel, index, 'operating step')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="card-form-grid">
                    <v-text-field v-model="step.step" label="Step" :disabled="!editingSections.model" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="step.metric" label="Metric" :disabled="!editingSections.model" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="step.title" label="Title" :disabled="!editingSections.model" hide-details density="comfortable" variant="outlined" class="field-wide" />
                    <v-textarea v-model="step.detail" label="Detail" rows="2" :disabled="!editingSections.model" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ═══ THEMES ═══ -->
          <AdminEditorPanel
            :id="sections[3].id"
            kicker="Strategy path"
            heading="Strategic partnership themes"
            :editing="!!editingSections.themes"
            :collapsed="!!collapsedSections.themes"
            @toggle-edit="toggleEdit('themes')"
            @cancel="cancelEdit('themes')"
            @toggle-collapse="toggleCollapse('themes')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddTheme" @click="addTheme">
                  <v-icon start>mdi-plus</v-icon>
                  Add theme
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="cards-list two-col">
                <article v-for="(theme, index) in draft.strategicThemes" :key="'theme-' + index" class="card-editor">
                  <header class="card-editor-header">
                    <div class="card-heading">
                      <h3>{{ theme.title || 'New theme' }}</h3>
                      <p>{{ theme.icon || 'No icon' }}</p>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.themes || index === 0" @click="moveItem(draft.strategicThemes, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.themes || index === draft.strategicThemes.length - 1" @click="moveItem(draft.strategicThemes, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.themes" icon color="error" variant="tonal" size="small" @click="removeItem(draft.strategicThemes, index, 'strategic theme')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="card-form-grid">
                    <v-text-field v-model="theme.title" label="Title" :disabled="!editingSections.themes" hide-details density="comfortable" variant="outlined" />
                    <v-select v-model="theme.icon" :items="strategicIconOptions" label="Icon" :disabled="!editingSections.themes" hide-details density="comfortable" variant="outlined" />
                    <v-textarea v-model="theme.detail" label="Detail" rows="2" :disabled="!editingSections.themes" hide-details density="comfortable" variant="outlined" class="field-wide" />
                    <v-text-field v-model="theme.action" label="Partner action" :disabled="!editingSections.themes" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ═══ NETWORKS ═══ -->
          <AdminEditorPanel
            :id="sections[4].id"
            kicker="Relationship path"
            heading="Networks and local intermediaries"
            :editing="!!editingSections.networks"
            :collapsed="!!collapsedSections.networks"
            @toggle-edit="toggleEdit('networks')"
            @cancel="cancelEdit('networks')"
            @toggle-collapse="toggleCollapse('networks')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddNetwork" @click="addNetwork">
                  <v-icon start>mdi-plus</v-icon>
                  Add network
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="cards-list two-col">
                <article v-for="(network, index) in draft.networks" :key="'net-' + index" class="card-editor">
                  <header class="card-editor-header">
                    <div class="card-heading">
                      <h3>{{ network.title || 'New network' }}</h3>
                      <p>{{ network.label || 'No label' }}</p>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.networks || index === 0" @click="moveItem(draft.networks, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.networks || index === draft.networks.length - 1" @click="moveItem(draft.networks, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.networks" icon color="error" variant="tonal" size="small" @click="removeItem(draft.networks, index, 'network')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="card-form-grid">
                    <v-text-field v-model="network.label" label="Label" :disabled="!editingSections.networks" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="network.title" label="Title" :disabled="!editingSections.networks" hide-details density="comfortable" variant="outlined" />
                    <v-textarea v-model="network.detail" label="Detail" rows="2" :disabled="!editingSections.networks" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ═══ FUNDING ═══ -->
          <AdminEditorPanel
            :id="sections[5].id"
            kicker="Trust path"
            heading="Funding history"
            :editing="!!editingSections.funding"
            :collapsed="!!collapsedSections.funding"
            @toggle-edit="toggleEdit('funding')"
            @cancel="cancelEdit('funding')"
            @toggle-collapse="toggleCollapse('funding')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddFunder" @click="addFunder">
                  <v-icon start>mdi-plus</v-icon>
                  Add funder
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="cards-list two-col">
                <article v-for="(funder, index) in draft.fundingHistory" :key="'fund-' + index" class="card-editor">
                  <header class="card-editor-header">
                    <div class="card-heading">
                      <h3>{{ funder.name || 'New funder' }}</h3>
                      <p>{{ funder.detail ? funder.detail.slice(0, 40) + '...' : 'No detail' }}</p>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.funding || index === 0" @click="moveItem(draft.fundingHistory, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.funding || index === draft.fundingHistory.length - 1" @click="moveItem(draft.fundingHistory, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.funding" icon color="error" variant="tonal" size="small" @click="removeItem(draft.fundingHistory, index, 'funder')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="card-form-grid">
                    <v-text-field v-model="funder.name" label="Name" :disabled="!editingSections.funding" hide-details density="comfortable" variant="outlined" />
                    <v-textarea v-model="funder.detail" label="Detail" rows="2" :disabled="!editingSections.funding" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ═══ CTA ═══ -->
          <AdminEditorPanel
            :id="sections[6].id"
            kicker="Final path"
            heading="Bottom call to action"
            :editing="!!editingSections.cta"
            :collapsed="!!collapsedSections.cta"
            @toggle-edit="toggleEdit('cta')"
            @cancel="cancelEdit('cta')"
            @toggle-collapse="toggleCollapse('cta')"
          >
            <div class="image-editor-grid">
              <div class="image-upload-panel">
                <v-img :src="ctaPreview" aspect-ratio="1.6" cover class="image-preview hero-preview" />
                <AdminUploadButton :disabled="!editingSections.cta" description="Partner CTA image" @update:model-value="(url) => (draft.cta.image = url)" />
              </div>

              <div class="form-stack">
                <div class="form-grid">
                  <v-text-field v-model="draft.cta.eyebrow" label="Small label" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
                  <v-textarea v-model="draft.cta.title" label="Heading" rows="2" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-textarea v-model="draft.cta.body" label="Body" rows="3" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-text-field v-model="draft.cta.primaryCta.label" label="Primary CTA label" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="draft.cta.secondaryCta.label" label="Secondary CTA label" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
                </div>
              </div>
            </div>
          </AdminEditorPanel>

        </div>
    </v-fade-transition>
      </main>
    </div>

    <AdminConfirmDialog v-model="confirmOpen" :title="confirmData.title" :body="confirmData.body" @confirm="confirmData.onConfirm()" />
  </v-app>
</template>

<style scoped>
.partner-admin {
  min-height: 100vh;
  background: var(--admin-bg);
  color: var(--admin-text);
  transition: padding-left 0.25s ease;
}
.admin-layout { min-height: 100vh; }
.manager-main { min-height: 100vh; padding: 1.5rem 2rem 2.5rem; }
.manager-hero {
  display: flex; align-items: center; justify-content: space-between; gap: 1.25rem;
  padding: 1rem 1.5rem; border: 1px solid var(--admin-theme-border); border-radius: 8px;
  background: var(--admin-theme-surface); box-shadow: var(--admin-theme-shadow);
}
.manager-hero h1 { margin: 0; color: var(--admin-theme-contrast); font-size: 1.32rem; line-height: 1.2; }
.manager-title { display: grid; gap: 0.32rem; }
.manager-meta { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.2rem; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.card-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
.content-grid { display: grid; gap: 1.1rem; margin-top: 1rem; }
.panel-body { padding: 1.5rem; }
.image-editor-grid {
  display: grid; grid-template-columns: minmax(300px, 0.72fr) minmax(360px, 1.28fr);
  gap: 1.25rem; padding: 1.5rem;
}
.image-preview {
  overflow: hidden; border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 34%, var(--admin-theme-border));
  border-radius: 7px; background: var(--admin-theme-surface);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 8%, transparent), 0 12px 24px rgba(15, 95, 73, 0.11);
}
.form-stack, .cards-list { display: grid; gap: 0.85rem; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.6rem 0.85rem; }
.form-grid .field-wide { grid-column: 1 / -1; }
.image-upload-panel { display: grid; gap: 0.75rem; align-content: start; }
.cards-list { gap: 0.95rem; }
.cards-list.two-col { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.card-editor {
  border: 1px solid var(--admin-theme-border); border-radius: 8px;
  background: var(--admin-theme-surface); overflow: hidden;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.card-editor:hover { border-color: color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border)); box-shadow: 0 4px 14px rgba(15, 95, 73, 0.08); }
.card-editor-header {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 32%, var(--admin-theme-surface));
  padding: 0.75rem 1.5rem;
}
.card-heading { display: flex; align-items: center; gap: 0.7rem; min-width: 0; }
.card-heading h3, .card-heading p { margin: 0; }
.card-heading h3 { color: var(--admin-theme-contrast); font-size: 0.94rem; font-weight: 900; }
.card-heading p { color: var(--admin-theme-muted); font-size: 0.76rem; font-weight: 700; }
.card-number {
  display: grid; width: 2rem; height: 2rem; place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  border-radius: 6px; background: var(--admin-theme-surface); color: var(--admin-theme-primary-deep);
  font-size: 0.74rem; font-weight: 900; flex-shrink: 0;
}
.card-editor-top { padding: 1.25rem 1.5rem 0; }
.card-image-upload { width: 200px; }
.card-preview { width: 100%; aspect-ratio: 1.35; }
.card-form-grid {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.6rem 0.85rem; padding: 1.25rem 1.5rem;
}
.card-form-grid .field-wide { grid-column: 1 / -1; }

@media (min-width: 900px) { .partner-admin.sidebar-open { padding-left: 260px; } }
@media (max-width: 1100px) { .cards-list.two-col { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 900px) {
  .manager-main { padding: 1rem; padding-top: calc(60px + 1rem); }
  .manager-hero, .card-editor-header { align-items: stretch; flex-direction: column; }
  .hero-actions { width: 100%; }
  .image-editor-grid, .form-grid, .card-form-grid { grid-template-columns: 1fr; }
  .card-image-upload { width: 100%; }
  .cards-list.two-col { grid-template-columns: 1fr; }
}
</style>
