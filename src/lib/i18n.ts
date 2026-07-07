import { computed, ref } from 'vue'

const locale = ref('en')

export function useI18n() {
  function t(value: string) {
    return value
  }

  function setLocale(value: string) {
    locale.value = value
  }

  return {
    locale: computed(() => locale.value),
    t,
    setLocale,
  }
}
