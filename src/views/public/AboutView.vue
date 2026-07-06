<script setup lang="ts">
import ContentBlock from '@/components/public/ContentBlock.vue'
</script>

<template>
  <div class="public-page">
    <ContentBlock title="About Us">
      <p>We are a grassroots NGO working with local partners to deliver measurable impact.</p>
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
