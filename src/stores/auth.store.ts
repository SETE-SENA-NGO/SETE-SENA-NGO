import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const adminRoles = new Set(['super_admin', 'admin', 'editor'])
const fallbackAdminEmails = new Set(
  [
    'admin@gmail.com',
    'admin@santisena.org',
    'sannsiv49@gmail.com',
    ...String(import.meta.env.VITE_ADMIN_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  ].map((email) => email.toLowerCase()),
)
const localAdminEmail = String(import.meta.env.VITE_ADMIN_EMAIL ?? 'admin@gmail.com').toLowerCase()
const localAdminPassword = String(import.meta.env.VITE_ADMIN_PASSWORD ?? 'password123')
const localSessionKey = 'santi-sena-local-admin-session'

export type Profile = {
  id: string
  email?: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => !!profile.value && adminRoles.has(profile.value.role))

  function createLocalAdminUser(email: string): User {
    const now = new Date().toISOString()
    return {
      id: `local-admin-${email}`,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: now,
      email,
    } as User
  }

  function setLocalAdminSession(email: string) {
    const localUser = createLocalAdminUser(email)
    user.value = localUser
    profile.value = { id: localUser.id, email, role: 'admin' }
    initialized.value = true
    localStorage.setItem(localSessionKey, email)
  }

  function restoreLocalAdminSession() {
    const email = localStorage.getItem(localSessionKey)?.toLowerCase()
    if (!email) return false
    setLocalAdminSession(email)
    return true
  }

  function fallbackProfile(authUser: User): Profile {
    const email = authUser.email?.toLowerCase() ?? ''
    return {
      id: authUser.id,
      email,
      role: fallbackAdminEmails.has(email) ? 'admin' : 'viewer',
    }
  }

  async function loadProfile(authUser: User) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', authUser.id)
      .maybeSingle()

    if (error) {
      profile.value = fallbackProfile(authUser)
      return
    }

    profile.value = (data as Profile | null) ?? fallbackProfile(authUser)
  }

  async function init() {
    if (initialized.value) return
    loading.value = true
    try {
      if (restoreLocalAdminSession()) return

      const {
        data: { session },
      } = await supabase.auth.getSession()
      user.value = session?.user ?? null
      if (user.value) {
        await loadProfile(user.value)
      }
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const normalizedEmail = email.trim().toLowerCase()
      if (normalizedEmail === localAdminEmail && password === localAdminPassword) {
        setLocalAdminSession(normalizedEmail)
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })
      if (error) throw error
      user.value = data.user
      await loadProfile(data.user)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    localStorage.removeItem(localSessionKey)
    user.value = null
    profile.value = null
  }

  return { user, profile, loading, initialized, isAuthenticated, isAdmin, init, login, logout }
})
