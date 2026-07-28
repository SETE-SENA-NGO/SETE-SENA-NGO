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
import { normalizeMediaUrl } from '@/lib/media'
import { useContentStore } from '@/stores/content.store'
import { useUiStore } from '@/stores/ui.store'
import type { PageContent } from '@/types/content'

type ActionLink = {
  label: string
  to: string
}

type SupportCard = {
  label: string
  title: string
  body: string
  image: string
  alt: string
  to: string
  cta: string
}

type JourneyStep = {
  step: string
  title: string
  body: string
}

type GetInvolvedPageContent = {
  hero: {
    eyebrow: string
    title: string
    description: string
    image: string
    alt: string
    primaryCta: ActionLink
    secondaryCta: ActionLink
  }
  supportCards: SupportCard[]
  journey: JourneyStep[]
  closing: {
    eyebrow: string
    title: string
    body: string
    primaryCta: ActionLink
    secondaryCta: ActionLink
  }
}

const PAGE_SLUG = 'get-involved'
const MAX_SUPPORT_CARDS = 8
const MAX_JOURNEY_STEPS = 6

function resolveImageUrl(url: string, fallback: string): string {
  return url.trim() ? url : fallback
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const fallbackContent: GetInvolvedPageContent = {
  hero: {
    eyebrow: 'Get involved',
    title: 'Support village peace.',
    description:
      'Since 1994, Santi Sena has worked with villages on peace, livelihoods, education, child protection and the environment.',
    image: '/images/programs/hero-2.jpg',
    alt: 'Santi Sena staff and community members meeting in a village shelter',
    primaryCta: { label: 'Donate', to: '/get-involved/donate' },
    secondaryCta: { label: 'Partner with us', to: '/get-involved/partner' },
  },
  supportCards: [
    {
      label: 'Natural resources',
      title: 'Protect community forests',
      body: 'Support forestry committees, seedlings and climate adaptation.',
      image: '/images/programs/environment-hero1.jpg',
      alt: 'Community leaders receiving tree seedlings near a pagoda',
      to: '/programs/environment',
      cta: 'Environment',
    },
    {
      label: 'Livelihood',
      title: 'Strengthen savings and farming',
      body: 'Back savings groups, farming skills and rural enterprise.',
      image: '/images/programs/livelihood-hero2.jpg',
      alt: 'Women receiving livelihood support during a community event',
      to: '/programs/livelihood',
      cta: 'Livelihood',
    },
    {
      label: 'Education',
      title: 'Keep children learning',
      body: 'Support pre-schools, scholarships and mobile libraries.',
      image: '/images/programs/education.jpg',
      alt: 'Students gathered for a Santi Sena education activity',
      to: '/programs/education',
      cta: 'Education',
    },
    {
      label: 'Protection',
      title: 'Make childhood safer',
      body: 'Help child protection networks and rights campaigns.',
      image: '/images/programs/child-protection2.jpg',
      alt: 'Students participating in a community child protection activity',
      to: '/programs/child-protection',
      cta: 'Protection',
    },
  ],
  journey: [
    {
      step: '01',
      title: 'Choose a contribution',
      body: 'Give funds, partnership support or useful expertise.',
    },
    {
      step: '02',
      title: 'Match it to field needs',
      body: 'Connect support to forests, schools, savings groups or protection work.',
    },
    {
      step: '03',
      title: 'Strengthen local ownership',
      body: 'Keep the work rooted in village systems and local committees.',
    },
  ],
  closing: {
    eyebrow: 'Next step',
    title: 'Start a conversation.',
    body: 'The strongest support is specific, local and steady.',
    primaryCta: { label: 'Contact Santi Sena', to: '/contact' },
    secondaryCta: { label: 'Donate locally', to: '/qr-donate' },
  },
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

const draft = reactive<GetInvolvedPageContent>(cloneContent(fallbackContent))

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
      ...draft.hero,
      primaryCta: { ...draft.hero.primaryCta },
      secondaryCta: { ...draft.hero.secondaryCta },
    }),
    applySnapshot: (value) => {
      draft.hero = value
    },
  },
  {
    key: 'cards',
    getSnapshot: () => draft.supportCards.map(cloneCard),
    applySnapshot: (value) => {
      draft.supportCards = value
    },
  },
  {
    key: 'journey',
    getSnapshot: () => draft.journey.map((item) => ({ ...item })),
    applySnapshot: (value) => {
      draft.journey = value
    },
  },
  {
    key: 'closing',
    getSnapshot: () => ({
      ...draft.closing,
      primaryCta: { ...draft.closing.primaryCta },
      secondaryCta: { ...draft.closing.secondaryCta },
    }),
    applySnapshot: (value) => {
      draft.closing = value
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
const heroPreview = computed(() => resolveImageUrl(draft.hero.image, fallbackContent.hero.image))
const canAddCard = computed(() => draft.supportCards.length < MAX_SUPPORT_CARDS)
const canAddJourneyStep = computed(() => draft.journey.length < MAX_JOURNEY_STEPS)

const sections = [
  { id: 'getinvolved-hero', label: 'Hero', icon: 'mdi-creation' },
  { id: 'getinvolved-cards', label: 'Cards', icon: 'mdi-folder-heart' },
  { id: 'getinvolved-journey', label: 'Journey', icon: 'mdi-map-marker' },
  { id: 'getinvolved-closing', label: 'Closing', icon: 'mdi-flag' },
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
    loadError.value = error instanceof Error ? error.message : 'Could not load Get Involved content.'
    ui.addToast(loadError.value, 'error')
  } finally {
    loading.value = false
    setupSectionWatch()
  }
}

function replaceDraft(nextContent: GetInvolvedPageContent) {
  draft.hero = {
    ...nextContent.hero,
    primaryCta: { ...nextContent.hero.primaryCta },
    secondaryCta: { ...nextContent.hero.secondaryCta },
  }
  draft.supportCards = nextContent.supportCards.map(cloneCard)
  draft.journey = nextContent.journey.map((item) => ({ ...item }))
  draft.closing = {
    ...nextContent.closing,
    primaryCta: { ...nextContent.closing.primaryCta },
    secondaryCta: { ...nextContent.closing.secondaryCta },
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
      title: 'Get Involved',
      body: JSON.stringify(content, null, 2),
      locale: activeLocale.value,
      route_path: '/get-involved',
      nav_group: 'Get Involved',
      template: 'standard',
      status: 'published',
      updated_at: pageRow.value?.updated_at ?? '',
    })

    pageRow.value = saved
    replaceDraft(content)
    updateSnapshot()
    ui.addToast(`Get Involved ${activeLocaleName.value} content saved.`, 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save Get Involved content.', 'error')
  } finally {
    saving.value = false
  }
}

function addCard() {
  if (!canAddCard.value) return
  draft.supportCards.push({
    label: 'New support',
    title: 'New support card',
    body: 'Describe the community work this card promotes.',
    image: '/images/programs/hero-1.jpg',
    alt: 'Santi Sena community activity',
    to: '/get-involved',
    cta: 'Learn more',
  })
}

function addJourneyStep() {
  if (!canAddJourneyStep.value) return
  const stepNumber = draft.journey.length + 1
  draft.journey.push({
    step: String(stepNumber).padStart(2, '0'),
    title: 'New journey step',
    body: 'Describe this step in the journey.',
  })
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
    `Remove "${itemTitle}" from the public Get Involved page?`,
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

function prepareForSave(content: GetInvolvedPageContent): GetInvolvedPageContent {
  return {
    hero: {
      ...content.hero,
      image: normalizeMediaUrl(content.hero.image),
      primaryCta: { ...content.hero.primaryCta },
      secondaryCta: { ...content.hero.secondaryCta },
    },
    supportCards: content.supportCards.map((card) => ({
      ...card,
      image: normalizeMediaUrl(card.image),
    })),
    journey: content.journey.map((item) => ({
      step: item.step.trim() || '0',
      title: item.title.trim(),
      body: item.body.trim(),
    })),
    closing: {
      ...content.closing,
      primaryCta: { ...content.closing.primaryCta },
      secondaryCta: { ...content.closing.secondaryCta },
    },
  }
}

function validateDraft() {
  if (!draft.hero.image.trim()) return 'Hero image is required.'
  if (!draft.supportCards.length) return 'Add at least one support card.'

  const invalidCardIndex = draft.supportCards.findIndex(
    (card) => !card.title.trim() || !card.body.trim() || !card.image.trim(),
  )
  if (invalidCardIndex >= 0) return `Card ${invalidCardIndex + 1} needs a title, body, and image.`

  if (!draft.journey.length) return 'Add at least one journey step.'
  if (draft.journey.some((item) => !item.title.trim() || !item.body.trim())) {
    return 'Each journey step needs a title and body.'
  }

  return ''
}

function parseCmsBody(body: string): Partial<GetInvolvedPageContent> | null {
  if (!body.trim()) return null
  try {
    const parsed = JSON.parse(body) as unknown
    return isRecord(parsed) ? (parsed as Partial<GetInvolvedPageContent>) : null
  } catch {
    return null
  }
}

function mergeContent(
  base: GetInvolvedPageContent,
  override: Partial<GetInvolvedPageContent> | null,
): GetInvolvedPageContent {
  if (!override) return cloneContent(base)

  const hero: Record<string, unknown> = isRecord(override.hero) ? override.hero : {}
  const closing: Record<string, unknown> = isRecord(override.closing) ? override.closing : {}

  return {
    hero: {
      ...base.hero,
      ...hero,
      primaryCta: mergeObject(base.hero.primaryCta, hero.primaryCta),
      secondaryCta: mergeObject(base.hero.secondaryCta, hero.secondaryCta),
    },
    supportCards: mergeCards(override.supportCards, base.supportCards),
    journey: mergeArray<JourneyStep>(override.journey, base.journey),
    closing: {
      ...base.closing,
      ...closing,
      primaryCta: mergeObject(base.closing.primaryCta, closing.primaryCta),
      secondaryCta: mergeObject(base.closing.secondaryCta, closing.secondaryCta),
    },
  }
}

function mergeCards(override: unknown, fallback: SupportCard[]) {
  if (!Array.isArray(override) || !override.length) return fallback.map(cloneCard)
  return override.filter(isRecord).map((card) => ({
    label: getString(card.label),
    title: getString(card.title),
    body: getString(card.body),
    image: getString(card.image),
    alt: getString(card.alt),
    to: getString(card.to),
    cta: getString(card.cta),
  }))
}

function mergeArray<T>(override: unknown, fallback: T[]) {
  return Array.isArray(override) && override.length
    ? (override as T[]).map((item) => ({ ...item }))
    : fallback.map((item) => ({ ...item }))
}

function mergeObject<T>(base: T, override: unknown): T {
  return isRecord(override) ? ({ ...base, ...override } as T) : { ...base }
}

function cloneContent(content: GetInvolvedPageContent): GetInvolvedPageContent {
  return {
    hero: {
      ...content.hero,
      primaryCta: { ...content.hero.primaryCta },
      secondaryCta: { ...content.hero.secondaryCta },
    },
    supportCards: content.supportCards.map(cloneCard),
    journey: content.journey.map((item) => ({ ...item })),
    closing: {
      ...content.closing,
      primaryCta: { ...content.closing.primaryCta },
      secondaryCta: { ...content.closing.secondaryCta },
    },
  }
}

function cloneCard(card: SupportCard): SupportCard {
  return { ...card }
}
</script>

<template>
  <v-app :class="['getinvolved-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Manage get involved page</h1>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" color="primary" to="/get-involved" target="_blank">
              <v-icon start>mdi-open-in-new</v-icon>
              View page
            </v-btn>
          </div>
        </header>

        <v-fade-transition mode="out-in" @after-enter="updateActiveSectionFromScroll">
          <div v-if="loading" key="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading Get Involved content...</span>
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
            aria-label="Get Involved page sections"
            save-label="Save Change"
            @navigate="scrollToSection"
            @save="savePage"
          />

          <!-- ── HERO ── -->
          <AdminEditorPanel
            :id="sections[0].id"
            kicker="Hero section"
            heading="Support village peace."
            :editing="!!editingSections.hero"
            :collapsed="collapsedSections.hero"
            @toggle-edit="toggleEdit('hero')"
            @cancel="cancelEdit('hero')"
            @toggle-collapse="toggleCollapse('hero')"
          >
            <div class="image-editor-grid">
              <div class="image-upload-panel">
                <v-img :src="heroPreview" aspect-ratio="1.6" cover class="image-preview hero-preview" />
                <AdminUploadButton
                  :disabled="!editingSections.hero"
                  description="Get Involved hero-image image"
                  @update:model-value="(url) => (draft.hero.image = url)"
                />
              </div>

              <div class="form-stack">
                <div class="form-grid">
                  <v-text-field v-model="draft.hero.eyebrow" label="Small label" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="draft.hero.title" label="Section heading" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
                  <v-textarea v-model="draft.hero.description" label="Description" rows="3" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-text-field v-model="draft.hero.alt" label="Image alt text" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-text-field v-model="draft.hero.primaryCta.label" label="Primary CTA label" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="draft.hero.secondaryCta.label" label="Secondary CTA label" :disabled="!editingSections.hero" hide-details density="comfortable" variant="outlined" />
                </div>
              </div>
            </div>
          </AdminEditorPanel>

          <!-- ── SUPPORT CARDS ── -->
          <AdminEditorPanel
            :id="sections[1].id"
            kicker="Support cards"
            heading="Support real community work."
            :editing="!!editingSections.cards"
            :collapsed="collapsedSections.cards"
            @toggle-edit="toggleEdit('cards')"
            @cancel="cancelEdit('cards')"
            @toggle-collapse="toggleCollapse('cards')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" key="add-card" color="primary" variant="tonal" size="small" :disabled="!canAddCard" @click="addCard">
                  <v-icon start>mdi-plus</v-icon>
                  Add card
                </v-btn>
              </v-fade-transition>
            </template>

            <v-slide-y-transition group tag="div" class="cards-list">
              <article v-for="(card, index) in draft.supportCards" :key="index" class="card-editor">
                <header class="card-editor-header">
                  <div class="card-heading">
                    <span class="card-number">{{ String(index + 1).padStart(2, '0') }}</span>
                    <div>
                      <h3>{{ card.title || 'Untitled card' }}</h3>
                      <p>{{ card.label || 'No label' }}</p>
                    </div>
                  </div>
                  <div class="card-actions">
                    <v-btn icon variant="tonal" color="primary" size="small" :disabled="!editingSections.cards || index === 0" aria-label="Move card up" @click="moveItem(draft.supportCards, index, -1)">
                      <v-icon>mdi-chevron-up</v-icon>
                    </v-btn>
                    <v-btn icon variant="tonal" color="primary" size="small" :disabled="!editingSections.cards || index === draft.supportCards.length - 1" aria-label="Move card down" @click="moveItem(draft.supportCards, index, 1)">
                      <v-icon>mdi-chevron-down</v-icon>
                    </v-btn>
                    <v-btn v-if="editingSections.cards" icon color="error" variant="tonal" size="small" aria-label="Remove card" @click="removeItem(draft.supportCards, index, 'card')">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </header>

                <div class="card-editor-top">
                  <div class="image-upload-panel card-image-upload">
                    <v-img :src="resolveImageUrl(card.image, fallbackContent.supportCards[0]?.image ?? '')" aspect-ratio="1.35" cover class="image-preview card-preview" />
                    <AdminUploadButton
                      :disabled="!editingSections.cards"
                      :description="`Get Involved card-${index} image`"
                      @update:model-value="(url) => (card.image = url)"
                    />
                  </div>
                </div>

                <div class="card-form-grid">
                  <v-text-field v-model="card.label" label="Label" :disabled="!editingSections.cards" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="card.title" label="Title" :disabled="!editingSections.cards" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="card.alt" label="Image alt text" :disabled="!editingSections.cards" hide-details density="comfortable" variant="outlined" />
                  <v-textarea v-model="card.body" label="Description" rows="3" :disabled="!editingSections.cards" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-text-field v-model="card.cta" label="Link text" :disabled="!editingSections.cards" hide-details density="comfortable" variant="outlined" />
                </div>
              </article>
            </v-slide-y-transition>
          </AdminEditorPanel>

          <!-- ── JOURNEY ── -->
          <AdminEditorPanel
            :id="sections[2].id"
            kicker="Your path"
            heading="Journey steps"
            :editing="!!editingSections.journey"
            :collapsed="collapsedSections.journey"
            @toggle-edit="toggleEdit('journey')"
            @cancel="cancelEdit('journey')"
            @toggle-collapse="toggleCollapse('journey')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" key="add-step" color="primary" variant="tonal" size="small" :disabled="!canAddJourneyStep" @click="addJourneyStep">
                  <v-icon start>mdi-plus</v-icon>
                  Add step
                </v-btn>
              </v-fade-transition>
            </template>

            <v-slide-y-transition group tag="div" class="cards-list two-col">
              <article v-for="(step, index) in draft.journey" :key="index" class="card-editor">
                <header class="card-editor-header">
                  <div class="card-heading">
                    <span class="card-number">{{ step.step || String(index + 1).padStart(2, '0') }}</span>
                    <div>
                      <h3>{{ step.title || 'New step' }}</h3>
                      <p>{{ step.body ? step.body.slice(0, 40) + '...' : 'No description' }}</p>
                    </div>
                  </div>
                  <div class="card-actions">
                    <v-btn icon variant="tonal" color="primary" size="small" :disabled="!editingSections.journey || index === 0" aria-label="Move step up" @click="moveItem(draft.journey, index, -1)">
                      <v-icon>mdi-chevron-up</v-icon>
                    </v-btn>
                    <v-btn icon variant="tonal" color="primary" size="small" :disabled="!editingSections.journey || index === draft.journey.length - 1" aria-label="Move step down" @click="moveItem(draft.journey, index, 1)">
                      <v-icon>mdi-chevron-down</v-icon>
                    </v-btn>
                    <v-btn v-if="editingSections.journey" icon color="error" variant="tonal" size="small" aria-label="Remove step" @click="removeItem(draft.journey, index, 'journey step')">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </header>

                <div class="card-form-grid">
                  <v-text-field v-model="step.step" label="Step number" :disabled="!editingSections.journey" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="step.title" label="Title" :disabled="!editingSections.journey" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-textarea v-model="step.body" label="Body" rows="2" :disabled="!editingSections.journey" hide-details density="comfortable" variant="outlined" class="field-wide" />
                </div>
              </article>
            </v-slide-y-transition>
          </AdminEditorPanel>

          <!-- ── CLOSING ── -->
          <AdminEditorPanel
            :id="sections[3].id"
            kicker="Next step"
            heading="Closing call to action"
            :editing="!!editingSections.closing"
            :collapsed="collapsedSections.closing"
            @toggle-edit="toggleEdit('closing')"
            @cancel="cancelEdit('closing')"
            @toggle-collapse="toggleCollapse('closing')"
          >
            <div class="panel-body form-grid">
              <v-text-field v-model="draft.closing.eyebrow" label="Small label" :disabled="!editingSections.closing" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.closing.title" label="Section heading" :disabled="!editingSections.closing" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.closing.body" label="Description" rows="3" :disabled="!editingSections.closing" hide-details density="comfortable" variant="outlined" class="field-wide" />
              <v-text-field v-model="draft.closing.primaryCta.label" label="Primary CTA label" :disabled="!editingSections.closing" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.closing.secondaryCta.label" label="Secondary CTA label" :disabled="!editingSections.closing" hide-details density="comfortable" variant="outlined" />
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
.getinvolved-admin {
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

/* ── Collapsible panel body ── */
.panel-body {
  padding: 1.5rem;
}

/* ── Image editor grid ── */
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
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 8%, transparent),
    0 12px 24px rgba(15, 95, 73, 0.11);
}

/* ── Form layouts ── */
.form-stack,
.cards-list {
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

/* ── Image upload panel (preview + button) ── */
.image-upload-panel {
  display: grid;
  gap: 0.75rem;
  align-content: start;
}

.cards-list {
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

@media (min-width: 900px) {
  .getinvolved-admin.sidebar-open {
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

  .image-editor-grid,
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
