import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<unknown>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  async function init() {
    if (initialized.value) return
    loading.value = true
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      user.value = session?.user ?? null
      if (user.value) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.value.id)
          .maybeSingle()
        profile.value = data ?? { id: user.value.id, email: user.value.email ?? '', role: 'viewer' }
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
    user.value = data.user
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()
    profile.value = profileData ?? {
      id: data.user.id,
      email: data.user.email ?? '',
      role: 'viewer',
    }
    loading.value = false
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  return { user, profile, loading, initialized, isAuthenticated, init, login, logout }
})
