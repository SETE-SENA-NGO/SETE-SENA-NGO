<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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
import type { SupportedLocale } from '@/i18n'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'
import {
  explainPageSaveError,
  savePageByLocale,
  type PageLocalePayload,
} from '@/lib/pagePersistence'

type BannerForm = {
  eyebrow: string
  headline: string
  intro: string
  primaryAction: string
}

// Mirrors the fields ProgramsView.vue renders on the public site for each
// goal card: tag, title, intro, whatWeDo, whyItMatters, quote, image. `color`
// is admin-only (accents this card in the editor) and isn't read by the
// public page.
type GoalForm = {
  tag: string
  title: string
  intro: string
  whatWeDo: string
  whyItMatters: string
  quote: string
  image: string
  color: 'emerald' | 'blue' | 'amber' | 'violet'
}

type ProgramsPageContent = {
  banner: BannerForm
  goals: GoalForm[]
  priorities: string[]
}

const MAX_PRIORITIES = 8

const defaultContent: ProgramsPageContent = {
  banner: {
    eyebrow: 'Our Programs',
    headline: 'Four roots. One tree of peace.',
    intro:
      "Santi Sena's work follows four interwoven strategic goals: environment, education, livelihoods and child protection, each delivered with and by the communities themselves.",
    primaryAction: 'Explore programs',
  },
  goals: [
    {
      tag: 'GOAL 01',
      title: 'Environment',
      intro:
        'Community forestry, biogas digesters, rainwater harvesting and WASH — climate resilience built one household at a time.',
      whatWeDo:
        'Facilitate community forest agreements, install biogas systems, dig wells and support smallholder tree nurseries.',
      whyItMatters:
        'Southeastern Cambodia is one of the most climate-vulnerable regions in the country. Healthy forests and clean water are peacekeeping infrastructure.',
      quote: 'The forest belongs to the pagoda and the pagoda belongs to the village.',
      image: '',
      color: 'emerald',
    },
    {
      tag: 'GOAL 02',
      title: 'Education',
      intro:
        'Pre-schools in remote hamlets, community libraries, and youth scholarships that keep children learning past grade six.',
      whatWeDo:
        'Set up village pre-schools, train local teachers, stock small libraries, and support scholarships for at-risk children — especially girls.',
      whyItMatters:
        "In the districts we work in, many hamlets are more than an hour's walk from the nearest school. Early learning centres change that.",
      quote: 'Our library used to be a bag of ten books under the pagoda. Now the children come every afternoon.',
      image: '',
      color: 'blue',
    },
    {
      tag: 'GOAL 03',
      title: 'Livelihood',
      intro:
        'Saving-for-Change groups, women-led cooperatives, and rural enterprises that keep families out of debt.',
      whatWeDo:
        'Train Saving-for-Change facilitators, seed household enterprises and link cooperatives to fair-price buyers.',
      whyItMatters:
        'Cash predictability is what lets a family send their child to school this term instead of to a garment factory.',
      quote: 'Before the savings group, I borrowed at 10% a month. Now I lend to my neighbours at zero.',
      image: '',
      color: 'amber',
    },
    {
      tag: 'GOAL 04',
      title: 'Child Protection',
      intro:
        'Village-level Child Protection Networks, anti-trafficking outreach, and safe-migration training for youth.',
      whatWeDo:
        'Set up Child Protection Networks, train monks and elders as safeguarding leads, and run safe-migration workshops for young people.',
      whyItMatters:
        'The border with Vietnam brings both opportunity and risk. Community-led safeguarding is the most durable defense.',
      quote: "The safest village is one where every adult knows every child's name.",
      image: '',
      color: 'violet',
    },
  ],
  priorities: [
    'Strengthened governance and accountability',
    'Staff and volunteer development',
    'Income and funding diversification',
    'Research and knowledge management',
    'Public advocacy',
  ],
}

function cloneContent(content: ProgramsPageContent): ProgramsPageContent {
  return {
    banner: { ...content.banner },
    goals: content.goals.map((g) => ({ ...g })),
    priorities: [...content.priorities],
  }
}

const ui = useUiStore()
const { locale } = useI18n()
useAdminTheme()

const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

const activeLocale = computed<SupportedLocale>(() =>
  locale.value === 'kh' ? 'kh' : 'en',
)
const activeLocaleName = computed(() =>
  activeLocale.value === 'kh' ? 'Khmer' : 'English',
)

const loading = ref(false)
const saving = ref(false)
const loadError = ref('')

const draft = reactive<ProgramsPageContent>(cloneContent(defaultContent))

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
    key: 'banner',
    getSnapshot: () => ({ ...draft.banner }),
    applySnapshot: (value) => {
      draft.banner = value
    },
  },
  {
    key: 'goals',
    getSnapshot: () => draft.goals.map((g) => ({ ...g })),
    applySnapshot: (value) => {
      draft.goals = value
    },
  },
  {
    key: 'priorities',
    getSnapshot: () => [...draft.priorities],
    applySnapshot: (value) => {
      draft.priorities = value
    },
  },
])

const originalSnapshot = ref('')
const hasChanges = computed(() => JSON.stringify(cloneContent(draft)) !== originalSnapshot.value)
function updateSnapshot() {
  originalSnapshot.value = JSON.stringify(cloneContent(draft))
}

const canAddPriority = computed(() => draft.priorities.length < MAX_PRIORITIES)

const sections = [
  { id: 'programs-banner', label: 'Banner', icon: 'mdi-image-text' },
  { id: 'programs-goals', label: 'Goals', icon: 'mdi-target' },
  { id: 'programs-priorities', label: 'Priorities', icon: 'mdi-format-list-checks' },
] as const

const { activeSection, scrollToSection, updateActiveSectionFromScroll } = useScrollSpyNav(sections)

useUnsavedChangesGuard(hasChanges)

onMounted(() => {
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
    const localeToLoad = activeLocale.value
    const locales = localeToLoad === 'en' ? ['en'] : [localeToLoad, 'en']

    const { data, error } = await supabase
      .from('pages')
      .select('body, locale, updated_at')
      .eq('slug', 'programs')
      .in('locale', locales)

    if (error) throw error

    const rows = (data ?? []) as { body: string; locale: string; updated_at: string | null }[]
    const row = rows.find((r) => r.locale === localeToLoad) ?? rows.find((r) => r.locale === 'en')

    if (row?.body) {
      try {
        const parsed = JSON.parse(row.body)
        if (parsed?.kind === 'santi-sena-page-content') {
          draft.banner.eyebrow = parsed.eyebrow || draft.banner.eyebrow
          draft.banner.headline = parsed.headline || draft.banner.headline
          draft.banner.intro = parsed.intro || draft.banner.intro
          draft.banner.primaryAction = parsed.primaryAction || draft.banner.primaryAction

          const goalsSection = parsed.sections?.find((s: { id: string }) => s.id === 'programs-goals')
          if (goalsSection?.items) {
            try {
              const loadedGoals = JSON.parse(goalsSection.items)
              if (Array.isArray(loadedGoals)) {
                loadedGoals.forEach((g: Partial<GoalForm>, i: number) => {
                  if (draft.goals[i]) Object.assign(draft.goals[i], g)
                })
              }
            } catch {
              // old format or malformed — keep defaults
            }
          }

          const prioritiesSection = parsed.sections?.find((s: { id: string }) => s.id === 'programs-priorities')
          if (prioritiesSection?.items) {
            draft.priorities = prioritiesSection.items.split('\n').filter((line: string) => line.trim())
          }
        }
      } catch {
        // keep defaults
      }
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load Programs content.'
    ui.addToast(loadError.value, 'error')
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
    const goalsItems = JSON.stringify(draft.goals)
    const prioritiesItems = draft.priorities.filter((line) => line.trim()).join('\n')

    const body = JSON.stringify({
      kind: 'santi-sena-page-content',
      version: 2,
      route: '/programs',
      group: 'Programs',
      eyebrow: draft.banner.eyebrow,
      headline: draft.banner.headline,
      intro: draft.banner.intro,
      heroImageUrl: '',
      primaryAction: draft.banner.primaryAction,
      secondaryAction: '',
      sections: [
        {
          id: 'programs-goals',
          label: 'Program goals',
          heading: 'Four strategic goals',
          body: 'Full goal cards shown on the public Programs page — title, intro, what we do, why it matters, quote, image.',
          items: goalsItems,
        },
        {
          id: 'programs-priorities',
          label: 'Operational priorities',
          heading: 'How we keep the tree alive',
          body: 'Internal priorities that support every program.',
          items: prioritiesItems,
        },
      ],
    })

    const savedAt = new Date().toISOString()
    const payload: PageLocalePayload = {
      slug: 'programs',
      title: draft.banner.headline.trim() || 'Programs',
      body,
      route_path: '/programs',
      nav_group: 'Programs',
      locale: activeLocale.value,
      template: 'standard',
      status: 'published',
      hero_eyebrow: draft.banner.eyebrow.trim() || null,
      hero_headline: draft.banner.headline.trim() || null,
      hero_intro: draft.banner.intro.trim() || null,
      primary_cta_label: draft.banner.primaryAction.trim() || null,
      primary_cta_url: '/programs',
      secondary_cta_label: null,
      secondary_cta_url: null,
      seo_title: draft.banner.headline.trim() || 'Programs',
      seo_description: draft.banner.intro.trim() || null,
      sort_order: 4,
      published_at: savedAt,
      updated_at: savedAt,
    }

    const { error } = await savePageByLocale(payload)
    if (error) throw explainPageSaveError(error)

    ui.addToast(`Programs ${activeLocaleName.value} content saved.`, 'success')
    updateSnapshot()
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save Programs page.', 'error')
  } finally {
    saving.value = false
  }
}

function validateDraft() {
  if (!draft.banner.headline.trim()) return 'Banner headline is required.'

  const invalidGoalIndex = draft.goals.findIndex((g) => !g.title.trim() || !g.intro.trim())
  if (invalidGoalIndex >= 0) return `Goal ${invalidGoalIndex + 1} needs a title and intro.`

  if (!draft.priorities.length) return 'Add at least one operational priority.'

  return ''
}

function addPriority() {
  if (!canAddPriority.value) return
  draft.priorities.push('New priority')
}

function removePriority(index: number) {
  const item = draft.priorities[index]
  if (item === undefined) return

  confirmDialog(
    'Remove priority?',
    `Remove "${item || 'this item'}" from the public Programs page?`,
    () => {
      draft.priorities.splice(index, 1)
      ui.addToast('Priority removed.', 'warning')
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
</script>

<template>
  <v-app :class="['programs-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Manage programs page</h1>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/programs" target="_blank">
              <v-icon start>mdi-open-in-new</v-icon>
              View page
            </v-btn>
          </div>
        </header>

        <v-fade-transition mode="out-in" @after-enter="updateActiveSectionFromScroll">
          <div v-if="loading" key="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading Programs content...</span>
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
            aria-label="Programs page sections"
            save-label="Save changes"
            @navigate="scrollToSection"
            @save="savePage"
          />

          <!-- ── BANNER ── -->
          <AdminEditorPanel
            :id="sections[0].id"
            kicker="Banner"
            heading="Four roots. One tree of peace."
            :editing="!!editingSections.banner"
            :collapsed="collapsedSections.banner"
            @toggle-edit="toggleEdit('banner')"
            @cancel="cancelEdit('banner')"
            @toggle-collapse="toggleCollapse('banner')"
          >
            <div class="panel-body form-grid">
              <v-text-field v-model="draft.banner.eyebrow" label="Small label" :disabled="!editingSections.banner" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.banner.headline" label="Section heading" :disabled="!editingSections.banner" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.banner.intro" label="Description" rows="3" :disabled="!editingSections.banner" hide-details density="comfortable" variant="outlined" class="field-wide" />
              <v-text-field v-model="draft.banner.primaryAction" label="Primary action label" :disabled="!editingSections.banner" hide-details density="comfortable" variant="outlined" />
            </div>
          </AdminEditorPanel>

          <!-- ── PROGRAM GOALS ── -->
          <AdminEditorPanel
            :id="sections[1].id"
            kicker="Program goals"
            heading="Four strategic goals"
            :editing="!!editingSections.goals"
            :collapsed="collapsedSections.goals"
            @toggle-edit="toggleEdit('goals')"
            @cancel="cancelEdit('goals')"
            @toggle-collapse="toggleCollapse('goals')"
          >
            <div class="cards-list two-col">
              <article v-for="(goal, index) in draft.goals" :key="index" class="card-editor" :class="'goal-' + goal.color">
                <header class="card-editor-header">
                  <div class="card-heading">
                    <span class="card-number">{{ goal.tag || String(index + 1).padStart(2, '0') }}</span>
                    <div>
                      <h3>{{ goal.title || 'Untitled goal' }}</h3>
                      <p>{{ goal.intro ? goal.intro.slice(0, 40) + '...' : 'No summary' }}</p>
                    </div>
                  </div>
                  <div class="card-actions">
                    <v-btn icon variant="outlined" size="small" :disabled="!editingSections.goals || index === 0" aria-label="Move goal up" @click="moveItem(draft.goals, index, -1)">
                      <v-icon>mdi-chevron-up</v-icon>
                    </v-btn>
                    <v-btn icon variant="outlined" size="small" :disabled="!editingSections.goals || index === draft.goals.length - 1" aria-label="Move goal down" @click="moveItem(draft.goals, index, 1)">
                      <v-icon>mdi-chevron-down</v-icon>
                    </v-btn>
                  </div>
                </header>

                <div class="card-editor-top">
                  <div class="image-upload-panel card-image-upload">
                    <v-img v-if="goal.image" :src="goal.image" aspect-ratio="1.35" cover class="image-preview card-preview" />
                    <div v-else class="image-preview card-preview image-preview-empty">
                      <v-icon size="28">mdi-image-outline</v-icon>
                    </div>
                    <AdminUploadButton
                      :disabled="!editingSections.goals"
                      :description="`Programs goal-${index} image`"
                      @update:model-value="(url) => (goal.image = url)"
                    />
                  </div>
                </div>

                <div class="card-form-grid">
                  <v-text-field v-model="goal.tag" label="Tag" :disabled="!editingSections.goals" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="goal.title" label="Title" :disabled="!editingSections.goals" hide-details density="comfortable" variant="outlined" />
                  <v-textarea v-model="goal.intro" label="Intro (shown on the compact card)" rows="2" :disabled="!editingSections.goals" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-textarea v-model="goal.whatWeDo" label="What we do" rows="2" :disabled="!editingSections.goals" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-textarea v-model="goal.whyItMatters" label="Why it matters" rows="2" :disabled="!editingSections.goals" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-textarea v-model="goal.quote" label="Quote" rows="2" :disabled="!editingSections.goals" hide-details density="comfortable" variant="outlined" class="field-wide" />
                </div>
              </article>
            </div>
          </AdminEditorPanel>

          <!-- ── OPERATIONAL PRIORITIES ── -->
          <AdminEditorPanel
            :id="sections[2].id"
            kicker="Operational priorities"
            heading="How we keep the tree alive"
            :editing="!!editingSections.priorities"
            :collapsed="collapsedSections.priorities"
            @toggle-edit="toggleEdit('priorities')"
            @cancel="cancelEdit('priorities')"
            @toggle-collapse="toggleCollapse('priorities')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddPriority" @click="addPriority">
                  <v-icon start>mdi-plus</v-icon>
                  Add priority
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="items-list">
                <article v-for="(item, index) in draft.priorities" :key="'priority-' + index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.priorities || index === 0" aria-label="Move priority up" @click="moveItem(draft.priorities, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.priorities || index === draft.priorities.length - 1" aria-label="Move priority down" @click="moveItem(draft.priorities, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.priorities" icon color="error" variant="tonal" size="x-small" aria-label="Remove priority" @click="removePriority(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields">
                    <v-text-field v-model="draft.priorities[index]" label="Priority" :disabled="!editingSections.priorities" hide-details density="compact" variant="outlined" class="field-wide" />
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
.programs-admin {
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

/* ── Card editor ── */
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

/* ── Priorities list ── */
.items-list {
  display: grid;
  gap: 0.75rem;
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

.item-fields .field-wide {
  width: 100%;
}

@media (min-width: 900px) {
  .programs-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 1100px) {
  .cards-list.two-col {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  .card-image-upload {
    width: 100%;
  }

  .cards-list.two-col {
    grid-template-columns: 1fr;
  }
}
</style>
