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

// Row shape of the donation_methods table (snake_case columns).
type DonationMethodRow = {
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
  return {
    id: row.id,
    bank: row.bank,
    subtitle: row.subtitle,
    headerColor: row.header_color || '#1d3d5c',
    qrUrl: row.qr_url,
    accountName: row.account_name,
    accountNo: row.account_no,
    currency: row.currency,
  }
}

function methodToRow(method: DonationMethod, sortOrder: number): DonationMethodRow {
  return {
    id: method.id,
    bank: method.bank.trim(),
    subtitle: method.subtitle.trim(),
    header_color: method.headerColor,
    qr_url: method.qrUrl,
    account_name: method.accountName.trim(),
    account_no: method.accountNo.trim(),
    currency: method.currency.trim(),
    sort_order: sortOrder,
  }
}

export async function fetchDonationMethods(): Promise<DonationMethod[]> {
  const { data, error } = await supabase
    .from('donation_methods')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return ((data ?? []) as DonationMethodRow[]).map(rowToMethod)
}

export async function saveDonationMethods(methods: DonationMethod[]): Promise<void> {
  const rows = methods.map(methodToRow)

  const { data: existing, error: fetchError } = await supabase
    .from('donation_methods')
    .select('id')
  if (fetchError) throw fetchError

  const keep = new Set(rows.map((row) => row.id))
  const removed = ((existing ?? []) as { id: string }[])
    .map((row) => row.id)
    .filter((id) => !keep.has(id))

  if (removed.length) {
    const { error: deleteError } = await supabase
      .from('donation_methods')
      .delete()
      .in('id', removed)
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
