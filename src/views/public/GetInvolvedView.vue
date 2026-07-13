<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import Slideshow from '@/components/shared/Slideshow.vue'
import { useContentStore } from '@/stores/content.store'

interface ActionLink {
  label: string
  to: string
}

interface HeroImage {
  src: string
  alt: string
}

interface GetInvolvedHero {
  eyebrow: string
  title: string
  description: string
  primaryCta: ActionLink
  secondaryCta: ActionLink
  images: HeroImage[]
}

interface InvolvementPath {
  label: string
  title: string
  body: string
  helper: string
  image: string
  alt: string
  to: string
  cta: string
}

interface JourneyStep {
  step: string
  title: string
  body: string
}

interface FocusItem {
  label: string
  detail: string
}

interface GetInvolvedCta {
  eyebrow: string
  title: string
  body: string
  primaryCta: ActionLink
  secondaryCta: ActionLink
  image: string
  alt: string
}

interface GetInvolvedPageContent {
  hero: GetInvolvedHero
  paths: InvolvementPath[]
  journey: JourneyStep[]
  focusAreas: FocusItem[]
  cta: GetInvolvedCta
}

const PAGE_SLUG = 'get-involved'

const fallbackContent: GetInvolvedPageContent = {
  hero: {
    eyebrow: 'Get involved',
    title: 'Choose the way you can help.',
    description:
      'Support Santi Sena through giving, partnership or practical volunteer time with rural communities.',
    primaryCta: { label: 'Donate now', to: '/get-involved/donate' },
    secondaryCta: { label: 'View options', to: '#ways-to-help' },
    images: [
      {
        src: '/images/programs/hero-2.jpg',
        alt: 'Santi Sena community activity with local families',
      },
      {
        src: '/images/programs/environment.jpg',
        alt: 'Community environment work in rural Cambodia',
      },
      {
        src: '/images/programs/livelihood-hero2.jpg',
        alt: 'Rural livelihood activity with community members',
      },
    ],
  },
  paths: [
    {
      label: 'Give',
      title: 'Fund practical needs',
      body: 'Help turn small gifts into learning items, clean water and field support.',
      helper: 'Best for quick support',
      image: '/images/programs/hero-2.jpg',
      alt: 'Community education support activity',
      to: '/get-involved/donate',
      cta: 'Donate',
    },
    {
      label: 'Partner',
      title: 'Build a program together',
      body: 'Bring funding, technical skill or research support into active projects.',
      helper: 'Best for organizations',
      image: '/images/programs/environment-hero1.jpg',
      alt: 'Community forestry and environmental program activity',
      to: '/get-involved/partner',
      cta: 'Partner',
    },
    {
      label: 'Volunteer',
      title: 'Share useful time',
      body: 'Support field activities, learning materials, documentation or outreach.',
      helper: 'Best for hands-on help',
      image: '/images/programs/child-protection2.jpg',
      alt: 'Youth and community child protection activity',
      to: '/get-involved/volunteer',
      cta: 'Volunteer',
    },
  ],
  journey: [
    {
      step: '01',
      title: 'Choose a path',
      body: 'Pick donate, partner or volunteer based on your time and role.',
    },
    {
      step: '02',
      title: 'Talk with the team',
      body: 'Share your interest so Santi Sena can match it to field needs.',
    },
    {
      step: '03',
      title: 'Support locally',
      body: 'Your action connects with villages, schools, pagodas and staff teams.',
    },
  ],
  focusAreas: [
    { label: 'Education', detail: 'Books, learning and school support' },
    { label: 'Livelihoods', detail: 'Savings, gardens and rural income' },
    { label: 'Environment', detail: 'Forests, seedlings and climate action' },
    { label: 'Protection', detail: 'Child safety and youth participation' },
  ],
  cta: {
    eyebrow: 'Ready',
    title: 'Start with one clear next step.',
    body: 'Choose the route that fits you. The team can guide the details from there.',
    primaryCta: { label: 'Contact Santi Sena', to: '/contact' },
    secondaryCta: { label: 'See programs', to: '/programs' },
    image: '/images/programs/hero-4.jpg',
    alt: 'Santi Sena community gathering',
  },
}

const contentStore = useContentStore()
const cmsContent = ref<Partial<GetInvolvedPageContent> | null>(null)

const pageContent = computed<GetInvolvedPageContent>(() =>
  mergeGetInvolvedContent(fallbackContent, cmsContent.value),
)

const heroImages = computed(() => pageContent.value.hero.images)
const defaultHeroImage = fallbackContent.hero.images[0]!
const heroImage = computed(() => heroImages.value[0] ?? defaultHeroImage)
const waysImage = computed(() => heroImages.value[1] ?? heroImage.value)
const slideItems = computed(() =>
  heroImages.value.map((image) => ({
    image: image.src,
    caption: '',
    alt: image.alt,
  })),
)

const description =
  'Get involved with Santi Sena through giving, partnership or volunteering in community-led work for livelihoods, education, child protection and environmental preservation.'

let previousTitle = ''
let descriptionMeta: HTMLMetaElement | null = null
let previousDescription: string | null = null
let createdDescriptionMeta = false

onMounted(async () => {
  previousTitle = document.title
  document.title = 'Get Involved with Santi Sena'
  setDescription(description)

  try {
    const page = await contentStore.fetchBySlug(PAGE_SLUG)
    cmsContent.value = parseCmsBody(page.body)
  } catch {
    cmsContent.value = null
  }
})

onUnmounted(() => {
  document.title = previousTitle

  if (descriptionMeta && createdDescriptionMeta) {
    descriptionMeta.remove()
  } else if (descriptionMeta && previousDescription !== null) {
    descriptionMeta.setAttribute('content', previousDescription)
  }
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

function isHashLink(to: string) {
  return to.startsWith('#')
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
  const cta: Record<string, unknown> = isRecord(override.cta) ? override.cta : {}

  return {
    hero: {
      ...base.hero,
      ...hero,
      primaryCta: mergeObject(base.hero.primaryCta, hero.primaryCta),
      secondaryCta: mergeObject(base.hero.secondaryCta, hero.secondaryCta),
      images: mergeArray<HeroImage>(hero.images, base.hero.images),
    },
    paths: mergeArray<InvolvementPath>(override.paths, base.paths),
    journey: mergeArray<JourneyStep>(override.journey, base.journey),
    focusAreas: mergeArray<FocusItem>(override.focusAreas, base.focusAreas),
    cta: {
      ...base.cta,
      ...cta,
      primaryCta: mergeObject(base.cta.primaryCta, cta.primaryCta),
      secondaryCta: mergeObject(base.cta.secondaryCta, cta.secondaryCta),
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
</script>

<template>
  <main class="get-involved-page">
    <Slideshow :slides="slideItems" :interval-ms="5600" aria-labelledby="get-involved-title">
      <div class="hero-shade" />
      <div class="hero-content">
        <p class="eyebrow">{{ pageContent.hero.eyebrow }}</p>
        <h1 id="get-involved-title">{{ pageContent.hero.title }}</h1>
        <p class="lead">{{ pageContent.hero.description }}</p>
        <div class="hero-actions" aria-label="Get involved actions">
          <RouterLink :to="pageContent.hero.primaryCta.to" class="button button-primary">
            {{ pageContent.hero.primaryCta.label }}
          </RouterLink>
          <a
            v-if="isHashLink(pageContent.hero.secondaryCta.to)"
            :href="pageContent.hero.secondaryCta.to"
            class="button button-secondary"
          >
            {{ pageContent.hero.secondaryCta.label }}
          </a>
          <RouterLink v-else :to="pageContent.hero.secondaryCta.to" class="button button-secondary">
            {{ pageContent.hero.secondaryCta.label }}
          </RouterLink>
        </div>
      </div>
    </Slideshow>

    <section id="ways-to-help" class="ways-section" aria-labelledby="ways-heading">
      <div class="section-heading">
        <p class="eyebrow">Ways to help</p>
        <h2 id="ways-heading">Pick the route that fits you.</h2>
      </div>

      <div class="ways-panel">
        <div class="ways-list">
          <article v-for="path in pageContent.paths" :key="path.title" class="way-row">
            <span>{{ path.label }}</span>
            <h3>{{ path.title }}</h3>
            <p>{{ path.body }}</p>
            <div class="way-row__footer">
              <small>{{ path.helper }}</small>
              <RouterLink :to="path.to" class="way-link">{{ path.cta }}</RouterLink>
            </div>
          </article>
        </div>
        <figure class="ways-media">
          <img :src="waysImage.src" :alt="waysImage.alt" loading="lazy" />
        </figure>
      </div>
    </section>

    <section class="journey-section" aria-labelledby="journey-heading">
      <div class="journey-copy">
        <p class="eyebrow">Simple process</p>
        <h2 id="journey-heading">From interest to field action.</h2>
      </div>
      <ol class="journey-list">
        <li v-for="item in pageContent.journey" :key="item.step">
          <span>{{ item.step }}</span>
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="focus-section" aria-labelledby="focus-heading">
      <div class="focus-panel">
        <div class="focus-copy">
          <p class="eyebrow">Program focus</p>
          <h2 id="focus-heading">Your support stays practical.</h2>
        </div>
        <div class="focus-list" aria-label="Program focus areas">
          <article v-for="area in pageContent.focusAreas" :key="area.label">
            <h3>{{ area.label }}</h3>
            <p>{{ area.detail }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="closing-cta" aria-labelledby="cta-heading">
      <div class="closing-cta__content">
        <p class="eyebrow">{{ pageContent.cta.eyebrow }}</p>
        <h2 id="cta-heading">{{ pageContent.cta.title }}</h2>
        <p>{{ pageContent.cta.body }}</p>
        <div class="cta-actions">
          <RouterLink :to="pageContent.cta.primaryCta.to" class="button button-primary">
            {{ pageContent.cta.primaryCta.label }}
          </RouterLink>
          <RouterLink :to="pageContent.cta.secondaryCta.to" class="button button-secondary">
            {{ pageContent.cta.secondaryCta.label }}
          </RouterLink>
        </div>
      </div>
      <img :src="pageContent.cta.image" :alt="pageContent.cta.alt" loading="lazy" />
    </section>
  </main>
</template>

<style scoped>
.get-involved-page {
  --hub-panel: var(--color-white);
  --hub-muted: var(--color-ink-soft);
  --hub-line: var(--color-border);
  --hub-shadow: 0 18px 44px rgba(43, 43, 40, 0.08);

  min-height: 100vh;
  background: var(--color-cream);
  color: var(--color-ink);
}

.ways-section,
.journey-section,
.focus-section,
.closing-cta {
  width: min(100% - 3rem, var(--container-max-width));
  margin: 0 auto;
}

.hero-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(6, 18, 13, 0.74) 0%,
      rgba(6, 18, 13, 0.44) 42%,
      rgba(6, 18, 13, 0.1) 78%,
      rgba(6, 18, 13, 0.04) 100%
    ),
    linear-gradient(0deg, rgba(6, 18, 13, 0.16), transparent 48%);
}

.hero-content {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  width: min(100% - 3rem, var(--container-max-width));
  max-width: 760px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  margin-left: var(--container-offset);
  padding: 3rem 1.5rem 3rem 0;
  text-align: left;
  animation: fadeInUp 0.8s ease-out;
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

.eyebrow {
  margin: 0 0 0.8rem;
  color: var(--primary-dark);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  line-height: 1.2;
  text-transform: uppercase;
}

.hero-content h1,
.section-heading h2,
.journey-copy h2,
.focus-copy h2,
.closing-cta h2 {
  margin: 0;
  color: var(--color-ink);
  font-weight: 600;
  line-height: 1.16;
  text-wrap: balance;
}

.hero-content .eyebrow {
  color: var(--primary-light);
}

.hero-content h1 {
  max-width: 720px;
  margin-top: 0.85rem;
  color: #fffaf0;
  font-size: 2.9rem;
}

.lead {
  max-width: 600px;
  margin: 1.2rem 0 0;
  color: rgba(255, 250, 240, 0.9);
  font-size: 1.05rem;
  line-height: 1.75;
}

.hero-actions,
.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1.8rem;
}

.button {
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.75rem 1.25rem;
  font-weight: 800;
  line-height: 1.1;
  text-decoration: none;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button-primary {
  background: var(--primary-color);
  color: var(--color-white);
  box-shadow: 0 16px 30px rgba(20, 129, 62, 0.2);
}

.button-primary:hover {
  background: var(--primary-dark);
  box-shadow: 0 18px 34px rgba(20, 129, 62, 0.28);
}

.button-secondary {
  border-color: rgba(20, 129, 62, 0.28);
  background: rgba(255, 255, 255, 0.72);
  color: var(--primary-dark);
}

.button-secondary:hover {
  border-color: rgba(20, 129, 62, 0.42);
  background: var(--color-white);
}

.hero-content .button-secondary {
  border-color: rgba(255, 250, 240, 0.62);
  background: rgba(255, 250, 240, 0.08);
  color: #fffaf0;
}

.hero-content .button-secondary:hover {
  border-color: rgba(255, 250, 240, 0.82);
  background: rgba(255, 250, 240, 0.16);
}

.ways-section {
  padding: 5rem 0 4rem;
}

.section-heading {
  max-width: 700px;
}

.section-heading h2,
.journey-copy h2,
.focus-copy h2 {
  margin-top: 0.65rem;
}

.ways-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.85fr);
  gap: 2rem;
  align-items: stretch;
  margin-top: 2.25rem;
}

.ways-list {
  display: grid;
  gap: 0.9rem;
}

.way-row {
  display: grid;
  gap: 0.65rem;
  border: 1px solid var(--hub-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.74);
  padding: 1.2rem;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.way-row:hover {
  border-color: rgba(20, 129, 62, 0.28);
  box-shadow: 0 12px 28px rgba(43, 43, 40, 0.07);
  transform: translateY(-2px);
}

.way-row span,
.way-row small {
  color: var(--primary-dark);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1.3;
  text-transform: uppercase;
}

.way-row h3 {
  margin: 0;
  color: var(--color-ink);
  font-size: 1.22rem;
  line-height: 1.2;
}

.way-row p {
  margin: 0;
  color: var(--hub-muted);
  line-height: 1.55;
}

.way-row__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.25rem;
}

.way-row small {
  color: var(--color-ink-soft);
  letter-spacing: 0.04em;
}

.way-link {
  width: fit-content;
  margin-top: 1.25rem;
  color: var(--primary-dark);
  font-weight: 900;
  text-decoration: none;
}

.way-link:hover {
  color: var(--primary-color);
}

.ways-media {
  overflow: hidden;
  min-height: 100%;
  border-radius: 8px;
  background: var(--hub-panel);
  box-shadow: var(--hub-shadow);
}

.ways-media img {
  width: 100%;
  height: 100%;
  min-height: 430px;
  object-fit: cover;
}

.journey-section {
  display: grid;
  grid-template-columns: minmax(0, 0.7fr) minmax(420px, 1fr);
  gap: 2rem;
  align-items: start;
  padding: 4rem 0;
}

.journey-list {
  display: grid;
  gap: 0.85rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.journey-list li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  border: 1px solid var(--hub-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  padding: 1rem;
}

.journey-list span {
  display: inline-flex;
  width: 2.65rem;
  height: 2.65rem;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary-dark);
  font-size: 0.8rem;
  font-weight: 900;
}

.journey-list h3 {
  margin: 0;
  font-size: 1.05rem;
}

.journey-list p {
  margin: 0.35rem 0 0;
  color: var(--hub-muted);
  line-height: 1.55;
}

.focus-section {
  padding: 2rem 0 5rem;
}

.focus-panel {
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(420px, 1fr);
  gap: 2rem;
  border: 1px solid rgba(20, 129, 62, 0.16);
  border-radius: 8px;
  background: var(--primary-light);
  padding: 2rem;
}

.focus-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.focus-list article {
  border: 1px solid rgba(20, 129, 62, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  padding: 1rem;
}

.focus-list h3 {
  margin: 0;
  color: var(--primary-dark);
  font-size: 1.02rem;
}

.focus-list p {
  margin: 0.45rem 0 0;
  color: var(--hub-muted);
  line-height: 1.5;
}

.closing-cta {
  display: grid;
  grid-template-columns: minmax(260px, 0.82fr) minmax(0, 1fr);
  gap: 2rem;
  align-items: center;
  padding: 0 0 5.5rem;
}

.closing-cta img {
  width: 100%;
  min-height: 330px;
  border-radius: 8px;
  object-fit: cover;
}

.closing-cta__content {
  border: 1px solid var(--hub-line);
  border-radius: 8px;
  background: var(--color-white);
  padding: 2rem;
  box-shadow: 0 12px 28px rgba(43, 43, 40, 0.06);
}

.closing-cta__content h2 {
  margin-top: 0.65rem;
}

.closing-cta__content p:not(.eyebrow) {
  margin: 0.9rem 0 0;
  color: var(--hub-muted);
  line-height: 1.65;
}

@media (max-width: 1000px) {
  .ways-panel,
  .journey-section,
  .focus-panel,
  .closing-cta {
    grid-template-columns: 1fr;
  }

  .ways-media img {
    min-height: 360px;
  }
}

@media (max-width: 700px) {
  .ways-section,
  .journey-section,
  .focus-section,
  .closing-cta {
    width: min(100% - 2rem, var(--container-max-width));
  }

  .hero-content {
    width: min(100% - 2rem, var(--container-max-width));
    margin-left: 1rem;
    padding: 2rem 0;
  }

  .hero-content h1 {
    font-size: 2.1rem;
  }

  .lead {
    font-size: 1rem;
  }

  .hero-actions,
  .cta-actions {
    flex-direction: column;
  }

  .button {
    width: 100%;
  }

  .ways-media img {
    height: 240px;
    min-height: 240px;
  }

  .ways-panel {
    gap: 1.25rem;
  }

  .focus-panel {
    padding: 1.25rem;
  }

  .focus-list {
    grid-template-columns: 1fr;
  }

  .closing-cta img {
    min-height: 240px;
  }

  .closing-cta__content {
    padding: 1.35rem;
  }
}
</style>
