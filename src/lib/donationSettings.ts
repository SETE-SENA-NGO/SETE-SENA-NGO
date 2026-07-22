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

// Row shape of the live donation_methods table. `id` is a DB-generated uuid
// we never touch from the client — `slug` ('aba' / 'acleda') is the stable
// identifier the app upserts against. The card's visual fields (bank name,
// subtitle, header color, QR image URL) live inside `metadata`; the plain
// columns hold the fields the table was originally designed around.
type DonationMethodRow = {
  slug: string
  name: string
  method_type: string
  instructions: string | null
  account_name: string | null
  account_number: string | null
  currency: string | null
  sort_order: number
  is_active: boolean
  metadata: {
    bank?: string
    subtitle?: string
    header_color?: string
    qr_url?: string
  } | null
}

export function createDonationMethod(overrides: Partial<DonationMethod> = {}): DonationMethod {
  return {
    id: crypto.randomUUID(),
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
      id: 'aba',
      bank: 'ABA Pay',
      subtitle: 'ABA BANK - CAMBODIA',
      headerColor: '#0d2c63',
      accountNo: '000 000 000',
    }),
    createDonationMethod({
      id: 'acleda',
      bank: 'ACLEDA Bank',
      subtitle: 'ACLEDA - CAMBODIA',
      headerColor: '#1d3d5c',
      accountNo: '0000 0000 000',
    }),
  ]
}

function rowToMethod(row: DonationMethodRow): DonationMethod {
  const meta = row.metadata ?? {}
  return {
    id: row.slug,
    bank: meta.bank || row.name,
    subtitle: meta.subtitle || row.instructions || '',
    headerColor: meta.header_color || '#1d3d5c',
    qrUrl: meta.qr_url || '',
    accountName: row.account_name || 'SANTI SENA',
    accountNo: row.account_number || '',
    currency: row.currency || 'KHR / USD',
  }
}

function methodToRow(method: DonationMethod, sortOrder: number): DonationMethodRow {
  return {
    slug: method.id,
    name: method.bank.trim(),
    method_type: 'bank_qr',
    instructions: method.subtitle.trim(),
    account_name: method.accountName.trim(),
    account_number: method.accountNo.trim(),
    currency: method.currency.trim(),
    sort_order: sortOrder,
    is_active: true,
    metadata: {
      bank: method.bank.trim(),
      subtitle: method.subtitle.trim(),
      header_color: method.headerColor,
      qr_url: method.qrUrl,
    },
  }
}

export async function fetchDonationMethods(): Promise<DonationMethod[]> {
  const { data, error } = await supabase
    .from('donation_methods')
    .select('slug, name, method_type, instructions, account_name, account_number, currency, sort_order, is_active, metadata')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return ((data ?? []) as DonationMethodRow[]).map(rowToMethod)
}

// Saves a single bank without touching the other fixed slot or running the
// "delete rows no longer present" cleanup — used by each card's own Save
// button so the two banks can be saved independently.
export async function saveDonationMethod(method: DonationMethod, sortOrder: number): Promise<void> {
  const row = methodToRow(method, sortOrder)
  const { error } = await supabase
    .from('donation_methods')
    .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: 'slug' })
  if (error) throw error
}
