<script setup lang="ts">
import ContentBlock from '@/components/public/ContentBlock.vue'
</script>

<template>
  <div class="public-page">
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
