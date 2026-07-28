<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useAdminTheme } from '@/composables/useAdminTheme'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ImagePickerField from '@/components/admin/ImagePickerField.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'

const ui = useUiStore()
const auth = useAuthStore()
useAdminTheme()

/* ─── Page content types ─────────────────────────── */
interface EditableSection {
  id: string
  label: string
  heading: string
  body: string
  items: string
}

interface PageDraft {
  slug: string
  route: string
  group: string
  title: string
  eyebrow: string
  headline: string
  intro: string
  heroImageUrl: string
  primaryAction: string
  secondaryAction: string
  sections: EditableSection[]
  updatedAt: string
}

interface InitiativeItem {
  title: string
  text: string
  img: string
  tag: string
}

interface ProcessStep {
  number: string
  title: string
  text: string
}

interface QuoteContent {
  text: string
  cite: string
}

interface StatItem {
  number: string
  label: string
}

interface ApproachCard {
  title: string
  text: string
  icon: string
}

/* ─── Default Environment Page ──────────────────── */
function createDefaultEnvironmentPage(): PageDraft {
  return {
    slug: 'programs-environment',
    route: '/programs/environment',
    group: 'Programs',
    title: 'Environment',
    eyebrow: 'Environment',
    headline: 'Protecting the land that sustains villages.',
    intro: 'Community forestry, biogas digesters, rainwater harvesting and WASH — climate resilience built one household at a time.',
    heroImageUrl: '',
    primaryAction: '',
    secondaryAction: '',
    sections: [
      {
        id: 'environment-work',
        label: 'What we do',
        heading: 'What we do',
        body: 'Community forestry, biogas digesters, rainwater harvesting and WASH — climate resilience built one household at a time.',
        items: 'Community forestry agreements\nBiogas digester installation\nRainwater harvesting systems\nWASH facilities in schools and clinics\nTree nursery support and reforestation',
      },
      {
        id: 'environment-approach',
        label: 'Approach',
        heading: 'Our approach',
        body: 'Our approach combines scientific expertise with community participation to create lasting environmental change. We work alongside villages to restore forests, install renewable energy, and build climate resilience that families can see and sustain.',
        items: '',
      },
      {
        id: 'environment-team',
        label: 'Organizational Structure',
        heading: 'Who delivers environment programs on the ground',
        body: 'Our dedicated team works across provinces protecting forests, building climate resilience and restoring ecosystems.',
        items: 'Program Director | compass | Oversees environmental programs, conservation initiatives, and partnerships across provinces.\nField Coordinators | map | Manage community forestry, biogas, and WASH projects in target villages.\nConservation Trainers | heart | Deliver climate-smart agriculture, reforestation and environmental education.\nWASH Officers | chart | Implement clean water, sanitation and rainwater harvesting solutions.',
      },
      {
        id: 'environment-why',
        label: 'Why it matters',
        heading: 'Why it matters',
        body: 'Southeastern Cambodia is one of the most climate-vulnerable regions in the country. Healthy forests and clean water are peacekeeping infrastructure.',
        items: 'Deforestation leaves communities exposed to floods and droughts\nClean water access prevents disease and keeps children in school\nRenewable energy reduces dependence on charcoal and firewood\nCommunity forests protect biodiversity for future generations',
      },
    ],
    updatedAt: '',
  }
}

const statsBand = ref<StatItem[]>([
  { number: '500K+', label: 'TREES PLANTED' },
  { number: '12', label: 'COMMUNITIES SERVED' },
  { number: '50+', label: 'ECOSYSTEMS PROTECTED' },
  { number: '10K+', label: 'PEOPLE TRAINED' },
])

const initiatives = ref<InitiativeItem[]>([
  { title: 'Reforestation Projects', text: 'Planting native tree species to restore degraded forests. We\'ve planted over 500,000 trees across 12 communities.', img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', tag: 'Conservation' },
  { title: 'Environmental Education', text: 'Developing curriculum and training programs for schools to build environmental literacy from an early age.', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80', tag: 'Education' },
  { title: 'Renewable Energy Access', text: 'Installing solar panels and clean energy solutions in rural communities.', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80', tag: 'Energy' },
  { title: 'Water Conservation', text: 'Implementing rainwater harvesting, watershed management, and water purification systems.', img: 'https://images.unsplash.com/photo-1548685913-fe6678b0d5c9?w=800&q=80', tag: 'Water' },
  { title: 'Sustainable Agriculture', text: 'Training farmers in organic farming, crop rotation, and agroforestry techniques.', img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80', tag: 'Agriculture' },
  { title: 'Climate Research & Advocacy', text: 'Conducting climate impact assessments and advocating for policy changes.', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', tag: 'Research' },
])

const processSteps = ref<ProcessStep[]>([
  { number: '01', title: 'Assessment', text: 'We conduct comprehensive environmental assessments to understand local ecosystems and identify priorities.' },
  { number: '02', title: 'Planning', text: 'Working with community leaders, we develop tailored action plans that balance conservation with needs.' },
  { number: '03', title: 'Implementation', text: 'We execute projects with active community participation, ensuring local ownership.' },
  { number: '04', title: 'Monitoring', text: 'Continuous monitoring helps us measure impact and adapt strategies for greater effectiveness.' },
])

const approachCards = ref<ApproachCard[]>([
  { title: 'Conservation', text: 'Protecting and restoring natural habitats, wildlife corridors, and biodiversity hotspots through community-led initiatives and scientific research.', icon: 'shield' },
  { title: 'Sustainability', text: 'Promoting renewable energy, sustainable agriculture, and circular economy practices that reduce environmental impact while supporting livelihoods.', icon: 'leaf' },
  { title: 'Community Engagement', text: 'Empowering local communities with knowledge, resources, and tools to actively participate in environmental protection and climate action.', icon: 'users' },
])

const quoteContent = ref<QuoteContent>({
  text: 'We do not inherit the earth from our ancestors; we borrow it from our children. Our environmental program is a pledge to protect that inheritance and ensure future generations inherit a planet that is healthy, vibrant, and full of possibility.',
  cite: '— SETE SENA Environmental Team',
})

/* ─── State ─────────────────────────────────────── */
const loading = ref(false)
const saving = ref(false)
const page = ref<PageDraft>(createDefaultEnvironmentPage())
const savedSnapshot = ref('')
const storageMode = ref<'supabase' | 'local'>('supabase')
const editing = ref(false)

function toggleEditing() {
  editing.value = !editing.value
}
const STORAGE_KEY = 'env-dashboard-page'

/* ─── Collapsible panels ───────────────────────── */
const expandedPanels = ref<Record<string, boolean>>({
  'quick-links': true,
  'approach-cards': true,
  'stats': true,
  'initiatives': true,
  'process': true,
  'quote': true,
})

function togglePanel(id: string) {
  expandedPanels.value[id] = !expandedPanels.value[id]
}

function editPanel(id: string) {
  expandedPanels.value[id] = true
  void nextTick(() => {
    const panel = document.querySelector(`[data-panel-id="${id}"]`)
    if (!panel) return
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const firstInput = panel.querySelector('input, textarea, select') as HTMLElement | null
    if (firstInput) {
      firstInput.focus({ preventScroll: true })
    }
  })
}

/* ─── Confirmation helpers ─────────────────────── */
function confirmDeleteStat(index: number) {
  const stat = statsBand.value[index]
  const label = stat?.label?.trim() || `Stat ${index + 1}`
  ui.openModal(
    'Delete statistic',
    `Permanently delete <strong>${stat?.number || ''} ${label}</strong>? This action cannot be undone.`,
    () => {
      statsBand.value.splice(index, 1)
      ui.addToast(`Statistic "${label}" deleted.`, 'success')
    },
  )
}

function confirmDeleteInitiative(index: number) {
  const item = initiatives.value[index]
  const title = item?.title?.trim() || `Initiative ${index + 1}`
  ui.openModal(
    'Delete initiative',
    `Permanently delete <strong>${title}</strong>? This action cannot be undone.`,
    () => {
      initiatives.value.splice(index, 1)
      ui.addToast(`Initiative "${title}" deleted.`, 'success')
    },
  )
}

function confirmDeleteProcessStep(index: number) {
  const step = processSteps.value[index]
  const title = step?.title?.trim() || `Step ${index + 1}`
  ui.openModal(
    'Delete step',
    `Permanently delete <strong>${title}</strong> from the process steps? This action cannot be undone.`,
    () => {
      processSteps.value.splice(index, 1)
      ui.addToast(`Step "${title}" deleted.`, 'success')
    },
  )
}

function confirmDeleteApproachCard(index: number) {
  const card = approachCards.value[index]
  const title = card?.title?.trim() || `Card ${index + 1}`
  ui.openModal(
    'Delete approach card',
    `Permanently delete <strong>${title}</strong> from approach cards? This action cannot be undone.`,
    () => {
      approachCards.value.splice(index, 1)
      ui.addToast(`Card "${title}" deleted.`, 'success')
    },
  )
}

/* ─── LocalStorage fallback ────────────────────── */
function loadFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, unknown>
      const defaults = createDefaultEnvironmentPage()
      page.value = {
        ...defaults,
        eyebrow: (saved.eyebrow as string) || defaults.eyebrow,
        headline: (saved.headline as string) || defaults.headline,
        intro: (saved.intro as string) || defaults.intro,
        heroImageUrl: (saved.heroImageUrl as string) || '',
        primaryAction: (saved.primaryAction as string) || '',
        secondaryAction: (saved.secondaryAction as string) || '',
        sections: saved.sections && Array.isArray(saved.sections)
          ? mergeSectionsWithDefaults(saved.sections as EditableSection[], defaults)
          : defaults.sections,
        updatedAt: (saved.updatedAt as string) || '',
      }
      if (saved.statsBand && Array.isArray(saved.statsBand) && saved.statsBand.length > 0) {
        statsBand.value = saved.statsBand as StatItem[]
      }
      if (saved.initiatives && Array.isArray(saved.initiatives)) {
        initiatives.value = saved.initiatives as InitiativeItem[]
      }
      if (saved.processSteps && Array.isArray(saved.processSteps)) {
        processSteps.value = saved.processSteps as ProcessStep[]
      }
      if (saved.approachCards && Array.isArray(saved.approachCards)) {
        approachCards.value = saved.approachCards as ApproachCard[]
      }
      if (saved.quoteContent && typeof saved.quoteContent === 'object') {
        quoteContent.value = { ...quoteContent.value, ...saved.quoteContent as Partial<QuoteContent> }
      }
    }
  } catch { /* ignore */ }
}

function mergeSectionsWithDefaults(dbSections: EditableSection[], defaults: PageDraft): EditableSection[] {
  const dbMap = new Map<string, EditableSection>()
  for (const s of dbSections) dbMap.set(s.id, s)

  return defaults.sections.map(defSec => {
    const dbSec = dbMap.get(defSec.id)
    if (!dbSec) return { ...defSec }
    return {
      id: dbSec.id,
      label: dbSec.label?.trim() ? dbSec.label : defSec.label,
      heading: dbSec.heading?.trim() ? dbSec.heading : defSec.heading,
      body: dbSec.body?.trim() ? dbSec.body : defSec.body,
      items: dbSec.items?.trim() ? dbSec.items : defSec.items,
    }
  })
}

function saveToLocalStorage(): void {
  try {
    const p = page.value
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      eyebrow: p.eyebrow,
      headline: p.headline,
      intro: p.intro,
      heroImageUrl: p.heroImageUrl,
      primaryAction: p.primaryAction,
      secondaryAction: p.secondaryAction,
      sections: p.sections,
      statsBand: statsBand.value,
      initiatives: initiatives.value,
      processSteps: processSteps.value,
      approachCards: approachCards.value,
      quoteContent: quoteContent.value,
      updatedAt: new Date().toISOString(),
    }))
  } catch { /* ignore */ }
}

function snapshotData(): string {
  return JSON.stringify({
    eyebrow: page.value.eyebrow,
    headline: page.value.headline,
    intro: page.value.intro,
    heroImageUrl: page.value.heroImageUrl,
    primaryAction: page.value.primaryAction,
    secondaryAction: page.value.secondaryAction,
    sections: page.value.sections.map(s => ({ ...s })),
    statsBand: statsBand.value.map(s => ({ ...s })),
    initiatives: initiatives.value.map(s => ({ ...s })),
    processSteps: processSteps.value.map(s => ({ ...s })),
    approachCards: approachCards.value.map(s => ({ ...s })),
    quoteContent: { ...quoteContent.value },
  })
}

const isDirty = computed(() => savedSnapshot.value !== snapshotData())

async function loadPageContent() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('title, summary, description, metadata, updated_at')
      .eq('slug', 'programs-environment')
      .maybeSingle()

    if (error) {
      console.warn('Supabase load failed, falling back to localStorage:', error.message)
      loadFromLocalStorage()
      storageMode.value = 'local'
      savedSnapshot.value = snapshotData()
      loading.value = false
      return
    }

    if (data) {
      const defaults = createDefaultEnvironmentPage()
      const meta = data.metadata as Record<string, unknown> | null

      page.value = {
        ...defaults,
        title: data.title || defaults.title,
        eyebrow: (meta?.eyebrow as string) || defaults.eyebrow,
        headline: (meta?.headline as string) || defaults.headline,
        intro: data.summary || (meta?.intro as string) || defaults.intro,
        heroImageUrl: (meta?.heroImageUrl as string) || '',
        primaryAction: (meta?.primaryAction as string) || '',
        secondaryAction: (meta?.secondaryAction as string) || '',
        sections: meta?.sections && Array.isArray(meta.sections)
          ? mergeSectionsWithDefaults(meta.sections as EditableSection[], defaults)
          : defaults.sections,
        updatedAt: data.updated_at || '',
      }

      if (meta?.statsBand && Array.isArray(meta.statsBand) && meta.statsBand.length > 0) {
        statsBand.value = meta.statsBand as StatItem[]
      }
      if (meta?.initiatives && Array.isArray(meta.initiatives)) {
        initiatives.value = meta.initiatives as InitiativeItem[]
      }
      if (meta?.processSteps && Array.isArray(meta.processSteps)) {
        processSteps.value = meta.processSteps as ProcessStep[]
      }
      if (meta?.approachCards && Array.isArray(meta.approachCards)) {
        approachCards.value = meta.approachCards as ApproachCard[]
      }
      if (meta?.quoteContent && typeof meta.quoteContent === 'object') {
        quoteContent.value = { ...quoteContent.value, ...meta.quoteContent as Partial<QuoteContent> }
      }
      storageMode.value = 'supabase'
      saveToLocalStorage()
    } else {
      loadFromLocalStorage()
      storageMode.value = 'local'
    }

    savedSnapshot.value = snapshotData()
  } catch (e: unknown) {
    console.warn('Load crashed, falling back to localStorage:', e)
    loadFromLocalStorage()
    storageMode.value = 'local'
    savedSnapshot.value = snapshotData()
  } finally {
    loading.value = false
  }
}

async function savePageContent() {
  saving.value = true
  try {
    const now = new Date().toISOString()
    const p = page.value

    const payload = {
      slug: p.slug,
      title: p.title.trim() || p.headline.trim() || p.slug,
      pillar: 'Environment',
      summary: p.intro || '',
      description: p.intro || '',
      status: 'published',
      metadata: {
        eyebrow: p.eyebrow,
        headline: p.headline,
        intro: p.intro,
        heroImageUrl: p.heroImageUrl,
        primaryAction: p.primaryAction,
        secondaryAction: p.secondaryAction,
        sections: p.sections.map(s => ({
          id: s.id,
          label: s.label,
          heading: s.heading,
          body: s.body,
          items: s.items,
        })),
        statsBand: statsBand.value,
        initiatives: initiatives.value,
        processSteps: processSteps.value,
        approachCards: approachCards.value,
        quoteContent: quoteContent.value,
      },
      updated_at: now,
    }

    saveToLocalStorage()

    let { error } = await supabase
      .from('programs')
      .upsert(payload, { onConflict: 'slug' })

    if (error && error.message?.includes('row-level security')) {
      console.warn('Upsert blocked by RLS, trying insert/update separately...')

      const { error: insertError } = await supabase
        .from('programs')
        .insert(payload)

      if (insertError && insertError.message?.includes('duplicate key')) {
        const { error: updateError } = await supabase
          .from('programs')
          .update(payload)
          .eq('slug', p.slug)

        if (updateError) {
          error = updateError
        } else {
          error = null
        }
      } else if (insertError) {
        error = insertError
      } else {
        error = null
      }
    }

    if (error) {
      console.warn('Supabase save failed:', error)
      ui.addToast(`DB write blocked: ${error.message}`, 'error')
      saveToLocalStorage()
      storageMode.value = 'local'
      savedSnapshot.value = snapshotData()
      saving.value = false
      return
    }

    storageMode.value = 'supabase'
    savedSnapshot.value = snapshotData()
    ui.addToast(`${p.title} page saved!`, 'success')
  } catch (e: unknown) {
    console.error('Save crashed:', e)
    ui.addToast('Saved to browser (database error)', 'info')
    storageMode.value = 'local'
    savedSnapshot.value = snapshotData()
  } finally {
    saving.value = false
  }
}

function formatDate(value: string) {
  if (!value) return 'Not saved yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not saved yet'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

let autosaveTimer: ReturnType<typeof setTimeout> | null = null

watch(
  [statsBand, initiatives, processSteps, approachCards, quoteContent, () => page.value],
  () => {
    if (autosaveTimer) clearTimeout(autosaveTimer)
    autosaveTimer = setTimeout(() => saveToLocalStorage(), 2000)
  },
  { deep: true },
)

onMounted(async () => {
  try {
    await auth.init()
  } catch (e) {
    console.warn('[EnvironmentDashboard] auth.init() failed:', e)
  }
  try {
    await loadPageContent()
  } catch (e) {
    console.error('[EnvironmentDashboard] loadPageContent() crashed:', e)
    loadFromLocalStorage()
    storageMode.value = 'local'
    savedSnapshot.value = snapshotData()
    loading.value = false
  }
})
</script>

<template>
  <v-app :class="['env-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="hero-glow" aria-hidden="true"></div>
          <div class="hero-accent-line" aria-hidden="true"></div>
          <div class="hero-content-wrap">
            <div class="hero-icon-wrap">
              <v-icon size="22" color="primary">mdi-tree</v-icon>
            </div>
            <div class="manager-title">
              <p class="eyebrow">Environment Program</p>
              <h1>Manage Environment page</h1>
              <div class="manager-meta">
                <v-chip size="x-small" variant="tonal" color="primary">{{ storageMode === 'supabase' ? 'Database' : 'Local only' }}</v-chip>
                <v-chip size="x-small" variant="tonal" color="primary">{{ statsBand.length }} stats</v-chip>
                <v-chip size="x-small" variant="tonal" color="primary">{{ initiatives.length }} initiatives</v-chip>
                <v-chip v-if="isDirty" size="x-small" variant="tonal" color="warning">Unsaved changes</v-chip>
                <v-chip v-else-if="page.updatedAt" size="x-small" variant="tonal" color="success">Saved {{ formatDate(page.updatedAt) }}</v-chip>
              </div>
            </div>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/programs/environment" target="_blank" size="small">
              <v-icon start size="16">mdi-open-in-new</v-icon>
              View page
            </v-btn>
            <v-btn
              variant="tonal"
              :color="editing ? 'primary' : 'default'"
              size="small"
              @click="toggleEditing"
            >
              <v-icon start size="16">{{ editing ? 'mdi-lock-open' : 'mdi-lock' }}</v-icon>
              {{ editing ? 'Editing enabled' : 'Enable editing' }}
            </v-btn>
            <v-btn
              color="primary"
              size="small"
              :loading="saving"
              :disabled="saving || loading || !isDirty || !editing"
              @click="savePageContent"
            >
              <v-icon start size="16">mdi-content-save</v-icon>
              {{ saving ? 'Saving...' : 'Save changes' }}
            </v-btn>
          </div>
        </header>

        <div v-if="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
          <v-progress-circular indeterminate color="primary" :size="36" :width="4" />
          <span class="mt-4 font-weight-bold">Loading Environment content...</span>
        </div>

        <div v-else class="content-grid" :class="{ 'view-mode': !editing }">
          <!-- ═══ Quick links ═══ -->
          <section class="editor-panel quick-links-panel" aria-labelledby="quick-links-heading">
            <button class="panel-header panel-header-clickable" @click="togglePanel('quick-links')" :aria-expanded="expandedPanels['quick-links']">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <v-icon size="18">mdi-folder-open</v-icon>
                </div>
                <div>
                  <p class="panel-kicker">Shortcuts</p>
                  <h2 id="quick-links-heading">Related tools</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <v-icon size="15" color="disabled">mdi-pencil</v-icon>
                <v-icon size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['quick-links'] }">mdi-chevron-down</v-icon>
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['quick-links']" class="panel-body quick-links-body">
                <RouterLink class="quick-link" to="/admin/media">
                  <v-icon size="18">mdi-folder-open</v-icon>
                  <div>
                    <strong>Media Library</strong>
                    <span>Upload images for this page</span>
                  </div>
                </RouterLink>
              </div>
            </Transition>
          </section>

          <!-- ═══ Approach Cards ═══ -->
          <section class="editor-panel" aria-labelledby="approach-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['approach-cards']" @click="togglePanel('approach-cards')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <v-icon size="18">mdi-shield-leaf</v-icon>
                </div>
                <div>
                  <p class="panel-kicker">Our approach</p>
                  <h2 id="approach-heading">Approach Cards</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <v-btn v-if="editing" variant="tonal" color="accent" size="x-small" @click="approachCards.push({ title: '', text: '', icon: 'shield' })">
                  <v-icon start size="14">mdi-plus</v-icon>
                  Add card
                </v-btn>
                <v-icon size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['approach-cards'] }">mdi-chevron-down</v-icon>
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['approach-cards']" class="panel-body">
                <div class="stack-list two-col">
                  <article v-for="(card, index) in approachCards" :key="'approach-' + index" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h3>{{ card.title || 'New card' }}</h3>
                      <v-btn v-if="editing" icon variant="tonal" color="error" size="x-small" @click="confirmDeleteApproachCard(index)">
                        <v-icon size="14">mdi-delete</v-icon>
                      </v-btn>
                    </header>
                    <div class="sub-editor-body">
                      <v-text-field v-model="card.title" label="Title" hide-details density="compact" variant="outlined" />
                      <v-select v-model="card.icon" :items="[{ title: 'Shield', value: 'shield' }, { title: 'Leaf', value: 'leaf' }, { title: 'Users', value: 'users' }]" label="Icon" hide-details density="compact" variant="outlined" />
                      <v-textarea v-model="card.text" label="Description" rows="2" hide-details density="compact" variant="outlined" class="field-wide" />
                    </div>
                  </article>
                </div>
              </div>
            </Transition>
          </section>

          <!-- ═══ Stats ═══ -->
          <section class="editor-panel" aria-labelledby="stats-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['stats']" @click="togglePanel('stats')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <v-icon size="18">mdi-chart-bar</v-icon>
                </div>
                <div>
                  <p class="panel-kicker">Statistics</p>
                  <h2 id="stats-heading">Impact Statistics</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <v-btn v-if="editing" variant="tonal" color="accent" size="x-small" @click="statsBand.push({ number: '', label: '' })">
                  <v-icon start size="14">mdi-plus</v-icon>
                  Add stat
                </v-btn>
                <v-icon size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['stats'] }">mdi-chevron-down</v-icon>
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['stats']" class="panel-body">
                <div class="stack-list two-col">
                  <article v-for="(stat, index) in statsBand" :key="'stat-' + index" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h3>{{ stat.label || `Stat ${index + 1}` }}</h3>
                      <v-btn v-if="editing" icon variant="tonal" color="error" size="x-small" @click="confirmDeleteStat(index)">
                        <v-icon size="14">mdi-delete</v-icon>
                      </v-btn>
                    </header>
                    <div class="sub-editor-body form-grid">
                      <v-text-field v-model="stat.number" label="Number" hide-details density="compact" variant="outlined" />
                      <v-text-field v-model="stat.label" label="Label" hide-details density="compact" variant="outlined" />
                    </div>
                  </article>
                </div>
              </div>
            </Transition>
          </section>

          <!-- ═══ Initiatives ═══ -->
          <section class="editor-panel" aria-labelledby="initiatives-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['initiatives']" @click="togglePanel('initiatives')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <v-icon size="18">mdi-leaf</v-icon>
                </div>
                <div>
                  <p class="panel-kicker">Key programs</p>
                  <h2 id="initiatives-heading">Initiatives</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <v-btn v-if="editing" variant="tonal" color="accent" size="x-small" @click="initiatives.push({ title: '', text: '', img: '', tag: '' })">
                  <v-icon start size="14">mdi-plus</v-icon>
                  Add initiative
                </v-btn>
                <v-icon size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['initiatives'] }">mdi-chevron-down</v-icon>
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['initiatives']" class="panel-body">
                <div class="stack-list two-col">
                  <article v-for="(item, index) in initiatives" :key="'init-' + index" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h3>{{ item.title || 'New initiative' }}</h3>
                      <v-btn v-if="editing" icon variant="tonal" color="error" size="x-small" @click="confirmDeleteInitiative(index)">
                        <v-icon size="14">mdi-delete</v-icon>
                      </v-btn>
                    </header>
                    <div class="sub-editor-body">
                      <v-text-field v-model="item.title" label="Title" hide-details density="compact" variant="outlined" />
                      <v-text-field v-model="item.tag" label="Tag" hide-details density="compact" variant="outlined" />
                      <v-textarea v-model="item.text" label="Description" rows="2" hide-details density="compact" variant="outlined" class="field-wide" />
                      <div class="field-wide upload-wrap">
                        <label class="field-label">Image URL</label>
                        <v-text-field v-model="item.img" label="Image URL" placeholder="https://..." hide-details density="compact" variant="outlined" />
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </Transition>
          </section>

          <!-- ═══ Process ═══ -->
          <section class="editor-panel" aria-labelledby="process-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['process']" @click="togglePanel('process')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <v-icon size="18">mdi-map-marker-path</v-icon>
                </div>
                <div>
                  <p class="panel-kicker">Our process</p>
                  <h2 id="process-heading">Process Steps</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <v-btn v-if="editing" variant="tonal" color="accent" size="x-small" @click="processSteps.push({ number: String(processSteps.length + 1).padStart(2, '0'), title: '', text: '' })">
                  <v-icon start size="14">mdi-plus</v-icon>
                  Add step
                </v-btn>
                <v-icon size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['process'] }">mdi-chevron-down</v-icon>
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['process']" class="panel-body">
                <div class="stack-list two-col">
                  <article v-for="(step, index) in processSteps" :key="'step-' + index" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="item-number">{{ step.number }}</span>
                      <h3>{{ step.title || 'New step' }}</h3>
                      <v-btn v-if="editing" icon variant="tonal" color="error" size="x-small" @click="confirmDeleteProcessStep(index)">
                        <v-icon size="14">mdi-delete</v-icon>
                      </v-btn>
                    </header>
                    <div class="sub-editor-body">
                      <v-text-field v-model="step.number" label="Step number" hide-details density="compact" variant="outlined" />
                      <v-text-field v-model="step.title" label="Title" hide-details density="compact" variant="outlined" />
                      <v-textarea v-model="step.text" label="Description" rows="2" hide-details density="compact" variant="outlined" class="field-wide" />
                    </div>
                  </article>
                </div>
              </div>
            </Transition>
          </section>

          <!-- ═══ Quote ═══ -->
          <section class="editor-panel" aria-labelledby="quote-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['quote']" @click="togglePanel('quote')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <v-icon size="18">mdi-format-quote-open</v-icon>
                </div>
                <div>
                  <p class="panel-kicker">Testimonial</p>
                  <h2 id="quote-heading">Quote</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <v-icon size="15" color="disabled">mdi-pencil</v-icon>
                <v-icon size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['quote'] }">mdi-chevron-down</v-icon>
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['quote']" class="panel-body">
                <v-textarea v-model="quoteContent.text" label="Quote text" rows="3" hide-details density="comfortable" variant="outlined" />
                <v-text-field v-model="quoteContent.cite" label="Attribution" placeholder="— Name, Role" hide-details density="comfortable" variant="outlined" class="mt-3" />
              </div>
            </Transition>
          </section>
        </div>
      </main>
    </div>
  </v-app>
</template>

<style scoped>
.env-admin {
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
  padding: 0 1.25rem 1.25rem;
}

.manager-hero {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 1.25rem;
  padding: 1.25rem 1.35rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 10px;
  background: linear-gradient(135deg, var(--admin-theme-surface) 0%, color-mix(in srgb, var(--admin-theme-primary) 6%, var(--admin-theme-surface)) 100%);
  box-shadow: var(--admin-theme-shadow);
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: -40px;
  right: -30px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--admin-theme-primary) 20%, transparent) 0%, transparent 70%);
  pointer-events: none;
}

.hero-accent-line {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, var(--admin-theme-primary-deep) 0%, color-mix(in srgb, var(--admin-theme-primary) 40%, transparent) 60%, transparent 100%);
  pointer-events: none;
}

.hero-content-wrap {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.hero-icon-wrap {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 10px;
  background: color-mix(in srgb, var(--admin-theme-primary) 14%, var(--admin-theme-surface));
  box-shadow: 0 4px 12px color-mix(in srgb, var(--admin-theme-primary) 18%, transparent);
}

.manager-title {
  display: grid;
  gap: 0.3rem;
  min-width: 0;
}

.manager-title h1 {
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 1.35rem;
  line-height: 1.2;
  font-weight: 900;
}

.manager-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.eyebrow {
  color: var(--admin-theme-primary-deep);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.panel-desc {
  color: var(--admin-theme-muted);
  font-size: 0.82rem;
  line-height: 1.5;
  margin-bottom: 0.85rem;
}

.field-label {
  color: var(--admin-theme-contrast-soft);
  font-size: 0.78rem;
  font-weight: 700;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.field-wide {
  grid-column: 1 / -1;
}

.upload-wrap {
  display: grid;
  gap: 0.35rem;
}

.quick-links-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.65rem;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-primary-deep);
  padding: 0.75rem 0.85rem;
  text-decoration: none;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.quick-link:hover {
  border-color: var(--admin-theme-primary);
  background: color-mix(in srgb, var(--admin-theme-primary) 8%, var(--admin-theme-surface));
  transform: translateY(-1px);
}

.quick-link strong {
  display: block;
  color: var(--admin-theme-contrast);
  font-size: 0.85rem;
  font-weight: 800;
}

.quick-link span {
  display: block;
  color: var(--admin-theme-muted);
  font-size: 0.74rem;
  font-weight: 600;
}

.editor-panel {
  border: 1px solid var(--admin-theme-border);
  border-radius: 10px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: linear-gradient(180deg, color-mix(in srgb, var(--admin-theme-surface-soft) 50%, var(--admin-theme-surface)) 0%, var(--admin-theme-surface) 100%);
  padding: 0.85rem 1rem;
}

.panel-header h2 {
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 1rem;
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.panel-header-left > div {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}

.panel-icon-wrap {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  border-radius: 6px;
  background: color-mix(in srgb, var(--admin-theme-primary-deep) 12%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.panel-header-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-shrink: 0;
}

.panel-header-clickable {
  width: 100%;
  border: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}

.panel-header-clickable:hover {
  background: linear-gradient(180deg, color-mix(in srgb, var(--admin-theme-primary) 6%, var(--admin-theme-surface)) 0%, var(--admin-theme-surface) 100%);
}

.panel-body {
  padding: 1rem;
}

.stack-list {
  display: grid;
  gap: 0.75rem;
}

.stack-list.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.sub-editor {
  border: 1px solid var(--admin-theme-border);
  border-radius: 10px;
  background: var(--admin-theme-surface);
  overflow: hidden;
  transition: border-color 0.18s ease;
}

.sub-editor:hover {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 34%, var(--admin-theme-border-strong));
}

.sub-editor-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: linear-gradient(180deg, color-mix(in srgb, var(--admin-theme-surface-soft) 38%, var(--admin-theme-surface)) 0%, var(--admin-theme-surface) 100%);
  padding: 0.75rem 0.85rem;
}

.sub-editor-header h3 {
  flex: 1;
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 0.94rem;
  font-weight: 900;
}

.item-number {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  border-radius: 6px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-primary-deep);
  font-size: 0.74rem;
  font-weight: 900;
}

.sub-editor-body {
  padding: 0.9rem;
  display: grid;
  gap: 0.75rem;
}

.chevron {
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chevron-up {
  transform: rotate(-180deg);
}

.collapse-leave-active,
.collapse-enter-active {
  transition: opacity 0.24s ease, max-height 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 6000px;
}

.view-mode :deep(input),
.view-mode :deep(textarea),
.view-mode :deep(select) {
  pointer-events: none;
  opacity: 0.6;
  user-select: none;
  cursor: default;
}

@media (min-width: 900px) {
  .env-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 1100px) {
  .stack-list.two-col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
  }

  .manager-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-actions {
    width: 100%;
  }

  .hero-content-wrap {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
