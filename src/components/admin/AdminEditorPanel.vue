<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    kicker: string
    heading: string
    editing: boolean
    collapsed?: boolean
  }>(),
  { collapsed: false },
)

const emit = defineEmits<{
  'toggle-edit': []
  cancel: []
  'toggle-collapse': []
}>()
</script>

<template>
  <v-card :id="id" :class="['editor-panel', 'section-group', { editing }]">
    <v-toolbar density="comfortable" flat class="panel-toolbar">
      <template #title>
        <div>
          <p class="panel-kicker">{{ kicker }}</p>
          <h2 class="text-h6 font-weight-bold mb-0">{{ heading }}</h2>
        </div>
      </template>
      <template #append>
        <div class="toolbar-actions">
          <v-btn icon variant="text" size="small" @click="emit('toggle-collapse')" title="Collapse / expand">
            <v-icon :class="{ 'rotate-neg-90': collapsed }">mdi-chevron-down</v-icon>
          </v-btn>
          <span class="toolbar-divider" aria-hidden="true"></span>
          <v-fade-transition mode="out-in">
            <v-btn v-if="!editing" key="edit" color="secondary" size="small" @click="emit('toggle-edit')">
              <v-icon start>mdi-pencil</v-icon>
              Edit
            </v-btn>
            <div v-else key="editing" class="edit-actions">
              <v-btn variant="tonal" size="small" @click="emit('cancel')">Cancel</v-btn>
              <v-btn color="primary" variant="flat" size="small" @click="emit('toggle-edit')">
                <v-icon start>mdi-check</v-icon>
                Done
              </v-btn>
            </div>
          </v-fade-transition>
          <slot name="actions" :editing="editing" />
        </div>
      </template>
    </v-toolbar>
    <v-divider />

    <v-expand-transition>
      <div v-show="!collapsed" class="panel-collapsible">
        <slot />
      </div>
    </v-expand-transition>
  </v-card>
</template>

<style scoped>
/* ── Vuetify overrides ── */
.editor-panel {
  overflow: hidden;
  border: 1px solid var(--admin-theme-border) !important;
  background: var(--admin-theme-surface) !important;
  box-shadow: var(--admin-theme-shadow) !important;
}

.v-card.editor-panel {
  border-radius: 8px;
}

.editor-panel.editing {
  border-color: var(--admin-theme-primary) !important;
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 10%, transparent),
    var(--admin-theme-shadow) !important;
  background: color-mix(in srgb, var(--admin-theme-surface) 94%, var(--admin-theme-primary) 6%) !important;
}

.panel-toolbar {
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 44%, var(--admin-theme-surface)) !important;
  border-bottom: 1px solid var(--admin-theme-border) !important;
  border-radius: 8px 8px 0 0 !important;
}

.panel-toolbar :deep(.v-toolbar__content) {
  height: auto !important;
  padding: 1.25rem 1.5rem !important;
  gap: 1rem;
}

.panel-toolbar :deep(.v-toolbar-title) {
  margin-inline-start: 0 !important;
  flex: 1 1 auto;
}

.panel-toolbar h2 {
  color: var(--admin-theme-contrast);
  font-size: 1rem;
  line-height: 1.3;
}

.panel-kicker {
  color: var(--admin-theme-primary-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

/* ── Toolbar action group ── */
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-divider {
  width: 1px;
  height: 22px;
  background: var(--admin-theme-border);
  margin: 0 0.1rem;
}

/* Rotate chevron when collapsed */
.rotate-neg-90 {
  transform: rotate(-90deg);
  transition: transform 0.2s ease;
}

/* ── Edit / Cancel / Done action group ── */
.edit-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* ── Collapsible panel body ── */
.panel-collapsible {
  overflow: hidden;
}

.section-group {
  scroll-margin-top: 120px;
}

@media (max-width: 900px) {
  .panel-toolbar :deep(.v-toolbar__content) {
    flex-wrap: wrap;
    row-gap: 0.5rem;
  }

  .toolbar-actions {
    flex-wrap: wrap;
  }
}
</style>
