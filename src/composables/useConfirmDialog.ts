import { ref } from 'vue'

/**
 * Local Vuetify confirm dialog, used instead of the app-wide plain-HTML
 * ui.openModal so migrated admin pages get a Vuetify-styled confirmation
 * consistent with the rest of the page.
 */
export function useConfirmDialog() {
  const open = ref(false)
  const data = ref({ title: '', body: '', onConfirm: (() => {}) as () => void })

  function confirm(title: string, body: string, onConfirm: () => void) {
    data.value = { title, body, onConfirm }
    open.value = true
  }

  return { open, data, confirm }
}
