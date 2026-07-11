<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

const auth = useAuthStore()
const ui = useUiStore()
</script>

<template>
  <header class="admin-header">
    <div class="admin-header-inner">
      <div class="left">
        <button class="sidebar-toggle" aria-label="Toggle sidebar" @click="ui.toggleSidebar">
          <span />
          <span />
          <span />
        </button>
        <h3 class="title">Admin Panel</h3>
      </div>
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
.left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.sidebar-toggle {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  padding: 0.4rem;
}
.sidebar-toggle span {
  width: 100%;
  height: 2px;
  border-radius: 2px;
  background: var(--text);
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
@media (min-width: 900px) {
  .sidebar-toggle {
    display: none;
  }
}
</style>
