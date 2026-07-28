export type EditableSection = {
  id: string
  label: string
  heading: string
  body: string
  items: string
  image?: string
}

export type PublishedPageContent = {
  slug: string
  route: string
  group: string
  title: string
  eyebrow: string
  headline: string
  intro: string
  primaryAction: string
  secondaryAction: string
  sections: EditableSection[]
  updatedAt: string
}

type StoredPageBody = {
  kind: 'santi-sena-page-content'
  version: 1
  route: string
  group: string
  eyebrow: string
  headline: string
  intro: string
  primaryAction: string
  secondaryAction: string
  sections: EditableSection[]
}

export type PublishedPageRow = {
  slug: string
  title: string
  body: string
  updated_at: string | null
}

export const contentKind = 'santi-sena-page-content'

export function parsePublishedPage(row: PublishedPageRow): any {
  if (!row || !row.body) return null
  try {
    const parsed = JSON.parse(row.body) as unknown
    if (!isRecord(parsed)) return null

    if (parsed.kind === contentKind) {
      return {
        slug: row.slug,
        title: row.title || getString(parsed, 'headline') || row.slug,
        route: getString(parsed, 'route'),
        group: getString(parsed, 'group'),
        eyebrow: getString(parsed, 'eyebrow'),
        headline: getString(parsed, 'headline'),
        intro: getString(parsed, 'intro'),
        primaryAction: getString(parsed, 'primaryAction'),
        secondaryAction: getString(parsed, 'secondaryAction'),
        sections: getSections(parsed.sections),
        updatedAt: row.updated_at ?? '',
      }
    }

    return {
      ...(parsed as Record<string, unknown>),
      slug: row.slug,
      title: row.title || row.slug,
      route: '',
      group: '',
      eyebrow: (parsed as any).hero?.eyebrow || (parsed as any).eyebrow || '',
      headline: (parsed as any).hero?.title || (parsed as any).headline || '',
      intro: (parsed as any).hero?.description || (parsed as any).intro || '',
      primaryAction: '',
      secondaryAction: '',
      sections: Array.isArray((parsed as any).sections) ? getSections((parsed as any).sections) : [],
      updatedAt: row.updated_at ?? '',
    }
  } catch {
    return null
  }
}

export function sectionItems(section: EditableSection) {
  return section.items
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

function parseStoredBody(body: string): StoredPageBody | null {
  try {
    const parsed = JSON.parse(body) as unknown
    if (!isRecord(parsed) || parsed.kind !== contentKind) return null

    return {
      kind: contentKind,
      version: 1,
      route: getString(parsed, 'route'),
      group: getString(parsed, 'group'),
      eyebrow: getString(parsed, 'eyebrow'),
      headline: getString(parsed, 'headline'),
      intro: getString(parsed, 'intro'),
      primaryAction: getString(parsed, 'primaryAction'),
      secondaryAction: getString(parsed, 'secondaryAction'),
      sections: getSections(parsed.sections),
    }
  } catch {
    return null
  }
}

function getSections(value: unknown): EditableSection[] {
  if (!Array.isArray(value)) return []

  return value.filter(isRecord).map((section) => ({
    id: getString(section, 'id') || crypto.randomUUID(),
    label: getString(section, 'label') || 'Section',
    heading: getString(section, 'heading'),
    body: getString(section, 'body'),
    items: getString(section, 'items'),
    image: getString(section, 'image'),
  }))
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key]
  return typeof value === 'string' ? value : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}
