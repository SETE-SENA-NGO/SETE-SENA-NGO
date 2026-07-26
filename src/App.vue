<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FooterView from '@/layouts/FooterView.vue'
import HeaderView from '@/layouts/HeaderView.vue'
import { useLocalizedDomContent } from '@/i18n/useLocalizedDomContent'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

const adminRouteMap: Record<string, string> = {
  '/': '/admin',
  '/about': '/admin/editor/about',
  '/about/vision': '/admin/editor/about-vision',
  '/about/organization': '/admin/editor/about-organization',
  '/programs': '/admin/programs',
  '/programs/education': '/admin/education',
  '/programs/environment': '/admin/environment',
  '/programs/livelihood': '/admin/livelihood',
  '/programs/child-protection': '/admin/child-protection',
  '/impact/numbers': '/admin/editor/impact-numbers',
  '/impact/timeline': '/admin/editor/impact-timeline',
  '/impact/partners': '/admin/editor/impact-partners',
  '/get-involved': '/admin/get-involved',
  '/get-involved/donate': '/admin/donate',
  '/get-involved/volunteer': '/admin/get-involved',
  '/get-involved/partner': '/admin/get-involved',
  '/news': '/admin/news',
  '/contact': '/admin/contact',
}

const route = useRoute()
const router = useRouter()
const ui = useUiStore()
const auth = useAuthStore()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const showAdminBar = computed(() => !isAdminRoute.value && auth.isAuthenticated)

const adminTargetRoute = computed(() => {
  return adminRouteMap[route.path] || '/admin'
})

const pageLabel = computed(() => {
  const labels: Record<string, string> = {
    '/': 'Home',
    '/about': 'About',
    '/about/vision': 'Vision & Mission',
    '/about/organization': 'Organization',
    '/programs': 'Programs',
    '/programs/education': 'Education',
    '/programs/environment': 'Environment',
    '/programs/livelihood': 'Livelihood',
    '/programs/child-protection': 'Child Protection',
    '/impact/numbers': 'Impact Numbers',
    '/impact/timeline': 'Impact Timeline',
    '/impact/partners': 'Impact Partners',
    '/get-involved': 'Get Involved',
    '/get-involved/donate': 'Donate',
    '/get-involved/volunteer': 'Volunteer',
    '/get-involved/partner': 'Partner',
    '/news': 'News',
    '/contact': 'Contact',
  }
  return labels[route.path] || ''
})

// Initialize auth session
void auth.init()
useLocalizedDomContent(isAdminRoute)

function confirmModal() {
  ui.modal.onConfirm?.()
  ui.closeModal()
}

function goToAdmin() {
  void router.push(adminTargetRoute.value)
}
</script>

<template>
  <Transition name="bar-slide">
    <div v-if="showAdminBar" class="admin-top-bar">
      <div class="admin-top-bar-inner">
        <div class="admin-top-bar-left">
          <span class="admin-top-bar-badge">
            <span class="badge-dot" aria-hidden="true"></span>
            Admin
          </span>
          <span class="admin-top-bar-divider" aria-hidden="true"></span>
          <span class="admin-top-bar-email">{{ auth.user?.email }}</span>
        </div>
        <div class="admin-top-bar-right">
          <button type="button" class="admin-top-bar-btn" @click="goToAdmin">
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
              <path d="M19 12H5" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            {{ pageLabel ? 'Edit ' + pageLabel : 'Dashboard' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
  <HeaderView v-if="!isAdminRoute" />
  <RouterView />
  <FooterView v-if="!isAdminRoute" />

  <div class="toast-region" aria-live="polite" aria-atomic="true">
    <div
      v-for="toast in ui.toasts"
      :key="toast.id"
      class="toast"
      :class="`toast-${toast.type}`"
    >
      {{ toast.message }}
    </div>
  </div>

  <div v-if="ui.modal.open" class="confirm-overlay" @click.self="ui.closeModal">
    <section
      class="confirm-dialog"
      role="dialog"
      aria-modal="true"
      :aria-label="ui.modal.title"
    >
      <h2>{{ ui.modal.title }}</h2>
      <p>{{ ui.modal.body }}</p>
      <div class="confirm-actions">
        <button type="button" class="confirm-secondary" @click="ui.closeModal">
          Cancel
        </button>
        <button type="button" class="confirm-primary" @click="confirmModal">
          Confirm
        </button>
      </div>
    </section>
  </div>
</template>

<style>
.toast-region {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 120;
  display: grid;
  gap: 0.75rem;
  width: min(360px, calc(100vw - 2rem));
  pointer-events: none;
}

.toast {
  border: 1px solid var(--admin-theme-border, #dbe3ef);
  border-left-width: 4px;
  border-radius: 14px;
  background: var(--admin-theme-surface, #ffffff);
  color: var(--admin-theme-contrast, #172033);
  padding: 0.9rem 1rem;
  box-shadow: var(--admin-theme-shadow, 0 18px 45px rgba(15, 23, 42, 0.14));
  font-weight: 800;
  pointer-events: auto;
}

.toast-success {
  border-left-color: var(--admin-theme-primary, #16a34a);
}

.toast-error {
  border-left-color: #dc2626;
}

.toast-warning {
  border-left-color: #f97316;
}

.toast-info {
  border-left-color: var(--admin-theme-teal, #2563eb);
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 130;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.58);
  padding: 1rem;
}

.confirm-dialog {
  width: min(430px, 100%);
  border: 1px solid var(--admin-theme-border, #dbe3ef);
  border-radius: 16px;
  background: var(--admin-theme-surface, #ffffff);
  color: var(--admin-theme-contrast, #172033);
  padding: 1.25rem;
  box-shadow: var(--admin-theme-shadow, 0 24px 80px rgba(15, 23, 42, 0.25));
}

.confirm-dialog h2 {
  margin: 0 0 0.45rem;
  color: inherit;
  font-family: inherit;
  font-size: 1.15rem;
  letter-spacing: 0;
}

.confirm-dialog p {
  margin: 0;
  color: var(--admin-theme-muted, #667085);
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  margin-top: 1.25rem;
}

.confirm-secondary,
.confirm-primary {
  min-height: 40px;
  border-radius: 10px;
  padding: 0.55rem 0.9rem;
  font-weight: 850;
  cursor: pointer;
}

.confirm-secondary {
  border: 1px solid var(--admin-theme-border, #dbe3ef);
  background: var(--admin-theme-surface, #ffffff);
  color: var(--admin-theme-contrast, #172033);
}

.confirm-primary {
  border: 1px solid #dc2626;
  background: #dc2626;
  color: #ffffff;
}

.admin-dark .toast,
.admin-dark .confirm-dialog {
  border-color: var(--admin-theme-border);
  background: var(--admin-theme-surface);
  color: var(--admin-theme-contrast);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
}

.admin-dark .confirm-dialog p {
  color: var(--admin-theme-muted);
}

.admin-dark .confirm-secondary {
  border-color: var(--admin-theme-border-strong);
  background: var(--admin-theme-surface-soft);
  color: var(--admin-theme-contrast);
}

.admin-top-bar {
  background: linear-gradient(135deg, #071311 0%, #0f2d25 100%);
  border-bottom: 1px solid rgba(53, 208, 190, 0.22);
  color: #f2fbf6;
  font-size: 0.82rem;
  position: relative;
}

.admin-top-bar::after {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(53, 208, 190, 0.35),
    transparent
  );
  content: '';
}

.admin-top-bar-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.45rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 40px;
}

.admin-top-bar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.admin-top-bar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.admin-top-bar-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 800;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #74e0ae;
  flex-shrink: 0;
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #74e0ae;
  box-shadow: 0 0 8px rgba(116, 224, 174, 0.5);
}

.admin-top-bar-divider {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

.admin-top-bar-email {
  color: #94a3b8;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-top-bar-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(116, 224, 174, 0.25);
  border-radius: 8px;
  background: rgba(116, 224, 174, 0.08);
  color: #b9ead5;
  padding: 0.35rem 0.8rem;
  font-weight: 700;
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.admin-top-bar-btn:hover {
  background: rgba(116, 224, 174, 0.18);
  border-color: rgba(116, 224, 174, 0.45);
  color: #f2fbf6;
}

.admin-top-bar-btn svg {
  flex-shrink: 0;
}

/* Slide transition */
.bar-slide-enter-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.bar-slide-leave-active {
  transition:
    transform 0.15s ease,
    opacity 0.15s ease;
}

.bar-slide-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.bar-slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

@media (max-width: 600px) {
  .admin-top-bar-inner {
    padding: 0.35rem 0.75rem;
    min-height: 36px;
  }

  .admin-top-bar-email {
    display: none;
  }

  .admin-top-bar-divider {
    display: none;
  }

  .admin-top-bar-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 640px) {
  .toast-region {
    right: 0.75rem;
    bottom: 0.75rem;
    width: calc(100vw - 1.5rem);
  }
}
</style>
