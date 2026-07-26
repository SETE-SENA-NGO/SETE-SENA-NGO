<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onUnmounted,
  ref,
  shallowRef,
  watch,
} from 'vue'
import type { Component } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { localizeContentValue } from '@/i18n/contentTranslations'
import type { SupportedLocale } from '@/i18n'
import { supabase } from '@/lib/supabase'
import Slideshow from '@/components/shared/Slideshow.vue'
import { useContentStore } from '@/stores/content.store'
import {
  parsePublishedPage,
  sectionItems,
  type PublishedPageContent,
  type PublishedPageRow,
} from '@/lib/publishedContent'

const route = useRoute()
const { locale } = useI18n()
const contentStore = useContentStore()
const loaded = ref(false)
const loadError = ref('')
const fallbackComponent = shallowRef<Component | null>(null)
let stopPageSubscription: (() => void) | null = null

const slug = computed(() => {
  return typeof route.meta.contentSlug === 'string'
    ? route.meta.contentSlug
    : ''
})

type FallbackComponentLoader = () => Promise<{ default: Component }>

const isHome = computed(() => slug.value === 'home')
const activeLocale = computed<SupportedLocale>(() =>
  locale.value === 'kh' ? 'kh' : 'en',
)

const content = computed<PublishedPageContent | null>(() => {
  if (!slug.value) return null

  const key = `${activeLocale.value}:${slug.value}`
  const fallbackKey = `en:${slug.value}`
  const row = contentStore.pages[key] || contentStore.pages[fallbackKey]

  if (!row) return null

  const parsedContent = parsePublishedPage(row as PublishedPageRow)
  const localizedContent =
    parsedContent && activeLocale.value === 'kh'
      ? localizeContentValue(parsedContent, activeLocale.value)
      : parsedContent

  return parsedContent && localizedContent
    ? {
        ...localizedContent,
        slug: parsedContent.slug,
        route: parsedContent.route,
        group: parsedContent.group,
      }
    : (localizedContent as PublishedPageContent | null)
})

const statusMessage = computed(() => {
  if (!loaded.value) return 'Loading page content...'
  return loadError.value || 'Page content is not published yet.'
})

interface HomeSlide {
  image: string
  caption: string
  alt: string
  eyebrow: string
  title: string
  description: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel: string
  secondaryTo: string
  position?: string
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function normalizeSlide(raw: unknown): HomeSlide | null {
  const r = raw as Record<string, unknown> | null
  if (!r || typeof raw !== 'object') return null
  const image = typeof r.image === 'string' ? r.image : ''
  if (!image) return null
  return {
    image,
    caption: typeof r.caption === 'string' ? r.caption : '',
    alt: typeof r.alt === 'string' ? r.alt : image,
    eyebrow: typeof r.eyebrow === 'string' ? r.eyebrow : '',
    title: typeof r.title === 'string' ? r.title : '',
    description: typeof r.description === 'string' ? r.description : '',
    primaryLabel: typeof r.primaryLabel === 'string' ? r.primaryLabel : '',
    primaryTo: typeof r.primaryTo === 'string' ? r.primaryTo : '',
    secondaryLabel:
      typeof r.secondaryLabel === 'string' ? r.secondaryLabel : '',
    secondaryTo: typeof r.secondaryTo === 'string' ? r.secondaryTo : '',
    position: typeof r.position === 'string' ? r.position : undefined,
  }
}

function getDefaultHomeSlides(): HomeSlide[] {
  return [
    {
      image: '/images/programs/education-hero.jpg',
      caption: '',
      alt: 'Children learning with Santi Sena education support',
      eyebrow: 'Education and Buddhist learning',
      title: 'Helping children learn with confidence.',
      description:
        'Santi Sena supports schools, mobile libraries, scholarships and Buddhist education so children can keep learning close to home.',
      primaryLabel: 'Support education',
      primaryTo: '/qr-donate',
      secondaryLabel: 'Explore programs',
      secondaryTo: '/programs',
      position: 'center',
    },
    {
      image: '/images/programs/environment.jpg',
      caption: '',
      alt: 'Community environmental activity in rural Cambodia',
      eyebrow: 'Environment and climate action',
      title: 'Protecting the land that sustains villages.',
      description:
        'Community forestry, tree nurseries, WASH and climate adaptation help families care for the natural resources around them.',
      primaryLabel: 'Support the work',
      primaryTo: '/qr-donate',
      secondaryLabel: 'Environment program',
      secondaryTo: '/programs/environment',
      position: 'center',
    },
    {
      image: '/images/programs/livelihood-hero2.jpg',
      caption: '',
      alt: 'Rural livelihood activity with community members',
      eyebrow: 'Livelihoods and family resilience',
      title: 'Growing practical income and food security.',
      description:
        'Savings groups, home gardens, cooperatives and farmer support help rural families build steadier livelihoods.',
      primaryLabel: 'Get involved',
      primaryTo: '/get-involved',
      secondaryLabel: 'Livelihood program',
      secondaryTo: '/programs/livelihood',
      position: 'center',
    },
    {
      image: '/images/programs/child-protection1.jpg',
      caption: '',
      alt: 'Children and community members participating in a protection activity',
      eyebrow: 'Child protection and dignity',
      title: 'Safeguarding children through local action.',
      description:
        'Child rights campaigns, youth peer groups and community networks help children grow in safer, more caring communities.',
      primaryLabel: 'Stand with us',
      primaryTo: '/get-involved',
      secondaryLabel: 'Protection program',
      secondaryTo: '/programs/child-protection',
      position: 'center',
    },
  ]
}

const homeSlides = computed<HomeSlide[]>(() => {
  // If no CMS content exists, return empty array so we fall back to HomeView
  if (!content.value) return []
  if (!isHome.value) return []
  const slideshowSection = content.value.sections.find(
    (s) => s.id === 'home-slideshow',
  )
  if (!slideshowSection || !slideshowSection.items) {
    return localizeContentValue(getDefaultHomeSlides(), activeLocale.value)
  }
  const parsed = safeJsonParse<unknown>(slideshowSection.items)
  if (!Array.isArray(parsed)) {
    return localizeContentValue(getDefaultHomeSlides(), activeLocale.value)
  }
  const normalized = parsed
    .map(normalizeSlide)
    .filter((s): s is HomeSlide => Boolean(s))
  const slides = normalized.length ? normalized : getDefaultHomeSlides()
  return localizeContentValue(slides, activeLocale.value)
})

// Non-slideshow sections for the home page (rendered below the slideshow)
const homeContentSections = computed(() => {
  if (!content.value || !isHome.value) return []
  return content.value.sections.filter((s) => s.id !== 'home-slideshow')
})

watch(
  () => route.meta.fallbackComponent,
  (component) => {
    if (typeof component === 'function') {
      fallbackComponent.value = defineAsyncComponent(
        component as FallbackComponentLoader,
      )
      return
    }

    fallbackComponent.value = (component as Component | undefined) ?? null
  },
  { immediate: true },
)

watch([slug, activeLocale], () => void loadPage(), { immediate: true })

watch(
  slug,
  (nextSlug) => {
    stopPageSubscription?.()
    stopPageSubscription = nextSlug
      ? contentStore.subscribeToSlug(nextSlug, () => {
          void loadPage()
        })
      : null
  },
  { immediate: true },
)

onUnmounted(() => {
  stopPageSubscription?.()
  stopPageSubscription = null
})

async function loadPage() {
  if (!slug.value) {
    loaded.value = true
    return
  }

  const key = `${activeLocale.value}:${slug.value}`
  const fallbackKey = `en:${slug.value}`

  if (contentStore.pages[key] || contentStore.pages[fallbackKey]) {
    loaded.value = true
    return
  }

  loaded.value = false
  loadError.value = ''

  try {
    await contentStore.fetchBySlug(slug.value, activeLocale.value)
  } catch (error) {
    loadError.value =
      error instanceof Error ? error.message : 'Could not load page content.'
  } finally {
    loaded.value = true
  }
}

function actionRoute(index: number) {
  if (index === 0) return '/contact'
  if (content.value?.group === 'Programs') return '/programs'
  if (content.value?.group === 'Get Involved') return '/get-involved'
  return '/'
}
</script>

<template>
  <component
    v-if="fallbackComponent"
    :is="fallbackComponent"
    :content="content"
  />

  <template v-else>
    <main v-if="loaded && content" class="managed-page">
      <section class="managed-hero">
        <div class="managed-hero-inner">
          <p class="managed-eyebrow">{{ content.eyebrow || content.group }}</p>
          <h1>{{ content.headline || content.title }}</h1>
          <p class="managed-intro">{{ content.intro }}</p>
          <div class="managed-actions">
            <RouterLink
              v-if="content.primaryAction"
              class="managed-button managed-button-primary"
              :to="actionRoute(0)"
            >
              {{ content.primaryAction }}
            </RouterLink>
            <RouterLink
              v-if="content.secondaryAction"
              class="managed-button managed-button-secondary"
              :to="actionRoute(1)"
            >
              {{ content.secondaryAction }}
            </RouterLink>
          </div>
        </div>
      </section>

      <section class="managed-sections" aria-label="Page content">
        <article v-for="section in content.sections" :key="section.id" class="managed-section">
          <p class="managed-section-label">{{ section.label }}</p>
          <h2>{{ section.heading }}</h2>
          <p v-if="section.body" class="managed-section-body">{{ section.body }}</p>

          <div v-if="sectionItems(section).length" class="managed-item-grid">
            <div v-for="item in sectionItems(section)" :key="item.title" class="managed-item">
              <strong>{{ item.title }}</strong>
              <p v-if="item.detail">{{ item.detail }}</p>
            </div>
          </div>
        </article>
      </section>
    </main>

    <main v-else class="managed-loading" aria-live="polite">
      <p>{{ statusMessage }}</p>
    </main>
  </template>
</template>

<style scoped>
.managed-page {
  background: #fcf6e9;
  color: #17231d;
}

.managed-hero {
  min-height: 520px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(22, 48, 42, 0.88), rgba(58, 125, 68, 0.82)),
    url('/images/programs/hero-1.jpg') center / cover;
}

.managed-hero::after {
  position: absolute;
  inset: auto 0 0;
  height: 8px;
  background: linear-gradient(90deg, #d4a017, #52b788);
  content: '';
}

.managed-hero-inner {
  width: min(1120px, calc(100% - 2rem));
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.managed-eyebrow,
.managed-section-label {
  margin: 0 0 0.7rem;
  color: #d4a017;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.managed-hero h1 {
  max-width: 820px;
  margin: 0;
  color: #ffffff;
  font-family: var(--font-family-base);
  font-size: clamp(2.7rem, 7vw, 5.8rem);
  font-weight: 800;
  line-height: 0.98;
}

.managed-intro {
  max-width: 760px;
  margin: 1.35rem 0 0;
  color: rgba(255, 255, 255, 0.88);
  font-size: 1.08rem;
  line-height: 1.85;
}

.managed-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1.6rem;
}

.managed-button {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-weight: 900;
  text-decoration: none;
}

.managed-button-primary {
  background: #d4a017;
  color: #1b271f;
}

.managed-button-secondary {
  border: 1px solid rgba(255, 255, 255, 0.72);
  color: #ffffff;
}

.managed-sections {
  width: min(1120px, calc(100% - 2rem));
  display: grid;
  gap: 1.25rem;
  margin: 0 auto;
  padding: 4rem 0;
}

.managed-section {
  border: 1px solid rgba(22, 48, 42, 0.12);
  border-radius: 8px;
  background: #ffffff;
  padding: 1.5rem;
  box-shadow: 0 16px 34px rgba(22, 48, 42, 0.08);
}

.managed-section h2 {
  margin: 0;
  color: #16302a;
  font-family: var(--font-family-base);
  font-size: clamp(1.7rem, 4vw, 2.7rem);
  font-weight: 800;
  line-height: 1.1;
}

.managed-section-body {
  max-width: 820px;
  margin: 0.9rem 0 0;
  color: #5b564c;
  font-size: 1rem;
  line-height: 1.8;
}

.managed-item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.8rem;
  margin-top: 1.25rem;
}

.managed-item {
  border-left: 4px solid #d4a017;
  background: #f8faf5;
  padding: 0.95rem;
}

.managed-item strong {
  display: block;
  color: #16302a;
  font-weight: 900;
}

.managed-item p {
  margin: 0.45rem 0 0;
  color: #5b564c;
  line-height: 1.6;
}

.managed-loading {
  min-height: 50vh;
  display: grid;
  place-items: center;
  background: #fcf6e9;
  color: #16302a;
  font-weight: 800;
}

@media (max-width: 720px) {
  .managed-hero {
    min-height: 460px;
  }

  .managed-section {
    padding: 1rem;
  }
}

/* ==============================
   HOME PAGE SLIDESHOW HERO STYLES
   (matching HomeView.vue)
   ============================== */
.managed-page-home {
  font-family: inherit;
  color: var(--color-ink);
  background: var(--color-cream);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(6, 18, 13, 0.92) 0%,
      rgba(6, 18, 13, 0.68) 38%,
      rgba(6, 18, 13, 0.3) 65%,
      rgba(6, 18, 13, 0.05) 100%
    ),
    radial-gradient(
      circle at 82% 25%,
      rgba(77, 111, 86, 0.4) 0%,
      transparent 55%
    );
}

.hero-inner {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
  max-width: 760px;
  left: var(--container-offset);
  padding: 3rem 1.5rem;
  width: 100%;
  animation: fadeInUp 0.8s ease-out;
}

.hero-message {
  animation: heroMessageIn 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes heroMessageIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  margin: 0.75rem 0 1.25rem;
  color: #fdf8ef;
}

.hero-subtitle {
  max-width: 620px;
  margin: 0 0 2rem;
  color: rgba(253, 248, 239, 0.85);
  font-size: 1.05rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.85rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  border: 1px solid transparent;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease;
}

.btn--primary {
  background: var(--primary-color);
  color: var(--color-white);
}

.btn--primary:hover {
  background: var(--primary-dark);
}

.btn--outline {
  border-color: rgba(253, 248, 239, 0.6);
  color: #fdf8ef;
}

.btn--outline:hover {
  background: rgba(253, 248, 239, 0.1);
}

.eyebrow {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--primary-color);
}

.eyebrow--light {
  color: var(--primary-light);
}

/* Home sections below the slideshow */
.home-sections-below {
  padding-top: 3rem;
}
</style>
