<script setup lang="ts">
import { ref } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useUiStore } from '@/stores/ui.store'

const ui = useUiStore()
const siteName = ref('Santi Sena NGO')
const adminEmail = ref('admin@santisena.org')
</script>

<template>
  <div :class="['admin-page', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="main">
        <section class="settings-overview" aria-label="Settings">
          <header class="settings-header">
            <p class="eyebrow">Administration</p>
            <h1>Settings</h1>
            <p>Manage your admin panel configuration and preferences.</p>
          </header>

          <div class="settings-grid">
            <article class="settings-card">
              <header>
                <span class="settings-icon">
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
                    <circle cx="12" cy="12" r="3" />
                    <path
                      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                    />
                  </svg>
                </span>
                <h2>General</h2>
              </header>
              <div class="settings-field">
                <label for="site-name">Site name</label>
                <input id="site-name" v-model="siteName" name="site-name" />
              </div>
              <div class="settings-field">
                <label for="admin-email">Admin email</label>
                <input id="admin-email" v-model="adminEmail" name="admin-email" type="email" />
              </div>
              <button class="settings-btn" type="button">Save changes</button>
            </article>

            <article class="settings-card">
              <header>
                <span class="settings-icon">
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
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </span>
                <h2>Appearance</h2>
              </header>
              <div class="settings-field">
                <label>Theme</label>
                <div class="theme-options">
                  <button
                    type="button"
                    :class="['theme-option', { active: !ui.darkMode }]"
                    @click="ui.setDarkMode(false)"
                  >
                    <svg
                      width="14"
                      height="14"
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
                    Light
                  </button>
                  <button
                    type="button"
                    :class="['theme-option', { active: ui.darkMode }]"
                    @click="ui.setDarkMode(true)"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    Dark
                  </button>
                </div>
              </div>
            </article>

            <article class="settings-card">
              <header>
                <span class="settings-icon">
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
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <h2>Security</h2>
              </header>
              <div class="settings-field">
                <label>Authentication</label>
                <p class="settings-note">Admin authentication is managed through Supabase.</p>
              </div>
              <div class="settings-field">
                <label>Session</label>
                <p class="settings-note">You are currently logged in as an administrator.</p>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  --admin-bg: var(--admin-theme-bg);
  --admin-bg-deep: var(--admin-theme-bg-deep);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-contrast-soft: var(--admin-theme-contrast-soft);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-blue: var(--admin-theme-primary);
  --admin-blue-deep: var(--admin-theme-primary-deep);
  --admin-shadow: var(--admin-theme-shadow);

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--admin-bg);
  color: var(--admin-text);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  transition: padding-left 0.25s ease;
}

:global(.admin-dark .admin-page) {
  --admin-bg: var(--admin-theme-bg);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-contrast-soft: var(--admin-theme-contrast-soft);
}

.admin-layout {
  display: flex;
  flex: 1;
}

.main {
  flex: 1;
  width: 100%;
  padding: 1.5rem 2.25rem 2.5rem;
  background: var(--admin-bg);
}

.settings-overview {
  display: grid;
  gap: 1.5rem;
}

.settings-header {
  display: grid;
  gap: 0.5rem;
  padding: 1.4rem 1.6rem;
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: linear-gradient(135deg, var(--admin-surface-soft), var(--admin-surface));
  box-shadow: var(--admin-shadow);
}

.eyebrow {
  margin: 0;
  color: var(--admin-blue-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--admin-contrast);
  font-size: 1.85rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.settings-header p:not(.eyebrow) {
  margin: 0;
  color: var(--admin-muted);
  line-height: 1.6;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.1rem;
}

.settings-card {
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
  padding: 1.4rem;
  display: grid;
  gap: 1.1rem;
  align-content: start;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.settings-card:hover {
  transform: translateY(-2px);
  border-color: var(--admin-border-strong);
  box-shadow: 0 22px 44px rgba(16, 88, 51, 0.13);
}

.settings-card header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--admin-contrast);
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--admin-border);
}

.settings-icon {
  display: inline-grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 11px;
  background: var(--admin-surface-soft);
  color: var(--admin-blue-deep);
  border: 1px solid rgba(22, 163, 74, 0.22);
  flex: 0 0 auto;
}

.settings-card h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--admin-contrast);
}

.settings-field {
  display: grid;
  gap: 0.4rem;
}

.settings-field label {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--admin-contrast-soft);
}

.settings-field input {
  min-height: 44px;
  border: 1.5px solid var(--admin-border-strong);
  border-radius: 10px;
  background: var(--admin-surface);
  color: var(--admin-text);
  padding: 0.6rem 0.85rem;
  font-size: 0.92rem;
  font-family: inherit;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.settings-field input:focus {
  border-color: var(--admin-blue);
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.15);
  outline: none;
}

.settings-note {
  margin: 0;
  font-size: 0.86rem;
  color: var(--admin-muted);
  line-height: 1.55;
  background: var(--admin-surface-soft);
  border: 1px solid var(--admin-border);
  border-radius: 10px;
  padding: 0.65rem 0.8rem;
}

.settings-btn {
  min-height: 44px;
  border: 1px solid var(--admin-blue);
  border-radius: 10px;
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
  color: #ffffff;
  padding: 0.6rem 1.15rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  justify-self: start;
  box-shadow: 0 12px 22px rgba(15, 125, 56, 0.25);
  transition:
    background 0.18s ease,
    transform 0.12s ease,
    box-shadow 0.18s ease;
}

.settings-btn:hover {
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(15, 125, 56, 0.3);
}

.theme-options {
  display: flex;
  gap: 0.6rem;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 42px;
  border: 1.5px solid var(--admin-border-strong);
  border-radius: 10px;
  background: var(--admin-surface-soft);
  color: var(--admin-text);
  padding: 0.5rem 0.95rem;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease;
}

.theme-option:hover {
  border-color: var(--admin-blue);
}

.theme-option.active {
  border-color: var(--admin-blue);
  background: var(--admin-surface-soft);
  color: var(--admin-blue-deep);
}

@media (min-width: 900px) {
  .admin-page.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 760px) {
  .main {
    padding: 1rem;
  }

  .settings-header {
    padding: 1.1rem;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>
