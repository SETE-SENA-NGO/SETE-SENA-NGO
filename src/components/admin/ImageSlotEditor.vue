<script setup lang="ts">
import { Image as ImageIcon, Trash2 } from 'lucide-vue-next'
import ImagePickerField from '@/components/admin/ImagePickerField.vue'

defineProps<{
  index: number
  badge: string
  hint: string
  alt: string
}>()

const emit = defineEmits<{
  clear: []
  saved: [message: string]
  error: [message: string]
}>()

const url = defineModel<string>({ default: '' })
</script>

<template>
  <article class="image-slot" :class="{ filled: !!url }">
    <header class="image-slot-header">
      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
      <div class="image-slot-heading">
        <h3>{{ badge }}</h3>
        <p>{{ hint }}</p>
      </div>
      <button v-if="url" type="button" class="icon-btn danger" aria-label="Remove image" @click="emit('clear')">
        <Trash2 :size="15" aria-hidden="true" />
      </button>
    </header>
    <div class="image-slot-body">
      <figure class="image-preview slot-preview">
        <img v-if="url" :src="url" :alt="alt" />
        <div v-else class="slot-empty">
          <ImageIcon :size="22" aria-hidden="true" />
          <span>No image set</span>
        </div>
      </figure>
      <ImagePickerField
        v-model="url"
        label="Upload or paste URL"
        hide-preview
        @success="(msg) => emit('saved', msg)"
        @error="(msg) => emit('error', msg)"
      />
    </div>
  </article>
</template>

<style scoped>
.image-slot {
  border: 1px solid var(--admin-theme-border);
  border-radius: 9px;
  background: var(--admin-theme-surface);
  overflow: hidden;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.image-slot.filled {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 30%, var(--admin-theme-border));
}

.image-slot:hover {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 35%, var(--admin-theme-border));
  box-shadow: 0 2px 8px color-mix(in srgb, var(--admin-theme-primary) 8%, transparent);
}

.image-slot-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 32%, var(--admin-theme-surface));
  padding: 0.7rem 0.8rem;
}

.item-number {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  border-radius: 6px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-primary-deep);
  font-size: 0.74rem;
  font-weight: 900;
}

.image-slot-heading {
  flex: 1;
  min-width: 0;
}

.image-slot-heading h3,
.image-slot-heading p {
  margin: 0;
}

.image-slot-heading h3 {
  color: var(--admin-theme-contrast);
  font-size: 0.86rem;
  font-weight: 900;
}

.image-slot-heading p {
  color: var(--admin-theme-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.image-slot-body {
  padding: 0.85rem;
  display: grid;
  gap: 0.65rem;
}

.image-preview {
  margin: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 26%, var(--admin-theme-border));
  border-radius: 7px;
  background: var(--admin-theme-surface-soft);
}

.slot-preview {
  aspect-ratio: 4 / 3;
}

.slot-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slot-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  color: var(--admin-theme-muted);
  opacity: 0.7;
  font-size: 0.76rem;
  font-weight: 700;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  min-height: 34px;
  border: 1px solid transparent;
  border-radius: 7px;
  padding: 0;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.icon-btn.danger {
  border-color: color-mix(in srgb, var(--admin-theme-danger) 60%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-danger) 9%, var(--admin-theme-surface));
  color: var(--admin-theme-danger);
}

.icon-btn.danger:hover {
  border-color: var(--admin-theme-danger);
  background: var(--admin-theme-danger);
  color: #ffffff;
}

@media (max-width: 900px) {
  .image-slot-header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
