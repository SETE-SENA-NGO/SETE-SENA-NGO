<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  FileText,
  Flag,
  FolderHeart,
  MapPin,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-vue-next'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import type { SupportedLocale } from '@/i18n'
import { imageUploadHelpText, normalizeMediaUrl } from '@/lib/media'
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

type QuotePanel = {
  quote: string
  credit: string
  title: string
  body: string
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
  quotePanel: QuotePanel
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
  quotePanel: {
    quote:
      'Santi Sena means people working together for peace, livelihoods, justice and environmental preservation.',
    credit: 'From the Santi Sena profile and strategic plan',
    title: 'Support here is not only a gift. It is cooperation with village systems.',
    body: 'Santi Sena works with monks, villagers, local government, schools and partners in Svay Rieng, Prey Veng and Kratie. Choose the help you can offer and connect it to work communities can carry forward.',
  },
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

const pageRow = ref<PageContent | null>(null)
const loading = ref(true)
const saving = ref(false)
const uploadingKey = ref('')
const loadError = ref('')
const savedAt = ref('')
const imageHint = imageUploadHelpText()

const draft = reactive<GetInvolvedPageContent>(cloneContent(fallbackContent))

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
  { id: 'getinvolved-hero', label: 'Hero', icon: Sparkles },
  { id: 'getinvolved-cards', label: 'Cards', icon: FolderHeart },
  { id: 'getinvolved-quote', label: 'Quote', icon: FileText },
  { id: 'getinvolved-journey', label: 'Journey', icon: MapPin },
  { id: 'getinvolved-closing', label: 'Closing', icon: Flag },
] as const

const activeSection = ref(sections[0].id)
let sectionObserver: IntersectionObserver | null = null

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function setupSectionObserver() {
  sectionObserver?.disconnect()

  sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      }
    },
    { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
  )

  for (const s of sections) {
    const el = document.getElementById(s.id)
    if (el) sectionObserver.observe(el)
  }
}

onMounted(() => {
  contentStore.useLocalFallback()
  void loadPage()
})

onUnmounted(() => {
  sectionObserver?.disconnect()
  sectionObserver = null
})

watch(activeLocale, () => {
  void loadPage()
})

async function loadPage() {
  loading.value = true
  loadError.value = ''

  try {
    const page = await contentStore.fetchBySlug(PAGE_SLUG, activeLocale.value)
    pageRow.value = page
    replaceDraft(mergeContent(fallbackContent, parseCmsBody(page?.body ?? '')))
    savedAt.value = page?.updated_at ?? ''
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load Get Involved content.'
    ui.addToast(loadError.value, 'error')
  } finally {
    loading.value = false
    await nextTick()
    setupSectionObserver()
  }
}

function replaceDraft(nextContent: GetInvolvedPageContent) {
  draft.hero = {
    ...nextContent.hero,
    primaryCta: { ...nextContent.hero.primaryCta },
    secondaryCta: { ...nextContent.hero.secondaryCta },
  }
  draft.supportCards = nextContent.supportCards.map(cloneCard)
  draft.quotePanel = { ...nextContent.quotePanel }
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
    savedAt.value = saved.updated_at
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
  ui.openModal(
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

function resetToDefaults() {
  ui.openModal(
    'Reset Get Involved content?',
    'Restore all content sections, cards, journey steps, and quotes to their defaults?',
    () => {
      replaceDraft(cloneContent(fallbackContent))
      ui.addToast('Default Get Involved draft restored.', 'info')
    },
  )
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
    quotePanel: { ...content.quotePanel },
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
    quotePanel: mergeObject(base.quotePanel, override.quotePanel),
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
    quotePanel: { ...content.quotePanel },
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
  <div :class="['getinvolved-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <p class="eyebrow">Get Involved</p>
            <h1>Manage get involved page</h1>
            <div class="manager-meta" aria-label="Editable sections summary">
              <span>{{ activeLocaleName }} content</span>
              <span>{{ draft.supportCards.length }} cards</span>
              <span>{{ draft.journey.length }} steps</span>
              <span v-if="savedAt">Saved</span>
            </div>
          </div>
          <div class="hero-actions">
            <RouterLink class="btn btn-secondary" to="/get-involved">
              <ExternalLink :size="16" aria-hidden="true" />
              <span>View page</span>
            </RouterLink>
            <button type="button" class="btn btn-ghost" @click="resetToDefaults">
              <RotateCcw :size="16" aria-hidden="true" />
              <span>Reset draft</span>
            </button>
            <button type="button" class="btn btn-primary" :disabled="saving" @click="savePage">
              <Save :size="16" aria-hidden="true" />
              <span>{{ saving ? 'Saving...' : 'Save changes' }}</span>
            </button>
          </div>
        </header>

        <div v-if="loading" class="state-card">Loading Get Involved content...</div>
        <div v-else-if="loadError" class="state-card state-card-error">
          <span>{{ loadError }}</span>
          <button type="button" class="btn btn-secondary" @click="loadPage">Try again</button>
        </div>

        <div v-else class="content-grid">

          <nav class="section-nav" aria-label="Get Involved page sections">
            <button
              v-for="sec in sections"
              :key="sec.id"
              type="button"
              :class="['section-nav-btn', { active: activeSection === sec.id }]"
              @click="scrollToSection(sec.id)"
            >
              <component :is="sec.icon" :size="15" aria-hidden="true" />
              <span>{{ sec.label }}</span>
            </button>
          </nav>

          <!-- ── HERO ── -->
          <div :id="sections[0].id" class="section-group">
            <p class="section-group-label">Hero</p>
          </div>

          <section class="editor-panel" aria-labelledby="hero-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Hero section</p>
                <h2 id="hero-heading">Support village peace.</h2>
              </div>
              <Sparkles :size="20" aria-hidden="true" />
            </div>

            <div class="image-editor-grid">
              <figure class="image-preview hero-preview">
                <img :src="heroPreview" alt="" />
              </figure>

              <div class="form-stack">
                <div class="form-grid">
                  <label class="field">
                    <span>Small label</span>
                    <input v-model="draft.hero.eyebrow" type="text" />
                  </label>
                  <label class="field">
                    <span>Section heading</span>
                    <input v-model="draft.hero.title" type="text" />
                  </label>
                  <label class="field wide">
                    <span>Description</span>
                    <textarea v-model="draft.hero.description" rows="3"></textarea>
                  </label>
                  <label class="field wide">
                    <span>Image URL</span>
                    <input v-model="draft.hero.image" type="url" :placeholder="imageHint" />
                  </label>
                  <label class="field">
                    <span>Image alt text</span>
                    <input v-model="draft.hero.alt" type="text" />
                  </label>
                  <label class="field">
                    <span>Primary CTA label</span>
                    <input v-model="draft.hero.primaryCta.label" type="text" />
                  </label>
                  <label class="field">
                    <span>Secondary CTA label</span>
                    <input v-model="draft.hero.secondaryCta.label" type="text" />
                  </label>
                </div>
                <label class="upload-box">
                  <Upload :size="17" aria-hidden="true" />
                  <span>{{ uploadingKey === 'hero-image' ? 'Uploading...' : 'Upload hero image' }}</span>
                  <input
                    type="file"
                    accept="image/*"
                    :disabled="uploadingKey === 'hero-image'"
                    @change="uploadImage($event, 'hero-image', (url) => (draft.hero.image = url))"
                  />
                </label>
              </div>
            </div>
          </section>

          <!-- ── SUPPORT CARDS ── -->
          <div :id="sections[1].id" class="section-group">
            <p class="section-group-label">Cards</p>
          </div>

          <section class="editor-panel" aria-labelledby="cards-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Support cards</p>
                <h2 id="cards-heading">Support real community work.</h2>
              </div>
              <button type="button" class="btn btn-secondary" :disabled="!canAddCard" @click="addCard">
                <Plus :size="16" aria-hidden="true" />
                <span>Add card</span>
              </button>
            </div>

            <div class="cards-list">
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
                    <button type="button" class="icon-btn" :disabled="index === 0" aria-label="Move card up" @click="moveItem(draft.supportCards, index, -1)">
                      <ArrowUp :size="15" aria-hidden="true" />
                    </button>
                    <button type="button" class="icon-btn" :disabled="index === draft.supportCards.length - 1" aria-label="Move card down" @click="moveItem(draft.supportCards, index, 1)">
                      <ArrowDown :size="15" aria-hidden="true" />
                    </button>
                    <button type="button" class="icon-btn danger" aria-label="Remove card" @click="removeItem(draft.supportCards, index, 'card')">
                      <Trash2 :size="15" aria-hidden="true" />
                    </button>
                  </div>
                </header>

                <div class="card-editor-top">
                  <figure class="image-preview card-preview">
                    <img :src="resolveImageUrl(card.image, fallbackContent.supportCards[0]?.image ?? '')" alt="" />
                  </figure>
                  <div class="card-image-controls image-control-panel">
                    <label class="field">
                      <span>Image URL</span>
                      <input v-model="card.image" type="url" :placeholder="imageHint" />
                    </label>
                    <label class="upload-box">
                      <Upload :size="17" aria-hidden="true" />
                      <span>{{ uploadingKey === `card-${index}` ? 'Uploading...' : 'Upload card image' }}</span>
                      <input
                        type="file"
                        accept="image/*"
                        :disabled="uploadingKey === `card-${index}`"
                        @change="uploadImage($event, `card-${index}`, (url) => (card.image = url))"
                      />
                    </label>
                  </div>
                </div>

                <div class="card-form-grid">
                  <label class="field">
                    <span>Label</span>
                    <input v-model="card.label" type="text" />
                  </label>
                  <label class="field">
                    <span>Title</span>
                    <input v-model="card.title" type="text" />
                  </label>
                  <label class="field">
                    <span>Image alt text</span>
                    <input v-model="card.alt" type="text" />
                  </label>
                  <label class="field wide">
                    <span>Description</span>
                    <textarea v-model="card.body" rows="3"></textarea>
                  </label>
                  <label class="field">
                    <span>Link text</span>
                    <input v-model="card.cta" type="text" />
                  </label>
                </div>
              </article>
            </div>
          </section>

          <!-- ── QUOTE PANEL ── -->
          <div :id="sections[2].id" class="section-group">
            <p class="section-group-label">Quote</p>
          </div>

          <section class="editor-panel" aria-labelledby="quote-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Quote panel</p>
                <h2 id="quote-heading">Strategy quote and context</h2>
              </div>
              <FileText :size="20" aria-hidden="true" />
            </div>

            <div class="panel-body form-grid">
              <label class="field wide">
                <span>Quote</span>
                <textarea v-model="draft.quotePanel.quote" rows="3"></textarea>
              </label>
              <label class="field wide">
                <span>Credit / attribution</span>
                <input v-model="draft.quotePanel.credit" type="text" />
              </label>
              <label class="field wide">
                <span>Support heading</span>
                <input v-model="draft.quotePanel.title" type="text" />
              </label>
              <label class="field wide">
                <span>Context body</span>
                <textarea v-model="draft.quotePanel.body" rows="4"></textarea>
              </label>
            </div>
          </section>

          <!-- ── JOURNEY ── -->
          <div :id="sections[3].id" class="section-group">
            <p class="section-group-label">Journey</p>
          </div>

          <section class="editor-panel" aria-labelledby="journey-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Your path</p>
                <h2 id="journey-heading">Journey steps</h2>
              </div>
              <button type="button" class="btn btn-secondary" :disabled="!canAddJourneyStep" @click="addJourneyStep">
                <Plus :size="16" aria-hidden="true" />
                <span>Add step</span>
              </button>
            </div>

            <div class="cards-list two-col">
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
                    <button type="button" class="icon-btn" :disabled="index === 0" aria-label="Move step up" @click="moveItem(draft.journey, index, -1)">
                      <ArrowUp :size="15" aria-hidden="true" />
                    </button>
                    <button type="button" class="icon-btn" :disabled="index === draft.journey.length - 1" aria-label="Move step down" @click="moveItem(draft.journey, index, 1)">
                      <ArrowDown :size="15" aria-hidden="true" />
                    </button>
                    <button type="button" class="icon-btn danger" aria-label="Remove step" @click="removeItem(draft.journey, index, 'journey step')">
                      <Trash2 :size="15" aria-hidden="true" />
                    </button>
                  </div>
                </header>

                <div class="card-form-grid">
                  <label class="field">
                    <span>Step number</span>
                    <input v-model="step.step" type="text" />
                  </label>
                  <label class="field wide">
                    <span>Title</span>
                    <input v-model="step.title" type="text" />
                  </label>
                  <label class="field wide">
                    <span>Body</span>
                    <textarea v-model="step.body" rows="2"></textarea>
                  </label>
                </div>
              </article>
            </div>
          </section>

          <!-- ── CLOSING ── -->
          <div :id="sections[4].id" class="section-group">
            <p class="section-group-label">Closing</p>
          </div>

          <section class="editor-panel" aria-labelledby="closing-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Next step</p>
                <h2 id="closing-heading">Closing call to action</h2>
              </div>
              <Flag :size="20" aria-hidden="true" />
            </div>

            <div class="panel-body form-grid">
              <label class="field">
                <span>Small label</span>
                <input v-model="draft.closing.eyebrow" type="text" />
              </label>
              <label class="field">
                <span>Section heading</span>
                <input v-model="draft.closing.title" type="text" />
              </label>
              <label class="field wide">
                <span>Description</span>
                <textarea v-model="draft.closing.body" rows="3"></textarea>
              </label>
              <label class="field">
                <span>Primary CTA label</span>
                <input v-model="draft.closing.primaryCta.label" type="text" />
              </label>
              <label class="field">
                <span>Secondary CTA label</span>
                <input v-model="draft.closing.secondaryCta.label" type="text" />
              </label>
            </div>
          </section>

        </div>
      </main>
    </div>
  </div>
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
  padding: 1.25rem;
  padding-top: calc(60px + 1.25rem);
}

.manager-hero,
.editor-panel {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
}

.manager-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1rem 1.1rem;
}

.manager-hero h1,
.manager-hero p,
.editor-panel h2,
.editor-panel p {
  margin: 0;
}

.manager-hero h1 {
  color: var(--admin-theme-contrast);
  font-size: 1.32rem;
  line-height: 1.2;
}

.manager-title {
  display: grid;
  gap: 0.32rem;
}

.manager-meta,
.hero-actions,
.card-actions,
.panel-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.manager-meta span {
  border: 1px solid var(--admin-theme-border);
  border-radius: 999px;
  background: var(--admin-theme-surface-soft);
  color: var(--admin-theme-muted);
  padding: 0.18rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 800;
}

.eyebrow,
.panel-kicker {
  color: var(--admin-theme-primary-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.btn,
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 38px;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 0.55rem 0.8rem;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.btn:hover,
.icon-btn:hover {
  transform: translateY(-1px);
}

.btn:disabled,
.icon-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.btn-primary {
  border-color: var(--admin-theme-primary-deep);
  background: linear-gradient(180deg, var(--admin-theme-primary), var(--admin-theme-primary-deep));
  color: #ffffff;
  box-shadow: 0 10px 20px color-mix(in srgb, var(--admin-theme-primary) 22%, transparent);
}

.btn-secondary,
.btn-ghost,
.icon-btn {
  border-color: color-mix(in srgb, var(--admin-theme-contrast-soft) 42%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-surface) 86%, var(--admin-theme-contrast) 14%);
  color: var(--admin-theme-contrast);
}

.btn-ghost {
  background: var(--admin-theme-surface);
}

.icon-btn {
  width: 34px;
  min-height: 34px;
  padding: 0;
}

.icon-btn.danger {
  border-color: color-mix(in srgb, var(--admin-theme-danger) 64%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-danger) 9%, var(--admin-theme-surface));
  color: var(--admin-theme-danger);
}

.btn-secondary:hover,
.btn-ghost:hover,
.icon-btn:hover {
  border-color: var(--admin-theme-primary);
  background: color-mix(in srgb, var(--admin-theme-primary) 10%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.icon-btn.danger:hover {
  border-color: var(--admin-theme-danger);
  background: var(--admin-theme-danger);
  color: #ffffff;
}

.state-card {
  margin-top: 1rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-muted);
  padding: 1rem;
}

.state-card-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--admin-theme-danger);
}

.content-grid {
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;
}

.section-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
  padding: 0.5rem 0.6rem;
  position: sticky;
  top: calc(60px + 0.5rem);
  z-index: 40;
}

.section-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--admin-theme-muted);
  padding: 0.4rem 0.7rem;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.section-nav-btn:hover {
  background: color-mix(in srgb, var(--admin-theme-primary) 8%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.section-nav-btn.active {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 32%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-primary) 12%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.section-group {
  scroll-margin-top: 120px;
}

.section-group-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0.6rem 0 0;
  color: var(--admin-theme-primary-deep);
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-group-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: color-mix(in srgb, var(--admin-theme-primary) 18%, var(--admin-theme-border));
}

.editor-panel {
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 44%, var(--admin-theme-surface));
  padding: 0.85rem 1rem;
}

.panel-header h2 {
  color: var(--admin-theme-contrast);
  font-size: 1rem;
}

.panel-body {
  padding: 1rem;
}

.image-editor-grid {
  display: grid;
  grid-template-columns: minmax(300px, 0.72fr) minmax(360px, 1.28fr);
  gap: 1.1rem;
  padding: 1.1rem;
}

.image-preview {
  margin: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 34%, var(--admin-theme-border));
  border-radius: 7px;
  background: var(--admin-theme-surface);
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 8%, transparent),
    0 12px 24px rgba(15, 95, 73, 0.11);
}

.image-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-preview {
  aspect-ratio: 16 / 10;
}

.form-stack,
.cards-list {
  display: grid;
  gap: 0.85rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.wide {
  grid-column: 1 / -1;
}

.field,
.upload-box {
  display: grid;
  gap: 0.35rem;
  color: var(--admin-theme-muted);
  font-size: 0.8rem;
  font-weight: 800;
}

.field span,
.upload-box span {
  color: var(--admin-theme-contrast-soft);
}

.field input,
.field textarea,
.upload-box input {
  width: 100%;
  border: 1px solid var(--admin-theme-border-strong);
  border-radius: 6px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-text);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.65rem 0.75rem;
}

.field textarea {
  resize: vertical;
  line-height: 1.5;
}

.field input:focus,
.field textarea:focus,
.upload-box input:focus {
  border-color: var(--admin-theme-primary);
  outline: 3px solid color-mix(in srgb, var(--admin-theme-primary) 15%, transparent);
}

.upload-box {
  grid-template-columns: auto 1fr;
  align-items: center;
  border: 1px dashed var(--admin-theme-border-strong);
  border-radius: 7px;
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 38%, var(--admin-theme-surface));
  padding: 0.75rem;
}

.upload-box input {
  grid-column: 1 / -1;
  padding: 0.55rem;
}

.image-control-panel {
  display: grid;
  gap: 0.85rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 42%, var(--admin-theme-surface));
  padding: 0.9rem;
}

.cards-list {
  gap: 0.95rem;
  padding: 1rem;
}

.cards-list.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.card-editor {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  overflow: hidden;
}

.card-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 32%, var(--admin-theme-surface));
  padding: 0.75rem 0.85rem;
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
  display: grid;
  grid-template-columns: 170px minmax(280px, 1fr);
  align-items: start;
  gap: 1rem;
  padding: 0.9rem 0.9rem 0;
}

.card-preview {
  width: 170px;
  aspect-ratio: 1.35;
  flex: 0 0 auto;
}

.card-image-controls {
  display: grid;
  gap: 0.85rem;
}

.card-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  padding: 0.9rem;
}

:global(.admin-dark) .btn-primary {
  color: #071311;
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
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .section-nav::-webkit-scrollbar {
    display: none;
  }

  .manager-hero,
  .panel-header,
  .card-editor-header {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-actions,
  .hero-actions .btn,
  .card-actions {
    width: 100%;
  }

  .card-actions .icon-btn {
    flex: 1;
  }

  .image-editor-grid,
  .form-grid,
  .card-form-grid {
    grid-template-columns: 1fr;
  }

  .card-editor-top {
    grid-template-columns: 1fr;
  }

  .card-preview {
    width: 100%;
  }

  .cards-list.two-col {
    grid-template-columns: 1fr;
  }
}
</style>
