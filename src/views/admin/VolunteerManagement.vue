<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ExternalLink,
  FileText,
  FolderHeart,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
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

type ActionLink = { label: string; to: string }

type ServiceCard = {
  label: string
  title: string
  body: string
  image: string
  alt: string
  to: string
}

type HelpCard = {
  title: string
  body: string
  to: string
}

type GalleryItem = {
  title: string
  caption: string
  image: string
  alt: string
}

type VolunteerPageContent = {
  serviceSection: {
    kicker: string
    heading: string
    description: string
  }
  serviceCards: ServiceCard[]
  storySection: {
    kicker: string
    heading: string
    body: string
    image: string
    alt: string
    cta: ActionLink
  }
  helpSection: {
    kicker: string
    heading: string
  }
  helpCards: HelpCard[]
  campaignSection: {
    kicker: string
    heading: string
    body: string
    cta: ActionLink
  }
  gallerySection: {
    kicker: string
    heading: string
  }
  galleryImages: GalleryItem[]
  supportSection: {
    kicker: string
    heading: string
    body: string
    cardTitle: string
    cardBody: string
    details: string[]
    cta: ActionLink
  }
}

const PAGE_SLUG = 'volunteer'
const MAX_SERVICE_CARDS = 8
const MAX_HELP_CARDS = 6
const MAX_GALLERY_IMAGES = 12

function resolveImageUrl(url: string, fallback: string): string {
  return url.trim() ? url : fallback
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const fallbackContent: VolunteerPageContent = {
  serviceSection: {
    kicker: 'Opportunities',
    heading: 'Three ways to serve',
    description:
      'Volunteers can support long-term community development through practical, compassionate programs already moving in the field.',
  },
  serviceCards: [
    {
      label: 'Education',
      title: 'Child education',
      body: 'Support reading, Buddhist primary education and practical learning materials for children.',
      image: '/images/programs/education.jpg',
      alt: 'Children reading with a volunteer in a Cambodian school setting',
      to: '/programs/education',
    },
    {
      label: 'Livelihoods',
      title: 'Livelihoods',
      body: 'Help families strengthen home gardens, savings groups and local food security.',
      image: '/images/programs/livelihood-hero2.jpg',
      alt: 'A volunteer and farmers reviewing a Cambodian home garden',
      to: '/programs/livelihood',
    },
    {
      label: 'Community care',
      title: 'Environment & WASH',
      body: 'Join field activities around tree planting, hygiene awareness and safer school environments.',
      image: '/images/programs/environment-hero1.jpg',
      alt: 'Volunteers and villagers planting tree seedlings in rural Cambodia',
      to: '/programs/environment',
    },
  ],
  storySection: {
    kicker: 'Impact story',
    heading: 'Small support changes lives',
    body: 'Through patient support, local partnership and compassionate action, volunteers help communities move toward stability, dignity and hope.',
    image: '/images/programs/child-protection2.jpg',
    alt: 'Children and youth holding learning materials after a field activity',
    cta: { label: 'View programs', to: '/programs' },
  },
  helpSection: {
    kicker: 'How you can help',
    heading: 'Make change with us',
  },
  helpCards: [
    {
      title: 'Donate',
      body: 'Support learning materials, community activities and field work for vulnerable villages.',
      to: '/qr-donate',
    },
    {
      title: 'Volunteer',
      body: 'Bring your time, skills and care to practical work with children and communities.',
      to: '/contact',
    },
    {
      title: 'Partner',
      body: 'Collaborate with Santi Sena through shared values, technical skill or grant support.',
      to: '/get-involved/partner',
    },
  ],
  campaignSection: {
    kicker: 'Featured campaign',
    heading: 'Support children\u2019s learning',
    body: 'Your contribution can help provide learning materials, safe activities and community care for children who need it most.',
    cta: { label: 'Support this mission', to: '/qr-donate' },
  },
  gallerySection: {
    kicker: 'Gallery',
    heading: 'Field moments',
  },
  galleryImages: [
    {
      title: 'Youth learning',
      caption: 'Child protection and peer education activities.',
      image: '/images/programs/child-protection2.jpg',
      alt: 'Children and youth peer educators meeting in a Cambodian village',
    },
    {
      title: 'Healthy schools',
      caption: 'WASH practice with students and teachers.',
      image: '/images/programs/education.jpg',
      alt: 'Children practicing handwashing at a rural Cambodian school',
    },
    {
      title: 'Pagoda learning',
      caption: 'Books and materials for Buddhist education.',
      image: '/images/programs/education.jpg',
      alt: 'Young monks and volunteers organizing learning materials',
    },
    {
      title: 'Field visits',
      caption: 'Community work carried with local teams.',
      image: '/images/programs/hero-2.jpg',
      alt: 'Volunteer team walking on a rural Cambodian road',
    },
  ],
  supportSection: {
    kicker: 'Volunteer contact',
    heading: 'Strengthen local work',
    body: 'Share your skills, available dates, language ability and the program area you care about. The team will help match your interest with practical needs.',
    cardTitle: 'Start here',
    cardBody: 'Contact the team to discuss a volunteer placement, field visit or practical support.',
    details: [
      'Prey Chlak pagoda, Svay Rieng City, Svay Rieng province',
      '+855 77 65 54 64, +855 87 67 57 57, +855 71 877 55 33',
      'santisenamonk@gmail.com, santisena@santisenacambodia.org',
    ],
    cta: { label: 'Contact the volunteer team', to: '/contact' },
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

const draft = reactive<VolunteerPageContent>(cloneContent(fallbackContent))

const activeLocale = computed<SupportedLocale>(() =>
  locale.value === 'kh' ? 'kh' : 'en',
)
const activeLocaleName = computed(() =>
  activeLocale.value === 'kh' ? 'Khmer' : 'English',
)
const canAddServiceCard = computed(() => draft.serviceCards.length < MAX_SERVICE_CARDS)
const canAddHelpCard = computed(() => draft.helpCards.length < MAX_HELP_CARDS)
const canAddGallery = computed(() => draft.galleryImages.length < MAX_GALLERY_IMAGES)

const storyPreview = computed(() =>
  resolveImageUrl(draft.storySection.image, fallbackContent.storySection.image),
)

const sections = [
  { id: 'sec-service', label: 'Service', icon: FolderHeart },
  { id: 'sec-story', label: 'Story', icon: FileText },
  { id: 'sec-help', label: 'Help', icon: Sparkles },
  { id: 'sec-campaign', label: 'Campaign', icon: BookOpen },
  { id: 'sec-gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'sec-support', label: 'Contact', icon: Phone },
] as const

const activeSection = ref<string>(sections[0].id)
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

  for (const section of sections) {
    const el = document.getElementById(section.id)
    if (el) sectionObserver.observe(el)
  }
}

onMounted(async () => {
  await loadPage()
  await nextTick()
  setupSectionObserver()
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
    loadError.value = error instanceof Error ? error.message : 'Could not load Volunteer content.'
    ui.addToast(loadError.value, 'error')
  } finally {
    loading.value = false
    await nextTick()
    setupSectionObserver()
  }
}

function replaceDraft(content: VolunteerPageContent) {
  draft.serviceSection = { ...content.serviceSection }
  draft.serviceCards = content.serviceCards.map((c) => ({ ...c }))
  draft.storySection = { ...content.storySection, cta: { ...content.storySection.cta } }
  draft.helpSection = { ...content.helpSection }
  draft.helpCards = content.helpCards.map((c) => ({ ...c }))
  draft.campaignSection = { ...content.campaignSection, cta: { ...content.campaignSection.cta } }
  draft.gallerySection = { ...content.gallerySection }
  draft.galleryImages = content.galleryImages.map((g) => ({ ...g }))
  draft.supportSection = {
    ...content.supportSection,
    details: [...content.supportSection.details],
    cta: { ...content.supportSection.cta },
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
      title: 'Volunteer',
      body: JSON.stringify(content, null, 2),
      locale: activeLocale.value,
      route_path: '/get-involved/volunteer',
      nav_group: 'Get Involved',
      template: 'standard',
      status: 'published',
      updated_at: pageRow.value?.updated_at ?? '',
    })

    pageRow.value = saved
    replaceDraft(content)
    savedAt.value = saved.updated_at
    ui.addToast(`Volunteer ${activeLocaleName.value} content saved.`, 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save Volunteer content.', 'error')
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
    const uploaded = await media.uploadToGoogleDrive(file, `Volunteer ${key} image`)
    applyUrl(uploaded.url)
    ui.addToast('Image uploaded.', 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not upload image.', 'error')
  } finally {
    uploadingKey.value = ''
    input.value = ''
  }
}

function addServiceCard() {
  if (!canAddServiceCard.value) return
  draft.serviceCards.push({
    label: 'New program',
    title: 'New service card',
    body: 'Describe the volunteer opportunity.',
    image: '/images/programs/hero-1.jpg',
    alt: 'Santi Sena community activity',
    to: '/get-involved/volunteer',
  })
}

function removeServiceCard(index: number) {
  const card = draft.serviceCards[index]
  if (!card) return
  ui.openModal(
    'Remove service card?',
    `Remove "${card.title || 'this card'}" from the volunteer page?`,
    () => {
      draft.serviceCards.splice(index, 1)
      ui.addToast('Service card removed.', 'warning')
    },
  )
}

function moveServiceCard(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= draft.serviceCards.length) return
  const items = draft.serviceCards
  const temp = items[index]
  items[index] = items[target]!
  items[target] = temp!
}

function addHelpCard() {
  if (!canAddHelpCard.value) return
  draft.helpCards.push({
    title: 'New help card',
    body: 'Describe how to help.',
    to: '/get-involved',
  })
}

function removeHelpCard(index: number) {
  const card = draft.helpCards[index]
  if (!card) return
  ui.openModal(
    'Remove help card?',
    `Remove "${card.title || 'this card'}" from the volunteer page?`,
    () => {
      draft.helpCards.splice(index, 1)
      ui.addToast('Help card removed.', 'warning')
    },
  )
}

function moveHelpCard(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= draft.helpCards.length) return
  const items = draft.helpCards
  const temp = items[index]
  items[index] = items[target]!
  items[target] = temp!
}

function addGalleryImage() {
  if (!canAddGallery.value) return
  draft.galleryImages.push({
    title: 'New gallery image',
    caption: 'Describe this moment.',
    image: '/images/programs/hero-1.jpg',
    alt: 'Volunteer activity',
  })
}

function removeGalleryImage(index: number) {
  const item = draft.galleryImages[index]
  if (!item) return
  ui.openModal(
    'Remove gallery image?',
    `Remove "${item.title || 'this image'}" from the gallery?`,
    () => {
      draft.galleryImages.splice(index, 1)
      ui.addToast('Gallery image removed.', 'warning')
    },
  )
}

function moveGalleryImage(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= draft.galleryImages.length) return
  const items = draft.galleryImages
  const temp = items[index]
  items[index] = items[target]!
  items[target] = temp!
}

function addDetail() {
  draft.supportSection.details.push('New contact detail')
}

function removeDetail(index: number) {
  draft.supportSection.details.splice(index, 1)
}

function resetToDefaults() {
  ui.openModal(
    'Reset Volunteer content?',
    'Restore all sections, cards, gallery and contact details to their defaults?',
    () => {
      replaceDraft(cloneContent(fallbackContent))
      ui.addToast('Default Volunteer draft restored.', 'info')
    },
  )
}

function prepareForSave(content: VolunteerPageContent): VolunteerPageContent {
  return {
    serviceSection: { ...content.serviceSection },
    serviceCards: content.serviceCards.map((card) => ({
      ...card,
      image: normalizeMediaUrl(card.image),
    })),
    storySection: {
      ...content.storySection,
      image: normalizeMediaUrl(content.storySection.image),
      cta: { ...content.storySection.cta },
    },
    helpSection: { ...content.helpSection },
    helpCards: content.helpCards.map((c) => ({ ...c })),
    campaignSection: {
      ...content.campaignSection,
      cta: { ...content.campaignSection.cta },
    },
    gallerySection: { ...content.gallerySection },
    galleryImages: content.galleryImages.map((item) => ({
      ...item,
      image: normalizeMediaUrl(item.image),
    })),
    supportSection: {
      ...content.supportSection,
      details: content.supportSection.details.map((d) => d.trim()).filter(Boolean),
      cta: { ...content.supportSection.cta },
    },
  }
}

function validateDraft() {
  if (!draft.serviceCards.length) return 'Add at least one service card.'
  if (!draft.helpCards.length) return 'Add at least one help card.'

  const invalidService = draft.serviceCards.findIndex(
    (c) => !c.title.trim() || !c.body.trim(),
  )
  if (invalidService >= 0) {
    return `Service card ${invalidService + 1} needs a title and description.`
  }

  const invalidHelp = draft.helpCards.findIndex(
    (c) => !c.title.trim() || !c.body.trim(),
  )
  if (invalidHelp >= 0) {
    return `Help card ${invalidHelp + 1} needs a title and description.`
  }

  return ''
}

function parseCmsBody(body: string): Partial<VolunteerPageContent> | null {
  if (!body.trim()) return null
  try {
    const parsed = JSON.parse(body) as unknown
    return isRecord(parsed) ? (parsed as Partial<VolunteerPageContent>) : null
  } catch {
    return null
  }
}

function mergeContent(
  base: VolunteerPageContent,
  override: Partial<VolunteerPageContent> | null,
): VolunteerPageContent {
  if (!override) return cloneContent(base)

  return {
    serviceSection: mergeObject(base.serviceSection, override.serviceSection),
    serviceCards: mergeServiceCards(override.serviceCards, base.serviceCards),
    storySection: mergeStorySection(base.storySection, override.storySection),
    helpSection: mergeObject(base.helpSection, override.helpSection),
    helpCards: mergeHelpCards(override.helpCards, base.helpCards),
    campaignSection: mergeCampaignSection(base.campaignSection, override.campaignSection),
    gallerySection: mergeObject(base.gallerySection, override.gallerySection),
    galleryImages: mergeGalleryImages(override.galleryImages, base.galleryImages),
    supportSection: mergeSupportSection(base.supportSection, override.supportSection),
  }
}

function mergeServiceCards(override: unknown, fallback: ServiceCard[]): ServiceCard[] {
  if (!Array.isArray(override) || !override.length) return fallback.map(cloneServiceCard)
  return override.filter(isRecord).map((c) => ({
    label: getString(c.label),
    title: getString(c.title),
    body: getString(c.body),
    image: getString(c.image),
    alt: getString(c.alt),
    to: getString(c.to),
  }))
}

function mergeHelpCards(override: unknown, fallback: HelpCard[]): HelpCard[] {
  if (!Array.isArray(override) || !override.length) return fallback.map(cloneHelpCard)
  return override.filter(isRecord).map((c) => ({
    title: getString(c.title),
    body: getString(c.body),
    to: getString(c.to),
  }))
}

function mergeGalleryImages(override: unknown, fallback: GalleryItem[]): GalleryItem[] {
  if (!Array.isArray(override) || !override.length) return fallback.map(cloneGalleryItem)
  return override.filter(isRecord).map((g) => ({
    title: getString(g.title),
    caption: getString(g.caption),
    image: getString(g.image),
    alt: getString(g.alt),
  }))
}

function mergeStorySection(base: VolunteerPageContent['storySection'], override: unknown) {
  if (!isRecord(override)) return { ...base, cta: { ...base.cta } }
  return {
    ...base,
    ...override,
    cta: mergeObject(base.cta, override.cta),
  }
}

function mergeCampaignSection(base: VolunteerPageContent['campaignSection'], override: unknown) {
  if (!isRecord(override)) return { ...base, cta: { ...base.cta } }
  return {
    ...base,
    ...override,
    cta: mergeObject(base.cta, override.cta),
  }
}

function mergeSupportSection(base: VolunteerPageContent['supportSection'], override: unknown) {
  if (!isRecord(override)) return { ...base, details: [...base.details], cta: { ...base.cta } }
  return {
    ...base,
    ...override,
    details: Array.isArray(override.details) ? override.details.map(String) : [...base.details],
    cta: mergeObject(base.cta, override.cta),
  }
}

function mergeObject<T>(base: T, override: unknown): T {
  return isRecord(override) ? ({ ...base, ...override } as T) : { ...base }
}

function cloneContent(c: VolunteerPageContent): VolunteerPageContent {
  return {
    serviceSection: { ...c.serviceSection },
    serviceCards: c.serviceCards.map(cloneServiceCard),
    storySection: { ...c.storySection, cta: { ...c.storySection.cta } },
    helpSection: { ...c.helpSection },
    helpCards: c.helpCards.map(cloneHelpCard),
    campaignSection: { ...c.campaignSection, cta: { ...c.campaignSection.cta } },
    gallerySection: { ...c.gallerySection },
    galleryImages: c.galleryImages.map(cloneGalleryItem),
    supportSection: {
      ...c.supportSection,
      details: [...c.supportSection.details],
      cta: { ...c.supportSection.cta },
    },
  }
}

function cloneServiceCard(c: ServiceCard): ServiceCard {
  return { ...c }
}

function cloneHelpCard(c: HelpCard): HelpCard {
  return { ...c }
}

function cloneGalleryItem(g: GalleryItem): GalleryItem {
  return { ...g }
}
</script>

<template>
  <div :class="['volunteer-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <p class="eyebrow">Volunteer</p>
            <h1>Manage volunteer page</h1>
            <div class="manager-meta" aria-label="Editable sections">
              <span>{{ activeLocaleName }} content</span>
              <span>{{ draft.serviceCards.length }} service cards</span>
              <span>{{ draft.helpCards.length }} help cards</span>
              <span>{{ draft.galleryImages.length }} gallery</span>
            </div>
          </div>
          <div class="hero-actions">
            <RouterLink class="btn btn-secondary" to="/get-involved/volunteer">
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

        <div v-if="loading" class="state-card">Loading Volunteer content...</div>
        <div v-else-if="loadError" class="state-card state-card-error">
          <span>{{ loadError }}</span>
          <button type="button" class="btn btn-secondary" @click="loadPage">Try again</button>
        </div>

        <div v-else class="content-grid">

          <nav class="section-nav" aria-label="Page sections">
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

          <!-- ── SERVICE ── -->
          <div :id="sections[0].id" class="section-group">
            <p class="section-group-label">Service</p>
          </div>

          <!-- ─── Service Section Intro ─── -->
          <section class="editor-panel" aria-labelledby="service-section-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Service section</p>
                <h2 id="service-section-heading">Three ways to serve heading</h2>
              </div>
              <FolderHeart :size="20" aria-hidden="true" />
            </div>
            <div class="panel-body form-grid">
              <label class="field">
                <span>Small label</span>
                <input v-model="draft.serviceSection.kicker" type="text" />
              </label>
              <label class="field">
                <span>Section heading</span>
                <input v-model="draft.serviceSection.heading" type="text" />
              </label>
              <label class="field wide">
                <span>Section description</span>
                <textarea v-model="draft.serviceSection.description" rows="3"></textarea>
              </label>
            </div>
          </section>

          <!-- ─── Service Cards ─── -->
          <section class="editor-panel" aria-labelledby="service-cards-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Service cards</p>
                <h2 id="service-cards-heading">Programs volunteers can join</h2>
              </div>
              <button type="button" class="btn btn-secondary" :disabled="!canAddServiceCard" @click="addServiceCard">
                <Plus :size="16" aria-hidden="true" />
                <span>Add card</span>
              </button>
            </div>
            <div class="cards-list">
              <article v-for="(card, index) in draft.serviceCards" :key="index" class="card-editor">
                <header class="card-editor-header">
                  <div class="card-heading">
                    <span class="card-number">{{ String(index + 1).padStart(2, '0') }}</span>
                    <div>
                      <h3>{{ card.title || 'Untitled card' }}</h3>
                      <p>{{ card.label || 'No label' }}</p>
                    </div>
                  </div>
                  <div class="card-actions">
                    <button type="button" class="icon-btn" :disabled="index === 0" aria-label="Move up" @click="moveServiceCard(index, -1)">
                      <ArrowUp :size="15" aria-hidden="true" />
                    </button>
                    <button type="button" class="icon-btn" :disabled="index === draft.serviceCards.length - 1" aria-label="Move down" @click="moveServiceCard(index, 1)">
                      <ArrowDown :size="15" aria-hidden="true" />
                    </button>
                    <button type="button" class="icon-btn danger" aria-label="Remove card" @click="removeServiceCard(index)">
                      <Trash2 :size="15" aria-hidden="true" />
                    </button>
                  </div>
                </header>

                <div class="card-editor-top">
                  <figure class="image-preview card-preview">
                    <img :src="resolveImageUrl(card.image, fallbackContent.serviceCards[0]?.image ?? '')" alt="" />
                  </figure>
                  <div class="card-image-controls image-control-panel">
                    <label class="field">
                      <span>Image URL</span>
                      <input v-model="card.image" type="url" :placeholder="imageHint" />
                    </label>
                    <label class="upload-box">
                      <Upload :size="17" aria-hidden="true" />
                      <span>{{ uploadingKey === `service-${index}` ? 'Uploading...' : 'Upload card image' }}</span>
                      <input
                        type="file"
                        accept="image/*"
                        :disabled="uploadingKey === `service-${index}`"
                        @change="uploadImage($event, `service-${index}`, (url) => (card.image = url))"
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
                </div>
              </article>
            </div>
          </section>

          <!-- ─── Story Section ─── -->
          <div :id="sections[1].id" class="section-group">
            <p class="section-group-label">Story</p>
          </div>
          <section class="editor-panel" aria-labelledby="story-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Impact story</p>
                <h2 id="story-heading">Story section</h2>
              </div>
              <FileText :size="20" aria-hidden="true" />
            </div>
            <div class="image-editor-grid">
              <figure class="image-preview hero-preview">
                <img :src="storyPreview" alt="" />
              </figure>
              <div class="form-stack">
                <div class="form-grid">
                  <label class="field">
                    <span>Small label</span>
                    <input v-model="draft.storySection.kicker" type="text" />
                  </label>
                  <label class="field">
                    <span>Heading</span>
                    <input v-model="draft.storySection.heading" type="text" />
                  </label>
                  <label class="field wide">
                    <span>Story text</span>
                    <textarea v-model="draft.storySection.body" rows="3"></textarea>
                  </label>
                  <label class="field wide">
                    <span>Image URL</span>
                    <input v-model="draft.storySection.image" type="url" :placeholder="imageHint" />
                  </label>
                  <label class="field wide">
                    <span>Image alt text</span>
                    <input v-model="draft.storySection.alt" type="text" />
                  </label>
                  <label class="field">
                    <span>Button label</span>
                    <input v-model="draft.storySection.cta.label" type="text" />
                  </label>
                </div>
                <label class="upload-box">
                  <Upload :size="17" aria-hidden="true" />
                  <span>{{ uploadingKey === 'story-image' ? 'Uploading...' : 'Upload story image' }}</span>
                  <input
                    type="file"
                    accept="image/*"
                    :disabled="uploadingKey === 'story-image'"
                    @change="uploadImage($event, 'story-image', (url) => (draft.storySection.image = url))"
                  />
                </label>
              </div>
            </div>
          </section>

          <!-- ─── Help Section Intro ─── -->
          <div :id="sections[2].id" class="section-group">
            <p class="section-group-label">Help</p>
          </div>
          <section class="editor-panel" aria-labelledby="help-section-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Help section</p>
                <h2 id="help-section-heading">How you can help heading</h2>
              </div>
              <Sparkles :size="20" aria-hidden="true" />
            </div>
            <div class="panel-body form-grid">
              <label class="field">
                <span>Small label</span>
                <input v-model="draft.helpSection.kicker" type="text" />
              </label>
              <label class="field">
                <span>Section heading</span>
                <input v-model="draft.helpSection.heading" type="text" />
              </label>
            </div>
          </section>

          <!-- ─── Help Cards ─── -->
          <section class="editor-panel" aria-labelledby="help-cards-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Help cards</p>
                <h2 id="help-cards-heading">Ways to get involved</h2>
              </div>
              <button type="button" class="btn btn-secondary" :disabled="!canAddHelpCard" @click="addHelpCard">
                <Plus :size="16" aria-hidden="true" />
                <span>Add card</span>
              </button>
            </div>
            <div class="cards-list">
              <article v-for="(card, index) in draft.helpCards" :key="index" class="card-editor">
                <header class="card-editor-header">
                  <div class="card-heading">
                    <span class="card-number">{{ String(index + 1).padStart(2, '0') }}</span>
                    <div>
                      <h3>{{ card.title || 'Untitled card' }}</h3>
                      <p>{{ card.body ? card.body.slice(0, 40) + '...' : 'No description' }}</p>
                    </div>
                  </div>
                  <div class="card-actions">
                    <button type="button" class="icon-btn" :disabled="index === 0" aria-label="Move up" @click="moveHelpCard(index, -1)">
                      <ArrowUp :size="15" aria-hidden="true" />
                    </button>
                    <button type="button" class="icon-btn" :disabled="index === draft.helpCards.length - 1" aria-label="Move down" @click="moveHelpCard(index, 1)">
                      <ArrowDown :size="15" aria-hidden="true" />
                    </button>
                    <button type="button" class="icon-btn danger" aria-label="Remove card" @click="removeHelpCard(index)">
                      <Trash2 :size="15" aria-hidden="true" />
                    </button>
                  </div>
                </header>
                <div class="card-form-grid">
                  <label class="field wide">
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

          <!-- ─── Campaign Section ─── -->
          <div :id="sections[3].id" class="section-group">
            <p class="section-group-label">Campaign</p>
          </div>
          <section class="editor-panel" aria-labelledby="campaign-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Featured campaign</p>
                <h2 id="campaign-heading">Campaign banner</h2>
              </div>
              <BookOpen :size="20" aria-hidden="true" />
            </div>
            <div class="panel-body form-grid">
              <label class="field">
                <span>Small label</span>
                <input v-model="draft.campaignSection.kicker" type="text" />
              </label>
              <label class="field">
                <span>Campaign heading</span>
                <input v-model="draft.campaignSection.heading" type="text" />
              </label>
              <label class="field wide">
                <span>Campaign text</span>
                <textarea v-model="draft.campaignSection.body" rows="3"></textarea>
              </label>
              <label class="field">
                <span>Button label</span>
                <input v-model="draft.campaignSection.cta.label" type="text" />
              </label>
            </div>
          </section>

          <!-- ─── Gallery Section Intro ─── -->
          <div :id="sections[4].id" class="section-group">
            <p class="section-group-label">Gallery</p>
          </div>
          <section class="editor-panel" aria-labelledby="gallery-section-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Gallery section</p>
                <h2 id="gallery-section-heading">Field moments heading</h2>
              </div>
              <ImageIcon :size="20" aria-hidden="true" />
            </div>
            <div class="panel-body form-grid">
              <label class="field">
                <span>Small label</span>
                <input v-model="draft.gallerySection.kicker" type="text" />
              </label>
              <label class="field">
                <span>Section heading</span>
                <input v-model="draft.gallerySection.heading" type="text" />
              </label>
            </div>
          </section>

          <!-- ─── Gallery Images ─── -->
          <section class="editor-panel" aria-labelledby="gallery-images-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Gallery images</p>
                <h2 id="gallery-images-heading">Field moments photos</h2>
              </div>
              <button type="button" class="btn btn-secondary" :disabled="!canAddGallery" @click="addGalleryImage">
                <Plus :size="16" aria-hidden="true" />
                <span>Add image</span>
              </button>
            </div>
            <div class="cards-list">
              <article v-for="(item, index) in draft.galleryImages" :key="index" class="card-editor">
                <header class="card-editor-header">
                  <div class="card-heading">
                    <span class="card-number">{{ String(index + 1).padStart(2, '0') }}</span>
                    <div>
                      <h3>{{ item.title || 'Untitled image' }}</h3>
                      <p>{{ item.caption || 'No caption' }}</p>
                    </div>
                  </div>
                  <div class="card-actions">
                    <button type="button" class="icon-btn" :disabled="index === 0" aria-label="Move up" @click="moveGalleryImage(index, -1)">
                      <ArrowUp :size="15" aria-hidden="true" />
                    </button>
                    <button type="button" class="icon-btn" :disabled="index === draft.galleryImages.length - 1" aria-label="Move down" @click="moveGalleryImage(index, 1)">
                      <ArrowDown :size="15" aria-hidden="true" />
                    </button>
                    <button type="button" class="icon-btn danger" aria-label="Remove image" @click="removeGalleryImage(index)">
                      <Trash2 :size="15" aria-hidden="true" />
                    </button>
                  </div>
                </header>

                <div class="card-editor-top">
                  <figure class="image-preview card-preview">
                    <img :src="resolveImageUrl(item.image, fallbackContent.galleryImages[0]?.image ?? '')" alt="" />
                  </figure>
                  <div class="card-image-controls image-control-panel">
                    <label class="field">
                      <span>Image URL</span>
                      <input v-model="item.image" type="url" :placeholder="imageHint" />
                    </label>
                    <label class="upload-box">
                      <Upload :size="17" aria-hidden="true" />
                      <span>{{ uploadingKey === `gallery-${index}` ? 'Uploading...' : 'Upload image' }}</span>
                      <input
                        type="file"
                        accept="image/*"
                        :disabled="uploadingKey === `gallery-${index}`"
                        @change="uploadImage($event, `gallery-${index}`, (url) => (item.image = url))"
                      />
                    </label>
                  </div>
                </div>

                <div class="card-form-grid">
                  <label class="field">
                    <span>Title</span>
                    <input v-model="item.title" type="text" />
                  </label>
                  <label class="field">
                    <span>Image alt text</span>
                    <input v-model="item.alt" type="text" />
                  </label>
                  <label class="field wide">
                    <span>Caption</span>
                    <textarea v-model="item.caption" rows="2"></textarea>
                  </label>
                </div>
              </article>
            </div>
          </section>

          <!-- ─── Support / Contact Section ─── -->
          <div :id="sections[5].id" class="section-group">
            <p class="section-group-label">Contact</p>
          </div>
          <section class="editor-panel" aria-labelledby="support-section-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Volunteer contact</p>
                <h2 id="support-section-heading">Contact and support details</h2>
              </div>
              <div class="panel-icons" aria-hidden="true">
                <Phone :size="18" />
                <Mail :size="18" />
                <MapPin :size="18" />
              </div>
            </div>

            <div class="panel-body intro-fields">
              <div class="form-grid">
                <label class="field">
                  <span>Small label</span>
                  <input v-model="draft.supportSection.kicker" type="text" />
                </label>
                <label class="field">
                  <span>Section heading</span>
                  <input v-model="draft.supportSection.heading" type="text" />
                </label>
                <label class="field wide">
                  <span>Section description</span>
                  <textarea v-model="draft.supportSection.body" rows="3"></textarea>
                </label>
                <label class="field">
                  <span>Card title</span>
                  <input v-model="draft.supportSection.cardTitle" type="text" />
                </label>
                <label class="field">
                  <span>Card description</span>
                  <input v-model="draft.supportSection.cardBody" type="text" />
                </label>
                <label class="field">
                  <span>Button label</span>
                  <input v-model="draft.supportSection.cta.label" type="text" />
                </label>
              </div>

              <div class="details-section">
                <div class="details-header">
                  <span class="details-label">Contact details list</span>
                  <button type="button" class="btn btn-secondary btn-small" @click="addDetail">
                    <Plus :size="14" aria-hidden="true" />
                    <span>Add detail</span>
                  </button>
                </div>
                <div class="details-list">
                  <div v-for="(detail, index) in draft.supportSection.details" :key="index" class="detail-row">
                    <span class="detail-index">{{ index + 1 }}</span>
                    <label class="field detail-field">
                      <input v-model="draft.supportSection.details[index]" type="text" />
                    </label>
                    <button type="button" class="icon-btn danger" aria-label="Remove detail" @click="removeDetail(index)">
                      <Trash2 :size="14" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.volunteer-admin {
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

.btn-small {
  min-height: 32px;
  padding: 0.35rem 0.55rem;
  font-size: 0.74rem;
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

.panel-icons {
  color: var(--admin-theme-primary-deep);
}

.panel-body {
  padding: 1rem;
}

.intro-fields {
  padding: 1rem 1rem 0;
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

.details-section {
  margin-top: 1.2rem;
}

.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.details-label {
  color: var(--admin-theme-contrast-soft);
  font-size: 0.8rem;
  font-weight: 800;
}

.details-list {
  display: grid;
  gap: 0.6rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.detail-index {
  display: grid;
  width: 1.6rem;
  height: 1.6rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 20%, var(--admin-theme-border));
  border-radius: 5px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-primary-deep);
  font-size: 0.68rem;
  font-weight: 900;
  flex-shrink: 0;
}

.detail-field {
  flex: 1;
  min-width: 0;
}

.detail-field input {
  width: 100%;
  border: 1px solid var(--admin-theme-border-strong);
  border-radius: 6px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-text);
  font: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  padding: 0.55rem 0.65rem;
}

.detail-field input:focus {
  border-color: var(--admin-theme-primary);
  outline: 3px solid color-mix(in srgb, var(--admin-theme-primary) 15%, transparent);
}

:global(.admin-dark) .btn-primary {
  color: #071311;
}

@media (min-width: 900px) {
  .volunteer-admin.sidebar-open {
    padding-left: 260px;
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
}
</style>
