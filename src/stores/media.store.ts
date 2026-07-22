import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import {
  MEDIA_BUCKET,
  MAX_IMAGE_UPLOAD_SIZE,
  imageUploadHelpText,
  isAllowedImageFile,
  safeStorageFileName,
} from '@/lib/media'

export interface MediaItem {
  id: string
  bucket: string
  path: string
  name: string
  url: string
  mime_type: string
  size: number
  created_at: string
}

type MediaAssetRow = {
  id: string
  bucket: string
  path: string
  public_url: string | null
  file_name: string
  mime_type: string | null
  file_size: number | null
  created_at: string
}

type UploadErrorDetails = {
  step?: string
  googleAuthType?: string
  googleMessage?: string
  guidance?: string
  profile?: {
    role?: string | null
  } | null
  supabaseMessage?: string
}

type UploadResponsePayload = {
  error?: string
  details?: UploadErrorDetails
  media?: MediaAssetRow
}

export const useMediaStore = defineStore('media', () => {
  const items = ref<MediaItem[]>([])
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  function toMediaItem(file: MediaAssetRow): MediaItem {
    return {
      id: file.id,
      bucket: file.bucket,
      path: file.path,
      name: file.file_name,
      url: file.public_url ?? file.path,
      mime_type: file.mime_type ?? 'image/external-url',
      size: file.file_size ?? 0,
      created_at: file.created_at,
    }
  }

  async function list() {
    const { data, error: listError } = await supabase
      .from('media_assets')
      .select('id, bucket, path, public_url, file_name, mime_type, file_size, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    if (listError) throw listError

    items.value = ((data ?? []) as MediaAssetRow[]).map(toMediaItem)
  }

  async function upload(file: File) {
    if (!isAllowedImageFile(file)) {
      throw new Error(`Upload ${imageUploadHelpText()}`)
    }

    uploading.value = true
    progress.value = 10
    error.value = null

    const path = `website-images/${Date.now()}_${safeStorageFileName(file.name)}`

    try {
      const { data: uploaded, error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { upsert: false })

      if (uploadError) throw uploadError

      const publicUrl = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(uploaded.path).data
        .publicUrl

      const { data: assetRow, error: assetError } = await supabase
        .from('media_assets')
        .upsert(
          {
            bucket: MEDIA_BUCKET,
            path: uploaded.path,
            public_url: publicUrl,
            file_name: file.name,
            mime_type: file.type,
            file_size: file.size,
            folder: 'website-images',
          },
          { onConflict: 'bucket,path' },
        )
        .select('id, bucket, path, public_url, file_name, mime_type, file_size, created_at')
        .single()

      if (assetError) throw new Error(mediaDatabaseErrorMessage(assetError, 'Could not save image URL.'))

      const item = toMediaItem(assetRow as MediaAssetRow)
      items.value = [item, ...items.value.filter((existing) => existing.id !== item.id)]
      progress.value = 100
      return item
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Upload failed'
      throw e
    } finally {
      uploading.value = false
    }
  }

  async function remove(id: string) {
    const { error: assetError } = await supabase.from('media_assets').delete().eq('id', id)

    if (assetError) throw assetError
    items.value = items.value.filter((item) => item.id !== id)
  }

  return {
    items,
    uploading,
    progress,
    error,
    maxFileSize: MAX_IMAGE_UPLOAD_SIZE,
    list,
    upload,
    remove,
  }
})

function uploadErrorMessage(response: Response, payload: UploadResponsePayload | null) {
  const message = payload?.error || 'Could not upload image to Google Drive.'
  const details = payload?.details

  if (!details) return message

  const suffix = [
    details.step ? `Step: ${details.step}.` : '',
    details.profile?.role ? `Role: ${details.profile.role}.` : '',
    details.googleAuthType ? `Google auth: ${details.googleAuthType}.` : '',
    details.googleMessage ? `Google: ${details.googleMessage}.` : '',
    details.supabaseMessage ? `Supabase: ${details.supabaseMessage}.` : '',
    details.guidance ? details.guidance : '',
  ]
    .filter(Boolean)
    .join(' ')

  return suffix ? `${message} ${suffix}` : `${message} HTTP ${response.status}.`
}

function mediaDatabaseErrorMessage(error: unknown, fallback: string) {
  if (!isRecord(error)) return fallback

  const code = typeof error.code === 'string' ? error.code : ''
  const message = typeof error.message === 'string' ? error.message : fallback

  if (code === 'PGRST205' || message.toLowerCase().includes('schema cache')) {
    return 'Supabase media table is missing. Run supabase/complete_setup.sql, then try again.'
  }

  return message
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
