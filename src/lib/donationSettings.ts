import { supabase } from '@/lib/supabase'

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

type DonationMetadata = {
  bank?: unknown
  subtitle?: unknown
  headerColor?: unknown
  header_color?: unknown
  qrUrl?: unknown
  qr_url?: unknown
}

type MediaRelation = { public_url: string | null } | { public_url: string | null }[]

type DonationMethodRow = {
  id: string
  slug: string
  name: string
  method_type: string
  instructions: string | null
  account_name: string | null
  account_number: string | null
  currency: string | null
  sort_order: number
  is_active: boolean
  metadata: DonationMetadata | null
  qr_media?: MediaRelation | null
}

type LegacyDonationMethodRow = {
  id: string
  bank: string
  subtitle: string
  header_color: string
  qr_url: string
  account_name: string
  account_no: string
  currency: string
  sort_order: number
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

function stringFrom(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function rowMetadata(row: DonationMethodRow) {
  return row.metadata && typeof row.metadata === 'object' ? row.metadata : {}
}

function mediaUrl(relation?: MediaRelation | null) {
  if (!relation) return ''
  const media = Array.isArray(relation) ? relation[0] : relation
  return media?.public_url ?? ''
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
    qrUrl: mediaUrl(row.qr_media) || stringFrom(metadata.qrUrl) || stringFrom(metadata.qr_url),
    accountName: row.account_name ?? 'SANTI SENA',
    accountNo: row.account_number ?? '',
    currency: row.currency ?? 'KHR / USD',
  }
}

function legacyRowToMethod(row: LegacyDonationMethodRow): DonationMethod {
  return {
    id: row.id,
    bank: row.bank,
    subtitle: row.subtitle,
    headerColor: row.header_color || defaultColors[row.id] || '#1d3d5c',
    qrUrl: row.qr_url,
    accountName: row.account_name,
    accountNo: row.account_no,
    currency: row.currency,
  }
}

function slugFrom(method: DonationMethod, sortOrder: number) {
  const source = method.id || method.bank || `bank-${sortOrder + 1}`
  const slug = source
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || `bank-${sortOrder + 1}`
}

function methodToRow(method: DonationMethod, sortOrder: number): DonationMethodUpsertRow {
  const subtitle = method.subtitle.trim()
  const headerColor = method.headerColor || '#1d3d5c'
  const qrUrl = method.qrUrl.trim()

  return {
    slug: slugFrom(method, sortOrder),
    name: method.bank.trim(),
    method_type: 'bank_qr',
    instructions: subtitle,
    account_name: method.accountName.trim(),
    account_number: method.accountNo.trim(),
    currency: method.currency.trim(),
    sort_order: sortOrder,
    is_active: true,
    metadata: {
      bank: subtitle,
      subtitle,
      headerColor,
      header_color: headerColor,
      qrUrl,
      qr_url: qrUrl,
    },
    updated_at: new Date().toISOString(),
  }
}

function methodToLegacyRow(method: DonationMethod, sortOrder: number): LegacyDonationMethodRow {
  return {
    id: slugFrom(method, sortOrder),
    bank: method.bank.trim(),
    subtitle: method.subtitle.trim(),
    header_color: method.headerColor || '#1d3d5c',
    qr_url: method.qrUrl.trim(),
    account_name: method.accountName.trim(),
    account_no: method.accountNo.trim(),
    currency: method.currency.trim(),
    sort_order: sortOrder,
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
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return ((data ?? []) as LegacyDonationMethodRow[]).map(legacyRowToMethod)
}

async function saveLegacyDonationMethods(methods: DonationMethod[]): Promise<void> {
  const rows = methods.map(methodToLegacyRow)
  const { data: existing, error: fetchError } = await supabase.from('donation_methods').select('id')
  if (fetchError) throw fetchError

  const keep = new Set(rows.map((row) => row.id))
  const removed = ((existing ?? []) as { id: string }[])
    .map((row) => row.id)
    .filter((id) => !keep.has(id))

  if (removed.length) {
    const { error: deleteError } = await supabase.from('donation_methods').delete().in('id', removed)
    if (deleteError) throw deleteError
  }

  if (rows.length) {
    const { error: upsertError } = await supabase
      .from('donation_methods')
      .upsert(
        rows.map((row) => ({ ...row, updated_at: new Date().toISOString() })),
        { onConflict: 'id' },
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
