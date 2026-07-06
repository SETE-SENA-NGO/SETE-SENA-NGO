<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
</script>

<template>
  <header class="admin-header">
    <div class="admin-header-inner">
      <h3 class="title">Admin Panel</h3>
      <div class="actions">
        <span class="email">{{ auth.user?.email }}</span>
        <button class="ghost" @click="auth.logout">Logout</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.admin-header {
  border-bottom: 1px solid var(--border);
  background: var(--panel);
  position: sticky;
  top: 0;
  z-index: 40;
}
.admin-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.email {
  color: var(--muted);
  font-size: 0.9rem;
}
.ghost {
  border: 1px solid var(--border);
  padding: 0.45rem 0.7rem;
  border-radius: 0.4rem;
  color: var(--text);
  background: transparent;
}
</style>
