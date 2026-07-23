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

export function normalizeMediaUrl(value: string) {
  const url = value.trim()
  if (!url) return ''

  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'drive.google.com') {
      const pathMatch = parsed.pathname.match(/\/file\/d\/([^/?#]+)/)
      const id = pathMatch?.[1] || parsed.searchParams.get('id')
      if (id) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600`
    }
  } catch {
    return url
  }

  return url
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
