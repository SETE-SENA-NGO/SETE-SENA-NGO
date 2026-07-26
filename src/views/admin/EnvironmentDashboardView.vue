<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  FolderOpen,
  Image as ImageIcon,
  Images,
  Layers,
  ListChecks,
  MessageSquareQuote,
  Pencil,
  Plus,
  Save,
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
  icon: string
  text: string
}

interface GalleryImage {
  src: string
  caption: string
  span: string
}

interface CTAContent {
  label: string
  heading: string
  description: string
  primaryBtnText: string
  primaryBtnUrl: string
  secondaryBtnText: string
  secondaryBtnUrl: string
}

interface QuoteContent {
  text: string
  cite: string
}

interface PartnerItem {
  name: string
  type: string
  description: string
}

interface StatItem {
  number: string
  label: string
  description: string
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
  { number: '571', label: 'HECTARES PROTECTED', description: 'Community forest agreements and restored land.' },
  { number: '18', label: 'VILLAGES SERVED', description: 'With biogas, water access and climate adaptation.' },
  { number: '2,500+', label: 'HOUSEHOLDS REACHED', description: 'With clean water and renewable energy solutions.' },
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
  { number: '01', title: 'Assessment', icon: 'search', text: 'We conduct comprehensive environmental assessments to understand local ecosystems and identify priorities.' },
  { number: '02', title: 'Planning', icon: 'map', text: 'Working with community leaders, we develop tailored action plans that balance conservation with needs.' },
  { number: '03', title: 'Implementation', icon: 'play', text: 'We execute projects with active community participation, ensuring local ownership.' },
  { number: '04', title: 'Monitoring', icon: 'check', text: 'Continuous monitoring helps us measure impact and adapt strategies for greater effectiveness.' },
])

const galleryImages = ref<GalleryImage[]>([
  { src: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=75', caption: 'Reforestation in rural Cambodia', span: '2' },
  { src: 'https://images.unsplash.com/photo-1470071459604-4b118ecb0e7e?w=400&q=75', caption: 'Forest canopy restoration', span: '1' },
  { src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=75', caption: 'Community tree nursery', span: '1' },
  { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=75', caption: 'Eco-tourism initiatives', span: '1' },
  { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=75', caption: 'Nature conservation areas', span: '2' },
])

const ctaContent = ref<CTAContent>({
  label: 'Take Action',
  heading: 'Join the Environmental Movement',
  description: 'Whether you want to volunteer, partner with us, or support our conservation efforts, your contribution helps create a sustainable future for all.',
  primaryBtnText: 'Get Involved',
  primaryBtnUrl: '/get-involved',
  secondaryBtnText: 'Support Us',
  secondaryBtnUrl: '/get-involved/donate',
})

const quoteContent = ref<QuoteContent>({
  text: 'We do not inherit the earth from our ancestors; we borrow it from our children. Our environmental program is a pledge to protect that inheritance and ensure future generations inherit a planet that is healthy, vibrant, and full of possibility.',
  cite: '— SETE SENA Environmental Team',
})

const partners = ref<PartnerItem[]>([
  { name: 'UN Environment', type: 'International Partner', description: '' },
  { name: 'Green Cambodia', type: 'Local NGO', description: '' },
  { name: 'Eco Foundation', type: 'Funding Partner', description: '' },
  { name: 'Wildlife Alliance', type: 'Conservation Partner', description: '' },
  { name: 'Solar Future', type: 'Technology Partner', description: '' },
  { name: 'Rainforest Trust', type: 'Global Supporter', description: '' },
])

/* ─── State ─────────────────────────────────────── */
const loading = ref(false)
const saving = ref(false)
const page = ref<PageDraft>(createDefaultEnvironmentPage())
const savedSnapshot = ref('')
const storageMode = ref<'supabase' | 'local'>('supabase')
const STORAGE_KEY = 'env-dashboard-page'

/* ─── Collapsible panels ───────────────────────── */
const expandedPanels = ref<Record<string, boolean>>({
  'quick-links': true,
  'hero-header': true,
  'stats': true,
  'content': true,
  'initiatives': true,
  'process': true,
  'gallery': true,
  'partners': true,
  'quote': true,
  'cta': true,
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

function confirmDeleteGalleryImage(index: number) {
  const img = galleryImages.value[index]
  const caption = img?.caption?.trim() || `Image ${index + 1}`
  ui.openModal(
    'Remove image',
    `Permanently delete <strong>${caption}</strong> from the gallery? This action cannot be undone.`,
    () => {
      galleryImages.value.splice(index, 1)
      ui.addToast(`Image "${caption}" removed.`, 'success')
    },
  )
}

function confirmDeletePartner(index: number) {
  const partner = partners.value[index]
  const name = partner?.name?.trim() || `Partner ${index + 1}`
  ui.openModal(
    'Delete partner',
    `Permanently remove <strong>${name}</strong> from the partner list? This action cannot be undone.`,
    () => {
      partners.value.splice(index, 1)
      ui.addToast(`Partner "${name}" removed.`, 'success')
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
      if (saved.galleryImages && Array.isArray(saved.galleryImages)) {
        galleryImages.value = saved.galleryImages as GalleryImage[]
      }
      if (saved.ctaContent && typeof saved.ctaContent === 'object') {
        ctaContent.value = { ...ctaContent.value, ...saved.ctaContent as Partial<CTAContent> }
      }
      if (saved.quoteContent && typeof saved.quoteContent === 'object') {
        quoteContent.value = { ...quoteContent.value, ...saved.quoteContent as Partial<QuoteContent> }
      }
      if (saved.partners && Array.isArray(saved.partners)) {
        partners.value = saved.partners as PartnerItem[]
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
      galleryImages: galleryImages.value,
      ctaContent: ctaContent.value,
      quoteContent: quoteContent.value,
      partners: partners.value,
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
    galleryImages: galleryImages.value.map(s => ({ ...s })),
    ctaContent: { ...ctaContent.value },
    quoteContent: { ...quoteContent.value },
    partners: partners.value.map(s => ({ ...s })),
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
      if (meta?.galleryImages && Array.isArray(meta.galleryImages)) {
        galleryImages.value = meta.galleryImages as GalleryImage[]
      }
      if (meta?.ctaContent && typeof meta.ctaContent === 'object') {
        ctaContent.value = { ...ctaContent.value, ...meta.ctaContent as Partial<CTAContent> }
      }
      if (meta?.quoteContent && typeof meta.quoteContent === 'object') {
        quoteContent.value = { ...quoteContent.value, ...meta.quoteContent as Partial<QuoteContent> }
      }
      if (meta?.partners && Array.isArray(meta.partners)) {
        partners.value = meta.partners as PartnerItem[]
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
        galleryImages: galleryImages.value,
        ctaContent: ctaContent.value,
        quoteContent: quoteContent.value,
        partners: partners.value,
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

/* ─── Section helpers ───────────────────────────── */
function parsedItemsForSection(section: EditableSection): string[] {
  return section.items
    ? section.items.split('\n').map(l => l.trim()).filter(Boolean)
    : []
}

/* ─── Helper: format date ───────────────────────── */
function formatDate(value: string) {
  if (!value) return 'Not saved yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not saved yet'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

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
                <span>{{ galleryImages.length }} gallery photos</span>
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
            <button type="button" class="btn btn-primary" :disabled="saving || loading || !isDirty" @click="savePageContent">
              <Save :size="16" aria-hidden="true" />
              <span>{{ saving ? 'Saving...' : 'Save changes' }}</span>
            </button>
          </div>
        </header>

        <div v-if="loading" class="state-card">Loading Environment content...</div>

        <div v-else class="content-grid">
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

          <!-- ═══ Hero & header ═══ -->
          <section class="editor-panel" aria-labelledby="hero-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['hero-header']" @click="togglePanel('hero-header')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <TreePine :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Public page</p>
                  <h2 id="hero-heading">Hero &amp; header</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <Pencil :size="15" class="edit-icon" aria-hidden="true" />
                <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['hero-header'] }" aria-hidden="true" />
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['hero-header']" class="image-editor-grid">
                <figure class="image-preview hero-preview">
                  <img v-if="page.heroImageUrl" :src="page.heroImageUrl" alt="" />
                  <div v-else class="slot-empty">
                    <ImageIcon :size="22" aria-hidden="true" />
                    <span>No image set</span>
                  </div>
                </figure>

                <div class="form-stack">
                  <div class="form-grid">
                    <label class="field">
                      <span>Eyebrow / badge</span>
                      <input v-model="page.eyebrow" type="text" placeholder="e.g. Environment" />
                    </label>
                    <label class="field wide">
                      <span>Headline (main title)</span>
                      <input v-model="page.headline" type="text" placeholder="Protecting the land that sustains villages." />
                    </label>
                    <label class="field wide">
                      <span>Intro / description</span>
                      <textarea v-model="page.intro" rows="3" placeholder="Community forestry, biogas digesters, rainwater harvesting and WASH."></textarea>
                    </label>
                  </div>

                  <ImagePickerField
                    v-model="page.heroImageUrl"
                    label="Upload or paste URL"
                    hint="Background image for the hero section"
                    hide-preview
                    @success="(msg) => ui.addToast(msg, 'success')"
                    @error="(msg) => ui.addToast(msg, 'error')"
                  />
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
                <button type="button" class="btn btn-secondary btn-sm" @click="statsBand.push({ number: '', label: '', description: '' })">
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
                      <button type="button" class="icon-btn danger" aria-label="Remove stat" @click="confirmDeleteStat(index)">
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
                        <input v-model="stat.label" type="text" placeholder="e.g. HECTARES PROTECTED" />
                      </label>
                      <label class="field wide">
                        <span>Description</span>
                        <input v-model="stat.description" type="text" placeholder="Brief description of this statistic" />
                      </label>
                    </div>
                  </article>
                </div>
              </div>
            </Transition>
          </section>

          <!-- ═══ Page sections ═══ -->
          <section class="editor-panel" aria-labelledby="sections-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['content']" @click="togglePanel('content')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <BookOpen :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Content</p>
                  <h2 id="sections-heading">What we do, approach &amp; why it matters</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <Pencil :size="15" class="edit-icon" aria-hidden="true" />
                <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['content'] }" aria-hidden="true" />
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['content']" class="panel-body">
                <p class="panel-desc">Edit the main content blocks shown on the public Environment page.</p>

                <div class="stack-list">
                  <article v-for="section in page.sections" :key="section.id" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="section-badge">{{ section.label }}</span>
                      <h3>{{ section.heading || 'No heading yet' }}</h3>
                    </header>
                    <div class="sub-editor-body">
                      <label class="field wide">
                        <span>Heading</span>
                        <input v-model="section.heading" type="text" :placeholder="'Heading for ' + section.label" />
                      </label>
                      <label class="field wide">
                        <span>Body / description</span>
                        <textarea v-model="section.body" rows="3" :placeholder="'Description for ' + section.label"></textarea>
                      </label>
                      <label class="field wide">
                        <span>Bullet items <em>(one per line)</em></span>
                        <textarea v-model="section.items" rows="5" placeholder="Community forestry agreements&#10;Biogas digester installation&#10;Rainwater harvesting systems"></textarea>
                      </label>
                      <div v-if="parsedItemsForSection(section).length" class="item-chips">
                        <span v-for="item in parsedItemsForSection(section)" :key="item" class="item-chip">{{ item }}</span>
                      </div>
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
                <button type="button" class="btn btn-secondary btn-sm" @click="initiatives.push({ title: '', text: '', img: '', tag: '' })">
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
                      <button type="button" class="icon-btn danger" aria-label="Remove initiative" @click="confirmDeleteInitiative(index)">
                        <Trash2 :size="15" aria-hidden="true" />
                      </button>
                    </header>
                    <div class="sub-editor-body">
                      <div class="image-editor-grid image-editor-grid--compact">
                        <figure class="image-preview initiative-preview">
                          <img v-if="item.img" :src="item.img" alt="" />
                          <div v-else class="slot-empty">
                            <ImageIcon :size="20" aria-hidden="true" />
                            <span>No image</span>
                          </div>
                        </figure>
                        <div class="form-stack">
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
                <button type="button" class="btn btn-secondary btn-sm" @click="processSteps.push({ number: '', title: '', icon: 'search', text: '' })">
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
                      <button type="button" class="icon-btn danger" aria-label="Remove step" @click="confirmDeleteProcessStep(index)">
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
                      <label class="field">
                        <span>Icon</span>
                        <select v-model="step.icon">
                          <option value="search">Search / Magnifier</option>
                          <option value="map">Map / Pin</option>
                          <option value="play">Play / Action</option>
                          <option value="check">Check / Done</option>
                        </select>
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

          <!-- ═══ Field gallery ═══ -->
          <section class="editor-panel" data-panel-id="gallery" aria-labelledby="gallery-heading">
            <div class="panel-header">
              <div class="panel-header-left panel-header-left-clickable" @click="togglePanel('gallery')">
                <div class="panel-icon-wrap">
                  <Images :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Field gallery</p>
                  <h2 id="gallery-heading">Gallery images</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <button type="button" class="icon-btn-pencil" aria-label="Jump to edit gallery" @click.stop="editPanel('gallery')">
                  <Pencil :size="15" aria-hidden="true" />
                </button>
                <button type="button" class="btn btn-secondary btn-sm" @click="galleryImages.push({ src: '', caption: '', span: '1' })">
                  <Plus :size="15" aria-hidden="true" />
                  <span>Add image</span>
                </button>
                <button type="button" class="icon-btn icon-btn-ghost" aria-label="Toggle panel" @click="togglePanel('gallery')">
                  <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['gallery'] }" />
                </button>
              </div>
            </div>
            <Transition name="collapse">
              <div v-show="expandedPanels['gallery']" class="panel-body">
                <p class="panel-desc">
                  Upload a photo or paste a URL for each gallery slot. Set the span to "2 columns" for a wider tile on the public page.
                  {{ galleryImages.filter(i => !i.src?.trim()).length }} of {{ galleryImages.length }} slots are missing an image.
                </p>

                <div class="image-slot-grid">
                  <article v-for="(img, index) in galleryImages" :key="index" class="image-slot" :class="{ filled: !!img.src }">
                    <header class="image-slot-header">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <div class="image-slot-heading">
                        <h3>{{ img.caption || 'Untitled photo' }}</h3>
                        <p>{{ img.span === '2' ? 'Wide (2 columns)' : 'Standard (1 column)' }}</p>
                      </div>
                      <button type="button" class="icon-btn danger" aria-label="Remove image" @click="confirmDeleteGalleryImage(index)">
                        <Trash2 :size="15" aria-hidden="true" />
                      </button>
                    </header>
                    <div class="image-slot-body">
                      <figure class="image-preview slot-preview">
                        <img v-if="img.src" :src="img.src" :alt="img.caption" />
                        <div v-else class="slot-empty">
                          <ImageIcon :size="22" aria-hidden="true" />
                          <span>No image set</span>
                        </div>
                      </figure>
                      <div class="form-grid">
                        <label class="field">
                          <span>Caption</span>
                          <input v-model="img.caption" type="text" placeholder="e.g. Reforestation in rural Cambodia" />
                        </label>
                        <label class="field">
                          <span>Span</span>
                          <select v-model="img.span">
                            <option value="1">1 column</option>
                            <option value="2">2 columns (wider)</option>
                          </select>
                        </label>
                      </div>
                      <ImagePickerField
                        v-model="img.src"
                        :label="img.caption || `Gallery image ${index + 1}`"
                        hide-preview
                        @success="(msg) => ui.addToast(msg, 'success')"
                        @error="(msg) => ui.addToast(msg, 'error')"
                      />
                    </div>
                  </article>
                </div>

                <button type="button" class="btn btn-secondary add-image-btn" @click="galleryImages.push({ src: '', caption: '', span: '1' })">
                  <Plus :size="16" aria-hidden="true" />
                  <span>Add image</span>
                </button>
              </div>
            </Transition>
          </section>

          <!-- ═══ Our support (partners) ═══ -->
          <section class="editor-panel" aria-labelledby="partners-heading">
            <div class="panel-header">
              <div class="panel-header-left panel-header-left-clickable" @click="togglePanel('partners')">
                <div class="panel-icon-wrap">
                  <FolderOpen :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Our support</p>
                  <h2 id="partners-heading">Partner organizations</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <Pencil :size="15" class="edit-icon" aria-hidden="true" />
                <button type="button" class="btn btn-secondary btn-sm" @click="partners.push({ name: '', type: '', description: '' })">
                  <Plus :size="15" aria-hidden="true" />
                  <span>Add partner</span>
                </button>
                <button type="button" class="icon-btn icon-btn-ghost" aria-label="Toggle panel" @click="togglePanel('partners')">
                  <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['partners'] }" />
                </button>
              </div>
            </div>
            <Transition name="collapse">
              <div v-show="expandedPanels['partners']" class="panel-body">
                <p class="panel-desc">Edit the partner organizations shown in the "Our Supporters" section.</p>

                <div class="stack-list">
                  <article v-for="(partner, index) in partners" :key="index" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h3>{{ partner.name || 'Untitled partner' }}</h3>
                      <button type="button" class="icon-btn danger" aria-label="Remove partner" @click="confirmDeletePartner(index)">
                        <Trash2 :size="15" aria-hidden="true" />
                      </button>
                    </header>
                    <div class="sub-editor-body form-grid">
                      <label class="field">
                        <span>Name</span>
                        <input v-model="partner.name" type="text" placeholder="e.g. UN Environment" />
                      </label>
                      <label class="field">
                        <span>Type / relationship</span>
                        <input v-model="partner.type" type="text" placeholder="e.g. International Partner" />
                      </label>
                      <label class="field wide">
                        <span>Description <em>(optional)</em></span>
                        <textarea v-model="partner.description" rows="2" placeholder="Brief description of the partnership..."></textarea>
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

          <!-- ═══ CTA section ═══ -->
          <section class="editor-panel" aria-labelledby="cta-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['cta']" @click="togglePanel('cta')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <ListChecks :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Call to action</p>
                  <h2 id="cta-heading">CTA section</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <Pencil :size="15" class="edit-icon" aria-hidden="true" />
                <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['cta'] }" aria-hidden="true" />
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['cta']" class="panel-body form-grid">
                <label class="field">
                  <span>Label / eyebrow</span>
                  <input v-model="ctaContent.label" type="text" placeholder="e.g. Take Action" />
                </label>
                <label class="field">
                  <span>Heading</span>
                  <input v-model="ctaContent.heading" type="text" placeholder="e.g. Join the Environmental Movement" />
                </label>
                <label class="field wide">
                  <span>Description</span>
                  <textarea v-model="ctaContent.description" rows="2" placeholder="CTA description..."></textarea>
                </label>
                <label class="field">
                  <span>Primary button text</span>
                  <input v-model="ctaContent.primaryBtnText" type="text" placeholder="e.g. Get Involved" />
                </label>
                <label class="field">
                  <span>Primary button URL</span>
                  <input v-model="ctaContent.primaryBtnUrl" type="text" placeholder="e.g. /get-involved" />
                </label>
                <label class="field">
                  <span>Secondary button text</span>
                  <input v-model="ctaContent.secondaryBtnText" type="text" placeholder="e.g. Support Us" />
                </label>
                <label class="field">
                  <span>Secondary button URL</span>
                  <input v-model="ctaContent.secondaryBtnUrl" type="text" placeholder="e.g. /get-involved/donate" />
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
  padding-top: calc(60px + 1.25rem);
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
  margin-top: 1rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 10px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-muted);
  padding: 1rem;
  font-weight: 700;
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

.image-editor-grid--compact {
  padding: 0;
  grid-template-columns: minmax(160px, 0.5fr) minmax(240px, 1.5fr);
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
    padding-top: calc(60px + 1rem);
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
  .image-editor-grid,
  .image-editor-grid--compact {
    grid-template-columns: 1fr;
  }

  .hero-content-wrap {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
