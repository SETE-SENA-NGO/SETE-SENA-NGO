<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useMediaStore } from '@/stores/media.store'
import { useUiStore } from '@/stores/ui.store'
import { imageUploadHelpText } from '@/lib/media'

const media = useMediaStore()
const ui = useUiStore()

let dragCounter = 0
const fileInput = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const deleting = ref<string | null>(null)

onMounted(() => {
  void loadFiles()
})

async function loadFiles() {
  try {
    await media.list()
  } catch {
    ui.addToast('Could not load media files.', 'error')
  }
}

function openFilePicker() {
  fileInput.value?.click()
}

function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files?.length) return

  uploadFiles(Array.from(files))
  input.value = ''
}

function onDragEnter() {
  dragCounter++
  dragging.value = true
}

function onDragLeave() {
  dragCounter--
  if (dragCounter <= 0) {
    dragging.value = false
    dragCounter = 0
  }
}

function onDrop(event: DragEvent) {
  dragging.value = false
  dragCounter = 0
  const files = event.dataTransfer?.files
  if (files?.length) {
    uploadFiles(Array.from(files))
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

async function uploadFiles(files: File[]) {
  for (const file of files) {
    try {
      await media.upload(file)
      ui.addToast(`${file.name} uploaded.`, 'success')
    } catch {
      ui.addToast(`Failed to upload ${file.name}.`, 'error')
    }
  }
}

async function confirmDelete(item: { id: string; name: string }) {
  deleting.value = item.id

  ui.openModal(
    'Delete file?',
    `Remove "${item.name}" from the media library? This cannot be undone.`,
    async () => {
      try {
        await media.remove(item.id)
        ui.addToast('File deleted.', 'warning')
      } catch {
        ui.addToast('Failed to delete file.', 'error')
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
            <p class="page-desc">Upload, browse and manage website images.</p>
          </div>
          <div class="header-actions">
            <button
              class="button button-primary"
              type="button"
              :disabled="media.uploading"
              @click="openFilePicker"
            >
              {{ media.uploading ? 'Uploading...' : 'Upload files' }}
            </button>
          </div>
        </header>

        <input
          id="media-library-upload"
          ref="fileInput"
          name="media-library-upload"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          class="file-input-hidden"
          @change="onFilesSelected"
        />

        <!-- Upload progress -->
        <section v-if="media.uploading" class="upload-progress" aria-label="Upload progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <span>Uploading files...</span>
        </section>

        <!-- Drop zone -->
        <section
          :class="['drop-zone', { active: dragging }]"
          @dragenter.prevent="onDragEnter"
          @dragover.prevent="dragging = true"
          @dragleave="onDragLeave"
          @drop.prevent="onDrop"
          @click="openFilePicker"
        >
          <span class="drop-icon" aria-hidden="true"></span>
          <strong>Drop files here or click to browse</strong>
          <small>{{ imageUploadHelpText() }}</small>
        </section>

        <!-- Stats bar -->
        <section class="stats-bar" aria-label="Media library stats">
          <span
            ><strong>{{ media.items.length }}</strong> files</span
          >
          <span>
            <strong>{{ media.items.filter((f) => isImage(f.mime_type)).length }}</strong> images
          </span>
          <span
            ><strong>{{ formatSize(totalMediaSize) }}</strong> stored</span
          >
        </section>

        <!-- File grid -->
        <section v-if="media.items.length" class="file-grid" aria-label="Media files">
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
                aria-label="Open file"
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
        <section v-else-if="!media.uploading" class="empty-state" aria-label="No media">
          <span class="empty-icon" aria-hidden="true"></span>
          <strong>No media files yet</strong>
          <p>Drop files above or click the Upload button to get started.</p>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.media-page {
  --admin-bg: var(--admin-theme-bg);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-border: var(--admin-theme-border);
  --admin-blue: var(--admin-theme-teal);
  --admin-green: var(--admin-theme-primary);
  --admin-gold: var(--admin-theme-gold);
  --admin-pink: var(--admin-theme-danger);
  --admin-shadow: var(--admin-theme-shadow);

  min-height: 100vh;
  background: var(--admin-bg);
  color: var(--admin-text);
  transition: padding-left 0.25s ease;
}

:global(.admin-dark .media-page) {
  --admin-bg: var(--admin-theme-bg);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-border: var(--admin-theme-border);
  --admin-shadow: var(--admin-theme-shadow);
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
  color: var(--admin-blue);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 0.35rem;
  color: var(--admin-contrast);
  font-size: clamp(1.7rem, 3vw, 2.4rem);
}

.page-desc {
  margin: 0;
  color: var(--admin-muted);
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
  border: 1px solid var(--admin-blue);
  background: var(--admin-blue);
  color: #ffffff;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.22);
}

.file-input-hidden {
  display: none;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--admin-border);
  border-radius: 14px;
  background: var(--admin-surface);
  color: var(--admin-muted);
  font-weight: 800;
}

.progress-bar {
  width: 120px;
  height: 6px;
  border-radius: 999px;
  background: var(--admin-surface-soft);
  overflow: hidden;
}

.progress-fill {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: var(--admin-blue);
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
  border: 2px dashed var(--admin-border);
  border-radius: 20px;
  background: var(--admin-surface);
  color: var(--admin-muted);
  padding: 2.5rem 1rem;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
}

.drop-zone:hover,
.drop-zone.active {
  border-color: var(--admin-blue);
  background: color-mix(in srgb, var(--admin-blue) 4%, var(--admin-surface));
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
  color: var(--admin-contrast);
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
  border: 1px solid var(--admin-border);
  border-radius: 999px;
  background: var(--admin-surface);
  color: var(--admin-muted);
  padding: 0.35rem 0.7rem;
  font-size: 0.82rem;
  font-weight: 800;
}

.stats-bar strong {
  color: var(--admin-contrast);
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.file-card {
  display: grid;
  grid-template-rows: 170px auto auto;
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
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
  background: var(--admin-surface-soft);
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
  background: var(--admin-blue);
}
.type-video {
  background: #7c3aed;
}
.type-audio {
  background: var(--admin-green);
}
.type-pdf {
  background: #dc2626;
}
.type-doc {
  background: var(--admin-blue);
}
.type-sheet {
  background: var(--admin-green);
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
  color: var(--admin-contrast);
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
  color: var(--admin-muted);
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
  border: 1px solid var(--admin-border);
  background: var(--admin-surface);
  color: var(--admin-contrast);
  padding: 0.38rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.18s ease;
}

.icon-button.danger {
  border-color: rgba(220, 38, 38, 0.3);
  color: var(--admin-pink);
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
  color: var(--admin-muted);
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
  color: var(--admin-contrast);
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

  .file-grid {
    grid-template-columns: 1fr;
  }
}
</style>
