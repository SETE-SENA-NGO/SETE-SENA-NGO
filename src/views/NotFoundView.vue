<script setup lang="ts">
import Slideshow from '@/components/shared/Slideshow.vue'

const slideItems: { image: string; caption: string }[] = [
  { image: '/images/programs/hero-1.jpg', caption: 'Page not found' },
]
</script>

<template>
  <div class="not-found">
    <Slideshow :slides="slideItems" />
    <h1>404</h1>
    <p>Page not found.</p>
    <RouterLink to="/">Go home</RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 6rem 1rem;
}
h1 {
  margin: 0;
}
a {
  color: var(--primary-color);
  text-decoration: underline;
}
</style>
