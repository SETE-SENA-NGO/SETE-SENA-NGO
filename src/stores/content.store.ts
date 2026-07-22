import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { PageContent } from '@/types/content'

const localPagePrefix = 'santi-sena-page-content:'
const missingSchemaKey = 'santi-sena-pages-schema-missing'

export const useContentStore = defineStore('content', () => {
  const pages = ref<Record<string, PageContent>>({})
  const loading = ref(false)
  const schemaMissing = ref(getInitialSchemaMissing())

  const getAll = computed(() => Object.values(pages.value))

  function setSchemaMissingState(value: boolean) {
    schemaMissing.value = value
    persistSchemaMissing(value)
  }

  function retrySchema() {
    setSchemaMissingState(false)
  }

  function useLocalFallback() {
    setSchemaMissingState(true)
    pages.value = { ...pages.value, ...readLocalPages() }
  }

  async function fetchAll() {
    if (schemaMissing.value) {
      pages.value = { ...pages.value, ...readLocalPages() }
      return
    }

    loading.value = true
    const { data, error } = await supabase.from('pages').select('*')
    if (error) {
      loading.value = false
      if (isMissingPagesTable(error)) {
        setSchemaMissingState(true)
        pages.value = { ...pages.value, ...readLocalPages() }
        return
      }
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

  async function fetchBySlug(slug: string): Promise<PageContent | null> {
    if (pages.value[slug]) return pages.value[slug]
    if (schemaMissing.value) {
      const localPage = readLocalPage(slug)
      if (localPage) pages.value[slug] = localPage
      return localPage
    }

    loading.value = true

    const { data, error } = await supabase.from('pages').select('*').eq('slug', slug).maybeSingle()

    if (error) {
      loading.value = false
      if (isMissingPagesTable(error)) {
        setSchemaMissingState(true)
        const localPage = readLocalPage(slug)
        if (localPage) pages.value[slug] = localPage
        return localPage
      }
      throw error
    }

    if (!data) {
      loading.value = false
      return null
    }

    pages.value[slug] = data as PageContent
    loading.value = false
    return data as PageContent
  }

  async function upsert(page: PageContent) {
    if (schemaMissing.value) {
      const localPage = saveLocalPage(page)
      pages.value[localPage.slug] = localPage
      return localPage
    }

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

    if (error) {
      if (isMissingPagesTable(error)) {
        setSchemaMissingState(true)
        const localPage = saveLocalPage(page)
        pages.value[localPage.slug] = localPage
        return localPage
      }
      throw error
    }
    if (!data) throw new Error('Page save did not return a row')

    const savedPage = data as PageContent
    pages.value[savedPage.slug] = savedPage
    return savedPage
  }

  return {
    pages,
    loading,
    schemaMissing,
    getAll,
    retrySchema,
    useLocalFallback,
    fetchAll,
    fetchBySlug,
    upsert,
  }
})

function getInitialSchemaMissing() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(missingSchemaKey) === 'true'
}

function persistSchemaMissing(value: boolean) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(missingSchemaKey, value ? 'true' : 'false')
  }
}

function saveLocalPage(page: PageContent): PageContent {
  const localPage: PageContent = {
    ...page,
    id: page.id || `local-${page.slug}`,
    updated_at: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(`${localPagePrefix}${localPage.slug}`, JSON.stringify(localPage))
  }

  return localPage
}

function readLocalPage(slug: string): PageContent | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(`${localPagePrefix}${slug}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    return isPageContent(parsed) ? parsed : null
  } catch {
    return null
  }
}

function readLocalPages() {
  const localPages: Record<string, PageContent> = {}
  if (typeof window === 'undefined') return localPages

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (!key?.startsWith(localPagePrefix)) continue

    const slug = key.slice(localPagePrefix.length)
    const page = readLocalPage(slug)
    if (page) localPages[slug] = page
  }

  return localPages
}

function isMissingPagesTable(error: unknown) {
  if (!isRecord(error)) return false

  const code = getString(error.code)
  const message = getString(error.message).toLowerCase()
  const details = getString(error.details).toLowerCase()
  const hint = getString(error.hint).toLowerCase()
  const body = `${message} ${details} ${hint}`

  return code === 'PGRST205' || (body.includes('pages') && body.includes('schema cache'))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function isPageContent(value: unknown): value is PageContent {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.slug === 'string' &&
    typeof value.title === 'string' &&
    typeof value.body === 'string' &&
    typeof value.updated_at === 'string'
  )
}
