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
  background: #18181b;
  color: var(--text);
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
}
.base-button:hover {
  transform: translateY(-1px);
}
.primary {
  background: var(--green);
  border-color: var(--green-dark);
  color: #fff;
  font-weight: 600;
}
.primary:hover {
  background: var(--green-dark);
}
.secondary {
  border-color: var(--green);
  color: var(--green-light);
  background: transparent;
}
.secondary:hover {
  background: color-mix(in srgb, var(--green) 10%, transparent);
}
.ghost {
  background: transparent;
  border-color: var(--border);
}
.ghost:hover {
  border-color: var(--green);
  color: var(--green-light);
}
</style>
