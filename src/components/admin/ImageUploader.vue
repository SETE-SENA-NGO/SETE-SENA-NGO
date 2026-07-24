<script setup lang="ts">
import { ref } from 'vue'
import { useMediaStore } from '@/stores/media.store'
import { useUiStore } from '@/stores/ui.store'
import { imageUploadHelpText } from '@/lib/media'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'uploaded', item: { url: string; name: string }): void
}>()

const media = useMediaStore()
const ui = useUiStore()
const fileInput = ref<HTMLInputElement | null>(null)
const busy = ref(false)
const fileName = ref('')

function onSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  fileName.value = file.name
  busy.value = true
  media
    .upload(file)
    .then((item) => {
      emit('update:modelValue', item.url)
      emit('uploaded', { url: item.url, name: item.name })
      ui.addToast('Upload complete', 'success')
    })
    .catch(() => {
      fileName.value = ''
      ui.addToast('Upload failed', 'error')
    })
    .finally(() => {
      busy.value = false
    })

  input.value = ''
}
</script>

<template>
  <div class="image-uploader">
    <div v-if="props.modelValue" class="preview">
      <img :src="props.modelValue" alt="" />
    </div>

    <div class="upload-row">
      <label class="upload-btn" :class="{ 'is-busy': busy }" for="admin-image-upload">
        <svg v-if="!busy" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <svg v-else class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
          <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
        </svg>
        <span>{{ busy ? 'Uploading…' : 'Choose image' }}</span>
      </label>
      <input
        id="admin-image-upload"
        ref="fileInput"
        name="admin-image-upload"
        class="native-input"
        type="file"
        accept="image/*"
        :disabled="busy"
        @change="onSelect"
      />
      <span v-if="fileName && !busy" class="file-chip">{{ fileName }}</span>
    </div>

    <div class="hint">{{ imageUploadHelpText() }}</div>
  </div>
</template>

<style scoped>
.image-uploader {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.preview {
  width: 100%;
  max-width: 220px;
  border-radius: var(--radius-sm, 8px);
  overflow: hidden;
  border: 1px solid var(--border, #e8edf6);
}
.preview img {
  display: block;
  width: 100%;
  height: auto;
}

.upload-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
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

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.9rem;
  border-radius: var(--radius-sm, 8px);
  border: 1px solid var(--border-s, #d4dcee);
  background: var(--surface, #fff);
  color: var(--blue, #2563eb);
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
  user-select: none;
}
.upload-btn:hover {
  background: var(--blue-soft, #ecf2ff);
  border-color: var(--blue, #2563eb);
}
.upload-btn:active {
  transform: translateY(1px);
}
.upload-btn.is-busy {
  cursor: not-allowed;
  opacity: 0.7;
}
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.file-chip {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted, #6a7fa0);
  background: var(--bg, #f5f7fb);
  border: 1px solid var(--border, #e8edf6);
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hint {
  color: var(--muted, #6a7fa0);
  font-size: 0.85rem;
}
</style>