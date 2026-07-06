<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const links = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/pages', label: 'Pages' },
  { to: '/admin/media', label: 'Media' },
  { to: '/admin/settings', label: 'Settings' },
]
</script>

<template>
  <aside class="admin-sidebar">
    <div class="brand">Admin</div>
    <nav>
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :class="['link', { active: route.path === link.to }]"
      >
        <span>{{ link.label }}</span>
      </RouterLink>
    </nav>
    <div class="bottom">
      <RouterLink class="link" to="/">Back to site</RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  width: 260px;
  border-right: 1px solid var(--border);
  background: var(--panel);
  display: flex;
  flex-direction: column;
  position: fixed;
  inset: 0 auto 0 0;
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
</style>
