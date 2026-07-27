<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
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
  justify-content: flex-end;
  gap: 0.75rem;
  min-height: 60px;
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
}
</style>
