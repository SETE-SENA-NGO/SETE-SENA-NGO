<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import cambodiaMap from '@/assets/maps/cambodia.png'

import heroImage from '@/assets/hero-impact.jpg'
import heroImpactForest from '@/assets/hero-impact-forest.jpg'
import heroImpactVillage from '@/assets/hero-impact-village.jpg'
import Slideshow from '@/components/shared/Slideshow.vue'
// import cambodiaMap from '@/assets/maps/cambodia.svg'




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

const sections = [{
    title: 'Environment',
    icon: '🌿',
    items: [
        { value: '570+', label: 'Hectares', desc: 'Community forest protected and restored.' },
        { value: '50k+', label: 'Saplings', desc: 'Grown yearly in village nurseries.' },
        { value: '300+', label: 'Biogas units', desc: 'Installed in rural kitchens.' },
    ],
},
{
    title: 'Education',
    icon: '📚',
    items: [
        { value: '120+', label: 'Pre-school children', desc: 'Enrolled each year.' },
        { value: '8', label: 'Mobile libraries', desc: 'Reaching remote villages.' },
        { value: '60+', label: 'Annual scholarships', desc: 'For the poorest students.' },
    ],
},
{
    title: 'Livelihoods & Child Protection',
    icon: '🤝',
    items: [
        { value: '2,400+', label: 'SfC members', desc: 'Saving and lending together.' },
        { value: '12', label: 'Cooperatives', desc: 'Rice, vegetables and enterprise.' },
        { value: '600+', label: 'Peer educators', desc: 'Trained in child rights.' },
    ],
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

onBeforeUnmount(() => {
    stopSlideshow()
})

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

<!-- Right: Map -->
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

        <!-- THEMED SECTIONS (Environment, Education, Livelihoods) -->
        <section class="themed-section">
            <div class="container">
                <div class="section-header">
                    <span class="subtitle">Impact Areas</span>
                    <h2>Beyond the Numbers</h2>
                    <p>
                        Our work spans environment, education, and livelihoods — each area
                        with its own measurable outcomes and human stories.
                    </p>
                </div>

                <div class="themed-grid">
                    <div v-for="section in sections" :key="section.title" class="themed-block">
                        <div class="themed-head">
                            <span class="themed-icon" aria-hidden="true">{{ section.icon }}</span>
                            <h3>{{ section.title }}</h3>
                        </div>
                        <div class="themed-stats">
                            <div v-for="item in section.items" :key="`${section.title}-${item.label}`" class="themed-stat">
                                <span class="themed-value">{{ item.value }}</span>
                                <span class="themed-label">{{ item.label }}</span>
                                <p class="themed-desc">{{ item.desc }}</p>
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

        <!-- CTA -->
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
    max-width: 720px;
    padding: 3rem clamp(1.5rem, 5vw, 4rem);
    animation: fadeInUp 0.7s ease-out;
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
    color: var(--primary-dark, #1e4d3a);
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
    padding: 60px 0px  0px  70px;


}

.stat-card {
    background: #f3f7f5;
    border: 1px solid rgba(30, 80, 60, 0.08);
    border-radius: 1.25rem;
    padding: 1.75rem 1.5rem;
    text-align: center;
    transition: transform 0.2s ease, box-shadow 0.25s ease, border-color 0.2s ease;

}

.stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(47, 36, 29, 0.07);
    border-color: rgba(30, 80, 60, 0.18);
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

/* ─── map + overlay labels + stats card ─── */
.map-wrapper {
    flex: 1;
    display: flex;
    align-items: center; /* keep map vertically centered */
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
}

.map-image {
    width: 100%;
    height: auto;
    display: block;
}


.labels {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.label {
    position: absolute;
    background: #2196f3;
    color: white;
    padding: 8px 16px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    white-space: nowrap;
}

.svay {
    left: 310px;
    bottom: 55px;
}

.prey {
    left: 390px;
    bottom: 180px;
}

.kratie {
    /* Northeast (adjust to match reference design) */
    right: 70px;
    top: 78px;
}


.stats-card {
    position: absolute;
    /* upper-right, overlapping the map */
    right: -60px;
    top: 28px;
    width: 240px;
    background: #1e88e5;
    color: white;
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    z-index: 2;
}

/* keep card compact on smaller widths */
.stats-card .stat h2 {
    font-size: 40px;
    margin: 0;
    line-height: 1;
}

.stats-card .stat span {
    font-size: 18px;
    font-weight: 600;
}


.stat {

    padding: 18px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.stat:last-child {
    border: none;
}

.stat h2 {
    font-size: 44px;
    margin: 0;
}

.stat span {
    font-size: 20px;
}

/* ─── themed section ─── */
.themed-section {
    padding: 4rem 0 3rem;
    background: var(--color-cream, #f9f6f0);
}

.themed-grid {
    display: grid;
    gap: 2rem;
    grid-template-columns: repeat(3, 1fr);
}

.themed-block {
    background: #ffffff;
    border: 1px solid rgba(47, 36, 29, 0.06);
    border-radius: 1.25rem;
    padding: 2rem 1.5rem;
    box-shadow: 0 4px 16px rgba(47, 36, 29, 0.04);
    transition: transform 0.2s ease, box-shadow 0.25s ease;
}

.themed-block:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(47, 36, 29, 0.07);
}

.themed-head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1.25rem;
    border-bottom: 2px solid rgba(30, 80, 60, 0.08);
    padding-bottom: 0.75rem;
}

.themed-icon {
    font-size: 1.6rem;
    line-height: 1;
}

.themed-head h3 {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--primary-dark, #1e4d3a);
    margin: 0;
}

.themed-stats {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.themed-stat {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
}

.themed-value {
    font-size: 1.6rem;
    font-weight: 700;
    color: #1a4d38;
    letter-spacing: -0.01em;
}

.themed-label {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--color-ink, #1e1a16);
}

.themed-desc {
    margin: 0.1rem 0 0;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--color-ink-soft, #554d47);
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
    }

    .map-wrapper {
        min-height: 200px;
        padding: 1.5rem;
    }

    .map-image {
        max-width: 340px;
    }

    /* stack card below map for tablet */
    .stats-card {
        position: relative;
        top: auto;
        right: auto;
        margin: 1.25rem auto 0;
        width: 100%;
        max-width: 360px;
        border-radius: 18px;
    }
}


@media (max-width: 820px) {
    .stats-grid {
        grid-template-columns: 1fr 1fr;
    }

    .themed-grid {
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

    .themed-grid {
        grid-template-columns: 1fr;
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

    .themed-section {
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

    .themed-block {
        padding: 1.5rem 1.25rem;
    }

    .themed-value {
        font-size: 1.4rem;
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
</style>
