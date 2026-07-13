<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

function titleFromSlug(value: string) {
  return value
    .replace(/^get-involved-/, '')
    .replace(/^programs-/, '')
    .replace(/^impact-/, '')
    .replace(/^contact-/, '')
    .replace(/^about-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
}

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/admin' || path === '/admin/') return 'Dashboard'
  if (path.startsWith('/admin/editor/')) {
    const slug = path.replace('/admin/editor/', '')
    return titleFromSlug(slug)
  }
  if (path === '/admin/media') return 'Media Library'
  if (path === '/admin/pages') return 'Pages Manager'
  if (path === '/admin/settings') return 'Settings'
  if (path === '/admin/login') return 'Login'
  if (path.startsWith('/admin/modules/')) {
    const mod = path.replace('/admin/modules/', '')
    return titleFromSlug(mod)
  }
  return 'Admin'
})

const pageContext = computed(() => {
  const path = route.path
  if (path.startsWith('/admin/editor/')) return 'Website page'
  if (path.startsWith('/admin/modules/')) return 'Content module'
  if (path === '/admin/media') return 'Asset library'
  if (path === '/admin/settings') return 'Preferences'
  return 'Admin workspace'
})

const userInitials = computed(() => {
  const email = auth.user?.email || 'admin@santisena.org'
  const namePart = email.split('@')[0] ?? ''
  const parts = namePart.split(/[._-]/)
  if (parts.length >= 2) {
    const first = parts[0]?.[0] ?? ''
    const second = parts[1]?.[0] ?? ''
    return (first + second).toUpperCase().slice(0, 2) || 'AD'
  }
  if (namePart.length >= 2) return namePart.slice(0, 2).toUpperCase()
  return 'AD'
})

const userEmail = computed(() => auth.user?.email || 'admin@santisena.org')

function goToSite() {
  void router.push('/')
}
</script>

<template>
  <header class="admin-header">
    <div class="admin-header-inner">
      <div class="left">
        <button
          :class="['sidebar-toggle', { active: ui.sidebarOpen }]"
          type="button"
          :aria-label="ui.sidebarOpen ? 'Hide sidebar' : 'Show sidebar'"
          :aria-pressed="ui.sidebarOpen"
          @click="ui.toggleSidebar"
        >
          <svg
            v-if="ui.sidebarOpen"
            class="toggle-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <svg
            v-else
            class="toggle-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </button>
        <div class="brand-badge">
          <span class="brand-dot" aria-hidden="true"></span>
          <div class="title-stack">
            <span class="section-label">{{ pageContext }}</span>
            <h1 class="page-title">{{ pageTitle }}</h1>
          </div>
        </div>
      </div>

      <div class="actions">
        <div class="icon-group">
          <button class="icon-btn view-site-btn" type="button" aria-label="View public site" @click="goToSite">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span class="icon-btn-label">View Site</span>
          </button>
          <button
            class="icon-btn"
            type="button"
            :aria-label="ui.darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
            :aria-pressed="ui.darkMode"
            @click="ui.toggleDarkMode"
          >
            <svg v-if="ui.darkMode" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>

        <div class="user-profile">
          <span class="user-email">{{ userEmail }}</span>
          <span class="user-avatar">{{ userInitials }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.admin-header {
  --hdr-primary: #2563eb;
  --hdr-surface: #ffffff;
  --hdr-border: #dbe3ef;
  --hdr-text: #172033;
  --hdr-muted: #667085;
  --hdr-bg: rgba(255, 255, 255, 0.92);

  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid var(--hdr-border);
  background: var(--hdr-bg);
  color: var(--hdr-text);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.admin-header-inner {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 60px;
}

.left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.brand-badge {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.brand-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--hdr-primary);
  flex-shrink: 0;
}

.page-title {
  margin: 0;
  color: var(--hdr-text);
  font-size: 1.05rem;
  font-weight: 850;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-stack {
  display: grid;
  gap: 0.12rem;
  min-width: 0;
}

.section-label {
  color: var(--hdr-muted);
  font-size: 0.68rem;
  font-weight: 850;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Sidebar toggle */
.sidebar-toggle {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--hdr-border);
  border-radius: 9px;
  background: var(--hdr-surface);
  color: var(--hdr-text);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    color 0.15s ease;
}

.sidebar-toggle:hover,
.sidebar-toggle.active {
  background: #f1f5f9;
  border-color: #c7d2e5;
  color: var(--hdr-primary);
}

.sidebar-toggle.active {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
}

.toggle-icon {
  display: block;
}

/* Actions */
.actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.icon-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid var(--hdr-border);
  border-radius: 10px;
  background: var(--hdr-surface);
  color: var(--hdr-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.icon-btn:hover {
  border-color: #c7d2e5;
  color: var(--hdr-primary);
  background: #f1f5f9;
}

.icon-btn-label {
  font-size: 0.78rem;
  font-weight: 700;
}

.view-site-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: auto;
  padding: 0 0.75rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #3b82f6;
}

.view-site-btn:hover {
  color: #2563eb;
  border-color: #93c5fd;
  background: #eff6ff;
}

/* User profile */
.user-profile {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid var(--hdr-border);
  border-radius: 10px;
  background: var(--hdr-surface);
  padding: 0.35rem 0.5rem 0.35rem 0.35rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.user-email {
  color: var(--hdr-text);
  font-size: 0.85rem;
  font-weight: 600;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Dark mode */
:global(.admin-dark) .admin-header {
  --hdr-surface: #0f172a;
  --hdr-border: #293548;
  --hdr-text: #f1f5f9;
  --hdr-muted: #94a3b8;
  --hdr-bg: rgba(15, 23, 42, 0.92);
}

:global(.admin-dark) .sidebar-toggle:hover,
:global(.admin-dark) .sidebar-toggle.active,
:global(.admin-dark) .icon-btn:hover {
  background: #1e293b;
  border-color: #334155;
}

:global(.admin-dark) .view-site-btn {
  color: #60a5fa;
}

:global(.admin-dark) .view-site-btn:hover {
  color: #93bbfd;
  border-color: #3b82f6;
  background: #1e3a5f;
}

:global(.admin-dark) .brand-dot {
  background: #60a5fa;
}

@media (max-width: 800px) {
  .icon-btn-label {
    display: none;
  }

  .view-site-btn {
    padding: 0 0.4rem;
  }

  .view-site-btn svg {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 600px) {
  .admin-header-inner {
    padding: 0 1rem;
    min-height: 52px;
  }

  .user-email {
    display: none;
  }

  .page-title {
    font-size: 0.9rem;
  }
}
</style>
