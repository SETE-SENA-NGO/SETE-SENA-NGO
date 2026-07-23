export type ActionLink = {
  label: string
  to: string
}

export type ContactHeadquarters = {
  eyebrow: string
  title: string
  intro: string
  type: string
  name: string
  address: string
  email: string
  phone: string
  hours: string
  image: string
  imageAlt: string
}

export type ContactOfficeIntro = {
  eyebrow: string
  title: string
  body: string
}

export type ContactOffice = {
  id: string
  tab: string
  title: string
  type: string
  provinceName: string
  address: string
  phone: string
  email: string
  contact: string
  mapLabel: string
  mapImage: string
  pinLeft: string
  pinTop: string
  countryPinLeft?: string
  countryPinTop?: string
}

export type ContactFormContent = {
  chooserLabel: string
  introEyebrow: string
  title: string
  body: string
  logoImage: string
  logoAlt: string
  kicker: string
  emailTab: string
  emailType: string
  emailHeading: string
  emailFieldLabel: string
  emailPlaceholder: string
  emailButtonLabel: string
  emailSentLabel: string
  emailStatus: string
  telegramTab: string
  telegramType: string
  telegramHeading: string
  telegramButtonLabel: string
  telegramSentLabel: string
  telegramStatus: string
  nameLabel: string
  namePlaceholder: string
  subjectLabel: string
  subjectPlaceholder: string
  messageLabel: string
  messagePlaceholder: string
  requiredLabel: string
  optionalLabel: string
  messageMaxLength: number
}

export type TelegramContactContent = {
  qrImage: string
  qrAlt: string
  url: string
  openLabel: string
}

export type ContactVisitContent = {
  eyebrow: string
  title: string
  notes: string[]
  primaryCta: ActionLink
  secondaryCta: ActionLink
  backgroundImage: string
}

export type ContactPageContent = {
  headquarters: ContactHeadquarters
  officesIntro: ContactOfficeIntro
  offices: ContactOffice[]
  form: ContactFormContent
  telegram: TelegramContactContent
  visit: ContactVisitContent
}

type LegacySection = {
  id: string
  label: string
  heading: string
  body: string
  items: string
}

type LegacyPageBody = {
  kind?: string
  eyebrow?: string
  headline?: string
  intro?: string
  sections?: LegacySection[]
}

export const contactPageSlug = 'contact'

export const fallbackContactContent: ContactPageContent = {
  headquarters: {
    eyebrow: 'Contact us',
    title: 'Our headquarters in Cambodia',
    intro:
      'Our Svay Rieng headquarters is the main contact point for partnerships, donor coordination, visits and support for village programs across Cambodia.',
    type: 'Head office',
    name: 'Our headquarters in Svay Rieng',
    address: 'Svay Rieng Town, Svay Rieng Province, Kingdom of Cambodia',
    email: 'info@santisena.org',
    phone: '+855 (0) 12 345 678',
    hours: 'Monday - Friday, 8:00 - 17:00',
    image: '/images/programs/hero-1.jpg',
    imageAlt: 'Santi Sena team meeting in Cambodia',
  },
  officesIntro: {
    eyebrow: 'Contact us',
    title: 'Our offices across Cambodia',
    body:
      'Santi Sena works from the head office and a provincial field office. Choose an office below to see the best contact details for your visit or message.',
  },
  offices: [
    {
      id: 'all',
      tab: 'Cambodia',
      title: 'Santi Sena offices in Cambodia',
      type: 'All provinces',
      provinceName: 'Cambodia',
      address: 'Head office in Svay Rieng with field office support in Prey Veng',
      phone: '+855 (0) 12 345 678',
      email: 'info@santisena.org',
      contact: 'Select a province above to view that province map and office details.',
      mapLabel: 'Cambodia offices',
      mapImage: '',
      pinLeft: '62%',
      pinTop: '54%',
    },
    {
      id: 'head-office',
      tab: 'Svay Rieng',
      title: 'Svay Rieng Head Office',
      type: 'Head office',
      provinceName: 'Svay Rieng Province',
      address: 'Svay Rieng Town, Svay Rieng Province, Kingdom of Cambodia',
      phone: '+855 (0) 12 345 678',
      email: 'info@santisena.org',
      contact: 'General coordination, donors, partners and project visits',
      mapLabel: 'Santi Sena Head Office',
      mapImage: '',
      pinLeft: '61.8%',
      pinTop: '81.4%',
      countryPinLeft: '61.8%',
      countryPinTop: '81.4%',
    },
    {
      id: 'prey-veng-office',
      tab: 'Prey Veng',
      title: 'Prey Veng Field Office',
      type: 'Field office',
      provinceName: 'Prey Veng Province',
      address: 'Prey Veng Town, Prey Veng Province, Cambodia',
      phone: '+855 (0) 12 111 222',
      email: 'preyveng@santisena.org',
      contact: 'Environment, livelihood and education program coordination',
      mapLabel: 'Prey Veng Field Office',
      mapImage: '',
      pinLeft: '53.5%',
      pinTop: '72.4%',
      countryPinLeft: '53.5%',
      countryPinTop: '72.4%',
    },
  ],
  form: {
    chooserLabel: 'Choose how to contact us',
    introEyebrow: 'Write to us',
    title: 'Send a message to our team',
    body:
      'Share your question, visit request, or partnership idea and our team will follow up from the right office.',
    logoImage: '/favicon.ico',
    logoAlt: 'Santi Sena seal',
    kicker: 'Contact form',
    emailTab: 'Email',
    emailType: 'Contact form',
    emailHeading: 'Email to Us',
    emailFieldLabel: 'Email',
    emailPlaceholder: 'name@example.com',
    emailButtonLabel: 'Send message',
    emailSentLabel: 'Message ready',
    emailStatus: 'Thank you. Your message is ready for our team.',
    telegramTab: 'Telegram',
    telegramType: 'Quick chat',
    telegramHeading: 'Telegram to Us',
    telegramButtonLabel: 'Send via Telegram',
    telegramSentLabel: 'Telegram ready',
    telegramStatus: 'Thank you. Your Telegram contact is ready for our team.',
    nameLabel: 'Name',
    namePlaceholder: 'Your full name',
    subjectLabel: 'Subject',
    subjectPlaceholder: 'What would you like to discuss?',
    messageLabel: 'Message',
    messagePlaceholder: 'Share a few details so the right team can reply.',
    requiredLabel: 'Required',
    optionalLabel: 'Optional',
    messageMaxLength: 600,
  },
  telegram: {
    qrImage: '/images/contact/telegram-qr.jpg',
    qrAlt: 'Telegram QR code for Santi Sena',
    url: 'https://t.me/sannta_close',
    openLabel: 'Open Telegram',
  },
  visit: {
    eyebrow: 'Write to us',
    title: 'A little coordination helps us welcome you well.',
    notes: [
      'Field staff are often in villages, so email replies may take 24-48 hours.',
      'Donors, partners and researchers are welcome by appointment.',
      'Village visits should be arranged through the head office two weeks in advance.',
    ],
    primaryCta: { label: 'Email us', to: 'mailto:info@santisena.org' },
    secondaryCta: { label: 'Partnership', to: '/get-involved/partner' },
    backgroundImage: '/images/programs/hero-4.jpg',
  },
}

export function parseContactCmsBody(body: string): Partial<ContactPageContent> | null {
  if (!body.trim()) return null

  try {
    const parsed = JSON.parse(body) as unknown
    if (!isRecord(parsed)) return null
    if (parsed.kind === 'santi-sena-page-content') {
      return legacyPageToContactContent(parsed as LegacyPageBody)
    }

    return parsed as Partial<ContactPageContent>
  } catch {
    return null
  }
}

export function mergeContactContent(
  base: ContactPageContent,
  override: Partial<ContactPageContent> | null,
): ContactPageContent {
  if (!override) return cloneContactContent(base)

  return {
    headquarters: mergeObject(base.headquarters, override.headquarters),
    officesIntro: mergeObject(base.officesIntro, override.officesIntro),
    offices: mergeOffices(override.offices, base.offices),
    form: mergeForm(base.form, override.form),
    telegram: mergeObject(base.telegram, override.telegram),
    visit: {
      ...mergeObject(base.visit, override.visit),
      primaryCta: mergeObject(base.visit.primaryCta, override.visit?.primaryCta),
      secondaryCta: mergeObject(base.visit.secondaryCta, override.visit?.secondaryCta),
      notes: mergeStringArray(override.visit?.notes, base.visit.notes),
    },
  }
}

export function cloneContactContent(content: ContactPageContent): ContactPageContent {
  return {
    headquarters: { ...content.headquarters },
    officesIntro: { ...content.officesIntro },
    offices: content.offices.map(cloneOffice),
    form: { ...content.form },
    telegram: { ...content.telegram },
    visit: {
      ...content.visit,
      notes: [...content.visit.notes],
      primaryCta: { ...content.visit.primaryCta },
      secondaryCta: { ...content.visit.secondaryCta },
    },
  }
}

function mergeForm(base: ContactFormContent, override: unknown): ContactFormContent {
  const merged = mergeObject(base, override)
  const maxLength = Number(merged.messageMaxLength)

  return {
    ...merged,
    messageMaxLength: Number.isFinite(maxLength) && maxLength > 0 ? maxLength : base.messageMaxLength,
  }
}

function mergeOffices(override: unknown, fallback: ContactOffice[]) {
  if (!Array.isArray(override) || !override.length) return fallback.map(cloneOffice)

  return override
    .filter(isRecord)
    .map((office, index) => normalizeOffice(office, fallback[index] ?? fallback[0]))
    .filter((office): office is ContactOffice => Boolean(office))
}

function normalizeOffice(
  office: Record<string, unknown>,
  fallback: ContactOffice | undefined,
): ContactOffice | null {
  if (!fallback && !getString(office.id)) return null

  return {
    id: getString(office.id) || fallback?.id || `office-${Date.now()}`,
    tab: getString(office.tab) || fallback?.tab || 'Office',
    title: getString(office.title) || fallback?.title || 'Office',
    type: getString(office.type) || fallback?.type || 'Field office',
    provinceName: getString(office.provinceName) || fallback?.provinceName || 'Cambodia',
    address: getString(office.address) || fallback?.address || '',
    phone: getString(office.phone) || fallback?.phone || '',
    email: getString(office.email) || fallback?.email || '',
    contact: getString(office.contact) || fallback?.contact || '',
    mapLabel: getString(office.mapLabel) || fallback?.mapLabel || 'Office location',
    mapImage: getString(office.mapImage) || fallback?.mapImage || '',
    pinLeft: getString(office.pinLeft) || fallback?.pinLeft || '50%',
    pinTop: getString(office.pinTop) || fallback?.pinTop || '50%',
    countryPinLeft: getString(office.countryPinLeft) || fallback?.countryPinLeft,
    countryPinTop: getString(office.countryPinTop) || fallback?.countryPinTop,
  }
}

function cloneOffice(office: ContactOffice): ContactOffice {
  return { ...office }
}

function legacyPageToContactContent(page: LegacyPageBody): Partial<ContactPageContent> {
  const content = cloneContactContent(fallbackContactContent)

  content.headquarters.eyebrow = page.eyebrow || content.headquarters.eyebrow
  content.headquarters.title = page.headline || content.headquarters.title
  content.headquarters.intro = page.intro || content.headquarters.intro

  const sections = Array.isArray(page.sections) ? page.sections : []
  const officeSection = sections.find((section) => section.id === 'contact-offices')
  const formSection = sections.find((section) => section.id === 'contact-form')

  if (officeSection) {
    content.officesIntro.title = officeSection.heading || content.officesIntro.title
    content.officesIntro.body = officeSection.body || content.officesIntro.body

    for (const item of parseLegacyItems(officeSection.items)) {
      const title = item.title.toLowerCase()
      if (title.includes('email')) content.headquarters.email = item.detail
      if (title.includes('phone')) content.headquarters.phone = item.detail
      if (title.includes('head office')) content.headquarters.address = item.detail
      if (title.includes('address')) content.headquarters.address = item.detail
    }
  }

  if (formSection) {
    content.form.title = formSection.heading || content.form.title
    content.form.body = formSection.body || content.form.body
  }

  return content
}

function parseLegacyItems(items: string) {
  return items
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [title, ...rest] = item.split('|').map((part) => part.trim())

      return {
        title: title || item,
        detail: rest.join(' | '),
      }
    })
}

function mergeObject<T>(base: T, override: unknown): T {
  return isRecord(override) ? ({ ...base, ...override } as T) : { ...base }
}

function mergeStringArray(override: unknown, fallback: string[]) {
  return Array.isArray(override) && override.length
    ? override.map((item) => String(item))
    : [...fallback]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : ''
}
