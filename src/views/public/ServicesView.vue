<script setup lang="ts">
import ContentBlock from '@/components/public/ContentBlock.vue'
import Slideshow from '@/components/shared/Slideshow.vue'
import heroImpact from '@/assets/hero-impact.jpg'
import heroImpactForest from '@/assets/hero-impact-forest.jpg'
import heroImpactVillage from '@/assets/hero-impact-village.jpg'

const slideItems: { image: string; caption: string }[] = [
  { image: heroImpact, caption: 'Our programs turn everyday support into lasting community impact.' },
  { image: heroImpactForest, caption: 'Protecting forests and natural resources for the villages that depend on them.' },
  { image: heroImpactVillage, caption: 'Bringing education, clean water and sustainable livelihoods to rural communities.' },
]
</script>

<template>
  <div class="public-page">
    <Slideshow :slides="slideItems" />
    <ContentBlock title="Services">
      <ul>
        <li>Education Grants</li>
        <li>Water &amp; Sanitation</li>
        <li>Sustainable Farming</li>
      </ul>
    </ContentBlock>
  </div>
</template>

<style scoped>
.public-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
ul {
  padding-left: 1.25rem;
}
li + li {
  margin-top: 0.5rem;
}
</style>
