<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

type PageItem = {
  slug: string
  labelKey: string
  path?: string
}

type NavItem = {
  to: string
  labelKey: string
  icon: string
}

type PageGroup = {
  slug: string
  labelKey: string
  items: PageItem[]
  path?: string
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const ui = useUiStore()
const auth = useAuthStore()
const loggingOut = ref(false)
const openGroups = ref(new Set<string>())

const workspaceLinks: NavItem[] = [
  { to: '/admin', labelKey: 'admin.sidebar.dashboard', icon: 'icon-dashboard' },
  {
    to: '/admin/donate',
    labelKey: 'admin.sidebar.donationQr',
    icon: 'icon-media',
  },
]

const pageGroups: PageGroup[] = [
  { slug: 'home', labelKey: 'admin.sidebar.home', items: [] },
  {
    slug: 'slideshow',
    labelKey: 'admin.sidebar.slideshow',
    path: '/admin/slideshow',
    items: [],
  },
  {
    slug: 'about',
    labelKey: 'admin.sidebar.about',
    items: [
      { slug: 'about-vision', labelKey: 'admin.sidebar.visionMission' },
      // { slug: 'about-organization', labelKey: 'admin.sidebar.organization' },
    ],
  },
  {
    slug: 'programs',
    labelKey: 'admin.sidebar.programs',
    path: '/admin/programs',
    items: [
      {
        slug: 'programs-education',
        labelKey: 'admin.sidebar.education',
        path: '/admin/education',
      },
      {
        slug: 'programs-environment',
        labelKey: 'admin.sidebar.environment',
        path: '/admin/environment',
      },
      {
        slug: 'programs-livelihood',
        labelKey: 'admin.sidebar.livelihood',
        path: '/admin/livelihood',
      },
      {
        slug: 'programs-child-protection',
        labelKey: 'admin.sidebar.childProtection',
        path: '/admin/child-protection',
      },
    ],
  },
  {
    slug: 'impact',
    labelKey: 'admin.sidebar.impact',
    path: '/admin/editor/impact-numbers',
    items: [
      { slug: 'impact-numbers', labelKey: 'admin.sidebar.numbers' },
      { slug: 'impact-timeline', labelKey: 'admin.sidebar.timeline' },
      { slug: 'impact-partners', labelKey: 'admin.sidebar.partners' },
    ],
  },
  {
    slug: 'get-involved',
    labelKey: 'admin.sidebar.getInvolved',
    path: '/admin/get-involved',
    items: [
      { slug: 'get-involved-donate', labelKey: 'admin.sidebar.donate' },
      { slug: 'get-involved-volunteer', labelKey: 'admin.sidebar.volunteer', path: '/admin/volunteer' },
      { slug: 'get-involved-partner', labelKey: 'admin.sidebar.partner' },
    ],
  },
  {
    slug: 'news',
    labelKey: 'admin.sidebar.news',
    path: '/admin/news',
    items: [{ slug: 'news-detail', labelKey: 'admin.sidebar.newsDetail' }],
  },
  {
    slug: 'contact',
    labelKey: 'admin.sidebar.contact',
    path: '/admin/contact',
    items: [],
  },
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
  const groupPath = group.path ?? editorPath(group.slug)
  if (isActive(groupPath)) return true
  return group.items.some((item) =>
    isActive(item.path ?? editorPath(item.slug)),
  )
}

function isGroupOpen(group: PageGroup) {
  return isGroupActive(group) || openGroups.value.has(group.slug)
}

function toggleGroup(group: PageGroup) {
  const nextGroups = new Set(openGroups.value)

  if (nextGroups.has(group.slug)) {
    nextGroups.delete(group.slug)
  } else {
    nextGroups.add(group.slug)
  }

  openGroups.value = nextGroups
}

function submenuId(group: PageGroup) {
  return `admin-sidebar-${group.slug}-submenu`
}

async function logout() {
  if (loggingOut.value) return

  loggingOut.value = true
  try {
    await auth.logout()
    ui.closeSidebar()
    router.push('/admin/login')
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <div class="backdrop" v-show="ui.sidebarOpen" @click="ui.closeSidebar"></div>
  <aside :class="['admin-sidebar', { open: ui.sidebarOpen }]">
    <RouterLink class="brand" to="/admin" @click="ui.closeSidebarForNavigation">
      <img class="brand-mark" src="/favicon.ico" alt="SANTI SENA" />
      <span class="brand-text">
        <strong>SANTI SENA</strong>
        <small>{{ t('admin.sidebar.console') }}</small>
      </span>
    </RouterLink>

    <nav aria-label="Admin navigation">
      <p class="nav-heading">{{ t('admin.sidebar.workspace') }}</p>
      <RouterLink
        v-for="item in workspaceLinks"
        :key="item.to"
        :to="item.to"
        :class="['link', { active: isNavActive(item) }]"
        @click="ui.closeSidebarForNavigation"
      >
        <span :class="['link-icon', item.icon]" aria-hidden="true"></span>
        <span>{{ t(item.labelKey) }}</span>
      </RouterLink>

      <p class="nav-heading">{{ t('admin.sidebar.websitePages') }}</p>

      <!-- Flat single pages -->
      <RouterLink
        v-for="group in pageGroups.filter((g) => !g.items.length)"
        :key="group.slug"
        :to="group.path ?? editorPath(group.slug)"
        :class="[
          'link',
          { active: isActive(group.path ?? editorPath(group.slug)) },
        ]"
        @click="ui.closeSidebarForNavigation"
      >
        <span class="link-icon icon-pages" aria-hidden="true"></span>
        <span>{{ t(group.labelKey) }}</span>
      </RouterLink>

      <!-- Expandable groups with sub-pages -->
      <div
        v-for="group in pageGroups.filter((g) => g.items.length)"
        :key="group.slug"
        class="nav-group"
        :class="{ open: isGroupOpen(group) }"
      >
        <div class="nav-group-row">
          <RouterLink
            :to="group.path ?? editorPath(group.slug)"
            class="link summary-link"
            :class="{ active: group.items.length === 0 ? isActive(group.path ?? editorPath(group.slug)) : (group.path ? isActive(group.path) && !group.items.some((item) => isActive(item.path ?? editorPath(item.slug))) : false) }"
            @click.stop="ui.closeSidebarForNavigation"
          >
            <span class="link-icon icon-pages" aria-hidden="true"></span>
            <span>{{ t(group.labelKey) }}</span>
          </RouterLink>
          <button
            class="group-toggle"
            type="button"
            :aria-controls="submenuId(group)"
            :aria-expanded="isGroupOpen(group)"
            :aria-label="`${isGroupOpen(group) ? 'Collapse' : 'Expand'} ${t(group.labelKey)}`"
            @click="toggleGroup(group)"
          >
            <span class="toggle-chevron" aria-hidden="true"></span>
          </button>
        </div>
        <div
          v-show="isGroupOpen(group)"
          :id="submenuId(group)"
          class="submenu"
        >
          <RouterLink
            v-for="item in group.items"
            :key="item.slug"
            :to="item.path ?? editorPath(item.slug)"
            :class="[
              'sub-link',
              { active: isActive(item.path ?? editorPath(item.slug)) },
            ]"
            @click="ui.closeSidebarForNavigation"
          >
            {{ t(item.labelKey) }}
          </RouterLink>
        </div>
      </div>
    </nav>

    <div class="bottom">
      <RouterLink
        :class="[
          'link',
          'settings-link',
          { active: isActive('/admin/settings') },
        ]"
        to="/admin/settings"
        @click="ui.closeSidebarForNavigation"
      >
        <span class="link-icon icon-settings" aria-hidden="true"></span>
        <span>{{ t('admin.sidebar.settings') }}</span>
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
          <strong>
            {{
              loggingOut
                ? t('admin.sidebar.signingOut')
                : t('admin.sidebar.logout')
            }}
          </strong>
          <small>{{ t('admin.sidebar.endSession') }}</small>
        </span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  --sb-bg: linear-gradient(180deg, #edf7f2, #e2efe8);
  --sb-border: var(--admin-theme-border);
  --sb-divider: rgba(15, 23, 42, 0.09);
  --sb-text: var(--admin-theme-text);
  --sb-text-strong: var(--admin-theme-contrast);
  --sb-muted: var(--admin-theme-muted);
  --sb-accent: var(--admin-theme-primary);
  --sb-accent-soft: color-mix(
    in srgb,
    var(--admin-theme-primary) 14%,
    transparent
  );
  --sb-active-text: var(--admin-theme-primary-deep);
  --sb-hover-bg: #ffffff;
  --sb-brand: var(--admin-theme-primary-deep);
  --sb-brand-mark-bg: color-mix(
    in srgb,
    var(--admin-theme-primary) 14%,
    transparent
  );
  --sb-brand-mark: var(--admin-theme-primary-deep);
  --sb-teal: var(--admin-theme-teal);
  --sb-teal-soft: color-mix(in srgb, var(--admin-theme-teal) 15%, transparent);
  --sb-teal-hover-text: #0b5f57;
  --sb-danger: #be123c;
  --sb-danger-border: rgba(225, 29, 72, 0.3);
  --sb-danger-bg: rgba(225, 29, 72, 0.06);
  --sb-danger-hover-bg: rgba(225, 29, 72, 0.13);
  --sb-danger-hover-text: #9f1239;
  --sb-danger-sub: rgba(159, 18, 57, 0.75);
  --sb-shadow: 18px 0 38px rgba(15, 95, 73, 0.14);

  width: 260px;
  background: var(--sb-bg);
  border-right: 1px solid var(--sb-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 60;
  transform: translateX(-100%);
  box-shadow: none;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease;
}

:global(.admin-dark .admin-sidebar) {
  --sb-bg: linear-gradient(180deg, #10241f, #091814);
  --sb-border: var(--admin-theme-border);
  --sb-divider: rgba(255, 255, 255, 0.09);
  --sb-text: var(--admin-theme-text);
  --sb-text-strong: var(--admin-theme-contrast);
  --sb-muted: var(--admin-theme-muted);
  --sb-accent: var(--admin-theme-primary);
  --sb-accent-soft: color-mix(
    in srgb,
    var(--admin-theme-primary) 24%,
    transparent
  );
  --sb-active-text: var(--admin-theme-contrast);
  --sb-hover-bg: var(--admin-theme-surface-soft);
  --sb-brand: var(--admin-theme-primary-deep);
  --sb-brand-mark-bg: color-mix(
    in srgb,
    var(--admin-theme-primary) 18%,
    transparent
  );
  --sb-brand-mark: var(--admin-theme-primary-deep);
  --sb-teal: var(--admin-theme-teal);
  --sb-teal-soft: color-mix(in srgb, var(--admin-theme-teal) 18%, transparent);
  --sb-teal-hover-text: var(--admin-theme-contrast);
  --sb-danger: #fecdd3;
  --sb-danger-border: rgba(251, 113, 133, 0.32);
  --sb-danger-bg: rgba(251, 113, 133, 0.1);
  --sb-danger-hover-bg: rgba(220, 38, 38, 0.3);
  --sb-danger-hover-text: #ffffff;
  --sb-danger-sub: rgba(254, 205, 211, 0.72);
  --sb-shadow: 18px 0 38px rgba(2, 6, 16, 0.5);
}

.admin-sidebar.open {
  transform: translateX(0);
  box-shadow: var(--sb-shadow);
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 22, 17, 0.4);
  z-index: 55;
}

.brand {
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--sb-divider);
  color: var(--sb-brand);
  padding: 1rem 1.25rem;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-mark {
  width: 46px;
  height: 46px;
  display: block;
  object-fit: contain;
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
  color: var(--sb-text-strong);
  font-size: 1rem;
  font-weight: 900;
}

.brand-text small {
  color: var(--sb-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

nav {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 0.75rem 0.85rem;
}

.nav-heading {
  margin: 0.85rem 0 0.45rem;
  color: var(--sb-muted);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.link {
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border-radius: 6px;
  color: var(--sb-text);
  padding: 0.5rem 0.75rem;
  font-weight: 700;
  text-decoration: none;
  font-size: 0.9rem;
  opacity: 0.85;
}

.link > span:last-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link:hover,
.link.active {
  background: var(--sb-accent-soft);
  color: var(--sb-active-text);
}

.link.active {
  box-shadow: inset 3px 0 0 var(--sb-accent);
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

.icon-news::before {
  inset: 0.08rem;
  border: 2px solid currentColor;
  border-radius: 2px;
}

.icon-news::after {
  left: 0.18rem;
  right: 0.18rem;
  top: 0.28rem;
  height: 0.06rem;
  background: currentColor;
  box-shadow:
    0 0.2rem 0 currentColor,
    0 0.4rem 0 currentColor;
}

.icon-programs::before {
  inset: 0.08rem;
  border-top: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  border-radius: 1px;
}

.icon-programs::after {
  left: 0.18rem;
  right: 0.18rem;
  top: 0.38rem;
  height: 2px;
  background: currentColor;
  box-shadow: 0 0.22rem 0 currentColor;
}

.icon-education::before {
  inset: 0.1rem;
  border: 2px solid currentColor;
  border-radius: 2px;
}

.icon-education::after {
  left: 0.24rem;
  top: 0.14rem;
  width: 0.34rem;
  height: 0.38rem;
  border: 2px solid currentColor;
  border-radius: 1px;
}

.icon-environment::before {
  inset: 0.1rem;
  border: 2px solid currentColor;
  border-radius: 999px;
}

.icon-environment::after {
  left: 0.3rem;
  top: 0.18rem;
  width: 0.3rem;
  height: 0.3rem;
  border: 2px solid currentColor;
  border-radius: 999px;
}

.icon-livelihood::before {
  inset: 0.08rem;
  border: 2px solid currentColor;
  border-radius: 999px;
}

.icon-livelihood::after {
  left: 0.18rem;
  right: 0.18rem;
  top: 0.38rem;
  height: 2px;
  background: currentColor;
}

.icon-child-protection::before {
  inset: 0.1rem;
  border: 2px solid currentColor;
  border-radius: 2px;
}

.icon-child-protection::after {
  inset: 0.16rem;
  background: currentColor;
  border-radius: 1px;
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

.nav-group-row {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}

.group-toggle {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--sb-muted);
  cursor: pointer;
  flex-shrink: 0;
}

.group-toggle:hover,
.group-toggle:focus-visible {
  background: var(--sb-hover-bg);
  color: var(--sb-text-strong);
  outline: none;
}

.group-toggle:focus-visible {
  box-shadow: 0 0 0 2px var(--sb-accent-soft);
}

.toggle-chevron {
  width: 0.42rem;
  height: 0.42rem;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(-45deg);
  transition: transform 0.18s ease;
}

.nav-group.open .toggle-chevron {
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
  border-left: 1px solid var(--sb-divider);
}

.sub-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border-radius: 5px;
  color: var(--sb-muted);
  padding: 0.38rem 0.6rem;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.sub-link .link-icon {
  width: 0.75rem;
  height: 0.75rem;
  flex: 0 0 auto;
  position: relative;
  color: currentColor;
}

.sub-link:hover {
  background: var(--sb-hover-bg);
  color: var(--sb-text-strong);
}

.sub-link.active {
  background: var(--sb-accent-soft);
  color: var(--sb-active-text);
  box-shadow: inset 2px 0 0 var(--sb-accent);
}

.bottom {
  display: grid;
  gap: 0.45rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--sb-divider);
  flex-shrink: 0;
}

.bottom-divider {
  height: 1px;
  margin: 0.25rem 0.5rem;
  background: linear-gradient(
    90deg,
    transparent,
    var(--sb-divider),
    transparent
  );
}

.settings-link {
  color: var(--sb-teal);
  transition: all 0.2s ease;
}

.settings-link:hover {
  color: var(--sb-teal-hover-text);
  background: var(--sb-teal-soft) !important;
  box-shadow: inset 3px 0 0 var(--sb-teal);
}

.logout-link {
  width: 100%;
  min-height: 58px;
  align-items: center;
  border: 1px solid var(--sb-danger-border);
  background: var(--sb-danger-bg);
  color: var(--sb-danger);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  border-radius: 8px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.logout-link:hover {
  color: var(--sb-danger-hover-text);
  border-color: var(--sb-danger-border);
  background: var(--sb-danger-hover-bg) !important;
  box-shadow:
    inset 3px 0 0 var(--sb-danger),
    0 10px 24px rgba(220, 38, 38, 0.14);
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
  font-weight: 800;
}

.logout-copy small {
  color: var(--sb-danger-sub);
  font-size: 0.72rem;
  font-weight: 700;
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
