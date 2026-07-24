<script setup lang="ts">
import { ref } from 'vue'
import { useMediaStore } from '@/stores/media.store'
import { normalizeMediaUrl } from '@/lib/media'

const props = defineProps<{
  label: string
  hint?: string
  placeholder?: string
  hidePreview?: boolean
}>()

const emit = defineEmits<{
  success: [message: string]
  error: [message: string]
}>()

const modelValue = defineModel<string>({ default: '' })

const media = useMediaStore()
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const dragActive = ref(false)

function openFilePicker() {
  fileInputRef.value?.click()
}

async function handleFile(file: File | undefined | null) {
  if (!file || uploading.value) return

  uploading.value = true
  try {
    const item = await media.uploadToGoogleDrive(file)
    modelValue.value = item.url
    emit('success', 'Image uploaded to Google Drive.')
  } catch (error) {
    emit('error', error instanceof Error ? error.message : 'Could not upload image.')
  } finally {
    uploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  void handleFile(input.files?.[0])
}

function onDrop(event: DragEvent) {
  dragActive.value = false
  void handleFile(event.dataTransfer?.files?.[0])
}

function onUrlBlur() {
  if (modelValue.value) modelValue.value = normalizeMediaUrl(modelValue.value)
}
</script>

<template>
  <div class="img-picker">
    <span class="field-label">{{ props.label }}</span>

    <div
      class="drop-zone"
      :class="{ active: dragActive, busy: uploading }"
      @click="openFilePicker"
      @dragover.prevent="dragActive = true"
      @dragleave.prevent="dragActive = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="visually-hidden"
        @change="onFileSelected"
        @click.stop
      />
      <template v-if="uploading">
        <span class="drop-status">Uploading to Google Drive...</span>
      </template>
      <template v-else>
        <span class="drop-status"
          >Drop an image here or <strong>click to upload from your computer</strong></span
        >
        <span class="drop-hint">Saved straight to Google Drive.</span>
      </template>
    </div>

    <label class="field field-block url-field">
      <span class="field-label">Or paste a Google Drive / image URL</span>
      <input
        v-model="modelValue"
        type="url"
        :placeholder="props.placeholder || 'https://drive.google.com/file/d/.../view'"
        @blur="onUrlBlur"
      />
      <span v-if="props.hint" class="field-hint">{{ props.hint }}</span>
    </label>

    <div v-if="modelValue && !props.hidePreview" class="preview-wrap">
      <div class="img-preview-box">
        <img :src="modelValue" :alt="props.label" class="img-preview" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.img-picker {
  display: grid;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--admin-theme-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.field-hint {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--admin-theme-muted);
  font-style: italic;
  text-transform: none;
  letter-spacing: normal;
}

.field {
  display: grid;
  gap: 0.25rem;
}

.field input {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 10px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-contrast);
  font-size: 0.88rem;
  font-family: inherit;
  width: 100%;
  transition: border-color 0.15s ease;
}

.field input:focus {
  outline: none;
  border-color: var(--admin-theme-teal);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-theme-teal) 25%, transparent);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.drop-zone {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 0.25rem;
  border: 2px dashed var(--admin-theme-border);
  border-radius: 14px;
  background: var(--admin-theme-surface-soft, var(--admin-theme-surface));
  color: var(--admin-theme-muted);
  padding: 1.1rem 1rem;
  cursor: pointer;
  text-align: center;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;
}

.drop-zone:hover,
.drop-zone.active {
  border-color: var(--admin-theme-teal);
  background: color-mix(in srgb, var(--admin-theme-teal) 5%, var(--admin-theme-surface));
}

.drop-zone.busy {
  cursor: wait;
  opacity: 0.75;
}

.drop-status {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--admin-theme-contrast);
}

.drop-status strong {
  color: var(--admin-theme-teal);
}

.drop-hint {
  font-size: 0.72rem;
  color: var(--admin-theme-muted);
}

.preview-wrap {
  margin-top: 0.25rem;
}

.img-preview-box {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--admin-theme-border);
  max-width: 500px;
}

.img-preview {
  width: 100%;
  max-height: 240px;
  object-fit: contain;
  display: block;
  background: #f0f0f0;
}
</style>
