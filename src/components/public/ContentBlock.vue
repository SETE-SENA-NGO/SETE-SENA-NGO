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
  border-top: 1px solid #E5E7EB;
}
.content-inner {
  max-width: 900px;
  margin: 0 auto;
}
h2 {
  margin: 0 0 1rem;
  font-size: 1.75rem;
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  color: #1F2937;
}
</style>
