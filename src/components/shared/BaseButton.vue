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
  padding: 0.55rem 1.1rem;
  border-radius: 0.45rem;
  border: 1px solid transparent;
  background: var(--color-ink);
  color: var(--color-white);
  cursor: pointer;
  font-weight: 500;
  transition:
    background 0.2s,
    border-color 0.2s,
    transform 0.15s;
}
.base-button:hover {
  transform: translateY(-1px);
}
.primary {
  background: var(--primary-color);
  border-color: var(--primary-dark);
  color: var(--color-white);
  font-weight: 600;
}
.primary:hover {
  background: var(--primary-dark);
}
.secondary {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: transparent;
}
.secondary:hover {
  background: var(--primary-light);
}
.ghost {
  background: transparent;
  border-color: var(--color-border);
}
.ghost:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
</style>
