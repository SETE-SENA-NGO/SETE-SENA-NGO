import { ref } from 'vue'
import { useContentStore } from '@/stores/content.store'
import type { PageContent } from '@/types/content'

function createDraft(initial?: PageContent): PageContent {
  return initial
    ? { ...initial }
    : {
        id: '',
        slug: '',
        title: '',
        body: '',
        updated_at: '',
      }
}

export function useContentEditor(initial?: PageContent) {
  const store = useContentStore()
  const draft = ref<PageContent>(createDraft(initial))

  async function save() {
    const savedPage = await store.upsert(draft.value)
    draft.value = createDraft(savedPage)
    return savedPage
  }

  function reset(initial?: PageContent) {
    draft.value = createDraft(initial)
  }

  return { draft, save, reset }
}
