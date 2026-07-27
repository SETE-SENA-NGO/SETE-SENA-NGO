import { onMounted, onUnmounted, type ComputedRef, type Ref } from 'vue'

/**
 * Warns before the browser tab closes/navigates away while there are
 * unsaved changes, so in-progress admin edits aren't lost silently.
 */
export function useUnsavedChangesGuard(hasChanges: Ref<boolean> | ComputedRef<boolean>) {
  function warnBeforeUnload(event: BeforeUnloadEvent) {
    if (!hasChanges.value) return
    event.preventDefault()
    event.returnValue = ''
  }

  onMounted(() => {
    window.addEventListener('beforeunload', warnBeforeUnload)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', warnBeforeUnload)
  })
}
