export interface PageContent {
  id: string
  slug: string
  title: string
  body: string
  locale?: string
  updated_at: string
}

export interface MediaItem {
  id: string
  name: string
  url: string
  mime_type: string
  created_at: string
}
