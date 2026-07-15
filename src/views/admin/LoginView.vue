<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await auth.login(email.value, password.value)
    ui.addToast('Welcome back', 'success')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'
    router.push(redirect)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Login failed. Please check your credentials.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-view">
    <div class="login-bg" aria-hidden="true"></div>
    <form class="login-card" @submit.prevent="submit">
      <div class="login-brand">
        <span class="brand-icon" aria-hidden="true"></span>
        <h1>SANTI SENA</h1>
        <p class="brand-sub">Admin panel</p>
      </div>

      <p class="eyebrow">Sign in to continue</p>

      <label>
        <span>Email address</span>
        <input
          v-model="email"
          name="login-email"
          type="email"
          placeholder="admin@gmail.com"
          required
          autocomplete="email"
        />
      </label>

      <label>
        <span>Password</span>
        <input
          v-model="password"
          name="login-password"
          type="password"
          placeholder="Enter your password"
          required
          autocomplete="current-password"
        />
      </label>

      <p v-if="error" class="error" role="alert">
        <span class="error-icon" aria-hidden="true"></span>
        {{ error }}
      </p>

      <button type="submit" class="submit-button" :disabled="submitting">
        {{ submitting ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-view {
  --admin-bg: var(--admin-theme-bg);
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

  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1.5rem;
  position: relative;
  background: var(--admin-bg);
  color: var(--admin-text);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: -40% -20%;
  background:
    radial-gradient(
      ellipse at 15% 20%,
      color-mix(in srgb, var(--admin-blue) 14%, transparent) 0%,
      transparent 55%
    ),
    radial-gradient(
      ellipse at 85% 80%,
      color-mix(in srgb, var(--admin-blue-deep) 12%, transparent) 0%,
      transparent 55%
    );
  pointer-events: none;
}

.login-card {
  position: relative;
  width: min(420px, 100%);
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: linear-gradient(135deg, var(--admin-surface-soft), var(--admin-surface));
  color: var(--admin-text);
  padding: 2.4rem 2.2rem;
  display: grid;
  gap: 1.1rem;
  box-shadow: var(--admin-shadow);
}

.login-brand {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.brand-icon {
  width: 3.1rem;
  height: 3.1rem;
  border-radius: 11px;
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
  box-shadow: 0 12px 22px rgba(15, 125, 56, 0.25);
  position: relative;
}

.brand-icon::after {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: 1.05rem;
  height: 1.05rem;
  border: 2px solid #ffffff;
  border-top: none;
  border-right: none;
  transform: translateY(-2px) rotate(-45deg);
}

.login-brand h1 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: var(--admin-blue-deep);
}

.brand-sub {
  margin: 0;
  font-size: 0.82rem;
  color: var(--admin-muted);
  font-weight: 700;
}

.eyebrow {
  margin: 0;
  text-align: center;
  color: var(--admin-blue-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

label {
  display: grid;
  gap: 0.4rem;
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--admin-contrast-soft);
}

input {
  width: 100%;
  min-height: 44px;
  border: 1.5px solid var(--admin-border-strong);
  border-radius: 10px;
  background: var(--admin-surface);
  color: var(--admin-text);
  padding: 0.65rem 0.9rem;
  font-size: 0.95rem;
  font-family: inherit;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

input:focus {
  border-color: var(--admin-blue);
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.15);
  outline: none;
}

input::placeholder {
  color: #a3b8ac;
}

.error {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0;
  padding: 0.7rem 0.85rem;
  border: 1px solid rgba(220, 38, 38, 0.22);
  border-radius: 10px;
  background: #fef2f2;
  color: #991b1b;
  font-size: 0.85rem;
  font-weight: 650;
  line-height: 1.5;
}

.error-icon {
  width: 0.65rem;
  height: 0.65rem;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #dc2626;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.14);
}

.submit-button {
  min-height: 46px;
  border: 1px solid var(--admin-blue);
  border-radius: 10px;
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  margin-top: 0.15rem;
  transition:
    background 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.12s ease;
  box-shadow: 0 12px 22px rgba(15, 125, 56, 0.25);
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(15, 125, 56, 0.3);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.8rem 1.4rem;
  }
}
</style>
