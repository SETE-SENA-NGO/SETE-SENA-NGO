import { watch } from 'vue'
import { useTheme } from 'vuetify'
import { useUiStore } from '@/stores/ui.store'

/**
 * Syncs the admin dark-mode toggle (`ui.darkMode`) with the Vuetify theme
 * instance. Should be called once in any admin view that participates in
 * dark-mode theming.
 *
 * Calling this composable multiple times in the same app is safe – it
 * simply attaches another watcher on the same reactive source.
 */
export function useAdminTheme() {
  const vuetifyTheme = useTheme()
  const ui = useUiStore()

  watch(
    () => ui.darkMode,
    (isDark) => {
      vuetifyTheme.change(isDark ? 'adminDark' : 'adminLight')
    },
    { immediate: true },
  )
}
