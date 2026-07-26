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
  Plus,
  Save,
  Trash2,
} from 'lucide-vue-next'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ImagePickerField from '@/components/admin/ImagePickerField.vue'
import { supabase } from '@/lib/supabase'
import { imageUrls } from '@/lib/imageUrls'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'

const ui = useUiStore()
const auth = useAuthStore()

/* ─── Types ─────────────────────────────────────── */
interface EditableSection {
  id: string
  label: string
  heading: string
  body: string
  items: string
}

interface GalleryImage {
  id: string
  label: string
  url: string
}

interface PageDraft {
  slug: string
  title: string
  galleryImages: GalleryImage[]
  sections: EditableSection[]
  updatedAt: string
}

interface StatItem {
  number: string
  label: string
  description: string
}

interface TeamCard {
  role: string
  icon: string
  desc: string
}

/* ─── Image slot metadata ───────────────────────── */
const IMAGE_MAP: { field: string; label: string; badge: string; hint: string }[] = [
  { field: 'introImageUrl', label: 'Intro Section Image', badge: 'Intro section', hint: 'Our Mission — hero image' },
  { field: 'readingImageUrl', label: 'What We Do — Reading Image', badge: 'What we do — back', hint: 'Reading / background photo' },
  { field: 'teacherImageUrl', label: 'What We Do — Teacher Image', badge: 'What we do — front', hint: 'Teacher / foreground photo' },
  { field: 'studyImageUrl', label: 'Why It Matters — Study Image', badge: 'Why it matters', hint: 'Impact / study image' },
]

/* ─── Default values matching public website ────── */
let _idCounter = 0
function genId() { return `img-${++_idCounter}-${Date.now()}` }

const statsBand = ref<StatItem[]>([
  { number: '120+', label: 'PRE-SCHOOL CHILDREN', description: 'Enrolled each year across remote villages in Svay Rieng and Prey Veng.' },
  { number: '8', label: 'MOBILE LIBRARIES', description: 'Reaching villages with no school library or bookshop within 20 km.' },
  { number: '60+', label: 'ANNUAL SCHOLARSHIPS', description: 'For the poorest students at every level — especially girls.' },
])

const teamCards = ref<TeamCard[]>([
  { role: 'Program Director', icon: 'compass', desc: 'Oversees education initiatives, partnerships, and donor reporting across all provinces.' },
  { role: 'Field Coordinators', icon: 'map', desc: 'Manage pre-school, library and scholarship programs in each province.' },
  { role: 'Teachers & Facilitators', icon: 'heart', desc: 'Deliver early learning, literacy sessions and youth clubs in village settings.' },
  { role: 'Monitoring & Evaluation', icon: 'chart', desc: 'Tracks learning progress, attendance and community outcomes.' },
])

function defaultSections() {
  return [
    {
      id: 'education-work',
      label: 'What we do',
      heading: 'What we do',
      body: 'Community pre-schools led by trained local teachers, mobile libraries reaching remote villages, scholarships for the poorest students, Buddhist moral education, youth peer-educator groups, and teacher training to keep children in school.',
      items: 'Community pre-schools led by trained local teachers in remote villages\nMobile library service bringing books, audio and learning kits to children\nScholarships covering uniforms, supplies and transport for the poorest students\nBuddhist moral education and life-skills classes in pagoda settings\nYouth peer-educator groups on health, environment and child rights\nTeacher training and parent engagement to keep children in school',
    },
    {
      id: 'education-approach',
      label: 'Approach',
      heading: 'Our approach',
      body: 'We hire teachers from the villages we serve, train them in early-childhood pedagogy, and pair every classroom with a parent committee. Curriculum blends the national standard with Buddhist ethics, Khmer culture and hands-on environmental learning — so a child grows up rooted in both the national curriculum and the wisdom of the pagoda.',
      items: '',
    },
    {
      id: 'education-why',
      label: 'Why it matters',
      heading: 'Why it matters',
      body: 'Children who attend pre-school are far more likely to complete primary and secondary school. Scholarships keep the poorest girls in class through their most vulnerable years, while mobile libraries reach villages a bus route never will.',
      items: 'Children who attend pre-school are far more likely to complete primary and secondary school\nScholarships keep the poorest girls in class through the most vulnerable years\nMobile libraries reach children a bus route never will\nPagoda-based ethics classes preserve Khmer language and moral tradition',
    },
    {
      id: 'education-team',
      label: 'Organizational Structure',
      heading: 'Who delivers education on the ground',
      body: 'Our dedicated team works across provinces to ensure every child has access to quality education.',
      items: teamCards.value.map(c => `${c.role} | ${c.icon} | ${c.desc}`).join('\n'),
    },
  ]
}

const page = ref<PageDraft>({
  slug: 'programs-education',
  title: 'Education',
  galleryImages: [
    { id: genId(), label: 'Intro Section Image', url: imageUrls.education.intro },
    { id: genId(), label: 'What We Do — Reading Image', url: imageUrls.education.reading },
    { id: genId(), label: 'What We Do — Teacher Image', url: imageUrls.education.teacher },
    { id: genId(), label: 'Why It Matters — Study Image', url: imageUrls.education.study },
  ],
  sections: defaultSections(),
  updatedAt: '',
})

/* ─── State ─────────────────────────────────────── */
const loading = ref(false)
const saving = ref(false)
const savedSnapshot = ref('')
const storageMode = ref<'supabase' | 'local'>('supabase')
const STORAGE_KEY = 'edu-dashboard-page'
// Holds metadata keys not managed by this dashboard (e.g. headline, intro set via SQL)
// so saving here never clobbers them.
const rawMetadata = ref<Record<string, unknown>>({})

/* ─── Collapsible panels ───────────────────────── */
const expandedPanels = ref<Record<string, boolean>>({
  'quick-links': true,
  'page-images': true,
  'stats': true,
  'content': true,
  'team': true,
})

function togglePanel(id: string) {
  expandedPanels.value[id] = !expandedPanels.value[id]
}

/* ─── Derived view data ─────────────────────────── */
const imageSlots = computed(() =>
  IMAGE_MAP.map((m, index) => ({
    index,
    label: m.label,
    badge: m.badge,
    hint: m.hint,
    url: page.value.galleryImages[index]?.url || '',
  })),
)
const contentSections = computed(() => page.value.sections.filter(s => s.id !== 'education-team'))

function saveToLocalStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      galleryImages: page.value.galleryImages,
      sections: page.value.sections,
      statsBand: statsBand.value,
      teamCards: teamCards.value,
      updatedAt: new Date().toISOString(),
    }))
  } catch { /* ignore */ }
}

function loadFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw) as Record<string, unknown>
    if (Array.isArray(saved.galleryImages) && saved.galleryImages.length > 0) {
      page.value.galleryImages = saved.galleryImages as GalleryImage[]
    } else {
      // Backward compat: migrate individual fields to gallery
      const urls = [
        String(saved.introImageUrl || ''),
        String(saved.readingImageUrl || ''),
        String(saved.teacherImageUrl || ''),
        String(saved.studyImageUrl || ''),
      ]
      page.value.galleryImages = IMAGE_MAP.map((m, i) => ({
        id: genId(),
        label: m.label,
        url: urls[i] || '',
      }))
    }
    // Ensure exactly 4 image slots (pad with empty if needed)
    padGalleryToFour()
    if (Array.isArray(saved.sections)) {
      const savedSections = saved.sections as EditableSection[]
      page.value.sections = page.value.sections.map(defSec => {
        const match = savedSections.find(s => s.id === defSec.id)
        return match ? { ...defSec, ...match } : defSec
      })
    }
    if (Array.isArray(saved.statsBand)) statsBand.value = saved.statsBand as StatItem[]
    if (Array.isArray(saved.teamCards)) teamCards.value = saved.teamCards as TeamCard[]
    if (typeof saved.updatedAt === 'string') page.value.updatedAt = saved.updatedAt
  } catch { /* ignore */ }
}

function snapshotData(): string {
  return JSON.stringify({
    galleryImages: page.value.galleryImages.map(g => ({ ...g })),
    sections: page.value.sections.map(s => ({ ...s })),
    statsBand: statsBand.value.map(s => ({ ...s })),
    teamCards: teamCards.value.map(s => ({ ...s })),
  })
}

const isDirty = computed(() => savedSnapshot.value !== snapshotData())

/* ─── Parse team cards from section items ──────── */
function parseTeamFromSection(section: EditableSection): void {
  if (section.items?.trim()) {
    const lines = section.items.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length > 0) {
      teamCards.value = lines.map(line => {
        const parts = line.split('|').map(p => p.trim())
        return {
          role: parts[0] || '',
          icon: parts[1] || 'chart',
          desc: parts[2] || parts[0] || '',
        }
      })
    }
  }
}

function saveTeamToSection(): void {
  const teamSection = page.value.sections.find(s => s.id === 'education-team')
  if (teamSection) {
    teamSection.items = teamCards.value.map(c => `${c.role} | ${c.icon} | ${c.desc}`).join('\n')
  }
}

/* ─── Load from programs table ─────────────────── */
async function loadPageContent() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('title, summary, description, metadata, updated_at')
      .eq('slug', 'programs-education')
      .maybeSingle()

    if (error) {
      console.warn('Supabase load failed, falling back to localStorage:', error.message)
      loadFromLocalStorage()
      storageMode.value = 'local'
      savedSnapshot.value = snapshotData()
      loading.value = false
      return
    }

    if (data && data.metadata) {
      const meta = data.metadata as Record<string, unknown>
      rawMetadata.value = { ...meta }

      // Image gallery — prefer gallery array, fall back to individual fields
      const galleryFromMeta = meta.gallery as GalleryImage[] | undefined
      if (Array.isArray(galleryFromMeta) && galleryFromMeta.length > 0) {
        page.value.galleryImages = galleryFromMeta.map((g, i) => ({
          id: g.id || genId(),
          // Reassign labels from IMAGE_MAP to ensure keyword matching works on the public page
          label: (g.label?.trim() ? g.label : IMAGE_MAP[i]?.label || `Slot ${i + 1}`),
          url: g.url || '',
        }))
        // Ensure exactly 4 image slots (pad with empty if needed)
        padGalleryToFour()
      } else {
        // Backward compat: map individual fields to gallery
        const urls = [
          String(meta.introImageUrl || ''),
          String(meta.readingImageUrl || ''),
          String(meta.teacherImageUrl || ''),
          String(meta.studyImageUrl || ''),
        ]
        page.value.galleryImages = IMAGE_MAP.map((m, i) => ({
          id: genId(),
          label: m.label,
          url: urls[i] || '',
        }))
      }

      // Stats band
      if (Array.isArray(meta.statsBand) && meta.statsBand.length > 0) {
        statsBand.value = meta.statsBand as StatItem[]
      }

      // Sections (What we do, Approach, Why it matters)
      if (Array.isArray(meta.sections)) {
        const dbSections = meta.sections as EditableSection[]
        page.value.sections = page.value.sections.map(defSec => {
          const match = dbSections.find(s => s.id === defSec.id)
          return match ? { ...defSec, ...match } : defSec
        })
      }

      // Team cards from education-team section
      const teamSection = page.value.sections.find(s => s.id === 'education-team')
      if (teamSection) {
        parseTeamFromSection(teamSection)
      }

      page.value.updatedAt = data.updated_at || ''

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
    // Save team cards back into the team section before saving
    saveTeamToSection()

    const now = new Date().toISOString()

    const payload = {
      slug: 'programs-education',
      title: 'Education Program',
      pillar: 'Education',
      summary: 'Community pre-schools, mobile libraries, scholarships and Buddhist education.',
      description: 'Helping rural children keep learning through local teachers, libraries and family support.',
      status: 'published',
      metadata: {
        ...rawMetadata.value,
        // Store gallery array and individual fields for backward compatibility
        gallery: page.value.galleryImages,
        introImageUrl: page.value.galleryImages[0]?.url || '',
        readingImageUrl: page.value.galleryImages[1]?.url || '',
        teacherImageUrl: page.value.galleryImages[2]?.url || '',
        studyImageUrl: page.value.galleryImages[3]?.url || '',
        statsBand: statsBand.value,
        sections: page.value.sections.map(s => ({
          id: s.id,
          label: s.label,
          heading: s.heading,
          body: s.body,
          items: s.items,
        })),
      },
      updated_at: now,
    }

    saveToLocalStorage()

    // Try upsert first
    let { error } = await supabase
      .from('programs')
      .upsert(payload, { onConflict: 'slug' })

    // If upsert fails with RLS, try insert then update
    if (error && error.message?.includes('row-level security')) {
      console.warn('Upsert blocked by RLS, trying insert/update separately...')

      const { error: insertError } = await supabase
        .from('programs')
        .insert(payload)

      if (insertError && insertError.message?.includes('duplicate key')) {
        const { error: updateError } = await supabase
          .from('programs')
          .update(payload)
          .eq('slug', 'programs-education')

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

    rawMetadata.value = payload.metadata
    storageMode.value = 'supabase'
    savedSnapshot.value = snapshotData()
    ui.addToast('Education page saved!', 'success')
  } catch (e: unknown) {
    console.error('Save crashed:', e)
    ui.addToast('Saved to browser (database error)', 'info')
    storageMode.value = 'local'
    savedSnapshot.value = snapshotData()
  } finally {
    saving.value = false
  }
}

/* ─── Ensure gallery always has exactly 4 slots ── */
function padGalleryToFour() {
  while (page.value.galleryImages.length < 4) {
    page.value.galleryImages.push({
      id: genId(),
      label: IMAGE_MAP[page.value.galleryImages.length]?.label || `Image ${page.value.galleryImages.length + 1}`,
      url: '',
    })
  }
}

function missingImageWarning(): string {
  const names: string[] = []
  if (!page.value.galleryImages[0]?.url?.trim()) names.push('Intro Section')
  if (!page.value.galleryImages[1]?.url?.trim()) names.push('What We Do — Reading')
  if (!page.value.galleryImages[2]?.url?.trim()) names.push('What We Do — Teacher')
  if (!page.value.galleryImages[3]?.url?.trim()) names.push('Why It Matters — Study')
  if (names.length === 0) return ''
  return `${names.length} image slot${names.length > 1 ? 's' : ''} missing: ${names.join(', ')}. These sections will show the default fallback image.`
}

function clearGalleryImage(index: number) {
  const slotName = IMAGE_MAP[index]?.label || `Slot ${index + 1}`
  if (!page.value.galleryImages[index]?.url?.trim()) return

  ui.openModal(
    'Remove image',
    `Are you sure you want to remove the image from <strong>${slotName}</strong>? The public page will show the default fallback image instead.`,
    () => {
      page.value.galleryImages[index]!.url = ''
      ui.addToast(`Image removed from "${slotName}".`, 'success')
      void savePageContent()
    },
  )
}

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

function confirmDeleteTeamCard(index: number) {
  const card = teamCards.value[index]
  const role = card?.role?.trim() || `Card ${index + 1}`
  ui.openModal(
    'Delete team card',
    `Permanently delete the <strong>${role}</strong> card from the organizational structure? This action cannot be undone.`,
    () => {
      teamCards.value.splice(index, 1)
      ui.addToast(`Team card "${role}" deleted.`, 'success')
    },
  )
}

function onGalleryImageSaved(msg: string) {
  ui.addToast(msg, 'success')
  void savePageContent()
}

function parsedItemsForSection(section: EditableSection): string[] {
  return section.items ? section.items.split('\n').map(l => l.trim()).filter(Boolean) : []
}

function formatDate(value: string) {
  if (!value) return 'Not saved yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not saved yet'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

onMounted(async () => {
  try {
    await auth.init()
  } catch (e) {
    console.warn('[EducationDashboard] auth.init() failed:', e)
  }
  try {
    await loadPageContent()
  } catch (e) {
    console.error('[EducationDashboard] loadPageContent() crashed:', e)
    loadFromLocalStorage()
    storageMode.value = 'local'
    savedSnapshot.value = snapshotData()
    loading.value = false
  }
})
</script>

<template>
  <div :class="['education-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="hero-glow" aria-hidden="true"></div>
          <div class="hero-accent-line" aria-hidden="true"></div>
          <div class="hero-content-wrap">
            <div class="hero-icon-wrap">
              <BookOpen :size="22" aria-hidden="true" />
            </div>
            <div class="manager-title">
              <p class="eyebrow">Education Program</p>
              <h1>Manage Education page</h1>
              <div class="manager-meta" aria-label="Editable education summary">
                <span>{{ storageMode === 'supabase' ? 'Database' : 'Local only' }}</span>
                <span>{{ statsBand.length }} stats</span>
                <span>{{ teamCards.length }} team cards</span>
                <span v-if="isDirty" class="meta-dirty">Unsaved changes</span>
                <span v-else-if="page.updatedAt">Saved {{ formatDate(page.updatedAt) }}</span>
              </div>
            </div>
          </div>
          <div class="hero-actions">
            <RouterLink class="btn btn-secondary" to="/programs/education">
              <ExternalLink :size="16" aria-hidden="true" />
              <span>View page</span>
            </RouterLink>
            <button type="button" class="btn btn-primary" :disabled="saving || loading || !isDirty" @click="savePageContent">
              <Save :size="16" aria-hidden="true" />
              <span>{{ saving ? 'Saving...' : 'Save changes' }}</span>
            </button>
          </div>
        </header>

        <div v-if="loading" class="state-card">Loading Education content...</div>

        <div v-else class="content-grid">
          <!-- ═══ Quick links ═══ -->
          <section class="editor-panel quick-links-panel" aria-labelledby="quick-links-heading">
            <button class="panel-header panel-header-clickable" aria-expanded="true" @click="togglePanel('quick-links')">
              <div>
                <p class="panel-kicker">Shortcuts</p>
                <h2 id="quick-links-heading">Related tools</h2>
              </div>
              <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['quick-links'] }" aria-hidden="true" />
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
                    <span>Manage education data entries</span>
                  </div>
                </RouterLink>
              </div>
            </Transition>
          </section>

          <!-- ═══ Page images ═══ -->
          <section class="editor-panel" aria-labelledby="images-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['page-images']" @click="togglePanel('page-images')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <ImageIcon :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Public page</p>
                  <h2 id="images-heading">Page images</h2>
                </div>
              </div>
              <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['page-images'] }" aria-hidden="true" />
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['page-images']" class="panel-body">
                <p class="panel-desc">Upload a photo from your computer or paste a URL for each section below. Clear a slot to fall back to the default image.</p>
                <p v-if="missingImageWarning()" class="field-hint field-hint-warning">{{ missingImageWarning() }}</p>

                <div class="image-slot-grid">
                  <article v-for="(slot, index) in imageSlots" :key="slot.index" class="image-slot" :class="{ filled: !!slot.url }">
                    <header class="image-slot-header">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <div class="image-slot-heading">
                        <h3>{{ slot.badge }}</h3>
                        <p>{{ slot.hint }}</p>
                      </div>
                      <button v-if="slot.url" type="button" class="icon-btn danger" aria-label="Remove image" @click="clearGalleryImage(slot.index)">
                        <Trash2 :size="15" aria-hidden="true" />
                      </button>
                    </header>
                    <div class="image-slot-body">
                      <figure class="image-preview slot-preview">
                        <img v-if="slot.url" :src="slot.url" :alt="slot.label" />
                        <div v-else class="slot-empty">
                          <ImageIcon :size="22" aria-hidden="true" />
                          <span>No image set</span>
                        </div>
                      </figure>
                      <ImagePickerField
                        v-model="page.galleryImages[slot.index]!.url"
                        label="Upload or paste URL"
                        hide-preview
                        @success="onGalleryImageSaved"
                        @error="(msg) => ui.addToast(msg, 'error')"
                      />
                    </div>
                  </article>
                </div>
              </div>
            </Transition>
          </section>

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
                <p class="panel-desc">Edit the statistics shown on the public Education page.</p>

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
                        <input v-model="stat.number" type="text" placeholder="e.g. 120+" />
                      </label>
                      <label class="field">
                        <span>Label</span>
                        <input v-model="stat.label" type="text" placeholder="e.g. PRE-SCHOOL CHILDREN" />
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

          <!-- ═══ Content sections ═══ -->
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
              <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['content'] }" aria-hidden="true" />
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['content']" class="panel-body">
                <p class="panel-desc">Edit the main content blocks shown on the public Education page.</p>

                <div class="stack-list">
                  <article v-for="section in contentSections" :key="section.id" class="sub-editor">
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
                        <textarea v-model="section.items" rows="5" placeholder="Community pre-schools&#10;Mobile libraries&#10;Scholarships for poor children"></textarea>
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

          <!-- ═══ Team cards ═══ -->
          <section class="editor-panel" aria-labelledby="team-heading">
            <div class="panel-header">
              <div class="panel-header-left panel-header-left-clickable" @click="togglePanel('team')">
                <div class="panel-icon-wrap">
                  <FolderOpen :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Organizational structure</p>
                  <h2 id="team-heading">Team cards</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <button type="button" class="btn btn-secondary btn-sm" @click="teamCards.push({ role: '', icon: 'chart', desc: '' })">
                  <Plus :size="15" aria-hidden="true" />
                  <span>Add card</span>
                </button>
                <button type="button" class="icon-btn icon-btn-ghost" aria-label="Toggle panel" @click="togglePanel('team')">
                  <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['team'] }" />
                </button>
              </div>
            </div>
            <Transition name="collapse">
              <div v-show="expandedPanels['team']" class="panel-body">
                <p class="panel-desc">Edit the team shown in the "Who delivers education on the ground" section.</p>

                <div class="stack-list">
                  <article v-for="(card, index) in teamCards" :key="index" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h3>{{ card.role || 'Untitled role' }}</h3>
                      <button type="button" class="icon-btn danger" aria-label="Remove card" @click="confirmDeleteTeamCard(index)">
                        <Trash2 :size="15" aria-hidden="true" />
                      </button>
                    </header>
                    <div class="sub-editor-body form-grid">
                      <label class="field">
                        <span>Role / title</span>
                        <input v-model="card.role" type="text" placeholder="e.g. Program Director" />
                      </label>
                      <label class="field">
                        <span>Icon</span>
                        <select v-model="card.icon">
                          <option value="compass">Compass</option>
                          <option value="map">Map / Location</option>
                          <option value="heart">Heart</option>
                          <option value="chart">Chart / Analytics</option>
                        </select>
                      </label>
                      <label class="field wide">
                        <span>Description</span>
                        <textarea v-model="card.desc" rows="2" placeholder="Describe this team member's role..."></textarea>
                      </label>
                    </div>
                  </article>
                </div>
              </div>
            </Transition>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.education-admin {
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

.field-hint-warning {
  color: var(--admin-theme-danger);
  margin: -0.35rem 0 0.85rem;
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

/* ─── Layout grids ──────────────────────────────── */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.wide {
  grid-column: 1 / -1;
}

/* ─── Stacked cards (stats, sections, team) ─────── */
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

/* ─── Image slots ───────────────────────────────── */
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

.image-preview {
  margin: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 26%, var(--admin-theme-border));
  border-radius: 7px;
  background: var(--admin-theme-surface-soft);
}

.slot-preview {
  aspect-ratio: 4 / 3;
}

.slot-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
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

/* ─── Dark mode ─────────────────────────────────── */
:global(.admin-dark) .education-admin {
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
  .education-admin.sidebar-open {
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

  .form-grid {
    grid-template-columns: 1fr;
  }

  .hero-content-wrap {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
