<template>
  <div class="environment-page">
    <!-- Hero Section -->
    <section class="hero" style="position: relative; min-height: 70vh; overflow: hidden; display: flex; align-items: center;">
      <div style="position: absolute; inset: 0; z-index: 0;">
        <img src="/images/programs/environment.jpg" alt="Environment" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div class="hero-overlay" style="z-index: 1;"></div>
      <div class="hero-content" style="z-index: 2;">
        <span class="badge">Environment Program</span>
        <h1>Protecting the land that sustains villages.</h1>
        <p class="hero-subtitle">
          Community forestry, tree nurseries, WASH and climate adaptation help families care for the natural resources around them.
        </p>
      </div>
    </section>

    <!-- Program Overview Section -->
    <section class="section overview-section">
      <div class="container">
        <div class="section-header reveal-header">
          <span class="section-label">Our Approach</span>
          <h2>Environmental Stewardship in Action</h2>
          <p class="section-desc">
            Our environment program takes a holistic approach to conservation, combining immediate
            action with long-term community education and sustainable development.
          </p>
        </div>
        <div class="overview-grid">
          <div
            v-for="(card, i) in overviewCards"
            :key="card.title"
            class="overview-card"
            :class="{ 'card-visible': visibleCards.overview[i] }"
            :style="{ '--delay': `${i * 120}ms` }"
            :ref="el => setRef(el, 'overview', i)"
          >
            <div class="icon-wrapper">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                v-html="card.svgPaths"
              />
            </div>
            <h3>{{ card.title }}</h3>
            <p>{{ card.text }}</p>
            <span class="card-shine" />
          </div>
        </div>
      </div>
    </section>

    <!-- Key Initiatives Section -->
    <section class="section initiatives-section alt-bg">
      <div class="container">
        <div class="section-header reveal-header-delay">
          <span class="section-label">Key Initiatives</span>
          <h2>What We're Doing</h2>
        </div>
        <div class="initiatives-list">
          <div
            v-for="(item, i) in initiatives"
            :key="item.title"
            class="initiative-item"
            :class="{ 'initiative-visible': visibleCards.initiatives[i] }"
            :style="{ '--delay': `${i * 100}ms` }"
            :ref="el => setRef(el, 'initiatives', i)"
          >
            <div class="initiative-image">
              <img :src="item.img" :alt="item.title" loading="lazy" />
              <div class="initiative-overlay" />
            </div>
            <div class="initiative-content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Impact Stats Section -->
    <section class="section impact-section alt-bg" ref="impactSectionRef">
      <div class="container">
        <div class="section-header reveal-header-delay">
          <span class="section-label">Our Impact</span>
          <h2>Making a Difference</h2>
        </div>
        <div class="impact-grid">
          <div
            v-for="(stat, i) in impactStats"
            :key="stat.label"
            class="impact-card"
            :class="{ 'impact-visible': statsVisible }"
            :style="{ '--delay': `${i * 110}ms` }"
          >
            <span class="impact-number">{{ stat.displayed }}</span>
            <span class="impact-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="section process-section alt-bg">
      <div class="container">
        <div class="section-header reveal-header-delay">
          <span class="section-label">Our Process</span>
          <h2>How We Work</h2>
          <p class="section-desc">
            Our approach combines scientific expertise with community participation to create
            lasting environmental change.
          </p>
        </div>
        <div class="process-steps">
          <div
            v-for="(step, i) in processSteps"
            :key="step.number"
            class="process-step"
            :class="{ 'step-visible': visibleCards.process[i] }"
            :style="{ '--delay': `${i * 120}ms` }"
            :ref="el => setRef(el, 'process', i)"
          >
            <div class="step-number">{{ step.number }}</div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quote Section -->
    <section class="quote-section">
      <div class="container">
        <blockquote
          class="quote-animate"
          :class="{ visible: quoteVisible }"
          ref="quoteRef"
        >
          <svg
            class="quote-icon"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"
            />
            <path
              d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"
            />
          </svg>
          <p class="quote-text">
            "We do not inherit the earth from our ancestors; we borrow it from our children. Our
            environmental program is a pledge to protect that inheritance and ensure future
            generations inherit a planet that is healthy, vibrant, and full of possibility."
          </p>
          <cite>— SETE SENA Environmental Team</cite>
        </blockquote>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div
          class="cta-content cta-animate"
          :class="{ visible: ctaVisible }"
          ref="ctaRef"
        >
          <h2>Join the Environmental Movement</h2>
          <p>
            Whether you want to volunteer, partner with us, or support our conservation efforts,
            your contribution helps create a sustainable future for all.
          </p>
          <div class="cta-actions">
            <router-link to="/contact" class="btn btn-primary">Get Involved</router-link>
            <router-link to="/about" class="btn btn-outline">Learn More</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'

/* ─── Static data ──────────────────────────────── */
const overviewCards = [
  {
    title: 'Conservation',
    text: 'Protecting and restoring natural habitats, wildlife corridors, and biodiversity hotspots through community-led initiatives and scientific research.',
    svgPaths: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  },
  {
    title: 'Sustainability',
    text: 'Promoting renewable energy, sustainable agriculture, and circular economy practices that reduce environmental impact while supporting livelihoods.',
    svgPaths: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  },
  {
    title: 'Community Engagement',
    text: 'Empowering local communities with knowledge, resources, and tools to actively participate in environmental protection and climate action.',
    svgPaths: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  },
]

const initiatives = [
  {
    title: 'Reforestation Projects',
    text: 'Planting native tree species to restore degraded forests, combat desertification, and create carbon sinks. We\'ve planted over 500,000 trees across 12 communities.',
    img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
  },
  {
    title: 'Environmental Education',
    text: 'Developing curriculum and training programs for schools and community groups to build environmental literacy and promote sustainable practices from an early age.',
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
  },
  {
    title: 'Renewable Energy Access',
    text: 'Installing solar panels and clean energy solutions in rural communities, reducing dependence on fossil fuels and improving quality of life.',
    img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
  },
  {
    title: 'Water Conservation',
    text: 'Implementing rainwater harvesting, watershed management, and water purification systems to ensure clean water access and protect aquatic ecosystems.',
    img: 'https://images.unsplash.com/photo-1548685913-fe6678b0d5c9?w=800&q=80',
  },
  {
    title: 'Sustainable Agriculture',
    text: 'Training farmers in organic farming, crop rotation, and agroforestry techniques that increase yields while preserving soil health and biodiversity.',
    img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80',
  },
  {
    title: 'Climate Research & Advocacy',
    text: 'Conducting climate impact assessments and advocating for policy changes that protect vulnerable ecosystems and promote environmental justice.',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  },
]

const impactStatsRaw = [
  { label: 'Trees Planted', end: 500, suffix: 'K+' },
  { label: 'Communities Served', end: 12, suffix: '' },
  { label: 'Ecosystems Protected', end: 50, suffix: '+' },
  { label: 'People Trained', end: 10, suffix: 'K+' },
]

const impactStats = reactive(
  impactStatsRaw.map(s => ({ ...s, displayed: s.end + s.suffix }))
)

const processSteps = [
  { number: '01', title: 'Assessment', text: 'We conduct comprehensive environmental assessments to understand local ecosystems, identify challenges, and prioritize interventions.' },
  { number: '02', title: 'Planning', text: 'Working with community leaders and environmental experts, we develop tailored action plans that balance conservation with community needs.' },
  { number: '03', title: 'Implementation', text: 'We execute projects with active community participation, ensuring local ownership and building capacity for long-term sustainability.' },
  { number: '04', title: 'Monitoring & Learning', text: 'Continuous monitoring and evaluation help us measure impact, learn from experiences, and adapt our strategies for greater effectiveness.' },
]

/* ─── Visibility state ─────────────────────────── */
const visibleCards = reactive({
  overview: Array(overviewCards.length).fill(false),
  initiatives: Array(initiatives.length).fill(false),
  process: Array(processSteps.length).fill(false),
})
const statsVisible = ref(false)
const quoteVisible = ref(false)
const ctaVisible = ref(false)

/* ─── Template refs ────────────────────────────── */
const cardRefs = reactive({ overview: [], initiatives: [], process: [] })
const impactSectionRef = ref(null)
const quoteRef = ref(null)
const ctaRef = ref(null)

function setRef(el, group, idx) {
  if (el) cardRefs[group][idx] = el
}

/* ─── IntersectionObserver helper ──────────────── */
const observers = []

function observe(el, callback, options = {}) {
  if (!el) return
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          callback()
          io.disconnect()
        }
      })
    },
    { threshold: 0.15, ...options }
  )
  io.observe(el)
  observers.push(io)
}

/* ─── Counter animation ────────────────────────── */
function animateCounter(statObj) {
  const duration = 1400
  const start = 0
  const range = statObj.end - start
  const step = range / (duration / 16)
  let current = start
  const tick = () => {
    current = Math.min(current + step, statObj.end)
    statObj.displayed = Math.round(current) + statObj.suffix
    if (current < statObj.end) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/* ─── Mount ─────────────────────────────────────── */
onMounted(() => {
  // Overview cards
  cardRefs.overview.forEach((el, i) => {
    observe(el, () => setTimeout(() => { visibleCards.overview[i] = true }, i * 120))
  })

  // Initiative cards
  cardRefs.initiatives.forEach((el, i) => {
    observe(el, () => setTimeout(() => { visibleCards.initiatives[i] = true }, i * 100))
  })

  // Impact stats + counters
  observe(impactSectionRef.value, () => {
    statsVisible.value = true
    impactStatsRaw.forEach((_, i) => {
      setTimeout(() => animateCounter(impactStats[i]), i * 110)
    })
  })

  // Process steps
  cardRefs.process.forEach((el, i) => {
    observe(el, () => setTimeout(() => { visibleCards.process[i] = true }, i * 120))
  })

  // Quote
  observe(quoteRef.value, () => { quoteVisible.value = true })

  // CTA
  observe(ctaRef.value, () => { ctaVisible.value = true })
})

onBeforeUnmount(() => observers.forEach(io => io.disconnect()))
</script>

<style scoped>
/* =====================
   Layout Helpers
   ===================== */
.environment-page {
  min-height: 100vh;
  font-family: inherit;
  color: var(--color-ink);
  background: var(--color-cream);
  background-image: radial-gradient(ellipse at top center, rgba(27, 163, 79, 0.08) 0%, transparent 70%);
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.section {
  padding: 4rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

/* Section-header animations */
.reveal-header {
  opacity: 0;
  transform: translateY(-18px);
  animation: fadeInDown 0.65s ease forwards 0.05s;
}

.reveal-header-delay {
  opacity: 0;
  transform: translateY(-18px);
  animation: fadeInDown 0.65s ease forwards 0.15s;
}

@keyframes fadeInDown {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.overview-section,
.process-section {
  background: var(--color-cream-soft);
}

.section-label {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--primary-color);
  margin-bottom: 0.75rem;
  padding: 0.35rem 1rem;
  border: 1px solid rgba(27, 163, 79, 0.15);
  border-radius: 9999px;
  background: var(--primary-light);
}

.section-header h2 {
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.75rem;
}

.section-desc {
  color: var(--color-ink);
  max-width: 540px;
  margin: 0 auto;
}

.alt-bg {
  background: var(--color-cream-soft);
}

/* =====================
   Hero
   ===================== */
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
      90deg,
      rgba(6, 18, 13, 0.82) 0%,
      rgba(6, 18, 13, 0.5) 42%,
      rgba(6, 18, 13, 0.18) 72%,
      transparent 100%
    ),
    radial-gradient(circle at 75% 30%, rgba(27, 163, 79, 0.3) 0%, transparent 60%);
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

.badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ffffff;
  margin-bottom: 1.25rem;
  padding: 0.35rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: none;
}

.hero-content h1 {
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.25);
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.7;
  max-width: 600px;
  margin: 0;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.2);
}

/* =====================
   Overview Grid
   ===================== */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* — entry animation — */
.overview-card {
  background: linear-gradient(145deg, #ffffff 0%, var(--color-cream-soft) 100%);
  border: 1px solid rgba(27, 163, 79, 0.08);
  border-radius: 1rem;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  cursor: default;

  /* initial hidden state */
  opacity: 0;
  transform: translateY(36px) scale(0.97);
  transition:
    opacity 0.55s ease var(--delay, 0ms),
    transform 0.55s cubic-bezier(0.34, 1.36, 0.64, 1) var(--delay, 0ms),
    border-color 0.3s,
    box-shadow 0.35s;
}

.overview-card.card-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* — hover lift + glow — */
.overview-card:hover {
  border-color: rgba(27, 163, 79, 0.32);
  box-shadow:
    0 10px 36px rgba(27, 163, 79, 0.1),
    0 0 0 3px rgba(27, 163, 79, 0.06);
  transform: translateY(-6px) scale(1.015);
}

/* — shimmer shine — */
.card-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 40%,
    rgba(255, 255, 255, 0.55) 50%,
    transparent 60%
  );
  background-size: 200% 100%;
  background-position: 200% 0;
  transition: background-position 0.65s ease;
  pointer-events: none;
  border-radius: inherit;
}

.overview-card:hover .card-shine {
  background-position: -200% 0;
}

/* — icon bounce — */
.icon-wrapper {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: var(--color-cream-soft);
  color: var(--primary-color);
  margin-bottom: 1.25rem;
  transition: transform 0.35s cubic-bezier(0.34, 1.6, 0.64, 1), background 0.3s;
}

.overview-card:hover .icon-wrapper {
  transform: scale(1.18) rotate(-5deg);
  background: rgba(27, 163, 79, 0.12);
}

.overview-card h3 {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--primary-color);
  transition: color 0.25s;
}

.overview-card p {
  color: var(--color-ink);
  line-height: 1.65;
}

/* =====================
   Initiatives
   ===================== */
.initiatives-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* — entry animation — */
.initiative-item {
  position: relative;
  border-radius: 1.25rem;
  overflow: hidden;
  height: 400px;
  cursor: pointer;

  /* initial hidden state */
  opacity: 0;
  transform: translateY(32px) scale(0.96);
  transition:
    opacity 0.6s ease var(--delay, 0ms),
    transform 0.6s cubic-bezier(0.34, 1.3, 0.64, 1) var(--delay, 0ms),
    box-shadow 0.4s ease;

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.initiative-item.initiative-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* — hover lift — */
.initiative-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 50px rgba(27, 163, 79, 0.22);
}

.initiative-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.initiative-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.25, 1, 0.5, 1);
}

@media (hover: hover) {
  .initiative-item:hover .initiative-image img {
    transform: scale(1.06);
  }
}

.initiative-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(27, 163, 79, 0.05) 0%,
    rgba(27, 163, 79, 0.4) 45%,
    rgba(27, 163, 79, 0.95) 80%,
    var(--primary-dark) 100%
  );
  transition: background 0.4s ease;
}

@media (hover: hover) {
  .initiative-item:hover .initiative-overlay {
    background: linear-gradient(
      to bottom,
      rgba(27, 163, 79, 0.15) 0%,
      rgba(27, 163, 79, 0.5) 45%,
      rgba(27, 163, 79, 0.98) 80%,
      var(--primary-dark) 100%
    );
  }
}

.initiative-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  z-index: 2;
  color: #ffffff;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}

.initiative-item:hover .initiative-content {
  transform: translateY(-4px);
}

.initiative-content h3 {
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #ffffff;
  letter-spacing: -0.01em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.initiative-content p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* =====================
   Impact Stats
   ===================== */
.impact-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.impact-card {
  background: linear-gradient(145deg, #ffffff 0%, var(--color-cream-soft) 100%);
  border: 1px solid rgba(27, 163, 79, 0.08);
  border-radius: 1rem;
  padding: 2rem 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;

  /* entry */
  opacity: 0;
  transform: translateY(24px) scale(0.95);
  transition:
    opacity 0.5s ease var(--delay, 0ms),
    transform 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) var(--delay, 0ms),
    border-color 0.3s,
    box-shadow 0.3s;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.impact-card.impact-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* green top-bar slides in on hover */
.impact-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-dark));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.35s ease;
  border-radius: 0 0 2px 2px;
}

.impact-card:hover::before {
  transform: scaleX(1);
}

.impact-card:hover {
  border-color: rgba(27, 163, 79, 0.28);
  box-shadow: 0 8px 28px rgba(27, 163, 79, 0.1);
  transform: translateY(-5px) scale(1.02);
}

.impact-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  transition: transform 0.3s cubic-bezier(0.34, 1.5, 0.64, 1);
}

.impact-card:hover .impact-number {
  transform: scale(1.1);
}

.impact-label {
  color: var(--color-ink);
  font-weight: 500;
}

/* =====================
   Process Steps
   ===================== */
.process-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.process-step {
  text-align: center;
  padding: 2rem 1.5rem;
  background: linear-gradient(145deg, #ffffff 0%, var(--color-cream-soft) 100%);
  border: 1px solid rgba(27, 163, 79, 0.08);
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;

  /* entry */
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.5s ease var(--delay, 0ms),
    transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1) var(--delay, 0ms),
    border-color 0.3s,
    box-shadow 0.3s;
}

.process-step.step-visible {
  opacity: 1;
  transform: translateY(0);
}

/* accent left-bar on hover */
.process-step::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary-color);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.35s ease;
  border-radius: 0 2px 2px 0;
}

.process-step:hover::before {
  transform: scaleY(1);
}

.process-step:hover {
  transform: translateY(-5px);
  border-color: rgba(27, 163, 79, 0.25);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
}

.step-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--primary-color);
  opacity: 0.2;
  margin-bottom: 1rem;
  line-height: 1;
  transition: opacity 0.3s, transform 0.3s cubic-bezier(0.34, 1.5, 0.64, 1);
}

.process-step:hover .step-number {
  opacity: 0.35;
  transform: scale(1.08);
}

.process-step h3 {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--primary-color);
  transition: color 0.25s;
}

.process-step p {
  color: var(--color-ink);
  line-height: 1.65;
}

/* =====================
   Quote
   ===================== */
.quote-section {
  padding: 4rem 0;
  background: linear-gradient(180deg, var(--color-cream-soft) 0%, #f0e6d8 100%);
  border-top: 1px solid rgba(27, 163, 79, 0.08);
  border-bottom: 1px solid rgba(27, 163, 79, 0.08);
  position: relative;
  overflow: hidden;
}

.quote-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231BA34F' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
  pointer-events: none;
}

.quote-animate {
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.5rem;
  opacity: 0;
  transform: scale(0.96) translateY(20px);
  transition: opacity 0.65s ease, transform 0.65s cubic-bezier(0.25, 1, 0.5, 1);
}

.quote-animate.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.quote-icon {
  color: var(--primary-color);
  opacity: 0.12;
  margin-bottom: 1rem;
  animation: floatIcon 4s ease-in-out infinite;
}

@keyframes floatIcon {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}

.quote-text {
  font-style: italic;
  color: var(--color-ink);
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.quote-section cite {
  font-style: normal;
  color: var(--color-ink-soft);
}

/* =====================
   CTA
   ===================== */
.cta-section {
  padding: 4rem 0;
  background: linear-gradient(135deg, var(--color-cream-soft) 0%, #f0e6d8 100%);
  position: relative;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(27, 163, 79, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(20, 129, 62, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.cta-animate {
  text-align: center;
  max-width: 580px;
  margin: 0 auto;
  padding: 0 1.5rem;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.cta-animate.visible {
  opacity: 1;
  transform: translateY(0);
}

.cta-content h2 {
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.75rem;
}

.cta-content p {
  color: var(--color-ink);
  line-height: 1.7;
  margin-bottom: 2rem;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.75rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
  cursor: pointer;
  text-decoration: none;
}

.btn:hover {
  transform: translateY(-2px) scale(1.04);
}

.btn:active {
  transform: translateY(0) scale(0.98);
}

.btn-primary {
  background: #ffffff;
  color: var(--color-ink);
  border: 1px solid rgba(27, 163, 79, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.btn-primary:hover {
  background: var(--color-cream-soft);
  border-color: var(--primary-color);
  box-shadow: 0 6px 18px rgba(27, 163, 79, 0.14);
}

.btn-outline {
  background: var(--primary-color);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-outline:hover {
  border-color: #ffffff;
  background: var(--primary-dark);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.14);
}

/* =====================
   Responsive
   ===================== */
@media (max-width: 1024px) {
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .impact-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .process-steps {
    grid-template-columns: repeat(2, 1fr);
  }
  .initiatives-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .section {
    padding: 3rem 0;
  }
  .overview-grid {
    grid-template-columns: 1fr;
  }
  .impact-grid {
    grid-template-columns: 1fr 1fr;
  }
  .process-steps {
    grid-template-columns: 1fr;
  }

  .initiatives-list {
    grid-template-columns: 1fr;
  }

  .initiative-item {
    height: 350px;
  }

  .initiative-content {
    padding: 1.5rem;
  }

  .btn-outline {
    color: #334155;
    border: 1px solid #cbd5e1;
  }
  .btn-outline:hover {
    border-color: #94a3b8;
    background: rgba(0, 0, 0, 0.02);
  }
}

@media (max-width: 480px) {
  .hero {
    min-height: 55vh;
    padding: 3rem 1.25rem;
  }
  .impact-grid {
    gap: 0.75rem;
  }
  .impact-card {
    padding: 1.25rem 1rem;
  }
  .impact-number {
    font-size: 1.75rem;
  }
  .initiative-item {
    height: 300px;
  }
  .initiative-content {
    padding: 1.25rem;
  }
}
</style>
