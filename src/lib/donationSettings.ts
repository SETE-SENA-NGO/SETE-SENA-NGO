import { supabase } from '@/lib/supabase'
import { normalizeImageUrl } from '@/lib/imageUrls'

export type DonationMethod = {
  id: string
  bank: string
  subtitle: string
  headerColor: string
  qrUrl: string
  accountName: string
  accountNo: string
  currency: string
}

type DonationMetadata = Record<string, unknown>

type MediaRelation = { public_url: string | null } | { public_url: string | null }[] | null

// Row shape of the canonical donation_methods table.
type DonationMethodRow = {
  id: string | null
  slug: string | null
  name: string
  instructions: string | null
  account_name: string | null
  account_number: string | null
  currency: string | null
  sort_order: number | null
  metadata: DonationMetadata | null
  qr_media?: MediaRelation
}

type LegacyDonationMethodRow = {
  slug: string
  name: string
  account_name: string | null
  account_number: string | null
  currency: string | null
  sort_order: number | null
  metadata: DonationMetadata | null
}

type DonationMethodWriteRow = {
  slug: string
  name: string
  method_type: string
  instructions: string
  account_name: string
  account_number: string
  currency: string
  sort_order: number
  is_active: boolean
  metadata: DonationMetadata
}

type DonationMethodUpsertRow = DonationMethodWriteRow & {
  updated_at: string
}

type LegacyDonationMethodWriteRow = {
  slug: string
  name: string
  account_name: string
  account_number: string
  currency: string
  sort_order: number
  is_active: boolean
  metadata: DonationMetadata
}

const defaultColors: Record<string, string> = {
  aba: '#0d2c63',
  'aba-pay': '#0d2c63',
  acleda: '#1d3d5c',
  'acleda-bank': '#1d3d5c',
}

export function createDonationMethod(overrides: Partial<DonationMethod> = {}): DonationMethod {
  return {
    id: `bank-${crypto.randomUUID()}`,
    bank: '',
    subtitle: '',
    headerColor: '#1d3d5c',
    qrUrl: '',
    accountName: 'SANTI SENA',
    accountNo: '',
    currency: 'KHR / USD',
    ...overrides,
  }
}

export function defaultDonationMethods(): DonationMethod[] {
  return [
    createDonationMethod({
      id: 'aba-pay',
      bank: 'ABA Pay',
      subtitle: 'ABA BANK - CAMBODIA',
      headerColor: '#0d2c63',
      accountNo: '000 000 000',
    }),
    createDonationMethod({
      id: 'acleda-bank',
      bank: 'ACLEDA Bank',
      subtitle: 'ACLEDA - CAMBODIA',
      headerColor: '#1d3d5c',
      accountNo: '0000 0000 000',
    }),
  ]
}

function stringFrom(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function metadataFrom(value: DonationMetadata | null): DonationMetadata {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function mediaUrl(media: MediaRelation | undefined) {
  const mediaItem = Array.isArray(media) ? media[0] : media
  return stringFrom(mediaItem?.public_url)
}

function rowToMethod(row: DonationMethodRow): DonationMethod {
  const metadata = metadataFrom(row.metadata)
  const id = row.slug || row.id || `bank-${crypto.randomUUID()}`

  return {
    id,
    bank: row.name,
    subtitle: stringFrom(metadata.subtitle) || stringFrom(metadata.bank) || row.instructions || '',
    headerColor:
      stringFrom(metadata.headerColor) ||
      stringFrom(metadata.header_color) ||
      defaultColors[id] ||
      '#1d3d5c',
    qrUrl: normalizeImageUrl(
      mediaUrl(row.qr_media) || stringFrom(metadata.qrUrl) || stringFrom(metadata.qr_url),
    ),
    accountName: row.account_name ?? 'SANTI SENA',
    accountNo: row.account_number ?? '',
    currency: row.currency ?? 'KHR / USD',
  }
}

function legacyRowToMethod(row: LegacyDonationMethodRow): DonationMethod {
  const metadata = metadataFrom(row.metadata)

  return {
    id: row.slug,
    bank: row.name,
    subtitle: stringFrom(metadata.subtitle) || stringFrom(metadata.bank) || row.name,
    headerColor:
      stringFrom(metadata.headerColor) ||
      stringFrom(metadata.header_color) ||
      defaultColors[row.slug] ||
      '#1d3d5c',
    qrUrl: normalizeImageUrl(stringFrom(metadata.qrUrl) || stringFrom(metadata.qr_url)),
    accountName: row.account_name || 'SANTI SENA',
    accountNo: row.account_number || '',
    currency: row.currency || 'KHR / USD',
  }
}

function methodMetadata(method: DonationMethod): DonationMetadata {
  return {
    subtitle: method.subtitle.trim(),
    bank: method.subtitle.trim(),
    header_color: method.headerColor,
    qr_url: method.qrUrl.trim(),
  }
}

function methodToRow(method: DonationMethod, index: number): DonationMethodWriteRow {
  const bank = method.bank.trim()
  const accountName = method.accountName.trim() || 'SANTI SENA'
  const accountNumber = method.accountNo.trim()

  return {
    slug: method.id,
    name: bank,
    method_type: 'bank_qr',
    instructions: `Scan with ${bank || 'your banking app'} or send a transfer to the Santi Sena account.`,
    account_name: accountName,
    account_number: accountNumber,
    currency: method.currency.trim() || 'KHR / USD',
    sort_order: index + 1,
    is_active: true,
    metadata: methodMetadata(method),
  }
}

function methodToLegacyRow(method: DonationMethod, index: number): LegacyDonationMethodWriteRow {
  const row = methodToRow(method, index)

  return {
    slug: row.slug,
    name: row.name,
    account_name: row.account_name,
    account_number: row.account_number,
    currency: row.currency,
    sort_order: row.sort_order,
    is_active: row.is_active,
    metadata: row.metadata,
  }
}

function shouldTryLegacySchema(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const message = 'message' in error ? String(error.message) : ''
  return /column|schema|relation|relationship|foreign key|does not exist/i.test(message)
}

async function removeMissingDonationMethods(keepSlugs: Set<string>) {
  const { data: existing, error: fetchError } = await supabase.from('donation_methods').select('slug')
  if (fetchError) throw fetchError

  const removed = ((existing ?? []) as { slug: string }[])
    .map((row) => row.slug)
    .filter((slug) => !keepSlugs.has(slug))

  if (removed.length) {
    const { error: deleteError } = await supabase.from('donation_methods').delete().in('slug', removed)
    if (deleteError) throw deleteError
  }
}

async function fetchLegacyDonationMethods(): Promise<DonationMethod[]> {
  const { data, error } = await supabase
    .from('donation_methods')
    .select('slug, name, account_name, account_number, currency, sort_order, metadata')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return ((data ?? []) as LegacyDonationMethodRow[]).map(legacyRowToMethod)
}

async function saveLegacyDonationMethods(methods: DonationMethod[]): Promise<void> {
  const rows = methods.map(methodToLegacyRow)
  await removeMissingDonationMethods(new Set(rows.map((row) => row.slug)))

  if (!rows.length) return

  const { error } = await supabase.from('donation_methods').upsert(rows, { onConflict: 'slug' })
  if (error) throw error
}

export async function fetchDonationMethods(): Promise<DonationMethod[]> {
  const { data, error } = await supabase
    .from('donation_methods')
    .select(
      'id, slug, name, method_type, instructions, account_name, account_number, currency, sort_order, is_active, metadata, qr_media:media_assets(public_url)',
    )
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    if (shouldTryLegacySchema(error)) return fetchLegacyDonationMethods()
    throw error
  }

  return ((data ?? []) as DonationMethodRow[]).map(rowToMethod)
}

export async function saveDonationMethods(methods: DonationMethod[]): Promise<void> {
  const rows = methods.map(methodToRow)

  try {
    await removeMissingDonationMethods(new Set(rows.map((row) => row.slug)))
  } catch (error) {
    if (shouldTryLegacySchema(error)) return saveLegacyDonationMethods(methods)
    throw error
  }

  if (!rows.length) return

  const timestamp = new Date().toISOString()
  const upsertRows: DonationMethodUpsertRow[] = rows.map((row) => ({
    ...row,
    updated_at: timestamp,
  }))
  const { error } = await supabase.from('donation_methods').upsert(upsertRows, { onConflict: 'slug' })

  if (error) {
    if (shouldTryLegacySchema(error)) return saveLegacyDonationMethods(methods)
    throw error
  }
}
