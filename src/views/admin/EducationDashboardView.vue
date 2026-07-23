<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ImagePickerField from '@/components/admin/ImagePickerField.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'

const ui = useUiStore()
const auth = useAuthStore()

/* ─── Tabs ─────────────────────────────────────── */
type TabId = 'stats' | 'sections' | 'team' | 'image'
const activeTab = ref<TabId>('stats')

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'image', label: 'Page Images', icon: 'image' },
  { id: 'stats', label: 'Stats Band', icon: 'file' },
  { id: 'sections', label: 'What They Do', icon: 'layout' },
  { id: 'team', label: 'Team Cards', icon: 'users' },
]

/* ─── Toast ─────────────────────────────────────── */
interface Toast { message: string; type: 'success' | 'error' | 'info'; id: number }
const toasts = ref<Toast[]>([])
let toastId = 0

function addToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const id = ++toastId
  toasts.value.push({ message, type, id })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3000)
}

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

/* ─── Image Map for backward compatibility ─────── */
const IMAGE_MAP: { field: string; label: string }[] = [
  { field: 'introImageUrl', label: 'Intro Section Image' },
  { field: 'readingImageUrl', label: 'What We Do — Reading Image' },
  { field: 'teacherImageUrl', label: 'What We Do — Teacher Image' },
  { field: 'studyImageUrl', label: 'Why It Matters — Study Image' },
]

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
    { id: genId(), label: 'Intro Section Image', url: '' },
    { id: genId(), label: 'What We Do — Reading Image', url: '' },
    { id: genId(), label: 'What We Do — Teacher Image', url: '' },
    { id: genId(), label: 'Why It Matters — Study Image', url: '' },
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
        page.value.galleryImages = galleryFromMeta.map(g => ({
          id: g.id || genId(),
          label: g.label || '',
          url: g.url || '',
        }))
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
      addToast(`DB write blocked: ${error.message}`, 'error')
      saveToLocalStorage()
      storageMode.value = 'local'
      savedSnapshot.value = snapshotData()
      saving.value = false
      return
    }

    rawMetadata.value = payload.metadata
    storageMode.value = 'supabase'
    savedSnapshot.value = snapshotData()
    addToast('Education page saved!', 'success')
  } catch (e: unknown) {
    console.error('Save crashed:', e)
    addToast('Saved to browser (database error)', 'info')
    storageMode.value = 'local'
    savedSnapshot.value = snapshotData()
  } finally {
    saving.value = false
  }
}

/* ─── Gallery Image Management ────────────────── */
function addGalleryImage() {
  page.value.galleryImages.push({ id: genId(), label: '', url: '' })
}

function removeGalleryImage(index: number) {
  page.value.galleryImages.splice(index, 1)
}

function onGalleryImageSaved(msg: string) {
  addToast(msg, 'success')
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
  <div :class="['edu-dash', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="dash-layout">
      <AdminSidebar />
      <main class="dash-main">
        <!-- Toasts -->
        <div class="toast-container">
          <TransitionGroup name="toast">
            <div v-for="t in toasts" :key="t.id" :class="['toast', `toast-${t.type}`]">
              <svg v-if="t.type === 'success'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else-if="t.type === 'error'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12.01" y2="16"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>{{ t.message }}</span>
            </div>
          </TransitionGroup>
        </div>

        <!-- BANNER -->
        <header class="dash-banner">
          <div class="banner-glow" aria-hidden="true"></div>
          <div class="banner-inner">
            <div class="banner-content">
              <div class="banner-text">
                <div class="banner-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2 2 6 2s6-.9 6-2v-5"/></svg>
                  Education Program
                  <span v-if="storageMode === 'local'" class="banner-badge local-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Local only
                  </span>
                  <span v-else class="banner-badge cloud-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
                    Database
                  </span>
                </div>
                <h1 class="banner-title">Education Dashboard</h1>
                <p class="banner-desc">Edit stats, team cards, images, and content sections — then save to publish.</p>
              </div>
              <div class="banner-actions">
                <button class="btn btn-primary" :disabled="saving || loading" @click="savePageContent">
                  <svg v-if="saving" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  {{ saving ? 'Saving...' : 'Save All Changes' }}
                </button>
                <RouterLink class="btn btn-ghost" to="/programs/education">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  View Page
                </RouterLink>
              </div>
            </div>

            <!-- Status bar -->
            <div class="banner-stats">
              <div class="bstat bstat-blue">
                <div class="bstat-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2 2 6 2s6-.9 6-2v-5"/></svg>
                </div>
                <div class="bstat-info">
                  <strong>{{ statsBand[0]?.number || '0' }}</strong>
                  <small>Pre-school children</small>
                  <span class="bstat-desc">Enrolled in program areas</span>
                </div>
              </div>
              <div class="bstat bstat-emerald">
                <div class="bstat-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </div>
                <div class="bstat-info">
                  <strong>{{ statsBand[1]?.number || '0' }}</strong>
                  <small>Mobile libraries</small>
                  <span class="bstat-desc">Reaching remote villages</span>
                </div>
              </div>
              <div class="bstat bstat-amber">
                <div class="bstat-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div class="bstat-info">
                  <strong>{{ statsBand[2]?.number || '0' }}</strong>
                  <small>Annual scholarships</small>
                  <span class="bstat-desc">For poorest students</span>
                </div>
              </div>
              <div class="bstat bstat-violet">
                <div class="bstat-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div class="bstat-info">
                  <strong>{{ isDirty ? 'Unsaved' : 'Saved' }}</strong>
                  <small>Status</small>
                  <span class="bstat-desc">{{ formatDate(page.updatedAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- TABS -->
        <nav class="tab-nav" aria-label="Education management tabs">
          <button v-for="tab in tabs" :key="tab.id" :class="['tab-btn', { active: activeTab === tab.id }]" @click="activeTab = tab.id">
            <svg v-if="tab.icon === 'image'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <svg v-else-if="tab.icon === 'file'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <svg v-else-if="tab.icon === 'layout'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {{ tab.label }}
          </button>
          <span class="tab-spacer"></span>
          <span v-if="isDirty" class="tab-dirty">Unsaved changes</span>
        </nav>

        <!-- ═══ TAB: IMAGES ═══ -->
        <section v-if="activeTab === 'image'" class="tab-content">
          <div class="section-card">
            <div class="sc-header">
              <h2>Education Page Images</h2>
              <p>Upload images from your computer (stored in Google Drive), paste a Google Drive URL, or add / delete images as needed. The first 4 images map to specific page sections.</p>
            </div>
            <div class="sc-body">
              <div v-if="page.galleryImages.length === 0 && !loading" class="empty-state">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <p>No images yet. Click <strong>Add Image</strong> to get started.</p>
              </div>
              <div v-for="(img, index) in page.galleryImages" :key="img.id" class="gallery-item">
                <div class="gallery-item-hdr">
                  <div class="gallery-item-label">
                    <span class="gallery-index">{{ index + 1 }}</span>
                    <input
                      v-model="img.label"
                      class="gallery-label-input"
                      placeholder="Image label / section name"
                    />
                  </div>
                  <button class="btn-icon btn-delete" title="Delete this image" @click="removeGalleryImage(index)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
                <ImagePickerField
                  v-model="img.url"
                  :label="img.label || `Image ${index + 1}`"
                  :hint="`Section: ${img.label || 'untitled'}`"
                  @success="onGalleryImageSaved"
                  @error="(msg) => addToast(msg, 'error')"
                />
              </div>
              <button class="btn btn-ghost add-btn" @click="addGalleryImage">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Image
              </button>
            </div>
          </div>
        </section>

        <!-- ═══ TAB: STATS BAND ═══ -->
        <section v-if="activeTab === 'stats'" class="tab-content">
          <div v-if="loading" class="loading-text">Loading stats...</div>
          <template v-else>
          <div class="section-card">
            <div class="sc-header">
              <h2>Stats Band</h2>
              <p>Edit the 3 statistics shown on the public Education page. Each stat has a number, label, and description.</p>
            </div>
            <div class="sc-body">
              <div v-for="(stat, index) in statsBand" :key="index" class="stat-editor">
                <div class="stat-editor-hdr">
                  <span class="stat-editor-num">Stat {{ index + 1 }}</span>
                  <button class="btn-icon" @click="statsBand.splice(index, 1)" title="Remove stat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div class="form-row">
                  <label class="field">
                    <span class="field-label">Number</span>
                    <input v-model="stat.number" placeholder="e.g. 120+" />
                  </label>
                  <label class="field">
                    <span class="field-label">Label</span>
                    <input v-model="stat.label" placeholder="e.g. PRE-SCHOOL CHILDREN" />
                  </label>
                </div>
                <label class="field field-block">
                  <span class="field-label">Description</span>
                  <input v-model="stat.description" placeholder="Brief description of this statistic" />
                </label>
              </div>
              <button class="btn btn-ghost add-stat-btn" @click="statsBand.push({ number: '', label: '', description: '' })">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Stat
              </button>
            </div>
          </div>
          </template>
        </section>

        <!-- ═══ TAB: WHAT THEY DO ═══ -->
        <section v-if="activeTab === 'sections'" class="tab-content">
          <div class="section-card">
            <div class="sc-header">
              <h2>What They Do — Content Sections</h2>
              <p>Edit the main content blocks: <strong>What We Do</strong> (with bullet items), <strong>Our Approach</strong>, and <strong>Why It Matters</strong>.</p>
            </div>
            <div class="sc-body">
              <div v-if="loading" class="loading-text">Loading sections...</div>
              <div v-else class="sections-list">
                <div v-for="(section, index) in page.sections.filter(s => s.id !== 'education-team')" :key="section.id" class="section-edit-card">
                  <details :open="index === 0">
                    <summary class="sec-summary">
                      <div class="sec-summary-left">
                        <span class="sec-badge">{{ section.label }}</span>
                        <span class="sec-heading-preview">{{ section.heading || 'No heading' }}</span>
                      </div>
                      <svg class="sec-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    </summary>
                    <div class="sec-body">
                      <label class="field field-block">
                        <span class="field-label">Heading</span>
                        <input v-model="section.heading" :placeholder="'Heading for ' + section.label" />
                      </label>
                      <label class="field field-block">
                        <span class="field-label">Body / Description</span>
                        <textarea v-model="section.body" rows="3" :placeholder="'Description for ' + section.label"></textarea>
                      </label>
                      <label class="field field-block">
                        <span class="field-label">Bullet items <span class="field-hint">(one per line)</span></span>
                        <textarea v-model="section.items" rows="5" placeholder="Community pre-schools&#10;Mobile libraries&#10;Scholarships for poor children"></textarea>
                      </label>
                      <div v-if="section.items" class="item-preview">
                        <span class="field-label">Preview ({{ parsedItemsForSection(section).length }} items)</span>
                        <div class="item-chips">
                          <span v-for="item in parsedItemsForSection(section)" :key="item" class="item-chip">{{ item }}</span>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ TAB: TEAM CARDS ═══ -->
        <section v-if="activeTab === 'team'" class="tab-content">
          <div class="section-card">
            <div class="sc-header">
              <h2>Team Cards — Organizational Structure</h2>
              <p>Edit the team/organizational structure cards shown on the public Education page. Each card has a role, description, and icon.</p>
            </div>
            <div class="sc-body">
              <div v-if="loading" class="loading-text">Loading team cards...</div>
              <template v-else>
                <div v-for="(card, index) in teamCards" :key="index" class="sub-editor-card">
                  <div class="sub-editor-hdr">
                    <span class="sub-num">Card {{ index + 1 }}</span>
                    <button class="btn-icon" @click="teamCards.splice(index, 1)" title="Remove card">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <div class="form-row">
                    <label class="field">
                      <span class="field-label">Role / Title</span>
                      <input v-model="card.role" placeholder="e.g. Program Director" />
                    </label>
                    <label class="field">
                      <span class="field-label">Icon</span>
                      <select v-model="card.icon">
                        <option value="compass">Compass</option>
                        <option value="map">Map / Location</option>
                        <option value="heart">Heart</option>
                        <option value="chart">Chart / Analytics</option>
                      </select>
                    </label>
                  </div>
                  <label class="field field-block">
                    <span class="field-label">Description</span>
                    <textarea v-model="card.desc" rows="2" placeholder="Describe this team member's role..."></textarea>
                  </label>
                </div>
                <button class="btn btn-ghost add-stat-btn" @click="teamCards.push({ role: '', icon: 'chart', desc: '' })">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Card
                </button>
              </template>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.edu-dash {
  --bg: var(--admin-theme-bg);
  --surface: var(--admin-theme-surface);
  --border: var(--admin-theme-border);
  --border-s: var(--admin-theme-border-strong);
  --text: var(--admin-theme-text);
  --contrast: var(--admin-theme-contrast);
  --muted: var(--admin-theme-muted);
  --blue: var(--admin-theme-teal);
  --blue-glow: color-mix(in srgb, var(--admin-theme-teal) 25%, transparent);
  --blue-soft: color-mix(in srgb, var(--admin-theme-teal) 12%, transparent);
  --emerald: var(--admin-theme-primary);
  --emerald-glow: color-mix(in srgb, var(--admin-theme-primary) 25%, transparent);
  --emerald-soft: color-mix(in srgb, var(--admin-theme-primary) 12%, transparent);
  --amber: var(--admin-theme-gold);
  --amber-glow: color-mix(in srgb, var(--admin-theme-gold) 25%, transparent);
  --amber-soft: color-mix(in srgb, var(--admin-theme-gold) 12%, transparent);
  --violet: #7c3aed;
  --violet-glow: rgba(124,58,237,0.25);
  --violet-soft: color-mix(in srgb, #7c3aed 12%, transparent);
  --red: var(--admin-theme-danger);
  --red-soft: color-mix(in srgb, var(--admin-theme-danger) 12%, transparent);
  --shadow-xs: var(--admin-theme-shadow);
  --shadow-sm: var(--admin-theme-shadow);
  --shadow-md: var(--admin-theme-shadow);
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px;
  min-height: 100vh; background: var(--bg); color: var(--text);
  font-family: inherit;
  transition: padding-left 0.3s cubic-bezier(0.16,1,0.3,1);
}
.dash-layout { display: flex; }
.dash-main { flex: 1; width: 100%; padding: 1.25rem 1.5rem 2rem; position: relative; }

/* TOASTS */
.toast-container { position: fixed; top: 72px; right: 1.5rem; z-index: 200; display: grid; gap: 0.4rem; }
.toast { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 700; box-shadow: var(--shadow-md); background: var(--surface); border: 1px solid var(--border); }
.toast-success { border-color: var(--emerald); color: var(--emerald); }
.toast-error { border-color: var(--red); color: var(--red); }
.toast-info { border-color: var(--blue); color: var(--blue); }
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateX(30px); }
.toast-leave-to { opacity: 0; transform: translateX(30px); }

.btn {
  display: inline-flex; align-items: center; gap: 0.45rem; min-height: 36px; padding: 0.4rem 1rem;
  border-radius: var(--radius-sm); font-weight: 700; font-size: 0.82rem;
  cursor: pointer; text-decoration: none; transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
  border: 1px solid transparent; font-family: inherit;
}
.btn:hover { transform: translateY(-1px); }
.btn-primary { background: linear-gradient(135deg, #2563eb, #3b82f6); color: #fff; box-shadow: 0 4px 14px rgba(37,99,235,0.3); }
.btn-primary:hover { box-shadow: 0 6px 24px rgba(37,99,235,0.4); }
.btn-ghost { background: rgba(255,255,255,0.7); color: var(--contrast); border-color: var(--border); backdrop-filter: blur(8px); }
.btn-ghost:hover { background: var(--surface); border-color: var(--border-s); box-shadow: var(--shadow-sm); }
:global(.admin-dark) .btn-ghost { background: rgba(16,24,38,0.7); border-color: var(--border); }
.btn:disabled { opacity: 0.5; cursor: wait; }
.btn-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--radius-sm); border: 1px solid transparent; background: transparent; color: var(--muted); cursor: pointer; transition: all 0.15s ease; }
.btn-icon:hover { background: var(--red-soft); color: var(--red); border-color: var(--red-soft); }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }

/* BANNER */
.dash-banner { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); overflow: hidden; }
.banner-glow { position: absolute; inset: 0; background: radial-gradient(ellipse 400px 200px at 10% 30%, rgba(37,99,235,0.08) 0%, transparent 70%), radial-gradient(ellipse 300px 200px at 90% 80%, rgba(5,150,105,0.05) 0%, transparent 70%); pointer-events: none; }
.banner-inner { position: relative; z-index: 1; }
.banner-content { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding: 1.25rem 1.25rem 0.75rem; }
.banner-text { display: grid; gap: 0.3rem; }
.banner-badge { display: inline-flex; align-items: center; gap: 0.35rem; width: fit-content; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--blue); background: var(--blue-soft); padding: 0.2rem 0.7rem; border-radius: 999px; }
.banner-title { margin: 0; color: var(--contrast); font-size: clamp(1.35rem,2.8vw,1.85rem); font-weight: 700; letter-spacing: -0.025em; line-height: 1.1; }
.banner-desc { margin: 0; color: var(--muted); font-size: 0.86rem; line-height: 1.5; max-width: 460px; }
.banner-actions { display: flex; gap: 0.45rem; flex-shrink: 0; flex-wrap: wrap; }
.banner-stats { display: grid; grid-template-columns: repeat(4,1fr); border-top: 1px solid var(--border); }
.bstat { display: flex; align-items: center; gap: 0.7rem; padding: 0.75rem 1rem; border-right: 1px solid var(--border); transition: all 0.2s ease; }
.bstat:last-child { border-right: none; }
.bstat:hover { background: var(--surface); }
.bstat-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: var(--radius-sm); flex-shrink: 0; transition: transform 0.2s ease; }
.bstat:hover .bstat-icon { transform: scale(1.08); }
.bstat-blue .bstat-icon { background: var(--blue-soft); color: var(--blue); }
.bstat-blue:hover .bstat-icon { box-shadow: 0 0 0 4px var(--blue-glow); }
.bstat-emerald .bstat-icon { background: var(--emerald-soft); color: var(--emerald); }
.bstat-emerald:hover .bstat-icon { box-shadow: 0 0 0 4px var(--emerald-glow); }
.bstat-amber .bstat-icon { background: var(--amber-soft); color: var(--amber); }
.bstat-amber:hover .bstat-icon { box-shadow: 0 0 0 4px var(--amber-glow); }
.bstat-violet .bstat-icon { background: var(--violet-soft); color: var(--violet); }
.bstat-violet:hover .bstat-icon { box-shadow: 0 0 0 4px var(--violet-glow); }
.bstat-info strong { display: block; color: var(--contrast); font-size: 1.05rem; font-weight: 700; line-height: 1.2; }
.bstat-info small { display: block; color: var(--muted); font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
.bstat-desc { display: block; color: var(--muted); font-size: 0.68rem; font-weight: 500; margin-top: 1px; }

/* TAB NAV */
.tab-nav { display: flex; align-items: center; gap: 0.35rem; margin-top: 1.25rem; padding: 0 0.25rem; overflow-x: auto; }
.tab-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--muted); font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; font-family: inherit; }
.tab-btn:hover { border-color: var(--border-s); color: var(--contrast); }
.tab-btn.active { background: var(--blue-soft); border-color: var(--blue); color: var(--blue); }
:global(.admin-dark) .tab-btn.active { background: rgba(59,130,246,0.1); }
.tab-spacer { flex: 1; }
.tab-dirty { font-size: 0.72rem; font-weight: 700; color: var(--amber); padding: 0.25rem 0.6rem; border-radius: 999px; background: var(--amber-soft); white-space: nowrap; }
.tab-content { margin-top: 1.25rem;}

/* SECTION CARD */
.section-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); overflow: hidden; }
.sc-header { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.sc-header h2 { margin: 0; font-size: 1rem; font-weight: 700; color: var(--contrast); }
.sc-header p { margin: 0.2rem 0 0; color: var(--muted); font-size: 0.82rem; }
.sc-body { padding: 1.25rem; }
.field { display: grid; gap: 0.25rem; }
.field-block { grid-column: 1 / -1; }
.field-label { font-size: 0.75rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
.field-hint { font-size: 0.7rem; font-weight: 500; color: var(--muted); font-style: italic; text-transform: none; letter-spacing: normal; }
.field input, .field textarea, .field select { padding: 0.55rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--contrast); font-size: 0.88rem; font-family: inherit; transition: border-color 0.15s ease; width: 100%; }
.field input:focus, .field textarea:focus { outline: none; border-color: var(--blue); box-shadow: 0 0 0 2px var(--blue-glow); }
:global(.admin-dark) .field input, :global(.admin-dark) .field textarea { background: var(--bg); }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem; }
.add-stat-btn { margin-top: 0.75rem; }

/* STAT EDITOR */
.stat-editor { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem; }
.stat-editor-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.stat-editor-num { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--blue); }

/* SUB EDITOR (team cards) */
.sub-editor-card { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem; }
.sub-editor-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.sub-num { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--emerald); }

/* SECTIONS LIST */
.sections-list { display: grid; gap: 0.75rem; }
.section-edit-card { border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); overflow: hidden; transition: border-color 0.15s ease; }
.section-edit-card:hover { border-color: var(--border-s); }
.sec-summary { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; cursor: pointer; list-style: none; user-select: none; }
.sec-summary::-webkit-details-marker { display: none; }
.sec-summary-left { display: flex; align-items: center; gap: 0.7rem; }
.sec-badge { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--blue); background: var(--blue-soft); padding: 0.15rem 0.5rem; border-radius: 4px; }
.sec-heading-preview { font-size: 0.88rem; font-weight: 600; color: var(--contrast); }
.sec-chevron { color: var(--muted); transition: transform 0.2s ease; }
details[open] .sec-chevron { transform: rotate(180deg); }
.sec-body { padding: 0 1rem 1rem; display: grid; gap: 0.75rem; }

/* ITEM PREVIEW */
.item-preview { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.75rem; }
.item-chips { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.3rem; }
.item-chip { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; background: var(--blue-soft); color: var(--blue); font-size: 0.75rem; font-weight: 600; }

/* GALLERY IMAGE MANAGEMENT */
.gallery-item {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 0.85rem;
  transition: border-color 0.15s ease;
}
.gallery-item:hover { border-color: var(--border-s); }
.gallery-item-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.7rem;
}
.gallery-item-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}
.gallery-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--blue-soft);
  color: var(--blue);
  font-size: 0.72rem;
  font-weight: 800;
  flex-shrink: 0;
}
.gallery-label-input {
  flex: 1;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--contrast);
  font-size: 0.84rem;
  font-weight: 600;
  font-family: inherit;
  transition: border-color 0.15s ease;
}
.gallery-label-input:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 2px var(--blue-glow);
}
.btn-delete {
  flex-shrink: 0;
  margin-left: 0.5rem;
}
.add-btn {
  margin-top: 0.25rem;
}
.empty-state {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--muted);
  text-align: center;
}
.empty-state svg {
  color: var(--muted);
  opacity: 0.5;
}
.empty-state p {
  margin: 0;
  font-size: 0.88rem;
}

.loading-text { color: var(--muted); font-style: italic; padding: 1.5rem 0; text-align: center; }
.cloud-badge { background: var(--emerald-soft) !important; color: var(--emerald) !important; }
.local-badge { background: var(--amber-soft) !important; color: var(--amber) !important; }

@media (min-width: 900px) { .edu-dash.sidebar-open { padding-left: 260px; } }
@media (max-width: 900px) { .banner-stats { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 720px) { .dash-main { padding: 1rem; } .banner-content { flex-direction: column; } .banner-stats { grid-template-columns: 1fr; } .bstat { border-right: none; border-bottom: 1px solid var(--border); } .bstat:last-child { border-bottom: none; } }
@media (max-width: 600px) { .banner-actions { width: 100%; } .banner-actions .btn { flex: 1; justify-content: center; } }
</style>
