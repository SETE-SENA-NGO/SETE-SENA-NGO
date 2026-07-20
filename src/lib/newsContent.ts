import { supabase } from '@/lib/supabase'

export type NewsArticle = {
  id: string
  slug: string
  title: string
  summary: string
  content: string
  image: string
  date: string
  category: string
  author: string
  authorAvatar?: string
  authorBio?: string
  readTime: string
  views: number
  likes: number
  tags?: string[]
  featured: boolean
  trending: boolean
}

export type NewsPostRow = {
  id: string
  legacy_id: number | null
  slug: string
  title: string
  excerpt: string | null
  body: string | null
  status: string | null
  is_featured: boolean | null
  author_name: string | null
  read_time: string | null
  published_at: string | null
  updated_at: string | null
  metadata: Record<string, unknown> | null
  news_categories?: { name?: string | null } | { name?: string | null }[] | null
}

export const newsPostSelect =
  'id, legacy_id, slug, title, excerpt, body, status, is_featured, author_name, read_time, published_at, updated_at, metadata, news_categories(name)'

export function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `news-${Date.now()}`
  )
}

export function mapNewsPost(row: NewsPostRow): NewsArticle {
  const metadata = isRecord(row.metadata) ? row.metadata : {}
  const category = categoryName(row.news_categories)
  const date = row.published_at ?? row.updated_at ?? new Date().toISOString()

  return {
    id: row.legacy_id ? String(row.legacy_id) : row.id,
    slug: row.slug,
    title: row.title,
    summary: row.excerpt ?? '',
    content: row.body ?? '',
    image:
      getString(metadata, 'image_url') ||
      getString(metadata, 'image_path') ||
      '/images/programs/hero-1.jpg',
    date,
    category,
    author: row.author_name ?? 'Santi Sena Communications Team',
    authorAvatar: getString(metadata, 'author_avatar') || undefined,
    authorBio: getString(metadata, 'author_bio') || undefined,
    readTime: row.read_time ?? '3 min read',
    views: getNumber(metadata, 'views', 0),
    likes: getNumber(metadata, 'likes', 0),
    tags: getStringArray(metadata, 'tags', category ? [category] : []),
    featured: Boolean(row.is_featured),
    trending: Boolean(metadata.trending),
  }
}

export async function fetchPublishedNews() {
  const { data, error } = await supabase
    .from('news_posts')
    .select(newsPostSelect)
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })

  if (error) throw error
  return ((data ?? []) as NewsPostRow[]).map(mapNewsPost)
}

export async function fetchPublishedNewsArticle(identifier: string) {
  const baseQuery = supabase.from('news_posts').select(newsPostSelect).eq('status', 'published')
  const numericId = Number(identifier)

  const { data, error } = Number.isInteger(numericId)
    ? await baseQuery.eq('legacy_id', numericId).maybeSingle()
    : isUuid(identifier)
      ? await baseQuery.eq('id', identifier).maybeSingle()
      : await baseQuery.eq('slug', identifier).maybeSingle()

  if (error) throw error
  return data ? mapNewsPost(data as NewsPostRow) : null
}

function categoryName(value: NewsPostRow['news_categories']) {
  if (Array.isArray(value)) return value[0]?.name ?? 'News'
  return value?.name ?? 'News'
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key]
  return typeof value === 'string' ? value : ''
}

function getNumber(record: Record<string, unknown>, key: string, fallback: number) {
  const value = record[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function getStringArray(record: Record<string, unknown>, key: string, fallback: string[]) {
  const value = record[key]
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}
