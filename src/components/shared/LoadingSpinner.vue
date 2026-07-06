<script setup lang="ts">
defineProps<{ label?: string }>()
</script>

<template>
  <div class="loading-spinner">
    <span class="ring" />
    <span v-if="label" class="label">{{ label }}</span>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--muted);
}
.ring {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--text);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.label {
  font-size: 0.9rem;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
