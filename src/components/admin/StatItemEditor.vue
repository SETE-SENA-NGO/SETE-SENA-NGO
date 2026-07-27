<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'

defineProps<{
  index: number
}>()

defineEmits<{
  remove: []
}>()

const stat = defineModel<{ number: string; label: string; description: string }>({ required: true })
</script>

<template>
  <article class="sub-editor">
    <header class="sub-editor-header">
      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
      <h3>Stat {{ index + 1 }}</h3>
      <button type="button" class="icon-btn danger" aria-label="Remove stat" @click="$emit('remove')">
        <Trash2 :size="15" aria-hidden="true" />
      </button>
    </header>
    <div class="sub-editor-body form-grid">
      <label class="field">
        <span>Number</span>
        <input v-model="stat.number" type="text" placeholder="e.g. 120+" />
      </label>
      <label class="field">
        <span>Label</span>
        <input v-model="stat.label" type="text" placeholder="e.g. PRE-SCHOOL CHILDREN" />
      </label>
      <label class="field wide">
        <span>Description</span>
        <input v-model="stat.description" type="text" placeholder="Brief description of this statistic" />
      </label>
    </div>
  </article>
</template>

<style scoped>
.sub-editor {
  border: 1px solid var(--admin-theme-border);
  border-radius: 9px;
  background: var(--admin-theme-surface);
  overflow: hidden;
  transition: border-color 0.18s ease;
}

.sub-editor:hover {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 30%, var(--admin-theme-border));
}

.sub-editor-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--admin-theme-surface-soft) 40%, var(--admin-theme-surface)) 0%,
    color-mix(in srgb, var(--admin-theme-primary) 3%, var(--admin-theme-surface)) 100%
  );
  padding: 0.75rem 0.85rem;
}

.sub-editor-header h3 {
  flex: 1;
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 0.94rem;
  font-weight: 900;
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

.sub-editor-body {
  padding: 0.9rem;
  display: grid;
  gap: 0.75rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.wide {
  grid-column: 1 / -1;
}

.field {
  display: grid;
  gap: 0.35rem;
  color: var(--admin-theme-muted);
  font-size: 0.78rem;
  font-weight: 800;
}

.field span {
  color: var(--admin-theme-contrast-soft);
}

.field input {
  width: 100%;
  border: 1px solid var(--admin-theme-border-strong);
  border-radius: 7px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-text);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.65rem 0.75rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field input:focus {
  border-color: var(--admin-theme-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 15%, transparent);
  outline: none;
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
  .sub-editor-header {
    align-items: stretch;
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
