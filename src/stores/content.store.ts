import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { PageContent } from '@/types/content'

export const useContentStore = defineStore('content', () => {
  const pages = ref<Record<string, PageContent>>({})
  const loading = ref(false)

  const getAll = computed(() => Object.values(pages.value))

  async function fetchAll() {
    loading.value = true
    const { data, error } = await supabase.from('pages').select('*')
    if (error) {
      loading.value = false
      throw error
    }
    pages.value = data.reduce(
      (acc, item) => {
        acc[item.slug] = item
        return acc
      },
      {} as Record<string, PageContent>,
    )
    loading.value = false
  }

  async function fetchBySlug(slug: string) {
    if (pages.value[slug]) return pages.value[slug]
    loading.value = true
    const { data, error } = await supabase.from('pages').select('*').eq('slug', slug).single()
    if (error) {
      loading.value = false
      throw error
    }
    pages.value[slug] = data
    loading.value = false
    return data
  }

  async function upsert(page: PageContent) {
    const { error } = await supabase.from('pages').upsert(page)
    if (error) throw error
    pages.value[page.slug] = page
  }

  return { pages, loading, getAll, fetchAll, fetchBySlug, upsert }
})
