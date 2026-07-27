import { onMounted, onUnmounted, ref } from 'vue'

export interface ScrollSpySection {
  id: string
  label: string
  icon: string
}

/**
 * Sticky section-nav scrollspy: tracks which section is currently in view by
 * walking sections top-to-bottom and picking the last one whose top has
 * crossed above `offset` (an IntersectionObserver on empty marker elements is
 * unreliable for zero-height targets and races Vue transition timing - this
 * scroll-position approach avoids both). Forces the last section active when
 * scrolled to the bottom of the page, since a short final section may never
 * cross the offset line on its own.
 */
export function useScrollSpyNav(sections: ReadonlyArray<ScrollSpySection>, offset = 150) {
  const activeSection = ref<string>(sections[0]?.id ?? '')
  let raf = 0

  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function updateActiveSectionFromScroll() {
    const doc = document.documentElement
    const scrolledToBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 4

    const lastSection = sections[sections.length - 1]
    if (scrolledToBottom && lastSection) {
      activeSection.value = lastSection.id
      return
    }

    let current = sections[0]?.id ?? ''
    for (const s of sections) {
      const el = document.getElementById(s.id)
      if (el && el.getBoundingClientRect().top - offset <= 0) {
        current = s.id
      }
    }
    activeSection.value = current
  }

  function handleScrollSpy() {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      updateActiveSectionFromScroll()
    })
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScrollSpy, { passive: true })
  })

  onUnmounted(() => {
    if (raf) cancelAnimationFrame(raf)
    window.removeEventListener('scroll', handleScrollSpy)
  })

  return { activeSection, scrollToSection, updateActiveSectionFromScroll }
}
