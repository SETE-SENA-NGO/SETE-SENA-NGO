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

interface ItemCard {
  title: string
  text: string
}

interface SectionContent {
  label: string
  heading: string
  body: string
  items: ItemCard[]
}

type AboutPageContent = {
  values: SectionContent
  team: SectionContent
  reach: SectionContent
}

const PAGE_SLUG = 'about'
const MAX_VALUES = 10
const MAX_TEAM = 10
const MAX_REACH = 10

function getString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const defaultValues: ItemCard[] = [
  { title: 'Honesty', text: 'Clear communication and transparent relationships with donors, communities, partners and staff.' },
  { title: 'Non-discrimination', text: 'Respect for people across disability, religion, background, race, community status and political belief.' },
  { title: 'Collective Benefit', text: 'Organizational resources and knowledge are used for shared benefit, not private advantage.' },
  { title: 'Flexibility', text: 'Plans adapt to community feedback, partner advice, available resources and real field needs.' },
]

const defaultTeam: ItemCard[] = [
  { title: 'Board of Directors', text: 'Policy and oversight, including senior Buddhist leadership.' },
  { title: 'Executive Director', text: 'Daily operations and strategic execution.' },
  { title: 'Management Committee', text: 'Coordinates programs across provinces.' },
  { title: 'Technical Coordination', text: 'Provides inputs across thematic areas.' },
  { title: 'Professional Staff', text: 'Full-time and project-based experts in agriculture, education and rural development.' },
]

const defaultReach: ItemCard[] = [
  { title: 'Svay Rieng', text: '' },
  { title: 'Prey Veng', text: '' },
  { title: 'Kratie', text: '' },
]

function createFallbackContent(): AboutPageContent {
  return {
    values: {
      label: 'Core values',
      heading: 'Values That Guide The Work',
      body: 'These values shape how Santi Sena works with communities, donors and partners.',
      items: defaultValues.map(c => ({ ...c })),
    },
    team: {
      label: 'Team',
      heading: 'A team of monks, managers and master practitioners.',
      body: 'From the Board of Directors to field staff in Kratie, every level is accountable to the villagers served and donors who trust Santi Sena.',
      items: defaultTeam.map(c => ({ ...c })),
    },
    reach: {
      label: 'Geographical reach',
      heading: 'Three provinces. Forty-three communes. Two hundred and ninety-three villages.',
      body: 'Santi Sena works across Svay Rieng, Prey Veng and Kratie.',
      items: defaultReach.map(c => ({ ...c })),
    },
  }
}

function cloneContent(content: AboutPageContent): AboutPageContent {
  return {
    values: {
      ...content.values,
      items: content.values.items.map(c => ({ ...c })),
    },
    team: {
      ...content.team,
      items: content.team.items.map(c => ({ ...c })),
    },
    reach: {
      ...content.reach,
      items: content.reach.items.map(c => ({ ...c })),
    },
  }
}

const contentStore = useContentStore()
const ui = useUiStore()
const { locale } = useI18n()
useAdminTheme()

const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

const pageRow = ref<PageContent | null>(null)
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')

const draft = reactive<AboutPageContent>(createFallbackContent())

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
    key: 'values',
    getSnapshot: () => ({
      ...draft.values,
      items: draft.values.items.map(c => ({ ...c })),
    }),
    applySnapshot: (value) => {
      draft.values = value
    },
  },
  {
    key: 'team',
    getSnapshot: () => ({
      ...draft.team,
      items: draft.team.items.map(c => ({ ...c })),
    }),
    applySnapshot: (value) => {
      draft.team = value
    },
  },
  {
    key: 'reach',
    getSnapshot: () => ({
      ...draft.reach,
      items: draft.reach.items.map(c => ({ ...c })),
    }),
    applySnapshot: (value) => {
      draft.reach = value
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

const canAddValue = computed(() => draft.values.items.length < MAX_VALUES)
const canAddTeam = computed(() => draft.team.items.length < MAX_TEAM)
const canAddReach = computed(() => draft.reach.items.length < MAX_REACH)

const sections = [
  { id: 'about-values', label: 'Values', icon: 'mdi-star' },
  { id: 'about-team', label: 'Team', icon: 'mdi-account-group' },
  { id: 'about-reach', label: 'Reach', icon: 'mdi-map-marker' },
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
    replaceDraft(mergeContent(createFallbackContent(), parseCmsBody(page?.body ?? '')))
    updateSnapshot()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load About content.'
    ui.addToast(loadError.value, 'error')
  } finally {
    loading.value = false
    setupSectionWatch()
  }
}

function replaceDraft(content: AboutPageContent) {
  draft.values = { ...content.values, items: content.values.items.map(c => ({ ...c })) }
  draft.team = { ...content.team, items: content.team.items.map(c => ({ ...c })) }
  draft.reach = { ...content.reach, items: content.reach.items.map(c => ({ ...c })) }
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
      title: 'About Santi Sena',
      body: JSON.stringify(content, null, 2),
      locale: activeLocale.value,
      route_path: '/about',
      nav_group: 'About',
      template: 'standard',
      status: 'published',
      updated_at: pageRow.value?.updated_at ?? '',
    })

    pageRow.value = saved
    replaceDraft(content)
    updateSnapshot()
    ui.addToast(`About ${activeLocaleName.value} content saved.`, 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save About content.', 'error')
  } finally {
    saving.value = false
  }
}

function addItem(section: 'values' | 'team' | 'reach') {
  const map = {
    values: { items: draft.values.items, label: 'New value', cb: canAddValue },
    team: { items: draft.team.items, label: 'New team member', cb: canAddTeam },
    reach: { items: draft.reach.items, label: 'New province', cb: canAddReach },
  }
  const target = map[section]
  if (!target.cb.value) return
  target.items.push({ title: target.label, text: '' })
}

function removeItem(items: ItemCard[], index: number, label: string) {
  const item = items[index]
  if (!item) return
  const itemTitle = item.title || 'this item'
  confirmDialog(
    `Remove ${label}?`,
    `Remove "${itemTitle}" from the public About page?`,
    () => {
      items.splice(index, 1)
      ui.addToast(`${label} removed.`, 'warning')
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
    'Reset About content?',
    'Restore the default core values, team members and provinces?',
    () => {
      replaceDraft(createFallbackContent())
      ui.addToast('Default About draft restored.', 'info')
    },
  )
}

function prepareForSave(content: AboutPageContent) {
  return {
    kind: 'santi-sena-page-content',
    version: 1,
    sections: [
      {
        id: 'about-values',
        label: content.values.label.trim(),
        heading: content.values.heading.trim(),
        body: content.values.body.trim(),
        items: content.values.items
          .filter(c => c.title.trim())
          .map(c => `${c.title.trim()}${c.text.trim() ? ` | ${c.text.trim()}` : ''}`)
          .join('\n'),
      },
      {
        id: 'about-team',
        label: content.team.label.trim(),
        heading: content.team.heading.trim(),
        body: content.team.body.trim(),
        items: content.team.items
          .filter(c => c.title.trim())
          .map(c => `${c.title.trim()}${c.text.trim() ? ` | ${c.text.trim()}` : ''}`)
          .join('\n'),
      },
      {
        id: 'about-reach',
        label: content.reach.label.trim(),
        heading: content.reach.heading.trim(),
        body: content.reach.body.trim(),
        items: content.reach.items
          .filter(c => c.title.trim())
          .map(c => c.title.trim())
          .join('\n'),
      },
    ],
  }
}

function validateDraft() {
  if (!draft.values.items.length) return 'Add at least one core value.'
  if (!draft.team.items.length) return 'Add at least one team member.'
  if (!draft.reach.items.length) return 'Add at least one province.'
  if (draft.values.items.some(c => !c.title.trim())) return 'Each core value needs a title.'
  if (draft.team.items.some(c => !c.title.trim())) return 'Each team member needs a title.'
  return ''
}

function parseCmsBody(body: string): Partial<AboutPageContent> | null {
  if (!body.trim()) return null
  try {
    const parsed = JSON.parse(body) as unknown
    if (!isRecord(parsed)) return null

    // Old format uses `kind` + `sections` array
    const sections = Array.isArray(parsed.sections) ? parsed.sections : []
    const result: Partial<AboutPageContent> = {}

    const valuesSection = sections.find((s: any) => s?.id === 'about-values')
    if (valuesSection) {
      result.values = {
        label: getString(valuesSection.label) || 'Core values',
        heading: getString(valuesSection.heading) || 'Values That Guide The Work',
        body: getString(valuesSection.body),
        items: (getString(valuesSection.items) || '')
          .split('\n')
          .filter((l: string) => l.trim())
          .map((line: string) => {
            const trimmed = line.trim()
            if (trimmed.includes('|')) {
              const [title, ...rest] = trimmed.split('|').map((p: string) => p.trim())
              return { title: title || trimmed, text: rest.join(' | ') }
            }
            return { title: trimmed, text: '' }
          }),
      }
    }

    const teamSection = sections.find((s: any) => s?.id === 'about-team')
    if (teamSection) {
      result.team = {
        label: getString(teamSection.label) || 'Team',
        heading: getString(teamSection.heading) || 'A team of monks, managers and master practitioners.',
        body: getString(teamSection.body),
        items: (getString(teamSection.items) || '')
          .split('\n')
          .filter((l: string) => l.trim())
          .map((line: string) => {
            const trimmed = line.trim()
            if (trimmed.includes('|')) {
              const [title, ...rest] = trimmed.split('|').map((p: string) => p.trim())
              return { title: title || trimmed, text: rest.join(' | ') }
            }
            return { title: trimmed, text: '' }
          }),
      }
    }

    const reachSection = sections.find((s: any) => s?.id === 'about-reach')
    if (reachSection) {
      result.reach = {
        label: getString(reachSection.label) || 'Geographical reach',
        heading: getString(reachSection.heading) || 'Three provinces...',
        body: getString(reachSection.body),
        items: (getString(reachSection.items) || '')
          .split('\n')
          .filter((l: string) => l.trim())
          .map((line: string) => ({ title: line.trim(), text: '' })),
      }
    }

    return result
  } catch {
    return null
  }
}

function mergeContent(
  base: AboutPageContent,
  override: Partial<AboutPageContent> | null,
): AboutPageContent {
  if (!override) return cloneContent(base)

  const mergeSection = (
    baseSec: SectionContent,
    overrideSec: Partial<SectionContent> | undefined,
  ): SectionContent => {
    if (!overrideSec) return { ...baseSec, items: baseSec.items.map(c => ({ ...c })) }
    return {
      label: overrideSec.label?.trim() ? overrideSec.label : baseSec.label,
      heading: overrideSec.heading?.trim() ? overrideSec.heading : baseSec.heading,
      body: overrideSec.body?.trim() ? overrideSec.body : baseSec.body,
      items: Array.isArray(overrideSec.items) && overrideSec.items.length
        ? overrideSec.items.filter(c => c && c.title).map(c => ({ ...c }))
        : baseSec.items.map(c => ({ ...c })),
    }
  }

  return {
    values: mergeSection(base.values, override.values),
    team: mergeSection(base.team, override.team),
    reach: mergeSection(base.reach, override.reach),
  }
}
</script>

<template>
  <v-app :class="['about-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Manage About Page</h1>
            <div class="manager-meta">
              <v-chip size="small" variant="tonal" color="primary">{{ activeLocaleName }} content</v-chip>
              <v-chip size="small" variant="tonal" color="primary">{{ draft.values.items.length }} core values</v-chip>
              <v-chip size="small" variant="tonal" color="primary">{{ draft.team.items.length }} team members</v-chip>
              <v-chip size="small" variant="tonal" color="primary">{{ draft.reach.items.length }} provinces</v-chip>
              <v-chip v-if="pageRow?.updated_at" size="small" variant="tonal" color="success">Saved</v-chip>
            </div>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/about" target="_blank">
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
            <span class="mt-4 font-weight-bold">Loading About content...</span>
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
            aria-label="About page sections"
            save-label="Save Change"
            @navigate="scrollToSection"
            @save="savePage"
          />

          <!-- ── CORE VALUES ── -->
          <AdminEditorPanel
            :id="sections[0].id"
            kicker="Section 1"
            heading="Core Values — Values That Guide The Work"
            :editing="!!editingSections.values"
            :collapsed="!!collapsedSections.values"
            @toggle-edit="toggleEdit('values')"
            @cancel="cancelEdit('values')"
            @toggle-collapse="toggleCollapse('values')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddValue" @click="addItem('values')">
                  <v-icon start>mdi-plus</v-icon>
                  Add value
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="panel-body form-grid">
              <v-text-field v-model="draft.values.label" label="Section label" :disabled="!editingSections.values" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.values.heading" label="Section heading" :disabled="!editingSections.values" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.values.body" label="Section description" rows="2" :disabled="!editingSections.values" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>

            <v-divider class="mx-4" />
            <div class="pa-4">
              <div class="d-flex align-center mb-3">
                <h3 class="text-subtitle-1 font-weight-bold" style="color: var(--admin-theme-contrast);">Core Values ({{ draft.values.items.length }})</h3>
              </div>

              <v-slide-y-transition group tag="div" class="items-list">
                <article v-for="(item, index) in draft.values.items" :key="'val-' + index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h4>{{ item.title || 'New value' }}</h4>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.values || index === 0" @click="moveItem(draft.values.items, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.values || index === draft.values.items.length - 1" @click="moveItem(draft.values.items, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.values && draft.values.items.length > 1" icon color="error" variant="tonal" size="x-small" @click="removeItem(draft.values.items, index, 'core value')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields">
                    <v-text-field v-model="item.title" label="Title" :disabled="!editingSections.values" hide-details density="compact" variant="outlined" />
                    <v-text-field v-model="item.text" label="Description" :disabled="!editingSections.values" hide-details density="compact" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ── TEAM ── -->
          <AdminEditorPanel
            :id="sections[1].id"
            kicker="Section 2"
            heading="Team — A team of monks, managers and master practitioners."
            :editing="!!editingSections.team"
            :collapsed="!!collapsedSections.team"
            @toggle-edit="toggleEdit('team')"
            @cancel="cancelEdit('team')"
            @toggle-collapse="toggleCollapse('team')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddTeam" @click="addItem('team')">
                  <v-icon start>mdi-plus</v-icon>
                  Add member
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="panel-body form-grid">
              <v-text-field v-model="draft.team.label" label="Section label" :disabled="!editingSections.team" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.team.heading" label="Section heading" :disabled="!editingSections.team" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.team.body" label="Section description" rows="2" :disabled="!editingSections.team" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>

            <v-divider class="mx-4" />
            <div class="pa-4">
              <div class="d-flex align-center mb-3">
                <h3 class="text-subtitle-1 font-weight-bold" style="color: var(--admin-theme-contrast);">Team Members ({{ draft.team.items.length }})</h3>
              </div>

              <v-slide-y-transition group tag="div" class="items-list">
                <article v-for="(item, index) in draft.team.items" :key="'team-' + index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h4>{{ item.title || 'New member' }}</h4>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.team || index === 0" @click="moveItem(draft.team.items, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.team || index === draft.team.items.length - 1" @click="moveItem(draft.team.items, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.team && draft.team.items.length > 1" icon color="error" variant="tonal" size="x-small" @click="removeItem(draft.team.items, index, 'team member')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields">
                    <v-text-field v-model="item.title" label="Title" :disabled="!editingSections.team" hide-details density="compact" variant="outlined" />
                    <v-text-field v-model="item.text" label="Description" :disabled="!editingSections.team" hide-details density="compact" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ── REACH ── -->
          <AdminEditorPanel
            :id="sections[2].id"
            kicker="Section 3"
            heading="Geographical Reach — Three provinces. Forty-three communes. Two hundred and ninety-three villages."
            :editing="!!editingSections.reach"
            :collapsed="!!collapsedSections.reach"
            @toggle-edit="toggleEdit('reach')"
            @cancel="cancelEdit('reach')"
            @toggle-collapse="toggleCollapse('reach')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddReach" @click="addItem('reach')">
                  <v-icon start>mdi-plus</v-icon>
                  Add province
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="panel-body form-grid">
              <v-text-field v-model="draft.reach.label" label="Section label" :disabled="!editingSections.reach" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.reach.heading" label="Section heading" :disabled="!editingSections.reach" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.reach.body" label="Section description" rows="2" :disabled="!editingSections.reach" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>

            <v-divider class="mx-4" />
            <div class="pa-4">
              <div class="d-flex align-center mb-3">
                <h3 class="text-subtitle-1 font-weight-bold" style="color: var(--admin-theme-contrast);">Provinces ({{ draft.reach.items.length }})</h3>
              </div>

              <v-slide-y-transition group tag="div" class="items-list">
                <article v-for="(item, index) in draft.reach.items" :key="'reach-' + index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h4>{{ item.title || 'New province' }}</h4>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.reach || index === 0" @click="moveItem(draft.reach.items, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.reach || index === draft.reach.items.length - 1" @click="moveItem(draft.reach.items, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.reach && draft.reach.items.length > 1" icon color="error" variant="tonal" size="x-small" @click="removeItem(draft.reach.items, index, 'province')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields">
                    <v-text-field v-model="item.title" label="Province name" :disabled="!editingSections.reach" hide-details density="compact" variant="outlined" class="field-wide" />
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
.about-admin {
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
  gap: 0.5rem;
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

.card-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
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

/* ── Items list ── */
.items-list {
  display: grid;
  gap: 0.65rem;
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
  padding: 0.55rem 1.25rem;
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
  font-weight: 900;
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
  gap: 1rem 0.75rem;
  padding: 0.85rem 1.25rem;
}

.item-fields .field-wide {
  grid-column: 1 / -1;
}

@media (min-width: 900px) {
  .about-admin.sidebar-open {
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
}
</style>
