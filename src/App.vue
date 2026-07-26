<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FooterView from '@/layouts/FooterView.vue'
import HeaderView from '@/layouts/HeaderView.vue'
import { useLocalizedDomContent } from '@/i18n/useLocalizedDomContent'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()
const auth = useAuthStore()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const showAdminBar = computed(() => !isAdminRoute.value && auth.isAuthenticated)

// Initialize auth session
void auth.init()
useLocalizedDomContent(isAdminRoute)

function confirmModal() {
  ui.modal.onConfirm?.()
  ui.closeModal()
}

// ── Back to Dashboard ──
// Any admin page that opens a public page (via a "view page" action) should
// first do: localStorage.setItem('admin_return_path', route.path)
// before window.open(...). localStorage is shared across all tabs of the
// same origin (unlike sessionStorage, which only copies to a new tab when
// window.open is called WITHOUT 'noopener' — since our admin pages use
// 'noopener,noreferrer' for security, we need localStorage instead).
// This reads it back and clears it, so the button returns to whichever
// admin page the user actually came from. If nothing was stored (e.g. the
// user navigated to the site normally), it falls back to /admin.
function goToAdmin() {
  const returnPath = localStorage.getItem('admin_return_path')
  localStorage.removeItem('admin_return_path')
  void router.push(returnPath || '/admin')
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
            Back to Dashboard
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

  <Transition name="confirm-slide">
    <div v-if="ui.modal.open" class="confirm-overlay" @click.self="ui.closeModal">
      <section
        class="confirm-dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="ui.modal.title"
      >
        <div class="confirm-badge">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>
        <h2>{{ ui.modal.title }}</h2>
        <p v-html="ui.modal.body"></p>
        <div class="confirm-actions">
          <button type="button" class="confirm-secondary" @click="ui.closeModal">
            Cancel
          </button>
          <button type="button" class="confirm-primary" @click="confirmModal">
            Delete
          </button>
        </div>
      </section>
    </div>
  </Transition>
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
  align-items: flex-start;
  justify-items: center;
  padding-top: 12vh;
  background: rgba(15, 23, 42, 0.58);
  padding-left: 1rem;
  padding-right: 1rem;
  backdrop-filter: blur(2px);
}

.confirm-dialog {
  width: min(460px, 100%);
  border: 1px solid var(--admin-theme-border, #dbe3ef);
  border-radius: 16px;
  background: var(--admin-theme-surface, #ffffff);
  color: var(--admin-theme-contrast, #172033);
  padding: 1.25rem;
  box-shadow: var(--admin-theme-shadow, 0 24px 80px rgba(15, 23, 42, 0.25));
  text-align: center;
}

.confirm-badge {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin: 0 auto 0.85rem;
  border-radius: 14px;
  background: color-mix(in srgb, #dc2626 12%, var(--admin-theme-surface, #ffffff));
  color: #dc2626;
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
  font-weight: 600;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 0.7rem;
  margin-top: 1.25rem;
}

.confirm-secondary,
.confirm-primary {
  flex: 1;
  min-height: 42px;
  border-radius: 10px;
  padding: 0.55rem 0.9rem;
  font-weight: 850;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
}

.confirm-secondary:hover,
.confirm-primary:hover {
  transform: translateY(-1px);
}

.confirm-secondary {
  border: 1px solid var(--admin-theme-border, #dbe3ef);
  background: var(--admin-theme-surface, #ffffff);
  color: var(--admin-theme-contrast, #172033);
}

.confirm-secondary:hover {
  border-color: var(--admin-theme-border-strong, #bcc8dd);
  background: var(--admin-theme-surface-soft, #f5f8fd);
}

.confirm-primary {
  border: 1px solid #dc2626;
  background: #dc2626;
  color: #ffffff;
}

.confirm-primary:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

/* ─── Slide-down animation ─── */
.confirm-slide-enter-active {
  transition: opacity 0.2s ease;
}
.confirm-slide-enter-active .confirm-dialog {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}
.confirm-slide-leave-active {
  transition: opacity 0.15s ease;
}
.confirm-slide-leave-active .confirm-dialog {
  transition: transform 0.15s ease, opacity 0.15s ease;
}
.confirm-slide-enter-from {
  opacity: 0;
}
.confirm-slide-enter-from .confirm-dialog {
  transform: translateY(-30px) scale(0.96);
  opacity: 0;
}
.confirm-slide-leave-to {
  opacity: 0;
}
.confirm-slide-leave-to .confirm-dialog {
  transform: translateY(-20px) scale(0.97);
  opacity: 0;
}

.admin-dark .toast,
.admin-dark .confirm-overlay {
  background: rgba(0, 0, 0, 0.68);
}

.admin-dark .confirm-dialog {
  border-color: var(--admin-theme-border);
  background: var(--admin-theme-surface);
  color: var(--admin-theme-contrast);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
}

.admin-dark .confirm-dialog p {
  color: var(--admin-theme-muted);
}

.admin-dark .confirm-badge {
  background: color-mix(in srgb, #dc2626 20%, var(--admin-theme-surface));
}

.admin-dark .confirm-secondary {
  border-color: var(--admin-theme-border-strong);
  background: var(--admin-theme-surface-soft);
  color: var(--admin-theme-contrast);
}

.admin-dark .confirm-secondary:hover {
  border-color: var(--admin-theme-primary);
  background: color-mix(in srgb, var(--admin-theme-primary) 12%, var(--admin-theme-surface));
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