import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { MAX_IMAGE_UPLOAD_SIZE, imageUploadHelpText, isAllowedImageFile } from '@/lib/media'

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

    const sessionResult = await supabase.auth.getSession()
    const accessToken = sessionResult.data.session?.access_token

    if (sessionResult.error || !accessToken) {
      throw new Error('Please log in as an admin before uploading images.')
    }

    uploading.value = true
    progress.value = 10
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file, file.name)

      const response = await fetch('/api/google-drive-upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; media?: MediaAssetRow }
        | null

      if (!response.ok || !payload?.media) {
        throw new Error(payload?.error || 'Could not upload image to Google Drive.')
      }

      const item = toMediaItem(payload.media)
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
