<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useMediaStore } from '@/stores/media.store'
import { useUiStore } from '@/stores/ui.store'

const media = useMediaStore()
const ui = useUiStore()

const deleting = ref<string | null>(null)
const imageUrl = ref('')
const imageName = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const savingUrl = ref(false)
const uploadingFile = ref(false)

onMounted(() => {
  void loadFiles()
})

async function loadFiles() {
  try {
    await media.list()
  } catch {
    ui.addToast('Could not load media URLs.', 'error')
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}

function fileIcon(mime: string) {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime.includes('pdf')) return 'pdf'
  if (mime.includes('word') || mime.includes('document')) return 'doc'
  if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('sheet'))
    return 'sheet'
  return 'file'
}

function isImage(mime: string) {
  return mime.startsWith('image/')
}

const totalMediaSize = computed(() => {
  return media.items.reduce((total, item) => total + item.size, 0)
})

async function addImageUrl() {
  if (savingUrl.value) return

  savingUrl.value = true
  try {
    await media.addUrl(imageUrl.value, imageName.value)
    ui.addToast('Image URL saved.', 'success')
    imageUrl.value = ''
    imageName.value = ''
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save image URL.', 'error')
  } finally {
    savingUrl.value = false
  }
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
}

async function uploadSelectedFile() {
  if (uploadingFile.value || !selectedFile.value) return

  uploadingFile.value = true
  try {
    await media.uploadToGoogleDrive(selectedFile.value, imageName.value)
    ui.addToast('Image uploaded to Google Drive.', 'success')
    selectedFile.value = null
    imageName.value = ''
    if (fileInputRef.value) fileInputRef.value.value = ''
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not upload image.', 'error')
  } finally {
    uploadingFile.value = false
  }
}

async function confirmDelete(item: { id: string; name: string }) {
  deleting.value = item.id

  ui.openModal(
    'Delete URL?',
    `Remove "${item.name}" from the media library? This cannot be undone.`,
    async () => {
      try {
        await media.remove(item.id)
        ui.addToast('URL deleted.', 'warning')
      } catch {
        ui.addToast('Failed to delete URL.', 'error')
      } finally {
        deleting.value = null
      }
    },
  )
}
</script>

<template>
  <div :class="['media-page', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="main">
        <header class="page-header">
          <div>
            <p class="eyebrow">Assets</p>
            <h1>Media Library</h1>
            <p class="page-desc">Upload images to Google Drive or save public image URLs.</p>
          </div>
        </header>

        <form
          class="url-form upload-form"
          aria-label="Upload image to Google Drive"
          @submit.prevent="uploadSelectedFile"
        >
          <label class="url-field upload-file-field">
            <span>Upload image</span>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              required
              @change="onFileSelected"
            />
          </label>
          <label class="url-field">
            <span>Display name</span>
            <input v-model="imageName" placeholder="Homepage hero" />
          </label>
          <button
            class="button button-primary"
            type="submit"
            :disabled="uploadingFile || !selectedFile"
          >
            {{ uploadingFile ? 'Uploading...' : 'Upload to Drive' }}
          </button>
          <p>
            Uses the Netlify Google Drive upload function. Configure the required Netlify secrets
            before using this upload button.
          </p>
        </form>

        <form class="url-form" aria-label="Add Google Drive image URL" @submit.prevent="addImageUrl">
          <label class="url-field">
            <span>Image URL</span>
            <input
              v-model="imageUrl"
              type="url"
              placeholder="https://drive.google.com/file/d/.../view"
              required
            />
          </label>
          <label class="url-field">
            <span>Display name</span>
            <input v-model="imageName" placeholder="Homepage hero" />
          </label>
          <button class="button button-primary" type="submit" :disabled="savingUrl">
            {{ savingUrl ? 'Saving...' : 'Add URL' }}
          </button>
          <p>{{ media.urlHelpText() }}</p>
        </form>

        <!-- Stats bar -->
        <section class="stats-bar" aria-label="Media library stats">
          <span
            ><strong>{{ media.items.length }}</strong> URLs</span
          >
          <span>
            <strong>{{ media.items.filter((f) => isImage(f.mime_type)).length }}</strong> images
          </span>
          <span
            ><strong>{{ formatSize(totalMediaSize) }}</strong> stored</span
          >
        </section>

        <!-- URL grid -->
        <section v-if="media.items.length" class="file-grid" aria-label="Media URLs">
          <article v-for="item in media.items" :key="item.id" class="file-card">
            <div class="file-thumb">
              <img v-if="isImage(item.mime_type)" :src="item.url" :alt="item.name" loading="lazy" />
              <span v-else class="file-type-icon" :class="`type-${fileIcon(item.mime_type)}`">
                {{ fileIcon(item.mime_type).toUpperCase() }}
              </span>
            </div>
            <div class="file-info">
              <strong :title="item.name">{{ item.name }}</strong>
              <div class="file-meta">
                <small>{{ formatSize(item.size) }}</small>
                <small v-if="item.created_at">{{ formatDate(item.created_at) }}</small>
              </div>
            </div>
            <div class="file-actions">
              <a
                v-if="item.url"
                :href="item.url"
                target="_blank"
                class="icon-button"
                aria-label="Open URL"
              >
                Open
              </a>
              <button
                type="button"
                class="icon-button danger"
                :disabled="deleting === item.id"
                @click="confirmDelete(item)"
              >
                Delete
              </button>
            </div>
          </article>
        </section>

        <!-- Empty state -->
        <section v-else-if="!media.saving" class="empty-state" aria-label="No media">
          <span class="empty-icon" aria-hidden="true"></span>
          <strong>No media URLs yet</strong>
          <p>Paste a public Google Drive image URL above to get started.</p>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.media-page {
  min-height: 100vh;
  background: var(--admin-theme-bg);
  color: var(--admin-theme-text);
  transition: padding-left 0.25s ease;
}

.admin-layout {
  display: flex;
}

.main {
  flex: 1;
  width: 100%;
  padding: 1.25rem 2rem 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.eyebrow {
  margin: 0 0 0.45rem;
  color: var(--admin-theme-teal);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 0.35rem;
  color: var(--admin-theme-contrast);
  font-size: clamp(1.7rem, 3vw, 2.4rem);
}

.page-desc {
  margin: 0;
  color: var(--admin-theme-muted);
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 0.55rem;
  flex-shrink: 0;
}

.button {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 0.62rem 1rem;
  font-weight: 850;
  cursor: pointer;
  text-decoration: none;
  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.button-primary {
  border: 1px solid var(--admin-theme-teal);
  background: var(--admin-theme-teal);
  color: #ffffff;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.22);
}

.url-form {
  display: grid;
  grid-template-columns: minmax(260px, 1.5fr) minmax(180px, 0.8fr) auto;
  gap: 0.8rem;
  align-items: end;
  margin-bottom: 1rem;
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: var(--admin-surface);
  padding: 1rem;
  box-shadow: var(--admin-shadow);
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 14px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-muted);
  font-weight: 800;
}

.progress-bar {
  width: 120px;
  height: 6px;
  border-radius: 999px;
  background: var(--admin-theme-surface-soft);
  overflow: hidden;
}

.progress-fill {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: var(--admin-theme-teal);
  animation: progress-pulse 1.2s ease-in-out infinite;
}

@keyframes progress-pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.drop-zone {
  display: grid;
  justify-items: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
  border: 2px dashed var(--admin-theme-border);
  border-radius: 20px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-muted);
  padding: 2.5rem 1rem;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
}

.drop-zone:hover,
.drop-zone.active {
  border-color: var(--admin-theme-teal);
  background: color-mix(in srgb, var(--admin-theme-teal) 4%, var(--admin-theme-surface));
}

.drop-icon {
  width: 2rem;
  height: 2rem;
  border: 2px solid currentColor;
  border-radius: 999px;
  position: relative;
}

.drop-icon::after {
  position: absolute;
  inset: 0.2rem;
  background:
    linear-gradient(currentColor, currentColor) center / 0.7rem 2px no-repeat,
    linear-gradient(currentColor, currentColor) center / 2px 0.7rem no-repeat;
  content: '';
}

.drop-zone strong {
  color: var(--admin-theme-contrast);
  font-size: 1rem;
}

.drop-zone small {
  font-size: 0.82rem;
}

.stats-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.stats-bar span {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 999px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-muted);
  padding: 0.35rem 0.7rem;
  font-size: 0.82rem;
  font-weight: 800;
}

.stats-bar strong {
  color: var(--admin-theme-contrast);
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.file-card {
  display: grid;
  grid-template-rows: 170px auto auto;
  border: 1px solid var(--admin-theme-border);
  border-radius: 16px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
  overflow: hidden;
  transition:
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.file-card:hover {
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
  transform: translateY(-2px);
}

.file-thumb {
  display: grid;
  place-items: center;
  background: var(--admin-theme-surface-soft);
  overflow: hidden;
  position: relative;
}

.file-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-type-icon {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 900;
  color: #ffffff;
}

.type-image {
  background: var(--admin-theme-teal);
}
.type-video {
  background: #7c3aed;
}
.type-audio {
  background: var(--admin-theme-primary);
}
.type-pdf {
  background: #dc2626;
}
.type-doc {
  background: var(--admin-theme-teal);
}
.type-sheet {
  background: var(--admin-theme-primary);
}
.type-file {
  background: #64748b;
}

.file-info {
  display: grid;
  gap: 0.2rem;
  padding: 0.75rem 0.85rem;
}

.file-info strong {
  min-width: 0;
  overflow: hidden;
  color: var(--admin-theme-contrast);
  font-size: 0.88rem;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  gap: 0.6rem;
}

.file-meta small {
  color: var(--admin-theme-muted);
  font-size: 0.76rem;
  font-weight: 800;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 0.85rem 0.75rem;
}

.icon-button {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--admin-theme-border);
  background: var(--admin-theme-surface);
  color: var(--admin-theme-contrast);
  padding: 0.38rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.18s ease;
}

.icon-button.danger {
  border-color: rgba(220, 38, 38, 0.3);
  color: var(--admin-theme-danger);
}

.icon-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--admin-theme-muted);
}

.empty-icon {
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid currentColor;
  border-radius: 999px;
  position: relative;
}

.empty-icon::after {
  position: absolute;
  inset: 0.25rem;
  background:
    linear-gradient(currentColor, currentColor) center / 0.9rem 2px no-repeat,
    linear-gradient(currentColor, currentColor) center / 2px 0.9rem no-repeat;
  content: '';
}

.empty-state strong {
  color: var(--admin-theme-contrast);
  font-size: 1.05rem;
}

.empty-state p {
  margin: 0;
  max-width: 340px;
  line-height: 1.6;
}

@media (min-width: 900px) {
  .media-page.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 720px) {
  .main {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
  }

  .url-form {
    grid-template-columns: 1fr;
  }

  .file-grid {
    grid-template-columns: 1fr;
  }
}
</style>
