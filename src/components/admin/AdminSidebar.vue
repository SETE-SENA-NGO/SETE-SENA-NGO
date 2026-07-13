<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

type PageItem = {
  slug: string
  label: string
}

type NavItem = {
  to: string
  label: string
  icon: string
}

type PageGroup = {
  slug: string
  label: string
  items: PageItem[]
}

const route = useRoute()
const ui = useUiStore()
const auth = useAuthStore()
const loggingOut = ref(false)

const workspaceLinks: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: 'icon-dashboard' },
]

const pageGroups: PageGroup[] = [
  { slug: 'home', label: 'Home', items: [] },
  {
    slug: 'about',
    label: 'About',
    items: [
      { slug: 'about-vision', label: 'Vision & Mission' },
      { slug: 'about-organization', label: 'Organization' },
    ],
  },
  {
    slug: 'programs',
    label: 'Programs',
    items: [
      { slug: 'programs-environment', label: 'Environment' },
      { slug: 'programs-education', label: 'Education' },
      { slug: 'programs-livelihood', label: 'Livelihood' },
      { slug: 'programs-child-protection', label: 'Child Protection' },
      { slug: 'services', label: 'Services' },
    ],
  },
  {
    slug: 'impact',
    label: 'Impact',
    items: [
      { slug: 'impact-numbers', label: 'Numbers' },
      { slug: 'impact-timeline', label: 'Timeline' },
      { slug: 'impact-partners', label: 'Partners' },
    ],
  },
  {
    slug: 'get-involved',
    label: 'Get Involved',
    items: [
      { slug: 'get-involved-donate', label: 'Donate' },
      { slug: 'get-involved-volunteer', label: 'Volunteer' },
      { slug: 'get-involved-partner', label: 'Partner' },
    ],
  },
  {
    slug: 'contact',
    label: 'Contact',
    items: [
      { slug: 'contact-head-office', label: 'Head Office' },
      { slug: 'contact-field-offices', label: 'Field Offices' },
    ],
  },
  { slug: 'site-footer', label: 'Header & Footer', items: [] },
]

function editorPath(slug: string) {
  return `/admin/editor/${slug}`
}

function isActive(path: string) {
  return route.path === path
}

function isNavActive(item: NavItem) {
  return isActive(item.to)
}

function isGroupActive(group: PageGroup) {
  if (isActive(editorPath(group.slug))) return true
  return group.items.some((item) => isActive(editorPath(item.slug)))
}

function isGroupOpen(group: PageGroup) {
  return isGroupActive(group)
}

async function logout() {
  if (loggingOut.value) return

  loggingOut.value = true
  try {
    await auth.logout()
    ui.closeSidebar()
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <div class="backdrop" v-show="ui.sidebarOpen" @click="ui.closeSidebar"></div>
  <aside :class="['admin-sidebar', { open: ui.sidebarOpen }]">
    <RouterLink class="brand" to="/admin" @click="ui.closeSidebarForNavigation">
      <span class="brand-mark" aria-hidden="true">SS</span>
      <span class="brand-text">
        <strong>SANTI SENA</strong>
        <small>Admin Console</small>
      </span>
    </RouterLink>

    <nav aria-label="Admin navigation">
      <p class="nav-heading">Workspace</p>
      <RouterLink
        v-for="item in workspaceLinks"
        :key="item.to"
        :to="item.to"
        :class="['link', { active: isNavActive(item) }]"
        @click="ui.closeSidebarForNavigation"
      >
        <span :class="['link-icon', item.icon]" aria-hidden="true"></span>
        <span>{{ item.label }}</span>
      </RouterLink>

      <p class="nav-heading">Website Pages</p>

      <!-- Flat single pages -->
      <RouterLink
        v-for="group in pageGroups.filter((g) => !g.items.length)"
        :key="group.slug"
        :to="editorPath(group.slug)"
        :class="['link', { active: isActive(editorPath(group.slug)) }]"
        @click="ui.closeSidebarForNavigation"
      >
        <span class="link-icon icon-pages" aria-hidden="true"></span>
        <span>{{ group.label }}</span>
      </RouterLink>

      <!-- Expandable groups with sub-pages -->
      <details
        v-for="group in pageGroups.filter((g) => g.items.length)"
        :key="group.slug"
        class="nav-group"
        :open="isGroupOpen(group)"
      >
        <summary>
          <RouterLink
            :to="editorPath(group.slug)"
            :class="['link summary-link', { active: isActive(editorPath(group.slug)) }]"
            @click="ui.closeSidebarForNavigation"
          >
            <span class="link-icon icon-pages" aria-hidden="true"></span>
            <span>{{ group.label }}</span>
          </RouterLink>
        </summary>
        <div class="submenu">
          <RouterLink
            v-for="item in group.items"
            :key="item.slug"
            :to="editorPath(item.slug)"
            :class="['sub-link', { active: isActive(editorPath(item.slug)) }]"
            @click="ui.closeSidebarForNavigation"
          >
            {{ item.label }}
          </RouterLink>
        </div>
      </details>
    </nav>

    <div class="bottom">
      <RouterLink
        :class="['link', 'settings-link', { active: isActive('/admin/settings') }]"
        to="/admin/settings"
        @click="ui.closeSidebarForNavigation"
      >
        <span class="link-icon icon-settings" aria-hidden="true"></span>
        <span>Settings</span>
      </RouterLink>
      <div class="bottom-divider" aria-hidden="true"></div>
      <button
        class="link logout-link"
        type="button"
        :disabled="loggingOut"
        @click="logout"
      >
        <span class="link-icon icon-logout" aria-hidden="true"></span>
        <span class="logout-copy">
          <strong>{{ loggingOut ? 'Signing out...' : 'Logout' }}</strong>
          <small>End admin session</small>
        </span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  width: 260px;
  background: #100d2c;
  display: flex;
  flex-direction: column;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 60;
  transform: translateX(-100%);
  box-shadow: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.admin-sidebar.open {
  transform: translateX(0);
  box-shadow: 18px 0 38px rgba(5, 8, 22, 0.24);
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 20, 0.58);
  z-index: 55;
}

.brand {
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: #2fa2ff;
  padding: 1rem 1.25rem;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-mark {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: rgba(47, 162, 255, 0.14);
  color: #65c7ff;
  font-size: 0.78rem;
  font-weight: 950;
  flex-shrink: 0;
}

.brand-text {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}

.brand-text strong,
.brand-text small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-text strong {
  color: #f8fbff;
  font-size: 1rem;
  font-weight: 950;
}

.brand-text small {
  color: #8f91bc;
  font-size: 0.72rem;
  font-weight: 800;
}

nav {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 0.75rem 0.85rem;
}

.nav-heading {
  margin: 0.85rem 0 0.45rem;
  color: #8f91bc;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.link {
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border-radius: 6px;
  color: #a9abd0;
  padding: 0.5rem 0.75rem;
  font-weight: 800;
  text-decoration: none;
  font-size: 0.9rem;
}

.link > span:last-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link:hover,
.link.active {
  background: rgba(37, 99, 235, 0.18);
  color: #ffffff;
}

.link.active {
  box-shadow: inset 3px 0 0 #2563eb;
}

.link-icon {
  width: 0.9rem;
  height: 0.9rem;
  flex: 0 0 auto;
  position: relative;
  color: currentColor;
}

.link-icon::before,
.link-icon::after {
  position: absolute;
  content: '';
}

.icon-dashboard::before {
  inset: 0.1rem;
  border: 2px solid currentColor;
  border-radius: 999px;
}

.icon-dashboard::after {
  left: 0.4rem;
  top: 0.2rem;
  width: 0.14rem;
  height: 0.36rem;
  border-radius: 999px;
  background: currentColor;
  transform: rotate(45deg);
  transform-origin: bottom;
}

.icon-pages::before {
  inset: 0.1rem;
  border: 2px solid currentColor;
  border-radius: 2px;
}

.icon-pages::after {
  left: 0.28rem;
  right: 0.28rem;
  top: 0.38rem;
  height: 2px;
  background: currentColor;
  box-shadow: 0 0.22rem 0 currentColor;
}

.icon-settings::before {
  inset: 0.1rem;
  border: 2px solid currentColor;
  border-radius: 999px;
}

.icon-settings::after {
  inset: 0;
  border-top: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  border-radius: 1px;
}

.icon-site::before {
  inset: 0.08rem;
  border: 2px solid currentColor;
  border-radius: 999px;
}

.icon-site::after {
  left: 0.18rem;
  right: 0.18rem;
  top: 0.38rem;
  height: 2px;
  background: currentColor;
}

.icon-media::before {
  inset: 0.12rem;
  border: 2px solid currentColor;
  border-radius: 2px;
}

.icon-media::after {
  left: 0.28rem;
  right: 0.24rem;
  bottom: 0.26rem;
  height: 0.34rem;
  border-left: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: skewX(-24deg);
}

.icon-logout::before {
  inset: 0.12rem 0.38rem 0.12rem 0.08rem;
  border: 2px solid currentColor;
  border-right: 0;
  border-radius: 2px;
}

.icon-logout::after {
  right: 0.1rem;
  top: 0.38rem;
  width: 0.42rem;
  height: 0.42rem;
  border-top: 2px solid currentColor;
  border-right: 2px solid currentColor;
  transform: rotate(45deg);
}

/* Expandable group styles */
.nav-group {
  margin-bottom: 0;
}

.nav-group summary {
  display: flex;
  align-items: center;
  list-style: none;
  cursor: pointer;
  padding: 0;
  gap: 0;
}

.nav-group summary::-webkit-details-marker {
  display: none;
}

.nav-group summary::after {
  width: 0.42rem;
  height: 0.42rem;
  margin: 0 0.6rem 0 auto;
  border-right: 2px solid #8f91bc;
  border-bottom: 2px solid #8f91bc;
  transform: rotate(-45deg);
  transition: transform 0.18s ease;
  content: '';
  flex-shrink: 0;
}

.nav-group[open] summary::after {
  transform: rotate(45deg);
}

.summary-link {
  flex: 1;
  min-width: 0;
}

.submenu {
  display: grid;
  gap: 0.1rem;
  padding: 0.1rem 0 0.35rem 1.4rem;
  margin-left: 0.35rem;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.sub-link {
  display: block;
  border-radius: 5px;
  color: #7b7ea8;
  padding: 0.38rem 0.6rem;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.15s ease, background 0.15s ease;
}

.sub-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #e0e2ff;
}

.sub-link.active {
  background: rgba(37, 99, 235, 0.15);
  color: #ffffff;
  box-shadow: inset 2px 0 0 #2563eb;
}

.bottom {
  display: grid;
  gap: 0.45rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.bottom-divider {
  height: 1px;
  margin: 0.25rem 0.5rem;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
}

.settings-link {
  color: #2dd4bf;
  transition: all 0.2s ease;
}

.settings-link:hover {
  color: #ffffff;
  background: rgba(45, 212, 191, 0.2) !important;
  box-shadow: inset 3px 0 0 #2dd4bf;
}

.logout-link {
  width: 100%;
  min-height: 58px;
  align-items: center;
  border: 1px solid rgba(251, 113, 133, 0.32);
  background: rgba(251, 113, 133, 0.1);
  color: #fecdd3;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.logout-link:hover {
  color: #ffffff;
  border-color: rgba(251, 113, 133, 0.68);
  background: rgba(220, 38, 38, 0.28) !important;
  box-shadow: inset 3px 0 0 #fb7185, 0 10px 24px rgba(220, 38, 38, 0.18);
}

.logout-link:disabled {
  cursor: wait;
  opacity: 0.72;
}

.logout-copy {
  display: grid;
  gap: 0.12rem;
}

.logout-copy strong {
  font-size: 0.9rem;
  font-weight: 900;
}

.logout-copy small {
  color: rgba(254, 205, 211, 0.72);
  font-size: 0.72rem;
  font-weight: 800;
}

@media (min-width: 900px) {
  .backdrop {
    display: none;
  }
}
</style>

<style>
.admin-sidebar nav::-webkit-scrollbar {
  display: none;
}
</style>
