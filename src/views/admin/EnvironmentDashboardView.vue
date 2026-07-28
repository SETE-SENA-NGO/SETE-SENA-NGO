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

const PROGRAM_SLUG = 'programs-environment'
const MAX_APPROACH_CARDS = 6
const MAX_INITIATIVES = 10
const MAX_PROCESS_STEPS = 8
const MAX_STATS = 6
const APPROACH_ICONS: string[] = ['shield', 'leaf', 'users', 'tree-pine', 'globe', 'heart']

type EditableSection = { id: string; label: string; heading: string; body: string; items: string }
type ApproachCard = { title: string; text: string; icon: string }
type InitiativeItem = { title: string; text: string; img: string; tag: string }
type ProcessStep = { number: string; title: string; text: string }
type StatItem = { number: string; label: string }
type QuoteContent = { text: string; cite: string }

type EnvironmentDraft = {
  headline: string
  intro: string
  approachCards: ApproachCard[]
  initiatives: InitiativeItem[]
  processSteps: ProcessStep[]
  stats: StatItem[]
  quote: QuoteContent
}

// Kept for round-trip compatibility with the `programs` row's metadata —
// the public Environment page (ProgramEnviromentView.vue) doesn't read
// eyebrow/heroImageUrl/primaryAction/secondaryAction/sections at all, so
// there's no editor UI for them, but saving must not drop them.
const staticMetadata = {
  eyebrow: 'Environment',
  heroImageUrl: '',
  primaryAction: '',
  secondaryAction: '',
  sections: [
    {
      id: 'environment-work',
      label: 'What we do',
      heading: 'What we do',
      body: 'Community forestry, biogas digesters, rainwater harvesting and WASH — climate resilience built one household at a time.',
      items: 'Community forestry agreements\nBiogas digester installation\nRainwater harvesting systems\nWASH facilities in schools and clinics\nTree nursery support and reforestation',
    },
    {
      id: 'environment-approach',
      label: 'Approach',
      heading: 'Our approach',
      body: 'Our approach combines scientific expertise with community participation to create lasting environmental change. We work alongside villages to restore forests, install renewable energy, and build climate resilience that families can see and sustain.',
      items: '',
    },
    {
      id: 'environment-team',
      label: 'Organizational Structure',
      heading: 'Who delivers environment programs on the ground',
      body: 'Our dedicated team works across provinces protecting forests, building climate resilience and restoring ecosystems.',
      items: 'Program Director | compass | Oversees environmental programs, conservation initiatives, and partnerships across provinces.\nField Coordinators | map | Manage community forestry, biogas, and WASH projects in target villages.\nConservation Trainers | heart | Deliver climate-smart agriculture, reforestation and environmental education.\nWASH Officers | chart | Implement clean water, sanitation and rainwater harvesting solutions.',
    },
    {
      id: 'environment-why',
      label: 'Why it matters',
      heading: 'Why it matters',
      body: 'Southeastern Cambodia is one of the most climate-vulnerable regions in the country. Healthy forests and clean water are peacekeeping infrastructure.',
      items: 'Deforestation leaves communities exposed to floods and droughts\nClean water access prevents disease and keeps children in school\nRenewable energy reduces dependence on charcoal and firewood\nCommunity forests protect biodiversity for future generations',
    },
  ] as EditableSection[],
}

const defaultContent: EnvironmentDraft = {
  headline: 'Protecting the land that sustains villages.',
  intro: 'Community forestry, biogas digesters, rainwater harvesting and WASH — climate resilience built one household at a time.',
  approachCards: [
    { title: 'Conservation', text: 'Protecting and restoring natural habitats, wildlife corridors, and biodiversity hotspots through community-led initiatives and scientific research.', icon: 'shield' },
    { title: 'Sustainability', text: 'Promoting renewable energy, sustainable agriculture, and circular economy practices that reduce environmental impact while supporting livelihoods.', icon: 'leaf' },
    { title: 'Community Engagement', text: 'Empowering local communities with knowledge, resources, and tools to actively participate in environmental protection and climate action.', icon: 'users' },
  ],
  initiatives: [
    { title: 'Reforestation Projects', text: "Planting native tree species to restore degraded forests. We've planted over 500,000 trees across 12 communities.", img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', tag: 'Conservation' },
    { title: 'Environmental Education', text: 'Developing curriculum and training programs for schools to build environmental literacy from an early age.', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80', tag: 'Education' },
    { title: 'Renewable Energy Access', text: 'Installing solar panels and clean energy solutions in rural communities, reducing dependence on fossil fuels.', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80', tag: 'Energy' },
    { title: 'Water Conservation', text: 'Implementing rainwater harvesting, watershed management, and water purification systems.', img: 'https://images.unsplash.com/photo-1548685913-fe6678b0d5c9?w=800&q=80', tag: 'Water' },
    { title: 'Sustainable Agriculture', text: 'Training farmers in organic farming, crop rotation, and agroforestry techniques.', img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80', tag: 'Agriculture' },
    { title: 'Climate Research & Advocacy', text: 'Conducting climate impact assessments and advocating for policy changes.', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', tag: 'Research' },
  ],
  processSteps: [
    { number: '01', title: 'Assessment', text: 'We conduct comprehensive environmental assessments to understand local ecosystems and identify priorities.' },
    { number: '02', title: 'Planning', text: 'Working with community leaders, we develop tailored action plans that balance conservation with needs.' },
    { number: '03', title: 'Implementation', text: 'We execute projects with active community participation, ensuring local ownership.' },
    { number: '04', title: 'Monitoring', text: 'Continuous monitoring helps us measure impact and adapt strategies for greater effectiveness.' },
  ],
  stats: [
    { number: '500K+', label: 'TREES PLANTED' },
    { number: '12', label: 'COMMUNITIES SERVED' },
    { number: '50+', label: 'ECOSYSTEMS PROTECTED' },
    { number: '10K+', label: 'PEOPLE TRAINED' },
  ],
  quote: {
    text: 'We do not inherit the earth from our ancestors; we borrow it from our children. Our environmental program is a pledge to protect that inheritance and ensure future generations inherit a planet that is healthy, vibrant, and full of possibility.',
    cite: '— Santi Sena Environmental Team',
  },
}

function cloneContent(content: EnvironmentDraft): EnvironmentDraft {
  return {
    headline: content.headline,
    intro: content.intro,
    approachCards: content.approachCards.map((c) => ({ ...c })),
    initiatives: content.initiatives.map((i) => ({ ...i })),
    processSteps: content.processSteps.map((s) => ({ ...s })),
    stats: content.stats.map((s) => ({ ...s })),
    quote: { ...content.quote },
  }
}

const ui = useUiStore()
useAdminTheme()

const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

const loading = ref(false)
const saving = ref(false)
const storageMode = ref<'supabase' | 'local'>('supabase')
// Sections aren't editable here (the public page doesn't read them) but are
// round-tripped unchanged so saving never drops previously-stored data.
const loadedSections = ref<EditableSection[]>(staticMetadata.sections)

const draft = reactive<EnvironmentDraft>(cloneContent(defaultContent))

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
    getSnapshot: () => ({ headline: draft.headline, intro: draft.intro }),
    applySnapshot: (value) => { draft.headline = value.headline; draft.intro = value.intro },
  },
  {
    key: 'approach',
    getSnapshot: () => draft.approachCards.map((c) => ({ ...c })),
    applySnapshot: (value) => { draft.approachCards = value },
  },
  {
    key: 'initiatives',
    getSnapshot: () => draft.initiatives.map((i) => ({ ...i })),
    applySnapshot: (value) => { draft.initiatives = value },
  },
  {
    key: 'process',
    getSnapshot: () => draft.processSteps.map((s) => ({ ...s })),
    applySnapshot: (value) => { draft.processSteps = value },
  },
  {
    key: 'stats',
    getSnapshot: () => draft.stats.map((s) => ({ ...s })),
    applySnapshot: (value) => { draft.stats = value },
  },
  {
    key: 'quote',
    getSnapshot: () => ({ ...draft.quote }),
    applySnapshot: (value) => { draft.quote = value },
  },
])

const originalSnapshot = ref('')
const hasChanges = computed(() => JSON.stringify(cloneContent(draft)) !== originalSnapshot.value)
function updateSnapshot() {
  originalSnapshot.value = JSON.stringify(cloneContent(draft))
}

const canAddApproachCard = computed(() => draft.approachCards.length < MAX_APPROACH_CARDS)
const canAddInitiative = computed(() => draft.initiatives.length < MAX_INITIATIVES)
const canAddProcessStep = computed(() => draft.processSteps.length < MAX_PROCESS_STEPS)
const canAddStat = computed(() => draft.stats.length < MAX_STATS)

const sections = [
  { id: 'env-header', label: 'Header', icon: 'mdi-image-text' },
  { id: 'env-approach', label: 'Approach', icon: 'mdi-shield-check' },
  { id: 'env-initiatives', label: 'Initiatives', icon: 'mdi-image-multiple' },
  { id: 'env-process', label: 'Process', icon: 'mdi-format-list-numbered' },
  { id: 'env-stats', label: 'Stats', icon: 'mdi-chart-box' },
  { id: 'env-quote', label: 'Quote', icon: 'mdi-format-quote-close' },
] as const

const { activeSection, scrollToSection, updateActiveSectionFromScroll } = useScrollSpyNav(sections)

useUnsavedChangesGuard(hasChanges)

onMounted(() => {
  void loadPage()
})

onUnmounted(() => {
  stopSectionWatch()
})

function mergeSectionsWithDefaults(dbSections: EditableSection[]): EditableSection[] {
  const dbMap = new Map(dbSections.map((s) => [s.id, s]))
  return staticMetadata.sections.map((defSec) => {
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

      if (typeof meta.headline === 'string' && meta.headline.trim()) draft.headline = meta.headline.trim()
      if (typeof meta.intro === 'string' && meta.intro.trim()) draft.intro = meta.intro.trim()
      if (Array.isArray(meta.approachCards) && meta.approachCards.length) draft.approachCards = meta.approachCards as ApproachCard[]
      if (Array.isArray(meta.initiatives) && meta.initiatives.length) draft.initiatives = meta.initiatives as InitiativeItem[]
      if (Array.isArray(meta.processSteps) && meta.processSteps.length) draft.processSteps = meta.processSteps as ProcessStep[]
      if (Array.isArray(meta.statsBand) && meta.statsBand.length) draft.stats = meta.statsBand as StatItem[]
      if (meta.quoteContent && typeof meta.quoteContent === 'object') {
        draft.quote = { ...draft.quote, ...(meta.quoteContent as Partial<QuoteContent>) }
      }
      if (Array.isArray(meta.sections)) {
        loadedSections.value = mergeSectionsWithDefaults(meta.sections as EditableSection[])
      }

      storageMode.value = 'supabase'
    }
  } catch (error) {
    console.warn('[EnvironmentDashboard] load failed:', error)
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
    const payload = {
      slug: PROGRAM_SLUG,
      title: draft.headline.trim() || 'Environment',
      pillar: 'Environment',
      summary: draft.intro,
      description: draft.intro,
      status: 'published',
      metadata: {
        eyebrow: staticMetadata.eyebrow,
        headline: draft.headline,
        intro: draft.intro,
        heroImageUrl: staticMetadata.heroImageUrl,
        primaryAction: staticMetadata.primaryAction,
        secondaryAction: staticMetadata.secondaryAction,
        sections: loadedSections.value,
        statsBand: draft.stats,
        initiatives: draft.initiatives,
        processSteps: draft.processSteps,
        approachCards: draft.approachCards,
        quoteContent: draft.quote,
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

    storageMode.value = 'supabase'
    ui.addToast('Environment page saved.', 'success')
    updateSnapshot()
  } catch (error) {
    console.error('[EnvironmentDashboard] save failed:', error)
    storageMode.value = 'local'
    ui.addToast(error instanceof Error ? `Could not save: ${error.message}` : 'Could not save Environment page.', 'error')
  } finally {
    saving.value = false
  }
}

function validateDraft() {
  if (!draft.headline.trim()) return 'Headline is required.'
  if (draft.approachCards.some((c) => !c.title.trim())) return 'Each approach card needs a title.'
  if (draft.initiatives.some((i) => !i.title.trim())) return 'Each initiative needs a title.'
  return ''
}

function addApproachCard() {
  if (!canAddApproachCard.value) return
  draft.approachCards.push({ title: 'New approach', text: 'Describe this approach.', icon: 'leaf' })
}

function removeApproachCard(index: number) {
  const card = draft.approachCards[index]
  if (!card) return
  confirmDialog('Remove approach card?', `Remove "${card.title}" from the public Environment page?`, () => {
    draft.approachCards.splice(index, 1)
    ui.addToast('Approach card removed.', 'warning')
  })
}

function addInitiative() {
  if (!canAddInitiative.value) return
  draft.initiatives.push({ title: 'New initiative', text: 'Describe this initiative.', img: '', tag: 'New' })
}

function removeInitiative(index: number) {
  const item = draft.initiatives[index]
  if (!item) return
  confirmDialog('Remove initiative?', `Remove "${item.title}" from the public Environment page?`, () => {
    draft.initiatives.splice(index, 1)
    ui.addToast('Initiative removed.', 'warning')
  })
}

function addProcessStep() {
  if (!canAddProcessStep.value) return
  const stepNumber = draft.processSteps.length + 1
  draft.processSteps.push({ number: String(stepNumber).padStart(2, '0'), title: 'New step', text: 'Describe this step.' })
}

function removeProcessStep(index: number) {
  const step = draft.processSteps[index]
  if (!step) return
  confirmDialog('Remove step?', `Remove "${step.title}" from the process steps?`, () => {
    draft.processSteps.splice(index, 1)
    ui.addToast('Step removed.', 'warning')
  })
}

function addStat() {
  if (!canAddStat.value) return
  draft.stats.push({ number: '', label: '' })
}

function removeStat(index: number) {
  const stat = draft.stats[index]
  if (!stat) return
  confirmDialog('Remove statistic?', `Remove "${stat.number} ${stat.label}" from the public Environment page?`, () => {
    draft.stats.splice(index, 1)
    ui.addToast('Statistic removed.', 'warning')
  })
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
  <v-app :class="['environment-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Manage Environment page</h1>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" color="primary" to="/programs/environment" target="_blank">
              <v-icon start>mdi-open-in-new</v-icon>
              View page
            </v-btn>
          </div>
        </header>

        <v-fade-transition mode="out-in" @after-enter="updateActiveSectionFromScroll">
          <div v-if="loading" key="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading Environment content...</span>
          </div>

          <div v-else key="content" class="content-grid">

          <AdminSectionNav
            :sections="sections"
            :active-section="activeSection"
            :has-changes="hasChanges"
            :saving="saving"
            aria-label="Environment page sections"
            save-label="Save changes"
            @navigate="scrollToSection"
            @save="savePage"
          />

          <!-- ── HEADER ── -->
          <AdminEditorPanel
            :id="sections[0].id"
            kicker="Public page header"
            heading="Protecting the land that sustains villages."
            :editing="!!editingSections.header"
            :collapsed="collapsedSections.header"
            @toggle-edit="toggleEdit('header')"
            @cancel="cancelEdit('header')"
            @toggle-collapse="toggleCollapse('header')"
          >
            <div class="panel-body form-grid">
              <v-text-field v-model="draft.headline" label="Page headline" :disabled="!editingSections.header" hide-details density="comfortable" variant="outlined" class="field-wide" />
              <v-textarea v-model="draft.intro" label="Intro paragraph" rows="3" :disabled="!editingSections.header" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>
          </AdminEditorPanel>

          <!-- ── APPROACH CARDS ── -->
          <AdminEditorPanel
            :id="sections[1].id"
            kicker="Approach"
            heading="Our Approach cards"
            :editing="!!editingSections.approach"
            :collapsed="collapsedSections.approach"
            @toggle-edit="toggleEdit('approach')"
            @cancel="cancelEdit('approach')"
            @toggle-collapse="toggleCollapse('approach')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddApproachCard" @click="addApproachCard">
                  <v-icon start>mdi-plus</v-icon>
                  Add card
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="items-list two-col">
                <article v-for="(card, index) in draft.approachCards" :key="index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.approach || index === 0" aria-label="Move card up" @click="moveItem(draft.approachCards, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.approach || index === draft.approachCards.length - 1" aria-label="Move card down" @click="moveItem(draft.approachCards, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.approach" icon color="error" variant="tonal" size="x-small" aria-label="Remove card" @click="removeApproachCard(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields">
                    <v-text-field v-model="card.title" label="Title" :disabled="!editingSections.approach" hide-details density="compact" variant="outlined" />
                    <v-select v-model="card.icon" :items="APPROACH_ICONS" label="Icon" :disabled="!editingSections.approach" hide-details density="compact" variant="outlined" />
                    <v-textarea v-model="card.text" label="Description" rows="3" :disabled="!editingSections.approach" hide-details density="compact" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ── INITIATIVES ── -->
          <AdminEditorPanel
            :id="sections[2].id"
            kicker="Highlights"
            heading="Key initiatives"
            :editing="!!editingSections.initiatives"
            :collapsed="collapsedSections.initiatives"
            @toggle-edit="toggleEdit('initiatives')"
            @cancel="cancelEdit('initiatives')"
            @toggle-collapse="toggleCollapse('initiatives')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddInitiative" @click="addInitiative">
                  <v-icon start>mdi-plus</v-icon>
                  Add initiative
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="cards-list two-col">
              <article v-for="(item, index) in draft.initiatives" :key="index" class="card-editor">
                <header class="card-editor-header">
                  <div class="card-heading">
                    <span class="card-number">{{ String(index + 1).padStart(2, '0') }}</span>
                    <div>
                      <h3>{{ item.title || 'Untitled initiative' }}</h3>
                      <p>{{ item.tag || 'No tag' }}</p>
                    </div>
                  </div>
                  <div class="card-actions">
                    <v-btn icon variant="outlined" size="small" :disabled="!editingSections.initiatives || index === 0" aria-label="Move initiative up" @click="moveItem(draft.initiatives, index, -1)">
                      <v-icon>mdi-chevron-up</v-icon>
                    </v-btn>
                    <v-btn icon variant="outlined" size="small" :disabled="!editingSections.initiatives || index === draft.initiatives.length - 1" aria-label="Move initiative down" @click="moveItem(draft.initiatives, index, 1)">
                      <v-icon>mdi-chevron-down</v-icon>
                    </v-btn>
                    <v-btn v-if="editingSections.initiatives" icon color="error" variant="tonal" size="small" aria-label="Remove initiative" @click="removeInitiative(index)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </header>

                <div class="card-editor-top">
                  <div class="image-upload-panel card-image-upload">
                    <v-img v-if="item.img" :src="item.img" aspect-ratio="1.35" cover class="image-preview card-preview" />
                    <div v-else class="image-preview card-preview image-preview-empty">
                      <v-icon size="28">mdi-image-outline</v-icon>
                    </div>
                    <AdminUploadButton
                      :disabled="!editingSections.initiatives"
                      :description="`Environment initiative-${index} image`"
                      @update:model-value="(url) => (item.img = url)"
                    />
                  </div>
                </div>

                <div class="card-form-grid">
                  <v-text-field v-model="item.title" label="Title" :disabled="!editingSections.initiatives" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="item.tag" label="Tag" :disabled="!editingSections.initiatives" hide-details density="comfortable" variant="outlined" />
                  <v-textarea v-model="item.text" label="Description" rows="2" :disabled="!editingSections.initiatives" hide-details density="comfortable" variant="outlined" class="field-wide" />
                </div>
              </article>
            </div>
          </AdminEditorPanel>

          <!-- ── PROCESS STEPS ── -->
          <AdminEditorPanel
            :id="sections[3].id"
            kicker="How we work"
            heading="Process steps"
            :editing="!!editingSections.process"
            :collapsed="collapsedSections.process"
            @toggle-edit="toggleEdit('process')"
            @cancel="cancelEdit('process')"
            @toggle-collapse="toggleCollapse('process')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddProcessStep" @click="addProcessStep">
                  <v-icon start>mdi-plus</v-icon>
                  Add step
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="items-list two-col">
                <article v-for="(step, index) in draft.processSteps" :key="index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ step.number || String(index + 1).padStart(2, '0') }}</span>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.process || index === 0" aria-label="Move step up" @click="moveItem(draft.processSteps, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.process || index === draft.processSteps.length - 1" aria-label="Move step down" @click="moveItem(draft.processSteps, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.process" icon color="error" variant="tonal" size="x-small" aria-label="Remove step" @click="removeProcessStep(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields">
                    <v-text-field v-model="step.number" label="Number" :disabled="!editingSections.process" hide-details density="compact" variant="outlined" />
                    <v-text-field v-model="step.title" label="Title" :disabled="!editingSections.process" hide-details density="compact" variant="outlined" />
                    <v-textarea v-model="step.text" label="Description" rows="2" :disabled="!editingSections.process" hide-details density="compact" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ── STATS ── -->
          <AdminEditorPanel
            :id="sections[4].id"
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
              <v-slide-y-transition group tag="div" class="items-list two-col">
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
                  <div class="item-fields">
                    <v-text-field v-model="stat.number" label="Number" :disabled="!editingSections.stats" hide-details density="compact" variant="outlined" />
                    <v-text-field v-model="stat.label" label="Label" :disabled="!editingSections.stats" hide-details density="compact" variant="outlined" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ── QUOTE ── -->
          <AdminEditorPanel
            :id="sections[5].id"
            kicker="Testimonial"
            heading="Quote"
            :editing="!!editingSections.quote"
            :collapsed="collapsedSections.quote"
            @toggle-edit="toggleEdit('quote')"
            @cancel="cancelEdit('quote')"
            @toggle-collapse="toggleCollapse('quote')"
          >
            <div class="panel-body form-grid">
              <v-textarea v-model="draft.quote.text" label="Quote text" rows="3" :disabled="!editingSections.quote" hide-details density="comfortable" variant="outlined" class="field-wide" />
              <v-text-field v-model="draft.quote.cite" label="Citation / author" :disabled="!editingSections.quote" hide-details density="comfortable" variant="outlined" class="field-wide" />
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
.environment-admin {
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

/* ── Image upload panel (preview + button) ── */
.image-upload-panel {
  display: grid;
  gap: 0.75rem;
  align-content: start;
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
  aspect-ratio: 1.35;
}

.cards-list {
  display: grid;
  gap: 0.95rem;
  padding: 1.5rem;
}

.cards-list.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
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

.card-editor-top {
  padding: 1.25rem 1.5rem 0;
}

.card-image-upload {
  width: 200px;
}

.card-preview {
  width: 100%;
  aspect-ratio: 1.35;
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

/* ── Items list (stats / process / approach) ── */
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

@media (min-width: 900px) {
  .environment-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 1100px) {
  .stack-list.two-col {
    grid-template-columns: 1fr;
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
  .card-form-grid,
  .item-fields {
    grid-template-columns: 1fr;
  }

  .card-image-upload {
    width: 100%;
  }

  .cards-list.two-col,
  .items-list.two-col {
    grid-template-columns: 1fr;
  }
}
</style>
