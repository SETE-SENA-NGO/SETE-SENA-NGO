<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui.store'

const route = useRoute()
const ui = useUiStore()
const links = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/pages', label: 'Pages' },
  { to: '/admin/media', label: 'Media' },
  { to: '/admin/settings', label: 'Settings' },
]
</script>

<template>
  <div class="backdrop" v-show="ui.sidebarOpen" @click="ui.closeSidebar"></div>
  <aside :class="['admin-sidebar', { open: ui.sidebarOpen }]">
    <div class="brand">Admin</div>
    <nav>
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :class="['link', { active: route.path === link.to }]"
        @click="ui.closeSidebar"
      >
        <span>{{ link.label }}</span>
      </RouterLink>
    </nav>
    <div class="bottom">
      <RouterLink class="link" to="/" @click="ui.closeSidebar">Back to site</RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  width: max(10%, 180px);
  border-right: 1px solid var(--border);
  background: var(--panel);
  display: flex;
  flex-direction: column;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 60;
  transform: translateX(-100%);
  transition: transform 0.25s ease;
}
.admin-sidebar.open {
  transform: translateX(0);
}
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 55;
}
.brand {
  padding: 1.25rem 1rem;
  font-weight: 700;
  border-bottom: 1px solid var(--border);
}
nav {
  flex: 1;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.link {
  display: block;
  padding: 0.6rem 0.75rem;
  border-radius: 0.4rem;
  color: var(--text);
}
.link.active {
  background: #27272a;
}
.link:hover {
  background: #27272a;
}
.bottom {
  padding: 1rem;
  border-top: 1px solid var(--border);
}
@media (min-width: 900px) {
  .admin-sidebar {
    transform: none;
  }
  .backdrop {
    display: none;
  }
}
</style>
