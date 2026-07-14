<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import cambodiaMap from '@/assets/maps/cambodia.png'

import heroImage from '@/assets/hero-impact.jpg'
import heroImpactForest from '@/assets/hero-impact-forest.jpg'
import heroImpactVillage from '@/assets/hero-impact-village.jpg'
import Slideshow from '@/components/shared/Slideshow.vue'

// ─── SLIDESHOW ──────────────────────────────────────────────────────
const slideItems = [
    { image: heroImage, caption: '' },
    { image: heroImpactForest, caption: '' },
    { image: heroImpactVillage, caption: '' },
]

type StatItem = {
    value: string
    label: string
    desc: string
}

const overviewItems: StatItem[] = [
    { value: '293', label: 'Villages', desc: 'Across 43 communes in three provinces.' },
    { value: '43', label: 'Communes', desc: 'Svay Rieng, Prey Veng and Kratie.' },
    { value: '3', label: 'Provinces', desc: 'Continuous field presence since 1994.' },
]

// ─── FLIP CARD DATA (icons removed) ──────────────────────────────
const sections = [{
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

const countingMethods = [
    'Quarterly field monitoring against pre-agreed indicators for every project',
    'Annual audited financial statements available on request',
    'Village-level feedback sessions built into every program cycle',
    'External evaluations commissioned at the close of major grants',
]

const heroImages = [heroImage, heroImpactForest, heroImpactVillage]
const activeHeroIndex = ref(0)
let slideTimer: number | undefined

const isReducedMotion = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

const startSlideshow = () => {
    if (isReducedMotion()) return
    stopSlideshow()
    slideTimer = window.setInterval(() => {
        activeHeroIndex.value = (activeHeroIndex.value + 1) % heroImages.length
    }, 5000)
}

const stopSlideshow = () => {
    if (slideTimer) {
        window.clearInterval(slideTimer)
        slideTimer = undefined
    }
}

// ─── SCROLL‑TRIGGERED POP‑UP (Intersection Observer) ──────────────
let observers: IntersectionObserver[] = []

const setupObservers = () => {
    // Clean up old observers
    observers.forEach(obs => obs.disconnect())
    observers = []

    // Target all cards that should pop up
    const selectors = [
        '.stat-card',
        '.flip-card-wrapper',
        '.bullet-list li',
        '.cta-content',          // CTA section
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

    startSlideshow()

    // Set up observers after DOM render
    nextTick(() => {
        setupObservers()
    })
})

onBeforeUnmount(() => {
    stopSlideshow()
    observers.forEach(obs => obs.disconnect())
})
</script>

<template>
    <div class="numbers-page">
        <!-- HERO -->
        <Slideshow :slides="slideItems">
            <div class="hero-overlay" />
            <div class="hero-content">
                <span class="eyebrow">Impact · By the Numbers</span>
                <h1>Thirty years, measured village by village.</h1>
                <p>
                    Numbers do not tell the whole story, but they keep us honest. Every figure below is drawn from our
                    annual
                    monitoring and audited reports.
                </p>
            </div>
        </Slideshow>

        <!-- OPERATION SECTION — STATS + MAP -->
        <section class="operation-section">
            <div class="container">
                <div class="section-header">
                    <span class="subtitle">Cambodia</span>
                    <h2>Our Areas of Operation</h2>
                    <p>
                        Since 1994, our programs have maintained a continuous field presence,
                        working closely with rural communities across three provinces to create
                        sustainable impact.
                    </p>
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
        </section>

        <!-- THEMED SECTIONS → FLIP CARDS (with real SVG icons) -->
        <section class="flip-section">
            <div class="container">
                <div class="section-header">
                    <span class="subtitle">Impact Areas</span>
                    <h2>Beyond the Numbers</h2>
                    <p>
                        Our work spans environment, education, and livelihoods — each area
                        with its own measurable outcomes and human stories.
                    </p>
                </div>

                <div class="flip-grid">
                    <div
                        v-for="(item, index) in sections"
                        :key="item.title"
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
                                    <li v-for="detail in item.details" :key="detail.label">
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

        <!-- METHODOLOGY -->
        <section class="methodology-section">
            <div class="container">
                <div class="section-header">
                    <span class="subtitle">Transparency</span>
                    <h2>How We Count</h2>
                    <p>
                        Every number we publish is backed by a rigorous monitoring framework
                        and independent verification.
                    </p>
                </div>

                <ul class="bullet-list">
                    <li v-for="entry in countingMethods" :key="entry">
                        <span class="bullet-marker">✦</span>
                        {{ entry }}
                    </li>
                </ul>
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

/* ─── hero ─── */
.hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg,
            rgba(6, 18, 13, 0.88) 0%,
            rgba(6, 18, 13, 0.55) 42%,
            rgba(6, 18, 13, 0.20) 70%,
            transparent 100%);
}

.hero-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    text-align: left;
    max-width: 720px;
    margin: 0;
    left: var(--container-offset);
    padding: 3rem 1.5rem;
    animation: fadeInUp 0.8s ease-out;
    color: #fffdf8;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(32px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.eyebrow {
    display: inline-block;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.35em;
    font-size: 0.7rem;
    font-weight: 700;
    color: #aad6c7;
    background: rgba(255, 255, 255, 0.06);
    padding: 0.25rem 1rem;
    border-radius: 999px;
    backdrop-filter: blur(2px);
}

.hero-content h1 {
    font-size: clamp(1.2rem, 3vw, 3.8rem);
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.02em;
    max-width: 720px;
    color: #fffdf8;
    margin: 0;
}

.hero-content p {
    max-width: 600px;
    margin-top: 1.25rem;
    font-size: 1.05rem;
    line-height: 1.75;
    color: rgba(255, 253, 248, 0.82);
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
    background: rgba(45, 122, 90, 0.08);
    padding: 0.25rem 1.25rem;
    border-radius: 999px;
    margin-bottom: 1rem;
}

.section-header h2 {
    font-size: clamp(1.8rem, 2.5vw, 2.8rem);
    font-weight: 700;
    color: #1a3d2e;
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
    background: #f3f7f5;
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
}

.stat-card:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 32px rgba(47, 36, 29, 0.1);
    border-color: rgba(30, 80, 60, 0.2);
}

.stat-card h3 {
    font-size: 2.4rem;
    font-weight: 700;
    color: #1a4d38;
    letter-spacing: -0.02em;
    line-height: 1;
    margin: 0;
}

.stat-card h4 {
    margin: 0.5rem 0 0.2rem;
    font-weight: 600;
    font-size: 1.05rem;
    color: var(--color-ink, #1e1a16);
}

.stat-card p {
    margin: 0.3rem 0 0;
    font-size: 0.92rem;
    line-height: 1.6;
    color: var(--color-ink-soft, #554d47);
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

/* ─── methodology section ─── */
.methodology-section {
    padding: 4rem 0 3rem;
    background: #ffffff;
}

.bullet-list {
    margin: 0 auto;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 1rem;
    max-width: 800px;
}

.bullet-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    font-size: 1rem;
    line-height: 1.6;
    color: var(--color-ink-soft, #554d47);
    background: #f3f7f5;
    padding: 0.9rem 1.25rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(30, 80, 60, 0.05);
    transition: opacity 0.4s ease,
        transform 0.4s ease,
        background 0.2s ease,
        border-color 0.2s ease;

    /* Pop-up initial state */
    opacity: 0;
    transform: translateX(-15px);
}

.bullet-list li.card-visible {
    opacity: 1;
    transform: translateX(0);
}

.bullet-list li:hover {
    background: #e9f0ed;
    border-color: rgba(30, 80, 60, 0.1);
    transform: translateX(4px);
}

.bullet-marker {
    display: inline-block;
    color: #2d7a5a;
    font-size: 0.85rem;
    flex-shrink: 0;
    margin-top: 0.15rem;
}

/* ─── cta section ─── */
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
    background: rgb(255, 115, 0);
    color: #fff;
    box-shadow: 0 8px 20px rgba(30, 122, 85, 0.25);
    transition: transform 0.2s ease, box-shadow 0.25s ease;
}

.cta-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(30, 122, 85, 0.30);
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

    .hero-content {
        padding-top: 5rem;
        padding-bottom: 5rem;
    }

    .hero-content h1 {
        font-size: clamp(1.8rem, 7vw, 2.8rem);
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

    .methodology-section {
        padding: 2.5rem 0 2rem;
    }

    .cta-section {
        padding: 2rem 0 3rem;
    }

    .cta-content {
        padding: 1.5rem 1.25rem;
    }

    .bullet-list li {
        padding: 0.75rem 1rem;
        font-size: 0.92rem;
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
}

@media (max-width: 420px) {
    .hero-content h1 {
        font-size: 1.6rem;
    }

    .hero-content p {
        font-size: 0.92rem;
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
}

/* ─── PREFERS‑REDUCED‑MOTION ────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
    .stat-card,
    .flip-card-wrapper,
    .bullet-list li,
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

    .bullet-list li:hover {
        transform: none;
    }
}
</style>
