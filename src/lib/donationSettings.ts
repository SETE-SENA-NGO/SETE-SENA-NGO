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

// Row shape of the canonical donation_methods table.
type DonationMethodRow = {
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

type DonationMethodUpsertRow = {
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
  updated_at: string
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

function metadataString(metadata: DonationMetadata | null, key: string) {
  const value = metadata?.[key]
  return typeof value === 'string' ? value : ''
}

function rowToMethod(row: DonationMethodRow): DonationMethod {
  const metadata = rowMetadata(row)
  const id = row.slug || row.id

  return {
    id,
    bank: row.name,
    subtitle: stringFrom(metadata.subtitle) || stringFrom(metadata.bank) || row.instructions || '',
    headerColor:
      stringFrom(metadata.headerColor) || stringFrom(metadata.header_color) || defaultColors[id] || '#1d3d5c',
    qrUrl: normalizeImageUrl(
      mediaUrl(row.qr_media) || stringFrom(metadata.qrUrl) || stringFrom(metadata.qr_url),
    ),
    accountName: row.account_name ?? 'SANTI SENA',
    accountNo: row.account_number ?? '',
    currency: row.currency ?? 'KHR / USD',
  }
}

function legacyRowToMethod(row: LegacyDonationMethodRow): DonationMethod {
  return {
    id: row.slug,
    bank: row.name,
    subtitle: metadataString(row.metadata, 'subtitle') || metadataString(row.metadata, 'bank'),
    headerColor: metadataString(row.metadata, 'header_color') || '#1d3d5c',
    qrUrl: metadataString(row.metadata, 'qr_url'),
    accountName: row.account_name || 'SANTI SENA',
    accountNo: row.account_number || '',
    currency: row.currency || 'KHR / USD',
  }
}

function methodToRow(method: DonationMethod, sortOrder: number): DonationMethodWriteRow {
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
    sort_order: sortOrder,
    is_active: true,
    metadata: {
      subtitle: method.subtitle.trim(),
      header_color: method.headerColor,
      qr_url: method.qrUrl,
    },
  }
}

function shouldTryLegacySchema(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const message = 'message' in error ? String(error.message) : ''
  return /column|schema|relation|does not exist/i.test(message)
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

export async function saveDonationMethods(methods: DonationMethod[]): Promise<void> {
  const rows = methods.map(methodToRow)

  const { data: existing, error: fetchError } = await supabase
    .from('donation_methods')
    .select('slug')
  if (fetchError) throw fetchError

  const keep = new Set(rows.map((row) => row.slug))
  const removed = ((existing ?? []) as { slug: string }[])
    .map((row) => row.slug)
    .filter((slug) => !keep.has(slug))

  if (removed.length) {
    const { error: deleteError } = await supabase
      .from('donation_methods')
      .delete()
      .in('slug', removed)
    if (deleteError) throw deleteError
  }

  if (rows.length) {
    const { error: upsertError } = await supabase
      .from('donation_methods')
      .upsert(
        rows.map((row) => ({ ...row, updated_at: new Date().toISOString() })),
        { onConflict: 'slug' },
      )
    if (upsertError) throw upsertError
  }
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
  const { data: existing, error: fetchError } = await supabase.from('donation_methods').select('slug')

  if (fetchError) {
    if (shouldTryLegacySchema(fetchError)) return saveLegacyDonationMethods(methods)
    throw fetchError
  }

  const keep = new Set(rows.map((row) => row.slug))
  const removed = ((existing ?? []) as { slug: string }[])
    .map((row) => row.slug)
    .filter((slug) => !keep.has(slug))

  if (removed.length) {
    const { error: deleteError } = await supabase
      .from('donation_methods')
      .delete()
      .in('slug', removed)
    if (deleteError) throw deleteError
  }

  if (rows.length) {
    const { error: upsertError } = await supabase
      .from('donation_methods')
      .upsert(rows, { onConflict: 'slug' })
    if (upsertError) throw upsertError
  }
}
