import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/types/user'

const adminRoles = new Set<UserProfile['role']>(['super_admin', 'admin', 'editor'])

function fallbackProfile(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email ?? '',
    role: 'viewer',
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isContentAdmin = computed(() => {
    return !!profile.value && adminRoles.has(profile.value.role)
  })

  async function loadProfile(currentUser: User) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, avatar_url')
      .eq('id', currentUser.id)
      .maybeSingle()

    if (error) throw error
    profile.value = (data as UserProfile | null) ?? fallbackProfile(currentUser)
    return profile.value
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
      } else {
        profile.value = null
      }
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      loading.value = false
      throw error
    }
    try {
      user.value = data.user
      const loadedProfile = await loadProfile(data.user)

      if (!adminRoles.has(loadedProfile.role)) {
        await logout()
        throw new Error('This account does not have admin access.')
      }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  return {
    user,
    profile,
    loading,
    initialized,
    isAuthenticated,
    isContentAdmin,
    init,
    login,
    logout,
  }
})
