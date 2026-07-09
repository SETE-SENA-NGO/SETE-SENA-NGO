<script setup lang="ts">
import { onMounted } from 'vue'
import heroImage from '@/assets/hero-impact.jpg'
import heroImpactForest from '@/assets/hero-impact-forest.jpg'
import heroImpactVillage from '@/assets/hero-impact-village.jpg'
import Slideshow from '@/components/shared/Slideshow.vue'

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

const sections = [
  {
    title: 'Environment',
    items: [
      { value: '570+', label: 'Hectares', desc: 'Community forest protected and restored.' },
      { value: '50k+', label: 'Saplings', desc: 'Grown yearly in village nurseries.' },
      { value: '300+', label: 'Biogas units', desc: 'Installed in rural kitchens.' },
    ],
  },
  {
    title: 'Education',
    items: [
      { value: '120+', label: 'Pre-school children', desc: 'Enrolled each year.' },
      { value: '8', label: 'Mobile libraries', desc: 'Reaching remote villages.' },
      { value: '60+', label: 'Annual scholarships', desc: 'For the poorest students.' },
    ],
  },
  {
    title: 'Livelihoods & Child Protection',
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
})
</script>

<template>
  <div class="numbers-page">
    <Slideshow :slides="slideItems">
      <div class="hero-overlay" />
      <div class="hero-content">
        <span class="eyebrow">Impact · By the Numbers</span>
        <h1>Thirty years, measured village by village.</h1>
        <p>
          Numbers do not tell the whole story, but they keep us honest. Every figure below is drawn from our annual
          monitoring and audited reports.
        </p>
      </div>
    </Slideshow>

    <section class="stats-section">
      <div class="page-shell">
        <div class="stats-grid overview-grid">
          <article v-for="item in overviewItems" :key="item.label" class="stat-card">
            <div class="stat-value">{{ item.value }}</div>
            <h2>{{ item.label }}</h2>
            <p>{{ item.desc }}</p>
          </article>
        </div>

        <div v-for="section in sections" :key="section.title" class="section-block">
          <h2 class="section-title">{{ section.title }}</h2>
          <div class="stats-grid">
            <article v-for="item in section.items" :key="`${section.title}-${item.label}`" class="stat-card">
              <div class="stat-value">{{ item.value }}</div>
              <h3>{{ item.label }}</h3>
              <p>{{ item.desc }}</p>
            </article>
          </div>
        </div>

        <div class="section-block">
          <h2 class="section-title">How we count</h2>
          <ul class="bullet-list">
            <li v-for="entry in countingMethods" :key="entry">{{ entry }}</li>
          </ul>
        </div>

        <div class="cta-content">
      <h3>Ready to take the next step?</h3>
      <RouterLink to="/impact/partners" class="hero-link primary">
        Meet our partners
        <span>→</span>
      </RouterLink>
    </div>
      </div>

    </section>
  </div>
</template>

<style scoped>
.numbers-page {
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
  padding: 3rem clamp(1.5rem, 5vw, 4rem);
  animation: fadeInUp 0.8s ease-out;
  color: #fffdf8;
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
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary-color);
}

h1,
h2,
h3 {
  margin: 0;
}

h1 {
  max-width: 720px;
  line-height: 1.1;
  color: #fffdf8;
}

.hero-content p {
  max-width: 640px;
  margin-top: 1rem;
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 253, 248, 0.88);
}

.hero-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.1rem;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hero-link:hover {
  transform: translateY(-1px);
}

.hero-link.primary {
  background: var(--primary-color);
  color: #fcfcfc;
  box-shadow: 0 10px 25px color-mix(in srgb, var(--primary-color) 25%, transparent);
}

.cta-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top:50px ;
}

.cta-content h3 {
  color: var(--primary-dark);
  font-weight: 500;
  line-height: 1.2;
}
.stats-section {
  padding: 3.5rem 1.25rem 4.5rem;
}

.page-shell {
  max-width: var(--container-max-width);
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.overview-grid {
  margin-bottom: 2.5rem;
}

.section-block {
  margin-top: 2.5rem;
}

.section-title {
  margin-bottom: 1rem;
  color: var(--primary-dark);
}

.stat-card {
  background: #fffdf8;
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 8px 24px rgba(47, 36, 29, 0.06);

}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-dark);
}

.stat-card h2,
.stat-card h3 {
  margin-top: 0.35rem;
  color: var(--color-ink);
}

.stat-card p {
  margin-top: 0.45rem;
  line-height: 1.6;
  color: var(--color-ink-soft);
}

.bullet-list {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.7rem;
  color: var(--color-ink-soft);
  line-height: 1.7;
}

@media (max-width: 860px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .hero-content {
    padding-top: 6rem;
    padding-bottom: 6rem;
  }
}
</style>
