<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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
import {
  cloneContactContent,
  contactPageSlug,
  fallbackContactContent,
  mergeContactContent,
  parseContactCmsBody,
  type ContactOffice,
  type ContactPageContent,
} from '@/lib/contactContent'
import { normalizeMediaUrl } from '@/lib/media'
import { useContentStore } from '@/stores/content.store'
import { useUiStore } from '@/stores/ui.store'
import type { PageContent } from '@/types/content'

const MAX_OFFICES = 8

const contentStore = useContentStore()
const ui = useUiStore()
const { locale } = useI18n()

const pageRow = ref<PageContent | null>(null)
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const savedAt = ref('')

const draft = reactive<ContactPageContent>(cloneContactContent(fallbackContactContent))

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
    key: 'main',
    getSnapshot: () => ({
      eyebrow: draft.headquarters.eyebrow,
      type: draft.headquarters.type,
      title: draft.headquarters.title,
      intro: draft.headquarters.intro,
      image: draft.headquarters.image,
      imageAlt: draft.headquarters.imageAlt,
    }),
    applySnapshot: (value) => {
      draft.headquarters.eyebrow = value.eyebrow
      draft.headquarters.type = value.type
      draft.headquarters.title = value.title
      draft.headquarters.intro = value.intro
      draft.headquarters.image = value.image
      draft.headquarters.imageAlt = value.imageAlt
    },
  },
  {
    key: 'headOffice',
    getSnapshot: () => ({
      name: draft.headquarters.name,
      hours: draft.headquarters.hours,
      email: draft.headquarters.email,
      phone: draft.headquarters.phone,
      address: draft.headquarters.address,
    }),
    applySnapshot: (value) => {
      draft.headquarters.name = value.name
      draft.headquarters.hours = value.hours
      draft.headquarters.email = value.email
      draft.headquarters.phone = value.phone
      draft.headquarters.address = value.address
    },
  },
  {
    key: 'offices',
    getSnapshot: () => ({
      officesIntro: { ...draft.officesIntro },
      offices: draft.offices.map((office) => ({ ...office })),
    }),
    applySnapshot: (value) => {
      draft.officesIntro = value.officesIntro
      draft.offices = value.offices
    },
  },
  {
    key: 'telegram',
    getSnapshot: () => ({ ...draft.telegram }),
    applySnapshot: (value) => {
      draft.telegram = value
    },
  },
])

const originalSnapshot = ref('')

const hasChanges = computed(() => {
  const current = JSON.stringify(cloneContactContent(draft))
  return current !== originalSnapshot.value
})

function updateSnapshot() {
  originalSnapshot.value = JSON.stringify(cloneContactContent(draft))
}

const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

const activeLocale = computed<SupportedLocale>(() =>
  locale.value === 'kh' ? 'kh' : 'en',
)
const activeLocaleName = computed(() =>
  activeLocale.value === 'kh' ? 'Khmer' : 'English',
)
const canAddOffice = computed(() => draft.offices.length < MAX_OFFICES)
const headquartersPreview = computed(() =>
  resolveImageUrl(draft.headquarters.image, fallbackContactContent.headquarters.image),
)
const telegramPreview = computed(() =>
  resolveImageUrl(draft.telegram.qrImage, fallbackContactContent.telegram.qrImage),
)

const sections = [
  { id: 'contact-main', label: 'Main', icon: 'mdi-image-outline' },
  { id: 'contact-head-office', label: 'Head office', icon: 'mdi-phone' },
  { id: 'contact-offices', label: 'Offices', icon: 'mdi-map-marker-multiple' },
  { id: 'contact-telegram', label: 'Telegram', icon: 'mdi-message-text' },
] as const

const { activeSection, scrollToSection, updateActiveSectionFromScroll } = useScrollSpyNav(sections)

useUnsavedChangesGuard(hasChanges)

onMounted(() => {
  void loadPage()
})

watch(activeLocale, () => {
  void loadPage()
})

async function loadPage() {
  resetEditingState()
  loading.value = true
  loadError.value = ''

  try {
    const page = await contentStore.fetchBySlug(contactPageSlug, activeLocale.value)
    pageRow.value = page
    replaceDraft(mergeContactContent(fallbackContactContent, parseContactCmsBody(page?.body ?? '')))
    savedAt.value = page?.updated_at ?? ''
    updateSnapshot()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load Contact content.'
    ui.addToast(loadError.value, 'error')
  } finally {
    loading.value = false
    setupSectionWatch()
  }
}

function replaceDraft(content: ContactPageContent) {
  draft.headquarters = { ...content.headquarters }
  draft.officesIntro = { ...content.officesIntro }
  draft.offices = content.offices.map((office) => ({ ...office }))
  draft.form = { ...content.form }
  draft.telegram = { ...content.telegram }
  draft.visit = {
    ...content.visit,
    notes: [...content.visit.notes],
    primaryCta: { ...content.visit.primaryCta },
    secondaryCta: { ...content.visit.secondaryCta },
  }
  draft.labels = { ...content.labels }
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
      slug: contactPageSlug,
      title: 'Contact',
      body: JSON.stringify(content, null, 2),
      locale: activeLocale.value,
      route_path: '/contact',
      nav_group: 'Contact',
      template: 'contact',
      status: 'published',
      updated_at: pageRow.value?.updated_at ?? '',
    })

    pageRow.value = saved
    replaceDraft(content)
    savedAt.value = saved.updated_at
    updateSnapshot()
    ui.addToast(`Contact ${activeLocaleName.value} content saved.`, 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save Contact content.', 'error')
  } finally {
    saving.value = false
  }
}

function addOffice() {
  if (!canAddOffice.value) return

  const nextNumber = draft.offices.length + 1
  draft.offices.push({
    id: `office-${nextNumber}`,
    tab: 'New office',
    title: 'New Contact Office',
    type: 'Field office',
    provinceName: 'Cambodia',
    address: 'Office address',
    phone: '+855',
    email: 'info@santisena.org',
    contact: 'Describe who should contact this office.',
    mapLabel: 'Office location',
    mapImage: '',
    pinLeft: '50%',
    pinTop: '50%',
    countryPinLeft: '50%',
    countryPinTop: '50%',
  })
}

function removeOffice(index: number) {
  const office = draft.offices[index]
  if (!office) return

  confirmDialog(
    'Remove office?',
    `Remove "${office.title || 'this office'}" from the public Contact page?`,
    () => {
      draft.offices.splice(index, 1)
      ui.addToast('Office removed.', 'warning')
    },
  )
}

function moveOffice(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= draft.offices.length) return

  const current = draft.offices[index]
  const next = draft.offices[target]
  if (!current || !next) return

  draft.offices[index] = next
  draft.offices[target] = current
}

function resetToDefaults() {
  confirmDialog(
    'Reset Contact content?',
    'Restore the default contact details, office info, Telegram QR and visitor guide?',
    () => {
      replaceDraft(cloneContactContent(fallbackContactContent))
      ui.addToast('Default Contact draft restored.', 'info')
    },
  )
}

function prepareForSave(content: ContactPageContent): ContactPageContent {
  return {
    headquarters: {
      ...content.headquarters,
      image: normalizeMediaUrl(content.headquarters.image),
    },
    officesIntro: { ...content.officesIntro },
    offices: content.offices.map(normalizeOfficeForSave),
    form: {
      ...content.form,
      logoImage: normalizeMediaUrl(content.form.logoImage),
      messageMaxLength: Number(content.form.messageMaxLength) || fallbackContactContent.form.messageMaxLength,
    },
    telegram: {
      ...content.telegram,
      url: normalizeTelegramUrl(content.telegram.url),
      qrImage: normalizeMediaUrl(content.telegram.qrImage),
    },
    visit: {
      ...content.visit,
      notes: content.visit.notes.map((note) => note.trim()).filter(Boolean),
      primaryCta: { ...content.visit.primaryCta },
      secondaryCta: { ...content.visit.secondaryCta },
      backgroundImage: normalizeMediaUrl(content.visit.backgroundImage),
    },
    labels: { ...content.labels },
  }
}

function normalizeOfficeForSave(office: ContactOffice, index: number): ContactOffice {
  return {
    ...office,
    id: office.id.trim() || `office-${index + 1}`,
    mapImage: normalizeMediaUrl(office.mapImage),
  }
}

function validateDraft() {
  if (!draft.headquarters.title.trim()) return 'Main contact heading is required.'
  if (!draft.headquarters.image.trim()) return 'Main contact image is required.'
  if (!draft.headquarters.email.trim()) return 'Head office email is required.'
  if (!draft.headquarters.phone.trim()) return 'Head office phone is required.'
  if (!draft.offices.length) return 'Add at least one office.'

  const invalidOfficeIndex = draft.offices.findIndex(
    (office) => !office.tab.trim() || !office.title.trim() || !office.email.trim() || !office.phone.trim(),
  )
  if (invalidOfficeIndex >= 0) {
    return `Office ${invalidOfficeIndex + 1} needs a tab, title, email, and phone.`
  }

  return ''
}

function resolveImageUrl(url: string, fallback: string) {
  return url.trim() ? url : fallback
}

/**
 * Accepts either a full Telegram URL or a plain username and returns a clean
 * `https://t.me/<username>` link. Strips a leading `@`, trims whitespace, and
 * lower-cases the username. Empty input is preserved so the field can be cleared.
 */
function normalizeTelegramUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  // Already a Telegram URL — keep it, but normalise scheme/host and strip `@` from the path.
  // The trailing group must contain at least one non-slash character so `https://t.me/`
  // matches the bare-host branch below instead of being parsed as a handle.
  const urlMatch = trimmed.match(/^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me)\/([^/?#\s]+.*)?$/i)
  if (urlMatch) {
    const rawHandle = (urlMatch[1] ?? '').replace(/^@/, '').split(/[/?#]/)[0] ?? ''
    if (!rawHandle) return 'https://t.me/'
    return `https://t.me/${rawHandle}`
  }

  // Otherwise treat the input as a bare username. Strip leading `@`, drop any
  // path/query/fragment, and trim.
  const handle = trimmed
    .replace(/^@+/, '')
    .split(/[/?#]/)[0]
    ?.trim() ?? ''

  if (!handle) return 'https://t.me/'
  return `https://t.me/${handle}`
}
</script>

<template>
  <v-app :class="['contact-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Manage contact page</h1>
            <div class="manager-meta">
              <v-chip size="small" variant="tonal" color="primary">{{ activeLocaleName }} content</v-chip>
              <v-chip size="small" variant="tonal" color="primary">{{ draft.offices.length }} offices</v-chip>
              <v-chip v-if="savedAt" size="small" variant="tonal" color="success">Saved</v-chip>
            </div>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/contact" target="_blank">
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
            <span class="mt-4 font-weight-bold">Loading Contact content...</span>
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
            aria-label="Contact page sections"
            @navigate="scrollToSection"
            @save="savePage"
          />

          <!-- ── MAIN ── -->
          <AdminEditorPanel
            :id="sections[0].id"
            kicker="Main section"
            heading="Photo and page introduction"
            :editing="!!editingSections.main"
            :collapsed="!!collapsedSections.main"
            @toggle-edit="toggleEdit('main')"
            @cancel="cancelEdit('main')"
            @toggle-collapse="toggleCollapse('main')"
          >
            <div class="image-editor-grid">
              <div class="image-upload-panel">
                <v-img :src="headquartersPreview" aspect-ratio="1.6" cover class="image-preview hero-preview" />
                <AdminUploadButton
                  :disabled="!editingSections.main"
                  description="Contact main photo"
                  @update:model-value="(url) => (draft.headquarters.image = url)"
                />
              </div>

              <div class="form-stack">
                <div class="form-grid">
                  <v-text-field v-model="draft.headquarters.eyebrow" label="Small label" :disabled="!editingSections.main" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="draft.headquarters.type" label="Office type" :disabled="!editingSections.main" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="draft.headquarters.title" label="Section heading" :disabled="!editingSections.main" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-textarea v-model="draft.headquarters.intro" label="Intro text" rows="3" :disabled="!editingSections.main" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-text-field v-model="draft.headquarters.imageAlt" label="Photo alt text" :disabled="!editingSections.main" hide-details density="comfortable" variant="outlined" class="field-wide" />
                </div>
              </div>
            </div>
          </AdminEditorPanel>

          <!-- ── HEAD OFFICE DETAILS ── -->
          <AdminEditorPanel
            :id="sections[1].id"
            kicker="Head office details"
            heading="Phone, email and address"
            :editing="!!editingSections.headOffice"
            :collapsed="!!collapsedSections.headOffice"
            @toggle-edit="toggleEdit('headOffice')"
            @cancel="cancelEdit('headOffice')"
            @toggle-collapse="toggleCollapse('headOffice')"
          >
            <div class="panel-body form-grid">
              <v-text-field v-model="draft.headquarters.name" label="Display name" :disabled="!editingSections.headOffice" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.headquarters.hours" label="Office hours" :disabled="!editingSections.headOffice" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.headquarters.email" label="Email" type="email" :disabled="!editingSections.headOffice" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.headquarters.phone" label="Phone" type="tel" :disabled="!editingSections.headOffice" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.headquarters.address" label="Address" rows="2" :disabled="!editingSections.headOffice" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>
          </AdminEditorPanel>

          <!-- ── OFFICES ── -->
          <AdminEditorPanel
            :id="sections[2].id"
            kicker="Office map section"
            heading="Office tabs and contact cards"
            :editing="!!editingSections.offices"
            :collapsed="!!collapsedSections.offices"
            @toggle-edit="toggleEdit('offices')"
            @cancel="cancelEdit('offices')"
            @toggle-collapse="toggleCollapse('offices')"
          >
            <template #actions="{ editing }">
              <v-fade-transition>
                <v-btn v-if="editing" color="accent" variant="flat" size="small" :disabled="!canAddOffice" @click="addOffice">
                  <v-icon start>mdi-plus</v-icon>
                  Add office
                </v-btn>
              </v-fade-transition>
            </template>

            <div class="panel-body intro-fields">
              <v-text-field v-model="draft.officesIntro.eyebrow" label="Small label" :disabled="!editingSections.offices" hide-details density="comfortable" variant="outlined" />
              <v-text-field v-model="draft.officesIntro.title" label="Section heading" :disabled="!editingSections.offices" hide-details density="comfortable" variant="outlined" />
              <v-textarea v-model="draft.officesIntro.body" label="Intro text" rows="2" :disabled="!editingSections.offices" hide-details density="comfortable" variant="outlined" class="field-wide" />
            </div>

            <v-slide-y-transition group tag="div" class="offices-list">
              <article v-for="(office, index) in draft.offices" :key="office.id" class="office-editor">
                <header class="office-editor-header">
                  <div class="office-heading">
                    <span class="office-number">{{ String(index + 1).padStart(2, '0') }}</span>
                    <div>
                      <h3>{{ office.title || 'Untitled office' }}</h3>
                      <p>{{ office.tab || 'No tab label' }} / {{ office.type || 'Office' }}</p>
                    </div>
                  </div>
                  <div class="card-actions">
                    <v-btn icon variant="outlined" size="small" :disabled="!editingSections.offices || index === 0" aria-label="Move office up" @click="moveOffice(index, -1)">
                      <v-icon>mdi-chevron-up</v-icon>
                    </v-btn>
                    <v-btn icon variant="outlined" size="small" :disabled="!editingSections.offices || index === draft.offices.length - 1" aria-label="Move office down" @click="moveOffice(index, 1)">
                      <v-icon>mdi-chevron-down</v-icon>
                    </v-btn>
                    <v-btn v-if="editingSections.offices" icon color="error" variant="tonal" size="small" aria-label="Remove office" @click="removeOffice(index)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </header>

                <div class="office-form-grid">
                  <v-text-field v-model="office.tab" label="Tab label" :disabled="!editingSections.offices" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="office.type" label="Office type" :disabled="!editingSections.offices" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="office.title" label="Office title" :disabled="!editingSections.offices" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="office.provinceName" label="Province label" :disabled="!editingSections.offices" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="office.phone" label="Phone" type="tel" :disabled="!editingSections.offices" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="office.email" label="Email" type="email" :disabled="!editingSections.offices" hide-details density="comfortable" variant="outlined" />
                  <v-textarea v-model="office.address" label="Address" rows="2" :disabled="!editingSections.offices" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-textarea v-model="office.contact" label="Contact purpose" rows="2" :disabled="!editingSections.offices" hide-details density="comfortable" variant="outlined" class="field-wide" />
                </div>
              </article>
            </v-slide-y-transition>
          </AdminEditorPanel>

          <!-- ── TELEGRAM ── -->
          <AdminEditorPanel
            :id="sections[3].id"
            kicker="Contact form"
            heading="Telegram contact"
            :editing="!!editingSections.telegram"
            :collapsed="!!collapsedSections.telegram"
            @toggle-edit="toggleEdit('telegram')"
            @cancel="cancelEdit('telegram')"
            @toggle-collapse="toggleCollapse('telegram')"
          >
            <div class="image-editor-grid">
              <div class="image-upload-panel">
                <v-img :src="telegramPreview" aspect-ratio="1" cover class="image-preview qr-preview" />
                <AdminUploadButton
                  :disabled="!editingSections.telegram"
                  description="Contact Telegram QR"
                  label="Upload QR image"
                  @update:model-value="(url) => (draft.telegram.qrImage = url)"
                />
              </div>

              <div class="form-stack">
                <div class="form-grid">
                  <v-text-field
                    v-model="draft.telegram.url"
                    label="Telegram link (URL or username)"
                    placeholder="https://t.me/"
                    hint="Just copy the username from your Telegram profile into this box."
                    persistent-hint
                    :disabled="!editingSections.telegram"
                    density="comfortable"
                    variant="outlined"
                    class="field-wide"
                    @blur="draft.telegram.url = normalizeTelegramUrl(draft.telegram.url)"
                  />
                  <v-text-field v-model="draft.telegram.openLabel" label="Button label" placeholder="Open Telegram" :disabled="!editingSections.telegram" hide-details density="comfortable" variant="outlined" />
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
.contact-admin {
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

.qr-preview {
  max-width: 280px;
}

/* ── Form layouts ── */
.form-stack {
  display: grid;
  gap: 0.85rem;
}

.form-grid,
.intro-fields,
.office-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.6rem 0.85rem;
}

.intro-fields {
  padding: 1.5rem 1.5rem 0;
}

.form-grid .field-wide,
.intro-fields .field-wide,
.office-form-grid .field-wide {
  grid-column: 1 / -1;
}

/* ── Image upload panel (preview + button) ── */
.image-upload-panel {
  display: grid;
  gap: 0.75rem;
  align-content: start;
}

.offices-list {
  display: grid;
  gap: 0.95rem;
  padding: 1.5rem;
}

/* ── Office editor ── */
.office-editor {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  overflow: hidden;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.office-editor:hover {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  box-shadow: 0 4px 14px rgba(15, 95, 73, 0.08);
}

.office-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 32%, var(--admin-theme-surface));
  padding: 0.75rem 1.5rem;
}

.office-heading {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.office-heading h3,
.office-heading p {
  margin: 0;
}

.office-heading h3 {
  color: var(--admin-theme-contrast);
  font-size: 0.94rem;
  font-weight: 900;
}

.office-heading p {
  color: var(--admin-theme-muted);
  font-size: 0.76rem;
  font-weight: 700;
}

.office-number {
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

.office-form-grid {
  padding: 1.25rem 1.5rem;
}

@media (min-width: 900px) {
  .contact-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
    padding-top: calc(60px + 1rem);
  }

  .manager-hero,
  .office-editor-header {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-actions {
    width: 100%;
  }

  .image-editor-grid,
  .form-grid,
  .intro-fields,
  .office-form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
