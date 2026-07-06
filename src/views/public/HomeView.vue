<script setup lang="ts">
import HeroSection from '@/components/public/HeroSection.vue'
import ContentBlock from '@/components/public/ContentBlock.vue'
</script>

<template>
  <div class="public-page">
    <HeroSection />
    <ContentBlock title="Our Work">
      <p>Community-led programs focused on education, water access, and sustainable agriculture.</p>
    </ContentBlock>
  </div>
</template>

<style scoped>
.public-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
