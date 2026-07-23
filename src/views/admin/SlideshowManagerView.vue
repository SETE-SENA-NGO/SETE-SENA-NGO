<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useUiStore } from '@/stores/ui.store'
import { useMediaStore } from '@/stores/media.store'
import { imageUploadHelpText, isAllowedImageFile } from '@/lib/media'
import {
  createHomeSlide,
  defaultHomeSlides,
  deleteHomeSlide,
  fetchHomeSlides,
  saveHomeSlides,
  type HomeSlide,
} from '@/lib/slidesSettings'

const MIN_SLIDES = 1
const MAX_SLIDES = 5

const ui = useUiStore()
const media = useMediaStore()

const slides = ref<HomeSlide[]>(defaultHomeSlides())
const pendingFiles = reactive<Record<string, File>>({})
const previews = reactive<Record<string, string>>({})

const loading = ref(true)
const saving = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// Only one slide is edited at a time — pick which one via the selector strip.
const activeIndex = ref(0)
const activeSlide = computed(() => slides.value[activeIndex.value])
const removingId = ref<string | null>(null)

onMounted(async () => {
  try {
    const saved = await fetchHomeSlides()
    if (saved.length) slides.value = saved
  } catch {
    // No settings saved yet — start from defaults.
  } finally {
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
  activeIndex.value = index
}

function addSlide() {
  if (slides.value.length >= MAX_SLIDES) {
    showMessage(`You can have at most ${MAX_SLIDES} slides.`, 'error')
    return
  }
  slides.value.push(createHomeSlide())
  activeIndex.value = slides.value.length - 1
  message.value = ''
}

function removeSlide(slide: HomeSlide) {
  if (slides.value.length <= MIN_SLIDES) {
    showMessage(`You must keep at least ${MIN_SLIDES} slide.`, 'error')
    return
  }

  const index = slides.value.findIndex((s) => s.id === slide.id)
  const label = slide.title.trim() || `Slide ${index + 1}`

  ui.openModal('Remove slide?', `Remove "${label}" from the homepage slideshow?`, async () => {
    removingId.value = slide.id
    try {
      // Deletes right away (a newly-added, never-saved slide simply has no
      // matching row yet, so this is a harmless no-op for it).
      await deleteHomeSlide(slide.id)

      revokePreview(slide.id)
      delete pendingFiles[slide.id]
      slides.value = slides.value.filter((s) => s.id !== slide.id)
      if (index !== -1) {
        activeIndex.value = Math.min(index, slides.value.length - 1)
      }
      ui.addToast(`${label} removed from the slideshow.`, 'success')
    } catch (e) {
      ui.addToast(e instanceof Error ? e.message : 'Could not remove slide.', 'error')
    } finally {
      removingId.value = null
    }
  })
}

function moveSlide(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= slides.value.length) return
  const list = slides.value.slice()
  const moved = list.splice(index, 1)[0]
  if (!moved) return
  list.splice(target, 0, moved)
  slides.value = list
  if (activeIndex.value === index) activeIndex.value = target
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

  if (!slides.value.length) {
    showMessage('Add at least one slide before saving.', 'error')
    return
  }
  if (slides.value.some((s) => !s.title.trim())) {
    showMessage('Every slide needs a title before saving.', 'error')
    return
  }

  saving.value = true
  message.value = ''

  try {
    for (const slide of slides.value) {
      const file = pendingFiles[slide.id]
      if (file) {
        slide.imageUrl = await uploadImage(slide, file)
        delete pendingFiles[slide.id]
        revokePreview(slide.id)
      }
    }

    await saveHomeSlides(slides.value)

    showMessage('Slideshow saved. The homepage is now updated.', 'success')
  } catch (e) {
    showMessage(e instanceof Error ? e.message : 'Failed to save slideshow.', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div :class="['admin-page', { 'sidebar-open': ui.sidebarOpen }]">
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
                Manage the rotating hero slideshow on the homepage — upload each slide's image,
                edit the overlay text and buttons, reorder slides, or add a new one. Changes go
                live as soon as you save. Keep between {{ MIN_SLIDES }} and {{ MAX_SLIDES }} slides.
              </p>
            </div>
            <button
              class="add-btn"
              type="button"
              :disabled="loading || slides.length >= MAX_SLIDES"
              :title="slides.length >= MAX_SLIDES ? `You can have at most ${MAX_SLIDES} slides.` : ''"
              @click="addSlide"
            >
              + Add slide
            </button>
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

            <article v-if="activeSlide" :key="activeSlide.id" class="slide-card">
              <header class="slide-head">
                <div class="head-copy">
                  <div class="slide-name">Slide {{ activeIndex + 1 }} of {{ slides.length }}</div>
                  <div class="slide-subtitle">{{ activeSlide.title || 'Untitled slide' }}</div>
                </div>
                <div class="slide-head-actions">
                  <button
                    type="button"
                    class="order-btn"
                    :disabled="activeIndex === 0"
                    aria-label="Move slide up"
                    @click="moveSlide(activeIndex, -1)"
                  >
                    &uarr;
                  </button>
                  <button
                    type="button"
                    class="order-btn"
                    :disabled="activeIndex === slides.length - 1"
                    aria-label="Move slide down"
                    @click="moveSlide(activeIndex, 1)"
                  >
                    &darr;
                  </button>
                  <button
                    type="button"
                    class="remove-slide-btn"
                    :disabled="slides.length <= MIN_SLIDES || removingId === activeSlide.id"
                    :title="slides.length <= MIN_SLIDES ? `You must keep at least ${MIN_SLIDES} slide.` : ''"
                    :aria-label="`Remove slide ${activeIndex + 1}`"
                    @click="removeSlide(activeSlide)"
                  >
                    {{ removingId === activeSlide.id ? '⋯' : '×' }}
                  </button>
                </div>
              </header>

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
                    <label class="upload-btn">
                      <input
                        :id="`${activeSlide.id}-image-upload`"
                        :name="`${activeSlide.id}-image-upload`"
                        type="file"
                        accept="image/*"
                        class="sr-only"
                        @change="onFileChange(activeSlide, $event)"
                      />
                      {{ displayedImage(activeSlide) ? 'Replace image' : 'Upload image' }}
                    </label>
                    <button
                      v-if="displayedImage(activeSlide)"
                      type="button"
                      class="remove-btn"
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
                    />
                  </div>
                  <div class="field">
                    <label :for="`${activeSlide.id}-title`">Title</label>
                    <input
                      :id="`${activeSlide.id}-title`"
                      v-model="activeSlide.title"
                      :name="`${activeSlide.id}-title`"
                      placeholder="e.g. Helping children learn with confidence."
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
                    />
                  </div>
                </div>
              </div>
            </article>
          </template>

          <footer v-if="!loading" class="save-bar">
            <p v-if="message" :class="['save-message', messageType]" role="status">
              {{ message }}
            </p>
            <button class="save-btn" type="button" :disabled="saving" @click="save">
              {{ saving ? 'Saving...' : 'Save changes' }}
            </button>
          </footer>
        </section>
      </main>
    </div>
  </div>
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

.slide-card {
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
  overflow: hidden;
  display: grid;
  align-content: start;
}

.slide-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.4rem;
  color: #ffffff;
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
}

.head-copy {
  min-width: 0;
}

.slide-name {
  font-weight: 800;
  font-size: 1.05rem;
}

.slide-subtitle {
  font-size: 0.7rem;
  letter-spacing: 0.02em;
  opacity: 0.85;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slide-head-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.order-btn,
.remove-slide-btn {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.18s ease;
}

.order-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.28);
}

.order-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.remove-slide-btn:hover:not(:disabled) {
  background: rgba(225, 29, 72, 0.65);
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
  gap: 1rem;
}

.fields-column .field:last-child {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.fields-column .field:last-child textarea {
  flex: 1;
  min-height: 120px;
  resize: none;
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
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--admin-contrast-soft);
}

.field input,
.field textarea {
  min-height: 44px;
  border: 1.5px solid var(--admin-border-strong);
  border-radius: 10px;
  background: var(--admin-surface);
  color: var(--admin-text);
  padding: 0.6rem 0.85rem;
  font-size: 0.92rem;
  font-family: inherit;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field textarea:focus {
  border-color: var(--admin-blue);
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.15);
  outline: none;
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

.save-btn {
  min-height: 46px;
  border: 1px solid var(--admin-blue);
  border-radius: 10px;
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
  color: #ffffff;
  padding: 0.6rem 1.5rem;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  box-shadow: 0 12px 22px rgba(15, 125, 56, 0.25);
  transition:
    transform 0.12s ease,
    box-shadow 0.18s ease;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(15, 125, 56, 0.3);
}

.save-btn:disabled {
  cursor: wait;
  opacity: 0.72;
  transform: none;
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
