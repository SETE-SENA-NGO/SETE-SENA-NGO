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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    Dark
                  </button>
                </div>
              </div>
            </article>

            <article class="settings-card">
              <header>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
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
  --admin-bg: #f4f7fb;
  --admin-surface: #ffffff;
  --admin-border: #dbe3ef;
  --admin-text: #334155;
  --admin-muted: #667085;
  --admin-contrast: #172033;
  --admin-blue: #2563eb;

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--admin-bg);
  color: var(--admin-text);
  transition: padding-left 0.25s ease;
}

:global(.admin-dark) .admin-page {
  --admin-bg: #0b1120;
  --admin-surface: #111827;
  --admin-border: #293548;
  --admin-text: #cbd5e1;
  --admin-muted: #a6b0c3;
  --admin-contrast: #f8fafc;
}

.admin-layout {
  display: flex;
  flex: 1;
}

.main {
  flex: 1;
  width: 100%;
  padding: 1.25rem 2rem 2rem;
  background: var(--admin-bg);
}

.settings-overview {
  display: grid;
  gap: 1.25rem;
}

.settings-header {
  display: grid;
  gap: 0.4rem;
}

.eyebrow {
  margin: 0;
  color: var(--admin-blue);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--admin-contrast);
  font-size: 1.75rem;
  font-weight: 900;
}

.settings-header p:not(.eyebrow) {
  margin: 0;
  color: var(--admin-muted);
  line-height: 1.6;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1rem;
}

.settings-card {
  border: 1px solid var(--admin-border);
  border-radius: 14px;
  background: var(--admin-surface);
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
  align-content: start;
}

.settings-card header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--admin-contrast);
}

.settings-card h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
}

.settings-field {
  display: grid;
  gap: 0.35rem;
}

.settings-field label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--admin-muted);
}

.settings-field input {
  min-height: 40px;
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  background: var(--admin-bg);
  color: var(--admin-text);
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  font-family: inherit;
}

.settings-field input:focus {
  border-color: var(--admin-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  outline: none;
}

.settings-note {
  margin: 0;
  font-size: 0.85rem;
  color: var(--admin-muted);
  line-height: 1.5;
}

.settings-btn {
  min-height: 40px;
  border: 1px solid var(--admin-blue);
  border-radius: 8px;
  background: var(--admin-blue);
  color: #ffffff;
  padding: 0.5rem 1rem;
  font-weight: 800;
  font-size: 0.85rem;
  cursor: pointer;
  justify-self: start;
  transition: background 0.15s ease;
}

.settings-btn:hover {
  background: #1d4ed8;
}

.theme-options {
  display: flex;
  gap: 0.5rem;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 38px;
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  background: var(--admin-bg);
  color: var(--admin-text);
  padding: 0.4rem 0.85rem;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.theme-option:hover {
  border-color: var(--admin-blue);
}

.theme-option.active {
  border-color: var(--admin-blue);
  background: rgba(37, 99, 235, 0.08);
  color: var(--admin-blue);
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

  .settings-grid {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 1.4rem;
  }
}
</style>
