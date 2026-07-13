<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import Slideshow from '@/components/shared/Slideshow.vue'
import { useContentStore } from '@/stores/content.store'

interface PartnerLink {
  label: string
  to: string
}

interface PartnerSlide {
  image: string
  caption: string
}

interface PartnerHero {
  eyebrow: string
  title: string
  description: string
  primaryCta: PartnerLink
  secondaryCta: PartnerLink
  slides: PartnerSlide[]
}

interface PartnerProject {
  period: string
  title: string
  partner: string
  focus: string
  image: string
}

interface PartnerOperatingModel {
  step: string
  title: string
  detail: string
  metric: string
}

interface PartnerStrategicTheme {
  title: string
  detail: string
  action: string
}

interface PartnerNetwork {
  label: string
  title: string
  detail: string
}

interface PartnerFundingHistory {
  name: string
  detail: string
}

interface PartnerCta {
  eyebrow: string
  title: string
  body: string
  primaryCta: PartnerLink
  secondaryCta: PartnerLink
  image: string
}

interface PartnerPageContent {
  hero: PartnerHero
  activeProjects: PartnerProject[]
  operatingModel: PartnerOperatingModel[]
  strategicThemes: PartnerStrategicTheme[]
  networks: PartnerNetwork[]
  fundingHistory: PartnerFundingHistory[]
  cta: PartnerCta
}

const PAGE_SLUG = 'get-involved-partner'

const fallbackContent: PartnerPageContent = {
  hero: {
    eyebrow: 'Get involved - Partner',
    title: 'Partner with Santi Sena',
    description:
      'Support practical programs with communities, local authorities, Buddhist networks and technical partners.',
    primaryCta: { label: 'Start a partnership', to: '/contact' },
    secondaryCta: { label: 'View portfolio', to: '#portfolio' },
    slides: [
      { image: '/images/programs/environment-hero2.jpg', caption: '' },
      { image: '/images/programs/livelihood-hero4.jpg', caption: '' },
      { image: '/images/programs/education-hero.jpg', caption: '' },
    ],
  },
  activeProjects: [
    {
      period: '2021-2024',
      title: 'Healthy environment for children',
      partner: 'Terre des Hommes Germany and BMZ',
      focus: 'Health and environment support for disadvantaged families in Svay Rieng.',
      image: '/images/programs/environment-hero1.jpg',
    },
    {
      period: '2023-2026',
      title: 'Mekong climate adaptation',
      partner: 'Terre des Hommes Germany and BMZ',
      focus: 'Children and youth action across Cambodia, Thailand, Laos PDR and Vietnam.',
      image: '/images/programs/hero-4.jpg',
    },
    {
      period: '2023-2025',
      title: 'Food security, sanitation and hygiene',
      partner: 'Lotus Outreach International',
      focus: 'Food security, sanitation and hygiene with rural communities.',
      image: '/images/programs/livelihood-hero2.jpg',
    },
    {
      period: '2024-2026',
      title: 'Buddhist primary education',
      partner: 'Khyentse Foundation',
      focus: 'Learning support through monastery-based primary schools.',
      image: '/images/programs/education-hero.jpg',
    },
    {
      period: '2023-2024',
      title: 'My Planet, My Right in ASEAN',
      partner: 'Terre des Hommes Germany',
      focus: 'Child and youth advocacy for environmental rights.',
      image: '/images/programs/child-protection2.jpg',
    },
  ],
  operatingModel: [
    {
      step: '01',
      title: 'Field teams',
      detail:
        'Project staff work with beneficiaries, local authorities and government stakeholders.',
      metric: 'Local delivery',
    },
    {
      step: '02',
      title: 'Monthly plans',
      detail: 'Teams prepare action plans, budgets and achievement reports.',
      metric: 'Clear tracking',
    },
    {
      step: '03',
      title: 'Donor reports',
      detail: 'Progress reports are shared every three months or as required.',
      metric: 'Quarterly partner updates',
    },
    {
      step: '04',
      title: 'Monitoring and evaluation',
      detail: 'M&E includes staff, beneficiaries and local authorities.',
      metric: '3-month M&E rhythm',
    },
    {
      step: '05',
      title: 'Learning review',
      detail: 'Final reports capture lessons for the next project cycle.',
      metric: 'Lessons retained',
    },
  ],
  strategicThemes: [
    {
      title: 'Diversified funding',
      detail: 'Long-term donors and wider income sources improve stability.',
      action: 'Multi-year grants and local income streams.',
    },
    {
      title: 'Research and knowledge management',
      detail: 'Field learning can become research, evidence and advocacy.',
      action: 'Studies, learning notes and technical support.',
    },
    {
      title: 'Social enterprise and rural markets',
      detail: 'Farmer groups and cooperatives need practical market links.',
      action: 'Producer coaching and enterprise support.',
    },
    {
      title: 'Resource center and outreach library',
      detail: 'Libraries connect children, youth and farmers to useful knowledge.',
      action: 'Books, outreach and digital learning.',
    },
  ],
  networks: [
    {
      label: 'National civil society',
      title: 'NGO Forum and CRC Cambodia',
      detail: 'Coordination on child rights, environment and development.',
    },
    {
      label: 'Faith and peace',
      title: 'United Religions Initiative',
      detail: "A values-based network linked to Santi Sena's Buddhist roots.",
    },
    {
      label: 'Regional biodiversity',
      title: 'Working Group for Bio-diversity in Southeast Asia',
      detail: 'Regional learning for natural resources and climate adaptation.',
    },
    {
      label: 'Community intermediaries',
      title: 'Monks, youth and child-peer promoters',
      detail: 'Local people who carry awareness into villages.',
    },
  ],
  fundingHistory: [
    {
      name: 'Development donors',
      detail: 'CIDSE Cambodia, OXFAM G.B., Pact Cambodia, U.S. Embassy and CRS.',
    },
    {
      name: 'UN and multilateral support',
      detail: 'UNDP-GEF-SGP, UNDP-PTF-SGP and ADB through Plan Cambodia.',
    },
    {
      name: 'Child and community partners',
      detail: 'Tdh Netherlands, ChildFund, Heifer and Habitat Cambodia.',
    },
    {
      name: 'WASH and education partners',
      detail: 'Global Sanitation Fund through Plan International Cambodia and Khyentse Foundation.',
    },
  ],
  cta: {
    eyebrow: 'Partner with us',
    title: 'Bring funding, technical skill or learning capacity into a working field system.',
    body: 'Share your focus area and timeframe. The team can match it to current programs and community priorities.',
    primaryCta: { label: 'Contact partnerships team', to: '/contact' },
    secondaryCta: { label: 'Explore programs', to: '/programs' },
    image: '/images/programs/hero-1.jpg',
  },
}

const contentStore = useContentStore()
const cmsContent = ref<Partial<PartnerPageContent> | null>(null)

const pageContent = computed<PartnerPageContent>(() =>
  mergePartnerContent(fallbackContent, cmsContent.value),
)

const slideItems = computed(() =>
  pageContent.value.hero.slides.length
    ? pageContent.value.hero.slides
    : fallbackContent.hero.slides,
)

const portfolioStats = computed(() => [
  {
    value: '2023-2026',
    label: 'Project portfolio window',
  },
  {
    value: '3 months',
    label: 'Internal M&E rhythm',
  },
  {
    value: '10+',
    label: 'Grant relationships managed',
  },
])

const description = computed(
  () =>
    'Partner with Santi Sena through current and strategic programs in climate adaptation, WASH, education, child rights, research and community-led livelihoods.',
)

let previousTitle = ''
let descriptionMeta: HTMLMetaElement | null = null
let previousDescription: string | null = null
let createdDescriptionMeta = false
let revealObserver: IntersectionObserver | null = null

function mergePartnerContent(
  base: PartnerPageContent,
  override: Partial<PartnerPageContent> | null,
): PartnerPageContent {
  if (!override) return base

  return {
    hero: { ...base.hero, ...override.hero },
    activeProjects: Array.isArray(override.activeProjects)
      ? override.activeProjects
      : base.activeProjects,
    operatingModel: Array.isArray(override.operatingModel)
      ? override.operatingModel
      : base.operatingModel,
    strategicThemes: Array.isArray(override.strategicThemes)
      ? override.strategicThemes
      : base.strategicThemes,
    networks: Array.isArray(override.networks) ? override.networks : base.networks,
    fundingHistory: Array.isArray(override.fundingHistory)
      ? override.fundingHistory
      : base.fundingHistory,
    cta: { ...base.cta, ...override.cta },
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function loadCmsContent() {
  try {
    const page = await contentStore.fetchBySlug(PAGE_SLUG)
    const body = page.body.trim()
    if (!body) return

    const parsed = JSON.parse(body)
    if (isObject(parsed)) {
      cmsContent.value = parsed as Partial<PartnerPageContent>
    }
  } catch {
    cmsContent.value = null
  }
}

function setDocumentMeta() {
  document.title = pageContent.value.hero.title

  descriptionMeta = document.querySelector('meta[name="description"]')
  previousDescription = descriptionMeta?.getAttribute('content') ?? null

  if (!descriptionMeta) {
    descriptionMeta = document.createElement('meta')
    descriptionMeta.setAttribute('name', 'description')
    document.head.appendChild(descriptionMeta)
    createdDescriptionMeta = true
  }

  descriptionMeta.setAttribute('content', description.value)
}

function revealStatic() {
  document
    .querySelectorAll<HTMLElement>('.pop-reveal')
    .forEach((element) => element.classList.add('is-visible'))
}

function initScrollReveal() {
  revealObserver?.disconnect()

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    revealStatic()
    return
  }

  const elements = Array.from(document.querySelectorAll<HTMLElement>('.pop-reveal'))

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        revealObserver?.unobserve(entry.target)
      })
    },
    {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.16,
    },
  )

  elements.forEach((element, index) => {
    element.style.setProperty('--pop-delay', `${Math.min(index * 55, 420)}ms`)
    revealObserver?.observe(element)
  })
}

onMounted(async () => {
  previousTitle = document.title
  setDocumentMeta()
  await loadCmsContent()
  setDocumentMeta()
  await nextTick()
  initScrollReveal()
})

onUnmounted(() => {
  revealObserver?.disconnect()
  document.title = previousTitle

  if (descriptionMeta && createdDescriptionMeta) {
    descriptionMeta.remove()
  } else if (descriptionMeta && previousDescription !== null) {
    descriptionMeta.setAttribute('content', previousDescription)
  }
})
</script>

<template>
  <main class="partner-page">
    <Slideshow :slides="slideItems" :interval-ms="6200">
      <div class="hero-shade" />
      <div class="hero-grid">
        <section class="hero-copy pop-reveal is-visible" aria-labelledby="partner-hero-title">
          <p class="eyebrow">{{ pageContent.hero.eyebrow }}</p>
          <h1 id="partner-hero-title">{{ pageContent.hero.title }}</h1>
          <p class="lead">{{ pageContent.hero.description }}</p>
          <div class="hero-actions" aria-label="Partnership actions">
            <RouterLink :to="pageContent.hero.primaryCta.to" class="button button-primary">
              {{ pageContent.hero.primaryCta.label }}
            </RouterLink>
            <a :href="pageContent.hero.secondaryCta.to" class="button button-ghost">
              {{ pageContent.hero.secondaryCta.label }}
            </a>
          </div>
        </section>

        <aside class="hero-brief pop-reveal is-visible" aria-label="Partnership readiness">
          <span>Partner readiness</span>
          <strong>Field delivery, donor reports and community feedback in one loop.</strong>
        </aside>
      </div>
    </Slideshow>

    <section class="stat-strip" aria-label="Partner page highlights">
      <div v-for="stat in portfolioStats" :key="stat.label" class="stat-item pop-reveal">
        <strong>{{ stat.value }}</strong>
        <span>{{ stat.label }}</span>
      </div>
    </section>

    <section
      id="portfolio"
      class="portfolio-section section-shell"
      aria-labelledby="portfolio-heading"
    >
      <div class="section-intro pop-reveal">
        <p class="section-kicker">Recent and current portfolio</p>
        <h2 id="portfolio-heading">Current partnership portfolio.</h2>
        <p>A quick view of active project themes, timeframes and funding partners.</p>
      </div>

      <div class="project-grid">
        <article
          v-for="(project, index) in pageContent.activeProjects"
          :key="project.title"
          class="project-card pop-reveal"
          :class="{ 'project-card--wide': index === 0 }"
        >
          <img :src="project.image" :alt="project.title" loading="lazy" />
          <div class="project-card__content">
            <div class="project-card__topline">
              <span>{{ project.period }}</span>
              <small>{{ project.partner }}</small>
            </div>
            <h3>{{ project.title }}</h3>
            <p>{{ project.focus }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="operating-section" aria-labelledby="operating-heading">
      <div class="operating-inner">
        <div class="operating-copy pop-reveal">
          <p class="section-kicker">How partnership works</p>
          <h2 id="operating-heading">Clear field rhythm.</h2>
          <p>Support moves through planning, reporting, monitoring and learning.</p>
        </div>

        <ol class="operating-rail">
          <li
            v-for="item in pageContent.operatingModel"
            :key="item.step"
            class="operating-item pop-reveal"
          >
            <span class="operating-step">{{ item.step }}</span>
            <div>
              <strong>{{ item.metric }}</strong>
              <h3>{{ item.title }}</h3>
              <p>{{ item.detail }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="strategy-section section-shell" aria-labelledby="strategy-heading">
      <div class="section-intro pop-reveal">
        <p class="section-kicker">Strategic partnership space</p>
        <h2 id="strategy-heading">Where partners can help next.</h2>
      </div>

      <div class="strategy-grid">
        <article
          v-for="theme in pageContent.strategicThemes"
          :key="theme.title"
          class="strategy-card pop-reveal"
        >
          <span aria-hidden="true"></span>
          <h3>{{ theme.title }}</h3>
          <p>{{ theme.detail }}</p>
          <strong>{{ theme.action }}</strong>
        </article>
      </div>
    </section>

    <section class="network-section" aria-labelledby="network-heading">
      <div class="network-inner">
        <div class="network-panel pop-reveal">
          <p class="section-kicker">Network layers</p>
          <h2 id="network-heading">Connected beyond the office.</h2>
          <p>Civil society, faith and youth networks help learning reach villages.</p>
        </div>

        <div class="network-grid">
          <article
            v-for="network in pageContent.networks"
            :key="network.title"
            class="network-card pop-reveal"
          >
            <span>{{ network.label }}</span>
            <h3>{{ network.title }}</h3>
            <p>{{ network.detail }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="funding-section section-shell" aria-labelledby="funding-heading">
      <div class="section-intro pop-reveal">
        <p class="section-kicker">Funding history</p>
        <h2 id="funding-heading">A wider support base.</h2>
      </div>

      <div class="funding-list">
        <article
          v-for="item in pageContent.fundingHistory"
          :key="item.name"
          class="funding-item pop-reveal"
        >
          <h3>{{ item.name }}</h3>
          <p>{{ item.detail }}</p>
        </article>
      </div>
    </section>

    <section class="cta-section" aria-label="Partnership contact">
      <img :src="pageContent.cta.image" alt="" aria-hidden="true" loading="lazy" />
      <div class="cta-content pop-reveal">
        <p class="eyebrow">{{ pageContent.cta.eyebrow }}</p>
        <h2>{{ pageContent.cta.title }}</h2>
        <p>{{ pageContent.cta.body }}</p>
        <div class="hero-actions">
          <RouterLink :to="pageContent.cta.primaryCta.to" class="button button-primary">
            {{ pageContent.cta.primaryCta.label }}
          </RouterLink>
          <RouterLink :to="pageContent.cta.secondaryCta.to" class="button button-ghost">
            {{ pageContent.cta.secondaryCta.label }}
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.partner-page {
  --partner-accent: var(--primary-color);
  --partner-surface: var(--color-white);
  --partner-dark: var(--primary-dark);

  min-height: 100vh;
  overflow: hidden;
  background: var(--color-cream);
  color: var(--color-ink);
}

.hero-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(6, 18, 13, 0.86), rgba(6, 18, 13, 0.58) 46%, rgba(6, 18, 13, 0.16)),
    linear-gradient(0deg, rgba(6, 18, 13, 0.32), transparent 42%);
}

.hero-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: minmax(0, 0.78fr) minmax(260px, 0.36fr);
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: center;
  width: min(100% - 3rem, var(--container-max-width));
  margin: 0 auto;
}

.hero-copy {
  max-width: 780px;
}

.eyebrow,
.section-kicker {
  margin: 0;
  color: var(--primary-light);
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  line-height: 1.2;
  text-transform: uppercase;
}

.section-kicker {
  color: var(--primary-color);
}

.hero-copy h1,
.section-intro h2,
.operating-copy h2,
.network-panel h2,
.cta-content h2 {
  margin: 0;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: 0;
  text-wrap: balance;
}

.hero-copy h1 {
  max-width: 760px;
  margin-top: 1rem;
  color: #fffaf0;
}

.lead {
  max-width: 700px;
  margin: 1.35rem 0 0;
  color: rgba(255, 250, 240, 0.9);
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  align-items: center;
  margin-top: 2rem;
}

.button {
  display: inline-flex;
  min-height: 3.15rem;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.82rem 1.35rem;
  font-weight: 850;
  line-height: 1.1;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.button:hover {
  transform: translateY(-2px);
}

.button-primary {
  background: var(--primary-color);
  color: var(--color-white);
  box-shadow: 0 18px 34px rgba(27, 163, 79, 0.24);
}

.button-primary:hover {
  background: var(--primary-dark);
  box-shadow: 0 22px 42px rgba(20, 129, 62, 0.32);
}

.button-ghost {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.08);
  color: #fffaf0;
}

.button-ghost:hover {
  border-color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.15);
}

.hero-brief {
  align-self: end;
  margin-bottom: 4rem;
  border: 1px solid rgba(255, 250, 240, 0.2);
  border-radius: 8px;
  background: rgba(20, 129, 62, 0.42);
  padding: 1.15rem;
  color: #fffaf0;
  backdrop-filter: blur(10px);
}

.hero-brief span {
  display: block;
  color: var(--primary-light);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-brief strong {
  display: block;
  margin-top: 0.7rem;
  font-size: 1rem;
  line-height: 1.45;
}

.section-shell,
.stat-strip,
.operating-inner,
.network-inner,
.cta-content {
  width: min(100% - 3rem, var(--container-max-width));
  margin: 0 auto;
}

.stat-strip {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: -3.2rem;
}

.stat-item {
  min-height: 112px;
  border: 1px solid rgba(232, 228, 223, 0.9);
  border-radius: 8px;
  background: var(--partner-surface);
  padding: 1.15rem;
  box-shadow: 0 14px 32px rgba(20, 129, 62, 0.08);
}

.stat-item strong {
  display: block;
  color: var(--primary-dark);
  font-size: 2rem;
  font-weight: 500;
  line-height: 1;
}

.stat-item span {
  display: block;
  margin-top: 0.75rem;
  color: var(--color-ink-soft);
  line-height: 1.35;
}

.portfolio-section,
.strategy-section,
.funding-section {
  padding: 5rem 0;
}

.section-intro {
  max-width: 780px;
}

.section-intro h2,
.operating-copy h2,
.network-panel h2 {
  margin-top: 0.8rem;
  color: var(--color-ink);
}

.section-intro p:not(.section-kicker),
.operating-copy p,
.network-panel p {
  margin: 1rem 0 0;
  color: var(--color-ink-soft);
  line-height: 1.7;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.15rem;
  margin-top: 2rem;
}

.project-card {
  min-height: auto;
  display: grid;
  grid-template-columns: minmax(170px, 0.42fr) minmax(0, 1fr);
  align-items: stretch;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-white);
  box-shadow: 0 4px 14px rgba(20, 129, 62, 0.05);
}

.project-card--wide {
  grid-column: auto;
}

.project-card img {
  width: 100%;
  height: 100%;
  min-height: 190px;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.project-card:hover img {
  transform: scale(1.02);
}

.project-card__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1.15rem 1.2rem;
  color: var(--color-ink);
}

.project-card__topline {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.7rem;
  align-items: center;
}

.project-card__topline span,
.project-card__topline small {
  display: inline-flex;
  border-radius: 999px;
  font-weight: 700;
  line-height: 1.1;
}

.project-card__topline span {
  border: 1px solid color-mix(in srgb, var(--primary-color) 22%, transparent);
  background: transparent;
  color: var(--primary-dark);
  padding: 0.3rem 0.6rem;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.project-card__topline small {
  max-width: 100%;
  background: transparent;
  color: var(--color-ink-soft);
  padding: 0;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.35;
}

.project-card h3 {
  margin: 0.65rem 0 0;
  color: var(--color-ink);
  font-size: 1.12rem;
  line-height: 1.28;
}

.project-card p {
  max-width: 44rem;
  margin: 0.5rem 0 0;
  color: var(--color-ink-soft);
  font-size: 0.9rem;
  line-height: 1.5;
}

.operating-section {
  padding: 5rem 0;
  background: var(--primary-light);
}

.operating-inner {
  display: grid;
  grid-template-columns: minmax(260px, 0.42fr) minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 4rem);
  align-items: start;
}

.operating-copy {
  position: sticky;
  top: 7rem;
}

.operating-rail {
  position: relative;
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.operating-rail::before {
  position: absolute;
  top: 1rem;
  bottom: 1rem;
  left: 2.05rem;
  width: 2px;
  background: linear-gradient(180deg, var(--primary-color), rgba(20, 129, 62, 0.24));
  content: '';
}

.operating-item {
  position: relative;
  display: grid;
  grid-template-columns: 4.2rem minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-white);
  padding: 1.25rem;
  box-shadow: 0 10px 26px rgba(20, 129, 62, 0.06);
}

.operating-step {
  position: relative;
  z-index: 1;
  display: inline-flex;
  width: 3.6rem;
  height: 3.6rem;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary-dark);
  color: #fffaf0;
  font-weight: 900;
}

.operating-item strong {
  display: block;
  color: var(--primary-dark);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.operating-item h3 {
  margin: 0.45rem 0 0;
  color: var(--color-ink);
  line-height: 1.2;
}

.operating-item p {
  margin: 0.55rem 0 0;
  color: var(--color-ink-soft);
  line-height: 1.6;
}

.strategy-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2.4rem;
}

.strategy-card {
  min-height: 238px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(232, 228, 223, 0.92);
  border-radius: 8px;
  background: var(--partner-surface);
  padding: 1.35rem;
  box-shadow: 0 10px 24px rgba(20, 129, 62, 0.05);
}

.strategy-card > span {
  width: 3rem;
  height: 0.25rem;
  border-radius: 999px;
  background: var(--primary-color);
}

.strategy-card h3 {
  margin: 1rem 0 0;
  color: var(--primary-dark);
  font-size: 1.1rem;
  line-height: 1.25;
}

.strategy-card p {
  margin: 0.7rem 0 0;
  color: var(--color-ink-soft);
  font-size: 0.92rem;
  line-height: 1.55;
}

.strategy-card strong {
  display: block;
  margin-top: auto;
  border-radius: 8px;
  background: var(--primary-light);
  padding: 0.75rem;
  color: var(--primary-dark);
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.4;
}

.network-section {
  padding: 5rem 0;
  background: var(--primary-dark);
  color: #fffaf0;
}

.network-inner {
  display: grid;
  grid-template-columns: minmax(260px, 0.38fr) minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 4rem);
  align-items: start;
}

.network-panel {
  border-left: 4px solid var(--primary-color);
  padding-left: 1.35rem;
}

.network-panel h2,
.cta-content h2 {
  color: #fffaf0;
}

.network-panel p,
.cta-content p {
  color: rgba(255, 250, 240, 0.82);
}

.network-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.network-card {
  min-height: 178px;
  border: 1px solid rgba(255, 250, 240, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  padding: 1.35rem;
}

.network-card span {
  display: inline-flex;
  border: 1px solid rgba(255, 250, 240, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--primary-light);
  padding: 0.3rem 0.6rem;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.network-card h3 {
  margin: 0.8rem 0 0;
  color: #fffaf0;
  font-size: 1.1rem;
  line-height: 1.25;
}

.network-card p {
  margin: 0.65rem 0 0;
  color: rgba(255, 250, 240, 0.8);
  font-size: 0.92rem;
  line-height: 1.55;
}

.funding-section {
  background: var(--color-cream);
}

.funding-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2.35rem;
}

.funding-item {
  border-top: 5px solid var(--primary-color);
  border-radius: 8px;
  background: var(--partner-surface);
  padding: 1.25rem;
  box-shadow: 0 10px 24px rgba(20, 129, 62, 0.05);
}

.funding-item h3 {
  margin: 0;
  color: var(--primary-dark);
  font-size: 1.05rem;
  line-height: 1.25;
}

.funding-item p {
  margin: 0.65rem 0 0;
  color: var(--color-ink-soft);
  font-size: 0.92rem;
  line-height: 1.55;
}

.cta-section {
  position: relative;
  min-height: 420px;
  display: grid;
  align-items: center;
  overflow: hidden;
  background: var(--primary-dark);
  isolation: isolate;
}

.cta-section img {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.92);
}

.cta-section::after {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(90deg, rgba(6, 18, 13, 0.9), rgba(6, 18, 13, 0.62) 55%, rgba(6, 18, 13, 0.3)),
    linear-gradient(0deg, rgba(6, 18, 13, 0.3), transparent);
  content: '';
}

.cta-content {
  max-width: min(100% - 3rem, 860px);
  margin-left: max(1.5rem, calc((100vw - var(--container-max-width)) / 2));
  padding: 5rem 0;
}

.cta-content h2 {
  max-width: 780px;
  margin-top: 0.8rem;
}

.cta-content p:not(.eyebrow) {
  max-width: 680px;
  margin: 1rem 0 0;
  line-height: 1.7;
}

.pop-reveal {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(58px) scale(0.92);
  transition:
    opacity 0.72s cubic-bezier(0.2, 0.8, 0.2, 1),
    filter 0.72s cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 0.72s cubic-bezier(0.2, 0.8, 0.2, 1);
  transition-delay: var(--pop-delay, 0ms);
}

.pop-reveal.is-visible {
  opacity: 1;
  filter: blur(0);
  transform: translateY(0) scale(1);
}

@media (max-width: 1080px) {
  .hero-grid,
  .operating-inner,
  .network-inner {
    grid-template-columns: 1fr;
  }

  .hero-brief {
    align-self: start;
    max-width: 520px;
    margin-bottom: 2rem;
  }

  .project-grid,
  .strategy-grid,
  .funding-list {
    grid-template-columns: 1fr;
  }

  .operating-copy {
    position: static;
  }
}

@media (max-width: 760px) {
  .section-shell,
  .stat-strip,
  .operating-inner,
  .network-inner,
  .cta-content {
    width: min(100% - 2rem, var(--container-max-width));
  }

  .hero-grid {
    width: min(100% - 2rem, var(--container-max-width));
    align-content: center;
    gap: 1rem;
  }

  .hero-copy h1 {
    line-height: 1.12;
  }

  .lead {
    margin-top: 1rem;
    line-height: 1.55;
  }

  .hero-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .button {
    width: 100%;
  }

  .hero-brief {
    display: none;
  }

  .stat-strip,
  .project-grid,
  .strategy-grid,
  .network-grid,
  .funding-list {
    grid-template-columns: 1fr;
  }

  .stat-strip {
    margin-top: 1rem;
  }

  .portfolio-section,
  .strategy-section,
  .funding-section,
  .operating-section,
  .network-section {
    padding: 4.5rem 0;
  }

  .project-card,
  .project-card--wide {
    grid-column: auto;
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .project-card img,
  .project-card--wide img {
    height: 180px;
    min-height: 180px;
  }

  .operating-rail::before {
    display: none;
  }

  .operating-item {
    grid-template-columns: 1fr;
  }

  .operating-step {
    width: 3.4rem;
    height: 3.4rem;
  }

  .strategy-card,
  .network-card {
    min-height: auto;
  }

  .cta-content {
    margin-left: auto;
    padding: 4rem 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-card img,
  .button,
  .pop-reveal {
    transition: none;
  }

  .pop-reveal {
    opacity: 1;
    filter: none;
    transform: none;
  }
}
</style>
