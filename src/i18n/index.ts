import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import kh from './locales/kh.json'

export const SUPPORTED_LOCALES = ['kh', 'en'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

const STORAGE_KEY = 'locale'

function normalizeLocale(
  locale: string | null | undefined,
): SupportedLocale | null {
  if (!locale) return null

  const normalizedLocale = locale.toLowerCase()

  if (normalizedLocale.startsWith('kh') || normalizedLocale.startsWith('km'))
    return 'kh'
  if (normalizedLocale.startsWith('en')) return 'en'

  return null
}

function readStoredLocale(): SupportedLocale | null {
  try {
    return normalizeLocale(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function writeStoredLocale(locale: SupportedLocale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

function resolveInitialLocale(): SupportedLocale {
  return (
    readStoredLocale() ?? normalizeLocale(window.navigator.language) ?? 'kh'
  )
}

export function setDocumentLanguage(locale: SupportedLocale) {
  document.documentElement.lang = locale === 'kh' ? 'km-KH' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: resolveInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    kh,
  },
})

export function setLocale(locale: SupportedLocale) {
  i18n.global.locale.value = locale
  writeStoredLocale(locale)
  setDocumentLanguage(locale)
}

setDocumentLanguage(i18n.global.locale.value as SupportedLocale)
