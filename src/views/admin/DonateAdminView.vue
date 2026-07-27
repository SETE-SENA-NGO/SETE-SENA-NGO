<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
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
import { useAdminTheme } from '@/composables/useAdminTheme'
import { normalizeMediaUrl } from '@/lib/media'
import { useContentStore } from '@/stores/content.store'
import { useUiStore } from '@/stores/ui.store'
import type { PageContent } from '@/types/content'

interface GiftUse {
  label: string
  title: string
  image: string
  summary: string
  detail: string
}

interface TrustNote {
  title: string
  body: string
}

type DonatePageContent = {
  giftSection: {
    eyebrow: string
    heading: string
  }
  giftUses: GiftUse[]
  trustSection: {
    eyebrow: string
    heading: string
    intro: string
  }
  trustNotes: TrustNote[]
  cta: {
    eyebrow: string
    heading: string
    quote: string
    primaryLabel: string
    primaryLink: string
    secondaryLabel: string
    secondaryLink: string
    imageSmall: string
    imageLarge: string
  }
}

const PAGE_SLUG = 'get-involved-donate'
const MAX_GIFT_CARDS = 10
const MAX_TRUST_NOTES = 8

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const fallbackContent: DonatePageContent = {
  giftSection: {
    eyebrow: 'Gift use',
    heading: 'Small items. Real field value.',
  },
  giftUses: [
    { label: 'Education', title: 'School essentials', image: '/images/programs/education-hero.jpg', summary: 'Bikes, uniforms, bags and notebooks.', detail: 'The report names scholarships with bikes, uniforms, bags, shoes, notebooks and pens.' },
    { label: 'WASH', title: 'Clean water points', image: '/images/programs/hero-1.jpg', summary: 'Filters and handwashing spaces.', detail: 'Support can help schools keep safe water and handwashing practical for children.' },
    { label: 'Learning', title: 'Books for monastery schools', image: '/images/programs/hero-4.jpg', summary: 'Dharma and secular textbooks.', detail: 'The report records Dharma, Buddhist and secular books for Buddhist primary schools.' },
    { label: 'Livelihoods', title: 'Home garden inputs', image: '/images/programs/livelihood-hero3.jpg', summary: 'Seeds, farming practice and family food.', detail: 'Agriculture inputs help families apply vegetable, animal, rice and fish production training.' },
  ],
  trustSection: {
    eyebrow: 'Stewardship',
    heading: 'Clear handling matters.',
    intro: 'Practical giving needs careful records, written guidance and clear reporting back to the work it supports.',
  },
  trustNotes: [
    { title: 'Finance team', body: 'Santi Sena keeps financial information prepared, maintained and available for reporting.' },
    { title: 'Written policies', body: 'Finance, anti-corruption, conflict of interest and grievance policies guide the work.' },
    { title: 'Field use', body: 'Giving is directed into practical materials, learning support and community follow-up.' },
  ],
  cta: {
    eyebrow: 'Ready to give',
    heading: 'Support the next practical need.',
    quote: 'The strongest giving is simple, specific and steady. Your donation helps Santi Sena turn urgent local needs into practical materials communities can use.',
    primaryLabel: 'Donate by QR',
    primaryLink: '/qr-donate',
    secondaryLabel: 'Contact team',
    secondaryLink: '/contact',
    imageSmall: '/images/programs/hero-2.jpg',
    imageLarge: '/images/programs/livelihood-hero3.jpg',
  },
}

const contentStore = useContentStore()
const ui = useUiStore()
const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

useAdminTheme()

const pageRow = ref<PageContent | null>(null)
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')

const draft = reactive<DonatePageContent>(cloneContent(fallbackContent))

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
    key: 'gift',
    getSnapshot: () => ({
      ...draft.giftSection,
      giftUses: draft.giftUses.map((g) => ({ ...g })),
    }),
    applySnapshot: (value) => {
      draft.giftSection.eyebrow = value.eyebrow
      draft.giftSection.heading = value.heading
      draft.giftUses = value.giftUses
    },
  },
  {
    key: 'trust',
    getSnapshot: () => ({
      ...draft.trustSection,
      trustNotes: draft.trustNotes.map((t) => ({ ...t })),
    }),
    applySnapshot: (value) => {
      draft.trustSection = value
      draft.trustNotes = value.trustNotes
    },
  },
  {
    key: 'cta',
    getSnapshot: () => ({ ...draft.cta }),
    applySnapshot: (value) => {
      draft.cta = value
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

const ctaPreviewSmall = computed(() =>
  draft.cta.imageSmall.trim() ? draft.cta.imageSmall : fallbackContent.cta.imageSmall,
)
const ctaPreviewLarge = computed(() =>
  draft.cta.imageLarge.trim() ? draft.cta.imageLarge : fallbackContent.cta.imageLarge,
)
const canAddGift = computed(() => draft.giftUses.length < MAX_GIFT_CARDS)
const canAddTrustNote = computed(() => draft.trustNotes.length < MAX_TRUST_NOTES)

const sections = [
  { id: 'donate-gift', label: 'Gift Use', icon: 'mdi-gift' },
  { id: 'donate-trust', label: 'Stewardship', icon: 'mdi-shield-check' },
  { id: 'donate-cta', label: 'CTA', icon: 'mdi-flag' },
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

async function loadPage() {
  resetEditingState()
  loading.value = true
  loadError.value = ''

  try {
    const page = await contentStore.fetchBySlug(PAGE_SLUG, 'en')
    pageRow.value = page
    const parsed = parseCmsBody(page?.body ?? '')
    if (parsed) {
      replaceDraft(mergeContent(fallbackContent, parsed))
    }
    updateSnapshot()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load Donate content.'
    ui.addToast(loadError.value, 'error')
  } finally {
    loading.value = false
    setupSectionWatch()
  }
}

function replaceDraft(content: DonatePageContent) {
  draft.giftSection = { ...content.giftSection }
  draft.giftUses = content.giftUses.map((g) => ({ ...g }))
  draft.trustSection = { ...content.trustSection }
  draft.trustNotes = content.trustNotes.map((t) => ({ ...t }))
  draft.cta = { ...content.cta }
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
      title: 'Donate',
      body: JSON.stringify(content, null, 2),
      locale: 'en',
      route_path: '/get-involved/donate',
      nav_group: 'Get Involved',
      template: 'standard',
      status: 'published',
      updated_at: pageRow.value?.updated_at ?? '',
    })

    pageRow.value = saved
    replaceDraft(content)
    updateSnapshot()
    ui.addToast('Donate page saved.', 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save Donate content.', 'error')
  } finally {
    saving.value = false
  }
}

function addGiftUse() {
  if (!canAddGift.value) return
  draft.giftUses.push({ label: '', title: '', image: '', summary: '', detail: '' })
}

function addTrustNote() {
  if (!canAddTrustNote.value) return
  draft.trustNotes.push({ title: '', body: '' })
}

function removeItem<T extends { title?: string; name?: string }>(
  items: T[],
  index: number,
  label: string,
) {
  const item = items[index]
  if (!item) return
  const itemTitle = item.title || item.name || 'this item'
  confirmDialog(`Remove ${label}?`, `Remove "${itemTitle}" from the public Donate page?`, () => {
    items.splice(index, 1)
    ui.addToast(`${label} removed.`, 'warning')
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

function resetToDefaults() {
  confirmDialog(
    'Reset Donate content?',
    'Restore all sections, cards and CTAs to default values?',
    () => {
      replaceDraft(cloneContent(fallbackContent))
      ui.addToast('Default Donate draft restored.', 'info')
    },
  )
}

function prepareForSave(content: DonatePageContent): DonatePageContent {
  return {
    giftSection: { ...content.giftSection },
    giftUses: content.giftUses
      .filter((g) => g.title.trim() || g.label.trim())
      .map((g) => ({
        ...g,
        image: normalizeMediaUrl(g.image),
      })),
    trustSection: { ...content.trustSection },
    trustNotes: content.trustNotes
      .filter((t) => t.title.trim() || t.body.trim())
      .map((t) => ({ ...t })),
    cta: {
      ...content.cta,
      imageSmall: normalizeMediaUrl(content.cta.imageSmall),
      imageLarge: normalizeMediaUrl(content.cta.imageLarge),
    },
  }
}

function validateDraft() {
  if (!draft.giftUses.length) return 'Add at least one gift use card.'
  return ''
}

function parseCmsBody(body: string): Partial<DonatePageContent> | null {
  if (!body.trim()) return null
  try {
    const parsed = JSON.parse(body) as unknown
    if (isRecord(parsed) && parsed.kind === 'santi-sena-donate-content') {
      const result: Partial<DonatePageContent> = {}
      if (isRecord(parsed.giftSection)) result.giftSection = parsed.giftSection as DonatePageContent['giftSection']
      if (Array.isArray(parsed.giftUses)) result.giftUses = parsed.giftUses as GiftUse[]
      if (isRecord(parsed.trustSection)) result.trustSection = parsed.trustSection as DonatePageContent['trustSection']
      if (Array.isArray(parsed.trustNotes)) result.trustNotes = parsed.trustNotes as TrustNote[]
      if (isRecord(parsed.cta)) result.cta = parsed.cta as DonatePageContent['cta']
      return result
    }
    return isRecord(parsed) ? (parsed as Partial<DonatePageContent>) : null
  } catch {
    return null
  }
}

function mergeContent(
  base: DonatePageContent,
  override: Partial<DonatePageContent> | null,
): DonatePageContent {
  if (!override) return cloneContent(base)
  return {
    giftSection: mergeObject(base.giftSection, override.giftSection),
    giftUses: Array.isArray(override.giftUses) && override.giftUses.length
      ? override.giftUses.map((g) => ({ ...g }))
      : base.giftUses.map((g) => ({ ...g })),
    trustSection: mergeObject(base.trustSection, override.trustSection),
    trustNotes: Array.isArray(override.trustNotes) && override.trustNotes.length
      ? override.trustNotes.map((t) => ({ ...t }))
      : base.trustNotes.map((t) => ({ ...t })),
    cta: mergeObject(base.cta, override.cta),
  }
}

function mergeObject<T>(base: T, override: unknown): T {
  return isRecord(override) ? { ...base, ...override } as T : { ...base }
}

function cloneContent(content: DonatePageContent): DonatePageContent {
  return {
    giftSection: { ...content.giftSection },
    giftUses: content.giftUses.map((g) => ({ ...g })),
    trustSection: { ...content.trustSection },
    trustNotes: content.trustNotes.map((t) => ({ ...t })),
    cta: { ...content.cta },
  }
}
</script>

<template>
  <v-app :class="['donate-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Get Involved / Donate page</h1>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/get-involved/donate" target="_blank">
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
            <span class="mt-4 font-weight-bold">Loading Donate content...</span>
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
            aria-label="Donate page sections"
            save-label="Save Change"
            @navigate="scrollToSection"
            @save="savePage"
          />

          <!-- ── GIFT USE ── -->
          <AdminEditorPanel
            :id="sections[0].id"
            kicker="Gift use"
            heading="Small items. Real field value."
            :editing="!!editingSections.gift"
            :collapsed="!!collapsedSections.gift"
            @toggle-edit="toggleEdit('gift')"
            @cancel="cancelEdit('gift')"
            @toggle-collapse="toggleCollapse('gift')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddGift" @click="addGiftUse">
                  <v-icon start>mdi-plus</v-icon>
                  Add card
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="panel-body form-grid">
              <v-text-field v-model="draft.giftSection.eyebrow" label="Section eyebrow" :disabled="!editingSections.gift" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.giftSection.heading" label="Section heading" :disabled="!editingSections.gift" hide-details density="comfortable" variant="outlined" />
            </div>

            <v-divider class="mx-4" />
            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="cards-list">
                <article v-for="(item, index) in draft.giftUses" :key="'gift-' + index" class="card-editor">
                  <header class="card-editor-header">
                    <div class="card-heading">
                      <span class="card-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <div>
                        <h3>{{ item.title || 'Untitled' }}</h3>
                        <p>{{ item.label || 'No label' }}</p>
                      </div>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.gift || index === 0" @click="moveItem(draft.giftUses, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="small" :disabled="!editingSections.gift || index === draft.giftUses.length - 1" @click="moveItem(draft.giftUses, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.gift" icon color="error" variant="tonal" size="small" @click="removeItem(draft.giftUses, index, 'gift use card')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>

                  <div class="card-editor-top">
                    <div class="image-upload-panel card-image-upload">
                      <v-img :src="item.image || fallbackContent.giftUses[0]?.image || ''" aspect-ratio="1.35" cover class="image-preview card-preview" />
                      <AdminUploadButton
                        :disabled="!editingSections.gift"
                        :description="`Donate gift-${index} image`"
                        @update:model-value="(url) => (item.image = url)"
                      />
                    </div>
                  </div>

                  <div class="card-form-grid">
                    <v-text-field v-model="item.label" label="Label" :disabled="!editingSections.gift" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="item.title" label="Title" :disabled="!editingSections.gift" hide-details density="comfortable" variant="outlined" />
                    <v-textarea v-model="item.summary" label="Summary (shown on card)" rows="2" :disabled="!editingSections.gift" hide-details density="comfortable" variant="outlined" class="field-wide" />
                    <v-textarea v-model="item.detail" label="Detail" rows="2" :disabled="!editingSections.gift" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ── STEWARDSHIP ── -->
          <AdminEditorPanel
            :id="sections[1].id"
            kicker="Stewardship"
            heading="Clear handling matters."
            :editing="!!editingSections.trust"
            :collapsed="!!collapsedSections.trust"
            @toggle-edit="toggleEdit('trust')"
            @cancel="cancelEdit('trust')"
            @toggle-collapse="toggleCollapse('trust')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddTrustNote" @click="addTrustNote">
                  <v-icon start>mdi-plus</v-icon>
                  Add note
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="panel-body form-grid">
              <v-text-field v-model="draft.trustSection.eyebrow" label="Section eyebrow" :disabled="!editingSections.trust" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.trustSection.heading" label="Section heading" :disabled="!editingSections.trust" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.trustSection.intro" label="Intro paragraph" rows="2" :disabled="!editingSections.trust" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>

            <v-divider class="mx-4" />
            <div class="pa-4">
              <v-slide-y-transition group tag="div" class="items-list">
                <article v-for="(note, index) in draft.trustNotes" :key="'trust-' + index" class="item-card">
                  <header class="item-header">
                    <div class="item-heading">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h4>{{ note.title || 'New note' }}</h4>
                    </div>
                    <div class="card-actions">
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.trust || index === 0" @click="moveItem(draft.trustNotes, index, -1)">
                        <v-icon>mdi-chevron-up</v-icon>
                      </v-btn>
                      <v-btn icon variant="outlined" size="x-small" :disabled="!editingSections.trust || index === draft.trustNotes.length - 1" @click="moveItem(draft.trustNotes, index, 1)">
                        <v-icon>mdi-chevron-down</v-icon>
                      </v-btn>
                      <v-btn v-if="editingSections.trust" icon color="error" variant="tonal" size="x-small" @click="removeItem(draft.trustNotes, index, 'stewardship note')">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </header>
                  <div class="item-fields">
                    <v-text-field v-model="note.title" label="Title" :disabled="!editingSections.trust" hide-details density="compact" variant="outlined" />
                    <v-textarea v-model="note.body" label="Body" rows="2" :disabled="!editingSections.trust" hide-details density="compact" variant="outlined" class="field-wide" />
                  </div>
                </article>
              </v-slide-y-transition>
            </div>
          </AdminEditorPanel>

          <!-- ── CTA ── -->
          <AdminEditorPanel
            :id="sections[2].id"
            kicker="Ready to give"
            heading="Closing call to action"
            :editing="!!editingSections.cta"
            :collapsed="!!collapsedSections.cta"
            @toggle-edit="toggleEdit('cta')"
            @cancel="cancelEdit('cta')"
            @toggle-collapse="toggleCollapse('cta')"
          >
            <div class="image-editor-grid">
              <div class="image-upload-panel">
                <v-img :src="ctaPreviewSmall" aspect-ratio="1.6" cover class="image-preview hero-preview" />
                <AdminUploadButton
                  :disabled="!editingSections.cta"
                  description="Donate CTA small image"
                  @update:model-value="(url) => (draft.cta.imageSmall = url)"
                />
                <v-img :src="ctaPreviewLarge" aspect-ratio="1.6" cover class="image-preview hero-preview" />
                <AdminUploadButton
                  :disabled="!editingSections.cta"
                  description="Donate CTA large image"
                  @update:model-value="(url) => (draft.cta.imageLarge = url)"
                />
              </div>

              <div class="form-stack">
                <div class="form-grid">
                  <v-text-field v-model="draft.cta.eyebrow" label="Eyebrow" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="draft.cta.heading" label="Heading" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
                  <v-textarea v-model="draft.cta.quote" label="Quote paragraph" rows="3" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-text-field v-model="draft.cta.primaryLabel" label="Primary button label" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="draft.cta.secondaryLabel" label="Secondary button label" :disabled="!editingSections.cta" hide-details density="comfortable" variant="outlined" />
                </div>
              </div>
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
.donate-admin {
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

/* ── Image upload panel ── */
.image-upload-panel {
  display: grid;
  gap: 0.75rem;
  align-content: start;
}

.cards-list {
  gap: 0.95rem;
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

/* ── Items list (trust notes) ── */
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
  .donate-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
    padding-top: calc(60px + 1rem);
  }

  .manager-hero,
  .card-editor-header,
  .item-header {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-actions {
    width: 100%;
  }

  .image-editor-grid,
  .form-grid,
  .card-form-grid,
  .item-fields {
    grid-template-columns: 1fr;
  }

  .card-image-upload {
    width: 100%;
  }
}
</style>
