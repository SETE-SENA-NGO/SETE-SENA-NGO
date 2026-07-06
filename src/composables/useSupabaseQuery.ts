import { ref } from 'vue'

export function useSupabaseQuery<T>() {
  const data = ref<T | null>(null)
  const error = ref<unknown>(null)
  const loading = ref(false)

  async function run(queryFn: () => Promise<{ data: T | null; error: unknown }>) {
    loading.value = true
    error.value = null
    try {
      const { data: res, error: err } = await queryFn()
      data.value = res
      error.value = err
      return { data: res, error: err }
    } finally {
      loading.value = false
    }
  }

  return { data, error, loading, run }
}
