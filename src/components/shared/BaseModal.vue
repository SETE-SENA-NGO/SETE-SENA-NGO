<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <div v-if="open" class="base-modal-overlay" @click.self="emit('close')">
    <div class="base-modal">
      <div v-if="$slots.header" class="base-modal-header">
        <slot name="header" />
      </div>
      <div class="base-modal-body">
        <slot />
      </div>
      <div v-if="$slots.actions" class="base-modal-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.base-modal {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  width: min(640px, 92vw);
  max-height: 90vh;
  overflow: auto;
}
.base-modal-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}
.base-modal-body {
  padding: 1rem;
}
.base-modal-actions {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
