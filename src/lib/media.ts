export const MEDIA_BUCKET = 'media'
export const MAX_IMAGE_UPLOAD_SIZE = 5 * 1024 * 1024

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export function isAllowedImageFile(file: File) {
  return ALLOWED_IMAGE_MIME_TYPES.has(file.type) && file.size <= MAX_IMAGE_UPLOAD_SIZE
}

export function imageUploadHelpText() {
  return 'JPG, PNG, WebP or GIF up to 5MB.'
}

export function normalizeMediaUrl(url?: string) {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  try {
    const parsed = new URL(trimmed)
    const id = googleDriveFileIdFromUrl(parsed)
    if (id) {
      return `/api/google-drive-image?id=${encodeURIComponent(id)}`
    }
  } catch {
    return trimmed
  }

  return trimmed
}

function googleDriveFileIdFromUrl(url: URL) {
  if (url.hostname === 'drive.google.com') {
    const pathMatch = url.pathname.match(/\/(?:file\/)?d\/([^/?#]+)/)
    return pathMatch?.[1] || url.searchParams.get('id') || ''
  }

  if (url.hostname === 'lh3.googleusercontent.com') {
    const pathMatch = url.pathname.match(/\/d\/([^/?#=]+)/)
    return pathMatch?.[1] || ''
  }

  return ''
}

export function safeStorageFileName(fileName: string) {
  return fileName
    .replace(/[^\w.\- ]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

async function hashBlob(blob: Blob) {
  const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Byte-for-byte comparison so re-selecting the same QR image is rejected
// before it gets uploaded again.
export async function isSameImage(file: File, existingUrl: string) {
  try {
    const res = await fetch(existingUrl)
    if (!res.ok) return false
    const [fileHash, existingHash] = await Promise.all([hashBlob(file), hashBlob(await res.blob())])
    return fileHash === existingHash
  } catch {
    return false
  }
}
