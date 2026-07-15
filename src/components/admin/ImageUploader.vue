<script setup lang="ts">
import { ref } from 'vue'
import { useMediaStore } from '@/stores/media.store'
import { useUiStore } from '@/stores/ui.store'
import { imageUploadHelpText } from '@/lib/media'

const media = useMediaStore()
const ui = useUiStore()
const fileInput = ref<HTMLInputElement | null>(null)

function onSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  media
    .upload(file)
    .then(() => ui.addToast('Upload complete', 'success'))
    .catch(() => ui.addToast('Upload failed', 'error'))
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="image-uploader">
    <input ref="fileInput" type="file" accept="image/*" @change="onSelect" />
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
.hint {
  color: var(--muted);
  font-size: 0.85rem;
}
</style>
