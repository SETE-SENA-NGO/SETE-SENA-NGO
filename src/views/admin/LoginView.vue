<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

const router = useRouter()
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
    router.push('/admin')
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
        <input v-model="email" name="login-email" type="email" placeholder="admin@santisena.org" required autocomplete="email" />
      </label>

      <label>
        <span>Password</span>
        <input v-model="password" name="login-password" type="password" placeholder="Enter your password" required autocomplete="current-password" />
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
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1.5rem;
  position: relative;
  background: #f4f7fb;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: -40% -20%;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(37, 99, 235, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 50%, rgba(124, 58, 237, 0.06) 0%, transparent 60%);
  pointer-events: none;
}

.login-card {
  position: relative;
  width: min(420px, 100%);
  border: 1px solid #dbe3ef;
  border-radius: 24px;
  background: #ffffff;
  color: #172033;
  padding: 2.2rem;
  display: grid;
  gap: 1rem;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
}

.login-brand {
  display: grid;
  justify-items: center;
  gap: 0.45rem;
  margin-bottom: 0.5rem;
}

.brand-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.22);
}

.login-brand h1 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 900;
  color: #2563eb;
}

.brand-sub {
  margin: 0;
  font-size: 0.82rem;
  color: #667085;
  font-weight: 700;
}

.eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #667085;
}

label {
  display: grid;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 800;
  color: #334155;
}

input {
  width: 100%;
  border: 1px solid #c7d2e5;
  border-radius: 12px;
  background: #ffffff;
  color: #172033;
  padding: 0.75rem 0.85rem;
  font-size: 0.95rem;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  outline: none;
}

input::placeholder {
  color: #a6b0c3;
}

.error {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0;
  padding: 0.7rem 0.85rem;
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 12px;
  background: #fef2f2;
  color: #991b1b;
  font-size: 0.85rem;
  font-weight: 750;
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
  min-height: 48px;
  border: 1px solid #2563eb;
  border-radius: 12px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 850;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.2);
}

.submit-button:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}
</style>
