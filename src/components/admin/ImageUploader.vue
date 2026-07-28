<script setup lang="ts">
import { ref, useId } from 'vue'
import { useMediaStore } from '@/stores/media.store'
import { useUiStore } from '@/stores/ui.store'
import { imageUploadHelpText, isAllowedImageFile } from '@/lib/media'

const props = defineProps<{
  modelValue?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'uploaded', item: { url: string; name: string }): void
}>()

const media = useMediaStore()
const ui = useUiStore()
const inputId = `admin-image-upload-${useId()}`
const fileInput = ref<HTMLInputElement | null>(null)
const busy = ref(false)
const isDragging = ref(false)
// Counts drag-enter/leave events (rather than tracking a single boolean) so
// dragging over a child element inside the dropzone doesn't flicker the
// highlighted state off when the pointer briefly "leaves" that child.
let dragDepth = 0

async function uploadFile(file: File) {
  if (!isAllowedImageFile(file)) {
    ui.addToast(`Can't use that file. ${imageUploadHelpText()}`, 'error')
    return
  }

  busy.value = true
  try {
    const item = await media.upload(file)
    emit('update:modelValue', item.url)
    emit('uploaded', { url: item.url, name: item.name })
    ui.addToast('Upload complete', 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Upload failed', 'error')
  } finally {
    busy.value = false
  }
}

function onSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  void uploadFile(file)
}

function openPicker() {
  if (busy.value || props.disabled) return
  fileInput.value?.click()
}

function onDragEnter(e: DragEvent) {
  if (busy.value || props.disabled || !e.dataTransfer?.types.includes('Files')) return
  dragDepth += 1
  isDragging.value = true
}

function onDragLeave() {
  if (dragDepth > 0) dragDepth -= 1
  if (dragDepth === 0) isDragging.value = false
}

function onDrop(e: DragEvent) {
  dragDepth = 0
  isDragging.value = false
  if (busy.value || props.disabled) return
  const file = e.dataTransfer?.files?.[0]
  if (file) void uploadFile(file)
}

function removeImage() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="image-uploader">
    <div
      :class="['dropzone', { 'has-image': !!props.modelValue, dragging: isDragging, busy, disabled: props.disabled }]"
      role="button"
      :tabindex="props.disabled ? -1 : 0"
      :aria-disabled="props.disabled"
      :aria-label="props.modelValue ? 'Replace image' : 'Upload image'"
      @click="openPicker"
      @keydown.enter="openPicker"
      @keydown.space.prevent="openPicker"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <img v-if="props.modelValue" :src="props.modelValue" alt="" class="preview-image" />
      <div v-else class="empty-state">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p class="empty-title">Click to upload or drag and drop</p>
        <p class="empty-hint">{{ imageUploadHelpText() }}</p>
      </div>

      <div v-if="busy" class="busy-overlay">
        <svg class="spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
        </svg>
        <span>Uploading…</span>
      </div>
    </div>

    <input
      :id="inputId"
      ref="fileInput"
      :name="inputId"
      class="native-input"
      type="file"
      accept="image/*"
      :disabled="busy || props.disabled"
      @change="onSelect"
    />

    <div class="action-row">
      <button type="button" class="text-btn" :disabled="busy || props.disabled" @click="openPicker">
        {{ props.modelValue ? 'Replace image' : 'Choose image' }}
      </button>
      <button v-if="props.modelValue" type="button" class="text-btn danger" :disabled="busy || props.disabled" @click="removeImage">
        Remove image
      </button>
    </div>
    <div v-if="props.modelValue" class="hint">{{ imageUploadHelpText() }}</div>
  </div>
</template>

<style scoped>
.image-uploader {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 1rem;
}

.dropzone {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 160px;
  border: 2px dashed var(--admin-theme-border-strong, #aecdbe);
  border-radius: 12px;
  background: var(--admin-theme-surface-soft, #eef7f2);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.dropzone:hover,
.dropzone:focus-visible {
  border-color: var(--admin-theme-primary, #159a57);
}

.dropzone:focus-visible {
  outline: 2px solid var(--admin-theme-primary, #159a57);
  outline-offset: 2px;
}

.dropzone.dragging {
  border-color: var(--admin-theme-primary, #159a57);
  background: color-mix(in srgb, var(--admin-theme-primary, #159a57) 10%, var(--admin-theme-surface, #fff));
}

.dropzone.has-image {
  border-style: solid;
  background: var(--admin-theme-surface, #fff);
}

.dropzone.busy {
  cursor: wait;
}

.dropzone.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.dropzone.disabled:hover {
  border-color: var(--admin-theme-border-strong, #aecdbe);
}

.preview-image {
  display: block;
  width: 100%;
  max-height: 260px;
  object-fit: contain;
  background: var(--admin-theme-surface, #fff);
}

.empty-state {
  display: grid;
  justify-items: center;
  gap: 0.3rem;
  padding: 1.75rem 1.25rem;
  color: var(--admin-theme-muted, #678074);
  text-align: center;
}

.empty-title {
  margin: 0;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--admin-theme-contrast-soft, #245241);
}

.empty-hint {
  margin: 0;
  font-size: 0.78rem;
}

.busy-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: color-mix(in srgb, var(--admin-theme-surface, #fff) 82%, transparent);
  color: var(--admin-theme-primary-deep, #0b6b4c);
  font-weight: 700;
  font-size: 0.85rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.native-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.text-btn {
  border: none;
  background: none;
  padding: 0;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--admin-theme-primary-deep, #0b6b4c);
  cursor: pointer;
}

.text-btn:hover:not(:disabled) {
  text-decoration: underline;
}

.text-btn:disabled {
  color: var(--admin-theme-muted, #678074);
  cursor: not-allowed;
}

.text-btn.danger {
  color: var(--admin-theme-danger, #d14343);
}

.hint {
  color: var(--admin-theme-muted, #678074);
  font-size: 0.78rem;
}
</style>
