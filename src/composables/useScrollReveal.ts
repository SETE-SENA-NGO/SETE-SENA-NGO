import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Reveals elements matching `selector` as they scroll into view by adding
 * the `reveal--visible` class. Elements start hidden via the `reveal` class.
 * By default the class is removed again only when the element leaves below
 * the viewport, so the animation replays when scrolling down but not when
 * scrolling back up; pass `once: true` to animate a single time. Falls back
 * to showing everything immediately when IntersectionObserver is unavailable
 * or the user prefers reduced motion.
 */
export function useScrollReveal(selector = '.reveal', { once = false } = {}) {
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector))
    if (elements.length === 0) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion) {
      elements.forEach((el) => el.classList.add('reveal--visible'))
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible')
            if (once) observer?.unobserve(entry.target)
          } else if (!once && entry.boundingClientRect.top > 0) {
            // The element left below the viewport (user scrolled up past it):
            // reset it so it animates again on the next scroll down. Elements
            // that leave above the viewport stay visible, so scrolling back
            // up never replays the animation.
            entry.target.classList.remove('reveal--visible')
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' },
    )

    elements.forEach((el) => observer!.observe(el))
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })
}
