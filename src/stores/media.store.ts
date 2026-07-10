import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export interface MediaItem {
  id: string
  name: string
  url: string
  mime_type: string
  size: number
  created_at: string
}

export const useMediaStore = defineStore('media', () => {
  const items = ref<MediaItem[]>([])
  const uploading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  async function list() {
    const { data, error: listError } = await supabase.storage.from('media').list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' as const },
    })
    if (listError) throw listError

    items.value = (data ?? []).map((file) => ({
      id: file.name,
      name: file.name,
      url: supabase.storage.from('media').getPublicUrl(file.name).data.publicUrl,
      mime_type: file.metadata?.mimetype ?? 'application/octet-stream',
      size: file.metadata?.size ?? 0,
      created_at: file.created_at ?? '',
    }))
  }

  async function upload(file: File) {
    uploading.value = true
    progress.value = 0
    error.value = null

    const path = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    try {
      const { data, error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file, { upsert: false })

      if (uploadError) throw uploadError

      const publicUrl = supabase.storage.from('media').getPublicUrl(path).data.publicUrl

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
    const { error: removeError } = await supabase.storage.from('media').remove([path])
    if (removeError) throw removeError
    items.value = items.value.filter((item) => item.id !== path)
  }

  return { items, uploading, progress, error, list, upload, remove }
})
