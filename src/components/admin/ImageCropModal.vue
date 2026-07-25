<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

const props = defineProps<{
  imageSrc: string
  fileName: string
  mimeType: string
}>()

const emit = defineEmits<{
  confirm: [file: File]
  cancel: []
}>()

const imageEl = ref<HTMLImageElement | null>(null)
let cropper: Cropper | null = null

onMounted(() => {
  if (!imageEl.value) return
  cropper = new Cropper(imageEl.value, {
    viewMode: 1,
    autoCropArea: 1,
    background: false,
    responsive: true,
    guides: true,
    center: true,
    dragMode: 'move',
  })
})

onBeforeUnmount(() => {
  cropper?.destroy()
  cropper = null
})

function rotate(deg: number) {
  cropper?.rotate(deg)
}

function zoom(delta: number) {
  cropper?.zoom(delta)
}

function reset() {
  cropper?.reset()
}

function confirm() {
  if (!cropper) return
  const canvas = cropper.getCroppedCanvas({
    maxWidth: 1600,
    maxHeight: 1600,
    imageSmoothingQuality: 'high',
  })
  canvas.toBlob(
    (blob) => {
      if (!blob) return
      emit('confirm', new File([blob], props.fileName, { type: props.mimeType }))
    },
    props.mimeType,
    0.92,
  )
}
</script>

<template>
  <div class="crop-overlay" @click.self="emit('cancel')">
    <div class="crop-panel">
      <header class="crop-header">
        <h2>Crop QR image</h2>
        <p>Drag to reposition, resize the box to crop, then confirm.</p>
      </header>

      <div class="crop-stage">
        <img ref="imageEl" :src="imageSrc" alt="Image to crop" class="crop-image" />
      </div>

      <div class="crop-tools">
        <button type="button" class="tool-btn" @click="rotate(-90)">Rotate left</button>
        <button type="button" class="tool-btn" @click="rotate(90)">Rotate right</button>
        <button type="button" class="tool-btn" @click="zoom(0.1)">Zoom in</button>
        <button type="button" class="tool-btn" @click="zoom(-0.1)">Zoom out</button>
        <button type="button" class="tool-btn" @click="reset">Reset</button>
      </div>

      <footer class="crop-actions">
        <button type="button" class="cancel-btn" @click="emit('cancel')">Cancel</button>
        <button type="button" class="confirm-btn" @click="confirm">Use this crop</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.crop-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 20, 25, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 1100;
}

.crop-panel {
  background: var(--admin-surface, #fff);
  border-radius: 16px;
  padding: 1.5rem;
  width: min(640px, 100%);
  max-height: 90vh;
  display: grid;
  gap: 1rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
}

.crop-header h2 {
  margin: 0 0 0.25rem;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--admin-contrast, #1d3d5c);
}

.crop-header p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--admin-muted, #6b7280);
}

.crop-stage {
  height: min(50vh, 420px);
  background: #111;
  border-radius: 10px;
  overflow: hidden;
}

.crop-image {
  display: block;
  max-width: 100%;
}

.crop-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tool-btn {
  min-height: 38px;
  border: 1.5px solid var(--admin-border-strong, #cbd5e1);
  border-radius: 8px;
  background: var(--admin-surface-soft, #f8fafc);
  color: var(--admin-text, #1f2937);
  padding: 0.4rem 0.85rem;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.tool-btn:hover {
  background: var(--admin-border, #e2e8f0);
}

.crop-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--admin-border, #e2e8f0);
}

.cancel-btn {
  min-height: 44px;
  border: 1.5px solid rgba(225, 29, 72, 0.35);
  border-radius: 10px;
  background: rgba(225, 29, 72, 0.06);
  color: #be123c;
  padding: 0.5rem 1.25rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}

.confirm-btn {
  min-height: 44px;
  border: 1px solid var(--admin-blue, #16a34a);
  border-radius: 10px;
  background: linear-gradient(180deg, var(--admin-blue, #16a34a), var(--admin-blue-deep, #15803d));
  color: #fff;
  padding: 0.5rem 1.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
}
</style>
