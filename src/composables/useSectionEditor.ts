import { reactive, watch, type WatchStopHandle } from 'vue'

export interface SectionConfig {
  key: string
  getSnapshot: () => unknown
  applySnapshot: (value: any) => void
}

/**
 * Per-section Edit -> Cancel/Done workflow shared across admin content editors.
 * Each section owns its own editing/dirty/collapsed flag and a JSON snapshot
 * taken when Edit is pressed, so Cancel can revert without touching the rest
 * of the draft. Callers supply how to read/write their own draft shape via
 * getSnapshot/applySnapshot; this composable only owns the workflow state.
 */
export function useSectionEditor(sections: SectionConfig[]) {
  const keys = sections.map((s) => s.key)
  const configByKey = new Map(sections.map((s) => [s.key, s]))

  const editingSections = reactive<Record<string, boolean>>(
    Object.fromEntries(keys.map((k) => [k, false])),
  )
  const sectionDirty = reactive<Record<string, boolean>>(
    Object.fromEntries(keys.map((k) => [k, false])),
  )
  const collapsedSections = reactive<Record<string, boolean>>(
    Object.fromEntries(keys.map((k) => [k, false])),
  )
  const sectionSnapshots = reactive<Record<string, string>>(
    Object.fromEntries(keys.map((k) => [k, ''])),
  )

  function takeSectionSnapshot(key: string) {
    const config = configByKey.get(key)
    if (!config) return
    sectionSnapshots[key] = JSON.stringify(config.getSnapshot())
  }

  function hasSectionChanges(key: string): boolean {
    const config = configByKey.get(key)
    if (!config) return false
    return JSON.stringify(config.getSnapshot()) !== sectionSnapshots[key]
  }

  let stopWatch: WatchStopHandle | null = null

  function setupSectionWatch() {
    stopWatch?.()
    stopWatch = watch(
      () => Object.fromEntries(keys.map((k) => [k, hasSectionChanges(k)])),
      (changes) => {
        for (const key of keys) {
          if (changes[key] && editingSections[key] && !sectionDirty[key]) {
            sectionDirty[key] = true
          }
        }
      },
      { deep: true },
    )
  }

  function stopSectionWatch() {
    stopWatch?.()
    stopWatch = null
  }

  function toggleCollapse(key: string) {
    collapsedSections[key] = !collapsedSections[key]
  }

  function toggleEdit(key: string) {
    if (!editingSections[key]) {
      takeSectionSnapshot(key)
      sectionDirty[key] = false
      editingSections[key] = true
    } else {
      editingSections[key] = false
    }
  }

  function cancelEdit(key: string) {
    const config = configByKey.get(key)
    const snapshot = sectionSnapshots[key]
    if (config && snapshot) {
      config.applySnapshot(JSON.parse(snapshot))
    }
    sectionDirty[key] = false
    editingSections[key] = false
  }

  function resetEditingState() {
    for (const key of keys) {
      editingSections[key] = false
      sectionDirty[key] = false
    }
  }

  return {
    editingSections,
    sectionDirty,
    collapsedSections,
    sectionSnapshots,
    toggleCollapse,
    toggleEdit,
    cancelEdit,
    setupSectionWatch,
    stopSectionWatch,
    resetEditingState,
  }
}
