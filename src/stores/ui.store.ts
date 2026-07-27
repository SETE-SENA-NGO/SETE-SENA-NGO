import { defineStore } from 'pinia'
import { ref } from 'vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'

function getInitialDarkMode() {
  if (typeof window === 'undefined') return false

  const savedTheme = window.localStorage.getItem('admin-theme')
  if (savedTheme) return savedTheme === 'dark'

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(darkMode: boolean) {
  if (typeof document === 'undefined') return

  document.documentElement.classList.toggle('admin-dark', darkMode)
  document.documentElement.classList.toggle('dark', darkMode)
  window.localStorage.setItem('admin-theme', darkMode ? 'dark' : 'light')
}

function applySidebarState(open: boolean) {
  if (typeof document === 'undefined') return

  document.documentElement.classList.toggle('admin-sidebar-open', open)
}

function getInitialSidebarOpen() {
  if (typeof window === 'undefined') return false
  if (window.innerWidth < 900) return false

  const stored = window.localStorage.getItem('admin-sidebar-open')
  if (stored !== null) return stored === 'true'

  return true
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

  applyTheme(darkMode.value)
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

    if (typeof window !== 'undefined' && window.innerWidth >= 900) {
      window.localStorage.setItem('admin-sidebar-open', state ? 'true' : 'false')
    }
  }

  function setDarkMode(state: boolean) {
    darkMode.value = state
    applyTheme(state)
  }

  function toggleDarkMode() {
    setDarkMode(!darkMode.value)
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
  }
})
