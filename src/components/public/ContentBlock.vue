<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <section class="content-block">
    <div class="content-inner">
      <h2 v-if="title">{{ title }}</h2>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.content-block {
  padding: 3rem 1rem;
  border-top: 1px solid var(--border);
}
.content-inner {
  max-width: 900px;
  margin: 0 auto;
}
h2 {
  margin: 0 0 1rem;
  font-size: 1.75rem;
}
</style>
