<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  FolderOpen,
  Image as ImageIcon,
  Layers,
  MessageSquareQuote,
  Pencil,
  Plus,
  Save,
  Sprout,
  Trash2,
} from 'lucide-vue-next'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import CollapsiblePanel from '@/components/admin/CollapsiblePanel.vue'
import ImagePickerField from '@/components/admin/ImagePickerField.vue'
import ImageSlotEditor from '@/components/admin/ImageSlotEditor.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'

const ui = useUiStore()

/* ─── Types ─────────────────────────────────────── */
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

interface QuoteContent {
  text: string
}

interface StatItem {
  number: string
  label: string
  description: string
}

interface GalleryImage {
  id: string
  label: string
  url: string
}

/* ─── Gallery slots — order matters: public page reads by array index,
   items 0-5 feed "What we do", 6-9 feed "Why it matters" ─────────── */
const GALLERY_MAP: { label: string; badge: string; hint: string }[] = [
  { label: 'Integrated Farming', badge: 'What we do — 1', hint: 'Integrated Farming' },
  { label: 'Saving-for-Change', badge: 'What we do — 2', hint: 'Saving-for-Change' },
  { label: 'Cooperatives', badge: 'What we do — 3', hint: 'Cooperatives' },
  { label: 'Rural Enterprise', badge: 'What we do — 4', hint: 'Rural Enterprise' },
  { label: 'Financial Literacy', badge: 'What we do — 5', hint: 'Financial Literacy' },
  { label: 'Market Linkages', badge: 'What we do — 6', hint: 'Market Linkages' },
  { label: 'Why it matters — 1', badge: 'Why it matters — 1', hint: 'Debt & trafficking risk' },
  { label: 'Why it matters — 2', badge: 'Why it matters — 2', hint: 'Women-led savings' },
  { label: 'Why it matters — 3', badge: 'Why it matters — 3', hint: 'Cooperative marketplace' },
  { label: 'Why it matters — 4', badge: 'Why it matters — 4', hint: 'Local enterprise' },
]

let _idCounter = 0
function genId() { return `live-img-${++_idCounter}-${Date.now()}` }

function createDefaultGallery(): GalleryImage[] {
  return GALLERY_MAP.map(m => ({ id: genId(), label: m.label, url: '' }))
}

/* ─── Default Livelihood Page ───────────────────── */
function createDefaultLivelihoodPage(): PageDraft {
  return {
    slug: 'programs-livelihood',
    route: '/programs/livelihood',
    group: 'Programs',
    title: 'Livelihood',
    eyebrow: 'Livelihood',
    headline: 'Growing practical income and food security.',
    intro: 'Poverty pushes rural Cambodians into unsafe migration and predatory debt. Santi Sena answers with income at home — soil restored, savings pooled, cooperatives negotiating fair prices, and small enterprises rooted in local resources.',
    heroImageUrl: '',
    primaryAction: '',
    secondaryAction: '',
    sections: [
      {
        id: 'livelihood-work',
        label: 'What we do',
        heading: 'What we do',
        body: 'Integrated farming, savings groups, cooperatives, rural enterprise, financial literacy and market linkages that build family income.',
        items: 'Integrated Farming\nSaving-for-Change\nCooperatives\nRural Enterprise\nFinancial Literacy\nMarket Linkages',
      },
      {
        id: 'livelihood-approach',
        label: 'Approach',
        heading: 'Our approach',
        body: 'We do not distribute cash. We build the systems — saving groups, cooperatives, farmer schools — that let a household earn, save, invest and repeat. Every group is coached for 18–24 months, then graduates to independence with our field team on call.',
        items: '',
      },
      {
        id: 'livelihood-team',
        label: 'Organizational Structure',
        heading: 'Who delivers livelihood programs on the ground',
        body: 'Our dedicated team works across provinces building sustainable income and food security for rural families.',
        items: 'Program Director | compass | Oversees livelihood programs, savings groups, and enterprise partnerships across provinces.\nField Coordinators | map | Manage Saving-for-Change groups and cooperative development in target villages.\nAgricultural Trainers | heart | Deliver farmer field schools and climate-smart agriculture training.\nEnterprise Officers | chart | Support small business development, market linkages and financial literacy.',
      },
      {
        id: 'livelihood-why',
        label: 'Why it matters',
        heading: 'Why it matters',
        body: 'Cash predictability is what lets a family send their child to school this term instead of to a garment factory.',
        items: 'Household income diversification reduces the risk of debt bondage and trafficking\nWomen-led savings shift decision-making power inside the household\nCooperatives break the isolation of the smallholder in the marketplace\nLocal enterprise keeps young adults in the village, near their children',
      },
    ],
    updatedAt: '',
  }
}

const statsBand = ref<StatItem[]>([
  { number: '180+', label: 'SAVINGS GROUPS', description: 'Women-led Saving-for-Change circles active across three provinces.' },
  { number: '2,400+', label: 'MEMBERS', description: 'Saving, lending and investing together.' },
  { number: '12', label: 'COOPERATIVES', description: 'Rice, vegetables, melaleuca oil and handicrafts.' },
])

const quoteContent = ref<QuoteContent>({
  text: 'Our group has lent to twelve families for chickens and school fees. Nobody has left for Thailand this year.',
})

const galleryImages = ref<GalleryImage[]>(createDefaultGallery())

function padGalleryToTen() {
  while (galleryImages.value.length < GALLERY_MAP.length) {
    const i = galleryImages.value.length
    galleryImages.value.push({ id: genId(), label: GALLERY_MAP[i]?.label || `Image ${i + 1}`, url: '' })
  }
}

/* ─── Collapsible panels ───────────────────────── */
const expandedPanels = ref<Record<string, boolean>>({
  'quick-links': true,
  'hero-header': true,
  'gallery': true,
  'stats': true,
  'content': true,
  'quote': true,
})

function togglePanel(id: string) {
  expandedPanels.value[id] = !expandedPanels.value[id]
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

function clearGalleryImage(index: number) {
  const slotName = GALLERY_MAP[index]?.label || `Slot ${index + 1}`
  if (!galleryImages.value[index]?.url?.trim()) return
  ui.openModal(
    'Remove image',
    `Are you sure you want to remove the image from <strong>${slotName}</strong>? The public page will show the default fallback image instead.`,
    () => {
      galleryImages.value[index]!.url = ''
      ui.addToast(`Image removed from "${slotName}".`, 'success')
      void savePageContent()
    },
  )
}

function onGalleryImageSaved(msg: string) {
  ui.addToast(msg, 'success')
  void savePageContent()
}

/* ─── State ─────────────────────────────────────── */
const loading = ref(false)
const saving = ref(false)
const page = ref<PageDraft>(createDefaultLivelihoodPage())
const savedSnapshot = ref('')
const storageMode = ref<'supabase' | 'local'>('supabase')
const STORAGE_KEY = 'live-dashboard-page'

function loadFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, unknown>
      const defaults = createDefaultLivelihoodPage()
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
      if (saved.quoteContent && typeof saved.quoteContent === 'object') {
        quoteContent.value = { ...quoteContent.value, ...saved.quoteContent as Partial<QuoteContent> }
      }
      if (Array.isArray(saved.galleryImages) && saved.galleryImages.length > 0) {
        galleryImages.value = saved.galleryImages as GalleryImage[]
        padGalleryToTen()
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
    quoteContent: { ...quoteContent.value },
    galleryImages: galleryImages.value.map(g => ({ ...g })),
  })
}

const isDirty = computed(() => savedSnapshot.value !== snapshotData())

/* ─── Load from programs table ─────────────────── */
async function loadPageContent() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('title, summary, description, metadata, updated_at')
      .eq('slug', 'programs-livelihood')
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
      const defaults = createDefaultLivelihoodPage()
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
      if (meta?.quoteContent && typeof meta.quoteContent === 'object') {
        quoteContent.value = { ...quoteContent.value, ...meta.quoteContent as Partial<QuoteContent> }
      }
      if (meta?.gallery && Array.isArray(meta.gallery) && meta.gallery.length > 0) {
        galleryImages.value = (meta.gallery as GalleryImage[]).map((g, i) => ({
          id: g.id || genId(),
          label: g.label?.trim() ? g.label : GALLERY_MAP[i]?.label || `Image ${i + 1}`,
          url: g.url || '',
        }))
        padGalleryToTen()
      } else {
        galleryImages.value = createDefaultGallery()
      }

      storageMode.value = 'supabase'
      saveToLocalStorage()
    } else {
      loadFromLocalStorage()
      storageMode.value = 'local'
    }

    savedSnapshot.value = snapshotData()
  } catch (e: unknown) {
    console.warn('Load crashed:', e)
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
      pillar: 'Livelihood',
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
        quoteContent: quoteContent.value,
        gallery: galleryImages.value,
      },
      updated_at: now,
    }

    saveToLocalStorage()

    const { error } = await supabase
      .from('programs')
      .upsert(payload, { onConflict: 'slug' })

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

function parsedItemsForSection(section: EditableSection): string[] {
  return section.items
    ? section.items.split('\n').map(l => l.trim()).filter(Boolean)
    : []
}

function formatDate(value: string) {
  if (!value) return 'Not saved yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not saved yet'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

onMounted(async () => {
  await loadPageContent()
})
</script>

<template>
  <div :class="['live-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="hero-glow" aria-hidden="true"></div>
          <div class="hero-accent-line" aria-hidden="true"></div>
          <div class="hero-content-wrap">
            <div class="hero-icon-wrap">
              <Sprout :size="22" aria-hidden="true" />
            </div>
            <div class="manager-title">
              <p class="eyebrow">Livelihood Program</p>
              <h1>Manage Livelihood page</h1>
              <div class="manager-meta" aria-label="Editable livelihood summary">
                <span>{{ storageMode === 'supabase' ? 'Database' : 'Local only' }}</span>
                <span>{{ statsBand.length }} stats</span>
                <span>{{ page.sections.length }} sections</span>
                <span v-if="isDirty" class="meta-dirty">Unsaved changes</span>
                <span v-else-if="page.updatedAt">Saved {{ formatDate(page.updatedAt) }}</span>
              </div>
            </div>
          </div>
          <div class="hero-actions">
            <RouterLink class="btn btn-secondary" to="/programs/livelihood">
              <ExternalLink :size="16" aria-hidden="true" />
              <span>View page</span>
            </RouterLink>
            <button type="button" class="btn btn-primary" :disabled="saving || loading || !isDirty" @click="savePageContent">
              <Save :size="16" aria-hidden="true" />
              <span>{{ saving ? 'Saving...' : 'Save changes' }}</span>
            </button>
          </div>
        </header>

        <div v-if="loading" class="state-card">
          <span class="state-spinner" aria-hidden="true"></span>
          <span>Loading Livelihood content...</span>
        </div>

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
                    <span>Manage livelihood data entries</span>
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
                  <Sprout :size="18" aria-hidden="true" />
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
                      <input v-model="page.eyebrow" type="text" placeholder="e.g. Livelihood" />
                    </label>
                    <label class="field wide">
                      <span>Headline (main title)</span>
                      <input v-model="page.headline" type="text" placeholder="Growing practical income and food security." />
                    </label>
                    <label class="field wide">
                      <span>Intro / description</span>
                      <textarea v-model="page.intro" rows="3" placeholder="Saving-for-Change groups, women-led cooperatives, and rural enterprises that keep families out of debt."></textarea>
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

          <!-- ═══ Gallery images ═══ -->
          <CollapsiblePanel
            v-model:expanded="expandedPanels['gallery']"
            title="Section images"
            kicker="What we do &amp; Why it matters"
            heading-id="gallery-heading"
          >
            <template #icon>
              <ImageIcon :size="18" aria-hidden="true" />
            </template>

            <p class="panel-desc">Upload a photo for each item below. These feed the "What we do" and "Why it matters" images on the public page.</p>
            <div class="image-slot-grid">
              <ImageSlotEditor
                v-for="(slot, index) in galleryImages"
                :key="slot.id"
                v-model="galleryImages[index]!.url"
                :index="index"
                :badge="GALLERY_MAP[index]?.badge || `Image ${index + 1}`"
                :hint="GALLERY_MAP[index]?.hint || ''"
                :alt="slot.label"
                @clear="clearGalleryImage(index)"
                @saved="onGalleryImageSaved"
                @error="(msg) => ui.addToast(msg, 'error')"
              />
            </div>
          </CollapsiblePanel>

          <!-- ═══ Stats band ═══ -->
          <section class="editor-panel" aria-labelledby="stats-heading">
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
                <Pencil :size="15" class="edit-icon" aria-hidden="true" />
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
                <p class="panel-desc">Edit the statistics shown on the public Livelihood page.</p>

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
                        <input v-model="stat.number" type="text" placeholder="e.g. 180+" />
                      </label>
                      <label class="field">
                        <span>Label</span>
                        <input v-model="stat.label" type="text" placeholder="e.g. SAVINGS GROUPS" />
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
                <p class="panel-desc">Edit the main content blocks shown on the public Livelihood page.</p>

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
                        <textarea v-model="section.items" rows="5" placeholder="Integrated farming systems&#10;Saving-for-Change groups&#10;Agricultural cooperatives"></textarea>
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

          <!-- ═══ Quote / testimonial ═══ -->
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
              <div v-show="expandedPanels['quote']" class="panel-body">
                <label class="field wide">
                  <span>Quote text</span>
                  <textarea v-model="quoteContent.text" rows="3" placeholder="Enter the quote..."></textarea>
                </label>
                <p class="field-hint">This quote appears in the approach section on the public Livelihood page.</p>
              </div>
            </Transition>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.live-admin {
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
  top: -60%;
  right: -10%;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--admin-theme-primary) 20%, transparent) 0%, transparent 70%);
  pointer-events: none;
}

.hero-accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--admin-theme-primary), color-mix(in srgb, var(--admin-theme-primary) 30%, transparent));
}

.hero-content-wrap {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.hero-icon-wrap {
  display: grid;
  width: 2.6rem;
  height: 2.6rem;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 34%, var(--admin-theme-border));
  border-radius: 8px;
  background: color-mix(in srgb, var(--admin-theme-primary-deep) 12%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.manager-title {
  display: grid;
  gap: 0.32rem;
  min-width: 0;
}

.manager-title .eyebrow {
  margin: 0;
}

.manager-title h1 {
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 1.35rem;
  line-height: 1.2;
}

.manager-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.1rem;
}

.manager-meta span {
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 34%, var(--admin-theme-border-strong));
  border-radius: 999px;
  background: color-mix(in srgb, var(--admin-theme-primary-deep) 8%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
  padding: 0.18rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 800;
}

.manager-meta span.meta-dirty {
  border-color: color-mix(in srgb, var(--admin-theme-danger) 45%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-danger) 10%, var(--admin-theme-surface));
  color: var(--admin-theme-danger);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.eyebrow,
.panel-kicker {
  color: var(--admin-theme-primary-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0;
}

.btn,
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  gap: 0.4rem;
  min-height: 38px;
  border: 1px solid transparent;
  border-radius: 6px;
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
  transform: translateY(0px);
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

.btn-primary:hover {
  box-shadow: 0 14px 28px color-mix(in srgb, var(--admin-theme-primary) 30%, transparent);
}

.btn-secondary,
.icon-btn {
  border-color: color-mix(in srgb, var(--admin-theme-contrast-soft) 42%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-surface) 86%, var(--admin-theme-contrast) 14%);
  color: var(--admin-theme-contrast);
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

.btn-sm {
  min-height: 32px;
  padding: 0.4rem 0.65rem;
  font-size: 0.78rem;
}

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

.content-grid {
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border: none;
  border-bottom: 1px solid var(--admin-theme-border);
  background: linear-gradient(180deg, color-mix(in srgb, var(--admin-theme-surface-soft) 50%, var(--admin-theme-surface)) 0%, var(--admin-theme-surface) 100%);
  padding: 0.85rem 1rem;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}

.panel-header-clickable:hover {
  background: linear-gradient(180deg, color-mix(in srgb, var(--admin-theme-primary) 6%, var(--admin-theme-surface)) 0%, var(--admin-theme-surface) 100%);
}

.panel-header-left-clickable {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.panel-header-left-clickable:hover {
  opacity: 0.8;
}

.panel-body {
  padding: 1rem;
}

.panel-desc {
  color: var(--admin-theme-muted);
  font-size: 0.82rem;
  margin-bottom: 0.85rem;
}

.field-hint {
  color: var(--admin-theme-muted);
  font-size: 0.74rem;
  font-weight: 600;
  line-height: 1.4;
  margin-top: 0.5rem;
}

.field {
  display: grid;
  gap: 0.35rem;
  color: var(--admin-theme-muted);
  font-size: 0.8rem;
  font-weight: 800;
}

.field span {
  color: var(--admin-theme-contrast-soft);
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid var(--admin-theme-border-strong);
  border-radius: 6px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-text);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.65rem 0.75rem;
  transition: box-shadow 0.18s ease, border-color 0.18s ease;
}

.field textarea {
  resize: vertical;
  line-height: 1.5;
}

.field input:focus,
.field textarea:focus {
  border-color: var(--admin-theme-primary);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 15%, transparent);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.wide {
  grid-column: 1 / -1;
}

/* Quick links */
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
  padding: 0.7rem 0.85rem;
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

/* Hero image editor */
.image-editor-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.7fr) minmax(320px, 1.3fr);
  gap: 1.1rem;
  padding: 1.1rem;
}

.image-preview {
  margin: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 34%, var(--admin-theme-border));
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

/* Numbered / repeated item cards shared by stats & sections */
.stack-list {
  display: grid;
  gap: 0.75rem;
}

.image-slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.85rem;
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

.item-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.item-chip {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--admin-theme-primary) 12%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
  font-size: 0.74rem;
  font-weight: 700;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 14%, transparent);
}

/* Edit icon */
.edit-icon {
  color: var(--admin-theme-muted);
  opacity: 0.5;
  transition: opacity 0.15s ease, color 0.15s ease;
  flex-shrink: 0;
}

.panel-header:hover .edit-icon {
  opacity: 1;
  color: var(--admin-theme-primary-deep);
}

/* Chevron */
.chevron {
  color: var(--admin-theme-muted);
  flex-shrink: 0;
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chevron-up {
  transform: rotate(-180deg);
}

/* Icon button ghost (no border, just icon) */
.icon-btn-ghost {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 30px !important;
  min-height: 30px !important;
  border: none !important;
  border-radius: 6px !important;
  background: transparent !important;
  color: var(--admin-theme-muted) !important;
  cursor: pointer;
  padding: 0 !important;
  transition: background 0.15s ease, color 0.15s ease !important;
}

.icon-btn-ghost:hover {
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 60%, var(--admin-theme-surface)) !important;
  color: var(--admin-theme-primary-deep) !important;
}

/* Collapse transition */
.collapse-leave-active,
.collapse-enter-active {
  transition:
    opacity 0.24s ease,
    max-height 0.32s cubic-bezier(0.22, 1, 0.36, 1);
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

:global(.admin-dark) .live-admin {
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
  background: linear-gradient(135deg, var(--admin-theme-surface) 0%, color-mix(in srgb, var(--admin-theme-primary) 10%, var(--admin-theme-surface)) 100%);
}

:global(.admin-dark) .hero-icon-wrap {
  background: color-mix(in srgb, var(--admin-theme-primary-deep) 20%, var(--admin-theme-surface));
}

:global(.admin-dark) .panel-header-clickable:hover {
  background: linear-gradient(180deg, color-mix(in srgb, var(--admin-theme-primary) 10%, var(--admin-theme-surface)) 0%, var(--admin-theme-surface) 100%);
}

@media (min-width: 900px) {
  .live-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
  }

  .manager-hero,
  .panel-header,
  .sub-editor-header {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-actions,
  .hero-actions .btn {
    width: 100%;
  }

  .form-grid,
  .image-editor-grid {
    grid-template-columns: 1fr;
  }

  .hero-content-wrap {
    flex-direction: column;
    text-align: center;
  }
}
</style>
