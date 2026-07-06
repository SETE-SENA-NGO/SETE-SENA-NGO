<script setup lang="ts">
withDefaults(defineProps<{ type?: 'primary' | 'secondary' | 'ghost' }>(), {
  type: 'primary',
})
</script>

<template>
  <button :class="['base-button', type]">
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.9rem;
  border-radius: 0.45rem;
  border: 1px solid transparent;
  background: #18181b;
  color: var(--text);
  cursor: pointer;
}
.primary {
  background: #27272a;
  border-color: #3f3f46;
}
.secondary {
  border-color: var(--border);
  background: transparent;
}
.ghost {
  background: transparent;
  border-color: var(--border);
}
</style>
