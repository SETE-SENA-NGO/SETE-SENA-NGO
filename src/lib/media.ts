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
  return 'Paste a public Google Drive image URL.'
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
