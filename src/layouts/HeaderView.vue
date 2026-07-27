<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import logoUrl from '@/assets/santi_sena_logo.png'

type MenuItem = { titleKey: string; descKey: string; to: string }
type Menu = { key: string; labelKey: string; to?: string; items: MenuItem[] }

const menus: Menu[] = [
  {
    key: 'about',
    labelKey: 'nav.about',
    items: [
      {
        titleKey: 'nav.aboutOverview',
        descKey: 'nav.aboutOverviewDesc',
        to: '/about#story',
      },
      {
        titleKey: 'nav.visionMission',
        descKey: 'nav.visionMissionDesc',
        to: '/about/vision',
      },
      {
        titleKey: 'nav.organization',
        descKey: 'nav.organizationDesc',
        to: '/about/organization',
      },
    ],
  },
  {
    key: 'programs',
    labelKey: 'nav.programs',
    items: [
      {
        titleKey: 'nav.programsOverview',
        descKey: 'nav.programsOverviewDesc',
        to: '/programs',
      },
      {
        titleKey: 'nav.education',
        descKey: 'nav.educationDesc',
        to: '/programs/education',
      },
      {
        titleKey: 'nav.environment',
        descKey: 'nav.environmentDesc',
        to: '/programs/environment',
      },
      {
        titleKey: 'nav.livelihood',
        descKey: 'nav.livelihoodDesc',
        to: '/programs/livelihood',
      },
      {
        titleKey: 'nav.childProtection',
        descKey: 'nav.childProtectionDesc',
        to: '/programs/child-protection',
      },
    ],
  },
  {
    key: 'impact',
    labelKey: 'nav.impact',
    items: [
      {
        titleKey: 'nav.numbers',
        descKey: 'nav.numbersDesc',
        to: '/impact/numbers',
      },
      {
        titleKey: 'nav.timeline',
        descKey: 'nav.timelineDesc',
        to: '/impact/timeline',
      },
      {
        titleKey: 'nav.partners',
        descKey: 'nav.partnersDesc',
        to: '/impact/partners',
      },
    ],
  },
  {
    key: 'get-involved',
    labelKey: 'nav.getInvolved',
    items: [
      {
        titleKey: 'nav.getInvolvedOverview',
        descKey: 'nav.getInvolvedOverviewDesc',
        to: '/get-involved',
      },
      {
        titleKey: 'nav.donate',
        descKey: 'nav.donateDesc',
        to: '/get-involved/donate',
      },
      {
        titleKey: 'nav.partner',
        descKey: 'nav.partnerDesc',
        to: '/get-involved/partner',
      },
      {
        titleKey: 'nav.volunteer',
        descKey: 'nav.volunteerDesc',
        to: '/get-involved/volunteer',
      },
    ],
  },
]

const { t } = useI18n()
const openMenu = ref<string | null>(null)
const mobileOpen = ref(false)
const isScrolled = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const route = useRoute()

function isMenuActive(menu: Menu) {
  const paths = menu.items.map((item) => item.to)
  if (menu.to) paths.push(menu.to)
  return paths.some((to) => {
    const itemPath = to.split('#')[0]
    return route.path === itemPath || route.path.startsWith(`${itemPath}/`)
  })
}

function activateMenu(key: string) {
  openMenu.value = key
}

function deactivateMenu(key: string) {
  if (openMenu.value === key) openMenu.value = null
}

function closeAll() {
  openMenu.value = null
  mobileOpen.value = false
}

function onDocClick(event: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) {
    openMenu.value = null
  }
}

function onScroll() {
  isScrolled.value = window.scrollY > 8
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header
    ref="rootEl"
    class="site-header"
    :class="{ 'is-scrolled': isScrolled }"
  >
    <div class="header-inner">
      <RouterLink to="/" class="brand" @click="closeAll">
        <span class="brand-mark">
          <img :src="logoUrl" alt="Santi Sena seal" />
        </span>
        <span class="brand-text">
          <span class="brand-name">Santi Sena</span>
          <span class="brand-tag">Peace Army . Cambodia</span>
        </span>
      </RouterLink>

      <nav class="main-nav">
        <RouterLink to="/" class="nav-link" @click="closeAll">{{
          t('nav.home')
        }}</RouterLink>

        <template v-for="menu in menus" :key="menu.key">
          <div
            class="nav-item"
            @mouseenter="activateMenu(menu.key)"
            @mouseleave="deactivateMenu(menu.key)"
          >
            <RouterLink
              v-if="menu.to"
              :to="menu.to"
              class="nav-link nav-link--trigger"
              :class="{
                'is-open': openMenu === menu.key,
                'is-active': isMenuActive(menu),
              }"
              @click="closeAll"
            >
              {{ t(menu.labelKey) }}
              <svg class="chevron" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </RouterLink>
            <button
              v-else
              type="button"
              class="nav-link nav-link--trigger"
              :class="{
                'is-open': openMenu === menu.key,
                'is-active': isMenuActive(menu),
              }"
              @click.stop="activateMenu(menu.key)"
            >
              {{ t(menu.labelKey) }}
              <svg class="chevron" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <div class="mega-menu" v-show="openMenu === menu.key">
              <div class="mega-menu-card">
                <p class="mega-label">{{ t(menu.labelKey) }}</p>
                <RouterLink
                  v-for="item in menu.items"
                  :key="item.titleKey"
                  :to="item.to"
                  class="mega-item"
                  @click="closeAll"
                >
                  <span class="mega-item-title">{{ t(item.titleKey) }}</span>
                  <span class="mega-item-desc">{{ t(item.descKey) }}</span>
                </RouterLink>
              </div>
            </div>
          </div>
        </template>

        <RouterLink to="/contact" class="nav-link" @click="closeAll">
          {{ t('nav.contact') }}
        </RouterLink>
      </nav>

      <div class="header-actions">
        <LanguageSwitcher />

        <RouterLink
          to="/qr-donate"
          class="btn-support btn-support--desktop"
          @click="closeAll"
        >
          {{ t('actions.donate') }}
        </RouterLink>

        <button
          type="button"
          class="mobile-toggle"
          :aria-label="
            mobileOpen ? t('actions.closeMenu') : t('actions.openMenu')
          "
          @click="mobileOpen = !mobileOpen"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>

    <div class="mobile-nav" v-show="mobileOpen">
      <RouterLink to="/" class="mobile-link" @click="closeAll">{{
        t('nav.home')
      }}</RouterLink>
      <div v-for="menu in menus" :key="'m-' + menu.key" class="mobile-group">
        <RouterLink
          v-if="menu.to"
          :to="menu.to"
          class="mobile-group-label mobile-group-link"
          @click="closeAll"
        >
          {{ t(menu.labelKey) }}
        </RouterLink>
        <p v-else class="mobile-group-label">{{ t(menu.labelKey) }}</p>
        <RouterLink
          v-for="item in menu.items"
          :key="'m-' + item.titleKey"
          :to="item.to"
          class="mobile-link mobile-link--sub"
          @click="closeAll"
        >
          {{ t(item.titleKey) }}
        </RouterLink>
      </div>
      <RouterLink to="/contact" class="mobile-link" @click="closeAll">
        {{ t('nav.contact') }}
      </RouterLink>
      <RouterLink
        to="/get-involved/donate"
        class="btn-support btn-support--mobile"
        @click="closeAll"
      >
        {{ t('actions.donate') }}
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  --cream: var(--color-cream-soft);
  --cream-soft: var(--color-white);
  --green: var(--primary-dark);
  --green-soft: var(--primary-color);
  --orange: var(--primary-color);
  --ink: var(--color-ink);
  --ink-soft: var(--color-ink-soft);
  --hdr-border: var(--color-border);

  position: sticky;
  top: 0;
  z-index: 100;
  /* Light glass look at all times: page content stays visible through the
     header while the blur keeps nav text readable. */
  background: rgba(255, 255, 255, 0.35);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(232, 228, 223, 0.4);
  color: var(--ink);
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

/* Once content scrolls underneath, add a soft shadow so the header still
   reads as its own layer. */
.site-header.is-scrolled {
  border-bottom-color: rgba(20, 129, 62, 0.18);
  box-shadow: 0 10px 30px rgba(31, 61, 46, 0.12);
}

.header-inner {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-right: auto;
  flex-shrink: 0;
  text-decoration: none;
  color: inherit;
}

.brand-mark {
  flex-shrink: 0;
  /* Solid white disc behind the seal so it always sits on a clean
     background, whatever shows through the translucent navbar. */
  background: var(--color-white);
  border-radius: 50%;
  padding: 0.3rem;
  box-shadow: 0 2px 8px rgba(31, 61, 46, 0.1);
}

.brand-mark img {
  width: 4rem;
  height: 4rem;
  display: block;
  object-fit: contain;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-name {
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--green);
  white-space: nowrap;
}

.brand-tag {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.main-nav {
  display: none;
  align-items: center;
  gap: 1.1rem;
}

.nav-item {
  position: relative;
  display: flex;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.5rem 0.45rem;
  font: inherit;
  font-size: 1rem;
  font-weight: 500;
  color: var(--ink);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.nav-link:hover,
.nav-link.is-open,
.nav-link.is-active,
.nav-link.router-link-exact-active {
  color: var(--orange);
  border-bottom-color: var(--orange);
}

.chevron {
  width: 0.6rem;
  height: 0.6rem;
  margin-top: 1px;
}

.mega-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding-top: 0.65rem;
}

.mega-menu-card {
  min-width: 260px;
  background: var(--cream-soft);
  border: 1px solid var(--hdr-border);
  border-radius: 0.85rem;
  box-shadow: 0 18px 40px rgba(31, 61, 46, 0.16);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.mega-label {
  margin: 0 0 0.15rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.mega-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.4rem 0.5rem;
  border-radius: 0.55rem;
  text-decoration: none;
  transition: background 0.15s ease;
}

.mega-item:hover {
  background: var(--primary-light);
}

.mega-item-title {
  font-weight: 700;
  font-size: 1rem;
  color: var(--green);
}

.mega-item-desc {
  font-size: 0.83rem;
  line-height: 1.4;
  color: var(--ink-soft);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.btn-support {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--orange);
  color: var(--color-white);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.7rem 1.5rem;
  border-radius: 999px;
  text-decoration: none;
  white-space: nowrap;
}

.btn-support:hover {
  opacity: 0.9;
}

.btn-support--desktop {
  display: none;
}

.mobile-toggle {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  padding: 0.4rem;
  cursor: pointer;
}

.mobile-toggle span {
  width: 22px;
  height: 2px;
  border-radius: 2px;
  background: var(--ink);
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.5rem 1.5rem 1.5rem;
  border-top: 1px solid var(--hdr-border);
  background: var(--cream);
}

.mobile-link {
  padding: 0.6rem 0.2rem;
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
}

.mobile-group {
  margin-top: 0.4rem;
}

.mobile-group-label {
  margin: 0.6rem 0 0.2rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--orange);
}

.mobile-group-link {
  display: block;
  text-decoration: none;
}

.mobile-link--sub {
  padding: 0.4rem 0.6rem;
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--ink-soft);
}

.btn-support--mobile {
  justify-content: center;
  margin-top: 0.75rem;
}

@media (min-width: 1024px) and (max-width: 1199px) {
  /* The active-page nav label can get long; give it room on narrow desktops. */
  .brand-text {
    display: none;
  }
  .main-nav {
    gap: 0.75rem;
  }
  .btn-support {
    padding: 0.7rem 1.1rem;
  }
}

@media (min-width: 1024px) {
  .main-nav {
    display: flex;
  }
  .btn-support--desktop {
    display: inline-flex;
  }
  .mobile-toggle {
    display: none;
  }
  .mobile-nav {
    display: none !important;
  }
}
</style>
