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
import { useUiStore } from '@/stores/ui.store'

const PROGRAM_SLUG = 'programs-child-protection'
const MAX_STATS = 6
const MAX_TEAM_CARDS = 8
const MAX_LIST_ITEMS = 10
const GALLERY_SIZE = 6
const TEAM_ICONS: string[] = ['compass', 'map', 'heart', 'chart']

type GalleryImage = { id: string; label: string; url: string }
type StatItem = { number: string; label: string; description: string }
type TeamCard = { role: string; icon: string; desc: string }
type EditableSection = { id: string; label: string; heading: string; body: string; items: string }

type ChildProtectionDraft = {
  eyebrow: string
  headline: string
  intro: string
  heroImageUrl: string
  images: GalleryImage[]
  stats: StatItem[]
  workItems: string[]
  approachText: string
  team: TeamCard[]
}

// The public Child Protection page never reads the "why it matters" section
// (confirmed — no reference in ProgramsChildProtectionView.vue), so there's
// no editor for it, but it's round-tripped unchanged so saving never drops it.
const staticWhySection: EditableSection = {
  id: 'child-protection-why',
  label: 'Why it matters',
  heading: 'Why it matters',
  body: 'The border with Vietnam brings both opportunity and risk. Community-led safeguarding is the most durable defense.',
  items: "The safest village is one where every adult knows every child's name\nEarly identification prevents trafficking before it happens\nLocal networks respond faster than any external agency\nChildren who feel safe stay in school and out of harm",
}

let idCounter = 0
function genId() {
  return `cp-img-${++idCounter}-${Date.now()}`
}

function defaultImages(): GalleryImage[] {
  return Array.from({ length: GALLERY_SIZE }, (_, i) => ({ id: genId(), label: `Gallery image ${i + 1}`, url: '' }))
}

const defaultContent: ChildProtectionDraft = {
  eyebrow: 'Child Protection',
  headline: 'Safeguarding children through local action.',
  intro:
    'Cross-border migration, poverty and family separation put rural Cambodian children at risk of unsafe labour and trafficking. Santi Sena works with villages, schools and pagodas to build the safety net closest to the child — before anything goes wrong.',
  heroImageUrl: '',
  images: defaultImages(),
  stats: [
    { number: '43', label: 'COMMUNES', description: 'With active Child Protection Networks.' },
    { number: '600+', label: 'PEER EDUCATORS', description: 'Youth trained in child rights and safeguarding.' },
    { number: '24/7', label: 'VILLAGE HOTLINES', description: 'Case referral into commune and provincial authorities.' },
  ],
  workItems: [
    'Anti-trafficking campaigns at borders, markets and schools',
    'Village Child Protection Networks trained in identification and referral',
    'Child rights advocacy with commune councils and provincial authorities',
    'Peer-educator youth groups on safe migration, health and rights',
    'Family reintegration support for children returning from unsafe labour',
    'Safeguarding training for every teacher, monk and volunteer',
  ],
  approachText:
    'Every network is anchored by the people children already trust — mothers, monks, teachers, commune council members. We train, coach and connect them to formal referral pathways so every case reaches the provincial social affairs office the same day it is identified.',
  team: [
    { role: 'Program Director', icon: 'compass', desc: 'Oversees child protection programs, advocacy, and partnerships across provinces.' },
    { role: 'Field Coordinators', icon: 'map', desc: 'Manage child protection networks, peer education and safe migration training.' },
    { role: 'Safeguarding Trainers', icon: 'heart', desc: 'Deliver training for teachers, monks and volunteers on child rights and referral.' },
    { role: 'Monitoring & Evaluation', icon: 'chart', desc: 'Track case outcomes, network coverage and community impact.' },
  ],
}

function cloneContent(content: ChildProtectionDraft): ChildProtectionDraft {
  return {
    eyebrow: content.eyebrow,
    headline: content.headline,
    intro: content.intro,
    heroImageUrl: content.heroImageUrl,
    images: content.images.map((img) => ({ ...img })),
    stats: content.stats.map((s) => ({ ...s })),
    workItems: [...content.workItems],
    approachText: content.approachText,
    team: content.team.map((t) => ({ ...t })),
  }
}

const ui = useUiStore()
useAdminTheme()

const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

const loading = ref(false)
const saving = ref(false)
const storageMode = ref<'supabase' | 'local'>('supabase')
const loadedWhySection = ref<EditableSection>({ ...staticWhySection })

const draft = reactive<ChildProtectionDraft>(cloneContent(defaultContent))

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
    getSnapshot: () => ({ eyebrow: draft.eyebrow, headline: draft.headline, intro: draft.intro, heroImageUrl: draft.heroImageUrl }),
    applySnapshot: (value) => {
      draft.eyebrow = value.eyebrow
      draft.headline = value.headline
      draft.intro = value.intro
      draft.heroImageUrl = value.heroImageUrl
    },
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
    getSnapshot: () => ({ workItems: [...draft.workItems], approachText: draft.approachText }),
    applySnapshot: (value) => {
      draft.workItems = value.workItems
      draft.approachText = value.approachText
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

const sections = [
  { id: 'cp-header', label: 'Header', icon: 'mdi-image-text' },
  { id: 'cp-images', label: 'Images', icon: 'mdi-image-multiple' },
  { id: 'cp-stats', label: 'Stats', icon: 'mdi-chart-box' },
  { id: 'cp-content', label: 'Content', icon: 'mdi-text-box' },
  { id: 'cp-team', label: 'Team', icon: 'mdi-account-group' },
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
      .select('metadata')
      .eq('slug', PROGRAM_SLUG)
      .maybeSingle()

    if (error) throw error

    if (data?.metadata) {
      const meta = data.metadata as Record<string, unknown>

      if (typeof meta.eyebrow === 'string' && meta.eyebrow.trim()) draft.eyebrow = meta.eyebrow.trim()
      if (typeof meta.headline === 'string' && meta.headline.trim()) draft.headline = meta.headline.trim()
      if (typeof meta.intro === 'string' && meta.intro.trim()) draft.intro = meta.intro.trim()
      if (typeof meta.heroImageUrl === 'string') draft.heroImageUrl = meta.heroImageUrl

      const galleryFromMeta = meta.gallery as GalleryImage[] | undefined
      if (Array.isArray(galleryFromMeta) && galleryFromMeta.length > 0) {
        draft.images = galleryFromMeta.map((g, i) => ({
          id: g.id || genId(),
          label: g.label?.trim() ? g.label : `Gallery image ${i + 1}`,
          url: g.url || '',
        }))
      }
      while (draft.images.length < GALLERY_SIZE) {
        draft.images.push({ id: genId(), label: `Gallery image ${draft.images.length + 1}`, url: '' })
      }

      if (Array.isArray(meta.statsBand) && meta.statsBand.length > 0) {
        draft.stats = meta.statsBand as StatItem[]
      }

      if (Array.isArray(meta.sections)) {
        const dbSections = meta.sections as { id: string; body?: string; items?: string; label?: string; heading?: string }[]

        const workSection = dbSections.find((s) => s.id === 'child-protection-work')
        if (workSection?.items?.trim()) {
          draft.workItems = workSection.items.split('\n').map((l) => l.trim()).filter(Boolean)
        }

        const approachSection = dbSections.find((s) => s.id === 'child-protection-approach')
        if (approachSection?.body?.trim()) draft.approachText = approachSection.body.trim()

        const teamSection = dbSections.find((s) => s.id === 'child-protection-team')
        if (teamSection?.items?.trim()) {
          const lines = teamSection.items.split('\n').map((l) => l.trim()).filter(Boolean)
          if (lines.length) {
            draft.team = lines.map((line) => {
              const parts = line.split('|').map((p) => p.trim())
              return { role: parts[0] || '', icon: parts[1] || 'chart', desc: parts[2] || parts[0] || '' }
            })
          }
        }

        const whySection = dbSections.find((s) => s.id === 'child-protection-why')
        if (whySection) {
          loadedWhySection.value = {
            id: whySection.id,
            label: whySection.label || staticWhySection.label,
            heading: whySection.heading || staticWhySection.heading,
            body: whySection.body || staticWhySection.body,
            items: whySection.items || staticWhySection.items,
          }
        }
      }

      storageMode.value = 'supabase'
    }
  } catch (error) {
    console.warn('[ChildProtectionDashboard] load failed:', error)
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
    const teamItems = draft.team.map((c) => `${c.role} | ${c.icon} | ${c.desc}`).join('\n')

    const payload = {
      slug: PROGRAM_SLUG,
      title: draft.headline.trim() || 'Child Protection',
      pillar: 'Child Protection',
      summary: draft.intro,
      description: draft.intro,
      status: 'published',
      metadata: {
        eyebrow: draft.eyebrow,
        headline: draft.headline,
        intro: draft.intro,
        heroImageUrl: draft.heroImageUrl,
        primaryAction: '',
        secondaryAction: '',
        gallery: draft.images,
        statsBand: draft.stats,
        sections: [
          {
            id: 'child-protection-work',
            label: 'What we do',
            heading: 'What we do',
            body: 'Full list of what the child protection program does, shown on the public page.',
            items: workItems,
          },
          {
            id: 'child-protection-approach',
            label: 'Approach',
            heading: 'Our approach',
            body: draft.approachText,
            items: '',
          },
          {
            id: 'child-protection-team',
            label: 'Organizational Structure',
            heading: 'Who delivers child protection on the ground',
            body: 'Our dedicated team works across provinces building community safeguarding systems that keep children safe.',
            items: teamItems,
          },
          loadedWhySection.value,
        ],
      },
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('programs').upsert(payload, { onConflict: 'slug' })
    if (error) throw error

    storageMode.value = 'supabase'
    ui.addToast('Child Protection page saved.', 'success')
    updateSnapshot()
  } catch (error) {
    console.error('[ChildProtectionDashboard] save failed:', error)
    storageMode.value = 'local'
    ui.addToast(error instanceof Error ? `Could not save: ${error.message}` : 'Could not save Child Protection page.', 'error')
  } finally {
    saving.value = false
  }
}

function validateDraft() {
  if (!draft.headline.trim()) return 'Headline is required.'
  if (!draft.stats.length) return 'Add at least one statistic.'
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
  confirmDialog('Remove statistic?', `Remove "${stat.number} ${stat.label}" from the public Child Protection page?`, () => {
    draft.stats.splice(index, 1)
    ui.addToast('Statistic removed.', 'warning')
  })
}

function addTeamCard() {
  if (!canAddTeamCard.value) return
  draft.team.push({ role: 'New role', icon: 'chart', desc: 'Describe this role.' })
}

function removeTeamCard(index: number) {
  const card = draft.team[index]
  if (!card) return
  confirmDialog('Remove team card?', `Remove "${card.role}" from the organizational structure?`, () => {
    draft.team.splice(index, 1)
    ui.addToast('Team card removed.', 'warning')
  })
}

function addWorkItem() {
  if (!canAddWorkItem.value) return
  draft.workItems.push('New item')
}

function removeWorkItem(index: number) {
  draft.workItems.splice(index, 1)
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
  <v-app :class="['child-protection-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Manage Child Protection page</h1>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" color="primary" to="/programs/child-protection" target="_blank">
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

          <div v-else key="content" class="content-grid">

          <AdminSectionNav
            :sections="sections"
            :active-section="activeSection"
            :has-changes="hasChanges"
            :saving="saving"
            aria-label="Child Protection page sections"
            save-label="Save changes"
            @navigate="scrollToSection"
            @save="savePage"
          />

          <!-- ── HEADER ── -->
          <AdminEditorPanel
            :id="sections[0].id"
            kicker="Public page header"
            heading="Safeguarding children through local action."
            :editing="!!editingSections.header"
            :collapsed="collapsedSections.header"
            @toggle-edit="toggleEdit('header')"
            @cancel="cancelEdit('header')"
            @toggle-collapse="toggleCollapse('header')"
          >
            <div class="image-editor-grid">
              <div class="image-upload-panel">
                <v-img v-if="draft.heroImageUrl" :src="draft.heroImageUrl" aspect-ratio="1.6" cover class="image-preview hero-preview" />
                <div v-else class="image-preview hero-preview image-preview-empty">
                  <v-icon size="28">mdi-image-outline</v-icon>
                </div>
                <AdminUploadButton
                  :disabled="!editingSections.header"
                  description="Child Protection hero image"
                  @update:model-value="(url) => (draft.heroImageUrl = url)"
                />
              </div>

              <div class="form-stack">
                <div class="form-grid">
                  <v-text-field v-model="draft.eyebrow" label="Eyebrow / badge" :disabled="!editingSections.header" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="draft.headline" label="Headline" :disabled="!editingSections.header" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-textarea v-model="draft.intro" label="Intro paragraph" rows="3" :disabled="!editingSections.header" hide-details density="comfortable" variant="outlined" class="field-wide" />
                </div>
              </div>
            </div>
          </AdminEditorPanel>

          <!-- ── IMAGES ── -->
          <AdminEditorPanel
            :id="sections[1].id"
            kicker="Public page"
            heading="Gallery images"
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
                <span class="image-slot-label">{{ image.label }}</span>
                <AdminUploadButton
                  :disabled="!editingSections.images"
                  :description="`Child Protection gallery-${index} image`"
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
            heading="What we do & approach"
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
          </AdminEditorPanel>

          <!-- ── TEAM ── -->
          <AdminEditorPanel
            :id="sections[4].id"
            kicker="Organizational structure"
            heading="Who delivers child protection on the ground"
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
                    <v-select v-model="card.icon" :items="TEAM_ICONS" label="Icon" :disabled="!editingSections.team" hide-details density="compact" variant="outlined" />
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
.child-protection-admin {
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

/* ── Hero image ── */
.image-editor-grid {
  display: grid;
  grid-template-columns: minmax(300px, 0.72fr) minmax(360px, 1.28fr);
  gap: 1.25rem;
  padding: 1.5rem;
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

.hero-preview {
  aspect-ratio: 1.6;
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
  .child-protection-admin.sidebar-open {
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
  .image-editor-grid,
  .item-fields {
    grid-template-columns: 1fr;
  }

  .items-list.two-col {
    grid-template-columns: 1fr;
  }
}
</style>
