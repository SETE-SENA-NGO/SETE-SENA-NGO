<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch, type WatchStopHandle } from 'vue'
import { useTheme } from 'vuetify'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
// Icons migrated to Vuetify MDI (Material Design Icons)
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import type { SupportedLocale } from '@/i18n'
import { normalizeMediaUrl } from '@/lib/media'
import { useContentStore } from '@/stores/content.store'
import { useMediaStore } from '@/stores/media.store'
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
const media = useMediaStore()
const ui = useUiStore()
const { locale } = useI18n()
const vuetifyTheme = useTheme()

// Local Vuetify confirm dialog
const confirmDialog = ref(false)
const confirmData = ref({ title: '', body: '', onConfirm: (() => {}) as () => void })

function openConfirm(title: string, body: string, onConfirm: () => void) {
  confirmData.value = { title, body, onConfirm }
  confirmDialog.value = true
}

// Sync Vuetify theme with admin dark mode
watch(
  () => ui.darkMode,
  (isDark) => {
    vuetifyTheme.global.name.value = isDark ? 'adminDark' : 'adminLight'
  },
  { immediate: true },
)

const pageRow = ref<PageContent | null>(null)
const loading = ref(true)
const saving = ref(false)
const uploadingKey = ref('')
const loadError = ref('')

const draft = reactive<GetInvolvedPageContent>(cloneContent(fallbackContent))

const editingSections = reactive<Record<string, boolean>>({
  hero: false,
  cards: false,
  journey: false,
  closing: false,
})

const sectionDirty = reactive<Record<string, boolean>>({
  hero: false,
  cards: false,
  journey: false,
  closing: false,
})

const collapsedSections = reactive<Record<string, boolean>>({
  hero: false,
  cards: false,
  journey: false,
  closing: false,
})

const sectionSnapshots = reactive<Record<string, string>>({
  hero: '',
  cards: '',
  journey: '',
  closing: '',
})

const originalSnapshot = ref('')

const hasChanges = computed(() => {
  const current = JSON.stringify(cloneContent(draft))
  return current !== originalSnapshot.value
})

function toggleCollapse(section: keyof typeof collapsedSections) {
  collapsedSections[section] = !collapsedSections[section]
}

function takeSectionSnapshot(section: keyof typeof sectionSnapshots) {
  switch (section) {
    case 'hero':
      sectionSnapshots.hero = JSON.stringify({ ...draft.hero, primaryCta: { ...draft.hero.primaryCta }, secondaryCta: { ...draft.hero.secondaryCta } })
      break
    case 'cards':
      sectionSnapshots.cards = JSON.stringify(draft.supportCards.map(cloneCard))
      break
    case 'journey':
      sectionSnapshots.journey = JSON.stringify(draft.journey.map((j) => ({ ...j })))
      break
    case 'closing':
      sectionSnapshots.closing = JSON.stringify({ ...draft.closing, primaryCta: { ...draft.closing.primaryCta }, secondaryCta: { ...draft.closing.secondaryCta } })
      break
  }
}

function hasSectionChanges(section: keyof typeof sectionSnapshots): boolean {
  switch (section) {
    case 'hero':
      return JSON.stringify({ ...draft.hero, primaryCta: { ...draft.hero.primaryCta }, secondaryCta: { ...draft.hero.secondaryCta } }) !== sectionSnapshots.hero
    case 'cards':
      return JSON.stringify(draft.supportCards.map(cloneCard)) !== sectionSnapshots.cards
    case 'journey':
      return JSON.stringify(draft.journey.map((j) => ({ ...j }))) !== sectionSnapshots.journey
    case 'closing':
      return JSON.stringify({ ...draft.closing, primaryCta: { ...draft.closing.primaryCta }, secondaryCta: { ...draft.closing.secondaryCta } }) !== sectionSnapshots.closing
    default:
      return false
  }
}

let sectionWatchStop: WatchStopHandle | null = null

function setupSectionWatch() {
  sectionWatchStop?.()
  sectionWatchStop = watch(
    () => ({
      hero: hasSectionChanges('hero'),
      cards: hasSectionChanges('cards'),
      journey: hasSectionChanges('journey'),
      closing: hasSectionChanges('closing'),
    }),
    (changes) => {
      for (const section of Object.keys(changes) as Array<keyof typeof changes>) {
        if (changes[section] && editingSections[section] && !sectionDirty[section]) {
          sectionDirty[section] = true
        }
      }
    },
    { deep: true },
  )
}

function toggleEdit(section: keyof typeof editingSections) {
  if (!editingSections[section]) {
    takeSectionSnapshot(section)
    sectionDirty[section] = false
    editingSections[section] = true
  } else {
    editingSections[section] = false
  }
}

function cancelEdit(section: keyof typeof editingSections) {
  const snapshot = sectionSnapshots[section]
  if (snapshot) {
    switch (section) {
      case 'hero':
        draft.hero = JSON.parse(snapshot)
        break
      case 'cards':
        draft.supportCards = JSON.parse(snapshot)
        break
      case 'journey':
        draft.journey = JSON.parse(snapshot)
        break
      case 'closing':
        draft.closing = JSON.parse(snapshot)
        break
    }
  }
  sectionDirty[section] = false
  editingSections[section] = false
}

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

const activeSection = ref<string>(sections[0].id)
const SCROLL_SPY_OFFSET = 150
let scrollSpyRaf = 0

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function updateActiveSectionFromScroll() {
  const doc = document.documentElement
  const scrolledToBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 4

  const lastSection = sections[sections.length - 1]
  if (scrolledToBottom && lastSection) {
    activeSection.value = lastSection.id
    return
  }

  // Classic scrollspy: the active section is the last one whose top has
  // crossed above the offset line (just below the sticky nav).
  let current: string = sections[0].id
  for (const s of sections) {
    const el = document.getElementById(s.id)
    if (el && el.getBoundingClientRect().top - SCROLL_SPY_OFFSET <= 0) {
      current = s.id
    }
  }
  activeSection.value = current
}

function handleScrollSpy() {
  if (scrollSpyRaf) return
  scrollSpyRaf = requestAnimationFrame(() => {
    scrollSpyRaf = 0
    updateActiveSectionFromScroll()
  })
}

function warnBeforeUnload(event: BeforeUnloadEvent) {
  if (!hasChanges.value) return
  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  contentStore.useLocalFallback()
  void loadPage()
  window.addEventListener('beforeunload', warnBeforeUnload)
  window.addEventListener('scroll', handleScrollSpy, { passive: true })
})

onUnmounted(() => {
  sectionWatchStop?.()
  if (scrollSpyRaf) cancelAnimationFrame(scrollSpyRaf)
  window.removeEventListener('beforeunload', warnBeforeUnload)
  window.removeEventListener('scroll', handleScrollSpy)
})

watch(activeLocale, () => {
  void loadPage()
})

async function loadPage() {
  editingSections.hero = false
  editingSections.cards = false
  editingSections.journey = false
  editingSections.closing = false
  sectionDirty.hero = false
  sectionDirty.cards = false
  sectionDirty.journey = false
  sectionDirty.closing = false
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

async function uploadImage(event: Event, key: string, applyUrl: (url: string) => void) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploadingKey.value = key
  try {
    const uploaded = await media.uploadToGoogleDrive(file, `Get Involved ${key} image`)
    applyUrl(normalizeMediaUrl(uploaded.url))
    ui.addToast('Image uploaded.', 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not upload image.', 'error')
  } finally {
    uploadingKey.value = ''
    input.value = ''
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
  openConfirm(
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
            <v-btn variant="tonal" to="/get-involved" target="_blank">
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

          <nav class="section-nav" aria-label="Get Involved page sections">
            <div class="section-nav-tabs">
              <button
                v-for="sec in sections"
                :key="sec.id"
                type="button"
                :class="['section-nav-btn', { active: activeSection === sec.id }]"
                @click="scrollToSection(sec.id)"
              >
                <v-icon size="16">{{ sec.icon }}</v-icon>
                <span>{{ sec.label }}</span>
              </button>
            </div>
            <div class="section-nav-save">
              <span v-if="hasChanges" class="unsaved-badge">
                <v-icon size="10">mdi-circle</v-icon>
                Unsaved changes
              </span>
              <v-btn color="primary" variant="tonal" :disabled="saving || !hasChanges" :loading="saving" @click="savePage">
                <v-icon start>mdi-content-save</v-icon>
                {{ saving ? 'Saving...' : 'Save Change' }}
              </v-btn>
            </div>
          </nav>

          <!-- ── HERO ── -->
          <v-card :id="sections[0].id" :class="['editor-panel', 'section-group', { editing: editingSections.hero }]">
            <v-toolbar density="comfortable" flat class="panel-toolbar">
              <template #title>
                <div>
                  <p class="panel-kicker">Hero section</p>
                  <h2 id="hero-heading" class="text-h6 font-weight-bold mb-0">Support village peace.</h2>
                </div>
              </template>
              <template #append>
                <div class="toolbar-actions">
                  <v-btn icon variant="text" size="small" @click="toggleCollapse('hero')" title="Collapse / expand">
                    <v-icon :class="{ 'rotate-neg-90': collapsedSections.hero }">mdi-chevron-down</v-icon>
                  </v-btn>
                  <span class="toolbar-divider" aria-hidden="true"></span>
                  <v-fade-transition mode="out-in">
                    <v-btn v-if="!editingSections.hero" key="edit-hero" color="secondary" size="small" @click="toggleEdit('hero')">
                      <v-icon start>mdi-pencil</v-icon>
                      Edit
                    </v-btn>
                    <div v-else key="editing-hero" class="edit-actions">
                      <v-btn variant="tonal" size="small" @click="cancelEdit('hero')">Cancel</v-btn>
                      <v-btn color="primary" variant="flat" size="small" @click="toggleEdit('hero')">
                        <v-icon start>mdi-check</v-icon>
                        Done
                      </v-btn>
                    </div>
                  </v-fade-transition>
                </div>
              </template>
            </v-toolbar>
            <v-divider />

            <v-expand-transition>
              <div v-show="!collapsedSections.hero" class="panel-collapsible">
              <div class="image-editor-grid">
              <div class="image-upload-panel">
                <v-img :src="heroPreview" aspect-ratio="1.6" cover class="image-preview hero-preview" />
                <label class="upload-btn">
                  <v-icon size="18">mdi-cloud-upload-outline</v-icon>
                  <span>{{ uploadingKey === 'hero-image' ? 'Uploading...' : 'Upload image' }}</span>
                  <input
                    type="file"
                    accept="image/*"
                    :disabled="!editingSections.hero || uploadingKey === 'hero-image'"
                    @change="uploadImage($event, 'hero-image', (url) => (draft.hero.image = url))"
                  />
                </label>
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
              </div>
            </v-expand-transition>
          </v-card>

          <!-- ── SUPPORT CARDS ── -->
          <v-card :id="sections[1].id" :class="['editor-panel', 'section-group', { editing: editingSections.cards }]">
            <v-toolbar density="comfortable" flat class="panel-toolbar">
              <template #title>
                <div>
                  <p class="panel-kicker">Support cards</p>
                  <h2 id="cards-heading" class="text-h6 font-weight-bold mb-0">Support real community work.</h2>
                </div>
              </template>
              <template #append>
                <div class="toolbar-actions">
                  <v-btn icon variant="text" size="small" @click="toggleCollapse('cards')" title="Collapse / expand">
                    <v-icon :class="{ 'rotate-neg-90': collapsedSections.cards }">mdi-chevron-down</v-icon>
                  </v-btn>
                  <span class="toolbar-divider" aria-hidden="true"></span>
                  <v-fade-transition mode="out-in">
                    <v-btn v-if="!editingSections.cards" key="edit-cards" color="secondary" size="small" @click="toggleEdit('cards')">
                      <v-icon start>mdi-pencil</v-icon>
                      Edit
                    </v-btn>
                    <div v-else key="editing-cards" class="edit-actions">
                      <v-btn variant="tonal" size="small" @click="cancelEdit('cards')">Cancel</v-btn>
                      <v-btn color="primary" variant="flat" size="small" @click="toggleEdit('cards')">
                        <v-icon start>mdi-check</v-icon>
                        Done
                      </v-btn>
                    </div>
                  </v-fade-transition>
                  <v-fade-transition>
                    <v-btn v-if="editingSections.cards" key="add-card" color="accent" variant="flat" size="small" :disabled="!canAddCard" @click="addCard">
                      <v-icon start>mdi-plus</v-icon>
                      Add card
                    </v-btn>
                  </v-fade-transition>
                </div>
              </template>
            </v-toolbar>
            <v-divider />

            <v-expand-transition>
              <div v-show="!collapsedSections.cards" class="panel-collapsible">
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
                    <v-btn icon variant="outlined" size="small" :disabled="!editingSections.cards || index === 0" aria-label="Move card up" @click="moveItem(draft.supportCards, index, -1)">
                      <v-icon>mdi-chevron-up</v-icon>
                    </v-btn>
                    <v-btn icon variant="outlined" size="small" :disabled="!editingSections.cards || index === draft.supportCards.length - 1" aria-label="Move card down" @click="moveItem(draft.supportCards, index, 1)">
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
                    <label class="upload-btn">
                      <v-icon size="18">mdi-cloud-upload-outline</v-icon>
                      <span>{{ uploadingKey === `card-${index}` ? 'Uploading...' : 'Upload image' }}</span>
                      <input
                        type="file"
                        accept="image/*"
                        :disabled="!editingSections.cards || uploadingKey === `card-${index}`"
                        @change="uploadImage($event, `card-${index}`, (url) => (card.image = url))"
                      />
                    </label>
                  </div>
                </div>

                <div class="card-form-grid">
                  <v-text-field v-model="card.label" label="Label" :disabled="!editingSections.cards" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="card.title" label="Title" :disabled="!editingSections.cards" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="card.alt" label="Image alt text" :disabled="!editingSections.cards" hide-details density="comfortable" variant="outlined" />
                  <v-textarea v-model="card.body" label="Description" rows="3" :disabled="!editingSections.cards" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-text-field v-model="card.cta" label="Link text" :disabled="!editingSections.cards" hide-details density="comfortable" variant="outlined" />
                </div>              </article>
              </v-slide-y-transition>
            </div>
            </v-expand-transition>
          </v-card>

          <!-- ── JOURNEY ── -->
          <v-card :id="sections[2].id" :class="['editor-panel', 'section-group', { editing: editingSections.journey }]">
            <v-toolbar density="comfortable" flat class="panel-toolbar">
              <template #title>
                <div>
                  <p class="panel-kicker">Your path</p>
                  <h2 id="journey-heading" class="text-h6 font-weight-bold mb-0">Journey steps</h2>
                </div>
              </template>
              <template #append>
                <div class="toolbar-actions">
                  <v-btn icon variant="text" size="small" @click="toggleCollapse('journey')" title="Collapse / expand">
                    <v-icon :class="{ 'rotate-neg-90': collapsedSections.journey }">mdi-chevron-down</v-icon>
                  </v-btn>
                  <span class="toolbar-divider" aria-hidden="true"></span>
                  <v-fade-transition mode="out-in">
                    <v-btn v-if="!editingSections.journey" key="edit-journey" color="secondary" size="small" @click="toggleEdit('journey')">
                      <v-icon start>mdi-pencil</v-icon>
                      Edit
                    </v-btn>
                    <div v-else key="editing-journey" class="edit-actions">
                      <v-btn variant="tonal" size="small" @click="cancelEdit('journey')">Cancel</v-btn>
                      <v-btn color="primary" variant="flat" size="small" @click="toggleEdit('journey')">
                        <v-icon start>mdi-check</v-icon>
                        Done
                      </v-btn>
                    </div>
                  </v-fade-transition>
                  <v-fade-transition>
                    <v-btn v-if="editingSections.journey" key="add-step" color="accent" variant="flat" size="small" :disabled="!canAddJourneyStep" @click="addJourneyStep">
                      <v-icon start>mdi-plus</v-icon>
                      Add step
                    </v-btn>
                  </v-fade-transition>
                </div>
              </template>
            </v-toolbar>
            <v-divider />

            <v-expand-transition>
              <div v-show="!collapsedSections.journey" class="panel-collapsible">
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
                    <v-btn icon variant="outlined" size="small" :disabled="!editingSections.journey || index === 0" aria-label="Move step up" @click="moveItem(draft.journey, index, -1)">
                      <v-icon>mdi-chevron-up</v-icon>
                    </v-btn>
                    <v-btn icon variant="outlined" size="small" :disabled="!editingSections.journey || index === draft.journey.length - 1" aria-label="Move step down" @click="moveItem(draft.journey, index, 1)">
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
                </div>              </article>
              </v-slide-y-transition>
            </div>
            </v-expand-transition>
          </v-card>

          <!-- ── CLOSING ── -->
          <v-card :id="sections[3].id" :class="['editor-panel', 'section-group', { editing: editingSections.closing }]">
            <v-toolbar density="comfortable" flat class="panel-toolbar">
              <template #title>
                <div>
                  <p class="panel-kicker">Next step</p>
                  <h2 id="closing-heading" class="text-h6 font-weight-bold mb-0">Closing call to action</h2>
                </div>
              </template>
              <template #append>
                <div class="toolbar-actions">
                  <v-btn icon variant="text" size="small" @click="toggleCollapse('closing')" title="Collapse / expand">
                    <v-icon :class="{ 'rotate-neg-90': collapsedSections.closing }">mdi-chevron-down</v-icon>
                  </v-btn>
                  <span class="toolbar-divider" aria-hidden="true"></span>
                  <v-fade-transition mode="out-in">
                    <v-btn v-if="!editingSections.closing" key="edit-closing" color="secondary" size="small" @click="toggleEdit('closing')">
                      <v-icon start>mdi-pencil</v-icon>
                      Edit
                    </v-btn>
                    <div v-else key="editing-closing" class="edit-actions">
                      <v-btn variant="tonal" size="small" @click="cancelEdit('closing')">Cancel</v-btn>
                      <v-btn color="primary" variant="flat" size="small" @click="toggleEdit('closing')">
                        <v-icon start>mdi-check</v-icon>
                        Done
                      </v-btn>
                    </div>
                  </v-fade-transition>
                </div>
              </template>
            </v-toolbar>
            <v-divider />

            <v-expand-transition>
              <div v-show="!collapsedSections.closing" class="panel-collapsible">
              <div class="panel-body form-grid">
              <v-text-field v-model="draft.closing.eyebrow" label="Small label" :disabled="!editingSections.closing" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.closing.title" label="Section heading" :disabled="!editingSections.closing" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.closing.body" label="Description" rows="3" :disabled="!editingSections.closing" hide-details density="comfortable" variant="outlined" class="field-wide" />
              <v-text-field v-model="draft.closing.primaryCta.label" label="Primary CTA label" :disabled="!editingSections.closing" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.closing.secondaryCta.label" label="Secondary CTA label" :disabled="!editingSections.closing" hide-details density="comfortable" variant="outlined" />
              </div>
              </div>
            </v-expand-transition>
          </v-card>

        </div>
    </v-fade-transition>
      </main>
    </div>

    <!-- ── Vuetify Confirm Dialog ── -->
    <v-dialog v-model="confirmDialog" max-width="430" persistent>
      <v-card>
        <v-card-title class="font-weight-bold">{{ confirmData.title }}</v-card-title>
        <v-card-text class="text-body-2">{{ confirmData.body }}</v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="tonal" @click="confirmDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="confirmData.onConfirm(); confirmDialog = false">
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

/* ── Unsaved-changes indicator ── */
.unsaved-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--admin-theme-primary-deep);
  font-size: 0.78rem;
  font-weight: 700;
}

.unsaved-badge .v-icon {
  color: var(--admin-theme-primary);
}

/* ── Edit / Cancel / Done action group ── */
.edit-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.panel-kicker {
  color: var(--admin-theme-primary-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

/* ── Vuetify overrides ── */
.editor-panel {
  overflow: hidden;
  border: 1px solid var(--admin-theme-border) !important;
  background: var(--admin-theme-surface) !important;
  box-shadow: var(--admin-theme-shadow) !important;
}

.v-card.editor-panel {
  border-radius: 8px;
}

.editor-panel.editing {
  border-color: var(--admin-theme-primary) !important;
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 10%, transparent),
    var(--admin-theme-shadow) !important;
  background: color-mix(in srgb, var(--admin-theme-surface) 94%, var(--admin-theme-primary) 6%) !important;
}

.panel-toolbar {
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 44%, var(--admin-theme-surface)) !important;
  border-bottom: 1px solid var(--admin-theme-border) !important;
  border-radius: 8px 8px 0 0 !important;
}

.panel-toolbar :deep(.v-toolbar__content) {
  height: auto !important;
  padding: 1.25rem 1.5rem !important;
  gap: 1rem;
}

.panel-toolbar :deep(.v-toolbar-title) {
  margin-inline-start: 0 !important;
  flex: 1 1 auto;
}

.panel-toolbar h2 {
  color: var(--admin-theme-contrast);
  font-size: 1rem;
  line-height: 1.3;
}

/* ── Toolbar action group ── */
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-divider {
  width: 1px;
  height: 22px;
  background: var(--admin-theme-border);
  margin: 0 0.1rem;
}

/* Rotate chevron when collapsed */
.rotate-neg-90 {
  transform: rotate(-90deg);
  transition: transform 0.2s ease;
}

/*
  Vuetify fades disabled buttons to 26% opacity, which turns a tonal button
  (like "Save changes" when there's nothing to save) into an almost invisible
  smear. Keep it as legible/shaped as its enabled "View page" sibling and
  show the disabled state through color instead of opacity.
*/
.v-btn--disabled {
  opacity: 1 !important;
}

.v-btn--disabled.v-btn--variant-tonal {
  color: var(--admin-theme-muted) !important;
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 60%, var(--admin-theme-surface)) !important;
}

.v-btn--disabled.v-btn--variant-outlined {
  color: var(--admin-theme-muted) !important;
  border-color: var(--admin-theme-border) !important;
}

.v-btn--disabled .v-btn__overlay {
  opacity: 0 !important;
}

/* Vuetify text field overrides for theme consistency */
:deep(.v-field--variant-outlined) {
  background: var(--admin-theme-surface);
}

:deep(.v-field--variant-outlined .v-field__outline__start),
:deep(.v-field--variant-outlined .v-field__outline__end),
:deep(.v-field--variant-outlined .v-field__outline__notch::before),
:deep(.v-field--variant-outlined .v-field__outline__notch::after) {
  border-color: var(--admin-theme-border-strong);
}

:deep(.v-field__input),
:deep(textarea.v-field__input) {
  color: var(--admin-theme-contrast);
  font-weight: 600;
}

:deep(.v-label.v-field-label) {
  color: var(--admin-theme-muted);
  font-weight: 600;
  opacity: 1;
}

/*
  Vuetify's outlined floating label rests centered on the field's top
  border (translateY(-50%)) — the classic "notched outline" look. Our
  fields double as read-only value displays, so the label reads more like
  a field caption than a notch; lift it clear of the border instead of
  overlapping it. The transform is purely visual (doesn't reserve layout
  space), so the row gap above (.form-grid / .card-form-grid) is widened
  to match, or this would just collide with the field in the row above.
*/
:deep(.v-field--variant-outlined .v-label.v-field-label--floating) {
  transform: translateY(-90%) !important;
}

/*
  Vuetify dims disabled fields via opacity on the whole field, which fades
  real content (not just affordance) to near-illegible gray. Fields are used
  here to show saved page content in "view" mode, so keep text at full
  contrast and signal read-only via background + cursor instead.
*/
:deep(.v-input--disabled) {
  opacity: 1;
}

:deep(.v-field--disabled) {
  opacity: 1;
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 55%, var(--admin-theme-surface));
  cursor: not-allowed;
}

:deep(.v-field--disabled .v-field__input) {
  color: var(--admin-theme-contrast-soft);
  -webkit-text-fill-color: var(--admin-theme-contrast-soft);
  cursor: not-allowed;
}

:deep(.v-field--disabled .v-label.v-field-label) {
  color: var(--admin-theme-muted);
  opacity: 1;
}

:deep(.v-field--disabled .v-field__outline__start),
:deep(.v-field--disabled .v-field__outline__end),
:deep(.v-field--disabled .v-field__outline__notch::before),
:deep(.v-field--disabled .v-field__outline__notch::after) {
  border-color: var(--admin-theme-border);
  opacity: 1;
}

/* ── Content grid ── */
.content-grid {
  display: grid;
  gap: 1.1rem;
  margin-top: 1rem;
}

/* ── Section navigation ── */
.section-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
  padding: 0.75rem 1.5rem;
  position: sticky;
  top: calc(60px + 0.5rem);
  z-index: 40;
}

.section-nav-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.section-nav-save {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
}

.section-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 36px;
  border: 1px solid var(--admin-theme-border);
  border-radius: 7px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-muted);
  padding: 0.45rem 0.85rem;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.section-nav-btn:hover {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-primary) 8%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.section-nav-btn.active {
  border-color: var(--admin-theme-primary);
  background: color-mix(in srgb, var(--admin-theme-primary) 14%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 12%, transparent);
}

.section-group {
  scroll-margin-top: 120px;
}

/* ── Collapsible panels ── */
.panel-collapsible {
  overflow: hidden;
}

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

/* ── Upload button (modern pill button, replaces the old file-input dropzone) ── */
.upload-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--admin-theme-primary) 12%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
  padding: 0.65rem 1rem;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.upload-btn:hover {
  background: color-mix(in srgb, var(--admin-theme-primary) 20%, var(--admin-theme-surface));
}

.upload-btn:focus-within {
  outline: 3px solid color-mix(in srgb, var(--admin-theme-primary) 20%, transparent);
  outline-offset: 2px;
}

.upload-btn:has(input:disabled) {
  cursor: not-allowed;
  color: var(--admin-theme-muted);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 55%, var(--admin-theme-surface));
}

/* Native file input stays functional/accessible via the wrapping <label>, just visually hidden */
.upload-btn input[type="file"] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
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

  .section-nav {
    flex-direction: column;
    align-items: stretch;
  }

  .section-nav-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .section-nav-tabs::-webkit-scrollbar {
    display: none;
  }

  .section-nav-save {
    justify-content: space-between;
  }

  .manager-hero,
  .card-editor-header {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-actions {
    width: 100%;
  }

  .panel-toolbar :deep(.v-toolbar__content) {
    flex-wrap: wrap;
    row-gap: 0.5rem;
  }

  .toolbar-actions {
    flex-wrap: wrap;
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
