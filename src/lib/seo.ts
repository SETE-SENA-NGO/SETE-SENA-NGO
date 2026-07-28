import type { RouteLocationNormalized } from 'vue-router'

const SITE_NAME = 'Santi Sena Cambodia'
const SITE_URL = 'https://www.santisenacambodia.org'
const DEFAULT_DESCRIPTION =
  "Santi Sena (the Peace Army) is a Cambodian NGO founded by Buddhist monks in 1994, working across environment, education, livelihood and child protection to build peace through community development."

const pageMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: `${SITE_NAME} — Peace Army NGO`,
    description: DEFAULT_DESCRIPTION,
  },
  '/about': {
    title: `About Us — ${SITE_NAME}`,
    description: "Learn about Santi Sena's mission, history and the Peace Army's work across Cambodia since 1994.",
  },
  '/about/vision': {
    title: `Vision, Mission & Core Values — ${SITE_NAME}`,
    description: "Our vision, mission and core values guiding Santi Sena's community development work in Cambodia.",
  },
  '/about/organization': {
    title: `Our Organization — ${SITE_NAME}`,
    description: "Santi Sena's organizational structure and leadership.",
  },
  '/programs': {
    title: `Our Programs — ${SITE_NAME}`,
    description: "Explore Santi Sena's four pillars: environment, education, livelihood and child protection.",
  },
  '/programs/environment': {
    title: `Environment Program — ${SITE_NAME}`,
    description: 'Community forestry, tree nurseries, WASH, sanitation and climate adaptation programs in Cambodia.',
  },
  '/programs/education': {
    title: `Education Program — ${SITE_NAME}`,
    description: 'Community pre-schools, mobile libraries and scholarships supporting Cambodian children.',
  },
  '/programs/livelihood': {
    title: `Livelihood Program — ${SITE_NAME}`,
    description: 'Integrated farming, Saving-for-Change groups and rural enterprise support across Cambodia.',
  },
  '/programs/child-protection': {
    title: `Child Protection Program — ${SITE_NAME}`,
    description: 'Anti-trafficking campaigns, Child Protection Networks and child rights advocacy.',
  },
  '/services': {
    title: `Services — ${SITE_NAME}`,
    description: 'Services offered by Santi Sena to communities across Cambodia.',
  },
  '/impact/numbers': {
    title: `Our Impact in Numbers — ${SITE_NAME}`,
    description: "Santi Sena's impact by the numbers — villages reached, communes served, years of service.",
  },
  '/impact/partners': {
    title: `Partners & Supporters — ${SITE_NAME}`,
    description: "Santi Sena's partners and supporters across government, local and international networks.",
  },
  '/impact/timeline': {
    title: `Our Timeline — ${SITE_NAME}`,
    description: "Santi Sena's 30+ year timeline of community development milestones in Cambodia.",
  },
  '/get-involved': {
    title: `Get Involved — ${SITE_NAME}`,
    description: 'Ways to support Santi Sena — donate, volunteer or partner with the Peace Army.',
  },
  '/get-involved/donate': {
    title: `Donate — ${SITE_NAME}`,
    description: 'Donate to Santi Sena and support community development in Cambodia.',
  },
  '/get-involved/volunteer': {
    title: `Volunteer — ${SITE_NAME}`,
    description: "Volunteer with Santi Sena's programs across Cambodia.",
  },
  '/get-involved/partner': {
    title: `Partner With Us — ${SITE_NAME}`,
    description: 'Partner with Santi Sena on community development initiatives.',
  },
  '/contact': {
    title: `Contact Us — ${SITE_NAME}`,
    description: "Contact Santi Sena's head office and field offices in Cambodia.",
  },
  '/contact/headoffice': {
    title: `Head Office — ${SITE_NAME}`,
    description: 'Santi Sena head office contact details and location.',
  },
  '/contact/fieldoffice': {
    title: `Field Offices — ${SITE_NAME}`,
    description: 'Santi Sena field office locations across Cambodia.',
  },
  '/qr-donate': {
    title: `Scan to Donate — ${SITE_NAME}`,
    description: 'Scan to donate to Santi Sena via QR code.',
  },
}

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
  const meta = pageMeta[to.path] ?? {
    title: `${SITE_NAME}`,
    description: DEFAULT_DESCRIPTION,
  }
  const canonicalUrl = `${SITE_URL}${to.path === '/' ? '' : to.path}`

  document.title = meta.title
  setMetaTag('name', 'description', meta.description)
  setCanonical(canonicalUrl)
  setMetaTag('property', 'og:title', meta.title)
  setMetaTag('property', 'og:description', meta.description)
  setMetaTag('property', 'og:url', canonicalUrl)
  setMetaTag('name', 'twitter:title', meta.title)
  setMetaTag('name', 'twitter:description', meta.description)
}
