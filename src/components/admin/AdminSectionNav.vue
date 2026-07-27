<script setup lang="ts">
export interface AdminSectionNavItem {
  id: string
  label: string
  icon: string
}

withDefaults(
  defineProps<{
    sections: ReadonlyArray<AdminSectionNavItem>
    activeSection: string
    hasChanges: boolean
    saving: boolean
    ariaLabel?: string
    saveLabel?: string
    savingLabel?: string
  }>(),
  {
    ariaLabel: 'Page sections',
    saveLabel: 'Save changes',
    savingLabel: 'Saving...',
  },
)

const emit = defineEmits<{ navigate: [id: string]; save: [] }>()
</script>

<template>
  <nav class="section-nav" :aria-label="ariaLabel">
    <div class="section-nav-tabs">
      <button
        v-for="sec in sections"
        :key="sec.id"
        type="button"
        :class="['section-nav-btn', { active: activeSection === sec.id }]"
        @click="emit('navigate', sec.id)"
      >
        <v-icon size="16">{{ sec.icon }}</v-icon>
        <span>{{ sec.label }}</span>
      </button>
    </div>
    <div class="section-nav-save">
      <span v-if="hasChanges" class="unsaved-badge">
        <v-icon size="10">mdi-circle</v-icon>
        Unsaved changes
      </span>
      <v-btn color="primary" variant="tonal" :disabled="saving || !hasChanges" :loading="saving" @click="emit('save')">
        <v-icon start>mdi-content-save</v-icon>
        {{ saving ? savingLabel : saveLabel }}
      </v-btn>
    </div>
  </nav>
</template>

<style scoped>
.section-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
  padding: 0.75rem 1.5rem;
  position: sticky;
  top: calc(60px + 0.5rem);
  z-index: 40;
}

.section-nav-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.section-nav-save {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
}

.section-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 36px;
  border: 1px solid var(--admin-theme-border);
  border-radius: 7px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-muted);
  padding: 0.45rem 0.85rem;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.section-nav-btn:hover {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-primary) 8%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.section-nav-btn.active {
  border-color: var(--admin-theme-primary);
  background: color-mix(in srgb, var(--admin-theme-primary) 14%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 12%, transparent);
}

/* ── Unsaved-changes indicator ── */
.unsaved-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--admin-theme-primary-deep);
  font-size: 0.78rem;
  font-weight: 700;
}

.unsaved-badge .v-icon {
  color: var(--admin-theme-primary);
}

@media (max-width: 900px) {
  .section-nav {
    flex-direction: column;
    align-items: stretch;
  }

  .section-nav-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .section-nav-tabs::-webkit-scrollbar {
    display: none;
  }

  .section-nav-save {
    justify-content: space-between;
  }
}
</style>
