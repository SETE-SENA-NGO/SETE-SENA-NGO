<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { localizeContentValue } from '@/i18n/contentTranslations'
import heroImpact from '@/assets/hero-impact.jpg'
import heroImpactForest from '@/assets/hero-impact-forest.jpg'
import heroImpactVillage from '@/assets/hero-impact-village.jpg'
import { useContentStore } from '@/stores/content.store'

defineOptions({ name: 'GetInvolvedPartnerView' })

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

type PartnerProjectIcon =
  | 'environment'
  | 'climate'
  | 'wash'
  | 'education'
  | 'rights'

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
  icon?: 'growth' | 'strategy' | 'time' | 'investment' | 'chart' | 'global'
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
const { locale } = useI18n()
const activeLocale = computed(() => (locale.value === 'kh' ? 'kh' : 'en'))

const fallbackContent: PartnerPageContent = {
  hero: {
    eyebrow: 'Get involved - Partner',
    title: 'Partner with Santi Sena',
    description:
      'Support practical programs with communities, local authorities, Buddhist networks and technical partners.',
    primaryCta: { label: 'Start a partnership', to: '/contact' },
    secondaryCta: { label: 'View portfolio', to: '#portfolio' },
    slides: [
      { image: heroImpactVillage, caption: '' },
      { image: heroImpactForest, caption: '' },
      { image: heroImpact, caption: '' },
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
      icon: 'growth',
    },
    {
      title: 'Research and knowledge management',
      detail: 'Field learning can become research, evidence and advocacy.',
      action: 'Studies, learning notes and technical support.',
      icon: 'strategy',
    },
    {
      title: 'Social enterprise and rural markets',
      detail: 'Farmer groups and cooperatives need practical market links.',
      action: 'Producer coaching and enterprise support.',
      icon: 'investment',
    },
    {
      title: 'Resource center and outreach library',
      detail:
        'Libraries connect children, youth and farmers to useful knowledge.',
      action: 'Books, outreach and digital learning.',
      icon: 'global',
    },
    {
      title: 'Climate and WASH readiness',
      detail:
        'Villages need practical systems for water, hygiene and climate adaptation.',
      action: 'Technical design, training and resilient infrastructure.',
      icon: 'chart',
    },
    {
      title: 'Child rights and safe migration',
      detail:
        'Young people benefit when protection networks can respond early.',
      action: 'Safeguarding systems, outreach and peer education.',
      icon: 'time',
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
      detail:
        'CIDSE Cambodia, OXFAM G.B., Pact Cambodia, U.S. Embassy and CRS.',
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
      detail:
        'Global Sanitation Fund through Plan International Cambodia and Khyentse Foundation.',
    },
  ],
  cta: {
    eyebrow: 'Partner with us',
    title:
      'Bring funding, technical skill or learning capacity into a working field system.',
    body: 'Share your focus area and timeframe. The team can match it to current programs and community priorities.',
    primaryCta: { label: 'Contact partnerships team', to: '/contact' },
    secondaryCta: { label: 'Explore programs', to: '/programs' },
    image: '/images/programs/hero-1.jpg',
  },
}

const contentStore = useContentStore()
const cmsContent = ref<Partial<PartnerPageContent> | null>(null)
let stopCmsSubscription: (() => void) | null = null

const pageContent = computed<PartnerPageContent>(() => {
  const merged = mergePartnerContent(fallbackContent, cmsContent.value)
  return activeLocale.value === 'kh'
    ? localizeContentValue(merged, activeLocale.value)
    : merged
})

function localizeText(value: string) {
  return activeLocale.value === 'kh'
    ? localizeContentValue(value, activeLocale.value)
    : value
}

const portfolioStats = computed(() => [
  {
    value: localizeText('2023-2026'),
    label: localizeText('Portfolio window'),
  },
  {
    value: localizeText('3 months'),
    label: localizeText('M&E review cycle'),
  },
  {
    value: localizeText('10+'),
    label: localizeText('Grant partners'),
  },
])

const fallbackFeaturedProject: PartnerProject = {
  period: '2023-2026',
  title: 'Current partnership portfolio',
  partner: 'Santi Sena partners',
  focus: 'Active project themes, timeframes and funding partners.',
  image: heroImpactVillage,
}

const featuredPortfolioProject = computed<PartnerProject>(() => {
  return pageContent.value.activeProjects[0] ?? fallbackFeaturedProject
})

const description = computed(
  () =>
    'Partner with Santi Sena through current and strategic programs in climate adaptation, WASH, education, child rights, research and community-led livelihoods.',
)

let previousTitle = ''
let descriptionMeta: HTMLMetaElement | null = null
let previousDescription: string | null = null
let createdDescriptionMeta = false
let revealObserver: IntersectionObserver | null = null
let lastScrollY = 0
const projectTrackRef = ref<HTMLElement | null>(null)
const canScrollProjectsPrev = ref(false)
const canScrollProjectsNext = ref(false)

function mergePartnerContent(
  base: PartnerPageContent,
  override: Partial<PartnerPageContent> | null,
): PartnerPageContent {
  if (!override) return base
  const mergedHero = { ...base.hero, ...override.hero }
  const overrideSlides = override.hero?.slides

  return {
    hero: {
      ...mergedHero,
      slides: normalizeSlides(overrideSlides, base.hero.slides),
    },
    activeProjects: Array.isArray(override.activeProjects)
      ? override.activeProjects
      : base.activeProjects,
    operatingModel: Array.isArray(override.operatingModel)
      ? override.operatingModel
      : base.operatingModel,
    strategicThemes: Array.isArray(override.strategicThemes)
      ? override.strategicThemes
      : base.strategicThemes,
    networks: Array.isArray(override.networks)
      ? override.networks
      : base.networks,
    fundingHistory: Array.isArray(override.fundingHistory)
      ? override.fundingHistory
      : base.fundingHistory,
    cta: { ...base.cta, ...override.cta },
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeSlides(value: unknown, fallback: PartnerSlide[]) {
  if (!Array.isArray(value)) return fallback

  const slides = value.filter(
    (slide): slide is PartnerSlide =>
      isObject(slide) &&
      typeof slide.image === 'string' &&
      slide.image.trim().length > 0,
  )

  return slides.length ? slides : fallback
}

function strategicIcon(theme: PartnerStrategicTheme, index: number) {
  const icons = [
    'growth',
    'strategy',
    'time',
    'investment',
    'chart',
    'global',
  ] as const
  return theme.icon ?? icons[index % icons.length]
}

function projectIcon(
  project: PartnerProject,
  index: number,
): PartnerProjectIcon {
  const title = project.title.toLowerCase()

  if (title.includes('environment')) return 'environment'
  if (title.includes('climate') || title.includes('mekong')) return 'climate'
  if (
    title.includes('food') ||
    title.includes('sanitation') ||
    title.includes('hygiene')
  ) {
    return 'wash'
  }
  if (title.includes('education') || title.includes('buddhist'))
    return 'education'
  if (title.includes('right') || title.includes('planet')) return 'rights'

  const icons = [
    'environment',
    'climate',
    'wash',
    'education',
    'rights',
  ] as const
  return icons[index % icons.length] ?? 'environment'
}

function scrollProjectTrack(direction: -1 | 1) {
  const track = projectTrackRef.value
  if (!track) return

  track.scrollBy({
    left: direction * track.clientWidth,
    behavior: 'smooth',
  })
}

function updateProjectNavState() {
  const track = projectTrackRef.value
  if (!track) {
    canScrollProjectsPrev.value = false
    canScrollProjectsNext.value = false
    return
  }

  const maxScrollLeft = track.scrollWidth - track.clientWidth
  canScrollProjectsPrev.value = track.scrollLeft > 4
  canScrollProjectsNext.value = track.scrollLeft < maxScrollLeft - 4
}

async function loadCmsContent() {
  try {
    const page = await contentStore.fetchBySlug(PAGE_SLUG, activeLocale.value)
    if (!page) return

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

watch(activeLocale, () => {
  void loadCmsContent()
})

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
  document.querySelectorAll<HTMLElement>('.pop-reveal').forEach((element) => {
    element.classList.remove('pop-from-up', 'pop-from-down')
    element.classList.add('is-visible')
  })
}

function initScrollReveal() {
  revealObserver?.disconnect()

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    revealStatic()
    return
  }

  const elements = Array.from(
    document.querySelectorAll<HTMLElement>('.pop-reveal'),
  )
  const staggerGroups = new Map<
    HTMLElement,
    { index: number; step: number; max: number }
  >()
  const registerStaggerGroup = (
    selector: string,
    step: number,
    max: number,
  ) => {
    document
      .querySelectorAll<HTMLElement>(selector)
      .forEach((element, index) => {
        staggerGroups.set(element, { index, step, max })
      })
  }

  registerStaggerGroup('.portfolio-stat-strip .portfolio-stat-item', 85, 260)
  registerStaggerGroup('.project-grid .project-card', 95, 300)
  registerStaggerGroup('.operating-rail .operating-item', 130, 520)
  registerStaggerGroup('.strategy-grid .strategy-card', 105, 420)
  registerStaggerGroup('.network-grid .network-card', 95, 300)
  registerStaggerGroup('.funding-list .funding-item', 95, 360)

  lastScrollY = window.scrollY

  revealObserver = new IntersectionObserver(
    (entries) => {
      const currentScrollY = window.scrollY
      const direction = currentScrollY >= lastScrollY ? 'down' : 'up'
      lastScrollY = currentScrollY

      entries.forEach((entry) => {
        const target = entry.target as HTMLElement

        target.classList.toggle('pop-from-down', direction === 'down')
        target.classList.toggle('pop-from-up', direction === 'up')
        target.classList.toggle('is-visible', entry.isIntersecting)
      })
    },
    {
      rootMargin: '-5% 0px -8% 0px',
      threshold: 0.12,
    },
  )

  elements.forEach((element, index) => {
    const stagger = staggerGroups.get(element)
    const delay = stagger
      ? Math.min(stagger.index * stagger.step, stagger.max)
      : Math.min(index * 45, 280)

    element.style.setProperty('--pop-delay', `${delay}ms`)
    revealObserver?.observe(element)
  })
}

onMounted(async () => {
  previousTitle = document.title
  setDocumentMeta()
  stopCmsSubscription = contentStore.subscribeToSlug(PAGE_SLUG, () => {
    void loadCmsContent()
  })
  await loadCmsContent()
  setDocumentMeta()
  await nextTick()
  initScrollReveal()
  updateProjectNavState()
  window.addEventListener('resize', updateProjectNavState)
})

onUnmounted(() => {
  stopCmsSubscription?.()
  stopCmsSubscription = null
  revealObserver?.disconnect()
  window.removeEventListener('resize', updateProjectNavState)
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
    <section
      id="portfolio"
      class="portfolio-section"
      aria-labelledby="portfolio-heading"
    >
      <div class="portfolio-feature">
        <div class="portfolio-copy pop-reveal">
          <p class="portfolio-pill">
            <span aria-hidden="true"></span>
            {{ localizeText('Recent and current portfolio') }}
          </p>
          <h2 id="portfolio-heading">{{ localizeText('Current portfolio.') }}</h2>
          <p>
            {{
              localizeText(
                'A quick view of active project themes, timeframes and funding partners moving through the field system now.',
              )
            }}
          </p>

          <div class="portfolio-actions">
            <RouterLink to="/contact" class="button button-primary"
              >{{ localizeText('Start a partnership') }}</RouterLink
            >
            <RouterLink to="#portfolio-projects" class="portfolio-link"
              >{{ localizeText('See active work') }}</RouterLink
            >
          </div>

          <div
            class="portfolio-stat-strip"
            aria-label="Partner page highlights"
          >
            <div
              v-for="stat in portfolioStats"
              :key="stat.label"
              class="portfolio-stat-item pop-reveal"
            >
              <strong>{{ stat.value }}</strong>
              <span>{{ stat.label }}</span>
            </div>
          </div>
        </div>

        <div class="portfolio-visual pop-reveal">
          <img
            :src="featuredPortfolioProject.image"
            :alt="featuredPortfolioProject.title"
            loading="lazy"
          />
          <div class="portfolio-status-card">
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 12h4l3-7 4 14 3-7h2" />
              </svg>
            </span>
            <div>
              <strong>{{ featuredPortfolioProject.period }}</strong>
              <small>{{ localizeText('Portfolio active') }}</small>
            </div>
          </div>
          <div class="portfolio-partner-card">
            <small>{{ featuredPortfolioProject.partner }}</small>
            <p>{{ featuredPortfolioProject.focus }}</p>
            <strong>{{ featuredPortfolioProject.title }}</strong>
          </div>
        </div>
      </div>

      <div id="portfolio-projects" class="project-showcase">
        <div class="project-showcase__inner">
          <div class="project-carousel">
            <button
              v-if="canScrollProjectsPrev"
              class="project-nav project-nav--prev"
              type="button"
              aria-label="Previous projects"
              @click="scrollProjectTrack(-1)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div
              ref="projectTrackRef"
              class="project-grid"
              aria-label="Active project carousel"
              tabindex="0"
              @scroll.passive="updateProjectNavState"
            >
              <article
                v-for="(project, index) in pageContent.activeProjects"
                :key="project.title"
                class="project-card pop-reveal"
                :style="{ '--project-float-delay': `${index * 180}ms` }"
              >
                <img :src="project.image" :alt="project.title" loading="lazy" />
                <div class="project-card__content">
                  <span class="project-card__period">{{ project.period }}</span>
                  <div class="project-card__icon">
                    <svg
                      v-if="projectIcon(project, index) === 'environment'"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path d="M24 39V24" />
                      <path d="M24 24c-9 0-14-5-14-14 9 0 14 5 14 14z" />
                      <path d="M24 29c10 0 15-6 15-15-10 0-15 6-15 15z" />
                      <path d="M14 39h20" />
                      <path d="M18 18l6 6" />
                      <path d="M31 19l-7 7" />
                    </svg>
                    <svg
                      v-else-if="projectIcon(project, index) === 'climate'"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <circle cx="24" cy="24" r="16" />
                      <path d="M8 24h32" />
                      <path d="M24 8c5 5 7 10 7 16s-2 11-7 16" />
                      <path d="M24 8c-5 5-7 10-7 16s2 11 7 16" />
                      <path d="M33 13l5-5" />
                      <path d="M38 8v7" />
                    </svg>
                    <svg
                      v-else-if="projectIcon(project, index) === 'wash'"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M24 6s11 12 11 22a11 11 0 0 1-22 0C13 18 24 6 24 6z"
                      />
                      <path d="M19 30a5 5 0 0 0 7 4" />
                      <path d="M7 40h34" />
                      <path d="M10 34c5-3 10-3 14 0s9 3 14 0" />
                    </svg>
                    <svg
                      v-else-if="projectIcon(project, index) === 'education'"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path d="M10 12h13a7 7 0 0 1 7 7v21H17a7 7 0 0 0-7-7z" />
                      <path d="M38 12H25a7 7 0 0 0-7 7v21h13a7 7 0 0 1 7-7z" />
                      <path d="M17 20h7" />
                      <path d="M17 27h7" />
                      <path d="M30 20h5" />
                    </svg>
                    <svg v-else viewBox="0 0 48 48" aria-hidden="true">
                      <path
                        d="M24 39s-14-8-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 12-14 20-14 20z"
                      />
                      <path d="M18 23h12" />
                      <path d="M24 17v12" />
                      <path d="M8 40h32" />
                    </svg>
                  </div>
                  <h3>{{ project.title }}</h3>
                  <strong>{{ project.partner }}</strong>
                  <p>{{ project.focus }}</p>
                </div>
              </article>
            </div>

            <button
              v-if="canScrollProjectsNext"
              class="project-nav project-nav--next"
              type="button"
              aria-label="Next projects"
              @click="scrollProjectTrack(1)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="operating-section" aria-labelledby="operating-heading">
      <div class="operating-inner">
        <div class="operating-copy pop-reveal">
          <p class="section-kicker">{{ localizeText('How partnership works') }}</p>
          <h2 id="operating-heading">
            {{ localizeText('Clear field rhythm.') }}
          </h2>
          <p>
            {{
              localizeText(
                'Support moves through planning, reporting, monitoring and learning.',
              )
            }}
          </p>
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

    <section
      class="strategy-section section-shell"
      aria-labelledby="strategy-heading"
    >
      <div class="section-intro pop-reveal">
        <p class="section-kicker">
          {{ localizeText('Strategic partnership space') }}
        </p>
        <h2 id="strategy-heading">
          {{ localizeText('Where partners can help next.') }}
        </h2>
        <p>
          {{
            localizeText(
              'Partners can strengthen the next cycle of village-led work through funding, learning, technical systems and practical field support.',
            )
          }}
        </p>
      </div>

      <div class="strategy-grid">
        <article
          v-for="(theme, index) in pageContent.strategicThemes"
          :key="theme.title"
          class="strategy-card pop-reveal"
        >
          <div
            class="strategy-icon"
            :class="`strategy-icon--${strategicIcon(theme, index)}`"
          >
            <svg
              v-if="strategicIcon(theme, index) === 'growth'"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path d="M7 38h34" />
              <path d="M12 38V25h7v13" />
              <path d="M23 38V18h7v20" />
              <path d="M34 38V10h7v28" />
              <path d="M9 18l8-8 6 6 13-13" />
              <path d="M31 3h5v5" />
            </svg>
            <svg
              v-else-if="strategicIcon(theme, index) === 'strategy'"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path d="M9 13h24l6 7v18H9z" />
              <path d="M33 13v8h6" />
              <path d="M16 28h16" />
              <path d="M16 34h11" />
              <path d="M14 8l4-4 4 4" />
              <path d="M18 4v13" />
            </svg>
            <svg
              v-else-if="strategicIcon(theme, index) === 'time'"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <circle cx="24" cy="25" r="15" />
              <path d="M24 15v11l7 5" />
              <path d="M17 5h14" />
              <path d="M24 5v5" />
              <path d="M36 12l4-4" />
            </svg>
            <svg
              v-else-if="strategicIcon(theme, index) === 'investment'"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path d="M24 40V22" />
              <path d="M24 22c-9 0-13-5-13-12 9 0 13 5 13 12z" />
              <path d="M24 27c9 0 13-5 13-12-9 0-13 5-13 12z" />
              <circle cx="34" cy="12" r="5" />
              <path d="M34 9v6" />
              <path d="M31 12h6" />
            </svg>
            <svg
              v-else-if="strategicIcon(theme, index) === 'chart'"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path d="M7 39h34" />
              <path d="M12 34V24h6v10" />
              <path d="M22 34V17h6v17" />
              <path d="M32 34V10h6v24" />
              <path d="M10 16l7-7 8 6 12-11" />
              <path d="M32 4h5v5" />
            </svg>
            <svg v-else viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="29" cy="18" r="10" />
              <path d="M19 18h20" />
              <path d="M29 8c3 3 4 6 4 10s-1 7-4 10" />
              <path d="M29 8c-3 3-4 6-4 10s1 7 4 10" />
              <path d="M8 25h11v14H8z" />
              <path d="M13 25v-5a4 4 0 0 1 8 0v5" />
              <path d="M27 34h13" />
            </svg>
          </div>
          <span class="strategy-number" aria-hidden="true">{{
            String(index + 1).padStart(2, '0')
          }}</span>
          <h3>{{ theme.title }}</h3>
          <p>{{ theme.detail }}</p>
          <strong>{{ theme.action }}</strong>
        </article>
      </div>
    </section>

    <section class="network-section" aria-labelledby="network-heading">
      <div class="network-inner">
        <div class="network-panel pop-reveal">
          <p class="section-kicker">{{ localizeText('Network layers') }}</p>
          <h2 id="network-heading">
            {{ localizeText('Connected beyond the office.') }}
          </h2>
          <p>
            {{
              localizeText(
                'Civil society, faith and youth networks help learning reach villages.',
              )
            }}
          </p>
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

    <section class="funding-section" aria-labelledby="funding-heading">
      <div class="funding-inner">
        <div class="funding-header section-intro pop-reveal">
          <p class="section-kicker">{{ localizeText('Funding history') }}</p>
          <h2 id="funding-heading">
            {{ localizeText('A wider support base.') }}
          </h2>
          <p>
            {{
              localizeText(
                'Past supporters across development, multilateral, child-focused and education programs.',
              )
            }}
          </p>
        </div>

        <div class="funding-list" aria-label="Past funding partners">
          <article
            v-for="(item, index) in pageContent.fundingHistory"
            :key="item.name"
            class="funding-item pop-reveal"
          >
            <span class="funding-icon" aria-hidden="true">
              <svg v-if="index === 0" viewBox="0 0 48 48">
                <path d="M8 30h8l7 7 17-20" />
                <path d="M12 18h16" />
                <path d="M12 12h24" />
              </svg>
              <svg v-else-if="index === 1" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="15" />
                <path d="M9 24h30" />
                <path d="M24 9c5 5 7 10 7 15s-2 10-7 15" />
                <path d="M24 9c-5 5-7 10-7 15s2 10 7 15" />
              </svg>
              <svg v-else-if="index === 2" viewBox="0 0 48 48">
                <path
                  d="M24 39s-13-8-13-20a8 8 0 0 1 13-6 8 8 0 0 1 13 6c0 12-13 20-13 20z"
                />
                <path d="M18 23h12" />
                <path d="M24 17v12" />
              </svg>
              <svg v-else viewBox="0 0 48 48">
                <path d="M10 13h13a7 7 0 0 1 7 7v20H17a7 7 0 0 0-7-7z" />
                <path d="M38 13H25a7 7 0 0 0-7 7v20h13a7 7 0 0 1 7-7z" />
                <path d="M16 22h8" />
                <path d="M30 22h4" />
              </svg>
            </span>
            <h3>{{ item.name }}</h3>
            <p>{{ item.detail }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="cta-section" aria-label="Partnership contact">
      <img
        :src="pageContent.cta.image"
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
      <div class="cta-content pop-reveal">
        <p class="eyebrow">{{ pageContent.cta.eyebrow }}</p>
        <h2>{{ pageContent.cta.title }}</h2>
        <p>{{ pageContent.cta.body }}</p>
        <div class="hero-actions">
          <RouterLink
            :to="pageContent.cta.primaryCta.to"
            class="button button-primary"
          >
            {{ pageContent.cta.primaryCta.label }}
          </RouterLink>
          <RouterLink
            :to="pageContent.cta.secondaryCta.to"
            class="button button-ghost"
          >
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
    linear-gradient(
      90deg,
      rgba(6, 18, 13, 0.86),
      rgba(6, 18, 13, 0.58) 46%,
      rgba(6, 18, 13, 0.16)
    ),
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
    transform 0.32s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.32s ease,
    background 0.32s ease,
    border-color 0.32s ease;
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
  backdrop-filter: none;
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
.operating-inner,
.network-inner,
.cta-content {
  width: min(100% - 3rem, var(--container-max-width));
  margin: 0 auto;
}

.strategy-section,
.funding-section {
  padding: 5rem 0;
}

.portfolio-section {
  position: relative;
  overflow: hidden;
  padding: clamp(4rem, 8vw, 6.5rem) 0 0;
  background:
    linear-gradient(90deg, rgba(23, 118, 104, 0.07) 1px, transparent 1px) 0 0 /
      33.333% 100%,
    linear-gradient(180deg, #f9fdfb 0%, #eef9f6 100%);
}

.portfolio-feature {
  width: min(100% - 3rem, var(--container-max-width));
  display: grid;
  grid-template-columns: minmax(0, 0.86fr) minmax(360px, 1.18fr);
  gap: clamp(2.5rem, 6vw, 5.5rem);
  align-items: center;
  margin: 0 auto;
}

.portfolio-copy {
  min-width: 0;
}

.portfolio-pill {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0 0 2.4rem;
  border: 1px solid color-mix(in srgb, var(--primary-color) 38%, transparent);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: var(--primary-dark);
  padding: 0.62rem 1.15rem;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  line-height: 1;
  text-transform: uppercase;
  box-shadow: 0 8px 18px
    color-mix(in srgb, var(--primary-color) 12%, transparent);
}

.portfolio-pill span {
  width: 0.78rem;
  height: 0.78rem;
  border-radius: 999px;
  background: var(--primary-color);
}

.portfolio-copy h2 {
  max-width: 500px;
  margin: 0;
  color: #173240;
  font-size: clamp(2.45rem, 4.6vw, 4rem);
  font-weight: 600;
  line-height: 1.04;
}

.portfolio-copy p:not(.portfolio-pill) {
  max-width: 560px;
  margin: 1.25rem 0 0;
  color: #385a70;
  font-size: clamp(0.98rem, 1.35vw, 1.12rem);
  font-weight: 500;
  line-height: 1.6;
}

.portfolio-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-top: 2.35rem;
}

.portfolio-actions .button-primary {
  background: var(--primary-color);
  color: var(--color-white);
  box-shadow: 0 16px 28px
    color-mix(in srgb, var(--primary-color) 24%, transparent);
}

.portfolio-actions .button-primary:hover {
  background: var(--primary-dark);
  box-shadow: 0 20px 34px
    color-mix(in srgb, var(--primary-dark) 28%, transparent);
}

.portfolio-link {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--primary-dark);
  font-weight: 800;
  text-decoration: none;
}

.portfolio-link::after {
  font-size: 1.35rem;
  line-height: 1;
  content: '->';
}

.portfolio-stat-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1.8rem;
}

.portfolio-stat-item {
  min-height: 70px;
  display: grid;
  align-content: center;
  justify-items: start;
  gap: 0.28rem;
  border: 1px solid color-mix(in srgb, var(--primary-color) 16%, transparent);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  padding: 0.82rem 0.95rem;
  text-align: left;
  box-shadow: 0 10px 22px rgba(23, 118, 104, 0.07);
  transition:
    background 0.48s ease,
    border-color 0.48s ease,
    box-shadow 0.48s ease;
}

.portfolio-stat-item:hover {
  border-color: color-mix(in srgb, var(--primary-color) 30%, transparent);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 16px 30px rgba(23, 118, 104, 0.11);
}

.portfolio-stat-item + .portfolio-stat-item {
  border-left: 1px solid
    color-mix(in srgb, var(--primary-color) 16%, transparent);
}

.portfolio-stat-item strong {
  color: var(--primary-color);
  font-size: clamp(1.08rem, 2vw, 1.36rem);
  font-weight: 900;
  line-height: 1.05;
  white-space: nowrap;
}

.portfolio-stat-item span {
  color: #587485;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  line-height: 1.25;
  text-transform: uppercase;
}

.portfolio-visual {
  position: relative;
  min-height: clamp(420px, 48vw, 560px);
  border: 1px solid color-mix(in srgb, var(--primary-color) 22%, transparent);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.68);
  padding: 0.75rem;
  box-shadow:
    0 26px 58px rgba(23, 50, 64, 0.16),
    0 10px 24px color-mix(in srgb, var(--primary-color) 12%, transparent);
}

.portfolio-visual > img {
  width: 100%;
  height: 100%;
  min-height: inherit;
  display: block;
  border: 1px solid rgba(255, 255, 255, 0.74);
  border-radius: 14px;
  object-fit: cover;
  box-shadow: 0 18px 42px rgba(23, 50, 64, 0.18);
}

.portfolio-status-card,
.portfolio-partner-card {
  position: absolute;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 36px rgba(23, 50, 64, 0.16);
}

.portfolio-status-card {
  top: 1.35rem;
  right: 1.35rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.8rem;
  align-items: center;
  padding: 0.75rem 0.9rem;
}

.portfolio-status-card > span {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--primary-color);
  color: #ffffff;
}

.portfolio-status-card svg {
  width: 1.35rem;
  height: 1.35rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.portfolio-status-card strong,
.portfolio-partner-card strong {
  display: block;
  color: #173240;
  font-size: 0.95rem;
  font-weight: 900;
  line-height: 1.2;
}

.portfolio-status-card small {
  display: block;
  margin-top: 0.18rem;
  color: var(--primary-color);
  font-size: 0.78rem;
  font-weight: 800;
}

.portfolio-partner-card {
  left: clamp(-2.4rem, -4vw, -1rem);
  bottom: -1.4rem;
  width: min(480px, 88%);
  padding: 1.35rem 1.5rem;
}

.portfolio-partner-card small {
  display: block;
  color: var(--primary-color);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.portfolio-partner-card p {
  margin: 0.6rem 0 0.9rem;
  color: #385a70;
  font-size: 0.98rem;
  font-weight: 650;
  line-height: 1.45;
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

.project-showcase {
  margin-top: clamp(4rem, 7vw, 6rem);
  background:
    radial-gradient(
      circle at 16% 12%,
      rgba(255, 255, 255, 0.16),
      transparent 26rem
    ),
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--primary-color) 46%, #6fb6c7),
      #6aaebd
    );
  padding: clamp(4rem, 7vw, 5.8rem) 0;
}

.project-showcase__inner {
  position: relative;
  width: min(100% - 3rem, var(--container-max-width));
  margin: 0 auto;
}

.project-showcase__intro {
  max-width: 860px;
  margin: 0 auto clamp(2.5rem, 5vw, 3.75rem);
  color: var(--color-white);
  text-align: center;
}

.project-showcase__intro h2 {
  margin: 0;
  color: var(--color-white);
  font-size: clamp(2.35rem, 5vw, 4.25rem);
  font-weight: 900;
  line-height: 1.05;
}

.project-showcase__intro p {
  max-width: 620px;
  margin: 1rem auto 0;
  color: rgba(255, 255, 255, 0.86);
  font-size: clamp(1rem, 1.6vw, 1.25rem);
  font-weight: 600;
  line-height: 1.65;
}

.project-carousel {
  position: relative;
}

.project-grid {
  --project-gap: clamp(1.2rem, 2.6vw, 2rem);

  display: grid;
  grid-auto-columns: calc((100% - var(--project-gap) - var(--project-gap)) / 3);
  grid-auto-flow: column;
  grid-template-columns: none;
  gap: var(--project-gap);
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.9rem 0.1rem 0.75rem;
  overscroll-behavior-x: contain;
  scroll-behavior: smooth;
  scroll-padding-inline: 0.1rem;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.project-grid::-webkit-scrollbar {
  display: none;
}

.project-card {
  position: relative;
  isolation: isolate;
  min-height: clamp(360px, 31vw, 430px);
  display: grid;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 22px;
  background: #1c3f45;
  scroll-snap-align: start;
}

.project-card.is-visible {
  animation: projectCardFloat 6.4s ease-in-out var(--project-float-delay, 0ms)
    infinite;
  will-change: translate;
}

.project-card:hover {
  animation-play-state: paused;
}

@keyframes projectCardFloat {
  0%,
  100% {
    translate: 0 0;
  }

  50% {
    translate: 0 -6px;
  }
}

.project-nav {
  position: absolute;
  top: 50%;
  z-index: 6;
  width: 3.4rem;
  height: 3.4rem;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.74);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #1c3f45;
  cursor: pointer;
  transform: translateY(-50%);
  transition:
    background 0.32s ease,
    color 0.32s ease,
    transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 16px 28px rgba(17, 68, 77, 0.22);
}

.project-nav:hover {
  background: var(--primary-color);
  color: var(--color-white);
  transform: translateY(-50%) scale(1.04);
}

.project-nav--prev {
  left: -1.7rem;
}

.project-nav--next {
  right: -1.7rem;
}

.project-nav svg {
  width: 1.45rem;
  height: 1.45rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.8;
}

.project-card::before {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(9, 35, 38, 0.04) 0%,
    rgba(9, 35, 38, 0.18) 42%,
    rgba(9, 35, 38, 0.88) 100%
  );
  content: '';
  transition: background 0.52s ease;
}

.project-card img {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.96) contrast(1.02) brightness(0.92);
  transform: scale(1.02);
  transition:
    filter 0.52s ease,
    transform 0.58s cubic-bezier(0.16, 1, 0.3, 1);
}

.project-card:hover::before {
  background: linear-gradient(
    180deg,
    rgba(9, 35, 38, 0) 0%,
    rgba(9, 35, 38, 0.12) 42%,
    rgba(9, 35, 38, 0.84) 100%
  );
}

.project-card:hover img {
  filter: saturate(1.06) contrast(1.04) brightness(0.98);
  transform: scale(1.05);
}

.project-card__content {
  position: relative;
  z-index: 2;
  min-height: inherit;
  display: grid;
  align-content: end;
  justify-items: start;
  padding: 5rem clamp(1.25rem, 2.4vw, 1.65rem) clamp(1.25rem, 2.4vw, 1.65rem);
  color: var(--color-white);
  text-align: left;
}

.project-card__period {
  position: absolute;
  top: 1rem;
  left: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  padding: 0.42rem 0.7rem;
  color: var(--primary-dark);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
  transition:
    background 0.42s ease,
    border-color 0.42s ease,
    box-shadow 0.42s ease,
    color 0.42s ease;
}

.project-card:hover .project-card__period {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: var(--color-white);
  box-shadow: 0 10px 22px
    color-mix(in srgb, var(--primary-color) 34%, transparent);
}

.project-card__icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 3.35rem;
  height: 3.35rem;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  background: rgba(9, 35, 38, 0.32);
  color: var(--color-white);
  transition:
    background 0.42s ease,
    border-color 0.42s ease,
    color 0.42s ease,
    box-shadow 0.42s ease;
}

.project-card:hover .project-card__icon {
  border-color: var(--primary-color);
  background: var(--color-white);
  color: var(--primary-color);
  box-shadow: 0 10px 22px
    color-mix(in srgb, var(--primary-color) 24%, transparent);
}

.project-card__icon svg {
  width: 2rem;
  height: 2rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.7;
}

.project-card h3 {
  max-width: 19rem;
  margin: 0;
  color: var(--color-white);
  font-size: clamp(1.22rem, 1.7vw, 1.55rem);
  font-weight: 900;
  line-height: 1.16;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  transition:
    color 0.42s ease,
    text-shadow 0.42s ease;
}

.project-card:hover h3 {
  color: var(--primary-light);
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.36);
}

.project-card strong {
  max-width: 22rem;
  display: block;
  margin-top: 0.75rem;
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1.35;
}

.project-card p {
  max-width: 22rem;
  margin: 0.65rem 0 0;
  color: rgba(255, 255, 255, 0.86);
  font-size: 0.88rem;
  font-weight: 500;
  line-height: 1.48;
}

.operating-section {
  position: relative;
  overflow: hidden;
  padding: clamp(5rem, 8vw, 6.5rem) 0;
  background:
    linear-gradient(
        90deg,
        color-mix(in srgb, var(--primary-color) 7%, transparent) 1px,
        transparent 1px
      )
      0 0 / 25% 100%,
    radial-gradient(
      circle at 12% 18%,
      color-mix(in srgb, var(--primary-color) 16%, transparent),
      transparent 24rem
    ),
    linear-gradient(180deg, #f7fcfa 0%, var(--primary-light) 100%);
}

.operating-inner {
  display: grid;
  grid-template-columns: minmax(260px, 0.34fr) minmax(0, 1fr);
  gap: clamp(2.2rem, 6vw, 5rem);
  align-items: start;
}

.operating-copy {
  position: sticky;
  top: 7rem;
  border-left: 5px solid var(--primary-color);
  padding-left: clamp(1.1rem, 2vw, 1.5rem);
}

.operating-copy h2 {
  max-width: 330px;
  color: var(--primary-dark);
  font-size: clamp(2.15rem, 4.4vw, 3.4rem);
  font-weight: 850;
  line-height: 1.05;
}

.operating-copy p:not(.section-kicker) {
  max-width: 360px;
  color: #415d52;
  font-weight: 600;
}

.operating-rail {
  position: relative;
  display: grid;
  gap: 1.1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.operating-rail::before {
  position: absolute;
  top: 1.25rem;
  bottom: 1.25rem;
  left: 2.15rem;
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    var(--primary-color),
    color-mix(in srgb, var(--primary-color) 36%, transparent)
  );
  content: '';
}

.operating-item {
  position: relative;
  --hover-pop-y: -6px;
  --hover-pop-scale: 1.008;

  display: grid;
  grid-template-columns: 4.6rem minmax(0, 1fr);
  gap: 1.15rem;
  align-items: start;
  min-height: 132px;
  overflow: hidden;
  border: 1px solid
    color-mix(in srgb, var(--primary-color) 18%, var(--color-border));
  border-radius: 8px;
  background:
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.98),
      rgba(255, 255, 255, 0.9)
    ),
    var(--color-white);
  padding: 1.2rem clamp(1.2rem, 2.4vw, 1.55rem);
  box-shadow: 0 18px 42px
    color-mix(in srgb, var(--primary-dark) 8%, transparent);
  transition:
    background 0.48s ease,
    border-color 0.48s ease,
    box-shadow 0.48s ease;
}

.operating-item::before {
  position: absolute;
  z-index: 0;
  inset: 0 auto 0 0;
  width: 5px;
  background: var(--primary-color);
  content: '';
  opacity: 0;
  transition: opacity 0.42s ease;
}

.operating-item::after {
  position: absolute;
  z-index: 0;
  inset: 0;
  background: linear-gradient(
    120deg,
    color-mix(in srgb, var(--primary-light) 34%, transparent),
    transparent 54%
  );
  content: '';
  opacity: 0;
  pointer-events: none;
  transform: translateX(-1rem);
  transition:
    opacity 0.5s ease,
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.operating-item:hover {
  border-color: color-mix(
    in srgb,
    var(--primary-color) 42%,
    var(--color-border)
  );
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(248, 253, 249, 0.96)),
    var(--color-white);
  box-shadow: 0 24px 54px
    color-mix(in srgb, var(--primary-dark) 12%, transparent);
}

.operating-item:hover::before,
.operating-item:hover::after {
  opacity: 1;
}

.operating-item:hover::after {
  transform: translateX(0);
}

.operating-item > div {
  position: relative;
  z-index: 1;
  min-width: 0;
  padding-top: 0.12rem;
}

.operating-step {
  position: relative;
  z-index: 1;
  display: inline-flex;
  width: 4rem;
  height: 4rem;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 5px solid color-mix(in srgb, var(--primary-light) 78%, #ffffff);
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-dark)
  );
  color: #fffaf0;
  box-shadow: 0 16px 30px
    color-mix(in srgb, var(--primary-color) 24%, transparent);
  font-size: 0.98rem;
  font-weight: 900;
  letter-spacing: 0;
  transition:
    box-shadow 0.46s ease,
    transform 0.46s cubic-bezier(0.16, 1, 0.3, 1);
}

.operating-item:hover .operating-step {
  box-shadow: 0 20px 36px
    color-mix(in srgb, var(--primary-color) 28%, transparent);
  transform: translateY(-2px) scale(1.025);
}

.operating-item strong {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  border: 1px solid color-mix(in srgb, var(--primary-color) 24%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--primary-light) 68%, #ffffff);
  color: var(--primary-dark);
  padding: 0.36rem 0.7rem;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
  transition:
    background 0.42s ease,
    border-color 0.42s ease,
    color 0.42s ease;
}

.operating-item:hover strong {
  border-color: color-mix(in srgb, var(--primary-color) 42%, transparent);
  background: color-mix(in srgb, var(--primary-color) 14%, #ffffff);
}

.operating-item h3 {
  margin: 0.68rem 0 0;
  color: var(--color-ink);
  font-size: clamp(1.08rem, 1.7vw, 1.28rem);
  font-weight: 850;
  line-height: 1.18;
  transition: color 0.42s ease;
}

.operating-item:hover h3 {
  color: var(--primary-dark);
}

.operating-item p {
  max-width: 620px;
  margin: 0.55rem 0 0;
  color: var(--color-ink-soft);
  font-size: 0.94rem;
  font-weight: 600;
  line-height: 1.6;
}

.strategy-section {
  width: 100%;
  max-width: none;
  background: var(--partner-surface);
}

.strategy-section .section-intro,
.strategy-grid {
  width: min(100% - 3rem, 1120px);
  margin-inline: auto;
}

.strategy-section .section-intro {
  max-width: none;
  text-align: left;
}

.strategy-section .section-kicker {
  color: #6fb7a2;
}

.strategy-section .section-intro h2 {
  margin-top: 0.35rem;
  color: #348f7a;
  font-size: clamp(2rem, 4vw, 3.1rem);
  font-weight: 500;
  line-height: 1.12;
}

.strategy-section .section-intro p:not(.section-kicker) {
  max-width: 620px;
  margin-top: 0.75rem;
  color: #7e8f89;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.6;
}

.strategy-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(3.2rem, 6vw, 5.2rem) clamp(3rem, 7vw, 6.5rem);
  margin-top: clamp(3.5rem, 7vw, 5.8rem);
}

.strategy-card {
  position: relative;
  --hover-pop-y: -6px;
  --hover-pop-scale: 1.008;

  min-height: 270px;
  padding: 0 0 0.5rem;
  background: transparent;
  color: #263d37;
}

.strategy-icon {
  width: 3.35rem;
  height: 3.35rem;
  display: grid;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 999px;
  color: #4fa994;
  transition:
    background 0.44s ease,
    border-color 0.44s ease,
    color 0.44s ease,
    box-shadow 0.44s ease,
    transform 0.44s cubic-bezier(0.16, 1, 0.3, 1);
}

.strategy-icon svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.4;
}

.strategy-number {
  position: absolute;
  top: 4.15rem;
  left: -0.2rem;
  z-index: 0;
  color: rgba(105, 211, 184, 0.22);
  font-size: clamp(4.8rem, 8vw, 6.4rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.8;
  pointer-events: none;
  transition: color 0.44s ease;
}

.strategy-card h3,
.strategy-card p,
.strategy-card strong {
  position: relative;
  z-index: 1;
}

.strategy-card h3 {
  margin: 1.75rem 0 0;
  color: #263d37;
  font-size: 1.18rem;
  font-weight: 800;
  line-height: 1.28;
  transition: color 0.44s ease;
}

.strategy-card:hover .strategy-icon {
  border-color: color-mix(in srgb, var(--primary-color) 28%, transparent);
  background: var(--primary-color);
  color: var(--color-white);
  box-shadow: 0 12px 24px
    color-mix(in srgb, var(--primary-color) 22%, transparent);
  transform: translateY(-2px) scale(1.025);
}

.strategy-card:hover .strategy-number {
  color: color-mix(in srgb, var(--primary-color) 28%, transparent);
}

.strategy-card:hover h3 {
  color: var(--primary-dark);
}

.strategy-card p {
  margin: 0.7rem 0 0;
  color: #6f7d78;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.7;
}

.strategy-card strong {
  display: block;
  margin-top: 0.45rem;
  color: #348f7a;
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1.55;
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
  --hover-pop-y: -7px;
  --hover-pop-scale: 1.01;

  min-height: 178px;
  border: 1px solid rgba(255, 250, 240, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  padding: 1.35rem;
  transition:
    background 0.48s ease,
    border-color 0.48s ease,
    box-shadow 0.48s ease;
}

.network-card:hover {
  border-color: color-mix(
    in srgb,
    var(--primary-light) 38%,
    rgba(255, 250, 240, 0.16)
  );
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 38px rgba(0, 0, 0, 0.16);
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
  transition:
    background 0.42s ease,
    border-color 0.42s ease,
    color 0.42s ease;
}

.network-card:hover span {
  border-color: color-mix(
    in srgb,
    var(--primary-light) 46%,
    rgba(255, 250, 240, 0.14)
  );
  background: rgba(255, 255, 255, 0.14);
  color: #fffaf0;
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
  background:
    radial-gradient(
      circle at 50% 0%,
      color-mix(in srgb, var(--primary-color) 10%, transparent) 0 20%,
      transparent 42%
    ),
    #fbfdfc;
}

.funding-inner {
  width: min(100% - 3rem, 1080px);
  margin: 0 auto;
}

.funding-header {
  max-width: 620px;
  margin: 0;
  text-align: left;
}

.funding-header .section-kicker {
  color: var(--primary-color);
}

.funding-header h2 {
  margin-top: 0.42rem;
  color: #25352f;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 850;
  line-height: 1.12;
}

.funding-header p:not(.section-kicker) {
  max-width: 520px;
  margin: 0.7rem 0 0;
  color: #697b73;
  font-size: 0.86rem;
  font-weight: 600;
  line-height: 1.65;
}

.funding-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(1rem, 2.4vw, 1.45rem);
  align-items: stretch;
  margin-top: clamp(2.7rem, 5vw, 4rem);
}

.funding-item {
  position: relative;
  --hover-pop-y: -6px;
  --hover-pop-scale: 1.008;

  height: 100%;
  min-height: 178px;
  display: block;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--primary-color) 12%, #dce8e0);
  border-radius: 8px;
  background: var(--color-white);
  color: var(--color-ink);
  padding: 1.25rem 1.15rem 1.25rem;
  text-align: left;
  box-shadow: 0 18px 34px
    color-mix(in srgb, var(--primary-dark) 8%, transparent);
  transition:
    background 0.46s ease,
    border-color 0.46s ease,
    box-shadow 0.46s ease;
}

.funding-item::after {
  position: absolute;
  inset: auto 1.15rem 0;
  height: 3px;
  border-radius: 999px 999px 0 0;
  background: var(--primary-color);
  content: '';
  opacity: 0;
  transform: translateY(3px);
  transition:
    opacity 0.46s ease,
    transform 0.46s cubic-bezier(0.16, 1, 0.3, 1);
}

.funding-item:hover {
  border-color: color-mix(in srgb, var(--primary-color) 32%, #dce8e0);
  background: color-mix(in srgb, var(--primary-light) 10%, #ffffff);
  box-shadow: 0 22px 46px
    color-mix(in srgb, var(--primary-dark) 14%, transparent);
}

.funding-item:hover::after {
  opacity: 1;
  transform: translateY(0);
}

.funding-icon {
  width: 3.2rem;
  height: 3.2rem;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--primary-color);
  color: var(--color-white);
  box-shadow: 0 12px 24px
    color-mix(in srgb, var(--primary-color) 28%, transparent);
}

.funding-icon svg {
  width: 1.65rem;
  height: 1.65rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.funding-item h3 {
  margin: 1.05rem 0 0;
  color: var(--primary-dark);
  font-size: 0.98rem;
  font-weight: 850;
  line-height: 1.25;
}

.funding-item p {
  margin: 0.58rem 0 0;
  color: #6a7a72;
  font-size: 0.78rem;
  font-weight: 600;
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
    linear-gradient(
      90deg,
      rgba(6, 18, 13, 0.9),
      rgba(6, 18, 13, 0.62) 55%,
      rgba(6, 18, 13, 0.3)
    ),
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
  --pop-offset: 44px;
  --pop-scale: 0.97;
  --reveal-duration: 0.96s;

  opacity: 0;
  filter: none;
  transform: translate3d(0, var(--pop-offset), 0) scale(var(--pop-scale));
  transition:
    opacity var(--reveal-duration) cubic-bezier(0.16, 1, 0.3, 1),
    transform var(--reveal-duration) cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: 0ms;
  will-change: opacity, transform;
}

.pop-reveal.pop-from-up {
  --pop-offset: -38px;
}

.pop-reveal.pop-from-down {
  --pop-offset: 44px;
}

.pop-reveal.is-visible {
  opacity: 1;
  filter: none;
  transform: translate3d(0, 0, 0) scale(1);
  transition-delay: var(--pop-delay, 0ms);
}

.pop-reveal.is-visible:hover {
  transition-delay: 0ms;
}

.portfolio-stat-item,
.project-card,
.operating-item,
.strategy-card,
.network-card,
.funding-item {
  --hover-pop-y: -7px;
  --hover-pop-scale: 1.01;
  --reveal-duration: 1s;

  transform-origin: center;
  will-change: transform;
}

.pop-reveal.is-visible:is(
    .portfolio-stat-item,
    .project-card,
    .operating-item,
    .strategy-card,
    .network-card,
    .funding-item
  ):hover {
  transform: translateY(var(--hover-pop-y)) scale(var(--hover-pop-scale));
}

.operating-copy.pop-reveal,
.operating-item.pop-reveal {
  --reveal-duration: 1.05s;

  transition:
    opacity var(--reveal-duration) cubic-bezier(0.16, 1, 0.3, 1),
    transform var(--reveal-duration) cubic-bezier(0.16, 1, 0.3, 1),
    background 0.48s ease,
    border-color 0.48s ease,
    box-shadow 0.48s ease;
}

.operating-copy.pop-reveal.is-visible,
.operating-item.pop-reveal.is-visible {
  transition-delay: var(--pop-delay, 0ms);
}

.operating-copy.pop-reveal.is-visible:hover,
.operating-item.pop-reveal.is-visible:hover {
  transition-delay: 0ms;
}

.operating-copy.pop-reveal:not(.is-visible),
.operating-item.pop-reveal:not(.is-visible) {
  transform: translateY(36px) scale(0.975);
}

@media (max-width: 1080px) {
  .hero-grid,
  .portfolio-feature,
  .operating-inner,
  .network-inner {
    grid-template-columns: 1fr;
  }

  .portfolio-visual {
    min-height: 430px;
  }

  .portfolio-partner-card {
    left: 1.25rem;
  }

  .hero-brief {
    align-self: start;
    max-width: 520px;
    margin-bottom: 2rem;
  }

  .project-grid {
    grid-auto-columns: calc((100% - var(--project-gap)) / 2);
  }

  .funding-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .strategy-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .operating-copy {
    position: static;
  }
}

@media (max-width: 760px) {
  .section-shell,
  .operating-inner,
  .network-inner,
  .cta-content {
    width: min(100% - 2rem, var(--container-max-width));
  }

  .portfolio-feature,
  .project-showcase__inner {
    width: min(100% - 2rem, var(--container-max-width));
  }

  .strategy-section .section-intro,
  .strategy-grid {
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

  .strategy-grid,
  .network-grid,
  .funding-list {
    grid-template-columns: 1fr;
  }

  .project-showcase {
    margin-top: 3.5rem;
    padding: 3.6rem 0;
  }

  .project-showcase__intro h2 {
    font-size: clamp(2.05rem, 10vw, 2.85rem);
  }

  .project-showcase__intro p {
    font-size: 0.98rem;
  }

  .project-grid {
    grid-auto-columns: 100%;
  }

  .project-nav {
    top: 50%;
    width: 3rem;
    height: 3rem;
    transform: translateY(-50%);
  }

  .project-nav:hover {
    transform: translateY(-50%) scale(1.04);
  }

  .project-nav--prev {
    left: 1rem;
  }

  .project-nav--next {
    right: 1rem;
  }

  .portfolio-copy h2 {
    font-size: clamp(2.45rem, 14vw, 3.45rem);
    line-height: 1.02;
  }

  .portfolio-copy p:not(.portfolio-pill) {
    font-size: 1rem;
  }

  .portfolio-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .portfolio-link {
    justify-content: center;
    min-height: 2.8rem;
  }

  .portfolio-stat-strip {
    grid-template-columns: 1fr;
  }

  .portfolio-stat-item + .portfolio-stat-item {
    border-top: 1px solid
      color-mix(in srgb, var(--primary-color) 16%, transparent);
    border-left: 1px solid
      color-mix(in srgb, var(--primary-color) 16%, transparent);
  }

  .portfolio-visual {
    min-height: 360px;
    padding-bottom: 6.5rem;
  }

  .portfolio-status-card {
    top: 0.9rem;
    right: 0.9rem;
  }

  .portfolio-partner-card {
    right: 1rem;
    bottom: 0;
    left: 1rem;
    width: auto;
  }

  .portfolio-section,
  .strategy-section,
  .funding-section,
  .operating-section,
  .network-section {
    padding: 4.5rem 0;
  }

  .portfolio-section {
    padding-bottom: 0;
  }

  .project-card {
    min-height: 360px;
    border-radius: 18px;
  }

  .project-card__content {
    padding: 4.5rem 1.2rem 1.25rem;
  }

  .project-card__icon {
    top: 0.9rem;
    right: 0.9rem;
    width: 3rem;
    height: 3rem;
  }

  .project-card__icon svg {
    width: 1.75rem;
    height: 1.75rem;
  }

  .project-card h3 {
    font-size: 1.28rem;
  }

  .project-card strong,
  .project-card p {
    font-size: 0.82rem;
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

  .strategy-section .section-intro h2 {
    font-size: clamp(1.9rem, 9vw, 2.55rem);
  }

  .strategy-card {
    min-height: 250px;
    padding-right: 0.75rem;
  }

  .cta-content {
    margin-left: auto;
    padding: 4rem 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-card img,
  .button,
  .pop-reveal,
  .operating-item,
  .operating-item::before,
  .operating-item::after,
  .operating-step,
  .operating-item strong,
  .operating-item h3 {
    transition: none;
  }

  .project-card.is-visible {
    animation: none;
  }

  .pop-reveal.is-visible:is(
      .portfolio-stat-item,
      .project-card,
      .operating-item,
      .strategy-card,
      .network-card,
      .funding-item
    ):hover {
    transform: none;
  }

  .pop-reveal {
    opacity: 1;
    filter: none;
    transform: none;
  }

  .operating-item:hover::after,
  .operating-item:hover .operating-step {
    transform: none;
  }
}
</style>
