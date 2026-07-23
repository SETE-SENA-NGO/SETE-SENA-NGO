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
  metadata?: Record<string, unknown> | null
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

type DeleteResponsePayload = {
  error?: string
  details?: UploadErrorDetails
  deleted?: boolean
}

export const useMediaStore = defineStore('media', () => {
  const items = ref<MediaItem[]>([])
  const uploading = ref(false)
  const saving = ref(false)
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

    const path = `website-images/${uniqueUploadToken()}_${safeStorageFileName(file.name) || 'image'}`

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

  async function uploadToGoogleDrive(file: File, name?: string) {
    const sessionResult = await supabase.auth.getSession()
    const accessToken = sessionResult.data.session?.access_token

    if (sessionResult.error || !accessToken) {
      throw new Error('Please log in as an admin before uploading images.')
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Only image uploads are allowed.')
    }

    saving.value = true
    progress.value = 10
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file, file.name)
      if (name?.trim()) formData.append('name', name.trim())

      const response = await fetch('/api/google-drive-upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })
      const payload = (await response.json().catch(() => null)) as UploadResponsePayload | null

      if (!response.ok || !payload?.media) {
        const message = uploadErrorMessage(response, payload)
        if (import.meta.env.DEV) {
          console.warn(
            `Google Drive upload failed: ${message}`,
            {
              status: response.status,
              step: payload?.details?.step,
              details: payload?.details,
            },
          )
        }
        throw new Error(message)
      }

      const item = toMediaItem(payload.media)
      items.value = [item, ...items.value.filter((existing) => existing.id !== item.id)]
      progress.value = 100
      return item
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Could not upload image'
      throw e
    } finally {
      saving.value = false
    }
  }

  async function remove(id: string) {
    const asset = await fetchMediaAsset(id)

    if (!asset) {
      items.value = items.value.filter((item) => item.id !== id)
      return
    }

    if (isGoogleDriveAsset(asset)) {
      await deleteGoogleDriveMediaAsset(id)
    } else {
      if (asset.bucket && asset.path && !isExternalUrl(asset.path)) {
        const { error: storageError } = await supabase.storage
          .from(asset.bucket)
          .remove([asset.path])

        if (storageError) throw storageError
      }

      const { error: assetError } = await supabase
        .from('media_assets')
        .delete()
        .eq('id', id)

      if (assetError) throw assetError
    }

    items.value = items.value.filter((item) => item.id !== id)
  }

  return {
    items,
    uploading,
    saving,
    progress,
    error,
    maxFileSize: MAX_IMAGE_UPLOAD_SIZE,
    list,
    upload,
    uploadToGoogleDrive,
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

async function fetchMediaAsset(id: string) {
  const { data, error } = await supabase
    .from('media_assets')
    .select('id, bucket, path, public_url, file_name, mime_type, file_size, created_at, metadata')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? (data as MediaAssetRow) : null
}

async function deleteGoogleDriveMediaAsset(id: string) {
  const sessionResult = await supabase.auth.getSession()
  const accessToken = sessionResult.data.session?.access_token

  if (sessionResult.error || !accessToken) {
    throw new Error('Please log in as an admin before deleting images.')
  }

  const response = await fetch('/api/google-drive-upload', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  })
  const payload = (await response.json().catch(() => null)) as DeleteResponsePayload | null

  if (!response.ok || !payload?.deleted) {
    const message = uploadErrorMessage(response, payload)
    throw new Error(message)
  }
}

function isGoogleDriveAsset(asset: MediaAssetRow) {
  return (
    asset.bucket === 'google-drive' ||
    Boolean(asset.metadata?.google_drive_file_id) ||
    isGoogleDriveUrl(asset.public_url) ||
    isGoogleDriveUrl(asset.path)
  )
}

function isExternalUrl(value: string | null | undefined) {
  return /^https?:\/\//i.test(value ?? '')
}

function isGoogleDriveUrl(value: string | null | undefined) {
  return /(^https?:\/\/)?(drive|lh3)\.googleusercontent\.com/i.test(value ?? '') ||
    /(^https?:\/\/)?drive\.google\.com/i.test(value ?? '')
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

function uniqueUploadToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
