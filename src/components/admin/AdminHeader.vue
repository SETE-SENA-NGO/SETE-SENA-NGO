<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
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
  if (path === '/admin' || path === '/admin/') return t('admin.pages.dashboard')
  if (path.startsWith('/admin/editor/')) {
    const slug = path.replace('/admin/editor/', '')
    return titleFromSlug(slug)
  }
  if (path === '/admin/programs') return t('admin.pages.programsOverview')
  if (path === '/admin/get-involved') return t('admin.pages.getInvolved')
  if (path === '/admin/volunteer') return t('admin.pages.volunteer') || 'Volunteer'
  if (path === '/admin/contact') return t('admin.pages.contact') || 'Contact'
  if (path === '/admin/education') return t('admin.pages.educationDashboard')
  if (path === '/admin/environment')
    return t('admin.pages.environmentDashboard')
  if (path === '/admin/livelihood') return t('admin.pages.livelihoodDashboard')
  if (path === '/admin/child-protection')
    return t('admin.pages.childProtectionDashboard')
  if (path === '/admin/media') return t('admin.pages.mediaLibrary')
  if (path === '/admin/pages') return t('admin.pages.pagesManager')
  if (path === '/admin/settings') return t('admin.pages.settings')
  if (path === '/admin/login') return t('admin.pages.login')
  if (path.startsWith('/admin/modules/')) {
    const mod = path.replace('/admin/modules/', '')
    return titleFromSlug(mod)
  }
  return t('admin.pages.admin')
})

const pageContext = computed(() => {
  const path = route.path
  if (path.startsWith('/admin/editor/')) return t('admin.context.websitePage')
  if (path === '/admin/programs') return t('admin.context.programOverview')
  if (path === '/admin/get-involved') return t('admin.context.pageManagement')
  if (path === '/admin/volunteer') return t('admin.context.pageManagement')
  if (path === '/admin/contact') return t('admin.context.pageManagement')
  if (path === '/admin/education') return t('admin.context.programManagement')
  if (path === '/admin/environment') return t('admin.context.programManagement')
  if (path === '/admin/livelihood') return t('admin.context.programManagement')
  if (path === '/admin/child-protection')
    return t('admin.context.programManagement')
  if (path.startsWith('/admin/modules/'))
    return t('admin.context.contentModule')
  if (path === '/admin/media') return t('admin.context.assetLibrary')
  if (path === '/admin/settings') return t('admin.context.preferences')
  return t('admin.context.workspace')
})

const userInitials = computed(() => {
  const email = auth.user?.email || ''
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

const userEmail = computed(
  () => auth.user?.email || t('admin.user.notSignedIn'),
)

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
          :aria-label="
            ui.sidebarOpen
              ? t('admin.actions.hideSidebar')
              : t('admin.actions.showSidebar')
          "
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
          <LanguageSwitcher class="admin-language-switcher" />
          <button
            class="icon-btn view-site-btn"
            type="button"
            :aria-label="t('admin.actions.viewPublicSite')"
            @click="goToSite"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path
                d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              />
            </svg>
            <span class="icon-btn-label">{{
              t('admin.actions.viewSite')
            }}</span>
          </button>
          <button
            class="icon-btn"
            type="button"
            :aria-label="
              ui.darkMode
                ? t('admin.actions.lightMode')
                : t('admin.actions.darkMode')
            "
            :aria-pressed="ui.darkMode"
            @click="ui.toggleDarkMode"
          >
            <svg
              v-if="ui.darkMode"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
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
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
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
  --hdr-primary: var(--admin-theme-primary);
  --hdr-primary-deep: var(--admin-theme-primary-deep);
  --hdr-surface: var(--admin-theme-surface);
  --hdr-border: var(--admin-theme-border);
  --hdr-text: var(--admin-theme-contrast);
  --hdr-muted: var(--admin-theme-muted);
  --hdr-bg: color-mix(in srgb, var(--admin-theme-surface) 92%, transparent);

  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid var(--hdr-border);
  background: var(--hdr-bg);
  color: var(--hdr-text);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  font-family: var(--font-family-base);
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
  font-weight: 800;
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
  font-weight: 800;
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
  border-radius: 10px;
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
  background: var(--admin-theme-surface-soft);
  border-color: var(--admin-theme-border-strong);
  color: var(--hdr-primary-deep);
}

.sidebar-toggle.active {
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.14);
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

.admin-language-switcher {
  --language-switcher-text: var(--hdr-muted);
  --language-switcher-surface: var(--hdr-surface);
  --language-switcher-border: var(--hdr-border);
  --language-switcher-hover: var(--admin-theme-surface-soft);
  --language-switcher-accent: var(--hdr-primary-deep);
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
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.icon-btn:hover {
  border-color: var(--admin-theme-border-strong);
  color: var(--hdr-primary-deep);
  background: var(--admin-theme-surface-soft);
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
  color: var(--hdr-primary-deep);
}

.view-site-btn:hover {
  color: var(--hdr-primary-deep);
  border-color: var(--admin-theme-primary);
  background: var(--admin-theme-surface-soft);
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
  background: linear-gradient(
    180deg,
    var(--hdr-primary),
    var(--hdr-primary-deep)
  );
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
:global(.admin-dark .admin-header) {
  --hdr-surface: var(--admin-theme-surface);
  --hdr-border: var(--admin-theme-border);
  --hdr-text: var(--admin-theme-contrast);
  --hdr-muted: var(--admin-theme-muted);
  --hdr-bg: color-mix(in srgb, var(--admin-theme-surface) 92%, transparent);
}

:global(.admin-dark .sidebar-toggle:hover),
:global(.admin-dark .sidebar-toggle.active),
:global(.admin-dark .icon-btn:hover) {
  background: var(--admin-theme-surface-soft);
  border-color: var(--admin-theme-border-strong);
}

:global(.admin-dark .view-site-btn) {
  color: var(--admin-theme-primary-deep);
}

:global(.admin-dark .view-site-btn:hover) {
  color: var(--admin-theme-contrast);
  border-color: var(--admin-theme-primary);
  background: var(--admin-theme-surface-soft);
}

:global(.admin-dark .brand-dot) {
  background: var(--admin-theme-primary);
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
