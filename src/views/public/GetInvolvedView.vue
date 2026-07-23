<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { localizeContentValue } from '@/i18n/contentTranslations'
import { useContentStore } from '@/stores/content.store'

interface ActionLink {
  label: string
  to: string
}

interface SupportCard {
  label: string
  title: string
  body: string
  image: string
  alt: string
  to: string
  cta: string
}

interface QuotePanel {
  quote: string
  credit: string
  title: string
  body: string
}

interface JourneyStep {
  step: string
  title: string
  body: string
}

interface GetInvolvedHero {
  eyebrow: string
  title: string
  description: string
  image: string
  alt: string
  primaryCta: ActionLink
  secondaryCta: ActionLink
}

interface GetInvolvedPageContent {
  hero: GetInvolvedHero
  supportCards: SupportCard[]
  quotePanel: QuotePanel
  journey: JourneyStep[]
  closing: {
    eyebrow: string
    title: string
    body: string
    primaryCta: ActionLink
    secondaryCta: ActionLink
  }
}

const PAGE_SLUG = 'get-involved'
const { locale } = useI18n()
const activeLocale = computed(() => (locale.value === 'kh' ? 'kh' : 'en'))

const fallbackContent: GetInvolvedPageContent = {
  hero: {
    eyebrow: 'Get involved',
    title: 'Support village peace.',
    description:
      'Since 1994, Santi Sena has worked with villages on peace, livelihoods, education, child protection and the environment.',
    image: '/images/programs/hero-2.jpg',
    alt: 'Santi Sena staff and community members meeting in a village shelter',
    primaryCta: { label: 'Donate', to: '/get-involved/donate' },
    secondaryCta: { label: 'Partner with us', to: '/get-involved/partner' },
  },
  supportCards: [
    {
      label: 'Natural resources',
      title: 'Protect community forests',
      body: 'Support forestry committees, seedlings and climate adaptation.',
      image: '/images/programs/environment-hero1.jpg',
      alt: 'Community leaders receiving tree seedlings near a pagoda',
      to: '/programs/environment',
      cta: 'Environment',
    },
    {
      label: 'Livelihood',
      title: 'Strengthen savings and farming',
      body: 'Back savings groups, farming skills and rural enterprise.',
      image: '/images/programs/livelihood-hero2.jpg',
      alt: 'Women receiving livelihood support during a community event',
      to: '/programs/livelihood',
      cta: 'Livelihood',
    },
    {
      label: 'Education',
      title: 'Keep children learning',
      body: 'Support pre-schools, scholarships and mobile libraries.',
      image: '/images/programs/education.jpg',
      alt: 'Students gathered for a Santi Sena education activity',
      to: '/programs/education',
      cta: 'Education',
    },
    {
      label: 'Protection',
      title: 'Make childhood safer',
      body: 'Help child protection networks and rights campaigns.',
      image: '/images/programs/child-protection2.jpg',
      alt: 'Students participating in a community child protection activity',
      to: '/programs/child-protection',
      cta: 'Protection',
    },
  ],
  quotePanel: {
    quote:
      'Santi Sena means people working together for peace, livelihoods, justice and environmental preservation.',
    credit: 'From the Santi Sena profile and strategic plan',
    title:
      'Support here is not only a gift. It is cooperation with village systems.',
    body: 'Santi Sena works with monks, villagers, local government, schools and partners in Svay Rieng, Prey Veng and Kratie. Choose the help you can offer and connect it to work communities can carry forward.',
  },
  journey: [
    {
      step: '01',
      title: 'Choose a contribution',
      body: 'Give funds, partnership support or useful expertise.',
    },
    {
      step: '02',
      title: 'Match it to field needs',
      body: 'Connect support to forests, schools, savings groups or protection work.',
    },
    {
      step: '03',
      title: 'Strengthen local ownership',
      body: 'Keep the work rooted in village systems and local committees.',
    },
  ],
  closing: {
    eyebrow: 'Next step',
    title: 'Start a conversation.',
    body: 'The strongest support is specific, local and steady.',
    primaryCta: { label: 'Contact Santi Sena', to: '/contact' },
    secondaryCta: { label: 'Donate locally', to: '/qr-donate' },
  },
}

const contentStore = useContentStore()
const cmsContent = ref<Partial<GetInvolvedPageContent> | null>(null)
let stopCmsSubscription: (() => void) | null = null

const pageContent = computed<GetInvolvedPageContent>(() => {
  const merged = mergeGetInvolvedContent(fallbackContent, cmsContent.value)
  return activeLocale.value === 'kh'
    ? localizeContentValue(merged, activeLocale.value)
    : merged
})

const description =
  'Get involved with Santi Sena through donation, partnership or volunteer support rooted in Santi Sena reports and strategic plan.'

let previousTitle = ''
let descriptionMeta: HTMLMetaElement | null = null
let previousDescription: string | null = null
let createdDescriptionMeta = false
let revealObserver: IntersectionObserver | null = null
let lastScrollY = 0

onMounted(async () => {
  previousTitle = document.title
  document.title = 'Get Involved with Santi Sena'
  setDescription(description)
  stopCmsSubscription = contentStore.subscribeToSlug(PAGE_SLUG, () => {
    void loadCmsContent()
  })

  await loadCmsContent()

  await nextTick()
  setupPopReveal()
})

watch(activeLocale, () => {
  void loadCmsContent()
})

onUnmounted(() => {
  stopCmsSubscription?.()
  stopCmsSubscription = null
  document.title = previousTitle

  if (descriptionMeta && createdDescriptionMeta) {
    descriptionMeta.remove()
  } else if (descriptionMeta && previousDescription !== null) {
    descriptionMeta.setAttribute('content', previousDescription)
  }

  revealObserver?.disconnect()
  revealObserver = null
})

function setDescription(content: string) {
  descriptionMeta = document.querySelector('meta[name="description"]')
  previousDescription = descriptionMeta?.getAttribute('content') ?? null

  if (!descriptionMeta) {
    descriptionMeta = document.createElement('meta')
    descriptionMeta.setAttribute('name', 'description')
    document.head.appendChild(descriptionMeta)
    createdDescriptionMeta = true
  }

  descriptionMeta.setAttribute('content', content)
}

async function loadCmsContent() {
  try {
    const page = await contentStore.fetchBySlug(PAGE_SLUG, activeLocale.value)
    cmsContent.value = page ? parseCmsBody(page.body) : null
  } catch {
    cmsContent.value = null
  }
}

function parseCmsBody(body: string): Partial<GetInvolvedPageContent> | null {
  if (!body.trim()) return null

  try {
    const parsed = JSON.parse(body) as unknown
    return isRecord(parsed) ? (parsed as Partial<GetInvolvedPageContent>) : null
  } catch {
    return null
  }
}

function mergeGetInvolvedContent(
  base: GetInvolvedPageContent,
  override: Partial<GetInvolvedPageContent> | null,
): GetInvolvedPageContent {
  if (!override) return base

  const hero: Record<string, unknown> = isRecord(override.hero)
    ? override.hero
    : {}
  const closing: Record<string, unknown> = isRecord(override.closing)
    ? override.closing
    : {}

  return {
    hero: {
      ...base.hero,
      ...hero,
      primaryCta: mergeObject(base.hero.primaryCta, hero.primaryCta),
      secondaryCta: mergeObject(base.hero.secondaryCta, hero.secondaryCta),
    },
    supportCards: mergeArray<SupportCard>(
      override.supportCards,
      base.supportCards,
    ),
    quotePanel: mergeObject(base.quotePanel, override.quotePanel),
    journey: mergeArray<JourneyStep>(override.journey, base.journey),
    closing: {
      ...base.closing,
      ...closing,
      primaryCta: mergeObject(base.closing.primaryCta, closing.primaryCta),
      secondaryCta: mergeObject(
        base.closing.secondaryCta,
        closing.secondaryCta,
      ),
    },
  }
}

function mergeObject<T>(base: T, override: unknown): T {
  return isRecord(override) ? ({ ...base, ...override } as T) : base
}

function mergeArray<T>(override: unknown, fallback: T[]) {
  return Array.isArray(override) && override.length
    ? (override as T[])
    : fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function setupPopReveal() {
  revealObserver?.disconnect()

  const elements = Array.from(
    document.querySelectorAll<HTMLElement>('.get-involved-page .pop-reveal'),
  )
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    elements.forEach((element) => element.classList.add('is-visible'))
    return
  }

  lastScrollY = window.scrollY

  revealObserver = new IntersectionObserver(
    (entries) => {
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - lastScrollY
      const direction = scrollDelta >= 0 ? 'down' : 'up'
      lastScrollY = currentScrollY

      entries.forEach((entry) => {
        const target = entry.target as HTMLElement

        target.classList.toggle('pop-from-down', direction === 'down')
        target.classList.toggle('pop-from-up', direction === 'up')

        if (entry.isIntersecting) {
          target.classList.add('is-visible')
        } else {
          target.classList.remove('is-visible')
        }
      })
    },
    { rootMargin: '-4% 0px -8% 0px', threshold: 0.12 },
  )

  elements.forEach((element, index) => {
    element.style.setProperty('--pop-delay', `${Math.min(index * 38, 260)}ms`)
    revealObserver?.observe(element)
  })
}
</script>

<template>
  <main class="get-involved-page">
    <section class="hero-section" aria-labelledby="get-involved-title">
      <div class="hero-shell">
        <div class="hero-copy pop-reveal pop-content">
          <p class="eyebrow">{{ pageContent.hero.eyebrow }}</p>
          <h1 id="get-involved-title">{{ pageContent.hero.title }}</h1>
          <p class="hero-description">{{ pageContent.hero.description }}</p>
          <div class="hero-actions">
            <RouterLink
              :to="pageContent.hero.primaryCta.to"
              class="button button-primary"
            >
              {{ pageContent.hero.primaryCta.label }}
            </RouterLink>
            <RouterLink
              :to="pageContent.hero.secondaryCta.to"
              class="button button-secondary"
            >
              {{ pageContent.hero.secondaryCta.label }}
            </RouterLink>
          </div>
        </div>

        <div class="hero-visual">
          <figure class="hero-photo">
            <img :src="pageContent.hero.image" :alt="pageContent.hero.alt" />
          </figure>
        </div>
      </div>
    </section>

    <section
      id="ways-to-help"
      class="about-section"
      aria-labelledby="support-heading"
    >
      <div class="about-shell">
        <div class="about-copy pop-reveal pop-content">
          <p class="eyebrow">About</p>
          <h2 id="support-heading">Support real community work.</h2>
          <p>
            Santi Sena welcomes donors, partners, researchers and volunteers who
            can strengthen local initiatives.
          </p>
        </div>

        <div class="about-card-grid">
          <article
            v-for="card in pageContent.supportCards"
            :key="card.title"
            class="about-card pop-reveal pop-card"
          >
            <figure>
              <img :src="card.image" :alt="card.alt" loading="lazy" />
              <figcaption>{{ card.label }}</figcaption>
            </figure>
            <div class="about-card-body">
              <h3>{{ card.title }}</h3>
              <p>{{ card.body }}</p>
              <RouterLink :to="card.to">{{ card.cta }}</RouterLink>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="quote-section" aria-labelledby="strategy-heading">
      <div class="quote-shell">
        <article class="quote-panel quote-panel-left pop-reveal pop-left">
          <span class="quote-mark quote-mark-large" aria-hidden="true"
            >&ldquo;</span
          >
          <blockquote id="strategy-heading">
            {{ pageContent.quotePanel.quote }}
          </blockquote>
        </article>

        <div class="quote-detail pop-reveal pop-right">
          <p>{{ pageContent.quotePanel.body }}</p>
          <span class="quote-mark quote-mark-detail" aria-hidden="true"
            >&rdquo;</span
          >
        </div>
      </div>
    </section>

    <section class="journey-section" aria-labelledby="journey-heading">
      <div class="journey-intro pop-reveal pop-content">
        <p class="eyebrow">Your path</p>
        <h2 id="journey-heading">Choose your path.</h2>
        <p class="journey-summary">
          Choose one route and connect it to real field needs.
        </p>
      </div>

      <ol class="journey-list">
        <li
          v-for="item in pageContent.journey"
          :key="item.step"
          class="pop-reveal pop-card"
        >
          <span>{{ item.step }}</span>
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="closing-section" aria-labelledby="closing-heading">
      <div class="closing-panel">
        <div class="closing-header">
          <h2 id="closing-heading" class="pop-reveal pop-content">
            {{ pageContent.closing.title }}
          </h2>
          <p class="eyebrow closing-eyebrow pop-reveal pop-content">
            {{ pageContent.closing.eyebrow }}
          </p>
        </div>

        <div class="closing-body">
          <p class="closing-copy pop-reveal pop-content">
            {{ pageContent.closing.body }}
          </p>
          <div class="closing-action-column">
            <p class="pop-reveal pop-content">
              Start with a conversation or a local donation path.
            </p>
            <div class="closing-actions">
              <RouterLink
                :to="pageContent.closing.primaryCta.to"
                class="button button-primary pop-reveal pop-card"
              >
                {{ pageContent.closing.primaryCta.label }}
              </RouterLink>
              <RouterLink
                :to="pageContent.closing.secondaryCta.to"
                class="button button-secondary pop-reveal pop-card"
              >
                {{ pageContent.closing.secondaryCta.label }}
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.get-involved-page {
  --page-bg: var(--color-cream);
  --surface: var(--color-white);
  --surface-soft: var(--color-cream-soft);
  --ink: var(--color-ink);
  --muted: var(--color-ink-soft);
  --line: var(--color-border);
  --accent: var(--primary-color);
  --accent-dark: var(--primary-dark);
  --accent-soft: var(--primary-light);
  --quote-bg: var(--primary-dark);
  --quote-accent: var(--primary-light);
  --shadow: 0 16px 34px rgba(43, 43, 40, 0.1);

  min-height: 100vh;
  overflow: hidden;
  font-family: var(--font-family-base);
  background: var(--page-bg);
  color: var(--ink);
}

.hero-section {
  position: relative;
  background: linear-gradient(
    180deg,
    var(--surface),
    var(--surface-soft) 58%,
    var(--surface)
  );
  padding: clamp(4rem, 7vw, 6rem) 0 4.5rem;
}

.hero-photo {
  position: relative;
  height: clamp(320px, 38vw, 520px);
  margin: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--accent-dark) 14%, transparent);
  border-radius: 8px;
  background: var(--surface-soft);
  box-shadow: 0 24px 46px rgba(31, 61, 46, 0.13);
  transform: translateY(0) scale(1);
  transition:
    border-color 0.24s ease,
    box-shadow 0.24s ease,
    transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.hero-photo::before {
  position: absolute;
  z-index: 1;
  inset: 0;
  background: linear-gradient(180deg, transparent 54%, rgba(7, 45, 35, 0.26));
  content: '';
  pointer-events: none;
}

.hero-photo::after {
  display: none;
}

.hero-photo img {
  width: 100%;
  height: 100%;
  display: block;
  filter: none;
  object-fit: cover;
  object-position: center 45%;
  transform: scale(1);
  transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-shell,
.about-shell,
.journey-section,
.closing-section {
  width: min(100% - 4rem, 1120px);
  margin: 0 auto;
}

.hero-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(300px, 0.82fr) minmax(420px, 1fr);
  gap: clamp(2rem, 5vw, 4.5rem);
  align-items: center;
}

.hero-copy {
  max-width: 540px;
  padding-top: 0;
}

.hero-visual {
  position: relative;
  min-width: 0;
  isolation: isolate;
}

.hero-visual::before {
  position: absolute;
  z-index: -1;
  inset: 1.1rem -0.9rem -0.9rem 1.15rem;
  border: 1px solid color-mix(in srgb, var(--accent) 12%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--surface) 88%, var(--accent-soft));
  content: '';
  transform: translate(0, 0);
  transition:
    border-color 0.24s ease,
    transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (hover: hover) and (pointer: fine) {
  .hero-visual:hover .hero-photo {
    border-color: color-mix(in srgb, var(--accent) 34%, transparent);
    box-shadow: 0 32px 58px rgba(31, 61, 46, 0.2);
    transform: translateY(-10px) scale(1.025);
  }

  .hero-visual:hover .hero-photo img {
    transform: scale(1.045);
  }

  .hero-visual:hover::before {
    border-color: color-mix(in srgb, var(--accent) 22%, transparent);
    transform: translate(0.45rem, 0.45rem);
  }
}

.eyebrow {
  display: inline-block;
  margin: 0 0 0.8rem;
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  line-height: 1.2;
  text-transform: uppercase;
}

.hero-copy h1,
.about-copy h2,
.journey-intro h2,
.closing-section h2 {
  margin: 0;
  color: var(--ink);
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.16;
  text-wrap: balance;
}

.hero-copy h1 {
  max-width: 13ch;
  color: var(--ink);
  font-size: clamp(2.25rem, 3.8vw, 3.55rem);
  font-weight: 700;
  line-height: 1.1;
  text-shadow: none;
}

.hero-description {
  max-width: 34rem;
  margin: 1.05rem 0 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.72;
}

.hero-actions,
.closing-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.8rem;
}

.button {
  min-height: 3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.85rem 1.85rem;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.1;
  text-decoration: none;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}

.button:hover {
  transform: translateY(-2px);
}

.button-primary {
  background: var(--accent);
  color: var(--surface);
  box-shadow: 0 12px 24px color-mix(in srgb, var(--accent) 22%, transparent);
}

.button-primary:hover {
  background: var(--accent-dark);
  box-shadow: 0 16px 28px color-mix(in srgb, var(--accent) 28%, transparent);
}

.button-secondary {
  border-color: color-mix(in srgb, var(--accent) 32%, transparent);
  background: var(--surface);
  color: var(--accent-dark);
}

.button-secondary:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.hero-copy .eyebrow {
  color: var(--accent);
}

.hero-copy .button-secondary {
  border-color: color-mix(in srgb, var(--accent) 32%, transparent);
  background: var(--surface);
  color: var(--accent-dark);
}

.hero-copy .button-secondary:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.about-section {
  background: linear-gradient(180deg, var(--surface-soft), var(--page-bg));
  padding: 4.5rem 0;
}

.about-shell {
  display: grid;
  grid-template-columns: minmax(300px, 0.58fr) minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 4rem);
  align-items: start;
}

.about-copy {
  max-width: 460px;
}

.about-copy h2 {
  font-size: clamp(1.8rem, 3vw, 2.65rem);
  line-height: 1.16;
}

.about-copy p:not(.eyebrow) {
  margin: 1.25rem 0 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.7;
}

.about-stat-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 1.4rem;
}

.about-stat-list span {
  display: grid;
  align-content: start;
  gap: 0.55rem;
  border-top: 3px solid var(--accent);
  background: color-mix(in srgb, var(--surface) 70%, transparent);
  padding: 0.8rem 0.9rem 0.75rem;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.35;
}

.about-stat-list strong {
  color: var(--accent-dark);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
}

.about-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.15rem;
}

.about-card {
  min-height: 310px;
  display: grid;
  grid-template-rows: auto 1fr;
  align-content: stretch;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--shadow);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.about-card:hover {
  border-color: color-mix(in srgb, var(--accent) 26%, var(--line));
  box-shadow: 0 20px 38px rgba(43, 43, 40, 0.14);
  transform: translateY(-8px);
}

.about-card figure {
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 168px;
  margin: 0;
  overflow: hidden;
  background: var(--accent-soft);
}

.about-card figure::before {
  position: absolute;
  z-index: 1;
  inset: 0;
  background:
    linear-gradient(180deg, transparent 38%, rgba(7, 45, 35, 0.28)),
    color-mix(in srgb, var(--accent) 10%, transparent);
  content: '';
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ease;
}

.about-card img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transform: scale(1);
  transition:
    filter 0.32s ease,
    transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
}

.about-card:hover img {
  filter: saturate(1.08) contrast(1.04);
  transform: scale(1.12);
}

.about-card:hover figure::before {
  opacity: 1;
}

.about-card figcaption {
  position: absolute;
  z-index: 2;
  left: 1rem;
  bottom: 1rem;
  border-radius: 999px;
  background: rgba(252, 246, 233, 0.92);
  padding: 0.35rem 0.75rem;
  color: var(--accent-dark);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  line-height: 1.1;
  text-transform: uppercase;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.about-card:hover figcaption {
  background: var(--accent);
  color: var(--surface);
  transform: translateY(-2px);
}

.about-card-body {
  display: grid;
  align-content: start;
  gap: 0.75rem;
  padding: 1.2rem;
}

.about-card h3 {
  margin: 0;
  color: var(--ink);
  font-size: 1.08rem;
  font-weight: 600;
  line-height: 1.25;
}

.about-card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  font-style: normal;
  line-height: 1.58;
}

.about-card a {
  width: fit-content;
  margin-top: auto;
  color: var(--accent-dark);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-decoration: none;
  text-transform: uppercase;
}

.about-card a:hover {
  color: var(--accent);
}

.quote-section {
  overflow: hidden;
  background: var(--quote-bg);
  padding: 4.5rem 1.5rem;
}

.quote-shell {
  width: min(100%, 820px);
  margin: 0 auto;
  color: var(--surface);
  text-align: left;
}

.quote-panel {
  display: grid;
  align-content: center;
}

.quote-panel-left {
  width: min(100%, 780px);
  margin: 0 auto;
  justify-items: start;
}

.quote-detail {
  width: min(100%, 720px);
  margin: 0 auto;
  display: grid;
}

.quote-mark {
  font-family: var(--font-family-base);
  font-weight: 900;
  line-height: 0.7;
}

.quote-mark-large {
  justify-self: start;
  color: var(--surface);
  font-size: clamp(5rem, 12vw, 8.4rem);
  transform: translateX(-0.22rem);
}

.quote-panel blockquote {
  max-width: 720px;
  margin: -0.1rem 0 0;
  color: var(--surface);
  font-size: clamp(1.2rem, 2vw, 1.72rem);
  font-style: italic;
  font-weight: 700;
  line-height: 1.56;
}

.quote-detail p {
  max-width: 720px;
  margin: 0;
  color: color-mix(in srgb, var(--surface) 78%, transparent);
  font-size: 0.93rem;
  font-weight: 500;
  line-height: 1.76;
}

.quote-mark-detail {
  justify-self: end;
  color: var(--quote-accent);
  font-size: clamp(2.5rem, 6vw, 4.2rem);
  transform: translate(0.15rem, -0.1rem);
}

.journey-section {
  display: grid;
  gap: 2rem;
  align-items: start;
  padding: 4.25rem 0;
}

.journey-intro h2 {
  font-size: clamp(1.75rem, 3vw, 2.6rem);
  max-width: 12ch;
}

.journey-summary {
  max-width: 42rem;
  margin: 1rem 0 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.72;
}

.journey-list {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.journey-list::before {
  position: absolute;
  top: 1.45rem;
  left: 11%;
  right: 11%;
  height: 1px;
  background: color-mix(in srgb, var(--accent) 16%, var(--line));
  content: '';
}

.journey-list li {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.1rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  padding: 1.15rem 1.1rem 1.25rem;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.journey-list li:hover {
  border-color: color-mix(in srgb, var(--accent) 28%, var(--line));
  box-shadow: 0 14px 28px rgba(43, 43, 40, 0.1);
  transform: translateY(-2px);
}

.journey-list span {
  width: 3rem;
  height: 3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent);
  color: var(--surface);
  font-size: 0.8rem;
  font-weight: 900;
  box-shadow: 0 0 0 12px var(--page-bg);
}

.journey-list h3 {
  margin: 0;
  color: var(--ink);
  font-size: 1.05rem;
  line-height: 1.2;
}

.journey-list p {
  margin: 0.5rem 0 0;
  color: var(--muted);
  line-height: 1.62;
}

.closing-section {
  border-top: 0;
  padding: 2.25rem 0 4.75rem;
  text-align: left;
}

.closing-panel {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: auto;
  display: grid;
  align-content: center;
  gap: clamp(1.75rem, 4vw, 3rem);
  border: 0;
  background: transparent;
  padding: clamp(2.5rem, 6vw, 4.5rem) clamp(1.2rem, 6vw, 4.8rem);
  box-shadow: none;
}

.closing-panel::before,
.closing-panel::after {
  position: absolute;
  z-index: 0;
  content: '';
  will-change: opacity, transform;
}

.closing-panel::before {
  width: clamp(170px, 24vw, 290px);
  height: clamp(140px, 18vw, 220px);
  top: clamp(1.4rem, 5vw, 3.3rem);
  left: clamp(1.2rem, 8vw, 4.7rem);
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 24%, var(--surface));
  opacity: 0.95;
  transform: rotate(-16deg);
  animation: closingBlobFloat 8s ease-in-out infinite;
}

.closing-panel::after {
  width: clamp(170px, 22vw, 260px);
  height: clamp(105px, 15vw, 170px);
  right: clamp(1.5rem, 7vw, 4.4rem);
  bottom: clamp(1.2rem, 5vw, 2.8rem);
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent-dark) 28%, var(--surface));
  opacity: 0.9;
  transform: rotate(-12deg);
  animation: closingBlobFloatAlt 9.5s ease-in-out infinite;
}

@keyframes closingBlobFloat {
  0%,
  100% {
    opacity: 0.92;
    transform: translate3d(0, 0, 0) rotate(-16deg) scale(1);
  }

  50% {
    opacity: 1;
    transform: translate3d(14px, -12px, 0) rotate(-10deg) scale(1.04);
  }
}

@keyframes closingBlobFloatAlt {
  0%,
  100% {
    opacity: 0.86;
    transform: translate3d(0, 0, 0) rotate(-12deg) scale(1);
  }

  50% {
    opacity: 0.96;
    transform: translate3d(-12px, 10px, 0) rotate(-18deg) scale(1.035);
  }
}

.closing-header,
.closing-body {
  position: relative;
  z-index: 1;
}

.closing-header {
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}

.closing-section h2 {
  max-width: 640px;
  color: var(--ink);
  font-size: clamp(1.85rem, 3.6vw, 2.65rem);
  font-weight: 600;
  line-height: 1.15;
}

.closing-eyebrow {
  margin: 0.8rem 0 0;
  color: var(--accent);
  font-size: 0.78rem;
  font-style: italic;
  font-weight: 800;
  letter-spacing: 0.34em;
}

.closing-body {
  width: min(100%, 820px);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.4rem, 5vw, 3rem);
  margin: 0 auto;
}

.closing-copy,
.closing-action-column p {
  margin: 0;
  color: var(--muted);
  font-size: 0.98rem;
  font-weight: 500;
  line-height: 1.78;
}

.closing-actions {
  justify-content: flex-start;
  margin-top: 1.7rem;
}

.closing-panel .button-primary {
  background: var(--accent);
  color: var(--surface);
  box-shadow: 0 12px 24px color-mix(in srgb, var(--accent) 20%, transparent);
}

.closing-panel .button-primary:hover {
  background: var(--accent-dark);
  box-shadow: 0 16px 28px color-mix(in srgb, var(--accent) 26%, transparent);
}

.closing-panel .button-secondary {
  border-color: color-mix(in srgb, var(--accent) 34%, transparent);
  background: var(--surface);
  color: var(--accent-dark);
}

.closing-panel .button-secondary:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.pop-reveal {
  --pop-offset: 28px;
  --pop-scale: 0.985;

  opacity: 0;
  filter: none;
  transform: translate3d(var(--pop-x, 0), var(--pop-offset), 0)
    scale(var(--pop-scale));
  transition:
    opacity 0.76s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.76s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
  transition-delay: var(--pop-delay, 0ms);
  will-change: opacity, transform;
}

.pop-content {
  --pop-offset: 22px;
  --pop-scale: 0.99;
}

.pop-card {
  --pop-offset: 34px;
  --pop-scale: 0.96;
}

.pop-image {
  --pop-offset: 24px;
  --pop-scale: 1.015;
}

.pop-reveal.pop-from-up {
  --pop-offset: -26px;
}

.pop-left {
  --pop-offset: 0px;
  --pop-scale: 0.985;
  --pop-x: -42px;
}

.pop-right {
  --pop-offset: 0px;
  --pop-scale: 0.985;
  --pop-x: 42px;
}

.pop-left.pop-from-up,
.pop-right.pop-from-up {
  --pop-offset: 0px;
}

.pop-reveal.is-visible {
  opacity: 1;
  filter: none;
  transform: translate3d(0, 0, 0) scale(1);
}

.button.pop-reveal.is-visible:hover {
  transform: translateY(-2px);
}

.about-card.pop-reveal.is-visible:hover {
  transform: translateY(-8px) scale(1.015);
}

.journey-list li.pop-reveal.is-visible:hover {
  transform: translateY(-4px) scale(1.008);
}

@media (max-width: 1120px) {
  .hero-shell,
  .about-shell {
    grid-template-columns: 1fr;
  }

  .hero-copy,
  .about-copy {
    max-width: 660px;
  }

  .hero-visual {
    max-width: 780px;
  }
}

@media (max-width: 760px) {
  .hero-section {
    padding: 3.25rem 0 3.5rem;
  }

  .hero-photo {
    height: 250px;
  }

  .hero-visual::before {
    inset: 0.75rem -0.35rem -0.35rem 0.75rem;
  }

  .hero-shell,
  .about-shell,
  .journey-section,
  .closing-section {
    width: min(100% - 2rem, var(--container-max-width));
  }

  .hero-shell {
    gap: 2rem;
  }

  .hero-copy h1 {
    max-width: 13ch;
    font-size: clamp(2rem, 10vw, 2.75rem);
  }

  .about-card-grid {
    grid-template-columns: 1fr;
  }

  .about-card-grid {
    grid-template-columns: 1fr;
  }

  .hero-actions,
  .closing-actions {
    flex-direction: column;
    width: 100%;
  }

  .button {
    width: 100%;
  }

  .about-section,
  .journey-section {
    padding-block: 3.5rem;
  }

  .about-stat-list,
  .journey-list {
    grid-template-columns: 1fr;
  }

  .journey-list::before {
    display: none;
  }

  .quote-section {
    padding: 4rem 1rem;
  }

  .closing-panel {
    min-height: auto;
    gap: 2rem;
    padding: 3rem 1.25rem;
  }

  .closing-panel::before {
    top: 1rem;
    left: -1.5rem;
  }

  .closing-panel::after {
    right: -1.5rem;
    bottom: 1rem;
  }

  .closing-body {
    grid-template-columns: 1fr;
    gap: 1.35rem;
  }

  .closing-section h2 {
    font-size: 2rem;
  }

  .journey-list li {
    gap: 0.95rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pop-reveal,
  .pop-reveal.is-visible,
  .hero-visual:hover .hero-photo,
  .hero-visual:hover .hero-photo img,
  .hero-visual:hover::before,
  .about-card.pop-reveal.is-visible:hover,
  .journey-list li.pop-reveal.is-visible:hover {
    opacity: 1;
    filter: none;
    transform: none;
    transition: none;
  }

  .closing-panel::before,
  .closing-panel::after {
    animation: none;
  }
}
</style>
