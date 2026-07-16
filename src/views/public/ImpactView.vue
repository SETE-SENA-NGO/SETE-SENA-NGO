<script setup lang="ts">
import heroImage from '@/assets/hero-impact.jpg'
import heroForest from '@/assets/hero-impact-forest.jpg'
import heroVillage from '@/assets/hero-impact-village.jpg'
import Slideshow from '@/components/shared/Slideshow.vue'

const slideItems = [
  { image: heroImage, caption: '' },
  { image: heroForest, caption: '' },
  { image: heroVillage, caption: '' },
]

const stats = [
  {
    value: '293',
    label: 'Villages served',
    description: 'Across 43 communes in southeastern Cambodia.',
  },
  {
    value: '570+',
    label: 'Hectares of forest',
    description: 'Managed through community forestry and nurseries.',
  },
  {
    value: '120+',
    label: 'Full-time staff',
    description: 'Experts in management, agriculture and rural development.',
  },
  {
    value: '15+',
    label: 'International partners',
    description: 'Including UNDP, ADB and Oxfam.',
  },
  {
    value: '32',
    label: 'Years of service',
    description: 'Founded in 1994; still walking beside villages.',
  },
  {
    value: '4',
    label: 'Strategic pillars',
    description: 'Environment, education, livelihoods and child protection.',
  },
]

const timelineItems = [
  {
    year: '1994',
    title: 'Founding',
    description: 'Santi Sena is established to support rural communities with practical development programs.',
  },
  {
    year: '2002',
    title: 'First community forestry',
    description: 'The organisation expands its work around forest stewardship and local ownership.',
  },
  {
    year: '2008',
    title: 'Saving-for-Change',
    description: 'Household savings groups begin to strengthen financial resilience and local entrepreneurship.',
  },
  {
    year: '2014',
    title: '20-year horizon',
    description: 'Programs deepen across education, livelihoods and environmental protection.',
  },
  {
    year: '2024',
    title: 'Today',
    description: 'The organisation continues to support resilient, community-led change at scale.',
  },
]

const donors = ['UNDP', 'ADB', 'Oxfam', 'CIDA', 'World Vision', 'Save the Children', 'ActionAid', 'Care']
</script>

<template>
  <div class="impact-page">
    <Slideshow :slides="slideItems">
      <div class="hero-overlay" />
      <div class="hero-content">
        <span class="eyebrow">Our Impact</span>
        <h1>Three decades. One quiet revolution.</h1>
        <p>
          Every number below is a household with a safer roof, a child with a teacher, a forest still standing.
        </p>
      </div>
    </Slideshow>

    <section id="numbers" class="stats-section">
      <div class="stats-header">
        <span class="eyebrow">Impact by the Numbers</span>
        <h2>Thirty years of measurable change.</h2>
        <p>Every number represents a household strengthened, a forest protected, a life improved.</p>
      </div>
      <div class="stats-grid">
        <article v-for="stat in stats" :key="stat.label" class="stat-card">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <p class="stat-description">{{ stat.description }}</p>
        </article>
      </div>
    </section>

    <section id="timeline" class="timeline-section">
      <div class="timeline-shell">
        <span class="eyebrow">Timeline</span>
        <h2>A journey rooted in patience.</h2>
        <ol class="timeline-list">
          <li v-for="item in timelineItems" :key="item.year" class="timeline-item">
            <span class="timeline-dot" />
            <div class="timeline-content">
              <div class="timeline-year">{{ item.year }}</div>
              <div class="timeline-title">{{ item.title }}</div>
              <p class="timeline-description">{{ item.description }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section id="partners" class="partners-section">
      <div class="partners-heading">
        <span class="eyebrow">Financial stewardship</span>
        <h2>Trusted by partners across the world.</h2>
        <p>
          Santi Sena has successfully managed grants from more than ten international institutions,
          with transparent reporting and audited accounts every year.
        </p>
      </div>

      <div class="marquee-mask">
        <div class="marquee-track">
          <span
            v-for="(partner, index) in [...donors, ...donors, ...donors]"
            :key="`${partner}-${index}`"
            class="partner-name"
          >
            {{ partner }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.impact-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-cream);
  color: var(--color-ink);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(6, 18, 13, 0.85) 0%,
    rgba(6, 18, 13, 0.55) 40%,
    rgba(6, 18, 13, 0.22) 68%,
    transparent 100%
  );
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
  color: #fffdf8;
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
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.8rem;
  color: var(--primary-color);
  font-weight: 700;
}

h1,
h2 {
  margin: 0;
}

h1 {
  margin-top: 1rem;
  max-width: 720px;
  color: #fffdf8;
}

.hero-content p {
  margin-top: 1rem;
  max-width: 640px;
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 253, 248, 0.85);
}

.stats-section,
.timeline-section,
.partners-section {
  padding: 4rem 1.5rem;
}

.stats-header {
  max-width: var(--container-max-width);
  margin: 0 auto 2rem;
  text-align: center;
}

.stats-header h2 {
  margin: 0.75rem 0 0.5rem;
  color: var(--color-ink);
}

.stats-header p {
  max-width: 560px;
  margin: 0 auto;
  color: var(--color-ink-soft);
  line-height: 1.7;
  font-size: 0.95rem;
}

.stats-grid {
  max-width: var(--container-max-width);
  margin: 0 auto;
  display: grid;
  gap: 1px;
  background: rgba(78, 48, 15, 0.25);
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-radius: 1.5rem;
  overflow: hidden;
}

.stat-card {
  background: #fffdfa;
  padding: 1.75rem;
}

.stat-value {
  font-size: 2rem;
  color: var(--primary-dark);
}

.stat-label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}

.stat-description {
  margin-top: 0.6rem;
  line-height: 1.6;
  font-size: 0.9rem;
  color: rgba(31, 41, 55, 0.72);
}

.timeline-shell {
  max-width: 860px;
  margin: 0 auto;
}

.timeline-shell h2 {
  margin-top: 1rem;
  color: var(--color-ink);
}

.timeline-list {
  margin: 2.2rem 0 0;
  padding: 0 0 0 1.5rem;
  list-style: none;
  border-left: 2px solid color-mix(in srgb, var(--primary-color) 45%, transparent);
}

.timeline-item {
  position: relative;
  padding-left: 1.2rem;
  margin-bottom: 1.8rem;
}

.timeline-dot {
  position: absolute;
  left: -1.45rem;
  top: 0.3rem;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 50%;
  background: var(--primary-color);
}

.timeline-year {
  font-size: 1.7rem;
  color: var(--primary-dark);
}

.timeline-title {
  margin-top: 0.15rem;
  font-weight: 700;
  color: var(--color-ink);
}

.timeline-description {
  margin-top: 0.5rem;
  line-height: 1.7;
  color: rgba(31, 41, 55, 0.74);
}

.partners-heading {
  max-width: 840px;
  margin: 0 auto;
  text-align: center;
}

.partners-heading h2 {
  margin-top: 1rem;
  color: var(--color-ink);
}

.partners-heading p {
  margin: 1rem auto 0;
  max-width: 640px;
  line-height: 1.75;
  color: rgba(31, 41, 55, 0.72);
}

.marquee-mask {
  margin-top: 2.2rem;
  overflow: hidden;
}

.marquee-track {
  display: flex;
  width: max-content;
  gap: 4rem;
  padding-right: 4rem;
  animation: marquee 18s linear infinite;
}

.partner-name {
  white-space: nowrap;
  font-size: 1.6rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--color-ink) 60%, transparent);
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-33.333%);
  }
}

@media (max-width: 800px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .marquee-track {
    gap: 2rem;
  }
}
</style>
