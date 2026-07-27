<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, nextTick, computed, watch } from 'vue'
import cambodiaMap from '@/assets/maps/cambodia.png'

type StatItem = {
  value: string
  label: string
  desc: string
}

const props = defineProps<{
  content?: {
    headline?: string
    intro?: string
    sections?: Array<{
      id: string
      heading: string
      body: string
      items: string
    }>
  } | null
}>()

const eyebrow = computed(() => (props.content as any)?.hero?.eyebrow || 'Impact · By the Numbers')
const headline = computed(() => (props.content as any)?.hero?.title || props.content?.headline || 'Thirty years, measured village by village.')
const intro = computed(() => (props.content as any)?.hero?.description || props.content?.intro || 'Numbers do not tell the whole story, but they keep us honest. Every figure below is drawn from our annual monitoring and audited reports.')

const defaultOverviewItems: StatItem[] = [
  { value: '293', label: 'Villages', desc: 'Across 43 communes in three provinces.' },
  { value: '43', label: 'Communes', desc: 'Svay Rieng, Prey Veng and Kratie.' },
  { value: '3', label: 'Provinces', desc: 'Continuous field presence since 1994.' },
]

const overviewHeader = computed(() => {
  const hero = (props.content as any)?.hero
  if (hero?.title) {
    return {
      heading: hero.title,
      body: hero.description || ''
    }
  }
  const section = props.content?.sections?.find(s => s.id === 'numbers-overview')
  return {
    heading: section?.heading || 'Our Areas of Operation',
    body: section?.body || 'Since 1994, our programs have maintained a continuous field presence, working closely with rural communities across three provinces to create sustainable impact.'
  }
})

const overviewItems = computed<StatItem[]>(() => {
  const cmsStats = (props.content as any)?.stats
  if (Array.isArray(cmsStats) && cmsStats.length > 0) {
    return cmsStats
  }
  const section = props.content?.sections?.find(s => s.id === 'numbers-overview')
  if (!section || !section.items) return defaultOverviewItems
  
  return section.items.split('\n').filter(line => line.trim()).map(line => {
    const parts = line.split('|').map(s => s.trim())
    return {
      value: parts[0] || '',
      label: parts[1] || '',
      desc: parts[2] || ''
    }
  })
})

interface FlipCard {
  title: string
  icon: string
  preview: string
  details: Array<{ value: string; label: string; desc: string }>
  description: string
}

// ─── FLIP CARD DATA ──────────────────────────────────────────────
const defaultSections: FlipCard[] = [
  {
    title: 'Environment',
    icon: 'tree',
    preview: '570+ hectares protected',
    details: [
      { value: '570+', label: 'Hectares', desc: 'Community forest protected and restored.' },
      { value: '50k+', label: 'Saplings', desc: 'Grown yearly in village nurseries.' },
      { value: '300+', label: 'Biogas units', desc: 'Installed in rural kitchens.' },
    ],
    description: 'Community-led conservation that protects biodiversity and builds climate resilience.',
  },
  {
    title: 'Education',
    icon: 'book',
    preview: '120+ children enrolled yearly',
    details: [
      { value: '120+', label: 'Pre-school children', desc: 'Enrolled each year.' },
      { value: '8', label: 'Mobile libraries', desc: 'Reaching remote villages.' },
      { value: '60+', label: 'Annual scholarships', desc: 'For the poorest students.' },
    ],
    description: 'Early childhood education and lifelong learning opportunities for every child.',
  },
  {
    title: 'Livelihoods & Child Protection',
    icon: 'handshake',
    preview: '2,400+ SfC members',
    details: [
      { value: '2,400+', label: 'SfC members', desc: 'Saving and lending together.' },
      { value: '12', label: 'Cooperatives', desc: 'Rice, vegetables and enterprise.' },
      { value: '600+', label: 'Peer educators', desc: 'Trained in child rights.' },
    ],
    description: 'Economic empowerment and child safeguarding go hand in hand.',
  },
]

function parseFlipCard(sectionId: string, defaultCard: FlipCard): FlipCard {
  const section = props.content?.sections?.find(s => s.id === sectionId)
  if (!section || !section.items) return defaultCard
  
  const details = section.items.split('\n').filter(line => line.trim()).map(line => {
    const parts = line.split('|').map(s => s.trim())
    return {
      value: parts[0] || '',
      label: parts[1] || '',
      desc: parts[2] || ''
    }
  })
  
  return {
    title: section.heading || defaultCard.title,
    icon: defaultCard.icon, // Keep native icon mapping
    preview: details[0] ? `${details[0].value} ${details[0].label.toLowerCase()}` : defaultCard.preview,
    details: details,
    description: section.body || defaultCard.description
  }
}

const beyondHeader = computed(() => {
  const cmsBeyond = (props.content as any)?.beyondHeader
  if (cmsBeyond?.heading) return cmsBeyond
  return {
    heading: 'Beyond the Numbers',
    body: 'Our work spans environment, education, and livelihoods — each area with its own measurable outcomes and human stories.'
  }
})

const sections = computed(() => {
  const cmsCards = (props.content as any)?.flipCards
  if (Array.isArray(cmsCards) && cmsCards.length > 0) {
    return cmsCards.map((c: any, idx: number) => ({
      title: c.title || '',
      icon: c.icon || (idx === 0 ? 'tree' : idx === 1 ? 'book' : 'handshake'),
      preview: c.preview || '',
      description: c.description || '',
      details: Array.isArray(c.details) ? c.details : []
    }))
  }
  return [
    parseFlipCard('numbers-card-environment', defaultSections[0]!),
    parseFlipCard('numbers-card-education', defaultSections[1]!),
    parseFlipCard('numbers-card-livelihoods', defaultSections[2]!),
  ]
})

watch(
  sections,
  () => {
    nextTick(() => {
      setupObservers()
    })
  },
  { immediate: true, deep: true }
)

// ─── SCROLL‑TRIGGERED POP‑UP (Intersection Observer) ──────────────
let observers: IntersectionObserver[] = []

const setupObservers = () => {
    observers.forEach(obs => obs.disconnect())
    observers = []

    const selectors = [
        '.stat-card',
        '.flip-card-wrapper',
        '.bullet-list li',
        '.cta-content',
    ]

    const elements = document.querySelectorAll(selectors.join(','))
    elements.forEach((el) => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        el.classList.add('card-visible')
                    } else {
                        el.classList.remove('card-visible')
                    }
                })
            },
            { threshold: 0.15, rootMargin: '0px 0px -20px 0px' }
        )
        observer.observe(el)
        observers.push(observer)
    })
}

onMounted(() => {
  document.title = 'Impact by the Numbers — Santi Sena'

  const setMeta = (name: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.name = name
      document.head.appendChild(el)
    }
    el.content = content
  }

  const setOgMeta = (property: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('property', property)
      document.head.appendChild(el)
    }
    el.content = content
  }

  setMeta('description', "Villages, hectares, students, savings groups and biogas units — the measurable footprint of Santi Sena's 30 years in Cambodia.")
  setOgMeta('og:title', 'Impact by the Numbers — Santi Sena')
  setOgMeta('og:description', '293 villages, 570+ hectares of forest, and counting.')

  nextTick(() => {
    setupObservers()
  })
})

onBeforeUnmount(() => {
  observers.forEach(obs => obs.disconnect())
})
</script>

<template>
    <div class="numbers-page">
        <!-- ─── NEW CENTERED HEADER WITH LEAF MOTIF ─── -->
        <header class="hero-centered">
            <div class="container">
                <div class="hero-inner">
                    <span class="eyebrow">{{ eyebrow }}</span>
                    <h1>{{ headline }}</h1>
                    <p class="hero-description">{{ intro }}</p>
                    <div class="hero-divider">
                        <span class="line"></span>
                        <span class="dot"></span>
                        <span class="line"></span>
                    </div>
                </div>
            </div>
        </header>

        <!-- OPERATION SECTION — STATS + MAP -->
        <div class="operation-section">
            <div class="container">
                <div class="section-header">
                    <span class="subtitle">Cambodia</span>
                    <h2>{{ overviewHeader.heading }}</h2>
                    <p>{{ overviewHeader.body }}</p>
                </div>

                <div class="operation-content">
                    <!-- Left: Stats -->
                    <div class="stats-grid">
                        <div class="stat-card" v-for="item in overviewItems" :key="item.label">
                            <h3>{{ item.value }}</h3>
                            <h4>{{ item.label }}</h4>
                            <p>{{ item.desc }}</p>
                        </div>
                    </div>

                    <!-- Right: Map (hover effect: shift right + scale) -->
                    <div class="map-wrapper">
                        <div class="map-inner">
                            <div class="map-media">
                                <img :src="cambodiaMap" alt="Cambodia map" class="map-image" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- THEMED SECTIONS → FLIP CARDS (with real SVG icons) -->
        <section class="flip-section">
            <div class="container">
                <div class="section-header">
                    <span class="subtitle">Impact Areas</span>
                    <h2>{{ beyondHeader.heading }}</h2>
                    <p>{{ beyondHeader.body }}</p>
                </div>

                <div class="flip-grid">
                    <div
                        v-for="(item, index) in sections"
                        :key="'card-' + index + '-' + (item.title || '')"
                        class="flip-card-wrapper"
                        :style="{ transitionDelay: (index * 0.12) + 's' }"
                    >
                        <div class="flip-card">
                            <!-- Front (with real icon) -->
                            <div class="flip-card-front">
                                <div class="flip-icon">
                                    <!-- Environment: Tree -->
                                    <svg v-if="item.icon === 'tree'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M12 22V12M12 12a6 6 0 0 0-6 6M12 12a6 6 0 0 1 6 6M12 2v4" />
                                        <path d="M8 8a4 4 0 0 1 8 0" />
                                    </svg>
                                    <!-- Education: Book -->
                                    <svg v-else-if="item.icon === 'book'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                        <path d="M8 7h8" />
                                        <path d="M8 11h6" />
                                    </svg>
                                    <!-- Livelihoods: Handshake -->
                                    <svg v-else-if="item.icon === 'handshake'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M17 12L12 7L7 12" />
                                        <path d="M12 7V19" />
                                        <path d="M20 19H4" />
                                        <path d="M22 15C22 17.209 20.209 19 18 19H6C3.791 19 2 17.209 2 15V9" />
                                        <path d="M22 9H2" />
                                        <path d="M4 5L2 7" />
                                        <path d="M20 5L22 7" />
                                    </svg>
                                </div>
                                <h3 class="flip-title">{{ item.title }}</h3>
                                <p class="flip-preview">{{ item.preview }}</p>
                                <span class="flip-hint">Hover to explore →</span>
                            </div>
                            <!-- Back -->
                            <div class="flip-card-back">
                                <h3 class="flip-back-title">{{ item.title }}</h3>
                                <ul class="flip-details">
                                    <li v-for="(detail, dIdx) in item.details" :key="'detail-' + dIdx + '-' + (detail.label || '')">
                                        <strong>{{ detail.value }}</strong> {{ detail.label }}
                                        <span class="flip-detail-desc">{{ detail.desc }}</span>
                                    </li>
                                </ul>
                                <p class="flip-back-desc">{{ item.description }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA (pop‑up on scroll) -->
        <section class="cta-section">
            <div class="container">
                <div class="cta-content">
                    <div class="cta-text">
                        <span class="subtitle">Partnership</span>
                        <h3>Ready to take the next step?</h3>
                    </div>
                    <RouterLink to="/impact/partners" class="cta-link">
                        Meet our partners
                        <span class="arrow">→</span>
                    </RouterLink>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
/* ─── reset / base ─── */
.numbers-page {
  min-height: 100vh;
  background: var(--color-cream, #f9f6f0);
  color: var(--color-ink, #1e1a16);
}

.container {
  max-width: var(--container-max-width, 1200px);
  margin: 0 auto;
  padding: 0 clamp(1.25rem, 4vw, 3rem);
}

/* ════════════════════════════════════════════
   CENTERED HEADER – Light background, leaf icon
   ════════════════════════════════════════════ */
.hero-centered {
  padding: 4rem 0 3rem;
  background: #f0f7f4; /* light mint background */
  border-bottom: 1px solid rgba(45, 122, 90, 0.06);
}

.hero-inner {
  max-width: 780px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-icon {
  width: 72px;
  height: 72px;
  margin-bottom: 1.5rem;
  animation: floatLeaf 6s ease-in-out infinite;
}

@keyframes floatLeaf {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(4deg); }
}

.hero-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.hero-centered .eyebrow {
  display: inline-block;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.7rem;
  font-weight: 700;
  color: #2d7a5a;
  background: none;
  padding: 0.25rem 1rem;
  border-radius: 999px;
}

.hero-centered h1 {
  font-size: clamp(2rem, 4vw, 3.8rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: #1a3d2e;
  margin: 0 0 0.75rem;
}

.hero-description {
  font-size: 1.05rem;
  line-height: 1.75;
  color: #554d47;
  max-width: 600px;
  margin: 0 auto 1.5rem;
}

.hero-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.hero-divider .line {
  width: 40px;
  height: 2px;
  background: rgba(45, 122, 90, 0.2);
  border-radius: 2px;
}

.hero-divider .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2d7a5a;
  opacity: 0.5;
}

/* ─── section header (shared) ─── */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header .subtitle {
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.7rem;
  font-weight: 700;
  color: #2d7a5a;
  background: none;
  padding: 0.25rem 1.25rem;
  border-radius: 999px;
  margin-bottom: 1rem;
}

.section-header h2 {
    font-size: clamp(1.8rem, 2.5vw, 2.8rem);
    font-weight: 700;
    color: #0f7324;
    letter-spacing: -0.02em;
    margin: 0 0 0.75rem;
}

.section-header p {
  max-width: 700px;
  margin: 0 auto;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--color-ink-soft, #554d47);
}

/* ─── operation section ─── */
.operation-section {
  padding: 4rem 0 3rem;
  background: #ffffff;
}

.operation-content {
  display: flex;
  gap: 3rem;
  align-items: stretch;
  flex-direction: row;
}

/* stats grid */
.stats-grid {
    flex: 1;
    display: grid;
    gap: 1.25rem;
    grid-template-columns: 1fr 1fr 1fr;
    align-content: start;
    padding: 60px 0px 0px 70px;
}

.stat-card {
    background: #135333;
    border: 1px solid rgba(30, 80, 60, 0.08);
    border-radius: 1.25rem;
    padding: 1.75rem 1.5rem;
    text-align: center;
    transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 0.25s ease,
        border-color 0.2s ease;

    /* Pop-up initial state */
    opacity: 0;
    transform: translateY(30px) scale(0.95);
}

.stat-card.card-visible {
    opacity: 1;
    transform: translateY(0) scale(1);
    background: rgb(38, 114, 81);
}

.stat-card:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 32px rgba(47, 36, 29, 0.1);
    border-color: rgba(30, 80, 60, 0.2);
}

.stat-card h3 {
  font-size: 2.4rem;
  font-weight: 700;
  color: #f1f7f4;
  letter-spacing: -0.02em;
  line-height: 1;
  margin: 0;
}

.stat-card h4 {
  margin: 0.5rem 0 0.2rem;
  font-weight: 600;
  font-size: 1.05rem;
  color:  #70d5b2;
}

.stat-card p {
  margin: 0.3rem 0 0;
  font-size: 0.92rem;
  line-height: 1.6;
  color: #fbf9f8;
}

/* ─── map ─── */
.map-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    padding: 1.5rem;
    min-height: 280px;
}

.map-inner {
  position: relative;
  width: 100%;
  max-width: 420px;
}

.map-media {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 1rem;
}

.map-image {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 1rem;
    transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.map-wrapper:hover .map-image {
    transform: translateX(12px) scale(1.04);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
}

/* ─── FLIP CARDS ────────────────────────────────────────────────────── */
.flip-section {
    padding: 4rem 0 3rem;
    background: var(--color-cream, #f9f6f0);
}

.flip-grid {
    display: grid;
    gap: 2rem;
    grid-template-columns: repeat(3, 1fr);
}

.flip-card-wrapper {
    perspective: 1000px;
    height: 420px;

    /* Pop-up initial state */
    opacity: 0;
    transform: translateY(30px) scale(0.95);
    transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.flip-card-wrapper.card-visible {
    opacity: 1;
    transform: translateY(0) scale(1);
}

.flip-card {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
    transform-style: preserve-3d;
}

.flip-card-wrapper:hover .flip-card {
    transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 1.25rem;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1px solid var(--color-border, #e8e3dc);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.flip-card-front {
    background: #ffffff;
    z-index: 2;
}

.flip-card-back {
    background: linear-gradient(#077847, #1e7682);
    color: #fdf8ef;

    transform: rotateY(180deg);
}

.flip-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 0.75rem;
    color: var(--primary-color, #7a5a2d);
    display: flex;
    align-items: center;
    justify-content: center;
}

.flip-icon svg {
    width: 100%;
    height: 100%;
    stroke: currentColor;
}

.flip-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--primary-dark, #1a3d2e);
    margin: 0 0 0.5rem;
}

.flip-card-back .flip-back-title {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 0.75rem;
    margin-top: 30px;
    color: #fdf8ef;
}

.flip-preview {
    font-size: 1.1rem;
    color: var(--color-ink-soft, #554d47);
    margin: 0 0 0.5rem;
}

.flip-hint {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-ink-soft, #554d47);
    opacity: 0.5;
    margin-top: 0.5rem;
}

.flip-details {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
    text-align: left;
    width: 100%;
}

.flip-details li {
    font-size: 0.9rem;
    line-height: 1.4;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(253, 248, 239, 0.85);
    display: flex;
    flex-direction: column;
}

.flip-details li:last-child {
    border-bottom: none;
}

.flip-details strong {
    color: #fdf8ef;
    font-weight: 700;
    font-size: 1.1rem;
}

.flip-detail-desc {
    font-size: 0.8rem;
    color: rgba(253, 248, 239, 0.6);
    margin-left: 0.2rem;
}

.flip-back-desc {
    font-size: 0.85rem;
    color: rgba(253, 248, 239, 0.7);
    line-height: 1.6;
    margin: 0.5rem 0 0;
    margin-bottom: 20px;
}

/* ─── CTA ─── */
.cta-section {
  padding: 3rem 0 4rem;
  background: var(--color-cream, #f9f6f0);
}

.cta-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    background: #ffffff;
    padding: 2.5rem 3rem;
    border-radius: 1.5rem;
    border: 1px solid rgba(30, 80, 60, 0.06);
    box-shadow: 0 4px 16px rgba(47, 36, 29, 0.04);
    transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 0.25s ease;

    /* Pop-up initial state */
    opacity: 0;
    transform: translateY(30px) scale(0.95);
}

.cta-content.card-visible {
    opacity: 1;
    transform: translateY(0) scale(1);
}

.cta-content:hover {
    box-shadow: 0 12px 32px rgba(47, 36, 29, 0.08);
}

.cta-text .subtitle {
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.6rem;
  font-weight: 700;
  color: #2d7a5a;
  background: rgba(45, 122, 90, 0.08);
  padding: 0.15rem 1rem;
  border-radius: 999px;
  margin-bottom: 0.4rem;
}

.cta-text h3 {
  font-weight: 600;
  font-size: 1.3rem;
  color: var(--primary-dark, #1e4d3a);
  margin: 0;
}

.cta-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.8rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  background: rgb(18, 141, 73);
  color: #fff;
  box-shadow: 0 8px 20px rgba(30, 122, 85, 0.25);
  transition:
    transform 0.2s ease,
    box-shadow 0.25s ease;
}

.cta-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(30, 122, 85, 0.3);
}

.arrow {
  transition: transform 0.2s ease;
  display: inline-block;
}

.cta-link:hover .arrow {
  transform: translateX(3px);
}

/* ─── responsive ─── */
@media (max-width: 1024px) {
  .operation-content {
    flex-direction: column;
  }

    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
        padding: 20px 0 0 0;
    }

  .map-wrapper {
    min-height: 200px;
    padding: 1.5rem;
  }

    .map-image {
        max-width: 340px;
    }
}

@media (max-width: 820px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

    .flip-grid {
        grid-template-columns: 1fr 1fr;
    }

  .cta-content {
    flex-direction: column;
    align-items: flex-start;
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

    .flip-grid {
        grid-template-columns: 1fr;
    }

    .flip-card-wrapper {
        height: 350px;
    }

    .stat-card {
        padding: 1.25rem;
    }

  .stat-card h3 {
    font-size: 2rem;
  }

  .operation-section {
    padding: 2.5rem 0 2rem;
  }

    .flip-section {
        padding: 2.5rem 0 2rem;
    }

  .cta-section {
    padding: 2rem 0 3rem;
  }

  .cta-content {
    padding: 1.5rem 1.25rem;
  }

  .map-wrapper {
    min-height: 160px;
    padding: 1rem;
  }

  .map-image {
    max-width: 260px;
  }

    .flip-card-front,
    .flip-card-back {
        padding: 3.5rem 3.25rem;
    }

  .hero-centered {
    padding: 3rem 0 2rem;
  }

  .hero-icon {
    width: 56px;
    height: 56px;
  }

  .hero-centered h1 {
    font-size: 2.2rem;
  }

  .hero-description {
    font-size: 0.95rem;
  }
}

@media (max-width: 420px) {
  .hero-centered h1 {
    font-size: 1.8rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }

  .section-header p {
    font-size: 0.92rem;
  }

  .stat-card h3 {
    font-size: 1.7rem;
  }

  .cta-text h3 {
    font-size: 1.1rem;
  }

  .cta-link {
    padding: 0.6rem 1.4rem;
    font-size: 0.88rem;
  }

  .hero-icon {
    width: 48px;
    height: 48px;
  }
}

/* ─── PREFERS‑REDUCED‑MOTION ────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
    .stat-card,
    .flip-card-wrapper,
    .cta-content {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
    }

    .flip-card-wrapper:hover .flip-card {
        transform: none;
    }

    .flip-card-front,
    .flip-card-back {
        backface-visibility: visible;
    }

    .flip-card-back {
        transform: none;
        display: none;
    }

    .flip-card-wrapper:hover .flip-card-back {
        display: none;
    }

    .map-wrapper:hover .map-image {
        transform: none;
    }

    .hero-icon {
        animation: none;
    }
}
</style>
