<script setup lang="ts">
import { ref } from 'vue'
import { normalizeMediaUrl } from '@/lib/media'
import { useMediaStore } from '@/stores/media.store'
import { useUiStore } from '@/stores/ui.store'

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    description?: string
    label?: string
    uploadingLabel?: string
  }>(),
  {
    disabled: false,
    description: 'image',
    label: 'Upload image',
    uploadingLabel: 'Uploading...',
  },
)

const emit = defineEmits<{ 'update:modelValue': [url: string] }>()

const media = useMediaStore()
const ui = useUiStore()
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

async function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const uploaded = await media.uploadToGoogleDrive(file, props.description)
    emit('update:modelValue', normalizeMediaUrl(uploaded.url))
    ui.addToast('Image uploaded.', 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not upload image.', 'error')
  } finally {
    uploading.value = false
    input.value = ''
  }
}

function triggerUpload() {
  fileInput.value?.click()
}
</script>

<template>
  <div class="upload-wrapper">
    <div
      class="upload-btn"
      role="button"
      tabindex="0"
      :aria-label="uploading ? uploadingLabel : label"
      @click="triggerUpload"
      @keydown.enter.prevent="triggerUpload"
      @keydown.space.prevent="triggerUpload"
    >
      <v-icon size="18">mdi-cloud-upload-outline</v-icon>
      <span>{{ uploading ? uploadingLabel : label }}</span>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="upload-input"
      :disabled="disabled || uploading"
      @change="onChange"
      aria-hidden="true"
      tabindex="-1"
    />
  </div>
</template>

<style scoped>
.upload-wrapper {
  display: flex;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--admin-theme-primary) 12%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
  padding: 0.65rem 1rem;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.upload-btn:hover {
  background: color-mix(in srgb, var(--admin-theme-primary) 20%, var(--admin-theme-surface));
}

.upload-btn:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--admin-theme-primary) 20%, transparent);
  outline-offset: 2px;
}

.upload-btn:active {
  transform: scale(0.98);
}

.upload-wrapper:has(.upload-input:disabled) .upload-btn {
  cursor: not-allowed;
  color: var(--admin-theme-muted);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 55%, var(--admin-theme-surface));
}

.upload-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
