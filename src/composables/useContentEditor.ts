import { ref } from 'vue'
import { useContentStore } from '@/stores/content.store'
import type { PageContent } from '@/types/content'

export function useContentEditor(initial?: PageContent) {
  const store = useContentStore()
  const draft = ref<PageContent>(
    initial || {
      id: '',
      slug: '',
      title: '',
      body: '',
      updated_at: '',
    },
  )

  async function save() {
    await store.upsert(draft.value)
  }

  function reset(initial?: PageContent) {
    draft.value = initial || {
      id: '',
      slug: '',
      title: '',
      body: '',
      updated_at: '',
    }
  }

  return { draft, save, reset }
}
