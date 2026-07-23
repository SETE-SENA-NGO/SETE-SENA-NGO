import type { SupportedLocale } from '@/i18n'
import { supabase } from '@/lib/supabase'

export type PageLocalePayload = {
  slug: string
  title: string
  body: string
  locale: SupportedLocale
  updated_at: string
  [key: string]: unknown
}

const PAGE_LOCALE_SCHEMA_MESSAGE =
  'Supabase pages must support one row per language. Run supabase/migrations/0007_page_locale_uniqueness.sql in production, then reload the Supabase schema cache.'

export async function savePageByLocale<T>(
  payload: PageLocalePayload,
  selectColumns = '*',
) {
  const existing = await supabase
    .from('pages')
    .select('id')
    .eq('slug', payload.slug)
    .eq('locale', payload.locale)
    .limit(1)

  if (existing.error) {
    return { data: null as T | null, error: existing.error }
  }

  const existingId = getExistingId(existing.data)
  const result = existingId
    ? await supabase
        .from('pages')
        .update(payload)
        .eq('id', existingId)
        .select(selectColumns)
        .single()
    : await supabase.from('pages').insert(payload).select(selectColumns).single()

  return {
    data: (result.data ?? null) as T | null,
    error: result.error,
  }
}

export function explainPageSaveError(error: unknown) {
  return isPageLocaleSchemaError(error) ? new Error(PAGE_LOCALE_SCHEMA_MESSAGE) : error
}

function isPageLocaleSchemaError(error: unknown) {
  if (!isRecord(error)) return false

  const code = getString(error.code)
  const message = getString(error.message).toLowerCase()
  const details = getString(error.details).toLowerCase()
  const hint = getString(error.hint).toLowerCase()
  const body = `${message} ${details} ${hint}`

  return (
    code === '42P10' ||
    code === 'PGRST204' ||
    (code === '23505' && body.includes('pages_slug_key')) ||
    (body.includes('on conflict') && body.includes('unique')) ||
    (body.includes('locale') &&
      (body.includes('schema cache') || body.includes('could not find')))
  )
}

function getExistingId(data: unknown) {
  if (!Array.isArray(data)) return ''

  const firstRow = data[0]
  return isRecord(firstRow) ? getString(firstRow.id) : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : ''
}
