import { normalizeImageUrl } from '@/lib/imageUrls'

export const EXTERNAL_MEDIA_BUCKET = 'google-drive'

export function isSupportedImageUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function imageUrlHelpText() {
  return 'Paste a public image URL. Google Drive files must be shared as "Anyone with the link".'
}

export function normalizeMediaUrl(value: string) {
  return normalizeImageUrl(value)
}

export function imageNameFromUrl(value: string) {
  try {
    const url = new URL(value)
    const lastSegment = decodeURIComponent(url.pathname.split('/').filter(Boolean).at(-1) ?? '')
    return lastSegment || url.hostname
  } catch {
    return 'Google Drive image'
  }
}
