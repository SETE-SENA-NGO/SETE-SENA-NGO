import { ref, onMounted, onUnmounted } from 'vue'

type ScrollRevealOptions = {
  threshold?: number
  rootMargin?: string
  selector?: string
  once?: boolean
  visibleClass?: string
  auto?: boolean
}

export function useScrollReveal(
  selectorOrOptions: string | ScrollRevealOptions = '.reveal',
  options?: ScrollRevealOptions,
) {
  const isStringArg = typeof selectorOrOptions === 'string'
  const config: ScrollRevealOptions = isStringArg
    ? { selector: selectorOrOptions, ...options }
    : selectorOrOptions ?? {}

  const {
    selector = '.reveal',
    threshold = 0.12,
    rootMargin = '0px 0px -80px 0px',
    once = false,
    visibleClass,
    auto,
  } = config

  const isAuto = isStringArg || selector !== '.reveal' || auto === true
  const resolvedVisibleClass = visibleClass ?? (isAuto ? 'reveal--visible' : 'revealed')

  const observerRef = ref<IntersectionObserver | null>(null)

  function observe(el: Element | null) {
    if (!el) return
    if (!observerRef.value) {
      el.classList.add(resolvedVisibleClass)
      return
    }
    observerRef.value.observe(el)
  }

  onMounted(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion) {
      if (isAuto) {
        document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
          el.classList.add(resolvedVisibleClass)
        })
      }
      return
    }

    observerRef.value = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement
          if (entry.isIntersecting) {
            target.classList.add(resolvedVisibleClass)
            if (once) observerRef.value?.unobserve(entry.target)
          } else if (!once) {
            target.classList.remove(resolvedVisibleClass)
          }
        }
      },
      { threshold, rootMargin },
    )

    if (isAuto) {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => observerRef.value?.observe(el))
    }
  })

  onUnmounted(() => {
    observerRef.value?.disconnect()
    observerRef.value = null
  })

  return { observe }
}
