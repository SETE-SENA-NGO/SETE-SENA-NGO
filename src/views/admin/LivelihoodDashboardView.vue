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
interface StatItem { number: string; label: string; description: string }
interface EditableSection { id: string; label: string; heading: string; body: string; items: string }
interface QuoteContent { text: string }
interface PageDraft { slug: string; title: string; eyebrow: string; headline: string; intro: string; heroImageUrl: string; sections: EditableSection[]; updatedAt: string }

/* ─── Defaults ──────────────────────────────────── */
function createDefault(): PageDraft {
  return {
    slug: 'programs-livelihood', title: 'Livelihood', eyebrow: 'Livelihood',
    headline: 'Growing practical income and food security.',
    intro: 'Poverty pushes rural Cambodians into unsafe migration and predatory debt. Santi Sena answers with income at home — soil restored, savings pooled, cooperatives negotiating fair prices.',
    heroImageUrl: '', sections: [
      { id: 'livelihood-work', label: 'What we do', heading: 'What we do', body: 'Integrated farming, savings groups, cooperatives, rural enterprise, financial literacy and market linkages.', items: 'Integrated Farming\nSaving-for-Change\nCooperatives\nRural Enterprise\nFinancial Literacy\nMarket Linkages' },
      { id: 'livelihood-approach', label: 'Approach', heading: 'Our approach', body: 'We do not distribute cash. We build the systems — saving groups, cooperatives, farmer schools.', items: '' },
      { id: 'livelihood-team', label: 'Organizational Structure', heading: 'Who delivers livelihood programs on the ground', body: 'Our dedicated team works across provinces.', items: 'Program Director | compass | Oversees livelihood programs.\nField Coordinators | map | Manage Saving-for-Change groups.\nAgricultural Trainers | heart | Deliver farmer field schools.\nEnterprise Officers | chart | Support small business development.' },
      { id: 'livelihood-why', label: 'Why it matters', heading: 'Why it matters', body: 'Cash predictability is what lets a family send their child to school.', items: 'Household income diversification reduces the risk of debt bondage\nWomen-led savings shift decision-making power inside the household\nCooperatives break the isolation of the smallholder\nLocal enterprise keeps young adults in the village' },
    ], updatedAt: '',
  }
}

/* ─── State ─────────────────────────────────────── */
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const storageMode = ref<'supabase' | 'local'>('supabase')
const STORAGE_KEY = 'live-dashboard-page'
const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

const page = ref<PageDraft>(createDefault())
const statsBand = ref<StatItem[]>([
  { number: '180+', label: 'SAVINGS GROUPS', description: 'Women-led Saving-for-Change circles active across three provinces.' },
  { number: '2,400+', label: 'MEMBERS', description: 'Saving, lending and investing together.' },
  { number: '12', label: 'COOPERATIVES', description: 'Rice, vegetables, melaleuca oil and handicrafts.' },
])
const quoteContent = ref<QuoteContent>({ text: 'Our group has lent to twelve families for chickens and school fees. Nobody has left for Thailand this year.' })

const draft = reactive({ eyebrow: page.value.eyebrow, headline: page.value.headline, intro: page.value.intro, heroImageUrl: page.value.heroImageUrl, sections: page.value.sections.map((s) => ({ ...s })) })

const { editingSections, collapsedSections, toggleCollapse, toggleEdit, cancelEdit, setupSectionWatch, stopSectionWatch, resetEditingState } = useSectionEditor([
  { key: 'hero', getSnapshot: () => ({ eyebrow: draft.eyebrow, headline: draft.headline, intro: draft.intro, heroImageUrl: draft.heroImageUrl, statsBand: statsBand.value.map((s) => ({ ...s })) }), applySnapshot: (v) => { draft.eyebrow = v.eyebrow; draft.headline = v.headline; draft.intro = v.intro; draft.heroImageUrl = v.heroImageUrl; statsBand.value = v.statsBand } },
  { key: 'sections', getSnapshot: () => draft.sections.map((s) => ({ ...s })), applySnapshot: (v) => { draft.sections = v } },
  { key: 'quote', getSnapshot: () => ({ ...quoteContent.value }), applySnapshot: (v) => { quoteContent.value = v } },
])

const originalSnapshot = ref('')
const hasChanges = computed(() => {
  const current = JSON.stringify({ eyebrow: draft.eyebrow, headline: draft.headline, intro: draft.intro, heroImageUrl: draft.heroImageUrl, sections: draft.sections.map((s) => ({ ...s })), statsBand: statsBand.value.map((s) => ({ ...s })), quoteContent: { ...quoteContent.value } })
  return current !== originalSnapshot.value
})
function updateSnapshot() {
  originalSnapshot.value = JSON.stringify({ eyebrow: draft.eyebrow, headline: draft.headline, intro: draft.intro, heroImageUrl: draft.heroImageUrl, sections: draft.sections.map((s) => ({ ...s })), statsBand: statsBand.value.map((s) => ({ ...s })), quoteContent: { ...quoteContent.value } })
}

const sections = [
  { id: 'live-hero', label: 'Hero & Stats', icon: 'mdi-creation' },
  { id: 'live-sections', label: 'Page Sections', icon: 'mdi-view-grid' },
  { id: 'live-quote', label: 'Quote', icon: 'mdi-format-quote-open' },
] as const

const { activeSection, scrollToSection, updateActiveSectionFromScroll } = useScrollSpyNav(sections)
useUnsavedChangesGuard(hasChanges)

function mergeSectionsWithDefaults(db: EditableSection[], defaults: EditableSection[]): EditableSection[] {
  const map = new Map(db.map((s) => [s.id, s]))
  return defaults.map((d) => { const m = map.get(d.id); return m ? { ...d, ...m } : { ...d } })
}

function loadFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const s = JSON.parse(raw) as Record<string, unknown>
      const defs = createDefault()
      draft.eyebrow = (s.eyebrow as string) || defs.eyebrow
      draft.headline = (s.headline as string) || defs.headline
      draft.intro = (s.intro as string) || defs.intro
      draft.heroImageUrl = (s.heroImageUrl as string) || ''
      if (Array.isArray(s.statsBand)) statsBand.value = s.statsBand as StatItem[]
      if (s.quoteContent && typeof s.quoteContent === 'object') quoteContent.value = { ...quoteContent.value, ...s.quoteContent as Partial<QuoteContent> }
    }
  } catch { /* ignore */ }
}

function saveToLocalStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ eyebrow: draft.eyebrow, headline: draft.headline, intro: draft.intro, heroImageUrl: draft.heroImageUrl, sections: draft.sections, statsBand: statsBand.value, quoteContent: quoteContent.value }))
  } catch { /* ignore */ }
}

async function loadPageContent() {
  resetEditingState()
  loading.value = true
  loadError.value = ''
  try {
    const { data, error } = await supabase.from('programs').select('title, summary, description, metadata, updated_at').eq('slug', 'programs-livelihood').maybeSingle()
    if (error) { console.warn(error.message); loadFromLocalStorage(); storageMode.value = 'local'; updateSnapshot(); loading.value = false; return }
    if (data) {
      const defs = createDefault(); const m = data.metadata as Record<string, unknown> | null
      draft.eyebrow = (m?.eyebrow as string) || defs.eyebrow; draft.headline = (m?.headline as string) || defs.headline
      draft.intro = data.summary || (m?.intro as string) || defs.intro; draft.heroImageUrl = (m?.heroImageUrl as string) || ''
      draft.sections = m?.sections && Array.isArray(m.sections) ? mergeSectionsWithDefaults(m.sections as EditableSection[], defs.sections) : defs.sections.map((s) => ({ ...s }))
      if (Array.isArray(m?.statsBand)) statsBand.value = m.statsBand as StatItem[]
      if (m?.quoteContent && typeof m.quoteContent === 'object') quoteContent.value = { ...quoteContent.value, ...m.quoteContent as Partial<QuoteContent> }
      storageMode.value = 'supabase'; saveToLocalStorage()
    } else { loadFromLocalStorage(); storageMode.value = 'local' }
    updateSnapshot()
  } catch (e: unknown) { console.warn('Load crashed:', e); loadFromLocalStorage(); storageMode.value = 'local'; updateSnapshot()
  } finally { loading.value = false; setupSectionWatch() }
}

async function savePageContent() {
  if (saving.value) return
  saving.value = true
  try {
    const payload = { slug: 'programs-livelihood', title: draft.headline.trim() || draft.slug, pillar: 'Livelihood', summary: draft.intro || '', description: draft.intro || '', status: 'published', metadata: { eyebrow: draft.eyebrow, headline: draft.headline, intro: draft.intro, heroImageUrl: draft.heroImageUrl, sections: draft.sections.map((s) => ({ id: s.id, label: s.label, heading: s.heading, body: s.body, items: s.items })), statsBand: statsBand.value, quoteContent: quoteContent.value }, updated_at: new Date().toISOString() }
    saveToLocalStorage()
    const { error } = await supabase.from('programs').upsert(payload, { onConflict: 'slug' })
    if (error) { console.warn(error.message); ui.addToast(`DB write blocked: ${error.message}`, 'error'); saveToLocalStorage(); storageMode.value = 'local'; updateSnapshot(); saving.value = false; return }
    storageMode.value = 'supabase'; updateSnapshot(); ui.addToast('Livelihood page saved!', 'success')
  } catch (e: unknown) { console.error('Save crashed:', e); ui.addToast('Saved to browser (database error)', 'info'); storageMode.value = 'local'; updateSnapshot()
  } finally { saving.value = false }
}

function parsedItemsForSection(section: EditableSection): string[] {
  return section.items ? section.items.split('\n').map((l) => l.trim()).filter(Boolean) : []
}

onMounted(() => { contentStore.useLocalFallback(); void loadPageContent() })
onUnmounted(() => { stopSectionWatch() })
</script>

<template>
  <v-app :class="['live-dash', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Livelihood Dashboard</h1>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/programs/livelihood" target="_blank"><v-icon start>mdi-open-in-new</v-icon>View page</v-btn>
          </div>
        </header>

        <v-fade-transition mode="out-in" @after-enter="updateActiveSectionFromScroll">
          <div v-if="loading" key="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading Livelihood content...</span>
          </div>
          <div v-else-if="loadError" key="error">
            <v-alert type="error" variant="tonal" closable @click:close="loadError = ''">
              <template #title>Could not load content</template>
              <div class="d-flex align-center justify-space-between ga-2"><span>{{ loadError }}</span><v-btn variant="tonal" size="small" @click="loadPageContent">Try again</v-btn></div>
            </v-alert>
          </div>

          <div v-else key="content" class="content-grid">
            <AdminSectionNav :sections="sections" :active-section="activeSection" :has-changes="hasChanges" :saving="saving" aria-label="Livelihood page sections" save-label="Save Change" @navigate="scrollToSection" @save="savePageContent" />

            <!-- ── HERO & STATS ── -->
            <AdminEditorPanel :id="sections[0].id" kicker="Hero & Stats" heading="Headline, intro & stats band" :editing="!!editingSections.hero" :collapsed="collapsedSections.hero" @toggle-edit="toggleEdit('hero')" @cancel="cancelEdit('hero')" @toggle-collapse="toggleCollapse('hero')">
              <div class="image-editor-grid">
                <div class="image-upload-panel">
                  <v-img :src="draft.heroImageUrl || '/images/programs/hero-2.jpg'" aspect-ratio="1.6" cover class="image-preview hero-preview" />
                  <div class="field-block"><span class="field-label">Hero Image</span><ImagePickerField v-model="draft.heroImageUrl" label="Hero Image" :disabled="!editingSections.hero" @success="(msg) => ui.addToast(msg, 'success')" @error="(msg) => ui.addToast(msg, 'error')" /></div>
                </div>
                <div class="form-stack">
                  <div class="form-grid">
                    <v-text-field v-model="draft.eyebrow" label="Eyebrow" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="draft.headline" label="Headline" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" class="field-wide" />
                    <v-textarea v-model="draft.intro" label="Intro / Description" rows="3" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  </div>
                </div>
              </div>
              <v-divider class="mx-4" />
              <div class="pa-4">
                <h3 class="text-h6 font-weight-bold mb-3">Stats Band</h3>
                <div v-for="(stat, index) in statsBand" :key="index" class="stat-editor">
                  <div class="stat-editor-hdr"><span class="stat-editor-num">Stat {{ index + 1 }}</span><v-btn v-if="editingSections.hero" icon color="error" variant="tonal" size="x-small" @click="statsBand.splice(index, 1)"><v-icon>mdi-delete</v-icon></v-btn></div>
                  <div class="form-row">
                    <v-text-field v-model="stat.number" label="Number" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="stat.label" label="Label" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
                  </div>
                  <v-text-field v-model="stat.description" label="Description" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" class="mt-2" />
                </div>
                <v-btn v-if="editingSections.hero" color="accent" variant="tonal" size="small" class="mt-2" @click="statsBand.push({ number: '', label: '', description: '' })"><v-icon start>mdi-plus</v-icon>Add Stat</v-btn>
              </div>
            </AdminEditorPanel>

            <!-- ── PAGE SECTIONS ── -->
            <AdminEditorPanel :id="sections[1].id" kicker="Page Sections" heading="What We Do, Approach & Why It Matters" :editing="!!editingSections.sections" :collapsed="collapsedSections.sections" @toggle-edit="toggleEdit('sections')" @cancel="cancelEdit('sections')" @toggle-collapse="toggleCollapse('sections')">
              <div class="pa-4">
                <div class="sections-list">
                  <div v-for="(section, index) in draft.sections" :key="section.id" class="section-edit-card">
                    <details :open="index === 0">
                      <summary class="sec-summary"><div class="sec-summary-left"><span class="sec-badge">{{ section.label }}</span><span class="sec-heading-preview">{{ section.heading || 'No heading' }}</span></div><v-icon class="sec-chevron">mdi-chevron-down</v-icon></summary>
                      <div class="sec-body">
                        <v-text-field v-model="section.heading" label="Heading" :disabled="!editingSections.sections" hide-details density="comfortable" variant="outlined" />
                        <v-textarea v-model="section.body" label="Body / Description" rows="3" :disabled="!editingSections.sections" hide-details density="comfortable" variant="outlined" />
                        <v-textarea v-model="section.items" label="Bullet items (one per line)" rows="5" :disabled="!editingSections.sections" hide-details density="comfortable" variant="outlined" />
                        <div v-if="section.items" class="item-preview"><span class="field-label">Preview ({{ parsedItemsForSection(section).length }} items)</span><div class="item-chips"><v-chip v-for="item in parsedItemsForSection(section)" :key="item" size="x-small" color="primary" variant="tonal">{{ item }}</v-chip></div></div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
            </AdminEditorPanel>

            <!-- ── QUOTE ── -->
            <AdminEditorPanel :id="sections[2].id" kicker="Quote" heading="Testimonial under approach section" :editing="!!editingSections.quote" :collapsed="collapsedSections.quote" @toggle-edit="toggleEdit('quote')" @cancel="cancelEdit('quote')" @toggle-collapse="toggleCollapse('quote')">
              <div class="pa-4">
                <v-textarea v-model="quoteContent.text" label="Quote Text" rows="3" :disabled="!editingSections.quote" hide-details density="comfortable" variant="outlined" />
              </div>
            </AdminEditorPanel>
          </div>
        </v-fade-transition>
      </main>
    </div>
    <AdminConfirmDialog v-model="confirmOpen" :title="confirmData.title" :body="confirmData.body" @confirm="confirmData.onConfirm()" />
  </v-app>
</template>

<style scoped>
.live-dash { min-height: 100vh; background: var(--admin-bg); color: var(--admin-text); transition: padding-left 0.25s ease; }
.admin-layout { min-height: 100vh; }
.manager-main { min-height: 100vh; padding: 1.5rem 2rem 2.5rem; }
.manager-hero { display: flex; align-items: center; justify-content: space-between; gap: 1.25rem; padding: 1rem 1.5rem; border: 1px solid var(--admin-theme-border); border-radius: 8px; background: var(--admin-theme-surface); box-shadow: var(--admin-theme-shadow); }
.manager-hero h1 { margin: 0; color: var(--admin-theme-contrast); font-size: 1.32rem; line-height: 1.2; }
.manager-title { display: grid; gap: 0.32rem; }
.manager-meta { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.content-grid { display: grid; gap: 1.1rem; margin-top: 1rem; }
.image-editor-grid { display: grid; grid-template-columns: minmax(300px, 0.72fr) minmax(360px, 1.28fr); gap: 1.25rem; padding: 1.5rem; }
.image-preview { overflow: hidden; border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 34%, var(--admin-theme-border)); border-radius: 7px; background: var(--admin-theme-surface); box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 8%, transparent), 0 12px 24px rgba(15, 95, 73, 0.11); }
.image-upload-panel { display: grid; gap: 0.75rem; align-content: start; }
.form-stack { display: grid; gap: 0.85rem; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.6rem 0.85rem; }
.form-grid .field-wide { grid-column: 1 / -1; }
.field-block { display: grid; gap: 0.35rem; }
.field-label { font-size: 0.75rem; font-weight: 700; color: var(--admin-theme-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.65rem; }
.stat-editor { border: 1px solid var(--admin-theme-border); border-radius: 8px; padding: 1rem; margin-bottom: 0.65rem; background: var(--admin-theme-surface); }
.stat-editor-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem; }
.stat-editor-num { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--admin-theme-gold); }
.sections-list { display: grid; gap: 0.65rem; }
.section-edit-card { border: 1px solid var(--admin-theme-border); border-radius: 8px; background: var(--admin-theme-surface); overflow: hidden; transition: border-color 0.15s ease; }
.section-edit-card:hover { border-color: color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border)); }
.sec-summary { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; cursor: pointer; user-select: none; list-style: none; }
.sec-summary::-webkit-details-marker { display: none; }
.sec-summary-left { display: flex; align-items: center; gap: 0.7rem; }
.sec-badge { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--admin-theme-gold); background: color-mix(in srgb, var(--admin-theme-gold) 12%, transparent); padding: 0.15rem 0.5rem; border-radius: 4px; }
.sec-heading-preview { font-size: 0.88rem; font-weight: 600; color: var(--admin-theme-contrast); }
.sec-chevron { color: var(--admin-theme-muted); transition: transform 0.2s ease; }
details[open] .sec-chevron { transform: rotate(180deg); }
.sec-body { padding: 0 1rem 1rem; display: grid; gap: 0.65rem; }
.item-preview { border: 1px solid var(--admin-theme-border); border-radius: 6px; padding: 0.75rem; background: var(--admin-theme-surface-soft); }
.item-chips { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.3rem; }
@media (min-width: 900px) { .live-dash.sidebar-open { padding-left: 260px; } }
@media (max-width: 900px) { .manager-main { padding: 1rem; padding-top: calc(60px + 1rem); } .manager-hero { flex-direction: column; align-items: stretch; } .hero-actions { width: 100%; } .image-editor-grid { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } }
</style>
