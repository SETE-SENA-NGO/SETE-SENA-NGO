<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Slideshow from '@/components/shared/Slideshow.vue'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { defaultHomeSlides, fetchHomeSlides, type HomeSlide } from '@/lib/slidesSettings'
import { subscribeToTableChanges } from '@/lib/realtime'
import environmentImg from '@/assets/home-image/environtment.jpg'
import educationImg from '@/assets/home-image/education.jpg'
import livelihoodImg from '@/assets/home-image/livelihood.jpg'
import childImg from '@/assets/home-image/child.jpg'

const stats = [
  { value: '293', label: 'Villages Reached' },
  { value: '43', label: 'Communes Served' },
  { value: '30+', label: 'Years of Service' },
  { value: '10+', label: 'International Partners' },
]

interface NgoSlide {
  image: string
  caption: string
  alt: string
  eyebrow: string
  title: string
  description: string
  position?: string
}

function toNgoSlide(slide: HomeSlide): NgoSlide {
  return {
    image: slide.imageUrl,
    caption: '',
    alt: slide.alt,
    eyebrow: slide.eyebrow,
    title: slide.title,
    description: slide.description,
    position: 'center',
  }
}

// Managed from the admin Slideshow screen — starts from the built-in
// defaults and swaps in the saved slides once they load.
const slideItems = ref<NgoSlide[]>(defaultHomeSlides().map(toNgoSlide))
let stopSlidesSubscription: (() => void) | null = null

async function loadSlides() {
  try {
    const saved = await fetchHomeSlides()
    if (saved.length) slideItems.value = saved.map(toNgoSlide)
  } catch {
    // Keep the default slides if the saved slideshow can't be loaded.
  }
}

onMounted(async () => {
  stopSlidesSubscription = subscribeToTableChanges('home_slides', () => {
    void loadSlides()
  })
  await loadSlides()
})

onUnmounted(() => {
  stopSlidesSubscription?.()
  stopSlidesSubscription = null
})

useScrollReveal()
</script>

<template>
  <div class="home-view">
    <Slideshow :slides="slideItems" :interval-ms="4000" v-slot="{ activeSlide }">
      <div class="hero-overlay" />
      <div class="hero-inner">
        <div :key="activeSlide?.image" class="hero-message">
          <p class="eyebrow eyebrow--light">
            {{ activeSlide?.eyebrow || 'Buddhist NGO - Cambodia - Since 1994' }}
          </p>
          <h1 class="hero-title">
            {{
              activeSlide?.title ||
              'Walking with villages toward peace, sustainability and dignity.'
            }}
          </h1>
          <p class="hero-subtitle">
            {{
              activeSlide?.description ||
              'Santi Sena works alongside rural Cambodian communities in education, livelihoods, environment and child protection.'
            }}
          </p>
          <div class="hero-actions">
            <RouterLink to="/qr-donate" class="btn btn--primary">Support Us</RouterLink>
            <RouterLink to="/about" class="btn btn--outline">Stand with us</RouterLink>
          </div>
        </div>
      </div>
    </Slideshow>

    <!-- Stats + News button -->
    <section class="stats">
      <div class="stats-inner">
        <div
          v-for="(stat, index) in stats"
          :key="stat.label"
          class="stat reveal"
          :style="{ animationDelay: `${index * 0.12}s` }"
        >
          <div class="stat-number">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
      <!-- 👇 NEW: button row under stats -->
      <div class="stats-news-row">
        <RouterLink to="/news" class="btn btn--news"> See all news </RouterLink>
      </div>
    </section>

    <section class="mission">
      <div class="eyebrow-rule reveal">
        <span class="rule" />
        <span class="eyebrow">Our Mission</span>
        <span class="rule" />
      </div>
      <h2 class="mission-title reveal" style="animation-delay: 0.12s">
        Peace is planted, not declared.
      </h2>
      <p class="mission-text reveal" style="animation-delay: 0.24s">
        Santi Sena — the <em>Peace Army</em> — was founded by Cambodian Buddhist monks in 1994 to
        alleviate poverty and rebuild moral, environmental and economic life after decades of
        conflict. Today our 30+ staff serve 293 villages with programs that combine the wisdom of
        the Dharma with rigorous community-led development.
      </p>
    </section>

    <section class="pillars">
      <div class="pillars-header reveal">
        <div>
          <p class="eyebrow">Four Pillars</p>
          <h2 class="pillars-title">Strategic goals</h2>
        </div>
        <RouterLink to="/programs" class="pillars-link">Explore all programs</RouterLink>
      </div>

      <div class="pillars-grid">
        <article class="pillar-card reveal">
          <div class="pillar-image pillar-image--forest">
            <img
              :src="environmentImg"
              alt="Community forestry in a Cambodian village"
              class="pillar-photo"
            />
          </div>
          <div class="pillar-body">
            <p class="pillar-goal">Goal 01</p>
            <h3 class="pillar-title">Natural Resource &amp; Environment</h3>
            <p class="pillar-desc">
              Community forestry, tree nurseries, WASH and sanitation, climate adaptation and biogas
              — protecting the land that sustains every village.
            </p>
          </div>
        </article>

        <article class="pillar-card reveal" style="animation-delay: 0.12s">
          <div class="pillar-image pillar-image--education">
            <img
              :src="educationImg"
              alt="Children learning at a community pre-school"
              class="pillar-photo"
            />
          </div>
          <div class="pillar-body">
            <p class="pillar-goal">Goal 02</p>
            <h3 class="pillar-title">Access to Education</h3>
            <p class="pillar-desc">
              Community pre-schools, mobile libraries, scholarships for poor children and the
              preservation of Buddhist education.
            </p>
          </div>
        </article>

        <article class="pillar-card reveal" style="animation-delay: 0.12s">
          <div class="pillar-image pillar-image--livelihood">
            <img
              :src="livelihoodImg"
              alt="Villagers working on rural livelihood activities"
              class="pillar-photo"
            />
          </div>
          <div class="pillar-body">
            <p class="pillar-goal">Goal 03</p>
            <h3 class="pillar-title">Livelihood &amp; Economic Improvement</h3>
            <p class="pillar-desc">
              Integrated farming, Saving-for-Change groups, agricultural cooperatives and rural
              enterprises such as melaleuca oil.
            </p>
          </div>
        </article>

        <article class="pillar-card reveal" style="animation-delay: 0.24s">
          <div class="pillar-image pillar-image--protection">
            <img
              :src="childImg"
              alt="Children protected and cared for in their community"
              class="pillar-photo"
            />
          </div>
          <div class="pillar-body">
            <p class="pillar-goal">Goal 04</p>
            <h3 class="pillar-title">Child Protection</h3>
            <p class="pillar-desc">
              Anti-trafficking campaigns, Child Protection Networks, peer educator groups and child
              rights advocacy.
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="quote reveal">
      <p class="quote-text">
        &ldquo;When we plant a tree, we plant peace. When we teach a child, we end a war that has
        not yet begun.&rdquo;
      </p>
      <p class="quote-attrib">— Founding Spirit of Santi Sena</p>
    </section>

    <section class="cta reveal">
      <div class="cta-card">
        <div class="cta-text">
          <h2 class="cta-title">Join the Peace Army.</h2>
          <p class="cta-desc">
            Donate, partner, volunteer — every act seeds another village with hope.
          </p>
        </div>
        <div class="cta-actions">
          <RouterLink to="/qr-donate" class="btn btn--primary">Support Us</RouterLink>
          <RouterLink to="/about" class="btn btn--outline">Partner with us</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  font-family: inherit;
  color: var(--color-ink);
  background: var(--color-cream);
}

/* Scroll reveal: elements start hidden; useScrollReveal() adds
   .reveal--visible when they enter the viewport. An animation (not a
   transition) is used so it never fights hover transforms, and the
   `backwards` fill keeps staggered items hidden during their delay. */
.reveal {
  opacity: 0;
}

.reveal--visible {
  opacity: 1;
  animation: revealUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

@keyframes revealUp {
  from {
    opacity: 0;
    transform: translateY(36px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal--visible {
    animation: none;
  }
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

.eyebrow-rule {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.eyebrow-rule .rule {
  width: 2.5rem;
  height: 1px;
  background: var(--primary-color);
}

/* Hero (overlaid on the slideshow via its default slot) */
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
    radial-gradient(circle at 82% 25%, rgba(77, 111, 86, 0.4) 0%, transparent 55%);
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

/* Stats */
.stats {
  background: var(--color-cream);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 2rem;
}

.stats-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3.5rem 1.5rem 1.5rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5rem 1rem;
  text-align: center;
}

.stat-number {
  font-size: clamp(2.4rem, 5vw, 3.4rem);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--primary-dark);
}

.stat-label {
  margin-top: 0.6rem;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}

@media (min-width: 720px) {
  .stats-inner {
    grid-template-columns: repeat(4, 1fr);
  }
  .stat + .stat {
    border-left: 1px solid var(--color-border);
  }
}

/* 👇 NEW: news button row */
.stats-news-row {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 0.5rem;
  display: flex;
  justify-content: center;
}

.btn--news {
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.65rem 2rem;
  font-weight: 600;
  transition:
    background 0.25s,
    color 0.25s,
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.btn--news:hover {
  background: var(--primary-color);
  color: #fff;
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(22, 48, 42, 0.18);
}

/* Mission */
.mission {
  max-width: 780px;
  margin: 0 auto;
  padding: 5rem 1.5rem;
  text-align: center;
}

.mission-title {
  margin: 0 0 1.5rem;
  color: var(--primary-dark);
}

.mission-text {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--color-ink-soft);
}

.mission-text em {
  font-style: italic;
  color: var(--primary-dark);
}

/* Pillars */
.pillars {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem 5rem;
}

.pillars-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.pillars-title {
  margin: 0.5rem 0 0;
  color: var(--primary-dark);
}

.pillars-link {
  color: var(--primary-dark);
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.pillars-link:hover {
  border-color: currentColor;
}

.pillars-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 820px) {
  .pillars-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.pillar-card {
  background: var(--color-cream-soft);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid var(--color-border);
  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease,
    border-color 0.35s ease;
}

.pillar-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(22, 48, 42, 0.14);
  border-color: var(--primary-color);
}

.pillar-image {
  position: relative;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.pillar-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.pillar-card:hover .pillar-photo {
  transform: scale(1.06);
}

.pillar-image::after {
  content: '';
  position: absolute;
  inset: 0;
}

.pillar-body {
  padding: 1.5rem;
}

.pillar-goal {
  margin: 0 0 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--primary-color);
}

.pillar-title {
  margin: 0 0 0.6rem;
  color: var(--primary-dark);
  transition: color 0.25s ease;
}

.pillar-card:hover .pillar-title {
  color: var(--primary-color);
}

.pillar-desc {
  margin: 0;
  color: var(--color-ink-soft);
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Quote */
.quote {
  max-width: 780px;
  margin: 0 auto;
  padding: 1rem 1.5rem 3rem;
  text-align: center;
}

.quote-text {
  margin: 0 0 1rem;
  font-style: italic;
  font-weight: 500;
  line-height: 1.4;
  color: var(--primary-dark);
}

.quote-attrib {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}

/* CTA */
.cta {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 5rem;
}

.cta-card {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: clamp(2rem, 4vw, 3rem);
  border-radius: 1.5rem;
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--primary-dark) 60%,
    var(--color-ink) 100%
  );
  box-shadow: 0 24px 48px rgba(15, 35, 26, 0.28);
}

.cta-title {
  margin: 0 0 0.75rem;
  color: #fdf8ef;
}

.cta-desc {
  margin: 0;
  color: rgba(253, 248, 239, 0.8);
  font-size: 1rem;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

@media (min-width: 820px) {
  .cta-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .cta-text {
    max-width: 560px;
  }
}
</style>
