<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ChevronDown,
  ExternalLink,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  Lock,
  MessageSquareQuote,
  Pencil,
  Plus,
  Save,
  Shield,
  Trash2,
  TreePine,
} from 'lucide-vue-next'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ImagePickerField from '@/components/admin/ImagePickerField.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'

const ui = useUiStore()
const auth = useAuthStore()

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
  { title: 'Renewable Energy Access', text: 'Installing solar panels and clean energy solutions in rural communities, reducing dependence on fossil fuels.', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80', tag: 'Energy' },
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
  // Ensure panel is expanded
  expandedPanels.value[id] = true
  // Use next tick to let Vue render the contents, then scroll
  void nextTick(() => {
    const panel = document.querySelector(`[data-panel-id="${id}"]`)
    if (!panel) return
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Focus the first input or textarea
    const firstInput = panel.querySelector('input, textarea, select') as HTMLElement | null
    if (firstInput) {
      firstInput.focus({ preventScroll: true })
      // Brief highlight animation
      firstInput.classList.add('edit-flash')
      setTimeout(() => firstInput.classList.remove('edit-flash'), 800)
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

/* ─── Merge DB sections with defaults to fill empty fields ── */
function mergeSectionsWithDefaults(dbSections: EditableSection[], defaults: PageDraft): EditableSection[] {
  // Build result in the CORRECT order (matching defaults), using DB data when available
  const dbMap = new Map<string, EditableSection>()
  for (const s of dbSections) dbMap.set(s.id, s)

  return defaults.sections.map(defSec => {
    const dbSec = dbMap.get(defSec.id)
    if (!dbSec) return { ...defSec } // missing from DB — use default
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

/* ─── Helpers ───────────────────────────────────── */
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

/* ─── Load from programs table (metadata JSONB) ── */
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

/* ─── Save to programs table ────────────────────── */
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

    // Try upsert first
    let { error } = await supabase
      .from('programs')
      .upsert(payload, { onConflict: 'slug' })

    // If upsert fails with RLS, try insert first then update separately
    if (error && error.message?.includes('row-level security')) {
      console.warn('Upsert blocked by RLS, trying insert/update separately...')

      const { error: insertError } = await supabase
        .from('programs')
        .insert(payload)

      if (insertError && insertError.message?.includes('duplicate key')) {
        // Row exists — try update instead
        const { error: updateError } = await supabase
          .from('programs')
          .update(payload)
          .eq('slug', p.slug)

        if (updateError) {
          error = updateError
        } else {
          error = null // success!
        }
      } else if (insertError) {
        error = insertError
      } else {
        error = null // insert succeeded!
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

/* ─── Helper: format date ───────────────────────── */
function formatDate(value: string) {
  if (!value) return 'Not saved yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not saved yet'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

/* ─── Auto-save to localStorage on any data change ─ */
let autosaveTimer: ReturnType<typeof setTimeout> | null = null

watch(
  [statsBand, initiatives, processSteps, approachCards, quoteContent],
  () => {
    if (autosaveTimer) clearTimeout(autosaveTimer)
    autosaveTimer = setTimeout(() => {
      saveToLocalStorage()
    }, 600)
  },
  { deep: true },
)

/* ─── Init ──────────────────────────────────────── */
onMounted(async () => {
  try {
    await auth.init()
  } catch (e) {
    console.warn('[EnvironmentDashboard] auth.init() failed:', e)
  }
  await loadPageContent()
})
</script>

<template>
  <div :class="['env-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="hero-glow" aria-hidden="true"></div>
          <div class="hero-accent-line" aria-hidden="true"></div>
          <div class="hero-content-wrap">
            <div class="hero-icon-wrap">
              <TreePine :size="22" aria-hidden="true" />
            </div>
            <div class="manager-title">
              <p class="eyebrow">Environment Program</p>
              <h1>Manage Environment page</h1>
              <div class="manager-meta" aria-label="Editable environment summary">
                <span>{{ storageMode === 'supabase' ? 'Database' : 'Local only' }}</span>
                <span>{{ statsBand.length }} stats</span>
                <span>{{ initiatives.length }} initiatives</span>
                <span v-if="isDirty" class="meta-dirty">Unsaved changes</span>
                <span v-else-if="page.updatedAt">Saved {{ formatDate(page.updatedAt) }}</span>
              </div>
            </div>
          </div>
          <div class="hero-actions">
            <RouterLink class="btn btn-secondary" to="/programs/environment">
              <ExternalLink :size="16" aria-hidden="true" />
              <span>View page</span>
            </RouterLink>
            <button type="button" class="btn btn-edit" :class="{ 'btn-edit-active': editing }" @click="toggleEditing">
              <Lock :size="15" aria-hidden="true" />
              <span>{{ editing ? 'Editing enabled' : 'Enable editing' }}</span>
            </button>
            <button type="button" class="btn btn-primary" :disabled="saving || loading || !isDirty || !editing" @click="savePageContent">
              <Save :size="16" aria-hidden="true" />
              <span>{{ saving ? 'Saving...' : 'Save changes' }}</span>
            </button>
          </div>
        </header>

        <div v-if="loading" class="state-card">
          <span class="state-spinner" aria-hidden="true"></span>
          <span>Loading Environment content...</span>
        </div>

        <div v-else class="content-grid" :class="{ 'view-mode': !editing }">
          <!-- ═══ Quick links ═══ -->
          <section class="editor-panel quick-links-panel" aria-labelledby="quick-links-heading">
            <button class="panel-header panel-header-clickable" aria-expanded="true" @click="togglePanel('quick-links')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <FolderOpen :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Shortcuts</p>
                  <h2 id="quick-links-heading">Related tools</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <Pencil :size="15" class="edit-icon" aria-hidden="true" />
                <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['quick-links'] }" aria-hidden="true" />
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['quick-links']" class="panel-body quick-links-body">
                <RouterLink class="quick-link" to="/admin/media">
                  <FolderOpen :size="18" aria-hidden="true" />
                  <div>
                    <strong>Media Library</strong>
                    <span>Upload images for this page</span>
                  </div>
                </RouterLink>
                <RouterLink class="quick-link" to="/admin/modules/programs">
                  <Layers :size="18" aria-hidden="true" />
                  <div>
                    <strong>Program Records</strong>
                    <span>Manage environment data entries</span>
                  </div>
                </RouterLink>
              </div>
            </Transition>
          </section>



          <!-- ═══ Our Approach cards ═══ -->
          <section class="editor-panel" data-panel-id="approach-cards" aria-labelledby="approach-heading">
            <div class="panel-header">
              <div class="panel-header-left panel-header-left-clickable" @click="togglePanel('approach-cards')">
                <div class="panel-icon-wrap">
                  <Shield :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Approach</p>
                  <h2 id="approach-heading">Our Approach cards</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <button type="button" class="icon-btn-pencil" aria-label="Jump to edit approach cards" @click.stop="editPanel('approach-cards')">
                  <Pencil :size="15" aria-hidden="true" />
                </button>
                <button type="button" class="btn btn-secondary btn-sm" :disabled="!editing" @click="approachCards.push({ title: '', text: '', icon: 'leaf' })">
                  <Plus :size="15" aria-hidden="true" />
                  <span>Add card</span>
                </button>
                <button type="button" class="icon-btn icon-btn-ghost" aria-label="Toggle panel" @click="togglePanel('approach-cards')">
                  <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['approach-cards'] }" />
                </button>
              </div>
            </div>
            <Transition name="collapse">
              <div v-show="expandedPanels['approach-cards']" class="panel-body">
                <p class="panel-desc">Edit the three approach cards shown in the "Our Approach" section: title, text, and icon.</p>

                <div class="stack-list">
                  <article v-for="(card, index) in approachCards" :key="index" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h3>{{ card.title || 'Untitled card' }}</h3>
                      <button type="button" class="icon-btn danger" :disabled="!editing" aria-label="Remove card" @click="confirmDeleteApproachCard(index)">
                        <Trash2 :size="15" aria-hidden="true" />
                      </button>
                    </header>
                    <div class="sub-editor-body form-grid">
                      <label class="field">
                        <span>Title</span>
                        <input v-model="card.title" type="text" placeholder="e.g. Conservation" />
                      </label>
                      <label class="field">
                        <span>Icon</span>
                        <select v-model="card.icon">
                          <option value="shield">Shield</option>
                          <option value="leaf">Leaf / Sprout</option>
                          <option value="users">Users</option>
                          <option value="tree-pine">Tree</option>
                          <option value="globe">Globe</option>
                          <option value="heart">Heart</option>
                        </select>
                      </label>
                      <label class="field wide">
                        <span>Description</span>
                        <textarea v-model="card.text" rows="3" placeholder="Card description..."></textarea>
                      </label>
                    </div>
                  </article>
                </div>
              </div>
            </Transition>
          </section>

          <!-- ═══ Key initiatives ═══ -->
          <section class="editor-panel" data-panel-id="initiatives" aria-labelledby="initiatives-heading">
            <div class="panel-header">
              <div class="panel-header-left panel-header-left-clickable" @click="togglePanel('initiatives')">
                <div class="panel-icon-wrap">
                  <ImageIcon :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Highlights</p>
                  <h2 id="initiatives-heading">Key initiatives</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <button type="button" class="icon-btn-pencil" aria-label="Jump to edit initiatives" @click.stop="editPanel('initiatives')">
                  <Pencil :size="15" aria-hidden="true" />
                </button>
                <button type="button" class="btn btn-secondary btn-sm" :disabled="!editing" @click="initiatives.push({ title: '', text: '', img: '', tag: '' })">
                  <Plus :size="15" aria-hidden="true" />
                  <span>Add initiative</span>
                </button>
                <button type="button" class="icon-btn icon-btn-ghost" aria-label="Toggle panel" @click="togglePanel('initiatives')">
                  <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['initiatives'] }" />
                </button>
              </div>
            </div>
            <Transition name="collapse">
              <div v-show="expandedPanels['initiatives']" class="panel-body">
                <p class="panel-desc">Edit the initiative cards shown on the public Environment page.</p>

                <div class="stack-list">
                  <article v-for="(item, index) in initiatives" :key="index" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h3>{{ item.title || 'Untitled initiative' }}</h3>
                      <button type="button" class="icon-btn danger" :disabled="!editing" aria-label="Remove initiative" @click="confirmDeleteInitiative(index)">
                        <Trash2 :size="15" aria-hidden="true" />
                      </button>
                    </header>
                    <div class="sub-editor-body">
                      <div class="initiative-editor-layout">
                        <div class="initiative-thumb-wrap">
                          <figure class="initiative-thumb">
                            <img v-if="item.img" :src="item.img" alt="" />
                            <div v-else class="slot-empty">
                              <ImageIcon :size="16" aria-hidden="true" />
                              <span>Image</span>
                            </div>
                          </figure>
                        </div>
                        <div class="initiative-fields">
                          <div class="form-grid">
                            <label class="field">
                              <span>Title</span>
                              <input v-model="item.title" type="text" placeholder="e.g. Reforestation Projects" />
                            </label>
                            <label class="field">
                              <span>Tag</span>
                              <input v-model="item.tag" type="text" placeholder="e.g. Conservation" />
                            </label>
                            <label class="field wide">
                              <span>Description</span>
                              <textarea v-model="item.text" rows="2" placeholder="Brief description..."></textarea>
                            </label>
                          </div>
                          <div class="upload-wrap" :class="{ 'upload-disabled': !editing }">
                            <ImagePickerField
                              v-model="item.img"
                              :label="item.title || `Initiative ${index + 1} image`"
                              hide-preview
                              @success="(msg) => ui.addToast(msg, 'success')"
                              @error="(msg) => ui.addToast(msg, 'error')"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </Transition>
          </section>

          <!-- ═══ Stats band ═══ -->
          <section class="editor-panel" data-panel-id="stats" aria-labelledby="stats-heading">
            <div class="panel-header">
              <div class="panel-header-left panel-header-left-clickable" @click="togglePanel('stats')">
                <div class="panel-icon-wrap">
                  <Layers :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Stats band</p>
                  <h2 id="stats-heading">Impact statistics</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <button type="button" class="icon-btn-pencil" aria-label="Jump to edit stats" @click.stop="editPanel('stats')">
                  <Pencil :size="15" aria-hidden="true" />
                </button>
                <button type="button" class="btn btn-secondary btn-sm" :disabled="!editing" @click="statsBand.push({ number: '', label: '' })">
                  <Plus :size="15" aria-hidden="true" />
                  <span>Add stat</span>
                </button>
                <button type="button" class="icon-btn icon-btn-ghost" aria-label="Toggle panel" @click="togglePanel('stats')">
                  <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['stats'] }" />
                </button>
              </div>
            </div>
            <Transition name="collapse">
              <div v-show="expandedPanels['stats']" class="panel-body">
                <p class="panel-desc">Edit the statistics shown on the public Environment page.</p>

                <div class="stack-list">
                  <article v-for="(stat, index) in statsBand" :key="index" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h3>Stat {{ index + 1 }}</h3>
                      <button type="button" class="icon-btn danger" :disabled="!editing" aria-label="Remove stat" @click="confirmDeleteStat(index)">
                        <Trash2 :size="15" aria-hidden="true" />
                      </button>
                    </header>
                    <div class="sub-editor-body form-grid">
                      <label class="field">
                        <span>Number</span>
                        <input v-model="stat.number" type="text" placeholder="e.g. 571" />
                      </label>
                      <label class="field">
                        <span>Label</span>
                        <input v-model="stat.label" type="text" placeholder="e.g. TREES PLANTED" />
                      </label>
                    </div>
                  </article>
                </div>
              </div>
            </Transition>
          </section>

          <!-- ═══ Process steps ═══ -->
          <section class="editor-panel" data-panel-id="process" aria-labelledby="process-heading">
            <div class="panel-header">
              <div class="panel-header-left panel-header-left-clickable" @click="togglePanel('process')">
                <div class="panel-icon-wrap">
                  <Layers :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">How we work</p>
                  <h2 id="process-heading">Process steps</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <button type="button" class="icon-btn-pencil" aria-label="Jump to edit process steps" @click.stop="editPanel('process')">
                  <Pencil :size="15" aria-hidden="true" />
                </button>
                <button type="button" class="btn btn-secondary btn-sm" :disabled="!editing" @click="processSteps.push({ number: '', title: '', text: '' })">
                  <Plus :size="15" aria-hidden="true" />
                  <span>Add step</span>
                </button>
                <button type="button" class="icon-btn icon-btn-ghost" aria-label="Toggle panel" @click="togglePanel('process')">
                  <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['process'] }" />
                </button>
              </div>
            </div>
            <Transition name="collapse">
              <div v-show="expandedPanels['process']" class="panel-body">
                <p class="panel-desc">Edit the step-by-step process shown under "How We Work".</p>

                <div class="stack-list">
                  <article v-for="(step, index) in processSteps" :key="index" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="item-number">{{ step.number || String(index + 1).padStart(2, '0') }}</span>
                      <h3>{{ step.title || 'Untitled step' }}</h3>
                      <button type="button" class="icon-btn danger" :disabled="!editing" aria-label="Remove step" @click="confirmDeleteProcessStep(index)">
                        <Trash2 :size="15" aria-hidden="true" />
                      </button>
                    </header>
                    <div class="sub-editor-body form-grid">
                      <label class="field">
                        <span>Number</span>
                        <input v-model="step.number" type="text" placeholder="e.g. 01" />
                      </label>
                      <label class="field">
                        <span>Title</span>
                        <input v-model="step.title" type="text" placeholder="e.g. Assessment" />
                      </label>
                      <label class="field wide">
                        <span>Description</span>
                        <textarea v-model="step.text" rows="2" placeholder="Step description..."></textarea>
                      </label>
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
                  <MessageSquareQuote :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Testimonial</p>
                  <h2 id="quote-heading">Quote</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <Pencil :size="15" class="edit-icon" aria-hidden="true" />
                <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['quote'] }" aria-hidden="true" />
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['quote']" class="panel-body form-grid">
                <label class="field wide">
                  <span>Quote text</span>
                  <textarea v-model="quoteContent.text" rows="3" placeholder="Enter the quote..."></textarea>
                </label>
                <label class="field wide">
                  <span>Citation / author</span>
                  <input v-model="quoteContent.cite" type="text" placeholder="e.g. — SETE SENA Environmental Team" />
                </label>
              </div>
            </Transition>
          </section>


        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.env-admin {
  --admin-bg: var(--admin-theme-bg);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-contrast-soft: var(--admin-theme-contrast-soft);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-primary: var(--admin-theme-primary);
  --admin-primary-deep: var(--admin-theme-primary-deep);
  --admin-danger: var(--admin-theme-danger);
  --admin-shadow: var(--admin-theme-shadow);

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
  padding: 1.25rem;
}

/* ─── View mode (editing disabled) ────────────── */
.view-mode input,
.view-mode textarea,
.view-mode select {
  pointer-events: none;
  opacity: 0.6;
  background: var(--admin-theme-surface-soft);
  user-select: none;
  cursor: default;
}

.view-mode .initiative-thumb .slot-empty {
  pointer-events: none;
}

.view-mode .sub-editor:hover {
  border-color: var(--admin-theme-border);
}

.view-mode .icon-btn-pencil {
  opacity: 0.3;
  pointer-events: none;
}

.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 38px;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 30%, var(--admin-theme-border));
  border-radius: 7px;
  background: transparent;
  color: var(--admin-theme-primary-deep);
  font: inherit;
  font-size: 0.84rem;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
  padding: 0.55rem 0.8rem;
  transition: all 0.18s ease;
}

.btn-edit:hover {
  background: color-mix(in srgb, var(--admin-theme-primary) 10%, transparent);
  border-color: var(--admin-theme-primary);
  transform: translateY(-1px);
}

.btn-edit-active {
  background: var(--admin-theme-primary);
  color: #ffffff;
  border-color: var(--admin-theme-primary-deep);
}

.btn-edit-active:hover {
  background: var(--admin-theme-primary-deep);
}

/* ─── Hero banner ───────────────────────────────── */
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
  background: linear-gradient(
    135deg,
    var(--admin-theme-surface) 0%,
    color-mix(in srgb, var(--admin-theme-primary) 6%, var(--admin-theme-surface)) 100%
  );
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
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--admin-theme-primary) 20%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.hero-accent-line {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--admin-theme-primary-deep) 0%,
    color-mix(in srgb, var(--admin-theme-primary) 40%, transparent) 60%,
    transparent 100%
  );
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
  color: var(--admin-theme-primary-deep);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--admin-theme-primary) 18%, transparent);
}

.manager-hero h1,
.manager-hero p,
.editor-panel h2,
.editor-panel p {
  margin: 0;
}

.manager-hero h1 {
  color: var(--admin-theme-contrast);
  font-size: 1.35rem;
  line-height: 1.2;
  font-weight: 900;
}

.manager-title {
  display: grid;
  gap: 0.3rem;
  min-width: 0;
}

.manager-meta,
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.manager-meta span {
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 20%, var(--admin-theme-border));
  border-radius: 999px;
  background: color-mix(in srgb, var(--admin-theme-primary) 6%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
  padding: 0.18rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 800;
}

.manager-meta span.meta-dirty {
  border-color: color-mix(in srgb, var(--admin-theme-danger) 50%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-danger) 10%, var(--admin-theme-surface));
  color: var(--admin-theme-danger);
}

/* ─── Eyebrow & kicker ──────────────────────────── */
.eyebrow,
.panel-kicker {
  color: var(--admin-theme-primary-deep);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* ─── Buttons ───────────────────────────────────── */
.btn,
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  gap: 0.4rem;
  min-height: 38px;
  border: 1px solid transparent;
  border-radius: 7px;
  padding: 0.55rem 0.8rem;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 800;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.btn:hover,
.icon-btn:hover {
  transform: translateY(-1px);
}

.btn:active,
.icon-btn:active {
  transform: translateY(0);
}

.btn:disabled,
.icon-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none !important;
}

.btn-primary {
  border-color: var(--admin-theme-primary-deep);
  background: linear-gradient(180deg, var(--admin-theme-primary), var(--admin-theme-primary-deep));
  color: #ffffff;
  box-shadow: 0 6px 16px color-mix(in srgb, var(--admin-theme-primary) 22%, transparent);
}

.btn-primary:hover {
  box-shadow: 0 8px 24px color-mix(in srgb, var(--admin-theme-primary) 32%, transparent);
}

.btn-secondary,
.icon-btn {
  border-color: color-mix(in srgb, var(--admin-theme-contrast-soft) 42%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-surface) 86%, var(--admin-theme-contrast) 14%);
  color: var(--admin-theme-contrast);
}

.btn-sm {
  min-height: 34px;
  padding: 0.4rem 0.65rem;
  font-size: 0.78rem;
}

.icon-btn {
  width: 34px;
  min-height: 34px;
  padding: 0;
}

.icon-btn.danger {
  border-color: color-mix(in srgb, var(--admin-theme-danger) 60%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-danger) 9%, var(--admin-theme-surface));
  color: var(--admin-theme-danger);
}

.btn-secondary:hover,
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

/* ─── State / loading ───────────────────────────── */
.state-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 1rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 10px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-muted);
  padding: 2.5rem 1rem;
  font-weight: 700;
  text-align: center;
}

.state-spinner {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border: 2px solid var(--admin-theme-border);
  border-top-color: var(--admin-theme-primary);
  border-radius: 50%;
  animation: state-spin 0.8s linear infinite;
}

@keyframes state-spin {
  to { transform: rotate(360deg); }
}

/* ─── Content grid ──────────────────────────────── */
.content-grid {
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;
}

/* ─── Editor panels ─────────────────────────────── */
.editor-panel {
  overflow: hidden;
  border: 1px solid var(--admin-theme-border);
  border-radius: 10px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
  transition: box-shadow 0.2s ease;
}

.editor-panel:hover {
  box-shadow:
    var(--admin-theme-shadow),
    0 2px 8px color-mix(in srgb, var(--admin-theme-primary) 6%, transparent);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--admin-theme-surface-soft) 60%, var(--admin-theme-surface)) 0%,
    color-mix(in srgb, var(--admin-theme-primary) 4%, var(--admin-theme-surface)) 100%
  );
  padding: 0.8rem 1rem;
}

.panel-header-clickable {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--admin-theme-border);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.panel-header-clickable:hover {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--admin-theme-surface-soft) 70%, var(--admin-theme-surface)) 0%,
    color-mix(in srgb, var(--admin-theme-primary) 7%, var(--admin-theme-surface)) 100%
  );
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.panel-header-left-clickable {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.panel-header-left-clickable:hover {
  opacity: 0.78;
}

.panel-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.panel-icon-wrap {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 8px;
  background: color-mix(in srgb, var(--admin-theme-primary) 12%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.panel-header h2 {
  color: var(--admin-theme-contrast);
  font-size: 1rem;
  font-weight: 850;
}

.panel-body {
  padding: 1rem;
}

.panel-desc {
  color: var(--admin-theme-muted);
  font-size: 0.82rem;
  line-height: 1.5;
  margin-bottom: 0.85rem;
}

/* ─── Chevron ──────────────────────────────────── */
.edit-icon {
  flex-shrink: 0;
  color: var(--admin-theme-primary-deep);
  opacity: 0.5;
  transition: opacity 0.18s ease;
}

.panel-header:hover .edit-icon {
  opacity: 1;
}

.icon-btn-pencil {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--admin-theme-primary-deep);
  opacity: 0.5;
  cursor: pointer;
  transition: opacity 0.18s ease, background 0.18s ease;
}

.panel-header:hover .icon-btn-pencil,
.icon-btn-pencil:hover,
.icon-btn-pencil:focus-visible {
  opacity: 1;
}

.icon-btn-pencil:hover {
  background: color-mix(in srgb, var(--admin-theme-primary) 12%, transparent);
}

.chevron {
  flex-shrink: 0;
  color: var(--admin-theme-muted);
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.chevron-up {
  transform: rotate(-180deg);
}

.icon-btn.icon-btn-ghost {
  border-color: transparent;
  background: transparent;
  color: var(--admin-theme-muted);
  width: 32px;
  min-height: 32px;
}

.icon-btn.icon-btn-ghost:hover {
  color: var(--admin-theme-primary-deep);
  background: color-mix(in srgb, var(--admin-theme-primary) 8%, transparent);
}

/* ─── Collapse transition ──────────────────────── */
.collapse-enter-active {
  transition: opacity 0.2s ease, max-height 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

.collapse-leave-active {
  transition: opacity 0.15s ease, max-height 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 6000px;
}

/* ─── Quick links ───────────────────────────────── */
.quick-links-body {
  padding: 1rem;
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

/* ─── Field hints ───────────────────────────────── */
.field-hint {
  color: var(--admin-theme-muted);
  font-size: 0.74rem;
  font-weight: 600;
  line-height: 1.4;
}

/* ─── Input fields ──────────────────────────────── */
.field,
.upload-box {
  display: grid;
  gap: 0.35rem;
  color: var(--admin-theme-muted);
  font-size: 0.78rem;
  font-weight: 800;
}

.field span,
.upload-box span {
  color: var(--admin-theme-contrast-soft);
}

.field em {
  font-style: normal;
  color: var(--admin-theme-muted);
  font-weight: 600;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  border: 1px solid var(--admin-theme-border-strong);
  border-radius: 7px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-text);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.65rem 0.75rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field textarea {
  resize: vertical;
  line-height: 1.5;
}

.field input:focus,
.field textarea:focus,
.field select:focus {
  border-color: var(--admin-theme-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 15%, transparent);
  outline: none;
}

.edit-flash {
  animation: edit-flash-pulse 0.8s ease;
}

@keyframes edit-flash-pulse {
  0% {
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--admin-theme-primary) 45%, transparent);
  }
  100% {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 15%, transparent);
  }
}

/* ─── Layout grids ──────────────────────────────── */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.wide {
  grid-column: 1 / -1;
}

/* ─── Image editors ─────────────────────────────── */
.image-editor-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.7fr) minmax(320px, 1.3fr);
  gap: 1.1rem;
  padding: 1.1rem;
}

/* ─── Initiative editor layout (smaller image) ── */
.initiative-editor-layout {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.initiative-thumb-wrap {
  flex-shrink: 0;
  width: 100px;
}

.initiative-thumb {
  width: 100px;
  height: 70px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--admin-theme-border);
  background: var(--admin-theme-surface-soft);
  display: grid;
  place-items: center;
}

.initiative-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.initiative-thumb .slot-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--admin-theme-muted);
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.25rem;
}

.initiative-fields {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.75rem;
}

.upload-disabled {
  pointer-events: none;
  opacity: 0.5;
}

.image-preview {
  margin: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 26%, var(--admin-theme-border));
  border-radius: 7px;
  background: var(--admin-theme-surface-soft);
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

.initiative-preview {
  aspect-ratio: 4 / 3;
}

.slot-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  color: var(--admin-theme-muted);
  opacity: 0.7;
  font-size: 0.76rem;
  font-weight: 700;
}

.form-stack {
  display: grid;
  gap: 0.85rem;
}

/* ─── Stacked cards (stats, sections, etc.) ─────── */
.stack-list {
  display: grid;
  gap: 0.75rem;
}

.sub-editor {
  border: 1px solid var(--admin-theme-border);
  border-radius: 9px;
  background: var(--admin-theme-surface);
  overflow: hidden;
  transition: border-color 0.18s ease;
}

.sub-editor:hover {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 30%, var(--admin-theme-border));
}

.sub-editor-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--admin-theme-surface-soft) 40%, var(--admin-theme-surface)) 0%,
    color-mix(in srgb, var(--admin-theme-primary) 3%, var(--admin-theme-surface)) 100%
  );
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

.section-badge {
  flex-shrink: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--admin-theme-primary) 14%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
  padding: 0.2rem 0.6rem;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sub-editor-body {
  padding: 0.9rem;
  display: grid;
  gap: 0.75rem;
}

/* ─── Bullet chips ──────────────────────────────── */
.item-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding-top: 0.15rem;
}

.item-chip {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--admin-theme-primary) 12%, var(--admin-theme-surface));
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 18%, var(--admin-theme-border));
  color: var(--admin-theme-primary-deep);
  font-size: 0.73rem;
  font-weight: 700;
  line-height: 1.3;
}

/* ─── Image slots (gallery) ─────────────────────── */
.image-slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.85rem;
}

.image-slot {
  border: 1px solid var(--admin-theme-border);
  border-radius: 9px;
  background: var(--admin-theme-surface);
  overflow: hidden;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.image-slot.filled {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 30%, var(--admin-theme-border));
}

.image-slot:hover {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 35%, var(--admin-theme-border));
  box-shadow: 0 2px 8px color-mix(in srgb, var(--admin-theme-primary) 8%, transparent);
}

.image-slot-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 32%, var(--admin-theme-surface));
  padding: 0.7rem 0.8rem;
}

.image-slot-heading {
  flex: 1;
  min-width: 0;
}

.image-slot-heading h3,
.image-slot-heading p {
  margin: 0;
}

.image-slot-heading h3 {
  color: var(--admin-theme-contrast);
  font-size: 0.86rem;
  font-weight: 900;
}

.image-slot-heading p {
  color: var(--admin-theme-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.image-slot-body {
  padding: 0.85rem;
  display: grid;
  gap: 0.65rem;
}

.slot-preview {
  aspect-ratio: 4 / 3;
}

.add-image-btn {
  margin-top: 0.85rem;
}

/* ─── Dark mode ─────────────────────────────────── */
:global(.admin-dark) .env-admin {
  --admin-bg: var(--admin-theme-bg);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-contrast-soft: var(--admin-theme-contrast-soft);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-primary: var(--admin-theme-primary);
  --admin-primary-deep: var(--admin-theme-primary-deep);
  --admin-danger: var(--admin-theme-danger);
  --admin-shadow: var(--admin-theme-shadow);
}

:global(.admin-dark) .btn-primary {
  color: #071311;
}

:global(.admin-dark) .manager-hero {
  background: linear-gradient(
    135deg,
    var(--admin-theme-surface) 0%,
    color-mix(in srgb, var(--admin-theme-primary) 8%, var(--admin-theme-surface)) 100%
  );
}

:global(.admin-dark) .panel-header,
:global(.admin-dark) .sub-editor-header {
  background: linear-gradient(
    135deg,
    var(--admin-theme-surface) 0%,
    color-mix(in srgb, var(--admin-theme-primary) 6%, var(--admin-theme-surface)) 100%
  );
}

:global(.admin-dark) .panel-header-clickable:hover {
  background: linear-gradient(
    135deg,
    var(--admin-theme-surface) 0%,
    color-mix(in srgb, var(--admin-theme-primary) 10%, var(--admin-theme-surface)) 100%
  );
}

/* ─── Responsive ────────────────────────────────── */
@media (min-width: 900px) {
  .env-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
  }

  .manager-hero,
  .panel-header,
  .sub-editor-header,
  .image-slot-header {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-actions,
  .hero-actions .btn {
    width: 100%;
  }

  .form-grid,
  .image-editor-grid,  .initiative-editor-layout {
    flex-direction: column;
  }

  .initiative-thumb-wrap {
    width: 80px;
  }

  .initiative-thumb {
    width: 80px;
    height: 60px;
  }

  .hero-content-wrap {
    flex-direction: column;
    align-items: flex-start;
  }


}
</style>
