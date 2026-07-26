<script setup lang="ts">
import { computed } from 'vue'

// A plain (non-model) prop is intentional here: sections are a fixed set (no add/remove/replace),
// so the child only ever mutates fields in place on the same object reference — no need for
// v-model's replace-the-whole-value semantics.
const props = defineProps<{
  section: { id: string; label: string; heading: string; body: string; items: string }
}>()

const parsedItems = computed<string[]>(() =>
  props.section.items ? props.section.items.split('\n').map((l) => l.trim()).filter(Boolean) : [],
)
</script>

<template>
  <article class="sub-editor">
    <header class="sub-editor-header">
      <span class="section-badge">{{ props.section.label }}</span>
      <h3>{{ props.section.heading || 'No heading yet' }}</h3>
    </header>
    <div class="sub-editor-body">
      <label class="field wide">
        <span>Heading</span>
        <input v-model="props.section.heading" type="text" :placeholder="'Heading for ' + props.section.label" />
      </label>
      <label class="field wide">
        <span>Body / description</span>
        <textarea v-model="props.section.body" rows="3" :placeholder="'Description for ' + props.section.label"></textarea>
      </label>
      <label class="field wide">
        <span>Bullet items <em>(one per line)</em></span>
        <textarea
          v-model="props.section.items"
          rows="5"
          placeholder="Community pre-schools&#10;Mobile libraries&#10;Scholarships for poor children"
        ></textarea>
      </label>
      <div v-if="parsedItems.length" class="item-chips">
        <span v-for="item in parsedItems" :key="item" class="item-chip">{{ item }}</span>
      </div>
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

.section-badge {
  flex-shrink: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--admin-theme-primary) 14%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
  padding: 0.2rem 0.6rem;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sub-editor-body {
  padding: 0.9rem;
  display: grid;
  gap: 0.75rem;
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

.field em {
  font-style: normal;
  color: var(--admin-theme-muted);
  font-weight: 600;
}

.field input,
.field textarea {
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

.field textarea {
  resize: vertical;
  line-height: 1.5;
}

.field input:focus,
.field textarea:focus {
  border-color: var(--admin-theme-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 15%, transparent);
  outline: none;
}

.wide {
  grid-column: 1 / -1;
}

.item-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding-top: 0.15rem;
}

.item-chip {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--admin-theme-primary) 12%, var(--admin-theme-surface));
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 18%, var(--admin-theme-border));
  color: var(--admin-theme-primary-deep);
  font-size: 0.73rem;
  font-weight: 700;
  line-height: 1.3;
}
</style>
