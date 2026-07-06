<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <section class="hero-section">
    <h1>{{ title || 'Santi Sena NGO' }}</h1>
    <p>{{ subtitle || 'Building sustainable communities through transparency and impact.' }}</p>
  </section>
</template>

<style scoped>
.hero-section {
  padding: 5rem 1rem;
  text-align: center;
}
.hero-section h1 {
  font-size: 3rem;
  margin: 0 0 0.5rem;
}
.hero-section p {
  color: var(--muted);
  font-size: 1.1rem;
  max-width: 700px;
  margin: 0 auto;
}
</style>
