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

type ActionLink = { label: string; to: string }
type ServiceCard = { label: string; title: string; body: string; image: string; alt: string; to: string }
type HelpCard = { title: string; body: string; to: string }
type GalleryItem = { title: string; caption: string; image: string; alt: string }

type VolunteerPageContent = {
  serviceSection: { kicker: string; heading: string; description: string }
  serviceCards: ServiceCard[]
  storySection: { kicker: string; heading: string; body: string; image: string; alt: string; cta: ActionLink }
  helpSection: { kicker: string; heading: string }
  helpCards: HelpCard[]
  campaignSection: { kicker: string; heading: string; body: string; cta: ActionLink }
  gallerySection: { kicker: string; heading: string }
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function getString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
function resolveImageUrl(url: string, fallback: string): string {
  return url.trim() ? url : fallback
}

const fallbackContent: VolunteerPageContent = {
  serviceSection: { kicker: 'Opportunities', heading: 'Three ways to serve', description: 'Volunteers can support long-term community development through practical, compassionate programs already moving in the field.' },
  serviceCards: [
    { label: 'Education', title: 'Child education', body: 'Support reading, Buddhist primary education and practical learning materials for children.', image: '/images/programs/education.jpg', alt: 'Children reading with a volunteer in a Cambodian school setting', to: '/programs/education' },
    { label: 'Livelihoods', title: 'Livelihoods', body: 'Help families strengthen home gardens, savings groups and local food security.', image: '/images/programs/livelihood-hero2.jpg', alt: 'A volunteer and farmers reviewing a Cambodian home garden', to: '/programs/livelihood' },
    { label: 'Community care', title: 'Environment & WASH', body: 'Join field activities around tree planting, hygiene awareness and safer school environments.', image: '/images/programs/environment-hero1.jpg', alt: 'Volunteers and villagers planting tree seedlings in rural Cambodia', to: '/programs/environment' },
  ],
  storySection: { kicker: 'Impact story', heading: 'Small support changes lives', body: 'Through patient support, local partnership and compassionate action, volunteers help communities move toward stability, dignity and hope.', image: '/images/programs/child-protection2.jpg', alt: 'Children and youth holding learning materials after a field activity', cta: { label: 'View programs', to: '/programs' } },
  helpSection: { kicker: 'How you can help', heading: 'Make change with us' },
  helpCards: [
    { title: 'Donate', body: 'Support learning materials, community activities and field work for vulnerable villages.', to: '/qr-donate' },
    { title: 'Volunteer', body: 'Bring your time, skills and care to practical work with children and communities.', to: '/contact' },
    { title: 'Partner', body: 'Collaborate with Santi Sena through shared values, technical skill or grant support.', to: '/get-involved/partner' },
  ],
  campaignSection: { kicker: 'Featured campaign', heading: 'Support children\u2019s learning', body: 'Your contribution can help provide learning materials, safe activities and community care for children who need it most.', cta: { label: 'Support this mission', to: '/qr-donate' } },
  gallerySection: { kicker: 'Gallery', heading: 'Field moments' },
  galleryImages: [
    { title: 'Youth learning', caption: 'Child protection and peer education activities.', image: '/images/programs/child-protection2.jpg', alt: 'Children and youth peer educators meeting in a Cambodian village' },
    { title: 'Healthy schools', caption: 'WASH practice with students and teachers.', image: '/images/programs/education.jpg', alt: 'Children practicing handwashing at a rural Cambodian school' },
    { title: 'Pagoda learning', caption: 'Books and materials for Buddhist education.', image: '/images/programs/education.jpg', alt: 'Young monks and volunteers organizing learning materials' },
    { title: 'Field visits', caption: 'Community work carried with local teams.', image: '/images/programs/hero-2.jpg', alt: 'Volunteer team walking on a rural Cambodian road' },
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
const ui = useUiStore()
const { locale } = useI18n()

const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

useAdminTheme()



const pageRow = ref<PageContent | null>(null)
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')

const draft = reactive<VolunteerPageContent>(cloneContent(fallbackContent))

const {
  editingSections, collapsedSections, toggleCollapse, toggleEdit, cancelEdit,
  setupSectionWatch, stopSectionWatch, resetEditingState,
} = useSectionEditor([
  {
    key: 'service',
    getSnapshot: () => ({ ...draft.serviceSection, serviceCards: draft.serviceCards.map((c) => ({ ...c })) }),
    applySnapshot: (v) => { draft.serviceSection = v; draft.serviceCards = v.serviceCards },
  },
  {
    key: 'story',
    getSnapshot: () => ({ ...draft.storySection, cta: { ...draft.storySection.cta } }),
    applySnapshot: (v) => { draft.storySection = v },
  },
  {
    key: 'help',
    getSnapshot: () => ({ ...draft.helpSection, helpCards: draft.helpCards.map((c) => ({ ...c })) }),
    applySnapshot: (v) => { draft.helpSection = v; draft.helpCards = v.helpCards },
  },
  {
    key: 'campaign',
    getSnapshot: () => ({ ...draft.campaignSection, cta: { ...draft.campaignSection.cta } }),
    applySnapshot: (v) => { draft.campaignSection = v },
  },
  {
    key: 'gallery',
    getSnapshot: () => ({ gallerySection: { ...draft.gallerySection }, galleryImages: draft.galleryImages.map((g) => ({ ...g })) }),
    applySnapshot: (v) => { draft.gallerySection = v.gallerySection; draft.galleryImages = v.galleryImages },
  },
  {
    key: 'support',
    getSnapshot: () => ({ ...draft.supportSection, details: [...draft.supportSection.details], cta: { ...draft.supportSection.cta } }),
    applySnapshot: (v) => { draft.supportSection = v },
  },
])

const originalSnapshot = ref('')
const hasChanges = computed(() => JSON.stringify(cloneContent(draft)) !== originalSnapshot.value)
function updateSnapshot() { originalSnapshot.value = JSON.stringify(cloneContent(draft)) }

const activeLocale = computed<SupportedLocale>(() => locale.value === 'kh' ? 'kh' : 'en')
const activeLocaleName = computed(() => activeLocale.value === 'kh' ? 'Khmer' : 'English')
const canAddServiceCard = computed(() => draft.serviceCards.length < MAX_SERVICE_CARDS)
const canAddHelpCard = computed(() => draft.helpCards.length < MAX_HELP_CARDS)
const canAddGallery = computed(() => draft.galleryImages.length < MAX_GALLERY_IMAGES)
const storyPreview = computed(() => resolveImageUrl(draft.storySection.image, fallbackContent.storySection.image))

const sections = [
  { id: 'vol-service', label: 'Service', icon: 'mdi-folder-heart' },
  { id: 'vol-story', label: 'Story', icon: 'mdi-book-open-page-variant' },
  { id: 'vol-help', label: 'Help', icon: 'mdi-lightbulb-on' },
  { id: 'vol-campaign', label: 'Campaign', icon: 'mdi-megaphone' },
  { id: 'vol-gallery', label: 'Gallery', icon: 'mdi-image-multiple' },
  { id: 'vol-support', label: 'Contact', icon: 'mdi-phone' },
] as const

const { activeSection, scrollToSection, updateActiveSectionFromScroll } = useScrollSpyNav(sections)
useUnsavedChangesGuard(hasChanges)

onMounted(() => { contentStore.useLocalFallback(); void loadPage() })
onUnmounted(() => { stopSectionWatch() })
watch(activeLocale, () => { void loadPage() })

async function loadPage() {
  resetEditingState(); loading.value = true; loadError.value = ''
  try {
    const page = await contentStore.fetchBySlug(PAGE_SLUG, activeLocale.value)
    pageRow.value = page
    replaceDraft(mergeContent(fallbackContent, parseCmsBody(page?.body ?? '')))
    updateSnapshot()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load Volunteer content.'
    ui.addToast(loadError.value, 'error')
  } finally { loading.value = false; setupSectionWatch() }
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
  if (validationError) { ui.addToast(validationError, 'error'); return }
  saving.value = true
  try {
    const content = prepareForSave(draft)
    const saved = await contentStore.upsert({ id: pageRow.value?.id ?? '', slug: PAGE_SLUG, title: 'Volunteer', body: JSON.stringify(content, null, 2), locale: activeLocale.value, route_path: '/get-involved/volunteer', nav_group: 'Get Involved', template: 'standard', status: 'published', updated_at: pageRow.value?.updated_at ?? '' })
    pageRow.value = saved; replaceDraft(content); updateSnapshot()
    ui.addToast(`Volunteer ${activeLocaleName.value} content saved.`, 'success')
  } catch (error) { ui.addToast(error instanceof Error ? error.message : 'Could not save Volunteer content.', 'error')
  } finally { saving.value = false }
}

function addServiceCard() {
  if (!canAddServiceCard.value) return
  draft.serviceCards.push({ label: 'New program', title: 'New service card', body: 'Describe the volunteer opportunity.', image: '/images/programs/hero-1.jpg', alt: 'Santi Sena community activity', to: '/get-involved/volunteer' })
}
function addHelpCard() {
  if (!canAddHelpCard.value) return
  draft.helpCards.push({ title: 'New help card', body: 'Describe how to help.', to: '/get-involved' })
}
function addGalleryImage() {
  if (!canAddGallery.value) return
  draft.galleryImages.push({ title: 'New gallery image', caption: 'Describe this moment.', image: '/images/programs/hero-1.jpg', alt: 'Volunteer activity' })
}
function addDetail() { draft.supportSection.details.push('New contact detail') }
function removeDetail(index: number) { draft.supportSection.details.splice(index, 1) }

function removeItem<T extends { title?: string; name?: string }>(items: T[], index: number, label: string) {
  const item = items[index]; if (!item) return
  const itemTitle = item.title || item.name || 'this item'
  confirmDialog(`Remove ${label}?`, `Remove "${itemTitle}" from the public Volunteer page?`, () => { items.splice(index, 1); ui.addToast(`${label} removed.`, 'warning') })
}
function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction; if (target < 0 || target >= items.length) return
  const current = items[index]; const next = items[target]; if (!current || !next) return
  items[index] = next; items[target] = current
}

function resetToDefaults() {
  confirmDialog('Reset Volunteer content?', 'Restore all sections, cards, gallery and contact details to their defaults?', () => { replaceDraft(cloneContent(fallbackContent)); ui.addToast('Default Volunteer draft restored.', 'info') })
}

function prepareForSave(content: VolunteerPageContent): VolunteerPageContent {
  return {
    serviceSection: { ...content.serviceSection },
    serviceCards: content.serviceCards.map((c) => ({ ...c, image: normalizeMediaUrl(c.image) })),
    storySection: { ...content.storySection, image: normalizeMediaUrl(content.storySection.image), cta: { ...content.storySection.cta } },
    helpSection: { ...content.helpSection },
    helpCards: content.helpCards.map((c) => ({ ...c })),
    campaignSection: { ...content.campaignSection, cta: { ...content.campaignSection.cta } },
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
  const invalidService = draft.serviceCards.findIndex((c) => !c.title.trim() || !c.body.trim())
  if (invalidService >= 0) return `Service card ${invalidService + 1} needs a title and description.`
  const invalidHelp = draft.helpCards.findIndex((c) => !c.title.trim() || !c.body.trim())
  if (invalidHelp >= 0) return `Help card ${invalidHelp + 1} needs a title and description.`
  return ''
}

function parseCmsBody(body: string): Partial<VolunteerPageContent> | null {
  if (!body.trim()) return null
  try { const parsed = JSON.parse(body) as unknown; return isRecord(parsed) ? (parsed as Partial<VolunteerPageContent>) : null } catch { return null }
}

function mergeContent(base: VolunteerPageContent, override: Partial<VolunteerPageContent> | null): VolunteerPageContent {
  if (!override) return cloneContent(base)
  return {
    serviceSection: mergeObject(base.serviceSection, override.serviceSection),
    serviceCards: Array.isArray(override.serviceCards) && override.serviceCards.length ? override.serviceCards.map((c) => ({ ...c })) : base.serviceCards.map((c) => ({ ...c })),
    storySection: mergeRecordWithCta(base.storySection, override.storySection),
    helpSection: mergeObject(base.helpSection, override.helpSection),
    helpCards: Array.isArray(override.helpCards) && override.helpCards.length ? override.helpCards.map((c) => ({ ...c })) : base.helpCards.map((c) => ({ ...c })),
    campaignSection: mergeRecordWithCta(base.campaignSection, override.campaignSection),
    gallerySection: mergeObject(base.gallerySection, override.gallerySection),
    galleryImages: mergeGalleryImages(override.galleryImages, base.galleryImages),
    supportSection: mergeSupportSection(base.supportSection, override.supportSection),
  }
}

function mergeRecordWithCta<T extends { cta: ActionLink }>(base: T, override: unknown): T {
  if (!isRecord(override)) return { ...base, cta: { ...base.cta } }
  return { ...base, ...override, cta: mergeObject(base.cta, (override as any).cta) }
}

function mergeSupportSection(base: VolunteerPageContent['supportSection'], override: unknown) {
  if (!isRecord(override)) return { ...base, details: [...base.details], cta: { ...base.cta } }
  return { ...base, ...override, details: Array.isArray((override as any).details) ? (override as any).details.map(String) : [...base.details], cta: mergeObject(base.cta, (override as any).cta) }
}

function mergeObject<T>(base: T, override: unknown): T {
  return isRecord(override) ? { ...base, ...override } as T : { ...base }
}

function mergeGalleryImages(override: unknown, fallback: GalleryItem[]): GalleryItem[] {
  if (!Array.isArray(override) || !override.length) return fallback.map(cloneGalleryItem)
  return override.filter(isRecord).map((item, index) => ({
    title: getString(item.title) || fallback[index]?.title || fallback[0]?.title || '',
    caption: getString(item.caption) || fallback[index]?.caption || '',
    image: getString(item.image) || fallback[index]?.image || fallback[0]?.image || '',
    alt: getString(item.alt) || fallback[index]?.alt || '',
  }))
}

function cloneGalleryItem(item: GalleryItem): GalleryItem {
  return { ...item }
}

function cloneContent(c: VolunteerPageContent): VolunteerPageContent {
  return {
    serviceSection: { ...c.serviceSection },
    serviceCards: c.serviceCards.map((c) => ({ ...c })),
    storySection: { ...c.storySection, cta: { ...c.storySection.cta } },
    helpSection: { ...c.helpSection },
    helpCards: c.helpCards.map((c) => ({ ...c })),
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
</script>

<template>
  <v-app :class="['volunteer-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Manage volunteer page</h1>
            <div class="manager-meta">
              <v-chip size="small" variant="tonal" color="primary">{{ activeLocaleName }} content</v-chip>
              <v-chip size="small" variant="tonal" color="primary">{{ draft.serviceCards.length }} service cards</v-chip>
              <v-chip size="small" variant="tonal" color="primary">{{ draft.helpCards.length }} help cards</v-chip>
              <v-chip size="small" variant="tonal" color="primary">{{ draft.galleryImages.length }} gallery</v-chip>
            </div>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/get-involved/volunteer" target="_blank">
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
            <span class="mt-4 font-weight-bold">Loading Volunteer content...</span>
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
            aria-label="Volunteer page sections"
            save-label="Save Change"
            @navigate="scrollToSection"
            @save="savePage"
          />

          <!-- ═══ SERVICE ═══ -->
          <AdminEditorPanel
            :id="sections[0].id"
            kicker="Service section"
            heading="Three ways to serve"
            :editing="!!editingSections.service"
            :collapsed="!!collapsedSections.service"
            @toggle-edit="toggleEdit('service')"
            @cancel="cancelEdit('service')"
            @toggle-collapse="toggleCollapse('service')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddServiceCard" @click="addServiceCard">
                  <v-icon start>mdi-plus</v-icon>
                  Add card
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="panel-body form-grid">
              <v-text-field v-model="draft.serviceSection.kicker" label="Small label" :disabled="!editingSections.service" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.serviceSection.heading" label="Section heading" :disabled="!editingSections.service" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.serviceSection.description" label="Section description" rows="3" :disabled="!editingSections.service" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>

            <v-divider class="mx-4" />
            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="cards-list">
                <article v-for="(card, index) in draft.serviceCards" :key="'svc-' + index" class="card-editor">
                  <header class="card-editor-header">
                    <div class="card-heading">
                      <span class="card-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <div>
                        <h3>{{ card.title || 'Untitled card' }}</h3>
                        <p>{{ card.label || 'No label' }}</p>
                      </div>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.service || index === 0" @click="moveItem(draft.serviceCards, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.service || index === draft.serviceCards.length - 1" @click="moveItem(draft.serviceCards, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.service" icon color="error" variant="tonal" size="small" @click="removeItem(draft.serviceCards, index, 'service card')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>

                  <div class="card-editor-top">
                    <div class="image-upload-panel card-image-upload">
                      <v-img :src="resolveImageUrl(card.image, fallbackContent.serviceCards[0]?.image ?? '')" aspect-ratio="1.35" cover class="image-preview card-preview" />
                      <AdminUploadButton :disabled="!editingSections.service" :description="`Volunteer service-${index} image`" @update:model-value="(url) => (card.image = url)" />
                    </div>
                  </div>

                  <div class="card-form-grid">
                    <v-text-field v-model="card.label" label="Label" :disabled="!editingSections.service" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="card.title" label="Title" :disabled="!editingSections.service" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="card.alt" label="Image alt text" :disabled="!editingSections.service" hide-details density="comfortable" variant="outlined" />
                    <v-textarea v-model="card.body" label="Description" rows="3" :disabled="!editingSections.service" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ═══ STORY ═══ -->
          <AdminEditorPanel
            :id="sections[1].id"
            kicker="Impact story"
            heading="Small support changes lives"
            :editing="!!editingSections.story"
            :collapsed="!!collapsedSections.story"
            @toggle-edit="toggleEdit('story')"
            @cancel="cancelEdit('story')"
            @toggle-collapse="toggleCollapse('story')"
          >
            <div class="image-editor-grid">
              <div class="image-upload-panel">
                <v-img :src="storyPreview" aspect-ratio="1.6" cover class="image-preview hero-preview" />
                <AdminUploadButton :disabled="!editingSections.story" description="Volunteer story image" @update:model-value="(url) => (draft.storySection.image = url)" />
              </div>

              <div class="form-stack">
                <div class="form-grid">
                  <v-text-field v-model="draft.storySection.kicker" label="Small label" :disabled="!editingSections.story" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="draft.storySection.heading" label="Heading" :disabled="!editingSections.story" hide-details density="comfortable" variant="outlined" />
                  <v-textarea v-model="draft.storySection.body" label="Story text" rows="3" :disabled="!editingSections.story" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-text-field v-model="draft.storySection.alt" label="Image alt text" :disabled="!editingSections.story" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="draft.storySection.cta.label" label="Button label" :disabled="!editingSections.story" hide-details density="comfortable" variant="outlined" />
                </div>
              </div>
            </div>
          </AdminEditorPanel>

          <!-- ═══ HELP ═══ -->
          <AdminEditorPanel
            :id="sections[2].id"
            kicker="Help section"
            heading="Make change with us"
            :editing="!!editingSections.help"
            :collapsed="!!collapsedSections.help"
            @toggle-edit="toggleEdit('help')"
            @cancel="cancelEdit('help')"
            @toggle-collapse="toggleCollapse('help')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddHelpCard" @click="addHelpCard">
                  <v-icon start>mdi-plus</v-icon>
                  Add card
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="panel-body form-grid">
              <v-text-field v-model="draft.helpSection.kicker" label="Small label" :disabled="!editingSections.help" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.helpSection.heading" label="Section heading" :disabled="!editingSections.help" hide-details density="comfortable" variant="outlined" />
            </div>

            <v-divider class="mx-4" />
            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="cards-list">
                <article v-for="(card, index) in draft.helpCards" :key="'help-' + index" class="card-editor">
                  <header class="card-editor-header">
                    <div class="card-heading">
                      <span class="card-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <div>
                        <h3>{{ card.title || 'Untitled card' }}</h3>
                        <p>{{ card.body ? card.body.slice(0, 40) + '...' : 'No description' }}</p>
                      </div>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.help || index === 0" @click="moveItem(draft.helpCards, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.help || index === draft.helpCards.length - 1" @click="moveItem(draft.helpCards, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.help" icon color="error" variant="tonal" size="small" @click="removeItem(draft.helpCards, index, 'help card')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="card-form-grid">
                    <v-text-field v-model="card.title" label="Title" :disabled="!editingSections.help" hide-details density="comfortable" variant="outlined" class="field-wide" />
                    <v-textarea v-model="card.body" label="Description" rows="3" :disabled="!editingSections.help" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ═══ CAMPAIGN ═══ -->
          <AdminEditorPanel
            :id="sections[3].id"
            kicker="Featured campaign"
            heading="Campaign banner"
            :editing="!!editingSections.campaign"
            :collapsed="!!collapsedSections.campaign"
            @toggle-edit="toggleEdit('campaign')"
            @cancel="cancelEdit('campaign')"
            @toggle-collapse="toggleCollapse('campaign')"
          >
            <div class="panel-body form-grid">
              <v-text-field v-model="draft.campaignSection.kicker" label="Small label" :disabled="!editingSections.campaign" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.campaignSection.heading" label="Campaign heading" :disabled="!editingSections.campaign" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.campaignSection.body" label="Campaign text" rows="3" :disabled="!editingSections.campaign" hide-details density="comfortable" variant="outlined" class="field-wide" />
              <v-text-field v-model="draft.campaignSection.cta.label" label="Button label" :disabled="!editingSections.campaign" hide-details density="comfortable" variant="outlined" />
            </div>
          </AdminEditorPanel>

          <!-- ═══ GALLERY ═══ -->
          <AdminEditorPanel
            :id="sections[4].id"
            kicker="Gallery section"
            heading="Field moments"
            :editing="!!editingSections.gallery"
            :collapsed="!!collapsedSections.gallery"
            @toggle-edit="toggleEdit('gallery')"
            @cancel="cancelEdit('gallery')"
            @toggle-collapse="toggleCollapse('gallery')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddGallery" @click="addGalleryImage">
                  <v-icon start>mdi-plus</v-icon>
                  Add image
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="panel-body form-grid">
              <v-text-field v-model="draft.gallerySection.kicker" label="Small label" :disabled="!editingSections.gallery" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.gallerySection.heading" label="Section heading" :disabled="!editingSections.gallery" hide-details density="comfortable" variant="outlined" />
            </div>

            <v-divider class="mx-4" />
            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="cards-list">
                <article v-for="(item, index) in draft.galleryImages" :key="'gallery-' + index" class="card-editor">
                  <header class="card-editor-header">
                    <div class="card-heading">
                      <span class="card-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <div>
                        <h3>{{ item.title || 'Untitled image' }}</h3>
                        <p>{{ item.caption || 'No caption' }}</p>
                      </div>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.gallery || index === 0" @click="moveItem(draft.galleryImages, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.gallery || index === draft.galleryImages.length - 1" @click="moveItem(draft.galleryImages, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.gallery" icon color="error" variant="tonal" size="small" @click="removeItem(draft.galleryImages, index, 'gallery image')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>

                  <div class="card-editor-top">
                    <div class="image-upload-panel card-image-upload">
                      <v-img :src="resolveImageUrl(item.image, fallbackContent.galleryImages[0]?.image ?? '')" aspect-ratio="1.35" cover class="image-preview card-preview" />
                      <AdminUploadButton :disabled="!editingSections.gallery" :description="`Volunteer gallery-${index} image`" @update:model-value="(url) => (item.image = url)" />
                    </div>
                  </div>

                  <div class="card-form-grid">
                    <v-text-field v-model="item.title" label="Title" :disabled="!editingSections.gallery" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="item.alt" label="Image alt text" :disabled="!editingSections.gallery" hide-details density="comfortable" variant="outlined" />
                    <v-textarea v-model="item.caption" label="Caption" rows="2" :disabled="!editingSections.gallery" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ═══ SUPPORT / CONTACT ═══ -->
          <AdminEditorPanel
            :id="sections[5].id"
            kicker="Volunteer contact"
            heading="Contact and support details"
            :editing="!!editingSections.support"
            :collapsed="!!collapsedSections.support"
            @toggle-edit="toggleEdit('support')"
            @cancel="cancelEdit('support')"
            @toggle-collapse="toggleCollapse('support')"
          >
            <div class="panel-body form-grid">
              <v-text-field v-model="draft.supportSection.kicker" label="Small label" :disabled="!editingSections.support" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.supportSection.heading" label="Section heading" :disabled="!editingSections.support" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.supportSection.body" label="Section description" rows="3" :disabled="!editingSections.support" hide-details density="comfortable" variant="outlined" class="field-wide" />
              <v-text-field v-model="draft.supportSection.cardTitle" label="Card title" :disabled="!editingSections.support" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.supportSection.cardBody" label="Card description" :disabled="!editingSections.support" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.supportSection.cta.label" label="Button label" :disabled="!editingSections.support" hide-details density="comfortable" variant="outlined" />
            </div>

            <v-divider class="mx-4" />
            <div class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="font-weight-bold text-body-2" style="color: var(--admin-theme-contrast-soft);">Contact details list</span>
                <v-btn v-if="editingSections.support" size="x-small" variant="tonal" @click="addDetail">
                  <v-icon start>mdi-plus</v-icon>
                  Add detail
                </v-btn>
              </div>

              <v-slide-y-transition group tag="div" class="items-list">
                <article v-for="(detail, index) in draft.supportSection.details" :key="'detail-' + index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h4>Detail {{ index + 1 }}</h4>
                    </div>
                    <div class="card-actions">
                      <v-btn v-if="editingSections.support" icon color="error" variant="tonal" size="x-small" @click="removeDetail(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields">
                    <v-text-field v-model="draft.supportSection.details[index]" label="Contact detail" :disabled="!editingSections.support" hide-details density="compact" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

        </div>
    </v-fade-transition>
      </main>
    </div>

    <AdminConfirmDialog v-model="confirmOpen" :title="confirmData.title" :body="confirmData.body" @confirm="confirmData.onConfirm()" />
  </v-app>
</template>

<style scoped>
.volunteer-admin {
  min-height: 100vh;
  background: var(--admin-bg);
  color: var(--admin-text);
  transition: padding-left 0.25s ease;
}
.admin-layout { min-height: 100vh; }
.manager-main { min-height: 100vh; padding: 1.5rem 2rem 2.5rem; }
.manager-hero {
  display: flex; align-items: center; justify-content: space-between; gap: 1.25rem;
  padding: 1rem 1.5rem; border: 1px solid var(--admin-theme-border); border-radius: 8px;
  background: var(--admin-theme-surface); box-shadow: var(--admin-theme-shadow);
}
.manager-hero h1 { margin: 0; color: var(--admin-theme-contrast); font-size: 1.32rem; line-height: 1.2; }
.manager-title { display: grid; gap: 0.32rem; }
.manager-meta { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.2rem; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.card-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
.content-grid { display: grid; gap: 1.1rem; margin-top: 1rem; }
.panel-body { padding: 1.5rem; }
.image-editor-grid {
  display: grid; grid-template-columns: minmax(300px, 0.72fr) minmax(360px, 1.28fr);
  gap: 1.25rem; padding: 1.5rem;
}
.image-preview {
  overflow: hidden; border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 34%, var(--admin-theme-border));
  border-radius: 7px; background: var(--admin-theme-surface);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 8%, transparent), 0 12px 24px rgba(15, 95, 73, 0.11);
}
.form-stack, .cards-list { display: grid; gap: 0.85rem; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.6rem 0.85rem; }
.form-grid .field-wide { grid-column: 1 / -1; }
.image-upload-panel { display: grid; gap: 0.75rem; align-content: start; }
.cards-list { gap: 0.95rem; }
.card-editor {
  border: 1px solid var(--admin-theme-border); border-radius: 8px;
  background: var(--admin-theme-surface); overflow: hidden;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.card-editor:hover { border-color: color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border)); box-shadow: 0 4px 14px rgba(15, 95, 73, 0.08); }
.card-editor-header {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 32%, var(--admin-theme-surface));
  padding: 0.75rem 1.5rem;
}
.card-heading { display: flex; align-items: center; gap: 0.7rem; min-width: 0; }
.card-heading h3, .card-heading p { margin: 0; }
.card-heading h3 { color: var(--admin-theme-contrast); font-size: 0.94rem; font-weight: 900; }
.card-heading p { color: var(--admin-theme-muted); font-size: 0.76rem; font-weight: 700; }
.card-number {
  display: grid; width: 2rem; height: 2rem; place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  border-radius: 6px; background: var(--admin-theme-surface); color: var(--admin-theme-primary-deep);
  font-size: 0.74rem; font-weight: 900; flex-shrink: 0;
}
.card-editor-top { padding: 1.25rem 1.5rem 0; }
.card-image-upload { width: 200px; }
.card-preview { width: 100%; aspect-ratio: 1.35; }
.card-form-grid {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.6rem 0.85rem; padding: 1.25rem 1.5rem;
}
.card-form-grid .field-wide { grid-column: 1 / -1; }
.details-list { display: grid; gap: 0.6rem; }
.detail-row { display: flex; align-items: center; gap: 0.6rem; }
.detail-index {
  display: grid; width: 1.6rem; height: 1.6rem; place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 20%, var(--admin-theme-border));
  border-radius: 5px; background: var(--admin-theme-surface); color: var(--admin-theme-primary-deep);
  font-size: 0.68rem; font-weight: 900; flex-shrink: 0;
}
.detail-field { flex: 1; min-width: 0; }

@media (min-width: 900px) { .volunteer-admin.sidebar-open { padding-left: 260px; } }
@media (max-width: 900px) {
  .manager-main { padding: 1rem; padding-top: calc(60px + 1rem); }
  .manager-hero, .card-editor-header { align-items: stretch; flex-direction: column; }
  .hero-actions { width: 100%; }
  .image-editor-grid, .form-grid, .card-form-grid { grid-template-columns: 1fr; }
  .card-image-upload { width: 100%; }
}
</style>
