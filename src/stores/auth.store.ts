import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type Profile = {
  id: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle()
    profile.value = (data as Profile | null) ?? { id: userId, role: 'viewer' }
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
        await loadProfile(user.value.id)
      }
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      user.value = data.user
      await loadProfile(data.user.id)
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
