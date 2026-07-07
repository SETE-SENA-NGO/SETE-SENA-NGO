<script setup lang="ts">
import ContentBlock from '@/components/public/ContentBlock.vue'
</script>

<template>
  <div class="public-page">
    <ContentBlock title="Impact">
      <p>293 villages reached since 1994, with milestones and partners tracked here.</p>
      <div class="actions">
        <RouterLink to="/impact/numbers" class="link-button">View impact by the numbers</RouterLink>
        <RouterLink to="/impact/timeline" class="link-button secondary">View timeline</RouterLink>
      </div>
    </ContentBlock>
  </div>
</template>

<style scoped>
.public-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.link-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 0.95rem;
  border-radius: 999px;
  background: #3f6b4f;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}

.link-button.secondary {
  background: #d8a850;
  color: #2f241d;
}
</style>
