<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminEditorPanel from '@/components/admin/AdminEditorPanel.vue'
import { useSectionEditor } from '@/composables/useSectionEditor'
import { useAdminTheme } from '@/composables/useAdminTheme'
import { useUiStore } from '@/stores/ui.store'
import { useMediaStore } from '@/stores/media.store'
import { imageUploadHelpText, isAllowedImageFile } from '@/lib/media'
import {
  createHomeSlide,
  defaultHomeSlides,
  fetchHomeSlides,
  saveHomeSlides,
  type HomeSlide,
} from '@/lib/slidesSettings'

const MIN_SLIDES = 1
const MAX_SLIDES = 5

const ui = useUiStore()
const media = useMediaStore()
useAdminTheme()

const slides = ref<HomeSlide[]>(normalizeSlideSlots(defaultHomeSlides()))
const pendingFiles = reactive<Record<string, File>>({})
const previews = reactive<Record<string, string>>({})

const loading = ref(true)
const saving = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// Only one slide is edited at a time — pick which one via the selector strip.
const activeIndex = ref(0)
const activeSlide = computed(() => slides.value[activeIndex.value])
const filledSlideCount = computed(() => slides.value.filter(hasSlideImage).length)

// Same Edit -> Cancel/Done gating as every other admin content editor: fields
// stay disabled until "Edit" is pressed. There's only ever one section here
// (the active slide), but which slide it points at changes when the tab
// strip switches - selectSlide() resets editingSections.slide directly so a
// stale snapshot never gets applied to the wrong slide.
const {
  editingSections,
  collapsedSections,
  toggleCollapse,
  toggleEdit,
  cancelEdit,
} = useSectionEditor([
  {
    key: 'slide',
    getSnapshot: () => (activeSlide.value ? { ...activeSlide.value } : null),
    applySnapshot: (value) => {
      if (!value || !activeSlide.value) return
      Object.assign(activeSlide.value, value)
    },
  },
])

// Save button only lights up once the slideshow actually differs from what
// was last loaded/saved — same "disabled until there's something to save" as
// the AdminSectionNav "Save Change" button every other admin editor uses.
const originalSnapshot = ref('')

function snapshotSlides() {
  return JSON.stringify(slides.value)
}

function updateSnapshot() {
  originalSnapshot.value = snapshotSlides()
}

const hasChanges = computed(
  () => snapshotSlides() !== originalSnapshot.value || Object.keys(pendingFiles).length > 0,
)

onMounted(async () => {
  try {
    const saved = await fetchHomeSlides()
    slides.value = normalizeSlideSlots(saved.length ? saved : defaultHomeSlides())
  } catch {
    slides.value = normalizeSlideSlots(defaultHomeSlides())
    // No settings saved yet — start from defaults.
  } finally {
    updateSnapshot()
    loading.value = false
  }
})

onBeforeUnmount(() => {
  for (const id of Object.keys(previews)) revokePreview(id)
})

function revokePreview(id: string) {
  if (previews[id]) {
    URL.revokeObjectURL(previews[id])
    delete previews[id]
  }
}

function displayedImage(slide: HomeSlide) {
  return previews[slide.id] || slide.imageUrl
}

function hasSlideImage(slide: HomeSlide) {
  return Boolean(displayedImage(slide).trim())
}

function slotStatus(slide: HomeSlide) {
  if (pendingFiles[slide.id]) return 'Pending upload'
  return hasSlideImage(slide) ? 'Image ready' : 'Blank slot'
}

function slotHasContent(slide: HomeSlide) {
  return Boolean(
    displayedImage(slide).trim() ||
      slide.alt.trim() ||
      slide.eyebrow.trim() ||
      slide.title.trim() ||
      slide.description.trim(),
  )
}

function onFileChange(slide: HomeSlide, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  if (!isAllowedImageFile(file)) {
    showMessage(`Please choose ${imageUploadHelpText()}`, 'error')
    return
  }

  revokePreview(slide.id)
  pendingFiles[slide.id] = file
  previews[slide.id] = URL.createObjectURL(file)
  message.value = ''
}

function removeImage(slide: HomeSlide) {
  revokePreview(slide.id)
  delete pendingFiles[slide.id]
  slide.imageUrl = ''
}

function selectSlide(index: number) {
  if (index < 0 || index >= MAX_SLIDES) return
  editingSections.slide = false
  activeIndex.value = index
}

function clearSlot(slide: HomeSlide) {
  const index = slides.value.findIndex((s) => s.id === slide.id)
  const label = slide.title.trim() || `slot ${index + 1}`

  ui.openModal('Clear slide slot?', `Clear "${label}" from this slideshow slot?`, () => {
    revokePreview(slide.id)
    delete pendingFiles[slide.id]
    slide.imageUrl = ''
    slide.alt = ''
    slide.eyebrow = ''
    slide.title = ''
    slide.description = ''
    message.value = ''
    ui.addToast(`Slide ${index + 1} cleared. Save changes to update the homepage.`, 'info')
  })
}

function showMessage(text: string, type: 'success' | 'error') {
  message.value = text
  messageType.value = type
}

async function uploadImage(slide: HomeSlide, file: File) {
  const item = await media.upload(file)
  if (!item?.url) throw new Error(`Could not upload image for ${slide.title || 'this slide'}.`)
  return item.url
}

async function save() {
  if (saving.value) return

  const publishableSlides = slides.value.filter(hasSlideImage).slice(0, MAX_SLIDES)

  if (publishableSlides.length < MIN_SLIDES) {
    showMessage('Upload at least one slideshow image before saving.', 'error')
    return
  }
  saving.value = true
  message.value = ''

  try {
    for (const slide of publishableSlides) {
      const file = pendingFiles[slide.id]
      if (file) {
        slide.imageUrl = await uploadImage(slide, file)
        delete pendingFiles[slide.id]
        revokePreview(slide.id)
      }
    }

    await saveHomeSlides(slides.value.filter((slide) => slide.imageUrl.trim()).slice(0, MAX_SLIDES))
    updateSnapshot()

    showMessage('Slideshow saved. The homepage is now updated.', 'success')
  } catch (e) {
    showMessage(e instanceof Error ? e.message : 'Failed to save slideshow.', 'error')
  } finally {
    saving.value = false
  }
}

function normalizeSlideSlots(source: HomeSlide[]) {
  const slots = source.slice(0, MAX_SLIDES).map((slide) => ({ ...slide }))

  while (slots.length < MAX_SLIDES) {
    slots.push(createHomeSlide())
  }

  return slots
}
</script>

<template>
  <v-app :class="['admin-page', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="main">
        <section class="slideshow-overview" aria-label="Homepage slideshow settings">
          <header class="slideshow-header">
            <div class="header-copy">
              <p class="eyebrow">Home</p>
              <h1>Homepage Slideshow</h1>
              <p>
                Manage up to {{ MAX_SLIDES }} homepage hero images. Empty slots stay visible here
                as blank cards, but only slots with uploaded images are published after saving.
              </p>
              <p hidden>
                Manage the rotating hero slideshow on the homepage — upload each slide's image,
                edit the overlay text and buttons, reorder slides, or add a new one. Changes go
                live as soon as you save. Keep between {{ MIN_SLIDES }} and {{ MAX_SLIDES }} slides.
              </p>
            </div>
            <div class="slot-meter" aria-live="polite">
              <strong>{{ filledSlideCount }}</strong>
              <span>/ {{ MAX_SLIDES }} image slots filled</span>
            </div>
          </header>

          <p v-if="loading" class="loading-note">Loading current slideshow...</p>

          <template v-else>
            <div class="slide-selector" role="tablist" aria-label="Select a slide to edit">
              <button
                v-for="(slide, index) in slides"
                :key="slide.id"
                type="button"
                role="tab"
                :aria-selected="index === activeIndex"
                :class="['selector-tab', { active: index === activeIndex }]"
                @click="selectSlide(index)"
              >
                <span class="selector-thumb">
                  <img v-if="displayedImage(slide)" :src="displayedImage(slide)" alt="" />
                  <span v-else class="selector-thumb-empty" aria-hidden="true">&#9635;</span>
                </span>
                <span class="selector-copy">
                  <span class="selector-index">Slide {{ index + 1 }}</span>
                </span>
              </button>
            </div>

            <AdminEditorPanel
              v-if="activeSlide"
              :key="activeSlide.id"
              id="active-slide-panel"
              :kicker="`Slide ${activeIndex + 1} of ${slides.length}`"
              :heading="activeSlide.title || 'Untitled slide'"
              :editing="!!editingSections.slide"
              :collapsed="!!collapsedSections.slide"
              @toggle-edit="toggleEdit('slide')"
              @cancel="cancelEdit('slide')"
              @toggle-collapse="toggleCollapse('slide')"
            >
              <template #actions>
                <button
                  type="button"
                  class="remove-slide-btn"
                  :disabled="!slotHasContent(activeSlide)"
                  :title="!slotHasContent(activeSlide) ? 'This slide slot is already empty.' : ''"
                  :aria-label="`Clear slide ${activeIndex + 1}`"
                  @click="clearSlot(activeSlide)"
                >
                  ×
                </button>
              </template>

              <div class="slide-body">
                <div class="media-column">
                  <div class="image-preview">
                    <img
                      v-if="displayedImage(activeSlide)"
                      :src="displayedImage(activeSlide)"
                      :alt="activeSlide.alt || 'Slide preview'"
                    />
                    <div v-else class="image-empty">
                      <span class="image-empty-icon" aria-hidden="true">&#9635;</span>
                      <span>No image uploaded yet</span>
                    </div>
                    <span v-if="pendingFiles[activeSlide.id]" class="pending-tag">Not saved yet</span>
                  </div>

                  <div class="image-actions">
                    <label class="upload-btn" :class="{ disabled: !editingSections.slide }">
                      <input
                        :id="`${activeSlide.id}-image-upload`"
                        :name="`${activeSlide.id}-image-upload`"
                        type="file"
                        accept="image/*"
                        class="sr-only"
                        :disabled="!editingSections.slide"
                        @change="onFileChange(activeSlide, $event)"
                      />
                      {{ displayedImage(activeSlide) ? 'Replace image' : 'Upload image' }}
                    </label>
                    <button
                      v-if="displayedImage(activeSlide)"
                      type="button"
                      class="remove-btn"
                      :disabled="!editingSections.slide"
                      @click="removeImage(activeSlide)"
                    >
                      Remove image
                    </button>
                  </div>

                  <div class="field">
                    <label :for="`${activeSlide.id}-alt`">Image alt text</label>
                    <input
                      :id="`${activeSlide.id}-alt`"
                      v-model="activeSlide.alt"
                      :name="`${activeSlide.id}-alt`"
                      placeholder="Describe the photo for accessibility"
                      :disabled="!editingSections.slide"
                    />
                  </div>
                </div>

                <div class="fields-column">
                  <div class="field">
                    <label :for="`${activeSlide.id}-eyebrow`">Eyebrow</label>
                    <input
                      :id="`${activeSlide.id}-eyebrow`"
                      v-model="activeSlide.eyebrow"
                      :name="`${activeSlide.id}-eyebrow`"
                      placeholder="e.g. Education and Buddhist learning"
                      :disabled="!editingSections.slide"
                    />
                  </div>
                  <div class="field">
                    <label :for="`${activeSlide.id}-title`">Title (optional)</label>
                    <input
                      :id="`${activeSlide.id}-title`"
                      v-model="activeSlide.title"
                      :name="`${activeSlide.id}-title`"
                      placeholder="e.g. Helping children learn with confidence."
                      :disabled="!editingSections.slide"
                    />
                  </div>
                  <div class="field">
                    <label :for="`${activeSlide.id}-description`">Description</label>
                    <textarea
                      :id="`${activeSlide.id}-description`"
                      v-model="activeSlide.description"
                      :name="`${activeSlide.id}-description`"
                      rows="4"
                      placeholder="One or two sentences shown under the title"
                      :disabled="!editingSections.slide"
                    />
                  </div>
                </div>
              </div>
            </AdminEditorPanel>
          </template>

          <footer v-if="!loading" class="save-bar">
            <p v-if="message" :class="['save-message', messageType]" role="status">
              {{ message }}
            </p>
            <span v-if="hasChanges" class="unsaved-badge">
              <v-icon size="10">mdi-circle</v-icon>
              Unsaved changes
            </span>
            <v-btn
              color="primary"
              variant="tonal"
              :loading="saving"
              :disabled="saving || !hasChanges"
              @click="save"
            >
              <v-icon start>mdi-content-save</v-icon>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </v-btn>
          </footer>
        </section>
      </main>
    </div>
  </v-app>
</template>

<style scoped>
.admin-page {
  --admin-bg: var(--admin-theme-bg);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-contrast-soft: var(--admin-theme-contrast-soft);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-blue: var(--admin-theme-primary);
  --admin-blue-deep: var(--admin-theme-primary-deep);
  --admin-shadow: var(--admin-theme-shadow);

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--admin-bg);
  color: var(--admin-text);
  font-family: var(--font-family-base);
  transition: padding-left 0.25s ease;
}

.admin-layout {
  display: flex;
  flex: 1;
}

.main {
  flex: 1;
  width: 100%;
  padding: 1.5rem 2.25rem 2.5rem;
  background: var(--admin-bg);
}

.slideshow-overview {
  display: grid;
  gap: 1.5rem;
}

.slideshow-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.4rem 1.6rem;
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: linear-gradient(135deg, var(--admin-surface-soft), var(--admin-surface));
  box-shadow: var(--admin-shadow);
}

.header-copy {
  display: grid;
  gap: 0.5rem;
  max-width: 640px;
}

.eyebrow {
  margin: 0;
  color: var(--admin-blue-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--admin-contrast);
  font-size: 1.85rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.header-copy p:not(.eyebrow) {
  margin: 0;
  color: var(--admin-muted);
  line-height: 1.6;
}

.add-btn {
  min-height: 46px;
  border: 1.5px solid var(--admin-blue);
  border-radius: 10px;
  background: var(--admin-surface);
  color: var(--admin-blue-deep);
  padding: 0.6rem 1.2rem;
  font-weight: 800;
  font-size: 0.92rem;
  cursor: pointer;
  transition:
    background 0.18s ease,
    transform 0.12s ease;
}

.add-btn:hover {
  background: var(--admin-surface-soft);
  transform: translateY(-1px);
}

.add-btn:disabled {
  cursor: wait;
  opacity: 0.6;
}

.loading-note {
  margin: 0;
  color: var(--admin-muted);
  font-weight: 600;
}

.slide-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.selector-tab {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 200px;
  border: 1.5px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface);
  padding: 0.5rem 0.9rem 0.5rem 0.5rem;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.12s ease;
}

.selector-tab:hover {
  transform: translateY(-1px);
}

.selector-tab.active {
  border-color: var(--admin-blue);
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
}

.selector-thumb {
  width: 2.6rem;
  height: 2.6rem;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: var(--admin-surface-soft);
  display: grid;
  place-items: center;
}

.selector-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selector-thumb-empty {
  color: var(--admin-muted);
  font-size: 1rem;
}

.selector-copy {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}

.selector-index {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--admin-muted);
}

.selector-tab.active .selector-index {
  color: var(--admin-blue-deep);
}

/*
  Clear button now sits in AdminEditorPanel's own toolbar (light
  background, shared across every admin editor) instead of the page's old
  bespoke gradient header - colored for a light surface instead of the
  previous white-on-transparent-white made for a dark green header.
*/
.remove-slide-btn {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border: 1px solid var(--admin-theme-border-strong);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-contrast-soft);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.remove-slide-btn:hover:not(:disabled) {
  border-color: var(--admin-theme-danger);
  color: var(--admin-theme-danger);
  background: color-mix(in srgb, var(--admin-theme-danger) 8%, var(--admin-theme-surface));
}

.remove-slide-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.slide-body {
  padding: 1.4rem;
  display: grid;
  grid-template-columns: minmax(260px, 340px) 1fr;
  align-items: start;
  gap: 1.75rem;
}

.media-column {
  display: grid;
  gap: 1rem;
  align-content: start;
}

.fields-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fields-column .field:last-child {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.fields-column .field:last-child textarea {
  flex: 1;
  min-height: 150px;
  resize: vertical;
}

.image-preview {
  position: relative;
  border: 2px dashed;
  border-color: var(--admin-border-strong);
  border-radius: 12px;
  min-height: 180px;
  display: grid;
  place-items: center;
  padding: 0.75rem;
  background: var(--admin-surface-soft);
}

.image-preview img {
  max-width: 100%;
  max-height: 240px;
  border-radius: 8px;
  object-fit: cover;
}

.image-empty {
  display: grid;
  gap: 0.35rem;
  justify-items: center;
  color: var(--admin-muted);
  font-size: 0.85rem;
  font-weight: 600;
}

.image-empty-icon {
  font-size: 2rem;
}

.pending-tag {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  background: #d9ad2f;
  color: #1d3d5c;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
}

:global(.admin-dark) .pending-tag {
  background: rgba(217, 173, 47, 0.85);
  color: #0c1f1a;
}

.image-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  border: 1px solid var(--admin-blue);
  border-radius: 10px;
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
  color: #ffffff;
  padding: 0.5rem 1rem;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  box-shadow: 0 12px 22px rgba(15, 125, 56, 0.25);
  transition:
    transform 0.12s ease,
    box-shadow 0.18s ease;
}

.upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(15, 125, 56, 0.3);
}

.upload-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  box-shadow: none;
  transform: none;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.remove-btn {
  min-height: 42px;
  border: 1.5px solid rgba(225, 29, 72, 0.35);
  border-radius: 10px;
  background: rgba(225, 29, 72, 0.06);
  color: #be123c;
  padding: 0.5rem 1rem;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.18s ease;
}

.remove-btn:hover {
  background: rgba(225, 29, 72, 0.13);
}

:global(.admin-dark) .remove-btn {
  border-color: rgba(251, 113, 133, 0.35);
  background: rgba(251, 113, 133, 0.08);
  color: #fb7185;
}

:global(.admin-dark) .remove-btn:hover {
  background: rgba(251, 113, 133, 0.18);
}

.field {
  display: grid;
  gap: 0.4rem;
}

.field-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.field label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--admin-form-label);
}

.field input,
.field textarea {
  min-height: 54px;
  border: 1px solid var(--admin-form-border);
  border-radius: var(--admin-form-radius);
  background: var(--admin-form-bg);
  color: var(--admin-contrast);
  padding: 1rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.field textarea {
  min-height: 150px;
  resize: vertical;
}

.field input::placeholder,
.field textarea::placeholder {
  color: var(--admin-form-placeholder);
}

@media (hover: hover) {
  .field input:hover:not(:disabled):not(:focus),
  .field textarea:hover:not(:disabled):not(:focus) {
    border-color: var(--admin-form-border-hover);
  }
}

.field input:focus,
.field textarea:focus {
  border-color: var(--admin-form-focus);
  box-shadow: 0 0 0 4px var(--admin-form-focus-shadow);
  outline: none;
}

.field input:disabled,
.field textarea:disabled {
  background: color-mix(in srgb, var(--admin-surface-soft) 60%, var(--admin-surface));
  color: var(--admin-muted);
  cursor: not-allowed;
}

.save-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.4rem;
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
}

.save-message {
  margin: 0 auto 0 0;
  font-weight: 700;
  font-size: 0.9rem;
}

.save-message.success {
  color: var(--admin-blue-deep);
}

.save-message.error {
  color: #be123c;
}

:global(.admin-dark) .save-message.error {
  color: #fb7185;
}

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

@media (min-width: 900px) {
  .admin-page.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 760px) {
  .main {
    padding: 1rem;
  }

  .slideshow-header {
    padding: 1.1rem;
  }

  .selector-tab {
    min-width: 0;
    flex: 1 1 100%;
  }

  .slide-body {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>

<!-- Non-scoped dark mode overrides for Slideshow Manager page -->
<style>
.admin-dark .admin-page {
  background: #06100F !important;
}
.admin-dark .admin-page .admin-layout {
  background: #06100F !important;
}
.admin-dark .admin-page .main {
  background: #06100F !important;
}
.admin-dark .slideshow-header,
.admin-dark .save-bar {
  background: #0a1a14 !important;
  border-color: #1d3b33 !important;
}
.admin-dark .btn,
.admin-dark .btn-primary,
.admin-dark .btn-secondary,
.admin-dark .btn-ghost {
  background: #0a1a14 !important;
  border-color: #1d3b33 !important;
  color: #f2fbf6 !important;
}
.admin-dark .btn-primary {
  background: #38c982 !important;
  border-color: #74e0ae !important;
  color: #06100F !important;
}
.admin-dark .selector-tab {
  background: #0a1a14 !important;
  border-color: #1d3b33 !important;
}
.admin-dark .selector-tab.active {
  border-color: #38c982 !important;
}
.admin-dark .selector-tab:hover {
  border-color: #2d554a !important;
}
.admin-dark .image-preview {
  background: #0b1b17 !important;
  border-color: #2d554a !important;
}
.admin-dark .save-message.success {
  color: #74e0ae !important;
}
.admin-dark .save-message.error {
  color: #fb7185 !important;
}
</style>
