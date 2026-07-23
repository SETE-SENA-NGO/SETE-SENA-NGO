import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { PageContent } from '@/types/content'
import type { SupportedLocale } from '@/i18n'

const localPagePrefix = 'santi-sena-page-content:'
const missingSchemaKey = 'santi-sena-pages-schema-missing'

function normalizeLocale(locale: string | undefined): SupportedLocale {
  return locale === 'kh' ? 'kh' : 'en'
}

function pageKey(slug: string, locale: string | undefined) {
  return `${normalizeLocale(locale)}:${slug}`
}

function localStorageKey(slug: string, locale: string | undefined) {
  return `${localPagePrefix}${pageKey(slug, locale)}`
}

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
        acc[pageKey(item.slug, item.locale)] = item
        return acc
      },
      {} as Record<string, PageContent>,
    )
    loading.value = false
  }

  async function fetchBySlug(
    slug: string,
    requestedLocale: SupportedLocale = 'en',
  ): Promise<PageContent | null> {
    const locale = normalizeLocale(requestedLocale)
    const key = pageKey(slug, locale)

    if (pages.value[key]) return pages.value[key]
    if (schemaMissing.value) {
      const localPage =
        readLocalPage(slug, locale) ??
        (locale !== 'en' ? readLocalPage(slug, 'en') : null)
      if (localPage)
        pages.value[pageKey(localPage.slug, localPage.locale)] = localPage
      return localPage
    }

    loading.value = true

    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('locale', locale)
      .maybeSingle()

    if (error) {
      loading.value = false
      if (isMissingPagesTable(error)) {
        setSchemaMissingState(true)
        const localPage =
          readLocalPage(slug, locale) ??
          (locale !== 'en' ? readLocalPage(slug, 'en') : null)
        if (localPage)
          pages.value[pageKey(localPage.slug, localPage.locale)] = localPage
        return localPage
      }
      throw error
    }

    if (!data) {
      loading.value = false
      if (locale !== 'en') return fetchBySlug(slug, 'en')
      return null
    }

    pages.value[key] = data as PageContent
    loading.value = false
    return data as PageContent
  }

  async function upsert(page: PageContent) {
    if (schemaMissing.value) {
      const localPage = saveLocalPage(page)
      pages.value[pageKey(localPage.slug, localPage.locale)] = localPage
      return localPage
    }

    const payload: Partial<PageContent> = {
      slug: page.slug.trim(),
      title: page.title.trim(),
      body: page.body,
      locale: normalizeLocale(page.locale),
      updated_at: new Date().toISOString(),
    }

    if (page.route_path) payload.route_path = page.route_path
    if (page.nav_group) payload.nav_group = page.nav_group
    if (page.template) payload.template = page.template
    if (page.status) payload.status = page.status

    const { data, error } = await supabase
      .from('pages')
      .upsert(payload, { onConflict: 'slug,locale' })
      .select('*')
      .single()

    if (error) {
      if (isMissingPagesTable(error)) {
        setSchemaMissingState(true)
        const localPage = saveLocalPage(page)
        pages.value[pageKey(localPage.slug, localPage.locale)] = localPage
        return localPage
      }
      if (isMissingLocaleConflict(error)) {
        throw new Error(
          'Supabase pages must support one row per language. Run supabase/migrations/0005_page_locale_uniqueness.sql, then reload the Supabase schema cache.',
        )
      }
      throw error
    }
    if (!data) throw new Error('Page save did not return a row')

    const savedPage = data as PageContent
    pages.value[pageKey(savedPage.slug, savedPage.locale)] = savedPage
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
  return false
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
    locale: normalizeLocale(page.locale),
    updated_at: new Date().toISOString(),
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      localStorageKey(localPage.slug, localPage.locale),
      JSON.stringify(localPage),
    )
  }

  return localPage
}

function readLocalPage(
  slug: string,
  locale: SupportedLocale = 'en',
): PageContent | null {
  if (typeof window === 'undefined') return null

  try {
    const raw =
      window.localStorage.getItem(localStorageKey(slug, locale)) ??
      (locale === 'en'
        ? window.localStorage.getItem(`${localPagePrefix}${slug}`)
        : null)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    return isPageContent(parsed)
      ? { ...parsed, locale: normalizeLocale(parsed.locale) }
      : null
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

    const storedKey = key.slice(localPagePrefix.length)
    const separatorIndex = storedKey.indexOf(':')
    const locale =
      separatorIndex >= 0 ? normalizeLocale(storedKey.slice(0, separatorIndex)) : 'en'
    const slug =
      separatorIndex >= 0 ? storedKey.slice(separatorIndex + 1) : storedKey
    const page = readLocalPage(slug, locale)
    if (page) localPages[pageKey(page.slug, page.locale)] = page
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

  return (
    code === 'PGRST205' ||
    (body.includes('pages') && body.includes('schema cache'))
  )
}

function isMissingLocaleConflict(error: unknown) {
  if (!isRecord(error)) return false

  const code = getString(error.code)
  const message = getString(error.message).toLowerCase()

  return (
    code === '42P10' ||
    (message.includes('on conflict') && message.includes('unique'))
  )
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
