<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ImagePickerField from '@/components/admin/ImagePickerField.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'

const ui = useUiStore()

/* ─── Tabs ─────────────────────────────────────── */
type TabId = 'overview' | 'hero' | 'sections'
const activeTab = ref<TabId>('overview')

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'hero', label: 'Hero & Stats', icon: 'file' },
  { id: 'sections', label: 'Page Sections', icon: 'layout' },
]

/* ─── Quick Links ───────────────────────────────── */
interface QuickLink {
  title: string
  desc: string
  to: string
  tabId?: TabId
  color: string
}

const quickLinks: QuickLink[] = [
  { title: 'Edit Hero & Stats', desc: 'Headline, intro & stats band', to: '#', tabId: 'hero', color: 'violet' },
  { title: 'Edit Page Sections', desc: 'What we do, approach & why', to: '#', tabId: 'sections', color: 'blue' },
  { title: 'Media Library', desc: 'Upload images & documents', to: '/admin/media', color: 'emerald' },
  { title: 'Manage Records', desc: 'Create & organize data entries', to: '/admin/modules/programs', color: 'amber' },
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

/* ─── Default Child Protection Page ─────────────── */
function createDefaultCPPage(): PageDraft {
  return {
    slug: 'programs-child-protection',
    route: '/programs/child-protection',
    group: 'Programs',
    title: 'Child Protection',
    eyebrow: 'Child Protection',
    headline: 'Safeguarding children through local action.',
    intro: 'Cross-border migration, poverty and family separation put rural Cambodian children at risk of unsafe labour and trafficking. Santi Sena works with villages, schools and pagodas to build the safety net closest to the child — before anything goes wrong.',
    heroImageUrl: '',
    primaryAction: '',
    secondaryAction: '',
    sections: [
      {
        id: 'child-protection-work',
        label: 'What we do',
        heading: 'What we do',
        body: 'Anti-trafficking campaigns, village child protection networks, peer-educator groups and family reintegration — safeguarding children through local action.',
        items: 'Anti-trafficking campaigns at borders, markets and schools\nVillage Child Protection Networks trained in identification and referral\nChild rights advocacy with commune councils and provincial authorities\nPeer-educator youth groups on safe migration, health and rights\nFamily reintegration support for children returning from unsafe labour\nSafeguarding training for every teacher, monk and volunteer',
      },
      {
        id: 'child-protection-approach',
        label: 'Approach',
        heading: 'Our approach',
        body: 'Every network is anchored by the people children already trust — mothers, monks, teachers, commune council members. We train, coach and connect them to formal referral pathways so every case reaches the provincial social affairs office the same day it is identified.',
        items: '',
      },
      {
        id: 'child-protection-team',
        label: 'Organizational Structure',
        heading: 'Who delivers child protection on the ground',
        body: 'Our dedicated team works across provinces building community safeguarding systems that keep children safe.',
        items: 'Program Director | compass | Oversees child protection programs, advocacy, and partnerships across provinces.\nField Coordinators | map | Manage child protection networks, peer education and safe migration training.\nSafeguarding Trainers | heart | Deliver training for teachers, monks and volunteers on child rights and referral.\nMonitoring & Evaluation | chart | Track case outcomes, network coverage and community impact.',
      },
      {
        id: 'child-protection-why',
        label: 'Why it matters',
        heading: 'Why it matters',
        body: 'The border with Vietnam brings both opportunity and risk. Community-led safeguarding is the most durable defense.',
        items: 'The safest village is one where every adult knows every child\'s name\nEarly identification prevents trafficking before it happens\nLocal networks respond faster than any external agency\nChildren who feel safe stay in school and out of harm',
      },
    ],
    updatedAt: '',
  }
}

/* ─── Stats Band ────────────────────────────────── */
interface StatItem {
  number: string
  label: string
  description: string
}

const statsBand = ref<StatItem[]>([
  { number: '43', label: 'COMMUNES', description: 'With active Child Protection Networks.' },
  { number: '600+', label: 'PEER EDUCATORS', description: 'Youth trained in child rights and safeguarding.' },
  { number: '24/7', label: 'VILLAGE HOTLINES', description: 'Case referral into commune and provincial authorities.' },
])

/* ─── State ─────────────────────────────────────── */
const loading = ref(false)
const saving = ref(false)
const page = ref<PageDraft>(createDefaultCPPage())
const savedSnapshot = ref('')
const storageMode = ref<'supabase' | 'local'>('supabase')
const STORAGE_KEY = 'cp-dashboard-page'

function loadFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, unknown>
      const defaults = createDefaultCPPage()
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
      .eq('slug', 'programs-child-protection')
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
      const defaults = createDefaultCPPage()
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
      pillar: 'Child Protection',
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
      },
      updated_at: now,
    }

    saveToLocalStorage()

    const { error } = await supabase
      .from('programs')
      .upsert(payload, { onConflict: 'slug' })

    if (error) {
      console.warn('Supabase save failed:', error)
      addToast(`DB write blocked: ${error.message}`, 'error')
      saveToLocalStorage()
      storageMode.value = 'local'
      savedSnapshot.value = snapshotData()
      saving.value = false
      return
    }

    storageMode.value = 'supabase'
    savedSnapshot.value = snapshotData()
    addToast(`${p.title} page saved!`, 'success')
  } catch (e: unknown) {
    console.error('Save crashed:', e)
    addToast('Saved to browser (database error)', 'info')
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
  <div :class="['cp-dash', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="dash-layout">
      <AdminSidebar />
      <main class="dash-main">
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

        <header class="dash-banner">
          <div class="banner-glow" aria-hidden="true"></div>
          <div class="banner-particles" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          <div class="banner-inner">
            <div class="banner-breadcrumb">
              <RouterLink to="/admin" class="bcrumb-link">Dashboard</RouterLink>
              <svg class="bcrumb-sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              <span class="bcrumb-label">Programs</span>
              <svg class="bcrumb-sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              <span class="bcrumb-current">Child Protection</span>
            </div>
            <div class="banner-content">
              <div class="banner-text">
                <div class="banner-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Child Protection Program
                  <span v-if="storageMode === 'local'" class="banner-badge local-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Local only
                  </span>
                  <span v-else class="banner-badge cloud-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
                    Database
                  </span>
                </div>
                <h1 class="banner-title">Child Protection Dashboard</h1>
                <p class="banner-desc">Edit your child protection page content — hero, stats, and page sections — then save to publish.</p>
              </div>
              <div class="banner-actions">
                <button class="btn btn-primary" :disabled="saving || loading" @click="savePageContent">
                  <svg v-if="saving" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  {{ saving ? 'Saving...' : 'Save All Changes' }}
                </button>
                <RouterLink class="btn btn-ghost" to="/programs/child-protection">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  View Page
                </RouterLink>
              </div>
            </div>

            <div class="banner-stats">
              <div class="bstat bstat-violet">
                <div class="bstat-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div class="bstat-info">
                  <strong>{{ statsBand[0]?.number || '0' }}</strong>
                  <small>Communes</small>
                  <span class="bstat-desc">With active CP networks</span>
                </div>
              </div>
              <div class="bstat bstat-blue">
                <div class="bstat-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div class="bstat-info">
                  <strong>{{ statsBand[1]?.number || '0' }}</strong>
                  <small>Peer educators</small>
                  <span class="bstat-desc">Trained in child rights</span>
                </div>
              </div>
              <div class="bstat bstat-emerald">
                <div class="bstat-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div class="bstat-info">
                  <strong>{{ statsBand[2]?.number || '0' }}</strong>
                  <small>Village hotlines</small>
                  <span class="bstat-desc">Case referral systems</span>
                </div>
              </div>
              <div class="bstat bstat-amber">
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

        <nav class="tab-nav" aria-label="Child Protection management tabs">
          <button v-for="tab in tabs" :key="tab.id" :class="['tab-btn', { active: activeTab === tab.id }]" @click="activeTab = tab.id">
            <svg v-if="tab.icon === 'grid'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <svg v-else-if="tab.icon === 'file'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            {{ tab.label }}
          </button>
          <span class="tab-spacer"></span>
          <span v-if="isDirty" class="tab-dirty">Unsaved changes</span>
        </nav>

        <!-- OVERVIEW -->
        <section v-if="activeTab === 'overview'" class="tab-content">
          <div class="quick-links-grid">
            <RouterLink v-for="link in quickLinks" :key="link.title" :to="link.to || '/admin'" class="link-card" :class="'link-' + link.color"
              @click.prevent="link.tabId ? activeTab = link.tabId : undefined">
              <div class="link-icon">
                <svg v-if="link.color === 'violet'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <svg v-else-if="link.color === 'blue'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/></svg>
                <svg v-else-if="link.color === 'emerald'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <div class="link-text"><strong>{{ link.title }}</strong><small>{{ link.desc }}</small></div>
              <svg class="link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </RouterLink>
          </div>

          <div class="overview-cards">
            <div class="overview-card-item">
              <span class="oc-label">Hero & Header</span>
              <p class="oc-text"><strong>Headline:</strong> {{ page.headline.slice(0, 60) }}{{ page.headline.length > 60 ? '...' : '' }}</p>
              <p class="oc-text"><strong>Eyebrow:</strong> {{ page.eyebrow || 'Not set' }}</p>
              <button class="oc-action" @click="activeTab = 'hero'">Edit →</button>
            </div>
            <div class="overview-card-item">
              <span class="oc-label">Stats Band</span>
              <p class="oc-text">{{ statsBand.length }} stats configured: {{ statsBand.map(s => s.number).join(', ') }}</p>
              <button class="oc-action" @click="activeTab = 'hero'">Edit →</button>
            </div>
            <div class="overview-card-item">
              <span class="oc-label">Page Sections</span>
              <p class="oc-text">{{ page.sections.length }} content sections: {{ page.sections.map(s => s.label).join(', ') }}</p>
              <button class="oc-action" @click="activeTab = 'sections'">Edit →</button>
            </div>
            <div class="overview-card-item">
              <span class="oc-label">Last Saved</span>
              <p class="oc-text">{{ formatDate(page.updatedAt) }}</p>
              <button class="oc-action" :disabled="saving || loading" @click="savePageContent">Save now →</button>
            </div>
          </div>
        </section>

        <!-- HERO & STATS -->
        <section v-if="activeTab === 'hero'" class="tab-content">
          <div v-if="loading" class="loading-text">Loading content...</div>
          <template v-else>
          <div class="section-card">
            <div class="sc-header">
              <h2>Hero & Header Content</h2>
              <p>Edit the main header shown at the top of the public Child Protection page.</p>
            </div>
            <div class="sc-body">
              <div class="form-row">
                <label class="field">
                  <span class="field-label">Eyebrow / Badge</span>
                  <input v-model="page.eyebrow" placeholder="e.g. Child Protection" />
                  <span class="field-hint">Small label above the main headline</span>
                </label>
                <div class="field field-block">
                  <span class="field-label">Hero Image</span>
                  <ImagePickerField
                    v-model="page.heroImageUrl"
                    label="Hero Image"
                    hint="Background image for the hero section"
                    @success="(msg) => addToast(msg, 'success')"
                    @error="(msg) => addToast(msg, 'error')"
                  />
                </div>
              </div>
              <label class="field field-block">
                <span class="field-label">Headline (main title)</span>
                <input v-model="page.headline" placeholder="Safeguarding children through local action." />
              </label>
              <label class="field field-block">
                <span class="field-label">Intro / Description</span>
                <textarea v-model="page.intro" rows="3" placeholder="Cross-border migration, poverty and family separation put rural Cambodian children at risk of unsafe labour and trafficking."></textarea>
              </label>
            </div>
          </div>

          <div class="section-card" style="margin-top: 1.25rem;">
            <div class="sc-header">
              <h2>Stats Band</h2>
              <p>Configure the statistics that appear on the public Child Protection page.</p>
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
                    <input v-model="stat.number" placeholder="e.g. 43" />
                  </label>
                  <label class="field">
                    <span class="field-label">Label</span>
                    <input v-model="stat.label" placeholder="e.g. COMMUNES" />
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

        <!-- PAGE SECTIONS -->
        <section v-if="activeTab === 'sections'" class="tab-content">
          <div class="section-card">
            <div class="sc-header">
              <h2>Page Content Sections</h2>
              <p>Edit the main content blocks of the Child Protection page — What We Do, Our Approach, and Why It Matters.</p>
            </div>
            <div class="sc-body">
              <div v-if="loading" class="loading-text">Loading sections...</div>
              <div v-else class="sections-list">
                <div v-for="(section, index) in page.sections" :key="section.id" class="section-edit-card">
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
                        <textarea v-model="section.items" rows="5" placeholder="Anti-trafficking campaigns&#10;Child Protection Networks&#10;Child rights advocacy"></textarea>
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

          <div class="section-card" style="margin-top: 1.25rem;">
            <div class="sc-header">
              <h2>Related Actions</h2>
            </div>
            <div class="sc-body">
              <div class="side-actions">
                <RouterLink class="side-btn" to="/admin/media">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Media Library — Upload images for the Child Protection page
                </RouterLink>
                <RouterLink class="side-btn" to="/admin/modules/programs">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/></svg>
                  Program Records — Manage child protection data entries
                </RouterLink>
                <RouterLink class="side-btn" to="/programs/child-protection">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  View Live Page — See your changes on the public site
                </RouterLink>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.cp-dash {
  --bg: var(--admin-theme-bg);
  --surface: var(--admin-theme-surface);
  --border: var(--admin-theme-border);
  --border-s: var(--admin-theme-border-strong);
  --text: var(--admin-theme-text);
  --contrast: var(--admin-theme-contrast);
  --muted: var(--admin-theme-muted);
  --violet: #7c3aed;
  --violet-glow: rgba(124,58,237,0.25);
  --violet-soft: color-mix(in srgb, #7c3aed 12%, transparent);
  --blue: var(--admin-theme-teal);
  --blue-glow: color-mix(in srgb, var(--admin-theme-teal) 25%, transparent);
  --blue-soft: color-mix(in srgb, var(--admin-theme-teal) 12%, transparent);
  --emerald: var(--admin-theme-primary);
  --emerald-glow: color-mix(in srgb, var(--admin-theme-primary) 25%, transparent);
  --emerald-soft: color-mix(in srgb, var(--admin-theme-primary) 12%, transparent);
  --amber: var(--admin-theme-gold);
  --amber-glow: color-mix(in srgb, var(--admin-theme-gold) 25%, transparent);
  --amber-soft: color-mix(in srgb, var(--admin-theme-gold) 12%, transparent);
  --red: var(--admin-theme-danger);
  --red-soft: color-mix(in srgb, var(--admin-theme-danger) 12%, transparent);
  --shadow-xs: var(--admin-theme-shadow);
  --shadow-sm: var(--admin-theme-shadow);
  --shadow-md: var(--admin-theme-shadow);
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px;
  min-height: 100vh; background: var(--bg); color: var(--text);
  transition: padding-left 0.3s cubic-bezier(0.16,1,0.3,1);
}
:global(.admin-dark) .cp-dash {
  --bg: #06100F; --surface: #0a1a14; --border: #1d3b33; --border-s: #263252;
  --text: #c8d2e6; --contrast: #eaf0f8; --muted: #7a8aaa;
  --blue: #3b82f6; --blue-soft: #172244;
  --emerald: #10b981; --emerald-soft: #142a22;
  --amber: #f59e0b; --amber-soft: #241e14;
  --violet: #a78bfa; --violet-glow: rgba(167,139,250,0.2); --violet-soft: #1c1640;
  --slate: #8896b0; --slate-soft: #121a2e;
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.15);
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.2);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.25);
}
.dash-layout { display: flex; }
.dash-main { flex: 1; width: 100%; padding: 1.25rem 1.5rem 2rem; position: relative; }

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
.btn-primary { background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: #fff; box-shadow: 0 4px 14px rgba(124,58,237,0.3); }
.btn-primary:hover { box-shadow: 0 6px 24px rgba(124,58,237,0.4); }
.btn-ghost { background: rgba(255,255,255,0.7); color: var(--contrast); border-color: var(--border); backdrop-filter: blur(8px); }
.btn-ghost:hover { background: var(--surface); border-color: var(--border-s); box-shadow: var(--shadow-sm); }
:global(.admin-dark) .btn-ghost { background: rgba(16,24,38,0.7); border-color: var(--border); }
.btn:disabled { opacity: 0.5; cursor: wait; }
.btn-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: var(--radius-sm);
  border: 1px solid transparent; background: transparent;
  color: var(--muted); cursor: pointer; transition: all 0.15s ease;
}
.btn-icon:hover { background: var(--red-soft); color: var(--red); border-color: var(--red-soft); }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }

.dash-banner { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); overflow: hidden; }
.banner-glow { position: absolute; inset: 0; background: radial-gradient(ellipse 400px 200px at 10% 30%, rgba(124,58,237,0.08) 0%, transparent 70%), radial-gradient(ellipse 300px 200px at 90% 80%, rgba(37,99,235,0.05) 0%, transparent 70%); pointer-events: none; }
.banner-particles { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.banner-particles span { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: rgba(124,58,237,0.1); }
.banner-particles span:nth-child(1) { top: 15%; left: 10%; animation: float 8s ease-in-out infinite; }
.banner-particles span:nth-child(2) { top: 60%; right: 15%; width: 4px; height: 4px; animation: float 6s ease-in-out infinite reverse; }
.banner-particles span:nth-child(3) { bottom: 20%; left: 40%; width: 5px; height: 5px; animation: float 10s ease-in-out infinite 2s; }
.banner-particles span:nth-child(4) { top: 25%; right: 30%; animation: float 7s ease-in-out infinite 1s; }
@keyframes float { 0%,100% { transform: translateY(0) scale(1); opacity: 0.4; } 50% { transform: translateY(-12px) scale(1.2); opacity: 0.8; } }
.banner-inner { position: relative; z-index: 1; }
.banner-breadcrumb { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.25rem; background: rgba(255,255,255,0.5); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); font-size: 0.76rem; font-weight: 700; }
:global(.admin-dark) .banner-breadcrumb { background: rgba(16,24,38,0.5); }
.bcrumb-link { color: var(--blue); text-decoration: none; }
.bcrumb-link:hover { text-decoration: underline; }
.bcrumb-sep { color: var(--muted); width: 10px; }
.bcrumb-label { color: var(--muted); }
.bcrumb-current { color: var(--contrast); }
.banner-content { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding: 1.25rem 1.25rem 0.75rem; }
.banner-text { display: grid; gap: 0.3rem; }
.banner-badge { display: inline-flex; align-items: center; gap: 0.35rem; width: fit-content; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--violet); background: var(--violet-soft); padding: 0.2rem 0.7rem; border-radius: 999px; }
.banner-title { margin: 0; color: var(--contrast); font-size: clamp(1.35rem,2.8vw,1.85rem); font-weight: 700; letter-spacing: -0.025em; line-height: 1.1; }
.banner-desc { margin: 0; color: var(--muted); font-size: 0.86rem; line-height: 1.5; max-width: 460px; }
.banner-actions { display: flex; gap: 0.45rem; flex-shrink: 0; flex-wrap: wrap; }
.banner-stats { display: grid; grid-template-columns: repeat(4,1fr); border-top: 1px solid var(--border); }
.bstat { display: flex; align-items: center; gap: 0.7rem; padding: 0.75rem 1rem; border-right: 1px solid var(--border); transition: all 0.2s ease; }
.bstat:last-child { border-right: none; }
.bstat:hover { background: var(--surface); }
.bstat-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: var(--radius-sm); flex-shrink: 0; transition: transform 0.2s ease; }
.bstat:hover .bstat-icon { transform: scale(1.08); }
.bstat-violet .bstat-icon { background: var(--violet-soft); color: var(--violet); }
.bstat-violet:hover .bstat-icon { box-shadow: 0 0 0 4px var(--violet-glow); }
.bstat-blue .bstat-icon { background: var(--blue-soft); color: var(--blue); }
.bstat-blue:hover .bstat-icon { box-shadow: 0 0 0 4px var(--blue-glow); }
.bstat-emerald .bstat-icon { background: var(--emerald-soft); color: var(--emerald); }
.bstat-emerald:hover .bstat-icon { box-shadow: 0 0 0 4px var(--emerald-glow); }
.bstat-amber .bstat-icon { background: var(--amber-soft); color: var(--amber); }
.bstat-amber:hover .bstat-icon { box-shadow: 0 0 0 4px var(--amber-glow); }
.bstat-info strong { display: block; color: var(--contrast); font-size: 1.05rem; font-weight: 700; line-height: 1.2; }
.bstat-info small { display: block; color: var(--muted); font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
.bstat-desc { display: block; color: var(--muted); font-size: 0.68rem; font-weight: 500; margin-top: 1px; }

.tab-nav { display: flex; align-items: center; gap: 0.35rem; margin-top: 1.25rem; padding: 0 0.25rem; overflow-x: auto; }
.tab-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--muted); font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; font-family: inherit; }
.tab-btn:hover { border-color: var(--border-s); color: var(--contrast); }
.tab-btn.active { background: var(--violet-soft); border-color: var(--violet); color: var(--violet); }
:global(.admin-dark) .tab-btn.active { background: rgba(139,92,246,0.1); }
.tab-spacer { flex: 1; }
.tab-dirty { font-size: 0.72rem; font-weight: 700; color: var(--amber); padding: 0.25rem 0.6rem; border-radius: 999px; background: var(--amber-soft); white-space: nowrap; }
.tab-content { margin-top: 1.25rem; }
.quick-links-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 0.7rem; }
.link-card { display: flex; align-items: center; gap: 0.7rem; padding: 0.8rem 0.9rem; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--surface); text-decoration: none; cursor: pointer; transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
.link-card:hover { border-color: var(--border-s); box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.link-icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: var(--radius-sm); flex-shrink: 0; }
.link-violet .link-icon { background: var(--violet-soft); color: var(--violet); }
.link-blue .link-icon { background: var(--blue-soft); color: var(--blue); }
.link-emerald .link-icon { background: var(--emerald-soft); color: var(--emerald); }
.link-amber .link-icon { background: var(--amber-soft); color: var(--amber); }
.link-text { flex: 1; min-width: 0; }
.link-text strong { display: block; color: var(--contrast); font-size: 0.82rem; font-weight: 700; margin-bottom: 1px; }
.link-text small { display: block; color: var(--muted); font-size: 0.72rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.link-arrow { flex-shrink: 0; color: var(--muted); transition: transform 0.2s ease; }
.link-card:hover .link-arrow { transform: translateX(3px); color: var(--violet); }
.overview-cards { display: grid; grid-template-columns: repeat(2,1fr); gap: 0.85rem; margin-top: 1.25rem; }
.overview-card-item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem; transition: box-shadow 0.2s ease; }
.overview-card-item:hover { box-shadow: var(--shadow-sm); }
.oc-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--violet); }
.oc-text { color: var(--muted); font-size: 0.85rem; margin: 0.35rem 0; line-height: 1.4; }
.oc-action { background: none; border: none; color: var(--blue); font-size: 0.78rem; font-weight: 700; cursor: pointer; padding: 0; font-family: inherit; }
.oc-action:hover { text-decoration: underline; }
.section-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); overflow: hidden; }
.sc-header { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.sc-header h2 { margin: 0; font-size: 1rem; font-weight: 700; color: var(--contrast); }
.sc-header p { margin: 0.2rem 0 0; color: var(--muted); font-size: 0.82rem; }
.sc-body { padding: 1.25rem; }
.field { display: grid; gap: 0.25rem; }
.field-block { grid-column: 1 / -1; }
.field-label { font-size: 0.75rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
.field-hint { font-size: 0.7rem; font-weight: 500; color: var(--muted); font-style: italic; text-transform: none; letter-spacing: normal; }
.field input, .field textarea { padding: 0.55rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--contrast); font-size: 0.88rem; font-family: inherit; transition: border-color 0.15s ease; width: 100%; }
.field input:focus, .field textarea:focus { outline: none; border-color: var(--violet); box-shadow: 0 0 0 2px var(--violet-glow); }
:global(.admin-dark) .field input, :global(.admin-dark) .field textarea { background: var(--bg); }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem; }
.add-stat-btn { margin-top: 0.75rem; }
.stat-editor { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem; }
.stat-editor-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.stat-editor-num { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--violet); }
.sections-list { display: grid; gap: 0.75rem; }
.section-edit-card { border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); overflow: hidden; }
.section-edit-card:hover { border-color: var(--border-s); }
.sec-summary { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; cursor: pointer; list-style: none; user-select: none; }
.sec-summary::-webkit-details-marker { display: none; }
.sec-summary-left { display: flex; align-items: center; gap: 0.7rem; }
.sec-badge { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--violet); background: var(--violet-soft); padding: 0.15rem 0.5rem; border-radius: 4px; }
.sec-heading-preview { font-size: 0.88rem; font-weight: 600; color: var(--contrast); }
.sec-chevron { color: var(--muted); transition: transform 0.2s ease; }
details[open] .sec-chevron { transform: rotate(180deg); }
.sec-body { padding: 0 1rem 1rem; display: grid; gap: 0.75rem; }
.item-preview { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 0.75rem; }
.item-chips { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.3rem; }
.item-chip { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; background: var(--violet-soft); color: var(--violet); font-size: 0.75rem; font-weight: 600; }
.side-actions { display: grid; gap: 0.45rem; }
.side-btn { display: flex; align-items: center; gap: 0.45rem; padding: 0.55rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--surface); color: var(--text); font-size: 0.8rem; font-weight: 600; text-decoration: none; transition: all 0.15s ease; }
.side-btn:hover { border-color: var(--border-s); background: var(--bg); color: var(--contrast); box-shadow: var(--shadow-xs); }
.loading-text { color: var(--muted); font-style: italic; padding: 1.5rem 0; text-align: center; }
.cloud-badge { background: var(--emerald-soft) !important; color: var(--emerald) !important; }
.local-badge { background: var(--amber-soft) !important; color: var(--amber) !important; }

@media (min-width: 900px) { .cp-dash.sidebar-open { padding-left: 260px; } }
@media (max-width: 900px) { .banner-stats { grid-template-columns: repeat(2,1fr); } .quick-links-grid { grid-template-columns: 1fr; } .overview-cards { grid-template-columns: 1fr; } }
@media (max-width: 720px) { .dash-main { padding: 1rem; } .banner-content { flex-direction: column; } .banner-stats { grid-template-columns: 1fr; } .bstat { border-right: none; border-bottom: 1px solid var(--border); } .bstat:last-child { border-bottom: none; } }
@media (max-width: 600px) { .banner-actions { width: 100%; } .banner-actions .btn { flex: 1; justify-content: center; } }
</style>
