import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollReveal(options: {
  threshold?: number
  rootMargin?: string
} = {}) {
  const { threshold = 0.12, rootMargin = '0px 0px -80px 0px' } = options
  const elements = ref<Map<Element, boolean>>(new Map())
  const observerRef = ref<IntersectionObserver | null>(null)

  function observe(el: Element | null) {
    if (!el || !observerRef.value) return
    observerRef.value.observe(el)
    elements.value.set(el, false)
  }

  onMounted(() => {
    observerRef.value = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            elements.value.set(entry.target, true)
          } else {
            entry.target.classList.remove('revealed')
            elements.value.set(entry.target, false)
          }
        }
      },
      { threshold, rootMargin },
    )
  })

  onUnmounted(() => {
    observerRef.value?.disconnect()
  })

  return { observe }
}
