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
    pages.value = ((data ?? []) as PageContent[]).reduce(
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
    pages.value[slug] = data as PageContent
    loading.value = false
    return data as PageContent
  }

  async function upsert(page: PageContent) {
    const payload: Partial<PageContent> = {
      slug: page.slug.trim(),
      title: page.title.trim(),
      body: page.body,
      updated_at: new Date().toISOString(),
    }

    if (page.id) {
      payload.id = page.id
    }

    const { data, error } = await supabase
      .from('pages')
      .upsert(payload, { onConflict: 'slug' })
      .select('*')
      .single()

    if (error) throw error
    if (!data) throw new Error('Page save did not return a row')

    const savedPage = data as PageContent
    pages.value[savedPage.slug] = savedPage
    return savedPage
  }

  return { pages, loading, getAll, fetchAll, fetchBySlug, upsert }
})
