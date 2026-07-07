<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import FlagUK from '@/components/icons/FlagUK.vue'
import FlagKH from '@/components/icons/FlagKH.vue'
import logoUrl from '@/assets/logo.png'

type MenuItem = { title: string; desc: string; to: string }
type Menu = { label: string; items: MenuItem[] }

const menus: Menu[] = [
  {
    label: 'About',
    items: [
      { title: 'Our Story', desc: 'Founded 1994 — three decades walking with villages.', to: '/about#story' },
      { title: 'Vision & Mission', desc: 'Peace, sustainability, and dignified livelihoods.', to: '/about#vision' },
      { title: 'Organization', desc: 'Board, staff and field structure.', to: '/about#organization' },
    ],
  },
  {
    label: 'Programs',
    items: [
      { title: 'Education', desc: 'Pre-schools, scholarships and youth learning.', to: '/services#education' },
      { title: 'Environment', desc: 'Reforestation, biogas and climate resilience.', to: '/services#environment' },
      { title: 'Livelihood', desc: 'Saving-for-Change groups and rural enterprise.', to: '/services#livelihood' },
      {
        title: 'Child Protection',
        desc: 'Safeguarding and community-led care.',
        to: '/services#child-protection',
      },
    ],
  },
  {
    label: 'Impact',
    items: [
      { title: 'By the Numbers', desc: '293 villages reached since 1994.', to: '/impact#numbers' },
      { title: 'Timeline', desc: 'Milestones from 1994 to 2024.', to: '/impact#timeline' },
      { title: 'Partners', desc: 'UNDP, ADB, Oxfam and more.', to: '/impact#partners' },
    ],
  },
  {
    label: 'Get Involved',
    items: [
      { title: 'Support Us', desc: 'Single gifts that water dozens of households.', to: '/get-involved#support' },
      { title: 'Partner', desc: 'Co-design multi-year community programs.', to: '/get-involved#partner' },
      { title: 'Volunteer', desc: 'Bring your skills to a field project.', to: '/get-involved#volunteer' },
    ],
  },
  {
    label: 'Contact',
    items: [
      { title: 'Head Office', desc: 'Svay Rieng Province, Cambodia.', to: '/contact#head-office' },
      { title: 'Field Offices', desc: 'Prey Veng and Kratie provinces.', to: '/contact#field-offices' },
      { title: 'Write to Us', desc: 'Send a message — we read every letter.', to: '/contact#write' },
    ],
  },
]

type Language = { code: 'en' | 'km'; label: string }

const languages: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'km', label: 'ខ្មែរ' },
]

const flagIcons = { en: FlagUK, km: FlagKH }

const openMenu = ref<string | null>(null)
const langOpen = ref(false)
const mobileOpen = ref(false)
const currentLang = ref<Language>({ code: 'en', label: 'English' })
const rootEl = ref<HTMLElement | null>(null)

function activateMenu(label: string) {
  openMenu.value = label
  langOpen.value = false
}

function deactivateMenu(label: string) {
  if (openMenu.value === label) openMenu.value = null
}

function activateLang() {
  langOpen.value = true
  openMenu.value = null
}

function deactivateLang() {
  langOpen.value = false
}

function selectLang(lang: Language) {
  currentLang.value = lang
  langOpen.value = false
}

function closeAll() {
  openMenu.value = null
  langOpen.value = false
  mobileOpen.value = false
}

function onDocClick(event: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) {
    openMenu.value = null
    langOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <header ref="rootEl" class="site-header">
    <div class="header-inner">
      <RouterLink to="/" class="brand" @click="closeAll">
        <span class="brand-mark">
          <img :src="logoUrl" alt="Santi Sena seal" />
        </span>
        <span class="brand-text">
          <span class="brand-name">Santi Sena</span>
          <span class="brand-tag">Peace Army · Cambodia</span>
        </span>
      </RouterLink>

      <nav class="main-nav">
        <RouterLink to="/" class="nav-link" @click="closeAll">Home</RouterLink>

        <div
          v-for="menu in menus"
          :key="menu.label"
          class="nav-item"
          @mouseenter="activateMenu(menu.label)"
          @mouseleave="deactivateMenu(menu.label)"
        >
          <button
            type="button"
            class="nav-link nav-link--trigger"
            :class="{ 'is-open': openMenu === menu.label }"
            @click.stop="activateMenu(menu.label)"
          >
            {{ menu.label }}
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

          <div class="mega-menu" v-show="openMenu === menu.label">
            <div class="mega-menu-card">
              <p class="mega-label">{{ menu.label }}</p>
              <RouterLink
                v-for="item in menu.items"
                :key="item.title"
                :to="item.to"
                class="mega-item"
                @click="closeAll"
              >
                <span class="mega-item-title">{{ item.title }}</span>
                <span class="mega-item-desc">{{ item.desc }}</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </nav>

      <div class="header-actions">
        <div class="lang-switch" @mouseenter="activateLang" @mouseleave="deactivateLang">
          <button type="button" class="lang-trigger" @click.stop="activateLang">
            <component :is="flagIcons[currentLang.code]" aria-hidden="true" />
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
          <div class="lang-menu" v-show="langOpen">
            <div class="lang-menu-card">
              <button
                v-for="lang in languages"
                :key="lang.code"
                type="button"
                class="lang-option"
                @click="selectLang(lang)"
              >
                <component :is="flagIcons[lang.code]" aria-hidden="true" />
                {{ lang.label }}
              </button>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <RouterLink to="/get-involved" class="btn-support" @click="closeAll">
=======
        <RouterLink to="/get-involved" class="btn-support btn-support--desktop" @click="closeAll">
>>>>>>> 45dfc418923f28aca11d53bc1ea4b2f43175af21
          Support Us
          <span aria-hidden="true">→</span>
        </RouterLink>

        <button type="button" class="mobile-toggle" aria-label="Toggle menu" @click="mobileOpen = !mobileOpen">
          <span />
          <span />
          <span />
        </button>
      </div>
    </div>

    <div class="mobile-nav" v-show="mobileOpen">
      <RouterLink to="/" class="mobile-link" @click="closeAll">Home</RouterLink>
      <div v-for="menu in menus" :key="'m-' + menu.label" class="mobile-group">
        <p class="mobile-group-label">{{ menu.label }}</p>
        <RouterLink
          v-for="item in menu.items"
          :key="'m-' + item.title"
          :to="item.to"
          class="mobile-link mobile-link--sub"
          @click="closeAll"
        >
          {{ item.title }}
        </RouterLink>
      </div>
      <RouterLink to="/get-involved" class="btn-support btn-support--mobile" @click="closeAll">
        Support Us →
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  --cream: #faf3e6;
  --cream-soft: #fdf8ef;
  --green: #1f3d2e;
  --green-soft: #3f5f52;
  --orange: #dd7a2b;
  --ink: #2b2b28;
  --ink-soft: #6b6558;
  --hdr-border: rgba(31, 61, 46, 0.14);
  --font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;

  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--cream);
  border-bottom: 1px solid var(--hdr-border);
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    sans-serif;
  color: var(--ink);
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-right: auto;
  text-decoration: none;
  color: inherit;
}

.brand-mark img {
  width: 2.6rem;
  height: 2.6rem;
  display: block;
  object-fit: contain;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-name {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--green);
}

.brand-tag {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.main-nav {
  display: none;
  align-items: center;
  gap: 1.65rem;
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
<<<<<<< HEAD
  border: 1px solid transparent;
  border-radius: 0.4rem;
=======
  border: none;
  border-bottom: 2px solid transparent;
>>>>>>> 45dfc418923f28aca11d53bc1ea4b2f43175af21
  padding: 0.4rem 0.55rem;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--ink);
  text-decoration: none;
  cursor: pointer;
<<<<<<< HEAD
=======
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
>>>>>>> 45dfc418923f28aca11d53bc1ea4b2f43175af21
}

.nav-link:hover,
.nav-link.is-open,
.nav-link.router-link-exact-active {
  color: var(--orange);
<<<<<<< HEAD
}

.nav-link--trigger.is-open {
  border-color: var(--ink);
=======
  border-bottom-color: var(--orange);
>>>>>>> 45dfc418923f28aca11d53bc1ea4b2f43175af21
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
  background: rgba(221, 122, 43, 0.1);
}

.mega-item-title {
<<<<<<< HEAD
  font-family: var(--font-serif);
=======
>>>>>>> 45dfc418923f28aca11d53bc1ea4b2f43175af21
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

.lang-switch {
  position: relative;
}

.lang-trigger {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  padding: 0.3rem;
  color: var(--ink);
  cursor: pointer;
}

.lang-trigger :deep(.flag-icon),
.lang-option :deep(.flag-icon) {
  width: 1.15rem;
  height: 0.8rem;
  border-radius: 2px;
  flex-shrink: 0;
}

.lang-menu {
  position: absolute;
  top: 100%;
  right: 0;
  padding-top: 0.5rem;
}

.lang-menu-card {
  min-width: 130px;
  background: var(--cream-soft);
  border: 1px solid var(--hdr-border);
  border-radius: 0.6rem;
  padding: 0.35rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 28px rgba(31, 61, 46, 0.16);
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  padding: 0.4rem 0.5rem;
  border-radius: 0.4rem;
  font-size: 0.88rem;
  color: var(--ink);
  cursor: pointer;
  text-align: left;
}

.lang-option:hover {
  background: rgba(221, 122, 43, 0.1);
  color: var(--orange);
}

.btn-support {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--orange);
  color: #211a12;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.6rem 1.3rem;
  border-radius: 999px;
  text-decoration: none;
  white-space: nowrap;
}

.btn-support:hover {
  opacity: 0.9;
}

<<<<<<< HEAD
=======
.btn-support--desktop {
  display: none;
}

>>>>>>> 45dfc418923f28aca11d53bc1ea4b2f43175af21
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

@media (min-width: 1024px) {
  .main-nav {
    display: flex;
  }
<<<<<<< HEAD
=======
  .btn-support--desktop {
    display: inline-flex;
  }
>>>>>>> 45dfc418923f28aca11d53bc1ea4b2f43175af21
  .mobile-toggle {
    display: none;
  }
  .mobile-nav {
    display: none !important;
  }
}
</style>
