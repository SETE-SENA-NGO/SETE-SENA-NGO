<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <section class="hero-section">
    <div class="hero-bg" />
    <div class="hero-content">
      <h1>{{ title || 'Santi Sena NGO' }}</h1>
      <p>{{ subtitle || 'Building sustainable communities through transparency and impact.' }}</p>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 6rem 1rem;
  text-align: center;
  background: linear-gradient(160deg, #3A7D44 0%, #2D5E34 50%, #1F4223 100%);
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 70% 50% at 10% 40%, rgba(212, 160, 23, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 90% 0%, rgba(255, 255, 255, 0.03) 0%, transparent 60%);
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-section h1 {
  font-size: 3rem;
  margin: 0 0 0.5rem;
  color: #FFFFFF;
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  line-height: 1.1;
}
.hero-section p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  line-height: 1.75;
  max-width: 700px;
  margin: 1.5rem auto 0;
}
</style>
