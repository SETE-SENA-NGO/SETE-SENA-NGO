<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminTheme } from '@/composables/useAdminTheme'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminEditorPanel from '@/components/admin/AdminEditorPanel.vue'
import AdminSectionNav from '@/components/admin/AdminSectionNav.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import { useSectionEditor } from '@/composables/useSectionEditor'
import { useScrollSpyNav } from '@/composables/useScrollSpyNav'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import type { SupportedLocale } from '@/i18n'
import { useContentStore } from '@/stores/content.store'
import { useUiStore } from '@/stores/ui.store'
import type { PageContent } from '@/types/content'

interface VisionCard {
  title: string
  text: string
}

interface ValueCard {
  title: string
  text: string
}

type VisionMissionContent = {
  vision: {
    label: string
    heading: string
    body: string
    cards: VisionCard[]
  }
  mission: {
    label: string
    heading: string
    body: string
    items: string[]
  }
  values: {
    label: string
    heading: string
    desc: string
    cards: ValueCard[]
  }
}

const PAGE_SLUG = 'about-vision'
const MAX_VISION_CARDS = 6
const MAX_MISSION_ITEMS = 10
const MAX_VALUE_CARDS = 6

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

const defaultVisionCards: VisionCard[] = [
  { title: 'Peace With Justice', text: 'A Cambodia where peace, justice and harmony are lived in daily village life, not only written in plans.' },
  { title: 'Community Ownership', text: 'Villagers, monks, local authorities, schools and community organizations lead the work together.' },
  { title: 'Sustainable Livelihoods', text: 'Families build better lives through education, child protection, rural income and care for natural resources.' },
]

const defaultMissionItems: string[] = [
  'Work with monks, villagers, local government and schools',
  'Strengthen education, savings groups and rural livelihoods',
  'Protect children from trafficking, unsafe migration and exploitation',
  'Preserve community forests, water resources and local resilience',
]

const defaultValues: ValueCard[] = [
  { title: 'Honesty', text: 'Clear communication and transparent relationships with donors, communities, partners and staff.' },
  { title: 'Non-discrimination', text: 'Respect for people across disability, religion, background, race, community status and political belief.' },
  { title: 'Collective Benefit', text: 'Organizational resources and knowledge are used for shared benefit, not private advantage.' },
  { title: 'Flexibility', text: 'Plans adapt to community feedback, partner advice, available resources and real field needs.' },
]

const fallbackContent: VisionMissionContent = {
  vision: {
    label: 'Vision',
    heading: 'What Santi Sena Strives For',
    body: 'Peace With Justice, Community Ownership and Sustainable Livelihoods.',
    cards: defaultVisionCards.map((c) => ({ ...c })),
  },
  mission: {
    label: 'Mission',
    heading: 'How The Mission Becomes Practical',
    body: 'Santi Sena alleviates poverty through community-led development rooted in Buddhist ethics. Its work connects moral leadership with practical programs in education, livelihoods, environment and child protection.',
    items: [...defaultMissionItems],
  },
  values: {
    label: 'Core Values',
    heading: 'Values That Guide The Work',
    desc: 'These values shape how Santi Sena works with communities, donors and partners.',
    cards: defaultValues.map((v) => ({ ...v })),
  },
}

const contentStore = useContentStore()
const ui = useUiStore()
const { locale } = useI18n()

const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

useAdminTheme()

const pageRow = ref<PageContent | null>(null)
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')

const draft = reactive<VisionMissionContent>(cloneContent(fallbackContent))

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
    key: 'vision',
    getSnapshot: () => ({
      ...draft.vision,
      cards: draft.vision.cards.map((c) => ({ ...c })),
    }),
    applySnapshot: (value) => {
      draft.vision = value
    },
  },
  {
    key: 'mission',
    getSnapshot: () => ({
      ...draft.mission,
      items: [...draft.mission.items],
    }),
    applySnapshot: (value) => {
      draft.mission = value
    },
  },
  {
    key: 'values',
    getSnapshot: () => ({
      ...draft.values,
      cards: draft.values.cards.map((c) => ({ ...c })),
    }),
    applySnapshot: (value) => {
      draft.values = value
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

const activeLocale = computed<SupportedLocale>(() =>
  locale.value === 'kh' ? 'kh' : 'en',
)
const activeLocaleName = computed(() =>
  activeLocale.value === 'kh' ? 'Khmer' : 'English',
)

const canAddVisionCard = computed(() => draft.vision.cards.length < MAX_VISION_CARDS)
const canAddMissionItem = computed(() => draft.mission.items.length < MAX_MISSION_ITEMS)
const canAddValueCard = computed(() => draft.values.cards.length < MAX_VALUE_CARDS)

const sections = [
  { id: 'vision-section', label: 'Vision', icon: 'mdi-eye' },
  { id: 'mission-section', label: 'Mission', icon: 'mdi-bullseye' },
  { id: 'values-section', label: 'Values', icon: 'mdi-hexagon-multiple' },
] as const

const { activeSection, scrollToSection, updateActiveSectionFromScroll } = useScrollSpyNav(sections)

useUnsavedChangesGuard(hasChanges)

onMounted(() => {
  contentStore.useLocalFallback()
  void loadPage()
})

onUnmounted(() => {
  stopSectionWatch()
})

watch(activeLocale, () => {
  void loadPage()
})

async function loadPage() {
  resetEditingState()
  loading.value = true
  loadError.value = ''

  try {
    const page = await contentStore.fetchBySlug(PAGE_SLUG, activeLocale.value)
    pageRow.value = page
    replaceDraft(mergeContent(fallbackContent, parseCmsBody(page?.body ?? '')))
    updateSnapshot()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load Vision & Mission content.'
    ui.addToast(loadError.value, 'error')
  } finally {
    loading.value = false
    setupSectionWatch()
  }
}

function replaceDraft(content: VisionMissionContent) {
  draft.vision = {
    ...content.vision,
    cards: content.vision.cards.map((c) => ({ ...c })),
  }
  draft.mission = {
    ...content.mission,
    items: [...content.mission.items],
  }
  draft.values = {
    ...content.values,
    cards: content.values.cards.map((c) => ({ ...c })),
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
    const content = prepareForSave(draft)
    const saved = await contentStore.upsert({
      id: pageRow.value?.id ?? '',
      slug: PAGE_SLUG,
      title: 'Vision & Mission',
      body: JSON.stringify(content, null, 2),
      locale: activeLocale.value,
      route_path: '/about/vision',
      nav_group: 'About',
      template: 'standard',
      status: 'published',
      updated_at: pageRow.value?.updated_at ?? '',
    })

    pageRow.value = saved
    replaceDraft(content)
    updateSnapshot()
    ui.addToast(`Vision & Mission ${activeLocaleName.value} content saved.`, 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save Vision & Mission content.', 'error')
  } finally {
    saving.value = false
  }
}

function addVisionCard() {
  if (!canAddVisionCard.value) return
  draft.vision.cards.push({ title: 'New vision card', text: 'Describe this vision element.' })
}

function addMissionItem() {
  if (!canAddMissionItem.value) return
  draft.mission.items.push('')
}

function addValueCard() {
  if (!canAddValueCard.value) return
  draft.values.cards.push({ title: 'New core value', text: 'Describe this value.' })
}

function removeItem<T extends { title?: string; name?: string }>(
  items: T[],
  index: number,
  label: string,
) {
  const item = items[index]
  if (!item) return
  const itemTitle = item.title || item.name || 'this item'
  confirmDialog(
    `Remove ${label}?`,
    `Remove "${itemTitle}" from the public page?`,
    () => {
      items.splice(index, 1)
      ui.addToast(`${label} removed.`, 'warning')
    },
  )
}

function removeMissionItem(index: number) {
  if (draft.mission.items.length <= 1) return
  confirmDialog(
    'Remove mission item?',
    `Remove item ${index + 1}?`,
    () => {
      draft.mission.items.splice(index, 1)
    },
  )
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

function resetToDefaults() {
  confirmDialog(
    'Reset Vision & Mission content?',
    'Restore default vision cards, mission content and core values?',
    () => {
      replaceDraft(cloneContent(fallbackContent))
      ui.addToast('Default Vision & Mission draft restored.', 'info')
    },
  )
}

function prepareForSave(content: VisionMissionContent): VisionMissionContent {
  return {
    vision: {
      label: content.vision.label.trim(),
      heading: content.vision.heading.trim(),
      body: content.vision.body.trim(),
      cards: content.vision.cards
        .filter((c) => c.title.trim())
        .map((c) => ({ title: c.title.trim(), text: c.text.trim() })),
    },
    mission: {
      label: content.mission.label.trim(),
      heading: content.mission.heading.trim(),
      body: content.mission.body.trim(),
      items: content.mission.items.map((item) => item.trim()).filter(Boolean),
    },
    values: {
      label: content.values.label.trim(),
      heading: content.values.heading.trim(),
      desc: content.values.desc.trim(),
      cards: content.values.cards
        .filter((c) => c.title.trim())
        .map((c) => ({ title: c.title.trim(), text: c.text.trim() })),
    },
  }
}

function validateDraft() {
  if (!draft.vision.cards.length) return 'Add at least one vision card.'
  if (!draft.mission.items.length) return 'Add at least one mission item.'
  if (!draft.values.cards.length) return 'Add at least one core value.'
  if (draft.vision.cards.some((c) => !c.title.trim())) return 'Each vision card needs a title.'
  if (draft.values.cards.some((c) => !c.title.trim())) return 'Each core value needs a title.'
  return ''
}

function parseCmsBody(body: string): Partial<VisionMissionContent> | null {
  if (!body.trim()) return null
  try {
    const parsed = JSON.parse(body) as unknown
    // Old format uses `kind` + `sections` — map it to the new shape
    if (isRecord(parsed) && parsed.kind === 'santi-sena-page-content') {
      const sections = Array.isArray(parsed.sections) ? parsed.sections : []
      const result: Partial<VisionMissionContent> = {}

      const striveSection = sections.find((s: any) => s?.id === 'vision-strive')
      if (striveSection) {
        result.vision = {
          label: getString(striveSection.label) || 'Vision',
          heading: getString(striveSection.heading) || 'What We Strive For',
          body: getString(striveSection.body),
          cards: (getString(striveSection.items) || '')
            .split('\n')
            .filter((l: string) => l.trim())
            .map((line: string) => {
              const [title, ...rest] = line.split('|').map((p: string) => p.trim())
              return { title: title || line, text: rest.join(' | ') || '' }
            }),
        }
      }

      const missionSection = sections.find((s: any) => s?.id === 'mission-content')
      if (missionSection) {
        result.mission = {
          label: getString(missionSection.label) || 'Mission',
          heading: getString(missionSection.heading) || 'How The Mission Becomes Practical',
          body: getString(missionSection.body),
          items: (getString(missionSection.items) || '')
            .split('\n')
            .filter((l: string) => l.trim())
            .map((l: string) => l.trim()),
        }
      }

      const guidesSection = sections.find((s: any) => s?.id === 'vision-guides')
      if (guidesSection) {
        result.values = {
          label: getString(guidesSection.label) || 'Core Values',
          heading: getString(guidesSection.heading) || 'Values That Guide The Work',
          desc: getString(guidesSection.body),
          cards: (getString(guidesSection.items) || '')
            .split('\n')
            .filter((l: string) => l.trim())
            .map((line: string) => {
              const trimmed = line.trim()
              if (trimmed.includes('|')) {
                const [title, ...rest] = trimmed.split('|').map((p: string) => p.trim())
                return { title: title || trimmed, text: rest.join(' | ') }
              }
              const commaIdx = trimmed.indexOf(',')
              if (commaIdx > 0 && commaIdx < 30) {
                return { title: trimmed.slice(0, commaIdx).trim(), text: trimmed.slice(commaIdx + 1).trim() }
              }
              return { title: trimmed, text: '' }
            }),
        }
      }

      return result
    }
    return isRecord(parsed) ? (parsed as Partial<VisionMissionContent>) : null
  } catch {
    return null
  }
}

function mergeContent(
  base: VisionMissionContent,
  override: Partial<VisionMissionContent> | null,
): VisionMissionContent {
  if (!override) return cloneContent(base)

  const visionOverride = isRecord(override.vision) ? override.vision : {}
  const missionOverride = isRecord(override.mission) ? override.mission : {}
  const valuesOverride = isRecord(override.values) ? override.values : {}

  return {
    vision: {
      ...base.vision,
      ...visionOverride,
      cards: mergeCards(visionOverride.cards, base.vision.cards),
    } as VisionMissionContent['vision'],
    mission: {
      ...base.mission,
      ...missionOverride,
      items: Array.isArray(missionOverride.items) && missionOverride.items.length
        ? missionOverride.items.map(String)
        : [...base.mission.items],
    } as VisionMissionContent['mission'],
    values: {
      ...base.values,
      ...valuesOverride,
      cards: mergeCards(valuesOverride.cards, base.values.cards),
    } as VisionMissionContent['values'],
  }
}

function mergeCards(override: unknown, fallback: Array<{ title: string; text: string }>) {
  if (!Array.isArray(override) || !override.length) return fallback.map((c) => ({ ...c }))
  return override.filter(isRecord).map((c) => ({
    title: getString(c.title),
    text: getString(c.text) || getString(c.text),
  }))
}

function mergeObject<T>(base: T, override: unknown): T {
  return isRecord(override) ? { ...base, ...override } as T : { ...base }
}

function cloneContent(content: VisionMissionContent): VisionMissionContent {
  return {
    vision: {
      ...content.vision,
      cards: content.vision.cards.map((c) => ({ ...c })),
    },
    mission: {
      ...content.mission,
      items: [...content.mission.items],
    },
    values: {
      ...content.values,
      cards: content.values.cards.map((c) => ({ ...c })),
    },
  }
}
</script>

<template>
  <v-app :class="['vision-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Manage Vision, Mission & Core Values</h1>
            <div class="manager-meta">
              <v-chip size="small" variant="tonal" color="primary">{{ activeLocaleName }} content</v-chip>
              <v-chip size="small" variant="tonal" color="primary">{{ draft.vision.cards.length }} vision cards</v-chip>
              <v-chip size="small" variant="tonal" color="primary">{{ draft.mission.items.length }} mission items</v-chip>
              <v-chip size="small" variant="tonal" color="primary">{{ draft.values.cards.length }} core values</v-chip>
            </div>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/about/vision" target="_blank">
              <v-icon start>mdi-open-in-new</v-icon>
              View page
            </v-btn>
            <v-btn variant="tonal" @click="resetToDefaults">
              <v-icon start>mdi-restore</v-icon>
              Reset draft
            </v-btn>
          </div>
        </header>

        <v-fade-transition mode="out-in" @after-enter="updateActiveSectionFromScroll">
          <div v-if="loading" key="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading Vision & Mission content...</span>
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
            aria-label="Vision & Mission page sections"
            save-label="Save Change"
            @navigate="scrollToSection"
            @save="savePage"
          />

          <!-- ── VISION ── -->
          <AdminEditorPanel
            :id="sections[0].id"
            kicker="Section 1"
            heading="Vision — What We Strive For"
            :editing="!!editingSections.vision"
            :collapsed="!!collapsedSections.vision"
            @toggle-edit="toggleEdit('vision')"
            @cancel="cancelEdit('vision')"
            @toggle-collapse="toggleCollapse('vision')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddVisionCard" @click="addVisionCard">
                  <v-icon start>mdi-plus</v-icon>
                  Add card
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="panel-body form-grid">
              <v-text-field v-model="draft.vision.label" label="Section label" :disabled="!editingSections.vision" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.vision.heading" label="Section heading" :disabled="!editingSections.vision" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.vision.body" label="Description" rows="2" :disabled="!editingSections.vision" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>

            <v-divider class="mx-4" />
            <div class="pa-4">
              <div class="d-flex align-center mb-3">
                <h3 class="text-subtitle-1 font-weight-bold" style="color: var(--admin-theme-contrast);">Vision Cards ({{ draft.vision.cards.length }})</h3>
              </div>

              <v-slide-y-transition group tag="div" class="items-list">
                <article v-for="(card, index) in draft.vision.cards" :key="'vision-' + index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h4>{{ card.title || 'New card' }}</h4>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.vision || index === 0" @click="moveItem(draft.vision.cards, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.vision || index === draft.vision.cards.length - 1" @click="moveItem(draft.vision.cards, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.vision" icon color="error" variant="tonal" size="x-small" @click="removeItem(draft.vision.cards, index, 'vision card')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields">
                    <v-text-field v-model="card.title" label="Title" :disabled="!editingSections.vision" hide-details density="compact" variant="outlined" />
                    <v-text-field v-model="card.text" label="Description" :disabled="!editingSections.vision" hide-details density="compact" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ── MISSION ── -->
          <AdminEditorPanel
            :id="sections[1].id"
            kicker="Section 2"
            heading="Mission — How The Mission Becomes Practical"
            :editing="!!editingSections.mission"
            :collapsed="!!collapsedSections.mission"
            @toggle-edit="toggleEdit('mission')"
            @cancel="cancelEdit('mission')"
            @toggle-collapse="toggleCollapse('mission')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddMissionItem" @click="addMissionItem">
                  <v-icon start>mdi-plus</v-icon>
                  Add item
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="panel-body form-grid">
              <v-text-field v-model="draft.mission.label" label="Section label" :disabled="!editingSections.mission" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.mission.heading" label="Section heading" :disabled="!editingSections.mission" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.mission.body" label="Mission body text" rows="3" :disabled="!editingSections.mission" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>

            <v-divider class="mx-4" />
            <div class="pa-4">
              <div class="d-flex align-center mb-3">
                <h3 class="text-subtitle-1 font-weight-bold" style="color: var(--admin-theme-contrast);">Mission Items ({{ draft.mission.items.length }})</h3>
              </div>

              <v-slide-y-transition group tag="div" class="items-list">
                <article v-for="(item, index) in draft.mission.items" :key="'mission-' + index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h4>Item {{ index + 1 }}</h4>
                    </div>
                    <div class="card-actions">
                      <v-btn v-if="editingSections.mission && draft.mission.items.length > 1" icon color="error" variant="tonal" size="x-small" @click="removeMissionItem(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields">
                    <v-text-field v-model="draft.mission.items[index]" label="Mission item" :disabled="!editingSections.mission" hide-details density="compact" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ── CORE VALUES ── -->
          <AdminEditorPanel
            :id="sections[2].id"
            kicker="Section 3"
            heading="Core Values — Values That Guide The Work"
            :editing="!!editingSections.values"
            :collapsed="!!collapsedSections.values"
            @toggle-edit="toggleEdit('values')"
            @cancel="cancelEdit('values')"
            @toggle-collapse="toggleCollapse('values')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddValueCard" @click="addValueCard">
                  <v-icon start>mdi-plus</v-icon>
                  Add value
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="panel-body form-grid">
              <v-text-field v-model="draft.values.label" label="Section label" :disabled="!editingSections.values" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.values.heading" label="Section heading" :disabled="!editingSections.values" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.values.desc" label="Section description" rows="2" :disabled="!editingSections.values" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>

            <v-divider class="mx-4" />
            <div class="pa-4">
              <div class="d-flex align-center mb-3">
                <h3 class="text-subtitle-1 font-weight-bold" style="color: var(--admin-theme-contrast);">Core Values ({{ draft.values.cards.length }})</h3>
              </div>

              <v-slide-y-transition group tag="div" class="items-list">
                <article v-for="(val, index) in draft.values.cards" :key="'value-' + index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h4>{{ val.title || 'New value' }}</h4>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.values || index === 0" @click="moveItem(draft.values.cards, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.values || index === draft.values.cards.length - 1" @click="moveItem(draft.values.cards, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.values" icon color="error" variant="tonal" size="x-small" @click="removeItem(draft.values.cards, index, 'core value')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields">
                    <v-text-field v-model="val.title" label="Title" :disabled="!editingSections.values" hide-details density="compact" variant="outlined" />
                    <v-text-field v-model="val.text" label="Description" :disabled="!editingSections.values" hide-details density="compact" variant="outlined" class="field-wide" />
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
.vision-admin {
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
  gap: 0.45rem;
  margin-top: 0.2rem;
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
  gap: 0.35rem;
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

/* ── Items list (vision cards, mission items, value cards) ── */
.items-list {
  display: grid;
  gap: 0.75rem;
}

.item-card {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  overflow: hidden;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.item-card:hover {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  box-shadow: 0 4px 14px rgba(15, 95, 73, 0.08);
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 32%, var(--admin-theme-surface));
  padding: 0.65rem 1.25rem;
}

.item-heading {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.item-heading h4 {
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 0.9rem;
  font-weight: 800;
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
  gap: 1.2rem 0.85rem;
  padding: 1rem 1.25rem;
}

.item-fields .field-wide {
  grid-column: 1 / -1;
}

@media (min-width: 900px) {
  .vision-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
    padding-top: calc(60px + 1rem);
  }

  .manager-hero,
  .item-header {
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
}
</style>
