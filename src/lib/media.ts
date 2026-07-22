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

export function safeStorageFileName(fileName: string) {
  return fileName
    .replace(/[^\w.\- ]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}
