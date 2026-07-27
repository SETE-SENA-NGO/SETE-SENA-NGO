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
import { useAdminTheme } from '@/composables/useAdminTheme'
import { supabase } from '@/lib/supabase'
import { useContentStore } from '@/stores/content.store'
import { useUiStore } from '@/stores/ui.store'

const ui = useUiStore()
const contentStore = useContentStore()
const { locale } = useI18n()

useAdminTheme()

/* ─── Types ─────────────────────────────────────── */
interface StatItem { number: string; label: string; description: string }
interface EditableSection { id: string; label: string; heading: string; body: string; items: string }
interface InitiativeItem { title: string; text: string; img: string; tag: string }
interface ProcessStep { number: string; title: string; icon: string; text: string }
interface GalleryImage { src: string; caption: string; span: string }
interface CTAContent { label: string; heading: string; description: string; primaryBtnText: string; primaryBtnUrl: string; secondaryBtnText: string; secondaryBtnUrl: string }
interface QuoteContent { text: string; cite: string }
interface PartnerItem { name: string; type: string; description: string }
interface PageDraft { slug: string; title: string; eyebrow: string; headline: string; intro: string; heroImageUrl: string; sections: EditableSection[]; updatedAt: string }

/* ─── Defaults ──────────────────────────────────── */
function createDefault(): PageDraft {
  return {
    slug: 'programs-environment', title: 'Environment', eyebrow: 'Environment',
    headline: 'Protecting the land that sustains villages.',
    intro: 'Community forestry, biogas digesters, rainwater harvesting and WASH — climate resilience built one household at a time.',
    heroImageUrl: '', sections: [
      { id: 'environment-work', label: 'What we do', heading: 'What we do', body: 'Community forestry, biogas digesters, rainwater harvesting and WASH.', items: 'Community forestry agreements\nBiogas digester installation\nRainwater harvesting systems\nWASH facilities in schools and clinics\nTree nursery support and reforestation' },
      { id: 'environment-approach', label: 'Approach', heading: 'Our approach', body: 'Our approach combines scientific expertise with community participation to create lasting environmental change.', items: '' },
      { id: 'environment-team', label: 'Organizational Structure', heading: 'Who delivers environment programs', body: 'Our dedicated team works across provinces protecting forests.', items: 'Program Director | compass | Oversees environmental programs.\nField Coordinators | map | Manage community forestry, biogas, and WASH projects.\nConservation Trainers | heart | Deliver climate-smart agriculture and reforestation.\nWASH Officers | chart | Implement clean water and sanitation solutions.' },
      { id: 'environment-why', label: 'Why it matters', heading: 'Why it matters', body: 'Southeastern Cambodia is one of the most climate-vulnerable regions.', items: 'Deforestation leaves communities exposed to floods and droughts\nClean water access prevents disease and keeps children in school\nRenewable energy reduces dependence on charcoal and firewood\nCommunity forests protect biodiversity for future generations' },
    ], updatedAt: '',
  }
}

/* ─── State ─────────────────────────────────────── */
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const storageMode = ref<'supabase' | 'local'>('supabase')
const STORAGE_KEY = 'env-dashboard-page'

const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

const page = ref<PageDraft>(createDefault())
const statsBand = ref<StatItem[]>([
  { number: '571', label: 'HECTARES PROTECTED', description: 'Community forest agreements and restored land.' },
  { number: '18', label: 'VILLAGES SERVED', description: 'With biogas, water access and climate adaptation.' },
  { number: '2,500+', label: 'HOUSEHOLDS REACHED', description: 'With clean water and renewable energy solutions.' },
])
const initiatives = ref<InitiativeItem[]>([
  { title: 'Reforestation Projects', text: 'Planting native tree species to restore degraded forests.', img: '', tag: 'Conservation' },
  { title: 'Environmental Education', text: 'Developing curriculum and training programs for schools.', img: '', tag: 'Education' },
  { title: 'Renewable Energy Access', text: 'Installing solar panels and clean energy solutions in rural communities.', img: '', tag: 'Energy' },
  { title: 'Water Conservation', text: 'Implementing rainwater harvesting and water purification systems.', img: '', tag: 'Water' },
  { title: 'Sustainable Agriculture', text: 'Training farmers in organic farming and agroforestry techniques.', img: '', tag: 'Agriculture' },
  { title: 'Climate Research & Advocacy', text: 'Conducting climate impact assessments and advocating for policy changes.', img: '', tag: 'Research' },
])
const processSteps = ref<ProcessStep[]>([
  { number: '01', title: 'Assessment', icon: 'search', text: 'We conduct comprehensive environmental assessments to understand local ecosystems.' },
  { number: '02', title: 'Planning', icon: 'map', text: 'Working with community leaders, we develop tailored action plans.' },
  { number: '03', title: 'Implementation', icon: 'play', text: 'We execute projects with active community participation.' },
  { number: '04', title: 'Monitoring', icon: 'check', text: 'Continuous monitoring helps us measure impact and adapt strategies.' },
])
const galleryImages = ref<GalleryImage[]>([
  { src: '', caption: 'Reforestation in rural Cambodia', span: '2' },
  { src: '', caption: 'Forest canopy restoration', span: '1' },
  { src: '', caption: 'Community tree nursery', span: '1' },
  { src: '', caption: 'Eco-tourism initiatives', span: '1' },
  { src: '', caption: 'Nature conservation areas', span: '2' },
])
const ctaContent = ref<CTAContent>({ label: 'Take Action', heading: 'Join the Environmental Movement', description: 'Your contribution helps create a sustainable future.', primaryBtnText: 'Get Involved', primaryBtnUrl: '/get-involved', secondaryBtnText: 'Support Us', secondaryBtnUrl: '/get-involved/donate' })
const quoteContent = ref<QuoteContent>({ text: 'We do not inherit the earth from our ancestors; we borrow it from our children.', cite: '— SETE SENA Environmental Team' })
const partners = ref<PartnerItem[]>([
  { name: 'UN Environment', type: 'International Partner', description: '' },
  { name: 'Green Cambodia', type: 'Local NGO', description: '' },
  { name: 'Eco Foundation', type: 'Funding Partner', description: '' },
  { name: 'Wildlife Alliance', type: 'Conservation Partner', description: '' },
  { name: 'Solar Future', type: 'Technology Partner', description: '' },
  { name: 'Rainforest Trust', type: 'Global Supporter', description: '' },
])

const draft = reactive({
  eyebrow: page.value.eyebrow,
  headline: page.value.headline,
  intro: page.value.intro,
  heroImageUrl: page.value.heroImageUrl,
  sections: page.value.sections.map((s) => ({ ...s })),
})

const {
  editingSections, collapsedSections, toggleCollapse, toggleEdit, cancelEdit,
  setupSectionWatch, stopSectionWatch, resetEditingState,
} = useSectionEditor([
  { key: 'hero', getSnapshot: () => ({ eyebrow: draft.eyebrow, headline: draft.headline, intro: draft.intro, heroImageUrl: draft.heroImageUrl, statsBand: JSON.parse(JSON.stringify(statsBand.value)) }), applySnapshot: (v) => { draft.eyebrow = v.eyebrow; draft.headline = v.headline; draft.intro = v.intro; draft.heroImageUrl = v.heroImageUrl; statsBand.value = v.statsBand } },
  { key: 'sections', getSnapshot: () => draft.sections.map((s) => ({ ...s })), applySnapshot: (v) => { draft.sections = v } },
  { key: 'initiatives', getSnapshot: () => JSON.parse(JSON.stringify(initiatives.value)), applySnapshot: (v) => { initiatives.value = v } },
  { key: 'process', getSnapshot: () => JSON.parse(JSON.stringify(processSteps.value)), applySnapshot: (v) => { processSteps.value = v } },
  { key: 'gallery', getSnapshot: () => JSON.parse(JSON.stringify(galleryImages.value)), applySnapshot: (v) => { galleryImages.value = v } },
  { key: 'partners', getSnapshot: () => JSON.parse(JSON.stringify(partners.value)), applySnapshot: (v) => { partners.value = v } },
  { key: 'cta', getSnapshot: () => ({ ...ctaContent.value, ...quoteContent.value }), applySnapshot: (v) => { ctaContent.value = { label: v.label, heading: v.heading, description: v.description, primaryBtnText: v.primaryBtnText, primaryBtnUrl: v.primaryBtnUrl, secondaryBtnText: v.secondaryBtnText, secondaryBtnUrl: v.secondaryBtnUrl }; quoteContent.value = { text: v.text, cite: v.cite } } },
])

const originalSnapshot = ref('')
const hasChanges = computed(() => {
  const current = JSON.stringify({ eyebrow: draft.eyebrow, headline: draft.headline, intro: draft.intro, heroImageUrl: draft.heroImageUrl, sections: draft.sections.map((s) => ({ ...s })), statsBand: statsBand.value.map((s) => ({ ...s })), initiatives: initiatives.value.map((s) => ({ ...s })), processSteps: processSteps.value.map((s) => ({ ...s })), galleryImages: galleryImages.value.map((s) => ({ ...s })), ctaContent: { ...ctaContent.value }, quoteContent: { ...quoteContent.value }, partners: partners.value.map((s) => ({ ...s })) })
  return current !== originalSnapshot.value
})
function updateSnapshot() {
  originalSnapshot.value = JSON.stringify({ eyebrow: draft.eyebrow, headline: draft.headline, intro: draft.intro, heroImageUrl: draft.heroImageUrl, sections: draft.sections.map((s) => ({ ...s })), statsBand: statsBand.value.map((s) => ({ ...s })), initiatives: initiatives.value.map((s) => ({ ...s })), processSteps: processSteps.value.map((s) => ({ ...s })), galleryImages: galleryImages.value.map((s) => ({ ...s })), ctaContent: { ...ctaContent.value }, quoteContent: { ...quoteContent.value }, partners: partners.value.map((s) => ({ ...s })) })
}

const sections = [
  { id: 'env-hero', label: 'Hero & Stats', icon: 'mdi-creation' },
  { id: 'env-sections', label: 'Page Sections', icon: 'mdi-view-grid' },
  { id: 'env-initiatives', label: 'Initiatives', icon: 'mdi-flower' },
  { id: 'env-process', label: 'Process', icon: 'mdi-check-circle' },
  { id: 'env-gallery', label: 'Gallery', icon: 'mdi-image-multiple' },
  { id: 'env-partners', label: 'Our Support', icon: 'mdi-handshake' },
  { id: 'env-cta', label: 'CTA & Quote', icon: 'mdi-flag' },
] as const

const { activeSection, scrollToSection, updateActiveSectionFromScroll } = useScrollSpyNav(sections)
useUnsavedChangesGuard(hasChanges)

/* ─── Data persistence ─────────────────────────── */
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
      if (Array.isArray(s.initiatives)) initiatives.value = s.initiatives as InitiativeItem[]
      if (Array.isArray(s.processSteps)) processSteps.value = s.processSteps as ProcessStep[]
      if (Array.isArray(s.galleryImages)) galleryImages.value = s.galleryImages as GalleryImage[]
      if (s.ctaContent && typeof s.ctaContent === 'object') ctaContent.value = { ...ctaContent.value, ...s.ctaContent as Partial<CTAContent> }
      if (s.quoteContent && typeof s.quoteContent === 'object') quoteContent.value = { ...quoteContent.value, ...s.quoteContent as Partial<QuoteContent> }
      if (Array.isArray(s.partners)) partners.value = s.partners as PartnerItem[]
    }
  } catch { /* ignore */ }
}

function saveToLocalStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      eyebrow: draft.eyebrow, headline: draft.headline, intro: draft.intro, heroImageUrl: draft.heroImageUrl,
      sections: draft.sections, statsBand: statsBand.value, initiatives: initiatives.value,
      processSteps: processSteps.value, galleryImages: galleryImages.value, ctaContent: ctaContent.value,
      quoteContent: quoteContent.value, partners: partners.value,
    }))
  } catch { /* ignore */ }
}

async function loadPageContent() {
  resetEditingState()
  loading.value = true
  loadError.value = ''
  try {
    const { data, error } = await supabase.from('programs').select('title, summary, description, metadata, updated_at').eq('slug', 'programs-environment').maybeSingle()
    if (error) { console.warn(error.message); loadFromLocalStorage(); storageMode.value = 'local'; updateSnapshot(); loading.value = false; return }
    if (data) {
      const defs = createDefault()
      const m = data.metadata as Record<string, unknown> | null
      draft.eyebrow = (m?.eyebrow as string) || defs.eyebrow
      draft.headline = (m?.headline as string) || defs.headline
      draft.intro = data.summary || (m?.intro as string) || defs.intro
      draft.heroImageUrl = (m?.heroImageUrl as string) || ''
      draft.sections = m?.sections && Array.isArray(m.sections) ? mergeSectionsWithDefaults(m.sections as EditableSection[], defs.sections) : defs.sections.map((s) => ({ ...s }))
      if (Array.isArray(m?.statsBand)) statsBand.value = m.statsBand as StatItem[]
      if (Array.isArray(m?.initiatives)) initiatives.value = m.initiatives as InitiativeItem[]
      if (Array.isArray(m?.processSteps)) processSteps.value = m.processSteps as ProcessStep[]
      if (Array.isArray(m?.galleryImages)) galleryImages.value = m.galleryImages as GalleryImage[]
      if (m?.ctaContent && typeof m.ctaContent === 'object') ctaContent.value = { ...ctaContent.value, ...m.ctaContent as Partial<CTAContent> }
      if (m?.quoteContent && typeof m.quoteContent === 'object') quoteContent.value = { ...quoteContent.value, ...m.quoteContent as Partial<QuoteContent> }
      if (Array.isArray(m?.partners)) partners.value = m.partners as PartnerItem[]
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
    const payload = {
      slug: 'programs-environment', title: draft.headline.trim() || draft.slug, pillar: 'Environment',
      summary: draft.intro || '', description: draft.intro || '', status: 'published',
      metadata: { eyebrow: draft.eyebrow, headline: draft.headline, intro: draft.intro, heroImageUrl: draft.heroImageUrl, sections: draft.sections.map((s) => ({ id: s.id, label: s.label, heading: s.heading, body: s.body, items: s.items })), statsBand: statsBand.value, initiatives: initiatives.value, processSteps: processSteps.value, galleryImages: galleryImages.value, ctaContent: ctaContent.value, quoteContent: quoteContent.value, partners: partners.value },
      updated_at: new Date().toISOString(),
    }
    saveToLocalStorage()
    let { error } = await supabase.from('programs').upsert(payload, { onConflict: 'slug' })
    if (error && error.message?.includes('row-level security')) {
      const { error: ie } = await supabase.from('programs').insert(payload)
      if (ie && ie.message?.includes('duplicate key')) {
        const { error: ue } = await supabase.from('programs').update(payload).eq('slug', 'programs-environment')
        if (!ue) error = null; else error = ue
      } else if (!ie) { error = null } else { error = ie }
    }
    if (error) { console.warn(error.message); ui.addToast(`DB write blocked: ${error.message}`, 'error'); saveToLocalStorage(); storageMode.value = 'local'; updateSnapshot(); saving.value = false; return }
    storageMode.value = 'supabase'; updateSnapshot(); ui.addToast('Environment page saved!', 'success')
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
  <v-app :class="['env-dash', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Environment Dashboard</h1>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/programs/environment" target="_blank"><v-icon start>mdi-open-in-new</v-icon>View page</v-btn>
          </div>
        </header>

        <v-fade-transition mode="out-in" @after-enter="updateActiveSectionFromScroll">
          <div v-if="loading" key="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading Environment content...</span>
          </div>
          <div v-else-if="loadError" key="error">
            <v-alert type="error" variant="tonal" closable @click:close="loadError = ''">
              <template #title>Could not load content</template>
              <div class="d-flex align-center justify-space-between ga-2"><span>{{ loadError }}</span><v-btn variant="tonal" size="small" @click="loadPageContent">Try again</v-btn></div>
            </v-alert>
          </div>

          <div v-else key="content" class="content-grid">
            <AdminSectionNav :sections="sections" :active-section="activeSection" :has-changes="hasChanges" :saving="saving" aria-label="Environment page sections" save-label="Save Change" @navigate="scrollToSection" @save="savePageContent" />

            <!-- ── HERO & STATS ── -->
            <AdminEditorPanel :id="sections[0].id" kicker="Hero & Stats" heading="Headline, intro & stats band" :editing="!!editingSections.hero" :collapsed="collapsedSections.hero" @toggle-edit="toggleEdit('hero')" @cancel="cancelEdit('hero')" @toggle-collapse="toggleCollapse('hero')">
              <div class="image-editor-grid">
                <div class="image-upload-panel">
                  <v-img :src="draft.heroImageUrl || '/images/programs/hero-2.jpg'" aspect-ratio="1.6" cover class="image-preview hero-preview" />
                  <div class="field-block">
                    <span class="field-label">Hero Image</span>
                    <ImagePickerField v-model="draft.heroImageUrl" label="Hero Image" hint="Background image" :disabled="!editingSections.hero" @success="(msg) => ui.addToast(msg, 'success')" @error="(msg) => ui.addToast(msg, 'error')" />
                  </div>
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
                    <v-text-field v-model="stat.number" label="Number" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" placeholder="e.g. 571" />
                    <v-text-field v-model="stat.label" label="Label" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" placeholder="e.g. HECTARES PROTECTED" />
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
                      <summary class="sec-summary">
                        <div class="sec-summary-left"><span class="sec-badge">{{ section.label }}</span><span class="sec-heading-preview">{{ section.heading || 'No heading' }}</span></div>
                        <v-icon class="sec-chevron">mdi-chevron-down</v-icon>
                      </summary>
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

            <!-- ── INITIATIVES ── -->
            <AdminEditorPanel :id="sections[2].id" kicker="Initiatives" heading="Key initiative cards with images" :editing="!!editingSections.initiatives" :collapsed="collapsedSections.initiatives" @toggle-edit="toggleEdit('initiatives')" @cancel="cancelEdit('initiatives')" @toggle-collapse="toggleCollapse('initiatives')">
              <div class="pa-4">
                <div v-for="(item, index) in initiatives" :key="index" class="sub-editor-card">
                  <div class="sub-editor-hdr"><span class="sub-num">Initiative {{ index + 1 }}</span><v-btn v-if="editingSections.initiatives" icon color="error" variant="tonal" size="x-small" @click="initiatives.splice(index, 1)"><v-icon>mdi-delete</v-icon></v-btn></div>
                  <div class="form-row">
                    <v-text-field v-model="item.title" label="Title" :disabled="!editingSections.initiatives" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="item.tag" label="Tag" :disabled="!editingSections.initiatives" hide-details density="comfortable" variant="outlined" />
                  </div>
                  <v-textarea v-model="item.text" label="Description" rows="2" :disabled="!editingSections.initiatives" hide-details density="comfortable" variant="outlined" class="mt-2 field-wide" />
                  <div class="field-block mt-2">
                    <span class="field-label">Image</span>
                    <ImagePickerField v-model="item.img" :label="item.title || `Initiative ${index + 1}`" :disabled="!editingSections.initiatives" @success="(msg) => ui.addToast(msg, 'success')" @error="(msg) => ui.addToast(msg, 'error')" />
                  </div>
                </div>
                <v-btn v-if="editingSections.initiatives" color="accent" variant="tonal" size="small" class="mt-2" @click="initiatives.push({ title: '', text: '', img: '', tag: '' })"><v-icon start>mdi-plus</v-icon>Add Initiative</v-btn>
              </div>
            </AdminEditorPanel>

            <!-- ── PROCESS ── -->
            <AdminEditorPanel :id="sections[3].id" kicker="Process" heading="Steps for how we work" :editing="!!editingSections.process" :collapsed="collapsedSections.process" @toggle-edit="toggleEdit('process')" @cancel="cancelEdit('process')" @toggle-collapse="toggleCollapse('process')">
              <div class="pa-4">
                <div v-for="(step, index) in processSteps" :key="index" class="sub-editor-card">
                  <div class="sub-editor-hdr"><span class="sub-num">Step {{ step.number || index + 1 }}</span><v-btn v-if="editingSections.process" icon color="error" variant="tonal" size="x-small" @click="processSteps.splice(index, 1)"><v-icon>mdi-delete</v-icon></v-btn></div>
                  <div class="form-row">
                    <v-text-field v-model="step.number" label="Number" :disabled="!editingSections.process" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="step.title" label="Title" :disabled="!editingSections.process" hide-details density="comfortable" variant="outlined" />
                    <v-select v-model="step.icon" label="Icon" :items="[{value:'search',title:'Search'},{value:'map',title:'Map'},{value:'play',title:'Play'},{value:'check',title:'Check'}]" :disabled="!editingSections.process" hide-details density="comfortable" variant="outlined" item-title="title" item-value="value" />
                  </div>
                  <v-textarea v-model="step.text" label="Description" rows="2" :disabled="!editingSections.process" hide-details density="comfortable" variant="outlined" class="mt-2" />
                </div>
                <v-btn v-if="editingSections.process" color="accent" variant="tonal" size="small" class="mt-2" @click="processSteps.push({ number: '', title: '', icon: 'search', text: '' })"><v-icon start>mdi-plus</v-icon>Add Step</v-btn>
              </div>
            </AdminEditorPanel>

            <!-- ── GALLERY ── -->
            <AdminEditorPanel :id="sections[4].id" kicker="Gallery" heading="Gallery images with captions" :editing="!!editingSections.gallery" :collapsed="collapsedSections.gallery" @toggle-edit="toggleEdit('gallery')" @cancel="cancelEdit('gallery')" @toggle-collapse="toggleCollapse('gallery')">
              <div class="pa-4">
                <div v-for="(img, index) in galleryImages" :key="index" class="sub-editor-card">
                  <div class="sub-editor-hdr"><span class="sub-num">Image {{ index + 1 }}<v-chip v-if="img.span === '2'" size="x-small" color="primary" variant="tonal" class="ml-2">Wide</v-chip></span><v-btn v-if="editingSections.gallery" icon color="error" variant="tonal" size="x-small" @click="galleryImages.splice(index, 1)"><v-icon>mdi-delete</v-icon></v-btn></div>
                  <div class="form-row">
                    <v-text-field v-model="img.caption" label="Caption" :disabled="!editingSections.gallery" hide-details density="comfortable" variant="outlined" />
                    <v-select v-model="img.span" label="Span" :items="[{value:'1',title:'1 column'},{value:'2',title:'2 columns'}]" :disabled="!editingSections.gallery" hide-details density="comfortable" variant="outlined" item-title="title" item-value="value" />
                  </div>
                  <div class="field-block mt-2">
                    <span class="field-label">Gallery Image</span>
                    <ImagePickerField v-model="img.src" :label="img.caption || `Gallery Image ${index + 1}`" :disabled="!editingSections.gallery" @success="(msg) => ui.addToast(msg, 'success')" @error="(msg) => ui.addToast(msg, 'error')" />
                  </div>
                </div>
                <v-btn v-if="editingSections.gallery" color="accent" variant="tonal" size="small" class="mt-2" @click="galleryImages.push({ src: '', caption: '', span: '1' })"><v-icon start>mdi-plus</v-icon>Add Image</v-btn>
              </div>
            </AdminEditorPanel>

            <!-- ── PARTNERS ── -->
            <AdminEditorPanel :id="sections[5].id" kicker="Our Support" heading="Partner organizations" :editing="!!editingSections.partners" :collapsed="collapsedSections.partners" @toggle-edit="toggleEdit('partners')" @cancel="cancelEdit('partners')" @toggle-collapse="toggleCollapse('partners')">
              <div class="pa-4">
                <div v-for="(partner, index) in partners" :key="index" class="sub-editor-card">
                  <div class="sub-editor-hdr"><span class="sub-num">Partner {{ index + 1 }}</span><v-btn v-if="editingSections.partners" icon color="error" variant="tonal" size="x-small" @click="partners.splice(index, 1)"><v-icon>mdi-delete</v-icon></v-btn></div>
                  <div class="form-row">
                    <v-text-field v-model="partner.name" label="Name" :disabled="!editingSections.partners" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="partner.type" label="Type" :disabled="!editingSections.partners" hide-details density="comfortable" variant="outlined" />
                  </div>
                  <v-textarea v-model="partner.description" label="Description (optional)" rows="2" :disabled="!editingSections.partners" hide-details density="comfortable" variant="outlined" class="mt-2" />
                </div>
                <v-btn v-if="editingSections.partners" color="accent" variant="tonal" size="small" class="mt-2" @click="partners.push({ name: '', type: '', description: '' })"><v-icon start>mdi-plus</v-icon>Add Partner</v-btn>
              </div>
            </AdminEditorPanel>

            <!-- ── CTA & QUOTE ── -->
            <AdminEditorPanel :id="sections[6].id" kicker="CTA & Quote" heading="Call to action & testimonial" :editing="!!editingSections.cta" :collapsed="collapsedSections.cta" @toggle-edit="toggleEdit('cta')" @cancel="cancelEdit('cta')" @toggle-collapse="toggleCollapse('cta')">
              <div class="pa-4">
                <h3 class="text-h6 font-weight-bold mb-3">Quote / Testimonial</h3>
                <v-textarea v-model="quoteContent.text" label="Quote Text" rows="3" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
                <v-text-field v-model="quoteContent.cite" label="Citation / Author" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" class="mt-3" />
                <v-divider class="my-4" />
                <h3 class="text-h6 font-weight-bold mb-3">CTA Section</h3>
                <div class="form-row">
                  <v-text-field v-model="ctaContent.label" label="Label / Eyebrow" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="ctaContent.heading" label="Heading" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
                </div>
                <v-textarea v-model="ctaContent.description" label="Description" rows="2" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" class="mt-2" />
                <div class="form-row mt-2">
                  <v-text-field v-model="ctaContent.primaryBtnText" label="Primary Button Text" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="ctaContent.primaryBtnUrl" label="Primary Button URL" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
                </div>
                <div class="form-row mt-2">
                  <v-text-field v-model="ctaContent.secondaryBtnText" label="Secondary Button Text" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="ctaContent.secondaryBtnUrl" label="Secondary Button URL" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
                </div>
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
.env-dash { min-height: 100vh; background: var(--admin-bg); color: var(--admin-text); transition: padding-left 0.25s ease; }
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
.stat-editor-num { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--admin-theme-primary); }
.sections-list { display: grid; gap: 0.65rem; }
.section-edit-card { border: 1px solid var(--admin-theme-border); border-radius: 8px; background: var(--admin-theme-surface); overflow: hidden; transition: border-color 0.15s ease; }
.section-edit-card:hover { border-color: color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border)); }
.sec-summary { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; cursor: pointer; user-select: none; list-style: none; }
.sec-summary::-webkit-details-marker { display: none; }
.sec-summary-left { display: flex; align-items: center; gap: 0.7rem; }
.sec-badge { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--admin-theme-primary); background: color-mix(in srgb, var(--admin-theme-primary) 12%, transparent); padding: 0.15rem 0.5rem; border-radius: 4px; }
.sec-heading-preview { font-size: 0.88rem; font-weight: 600; color: var(--admin-theme-contrast); }
.sec-chevron { color: var(--admin-theme-muted); transition: transform 0.2s ease; }
details[open] .sec-chevron { transform: rotate(180deg); }
.sec-body { padding: 0 1rem 1rem; display: grid; gap: 0.65rem; }
.item-preview { border: 1px solid var(--admin-theme-border); border-radius: 6px; padding: 0.75rem; background: var(--admin-theme-surface-soft); }
.item-chips { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.3rem; }
.sub-editor-card { border: 1px solid var(--admin-theme-border); border-radius: 8px; padding: 1rem; margin-bottom: 0.65rem; background: var(--admin-theme-surface); }
.sub-editor-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem; }
.sub-num { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--admin-theme-primary); }
@media (min-width: 900px) { .env-dash.sidebar-open { padding-left: 260px; } }
@media (max-width: 900px) { .manager-main { padding: 1rem; padding-top: calc(60px + 1rem); } .manager-hero { flex-direction: column; align-items: stretch; } .hero-actions { width: 100%; } .image-editor-grid { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } }
</style>
