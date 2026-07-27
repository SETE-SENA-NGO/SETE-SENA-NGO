<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  FolderOpen,
  Layers,
  Lock,
  MessageSquareQuote,
  Pencil,
  Plus,
  Save,
  Sprout,
  Trash2,
  Users,
} from 'lucide-vue-next'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ImagePickerField from '@/components/admin/ImagePickerField.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'

const ui = useUiStore()

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
  { title: 'Integrated Farming', text: 'Rice, fish, vegetables and livestock combined on one plot for year-round food and income.', imageUrl: '' },
  { title: 'Saving-for-Change', text: 'Self-help savings groups, primarily women-led, meeting weekly to pool and lend.', imageUrl: '' },
  { title: 'Cooperatives', text: 'Agricultural cooperatives for collective bargaining and shared equipment.', imageUrl: '' },
  { title: 'Rural Enterprise', text: 'Small enterprise development — melaleuca oil, honey and handicrafts.', imageUrl: '' },
  { title: 'Financial Literacy', text: 'Bookkeeping and micro-enterprise training for household budgeting.', imageUrl: '' },
  { title: 'Market Linkages', text: 'Connecting producers with provincial buyers and social enterprises.', imageUrl: '' },
]

const DEFAULT_TEAM_CARDS: TeamCard[] = [
  { role: 'Program Director', icon: 'compass', desc: 'Oversees livelihood programs, savings groups, and enterprise partnerships across provinces.' },
  { role: 'Field Coordinators', icon: 'map', desc: 'Manage Saving-for-Change groups and cooperative development in target villages.' },
  { role: 'Agricultural Trainers', icon: 'heart', desc: 'Deliver farmer field schools and climate-smart agriculture training.' },
  { role: 'Enterprise Officers', icon: 'chart', desc: 'Support small business development, market linkages and financial literacy.' },
]

const DEFAULT_IMPACT_CARDS: ImpactCard[] = [
  { text: 'Household income diversification reduces the risk of debt bondage and trafficking', imageUrl: '' },
  { text: 'Women-led savings shift decision-making power inside the household', imageUrl: '' },
  { text: 'Cooperatives break the isolation of the smallholder in the marketplace', imageUrl: '' },
  { text: 'Local enterprise keeps young adults in the village, near their children', imageUrl: '' },
]

const workItems = ref<WorkItem[]>(DEFAULT_WORK_ITEMS.map(w => ({ ...w })))
const teamCards = ref<TeamCard[]>(DEFAULT_TEAM_CARDS.map(t => ({ ...t })))
const impactCards = ref<ImpactCard[]>(DEFAULT_IMPACT_CARDS.map(c => ({ ...c })))

const statsBand = ref<StatItem[]>([
  { number: '180+', label: 'SAVINGS GROUPS', description: 'Women-led Saving-for-Change circles active across three provinces.' },
  { number: '2,400+', label: 'MEMBERS', description: 'Saving, lending and investing together.' },
  { number: '12', label: 'COOPERATIVES', description: 'Rice, vegetables, melaleuca oil and handicrafts.' },
])

const quoteContent = ref<QuoteContent>({
  text: 'Our group has lent to twelve families for chickens and school fees. Nobody has left for Thailand this year.',
})

const page = ref<PageDraft>({
  slug: 'programs-livelihood',
  title: 'Livelihood',
  eyebrow: 'Livelihood',
  headline: 'Growing practical income and food security.',
  intro: 'Poverty pushes rural Cambodians into unsafe migration and predatory debt. Santi Sena answers with income at home — soil restored, savings pooled, cooperatives negotiating fair prices, and small enterprises rooted in local resources.',
  updatedAt: '',
})

/* ─── Collapsible panels ───────────────────────── */
const expandedPanels = ref<Record<string, boolean>>({
  'quick-links': true,
  'our-work': true,
  'org-structure': true,
  'our-impact': true,
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
      void savePageContent()
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
      void savePageContent()
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
const STORAGE_KEY = 'live-dashboard-page'

function loadFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, unknown>
      const defaults = { eyebrow: 'Livelihood', headline: 'Growing practical income and food security.', intro: 'Poverty pushes rural Cambodians into unsafe migration and predatory debt. Santi Sena answers with income at home — soil restored, savings pooled, cooperatives negotiating fair prices, and small enterprises rooted in local resources.' }
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
        statsBand: statsBand.value,
        quoteContent: quoteContent.value,
        workItems: workItems.value,
        teamCards: teamCards.value,
        impactCards: impactCards.value,
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
                <span>{{ workItems.length }} work items</span>
                <span>{{ teamCards.length }} team cards</span>
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
          <span>Loading Livelihood content...</span>
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
              </div>
            </Transition>
          </section>

          <!-- ═══ Our Work ═══ -->
          <section class="editor-panel" aria-labelledby="our-work-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['our-work']" @click="togglePanel('our-work')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <BookOpen :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Section 1</p>
                  <h2 id="our-work-heading">Our Work</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <Pencil :size="15" class="edit-icon" aria-hidden="true" />
                <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['our-work'] }" aria-hidden="true" />
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['our-work']" class="panel-body">
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
                      <div class="form-grid">
                        <label class="field">
                          <span>Title</span>
                          <input v-model="item.title" type="text" placeholder="e.g. Integrated Farming" />
                        </label>
                      </div>
                      <div class="field wide upload-wrap" :class="{ 'upload-disabled': !editing }">
                        <span>Image</span>
                        <ImagePickerField
                          v-model="item.imageUrl"
                          :label="item.title || `Work item ${index + 1} image`"
                          hide-preview
                          @success="(msg: string) => ui.addToast(msg, 'success')"
                          @error="(msg: string) => ui.addToast(msg, 'error')"
                        />
                        <div v-if="item.imageUrl" class="image-preview-thumb">
                          <img :src="item.imageUrl" alt="" @error="item.imageUrl = ''" />
                        </div>
                      </div>
                      <label class="field wide">
                        <span>Description</span>
                        <textarea v-model="item.text" rows="2" :placeholder="'Description for ' + item.title"></textarea>
                      </label>
                    </div>
                  </article>
                </div>
              </div>
            </Transition>
          </section>

          <!-- ═══ Organizational Structure ═══ -->
          <section class="editor-panel" aria-labelledby="org-structure-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['org-structure']" @click="togglePanel('org-structure')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <Users :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Section 2</p>
                  <h2 id="org-structure-heading">Organizational Structure</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <Pencil :size="15" class="edit-icon" aria-hidden="true" />
                <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['org-structure'] }" aria-hidden="true" />
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['org-structure']" class="panel-body">
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
              </div>
            </Transition>
          </section>

          <!-- ═══ Our Impact ═══ -->
          <section class="editor-panel" aria-labelledby="our-impact-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['our-impact']" @click="togglePanel('our-impact')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <Layers :size="18" aria-hidden="true" />
                </div>
                <div>
                  <p class="panel-kicker">Section 3</p>
                  <h2 id="our-impact-heading">Our Impact</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <Pencil :size="15" class="edit-icon" aria-hidden="true" />
                <button type="button" class="btn btn-secondary btn-sm" :disabled="!editing" @click="statsBand.push({ number: '', label: '', description: '' })">
                  <Plus :size="15" aria-hidden="true" />
                  <span>Add stat</span>
                </button>
                <button type="button" class="icon-btn icon-btn-ghost" aria-label="Toggle panel" @click="togglePanel('our-impact')">
                  <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['our-impact'] }" />
                </button>
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['our-impact']" class="panel-body">
                <!-- Stats -->
                <p class="panel-desc">Edit the impact statistics and "Why it matters" cards shown on the public page.</p>

                <h3 class="subsection-heading">Impact statistics</h3>
                <div class="stack-list mb-lg">
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
                        <input v-model="stat.number" type="text" placeholder="e.g. 180+" />
                      </label>
                      <label class="field">
                        <span>Label</span>
                        <input v-model="stat.label" type="text" placeholder="e.g. SAVINGS GROUPS" />
                      </label>
                    </div>
                  </article>
                </div>

                <!-- Why it matters cards -->
                <h3 class="subsection-heading">Why it matters</h3>
                <div class="stack-list">
                  <article v-for="(card, index) in impactCards" :key="'impact-' + index" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h3>Card {{ index + 1 }}</h3>
                      <button type="button" class="icon-btn ghost-icon-btn" :disabled="!editing" aria-label="Remove image" @click="clearImpactImage(index)">
                        <Trash2 :size="14" aria-hidden="true" />
                      </button>
                    </header>
                    <div class="sub-editor-body form-grid">
                      <label class="field wide">
                        <span>Text</span>
                        <textarea v-model="card.text" rows="2" placeholder="Enter the impact card text..."></textarea>
                      </label>
                      <div class="field wide upload-wrap" :class="{ 'upload-disabled': !editing }">
                        <span>Image</span>
                        <ImagePickerField
                          v-model="card.imageUrl"
                          :label="`Impact card ${index + 1} image`"
                          hide-preview
                          @success="(msg: string) => ui.addToast(msg, 'success')"
                          @error="(msg: string) => ui.addToast(msg, 'error')"
                        />
                        <div v-if="card.imageUrl" class="image-preview-thumb">
                          <img :src="card.imageUrl" alt="" @error="card.imageUrl = ''" />
                        </div>
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

.subsection-heading {
  color: var(--admin-theme-contrast);
  font-size: 0.88rem;
  font-weight: 800;
  margin: 0 0 0.75rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--admin-theme-border);
}

.mb-lg {
  margin-bottom: 1.5rem;
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

/* Image upload row */
.upload-disabled {
  pointer-events: none;
  opacity: 0.5;
}

.image-preview-thumb {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--admin-theme-border);
  background: var(--admin-theme-surface-soft);
}

.image-preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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

  .form-grid {
    grid-template-columns: 1fr;
  }

  .hero-content-wrap {
    flex-direction: column;
    text-align: center;
  }
}
</style>
