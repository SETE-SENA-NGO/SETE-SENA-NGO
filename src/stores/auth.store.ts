import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/user'

const adminRoles = new Set<UserProfile['role']>(['super_admin', 'admin', 'editor'])

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
  const isAdmin = computed(() =>
    profile.value?.role ? adminRoles.has(profile.value.role as UserProfile['role']) : false,
  )

  function fallbackProfile(authUser: User): Profile {
    const email = authUser.email?.toLowerCase() ?? ''
    return {
      id: authUser.id,
      email,
      role: 'super_admin',
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
    user.value = null
    profile.value = null
  }

  return { user, profile, loading, initialized, isAuthenticated, isAdmin, init, login, logout }
})
