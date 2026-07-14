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
  padding: 4rem 1.5rem;
  border-top: 1px solid var(--color-border);
}
.content-inner {
  max-width: 900px;
  margin: 0 auto;
}
h2 {
  margin: 0 0 1rem;
}
</style>
