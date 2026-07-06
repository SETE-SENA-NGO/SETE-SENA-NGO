import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const toasts = ref<{ id: number; message: string; type: 'success' | 'error' | 'info' }[]>([])
  const modal = ref({
    open: false,
    title: '',
    body: '',
    onConfirm: undefined as (() => void) | undefined,
  })
  const loading = ref(false)

  function addToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
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

  return { toasts, modal, loading, addToast, openModal, closeModal, setLoading }
})
