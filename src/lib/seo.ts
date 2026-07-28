import type { RouteLocationNormalized } from 'vue-router'
import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION, pageMeta } from './seo-data'

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(url: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', url)
}

export function applyRouteSeo(to: RouteLocationNormalized) {
  if (to.name === 'NotFound') {
    document.title = `Page Not Found — ${SITE_NAME}`
    setMetaTag('name', 'description', 'The page you requested could not be found.')
    setMetaTag('name', 'robots', 'noindex, follow')
    return
  }

  const meta = pageMeta[to.path] ?? {
    title: `${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
  }
  const canonicalUrl = `${SITE_URL}${to.path === '/' ? '' : to.path}`

  document.title = meta.title
  setMetaTag('name', 'description', meta.description)
  setMetaTag('name', 'robots', 'index, follow')
  setCanonical(canonicalUrl)
  setMetaTag('property', 'og:title', meta.title)
  setMetaTag('property', 'og:description', meta.description)
  setMetaTag('property', 'og:url', canonicalUrl)
  setMetaTag('name', 'twitter:title', meta.title)
  setMetaTag('name', 'twitter:description', meta.description)
}
