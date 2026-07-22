<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { imageUrls, resolveImageUrl } from '@/lib/imageUrls'
import { imageUrlHelpText, normalizeMediaUrl } from '@/lib/media'
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

const fallbackContent: GetInvolvedPageContent = {
  hero: {
    eyebrow: 'Get involved',
    title: 'Support village peace.',
    description:
      'Since 1994, Santi Sena has worked with villages on peace, livelihoods, education, child protection and the environment.',
    image: imageUrls.programs.hero2,
    alt: 'Santi Sena staff and community members meeting in a village shelter',
    primaryCta: { label: 'Donate', to: '/get-involved/donate' },
    secondaryCta: { label: 'Partner with us', to: '/get-involved/partner' },
  },
  supportCards: [
    {
      label: 'Natural resources',
      title: 'Protect community forests',
      body: 'Support forestry committees, seedlings and climate adaptation.',
      image: imageUrls.programs.environmentHero1,
      alt: 'Community leaders receiving tree seedlings near a pagoda',
      to: '/programs/environment',
      cta: 'Environment',
    },
    {
      label: 'Livelihood',
      title: 'Strengthen savings and farming',
      body: 'Back savings groups, farming skills and rural enterprise.',
      image: imageUrls.programs.livelihoodHero2,
      alt: 'Women receiving livelihood support during a community event',
      to: '/programs/livelihood',
      cta: 'Livelihood',
    },
    {
      label: 'Education',
      title: 'Keep children learning',
      body: 'Support pre-schools, scholarships and mobile libraries.',
      image: imageUrls.programs.education,
      alt: 'Students gathered for a Santi Sena education activity',
      to: '/programs/education',
      cta: 'Education',
    },
    {
      label: 'Protection',
      title: 'Make childhood safer',
      body: 'Help child protection networks and rights campaigns.',
      image: imageUrls.programs.childProtection2,
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

const pageRow = ref<PageContent | null>(null)
const loading = ref(true)
const saving = ref(false)
const uploadingHero = ref(false)
const uploadingCardIndex = ref<number | null>(null)
const loadError = ref('')
const savedAt = ref('')

const draft = reactive<GetInvolvedPageContent>(cloneContent(fallbackContent))

const heroPreview = computed(() => resolveImageUrl(draft.hero.image, fallbackContent.hero.image))
const imageHint = imageUrlHelpText()
const canAddCard = computed(() => draft.supportCards.length < MAX_SUPPORT_CARDS)

onMounted(() => {
  contentStore.useLocalFallback()
  void loadPage()
})

async function loadPage() {
  loading.value = true
  loadError.value = ''

  try {
    const page = await contentStore.fetchBySlug(PAGE_SLUG)
    pageRow.value = page
    replaceDraft(mergeContent(fallbackContent, parseCmsBody(page?.body ?? '')))
    savedAt.value = page?.updated_at ?? ''
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load Get Involved content.'
    ui.addToast(loadError.value, 'error')
  } finally {
    loading.value = false
  }
}

function replaceDraft(nextContent: GetInvolvedPageContent) {
  draft.hero = cloneHero(nextContent.hero)
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
      updated_at: pageRow.value?.updated_at ?? '',
    })

    pageRow.value = saved
    replaceDraft(content)
    savedAt.value = saved.updated_at
    ui.addToast('Get Involved content saved.', 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save Get Involved content.', 'error')
  } finally {
    saving.value = false
  }
}

async function uploadHeroImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploadingHero.value = true
  try {
    const uploaded = await media.uploadToGoogleDrive(file, 'Get Involved hero image')
    draft.hero.image = uploaded.url
    ui.addToast('Hero image uploaded.', 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not upload hero image.', 'error')
  } finally {
    uploadingHero.value = false
    input.value = ''
  }
}

async function uploadCardImage(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploadingCardIndex.value = index
  try {
    const uploaded = await media.uploadToGoogleDrive(file, `${draft.supportCards[index]?.title || 'Support card'} image`)
    const card = draft.supportCards[index]
    if (card) card.image = uploaded.url
    ui.addToast('Card image uploaded.', 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not upload card image.', 'error')
  } finally {
    uploadingCardIndex.value = null
    input.value = ''
  }
}

function addCard() {
  if (!canAddCard.value) return

  draft.supportCards.push({
    label: 'New support',
    title: 'New support card',
    body: 'Describe the community work this card promotes.',
    image: imageUrls.programs.hero1,
    alt: 'Santi Sena community activity',
    to: '/get-involved',
    cta: 'Learn more',
  })
}

function removeCard(index: number) {
  const card = draft.supportCards[index]
  if (!card) return

  ui.openModal(
    'Remove support card?',
    `Remove "${card.title || 'this card'}" from the public Get Involved page?`,
    () => {
      draft.supportCards.splice(index, 1)
      ui.addToast('Support card removed.', 'warning')
    },
  )
}

function moveCard(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= draft.supportCards.length) return

  const current = draft.supportCards[index]
  const next = draft.supportCards[target]
  if (!current || !next) return

  draft.supportCards[index] = next
  draft.supportCards[target] = current
}

function resetToDefaults() {
  ui.openModal(
    'Reset Get Involved content?',
    'Restore the default hero image and support cards for this page?',
    () => {
      replaceDraft(cloneContent(fallbackContent))
      ui.addToast('Default Get Involved draft restored.', 'info')
    },
  )
}

function prepareForSave(content: GetInvolvedPageContent): GetInvolvedPageContent {
  return {
    hero: {
      ...cloneHero(content.hero),
      image: normalizeMediaUrl(content.hero.image),
    },
    supportCards: content.supportCards.map((card) => ({
      ...cloneCard(card),
      image: normalizeMediaUrl(card.image),
    })),
    quotePanel: { ...content.quotePanel },
    journey: content.journey.map((item) => ({ ...item })),
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

  if (invalidCardIndex >= 0) {
    return `Card ${invalidCardIndex + 1} needs a title, body, and image.`
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
  return Array.isArray(override) && override.length ? (override as T[]).map((item) => ({ ...item })) : fallback.map((item) => ({ ...item }))
}

function mergeObject<T>(base: T, override: unknown): T {
  return isRecord(override) ? ({ ...base, ...override } as T) : { ...base }
}

function cloneContent(content: GetInvolvedPageContent): GetInvolvedPageContent {
  return {
    hero: cloneHero(content.hero),
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

function cloneHero(content: GetInvolvedPageContent['hero']) {
  return {
    ...content,
    primaryCta: { ...content.primaryCta },
    secondaryCta: { ...content.secondaryCta },
  }
}

function cloneCard(card: SupportCard): SupportCard {
  return { ...card }
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
</script>

<template>
  <div :class="['get-involved-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <p class="eyebrow">Get Involved</p>
            <h1>Manage content</h1>
            <div class="manager-meta" aria-label="Editable sections">
              <span>Hero image</span>
              <span>{{ draft.supportCards.length }} cards</span>
            </div>
          </div>
          <div class="hero-actions">
            <RouterLink class="btn btn-secondary" to="/get-involved">View page</RouterLink>
            <button type="button" class="btn btn-ghost" @click="resetToDefaults">
              Reset draft
            </button>
            <button type="button" class="btn btn-primary" :disabled="saving" @click="savePage">
              {{ saving ? 'Saving...' : 'Save changes' }}
            </button>
          </div>
        </header>

        <div v-if="loading" class="state-card">Loading Get Involved content...</div>
        <div v-else-if="loadError" class="state-card state-card-error">
          {{ loadError }}
          <button type="button" class="btn btn-secondary" @click="loadPage">Try again</button>
        </div>

        <div v-else class="content-grid">
          <section class="editor-panel hero-panel" aria-labelledby="hero-image-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Hero section</p>
                <h2 id="hero-image-heading">Support village peace.</h2>
              </div>
              <span v-if="savedAt" class="saved-pill">Saved</span>
            </div>

            <div class="hero-editor-grid">
              <figure class="image-preview hero-preview">
                <img :src="heroPreview" alt="" />
              </figure>

              <div class="image-control-panel">
                <div class="field-row">
                  <label class="field">
                    <span>Hero image URL</span>
                    <input v-model="draft.hero.image" type="url" :placeholder="imageHint" />
                  </label>
                </div>
                <label class="upload-field upload-box">
                  <span>{{ uploadingHero ? 'Uploading image...' : 'Upload replacement image' }}</span>
                  <input type="file" accept="image/*" :disabled="uploadingHero" @change="uploadHeroImage" />
                </label>
              </div>
            </div>
          </section>

          <section class="editor-panel cards-panel" aria-labelledby="support-cards-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Cards section</p>
                <h2 id="support-cards-heading">Support real community work.</h2>
              </div>
              <button type="button" class="btn btn-secondary" :disabled="!canAddCard" @click="addCard">
                Add card
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
                    <button type="button" class="icon-btn" :disabled="index === 0" @click="moveCard(index, -1)">
                      Up
                    </button>
                    <button
                      type="button"
                      class="icon-btn"
                      :disabled="index === draft.supportCards.length - 1"
                      @click="moveCard(index, 1)"
                    >
                      Down
                    </button>
                    <button type="button" class="icon-btn danger" @click="removeCard(index)">
                      Remove
                    </button>
                  </div>
                </header>

                <div class="card-editor-top">
                  <figure class="image-preview card-preview">
                    <img :src="resolveImageUrl(card.image, imageUrls.programs.hero1)" alt="" />
                  </figure>

                  <div class="card-image-controls image-control-panel">
                    <label class="field">
                      <span>Image URL</span>
                      <input v-model="card.image" type="url" :placeholder="imageHint" />
                    </label>
                    <label class="upload-field upload-box">
                      <span>{{ uploadingCardIndex === index ? 'Uploading image...' : 'Upload card image' }}</span>
                      <input
                        type="file"
                        accept="image/*"
                        :disabled="uploadingCardIndex === index"
                        @change="uploadCardImage($event, index)"
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
                  <label class="field wide">
                    <span>Description</span>
                    <textarea v-model="card.body" rows="3"></textarea>
                  </label>
                </div>
              </article>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.get-involved-admin {
  min-height: 100vh;
  background: var(--admin-theme-bg);
  color: var(--admin-theme-text);
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

.manager-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
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

.manager-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
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

.hero-actions,
.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn,
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  min-height: 32px;
  padding: 0.35rem 0.55rem;
  font-size: 0.74rem;
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

.editor-panel {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
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

.saved-pill {
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 28%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--admin-theme-primary) 11%, transparent);
  color: var(--admin-theme-primary-deep);
  padding: 0.22rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 800;
}

.hero-editor-grid {
  display: grid;
  grid-template-columns: minmax(320px, 0.74fr) minmax(360px, 1.26fr);
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

.card-preview {
  width: 170px;
  aspect-ratio: 1.35;
  flex: 0 0 auto;
}

.form-stack,
.cards-list,
.card-form-grid {
  display: grid;
  gap: 0.85rem;
}

.image-control-panel {
  display: grid;
  align-content: start;
  gap: 0.85rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 42%, var(--admin-theme-surface));
  padding: 0.9rem;
}

.field-row {
  display: grid;
}

.field,
.upload-field {
  display: grid;
  gap: 0.35rem;
  color: var(--admin-theme-muted);
  font-size: 0.8rem;
  font-weight: 800;
}

.field span,
.upload-field span {
  color: var(--admin-theme-contrast-soft);
}

.field input,
.field textarea,
.upload-field input {
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

.upload-box {
  border: 1px dashed var(--admin-theme-border-strong);
  border-radius: 7px;
  background: var(--admin-theme-surface);
  padding: 0.75rem;
}

.field textarea {
  resize: vertical;
  line-height: 1.5;
}

.field input:focus,
.field textarea:focus,
.upload-field input:focus {
  border-color: var(--admin-theme-primary);
  outline: 3px solid color-mix(in srgb, var(--admin-theme-primary) 15%, transparent);
}

.cards-list {
  gap: 0.95rem;
  padding: 1rem;
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
}

.card-editor-top {
  display: grid;
  grid-template-columns: 170px minmax(280px, 1fr);
  align-items: start;
  gap: 1rem;
  padding: 0.9rem 0.9rem 0;
}

.card-image-controls {
  display: grid;
  gap: 0.85rem;
}

.card-form-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 0.9rem;
}

.wide {
  grid-column: 1 / -1;
}

:global(.admin-dark) .btn-primary {
  color: #071311;
}

@media (min-width: 900px) {
  .get-involved-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
    padding-top: calc(60px + 1rem);
  }

  .manager-hero,
  .panel-header {
    flex-direction: column;
  }

  .manager-hero,
  .panel-header,
  .card-editor-header {
    align-items: stretch;
  }

  .card-editor-header,
  .card-actions {
    justify-content: flex-start;
  }

  .card-editor-top {
    grid-template-columns: 1fr;
  }

  .hero-actions,
  .card-actions,
  .hero-actions .btn {
    width: 100%;
  }

  .card-actions .icon-btn {
    flex: 1;
  }

  .hero-editor-grid,
  .card-form-grid {
    grid-template-columns: 1fr;
  }

  .card-preview {
    width: 100%;
  }
}
</style>
