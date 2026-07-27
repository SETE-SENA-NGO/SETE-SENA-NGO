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

export function explainPageSaveError(error: unknown): Error {
  if (error instanceof Error) {
    return error
  }

  if (!isRecord(error)) {
    return new Error(typeof error === 'string' ? error : 'An unexpected error occurred while saving the page.')
  }

  const code = getString(error.code)
  const rawMessage = getString(error.message)
  const details = getString(error.details)
  const hint = getString(error.hint)

  let friendlyMessage = ''
  let actionHint = ''

  // 1. Check if it's the multi-language schema error
  if (isPageLocaleSchemaError(error)) {
    friendlyMessage = 'Database Schema Outdated'
    actionHint = 'The database schema needs to be updated to support multi-language page storage. Please run the migration "supabase/migrations/0007_page_locale_uniqueness.sql" in your production database and reload the schema cache.'
  }
  // 2. RLS policy violation / permission denied
  else if (code === '42501' || rawMessage.toLowerCase().includes('row-level security') || rawMessage.toLowerCase().includes('permission denied')) {
    friendlyMessage = 'Permission Denied'
    actionHint = 'You do not have authorization to save page changes. Please check if you are logged in as an administrator.'
  }
  // 3. Unique key constraint (e.g. slug already exists)
  else if (code === '23505' || rawMessage.toLowerCase().includes('unique constraint') || rawMessage.toLowerCase().includes('already exists')) {
    friendlyMessage = 'Duplicate Page Identifier'
    actionHint = 'A page with this URL slug or key already exists. Please choose a different page ID or slug.'
  }
  // 4. Missing required field / constraint violation
  else if (code === '23502' || code === '23514') {
    friendlyMessage = 'Invalid Page Data'
    actionHint = 'Some required fields are missing or contain invalid data. Please verify all fields are filled out correctly.'
  }
  // 5. Table does not exist (relation error)
  else if (code === '42P01') {
    friendlyMessage = 'Database Table Missing'
    actionHint = 'The "pages" table does not exist in the database schema. Please run the SQL migrations to set up the database.'
  }
  // 6. JWT Expired / Auth token issues
  else if (code === 'PGRST301' || rawMessage.toLowerCase().includes('jwt expired') || rawMessage.toLowerCase().includes('token expired')) {
    friendlyMessage = 'Session Expired'
    actionHint = 'Your admin session has expired. Please log out and sign back in to continue editing.'
  }
  // 7. Network / connection failure
  else if (rawMessage.toLowerCase().includes('fetch') || rawMessage.toLowerCase().includes('network') || rawMessage.toLowerCase().includes('connrefused')) {
    friendlyMessage = 'Network Error'
    actionHint = 'Could not connect to the database. Please check your internet connection or try again in a few moments.'
  }
  // Default fallback
  else {
    friendlyMessage = 'Could Not Save Page'
    actionHint = 'The database rejected the request. Please review the details below or contact support.'
  }

  // Combine into a clean, human-readable message with details for developers
  let errorMessage = `${friendlyMessage}: ${actionHint}`
  
  // Append technical debug info if available
  const technicalDetails: string[] = []
  if (code) technicalDetails.push(`Code: ${code}`)
  if (rawMessage) technicalDetails.push(`Message: ${rawMessage}`)
  if (details) technicalDetails.push(`Details: ${details}`)
  if (hint) technicalDetails.push(`Hint: ${hint}`)

  if (technicalDetails.length > 0) {
    errorMessage += `\n\n[Technical details: ${technicalDetails.join(' | ')}]`
  }

  return new Error(errorMessage)
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
