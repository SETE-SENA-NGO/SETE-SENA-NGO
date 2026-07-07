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

async function submit() {
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    ui.addToast('Welcome back', 'success')
    router.push('/admin')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Login failed'
  }
}
</script>

<template>
  <div class="login-view">
    <form class="login-card" @submit.prevent="submit">
      <h2>Admin Login</h2>
      <label>
        Email
        <input v-model="email" type="email" required />
      </label>
      <label>
        Password
        <input v-model="password" type="password" required />
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" class="primary">Sign in</button>
    </form>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}
.login-card {
  background: var(--panel);
  border: 1px solid var(--border);
  padding: 1.5rem;
  border-radius: 0.6rem;
  width: min(420px, 100%);
  display: grid;
  gap: 0.75rem;
}
.error {
  color: #f87171;
  margin: 0;
  font-size: 0.9rem;
}
.primary {
  background: var(--green);
  color: #fff;
  padding: 0.55rem 1.2rem;
  border-radius: 0.45rem;
  cursor: pointer;
  font-weight: 600;
  border: none;
  transition: background 0.2s, transform 0.15s;
}
.primary:hover {
  background: var(--green-dark);
  transform: translateY(-1px);
}
</style>
