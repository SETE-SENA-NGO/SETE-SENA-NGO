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
import { useAuthStore } from '@/stores/auth.store'

const ui = useUiStore()
const auth = useAuthStore()
const contentStore = useContentStore()
const { locale } = useI18n()

useAdminTheme()

/* ─── Types ─────────────────────────────────────── */
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

const IMAGE_MAP: { field: string; label: string }[] = [
  { field: 'introImageUrl', label: 'Intro Section Image' },
  { field: 'readingImageUrl', label: 'What We Do — Reading Image' },
  { field: 'teacherImageUrl', label: 'What We Do — Teacher Image' },
  { field: 'studyImageUrl', label: 'Why It Matters — Study Image' },
]

let _idCounter = 0
function genId() { return `img-${++_idCounter}-${Date.now()}` }

/* ─── State ─────────────────────────────────────── */
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const originalSnapshot = ref('')
const storageMode = ref<'supabase' | 'local'>('supabase')
const STORAGE_KEY = 'edu-dashboard-page'

const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

const galleryImages = ref<GalleryImage[]>(
  IMAGE_MAP.map((m) => ({ id: genId(), label: m.label, url: '' })),
)

const statsBand = ref<StatItem[]>([
  { number: '120+', label: 'PRE-SCHOOL CHILDREN', description: 'Enrolled each year across remote villages.' },
  { number: '8', label: 'MOBILE LIBRARIES', description: 'Reaching villages with no school library.' },
  { number: '60+', label: 'ANNUAL SCHOLARSHIPS', description: 'For the poorest students — especially girls.' },
])

const teamCards = ref<TeamCard[]>([
  { role: 'Program Director', icon: 'compass', desc: 'Oversees education initiatives, partnerships, and donor reporting.' },
  { role: 'Field Coordinators', icon: 'map', desc: 'Manage pre-school, library and scholarship programs in each province.' },
  { role: 'Teachers & Facilitators', icon: 'heart', desc: 'Deliver early learning, literacy sessions and youth clubs.' },
  { role: 'Monitoring & Evaluation', icon: 'chart', desc: 'Tracks learning progress, attendance and community outcomes.' },
])

function defaultSections(): EditableSection[] {
  return [
    {
      id: 'education-work',
      label: 'What we do',
      heading: 'What we do',
      body: 'Community pre-schools led by trained local teachers, mobile libraries reaching remote villages, scholarships for the poorest students.',
      items: 'Community pre-schools led by trained local teachers in remote villages\nMobile library service bringing books, audio and learning kits to children\nScholarships covering uniforms, supplies and transport for the poorest students\nBuddhist moral education and life-skills classes in pagoda settings\nYouth peer-educator groups on health, environment and child rights\nTeacher training and parent engagement to keep children in school',
    },
    {
      id: 'education-approach',
      label: 'Approach',
      heading: 'Our approach',
      body: 'We hire teachers from the villages we serve, train them in early-childhood pedagogy, and pair every classroom with a parent committee.',
      items: '',
    },
    {
      id: 'education-why',
      label: 'Why it matters',
      heading: 'Why it matters',
      body: 'Children who attend pre-school are far more likely to complete primary and secondary school.',
      items: 'Children who attend pre-school are far more likely to complete primary and secondary school\nScholarships keep the poorest girls in class through the most vulnerable years\nMobile libraries reach children a bus route never will\nPagoda-based ethics classes preserve Khmer language and moral tradition',
    },
    {
      id: 'education-team',
      label: 'Organizational Structure',
      heading: 'Who delivers education on the ground',
      body: 'Our dedicated team works across provinces to ensure every child has access to quality education.',
      items: teamCards.value.map((c) => `${c.role} | ${c.icon} | ${c.desc}`).join('\n'),
    },
  ]
}

const draft = reactive({
  sections: defaultSections(),
})

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
    key: 'images',
    getSnapshot: () => JSON.parse(JSON.stringify(galleryImages.value)),
    applySnapshot: (value) => { galleryImages.value = value },
  },
  {
    key: 'stats',
    getSnapshot: () => statsBand.value.map((s) => ({ ...s })),
    applySnapshot: (value) => { statsBand.value = value },
  },
  {
    key: 'sections',
    getSnapshot: () => draft.sections.map((s) => ({ ...s })),
    applySnapshot: (value) => { draft.sections = value },
  },
  {
    key: 'team',
    getSnapshot: () => teamCards.value.map((c) => ({ ...c })),
    applySnapshot: (value) => { teamCards.value = value },
  },
])

const hasChanges = computed(() => {
  const current = JSON.stringify({
    galleryImages: galleryImages.value.map((g) => ({ ...g })),
    statsBand: statsBand.value.map((s) => ({ ...s })),
    sections: draft.sections.map((s) => ({ ...s })),
    teamCards: teamCards.value.map((c) => ({ ...c })),
  })
  return current !== originalSnapshot.value
})

function updateSnapshot() {
  originalSnapshot.value = JSON.stringify({
    galleryImages: galleryImages.value.map((g) => ({ ...g })),
    statsBand: statsBand.value.map((s) => ({ ...s })),
    sections: draft.sections.map((s) => ({ ...s })),
    teamCards: teamCards.value.map((c) => ({ ...c })),
  })
}

const sections = [
  { id: 'edu-images', label: 'Page Images', icon: 'mdi-image-outline' },
  { id: 'edu-stats', label: 'Stats Band', icon: 'mdi-chart-bar' },
  { id: 'edu-sections', label: 'What They Do', icon: 'mdi-view-grid' },
  { id: 'edu-team', label: 'Team Cards', icon: 'mdi-account-group' },
] as const

const { activeSection, scrollToSection, updateActiveSectionFromScroll } = useScrollSpyNav(sections)

useUnsavedChangesGuard(hasChanges)

/* ─── Data persistence ─────────────────────────── */
function saveToLocalStorage(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      galleryImages: galleryImages.value,
      sections: draft.sections,
      statsBand: statsBand.value,
      teamCards: teamCards.value,
    }))
  } catch { /* ignore */ }
}

function loadFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw) as Record<string, unknown>
    if (Array.isArray(saved.galleryImages)) {
      galleryImages.value = saved.galleryImages as GalleryImage[]
    }
    padGalleryToFour()
    if (Array.isArray(saved.statsBand)) statsBand.value = saved.statsBand as StatItem[]
    if (Array.isArray(saved.teamCards)) teamCards.value = saved.teamCards as TeamCard[]
  } catch { /* ignore */ }
}

function padGalleryToFour() {
  while (galleryImages.value.length < 4) {
    galleryImages.value.push({ id: genId(), label: IMAGE_MAP[galleryImages.value.length]?.label || `Image ${galleryImages.value.length + 1}`, url: '' })
  }
}

function parseTeamFromSection() {
  const section = draft.sections.find((s) => s.id === 'education-team')
  if (section?.items?.trim()) {
    const lines = section.items.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length > 0) {
      teamCards.value = lines.map((line) => {
        const parts = line.split('|').map((p) => p.trim())
        return { role: parts[0] || '', icon: parts[1] || 'chart', desc: parts[2] || parts[0] || '' }
      })
    }
  }
}

function saveTeamToSection() {
  const section = draft.sections.find((s) => s.id === 'education-team')
  if (section) {
    section.items = teamCards.value.map((c) => `${c.role} | ${c.icon} | ${c.desc}`).join('\n')
  }
}

function getImg(index: number) { return galleryImages.value[index] || null }

function onGalleryImageSaved(msg: string) {
  ui.addToast(msg, 'success')
  void savePageContent()
}

function clearGalleryImage(index: number) {
  const slotName = IMAGE_MAP[index]?.label || `Slot ${index + 1}`
  confirmDialog(`Remove image from "${slotName}"?`, 'This will show the default fallback on the public page.', () => {
    if (galleryImages.value[index]) galleryImages.value[index].url = ''
    ui.addToast(`Image cleared for "${slotName}"`, 'info')
    void savePageContent()
  })
}

function missingImageWarning(): string {
  const names: string[] = []
  if (!galleryImages.value[0]?.url?.trim()) names.push('Intro Section')
  if (!galleryImages.value[1]?.url?.trim()) names.push('What We Do — Reading')
  if (!galleryImages.value[2]?.url?.trim()) names.push('What We Do — Teacher')
  if (!galleryImages.value[3]?.url?.trim()) names.push('Why It Matters — Study')
  if (names.length === 0) return ''
  return `${names.length} image slot${names.length > 1 ? 's' : ''} missing: ${names.join(', ')}.`
}

async function loadPageContent() {
  resetEditingState()
  loading.value = true
  loadError.value = ''
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('title, summary, description, metadata, updated_at')
      .eq('slug', 'programs-education')
      .maybeSingle()

    if (error) {
      console.warn('Supabase load failed:', error.message)
      loadFromLocalStorage()
      storageMode.value = 'local'
      updateSnapshot()
      loading.value = false
      return
    }

    if (data?.metadata) {
      const meta = data.metadata as Record<string, unknown>
      const gallery = meta.gallery as GalleryImage[] | undefined
      if (Array.isArray(gallery) && gallery.length > 0) {
        galleryImages.value = gallery.map((g, i) => ({
          id: g.id || genId(),
          label: g.label?.trim() ? g.label : IMAGE_MAP[i]?.label || `Slot ${i + 1}`,
          url: g.url || '',
        }))
        padGalleryToFour()
      }
      if (Array.isArray(meta.statsBand)) statsBand.value = meta.statsBand as StatItem[]
      if (Array.isArray(meta.sections)) {
        const dbSections = meta.sections as EditableSection[]
        draft.sections = defaultSections().map((defSec) => {
          const match = dbSections.find((s) => s.id === defSec.id)
          return match ? { ...defSec, ...match } : defSec
        })
      }
      const teamSection = draft.sections.find((s) => s.id === 'education-team')
      if (teamSection) parseTeamFromSection()
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
    saveTeamToSection()
    const payload = {
      slug: 'programs-education',
      title: 'Education Program',
      pillar: 'Education',
      summary: 'Community pre-schools, mobile libraries, scholarships and Buddhist education.',
      description: 'Helping rural children keep learning through local teachers, libraries and family support.',
      status: 'published',
      metadata: {
        gallery: galleryImages.value,
        introImageUrl: galleryImages.value[0]?.url || '',
        readingImageUrl: galleryImages.value[1]?.url || '',
        teacherImageUrl: galleryImages.value[2]?.url || '',
        studyImageUrl: galleryImages.value[3]?.url || '',
        statsBand: statsBand.value,
        sections: draft.sections.map((s) => ({ id: s.id, label: s.label, heading: s.heading, body: s.body, items: s.items })),
      },
      updated_at: new Date().toISOString(),
    }
    saveToLocalStorage()

    let { error } = await supabase.from('programs').upsert(payload, { onConflict: 'slug' })
    if (error && error.message?.includes('row-level security')) {
      const { error: insertError } = await supabase.from('programs').insert(payload)
      if (insertError && insertError.message?.includes('duplicate key')) {
        const { error: updateError } = await supabase.from('programs').update(payload).eq('slug', 'programs-education')
        if (!updateError) error = null
        else error = updateError
      } else if (!insertError) {
        error = null
      } else {
        error = insertError
      }
    }
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
    ui.addToast('Education page saved!', 'success')
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

onMounted(() => {
  contentStore.useLocalFallback()
  void auth.init().catch(() => {})
  void loadPageContent()
})

onUnmounted(() => { stopSectionWatch() })
</script>

<template>
  <v-app :class="['edu-dash', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Education Dashboard</h1>
            <div class="manager-meta">
              <v-chip v-if="missingImageWarning()" size="small" variant="tonal" color="warning" :title="missingImageWarning()">
                <v-icon start size="x-small">mdi-alert</v-icon>
                Missing images
              </v-chip>
            </div>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/programs/education" target="_blank">
              <v-icon start>mdi-open-in-new</v-icon>
              View page
            </v-btn>
          </div>
        </header>

        <v-fade-transition mode="out-in" @after-enter="updateActiveSectionFromScroll">
          <div v-if="loading" key="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading Education content...</span>
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
              aria-label="Education page sections"
              save-label="Save Change"
              @navigate="scrollToSection"
              @save="savePageContent"
            />

            <!-- ── IMAGES ── -->
            <AdminEditorPanel
              :id="sections[0].id"
              kicker="Page Images"
              heading="Upload section images"
              :editing="!!editingSections.images"
              :collapsed="collapsedSections.images"
              @toggle-edit="toggleEdit('images')"
              @cancel="cancelEdit('images')"
              @toggle-collapse="toggleCollapse('images')"
            >
              <div class="pa-4">
                <p class="text-body-2 text-medium-emphasis mb-4">Each slot matches a section on the public Education page. Clear an image to show the default fallback.</p>
                <div class="img-grid">
                  <div v-for="(img, index) in galleryImages" :key="img.id" class="img-card" :class="{ 'img-set': !!img.url?.trim() }">
                    <div class="img-frame">
                      <template v-if="img.url?.trim()">
                        <img :src="img.url" :alt="img.label" class="img-preview" />
                        <v-btn v-if="editingSections.images" icon size="x-small" color="error" class="img-clear" @click="clearGalleryImage(index)" title="Remove image">
                          <v-icon size="small">mdi-delete</v-icon>
                        </v-btn>
                      </template>
                      <template v-else>
                        <div class="img-frame-empty">
                          <v-icon size="28" class="mb-1">mdi-image-outline</v-icon>
                          <span class="img-frame-empty-text">No image set</span>
                          <span class="img-frame-empty-hint">Fallback will be used</span>
                        </div>
                      </template>
                    </div>
                    <div class="img-card-body">
                      <div class="img-card-header">
                        <v-chip size="x-small" color="primary" variant="tonal">{{ img.label }}</v-chip>
                      </div>
                      <ImagePickerField
                        v-model="galleryImages[index].url"
                        :label="`Upload or paste URL`"
                        hide-preview
                        :disabled="!editingSections.images"
                        @success="onGalleryImageSaved"
                        @error="(msg) => ui.addToast(msg, 'error')"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AdminEditorPanel>

            <!-- ── STATS BAND ── -->
            <AdminEditorPanel
              :id="sections[1].id"
              kicker="Stats Band"
              heading="Statistics shown on the public page"
              :editing="!!editingSections.stats"
              :collapsed="collapsedSections.stats"
              @toggle-edit="toggleEdit('stats')"
              @cancel="cancelEdit('stats')"
              @toggle-collapse="toggleCollapse('stats')"
            >
              <div class="pa-4">
                <div v-for="(stat, index) in statsBand" :key="index" class="stat-editor">
                  <div class="stat-editor-hdr">
                    <span class="stat-editor-num">Stat {{ index + 1 }}</span>
                    <v-btn v-if="editingSections.stats" icon color="error" variant="tonal" size="x-small" @click="statsBand.splice(index, 1)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                  <div class="form-row">
                    <v-text-field v-model="stat.number" label="Number" :disabled="!editingSections.stats" hide-details density="comfortable" variant="outlined" placeholder="e.g. 120+" />
                    <v-text-field v-model="stat.label" label="Label" :disabled="!editingSections.stats" hide-details density="comfortable" variant="outlined" placeholder="e.g. PRE-SCHOOL CHILDREN" />
                  </div>
                  <v-text-field v-model="stat.description" label="Description" :disabled="!editingSections.stats" hide-details density="comfortable" variant="outlined" placeholder="Brief description" class="mt-2" />
                </div>
                <v-btn v-if="editingSections.stats" color="accent" variant="tonal" size="small" class="mt-2" @click="statsBand.push({ number: '', label: '', description: '' })">
                  <v-icon start>mdi-plus</v-icon>
                  Add Stat
                </v-btn>
              </div>
            </AdminEditorPanel>

            <!-- ── WHAT THEY DO ── -->
            <AdminEditorPanel
              :id="sections[2].id"
              kicker="What They Do"
              heading="Content sections"
              :editing="!!editingSections.sections"
              :collapsed="collapsedSections.sections"
              @toggle-edit="toggleEdit('sections')"
              @cancel="cancelEdit('sections')"
              @toggle-collapse="toggleCollapse('sections')"
            >
              <div class="pa-4">
                <div class="sections-list">
                  <div v-for="(section, index) in draft.sections.filter((s) => s.id !== 'education-team')" :key="section.id" class="section-edit-card">
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

            <!-- ── TEAM CARDS ── -->
            <AdminEditorPanel
              :id="sections[3].id"
              kicker="Team Cards"
              heading="Organizational structure"
              :editing="!!editingSections.team"
              :collapsed="collapsedSections.team"
              @toggle-edit="toggleEdit('team')"
              @cancel="cancelEdit('team')"
              @toggle-collapse="toggleCollapse('team')"
            >
              <div class="pa-4">
                <div v-for="(card, index) in teamCards" :key="index" class="sub-editor-card">
                  <div class="sub-editor-hdr">
                    <span class="sub-num">Card {{ index + 1 }}</span>
                    <v-btn v-if="editingSections.team" icon color="error" variant="tonal" size="x-small" @click="teamCards.splice(index, 1)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                  <div class="form-row">
                    <v-text-field v-model="card.role" label="Role / Title" :disabled="!editingSections.team" hide-details density="comfortable" variant="outlined" placeholder="e.g. Program Director" />
                    <v-select v-model="card.icon" label="Icon" :items="[{value:'compass',title:'Compass'},{value:'map',title:'Map'},{value:'heart',title:'Heart'},{value:'chart',title:'Chart'}]" :disabled="!editingSections.team" hide-details density="comfortable" variant="outlined" item-title="title" item-value="value" />
                  </div>
                  <v-textarea v-model="card.desc" label="Description" rows="2" :disabled="!editingSections.team" hide-details density="comfortable" variant="outlined" class="mt-2" />
                </div>
                <v-btn v-if="editingSections.team" color="accent" variant="tonal" size="small" class="mt-2" @click="teamCards.push({ role: '', icon: 'chart', desc: '' })">
                  <v-icon start>mdi-plus</v-icon>
                  Add Card
                </v-btn>
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
.edu-dash {
  min-height: 100vh;
  background: var(--admin-bg);
  color: var(--admin-text);
  transition: padding-left 0.25s ease;
}

.admin-layout { min-height: 100vh; }

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

.manager-title { display: grid; gap: 0.32rem; }
.manager-meta { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.content-grid { display: grid; gap: 1.1rem; margin-top: 1rem; }

/* ─── Image grid ─── */
.img-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.img-card { border: 1px solid var(--admin-theme-border); border-radius: 8px; overflow: hidden; background: var(--admin-theme-surface); transition: border-color 0.2s ease; }
.img-card:hover { border-color: color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border)); }
.img-card.img-set { border-color: color-mix(in srgb, var(--admin-theme-primary) 30%, var(--admin-theme-border)); }
.img-frame { position: relative; width: 100%; height: 150px; background: var(--admin-theme-surface-soft); overflow: hidden; }
.img-preview { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.img-card:hover .img-preview { transform: scale(1.04); }
.img-clear { position: absolute; top: 6px; right: 6px; }
.img-frame-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 0.2rem; color: var(--admin-theme-muted); opacity: 0.5; }
.img-frame-empty-text { font-size: 0.8rem; font-weight: 700; }
.img-frame-empty-hint { font-size: 0.65rem; font-style: italic; }
.img-card-body { padding: 0.75rem 0.85rem; display: grid; gap: 0.5rem; }
.img-card-header { display: flex; align-items: center; gap: 0.4rem; }
.img-path { font-size: 0.75rem; font-weight: 600; color: var(--admin-theme-muted); }

/* ─── Stats editor ─── */
.stat-editor { border: 1px solid var(--admin-theme-border); border-radius: 8px; padding: 1rem; margin-bottom: 0.65rem; background: var(--admin-theme-surface); }
.stat-editor-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem; }
.stat-editor-num { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--admin-theme-teal); }

/* ─── Sub editor (team cards) ─── */
.sub-editor-card { border: 1px solid var(--admin-theme-border); border-radius: 8px; padding: 1rem; margin-bottom: 0.65rem; background: var(--admin-theme-surface); }
.sub-editor-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem; }
.sub-num { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--admin-theme-primary); }

/* ─── Sections list ─── */
.sections-list { display: grid; gap: 0.65rem; }
.section-edit-card { border: 1px solid var(--admin-theme-border); border-radius: 8px; background: var(--admin-theme-surface); overflow: hidden; transition: border-color 0.15s ease; }
.section-edit-card:hover { border-color: color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border)); }
.sec-summary { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; cursor: pointer; user-select: none; list-style: none; }
.sec-summary::-webkit-details-marker { display: none; }
.sec-summary-left { display: flex; align-items: center; gap: 0.7rem; }
.sec-badge { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--admin-theme-teal); background: color-mix(in srgb, var(--admin-theme-teal) 12%, transparent); padding: 0.15rem 0.5rem; border-radius: 4px; }
.sec-heading-preview { font-size: 0.88rem; font-weight: 600; color: var(--admin-theme-contrast); }
.sec-chevron { color: var(--admin-theme-muted); transition: transform 0.2s ease; }
details[open] .sec-chevron { transform: rotate(180deg); }
.sec-body { padding: 0 1rem 1rem; display: grid; gap: 0.65rem; }
.item-preview { border: 1px solid var(--admin-theme-border); border-radius: 6px; padding: 0.75rem; background: var(--admin-theme-surface-soft); }
.item-chips { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.3rem; }

.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.65rem; }
.field-label { font-size: 0.75rem; font-weight: 700; color: var(--admin-theme-muted); text-transform: uppercase; letter-spacing: 0.04em; }

@media (max-width: 700px) { .img-grid { grid-template-columns: 1fr; } }
@media (min-width: 900px) { .edu-dash.sidebar-open { padding-left: 260px; } }
@media (max-width: 900px) {
  .manager-main { padding: 1rem; padding-top: calc(60px + 1rem); }
  .manager-hero { flex-direction: column; align-items: stretch; }
  .hero-actions { width: 100%; }
}
</style>
