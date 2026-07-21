import { resolveImageUrl } from '@/lib/imageUrls'

export type EditableSection = {
  id: string
  label: string
  heading: string
  body: string
  imageUrl?: string
  items: string
}

export type PublishedPageContent = {
  slug: string
  route: string
  group: string
  title: string
  eyebrow: string
  headline: string
  intro: string
  heroImageUrl: string
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
  heroImageUrl?: string
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

export function parsePublishedPage(row: PublishedPageRow): PublishedPageContent | null {
  const body = parseStoredBody(row.body)
  if (!body) return null

  return {
    slug: row.slug,
    title: row.title || body.headline || row.slug,
    route: body.route,
    group: body.group,
    eyebrow: body.eyebrow,
    headline: body.headline,
    intro: body.intro,
    heroImageUrl: resolveImageUrl(body.heroImageUrl ?? '', ''),
    primaryAction: body.primaryAction,
    secondaryAction: body.secondaryAction,
    sections: body.sections,
    updatedAt: row.updated_at ?? '',
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
      heroImageUrl: getString(parsed, 'heroImageUrl'),
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
    imageUrl: resolveImageUrl(getString(section, 'imageUrl'), ''),
    items: getString(section, 'items'),
  }))
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key]
  return typeof value === 'string' ? value : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}
