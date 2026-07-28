<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()
const ui = useUiStore()

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
      <button
        class="icon-btn sidebar-toggle-btn"
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
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div class="actions">
        <div class="icon-group">
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
            class="icon-btn theme-toggle-btn"
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
          <div class="avatar-wrap">
            <span class="user-avatar">{{ userInitials }}</span>
            <span class="status-dot" aria-hidden="true"></span>
          </div>
          <span class="user-email">{{ userEmail }}</span>
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
  --hdr-bg: color-mix(in srgb, var(--admin-theme-surface) 90%, transparent);

  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid var(--hdr-border);
  background: var(--hdr-bg);
  color: var(--hdr-text);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  font-family: var(--font-family-base);
  transition: background 0.25s ease, border-color 0.25s ease;
}

.admin-header-inner {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 64px;
}

.sidebar-toggle-btn {
  flex-shrink: 0;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.sidebar-toggle-btn:hover {
  transform: scale(1.04);
}

.sidebar-toggle-btn[aria-pressed='true'] {
  border-color: var(--hdr-primary-deep);
  background: var(--hdr-primary-deep);
  color: #ffffff;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--hdr-primary-deep) 25%, transparent);
}

.sidebar-toggle-btn[aria-pressed='true']:hover {
  border-color: var(--hdr-primary);
  background: var(--hdr-primary);
  color: #ffffff;
}

.sidebar-toggle-btn[aria-pressed='false'] {
  border-color: var(--hdr-border);
  background: transparent;
  color: var(--hdr-muted);
}

/* Actions */
.actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.icon-group {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.icon-btn {
  height: 38px;
  min-width: 38px;
  display: grid;
  place-items: center;
  border: 1px solid var(--hdr-border);
  border-radius: 10px;
  background: var(--hdr-surface);
  color: var(--hdr-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.icon-btn:hover {
  border-color: color-mix(in srgb, var(--hdr-primary) 30%, var(--hdr-border));
  color: var(--hdr-primary-deep);
  background: color-mix(in srgb, var(--hdr-primary) 8%, var(--hdr-surface));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--hdr-primary) 12%, transparent);
}

.icon-btn-label {
  font-size: 0.8rem;
  font-weight: 700;
}

.view-site-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: auto;
  padding: 0 0.85rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--hdr-primary-deep);
  border-color: color-mix(in srgb, var(--hdr-primary) 22%, var(--hdr-border));
  background: color-mix(in srgb, var(--hdr-primary) 6%, var(--hdr-surface));
}

.view-site-btn:hover {
  color: var(--hdr-primary-deep);
  border-color: var(--hdr-primary);
  background: color-mix(in srgb, var(--hdr-primary) 14%, var(--hdr-surface));
}

/* User profile */
.user-profile {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border: 1px solid var(--hdr-border);
  border-radius: 12px;
  background: var(--hdr-surface);
  padding: 0.35rem 0.65rem 0.35rem 0.35rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.user-profile:hover {
  border-color: color-mix(in srgb, var(--hdr-primary) 30%, var(--hdr-border));
  box-shadow: 0 4px 14px rgba(15, 95, 73, 0.08);
}

.avatar-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: linear-gradient(
    135deg,
    var(--hdr-primary),
    var(--hdr-primary-deep)
  );
  color: #ffffff;
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  flex-shrink: 0;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--hdr-primary-deep) 25%, transparent);
}

.status-dot {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #10b981;
  border: 2px solid var(--hdr-surface);
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
}

.user-email {
  color: var(--hdr-text);
  font-size: 0.85rem;
  font-weight: 700;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Dark mode */
:global(.admin-dark .admin-header) {
  --hdr-surface: var(--admin-theme-surface);
  --hdr-border: rgba(255, 255, 255, 0.08);
  --hdr-text: var(--admin-theme-contrast);
  --hdr-muted: var(--admin-theme-muted);
  --hdr-bg: color-mix(in srgb, var(--admin-theme-surface) 90%, transparent);
}

:global(.admin-dark .icon-btn:hover) {
  background: rgba(52, 211, 153, 0.12);
  border-color: rgba(52, 211, 153, 0.3);
  color: #34d399;
}

:global(.admin-dark .view-site-btn) {
  color: #34d399;
  border-color: rgba(52, 211, 153, 0.25);
  background: rgba(52, 211, 153, 0.08);
}

:global(.admin-dark .view-site-btn:hover) {
  color: #ffffff;
  border-color: #34d399;
  background: rgba(52, 211, 153, 0.2);
}

@media (max-width: 800px) {
  .icon-btn-label {
    display: none;
  }

  .view-site-btn {
    padding: 0 0.5rem;
  }

  .view-site-btn svg {
    width: 15px;
    height: 15px;
  }
}

@media (max-width: 600px) {
  .admin-header-inner {
    padding: 0 1rem;
    min-height: 56px;
  }

  .user-email {
    display: none;
  }
}
</style>
