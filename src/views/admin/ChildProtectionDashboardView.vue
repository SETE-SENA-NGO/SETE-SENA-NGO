<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BookOpen,
  ExternalLink,
  FolderOpen,
  Layers,
  Lock,
  MessageSquareQuote,
  Plus,
  Save,
  Shield,
  Trash2,
  Type,
  Users,
} from 'lucide-vue-next'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminUploadButton from '@/components/admin/AdminUploadButton.vue'
import CollapsiblePanel from '@/components/admin/CollapsiblePanel.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'

const ui = useUiStore()
const auth = useAuthStore()

/* ─── Types ─────────────────────────────────────── */
interface WorkItem {
  title: string
  text: string
  imageUrl: string
}

interface TeamCard {
  role: string
  icon: string
  desc: string
}

interface StatItem {
  number: string
  label: string
  description: string
}

interface ImpactCard {
  text: string
  imageUrl: string
}

interface QuoteContent {
  text: string
}

interface PageDraft {
  slug: string
  title: string
  eyebrow: string
  headline: string
  intro: string
  updatedAt: string
}

/* ─── Default data ──────────────────────────────── */
const DEFAULT_WORK_ITEMS: WorkItem[] = [
  { title: 'Anti-Trafficking Campaigns', text: 'Anti-child-trafficking campaigns at borders, markets and schools across target provinces.', imageUrl: '' },
  { title: 'Child Protection Networks', text: 'Village Child Protection Networks trained in identification, referral and follow-up.', imageUrl: '' },
  { title: 'Child Rights Advocacy', text: 'Child rights advocacy with commune councils and provincial authorities.', imageUrl: '' },
  { title: 'Peer Educators', text: 'Peer-educator youth groups on safe migration, health and rights.', imageUrl: '' },
  { title: 'Family Reintegration', text: 'Family reintegration support for children returning from unsafe labour.', imageUrl: '' },
  { title: 'Safeguarding Training', text: 'Safeguarding training for every teacher, monk and volunteer we work with.', imageUrl: '' },
]

const DEFAULT_TEAM_CARDS: TeamCard[] = [
  { role: 'Program Director', icon: 'compass', desc: 'Oversees child protection programs, advocacy, and partnerships across provinces.' },
  { role: 'Field Coordinators', icon: 'map', desc: 'Manage child protection networks, peer education and safe migration training in target villages.' },
  { role: 'Safeguarding Trainers', icon: 'heart', desc: 'Deliver training for teachers, monks and volunteers on child rights and case referral.' },
  { role: 'Monitoring & Evaluation', icon: 'chart', desc: 'Track case outcomes, network coverage and community impact across provinces.' },
]

const DEFAULT_IMPACT_CARDS: ImpactCard[] = [
  { text: 'The safest village is one where every adult knows every child\'s name', imageUrl: '' },
  { text: 'Early identification prevents trafficking before it happens', imageUrl: '' },
  { text: 'Local networks respond faster than any external agency', imageUrl: '' },
  { text: 'Children who feel safe stay in school and out of harm', imageUrl: '' },
]

const workItems = ref<WorkItem[]>(DEFAULT_WORK_ITEMS.map(w => ({ ...w })))
const teamCards = ref<TeamCard[]>(DEFAULT_TEAM_CARDS.map(t => ({ ...t })))
const impactCards = ref<ImpactCard[]>(DEFAULT_IMPACT_CARDS.map(c => ({ ...c })))

const statsBand = ref<StatItem[]>([
  { number: '43', label: 'COMMUNES', description: 'With active Child Protection Networks.' },
  { number: '600+', label: 'PEER EDUCATORS', description: 'Youth trained in child rights and safeguarding.' },
  { number: '24/7', label: 'VILLAGE HOTLINES', description: 'Case referral into commune and provincial authorities.' },
])

const quoteContent = ref<QuoteContent>({
  text: 'A case identified in a village at dawn reaches the provincial social affairs office by dusk. That is the promise of community-led safeguarding.',
})

const page = ref<PageDraft>({
  slug: 'programs-child-protection',
  title: 'Child Protection',
  eyebrow: 'Child Protection',
  headline: 'Safeguarding children through local action.',
  intro: 'Cross-border migration, poverty and family separation put rural Cambodian children at risk of unsafe labour and trafficking. Santi Sena works with villages, schools and pagodas to build the safety net closest to the child — before anything goes wrong.',
  updatedAt: '',
})

/* ─── Collapsible panels ───────────────────────── */
const expandedPanels = ref<Record<string, boolean>>({
  'quick-links': true,
  'page-header': false,
  'stats': true,
  'our-work': true,
  'quote': true,
  'org-structure': true,
  'impact-cards': true,
})

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

function clearWorkImage(index: number) {
  const item = workItems.value[index]
  if (!item?.imageUrl?.trim()) return
  const title = item?.title?.trim() || `Item ${index + 1}`
  ui.openModal(
    'Remove image',
    `Remove the image from <strong>${title}</strong>?`,
    () => {
      workItems.value[index]!.imageUrl = ''
      ui.addToast(`Image removed from "${title}".`, 'success')
      void savePageContent(true)
    },
  )
}

function clearImpactImage(index: number) {
  const card = impactCards.value[index]
  if (!card?.imageUrl?.trim()) return
  ui.openModal(
    'Remove image',
    `Remove the image from impact card <strong>${index + 1}</strong>?`,
    () => {
      impactCards.value[index]!.imageUrl = ''
      ui.addToast(`Image removed from impact card ${index + 1}.`, 'success')
      void savePageContent(true)
    },
  )
}

/* ─── State ─────────────────────────────────────── */
const loading = ref(false)
const saving = ref(false)
const savedSnapshot = ref('')
const storageMode = ref<'supabase' | 'local'>('supabase')
const editing = ref(false)

function toggleEditing() {
  editing.value = !editing.value
}
const STORAGE_KEY = 'cp-dashboard-page'

function loadFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, unknown>
      const defaults = { eyebrow: 'Child Protection', headline: 'Safeguarding children through local action.', intro: 'Cross-border migration, poverty and family separation put rural Cambodian children at risk of unsafe labour and trafficking. Santi Sena works with villages, schools and pagodas to build the safety net closest to the child — before anything goes wrong.' }
      page.value = {
        ...page.value,
        eyebrow: (saved.eyebrow as string) || defaults.eyebrow,
        headline: (saved.headline as string) || defaults.headline,
        intro: (saved.intro as string) || defaults.intro,
        updatedAt: (saved.updatedAt as string) || '',
      }
      if (saved.statsBand && Array.isArray(saved.statsBand) && saved.statsBand.length > 0) {
        statsBand.value = saved.statsBand as StatItem[]
      }
      if (saved.quoteContent && typeof saved.quoteContent === 'object') {
        quoteContent.value = { ...quoteContent.value, ...saved.quoteContent as Partial<QuoteContent> }
      }
      if (Array.isArray(saved.workItems) && saved.workItems.length > 0) {
        workItems.value = saved.workItems as WorkItem[]
      }
      if (Array.isArray(saved.teamCards) && saved.teamCards.length > 0) {
        teamCards.value = saved.teamCards as TeamCard[]
      }
      if (Array.isArray(saved.impactCards) && saved.impactCards.length > 0) {
        impactCards.value = saved.impactCards as ImpactCard[]
      }
    }
  } catch { /* ignore */ }
}

function saveToLocalStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      eyebrow: page.value.eyebrow,
      headline: page.value.headline,
      intro: page.value.intro,
      statsBand: statsBand.value,
      quoteContent: quoteContent.value,
      workItems: workItems.value,
      teamCards: teamCards.value,
      impactCards: impactCards.value,
      updatedAt: new Date().toISOString(),
    }))
  } catch { /* ignore */ }
}

function snapshotData(): string {
  return JSON.stringify({
    eyebrow: page.value.eyebrow,
    headline: page.value.headline,
    intro: page.value.intro,
    statsBand: statsBand.value.map(s => ({ ...s })),
    quoteContent: { ...quoteContent.value },
    workItems: workItems.value.map(w => ({ ...w })),
    teamCards: teamCards.value.map(t => ({ ...t })),
    impactCards: impactCards.value.map(c => ({ ...c })),
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
      const meta = data.metadata as Record<string, unknown> | null

      page.value = {
        ...page.value,
        title: data.title || page.value.title,
        eyebrow: (meta?.eyebrow as string) || page.value.eyebrow,
        headline: (meta?.headline as string) || page.value.headline,
        intro: data.summary || (meta?.intro as string) || page.value.intro,
        updatedAt: data.updated_at || '',
      }

      if (meta?.statsBand && Array.isArray(meta.statsBand) && meta.statsBand.length > 0) {
        statsBand.value = meta.statsBand as StatItem[]
      }
      if (meta?.quoteContent && typeof meta.quoteContent === 'object') {
        quoteContent.value = { ...quoteContent.value, ...meta.quoteContent as Partial<QuoteContent> }
      }
      if (Array.isArray(meta?.workItems) && meta.workItems.length > 0) {
        workItems.value = meta.workItems as WorkItem[]
      }
      if (Array.isArray(meta?.teamCards) && meta.teamCards.length > 0) {
        teamCards.value = meta.teamCards as TeamCard[]
      }
      if (Array.isArray(meta?.impactCards) && meta.impactCards.length > 0) {
        impactCards.value = meta.impactCards as ImpactCard[]
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
async function savePageContent(isManual = false) {
  if (saving.value || loading.value) return
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
        statsBand: statsBand.value,
        quoteContent: quoteContent.value,
        workItems: workItems.value,
        teamCards: teamCards.value,
        impactCards: impactCards.value,
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
      if (isManual) savedSnapshot.value = snapshotData()
      saving.value = false
      return
    }

    storageMode.value = 'supabase'

    // Only reset dirty state and show toast on manual save (not auto-save)
    if (isManual) {
      savedSnapshot.value = snapshotData()
      if (supabaseSaveTimer) clearTimeout(supabaseSaveTimer)
      ui.addToast(`${p.title} page saved!`, 'success')
    }
    return
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

/* ─── Auto-save to localStorage & Supabase on data changes ─ */
let localSaveTimer: ReturnType<typeof setTimeout> | null = null
let supabaseSaveTimer: ReturnType<typeof setTimeout> | null = null

watch(
  [workItems, impactCards, statsBand, teamCards, quoteContent, page],
  () => {
    if (localSaveTimer) clearTimeout(localSaveTimer)
    localSaveTimer = setTimeout(() => {
      saveToLocalStorage()
    }, 600)

    if (supabaseSaveTimer) clearTimeout(supabaseSaveTimer)
    supabaseSaveTimer = setTimeout(() => {
      void savePageContent()
    }, 3000)
  },
  { deep: true },
)

onMounted(async () => {
  try {
    await auth.init()
  } catch (e) {
    console.warn('[CPDashboard] auth.init() failed:', e)
  }
  try {
    await loadPageContent()
  } catch (e) {
    console.error('[CPDashboard] loadPageContent() crashed:', e)
    loadFromLocalStorage()
    storageMode.value = 'local'
    savedSnapshot.value = snapshotData()
    loading.value = false
  }
})
</script>

<template>
  <div :class="['cp-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="hero-glow" aria-hidden="true"></div>
          <div class="hero-accent-line" aria-hidden="true"></div>
          <div class="hero-content-wrap">
            <div class="hero-icon-wrap">
              <Shield :size="22" aria-hidden="true" />
            </div>
            <div class="manager-title">
              <p class="eyebrow">Child Protection Program</p>
              <h1>Manage Child Protection page</h1>
              <div class="manager-meta" aria-label="Editable child protection summary">
                <span>{{ storageMode === 'supabase' ? 'Database' : 'Local only' }}</span>
                <span>{{ workItems.length }} work items</span>
                <span>{{ teamCards.length }} team cards</span>
                <span v-if="isDirty" class="meta-dirty">Unsaved changes</span>
                <span v-else-if="page.updatedAt">Saved {{ formatDate(page.updatedAt) }}</span>
              </div>
            </div>
          </div>
          <div class="hero-actions">
            <RouterLink class="btn btn-secondary" to="/programs/child-protection">
              <ExternalLink :size="16" aria-hidden="true" />
              <span>View page</span>
            </RouterLink>
            <button type="button" class="btn btn-edit" :class="{ 'btn-edit-active': editing }" @click="toggleEditing">
              <Lock :size="15" aria-hidden="true" />
              <span>{{ editing ? 'Editing enabled' : 'Enable editing' }}</span>
            </button>
            <button type="button" class="btn btn-primary" :disabled="saving || loading || !isDirty || !editing" @click="savePageContent(true)">
              <Save :size="16" aria-hidden="true" />
              <span>{{ saving ? 'Saving...' : 'Save changes' }}</span>
            </button>
          </div>
        </header>

        <div v-if="loading" class="state-card">
          <span class="state-spinner" aria-hidden="true"></span>
          <span>Loading Child Protection content...</span>
        </div>

        <div v-else class="content-grid" :class="{ 'view-mode': !editing }">
          <!-- ═══ Quick links ═══ -->
          <CollapsiblePanel
            v-model:expanded="expandedPanels['quick-links']"
            title="Related tools"
            kicker="Shortcuts"
            heading-id="quick-links-heading"
          >
            <template #icon>
              <FolderOpen :size="18" aria-hidden="true" />
            </template>

            <div class="quick-links-body">
              <RouterLink class="quick-link" to="/admin/media">
                <FolderOpen :size="18" aria-hidden="true" />
                <div>
                  <strong>Media Library</strong>
                  <span>Upload images for this page</span>
                </div>
              </RouterLink>
            </div>
          </CollapsiblePanel>

          <!-- ═══ Step 1: Page header ═══ -->
          <CollapsiblePanel
            v-model:expanded="expandedPanels['page-header']"
            title="Page title &amp; intro"
            kicker="Step 1"
            heading-id="page-header-heading"
          >
            <template #icon>
              <Type :size="18" aria-hidden="true" />
            </template>

            <p class="panel-desc">Edit the page headline, eyebrow label, and intro paragraph shown at the top of the public Child Protection page.</p>
            <div class="header-field">
              <label for="cp-eyebrow">Eyebrow label</label>
              <input id="cp-eyebrow" v-model="page.eyebrow" type="text" placeholder="e.g. Child Protection" />
            </div>
            <div class="header-field">
              <label for="cp-headline">Headline / title</label>
              <input id="cp-headline" v-model="page.headline" type="text" placeholder="e.g. Safeguarding children through local action." />
            </div>
            <div class="header-field">
              <label for="cp-intro">Intro paragraph</label>
              <textarea id="cp-intro" v-model="page.intro" rows="3" placeholder="Short paragraph introducing the program"></textarea>
            </div>
          </CollapsiblePanel>

          <!-- ═══ Step 2: Impact statistics ═══ -->
          <CollapsiblePanel
            v-model:expanded="expandedPanels['stats']"
            title="Impact statistics"
            kicker="Step 2"
            heading-id="stats-heading"
          >
            <template #icon>
              <Layers :size="18" aria-hidden="true" />
            </template>
            <template #actions>
              <button type="button" class="btn btn-secondary btn-sm" :disabled="!editing" @click="statsBand.push({ number: '', label: '', description: '' })">
                <Plus :size="15" aria-hidden="true" />
                <span>Add stat</span>
              </button>
            </template>

            <p class="panel-desc">Edit the statistics shown in the stats band on the public Child Protection page.</p>
            <div class="stack-list">
              <article v-for="(stat, index) in statsBand" :key="'stat-' + index" class="sub-editor">
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
                    <input v-model="stat.number" type="text" placeholder="e.g. 43" />
                  </label>
                  <label class="field">
                    <span>Label</span>
                    <input v-model="stat.label" type="text" placeholder="e.g. COMMUNES" />
                  </label>
                </div>
              </article>
            </div>
          </CollapsiblePanel>

          <!-- ═══ Step 3: Our Work ═══ -->
          <CollapsiblePanel
            v-model:expanded="expandedPanels['our-work']"
            title="Our Work"
            kicker="Step 3"
            heading-id="our-work-heading"
          >
            <template #icon>
              <BookOpen :size="18" aria-hidden="true" />
            </template>

            <p class="panel-desc">Edit the 6 work items shown in the "What we do" section. Each item has a title, description, and its own image.</p>

            <div class="stack-list">
              <article v-for="(item, index) in workItems" :key="index" class="sub-editor">
                <header class="sub-editor-header">
                  <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                  <h3>{{ item.title || `Work item ${index + 1}` }}</h3>
                  <button type="button" class="icon-btn ghost-icon-btn" :disabled="!editing" aria-label="Remove image" @click="clearWorkImage(index)">
                    <Trash2 :size="14" aria-hidden="true" />
                  </button>
                </header>
                <div class="sub-editor-body">
                  <div class="image-editor-grid">
                    <div class="image-upload-panel">
                      <div class="preview-wrap">
                        <img v-if="item.imageUrl" :src="item.imageUrl" alt="" class="preview-img" @error="item.imageUrl = ''" />
                        <div v-else class="preview-placeholder">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          <span>No image</span>
                        </div>
                      </div>
                      <AdminUploadButton
                        :disabled="!editing"
                        :description="item.title || `Work item ${index + 1} image`"
                        @update:model-value="(url: string) => item.imageUrl = url"
                      />
                    </div>
                    <div class="item-fields">
                      <label class="field">
                        <span>Title</span>
                        <input v-model="item.title" type="text" placeholder="e.g. Anti-Trafficking Campaigns" />
                      </label>
                      <label class="field wide">
                        <span>Description</span>
                        <textarea v-model="item.text" rows="2" :placeholder="'Description for ' + item.title"></textarea>
                      </label>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </CollapsiblePanel>

          <!-- ═══ Step 4: Our approach & Quote ═══ -->
          <CollapsiblePanel
            v-model:expanded="expandedPanels['quote']"
            title="Our approach &amp; Quote"
            kicker="Step 4"
            heading-id="quote-heading"
          >
            <template #icon>
              <MessageSquareQuote :size="18" aria-hidden="true" />
            </template>

            <p class="panel-desc">Edit the testimonial quote that appears in the approach section on the public Child Protection page.</p>
            <label class="field wide">
              <span>Quote text</span>
              <textarea v-model="quoteContent.text" rows="3" placeholder="Enter the quote..."></textarea>
            </label>
          </CollapsiblePanel>

          <!-- ═══ Step 5: Organizational Structure ═══ -->
          <CollapsiblePanel
            v-model:expanded="expandedPanels['org-structure']"
            title="Organizational Structure"
            kicker="Step 5"
            heading-id="org-structure-heading"
          >
            <template #icon>
              <Users :size="18" aria-hidden="true" />
            </template>

            <p class="panel-desc">Edit the team cards that appear under "Organizational Structure" on the public page.</p>

            <div class="stack-list">
              <article v-for="(card, index) in teamCards" :key="index" class="sub-editor">
                <header class="sub-editor-header">
                  <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                  <h3>{{ card.role || `Team member ${index + 1}` }}</h3>
                </header>
                <div class="sub-editor-body">
                  <div class="form-grid">
                    <label class="field">
                      <span>Role</span>
                      <input v-model="card.role" type="text" placeholder="e.g. Program Director" />
                    </label>
                    <label class="field">
                      <span>Icon</span>
                      <select v-model="card.icon">
                        <option value="compass">Compass</option>
                        <option value="map">Map</option>
                        <option value="heart">Heart</option>
                        <option value="chart">Chart</option>
                      </select>
                    </label>
                  </div>
                  <label class="field wide">
                    <span>Description</span>
                    <textarea v-model="card.desc" rows="2" :placeholder="'Description for ' + card.role"></textarea>
                  </label>
                </div>
              </article>
            </div>
          </CollapsiblePanel>

          <!-- ═══ Step 6: Why it matters ═══ -->
          <CollapsiblePanel
            v-model:expanded="expandedPanels['impact-cards']"
            title="Why it matters"
            kicker="Step 6"
            heading-id="impact-cards-heading"
          >
            <template #icon>
              <Layers :size="18" aria-hidden="true" />
            </template>

            <p class="panel-desc">Edit the impact cards shown in the "Why it matters" section. Each card has text and an optional image.</p>

            <div class="stack-list">
              <article v-for="(card, index) in impactCards" :key="'impact-' + index" class="sub-editor">
                <header class="sub-editor-header">
                  <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                  <h3>Card {{ index + 1 }}</h3>
                  <button type="button" class="icon-btn ghost-icon-btn" :disabled="!editing" aria-label="Remove image" @click="clearImpactImage(index)">
                    <Trash2 :size="14" aria-hidden="true" />
                  </button>
                </header>
                <div class="image-editor-grid">
                  <div class="image-upload-panel">
                    <div class="preview-wrap">
                      <img v-if="card.imageUrl" :src="card.imageUrl" alt="" class="preview-img" @error="card.imageUrl = ''" />
                      <div v-else class="preview-placeholder">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span>No image</span>
                      </div>
                    </div>
                    <AdminUploadButton
                      :disabled="!editing"
                      :description="`Impact card ${index + 1} image`"
                      @update:model-value="(url: string) => card.imageUrl = url"
                    />
                  </div>
                  <div class="item-fields">
                    <label class="field wide">
                      <span>Text</span>
                      <textarea v-model="card.text" rows="2" placeholder="Enter the impact card text..."></textarea>
                    </label>
                  </div>
                </div>
              </article>
            </div>
          </CollapsiblePanel>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.cp-admin {
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

.ghost-icon-btn {
  border: none !important;
  background: transparent !important;
  color: var(--admin-theme-muted) !important;
  width: 30px !important;
  min-height: 30px !important;
}

.ghost-icon-btn:hover {
  color: var(--admin-theme-danger) !important;
  background: color-mix(in srgb, var(--admin-theme-danger) 8%, transparent) !important;
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

.view-mode :deep(input),
.view-mode :deep(textarea),
.view-mode :deep(select) {
  pointer-events: none;
  opacity: 0.6;
  user-select: none;
  cursor: default;
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

.panel-desc {
  color: var(--admin-theme-muted);
  font-size: 0.82rem;
  line-height: 1.5;
  margin-bottom: 0.85rem;
}

/* Page header fields */
.header-field {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 0.85rem;
}

.header-field:last-child {
  margin-bottom: 0;
}

.header-field label {
  color: var(--admin-theme-contrast);
  font-size: 0.78rem;
  font-weight: 700;
}

.header-field input,
.header-field textarea {
  border: 1px solid var(--admin-theme-border);
  border-radius: 7px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-text);
  padding: 0.55rem 0.7rem;
  font: inherit;
  font-size: 0.86rem;
  resize: vertical;
}

.header-field input:focus,
.header-field textarea:focus {
  outline: none;
  border-color: var(--admin-theme-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 18%, transparent);
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
.field textarea,
.field select {
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
.field textarea:focus,
.field select:focus {
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

/* Image upload — timeline-style layout */
.image-editor-grid {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 1rem;
  align-items: start;
}

.image-upload-panel {
  display: grid;
  gap: 0.65rem;
  min-width: 0;
}

.preview-wrap {
  width: 100%;
  aspect-ratio: 1.5;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--admin-theme-border);
  background: var(--admin-theme-surface-soft);
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  color: var(--admin-theme-muted);
  font-size: 0.7rem;
  font-weight: 700;
  opacity: 0.6;
}

.item-fields {
  display: grid;
  gap: 0.75rem;
  min-width: 0;
}

@media (max-width: 680px) {
  .image-editor-grid {
    grid-template-columns: 1fr;
  }
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

/* Numbered / repeated item cards */
.stack-list {
  display: grid;
  gap: 0.75rem;
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

/* ─── Dark mode ──────────────────────────────── */
:global(.admin-dark) .cp-admin {
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

@media (min-width: 900px) {
  .cp-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
  }

  .manager-hero,
  .sub-editor-header {
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
    text-align: center;
  }
}
</style>
