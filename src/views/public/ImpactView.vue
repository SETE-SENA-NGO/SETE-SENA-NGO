<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import heroImage from '@/assets/hero-impact.jpg'
import heroForest from '@/assets/hero-impact-forest.jpg'
import heroVillage from '@/assets/hero-impact-village.jpg'

const heroPhotos = [
  { src: heroImage, alt: 'Community gathering', label: 'Community impact' },
  { src: heroForest, alt: 'Forest restoration', label: 'Forest restoration' },
  { src: heroVillage, alt: 'Village life', label: 'Village life' },
]

const currentHeroIndex = ref(0)
let heroInterval: number | undefined
const currentHero = computed(() => heroPhotos[currentHeroIndex.value])

onMounted(() => {
  heroInterval = window.setInterval(() => {
    currentHeroIndex.value = (currentHeroIndex.value + 1) % heroPhotos.length
  }, 5000)
})

onUnmounted(() => {
  if (heroInterval) {
    window.clearInterval(heroInterval)
  }
})

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
    <section class="hero-section">
      <div class="hero-images">
        <div
          v-for="(photo, index) in heroPhotos"
          :key="photo.alt"
          class="hero-background"
          :class="{ active: index === currentHeroIndex }"
          :style="{ backgroundImage: `url(${photo.src})` }"
          aria-hidden="true"
        />
      </div>
      <div class="hero-overlay" />
      <div class="hero-content">
        <span class="eyebrow">Our Impact</span>
        <h1>Three decades. One quiet revolution.</h1>
        <p>
          Every number below is a household with a safer roof, a child with a teacher, a forest still standing.
        </p>
      </div>
    </section>

    <section id="numbers" class="stats-section">
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
  background: #fdf8ee;
  color: #1f2937;
}

.hero-section {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(78, 48, 15, 0.25);
  min-height: 320px;
  display: flex;
  align-items: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(122, 201, 165, 0.92), rgba(87, 100, 99, 0.72), rgba(39, 143, 107, 0.72));
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1120px;
  margin: 0 auto;
  padding: 5rem 1.5rem;
  color: #fffdf8;
}

.eyebrow {
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.8rem;
  color: #f2c46d;
  font-weight: 700;
}

h1,
h2 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
}

h1 {
  margin-top: 1rem;
  margin-right: 400px;
  max-width: 720px;
  font-size: clamp(2.2rem, 4.5vw, 3.6rem);
}

.hero-content p {
  margin-top: 1rem;
  max-width: 640px;
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 253, 248, 0.85);
}

.hero-images {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-background {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.hero-background.active {
  opacity: 1;
}

.stats-section,
.timeline-section,
.partners-section {
  padding: 4.5rem 1.5rem;
}

.stats-grid {
  max-width: 1120px;
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
  padding: 2rem;
}

.stat-value {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2.4rem;
  color: #a6541a;
}

.stat-label {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #5e3818;
}

.stat-description {
  margin-top: 0.8rem;
  line-height: 1.6;
  color: rgba(31, 41, 55, 0.72);
}

.timeline-shell {
  max-width: 860px;
  margin: 0 auto;
}

.timeline-shell h2 {
  margin-top: 1rem;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  color: #5e3818;
}

.timeline-list {
  margin: 2.2rem 0 0;
  padding: 0 0 0 1.5rem;
  list-style: none;
  border-left: 2px solid rgba(242, 196, 109, 0.45);
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
  background: #f2c46d;
}

.timeline-year {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.7rem;
  color: #a6541a;
}

.timeline-title {
  margin-top: 0.15rem;
  font-weight: 700;
  color: #5e3818;
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
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  color: #5e3818;
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
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.6rem;
  font-weight: 600;
  color: rgba(94, 56, 24, 0.6);
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
