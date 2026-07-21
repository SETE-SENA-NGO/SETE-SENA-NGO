import { imageUrls } from '@/lib/imageUrls'

export function installImageFallbacks() {
  if (typeof window === 'undefined') return

  window.addEventListener(
    'error',
    (event) => {
      const target = event.target
      if (!(target instanceof HTMLImageElement)) return
      if (target.dataset.fallbackApplied === 'true') return

      target.dataset.fallbackApplied = 'true'
      target.src = fallbackForImage(target)
    },
    true,
  )
}

function fallbackForImage(image: HTMLImageElement) {
  const text = `${image.alt} ${image.className} ${image.currentSrc || image.src}`.toLowerCase()

  if (text.includes('map') || text.includes('office')) return imageUrls.maps.cambodiaOffices
  if (text.includes('pin') || text.includes('location')) return imageUrls.maps.locationIcon
  if (text.includes('school') || text.includes('education') || text.includes('child')) {
    return imageUrls.education.intro
  }
  if (text.includes('forest') || text.includes('environment')) {
    return imageUrls.programs.environmentHero1
  }
  if (text.includes('partner')) return imageUrls.partners.undp

  return imageUrls.programs.hero1
}
