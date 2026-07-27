<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminEditorPanel from '@/components/admin/AdminEditorPanel.vue'
import AdminSectionNav from '@/components/admin/AdminSectionNav.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import ImagePickerField from '@/components/admin/ImagePickerField.vue'
import { useSectionEditor } from '@/composables/useSectionEditor'
import { useScrollSpyNav } from '@/composables/useScrollSpyNav'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { supabase } from '@/lib/supabase'
import { useContentStore } from '@/stores/content.store'
import { useAdminTheme } from '@/composables/useAdminTheme'
import { useUiStore } from '@/stores/ui.store'

const ui = useUiStore()
const contentStore = useContentStore()
const { locale } = useI18n()
useAdminTheme()

/* ─── Types ─────────────────────────────────────── */
interface StatItem {
  number: string
  label: string
  description: string
}

interface EditableSection {
  id: string
  label: string
  heading: string
  body: string
  items: string
}

interface PageDraft {
  slug: string
  title: string
  eyebrow: string
  headline: string
  intro: string
  heroImageUrl: string
  sections: EditableSection[]
  updatedAt: string
}

/* ─── Defaults ──────────────────────────────────── */
function createDefaultCPPage(): PageDraft {
  return {
    slug: 'programs-child-protection',
    title: 'Child Protection',
    eyebrow: 'Child Protection',
    headline: 'Safeguarding children through local action.',
    intro: 'Cross-border migration, poverty and family separation put rural Cambodian children at risk of unsafe labour and trafficking. Santi Sena works with villages, schools and pagodas to build the safety net closest to the child.',
    heroImageUrl: '',
    sections: [
      {
        id: 'child-protection-work',
        label: 'What we do',
        heading: 'What we do',
        body: 'Anti-trafficking campaigns, village child protection networks, peer-educator groups and family reintegration.',
        items: 'Anti-trafficking campaigns at borders, markets and schools\nVillage Child Protection Networks trained in identification and referral\nChild rights advocacy with commune councils and provincial authorities\nPeer-educator youth groups on safe migration, health and rights\nFamily reintegration support for children returning from unsafe labour\nSafeguarding training for every teacher, monk and volunteer',
      },
      {
        id: 'child-protection-approach',
        label: 'Approach',
        heading: 'Our approach',
        body: 'Every network is anchored by the people children already trust — mothers, monks, teachers, commune council members.',
        items: '',
      },
      {
        id: 'child-protection-team',
        label: 'Organizational Structure',
        heading: 'Who delivers child protection on the ground',
        body: 'Our dedicated team works across provinces building community safeguarding systems.',
        items: 'Program Director | compass | Oversees child protection programs, advocacy, and partnerships across provinces.\nField Coordinators | map | Manage child protection networks, peer education and safe migration training.\nSafeguarding Trainers | heart | Deliver training for teachers, monks and volunteers on child rights and referral.\nMonitoring & Evaluation | chart | Track case outcomes, network coverage and community impact.',
      },
      {
        id: 'child-protection-why',
        label: 'Why it matters',
        heading: 'Why it matters',
        body: 'The border with Vietnam brings both opportunity and risk. Community-led safeguarding is the most durable defense.',
        items: "The safest village is one where every adult knows every child's name\nEarly identification prevents trafficking before it happens\nLocal networks respond faster than any external agency\nChildren who feel safe stay in school and out of harm",
      },
    ],
    updatedAt: '',
  }
}

/* ─── State ─────────────────────────────────────── */
const page = ref<PageDraft>(createDefaultCPPage())
const statsBand = ref<StatItem[]>([
  { number: '43', label: 'COMMUNES', description: 'With active Child Protection Networks.' },
  { number: '600+', label: 'PEER EDUCATORS', description: 'Youth trained in child rights and safeguarding.' },
  { number: '24/7', label: 'VILLAGE HOTLINES', description: 'Case referral into commune and provincial authorities.' },
])
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const savedSnapshot = ref('')
const storageMode = ref<'supabase' | 'local'>('supabase')
const STORAGE_KEY = 'cp-dashboard-page'

const draft = reactive({
  eyebrow: page.value.eyebrow,
  headline: page.value.headline,
  intro: page.value.intro,
  heroImageUrl: page.value.heroImageUrl,
  sections: page.value.sections.map((s) => ({ ...s })),
})

const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

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
    key: 'hero',
    getSnapshot: () => ({
      eyebrow: draft.eyebrow,
      headline: draft.headline,
      intro: draft.intro,
      heroImageUrl: draft.heroImageUrl,
      statsBand: statsBand.value.map((s) => ({ ...s })),
    }),
    applySnapshot: (value) => {
      draft.eyebrow = value.eyebrow
      draft.headline = value.headline
      draft.intro = value.intro
      draft.heroImageUrl = value.heroImageUrl
      statsBand.value = value.statsBand
    },
  },
  {
    key: 'sections',
    getSnapshot: () => draft.sections.map((s) => ({ ...s })),
    applySnapshot: (value) => {
      draft.sections = value
    },
  },
])

const originalSnapshot = ref('')

const hasChanges = computed(() => {
  const current = JSON.stringify({
    eyebrow: draft.eyebrow,
    headline: draft.headline,
    intro: draft.intro,
    heroImageUrl: draft.heroImageUrl,
    sections: draft.sections.map((s) => ({ ...s })),
    statsBand: statsBand.value.map((s) => ({ ...s })),
  })
  return current !== originalSnapshot.value
})

function updateSnapshot() {
  originalSnapshot.value = JSON.stringify({
    eyebrow: draft.eyebrow,
    headline: draft.headline,
    intro: draft.intro,
    heroImageUrl: draft.heroImageUrl,
    sections: draft.sections.map((s) => ({ ...s })),
    statsBand: statsBand.value.map((s) => ({ ...s })),
  })
}

const activeLocaleName = computed(() => (locale.value === 'kh' ? 'Khmer' : 'English'))

const sections = [
  { id: 'cp-hero', label: 'Hero & Stats', icon: 'mdi-creation' },
  { id: 'cp-sections', label: 'Page Sections', icon: 'mdi-view-grid' },
] as const

const { activeSection, scrollToSection, updateActiveSectionFromScroll } = useScrollSpyNav(sections)

useUnsavedChangesGuard(hasChanges)

/* ─── Data persistence ─────────────────────────── */
function loadFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, unknown>
      const defaults = createDefaultCPPage()
      draft.eyebrow = (saved.eyebrow as string) || defaults.eyebrow
      draft.headline = (saved.headline as string) || defaults.headline
      draft.intro = (saved.intro as string) || defaults.intro
      draft.heroImageUrl = (saved.heroImageUrl as string) || ''
      if (saved.statsBand && Array.isArray(saved.statsBand)) {
        statsBand.value = saved.statsBand as StatItem[]
      }
    }
  } catch { /* ignore */ }
}

function mergeSectionsWithDefaults(dbSections: EditableSection[], defaults: EditableSection[]): EditableSection[] {
  const dbMap = new Map<string, EditableSection>()
  for (const s of dbSections) dbMap.set(s.id, s)
  return defaults.map((defSec) => {
    const dbSec = dbMap.get(defSec.id)
    if (!dbSec) return { ...defSec }
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      eyebrow: draft.eyebrow,
      headline: draft.headline,
      intro: draft.intro,
      heroImageUrl: draft.heroImageUrl,
      sections: draft.sections,
      statsBand: statsBand.value,
    }))
  } catch { /* ignore */ }
}

async function loadPageContent() {
  resetEditingState()
  loading.value = true
  loadError.value = ''
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
      updateSnapshot()
      loading.value = false
      return
    }

    if (data) {
      const defaults = createDefaultCPPage()
      const meta = data.metadata as Record<string, unknown> | null
      draft.eyebrow = (meta?.eyebrow as string) || defaults.eyebrow
      draft.headline = (meta?.headline as string) || defaults.headline
      draft.intro = data.summary || (meta?.intro as string) || defaults.intro
      draft.heroImageUrl = (meta?.heroImageUrl as string) || ''
      draft.sections = meta?.sections && Array.isArray(meta.sections)
        ? mergeSectionsWithDefaults(meta.sections as EditableSection[], defaults.sections)
        : defaults.sections.map((s) => ({ ...s }))
      if (meta?.statsBand && Array.isArray(meta.statsBand) && meta.statsBand.length > 0) {
        statsBand.value = meta.statsBand as StatItem[]
      }
      page.value.updatedAt = data.updated_at || ''
      storageMode.value = 'supabase'
      saveToLocalStorage()
    } else {
      loadFromLocalStorage()
      storageMode.value = 'local'
    }
    updateSnapshot()
  } catch (e: unknown) {
    console.warn('Load crashed:', e)
    loadFromLocalStorage()
    storageMode.value = 'local'
    updateSnapshot()
  } finally {
    loading.value = false
    setupSectionWatch()
  }
}

async function savePageContent() {
  if (saving.value) return
  saving.value = true
  try {
    const now = new Date().toISOString()
    const payload = {
      slug: 'programs-child-protection',
      title: draft.headline.trim() || draft.slug,
      pillar: 'Child Protection',
      summary: draft.intro || '',
      description: draft.intro || '',
      status: 'published',
      metadata: {
        eyebrow: draft.eyebrow,
        headline: draft.headline,
        intro: draft.intro,
        heroImageUrl: draft.heroImageUrl,
        sections: draft.sections.map((s) => ({
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

    const { error } = await supabase.from('programs').upsert(payload, { onConflict: 'slug' })
    if (error) {
      console.warn('Supabase save failed:', error)
      ui.addToast(`DB write blocked: ${error.message}`, 'error')
      saveToLocalStorage()
      storageMode.value = 'local'
      updateSnapshot()
      saving.value = false
      return
    }
    storageMode.value = 'supabase'
    updateSnapshot()
    ui.addToast('Child Protection page saved!', 'success')
  } catch (e: unknown) {
    console.error('Save crashed:', e)
    ui.addToast('Saved to browser (database error)', 'info')
    storageMode.value = 'local'
    updateSnapshot()
  } finally {
    saving.value = false
  }
}

function parsedItemsForSection(section: EditableSection): string[] {
  return section.items ? section.items.split('\n').map((l) => l.trim()).filter(Boolean) : []
}

function formatDate(value: string): string {
  if (!value) return 'Not saved yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not saved yet'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

onMounted(() => {
  contentStore.useLocalFallback()
  void loadPageContent()
})

onUnmounted(() => {
  stopSectionWatch()
})
</script>

<template>
  <v-app :class="['cp-dash', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Child Protection Dashboard</h1>
            <div class="manager-meta">
              <v-chip size="small" variant="tonal" color="primary">{{ activeLocaleName }} content</v-chip>
              <v-chip size="small" variant="tonal" color="success" v-if="page.updatedAt">Saved</v-chip>
            </div>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/programs/child-protection" target="_blank">
              <v-icon start>mdi-open-in-new</v-icon>
              View page
            </v-btn>
          </div>
        </header>

        <v-fade-transition mode="out-in" @after-enter="updateActiveSectionFromScroll">
          <div v-if="loading" key="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading Child Protection content...</span>
          </div>
          <div v-else-if="loadError" key="error">
            <v-alert type="error" variant="tonal" closable @click:close="loadError = ''">
              <template #title>Could not load content</template>
              <div class="d-flex align-center justify-space-between ga-2">
                <span>{{ loadError }}</span>
                <v-btn variant="tonal" size="small" @click="loadPageContent">Try again</v-btn>
              </div>
            </v-alert>
          </div>

          <div v-else key="content" class="content-grid">
            <AdminSectionNav
              :sections="sections"
              :active-section="activeSection"
              :has-changes="hasChanges"
              :saving="saving"
              aria-label="Child Protection page sections"
              save-label="Save Change"
              @navigate="scrollToSection"
              @save="savePageContent"
            />

            <!-- ── HERO & STATS ── -->
            <AdminEditorPanel
              :id="sections[0].id"
              kicker="Hero & Stats"
              heading="Headline, intro & stats band"
              :editing="!!editingSections.hero"
              :collapsed="collapsedSections.hero"
              @toggle-edit="toggleEdit('hero')"
              @cancel="cancelEdit('hero')"
              @toggle-collapse="toggleCollapse('hero')"
            >
              <div class="image-editor-grid">
                <div class="image-upload-panel">
                  <v-img
                    :src="draft.heroImageUrl || '/images/programs/hero-2.jpg'"
                    aspect-ratio="1.6"
                    cover
                    class="image-preview hero-preview"
                  />
                  <div class="field-block">
                    <span class="field-label">Hero Image</span>
                    <ImagePickerField
                      v-model="draft.heroImageUrl"
                      label="Hero Image"
                      hint="Background image for the hero section"
                      :disabled="!editingSections.hero"
                      @success="(msg) => ui.addToast(msg, 'success')"
                      @error="(msg) => ui.addToast(msg, 'error')"
                    />
                  </div>
                </div>

                <div class="form-stack">
                  <div class="form-grid">
                    <v-text-field v-model="draft.eyebrow" label="Eyebrow / Badge" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="draft.headline" label="Headline (main title)" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" class="field-wide" />
                    <v-textarea v-model="draft.intro" label="Intro / Description" rows="3" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  </div>
                </div>
              </div>

              <v-divider class="my-3" />

              <div class="pa-4">
                <h3 class="text-h6 font-weight-bold mb-3">Stats Band</h3>
                <div v-for="(stat, index) in statsBand" :key="index" class="stat-editor">
                  <div class="stat-editor-hdr">
                    <span class="stat-editor-num">Stat {{ index + 1 }}</span>
                    <v-btn v-if="editingSections.hero" icon color="error" variant="tonal" size="x-small" @click="statsBand.splice(index, 1)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                  <div class="form-row">
                    <v-text-field v-model="stat.number" label="Number" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" placeholder="e.g. 43" />
                    <v-text-field v-model="stat.label" label="Label" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" placeholder="e.g. COMMUNES" />
                  </div>
                  <v-text-field v-model="stat.description" label="Description" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" placeholder="Brief description" class="mt-2" />
                </div>
                <v-btn v-if="editingSections.hero" color="accent" variant="tonal" size="small" class="mt-2" @click="statsBand.push({ number: '', label: '', description: '' })">
                  <v-icon start>mdi-plus</v-icon>
                  Add Stat
                </v-btn>
              </div>
            </AdminEditorPanel>

            <!-- ── PAGE SECTIONS ── -->
            <AdminEditorPanel
              :id="sections[1].id"
              kicker="Page Sections"
              heading="What We Do, Approach & Why It Matters"
              :editing="!!editingSections.sections"
              :collapsed="collapsedSections.sections"
              @toggle-edit="toggleEdit('sections')"
              @cancel="cancelEdit('sections')"
              @toggle-collapse="toggleCollapse('sections')"
            >
              <div class="pa-4">
                <div class="sections-list">
                  <div v-for="(section, index) in draft.sections" :key="section.id" class="section-edit-card">
                    <details :open="index === 0">
                      <summary class="sec-summary">
                        <div class="sec-summary-left">
                          <span class="sec-badge">{{ section.label }}</span>
                          <span class="sec-heading-preview">{{ section.heading || 'No heading' }}</span>
                        </div>
                        <v-icon class="sec-chevron">mdi-chevron-down</v-icon>
                      </summary>
                      <div class="sec-body">
                        <v-text-field v-model="section.heading" label="Heading" :disabled="!editingSections.sections" hide-details density="comfortable" variant="outlined" />
                        <v-textarea v-model="section.body" label="Body / Description" rows="3" :disabled="!editingSections.sections" hide-details density="comfortable" variant="outlined" />
                        <v-textarea v-model="section.items" label="Bullet items (one per line)" rows="5" :disabled="!editingSections.sections" hide-details density="comfortable" variant="outlined" />
                        <div v-if="section.items" class="item-preview">
                          <span class="field-label">Preview ({{ parsedItemsForSection(section).length }} items)</span>
                          <div class="item-chips">
                            <v-chip v-for="item in parsedItemsForSection(section)" :key="item" size="x-small" color="primary" variant="tonal">{{ item }}</v-chip>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
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
.cp-dash {
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
  align-items: center;
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
}

.manager-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.content-grid {
  display: grid;
  gap: 1.1rem;
  margin-top: 1rem;
}

.image-editor-grid {
  display: grid;
  grid-template-columns: minmax(300px, 0.72fr) minmax(360px, 1.28fr);
  gap: 1.25rem;
  padding: 1.5rem;
}

.image-preview {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 34%, var(--admin-theme-border));
  border-radius: 7px;
  background: var(--admin-theme-surface);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 8%, transparent), 0 12px 24px rgba(15, 95, 73, 0.11);
}

.image-upload-panel {
  display: grid;
  gap: 0.75rem;
  align-content: start;
}

.form-stack {
  display: grid;
  gap: 0.85rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.6rem 0.85rem;
}

.form-grid .field-wide {
  grid-column: 1 / -1;
}

.field-block {
  display: grid;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--admin-theme-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-editor {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.65rem;
  background: var(--admin-theme-surface);
}

.stat-editor-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.65rem;
}

.stat-editor-num {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--admin-theme-primary-deep);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.65rem;
}

fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.sections-list {
  display: grid;
  gap: 0.65rem;
}

.section-edit-card {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  overflow: hidden;
  transition: border-color 0.15s ease;
}

.section-edit-card:hover {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
}

.sec-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  cursor: pointer;
  user-select: none;
  list-style: none;
}

.sec-summary::-webkit-details-marker {
  display: none;
}

.sec-summary-left {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.sec-badge {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--admin-theme-teal);
  background: color-mix(in srgb, var(--admin-theme-teal) 12%, transparent);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.sec-heading-preview {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--admin-theme-contrast);
}

.sec-chevron {
  color: var(--admin-theme-muted);
  transition: transform 0.2s ease;
}

details[open] .sec-chevron {
  transform: rotate(180deg);
}

.sec-body {
  padding: 0 1rem 1rem;
  display: grid;
  gap: 0.65rem;
}

.item-preview {
  border: 1px solid var(--admin-theme-border);
  border-radius: 6px;
  padding: 0.75rem;
  background: var(--admin-theme-surface-soft);
}

.item-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.3rem;
}

@media (min-width: 900px) {
  .cp-dash.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
    padding-top: calc(60px + 1rem);
  }
  .manager-hero {
    flex-direction: column;
    align-items: stretch;
  }
  .hero-actions {
    width: 100%;
  }
  .image-editor-grid {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
