<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

defineProps<{
  title: string
  kicker: string
  headingId: string
}>()

const expanded = defineModel<boolean>('expanded', { default: true })

function toggle() {
  expanded.value = !expanded.value
}
</script>

<template>
  <section class="editor-panel" :aria-labelledby="headingId">
    <div class="panel-header">
      <div class="panel-header-left panel-header-left-clickable" @click="toggle">
        <div class="panel-icon-wrap">
          <slot name="icon" />
        </div>
        <div>
          <p class="panel-kicker">{{ kicker }}</p>
          <h2 :id="headingId">{{ title }}</h2>
        </div>
      </div>
      <div class="panel-header-actions">
        <slot name="actions" />
        <button
          type="button"
          class="icon-btn icon-btn-ghost"
          aria-label="Toggle panel"
          :aria-expanded="expanded"
          @click="toggle"
        >
          <ChevronDown :size="18" class="chevron" :class="{ 'chevron-up': !expanded }" />
        </button>
      </div>
    </div>
    <Transition name="collapse">
      <div v-show="expanded" class="panel-body">
        <slot />
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.editor-panel {
  overflow: hidden;
  border: 1px solid var(--admin-theme-border);
  border-radius: 10px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
  transition: box-shadow 0.2s ease;
}

.editor-panel:hover {
  box-shadow:
    var(--admin-theme-shadow),
    0 2px 8px color-mix(in srgb, var(--admin-theme-primary) 6%, transparent);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--admin-theme-surface-soft) 60%, var(--admin-theme-surface)) 0%,
    color-mix(in srgb, var(--admin-theme-primary) 4%, var(--admin-theme-surface)) 100%
  );
  padding: 0.8rem 1rem;
}

.panel-header h2 {
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 1rem;
  font-weight: 850;
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.panel-header-left-clickable {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.panel-header-left-clickable:hover {
  opacity: 0.78;
}

.panel-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.panel-icon-wrap {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 8px;
  background: color-mix(in srgb, var(--admin-theme-primary) 12%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.panel-kicker {
  margin: 0;
  color: var(--admin-theme-primary-deep);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.panel-body {
  padding: 1rem;
}

.chevron {
  flex-shrink: 0;
  color: var(--admin-theme-muted);
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.chevron-up {
  transform: rotate(-180deg);
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  min-height: 32px;
  border: 1px solid transparent;
  border-radius: 7px;
  padding: 0;
  font: inherit;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.icon-btn.icon-btn-ghost {
  border-color: transparent;
  background: transparent;
  color: var(--admin-theme-muted);
}

.icon-btn.icon-btn-ghost:hover {
  color: var(--admin-theme-primary-deep);
  background: color-mix(in srgb, var(--admin-theme-primary) 8%, transparent);
}

.collapse-enter-active {
  transition: opacity 0.2s ease, max-height 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

.collapse-leave-active {
  transition: opacity 0.15s ease, max-height 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 6000px;
}

:global(.admin-dark) .panel-header {
  background: linear-gradient(
    135deg,
    var(--admin-theme-surface) 0%,
    color-mix(in srgb, var(--admin-theme-primary) 6%, var(--admin-theme-surface)) 100%
  );
}

@media (max-width: 900px) {
  .panel-header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
