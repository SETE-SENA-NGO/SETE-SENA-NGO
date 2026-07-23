<template>
  <div class="login-page">
    <div class="login-wrapper">
      <!-- LEFT PANEL (55%) – Santi Sena brand with dark theme -->
      <div class="left-panel">
        <!-- Background layers -->
        <div class="bg-scene" :style="bgStyle" aria-hidden="true"></div>

        <!-- Content -->
        <div class="left-content">
          <!-- Brand header -->
          <div class="brand-header">
<div class="logo-icon">
              <div class="logo-disc" aria-hidden="true">
                <img class="logo-image" :src="santiSenaLogo" alt="Santi Sena" loading="eager" />
              </div>
            </div>
            <p class="sub-brand">Peace · Community · Environment</p>
          </div>

          <!-- Welcome message -->
          <div class="welcome-section">
            <h1>
              Welcome <span class="highlight">Back!</span>
            </h1>
            <p class="description">
              Sign in to continue your journey with Santi Sena —<br />
              Where Tradition Meets Growth.
            </p>
            <div class="accent-line"></div>
          </div>

          <!-- Feature cards -->
          <div class="feature-cards">
            <div class="feature-card">
              <span class="material-icons-outlined feature-icon">security</span>
              <h4>Secure</h4>
              <p>Your data is safe with us.</p>
            </div>
            <div class="feature-card">
              <span class="material-icons-outlined feature-icon">bolt</span>
              <h4>Fast</h4>
              <p>Ultra-fast performance.</p>
            </div>
            <div class="feature-card">
              <span class="material-icons-outlined feature-icon">person_outline</span>
              <h4>User Friendly</h4>
              <p>Simple &amp; clean interface.</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="left-footer">
          <span>© 2026 Santi Sena · Cambodia</span>
        </div>
      </div>

      <!-- RIGHT PANEL (45%) – Login card -->
      <div class="right-panel">
        <div class="login-card dual-glow-card">
          <div class="card-header">
            <h2>Login</h2>
            <p>Access Sanctuary</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <!-- Email -->
            <div class="form-group">
              <label for="email">Email</label>
              <div class="input-wrapper">
                <span class="material-icons-outlined input-icon"></span>
                <input id="email" v-model="email" type="email" placeholder="Enter your email" required />
              </div>
            </div>

            <!-- Password -->
<div class="form-group">
  <label for="password">Password</label>

  <div class="input-wrapper">
    <input
      id="password"
      v-model="password"
      :type="showPassword ? 'text' : 'password'"
      placeholder="Enter your password"
      required
    />

    <button
      type="button"
      class="toggle-password"
      @click="showPassword = !showPassword"
      :aria-label="showPassword ? 'Hide password' : 'Show password'"
    >
      <!-- Eye icon (visible) -->
      <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <!-- EyeOff icon (hidden) -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
      </svg>
    </button>
  </div>
</div>



            <!-- Options -->
            <div class="form-options">
              <label class="remember-me">
                <input type="checkbox" v-model="remember" />
                <span>Remember Me</span>
              </label>
              <button type="button" class="forgot-link" :disabled="loading" @click="handlePasswordReset">
                Forgot Password?
              </button>
            </div>

            <!-- Submit -->
            <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>

            <button type="submit" class="btn-login" :disabled="loading">
              <span v-if="!loading">Login</span>
              <span v-else class="spinner">⟳</span>
            </button>
            <p v-if="successMessage" class="success-message" role="status">{{ successMessage }}</p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import leftBgLogo from '@/assets/santi_sena_logo.png'

// Use the same “white seal” logo style as the public navbar.
// The navbar uses the seal image with a white disc background.
import publicLogo from '@/assets/santi_sena_icon.ico'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'

const santiSenaLogo = publicLogo

const bgStyle = {
  backgroundImage: `url(${leftBgLogo})`,
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.length > 0 ? redirect : '/admin'
})

const handleLogin = async () => {
  errorMessage.value = null
  successMessage.value = null
  loading.value = true

  try {
    const trimmedEmail = email.value.trim()
    const pw = password.value

    await auth.login(trimmedEmail, pw)

    if (!auth.isAdmin) {
      await auth.logout()
      throw new Error('This account does not have admin access.')
    }

    // If your app later adds a route guard, it can pass through redirect automatically.
    await router.push(redirectPath.value)
  } catch (err) {
    const message = (err as Error)?.message ?? ''
    errorMessage.value = message.includes('admin access')
      ? 'This account does not have permission to access the admin panel.'
      : 'Email or password is incorrect.'
  } finally {
    loading.value = false
  }
}

const handlePasswordReset = async () => {
  errorMessage.value = null
  successMessage.value = null

  const trimmedEmail = email.value.trim()
  if (!trimmedEmail) {
    errorMessage.value = 'Enter your email first, then request a password reset.'
    return
  }

  loading.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/admin/login`,
    })
    if (error) throw error
    successMessage.value = 'Password reset email sent. Check your inbox.'
  } catch {
    errorMessage.value = 'Could not send password reset email. Please try again later.'
  } finally {
    loading.value = false
  }
}
</script>


<style scoped>
/* ── Reset & Base ── */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #0f1415;
  padding: 20px;
  overflow-x: hidden;
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}


/* ── Main Wrapper ── */
.login-wrapper {
  display: flex;
  max-width: 1360px;
  width: 100%;
  min-height: 780px;
  height: min(92vh, 860px);
  max-height: 860px;
  border-radius: 36px;
  overflow: hidden;
  background: #0f1415;
  box-shadow: 0 60px 80px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(46, 204, 113, 0.08);
  position: relative;
}

/* ── LEFT PANEL (55%) ── */
.left-panel {
  flex: 0 0 55%;
  background: #0f1415;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 38px 28px;
  isolation: isolate;
  color: #fff;
}

/* Background scene layers */
.bg-scene {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.16;
  transform: scale(0.92);
}


/* Left content */
.left-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.brand-header {
  margin-top: 8px;
  margin-bottom: 28px;
}


.logo-icon {
  margin-top: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.logo-disc {
  flex-shrink: 0;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #ffffff;
  display: grid;
  place-items: center;
}

.logo-image {
  width: 62px;
  height: 62px;
  object-fit: contain;
  display: block;
}



.sub-brand {
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(46, 204, 113, 0.25));
}

.sub-brand {
  font-size: 13px;
  font-weight: 400;
  color: rgba(174, 183, 184, 0.7);
  letter-spacing: 1.5px;
  margin-left: 4px;
  text-transform: uppercase;
}

.welcome-section {
  margin: 4px 0 28px;
}
.welcome-section h1 {
  font-size: 44px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}
.welcome-section .highlight {
  color: #2ecc71;
  text-shadow: 0 0 20px rgba(46, 204, 113, 0.4);
}
.welcome-section .description {
  font-size: 16px;
  font-weight: 400;
  color: rgba(174, 183, 184, 0.85);
  max-width: 400px;
  line-height: 1.7;
}

.accent-line {
  width: 60px;
  height: 3px;
  background: #2ecc71;
  border-radius: 4px;
  margin-top: 16px;
  box-shadow: 0 0 16px rgba(46, 204, 113, 0.5);
}

/* Feature cards */
.feature-cards {
  display: flex;
  gap: 14px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.feature-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(46, 204, 113, 0.1);
  border-radius: 20px;
  padding: 18px 20px;
  flex: 1;
  min-width: 110px;
  transition: background 0.3s, border-color 0.3s;
}
.feature-card:hover {
  background: rgba(46, 204, 113, 0.06);
  border-color: rgba(46, 204, 113, 0.2);
}
.feature-icon {
  font-size: 28px;
  color: #2ecc71;
  margin-bottom: 6px;
  filter: drop-shadow(0 0 6px rgba(46, 204, 113, 0.3));
}
.feature-card h4 {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}
.feature-card p {
  font-size: 12px;
  font-weight: 400;
  color: rgba(174, 183, 184, 0.65);
  line-height: 1.4;
}

.left-footer {
  position: relative;
  z-index: 2;
  font-size: 12px;
  color: rgba(174, 183, 184, 0.25);
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid rgba(63, 73, 74, 0.3);
}

/* ── RIGHT PANEL (45%) ── */
.right-panel {
  flex: 1;
  background: #0f1415;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  position: relative;
}

/* Dual-glow card */
.dual-glow-card {
  position: relative;
  border: 2px solid transparent;
  background: #0f1415;
  background-clip: padding-box;
  border-radius: 28px;
}

.dual-glow-card::before {
  content: '';
  position: absolute;
  top: -2px;
  bottom: -2px;
  left: -2px;
  right: -2px;
  z-index: 0;
  border-radius: 30px;
  background: linear-gradient(to right, #038a61, #3a51b5);
  opacity: 0.5;
  pointer-events: none;
  transition: opacity 0.1s;
}

.dual-glow-card:hover::before {
  background: linear-gradient(to right, #038a61, #870ae0);
  opacity: 0.2;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #0f1415;
  border-radius: 28px;
  padding: 36px 32px 32px;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(63, 73, 74, 0.3);
  box-shadow: 0 0 40px rgba(10, 227, 155, 0.04), inset 0 0 30px rgba(207, 216, 25, 0.02);
}

.card-header {
  text-align: center;
  margin-bottom: 28px;
}
.card-header h2 {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}
.card-header p {
  font-size: 13px;
  color: rgb(161, 239, 4);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 2px;
}

.login-form {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: white;

}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 20px;
  color: rgba(153, 147, 147, 0.5);
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  background: #0f1415;
  border: 1px solid rgba(63, 73, 74, 0.4);
  border-radius: 16px;
  padding: 14px 48px 14px 48px;
  font-family: 'Manrope', sans-serif;
  font-size: 15px;
  color: #fff;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.input-wrapper input::placeholder {
  color: rgba(87, 117, 201, 0.35);
}
.input-wrapper input:focus {
  border-color: #cc752e;
  box-shadow: 0 0 0 4px rgba(66, 17, 200, 0.12);
}
.input-wrapper input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px #0f1415 inset;
  -webkit-text-fill-color: #fff;
}

.toggle-password {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: rgba(174, 183, 184, 0.4);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}
.toggle-password:hover {
  color: rgba(174, 183, 184, 0.7);
}
.toggle-password .material-icons-outlined {
  font-size: 20px;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 2px 0 4px;
}

.error-message {
  margin: -4px 0 0;
  border: 1px solid rgba(248, 113, 113, 0.35);
  border-radius: 12px;
  background: rgba(127, 29, 29, 0.28);
  color: #fecaca;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  padding: 10px 12px;
}

.success-message {
  margin: -4px 0 0;
  border: 1px solid rgba(74, 222, 128, 0.35);
  border-radius: 12px;
  background: rgba(20, 83, 45, 0.28);
  color: #bbf7d0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  padding: 10px 12px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}
.remember-me input[type='checkbox'] {
  width: 17px;
  height: 17px;
  accent-color: #fdfdfd;
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(63, 73, 74, 0.4);
  border-radius: 4px;
}
.forgot-link {
  border: 0;
  background: transparent;
  font-size: 14px;
  color: #56ff02;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}
.forgot-link:hover {
  color: #040404;
  text-decoration: underline;
}

.forgot-link:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.btn-login {
  padding: 16px;
  border-radius: 30px;
  border: none;
  background: linear-gradient(90deg, #2ecc36 0%, #f2e7ce 100%);
  color: #000202;
  font-family: 'Manrope', sans-serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.3s;
  box-shadow: 0 0 30px rgba(53, 18, 209, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-login:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 0 50px rgba(15, 49, 29, 0.4);
}
.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
.btn-login .spinner {
  font-size: 20px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 4px 0 2px;
}
.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(0, 0, 0, 0.3);
}
.divider-text {
  font-size: 12px;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.social-buttons {
  display: flex;
  gap: 10px;
}
.social-btn {
  flex: 1;
  padding: 12px 8px;
  border-radius: 30px;
  border: 1px solid rgba(206, 209, 209, 0.3);
  background: transparent;
  font-family: 'Manrope', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.25s;
}
.social-btn:hover {
  background: rgba(46, 204, 113, 0.06);
  border-color: rgba(46, 204, 113, 0.25);
  color: #000000;
}
.social-svg {
  width: 18px;
  height: 18px;
}

.signup-link {
  text-align: center;
  font-size: 14px;
  color:white;
  margin-top: 4px;
}
.signup-link a {
  color: #2ecc71;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s;
}
.signup-link a:hover {
  color: #fff;
  text-decoration: underline;
}

.material-icons-outlined {
  font-family: 'Material Icons Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
}

@media (max-width: 1024px) {
  .login-page {
    align-items: flex-start;
    padding: 18px;
    overflow-y: auto;
  }

  .login-wrapper {
    flex-direction: column;
    height: auto;
    max-height: none;
    min-height: 0;
    border-radius: 24px;
    gap: 10px;
  }

  .left-panel {
    flex: 0 0 100%;
    min-height: 0;
    padding: 28px 24px 20px;
  }

  .right-panel {
    flex: 0 0 100%;
    padding: 28px 20px;
  }

  .login-card {
    max-width: 100%;
    padding: 28px 24px;
  }

  .welcome-section h1 {
    font-size: 34px;
  }

  .welcome-section .description br {
    display: none;
  }

  .feature-cards {
    flex-wrap: wrap;
  }

  .feature-card {
    flex: 1 1 30%;
    min-width: 100px;
  }
}

@media (max-width: 720px) {
  .login-page {
    padding: 12px;
  }

  .login-wrapper {
    border-radius: 22px;
  }

  .left-panel {
    padding: 22px 18px 18px;
  }

  .brand-header {
    margin-bottom: 20px;
  }

  .logo-icon {
    margin-top: 0;
  }

  .logo-image {
    width: 64px;
    height: 68px;
  }

  .sub-brand {
    font-size: 11px;
    letter-spacing: 1px;
  }

  .welcome-section {
    margin-bottom: 20px;
  }

  .feature-cards {
    gap: 10px;
  }

  .feature-card {
    padding: 14px;
    border-radius: 16px;
  }

  .right-panel {
    padding: 22px 16px;
  }

  .form-options {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 0;
  }

  .login-wrapper {
    min-height: 100vh;
    border-radius: 0;
  }

  .left-panel {
    padding: 20px 16px 16px;
  }

  .welcome-section h1 {
    font-size: 28px;
  }

  .welcome-section .description {
    font-size: 14px;
  }

  .feature-card {
    flex: 1 1 100%;
    min-width: 0;
  }

  .right-panel {
    align-items: flex-start;
    padding: 18px 12px 24px;
  }

  .login-card {
    padding: 20px 16px;
    border-radius: 22px;
  }

  .dual-glow-card::before {
    border-radius: 24px;
  }

  .social-buttons {
    flex-direction: column;
  }

  .card-header h2 {
    font-size: 26px;
  }
}

@media (max-height: 760px) and (min-width: 1025px) {
  .login-wrapper {
    min-height: 0;
  }

  .left-panel {
    padding-top: 28px;
  }

  .logo-icon {
    margin-top: 0;
  }

  .brand-header,
  .welcome-section {
    margin-bottom: 18px;
  }

  .feature-card {
    padding: 14px 16px;
  }

  .login-card {
    padding: 28px 28px 26px;
  }
}

</style>
