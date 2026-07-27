<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
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
const groupOverrides = ref(new Map<string, boolean>())
const navEl = ref<HTMLElement | null>(null)
const indicatorStyle = ref<Record<string, string>>({ opacity: '0' })

const workspaceLinks: NavItem[] = [
  { to: '/admin', labelKey: 'admin.sidebar.dashboard', icon: 'icon-dashboard' },
  {
    to: '/admin/donate',
    labelKey: 'admin.sidebar.donationQr',
    icon: 'icon-media',
  },
]

const pageGroups: PageGroup[] = [
  { slug: 'home', labelKey: 'admin.sidebar.home', path: '/admin/home', items: [] },
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
      { slug: 'about-vision', labelKey: 'admin.sidebar.visionMission', path: '/admin/vision-mission' },
    ],
  },
  {
    slug: 'programs',
    labelKey: 'admin.sidebar.programs',
    path: '/admin/programs',
    items: [
      {
        slug: 'programs-overview',
        labelKey: 'admin.sidebar.overview',
        path: '/admin/programs',
      },
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
      {
        slug: 'get-involved-overview',
        labelKey: 'admin.sidebar.overview',
        path: '/admin/get-involved',
      },
      { slug: 'get-involved-donate', labelKey: 'admin.sidebar.donate' },
      { slug: 'get-involved-volunteer', labelKey: 'admin.sidebar.volunteer', path: '/admin/volunteer' },
      { slug: 'get-involved-partner', labelKey: 'admin.sidebar.partner' },
    ],
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

function isSummaryActive(group: PageGroup) {
  const isChildActive = group.items.some((item) =>
    isActive(item.path ?? editorPath(item.slug)),
  )
  if (isChildActive) {
    return !isGroupOpen(group)
  }

  const groupPath = group.path ?? editorPath(group.slug)
  return isActive(groupPath)
}

function isGroupOpen(group: PageGroup) {
  const override = groupOverrides.value.get(group.slug)
  if (override !== undefined) return override
  return isGroupActive(group)
}

function toggleGroup(group: PageGroup) {
  const nextOverrides = new Map(groupOverrides.value)
  nextOverrides.set(group.slug, !isGroupOpen(group))
  groupOverrides.value = nextOverrides
}

function onGroupClick(group: PageGroup) {
  if (group.path) {
    if (!isGroupOpen(group)) {
      toggleGroup(group)
    }
    void router.push(group.path)
    ui.closeSidebarForNavigation()
  } else {
    toggleGroup(group)
  }
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

function updateActiveIndicator() {
  const nav = navEl.value
  const activeEl = nav?.querySelector<HTMLElement>('[data-nav-active="true"]')

  if (!nav || !activeEl) {
    indicatorStyle.value = { opacity: '0' }
    return
  }

  const navRect = nav.getBoundingClientRect()
  const elRect = activeEl.getBoundingClientRect()
  const top = elRect.top - navRect.top + nav.scrollTop

  indicatorStyle.value = {
    transform: `translateY(${top}px)`,
    height: `${elRect.height}px`,
    opacity: '1',
  }
}

let resizeFrame: number | null = null
function handleResize() {
  if (resizeFrame !== null) return
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = null
    updateActiveIndicator()
  })
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (typeof window === 'undefined' || window.innerWidth >= 900) return
  if (ui.sidebarOpen) ui.closeSidebar()
}

watch(
  () => route.path,
  () => void nextTick(updateActiveIndicator),
)

watch(groupOverrides, () => void nextTick(updateActiveIndicator))

onMounted(() => {
  void nextTick(updateActiveIndicator)
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
  if (resizeFrame !== null) cancelAnimationFrame(resizeFrame)
})
</script>

<template>
  <div class="backdrop" v-show="ui.sidebarOpen" @click="ui.closeSidebar"></div>
  <aside :class="['admin-sidebar', { open: ui.sidebarOpen }]">
    <RouterLink class="brand" to="/admin" @click="ui.closeSidebarForNavigation">
      <div class="brand-logo-container">
        <img class="brand-mark" src="/favicon.ico" alt="SANTI SENA" />
      </div>
      <span class="brand-text">
        <strong>SANTI SENA</strong>
        <span class="brand-badge">
          <span class="badge-dot" aria-hidden="true"></span>
          {{ t('admin.sidebar.console') }}
        </span>
      </span>
    </RouterLink>

    <nav ref="navEl" aria-label="Admin navigation">
      <div class="active-indicator" :style="indicatorStyle" aria-hidden="true"></div>

      <p class="nav-heading">{{ t('admin.sidebar.workspace') }}</p>
      <RouterLink
        v-for="item in workspaceLinks"
        :key="item.to"
        :to="item.to"
        :class="['link', { active: isNavActive(item) }]"
        :data-nav-active="isNavActive(item)"
        @click="ui.closeSidebarForNavigation"
      >
        <span class="link-icon-wrap" aria-hidden="true">
          <svg v-if="item.icon === 'icon-dashboard'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2.5" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </span>
        <span class="link-label">{{ t(item.labelKey) }}</span>
      </RouterLink>

      <p class="nav-heading">{{ t('admin.sidebar.websitePages') }}</p>

      <template v-for="group in pageGroups" :key="group.slug">
        <!-- Flat single pages -->
        <RouterLink
          v-if="!group.items.length"
          :to="group.path ?? editorPath(group.slug)"
          :class="[
            'link',
            { active: isActive(group.path ?? editorPath(group.slug)) },
          ]"
          :data-nav-active="isActive(group.path ?? editorPath(group.slug))"
          @click="ui.closeSidebarForNavigation"
        >
          <span class="link-icon-wrap" aria-hidden="true">
            <svg v-if="group.slug === 'home'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <svg v-else-if="group.slug === 'slideshow'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <svg v-else-if="group.slug === 'contact'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </span>
          <span class="link-label">{{ t(group.labelKey) }}</span>
        </RouterLink>

        <!-- Expandable groups with sub-pages -->
        <div
          v-else
          class="nav-group"
          :class="{ open: isGroupOpen(group) }"
        >
          <div class="nav-group-row">
            <button
              class="link summary-link"
              type="button"
              :class="{ active: isSummaryActive(group) }"
              :data-nav-active="isSummaryActive(group)"
              :aria-controls="submenuId(group)"
              :aria-expanded="isGroupOpen(group)"
              @click="onGroupClick(group)"
            >
              <span class="link-icon-wrap" aria-hidden="true">
                <svg v-if="group.slug === 'about'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <svg v-else-if="group.slug === 'programs'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <svg v-else-if="group.slug === 'impact'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                <svg v-else-if="group.slug === 'get-involved'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
              </span>
              <span class="link-label">{{ t(group.labelKey) }}</span>
              <span
                class="toggle-chevron"
                aria-hidden="true"
                @click.stop="toggleGroup(group)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </span>
            </button>
          </div>
          <div
            class="submenu-wrap"
            :class="{ open: isGroupOpen(group) }"
            :inert="!isGroupOpen(group)"
            @transitionend="updateActiveIndicator"
          >
            <div :id="submenuId(group)" class="submenu">
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
                <span class="sub-dot" aria-hidden="true"></span>
                <span>{{ t(item.labelKey) }}</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </template>
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
        <span class="link-icon-wrap" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </span>
        <span class="link-label">{{ t('admin.sidebar.settings') }}</span>
      </RouterLink>
      <div class="bottom-divider" aria-hidden="true"></div>
      <button
        class="link logout-link"
        type="button"
        :disabled="loggingOut"
        @click="logout"
      >
        <span class="link-icon-wrap" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </span>
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
  --sb-bg: linear-gradient(180deg, #f3faf6 0%, #e6f4ed 100%);
  --sb-border: var(--admin-theme-border);
  --sb-divider: rgba(15, 23, 42, 0.08);
  --sb-text: var(--admin-theme-text);
  --sb-text-strong: var(--admin-theme-contrast);
  --sb-muted: var(--admin-theme-muted);
  --sb-accent: var(--admin-theme-primary);
  --sb-accent-soft: color-mix(
    in srgb,
    var(--admin-theme-primary) 12%,
    transparent
  );
  --sb-active-text: var(--admin-theme-primary-deep);
  --sb-hover-bg: #ffffff;
  --sb-brand: var(--admin-theme-primary-deep);
  --sb-teal: var(--admin-theme-teal);
  --sb-teal-soft: color-mix(in srgb, var(--admin-theme-teal) 12%, transparent);
  --sb-teal-hover-text: #0b5f57;
  --sb-danger: #be123c;
  --sb-danger-border: rgba(225, 29, 72, 0.25);
  --sb-danger-bg: rgba(225, 29, 72, 0.05);
  --sb-danger-hover-bg: rgba(225, 29, 72, 0.12);
  --sb-danger-hover-text: #9f1239;
  --sb-danger-sub: rgba(159, 18, 57, 0.72);
  --sb-shadow: 18px 0 42px rgba(15, 95, 73, 0.12);

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
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease;
}

:global(.admin-dark .admin-sidebar) {
  --sb-bg: linear-gradient(180deg, #0b1a16 0%, #06110e 100%);
  --sb-border: rgba(255, 255, 255, 0.08);
  --sb-divider: rgba(255, 255, 255, 0.08);
  --sb-text: #94a3b8;
  --sb-text-strong: #f8fafc;
  --sb-muted: #64748b;
  --sb-accent: #34d399;
  --sb-accent-soft: rgba(52, 211, 153, 0.12);
  --sb-active-text: #34d399;
  --sb-hover-bg: rgba(255, 255, 255, 0.04);
  --sb-brand: #34d399;
  --sb-teal: #2dd4bf;
  --sb-teal-soft: rgba(45, 212, 191, 0.12);
  --sb-teal-hover-text: #5eead4;
  --sb-danger: #fb7185;
  --sb-danger-border: rgba(251, 113, 133, 0.25);
  --sb-danger-bg: rgba(251, 113, 133, 0.08);
  --sb-danger-hover-bg: rgba(244, 63, 94, 0.2);
  --sb-danger-hover-text: #ffffff;
  --sb-danger-sub: rgba(253, 164, 175, 0.8);
  --sb-shadow: 18px 0 45px rgba(0, 0, 0, 0.5);
}

.admin-sidebar.open {
  transform: translateX(0);
  box-shadow: var(--sb-shadow);
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 22, 17, 0.45);
  backdrop-filter: blur(4px);
  z-index: 55;
}

/* Brand Section */
.brand {
  min-height: 76px;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border-bottom: 1px solid var(--sb-divider);
  color: var(--sb-brand);
  padding: 1rem 1.25rem;
  text-decoration: none;
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.brand:hover {
  background: rgba(255, 255, 255, 0.35);
}

:global(.admin-dark .brand:hover) {
  background: rgba(255, 255, 255, 0.03);
}

.brand-logo-container {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--sb-accent) 18%, #ffffff),
    color-mix(in srgb, var(--sb-teal) 14%, #ffffff)
  );
  border: 1px solid color-mix(in srgb, var(--sb-accent) 25%, transparent);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--sb-accent) 15%, transparent);
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

:global(.admin-dark .brand-logo-container) {
  background: linear-gradient(
    135deg,
    rgba(52, 211, 153, 0.18),
    rgba(45, 212, 191, 0.12)
  );
  border-color: rgba(52, 211, 153, 0.25);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.brand:hover .brand-logo-container {
  transform: scale(1.06) rotate(-2deg);
}

.brand-mark {
  width: 28px;
  height: 28px;
  display: block;
  object-fit: contain;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  min-width: 0;
}

.brand-text strong {
  color: var(--sb-text-strong);
  font-size: 0.98rem;
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--sb-accent);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--sb-accent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--sb-accent) 60%, transparent);
  flex-shrink: 0;
}

/* Nav Region */
nav {
  position: relative;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 0.85rem;
}

.active-indicator {
  position: absolute;
  left: 0.85rem;
  right: 0.85rem;
  top: 0;
  z-index: 0;
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--sb-accent) 15%, transparent),
    color-mix(in srgb, var(--sb-accent) 8%, transparent)
  );
  box-shadow:
    inset 3px 0 0 var(--sb-accent),
    0 2px 10px color-mix(in srgb, var(--sb-accent) 10%, transparent);
  opacity: 0;
  pointer-events: none;
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    height 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
}

:global(.admin-dark .active-indicator) {
  background: linear-gradient(
    90deg,
    rgba(52, 211, 153, 0.15),
    rgba(52, 211, 153, 0.06)
  );
  box-shadow:
    inset 3px 0 0 #34d399,
    0 2px 12px rgba(52, 211, 153, 0.15);
}

.nav-heading {
  margin: 0.95rem 0 0.45rem 0.4rem;
  color: var(--sb-muted);
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.link {
  position: relative;
  z-index: 1;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: 10px;
  color: var(--sb-text);
  padding: 0.6rem 0.85rem;
  margin-bottom: 0.25rem;
  font-weight: 700;
  text-decoration: none;
  font-size: 0.88rem;
  opacity: 0.88;
  cursor: pointer;
  transition:
    background 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.18s ease;
}

.link:hover {
  opacity: 1;
  color: var(--sb-active-text);
  transform: translateX(3px);
  background: var(--sb-accent-soft);
}

.link:focus-visible {
  outline: none;
  opacity: 1;
  box-shadow: 0 0 0 2px var(--sb-accent-soft);
}

.link-label {
  flex: 1;
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
  font-weight: 800;
  box-shadow: inset 3px 0 0 var(--sb-accent);
}

nav .link.active {
  background: none;
  box-shadow: none;
}

.link-icon-wrap {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: currentColor;
  transition: transform 0.2s ease;
}

.link:hover .link-icon-wrap {
  transform: scale(1.08);
}

/* Expandable Groups */
.nav-group {
  margin-bottom: 0.25rem;
}

.nav-group-row {
  display: flex;
  align-items: center;
}

.nav-group-row .link {
  margin-bottom: 0;
}

.toggle-chevron {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  color: var(--sb-muted);
  margin-left: auto;
  flex-shrink: 0;
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    background 0.15s ease,
    color 0.15s ease;
}

.toggle-chevron:hover {
  background: color-mix(in srgb, var(--sb-accent) 18%, transparent);
  color: var(--sb-active-text);
}

.nav-group.open .toggle-chevron {
  transform: rotate(180deg);
  color: var(--sb-accent);
}

.summary-link {
  width: 100%;
  border: 0;
  background: transparent;
  font-family: inherit;
  text-align: left;
}

.submenu-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu-wrap.open {
  grid-template-rows: 1fr;
}

.submenu {
  min-height: 0;
  overflow: hidden;
  display: grid;
  gap: 0.22rem;
  padding: 0.3rem 0 0.4rem 1rem;
  margin-left: 1.15rem;
  border-left: 2px solid color-mix(in srgb, var(--sb-accent) 22%, var(--sb-divider));
  border-radius: 0 0 0 4px;
}

:global(.admin-dark .submenu) {
  border-left-color: rgba(52, 211, 153, 0.22);
}

.sub-link {
  display: flex;
  align-items: center;
  min-height: 38px;
  gap: 0.65rem;
  border-radius: 8px;
  color: var(--sb-muted);
  padding: 0.5rem 0.75rem;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition:
    color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease,
    opacity 0.18s ease;
}

.sub-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--sb-muted);
  opacity: 0.55;
  flex-shrink: 0;
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    background 0.2s ease,
    opacity 0.2s ease;
}

.sub-link:hover {
  opacity: 1;
  background: var(--sb-hover-bg);
  color: var(--sb-text-strong);
  transform: translateX(3px);
}

.sub-link:hover .sub-dot {
  opacity: 1;
  transform: scale(1.3);
  background: var(--sb-accent);
}

.sub-link:focus-visible {
  outline: none;
  color: var(--sb-text-strong);
  box-shadow: 0 0 0 2px var(--sb-accent-soft);
}

.sub-link.active {
  opacity: 1;
  background: var(--sb-accent-soft);
  color: var(--sb-active-text);
  font-weight: 800;
  transform: translateX(2px);
}

.sub-link.active .sub-dot {
  opacity: 1;
  transform: scale(1.4);
  background: var(--sb-accent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--sb-accent) 70%, transparent);
}

/* Bottom Bar */
.bottom {
  display: grid;
  gap: 0.45rem;
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--sb-divider);
  flex-shrink: 0;
}

.bottom-divider {
  height: 1px;
  margin: 0.2rem 0.5rem;
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
  min-height: 56px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid var(--sb-danger-border);
  background: var(--sb-danger-bg);
  color: var(--sb-danger);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  border-radius: 10px;
  padding: 0.6rem 0.85rem;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.logout-link:hover {
  color: var(--sb-danger-hover-text);
  border-color: var(--sb-danger-border);
  background: var(--sb-danger-hover-bg) !important;
  transform: translateY(-1px);
  box-shadow:
    inset 3px 0 0 var(--sb-danger),
    0 8px 20px rgba(225, 29, 72, 0.12);
}

.logout-link:disabled {
  cursor: wait;
  opacity: 0.72;
}

.logout-copy {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.logout-copy strong {
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1.2;
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