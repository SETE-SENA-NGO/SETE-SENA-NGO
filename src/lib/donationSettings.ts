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

export type DonationSettings = {
  methods: DonationMethod[]
}

export const donationSettingsSlug = 'donation-qr'
export const donationSettingsKind = 'santi-sena-donation-settings'

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

export function serializeDonationSettings(settings: DonationSettings): string {
  return JSON.stringify({
    kind: donationSettingsKind,
    version: 2,
    methods: settings.methods,
  })
}

export function parseDonationSettings(body: string): DonationSettings | null {
  try {
    const parsed = JSON.parse(body) as unknown
    if (!isRecord(parsed) || parsed.kind !== donationSettingsKind) return null

    // Current format (version 2): methods is an array of banks.
    if (Array.isArray(parsed.methods)) {
      return {
        methods: parsed.methods.filter(isRecord).map((method) => ({
          id: getString(method, 'id') || crypto.randomUUID(),
          bank: getString(method, 'bank'),
          subtitle: getString(method, 'subtitle'),
          headerColor: getString(method, 'headerColor') || '#1d3d5c',
          qrUrl: getString(method, 'qrUrl'),
          accountName: getString(method, 'accountName'),
          accountNo: getString(method, 'accountNo'),
          currency: getString(method, 'currency'),
        })),
      }
    }

    // Legacy format (version 1): fixed { aba, acleda } record.
    if (isRecord(parsed.methods)) {
      const legacyMethods = parsed.methods
      return {
        methods: defaultDonationMethods().map((base) => {
          const legacy = legacyMethods[base.id]
          if (!isRecord(legacy)) return base
          return {
            ...base,
            qrUrl: getString(legacy, 'qrUrl'),
            accountName: getString(legacy, 'accountName') || base.accountName,
            accountNo: getString(legacy, 'accountNo') || base.accountNo,
            currency: getString(legacy, 'currency') || base.currency,
          }
        }),
      }
    }

    return null
  } catch {
    return null
  }
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key]
  return typeof value === 'string' ? value : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}
