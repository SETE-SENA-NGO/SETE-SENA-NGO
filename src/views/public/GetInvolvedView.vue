<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useContentStore } from '@/stores/content.store'

interface ActionLink {
  label: string
  to: string
}

type HeroIcon = 'support' | 'partnership' | 'volunteer' | 'reach'

interface HeroCard {
  label: string
  title: string
  body: string
  stat: string
  icon?: HeroIcon
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
  cards: HeroCard[]
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
    cards: [
      {
        label: 'Resource support',
        title: 'Mobilize practical help',
        body: 'Back work communities already lead.',
        stat: 'Local action',
        icon: 'support',
      },
      {
        label: 'Partnership',
        title: 'Build beyond projects',
        body: 'Help programs last beyond project cycles.',
        stat: 'Long term',
        icon: 'partnership',
      },
      {
        label: 'Volunteer skill',
        title: 'Bring useful expertise',
        body: 'Share research, mentoring or technical skill.',
        stat: 'Skills shared',
        icon: 'volunteer',
      },
      {
        label: 'Community reach',
        title: 'Serve real villages',
        body: 'Support work across 293 villages.',
        stat: '293 villages',
        icon: 'reach',
      },
    ],
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
    title: 'Support here is not only a gift. It is cooperation with village systems.',
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

const pageContent = computed<GetInvolvedPageContent>(() =>
  mergeGetInvolvedContent(fallbackContent, cmsContent.value),
)

const description =
  'Get involved with Santi Sena through donation, partnership or volunteer support rooted in Santi Sena reports and strategic plan.'

let previousTitle = ''
let descriptionMeta: HTMLMetaElement | null = null
let previousDescription: string | null = null
let createdDescriptionMeta = false
let revealObserver: IntersectionObserver | null = null
let lastScrollY = 0
const statValues = ref<Map<string, number>>(new Map())

onMounted(async () => {
  previousTitle = document.title
  document.title = 'Get Involved with Santi Sena'
  setDescription(description)

  try {
    const page = await contentStore.fetchBySlug(PAGE_SLUG)
    cmsContent.value = page ? parseCmsBody(page.body) : null
  } catch {
    cmsContent.value = null
  }

  await nextTick()
  setupAnimations()
})

onUnmounted(() => {
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

  const hero: Record<string, unknown> = isRecord(override.hero) ? override.hero : {}
  const closing: Record<string, unknown> = isRecord(override.closing) ? override.closing : {}

  return {
    hero: {
      ...base.hero,
      ...hero,
      primaryCta: mergeObject(base.hero.primaryCta, hero.primaryCta),
      secondaryCta: mergeObject(base.hero.secondaryCta, hero.secondaryCta),
      cards: mergeArray<HeroCard>(hero.cards, base.hero.cards),
    },
    supportCards: mergeArray<SupportCard>(override.supportCards, base.supportCards),
    quotePanel: mergeObject(base.quotePanel, override.quotePanel),
    journey: mergeArray<JourneyStep>(override.journey, base.journey),
    closing: {
      ...base.closing,
      ...closing,
      primaryCta: mergeObject(base.closing.primaryCta, closing.primaryCta),
      secondaryCta: mergeObject(base.closing.secondaryCta, closing.secondaryCta),
    },
  }
}

function mergeObject<T>(base: T, override: unknown): T {
  return isRecord(override) ? ({ ...base, ...override } as T) : base
}

function mergeArray<T>(override: unknown, fallback: T[]) {
  return Array.isArray(override) && override.length ? (override as T[]) : fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function setupAnimations() {
  revealObserver?.disconnect()

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    document.querySelectorAll('.get-involved-page .pop-reveal').forEach((el) => {
      el.classList.add('is-visible')
    })
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

  // Setup staggered delays based on animation group
  const staggeredGroups = document.querySelectorAll<HTMLElement>('[data-stagger]')
  staggeredGroups.forEach((group) => {
    const baseDelay = parseInt(group.getAttribute('data-stagger') || '120', 10)
    const items = group.querySelectorAll<HTMLElement>('.pop-reveal')
    items.forEach((element, index) => {
      element.style.setProperty('--pop-delay', `${index * baseDelay}ms`)
      revealObserver?.observe(element)
    })
  })

  // Observe standalone pop-reveal elements
  document.querySelectorAll<HTMLElement>('.get-involved-page .pop-reveal').forEach((element) => {
    if (!element.closest('[data-stagger]')) {
      revealObserver?.observe(element)
    }
  })

  // Trigger counter animation for stat numbers
  setupStatCounters()
}

function setupStatCounters() {
  const statElements = document.querySelectorAll<HTMLElement>('[data-count-to]')
  if (!statElements.length) return

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement
          const targetValue = parseInt(target.getAttribute('data-count-to') || '0', 10)
          animateCounter(target, targetValue)
          counterObserver.unobserve(target)
        }
      })
    },
    { rootMargin: '0px 0px -20% 0px' },
  )

  statElements.forEach((el) => counterObserver.observe(el))
}

function animateCounter(element: HTMLElement, target: number) {
  const duration = 2000
  const start = performance.now()

  function update(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = Math.round(eased * target)
    element.textContent = current.toString()

    if (progress < 1) {
      requestAnimationFrame(update)
    } else {
      element.textContent = target.toString()
    }
  }

  requestAnimationFrame(update)
}

function resolveHeroIcon(icon: HeroCard['icon'], index: number): HeroIcon {
  if (icon === 'support' || icon === 'partnership' || icon === 'volunteer' || icon === 'reach') {
    return icon
  }

  const fallbackIcons: readonly HeroIcon[] = ['support', 'partnership', 'volunteer', 'reach']

  return fallbackIcons[index % fallbackIcons.length] ?? 'support'
}
</script>

<template>
  <main class="get-involved-page">
    <section class="hero-section" aria-labelledby="get-involved-title">
      <div class="hero-photo">
        <img :src="pageContent.hero.image" :alt="pageContent.hero.alt" />
      </div>

      <div class="hero-shell">
        <div class="hero-copy pop-reveal fade-in-down">
          <p class="eyebrow">{{ pageContent.hero.eyebrow }}</p>
          <h1 id="get-involved-title">{{ pageContent.hero.title }}</h1>
          <p class="hero-description">{{ pageContent.hero.description }}</p>
          <div class="hero-actions">
            <RouterLink :to="pageContent.hero.primaryCta.to" class="button button-primary btn-anim">
              {{ pageContent.hero.primaryCta.label }}
            </RouterLink>
            <RouterLink :to="pageContent.hero.secondaryCta.to" class="button button-secondary btn-anim">
              {{ pageContent.hero.secondaryCta.label }}
            </RouterLink>
          </div>
        </div>

        <div class="hero-card-grid" data-stagger="120" aria-label="Ways to support">
          <svg class="hero-tree-lines" viewBox="0 0 640 660" aria-hidden="true" focusable="false">
            <path
              class="hero-tree-trunk"
              d="M310 650 C306 545 322 462 350 405 C367 369 390 340 418 316"
            />
            <path
              class="hero-tree-trunk"
              d="M380 650 C372 548 374 468 392 408 C410 356 452 316 500 288"
            />
            <path d="M338 430 C318 492 300 566 290 626" />
            <path d="M352 405 C324 356 290 326 252 314" />
            <path d="M418 316 C380 288 338 274 294 275" />
            <path d="M392 408 C432 460 430 505 382 535" />
          </svg>
          <article
            v-for="(card, index) in pageContent.hero.cards"
            :key="card.title"
            class="hero-card vision-card pop-reveal pop-card"
          >
            <div class="hero-card-content">
              <span class="hero-card-icon icon-wrapper" aria-hidden="true">
                <svg viewBox="0 0 48 48" focusable="false">
                  <g v-if="resolveHeroIcon(card.icon, index) === 'support'">
                    <path d="M10 27h8l5 5h9" />
                    <path d="M30 31l7-7a4 4 0 0 0-6-5l-7 7" />
                    <path d="M17 26l5-5a5 5 0 0 1 7 0l2 2" />
                    <path d="M10 22v13" />
                  </g>
                  <g v-else-if="resolveHeroIcon(card.icon, index) === 'partnership'">
                    <path d="M14 28l5 5a5 5 0 0 0 7 0l8-8" />
                    <path d="M18 24l6-6a5 5 0 0 1 7 0l3 3" />
                    <path d="M10 18l7 7" />
                    <path d="M38 18l-7 7" />
                    <path d="M17 12h14" />
                  </g>
                  <g v-else-if="resolveHeroIcon(card.icon, index) === 'volunteer'">
                    <circle cx="24" cy="16" r="6" />
                    <path d="M13 37a11 11 0 0 1 22 0" />
                    <path d="M32 15c4 0 7-3 7-7" />
                    <path d="M32 15c0-4 3-7 7-7" />
                  </g>
                  <g v-else>
                    <path d="M14 34V14l8-4 10 4 8-4v20l-8 4-10-4-8 4z" />
                    <path d="M22 10v20" />
                    <path d="M32 14v20" />
                    <circle cx="25" cy="22" r="3" />
                  </g>
                </svg>
              </span>
              <p class="hero-card-label">{{ card.label }}</p>
              <h2>{{ card.title }}</h2>
              <p class="hero-card-body">{{ card.body }}</p>
              <strong class="hero-card-stat">{{ card.stat }}</strong>
            </div>
            <div class="shimmer-overlay" aria-hidden="true"></div>
          </article>
        </div>
      </div>
    </section>

    <section id="ways-to-help" class="about-section" aria-labelledby="support-heading">
      <div class="about-shell">
        <div class="about-copy content-slide-left pop-reveal">
          <p class="eyebrow">About</p>
          <h2 id="support-heading">Support real community work.</h2>
          <p>
            Santi Sena welcomes donors, partners, researchers and volunteers who can strengthen
            local initiatives.
          </p>
        </div>

        <div class="about-card-grid" data-stagger="100">
          <article
            v-for="card in pageContent.supportCards"
            :key="card.title"
            class="about-card mission-card pop-reveal pop-card"
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
        <article class="quote-panel quote-panel-left pop-reveal pop-quote">
          <span class="quote-mark quote-mark-large quote-icon-float" aria-hidden="true">&ldquo;</span>
          <blockquote id="strategy-heading">
            {{ pageContent.quotePanel.quote }}
          </blockquote>
        </article>

        <div class="quote-detail pop-reveal pop-quote">
          <p>{{ pageContent.quotePanel.body }}</p>
          <span class="quote-mark quote-mark-detail quote-icon-float-alt" aria-hidden="true">&rdquo;</span>
        </div>
      </div>
    </section>

    <section class="journey-section" aria-labelledby="journey-heading">
      <div class="journey-intro pop-reveal fade-in-down">
        <p class="eyebrow">Your path</p>
        <h2 id="journey-heading">Choose your path.</h2>
        <p class="journey-summary">Choose one route and connect it to real field needs.</p>
      </div>

      <ol class="journey-list" data-stagger="100">
        <li v-for="item in pageContent.journey" :key="item.step" class="journey-item pop-reveal pop-card">
          <span>{{ item.step }}</span>
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="closing-section cta-section" aria-labelledby="closing-heading">
      <div class="closing-panel">
        <div class="closing-header">
          <h2 id="closing-heading" class="pop-reveal fade-in-down">
            {{ pageContent.closing.title }}
          </h2>
          <p class="eyebrow closing-eyebrow pop-reveal fade-in-down">
            {{ pageContent.closing.eyebrow }}
          </p>
        </div>

        <div class="closing-body">
          <p class="closing-copy pop-reveal pop-fade-up">{{ pageContent.closing.body }}</p>
          <div class="closing-action-column">
            <p class="pop-reveal pop-fade-up">
              Start with a conversation or a local donation path.
            </p>
            <div class="closing-actions">
              <RouterLink
                :to="pageContent.closing.primaryCta.to"
                class="button button-primary btn-anim pop-reveal pop-card"
              >
                {{ pageContent.closing.primaryCta.label }}
              </RouterLink>
              <RouterLink
                :to="pageContent.closing.secondaryCta.to"
                class="button button-secondary btn-anim pop-reveal pop-card"
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
  --spring-ease: cubic-bezier(0.34, 1.56, 0.64, 1);
  --spring-smooth: cubic-bezier(0.16, 1, 0.3, 1);

  min-height: 100vh;
  overflow: hidden;
  font-family: var(--font-family-base);
  background: var(--page-bg);
  color: var(--ink);
}

.hero-section {
  position: relative;
  min-height: 880px;
  background: var(--surface);
  padding: 0 0 5rem;
}

.hero-photo {
  position: absolute;
  inset: 0 0 auto;
  height: 430px;
  overflow: hidden;
  background: var(--surface);
}

.hero-photo::before {
  position: absolute;
  z-index: 1;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0.2) 48%,
      rgba(255, 255, 255, 0.05)
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0), var(--surface) 98%);
  content: '';
}

.hero-photo::after {
  display: none;
}

.hero-photo img {
  width: 100%;
  height: 100%;
  display: block;
  filter: saturate(1.02) contrast(1.02) brightness(1.08);
  object-fit: cover;
  object-position: center 42%;
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
  grid-template-columns: minmax(300px, 0.68fr) minmax(560px, 1fr);
  gap: clamp(2.5rem, 5vw, 4rem);
  align-items: start;
  padding-top: 175px;
}

.hero-copy {
  align-self: start;
  max-width: 480px;
  padding-top: 440px;
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
  font-size: clamp(2.1rem, 4vw, 3.25rem);
  font-weight: 700;
  line-height: 1.14;
  text-shadow: none;
}

.hero-description {
  max-width: 34rem;
  margin: 1.05rem 0 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.72;
}

.hero-metric-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.35rem;
}

.hero-metric-list span {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface) 78%, transparent);
  padding: 0.7rem 0.95rem;
  color: var(--muted);
  font-size: 0.88rem;
  line-height: 1.1;
  box-shadow: 0 10px 22px rgba(43, 43, 40, 0.08);
}

.hero-metric-list strong {
  color: var(--accent-dark);
  font-size: 1rem;
  font-weight: 700;
}

.image-credit {
  margin: 1.25rem 0 0;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.11em;
  line-height: 1.5;
  text-transform: uppercase;
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

.hero-card-grid {
  position: relative;
  isolation: isolate;
  min-height: 650px;
  padding-top: 1.25rem;
}

.hero-tree-lines {
  position: absolute;
  z-index: 0;
  inset: -0.75rem -0.5rem 0;
  width: calc(100% + 1rem);
  height: calc(100% + 0.75rem);
  overflow: visible;
  pointer-events: none;
}

.hero-tree-lines path {
  fill: none;
  stroke: color-mix(in srgb, var(--accent-dark) 64%, var(--accent-soft));
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3.5;
}

.hero-tree-lines .hero-tree-trunk {
  stroke-width: 5.5;
}

.hero-card {
  --leaf-content-x: 0;
  --leaf-content-y: 0;
  --leaf-vein-angle: -35deg;

  position: absolute;
  z-index: 1;
  width: clamp(215px, 32%, 245px);
  height: 255px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 0;
  border-radius: 0 82% 0 82% / 0 100% 0 100%;
  background: linear-gradient(
    135deg,
    var(--surface) 0%,
    color-mix(in srgb, var(--accent-soft) 34%, var(--surface)) 100%
  );
  padding: 0;
  box-shadow:
    inset 0 0 0 2px color-mix(in srgb, var(--accent-dark) 14%, transparent),
    0 18px 34px rgba(43, 43, 40, 0.18);
  text-align: center;
}

.hero-card::before {
  position: absolute;
  z-index: 0;
  width: 46%;
  height: 3px;
  right: 14%;
  bottom: 16%;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent-dark) 42%, transparent);
  content: '';
  opacity: 0.35;
  transform: rotate(var(--leaf-vein-angle));
  transform-origin: right center;
}

.hero-card-content {
  position: relative;
  z-index: 1;
  width: min(56%, 138px);
  max-height: 70%;
  min-width: 0;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 0.32rem;
  overflow: hidden;
  transform: translate(var(--leaf-content-x), calc(var(--leaf-content-y) + 0.35rem));
}

.hero-card:nth-of-type(1) {
  --leaf-content-x: -0.12rem;
  --leaf-content-y: -0.12rem;

  top: 57%;
  left: 7%;
  border-radius: 0 82% 0 82% / 0 100% 0 100%;
}

.hero-card:nth-of-type(2) {
  --leaf-content-x: -0.12rem;
  --leaf-content-y: 0;

  top: 9%;
  left: 0;
  border-radius: 0 82% 0 82% / 0 100% 0 100%;
}

.hero-card:nth-of-type(3) {
  --leaf-content-x: 0.12rem;
  --leaf-content-y: 0;
  --leaf-vein-angle: 35deg;

  top: 5%;
  left: 46%;
  border-radius: 82% 0 82% 0 / 100% 0 100% 0;
}

.hero-card:nth-of-type(4) {
  --leaf-content-x: 0.12rem;
  --leaf-content-y: -0.05rem;
  --leaf-vein-angle: 35deg;

  top: 43%;
  right: 2%;
  border-radius: 82% 0 82% 0 / 100% 0 100% 0;
}

.hero-card:nth-of-type(3)::before,
.hero-card:nth-of-type(4)::before {
  right: auto;
  left: 14%;
  transform-origin: left center;
}

/* ============= VISION CARD HOVER EFFECTS ============= */
.vision-card {
  transition:
    transform 0.4s var(--spring-ease),
    box-shadow 0.4s var(--spring-ease);
}

.vision-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow:
    inset 0 0 0 2px color-mix(in srgb, var(--accent) 28%, transparent),
    0 0 24px color-mix(in srgb, var(--accent) 18%, transparent),
    0 24px 48px rgba(43, 43, 40, 0.16);
}

/* Shimmer overlay sweep */
.shimmer-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 45%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0.3) 55%,
    transparent 70%
  );
  background-size: 300% 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.vision-card:hover .shimmer-overlay {
  opacity: 1;
  animation: shimmerSweep 0.8s ease-out forwards;
}

@keyframes shimmerSweep {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

/* ============= ICON WRAPPER BOUNCE ============= */
.icon-wrapper {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background:
    radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.78), transparent 34%),
    color-mix(in srgb, var(--accent-soft) 82%, var(--surface));
  color: var(--accent);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--accent) 12%, transparent),
    0 8px 18px color-mix(in srgb, var(--accent) 10%, transparent);
  transition:
    background 0.3s var(--spring-ease),
    box-shadow 0.3s var(--spring-ease),
    color 0.3s var(--spring-ease),
    transform 0.4s var(--spring-ease);
}

.icon-wrapper svg {
  width: 27px;
  height: 27px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.45;
}

.vision-card:hover .icon-wrapper {
  background:
    radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.22), transparent 34%),
    linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: var(--surface);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.16),
    0 12px 24px color-mix(in srgb, var(--accent) 28%, transparent);
  transform: scale(1.15) rotate(8deg);
}

.hero-card-label {
  max-width: 100%;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  margin: 0;
  color: var(--accent);
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1.25;
  overflow-wrap: normal;
  text-align: center;
  text-wrap: balance;
  text-transform: uppercase;
}

.hero-card h2 {
  min-height: 0;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  margin: 0;
  color: var(--ink);
  font-size: 0.86rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.18;
  overflow-wrap: normal;
  text-align: center;
  text-wrap: balance;
}

.hero-card-body {
  display: none;
}

.hero-card-stat {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  background: var(--surface-soft);
  max-width: 94%;
  padding: 0.32rem 0.56rem;
  color: var(--accent-dark);
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
  transition:
    background 0.3s var(--spring-ease),
    color 0.3s var(--spring-ease),
    transform 0.3s var(--spring-ease);
}

.vision-card:hover .hero-card-stat {
  background: color-mix(in srgb, var(--accent) 16%, var(--surface));
  color: var(--accent);
  transform: scale(1.08);
}

/* ============= ABOUT / MISSION SECTION ============= */
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
}

.about-card figure {
  position: relative;
  width: 100%;
  height: 168px;
  margin: 0;
  overflow: hidden;
  background: var(--accent-soft);
}

.about-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s var(--spring-smooth);
}

.about-card:hover img {
  transform: scale(1.08);
}

.about-card figcaption {
  position: absolute;
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

/* Mission card hover effects */
.mission-card {
  position: relative;
  transition:
    transform 0.4s var(--spring-ease),
    box-shadow 0.4s var(--spring-ease);
}

.mission-card::after {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 3px;
  height: 0;
  background: var(--accent);
  content: '';
  transition: height 0.4s var(--spring-ease);
}

.mission-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 38px rgba(43, 43, 40, 0.14);
}

.mission-card:hover::after {
  height: 100%;
}

/* ============= QUOTE SECTION ============= */
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
  font-family: Georgia, serif;
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

/* Quote icon floating animation */
.quote-icon-float {
  display: inline-block;
  animation: quoteFloat 3.5s ease-in-out infinite;
}

.quote-icon-float-alt {
  display: inline-block;
  animation: quoteFloatAlt 4s ease-in-out infinite;
}

@keyframes quoteFloat {
  0%, 100% {
    transform: translateX(-0.22rem) translateY(0);
  }
  50% {
    transform: translateX(-0.22rem) translateY(-6px);
  }
}

@keyframes quoteFloatAlt {
  0%, 100% {
    transform: translate(0.15rem, -0.1rem) translateY(0);
  }
  50% {
    transform: translate(0.15rem, -0.1rem) translateY(-4px);
  }
}

/* ============= JOURNEY SECTION ============= */
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
}

.journey-list li:hover {
  border-color: color-mix(in srgb, var(--accent) 28%, var(--line));
  box-shadow: 0 14px 28px rgba(43, 43, 40, 0.1);
  transform: translateY(-2px);
}

.journey-item {
  transition:
    transform 0.3s var(--spring-ease),
    border-color 0.3s var(--spring-ease),
    box-shadow 0.3s var(--spring-ease);
}

.journey-item:hover {
  transform: translateY(-4px) !important;
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

/* ============= CLOSING / CTA SECTION ============= */
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

/* ============= BUTTON SPRING ANIMATIONS ============= */
.btn-anim {
  transition:
    transform 0.35s var(--spring-ease),
    box-shadow 0.35s var(--spring-ease),
    background 0.35s var(--spring-ease),
    border-color 0.35s var(--spring-ease);
}

.btn-anim:hover {
  transform: translateY(-3px) scale(1.03);
}

.btn-anim:active {
  transform: translateY(0) scale(0.97);
  transition-duration: 0.08s;
}

/* ============= POP / SCROLL REVEAL ANIMATIONS ============= */
.pop-reveal {
  --pop-blur: 10px;
  --pop-offset: 28px;
  --pop-scale: 0.985;

  opacity: 0;
  filter: blur(var(--pop-blur)) saturate(0.92);
  transform: translate3d(var(--pop-x, 0), var(--pop-offset), 0) scale(var(--pop-scale));
  transition:
    opacity 0.76s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.76s cubic-bezier(0.16, 1, 0.3, 1),
    filter 0.76s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
  transition-delay: var(--pop-delay, 0ms);
  will-change: opacity, transform;
}

.pop-content {
  --pop-blur: 8px;
  --pop-offset: 22px;
  --pop-scale: 0.99;
}

.pop-card {
  --pop-blur: 12px;
  --pop-offset: 34px;
  --pop-scale: 0.96;
}

.pop-image {
  --pop-blur: 8px;
  --pop-offset: 24px;
  --pop-scale: 1.015;

  filter: saturate(0.9);
}

/* Fade-in-down for section headers */
.fade-in-down {
  --pop-offset: -30px;
  --pop-blur: 6px;
  --pop-scale: 0.98;
}

.fade-in-down.pop-from-up {
  --pop-offset: 30px;
}

/* Slide in from left for mission content */
.content-slide-left {
  --pop-x: -42px;
  --pop-offset: 0px;
  --pop-blur: 8px;
  --pop-scale: 0.985;
}

.content-slide-left.pop-from-up {
  --pop-offset: 0px;
}

/* Quote block scale + fade */
.pop-quote {
  --pop-scale: 0.92;
  --pop-blur: 8px;
  --pop-offset: 0px;
}

/* Fade-up for CTA */
.pop-fade-up {
  --pop-offset: 24px;
  --pop-blur: 6px;
  --pop-scale: 0.99;
}

/* Scroll direction variants */
.pop-reveal.pop-from-up {
  --pop-offset: -26px;
}

.pop-left {
  --pop-blur: 8px;
  --pop-offset: 0px;
  --pop-scale: 0.985;
  --pop-x: -42px;
}

.pop-right {
  --pop-blur: 8px;
  --pop-offset: 0px;
  --pop-scale: 0.985;
  --pop-x: 42px;
}

.pop-left.pop-from-up,
.pop-right.pop-from-up {
  --pop-offset: 0px;
}

/* Visible state */
.pop-reveal.is-visible {
  opacity: 1;
  filter: blur(0) saturate(1);
  transform: translate3d(0, 0, 0) scale(1);
}

/* Maintain hover transforms on visible interactive elements */
.vision-card.pop-reveal.is-visible:hover {
  transform: translateY(-6px) scale(1.02) !important;
}

.mission-card.pop-reveal.is-visible:hover {
  transform: translateY(-5px) !important;
}

.journey-item.pop-reveal.is-visible:hover {
  transform: translateY(-4px) !important;
}

.btn-anim.pop-reveal.is-visible:hover {
  transform: translateY(-3px) scale(1.03) !important;
}

.pop-reveal.is-visible .quote-icon-float,
.pop-reveal.is-visible .quote-icon-float-alt {
  animation: none;
}

.pop-reveal.is-visible .quote-icon-float {
  animation: quoteFloat 3.5s ease-in-out infinite;
}

.pop-reveal.is-visible .quote-icon-float-alt {
  animation: quoteFloatAlt 4s ease-in-out infinite;
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

  .hero-card-grid {
    max-width: 700px;
    margin: 0 auto;
  }
}

@media (max-width: 760px) {
  .hero-section {
    min-height: auto;
    padding-bottom: 3rem;
  }

  .hero-photo {
    height: 260px;
  }

  .hero-shell,
  .about-shell,
  .journey-section,
  .closing-section {
    width: min(100% - 2rem, var(--container-max-width));
  }

  .hero-copy {
    padding-top: 0;
  }

  .hero-shell {
    padding-top: 300px;
  }

  .hero-copy h1 {
    max-width: 11ch;
    font-size: 2.15rem;
  }

  .about-card-grid {
    grid-template-columns: 1fr;
  }

  .hero-card-grid {
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1.4rem;
  }

  .hero-tree-lines {
    display: none;
  }

  .hero-card,
  .hero-card:nth-of-type(1),
  .hero-card:nth-of-type(2),
  .hero-card:nth-of-type(3),
  .hero-card:nth-of-type(4) {
    --leaf-content-x: 0;
    --leaf-content-y: 0;
    --leaf-vein-angle: -35deg;

    position: relative;
    inset: auto;
    width: 100%;
    height: auto;
    min-height: 255px;
    border-radius: 0 72% 0 72% / 0 92% 0 92%;
  }

  .hero-card::before,
  .hero-card:nth-of-type(3)::before,
  .hero-card:nth-of-type(4)::before {
    right: 14%;
    left: auto;
    transform-origin: right center;
  }

  .hero-card-content {
    width: min(68%, 220px);
    max-height: 74%;
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
  .pop-reveal.is-visible {
    opacity: 1;
    filter: none;
    transform: none;
    transition: none;
  }

  .vision-card:hover,
  .mission-card:hover,
  .journey-item:hover,
  .btn-anim:hover {
    transform: none !important;
  }

  .shimmer-overlay {
    display: none !important;
  }

  .quote-icon-float,
  .quote-icon-float-alt {
    animation: none !important;
  }

  .closing-panel::before,
  .closing-panel::after {
    animation: none;
  }
}
</style>