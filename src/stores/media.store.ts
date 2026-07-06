import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { MediaItem } from '@/types/content'

export const useMediaStore = defineStore('media', () => {
  const items = ref<MediaItem[]>([])
  const uploading = ref(false)
  const progress = ref(0)

  async function list() {
    const { data, error } = await supabase.storage.from('media').list('', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' as const },
    })
    if (error) throw error
    items.value = data.map((file: unknown) => {
      const f = file as {
        id?: string
        name: string
        metadata?: { mimetype?: string }
        created_at?: string
      }
      return {
        id: f.id || f.name,
        name: f.name,
        url: '',
        mime_type: f.metadata?.mimetype || 'application/octet-stream',
        created_at: f.created_at || '',
      }
    })
  }

  async function upload(file: File) {
    uploading.value = true
    progress.value = 0
    const path = `${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage
      .from('media')
      .upload(path, file, { upsert: false })
    if (error) {
      uploading.value = false
      throw error
    }
    const { data: publicData } = supabase.storage.from('media').getPublicUrl(path)
    items.value.unshift({
      id: data.path,
      name: file.name,
      url: publicData.publicUrl,
      mime_type: file.type,
      created_at: new Date().toISOString(),
    })
    uploading.value = false
  }

  function remove(path: string) {
    return supabase.storage.from('media').remove([path])
  }

  return { items, uploading, progress, list, upload, remove }
})
