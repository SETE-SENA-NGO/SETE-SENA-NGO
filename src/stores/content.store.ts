import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import {
  explainPageSaveError,
  savePageByLocale,
  type PageLocalePayload,
} from '@/lib/pagePersistence'
import type { PageContent } from '@/types/content'
import type { SupportedLocale } from '@/i18n'

const localPagePrefix = 'santi-sena-page-content:'
const cachedPagePrefix = 'santi-sena-page-cache:'
const previousPagePrefix = 'santi-sena-page-previous:'
const missingSchemaKey = 'santi-sena-pages-schema-missing'
const pageCacheTtlMs = 7 * 24 * 60 * 60 * 1000
const previousPageCacheTtlMs = 60 * 1000

interface CachedPageRecord {
  page: PageContent
  cachedAt: number
  expiresAt: number
}

type PageChangeCallback = () => void

function normalizeLocale(locale: string | undefined): SupportedLocale {
  return locale === 'kh' ? 'kh' : 'en'
}

function pageKey(slug: string, locale: string | undefined) {
  return `${normalizeLocale(locale)}:${slug}`
}

function localStorageKey(slug: string, locale: string | undefined) {
  return `${localPagePrefix}${pageKey(slug, locale)}`
}

function cachedStorageKey(slug: string, locale: string | undefined) {
  return `${cachedPagePrefix}${pageKey(slug, locale)}`
}

function previousStorageKey(slug: string, locale: string | undefined) {
  return `${previousPagePrefix}${pageKey(slug, locale)}`
}

export const useContentStore = defineStore('content', () => {
  const pages = ref<Record<string, PageContent>>({})
  const loading = ref(false)
  const schemaMissing = ref(getInitialSchemaMissing())
  const pageChangeSubscribers = new Map<string, Set<PageChangeCallback>>()
  let realtimeStarted = false

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
    pages.value = mergeStoredFallbackPages(pages.value)
  }

  function subscribeToSlug(slug: string, callback: PageChangeCallback) {
    startRealtime()

    const callbacks = pageChangeSubscribers.get(slug) ?? new Set()
    callbacks.add(callback)
    pageChangeSubscribers.set(slug, callbacks)

    return () => {
      callbacks.delete(callback)
      if (!callbacks.size) pageChangeSubscribers.delete(slug)
    }
  }

  function startRealtime() {
    if (realtimeStarted || typeof window === 'undefined') return
    realtimeStarted = true

    supabase
      .channel('content-pages-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pages' },
        handleRealtimePageChange,
      )
      .subscribe()
  }

  function handleRealtimePageChange(payload: unknown) {
    if (!isRecord(payload)) return

    const nextPage = isPageContent(payload.new)
      ? normalizePageContent(payload.new)
      : null
    const previousPage = isPageContent(payload.old)
      ? normalizePageContent(payload.old)
      : null
    const changedSlug = nextPage?.slug ?? previousPage?.slug

    if (!changedSlug) return

    if (nextPage) {
      const key = pageKey(nextPage.slug, nextPage.locale)
      rememberPreviousPageIfChanged(pages.value[key], nextPage)
      cachePage(nextPage)
      pages.value = { ...pages.value, [key]: nextPage }
    } else if (previousPage) {
      const key = pageKey(previousPage.slug, previousPage.locale)
      const { [key]: _removedPage, ...remainingPages } = pages.value
      pages.value = remainingPages
    }

    notifyPageChange(changedSlug)
  }

  function notifyPageChange(slug: string) {
    const callbacks = pageChangeSubscribers.get(slug)
    if (!callbacks) return

    callbacks.forEach((callback) => {
      try {
        callback()
      } catch (error) {
        if (import.meta.env.DEV) console.warn('Realtime content callback failed.', error)
      }
    })
  }

  async function fetchAll() {
    if (schemaMissing.value) {
      pages.value = mergeStoredFallbackPages(pages.value)
      return
    }

    loading.value = true
    const { data, error } = await supabase.from('pages').select('*')
    if (error) {
      loading.value = false
      if (isMissingPagesTable(error)) {
        setSchemaMissingState(true)
        pages.value = mergeStoredFallbackPages(pages.value)
        return
      }
      const fallbackPages = mergeStoredFallbackPages(pages.value)
      if (Object.keys(fallbackPages).length > 0) {
        pages.value = fallbackPages
        return
      }
      throw error
    }

    const nextPages = ((data ?? []) as PageContent[]).reduce(
      (acc, item) => {
        const page = normalizePageContent(item)
        const key = pageKey(page.slug, page.locale)
        rememberPreviousPageIfChanged(pages.value[key], page)
        cachePage(page)
        acc[key] = page
        return acc
      },
      {} as Record<string, PageContent>,
    )
    pages.value = {
      ...readPreviousPages(),
      ...readCachedPages(),
      ...nextPages,
    }
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
      const fallbackPage = readStoredFallbackPage(slug, locale)
      if (fallbackPage)
        pages.value[pageKey(fallbackPage.slug, fallbackPage.locale)] =
          fallbackPage
      return fallbackPage
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
        const fallbackPage = readStoredFallbackPage(slug, locale)
        if (fallbackPage)
          pages.value[pageKey(fallbackPage.slug, fallbackPage.locale)] =
            fallbackPage
        return fallbackPage
      }
      const fallbackPage = readStoredFallbackPage(slug, locale)
      if (fallbackPage) {
        pages.value[pageKey(fallbackPage.slug, fallbackPage.locale)] =
          fallbackPage
        return fallbackPage
      }
      throw error
    }

    if (!data) {
      loading.value = false
      const fallbackPage = readStoredFallbackPage(slug, locale, false)
      if (fallbackPage) {
        pages.value[pageKey(fallbackPage.slug, fallbackPage.locale)] =
          fallbackPage
        return fallbackPage
      }
      if (locale !== 'en') return fetchBySlug(slug, 'en')
      return null
    }

    const page = normalizePageContent(data as PageContent)
    const localSaved = readStoredFallbackPage(slug, locale, false)
    if (localSaved && (localSaved.updated_at || '') > (page.updated_at || '')) {
      pages.value[key] = localSaved
      loading.value = false
      return localSaved
    }
    rememberPreviousPageIfChanged(pages.value[key], page)
    cachePage(page)
    pages.value[key] = page
    loading.value = false
    return page
  }

  async function upsert(page: PageContent) {
    const locale = normalizeLocale(page.locale)
    const slug = page.slug.trim()
    const key = pageKey(slug, locale)
    const previousPage =
      pages.value[key] ??
      readCachedPage(slug, locale) ??
      readLocalPage(slug, locale)

    if (schemaMissing.value) {
      const localPage = saveLocalPage(page)
      rememberPreviousPageIfChanged(previousPage, localPage)
      cachePage(localPage)
      pages.value[pageKey(localPage.slug, localPage.locale)] = localPage
      notifyPageChange(slug)
      return localPage
    }

    const payload: PageLocalePayload = {
      slug,
      title: page.title.trim(),
      body: page.body,
      locale,
      updated_at: new Date().toISOString(),
    }

    if (page.route_path) payload.route_path = page.route_path
    if (page.nav_group) payload.nav_group = page.nav_group
    if (page.template) payload.template = page.template
    if (page.status) payload.status = page.status

    const { data, error } = await savePageByLocale<PageContent>(payload)

    if (error) {
      if (isMissingPagesTable(error)) {
        setSchemaMissingState(true)
        const localPage = saveLocalPage(page)
        rememberPreviousPageIfChanged(previousPage, localPage)
        cachePage(localPage)
        pages.value[pageKey(localPage.slug, localPage.locale)] = localPage
        notifyPageChange(slug)
        return localPage
      }
      throw explainPageSaveError(error)
    }
    if (!data) throw new Error('Page save did not return a row')

    const savedPage = normalizePageContent(data as PageContent)
    saveLocalPage(savedPage)
    rememberPreviousPageIfChanged(previousPage, savedPage)
    cachePage(savedPage)
    pages.value[pageKey(savedPage.slug, savedPage.locale)] = savedPage
    notifyPageChange(slug)
    return savedPage
  }

  return {
    pages,
    loading,
    schemaMissing,
    getAll,
    retrySchema,
    useLocalFallback,
    subscribeToSlug,
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
  const slug = page.slug.trim()

  const localPage: PageContent = {
    ...page,
    id: page.id || `local-${slug}`,
    slug,
    title: page.title.trim(),
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

function mergeStoredFallbackPages(currentPages: Record<string, PageContent>) {
  return {
    ...readPreviousPages(),
    ...readCachedPages(),
    ...currentPages,
    ...readLocalPages(),
  }
}

function readStoredFallbackPage(
  slug: string,
  locale: SupportedLocale = 'en',
  allowEnglishFallback = true,
): PageContent | null {
  const fallbackPage =
    readLocalPage(slug, locale) ??
    readCachedPage(slug, locale) ??
    readPreviousPage(slug, locale)

  if (fallbackPage) return fallbackPage
  if (allowEnglishFallback && locale !== 'en') {
    return readStoredFallbackPage(slug, 'en', false)
  }

  return null
}

function cachePage(page: PageContent) {
  saveTimedPage(cachedStorageKey(page.slug, page.locale), page, pageCacheTtlMs)
}

function cachePreviousPage(page: PageContent) {
  saveTimedPage(
    previousStorageKey(page.slug, page.locale),
    page,
    previousPageCacheTtlMs,
  )
}

function rememberPreviousPageIfChanged(
  previousPage: PageContent | null | undefined,
  nextPage: PageContent,
) {
  if (!previousPage) return
  if (hasPageContentChanged(previousPage, nextPage))
    cachePreviousPage(previousPage)
}

function saveTimedPage(storageKey: string, page: PageContent, ttlMs: number) {
  if (typeof window === 'undefined') return

  const now = Date.now()
  const record: CachedPageRecord = {
    page: normalizePageContent(page),
    cachedAt: now,
    expiresAt: now + ttlMs,
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(record))
  } catch {
    // Local storage can be unavailable or full; the live Supabase save should still win.
  }
}

function readCachedPage(
  slug: string,
  locale: SupportedLocale = 'en',
): PageContent | null {
  return readTimedPage(cachedStorageKey(slug, locale))
}

function readPreviousPage(
  slug: string,
  locale: SupportedLocale = 'en',
): PageContent | null {
  return readTimedPage(previousStorageKey(slug, locale))
}

function readCachedPages() {
  return readTimedPages(cachedPagePrefix)
}

function readPreviousPages() {
  return readTimedPages(previousPagePrefix)
}

function readTimedPage(storageKey: string): PageContent | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return null

    const parsed = JSON.parse(raw) as unknown
    if (!isCachedPageRecord(parsed)) {
      window.localStorage.removeItem(storageKey)
      return null
    }

    if (parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(storageKey)
      return null
    }

    return normalizePageContent(parsed.page)
  } catch {
    window.localStorage.removeItem(storageKey)
    return null
  }
}

function readTimedPages(storagePrefix: string) {
  const cachedPages: Record<string, PageContent> = {}
  if (typeof window === 'undefined') return cachedPages

  const storageKeys = getStorageKeys(storagePrefix)
  for (const storageKey of storageKeys) {
    const page = readTimedPage(storageKey)
    if (page) cachedPages[pageKey(page.slug, page.locale)] = page
  }

  return cachedPages
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

  const storageKeys = getStorageKeys(localPagePrefix)
  for (const key of storageKeys) {
    const { slug, locale } = parsePageStorageKey(key, localPagePrefix)
    const page = readLocalPage(slug, locale)
    if (page) localPages[pageKey(page.slug, page.locale)] = page
  }

  return localPages
}

function getStorageKeys(storagePrefix: string) {
  const storageKeys: string[] = []
  if (typeof window === 'undefined') return storageKeys

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (key?.startsWith(storagePrefix)) storageKeys.push(key)
  }

  return storageKeys
}

function parsePageStorageKey(storageKey: string, storagePrefix: string) {
  const storedKey = storageKey.slice(storagePrefix.length)
  const separatorIndex = storedKey.indexOf(':')

  return {
    locale:
      separatorIndex >= 0
        ? normalizeLocale(storedKey.slice(0, separatorIndex))
        : ('en' as SupportedLocale),
    slug: separatorIndex >= 0 ? storedKey.slice(separatorIndex + 1) : storedKey,
  }
}

function normalizePageContent(page: PageContent): PageContent {
  return {
    ...page,
    locale: normalizeLocale(page.locale),
  }
}

function hasPageContentChanged(
  previousPage: PageContent,
  nextPage: PageContent,
) {
  return (
    previousPage.slug !== nextPage.slug ||
    previousPage.title !== nextPage.title ||
    previousPage.body !== nextPage.body ||
    normalizeLocale(previousPage.locale) !== normalizeLocale(nextPage.locale) ||
    previousPage.route_path !== nextPage.route_path ||
    previousPage.nav_group !== nextPage.nav_group ||
    previousPage.template !== nextPage.template ||
    previousPage.status !== nextPage.status
  )
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

function isCachedPageRecord(value: unknown): value is CachedPageRecord {
  return (
    isRecord(value) &&
    isPageContent(value.page) &&
    typeof value.cachedAt === 'number' &&
    typeof value.expiresAt === 'number'
  )
}
