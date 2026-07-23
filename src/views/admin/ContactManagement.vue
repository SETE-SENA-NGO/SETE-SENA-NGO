<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-vue-next'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
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
import { imageUploadHelpText, normalizeMediaUrl } from '@/lib/media'
import { useContentStore } from '@/stores/content.store'
import { useMediaStore } from '@/stores/media.store'
import { useUiStore } from '@/stores/ui.store'
import type { PageContent } from '@/types/content'

const MAX_OFFICES = 8

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

const draft = reactive<ContactPageContent>(cloneContactContent(fallbackContactContent))

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
const visitPreview = computed(() =>
  resolveImageUrl(draft.visit.backgroundImage, fallbackContactContent.visit.backgroundImage),
)

onMounted(() => {
  void loadPage()
})

watch(activeLocale, () => {
  void loadPage()
})

async function loadPage() {
  loading.value = true
  loadError.value = ''

  try {
    const page = await contentStore.fetchBySlug(contactPageSlug, activeLocale.value)
    pageRow.value = page
    replaceDraft(mergeContactContent(fallbackContactContent, parseContactCmsBody(page?.body ?? '')))
    savedAt.value = page?.updated_at ?? ''
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load Contact content.'
    ui.addToast(loadError.value, 'error')
  } finally {
    loading.value = false
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
    ui.addToast(`Contact ${activeLocaleName.value} content saved.`, 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save Contact content.', 'error')
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
    const uploaded = await media.uploadToGoogleDrive(file, `Contact ${key} image`)
    applyUrl(uploaded.url)
    ui.addToast('Image uploaded.', 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not upload image.', 'error')
  } finally {
    uploadingKey.value = ''
    input.value = ''
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

  ui.openModal(
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

function addVisitNote() {
  draft.visit.notes.push('Add a visitor note.')
}

function removeVisitNote(index: number) {
  draft.visit.notes.splice(index, 1)
}

function resetToDefaults() {
  ui.openModal(
    'Reset Contact content?',
    'Restore the default contact details, offices, images and form copy?',
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
      qrImage: normalizeMediaUrl(content.telegram.qrImage),
    },
    visit: {
      ...content.visit,
      notes: content.visit.notes.map((note) => note.trim()).filter(Boolean),
      primaryCta: { ...content.visit.primaryCta },
      secondaryCta: { ...content.visit.secondaryCta },
      backgroundImage: normalizeMediaUrl(content.visit.backgroundImage),
    },
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

  if (!draft.form.title.trim()) return 'Contact form heading is required.'
  if (!draft.telegram.qrImage.trim()) return 'Telegram QR image is required.'
  if (!draft.telegram.url.trim()) return 'Telegram URL is required.'
  if (!draft.visit.notes.length) return 'Add at least one visit note.'

  return ''
}

function resolveImageUrl(url: string, fallback: string) {
  return url.trim() ? url : fallback
}
</script>

<template>
  <div :class="['contact-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <p class="eyebrow">Contact</p>
            <h1>Manage contact page</h1>
            <div class="manager-meta" aria-label="Editable contact summary">
              <span>{{ activeLocaleName }} content</span>
              <span>{{ draft.offices.length }} offices</span>
              <span v-if="savedAt">Saved</span>
            </div>
          </div>
          <div class="hero-actions">
            <RouterLink class="btn btn-secondary" to="/contact">
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

        <div v-if="loading" class="state-card">Loading Contact content...</div>
        <div v-else-if="loadError" class="state-card state-card-error">
          <span>{{ loadError }}</span>
          <button type="button" class="btn btn-secondary" @click="loadPage">
            Try again
          </button>
        </div>

        <div v-else class="content-grid">
          <section class="editor-panel" aria-labelledby="main-contact-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Main section</p>
                <h2 id="main-contact-heading">Photo and page introduction</h2>
              </div>
              <ImageIcon :size="20" aria-hidden="true" />
            </div>

            <div class="image-editor-grid">
              <figure class="image-preview hero-preview">
                <img :src="headquartersPreview" alt="" />
              </figure>

              <div class="form-stack">
                <div class="form-grid">
                  <label class="field">
                    <span>Small label</span>
                    <input v-model="draft.headquarters.eyebrow" type="text" />
                  </label>
                  <label class="field">
                    <span>Office type</span>
                    <input v-model="draft.headquarters.type" type="text" />
                  </label>
                  <label class="field wide">
                    <span>Section heading</span>
                    <input v-model="draft.headquarters.title" type="text" />
                  </label>
                  <label class="field wide">
                    <span>Intro text</span>
                    <textarea v-model="draft.headquarters.intro" rows="3"></textarea>
                  </label>
                  <label class="field wide">
                    <span>Main photo URL</span>
                    <input v-model="draft.headquarters.image" type="url" :placeholder="imageHint" />
                  </label>
                  <label class="field wide">
                    <span>Photo alt text</span>
                    <input v-model="draft.headquarters.imageAlt" type="text" />
                  </label>
                </div>

                <label class="upload-box">
                  <Upload :size="17" aria-hidden="true" />
                  <span>{{ uploadingKey === 'main-photo' ? 'Uploading photo...' : 'Upload main photo' }}</span>
                  <input
                    type="file"
                    accept="image/*"
                    :disabled="uploadingKey === 'main-photo'"
                    @change="uploadImage($event, 'main-photo', (url) => (draft.headquarters.image = url))"
                  />
                </label>
              </div>
            </div>
          </section>

          <section class="editor-panel" aria-labelledby="head-office-details-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Head office details</p>
                <h2 id="head-office-details-heading">Phone, email and address</h2>
              </div>
              <div class="panel-icons" aria-hidden="true">
                <Phone :size="18" />
                <Mail :size="18" />
                <MapPin :size="18" />
              </div>
            </div>

            <div class="panel-body form-grid">
              <label class="field">
                <span>Display name</span>
                <input v-model="draft.headquarters.name" type="text" />
              </label>
              <label class="field">
                <span>Office hours</span>
                <input v-model="draft.headquarters.hours" type="text" />
              </label>
              <label class="field">
                <span>Email</span>
                <input v-model="draft.headquarters.email" type="email" />
              </label>
              <label class="field">
                <span>Phone</span>
                <input v-model="draft.headquarters.phone" type="tel" />
              </label>
              <label class="field wide">
                <span>Address</span>
                <textarea v-model="draft.headquarters.address" rows="2"></textarea>
              </label>
            </div>
          </section>

          <section class="editor-panel" aria-labelledby="offices-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Office map section</p>
                <h2 id="offices-heading">Office tabs and contact cards</h2>
              </div>
              <button type="button" class="btn btn-secondary" :disabled="!canAddOffice" @click="addOffice">
                <Plus :size="16" aria-hidden="true" />
                <span>Add office</span>
              </button>
            </div>

            <div class="panel-body intro-fields">
              <label class="field">
                <span>Small label</span>
                <input v-model="draft.officesIntro.eyebrow" type="text" />
              </label>
              <label class="field">
                <span>Section heading</span>
                <input v-model="draft.officesIntro.title" type="text" />
              </label>
              <label class="field wide">
                <span>Intro text</span>
                <textarea v-model="draft.officesIntro.body" rows="2"></textarea>
              </label>
            </div>

            <div class="offices-list">
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
                    <button type="button" class="icon-btn" :disabled="index === 0" aria-label="Move office up" @click="moveOffice(index, -1)">
                      <ArrowUp :size="15" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      class="icon-btn"
                      :disabled="index === draft.offices.length - 1"
                      aria-label="Move office down"
                      @click="moveOffice(index, 1)"
                    >
                      <ArrowDown :size="15" aria-hidden="true" />
                    </button>
                    <button type="button" class="icon-btn danger" aria-label="Remove office" @click="removeOffice(index)">
                      <Trash2 :size="15" aria-hidden="true" />
                    </button>
                  </div>
                </header>

                <div class="office-form-grid">
                  <label class="field">
                    <span>Tab label</span>
                    <input v-model="office.tab" type="text" />
                  </label>
                  <label class="field">
                    <span>Office type</span>
                    <input v-model="office.type" type="text" />
                  </label>
                  <label class="field">
                    <span>Office title</span>
                    <input v-model="office.title" type="text" />
                  </label>
                  <label class="field">
                    <span>Province label</span>
                    <input v-model="office.provinceName" type="text" />
                  </label>
                  <label class="field">
                    <span>Phone</span>
                    <input v-model="office.phone" type="tel" />
                  </label>
                  <label class="field">
                    <span>Email</span>
                    <input v-model="office.email" type="email" />
                  </label>
                  <label class="field wide">
                    <span>Address</span>
                    <textarea v-model="office.address" rows="2"></textarea>
                  </label>
                  <label class="field wide">
                    <span>Contact purpose</span>
                    <textarea v-model="office.contact" rows="2"></textarea>
                  </label>
                  <label class="field">
                    <span>Map image URL</span>
                    <input v-model="office.mapImage" type="url" placeholder="Leave empty to use the built-in map" />
                  </label>
                  <label class="field">
                    <span>Map label</span>
                    <input v-model="office.mapLabel" type="text" />
                  </label>
                  <label class="field">
                    <span>Pin left</span>
                    <input v-model="office.pinLeft" type="text" placeholder="61.8%" />
                  </label>
                  <label class="field">
                    <span>Pin top</span>
                    <input v-model="office.pinTop" type="text" placeholder="81.4%" />
                  </label>
                </div>
              </article>
            </div>
          </section>

          <section class="editor-panel" aria-labelledby="form-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Message area</p>
                <h2 id="form-heading">Form copy and Telegram</h2>
              </div>
              <MessageSquare :size="20" aria-hidden="true" />
            </div>

            <div class="form-telegram-grid">
              <div class="panel-body form-grid">
                <label class="field">
                  <span>Form intro label</span>
                  <input v-model="draft.form.introEyebrow" type="text" />
                </label>
                <label class="field">
                  <span>Form heading</span>
                  <input v-model="draft.form.title" type="text" />
                </label>
                <label class="field wide">
                  <span>Form intro text</span>
                  <textarea v-model="draft.form.body" rows="3"></textarea>
                </label>
                <label class="field">
                  <span>Email tab</span>
                  <input v-model="draft.form.emailTab" type="text" />
                </label>
                <label class="field">
                  <span>Email form heading</span>
                  <input v-model="draft.form.emailHeading" type="text" />
                </label>
                <label class="field">
                  <span>Email placeholder</span>
                  <input v-model="draft.form.emailPlaceholder" type="text" />
                </label>
                <label class="field">
                  <span>Submit button</span>
                  <input v-model="draft.form.emailButtonLabel" type="text" />
                </label>
                <label class="field wide">
                  <span>Success message</span>
                  <input v-model="draft.form.emailStatus" type="text" />
                </label>
              </div>

              <div class="telegram-panel">
                <figure class="image-preview qr-preview">
                  <img :src="telegramPreview" alt="" />
                </figure>
                <div class="form-stack">
                  <label class="field">
                    <span>Telegram heading</span>
                    <input v-model="draft.form.telegramHeading" type="text" />
                  </label>
                  <label class="field">
                    <span>Telegram URL</span>
                    <input v-model="draft.telegram.url" type="url" />
                  </label>
                  <label class="field">
                    <span>QR image URL</span>
                    <input v-model="draft.telegram.qrImage" type="url" :placeholder="imageHint" />
                  </label>
                  <label class="field">
                    <span>Open button label</span>
                    <input v-model="draft.telegram.openLabel" type="text" />
                  </label>
                  <label class="upload-box">
                    <Upload :size="17" aria-hidden="true" />
                    <span>{{ uploadingKey === 'telegram-qr' ? 'Uploading QR...' : 'Upload Telegram QR' }}</span>
                    <input
                      type="file"
                      accept="image/*"
                      :disabled="uploadingKey === 'telegram-qr'"
                      @change="uploadImage($event, 'telegram-qr', (url) => (draft.telegram.qrImage = url))"
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section class="editor-panel" aria-labelledby="visit-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Visit banner</p>
                <h2 id="visit-heading">Notes and bottom actions</h2>
              </div>
              <ImageIcon :size="20" aria-hidden="true" />
            </div>

            <div class="image-editor-grid">
              <figure class="image-preview banner-preview">
                <img :src="visitPreview" alt="" />
              </figure>
              <div class="form-stack">
                <div class="form-grid">
                  <label class="field">
                    <span>Small label</span>
                    <input v-model="draft.visit.eyebrow" type="text" />
                  </label>
                  <label class="field">
                    <span>Banner heading</span>
                    <input v-model="draft.visit.title" type="text" />
                  </label>
                  <label class="field">
                    <span>Primary action label</span>
                    <input v-model="draft.visit.primaryCta.label" type="text" />
                  </label>
                  <label class="field">
                    <span>Primary action link</span>
                    <input v-model="draft.visit.primaryCta.to" type="text" />
                  </label>
                  <label class="field">
                    <span>Secondary action label</span>
                    <input v-model="draft.visit.secondaryCta.label" type="text" />
                  </label>
                  <label class="field">
                    <span>Secondary action link</span>
                    <input v-model="draft.visit.secondaryCta.to" type="text" />
                  </label>
                  <label class="field wide">
                    <span>Background image URL</span>
                    <input v-model="draft.visit.backgroundImage" type="url" :placeholder="imageHint" />
                  </label>
                </div>

                <div class="notes-editor">
                  <div class="notes-header">
                    <strong>Visit notes</strong>
                    <button type="button" class="btn btn-secondary btn-small" @click="addVisitNote">
                      <Plus :size="14" aria-hidden="true" />
                      <span>Add note</span>
                    </button>
                  </div>
                  <div v-for="(note, index) in draft.visit.notes" :key="index" class="note-row">
                    <input v-model="draft.visit.notes[index]" type="text" />
                    <button type="button" class="icon-btn danger" aria-label="Remove note" @click="removeVisitNote(index)">
                      <Trash2 :size="14" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <label class="upload-box">
                  <Upload :size="17" aria-hidden="true" />
                  <span>{{ uploadingKey === 'visit-banner' ? 'Uploading banner...' : 'Upload visit banner' }}</span>
                  <input
                    type="file"
                    accept="image/*"
                    :disabled="uploadingKey === 'visit-banner'"
                    @change="uploadImage($event, 'visit-banner', (url) => (draft.visit.backgroundImage = url))"
                  />
                </label>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.contact-admin {
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

.image-editor-grid,
.form-telegram-grid {
  display: grid;
  grid-template-columns: minmax(300px, 0.72fr) minmax(360px, 1.28fr);
  gap: 1.1rem;
  padding: 1.1rem;
}

.form-telegram-grid {
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
  padding: 0;
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

.hero-preview,
.banner-preview {
  aspect-ratio: 16 / 10;
}

.qr-preview {
  width: min(100%, 260px);
  aspect-ratio: 1;
  margin-inline: auto;
}

.form-stack,
.offices-list,
.notes-editor {
  display: grid;
  gap: 0.85rem;
}

.form-grid,
.intro-fields,
.office-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.intro-fields {
  padding: 1rem 1rem 0;
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
.upload-box span,
.notes-header strong {
  color: var(--admin-theme-contrast-soft);
}

.field input,
.field textarea,
.upload-box input,
.note-row input {
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
.upload-box input:focus,
.note-row input:focus {
  border-color: var(--admin-theme-primary);
  outline: 3px solid color-mix(in srgb, var(--admin-theme-primary) 15%, transparent);
}

.wide {
  grid-column: 1 / -1;
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

.offices-list {
  padding: 1rem;
}

.office-editor {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  overflow: hidden;
}

.office-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 32%, var(--admin-theme-surface));
  padding: 0.75rem 0.85rem;
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
}

.office-form-grid {
  padding: 0.9rem;
}

.telegram-panel {
  display: grid;
  align-content: start;
  gap: 1rem;
  border-left: 1px solid var(--admin-theme-border);
  padding: 1rem;
}

.notes-editor {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 36%, var(--admin-theme-surface));
  padding: 0.85rem;
}

.notes-header,
.note-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.notes-header {
  justify-content: space-between;
}

.note-row input {
  flex: 1;
}

:global(.admin-dark) .btn-primary {
  color: #071311;
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
  .panel-header,
  .office-editor-header {
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
  .form-telegram-grid,
  .form-grid,
  .intro-fields,
  .office-form-grid {
    grid-template-columns: 1fr;
  }

  .telegram-panel {
    border-left: 0;
    border-top: 1px solid var(--admin-theme-border);
  }

  .notes-header,
  .note-row {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
