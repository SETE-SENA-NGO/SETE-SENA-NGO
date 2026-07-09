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
              <img class="logo-image" :src="santiSenaLogo" alt="Santi Sena" loading="eager" />
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
      <EyeOff v-if="showPassword" :size="20" />
      <Eye v-else :size="20" />
    </button>
  </div>
</div>



            <!-- Options -->
            <div class="form-options">
              <label class="remember-me">
                <input type="checkbox" v-model="remember" />
                <span>Remember Me</span>
              </label>
              <a href="#" class="forgot-link">Forgot Password?</a>
            </div>

            <!-- Submit -->
            <button type="submit" class="btn-login" :disabled="loading">
              <span v-if="!loading">Login</span>
              <span v-else class="spinner">⟳</span>
            </button>

            <!-- Divider -->
            <div class="divider">
              <span class="divider-line"></span>
              <span class="divider-text">or continue with</span>
              <span class="divider-line"></span>
            </div>

            <!-- Social Login -->
            <div class="social-buttons">
              <button type="button" class="social-btn">
                <svg class="social-svg" viewBox="0 0 24 24">
                  <path
                    d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.73 17.1,6.73L19.05,4.72C19.05,4.72 16.32,2 12.1,2C6.5,2 2,6.5 2,12C2,17.5 6.5,22 12.1,22C17.3,22 21.5,18.3 21.5,12C21.5,11.5 21.35,11.1 21.35,11.1V11.1Z"
                    fill="currentColor"
                  />
                </svg>
                Google
              </button>
              <button type="button" class="social-btn">
                <svg class="social-svg" viewBox="0 0 24 24">
                  <path
                    d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.59 14.5,20.67 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
                    fill="currentColor"
                  />
                </svg>
                Facebook
              </button>
              <button type="button" class="social-btn">
                <svg class="social-svg" viewBox="0 0 24 24">
                  <path
                    d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06C22 6.53 17.5 2.04 12 2.04Z"
                    fill="currentColor"
                  />
                </svg>
                Apple
              </button>
            </div>

            <!-- Sign Up -->
            <p class="signup-link">
              Don't have an account? <a href="#">Sign Up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

import santiSenaLogo from '../../assets/santi-sena-logo.ico'
import leftBgLogo from '../../assets/logo.png'

const bgStyle = {
  backgroundImage: `url(${leftBgLogo})`,
}



const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log('Login attempted', {
    email: email.value,
    password: password.value,
    remember: remember.value,
  })
  loading.value = false
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
height: 100vh;
  min-height: 0;
  background: #0f1415;

  padding: 20px;
  overflow: hidden; /* keep layout inside viewport (no scroll) */
  max-height: 100vh;
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}


/* ── Main Wrapper ── */
.login-wrapper {
  display: flex;
  max-width: 1360px;
  width: 100%;
  min-height: 780px;
  height: 92vh;
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

.logo-image {
  width: 80px;
  height: 84px;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(46, 204, 113, 0.25));
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
  padding: 14px 14px 14px 48px;
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
  font-size: 14px;
  color: #56ff02;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}
.forgot-link:hover {
  color: #040404;
  text-decoration: underline;
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
  .login-wrapper {
    flex-wrap: wrap;
    height: auto;
    max-height: none;
    min-height: 0;
    border-radius: 24px;
    gap: 10px;
  }

  .left-panel {
    flex: 0 0 100%;
    min-height: 380px;
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

  .feature-cards {
    flex-wrap: wrap;
  }

  .feature-card {
    flex: 1 1 30%;
    min-width: 100px;
  }
}

@media (max-width: 480px) {
  .login-wrapper {
    border-radius: 20px;
  }

  .left-panel {
    padding: 20px 16px 16px;
    min-height: 320px;
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
    padding: 20px 14px;
  }

  .login-card {
    padding: 20px 16px;
  }

  .social-buttons {
    flex-direction: column;
  }

  .card-header h2 {
    font-size: 26px;
  }
}

</style>
