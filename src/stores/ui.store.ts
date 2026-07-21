import { defineStore } from 'pinia'
import { ref } from 'vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'

function getInitialDarkMode() {
  if (typeof window === 'undefined') return false

  const savedTheme = window.localStorage.getItem('admin-theme')
  if (savedTheme) return savedTheme === 'dark'

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function getInitialPublicDarkMode(): boolean {
  if (typeof window === 'undefined') return true // default to dark

  const saved = window.localStorage.getItem('public-dark-mode')
  if (saved !== null) return saved === 'true'

  // Default to dark mode
  return true
}

function applyTheme(darkMode: boolean) {
  if (typeof document === 'undefined') return

  document.documentElement.classList.toggle('admin-dark', darkMode)
  document.documentElement.classList.toggle('dark', darkMode)
  window.localStorage.setItem('admin-theme', darkMode ? 'dark' : 'light')
}

function applyPublicDarkMode(dark: boolean) {
  if (typeof document === 'undefined') return

  document.documentElement.classList.toggle('public-dark', dark)
  window.localStorage.setItem('public-dark-mode', dark ? 'true' : 'false')
}

function applySidebarState(open: boolean) {
  if (typeof document === 'undefined') return

  document.documentElement.classList.toggle('admin-sidebar-open', open)
}

function getInitialSidebarOpen() {
  if (typeof window === 'undefined') return false

  return window.innerWidth >= 900
}

export const useUiStore = defineStore('ui', () => {
  const toasts = ref<{ id: number; message: string; type: ToastType }[]>([])
  const modal = ref({
    open: false,
    title: '',
    body: '',
    onConfirm: undefined as (() => void) | undefined,
  })
  const loading = ref(false)
  const sidebarOpen = ref(getInitialSidebarOpen())
  const darkMode = ref(getInitialDarkMode())
  const publicDarkMode = ref(getInitialPublicDarkMode())

  applyTheme(darkMode.value)
  applyPublicDarkMode(publicDarkMode.value)
  applySidebarState(sidebarOpen.value)

  function addToast(message: string, type: ToastType = 'info') {
    const id = Date.now()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 3000)
  }

  function openModal(title: string, body: string, onConfirm?: () => void) {
    modal.value = { open: true, title, body, onConfirm }
  }

  function closeModal() {
    modal.value.open = false
  }

  function setLoading(state: boolean) {
    loading.value = state
  }

  function toggleSidebar() {
    setSidebarOpen(!sidebarOpen.value)
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  function closeSidebarForNavigation() {
    if (typeof window !== 'undefined' && window.innerWidth >= 900) return
    closeSidebar()
  }

  function setSidebarOpen(state: boolean) {
    sidebarOpen.value = state
    applySidebarState(state)
  }

  function setDarkMode(state: boolean) {
    darkMode.value = state
    applyTheme(state)
  }

  function toggleDarkMode() {
    setDarkMode(!darkMode.value)
  }

  function setPublicDarkMode(state: boolean) {
    publicDarkMode.value = state
    applyPublicDarkMode(state)
  }

  function togglePublicDarkMode() {
    setPublicDarkMode(!publicDarkMode.value)
  }

  return {
    toasts,
    modal,
    loading,
    sidebarOpen,
    darkMode,
    addToast,
    openModal,
    closeModal,
    setLoading,
    toggleSidebar,
    closeSidebar,
    closeSidebarForNavigation,
    setSidebarOpen,
    setDarkMode,
    toggleDarkMode,
    publicDarkMode,
    setPublicDarkMode,
    togglePublicDarkMode,
  }
})
