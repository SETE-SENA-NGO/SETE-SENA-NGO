<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminEditorPanel from '@/components/admin/AdminEditorPanel.vue'
import AdminSectionNav from '@/components/admin/AdminSectionNav.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import { useSectionEditor } from '@/composables/useSectionEditor'
import { useScrollSpyNav } from '@/composables/useScrollSpyNav'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useAdminTheme } from '@/composables/useAdminTheme'
import { useUiStore } from '@/stores/ui.store'
import { supabase } from '@/lib/supabase'
import { explainPageSaveError, savePageByLocale } from '@/lib/pagePersistence'

interface StatItem {
  value: string
  label: string
}

interface PillarItem {
  goal: string
  title: string
  description: string
  image: string
}

// image is optional — leave blank to keep the built-in photo already used
// on the public site for that card.
type HomePageContent = {
  stats: StatItem[]
  mission: {
    eyebrow: string
    title: string
    text: string
  }
  pillarsSection: {
    eyebrow: string
    title: string
    linkLabel: string
  }
  pillars: PillarItem[]
  quote: {
    text: string
    attrib: string
  }
  cta: {
    title: string
    desc: string
    primaryLabel: string
    primaryLink: string
    secondaryLabel: string
    secondaryLink: string
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const fallbackContent: HomePageContent = {
  stats: [
    { value: '293', label: 'Villages Reached' },
    { value: '43', label: 'Communes Served' },
    { value: '30+', label: 'Years of Service' },
    { value: '10+', label: 'International Partners' },
  ],
  mission: {
    eyebrow: 'Our Mission',
    title: 'Peace is planted, not declared.',
    text:
      "Santi Sena — the Peace Army — was founded by Cambodian Buddhist monks in 1994 to alleviate poverty and rebuild moral, environmental and economic life after decades of conflict. Today our 30+ staff serve 293 villages with programs that combine the wisdom of the Dharma with rigorous community-led development.",
  },
  pillarsSection: {
    eyebrow: 'Four Pillars',
    title: 'Strategic goals',
    linkLabel: 'Explore all programs',
  },
  pillars: [
    {
      goal: 'Goal 01',
      title: 'Natural Resource & Environment',
      description:
        'Community forestry, tree nurseries, WASH and sanitation, climate adaptation and biogas — protecting the land that sustains every village.',
      image: '',
    },
    {
      goal: 'Goal 02',
      title: 'Access to Education',
      description:
        'Community pre-schools, mobile libraries, scholarships for poor children and the preservation of Buddhist education.',
      image: '',
    },
    {
      goal: 'Goal 03',
      title: 'Livelihood & Economic Improvement',
      description:
        'Integrated farming, Saving-for-Change groups, agricultural cooperatives and rural enterprises such as melaleuca oil.',
      image: '',
    },
    {
      goal: 'Goal 04',
      title: 'Child Protection',
      description:
        'Anti-trafficking campaigns, Child Protection Networks, peer educator groups and child rights advocacy.',
      image: '',
    },
  ],
  quote: {
    text: 'When we plant a tree, we plant peace. When we teach a child, we end a war that has not yet begun.',
    attrib: 'Founding Spirit of Santi Sena',
  },
  cta: {
    title: 'Join the Peace Army.',
    desc: 'Donate, partner, volunteer — every act seeds another village with hope.',
    primaryLabel: 'Support Us',
    primaryLink: '/qr-donate',
    secondaryLabel: 'Partner with us',
    secondaryLink: '/about',
  },
}

const ui = useUiStore()
const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

useAdminTheme()

const loading = ref(true)
const saving = ref(false)
const loadError = ref('')

const draft = reactive<HomePageContent>(cloneContent(fallbackContent))

const {
  editingSections,
  collapsedSections,
  toggleCollapse,
  toggleEdit,
  cancelEdit,
  setupSectionWatch,
  stopSectionWatch,
  resetEditingState,
} = useSectionEditor([
  {
    key: 'stats',
    getSnapshot: () => draft.stats.map((s) => ({ ...s })),
    applySnapshot: (value) => {
      draft.stats = value
    },
  },
  {
    key: 'mission',
    getSnapshot: () => ({ ...draft.mission }),
    applySnapshot: (value) => {
      draft.mission = value
    },
  },
  {
    key: 'pillars',
    getSnapshot: () => ({
      pillarsSection: { ...draft.pillarsSection },
      pillars: draft.pillars.map((p) => ({ ...p })),
    }),
    applySnapshot: (value) => {
      draft.pillarsSection = value.pillarsSection
      draft.pillars = value.pillars
    },
  },
  {
    key: 'quote',
    getSnapshot: () => ({ ...draft.quote }),
    applySnapshot: (value) => {
      draft.quote = value
    },
  },
  {
    key: 'cta',
    getSnapshot: () => ({ ...draft.cta }),
    applySnapshot: (value) => {
      draft.cta = value
    },
  },
])

const originalSnapshot = ref('')

const hasChanges = computed(() => {
  const current = JSON.stringify(cloneContent(draft))
  return current !== originalSnapshot.value
})

function updateSnapshot() {
  originalSnapshot.value = JSON.stringify(cloneContent(draft))
}

const sections = [
  { id: 'home-stats', label: 'Key Stats', icon: 'mdi-chart-bar' },
  { id: 'home-mission', label: 'Mission', icon: 'mdi-flag-outline' },
  { id: 'home-pillars', label: 'Four Pillars', icon: 'mdi-view-grid-outline' },
  { id: 'home-quote', label: 'Quote', icon: 'mdi-format-quote-close' },
  { id: 'home-cta', label: 'CTA', icon: 'mdi-bullhorn-outline' },
] as const

const { activeSection, scrollToSection, updateActiveSectionFromScroll } = useScrollSpyNav(sections)

useUnsavedChangesGuard(hasChanges)

onMounted(() => {
  void loadPage()
})

onUnmounted(() => {
  stopSectionWatch()
})

async function loadPage() {
  resetEditingState()
  loading.value = true
  loadError.value = ''

  try {
    const { data, error } = await supabase
      .from('pages')
      .select('body, updated_at')
      .eq('slug', 'home')
      .eq('locale', 'en')
      .maybeSingle()

    if (error) throw error

    const parsed = parseCmsBody(data?.body ?? '')
    replaceDraft(mergeContent(fallbackContent, parsed))
    updateSnapshot()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load Home content.'
    ui.addToast(loadError.value, 'error')
  } finally {
    loading.value = false
    setupSectionWatch()
  }
}

function replaceDraft(content: HomePageContent) {
  draft.stats = content.stats.map((s) => ({ ...s }))
  draft.mission = { ...content.mission }
  draft.pillarsSection = { ...content.pillarsSection }
  draft.pillars = content.pillars.map((p) => ({ ...p }))
  draft.quote = { ...content.quote }
  draft.cta = { ...content.cta }
}

async function savePage() {
  if (saving.value) return

  saving.value = true

  try {
    const content = cloneContent(draft)
    const body = JSON.stringify(
      { kind: 'santi-sena-home-content', version: 1, route: '/', ...content },
      null,
      2,
    )

    const savedAt = new Date().toISOString()
    const payload = {
      slug: 'home',
      title: 'Home',
      body,
      route_path: '/',
      nav_group: 'Home',
      locale: 'en' as const,
      template: 'standard',
      status: 'published',
      hero_eyebrow: content.mission.eyebrow.trim() || null,
      hero_headline: content.mission.title.trim() || null,
      hero_intro: content.mission.text.trim() || null,
      primary_cta_label: content.cta.primaryLabel.trim() || null,
      primary_cta_url: content.cta.primaryLink.trim() || '/qr-donate',
      secondary_cta_label: content.cta.secondaryLabel.trim() || null,
      secondary_cta_url: content.cta.secondaryLink.trim() || '/about',
      seo_title: 'Santi Sena — Home',
      seo_description: content.mission.text.trim() || null,
      sort_order: 0,
      published_at: savedAt,
      updated_at: savedAt,
    }

    const { error } = await savePageByLocale(payload)
    if (error) throw explainPageSaveError(error)

    updateSnapshot()
    ui.addToast('Home page saved.', 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save Home content.', 'error')
  } finally {
    saving.value = false
  }
}

function parseCmsBody(body: string): Partial<HomePageContent> | null {
  if (!body.trim()) return null
  try {
    const parsed = JSON.parse(body) as unknown
    if (isRecord(parsed) && parsed.kind === 'santi-sena-home-content') {
      const result: Partial<HomePageContent> = {}
      if (Array.isArray(parsed.stats)) result.stats = parsed.stats as StatItem[]
      if (isRecord(parsed.mission)) result.mission = parsed.mission as HomePageContent['mission']
      if (isRecord(parsed.pillarsSection)) result.pillarsSection = parsed.pillarsSection as HomePageContent['pillarsSection']
      if (Array.isArray(parsed.pillars)) result.pillars = parsed.pillars as PillarItem[]
      if (isRecord(parsed.quote)) result.quote = parsed.quote as HomePageContent['quote']
      if (isRecord(parsed.cta)) result.cta = parsed.cta as HomePageContent['cta']
      return result
    }
    return isRecord(parsed) ? (parsed as Partial<HomePageContent>) : null
  } catch {
    return null
  }
}

function mergeContent(
  base: HomePageContent,
  override: Partial<HomePageContent> | null,
): HomePageContent {
  if (!override) return cloneContent(base)
  return {
    stats: Array.isArray(override.stats) && override.stats.length
      ? override.stats.map((s) => ({ ...s }))
      : base.stats.map((s) => ({ ...s })),
    mission: mergeObject(base.mission, override.mission),
    pillarsSection: mergeObject(base.pillarsSection, override.pillarsSection),
    pillars: Array.isArray(override.pillars) && override.pillars.length
      ? override.pillars.map((p) => ({ ...p }))
      : base.pillars.map((p) => ({ ...p })),
    quote: mergeObject(base.quote, override.quote),
    cta: mergeObject(base.cta, override.cta),
  }
}

function mergeObject<T>(base: T, override: unknown): T {
  return isRecord(override) ? { ...base, ...override } as T : { ...base }
}

function cloneContent(content: HomePageContent): HomePageContent {
  return {
    stats: content.stats.map((s) => ({ ...s })),
    mission: { ...content.mission },
    pillarsSection: { ...content.pillarsSection },
    pillars: content.pillars.map((p) => ({ ...p })),
    quote: { ...content.quote },
    cta: { ...content.cta },
  }
}
</script>

<template>
  <v-app :class="['home-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Home page</h1>
            <p class="header-description">
              Edit the stats, mission statement, four pillars, quote and closing call-to-action
              shown on the public homepage. The hero slideshow is managed separately.
            </p>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" color="primary" to="/" target="_blank">
              <v-icon start>mdi-open-in-new</v-icon>
              View page
            </v-btn>
          </div>
        </header>

        <v-fade-transition mode="out-in" @after-enter="updateActiveSectionFromScroll">
          <div v-if="loading" key="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading Home content...</span>
          </div>
          <div v-else-if="loadError" key="error">
            <v-alert type="error" variant="tonal" closable @click:close="loadError = ''">
              <template #title>Could not load content</template>
              <div class="d-flex align-center justify-space-between ga-2">
                <span>{{ loadError }}</span>
                <v-btn variant="tonal" size="small" @click="loadPage">Try again</v-btn>
              </div>
            </v-alert>
          </div>

          <div v-else key="content" class="content-grid">

          <AdminSectionNav
            :sections="sections"
            :active-section="activeSection"
            :has-changes="hasChanges"
            :saving="saving"
            aria-label="Home page sections"
            save-label="Save Change"
            @navigate="scrollToSection"
            @save="savePage"
          />

          <!-- ── KEY STATS ── -->
          <AdminEditorPanel
            :id="sections[0].id"
            kicker="By the numbers"
            heading="Key stats"
            :editing="!!editingSections.stats"
            :collapsed="!!collapsedSections.stats"
            @toggle-edit="toggleEdit('stats')"
            @cancel="cancelEdit('stats')"
            @toggle-collapse="toggleCollapse('stats')"
          >
            <div class="panel-body">
              <div class="stats-grid">
                <div v-for="(stat, index) in draft.stats" :key="index" class="stat-editor">
                  <span class="stat-index">{{ String(index + 1).padStart(2, '0') }}</span>
                  <v-text-field v-model="stat.value" label="Value" placeholder="e.g. 293" :disabled="!editingSections.stats" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="stat.label" label="Label" placeholder="e.g. Villages Reached" :disabled="!editingSections.stats" hide-details density="comfortable" variant="outlined" />
                </div>
              </div>
            </div>
          </AdminEditorPanel>

          <!-- ── MISSION ── -->
          <AdminEditorPanel
            :id="sections[1].id"
            kicker="Our Mission"
            heading="Mission statement"
            :editing="!!editingSections.mission"
            :collapsed="!!collapsedSections.mission"
            @toggle-edit="toggleEdit('mission')"
            @cancel="cancelEdit('mission')"
            @toggle-collapse="toggleCollapse('mission')"
          >
            <div class="panel-body form-grid">
              <v-text-field v-model="draft.mission.eyebrow" label="Eyebrow" placeholder="e.g. Our Mission" :disabled="!editingSections.mission" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.mission.title" label="Title" placeholder="e.g. Peace is planted, not declared." :disabled="!editingSections.mission" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.mission.text" label="Mission text" rows="4" :disabled="!editingSections.mission" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>
          </AdminEditorPanel>

          <!-- ── FOUR PILLARS ── -->
          <AdminEditorPanel
            :id="sections[2].id"
            kicker="Four Pillars"
            heading="Strategic goals"
            :editing="!!editingSections.pillars"
            :collapsed="!!collapsedSections.pillars"
            @toggle-edit="toggleEdit('pillars')"
            @cancel="cancelEdit('pillars')"
            @toggle-collapse="toggleCollapse('pillars')"
          >
            <div class="panel-body form-grid">
              <v-text-field v-model="draft.pillarsSection.eyebrow" label="Section eyebrow" placeholder="e.g. Four Pillars" :disabled="!editingSections.pillars" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.pillarsSection.title" label="Section title" placeholder="e.g. Strategic goals" :disabled="!editingSections.pillars" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.pillarsSection.linkLabel" label="Link label" placeholder="e.g. Explore all programs" :disabled="!editingSections.pillars" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>

            <v-divider class="mx-4" />
            <div class="pa-4">
              <div class="cards-list">
                <article v-for="(pillar, index) in draft.pillars" :key="index" class="card-editor">
                  <header class="card-editor-header">
                    <div class="card-heading">
                      <span class="card-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <div>
                        <h3>{{ pillar.title || 'Untitled goal' }}</h3>
                        <p>{{ pillar.goal || 'No tag' }}</p>
                      </div>
                    </div>
                  </header>

                  <div class="card-form-grid">
                    <v-text-field v-model="pillar.goal" label="Goal tag" placeholder="e.g. Goal 01" :disabled="!editingSections.pillars" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="pillar.title" label="Title" placeholder="e.g. Natural Resource & Environment" :disabled="!editingSections.pillars" hide-details density="comfortable" variant="outlined" />
                    <v-textarea v-model="pillar.description" label="Description" rows="3" :disabled="!editingSections.pillars" hide-details density="comfortable" variant="outlined" class="field-wide" />
                    <label class="field field-wide">
                      <span class="field-label">Image (optional — leave blank to keep the current photo)</span>
                      <ImageUploader
                        :model-value="pillar.image"
                        :disabled="!editingSections.pillars"
                        @update:model-value="(url) => (pillar.image = url)"
                      />
                    </label>
                  </div>
                </article>
              </div>
            </div>
          </AdminEditorPanel>

          <!-- ── QUOTE ── -->
          <AdminEditorPanel
            :id="sections[3].id"
            kicker="Quote"
            heading="Closing quote"
            :editing="!!editingSections.quote"
            :collapsed="!!collapsedSections.quote"
            @toggle-edit="toggleEdit('quote')"
            @cancel="cancelEdit('quote')"
            @toggle-collapse="toggleCollapse('quote')"
          >
            <div class="panel-body form-grid">
              <v-textarea v-model="draft.quote.text" label="Quote" rows="3" :disabled="!editingSections.quote" hide-details density="comfortable" variant="outlined" class="field-wide" />
              <v-text-field v-model="draft.quote.attrib" label="Attribution" placeholder="e.g. Founding Spirit of Santi Sena" :disabled="!editingSections.quote" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>
          </AdminEditorPanel>

          <!-- ── CTA ── -->
          <AdminEditorPanel
            :id="sections[4].id"
            kicker="Ready to give"
            heading="Closing call to action"
            :editing="!!editingSections.cta"
            :collapsed="!!collapsedSections.cta"
            @toggle-edit="toggleEdit('cta')"
            @cancel="cancelEdit('cta')"
            @toggle-collapse="toggleCollapse('cta')"
          >
            <div class="panel-body form-grid">
              <v-text-field v-model="draft.cta.title" label="Title" placeholder="e.g. Join the Peace Army." :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.cta.desc" label="Description" rows="2" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" class="field-wide" />
              <v-text-field v-model="draft.cta.primaryLabel" label="Primary button label" placeholder="e.g. Support Us" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.cta.primaryLink" label="Primary button link" placeholder="/qr-donate" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.cta.secondaryLabel" label="Secondary button label" placeholder="e.g. Partner with us" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.cta.secondaryLink" label="Secondary button link" placeholder="/about" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
            </div>
          </AdminEditorPanel>

        </div>
    </v-fade-transition>
      </main>
    </div>

    <AdminConfirmDialog
      v-model="confirmOpen"
      :title="confirmData.title"
      :body="confirmData.body"
      @confirm="confirmData.onConfirm()"
    />
  </v-app>
</template>

<style scoped>
.home-admin {
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
  padding: 1.5rem 2rem 2.5rem;
}

.manager-hero {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1rem 1.5rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
}

.manager-hero h1 {
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 1.32rem;
  line-height: 1.2;
}

.manager-title {
  display: grid;
  gap: 0.32rem;
  max-width: 640px;
}

.header-description {
  margin: 0;
  color: var(--admin-theme-muted);
  line-height: 1.55;
  font-size: 0.88rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

/* ── Content grid ── */
.content-grid {
  display: grid;
  gap: 1.1rem;
  margin-top: 1rem;
}

/* ── Panel body ── */
.panel-body {
  padding: 1.5rem;
}

/* ── Form layouts ── */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.6rem 0.85rem;
}

.form-grid .field-wide {
  grid-column: 1 / -1;
}

/* ── Key stats grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.stat-editor {
  position: relative;
  display: grid;
  gap: 1.5rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  padding: 1.5rem 1rem 1rem;
}

.stat-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  border-radius: 6px;
  background: var(--admin-theme-surface-soft);
  color: var(--admin-theme-primary-deep);
  font-size: 0.7rem;
  font-weight: 900;
}

/* ── Image field ── */
.field {
  display: grid;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--admin-theme-contrast-soft);
}

/* ── Card list (pillars) ── */
.cards-list {
  display: grid;
  gap: 0.95rem;
}

.card-editor {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  overflow: hidden;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.card-editor:hover {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  box-shadow: 0 4px 14px rgba(15, 95, 73, 0.08);
}

.card-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 32%, var(--admin-theme-surface));
  padding: 0.75rem 1.5rem;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.card-heading h3,
.card-heading p {
  margin: 0;
}

.card-heading h3 {
  color: var(--admin-theme-contrast);
  font-size: 0.94rem;
  font-weight: 900;
}

.card-heading p {
  color: var(--admin-theme-muted);
  font-size: 0.76rem;
  font-weight: 700;
}

.card-number {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  border-radius: 6px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-primary-deep);
  font-size: 0.74rem;
  font-weight: 900;
  flex-shrink: 0;
}

.card-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.6rem 0.85rem;
  padding: 1.25rem 1.5rem;
}

.card-form-grid .field-wide {
  grid-column: 1 / -1;
}

@media (min-width: 900px) {
  .home-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
    padding-top: calc(60px + 1rem);
  }

  .manager-hero,
  .card-editor-header {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-actions {
    width: 100%;
  }

  .form-grid,
  .card-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
