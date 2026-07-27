<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
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
const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

useAdminTheme()

const slides = ref<HomeSlide[]>(normalizeSlideSlots(defaultHomeSlides()))
const pendingFiles = reactive<Record<string, File>>({})
const previews = reactive<Record<string, string>>({})
const loading = ref(true)
const saving = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const activeIndex = ref(0)
const activeSlide = computed(() => slides.value[activeIndex.value])
const filledSlideCount = computed(() => slides.value.filter(hasSlideImage).length)

onMounted(async () => {
  try {
    const saved = await fetchHomeSlides()
    slides.value = normalizeSlideSlots(saved.length ? saved : defaultHomeSlides())
  } catch { slides.value = normalizeSlideSlots(defaultHomeSlides())
  } finally { loading.value = false }
})

onBeforeUnmount(() => { for (const id of Object.keys(previews)) revokePreview(id) })

function revokePreview(id: string) { if (previews[id]) { URL.revokeObjectURL(previews[id]); delete previews[id] } }
function displayedImage(slide: HomeSlide) { return previews[slide.id] || slide.imageUrl }
function hasSlideImage(slide: HomeSlide) { return Boolean(displayedImage(slide).trim()) }

function slotHasContent(slide: HomeSlide) { return Boolean(displayedImage(slide).trim() || slide.alt.trim() || slide.eyebrow.trim() || slide.title.trim() || slide.description.trim()) }

function onFileChange(slide: HomeSlide, event: Event) {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]; input.value = ''
  if (!file) return
  if (!isAllowedImageFile(file)) { showMessage(`Please choose ${imageUploadHelpText()}`, 'error'); return }
  revokePreview(slide.id); pendingFiles[slide.id] = file; previews[slide.id] = URL.createObjectURL(file); message.value = ''
}

function removeImage(slide: HomeSlide) { revokePreview(slide.id); delete pendingFiles[slide.id]; slide.imageUrl = '' }

function selectSlide(index: number) { if (index < 0 || index >= MAX_SLIDES) return; activeIndex.value = index }

function clearSlot(slide: HomeSlide) {
  const index = slides.value.findIndex((s) => s.id === slide.id)
  const label = slide.title.trim() || `slot ${index + 1}`
  confirmDialog('Clear slide slot?', `Clear "${label}" from this slideshow slot?`, () => {
    revokePreview(slide.id); delete pendingFiles[slide.id]
    slide.imageUrl = ''; slide.alt = ''; slide.eyebrow = ''; slide.title = ''; slide.description = ''
    message.value = ''; ui.addToast(`Slide ${index + 1} cleared. Save changes to update the homepage.`, 'info')
  })
}

function moveSlide(index: number, direction: -1 | 1) {
  const target = index + direction; if (target < 0 || target >= slides.value.length) return
  const list = slides.value.slice(); const moved = list.splice(index, 1)[0]; if (!moved) return
  list.splice(target, 0, moved); slides.value = list
  if (activeIndex.value === index) activeIndex.value = target
}

function showMessage(text: string, type: 'success' | 'error') { message.value = text; messageType.value = type }

async function uploadImage(slide: HomeSlide, file: File) {
  const item = await media.upload(file)
  if (!item?.url) throw new Error(`Could not upload image for ${slide.title || 'this slide'}.`)
  return item.url
}

async function save() {
  if (saving.value) return
  const publishableSlides = slides.value.filter(hasSlideImage).slice(0, MAX_SLIDES)
  if (publishableSlides.length < MIN_SLIDES) { showMessage('Upload at least one slideshow image before saving.', 'error'); return }
  saving.value = true; message.value = ''
  try {
    for (const slide of publishableSlides) {
      const file = pendingFiles[slide.id]
      if (file) { slide.imageUrl = await uploadImage(slide, file); delete pendingFiles[slide.id]; revokePreview(slide.id) }
    }
    await saveHomeSlides(slides.value.filter((s) => s.imageUrl.trim()).slice(0, MAX_SLIDES))
    showMessage('Slideshow saved. The homepage is now updated.', 'success')
  } catch (e) { showMessage(e instanceof Error ? e.message : 'Failed to save slideshow.', 'error')
  } finally { saving.value = false }
}

function normalizeSlideSlots(source: HomeSlide[]) {
  const slots = source.slice(0, MAX_SLIDES).map((s) => ({ ...s }))
  while (slots.length < MAX_SLIDES) slots.push(createHomeSlide())
  return slots
}
</script>

<template>
  <v-app :class="['admin-page', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="main">
        <section aria-label="Homepage slideshow settings">
          <header class="manager-hero">
            <div class="manager-title">
              <v-chip size="small" variant="tonal" color="primary" class="mb-1">Home</v-chip>
              <h1>Homepage Slideshow</h1>
              <p class="text-body-2 text-medium-emphasis" style="max-width: 640px;">
                Manage up to {{ MAX_SLIDES }} homepage hero images. Empty slots stay visible here
                as blank cards, but only slots with uploaded images are published after saving.
              </p>
            </div>
            <div class="d-flex align-center ga-1">
              <strong class="text-h4">{{ filledSlideCount }}</strong>
              <span class="text-body-2 text-medium-emphasis">/ {{ MAX_SLIDES }} slots filled</span>
            </div>
          </header>

          <div v-if="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading current slideshow...</span>
          </div>

          <template v-else>
            <div class="slide-selector" role="tablist" aria-label="Select a slide to edit">
              <button v-for="(slide, index) in slides" :key="slide.id" type="button" role="tab"
                :aria-selected="index === activeIndex"
                :class="['selector-tab', { active: index === activeIndex }]"
                @click="selectSlide(index)">
                <span class="selector-thumb">
                  <v-img v-if="displayedImage(slide)" :src="displayedImage(slide)" alt="" height="36" width="36" cover />
                  <v-icon v-else color="disabled" size="18">mdi-image</v-icon>
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
                  <v-btn icon size="small" variant="text" :disabled="activeIndex === 0" @click="moveSlide(activeIndex, -1)">
                    <v-icon>mdi-chevron-up</v-icon>
                  </v-btn>
                  <v-btn icon size="small" variant="text" :disabled="activeIndex === slides.length - 1" @click="moveSlide(activeIndex, 1)">
                    <v-icon>mdi-chevron-down</v-icon>
                  </v-btn>
                  <v-btn icon size="small" variant="text" :disabled="!slotHasContent(activeSlide)" @click="clearSlot(activeSlide)">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </div>
              </header>

              <div class="slide-body">
                <div class="media-column">
                  <div class="image-preview">
                    <v-img v-if="displayedImage(activeSlide)" :src="displayedImage(activeSlide)" :alt="activeSlide.alt || 'Slide preview'" max-height="240" contain class="rounded-lg" />
                    <div v-else class="image-empty">
                      <v-icon size="32" color="disabled">mdi-image-off</v-icon>
                      <span class="text-body-2">No image uploaded yet</span>
                    </div>
                    <span v-if="pendingFiles[activeSlide.id]" class="pending-tag">Not saved yet</span>
                  </div>

                  <div class="d-flex flex-wrap ga-2">
                    <v-btn variant="elevated" color="primary" @click="document.getElementById(activeSlide.id + '-image-upload')?.click()">
                      {{ displayedImage(activeSlide) ? 'Replace image' : 'Upload image' }}
                    </v-btn>
                    <input :id="`${activeSlide.id}-image-upload`" type="file" accept="image/*" class="d-none" @change="onFileChange(activeSlide, $event)" />
                    <v-btn v-if="displayedImage(activeSlide)" variant="tonal" color="error" @click="removeImage(activeSlide)">
                      Remove image
                    </v-btn>
                  </div>

                  <v-text-field v-model="activeSlide.alt" :id="`${activeSlide.id}-alt`" label="Image alt text" placeholder="Describe the photo for accessibility" hide-details density="comfortable" variant="outlined" />
                </div>

                <div class="fields-column">
                  <v-text-field v-model="activeSlide.eyebrow" :id="`${activeSlide.id}-eyebrow`" label="Eyebrow" placeholder="e.g. Education and Buddhist learning" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="activeSlide.title" :id="`${activeSlide.id}-title`" label="Title (optional)" placeholder="e.g. Helping children learn with confidence." hide-details density="comfortable" variant="outlined" />
                  <v-textarea v-model="activeSlide.description" :id="`${activeSlide.id}-description`" label="Description" rows="4" placeholder="One or two sentences shown under the title" hide-details density="comfortable" variant="outlined" class="flex-fill" />
                </div>
              </div>
            </article>
          </template>

          <footer v-if="!loading" class="save-bar">
            <div v-if="message" :class="['save-message', messageType]">{{ message }}</div>
            <v-btn color="primary" variant="elevated" :loading="saving" :disabled="saving" @click="save">
              {{ saving ? 'Saving...' : 'Save changes' }}
            </v-btn>
          </footer>
        </section>
      </main>
    </div>

    <AdminConfirmDialog v-model="confirmOpen" :title="confirmData.title" :body="confirmData.body" @confirm="confirmData.onConfirm()" />
  </v-app>
</template>

<style scoped>
.admin-page { min-height: 100vh; background: var(--admin-bg); color: var(--admin-text); transition: padding-left 0.25s ease; }
.admin-layout { display: flex; min-height: 100vh; }
.main { flex: 1; width: 100%; padding: 2rem 2.25rem 2.5rem; }
.manager-hero {
  display: flex; align-items: center; justify-content: space-between; gap: 1.25rem;
  padding: 1.4rem 1.6rem; border: 1px solid var(--admin-theme-border); border-radius: 8px;
  background: var(--admin-theme-surface); box-shadow: var(--admin-theme-shadow); margin-bottom: 1.5rem;
}
.manager-hero h1 { margin: 0 0 0.25rem; color: var(--admin-theme-contrast); font-size: 1.85rem; font-weight: 800; letter-spacing: -0.01em; }
.manager-title { display: grid; gap: 0.32rem; }
.manager-hero p { margin: 0; line-height: 1.6; }
.slide-selector { display: flex; flex-wrap: wrap; gap: 0.7rem; margin-bottom: 1rem; }
.selector-tab {
  display: flex; align-items: center; gap: 0.6rem; min-width: 180px;
  border: 1.5px solid var(--admin-theme-border); border-radius: 12px;
  background: var(--admin-theme-surface); padding: 0.5rem 0.9rem 0.5rem 0.5rem; cursor: pointer;
  text-align: left; transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease;
}
.selector-tab:hover { transform: translateY(-1px); }
.selector-tab.active { border-color: var(--admin-theme-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 15%, transparent); }
.selector-thumb { width: 2.6rem; height: 2.6rem; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: color-mix(in srgb, var(--admin-theme-surface-soft) 55%, var(--admin-theme-surface)); display: grid; place-items: center; }
.selector-copy { display: grid; gap: 0.15rem; min-width: 0; }
.selector-index { font-size: 0.68rem; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; color: var(--admin-theme-muted); }
.selector-tab.active .selector-index { color: var(--admin-theme-primary-deep); }

.slide-card { border: 1px solid var(--admin-theme-border); border-radius: 16px; background: var(--admin-theme-surface); box-shadow: var(--admin-theme-shadow); overflow: hidden; display: grid; align-content: start; }
.slide-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 1rem 1.4rem; color: #ffffff; background: var(--admin-theme-primary); }
.head-copy { min-width: 0; }
.slide-name { font-weight: 800; font-size: 1.05rem; }
.slide-subtitle { font-size: 0.7rem; letter-spacing: 0.02em; opacity: 0.85; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.slide-head-actions { display: flex; align-items: center; gap: 0.2rem; flex-shrink: 0; }
.slide-head-actions .v-btn { color: rgba(255,255,255,0.85); }
.slide-head-actions .v-btn:hover:not(:disabled) { color: #ffffff; background: rgba(255,255,255,0.15); }

.slide-body { padding: 1.4rem; display: grid; grid-template-columns: minmax(260px, 340px) 1fr; align-items: start; gap: 1.75rem; }
.media-column { display: grid; gap: 1rem; align-content: start; }
.fields-column { display: flex; flex-direction: column; gap: 1rem; }
.fields-column .flex-fill { flex: 1; }

.image-preview { position: relative; border: 2px dashed var(--admin-theme-border-strong); border-radius: 12px; min-height: 180px; display: grid; place-items: center; padding: 0.75rem; background: color-mix(in srgb, var(--admin-theme-surface-soft) 55%, var(--admin-theme-surface)); }
.image-empty { display: grid; gap: 0.35rem; justify-items: center; color: var(--admin-theme-muted); }
.pending-tag { position: absolute; top: 0.6rem; right: 0.6rem; background: #d9ad2f; color: #1d3d5c; font-size: 0.68rem; font-weight: 800; padding: 0.25rem 0.55rem; border-radius: 999px; }
:global(.admin-dark) .pending-tag { background: rgba(217, 173, 47, 0.85); color: #0c1f1a; }

.save-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 1rem; padding: 1rem 1.4rem; border: 1px solid var(--admin-theme-border); border-radius: 16px; background: var(--admin-theme-surface); box-shadow: var(--admin-theme-shadow); margin-top: 1rem; }
.save-message { margin: 0 auto 0 0; font-weight: 700; font-size: 0.9rem; }
.save-message.success { color: var(--admin-theme-primary-deep); }
.save-message.error { color: #be123c; }
:global(.admin-dark) .save-message.error { color: #fb7185; }

@media (min-width: 900px) { .admin-page.sidebar-open { padding-left: 260px; } }
@media (max-width: 760px) {
  .main { padding: 1rem; }
  .manager-hero { padding: 1.1rem; flex-direction: column; }
  .selector-tab { min-width: 0; flex: 1 1 100%; }
  .slide-body { grid-template-columns: 1fr; }
  .manager-hero h1 { font-size: 1.5rem; }
}
</style>
