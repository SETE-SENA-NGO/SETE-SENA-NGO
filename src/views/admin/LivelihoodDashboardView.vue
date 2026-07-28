<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAdminTheme } from '@/composables/useAdminTheme'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ImagePickerField from '@/components/admin/ImagePickerField.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'

const ui = useUiStore()
useAdminTheme()

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


onMounted(async () => {
  await loadPageContent()
})
</script>

<template>
  <v-app :class="['live-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="hero-glow" aria-hidden="true"></div>
          <div class="hero-accent-line" aria-hidden="true"></div>
          <div class="hero-content-wrap">
            <div class="hero-icon-wrap">
              <v-icon size="22" color="primary">mdi-sprout</v-icon>
            </div>
            <div class="manager-title">
              <p class="eyebrow">Livelihood Program</p>
              <h1>Manage Livelihood page</h1>
            </div>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/programs/livelihood" target="_blank" size="small">
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
          <span class="mt-4 font-weight-bold">Loading Livelihood content...</span>
        </div>

        <div v-else class="content-grid" :class="{ 'view-mode': !editing }">
          <!-- ═══ Quick links ═══ -->
          <section class="editor-panel quick-links-panel" aria-labelledby="quick-links-heading">
            <button class="panel-header panel-header-clickable" aria-expanded="true" @click="togglePanel('quick-links')">
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

          <!-- ═══ Our Work ═══ -->
          <section class="editor-panel" aria-labelledby="our-work-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['our-work']" @click="togglePanel('our-work')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <v-icon size="18">mdi-book-open-variant</v-icon>
                </div>
                <div>
                  <p class="panel-kicker">Section 1</p>
                  <h2 id="our-work-heading">Our Work</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <v-icon size="15" color="disabled">mdi-pencil</v-icon>
                <v-icon size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['our-work'] }">mdi-chevron-down</v-icon>
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
                      <v-btn icon variant="text" size="x-small" color="error" @click="clearWorkImage(index)">
                        <v-icon size="14">mdi-trash-can</v-icon>
                      </v-btn>
                    </header>
                    <div class="sub-editor-body">
                      <v-text-field v-model="item.title" label="Title" placeholder="e.g. Integrated Farming" hide-details density="compact" variant="outlined" />
                      <div class="upload-wrap" :class="{ 'upload-disabled': !editing }">
                        <label class="field-label">Image</label>
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
                      <v-textarea v-model="item.text" label="Description" rows="2" :placeholder="'Description for ' + item.title" hide-details density="compact" variant="outlined" />
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
                  <v-icon size="18">mdi-account-group</v-icon>
                </div>
                <div>
                  <p class="panel-kicker">Section 2</p>
                  <h2 id="org-structure-heading">Organizational Structure</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <v-icon size="15" color="disabled">mdi-pencil</v-icon>
                <v-icon size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['org-structure'] }">mdi-chevron-down</v-icon>
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
                    <div class="sub-editor-body form-grid">
                      <v-text-field v-model="card.role" label="Role" placeholder="e.g. Program Director" hide-details density="compact" variant="outlined" />
                      <v-select v-model="card.icon" :items="[{ title: 'Compass', value: 'compass' }, { title: 'Map', value: 'map' }, { title: 'Heart', value: 'heart' }, { title: 'Chart', value: 'chart' }]" label="Icon" hide-details density="compact" variant="outlined" />
                      <v-textarea v-model="card.desc" label="Description" rows="2" :placeholder="'Description for ' + card.role" hide-details density="compact" variant="outlined" class="field-wide" />
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
                  <v-icon size="18">mdi-layers</v-icon>
                </div>
                <div>
                  <p class="panel-kicker">Section 3</p>
                  <h2 id="our-impact-heading">Our Impact</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <v-icon size="15" color="disabled">mdi-pencil</v-icon>
                <v-btn v-if="editing" variant="tonal" color="accent" size="x-small" @click="statsBand.push({ number: '', label: '', description: '' })">
                  <v-icon start size="14">mdi-plus</v-icon>
                  Add stat
                </v-btn>
                <v-icon size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['our-impact'] }" @click="togglePanel('our-impact')">mdi-chevron-down</v-icon>
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['our-impact']" class="panel-body">
                <p class="panel-desc">Edit the impact statistics and "Why it matters" cards shown on the public page.</p>

                <h3 class="subsection-heading">Impact statistics</h3>
                <div class="stack-list mb-lg">
                  <article v-for="(stat, index) in statsBand" :key="'stat-' + index" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h3>Stat {{ index + 1 }}</h3>
                      <v-btn v-if="editing" icon variant="tonal" color="error" size="x-small" aria-label="Remove stat" @click="confirmDeleteStat(index)">
                        <v-icon size="15">mdi-delete</v-icon>
                      </v-btn>
                    </header>
                    <div class="sub-editor-body form-grid">
                      <v-text-field v-model="stat.number" label="Number" placeholder="e.g. 180+" hide-details density="compact" variant="outlined" />
                      <v-text-field v-model="stat.label" label="Label" placeholder="e.g. SAVINGS GROUPS" hide-details density="compact" variant="outlined" />
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
                      <v-btn icon variant="text" size="x-small" color="error" aria-label="Remove image" @click="clearImpactImage(index)">
                        <v-icon size="14">mdi-trash-can</v-icon>
                      </v-btn>
                    </header>
                    <div class="sub-editor-body form-grid">
                      <v-textarea v-model="card.text" label="Text" rows="2" placeholder="Enter the impact card text..." hide-details density="compact" variant="outlined" class="field-wide" />
                      <div class="field-wide upload-wrap" :class="{ 'upload-disabled': !editing }">
                        <label class="field-label">Image</label>
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
                <v-textarea v-model="quoteContent.text" label="Quote text" rows="3" placeholder="Enter the quote..." hide-details density="comfortable" variant="outlined" />
                <p class="field-hint">This quote appears in the approach section on the public Livelihood page.</p>
              </div>
            </Transition>
          </section>
        </div>
      </main>
    </div>
  </v-app>
</template>

<style scoped>
.live-admin {
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
  gap: 0.3rem;
  margin-top: 0.1rem;
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

.upload-wrap {
  display: grid;
  gap: 0.35rem;
}

.chevron {
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chevron-up {
  transform: rotate(-180deg);
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

/* View mode */
.view-mode :deep(input),
.view-mode :deep(textarea),
.view-mode :deep(select) {
  pointer-events: none;
  opacity: 0.6;
  user-select: none;
  cursor: default;
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

  .hero-actions {
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
