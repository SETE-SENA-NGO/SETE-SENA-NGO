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
  name: string
  url: string
  mime_type: string
  size: number
  created_at: string
}

type MediaAssetRow = {
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

  async function list() {
    const { data, error: listError } = await supabase
      .from('media_assets')
      .select('path, public_url, file_name, mime_type, file_size, created_at')
      .eq('bucket', MEDIA_BUCKET)
      .order('created_at', { ascending: false })
      .limit(200)
    if (listError) throw listError

    items.value = ((data ?? []) as MediaAssetRow[]).map((file) => ({
      id: file.path,
      name: file.file_name,
      url:
        file.public_url ??
        supabase.storage.from(MEDIA_BUCKET).getPublicUrl(file.path).data.publicUrl,
      mime_type: file.mime_type ?? 'application/octet-stream',
      size: file.file_size ?? 0,
      created_at: file.created_at,
    }))
  }

  async function upload(file: File) {
    if (!isAllowedImageFile(file)) {
      throw new Error(`Upload ${imageUploadHelpText()}`)
    }

    uploading.value = true
    progress.value = 0
    error.value = null

    const path = `website-images/${Date.now()}_${safeStorageFileName(file.name)}`

    try {
      const { data, error: uploadError } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { upsert: false })

      if (uploadError) throw uploadError

      const publicUrl = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl

      const { error: assetError } = await supabase.from('media_assets').upsert(
        {
          bucket: MEDIA_BUCKET,
          path: data.path,
          public_url: publicUrl,
          file_name: file.name,
          mime_type: file.type,
          file_size: file.size,
          folder: 'website-images',
        },
        { onConflict: 'bucket,path' },
      )

      if (assetError) throw assetError

      items.value.unshift({
        id: data.path,
        name: file.name,
        url: publicUrl,
        mime_type: file.type || 'application/octet-stream',
        size: file.size,
        created_at: new Date().toISOString(),
      })

      progress.value = 100
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Upload failed'
      throw e
    } finally {
      uploading.value = false
    }
  }

  async function remove(path: string) {
    const { error: removeError } = await supabase.storage.from(MEDIA_BUCKET).remove([path])
    if (removeError) throw removeError

    const { error: assetError } = await supabase
      .from('media_assets')
      .delete()
      .eq('bucket', MEDIA_BUCKET)
      .eq('path', path)

    if (assetError) throw assetError
    items.value = items.value.filter((item) => item.id !== path)
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
