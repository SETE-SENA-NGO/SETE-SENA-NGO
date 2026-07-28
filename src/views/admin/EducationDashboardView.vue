<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useAdminTheme } from '@/composables/useAdminTheme'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminEditorPanel from '@/components/admin/AdminEditorPanel.vue'
import AdminSectionNav from '@/components/admin/AdminSectionNav.vue'
import AdminUploadButton from '@/components/admin/AdminUploadButton.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import { useSectionEditor } from '@/composables/useSectionEditor'
import { useScrollSpyNav } from '@/composables/useScrollSpyNav'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { supabase } from '@/lib/supabase'
import { imageUrls } from '@/lib/imageUrls'
import { useUiStore } from '@/stores/ui.store'

const PROGRAM_SLUG = 'programs-education'
const MAX_STATS = 6
const MAX_TEAM_CARDS = 8
const MAX_LIST_ITEMS = 10
const TEAM_ICONS: string[] = ['compass', 'map', 'heart', 'chart']

type GalleryImage = { id: string; label: string; url: string }
type StatItem = { number: string; label: string; description: string }
type TeamCard = { role: string; icon: string; desc: string }

type EducationDraft = {
  hero: { title: string; intro: string }
  images: GalleryImage[]
  stats: StatItem[]
  workItems: string[]
  approachText: string
  whyItems: string[]
  team: TeamCard[]
}

const IMAGE_SLOTS = [
  { field: 'introImageUrl', label: 'Intro section image', description: 'Education intro image' },
  { field: 'readingImageUrl', label: 'What we do — reading image', description: 'Education reading image' },
  { field: 'teacherImageUrl', label: 'What we do — teacher image', description: 'Education teacher image' },
  { field: 'studyImageUrl', label: 'Why it matters — study image', description: 'Education study image' },
] as const

let idCounter = 0
function genId() {
  return `img-${++idCounter}-${Date.now()}`
}

function defaultImages(): GalleryImage[] {
  return [
    { id: genId(), label: IMAGE_SLOTS[0].label, url: imageUrls.education.intro },
    { id: genId(), label: IMAGE_SLOTS[1].label, url: imageUrls.education.reading },
    { id: genId(), label: IMAGE_SLOTS[2].label, url: imageUrls.education.teacher },
    { id: genId(), label: IMAGE_SLOTS[3].label, url: imageUrls.education.study },
  ]
}

const defaultContent: EducationDraft = {
  hero: {
    title: 'Access to Education',
    intro:
      'Community pre-schools, mobile libraries, scholarships for poor children and the preservation of Buddhist education in pagoda settings across rural Cambodia.',
  },
  images: defaultImages(),
  stats: [
    { number: '120+', label: 'PRE-SCHOOL CHILDREN', description: 'Enrolled each year across remote villages in Svay Rieng and Prey Veng.' },
    { number: '8', label: 'MOBILE LIBRARIES', description: 'Reaching villages with no school library or bookshop within 20 km.' },
    { number: '60+', label: 'ANNUAL SCHOLARSHIPS', description: 'For the poorest students at every level — especially girls.' },
  ],
  workItems: [
    'Community pre-schools led by trained local teachers in remote villages',
    'Mobile library service bringing books, audio and learning kits to children',
    'Scholarships covering uniforms, supplies and transport for the poorest students',
    'Buddhist moral education and life-skills classes in pagoda settings',
    'Youth peer-educator groups on health, environment and child rights',
    'Teacher training and parent engagement to keep children in school',
  ],
  approachText:
    'We hire teachers from the villages we serve, train them in early-childhood pedagogy, and pair every classroom with a parent committee. Curriculum blends the national standard with Buddhist ethics, Khmer culture and hands-on environmental learning — so a child grows up rooted in both the national curriculum and the wisdom of the pagoda.',
  whyItems: [
    'Children who attend pre-school are far more likely to complete primary and secondary school',
    'Scholarships keep the poorest girls in class through the most vulnerable years',
    'Mobile libraries reach children a bus route never will',
    'Pagoda-based ethics classes preserve Khmer language and moral tradition',
  ],
  team: [
    { role: 'Program Director', icon: 'compass', desc: 'Oversees education initiatives, partnerships, and donor reporting across all provinces.' },
    { role: 'Field Coordinators', icon: 'map', desc: 'Manage pre-school, library and scholarship programs in each province.' },
    { role: 'Teachers & Facilitators', icon: 'heart', desc: 'Deliver early learning, literacy sessions and youth clubs in village settings.' },
    { role: 'Monitoring & Evaluation', icon: 'chart', desc: 'Tracks learning progress, attendance and community outcomes.' },
  ],
}

function cloneContent(content: EducationDraft): EducationDraft {
  return {
    hero: { ...content.hero },
    images: content.images.map((img) => ({ ...img })),
    stats: content.stats.map((s) => ({ ...s })),
    workItems: [...content.workItems],
    approachText: content.approachText,
    whyItems: [...content.whyItems],
    team: content.team.map((t) => ({ ...t })),
  }
}

const ui = useUiStore()
useAdminTheme()

const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

const loading = ref(false)
const saving = ref(false)
const storageMode = ref<'supabase' | 'local'>('supabase')
const updatedAt = ref('')
// Holds metadata keys not managed by this dashboard so saving here never clobbers them.
const rawMetadata = ref<Record<string, unknown>>({})

const draft = reactive<EducationDraft>(cloneContent(defaultContent))

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
    key: 'header',
    getSnapshot: () => ({ ...draft.hero }),
    applySnapshot: (value) => { draft.hero = value },
  },
  {
    key: 'images',
    getSnapshot: () => draft.images.map((img) => ({ ...img })),
    applySnapshot: (value) => { draft.images = value },
  },
  {
    key: 'stats',
    getSnapshot: () => draft.stats.map((s) => ({ ...s })),
    applySnapshot: (value) => { draft.stats = value },
  },
  {
    key: 'content',
    getSnapshot: () => ({
      workItems: [...draft.workItems],
      approachText: draft.approachText,
      whyItems: [...draft.whyItems],
    }),
    applySnapshot: (value) => {
      draft.workItems = value.workItems
      draft.approachText = value.approachText
      draft.whyItems = value.whyItems
    },
  },
  {
    key: 'team',
    getSnapshot: () => draft.team.map((t) => ({ ...t })),
    applySnapshot: (value) => { draft.team = value },
  },
])

const originalSnapshot = ref('')
const hasChanges = computed(() => JSON.stringify(cloneContent(draft)) !== originalSnapshot.value)
function updateSnapshot() {
  originalSnapshot.value = JSON.stringify(cloneContent(draft))
}

const canAddStat = computed(() => draft.stats.length < MAX_STATS)
const canAddTeamCard = computed(() => draft.team.length < MAX_TEAM_CARDS)
const canAddWorkItem = computed(() => draft.workItems.length < MAX_LIST_ITEMS)
const canAddWhyItem = computed(() => draft.whyItems.length < MAX_LIST_ITEMS)

const sections = [
  { id: 'edu-header', label: 'Header', icon: 'mdi-image-text' },
  { id: 'edu-images', label: 'Images', icon: 'mdi-image-multiple' },
  { id: 'edu-stats', label: 'Stats', icon: 'mdi-chart-box' },
  { id: 'edu-content', label: 'Content', icon: 'mdi-text-box' },
  { id: 'edu-team', label: 'Team', icon: 'mdi-account-group' },
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

  try {
    const { data, error } = await supabase
      .from('programs')
      .select('metadata, updated_at')
      .eq('slug', PROGRAM_SLUG)
      .maybeSingle()

    if (error) throw error

    if (data?.metadata) {
      const meta = data.metadata as Record<string, unknown>
      rawMetadata.value = { ...meta }

      if (typeof meta.headline === 'string' && meta.headline.trim()) draft.hero.title = meta.headline.trim()
      if (typeof meta.intro === 'string' && meta.intro.trim()) draft.hero.intro = meta.intro.trim()

      const galleryFromMeta = meta.gallery as GalleryImage[] | undefined
      if (Array.isArray(galleryFromMeta) && galleryFromMeta.length > 0) {
        draft.images = galleryFromMeta.map((g, i) => ({
          id: g.id || genId(),
          label: g.label?.trim() ? g.label : IMAGE_SLOTS[i]?.label || `Slot ${i + 1}`,
          url: g.url || '',
        }))
      } else {
        draft.images = IMAGE_SLOTS.map((slot) => ({
          id: genId(),
          label: slot.label,
          url: String(meta[slot.field] || ''),
        }))
      }
      while (draft.images.length < 4) {
        draft.images.push({ id: genId(), label: IMAGE_SLOTS[draft.images.length]?.label || `Slot ${draft.images.length + 1}`, url: '' })
      }

      if (Array.isArray(meta.statsBand) && meta.statsBand.length > 0) {
        draft.stats = meta.statsBand as StatItem[]
      }

      if (Array.isArray(meta.sections)) {
        const dbSections = meta.sections as { id: string; body?: string; items?: string }[]

        const workSection = dbSections.find((s) => s.id === 'education-work')
        if (workSection?.items?.trim()) {
          draft.workItems = workSection.items.split('\n').map((l) => l.trim()).filter(Boolean)
        }

        const approachSection = dbSections.find((s) => s.id === 'education-approach')
        if (approachSection?.body?.trim()) draft.approachText = approachSection.body.trim()

        const whySection = dbSections.find((s) => s.id === 'education-why')
        if (whySection?.items?.trim()) {
          draft.whyItems = whySection.items.split('\n').map((l) => l.trim()).filter(Boolean)
        }

        const teamSection = dbSections.find((s) => s.id === 'education-team')
        if (teamSection?.items?.trim()) {
          const lines = teamSection.items.split('\n').map((l) => l.trim()).filter(Boolean)
          if (lines.length) {
            draft.team = lines.map((line) => {
              const parts = line.split('|').map((p) => p.trim())
              return { role: parts[0] || '', icon: parts[1] || 'chart', desc: parts[2] || parts[0] || '' }
            })
          }
        }
      }

      updatedAt.value = data.updated_at || ''
      storageMode.value = 'supabase'
    }
  } catch (error) {
    console.warn('[EducationDashboard] load failed:', error)
    storageMode.value = 'local'
    ui.addToast('Could not load from database — showing last saved draft.', 'error')
  } finally {
    loading.value = false
    updateSnapshot()
    setupSectionWatch()
  }
}

async function savePage() {
  if (saving.value) return

  const validationError = validateDraft()
  if (validationError) {
    ui.addToast(validationError, 'error')
    return
  }

  saving.value = true

  try {
    const workItems = draft.workItems.filter((line) => line.trim()).join('\n')
    const whyItems = draft.whyItems.filter((line) => line.trim()).join('\n')
    const teamItems = draft.team.map((c) => `${c.role} | ${c.icon} | ${c.desc}`).join('\n')

    const payload = {
      slug: PROGRAM_SLUG,
      title: 'Education Program',
      pillar: 'Education',
      summary: 'Community pre-schools, mobile libraries, scholarships and Buddhist education.',
      description: 'Helping rural children keep learning through local teachers, libraries and family support.',
      status: 'published',
      metadata: {
        ...rawMetadata.value,
        headline: draft.hero.title,
        intro: draft.hero.intro,
        gallery: draft.images,
        introImageUrl: draft.images[0]?.url || '',
        readingImageUrl: draft.images[1]?.url || '',
        teacherImageUrl: draft.images[2]?.url || '',
        studyImageUrl: draft.images[3]?.url || '',
        statsBand: draft.stats,
        sections: [
          {
            id: 'education-work',
            label: 'What we do',
            heading: 'What we do',
            body: 'Full list of what the education program does, shown on the public Education page.',
            items: workItems,
          },
          {
            id: 'education-approach',
            label: 'Approach',
            heading: 'Our approach',
            body: draft.approachText,
            items: '',
          },
          {
            id: 'education-why',
            label: 'Why it matters',
            heading: 'Why it matters',
            body: 'Why the education program matters, shown on the public Education page.',
            items: whyItems,
          },
          {
            id: 'education-team',
            label: 'Organizational Structure',
            heading: 'Who delivers education on the ground',
            body: 'Our dedicated team works across provinces to ensure every child has access to quality education.',
            items: teamItems,
          },
        ],
      },
      updated_at: new Date().toISOString(),
    }

    let { error } = await supabase.from('programs').upsert(payload, { onConflict: 'slug' })

    if (error && error.message?.includes('row-level security')) {
      const { error: insertError } = await supabase.from('programs').insert(payload)
      if (insertError && insertError.message?.includes('duplicate key')) {
        const { error: updateError } = await supabase.from('programs').update(payload).eq('slug', PROGRAM_SLUG)
        error = updateError ?? null
      } else {
        error = insertError ?? null
      }
    }

    if (error) throw error

    rawMetadata.value = payload.metadata
    storageMode.value = 'supabase'
    updatedAt.value = payload.updated_at
    ui.addToast('Education page saved.', 'success')
    updateSnapshot()
  } catch (error) {
    console.error('[EducationDashboard] save failed:', error)
    storageMode.value = 'local'
    ui.addToast(error instanceof Error ? `Could not save: ${error.message}` : 'Could not save Education page.', 'error')
  } finally {
    saving.value = false
  }
}

function validateDraft() {
  if (!draft.hero.title.trim()) return 'Page title is required.'
  if (!draft.stats.length) return 'Add at least one statistic.'
  if (draft.stats.some((s) => !s.label.trim())) return 'Each statistic needs a label.'
  if (draft.team.some((c) => !c.role.trim())) return 'Each team card needs a role.'
  return ''
}

function addStat() {
  if (!canAddStat.value) return
  draft.stats.push({ number: '', label: '', description: '' })
}

function removeStat(index: number) {
  const stat = draft.stats[index]
  if (!stat) return
  confirmDialog(
    'Remove statistic?',
    `Remove "${stat.number} ${stat.label}" from the public Education page?`,
    () => {
      draft.stats.splice(index, 1)
      ui.addToast('Statistic removed.', 'warning')
    },
  )
}

function addTeamCard() {
  if (!canAddTeamCard.value) return
  draft.team.push({ role: 'New role', icon: 'chart', desc: 'Describe this role.' })
}

function removeTeamCard(index: number) {
  const card = draft.team[index]
  if (!card) return
  confirmDialog(
    'Remove team card?',
    `Remove "${card.role}" from the organizational structure?`,
    () => {
      draft.team.splice(index, 1)
      ui.addToast('Team card removed.', 'warning')
    },
  )
}

function addWorkItem() {
  if (!canAddWorkItem.value) return
  draft.workItems.push('New item')
}

function removeWorkItem(index: number) {
  draft.workItems.splice(index, 1)
}

function addWhyItem() {
  if (!canAddWhyItem.value) return
  draft.whyItems.push('New item')
}

function removeWhyItem(index: number) {
  draft.whyItems.splice(index, 1)
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= items.length) return
  const current = items[index]
  const next = items[target]
  if (!current || !next) return
  items[index] = next
  items[target] = current
}
</script>

<template>
  <v-app :class="['education-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Manage Education page</h1>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" color="primary" to="/programs/education" target="_blank">
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

          <div v-else key="content" class="content-grid">

          <AdminSectionNav
            :sections="sections"
            :active-section="activeSection"
            :has-changes="hasChanges"
            :saving="saving"
            aria-label="Education page sections"
            save-label="Save changes"
            @navigate="scrollToSection"
            @save="savePage"
          />

          <!-- ── HEADER ── -->
          <AdminEditorPanel
            :id="sections[0].id"
            kicker="Public page header"
            heading="Page title & intro"
            :editing="!!editingSections.header"
            :collapsed="collapsedSections.header"
            @toggle-edit="toggleEdit('header')"
            @cancel="cancelEdit('header')"
            @toggle-collapse="toggleCollapse('header')"
          >
            <div class="panel-body form-grid">
              <v-text-field v-model="draft.hero.title" label="Page title" :disabled="!editingSections.header" hide-details density="comfortable" variant="outlined" class="field-wide" />
              <v-textarea v-model="draft.hero.intro" label="Intro paragraph" rows="3" :disabled="!editingSections.header" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>
          </AdminEditorPanel>

          <!-- ── IMAGES ── -->
          <AdminEditorPanel
            :id="sections[1].id"
            kicker="Public page"
            heading="Page images"
            :editing="!!editingSections.images"
            :collapsed="collapsedSections.images"
            @toggle-edit="toggleEdit('images')"
            @cancel="cancelEdit('images')"
            @toggle-collapse="toggleCollapse('images')"
          >
            <div class="image-slot-grid pa-4">
              <div v-for="(image, index) in draft.images" :key="image.id" class="image-slot">
                <v-img v-if="image.url" :src="image.url" aspect-ratio="1.4" cover class="image-preview" />
                <div v-else class="image-preview image-preview-empty">
                  <v-icon size="28">mdi-image-outline</v-icon>
                </div>
                <span class="image-slot-label">{{ IMAGE_SLOTS[index]?.label || image.label }}</span>
                <AdminUploadButton
                  :disabled="!editingSections.images"
                  :description="IMAGE_SLOTS[index]?.description || 'Education image'"
                  @update:model-value="(url) => (image.url = url)"
                />
              </div>
            </div>
          </AdminEditorPanel>

          <!-- ── STATS ── -->
          <AdminEditorPanel
            :id="sections[2].id"
            kicker="Stats band"
            heading="Impact statistics"
            :editing="!!editingSections.stats"
            :collapsed="collapsedSections.stats"
            @toggle-edit="toggleEdit('stats')"
            @cancel="cancelEdit('stats')"
            @toggle-collapse="toggleCollapse('stats')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddStat" @click="addStat">
                  <v-icon start>mdi-plus</v-icon>
                  Add stat
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="items-list">
                <article v-for="(stat, index) in draft.stats" :key="index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.stats || index === 0" aria-label="Move stat up" @click="moveItem(draft.stats, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.stats || index === draft.stats.length - 1" aria-label="Move stat down" @click="moveItem(draft.stats, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.stats" icon color="error" variant="tonal" size="x-small" aria-label="Remove stat" @click="removeStat(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields stat-fields">
                    <v-text-field v-model="stat.number" label="Number" :disabled="!editingSections.stats" hide-details density="compact" variant="outlined" />
                    <v-text-field v-model="stat.label" label="Label" :disabled="!editingSections.stats" hide-details density="compact" variant="outlined" />
                    <v-textarea v-model="stat.description" label="Description" rows="2" :disabled="!editingSections.stats" hide-details density="compact" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ── CONTENT ── -->
          <AdminEditorPanel
            :id="sections[3].id"
            kicker="Content"
            heading="What we do, approach & why it matters"
            :editing="!!editingSections.content"
            :collapsed="collapsedSections.content"
            @toggle-edit="toggleEdit('content')"
            @cancel="cancelEdit('content')"
            @toggle-collapse="toggleCollapse('content')"
          >
            <div class="pa-4 content-subsection">
              <div class="content-subhead">
                <h3>What we do</h3>
                <v-btn v-if="editingSections.content" size="x-small" variant="tonal" :disabled="!canAddWorkItem" @click="addWorkItem">
                  <v-icon start>mdi-plus</v-icon>
                  Add item
                </v-btn>
              </div>
              <v-slide-y-transition group tag="div" class="items-list">
                <article v-for="(item, index) in draft.workItems" :key="'work-' + index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.content || index === 0" aria-label="Move item up" @click="moveItem(draft.workItems, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.content || index === draft.workItems.length - 1" aria-label="Move item down" @click="moveItem(draft.workItems, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.content" icon color="error" variant="tonal" size="x-small" aria-label="Remove item" @click="removeWorkItem(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields">
                    <v-text-field v-model="draft.workItems[index]" label="Item" :disabled="!editingSections.content" hide-details density="compact" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>

            <v-divider />

            <div class="pa-4 content-subsection">
              <div class="content-subhead">
                <h3>Our approach</h3>
              </div>
              <v-textarea v-model="draft.approachText" label="Approach text" rows="4" :disabled="!editingSections.content" hide-details density="comfortable" variant="outlined" />
            </div>

            <v-divider />

            <div class="pa-4 content-subsection">
              <div class="content-subhead">
                <h3>Why it matters</h3>
                <v-btn v-if="editingSections.content" size="x-small" variant="tonal" :disabled="!canAddWhyItem" @click="addWhyItem">
                  <v-icon start>mdi-plus</v-icon>
                  Add item
                </v-btn>
              </div>
              <v-slide-y-transition group tag="div" class="items-list">
                <article v-for="(item, index) in draft.whyItems" :key="'why-' + index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.content || index === 0" aria-label="Move item up" @click="moveItem(draft.whyItems, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.content || index === draft.whyItems.length - 1" aria-label="Move item down" @click="moveItem(draft.whyItems, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.content" icon color="error" variant="tonal" size="x-small" aria-label="Remove item" @click="removeWhyItem(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields">
                    <v-text-field v-model="draft.whyItems[index]" label="Item" :disabled="!editingSections.content" hide-details density="compact" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ── TEAM ── -->
          <AdminEditorPanel
            :id="sections[4].id"
            kicker="Organizational structure"
            heading="Who delivers education on the ground"
            :editing="!!editingSections.team"
            :collapsed="collapsedSections.team"
            @toggle-edit="toggleEdit('team')"
            @cancel="cancelEdit('team')"
            @toggle-collapse="toggleCollapse('team')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddTeamCard" @click="addTeamCard">
                  <v-icon start>mdi-plus</v-icon>
                  Add card
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="items-list two-col">
                <article v-for="(card, index) in draft.team" :key="index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.team || index === 0" aria-label="Move card up" @click="moveItem(draft.team, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.team || index === draft.team.length - 1" aria-label="Move card down" @click="moveItem(draft.team, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.team" icon color="error" variant="tonal" size="x-small" aria-label="Remove card" @click="removeTeamCard(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields">
                    <v-text-field v-model="card.role" label="Role" :disabled="!editingSections.team" hide-details density="compact" variant="outlined" />
                    <v-select v-model="card.icon" :items="[...TEAM_ICONS]" label="Icon" :disabled="!editingSections.team" hide-details density="compact" variant="outlined" />
                    <v-textarea v-model="card.desc" label="Description" rows="2" :disabled="!editingSections.team" hide-details density="compact" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
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
.education-admin {
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
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.content-grid {
  display: grid;
  gap: 1.1rem;
  margin-top: 1rem;
}

.panel-body {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.6rem 0.85rem;
}

.form-grid .field-wide {
  grid-column: 1 / -1;
}

/* ── Image slots ── */
.image-slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.image-slot {
  display: grid;
  gap: 0.6rem;
  align-content: start;
}

.image-slot-label {
  color: var(--admin-theme-muted);
  font-size: 0.78rem;
  font-weight: 700;
}

.image-preview {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 34%, var(--admin-theme-border));
  border-radius: 7px;
  background: var(--admin-theme-surface);
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 8%, transparent),
    0 12px 24px rgba(15, 95, 73, 0.11);
}

.image-preview-empty {
  display: grid;
  place-items: center;
  color: var(--admin-theme-muted);
  aspect-ratio: 1.4;
}

/* ── Items list (stats / list items / team cards) ── */
.items-list {
  display: grid;
  gap: 0.75rem;
}

.items-list.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.item-card {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  padding: 0.75rem 1rem;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.6rem;
}

.item-heading {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.item-number {
  display: grid;
  width: 1.8rem;
  height: 1.8rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  border-radius: 6px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-primary-deep);
  font-size: 0.7rem;
  font-weight: 900;
  flex-shrink: 0;
}

.item-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.item-fields .field-wide {
  grid-column: 1 / -1;
}

.stat-fields {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

/* ── Content sub-sections ── */
.content-subsection {
  display: grid;
  gap: 0.85rem;
}

.content-subhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.content-subhead h3 {
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 0.9rem;
  font-weight: 800;
}

@media (min-width: 900px) {
  .education-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
    padding-top: calc(60px + 1rem);
  }

  .manager-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-actions {
    width: 100%;
  }

  .form-grid,
  .item-fields {
    grid-template-columns: 1fr;
  }

  .items-list.two-col {
    grid-template-columns: 1fr;
  }
}
</style>
